import { useState } from 'react';
import { Users, AlertCircle, Sparkles, Check } from 'lucide-react';

interface PlannerToolProps {
  onApplyRecommended: (selections: Array<{ name: string; size: 'Third Tray' | 'Half Tray' | 'Full Tray'; qty: number }>) => void;
}

export default function PlannerTool({ onApplyRecommended }: PlannerToolProps) {
  const [guests, setGuests] = useState<number>(15);
  const [selectedCourse, setSelectedCourse] = useState<string>('Main Course');

  // Calculates the best combination of trays to fit the guest count
  // S: 0-6, L: 10-12, XL: 25-30
  const calculateTrays = (count: number) => {
    if (count <= 0) return { small: 0, large: 0, xl: 0, minServes: 0, maxServes: 0 };
    
    let bestXl = 0;
    let bestL = 0;
    let bestS = 0;
    let bestDiff = Infinity;
    let bestCostScore = Infinity; // Prefer fewer trays and larger sizes based on proportional weights

    const maxXlNeeded = Math.ceil(count / 25) + 1;
    for (let xl = 0; xl <= maxXlNeeded; xl++) {
      const remainingAfterXl = Math.max(0, count - xl * 30);
      const maxLNeeded = Math.ceil(remainingAfterXl / 10) + 1;
      
      for (let l = 0; l <= maxLNeeded; l++) {
        const remainingAfterL = Math.max(0, remainingAfterXl - l * 12);
        const maxSNeeded = Math.ceil(remainingAfterL / 6) + 1;
        for (let s = 0; s <= maxSNeeded; s++) {
          const maxServes = xl * 30 + l * 12 + s * 6;
          
          if (maxServes >= count) {
            const diff = maxServes - count;
            // Weighted penalty to favor 1 Large Tray (costScore = 1.5) over 2 Small Trays (costScore = 2.0),
            // and 1 Extra-Large Tray (costScore = 2.0) over 2 Large Trays (costScore = 3.0).
            const costScore = xl * 2.0 + l * 1.5 + s * 1.0;
            
            if (diff < bestDiff || (diff === bestDiff && costScore < bestCostScore)) {
              bestDiff = diff;
              bestCostScore = costScore;
              bestXl = xl;
              bestL = l;
              bestS = s;
            }
          }
        }
      }
    }

    return {
      small: bestS,
      large: bestL,
      xl: bestXl,
      minServes: bestXl * 25 + bestL * 10 + bestS * 0,
      maxServes: bestXl * 30 + bestL * 12 + bestS * 6,
    };
  };

  const results = calculateTrays(guests);

  const handleApply = () => {
    const itemsToApply: Array<{ name: string; size: 'Third Tray' | 'Half Tray' | 'Full Tray'; qty: number }> = [];
    if (results.small > 0) {
      itemsToApply.push({ name: selectedCourse, size: 'Third Tray', qty: results.small });
    }
    if (results.large > 0) {
      itemsToApply.push({ name: selectedCourse, size: 'Half Tray', qty: results.large });
    }
    if (results.xl > 0) {
      itemsToApply.push({ name: selectedCourse, size: 'Full Tray', qty: results.xl });
    }
    onApplyRecommended(itemsToApply);
  };

  return (
    <div className="bg-white rounded-lg border border-[#c3c6d2] p-6 shadow-sm transition-all duration-300">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-[#d7e2ff] rounded-md text-[#00346f]">
          <Users size={20} />
        </div>
        <div>
          <h4 className="font-serif font-semibold text-lg text-[#00346f]">Portion & Tray Planner</h4>
          <p className="text-xs text-gray-500 font-sans">Calculate optimal main course & dessert tray portions based on guest size.</p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Guest Count Input */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2 font-sans">
            How many guests are you hosting?
          </label>
          <div className="flex items-center gap-4">
            <input
              type="range"
              min="5"
              max="150"
              value={guests}
              onChange={(e) => setGuests(parseInt(e.target.value) || 5)}
              className="w-full h-1.5 bg-[#f3f3f9] rounded-lg appearance-none cursor-pointer accent-[#00346f]"
            />
            <div className="flex items-center gap-1.5">
              <input
                type="number"
                min="5"
                max="300"
                value={guests}
                onChange={(e) => setGuests(Math.max(1, parseInt(e.target.value) || 0))}
                className="w-16 px-2 py-1 text-center font-bold text-[#00346f] border border-[#c3c6d2] rounded-md focus:outline-none focus:border-[#00346f]"
              />
              <span className="text-sm font-medium text-gray-600">guests</span>
            </div>
          </div>
        </div>

        {/* Selected Course Type */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2 font-sans">
            Plan Portions For
          </label>
          <div className="grid grid-cols-2 gap-2">
            {['Main Course', 'Desserts'].map((course) => (
              <button
                key={course}
                type="button"
                onClick={() => setSelectedCourse(course)}
                className={`py-2 px-3 text-xs font-medium rounded-md border transition-all ${
                  selectedCourse === course
                    ? 'border-[#00346f] bg-[#00346f]/5 text-[#00346f] font-semibold'
                    : 'border-[#c3c6d2] text-gray-600 hover:border-gray-400'
                }`}
              >
                {course}
              </button>
            ))}
          </div>
        </div>

        {/* Calculation Result */}
        <div className="bg-[#f9f9ff] border border-[#d7e2ff] rounded-md p-4 mt-3">
          <p className="text-xs font-semibold text-[#00346f] mb-3 uppercase tracking-widest flex items-center gap-1 font-sans">
            <Sparkles size={12} className="text-[#775a19]" /> Recommended Portions
          </p>
          
          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm border-b border-[#ededf4] pb-2">
              <span className="text-gray-600">Full Tray <span className="text-xs text-gray-400">(Serves 25-30)</span></span>
              <span className="font-bold text-[#00346f]">{results.xl} {results.xl === 1 ? 'Tray' : 'Trays'}</span>
            </div>
            <div className="flex justify-between items-center text-sm border-b border-[#ededf4] pb-2">
              <span className="text-gray-600">Half Tray <span className="text-xs text-gray-400">(Serves 10-12)</span></span>
              <span className="font-bold text-[#00346f]">{results.large} {results.large === 1 ? 'Tray' : 'Trays'}</span>
            </div>
            <div className="flex justify-between items-center text-sm border-b border-[#ededf4] pb-2">
              <span className="text-gray-600">Third Tray <span className="text-xs text-gray-400">(Serves 0-6)</span></span>
              <span className="font-bold text-[#00346f]">{results.small} {results.small === 1 ? 'Tray' : 'Trays'}</span>
            </div>
          </div>

          <div className="mt-3 flex items-start gap-2 text-xs text-gray-600">
            <AlertCircle size={14} className="text-[#775a19] shrink-0 mt-0.5" />
            <p>
              This combination serves <strong className="text-gray-800">{results.minServes} to {results.maxServes}</strong> guests generously, satisfying your crowd of <strong>{guests}</strong>.
            </p>
          </div>
        </div>

        {/* Action Button */}
        <button
          type="button"
          onClick={handleApply}
          disabled={results.small === 0 && results.large === 0 && results.xl === 0}
          className="w-full py-2.5 px-4 bg-[#775a19] hover:bg-[#5d4201] text-white rounded-md text-xs uppercase font-semibold tracking-wider transition-all shadow-sm flex items-center justify-center gap-2"
        >
          <Check size={14} />
          Pre-populate My Catering Inquiry
        </button>
      </div>
    </div>
  );
}
