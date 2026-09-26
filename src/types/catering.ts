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
  | 'cakes'
  | 'tiffin';

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
  pricingType: 'tray' | 'bread' | 'beverage' | 'cake' | 'tiffin';
  trayPricing?: TrayPricing;
  pricePer30Pcs?: number; // for breads legacy
  unitPricePiece?: number; // per piece price for breads ($0.90 or $1.40)
  minPieces?: number; // minimum piece requirement (e.g. 30)
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
  selectionType: TraySize | 'pack_30' | 'pieces' | 'gallon' | 'cake_custom' | 'tiffin_single' | 'tiffin_family' | 'tiffin_weekly' | 'container_16oz';
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

export type PaymentMethod = 'cash' | 'zelle' | 'credit_card';

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
  payment_method?: PaymentMethod;
  processing_fee?: number;
  discount_amount?: number;
  discount_reason?: string | null;
  rebate_amount?: number;
  rebate_reason?: string | null;
  total_amount: number;
  order_description?: string;
  fulfillment_date: string; // YYYY-MM-DD
  fulfillment_time: string; // e.g. "1:00 PM"
  dietary_notes: string | null;
  order_type: OrderType;
  status: OrderStatus;
  items: CartItem[];
  created_at?: string;
}

export interface TiffinSpecialDish {
  id: string;
  title: string;
  description: string;
  price: number;
  imageUrl?: string;
}

export interface TiffinMenuSettings {
  flyerImageUrl: string;
  weekTitle: string; // e.g., "September 21 - 26"
  weekStartDate?: string; // YYYY-MM-DD (Monday)
  weekEndDate?: string;   // YYYY-MM-DD (Sunday)
  specialDishes?: TiffinSpecialDish[]; // max 3
  saturdaySpecialTitle?: string;
  saturdaySpecialDescription?: string;
  saturdaySpecialImageUrl?: string;
  updatedAt?: string;
}

export type BlackoutRuleType = 'single' | 'recurring_weekday' | 'recurring_month';

export interface CalendarBlackout {
  id: number;
  closed_date?: string | null; // YYYY-MM-DD
  day_of_week?: number | null; // 0=Sunday, 1=Monday... 6=Saturday
  month_of_year?: number | null; // 1=Jan... 12=Dec
  rule_type?: BlackoutRuleType;
  reason: string | null;
  created_at?: string;
}

export interface CutoffCheckResult {
  isValid: boolean;
  earliestAllowedDate: string; // YYYY-MM-DD
  earliestAllowedTime: string; // HH:mm
  requiredNoticeHours: number;
  message: string;
  isPassed: boolean;
}
