import { useState, useEffect } from 'react';
import { 
  X, 
  Upload, 
  Check, 
  AlertCircle, 
  Save, 
  Image as ImageIcon,
  Calendar,
  Utensils,
  Plus,
  Trash2
} from 'lucide-react';
import type { TiffinMenuSettings, TiffinSpecialDish } from '../../types/catering';
import { fetchTiffinMenuSettings, saveTiffinMenuSettings, fetchCalendarBlackouts, DEFAULT_TIFFIN_SETTINGS } from '../../services/supabase';
import { getCentralTimeNow } from '../../utils/centralTime';

interface KDSTiffinMenuModalProps {
  onClose: () => void;
  onSettingsSaved?: () => void;
}

interface WeekOption {
  key: string;
  label: string;
  startDate: string;
  endDate: string;
  hasBlackout: boolean;
  blackoutCount: number;
}

export default function KDSTiffinMenuModal({
  onClose,
  onSettingsSaved
}: KDSTiffinMenuModalProps) {
  const [flyerUrl, setFlyerUrl] = useState('');
  const [weekTitle, setWeekTitle] = useState('');
  const [selectedWeekKey, setSelectedWeekKey] = useState('');
  
  // Special dishes (max 3)
  const [specialDishes, setSpecialDishes] = useState<TiffinSpecialDish[]>([]);

  // Week options
  const [weekOptions, setWeekOptions] = useState<WeekOption[]>([]);

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Load existing settings and blackouts
  useEffect(() => {
    Promise.all([fetchTiffinMenuSettings(), fetchCalendarBlackouts()]).then(([data, bDates]) => {
      setFlyerUrl(data.flyerImageUrl || DEFAULT_TIFFIN_SETTINGS.flyerImageUrl);
      setWeekTitle(data.weekTitle || DEFAULT_TIFFIN_SETTINGS.weekTitle);

      // Populate special dishes (convert legacy format if needed)
      if (Array.isArray(data.specialDishes) && data.specialDishes.length > 0) {
        setSpecialDishes(data.specialDishes.slice(0, 3));
      } else if (data.saturdaySpecialTitle) {
        setSpecialDishes([
          {
            id: 'spec-legacy',
            title: data.saturdaySpecialTitle,
            description: data.saturdaySpecialDescription || 'Special weekend dish',
            price: 13.99,
            imageUrl: data.saturdaySpecialImageUrl || ''
          }
        ]);
      } else {
        setSpecialDishes(DEFAULT_TIFFIN_SETTINGS.specialDishes || []);
      }

      // Generate upcoming 8 weeks
      const { nowDate } = getCentralTimeNow();
      const currentDayOfWeek = nowDate.getDay(); // 0 is Sunday, 1 is Monday
      const mondayOffset = currentDayOfWeek === 0 ? -6 : 1 - currentDayOfWeek;
      const currentMondayMs = nowDate.getTime() + mondayOffset * 24 * 60 * 60 * 1000;

      const options: WeekOption[] = [];
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

      for (let w = 0; w < 8; w++) {
        const weekMon = new Date(currentMondayMs + w * 7 * 24 * 60 * 60 * 1000);
        const weekSun = new Date(weekMon.getTime() + 6 * 24 * 60 * 60 * 1000);

        const mStartStr = `${weekMon.getFullYear()}-${(weekMon.getMonth() + 1).toString().padStart(2, '0')}-${weekMon.getDate().toString().padStart(2, '0')}`;
        const mEndStr = `${weekSun.getFullYear()}-${(weekSun.getMonth() + 1).toString().padStart(2, '0')}-${weekSun.getDate().toString().padStart(2, '0')}`;

        // Count blackouts in this week
        let count = 0;
        for (let d = 0; d < 7; d++) {
          const checkD = new Date(weekMon.getTime() + d * 24 * 60 * 60 * 1000);
          const dateStr = `${checkD.getFullYear()}-${(checkD.getMonth() + 1).toString().padStart(2, '0')}-${checkD.getDate().toString().padStart(2, '0')}`;
          if (bDates.includes(dateStr)) count++;
        }

        const label = `${monthNames[weekMon.getMonth()]} ${weekMon.getDate()} – ${monthNames[weekSun.getMonth()]} ${weekSun.getDate()}, ${weekSun.getFullYear()}`;
        options.push({
          key: mStartStr,
          label: `${w === 0 ? 'Current Week: ' : `Week ${w + 1}: `}${label}${count > 0 ? ` (⚠️ ${count} Blackout Day${count > 1 ? 's' : ''})` : ''}`,
          startDate: mStartStr,
          endDate: mEndStr,
          hasBlackout: count > 0,
          blackoutCount: count
        });
      }

      setWeekOptions(options);

      // Match current week
      if (data.weekStartDate) {
        setSelectedWeekKey(data.weekStartDate);
      } else if (options.length > 0) {
        setSelectedWeekKey(options[0].key);
      }
    });
  }, []);

  // Handle selecting a week from dropdown
  const handleSelectWeek = (key: string) => {
    setSelectedWeekKey(key);
    const chosen = weekOptions.find(o => o.key === key);
    if (chosen) {
      const cleanLabel = chosen.label.replace(/^Current Week: |^Week \d+: /i, '').replace(/ \(⚠️.*?\)/, '');
      setWeekTitle(cleanLabel);
    }
  };

  // Handle local image file upload for flyer
  const handleFlyerFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg('Image file size exceeds 5MB limit. Please choose a smaller image.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setFlyerUrl(reader.result);
        setErrorMsg(null);
      }
    };
    reader.readAsDataURL(file);
  };

  // Add Special Dish (max 3)
  const handleAddSpecial = () => {
    if (specialDishes.length >= 3) return;
    const newSpecial: TiffinSpecialDish = {
      id: `spec-${Date.now().toString(36)}`,
      title: 'Chef’s Special Weekend Dish',
      description: 'Handcrafted weekend delicacy with authentic spices & fresh garnish.',
      price: 13.99,
      imageUrl: ''
    };
    setSpecialDishes([...specialDishes, newSpecial]);
  };

  // Remove Special Dish
  const handleRemoveSpecial = (idx: number) => {
    setSpecialDishes(specialDishes.filter((_, i) => i !== idx));
  };

  // Update Special Dish field
  const handleUpdateSpecial = (idx: number, field: keyof TiffinSpecialDish, value: any) => {
    setSpecialDishes(prev => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], [field]: value };
      return copy;
    });
  };

  // Save Settings
  const handleSave = async () => {
    setIsSaving(true);
    setErrorMsg(null);

    const activeWeek = weekOptions.find(o => o.key === selectedWeekKey);

    const newSettings: TiffinMenuSettings = {
      flyerImageUrl: flyerUrl.trim() || DEFAULT_TIFFIN_SETTINGS.flyerImageUrl,
      weekTitle: weekTitle.trim() || DEFAULT_TIFFIN_SETTINGS.weekTitle,
      weekStartDate: activeWeek?.startDate,
      weekEndDate: activeWeek?.endDate,
      specialDishes: specialDishes.map(s => ({
        ...s,
        title: s.title.trim(),
        description: s.description.trim(),
        price: Math.max(0, s.price)
      })),
      // Legacy fields for backward compatibility:
      saturdaySpecialTitle: specialDishes[0]?.title || DEFAULT_TIFFIN_SETTINGS.saturdaySpecialTitle,
      saturdaySpecialDescription: specialDishes[0]?.description || DEFAULT_TIFFIN_SETTINGS.saturdaySpecialDescription,
      saturdaySpecialImageUrl: specialDishes[0]?.imageUrl || ''
    };

    try {
      const ok = await saveTiffinMenuSettings(newSettings);
      if (ok) {
        setSaveSuccess(true);
        setTimeout(() => {
          if (onSettingsSaved) onSettingsSaved();
          onClose();
        }, 1200);
      } else {
        throw new Error('Failed to save settings to Supabase');
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Error saving tiffin menu settings');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto animate-fade-in font-sans">
      <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden my-6 max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="bg-[#00346f] text-white p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-[#ffdea5]" />
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#ffdea5] block">
                KDS TIFFIN MANAGEMENT
              </span>
              <h3 className="font-serif text-lg font-bold">
                Weekly Tiffin Flyer &amp; Chef's Specials
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-white/80 hover:text-white hover:bg-white/10 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          
          {saveSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-xl text-xs font-bold flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>✓ Weekly Tiffin Flyer and Chef's Specials synced to Supabase!</span>
            </div>
          )}

          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-300 text-rose-900 rounded-xl text-xs font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* ── 1. INTERACTIVE WEEK SELECTOR (EXCLUDING BLACKOUTS) ── */}
          <div className="p-4 bg-blue-50/60 border border-blue-200 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-[#00346f] uppercase tracking-wider flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-[#775a19]" />
                <span>Select Week Date Range (Interactive Calendar Cycle)</span>
              </label>
              <span className="text-[10px] text-gray-500 font-semibold">Excludes or flags kitchen blackouts</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-1">
                  Choose Upcoming Monday–Sunday Cycle:
                </label>
                <select
                  value={selectedWeekKey}
                  onChange={(e) => handleSelectWeek(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-gray-300 rounded-xl focus:outline-none focus:border-[#00346f] font-medium"
                >
                  {weekOptions.map(opt => (
                    <option key={opt.key} value={opt.key}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-1">
                  Custom Display Title / Heading:
                </label>
                <input
                  type="text"
                  placeholder="e.g. September 21 - 26"
                  value={weekTitle}
                  onChange={(e) => setWeekTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-gray-300 rounded-xl focus:outline-none focus:border-[#00346f]"
                />
              </div>
            </div>
          </div>

          {/* ── 2. WEEKLY FLYER IMAGE ── */}
          <div className="space-y-3 p-4 bg-gray-50 border border-gray-250 rounded-2xl">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4 text-[#00346f]" />
                <span>Weekly Tiffin Menu Flyer Image</span>
              </label>
              <span className="text-[10px] text-gray-500 font-semibold">Visible to customers in Tiffin tab</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-start">
              {/* Image Preview */}
              <div className="relative rounded-xl border border-gray-300 overflow-hidden bg-white max-h-48 flex items-center justify-center">
                <img 
                  src={flyerUrl || '/tiffin-flyer.jpg'} 
                  alt="Flyer Preview" 
                  className="w-full object-contain max-h-48"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/tiffin-flyer.jpg';
                  }}
                />
              </div>

              {/* Upload & URL inputs */}
              <div className="sm:col-span-2 space-y-3">
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 mb-1">
                    Upload Flyer Image File:
                  </label>
                  <label className="flex items-center justify-center gap-2 p-2.5 bg-white border border-dashed border-gray-300 rounded-xl hover:border-[#00346f] cursor-pointer text-xs font-bold text-gray-700 hover:text-[#00346f] transition-colors">
                    <Upload className="w-4 h-4" />
                    <span>Choose Image File (PNG, JPG, WebP)</span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleFlyerFileUpload}
                      className="hidden" 
                    />
                  </label>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-700 mb-1">
                    Or Enter Image URL:
                  </label>
                  <input
                    type="text"
                    placeholder="https://example.com/weekly-flyer.jpg or /tiffin-flyer.jpg"
                    value={flyerUrl}
                    onChange={(e) => setFlyerUrl(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white border border-gray-300 rounded-xl focus:outline-none focus:border-[#00346f]"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ── 3. SATURDAY / CHEF'S SPECIAL DISHES (UP TO 3 SPECIALS WITH PRICES) ── */}
          <div className="space-y-4 p-4 bg-purple-50/60 border border-purple-200 rounded-2xl">
            <div className="flex items-center justify-between">
              <div>
                <label className="block text-xs font-bold text-purple-950 uppercase tracking-wider flex items-center gap-1.5">
                  <Utensils className="w-4 h-4 text-purple-700" />
                  <span>Chef's Special Dishes (Max 3 Dishes with Unit Pricing)</span>
                </label>
                <p className="text-[11px] text-purple-800 mt-0.5">
                  Customers can select quantity and order each special individually.
                </p>
              </div>

              {specialDishes.length < 3 && (
                <button
                  type="button"
                  onClick={handleAddSpecial}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold shadow-2xs transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Special Dish ({specialDishes.length}/3)</span>
                </button>
              )}
            </div>

            {specialDishes.length === 0 ? (
              <div className="p-6 text-center bg-white rounded-xl border border-dashed border-purple-300 text-purple-700 text-xs">
                No special dishes configured. Click "+ Add Special Dish" above to add up to 3 weekend specials.
              </div>
            ) : (
              <div className="space-y-3">
                {specialDishes.map((dish, idx) => (
                  <div key={dish.id || idx} className="p-4 bg-white rounded-xl border border-purple-200 shadow-2xs space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black uppercase text-purple-900 flex items-center gap-1">
                        <span>Special Dish #{idx + 1}</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveSpecial(idx)}
                        className="text-rose-500 hover:text-rose-700 p-1 rounded hover:bg-rose-50 cursor-pointer"
                        title="Delete special dish"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="sm:col-span-2">
                        <label className="block text-[10px] font-bold text-gray-600 mb-0.5">Dish Name:</label>
                        <input
                          type="text"
                          placeholder="e.g. Pav Bhaji Feast, Chole Bhature, Vegetable Biryani"
                          value={dish.title}
                          onChange={(e) => handleUpdateSpecial(idx, 'title', e.target.value)}
                          className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:border-purple-600"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-gray-600 mb-0.5">Unit Price ($):</label>
                        <div className="flex items-center gap-1">
                          <span className="text-xs text-gray-500 font-bold">$</span>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="13.99"
                            value={dish.price}
                            onChange={(e) => handleUpdateSpecial(idx, 'price', parseFloat(e.target.value) || 0)}
                            className="w-full px-2.5 py-1.5 text-xs border border-gray-300 rounded-lg focus:border-purple-600 font-mono font-bold"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-gray-600 mb-0.5">Serving Description:</label>
                      <input
                        type="text"
                        placeholder="e.g. 2 Buttered Pavs with rich vegetable bhaji, lemon & spiced onions"
                        value={dish.description}
                        onChange={(e) => handleUpdateSpecial(idx, 'description', e.target.value)}
                        className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:border-purple-600"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-100 border-t border-gray-200 flex items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-gray-600 hover:text-gray-900 uppercase tracking-wider cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={isSaving}
            onClick={handleSave}
            className="inline-flex items-center gap-2 bg-[#00346f] hover:bg-[#00224d] text-white px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-md cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4 text-[#ffdea5]" />
            <span>{isSaving ? 'Saving to Supabase...' : 'Save Flyer & Specials'}</span>
          </button>
        </div>

      </div>
    </div>
  );
}
