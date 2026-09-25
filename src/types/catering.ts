export type Allergen = 'D' | 'G' | 'N' | 'S';

export type TrayTier = 'Khaas' | 'Shahi' | 'Darbari' | 'Maharaja';

export type TraySize = 'third' | 'half' | 'full';

export type Category = 
  | 'mains'
  | 'sabzi'
  | 'dal'
  | 'starters'
  | 'rice'
  | 'sides'
  | 'desserts'
  | 'breads'
  | 'beverages'
  | 'cakes';

export interface TrayPricing {
  third: number; // 1/3 Tray
  half: number;  // Half Tray
  full: number;  // Full Tray
}

export interface MenuItem {
  id: string;
  name: string;
  category: Category;
  categoryLabel: string;
  tier?: TrayTier;
  description: string;
  allergens: Allergen[];
  pricingType: 'tray' | 'bread' | 'beverage' | 'cake';
  trayPricing?: TrayPricing;
  pricePer30Pcs?: number; // for breads
  pricePerGallon?: number; // for beverages
  customNote?: string;
  leadTimeHours: number; // 24 for catering/beverages, 48 for cakes
  isSatvikAvailable?: boolean;
}

export interface CartItem {
  id: string; // unique item cart entry id
  menuItemId: string;
  name: string;
  category: Category;
  categoryLabel: string;
  selectionType: TraySize | 'pack_30' | 'gallon' | 'cake_custom';
  selectionLabel: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  tier?: TrayTier;
  allergens: Allergen[];
  leadTimeHours: number;
  notes?: string;
}

export type OrderType = 'order' | 'estimate';

export type OrderStatus = 'new' | 'preparing' | 'ready' | 'completed' | 'cancelled';

export interface CateringOrder {
  id: string;
  customer_name: string;
  phone_number: string;
  email: string;
  is_delivery: boolean;
  delivery_address: string | null;
  delivery_fee: number;
  food_subtotal: number;
  tax_amount: number;
  total_amount: number;
  fulfillment_date: string; // YYYY-MM-DD
  fulfillment_time: string; // e.g. "1:00 PM"
  dietary_notes: string | null;
  order_type: OrderType;
  status: OrderStatus;
  items: CartItem[];
  created_at?: string;
}

export interface CalendarBlackout {
  id: number;
  closed_date: string; // YYYY-MM-DD
  reason: string | null;
}

export interface CutoffCheckResult {
  isValid: boolean;
  earliestAllowedDate: string; // YYYY-MM-DD
  earliestAllowedTime: string; // HH:mm
  requiredNoticeHours: number;
  message: string;
  isPassed: boolean;
}
