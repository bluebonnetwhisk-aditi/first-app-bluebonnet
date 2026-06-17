import type { MenuItem, PortionOption, ServiceAddon } from './types';

export const CHATPATI_CHAAT: MenuItem[] = [
  {
    id: 'ct_pani_puri',
    name: 'Pani Puri (50/100/200 pcs)',
    description: 'Crispy hollow puris served with spicy mint water, sweet tamarind chutney, potato and chickpea filling.',
    tag: 'VEGETARIAN',
    prices: { third: 55, half: 95, full: 180 },
    allergens: ['Gluten'],
    image: 'https://images.unsplash.com/photo-1601050690597-df056fb4ce78?auto=format&fit=crop&q=80&w=200&h=200'
  },
  {
    id: 'ct_papri_chaat',
    name: 'Papri Chaat',
    description: 'Crisp fried dough wafers topped with boiled potatoes, chickpeas, yogurt, chutneys, and sev.',
    tag: 'VEGETARIAN',
    prices: { third: 50, half: 95, full: 175 },
    allergens: ['Dairy', 'Gluten'],
    image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&q=80&w=200&h=200'
  },
  {
    id: 'ct_dahi_bhalla',
    name: 'Dahi Bhalla',
    description: 'Soft lentil dumplings soaked in sweet whipped yogurt, topped with sweet and tangy chutneys and spices.',
    tag: 'VEGETARIAN',
    prices: { third: 55, half: 105, full: 195 },
    allergens: ['Dairy'],
    image: 'https://images.unsplash.com/photo-1626132647523-66f5bf380027?auto=format&fit=crop&q=80&w=200&h=200'
  },
  {
    id: 'ct_samosa_chaat',
    name: 'Samosa Chaat',
    description: 'Crushed cocktail samosas layered with warm chickpea curry, sweet yogurt, coriander, and tamarind chutneys.',
    tag: 'VEGETARIAN',
    prices: { third: 50, half: 95, full: 175 },
    allergens: ['Dairy', 'Gluten'],
    image: 'https://images.unsplash.com/photo-1601050690597-df056fb4ce78?auto=format&fit=crop&q=80&w=200&h=200'
  },
  {
    id: 'ct_aloo_tikki_chaat',
    name: 'Aloo Tikki Chaat',
    description: 'Crispy potato patties served with spiced chickpea curry, yogurt, mint-coriander & sweet tamarind chutneys.',
    tag: 'VEGETARIAN',
    prices: { third: 55, half: 105, full: 190 },
    allergens: ['Dairy', 'Gluten'],
    image: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?auto=format&fit=crop&q=80&w=200&h=200'
  }
];

export const APPETIZERS: MenuItem[] = [
  {
    id: 'ap_cocktail_samosa',
    name: 'Cocktail Samosas',
    description: 'Crisp, triangular pastries stuffed with spiced potatoes and green peas.',
    tag: 'VEGETARIAN',
    prices: { third: 40, half: 75, full: 140 },
    allergens: ['Gluten'],
    image: 'https://images.unsplash.com/photo-1601050690597-df056fb4ce78?auto=format&fit=crop&q=80&w=200&h=200'
  },
  {
    id: 'ap_spring_rolls',
    name: 'Spring Rolls',
    description: 'Crispy rolled wrappers stuffed with seasoned julienned stir-fried vegetables.',
    tag: 'VEGETARIAN',
    prices: { third: 45, half: 85, full: 160 },
    allergens: ['Gluten'],
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=200&h=200'
  },
  {
    id: 'ap_hara_bhara_kebab',
    name: 'Hara Bhara Kebab',
    description: 'Pan-fried spiced patties made with spinach, green peas, and fresh herbs.',
    tag: 'VEGETARIAN',
    prices: { third: 50, half: 95, full: 180 },
    allergens: ['Dairy'],
    image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&q=80&w=200&h=200'
  },
  {
    id: 'ap_beetroot_tikki',
    name: 'Beetroot Tikki',
    description: 'Handcrafted pan-seared patties infused with healthy beetroot, potatoes, and mild spices.',
    tag: 'VEGETARIAN',
    prices: { third: 50, half: 95, full: 180 },
    allergens: [],
    image: 'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?auto=format&fit=crop&q=80&w=200&h=200'
  },
  {
    id: 'ap_veg_pakora',
    name: 'Veg Pakora',
    description: 'Golden-fried crispy vegetable fritters coated in a spiced gram flour batter.',
    tag: 'VEGETARIAN',
    prices: { third: 40, half: 75, full: 140 },
    allergens: [],
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=200&h=200'
  },
  {
    id: 'ap_paneer_pakora',
    name: 'Paneer Pakora',
    description: 'Moist paneer cubes sandwiched with green chutney, batter fried to a golden crisp.',
    tag: 'VEGETARIAN',
    prices: { third: 55, half: 105, full: 195 },
    allergens: ['Dairy'],
    image: 'https://images.unsplash.com/photo-1626132647523-66f5bf380027?auto=format&fit=crop&q=80&w=200&h=200'
  },
  {
    id: 'ap_pav_bhaji',
    name: 'Pav Bhaji',
    description: 'A thick, spicy vegetable mash cooked in butter and served with soft, toasted buttered bread buns.',
    tag: 'VEGETARIAN',
    prices: { third: 55, half: 105, full: 210 },
    allergens: ['Dairy', 'Gluten'],
    image: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?auto=format&fit=crop&q=80&w=200&h=200'
  },
  {
    id: 'ap_soya_keema_sliders',
    name: 'Soya Keema Sliders',
    description: 'Spiced soya mince cooked with aromatics, served inside mini toasted slider buns.',
    tag: 'VEGETARIAN',
    prices: { third: 65, half: 120, full: 250 },
    allergens: ['Gluten', 'Soy'],
    image: 'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?auto=format&fit=crop&q=80&w=200&h=200'
  },
  {
    id: 'ap_paneer_bhurji_sliders',
    name: 'Paneer Bhurji Sliders',
    description: 'Scrambled paneer sautéed with onions, tomatoes, and spices, served in mini slider buns.',
    tag: 'VEGETARIAN',
    prices: { third: 70, half: 130, full: 275 },
    allergens: ['Dairy', 'Gluten'],
    image: 'https://images.unsplash.com/photo-1626132647523-66f5bf380027?auto=format&fit=crop&q=80&w=200&h=200'
  }
];

export const DAAL_SUBZI: MenuItem[] = [
  {
    id: 'ds_yellow_dal_fry',
    name: 'Yellow Dal Fry',
    description: 'Creamy yellow lentils tempered with cumin, garlic, tomatoes, and fresh coriander.',
    tag: 'VEGETARIAN',
    prices: { third: 40, half: 75, full: 140 },
    allergens: [],
    image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&q=80&w=200&h=200'
  },
  {
    id: 'ds_dal_makhani',
    name: 'Daal Makhani',
    description: '24-hour slow-cooked black lentils enriched with charcoal smoked butter and fresh cream.',
    tag: 'VEGETARIAN',
    prices: { third: 55, half: 100, full: 190 },
    allergens: ['Dairy'],
    image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&q=80&w=200&h=200'
  },
  {
    id: 'ds_raseele_rajma',
    name: 'Raseele Rajma',
    description: 'Tender red kidney beans cooked in a tangy, thick onion-tomato gravy with warm spices.',
    tag: 'VEGETARIAN',
    prices: { third: 45, half: 85, full: 160 },
    allergens: [],
    image: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?auto=format&fit=crop&q=80&w=200&h=200'
  },
  {
    id: 'ds_pindi_chole',
    name: 'Pindi Chole',
    description: 'Classic dark chickpeas slow-simmered with dried gooseberries, tea leaves, and dry spices.',
    tag: 'VEGETARIAN',
    prices: { third: 45, half: 85, full: 160 },
    allergens: [],
    image: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&q=80&w=200&h=200'
  },
  {
    id: 'ds_punjabi_kadhi',
    name: 'Punjabi Kadhi Pakoda',
    description: 'Tangy yogurt and gram flour curry with crispy vegetable fritters, finished with a ghee tadka.',
    tag: 'VEGETARIAN',
    prices: { third: 45, half: 85, full: 160 },
    allergens: ['Dairy'],
    image: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&q=80&w=200&h=200'
  },
  {
    id: 'ds_subz_bahaar',
    name: 'Subz Bahaar',
    description: 'A vibrant medley of fresh seasonal vegetables tossed in a semi-dry spiced gravy.',
    tag: 'VEGETARIAN',
    prices: { third: 50, half: 90, full: 170 },
    allergens: [],
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=200&h=200'
  },
  {
    id: 'ds_jeera_aloo',
    name: 'Chatpate Jeera Aloo',
    description: 'Baby potatoes roasted with aromatic cumin seeds, green chilies, and tangy dry mango powder.',
    tag: 'VEGETARIAN',
    prices: { third: 35, half: 65, full: 120 },
    allergens: [],
    image: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?auto=format&fit=crop&q=80&w=200&h=200'
  },
  {
    id: 'ds_aloo_gobi',
    name: 'Masala Aloo Gobi',
    description: 'Dry sautéed fresh cauliflower and potato wedges with ginger, turmeric, and ground spices.',
    tag: 'VEGETARIAN',
    prices: { third: 45, half: 85, full: 160 },
    allergens: [],
    image: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?auto=format&fit=crop&q=80&w=200&h=200'
  }
];

export const PANEER_SPECIALTIES: MenuItem[] = [
  {
    id: 'pn_paneer_lababdar',
    name: 'Paneer Lababdar',
    description: 'Paneer cubes in a rich, creamy tomato-onion gravy infused with cashews and grated paneer.',
    tag: 'CONTAINS NUTS',
    prices: { third: 60, half: 115, full: 215 },
    allergens: ['Dairy', 'Tree Nuts'],
    image: 'https://images.unsplash.com/photo-1626132647523-66f5bf380027?auto=format&fit=crop&q=80&w=200&h=200'
  },
  {
    id: 'pn_karahi_paneer',
    name: 'Karahi Paneer',
    description: 'Paneer cooked with bell peppers and onions in a freshly ground, spicy karahi masala spice mix.',
    tag: 'VEGETARIAN',
    prices: { third: 60, half: 115, full: 215 },
    allergens: ['Dairy'],
    image: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&q=80&w=200&h=200'
  },
  {
    id: 'pn_paneer_takatak',
    name: 'Paneer Tak-a-Tak',
    description: 'A tangy, spicy stir-fried paneer dish cooked on a flat tawa with crushed spices.',
    tag: 'VEGETARIAN',
    prices: { third: 60, half: 115, full: 215 },
    allergens: ['Dairy'],
    image: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&q=80&w=200&h=200'
  },
  {
    id: 'pn_matar_paneer',
    name: 'Matar Paneer',
    description: 'Tender green peas and soft paneer cubes in a velvety spiced tomato reduction.',
    tag: 'VEGETARIAN',
    prices: { third: 55, half: 105, full: 195 },
    allergens: ['Dairy'],
    image: 'https://images.unsplash.com/photo-1626132647523-66f5bf380027?auto=format&fit=crop&q=80&w=200&h=200'
  },
  {
    id: 'pn_paneer_bhurji',
    name: 'Paneer Bhurji',
    description: 'Freshly crumbled cottage cheese sautéed with onions, green chilies, and aromatic herbs.',
    tag: 'VEGETARIAN',
    prices: { third: 60, half: 115, full: 215 },
    allergens: ['Dairy'],
    image: 'https://images.unsplash.com/photo-1626132647523-66f5bf380027?auto=format&fit=crop&q=80&w=200&h=200'
  },
  {
    id: 'pn_palak_paneer',
    name: 'Palak Paneer',
    description: 'Cottage cheese cubes simmered in a smooth, vibrant spinach purée with mild garlic seasoning.',
    tag: 'VEGETARIAN',
    prices: { third: 60, half: 115, full: 215 },
    allergens: ['Dairy'],
    image: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&q=80&w=200&h=200'
  },
  {
    id: 'pn_malai_kofta',
    name: 'Kesar Malai Kofta',
    description: 'Hand-rolled potato and cheese dumplings simmered in a luxurious saffron-infused cashew cream gravy.',
    tag: 'CONTAINS NUTS',
    prices: { third: 70, half: 130, full: 245 },
    allergens: ['Dairy', 'Tree Nuts'],
    image: 'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?auto=format&fit=crop&q=80&w=200&h=200'
  }
];

export const FRESH_BREADS: MenuItem[] = [
  {
    id: 'br_plain_naan',
    name: 'Plain Naan',
    description: 'Soft, leavened flatbread baked to order in a clay tandoor.',
    tag: 'VEGETARIAN',
    prices: { single: 1.50, unitText: 'each' },
    allergens: ['Gluten', 'Dairy'],
    image: 'https://images.unsplash.com/photo-1601050690597-df056fb4ce78?auto=format&fit=crop&q=80&w=200&h=200'
  },
  {
    id: 'br_butter_naan',
    name: 'Butter Naan',
    description: 'Tandoor-baked flatbread brushed with premium slow-churned salted butter.',
    tag: 'VEGETARIAN',
    prices: { single: 1.75, unitText: 'each' },
    allergens: ['Gluten', 'Dairy'],
    image: 'https://images.unsplash.com/photo-1601050690597-df056fb4ce78?auto=format&fit=crop&q=80&w=200&h=200'
  },
  {
    id: 'br_garlic_naan',
    name: 'Garlic Naan',
    description: 'Tandoor naan topped with crushed fresh garlic, cilantro, and warm butter.',
    tag: 'VEGETARIAN',
    prices: { single: 2.00, unitText: 'each' },
    allergens: ['Gluten', 'Dairy'],
    image: 'https://images.unsplash.com/photo-1601050690597-df056fb4ce78?auto=format&fit=crop&q=80&w=200&h=200'
  },
  {
    id: 'br_tawa_roti',
    name: 'Tawa Roti',
    description: 'Traditional whole wheat griddle-cooked flatbread.',
    tag: 'VEGETARIAN',
    prices: { single: 1.25, unitText: 'each' },
    allergens: ['Gluten'],
    image: 'https://images.unsplash.com/photo-1505253716362-afaea1d3d1af?auto=format&fit=crop&q=80&w=200&h=200'
  },
  {
    id: 'br_tawa_parantha',
    name: 'Tawa Parantha',
    description: 'Multi-layered, flaky whole wheat flatbread roasted with ghee.',
    tag: 'VEGETARIAN',
    prices: { single: 2.25, unitText: 'each' },
    allergens: ['Gluten'],
    image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&q=80&w=200&h=200'
  },
  {
    id: 'br_masala_poori',
    name: 'Masala Poori',
    description: 'Deep-fried puffed whole wheat bread lightly spiced with red chili and carom seeds.',
    tag: 'VEGETARIAN',
    prices: { single: 1.50, unitText: 'each' },
    allergens: ['Gluten'],
    image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&q=80&w=200&h=200'
  }
];

export const RICE: MenuItem[] = [
  {
    id: 'rc_plain_rice',
    name: 'Plain Rice',
    description: 'Premium steamed extra-long grain white Basmati rice.',
    tag: 'VEGETARIAN',
    prices: { third: 30, half: 55, full: 95 },
    allergens: [],
    image: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&q=80&w=200&h=200'
  },
  {
    id: 'rc_jeera_rice',
    name: 'Jeera Rice',
    description: 'Aromatic Basmati rice tempered with cumin seeds and pure ghee.',
    tag: 'VEGETARIAN',
    prices: { third: 35, half: 65, full: 120 },
    allergens: ['Dairy'],
    image: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&q=80&w=200&h=200'
  },
  {
    id: 'rc_peas_pulao',
    name: 'Peas Pulao',
    description: 'Fragrant saffron-tinted Basmati rice cooked with sweet green peas and mild spices.',
    tag: 'VEGETARIAN',
    prices: { third: 40, half: 75, full: 140 },
    allergens: ['Dairy'],
    image: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&q=80&w=200&h=200'
  },
  {
    id: 'rc_sabz_biryani',
    name: 'Tarkari Sabz Biryani',
    description: 'Long-grain Basmati rice layered with mixed vegetables, herbs, rose water, and pure saffron strings.',
    tag: 'CONTAINS NUTS',
    prices: { third: 65, half: 125, full: 240 },
    allergens: ['Dairy', 'Tree Nuts'],
    image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&q=80&w=200&h=200'
  }
];

export const SIDES_ACCOMPANIMENTS: MenuItem[] = [
  {
    id: 'sd_green_salad',
    name: 'Green Salad',
    description: 'Sliced cucumbers, carrots, onions, tomatoes, and green chilies served with lemon wedges.',
    tag: 'VEGETARIAN',
    prices: { third: 20, half: 35, full: 60 },
    allergens: [],
    image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&q=80&w=200&h=200'
  },
  {
    id: 'sd_kachumber_salad',
    name: 'Kachumber Salad',
    description: 'Diced cucumbers, tomatoes, and red onions tossed with fresh cilantro, lemon juice, and chaat masala.',
    tag: 'VEGETARIAN',
    prices: { third: 25, half: 45, full: 75 },
    allergens: [],
    image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&q=80&w=200&h=200'
  },
  {
    id: 'sd_sirka_pyaaz',
    name: 'Sirka Pyaaz',
    description: 'Tangy, baby pickling pearl onions soaked in vinegar and salt solution.',
    tag: 'VEGETARIAN',
    prices: { third: 20, half: 35, full: 60 },
    allergens: [],
    image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&q=80&w=200&h=200'
  },
  {
    id: 'sd_masala_papad',
    name: 'Masala Papad',
    description: 'Roasted crisp papadums topped with chopped onions, tomatoes, cilantro, and red chili spice.',
    tag: 'VEGETARIAN',
    prices: { third: 30, half: 55, full: 95 },
    allergens: [],
    image: 'https://images.unsplash.com/photo-1605666804797-40ad6efc5643?auto=format&fit=crop&q=80&w=200&h=200'
  },
  {
    id: 'sd_boondi_raita',
    name: 'Boondi Raita',
    description: 'Whipped spiced yogurt with tiny crispy chickpea flour droplets, roasted cumin, and mint.',
    tag: 'VEGETARIAN',
    prices: { third: 30, half: 55, full: 95 },
    allergens: ['Dairy'],
    image: 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?auto=format&fit=crop&q=80&w=200&h=200'
  },
  {
    id: 'sd_cucumber_raita',
    name: 'Cucumber Raita',
    description: 'Refreshing whipped yogurt combined with grated cucumbers, black salt, and dry mint.',
    tag: 'VEGETARIAN',
    prices: { third: 30, half: 55, full: 95 },
    allergens: ['Dairy'],
    image: 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?auto=format&fit=crop&q=80&w=200&h=200'
  }
];

export const BEVERAGES: MenuItem[] = [
  {
    id: 'bv_masala_shikanji',
    name: 'Masala Shikanji',
    description: 'Traditional spiced Indian lemonade infused with cumin, black salt, and fresh mint.',
    tag: 'VEGETARIAN',
    prices: { single: 2.50, gallon: 25, unitText: 'Guest' },
    allergens: [],
    image: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&q=80&w=200&h=200'
  },
  {
    id: 'bv_aam_panna',
    name: 'Aam Panna',
    description: 'Tangy raw green mango beverage seasoned with roasted cumin powder, black salt, and sugar.',
    tag: 'VEGETARIAN',
    prices: { single: 3.00, gallon: 35, unitText: 'Guest' },
    allergens: [],
    image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&q=80&w=200&h=200'
  },
  {
    id: 'bv_rose_sharbat',
    name: 'Rose Sharbat',
    description: 'Chilled sweet milk drink scented with premium rose petal extract syrup.',
    tag: 'VEGETARIAN',
    prices: { single: 3.00, gallon: 35, unitText: 'Guest' },
    allergens: ['Dairy'],
    image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&q=80&w=200&h=200'
  },
  {
    id: 'bv_mango_lassi',
    name: 'Mango Lassi',
    description: 'Creamy yogurt beverage blended with sweet mango pulp, milk, sugar, and cardamon.',
    tag: 'VEGETARIAN',
    prices: { single: 4.50, gallon: 50, unitText: 'Guest' },
    allergens: ['Dairy'],
    image: 'https://images.unsplash.com/photo-1571006831670-4b92367abbd6?auto=format&fit=crop&q=80&w=200&h=200'
  },
  {
    id: 'bv_mint_chaach',
    name: 'Mint Chaach',
    description: 'Salted, spiced buttermilk blended with freshly pureed mint leaves and roasted cumin powder.',
    tag: 'VEGETARIAN',
    prices: { single: 2.50, gallon: 25, unitText: 'Guest' },
    allergens: ['Dairy'],
    image: 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?auto=format&fit=crop&q=80&w=200&h=200'
  }
];

export const CAKES_DESSERTS: MenuItem[] = [
  {
    id: 'cd_custom_cakes',
    name: 'Custom Celebration Cakes',
    description: 'Exquisite theme-designed milestone cakes, wedding cakes, or party cakes built to order.',
    tag: 'VEGETARIAN',
    prices: { single: 65, customText: 'Starting at $65', unitText: 'each' },
    allergens: ['Dairy', 'Gluten'],
    image: 'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?auto=format&fit=crop&q=80&w=200&h=200'
  },
  {
    id: 'cd_paan_laddoo',
    name: 'Paan Laddoo',
    description: 'Refreshing sweet betel leaf and condensed milk spheres filled with gulkand (rose jam).',
    tag: 'CONTAINS NUTS',
    prices: { single: 3.00, unitText: 'each' },
    allergens: ['Dairy', 'Tree Nuts'],
    image: 'https://images.unsplash.com/photo-1505253685822-fe48b59cfc8f?auto=format&fit=crop&q=80&w=200&h=200'
  },
  {
    id: 'cd_cake_pops',
    name: 'Cake Pops',
    description: 'Charming round cake bites on sticks, dipped in premium chocolate and decorated.',
    tag: 'VEGETARIAN',
    prices: { single: 2.50, customText: 'Starting at $2.50 each', unitText: 'each' },
    allergens: ['Dairy', 'Gluten'],
    image: 'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?auto=format&fit=crop&q=80&w=200&h=200'
  },
  {
    id: 'cd_cookie_fries',
    name: 'Cookie Fries with Dips',
    description: 'Crunchy cookie batons styled like fries, served with matching chocolate or sweet syrup dips.',
    tag: 'VEGETARIAN',
    prices: { single: 18.00, unitText: 'dozen' },
    allergens: ['Dairy', 'Gluten'],
    image: 'https://images.unsplash.com/photo-1601356616077-695728ecf769?auto=format&fit=crop&q=80&w=200&h=200'
  },
  {
    id: 'cd_cake_jars',
    name: 'Cake Jars',
    description: 'Individually layered portable jars containing moist sponge cake, fillings, and matching frosting.',
    tag: 'VEGETARIAN',
    prices: { minPrice: 6, maxPrice: 8, customText: '$6–$8 each', unitText: 'each' },
    allergens: ['Dairy', 'Gluten'],
    image: 'https://images.unsplash.com/photo-1601356616077-695728ecf769?auto=format&fit=crop&q=80&w=200&h=200'
  },
  {
    id: 'cd_dessert_cups',
    name: 'Dessert Cups',
    description: 'Miniature luxury visual layers of mousse, cheese-cake, or custom Indian fusion sweets in cups.',
    tag: 'VEGETARIAN',
    prices: { minPrice: 5, maxPrice: 8, customText: '$5–$8 each', unitText: 'each' },
    allergens: ['Dairy', 'Gluten'],
    image: 'https://images.unsplash.com/photo-1601356616077-695728ecf769?auto=format&fit=crop&q=80&w=200&h=200'
  }
];

export const DESSERT_TRAYS: MenuItem[] = [
  {
    id: 'dt_gulab_jamun',
    name: 'Gulab Jamun (Tray)',
    description: 'Classic warm milk solids dumplings soaked in a cardamom and rose water infused sugar syrup.',
    tag: 'VEGETARIAN',
    prices: { third: 40, half: 75, full: 140 },
    allergens: ['Dairy', 'Gluten'],
    image: 'https://images.unsplash.com/photo-1528751003873-ac9700ac7f31?auto=format&fit=crop&q=80&w=200&h=200'
  },
  {
    id: 'dt_rasmalai',
    name: 'Rasmalai (Tray)',
    description: 'Soft cottage cheese round patties soaked in thick, chilled sweetened milk spiced with cardamom and saffron.',
    tag: 'CONTAINS NUTS',
    prices: { third: 60, half: 110, full: 210 },
    allergens: ['Dairy', 'Tree Nuts'],
    image: 'https://images.unsplash.com/photo-1505253685822-fe48b59cfc8f?auto=format&fit=crop&q=80&w=200&h=200'
  },
  {
    id: 'dt_shahi_tukda',
    name: 'Shahi Tukda (Tray)',
    description: 'Opulent crispy fried bread slices soaked in fragrant sugar syrup, topped with rich rabri and pistachios.',
    tag: 'CONTAINS NUTS',
    prices: { third: 65, half: 125, full: 235 },
    allergens: ['Dairy', 'Gluten', 'Tree Nuts'],
    image: 'https://images.unsplash.com/photo-1626132647523-66f5bf380027?auto=format&fit=crop&q=80&w=200&h=200'
  },
  {
    id: 'dt_malpua_rabri',
    name: 'Malpua Rabri (Tray)',
    description: 'Traditional fried mini pancakes dipped in syrup, served with creamy cardamom reduction milk.',
    tag: 'CONTAINS NUTS',
    prices: { third: 75, half: 140, full: 270 },
    allergens: ['Dairy', 'Gluten', 'Tree Nuts'],
    image: 'https://images.unsplash.com/photo-1528751003873-ac9700ac7f31?auto=format&fit=crop&q=80&w=200&h=200'
  }
];

export const SPECIALS: MenuItem[] = [
  {
    id: 'sp_bedmi_aloo',
    name: 'Bedmi Poori Aloo (4 Poori)',
    description: 'Crispy lentil-stuffed puffed breads served with spicy traditional potato curry.',
    tag: 'VEGETARIAN',
    prices: { single: 8.99, unitText: 'person' },
    allergens: ['Gluten'],
    image: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?auto=format&fit=crop&q=80&w=200&h=200'
  },
  {
    id: 'sp_chole_bhature',
    name: 'Chole Bhature (2 Bhature)',
    description: 'Vibrant dark chana masala paired with fluffy, deep-fried leavened flatbreads.',
    tag: 'VEGETARIAN',
    prices: { single: 9.99, unitText: 'person' },
    allergens: ['Gluten', 'Dairy'],
    image: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&q=80&w=200&h=200'
  },
  {
    id: 'sp_matar_kulcha',
    name: 'Matar Kulcha (2 Kulcha)',
    description: 'Spiced white peas dry curry served with soft flatbreads topped with butter.',
    tag: 'VEGETARIAN',
    prices: { single: 8.99, unitText: 'person' },
    allergens: ['Gluten', 'Dairy'],
    image: 'https://images.unsplash.com/photo-1601050690597-df056fb4ce78?auto=format&fit=crop&q=80&w=200&h=200'
  },
  {
    id: 'sp_stuffed_paranthas',
    name: 'Stuffed Paranthas (2 Paranthas)',
    description: 'Spiced wheat bread flatbreads stuffed with choices of potato, paneer, or cauliflower, served with butter & pickle.',
    tag: 'VEGETARIAN',
    prices: { single: 7.99, unitText: 'person' },
    allergens: ['Gluten', 'Dairy'],
    image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&q=80&w=200&h=200'
  },
  {
    id: 'sp_satvik_food',
    name: 'Satvik Pooja Food',
    description: 'Pure satvik, traditional food options made with no onions and no garlic, custom tailored for your poojas.',
    tag: 'VEGETARIAN',
    prices: { customText: 'Custom Quote' },
    allergens: [],
    image: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&q=80&w=200&h=200'
  }
];

export const LIVE_COUNTERS: MenuItem[] = [
  {
    id: 'lc_pani_puri',
    name: 'Pani Puri Station',
    description: 'Live interactive counter providing custom spiced flavored waters, hollow puris and fresh fillings.',
    tag: 'VEGETARIAN',
    prices: { single: 7.00, unitText: 'person' },
    minGuests: 30,
    allergens: ['Gluten'],
    image: 'https://images.unsplash.com/photo-1601050690597-df056fb4ce78?auto=format&fit=crop&q=80&w=200&h=200'
  },
  {
    id: 'lc_chaat_station',
    name: 'Chaat Station (2 Items)',
    description: 'Choose any two signature chaats assembled fresh on-site in an interactive guest live experience.',
    tag: 'VEGETARIAN',
    prices: { minPrice: 8, maxPrice: 10, customText: '$8–$10 per person', unitText: 'person' },
    minGuests: 30,
    allergens: ['Dairy', 'Gluten'],
    image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&q=80&w=200&h=200'
  },
  {
    id: 'lc_premium_chaat',
    name: 'Premium Chaat Station (4 Items)',
    description: 'Indulge guests with an interactive live counter presenting four signature street food options.',
    tag: 'VEGETARIAN',
    prices: { minPrice: 10, maxPrice: 14, customText: '$10–$14 per person', unitText: 'person' },
    minGuests: 50,
    allergens: ['Dairy', 'Gluten'],
    image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&q=80&w=200&h=200'
  },
  {
    id: 'lc_pav_bhaji',
    name: 'Pav Bhaji Station',
    description: 'Warm thick spiced vegetable mash sautéed live on giant tawas and served on butter toasted pavs.',
    tag: 'VEGETARIAN',
    prices: { single: 8.00, unitText: 'person' },
    minGuests: 30,
    allergens: ['Dairy', 'Gluten'],
    image: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?auto=format&fit=crop&q=80&w=200&h=200'
  },
  {
    id: 'lc_vada_pav',
    name: 'Vada Pav Station',
    description: 'Hot, golden fried potato dumpling sliders assembled live with dry garlic and sweet tamarind powders.',
    tag: 'VEGETARIAN',
    prices: { single: 9.00, unitText: 'person' },
    minGuests: 30,
    allergens: ['Gluten', 'Dairy'],
    image: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?auto=format&fit=crop&q=80&w=200&h=200'
  },
  {
    id: 'lc_chinese_station',
    name: 'Indo-Chinese Station',
    description: 'Stir-fried noodles, hot chili paneer, or vegetable Manchurian tossed live in a high flame wok.',
    tag: 'VEGETARIAN',
    prices: { minPrice: 8, maxPrice: 10, customText: '$8–$10 per person', unitText: 'person' },
    minGuests: 30,
    allergens: ['Gluten', 'Soy', 'Dairy'],
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=200&h=200'
  }
];

export const PORTION_GUIDES: PortionOption[] = [
  {
    size: 'Third Tray',
    serves: 'Serves 8–12',
    description: 'Ideal for small intimate gatherings or family dinners.'
  },
  {
    size: 'Half Tray',
    serves: 'Serves 15–20',
    description: 'Perfect for standard dinner parties and larger celebrations.'
  },
  {
    size: 'Full Tray',
    serves: 'Serves 30–40',
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
