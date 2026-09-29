import { useState } from "react";
import { MessageSquare, Sparkles, Cake, Users, ChevronRight, Check } from "lucide-react";
import { flavorCategories } from "../types";

interface CakesPageProps {
  onOpenBaker: () => void;
  onOpenPriceList?: () => void;
  onCreateQuote?: () => void;
}

export default function CakesPage({ onOpenBaker, onCreateQuote }: CakesPageProps) {
  const [selectedTier, setSelectedTier] = useState<number>(2);
  const [selectedFlavor, setSelectedFlavor] = useState<string>("Rasmalai Fusion");
  const [isEggless, setIsEggless] = useState<boolean>(false);
  return (
    <div className="animate-fade-in bg-brand-cream-light min-h-screen">
      
      {/* ── STICKY FLOATING ACTION BAR FOR CAKES TAB ── */}
      <div className="sticky top-0 lg:top-[var(--header-nav-bottom,64px)] z-40 bg-[#00346f]/95 backdrop-blur-md text-white border-b border-[#775a19]/30 py-2.5 px-4 shadow-md transition-all">
        <div className="max-w-7xl mx-auto flex flex-row items-center justify-between gap-3">
          <div className="hidden sm:flex items-center gap-2 font-serif text-sm font-bold text-brand-cream">
            <Sparkles className="h-4 w-4 text-brand-gold-tint" />
            <span>Custom Cakes &amp; Patisserie</span>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto justify-center sm:justify-end">
            <button
              onClick={onCreateQuote}
              className="flex-1 sm:flex-none min-h-[40px] inline-flex items-center justify-center bg-[#775a19] hover:bg-[#5d4201] text-white font-sans text-xs uppercase tracking-wider font-bold px-5 py-2 rounded-lg shadow-sm transition-all text-center cursor-pointer"
            >
              Create A Quote
            </button>
            <button
              onClick={onOpenBaker}
              className="flex-1 sm:flex-none min-h-[40px] inline-flex items-center justify-center gap-1.5 border border-brand-gold-tint hover:bg-white/10 text-brand-cream font-sans text-xs uppercase tracking-wider font-bold px-5 py-2 rounded-lg transition-all cursor-pointer text-center"
            >
              <MessageSquare className="h-3.5 w-3.5" />
              <span>Talk to the Baker</span>
            </button>
          </div>
        </div>
      </div>

      {/* Elegant Hero Section */}
      <header className="relative py-20 lg:py-32 overflow-hidden">
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
            Cakes &amp; <span className="italic text-brand-gold-tint">Desserts</span>
          </h1>
          <p className="font-sans text-sm lg:text-base text-gray-100 max-w-xl mb-8 leading-relaxed font-medium drop-shadow-xs">
            From custom celebration cakes to bite-sized treats and Indian-inspired desserts, every creation at Bluebonnet Whisk is handcrafted with quality ingredients, creativity, and love.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4">
            <button
              onClick={onCreateQuote}
              className="w-full sm:w-auto min-h-[44px] inline-flex items-center justify-center bg-[#00346f] hover:bg-[#00224d] text-white font-sans text-xs uppercase tracking-widest font-bold px-8 py-3.5 rounded-xl shadow-lg transition-all duration-300 cursor-pointer"
            >
              Create A Quote
            </button>
            <button
              onClick={onOpenBaker}
              className="w-full sm:w-auto min-h-[44px] inline-flex items-center justify-center gap-2 border border-brand-gold-tint hover:bg-white/10 text-brand-cream font-sans text-xs uppercase tracking-widest font-bold px-8 py-3.5 rounded-xl transition-all cursor-pointer"
            >
              <MessageSquare className="h-4 w-4" />
              <span>Talk to the Baker</span>
            </button>
          </div>
        </div>
      </header>

      {/* Our Collections Section */}
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
              <div className="flex flex-wrap gap-2">
                {["Butterscotch Drizzle", "Racing Legend", "Jungle Adventure", "Berry Chantilly"].map((tag) => (
                  <span key={tag} className="text-[10px] font-sans tracking-wider bg-gray-50 border border-gray-100 text-gray-500 px-2.5 py-1 rounded">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Right Top Column: Festival Specials */}
          <div className="border border-gray-150 rounded-md bg-white overflow-hidden shadow-xs flex flex-col justify-between group">
            <div>
              <div className="relative h-[200px] lg:h-[280px] overflow-hidden">
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
                
                {/* Festival box thumbnails */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-6 pt-6 border-t border-gray-150">
                  <div className="flex items-center gap-3">
                    <div className="h-14 w-14 rounded-md overflow-hidden shrink-0 border border-gray-200 shadow-2xs">
                      <img 
                        src="src/assets/images/ganpati_pooja_gift.png" 
                        alt="Ganesh Chaturthi Pooja Box" 
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-[8px] font-bold tracking-wider text-secondary-brand uppercase block font-sans">Ganesh Chaturthi</span>
                      <h4 className="text-[11px] font-serif font-bold text-primary-brand leading-tight">Pooja Box</h4>
                      <p className="text-gray-500 text-[9px] font-sans leading-none">Mithais &amp; nuts</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="h-14 w-14 rounded-md overflow-hidden shrink-0 border border-gray-200 shadow-2xs">
                      <img 
                        src="src/assets/images/rakhi_gift_box.png" 
                        alt="Raksha Bandhan Rakhi Hamper" 
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-[8px] font-bold tracking-wider text-[#e0ab51] uppercase block font-sans">Raksha Bandhan</span>
                      <h4 className="text-[11px] font-serif font-bold text-primary-brand leading-tight">Luxe Hamper</h4>
                      <p className="text-gray-500 text-[9px] font-sans leading-none">Fusion sweets</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-6 pt-0 border-t border-gray-100 mt-2">
              <span className="text-[10px] text-gray-500 font-bold block font-sans uppercase">Starting from $20</span>
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
              <h3 className="font-serif text-lg font-bold text-primary-brand mb-2">Cupcakes &amp; Cake Pops</h3>
              <p className="text-gray-600 text-xs font-sans leading-relaxed">
                Bite-sized treats, big smiles! Our custom cupcakes and cake pops are loved by kids and adults alike, making every celebration sweet.
              </p>
            </div>
          </div>

          {/* Bottom Row - Item 4: Cake Jars & Mini Cake Loaves */}
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
                <h3 className="font-serif text-xl font-bold text-primary-brand mb-2">Cake Jars &amp; Mini Cake Loaves</h3>
                <p className="text-gray-600 text-xs lg:text-sm font-sans leading-relaxed mb-4">
                  Individual elegance. Strawberry, Chocolate Pistachio, Funfetti, Chocolate, Tiramisu, and Seasonal Specials. Perfect for display cases or party bags.
                </p>
                
                {/* Small detail thumbnails */}
                <div className="grid grid-cols-2 gap-3">
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
              Indian Fusion Cakes &amp; Desserts
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
              <div className="p-5 flex-1 flex flex-col justify-between space-y-2">
                <h3 className="font-serif text-base font-bold text-primary-brand">Rasmalai Cake</h3>
                <p className="text-gray-600 text-[11px] font-sans leading-relaxed">
                  Cardamom-infused sponge soaked in rich saffron rabri milk, frosted with pistachio cream and rose petals.
                </p>
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
              <div className="p-5 flex-1 flex flex-col justify-between space-y-2">
                <h3 className="font-serif text-base font-bold text-primary-brand">Gulab Jamun Cake</h3>
                <p className="text-gray-600 text-[11px] font-sans leading-relaxed">
                  Saffron cardamom cake layers drenched in rose syrup and combined with pieces of slow-cooked gulab jamuns.
                </p>
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
              <div className="p-5 flex-1 flex flex-col justify-between space-y-2">
                <h3 className="font-serif text-base font-bold text-primary-brand">Mango Cake</h3>
                <p className="text-gray-600 text-[11px] font-sans leading-relaxed">
                  Pure Alphonso mango pulp cream layered with white chocolate chips and fluffy cardamon-infused sponge.
                </p>
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
              <div className="p-5 flex-1 flex flex-col justify-between space-y-2">
                <h3 className="font-serif text-base font-bold text-primary-brand">Indian Fusion Jars</h3>
                <p className="text-gray-600 text-[11px] font-sans leading-relaxed">
                  Layered glass jars of cardamom sponge, rich cream, and traditional sweets. Ideal for individual servings and gifting.
                </p>
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
              <div className="p-5 flex-1 flex flex-col justify-between space-y-2">
                <h3 className="font-serif text-base font-bold text-primary-brand">Fusion Dessert Cups</h3>
                <p className="text-gray-600 text-[11px] font-sans leading-relaxed">
                  Sleek shooters and mini cups displaying layered mango mousse, vanilla panna cotta, and kheer crumbs.
                </p>
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
                <ul className="grid grid-cols-1 lg:grid-cols-2 gap-2 text-xs text-gray-600 font-sans">
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
                <ul className="grid grid-cols-1 lg:grid-cols-2 gap-2 text-xs text-gray-600 font-sans">
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
            <div className="border-t border-gray-100 pt-6">
              <p className="text-gray-700 text-xs font-semibold font-sans italic text-center">
                Custom themes, personalized designs, and eggless options available.
              </p>
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
          <div className="flex overflow-x-auto sm:grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6 snap-x snap-mandatory scrollbar-none pb-6">
            
            {/* Cookie 1: Chocolate Chip */}
            <div className="min-w-[240px] sm:min-w-0 bg-[#fcfbf9] border border-gray-150 rounded-xl overflow-hidden shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between group snap-center hover:-translate-y-0.5">
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
            <div className="min-w-[240px] sm:min-w-0 bg-[#fcfbf9] border border-gray-150 rounded-xl overflow-hidden shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between group snap-center hover:-translate-y-0.5">
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
            <div className="min-w-[240px] sm:min-w-0 bg-[#fcfbf9] border border-gray-150 rounded-xl overflow-hidden shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between group snap-center hover:-translate-y-0.5">
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
            <div className="min-w-[240px] sm:min-w-0 bg-[#fcfbf9] border border-gray-150 rounded-xl overflow-hidden shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between group snap-center hover:-translate-y-0.5">
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
            <div className="min-w-[240px] sm:min-w-0 bg-[#fcfbf9] border border-gray-150 rounded-xl overflow-hidden shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between group snap-center hover:-translate-y-0.5">
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

          {/* Cookie Description Banner */}
          <div className="mt-8 bg-[#faf7f2]/55 border border-gray-150 rounded-2xl p-6 text-center">
            <p className="text-gray-700 text-xs lg:text-sm font-sans leading-relaxed max-w-3xl mx-auto font-medium">
              ★ Our premium thick-style cookies are hand-rolled daily in our Frisco kitchen, using slow-churned butter and organic flour. Perfect for family sweet cravings or custom event cookie boxes.
            </p>
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

      {/* ── 3D VISUAL CAKE TIER & PORTION ESTIMATOR ── */}
      <section className="py-16 bg-silk-cream border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="text-center mb-10">
            <span className="text-xs font-bold tracking-widest text-[#775a19] uppercase block mb-2">Interactive Customizer</span>
            <h2 className="font-serif text-3xl lg:text-4xl font-bold text-[#00346f]">Cake Tier &amp; Serving Estimator</h2>
            <p className="text-gray-600 text-xs sm:text-sm max-w-xl mx-auto mt-2 font-sans">
              Select your event size to visualize tiers, estimated guest portions, and handcrafted options.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-white p-6 lg:p-10 rounded-3xl border border-[#c59b27]/20 shadow-xl">
            
            {/* Visual Cake Tier Representation */}
            <div className="lg:col-span-6 flex flex-col items-center justify-center p-8 bg-gradient-to-b from-[#FAF7F2] to-[#F3EEE3] rounded-2xl border border-gray-150 relative min-h-[320px]">
              
              {/* 3D Tier Silhouettes */}
              <div className="flex flex-col items-center justify-end h-64 gap-1.5 transition-all duration-500">
                {selectedTier >= 3 && (
                  <div className="w-24 h-12 bg-gradient-to-r from-[#c59b27] via-[#e0ab51] to-[#775a19] rounded-t-lg shadow-md flex items-center justify-center text-white text-[10px] font-bold font-sans animate-fade-in">
                    6&quot; Top Tier
                  </div>
                )}
                {selectedTier >= 2 && (
                  <div className="w-36 h-14 bg-gradient-to-r from-[#00346f] via-[#1a4a85] to-[#00224d] rounded-md shadow-md flex items-center justify-center text-brand-cream text-xs font-bold font-sans animate-fade-in">
                    8&quot; Mid Tier
                  </div>
                )}
                <div className="w-52 h-16 bg-gradient-to-r from-[#775a19] via-[#8b691e] to-[#5d4201] rounded-b-xl shadow-lg flex items-center justify-center text-white text-sm font-bold font-sans">
                  10&quot; Base Tier
                </div>
              </div>

              <div className="mt-6 flex items-center gap-3 bg-white px-4 py-2 rounded-full border border-gray-200 shadow-xs">
                <Users className="h-4 w-4 text-[#775a19]" />
                <span className="text-xs font-bold font-sans text-[#00346f]">
                  Serves {selectedTier === 1 ? "15 - 20" : selectedTier === 2 ? "35 - 50" : "80 - 120+"} Guests
                </span>
              </div>
            </div>

            {/* Configurator Controls */}
            <div className="lg:col-span-6 space-y-6">
              <div>
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-3 font-sans">Select Cake Tiers</label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { tier: 1, label: "1-Tier", desc: "15-20 Servings" },
                    { tier: 2, label: "2-Tier", desc: "35-50 Servings" },
                    { tier: 3, label: "3-Tier", desc: "80-120+ Servings" }
                  ].map((item) => (
                    <button
                      key={item.tier}
                      onClick={() => setSelectedTier(item.tier)}
                      className={`p-3.5 rounded-xl border text-center transition-all cursor-pointer font-sans min-h-[44px] ${
                        selectedTier === item.tier
                          ? "bg-[#00346f] text-white border-[#00346f] shadow-md scale-102"
                          : "bg-gray-50 hover:bg-gray-100 text-gray-800 border-gray-200"
                      }`}
                    >
                      <div className="text-xs font-bold">{item.label}</div>
                      <div className="text-[10px] opacity-80 mt-0.5">{item.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wider font-sans">Popular Artisanal Flavors</label>
                  <button
                    onClick={() => setIsEggless(!isEggless)}
                    className={`text-[11px] font-sans font-bold px-3 py-1 rounded-full border transition-all flex items-center gap-1.5 cursor-pointer ${
                      isEggless
                        ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                        : "bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-300"
                    }`}
                  >
                    <span>🍃 100% Eggless</span>
                    <span className="opacity-90 font-mono text-[10px]">{isEggless ? "(Checked: +$5 6″ / +$10 8″)" : "(+$5 for 6″ / +$10 for 8″)"}</span>
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {["Rasmalai Fusion", "Belgian Biscoff", "Alphonso Mango", "Belgian Chocolate", "Butterscotch Chantilly"].map((fl) => (
                    <button
                      key={fl}
                      onClick={() => setSelectedFlavor(fl)}
                      className={`text-xs px-3.5 py-2 rounded-lg border font-sans cursor-pointer transition-all min-h-[38px] flex items-center gap-1.5 ${
                        selectedFlavor === fl
                          ? "bg-[#775a19] text-white border-[#775a19] shadow-xs"
                          : "bg-white hover:bg-gray-50 text-gray-700 border-gray-200"
                      }`}
                    >
                      {selectedFlavor === fl && <Check className="h-3.5 w-3.5" />}
                      <span>{fl}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200/80 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-[#775a19] uppercase block tracking-wider font-sans">Selected Configuration</span>
                  <div className="text-xs font-serif font-bold text-[#00346f]">
                    {selectedTier}-Tier Cake ({selectedFlavor}) {isEggless && <span className="text-emerald-700 font-sans text-[11px] font-bold">[Eggless: +${selectedTier === 1 ? 5 : 10}]</span>}
                  </div>
                </div>
                <button
                  onClick={onCreateQuote}
                  className="min-h-[44px] bg-[#775a19] hover:bg-[#5d4201] text-white text-xs font-bold uppercase tracking-wider px-5 py-2.5 rounded-lg shadow-sm transition-all flex items-center gap-1.5 cursor-pointer font-sans"
                >
                  <span>Build Quote</span>
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── MOBILE SAFE-AREA BOTTOM ACTION DOCK ── */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#00346f]/95 backdrop-blur-md border-t border-[#c59b27]/30 p-3 pb-safe shadow-2xl">
        <div className="flex items-center gap-3">
          <button
            onClick={onCreateQuote}
            className="flex-1 min-h-[44px] bg-[#775a19] hover:bg-[#5d4201] text-white font-sans text-xs font-bold uppercase tracking-wider rounded-xl shadow-md flex items-center justify-center gap-2 cursor-pointer"
          >
            <Cake className="h-4 w-4 text-brand-gold-tint" />
            <span>Create Cake Quote</span>
          </button>
          <button
            onClick={onOpenBaker}
            className="flex-1 min-h-[44px] border border-brand-gold-tint hover:bg-white/10 text-brand-cream font-sans text-xs font-bold uppercase tracking-wider rounded-xl flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <MessageSquare className="h-4 w-4" />
            <span>Talk to Baker</span>
          </button>
        </div>
      </div>

    </div>
  );
}

