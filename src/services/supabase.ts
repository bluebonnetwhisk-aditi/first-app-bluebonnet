import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { CateringOrder, CalendarBlackout, OrderStatus, TiffinMenuSettings, TiffinSpecialDish, WeekdayMenuEntry, ContainerAddonItem, DabbaPricing } from '../types/catering';
import { getCentralTimeNow } from '../utils/centralTime';

// Production Supabase Database Configuration
const DEFAULT_SUPABASE_URL = 'https://njpufcpzpcjgfsllaedo.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5qcHVmY3B6cGNqZ2ZzbGxhZWRvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAzNjU5MTgsImV4cCI6MjEwNTk0MTkxOH0.dzGN0MmyLxvUHAKkPl2m1lmhh9DX8v81qcFkxdtPEVY';

const SUPABASE_URL = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_URL)
  ? (import.meta.env.VITE_SUPABASE_URL as string)
  : DEFAULT_SUPABASE_URL;

const SUPABASE_ANON_KEY = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_ANON_KEY)
  ? (import.meta.env.VITE_SUPABASE_ANON_KEY as string)
  : DEFAULT_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(
  SUPABASE_URL && 
  SUPABASE_ANON_KEY && 
  !SUPABASE_URL.includes('your-supabase-url') &&
  !SUPABASE_ANON_KEY.includes('your-anon-key')
);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;

// SECURITY: Order / customer data (names, phones, emails, addresses, totals) is NEVER
// persisted in browser storage. Orders are read and modified only through the
// authenticated /api/kds/* serverless endpoints (HttpOnly signed session cookie).
const LOCAL_STORAGE_BLACKOUTS_KEY = 'bbw_catering_blackouts_cache';

// Legacy keys that once held PII / secrets. Purged from every visitor's browser on load.
const SENSITIVE_LEGACY_LOCAL_KEYS = [
  'bbw_catering_orders_cache',
  'bbw_kds_order_edits_v1',
  'bbw_kds_master_pin_v1',
  'bbw_gemini_api_key'
];
const SENSITIVE_LEGACY_SESSION_KEYS = ['bbw_kds_unlocked_session'];

export function purgeSensitiveLocalStorage(): void {
  try {
    if (typeof localStorage !== 'undefined') {
      SENSITIVE_LEGACY_LOCAL_KEYS.forEach(k => localStorage.removeItem(k));
    }
    if (typeof sessionStorage !== 'undefined') {
      SENSITIVE_LEGACY_SESSION_KEYS.forEach(k => sessionStorage.removeItem(k));
    }
  } catch {
    // ignore
  }
}
purgeSensitiveLocalStorage();

// Legacy dummy order IDs to filter from results
const LEGACY_DUMMY_ORDER_IDS = new Set<string>([
  '3942d890-a463-4783-8603-7756b9443879',
  '0b208604-621e-47af-a068-2f677ec13541',
  '247b89eb-87c4-41db-bc77-99e9946b546c',
  '54538d20-dbf8-49f2-9b18-0973cca6825c',
  '51badabe-cff4-4428-a737-17f52c507782',
  'c3109676-d615-476d-afe6-9e07e61b1753'
]);

function isDummyOrder(o: Partial<CateringOrder> | null | undefined): boolean {
  if (!o || !o.id) return false;
  if (LEGACY_DUMMY_ORDER_IDS.has(o.id)) return true;
  if (o.email && o.email.toLowerCase().endsWith('@example.com')) return true;
  return false;
}

function notifyOrdersUpdated(detail: Record<string, unknown> = { eventType: 'UPDATE' }): void {
  try {
    window.dispatchEvent(new CustomEvent('bbw_orders_updated', { detail }));
  } catch {
    // ignore
  }
}

/** Authenticated call to a KDS serverless endpoint. Emits `bbw_kds_unauthorized` on 401. */
export async function kdsApi(path: string, init: RequestInit = {}): Promise<Response> {
  const res = await fetch(path, {
    credentials: 'same-origin',
    ...init,
    headers: { 'Content-Type': 'application/json', ...(init.headers || {}) }
  });
  if (res.status === 401) {
    try {
      window.dispatchEvent(new CustomEvent('bbw_kds_unauthorized'));
    } catch {
      // ignore
    }
  }
  return res;
}

function getInitialMockBlackouts(): CalendarBlackout[] {
  return [
    { id: 1, closed_date: '2026-10-03', rule_type: 'single', reason: 'Kitchen closed due to high order volume' },
    { id: 2, closed_date: '2026-09-03', rule_type: 'single', reason: 'Kitchen closed due to high order volume' },
    { id: 3, closed_date: '2026-11-26', rule_type: 'single', reason: 'Thanksgiving Holiday Kitchen Close' },
    { id: 4, closed_date: '2026-12-25', rule_type: 'single', reason: 'Christmas Day Kitchen Maintenance' },
    { id: 5, closed_date: '2027-01-01', rule_type: 'single', reason: 'New Year Day Reset' }
  ];
}

/**
 * Fetch all raw calendar blackout rules (single dates, weekday recurring, month recurring)
 */
export async function fetchCalendarBlackoutRules(): Promise<CalendarBlackout[]> {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('calendar_blackouts')
        .select('*')
        .order('id', { ascending: false });

      if (!error && data) {
        localStorage.setItem(LOCAL_STORAGE_BLACKOUTS_KEY, JSON.stringify(data));
        return data as CalendarBlackout[];
      }
    } catch (err) {
      console.warn('Supabase blackout rules fetch failed, falling back to local list', err);
    }
  }

  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_BLACKOUTS_KEY);
    if (raw) return JSON.parse(raw);
    const initial = getInitialMockBlackouts();
    localStorage.setItem(LOCAL_STORAGE_BLACKOUTS_KEY, JSON.stringify(initial));
    return initial;
  } catch {
    return getInitialMockBlackouts();
  }
}

/**
 * Add a new calendar blackout rule (KDS-authenticated server call)
 */
export async function addCalendarBlackoutRule(
  rule: Omit<CalendarBlackout, 'id' | 'created_at'>
): Promise<CalendarBlackout | null> {
  try {
    const res = await kdsApi('/api/kds/blackouts', { method: 'POST', body: JSON.stringify(rule) });
    if (res.ok) {
      const { rule: data } = await res.json();
      if (data) {
        const current = await fetchCalendarBlackoutRules();
        localStorage.setItem(LOCAL_STORAGE_BLACKOUTS_KEY, JSON.stringify([data, ...current.filter(r => r.id !== data.id)]));
        return data as CalendarBlackout;
      }
    }
  } catch (err) {
    console.warn('Add blackout rule failed', err);
  }
  return null;
}

/**
 * Delete a calendar blackout rule (KDS-authenticated server call)
 */
export async function deleteCalendarBlackoutRule(id: number): Promise<boolean> {
  try {
    const res = await kdsApi(`/api/kds/blackouts?id=${encodeURIComponent(String(id))}`, { method: 'DELETE' });
    if (res.ok) {
      const current = await fetchCalendarBlackoutRules();
      localStorage.setItem(LOCAL_STORAGE_BLACKOUTS_KEY, JSON.stringify(current.filter(r => r.id !== id)));
      return true;
    }
  } catch (err) {
    console.warn('Delete blackout rule failed', err);
  }
  return false;
}

/**
 * Resolves all blackout dates (specific dates + recurring weekday + month rules)
 * for the next 120 days into a set of 'YYYY-MM-DD' strings for the calendar cutoff engine.
 */
export async function fetchCalendarBlackouts(): Promise<string[]> {
  const rules = await fetchCalendarBlackoutRules();
  const blockedDates = new Set<string>();

  const { nowDate } = getCentralTimeNow();

  // Generate 120 days ahead from today
  for (let i = 0; i < 120; i++) {
    const d = new Date(nowDate.getTime() + i * 24 * 60 * 60 * 1000);
    const y = d.getFullYear();
    const m = d.getMonth() + 1;
    const day = d.getDate();
    const dayOfWeek = d.getDay(); // 0 = Sun, 1 = Mon ...
    const dateStr = `${y}-${m.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;

    for (const rule of rules) {
      if (rule.rule_type === 'single' && rule.closed_date === dateStr) {
        blockedDates.add(dateStr);
      } else if (rule.rule_type === 'recurring_weekday' && rule.day_of_week === dayOfWeek) {
        blockedDates.add(dateStr);
      } else if (rule.rule_type === 'recurring_month' && rule.month_of_year === m) {
        blockedDates.add(dateStr);
      } else if (!rule.rule_type && rule.closed_date === dateStr) {
        // legacy compatibility
        blockedDates.add(dateStr);
      }
    }
  }

  return Array.from(blockedDates);
}

/**
 * Inserts a new order into Supabase public.orders (customer checkout).
 * Anonymous visitors have INSERT-only access: they can place an order but can never read it back.
 */
export async function createOrder(orderPayload: Omit<CateringOrder, 'id' | 'created_at'>): Promise<{ data: CateringOrder | null; error: Error | null }> {
  const orderDescription = orderPayload.order_description || orderPayload.items
    .map(i => `${i.name} (${i.selectionLabel} × ${i.quantity}) [${i.totalPrice.toFixed(2)}]`)
    .join('; ');

  const newOrder: CateringOrder = {
    ...orderPayload,
    id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `ord-${Date.now()}`,
    payment_method: orderPayload.payment_method || 'zelle',
    processing_fee: orderPayload.processing_fee || 0.00,
    order_description: orderDescription,
    created_at: new Date().toISOString()
  };

  if (!supabase) {
    return { data: null, error: new Error('Ordering is temporarily unavailable. Please try again shortly.') };
  }

  try {
    const { error } = await supabase
      .from('orders')
      .insert([{
        id: newOrder.id,
        customer_name: newOrder.customer_name,
        phone_number: newOrder.phone_number,
        email: newOrder.email,
        is_delivery: newOrder.is_delivery,
        delivery_address: newOrder.delivery_address,
        delivery_fee: newOrder.delivery_fee,
        food_subtotal: newOrder.food_subtotal,
        tax_amount: newOrder.tax_amount,
        payment_method: newOrder.payment_method,
        processing_fee: newOrder.processing_fee,
        total_amount: newOrder.total_amount,
        order_description: newOrder.order_description,
        fulfillment_date: newOrder.fulfillment_date,
        fulfillment_time: newOrder.fulfillment_time,
        dietary_notes: newOrder.dietary_notes,
        order_type: newOrder.order_type,
        status: newOrder.status,
        items: newOrder.items
      }]);

    if (error) {
      console.error('Supabase order insert error:', error);
      return { data: null, error: new Error(error.message || 'Supabase database insert error') };
    }
    notifyOrdersUpdated({ order: newOrder, eventType: 'INSERT' });
    return { data: newOrder, error: null };
  } catch (err: any) {
    console.error('Supabase connection error on order insert:', err);
    return { data: null, error: err instanceof Error ? err : new Error(String(err)) };
  }
}

function normalizeFetchedOrder(rawOrder: CateringOrder): CateringOrder {
  const merged: CateringOrder = { ...rawOrder };
  const desc = merged.order_description || '';

  // Map [ACCEPTED] flag in order_description to 'accepted' status when DB status is 'new'
  if (merged.status === 'new' && desc.includes('[ACCEPTED]')) {
    merged.status = 'accepted';
  }

  // Extract encoded [DISC:amount|reason] if present in order_description
  const discMatch = desc.match(/\[DISC:(\d+(?:\.\d{1,2})?)\|([^\]]*)\]/);
  if (discMatch) {
    if (merged.discount_amount === undefined || merged.discount_amount === 0) {
      merged.discount_amount = parseFloat(discMatch[1]) || 0;
    }
    if (!merged.discount_reason && discMatch[2]) {
      merged.discount_reason = discMatch[2];
    }
  }

  return merged;
}

/**
 * Fetch orders (KDS only; requires the authenticated session cookie). Held in memory only.
 */
export async function fetchOrders(fulfillmentDate?: string): Promise<CateringOrder[]> {
  try {
    const qs = fulfillmentDate ? `?date=${encodeURIComponent(fulfillmentDate)}` : '';
    const res = await kdsApi(`/api/kds/orders${qs}`);
    if (!res.ok) return [];
    const { orders } = await res.json();
    return (orders as CateringOrder[])
      .filter(o => !isDummyOrder(o))
      .map(normalizeFetchedOrder)
      .filter(o => o.status !== 'cancelled');
  } catch (err) {
    console.warn('fetchOrders failed', err);
    return [];
  }
}

/**
 * Update an order's status (new -> accepted -> preparing -> ready -> completed / cancelled)
 */
export async function updateOrderStatus(orderId: string, status: OrderStatus): Promise<boolean> {
  try {
    const res = await kdsApi('/api/kds/orders', {
      method: 'PATCH',
      body: JSON.stringify({ id: orderId, status })
    });
    if (res.ok) {
      notifyOrdersUpdated({ eventType: 'UPDATE' });
      return true;
    }
  } catch (err) {
    console.warn('updateOrderStatus failed', err);
  }
  return false;
}

export interface OrderEventInfo {
  eventType?: 'INSERT' | 'UPDATE' | 'DELETE' | 'STORAGE' | string;
  order?: CateringOrder;
}

/**
 * Subscribe to same-tab order change notifications. Cross-device freshness comes from
 * the KDS polling /api/kds/orders (anonymous realtime access to orders is disabled).
 */
export function subscribeToOrders(onUpdate: (eventInfo?: OrderEventInfo) => void): () => void {
  const handleLocalUpdate = (e: Event) => {
    const customEvt = e as CustomEvent<OrderEventInfo>;
    onUpdate(customEvt.detail);
  };
  window.addEventListener('bbw_orders_updated', handleLocalUpdate);
  return () => {
    window.removeEventListener('bbw_orders_updated', handleLocalUpdate);
  };
}

/**
 * Updates full order details (items, subtotal, tax, discounts, rebates, totals, date, time, status)
 */
export async function updateOrderDetails(orderId: string, updates: Partial<CateringOrder>): Promise<boolean> {
  // Encode [ACCEPTED] and [DISC:amount|reason] into order_description so they persist reliably
  let cleanDesc = (updates.order_description || '')
    .replace(/\[ACCEPTED\]\s*/g, '')
    .replace(/\s*\[DISC:[^\]]*\]/g, '')
    .trim();

  if (updates.discount_amount && updates.discount_amount > 0) {
    cleanDesc = `${cleanDesc} [DISC:${updates.discount_amount.toFixed(2)}|${updates.discount_reason || ''}]`.trim();
  }

  if (updates.status === 'accepted') {
    cleanDesc = `[ACCEPTED] ${cleanDesc}`.trim();
  }

  const payload: Partial<CateringOrder> = { ...updates };
  if (cleanDesc) payload.order_description = cleanDesc;
  else delete payload.order_description;

  try {
    const res = await kdsApi('/api/kds/orders', {
      method: 'PATCH',
      body: JSON.stringify({ id: orderId, updates: payload })
    });
    if (res.ok) {
      notifyOrdersUpdated({ eventType: 'UPDATE' });
      return true;
    }
  } catch (err) {
    console.warn('updateOrderDetails failed', err);
  }
  return false;
}

/**
 * Permanently deletes an order (KDS-authenticated server call)
 */
export async function deleteOrderFromSupabase(orderId: string): Promise<boolean> {
  try {
    const res = await kdsApi(`/api/kds/orders?id=${encodeURIComponent(orderId)}`, { method: 'DELETE' });
    if (res.ok) {
      notifyOrdersUpdated({ orderId, action: 'delete' });
      return true;
    }
  } catch (err) {
    console.warn('deleteOrder failed', err);
  }
  return false;
}

export interface QBOReconciliationSummary {
  isReconciled: boolean;
  qboDocId?: string | null;
  reconciledAt?: string | null;
  reconciledCount: number;
  pendingCount: number;
  totalSales: number;
  totalTax: number;
  cashTotal: number;
  cashCount: number;
}

/**
 * Summarizes QBO Reconciliation status & metrics for a given date
 */
export async function fetchQBOReconciliationSummary(dateStr: string): Promise<QBOReconciliationSummary> {
  const orders = await fetchOrders(dateStr);
  const activeOrders = orders.filter(o => o.status !== 'cancelled' && !o.is_cancelled);

  const reconciledOrders = activeOrders.filter(o => o.reconciled_to_qbo);
  const isReconciled = reconciledOrders.length > 0 && activeOrders.every(o => o.reconciled_to_qbo);

  const docId = reconciledOrders.find(o => o.qbo_doc_id)?.qbo_doc_id || null;
  const recAt = reconciledOrders.find(o => o.reconciled_at)?.reconciled_at || null;

  const totalSales = activeOrders.reduce((sum, o) => sum + (o.food_subtotal || 0), 0);
  const totalTax = activeOrders.reduce((sum, o) => sum + (o.tax_amount || 0), 0);

  const cashOrders = activeOrders.filter(o => o.payment_method === 'cash');
  const cashTotal = cashOrders.reduce((sum, o) => sum + (o.total_amount || 0), 0);

  return {
    isReconciled,
    qboDocId: docId,
    reconciledAt: recAt,
    reconciledCount: reconciledOrders.length,
    pendingCount: activeOrders.length - reconciledOrders.length,
    totalSales: Math.round(totalSales * 100) / 100,
    totalTax: Math.round(totalTax * 100) / 100,
    cashTotal: Math.round(cashTotal * 100) / 100,
    cashCount: cashOrders.length
  };
}

const LOCAL_STORAGE_TIFFIN_KEY = 'bbw_tiffin_menu_settings_v4';

export const DEFAULT_WEEKDAY_MENUS: Record<string, WeekdayMenuEntry> = {
  Monday: { dal: 'No Service', sabzi: 'No Service', description: 'Regular dabba service is Tuesday-Thursday' },
  Tuesday: { dal: 'Paneer Lababdar', sabzi: 'Jeera Aloo', description: '1 cup rice, 1 cup Paneer Lababdar, 1/2 cup Jeera Aloo, 2 Tawa Rotis' },
  Wednesday: { dal: 'Rajma', sabzi: 'Khatta-Meetha Kaddu', description: '1 cup rice, 1 cup Rajma, 1/2 cup Khatta-Meetha Kaddu, 2 Tawa Rotis' },
  Thursday: { dal: 'Dal Tadka', sabzi: 'Carrot-Peas Sabzi', description: '1 cup rice, 1 cup Dal Tadka, 1/2 cup Carrot-Peas Sabzi, 2 Tawa Rotis' },
  Friday: { dal: 'No Service', sabzi: 'No Service', description: 'Regular dabba service is Tuesday-Thursday' },
  Saturday: { dal: 'Paneer Lababdar', sabzi: 'N/A', description: '16 oz boxes available. Pre-book only. No regular tiffin. Catering day.' },
  Sunday: { dal: 'Kitchen Closed', sabzi: 'Rest & Clean Day', description: 'Weekly deep sanitation and market prep' }
};

export const DEFAULT_CONTAINER_ADDONS: ContainerAddonItem[] = [
  { id: 'dal-reg', name: 'Dal / Curry (Regular)', price: 9.99, description: '16 oz container' },
  { id: 'dal-prem', name: 'Dal / Curry (Premium)', price: 11.49, description: '16 oz container' },
  { id: 'paneer-16oz', name: 'Paneer', price: 14.99, description: '16 oz container' },
  { id: 'dry-sabzi-16oz', name: 'Dry Sabzi', price: 10.99, description: '16 oz container' },
  { id: 'rice-16oz', name: 'Rice', price: 4.99, description: '16 oz container' },
  { id: 'raita-16oz', name: 'Raita', price: 4.99, description: '16 oz container' }
];

export const DEFAULT_DABBA_PRICING: DabbaPricing = {
  singlePrice: 11.99,
  familyPrice: 40.99,
  weeklyPrice: 54.99
};

export const DEFAULT_WEEKEND_FLYER_SPECIALS: TiffinSpecialDish[] = [
  {
    id: 'flyer-spec-paneer-lababdar-16oz',
    title: 'Paneer Lababdar (16 oz)',
    price: 14.99,
    price16oz: 14.99,
    portionSize: '16oz',
    description: 'Special prices for this Saturday only! 16 oz soft paneer cubes in luscious Mughlai tomato-cashew gravy.',
    imageUrl: '',
    availableDays: ['Saturday', 'Sunday']
  }
];

export function getCurrentMondayStr(): string {
  const { nowDate } = getCentralTimeNow();
  const curDayOfWeek = nowDate.getDay();
  // Sunday (0) belongs to the week starting 6 days earlier (Monday)
  const daysToMonday = curDayOfWeek === 0 ? -6 : (1 - curDayOfWeek);
  const mon = new Date(nowDate.getFullYear(), nowDate.getMonth(), nowDate.getDate() + daysToMonday);
  const y = mon.getFullYear();
  const m = (mon.getMonth() + 1).toString().padStart(2, '0');
  const d = mon.getDate().toString().padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function getCurrentMondayTitle(monStr?: string): string {
  const targetStr = monStr || getCurrentMondayStr();
  const parts = targetStr.split('-').map(Number);
  if (parts.length !== 3 || parts.some(isNaN)) return 'Weekly Menu Plan';
  const mon = new Date(parts[0], parts[1] - 1, parts[2]);
  const sat = new Date(mon.getFullYear(), mon.getMonth(), mon.getDate() + 5);
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const monthShorts = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  if (mon.getMonth() === sat.getMonth()) {
    return `${monthNames[mon.getMonth()]} ${mon.getDate()} - ${sat.getDate()}`;
  }
  return `${monthShorts[mon.getMonth()]} ${mon.getDate()} - ${monthShorts[sat.getMonth()]} ${sat.getDate()}`;
}

export const DEFAULT_TIFFIN_SETTINGS: TiffinMenuSettings = {
  flyerImageUrl: '/tiffin-flyer.jpg',
  specialFlyerUrl: '/weekend-special-flyer.jpg',
  get weekTitle() {
    return getCurrentMondayTitle();
  },
  get weekStartDate() {
    return getCurrentMondayStr();
  },
  weekdayMenus: DEFAULT_WEEKDAY_MENUS,
  containerAddons: DEFAULT_CONTAINER_ADDONS,
  dabbaPricing: DEFAULT_DABBA_PRICING,
  specialDishes: DEFAULT_WEEKEND_FLYER_SPECIALS,
  saturdaySpecialTitle: 'Paneer Lababdar (16 oz)',
  saturdaySpecialDescription: 'Special prices for this Saturday only! 16 oz soft paneer cubes in luscious Mughlai tomato-cashew gravy.',
  saturdaySpecialImageUrl: ''
};

/**
 * Fetch current Tiffin Weekly flyer and specials settings
 */
export async function fetchTiffinMenuSettings(): Promise<TiffinMenuSettings> {
  const currentMondayStr = getCurrentMondayStr();
  const currentMondayTitle = getCurrentMondayTitle(currentMondayStr);

  // Purge any legacy localStorage cache
  if (typeof localStorage !== 'undefined') {
    try {
      localStorage.removeItem('bbw_tiffin_menu_settings_v1');
      localStorage.removeItem('bbw_tiffin_menu_settings_v2');
      localStorage.removeItem('bbw_tiffin_menu_settings_v3');
    } catch {}
  }

  const sanitizeSpecials = (rawSpecials?: TiffinSpecialDish[]): TiffinSpecialDish[] => {
    if (!Array.isArray(rawSpecials) || rawSpecials.length === 0) {
      return DEFAULT_WEEKEND_FLYER_SPECIALS;
    }
    return rawSpecials.map(s => {
      const basePrice = Number(s.price) > 0
        ? Number(s.price)
        : (s.price16oz && Number(s.price16oz) > 0 ? Number(s.price16oz) : 0);
      return {
        ...s,
        price: basePrice,
        price16oz: basePrice > 0 ? basePrice : undefined,
        price8oz: s.price8oz !== undefined && Number(s.price8oz) > 0 ? Number(s.price8oz) : undefined
      };
    });
  };

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('app_settings')
        .select('value')
        .eq('key', 'tiffin_menu_settings')
        .maybeSingle();

      if (!error && data && data.value) {
        const val = { ...data.value };
        if (!val.weekStartDate || val.weekStartDate < currentMondayStr || val.weekTitle?.includes('September 21') || val.weekTitle?.includes('November 9')) {
          val.weekStartDate = currentMondayStr;
          val.weekTitle = currentMondayTitle;
        }
        if (val.weekdayMenus?.Thursday?.sabzi?.includes('Sabzit')) {
          val.weekdayMenus.Thursday.sabzi = 'Carrot-Peas Sabzi';
        }
        if (!val.specialFlyerUrl) {
          val.specialFlyerUrl = '/weekend-special-flyer.jpg';
        }
        const resolvedSpecials = sanitizeSpecials(val.specialDishes);
        const merged: TiffinMenuSettings = {
          ...DEFAULT_TIFFIN_SETTINGS,
          ...val,
          specialFlyerUrl: val.specialFlyerUrl || '/weekend-special-flyer.jpg',
          weekdayMenus: { ...DEFAULT_WEEKDAY_MENUS, ...(val.weekdayMenus || {}) },
          containerAddons: val.containerAddons?.length ? val.containerAddons : DEFAULT_CONTAINER_ADDONS,
          dabbaPricing: { ...DEFAULT_DABBA_PRICING, ...(val.dabbaPricing || {}) },
          specialDishes: resolvedSpecials
        };
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem(LOCAL_STORAGE_TIFFIN_KEY, JSON.stringify(merged));
        }
        return merged;
      }
    } catch (err) {
      console.warn('Supabase fetchTiffinMenuSettings failed, using local fallback', err);
    }
  }

  try {
    if (typeof localStorage !== 'undefined') {
      const raw = localStorage.getItem(LOCAL_STORAGE_TIFFIN_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (!parsed.weekStartDate || parsed.weekStartDate < currentMondayStr || parsed.weekTitle?.includes('September 21') || parsed.weekTitle?.includes('November 9')) {
          parsed.weekStartDate = currentMondayStr;
          parsed.weekTitle = currentMondayTitle;
        }
        const resolvedSpecials = sanitizeSpecials(parsed.specialDishes);
        return {
          ...DEFAULT_TIFFIN_SETTINGS,
          ...parsed,
          specialFlyerUrl: parsed.specialFlyerUrl || '/weekend-special-flyer.jpg',
          weekdayMenus: { ...DEFAULT_WEEKDAY_MENUS, ...(parsed.weekdayMenus || {}) },
          containerAddons: parsed.containerAddons?.length ? parsed.containerAddons : DEFAULT_CONTAINER_ADDONS,
          dabbaPricing: { ...DEFAULT_DABBA_PRICING, ...(parsed.dabbaPricing || {}) },
          specialDishes: resolvedSpecials
        };
      }
    }
  } catch {}

  return {
    ...DEFAULT_TIFFIN_SETTINGS,
    weekStartDate: currentMondayStr,
    weekTitle: currentMondayTitle
  };
}

async function saveSettingViaKds(key: string, value: unknown): Promise<boolean> {
  try {
    const res = await fetch('/api/kds/settings', {
      method: 'POST',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key, value })
    });
    return res.ok;
  } catch {
    return false;
  }
}

/**
 * Save Tiffin Weekly flyer and specials settings to Supabase & local cache
 */
export async function saveTiffinMenuSettings(settings: TiffinMenuSettings): Promise<boolean> {
  const updatedSettings: TiffinMenuSettings = {
    ...settings,
    updatedAt: new Date().toISOString()
  };

  try {
    localStorage.setItem(LOCAL_STORAGE_TIFFIN_KEY, JSON.stringify(updatedSettings));
    window.dispatchEvent(new CustomEvent('bbw_tiffin_settings_updated'));
  } catch {}

  return saveSettingViaKds('tiffin_menu_settings', updatedSettings);
}

export const LOCAL_STORAGE_GALLERY_KEY = 'bbw_gallery_data_v2';
export const LOCAL_STORAGE_DELETED_GALLERY_KEY = 'bbw_deleted_gallery_ids_v2';

export function cleanLegacyGalleryCaches() {
  if (typeof localStorage === 'undefined') return;
  const legacyKeys = [
    'bbw_gallery_data_v1',
    'bbw_gallery_data',
    'bbw_gallery_items',
    'bbw_deleted_gallery_ids_v1'
  ];
  legacyKeys.forEach(k => {
    try {
      localStorage.removeItem(k);
    } catch {}
  });
}

export function getDeletedGalleryIds(): string[] {
  cleanLegacyGalleryCaches();
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_DELETED_GALLERY_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {}
  return [];
}

export function recordDeletedGalleryId(id: string) {
  cleanLegacyGalleryCaches();
  try {
    const current = getDeletedGalleryIds();
    if (!current.includes(id)) {
      const updated = [...current, id];
      localStorage.setItem(LOCAL_STORAGE_DELETED_GALLERY_KEY, JSON.stringify(updated));
    }
  } catch {}

  if (supabase) {
    supabase.from('app_settings').select('value').eq('key', 'deleted_gallery_ids').maybeSingle().then(({ data }) => {
      const remoteList: string[] = Array.isArray(data?.value) ? data.value : [];
      if (!remoteList.includes(id)) {
        saveSettingViaKds('deleted_gallery_ids', [...remoteList, id]);
      }
    });
  }
}

export function clearDeletedGalleryIds() {
  cleanLegacyGalleryCaches();
  try {
    localStorage.removeItem(LOCAL_STORAGE_DELETED_GALLERY_KEY);
  } catch {}
  saveSettingViaKds('deleted_gallery_ids', []);
}

/**
 * Fetch remote gallery items from Supabase app_settings
 */
export async function fetchGalleryItemsFromSupabase(): Promise<any[] | null> {
  cleanLegacyGalleryCaches();
  if (supabase) {
    try {
      const { data: delData } = await supabase
        .from('app_settings')
        .select('value')
        .eq('key', 'deleted_gallery_ids')
        .maybeSingle();

      if (delData?.value && Array.isArray(delData.value)) {
        const localDel = getDeletedGalleryIds();
        const mergedDel = Array.from(new Set([...localDel, ...delData.value]));
        localStorage.setItem(LOCAL_STORAGE_DELETED_GALLERY_KEY, JSON.stringify(mergedDel));
      }

      const { data, error } = await supabase
        .from('app_settings')
        .select('value')
        .eq('key', 'gallery_items')
        .maybeSingle();

      if (!error && data?.value && Array.isArray(data.value) && data.value.length > 0) {
        const deletedSet = new Set(getDeletedGalleryIds());
        const cleanItems = data.value.filter((i: any) => i && i.id && !deletedSet.has(i.id));
        localStorage.setItem(LOCAL_STORAGE_GALLERY_KEY, JSON.stringify(cleanItems));
        return cleanItems;
      }
    } catch (err) {
      console.warn('Supabase gallery fetch warning:', err);
    }
  }
  return null;
}

/**
 * Save remote gallery items to Supabase app_settings & local storage
 */
export async function saveGalleryItemsToSupabase(items: any[]): Promise<boolean> {
  cleanLegacyGalleryCaches();

  const deletedSet = new Set(getDeletedGalleryIds());
  const cleanItems = (items || [])
    .filter((item: any) => item && item.id && !deletedSet.has(item.id))
    .map((item: any) => {
      // Optimization: If originalImagePath is identical to imagePath (or redundant),
      // omit duplicate string to optimize payload size for Supabase and localStorage
      if (item.originalImagePath === item.imagePath) {
        const copy = { ...item };
        delete copy.originalImagePath;
        return copy;
      }
      return item;
    });

  try {
    localStorage.setItem(LOCAL_STORAGE_GALLERY_KEY, JSON.stringify(cleanItems));
    window.dispatchEvent(new CustomEvent('bbw_gallery_items_updated'));
  } catch (err) {
    console.warn('localStorage saveGalleryItems quota warning:', err);
    cleanLegacyGalleryCaches();
    try {
      localStorage.setItem(LOCAL_STORAGE_GALLERY_KEY, JSON.stringify(cleanItems));
    } catch {}
  }

  return saveSettingViaKds('gallery_items', cleanItems);
}


