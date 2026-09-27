import { useState } from "react";
import { 
  Sparkles, 
  X, 
  MessageSquare, 
  UtensilsCrossed, 
  Cake as CakeIcon, 
  Flame, 
  Gift, 
  Camera 
} from "lucide-react";

interface GalleryItem {
  id: string;
  title: string;
  category: "cakes" | "catering" | "live_counters" | "hampers" | "events";
  categoryLabel: string;
  occasion: string;
  description: string;
  imageSrc: string;
  tags: string[];
  featured?: boolean;
}

const GALLERY_ITEMS: GalleryItem[] = [
  {
    id: "1",
    title: "Custom 3-Tier Rasmalai Celebration Cake",
    category: "cakes",
    categoryLabel: "Cakes & Patisserie",
    occasion: "1st Birthday Party • Frisco, TX",
    description: "Saffron cardamom sponge soaked in rabri, decorated with edible gold leaf, fresh rose petals, and pistachios.",
    imageSrc: "src/assets/images/custom_celebration_cakes_1781194977914.jpg",
    tags: ["Eggless", "Rasmalai", "Custom Cake", "Gold Leaf"],
    featured: true
  },
  {
    id: "2",
    title: "Royal North Indian Feast Platter Set",
    category: "catering",
    categoryLabel: "Catering Trays & Feasts",
    occasion: "Wedding Sangeet • Plano, TX",
    description: "Paneer Butter Masala, Dal Makhani slow-cooked for 16 hours, Jeera Rice, and fresh tandoori rotis.",
    imageSrc: "src/assets/images/BlueBonnet Catering.jpeg",
    tags: ["North Indian", "Hot Catering", "Vegetarian Feasts"],
    featured: true
  },
  {
    id: "3",
    title: "Live Dosa & Indo-Chinese Station Setup",
    category: "live_counters",
    categoryLabel: "Live Counter Setups",
    occasion: "Anniversary Gala • Little Elm, TX",
    description: "Interactive live cooking station featuring paper-thin Mysore Masala Dosas and Chilli Paneer made fresh to order.",
    imageSrc: "src/assets/images/BlueBonnet Whisk Booth BackdropCustom Cakes and Bakes BannerFusion Desserts & Custom Creations BackdropHomemade Goodness, Baked with Love Display (1).jpg",
    tags: ["Live Counter", "Chef Managed", "Made-to-Order"],
    featured: true
  },
  {
    id: "4",
    title: "Diwali Luxe Sweet & Savory Hamper",
    category: "hampers",
    categoryLabel: "Festival Hampers",
    occasion: "Corporate Festive Gifting • Dallas, TX",
    description: "Handcrafted fusion mithais, spiced gourmet nuts, and artisan cookies packaged in luxury magnetic gift boxes.",
    imageSrc: "src/assets/images/diwali_luxe_hamper.png",
    tags: ["Festival Hamper", "Diwali", "Luxe Packaging"]
  },
  {
    id: "5",
    title: "Gulab Jamun & Mango Dessert Shooters Display",
    category: "cakes",
    categoryLabel: "Cakes & Patisserie",
    occasion: "Engagement Party • Allen, TX",
    description: "Individual dessert cups layered with cardamom mousse, mango pulp, and soft gulab jamuns.",
    imageSrc: "src/assets/images/dessert_cups.png",
    tags: ["Fusion Shooters", "Dessert Bar", "Party Cups"]
  },
  {
    id: "6",
    title: "Live Chaat Counter & Pani Puri Station",
    category: "live_counters",
    categoryLabel: "Live Counter Setups",
    occasion: "Baby Shower • Southlake, TX",
    description: "Crispy puris filled with spiced mint water, sweet tamarind chutney, and potato chickpea filling served live.",
    imageSrc: "src/assets/images/BlueBonnet Whisk Booth BackdropCustom Cakes and Bakes BannerFusion Desserts & Custom Creations BackdropHomemade Goodness, Baked with Love Display.jpg",
    tags: ["Live Chaat", "Pani Puri Bar", "Interactive Food"]
  },
  {
    id: "7",
    title: "Ganesh Chaturthi Pooja Sweets Tray",
    category: "hampers",
    categoryLabel: "Festival Hampers",
    occasion: "Family Pooja • McKinney, TX",
    description: "Traditional Ukadiche Modak, dry fruit pedas, and kesar laddus presented on handcrafted wooden platters.",
    imageSrc: "src/assets/images/ganpati_pooja_gift.png",
    tags: ["Modak", "Pooja Box", "Traditional Sweets"]
  },
  {
    id: "8",
    title: "Artisan Tandoori Bread & Naan Basket",
    category: "catering",
    categoryLabel: "Catering Trays & Feasts",
    occasion: "Housewarming Dinner • Prosperity, TX",
    description: "Freshly baked garlic naans, butter kulchas, and missi rotis wrapped in traditional cloth baskets.",
    imageSrc: "src/assets/images/indian_breads_basket_1781192845941.png",
    tags: ["Tandoori Breads", "Garlic Naan", "Fresh Bakes"]
  },
  {
    id: "9",
    title: "Thick-Style Gourmet Stuffed Cookie Batch",
    category: "cakes",
    categoryLabel: "Cakes & Patisserie",
    occasion: "Kids Birthday Party • Frisco, TX",
    description: "Lotus Biscoff and Nutella stuffed giant cookies hand-rolled with organic European butter.",
    imageSrc: "src/assets/images/stuffed_cookies.png",
    tags: ["Gourmet Cookies", "Nutella", "Biscoff"]
  },
  {
    id: "10",
    title: "Bluebonnet Whisk Event Backdrop & Tasting Table",
    category: "events",
    categoryLabel: "Real Events & Celebrations",
    occasion: "Community Tasting Showcase • DFW",
    description: "Our signature luxury farmhouse backdrop and cake tasting display setup at local culinary expos.",
    imageSrc: "src/assets/images/Bluebonnet Whisk Farmhouse Luxe Backdrop.png",
    tags: ["Backdrop", "Tasting Showcase", "DFW Events"]
  },
  {
    id: "11",
    title: "Layered Indian Fusion Cake Jars",
    category: "cakes",
    categoryLabel: "Cakes & Patisserie",
    occasion: "Return Favors • Coppell, TX",
    description: "Individual glass jars filled with pistachio cake layers, rose syrup, and rabri cream.",
    imageSrc: "src/assets/images/fusion_cake_jars.png",
    tags: ["Cake Jars", "Return Favors", "Personalized"]
  },
  {
    id: "12",
    title: "Raksha Bandhan Luxury Sweet Box",
    category: "hampers",
    categoryLabel: "Festival Hampers",
    occasion: "Rakhi Celebration • Irving, TX",
    description: "Artisan sweets assortment paired with custom designer Rakhis and personalized greeting notes.",
    imageSrc: "src/assets/images/rakhi_gift_box.png",
    tags: ["Rakhi Box", "Gift Hamper", "Handcrafted Mithai"]
  }
];

export default function GalleryPage() {
  const [activeTab, setActiveTab] = useState<string>("all");
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);

  const filteredItems = activeTab === "all" 
    ? GALLERY_ITEMS 
    : GALLERY_ITEMS.filter(item => item.category === activeTab);

  const handleOpenSMS = (itemTitle: string) => {
    window.location.href = `sms:+19455274566?body=Hi!%20I'm%20interested%20in%20ordering%20something%20similar%20to%20${encodeURIComponent(itemTitle)}.`;
  };

  return (
    <div className="bg-[#fbfbfa] min-h-screen py-10 lg:py-16 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 bg-[#ffdea5]/40 text-[#775a19] px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-4 border border-[#775a19]/20">
            <Camera className="w-3.5 h-3.5 text-[#775a19]" />
            <span>Culinary &amp; Patisserie Portfolio</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#00346f] tracking-tight mb-4">
            Our Work &amp; Event Showcase
          </h1>
          <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
            Explore photos of handcrafted celebration cakes, authentic North Indian catering spreads, live counters, and festival luxury hampers supplied across Dallas-Fort Worth.
          </p>
          <div className="h-0.5 w-16 bg-[#775a19] mt-6 mx-auto" />
        </div>

        {/* Category Filters Bar */}
        <div className="flex items-center justify-center gap-2 flex-wrap mb-10">
          {[
            { id: "all", label: "All Works", icon: Sparkles },
            { id: "cakes", label: "Cakes & Patisserie", icon: CakeIcon },
            { id: "catering", label: "Catering Trays & Feasts", icon: UtensilsCrossed },
            { id: "live_counters", label: "Live Counters", icon: Flame },
            { id: "hampers", label: "Festival Hampers", icon: Gift },
            { id: "events", label: "Real Events", icon: Camera }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`inline-flex items-center gap-2 min-h-[40px] px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  isActive
                    ? "bg-[#00346f] text-white shadow-sm ring-1 ring-[#ffdea5]/40"
                    : "bg-white text-gray-700 hover:text-[#00346f] hover:bg-gray-50 border border-gray-200"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? "text-[#ffdea5]" : "text-gray-400"}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Gallery Bento Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              onClick={() => setSelectedItem(item)}
              className="group bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col cursor-pointer hover:-translate-y-1"
            >
              {/* Image Container */}
              <div className="relative h-64 sm:h-72 overflow-hidden bg-gray-100">
                <img
                  src={item.imageSrc}
                  alt={item.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    // Fallback image if local path breaks
                    (e.target as HTMLImageElement).src = "src/assets/images/BlueBonnet Catering.jpeg";
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
                
                {/* Category Badge */}
                <div className="absolute top-3 left-3 bg-[#00346f]/90 text-white backdrop-blur-md px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider font-sans border border-white/20">
                  {item.categoryLabel}
                </div>

                {/* Occasion Overlay */}
                <div className="absolute bottom-3 left-3 right-3 text-white">
                  <span className="text-[11px] font-bold text-[#ffdea5] tracking-wider uppercase block font-sans drop-shadow-xs">
                    {item.occasion}
                  </span>
                  <h3 className="font-serif text-lg font-bold leading-tight drop-shadow-xs text-white group-hover:text-[#ffdea5] transition-colors">
                    {item.title}
                  </h3>
                </div>
              </div>

              {/* Card Footer / Tags */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <p className="text-gray-600 text-xs leading-relaxed line-clamp-2">
                  {item.description}
                </p>

                <div className="flex flex-wrap gap-1.5 pt-2 border-t border-gray-100">
                  {item.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[10px] font-sans font-semibold bg-gray-50 border border-gray-200 text-gray-600 px-2.5 py-0.5 rounded-full"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Modal / Lightbox for selected item */}
        {selectedItem && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-fade-in">
            <div 
              className="bg-white rounded-2xl max-w-3xl w-full overflow-hidden shadow-2xl relative animate-scale-up border border-gray-100"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedItem(null)}
                className="absolute top-4 right-4 z-10 bg-black/50 hover:bg-black text-white p-2 rounded-full backdrop-blur-md transition-colors cursor-pointer"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="grid grid-cols-1 sm:grid-cols-2">
                <div className="relative h-72 sm:h-full bg-gray-900">
                  <img
                    src={selectedItem.imageSrc}
                    alt={selectedItem.title}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>

                <div className="p-6 sm:p-8 flex flex-col justify-between space-y-6">
                  <div>
                    <span className="text-[11px] font-bold text-[#775a19] uppercase tracking-widest block mb-1">
                      {selectedItem.categoryLabel} • {selectedItem.occasion}
                    </span>
                    <h2 className="font-serif text-2xl font-bold text-[#00346f] mb-3 leading-snug">
                      {selectedItem.title}
                    </h2>
                    <p className="text-gray-600 text-xs sm:text-sm leading-relaxed mb-4">
                      {selectedItem.description}
                    </p>

                    <div className="flex flex-wrap gap-2 mb-6">
                      {selectedItem.tags.map((tag) => (
                        <span key={tag} className="text-xs font-semibold bg-[#ffdea5]/30 text-[#775a19] px-3 py-1 rounded-full border border-[#775a19]/20">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3 pt-4 border-t border-gray-100">
                    <p className="text-[11px] text-gray-500 font-medium">
                      Like this setup? Get in touch with our team for custom ordering or tailoring to your party size.
                    </p>
                    <button
                      onClick={() => handleOpenSMS(selectedItem.title)}
                      className="w-full min-h-[44px] inline-flex items-center justify-center gap-2 bg-[#00346f] hover:bg-[#00224d] text-white font-sans text-xs uppercase tracking-widest font-bold px-6 py-3 rounded-xl shadow-md transition-all cursor-pointer"
                    >
                      <MessageSquare className="w-4 h-4 text-[#ffdea5]" />
                      <span>Inquire About Similar Order</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Bottom Banner Callout */}
        <div className="mt-16 bg-[#00346f] text-white rounded-2xl p-8 sm:p-10 text-center shadow-lg relative overflow-hidden">
          <div className="relative z-10 max-w-2xl mx-auto space-y-4">
            <span className="text-[11px] font-bold tracking-widest text-[#ffdea5] uppercase block font-sans">
              Handcrafted Culinary Artistry • DFW Area
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Have a Specific Design or Catering Menu in Mind?
            </h2>
            <p className="text-gray-200 text-xs sm:text-sm leading-relaxed font-sans">
              We specialize in custom orders for birthdays, weddings, anniversaries, corporate events, and festival celebrations. Eggless options standard on all baked creations.
            </p>
            <div className="pt-2">
              <button
                onClick={() => {
                  window.location.href = "sms:+19455274566?body=Hi!%20I'd%20like%20to%20discuss%20a%20custom%20order%20for%20an%20upcoming%20event.";
                }}
                className="min-h-[44px] inline-flex items-center justify-center gap-2 bg-[#775a19] hover:bg-[#5d4201] text-white font-sans text-xs uppercase tracking-wider font-bold px-8 py-3.5 rounded-xl shadow-md transition-all cursor-pointer"
              >
                <MessageSquare className="w-4 h-4 text-[#ffdea5]" />
                <span>Discuss Event with Chef &amp; Baker</span>
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
