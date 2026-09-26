import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  Plus, 
  Minus, 
  ShoppingBag, 
  Sparkles, 
  Check, 
  Clock, 
  AlertCircle, 
  Maximize2, 
  X, 
  Utensils, 
  Flame, 
  Award,
  AlertTriangle,
  MapPin,
  ArrowRight
} from 'lucide-react';
import type { CartItem, MenuItem, TiffinSpecialDish } from '../../types/catering';
import { getCentralTimeNow } from '../../utils/centralTime';
import { fetchTiffinMenuSettings, DEFAULT_TIFFIN_SETTINGS } from '../../services/supabase';
import type { TiffinMenuSettings } from '../../types/catering';

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
  isSaturdaySpecial?: boolean;
  isSundayClosed?: boolean;
  isSelectable: boolean; // next day till end of week
  statusLabel?: string;
}

const WEEKDAY_MENUS: Record<string, { dal: string; sabzi: string }> = {
  Monday: { dal: 'Palak Dal', sabzi: 'Cabbage Sabzi' },
  Tuesday: { dal: 'Lauki Kofta Curry', sabzi: 'Shimla Mirch Sabzi' },
  Wednesday: { dal: 'Rajma Chawal', sabzi: 'Aloo Sabzi' },
  Thursday: { dal: 'Dal Tadka', sabzi: 'Bhindi Sabzi' },
  Friday: { dal: 'Kala Chana Curry', sabzi: 'Beans Sabzi' },
  Saturday: { dal: 'Chef’s Special Dish', sabzi: 'Weekend Surprise Recipe' },
  Sunday: { dal: 'Kitchen Closed', sabzi: 'Rest & Clean Day' }
};

const EXTRA_CONTAINERS = [
  { id: 'dal-reg', name: 'Dal / Curry (Regular)', price: 9.99, description: '16 oz tub of slow-simmered daily dal or homestyle curry' },
  { id: 'dal-prem', name: 'Dal / Curry (Premium)', price: 11.49, description: '16 oz tub of rich specialty curry or premium dal' },
  { id: 'paneer-16oz', name: 'Paneer Specialty', price: 14.99, description: '16 oz tub of fresh spiced cottage cheese main' },
  { id: 'dry-sabzi-16oz', name: 'Dry Sabzi', price: 10.99, description: '16 oz tub of homestyle spiced seasonal dry sabzi' },
  { id: 'rice-16oz', name: 'Steamed Rice', price: 4.99, description: '16 oz container of fragrant long-grain basmati rice' },
  { id: 'raita-16oz', name: 'Cooling Raita', price: 4.99, description: '16 oz chilled seasoned spiced yogurt with boondi or veggies' }
];

export default function TiffinOrderView({
  cart,
  onUpdateCartItem,
  onRemoveCartItem,
  onProceedToCheckout
}: TiffinOrderViewProps) {
  const [settings, setSettings] = useState<TiffinMenuSettings>(DEFAULT_TIFFIN_SETTINGS);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [selectedDayTab, setSelectedDayTab] = useState<string>('');
  const [weeklyQty, setWeeklyQty] = useState<number>(1);
  const [selectedWeekId, setSelectedWeekId] = useState<string>('');
  const [addedAlert, setAddedAlert] = useState<string | null>(null);
  const [specialQuantities, setSpecialQuantities] = useState<Record<string, number>>({});

  const getSpecialQty = (dishId: string) => specialQuantities[dishId] || 1;
  const updateSpecialQty = (dishId: string, delta: number) => {
    setSpecialQuantities(prev => ({
      ...prev,
      [dishId]: Math.max(1, (prev[dishId] || 1) + delta)
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

  // Load tiffin flyer & special settings from Supabase / localStorage
  useEffect(() => {
    fetchTiffinMenuSettings().then(data => {
      setSettings(data);
    });

    const handleSettingsUpdate = () => {
      fetchTiffinMenuSettings().then(data => setSettings(data));
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

  // Compute days of the week in Central Time
  const schedule: DaySchedule[] = [];
  const { nowDate, dateStr: todayStr } = getCentralTimeNow();
  
  // Find current week Monday through Sunday
  const currentDayOfWeek = nowDate.getDay(); // 0 is Sunday, 1 is Monday... 6 is Saturday
  // Normalize so Monday is day 1, Sunday is day 7
  const mondayOffset = currentDayOfWeek === 0 ? -6 : 1 - currentDayOfWeek;
  const mondayMs = nowDate.getTime() + mondayOffset * 24 * 60 * 60 * 1000;

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  for (let i = 0; i < 7; i++) {
    const dayDate = new Date(mondayMs + i * 24 * 60 * 60 * 1000);
    const y = dayDate.getFullYear();
    const m = (dayDate.getMonth() + 1).toString().padStart(2, '0');
    const d = dayDate.getDate().toString().padStart(2, '0');
    const dateStr = `${y}-${m}-${d}`;
    const dayName = daysOfWeek[i];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const displayDate = `${monthNames[dayDate.getMonth()]} ${dayDate.getDate()}`;

    const isSunday = dayName === 'Sunday';
    const isSaturday = dayName === 'Saturday';

    // Must be strictly after today (next day or later) and not Sunday
    const isNextDayOrLater = dateStr > todayStr;
    const isSelectable = isNextDayOrLater && !isSunday;

    let statusLabel = 'Available to Order';
    if (isSunday) {
      statusLabel = 'Kitchen Closed';
    } else if (dateStr < todayStr) {
      statusLabel = 'Past Date';
    } else if (dateStr === todayStr) {
      statusLabel = 'Order Closed (Same-day unavailable)';
    }

    const menu = WEEKDAY_MENUS[dayName] || { dal: 'Special Curry', sabzi: 'Seasonal Sabzi' };

    schedule.push({
      dayName,
      dateStr,
      displayDate,
      dalOrCurry: isSaturday ? (settings.saturdaySpecialTitle || menu.dal) : menu.dal,
      sabzi: isSaturday ? (settings.saturdaySpecialDescription || menu.sabzi) : menu.sabzi,
      isSaturdaySpecial: isSaturday,
      isSundayClosed: isSunday,
      isSelectable,
      statusLabel
    });
  }

  // Generate 4 upcoming Monday–Friday weeks for Weekly Dabba Subscription
  const upcomingWeeks: {
    id: string;
    label: string;
    monDateStr: string;
    friDateStr: string;
    rangeLabel: string;
    shortRange: string;
    days: { dayName: string; displayDate: string; dateStr: string }[];
  }[] = [];

  const curDayOfWeek = nowDate.getDay(); // 0 is Sunday, 1 is Monday... 6 is Saturday
  // Days to reach upcoming Monday:
  // If Sunday (0), next day is Monday (+1)
  // If Mon-Sat, next Monday is (8 - curDayOfWeek)
  const daysToUpcomingMonday = curDayOfWeek === 0 ? 1 : (8 - curDayOfWeek);
  const baseMondayDate = new Date(nowDate.getFullYear(), nowDate.getMonth(), nowDate.getDate() + daysToUpcomingMonday);

  for (let w = 0; w < 4; w++) {
    const mon = new Date(baseMondayDate.getFullYear(), baseMondayDate.getMonth(), baseMondayDate.getDate() + w * 7);
    const fri = new Date(mon.getFullYear(), mon.getMonth(), mon.getDate() + 4);

    const fmtStr = (d: Date) => {
      const y = d.getFullYear();
      const m = (d.getMonth() + 1).toString().padStart(2, '0');
      const day = d.getDate().toString().padStart(2, '0');
      return `${y}-${m}-${day}`;
    };

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const fmtDisplay = (d: Date) => `${monthNames[d.getMonth()]} ${d.getDate()}`;

    const monDateStr = fmtStr(mon);
    const friDateStr = fmtStr(fri);
    const shortRange = `${fmtDisplay(mon)} – ${fmtDisplay(fri)}`;
    const rangeLabel = `${fmtDisplay(mon)} – ${fmtDisplay(fri)}, ${mon.getFullYear()}`;
    const label = w === 0 ? 'Upcoming Week' : w === 1 ? 'Following Week' : `Week of ${fmtDisplay(mon)}`;

    const weekDays = [];
    const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    for (let d = 0; d < 5; d++) {
      const cur = new Date(mon.getFullYear(), mon.getMonth(), mon.getDate() + d);
      weekDays.push({
        dayName: dayNames[d],
        displayDate: fmtDisplay(cur),
        dateStr: fmtStr(cur)
      });
    }

    upcomingWeeks.push({
      id: `week-${monDateStr}`,
      label,
      monDateStr,
      friDateStr,
      shortRange,
      rangeLabel,
      days: weekDays
    });
  }

  const activeWeeklyPlan = upcomingWeeks.find(w => w.id === (selectedWeekId || upcomingWeeks[0]?.id)) || upcomingWeeks[0];

  // Set default selected day to first selectable day
  useEffect(() => {
    if (!selectedDayTab) {
      const firstOpen = schedule.find(s => s.isSelectable);
      if (firstOpen) {
        setSelectedDayTab(firstOpen.dateStr);
      } else {
        setSelectedDayTab(schedule[0]?.dateStr || '');
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
    const unitPrice = isFamily ? 34.99 : 11.99;
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
      1,
      `${sizeName} - ${day.dayName} (${day.displayDate})`,
      unitPrice,
      notes
    );

    triggerAddedAlert(`✓ Added ${sizeName} for ${day.dayName} (${day.displayDate}) to your order!`);
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

    triggerAddedAlert(`✓ Added ${qty} × ${dish.title} ($${(unitPrice * qty).toFixed(2)}) to your order!`);
  };

  // Add Weekly Dabba to Cart
  const handleAddWeeklyDabba = () => {
    if (!activeWeeklyPlan) return;
    const unitPrice = 54.99;
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

    triggerAddedAlert(`✓ Added ${weeklyQty} × Weekly Dabba Plan for ${activeWeeklyPlan.shortRange} ($${(unitPrice * weeklyQty).toFixed(2)}) to your order!`);
  };

  // Add 16 oz Container to Cart
  const handleAddContainer = (container: typeof EXTRA_CONTAINERS[0]) => {
    const itemId = `tiffin-container-${container.id}`;

    const menuItem: MenuItem = {
      id: itemId,
      name: container.name,
      category: 'tiffin',
      categoryLabel: '16 oz Containers',
      description: container.description,
      allergens: ['D'],
      pricingType: 'tiffin',
      leadTimeHours: 24,
      isSatvikAvailable: true
    };

    onUpdateCartItem(
      menuItem,
      'container_16oz',
      1,
      '16 oz Container',
      container.price,
      `16 oz portion of ${container.name}`
    );

    triggerAddedAlert(`✓ Added 16 oz ${container.name} ($${container.price.toFixed(2)}) to your order!`);
  };

  // Cart items under tiffin category
  const tiffinCartItems = cart.filter(i => i.category === 'tiffin');

  return (
    <div className="w-full font-sans space-y-8 animate-fade-in">

      {/* ── 1. HERO BRAND BANNER & FLYER PREVIEW ── */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#00346f] via-[#00224d] to-[#121620] text-white p-6 sm:p-8 md:p-10 shadow-xl border border-[#00346f]/40">
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          <div className="lg:col-span-7 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#ffdea5]/15 border border-[#ffdea5]/30 text-[#ffdea5] text-xs font-bold uppercase tracking-widest">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Ghar Ka Khana. Dil Se. • Fresh Homestyle Tiffin</span>
            </div>

            <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
              Desi Dabba <span className="text-[#ffdea5] font-normal italic">Weekly Tiffin</span>
            </h1>

            <p className="text-sm sm:text-base text-gray-200 font-light leading-relaxed max-w-xl">
              Fresh, homemade vegetarian Indian meals prepared in small batches with zero preservatives. 
              Each daily Dabba includes <strong>1 cup rice, 1 cup curry/dal, 1/2 cup dry sabzi, and 2 fresh tawa rotis</strong>.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
              <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/15">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-300 block">Single Dabba</span>
                <span className="font-serif text-xl sm:text-2xl font-black text-[#ffdea5]">$11.99</span>
                <span className="text-[11px] text-gray-300 block">Serves 1 meal</span>
              </div>

              <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/15">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-300 block">Family Dabba</span>
                <span className="font-serif text-xl sm:text-2xl font-black text-[#ffdea5]">$34.99</span>
                <span className="text-[11px] text-gray-300 block">Serves 4 complete</span>
              </div>

              <div className="p-3 rounded-2xl bg-emerald-500/20 backdrop-blur-xs border border-emerald-400/30 col-span-2 sm:col-span-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-300 block">Weekly Dabba</span>
                <span className="font-serif text-xl sm:text-2xl font-black text-white">$54.99</span>
                <span className="text-[11px] text-emerald-200 block">5 days (Mon–Fri)</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-gray-300">
              <span className="flex items-center gap-1.5 bg-black/20 px-2.5 py-1 rounded-lg">
                <Clock className="w-3.5 h-3.5 text-[#ffdea5]" /> Order for tomorrow through Sunday
              </span>
              <span className="flex items-center gap-1.5 bg-black/20 px-2.5 py-1 rounded-lg">
                <Award className="w-3.5 h-3.5 text-emerald-400" /> Weekend Chef's Specials
              </span>
              <span className="flex items-center gap-1.5 bg-black/20 px-2.5 py-1 rounded-lg">
                <AlertCircle className="w-3.5 h-3.5 text-amber-300" /> Sunday Closed
              </span>
              <span className="flex items-center gap-1.5 bg-[#ffdea5]/20 text-[#ffdea5] border border-[#ffdea5]/30 px-2.5 py-1 rounded-lg font-semibold">
                <MapPin className="w-3.5 h-3.5 text-[#ffdea5]" /> Pickup Only: Home Kitchen - Deerwood Dr, Little Elm
              </span>
            </div>
          </div>

          {/* Interactive Weekly Flyer Card */}
          <div className="lg:col-span-5 flex flex-col items-center">
            <div 
              onClick={() => setIsLightboxOpen(true)}
              className="group relative cursor-pointer overflow-hidden rounded-2xl border-2 border-white/20 shadow-2xl bg-white hover:border-[#ffdea5] transition-all transform hover:scale-101 max-w-sm"
              title="Click to view full-size weekly flyer"
            >
              <img 
                src={settings.flyerImageUrl || '/tiffin-flyer.jpg'} 
                alt="Desi Dabba This Week's Menu"
                className="w-full object-cover max-h-[380px] group-hover:opacity-95 transition-opacity"
                onError={(e) => {
                  // fallback if image fails
                  (e.target as HTMLImageElement).src = '/tiffin-flyer.jpg';
                }}
              />
              <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 text-white font-bold text-xs uppercase tracking-wider">
                <Maximize2 className="w-4 h-4" />
                <span>Click to Expand Flyer</span>
              </div>
              <div className="absolute bottom-2 right-2 bg-black/70 backdrop-blur-xs text-white text-[10px] px-2.5 py-1 rounded-lg font-bold">
                {settings.weekTitle || "This Week's Menu"}
              </div>
            </div>
            <p className="text-[11px] text-gray-400 mt-2 text-center">
              Click flyer to zoom in &amp; inspect full ingredients &amp; nutrition
            </p>
          </div>

        </div>
      </div>

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

      {/* ── 2. FEATURED: WEEKLY DABBA SUBSCRIPTION (MON–FRI 5-DAY PLAN) ── */}
      <div className="rounded-3xl bg-gradient-to-r from-emerald-50 via-teal-50 to-blue-50 border-2 border-emerald-200/80 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 text-[10px] font-black uppercase tracking-widest">
              🌟 BEST VALUE • 5-DAY HOMEMADE PLAN
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#00346f]">
              Weekly Dabba Subscription — $54.99
            </h2>
            <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">
              Enjoy 1 Single Dabba every day from <strong>Monday through Friday</strong> for your selected week. 
              Zero preservatives, rotated daily menus, freshly packed and ready for dinner pickup. Same great taste, more convenience!
            </p>
            <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-emerald-900 pt-1">
              <span>✓ 5 Hot Meals (Mon to Fri)</span>
              <span>✓ 10 Fresh Tawa Rotis</span>
              <span>✓ 5 Cups Fragrant Rice</span>
              <span>✓ 5 Chef Curries &amp; Dry Sabzis</span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-emerald-200 shadow-md flex flex-col items-center gap-3 shrink-0 w-full sm:w-auto">
            <div className="text-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 block">Weekly Package</span>
              <span className="font-serif text-3xl font-black text-emerald-800">$54.99</span>
              <span className="text-[11px] text-gray-500 block">Just ~$11.00 / day</span>
            </div>

            <div className="flex items-center gap-3 w-full">
              <div className="flex items-center bg-gray-100 rounded-xl p-1 border border-gray-200">
                <button
                  type="button"
                  onClick={() => setWeeklyQty(Math.max(1, weeklyQty - 1))}
                  className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-white text-gray-700 cursor-pointer"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-7 text-center font-bold text-xs">{weeklyQty}</span>
                <button
                  type="button"
                  onClick={() => setWeeklyQty(weeklyQty + 1)}
                  className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-white text-gray-700 cursor-pointer"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              <button
                type="button"
                onClick={handleAddWeeklyDabba}
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 bg-[#00346f] hover:bg-[#00224d] text-white px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-sm cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4 text-[#ffdea5]" />
                <span>Add Weekly Plan ({activeWeeklyPlan?.shortRange})</span>
              </button>
            </div>
          </div>
        </div>

        {/* ── Interactive Selection of the Whole Week ── */}
        <div className="pt-4 border-t border-emerald-200/60 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <label className="text-xs font-bold uppercase tracking-wider text-emerald-950 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
              <span>Select the 5-Day Week for Your Order:</span>
            </label>
            <span className="text-[11px] text-emerald-800 font-medium">
              Click any upcoming week below (Monday through Friday)
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {upcomingWeeks.map((week) => {
              const isSelected = activeWeeklyPlan?.id === week.id;
              return (
                <button
                  key={week.id}
                  type="button"
                  onClick={() => setSelectedWeekId(week.id)}
                  className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer relative ${
                    isSelected
                      ? 'bg-[#00346f] text-white border-[#00346f] shadow-md ring-2 ring-[#ffdea5]/50 scale-[1.01]'
                      : 'bg-white hover:bg-emerald-50/80 border-emerald-200 text-gray-800 shadow-2xs'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] font-bold uppercase tracking-wider ${isSelected ? 'text-[#ffdea5]' : 'text-emerald-700'}`}>
                      {week.label}
                    </span>
                    {isSelected && (
                      <span className="w-2 h-2 rounded-full bg-[#ffdea5]" />
                    )}
                  </div>
                  <div className={`font-serif font-bold text-sm sm:text-base mt-1 ${isSelected ? 'text-white' : 'text-gray-900'}`}>
                    {week.shortRange}
                  </div>
                  <div className={`text-[11px] mt-0.5 ${isSelected ? 'text-emerald-100' : 'text-gray-500'}`}>
                    Monday to Friday
                  </div>
                </button>
              );
            })}
          </div>

          {/* Active Selected Week Daily Schedule Preview */}
          {activeWeeklyPlan && (
            <div className="p-3.5 bg-white/95 rounded-2xl border border-emerald-200 text-xs text-emerald-950 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 shadow-2xs">
              <div className="space-y-0.5">
                <span className="font-bold text-emerald-900 flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>Selected: <strong>{activeWeeklyPlan.label}</strong> ({activeWeeklyPlan.rangeLabel})</span>
                </span>
                <span className="text-[11px] text-gray-500 block">
                  Includes 1 daily homestyle dabba (fresh roti, rice, dal &amp; sabzi) prepared fresh for pickup on each day:
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-1.5 font-mono text-[11px]">
                {activeWeeklyPlan.days.map((day) => (
                  <span key={day.dateStr} className="px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 font-semibold shadow-2xs">
                    {day.dayName.slice(0, 3)}: {day.displayDate}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── 3. DAILY DABBA SELECTION (NEXT DAY TILL SUNDAY) ── */}
      <div className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-8 shadow-xs space-y-6">
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#775a19] block">
                DAILY HOMESTYLE TIFFIN SELECTION
              </span>
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#00346f]">
                Order by the Day (Next Day through Sunday)
              </h2>
            </div>

            <div className="text-xs text-gray-500 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
              <span>Central Time (Little Elm, TX) • Sunday Closed</span>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Select a day from tomorrow onwards to view the scheduled menu and order Single or Family Dabbas.
          </p>
        </div>

        {/* Day Pills Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {schedule.map(day => {
            const isSelected = selectedDayTab === day.dateStr;
            return (
              <button
                key={day.dateStr}
                type="button"
                onClick={() => setSelectedDayTab(day.dateStr)}
                className={`flex-1 min-w-[120px] p-3 rounded-2xl border text-left transition-all cursor-pointer ${
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
                    {day.dayName}
                  </span>
                  {day.isSaturdaySpecial && (
                    <span className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded ${
                      isSelected ? 'bg-[#ffdea5] text-[#00346f]' : 'bg-purple-100 text-purple-800'
                    }`}>
                      Special
                    </span>
                  )}
                  {day.isSundayClosed && (
                    <span className="text-[9px] font-bold text-amber-800">
                      Closed
                    </span>
                  )}
                </div>
                <span className={`text-[11px] block mt-0.5 ${isSelected ? 'text-gray-200' : 'text-gray-500'}`}>
                  {day.displayDate}
                </span>
              </button>
            );
          })}
        </div>

        {/* Active Day Card Details & Ordering Controls */}
        {activeDay && (
          <div className="p-6 rounded-2xl bg-gray-50 border border-gray-250 space-y-6 animate-fade-in">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-serif text-2xl font-bold text-[#00346f]">
                    {activeDay.dayName} — {activeDay.displayDate}
                  </span>
                  {activeDay.isSaturdaySpecial && (
                    <span className="px-2.5 py-0.5 bg-purple-100 text-purple-800 rounded-full text-xs font-bold uppercase tracking-wider">
                      Weekend Chef's Specials
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Status: <strong className={activeDay.isSelectable ? 'text-emerald-700' : 'text-rose-700'}>{activeDay.statusLabel}</strong>
                </p>
              </div>
            </div>

            {/* Saturday: Render ONLY Weekend Chef's Special Dishes */}
            {activeDay.isSaturdaySpecial ? (
              <div className="space-y-4 pt-1">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b border-purple-200 gap-2">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-purple-700 block">
                      WEEKEND CHEF'S SPECIAL DISHES
                    </span>
                    <h4 className="font-serif font-bold text-xl text-[#00346f]">
                      Saturday Specialties &amp; Delicacies
                    </h4>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Handcrafted authentic delicacies made scratch-to-order for Saturday pickup.
                    </p>
                  </div>
                  <span className="text-xs text-purple-900 bg-purple-100 px-3 py-1.5 rounded-full font-bold self-start sm:self-auto">
                    Scratch-Cooked Weekend Flavors
                  </span>
                </div>

                {activeDay.isSelectable ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {specialsList.map(dish => {
                      const dishQty = getSpecialQty(dish.id);
                      const dishPrice = dish.price > 0 ? dish.price : 13.99;
                      return (
                        <div 
                          key={dish.id} 
                          className="p-4 rounded-2xl bg-white border border-purple-200 hover:border-purple-400 shadow-2xs flex flex-col justify-between space-y-3 transition-all"
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
                              <span className="text-[11px] font-semibold text-gray-600">Quantity:</span>
                              <div className="flex items-center bg-gray-100 rounded-lg p-0.5 border border-gray-200">
                                <button
                                  type="button"
                                  onClick={() => updateSpecialQty(dish.id, -1)}
                                  className="w-6 h-6 rounded flex items-center justify-center hover:bg-white text-gray-700 cursor-pointer"
                                  aria-label="Decrease quantity"
                                >
                                  <Minus className="w-3 h-3" />
                                </button>
                                <span className="w-6 text-center font-bold text-xs">{dishQty}</span>
                                <button
                                  type="button"
                                  onClick={() => updateSpecialQty(dish.id, 1)}
                                  className="w-6 h-6 rounded flex items-center justify-center hover:bg-white text-gray-700 cursor-pointer"
                                  aria-label="Increase quantity"
                                >
                                  <Plus className="w-3 h-3" />
                                </button>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleAddSpecialDish(dish, activeDay)}
                              className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-2xs cursor-pointer"
                            >
                              <Plus className="w-3.5 h-3.5 text-[#ffdea5]" />
                              <span>Add Special • ${(dishPrice * dishQty).toFixed(2)}</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-6 bg-white rounded-2xl border border-dashed border-gray-300 text-center space-y-2">
                    <AlertCircle className="w-8 h-8 mx-auto text-gray-400" />
                    <h4 className="font-serif font-bold text-base text-gray-700">
                      Ordering is closed for Saturday
                    </h4>
                    <p className="text-xs text-gray-500 max-w-md mx-auto">
                      To ensure fresh preparation from scratch, Saturday specials must be ordered at least 24 hours in advance.
                    </p>
                  </div>
                )}
              </div>
            ) : (
              /* Weekdays Mon-Fri: Daily Homestyle Courses & Single/Family Dabbas */
              <>
                {/* Dishes on this day */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-white rounded-xl border border-gray-250 flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
                      <Flame className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 block">Dal / Curry Course</span>
                      <span className="font-bold text-sm text-gray-900 block mt-0.5">{activeDay.dalOrCurry}</span>
                      <span className="text-xs text-gray-500 block mt-0.5">Slow-simmered, rich homestyle spices</span>
                    </div>
                  </div>

                  <div className="p-4 bg-white rounded-xl border border-gray-250 flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                      <Utensils className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 block">Dry Sabzi Course</span>
                      <span className="font-bold text-sm text-gray-900 block mt-0.5">{activeDay.sabzi}</span>
                      <span className="text-xs text-gray-500 block mt-0.5">Fresh seasonal vegetables sauteed with roasted jeera &amp; spices</span>
                    </div>
                  </div>
                </div>

                {/* Meal Contents Pill Summary */}
                <div className="p-3 bg-blue-50/70 border border-blue-200/80 rounded-xl flex flex-wrap items-center justify-between gap-2 text-xs text-[#00346f]">
                  <span className="font-bold">What is inside each daily Dabba:</span>
                  <div className="flex flex-wrap items-center gap-3 font-medium">
                    <span>🍚 1 Cup Basmati Rice</span>
                    <span>🫓 2 Fresh Tawa Roti</span>
                    <span>🥘 1 Cup Dal / Curry</span>
                    <span>🥗 1/2 Cup Dry Sabzi</span>
                  </div>
                </div>

                {/* Dabba Size Options Ordering Cards */}
                {activeDay.isSelectable ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    {/* Single Dabba ($11.99) */}
                    <div className="p-5 bg-white rounded-2xl border border-gray-300 hover:border-[#00346f] transition-all flex flex-col justify-between shadow-2xs space-y-4">
                      <div>
                        <div className="flex items-center justify-between">
                          <h4 className="font-serif font-bold text-lg text-gray-900">Single Dabba</h4>
                          <span className="px-2 py-0.5 bg-gray-100 rounded text-[10px] font-bold uppercase text-gray-600">Serves 1</span>
                        </div>
                        <span className="font-serif text-2xl font-black text-[#00346f] block mt-1">$11.99</span>
                        <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                          1 complete individual meal: 1 cup rice, 1 cup curry, 1/2 cup sabzi, 2 tawa roti. Perfect for dinner after work!
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleAddDailyDabba('single', activeDay)}
                        className="w-full inline-flex items-center justify-center gap-2 bg-[#00346f] hover:bg-[#00224d] text-white py-2.5 px-4 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-xs cursor-pointer"
                      >
                        <Plus className="w-4 h-4 text-[#ffdea5]" />
                        <span>Add Single Dabba ($11.99)</span>
                      </button>
                    </div>

                    {/* Family Dabba ($34.99) */}
                    <div className="p-5 bg-white rounded-2xl border border-gray-300 hover:border-[#00346f] transition-all flex flex-col justify-between shadow-2xs space-y-4">
                      <div>
                        <div className="flex items-center justify-between">
                          <h4 className="font-serif font-bold text-lg text-gray-900">Family Dabba</h4>
                          <span className="px-2 py-0.5 bg-[#ffdea5]/40 text-[#775a19] rounded text-[10px] font-bold uppercase">Serves 4</span>
                        </div>
                        <span className="font-serif text-2xl font-black text-[#00346f] block mt-1">$34.99</span>
                        <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                          4 complete meals: larger family portions of dal/curry, sabzi, 4 cups rice, 8 tawa rotis. Ideal for the entire family!
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleAddDailyDabba('family', activeDay)}
                        className="w-full inline-flex items-center justify-center gap-2 bg-[#775a19] hover:bg-[#5e4612] text-white py-2.5 px-4 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-xs cursor-pointer"
                      >
                        <Plus className="w-4 h-4 text-[#ffdea5]" />
                        <span>Add Family Dabba ($34.99)</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-6 bg-white rounded-2xl border border-dashed border-gray-300 text-center space-y-2">
                    <AlertCircle className="w-8 h-8 mx-auto text-gray-400" />
                    <h4 className="font-serif font-bold text-base text-gray-700">
                      {activeDay.isSundayClosed ? 'Kitchen Closed on Sundays' : 'Ordering is closed for this day'}
                    </h4>
                    <p className="text-xs text-gray-500 max-w-md mx-auto">
                      {activeDay.isSundayClosed
                        ? 'Our kitchen is closed on Sundays for deep sanitation and fresh market prep for the upcoming week.'
                        : 'To ensure fresh preparation from scratch, orders must be placed for tomorrow or upcoming days in the week.'}
                    </p>
                  </div>
                )}
              </>
            )}

          </div>
        )}

      </div>

      {/* ── 4. 16 OZ A LA CARTE CONTAINERS (FROM FLYER) ── */}
      <div className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-8 shadow-xs space-y-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#775a19] block">
            INDIVIDUAL ADD-ONS &amp; SIDES
          </span>
          <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#00346f]">
            16 oz Containers Also Available
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Add extra tubs of slow-cooked gravies, paneer, dry sabzi, fragrant rice or cooling raita to your meal.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
          {EXTRA_CONTAINERS.map(c => (
            <div key={c.id} className="p-4 rounded-2xl border border-gray-200 bg-gray-50/70 hover:bg-white hover:border-[#00346f] transition-all flex flex-col justify-between gap-3 shadow-2xs">
              <div>
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-xs sm:text-sm text-gray-900">{c.name}</h4>
                  <span className="font-serif font-black text-sm text-[#00346f]">${c.price.toFixed(2)}</span>
                </div>
                <p className="text-[11px] text-gray-500 mt-1">{c.description}</p>
              </div>

              <button
                type="button"
                onClick={() => handleAddContainer(c)}
                className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border border-[#00346f] text-[#00346f] hover:bg-[#00346f] hover:text-white transition-colors text-xs font-bold uppercase tracking-wider cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add 16 oz Tub</span>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* ── 5. CURRENT TIFFIN CART ITEMS SUMMARY ── */}
      {tiffinCartItems.length > 0 && (
        <div className="p-5 bg-blue-50/50 rounded-2xl border border-blue-200 space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-serif font-bold text-sm text-[#00346f]">
              Tiffin Meals in Your Current Order ({tiffinCartItems.length})
            </span>
            <span className="text-xs font-bold text-gray-700">
              Subtotal: ${tiffinCartItems.reduce((s, i) => s + i.totalPrice, 0).toFixed(2)}
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
                      className="p-1 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 cursor-pointer"
                      title="Remove from cart"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Direct Proceed to Checkout with Tiffin Meals Button */}
          {onProceedToCheckout && (
            <button
              type="button"
              onClick={onProceedToCheckout}
              className="w-full mt-3 py-3 px-4 rounded-xl bg-[#00346f] hover:bg-[#00224d] text-white text-xs sm:text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm cursor-pointer transition-all hover:scale-[1.01]"
            >
              <span>Proceed to Checkout with {tiffinCartItems.length} Tiffin Meal{tiffinCartItems.length !== 1 ? 's' : ''} (${tiffinCartItems.reduce((s, i) => s + i.totalPrice, 0).toFixed(2)})</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      )}

      {/* ── 6. TEXAS COTTAGE FOOD & HOME KITCHEN LEGAL DISCLAIMER ── */}
      <div className="rounded-2xl border border-amber-300/80 bg-gradient-to-r from-amber-50/90 via-orange-50/40 to-amber-50/90 p-5 sm:p-6 text-xs text-amber-950 space-y-3 shadow-xs">
        <div className="flex items-center gap-2 text-amber-900 font-bold uppercase tracking-wider text-[11px]">
          <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
          <span>Texas Cottage Food Production &amp; Residential Kitchen Safety Disclosure</span>
        </div>
        <p className="leading-relaxed">
          <strong>Notice under Texas Cottage Food Law:</strong> This food is made in a home kitchen and is not inspected by the Department of State Health Services or a local health department. All meals are prepared with strict culinary hygiene in a private residential kitchen located in Little Elm, Texas.
        </p>
        <div className="p-3 bg-white/70 rounded-xl border border-amber-200/80 space-y-1 text-[11.5px] leading-relaxed">
          <strong className="block text-amber-900 font-bold">Food Allergen &amp; Cross-Contact Advisory:</strong>
          <p>
            While our home kitchen maintains a strictly <strong>100% vegetarian standard</strong> with zero meat, fish, or egg products handled, all foods are prepared in a private residential kitchen where common Indian culinary allergens and ingredients are present and regularly used. Typical allergens found in our kitchen include: <strong>Dairy (Milk, Paneer, Ghee, Butter), Wheat / Gluten, Tree Nuts (Almonds, Cashews, Pistachios), Peanuts, Mustard Seeds, Sesame, and Soy</strong>.
          </p>
          <p className="text-[11px] text-amber-800 italic pt-1">
            Individuals with severe food sensitivities or life-threatening anaphylactic allergies should take note prior to placing an order. Please let us know of any mild dietary requirements in your order notes.
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-amber-250/60 text-[11px] text-amber-900 font-medium">
          <span className="flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-amber-700" />
            <span>Fulfillment Location: <strong>Home Kitchen - Deerwood Dr, Little Elm, TX</strong></span>
          </span>
          <span className="bg-amber-100 text-amber-900 px-2 py-0.5 rounded font-bold">
            🚗 Self-Pickup Only (No Delivery for Tiffin Orders)
          </span>
          <span>📞 Direct Kitchen Desk: <strong>945-527-4566</strong></span>
        </div>
      </div>

      {/* ── LIGHTBOX MODAL FOR WEEKLY FLYER (PORTAL TO BODY) ── */}
      {isLightboxOpen && typeof document !== 'undefined' && createPortal(
        <div 
          onClick={() => setIsLightboxOpen(false)}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 sm:p-6"
          role="dialog"
          aria-modal="true"
        >
          <div 
            onClick={(e) => e.stopPropagation()} 
            className="relative w-full max-w-2xl max-h-[90vh] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden"
          >
            <div className="bg-[#00346f] text-white p-3.5 px-4 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#ffdea5]" />
                <span className="font-serif font-bold text-xs sm:text-sm uppercase tracking-wider text-[#ffdea5]">
                  {settings.weekTitle || "Desi Dabba — This Week's Menu"}
                </span>
              </div>
              <button 
                type="button"
                onClick={() => setIsLightboxOpen(false)}
                className="p-1 rounded-full text-white/80 hover:text-white hover:bg-white/20 transition cursor-pointer"
                title="Close flyer"
                aria-label="Close flyer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-3 bg-neutral-900/10 flex items-center justify-center overflow-auto max-h-[calc(90vh-50px)]">
              <img 
                src={settings.flyerImageUrl || '/tiffin-flyer.jpg'} 
                alt="Flyer Expanded" 
                className="max-h-[80vh] w-auto max-w-full object-contain rounded-lg shadow-sm"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/tiffin-flyer.jpg';
                }}
              />
            </div>
          </div>
        </div>,
        document.body
      )}

    </div>
  );
}
