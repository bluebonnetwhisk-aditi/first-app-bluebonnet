export interface CollectionItem {
  id: string;
  title: string;
  description: string;
  tags?: string[];
  buttonText: string;
  image: string;
  items?: string[];
}

export interface FlavorCategory {
  title: string;
  icon: string;
  flavors: string[];
  bgStyle: string;
}

export interface CateringPackage {
  id: string;
  title: string;
  tagline: string;
  description: string;
  minGuests: number;
  pricePerGuest: number;
  highlights: string[];
  image: string;
}

export interface GiftingItem {
  id: string;
  title: string;
  description: string;
  price: string;
  tags: string[];
  image: string;
}

export const collectionsData: CollectionItem[] = [
  {
    id: "custom-cakes",
    title: "Custom Celebration Cakes",
    description: "Made-to-order cakes for birthdays, anniversaries, and milestones. Theme Cakes, Kids Birthdays, and Elegant Florals.",
    tags: ["Custom Design", "Theme Decors", "Eggless Options"],
    buttonText: "VIEW GALLERY",
    image: "src/assets/images/custom_celebration_cakes_1781194977914.jpg",
    items: ["Butterscotch Drizzle", "Racing Legend", "Jungle Adventure", "Berry Chantilly"]
  },
  {
    id: "indian-fusion",
    title: "Indian Fusion Cakes",
    description: "Featuring Rasmalai, Gulab Jamun, and Mango Mastani. High-end pastries with opulent traditional spices.",
    tags: ["Saffron Milk", "Cardamom Crumble", "Sweets Topping"],
    buttonText: "VIEW GALLERY",
    image: "src/assets/images/indian_fusion_cakes_1781194990456.jpg",
    items: ["Gulab Jamun Indulgence", "Rasmalai Royalty", "Mango Cake"]
  },
  {
    id: "indian-fusion-desserts",
    title: "Indian Fusion Desserts",
    description: "Cake Jars & Mini Cake Loaves. Jar Flavors: Gulab Jamun, Rasmalai, Mango, Makhan Malai, and Pistachio.",
    tags: ["Dessert Jars", "Individual Portion", "Gifting Favourite"],
    buttonText: "VIEW GALLERY",
    image: "src/assets/images/cake_jars_mini_loaves_1781195014914.jpg"
  },
  {
    id: "cupcakes-pops",
    title: "Cupcakes & Cake Pops",
    description: "Bite-sized treats, big smiles! Our custom cupcakes and cake pops are loved by kids and adults alike, making every celebration a little sweeter.",
    tags: ["Bite-Sized", "Party Platters", "Colorful Designs"],
    buttonText: "EXPLORE",
    image: "src/assets/images/cupcakes_cake_pops_1781195003119.jpg"
  },
  {
    id: "jars-mini-loaves",
    title: "Cake Jars & Mini Cake Loaves",
    description: "Individual elegance. Strawberry, Chocolate Pistachio, Funfetti, Chocolate, Tiramisu, and Seasonal Specials.",
    tags: ["Layered Goodness", "Gift Bundles", "Baking Cups"],
    buttonText: "DETAILS",
    image: "src/assets/images/cake_jars_mini_loaves_1781195014914.jpg"
  }
];

export const flavorCategories: FlavorCategory[] = [
  {
    title: "Classic Flavors",
    icon: "Cake",
    flavors: ["Chocolate Truffle", "Vanilla Bean", "Strawberry Cream", "Classic Red Velvet"],
    bgStyle: "bg-white text-gray-900 border-l-4 border-primary-brand"
  },
  {
    title: "Premium & Gourmet",
    icon: "Sparkles",
    flavors: ["Belgian Chocolate", "Ferrero Rocher", "Lotus Biscoff", "Salted Caramel"],
    bgStyle: "bg-white text-gray-900 border-l-4 border-secondary-brand"
  },
  {
    title: "Indian Fusion",
    icon: "Utensils",
    flavors: ["Rasmalai Cake", "Gulab Jamun Cake", "Rose Milk Cake", "Kesar Pista Delight"],
    bgStyle: "bg-primary-brand text-white border-l-4 border-brand-gold-tint"
  },
  {
    title: "Fruity & Light",
    icon: "Cherry",
    flavors: ["Mango Cream", "Blueberry Cheesecake", "Pineapple Delight"],
    bgStyle: "bg-white text-gray-900 border-l-4 border-brand-rose-dark"
  },
  {
    title: "Kids & Fun",
    icon: "PartyPopper",
    flavors: ["Funfetti", "Cotton Candy", "Nutella Surprise"],
    bgStyle: "bg-white text-gray-900 border-l-4 border-brand-pistachio-dark"
  }
];

export const cateringPackages: CateringPackage[] = [
  {
    id: "royal-fusion",
    title: "Royal Indian Fusion Feast",
    tagline: "Our Signature Luxury Experience",
    description: "An opulent multi-tier dessert table pairing gorgeous floral celebration cakes with individual rasmalai jars, cardamon cake pops, and custom gulab jamun tarts. Complete with heritage gold tier stands and customized floral arrangements.",
    minGuests: 30,
    pricePerGuest: 18,
    highlights: ["Custom 3-Tier Theme Cake", "Assorted Fusion Dessert Jars", "Artisanal Cake Pops & Tarts", "Premium Setup and Floral Accents", "100% Eggless customization available"],
    image: "src/assets/images/hero_cakes_desserts_1781194959946.jpg"
  },
  {
    id: "gourmet-high-tea",
    title: "Artisanal Celebration High-Tea",
    tagline: "Perfect for Showers & Afternoon Soirees",
    description: "A sophisticated Western high-tea with an exotic Eastern twist. Includes elegant miniature tea cakes, mango cream spoons, pistachio cake pops, and custom macarons layered with real saffron buttercream.",
    minGuests: 15,
    pricePerGuest: 14,
    highlights: ["Saffron Buttercream Macarons", "Miniature Pistachio Tea Cakes", "Fresh Fruit Cream Tartlets", "Luxury Selection of Indian Chai & Herbal Teas"],
    image: "src/assets/images/cupcakes_cake_pops_1781195003119.jpg"
  },
  {
    id: "sweet-celebration-station",
    title: "Festival Celebration Station",
    tagline: "Tailored for Diwali, Eid, Holi & Weddings",
    description: "A show-stopping dessert bar featuring live-chef styling, decorative brass ware, and traditional flower petals. Highlighted by our signature warm Rose Milk cakes, pistachio milk shots, and hand-delivered gourmet fusion cookies.",
    minGuests: 50,
    pricePerGuest: 22,
    highlights: ["Live-Plated Rose Milk Cakes", "Pistachio Milk Shots", "Diwali Theme Fondant Toppers", "Full Traditional Decor Setup"],
    image: "src/assets/images/indian_fusion_cakes_1781194990456.jpg"
  }
];

export const giftingBoxes: GiftingItem[] = [
  {
    id: "festive-royal",
    title: "The Regal Festive Assortment",
    description: "An elegant, gold-embossed heritage chest filled with 4 signature fusion cake jars (Rasmalai, Gulab Jamun, Mango, and Pistachio) and 6 gourmet fusion cookies. Styled with traditional marigold motifs and premium ribbons.",
    price: "45.00",
    tags: ["Best Seller", "Diwali & Eid Specials", "Gift Ready"],
    image: "src/assets/images/cake_jars_mini_loaves_1781195014914.jpg"
  },
  {
    id: "fusion-trio",
    title: "Indian Fusion Cake Jar Trio",
    description: "Three handcrafted individual cake jars layered with light, moist cardamom sponge and traditional saffron syrup. Flavors: Rasmalai Royale, Gulab Jamun Indulgence, and Kesar Pista Delight.",
    price: "24.00",
    tags: ["Eggless Available", "Tasting Set", "Travel Friendly"],
    image: "src/assets/images/cake_jars_detail_1_1781195027694.jpg"
  },
  {
    id: "artisanal-cookie-box",
    title: "Artisanal Gourmet Cookie Box",
    description: "Freshly-baked thick gourmet cookies infused with cardamon and rose petals, stuffed with premium white chocolate, roasted pistachios, and rich chocolate ganache. Includes Strawberry, Blueberry, and Double Chocolate Pistachio.",
    price: "20.00",
    tags: ["Limited Edition", "Perfect High Tea"],
    image: "src/assets/images/cake_jars_detail_2_1781195040371.jpg"
  }
];

export type DietaryTag = 'VEGETARIAN' | 'CONTAINS NUTS' | 'GLUTEN FREE' | 'EGGLESS' | 'NONE';

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  tag: DietaryTag;
  prices: {
    third?: number; // 1/3 Tray
    half?: number;  // 1/2 Tray
    full?: number;  // Full Tray
    single?: number; // Per Piece or Per Serving
    unitText?: string; // e.g., "Piece", "serving"
  };
  allergens?: string[];
  image?: string;
}

export interface BreadItem {
  id: string;
  name: string;
  description: string;
  price: number;
  allergens?: string[];
  image?: string;
}

export interface DessertItem {
  id: string;
  name: string;
  description: string;
  prices: {
    third: number;
    half: number;
    full: number;
  };
  allergens?: string[];
  image?: string;
}

export interface SideItem {
  id: string;
  name: string;
  description: string;
  tag?: DietaryTag;
  prices: {
    third?: number;
    half?: number;
    full?: number;
    single?: number;
    unitText?: string;
  };
  allergens?: string[];
  image?: string;
}

export interface DrinkItem {
  id: string;
  name: string;
  price: number;
  unitText: string;
  allergens?: string[];
  image?: string;
}

export interface PortionOption {
  size: 'Third Tray' | 'Half Tray' | 'Full Tray';
  serves: string;
  description: string;
}

export interface ServiceAddon {
  id: string;
  name: string;
  description: string;
  priceText: string;
  basePrice: number;
}

export interface SelectedItem {
  id: string;
  name: string;
  category: 'Main Course' | 'Breads' | 'Desserts' | 'Sides' | 'Drinks';
  size?: '1/3' | '1/2' | 'Full' | 'Single';
  price: number;
  quantity: number;
}

