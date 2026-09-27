import { 
  Sparkles, 
  Leaf, 
  Palette, 
  ChefHat 
} from 'lucide-react';

export default function CakeBrandHeader() {
  return (
    <div className="w-full pt-10 pb-6 font-sans border-t border-[#775a19]/15 mt-10 animate-fade-in">
      <div className="max-w-7xl mx-auto">
        <div className="text-center max-w-xl mx-auto mb-8">
          <span className="text-[11px] font-bold text-[#775a19] uppercase tracking-widest block mb-1">
            WHY BLUEBONNET WHISK
          </span>
          <h2 className="font-serif text-2xl font-bold text-gray-900">
            Our 4 Artisan Baking Pillars
          </h2>
          <div className="h-0.5 w-12 bg-[#775a19] mx-auto mt-2" />
        </div>

        {/* ── THE 4 PILLARS ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Pillar 1 */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#775a19]/15 flex items-start gap-3.5 transition-transform hover:-translate-y-0.5">
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
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#775a19]/15 flex items-start gap-3.5 transition-transform hover:-translate-y-0.5">
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
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#775a19]/15 flex items-start gap-3.5 transition-transform hover:-translate-y-0.5">
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
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#775a19]/15 flex items-start gap-3.5 transition-transform hover:-translate-y-0.5">
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
    </div>
  );
}
