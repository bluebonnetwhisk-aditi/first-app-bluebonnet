import { 
  Sparkles, 
  ShieldCheck, 
  Heart,
  Cake,
  Utensils,
  Leaf,
  ArrowRight
} from "lucide-react";
import founderKitchenStoryGif from "../assets/images/founder_kitchen_story.gif";
import diwaliFriscoVegSpreadImg from "../assets/images/diwali_frisco_veg_spread.jpg";
import hygieneFriscoWalnutKitchenImg from "../assets/images/hygiene_frisco_walnut_kitchen.jpg";

export default function AboutPage() {
  const handleNavigateToPath = (path: string) => {
    if (typeof window !== "undefined") {
      window.history.pushState(null, "", path);
      window.dispatchEvent(new PopStateEvent("popstate"));
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const signaturePillars = [
    {
      tag: "Clean Patisserie",
      title: "Zero Fondant, Zero Toxins",
      desc: "Show-stopping celebration cakes don't need heavy fondant, synthetic chemical dyes, or cloying syrups. We craft with light whipped creams, real fruit reductions, pure saffron, pistachio, and balanced sweetness.",
      icon: Cake
    },
    {
      tag: "Wholesome Cooking",
      title: "Fresh, Light & Soda-Free",
      desc: "Authentic Indian food should nourish you, never weigh you down. Every Desi Dabba tiffin and catering tray is cooked fresh in small batches with light homestyle oils, freshly roasted whole spices, and zero baking soda.",
      icon: Utensils
    },
    {
      tag: "Dietary Integrity",
      title: "100% Pure Veg, Satvik & Eggless",
      desc: "From strict No-Onion/No-Garlic (Satvik) pooja feasts to 100% Eggless designer cakes (+$) that stay irresistibly soft and moist, our dedicated pure-vegetarian kitchen honors your family's traditions.",
      icon: Leaf
    },
    {
      tag: "Community & Craft",
      title: "Proudly Women-Owned in Frisco",
      desc: "Born from a passion to serve our Frisco, Little Elm, and DFW neighbors the food we are proud to feed our own children—evolving with every batch to deliver honest flavor and responsible indulgence.",
      icon: Heart
    }
  ];

  const experienceCards = [
    {
      badge: "DESI DABBA • DAILY MEALS",
      title: "Explore Daily Tiffin",
      desc: "Fresh homestyle weekday & weekend dabbas with soft rotis, seasonal sabzis, dals, and rotating regional specials.",
      cta: "View Tiffin Menu",
      path: "/catering/tiffin",
      icon: Utensils
    },
    {
      badge: "100% PURE VEG • EVENTS",
      title: "Build a Party Catering Quote",
      desc: "Transparent 4-tier tray pricing (1/3, Half, 2.4\" Full & 3.4\" XL Full), Dilli 6 chaat, and strict Satvik pooja menus.",
      cta: "Explore Catering Trays",
      path: "/catering/food",
      icon: Sparkles
    },
    {
      badge: "FONDANT-FREE • PATISSERIE",
      title: "Design a Custom Cake",
      desc: "Handcrafted celebration cakes, Indian fusion flavors (Rasmalai, Gulab Jamun, Mango), dessert jars, and 100% Eggless (+$) options.",
      cta: "Configure Your Cake",
      path: "/catering/cake",
      icon: Cake
    }
  ];

  return (
    <div className="royal-dark-page bg-[#050a1a] min-h-screen animate-fade-in font-sans selection:bg-[#D4AF37]/20 text-[#fbfbfa]">
      
      {/* ── SECTION 1: OUR STORY & THE NAME BEHIND BLUEBONNET WHISK ── */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-14 lg:py-16 overflow-hidden">
        
        {/* Subtle ambient background glow */}
        <div className="pointer-events-none absolute -top-24 left-1/4 w-96 h-96 rounded-full bg-[#D4AF37]/10 blur-3xl" />

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Column: Native Auto-Playing Animated GIF Blended with Royal Navy & Gold Palette */}
          <div className="md:col-span-5 max-w-sm sm:max-w-md mx-auto md:max-w-none w-full">
            <div className="relative rounded-2xl overflow-hidden shadow-[0_16px_48px_rgba(0,0,0,0.65)] border border-[#D4AF37]/40 bg-[#050a1a] group">
              
              {/* Soft inner vignette ring so the navy-and-gold animated GIF melts into the #050a1a layout */}
              <div className="pointer-events-none absolute inset-0 z-10 rounded-2xl ring-1 ring-inset ring-[#D4AF37]/30 shadow-[inset_0_0_28px_rgba(5,10,26,0.75)]" />

              <img 
                src={founderKitchenStoryGif} 
                alt="Animated Bluebonnet Whisk & Desi Dabba Frisco Home Kitchen with American Walnut Island" 
                className="w-full h-auto object-cover block"
              />

              {/* Bottom Glass Caption Bar */}
              <div className="relative z-20 bg-gradient-to-t from-[#050a1a] via-[#050a1a]/95 to-transparent px-4 pt-5 pb-3.5 border-t border-[#D4AF37]/25">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#ffdea5] block">
                      Our Frisco Home Kitchen
                    </span>
                    <p className="font-serif text-xs sm:text-sm text-white font-semibold mt-0.5">
                      Bluebonnet Whisk &amp; Desi Dabba • Frisco &amp; Little Elm, TX
                    </p>
                  </div>
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#775a19]/40 border border-[#D4AF37]/50 text-[#ffdea5] text-[10px] font-bold uppercase tracking-wider shrink-0">
                    <Sparkles className="w-3 h-3" /> Women Owned
                  </span>
                </div>
              </div>

            </div>
          </div>

          {/* Right Column: Our Positive Story & The Origin of "Bluebonnet Whisk" (Justified Text) */}
          <div className="md:col-span-7 space-y-5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#775a19]/25 border border-[#D4AF37]/40 text-[#ffdea5] text-[10px] sm:text-xs font-bold tracking-widest uppercase">
              <Sparkles className="w-3.5 h-3.5 text-[#ffdea5]" />
              <span>Our Story &amp; Philosophy</span>
            </div>

            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#FBF8F3] tracking-tight leading-tight">
              Authentic Flavors, Mindful Ingredients &amp;{" "}
              <span className="italic text-[#ffdea5]">Responsible Indulgence.</span>
            </h1>

            <div className="h-0.5 w-16 bg-[#D4AF37]" />
            
            <div className="space-y-4 text-gray-200 text-xs sm:text-sm lg:text-base leading-relaxed font-sans text-justify">
              <p>
                <strong className="text-white">Bluebonnet Whisk</strong> was born right here in <strong className="text-[#ffdea5] font-semibold">Frisco, TX</strong> from a simple wish: to bring consistent, authentic Indian flavors and truly wholesome, high-quality bakes to our local community. We wanted a place where everyday meals and milestone celebrations feel equally special—crafted with the warmth, care, and health-centric standards of our own family table.
              </p>

              {/* Story Behind the Name Callout */}
              <div className="bg-[#0f1938]/95 border border-[#D4AF37]/40 rounded-xl p-4 sm:p-5 space-y-1.5 shadow-md">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#ffdea5] block text-left">
                  Why the Name &ldquo;Bluebonnet Whisk&rdquo;?
                </span>
                <p className="text-xs sm:text-sm text-gray-200 leading-relaxed text-justify">
                  When we first arrived in Texas, wild <strong className="text-[#ffdea5]">bluebonnets</strong> were blooming everywhere we looked—an unforgettable welcome to the place we now call home. And when the dream of starting this kitchen took shape, the very first tool purchased for the business was a <strong className="text-[#ffdea5]">professional baker&apos;s whisk</strong>. Putting the two together became our name and our compass: rooted in our Texas community and handcrafted one batch at a time.
                </p>
              </div>

              <p>
                We believe <strong className="text-[#ffdea5] font-semibold">celebration cakes don&apos;t need heavy fondants, artificial dyes, or harsh sweeteners</strong> to look stunning and taste indulgent—freshly whipped creams, real fruit reductions, saffron, and cardamom shine brightest on their own. Similarly, through our savory kitchen <strong className="text-white">Desi Dabba</strong>, we prove that <strong className="text-[#ffdea5] font-semibold">Indian food can be deeply flavorful, fresh, and nourishing</strong> when cooked in small batches with light homestyle oils and freshly ground spices.
              </p>

              <p className="text-gray-300 italic text-xs sm:text-sm border-l-3 border-[#D4AF37] pl-3.5 text-justify">
                “We are always learning and refining our craft with every order, guided by one constant promise: serving our neighbors delicious, responsible food that brings pure joy to the table.”
              </p>
            </div>

          </div>

        </div>

        {/* ── 4 FULL-WIDTH IMPACTFUL PILLAR BOXES SPREAD ACROSS THE PAGE ── */}
        <div className="mt-12 lg:mt-14 pt-10 border-t border-[#D4AF37]/20">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {signaturePillars.map((pillar, idx) => {
              const IconComponent = pillar.icon;
              return (
                <div
                  key={idx}
                  className="p-5 sm:p-6 rounded-2xl bg-[#0f1938] border border-[#D4AF37]/35 shadow-lg hover:border-[#D4AF37]/70 transition-all duration-300 flex flex-col justify-between space-y-3"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-[#ffdea5]">
                        {pillar.tag}
                      </span>
                      <div className="w-8 h-8 rounded-lg bg-[#775a19]/30 border border-[#D4AF37]/40 flex items-center justify-center text-[#ffdea5] shrink-0">
                        <IconComponent className="w-4 h-4" />
                      </div>
                    </div>
                    <h3 className="font-serif text-base sm:text-lg font-bold text-[#FBF8F3] leading-snug">
                      {pillar.title}
                    </h3>
                    <p className="text-xs text-gray-300 leading-relaxed font-sans text-left">
                      {pillar.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </section>

      {/* ── SECTION 2: WHAT SETS OUR KITCHEN APART (6/6 BALANCED SPLIT WITH PHOTOREALISTIC FRISCO DIWALI PARTY VEG SPREAD) ── */}
      <section className="bg-[#0a1128] border-t border-b border-[#D4AF37]/20 py-14 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* Left Column: Checklist (6 cols, Justified Text) */}
            <div className="md:col-span-6 space-y-5">
              <div>
                <span className="text-[10px] font-bold text-[#ffdea5] tracking-widest uppercase block font-sans">THE BLUEBONNET DIFFERENCE</span>
                <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-[#FBF8F3]">What Sets Our Kitchen Apart</h2>
                <div className="h-0.5 w-16 bg-[#D4AF37] mt-2" />
              </div>

              <div className="space-y-3.5 pt-1">
                {[
                  "Made fresh to order in small batches — every cake sponge, curry, and roti is prepared specifically for your pickup or event.",
                  "Fondant-free custom cakes & fusion desserts crafted with silky fresh creams, real saffron, pistachio, cardamom, and seasonal fruit.",
                  "100% Pure Vegetarian Indian spreads featuring regional favorites — from Dilli 6 chaat and Punjabi staples to strict Satvik pooja menus.",
                  "Health-conscious preparation using light homestyle oils, freshly roasted whole spices, and zero baking soda.",
                  "Interactive live stations (Pani Puri, Chaat, Hot Jalebi & Rabri) and warm, neighborly coordination across Frisco, Little Elm & DFW."
                ].map((point, index) => (
                  <div key={index} className="flex gap-3.5 items-start">
                    <div className="h-6 w-6 rounded-full bg-[#775a19]/30 border border-[#D4AF37]/40 text-[#ffdea5] flex items-center justify-center shrink-0 mt-0.5">
                      <Sparkles className="h-3.5 w-3.5" />
                    </div>
                    <p className="text-gray-200 text-xs lg:text-sm font-sans leading-relaxed font-medium text-justify flex-1">
                      {point}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column: Photorealistic Frisco Diwali Party Indian Vegetarian Spread (6 cols) */}
            <div className="md:col-span-6">
              <div className="rounded-2xl overflow-hidden shadow-xl border-2 border-[#D4AF37]/40 bg-[#0f1938] relative group">
                <div className="aspect-[4/3] w-full overflow-hidden">
                  <img 
                    src={diwaliFriscoVegSpreadImg} 
                    alt="Diwali house party in Frisco featuring a 100% pure vegetarian Indian feast spread" 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-102 block"
                  />
                </div>
                <div className="bg-gradient-to-t from-[#050a1a] via-[#050a1a]/95 to-transparent px-4 py-3.5 border-t border-[#D4AF37]/25">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#ffdea5] block">
                    Festive Pure-Veg Spreads • Frisco, TX
                  </span>
                  <p className="text-xs text-gray-200 font-serif mt-0.5 text-left">
                    Handcrafted Indian vegetarian feasts, chaat platters &amp; fusion dessert jars for home celebrations.
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── SECTION 3: UNCOMPROMISING HOME-KITCHEN HYGIENE (6/6 BALANCED SPLIT WITH PHOTOREALISTIC FRISCO WALNUT KITCHEN) ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Column: Photorealistic Frisco American Walnut Center-Island Kitchen with Decor & Indian Spices (6 cols) */}
          <div className="md:col-span-6">
            <div className="rounded-2xl overflow-hidden shadow-xl border-2 border-[#D4AF37]/40 bg-[#0f1938] relative group">
              <div className="aspect-[4/3] w-full overflow-hidden">
                <img 
                  src={hygieneFriscoWalnutKitchenImg} 
                  alt="Spotless Frisco home kitchen with American walnut center island, Indian spices, and fresh ingredients" 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-102 block"
                />
              </div>
              <div className="bg-gradient-to-t from-[#050a1a] via-[#050a1a]/95 to-transparent px-4 py-3.5 border-t border-[#D4AF37]/25">
                <p className="text-xs font-sans font-bold italic tracking-wide text-[#ffdea5] text-left">
                  “Whole Indian spices, fresh produce, and spotless preparation on our American walnut island.”
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Hygiene Story Content (6 cols, Justified Text) */}
          <div className="md:col-span-6 space-y-5">
            <div className="flex items-center gap-2.5">
              <div className="h-7 w-7 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <span className="text-[10px] font-bold text-emerald-400 tracking-widest uppercase block font-sans">SAFETY &amp; TRUST STANDARD</span>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-[#FBF8F3] tracking-tight">
              Uncompromising Home-Kitchen Hygiene
            </h2>
            <div className="h-0.5 w-14 bg-[#D4AF37]" />
            
            <p className="text-gray-200 text-xs lg:text-sm font-sans leading-relaxed text-justify">
              Cleanliness, ingredient purity, and food safety are the foundation of our Frisco home kitchen. Because we cook for families, kids, and elders across our neighborhood, we follow strict sanitization and fresh-prep practices at every step—from roasting whole aromatic Indian spices and washing fresh herbs to sealing your hot Desi Dabba tiffins and custom cake boxes.
            </p>

            <div className="space-y-3 pt-1">
              {[
                "Small-batch daily preparation so food goes straight from our stove and oven to your table.",
                "100% sanitized American walnut island prep surfaces, mixers, and stainless-steel cookware before every batch.",
                "Dedicated 100% pure vegetarian kitchen with strict protocols for Satvik (No-Onion/No-Garlic) & Eggless bakes."
              ].map((bullet, idx) => (
                <div key={idx} className="flex items-start gap-3 text-xs text-gray-200 font-sans font-medium">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-300 font-bold text-[10px] shrink-0 mt-0.5">✓</span>
                  <span className="text-justify flex-1 leading-relaxed">{bullet}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* ── SECTION 4: EXPERIENCE OUR KITCHEN (DIRECT CONVERSION BRIDGE) ── */}
      <section className="bg-[#0a1128] border-t border-[#D4AF37]/20 py-14 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-[10px] font-bold tracking-widest text-[#ffdea5] uppercase block">
              TASTE THE DIFFERENCE
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-[#FBF8F3]">
              Experience Our Kitchen
            </h2>
            <p className="text-xs sm:text-sm text-gray-300 font-sans">
              Ready to enjoy wholesome homestyle Indian cooking or a fondant-free custom celebration cake? Choose an experience below to explore live menus and dates:
            </p>
            <div className="h-0.5 w-16 bg-[#D4AF37] mx-auto mt-3" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {experienceCards.map((card, idx) => {
              const IconComponent = card.icon;
              return (
                <div
                  key={idx}
                  onClick={() => handleNavigateToPath(card.path)}
                  className="p-6 rounded-2xl bg-[#0f1938] border border-[#D4AF37]/35 shadow-xl hover:border-[#D4AF37] hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between space-y-5 cursor-pointer group"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-[#ffdea5]">
                        {card.badge}
                      </span>
                      <div className="w-9 h-9 rounded-xl bg-[#775a19]/30 border border-[#D4AF37]/40 flex items-center justify-center text-[#ffdea5] shrink-0">
                        <IconComponent className="w-4 h-4" />
                      </div>
                    </div>
                    <h3 className="font-serif text-xl font-bold text-[#FBF8F3] group-hover:text-[#ffdea5] transition-colors">
                      {card.title}
                    </h3>
                    <p className="text-xs text-gray-300 leading-relaxed font-sans text-left">
                      {card.desc}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleNavigateToPath(card.path);
                    }}
                    className="w-full min-h-[42px] px-4 py-2.5 rounded-xl bg-[#775a19] group-hover:bg-[#5d4201] text-white text-xs font-bold uppercase tracking-widest border border-[#D4AF37]/40 inline-flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <span>{card.cta}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#ffdea5] group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>
              );
            })}
          </div>

        </div>
      </section>

    </div>
  );
}
