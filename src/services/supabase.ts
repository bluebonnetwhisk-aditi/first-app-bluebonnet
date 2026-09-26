import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { CateringOrder, CalendarBlackout, OrderStatus, TiffinMenuSettings } from '../types/catering';
import { getCentralTimeNow } from '../utils/centralTime';

// Safe Environment variables retrieval (Vite or Next.js compatible)
const getEnvVar = (key: string): string => {
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[key]) {
    return import.meta.env[key];
  }
  if (typeof globalThis !== 'undefined' && (globalThis as any).process?.env?.[key]) {
    return (globalThis as any).process.env[key];
  }
  return '';
};

const SUPABASE_URL = getEnvVar('VITE_SUPABASE_URL') || getEnvVar('NEXT_PUBLIC_SUPABASE_URL');
const SUPABASE_ANON_KEY = getEnvVar('VITE_SUPABASE_ANON_KEY') || getEnvVar('NEXT_PUBLIC_SUPABASE_ANON_KEY');

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

// Initial Mock Seed for Testing & Immediate Demo
function getInitialMockOrders(): CateringOrder[] {
  const { dateStr } = getCentralTimeNow();
  return [
    {
      id: 'ord-1001',
      customer_name: 'Priya Sharma',
      phone_number: '(972) 555-0142',
      email: 'priya.sharma@example.com',
      is_delivery: true,
      delivery_address: '4821 Legacy Dr, Apt 304, Frisco, TX 75034',
      delivery_fee: 50.00,
      food_subtotal: 275.00,
      tax_amount: 26.81,
      total_amount: 351.81,
      fulfillment_date: dateStr,
      fulfillment_time: '12:30 PM',
      dietary_notes: 'Satvik / No Onion No Garlic requested for pooja celebration.',
      order_type: 'order',
      status: 'preparing',
      items: [
        {
          id: 'item-1',
          menuItemId: 'shahi-paneer',
          name: 'Shahi Paneer',
          category: 'mains',
          categoryLabel: 'Paneer & Premium Mains',
          selectionType: 'full',
          selectionLabel: 'Full Tray ($130)',
          quantity: 1,
          unitPrice: 130,
          totalPrice: 130,
          tier: 'Maharaja',
          allergens: ['D', 'N'],
          leadTimeHours: 24
        },
        {
          id: 'item-2',
          menuItemId: 'dal-makhani',
          name: 'Dal Makhani',
          category: 'dal',
          categoryLabel: 'Dal & Curries',
          selectionType: 'half',
          selectionLabel: 'Half Tray ($60)',
          quantity: 1,
          unitPrice: 60,
          totalPrice: 60,
          tier: 'Shahi',
          allergens: ['D'],
          leadTimeHours: 24
        },
        {
          id: 'item-3',
          menuItemId: 'bread-poori',
          name: 'Poori',
          category: 'breads',
          categoryLabel: 'Breads (Min. 30 pieces)',
          selectionType: 'pack_30',
          selectionLabel: '30 pcs ($27)',
          quantity: 1,
          unitPrice: 27,
          totalPrice: 27,
          allergens: ['G'],
          leadTimeHours: 24
        },
        {
          id: 'item-4',
          menuItemId: 'bread-naan',
          name: 'Naan',
          category: 'breads',
          categoryLabel: 'Breads (Min. 30 pieces)',
          selectionType: 'pack_30',
          selectionLabel: '30 pcs ($42)',
          quantity: 1,
          unitPrice: 42,
          totalPrice: 42,
          allergens: ['G', 'D'],
          leadTimeHours: 24
        },
        {
          id: 'item-5',
          menuItemId: 'beverage-mango-lassi',
          name: 'Mango Lassi',
          category: 'beverages',
          categoryLabel: 'Beverages (Per Gallon)',
          selectionType: 'gallon',
          selectionLabel: '1 Gallon ($45)',
          quantity: 1,
          unitPrice: 45,
          totalPrice: 45,
          allergens: ['D'],
          leadTimeHours: 24
        }
      ],
      created_at: new Date().toISOString()
    },
    {
      id: 'ord-1002',
      customer_name: 'Rajesh Patel',
      phone_number: '(469) 555-8921',
      email: 'rajesh.patel@example.com',
      is_delivery: false,
      delivery_address: null,
      delivery_fee: 0,
      food_subtotal: 195.00,
      tax_amount: 16.09,
      total_amount: 211.09,
      fulfillment_date: dateStr,
      fulfillment_time: '5:00 PM',
      dietary_notes: 'Jain-friendly, please keep mild spice.',
      order_type: 'order',
      status: 'new',
      items: [
        {
          id: 'item-201',
          menuItemId: 'kadhai-paneer',
          name: 'Kadhai Paneer',
          category: 'mains',
          categoryLabel: 'Paneer & Premium Mains',
          selectionType: 'half',
          selectionLabel: 'Half Tray ($80)',
          quantity: 1,
          unitPrice: 80,
          totalPrice: 80,
          tier: 'Maharaja',
          allergens: ['D'],
          leadTimeHours: 24
        },
        {
          id: 'item-202',
          menuItemId: 'samosa-chaat',
          name: 'Samosa Chaat',
          category: 'starters',
          categoryLabel: 'Starters & Indo-Chinese',
          selectionType: 'half',
          selectionLabel: 'Half Tray ($70)',
          quantity: 1,
          unitPrice: 70,
          totalPrice: 70,
          tier: 'Darbari',
          allergens: ['G', 'D'],
          leadTimeHours: 24
        },
        {
          id: 'item-203',
          menuItemId: 'jeera-rice',
          name: 'Jeera Rice',
          category: 'rice',
          categoryLabel: 'Rice & Sides',
          selectionType: 'half',
          selectionLabel: 'Half Tray ($50)',
          quantity: 1,
          unitPrice: 50,
          totalPrice: 50,
          tier: 'Khaas',
          allergens: ['D'],
          leadTimeHours: 24
        }
      ],
      created_at: new Date().toISOString()
    }
  ];
}

function getStoredOrders(): CateringOrder[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_ORDERS_KEY);
    if (!raw) {
      const initial = getInitialMockOrders();
      localStorage.setItem(LOCAL_STORAGE_ORDERS_KEY, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(raw);
  } catch {
    return getInitialMockOrders();
  }
}

function saveStoredOrders(orders: CateringOrder[]): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_ORDERS_KEY, JSON.stringify(orders));
    // Trigger storage event across components / tabs
    window.dispatchEvent(new CustomEvent('bbw_orders_updated'));
  } catch {
    // ignore
  }
}

function getInitialMockBlackouts(): CalendarBlackout[] {
  return [
    { id: 1, closed_date: '2026-11-26', rule_type: 'single', reason: 'Thanksgiving Holiday Kitchen Close' },
    { id: 2, closed_date: '2026-12-25', rule_type: 'single', reason: 'Christmas Day Kitchen Maintenance' },
    { id: 3, closed_date: '2027-01-01', rule_type: 'single', reason: 'New Year Day Reset' }
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
    .map(i => `${i.name} (${i.selectionLabel} × ${i.quantity}) [$${i.totalPrice.toFixed(2)}]`)
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
        saveStoredOrders([data as CateringOrder, ...current.filter(o => o.id !== data.id)]);
        return { data: data as CateringOrder, error: null };
      } else if (error) {
        console.warn('Supabase insert warning, persisting to local cache', error);
      }
    } catch (err) {
      console.warn('Supabase connection error on order insert, falling back to local cache', err);
    }
  }

  // Local fallback
  const current = getStoredOrders();
  const updated = [newOrder, ...current];
  saveStoredOrders(updated);
  return { data: newOrder, error: null };
}

/**
 * Fetch orders for a specific fulfillment date (or all active if date not provided)
 */
export async function fetchOrders(fulfillmentDate?: string): Promise<CateringOrder[]> {
  if (supabase) {
    try {
      let query = supabase.from('orders').select('*').order('created_at', { ascending: false });
      if (fulfillmentDate) {
        query = query.eq('fulfillment_date', fulfillmentDate);
      }
      const { data, error } = await query;
      if (!error && data) {
        return data as CateringOrder[];
      }
    } catch (err) {
      console.warn('Supabase fetchOrders failed, using local cache', err);
    }
  }

  // Local fallback
  const all = getStoredOrders();
  if (fulfillmentDate) {
    return all.filter(o => o.fulfillment_date === fulfillmentDate);
  }
  return all;
}

/**
 * Update an order's status (new -> preparing -> ready -> completed / cancelled)
 */
export async function updateOrderStatus(orderId: string, status: OrderStatus): Promise<boolean> {
  let updatedSuccessfully = false;

  if (supabase) {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', orderId);
      
      if (!error) updatedSuccessfully = true;
    } catch (err) {
      console.warn('Supabase update failed, updating local cache', err);
    }
  }

  // Always update local cache
  const all = getStoredOrders();
  const index = all.findIndex(o => o.id === orderId);
  if (index !== -1) {
    all[index].status = status;
    saveStoredOrders(all);
    updatedSuccessfully = true;
  }

  return updatedSuccessfully;
}

/**
 * Subscribe to realtime orders updates.
 */
export function subscribeToOrders(onUpdate: () => void): () => void {
  // Local event listener for mock / offline updates
  const handleLocalUpdate = () => {
    onUpdate();
  };
  window.addEventListener('bbw_orders_updated', handleLocalUpdate);

  if (supabase) {
    const channel = supabase
      .channel('realtime:public:orders')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        () => {
          onUpdate();
        }
      )
      .subscribe();

    return () => {
      window.removeEventListener('bbw_orders_updated', handleLocalUpdate);
      supabase.removeChannel(channel);
    };
  }

  return () => {
    window.removeEventListener('bbw_orders_updated', handleLocalUpdate);
  };
}

/**
 * Updates full order details (items, subtotal, tax, discounts, rebates, totals)
 * and synchronizes with Supabase public.orders and local storage.
 */
export async function updateOrderDetails(orderId: string, updates: Partial<CateringOrder>): Promise<boolean> {
  let updatedSuccessfully = false;

  if (supabase) {
    try {
      const payloadToUpdate: any = { ...updates };
      delete payloadToUpdate.id;
      delete payloadToUpdate.created_at;

      const { error } = await supabase
        .from('orders')
        .update(payloadToUpdate)
        .eq('id', orderId);

      if (!error) {
        updatedSuccessfully = true;
      } else {
        console.warn('Supabase updateOrderDetails error:', error);
      }
    } catch (err) {
      console.warn('Supabase updateOrderDetails connection failed, persisting to local cache', err);
    }
  }

  // Always update local cache
  const all = getStoredOrders();
  const index = all.findIndex(o => o.id === orderId);
  if (index !== -1) {
    all[index] = { ...all[index], ...updates };
    saveStoredOrders(all);
    updatedSuccessfully = true;
  }

  return updatedSuccessfully;
}

const LOCAL_STORAGE_TIFFIN_KEY = 'bbw_tiffin_menu_settings_v1';

export const DEFAULT_TIFFIN_SETTINGS: TiffinMenuSettings = {
  flyerImageUrl: '/tiffin-flyer.jpg',
  weekTitle: 'September 21 - 26',
  specialDishes: [
    {
      id: 'spec-1',
      title: 'Chef’s Special Pav Bhaji Feast',
      description: 'Slow-simmered spiced vegetable bhaji with extra butter, 2 toasted ladi pavs, onion salad & masala chili.',
      price: 13.99,
      imageUrl: ''
    }
  ],
  saturdaySpecialTitle: 'Chef’s Special Pav Bhaji Feast',
  saturdaySpecialDescription: 'Slow-simmered spiced vegetable bhaji with extra butter, 2 toasted ladi pavs, onion salad & masala chili.',
  saturdaySpecialImageUrl: ''
};

/**
 * Fetch current Tiffin Weekly flyer and specials settings
 */
export async function fetchTiffinMenuSettings(): Promise<TiffinMenuSettings> {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('app_settings')
        .select('value')
        .eq('key', 'tiffin_menu_settings')
        .maybeSingle();

      if (!error && data && data.value) {
        localStorage.setItem(LOCAL_STORAGE_TIFFIN_KEY, JSON.stringify(data.value));
        return data.value as TiffinMenuSettings;
      }
    } catch (err) {
      console.warn('Supabase fetchTiffinMenuSettings failed, using local fallback', err);
    }
  }

  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_TIFFIN_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}

  return DEFAULT_TIFFIN_SETTINGS;
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
        .upsert({
          key: 'tiffin_menu_settings',
          value: updatedSettings,
          updated_at: new Date().toISOString()
        });

      if (!error) return true;
      console.warn('Supabase saveTiffinMenuSettings warning:', error);
    } catch (err) {
      console.warn('Supabase saveTiffinMenuSettings failed', err);
    }
  }

  return true;
}

