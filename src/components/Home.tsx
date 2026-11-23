import { useState, useEffect, useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import heroVideo from "../assets/videos/hero.mp4";
import tiffinShowcaseImg from "../assets/images/tiffin_hyperreal_showcase.jpg";
import cateringBuffetImg from "../assets/images/catering_hyperreal_showcase.jpg";
import celebrationCakesImg from "../assets/images/cakes_hyperreal_showcase.jpg";
import partyPackagesImg from "../assets/images/packages_hyperreal_showcase.jpg";
import cateringMenuFlyerImg from "../assets/images/catering_flyer_page_2.png";
import cateringCoverFlyerImg from "../assets/images/catering_flyer_page_1.png";
import { 
  ArrowRight, 
  ChevronDown, 
  ChefHat, 
  Clock, 
  Heart, 
  ShieldCheck,
  Phone,
  MessageSquare,
  MessageCircle,
  Sparkles,
  Utensils,
  Cake,
  Gift
} from "lucide-react";
import PortionEstimator from "./PortionEstimator";

interface HomeProps {
  onOpenBaker?: () => void;
  onNavigate: (tab: string) => void;
}

export default function Home({ onOpenBaker: _onOpenBaker, onNavigate }: HomeProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const faqRef = useRef<HTMLDivElement>(null);

  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [activeStage, setActiveStage] = useState<number>(0);
  const [cateringViewMode, setCateringViewMode] = useState<'feast' | 'menu' | 'cover'>('feast');

  // Helper to navigate directly to a specific route & tab
  const navigateToExperience = (tab: string, path: string) => {
    if (typeof window !== "undefined") {
      window.history.pushState(null, "", path);
      window.dispatchEvent(new PopStateEvent("popstate"));
    }
    onNavigate(tab);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const cateringImage = 
    cateringViewMode === 'menu' 
      ? cateringMenuFlyerImg 
      : cateringViewMode === 'cover' 
      ? cateringCoverFlyerImg 
      : cateringBuffetImg;

  const cateringImageLabel = 
    cateringViewMode === 'menu' 
      ? "Desi Dabba Catering Menu & 4-Tier Tray Pricing" 
      : cateringViewMode === 'cover' 
      ? "Desi Dabba Catering Cover & Allergens" 
      : "Desi Dabba 100% Pure-Veg House-Party Catering Spread";

  // Programmatically triggered video autoplay optimized for Chrome, Safari & WebView
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = true;
    video.defaultMuted = true;
    video.playsInline = true;
    video.setAttribute("muted", "");
    video.setAttribute("playsinline", "");
    video.setAttribute("webkit-playsinline", "");
    video.setAttribute("x5-playsinline", "");
    video.setAttribute("x5-video-player-type", "h5");

    const attemptPlay = () => {
      if (!video) return;
      if (video.paused) {
        const playPromise = video.play();
        if (playPromise !== undefined) {
          playPromise.catch((err) => {
            console.warn("Mobile video autoplay waiting for user interaction/ready:", err);
          });
        }
      }
    };

    attemptPlay();
    video.addEventListener("loadedmetadata", attemptPlay);
    video.addEventListener("loadeddata", attemptPlay);
    video.addEventListener("canplay", attemptPlay);
    video.addEventListener("canplaythrough", attemptPlay);

    const handleUserInteraction = () => {
      attemptPlay();
      window.removeEventListener("touchstart", handleUserInteraction);
      window.removeEventListener("pointerdown", handleUserInteraction);
      window.removeEventListener("scroll", handleUserInteraction);
    };

    window.addEventListener("touchstart", handleUserInteraction, { passive: true });
    window.addEventListener("pointerdown", handleUserInteraction, { passive: true });
    window.addEventListener("scroll", handleUserInteraction, { passive: true });

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        attemptPlay();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      video.removeEventListener("loadedmetadata", attemptPlay);
      video.removeEventListener("loadeddata", attemptPlay);
      video.removeEventListener("canplay", attemptPlay);
      video.removeEventListener("canplaythrough", attemptPlay);
      window.removeEventListener("touchstart", handleUserInteraction);
      window.removeEventListener("pointerdown", handleUserInteraction);
      window.removeEventListener("scroll", handleUserInteraction);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  // Framer Motion scroll hooks for Hero zoom & text fade transitions
  // Base scale starts at 1.07 to crop out the bottom-right corner watermark of hero.mp4
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const videoScale = useTransform(scrollYProgress, [0, 0.25], [1.07, 1.2]);
  const videoOpacity = useTransform(scrollYProgress, [0, 0.4], [1, 0.8]);
  const heroTextOpacity = useTransform(scrollYProgress, [0, 0.175], [1, 0]);
  const heroTextY = useTransform(scrollYProgress, [0, 0.175], [0, -60]);

  const showcaseItems = [
    {
      badge: "DESI DABBA • DAILY MEALS",
      title: "Daily & Weekly Tiffin Service",
      desc: "Proper ghar ka khana cooked fresh with light homestyle oils and zero baking soda. Includes soft tawa rotis, steamed basmati rice, seasonal dry sabzi, and slow-simmered dal or paneer lababdar.",
      cta: "Order Daily Tiffin",
      tab: "Catering",
      path: "/catering/tiffin",
      image: tiffinShowcaseImg,
      imageLabel: "Desi Dabba Homestyle Tiffin • Paneer Lababdar, Dry Sabzi, Rice, 2 Tawa Rotis & Raita",
      isContain: false
    },
    {
      badge: "100% PURE VEG • 4-TIER TRAYS",
      title: "Party Catering & Tray Orders",
      desc: "From intimate 12-guest dinners to 100-guest celebrations—choose from 1/3 Trays (8–12 ppl), Half Trays (15–20 ppl), 2.4\" Standard Full Trays (25–35 ppl), or 3.4\" XL Full Trays (40–50 ppl).",
      cta: "Explore Catering Menu",
      tab: "Catering",
      path: "/catering/food",
      image: cateringImage,
      imageLabel: cateringImageLabel,
      isContain: cateringViewMode !== 'feast'
    },
    {
      badge: "FONDANT-FREE • PATISSERIE",
      title: "Custom Cakes & Fusion Desserts",
      desc: "Show-stopping celebration cakes without toxic fondants or harsh dyes. Freshly whipped creams, real fruit reductions, Rasmalai & Gulab Jamun fusion cakes, layered glass cake jars, and 100% Eggless (+$) options.",
      cta: "Design Your Custom Cake",
      tab: "Catering",
      path: "/catering/cake",
      image: celebrationCakesImg,
      imageLabel: "100% Fondant-Free Custom Cakes, Rasmalai & Gulab Jamun Cakes & Layered Fusion Jars",
      isContain: false
    },
    {
      badge: "LIVE STATIONS & LUX GIFTING",
      title: "Party Packages & Return Hampers",
      desc: "Bring your celebration to life with live Pani Puri & Dilli 6 Chaat counters, hot Jalebi & Saffron Rabri, curated party bundles, and personalized Diwali, Rakhi, or return-gift hampers.",
      cta: "Explore Packages & Gifting",
      tab: "Live Counters",
      path: "/party-packages",
      image: partyPackagesImg,
      imageLabel: "Interactive Live Pani Puri & Jalebi Counters + Personalized Lux Gifting Hampers",
      isContain: false
    }
  ];

  const faqs = [
    {
      q: "Are eggless and fondant-free options available for custom cakes?",
      a: "Yes! Every celebration cake we bake is fondant-free—decorated with light whipped creams, silky buttercreams, and natural infusions instead of heavy fondant. 100% eggless recipes are available upon request (+$5 for 6″ cakes, +$10 for 8″ cakes, +$15 for 2-Tier cakes, and +$25 for 3-Tier cakes) with the same exceptional moisture and softness."
    },
    {
      q: "What areas do you serve?",
      a: "We operate from our women-owned home kitchen in the Frisco & Little Elm, TX area and proudly serve families, birthdays, poojas, and corporate events across Frisco, Little Elm, Plano, McKinney, Prosper, Coppell, Irving, and the surrounding DFW metroplex."
    },
    {
      q: "How far in advance should I book my order?",
      a: "Daily Tiffins follow our live weekly cutoff schedule. Hot party catering trays require 24 hours notice, custom celebration cakes require 48 hours notice, and large events with live stations or custom gifting hampers are best booked 1–3 weeks in advance."
    },
    {
      q: "What are your catering tray portion sizes?",
      a: "Our catering trays come in four sizes: a 1/3 Tray serves 8–12 guests, a Half Tray serves 15–20 guests, our Standard Full Tray (2.4\" deep) serves 25–35 guests, and our XL Full Tray (3.4\" deep) serves 40–50 guests."
    },
    {
      q: "Do you offer strict No-Onion / No-Garlic (Satvik) food for Poojas?",
      a: "Yes! Because we cook in a 100% pure vegetarian home kitchen in small batches, we specialize in strict Satvik (No-Onion / No-Garlic) preparations—including Halwai-style Bedmi Poori, Hing Jeera Aalu, Shahi Paneer, and Kheer—for Ganpati, Navratri, and housewarming poojas."
    }
  ];

  return (
    <div className="bg-[#050a1a] text-white font-sans min-h-screen">
      
      {/* ── HERO SECTION WITH SCROLL VIDEO TRANSITION & 3-WAY DIRECT ACTION BAR ── */}
      <section ref={containerRef} className="relative h-[115vh] w-full bg-[#050a1a]">
        
        {/* Sticky video container */}
        <div className="sticky top-0 h-screen w-full overflow-hidden flex items-center justify-center bg-[#050a1a]">
          <motion.video 
            ref={videoRef}
            src={heroVideo}
            poster={cateringBuffetImg}
            muted={true}
            autoPlay={true}
            loop={true}
            playsInline={true}
            disablePictureInPicture={true}
            preload="auto"
            style={{ scale: videoScale, opacity: videoOpacity }}
            className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none filter brightness-95 saturate-110"
          >
            <source src={heroVideo} type="video/mp4" />
          </motion.video>
          
          {/* Dark Glassmorphic Gradients */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#050a1a]/85 via-[#050a1a]/35 to-[#050a1a]" />
          <div className="absolute inset-0 bg-radial-gradient(circle, transparent 20%, #050a1a 95%)" />

          {/* Glowing Content Box */}
          <motion.div 
            style={{ opacity: heroTextOpacity, y: heroTextY }}
            className="relative z-10 max-w-4xl mx-auto px-4 text-center space-y-5"
          >
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0a1128]/85 border border-[#D4AF37]/45 text-[#ffdea5] text-[10px] sm:text-xs font-bold tracking-widest uppercase shadow-lg backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-[#ffdea5] shrink-0" />
              <span>Women-Owned Frisco Home Kitchen • 100% Pure Veg • Fondant-Free Cakes</span>
            </div>

            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight text-brand-cream drop-shadow-md">
              Bringing People Together <br />
              Through <span className="italic text-brand-gold-tint">Authentic Flavors</span> &amp; <span className="italic text-brand-gold-tint">Sweets</span>
            </h1>

            <p className="text-gray-200 text-xs sm:text-sm lg:text-base max-w-2xl mx-auto leading-relaxed font-medium drop-shadow-xs">
              Handcrafted in Frisco &amp; Little Elm, TX. Light &amp; soda-free daily tiffins, 100% pure vegetarian party catering, and fondant-free custom celebration cakes made fresh for your special moments.
            </p>

            {/* 3-Way Direct Ordering Entry Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 max-w-3xl mx-auto">
              <button 
                type="button"
                onClick={() => navigateToExperience("Catering", "/catering/tiffin")}
                className="px-5 py-3.5 bg-[#0f1938]/90 hover:bg-[#16244d] text-white text-xs font-bold tracking-wider uppercase rounded-xl border border-[#D4AF37]/50 shadow-lg transition-all cursor-pointer inline-flex items-center justify-center gap-2 min-h-[46px] backdrop-blur-md hover:scale-102"
              >
                <Utensils className="h-4 w-4 text-[#ffdea5] shrink-0" />
                <span>Order Daily Tiffin</span>
              </button>

              <button 
                type="button"
                onClick={() => navigateToExperience("Catering", "/catering/food")}
                className="px-5 py-3.5 bg-[#775a19] hover:bg-[#5d4201] text-white text-xs font-bold tracking-wider uppercase rounded-xl border border-[#D4AF37]/60 shadow-xl transition-all cursor-pointer inline-flex items-center justify-center gap-2 min-h-[46px] hover:scale-102"
              >
                <Sparkles className="h-4 w-4 text-[#ffdea5] shrink-0" />
                <span>Party Catering &amp; Quotes</span>
                <ArrowRight className="h-3.5 w-3.5 shrink-0" />
              </button>

              <button 
                type="button"
                onClick={() => navigateToExperience("Catering", "/catering/cake")}
                className="px-5 py-3.5 bg-[#0f1938]/90 hover:bg-[#16244d] text-white text-xs font-bold tracking-wider uppercase rounded-xl border border-[#D4AF37]/50 shadow-lg transition-all cursor-pointer inline-flex items-center justify-center gap-2 min-h-[46px] backdrop-blur-md hover:scale-102"
              >
                <Cake className="h-4 w-4 text-[#ffdea5] shrink-0" />
                <span>Custom Cakes</span>
              </button>
            </div>
          </motion.div>
        </div>

      </section>

      {/* ── OUR COMMITMENTS SECTION (SHARPENED 4 PILLARS) ── */}
      <section className="py-16 lg:py-20 border-t border-white/5 bg-[#050a1a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-[10px] font-bold text-brand-gold-tint tracking-widest uppercase">WHY FAMILIES TRUST OUR KITCHEN</span>
            <h2 className="font-serif text-3xl lg:text-4xl font-bold text-brand-cream">Responsible Indulgence, Zero Shortcuts</h2>
            <p className="text-xs sm:text-sm text-gray-300 font-sans">
              If an ingredient isn&apos;t good enough to feed our own children at home, it never enters our batters or gravies.
            </p>
            <div className="h-0.5 w-14 bg-brand-gold-tint mx-auto mt-2" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              {
                tag: "CLEAN PATISSERIE",
                title: "Zero Fondant, Zero Toxins",
                desc: "Show-stopping celebration cakes crafted with freshly whipped creams, real fruit reductions, pure saffron, pistachio, and balanced sweetness—never heavy fondant or harsh chemical dyes.",
                icon: "Cake"
              },
              {
                tag: "WHOLESOME COOKING",
                title: "Light, Homestyle & Soda-Free",
                desc: "Every Desi Dabba tiffin and catering tray is cooked fresh in small batches with light homestyle oils, freshly ground masalas, and zero baking soda so you feel nourished, never bloated.",
                icon: "Heart"
              },
              {
                tag: "DIETARY INTEGRITY",
                title: "100% Pure Veg, Satvik & Eggless",
                desc: "A dedicated pure-vegetarian home kitchen honoring your family's traditions—specializing in strict No-Onion/No-Garlic (Satvik) pooja menus and 100% eggless bakes (+$).",
                icon: "ShieldCheck"
              },
              {
                tag: "COMPLETE CELEBRATIONS",
                title: "Weekday Dabbas to 100-Guest Feasts",
                desc: "From convenient weekly tiffins to 4-tier catering trays, interactive live chaat & jalebi stations, and custom return-gift hampers across Frisco, Little Elm & DFW.",
                icon: "Clock"
              }
            ].map((commitment, idx) => (
              <div 
                key={idx}
                className="glass-panel-dark rounded-2xl p-6 border border-[#D4AF37]/30 flex flex-col justify-between space-y-3 hover:border-brand-gold-tint/70 transition-all hover:-translate-y-1 duration-300 shadow-lg bg-[#0f1938]/75"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-brand-gold-tint">
                      {commitment.tag}
                    </span>
                    <div className="h-9 w-9 rounded-xl bg-[#775a19]/30 border border-[#D4AF37]/40 flex items-center justify-center text-brand-gold-tint shrink-0">
                      {commitment.icon === "Cake" && <ChefHat className="h-4 w-4" />}
                      {commitment.icon === "Heart" && <Heart className="h-4 w-4" />}
                      {commitment.icon === "ShieldCheck" && <ShieldCheck className="h-4 w-4" />}
                      {commitment.icon === "Clock" && <Clock className="h-4 w-4" />}
                    </div>
                  </div>
                  <h3 className="font-serif text-base sm:text-lg font-bold text-brand-cream leading-snug">
                    {commitment.title}
                  </h3>
                  <p className="text-gray-300 text-xs leading-relaxed font-sans">
                    {commitment.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ── CRISP 4-PILLAR INTERACTIVE VISUAL SHOWCASE (WITH 4 HYPER-REALISTIC MENU PHOTOS) ── */}
      <section className="py-16 lg:py-20 border-t border-white/5 bg-[#0a1128]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-brand-gold-tint tracking-widest uppercase">
                FOUR WAYS TO CELEBRATE &amp; DINE
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-brand-cream">
                Explore Our Culinary Experiences
              </h2>
              <div className="h-0.5 w-14 bg-brand-gold-tint mt-2" />
            </div>
            <p className="text-xs sm:text-sm text-gray-300 max-w-md">
              Tap any experience below to preview our actual menu dishes, 4-tier catering trays, fondant-free cakes, or live event packages.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            
            {/* Left 5 Cols: 4 Interactive Experience Selector Cards */}
            <div className="lg:col-span-5 flex flex-col justify-between gap-3.5">
              {showcaseItems.map((item, idx) => {
                const isActive = activeStage === idx;
                return (
                  <div
                    key={idx}
                    onClick={() => setActiveStage(idx)}
                    className={`p-5 rounded-2xl border transition-all duration-300 cursor-pointer ${
                      isActive
                        ? "bg-[#0f1938] border-[#D4AF37] shadow-xl ring-1 ring-[#D4AF37]/40"
                        : "bg-[#050a1a]/60 border-white/10 hover:bg-[#0f1938]/50 hover:border-[#D4AF37]/40"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-[#ffdea5]">
                        {item.badge}
                      </span>
                      {idx === 0 && <Utensils className="w-4 h-4 text-[#ffdea5]" />}
                      {idx === 1 && <Sparkles className="w-4 h-4 text-[#ffdea5]" />}
                      {idx === 2 && <Cake className="w-4 h-4 text-[#ffdea5]" />}
                      {idx === 3 && <Gift className="w-4 h-4 text-[#ffdea5]" />}
                    </div>

                    <h3 className="font-serif text-base sm:text-lg font-bold text-brand-cream">
                      {item.title}
                    </h3>
                    <p className="text-gray-300 text-xs leading-relaxed mt-1.5">
                      {item.desc}
                    </p>

                    {/* Mobile/Tablet Inline Image Preview */}
                    {isActive && (
                      <div className="lg:hidden mt-4 rounded-xl overflow-hidden border border-[#D4AF37]/30 aspect-video relative bg-[#050a1a]">
                        <img
                          src={item.image}
                          alt={item.title}
                          loading="lazy"
                          className={`w-full h-full ${item.isContain ? 'object-contain bg-[#FAF8F5]' : 'object-cover'}`}
                        />
                        {idx === 1 && (
                          <div className="absolute top-2 right-2 z-10 flex items-center gap-1 bg-black/80 backdrop-blur-md p-0.5 rounded-lg border border-white/20">
                            {(['feast', 'menu', 'cover'] as const).map((mode) => (
                              <button
                                key={mode}
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setCateringViewMode(mode);
                                }}
                                className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                                  cateringViewMode === mode ? 'bg-[#775a19] text-white' : 'text-gray-300'
                                }`}
                              >
                                {mode}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center justify-between">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigateToExperience(item.tab, item.path);
                        }}
                        className="text-brand-gold-tint hover:text-white text-xs font-bold uppercase tracking-widest inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <span>{item.cta}</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Right 7 Cols: Live Visual Showcase Panel (Desktop) */}
            <div className="hidden lg:block lg:col-span-7 relative rounded-2xl overflow-hidden border-2 border-[#D4AF37]/35 shadow-2xl bg-[#050a1a] min-h-[540px]">
              {showcaseItems.map((item, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: activeStage === idx ? 1 : 0 }}
                  transition={{ duration: 0.4, ease: "easeInOut" }}
                  className={`absolute inset-0 w-full h-full ${activeStage === idx ? 'pointer-events-auto z-10' : 'pointer-events-none z-0'}`}
                >
                  <img 
                    src={item.image} 
                    alt={item.title} 
                    loading="lazy"
                    className={`w-full h-full ${item.isContain ? 'object-contain bg-[#FAF8F5]' : 'object-cover'}`}
                  />

                  {/* Catering Mode Switcher Toggle (when Catering card is active) */}
                  {idx === 1 && activeStage === 1 && (
                    <div className="absolute top-4 right-4 z-20 flex items-center gap-1 bg-black/80 backdrop-blur-md p-1 rounded-xl border border-white/20 shadow-lg">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setCateringViewMode('feast');
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                          cateringViewMode === 'feast'
                            ? 'bg-[#775a19] text-white shadow-xs'
                            : 'text-gray-300 hover:text-white'
                        }`}
                      >
                        Feast Spread
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setCateringViewMode('menu');
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                          cateringViewMode === 'menu'
                            ? 'bg-[#775a19] text-white shadow-xs'
                            : 'text-gray-300 hover:text-white'
                        }`}
                      >
                        Menu &amp; Pricing
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setCateringViewMode('cover');
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                          cateringViewMode === 'cover'
                            ? 'bg-[#775a19] text-white shadow-xs'
                            : 'text-gray-300 hover:text-white'
                        }`}
                      >
                        Cover &amp; Allergens
                      </button>
                    </div>
                  )}

                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#050a1a] via-[#050a1a]/90 to-transparent p-6 flex items-center justify-between gap-4">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-[#ffdea5] block">
                        {item.badge}
                      </span>
                      <span className="font-serif text-sm sm:text-base font-bold text-brand-cream">
                        {item.imageLabel}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => navigateToExperience(item.tab, item.path)}
                      className="px-5 py-2.5 rounded-xl bg-[#775a19] hover:bg-[#5d4201] text-white text-xs font-bold uppercase tracking-wider border border-[#D4AF37]/50 shadow-lg inline-flex items-center gap-2 shrink-0 cursor-pointer"
                    >
                      <span>{item.cta}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-[#ffdea5]" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>

          </div>
        </div>
      </section>

      {/* ── PORTION ESTIMATOR & BUDGET CALCULATOR WIDGET (WITH 3.4" XL FULL TRAY LOGIC) ── */}
      <PortionEstimator 
        onNavigateToFoodOrder={() => navigateToExperience("Catering", "/catering/food")} 
      />

      {/* ── LUXURY CLIENT TESTIMONIALS (FROM REVIEWS PAGE) ── */}
      <section className="py-20 border-t border-white/5 bg-[#0a1128]">
        <div className="max-w-7xl mx-auto px-4 space-y-12">
          
          <div className="text-center max-w-xl mx-auto space-y-2">
            <span className="text-[10px] font-bold text-brand-gold-tint tracking-widest uppercase">CLIENT REVIEWS</span>
            <h2 className="font-serif text-3xl font-bold text-brand-cream">Customer Experiences</h2>
            <p className="text-xs text-gray-400 font-sans">Read reviews from our lovely event hosts across Frisco, Plano, Little Elm &amp; DFW.</p>
            <div className="h-0.5 w-12 bg-brand-gold-tint mx-auto mt-2" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                name: "Ankita S.",
                occasion: "Daughter's 5th Birthday • Frisco, TX",
                itemsOrdered: "2-Tier Eggless Rasmalai Cake, Live Pani Puri & Cutlets",
                quote: "Ordered a 2-tier eggless Rasmalai cake and live pani puri counter for my daughter's 5th birthday in Frisco. Honestly the cake was super soft and not overly sweet like store bought cakes, everyone went for a second slice. The team was very patient with all my small changes. Will definitely order again.",
                rating: 5,
                date: "September 24, 2026"
              },
              {
                name: "Priya M.",
                occasion: "25th Anniversary Dinner • Plano, TX",
                itemsOrdered: "Paneer Lababdar, Dal Makhani, Bhindi Masala & Kheer",
                quote: "We had around 50 guests at home for our anniversary dinner and got Paneer Lababdar, Dal Makhani, Bhindi Masala and Kheer. Food tasted really fresh and homely, not heavy or oily like restaurant catering. My in-laws are visiting from India and even they loved the dal and kheer!",
                rating: 5,
                date: "September 15, 2026"
              },
              {
                name: "Siddharth P.",
                occasion: "Weekly Tiffin Service • Irving, TX",
                itemsOrdered: "Weekly Dabba: Stuffed Parathas, Kadhi Pakora & Daily Sabzi",
                quote: "Been taking their weekly dabba for a few months now. With busy office days it is such a relief to get proper ghar ka khana. Rotis stay soft even for dinner, kadhi pakora and stuffed parathas are my favorite. Less oil and no soda feeling afterwards.",
                rating: 5,
                date: "August 28, 2026"
              }
            ].map((t, idx) => (
              <div 
                key={idx} 
                className="glass-panel-dark rounded-xl p-6 flex flex-col justify-between hover:border-brand-gold-tint/40 transition-all duration-300 border border-white/10 bg-[#0f1938]/40"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="text-brand-gold-tint text-xs font-bold">
                      ★★★★★
                    </div>
                    <span className="text-[10px] text-gray-400">{t.date}</span>
                  </div>

                  <p className="text-gray-300 text-xs lg:text-sm italic leading-relaxed font-sans">
                    &quot;{t.quote}&quot;
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-white/10 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-serif text-sm font-bold text-brand-cream">{t.name}</span>
                  </div>
                  <span className="text-[10px] text-brand-gold-tint font-sans tracking-wide uppercase font-semibold block">{t.occasion}</span>
                  <span className="text-[10px] text-gray-400 font-sans block italic font-light truncate">Ordered: {t.itemsOrdered}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center pt-2">
            <button
              onClick={() => navigateToExperience("Reviews", "/reviews")}
              className="inline-flex items-center gap-2 bg-[#775a19] hover:bg-[#5d4201] text-white font-sans text-xs uppercase tracking-widest font-bold px-6 py-3 rounded-xl shadow-md transition-all cursor-pointer border border-[#D4AF37]/40 hover:scale-102"
            >
              <span>Read All Customer Reviews &amp; Submit Feedback</span>
              <ArrowRight className="w-4 h-4 text-[#ffdea5]" />
            </button>
          </div>

        </div>
      </section>

      {/* ── FAQ ACCORDION SECTION ── */}
      <section ref={faqRef} className="py-20 border-t border-white/5 bg-[#050a1a]">
        <div className="max-w-4xl mx-auto px-4 space-y-10">
          
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
                  className="rounded-lg border border-white/10 bg-[#0f1938]/50 overflow-hidden transition-all duration-300"
                >
                  <button
                    onClick={() => setActiveFaq(isOpen ? null : idx)}
                    className="w-full px-5 sm:px-6 py-4 sm:py-5 flex items-center justify-between text-left focus:outline-none cursor-pointer min-h-[48px]"
                  >
                    <span className="font-serif text-sm lg:text-base font-semibold text-brand-cream pr-4 leading-snug">{faq.q}</span>
                    <ChevronDown className={`h-4 w-4 text-brand-gold-tint shrink-0 transition-transform duration-300 ${isOpen ? "transform rotate-180" : ""}`} />
                  </button>

                  <div 
                    className={`transition-all duration-300 ease-in-out overflow-hidden ${
                      isOpen ? "max-h-[800px] border-t border-white/10" : "max-h-0"
                    }`}
                  >
                    <p className="px-5 sm:px-6 py-4 sm:py-5 text-gray-300 text-xs lg:text-sm font-sans leading-relaxed">
                      {faq.a}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="text-center pt-6 space-y-4">
            <p className="text-xs text-gray-400 font-sans">Still have queries or customized requirements? Reach out directly to our kitchen:</p>
            <div className="flex flex-col sm:flex-row flex-wrap items-center justify-center gap-3">
              <a
                href="tel:+19455274566"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white min-h-[44px] px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all border border-white/20 cursor-pointer"
              >
                <Phone className="w-4 h-4 text-emerald-400" />
                <span>Call</span>
              </a>
              <a
                href="sms:+19455274566?body=Hi%20Bluebonnet%20Whisk!%20I'm%20inquiring%20about%20an%20event."
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white min-h-[44px] px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all border border-white/20 cursor-pointer"
              >
                <MessageSquare className="w-4 h-4 text-sky-400" />
                <span>SMS</span>
              </a>
              <a
                href="https://wa.me/19455274566?text=Hi%20Bluebonnet%20Whisk!%20I'd%20like%20to%20inquire%20about%20an%20order."
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#1ebd5a] text-white min-h-[44px] px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-md cursor-pointer"
              >
                <MessageCircle className="w-4 h-4 fill-white" />
                <span>WhatsApp</span>
              </a>
            </div>
          </div>

        </div>
      </section>

    </div>
  );
}
