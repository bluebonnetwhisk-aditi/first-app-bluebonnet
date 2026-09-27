import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { CateringOrder, CalendarBlackout, OrderStatus, TiffinMenuSettings, WeekdayMenuEntry, ContainerAddonItem, DabbaPricing } from '../types/catering';
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

// Initial Mock Seed for Testing & Immediate Demo
function getInitialMockOrders(): CateringOrder[] {
  return [
  {
    "id": "3942d890-a463-4783-8603-7756b9443879",
    "customer_name": "Siddharth Joshi [Weekly Lunch Dabba Plan]",
    "phone_number": "(945) 555-4081",
    "email": "sid.joshi@example.com",
    "is_delivery": false,
    "delivery_address": null,
    "delivery_fee": 0,
    "food_subtotal": 75,
    "tax_amount": 6.19,
    "total_amount": 81.19,
    "fulfillment_date": "2026-09-28",
    "fulfillment_time": "12:00 PM",
    "dietary_notes": "Homestyle vegetarian lunch dabba (Dal, Sabzi, 4 soft Phulkas, Rice). Medium spice, freshly packed.",
    "order_type": "order",
    "status": "new",
    "items": [
      {
        "id": "item-1790433895786-501",
        "name": "Weekly Homestyle Dabba Meal Plan",
        "notes": "Freshly packed daily lunch tiffin • Pickup at Deerwood Dr, Little Elm",
        "category": "tiffin",
        "quantity": 1,
        "allergens": [
          "D",
          "G"
        ],
        "unitPrice": 75,
        "menuItemId": "tiffin-weekly-plan",
        "totalPrice": 75,
        "categoryLabel": "Homestyle Dabba Subscriptions",
        "leadTimeHours": 24,
        "selectionType": "tiffin_weekly",
        "selectionLabel": "5-Day Subscription (Mon–Fri)"
      }
    ],
    "created_at": "2026-09-26T09:44:56.138295+00:00",
    "payment_method": "zelle",
    "processing_fee": 0,
    "order_description": "Weekly Homestyle Dabba Meal Plan (5-Day Lunch Subscription (Mon–Fri) × 1) [$75.00]",
    "discount_amount": 0,
    "discount_reason": null,
    "rebate_amount": 0,
    "rebate_reason": null
  },
  {
    "id": "0b208604-621e-47af-a068-2f677ec13541",
    "customer_name": "Neha & Amit Agarwal [Weekly Dinner Dabba Plan - 2 Pax]",
    "phone_number": "(214) 555-7793",
    "email": "neha.agarwal@example.com",
    "is_delivery": false,
    "delivery_address": null,
    "delivery_fee": 0,
    "food_subtotal": 150,
    "tax_amount": 12.38,
    "total_amount": 162.38,
    "fulfillment_date": "2026-09-28",
    "fulfillment_time": "6:00 PM",
    "dietary_notes": "Weekly dinner dabba for couple. Extra soft phulkas requested. Satvik / No onion no garlic on Tuesdays.",
    "order_type": "order",
    "status": "new",
    "items": [
      {
        "id": "item-1790433895786-601",
        "name": "Weekly Homestyle Dabba Meal Plan",
        "notes": "Freshly packed evening dinner dabba • Pickup at Deerwood Dr, Little Elm",
        "category": "tiffin",
        "quantity": 2,
        "allergens": [
          "D",
          "G"
        ],
        "unitPrice": 75,
        "menuItemId": "tiffin-weekly-plan",
        "totalPrice": 150,
        "categoryLabel": "Homestyle Dabba Subscriptions",
        "leadTimeHours": 24,
        "selectionType": "tiffin_weekly",
        "selectionLabel": "5-Day Subscription for 2 (Mon–Fri)"
      }
    ],
    "created_at": "2026-09-26T09:44:56.199367+00:00",
    "payment_method": "zelle",
    "processing_fee": 0,
    "order_description": "Weekly Homestyle Dabba Meal Plan (5-Day Dinner Subscription for 2 (Mon–Fri) × 2) [$150.00]",
    "discount_amount": 0,
    "discount_reason": null,
    "rebate_amount": 0,
    "rebate_reason": null
  },
  {
    "id": "247b89eb-87c4-41db-bc77-99e9946b546c",
    "customer_name": "Aarav Mehta [Food Catering - Delivery]",
    "phone_number": "(469) 555-2311",
    "email": "aarav.mehta@example.com",
    "is_delivery": true,
    "delivery_address": "5521 Legacy Dr, Ste 240, Plano, TX 75024",
    "delivery_fee": 50,
    "food_subtotal": 247,
    "tax_amount": 24.5,
    "total_amount": 321.5,
    "fulfillment_date": "2026-09-29",
    "fulfillment_time": "1:00 PM",
    "dietary_notes": "SATVIK / JAIN-FRIENDLY REQUESTED (No Onion, No Garlic) | Corporate Luncheon setup at 2nd floor conference room",
    "order_type": "order",
    "status": "new",
    "items": [
      {
        "id": "item-1790433895786-101",
        "name": "Shahi Paneer",
        "tier": "Maharaja",
        "category": "mains",
        "quantity": 1,
        "allergens": [
          "D"
        ],
        "unitPrice": 80,
        "menuItemId": "mains-shahi-paneer",
        "totalPrice": 80,
        "categoryLabel": "Paneer & Premium Mains",
        "leadTimeHours": 24,
        "selectionType": "half",
        "selectionLabel": "Half Tray ($80)"
      },
      {
        "id": "item-1790433895786-102",
        "name": "Dal Makhani",
        "tier": "Darbari",
        "category": "mains",
        "quantity": 1,
        "allergens": [
          "D"
        ],
        "unitPrice": 65,
        "menuItemId": "mains-dal-makhani",
        "totalPrice": 65,
        "categoryLabel": "Paneer & Premium Mains",
        "leadTimeHours": 24,
        "selectionType": "half",
        "selectionLabel": "Half Tray ($65)"
      },
      {
        "id": "item-1790433895786-103",
        "name": "Jeera Rice",
        "tier": "Shahi",
        "category": "rice",
        "quantity": 1,
        "allergens": ["D"],
        "unitPrice": 45,
        "menuItemId": "rice-jeera",
        "totalPrice": 45,
        "categoryLabel": "Rice & Biryani",
        "leadTimeHours": 24,
        "selectionType": "half",
        "selectionLabel": "Half Tray ($45)"
      },
      {
        "id": "item-1790433895786-104",
        "name": "Poori",
        "category": "breads",
        "quantity": 1,
        "allergens": [
          "G"
        ],
        "unitPrice": 27,
        "menuItemId": "bread-poori",
        "totalPrice": 27,
        "categoryLabel": "Breads (Min. 30 pieces)",
        "leadTimeHours": 24,
        "selectionType": "pack_30",
        "selectionLabel": "30 pcs ($27)"
      },
      {
        "id": "item-1790433895786-105",
        "name": "Gulab Jamun",
        "category": "desserts",
        "quantity": 1,
        "allergens": [
          "D",
          "G"
        ],
        "unitPrice": 30,
        "menuItemId": "dessert-gulab-jamun",
        "totalPrice": 30,
        "categoryLabel": "Mithai & Sweets",
        "leadTimeHours": 24,
        "selectionType": "pack_30",
        "selectionLabel": "30 pcs ($30)"
      }
    ],
    "created_at": "2026-09-26T09:44:55.772422+00:00",
    "payment_method": "zelle",
    "processing_fee": 0,
    "order_description": "Shahi Paneer (Half Tray × 1) [$80.00]; Dal Makhani (Half Tray × 1) [$65.00]; Jeera Rice (Half Tray × 1) [$45.00]; Poori (30 pcs × 1) [$27.00]; Gulab Jamun (30 pcs × 1) [$30.00]",
    "discount_amount": 0,
    "discount_reason": null,
    "rebate_amount": 0,
    "rebate_reason": null
  },
  {
    "id": "54538d20-dbf8-49f2-9b18-0973cca6825c",
    "customer_name": "Divya Swaminathan [Custom Cake - Pickup]",
    "phone_number": "(214) 555-6672",
    "email": "divya.swami@example.com",
    "is_delivery": false,
    "delivery_address": null,
    "delivery_fee": 0,
    "food_subtotal": 65,
    "tax_amount": 0,
    "total_amount": 65,
    "fulfillment_date": "2026-09-30",
    "fulfillment_time": "4:00 PM",
    "dietary_notes": "100% Eggless pure vegetarian cake. Inscription: \"Happy 5th Birthday Anvi!\" • Less sweet cardamom cream.",
    "order_type": "order",
    "status": "new",
    "items": [
      {
        "id": "item-1790433895786-301",
        "name": "8\" Rasmalai Pistachio Fusion Cake",
        "notes": "Inscription: \"Happy 5th Birthday Anvi!\" • 100% Eggless",
        "category": "cakes",
        "quantity": 1,
        "allergens": [
          "D",
          "N",
          "G"
        ],
        "unitPrice": 65,
        "menuItemId": "cake-rasmalai-fusion",
        "totalPrice": 65,
        "categoryLabel": "Signature Eggless Fusion Cakes",
        "leadTimeHours": 48,
        "selectionType": "cake_custom",
        "selectionLabel": "8\" Round (12–16 Servings)"
      }
    ],
    "created_at": "2026-09-26T09:44:55.999153+00:00",
    "payment_method": "cash",
    "processing_fee": 0,
    "order_description": "8\" Rasmalai Pistachio Fusion Cake (8\" Round (12–16 Servings) × 1) [$65.00] [Msg: Happy 5th Birthday Anvi!]",
    "discount_amount": 0,
    "discount_reason": null,
    "rebate_amount": 0,
    "rebate_reason": null
  },
  {
    "id": "51badabe-cff4-4428-a737-17f52c507782",
    "customer_name": "Rohan & Meera Verma [Food Catering - Pickup]",
    "phone_number": "(972) 555-8834",
    "email": "verma.family.events@example.com",
    "is_delivery": false,
    "delivery_address": null,
    "delivery_fee": 0,
    "food_subtotal": 385,
    "tax_amount": 31.76,
    "total_amount": 431.35,
    "fulfillment_date": "2026-10-02",
    "fulfillment_time": "6:30 PM",
    "dietary_notes": "Family gathering. Medium spice. Extra green chutney with samosa chaat.",
    "order_type": "order",
    "status": "new",
    "items": [
      {
        "id": "item-1790433895786-201",
        "name": "Kadhai Paneer",
        "tier": "Maharaja",
        "category": "mains",
        "quantity": 1,
        "allergens": [
          "D"
        ],
        "unitPrice": 150,
        "menuItemId": "mains-kadhai-paneer",
        "totalPrice": 150,
        "categoryLabel": "Paneer & Premium Mains",
        "leadTimeHours": 24,
        "selectionType": "full",
        "selectionLabel": "Full Tray ($150)"
      },
      {
        "id": "item-1790433895786-202",
        "name": "Veg Dum Biryani",
        "tier": "Maharaja",
        "category": "rice",
        "quantity": 1,
        "allergens": [
          "D"
        ],
        "unitPrice": 75,
        "menuItemId": "rice-veg-biryani",
        "totalPrice": 75,
        "categoryLabel": "Rice & Biryani",
        "leadTimeHours": 24,
        "selectionType": "half",
        "selectionLabel": "Half Tray ($75)"
      },
      {
        "id": "item-1790433895786-203",
        "name": "Samosa Chaat",
        "tier": "Darbari",
        "category": "starters",
        "quantity": 1,
        "allergens": [
          "D",
          "G"
        ],
        "unitPrice": 70,
        "menuItemId": "starter-samosa-chaat",
        "totalPrice": 70,
        "categoryLabel": "Starters & Indo-Chinese",
        "leadTimeHours": 24,
        "selectionType": "half",
        "selectionLabel": "Half Tray ($70)"
      },
      {
        "id": "item-1790433895786-204",
        "name": "Mango Lassi",
        "category": "beverages",
        "quantity": 2,
        "allergens": [
          "D"
        ],
        "unitPrice": 45,
        "menuItemId": "beverage-mango-lassi",
        "totalPrice": 90,
        "categoryLabel": "Beverages (Per Gallon)",
        "leadTimeHours": 24,
        "selectionType": "gallon",
        "selectionLabel": "1 Gallon ($45)"
      }
    ],
    "created_at": "2026-09-26T09:44:55.931617+00:00",
    "payment_method": "credit_card",
    "processing_fee": 14.59,
    "order_description": "Kadhai Paneer (Full Tray × 1) [$150.00]; Veg Dum Biryani (Half Tray × 1) [$75.00]; Samosa Chaat (Half Tray × 1) [$70.00]; Mango Lassi (1 Gallon × 2) [$90.00]",
    "discount_amount": 0,
    "discount_reason": null,
    "rebate_amount": 0,
    "rebate_reason": null
  },
  {
    "id": "c3109676-d615-476d-afe6-9e07e61b1753",
    "customer_name": "Kavita Krishnamurthy [Anniversary Cake - Delivery]",
    "phone_number": "(469) 555-9120",
    "email": "kavita.k@example.com",
    "is_delivery": true,
    "delivery_address": "6801 Warren Pkwy, Frisco, TX 75034",
    "delivery_fee": 50,
    "food_subtotal": 167,
    "tax_amount": 4.13,
    "total_amount": 221.13,
    "fulfillment_date": "2026-10-03",
    "fulfillment_time": "3:00 PM",
    "dietary_notes": "100% Eggless wedding anniversary party. Inscription: \"Happy 25th Silver Jubilee Mom & Dad!\"",
    "order_type": "order",
    "status": "new",
    "items": [
      {
        "id": "item-1790433895786-401",
        "name": "10\" Gulab Jamun Tres Leches Fusion Cake",
        "notes": "Inscription: \"Happy 25th Silver Jubilee Mom & Dad!\" • 100% Eggless",
        "category": "cakes",
        "quantity": 1,
        "allergens": [
          "D",
          "G"
        ],
        "unitPrice": 95,
        "menuItemId": "cake-gulab-jamun-tres-leches",
        "totalPrice": 95,
        "categoryLabel": "Signature Eggless Fusion Cakes",
        "leadTimeHours": 48,
        "selectionType": "cake_custom",
        "selectionLabel": "10\" Round (20–25 Servings)"
      },
      {
        "id": "item-1790433895786-402",
        "name": "Motichoor Cheesecake Parfait Cups",
        "notes": "Single-serve festive dessert cups",
        "category": "cakes",
        "quantity": 1,
        "allergens": [
          "D",
          "G"
        ],
        "unitPrice": 72,
        "menuItemId": "dessert-motichoor-cups",
        "totalPrice": 72,
        "categoryLabel": "Fusion Dessert Cups",
        "leadTimeHours": 48,
        "selectionType": "pieces",
        "selectionLabel": "24 Cups ($72)"
      }
    ],
    "created_at": "2026-09-26T09:44:56.069309+00:00",
    "payment_method": "zelle",
    "processing_fee": 0,
    "order_description": "10\" Gulab Jamun Tres Leches Fusion Cake (10\" Round (20–25 Servings) × 1) [$95.00] [Msg: Happy 25th Silver Jubilee Mom & Dad!]; Motichoor Cheesecake Cups (24 Cups × 1) [$72.00]",
    "discount_amount": 0,
    "discount_reason": null,
    "rebate_amount": 0,
    "rebate_reason": null
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
    const parsed = JSON.parse(raw);
    // If cache has old outdated mock orders, auto-upgrade to real active seed
    if (!Array.isArray(parsed) || parsed.length === 0 || parsed.some((o: any) => o.id === 'ord-1001' || o.id === 'ord-1002')) {
      const initial = getInitialMockOrders();
      localStorage.setItem(LOCAL_STORAGE_ORDERS_KEY, JSON.stringify(initial));
      return initial;
    }
    return parsed;
  } catch {
    return getInitialMockOrders();
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
        // Map [ACCEPTED] flag in order_description to 'accepted' status
        const parsed = (data as CateringOrder[]).map(o => {
          if (o.status === 'new' && o.order_description?.includes('[ACCEPTED]')) {
            return { ...o, status: 'accepted' as OrderStatus };
          }
          return o;
        });

        // Cache live Supabase orders into localStorage
        try {
          localStorage.setItem(LOCAL_STORAGE_ORDERS_KEY, JSON.stringify(parsed));
        } catch {}
        return parsed;
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
  const parsed = all.map(o => {
    if (o.status === 'new' && o.order_description?.includes('[ACCEPTED]')) {
      return { ...o, status: 'accepted' as OrderStatus };
    }
    return o;
  });

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

  if (supabase) {
    try {
      if (status === 'accepted') {
        // Postgres check constraint expects status IN ('new', 'preparing', 'ready', 'completed', 'cancelled')
        // We preserve 'new' in Postgres status and store [ACCEPTED] in order_description
        const { data: currentOrder } = await supabase
          .from('orders')
          .select('order_description')
          .eq('id', orderId)
          .single();
        
        const curDesc = currentOrder?.order_description || '';
        const newDesc = curDesc.includes('[ACCEPTED]') ? curDesc : `[ACCEPTED] ${curDesc}`;
        
        const { error } = await supabase
          .from('orders')
          .update({ 
            status: 'new',
            order_description: newDesc
          })
          .eq('id', orderId);
        
        if (!error) updatedSuccessfully = true;
      } else {
        // Moving to preparing, ready, completed, or cancelled: clean up [ACCEPTED] marker
        const { data: currentOrder } = await supabase
          .from('orders')
          .select('order_description')
          .eq('id', orderId)
          .single();
        
        const curDesc = currentOrder?.order_description || '';
        const cleanDesc = curDesc.replace(/\[ACCEPTED\]\s*/g, '').trim();

        const { error } = await supabase
          .from('orders')
          .update({ 
            status,
            order_description: cleanDesc || curDesc
          })
          .eq('id', orderId);

        if (!error) updatedSuccessfully = true;
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
  // Local event listener for mock / offline updates
  const handleLocalUpdate = (e: Event) => {
    const customEvt = e as CustomEvent<OrderEventInfo>;
    onUpdate(customEvt.detail);
  };
  window.addEventListener('bbw_orders_updated', handleLocalUpdate);

  // Cross-tab storage updates
  const handleStorageUpdate = (e: StorageEvent) => {
    if (e.key === LOCAL_STORAGE_ORDERS_KEY) {
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

export const DEFAULT_WEEKDAY_MENUS: Record<string, WeekdayMenuEntry> = {
  Monday: { dal: 'Palak Dal', sabzi: 'Cabbage Sabzi', description: 'Fresh spinach dal & tender cabbage sabzi' },
  Tuesday: { dal: 'Lauki Kofta Curry', sabzi: 'Shimla Mirch Sabzi', description: 'Gourmet bottle gourd koftas in spiced gravy & bell pepper sabzi' },
  Wednesday: { dal: 'Rajma Chawal', sabzi: 'Aloo Sabzi', description: 'Slow-simmered Punjabi rajma & homestyle spiced potato sabzi' },
  Thursday: { dal: 'Dal Tadka', sabzi: 'Bhindi Sabzi', description: 'Golden garlic tempered dal & pan-roasted okra bhindi' },
  Friday: { dal: 'Kala Chana Curry', sabzi: 'Beans Sabzi', description: 'Nutritious black chickpea curry & fresh green beans sabzi' },
  Saturday: { dal: 'Chef’s Special Dish', sabzi: 'Weekend Surprise Recipe', description: 'You decide! What would you like to eat this Saturday? DM your requests!' },
  Sunday: { dal: 'Kitchen Closed', sabzi: 'Rest & Clean Day', description: 'Weekly deep sanitation and market prep' }
};

export const DEFAULT_CONTAINER_ADDONS: ContainerAddonItem[] = [
  { id: 'dal-reg', name: 'Dal / Curry (Regular)', price: 9.99, description: '16 oz tub of slow-simmered daily dal or homestyle curry' },
  { id: 'dal-prem', name: 'Dal / Curry (Premium)', price: 11.49, description: '16 oz tub of rich specialty curry or premium dal' },
  { id: 'paneer-16oz', name: 'Paneer Specialty', price: 14.99, description: '16 oz tub of fresh spiced cottage cheese main' },
  { id: 'dry-sabzi-16oz', name: 'Dry Sabzi', price: 10.99, description: '16 oz tub of homestyle spiced seasonal dry sabzi' },
  { id: 'rice-16oz', name: 'Steamed Rice', price: 4.99, description: '16 oz container of fragrant long-grain basmati rice' },
  { id: 'raita-16oz', name: 'Cooling Raita', price: 4.99, description: '16 oz chilled seasoned spiced yogurt with boondi or veggies' }
];

export const DEFAULT_DABBA_PRICING: DabbaPricing = {
  singlePrice: 11.99,
  familyPrice: 34.99,
  weeklyPrice: 54.99
};

export function getCurrentMondayStr(): string {
  const { nowDate } = getCentralTimeNow();
  const curDayOfWeek = nowDate.getDay();
  const daysToMonday = curDayOfWeek === 0 ? 1 : (1 - curDayOfWeek);
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
  get weekTitle() {
    return getCurrentMondayTitle();
  },
  get weekStartDate() {
    return getCurrentMondayStr();
  },
  weekdayMenus: DEFAULT_WEEKDAY_MENUS,
  containerAddons: DEFAULT_CONTAINER_ADDONS,
  dabbaPricing: DEFAULT_DABBA_PRICING,
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
  const currentMondayStr = getCurrentMondayStr();
  const currentMondayTitle = getCurrentMondayTitle(currentMondayStr);

  // Purge any legacy localStorage cache containing 2026-09-21
  if (typeof localStorage !== 'undefined') {
    try {
      const raw = localStorage.getItem(LOCAL_STORAGE_TIFFIN_KEY);
      if (raw && (raw.includes('2026-09-21') || raw.includes('September 21'))) {
        localStorage.removeItem(LOCAL_STORAGE_TIFFIN_KEY);
      }
    } catch {}
  }

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('app_settings')
        .select('value')
        .eq('key', 'tiffin_menu_settings')
        .maybeSingle();

      if (!error && data && data.value) {
        const val = { ...data.value };
        if (!val.weekStartDate || val.weekStartDate < currentMondayStr || val.weekTitle?.includes('21')) {
          val.weekStartDate = currentMondayStr;
          val.weekTitle = currentMondayTitle;
        }
        const merged: TiffinMenuSettings = {
          ...DEFAULT_TIFFIN_SETTINGS,
          ...val,
          weekdayMenus: { ...DEFAULT_WEEKDAY_MENUS, ...(val.weekdayMenus || {}) },
          containerAddons: val.containerAddons?.length ? val.containerAddons : DEFAULT_CONTAINER_ADDONS,
          dabbaPricing: { ...DEFAULT_DABBA_PRICING, ...(val.dabbaPricing || {}) },
          specialDishes: val.specialDishes?.length ? val.specialDishes : DEFAULT_TIFFIN_SETTINGS.specialDishes
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
        if (!parsed.weekStartDate || parsed.weekStartDate < currentMondayStr || parsed.weekTitle?.includes('21')) {
          parsed.weekStartDate = currentMondayStr;
          parsed.weekTitle = currentMondayTitle;
        }
        return {
          ...DEFAULT_TIFFIN_SETTINGS,
          ...parsed,
          weekdayMenus: { ...DEFAULT_WEEKDAY_MENUS, ...(parsed.weekdayMenus || {}) },
          containerAddons: parsed.containerAddons?.length ? parsed.containerAddons : DEFAULT_CONTAINER_ADDONS,
          dabbaPricing: { ...DEFAULT_DABBA_PRICING, ...(parsed.dabbaPricing || {}) },
          specialDishes: parsed.specialDishes?.length ? parsed.specialDishes : DEFAULT_TIFFIN_SETTINGS.specialDishes
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

export function getDeletedGalleryIds(): string[] {
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
        localStorage.setItem(LOCAL_STORAGE_GALLERY_KEY, JSON.stringify(data.value));
        return data.value;
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
  try {
    localStorage.setItem(LOCAL_STORAGE_GALLERY_KEY, JSON.stringify(items));
    window.dispatchEvent(new CustomEvent('bbw_gallery_items_updated'));
  } catch {}

  if (supabase) {
    try {
      const { error } = await supabase
        .from('app_settings')
        .upsert(
          {
            key: 'gallery_items',
            value: items,
            updated_at: new Date().toISOString()
          },
          { onConflict: 'key' }
        );

      if (!error) return true;
      console.warn('Supabase saveGalleryItems warning:', error);
      return false;
    } catch (err) {
      console.warn('Supabase saveGalleryItems failed:', err);
      return false;
    }
  }
  return true;
}


