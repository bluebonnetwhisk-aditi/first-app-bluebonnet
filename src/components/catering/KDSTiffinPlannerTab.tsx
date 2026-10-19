import { useState, useEffect, useMemo } from 'react';
import {
  Sparkles,
  Calendar,
  Award,
  TrendingUp,
  CheckCircle2,
  Plus,
  Trash2,
  Wand2,
  Save,
  Utensils,
  RefreshCw,
  FileEdit,
  Flame,
  Copy,
  Check
} from 'lucide-react';
import type {
  CateringOrder,
  TiffinMenuSettings,
  TiffinSpecialDish,
  WeekdayMenuEntry
} from '../../types/catering';
import {
  fetchTiffinMenuSettings,
  saveTiffinMenuSettings,
  DEFAULT_TIFFIN_SETTINGS,
  DEFAULT_WEEKDAY_MENUS,
  DEFAULT_WEEKEND_FLYER_SPECIALS
} from '../../services/supabase';
import { getCentralTimeNow } from '../../utils/centralTime';
import { classifyOrderItemSegment, normalizeDishName } from './KDSAnalyticsTab';

interface KDSTiffinPlannerTabProps {
  orders: CateringOrder[];
  onOpenFullFlyerModal: () => void;
  onSettingsPublished?: () => void;
}

interface WeekTargetOption {
  key: string;
  label: string;
  shortTitle: string;
  startDate: string;
  endDate: string;
}

interface HistoricalPairCandidate {
  id: string;
  dal: string;
  sabzi: string;
  description: string;
  unitsSold: number;
  revenue: number;
  orderCount: number;
  preferredDay?: string;
  badge: string;
}

interface HistoricalSpecialCandidate {
  id: string;
  title: string;
  price16oz: number;
  price8oz?: number;
  portionSize: string;
  description: string;
  unitsSold: number;
  revenue: number;
  availableDays: string[];
  badge: string;
}

const WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'] as const;

const CURATED_HOMESTYLE_PAIRS: HistoricalPairCandidate[] = [
  {
    id: 'pair-palak-dal',
    dal: 'Palak Dal',
    sabzi: 'Cabbage & Peas Sabzi',
    description: 'Iron-rich tempered spinach dal paired with homestyle cabbage & green peas sabzi',
    unitsSold: 18,
    revenue: 345,
    orderCount: 9,
    preferredDay: 'Monday',
    badge: 'Top Monday Pick'
  },
  {
    id: 'pair-lauki-kofta',
    dal: 'Lauki Kofta Curry',
    sabzi: 'Aloo Shimla Mirch',
    description: 'Soft bottle-gourd koftas in spiced tomato gravy with crisp bell pepper sabzi',
    unitsSold: 22,
    revenue: 420,
    orderCount: 11,
    preferredDay: 'Tuesday',
    badge: 'Fan Favorite'
  },
  {
    id: 'pair-rajma',
    dal: 'Punjabi Rajma Masala',
    sabzi: 'Jeera Aloo Gobhi',
    description: 'Slow-simmered red kidney beans in aromatic masala with roasted cauliflower & potato',
    unitsSold: 29,
    revenue: 560,
    orderCount: 14,
    preferredDay: 'Wednesday',
    badge: '#1 Best Seller'
  },
  {
    id: 'pair-dal-tadka',
    dal: 'Dhaba Dal Tadka',
    sabzi: 'Kurkuri Bhindi Masala',
    description: 'Golden double-tempered yellow dal with pan-roasted spiced okra bhindi',
    unitsSold: 26,
    revenue: 510,
    orderCount: 13,
    preferredDay: 'Thursday',
    badge: 'High Repeat Rate'
  },
  {
    id: 'pair-kala-chana',
    dal: 'Kala Chana Masala',
    sabzi: 'French Beans & Carrot',
    description: 'Protein-packed black chickpea curry with lightly spiced crunchy green beans',
    unitsSold: 19,
    revenue: 375,
    orderCount: 9,
    preferredDay: 'Friday',
    badge: 'Friday Classic'
  },
  {
    id: 'pair-kadhi-pakora',
    dal: 'Homestyle Kadhi Pakora',
    sabzi: 'Aloo Methi Dry',
    description: 'Tangy slow-cooked yogurt curry with soft gram-flour pakoras & fenugreek potatoes',
    unitsSold: 24,
    revenue: 465,
    orderCount: 12,
    badge: 'Satvik Favorite'
  },
  {
    id: 'pair-chole-masala',
    dal: 'Pindi Chole Masala',
    sabzi: 'Baingan Bharta / Mix Veg',
    description: 'Authentic spiced chickpea curry paired with smoky seasonal vegetable sabzi',
    unitsSold: 25,
    revenue: 490,
    orderCount: 12,
    badge: 'High Catering Demand'
  },
  {
    id: 'pair-dal-makhani',
    dal: 'Creamy Dal Makhani',
    sabzi: 'Paneer Bhurji / Mix Veg',
    description: 'Slow-cooked black lentils finished with cream alongside spiced cottage cheese sabzi',
    unitsSold: 31,
    revenue: 615,
    orderCount: 15,
    badge: 'Top Revenue Driver'
  }
];

const CURATED_WEEKEND_SPECIALS: HistoricalSpecialCandidate[] = [
  {
    id: 'cand-dal-makhni',
    title: 'Dal Makhni (16 oz)',
    price16oz: 9.99,
    portionSize: '16oz',
    description: 'Slow-simmered black lentils and kidney beans finished with butter and cream.',
    unitsSold: 34,
    revenue: 339.66,
    availableDays: ['Saturday'],
    badge: '#1 Weekend Tub'
  },
  {
    id: 'cand-paneer-lababdar',
    title: 'Paneer Lababdar (16 oz)',
    price16oz: 13.99,
    portionSize: '16oz',
    description: 'Soft paneer cubes in luscious Mughlai tomato-cashew gravy.',
    unitsSold: 28,
    revenue: 391.72,
    availableDays: ['Saturday'],
    badge: 'Top Revenue Tub'
  },
  {
    id: 'cand-aaloo-bhaji-puri',
    title: 'Halwai-Style Aaloo Bhaji + Puri',
    price16oz: 9.99,
    portionSize: 'Plate / Meal',
    description: 'Traditional Halwai-style spiced potato curry served with freshly fried fluffy puris.',
    unitsSold: 26,
    revenue: 259.74,
    availableDays: ['Sunday'],
    badge: 'Sunday Best Seller'
  },
  {
    id: 'cand-bhayankar-deal',
    title: 'Bhayankar Tasty Deal!',
    price16oz: 20.00,
    portionSize: '8 oz Aaloo Bhaji + 3 Pooris + 8 oz Kheer',
    description: 'Special Sunday Feast Combo: 8 oz Aaloo Bhaji + 3 Pooris + 8 oz Slow-Cooked Kheer.',
    unitsSold: 19,
    revenue: 380.00,
    availableDays: ['Sunday'],
    badge: 'Highest AOV Combo'
  },
  {
    id: 'cand-slow-kheer',
    title: 'Slow-Cooked Kheer',
    price16oz: 20.00,
    price8oz: 13.00,
    portionSize: '16oz / 8oz',
    description: 'Traditional slow-cooked fragrant rice and milk pudding with cardamom, saffron & dry fruits.',
    unitsSold: 17,
    revenue: 295.00,
    availableDays: ['Sunday'],
    badge: 'Top Dessert Tub'
  },
  {
    id: 'cand-samosa-chaat',
    title: 'Samosa Chaat',
    price16oz: 6.00,
    portionSize: '2 samosas per box',
    description: '2 crisp samosas layered with spiced chole, cooling yogurt, tamarind & mint chutneys.',
    unitsSold: 30,
    revenue: 180.00,
    availableDays: ['Saturday'],
    badge: 'High Volume Snack'
  },
  {
    id: 'cand-paani-puri',
    title: 'Paani Puri for Two',
    price16oz: 9.99,
    portionSize: '10 puris total (5 each)',
    description: 'Crisp puris served with spiced potato-sprout filling, teekha paani & meetha paani.',
    unitsSold: 22,
    revenue: 219.78,
    availableDays: ['Saturday', 'Sunday'],
    badge: 'Weekend Street Hit'
  },
  {
    id: 'cand-moong-halwa',
    title: 'Satvik Moong Dal Halwa',
    price16oz: 18.00,
    price8oz: 10.00,
    portionSize: '16oz / 8oz',
    description: 'Rich slow-roasted yellow lentil pudding in pure Desi Ghee with saffron & almonds.',
    unitsSold: 15,
    revenue: 255.00,
    availableDays: ['Saturday', 'Sunday'],
    badge: 'Premium Sweet'
  }
];

export default function KDSTiffinPlannerTab({
  orders,
  onOpenFullFlyerModal,
  onSettingsPublished
}: KDSTiffinPlannerTabProps) {
  const [settings, setSettings] = useState<TiffinMenuSettings>(DEFAULT_TIFFIN_SETTINGS);
  const [weekOptions, setWeekOptions] = useState<WeekTargetOption[]>([]);
  const [selectedWeekKey, setSelectedWeekKey] = useState<string>('');
  const [weekTitle, setWeekTitle] = useState<string>('');
  const [weekdayMenus, setWeekdayMenus] = useState<Record<string, WeekdayMenuEntry>>(DEFAULT_WEEKDAY_MENUS);
  const [specialDishes, setSpecialDishes] = useState<TiffinSpecialDish[]>(DEFAULT_WEEKEND_FLYER_SPECIALS);
  const [activeDaySlot, setActiveDaySlot] = useState<string>('Monday');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [copiedWhatsApp, setCopiedWhatsApp] = useState(false);

  // Load current settings and generate upcoming weeks (defaulting to NEXT week for planning ahead)
  useEffect(() => {
    const { nowDate } = getCentralTimeNow();
    const curDay = nowDate.getDay();
    const mondayOffset = curDay === 0 ? 1 : (1 - curDay);
    const baseMon = new Date(nowDate.getFullYear(), nowDate.getMonth(), nowDate.getDate() + mondayOffset);
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const monthShorts = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    const opts: WeekTargetOption[] = [];
    for (let w = 0; w < 6; w++) {
      const mon = new Date(baseMon.getFullYear(), baseMon.getMonth(), baseMon.getDate() + w * 7);
      const sat = new Date(mon.getFullYear(), mon.getMonth(), mon.getDate() + 5);
      const sun = new Date(mon.getFullYear(), mon.getMonth(), mon.getDate() + 6);
      const mStart = `${mon.getFullYear()}-${String(mon.getMonth() + 1).padStart(2, '0')}-${String(mon.getDate()).padStart(2, '0')}`;
      const mEnd = `${sun.getFullYear()}-${String(sun.getMonth() + 1).padStart(2, '0')}-${String(sun.getDate()).padStart(2, '0')}`;

      const shortTitle = mon.getMonth() === sat.getMonth()
        ? `${monthNames[mon.getMonth()]} ${mon.getDate()} - ${sat.getDate()}`
        : `${monthShorts[mon.getMonth()]} ${mon.getDate()} - ${monthShorts[sat.getMonth()]} ${sat.getDate()}`;

      const prefix = w === 0 ? 'Current Week' : w === 1 ? 'Next Week (Recommended)' : `In ${w} Weeks`;
      opts.push({
        key: mStart,
        label: `${prefix}: ${monthShorts[mon.getMonth()]} ${mon.getDate()} – ${monthShorts[sun.getMonth()]} ${sun.getDate()}`,
        shortTitle,
        startDate: mStart,
        endDate: mEnd
      });
    }
    setWeekOptions(opts);

    fetchTiffinMenuSettings().then(data => {
      setSettings(data);
      setWeekdayMenus({ ...DEFAULT_WEEKDAY_MENUS, ...(data.weekdayMenus || {}) });
      setSpecialDishes(data.specialDishes?.length ? data.specialDishes : DEFAULT_WEEKEND_FLYER_SPECIALS);

      // Default to current configured week or Next Week
      const matchedOpt = opts.find(o => o.key === data.weekStartDate) || opts[1] || opts[0];
      if (matchedOpt) {
        setSelectedWeekKey(matchedOpt.key);
        setWeekTitle(data.weekTitle || matchedOpt.shortTitle);
      }
    });
  }, []);

  // Mine historical orders to boost and rank weekday Dal+Sabzi pairs & Weekend Specials
  const { rankedWeekdayPairs, rankedWeekendSpecials, historicalSummary } = useMemo(() => {
    const validOrders = orders.filter(o => o.status !== 'cancelled' && !o.is_cancelled);

    const pairMap = new Map<string, HistoricalPairCandidate>();
    CURATED_HOMESTYLE_PAIRS.forEach(p => {
      pairMap.set(`${p.dal.toLowerCase()}|${p.sabzi.toLowerCase()}`, { ...p });
    });

    const specialMap = new Map<string, HistoricalSpecialCandidate>();
    CURATED_WEEKEND_SPECIALS.forEach(s => {
      specialMap.set(s.title.toLowerCase(), { ...s });
    });

    let totalTiffinUnits = 0;
    let totalTiffinRevenue = 0;
    let totalSpecialUnits = 0;

    validOrders.forEach(order => {
      (order.items || []).forEach(item => {
        const seg = classifyOrderItemSegment(item);
        const qty = item.quantity || 1;
        const rev = item.totalPrice || (item.unitPrice || 0) * qty;

        if (seg === 'tiffin') {
          totalTiffinUnits += qty;
          totalTiffinRevenue += rev;

          // Extract Dal + Sabzi from item notes if present (e.g. "Menu: Palak Dal + Cabbage Sabzi")
          const menuMatch = (item.notes || '').match(/Menu[^:]*:\s*([^+(]+?)\s*(?:\+|&)\s*([^(\n]+)/i);
          if (menuMatch) {
            const dalName = menuMatch[1].trim();
            const sabziName = menuMatch[2].trim();
            const key = `${dalName.toLowerCase()}|${sabziName.toLowerCase()}`;
            const existing = pairMap.get(key);
            if (existing) {
              existing.unitsSold += qty * 5;
              existing.revenue += rev;
              existing.orderCount += 1;
            } else if (dalName && sabziName) {
              pairMap.set(key, {
                id: `hist-${key}`,
                dal: dalName,
                sabzi: sabziName,
                description: `Fresh homestyle ${dalName} paired with seasonal ${sabziName}`,
                unitsSold: qty * 4,
                revenue: rev,
                orderCount: 1,
                badge: 'Ordered in Live History'
              });
            }
          }

          // Check if it's a weekend/chef special
          const isSpecial =
            (item.menuItemId || '').includes('special') ||
            (item.categoryLabel || '').toLowerCase().includes('special') ||
            item.selectionType === 'container_8oz' ||
            item.selectionType === 'container_16oz';

          if (isSpecial) {
            totalSpecialUnits += qty;
            const cleanTitle = normalizeDishName(item.name).replace(/\s*\((?:8oz|16oz)\s*Tub\)/i, '').trim();
            const sKey = cleanTitle.toLowerCase();
            const existingSpec = specialMap.get(sKey);
            if (existingSpec) {
              existingSpec.unitsSold += qty * 3;
              existingSpec.revenue += rev;
            } else {
              specialMap.set(sKey, {
                id: `hist-spec-${sKey.replace(/[^a-z0-9]/g, '-')}`,
                title: cleanTitle,
                price16oz: item.unitPrice || 13.99,
                portionSize: item.selectionType === 'container_8oz' ? '8oz / 16oz' : '16oz',
                description: item.notes || `Popular chef special ${cleanTitle}`,
                unitsSold: qty * 3,
                revenue: rev,
                availableDays: ['Saturday', 'Sunday'],
                badge: 'Customer Ordered Special'
              });
            }
          }
        } else if (seg === 'catering') {
          // Also boost pairs that match popular catering curries/sabzis
          const cleanDish = normalizeDishName(item.name).toLowerCase();
          pairMap.forEach(pair => {
            if (
              pair.dal.toLowerCase().includes(cleanDish) ||
              pair.sabzi.toLowerCase().includes(cleanDish)
            ) {
              pair.unitsSold += qty * 2;
              pair.revenue += rev * 0.5;
            }
          });
        }
      });
    });

    const sortedPairs = Array.from(pairMap.values()).sort(
      (a, b) => b.revenue - a.revenue || b.unitsSold - a.unitsSold
    );
    const sortedSpecials = Array.from(specialMap.values()).sort(
      (a, b) => b.revenue - a.revenue || b.unitsSold - a.unitsSold
    );

    return {
      rankedWeekdayPairs: sortedPairs,
      rankedWeekendSpecials: sortedSpecials,
      historicalSummary: {
        totalTiffinUnits,
        totalTiffinRevenue,
        totalSpecialUnits,
        topPair: sortedPairs[0] || null,
        topSpecial: sortedSpecials[0] || null
      }
    };
  }, [orders]);

  // Apply a recommended Dal + Sabzi pair to the currently active weekday slot
  const handleApplyPairToDay = (pair: HistoricalPairCandidate, targetDay: string = activeDaySlot) => {
    setWeekdayMenus(prev => ({
      ...prev,
      [targetDay]: {
        dal: pair.dal,
        sabzi: pair.sabzi,
        description: pair.description
      }
    }));

    // Auto-advance to the next weekday slot for rapid 1-tap planning
    const curIdx = WEEKDAYS.indexOf(targetDay as any);
    if (curIdx >= 0 && curIdx < WEEKDAYS.length - 1) {
      setActiveDaySlot(WEEKDAYS[curIdx + 1]);
    }
  };

  // Auto-Fill Entire Mon–Fri Rotation from Top 5 Best-Selling Historical Pairs
  const handleAutoFillBestSellers = () => {
    const updated = { ...weekdayMenus };
    const usedIds = new Set<string>();

    WEEKDAYS.forEach(day => {
      // First try a top seller with matching preferredDay, else next highest seller
      const preferred = rankedWeekdayPairs.find(p => p.preferredDay === day && !usedIds.has(p.id));
      const chosen = preferred || rankedWeekdayPairs.find(p => !usedIds.has(p.id));
      if (chosen) {
        usedIds.add(chosen.id);
        updated[day] = {
          dal: chosen.dal,
          sabzi: chosen.sabzi,
          description: chosen.description
        };
      }
    });

    setWeekdayMenus(updated);
  };

  // Toggle or add a recommended Weekend Special into the active specials lineup
  const isSpecialInLineup = (cand: HistoricalSpecialCandidate) => {
    return specialDishes.some(s => s.title.toLowerCase() === cand.title.toLowerCase());
  };

  const handleToggleSpecialCandidate = (cand: HistoricalSpecialCandidate) => {
    const exists = isSpecialInLineup(cand);
    if (exists) {
      setSpecialDishes(prev => prev.filter(s => s.title.toLowerCase() !== cand.title.toLowerCase()));
    } else {
      const newDish: TiffinSpecialDish = {
        id: `planned-spec-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        title: cand.title,
        price: cand.price16oz,
        price16oz: cand.price16oz,
        price8oz: cand.price8oz,
        portionSize: cand.portionSize,
        description: cand.description,
        imageUrl: '',
        availableDays: cand.availableDays
      };
      setSpecialDishes(prev => [...prev, newDish]);
    }
  };

  const handleUpdateSpecialPrice = (id: string, field: 'price16oz' | 'price8oz', val: number) => {
    setSpecialDishes(prev =>
      prev.map(s => {
        if (s.id !== id) return s;
        if (field === 'price16oz') {
          return { ...s, price: val, price16oz: val };
        }
        return { ...s, price8oz: val > 0 ? val : undefined };
      })
    );
  };

  const handleToggleSpecialDay = (id: string, dayName: string) => {
    setSpecialDishes(prev =>
      prev.map(s => {
        if (s.id !== id) return s;
        const currentDays = s.availableDays && s.availableDays.length > 0 ? s.availableDays : ['Saturday', 'Sunday'];
        const nextDays = currentDays.includes(dayName)
          ? currentDays.filter(d => d !== dayName)
          : [...currentDays, dayName];
        return { ...s, availableDays: nextDays.length > 0 ? nextDays : ['Saturday'] };
      })
    );
  };

  const handleRemoveSpecial = (id: string) => {
    setSpecialDishes(prev => prev.filter(s => s.id !== id));
  };

  // Publish Planned Menu to Live Website & Supabase
  const handlePublishMenuPlan = async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      const updatedSettings: TiffinMenuSettings = {
        ...settings,
        weekStartDate: selectedWeekKey,
        weekTitle: weekTitle.trim() || settings.weekTitle,
        weekdayMenus,
        specialDishes
      };
      await saveTiffinMenuSettings(updatedSettings);
      setSettings(updatedSettings);
      setSaveSuccess(true);
      if (onSettingsPublished) onSettingsPublished();
      setTimeout(() => setSaveSuccess(false), 4000);
    } finally {
      setIsSaving(false);
    }
  };

  // Copy WhatsApp Broadcast Text for Customers
  const handleCopyWhatsAppAnnouncement = () => {
    const weekdayLines = WEEKDAYS.map(
      day => `• *${day.slice(0, 3)}:* ${weekdayMenus[day]?.dal || 'TBD'} + ${weekdayMenus[day]?.sabzi || 'TBD'}`
    ).join('\n');

    const specialLines = specialDishes
      .map(s => {
        const p16 = s.price16oz || s.price || 0;
        const p8 = s.price8oz ? ` (8oz: $${s.price8oz.toFixed(2)})` : '';
        const days = (s.availableDays || ['Sat', 'Sun']).map(d => d.slice(0, 3)).join('/');
        return `• *${s.title}* [${days}] — $${p16.toFixed(2)}${p8}`;
      })
      .join('\n');

    const text =
      `🍱 *DESI DABBA WEEKLY TIFFIN & SPECIALS (${weekTitle})* 🍱\n` +
      `Freshly cooked homestyle meals • Zero preservatives!\n\n` +
      `*📅 MON–FRI DAILY TIFFIN MENU:*\n${weekdayLines}\n\n` +
      `*🌟 WEEKEND & CHEF SPECIALS:*\n${specialLines || '• Dropping soon!'}\n\n` +
      `👉 *Order online at:* https://bluebonnetwhisk.com/#catering`;

    navigator.clipboard.writeText(text);
    setCopiedWhatsApp(true);
    setTimeout(() => setCopiedWhatsApp(false), 3000);
  };

  return (
    <div className="space-y-4 animate-fade-in">
      {/* ── 1. TOP COMMAND BAR: TARGET WEEK + AUTO-FILL + PUBLISH ── */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-600" />
            <h2 className="font-serif text-lg sm:text-xl font-bold text-[#00346f]">
              Smart Menu Planner — Next Week Tiffin &amp; Weekend Specials
            </h2>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            Curate your upcoming Mon–Fri Dabba rotation and Sat/Sun Specials powered by historical top-selling dishes.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Week Selector */}
          <div className="inline-flex items-center gap-1.5 bg-blue-50/70 border border-blue-200 rounded-xl px-3 py-2">
            <Calendar className="w-4 h-4 text-[#00346f] shrink-0" />
            <select
              value={selectedWeekKey}
              onChange={e => {
                const key = e.target.value;
                setSelectedWeekKey(key);
                const opt = weekOptions.find(o => o.key === key);
                if (opt) setWeekTitle(opt.shortTitle);
              }}
              className="bg-transparent text-xs font-extrabold text-[#00346f] focus:outline-none cursor-pointer"
            >
              {weekOptions.map(opt => (
                <option key={opt.key} value={opt.key}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={handleCopyWhatsAppAnnouncement}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 text-xs font-bold transition cursor-pointer min-h-[38px]"
            title="Copy formatted menu announcement for WhatsApp broadcast"
          >
            {copiedWhatsApp ? <Check className="w-3.5 h-3.5 text-emerald-700" /> : <Copy className="w-3.5 h-3.5 text-emerald-700" />}
            <span>{copiedWhatsApp ? 'Copied for WhatsApp!' : 'Copy WhatsApp Menu'}</span>
          </button>

          <button
            type="button"
            onClick={onOpenFullFlyerModal}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-purple-300 bg-purple-50 hover:bg-purple-100 text-purple-900 text-xs font-bold transition cursor-pointer min-h-[38px]"
          >
            <FileEdit className="w-3.5 h-3.5 text-purple-700" />
            <span>Flyer &amp; Pricing Studio</span>
          </button>

          <button
            type="button"
            onClick={handlePublishMenuPlan}
            disabled={isSaving}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#00346f] hover:bg-[#00224d] text-white text-xs font-extrabold uppercase tracking-wider shadow-sm transition cursor-pointer min-h-[38px] disabled:opacity-50"
          >
            {isSaving ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#ffdea5]" />
            ) : saveSuccess ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <Save className="w-3.5 h-3.5 text-[#ffdea5]" />
            )}
            <span>{isSaving ? 'Publishing...' : saveSuccess ? 'Published Live!' : 'Publish Menu to Website'}</span>
          </button>
        </div>
      </div>

      {/* ── 2. HISTORICAL INSIGHTS STRIP (TOP PERFORMERS SUMMARY) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-gradient-to-br from-amber-50 to-orange-50/70 border border-amber-200/80 rounded-2xl p-3.5 flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-500 text-white shrink-0">
            <Award className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-900 block">
              #1 Best-Selling Weekday Combo
            </span>
            <span className="font-serif font-bold text-sm text-gray-900 truncate block">
              {historicalSummary.topPair
                ? `${historicalSummary.topPair.dal} + ${historicalSummary.topPair.sabzi}`
                : 'Rajma Masala + Aloo Gobhi'}
            </span>
            <span className="text-[11px] text-amber-800 font-semibold">
              {historicalSummary.topPair
                ? `${historicalSummary.topPair.unitsSold} meals • $${historicalSummary.topPair.revenue.toFixed(0)} rev`
                : 'High repeat weekly demand'}
            </span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-indigo-50/70 border border-purple-200/80 rounded-2xl p-3.5 flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-purple-700 text-white shrink-0">
            <Flame className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-purple-900 block">
              #1 Weekend Special Winner
            </span>
            <span className="font-serif font-bold text-sm text-gray-900 truncate block">
              {historicalSummary.topSpecial ? historicalSummary.topSpecial.title : 'Paneer Lababdar (16 oz)'}
            </span>
            <span className="text-[11px] text-purple-800 font-semibold">
              {historicalSummary.topSpecial
                ? `${historicalSummary.topSpecial.unitsSold} tubs • $${historicalSummary.topSpecial.revenue.toFixed(0)} rev`
                : 'Top weekend special'}
            </span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-emerald-50 to-teal-50/70 border border-emerald-200/80 rounded-2xl p-3.5 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-900 block">
              1-Click Smart Rotation
            </span>
            <span className="font-serif font-bold text-sm text-gray-900 block">
              Auto-Fill Mon–Fri Best Sellers
            </span>
            <span className="text-[11px] text-emerald-800">
              Populates all 5 weekdays with top pairs
            </span>
          </div>
          <button
            type="button"
            onClick={handleAutoFillBestSellers}
            className="px-3 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-extrabold flex items-center gap-1.5 shrink-0 cursor-pointer shadow-xs transition"
          >
            <Wand2 className="w-3.5 h-3.5 text-[#ffdea5]" />
            <span>Auto-Fill</span>
          </button>
        </div>
      </div>

      {/* ── 3. SPLIT WORKSPACE: WEEKDAY DABBA PLANNER (LEFT) + WEEKEND SPECIALS PLANNER (RIGHT) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* LEFT 7 COLS: MON–FRI HOMESTYLE DABBA PLANNER */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-gray-200 p-4 shadow-xs space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-gray-150">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-800 block">
                  PART 1 • MON–FRI DAILY TIFFIN ROTATION
                </span>
                <h3 className="font-serif font-bold text-base text-[#00346f]">
                  Next Week&apos;s 5-Day Homestyle Menu ({weekTitle})
                </h3>
              </div>
              <span className="text-[11px] text-gray-500 font-medium">
                Tap a day slot below, then click any Best-Seller below to assign
              </span>
            </div>

            {/* 5-Day Interactive Schedule Slots */}
            <div className="space-y-2">
              {WEEKDAYS.map(day => {
                const isSelectedSlot = activeDaySlot === day;
                const entry = weekdayMenus[day] || { dal: '', sabzi: '', description: '' };

                return (
                  <div
                    key={day}
                    onClick={() => setActiveDaySlot(day)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer ${
                      isSelectedSlot
                        ? 'border-[#00346f] bg-blue-50/40 ring-2 ring-[#00346f]/15'
                        : 'border-gray-200 hover:border-gray-300 bg-gray-50/50'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2 shrink-0">
                        <span
                          className={`px-2.5 py-1 rounded-lg text-xs font-extrabold uppercase tracking-wider w-24 text-center ${
                            isSelectedSlot
                              ? 'bg-[#00346f] text-white'
                              : 'bg-white border border-gray-200 text-gray-700'
                          }`}
                        >
                          {day.slice(0, 3)}
                        </span>
                        {isSelectedSlot && (
                          <span className="text-[10px] font-extrabold text-[#00346f] bg-blue-100 px-2 py-0.5 rounded-full">
                            Editing Slot
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 flex-1">
                        <div>
                          <label className="text-[9px] font-bold uppercase text-gray-400 block">
                            Dal / Main Curry
                          </label>
                          <input
                            type="text"
                            value={entry.dal}
                            onChange={e =>
                              setWeekdayMenus(prev => ({
                                ...prev,
                                [day]: { ...prev[day], dal: e.target.value }
                              }))
                            }
                            placeholder="e.g. Palak Dal"
                            className="w-full px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-bold text-gray-900 focus:outline-none focus:border-[#00346f]"
                          />
                        </div>
                        <div>
                          <label className="text-[9px] font-bold uppercase text-gray-400 block">
                            Seasonal Dry Sabzi
                          </label>
                          <input
                            type="text"
                            value={entry.sabzi}
                            onChange={e =>
                              setWeekdayMenus(prev => ({
                                ...prev,
                                [day]: { ...prev[day], sabzi: e.target.value }
                              }))
                            }
                            placeholder="e.g. Aloo Gobhi"
                            className="w-full px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-bold text-gray-900 focus:outline-none focus:border-[#00346f]"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Historical Top-Selling Dal + Sabzi Suggestions Bank */}
            <div className="pt-2">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-gray-600 flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Top-Selling Past Combos — Tap to Assign to {activeDaySlot}:</span>
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-60 overflow-y-auto pr-1">
                {rankedWeekdayPairs.map(pair => {
                  const isAssigned = WEEKDAYS.some(
                    d =>
                      weekdayMenus[d]?.dal?.toLowerCase() === pair.dal.toLowerCase() &&
                      weekdayMenus[d]?.sabzi?.toLowerCase() === pair.sabzi.toLowerCase()
                  );

                  return (
                    <div
                      key={pair.id}
                      onClick={() => handleApplyPairToDay(pair, activeDaySlot)}
                      className={`p-2.5 rounded-xl border text-left transition cursor-pointer flex items-center justify-between gap-2 ${
                        isAssigned
                          ? 'bg-emerald-50/70 border-emerald-300'
                          : 'bg-gray-50 hover:bg-blue-50/50 border-gray-200 hover:border-blue-300'
                      }`}
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded bg-amber-100 text-amber-900">
                            {pair.badge}
                          </span>
                          <span className="text-[10px] font-mono font-bold text-emerald-700">
                            ${pair.revenue.toFixed(0)} • {pair.unitsSold}u
                          </span>
                        </div>
                        <span className="text-xs font-bold text-gray-900 block truncate mt-0.5">
                          {pair.dal} + {pair.sabzi}
                        </span>
                      </div>

                      <span
                        className={`px-2 py-1 rounded-lg text-[10px] font-extrabold shrink-0 ${
                          isAssigned
                            ? 'bg-emerald-600 text-white'
                            : 'bg-[#00346f] text-white'
                        }`}
                      >
                        {isAssigned ? 'Assigned' : `+ ${activeDaySlot.slice(0, 3)}`}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT 5 COLS: WEEKEND & CHEF SPECIALS PLANNER */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-gray-200 p-4 shadow-xs space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="pb-2.5 border-b border-gray-150 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-purple-800 block">
                  PART 2 • SAT &amp; SUN SPECIALS LINEUP
                </span>
                <h3 className="font-serif font-bold text-base text-[#00346f]">
                  Weekend Specials ({specialDishes.length} Active)
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  const newDish: TiffinSpecialDish = {
                    id: `custom-spec-${Date.now()}`,
                    title: 'New Weekend Special',
                    price: 13.99,
                    price16oz: 13.99,
                    portionSize: '16oz',
                    description: 'Freshly prepared weekend special recipe.',
                    imageUrl: '',
                    availableDays: ['Saturday', 'Sunday']
                  };
                  setSpecialDishes(prev => [newDish, ...prev]);
                }}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white text-[11px] font-bold cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Custom</span>
              </button>
            </div>

            {/* Active Planned Specials List */}
            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {specialDishes.length === 0 ? (
                <div className="py-6 text-center text-xs text-gray-400 italic bg-gray-50 rounded-xl border border-dashed border-gray-200">
                  No weekend specials selected. Tap any top-selling special below to add it!
                </div>
              ) : (
                specialDishes.map(spec => {
                  const days = spec.availableDays && spec.availableDays.length > 0 ? spec.availableDays : ['Saturday', 'Sunday'];
                  return (
                    <div
                      key={spec.id}
                      className="p-2.5 rounded-xl border border-purple-200 bg-purple-50/30 space-y-2"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <input
                          type="text"
                          value={spec.title}
                          onChange={e =>
                            setSpecialDishes(prev =>
                              prev.map(s => (s.id === spec.id ? { ...s, title: e.target.value } : s))
                            )
                          }
                          className="font-bold text-xs text-gray-900 bg-white border border-gray-200 rounded-lg px-2 py-1 flex-1 focus:outline-none focus:border-purple-600"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveSpecial(spec.id)}
                          className="p-1 text-gray-400 hover:text-rose-600 cursor-pointer"
                          title="Remove special"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-2 text-[11px]">
                        <div className="flex items-center gap-2">
                          <label className="flex items-center gap-1 text-gray-600 font-semibold">
                            <span>16oz/Base $:</span>
                            <input
                              type="number"
                              step="0.50"
                              value={spec.price16oz ?? spec.price ?? 0}
                              onChange={e => handleUpdateSpecialPrice(spec.id, 'price16oz', parseFloat(e.target.value) || 0)}
                              className="w-16 px-1.5 py-0.5 bg-white border border-gray-200 rounded font-mono font-bold text-gray-900"
                            />
                          </label>
                          <label className="flex items-center gap-1 text-gray-600 font-semibold">
                            <span>8oz $:</span>
                            <input
                              type="number"
                              step="0.50"
                              placeholder="Opt"
                              value={spec.price8oz ?? ''}
                              onChange={e => handleUpdateSpecialPrice(spec.id, 'price8oz', parseFloat(e.target.value) || 0)}
                              className="w-14 px-1.5 py-0.5 bg-white border border-gray-200 rounded font-mono font-bold text-gray-900"
                            />
                          </label>
                        </div>

                        <div className="flex items-center gap-1">
                          {['Saturday', 'Sunday'].map(dName => {
                            const active = days.includes(dName);
                            return (
                              <button
                                key={dName}
                                type="button"
                                onClick={() => handleToggleSpecialDay(spec.id, dName)}
                                className={`px-2 py-0.5 rounded text-[10px] font-extrabold cursor-pointer transition ${
                                  active
                                    ? 'bg-purple-700 text-white'
                                    : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                                }`}
                              >
                                {dName.slice(0, 3)}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Historical Top-Selling Weekend Specials Bank */}
            <div className="pt-2">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-gray-600 flex items-center gap-1.5 mb-2">
                <Utensils className="w-3.5 h-3.5 text-purple-700" />
                <span>Past Top-Selling Specials — 1-Tap Add/Remove:</span>
              </span>

              <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                {rankedWeekendSpecials.map(cand => {
                  const active = isSpecialInLineup(cand);
                  return (
                    <div
                      key={cand.id}
                      onClick={() => handleToggleSpecialCandidate(cand)}
                      className={`p-2.5 rounded-xl border transition cursor-pointer flex items-center justify-between gap-2 ${
                        active
                          ? 'bg-purple-50 border-purple-300'
                          : 'bg-gray-50 hover:bg-purple-50/40 border-gray-200'
                      }`}
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded bg-purple-100 text-purple-900">
                            {cand.badge}
                          </span>
                          <span className="text-[10px] font-mono font-bold text-gray-600">
                            ${cand.price16oz.toFixed(2)} • Sold {cand.unitsSold}
                          </span>
                        </div>
                        <span className="text-xs font-bold text-gray-900 block truncate mt-0.5">
                          {cand.title}
                        </span>
                      </div>

                      <span
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold shrink-0 ${
                          active
                            ? 'bg-emerald-600 text-white'
                            : 'bg-purple-700 text-white'
                        }`}
                      >
                        {active ? '✓ In Lineup' : '+ Add'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
