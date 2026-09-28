import { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { 
  Plus, 
  Minus, 
  ShoppingBag, 
  Sparkles, 
  Check, 
  AlertCircle, 
  X, 
  Utensils, 
  Flame, 
  ArrowRight, 
  FileText,
  Calendar,
  Layers
} from 'lucide-react';
import type { CartItem, MenuItem, TiffinSpecialDish, TiffinMenuSettings } from '../../types/catering';
import { getCentralTimeNow } from '../../utils/centralTime';
import { 
  fetchTiffinMenuSettings, 
  fetchCalendarBlackouts,
  getCurrentMondayStr,
  getCurrentMondayTitle,
  DEFAULT_TIFFIN_SETTINGS, 
  DEFAULT_WEEKDAY_MENUS, 
  DEFAULT_DABBA_PRICING 
} from '../../services/supabase';

interface TiffinOrderViewProps {
  cart: CartItem[];
  onUpdateCartItem: (
    menuItem: MenuItem,
    selectionType: any,
    quantity: number,
    selectionLabel: string,
    unitPrice: number,
    customNotes?: string
  ) => void;
  onRemoveCartItem?: (cartItemId: string) => void;
  onProceedToCheckout?: () => void;
}

interface DaySchedule {
  dayName: string; // "Monday", "Tuesday", etc.
  dateStr: string; // "YYYY-MM-DD"
  displayDate: string; // "Sep 22"
  dalOrCurry: string;
  sabzi: string;
  description?: string;
  isSaturdaySpecial?: boolean;
  isSundayClosed?: boolean;
  isSelectable: boolean;
  statusLabel?: string;
}

export default function TiffinOrderView({
  cart,
  onUpdateCartItem,
  onRemoveCartItem,
  onProceedToCheckout
}: TiffinOrderViewProps) {
  const [settings, setSettings] = useState<TiffinMenuSettings>(DEFAULT_TIFFIN_SETTINGS);
  const [blackoutDates, setBlackoutDates] = useState<string[]>([]);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  
  // Primary Navigation Tab: 'meals' (Daily & Weekly Dabbas) vs 'alacarte' (Dynamic Tubs & Extras)
  const [activeTab, setActiveTab] = useState<'meals' | 'alacarte'>('meals');

  // Unified Date Controller State
  const [selectedWeekId, setSelectedWeekId] = useState<string>('');
  const [selectedDayTab, setSelectedDayTab] = useState<string>('');

  // Quantities
  const [weeklyQty, setWeeklyQty] = useState<number>(1);
  const [singleQuantities, setSingleQuantities] = useState<Record<string, number>>({});
  const [familyQuantities, setFamilyQuantities] = useState<Record<string, number>>({});
  const [specialQuantities, setSpecialQuantities] = useState<Record<string, number>>({});
  const [addonQtyState, setAddonQtyState] = useState<Record<string, number>>({});
  const [addedAlert, setAddedAlert] = useState<string | null>(null);

  // Dynamic pricing from settings or flyer defaults
  const singlePrice = settings.dabbaPricing?.singlePrice || DEFAULT_DABBA_PRICING.singlePrice;
  const familyPrice = settings.dabbaPricing?.familyPrice || DEFAULT_DABBA_PRICING.familyPrice;
  const weeklyPrice = settings.dabbaPricing?.weeklyPrice || DEFAULT_DABBA_PRICING.weeklyPrice;

  const getSingleQty = (dateStr: string) => singleQuantities[dateStr] || 1;
  const updateSingleQty = (dateStr: string, delta: number) => {
    setSingleQuantities(prev => ({
      ...prev,
      [dateStr]: Math.max(1, (prev[dateStr] || 1) + delta)
    }));
  };

  const getFamilyQty = (dateStr: string) => familyQuantities[dateStr] || 1;
  const updateFamilyQty = (dateStr: string, delta: number) => {
    setFamilyQuantities(prev => ({
      ...prev,
      [dateStr]: Math.max(1, (prev[dateStr] || 1) + delta)
    }));
  };

  const getSpecialQty = (dishId: string) => specialQuantities[dishId] || 1;
  const updateSpecialQty = (dishId: string, delta: number) => {
    setSpecialQuantities(prev => ({
      ...prev,
      [dishId]: Math.max(1, (prev[dishId] || 1) + delta)
    }));
  };

  const getAddonQty = (id: string) => addonQtyState[id] || 1;
  const updateAddonQty = (id: string, delta: number) => {
    setAddonQtyState(prev => ({
      ...prev,
      [id]: Math.max(1, (prev[id] || 1) + delta)
    }));
  };

  // Saturday / Weekend Chef's Specials List
  const specialsList: TiffinSpecialDish[] = (settings.specialDishes && settings.specialDishes.length > 0)
    ? settings.specialDishes
    : [
        {
          id: 'spec-default',
          title: settings.saturdaySpecialTitle || 'Chef’s Special Pav Bhaji Feast',
          description: settings.saturdaySpecialDescription || 'Slow-simmered spiced vegetable bhaji with extra butter, 2 toasted ladi pavs, onion salad & masala chili.',
          price: 13.99,
          imageUrl: settings.saturdaySpecialImageUrl || ''
        }
      ];

  // Fetch flyer & blackout settings from Supabase / localStorage
  useEffect(() => {
    if (typeof localStorage !== 'undefined') {
      try {
        const raw = localStorage.getItem('bbw_tiffin_menu_settings_v1');
        if (raw && (raw.includes('2026-09-21') || raw.includes('September 21'))) {
          localStorage.removeItem('bbw_tiffin_menu_settings_v1');
        }
      } catch {}
    }

    fetchCalendarBlackouts().then(dates => setBlackoutDates(dates));

    fetchTiffinMenuSettings().then(data => {
      const curMon = getCurrentMondayStr();
      if (!data.weekStartDate || data.weekStartDate < curMon || data.weekTitle?.includes('21')) {
        data.weekStartDate = curMon;
        data.weekTitle = getCurrentMondayTitle(curMon);
      }
      setSettings(data);
    });

    const handleSettingsUpdate = () => {
      fetchTiffinMenuSettings().then(data => {
        const curMon = getCurrentMondayStr();
        if (!data.weekStartDate || data.weekStartDate < curMon || data.weekTitle?.includes('21')) {
          data.weekStartDate = curMon;
          data.weekTitle = getCurrentMondayTitle(curMon);
        }
        setSettings(data);
      });
    };
    window.addEventListener('bbw_tiffin_settings_updated', handleSettingsUpdate);
    return () => window.removeEventListener('bbw_tiffin_settings_updated', handleSettingsUpdate);
  }, []);

  // Lock body scroll and close lightbox on Escape key
  useEffect(() => {
    if (!isLightboxOpen) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsLightboxOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isLightboxOpen]);

  // Generate 4 upcoming Monday–Friday / Sunday weeks in Central Time
  const { nowDate, dateStr: todayStr } = getCentralTimeNow();

  const upcomingWeeks = useMemo(() => {
    const curDayOfWeek = nowDate.getDay(); // 0 is Sunday, 1 is Monday... 6 is Saturday
    const daysToMonday = curDayOfWeek === 0 ? 1 : (1 - curDayOfWeek);
    const baseMonday = new Date(nowDate.getFullYear(), nowDate.getMonth(), nowDate.getDate() + daysToMonday);

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    const fmtStr = (d: Date) => {
      const y = d.getFullYear();
      const m = (d.getMonth() + 1).toString().padStart(2, '0');
      const day = d.getDate().toString().padStart(2, '0');
      return `${y}-${m}-${day}`;
    };

    const fmtDisplay = (d: Date) => `${monthNames[d.getMonth()]} ${d.getDate()}`;

    let startMonday = baseMonday;
    const baseMonStr = fmtStr(baseMonday);
    if (settings?.weekStartDate) {
      const parts = settings.weekStartDate.split('-').map(Number);
      if (parts.length === 3 && !isNaN(parts[0]) && !isNaN(parts[1]) && !isNaN(parts[2])) {
        const kdsMon = new Date(parts[0], parts[1] - 1, parts[2]);
        if (settings.weekStartDate >= baseMonStr) {
          startMonday = kdsMon;
        }
      }
    }

    const weeks = [];
    for (let w = 0; w < 4; w++) {
      const mon = new Date(startMonday.getFullYear(), startMonday.getMonth(), startMonday.getDate() + w * 7);
      const fri = new Date(mon.getFullYear(), mon.getMonth(), mon.getDate() + 4);
      const sun = new Date(mon.getFullYear(), mon.getMonth(), mon.getDate() + 6);

      const monDateStr = fmtStr(mon);
      const friDateStr = fmtStr(fri);
      const shortRange = `${fmtDisplay(mon)} – ${fmtDisplay(fri)}`;
      const fullRange = `${fmtDisplay(mon)} – ${fmtDisplay(sun)}, ${mon.getFullYear()}`;
      const rangeLabel = `${fmtDisplay(mon)} – ${fmtDisplay(fri)}, ${mon.getFullYear()}`;

      let label = `Week of ${fmtDisplay(mon)}`;
      if (w === 0) {
        label = (settings?.weekTitle && (settings.weekStartDate === monDateStr || !settings.weekStartDate)) ? settings.weekTitle : `${shortRange}`;
      } else if (w === 1) {
        label = 'Following Week';
      }

      const weekDays = [];
      for (let d = 0; d < 7; d++) {
        const cur = new Date(mon.getFullYear(), mon.getMonth(), mon.getDate() + d);
        weekDays.push({
          dayName: dayNames[d],
          displayDate: fmtDisplay(cur),
          dateStr: fmtStr(cur)
        });
      }

      weeks.push({
        id: `week-${monDateStr}`,
        label,
        monDateStr,
        friDateStr,
        shortRange,
        fullRange,
        rangeLabel,
        monDate: mon,
        days: weekDays
      });
    }
    return weeks;
  }, [nowDate, settings?.weekStartDate, settings?.weekTitle]);

  // Set default selectedWeekId on load or when flyer settings update from KDS
  useEffect(() => {
    if (settings?.weekStartDate) {
      const matching = upcomingWeeks.find(w => w.monDateStr === settings.weekStartDate);
      if (matching) {
        setSelectedWeekId(matching.id);
        return;
      }
    }
    if (upcomingWeeks.length > 0) {
      setSelectedWeekId(upcomingWeeks[0].id);
    }
  }, [settings?.weekStartDate, upcomingWeeks]);

  const activeWeeklyPlan = useMemo(() => {
    return upcomingWeeks.find(w => w.id === selectedWeekId) || upcomingWeeks[0];
  }, [upcomingWeeks, selectedWeekId]);

  // Compute days of the selected week in Central Time
  const schedule: DaySchedule[] = useMemo(() => {
    if (!activeWeeklyPlan) return [];
    const mon = activeWeeklyPlan.monDate;
    const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    const result: DaySchedule[] = [];
    for (let i = 0; i < 7; i++) {
      const dayDate = new Date(mon.getFullYear(), mon.getMonth(), mon.getDate() + i);
      const y = dayDate.getFullYear();
      const m = (dayDate.getMonth() + 1).toString().padStart(2, '0');
      const d = dayDate.getDate().toString().padStart(2, '0');
      const dateStr = `${y}-${m}-${d}`;
      const dayName = daysOfWeek[i];
      const displayDate = `${monthNames[dayDate.getMonth()]} ${dayDate.getDate()}`;

      const isSunday = dayName === 'Sunday';
      const isSaturday = dayName === 'Saturday';
      const isBlackout = blackoutDates.includes(dateStr);

      const isNextDayOrLater = dateStr > todayStr;
      const isSelectable = isNextDayOrLater && !isSunday && !isBlackout;

      let statusLabel = 'Available to Order';
      if (isSunday) {
        statusLabel = 'Kitchen Closed';
      } else if (isBlackout) {
        statusLabel = 'Kitchen Closed (Blackout Date / High Volume)';
      } else if (dateStr < todayStr) {
        statusLabel = 'Past Date';
      } else if (dateStr === todayStr) {
        statusLabel = 'Order Closed (Same-day unavailable)';
      }

      const activeMenus = settings.weekdayMenus || DEFAULT_WEEKDAY_MENUS;
      const menu = activeMenus[dayName] || DEFAULT_WEEKDAY_MENUS[dayName] || { dal: 'Special Curry', sabzi: 'Seasonal Sabzi', description: '' };

      result.push({
        dayName,
        dateStr,
        displayDate,
        dalOrCurry: isSaturday ? (settings.saturdaySpecialTitle || menu.dal) : menu.dal,
        sabzi: isSaturday ? (settings.saturdaySpecialDescription || menu.sabzi) : menu.sabzi,
        description: menu.description,
        isSaturdaySpecial: isSaturday,
        isSundayClosed: isSunday,
        isSelectable,
        statusLabel
      });
    }
    return result;
  }, [activeWeeklyPlan, todayStr, settings.weekdayMenus, settings.saturdaySpecialTitle, settings.saturdaySpecialDescription, blackoutDates]);

  // Auto-select first selectable day tab when schedule changes (e.g. week selected)
  useEffect(() => {
    if (schedule.length > 0) {
      const existsInSchedule = schedule.some(s => s.dateStr === selectedDayTab);
      if (!existsInSchedule) {
        const firstOpen = schedule.find(s => s.isSelectable);
        if (firstOpen) {
          setSelectedDayTab(firstOpen.dateStr);
        } else {
          setSelectedDayTab(schedule[0].dateStr);
        }
      }
    }
  }, [schedule, selectedDayTab]);

  const activeDay = schedule.find(s => s.dateStr === selectedDayTab) || schedule[0];

  // Helper to trigger alert
  const triggerAddedAlert = (msg: string) => {
    setAddedAlert(msg);
    setTimeout(() => setAddedAlert(null), 3500);
  };

  // Add Daily Dabba to Cart
  const handleAddDailyDabba = (type: 'single' | 'family', day: DaySchedule) => {
    const isFamily = type === 'family';
    const unitPrice = isFamily ? familyPrice : singlePrice;
    const qty = isFamily ? getFamilyQty(day.dateStr) : getSingleQty(day.dateStr);
    const sizeName = isFamily ? 'Family Dabba (Serves 4)' : 'Single Dabba (Serves 1)';
    const itemId = `tiffin-${type}-${day.dateStr}`;

    const menuItem: MenuItem = {
      id: itemId,
      name: sizeName,
      category: 'tiffin',
      categoryLabel: 'Desi Dabba Daily Tiffin',
      description: `${day.dayName} (${day.displayDate}): ${day.dalOrCurry} & ${day.sabzi}`,
      allergens: ['G', 'D'],
      pricingType: 'tiffin',
      leadTimeHours: 24,
      isSatvikAvailable: true
    };

    const notes = `${day.dayName}, ${day.displayDate} Menu: ${day.dalOrCurry} + ${day.sabzi}${
      isFamily ? ' (4 Complete Meals)' : ' (1 cup rice, 1 cup curry/dal, 1/2 cup sabzi, 2 tawa roti)'
    }`;

    onUpdateCartItem(
      menuItem,
      isFamily ? 'tiffin_family' : 'tiffin_single',
      qty,
      `${sizeName} - ${day.dayName} (${day.displayDate})`,
      unitPrice,
      notes
    );

    triggerAddedAlert(`✓ Added ${qty} × ${sizeName} for ${day.dayName} (${day.displayDate}) ($${(unitPrice * qty).toFixed(2)})!`);
  };

  // Add Chef's Special Dish to Cart
  const handleAddSpecialDish = (dish: TiffinSpecialDish, day: DaySchedule) => {
    const qty = getSpecialQty(dish.id);
    const unitPrice = dish.price > 0 ? dish.price : 13.99;
    const itemId = `tiffin-special-${dish.id}-${day.dateStr}`;

    const menuItem: MenuItem = {
      id: itemId,
      name: dish.title,
      category: 'tiffin',
      categoryLabel: "Chef's Weekend Special",
      description: dish.description || 'Special handcrafted weekend recipe',
      allergens: ['G', 'D'],
      pricingType: 'tiffin',
      leadTimeHours: 24,
      isSatvikAvailable: true
    };

    onUpdateCartItem(
      menuItem,
      'container_16oz',
      qty,
      `${dish.title} - Saturday Special (${day.displayDate})`,
      unitPrice,
      `${day.dayName}, ${day.displayDate}: ${dish.title} (Qty: ${qty})`
    );

    triggerAddedAlert(`✓ Added ${qty} × ${dish.title} ($${(unitPrice * qty).toFixed(2)})!`);
  };

  // Add Weekly Dabba to Cart
  const handleAddWeeklyDabba = () => {
    if (!activeWeeklyPlan) return;
    const unitPrice = weeklyPrice;
    const itemId = `tiffin-weekly-${activeWeeklyPlan.monDateStr}`;

    const menuItem: MenuItem = {
      id: itemId,
      name: `Weekly Dabba Plan (${activeWeeklyPlan.shortRange})`,
      category: 'tiffin',
      categoryLabel: 'Desi Dabba Daily Tiffin',
      description: `5 Daily Complete Meals: ${activeWeeklyPlan.rangeLabel} (Monday to Friday) with fresh roti, rice, dal & sabzi.`,
      allergens: ['G', 'D'],
      pricingType: 'tiffin',
      leadTimeHours: 24,
      isSatvikAvailable: true
    };

    const notes = `Weekly Subscription: ${activeWeeklyPlan.rangeLabel} (1 Single Dabba each day from Monday to Friday). Total: ${5 * weeklyQty} hot meals.`;

    onUpdateCartItem(
      menuItem,
      'tiffin_weekly',
      weeklyQty,
      `Weekly Plan (${activeWeeklyPlan.shortRange})`,
      unitPrice,
      notes
    );

    triggerAddedAlert(`✓ Added ${weeklyQty} × Weekly Dabba Plan for ${activeWeeklyPlan.shortRange} ($${(unitPrice * weeklyQty).toFixed(2)})!`);
  };

  // Add Dynamic 8oz/16oz Container to Cart
  const handleAddDynamicContainer = (
    containerName: string,
    size: '8oz' | '16oz',
    unitPrice: number,
    qty: number,
    day: DaySchedule
  ) => {
    const itemId = `tiffin-extra-${containerName.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${size}-${day.dateStr}`;

    const menuItem: MenuItem = {
      id: itemId,
      name: `${containerName} [${size}] (${day.displayDate})`,
      category: 'tiffin',
      categoryLabel: `${size} Container`,
      description: `${size} portion of ${containerName} for ${day.dayName} (${day.displayDate})`,
      allergens: ['D', 'G'],
      pricingType: 'tiffin',
      leadTimeHours: 12,
      isSatvikAvailable: true
    };

    onUpdateCartItem(
      menuItem,
      'container_16oz',
      qty,
      `${size} Container (${day.displayDate})`,
      unitPrice,
      `${size} portion of ${containerName} for ${day.dayName}, ${day.displayDate}`
    );

    triggerAddedAlert(`✨ Added ${qty} × ${size} ${containerName} ($${(unitPrice * qty).toFixed(2)})!`);
  };

  // Add Add-on / Side / Bread to Cart
  const handleAddAddonItem = (
    addonName: string,
    portionLabel: string,
    unitPrice: number,
    qty: number
  ) => {
    const itemId = `tiffin-addon-${addonName.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;

    const menuItem: MenuItem = {
      id: itemId,
      name: `${addonName} [${portionLabel}]`,
      category: 'tiffin',
      categoryLabel: 'Tiffin Side & Add-on',
      description: `${portionLabel} of ${addonName}`,
      allergens: ['G', 'D'],
      pricingType: 'tiffin',
      leadTimeHours: 12,
      isSatvikAvailable: true
    };

    onUpdateCartItem(
      menuItem,
      'container_16oz',
      qty,
      portionLabel,
      unitPrice,
      `Tiffin Side: ${addonName} (${portionLabel})`
    );

    triggerAddedAlert(`✨ Added ${qty} × ${addonName} [${portionLabel}] ($${(unitPrice * qty).toFixed(2)})!`);
  };

  // Cart items under tiffin category
  const tiffinCartItems = cart.filter(i => i.category === 'tiffin');
  const totalTiffinCartSubtotal = tiffinCartItems.reduce((s, i) => s + i.totalPrice, 0);

  return (
    <div className="w-full font-sans space-y-6 animate-fade-in pb-20 sm:pb-16">

      {/* Floating Alert Notification */}
      {addedAlert && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-2xl text-xs font-bold flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md animate-fade-in">
          <div className="flex items-center gap-3">
            <Check className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{addedAlert}</span>
          </div>
          {onProceedToCheckout && (
            <button
              type="button"
              onClick={onProceedToCheckout}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-[#00346f] text-white rounded-xl font-bold text-xs hover:bg-[#00224d] transition-colors cursor-pointer shrink-0 shadow-sm"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}

      {/* ── TOP HEADER & FLYER LINK ── */}
      <div className="bg-gradient-to-r from-[#00346f] via-[#002856] to-[#111827] rounded-3xl p-6 sm:p-8 text-white shadow-md space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#ffdea5]/15 border border-[#ffdea5]/30 text-[#ffdea5] text-[10px] font-bold uppercase tracking-widest mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Ghar Ka Khana • Little Elm, TX</span>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight">
              Desi Dabba <span className="text-[#ffdea5] font-normal italic">Weekly Tiffin</span>
            </h1>
            <p className="text-xs sm:text-sm text-gray-200 mt-1 max-w-xl font-light">
              Scratch-prepared homestyle Indian meals, rotated daily. Order complete Dabbas, 5-day subscriptions, or extra 8oz/16oz tubs & sides.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsLightboxOpen(true)}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-2xl text-xs font-bold transition-all cursor-pointer shrink-0 backdrop-blur-xs self-start sm:self-auto"
          >
            <FileText className="w-4 h-4 text-[#ffdea5]" />
            <span>View Menu Flyer</span>
          </button>
        </div>
      </div>

      {/* ── 1. UNIFIED DATE & WEEK CONTROLLER (SINGLE SOURCE OF TRUTH) ── */}
      <div className="bg-white rounded-3xl border border-gray-200 p-5 sm:p-6 shadow-xs space-y-4">
        {/* Week Selection Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-gray-150">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#00346f]" />
            <span className="text-xs font-bold uppercase tracking-wider text-gray-800">
              Select Ordering Week:
            </span>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            {upcomingWeeks.map((week) => {
              const isSelected = activeWeeklyPlan?.id === week.id;
              return (
                <button
                  key={week.id}
                  type="button"
                  onClick={() => setSelectedWeekId(week.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#00346f] text-white shadow-xs ring-2 ring-[#ffdea5]/40'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
                  }`}
                >
                  {week.label} ({week.shortRange})
                </button>
              );
            })}
          </div>
        </div>

        {/* Day Selection Pills Bar */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-widest text-[#775a19]">
              Active Day Menu for {activeWeeklyPlan?.shortRange}:
            </span>
            <span className="text-[11px] text-gray-500 font-medium">
              Central Time • Sunday Kitchen Closed
            </span>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {schedule.map(day => {
              const isSelected = selectedDayTab === day.dateStr;
              return (
                <button
                  key={day.dayName}
                  type="button"
                  onClick={() => setSelectedDayTab(day.dateStr)}
                  className={`flex-1 min-w-[110px] p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#00346f] text-white border-[#00346f] shadow-md ring-2 ring-[#ffdea5]/50'
                      : day.isSelectable
                      ? 'bg-gray-50 hover:bg-gray-100 border-gray-250 text-gray-800'
                      : day.isSundayClosed
                      ? 'bg-amber-50/60 border-amber-200 text-amber-900 opacity-70'
                      : 'bg-gray-100 border-gray-200 text-gray-400 opacity-60'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-bold ${isSelected ? 'text-white' : 'text-gray-900'}`}>
                      {day.dayName.slice(0, 3)}
                    </span>
                    {day.isSaturdaySpecial && (
                      <span className={`text-[9px] font-black uppercase px-1 rounded ${
                        isSelected ? 'bg-[#ffdea5] text-[#00346f]' : 'bg-purple-100 text-purple-800'
                      }`}>
                        Spec
                      </span>
                    )}
                    {day.isSundayClosed && (
                      <span className="text-[9px] font-bold text-amber-800">
                        Off
                      </span>
                    )}
                  </div>
                  <span className={`text-[11px] block mt-0.5 font-semibold ${isSelected ? 'text-gray-200' : 'text-gray-600'}`}>
                    {day.displayDate}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── 2. SEGMENTED MAIN TABS NAVIGATION ── */}
      <div className="flex bg-gray-200/80 p-1.5 rounded-2xl border border-gray-300 max-w-xl mx-auto shadow-2xs">
        <button
          type="button"
          onClick={() => setActiveTab('meals')}
          className={`flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
            activeTab === 'meals'
              ? 'bg-[#00346f] text-white shadow-sm font-extrabold'
              : 'text-gray-700 hover:text-gray-900 hover:bg-white/50'
          }`}
        >
          <Utensils className="w-4 h-4 text-[#ffdea5]" />
          <span>🍱 Full Meals &amp; Weekly Plan</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('alacarte')}
          className={`flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
            activeTab === 'alacarte'
              ? 'bg-[#00346f] text-white shadow-sm font-extrabold'
              : 'text-gray-700 hover:text-gray-900 hover:bg-white/50'
          }`}
        >
          <Layers className="w-4 h-4 text-[#ffdea5]" />
          <span>🍲 Tubs (8/16oz), Sides &amp; Breads</span>
        </button>
      </div>

      {/* ── 3. TAB CONTENT 1: FULL MEALS & WEEKLY PLAN ── */}
      {activeTab === 'meals' && (
        <div className="space-y-6 animate-fade-in">

          {/* A) ACTIVE DAY DABBA MEAL CARD */}
          {activeDay && (
            <div className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-8 shadow-xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-200">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#775a19] block">
                    DAILY HOMESTYLE DABBA
                  </span>
                  <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#00346f]">
                    {activeDay.dayName} — <span className="text-emerald-700">{activeDay.displayDate}</span>
                  </h2>
                </div>
                <div className="text-xs text-gray-500 font-medium">
                  Status: <strong className={activeDay.isSelectable ? 'text-emerald-700' : 'text-rose-700'}>{activeDay.statusLabel}</strong>
                </div>
              </div>

              {/* Saturday Specials List vs Mon-Fri Dabbas */}
              {activeDay.isSaturdaySpecial ? (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b border-purple-200 gap-2">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 block">
                        WEEKEND CHEF'S SPECIAL DISHES
                      </span>
                      <h4 className="font-serif font-bold text-lg text-[#00346f]">
                        Saturday Specialties ({activeDay.displayDate})
                      </h4>
                    </div>
                  </div>

                  {activeDay.isSelectable ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {specialsList.map(dish => {
                        const dishQty = getSpecialQty(dish.id);
                        const dishPrice = dish.price > 0 ? dish.price : 13.99;
                        return (
                          <div 
                            key={dish.id} 
                            className="p-4 rounded-2xl bg-[#faf5ff] border border-purple-200 hover:border-purple-400 shadow-2xs flex flex-col justify-between space-y-3 transition-all"
                          >
                            <div>
                              {dish.imageUrl ? (
                                <div className="rounded-xl overflow-hidden mb-2 max-h-32 bg-gray-100">
                                  <img src={dish.imageUrl} alt={dish.title} className="w-full h-32 object-cover" />
                                </div>
                              ) : null}
                              <div className="flex items-start justify-between gap-2">
                                <h5 className="font-bold text-sm text-gray-900 leading-snug">{dish.title}</h5>
                                <span className="font-serif font-black text-sm text-purple-900 shrink-0">
                                  ${dishPrice.toFixed(2)}
                                </span>
                              </div>
                              <p className="text-xs text-gray-500 mt-1 line-clamp-3 leading-relaxed">
                                {dish.description}
                              </p>
                            </div>

                            <div className="space-y-2 pt-2 border-t border-purple-100">
                              <div className="flex items-center justify-between">
                                <span className="text-[11px] font-semibold text-gray-600">Qty:</span>
                                <div className="flex items-center bg-white rounded-lg p-0.5 border border-purple-200">
                                  <button
                                    type="button"
                                    onClick={() => updateSpecialQty(dish.id, -1)}
                                    className="w-7 h-7 rounded-md flex items-center justify-center hover:bg-purple-100 text-gray-700 cursor-pointer"
                                  >
                                    <Minus className="w-3.5 h-3.5" />
                                  </button>
                                  <span className="w-6 text-center font-bold text-xs">{dishQty}</span>
                                  <button
                                    type="button"
                                    onClick={() => updateSpecialQty(dish.id, 1)}
                                    className="w-7 h-7 rounded-md flex items-center justify-center hover:bg-purple-100 text-gray-700 cursor-pointer"
                                  >
                                    <Plus className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>

                              <button
                                type="button"
                                onClick={() => handleAddSpecialDish(dish, activeDay)}
                                className="w-full min-h-[42px] inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-2xs cursor-pointer"
                              >
                                <Plus className="w-4 h-4 text-[#ffdea5]" />
                                <span>Add Special • ${(dishPrice * dishQty).toFixed(2)}</span>
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="p-6 bg-gray-50 rounded-2xl border border-dashed border-gray-300 text-center space-y-1">
                      <AlertCircle className="w-7 h-7 mx-auto text-gray-400" />
                      <h4 className="font-serif font-bold text-sm text-gray-700">Ordering Closed for Saturday ({activeDay.displayDate})</h4>
                      <p className="text-xs text-gray-500">Saturday specials must be ordered at least 24 hours in advance.</p>
                    </div>
                  )}
                </div>
              ) : (
                /* Weekdays Mon-Fri */
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-amber-50/50 rounded-2xl border border-amber-200/70 flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                        <Flame className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 block">Dal / Curry Course</span>
                        <span className="font-bold text-sm text-gray-900 block mt-0.5">{activeDay.dalOrCurry}</span>
                        <span className="text-xs text-gray-500 block mt-0.5">Slow-simmered, rich homestyle spices</span>
                      </div>
                    </div>

                    <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-200/70 flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                        <Utensils className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 block">Dry Sabzi Course</span>
                        <span className="font-bold text-sm text-gray-900 block mt-0.5">{activeDay.sabzi}</span>
                        <span className="text-xs text-gray-500 block mt-0.5">Fresh seasonal vegetables sauteed with jeera &amp; herbs</span>
                      </div>
                    </div>
                  </div>

                  {/* Meal Contents Pill */}
                  <div className="p-3 bg-blue-50/70 border border-blue-200/80 rounded-xl flex flex-wrap items-center justify-between gap-2 text-xs text-[#00346f]">
                    <span className="font-bold">What is inside each daily Dabba:</span>
                    <div className="flex flex-wrap items-center gap-3 font-medium">
                      <span>🍚 1 Cup Basmati Rice</span>
                      <span>🫓 2 Fresh Tawa Roti</span>
                      <span>🥘 1 Cup Dal / Curry</span>
                      <span>🥗 1/2 Cup Dry Sabzi</span>
                    </div>
                  </div>

                  {/* Single vs Family Dabba Options */}
                  {activeDay.isSelectable ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                      {/* Single Dabba */}
                      {(() => {
                        const qty = getSingleQty(activeDay.dateStr);
                        return (
                          <div className="p-5 bg-white rounded-2xl border border-gray-300 hover:border-[#00346f] transition-all flex flex-col justify-between shadow-2xs space-y-4">
                            <div>
                              <div className="flex items-center justify-between">
                                <h4 className="font-serif font-bold text-lg text-gray-900">Single Dabba</h4>
                                <span className="px-2 py-0.5 bg-gray-100 rounded text-[10px] font-bold uppercase text-gray-600">Serves 1</span>
                              </div>
                              <span className="font-serif text-2xl font-black text-[#00346f] block mt-1">${singlePrice.toFixed(2)}</span>
                              <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                                1 complete meal: 1 cup rice, 1 cup curry, 1/2 cup sabzi, 2 tawa roti. Perfect for individual dinner!
                              </p>
                            </div>

                            <div className="space-y-2 pt-2 border-t border-gray-150">
                              <div className="flex items-center justify-between">
                                <span className="text-[11px] font-semibold text-gray-600">Quantity:</span>
                                <div className="flex items-center bg-gray-100 rounded-lg p-0.5 border border-gray-200">
                                  <button
                                    type="button"
                                    onClick={() => updateSingleQty(activeDay.dateStr, -1)}
                                    className="w-8 h-8 rounded-md flex items-center justify-center hover:bg-white text-gray-700 cursor-pointer"
                                  >
                                    <Minus className="w-4 h-4" />
                                  </button>
                                  <span className="w-7 text-center font-bold text-xs">{qty}</span>
                                  <button
                                    type="button"
                                    onClick={() => updateSingleQty(activeDay.dateStr, 1)}
                                    className="w-8 h-8 rounded-md flex items-center justify-center hover:bg-white text-gray-700 cursor-pointer"
                                  >
                                    <Plus className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>

                              <button
                                type="button"
                                onClick={() => handleAddDailyDabba('single', activeDay)}
                                className="w-full min-h-[44px] inline-flex items-center justify-center gap-2 bg-[#00346f] hover:bg-[#00224d] text-white py-2.5 px-4 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-xs cursor-pointer"
                              >
                                <Plus className="w-4 h-4 text-[#ffdea5]" />
                                <span>Add Single Dabba ({activeDay.displayDate}) • ${(singlePrice * qty).toFixed(2)}</span>
                              </button>
                            </div>
                          </div>
                        );
                      })()}

                      {/* Family Dabba */}
                      {(() => {
                        const qty = getFamilyQty(activeDay.dateStr);
                        return (
                          <div className="p-5 bg-white rounded-2xl border border-gray-300 hover:border-[#00346f] transition-all flex flex-col justify-between shadow-2xs space-y-4">
                            <div>
                              <div className="flex items-center justify-between">
                                <h4 className="font-serif font-bold text-lg text-gray-900">Family Dabba</h4>
                                <span className="px-2 py-0.5 bg-[#ffdea5]/40 text-[#775a19] rounded text-[10px] font-bold uppercase">Serves 4</span>
                              </div>
                              <span className="font-serif text-2xl font-black text-[#00346f] block mt-1">${familyPrice.toFixed(2)}</span>
                              <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                                4 complete meals: larger family portions of dal/curry, sabzi, 4 cups rice, 8 tawa rotis. Ideal for family!
                              </p>
                            </div>

                            <div className="space-y-2 pt-2 border-t border-gray-150">
                              <div className="flex items-center justify-between">
                                <span className="text-[11px] font-semibold text-gray-600">Quantity:</span>
                                <div className="flex items-center bg-gray-100 rounded-lg p-0.5 border border-gray-200">
                                  <button
                                    type="button"
                                    onClick={() => updateFamilyQty(activeDay.dateStr, -1)}
                                    className="w-8 h-8 rounded-md flex items-center justify-center hover:bg-white text-gray-700 cursor-pointer"
                                  >
                                    <Minus className="w-4 h-4" />
                                  </button>
                                  <span className="w-7 text-center font-bold text-xs">{qty}</span>
                                  <button
                                    type="button"
                                    onClick={() => updateFamilyQty(activeDay.dateStr, 1)}
                                    className="w-8 h-8 rounded-md flex items-center justify-center hover:bg-white text-gray-700 cursor-pointer"
                                  >
                                    <Plus className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>

                              <button
                                type="button"
                                onClick={() => handleAddDailyDabba('family', activeDay)}
                                className="w-full min-h-[44px] inline-flex items-center justify-center gap-2 bg-[#775a19] hover:bg-[#5e4612] text-white py-2.5 px-4 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-xs cursor-pointer"
                              >
                                <Plus className="w-4 h-4 text-[#ffdea5]" />
                                <span>Add Family Dabba ({activeDay.displayDate}) • ${(familyPrice * qty).toFixed(2)}</span>
                              </button>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  ) : (
                    <div className="p-6 bg-gray-50 rounded-2xl border border-dashed border-gray-300 text-center space-y-1">
                      <AlertCircle className="w-7 h-7 mx-auto text-gray-400" />
                      <h4 className="font-serif font-bold text-sm text-gray-700">
                        {activeDay.isSundayClosed ? 'Kitchen Closed on Sundays' : `Ordering is closed for ${activeDay.dayName} (${activeDay.displayDate})`}
                      </h4>
                      <p className="text-xs text-gray-500 max-w-md mx-auto">
                        {activeDay.isSundayClosed
                          ? 'Our kitchen is closed on Sundays for deep sanitation and fresh market prep.'
                          : 'To ensure fresh preparation from scratch, orders must be placed at least 24 hours in advance.'}
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* B) WEEKLY DABBA SUBSCRIPTION BANNER */}
          <div className="rounded-3xl bg-gradient-to-r from-emerald-50 via-teal-50 to-blue-50 border-2 border-emerald-200/80 p-6 sm:p-8 shadow-sm space-y-4">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="space-y-2 max-w-2xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 text-[10px] font-black uppercase tracking-widest">
                  🌟 BEST VALUE • 5-DAY HOMEMADE PLAN
                </div>
                <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#00346f]">
                  Weekly Dabba Subscription — ${weeklyPrice.toFixed(2)}
                </h2>
                <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">
                  Enjoy 1 Single Dabba every day from <strong>Monday through Friday</strong> for <strong>{activeWeeklyPlan?.shortRange}</strong>. 
                  Zero preservatives, rotated daily menus, freshly packed for dinner pickup.
                </p>
                <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-emerald-900 pt-1">
                  <span>✓ 5 Hot Meals (Mon to Fri)</span>
                  <span>✓ 10 Fresh Tawa Rotis</span>
                  <span>✓ 5 Cups Fragrant Rice</span>
                  <span>✓ 5 Chef Curries &amp; Sabzis</span>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-emerald-200 shadow-md flex flex-col items-center gap-3 shrink-0 w-full sm:w-auto">
                <div className="text-center">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 block">Weekly Package</span>
                  <span className="font-serif text-3xl font-black text-emerald-800">${weeklyPrice.toFixed(2)}</span>
                  <span className="text-[11px] text-gray-500 block">Just ~${(weeklyPrice / 5).toFixed(2)} / day</span>
                </div>

                <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 w-full sm:w-auto">
                  <div className="flex items-center bg-gray-100 rounded-xl p-1 border border-gray-200">
                    <button
                      type="button"
                      onClick={() => setWeeklyQty(Math.max(1, weeklyQty - 1))}
                      className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white text-gray-700 cursor-pointer"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-8 text-center font-bold text-xs">{weeklyQty}</span>
                    <button
                      type="button"
                      onClick={() => setWeeklyQty(weeklyQty + 1)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white text-gray-700 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={handleAddWeeklyDabba}
                    className="flex-1 sm:flex-initial min-h-[44px] inline-flex items-center justify-center gap-2 bg-[#00346f] hover:bg-[#00224d] text-white px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-sm cursor-pointer"
                  >
                    <ShoppingBag className="w-4 h-4 text-[#ffdea5]" />
                    <span>Add Weekly Plan ({activeWeeklyPlan?.shortRange})</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* ── 4. TAB CONTENT 2: A LA CARTE TUBS & EXTRAS ── */}
      {activeTab === 'alacarte' && (
        <div className="space-y-6 animate-fade-in">

          {/* A) DYNAMIC 8 OZ / 16 OZ CONTAINERS FOR ACTIVE DAY */}
          <div className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-8 shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-150 pb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#775a19] block">
                  DYNAMIC DAILY TUBS (8 OZ &amp; 16 OZ)
                </span>
                <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#00346f]">
                  Today's Curry, Sabzi &amp; Rice Containers
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Order extra tubs of today’s fresh menu items for <strong>{activeDay?.dayName} ({activeDay?.displayDate})</strong>.
                </p>
              </div>

              <div className="px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-xl text-xs font-semibold text-[#00346f] self-start sm:self-auto">
                Menu: {activeDay?.dalOrCurry} • {activeDay?.sabzi}
              </div>
            </div>

            {(() => {
              const curryName = activeDay?.dalOrCurry || 'Special Curry';
              const sabziName = activeDay?.sabzi || 'Seasonal Sabzi';

              const isDalRajmaChole = /dal|rajma|chole/i.test(curryName);
              const curry8ozPrice = isDalRajmaChole ? 6.99 : 8.99;
              const curry16ozPrice = isDalRajmaChole ? 11.49 : 14.99;

              const containerItems = [
                {
                  id: `curry-${activeDay.dateStr}`,
                  name: curryName,
                  tag: isDalRajmaChole ? 'Dal / Legume Gravy' : 'Special Curry',
                  p8oz: curry8ozPrice,
                  p16oz: curry16ozPrice
                },
                {
                  id: `sabzi-${activeDay.dateStr}`,
                  name: sabziName,
                  tag: 'Dry Sabzi of the Day',
                  p8oz: 6.99,
                  p16oz: 10.99
                },
                {
                  id: `rice-${activeDay.dateStr}`,
                  name: 'Fragrant Basmati Rice',
                  tag: 'Steamed Rice',
                  p8oz: 2.99,
                  p16oz: 4.99
                }
              ];

              return (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {containerItems.map(item => (
                    <div 
                      key={item.id} 
                      className="p-5 rounded-2xl border border-gray-200 bg-gray-50/60 hover:bg-white hover:border-[#00346f] transition-all flex flex-col justify-between gap-4 shadow-2xs"
                    >
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#775a19] bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200 inline-block mb-1.5">
                          {item.tag}
                        </span>
                        <h4 className="font-bold text-sm text-gray-900">{item.name}</h4>
                        <p className="text-[11px] text-gray-500 mt-1">Fresh portion for {activeDay.displayDate}</p>
                      </div>

                      {/* Direct Quick-Add Buttons for 8 oz and 16 oz */}
                      <div className="space-y-2 pt-3 border-t border-gray-200">
                        <button
                          type="button"
                          onClick={() => handleAddDynamicContainer(item.name, '8oz', item.p8oz, 1, activeDay)}
                          className="w-full py-2 px-3 rounded-xl border border-[#00346f] text-[#00346f] hover:bg-[#00346f] hover:text-white transition-all text-xs font-bold flex items-center justify-between cursor-pointer"
                        >
                          <span className="flex items-center gap-1">
                            <Plus className="w-3.5 h-3.5" />
                            <span>Add 8 oz</span>
                          </span>
                          <span className="font-serif font-extrabold">${item.p8oz.toFixed(2)}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleAddDynamicContainer(item.name, '16oz', item.p16oz, 1, activeDay)}
                          className="w-full py-2 px-3 rounded-xl bg-[#00346f] hover:bg-[#00224d] text-white transition-all text-xs font-bold flex items-center justify-between cursor-pointer shadow-xs"
                        >
                          <span className="flex items-center gap-1">
                            <Plus className="w-3.5 h-3.5 text-[#ffdea5]" />
                            <span>Add 16 oz</span>
                          </span>
                          <span className="font-serif font-extrabold">${item.p16oz.toFixed(2)}</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>

          {/* B) EVERYDAY $1.00 ADD-ONS & SIDES */}
          <div className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-8 shadow-xs space-y-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#775a19] block">
                HOMESTYLE EXTRAS &amp; BREADS
              </span>
              <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#00346f]">
                $1.00 Everyday Add-Ons &amp; Sides
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Fresh hot rotis, puris, cooling raita, crisp papad, homestyle pickles &amp; salads to complement your meal.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
              {[
                { id: 'roti', name: 'Phulka Tawa Roti', portion: '1 Pc', price: 1.00, desc: 'Fresh whole wheat tawa roti' },
                { id: 'puri', name: 'Puri (2 Pcs)', portion: '2 Pcs Pack', price: 1.00, desc: 'Golden fluffy fried puris' },
                { id: 'missi-roti', name: 'Missi Roti', portion: '1 Pc', price: 1.00, desc: 'Spiced besan flatbread' },
                { id: 'raita', name: 'Boondi / Veg Raita (8oz)', portion: '8 oz Container', price: 1.00, desc: 'Cooling spiced yogurt raita' },
                { id: 'papad', name: 'Roasted Papad', portion: '1 Pc', price: 1.00, desc: 'Crispy fire-roasted urad papad' },
                { id: 'pickle', name: 'Homestyle Pickle', portion: '2 oz Dip', price: 1.00, desc: 'Spiced mango / chili pickle' },
                { id: 'salad', name: 'Fresh Green Salad (8oz)', portion: '8 oz Container', price: 1.00, desc: 'Sliced cucumber, carrot & lemon' },
                { id: 'chutney', name: 'Mint & Tamarind Chutney', portion: '4 oz Dip', price: 1.00, desc: 'Tangy sweet & mint chutneys' }
              ].map(item => {
                const qty = getAddonQty(item.id);
                const totalPrice = item.price * qty;

                return (
                  <div key={item.id} className="p-3.5 rounded-2xl border border-gray-200 bg-gray-50/70 hover:bg-white hover:border-[#00346f] transition-all flex flex-col justify-between gap-3 shadow-2xs">
                    <div>
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-xs sm:text-sm text-gray-900">{item.name}</h4>
                        <span className="font-serif font-black text-xs text-[#00346f] bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                          ${item.price.toFixed(2)}
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-500 mt-1">{item.desc}</p>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-gray-200">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-semibold text-gray-600">Qty:</span>
                        <div className="flex items-center bg-gray-100 rounded-lg p-0.5 border border-gray-200">
                          <button
                            type="button"
                            onClick={() => updateAddonQty(item.id, -1)}
                            className="w-6 h-6 rounded-md flex items-center justify-center hover:bg-white text-gray-700 cursor-pointer"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-6 text-center font-bold text-xs">{qty}</span>
                          <button
                            type="button"
                            onClick={() => updateAddonQty(item.id, 1)}
                            className="w-6 h-6 rounded-md flex items-center justify-center hover:bg-white text-gray-700 cursor-pointer"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleAddAddonItem(item.name, item.portion, item.price, qty)}
                        className="w-full min-h-[36px] inline-flex items-center justify-center gap-1 py-1.5 px-2 rounded-xl border border-[#00346f] text-[#00346f] hover:bg-[#00346f] hover:text-white transition-colors text-[11px] font-bold uppercase tracking-wider cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add {qty} • ${totalPrice.toFixed(2)}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* C) FRESH STUFFED TAWA PARATHAS */}
          <div className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-8 shadow-xs space-y-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#775a19] block">
                STUFFED TAWA PARATHAS (PACK OF 2)
              </span>
              <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#00346f]">
                Handcrafted Stuffed Parathas
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Generously stuffed, whole wheat tawa parathas served in packs of 2.
              </p>
            </div>

            <div className="space-y-4 pt-1">
              {/* Standard Parathas ($5.00 for 2) */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                  Standard Stuffed Parathas ($5.00 for 2 Pcs)
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { id: 'paratha-aloo', name: 'Aloo Paratha (2 Pcs)', portion: '2 Pcs Pack', price: 5.00, desc: 'Spiced potato stuffed parathas with butter' },
                    { id: 'paratha-methi', name: 'Methi Paratha (2 Pcs)', portion: '2 Pcs Pack', price: 5.00, desc: 'Fresh fenugreek leaf parathas' },
                    { id: 'paratha-pyaaz', name: 'Pyaaz Paratha (2 Pcs)', portion: '2 Pcs Pack', price: 5.00, desc: 'Spiced onion stuffed flatbreads' }
                  ].map(item => {
                    const qty = getAddonQty(item.id);
                    const totalPrice = item.price * qty;

                    return (
                      <div key={item.id} className="p-4 rounded-2xl border border-gray-200 bg-gray-50/70 hover:bg-white hover:border-[#00346f] transition-all flex flex-col justify-between gap-3 shadow-2xs">
                        <div>
                          <div className="flex items-center justify-between">
                            <h4 className="font-bold text-xs sm:text-sm text-gray-900">{item.name}</h4>
                            <span className="font-serif font-black text-xs text-[#00346f] bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                              $5.00 / 2 pcs
                            </span>
                          </div>
                          <p className="text-[11px] text-gray-500 mt-1">{item.desc}</p>
                        </div>

                        <div className="space-y-2 pt-2 border-t border-gray-200">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-semibold text-gray-600">Packs:</span>
                            <div className="flex items-center bg-gray-100 rounded-lg p-0.5 border border-gray-200">
                              <button
                                type="button"
                                onClick={() => updateAddonQty(item.id, -1)}
                                className="w-6 h-6 rounded-md flex items-center justify-center hover:bg-white text-gray-700 cursor-pointer"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="w-6 text-center font-bold text-xs">{qty}</span>
                              <button
                                type="button"
                                onClick={() => updateAddonQty(item.id, 1)}
                                className="w-6 h-6 rounded-md flex items-center justify-center hover:bg-white text-gray-700 cursor-pointer"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleAddAddonItem(item.name, item.portion, item.price, qty)}
                            className="w-full min-h-[38px] inline-flex items-center justify-center gap-1 py-1.5 px-3 rounded-xl border border-[#00346f] text-[#00346f] hover:bg-[#00346f] hover:text-white transition-colors text-xs font-bold uppercase tracking-wider cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Add {qty} Pack{qty !== 1 ? 's' : ''} • ${totalPrice.toFixed(2)}</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Premium Parathas ($6.00 for 2) */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                  Premium Stuffed Parathas ($6.00 for 2 Pcs)
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { id: 'paratha-paneer', name: 'Paneer Paratha (2 Pcs)', portion: '2 Pcs Pack', price: 6.00, desc: 'Grated paneer & herb stuffed parathas' },
                    { id: 'paratha-gobhi', name: 'Gobhi Paratha (2 Pcs)', portion: '2 Pcs Pack', price: 6.00, desc: 'Spiced cauliflower stuffed parathas' },
                    { id: 'paratha-mooli', name: 'Mooli Paratha (2 Pcs)', portion: '2 Pcs Pack', price: 6.00, desc: 'Traditional daikon radish parathas' }
                  ].map(item => {
                    const qty = getAddonQty(item.id);
                    const totalPrice = item.price * qty;

                    return (
                      <div key={item.id} className="p-4 rounded-2xl border border-purple-200 bg-purple-50/30 hover:bg-white hover:border-[#00346f] transition-all flex flex-col justify-between gap-3 shadow-2xs">
                        <div>
                          <div className="flex items-center justify-between">
                            <h4 className="font-bold text-xs sm:text-sm text-gray-900">{item.name}</h4>
                            <span className="font-serif font-black text-xs text-purple-900 bg-purple-100 px-2 py-0.5 rounded-md border border-purple-200">
                              $6.00 / 2 pcs
                            </span>
                          </div>
                          <p className="text-[11px] text-gray-500 mt-1">{item.desc}</p>
                        </div>

                        <div className="space-y-2 pt-2 border-t border-gray-200">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-semibold text-gray-600">Packs:</span>
                            <div className="flex items-center bg-gray-100 rounded-lg p-0.5 border border-gray-200">
                              <button
                                type="button"
                                onClick={() => updateAddonQty(item.id, -1)}
                                className="w-6 h-6 rounded-md flex items-center justify-center hover:bg-white text-gray-700 cursor-pointer"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="w-6 text-center font-bold text-xs">{qty}</span>
                              <button
                                type="button"
                                onClick={() => updateAddonQty(item.id, 1)}
                                className="w-6 h-6 rounded-md flex items-center justify-center hover:bg-white text-gray-700 cursor-pointer"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleAddAddonItem(item.name, item.portion, item.price, qty)}
                            className="w-full min-h-[38px] inline-flex items-center justify-center gap-1 py-1.5 px-3 rounded-xl border border-[#00346f] text-[#00346f] hover:bg-[#00346f] hover:text-white transition-colors text-xs font-bold uppercase tracking-wider cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Add {qty} Pack{qty !== 1 ? 's' : ''} • ${totalPrice.toFixed(2)}</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* ── 5. CURRENT TIFFIN CART ITEMS SUMMARY ── */}
      {tiffinCartItems.length > 0 && (
        <div className="p-5 bg-blue-50/70 rounded-3xl border border-blue-200 space-y-3 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="font-serif font-bold text-sm text-[#00346f]">
              Tiffin Items in Order ({tiffinCartItems.length})
            </span>
            <span className="text-xs font-bold text-gray-900">
              Subtotal: ${totalTiffinCartSubtotal.toFixed(2)}
            </span>
          </div>

          <div className="space-y-2">
            {tiffinCartItems.map(item => (
              <div key={item.id} className="p-3 bg-white rounded-xl border border-gray-200 flex items-center justify-between gap-3 text-xs">
                <div>
                  <span className="font-bold text-gray-900">{item.name}</span>
                  <span className="text-gray-500 block text-[11px]">
                    {item.selectionLabel} &times; {item.quantity}
                  </span>
                  {item.notes && (
                    <span className="text-[11px] text-gray-600 block mt-0.5 italic">{item.notes}</span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-gray-900">${item.totalPrice.toFixed(2)}</span>
                  {onRemoveCartItem && (
                    <button
                      type="button"
                      onClick={() => onRemoveCartItem(item.id)}
                      className="w-8 h-8 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 flex items-center justify-center cursor-pointer"
                      title="Remove from cart"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {onProceedToCheckout && (
            <button
              type="button"
              onClick={onProceedToCheckout}
              className="w-full min-h-[48px] mt-2 py-3 px-4 rounded-xl bg-[#00346f] hover:bg-[#00224d] text-white text-xs sm:text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm cursor-pointer transition-all hover:scale-[1.005]"
            >
              <span>Proceed to Checkout with {tiffinCartItems.length} Tiffin Item{tiffinCartItems.length !== 1 ? 's' : ''} (${totalTiffinCartSubtotal.toFixed(2)})</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      )}

      {/* ── 6. PERSISTENT FLOATING BOTTOM CHECKOUT BAR ── */}
      {tiffinCartItems.length > 0 && onProceedToCheckout && (
        <div className="fixed bottom-4 left-4 right-4 z-40 max-w-2xl mx-auto animate-bounce-short">
          <div className="bg-[#00346f] text-white p-3 sm:p-4 rounded-2xl shadow-2xl border border-white/20 flex items-center justify-between gap-3 backdrop-blur-md">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#ffdea5] text-[#00346f] font-black flex items-center justify-center shrink-0 text-sm shadow-inner">
                {tiffinCartItems.length}
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#ffdea5] block">Tiffin Order Total</span>
                <span className="font-serif font-black text-lg text-white">${totalTiffinCartSubtotal.toFixed(2)}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={onProceedToCheckout}
              className="px-5 py-2.5 bg-[#ffdea5] hover:bg-[#ffe6ba] text-[#00346f] font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center gap-2 shadow-md cursor-pointer shrink-0"
            >
              <span>Checkout Now</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ── 7. FLYER LIGHTBOX MODAL ── */}
      {isLightboxOpen && createPortal(
        <div 
          className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-fade-in"
          onClick={() => setIsLightboxOpen(false)}
        >
          <div 
            className="relative bg-gray-900 rounded-3xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl border border-white/10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 bg-gray-950 text-white flex items-center justify-between border-b border-gray-800">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#ffdea5]" />
                <span className="font-serif font-bold text-sm sm:text-base">
                  Desi Dabba Weekly Tiffin Menu Flyer
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsLightboxOpen(false)}
                className="w-8 h-8 rounded-full bg-gray-800 hover:bg-gray-700 text-gray-300 flex items-center justify-center cursor-pointer transition-colors"
                aria-label="Close lightbox"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-auto p-4 flex items-center justify-center bg-gray-950">
              <img
                src={settings.saturdaySpecialImageUrl || "/desidabba_flyer.jpeg"}
                alt="Weekly Tiffin Menu Flyer"
                className="max-w-full max-h-full object-contain rounded-xl shadow-md"
              />
            </div>
          </div>
        </div>,
        document.body
      )}

    </div>
  );
}
