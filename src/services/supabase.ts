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

// LocalStorage Keys for Mock / Offline Fallback
const LOCAL_STORAGE_ORDERS_KEY = 'bbw_catering_orders_cache';
const LOCAL_STORAGE_BLACKOUTS_KEY = 'bbw_catering_blackouts_cache';

// Legacy dummy order IDs to purge from any browser localStorage cache
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

function getStoredOrders(): CateringOrder[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_ORDERS_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }
    const cleaned = parsed.filter((o: CateringOrder) => !isDummyOrder(o));
    if (cleaned.length !== parsed.length) {
      localStorage.setItem(LOCAL_STORAGE_ORDERS_KEY, JSON.stringify(cleaned));
    }
    return cleaned;
  } catch {
    return [];
  }
}

function saveStoredOrders(orders: CateringOrder[], newOrder?: CateringOrder): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_ORDERS_KEY, JSON.stringify(orders));
    // Trigger storage event across components / tabs with payload details
    window.dispatchEvent(new CustomEvent('bbw_orders_updated', { 
      detail: { 
        order: newOrder, 
        eventType: newOrder ? 'INSERT' : 'UPDATE' 
      } 
    }));
  } catch {
    // ignore
  }
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
 * Add a new calendar blackout rule to Supabase (and local storage)
 */
export async function addCalendarBlackoutRule(
  rule: Omit<CalendarBlackout, 'id' | 'created_at'>
): Promise<CalendarBlackout | null> {
  const newRule: CalendarBlackout = {
    ...rule,
    id: Date.now(),
    created_at: new Date().toISOString()
  };

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('calendar_blackouts')
        .insert([{
          closed_date: newRule.closed_date || null,
          day_of_week: newRule.day_of_week !== undefined ? newRule.day_of_week : null,
          month_of_year: newRule.month_of_year !== undefined ? newRule.month_of_year : null,
          rule_type: newRule.rule_type || 'single',
          reason: newRule.reason || null
        }])
        .select()
        .single();

      if (!error && data) {
        const current = await fetchCalendarBlackoutRules();
        localStorage.setItem(LOCAL_STORAGE_BLACKOUTS_KEY, JSON.stringify([data, ...current.filter(r => r.id !== data.id)]));
        return data as CalendarBlackout;
      }
    } catch (err) {
      console.warn('Supabase add blackout rule failed, saving locally', err);
    }
  }

  // Local fallback
  const current = await fetchCalendarBlackoutRules();
  const updated = [newRule, ...current];
  localStorage.setItem(LOCAL_STORAGE_BLACKOUTS_KEY, JSON.stringify(updated));
  return newRule;
}

/**
 * Delete a calendar blackout rule
 */
export async function deleteCalendarBlackoutRule(id: number): Promise<boolean> {
  if (supabase) {
    try {
      const { error } = await supabase
        .from('calendar_blackouts')
        .delete()
        .eq('id', id);

      if (!error) {
        const current = await fetchCalendarBlackoutRules();
        localStorage.setItem(LOCAL_STORAGE_BLACKOUTS_KEY, JSON.stringify(current.filter(r => r.id !== id)));
        return true;
      }
    } catch (err) {
      console.warn('Supabase delete blackout rule failed, updating local', err);
    }
  }

  // Local fallback
  const current = await fetchCalendarBlackoutRules();
  const updated = current.filter(r => r.id !== id);
  localStorage.setItem(LOCAL_STORAGE_BLACKOUTS_KEY, JSON.stringify(updated));
  return true;
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
 * Inserts a new order or estimate into Supabase public.orders with complete granular details
 */
export async function createOrder(orderPayload: Omit<CateringOrder, 'id' | 'created_at'>): Promise<{ data: CateringOrder | null; error: Error | null }> {
  // Build a clean, itemized order description
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

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('orders')
        .insert([{
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
        }])
        .select()
        .single();

      if (!error && data) {
        // Also update local cache
        const current = getStoredOrders();
        saveStoredOrders([data as CateringOrder, ...current.filter(o => o.id !== data.id)], data as CateringOrder);
        return { data: data as CateringOrder, error: null };
      } else if (error) {
        console.error('Supabase order insert error:', error);
        return { data: null, error: new Error(error.message || 'Supabase database insert error') };
      }
    } catch (err: any) {
      console.error('Supabase connection error on order insert:', err);
      return { data: null, error: err instanceof Error ? err : new Error(String(err)) };
    }
  }

  // Local fallback (offline only)
  const current = getStoredOrders();
  const updated = [newOrder, ...current];
  saveStoredOrders(updated, newOrder);
  return { data: newOrder, error: null };
}

const LOCAL_EDITED_ORDERS_KEY = 'bbw_kds_order_edits_v1';

function getLocalOrderEdits(): Record<string, Partial<CateringOrder> & { updatedAt: number }> {
  try {
    const raw = localStorage.getItem(LOCAL_EDITED_ORDERS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveLocalOrderEdit(orderId: string, updates: Partial<CateringOrder>): void {
  try {
    const current = getLocalOrderEdits();
    current[orderId] = {
      ...(current[orderId] || {}),
      ...updates,
      updatedAt: Date.now()
    };
    localStorage.setItem(LOCAL_EDITED_ORDERS_KEY, JSON.stringify(current));
  } catch {
    // ignore
  }
}

function clearLocalOrderEdit(orderId: string): void {
  try {
    const current = getLocalOrderEdits();
    if (current[orderId]) {
      delete current[orderId];
      localStorage.setItem(LOCAL_EDITED_ORDERS_KEY, JSON.stringify(current));
    }
  } catch {
    // ignore
  }
}

function normalizeFetchedOrder(rawOrder: CateringOrder): CateringOrder {
  const localEdits = getLocalOrderEdits()[rawOrder.id];
  // Supabase is the authoritative cross-device source of truth for status, order_description, and core fields.
  // Only apply localEdits as a temporary fallback if localEdits was written within the last 10 seconds (optimistic UI during in-flight request).
  const isFreshOptimisticEdit = Boolean(localEdits && localEdits.updatedAt && (Date.now() - localEdits.updatedAt < 10000));
  const merged: CateringOrder = isFreshOptimisticEdit ? { ...rawOrder, ...localEdits } : { ...rawOrder };

  let desc = merged.order_description || '';

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
 * Fetch orders for a specific fulfillment date (or all active if date not provided)
 */
export async function fetchOrders(fulfillmentDate?: string): Promise<CateringOrder[]> {
  if (supabase) {
    try {
      let query = supabase.from('orders').select('*').neq('status', 'cancelled').order('created_at', { ascending: false });
      if (fulfillmentDate) {
        query = query.eq('fulfillment_date', fulfillmentDate);
      }
      const { data, error } = await query;
      if (!error && data) {
        const parsed = (data as CateringOrder[])
          .filter(o => !isDummyOrder(o))
          .map(normalizeFetchedOrder)
          .filter(o => o.status !== 'cancelled');

        // Only keep purely offline orders (created with 'ord-' prefix when offline), never resurrect deleted/cancelled Supabase UUIDs or dummy orders
        const localStored = getStoredOrders();
        const remoteIds = new Set(parsed.map(o => o.id));
        const localOfflineOnly = localStored
          .filter(o => !remoteIds.has(o.id) && o.id.startsWith('ord-') && o.status !== 'cancelled' && !isDummyOrder(o))
          .map(normalizeFetchedOrder);

        const combined = [...parsed, ...localOfflineOnly];

        try {
          if (!fulfillmentDate) {
            localStorage.setItem(LOCAL_STORAGE_ORDERS_KEY, JSON.stringify(combined));
          }
        } catch {}

        if (fulfillmentDate) {
          return combined.filter(o => o.fulfillment_date === fulfillmentDate);
        }
        return combined;
      }
      if (error) {
        console.error('Supabase fetchOrders error:', error);
      }
    } catch (err) {
      console.warn('Supabase fetchOrders failed, using local cache', err);
    }
  }

  // Local fallback
  const all = getStoredOrders();
  const parsed = all
    .map(normalizeFetchedOrder)
    .filter(o => o.status !== 'cancelled');

  if (fulfillmentDate) {
    return parsed.filter(o => o.fulfillment_date === fulfillmentDate);
  }
  return parsed;
}

/**
 * Update an order's status (new -> accepted -> preparing -> ready -> completed / cancelled)
 */
export async function updateOrderStatus(orderId: string, status: OrderStatus): Promise<boolean> {
  let updatedSuccessfully = false;

  // Save status in local edits map immediately so any subsequent fetch preserves it
  saveLocalOrderEdit(orderId, { status });

  if (supabase) {
    try {
      if (status === 'accepted') {
        const { data: currentOrder } = await supabase
          .from('orders')
          .select('order_description')
          .eq('id', orderId)
          .maybeSingle();
        
        const curDesc = currentOrder?.order_description || '';
        const newDesc = curDesc.includes('[ACCEPTED]') ? curDesc : `[ACCEPTED] ${curDesc}`;
        
        const { error } = await supabase
          .from('orders')
          .update({ 
            status: 'new',
            order_description: newDesc
          })
          .eq('id', orderId);
        
        if (!error) {
          updatedSuccessfully = true;
          clearLocalOrderEdit(orderId);
        }
      } else {
        const { data: currentOrder } = await supabase
          .from('orders')
          .select('order_description')
          .eq('id', orderId)
          .maybeSingle();
        
        const curDesc = currentOrder?.order_description || '';
        const cleanDesc = curDesc.replace(/\[ACCEPTED\]\s*/g, '').trim();

        const { error } = await supabase
          .from('orders')
          .update({ 
            status,
            order_description: cleanDesc || curDesc
          })
          .eq('id', orderId);

        if (!error) {
          updatedSuccessfully = true;
          clearLocalOrderEdit(orderId);
        }
      }
    } catch (err) {
      console.warn('Supabase update failed, updating local cache', err);
    }
  }

  // Always update local cache
  const all = getStoredOrders();
  const index = all.findIndex(o => o.id === orderId);
  if (index !== -1) {
    all[index].status = status;
    const curDesc = all[index].order_description || '';
    if (status === 'accepted') {
      if (!curDesc.includes('[ACCEPTED]')) {
        all[index].order_description = `[ACCEPTED] ${curDesc}`;
      }
    } else {
      all[index].order_description = curDesc.replace(/\[ACCEPTED\]\s*/g, '').trim();
    }
    saveStoredOrders(all);
    updatedSuccessfully = true;
  }

  return updatedSuccessfully;
}

export interface OrderEventInfo {
  eventType?: 'INSERT' | 'UPDATE' | 'DELETE' | 'STORAGE' | string;
  order?: CateringOrder;
}

/**
 * Subscribe to realtime orders updates.
 */
export function subscribeToOrders(onUpdate: (eventInfo?: OrderEventInfo) => void): () => void {
  const handleLocalUpdate = (e: Event) => {
    const customEvt = e as CustomEvent<OrderEventInfo>;
    onUpdate(customEvt.detail);
  };
  window.addEventListener('bbw_orders_updated', handleLocalUpdate);

  const handleStorageUpdate = (e: StorageEvent) => {
    if (e.key === LOCAL_STORAGE_ORDERS_KEY || e.key === LOCAL_EDITED_ORDERS_KEY) {
      onUpdate({ eventType: 'STORAGE' });
    }
  };
  window.addEventListener('storage', handleStorageUpdate);

  if (supabase) {
    const channel = supabase
      .channel('realtime:public:orders')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        (payload) => {
          onUpdate({
            eventType: payload.eventType,
            order: (payload.new as CateringOrder) || undefined
          });
        }
      )
      .subscribe();

    return () => {
      window.removeEventListener('bbw_orders_updated', handleLocalUpdate);
      window.removeEventListener('storage', handleStorageUpdate);
      supabase.removeChannel(channel);
    };
  }

  return () => {
    window.removeEventListener('bbw_orders_updated', handleLocalUpdate);
    window.removeEventListener('storage', handleStorageUpdate);
  };
}

/**
 * Updates full order details (items, subtotal, tax, discounts, rebates, totals, date, time, status)
 * and synchronizes with Supabase public.orders and local storage.
 */
export async function updateOrderDetails(orderId: string, updates: Partial<CateringOrder>): Promise<boolean> {
  // 1. Encode [ACCEPTED] and [DISC:amount|reason] into order_description so Supabase persists them reliably
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

  const normalizedUpdates: Partial<CateringOrder> = {
    ...updates,
    order_description: cleanDesc
  };

  // 2. Always persist in local edits override cache & stored orders cache first
  saveLocalOrderEdit(orderId, normalizedUpdates);

  const all = getStoredOrders();
  const index = all.findIndex(o => o.id === orderId);
  if (index !== -1) {
    all[index] = { ...all[index], ...normalizedUpdates };
    saveStoredOrders(all);
  } else {
    window.dispatchEvent(new CustomEvent('bbw_orders_updated', { detail: { eventType: 'UPDATE' } }));
  }

  // 3. Persist valid schema columns to Supabase public.orders
  if (supabase) {
    try {
      const dbStatus = updates.status === 'accepted' ? 'new' : updates.status;

      // Only include columns that exist on public.orders in Supabase
      const allowedColumns: Record<string, any> = {};
      if (updates.customer_name !== undefined) allowedColumns.customer_name = updates.customer_name;
      if (updates.phone_number !== undefined) allowedColumns.phone_number = updates.phone_number;
      if (updates.email !== undefined) allowedColumns.email = updates.email;
      if (updates.is_delivery !== undefined) allowedColumns.is_delivery = updates.is_delivery;
      if (updates.delivery_address !== undefined) allowedColumns.delivery_address = updates.delivery_address;
      if (updates.delivery_fee !== undefined) allowedColumns.delivery_fee = updates.delivery_fee;
      if (updates.food_subtotal !== undefined) allowedColumns.food_subtotal = updates.food_subtotal;
      if (updates.tax_amount !== undefined) allowedColumns.tax_amount = updates.tax_amount;
      if (updates.payment_method !== undefined) allowedColumns.payment_method = updates.payment_method;
      if (updates.processing_fee !== undefined) allowedColumns.processing_fee = updates.processing_fee;
      if (updates.total_amount !== undefined) allowedColumns.total_amount = updates.total_amount;
      if (cleanDesc) allowedColumns.order_description = cleanDesc;
      if (updates.fulfillment_date !== undefined) allowedColumns.fulfillment_date = updates.fulfillment_date;
      if (updates.fulfillment_time !== undefined) allowedColumns.fulfillment_time = updates.fulfillment_time;
      if (updates.dietary_notes !== undefined) allowedColumns.dietary_notes = updates.dietary_notes;
      if (updates.order_type !== undefined) allowedColumns.order_type = updates.order_type;
      if (dbStatus !== undefined) allowedColumns.status = dbStatus;
      if (updates.items !== undefined) allowedColumns.items = updates.items;

      const { error } = await supabase
        .from('orders')
        .update(allowedColumns)
        .eq('id', orderId);

      if (error) {
        console.warn('Supabase updateOrderDetails warning (saved locally):', error);
      } else {
        clearLocalOrderEdit(orderId);
      }
    } catch (err) {
      console.warn('Supabase updateOrderDetails connection warning (saved locally):', err);
    }
  }

  return true;
}

/**
 * Permanently deletes an order from Supabase public.orders database and local storage caches
 */
export async function deleteOrderFromSupabase(orderId: string): Promise<boolean> {
  let deletedSuccessfully = false;

  if (supabase) {
    try {
      // 1. Mark status as 'cancelled' first in Supabase so queries hide it immediately even if RLS restricts hard DELETE
      await supabase
        .from('orders')
        .update({ status: 'cancelled' })
        .eq('id', orderId);

      // 2. Attempt hard DELETE from Supabase database table
      const { error } = await supabase
        .from('orders')
        .delete()
        .eq('id', orderId);

      if (!error) {
        deletedSuccessfully = true;
      } else {
        console.warn('Supabase deleteOrder query warning:', error);
      }
    } catch (err) {
      console.warn('Supabase deleteOrder connection failed:', err);
    }
  }

  // Always update local cache and dispatch event
  try {
    clearLocalOrderEdit(orderId);
    const all = getStoredOrders();
    const filtered = all.filter(o => o.id !== orderId);
    saveStoredOrders(filtered);
    window.dispatchEvent(new CustomEvent('bbw_orders_updated', { detail: { orderId, action: 'delete' } }));
    deletedSuccessfully = true;
  } catch (err) {
    console.warn('localStorage deleteOrder warning:', err);
  }

  return deletedSuccessfully;
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

  if (supabase) {
    try {
      const { error } = await supabase
        .from('app_settings')
        .upsert(
          {
            key: 'tiffin_menu_settings',
            value: updatedSettings,
            updated_at: new Date().toISOString()
          },
          { onConflict: 'key' }
        );

      if (!error) return true;
      console.warn('Supabase saveTiffinMenuSettings warning:', error);
    } catch (err) {
      console.warn('Supabase saveTiffinMenuSettings failed', err);
    }
  }

  return true;
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
    try {
      supabase.from('app_settings').select('value').eq('key', 'deleted_gallery_ids').maybeSingle().then(({ data }) => {
        const remoteList: string[] = Array.isArray(data?.value) ? data.value : [];
        if (!remoteList.includes(id)) {
          supabase.from('app_settings').upsert(
            {
              key: 'deleted_gallery_ids',
              value: [...remoteList, id],
              updated_at: new Date().toISOString()
            },
            { onConflict: 'key' }
          );
        }
      });
    } catch (err) {
      console.warn('Supabase recordDeletedGalleryId warning:', err);
    }
  }
}

export function clearDeletedGalleryIds() {
  cleanLegacyGalleryCaches();
  try {
    localStorage.removeItem(LOCAL_STORAGE_DELETED_GALLERY_KEY);
  } catch {}
  if (supabase) {
    try {
      supabase.from('app_settings').upsert(
        {
          key: 'deleted_gallery_ids',
          value: [],
          updated_at: new Date().toISOString()
        },
        { onConflict: 'key' }
      );
    } catch {}
  }
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

  if (supabase) {
    try {
      const { error } = await supabase
        .from('app_settings')
        .upsert(
          {
            key: 'gallery_items',
            value: cleanItems,
            updated_at: new Date().toISOString()
          },
          { onConflict: 'key' }
        );

      if (!error) return true;
      console.warn('Supabase saveGalleryItems warning:', error?.message || error);
      return false;
    } catch (err) {
      console.warn('Supabase saveGalleryItems failed:', err);
      return false;
    }
  }
  return true;
}


