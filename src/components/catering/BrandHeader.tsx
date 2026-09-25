import { useState } from 'react';
import { 
  ShieldCheck, 
  Droplet, 
  Leaf, 
  Heart, 
  AlertTriangle, 
  Phone, 
  Mail, 
  Globe, 
  Clock, 
  Info,
  X
} from 'lucide-react';
import { ALLERGEN_LABELS } from '../../data/desiDabbaMenu';

interface BrandHeaderProps {
  onScrollToMenu?: () => void;
}

export default function BrandHeader({ onScrollToMenu }: BrandHeaderProps) {
  const [showAllergenModal, setShowAllergenModal] = useState(false);

  return (
    <div className="w-full bg-[#fbfbfa] border-b border-[#775a19]/20 font-sans">
      
      {/* ── TOP HERO BANNER ── */}
      <div className="relative overflow-hidden bg-gradient-to-b from-[#00224d] via-[#00346f] to-[#00224d] text-white py-12 px-4 sm:px-6 lg:px-8 text-center shadow-inner">
        {/* Subtle decorative background pattern */}
        <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none" />
        
        <div className="relative z-10 max-w-4xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 bg-[#ffdea5]/15 border border-[#ffdea5]/30 text-[#ffdea5] px-4 py-1 rounded-full text-[11px] font-bold tracking-widest uppercase shadow-xs">
            <span>✨ Authentic Desi Home Kitchen</span>
            <span>•</span>
            <span>Vegetarian Catering</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-tight drop-shadow-sm">
            DESI DABBA
          </h1>
          <p className="font-serif text-lg sm:text-2xl text-[#ffdea5] italic font-medium">
            by BlueBonnet Whisk — Vegetarian Catering
          </p>
          <p className="text-sm sm:text-base text-gray-200 max-w-2xl mx-auto font-medium">
            Same Homestyle Love. Bigger Celebrations.
          </p>

          <p className="text-xs sm:text-sm text-gray-300 max-w-xl mx-auto leading-relaxed pt-1">
            Freshly prepared vegetarian food for parties, poojas, family gatherings & special occasions.
          </p>

          {/* Dietary Standards Pill */}
          <div className="pt-2">
            <div className="inline-block bg-white/10 backdrop-blur-xs border border-white/20 px-4 py-2 rounded-lg text-xs text-[#ffdea5] font-semibold tracking-wide">
              100% Vegetarian Kitchen &nbsp;•&nbsp; Satvik & Eggless Available &nbsp;•&nbsp; No Onion–No Garlic on Selected Dishes &nbsp;•&nbsp; Jain-Friendly on Request
            </div>
          </div>

          {/* Quick Lead Time Notice */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2 text-[11px] text-gray-300">
            <span className="inline-flex items-center gap-1.5 bg-[#775a19]/40 border border-[#ffdea5]/30 px-3 py-1 rounded-full text-[#ffdea5]">
              <Clock className="w-3.5 h-3.5" />
              <span>Strict 24h Cutoff for Catering Dishes & Breads</span>
            </span>
            <span className="inline-flex items-center gap-1.5 bg-white/10 border border-white/20 px-3 py-1 rounded-full text-white">
              <Clock className="w-3.5 h-3.5" />
              <span>48h Cutoff for Celebration Cakes</span>
            </span>
          </div>

          {/* Action buttons */}
          <div className="pt-4 flex flex-wrap justify-center gap-3">
            <button
              onClick={onScrollToMenu}
              className="bg-[#ffdea5] hover:bg-[#ffe7be] text-[#00346f] px-6 py-2.5 rounded font-bold text-xs uppercase tracking-wider transition-all shadow-md cursor-pointer hover:scale-102"
            >
              Start Order & Estimator
            </button>
            <button
              onClick={() => setShowAllergenModal(true)}
              className="inline-flex items-center gap-1.5 bg-white/15 hover:bg-white/25 text-white border border-white/30 px-5 py-2.5 rounded font-bold text-xs uppercase tracking-wider transition-all cursor-pointer"
            >
              <Info className="w-4 h-4 text-[#ffdea5]" />
              Allergen Guide & Notice
            </button>
          </div>
        </div>
      </div>

      {/* ── THE 4 DIFFERENTIATOR CARDS ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 relative z-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          <div className="bg-white rounded-xl p-5 shadow-md border border-[#775a19]/15 flex items-start gap-3.5 transition-transform hover:-translate-y-0.5">
            <div className="p-2.5 bg-[#00346f]/10 text-[#00346f] rounded-lg shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-sm text-[#00346f]">No Preservatives</h3>
              <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                Cooked fresh for your event — never premade, never stored.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 shadow-md border border-[#775a19]/15 flex items-start gap-3.5 transition-transform hover:-translate-y-0.5">
            <div className="p-2.5 bg-[#775a19]/10 text-[#775a19] rounded-lg shrink-0">
              <Droplet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-sm text-[#775a19]">Healthy Oils</h3>
              <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                Light quality cooking oils — nothing reused, nothing heavy.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 shadow-md border border-[#775a19]/15 flex items-start gap-3.5 transition-transform hover:-translate-y-0.5">
            <div className="p-2.5 bg-emerald-100/70 text-emerald-800 rounded-lg shrink-0">
              <Leaf className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-sm text-emerald-900">Organic Ingredients</h3>
              <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                Fresh produce & whole spices, sourced with utmost care.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 shadow-md border border-[#775a19]/15 flex items-start gap-3.5 transition-transform hover:-translate-y-0.5">
            <div className="p-2.5 bg-rose-100/70 text-rose-800 rounded-lg shrink-0">
              <Heart className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-sm text-rose-900">Made with Love & Taste</h3>
              <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                Small batches, family recipes — homestyle, not restaurant-style.
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* ── TRAY PRICING TIERS OVERVIEW BANNER ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 mb-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 shadow-xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 pb-3 border-b border-gray-100">
            <div>
              <h2 className="font-serif font-bold text-base text-[#00346f] tracking-wide">
                TRAY SIZES & SIMPLE PRICING TIERS
              </h2>
              <p className="text-xs text-gray-500">
                Same generous portions & straightforward pricing across all our 4 culinary tiers.
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold text-gray-600">
              <span className="text-gray-400">Allergen codes:</span>
              <span className="px-1.5 py-0.5 bg-blue-50 text-blue-800 rounded font-mono text-[10px] font-bold">D: Dairy</span>
              <span className="px-1.5 py-0.5 bg-amber-50 text-amber-800 rounded font-mono text-[10px] font-bold">G: Gluten</span>
              <span className="px-1.5 py-0.5 bg-rose-50 text-rose-800 rounded font-mono text-[10px] font-bold">N: Nuts</span>
              <span className="px-1.5 py-0.5 bg-purple-50 text-purple-800 rounded font-mono text-[10px] font-bold">S: Soy</span>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-4 text-center">
            
            <div className="p-3 rounded-lg bg-gray-50 border border-gray-200">
              <span className="text-[10px] uppercase font-bold tracking-widest text-gray-500 block">TIER 1</span>
              <span className="font-serif text-lg font-bold text-[#00346f]">KHAAS</span>
              <div className="text-xs font-bold text-[#775a19] mt-1">$70 <span className="text-[10px] font-medium text-gray-500">FULL</span></div>
              <div className="text-[11px] text-gray-600">$50 Half · $35 1/3</div>
            </div>

            <div className="p-3 rounded-lg bg-[#00346f]/5 border border-[#00346f]/15">
              <span className="text-[10px] uppercase font-bold tracking-widest text-gray-500 block">TIER 2</span>
              <span className="font-serif text-lg font-bold text-[#00346f]">SHAHI</span>
              <div className="text-xs font-bold text-[#775a19] mt-1">$90 <span className="text-[10px] font-medium text-gray-500">FULL</span></div>
              <div className="text-[11px] text-gray-600">$60 Half · $45 1/3</div>
            </div>

            <div className="p-3 rounded-lg bg-[#775a19]/5 border border-[#775a19]/20">
              <span className="text-[10px] uppercase font-bold tracking-widest text-[#775a19] block">TIER 3</span>
              <span className="font-serif text-lg font-bold text-[#775a19]">DARBARI</span>
              <div className="text-xs font-bold text-[#775a19] mt-1">$110 <span className="text-[10px] font-medium text-gray-500">FULL</span></div>
              <div className="text-[11px] text-gray-600">$70 Half · $55 1/3</div>
            </div>

            <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-300">
              <span className="text-[10px] uppercase font-bold tracking-widest text-amber-900 block">TIER 4 (ROYAL)</span>
              <span className="font-serif text-lg font-bold text-amber-950">MAHARAJA</span>
              <div className="text-xs font-bold text-amber-900 mt-1">$130 <span className="text-[10px] font-medium text-gray-500">FULL</span></div>
              <div className="text-[11px] text-gray-700">$80 Half · $65 1/3</div>
            </div>

          </div>

          <div className="mt-3 pt-3 border-t border-gray-100 flex flex-wrap items-center justify-between text-[11px] text-gray-500 gap-2">
            <span>Freshly crafted in Frisco, TX & DFW metroplex. Delivery $50 flat fee or pickup.</span>
            <div className="flex items-center gap-4 text-gray-700 font-medium">
              <span className="inline-flex items-center gap-1"><Phone className="w-3 h-3 text-[#00346f]" /> 945-527-4566</span>
              <span className="inline-flex items-center gap-1"><Mail className="w-3 h-3 text-[#00346f]" /> bluebonnetwhisk@gmail.com</span>
              <span className="inline-flex items-center gap-1"><Globe className="w-3 h-3 text-[#00346f]" /> www.bluebonnetwhisk.com</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── ALLERGEN & DIETARY MODAL ── */}
      {showAllergenModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl p-6 sm:p-8 border border-[#775a19]/20">
            <button
              onClick={() => setShowAllergenModal(false)}
              className="absolute top-4 right-4 p-1 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100"
              aria-label="Close Allergen Guide"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2.5 text-[#00346f] mb-3">
              <AlertTriangle className="w-6 h-6 text-amber-600" />
              <h3 className="font-serif text-xl font-bold">Common Allergens & Kitchen Notice</h3>
            </div>

            <p className="text-xs text-gray-600 mb-4 leading-relaxed">
              Our key to every dish — codes appear beside each item across the catering menu:
            </p>

            <div className="space-y-3 mb-6">
              {Object.entries(ALLERGEN_LABELS).map(([code, item]) => (
                <div key={code} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-150">
                  <span className="w-7 h-7 rounded-full bg-[#00346f] text-white flex items-center justify-center font-bold text-xs shrink-0">
                    {code}
                  </span>
                  <div>
                    <h4 className="font-bold text-xs text-gray-900">{item.name}</h4>
                    <p className="text-xs text-gray-600 mt-0.5 leading-snug">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 text-xs text-amber-900 space-y-1.5 leading-relaxed">
              <span className="font-bold block uppercase tracking-wider text-[10px]">PLEASE NOTE</span>
              <p>
                All dishes are prepared in a single home-style kitchen handling Dairy (D), Wheat/Gluten (G), Nuts (N), Soy (S), and Mustard. Fried items may share cooking oil, so trace cross-contact is possible.
              </p>
              <p className="font-semibold pt-1">
                Tell us about any allergy or dietary need when ordering — we will gladly guide and adjust where we can!
              </p>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowAllergenModal(false)}
                className="bg-[#00346f] text-white px-5 py-2 rounded text-xs font-bold uppercase tracking-wider hover:bg-[#00224d] transition-all cursor-pointer"
              >
                Understood
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
