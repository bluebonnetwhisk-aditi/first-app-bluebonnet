import { 
  Sparkles, 
  Leaf, 
  Palette, 
  ChefHat 
} from 'lucide-react';

export default function CakeBrandHeader() {
  return (
    <div className="w-full pt-6 sm:pt-10 pb-4 sm:pb-6 font-sans border-t border-[#775a19]/15 mt-6 sm:mt-10 animate-fade-in">
      <div className="max-w-7xl mx-auto">
        <div className="text-center max-w-xl mx-auto mb-4 sm:mb-8">
          <span className="text-[10px] sm:text-[11px] font-bold text-[#775a19] uppercase tracking-widest block mb-0.5 sm:mb-1">
            WHY BLUEBONNET WHISK
          </span>
          <h2 className="font-serif text-lg sm:text-2xl font-bold text-gray-900">
            Our 4 Artisan Baking Pillars
          </h2>
          <div className="h-0.5 w-10 sm:w-12 bg-[#775a19] mx-auto mt-1.5 sm:mt-2" />
        </div>

        {/* ── THE 4 PILLARS (Compact 2x2 on mobile, 4-col on desktop) ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
          
          {/* Pillar 1 */}
          <div className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-5 shadow-xs sm:shadow-sm border border-[#775a19]/15 flex items-center sm:items-start gap-2.5 sm:gap-3.5">
            <div className="p-2 sm:p-2.5 bg-amber-50 text-amber-800 rounded-lg sm:rounded-xl shrink-0">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-xs sm:text-base text-amber-800 leading-tight">Scratch-Baked</h3>
              <p className="hidden sm:block text-xs text-gray-600 mt-1 leading-relaxed">
                Made with real European butter, fresh dairy cream, and pure Belgian chocolate. Zero commercial powder premixes, artificial stabilizers, or frozen bulk sponges.
              </p>
            </div>
          </div>

          {/* Pillar 2 */}
          <div className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-5 shadow-xs sm:shadow-sm border border-[#775a19]/15 flex items-center sm:items-start gap-2.5 sm:gap-3.5">
            <div className="p-2 sm:p-2.5 bg-emerald-50 text-emerald-800 rounded-lg sm:rounded-xl shrink-0">
              <Leaf className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-xs sm:text-base text-emerald-800 leading-tight">Eggless Options</h3>
              <p className="hidden sm:block text-xs text-gray-600 mt-1 leading-relaxed">
                Crafted in our dedicated home kitchen with the option for 100% eggless preparation on request. We bake with premium ingredients to ensure heavenly moisture, luscious texture, and rich taste tailored to your dietary preference.
              </p>
            </div>
          </div>

          {/* Pillar 3 */}
          <div className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-5 shadow-xs sm:shadow-sm border border-[#775a19]/15 flex items-center sm:items-start gap-2.5 sm:gap-3.5">
            <div className="p-2 sm:p-2.5 bg-rose-50 text-rose-800 rounded-lg sm:rounded-xl shrink-0">
              <Palette className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-xs sm:text-base text-rose-800 leading-tight">Custom Themes</h3>
              <p className="hidden sm:block text-xs text-gray-600 mt-1 leading-relaxed">
                Bespoke flavor pairings, hand-piped detailing, and personalized message plaques uniquely customized for your event rather than mass-produced factory repeats.
              </p>
            </div>
          </div>

          {/* Pillar 4 */}
          <div className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-5 shadow-xs sm:shadow-sm border border-[#775a19]/15 flex items-center sm:items-start gap-2.5 sm:gap-3.5">
            <div className="p-2 sm:p-2.5 bg-purple-50 text-purple-800 rounded-lg sm:rounded-xl shrink-0">
              <ChefHat className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-xs sm:text-base text-purple-800 leading-tight">Direct Baker Care</h3>
              <p className="hidden sm:block text-xs text-gray-600 mt-1 leading-relaxed">
                Work directly with master baker Aditi. Your cake is freshly baked and finished just hours prior to your pickup for peak flavor, tenderness, and presentation.
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
