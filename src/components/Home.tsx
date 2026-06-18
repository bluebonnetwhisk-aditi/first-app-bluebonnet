import { useState, useRef } from "react";
import { motion, useScroll, useTransform, useMotionValueEvent } from "motion/react";
import { ArrowRight, ChevronDown, ChefHat, Clock, Heart, ShieldCheck } from "lucide-react";

interface HomeProps {
  onOpenWizard: (flavor?: string, category?: string) => void;
  onOpenBaker: () => void;
  onNavigate: (tab: string) => void;
}

export default function Home({ onOpenWizard, onOpenBaker, onNavigate }: HomeProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const walkthroughRef = useRef<HTMLDivElement>(null);
  const faqRef = useRef<HTMLDivElement>(null);

  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [activeStage, setActiveStage] = useState<number>(0);
  const [calculatorGuests, setCalculatorGuests] = useState<number>(30);

  // Framer Motion scroll hooks for Hero zoom & text fade transitions
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });


  const videoScale = useTransform(scrollYProgress, [0, 0.25], [1, 1.15]);
  const videoOpacity = useTransform(scrollYProgress, [0, 0.2, 0.4], [0.5, 0.7, 0.8]);
  const heroTextOpacity = useTransform(scrollYProgress, [0, 0.175], [1, 0]);
  const heroTextY = useTransform(scrollYProgress, [0, 0.175], [0, -60]);

  // Walkthrough Scroll Observer
  const { scrollYProgress: walkthroughScroll } = useScroll({
    target: walkthroughRef,
    offset: ["start center", "end center"]
  });

  useMotionValueEvent(walkthroughScroll, "change", (latest) => {
    if (latest < 0.33) {
      setActiveStage(0);
    } else if (latest < 0.66) {
      setActiveStage(1);
    } else {
      setActiveStage(2);
    }
  });


  const getCalculatedRecommendation = (count: number) => {
    if (count <= 15) {
      return {
        trays: "1 Half Tray of Main Course & 1 Third Tray of Appetizers",
        price: "$80 - $115",
        desserts: "1 Third Tray of Rasmalai/Gulab Jamun (12 portions)",
        serves: `Suitable for intimate gatherings of up to ${count} guests`
      };
    } else if (count <= 35) {
      return {
        trays: "2 Half Trays of Main Courses & 1 Half Tray of Appetizers",
        price: "$160 - $220",
        desserts: "1 Half Tray of Indian Fusion desserts (20 portions)",
        serves: `Ideal for parties up to ${count} guests`
      };
    } else if (count <= 60) {
      return {
        trays: "1 Full Tray + 1 Half Tray of Main Courses & 1 Half Tray of Sides",
        price: "$290 - $380",
        desserts: "1 Full Tray of desserts (35 portions)",
        serves: `Perfect for corporate or festive events up to ${count} guests`
      };
    } else {
      return {
        trays: "2 Full Trays of Main Courses, 1 Full Tray of Appetizers & 1 Full Tray of Sides",
        price: "$520 - $690",
        desserts: "2 Full Trays of customized fusion sweets (70 portions)",
        serves: `Best for wedding celebrations & grand crowds up to ${count} guests`
      };
    }
  };

  const rec = getCalculatedRecommendation(calculatorGuests);



  const pricingTiers = [
    {
      name: "Custom Cakes",
      price: "$65",
      period: "starting rate",
      desc: "Artisanal custom celebration, theme, and wedding cakes.",
      features: [
        "6-inch Single starting at $65",
        "8-inch Signature starting at $85",
        "Multi-tier designs starting at $180",
        "Eggless custom recipes included",
        "Custom design consult with chef"
      ],
      cta: "Plan Custom Cake",
      category: "Cakes",
      highlighted: true
    },
    {
      name: "Live Chaat & Counters",
      price: "$7-$14",
      period: "per guest",
      desc: "Theatrical live stations showing cooking craftsmanship.",
      features: [
        "Pani Puri Live: $7-$9 / head",
        "Chaat Live (2 types): $8-$10 / head",
        "Wok Indo-Chinese: $7-$9 / head",
        "Custom Gold/Brass Stalls",
        "Staffed live servers & setup"
      ],
      cta: "Book Live Counter",
      category: "Live Counters",
      highlighted: false
    },
    {
      name: "Catering Trays",
      price: "$40-$65",
      period: "per course",
      desc: "Gourmet main course trays delivered fresh to your door.",
      features: [
        "1/3 Tray serves 8-12 guests",
        "Half Tray serves 15-20 guests",
        "Full Tray serves 30-40 guests",
        "Matar Paneer & Claypot Dal",
        "Tandoor griddle naan breads"
      ],
      cta: "Estimate Tray Portions",
      category: "Menu",
      highlighted: false
    }
  ];

  const faqs = [
    {
      q: "Are eggless options available for all custom cakes and sweets?",
      a: "Yes! 100% eggless recipes are standard or available upon request for all custom cakes, fusion jars, and desserts. We take pride in delivering the same exceptional moisture and lightness without eggs."
    },
    {
      q: "What areas do you serve?",
      a: "We proudly serve birthdays, weddings, corporate events, and cultural celebrations across North Texas, including Frisco, Plano, McKinney, Dallas, and the surrounding DFW metroplex."
    },
    {
      q: "How far in advance should I book my event?",
      a: "For custom celebration cakes and intimate parties, we recommend 1-2 weeks in advance. For large weddings, grazing tables, and corporate events, we prefer 1-3 months notice to design and coordinate the bespoke setup."
    },
    {
      q: "What are your tray portion sizes?",
      a: "Our catering trays come in three sizes: a 1/3 Tray serves approximately 8-12 guests, a Half Tray serves 15-20 guests, and a Full Tray serves 30-40 guests. Servings vary depending on menu selection and event style."
    },
    {
      q: "Do you handle event setup, decoration, and table styling?",
      a: "Yes! We specialize in styling elegant buffet, grazing, and dessert tables. We coordinate custom traditional brassware, marigold flower arrangements, lights, and layout structures to fit your theme."
    }
  ];

  return (
    <div className="bg-[#050a1a] text-white font-sans min-h-screen">
      
      {/* ── HERO SECTION WITH SCROLL VIDEO TRANSITION ── */}
      <section ref={containerRef} className="relative h-[120vh] w-full bg-[#050a1a]">
        
        {/* Sticky video container */}
        <div className="sticky top-0 h-screen w-full overflow-hidden flex items-center justify-center">
          <motion.video 
            ref={videoRef}
            muted 
            playsInline 
            autoPlay
            loop
            preload="auto"
            style={{ scale: videoScale, opacity: videoOpacity }}
            className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none filter brightness-90 saturate-105"
            src="/src/assets/videos/hero.mp4"
          />
          
          {/* Dark Glassmorphic Gradients */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#050a1a]/85 via-transparent to-[#050a1a]" />
          <div className="absolute inset-0 bg-radial-gradient(circle, transparent 20%, #050a1a 95%)" />

          {/* Glowing Content Box */}
          <motion.div 
            style={{ opacity: heroTextOpacity, y: heroTextY }}
            className="relative z-10 max-w-4xl mx-auto px-4 text-center space-y-6"
          >
            <h1 className="font-serif text-4xl lg:text-6xl font-black tracking-tight leading-tight text-brand-cream drop-shadow-md">
              Bringing People Together <br />
              Through <span className="italic text-brand-gold-tint">Authentic Flavors</span> &amp; <span className="italic text-brand-gold-tint">Sweets</span>
            </h1>
            <p className="text-gray-300 text-xs lg:text-sm lg:text-base max-w-xl mx-auto leading-relaxed">
              Made for celebrations that matter. Custom cakes, indulgent desserts, and catering inspired by Indian flavors crafted fresh for your special moments.
            </p>
            <div className="flex flex-wrap justify-center gap-3 pt-4">
              <button 
                onClick={() => {
                  window.location.href = "mailto:bluebonnetwhisk@gmail.com?subject=Custom%20Celebration%20Inquiry";
                }}
                className="px-8 py-4 bg-[#775a19] hover:bg-[#5d4201] text-white text-xs font-bold tracking-widest uppercase rounded shadow-lg transition-all cursor-pointer flex items-center gap-2"
              >
                REQUEST A CUSTOM QUOTE <ArrowRight className="h-3.5 w-3.5" />
              </button>
              <a 
                href="https://wa.me/9455274566"
                target="_blank"
                rel="noopener noreferrer"
                className="px-8 py-4 border border-brand-gold-tint hover:bg-brand-gold-tint/10 text-brand-cream text-xs font-bold tracking-widest uppercase rounded transition-all cursor-pointer inline-flex items-center gap-2"
              >
                CHAT WITH THE CHEF
              </a>
              <button 
                onClick={() => onNavigate("Menu")}
                className="px-8 py-4 glass-panel hover:bg-white/10 text-white text-xs font-bold tracking-widest uppercase rounded transition-all cursor-pointer"
              >
                VIEW DIGITAL MENU
              </button>
            </div>
          </motion.div>
        </div>

      </section>

      {/* ── OUR COMMITMENTS SECTION ── */}
      <section className="py-24 border-t border-white/5 bg-[#050a1a]">
        <div className="max-w-7xl mx-auto px-4 space-y-16">
          
          <div className="text-center max-w-xl mx-auto space-y-2">
            <span className="text-[10px] font-bold text-brand-gold-tint tracking-widest uppercase font-mono">OUR COMMITMENT</span>
            <h2 className="font-serif text-3xl lg:text-4xl font-bold text-brand-cream">Our Commitments to You</h2>
            <p className="text-xs text-gray-400 font-sans">Crafting unforgettable experiences with a dedication to perfection.</p>
            <div className="h-0.5 w-12 bg-brand-gold-tint mx-auto mt-2" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                title: "The Family Promise",
                desc: "We commit to authentic, home-cooked quality using premium ingredients. Our golden rule is simple: if it isn't good enough to feed our own children, it will never leave our kitchen.",
                icon: "Heart"
              },
              {
                title: "Creative & Custom Menus",
                desc: "We commit to bringing excitement to your dining table. Expect unique, innovative fusion cuisine alongside classic comfort foods, custom cakes, and elegant desserts.",
                icon: "ChefHat"
              },
              {
                title: "Mindful & Inclusive Preparation",
                desc: "We commit to respecting your dietary traditions. We proudly specialize in strict No-Onion/No-Garlic savory preparations and 100% premium eggless baking, ensuring everyone can eat safely and joyfully.",
                icon: "ShieldCheck"
              },
              {
                title: "Everyday Convenience",
                desc: "We commit to making your life easier. Whether you are relying on our weekly and monthly tiffin services for busy weeknights, or trusting us to cater your next big event, we deliver the warmth of a home kitchen directly to you.",
                icon: "Clock"
              }
            ].map((commitment, idx) => {
              return (
                <div 
                  key={idx}
                  className="glass-panel-dark rounded-lg p-6 border border-white/5 flex flex-col items-center text-center space-y-4 hover:border-brand-gold-tint/40 transition-all hover:-translate-y-1 duration-300 shadow-lg"
                >
                  <div className="h-12 w-12 rounded-full bg-brand-gold-tint/10 flex items-center justify-center text-brand-gold-tint mb-2">
                    {commitment.icon === "Heart" && <Heart className="h-6 w-6" />}
                    {commitment.icon === "ChefHat" && <ChefHat className="h-6 w-6" />}
                    {commitment.icon === "ShieldCheck" && <ShieldCheck className="h-6 w-6" />}
                    {commitment.icon === "Clock" && <Clock className="h-6 w-6" />}
                  </div>
                  <h3 className="font-serif text-base font-bold text-brand-cream leading-snug">
                    {commitment.title}
                  </h3>
                  <p className="text-gray-300 text-xs leading-relaxed font-sans font-light">
                    {commitment.desc}
                  </p>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* ── VISUAL WALKTHROUGH SECTION ── */}
      <section ref={walkthroughRef} className="relative py-24 border-t border-white/5 bg-[#050a1a]">
        <div className="max-w-7xl mx-auto px-4 w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-start relative">
          
          {/* Left Side: Cards stack */}
          <div className="lg:col-span-5 space-y-12 py-6">
            <div className="space-y-2 mb-6">
              <span className="text-[10px] font-bold text-brand-gold-tint tracking-widest uppercase">THE LUXURY EXPERIENCE</span>
              <h2 className="font-serif text-2xl lg:text-3xl font-bold text-brand-cream">Visual Walkthrough</h2>
              <div className="h-0.5 w-12 bg-brand-gold-tint mt-2" />
            </div>

            {[
              {
                title: "Custom Cakes & Desserts",
                desc: "Made-to-order cakes for birthdays, anniversaries, and milestones. Theme cakes, kids birthdays, and desserts including trending cake jars and mini cake loaves.",
                tab: "Cakes"
              },
              {
                title: "Catering",
                desc: "Whether it's a birthday, corporate event, or family gathering, we've got the menu covered.",
                tab: "Catering"
              },
              {
                title: "Custom Party Packages",
                desc: "Bring Your Celebration to Life with Our Custom Party Packages",
                tab: "Live Counters"
              }
            ].map((item, idx) => {
              const isActive = activeStage === idx;
              return (
                <div key={idx} style={{ minHeight: "45vh" }} className="flex items-center py-4">
                  <div 
                    className={`w-full p-6 rounded border transition-all duration-500 cursor-pointer ${
                      isActive 
                        ? "bg-[#0b1b40]/80 border-brand-gold-tint shadow-2xl scale-[1.02]" 
                        : "bg-[#0f1938]/30 border-white/5 opacity-40 hover:opacity-75"
                    }`}
                    onClick={() => {
                      const container = walkthroughRef.current;
                      if (container) {
                        const rect = container.getBoundingClientRect();
                        const absoluteTop = window.pageYOffset + rect.top;
                        const scrollTarget = absoluteTop + (idx / 2) * (rect.height - window.innerHeight);
                        window.scrollTo({ top: scrollTarget, behavior: "smooth" });
                      }
                    }}
                  >
                    <h3 className="font-serif text-base font-bold text-brand-cream">{item.title}</h3>
                    <p className="text-gray-300 text-xs leading-relaxed mt-2">{item.desc}</p>
                    {isActive && (
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          onNavigate(item.tab);
                        }} 
                        className="text-brand-gold-tint text-[10px] font-bold uppercase tracking-widest flex items-center gap-1 hover:gap-2 transition-all mt-3"
                      >
                        EXPLORE {item.tab === "Live Counters" ? "PARTY PACKAGES" : item.tab.toUpperCase()} <ArrowRight className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Side: Sticky Images cross-fade */}
          <div className="lg:col-span-7 lg:sticky lg:top-28 h-[550px] relative rounded-lg overflow-hidden border border-white/10 shadow-2xl bg-black">
            {[
              "src/assets/images/custom_celebration_cakes_1781194977914.jpg",
              "src/assets/images/catering_buffet.png",
              "src/assets/images/custom_party_packages.png"
            ].map((src, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0 }}
                animate={{ opacity: activeStage === idx ? 1 : 0 }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
                className="absolute inset-0 w-full h-full"
              >
                <img 
                  src={src} 
                  alt="Walkthrough Detail Showcase" 
                  className="w-full h-full object-cover scale-101"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-5">
                  <span className="font-serif text-xs font-semibold text-brand-cream">
                    {idx === 0 ? "Designer Cake Detail" : idx === 1 ? "Catering Buffet Detail" : "Custom Party Setup Detail"}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>

        </div>
      </section>

      {/* ── PORTION ESTIMATOR WIDGET ── */}
      <section className="py-24 bg-[#050a1a]">
        <div className="max-w-5xl mx-auto px-4 space-y-12">
          
          <div className="text-center max-w-xl mx-auto space-y-2">
            <span className="text-[10px] font-bold text-brand-gold-tint tracking-widest uppercase">SMART UTILITY</span>
            <h2 className="font-serif text-3xl font-bold text-brand-cream">Portion &amp; Price Quick Estimator</h2>
            <p className="text-xs text-gray-400 font-sans">Slide or click your guest size to estimate recommended dishes, desserts, and price ranges instantly.</p>
            <div className="h-0.5 w-12 bg-brand-gold-tint mx-auto mt-2" />
          </div>

          <div className="glass-panel-dark rounded-lg p-6 lg:p-10 border border-white/5 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left Side: Interactive Slider & Quick Toggles */}
            <div className="lg:col-span-6 space-y-6">
              <div>
                <div className="flex justify-between items-baseline mb-2">
                  <label className="text-xs uppercase font-bold text-gray-400 tracking-wider font-sans">Guest Count</label>
                  <span className="text-3xl font-serif font-black text-brand-gold-tint">{calculatorGuests} <span className="text-xs font-sans text-gray-400 font-medium">Guests</span></span>
                </div>
                
                <input
                  type="range"
                  min="5"
                  max="120"
                  value={calculatorGuests}
                  onChange={(e) => setCalculatorGuests(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-[#0b1226] rounded-lg appearance-none cursor-pointer accent-[#775a19]"
                />
              </div>

              <div className="flex flex-wrap gap-2 justify-start">
                {[15, 35, 60, 100].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setCalculatorGuests(num)}
                    className={`px-3 py-2 text-[10px] font-bold uppercase rounded-sm tracking-wider transition-all cursor-pointer font-sans ${
                      calculatorGuests === num
                        ? "bg-brand-gold-tint text-[#785a1a]"
                        : "glass-panel hover:bg-white/10 text-white"
                    }`}
                  >
                    {num} Guests
                  </button>
                ))}
              </div>
            </div>

            {/* Right Side: Instant Recommendation Display */}
            <div className="lg:col-span-6 bg-white/5 rounded-lg border border-white/5 p-6 space-y-4">
              <div className="text-[10px] font-bold text-brand-gold-tint tracking-widest uppercase font-mono">
                {rec.serves}
              </div>
              
              <div className="space-y-3 font-sans text-xs">
                <div>
                  <span className="text-gray-400 uppercase tracking-wider text-[9px] block mb-0.5">Recommended Mains &amp; Platters</span>
                  <p className="font-semibold text-brand-cream">{rec.trays}</p>
                </div>
                <div>
                  <span className="text-gray-400 uppercase tracking-wider text-[9px] block mb-0.5">Recommended Sweet Portions</span>
                  <p className="font-semibold text-brand-cream">{rec.desserts}</p>
                </div>
                <div className="pt-2 border-t border-white/5 flex justify-between items-baseline">
                  <div>
                    <span className="text-gray-400 uppercase tracking-wider text-[9px] block">Estimated Rate Balance</span>
                    <p className="text-2xl font-serif font-bold text-brand-gold-tint">{rec.price}</p>
                  </div>
                  <button
                    onClick={() => onNavigate("Menu")}
                    className="bg-[#775a19] hover:bg-[#5d4201] text-white px-4 py-2 rounded text-[10px] uppercase tracking-wider font-bold transition-all"
                  >
                    Customize Menu
                  </button>
                </div>
              </div>
            </div>

          </div>

        </div>
      </section>


      {/* ── HIGHLIGHTS SHOWCASE ── */}
      <section className="py-24 border-t border-white/5 bg-[#0a1128]">
        <div className="max-w-7xl mx-auto px-4 space-y-12">
          
          <div className="text-center max-w-xl mx-auto">
            <span className="text-[10px] font-bold text-brand-gold-tint tracking-widest uppercase">SIGNATURE RANGE</span>
            <h2 className="font-serif text-3xl lg:text-4xl font-bold text-brand-cream mt-1">Highlights &amp; Attractions</h2>
            <p className="text-xs text-gray-400 font-sans mt-2">Discover what makes our patrons rave and gets everyone&apos;s attention.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Highlight 1: Rasmalai Royalty */}
            <div className="glass-panel-dark rounded-lg p-6 flex flex-col justify-between group hover:border-[#775a19]/55 transition-all">
              <div>
                <span className="text-[9px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded tracking-wider uppercase">Best Seller</span>
                <h3 className="font-serif text-xl font-bold mt-3 mb-2 text-brand-cream">Rasmalai Royale Cake</h3>
                <p className="text-gray-300 text-xs leading-relaxed">
                  Real saffron-soaked cardamom sponge layered with premium pistachios, almond flakes, and fresh whipped cream kheer layers. An absolute masterpiece of Indian-fusion patisserie.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-white/5 flex justify-between items-center text-xs text-brand-gold-tint font-bold font-sans">
                <span>100% EGGLESS</span>
                <button onClick={() => onOpenWizard("Rasmalai Royale", "Indian Fusion")} className="flex items-center gap-1 hover:gap-2 transition-all">
                  INQUIRE NOW <ArrowRight className="h-3 w-3" />
                </button>
              </div>
            </div>

            {/* Highlight 2: Pani Puri Live Station */}
            <div className="glass-panel-dark rounded-lg p-6 flex flex-col justify-between group hover:border-[#775a19]/55 transition-all">
              <div>
                <span className="text-[9px] font-bold text-brand-gold-tint bg-brand-gold-tint/10 px-2 py-0.5 rounded tracking-wider uppercase">Event Attraction</span>
                <h3 className="font-serif text-xl font-bold mt-3 mb-2 text-brand-cream">Artisanal Pani Puri Station</h3>
                <p className="text-gray-300 text-xs leading-relaxed">
                  Featuring 5 customized, spiced water flavors (Pomegranate-Mint, Tangy Tamarind, Cumin, Raw Mango, Spiced Pineapple). Crispy semolina puris filled live for guests.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-white/5 flex justify-between items-center text-xs text-brand-gold-tint font-bold font-sans">
                <span>LIVE COUNTER SETUP</span>
                <button onClick={() => onOpenWizard("", "Live Counters")} className="flex items-center gap-1 hover:gap-2 transition-all">
                  INQUIRE NOW <ArrowRight className="h-3 w-3" />
                </button>
              </div>
            </div>

            {/* Highlight 3: Custom Gifting Hampers */}
            <div className="glass-panel-dark rounded-lg p-6 flex flex-col justify-between group hover:border-[#775a19]/55 transition-all">
              <div>
                <span className="text-[9px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded tracking-wider uppercase">Festive Gifting</span>
                <h3 className="font-serif text-xl font-bold mt-3 mb-2 text-brand-cream">Regal Gifting Chests</h3>
                <p className="text-gray-300 text-xs leading-relaxed">
                  Gold-embossed chests filled with 4 signature fusion jars (Rasmalai, Gulab Jamun, Mango Mastani, Pistachio) and gourmet cardamom cookies. Ideal for Diwali, Eid, and weddings.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-white/5 flex justify-between items-center text-xs text-brand-gold-tint font-bold font-sans">
                <span>SHIPPING AVAILABLE</span>
                <button onClick={() => onOpenWizard()} className="flex items-center gap-1 hover:gap-2 transition-all">
                  INQUIRE NOW <ArrowRight className="h-3 w-3" />
                </button>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── RESPONSIVE PRICING TIER ── */}
      <section className="py-24 border-t border-white/5 bg-[#050a1a]">
        <div className="max-w-7xl mx-auto px-4 space-y-16">
          
          <div className="text-center max-w-xl mx-auto space-y-2">
            <span className="text-[10px] font-bold text-brand-gold-tint tracking-widest uppercase">TRANSPARENT VALUE</span>
            <h2 className="font-serif text-3xl lg:text-4xl font-bold text-brand-cream">Catering &amp; Bakery Rates</h2>
            <p className="text-xs text-gray-400 font-sans">Compare starting price guidelines to design the perfect event program.</p>
            <div className="h-0.5 w-12 bg-brand-gold-tint mx-auto mt-2" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
            {pricingTiers.map((tier, i) => (
              <div 
                key={i}
                className={`rounded-lg p-8 flex flex-col justify-between border transition-all ${
                  tier.highlighted 
                    ? "bg-[#0b1b40]/80 border-brand-gold-tint shadow-2xl relative" 
                    : "glass-panel-dark border-white/5"
                }`}
              >
                {tier.highlighted && (
                  <span className="absolute top-0 right-1/2 translate-x-1/2 -translate-y-1/2 bg-brand-gold-tint text-brand-gold-shadow font-sans font-extrabold text-[9px] tracking-widest uppercase px-3 py-1 rounded-full shadow">
                    Most Popular
                  </span>
                )}
                
                <div>
                  <h3 className="font-serif text-xl font-bold text-brand-cream mb-1">{tier.name}</h3>
                  <p className="text-gray-400 text-xs font-sans min-h-[40px]">{tier.desc}</p>
                  
                  <div className="my-6">
                    <span className="font-serif text-4xl font-black text-brand-cream">{tier.price}</span>
                    <span className="text-gray-400 text-xs font-sans ml-2 font-medium">/ {tier.period}</span>
                  </div>

                  <ul className="space-y-3.5 border-t border-white/5 pt-6 font-sans text-xs">
                    {tier.features.map((feat, idx) => (
                      <li key={idx} className="flex items-center gap-2.5">
                        <span className="flex h-4.5 w-4.5 items-center justify-center rounded-full bg-brand-gold-tint/15 text-brand-gold-tint text-[10px]">✓</span>
                        <span className="text-gray-300 font-medium">{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-8 pt-4">
                  <button
                    onClick={() => {
                      if (tier.category === "Menu") {
                        onNavigate("Menu");
                      } else {
                        onOpenWizard("", tier.category);
                      }
                    }}
                    className={`w-full py-3.5 rounded text-xs font-bold tracking-widest uppercase shadow transition-all cursor-pointer ${
                      tier.highlighted
                        ? "bg-[#775a19] text-white hover:bg-[#5d4201]"
                        : "glass-panel hover:bg-white/10 text-white"
                    }`}
                  >
                    {tier.cta}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── LUXURY CLIENT TESTIMONIALS ── */}
      <section className="py-24 border-t border-white/5 bg-[#0a1128]">
        <div className="max-w-7xl mx-auto px-4 space-y-12">
          
          <div className="text-center max-w-xl mx-auto space-y-2">
            <span className="text-[10px] font-bold text-brand-gold-tint tracking-widest uppercase">REVIEWS</span>
            <h2 className="font-serif text-3xl font-bold text-brand-cream">Client Experiences</h2>
            <p className="text-xs text-gray-400 font-sans">Read reviews from our lovely hosts across the DFW Metroplex.</p>
            <div className="h-0.5 w-12 bg-brand-gold-tint mx-auto mt-2" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {[
              {
                quote: "The Rasmalai Royale Cake was the star of our wedding! Incredibly light, not too sweet, and 100% eggless. Our guests were absolutely amazed.",
                author: "Priyanka S.",
                role: "Bridal Client • Plano, TX"
              },
              {
                quote: "Our corporate lunch was next level with the Live Pani Puri counter. The brass cart setup looked stunning and the service was absolutely top-notch.",
                author: "David M.",
                role: "Event Director • Frisco, TX"
              },
              {
                quote: "Impeccable service and the Paneer Tikka Crostinis were delicious. The digital price guide made estimating so easy. Highly recommend for any DFW event!",
                author: "Ananya R.",
                role: "Anniversary Host • Dallas, TX"
              }
            ].map((t, idx) => (
              <div 
                key={idx} 
                className="glass-panel-dark rounded-lg p-6 flex flex-col justify-between hover:border-brand-gold-tint/40 transition-all duration-300"
              >
                <p className="text-gray-300 text-xs lg:text-sm italic leading-relaxed font-sans">
                  &quot;{t.quote}&quot;
                </p>
                <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between">
                  <div>
                    <span className="font-serif text-sm font-bold text-brand-cream block">{t.author}</span>
                    <span className="text-[9px] text-gray-500 font-sans tracking-wide uppercase font-semibold">{t.role}</span>
                  </div>
                  <div className="text-brand-gold-tint text-xs flex gap-0.5 font-bold">
                    ★★★★★
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ── FAQ ACCORDION SECTION ── */}
      <section ref={faqRef} className="py-24 border-t border-white/5 bg-[#050a1a]">
        <div className="max-w-4xl mx-auto px-4 space-y-12">
          
          <div className="text-center space-y-2">
            <span className="text-[10px] font-bold text-brand-gold-tint tracking-widest uppercase">HAVE QUESTIONS?</span>
            <h2 className="font-serif text-3xl font-bold text-brand-cream">Frequently Asked Questions</h2>
            <div className="h-0.5 w-12 bg-brand-gold-tint mx-auto mt-2" />
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => {
              const isOpen = activeFaq === idx;
              return (
                <div 
                  key={idx}
                  className="rounded-lg border border-white/5 bg-[#0f1938]/30 overflow-hidden transition-all duration-300"
                >
                  <button
                    onClick={() => setActiveFaq(isOpen ? null : idx)}
                    className="w-full px-6 py-5 flex items-center justify-between text-left focus:outline-none cursor-pointer"
                  >
                    <span className="font-serif text-sm lg:text-base font-semibold text-brand-cream pr-4">{faq.q}</span>
                    <ChevronDown className={`h-4 w-4 text-brand-gold-tint shrink-0 transition-transform duration-300 ${isOpen ? "transform rotate-180" : ""}`} />
                  </button>

                  <div 
                    className={`transition-all duration-300 ease-in-out overflow-hidden ${
                      isOpen ? "max-h-[300px] border-t border-white/5" : "max-h-0"
                    }`}
                  >
                    <p className="px-6 py-5 text-gray-300 text-xs lg:text-sm font-sans leading-relaxed">
                      {faq.a}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="text-center pt-6 space-y-4">
            <p className="text-xs text-gray-400 font-sans">Still have queries or customized requirements?</p>
            <button 
              onClick={onOpenBaker}
              className="bg-brand-gold-tint hover:bg-brand-gold-tint/90 text-[#785a1a] px-6 py-3 text-xs font-bold tracking-widest uppercase rounded shadow transition-all cursor-pointer font-sans"
            >
              TALK TO A BAKER
            </button>
          </div>

        </div>
      </section>

    </div>
  );
}
