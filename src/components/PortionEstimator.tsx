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
  ChevronUp
} from 'lucide-react';

interface PortionEstimatorProps {
  onNavigateToFoodOrder?: () => void;
}

export default function PortionEstimator({ 
  onNavigateToFoodOrder
}: PortionEstimatorProps) {
  // Headcount controls (10 to 100 guests, default 20)
  const [guests, setGuests] = useState<number>(20);
  
  // Party Format toggle: Standard Buffet vs Cocktail / Heavy Starter
  const [partyFormat, setPartyFormat] = useState<'standard' | 'cocktail'>('standard');

  // Toggle for full itemized table detail
  const [showFullDetails, setShowFullDetails] = useState<boolean>(false);

  // Clamp and synchronize headcount input
  const handleHeadcountChange = (val: number) => {
    if (isNaN(val)) return;
    const clamped = Math.max(10, Math.min(100, val));
    setGuests(clamped);
  };

  // Determine Headcount Tier
  let tierTitle = "Intimate Gathering";
  let tierBadge = "10–14 Guests";
  if (guests >= 76) {
    tierTitle = "Banquet / Hall Event";
    tierBadge = "76–100 Guests";
  } else if (guests >= 36) {
    tierTitle = "Large Party Gathering";
    tierBadge = "36–75 Guests";
  } else if (guests >= 15) {
    tierTitle = "Small-to-Medium Party";
    tierBadge = "15–35 Guests";
  }

  // Quantities
  const breadPieces = Math.max(15, Math.round((guests * 1.5) / 5) * 5);
  const sweetPieces = guests;
  const drinkServings = Math.round(guests * (partyFormat === 'cocktail' ? 1.25 : 1.15));
  const isCocktail = partyFormat === 'cocktail';

  // Simplified summary calculations
  const getStarterSummary = () => {
    if (guests <= 14) {
      return {
        trays: isCocktail ? "2x Half Trays" : "2x 1/3 Trays",
        pieces: isCocktail ? "~40–45 pieces (4 bites/guest)" : "~20–25 pieces (2–3 bites/guest)",
        dishes: "Cocktail Samosas, Paneer Tikka Skewers"
      };
    } else if (guests <= 35) {
      return {
        trays: isCocktail ? "3x Half Trays" : "2x 1/2 Trays + 1x 1/3 Tray",
        pieces: "~60–80 pieces total",
        dishes: "Cocktail Samosas, Paneer Tikka, Veg Manchurian"
      };
    } else if (guests <= 75) {
      return {
        trays: "4x Half Trays (or 2x Full Trays)",
        pieces: isCocktail ? "~160–180 pieces" : "~100–120 pieces",
        dishes: "Samosa Chaat, Paneer Tikka, Gobi Manchurian, Hara Bhara Kebab"
      };
    } else {
      return {
        trays: "3x Full Trays + 1x Half Tray",
        pieces: "~180–220 pieces total",
        dishes: "Cocktail Samosas, Paneer Tikka, Crispy Corn, Dahi Kebab"
      };
    }
  };

  const getMainCurrySummary = () => {
    if (guests <= 14) {
      return {
        trays: "3x 1/3 Trays (Small Pans)",
        volume: "~8–10 oz combined curry / guest",
        dishes: "Paneer Butter Masala, Aloo Gobi, Slow Dal Makhani"
      };
    } else if (guests <= 35) {
      return {
        trays: "3x Half Trays (Medium Pans)",
        volume: "~8–10 oz combined curry / guest",
        dishes: "Shahi Paneer, Dry Sabzi (Mix Veg/Gobi), Dal Makhani"
      };
    } else if (guests <= 75) {
      return {
        trays: "1x Full Tray + 3x Half Trays",
        volume: "~10 oz combined curry / guest",
        dishes: "Paneer Lababdar, Malai Kofta, Mix Veg Handi, Black Dal Makhani"
      };
    } else {
      return {
        trays: "4x Full Trays (Large Pans)",
        volume: "~10–12 oz combined curry / guest",
        dishes: "Paneer Butter Masala, Malai Kofta, Aloo Gobi Matar, Dal Tadka"
      };
    }
  };

  const getCarbSummary = () => {
    if (guests <= 14) {
      return {
        trays: "1x 1/3 Tray Rice + Bread Basket",
        servings: `${breadPieces} Naans + ~12 Rice portions`,
        dishes: "Veg Biryani / Cumin Jeera Rice, Butter Naan"
      };
    } else if (guests <= 35) {
      return {
        trays: "1x Half Tray Biryani + Bread Basket",
        servings: `${breadPieces} Naans + ~25 Rice portions`,
        dishes: "Hyderabadi Veg Dum Biryani, Garlic & Butter Naans"
      };
    } else if (guests <= 75) {
      return {
        trays: "1x Full Tray Biryani + 1x Half Tray Rice",
        servings: `${breadPieces} Naans + ~60 Rice portions`,
        dishes: "Layered Veg Biryani, Jeera Basmati Rice, Naan/Roti Basket"
      };
    } else {
      return {
        trays: "2x Full Trays Biryani + 1x Full Tray Rice",
        servings: `${breadPieces} Naans + ~90 Rice portions`,
        dishes: "Hyderabadi Dum Biryani, Jeera Rice, Naan & Kulcha Basket"
      };
    }
  };

  const getDessertSummary = () => {
    return {
      trays: `${sweetPieces} Sweets + ${drinkServings} Drink Cups`,
      servings: "1 Sweet/guest + ~1.2 Drinks/guest",
      dishes: guests >= 15 
        ? `Gulab Jamun (${Math.ceil(guests/2)} pcs) + Rasmalai (${Math.floor(guests/2)} cups), Mango Lassi` 
        : `Gulab Jamun or Rasmalai (${guests} pcs), Chilled Mango Lassi`
    };
  };

  const starterSummary = getStarterSummary();
  const mainSummary = getMainCurrySummary();
  const carbSummary = getCarbSummary();
  const dessertSummary = getDessertSummary();

  return (
    <section id="portion-estimator" className="py-16 bg-[#050a1a] text-white font-sans border-t border-white/5">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* Title */}
        <div className="text-center max-w-xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-gold-tint/15 border border-brand-gold-tint/30 text-brand-gold-tint text-[11px] font-bold uppercase tracking-widest">
            <Utensils className="w-3.5 h-3.5" />
            <span>Pure Vegetarian Catering Guide</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-brand-cream">
            Catering Portion Estimator
          </h2>
          <p className="text-xs sm:text-sm text-gray-300 font-light leading-relaxed">
            Select your guest count and party style to calculate exact tray sizes, appetizer bites, naans, and sweets needed.
          </p>
          <div className="h-0.5 w-14 bg-brand-gold-tint mx-auto mt-2" />
        </div>

        {/* Interactive Controls Panel */}
        <div className="glass-panel-dark rounded-2xl p-6 sm:p-8 border border-white/10 shadow-2xl space-y-6">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            
            {/* Headcount Controls */}
            <div className="lg:col-span-7 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-brand-gold-tint" />
                  <label htmlFor="guest-headcount-input" className="text-xs font-bold uppercase tracking-wider text-gray-300">
                    Guest Headcount
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
                    className="w-20 min-h-[40px] px-2 py-1 bg-[#0b1b40] border-2 border-brand-gold-tint/60 rounded-lg text-center font-serif text-base font-bold text-brand-cream focus:border-brand-gold-tint focus:outline-none"
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
                  className="w-full h-2.5 bg-[#0b1226] rounded-lg appearance-none cursor-pointer accent-[#ffdea5]"
                  aria-label="Guest Headcount Slider"
                />
                <div className="flex justify-between text-[10px] text-gray-400 font-mono">
                  <span>10 Min</span>
                  <span>25</span>
                  <span>50</span>
                  <span>75</span>
                  <span>100 Max</span>
                </div>
              </div>

              {/* Presets */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="text-[10px] uppercase font-bold text-gray-400">Quick Presets:</span>
                {[15, 25, 35, 50, 75, 100].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setGuests(num)}
                    className={`min-h-[36px] px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      guests === num 
                        ? 'bg-brand-gold-tint text-[#00346f] shadow-sm'
                        : 'bg-white/10 hover:bg-white/15 text-gray-200 border border-white/10'
                    }`}
                  >
                    {num} Guests
                  </button>
                ))}
              </div>
            </div>

            {/* Service Format Toggle */}
            <div className="lg:col-span-5 bg-white/5 rounded-xl p-4 border border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase font-bold tracking-wider text-gray-300">
                  Format Style
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] text-emerald-300 font-bold bg-emerald-500/20 px-2 py-0.5 rounded-full border border-emerald-400/30">
                  <Leaf className="w-3 h-3 text-emerald-300" />
                  100% Pure Veg
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPartyFormat('standard')}
                  className={`min-h-[40px] py-2 px-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition cursor-pointer text-center ${
                    partyFormat === 'standard'
                      ? 'bg-[#00346f] text-white border border-[#ffdea5]/40 shadow-md'
                      : 'bg-black/30 hover:bg-black/50 text-gray-300 border border-white/10'
                  }`}
                >
                  Dinner Buffet
                </button>

                <button
                  type="button"
                  onClick={() => setPartyFormat('cocktail')}
                  className={`min-h-[40px] py-2 px-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition cursor-pointer text-center ${
                    partyFormat === 'cocktail'
                      ? 'bg-[#775a19] text-white border border-[#ffdea5]/40 shadow-md'
                      : 'bg-black/30 hover:bg-black/50 text-gray-300 border border-white/10'
                  }`}
                >
                  Cocktail / Starters
                </button>
              </div>
              <p className="text-[11px] text-gray-300 leading-relaxed font-light">
                {partyFormat === 'cocktail' 
                  ? "Appetizers boosted to 5–6 bites/guest; main curries slightly trimmed." 
                  : "Balanced dinner menu: 3–4 starter bites, hearty curries & fresh breads."}
              </p>
            </div>

          </div>

          {/* Tier Overview Pill */}
          <div className="rounded-xl bg-gradient-to-r from-[#00224d] via-[#0b1b40] to-[#1a120b] p-4 border border-brand-gold-tint/30 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="bg-brand-gold-tint text-[#00346f] text-xs font-black uppercase px-2.5 py-0.5 rounded-full tracking-wider">
                {tierTitle}
              </span>
              <span className="text-xs text-brand-gold-tint font-bold">
                {guests} Guests ({tierBadge})
              </span>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <span className="text-gray-300">
                Bread Target: <strong className="text-white">{breadPieces} Naans</strong>
              </span>
              <span className="text-gray-300">
                Sweets Budget: <strong className="text-brand-gold-tint">{sweetPieces} Pcs</strong>
              </span>
            </div>
          </div>

        </div>

        {/* Streamlined Portion Breakdown Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Card 1: Starters */}
          <div className="glass-panel-dark rounded-xl p-5 border border-white/10 flex flex-col justify-between space-y-4 hover:border-brand-gold-tint/40 transition-all">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-brand-gold-tint font-bold text-xs uppercase tracking-wider">
                  <Sparkles className="w-4 h-4" />
                  <span>1. Starters</span>
                </div>
                <span className="text-[10px] text-gray-400 font-medium">{starterSummary.pieces}</span>
              </div>
              <div className="text-base font-serif font-bold text-white leading-snug">
                {starterSummary.trays}
              </div>
              <p className="text-xs text-gray-300 leading-relaxed font-light">
                {starterSummary.dishes}
              </p>
            </div>
            <div className="text-[10px] text-brand-gold-tint font-semibold pt-2 border-t border-white/5">
              {isCocktail ? '5–6 bites per guest' : '3–4 bites per guest'}
            </div>
          </div>

          {/* Card 2: Main Curries */}
          <div className="glass-panel-dark rounded-xl p-5 border border-white/10 flex flex-col justify-between space-y-4 hover:border-amber-400/40 transition-all">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
                  <Flame className="w-4 h-4" />
                  <span>2. Main Curries</span>
                </div>
                <span className="text-[10px] text-gray-400 font-medium">{mainSummary.volume}</span>
              </div>
              <div className="text-base font-serif font-bold text-white leading-snug">
                {mainSummary.trays}
              </div>
              <p className="text-xs text-gray-300 leading-relaxed font-light">
                {mainSummary.dishes}
              </p>
            </div>
            <div className="text-[10px] text-amber-300 font-semibold pt-2 border-t border-white/5">
              Paneer + Dry Sabzi + Dal Makhani
            </div>
          </div>

          {/* Card 3: Carbs & Breads */}
          <div className="glass-panel-dark rounded-xl p-5 border border-white/10 flex flex-col justify-between space-y-4 hover:border-emerald-400/40 transition-all">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider">
                  <Utensils className="w-4 h-4" />
                  <span>3. Rice &amp; Breads</span>
                </div>
                <span className="text-[10px] text-gray-400 font-medium">1.5 naans/guest</span>
              </div>
              <div className="text-base font-serif font-bold text-white leading-snug">
                {carbSummary.trays}
              </div>
              <p className="text-xs text-gray-300 leading-relaxed font-light">
                {carbSummary.dishes}
              </p>
            </div>
            <div className="text-[10px] text-emerald-300 font-semibold pt-2 border-t border-white/5">
              {carbSummary.servings}
            </div>
          </div>

          {/* Card 4: Sweets & Drinks */}
          <div className="glass-panel-dark rounded-xl p-5 border border-white/10 flex flex-col justify-between space-y-4 hover:border-rose-400/40 transition-all">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-rose-400 font-bold text-xs uppercase tracking-wider">
                  <Coffee className="w-4 h-4" />
                  <span>4. Sweets &amp; Drinks</span>
                </div>
                <span className="text-[10px] text-gray-400 font-medium">1 pc/guest</span>
              </div>
              <div className="text-base font-serif font-bold text-white leading-snug">
                {dessertSummary.trays}
              </div>
              <p className="text-xs text-gray-300 leading-relaxed font-light">
                {dessertSummary.dishes}
              </p>
            </div>
            <div className="text-[10px] text-rose-300 font-semibold pt-2 border-t border-white/5">
              {dessertSummary.servings}
            </div>
          </div>

        </div>

        {/* Expandable Full Itemized Table Toggle */}
        <div className="text-center pt-2">
          <button
            type="button"
            onClick={() => setShowFullDetails(!showFullDetails)}
            className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/15 text-brand-gold-tint font-bold text-xs uppercase tracking-wider px-5 py-2.5 rounded-xl border border-brand-gold-tint/30 transition-all cursor-pointer"
          >
            <Layers className="w-4 h-4" />
            <span>{showFullDetails ? "Hide Itemized Specifications" : "View Detailed Dish-by-Dish Breakdown"}</span>
            {showFullDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>

        {/* Detailed Itemized View (Rendered conditionally) */}
        {showFullDetails && (
          <div className="glass-panel-dark rounded-2xl p-6 border border-white/10 space-y-4 animate-fade-in text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <span className="font-serif font-bold text-base text-brand-cream">Detailed Container &amp; Serving Guide for {guests} Guests</span>
              <span className="text-[11px] text-emerald-300 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> 100% Pure Vegetarian
              </span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-white/5 rounded-xl space-y-2 border border-white/5">
                <span className="font-bold text-brand-gold-tint uppercase tracking-wider block text-[11px]">Starters Blueprint</span>
                <p className="text-gray-200"><strong>Container:</strong> {starterSummary.trays}</p>
                <p className="text-gray-300"><strong>Target Bites:</strong> {starterSummary.pieces}</p>
                <p className="text-gray-400 text-[11px]">Recommended items: {starterSummary.dishes}</p>
              </div>

              <div className="p-4 bg-white/5 rounded-xl space-y-2 border border-white/5">
                <span className="font-bold text-amber-400 uppercase tracking-wider block text-[11px]">Mains &amp; Daal Blueprint</span>
                <p className="text-gray-200"><strong>Container:</strong> {mainSummary.trays}</p>
                <p className="text-gray-300"><strong>Volume Target:</strong> {mainSummary.volume}</p>
                <p className="text-gray-400 text-[11px]">Recommended items: {mainSummary.dishes}</p>
              </div>

              <div className="p-4 bg-white/5 rounded-xl space-y-2 border border-white/5">
                <span className="font-bold text-emerald-400 uppercase tracking-wider block text-[11px]">Carbs &amp; Breads Blueprint</span>
                <p className="text-gray-200"><strong>Container &amp; Count:</strong> {carbSummary.trays}</p>
                <p className="text-gray-300"><strong>Target Servings:</strong> {carbSummary.servings}</p>
                <p className="text-gray-400 text-[11px]">Recommended items: {carbSummary.dishes}</p>
              </div>

              <div className="p-4 bg-white/5 rounded-xl space-y-2 border border-white/5">
                <span className="font-bold text-rose-400 uppercase tracking-wider block text-[11px]">Desserts &amp; Drinks Blueprint</span>
                <p className="text-gray-200"><strong>Container &amp; Count:</strong> {dessertSummary.trays}</p>
                <p className="text-gray-300"><strong>Target Ratio:</strong> {dessertSummary.servings}</p>
                <p className="text-gray-400 text-[11px]">Recommended items: {dessertSummary.dishes}</p>
              </div>
            </div>
          </div>
        )}

        {/* Action & Inquiry Bar */}
        <div className="rounded-2xl bg-gradient-to-br from-[#00346f] via-[#00224d] to-[#121620] p-6 sm:p-8 border border-brand-gold-tint/40 text-center space-y-5 shadow-2xl">
          <div className="max-w-lg mx-auto space-y-1.5">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#ffdea5]">
              READY TO ORDER?
            </span>
            <h3 className="font-serif text-2xl font-bold text-white">
              Turn Your Estimate into a Pure Vegetarian Feast
            </h3>
            <p className="text-xs text-gray-300 font-light">
              Select these exact trays on our Catering Order Portal or reach out directly to head chef Aditi.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row flex-wrap items-center justify-center gap-3">
            {onNavigateToFoodOrder && (
              <button
                type="button"
                onClick={onNavigateToFoodOrder}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#ffdea5] hover:bg-[#ffe7be] text-[#00346f] min-h-[42px] px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-md cursor-pointer hover:scale-102"
              >
                <Utensils className="w-4 h-4 text-[#00346f]" />
                <span>Open Catering Order Portal</span>
                <ArrowRight className="w-4 h-4 text-[#00346f]" />
              </button>
            )}

            <a
              href="tel:+19455274566"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white min-h-[42px] px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all border border-white/20 cursor-pointer"
            >
              <Phone className="w-4 h-4 text-emerald-400" />
              <span>Call (945) 527-4566</span>
            </a>

            <a
              href={`sms:+19455274566?body=Hi%20Bluebonnet%20Whisk!%20I'm%20inquiring%20about%20pure%20vegetarian%20catering%20for%20${guests}%20guests.`}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white min-h-[42px] px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all border border-white/20 cursor-pointer"
            >
              <MessageSquare className="w-4 h-4 text-sky-400" />
              <span>SMS</span>
            </a>

            <a
              href={`https://wa.me/19455274566?text=Hi%20Bluebonnet%20Whisk!%20I'm%20inquiring%20about%20pure%20vegetarian%20catering%20for%20${guests}%20guests%20(${partyFormat === 'cocktail' ? 'Cocktail%20Focus' : 'Standard%20Dinner%20Buffet'}).`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#1ebd5a] text-white min-h-[42px] px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-md cursor-pointer"
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
