import { useState, useEffect, useRef } from "react";
import { motion, useScroll, useTransform, useMotionValueEvent } from "motion/react";
import heroVideo from "../assets/videos/hero.mp4";
import { 
  ArrowRight, 
  ChevronDown, 
  ChefHat, 
  Clock, 
  Heart, 
  ShieldCheck,
  Phone,
  MessageSquare,
  MessageCircle
} from "lucide-react";
import PortionEstimator from "./PortionEstimator";

interface HomeProps {
  onOpenBaker?: () => void;
  onNavigate: (tab: string) => void;
}

export default function Home({ onOpenBaker: _onOpenBaker, onNavigate }: HomeProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const walkthroughRef = useRef<HTMLDivElement>(null);
  const faqRef = useRef<HTMLDivElement>(null);

  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [activeStage, setActiveStage] = useState<number>(0);

  // Programmatically triggered video autoplay optimized for Samsung Internet, Chrome Android S25+, iOS Safari
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Force HTML DOM attributes & properties required by Samsung Internet & Android Chrome
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

    // Attempt playback immediately and on media readiness events
    attemptPlay();
    video.addEventListener("loadedmetadata", attemptPlay);
    video.addEventListener("loadeddata", attemptPlay);
    video.addEventListener("canplay", attemptPlay);
    video.addEventListener("canplaythrough", attemptPlay);

    // Multi-event unlock for mobile battery saver / Samsung Internet data saver
    const handleUserInteraction = () => {
      attemptPlay();
      window.removeEventListener("touchstart", handleUserInteraction);
      window.removeEventListener("pointerdown", handleUserInteraction);
      window.removeEventListener("scroll", handleUserInteraction);
    };

    window.addEventListener("touchstart", handleUserInteraction, { passive: true });
    window.addEventListener("pointerdown", handleUserInteraction, { passive: true });
    window.addEventListener("scroll", handleUserInteraction, { passive: true });

    // Handle tab visibility change
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
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });


  const videoScale = useTransform(scrollYProgress, [0, 0.25], [1, 1.15]);
  const videoOpacity = useTransform(scrollYProgress, [0, 0.4], [1, 0.8]);
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
        <div className="sticky top-0 h-screen w-full overflow-hidden flex items-center justify-center bg-[#050a1a]">
          <motion.video 
            ref={videoRef}
            src={heroVideo}
            muted={true}
            autoPlay={true}
            loop={true}
            playsInline={true}
            disablePictureInPicture={true}
            preload="auto"
            style={{ scale: videoScale, opacity: videoOpacity }}
            className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none filter brightness-90 saturate-105"
          >
            <source src={heroVideo} type="video/mp4" />
          </motion.video>
          
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
            <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-3 pt-4 max-w-md sm:max-w-none mx-auto">
              <button 
                onClick={() => onNavigate("Catering")}
                className="w-full sm:w-auto px-7 py-3.5 sm:px-8 sm:py-4 bg-[#775a19] hover:bg-[#5d4201] text-white text-xs font-bold tracking-widest uppercase rounded shadow-lg transition-all cursor-pointer inline-flex items-center justify-center gap-2 min-h-[44px]"
              >
                <span>REQUEST A CUSTOM QUOTE</span> <ArrowRight className="h-3.5 w-3.5 shrink-0" />
              </button>
              <button 
                onClick={() => onNavigate("Catering")}
                className="w-full sm:w-auto px-7 py-3.5 sm:px-8 sm:py-4 border border-brand-gold-tint hover:bg-brand-gold-tint/10 text-brand-cream text-xs font-bold tracking-widest uppercase rounded transition-all cursor-pointer inline-flex items-center justify-center min-h-[44px]"
              >
                <span>VIEW CATERING &amp; ESTIMATES</span>
              </button>
            </div>
          </motion.div>
        </div>

      </section>

      {/* ── OUR COMMITMENTS SECTION ── */}
      <section className="py-24 border-t border-white/5 bg-[#050a1a]">
        <div className="max-w-7xl mx-auto px-4 space-y-16">
          
          <div className="text-center max-w-xl mx-auto space-y-2">
            <h2 className="font-serif text-3xl lg:text-4xl font-bold text-brand-cream">Our Commitments to You</h2>
            <p className="text-xs text-gray-400 font-sans">Crafting unforgettable experiences with a dedication to perfection.</p>
            <div className="h-0.5 w-12 bg-brand-gold-tint mx-auto mt-2" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
                desc: "We commit to making your life easier. Whether you are relying on our weekly and monthly tiffin services, or trusting us to cater your next big event, we deliver the warmth of a home kitchen directly to you.",
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
                tab: "Cakes",
                image: "src/assets/images/custom_celebration_cakes_1781194977914.jpg",
                imageLabel: "Designer Cake Detail"
              },
              {
                title: "Catering",
                desc: "Whether it's a birthday, corporate event, or family gathering, we've got the menu covered.",
                tab: "Catering",
                image: "src/assets/images/catering_buffet.png",
                imageLabel: "Catering Buffet Detail"
              },
              {
                title: "Custom Party Packages",
                desc: "Bring Your Celebration to Life with Our Custom Party Packages",
                tab: "Live Counters",
                image: "src/assets/images/custom_party_packages.png",
                imageLabel: "Custom Party Setup Detail"
              }
            ].map((item, idx) => {
              const isActive = activeStage === idx;
              return (
                <div key={idx} className="flex flex-col justify-center py-4 min-h-fit lg:min-h-[45vh]">
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
                    
                    {/* Inline Image for Mobile & Tablet only */}
                    <div className="lg:hidden mt-4 rounded-lg overflow-hidden border border-white/10 aspect-video relative">
                      <img 
                        src={item.image} 
                        alt={item.title}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent flex items-end p-3">
                        <span className="font-serif text-[10px] font-semibold text-brand-cream">
                          {item.imageLabel}
                        </span>
                      </div>
                    </div>

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

          {/* Right Side: Sticky Images cross-fade (Desktop only) */}
          <div className="hidden lg:block lg:col-span-7 lg:sticky lg:top-28 h-[550px] relative rounded-lg overflow-hidden border border-white/10 shadow-2xl bg-black">
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
      <PortionEstimator 
        onNavigateToFoodOrder={() => onNavigate("Catering")} 
      />








      {/* ── LUXURY CLIENT TESTIMONIALS (FROM REVIEWS PAGE) ── */}
      <section className="py-24 border-t border-white/5 bg-[#0a1128]">
        <div className="max-w-7xl mx-auto px-4 space-y-12">
          
          <div className="text-center max-w-xl mx-auto space-y-2">
            <span className="text-[10px] font-bold text-brand-gold-tint tracking-widest uppercase">CLIENT REVIEWS</span>
            <h2 className="font-serif text-3xl font-bold text-brand-cream">Verified Host Experiences</h2>
            <p className="text-xs text-gray-400 font-sans">Read authentic reviews from our lovely event hosts across Frisco, Plano, &amp; DFW.</p>
            <div className="h-0.5 w-12 bg-brand-gold-tint mx-auto mt-2" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                name: "Ankita & Rahul S.",
                occasion: "Daughter's 5th Birthday Party • Frisco, TX",
                itemsOrdered: "Custom 2-Tier Theme Cake + Live Pani Puri Bar & Railway Cutlets",
                quote: "Finding a baker in Frisco who can pull off a Pinterest-worthy theme cake AND a 100% eggless Rasmalai Biscoff flavor was a miracle! The cake was so soft, not overly sweet like American bakery cakes. The live Pani Puri counter was a massive hit!",
                rating: 5,
                date: "September 24, 2026"
              },
              {
                name: "Priya & Venkat M.",
                occasion: "25th Anniversary Dinner Catering • Plano, TX",
                itemsOrdered: "Grand Catering: Paneer Lababdar, Dal Makhani & Cardamom Kheer",
                quote: "We hosted 50+ relatives and friends in Plano. The Paneer Lababdar and Dal Makhani tasted like authentic Dilli-style dhaba food—rich, aromatic, but not heavy. My in-laws visiting from Bengaluru praised the cardamom Kheer!",
                rating: 5,
                date: "September 15, 2026"
              },
              {
                name: "Siddharth P.",
                occasion: "Weekly Executive Tiffin Service • Irving, TX",
                itemsOrdered: "Daily Dabba: Aalu Paratha, Sattu Paratha, Homestyle Kadhi & Bharwa Baigan",
                quote: "Living in Las Colinas and working long tech hours, finding clean ghar-ka-khana was my biggest priority. Bluebonnet Whisk's weekly dabbas feel like mom cooked them—soft phulkas, tangy homestyle Kadhi Pakora, and delicious Sattu parathas!",
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
                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-full uppercase tracking-wider">
                      ✓ Verified Review
                    </span>
                    <div className="text-brand-gold-tint text-xs font-bold">
                      ★★★★★
                    </div>
                  </div>

                  <p className="text-gray-300 text-xs lg:text-sm italic leading-relaxed font-sans">
                    &quot;{t.quote}&quot;
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-white/10 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-serif text-sm font-bold text-brand-cream">{t.name}</span>
                    <span className="text-[10px] text-gray-400">{t.date}</span>
                  </div>
                  <span className="text-[10px] text-brand-gold-tint font-sans tracking-wide uppercase font-semibold block">{t.occasion}</span>
                  <span className="text-[10px] text-gray-400 font-sans block italic font-light truncate">Ordered: {t.itemsOrdered}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center pt-2">
            <button
              onClick={() => onNavigate("Reviews")}
              className="inline-flex items-center gap-2 bg-[#00346f] hover:bg-[#00224d] text-white font-sans text-xs uppercase tracking-widest font-bold px-6 py-3 rounded-xl shadow-md transition-all cursor-pointer border border-[#00346f] hover:scale-102"
            >
              <span>Read All Customer Reviews &amp; Submit Feedback</span>
              <ArrowRight className="w-4 h-4 text-[#ffdea5]" />
            </button>
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
                    className="w-full px-5 sm:px-6 py-4 sm:py-5 flex items-center justify-between text-left focus:outline-none cursor-pointer min-h-[48px]"
                  >
                    <span className="font-serif text-sm lg:text-base font-semibold text-brand-cream pr-4 leading-snug">{faq.q}</span>
                    <ChevronDown className={`h-4 w-4 text-brand-gold-tint shrink-0 transition-transform duration-300 ${isOpen ? "transform rotate-180" : ""}`} />
                  </button>

                  <div 
                    className={`transition-all duration-300 ease-in-out overflow-hidden ${
                      isOpen ? "max-h-[800px] border-t border-white/5" : "max-h-0"
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
            <p className="text-xs text-gray-400 font-sans">Still have queries or customized requirements? Reach out directly to chef Aditi:</p>
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
