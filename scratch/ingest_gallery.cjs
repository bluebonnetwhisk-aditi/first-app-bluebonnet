const fs = require('fs');
const path = require('path');

const srcDir = `C:\\Users\\aditi\\Desktop\\Pictures for Website`;
const destDir = path.join(__dirname, '..', 'public', 'gallery');
const jsonDestPath = path.join(__dirname, '..', 'src', 'data', 'galleryData.json');
const publicJsonPath = path.join(__dirname, '..', 'public', 'galleryData.json');

// Ensure destination directories exist
if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}
const dataDir = path.dirname(jsonDestPath);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Sample metadata catalog mapping for North Indian & Bakery dishes
const DISH_PRESETS = [
  {
    title: "Rasmalai Tres Leches Cake",
    category: "Artisanal Bakery & Cakes",
    autoDescription: "Infused with saffron-cardamom milk, layered with soft rabri cream, pistachios, and delicate rose petals over a light sponge."
  },
  {
    id_suffix: "cheesecake",
    title: "Gulab Jamun Fusion Cheesecake",
    category: "Artisanal Bakery & Cakes",
    autoDescription: "Decadent cream cheese filling baked over a cardamom cookie crust, crowned with mini gulab jamuns and edible gold vark."
  },
  {
    title: "Slow-Cooked Royal Dal Makhani",
    category: "Savory Specialties",
    autoDescription: "Black lentils simmered overnight for 16 hours over charcoal, finished with churned butter, fresh cream, and aromatic garam masala."
  },
  {
    title: "Paneer Lababdar & Makhani Gravy",
    category: "Savory Specialties",
    autoDescription: "Cottage cheese cubes tossed in a velvety tomato-cashew reduction, spiced with roasted Kasuri methi and green cardamom."
  },
  {
    title: "Crispy Amritsari Kulcha & Chole",
    category: "Breads & Starters",
    autoDescription: "Flaky, tandoor-baked spiced potato kulcha served with tangy Pindi chole, pickled onions, and fresh mint chutney."
  },
  {
    title: "Tandoori Garlic Naan & Kulcha Basket",
    category: "Breads & Starters",
    autoDescription: "Freshly slapped flatbreads baked in clay tandoor, brushed with garlic butter, cilantro, and toasted nigella seeds."
  },
  {
    title: "Bedmi Poori & Halwai Waale Aalu",
    category: "Breads & Starters",
    autoDescription: "Crispy urad dal-stuffed puri paired with tangy, slow-simmered street-style potato curry spiced with hing and amchur."
  },
  {
    title: "Vintage Railway Potato Cutlets",
    category: "Breads & Starters",
    autoDescription: "Gold-crusted potato and green pea croquettes infused with roasted cumin, ginger, and served with coriander chutney."
  },
  {
    title: "Authentic Ukadiche Modak",
    category: "Traditional Sweets",
    autoDescription: "Steamed rice flour dumplings filled with freshly grated coconut, jaggery, and fragrant nutmeg cardamom paste."
  },
  {
    title: "Pistachio Cardamom Mousse Cake",
    category: "Artisanal Bakery & Cakes",
    autoDescription: "Silky pistachio bavarian cream paired with cardamom chiffon layers, crowned with crushed Iranian pistachios."
  },
  {
    title: "Indo-Chinese Manchurian & Noodle Station",
    category: "Savory Specialties",
    autoDescription: "Wok-tossed vegetable balls in garlic-soy glaze served alongside Hakka noodles with charred scallions."
  },
  {
    title: "Live Street Chaat & Pani Puri Bar",
    category: "Savory Specialties",
    autoDescription: "Crispy semolina puris filled with spiced potato chickpeas, chilled mint-coriander water, and date tamarind chutney."
  },
  {
    title: "Lotus Biscoff Stuffed Gourmet Cookie",
    category: "Artisanal Bakery & Cakes",
    autoDescription: "Giant thick-style cookie rolled with organic European butter, bursting with molten Biscoff cookie butter center."
  },
  {
    title: "Stuffed Sattu & Paneer Paratha Platter",
    category: "Breads & Starters",
    autoDescription: "Hand-rolled whole wheat parathas stuffed with spiced roasted gram flour (sattu) and fresh paneer, served with white butter."
  },
  {
    title: "Tangy Punjabi Kadhi Pakora",
    category: "Savory Specialties",
    autoDescription: "Crispy onion fritters simmered in a creamy sour yogurt and besan gravy, tempered with dried red chillies and curry leaves."
  },
  {
    title: "Homestyle Bhindi Masala & Bharwa Baigan",
    category: "Savory Specialties",
    autoDescription: "Pan-roasted okra and stuffed baby eggplants tossed in roasted coriander, fennel, and dry mango powder."
  },
  {
    title: "Kesar Pista Chawal Kheer",
    category: "Traditional Sweets",
    autoDescription: "Traditional rice pudding slow-cooked in full-cream milk, infused with Kashmiri saffron strands, green cardamom, and almonds."
  }
];

const files = fs.readdirSync(srcDir);
const galleryItems = [];

let counter = 1;
files.forEach((file) => {
  const ext = path.extname(file).toLowerCase();
  if (['.jpg', '.jpeg', '.png', '.webp'].includes(ext)) {
    const srcFilePath = path.join(srcDir, file);
    const cleanFileName = `gallery_${String(counter).padStart(2, '0')}${ext}`;
    const destFilePath = path.join(destDir, cleanFileName);

    // Copy file to public/gallery/
    fs.copyFileSync(srcFilePath, destFilePath);

    // Pick preset metadata deterministically based on index
    const preset = DISH_PRESETS[(counter - 1) % DISH_PRESETS.length];

    const item = {
      id: `item-${counter}`,
      title: `${preset.title} #${counter}`,
      category: preset.category,
      autoDescription: preset.autoDescription,
      imagePath: `/gallery/${cleanFileName}`,
      visible: true,
      createdAt: new Date(Date.now() - (counter * 86400000)).toISOString()
    };

    galleryItems.push(item);
    counter++;
  }
});

fs.writeFileSync(jsonDestPath, JSON.stringify(galleryItems, null, 2));
fs.writeFileSync(publicJsonPath, JSON.stringify(galleryItems, null, 2));

console.log(`Successfully ingested ${galleryItems.length} photos to public/gallery/ and generated galleryData.json`);
