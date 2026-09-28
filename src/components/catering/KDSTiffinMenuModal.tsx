import React, { useState, useEffect } from 'react';
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
  Trash2,
  Package,
  DollarSign,
  Award,
  Sparkles,
  Key,
  Wand2,
  Eye,
  EyeOff,
  ExternalLink,
  RefreshCw,
  CheckCircle2
} from 'lucide-react';
import type { 
  TiffinMenuSettings, 
  TiffinSpecialDish, 
  WeekdayMenuEntry, 
  ContainerAddonItem, 
  DabbaPricing 
} from '../../types/catering';
import { 
  fetchTiffinMenuSettings, 
  saveTiffinMenuSettings, 
  fetchCalendarBlackouts, 
  DEFAULT_TIFFIN_SETTINGS,
  DEFAULT_WEEKDAY_MENUS,
  DEFAULT_CONTAINER_ADDONS,
  DEFAULT_DABBA_PRICING
} from '../../services/supabase';
import { 
  scanTiffinFlyerWithGemini, 
  getGeminiApiKey, 
  saveGeminiApiKey, 
  getBundledFlyerParsedData,
  type ScannedTiffinData 
} from '../../services/geminiScanner';
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

type ModalSection = 'flyer' | 'daily' | 'addons' | 'pricing' | 'specials';

const WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] as const;

export default function KDSTiffinMenuModal({
  onClose,
  onSettingsSaved
}: KDSTiffinMenuModalProps) {
  const [activeSection, setActiveSection] = useState<ModalSection>('flyer');
  
  // Section 1: Flyer & Dates
  const [flyerUrl, setFlyerUrl] = useState('');
  const [weekTitle, setWeekTitle] = useState('');
  const [selectedWeekKey, setSelectedWeekKey] = useState('');
  const [weekOptions, setWeekOptions] = useState<WeekOption[]>([]);

  // Section 2: Daily Homestyle Menu (Monday - Saturday)
  const [weekdayMenus, setWeekdayMenus] = useState<Record<string, WeekdayMenuEntry>>(DEFAULT_WEEKDAY_MENUS);

  // Section 3: 16 oz Containers (Add-ons & Sides)
  const [containerAddons, setContainerAddons] = useState<ContainerAddonItem[]>(DEFAULT_CONTAINER_ADDONS);

  // Section 4: Dabba Pricing
  const [dabbaPricing, setDabbaPricing] = useState<DabbaPricing>(DEFAULT_DABBA_PRICING);

  // Section 5: Chef's Specials
  const [specialDishes, setSpecialDishes] = useState<TiffinSpecialDish[]>([]);

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Google Gemini AI Scanner State
  const [geminiApiKey, setGeminiApiKey] = useState('');
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [tempApiKey, setTempApiKey] = useState('');
  const [showApiKeySecret, setShowApiKeySecret] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scanSuccess, setScanSuccess] = useState<string | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);
  const [aiUpdatedTabs, setAiUpdatedTabs] = useState<string[]>([]);

  // Load existing settings, blackouts and stored Gemini key
  useEffect(() => {
    getGeminiApiKey().then(k => {
      if (k) setGeminiApiKey(k);
    });

    Promise.all([fetchTiffinMenuSettings(), fetchCalendarBlackouts()]).then(([data, bDates]) => {
      setFlyerUrl(data.flyerImageUrl || DEFAULT_TIFFIN_SETTINGS.flyerImageUrl);
      setWeekTitle(data.weekTitle || DEFAULT_TIFFIN_SETTINGS.weekTitle);

      if (data.weekdayMenus) {
        setWeekdayMenus({ ...DEFAULT_WEEKDAY_MENUS, ...data.weekdayMenus });
      } else {
        setWeekdayMenus(DEFAULT_WEEKDAY_MENUS);
      }

      if (Array.isArray(data.containerAddons) && data.containerAddons.length > 0) {
        setContainerAddons(data.containerAddons);
      } else {
        setContainerAddons(DEFAULT_CONTAINER_ADDONS);
      }

      if (data.dabbaPricing) {
        setDabbaPricing({ ...DEFAULT_DABBA_PRICING, ...data.dabbaPricing });
      } else {
        setDabbaPricing(DEFAULT_DABBA_PRICING);
      }

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
      const { nowDate, dateStr: todayStr } = getCentralTimeNow();
      const currentDayOfWeek = nowDate.getDay(); // 0 is Sunday, 1 is Monday
      const mondayOffset = currentDayOfWeek === 0 ? 1 : (1 - currentDayOfWeek);
      const baseMonDate = new Date(nowDate.getFullYear(), nowDate.getMonth(), nowDate.getDate() + mondayOffset);

      const options: WeekOption[] = [];
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

      for (let w = 0; w < 8; w++) {
        const weekMon = new Date(baseMonDate.getFullYear(), baseMonDate.getMonth(), baseMonDate.getDate() + w * 7);
        const weekSun = new Date(weekMon.getFullYear(), weekMon.getMonth(), weekMon.getDate() + 6);

        const mStartStr = `${weekMon.getFullYear()}-${(weekMon.getMonth() + 1).toString().padStart(2, '0')}-${weekMon.getDate().toString().padStart(2, '0')}`;
        const mEndStr = `${weekSun.getFullYear()}-${(weekSun.getMonth() + 1).toString().padStart(2, '0')}-${weekSun.getDate().toString().padStart(2, '0')}`;

        // Count blackouts in this week
        let count = 0;
        for (let d = 0; d < 7; d++) {
          const checkD = new Date(weekMon.getFullYear(), weekMon.getMonth(), weekMon.getDate() + d);
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

      // Match current week (ignore past week dates)
      if (data.weekStartDate && data.weekStartDate >= todayStr) {
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

  // Handle local image file upload for flyer with automatic canvas compression
  const handleFlyerFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 15 * 1024 * 1024) {
      setErrorMsg('Image file size exceeds 15MB limit. Please choose a smaller image.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        const rawResult = reader.result;
        const img = new Image();
        img.onload = () => {
          try {
            const canvas = document.createElement('canvas');
            let width = img.width;
            let height = img.height;
            const maxDim = 1600;
            if (width > maxDim || height > maxDim) {
              if (width > height) {
                height = Math.round((height * maxDim) / width);
                width = maxDim;
              } else {
                width = Math.round((width * maxDim) / height);
                height = maxDim;
              }
            }
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.drawImage(img, 0, 0, width, height);
              const compressed = canvas.toDataURL('image/jpeg', 0.85);
              setFlyerUrl(compressed);
              setErrorMsg(null);
            } else {
              setFlyerUrl(rawResult);
              setErrorMsg(null);
            }
          } catch {
            setFlyerUrl(rawResult);
            setErrorMsg(null);
          }
        };
        img.onerror = () => {
          setFlyerUrl(rawResult);
          setErrorMsg(null);
        };
        img.src = rawResult;
      }
    };
    reader.readAsDataURL(file);
  };

  // Apply scanned data across all quick tab controls
  const applyScannedData = (data: ScannedTiffinData, sourceName: string) => {
    // 1. Week Title
    if (data.weekTitle) {
      setWeekTitle(data.weekTitle);
      const cleanTitle = data.weekTitle.toLowerCase();
      const match = weekOptions.find(o => 
        o.label.toLowerCase().includes(cleanTitle) ||
        cleanTitle.includes(o.label.toLowerCase())
      );
      if (match) {
        setSelectedWeekKey(match.key);
      }
    }

    // 2. Daily Menu (Monday - Saturday)
    if (data.weekdayMenus && Object.keys(data.weekdayMenus).length > 0) {
      setWeekdayMenus(prev => ({
        ...prev,
        ...data.weekdayMenus
      }));
    }

    // 3. 16 oz Containers
    if (data.containerAddons && data.containerAddons.length > 0) {
      setContainerAddons(data.containerAddons);
    }

    // 4. Dabba Pricing
    if (data.dabbaPricing) {
      setDabbaPricing(prev => ({
        ...prev,
        ...data.dabbaPricing
      }));
    }

    // 5. Chef's Specials
    if (data.specialDishes && data.specialDishes.length > 0) {
      setSpecialDishes(data.specialDishes);
    }

    setAiUpdatedTabs(['daily', 'addons', 'pricing', 'specials']);
    setScanSuccess(`✓ ${sourceName} successfully! Daily Menu (Mon–Sat), 16 oz Containers, Dabba Pricing, and Chef's Specials have been auto-populated. Review each tab below and save when ready.`);
    setScanError(null);
  };

  // Trigger Google Gemini OCR Scan
  const handleScanWithGemini = async () => {
    const key = geminiApiKey.trim();
    if (!key) {
      setTempApiKey('');
      setShowApiKeyModal(true);
      return;
    }

    setIsScanning(true);
    setScanError(null);
    setScanSuccess(null);

    try {
      const data = await scanTiffinFlyerWithGemini(flyerUrl || '/tiffin-flyer.jpg', key);
      applyScannedData(data, 'Google Gemini AI scanned your flyer');
    } catch (err: any) {
      const msg = err?.message || 'Error scanning flyer with Gemini AI';
      if (msg.includes('API Key is missing') || msg.includes('Invalid Gemini API Key')) {
        setScanError(msg);
        setShowApiKeyModal(true);
      } else {
        setScanError(msg);
      }
    } finally {
      setIsScanning(false);
    }
  };

  // Quick-fill from bundled flyer demo data
  const handleLoadDemoData = () => {
    const data = getBundledFlyerParsedData();
    applyScannedData(data, 'Bundled September flyer loaded');
  };

  // Save API Key and optionally scan
  const handleSaveApiKey = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = tempApiKey.trim();
    if (!clean) return;

    await saveGeminiApiKey(clean);
    setGeminiApiKey(clean);
    setShowApiKeyModal(false);
    setScanError(null);

    // Auto-scan immediately after saving key
    setIsScanning(true);
    try {
      const data = await scanTiffinFlyerWithGemini(flyerUrl || '/tiffin-flyer.jpg', clean);
      applyScannedData(data, 'Google Gemini AI scanned your flyer');
    } catch (err: any) {
      setScanError(err?.message || 'Error scanning flyer with Gemini AI');
    } finally {
      setIsScanning(false);
    }
  };

  // Daily Menu update
  const handleUpdateWeekdayMenu = (day: string, field: 'dal' | 'sabzi' | 'description', value: string) => {
    setWeekdayMenus(prev => ({
      ...prev,
      [day]: {
        ...(prev[day] || { dal: '', sabzi: '', description: '' }),
        [field]: value
      }
    }));
  };

  // 16 oz Container Add-on management
  const handleAddContainer = () => {
    const newId = `addon-${Date.now().toString(36)}`;
    setContainerAddons(prev => [
      ...prev,
      {
        id: newId,
        name: 'New 16 oz Specialty Side',
        price: 9.99,
        description: '16 oz tub of freshly prepared homestyle side'
      }
    ]);
  };

  const handleRemoveContainer = (index: number) => {
    setContainerAddons(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpdateContainer = (index: number, field: keyof ContainerAddonItem, value: any) => {
    setContainerAddons(prev => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  // Dabba Pricing update
  const handleUpdatePricing = (field: keyof DabbaPricing, value: number) => {
    setDabbaPricing(prev => ({
      ...prev,
      [field]: Math.max(0, value)
    }));
  };

  // Special Dish management (max 3)
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

  const handleRemoveSpecial = (idx: number) => {
    setSpecialDishes(specialDishes.filter((_, i) => i !== idx));
  };

  const handleUpdateSpecial = (idx: number, field: keyof TiffinSpecialDish, value: any) => {
    setSpecialDishes(prev => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], [field]: value };
      return copy;
    });
  };

  // Save Settings to Supabase and Local Storage
  const handleSave = async () => {
    setIsSaving(true);
    setErrorMsg(null);

    const activeWeek = weekOptions.find(o => o.key === selectedWeekKey);

    const newSettings: TiffinMenuSettings = {
      flyerImageUrl: flyerUrl.trim() || DEFAULT_TIFFIN_SETTINGS.flyerImageUrl,
      weekTitle: weekTitle.trim() || DEFAULT_TIFFIN_SETTINGS.weekTitle,
      weekStartDate: activeWeek?.startDate,
      weekEndDate: activeWeek?.endDate,
      weekdayMenus,
      containerAddons: containerAddons.map(c => ({
        ...c,
        name: c.name.trim(),
        price: Number(c.price) || 0,
        description: c.description.trim()
      })),
      dabbaPricing: {
        singlePrice: Number(dabbaPricing.singlePrice) || 11.99,
        familyPrice: Number(dabbaPricing.familyPrice) || 34.99,
        weeklyPrice: Number(dabbaPricing.weeklyPrice) || 54.99
      },
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
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden my-6 max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="bg-[#00346f] text-white p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-[#ffdea5]" />
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#ffdea5] block">
                BLUEBONNET TIFFIN MANAGEMENT
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

        {/* Section Navigation Tabs */}
        <div className="bg-gray-100 border-b border-gray-200 px-4 py-2 flex items-center gap-1.5 overflow-x-auto scrollbar-none shrink-0">
          {[
            { id: 'flyer', label: 'Flyer & Dates', icon: ImageIcon },
            { id: 'daily', label: 'Daily Menu (Mon–Sat)', icon: Utensils },
            { id: 'addons', label: '16 oz Containers', icon: Package },
            { id: 'pricing', label: 'Dabba Pricing', icon: DollarSign },
            { id: 'specials', label: "Chef's Specials", icon: Award }
          ].map(tab => {
            const Icon = tab.icon;
            const isCurrent = activeSection === tab.id;
            const isAiUpdated = aiUpdatedTabs.includes(tab.id);
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveSection(tab.id as ModalSection)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer relative ${
                  isCurrent
                    ? 'bg-[#00346f] text-white shadow-xs'
                    : 'bg-white text-gray-700 hover:bg-gray-200 border border-gray-200'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isCurrent ? 'text-[#ffdea5]' : 'text-gray-500'}`} />
                <span>{tab.label}</span>
                {isAiUpdated && (
                  <span className="flex h-2 w-2 relative ml-0.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          
          {saveSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-xl text-xs font-bold flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>✓ Weekly Tiffin Flyer, Menus, Containers &amp; Specials synced to Supabase!</span>
            </div>
          )}

          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-300 text-rose-900 rounded-xl text-xs font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* ── SECTION 1: FLYER & WEEKLY SCHEDULE ── */}
          {activeSection === 'flyer' && (
            <div className="space-y-4 animate-fade-in">
              {/* Interactive Week Selector */}
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

              {/* Weekly Flyer Image */}
              <div className="space-y-3 p-4 bg-gray-50 border border-gray-250 rounded-2xl">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-[#00346f]" />
                    <span>Weekly Tiffin Menu Flyer Image</span>
                  </label>
                  <span className="text-[10px] text-gray-500 font-semibold">Visible to customers in Tiffin tab</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-start">
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

              {/* ── GOOGLE GEMINI MULTIMODAL AI OCR & AUTO-POPULATOR ── */}
              <div className="p-4 bg-gradient-to-r from-indigo-50/90 via-purple-50/90 to-blue-50/90 border-2 border-indigo-200/90 rounded-2xl space-y-3 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-[#00346f] flex items-center justify-center text-white shadow-sm shrink-0">
                      <Sparkles className="w-4 h-4 text-[#ffdea5]" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-black text-indigo-950 uppercase tracking-wider">
                          Google Gemini Multimodal AI OCR
                        </h4>
                        <span className="px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-widest bg-indigo-600 text-white rounded-full">
                          Auto-Populate 4 Tabs
                        </span>
                      </div>
                      <p className="text-[11px] text-indigo-900 font-medium">
                        Automatically extract Monday–Saturday dishes, 16 oz sides, and Dabba prices directly from your flyer image.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setTempApiKey(geminiApiKey);
                      setShowApiKeyModal(true);
                    }}
                    className="inline-flex items-center gap-1.5 text-[11px] font-bold text-indigo-700 hover:text-indigo-900 bg-white hover:bg-indigo-50 px-2.5 py-1.5 rounded-xl border border-indigo-200 cursor-pointer self-start sm:self-center transition-colors shadow-2xs"
                  >
                    <Key className="w-3.5 h-3.5 text-indigo-500" />
                    <span>{geminiApiKey ? 'API Key: Set ✓' : 'Enter Gemini Key'}</span>
                  </button>
                </div>

                {/* Scan Status & Trigger Button */}
                <div className="pt-1 flex flex-wrap items-center gap-2.5">
                  <button
                    type="button"
                    disabled={isScanning}
                    onClick={handleScanWithGemini}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-600 via-purple-600 to-[#00346f] text-white rounded-xl font-bold text-xs hover:opacity-95 transition-all shadow-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.01]"
                  >
                    {isScanning ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin text-[#ffdea5]" />
                        <span>Gemini Vision is scanning flyer...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 text-[#ffdea5]" />
                        <span>✨ Scan Flyer &amp; Auto-Populate All Tabs</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    disabled={isScanning}
                    onClick={handleLoadDemoData}
                    className="inline-flex items-center gap-1.5 px-3 py-2 bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 rounded-xl font-semibold text-xs transition-colors cursor-pointer disabled:opacity-50"
                    title="Load pre-extracted data from the bundled September flyer"
                  >
                    <Wand2 className="w-3.5 h-3.5 text-purple-600" />
                    <span>Quick Fill from Bundled Flyer</span>
                  </button>

                  {isScanning && (
                    <span className="text-[11px] text-indigo-800 font-semibold animate-pulse flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-indigo-600 animate-ping" />
                      Analyzing dishes, 16 oz sides &amp; pricing...
                    </span>
                  )}
                </div>

                {/* Scan Success Banner */}
                {scanSuccess && (
                  <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl space-y-2 animate-fade-in">
                    <div className="flex items-center gap-2 text-xs font-bold text-emerald-950">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{scanSuccess}</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">
                        Review Scanned Tabs:
                      </span>
                      <button
                        type="button"
                        onClick={() => setActiveSection('daily')}
                        className="px-2.5 py-1 bg-white text-emerald-900 border border-emerald-300 rounded-lg text-[11px] font-bold hover:bg-emerald-100 transition-colors cursor-pointer"
                      >
                        1. Daily Menu (Mon–Sat) →
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveSection('addons')}
                        className="px-2.5 py-1 bg-white text-emerald-900 border border-emerald-300 rounded-lg text-[11px] font-bold hover:bg-emerald-100 transition-colors cursor-pointer"
                      >
                        2. 16 oz Containers →
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveSection('pricing')}
                        className="px-2.5 py-1 bg-white text-emerald-900 border border-emerald-300 rounded-lg text-[11px] font-bold hover:bg-emerald-100 transition-colors cursor-pointer"
                      >
                        3. Dabba Pricing →
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveSection('specials')}
                        className="px-2.5 py-1 bg-white text-emerald-900 border border-emerald-300 rounded-lg text-[11px] font-bold hover:bg-emerald-100 transition-colors cursor-pointer"
                      >
                        4. Chef's Specials →
                      </button>
                    </div>
                  </div>
                )}

                {/* Scan Error Banner */}
                {scanError && (
                  <div className="p-3 bg-rose-50 border border-rose-300 rounded-xl flex items-center justify-between gap-3 text-xs text-rose-900 animate-fade-in">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                      <span>{scanError}</span>
                    </div>
                    {(!geminiApiKey || scanError.includes('API')) && (
                      <button
                        type="button"
                        onClick={() => {
                          setTempApiKey(geminiApiKey);
                          setShowApiKeyModal(true);
                        }}
                        className="px-2.5 py-1 bg-rose-600 text-white rounded-lg font-bold text-[11px] hover:bg-rose-700 cursor-pointer shrink-0"
                      >
                        Enter API Key
                      </button>
                    )}
                  </div>
                )}
              </div>

            </div>
          )}

          {/* ── SECTION 2: DAILY HOMESTYLE MENU (MON–SAT) ── */}
          {activeSection === 'daily' && (
            <div className="space-y-4 animate-fade-in">
              <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-950 flex items-center gap-1.5">
                    <Utensils className="w-4 h-4 text-emerald-700" />
                    <span>Daily Homestyle Tiffin Selection (Monday – Saturday)</span>
                  </h4>
                  <p className="text-[11px] text-emerald-800 mt-0.5">
                    Update the daily dal / curry course and dry sabzi course from the weekly flyer.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {aiUpdatedTabs.includes('daily') && (
                    <span className="text-[10px] font-bold px-2.5 py-0.5 bg-emerald-600 text-white rounded-full flex items-center gap-1 shadow-2xs">
                      <Sparkles className="w-3 h-3 text-[#ffdea5]" /> Scanned by Gemini
                    </span>
                  )}
                  <span className="text-[11px] font-bold px-2.5 py-1 bg-white text-emerald-900 border border-emerald-300 rounded-xl">
                    Sunday Closed
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {WEEKDAYS.map(day => {
                  const item = weekdayMenus[day] || { dal: '', sabzi: '', description: '' };
                  const isSaturday = day === 'Saturday';

                  return (
                    <div 
                      key={day} 
                      className={`p-4 rounded-2xl border shadow-2xs space-y-3 ${
                        isSaturday ? 'bg-purple-50/50 border-purple-200' : 'bg-white border-gray-200'
                      }`}
                    >
                      <div className="flex items-center justify-between border-b border-gray-150 pb-2">
                        <span className={`font-serif font-bold text-sm ${isSaturday ? 'text-purple-900' : 'text-[#00346f]'}`}>
                          {day}
                        </span>
                        {isSaturday && (
                          <span className="text-[10px] font-black uppercase tracking-wider bg-purple-100 text-purple-800 px-2 py-0.5 rounded">
                            Special Day
                          </span>
                        )}
                      </div>

                      <div className="space-y-2">
                        <div>
                          <label className="block text-[10px] font-bold text-gray-600 mb-0.5">
                            Dal / Curry Course:
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. Palak Dal, Rajma, Lauki Kofta Curry"
                            value={item.dal}
                            onChange={(e) => handleUpdateWeekdayMenu(day, 'dal', e.target.value)}
                            className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:border-[#00346f]"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-gray-600 mb-0.5">
                            Dry Sabzi Course:
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. Cabbage Sabzi, Shimla Mirch, Aloo Sabzi"
                            value={item.sabzi}
                            onChange={(e) => handleUpdateWeekdayMenu(day, 'sabzi', e.target.value)}
                            className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:border-[#00346f]"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-gray-600 mb-0.5">
                            Notes / Item Description:
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. Fresh spinach dal & tender cabbage sabzi"
                            value={item.description || ''}
                            onChange={(e) => handleUpdateWeekdayMenu(day, 'description', e.target.value)}
                            className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:border-[#00346f]"
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── SECTION 3: 16 OZ A LA CARTE CONTAINERS ── */}
          {activeSection === 'addons' && (
            <div className="space-y-4 animate-fade-in">
              <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-2xl flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-amber-950 flex items-center gap-1.5">
                    <Package className="w-4 h-4 text-amber-700" />
                    <span>Individual Add-Ons &amp; Sides (16 oz Containers)</span>
                  </h4>
                  <p className="text-[11px] text-amber-800 mt-0.5">
                    Customers can order standalone 16 oz tubs of curries, sabzis, paneer, rice and raita.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {aiUpdatedTabs.includes('addons') && (
                    <span className="text-[10px] font-bold px-2.5 py-0.5 bg-amber-600 text-white rounded-full flex items-center gap-1 shadow-2xs">
                      <Sparkles className="w-3 h-3 text-[#ffdea5]" /> Scanned by Gemini
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={handleAddContainer}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-700 hover:bg-amber-800 text-white text-xs font-bold shadow-2xs transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Container</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {containerAddons.map((container, idx) => (
                  <div key={container.id || idx} className="p-4 bg-white rounded-xl border border-gray-250 shadow-2xs space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-gray-900">
                        Container #{idx + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveContainer(idx)}
                        className="text-rose-500 hover:text-rose-700 p-1 rounded hover:bg-rose-50 cursor-pointer"
                        title="Delete container"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <div className="sm:col-span-2">
                        <label className="block text-[10px] font-bold text-gray-600 mb-0.5">Item Name:</label>
                        <input
                          type="text"
                          value={container.name}
                          onChange={(e) => handleUpdateContainer(idx, 'name', e.target.value)}
                          className="w-full px-2.5 py-1.5 text-xs border border-gray-300 rounded-lg focus:border-[#00346f]"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-gray-600 mb-0.5">Price ($):</label>
                        <div className="flex items-center gap-1">
                          <span className="text-xs text-gray-500 font-bold">$</span>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={container.price}
                            onChange={(e) => handleUpdateContainer(idx, 'price', parseFloat(e.target.value) || 0)}
                            className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded-lg focus:border-[#00346f] font-mono font-bold"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-gray-600 mb-0.5">Description:</label>
                      <input
                        type="text"
                        value={container.description}
                        onChange={(e) => handleUpdateContainer(idx, 'description', e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs border border-gray-300 rounded-lg focus:border-[#00346f]"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── SECTION 4: DABBA PRICING ── */}
          {activeSection === 'pricing' && (
            <div className="space-y-4 animate-fade-in">
              <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-2xl flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#00346f] flex items-center gap-1.5">
                    <DollarSign className="w-4 h-4 text-[#775a19]" />
                    <span>Dabba Package Prices (Single, Family &amp; Weekly Plans)</span>
                  </h4>
                  <p className="text-[11px] text-gray-600 mt-0.5">
                    Set the tier prices reflected in the Dabba Options and Daily Homestyle Tiffin sections.
                  </p>
                </div>
                {aiUpdatedTabs.includes('pricing') && (
                  <span className="text-[10px] font-bold px-2.5 py-0.5 bg-indigo-600 text-white rounded-full flex items-center gap-1 shadow-2xs">
                    <Sparkles className="w-3 h-3 text-[#ffdea5]" /> Scanned by Gemini
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Single Dabba */}
                <div className="p-5 bg-white rounded-2xl border border-gray-300 shadow-2xs space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-gray-900">Single Dabba</span>
                    <span className="px-2 py-0.5 bg-gray-100 rounded text-[10px] font-bold uppercase text-gray-600">Serves 1</span>
                  </div>
                  <p className="text-xs text-gray-500">1 cup rice, 1 cup curry, 1/2 cup sabzi, 2 tawa roti.</p>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 mb-1">Unit Price ($):</label>
                    <div className="flex items-center gap-1">
                      <span className="text-sm font-bold text-gray-500">$</span>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={dabbaPricing.singlePrice}
                        onChange={(e) => handleUpdatePricing('singlePrice', parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-xl focus:border-[#00346f] font-mono font-bold"
                      />
                    </div>
                  </div>
                </div>

                {/* Family Dabba */}
                <div className="p-5 bg-white rounded-2xl border border-gray-300 shadow-2xs space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-gray-900">Family Dabba</span>
                    <span className="px-2 py-0.5 bg-[#ffdea5]/40 text-[#775a19] rounded text-[10px] font-bold uppercase">Serves 4</span>
                  </div>
                  <p className="text-xs text-gray-500">4 complete meals: larger family portions of dal, sabzi, 4 cups rice, 8 rotis.</p>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 mb-1">Unit Price ($):</label>
                    <div className="flex items-center gap-1">
                      <span className="text-sm font-bold text-gray-500">$</span>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={dabbaPricing.familyPrice}
                        onChange={(e) => handleUpdatePricing('familyPrice', parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-xl focus:border-[#00346f] font-mono font-bold"
                      />
                    </div>
                  </div>
                </div>

                {/* Weekly Dabba Plan */}
                <div className="p-5 bg-white rounded-2xl border border-gray-300 shadow-2xs space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-gray-900">Weekly Dabba Plan</span>
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded text-[10px] font-bold uppercase">5 Days</span>
                  </div>
                  <p className="text-xs text-gray-500">5-day subscription (Mon–Fri) delivered or picked up daily.</p>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 mb-1">Package Price ($):</label>
                    <div className="flex items-center gap-1">
                      <span className="text-sm font-bold text-gray-500">$</span>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={dabbaPricing.weeklyPrice}
                        onChange={(e) => handleUpdatePricing('weeklyPrice', parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-xl focus:border-[#00346f] font-mono font-bold"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── SECTION 5: SATURDAY / CHEF'S SPECIAL DISHES ── */}
          {activeSection === 'specials' && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex items-center justify-between p-4 bg-purple-50/70 border border-purple-200 rounded-2xl">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-purple-950 flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-purple-700" />
                    <span>Chef's Special Dishes (Max 3 Specials with Unit Pricing)</span>
                  </h4>
                  <p className="text-[11px] text-purple-800 mt-0.5">
                    Handcrafted Saturday specialties with dynamic prices and customer quantity selectors.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {aiUpdatedTabs.includes('specials') && (
                    <span className="text-[10px] font-bold px-2.5 py-0.5 bg-purple-600 text-white rounded-full flex items-center gap-1 shadow-2xs">
                      <Sparkles className="w-3 h-3 text-[#ffdea5]" /> Scanned by Gemini
                    </span>
                  )}
                  {specialDishes.length < 3 && (
                    <button
                      type="button"
                      onClick={handleAddSpecial}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold shadow-2xs transition-colors cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Special Dish ({specialDishes.length}/3)</span>
                    </button>
                  )}
                </div>
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

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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

                        <div>
                          <label className="block text-[10px] font-bold text-gray-600 mb-0.5">Optional Image URL:</label>
                          <input
                            type="text"
                            placeholder="https://example.com/special.jpg"
                            value={dish.imageUrl || ''}
                            onChange={(e) => handleUpdateSpecial(idx, 'imageUrl', e.target.value)}
                            className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:border-purple-600"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

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

        {/* Gemini API Key Configuration Dialog */}
        {showApiKeyModal && (
          <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
            <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 max-w-md w-full p-5 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                <div className="flex items-center gap-2 text-[#00346f]">
                  <Key className="w-5 h-5 text-indigo-600" />
                  <h4 className="font-serif font-bold text-base">Google Gemini API Key</h4>
                </div>
                <button
                  type="button"
                  onClick={() => setShowApiKeyModal(false)}
                  className="p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs text-gray-600 leading-relaxed">
                Enter your Google Gemini API key to enable AI OCR scanning of weekly tiffin flyer images. The key will be safely saved in your kitchen configuration.
              </p>

              <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl flex items-start gap-2.5 text-[11px] text-indigo-900">
                <Sparkles className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Need a free API Key?</span>
                  <p className="mt-0.5 text-indigo-800">
                    Get an instant free Gemini API key in 10 seconds from Google AI Studio.
                  </p>
                  <a
                    href="https://aistudio.google.com/app/apikey"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 font-bold text-indigo-700 hover:text-indigo-900 underline mt-1"
                  >
                    <span>Open Google AI Studio</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

              <form onSubmit={handleSaveApiKey} className="space-y-3">
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 mb-1">
                    API Key:
                  </label>
                  <div className="relative">
                    <input
                      type={showApiKeySecret ? 'text' : 'password'}
                      placeholder="AIzaSy..."
                      value={tempApiKey}
                      onChange={(e) => setTempApiKey(e.target.value)}
                      required
                      className="w-full px-3 py-2 pr-10 text-xs bg-white border border-gray-300 rounded-xl focus:outline-none focus:border-indigo-600 font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowApiKeySecret(!showApiKeySecret)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                    >
                      {showApiKeySecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowApiKeyModal(false);
                      handleLoadDemoData();
                    }}
                    className="text-[11px] text-purple-700 hover:underline font-semibold"
                  >
                    Or use bundled demo data
                  </button>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setShowApiKeyModal(false)}
                      className="px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-100 rounded-xl font-medium cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={!tempApiKey.trim()}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition-colors shadow-sm cursor-pointer disabled:opacity-50"
                    >
                      Save &amp; Scan Now
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
