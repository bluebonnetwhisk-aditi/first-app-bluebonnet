import { Sparkles, MessageSquare, Mail } from "lucide-react";

interface CateringPageProps {
  onOpenWizard: () => void; // bound to opening TalkToKitchenModal in App.tsx
}

export default function CateringPage({ onOpenWizard }: CateringPageProps) {
  // Navigation scrolling helper
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="bg-brand-cream-light min-h-screen animate-fade-in font-sans selection:bg-secondary-brand/20">
      
      {/* ── 1. HERO SECTION (FULL WIDTH) ── */}
      <section className="relative min-h-[80vh] flex items-center justify-center py-20 bg-cover bg-center" style={{ backgroundImage: "url('src/assets/images/catering_spread_hero.png')" }}>
        <div className="absolute inset-0 bg-[#001f4a]/75 mix-blend-multiply" />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-cream-light via-transparent to-transparent opacity-90" />
        
        <div className="relative z-10 max-w-5xl mx-auto px-4 text-center space-y-6 text-white pt-8">
          <span className="inline-block bg-[#ffdea5]/10 text-brand-gold-tint border border-[#ffdea5]/20 px-4 py-1.5 rounded-full text-[10px] lg:text-xs font-sans tracking-widest uppercase font-black">
            Frisco, Texas Premier Indian Fusion Catering
          </span>
          <h1 className="font-serif text-4xl lg:text-5xl lg:text-6xl font-bold tracking-tight text-brand-cream leading-tight drop-shadow-sm">
            BLUEBONNET WHISK CATERING
          </h1>
          <p className="font-serif text-lg lg:text-2xl text-brand-gold-tint italic max-w-3xl mx-auto font-medium">
            Authentic Indian Food • Custom Menus
          </p>
          <p className="font-sans text-xs lg:text-sm lg:text-base text-gray-200 max-w-2xl mx-auto leading-relaxed font-semibold">
            Freshly prepared with care for every celebration. From custom spice profiles to hand-decorated setups, we bring modern culinary artistry to your venue.
          </p>
          <p className="text-[11px] lg:text-xs text-brand-gold-tint/90 max-w-lg mx-auto font-medium">
            Perfect for birthdays, weddings, baby showers, corporate events & festivals.
          </p>

          <div className="flex flex-col lg:flex-row justify-center items-center gap-4 pt-6">
            <button
              onClick={onOpenWizard}
              className="w-full lg:w-auto bg-secondary-brand hover:bg-[#5d4201] text-white font-sans text-xs uppercase tracking-widest font-bold px-8 py-4 rounded shadow-xl transition-all cursor-pointer hover:scale-101 duration-300"
            >
              Plan Your Event
            </button>
            <button
              onClick={() => scrollToSection("menu-nav")}
              className="w-full lg:w-auto border border-brand-gold-tint hover:bg-white/10 text-brand-gold-tint font-sans text-xs uppercase tracking-widest font-bold px-8 py-4 rounded transition-all cursor-pointer"
            >
              View Menu
            </button>
          </div>
        </div>
      </section>

      {/* ── 2. INTRO / OCCASION STRIP ── */}
      <section id="menu-nav" className="bg-[#00346f] text-white border-y border-[#775a19]/35 py-6">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-[10px] tracking-widest uppercase text-brand-gold-tint font-bold mb-3 font-sans">
            PERFECT FOR YOUR SPECIAL OCCASIONS
          </p>
          <div className="flex flex-wrap justify-center items-center gap-x-6 gap-y-2.5 text-xs lg:text-sm font-semibold font-serif text-brand-cream">
            <span>Birthdays</span>
            <span className="text-brand-gold-tint/50">•</span>
            <span>Anniversaries</span>
            <span className="text-brand-gold-tint/50">•</span>
            <span>Baby Showers</span>
            <span className="text-brand-gold-tint/50">•</span>
            <span>Graduations</span>
            <span className="text-brand-gold-tint/50">•</span>
            <span>Corporate Events</span>
            <span className="text-brand-gold-tint/50">•</span>
            <span>Festivals</span>
            <span className="text-brand-gold-tint/50">•</span>
            <span>Family Gatherings</span>
          </div>
        </div>
      </section>

      {/* Categories Sub-nav */}
      <div className="bg-white border-b border-gray-150 py-4 sticky top-16 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 flex flex-wrap justify-center gap-2 lg:gap-4">
          {[
            { label: "CHAAT", id: "chaat" },
            { label: "APPETIZERS", id: "appetizers" },
            { label: "MAINS", id: "mains" },
            { label: "BREADS & RICE", id: "breads-rice" },
            { label: "SIDES", id: "sides" },
            { label: "REFRESHMENTS", id: "refreshments" },
            { label: "DESSERT TABLE", id: "dessert-table" },
            { label: "SWEET ENDINGS", id: "sweet-endings" },
            { label: "HOUSE SPECIALS", id: "house-specials" }
          ].map((btn) => (
            <button
              key={btn.id}
              onClick={() => scrollToSection(btn.id)}
              className="border border-[#775a19]/40 hover:bg-[#775a19]/5 px-3 py-1.5 text-[9px] lg:text-[10px] font-bold tracking-widest text-[#775a19] uppercase rounded-sm transition-all cursor-pointer font-sans"
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Menu Scroll Flow */}
      <main className="max-w-6xl mx-auto px-4 lg:px-6 lg:px-8 py-16 space-y-24">

        {/* ── 3. CHATPATI CHAAT SECTION ── */}
        <section id="chaat" className="scroll-mt-32">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center bg-white border border-gray-150 rounded-lg overflow-hidden shadow-xs">
            <div className="relative h-[250px] lg:h-[420px] overflow-hidden group">
              <img 
                src="src/assets/images/live_chaat_station.png" 
                alt="Vibrant Delhi live chaat counter" 
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-102"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              <span className="absolute bottom-4 left-4 bg-secondary-brand text-white text-[9px] font-bold tracking-widest uppercase px-3 py-1 rounded shadow">
                LIVE CHEF STATION AVAILABLE
              </span>
            </div>
            <div className="p-6 lg:p-10 space-y-4">
              <span className="text-[10px] font-bold tracking-widest text-secondary-brand uppercase block font-sans">DELHI STREET FLAVORS</span>
              <h2 className="font-serif text-3xl font-bold text-primary-brand">CHATPATI CHAAT</h2>
              <p className="text-gray-500 font-sans text-xs uppercase tracking-widest block font-bold">Authentic flavors inspired by the streets of Delhi</p>
              <div className="h-0.5 w-12 bg-secondary-brand mt-1 mb-4" />
              <p className="text-gray-600 text-xs lg:text-sm font-sans leading-relaxed">
                Add an interactive, theatrical touch to your celebrations with our live chaat setups. Freshly layered crisps, cold seasoned yogurt, and aromatic custom herb spice mixtures.
              </p>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 pt-2">
                {["Pani Puri", "Papri Chaat", "Dahi Bhalla", "Samosa Chaat", "Aloo Tikki Chaat"].map((item) => (
                  <div key={item} className="flex items-center gap-2.5 text-xs text-gray-700 font-sans font-medium">
                    <span className="h-1.5 w-1.5 bg-[#775a19] rounded-full shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── 4. APPETIZERS SECTION ── */}
        <section id="appetizers" className="scroll-mt-32">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center bg-white border border-gray-150 rounded-lg overflow-hidden shadow-xs">
            <div className="p-6 lg:p-10 space-y-4 order-2 lg:order-1">
              <span className="text-[10px] font-bold tracking-widest text-secondary-brand uppercase block font-sans">DELIGHTFUL STARTERS</span>
              <h2 className="font-serif text-3xl font-bold text-primary-brand">APPETIZERS</h2>
              <p className="text-gray-500 font-sans text-xs uppercase tracking-widest block font-bold">Flavor-packed bites to start the celebration</p>
              <div className="h-0.5 w-12 bg-secondary-brand mt-1 mb-4" />
              <p className="text-gray-600 text-xs lg:text-sm font-sans leading-relaxed">
                A thoughtfully curated flight of handcrafted finger foods combining classic Indian spices with global presentations. Hot, crisp, and beautifully styled.
              </p>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 pt-2">
                {[
                  "Cocktail Samosas", "Spring Rolls",
                  "Hara Bhara Kebabs", "Beetroot Tikki",
                  "Veg/Paneer Pakora", "Pav Bhaji",
                  "Soya Keema Sliders", "Paneer Bhurji Sliders"
                ].map((item) => (
                  <div key={item} className="flex items-center gap-2 text-xs text-gray-700 font-sans font-medium">
                    <span className="h-1.5 w-1.5 bg-[#775a19] rounded-full shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative h-[250px] lg:h-[420px] overflow-hidden group order-1 lg:order-2">
              <img 
                src="src/assets/images/appetizer_platter.png" 
                alt="Premium Indian Appetizers Platter" 
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-102"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              <span className="absolute bottom-4 left-4 bg-secondary-brand text-white text-[9px] font-bold tracking-widest uppercase px-3 py-1 rounded shadow">
                INDIVIDUAL PORTION STYLING
              </span>
            </div>
          </div>
        </section>

        {/* ── 5. MAINS SECTION ── */}
        <section id="mains" className="scroll-mt-32">
          <div className="text-center mb-10">
            <span className="text-[10px] font-bold tracking-widest text-secondary-brand uppercase block font-sans">MAIN COURSE EXPERIENCES</span>
            <h2 className="font-serif text-3xl lg:text-4xl font-bold text-primary-brand">MAINS</h2>
            <p className="text-gray-500 font-sans text-xs uppercase tracking-widest block font-bold">Homestyle favorites &amp; celebration classics</p>
            <div className="h-0.5 w-16 bg-secondary-brand mt-3 mx-auto" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            {/* Left Image Column */}
            <div className="lg:col-span-4 h-[200px] lg:h-auto rounded-lg overflow-hidden border border-gray-150 relative group">
              <img 
                src="src/assets/images/curry_buffet.png" 
                alt="Indian Curries Buffet Spread" 
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-102"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#001f4a]/70 via-[#001f4a]/20 to-transparent" />
              <div className="absolute bottom-4 left-4 text-white">
                <span className="text-[8px] font-bold tracking-widest uppercase bg-brand-gold-tint text-primary-brand px-2 py-0.5 rounded-sm">Slow Cooked</span>
                <p className="font-serif text-sm font-bold mt-1 text-brand-cream">Rich &amp; Authentic Gravies</p>
              </div>
            </div>

            {/* Right Cards List */}
            <div className="lg:col-span-8 grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Card 1: Dal & Curry */}
              <div className="bg-white border border-gray-150 p-6 rounded-lg shadow-2xs flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="h-8 w-8 rounded-full bg-[#775a19]/10 text-[#775a19] flex items-center justify-center font-bold font-serif text-xs">D</div>
                  <h3 className="font-serif text-lg font-bold text-[#00346f] border-b border-gray-100 pb-2">Dal &amp; Curry</h3>
                  <ul className="space-y-2">
                    {["Daal Makhani", "Yellow Dal Fry", "Rajma Masala", "Pindi Chole", "Punjabi Kadhi Pakoda"].map((item) => (
                      <li key={item} className="text-xs font-sans text-gray-600 font-medium flex gap-2">
                        <span className="text-secondary-brand">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Card 2: Vegetarian Specials */}
              <div className="bg-white border border-gray-150 p-6 rounded-lg shadow-2xs flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="h-8 w-8 rounded-full bg-[#775a19]/10 text-[#775a19] flex items-center justify-center font-bold font-serif text-xs">V</div>
                  <h3 className="font-serif text-lg font-bold text-[#00346f] border-b border-gray-100 pb-2">Vegetarian Specials</h3>
                  <ul className="space-y-2">
                    {["Jeera Aloo", "Aloo Gobi", "Subz Bahaar"].map((item) => (
                      <li key={item} className="text-xs font-sans text-gray-600 font-medium flex gap-2">
                        <span className="text-secondary-brand">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Card 3: Paneer Specials */}
              <div className="bg-white border border-gray-150 p-6 rounded-lg shadow-2xs flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="h-8 w-8 rounded-full bg-[#775a19]/10 text-[#775a19] flex items-center justify-center font-bold font-serif text-xs">P</div>
                  <h3 className="font-serif text-lg font-bold text-[#00346f] border-b border-gray-100 pb-2">Paneer Specials</h3>
                  <ul className="space-y-2">
                    {["Paneer Lababdar", "Karahi Paneer", "Matar Paneer", "Palak Paneer", "Paneer Bhurji", "Kesar Malai Kofta"].map((item) => (
                      <li key={item} className="text-xs font-sans text-gray-600 font-medium flex gap-2">
                        <span className="text-secondary-brand">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── 6. BREADS & RICE SECTION ── */}
        <section id="breads-rice" className="scroll-mt-32">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center bg-white border border-gray-150 rounded-lg overflow-hidden shadow-xs">
            <div className="relative h-[250px] lg:h-[420px] overflow-hidden group">
              <img 
                src="src/assets/images/breads_rice_buffet.png" 
                alt="Naan Basket and Vegetable Biryani Buffet" 
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-102"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              <span className="absolute bottom-4 left-4 bg-secondary-brand text-white text-[9px] font-bold tracking-widest uppercase px-3 py-1 rounded shadow">
                SERVED PIPING HOT
              </span>
            </div>
            <div className="p-6 lg:p-10 space-y-6">
              <div>
                <span className="text-[10px] font-bold tracking-widest text-secondary-brand uppercase block font-sans">STAPLES &amp; BIRYANIS</span>
                <h2 className="font-serif text-3xl font-bold text-primary-brand">BREADS &amp; RICE</h2>
                <div className="h-0.5 w-12 bg-secondary-brand mt-2" />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h4 className="font-serif text-sm font-bold text-[#00346f] mb-3 uppercase tracking-wider">Fresh Breads</h4>
                  <ul className="space-y-2">
                    {["Naan (Plain, Butter, Garlic)", "Tawa Roti", "Paratha", "Masala Poori"].map((item) => (
                      <li key={item} className="text-xs font-sans text-gray-600 font-medium flex gap-2">
                        <span className="text-secondary-brand">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-serif text-sm font-bold text-[#00346f] mb-3 uppercase tracking-wider">Rice</h4>
                  <ul className="space-y-2">
                    {["Basmati Rice", "Jeera Rice", "Peas Pulao", "Vegetable Biryani"].map((item) => (
                      <li key={item} className="text-xs font-sans text-gray-600 font-medium flex gap-2">
                        <span className="text-secondary-brand">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── 7. SIDES & ACCOMPANIMENTS ── */}
        <section id="sides" className="scroll-mt-32">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center bg-white border border-gray-150 rounded-lg overflow-hidden shadow-xs">
            <div className="p-6 lg:p-10 space-y-4 order-2 lg:order-1">
              <span className="text-[10px] font-bold tracking-widest text-secondary-brand uppercase block font-sans">COOL &amp; CRISP ACCOMPANIMENTS</span>
              <h2 className="font-serif text-3xl font-bold text-primary-brand">SIDES</h2>
              <p className="text-gray-500 font-sans text-xs uppercase tracking-widest block font-bold">Fresh, clean additions to elevate the meal</p>
              <div className="h-0.5 w-12 bg-secondary-brand mt-1 mb-4" />
              <p className="text-gray-600 text-xs lg:text-sm font-sans leading-relaxed">
                Cool raitas, crisp salads, and pickled onions prepared fresh. The perfect balance of texture, acid, and temperature to complement spice profiles.
              </p>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-2.5 pt-2">
                {["Green Salad", "Kachumber Salad", "Sirka Pyaaz", "Masala Papad", "Raita"].map((item) => (
                  <div key={item} className="flex items-center gap-2 text-xs text-gray-700 font-sans font-medium">
                    <span className="h-1.5 w-1.5 bg-[#775a19] rounded-full shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative h-[250px] lg:h-[420px] overflow-hidden group order-1 lg:order-2">
              <img 
                src="src/assets/images/sides_accompaniments.png" 
                alt="Fresh Kachumber Salad and Raita" 
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-102"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
            </div>
          </div>
        </section>

        {/* ── 8. REFRESHMENTS ── */}
        <section id="refreshments" className="scroll-mt-32">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center bg-white border border-gray-150 rounded-lg overflow-hidden shadow-xs">
            <div className="relative h-[250px] lg:h-[420px] overflow-hidden group">
              <img 
                src="src/assets/images/beverages_refreshments.png" 
                alt="Indian refreshing drinks lassi and shikanji" 
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-102"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              <span className="absolute bottom-4 left-4 bg-secondary-brand text-white text-[9px] font-bold tracking-widest uppercase px-3 py-1 rounded shadow">
                CHILLED REFRESHMENTS
              </span>
            </div>
            <div className="p-6 lg:p-10 space-y-4">
              <span className="text-[10px] font-bold tracking-widest text-secondary-brand uppercase block font-sans">TRADITIONAL DRINK SELECTIONS</span>
              <h2 className="font-serif text-3xl font-bold text-primary-brand">REFRESHMENTS</h2>
              <p className="text-gray-500 font-sans text-xs uppercase tracking-widest block font-bold">Handcrafted cooling blends for guests</p>
              <div className="h-0.5 w-12 bg-secondary-brand mt-1 mb-4" />
              <p className="text-gray-600 text-xs lg:text-sm font-sans leading-relaxed">
                Keep the party vibe cooling and light with classic house-brewed Indian refreshments. Stretched, blended, and served chilled.
              </p>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-2.5 pt-2">
                {["Masala Shikanji", "Aam Panna", "Rose Sharbat", "Mango Lassi", "Mint Chaach"].map((item) => (
                  <div key={item} className="flex items-center gap-2 text-xs text-gray-700 font-sans font-medium">
                    <span className="h-1.5 w-1.5 bg-[#775a19] rounded-full shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── 9. DESSERT TABLE FAVORITES ── */}
        <section id="dessert-table" className="scroll-mt-32">
          <div className="text-center mb-10">
            <span className="text-[10px] font-bold tracking-widest text-secondary-brand uppercase block font-sans">SIGNATURE FUSION SWEETS</span>
            <h2 className="font-serif text-3xl lg:text-4xl font-bold text-primary-brand">DESSERT TABLE FAVORITES</h2>
            <p className="text-gray-500 font-sans text-xs uppercase tracking-widest block font-bold">Premium patisserie meets heritage flavor curation</p>
            <div className="h-0.5 w-16 bg-secondary-brand mt-3 mx-auto" />
          </div>

          <div className="bg-white border border-gray-150 p-6 lg:p-8 rounded-lg shadow-xs space-y-8">
            {/* Visual Dessert Gallery */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="relative h-44 rounded overflow-hidden shadow-sm group">
                <img 
                  src="src/assets/images/cake_jars_detail_1_1781195027694.jpg" 
                  alt="Premium Cardamom Cake Jars" 
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-102"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-black/20" />
              </div>
              <div className="relative h-44 rounded overflow-hidden shadow-sm group">
                <img 
                  src="src/assets/images/cake_jars_detail_2_1781195040371.jpg" 
                  alt="Pistachio and Rose Cupcakes" 
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-102"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-black/20" />
              </div>
              <div className="relative h-44 rounded overflow-hidden shadow-sm group bg-[#ffdea5]/10 flex flex-col justify-center items-center text-center p-4 border border-dashed border-[#775a19]/30">
                <Sparkles className="h-6 w-6 text-secondary-brand mb-2" />
                <span className="font-serif text-xs font-bold text-[#00346f]">Custom Table Setup</span>
                <p className="text-[10px] text-gray-500 mt-1 font-sans">Gold tiered stands, fresh flowers, customized display styling</p>
              </div>
            </div>

            {/* Content Lists */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-2">
              <div className="space-y-4">
                <h4 className="font-serif text-base font-bold text-[#00346f] border-b border-gray-100 pb-2">Dessert Selection</h4>
                <div className="grid grid-cols-2 gap-2">
                  {["Cake Jars", "Dessert Cups", "Cupcakes", "Cake Pops", "Mini Loaf Cakes", "Cookies"].map((item) => (
                    <div key={item} className="flex items-center gap-2 text-xs text-gray-600 font-sans font-medium">
                      <span className="h-1 w-1 bg-secondary-brand rounded-full" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-serif text-base font-bold text-[#00346f] border-b border-gray-100 pb-2">Popular Flavors</h4>
                <div className="grid grid-cols-2 gap-2">
                  {["Gulab Jamun", "Rasmalai", "Mango", "Strawberry", "Biscoff", "Chocolate", "Red Velvet"].map((item) => (
                    <div key={item} className="flex items-center gap-2 text-xs text-gray-600 font-sans font-medium">
                      <span className="h-1 w-1 bg-secondary-brand rounded-full" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="rounded-md bg-amber-50/45 border border-brand-gold-tint/40 p-4 text-center">
              <p className="text-xs text-[#775a19] font-sans font-medium">
                ⚠️ **Dietary Note**: Custom themes, personalized designs &amp; eggless options are available upon request.
              </p>
            </div>
          </div>
        </section>

        {/* ── 10. SWEET ENDINGS ── */}
        <section id="sweet-endings" className="scroll-mt-32">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center bg-white border border-gray-150 rounded-lg overflow-hidden shadow-xs">
            <div className="p-6 lg:p-10 space-y-4 order-2 lg:order-1">
              <span className="text-[10px] font-bold tracking-widest text-secondary-brand uppercase block font-sans">TRADITIONAL INDIAN SWEETS</span>
              <h2 className="font-serif text-3xl font-bold text-primary-brand">SWEET ENDINGS</h2>
              <p className="text-gray-500 font-sans text-xs uppercase tracking-widest block font-bold">Timeless celebration desserts</p>
              <div className="h-0.5 w-12 bg-secondary-brand mt-1 mb-4" />
              <p className="text-gray-600 text-xs lg:text-sm font-sans leading-relaxed">
                Add an opulent touch with classical desserts. Slow-cooked reduction milk bases, cardamoms, pure saffron strings, and delicate edible silver foil accents.
              </p>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-2.5 pt-2">
                {["Gulab Jamun", "Rasmalai", "Shahi Tukda", "Malpua with Rabri", "Paan Laddoo"].map((item) => (
                  <div key={item} className="flex items-center gap-2 text-xs text-gray-700 font-sans font-medium">
                    <span className="h-1.5 w-1.5 bg-[#775a19] rounded-full shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative h-[250px] lg:h-[420px] overflow-hidden group order-1 lg:order-2">
              <img 
                src="src/assets/images/traditional_sweet_endings.png" 
                alt="Traditional Indian Sweets Plating" 
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-102"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
            </div>
          </div>
        </section>

        {/* ── 11. HOUSE SPECIALS ── */}
        <section id="house-specials" className="scroll-mt-32">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center bg-white border border-gray-150 rounded-lg overflow-hidden shadow-xs">
            <div className="relative h-[250px] lg:h-[420px] overflow-hidden group">
              <img 
                src="src/assets/images/festive_thali_specials.png" 
                alt="Festive Indian Thali Specials" 
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-102"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              <span className="absolute bottom-4 left-4 bg-secondary-brand text-white text-[9px] font-bold tracking-widest uppercase px-3 py-1 rounded shadow">
                FESTIVE SIGNATURE DISHES
              </span>
            </div>
            <div className="p-6 lg:p-10 space-y-4">
              <span className="text-[10px] font-bold tracking-widest text-secondary-brand uppercase block font-sans">BW CULINARY CHESTS</span>
              <h2 className="font-serif text-3xl font-bold text-primary-brand">HOUSE SPECIALS</h2>
              <p className="text-gray-500 font-sans text-xs uppercase tracking-widest block font-bold">Comfort meals &amp; festive staples</p>
              <div className="h-0.5 w-12 bg-secondary-brand mt-1 mb-4" />
              <p className="text-gray-600 text-xs lg:text-sm font-sans leading-relaxed">
                Our signature family recipes designed for authentic Indian festive gatherings, poojas, and celebratory family lunches. Made with fresh butter, custom milled spices, and high devotion.
              </p>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-2.5 pt-2">
                {[
                  "Bedmi Poori Aloo", "Chole Bhature",
                  "Matar Kulcha", "Stuffed Parathas",
                  "Satvik Pooja Food (No Onion No Garlic)"
                ].map((item) => (
                  <div key={item} className="flex items-center gap-2 text-xs text-gray-700 font-sans font-medium">
                    <span className="h-1.5 w-1.5 bg-[#775a19] rounded-full shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

      </main>

      {/* ── 12. FINAL CTA SECTION ── */}
      <section className="max-w-6xl mx-auto px-4 lg:px-6 lg:px-8 py-20 pb-28">
        <div className="bg-gradient-to-br from-[#0a1128] to-[#00346f] text-white rounded-lg p-10 lg:p-14 text-center shadow-lg relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(254,212,136,0.1),transparent_50%)]" />
          <div className="relative z-10 max-w-3xl mx-auto space-y-6">
            <span className="bg-brand-gold-tint/10 text-brand-gold-tint border border-brand-gold-tint/20 px-3 py-1 rounded text-[10px] font-sans tracking-widest uppercase font-bold">
              PLANNING &amp; BOOKING
            </span>
            <h2 className="font-serif text-3xl lg:text-4xl font-bold tracking-tight text-brand-cream">
              LET’S MAKE YOUR CELEBRATION MEMORABLE
            </h2>
            <p className="text-brand-gold-tint/90 text-sm font-serif italic">
              “From intimate gatherings to grand celebrations — we design menus tailored to your event.”
            </p>
            <p className="text-gray-300 text-xs lg:text-sm font-sans leading-relaxed max-w-xl mx-auto">
              Browse our recipes, pick your favorites, and get in touch with our kitchen team. We take care of all sizing, custom flavors, eggless preparations, and elegant table presentation sets.
            </p>

            <div className="flex flex-col lg:flex-row justify-center gap-4 pt-4">
              <button 
                onClick={onOpenWizard}
                className="w-full lg:w-auto bg-secondary-brand hover:bg-[#5d4201] text-white font-sans text-xs uppercase tracking-widest font-bold px-8 py-4 rounded shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                Request Custom Menu
              </button>
              <a 
                href="https://wa.me/19455274566"
                target="_blank" 
                rel="noreferrer"
                className="w-full lg:w-auto border border-brand-gold-tint hover:bg-white/10 text-brand-gold-tint font-sans text-xs uppercase tracking-widest font-bold px-8 py-4 rounded flex items-center justify-center gap-2 cursor-pointer"
              >
                <MessageSquare className="h-4 w-4" /> Talk to Kitchen (WhatsApp)
              </a>
              <a 
                href="mailto:bluebonnetwhisk@gmail.com"
                className="w-full lg:w-auto border border-gray-400 hover:bg-white/10 text-gray-200 font-sans text-xs uppercase tracking-widest font-bold px-8 py-4 rounded flex items-center justify-center gap-2 cursor-pointer"
              >
                <Mail className="h-4 w-4" /> Email Us
              </a>
            </div>

            <div className="pt-6 border-t border-white/10 text-[11px] text-gray-400 font-sans font-medium tracking-wider">
              Custom Cakes &amp; Desserts • Catering &amp; Party Trays • Live Chaat Counters • Custom Menus Available
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
