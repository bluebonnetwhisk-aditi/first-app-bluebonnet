import fs from 'fs';
import path from 'path';

const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Gallery Orientation Checker</title>
  <style>
    body { font-family: sans-serif; background: #1a1614; color: #fff; padding: 20px; }
    .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px; }
    .card { background: #241e1b; border: 1px solid #382f2a; border-radius: 12px; padding: 12px; text-align: center; }
    img { width: 100%; height: 220px; object-fit: contain; background: #000; border-radius: 8px; }
    .title { font-size: 13px; font-weight: bold; margin: 8px 0 4px; color: #d4af37; }
    .filename { font-size: 11px; color: #aaa; margin-bottom: 8px; }
  </style>
</head>
<body>
  <h1>Gallery Photo Orientation Audit</h1>
  <div class="grid">
    ${Array.from({length: 57}, (_, i) => {
      const idx = String(i + 1).padStart(2, '0');
      const ext = (i+1 === 1 || i+1 === 2 || i+1 === 3 || i+1 === 4 || i+1 === 5) ? 'png' : 'jpg';
      const file = `gallery_${idx}.${ext}`;
      return `
        <div class="card">
          <img src="../public/gallery/${file}" alt="${file}">
          <div class="title">#${i+1}: ${file}</div>
        </div>
      `;
    }).join('')}
  </div>
</body>
</html>`;

fs.writeFileSync('scratch/preview_orientations.html', html);
console.log('Generated scratch/preview_orientations.html');
