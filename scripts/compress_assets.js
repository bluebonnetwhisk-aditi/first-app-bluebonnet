import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const directoriesToScan = [
  path.join(rootDir, 'src', 'assets', 'images'),
  path.join(rootDir, 'public', 'src', 'assets', 'images'),
  path.join(rootDir, 'public', 'gallery')
];

let totalOriginalSize = 0;
let totalCompressedSize = 0;
let fileCount = 0;

async function processDirectory(dirPath) {
  if (!fs.existsSync(dirPath)) return;
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      await processDirectory(fullPath);
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name).toLowerCase();
      if (['.png', '.jpg', '.jpeg'].includes(ext)) {
        await compressImage(fullPath, ext);
      }
    }
  }
}

async function compressImage(filePath, ext) {
  const stat = fs.statSync(filePath);
  const origSize = stat.size;
  totalOriginalSize += origSize;
  fileCount++;

  // Skip files already smaller than 100KB unless they are huge PNGs
  if (origSize < 100 * 1024 && ext !== '.png') {
    totalCompressedSize += origSize;
    return;
  }

  const tempPath = filePath + '.tmp';

  try {
    const image = sharp(filePath);
    const metadata = await image.metadata();

    let pipeline = image;
    const MAX_DIM = 1600;

    if (metadata.width > MAX_DIM || metadata.height > MAX_DIM) {
      pipeline = pipeline.resize({
        width: metadata.width > metadata.height ? MAX_DIM : undefined,
        height: metadata.height >= metadata.width ? MAX_DIM : undefined,
        fit: 'inside',
        withoutEnlargement: true
      });
    }

    if (ext === '.png') {
      // High compression PNG with palette reduction for sharp text/logo or photo PNGs
      pipeline = pipeline.png({ quality: 80, compressionLevel: 9, palette: true });
    } else {
      pipeline = pipeline.jpeg({ quality: 82, mozjpeg: true });
    }

    await pipeline.toFile(tempPath);
    const newStat = fs.statSync(tempPath);

    if (newStat.size < origSize) {
      fs.unlinkSync(filePath);
      fs.renameSync(tempPath, filePath);
      totalCompressedSize += newStat.size;
      const reduction = Math.round((1 - newStat.size / origSize) * 100);
      console.log(`✓ Compressed: ${path.relative(rootDir, filePath)} (${(origSize / 1024 / 1024).toFixed(2)} MB -> ${(newStat.size / 1024).toFixed(0)} KB) [-${reduction}%]`);
    } else {
      fs.unlinkSync(tempPath);
      totalCompressedSize += origSize;
    }
  } catch (err) {
    if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
    totalCompressedSize += origSize;
    console.warn(`Warning compressing ${path.relative(rootDir, filePath)}:`, err.message);
  }
}

async function run() {
  console.log('=== Bluebonnet & Whisk: High-Speed Image Optimization ===\n');
  for (const dir of directoriesToScan) {
    await processDirectory(dir);
  }

  const origMB = (totalOriginalSize / 1024 / 1024).toFixed(2);
  const compMB = (totalCompressedSize / 1024 / 1024).toFixed(2);
  const totalSaved = (totalOriginalSize - totalCompressedSize) / 1024 / 1024;
  const overallPercent = totalOriginalSize > 0 ? Math.round((totalSaved / (totalOriginalSize / 1024 / 1024)) * 100) : 0;

  console.log('\n======================================================');
  console.log(`✓ OPTIMIZATION COMPLETED across ${fileCount} images!`);
  console.log(`Original Total Size:   ${origMB} MB`);
  console.log(`Compressed Total Size: ${compMB} MB`);
  console.log(`Total Storage Saved:   ${totalSaved.toFixed(2)} MB (-${overallPercent}%)`);
  console.log('======================================================\n');
}

run();
