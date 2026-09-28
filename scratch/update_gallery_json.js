import fs from 'fs';

const path = 'src/data/galleryData.json';
const raw = fs.readFileSync(path, 'utf8');
const data = JSON.parse(raw);

const updated = data.map((item) => {
  const fileName = item.imagePath.replace('/gallery/', '');
  return {
    ...item,
    originalImagePath: `/gallery/orig/${fileName}`
  };
});

fs.writeFileSync(path, JSON.stringify(updated, null, 2), 'utf8');
console.log('Successfully added originalImagePath to galleryData.json!');
