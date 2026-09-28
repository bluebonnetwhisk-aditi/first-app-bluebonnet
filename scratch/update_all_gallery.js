import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://njpufcpzpcjgfsllaedo.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5qcHVmY3B6cGNqZ2ZzbGxhZWRvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAzNjU5MTgsImV4cCI6MjEwNTk0MTkxOH0.dzGN0MmyLxvUHAKkPl2m1lmhh9DX8v81qcFkxdtPEVY';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const CAT1 = "Artisanal Cakes & Bakes";
const CAT2 = "Specialty Culinary Fare";
const CAT3 = "Heritage Sweets & Confectionery";

// List of all 57 items in exact left-to-right order
const rawUserItems = [
  {
    title: "Halwai-Style Aalu & Fluffy Puris",
    category: [CAT2],
    desc: "Authentic Halwai-style spiced potato curry slow-cooked with hing and amchur, served with piping hot, golden fluffy puris."
  },
  {
    title: "Slow-Cooked Royal Dal Makhani",
    category: [CAT2],
    desc: "Whole black lentils simmered overnight for 16 hours over low heat, finished with fresh butter, organic cream, and aromatic spices."
  },
  {
    title: "Indo-Chinese & Punjabi Feast Platter",
    category: [CAT2, CAT3],
    desc: "A lavish celebratory spread featuring wok-tossed Veg Manchurian, Hakka Noodles, fragrant Basmati rice, tangy Punjabi Kadhi Pakora, and golden Boondi Laddus."
  },
  {
    title: "Grand Fusion Party Catering Buffet",
    category: [CAT2, CAT3],
    desc: "Curated party buffet combining wok-fired Veg Manchurian and Hakka Noodles with homestyle Punjabi Kadhi Pakora, steamed Basmati rice, and handcrafted Boondi Laddus."
  },
  {
    title: "Crispy Onion Pakoras & Dual Chutney Dip",
    category: [CAT2],
    desc: "Golden, thinly-sliced onion fritters fried to crisp perfection, served alongside zesty mint-coriander and sweet date-tamarind chutney."
  },
  {
    title: "Artisanal Mango Mousse Cake Cups",
    category: [CAT1],
    desc: "Luscious Alphonso mango pulp layered with delicate vanilla chiffon sponge, fresh whipped cream, and mango reduction served in individual dessert cups."
  },
  {
    title: "Tandoori Paneer & Fresh Fruit Tikka",
    category: [CAT2],
    desc: "Charcoal-grilled cottage cheese cubes, bell peppers, and spiced tropical fruits marinated in hung curd, mustard oil, and kashmiri chili."
  },
  {
    title: "Traditional North Indian Thali Spread",
    category: [CAT2],
    desc: "Homestyle North Indian feast combining fluffy puris, velvet Dal Makhani, slow-simmered Punjabi Rajma, and steamed Basmati rice."
  },
  {
    title: "Delhi-Style Chole Bhature",
    category: [CAT2],
    desc: "Piping hot, pillowy bhatures served with rich, dark Pindi chole simmered in tea-leaves and whole spices, accompanied by pickled onions."
  },
  {
    title: "Royal Delhi Dahi Bhalla Chaat",
    category: [CAT2],
    desc: "Soft lentil dumplings soaked in chilled sweetened yogurt, drizzled with roasted cumin, kashmiri red chili, mint chutney, and date-tamarind glaze."
  },
  {
    title: "Chilled Street-Style Dahi Bhalla Platter",
    category: [CAT2],
    desc: "Melt-in-mouth urad dal bhallas topped with thick sweetened yogurt, piquant green chutney, and tangy tamarind drizzle."
  },
  {
    title: "Gulab Jamun Fusion Celebration Cake",
    category: [CAT1, CAT3],
    desc: "Cardamom sponge infused with saffron syrup, layered with Rabri mousse, and crowned with soft, warm mini Gulab Jamuns."
  },
  {
    title: "Vintage Railway Spiced Vegetable Cutlets",
    category: [CAT2],
    desc: "Classic Indian railway-style potato and beetroot croquettes coated in crispy breadcrumbs, served with spicy mint chutney."
  },
  {
    title: "Theme-Designed Rasmalai Celebration Cake",
    category: [CAT1, CAT3],
    desc: "Custom handcrafted theme cake soaked in saffron milk, layered with soft chenna rabri, silver vark, and slivered pistachios."
  },
  {
    title: "Rich Shahi Paneer Lababdar",
    category: [CAT2],
    desc: "Succulent cottage cheese cubes simmered in a rich tomato-cashew gravy scented with Kasuri methi and green cardamom."
  },
  {
    title: "Desi Punjabi Kadhi Pakora",
    category: [CAT2],
    desc: "Slow-simmered tangy yogurt and besan gravy spiced with methi seeds, stuffed with crispy onion-spinach pakoras."
  },
  {
    title: "Piping Hot Golden Tawa Puris",
    category: [CAT2],
    desc: "Freshly fried whole wheat puris puffed to perfection, serving as the ideal pairing for authentic gravies and chole."
  },
  {
    title: "Royal Punjabi Banquet Meal",
    category: [CAT2],
    desc: "A lavish combination of creamy Paneer Lababdar, homestyle Punjabi Kadhi Pakora, and golden puffed puris."
  },
  {
    title: "Guilt-Free Air-Fried Onion Pakoras",
    category: [CAT2],
    desc: "Crispy, light onion fritters seasoned with roasted carom seeds and spices, air-fried with minimal oil for wholesome crunch."
  },
  {
    title: "Disney Themed Two-Tier Strawberry & Black Forest Cake",
    category: [CAT1],
    desc: "Double-tiered bespoke birthday cake featuring fresh strawberry compote on one layer and classic Belgian chocolate dark cherry Black Forest on the second."
  },
  {
    title: "Gourmet Hand-Piped Cake Pops",
    category: [CAT1],
    desc: "Moist bite-sized cake spheres rolled in Belgian chocolate shell, decorated with colorful sugar pearls and sprinkles."
  },
  {
    title: "Deconstructed Gulab Jamun Rabri Cups",
    category: [CAT3],
    desc: "Individual dessert cups featuring soft Gulab Jamun morsels nestled under thick saffron-infused Rabri cream."
  },
  {
    title: "Artisanal Gulab Jamun Dessert Shooters",
    category: [CAT3],
    desc: "Cardamom-flavored dessert jars filled with warm Gulab Jamuns, malai rabri, roasted pistachios, and edible rose petals."
  },
  {
    title: "Paw Patrol Themed 2-Tier Pineapple Crush Cake",
    category: [CAT1],
    desc: "Custom 2-tiered children's birthday cake layered with real tropical pineapple reduction and light whipped cream."
  },
  {
    title: "Spidey Superhero 3-Tier Multi-Flavor Cake",
    category: [CAT1],
    desc: "Spectacular 3-tiered birthday cake boasting three custom flavors: Dutch Chocolate Ganache, Vanilla Bean, and Fresh Mango."
  },
  {
    title: "Artisanal Fresh Fruit & Dark Choco Rum Cake",
    category: [CAT1],
    desc: "Rich spiced sponge loaded with rum-soaked dried fruits, dark chocolate chunks, and citrus zest."
  },
  {
    title: "Heritage Fusion Dessert Cups Trio",
    category: [CAT1, CAT3],
    desc: "Decadent tri-flavor dessert cups incorporating soft Rasmalai Rabri, Gulab Jamun, and Pistachio cardamom cake mousse."
  },
  {
    title: "Trio Flavor Cake Boats (Pistachio, Choco & Red Velvet)",
    category: [CAT1],
    desc: "Individual cake boat slices featuring three signature bakes: Persian Pistachio, Dark Chocolate Ganache, and Cream Cheese Red Velvet."
  },
  {
    title: "Hershey's Molten Choco Lava Cake Boats",
    category: [CAT1],
    desc: "Warm chocolate cake boats with a flowing molten Hershey's dark chocolate center, topped with chocolate drizzle."
  },
  {
    title: "Belgian Chocolate Ganache Cake Pops",
    category: [CAT1],
    desc: "Rich fudge cake truffles dipped in dark Belgian chocolate shell and finished with gold dust and chocolate sprinkles."
  },
  {
    title: "Royal Fusion Cake Cream Jars Trio",
    category: [CAT1, CAT3],
    desc: "Gourmet dessert jars featuring layers of Saffron Rasmalai, Warm Gulab Jamun, and Alphonso Mango Mousse cake."
  },
  {
    title: "Scratch-Baked European Butter Cookies",
    category: [CAT1],
    desc: "Handcrafted butter cookies infused with cardamom and pistachios, baked fresh in small batches."
  },
  {
    title: "Dual Flavor Vanilla & Chocolate Cake Cones",
    category: [CAT1],
    desc: "Waffle cones stuffed with moist vanilla bean and chocolate cake, topped with buttercream swirls and sprinkles."
  },
  {
    title: "Charcoal-Smoked Dhungar Baingan Bharta",
    category: [CAT2],
    desc: "Eggplant roasted over open coals, mashed and tempered with garlic, green chilies, tomatoes, and mustard oil."
  },
  {
    title: "Party Dessert Sampler: Cake Cups & Pops",
    category: [CAT1],
    desc: "Colorfully arranged dessert tray of mini mousse cake cups and custom hand-decorated cake pops for events."
  },
  {
    title: "Stuffed Hyderabadi Bharwa Baingan",
    category: [CAT2],
    desc: "Tender baby eggplants stuffed with freshly ground peanuts, sesame, coconut, and roasted dry spices."
  },
  {
    title: "Designer Alphonso Mango Bloom Cake",
    category: [CAT1],
    desc: "Artisan birthday cake layered with real Alphonso mango pulp, whipped cream, and hand-piped rosette floral detailing."
  },
  {
    title: "Daily Dabba: Veg Jalfrezi & Yellow Dal Tadka",
    category: [CAT2],
    desc: "Homestyle meal featuring stir-fried crunchy vegetables in tangy spices alongside garlic-tempered yellow arhar dal."
  },
  {
    title: "Daily Dabba: Punjabi Rajma & Aalu Gobhi",
    category: [CAT2],
    desc: "Comforting homestyle dabba with slow-simmered Punjabi Rajma curry and ginger-roasted potato cauliflower sabzi."
  },
  {
    title: "Grand Maharaja Royal Festive Thali",
    category: [CAT2, CAT3],
    desc: "Comprehensive celebration feast featuring Pindi Chole, Matar Paneer, Dahi Bhalla, Rice Kheer, Puris, and house-pickled carrots."
  },
  {
    title: "Slow-Cooked Shahi Rabri Kheer",
    category: [CAT3],
    desc: "Traditional rice pudding thickened with slow-reduced full cream rabri, flavored with saffron, cardamom, and chopped almonds."
  },
  {
    title: "Street-Style Pani Puri Chaat Bar",
    category: [CAT2],
    desc: "Crispy semolina puris served with spiced potato-chickpea filling, spicy mint-coriander water, and sweet tamarind chutney."
  },
  {
    title: "Paneer Butter Masala & Pakora Banquet",
    category: [CAT2],
    desc: "Feast menu combining rich Paneer Butter Masala, assorted vegetable pakoras, Punjabi Kadhi, and fluffy puris."
  },
  {
    title: "Homestyle Punjabi Kadhi & Paneer Masala Combo",
    category: [CAT2],
    desc: "Classic dual curry combo featuring tangy yogurt Kadhi Pakora alongside spiced Dhaba-style Paneer Masala."
  },
  {
    title: "Pokémon Pikachu Themed Red Velvet Cake",
    category: [CAT1],
    desc: "Custom hand-decorated Pokéball birthday cake crafted with cocoa red velvet sponge and cream cheese frosting."
  },
  {
    title: "Cardamom Gulab Jamun Fusion Layer Cake",
    category: [CAT1, CAT3],
    desc: "Saffron-infused chiffon cake layered with Rabri buttercream and garnished with syrup-soaked Gulab Jamuns."
  },
  {
    title: "Samosa Chaat & Indo-Chinese Combo Platter",
    category: [CAT2],
    desc: "Crushed vegetable samosas drizzled with chole and chutneys alongside wok-tossed vegetable fried rice and Hakka noodles."
  },
  {
    title: "Daily Dabba: Lauki Kofta Curry & Aalu Capsicum",
    category: [CAT2],
    desc: "Wholesome daily dabba with soft bottle-gourd kofta dumplings in tomato gravy paired with spiced potato bell pepper stir-fry."
  },
  {
    title: "Artisanal Samosa Cones & Veg Cutlet Party Tray",
    category: [CAT2],
    desc: "Hand-folded cone samosas filled with spiced potato and peas alongside crispy vegetable cutlets and cilantro dip."
  },
  {
    title: "Wok-Fired Veg Manchurian & Hakka Fried Rice",
    category: [CAT2],
    desc: "Crispy vegetable Manchurian dumplings tossed in spicy garlic soy sauce, served with wok-fried vegetable rice."
  },
  {
    title: "Assorted Stuffed Paratha Basket (Aalu, Sattu & Paneer)",
    category: [CAT2],
    desc: "Tawa-grilled whole wheat flatbreads stuffed with spiced potatoes, Bihari roasted sattu, and seasoned paneer, served with butter."
  },
  {
    title: "Indo-Chinese Triple Fusion Combo",
    category: [CAT2],
    desc: "A street-food favorite combo of Veg Manchurian in gravy, wok-tossed Hakka noodles, and vegetable fried rice."
  },
  {
    title: "Ferrero Rocher Hazelnut Dark Ganache Cake",
    category: [CAT1],
    desc: "Decadent chocolate sponge layered with Nutella hazelnut cream, crushed Ferrero Rocher chocolates, and dark ganache."
  },
  {
    title: "Bespoke Two-Tier Pineapple Crush Celebration Cake",
    category: [CAT1],
    desc: "Two-tiered custom theme cake infused with sweet tropical pineapple reduction and light whipped cream."
  },
  {
    title: "Disney Princess Two-Tier Peach & Black Forest Cake",
    category: [CAT1],
    desc: "Enchanting two-tier princess birthday cake featuring fresh peach cream on the top tier and classic Black Forest on the bottom."
  },
  {
    title: "Two-Tier Cookies & Cream + Chocolate Birthday Cake",
    category: [CAT1],
    desc: "Custom two-tiered cake pairing Oreo cookies & cream filling on one tier with rich Belgian chocolate ganache on the second."
  },
  {
    title: "Gourmet Cupcakes & Cake Pops Dessert Platter",
    category: [CAT1],
    desc: "Hand-piped buttercream cupcakes accompanied by matching hand-decorated chocolate cake pops."
  }
];

async function updateAll() {
  const jsonPath = path.resolve('src/data/galleryData.json');
  const existingItems = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

  const updatedItems = existingItems.map((item, idx) => {
    const userMatch = rawUserItems[idx] || rawUserItems[rawUserItems.length - 1];
    return {
      ...item,
      title: userMatch.title,
      category: userMatch.category,
      autoDescription: userMatch.desc
    };
  });

  fs.writeFileSync(jsonPath, JSON.stringify(updatedItems, null, 2), 'utf8');
  console.log(`Updated ${updatedItems.length} items in src/data/galleryData.json`);

  console.log('Syncing updated gallery items directly to Supabase app_settings table...');
  const { error } = await supabase
    .from('app_settings')
    .upsert({
      key: 'gallery_items',
      value: updatedItems,
      updated_at: new Date().toISOString()
    });

  if (error) {
    console.error('Error syncing to Supabase:', error);
  } else {
    console.log('Successfully synced all 57 multi-tagged gallery items to Supabase!');
  }
}

updateAll();
