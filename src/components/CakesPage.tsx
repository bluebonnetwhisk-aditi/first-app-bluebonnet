import { ArrowRight, MessageSquare, ChevronRight, Sparkles } from "lucide-react";
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
      <header className="relative py-24 lg:py-36 overflow-hidden">
        {/* Background with soft luxury overlay */}
        <div className="absolute inset-0 z-0">
          <img 
            src="src/assets/images/hero_cakes_desserts_1781194959946.jpg" 
            alt="Premium Baked goods table" 
            className="w-full h-full object-cover scale-105 filter brightness-85"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#00346f]/60 via-[#00346f]/40 to-[#fbfbfa]/50" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#fbfbfa] via-[#fbfbfa]/10 to-transparent" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 lg:px-6 lg:px-8 text-white lg:text-left">
          <span className="font-sans text-xs font-bold tracking-widest text-brand-gold-tint uppercase block mb-3">
            SWEET MOMENTS, BEAUTIFULLY BAKED
          </span>
          <h1 className="font-serif text-4xl lg:text-6xl font-bold tracking-tight mb-6 max-w-3xl drop-shadow-xs text-brand-cream leading-tight">
            Cakes & <span className="italic text-brand-gold-tint">Desserts</span>
          </h1>
          <p className="font-sans text-sm lg:text-base text-gray-100 max-w-xl mb-8 leading-relaxed font-medium drop-shadow-xs">
            From custom celebration cakes to bite-sized treats and Indian-inspired desserts, every creation at Bluebonnet Whisk is handcrafted with quality ingredients, creativity, and love.
          </p>

          <div className="flex flex-col lg:flex-row items-center gap-4">
            <button
              onClick={() => onOpenWizard()}
              className="w-full lg:w-auto bg-[#00346f] hover:bg-[#00346f]/90 text-white font-sans text-xs uppercase tracking-widest font-bold px-8 py-4 rounded shadow-lg transition-all duration-300 cursor-pointer"
            >
              REQUEST QUOTE
            </button>
            <p className="flex items-center gap-2.5 text-sm lg:text-base text-brand-gold-tint font-sans font-semibold">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-white font-black text-xs">✓</span>
              Custom flavors & Eggless options available
            </p>
          </div>
        </div>
      </header>      {/* Our Collections Section */}
      <section className="max-w-7xl mx-auto px-4 lg:px-6 lg:px-8 py-16">
        <div className="mb-12 text-center lg:text-left">
          <h2 className="font-serif text-3xl lg:text-4xl font-bold text-primary-brand tracking-tight">Our Collections</h2>
          <div className="h-0.5 w-16 bg-secondary-brand mt-4 mx-auto lg:mx-0" />
        </div>

        {/* Bento-style Collections grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left Large Column spanning 2 rows: Custom Celebration Cakes */}
          <div className="lg:col-span-2 border border-gray-150 rounded-md bg-white overflow-hidden shadow-xs relative flex flex-col justify-between group">
            <div className="relative h-[250px] lg:h-[400px] overflow-hidden">
              <img 
                src="src/assets/images/custom_celebration_cakes_1781194977914.jpg" 
                alt="Custom Celebration Cakes" 
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-102"
                referrerPolicy="no-referrer"
              />
              <div className="absolute top-3 left-3 bg-secondary-brand text-white px-3 py-1 rounded-sm text-[10px] font-sans tracking-widest uppercase font-semibold">
                Featured Collection
              </div>
            </div>
            <div className="p-6 lg:p-8">
              <h3 className="font-serif text-2xl font-bold text-primary-brand mb-2">Custom Celebration Cakes</h3>
              <p className="text-gray-600 text-xs lg:text-sm font-sans mb-4 leading-normal">
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
                className="border border-secondary-brand/60 hover:bg-secondary-brand/5 px-6 py-3 text-[11px] font-bold tracking-widest text-[#775a19] uppercase rounded transition-all cursor-pointer font-semibold"
              >
                VIEW GALLERY
              </button>
            </div>
          </div>

          {/* Right Top Column: Festival Specials */}
          <div className="border border-gray-150 rounded-md bg-white overflow-hidden shadow-xs flex flex-col justify-between group">
            <div>
              <div className="relative h-[200px] overflow-hidden">
                <img 
                  src="src/assets/images/diwali_luxe_hamper.png" 
                  alt="Festival Specials Gift Boxes" 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-102"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-3 left-3 bg-[#e0ab51] text-white px-3 py-1 rounded-sm text-[10px] font-sans tracking-widest uppercase font-semibold">
                  Seasonal
                </div>
              </div>
              <div className="p-6">
                <span className="text-[9px] font-bold tracking-widest text-[#775a19] uppercase block mb-1">Limited-Edition Boxes</span>
                <h3 className="font-serif text-lg font-bold text-primary-brand mb-2">Festival Specials</h3>
                <p className="text-gray-600 text-xs font-sans leading-relaxed mb-4">
                  Custom celebration boxes for Diwali, Rakhi, Eid, and Holi. Elegantly themed embellishments, custom greeting tags, and luxury packaging.
                </p>
                
                {/* Festival box thumbnails to fill empty space */}
                <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-gray-100/65">
                  <div className="flex items-center gap-2">
                    <div className="h-9 w-9 rounded overflow-hidden shrink-0 border border-gray-200">
                      <img 
                        src="src/assets/images/ganpati_pooja_gift.png" 
                        alt="Ganesh Chaturthi Pooja Box" 
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div className="leading-tight">
                      <span className="text-[8px] font-sans font-bold text-gray-400 uppercase block">Ganesh Chaturthi</span>
                      <span className="text-[10px] font-serif font-bold text-primary-brand">Pooja Box</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <div className="h-9 w-9 rounded overflow-hidden shrink-0 border border-gray-200">
                      <img 
                        src="src/assets/images/rakhi_gift_box.png" 
                        alt="Raksha Bandhan Rakhi Hamper" 
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div className="leading-tight">
                      <span className="text-[8px] font-sans font-bold text-gray-400 uppercase block">Raksha Bandhan</span>
                      <span className="text-[10px] font-serif font-bold text-primary-brand">Rakhi Hamper</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-6 pt-0 flex justify-between items-end border-t border-gray-100 mt-2">
              <span className="text-[10px] text-gray-500 font-bold block font-sans uppercase">Starting from $20</span>
              <button 
                onClick={() => onOpenWizard("", "Indian Fusion")}
                className="text-[#775a19] text-xs font-bold tracking-widest uppercase flex items-center gap-1.5 hover:gap-2.5 transition-all cursor-pointer font-semibold"
              >
                VIEW BOXES <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Bottom Row - Item 3: Cupcakes & Cake Pops */}
          <div className="border border-gray-150 rounded-md bg-white overflow-hidden shadow-xs flex flex-col justify-between group">
            <div className="relative h-[200px] overflow-hidden">
              <img 
                src="src/assets/images/cupcakes_cake_pops_1781195003119.jpg" 
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
                className="text-[#775a19] text-xs font-bold tracking-widest uppercase flex items-center gap-1.5 hover:gap-2.5 transition-all cursor-pointer font-semibold"
              >
                EXPLORE <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Bottom Row - Item 4: Cake Jars & Mini Cake Loaves (spans 2 columns on desktop) */}
          <div className="lg:col-span-2 border border-gray-150 rounded-md bg-white overflow-hidden shadow-xs flex flex-col lg:flex-row group">
            {/* Left Column: Image */}
            <div className="w-full lg:w-1/2 h-[200px] lg:h-auto overflow-hidden relative">
              <img 
                src="src/assets/images/cake_jars_mini_loaves_1781195014914.jpg" 
                alt="Cake Jars & Mini Cake Loaves" 
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-102"
                referrerPolicy="no-referrer"
              />
            </div>
            {/* Right Column: Content */}
            <div className="w-full lg:w-1/2 p-6 lg:p-8 flex flex-col justify-between">
              <div>
                <span className="text-[9px] font-bold tracking-widest text-[#775a19] uppercase block mb-1">Classic Favorites</span>
                <h3 className="font-serif text-xl font-bold text-primary-brand mb-2">Cake Jars & Mini Cake Loaves</h3>
                <p className="text-gray-600 text-xs lg:text-sm font-sans leading-relaxed mb-4">
                  Individual elegance. Strawberry, Chocolate Pistachio, Funfetti, Chocolate, Tiramisu, and Seasonal Specials. Perfect for display cases or party bags.
                </p>
                
                {/* Small detail thumbnails */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="relative h-16 rounded overflow-hidden">
                    <img 
                      src="src/assets/images/cake_jars_detail_1_1781195027694.jpg" 
                      alt="Chocolate Jar Detail" 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="relative h-16 rounded overflow-hidden">
                    <img 
                      src="src/assets/images/cake_jars_detail_2_1781195040371.jpg" 
                      alt="Strawberry Jar Detail" 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                </div>
              </div>
              
              <button 
                onClick={() => onOpenWizard("", "Premium & Gourmet")}
                className="text-[#775a19] text-xs font-bold tracking-widest uppercase flex items-center gap-1.5 hover:gap-2.5 transition-all cursor-pointer w-fit font-semibold"
              >
                DETAILS <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

        </div>
      </section>

      {/* ── INDIAN FUSION CAKES & DESSERTS FEATURED SECTION ── */}
      <section className="bg-[#faf7f2]/75 border-t border-b border-gray-150 py-20">
        <div className="max-w-7xl mx-auto px-4 lg:px-6 lg:px-8">
          
          <div className="text-center mb-16 max-w-3xl mx-auto">
            <span className="text-[10px] font-bold tracking-widest text-[#775a19] uppercase block mb-1">Signature Fusion Line</span>
            <h2 className="font-serif text-3xl lg:text-5xl font-bold text-primary-brand tracking-tight animate-fade-in">
              Indian Fusion Cakes & Desserts
            </h2>
            <p className="text-gray-600 text-xs lg:text-sm font-sans leading-relaxed mt-3 max-w-xl mx-auto">
              Traditional Indian flavors reimagined into handcrafted cakes and desserts.
            </p>
            <div className="h-0.5 w-16 bg-[#775a19] mt-4 mx-auto" />
          </div>

          {/* Visual Gallery Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            
            {/* Item 1: Rasmalai Cake */}
            <div className="bg-white border border-gray-150 rounded-lg overflow-hidden shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between group hover:-translate-y-0.5">
              <div className="relative h-56 overflow-hidden">
                <img 
                  src="src/assets/images/rasmalai_cake.png" 
                  alt="Rasmalai Cake" 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-102"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-2.5 left-2.5 bg-emerald-500 text-white px-2 py-0.5 rounded-xs text-[9px] font-bold tracking-wider uppercase font-sans">
                  Best Seller
                </div>
              </div>
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div className="space-y-2 mb-4">
                  <h3 className="font-serif text-base font-bold text-primary-brand">Rasmalai Cake</h3>
                  <p className="text-gray-600 text-[11px] font-sans leading-relaxed">
                    Cardamom-infused sponge soaked in rich saffron rabri milk, frosted with pistachio cream and rose petals.
                  </p>
                </div>
                <button 
                  onClick={() => onOpenWizard("Rasmalai Royalty", "Indian Fusion")}
                  className="w-full bg-[#faf7f2] hover:bg-[#775a19] hover:text-white border border-brand-gold-tint/40 text-[#775a19] text-[10px] font-bold tracking-widest uppercase py-2.5 rounded-sm transition-all duration-300 font-semibold"
                >
                  Inquire
                </button>
              </div>
            </div>

            {/* Item 2: Gulab Jamun Cake */}
            <div className="bg-white border border-gray-150 rounded-lg overflow-hidden shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between group hover:-translate-y-0.5">
              <div className="relative h-56 overflow-hidden">
                <img 
                  src="src/assets/images/gulab_jamun_cake.png" 
                  alt="Gulab Jamun Cake" 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-102"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-2.5 left-2.5 bg-secondary-brand text-white px-2 py-0.5 rounded-xs text-[9px] font-bold tracking-wider uppercase font-sans">
                  Classic
                </div>
              </div>
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div className="space-y-2 mb-4">
                  <h3 className="font-serif text-base font-bold text-primary-brand">Gulab Jamun Cake</h3>
                  <p className="text-gray-600 text-[11px] font-sans leading-relaxed">
                    Saffron cardamom cake layers drenched in rose syrup and combined with pieces of slow-cooked gulab jamuns.
                  </p>
                </div>
                <button 
                  onClick={() => onOpenWizard("Gulab Jamun Indulgence", "Indian Fusion")}
                  className="w-full bg-[#faf7f2] hover:bg-[#775a19] hover:text-white border border-brand-gold-tint/40 text-[#775a19] text-[10px] font-bold tracking-widest uppercase py-2.5 rounded-sm transition-all duration-300 font-semibold"
                >
                  Inquire
                </button>
              </div>
            </div>

            {/* Item 3: Mango Cake */}
            <div className="bg-white border border-gray-150 rounded-lg overflow-hidden shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between group hover:-translate-y-0.5">
              <div className="relative h-56 overflow-hidden">
                <img 
                  src="src/assets/images/mango_cake.png" 
                  alt="Mango Cake" 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-102"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-2.5 left-2.5 bg-amber-500 text-white px-2 py-0.5 rounded-xs text-[9px] font-bold tracking-wider uppercase font-sans">
                  Seasonal
                </div>
              </div>
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div className="space-y-2 mb-4">
                  <h3 className="font-serif text-base font-bold text-primary-brand">Mango Cake</h3>
                  <p className="text-gray-600 text-[11px] font-sans leading-relaxed">
                    Pure Alphonso mango pulp cream layered with white chocolate chips and fluffy cardamon-infused sponge.
                  </p>
                </div>
                <button 
                  onClick={() => onOpenWizard("Mango Mastani", "Indian Fusion")}
                  className="w-full bg-[#faf7f2] hover:bg-[#775a19] hover:text-white border border-brand-gold-tint/40 text-[#775a19] text-[10px] font-bold tracking-widest uppercase py-2.5 rounded-sm transition-all duration-300 font-semibold"
                >
                  Inquire
                </button>
              </div>
            </div>

            {/* Item 4: Cake Jars */}
            <div className="bg-white border border-gray-150 rounded-lg overflow-hidden shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between group hover:-translate-y-0.5">
              <div className="relative h-56 overflow-hidden">
                <img 
                  src="src/assets/images/fusion_cake_jars.png" 
                  alt="Indian Fusion Cake Jars" 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-102"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-2.5 left-2.5 bg-primary-brand text-white px-2 py-0.5 rounded-xs text-[9px] font-bold tracking-wider uppercase font-sans">
                  Popular
                </div>
              </div>
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div className="space-y-2 mb-4">
                  <h3 className="font-serif text-base font-bold text-primary-brand">Indian Fusion Jars</h3>
                  <p className="text-gray-600 text-[11px] font-sans leading-relaxed">
                    Layered glass jars of cardamom sponge, rich cream, and traditional sweets. Ideal for individual servings and gifting.
                  </p>
                </div>
                <button 
                  onClick={() => onOpenWizard("Fusion Cake Jars", "Indian Fusion")}
                  className="w-full bg-[#faf7f2] hover:bg-[#775a19] hover:text-white border border-brand-gold-tint/40 text-[#775a19] text-[10px] font-bold tracking-widest uppercase py-2.5 rounded-sm transition-all duration-300 font-semibold"
                >
                  Inquire
                </button>
              </div>
            </div>

            {/* Item 5: Dessert Cups */}
            <div className="bg-white border border-gray-150 rounded-lg overflow-hidden shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between group hover:-translate-y-0.5">
              <div className="relative h-56 overflow-hidden">
                <img 
                  src="src/assets/images/dessert_cups.png" 
                  alt="Dessert Cups" 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-102"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-2.5 left-2.5 bg-rose-500 text-white px-2 py-0.5 rounded-xs text-[9px] font-bold tracking-wider uppercase font-sans">
                  Party Pack
                </div>
              </div>
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div className="space-y-2 mb-4">
                  <h3 className="font-serif text-base font-bold text-primary-brand">Fusion Dessert Cups</h3>
                  <p className="text-gray-600 text-[11px] font-sans leading-relaxed">
                    Sleek shooters and mini cups displaying layered mango mousse, vanilla panna cotta, and kheer crumbs.
                  </p>
                </div>
                <button 
                  onClick={() => onOpenWizard("Dessert Shooters", "Indian Fusion")}
                  className="w-full bg-[#faf7f2] hover:bg-[#775a19] hover:text-white border border-brand-gold-tint/40 text-[#775a19] text-[10px] font-bold tracking-widest uppercase py-2.5 rounded-sm transition-all duration-300 font-semibold"
                >
                  Inquire
                </button>
              </div>
            </div>

          </div>

          {/* Structured lists and customizations */}
          <div className="mt-16 bg-white border border-gray-200/60 rounded-lg p-6 lg:p-8 shadow-2xs space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 divide-y lg:divide-y-0 lg:divide-x divide-gray-150">
              
              {/* Left Column: Signature Cakes */}
              <div className="space-y-3 lg:pr-8">
                <h4 className="font-serif text-lg font-bold text-primary-brand flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-[#775a19]" />
                  Signature Cakes
                </h4>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-gray-600 font-sans">
                  {["Gulab Jamun Cake", "Rasmalai Cake", "Mango Cake", "Pistachio Cardamom Cake", "Custom Celebration Cakes"].map((item) => (
                    <li key={item} className="flex items-center gap-2">
                      <span className="h-1 w-1 bg-[#775a19] rounded-full"></span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Right Column: Signature Desserts */}
              <div className="space-y-3 pt-6 lg:pt-0 lg:pl-8">
                <h4 className="font-serif text-lg font-bold text-primary-brand flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-[#775a19]" />
                  Signature Desserts
                </h4>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-gray-600 font-sans">
                  {["Gulab Jamun Cake Jars", "Rasmalai Cake Jars", "Mango Dessert Cups", "Dessert Shooters", "Mini Loaf Cakes", "Seasonal Fusion Desserts"].map((item) => (
                    <li key={item} className="flex items-center gap-2">
                      <span className="h-1 w-1 bg-[#775a19] rounded-full"></span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

            </div>

            {/* Customization Note Banner */}
            <div className="border-t border-gray-100 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
              <p className="text-gray-700 text-xs font-semibold font-sans italic text-center md:text-left">
                Custom themes, personalized designs, and eggless options available.
              </p>
              <button 
                onClick={() => onOpenWizard("", "Indian Fusion")}
                className="bg-primary-brand hover:bg-[#775a19] text-white text-xs font-bold tracking-widest uppercase px-6 py-3 rounded-sm shadow-xs transition-all cursor-pointer font-semibold"
              >
                REQUEST CUSTOM FUSION ORDER
              </button>
            </div>
          </div>

        </div>
      </section>

      {/* ── GOURMET COOKIES SECTION ── */}
      <section className="bg-white py-20 border-b border-gray-150">
        <div className="max-w-7xl mx-auto px-4 lg:px-6 lg:px-8">
          
          <div className="text-center mb-12 max-w-2xl mx-auto">
            <span className="text-[10px] font-bold tracking-widest text-secondary-brand uppercase block mb-1">Thick-Style Artisan</span>
            <h2 className="font-serif text-3xl lg:text-5xl font-bold text-[#00346f] tracking-tight">Gourmet Cookies</h2>
            <p className="text-gray-600 text-xs lg:text-sm font-sans mt-3">
              Freshly baked, generously sized, and crafted with premium ingredients.
            </p>
            <div className="h-0.5 w-16 bg-[#00346f] mt-4 mx-auto" />
          </div>

          {/* Cookie gallery-carousel layout */}
          <div className="flex overflow-x-auto lg:grid lg:grid-cols-5 gap-6 snap-x snap-mandatory scrollbar-none pb-6">
            
            {/* Cookie 1: Chocolate Chip */}
            <div className="min-w-[260px] lg:min-w-0 bg-[#fcfbf9] border border-gray-150 rounded-lg overflow-hidden shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between group snap-center hover:-translate-y-0.5">
              <div className="relative h-48 overflow-hidden">
                <img 
                  src="src/assets/images/chocolate_chip_cookies.png" 
                  alt="Chocolate Chip Cookies" 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-102"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div className="space-y-1 mb-3">
                  <h4 className="font-serif text-sm font-bold text-[#00346f] uppercase">Chocolate Chip</h4>
                  <p className="text-gray-500 text-[10px] font-sans leading-normal">Classic soft-baked cookies loaded with molten dark chocolate pools and sea salt flakes.</p>
                </div>
              </div>
            </div>

            {/* Cookie 2: Double Chocolate */}
            <div className="min-w-[260px] lg:min-w-0 bg-[#fcfbf9] border border-gray-150 rounded-lg overflow-hidden shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between group snap-center hover:-translate-y-0.5">
              <div className="relative h-48 overflow-hidden">
                <img 
                  src="src/assets/images/double_chocolate_cookies.png" 
                  alt="Double Chocolate Cookies" 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-102"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div className="space-y-1 mb-3">
                  <h4 className="font-serif text-sm font-bold text-[#00346f] uppercase">Double Chocolate</h4>
                  <p className="text-gray-500 text-[10px] font-sans leading-normal">Rich decadent cocoa dough stuffed with white and dark chocolate chips for ultimate cocoa bliss.</p>
                </div>
              </div>
            </div>

            {/* Cookie 3: Biscoff Cookies */}
            <div className="min-w-[260px] lg:min-w-0 bg-[#fcfbf9] border border-gray-150 rounded-lg overflow-hidden shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between group snap-center hover:-translate-y-0.5">
              <div className="relative h-48 overflow-hidden">
                <img 
                  src="src/assets/images/biscoff_cookies.png" 
                  alt="Biscoff Cookies" 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-102"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div className="space-y-1 mb-3">
                  <h4 className="font-serif text-sm font-bold text-[#00346f] uppercase">Biscoff Stuffed</h4>
                  <p className="text-gray-500 text-[10px] font-sans leading-normal">Cardamom cookie base stuffed with gooey Lotus Biscoff cookie butter, topped with biscuit crumbs.</p>
                </div>
              </div>
            </div>

            {/* Cookie 4: Stuffed Cookies */}
            <div className="min-w-[260px] lg:min-w-0 bg-[#fcfbf9] border border-gray-150 rounded-lg overflow-hidden shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between group snap-center hover:-translate-y-0.5">
              <div className="relative h-48 overflow-hidden">
                <img 
                  src="src/assets/images/stuffed_cookies.png" 
                  alt="Stuffed Cookies" 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-102"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div className="space-y-1 mb-3">
                  <h4 className="font-serif text-sm font-bold text-[#00346f] uppercase">Nutella Stuffed</h4>
                  <p className="text-gray-500 text-[10px] font-sans leading-normal">Giant hand-rolled cookie filled with a rich, melting chocolate hazelnut center that oozes with flavor.</p>
                </div>
              </div>
            </div>

            {/* Cookie 5: Gourmet Cookies Assortment */}
            <div className="min-w-[260px] lg:min-w-0 bg-[#fcfbf9] border border-gray-150 rounded-lg overflow-hidden shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between group snap-center hover:-translate-y-0.5">
              <div className="relative h-48 overflow-hidden">
                <img 
                  src="src/assets/images/gourmet_cookies.png" 
                  alt="Gourmet Cookie Batch" 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-102"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div className="space-y-1 mb-3">
                  <h4 className="font-serif text-sm font-bold text-[#00346f] uppercase">Artisan Display</h4>
                  <p className="text-gray-500 text-[10px] font-sans leading-normal">A daily batch of freshly baked cookies, crafted with premium European butter and organic sugar.</p>
                </div>
              </div>
            </div>

          </div>

          {/* Cookie CTA & Description */}
          <div className="mt-8 flex flex-col lg:flex-row justify-between items-center bg-[#faf7f2]/55 border border-gray-150 rounded p-6 gap-6">
            <p className="text-gray-700 text-xs lg:text-sm font-sans leading-relaxed text-center lg:text-left max-w-2xl font-medium">
              ★ Our premium thick-style cookies are hand-rolled daily in our Frisco kitchen, using slow-churned butter and organic flour. Perfect for family sweet cravings or custom event cookie boxes.
            </p>
            <button
              onClick={() => onOpenWizard("", "Classic Flavors")}
              className="bg-[#00346f] hover:bg-[#00346f]/90 text-white font-sans text-xs uppercase tracking-widest font-bold px-8 py-3.5 rounded transition-all cursor-pointer whitespace-nowrap shadow-sm"
            >
              ORDER COOKIES
            </button>
          </div>
        </div>
      </section>

      {/* Choose Your Flavor Section */}
      <section className="bg-gray-50 py-16 border-y border-gray-150">
        <div className="max-w-7xl mx-auto px-4 lg:px-6 lg:px-8">
          
          <div className="mb-12 text-center">
            <h2 className="font-serif text-3xl lg:text-4xl font-bold text-primary-brand mb-3">Choose Your Flavor</h2>
            <p className="text-gray-600 font-sans text-xs lg:text-sm max-w-xl mx-auto">
              Crafting layers of taste with precision and the finest global ingredients.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
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
            <div className="border border-brand-gold-tint/40 rounded bg-[#ffdea5] p-6 shadow-xs flex flex-col justify-between text-gray-900 lg:col-span-1">
              <div>
                <span className="text-xs font-serif italic text-brand-gold-shadow font-semibold block mb-2">Heritage Consult</span>
                <p className="text-gray-800 text-xs lg:text-sm font-sans leading-relaxed mb-4">
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
          <h2 className="font-serif text-3xl lg:text-4xl font-bold text-primary-brand tracking-tight mb-5 leading-tight">
            Create Your <span className="italic text-secondary-brand">Masterpiece</span>
          </h2>
          <p className="text-gray-600 font-sans text-sm lg:text-base max-w-2xl mx-auto mb-8 leading-relaxed">
            Ready to bring your dream cake to life? Let&apos;s discuss your vision and make your next event unforgettable.
          </p>

          <div className="flex flex-col lg:flex-row justify-center items-center gap-4">
            <button
              onClick={() => onOpenWizard()}
              className="w-full lg:w-auto bg-[#00346f] hover:bg-primary-brand/90 text-white font-sans text-xs uppercase tracking-widest font-bold px-8 py-4 rounded shadow-md transition-all cursor-pointer"
            >
              REQUEST QUOTE
            </button>
            <button
              onClick={onOpenPriceList}
              className="w-full lg:w-auto border border-gray-400 hover:bg-gray-50 text-gray-700 font-sans text-xs uppercase tracking-widest font-bold px-8 py-4 rounded transition-all cursor-pointer"
            >
              DOWNLOAD PRICE LIST
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
