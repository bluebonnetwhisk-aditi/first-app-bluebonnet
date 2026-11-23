import { useState } from 'react';
import { 
  Users, 
  Utensils, 
  Layers, 
  Sparkles, 
  Flame, 
  Coffee, 
  ArrowRight,
  Phone,
  MessageSquare,
  MessageCircle,
  CheckCircle2,
  Leaf,
  ChevronDown,
  ChevronUp,
  Calculator
} from 'lucide-react';

interface PortionEstimatorProps {
  onNavigateToFoodOrder?: () => void;
}

type FeastStyle = 'classic' | 'grand' | 'satvik';

export default function PortionEstimator({ 
  onNavigateToFoodOrder
}: PortionEstimatorProps) {
  // Headcount controls (10 to 100 guests, default 40 to showcase XL Full Tray)
  const [guests, setGuests] = useState<number>(40);
  
  // 3 Authentic Feast Styles aligned with Desi Dabba Menu
  const [feastStyle, setFeastStyle] = useState<FeastStyle>('classic');

  // Toggle for full itemized dish & pricing table detail
  const [showFullDetails, setShowFullDetails] = useState<boolean>(false);

  const handleHeadcountChange = (val: number) => {
    if (isNaN(val)) return;
    const clamped = Math.max(10, Math.min(100, val));
    setGuests(clamped);
  };

  // Bread pieces calculation (minimum 30 pcs per Desi Dabba bread rules, ~1.5 pcs/guest rounded to nearest 5)
  const breadPieces = Math.max(30, Math.round((guests * 1.5) / 5) * 5);

  /**
   * Core 4-Tray Sizing & Pricing Engine (1/3 Tray, Half Tray, 2.4" Standard Full, 3.4" XL Full)
   * Aligned with actual Desi Dabba pricing:
   * - Tier 1 (Khaas):   $35 (1/3) | $50 (Half) | $70 (2.4" Full)  | $95 (3.4" XL Full)
   * - Tier 2 (Shahi):   $45 (1/3) | $60 (Half) | $90 (2.4" Full)  | $120 (3.4" XL Full)
   * - Tier 3 (Darbari): $55 (1/3) | $70 (Half) | $110 (2.4" Full) | $150 (3.4" XL Full)
   */
  const calculatePlan = () => {
    const isGrand = feastStyle === 'grand';
    const isSatvik = feastStyle === 'satvik';

    // Determine primary tray tier based on guest count
    let tierTitle = '1/3 Tray Plan (8–12 ppl/tray)';
    let primaryTrayUnit = '1/3 Tray';
    let isXLTier = false;
    let khaasUnitCost = 35;
    let shahiUnitCost = 45;
    let darbariUnitCost = 55;
    let trayMultiplier = 1; // number of primary units per dish
    let comboNote = 'Ideal for intimate 10–14 guest family dinners';

    if (guests <= 14) {
      tierTitle = '1/3 Tray Tier (8–12 ppl)';
      primaryTrayUnit = '1/3 Tray';
      khaasUnitCost = 35;
      shahiUnitCost = 45;
      darbariUnitCost = 55;
      trayMultiplier = 1;
      comboNote = '1x 1/3 Tray per dish cleanly serves 8–12 guests';
    } else if (guests <= 22) {
      tierTitle = 'Half Tray Tier (15–20 ppl)';
      primaryTrayUnit = 'Half Tray';
      khaasUnitCost = 50;
      shahiUnitCost = 60;
      darbariUnitCost = 70;
      trayMultiplier = 1;
      comboNote = '1x Half Tray per dish cleanly serves 15–20 guests';
    } else if (guests <= 35) {
      tierTitle = 'Standard Full Tray (2.4" Deep · 25–35 ppl)';
      primaryTrayUnit = '2.4" Std Full Tray';
      khaasUnitCost = 70;
      shahiUnitCost = 90;
      darbariUnitCost = 110;
      trayMultiplier = 1;
      comboNote = '1x Standard Full Tray (2.4" deep) per dish serves 25–35 guests';
    } else if (guests <= 52) {
      tierTitle = 'XL Full Tray (3.4" Deep · 40–50 ppl)';
      primaryTrayUnit = '3.4" XL Full Tray';
      isXLTier = true;
      khaasUnitCost = 95;
      shahiUnitCost = 120;
      darbariUnitCost = 150;
      trayMultiplier = 1;
      comboNote = '1x Deep 3.4" XL Full Tray per dish serves 40–50 guests in a single pan';
    } else if (guests <= 72) {
      tierTitle = 'XL Full (3.4") + Half Tray Combo (55–70 ppl)';
      primaryTrayUnit = '1x XL Full (3.4") + 1x Half Tray';
      isXLTier = true;
      khaasUnitCost = 95 + 50;   // $145 per dish
      shahiUnitCost = 120 + 60;  // $180 per dish
      darbariUnitCost = 150 + 70; // $220 per dish
      trayMultiplier = 1;
      comboNote = 'Combines 1x Deep 3.4" XL Full Tray (40–50 ppl) + 1x Half Tray (15–20 ppl) per course';
    } else {
      tierTitle = 'Dual XL Full Tray Plan (2x 3.4" XL · 80–100 ppl)';
      primaryTrayUnit = '2x 3.4" XL Full Trays';
      isXLTier = true;
      khaasUnitCost = 95 * 2;   // $190 per dish
      shahiUnitCost = 120 * 2;  // $240 per dish
      darbariUnitCost = 150 * 2; // $300 per dish
      trayMultiplier = 2;
      comboNote = '2x Deep 3.4" XL Full Trays per main course serves 80–100 guests seamlessly';
    }

    // Course counts & cost build-up based on selected Feast Style:
    // 1. Starters: Classic = 1 starter (Shahi), Grand = 2 starters (1 Shahi + 1 Khaas), Satvik = 1 Satvik starter (Shahi)
    const starterDishCount = isGrand ? 2 : 1;
    const starterCost = isGrand ? (shahiUnitCost + khaasUnitCost) : shahiUnitCost;
    const starterTraysLabel = isGrand
      ? (guests <= 52 ? `2x ${primaryTrayUnit}s (2 Starters)` : `2 Starter Sets (${primaryTrayUnit} each)`)
      : `1x ${primaryTrayUnit} (1 Starter)`;
    const starterDishes = isSatvik
      ? 'Satvik Dahi Bhalla Chaat or Aloo Tikki (No Onion / No Garlic)'
      : isGrand
      ? 'Railway Veg Cutlets + Dahi Bhalla or Samosa Chaat'
      : 'Railway Veg Cutlets or Dahi Bhalla Chaat';

    // 2. Mains & Dal: Classic = 2 Mains (1 Darbari Paneer + 1 Shahi Dal/Chole), Grand = 3 Mains (1 Darbari Paneer + 1 Shahi Dal Makhani + 1 Khaas Dry Sabzi), Satvik = 2 Satvik Mains (1 Darbari Shahi Paneer + 1 Khaas Hing Jeera Aalu)
    const mainDishCount = isGrand ? 3 : 2;
    const mainCost = isGrand
      ? (darbariUnitCost + shahiUnitCost + khaasUnitCost)
      : isSatvik
      ? (darbariUnitCost + khaasUnitCost)
      : (darbariUnitCost + shahiUnitCost);
    const mainTraysLabel = `${mainDishCount}x ${primaryTrayUnit}${mainDishCount > 1 && !primaryTrayUnit.includes('+') && !primaryTrayUnit.startsWith('2x') ? 's' : ''} (${mainDishCount} Mains)`;
    const mainDishes = isSatvik
      ? 'Satvik Shahi Paneer (Darbari) + Hing Jeera Aalu or Kaddu Sabzi (Khaas)'
      : isGrand
      ? 'Paneer Lababdar (Darbari) + Black Dal Makhani (Shahi) + Bhindi Masala (Khaas)'
      : 'Paneer Lababdar (Darbari) + Black Dal Makhani or Pindi Chole (Shahi)';

    // 3. Rice & Breads: 1 Rice Tray (Khaas/Shahi) + Bread Pieces ($1.50/pc for Tawa Roti or Bedmi Poori)
    const riceCost = isSatvik ? 0 : khaasUnitCost; // Satvik Pooja focuses on Bedmi Poori, or optional Jeera Rice
    const breadUnitPrice = 1.50;
    const breadCost = Math.round(breadPieces * breadUnitPrice);
    const carbCost = riceCost + breadCost;
    const carbTraysLabel = isSatvik
      ? `${breadPieces}x Halwai Bedmi Pooris`
      : `1x ${primaryTrayUnit} Rice + ${breadPieces} Rotis/Pooris`;
    const carbDishes = isSatvik
      ? `Crispy Lentil-Stuffed Bedmi Pooris (${breadPieces} pcs @ $1.50/pc)`
      : `Peas & Cashew Pulao or Awadhi Veg Tehri + ${breadPieces} Tawa Rotis / Bedmi Pooris`;

    // 4. Desserts & Drinks: 1 Dessert Tray (Shahi Kheer/Halwa) + optional Drink Gallon ($45/gal for Grand)
    const drinkGallons = isGrand ? Math.max(1, Math.ceil(guests / 25)) : 0;
    const drinkCost = drinkGallons * 45;
    const dessertCost = shahiUnitCost + drinkCost;
    const dessertTraysLabel = isGrand
      ? `1x ${primaryTrayUnit} Sweet + ${drinkGallons} Gal Lassi`
      : `1x ${primaryTrayUnit} Dessert`;
    const dessertDishes = isGrand
      ? `Saffron Rabri Kheer or Moong Dal Halwa + ${drinkGallons} Gal Mango Lassi`
      : 'Saffron Pistachio Rabri Kheer, Gulab Jamun, or Fusion Cake Jars';

    const estimatedTotal = starterCost + mainCost + carbCost + dessertCost;
    const perGuestCost = (estimatedTotal / guests).toFixed(2);

    return {
      tierTitle,
      primaryTrayUnit,
      isXLTier,
      trayMultiplier,
      comboNote,
      starterDishCount,
      starterCost,
      starterTraysLabel,
      starterDishes,
      mainDishCount,
      mainCost,
      mainTraysLabel,
      mainDishes,
      carbCost,
      breadCost,
      riceCost,
      carbTraysLabel,
      carbDishes,
      dessertCost,
      drinkGallons,
      dessertTraysLabel,
      dessertDishes,
      estimatedTotal,
      perGuestCost
    };
  };

  const plan = calculatePlan();

  return (
    <section id="portion-estimator" className="py-16 bg-[#050a1a] text-white font-sans border-t border-white/5">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Title */}
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-gold-tint/15 border border-brand-gold-tint/30 text-brand-gold-tint text-[11px] font-bold uppercase tracking-widest">
            <Calculator className="w-3.5 h-3.5" />
            <span>Interactive Tray &amp; Budget Calculator</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-brand-cream">
            Plan Your Catering Trays &amp; Budget
          </h2>
          <p className="text-xs sm:text-sm text-gray-300 font-light leading-relaxed">
            Slide your guest count to see the exact tray tier—from <strong>1/3</strong> and <strong>Half Trays</strong> to <strong>2.4&quot; Standard Full</strong> and <strong>3.4&quot; XL Full Trays (40–50 ppl)</strong>—plus real menu pairings and estimated cost per guest.
          </p>
          <div className="h-0.5 w-14 bg-brand-gold-tint mx-auto mt-2" />
        </div>

        {/* Interactive Controls Panel */}
        <div className="glass-panel-dark rounded-2xl p-5 sm:p-7 border border-[#D4AF37]/30 shadow-2xl space-y-6 bg-[#0f1938]/80">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            
            {/* Left 7 Cols: Headcount Slider & Presets */}
            <div className="lg:col-span-7 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-brand-gold-tint" />
                  <label htmlFor="guest-headcount-input" className="text-xs font-bold uppercase tracking-wider text-gray-200">
                    1. Select Guest Headcount
                  </label>
                </div>
                
                <div className="flex items-center gap-2">
                  <input 
                    id="guest-headcount-input"
                    type="number"
                    min={10}
                    max={100}
                    step={1}
                    value={guests}
                    onChange={(e) => handleHeadcountChange(parseInt(e.target.value))}
                    className="w-20 min-h-[38px] px-2 py-1 bg-[#0a1128] border-2 border-brand-gold-tint/60 rounded-lg text-center font-serif text-base font-bold text-brand-cream focus:border-brand-gold-tint focus:outline-none"
                  />
                  <span className="text-xs font-bold uppercase text-brand-gold-tint">Guests</span>
                </div>
              </div>

              {/* Slider */}
              <div className="space-y-1">
                <input 
                  type="range"
                  min={10}
                  max={100}
                  step={1}
                  value={guests}
                  onChange={(e) => setGuests(parseInt(e.target.value))}
                  className="w-full h-2.5 bg-[#050a1a] rounded-lg appearance-none cursor-pointer accent-[#ffdea5]"
                  aria-label="Guest Headcount Slider"
                />
                <div className="flex justify-between text-[10px] text-gray-400 font-mono">
                  <span>10 (1/3 Tray)</span>
                  <span>20 (Half)</span>
                  <span>30 (2.4&quot; Full)</span>
                  <span className="text-[#ffdea5] font-bold">45 (3.4&quot; XL Full)</span>
                  <span>90 (2x XL)</span>
                </div>
              </div>

              {/* Quick Presets showing Tray Tiers */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="text-[10px] uppercase font-bold text-gray-400">Tray Presets:</span>
                {[
                  { num: 12, label: '12 ppl (1/3)' },
                  { num: 20, label: '20 ppl (Half)' },
                  { num: 30, label: '30 ppl (2.4" Full)' },
                  { num: 45, label: '45 ppl (3.4" XL Full)' },
                  { num: 65, label: '65 ppl (XL + Half)' },
                  { num: 90, label: '90 ppl (2x XL)' }
                ].map((preset) => (
                  <button
                    key={preset.num}
                    type="button"
                    onClick={() => setGuests(preset.num)}
                    className={`min-h-[34px] px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
                      guests === preset.num 
                        ? 'bg-brand-gold-tint text-[#050a1a] shadow-sm'
                        : 'bg-[#050a1a]/70 hover:bg-white/15 text-gray-200 border border-white/15'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Right 5 Cols: 3 Authentic Feast Styles */}
            <div className="lg:col-span-5 bg-[#0a1128]/90 rounded-xl p-4 border border-[#D4AF37]/25 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase font-bold tracking-wider text-gray-200">
                  2. Choose Feast Style
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] text-emerald-300 font-bold bg-emerald-500/20 px-2 py-0.5 rounded-full border border-emerald-400/30">
                  <Leaf className="w-3 h-3 text-emerald-300" />
                  100% Pure Veg
                </span>
              </div>

              <div className="grid grid-cols-3 gap-1.5">
                <button
                  type="button"
                  onClick={() => setFeastStyle('classic')}
                  className={`min-h-[40px] py-2 px-2 rounded-lg text-[11px] font-bold uppercase tracking-wider transition cursor-pointer text-center ${
                    feastStyle === 'classic'
                      ? 'bg-[#775a19] text-white border border-[#ffdea5]/60 shadow-md'
                      : 'bg-black/30 hover:bg-black/50 text-gray-300 border border-white/10'
                  }`}
                >
                  Classic Party
                </button>

                <button
                  type="button"
                  onClick={() => setFeastStyle('grand')}
                  className={`min-h-[40px] py-2 px-2 rounded-lg text-[11px] font-bold uppercase tracking-wider transition cursor-pointer text-center ${
                    feastStyle === 'grand'
                      ? 'bg-[#775a19] text-white border border-[#ffdea5]/60 shadow-md'
                      : 'bg-black/30 hover:bg-black/50 text-gray-300 border border-white/10'
                  }`}
                >
                  Grand Feast
                </button>

                <button
                  type="button"
                  onClick={() => setFeastStyle('satvik')}
                  className={`min-h-[40px] py-2 px-2 rounded-lg text-[11px] font-bold uppercase tracking-wider transition cursor-pointer text-center ${
                    feastStyle === 'satvik'
                      ? 'bg-[#775a19] text-white border border-[#ffdea5]/60 shadow-md'
                      : 'bg-black/30 hover:bg-black/50 text-gray-300 border border-white/10'
                  }`}
                >
                  Satvik Pooja
                </button>
              </div>

              <p className="text-[11px] text-gray-300 leading-relaxed">
                {feastStyle === 'grand' 
                  ? "2 Starters + 3 Mains (Paneer, Dal Makhani & Dry Sabzi) + Pulao + Breads + Dessert & Mango Lassi." 
                  : feastStyle === 'satvik'
                  ? "Strict No-Onion / No-Garlic Pooja Menu: 1 Satvik Starter + Shahi Paneer + Hing Jeera Aalu + Bedmi Pooris + Kheer."
                  : "Our most popular house-party menu: 1 Starter + 2 Mains (Paneer & Dal/Chole) + Pulao + Breads + Dessert."}
              </p>
            </div>

          </div>

          {/* Live Tray Tier & Estimated Budget Summary Banner */}
          <div className="rounded-xl bg-gradient-to-r from-[#050a1a] via-[#16244d] to-[#050a1a] p-4 sm:p-5 border border-[#D4AF37]/45 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="bg-brand-gold-tint text-[#050a1a] text-xs font-black uppercase px-3 py-0.5 rounded-full tracking-wider">
                  {plan.tierTitle}
                </span>
                {plan.isXLTier && (
                  <span className="bg-[#775a19]/50 text-[#ffdea5] border border-[#D4AF37]/50 text-[11px] font-bold uppercase px-2.5 py-0.5 rounded-full">
                    ✨ Uses 3.4&quot; Deep XL Full Trays
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-300">
                {plan.comboNote}
              </p>
            </div>

            <div className="flex items-center gap-5 bg-[#050a1a]/80 px-4 py-2.5 rounded-xl border border-[#D4AF37]/35 shrink-0">
              <div>
                <span className="text-[10px] uppercase tracking-wider text-gray-400 block font-bold">Estimated Total</span>
                <span className="font-serif text-xl sm:text-2xl font-bold text-[#ffdea5]">
                  ~${plan.estimatedTotal}
                </span>
              </div>
              <div className="h-8 w-[1px] bg-white/15" />
              <div>
                <span className="text-[10px] uppercase tracking-wider text-gray-400 block font-bold">Per Guest</span>
                <span className="font-serif text-base sm:text-lg font-bold text-emerald-300">
                  ~${plan.perGuestCost} <span className="text-[11px] font-sans font-normal text-gray-300">/ ppl</span>
                </span>
              </div>
            </div>
          </div>

        </div>

        {/* 4 Course Breakdown Cards with Real Desi Dabba Dishes & Tray Prices */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Card 1: Starters */}
          <div className="glass-panel-dark rounded-xl p-5 border border-[#D4AF37]/25 flex flex-col justify-between space-y-4 bg-[#0f1938]/70">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-brand-gold-tint font-bold text-xs uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>1. Starters &amp; Chaat</span>
                </div>
                <span className="text-xs font-bold text-[#ffdea5]">~${plan.starterCost}</span>
              </div>
              <div className="text-sm sm:text-base font-serif font-bold text-white leading-snug">
                {plan.starterTraysLabel}
              </div>
              <p className="text-xs text-gray-300 leading-relaxed">
                {plan.starterDishes}
              </p>
            </div>
            <div className="text-[11px] text-brand-gold-tint font-semibold pt-2 border-t border-white/10">
              {plan.starterDishCount === 2 ? '2 Appetizer Varieties Included' : '1 Signature Appetizer / Chaat'}
            </div>
          </div>

          {/* Card 2: Main Curries */}
          <div className="glass-panel-dark rounded-xl p-5 border border-[#D4AF37]/25 flex flex-col justify-between space-y-4 bg-[#0f1938]/70">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-amber-300 font-bold text-xs uppercase tracking-wider">
                  <Flame className="w-3.5 h-3.5" />
                  <span>2. Mains &amp; Dal</span>
                </div>
                <span className="text-xs font-bold text-[#ffdea5]">~${plan.mainCost}</span>
              </div>
              <div className="text-sm sm:text-base font-serif font-bold text-white leading-snug">
                {plan.mainTraysLabel}
              </div>
              <p className="text-xs text-gray-300 leading-relaxed">
                {plan.mainDishes}
              </p>
            </div>
            <div className="text-[11px] text-amber-300 font-semibold pt-2 border-t border-white/10">
              {plan.isXLTier ? 'Served in 3.4" Deep XL Full Pans' : `Served in ${plan.primaryTrayUnit}s`}
            </div>
          </div>

          {/* Card 3: Rice & Breads */}
          <div className="glass-panel-dark rounded-xl p-5 border border-[#D4AF37]/25 flex flex-col justify-between space-y-4 bg-[#0f1938]/70">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-emerald-300 font-bold text-xs uppercase tracking-wider">
                  <Utensils className="w-3.5 h-3.5" />
                  <span>3. Rice &amp; Breads</span>
                </div>
                <span className="text-xs font-bold text-[#ffdea5]">~${plan.carbCost}</span>
              </div>
              <div className="text-sm sm:text-base font-serif font-bold text-white leading-snug">
                {plan.carbTraysLabel}
              </div>
              <p className="text-xs text-gray-300 leading-relaxed">
                {plan.carbDishes}
              </p>
            </div>
            <div className="text-[11px] text-emerald-300 font-semibold pt-2 border-t border-white/10">
              {breadPieces} Fresh Breads (~1.5 pcs/guest)
            </div>
          </div>

          {/* Card 4: Sweets & Drinks */}
          <div className="glass-panel-dark rounded-xl p-5 border border-[#D4AF37]/25 flex flex-col justify-between space-y-4 bg-[#0f1938]/70">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-rose-300 font-bold text-xs uppercase tracking-wider">
                  <Coffee className="w-3.5 h-3.5" />
                  <span>4. Dessert {plan.drinkGallons > 0 ? '& Lassi' : ''}</span>
                </div>
                <span className="text-xs font-bold text-[#ffdea5]">~${plan.dessertCost}</span>
              </div>
              <div className="text-sm sm:text-base font-serif font-bold text-white leading-snug">
                {plan.dessertTraysLabel}
              </div>
              <p className="text-xs text-gray-300 leading-relaxed">
                {plan.dessertDishes}
              </p>
            </div>
            <div className="text-[11px] text-rose-300 font-semibold pt-2 border-t border-white/10">
              {plan.drinkGallons > 0 ? `Includes ${plan.drinkGallons} Gal Chilled Mango Lassi` : 'Add Mango Lassi ($45/Gal) at Checkout'}
            </div>
          </div>

        </div>

        {/* Expandable Tray Depth & Pricing Reference Table Toggle */}
        <div className="text-center pt-1">
          <button
            type="button"
            onClick={() => setShowFullDetails(!showFullDetails)}
            className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/15 text-brand-gold-tint font-bold text-xs uppercase tracking-wider px-5 py-2.5 rounded-xl border border-brand-gold-tint/30 transition-all cursor-pointer"
          >
            <Layers className="w-4 h-4" />
            <span>{showFullDetails ? "Hide 4-Tier Tray Pricing Reference" : "Compare All 4 Tray Sizes (1/3, Half, 2.4\" Full & 3.4\" XL Full)"}</span>
            {showFullDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>

        {showFullDetails && (
          <div className="glass-panel-dark rounded-2xl p-6 border border-[#D4AF37]/30 space-y-4 animate-fade-in text-xs bg-[#0f1938]/90">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-white/10">
              <span className="font-serif font-bold text-base text-brand-cream">
                Desi Dabba 4-Tray Sizing &amp; Tier Pricing Guide
              </span>
              <span className="text-[11px] text-emerald-300 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> 100% Pure Vegetarian • 24h Notice
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
              <div className="p-3.5 rounded-xl bg-[#0a1128] border border-white/10 space-y-1">
                <span className="text-[10px] font-bold uppercase text-gray-400">8–12 GUESTS</span>
                <h4 className="font-serif text-sm font-bold text-white">1/3 Tray</h4>
                <p className="text-[11px] text-gray-300">Khaas: <strong>$35</strong> · Shahi: <strong>$45</strong></p>
                <p className="text-[11px] text-gray-300">Darbari: <strong>$55</strong> · Maharaja: <strong>$65</strong></p>
              </div>
              <div className="p-3.5 rounded-xl bg-[#0a1128] border border-white/10 space-y-1">
                <span className="text-[10px] font-bold uppercase text-gray-400">15–20 GUESTS</span>
                <h4 className="font-serif text-sm font-bold text-white">Half Tray</h4>
                <p className="text-[11px] text-gray-300">Khaas: <strong>$50</strong> · Shahi: <strong>$60</strong></p>
                <p className="text-[11px] text-gray-300">Darbari: <strong>$70</strong> · Maharaja: <strong>$80</strong></p>
              </div>
              <div className="p-3.5 rounded-xl bg-[#0a1128] border border-white/15 space-y-1">
                <span className="text-[10px] font-bold uppercase text-[#ffdea5]">25–35 GUESTS</span>
                <h4 className="font-serif text-sm font-bold text-white">Standard Full (2.4&quot; Deep)</h4>
                <p className="text-[11px] text-gray-300">Khaas: <strong>$70</strong> · Shahi: <strong>$90</strong></p>
                <p className="text-[11px] text-gray-300">Darbari: <strong>$110</strong> · Maharaja: <strong>$130</strong></p>
              </div>
              <div className="p-3.5 rounded-xl bg-[#16244d] border border-[#D4AF37]/60 space-y-1">
                <span className="text-[10px] font-bold uppercase text-[#ffdea5]">40–50 GUESTS</span>
                <h4 className="font-serif text-sm font-bold text-[#ffdea5]">XL Full (3.4&quot; Deep)</h4>
                <p className="text-[11px] text-gray-200">Khaas: <strong>$95</strong> · Shahi: <strong>$120</strong></p>
                <p className="text-[11px] text-gray-200">Darbari: <strong>$150</strong> · Maharaja: <strong>$175</strong></p>
              </div>
            </div>
          </div>
        )}

        {/* Action & Inquiry Bar */}
        <div className="rounded-2xl bg-gradient-to-br from-[#0f1938] via-[#16244d] to-[#0a1128] p-6 sm:p-8 border border-[#D4AF37]/40 text-center space-y-5 shadow-2xl">
          <div className="max-w-xl mx-auto space-y-1.5">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#ffdea5]">
              BUILD THIS EXACT MENU ONLINE
            </span>
            <h3 className="font-serif text-2xl font-bold text-white">
              Order Your {plan.primaryTrayUnit}s for {guests} Guests (~${plan.estimatedTotal})
            </h3>
            <p className="text-xs text-gray-300">
              Select your event date first and pick these exact trays in our self-serve Catering Order Portal, or message our kitchen directly.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row flex-wrap items-center justify-center gap-3">
            {onNavigateToFoodOrder && (
              <button
                type="button"
                onClick={onNavigateToFoodOrder}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#775a19] hover:bg-[#5d4201] text-white border border-[#D4AF37]/60 min-h-[44px] px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-md cursor-pointer hover:scale-102"
              >
                <Utensils className="w-4 h-4 text-[#ffdea5]" />
                <span>Select Trays in Catering Portal</span>
                <ArrowRight className="w-4 h-4 text-[#ffdea5]" />
              </button>
            )}

            <a
              href="tel:+19455274566"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white min-h-[44px] px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all border border-white/20 cursor-pointer"
            >
              <Phone className="w-4 h-4 text-emerald-400" />
              <span>Call</span>
            </a>

            <a
              href={`sms:+19455274566?body=${encodeURIComponent(`Hi Bluebonnet Whisk! I'm planning catering for ${guests} guests (${plan.tierTitle}, ~${plan.estimatedTotal}).`)}`}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white min-h-[44px] px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all border border-white/20 cursor-pointer"
            >
              <MessageSquare className="w-4 h-4 text-sky-400" />
              <span>SMS</span>
            </a>

            <a
              href={`https://wa.me/19455274566?text=${encodeURIComponent(`Hi Bluebonnet Whisk! I'm planning catering for ${guests} guests using your ${plan.tierTitle} (${feastStyle.toUpperCase()} feast, est. ~$${plan.estimatedTotal}).`)}`}
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
  );
}
