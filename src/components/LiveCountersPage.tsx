import { useState, useEffect } from "react";
import { 
  Cake, 
  Users, 
  Heart, 
  Gift, 
  MessageSquare, 
  Check, 
  Sparkles, 
  Send, 
  Package 
} from "lucide-react";
import ImageWithShimmer from "./ImageWithShimmer";
import partyPackagesHeroImg from "../assets/images/custom_party_packages_showcase.jpg";

export default function LiveCountersPage() {
  const [guestCount, setGuestCount] = useState<number>(50);
  const [selectedStations, setSelectedStations] = useState<string[]>([
    "Live Jalebi & Saffron Rabri",
    "Pani Puri & Dilli 6 Chaat Bar"
  ]);
  const [selectedGiftingAddon, setSelectedGiftingAddon] = useState<string>("None");

  // Auto-scroll to Lux Gifting section if visitor arrived via /lux-gifting or /gifting
  useEffect(() => {
    if (typeof window !== "undefined") {
      const path = window.location.pathname.toLowerCase();
      if (path.includes("gifting")) {
        const el = document.getElementById("lux-gifting-section");
        if (el) {
          setTimeout(() => el.scrollIntoView({ behavior: "smooth" }), 150);
        }
      }
    }
  }, []);

  const liveStationsList = [
    { 
      id: "jalebi", 
      name: "Live Jalebi & Saffron Rabri", 
      desc: "Crispy hot jalebis fried live, served with warm kesar-pistachio rabri" 
    },
    { 
      id: "chaat", 
      name: "Pani Puri & Dilli 6 Chaat Bar", 
      desc: "Interactive golgappas, dahi bhalla, papdi chaat & house chutneys" 
    },
    { 
      id: "pavbhaji", 
      name: "Mumbai Pav Bhaji & Tawa Counter", 
      desc: "Sizzling butter-toasted pav with street-style spiced tawa bhaji" 
    },
    { 
      id: "paratha", 
      name: "Stuffed Paratha & Curd Counter", 
      desc: "Hot-off-the-tawa aloo, paneer & gobhi parathas with raita & achaar" 
    },
    { 
      id: "jars", 
      name: "Fusion Cake Jar & Mithai Table", 
      desc: "Rasmalai, Gulab Jamun, Mango & Pistachio cake jars with warm sweets" 
    },
    { 
      id: "chai", 
      name: "Masala Chai & Filter Coffee Bar", 
      desc: "Freshly brewed elaichi-ginger kulhad chai & South Indian filter coffee" 
    }
  ];

  const giftingAddonOptions = [
    "None",
    "Party Return-Gift Boxes ($20+)",
    "Diwali / Festive Luxe Hampers",
    "Pooja / Rakhi Custom Boxes"
  ];

  const toggleStation = (name: string) => {
    if (selectedStations.includes(name)) {
      setSelectedStations(selectedStations.filter(s => s !== name));
    } else {
      setSelectedStations([...selectedStations, name]);
    }
  };

  const handleWhatsAppQuote = (customTopic?: string) => {
    if (customTopic) {
      const text = `Hi Bluebonnet Whisk! I'd like to inquire about ${customTopic} for around ${guestCount} guests/boxes.`;
      window.open(`https://wa.me/19455274566?text=${encodeURIComponent(text)}`, "_blank");
      return;
    }
    const stationPart = selectedStations.length > 0 ? `Live Stations: ${selectedStations.join(", ")}` : "Custom Party Package";
    const giftingPart = selectedGiftingAddon !== "None" ? ` + Gifting Add-On: ${selectedGiftingAddon}` : "";
    const text = `Hi Bluebonnet Whisk! I'd like a custom proposal for ${guestCount} guests (${stationPart}${giftingPart}).`;
    window.open(`https://wa.me/19455274566?text=${encodeURIComponent(text)}`, "_blank");
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  const packages = [
    {
      title: "Kids Birthday Package",
      subtitle: "Fun, kid-approved flavors + centerpiece cake.",
      image: "/src/assets/images/kids_birthday_package.png",
      icon: Cake,
      items: [
        "2 Kid-Friendly Starters & Cutlets",
        "1 Crowd-Pleaser Main Dish",
        "Refreshing Kids' Drinks",
        "Fondant-Free Custom Theme Cake"
      ]
    },
    {
      title: "Family & Housewarming",
      subtitle: "Comforting homestyle Indian spreads made to share.",
      image: "/src/assets/images/family_gathering_package.png",
      icon: Users,
      items: [
        "2 Chaat or Appetizer Platters",
        "2 Signature Mains + Slow Dal",
        "Saffron Pulao & Fresh Naan/Poori",
        "Traditional Warm Dessert or Kheer"
      ]
    },
    {
      title: "Anniversaries & Milestones",
      subtitle: "Elevated menus for unforgettable evenings.",
      image: "/src/assets/images/anniversary_package.png",
      icon: Heart,
      items: [
        "Artisanal Chaat & Grazing Starters",
        "Shahi / Darbari Paneer & Mains",
        "Fusion Dessert Jars & Drinks",
        "* Optional 2-Tier Celebration Cake"
      ]
    },
    {
      title: "Baby Shower & Satvik Pooja",
      subtitle: "Light, festive & strict No-Onion/Garlic options.",
      image: "/src/assets/images/baby_shower_package.png",
      icon: Gift,
      items: [
        "Strict Satvik (No-Onion/Garlic) Option",
        "Halwai-Style Bedmi Poori & Sabzi",
        "Festive Mithai & Fusion Cake Jars",
        "* Optional Return-Gift Hamper Boxes"
      ]
    }
  ];

  const signatureCollections = [
    {
      title: "Diwali Luxe Hampers",
      desc: "Celebrate the festival of lights with gourmet Biscoff & cardamom cookies, fusion sweets, spiced nuts, and personalized family message cards.",
      image: "/src/assets/images/diwali_luxe_hamper.png",
      tag: "Luxe Edition"
    },
    {
      title: "Rakhi & Festive Gift Boxes",
      desc: "A heartfelt expression of tradition—includes premium rakhi or festive motif, handcrafted fusion sweets, savory bites, and a custom greeting note.",
      image: "/src/assets/images/rakhi_gift_box.png",
      tag: "Best Seller"
    },
    {
      title: "Pooja & Return-Gift Hampers",
      desc: "Thoughtful return gifts for Ganpati poojas, baby showers, birthdays, and housewarmings—featuring modak sweets, dry fruits, and silk-ribbon packaging.",
      image: "/src/assets/images/ganpati_pooja_gift.png",
      tag: "From $20 / Box"
    }
  ];

  const personalizationPills = [
    "Custom Family & Event Name Cards",
    "100% Eggless (+$), Nut-Free & Satvik Options",
    "Balanced Sweet & Savory Medleys",
    "Silk Ribbons & Marigold Motifs",
    "Corporate, Wedding & Baby Shower Bulk Orders"
  ];

  return (
    <div className="royal-dark-page bg-[#050a1a] min-h-screen animate-fade-in font-sans pb-16 lg:pb-0 text-[#fbfbfa]">
      
      {/* ── COMPACT UNIFIED HERO SECTION ── */}
      <header className="relative py-14 lg:py-20 overflow-hidden bg-[#050a1a] text-white border-b border-[#D4AF37]/20">
        <div className="absolute inset-0 z-0 opacity-35">
          <ImageWithShimmer 
            src={partyPackagesHeroImg} 
            alt="Custom Party Packages and Lux Gifting background" 
            className="w-full h-full object-cover filter brightness-50 contrast-105"
            containerClassName="w-full h-full"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#050a1a]/85 via-[#050a1a]/60 to-[#050a1a]" />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-5">
          <span className="inline-flex items-center gap-1.5 bg-[#775a19]/30 text-[#ffdea5] border border-[#D4AF37]/40 px-3.5 py-1 rounded-full text-[10px] sm:text-xs font-sans tracking-widest uppercase font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Complete Celebration Experiences • Frisco &amp; DFW</span>
          </span>

          <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight max-w-4xl leading-tight text-[#FBF8F3] mx-auto">
            Party Packages, Live Stations &amp;{" "}
            <span className="italic text-[#ffdea5]">Lux Gifting</span>
          </h1>

          <p className="font-sans text-xs sm:text-sm lg:text-base text-gray-200 max-w-2xl leading-relaxed mx-auto">
            From sizzling live chaat and jalebi counters to curated occasion bundles and personalized return-gift hampers—everything you need to host an unforgettable celebration from one trusted Frisco home kitchen.
          </p>

          {/* 2-Way Quick Section Jump Pills */}
          <div className="flex flex-wrap justify-center items-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => scrollToSection("live-packages-section")}
              className="min-h-[42px] bg-[#775a19] hover:bg-[#5d4201] text-white font-sans text-xs font-bold uppercase tracking-wider px-6 py-2.5 rounded-xl border border-[#D4AF37]/50 shadow-lg transition-all flex items-center gap-2 cursor-pointer"
            >
              <Sparkles className="h-3.5 w-3.5 text-[#ffdea5]" />
              <span>1. Live Stations &amp; Party Packages</span>
            </button>
            <button
              type="button"
              onClick={() => scrollToSection("lux-gifting-section")}
              className="min-h-[42px] bg-[#0f1938] hover:bg-[#16244d] text-[#ffdea5] font-sans text-xs font-bold uppercase tracking-wider px-6 py-2.5 rounded-xl border border-[#D4AF37]/40 shadow-md transition-all flex items-center gap-2 cursor-pointer"
            >
              <Gift className="h-3.5 w-3.5 text-[#ffdea5]" />
              <span>2. Lux Gifting &amp; Return Hampers</span>
            </button>
          </div>
        </div>
      </header>

      {/* ── SECTION 1: INTERACTIVE LIVE STATION BUILDER & 4 COMPACT OCCASION PACKAGES ── */}
      <section id="live-packages-section" className="py-14 lg:py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14 scroll-mt-24">
        
        {/* 1A. Interactive Live Station & Event Proposal Configurator */}
        <div className="space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-[10px] font-bold tracking-widest text-[#ffdea5] uppercase block font-sans">
              CUSTOM EVENT CONFIGURATOR
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-[#FBF8F3]">
              Build Your Live Counter &amp; Party Proposal
            </h2>
            <p className="text-gray-300 text-xs sm:text-sm font-sans">
              Select your favorite live food stations, add optional return-gift hampers, set your guest count, and send an instant proposal request on WhatsApp.
            </p>
            <div className="h-0.5 w-16 bg-[#D4AF37] mx-auto mt-2" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 bg-[#0f1938] p-5 sm:p-8 rounded-3xl border border-[#D4AF37]/35 shadow-2xl">
            
            {/* Left 8 Cols: 6 Authentic Live Stations */}
            <div className="lg:col-span-8 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-serif text-base sm:text-lg font-bold text-[#FBF8F3]">
                  Signature Pure-Veg Live Stations
                </h3>
                <span className="text-xs text-[#ffdea5] font-bold bg-[#775a19]/30 px-2.5 py-1 rounded-full border border-[#D4AF37]/30">
                  {selectedStations.length} Selected
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {liveStationsList.map((station) => {
                  const isSelected = selectedStations.includes(station.name);
                  return (
                    <div
                      key={station.id}
                      onClick={() => toggleStation(station.name)}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 ${
                        isSelected
                          ? "bg-[#16244d] border-[#D4AF37] shadow-md"
                          : "bg-[#0a1128] hover:bg-[#111d42] border-white/10"
                      }`}
                    >
                      <div className={`h-5 w-5 rounded-md flex items-center justify-center shrink-0 border mt-0.5 transition-colors ${
                        isSelected ? "bg-[#775a19] border-[#D4AF37] text-white" : "border-gray-500 bg-transparent"
                      }`}>
                        {isSelected && <Check className="h-3.5 w-3.5" />}
                      </div>
                      <div>
                        <div className="text-xs font-bold font-sans text-[#FBF8F3] flex items-center gap-1.5">
                          <Sparkles className="h-3 w-3 text-[#ffdea5] shrink-0" />
                          <span>{station.name}</span>
                        </div>
                        <p className="text-[11px] text-gray-300 font-sans mt-0.5 leading-snug">
                          {station.desc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right 4 Cols: Guest Count + Optional Gifting Add-On + WhatsApp CTA */}
            <div className="lg:col-span-4 bg-gradient-to-br from-[#0a1128] to-[#16244d] border border-[#D4AF37]/40 text-white p-5 sm:p-6 rounded-2xl flex flex-col justify-between space-y-5">
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-[#ffdea5] font-serif text-sm font-bold">
                  <Sparkles className="h-4 w-4" />
                  <span>Instant Event Estimator</span>
                </div>

                {/* Guest Count Slider */}
                <div>
                  <div className="flex justify-between text-xs font-sans mb-1.5">
                    <span className="text-gray-300 font-bold uppercase tracking-wider">Estimated Guests</span>
                    <span className="text-[#ffdea5] font-bold text-sm">{guestCount} Guests</span>
                  </div>
                  <input
                    type="range"
                    min="20"
                    max="300"
                    step="10"
                    value={guestCount}
                    onChange={(e) => setGuestCount(Number(e.target.value))}
                    className="w-full accent-[#D4AF37] cursor-pointer h-2 bg-white/20 rounded-lg"
                  />
                  <div className="flex justify-between text-[10px] text-gray-400 font-sans mt-1">
                    <span>20</span>
                    <span>150</span>
                    <span>300+</span>
                  </div>
                </div>

                {/* Optional Gifting Hamper Add-on */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-300 block">
                    Include Return-Gift Hampers?
                  </span>
                  <div className="grid grid-cols-1 gap-1.5">
                    {giftingAddonOptions.map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => setSelectedGiftingAddon(opt)}
                        className={`text-left px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all cursor-pointer border ${
                          selectedGiftingAddon === opt
                            ? "bg-[#775a19]/40 border-[#D4AF37] text-[#ffdea5]"
                            : "bg-white/5 border-white/10 text-gray-300 hover:bg-white/10"
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Summary Preview */}
                <div className="p-3 rounded-xl bg-black/30 border border-[#D4AF37]/25 space-y-1">
                  <div className="text-[10px] uppercase tracking-wider text-[#ffdea5] font-bold">Proposal Summary</div>
                  <div className="text-xs text-gray-200 leading-snug">
                    <strong>{selectedStations.length} Live Stations</strong> for <strong>{guestCount} Guests</strong>
                    {selectedGiftingAddon !== "None" && (
                      <span className="block text-[#ffdea5] mt-0.5">+ {selectedGiftingAddon}</span>
                    )}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleWhatsAppQuote()}
                className="w-full min-h-[44px] bg-[#775a19] hover:bg-[#5d4201] text-white font-sans text-xs font-bold uppercase tracking-wider py-3 px-4 rounded-xl border border-[#D4AF37]/50 shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Send className="h-4 w-4 text-[#ffdea5]" />
                <span>Send WhatsApp Proposal</span>
              </button>
            </div>

          </div>
        </div>

        {/* 1B. 4 Compact Occasion Packages in a Single 4-Column Row */}
        <div className="space-y-8 pt-4">
          <div className="text-center max-w-2xl mx-auto space-y-1.5">
            <span className="text-[10px] font-bold tracking-widest text-[#ffdea5] uppercase block">
              CURATED PARTY BUNDLES
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#FBF8F3]">
              Ready-to-Customize Occasion Packages
            </h2>
            <p className="text-xs sm:text-sm text-gray-300">
              Complete menu frameworks combining starters, mains, drinks, and custom cakes—tailored to your guest count.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {packages.map((pkg, idx) => {
              const IconComponent = pkg.icon;
              return (
                <div 
                  key={idx} 
                  className="border border-[#D4AF37]/30 rounded-2xl bg-[#0f1938] flex flex-col justify-between hover:border-[#D4AF37] transition-all duration-300 shadow-lg overflow-hidden group"
                >
                  <div>
                    <div className="relative h-40 overflow-hidden">
                      <ImageWithShimmer 
                        src={pkg.image} 
                        alt={pkg.title} 
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        containerClassName="w-full h-full"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0f1938] via-transparent to-transparent" />
                      <div className="absolute top-3 right-3 h-8 w-8 rounded-lg bg-[#050a1a]/80 border border-[#D4AF37]/40 text-[#ffdea5] flex items-center justify-center">
                        <IconComponent className="h-4 w-4" />
                      </div>
                    </div>

                    <div className="p-5 space-y-3.5">
                      <div>
                        <h3 className="font-serif text-base sm:text-lg font-bold text-[#FBF8F3] leading-snug">
                          {pkg.title}
                        </h3>
                        <p className="text-gray-300 text-xs mt-1 leading-snug">
                          {pkg.subtitle}
                        </p>
                      </div>

                      <div className="h-[1px] w-full bg-white/10" />

                      <ul className="space-y-2 text-xs">
                        {pkg.items.map((item, itemIdx) => {
                          const isOptional = item.startsWith("*");
                          const cleanItem = isOptional ? item.slice(1).trim() : item;
                          return (
                            <li key={itemIdx} className="flex items-start gap-2">
                              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#775a19]/30 text-[#ffdea5] text-[9px] font-bold shrink-0 mt-0.5">
                                ✓
                              </span>
                              <span className={isOptional ? "text-[#ffdea5] italic text-[11px]" : "text-gray-200 text-xs"}>
                                {cleanItem}
                              </span>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  </div>

                  <div className="p-5 pt-0">
                    <button
                      type="button"
                      onClick={() => handleWhatsAppQuote(pkg.title)}
                      className="w-full py-2 px-3 rounded-xl bg-white/5 hover:bg-[#775a19] text-[#ffdea5] hover:text-white border border-[#D4AF37]/30 text-[11px] font-bold uppercase tracking-wider transition-all cursor-pointer"
                    >
                      Inquire for {pkg.title.split(" ")[0]}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </section>

      {/* ── SECTION 2: LUX GIFTING & RETURN-GIFT HAMPERS (MERGED & CRISP) ── */}
      <section id="lux-gifting-section" className="bg-[#0a1128] border-t border-[#D4AF37]/25 py-14 lg:py-16 scroll-mt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="inline-flex items-center gap-1.5 text-[10px] font-bold tracking-widest text-[#ffdea5] uppercase">
              <Gift className="w-3.5 h-3.5" />
              <span>THE LUXURY GIFTING COLLECTION</span>
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-[#FBF8F3]">
              Lux Gifting &amp; Celebration Return Hampers
            </h2>
            <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
              Handcrafted festive boxes and party return favors filled with gourmet cookies, fusion sweets, spiced nuts, and personalized family name cards (starting from $20/box).
            </p>
            <div className="h-0.5 w-16 bg-[#D4AF37] mx-auto mt-2" />
          </div>

          {/* 3 Signature Gifting Collections */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {signatureCollections.map((col, idx) => (
              <div 
                key={idx}
                className="bg-[#0f1938] border border-[#D4AF37]/30 rounded-2xl overflow-hidden hover:border-[#D4AF37] transition-all duration-300 shadow-xl flex flex-col justify-between group"
              >
                <div>
                  <div className="relative h-52 overflow-hidden">
                    <img 
                      src={col.image} 
                      alt={col.title} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0f1938] via-transparent to-transparent" />
                    <span className="absolute top-3 left-3 bg-[#775a19] text-white border border-[#D4AF37]/50 text-[10px] font-bold tracking-widest uppercase px-2.5 py-1 rounded-full shadow">
                      {col.tag}
                    </span>
                  </div>
                  <div className="p-6 space-y-2">
                    <h3 className="font-serif text-xl font-bold text-[#FBF8F3]">{col.title}</h3>
                    <p className="text-gray-300 text-xs leading-relaxed">{col.desc}</p>
                  </div>
                </div>

                <div className="p-6 pt-0">
                  <button
                    type="button"
                    onClick={() => handleWhatsAppQuote(col.title)}
                    className="w-full py-2.5 px-4 rounded-xl bg-[#775a19]/30 hover:bg-[#775a19] text-[#ffdea5] hover:text-white border border-[#D4AF37]/40 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
                  >
                    Request {col.title} Quote
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Compact Personalization Strip + Direct Gifting CTA Box */}
          <div className="rounded-2xl bg-[#0f1938] border border-[#D4AF37]/35 p-6 sm:p-8 shadow-xl flex flex-col lg:flex-row items-center justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <div className="flex items-center gap-2 text-[#ffdea5] text-xs font-bold uppercase tracking-widest">
                <Package className="w-4 h-4" />
                <span>Custom Personalization &amp; Bulk Event Gifting</span>
              </div>
              <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#FBF8F3]">
                Tailored to Your Theme, Dietary Needs &amp; Budget
              </h3>
              <div className="flex flex-wrap gap-2 pt-1">
                {personalizationPills.map((pill, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1.5 text-[11px] font-medium bg-[#0a1128] text-gray-200 border border-[#D4AF37]/30 px-3 py-1 rounded-full"
                  >
                    <Check className="w-3 h-3 text-emerald-400 shrink-0" />
                    <span>{pill}</span>
                  </span>
                ))}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row lg:flex-col gap-3 w-full lg:w-auto shrink-0">
              <button
                type="button"
                onClick={() => handleWhatsAppQuote("Custom Lux Gifting Hampers")}
                className="min-h-[44px] px-6 py-3 bg-[#775a19] hover:bg-[#5d4201] text-white text-xs font-bold uppercase tracking-widest rounded-xl border border-[#D4AF37]/50 shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5 text-[#ffdea5]" />
                <span>WhatsApp Gifting Quote</span>
              </button>
              <a
                href="sms:+19455274566?body=Hi%20Bluebonnet%20Whisk!%20I'd%20like%20to%20inquire%20about%20custom%20party%20packages%20or%20gifting%20hampers."
                className="min-h-[44px] px-6 py-3 bg-white/5 hover:bg-white/10 text-[#ffdea5] text-xs font-bold uppercase tracking-widest rounded-xl border border-[#D4AF37]/40 flex items-center justify-center gap-2"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Text / SMS Our Kitchen</span>
              </a>
            </div>
          </div>

        </div>
      </section>

      {/* ── MOBILE SAFE-AREA BOTTOM ACTION DOCK ── */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#050a1a]/95 backdrop-blur-md border-t border-[#D4AF37]/30 p-3 pb-safe shadow-2xl">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => handleWhatsAppQuote()}
            className="flex-1 min-h-[44px] bg-[#775a19] hover:bg-[#5d4201] text-white font-sans text-xs font-bold uppercase tracking-wider rounded-xl border border-[#D4AF37]/40 shadow-md flex items-center justify-center gap-2 cursor-pointer"
          >
            <Send className="h-4 w-4 text-[#ffdea5]" />
            <span>WhatsApp Package / Gifting Quote</span>
          </button>
        </div>
      </div>

    </div>
  );
}
