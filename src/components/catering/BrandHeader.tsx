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
  Info,
  X
} from 'lucide-react';
import { ALLERGEN_LABELS } from '../../data/desiDabbaMenu';

export function TrayPricingHeader() {
  const [showAllergenModal, setShowAllergenModal] = useState(false);

  return (
    <div className="w-full font-sans mb-6">
      {/* ── TRAY PRICING TIERS OVERVIEW BANNER ── */}
      <div className="bg-white rounded-2xl border border-[#775a19]/20 p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-gray-100">
          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-[#00346f]/10 text-[#00346f] text-[10px] font-bold uppercase tracking-wider">
                ✨ Homestyle Vegetarian Catering
              </div>
              <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300/80 text-[10px] font-bold uppercase tracking-wider">
                <span>⏱️</span> 24h Advance Notice
              </div>
            </div>
            <h2 className="font-serif font-bold text-lg sm:text-xl text-[#00346f] tracking-wide">
              TRAY SIZES & SIMPLE PRICING TIERS
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Same generous portions & straightforward pricing across all 4 of our culinary tiers.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200">
              <span className="text-gray-400 text-[10px] uppercase font-bold">Allergens:</span>
              <span className="px-1.5 py-0.5 bg-blue-50 text-blue-800 rounded font-mono text-[10px] font-bold">D: Dairy</span>
              <span className="px-1.5 py-0.5 bg-amber-50 text-amber-800 rounded font-mono text-[10px] font-bold">G: Gluten</span>
              <span className="px-1.5 py-0.5 bg-rose-50 text-rose-800 rounded font-mono text-[10px] font-bold">N: Nuts</span>
              <span className="px-1.5 py-0.5 bg-purple-50 text-purple-800 rounded font-mono text-[10px] font-bold">S: Soy</span>
            </div>

            <button
              onClick={() => setShowAllergenModal(true)}
              className="inline-flex items-center gap-1.5 bg-[#00346f]/10 hover:bg-[#00346f]/20 text-[#00346f] px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer border border-[#00346f]/20"
            >
              <Info className="w-3.5 h-3.5 text-[#00346f]" />
              <span>Allergen Notice</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-4 text-center">
          
          <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-200 hover:border-gray-300 transition-colors">
            <span className="text-[10px] uppercase font-bold tracking-widest text-gray-500 block">TIER 1</span>
            <span className="font-serif text-lg font-bold text-[#00346f]">KHAAS</span>
            <div className="text-xs font-bold text-[#775a19] mt-1">$70 <span className="text-[10px] font-medium text-gray-500">FULL</span></div>
            <div className="text-[11px] text-gray-600 font-medium">$50 Half · $35 1/3</div>
          </div>

          <div className="p-3.5 rounded-xl bg-[#00346f]/5 border border-[#00346f]/15 hover:border-[#00346f]/30 transition-colors">
            <span className="text-[10px] uppercase font-bold tracking-widest text-[#00346f]/70 block">TIER 2</span>
            <span className="font-serif text-lg font-bold text-[#00346f]">SHAHI</span>
            <div className="text-xs font-bold text-[#775a19] mt-1">$90 <span className="text-[10px] font-medium text-gray-500">FULL</span></div>
            <div className="text-[11px] text-gray-600 font-medium">$60 Half · $45 1/3</div>
          </div>

          <div className="p-3.5 rounded-xl bg-[#775a19]/5 border border-[#775a19]/20 hover:border-[#775a19]/40 transition-colors">
            <span className="text-[10px] uppercase font-bold tracking-widest text-[#775a19] block">TIER 3</span>
            <span className="font-serif text-lg font-bold text-[#775a19]">DARBARI</span>
            <div className="text-xs font-bold text-[#775a19] mt-1">$110 <span className="text-[10px] font-medium text-gray-500">FULL</span></div>
            <div className="text-[11px] text-gray-600 font-medium">$70 Half · $55 1/3</div>
          </div>

          <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-300 hover:border-amber-400 transition-colors">
            <span className="text-[10px] uppercase font-bold tracking-widest text-amber-900 block">TIER 4 (ROYAL)</span>
            <span className="font-serif text-lg font-bold text-amber-950">MAHARAJA</span>
            <div className="text-xs font-bold text-amber-900 mt-1">$130 <span className="text-[10px] font-medium text-gray-500">FULL</span></div>
            <div className="text-[11px] text-gray-700 font-medium">$80 Half · $65 1/3</div>
          </div>

        </div>

        <div className="mt-4 pt-3 border-t border-gray-100 flex flex-wrap items-center justify-between text-[11px] text-gray-500 gap-2">
          <span className="font-medium text-gray-600">
            Freshly crafted in Frisco, TX & DFW metroplex. Flat $50 delivery fee or free pickup. Strict 24h advance notice.
          </span>
          <div className="flex items-center gap-4 text-gray-700 font-medium">
            <span className="inline-flex items-center gap-1"><Phone className="w-3 h-3 text-[#00346f]" /> 945-527-4566</span>
            <span className="inline-flex items-center gap-1"><Mail className="w-3 h-3 text-[#00346f]" /> bluebonnetwhisk@gmail.com</span>
            <span className="inline-flex items-center gap-1"><Globe className="w-3 h-3 text-[#00346f]" /> www.bluebonnetwhisk.com</span>
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

export function CateringDifferentiators() {
  return (
    <div className="w-full pt-10 pb-6 font-sans border-t border-[#775a19]/15 mt-10 animate-fade-in">
      <div className="max-w-7xl mx-auto">
        <div className="text-center max-w-xl mx-auto mb-8">
          <span className="text-[11px] font-bold text-[#775a19] uppercase tracking-widest block mb-1">
            WHY BLUEBONNET WHISK
          </span>
          <h2 className="font-serif text-2xl font-bold text-gray-900">
            Our 4 Culinary Pillars
          </h2>
          <div className="h-0.5 w-12 bg-[#775a19] mx-auto mt-2" />
        </div>

        {/* ── THE 4 DIFFERENTIATOR CARDS ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#775a19]/15 flex items-start gap-3.5 transition-transform hover:-translate-y-0.5">
            <div className="p-2.5 bg-[#00346f]/10 text-[#00346f] rounded-xl shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-sm sm:text-base text-[#00346f]">No Preservatives</h3>
              <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                Cooked fresh for your event — never premade, never stored.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#775a19]/15 flex items-start gap-3.5 transition-transform hover:-translate-y-0.5">
            <div className="p-2.5 bg-[#775a19]/10 text-[#775a19] rounded-xl shrink-0">
              <Droplet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-sm sm:text-base text-[#775a19]">Healthy Oils</h3>
              <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                Light quality cooking oils — nothing reused, nothing heavy.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#775a19]/15 flex items-start gap-3.5 transition-transform hover:-translate-y-0.5">
            <div className="p-2.5 bg-emerald-100/70 text-emerald-800 rounded-xl shrink-0">
              <Leaf className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-sm sm:text-base text-emerald-900">Organic Ingredients</h3>
              <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                Fresh produce & whole spices, sourced with utmost care.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#775a19]/15 flex items-start gap-3.5 transition-transform hover:-translate-y-0.5">
            <div className="p-2.5 bg-rose-100/70 text-rose-800 rounded-xl shrink-0">
              <Heart className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-sm sm:text-base text-rose-900">Made with Love & Taste</h3>
              <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                Small batches, family recipes — homestyle, not restaurant-style.
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default function BrandHeader() {
  return <CateringDifferentiators />;
}
