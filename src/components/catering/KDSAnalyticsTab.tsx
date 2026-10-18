import { useMemo, useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingBag,
  Award,
  Calendar,
  Utensils,
  Cake,
  Package,
  BarChart3,
  Layers
} from 'lucide-react';
import type { CateringOrder, CartItem } from '../../types/catering';
import { getCentralTimeNow } from '../../utils/centralTime';

interface KDSAnalyticsTabProps {
  orders: CateringOrder[];
}

export type PrimarySegment = 'tiffin' | 'catering' | 'cakes';

export function classifyOrderItemSegment(item: CartItem): PrimarySegment {
  const cat = (item.category || '').toLowerCase();
  const sel = (item.selectionType || '').toLowerCase();
  const id = (item.menuItemId || '').toLowerCase();
  const label = (item.categoryLabel || '').toLowerCase();
  const name = (item.name || '').toLowerCase();

  if (
    cat === 'cakes' ||
    sel === 'cake_custom' ||
    id.startsWith('cake-') ||
    id.startsWith('cupcake-') ||
    label.includes('cake') ||
    label.includes('bakery') ||
    name.includes('cake') ||
    name.includes('cupcake')
  ) {
    return 'cakes';
  }

  if (
    cat === 'tiffin' ||
    sel.startsWith('tiffin_') ||
    sel.startsWith('container_') ||
    id.startsWith('tiffin-') ||
    id.startsWith('special-') ||
    id.startsWith('addon-') ||
    label.includes('tiffin') ||
    label.includes('dabba')
  ) {
    return 'tiffin';
  }

  return 'catering';
}

/**
 * Strips leading "[YYYY-MM-DD] " date prefixes from multi-day Tiffin item names
 * so dishes ordered across different days aggregate cleanly into one dish entry.
 */
export function normalizeDishName(rawName: string): string {
  return (rawName || 'Unnamed Item').replace(/^\[\d{4}-\d{2}-\d{2}\]\s*/, '').trim();
}

/**
 * Extracts flavor name from custom cake notes if present, e.g. "Flavor: Rasmalai | ..."
 */
function extractCakeFlavor(item: CartItem): string | null {
  if (!item.notes) return null;
  const match = item.notes.match(/Flavor:\s*([^|]+)/i);
  return match ? match[1].trim() : null;
}

function formatMonthLabel(ym: string): string {
  if (ym === 'all') return 'All Time';
  const [y, m] = ym.split('-').map(Number);
  if (!y || !m) return ym;
  const date = new Date(y, m - 1, 1);
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

function getPreviousMonthKey(ym: string): string | null {
  if (ym === 'all') return null;
  const [y, m] = ym.split('-').map(Number);
  if (!y || !m) return null;
  const prevDate = new Date(y, m - 2, 1);
  return `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, '0')}`;
}

interface DishStat {
  key: string;
  name: string;
  subLabel: string;
  totalQty: number;
  totalRevenue: number;
  orderCount: number;
  unitBreakdown: Record<string, number>;
}

export default function KDSAnalyticsTab({ orders }: KDSAnalyticsTabProps) {
  const { dateStr: todayDateStr } = getCentralTimeNow();
  const currentMonthKey = todayDateStr.slice(0, 7); // YYYY-MM

  // Valid non-cancelled orders
  const validOrders = useMemo(
    () => orders.filter(o => o.status !== 'cancelled' && !o.is_cancelled),
    [orders]
  );

  // Build available months list (current month + past 5 months + any month in orders)
  const availableMonths = useMemo(() => {
    const set = new Set<string>();
    set.add(currentMonthKey);

    const [cy, cm] = currentMonthKey.split('-').map(Number);
    for (let i = 1; i <= 5; i++) {
      const d = new Date(cy, cm - 1 - i, 1);
      set.add(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
    }

    validOrders.forEach(o => {
      if (o.fulfillment_date && o.fulfillment_date.length >= 7) {
        set.add(o.fulfillment_date.slice(0, 7));
      }
    });

    return Array.from(set).sort((a, b) => b.localeCompare(a));
  }, [validOrders, currentMonthKey]);

  const [selectedMonth, setSelectedMonth] = useState<string>(currentMonthKey);
  const [chartMetric, setChartMetric] = useState<'revenue' | 'orders'>('revenue');

  // Filter orders for selected month (and previous month for MoM comparison)
  const prevMonthKey = useMemo(() => getPreviousMonthKey(selectedMonth), [selectedMonth]);

  const monthOrders = useMemo(() => {
    if (selectedMonth === 'all') return validOrders;
    return validOrders.filter(o => (o.fulfillment_date || '').startsWith(selectedMonth));
  }, [validOrders, selectedMonth]);

  const prevMonthOrders = useMemo(() => {
    if (!prevMonthKey) return [];
    return validOrders.filter(o => (o.fulfillment_date || '').startsWith(prevMonthKey));
  }, [validOrders, prevMonthKey]);

  // Core KPIs
  const kpis = useMemo(() => {
    const grossRevenue = monthOrders.reduce((s, o) => s + (o.total_amount || 0), 0);
    const prevGrossRevenue = prevMonthOrders.reduce((s, o) => s + (o.total_amount || 0), 0);
    const netFoodRevenue = monthOrders.reduce((s, o) => {
      const base = o.food_subtotal || 0;
      const disc = o.discount_amount || 0;
      const reb = o.rebate_amount || 0;
      return s + Math.max(0, base - disc - reb);
    }, 0);
    const totalTax = monthOrders.reduce((s, o) => s + (o.tax_amount || 0), 0);
    const orderCount = monthOrders.length;
    const prevOrderCount = prevMonthOrders.length;
    const aov = orderCount > 0 ? grossRevenue / orderCount : 0;
    const deliveryCount = monthOrders.filter(o => o.is_delivery).length;
    const pickupCount = orderCount - deliveryCount;

    const revChangePct =
      prevGrossRevenue > 0
        ? ((grossRevenue - prevGrossRevenue) / prevGrossRevenue) * 100
        : null;
    const orderChangePct =
      prevOrderCount > 0
        ? ((orderCount - prevOrderCount) / prevOrderCount) * 100
        : null;

    // Segment breakdown
    const segmentRevenue: Record<PrimarySegment, number> = {
      tiffin: 0,
      catering: 0,
      cakes: 0
    };
    const segmentUnits: Record<PrimarySegment, number> = {
      tiffin: 0,
      catering: 0,
      cakes: 0
    };

    monthOrders.forEach(order => {
      (order.items || []).forEach(item => {
        const seg = classifyOrderItemSegment(item);
        const itemRev = item.totalPrice || item.unitPrice * item.quantity || 0;
        segmentRevenue[seg] += itemRev;
        segmentUnits[seg] += item.quantity || 0;
      });
    });

    const totalItemRevenue =
      segmentRevenue.tiffin + segmentRevenue.catering + segmentRevenue.cakes;

    return {
      grossRevenue,
      netFoodRevenue,
      totalTax,
      orderCount,
      aov,
      deliveryCount,
      pickupCount,
      revChangePct,
      orderChangePct,
      segmentRevenue,
      segmentUnits,
      totalItemRevenue
    };
  }, [monthOrders, prevMonthOrders]);

  // Daily / Monthly Trend Series for the Chart
  const trendSeries = useMemo(() => {
    if (selectedMonth === 'all') {
      // Group by YYYY-MM across all time
      const map = new Map<
        string,
        {
          label: string;
          shortLabel: string;
          revenue: number;
          orders: number;
          tiffinRev: number;
          cateringRev: number;
          cakesRev: number;
        }
      >();

      const sortedMonths = [...availableMonths].reverse();
      sortedMonths.forEach(ym => {
        const [y, m] = ym.split('-').map(Number);
        const d = new Date(y, m - 1, 1);
        map.set(ym, {
          label: formatMonthLabel(ym),
          shortLabel: d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
          revenue: 0,
          orders: 0,
          tiffinRev: 0,
          cateringRev: 0,
          cakesRev: 0
        });
      });

      validOrders.forEach(o => {
        const ym = (o.fulfillment_date || '').slice(0, 7);
        if (!ym) return;
        if (!map.has(ym)) {
          map.set(ym, {
            label: formatMonthLabel(ym),
            shortLabel: ym,
            revenue: 0,
            orders: 0,
            tiffinRev: 0,
            cateringRev: 0,
            cakesRev: 0
          });
        }
        const entry = map.get(ym)!;
        entry.revenue += o.total_amount || 0;
        entry.orders += 1;
        (o.items || []).forEach(item => {
          const seg = classifyOrderItemSegment(item);
          const rev = item.totalPrice || item.unitPrice * item.quantity || 0;
          if (seg === 'tiffin') entry.tiffinRev += rev;
          else if (seg === 'cakes') entry.cakesRev += rev;
          else entry.cateringRev += rev;
        });
      });

      return Array.from(map.values());
    }

    // Specific YYYY-MM: generate all days of that month (1..daysInMonth)
    const [year, month] = selectedMonth.split('-').map(Number);
    const daysInMonth = new Date(year, month, 0).getDate();
    const days: {
      dateStr: string;
      label: string;
      shortLabel: string;
      weekday: string;
      revenue: number;
      orders: number;
      tiffinRev: number;
      cateringRev: number;
      cakesRev: number;
    }[] = [];

    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${selectedMonth}-${String(day).padStart(2, '0')}`;
      const dObj = new Date(year, month - 1, day);
      const weekday = dObj.toLocaleDateString('en-US', { weekday: 'short' });
      days.push({
        dateStr,
        label: `${weekday}, ${dObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`,
        shortLabel: String(day),
        weekday,
        revenue: 0,
        orders: 0,
        tiffinRev: 0,
        cateringRev: 0,
        cakesRev: 0
      });
    }

    const dayIndexMap = new Map(days.map((d, idx) => [d.dateStr, idx]));

    monthOrders.forEach(order => {
      const idx = dayIndexMap.get(order.fulfillment_date);
      if (idx === undefined) return;
      const bucket = days[idx];
      bucket.revenue += order.total_amount || 0;
      bucket.orders += 1;

      (order.items || []).forEach(item => {
        const seg = classifyOrderItemSegment(item);
        const rev = item.totalPrice || item.unitPrice * item.quantity || 0;
        if (seg === 'tiffin') bucket.tiffinRev += rev;
        else if (seg === 'cakes') bucket.cakesRev += rev;
        else bucket.cateringRev += rev;
      });
    });

    return days;
  }, [selectedMonth, monthOrders, validOrders, availableMonths]);

  // Weekly breakdown inside the selected month + Peak Day + Weekday demand
  const trendHighlights = useMemo(() => {
    let peakBucket = trendSeries[0] || null;
    trendSeries.forEach(b => {
      if (!peakBucket || b.revenue > peakBucket.revenue) {
        peakBucket = b;
      }
    });

    // Weekly buckets (Week 1: days 1-7, Week 2: 8-14, Week 3: 15-21, Week 4: 22-28, Week 5: 29+)
    const weeks = [
      { label: 'Week 1 (1–7)', revenue: 0, orders: 0 },
      { label: 'Week 2 (8–14)', revenue: 0, orders: 0 },
      { label: 'Week 3 (15–21)', revenue: 0, orders: 0 },
      { label: 'Week 4 (22–28)', revenue: 0, orders: 0 },
      { label: 'Week 5 (29+)', revenue: 0, orders: 0 }
    ];

    if (selectedMonth !== 'all') {
      trendSeries.forEach((b, idx) => {
        const wIdx = Math.min(4, Math.floor(idx / 7));
        weeks[wIdx].revenue += b.revenue;
        weeks[wIdx].orders += b.orders;
      });
    }

    // Day-of-week demand
    const weekdayOrder = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const weekdayTotals: Record<string, { revenue: number; orders: number }> = {
      Mon: { revenue: 0, orders: 0 },
      Tue: { revenue: 0, orders: 0 },
      Wed: { revenue: 0, orders: 0 },
      Thu: { revenue: 0, orders: 0 },
      Fri: { revenue: 0, orders: 0 },
      Sat: { revenue: 0, orders: 0 },
      Sun: { revenue: 0, orders: 0 }
    };

    monthOrders.forEach(o => {
      if (!o.fulfillment_date) return;
      const [y, m, d] = o.fulfillment_date.split('-').map(Number);
      if (!y || !m || !d) return;
      const wd = new Date(y, m - 1, d).toLocaleDateString('en-US', { weekday: 'short' });
      if (weekdayTotals[wd]) {
        weekdayTotals[wd].revenue += o.total_amount || 0;
        weekdayTotals[wd].orders += 1;
      }
    });

    const weekdayStats = weekdayOrder.map(day => ({
      day,
      revenue: weekdayTotals[day].revenue,
      orders: weekdayTotals[day].orders
    }));

    return { peakBucket, weeks: weeks.filter(w => w.orders > 0 || selectedMonth !== 'all'), weekdayStats };
  }, [trendSeries, selectedMonth, monthOrders]);

  // Top Dishes Per Category (Tiffin, Catering, Cakes & Bakery) + Top Cake Flavors
  const topDishesByCategory = useMemo(() => {
    const maps: Record<PrimarySegment, Map<string, DishStat>> = {
      tiffin: new Map(),
      catering: new Map(),
      cakes: new Map()
    };

    const cakeFlavorsMap = new Map<string, { flavor: string; count: number; revenue: number }>();

    monthOrders.forEach(order => {
      const seenInOrder = new Set<string>();

      (order.items || []).forEach(item => {
        const segment = classifyOrderItemSegment(item);
        const cleanName = normalizeDishName(item.name);
        const flavor = segment === 'cakes' ? extractCakeFlavor(item) : null;

        // Track Cake Flavors separately as well
        if (segment === 'cakes' && flavor) {
          const prevF = cakeFlavorsMap.get(flavor) || { flavor, count: 0, revenue: 0 };
          prevF.count += item.quantity || 1;
          prevF.revenue += item.totalPrice || item.unitPrice * item.quantity || 0;
          cakeFlavorsMap.set(flavor, prevF);
        }

        // For custom cakes, include flavor in the dish name if generic
        const displayKey =
          segment === 'cakes' && flavor && !cleanName.toLowerCase().includes(flavor.toLowerCase())
            ? `${cleanName} — ${flavor}`
            : cleanName;

        const map = maps[segment];
        if (!map.has(displayKey)) {
          map.set(displayKey, {
            key: displayKey,
            name: displayKey,
            subLabel: item.tier ? `${item.tier} • ${item.categoryLabel}` : item.categoryLabel || '',
            totalQty: 0,
            totalRevenue: 0,
            orderCount: 0,
            unitBreakdown: {}
          });
        }

        const stat = map.get(displayKey)!;
        const qty = item.quantity || 0;
        const rev = item.totalPrice || item.unitPrice * qty || 0;
        stat.totalQty += qty;
        stat.totalRevenue += rev;

        if (!seenInOrder.has(`${segment}:${displayKey}`)) {
          stat.orderCount += 1;
          seenInOrder.add(`${segment}:${displayKey}`);
        }

        const unitLabel =
          item.selectionType === 'full'
            ? 'Full Tray'
            : item.selectionType === 'half'
            ? 'Half Tray'
            : item.selectionType === 'third'
            ? '1/3 Tray'
            : item.selectionType === 'tiffin_single'
            ? 'Single Dabba'
            : item.selectionType === 'tiffin_family'
            ? 'Family Dabba'
            : item.selectionType === 'tiffin_weekly'
            ? 'Weekly Pass'
            : item.selectionType === 'container_16oz'
            ? '16oz'
            : item.selectionType === 'container_8oz'
            ? '8oz'
            : item.selectionLabel || 'Unit';

        stat.unitBreakdown[unitLabel] = (stat.unitBreakdown[unitLabel] || 0) + qty;
      });
    });

    const sortDishes = (m: Map<string, DishStat>) =>
      Array.from(m.values()).sort((a, b) => {
        if (b.totalQty !== a.totalQty) return b.totalQty - a.totalQty;
        return b.totalRevenue - a.totalRevenue;
      });

    return {
      tiffin: sortDishes(maps.tiffin),
      catering: sortDishes(maps.catering),
      cakes: sortDishes(maps.cakes),
      topCakeFlavors: Array.from(cakeFlavorsMap.values()).sort((a, b) => b.count - a.count)
    };
  }, [monthOrders]);

  const maxChartVal = useMemo(() => {
    const vals = trendSeries.map(d => (chartMetric === 'revenue' ? d.revenue : d.orders));
    return Math.max(...vals, 1);
  }, [trendSeries, chartMetric]);

  const maxWeekdayRevenue = useMemo(() => {
    return Math.max(...trendHighlights.weekdayStats.map(w => w.revenue), 1);
  }, [trendHighlights.weekdayStats]);

  return (
    <div className="space-y-5 animate-fade-in">
      {/* ── 1. ANALYTICS FILTER BAR & MONTH SELECTOR ── */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-[#00346f]" />
            <h2 className="font-serif text-lg sm:text-xl font-bold text-[#00346f]">
              Monthly Performance &amp; Dish Intelligence
            </h2>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            Live revenue trends and top-selling dishes across <strong>Daily Tiffin</strong>, <strong>Party Catering</strong>, and <strong>Cakes &amp; Bakery</strong>.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5">
            <Calendar className="w-4 h-4 text-[#775a19]" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">Period:</span>
            <select
              value={selectedMonth}
              onChange={e => setSelectedMonth(e.target.value)}
              className="bg-transparent text-xs font-extrabold text-[#00346f] focus:outline-none cursor-pointer pr-1"
            >
              {availableMonths.map(ym => (
                <option key={ym} value={ym}>
                  {formatMonthLabel(ym)} {ym === currentMonthKey ? '(Current)' : ''}
                </option>
              ))}
              <option value="all">All Time Summary</option>
            </select>
          </div>
        </div>
      </div>

      {/* ── 2. EXECUTIVE KPI SUMMARY STRIP ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Card 1: Monthly Gross Revenue */}
        <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
              {selectedMonth === 'all' ? 'All-Time Revenue' : 'Monthly Gross Revenue'}
            </span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>

          <div className="my-2">
            <div className="font-serif text-2xl sm:text-3xl font-bold text-gray-900">
              ${kpis.grossRevenue.toFixed(2)}
            </div>
            <div className="text-[11px] text-gray-500 mt-0.5">
              Net Food Base: <strong className="text-gray-800">${kpis.netFoodRevenue.toFixed(2)}</strong> • Tax: ${kpis.totalTax.toFixed(2)}
            </div>
          </div>

          {kpis.revChangePct !== null ? (
            <div className={`inline-flex items-center gap-1 text-[11px] font-bold ${
              kpis.revChangePct >= 0 ? 'text-emerald-700' : 'text-rose-600'
            }`}>
              {kpis.revChangePct >= 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
              <span>{kpis.revChangePct >= 0 ? '+' : ''}{kpis.revChangePct.toFixed(1)}% vs prior month</span>
            </div>
          ) : (
            <span className="text-[10px] text-gray-400 font-medium">
              {formatMonthLabel(selectedMonth)}
            </span>
          )}
        </div>

        {/* Card 2: Total Orders & Fulfillment Mix */}
        <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
              Orders Scheduled
            </span>
            <div className="p-2 rounded-xl bg-blue-50 text-[#00346f]">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>

          <div className="my-2">
            <div className="font-serif text-2xl sm:text-3xl font-bold text-[#00346f]">
              {kpis.orderCount}
            </div>
            <div className="text-[11px] text-gray-500 mt-0.5">
              🏪 <strong>{kpis.pickupCount}</strong> Pickup • 🚚 <strong>{kpis.deliveryCount}</strong> Delivery
            </div>
          </div>

          {kpis.orderChangePct !== null ? (
            <div className={`inline-flex items-center gap-1 text-[11px] font-bold ${
              kpis.orderChangePct >= 0 ? 'text-emerald-700' : 'text-rose-600'
            }`}>
              {kpis.orderChangePct >= 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
              <span>{kpis.orderChangePct >= 0 ? '+' : ''}{kpis.orderChangePct.toFixed(1)}% vs prior month</span>
            </div>
          ) : (
            <span className="text-[10px] text-gray-400 font-medium">
              Excluding cancelled tickets
            </span>
          )}
        </div>

        {/* Card 3: Average Order Value & Units */}
        <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
              Avg Order Value (AOV)
            </span>
            <div className="p-2 rounded-xl bg-amber-50 text-[#775a19]">
              <Award className="w-4 h-4" />
            </div>
          </div>

          <div className="my-2">
            <div className="font-serif text-2xl sm:text-3xl font-bold text-[#775a19]">
              ${kpis.aov.toFixed(2)}
            </div>
            <div className="text-[11px] text-gray-500 mt-0.5">
              <strong>{kpis.segmentUnits.tiffin + kpis.segmentUnits.catering + kpis.segmentUnits.cakes}</strong> total dishes/units ordered
            </div>
          </div>

          <span className="text-[10px] text-gray-400 font-medium">
            {trendHighlights.peakBucket && trendHighlights.peakBucket.revenue > 0
              ? `Peak: ${trendHighlights.peakBucket.label} ($${trendHighlights.peakBucket.revenue.toFixed(0)})`
              : 'No peak recorded yet'}
          </span>
        </div>

        {/* Card 4: Category Revenue Mix */}
        <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
              Category Revenue Share
            </span>
            <div className="p-2 rounded-xl bg-purple-50 text-purple-700">
              <Layers className="w-4 h-4" />
            </div>
          </div>

          {/* Stacked visual bar */}
          <div className="my-2 space-y-2">
            <div className="h-2.5 w-full rounded-full bg-gray-100 overflow-hidden flex">
              {kpis.totalItemRevenue > 0 ? (
                <>
                  <div
                    style={{ width: `${(kpis.segmentRevenue.tiffin / kpis.totalItemRevenue) * 100}%` }}
                    className="bg-amber-500 h-full transition-all"
                    title={`Tiffin: $${kpis.segmentRevenue.tiffin.toFixed(2)}`}
                  />
                  <div
                    style={{ width: `${(kpis.segmentRevenue.catering / kpis.totalItemRevenue) * 100}%` }}
                    className="bg-[#00346f] h-full transition-all"
                    title={`Catering: $${kpis.segmentRevenue.catering.toFixed(2)}`}
                  />
                  <div
                    style={{ width: `${(kpis.segmentRevenue.cakes / kpis.totalItemRevenue) * 100}%` }}
                    className="bg-pink-500 h-full transition-all"
                    title={`Cakes & Bakery: $${kpis.segmentRevenue.cakes.toFixed(2)}`}
                  />
                </>
              ) : (
                <div className="w-full h-full bg-gray-200" />
              )}
            </div>

            <div className="grid grid-cols-3 gap-1 text-[10px]">
              <div className="bg-amber-50/80 border border-amber-200/70 rounded-lg p-1.5">
                <span className="font-bold text-amber-900 block truncate">🍱 Tiffin</span>
                <span className="font-mono font-extrabold text-gray-900">${kpis.segmentRevenue.tiffin.toFixed(0)}</span>
              </div>
              <div className="bg-blue-50/80 border border-blue-200/70 rounded-lg p-1.5">
                <span className="font-bold text-[#00346f] block truncate">🍛 Catering</span>
                <span className="font-mono font-extrabold text-gray-900">${kpis.segmentRevenue.catering.toFixed(0)}</span>
              </div>
              <div className="bg-pink-50/80 border border-pink-200/70 rounded-lg p-1.5">
                <span className="font-bold text-pink-900 block truncate">🎂 Cakes</span>
                <span className="font-mono font-extrabold text-gray-900">${kpis.segmentRevenue.cakes.toFixed(0)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── 3. MONTHLY TREND CHART & WEEKDAY DEMAND ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Daily / Monthly Trend Bar Chart (2 Columns on Desktop) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 p-4 sm:p-5 shadow-xs flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-gray-150">
            <div>
              <h3 className="font-serif font-bold text-base text-[#00346f]">
                {selectedMonth === 'all' ? 'Monthly Trend Overview' : `Daily Trend — ${formatMonthLabel(selectedMonth)}`}
              </h3>
              <p className="text-[11px] text-gray-500">
                Hover or tap any bar to inspect daily revenue &amp; order count
              </p>
            </div>

            <div className="inline-flex items-center bg-gray-100 p-1 rounded-xl self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setChartMetric('revenue')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                  chartMetric === 'revenue'
                    ? 'bg-white text-[#00346f] shadow-2xs'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Revenue ($)
              </button>
              <button
                type="button"
                onClick={() => setChartMetric('orders')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                  chartMetric === 'orders'
                    ? 'bg-white text-[#00346f] shadow-2xs'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Orders (#)
              </button>
            </div>
          </div>

          {/* Interactive Bar Chart Container */}
          <div className="pt-6 pb-2 overflow-x-auto">
            <div className="min-w-[540px] h-44 flex items-end gap-1.5 px-1 border-b border-gray-200 pb-2">
              {trendSeries.map((point, idx) => {
                const val = chartMetric === 'revenue' ? point.revenue : point.orders;
                const heightPct = val > 0 ? Math.max(8, Math.round((val / maxChartVal) * 100)) : 2;
                const isToday = 'dateStr' in point && point.dateStr === todayDateStr;

                return (
                  <div
                    key={idx}
                    className="flex-1 flex flex-col items-center justify-end h-full group relative"
                  >
                    {/* Hover Tooltip */}
                    <div className="opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity absolute -top-7 z-20 bg-gray-900 text-white text-[10px] font-semibold px-2 py-1 rounded-md whitespace-nowrap shadow-md">
                      {point.label}: ${point.revenue.toFixed(0)} ({point.orders} ord)
                    </div>

                    {/* Value label above non-zero bars */}
                    {val > 0 && (
                      <span className="text-[9px] font-mono font-bold text-[#00346f] mb-1">
                        {chartMetric === 'revenue' ? `$${Math.round(val)}` : val}
                      </span>
                    )}

                    {/* Bar */}
                    <div
                      style={{ height: `${heightPct}%` }}
                      className={`w-full max-w-[22px] rounded-t-md transition-all ${
                        val === 0
                          ? 'bg-gray-100'
                          : isToday
                          ? 'bg-amber-500 ring-2 ring-amber-300'
                          : 'bg-gradient-to-t from-[#00346f] to-blue-500 group-hover:from-[#775a19] group-hover:to-amber-500'
                      }`}
                    />
                  </div>
                );
              })}
            </div>

            {/* X-Axis Labels */}
            <div className="min-w-[540px] flex items-center gap-1.5 px-1 pt-1.5">
              {trendSeries.map((point, idx) => {
                const isToday = 'dateStr' in point && point.dateStr === todayDateStr;
                return (
                  <div key={idx} className="flex-1 text-center">
                    <span
                      className={`text-[9px] font-mono block leading-none ${
                        isToday
                          ? 'font-black text-amber-700 underline'
                          : point.orders > 0
                          ? 'font-bold text-gray-800'
                          : 'text-gray-400'
                      }`}
                    >
                      {point.shortLabel}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Weekly Summary Pills inside the Month */}
          {selectedMonth !== 'all' && (
            <div className="pt-3 mt-2 border-t border-gray-100 grid grid-cols-2 sm:grid-cols-5 gap-2">
              {trendHighlights.weeks.map((w, i) => (
                <div key={i} className="bg-gray-50 rounded-xl px-2.5 py-2 border border-gray-200/70 text-xs">
                  <span className="text-[10px] font-bold text-gray-500 block">{w.label}</span>
                  <div className="flex items-baseline justify-between mt-0.5">
                    <span className="font-mono font-extrabold text-[#00346f]">${w.revenue.toFixed(0)}</span>
                    <span className="text-[10px] text-gray-500 font-semibold">{w.orders} ord</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Day-of-Week Demand Breakdown (1 Column on Desktop) */}
        <div className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-5 shadow-xs flex flex-col justify-between">
          <div className="pb-3 border-b border-gray-150">
            <h3 className="font-serif font-bold text-base text-[#00346f]">
              Day-of-Week Demand
            </h3>
            <p className="text-[11px] text-gray-500">
              Which days of the week generate the highest kitchen volume
            </p>
          </div>

          <div className="py-3 space-y-2.5 flex-1 flex flex-col justify-center">
            {trendHighlights.weekdayStats.map(stat => {
              const pct = stat.revenue > 0 ? Math.max(6, Math.round((stat.revenue / maxWeekdayRevenue) * 100)) : 0;
              return (
                <div key={stat.day} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-gray-700 w-10">{stat.day}</span>
                    <div className="flex-1 mx-2 h-2.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        style={{ width: `${pct}%` }}
                        className="h-full bg-gradient-to-r from-[#00346f] to-[#775a19] rounded-full transition-all"
                      />
                    </div>
                    <span className="font-mono text-[11px] font-bold text-gray-900 w-24 text-right">
                      ${stat.revenue.toFixed(0)} <span className="text-gray-400 font-normal">({stat.orders})</span>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-2.5 border-t border-gray-100 text-[11px] text-gray-500 flex items-center justify-between">
            <span>Total Active Days:</span>
            <strong className="text-[#00346f]">
              {trendSeries.filter(d => d.orders > 0).length} days with orders
            </strong>
          </div>
        </div>
      </div>

      {/* ── 4. TOP DISHES ORDERED PER CATEGORY (3 LEADERBOARD COLUMNS) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* COLUMN 1: TOP TIFFIN DISHES & PLANS */}
        <CategoryLeaderboardCard
          title="Top Tiffin Dishes & Plans"
          subtitle="Daily Homestyle Dabbas, Weekly Passes & Regional Specials"
          badgeText="🍱 Tiffin"
          badgeClass="bg-amber-100 text-amber-900 border-amber-300"
          accentBarClass="bg-amber-500"
          icon={<Package className="w-4 h-4 text-amber-700" />}
          dishes={topDishesByCategory.tiffin}
          totalCategoryRevenue={kpis.segmentRevenue.tiffin}
          emptyMessage="No Tiffin dishes ordered in this period."
        />

        {/* COLUMN 2: TOP PARTY CATERING DISHES */}
        <CategoryLeaderboardCard
          title="Top Party Catering Dishes"
          subtitle="Khaas, Shahi, Darbari & Maharaja Trays, Starters & Breads"
          badgeText="🍛 Catering"
          badgeClass="bg-blue-100 text-[#00346f] border-blue-300"
          accentBarClass="bg-[#00346f]"
          icon={<Utensils className="w-4 h-4 text-[#00346f]" />}
          dishes={topDishesByCategory.catering}
          totalCategoryRevenue={kpis.segmentRevenue.catering}
          emptyMessage="No Party Catering trays ordered in this period."
        />

        {/* COLUMN 3: TOP CAKES & BAKERY ITEMS */}
        <CategoryLeaderboardCard
          title="Top Cakes & Bakery"
          subtitle="Custom Celebration Cakes, Eggless Fusion Flavors & Cupcakes"
          badgeText="🎂 Cakes & Bakery"
          badgeClass="bg-pink-100 text-pink-900 border-pink-300"
          accentBarClass="bg-pink-500"
          icon={<Cake className="w-4 h-4 text-pink-700" />}
          dishes={topDishesByCategory.cakes}
          totalCategoryRevenue={kpis.segmentRevenue.cakes}
          emptyMessage="No Cakes or Bakery items ordered in this period."
          extraFooter={
            topDishesByCategory.topCakeFlavors.length > 0 ? (
              <div className="pt-3 mt-3 border-t border-gray-150">
                <span className="text-[10px] font-bold uppercase tracking-wider text-pink-900 block mb-1.5">
                  Most Requested Cake Flavors:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {topDishesByCategory.topCakeFlavors.slice(0, 6).map(f => (
                    <span
                      key={f.flavor}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-pink-50 border border-pink-200 text-[11px] font-semibold text-pink-950"
                    >
                      <span>{f.flavor}</span>
                      <span className="font-mono font-bold text-pink-700">&times;{f.count}</span>
                    </span>
                  ))}
                </div>
              </div>
            ) : null
          }
        />
      </div>
    </div>
  );
}

interface CategoryLeaderboardCardProps {
  title: string;
  subtitle: string;
  badgeText: string;
  badgeClass: string;
  accentBarClass: string;
  icon: React.ReactNode;
  dishes: DishStat[];
  totalCategoryRevenue: number;
  emptyMessage: string;
  extraFooter?: React.ReactNode;
}

function CategoryLeaderboardCard({
  title,
  subtitle,
  badgeText,
  badgeClass,
  accentBarClass,
  icon,
  dishes,
  totalCategoryRevenue,
  emptyMessage,
  extraFooter
}: CategoryLeaderboardCardProps) {
  const maxQty = dishes.length > 0 ? Math.max(...dishes.map(d => d.totalQty), 1) : 1;

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-5 shadow-xs flex flex-col justify-between">
      <div>
        {/* Card Header */}
        <div className="flex items-start justify-between gap-2 pb-3 border-b border-gray-150">
          <div className="flex items-start gap-2.5">
            <div className="p-2 rounded-xl bg-gray-50 border border-gray-200 shrink-0 mt-0.5">
              {icon}
            </div>
            <div>
              <h3 className="font-serif font-bold text-base text-gray-900 leading-snug">
                {title}
              </h3>
              <p className="text-[11px] text-gray-500 mt-0.5">{subtitle}</p>
            </div>
          </div>
          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border shrink-0 ${badgeClass}`}>
            {badgeText}
          </span>
        </div>

        {/* Dish Leaderboard List */}
        {dishes.length === 0 ? (
          <div className="py-10 text-center text-xs text-gray-400 italic">
            {emptyMessage}
          </div>
        ) : (
          <div className="divide-y divide-gray-100 mt-2 max-h-[380px] overflow-y-auto pr-1">
            {dishes.slice(0, 10).map((dish, idx) => {
              const barPct = Math.max(8, Math.round((dish.totalQty / maxQty) * 100));
              const breakdownParts = Object.entries(dish.unitBreakdown).map(
                ([unit, count]) => `${count} ${unit}`
              );

              return (
                <div key={dish.key} className="py-2.5 space-y-1.5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2 min-w-0">
                      <span
                        className={`w-5 h-5 rounded-full text-[10px] font-black flex items-center justify-center shrink-0 mt-0.5 ${
                          idx === 0
                            ? 'bg-amber-400 text-gray-950 shadow-2xs'
                            : idx === 1
                            ? 'bg-gray-200 text-gray-800'
                            : idx === 2
                            ? 'bg-amber-100 text-amber-900'
                            : 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        {idx + 1}
                      </span>
                      <div className="min-w-0">
                        <span className="text-xs font-bold text-gray-900 block leading-snug">
                          {dish.name}
                        </span>
                        <span className="text-[10px] text-gray-500 block">
                          {breakdownParts.join(' • ')} ({dish.orderCount} {dish.orderCount === 1 ? 'order' : 'orders'})
                        </span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="font-mono text-xs font-extrabold text-[#00346f] block">
                        &times;{dish.totalQty}
                      </span>
                      <span className="font-mono text-[10px] text-gray-500 block">
                        ${dish.totalRevenue.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Popularity Bar */}
                  <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${barPct}%` }}
                      className={`h-full rounded-full ${accentBarClass}`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {extraFooter}
      </div>

      {/* Category Total Footer */}
      <div className="pt-3 mt-3 border-t border-gray-150 flex items-center justify-between text-xs">
        <span className="font-bold text-gray-500 uppercase tracking-wider text-[10px]">
          Category Total Revenue
        </span>
        <span className="font-serif font-bold text-sm text-[#00346f]">
          ${totalCategoryRevenue.toFixed(2)}
        </span>
      </div>
    </div>
  );
}
