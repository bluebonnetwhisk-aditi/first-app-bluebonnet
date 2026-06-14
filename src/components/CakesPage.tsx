import { ArrowRight, MessageSquare, ChevronRight } from "lucide-react";
import { flavorCategories } from "../types";

interface CakesPageProps {
  onOpenWizard: (flavor?: string, category?: string) => void;
  onOpenBaker: () => void;
  onOpenPriceList: () => void;
}

export default function CakesPage({ onOpenWizard, onOpenBaker, onOpenPriceList }: CakesPageProps) {
  return (
    <div className="animate-fade-in bg-brand-cream-light min-h-screen">
      {/* Elegant Hero Section */}
      <header className="relative py-24 md:py-36 overflow-hidden">
        {/* Background with soft luxury overlay */}
        <div className="absolute inset-0 z-0">
          <img 
            src="/src/assets/images/hero_cakes_desserts_1781194959946.jpg" 
            alt="Premium Baked goods table" 
            className="w-full h-full object-cover scale-105 filter brightness-85"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#00346f]/60 via-[#00346f]/40 to-[#fbfbfa]/50" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#fbfbfa] via-[#fbfbfa]/10 to-transparent" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-white md:text-left">
          <span className="font-sans text-xs font-bold tracking-widest text-brand-gold-tint uppercase block mb-3">
            SWEET MOMENTS, BEAUTIFULLY BAKED
          </span>
          <h1 className="font-serif text-4xl sm:text-6xl font-bold tracking-tight mb-6 max-w-3xl drop-shadow-xs text-brand-cream leading-tight">
            Cakes & <span className="italic text-brand-gold-tint">Desserts</span>
          </h1>
          <p className="font-sans text-sm sm:text-base text-gray-100 max-w-xl mb-8 leading-relaxed font-medium drop-shadow-xs">
            From custom celebration cakes to bite-sized treats and Indian-inspired desserts, every creation at Bluebonnet Whisk is handcrafted with quality ingredients, creativity, and love.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4">
            <button
              onClick={() => onOpenWizard()}
              className="w-full sm:w-auto bg-[#00346f] hover:bg-[#00346f]/90 text-white font-sans text-xs uppercase tracking-widest font-bold px-8 py-4 rounded shadow-lg transition-all duration-300 cursor-pointer"
            >
              ORDER INQUIRY
            </button>
            <p className="flex items-center gap-2.5 text-sm sm:text-base text-brand-gold-tint font-sans font-semibold">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-white font-black text-xs">✓</span>
              Custom flavors & Eggless options available
            </p>
          </div>
        </div>
      </header>

      {/* Our Collections Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="mb-12 text-center md:text-left">
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-primary-brand tracking-tight">Our Collections</h2>
          <div className="h-0.5 w-16 bg-secondary-brand mt-4 mx-auto md:mx-0" />
        </div>

        {/* Bento-style Collections grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* Left Large Column spanning 2 rows: Custom Celebration Cakes */}
          <div className="md:col-span-2 border border-gray-150 rounded-md bg-white overflow-hidden shadow-xs relative flex flex-col justify-between group">
            <div className="relative h-[250px] md:h-[400px] overflow-hidden">
              <img 
                src="/src/assets/images/custom_celebration_cakes_1781194977914.jpg" 
                alt="Custom Celebration Cakes" 
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-102"
                referrerPolicy="no-referrer"
              />
              <div className="absolute top-3 left-3 bg-secondary-brand text-white px-3 py-1 rounded-sm text-[10px] font-sans tracking-widest uppercase font-semibold">
                Featured Collection
              </div>
            </div>
            <div className="p-6 md:p-8">
              <h3 className="font-serif text-2xl font-bold text-primary-brand mb-2">Custom Celebration Cakes</h3>
              <p className="text-gray-600 text-xs sm:text-sm font-sans mb-4 leading-normal">
                Made-to-order cakes for birthdays, anniversaries, and milestones. Theme Cakes, Kids Birthdays, and Elegant Florals. Hand-decorated by master artists.
              </p>
              <div className="flex flex-wrap gap-2 mb-6">
                {["Butterscotch Drizzle", "Racing Legend", "Jungle Adventure", "Berry Chantilly"].map((tag) => (
                  <span key={tag} className="text-[10px] font-sans tracking-wider bg-gray-50 border border-gray-100 text-gray-500 px-2.5 py-1 rounded">
                    {tag}
                  </span>
                ))}
              </div>
              <button
                onClick={() => onOpenWizard("", "Classic Flavors")}
                className="border border-secondary-brand/60 hover:bg-secondary-brand/5 px-6 py-3 text-[11px] font-bold tracking-widest text-[#775a19] uppercase rounded transition-all cursor-pointer"
              >
                VIEW GALLERY
              </button>
            </div>
          </div>

          {/* Right Top Column: Indian Fusion Cakes */}
          <div className="border border-gray-150 rounded-md bg-white overflow-hidden shadow-xs flex flex-col justify-between group">
            <div>
              <div className="relative h-[130px] overflow-hidden">
                <img 
                  src="/src/assets/images/indian_fusion_cakes_1781194990456.jpg" 
                  alt="Indian Fusion Cakes" 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-102"
                  referrerPolicy="no-referrer"
                />
              </div>

              {/* Section Header */}
              <div className="px-5 pt-5 pb-1">
                <span className="text-[10px] font-bold tracking-widest text-secondary-brand uppercase block mb-1">Signature Range</span>
                <h3 className="font-serif text-xl font-bold text-primary-brand">Indian Fusion Cakes</h3>
              </div>
              
              {/* Vertically Cascaded Three Signature Cakes */}
              <div className="p-5 pt-3 space-y-3.5">
                
                {/* Cake 1 */}
                <div 
                  onClick={() => onOpenWizard("Rasmalai Royalty", "Indian Fusion")}
                  className="p-3 rounded bg-[#f3faf6] hover:bg-[#ebf7f0] border border-[#d1ebd9]/60 cursor-pointer transition-all duration-300 hover:shadow-xs group/item"
                >
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="font-serif text-xs font-bold text-primary-brand group-hover/item:text-secondary-brand transition-colors">
                      1. Rasmalai Royalty
                    </h4>
                    <span className="text-[8px] font-bold tracking-wider uppercase bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded-sm">
                      Best Seller
                    </span>
                  </div>
                  <p className="text-gray-600 text-[11px] font-sans leading-relaxed">
                    Saffron milk-soaked cardamom sponge layered with premium pistachios and almond flakes.
                  </p>
                </div>

                {/* Cake 2 */}
                <div 
                  onClick={() => onOpenWizard("Gulab Jamun Indulgence", "Indian Fusion")}
                  className="p-3 rounded bg-[#fffcf5] hover:bg-[#fff9e6] border border-[#ffecd1]/60 cursor-pointer transition-all duration-300 hover:shadow-xs group/item"
                >
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="font-serif text-xs font-bold text-primary-brand group-hover/item:text-secondary-brand transition-colors">
                      2. Gulab Jamun Indulgence
                    </h4>
                    <span className="text-[8px] font-bold tracking-wider uppercase bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded-sm">
                      Classic Fusion
                    </span>
                  </div>
                  <p className="text-gray-600 text-[11px] font-sans leading-relaxed">
                    Rose syrup drenched sponge combined with sweet slow-cooked syrup cheese-balls.
                  </p>
                </div>

                {/* Cake 3 */}
                <div 
                  onClick={() => onOpenWizard("Mango Mastani", "Indian Fusion")}
                  className="p-3 rounded bg-[#fffaf5] hover:bg-[#fff3e6] border border-[#ffdcb3]/60 cursor-pointer transition-all duration-300 hover:shadow-xs group/item"
                >
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="font-serif text-xs font-bold text-primary-brand group-hover/item:text-secondary-brand transition-colors">
                      3. Mango Mastani
                    </h4>
                    <span className="text-[8px] font-bold tracking-wider uppercase bg-orange-100 text-orange-800 px-1.5 py-0.5 rounded-sm">
                      Seasonal Special
                    </span>
                  </div>
                  <p className="text-gray-600 text-[11px] font-sans leading-relaxed">
                    Pure Alphonso pulp cream, white chocolate cardamom layers, and premium almond garnish.
                  </p>
                </div>

              </div>
            </div>

            <div className="px-5 pb-5 pt-3 border-t border-gray-100 mt-2">
              <button 
                onClick={() => onOpenWizard("", "Indian Fusion")}
                className="text-secondary-brand text-xs font-bold tracking-widest uppercase flex items-center gap-2 hover:gap-3 transition-all w-full justify-between cursor-pointer"
              >
                <span>EXPLORE CUSTOM RANGE</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Right Bottom Column: Indian Fusion Desserts */}
          <div className="border border-gray-150 rounded-md bg-[#faf7f2]/40 overflow-hidden shadow-xs flex flex-col justify-between group p-6">
            <div>
              <span className="text-[10px] font-bold tracking-widest text-secondary-brand uppercase block mb-1">Traditional Infusions</span>
              <h3 className="font-serif text-xl font-bold text-primary-brand mb-2">Indian Fusion Desserts</h3>
              <p className="text-gray-600 text-xs font-sans mb-5 leading-normal">
                Individual sizing luxury. Layered glass jars and mini loaves combining traditional Rasmalai, Gulab Jamun, Mango, Makhan Malai, and Pistachio flavors with delicate cremes and cardamom syrups.
              </p>
              <div className="space-y-1.5 text-xs text-gray-700 pl-1 font-sans">
                <div className="flex items-center gap-2">
                  <span className="h-1 w-1 bg-secondary-brand rounded-full"></span>
                  <span>Saffron Cardamom syrups & premium nuts</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-1 w-1 bg-secondary-brand rounded-full"></span>
                  <span>Layered Whipped Mascarpone and fresh kheer elements</span>
                </div>
              </div>
            </div>
            <div className="mt-6">
              <button 
                onClick={() => onOpenWizard("", "Indian Fusion")}
                className="text-secondary-brand text-xs font-bold tracking-widest uppercase flex items-center gap-2 hover:gap-3 transition-all border-b border-secondary-brand/40 pb-1 w-fit cursor-pointer"
              >
                VIEW GALLERY <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Bottom Row - Item 4: Cupcakes & Cake Pops */}
          <div className="border border-gray-150 rounded-md bg-white overflow-hidden shadow-xs flex flex-col justify-between group">
            <div className="relative h-[200px] overflow-hidden">
              <img 
                src="/src/assets/images/cupcakes_cake_pops_1781195003119.jpg" 
                alt="Cupcakes and Cake Pops" 
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-102"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="p-6">
              <h3 className="font-serif text-lg font-bold text-primary-brand mb-2">Cupcakes & Cake Pops</h3>
              <p className="text-gray-600 text-xs font-sans leading-relaxed mb-5">
                Bite-sized treats, big smiles! Our custom cupcakes and cake pops are loved by kids and adults alike, making every celebration sweet.
              </p>
              <button
                onClick={() => onOpenWizard("", "Kids & Fun")}
                className="text-[#775a19] text-xs font-bold tracking-widest uppercase flex items-center gap-1.5 hover:gap-2.5 transition-all cursor-pointer"
              >
                EXPLORE <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Bottom Row - Item 5: Cake Jars & Mini Cake Loaves */}
          <div className="border border-gray-150 rounded-md bg-white overflow-hidden shadow-xs flex flex-col justify-between group">
            <div className="p-6 pb-2">
              <span className="text-[9px] font-bold tracking-widest text-[#775a19] uppercase block mb-1">Classic Favorites</span>
              <h3 className="font-serif text-lg font-bold text-primary-brand mb-1">Cake Jars & Mini Cake Loaves</h3>
              <p className="text-gray-600 text-xs font-sans leading-relaxed">
                Individual elegance. Strawberry, Chocolate Pistachio, Funfetti, Chocolate, Tiramisu, and Seasonal Specials. Perfect for display cases or party bags.
              </p>
            </div>
            
            {/* Small detail thumbnails */}
            <div className="px-6 py-2 grid grid-cols-2 gap-3">
              <div className="relative h-20 rounded overflow-hidden">
                <img 
                  src="/src/assets/images/cake_jars_detail_1_1781195027694.jpg" 
                  alt="Chocolate Jar Detail" 
                  className="w-full h-full object-cover scale-105"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="relative h-20 rounded overflow-hidden">
                <img 
                  src="/src/assets/images/cake_jars_detail_2_1781195040371.jpg" 
                  alt="Strawberry Jar Detail" 
                  className="w-full h-full object-cover scale-105"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>

            <div className="p-6 pt-3">
              <button 
                onClick={() => onOpenWizard("", "Premium & Gourmet")}
                className="text-[#775a19] text-xs font-bold tracking-widest uppercase flex items-center gap-1.5 hover:gap-2.5 transition-all cursor-pointer"
              >
                DETAILS <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Bottom Row - Gourmet Cookies and Festival Specials */}
          <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Gourmet Cookies Card (Solid Royal Blue) */}
            <div className="border border-primary-brand rounded-md bg-primary-brand text-white p-6 shadow-xs flex flex-col justify-between group min-h-[160px]">
              <div>
                <span className="text-[9px] font-bold tracking-widest text-brand-gold-tint uppercase block mb-1">Thick-Style Artisan</span>
                <h3 className="font-serif text-xl font-bold tracking-wide text-white mb-2">Gourmet Cookies</h3>
                <p className="text-gray-200 text-xs font-sans leading-relaxed">
                  Freshly baked Strawberry, Blueberry, and exotic Cardamom Funfetti delights. Soft-baked premium bites crafted with pure butter.
                </p>
              </div>
              <div className="flex justify-between items-end mt-4 pt-4 border-t border-white/10">
                <span className="text-[10px] text-brand-gold-tint font-bold font-sans tracking-widest uppercase">
                  Baked Daily
                </span>
                <button 
                  onClick={() => onOpenWizard("", "Classic Flavors")}
                  className="text-brand-gold-tint text-xs font-bold tracking-widest uppercase flex items-center gap-1.5 hover:gap-2.5 transition-all cursor-pointer"
                >
                  ORDER COOKIES <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* Festival Specials Card (Yellow Warm Container) */}
            <div className="border border-[#e0ab51]/30 rounded-md bg-[#fed488] text-gray-900 p-6 shadow-xs flex flex-col justify-between group min-h-[160px]">
              <div>
                <span className="text-[9px] font-bold tracking-widest text-brand-gold-shadow uppercase block mb-1">Limited-Edition Boxes</span>
                <h3 className="font-serif text-xl font-bold text-brand-gold-shadow mb-2 leading-none">Festival Specials</h3>
                <p className="text-gray-800 text-xs font-sans leading-relaxed">
                  Custom celebration boxes for Diwali, Rakhi, Eid, and Holi. Elegantly themed embellishments, custom greeting tags, and luxury packaging.
                </p>
              </div>
              <div className="flex justify-between items-end mt-4 pt-4 border-t border-[#e0ab51]/35">
                <div>
                  <span className="text-[10px] text-gray-600 font-bold block font-sans uppercase">Custom-to-order gift boxes</span>
                  <span className="font-serif text-base font-bold text-brand-gold-shadow">STARTING FROM $20</span>
                </div>
                <button 
                  onClick={() => onOpenWizard("", "Indian Fusion")}
                  className="text-[#775a19] text-xs font-bold tracking-widest uppercase flex items-center gap-1.5 hover:gap-2.5 transition-all cursor-pointer"
                >
                  VIEW BOXES <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* Choose Your Flavor Section */}
      <section className="bg-gray-50 py-16 border-y border-gray-150">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="mb-12 text-center">
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-primary-brand mb-3">Choose Your Flavor</h2>
            <p className="text-gray-600 font-sans text-xs md:text-sm max-w-xl mx-auto">
              Crafting layers of taste with precision and the finest global ingredients.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
            {flavorCategories.map((cat) => (
              <div 
                key={cat.title}
                className={`rounded p-6 shadow-xs flex flex-col justify-between transition-transform duration-300 hover:-translate-y-0.5 ${cat.bgStyle}`}
              >
                <div>
                  <span className="text-xs font-bold tracking-widest uppercase block mb-3 opacity-90 font-sans">
                    {cat.title}
                  </span>
                  
                  <ul className="space-y-2 text-xs">
                    {cat.flavors.map((fl) => (
                      <li key={fl} className="flex items-center gap-2 opacity-95">
                        <span className="h-1.5 w-1.5 bg-secondary-brand rounded-full"></span>
                        <span className="font-sans leading-none">{fl}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-6 pt-4 border-t border-gray-250/20">
                  <button
                    onClick={() => onOpenWizard(cat.flavors[0], cat.title)}
                    className="text-[10px] font-bold tracking-widest uppercase flex items-center gap-1 hover:gap-1.5 transition-all text-secondary-brand opacity-90 cursor-pointer"
                  >
                    Request Flavor <ChevronRight className="h-3 my-auto" />
                  </button>
                </div>
              </div>
            ))}

            {/* Recommendation Baker Box */}
            <div className="border border-brand-gold-tint/40 rounded bg-[#ffdea5] p-6 shadow-xs flex flex-col justify-between text-gray-900 md:col-span-1">
              <div>
                <span className="text-xs font-serif italic text-brand-gold-shadow font-semibold block mb-2">Heritage Consult</span>
                <p className="text-gray-800 text-xs sm:text-sm font-sans leading-relaxed mb-4">
                  Not sure which flavor to choose? We&apos;d be happy to help you find the perfect match for your celebration.
                </p>
              </div>

              <button
                onClick={onOpenBaker}
                className="w-full bg-brand-gold-shadow text-white hover:bg-brand-gold-shadow/90 py-3 text-xs font-bold tracking-widest uppercase rounded shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer font-sans"
              >
                <MessageSquare className="h-4 w-4" /> TALK TO A BAKER
              </button>
            </div>
          </div>

        </div>
      </section>

      {/* Create Your Masterpiece Final CTA Section */}
      <section className="bg-gradient-to-br from-[#faf7f2] to-[#fbfbfa] py-20 text-center border-b border-gray-150">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-primary-brand tracking-tight mb-5 leading-tight">
            Create Your <span className="italic text-secondary-brand">Masterpiece</span>
          </h2>
          <p className="text-gray-600 font-sans text-sm sm:text-base max-w-2xl mx-auto mb-8 leading-relaxed">
            Ready to bring your dream cake to life? Let&apos;s discuss your vision and make your next event unforgettable.
          </p>

          <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
            <button
              onClick={() => onOpenWizard()}
              className="w-full sm:w-auto bg-[#00346f] hover:bg-primary-brand/90 text-white font-sans text-xs uppercase tracking-widest font-bold px-8 py-4 rounded shadow-md transition-all cursor-pointer"
            >
              START ORDER INQUIRY
            </button>
            <button
              onClick={onOpenPriceList}
              className="w-full sm:w-auto border border-gray-400 hover:bg-gray-50 text-gray-700 font-sans text-xs uppercase tracking-widest font-bold px-8 py-4 rounded transition-all cursor-pointer"
            >
              DOWNLOAD PRICE LIST
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
