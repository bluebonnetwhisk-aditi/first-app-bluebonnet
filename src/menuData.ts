import type { MenuItem, BreadItem, DessertItem, SideItem, DrinkItem, PortionOption, ServiceAddon } from './types';

export const MAIN_COURSES: MenuItem[] = [
  {
    id: 'mc_matar_paneer',
    name: 'Matar Paneer',
    description: 'Slow-cooked paneer cubes with tender green peas in a velvety spiced tomato reduction.',
    tag: 'VEGETARIAN',
    prices: { third: 45, half: 65, full: 85 },
    allergens: ['Dairy'],
    image: 'https://images.unsplash.com/photo-1626132647523-66f5bf380027?auto=format&fit=crop&q=80&w=200&h=200'
  },
  {
    id: 'mc_malai_kofta',
    name: 'Malai Kofta',
    description: 'Hand-rolled potato and cheese dumplings simmered in a luxurious cashew-saffron cream sauce.',
    tag: 'CONTAINS NUTS',
    prices: { third: 50, half: 75, full: 95 },
    allergens: ['Dairy', 'Tree Nuts'],
    image: 'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?auto=format&fit=crop&q=80&w=200&h=200'
  },
  {
    id: 'mc_dal_makhani',
    name: 'Dal Makhani',
    description: '24-hour slow-cooked black lentils with charcoal smoked butter and cream.',
    tag: 'VEGETARIAN',
    prices: { third: 40, half: 60, full: 75 },
    allergens: ['Dairy'],
    image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&q=80&w=200&h=200'
  },
  {
    id: 'mc_veggie_biryani',
    name: 'Vegetable Biryani',
    description: 'Long-grain Basmati rice layered with seasonal vegetables, rose water, and kewra.',
    tag: 'VEGETARIAN',
    prices: { third: 45, half: 70, full: 90 },
    allergens: ['Dairy'],
    image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&q=80&w=200&h=200'
  },
  {
    id: 'mc_shahi_paneer',
    name: 'Shahi Paneer',
    description: 'Cottage cheese cubes in a rich, creamy tomato and cashew nut gravy.',
    tag: 'VEGETARIAN',
    prices: { third: 45, half: 65, full: 85 },
    allergens: ['Dairy', 'Tree Nuts'],
    image: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&q=80&w=200&h=200'
  },
  {
    id: 'mc_aloo_gobi',
    name: 'Aloo Gobi',
    description: 'Classic dry curry of cauliflower and potatoes with ginger and turmeric.',
    tag: 'NONE',
    prices: { third: 35, half: 55, full: 70 },
    allergens: [],
    image: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?auto=format&fit=crop&q=80&w=200&h=200'
  },
  {
    id: 'mc_veg_jalfrezi',
    name: 'Veg Jalfrezi',
    description: 'Stir-fried seasonal vegetables in a tangy tomato-based sauce.',
    tag: 'VEGETARIAN',
    prices: { third: 40, half: 60, full: 75 },
    allergens: [],
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=200&h=200'
  },
  {
    id: 'mc_mixed_veg',
    name: 'Mixed Veg',
    description: 'A medley of garden-fresh vegetables cooked in a traditional spice blend.',
    tag: 'NONE',
    prices: { third: 40, half: 60, full: 75 },
    allergens: [],
    image: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&q=80&w=200&h=200'
  },
  {
    id: 'mc_zeera_rice',
    name: 'Zeera Rice',
    description: 'Fragrant Basmati rice tempered with cumin seeds and ghee.',
    tag: 'VEGETARIAN',
    prices: { third: 25, half: 35, full: 45 },
    allergens: ['Dairy'],
    image: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&q=80&w=200&h=200'
  },
  {
    id: 'mc_shahi_pulao',
    name: 'Shahi Pulao',
    description: 'Royal Basmati rice with dried fruits, nuts, and saffron infusion.',
    tag: 'CONTAINS NUTS',
    prices: { third: 40, half: 60, full: 75 },
    allergens: ['Dairy', 'Tree Nuts'],
    image: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&q=80&w=200&h=200'
  }
];

export const BREADS: BreadItem[] = [
  {
    id: 'br_raja_paratha',
    name: 'Raja Paratha',
    description: 'Multi-layered flaky whole wheat bread.',
    price: 4.50,
    allergens: ['Gluten'],
    image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&q=80&w=200&h=200'
  },
  {
    id: 'br_tawa_roti',
    name: 'Tawa Roti',
    description: 'Traditional unleavened flatbread cooked on a griddle.',
    price: 3.00,
    allergens: ['Gluten'],
    image: 'https://images.unsplash.com/photo-1505253716362-afaea1d3d1af?auto=format&fit=crop&q=80&w=200&h=200'
  },
  {
    id: 'br_naan',
    name: 'Naan',
    description: 'Soft, leavened oven-baked flatbread.',
    price: 4.00,
    allergens: ['Gluten', 'Dairy'],
    image: 'https://images.unsplash.com/photo-1601050690597-df056fb4ce78?auto=format&fit=crop&q=80&w=200&h=200'
  },
  {
    id: 'br_garlic_naan',
    name: 'Garlic Naan',
    description: 'Oven-baked flatbread infused with fresh garlic and herbs.',
    price: 4.50,
    allergens: ['Gluten', 'Dairy'],
    image: 'https://images.unsplash.com/photo-1601050690597-df056fb4ce78?auto=format&fit=crop&q=80&w=200&h=200&q=50'
  }
];

export const DESSERTS: DessertItem[] = [
  {
    id: 'ds_gulab_jamun',
    name: 'Gulab Jamun',
    description: 'Golden milk solids in cardamom syrup.',
    prices: { third: 18, half: 25, full: 32 },
    allergens: ['Dairy', 'Gluten'],
    image: 'https://images.unsplash.com/photo-1528751003873-ac9700ac7f31?auto=format&fit=crop&q=80&w=200&h=200'
  },
  {
    id: 'ds_rasmalai',
    name: 'Rasmalai',
    description: 'Saffron soaked cottage cheese patties.',
    prices: { third: 22, half: 30, full: 38 },
    allergens: ['Dairy', 'Tree Nuts'],
    image: 'https://images.unsplash.com/photo-1505253685822-fe48b59cfc8f?auto=format&fit=crop&q=80&w=200&h=200'
  },
  {
    id: 'ds_kheer_tray',
    name: 'Kheer Tray',
    description: 'Artisanal rice pudding with pistachios.',
    prices: { third: 30, half: 45, full: 55 },
    allergens: ['Dairy', 'Tree Nuts'],
    image: 'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?auto=format&fit=crop&q=80&w=200&h=200'
  },
  {
    id: 'ds_shahi_tukda',
    name: 'Shahi Tukda',
    description: 'Rich bread pudding with saffron and nuts.',
    prices: { third: 20, half: 30, full: 40 },
    allergens: ['Dairy', 'Gluten', 'Tree Nuts'],
    image: 'https://images.unsplash.com/photo-1626132647523-66f5bf380027?auto=format&fit=crop&q=80&w=200&h=200&q=40'
  },
  {
    id: 'ds_malpua',
    name: 'Malpua',
    description: 'Traditional Indian pancakes soaked in syrup.',
    prices: { third: 18, half: 28, full: 35 },
    allergens: ['Dairy', 'Gluten'],
    image: 'https://images.unsplash.com/photo-1528751003873-ac9700ac7f31?auto=format&fit=crop&q=80&w=200&h=200&q=40'
  },
  {
    id: 'ds_kalakand',
    name: 'Kalakand',
    description: 'Soft, grainy milk cake with cardamom.',
    prices: { third: 25, half: 35, full: 45 },
    allergens: ['Dairy'],
    image: 'https://images.unsplash.com/photo-1601356616077-695728ecf769?auto=format&fit=crop&q=80&w=200&h=200'
  }
];

export const SIDES: SideItem[] = [
  {
    id: 'sd_assorted_salads',
    name: 'Assorted Salads',
    description: 'Fresh seasonal greens and traditional Indian salads.',
    tag: 'NONE',
    prices: { third: 15, half: 25, full: 35 },
    allergens: [],
    image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&q=80&w=200&h=200'
  },
  {
    id: 'sd_roasted_papad',
    name: 'Roasted/Fried Papad',
    description: 'Crispy lentil wafers served with chutneys.',
    tag: 'NONE',
    prices: { single: 1.50, unitText: 'Piece' },
    allergens: [],
    image: 'https://images.unsplash.com/photo-1605666804797-40ad6efc5643?auto=format&fit=crop&q=80&w=200&h=200'
  }
];

export const DRINKS: DrinkItem[] = [
  { id: 'dr_mango_lassi', name: 'Mango Lassi', price: 12.00, unitText: 'serving', allergens: ['Dairy'], image: 'https://images.unsplash.com/photo-1571006831670-4b92367abbd6?auto=format&fit=crop&q=80&w=200&h=200' },
  { id: 'dr_aam_panna', name: 'Aam Panna', price: 15.00, unitText: 'serving', allergens: [], image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&q=80&w=200&h=200' },
  { id: 'dr_masala_lemonade', name: 'Masala Banta style Lemonade', price: 14.00, unitText: 'serving', allergens: [], image: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&q=80&w=200&h=200' },
  { id: 'dr_masala_chaas', name: 'Masala Chaas (Masala Butter Milk)', price: 12.00, unitText: 'serving', allergens: ['Dairy'], image: 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?auto=format&fit=crop&q=80&w=200&h=200' },
  { id: 'dr_blue_raspberry', name: 'Blue Raspberry Lemonade', price: 14.00, unitText: 'serving', allergens: [], image: 'https://images.unsplash.com/photo-1497534446932-c925b458314e?auto=format&fit=crop&q=80&w=200&h=200' },
  { id: 'dr_strawberry', name: 'Strawberry Lemonade', price: 14.00, unitText: 'serving', allergens: [], image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&q=80&w=200&h=200&q=40' }
];

export const PORTION_GUIDES: PortionOption[] = [
  {
    size: 'Third Tray',
    serves: 'Serves 0-6',
    description: 'Ideal for small intimate gatherings or family dinners.'
  },
  {
    size: 'Half Tray',
    serves: 'Serves 10-12',
    description: 'Perfect for standard dinner parties and larger celebrations.'
  },
  {
    size: 'Full Tray',
    serves: 'Serves 25-30',
    description: 'Best for substantial events, corporate caterings, and heavy crowds.'
  }
];

export const SERVICE_ADDONS: ServiceAddon[] = [
  {
    id: 'sa_table_decor',
    name: 'Custom Table Decor',
    description: 'Bespoke floral & fabric arrangements that match your event theme.',
    priceText: 'From $150',
    basePrice: 150
  },
  {
    id: 'sa_premium_delivery',
    name: 'Premium Delivery',
    description: 'Temperature controlled transit ensuring cold items stay cold and hot items stay hot.',
    priceText: '$45+',
    basePrice: 45
  },
  {
    id: 'sa_live_chaat',
    name: 'Live Chaat Bars',
    description: 'On-site assembly & interactive serving at custom live stations.',
    priceText: '$75/hr',
    basePrice: 75
  }
];

export const BRAND_DETAILS = {
  name: 'Bluebonnet Whisk',
  contact: {
    phone: '+19455274566',
    email: 'bluebonnetwhisk@gmail.com',
    instagram: '@bluebonnetwhisk',
    whatsapp: 'https://wa.me/19455274566'
  },
  tagline: 'Elevating traditional Indian flavors with a modern heritage touch.',
  description: 'Professional catering for your most precious moments. Handcrafted recipes passed down through generations, reimagined for contemporary palates with state-of-the-art culinary artistic execution.'
};
