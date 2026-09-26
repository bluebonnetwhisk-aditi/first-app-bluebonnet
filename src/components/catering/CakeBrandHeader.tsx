import { 
  Sparkles, 
  Leaf, 
  Clock, 
  Phone, 
  Mail, 
  Globe, 
  Palette, 
  ChefHat, 
  MapPin, 
  CheckCircle2,
  Cake as CakeIcon
} from 'lucide-react';

interface CakeBrandHeaderProps {
  onScrollToConfigurator?: () => void;
}

export default function CakeBrandHeader({ onScrollToConfigurator }: CakeBrandHeaderProps) {
  return (
    <div className="w-full bg-[#fbfbfa] border-b border-[#775a19]/20 font-sans animate-fade-in">
      
      {/* ── TOP HERO BANNER: BLUEBONNET WHISK ARTISAN BAKERY ── */}
      <div className="relative overflow-hidden bg-gradient-to-b from-[#1a120b] via-[#2c1d11] to-[#120c07] text-white py-12 px-4 sm:px-6 lg:px-8 text-center shadow-inner">
        {/* Subtle decorative pattern */}
        <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none" />

        <div className="relative z-10 max-w-4xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 bg-[#ffdea5]/15 border border-[#ffdea5]/30 text-[#ffdea5] px-4 py-1 rounded-full text-[11px] font-bold tracking-widest uppercase shadow-xs">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Bluebonnet Whisk • Artisan Home Bakery</span>
            <span>•</span>
            <span>Little Elm &amp; Frisco, TX</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-tight drop-shadow-sm">
            BLUEBONNET WHISK
          </h1>
          <p className="font-serif text-lg sm:text-2xl text-[#ffdea5] italic font-medium">
            Handcrafted Celebration Cakes &amp; Specialty Bakes
          </p>

          <p className="text-sm sm:text-base text-gray-200 max-w-2xl mx-auto font-light leading-relaxed">
            Every celebration deserves a cake as unique as your milestone. Freshly whipped, custom-tailored, and scratch-baked in small batches using pure European butter, Belgian chocolate, and gourmet fillings.
          </p>

          {/* Key Standards Badges */}
          <div className="flex flex-wrap items-center justify-center gap-2.5 pt-2">
            <span className="inline-flex items-center gap-1.5 bg-emerald-500/20 border border-emerald-400/40 px-3.5 py-1.5 rounded-full text-xs text-emerald-200 font-semibold">
              <Leaf className="w-3.5 h-3.5 text-emerald-300" />
              Eggless Available on Request
            </span>

            <span className="inline-flex items-center gap-1.5 bg-[#ffdea5]/20 border border-[#ffdea5]/40 px-3.5 py-1.5 rounded-full text-xs text-[#ffdea5] font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#ffdea5]" />
              Texas Sales Tax Exempt (0% Bakery Tax)
            </span>

            <span className="inline-flex items-center gap-1.5 bg-white/10 border border-white/20 px-3.5 py-1.5 rounded-full text-xs text-gray-200 font-semibold">
              <Clock className="w-3.5 h-3.5 text-[#ffdea5]" />
              Strict 48-Hour Advance Notice Required
            </span>
          </div>

          {/* Action Button */}
          <div className="pt-4 flex flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={onScrollToConfigurator}
              className="inline-flex items-center gap-2 bg-[#ffdea5] hover:bg-[#ffe7be] text-[#2c1d11] px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-md cursor-pointer hover:scale-102"
            >
              <CakeIcon className="w-4 h-4 text-[#2c1d11]" />
              <span>Configure Your Cake Now</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── THE 4 PILLARS ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 relative z-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Pillar 1 */}
          <div className="bg-white rounded-2xl p-5 shadow-md border border-[#775a19]/15 flex items-start gap-3.5 transition-transform hover:-translate-y-0.5">
            <div className="p-2.5 bg-amber-50 text-amber-800 rounded-xl shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-sm sm:text-base text-amber-800">Scratch-Baked Small Batches</h3>
              <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                Made with real European butter, fresh dairy cream, and pure Belgian chocolate. Zero commercial powder premixes, artificial stabilizers, or frozen bulk sponges.
              </p>
            </div>
          </div>

          {/* Pillar 2 */}
          <div className="bg-white rounded-2xl p-5 shadow-md border border-[#775a19]/15 flex items-start gap-3.5 transition-transform hover:-translate-y-0.5">
            <div className="p-2.5 bg-emerald-50 text-emerald-800 rounded-xl shrink-0">
              <Leaf className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-sm sm:text-base text-emerald-800">Eggless Available on Request</h3>
              <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                Crafted in our dedicated home kitchen with the option for 100% eggless preparation on request. We bake with premium ingredients to ensure heavenly moisture, luscious texture, and rich taste tailored to your dietary preference.
              </p>
            </div>
          </div>

          {/* Pillar 3 */}
          <div className="bg-white rounded-2xl p-5 shadow-md border border-[#775a19]/15 flex items-start gap-3.5 transition-transform hover:-translate-y-0.5">
            <div className="p-2.5 bg-rose-50 text-rose-800 rounded-xl shrink-0">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-sm sm:text-base text-rose-800">Artisan Theme Customization</h3>
              <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                Bespoke flavor pairings, hand-piped detailing, and personalized message plaques uniquely customized for your event rather than mass-produced factory repeats.
              </p>
            </div>
          </div>

          {/* Pillar 4 */}
          <div className="bg-white rounded-2xl p-5 shadow-md border border-[#775a19]/15 flex items-start gap-3.5 transition-transform hover:-translate-y-0.5">
            <div className="p-2.5 bg-purple-50 text-purple-800 rounded-xl shrink-0">
              <ChefHat className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-sm sm:text-base text-purple-800">Direct Baker Consultation</h3>
              <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                Work directly with master baker Aditi. Your cake is freshly baked and finished just hours prior to your pickup for peak flavor, tenderness, and presentation.
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* ── SIZING & TEXAS TAX EXEMPTION OVERVIEW BANNER ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 mb-4">
        <div className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-6 shadow-xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-gray-150">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#775a19] block">
                HANDCRAFTED CAKE SIZING &amp; FLAVOR TIERS
              </span>
              <h2 className="font-serif font-bold text-base sm:text-lg text-[#00346f]">
                Two Perfect Sizes for Every Milestone
              </h2>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Texas Sales Tax Exempt (0% Sales Tax on Bakery Products)</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
            {/* 6" Card */}
            <div className="p-4 rounded-xl bg-amber-50/50 border border-amber-200/80 flex items-start justify-between gap-3">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-amber-900 block">STANDARD CELEBRATION</span>
                <span className="font-serif text-lg font-bold text-gray-900 block">6″ Celebration Cake</span>
                <span className="text-xs text-gray-600 block mt-0.5">Serves 8–10 guests • ~2 lb weight</span>
                <div className="mt-2 text-xs font-bold text-[#775a19]">
                  Tier Pricing: Classic $40 • Fusion $50 • Fruity $60 • Premium $70
                </div>
              </div>
              <span className="font-serif text-2xl font-black text-amber-900 shrink-0">From $40</span>
            </div>

            {/* 8" Card */}
            <div className="p-4 rounded-xl bg-purple-50/50 border border-purple-200/80 flex items-start justify-between gap-3">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-purple-900 block">LARGE PARTY &amp; GATHERING</span>
                <span className="font-serif text-lg font-bold text-gray-900 block">8″ Party Cake</span>
                <span className="text-xs text-gray-600 block mt-0.5">Serves 16–20 guests • ~4 lb weight</span>
                <div className="mt-2 text-xs font-bold text-purple-900">
                  Tier Pricing: Classic $80 • Fusion $100 • Fruity $120 • Premium $140
                </div>
              </div>
              <span className="font-serif text-2xl font-black text-purple-900 shrink-0">From $80</span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-gray-150 flex flex-wrap items-center justify-between text-[11px] text-gray-600 gap-2">
            <span className="flex items-center gap-1.5 font-medium text-gray-800">
              <MapPin className="w-3.5 h-3.5 text-[#775a19]" />
              <span>Self-Pickup: <strong>Home Kitchen - Deerwood Dr, Little Elm, TX</strong> ($0.00) • DFW Delivery Available ($50)</span>
            </span>
            <div className="flex items-center gap-4 text-gray-700 font-medium">
              <span className="inline-flex items-center gap-1"><Phone className="w-3 h-3 text-[#00346f]" /> 945-527-4566</span>
              <span className="inline-flex items-center gap-1"><Mail className="w-3 h-3 text-[#00346f]" /> bluebonnetwhisk@gmail.com</span>
              <span className="inline-flex items-center gap-1"><Globe className="w-3 h-3 text-[#00346f]" /> www.bluebonnetwhisk.com</span>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
