const fs = require('fs');
const zlib = require('zlib');

function processPNG(inputPath, outputPath, cropOverride) {
  const buf = fs.readFileSync(inputPath);
  const width = buf.readUInt32BE(16);
  const height = buf.readUInt32BE(20);
  const bitDepth = buf[24];
  const colorType = buf[25];

  // Find IDAT chunks
  let pos = 8;
  const idatChunks = [];
  while (pos < buf.length) {
    const len = buf.readUInt32BE(pos);
    const type = buf.toString('ascii', pos + 4, pos + 8);
    if (type === 'IDAT') {
      idatChunks.push(buf.slice(pos + 8, pos + 8 + len));
    }
    pos += 12 + len;
  }

  const compressed = Buffer.concat(idatChunks);
  const decompressed = zlib.inflateSync(compressed);

  const bytesPerPixel = colorType === 6 ? 4 : (colorType === 2 ? 3 : 4);
  const stride = 1 + width * bytesPerPixel;

  // Unfilter pixels
  const rawPixels = Buffer.alloc(width * height * 4); // RGBA

  let prevLine = new Uint8Array(width * bytesPerPixel);
  for (let y = 0; y < height; y++) {
    const lineStart = y * stride;
    const filterType = decompressed[lineStart];
    const currentLine = new Uint8Array(width * bytesPerPixel);

    for (let i = 0; i < width * bytesPerPixel; i++) {
      const rawByte = decompressed[lineStart + 1 + i];
      let val = rawByte;
      const bpp = bytesPerPixel;
      const left = i >= bpp ? currentLine[i - bpp] : 0;
      const up = prevLine[i];
      const upperLeft = i >= bpp ? prevLine[i - bpp] : 0;

      if (filterType === 1) val = (rawByte + left) & 0xff;
      else if (filterType === 2) val = (rawByte + up) & 0xff;
      else if (filterType === 3) val = (rawByte + Math.floor((left + up) / 2)) & 0xff;
      else if (filterType === 4) {
        const p = left + up - upperLeft;
        const pa = Math.abs(p - left);
        const pb = Math.abs(p - up);
        const pc = Math.abs(p - upperLeft);
        let pr = upperLeft;
        if (pa <= pb && pa <= pc) pr = left;
        else if (pb <= pc) pr = up;
        val = (rawByte + pr) & 0xff;
      }
      currentLine[i] = val;
    }
    prevLine = currentLine;

    // Convert to RGBA
    for (let x = 0; x < width; x++) {
      const outIdx = (y * width + x) * 4;
      const r = currentLine[x * bytesPerPixel];
      const g = currentLine[x * bytesPerPixel + 1];
      const b = currentLine[x * bytesPerPixel + 2];
      const a = bytesPerPixel === 4 ? currentLine[x * bytesPerPixel + 3] : 255;
      rawPixels[outIdx] = r;
      rawPixels[outIdx + 1] = g;
      rawPixels[outIdx + 2] = b;
      
      // Make near-white background transparent
      if (r > 240 && g > 240 && b > 240) {
        rawPixels[outIdx + 3] = 0;
      } else {
        rawPixels[outIdx + 3] = a;
      }
    }
  }

  let minX, minY, maxX, maxY;
  if (cropOverride) {
    minX = cropOverride.minX;
    minY = cropOverride.minY;
    maxX = cropOverride.maxX;
    maxY = cropOverride.maxY;
  } else {
    minX = width; minY = height; maxX = 0; maxY = 0;
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * 4;
        if (rawPixels[idx + 3] > 10) {
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
      }
    }
  }

  const cropW = maxX - minX + 1;
  const cropH = maxY - minY + 1;
  console.log(`Cropped Bounding Box: [${minX}, ${minY}, ${maxX}, ${maxY}], Size: ${cropW}x${cropH}`);

  // Create new uncompressed scanlines with filter type 0 (None)
  const newScanlines = Buffer.alloc(cropH * (1 + cropW * 4));
  for (let y = 0; y < cropH; y++) {
    const srcY = minY + y;
    const lineOffset = y * (1 + cropW * 4);
    newScanlines[lineOffset] = 0; // Filter None
    for (let x = 0; x < cropW; x++) {
      const srcX = minX + x;
      const srcIdx = (srcY * width + srcX) * 4;
      const dstIdx = lineOffset + 1 + x * 4;
      newScanlines[dstIdx] = rawPixels[srcIdx];
      newScanlines[dstIdx + 1] = rawPixels[srcIdx + 1];
      newScanlines[dstIdx + 2] = rawPixels[srcIdx + 2];
      newScanlines[dstIdx + 3] = rawPixels[srcIdx + 3];
    }
  }

  const deflated = zlib.deflateSync(newScanlines);

  function makeChunk(type, data) {
    const lenBuf = Buffer.alloc(4);
    lenBuf.writeUInt32BE(data.length, 0);
    const typeBuf = Buffer.from(type, 'ascii');
    const crcBuf = Buffer.alloc(4);
    const crc = crc32(Buffer.concat([typeBuf, data]));
    crcBuf.writeUInt32BE(crc, 0);
    return Buffer.concat([lenBuf, typeBuf, data, crcBuf]);
  }

  const crcTable = [];
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      if (c & 1) c = 0xedb88320 ^ (c >>> 1);
      else c = c >>> 1;
    }
    crcTable[n] = c;
  }

  function crc32(buf) {
    let crc = 0xffffffff;
    for (let i = 0; i < buf.length; i++) {
      crc = crcTable[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
    }
    return (crc ^ 0xffffffff) >>> 0;
  }

  const headerData = Buffer.alloc(13);
  headerData.writeUInt32BE(cropW, 0);
  headerData.writeUInt32BE(cropH, 4);
  headerData[8] = 8;
  headerData[9] = 6;
  headerData[10] = 0;
  headerData[11] = 0;
  headerData[12] = 0;

  const pngHeader = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdrChunk = makeChunk('IHDR', headerData);
  const idatChunk = makeChunk('IDAT', deflated);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  const outBuf = Buffer.concat([pngHeader, ihdrChunk, idatChunk, iendChunk]);
  fs.writeFileSync(outputPath, outBuf);
  console.log(`Successfully written to ${outputPath} (${cropW}x${cropH})`);
}

// Crop tightly around the main BLUEBONNET WHISK text & whisk element
processPNG('src/assets/images/brand_logo.png', 'src/assets/images/brand_logo_transparent.png', {
  minX: 195,
  minY: 82,
  maxX: 780,
  maxY: 360
});
processPNG('src/assets/images/brand_logo.png', 'public/brand_logo_transparent.png', {
  minX: 195,
  minY: 82,
  maxX: 780,
  maxY: 360
});
