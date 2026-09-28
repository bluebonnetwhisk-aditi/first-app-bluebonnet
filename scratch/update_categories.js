import fs from 'fs';

const path = 'src/data/galleryData.json';
const raw = fs.readFileSync(path, 'utf8');
const data = JSON.parse(raw);

const categoryMap = {
  "Artisanal Bakery & Cakes": "Artisanal Cakes & Bakes",
  "Savory Specialties": "Specialty Culinary Fare",
  "Breads & Starters": "Specialty Culinary Fare",
  "Traditional Sweets": "Heritage Sweets & Confectionery"
};

const updated = data.map((item) => {
  let newCat = categoryMap[item.category] || "Specialty Culinary Fare";

  const title = item.title.toLowerCase();
  if (title.includes("cake") || title.includes("bake") || title.includes("cupcake") || title.includes("loaf") || title.includes("pastry") || title.includes("jar") || title.includes("tres leches") || title.includes("cheesecake") || title.includes("mousse")) {
    newCat = "Artisanal Cakes & Bakes";
  } else if (title.includes("sweet") || title.includes("mithai") || title.includes("modak") || title.includes("halwa") || title.includes("ladoo") || title.includes("barfi") || title.includes("peda") || title.includes("kheer")) {
    newCat = "Heritage Sweets & Confectionery";
  } else if (title.includes("dal") || title.includes("paneer") || title.includes("kulcha") || title.includes("naan") || title.includes("biryani") || title.includes("cutlet") || title.includes("chole") || title.includes("gravy") || title.includes("poori") || title.includes("thali") || title.includes("bread") || title.includes("starter") || title.includes("subzi")) {
    newCat = "Specialty Culinary Fare";
  }

  return {
    ...item,
    category: newCat
  };
});

fs.writeFileSync(path, JSON.stringify(updated, null, 2), 'utf8');
console.log('Successfully remapped all items into 3 niche upmarket categories!');
