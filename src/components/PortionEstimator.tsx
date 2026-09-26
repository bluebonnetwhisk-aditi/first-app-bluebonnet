import { useState } from 'react';
import { 
  Users, 
  Utensils, 
  Layers, 
  Sparkles, 
  Flame, 
  Info, 
  Coffee, 
  Heart, 
  ArrowRight,
  Phone,
  MessageSquare,
  MessageCircle,
  CheckCircle2,
  Leaf
} from 'lucide-react';

interface PortionEstimatorProps {
  onNavigateToFoodOrder?: () => void;
  onOpenInquiry?: () => void;
}

export default function PortionEstimator({ 
  onNavigateToFoodOrder,
  onOpenInquiry 
}: PortionEstimatorProps) {
  // Headcount controls (10 to 100 guests, default 20)
  const [guests, setGuests] = useState<number>(20);
  
  // Party Format toggle: Standard Buffet vs Cocktail / Heavy Starter
  const [partyFormat, setPartyFormat] = useState<'standard' | 'cocktail'>('standard');

  // Clamp and synchronize headcount input
  const handleHeadcountChange = (val: number) => {
    if (isNaN(val)) return;
    const clamped = Math.max(10, Math.min(100, val));
    setGuests(clamped);
  };

  // Determine Headcount Tier (Tiers 1 to 4)
  let tierNumber = 1;
  let tierTitle = "Tier 1: Intimate Gathering";
  let tierBadge = "10–14 Guests";
  let tierDesc = "Compact family or small dinner party portioning";

  if (guests >= 76) {
    tierNumber = 4;
    tierTitle = "Tier 4: Banquet / Hall Event";
    tierBadge = "76–100 Guests";
    tierDesc = "High-volume banquet configuration with multi-station buffer";
  } else if (guests >= 36) {
    tierNumber = 3;
    tierTitle = "Tier 3: Large Gathering";
    tierBadge = "36–75 Guests";
    tierDesc = "Spacious party or corporate event with enhanced variety";
  } else if (guests >= 15) {
    tierNumber = 2;
    tierTitle = "Tier 2: Small-to-Medium Party";
    tierBadge = "15–35 Guests";
    tierDesc = "Optimal balance for birthdays, pujas, and milestone gatherings";
  }

  // Calculate Naan / Roti pieces (1.5 pieces per guest, rounded to nearest 5)
  const breadPieces = Math.max(15, Math.round((guests * 1.5) / 5) * 5);

  // Sweets: strictly 1 piece per person
  const sweetPieces = guests;
  const sweetWarm = Math.ceil(guests / 2);
  const sweetCold = Math.floor(guests / 2);

  // Specialty Drinks: ~1.15 to 1.25 servings per person (~8-10 oz)
  const drinkServings = Math.round(guests * (partyFormat === 'cocktail' ? 1.25 : 1.15));

  // Starter items computation
  const isCocktail = partyFormat === 'cocktail';

  // Modular items generator (Strictly 100% Pure Vegetarian)
  const getStarterAllocations = () => {
    if (tierNumber === 1) {
      return [
        {
          name: "Crispy Starter: Vegetable Samosas / Spring Rolls",
          category: "Vegetarian Crispy",
          allocation: isCocktail ? "1/2 Tray (Half Pan)" : "1/3 Tray (Third Pan)",
          servingsGuide: isCocktail ? "~40–45 pieces (4 bites/guest)" : "~20–25 pieces (2–3 bites/guest)"
        },
        {
          name: "Tandoori Skewer: Flame-Grilled Paneer Tikka / Hariyali Paneer",
          category: "Tandoori Vegetarian",
          allocation: isCocktail ? "1/2 Tray (Half Pan)" : "1/3 Tray (Third Pan)",
          servingsGuide: isCocktail ? "~35–40 bites (4 bites/guest)" : "~20–25 bites (2–3 bites/guest)"
        }
      ];
    } else if (tierNumber === 2) {
      const primaryPan = guests > 24 || isCocktail ? "1/2 Tray (Half Pan)" : "1/3 Tray (Third Pan)";
      return [
        {
          name: "Hot Appetizer: Cocktail Samosas / Veg Spring Rolls",
          category: "Vegetarian Crispy",
          allocation: primaryPan,
          servingsGuide: "~60–80 pieces"
        },
        {
          name: "Tandoori Griddle: Spiced Paneer Tikka",
          category: "Vegetarian Tandoori",
          allocation: isCocktail ? "1/2 Tray (Half Pan)" : "1/3 Tray (Third Pan)",
          servingsGuide: "~35–50 pieces"
        },
        {
          name: "Indo-Chinese: Crispy Gobi Manchurian",
          category: "Wok Vegetarian",
          allocation: isCocktail ? "1/2 Tray (Half Pan)" : "1/3 Tray (Third Pan)",
          servingsGuide: "~40–55 pieces"
        }
      ];
    } else if (tierNumber === 3) {
      return [
        {
          name: "Street Chaat: Samosa Chaat or Cocktail Samosas",
          category: "Chaat & Crispy",
          allocation: "1/2 Tray (Half Pan)",
          servingsGuide: "~80–100 pieces"
        },
        {
          name: "Tandoori Starter: Claypot Paneer Tikka",
          category: "Tandoori Vegetarian",
          allocation: "1/2 Tray (Half Pan)",
          servingsGuide: "~75–90 pieces"
        },
        {
          name: "Indo-Chinese: Gobi Manchurian / Chilli Paneer",
          category: "Wok Vegetarian",
          allocation: "1/2 Tray (Half Pan)",
          servingsGuide: "~70–85 pieces"
        },
        {
          name: "Crispy Bites: Hara Bhara Kebab / Corn Cheese Tikki",
          category: "Vegetarian Finger Food",
          allocation: isCocktail ? "Full Tray (Full Pan)" : "1/2 Tray (Half Pan)",
          servingsGuide: isCocktail ? "~160–180 pieces" : "~80–100 pieces"
        }
      ];
    } else {
      // Tier 4 (76-100 guests)
      return [
        {
          name: "Primary Crowd-Pleaser: Cocktail Samosas / Spring Rolls",
          category: "Crispy Starter",
          allocation: "Full Tray (Full Pan)",
          servingsGuide: "~160–180 pieces"
        },
        {
          name: "Tandoori Platter: Flame-Kissed Paneer Tikka",
          category: "Tandoori Vegetarian",
          allocation: "Full Tray (Full Pan)",
          servingsGuide: "~150–170 pieces"
        },
        {
          name: "Wok Appetizer: Veg Manchurian / Crispy Corn",
          category: "Wok Special",
          allocation: "1/2 Tray (Half Pan)",
          servingsGuide: "~80–100 pieces"
        },
        {
          name: "Gourmet Bites: Hara Bhara Kebab / Dahi Kebab",
          category: "Vegetarian Specialty",
          allocation: "Full Tray (Full Pan)",
          servingsGuide: "~160–190 pieces"
        }
      ];
    }
  };

  const getMainCurryAllocations = () => {
    if (tierNumber === 1) {
      return [
        {
          name: "Heavy Gravy / Protein: Paneer Butter Masala or Matar Paneer",
          category: "Rich Gravy Main",
          allocation: "1/3 Tray (Third Pan)",
          servingsGuide: "10–12 ladle portions"
        },
        {
          name: "Dry Homestyle Sabzi: Aloo Gobi / Bhindi Do Pyaza",
          category: "Dry Vegetable",
          allocation: "1/3 Tray (Third Pan)",
          servingsGuide: "10–12 side portions"
        },
        {
          name: "Lentil Specialty: Daal Tadka or Slow-Simmered Dal Makhani",
          category: "Lentils",
          allocation: "1/3 Tray (Third Pan)",
          servingsGuide: "10–12 bowl ladles"
        }
      ];
    } else if (tierNumber === 2) {
      return [
        {
          name: "Anchor Curry: Paneer Butter Masala / Shahi Paneer",
          category: "Paneer Specialty",
          allocation: "1/2 Tray (Half Pan)",
          servingsGuide: "25–30 balanced portions"
        },
        {
          name: "Dry Vegetable: Aloo Methi / Green Bean Poriyal / Gobi Masala",
          category: "Dry Sabzi",
          allocation: isCocktail ? "1/3 Tray (Third Pan)" : "1/2 Tray (Half Pan)",
          servingsGuide: "20–25 side portions"
        },
        {
          name: "Slow-Cooked Daal: Dal Makhani or Yellow Daal Tadka",
          category: "Comfort Lentils",
          allocation: "1/2 Tray (Half Pan)",
          servingsGuide: "25–30 servings"
        }
      ];
    } else if (tierNumber === 3) {
      const isUpperTier3 = guests >= 55;
      return [
        {
          name: "Anchor Paneer: Paneer Lababdar / Butter Masala",
          category: "Paneer Showcase",
          allocation: isUpperTier3 ? "Full Tray (Full Pan)" : "1/2 Tray + 1/3 Tray (Combination)",
          servingsGuide: isUpperTier3 ? "50–60 entree ladles" : "38–45 entree ladles"
        },
        {
          name: "Seasonal Dry Vegetable: Baingan Bharta / Aloo Gobi Matar",
          category: "Dry Sabzi",
          allocation: "1/2 Tray (Half Pan)",
          servingsGuide: "25–30 side servings"
        },
        {
          name: "Lentil Main: Slow-Simmered Black Dal Makhani",
          category: "Signature Daal",
          allocation: "1/2 Tray (Half Pan)",
          servingsGuide: "28–35 servings"
        },
        {
          name: "Specialty Vegetarian Main: Malai Kofta / Methi Matar Malai",
          category: "Rich Kofta Gravy",
          allocation: "1/2 Tray (Half Pan)",
          servingsGuide: "25–30 servings"
        }
      ];
    } else {
      // Tier 4 (76-100 guests)
      return [
        {
          name: "Anchor Paneer: Shahi Paneer / Paneer Butter Masala",
          category: "Paneer Showcase",
          allocation: "Full Tray (Full Pan)",
          servingsGuide: "55–65 entree servings"
        },
        {
          name: "Dry Vegetable: Mix Veg Handi / Aloo Gobi / Bhindi",
          category: "Dry Sabzi",
          allocation: "Full Tray (or 2x Half Trays)",
          servingsGuide: "50–60 side portions"
        },
        {
          name: "Comfort Lentil: Daal Tadka or Dal Makhani",
          category: "Signature Daal",
          allocation: "Full Tray (or 2x Half Trays)",
          servingsGuide: "55–65 soup/curry servings"
        },
        {
          name: "Rich Gravy Main: Malai Kofta Curry / Paneer Tikka Masala",
          category: "Kofta & Gravy Main",
          allocation: "Full Tray (Full Pan)",
          servingsGuide: "55–65 entree servings"
        }
      ];
    }
  };

  const getCarbAllocations = () => {
    if (tierNumber === 1) {
      return [
        {
          name: "Fragrant Rice: Dum Biryani or Cumin Jeera Rice",
          category: "Basmati Carb",
          allocation: "1/3 Tray (Third Pan)",
          servingsGuide: "10–12 rice portions (~6–8 oz each)"
        },
        {
          name: "Artisan Tandoori Breads: Fresh Butter Naan / Tawa Roti",
          category: "Fresh Breads",
          allocation: `${breadPieces} Pieces (${guests} guests × 1.5)`,
          servingsGuide: "Portioned 1.5 pieces per person"
        }
      ];
    } else if (tierNumber === 2) {
      return [
        {
          name: "Signature Rice: Hyderabadi Veg Dum Biryani",
          category: "Basmati Carb",
          allocation: "1/2 Tray (Half Pan)",
          servingsGuide: "25–30 entree servings"
        },
        {
          name: "Fresh Tandoori Breads: Garlic Naan & Butter Naan Assortment",
          category: "Fresh Breads",
          allocation: `${breadPieces} Pieces (${guests} guests × 1.5)`,
          servingsGuide: "Portioned 1.5 pieces per person"
        }
      ];
    } else if (tierNumber === 3) {
      return [
        {
          name: "Celebration Biryani: Fragrant Layered Veg Dum Biryani",
          category: "Specialty Rice",
          allocation: "Full Tray (Full Pan)",
          servingsGuide: "50–60 servings"
        },
        {
          name: "Complementary Rice: Fragrant Cumin Jeera Rice",
          category: "Mild Carb",
          allocation: "1/2 Tray (Half Pan)",
          servingsGuide: "25–30 servings"
        },
        {
          name: "Tandoori Breads: Naan / Roti / Kulcha Basket",
          category: "Fresh Breads",
          allocation: `${breadPieces} Pieces (${guests} guests × 1.5)`,
          servingsGuide: "Portioned 1.5 pieces per person"
        }
      ];
    } else {
      // Tier 4 (76-100 guests)
      return [
        {
          name: "Signature Dum Biryani: Hyderabadi Layered Veg Biryani",
          category: "Grand Rice",
          allocation: "Full Tray + 1/2 Tray (or 2x Full Trays)",
          servingsGuide: "80–90 servings"
        },
        {
          name: "Aromatic Steamed Rice: Cumin Jeera Basmati Rice",
          category: "Mild Carb",
          allocation: "Full Tray (Full Pan)",
          servingsGuide: "55–60 servings"
        },
        {
          name: "Fresh Tandoori Breads: Butter Naan / Garlic Naan / Tawa Roti",
          category: "Fresh Breads",
          allocation: `${breadPieces} Pieces (${guests} guests × 1.5)`,
          servingsGuide: "Portioned 1.5 pieces per person"
        }
      ];
    }
  };

  const getDessertAndDrinkAllocations = () => {
    return [
      {
        name: guests >= 15 
          ? `Warm & Cold Dual Sweets: Gulab Jamun (${sweetWarm} pcs) + Rasmalai (${sweetCold} cups)`
          : `Gourmet Sweets: Gulab Jamun or Rasmalai (${sweetPieces} servings)`,
        category: "Traditional Sweets",
        allocation: `${sweetPieces} Portions Total (Strictly 1 pc / guest)`,
        servingsGuide: "Exact 1:1 guest ratio (no food wastage)"
      },
      {
        name: "Specialty Indian Drink: Chilled Mango Lassi or Masala Chai",
        category: "Beverage",
        allocation: `${drinkServings} Servings (~8–10 oz cups)`,
        servingsGuide: "1.15 to 1.25 servings per attendee"
      }
    ];
  };

  const starterItems = getStarterAllocations();
  const curryItems = getMainCurryAllocations();
  const carbItems = getCarbAllocations();
  const dessertDrinkItems = getDessertAndDrinkAllocations();

  return (
    <section id="portion-estimator" className="py-20 bg-[#050a1a] text-white font-sans border-t border-white/5">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Header Title & Subtitle */}
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-gold-tint/15 border border-brand-gold-tint/30 text-brand-gold-tint text-[11px] font-bold uppercase tracking-widest">
            <Utensils className="w-3.5 h-3.5" />
            <span>Pure Vegetarian Catering Science &amp; Food Volume Guide</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-brand-cream">
            Portion Estimator
          </h2>
          <p className="text-xs sm:text-sm text-gray-300 font-light leading-relaxed">
            Eliminate guesswork when planning 100% vegetarian Indian catering. Calculate exact steam table pans, tray sizes, appetizer bites, breads, and desserts for any guest size.
          </p>
          <div className="h-0.5 w-16 bg-brand-gold-tint mx-auto mt-2" />
        </div>

        {/* ── 1. INTERACTIVE INPUT CONTROLS PANEL ── */}
        <div className="glass-panel-dark rounded-2xl p-6 sm:p-8 border border-white/10 shadow-2xl space-y-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Component A: Guest Headcount Controls (7 Cols) */}
            <div className="lg:col-span-7 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-brand-gold-tint" />
                  <label htmlFor="guest-headcount-input" className="text-xs font-bold uppercase tracking-wider text-gray-300">
                    Guest Headcount ($N$)
                  </label>
                </div>
                
                {/* Bidirectional Input Field */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400 font-medium hidden sm:inline">Direct Input:</span>
                  <div className="relative">
                    <input 
                      id="guest-headcount-input"
                      type="number"
                      min={10}
                      max={100}
                      step={1}
                      value={guests}
                      onChange={(e) => handleHeadcountChange(parseInt(e.target.value))}
                      className="w-20 px-2.5 py-1.5 bg-[#0b1b40] border-2 border-brand-gold-tint/60 rounded-lg text-center font-serif text-lg font-bold text-brand-cream focus:border-brand-gold-tint focus:outline-none"
                    />
                  </div>
                  <span className="text-xs font-bold uppercase text-brand-gold-tint">Guests</span>
                </div>
              </div>

              {/* Range Slider (min 10, max 100, step 1) */}
              <div className="space-y-1.5 pt-1">
                <input 
                  type="range"
                  min={10}
                  max={100}
                  step={1}
                  value={guests}
                  onChange={(e) => setGuests(parseInt(e.target.value))}
                  className="w-full h-2.5 bg-[#0b1226] rounded-lg appearance-none cursor-pointer accent-[#ffdea5]"
                  aria-label="Guest Headcount Slider"
                />
                <div className="flex justify-between text-[10px] text-gray-400 font-mono">
                  <span>10 Guests (Min)</span>
                  <span>25</span>
                  <span>50</span>
                  <span>75</span>
                  <span>100 Guests (Max)</span>
                </div>
              </div>

              {/* Quick Preset Buttons */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Presets:</span>
                {[12, 20, 35, 50, 75, 100].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setGuests(num)}
                    className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
                      guests === num 
                        ? 'bg-brand-gold-tint text-[#00346f] shadow-sm'
                        : 'bg-white/10 hover:bg-white/15 text-gray-200 border border-white/10'
                    }`}
                  >
                    {num}p
                  </button>
                ))}
              </div>
            </div>

            {/* Component B: Party Service Format (5 Cols) */}
            <div className="lg:col-span-5 bg-white/5 rounded-xl p-4 sm:p-5 border border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase font-bold tracking-wider text-gray-300 block">
                  Party Service Format
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] text-emerald-300 font-bold bg-emerald-500/20 px-2.5 py-0.5 rounded-full border border-emerald-400/30">
                  <Leaf className="w-3 h-3 text-emerald-300" />
                  100% Pure Vegetarian
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPartyFormat('standard')}
                  className={`py-2 px-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition cursor-pointer text-center ${
                    partyFormat === 'standard'
                      ? 'bg-[#00346f] text-white border border-[#ffdea5]/40 shadow-md'
                      : 'bg-black/30 hover:bg-black/50 text-gray-300 border border-white/10'
                  }`}
                >
                  <span>Dinner Buffet (Std)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPartyFormat('cocktail')}
                  className={`py-2 px-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition cursor-pointer text-center ${
                    partyFormat === 'cocktail'
                      ? 'bg-[#775a19] text-white border border-[#ffdea5]/40 shadow-md'
                      : 'bg-black/30 hover:bg-black/50 text-gray-300 border border-white/10'
                  }`}
                >
                  <span>Cocktail / Heavy Starters</span>
                </button>
              </div>
              <p className="text-[11px] text-gray-300 leading-relaxed font-light">
                {partyFormat === 'cocktail' 
                  ? "Starters increased to 5–6 pieces/guest; curries trimmed by ~20%." 
                  : "Standard balance: 3–4 starter bites, hearty main curries, and rich carbs."}
              </p>
            </div>

          </div>

          {/* ── LIVE REACTIVE TIER SUMMARY CARD ── */}
          <div className="rounded-xl bg-gradient-to-r from-[#00224d] via-[#0b1b40] to-[#1a120b] p-4 sm:p-5 border border-brand-gold-tint/40 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="bg-brand-gold-tint text-[#00346f] text-xs font-black uppercase px-2.5 py-0.5 rounded-full tracking-wider">
                  {tierTitle} ({tierBadge})
                </span>
                <span className="text-xs text-brand-gold-tint font-bold">
                  • Headcount: {guests} Attendees
                </span>
                <span className="text-xs text-emerald-300 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  100% Pure Vegetarian Menu
                </span>
              </div>
              <p className="text-xs text-gray-300 font-light">
                {tierDesc}. Steam table pan allocations calculated for complete self-serve sufficiency.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <div className="text-right">
                <span className="text-[10px] text-gray-400 uppercase tracking-widest block">Bread Target</span>
                <span className="font-serif text-lg font-bold text-white">{breadPieces} Naan / Roti</span>
              </div>
              <div className="h-8 w-px bg-white/20" />
              <div className="text-right">
                <span className="text-[10px] text-gray-400 uppercase tracking-widest block">Sweets Budget</span>
                <span className="font-serif text-lg font-bold text-brand-gold-tint">{sweetPieces} Pieces (1/guest)</span>
              </div>
            </div>
          </div>

        </div>

        {/* ── 2. MODULAR TRAY BREAKDOWN TABLE ── */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-xl sm:text-2xl font-bold text-brand-cream flex items-center gap-2">
              <Layers className="w-5 h-5 text-brand-gold-tint" />
              <span>Recommended Pan &amp; Tray Allocations (100% Pure Vegetarian)</span>
            </h3>
            <span className="text-xs text-gray-400 italic hidden sm:inline">
              Steam Table Standards: 1/3 Tray (Small) • Half Tray (Medium) • Full Tray (Large)
            </span>
          </div>

          <div className="grid grid-cols-1 gap-6">

            {/* Course A: Starters */}
            <div className="glass-panel-dark rounded-xl overflow-hidden border border-white/10">
              <div className="bg-[#00224d]/90 px-4 sm:px-6 py-3 border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-brand-gold-tint" />
                  <span className="font-serif font-bold text-sm sm:text-base text-brand-cream uppercase tracking-wide">
                    1. Vegetarian Starters &amp; Appetizers ({starterItems.length} Selections)
                  </span>
                </div>
                <span className="text-[11px] text-brand-gold-tint font-bold">
                  {isCocktail ? '5–6 bites per guest' : '3–5 bites per guest'}
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-black/30 text-gray-400 text-[10px] uppercase font-bold tracking-wider border-b border-white/5">
                    <tr>
                      <th className="py-2.5 px-4 sm:px-6">Course &amp; Dish Blueprint</th>
                      <th className="py-2.5 px-4">Sub-Category</th>
                      <th className="py-2.5 px-4 text-brand-gold-tint font-black">Container Specification</th>
                      <th className="py-2.5 px-4">Consumption Target</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {starterItems.map((item, idx) => (
                      <tr key={idx} className="hover:bg-white/5 transition-colors">
                        <td className="py-3 px-4 sm:px-6 font-semibold text-white">{item.name}</td>
                        <td className="py-3 px-4 text-gray-300">{item.category}</td>
                        <td className="py-3 px-4 font-bold text-brand-gold-tint">{item.allocation}</td>
                        <td className="py-3 px-4 text-gray-400">{item.servingsGuide}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Course B: Main Course (Curries & Daal) */}
            <div className="glass-panel-dark rounded-xl overflow-hidden border border-white/10">
              <div className="bg-[#00224d]/90 px-4 sm:px-6 py-3 border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Flame className="w-4 h-4 text-amber-400" />
                  <span className="font-serif font-bold text-sm sm:text-base text-brand-cream uppercase tracking-wide">
                    2. Vegetarian Main Course Curries &amp; Daal ({curryItems.length} Dishes)
                  </span>
                </div>
                <span className="text-[11px] text-amber-300 font-bold">
                  ~8–10 oz combined curry volume per guest
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-black/30 text-gray-400 text-[10px] uppercase font-bold tracking-wider border-b border-white/5">
                    <tr>
                      <th className="py-2.5 px-4 sm:px-6">Course &amp; Dish Blueprint</th>
                      <th className="py-2.5 px-4">Sub-Category</th>
                      <th className="py-2.5 px-4 text-brand-gold-tint font-black">Container Specification</th>
                      <th className="py-2.5 px-4">Consumption Target</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {curryItems.map((item, idx) => (
                      <tr key={idx} className="hover:bg-white/5 transition-colors">
                        <td className="py-3 px-4 sm:px-6 font-semibold text-white">{item.name}</td>
                        <td className="py-3 px-4 text-gray-300">{item.category}</td>
                        <td className="py-3 px-4 font-bold text-brand-gold-tint">{item.allocation}</td>
                        <td className="py-3 px-4 text-gray-400">{item.servingsGuide}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Course C: Carbs (Rice & Breads) */}
            <div className="glass-panel-dark rounded-xl overflow-hidden border border-white/10">
              <div className="bg-[#00224d]/90 px-4 sm:px-6 py-3 border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Utensils className="w-4 h-4 text-emerald-400" />
                  <span className="font-serif font-bold text-sm sm:text-base text-brand-cream uppercase tracking-wide">
                    3. Carbs &amp; Accompaniments (Breads &amp; Rice)
                  </span>
                </div>
                <span className="text-[11px] text-emerald-300 font-bold">
                  1.5 breads + 1 carb serving per guest
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-black/30 text-gray-400 text-[10px] uppercase font-bold tracking-wider border-b border-white/5">
                    <tr>
                      <th className="py-2.5 px-4 sm:px-6">Course &amp; Dish Blueprint</th>
                      <th className="py-2.5 px-4">Sub-Category</th>
                      <th className="py-2.5 px-4 text-brand-gold-tint font-black">Container Specification</th>
                      <th className="py-2.5 px-4">Consumption Target</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {carbItems.map((item, idx) => (
                      <tr key={idx} className="hover:bg-white/5 transition-colors">
                        <td className="py-3 px-4 sm:px-6 font-semibold text-white">{item.name}</td>
                        <td className="py-3 px-4 text-gray-300">{item.category}</td>
                        <td className="py-3 px-4 font-bold text-brand-gold-tint">{item.allocation}</td>
                        <td className="py-3 px-4 text-gray-400">{item.servingsGuide}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Course D: Desserts & Drinks */}
            <div className="glass-panel-dark rounded-xl overflow-hidden border border-white/10">
              <div className="bg-[#00224d]/90 px-4 sm:px-6 py-3 border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Coffee className="w-4 h-4 text-rose-400" />
                  <span className="font-serif font-bold text-sm sm:text-base text-brand-cream uppercase tracking-wide">
                    4. Sweets &amp; Specialty Drinks
                  </span>
                </div>
                <span className="text-[11px] text-rose-300 font-bold">
                  Strictly 1 piece dessert per guest
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-black/30 text-gray-400 text-[10px] uppercase font-bold tracking-wider border-b border-white/5">
                    <tr>
                      <th className="py-2.5 px-4 sm:px-6">Course &amp; Dish Blueprint</th>
                      <th className="py-2.5 px-4">Sub-Category</th>
                      <th className="py-2.5 px-4 text-brand-gold-tint font-black">Container Specification</th>
                      <th className="py-2.5 px-4">Consumption Target</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {dessertDrinkItems.map((item, idx) => (
                      <tr key={idx} className="hover:bg-white/5 transition-colors">
                        <td className="py-3 px-4 sm:px-6 font-semibold text-white">{item.name}</td>
                        <td className="py-3 px-4 text-gray-300">{item.category}</td>
                        <td className="py-3 px-4 font-bold text-brand-gold-tint">{item.allocation}</td>
                        <td className="py-3 px-4 text-gray-400">{item.servingsGuide}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        </div>

        {/* ── 3. CATERING STRATEGY NOTES & PAN CAPACITY STANDARDS ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          
          {/* Multi-curry spreading insight */}
          <div className="p-5 rounded-2xl bg-white/5 border border-brand-gold-tint/25 space-y-2">
            <div className="flex items-center gap-2 text-brand-gold-tint font-bold text-xs uppercase tracking-wider">
              <Info className="w-4 h-4 shrink-0" />
              <span>Multi-Curry Spreading Rule</span>
            </div>
            <p className="text-xs text-gray-300 leading-relaxed font-light">
              Because guests sample a small portion of each dish when 3–4 curries are served, individual tray requirements are distributed across the variety rather than multiplied. A Half Tray of 3 different curries easily feeds 30 guests with generous variety.
            </p>
          </div>

          {/* Sweets allocation rule */}
          <div className="p-5 rounded-2xl bg-white/5 border border-rose-400/25 space-y-2">
            <div className="flex items-center gap-2 text-rose-300 font-bold text-xs uppercase tracking-wider">
              <Heart className="w-4 h-4 shrink-0" />
              <span>Dessert Budgeting Standard</span>
            </div>
            <p className="text-xs text-gray-300 leading-relaxed font-light">
              Sweets are budgeted at 1 per person; if offering both warm and cold sweets, order half the guest count in each (e.g., for 50 guests, order 25 Gulab Jamun and 25 Rasmalai) to prevent heavy leftovers while delighting every guest.
            </p>
          </div>

        </div>



        {/* ── 4. IMMEDIATE ACTION & MULTI-CHANNEL INQUIRY BAR ── */}
        <div className="rounded-3xl bg-gradient-to-br from-[#00346f] via-[#00224d] to-[#121620] p-6 sm:p-8 border border-brand-gold-tint/40 text-center space-y-6 shadow-2xl">
          <div className="max-w-xl mx-auto space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#ffdea5]">
              READY TO ORDER OR HAVE QUESTIONS?
            </span>
            <h3 className="font-serif text-2xl sm:text-3xl font-bold text-white">
              Turn Your Estimate into a Pure Vegetarian Feast
            </h3>
            <p className="text-xs sm:text-sm text-gray-200 font-light">
              Select these exact trays on our Food Order Portal or reach out directly to head chef Aditi via Call, SMS, or WhatsApp.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            {/* Direct portal order */}
            {onNavigateToFoodOrder && (
              <button
                type="button"
                onClick={onNavigateToFoodOrder}
                className="inline-flex items-center gap-2 bg-[#ffdea5] hover:bg-[#ffe7be] text-[#00346f] px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-md cursor-pointer hover:scale-102"
              >
                <Utensils className="w-4 h-4 text-[#00346f]" />
                <span>Open Food Order Portal</span>
                <ArrowRight className="w-4 h-4 text-[#00346f]" />
              </button>
            )}

            {/* Call */}
            <a
              href="tel:+19455274566"
              className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-5 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all border border-white/20 cursor-pointer"
            >
              <Phone className="w-4 h-4 text-emerald-400" />
              <span>Call 945-527-4566</span>
            </a>

            {/* SMS */}
            <a
              href={`sms:+19455274566?body=Hi%20Bluebonnet%20Whisk!%20I'm%20inquiring%20about%20pure%20vegetarian%20catering%20for%20${guests}%20guests.`}
              className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-5 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all border border-white/20 cursor-pointer"
            >
              <MessageSquare className="w-4 h-4 text-sky-400" />
              <span>SMS 945-527-4566</span>
            </a>

            {/* WhatsApp */}
            <a
              href={`https://wa.me/19455274566?text=Hi%20Bluebonnet%20Whisk!%20I'm%20inquiring%20about%20pure%20vegetarian%20catering%20for%20${guests}%20guests%20(${partyFormat === 'cocktail' ? 'Cocktail%20Focus' : 'Standard%20Dinner%20Buffet'}).`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#1ebd5a] text-white px-5 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-md cursor-pointer"
            >
              <MessageCircle className="w-4 h-4 fill-white" />
              <span>WhatsApp 945-527-4566</span>
            </a>

            {/* Custom Inquiry Wizard */}
            {onOpenInquiry && (
              <button
                type="button"
                onClick={onOpenInquiry}
                className="inline-flex items-center gap-2 bg-brand-gold-tint/15 hover:bg-brand-gold-tint/25 text-brand-gold-tint px-5 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all border border-brand-gold-tint/30 cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-brand-gold-tint" />
                <span>Custom Inquiry Wizard</span>
              </button>
            )}
          </div>
        </div>

      </div>
    </section>
  );
}
