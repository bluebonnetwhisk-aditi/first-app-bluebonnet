import type { MenuItem, TrayPricing, TrayTier } from '../types/catering';

export const TIER_PRICING: Record<TrayTier, TrayPricing> = {
  Khaas: { third: 35, half: 50, full: 70 },
  Shahi: { third: 45, half: 60, full: 90 },
  Darbari: { third: 55, half: 70, full: 110 },
  Maharaja: { third: 65, half: 80, full: 130 }
};

export const ALLERGEN_LABELS = {
  D: { code: 'D', name: 'Dairy', desc: 'Milk, ghee, butter, cream, paneer & yogurt — found in most gravies, desserts and drinks.' },
  G: { code: 'G', name: 'Gluten / Wheat', desc: 'Breads, pasta, noodles, samosa & suji (semolina) based dishes.' },
  N: { code: 'N', name: 'Nuts', desc: 'Cashew-based gravies, kofta, kheer & dry-fruit desserts (may include peanuts).' },
  S: { code: 'S', name: 'Soy', desc: 'Indo-Chinese favourites made with soy sauce — Manchurian, noodles & fried rice.' }
} as const;

export const DIFFERENTIATOR_CARDS = [
  {
    title: 'No Preservatives',
    description: 'Cooked fresh for your event — never premade, never stored',
    icon: 'ShieldCheck'
  },
  {
    title: 'Healthy Oils',
    description: 'Light, quality cooking oils — nothing reused, nothing heavy',
    icon: 'Droplet'
  },
  {
    title: 'Organic Ingredients',
    description: 'Fresh produce & whole spices, sourced with care',
    icon: 'Leaf'
  },
  {
    title: 'Made with Love & Taste',
    description: 'Small batches, family recipes — homestyle, not restaurant-style',
    icon: 'Heart'
  }
];

export const DESI_DABBA_ITEMS: MenuItem[] = [
  // A. PANEER & PREMIUM MAINS
  {
    id: 'shahi-paneer',
    name: 'Shahi Paneer',
    category: 'mains',
    categoryLabel: 'Paneer & Premium Mains',
    tier: 'Maharaja',
    description: 'Paneer simmered in a rich, royal cashew-tomato cream.',
    allergens: ['D', 'N'],
    pricingType: 'tray',
    trayPricing: TIER_PRICING.Maharaja,
    leadTimeHours: 24,
    isSatvikAvailable: true
  },
  {
    id: 'paneer-lababdar',
    name: 'Paneer Lababdar',
    category: 'mains',
    categoryLabel: 'Paneer & Premium Mains',
    tier: 'Maharaja',
    description: 'Silky onion-tomato gravy finished with cream.',
    allergens: ['D', 'N'],
    pricingType: 'tray',
    trayPricing: TIER_PRICING.Maharaja,
    leadTimeHours: 24,
    isSatvikAvailable: false
  },
  {
    id: 'paneer-butter-masala',
    name: 'Paneer Butter Masala',
    category: 'mains',
    categoryLabel: 'Paneer & Premium Mains',
    tier: 'Maharaja',
    description: 'The classic — buttery, mildly sweet tomato curry.',
    allergens: ['D', 'N'],
    pricingType: 'tray',
    trayPricing: TIER_PRICING.Maharaja,
    leadTimeHours: 24,
    isSatvikAvailable: true
  },
  {
    id: 'kadhai-paneer',
    name: 'Kadhai Paneer',
    category: 'mains',
    categoryLabel: 'Paneer & Premium Mains',
    tier: 'Maharaja',
    description: 'Tossed with peppers & fresh-ground kadhai spices.',
    allergens: ['D'],
    pricingType: 'tray',
    trayPricing: TIER_PRICING.Maharaja,
    leadTimeHours: 24,
    isSatvikAvailable: true
  },
  {
    id: 'palak-paneer',
    name: 'Palak Paneer',
    category: 'mains',
    categoryLabel: 'Paneer & Premium Mains',
    tier: 'Maharaja',
    description: 'Soft paneer folded into smooth spinach gravy.',
    allergens: ['D'],
    pricingType: 'tray',
    trayPricing: TIER_PRICING.Maharaja,
    leadTimeHours: 24,
    isSatvikAvailable: true
  },
  {
    id: 'matar-paneer',
    name: 'Matar Paneer',
    category: 'mains',
    categoryLabel: 'Paneer & Premium Mains',
    tier: 'Darbari',
    description: 'Homestyle green pea & paneer curry.',
    allergens: ['D'],
    pricingType: 'tray',
    trayPricing: TIER_PRICING.Darbari,
    leadTimeHours: 24,
    isSatvikAvailable: true
  },
  {
    id: 'malai-kofta',
    name: 'Malai Kofta',
    category: 'mains',
    categoryLabel: 'Paneer & Premium Mains',
    tier: 'Maharaja',
    description: 'Melt-in-the-mouth kofta in creamy white gravy.',
    allergens: ['D', 'N'],
    pricingType: 'tray',
    trayPricing: TIER_PRICING.Maharaja,
    leadTimeHours: 24,
    isSatvikAvailable: true
  },

  // B. DRY SABZI
  {
    id: 'aloo-gobhi',
    name: 'Aloo Gobhi',
    category: 'sabzi',
    categoryLabel: 'Dry Sabzi',
    tier: 'Shahi',
    description: 'Potato & cauliflower with turmeric & herbs.',
    allergens: [],
    pricingType: 'tray',
    trayPricing: TIER_PRICING.Shahi,
    leadTimeHours: 24,
    isSatvikAvailable: true
  },
  {
    id: 'beans-aloo',
    name: 'Beans Aloo',
    category: 'sabzi',
    categoryLabel: 'Dry Sabzi',
    tier: 'Shahi',
    description: 'Crisp green beans & potato, light tempering.',
    allergens: [],
    pricingType: 'tray',
    trayPricing: TIER_PRICING.Shahi,
    leadTimeHours: 24,
    isSatvikAvailable: true
  },
  {
    id: 'cabbage-matar',
    name: 'Cabbage Matar',
    category: 'sabzi',
    categoryLabel: 'Dry Sabzi',
    tier: 'Shahi',
    description: 'Stir-fried cabbage with sweet green peas.',
    allergens: [],
    pricingType: 'tray',
    trayPricing: TIER_PRICING.Shahi,
    leadTimeHours: 24,
    isSatvikAvailable: true
  },
  {
    id: 'jeera-aloo',
    name: 'Jeera Aloo',
    category: 'sabzi',
    categoryLabel: 'Dry Sabzi',
    tier: 'Shahi',
    description: 'Golden potatoes tossed in toasted cumin.',
    allergens: [],
    pricingType: 'tray',
    trayPricing: TIER_PRICING.Shahi,
    leadTimeHours: 24,
    isSatvikAvailable: true
  },
  {
    id: 'mixed-veg',
    name: 'Mixed Veg',
    category: 'sabzi',
    categoryLabel: 'Dry Sabzi',
    tier: 'Shahi',
    description: 'Seasonal garden vegetables in homestyle masala.',
    allergens: [],
    pricingType: 'tray',
    trayPricing: TIER_PRICING.Shahi,
    leadTimeHours: 24,
    isSatvikAvailable: true
  },
  {
    id: 'bharwa-baingan',
    name: 'Bharwa Baingan',
    category: 'sabzi',
    categoryLabel: 'Dry Sabzi',
    tier: 'Shahi',
    description: 'Baby eggplant stuffed with roasted masala.',
    allergens: ['N'],
    pricingType: 'tray',
    trayPricing: TIER_PRICING.Shahi,
    leadTimeHours: 24,
    isSatvikAvailable: true
  },
  {
    id: 'bhindi-sabzi',
    name: 'Bhindi Sabzi',
    category: 'sabzi',
    categoryLabel: 'Dry Sabzi',
    tier: 'Darbari',
    description: 'Crisp okra tossed with onions & spices.',
    allergens: [],
    pricingType: 'tray',
    trayPricing: TIER_PRICING.Darbari,
    leadTimeHours: 24,
    isSatvikAvailable: true
  },
  {
    id: 'veg-jalfrezi',
    name: 'Veg Jalfrezi',
    category: 'sabzi',
    categoryLabel: 'Dry Sabzi',
    tier: 'Darbari',
    description: 'Tangy tossed vegetables, capsicum & tomato.',
    allergens: [],
    pricingType: 'tray',
    trayPricing: TIER_PRICING.Darbari,
    leadTimeHours: 24,
    isSatvikAvailable: true
  },

  // C. DAL & CURRIES
  {
    id: 'dal-makhani',
    name: 'Dal Makhani',
    category: 'dal',
    categoryLabel: 'Dal & Curries',
    tier: 'Shahi',
    description: 'Black lentils slow-simmered with butter & cream.',
    allergens: ['D'],
    pricingType: 'tray',
    trayPricing: TIER_PRICING.Shahi,
    leadTimeHours: 24,
    isSatvikAvailable: true
  },
  {
    id: 'dal-tadka',
    name: 'Dal Tadka',
    category: 'dal',
    categoryLabel: 'Dal & Curries',
    tier: 'Shahi',
    description: 'Yellow dal with a sizzling ghee-garlic tadka.',
    allergens: ['D'],
    pricingType: 'tray',
    trayPricing: TIER_PRICING.Shahi,
    leadTimeHours: 24,
    isSatvikAvailable: true
  },
  {
    id: 'palak-dal',
    name: 'Palak Dal',
    category: 'dal',
    categoryLabel: 'Dal & Curries',
    tier: 'Shahi',
    description: 'Comforting lentils cooked with fresh spinach.',
    allergens: ['D'],
    pricingType: 'tray',
    trayPricing: TIER_PRICING.Shahi,
    leadTimeHours: 24,
    isSatvikAvailable: true
  },
  {
    id: 'rajma',
    name: 'Rajma',
    category: 'dal',
    categoryLabel: 'Dal & Curries',
    tier: 'Shahi',
    description: 'Punjabi kidney beans in a thick homestyle gravy.',
    allergens: [],
    pricingType: 'tray',
    trayPricing: TIER_PRICING.Shahi,
    leadTimeHours: 24,
    isSatvikAvailable: true
  },
  {
    id: 'chole',
    name: 'Chole',
    category: 'dal',
    categoryLabel: 'Dal & Curries',
    tier: 'Shahi',
    description: 'Tangy chickpeas in robust Amritsari masala.',
    allergens: [],
    pricingType: 'tray',
    trayPricing: TIER_PRICING.Shahi,
    leadTimeHours: 24,
    isSatvikAvailable: true
  },
  {
    id: 'kadhi-pakora',
    name: 'Kadhi Pakora',
    category: 'dal',
    categoryLabel: 'Dal & Curries',
    tier: 'Shahi',
    description: 'Tangy yogurt-besan curry with soft pakoras.',
    allergens: ['D'],
    pricingType: 'tray',
    trayPricing: TIER_PRICING.Shahi,
    leadTimeHours: 24,
    isSatvikAvailable: true
  },
  {
    id: 'halwai-wale-aloo-bhaji',
    name: 'Halwai Wale Aloo Bhaji',
    category: 'dal',
    categoryLabel: 'Dal & Curries',
    tier: 'Shahi',
    description: 'Wedding-style potato curry, strictly no onion no garlic.',
    allergens: [],
    pricingType: 'tray',
    trayPricing: TIER_PRICING.Shahi,
    leadTimeHours: 24,
    isSatvikAvailable: true
  },

  // D. STARTERS & INDO-CHINESE
  {
    id: 'veg-manchurian',
    name: 'Veg Manchurian',
    category: 'starters',
    categoryLabel: 'Starters & Indo-Chinese',
    tier: 'Maharaja',
    description: 'Crisp veggie dumplings in garlicky soy sauce.',
    allergens: ['G', 'S'],
    pricingType: 'tray',
    trayPricing: TIER_PRICING.Maharaja,
    leadTimeHours: 24,
    isSatvikAvailable: false
  },
  {
    id: 'hakka-noodles',
    name: 'Hakka Noodles',
    category: 'starters',
    categoryLabel: 'Starters & Indo-Chinese',
    tier: 'Darbari',
    description: 'Wok-tossed noodles, street-style desi Chinese.',
    allergens: ['G', 'S'],
    pricingType: 'tray',
    trayPricing: TIER_PRICING.Darbari,
    leadTimeHours: 24,
    isSatvikAvailable: false
  },
  {
    id: 'veg-fried-rice',
    name: 'Veg Fried Rice',
    category: 'starters',
    categoryLabel: 'Starters & Indo-Chinese',
    tier: 'Shahi',
    description: 'Soy-kissed rice with crunchy vegetables.',
    allergens: ['S'],
    pricingType: 'tray',
    trayPricing: TIER_PRICING.Shahi,
    leadTimeHours: 24,
    isSatvikAvailable: false
  },
  {
    id: 'arrabbiata-alfredo-pasta',
    name: 'Arrabbiata / Alfredo Pasta',
    category: 'starters',
    categoryLabel: 'Starters & Indo-Chinese',
    tier: 'Darbari',
    description: 'Your pick — spicy tomato or creamy garlic parmesan style.',
    allergens: ['G', 'D'],
    pricingType: 'tray',
    trayPricing: TIER_PRICING.Darbari,
    leadTimeHours: 24,
    isSatvikAvailable: true
  },
  {
    id: 'onion-pakoda',
    name: 'Onion Pakoda',
    category: 'starters',
    categoryLabel: 'Starters & Indo-Chinese',
    tier: 'Shahi',
    description: 'Crispy chickpea-battered onion fritters.',
    allergens: [],
    pricingType: 'tray',
    trayPricing: TIER_PRICING.Shahi,
    leadTimeHours: 24,
    isSatvikAvailable: false
  },
  {
    id: 'railway-cutlet',
    name: 'Railway Cutlet',
    category: 'starters',
    categoryLabel: 'Starters & Indo-Chinese',
    tier: 'Darbari',
    description: 'Old-school veg cutlets, golden crumb-fried.',
    allergens: ['G'],
    pricingType: 'tray',
    trayPricing: TIER_PRICING.Darbari,
    leadTimeHours: 24,
    isSatvikAvailable: true
  },
  {
    id: 'paneer-pakoda',
    name: 'Paneer Pakoda',
    category: 'starters',
    categoryLabel: 'Starters & Indo-Chinese',
    tier: 'Maharaja',
    description: 'Batter-fried paneer, best with mint chutney.',
    allergens: ['D'],
    pricingType: 'tray',
    trayPricing: TIER_PRICING.Maharaja,
    leadTimeHours: 24,
    isSatvikAvailable: true
  },
  {
    id: 'samosa-chaat',
    name: 'Samosa Chaat',
    category: 'starters',
    categoryLabel: 'Starters & Indo-Chinese',
    tier: 'Darbari',
    description: 'Crushed samosa, chole, yogurt & sweet-tangy chutneys.',
    allergens: ['G', 'D'],
    pricingType: 'tray',
    trayPricing: TIER_PRICING.Darbari,
    leadTimeHours: 24,
    isSatvikAvailable: true
  },
  {
    id: 'dahi-bhalla',
    name: 'Dahi Bhalla',
    category: 'starters',
    categoryLabel: 'Starters & Indo-Chinese',
    tier: 'Darbari',
    description: 'Soft lentil dumplings in sweet whipped yogurt.',
    allergens: ['D'],
    pricingType: 'tray',
    trayPricing: TIER_PRICING.Darbari,
    leadTimeHours: 24,
    isSatvikAvailable: true
  },
  {
    id: 'pani-puri',
    name: 'Pani Puri',
    category: 'starters',
    categoryLabel: 'Starters & Indo-Chinese',
    tier: 'Darbari',
    description: 'Crisp puris with zingy spiced water & fillings.',
    allergens: ['G'],
    pricingType: 'tray',
    trayPricing: TIER_PRICING.Darbari,
    leadTimeHours: 24,
    isSatvikAvailable: true
  },
  {
    id: 'aalu-bonda',
    name: 'Aalu Bonda',
    category: 'starters',
    categoryLabel: 'Starters & Indo-Chinese',
    tier: 'Darbari',
    description: 'Spiced potato dumplings in golden besan crust.',
    allergens: [],
    pricingType: 'tray',
    trayPricing: TIER_PRICING.Darbari,
    leadTimeHours: 24,
    isSatvikAvailable: true
  },

  // E. RICE & SIDES
  {
    id: 'jeera-rice',
    name: 'Jeera Rice',
    category: 'rice',
    categoryLabel: 'Rice & Sides',
    tier: 'Khaas',
    description: 'Fluffy basmati tempered with cumin & ghee.',
    allergens: ['D'],
    pricingType: 'tray',
    trayPricing: TIER_PRICING.Khaas,
    leadTimeHours: 24,
    isSatvikAvailable: true
  },
  {
    id: 'peas-pulao',
    name: 'Peas Pulao',
    category: 'rice',
    categoryLabel: 'Rice & Sides',
    tier: 'Khaas',
    description: 'Fragrant basmati studded with green peas.',
    allergens: [],
    pricingType: 'tray',
    trayPricing: TIER_PRICING.Khaas,
    leadTimeHours: 24,
    isSatvikAvailable: true
  },
  {
    id: 'veg-pulao',
    name: 'Veg Pulao',
    category: 'rice',
    categoryLabel: 'Rice & Sides',
    tier: 'Shahi',
    description: 'Aromatic rice with vegetables & whole spices.',
    allergens: [],
    pricingType: 'tray',
    trayPricing: TIER_PRICING.Shahi,
    leadTimeHours: 24,
    isSatvikAvailable: true
  },
  {
    id: 'plain-raita',
    name: 'Plain Raita',
    category: 'sides',
    categoryLabel: 'Rice & Sides',
    tier: 'Khaas',
    description: 'Cooling whipped yogurt, gently spiced.',
    allergens: ['D'],
    pricingType: 'tray',
    trayPricing: TIER_PRICING.Khaas,
    leadTimeHours: 24,
    isSatvikAvailable: true
  },
  {
    id: 'boondi-raita',
    name: 'Boondi Raita',
    category: 'sides',
    categoryLabel: 'Rice & Sides',
    tier: 'Khaas',
    description: 'Creamy yogurt with crisp boondi pearls.',
    allergens: ['D'],
    pricingType: 'tray',
    trayPricing: TIER_PRICING.Khaas,
    leadTimeHours: 24,
    isSatvikAvailable: true
  },
  {
    id: 'fresh-salad',
    name: 'Fresh Salad',
    category: 'sides',
    categoryLabel: 'Rice & Sides',
    tier: 'Khaas',
    description: 'Crisp kachumber-style garden salad.',
    allergens: [],
    pricingType: 'tray',
    trayPricing: TIER_PRICING.Khaas,
    leadTimeHours: 24,
    isSatvikAvailable: true
  },

  // F. DESSERTS
  {
    id: 'kheer',
    name: 'Kheer',
    category: 'desserts',
    categoryLabel: 'Desserts',
    tier: 'Darbari',
    description: 'Slow-cooked rice pudding with saffron & nuts.',
    allergens: ['D', 'N'],
    pricingType: 'tray',
    trayPricing: TIER_PRICING.Darbari,
    leadTimeHours: 24,
    isSatvikAvailable: true
  },
  {
    id: 'suji-dry-fruit-halwa',
    name: 'Suji Dry Fruit Halwa',
    category: 'desserts',
    categoryLabel: 'Desserts',
    tier: 'Shahi',
    description: 'Ghee-roasted semolina loaded with dry fruits.',
    allergens: ['G', 'D', 'N'],
    pricingType: 'tray',
    trayPricing: TIER_PRICING.Shahi,
    leadTimeHours: 24,
    isSatvikAvailable: true
  },
  {
    id: 'shahi-tukda',
    name: 'Shahi Tukda',
    category: 'desserts',
    categoryLabel: 'Desserts',
    tier: 'Maharaja',
    description: 'Royal fried bread soaked in saffron rabri.',
    allergens: ['G', 'D', 'N'],
    pricingType: 'tray',
    trayPricing: TIER_PRICING.Maharaja,
    leadTimeHours: 24,
    isSatvikAvailable: true
  },
  {
    id: 'fruit-cream',
    name: 'Fruit Cream',
    category: 'desserts',
    categoryLabel: 'Desserts',
    tier: 'Darbari',
    description: 'Fresh seasonal fruits folded in sweet cream.',
    allergens: ['D'],
    pricingType: 'tray',
    trayPricing: TIER_PRICING.Darbari,
    leadTimeHours: 24,
    isSatvikAvailable: true
  },
  {
    id: 'gulab-jamun',
    name: 'Gulab Jamun',
    category: 'desserts',
    categoryLabel: 'Desserts',
    tier: 'Maharaja',
    description: 'Soft khoya dumplings in warm rose syrup.',
    allergens: ['G', 'D'],
    pricingType: 'tray',
    trayPricing: TIER_PRICING.Maharaja,
    leadTimeHours: 24,
    isSatvikAvailable: true
  },

  // G. BREADS (Standard: $27 / 30 pcs, Speciality: $42 / 30 pcs)
  {
    id: 'bread-poori',
    name: 'Poori',
    category: 'breads',
    categoryLabel: 'Breads (Min. 30 pieces)',
    description: 'Puffed golden bread, freshly made to order.',
    allergens: ['G'],
    pricingType: 'bread',
    pricePer30Pcs: 27,
    leadTimeHours: 24,
    isSatvikAvailable: true
  },
  {
    id: 'bread-methi-poori',
    name: 'Methi Poori',
    category: 'breads',
    categoryLabel: 'Breads (Min. 30 pieces)',
    description: 'Puffed golden poori infused with fresh fenugreek leaves.',
    allergens: ['G'],
    pricingType: 'bread',
    pricePer30Pcs: 27,
    leadTimeHours: 24,
    isSatvikAvailable: true
  },
  {
    id: 'bread-naan',
    name: 'Naan',
    category: 'breads',
    categoryLabel: 'Breads (Min. 30 pieces)',
    description: 'Soft, airy tandoori-style bread baked to perfection.',
    allergens: ['G', 'D'],
    pricingType: 'bread',
    pricePer30Pcs: 42,
    leadTimeHours: 24,
    isSatvikAvailable: true
  },
  {
    id: 'bread-garlic-naan',
    name: 'Garlic Naan',
    category: 'breads',
    categoryLabel: 'Breads (Min. 30 pieces)',
    description: 'Soft naan brushed with aromatic roasted garlic and fresh butter.',
    allergens: ['G', 'D'],
    pricingType: 'bread',
    pricePer30Pcs: 42,
    leadTimeHours: 24,
    isSatvikAvailable: false
  },
  {
    id: 'bread-dal-kachori',
    name: 'Dal Kachori',
    category: 'breads',
    categoryLabel: 'Breads (Min. 30 pieces)',
    description: 'Crisp, flaky pastry stuffed with seasoned spiced lentils.',
    allergens: ['G'],
    pricingType: 'bread',
    pricePer30Pcs: 42,
    leadTimeHours: 24,
    isSatvikAvailable: true
  },
  {
    id: 'bread-bedmi-poori',
    name: 'Bedmi Poori',
    category: 'breads',
    categoryLabel: 'Breads (Min. 30 pieces)',
    description: 'Crisp, robust puffed poori enriched with coarse spiced urad dal.',
    allergens: ['G'],
    pricingType: 'bread',
    pricePer30Pcs: 42,
    leadTimeHours: 24,
    isSatvikAvailable: true
  },

  // H. BEVERAGES (Per Gallon — approx. 16-20 servings)
  {
    id: 'beverage-mango-lassi',
    name: 'Mango Lassi',
    category: 'beverages',
    categoryLabel: 'Beverages (Per Gallon)',
    description: 'Thick, chilled yogurt shake with sweet mango · approx. 16–20 servings.',
    allergens: ['D'],
    pricingType: 'beverage',
    pricePerGallon: 45,
    leadTimeHours: 24,
    isSatvikAvailable: true
  },
  {
    id: 'beverage-masala-chaas',
    name: 'Masala Chaas',
    category: 'beverages',
    categoryLabel: 'Beverages (Per Gallon)',
    description: 'Spiced buttermilk with roasted cumin & mint · approx. 16–20 servings.',
    allergens: ['D'],
    pricingType: 'beverage',
    pricePerGallon: 35,
    leadTimeHours: 24,
    isSatvikAvailable: true
  },
  {
    id: 'beverage-masala-chai',
    name: 'Masala Chai',
    category: 'beverages',
    categoryLabel: 'Beverages (Per Gallon)',
    description: 'Strong brewed tea with warm whole spices · approx. 16–20 servings.',
    allergens: ['D'],
    pricingType: 'beverage',
    pricePerGallon: 40,
    leadTimeHours: 24,
    isSatvikAvailable: true
  },

  // I. CELEBRATION CAKES (Eggless, 48 hours notice)
  {
    id: 'custom-celebration-cake',
    name: 'Custom Celebration Cake (Eggless)',
    category: 'cakes',
    categoryLabel: 'Celebration Bakes (48 hrs notice)',
    description: 'Custom celebration cakes, cake jars, cupcakes & cake pops — eggless by default. Base 8" cake serves 15–20 guests.',
    allergens: ['G', 'D'],
    pricingType: 'cake',
    pricePerGallon: 85, // base rate
    leadTimeHours: 48,
    isSatvikAvailable: true
  }
];
