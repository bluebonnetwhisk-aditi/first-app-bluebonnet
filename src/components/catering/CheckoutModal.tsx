import { useState, useEffect, useRef, useMemo } from 'react';
import { 
  X, 
  Calendar as CalendarIcon, 
  AlertCircle, 
  FileText, 
  Send, 
  Truck, 
  Store,
  CreditCard,
  Banknote,
  QrCode,
  User,
  ChevronDown,
  ChevronUp,
  Plus,
  Minus,
  Trash2
} from 'lucide-react';
import type { CartItem, CateringOrder, OrderType, PaymentMethod } from '../../types/catering';
import { 
  validateFulfillmentCutoff,
  getUpcomingDates,
  isDateSelectable,
  findFirstValidFulfillmentSlot,
  isTimeSlotValidForDate,
  getTimeSlotsForDate,
  getDefaultTimeSlotForDate
} from '../../utils/centralTime';
import { fetchCalendarBlackouts, createOrder } from '../../services/supabase';
import { buildOrderWhatsAppUrl } from '../../utils/whatsapp';
import AddressValidationInput from './AddressValidationInput';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  isDelivery: boolean;
  setIsDelivery: (val: boolean) => void;
  onOrderSuccess: (order: CateringOrder, isEstimate: boolean) => void;
  blackoutDates?: string[];
  initialFulfillmentDate?: string;
  subTab?: 'order' | 'cake' | 'tiffin';
  onRemoveItem?: (id: string) => void;
  onUpdateItemQuantity?: (id: string, delta: number) => void;
}

const SAVED_CUSTOMER_KEY = 'bbw_customer_checkout_profile_v1';

export default function CheckoutModal({
  isOpen,
  onClose,
  cart,
  isDelivery,
  setIsDelivery,
  onOrderSuccess,
  blackoutDates = [],
  initialFulfillmentDate,
  subTab,
  onRemoveItem,
  onUpdateItemQuantity
}: CheckoutModalProps) {
  const modalBodyRef = useRef<HTMLDivElement>(null);

  // Customer Form state (pre-populated from localStorage for repeat customers)
  const [customerName, setCustomerName] = useState('');
  const [countryCode, setCountryCode] = useState('+1');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [deliveryStreet, setDeliveryStreet] = useState('');
  const [deliveryApt, setDeliveryApt] = useState('');
  const [deliveryCity, setDeliveryCity] = useState('Frisco');
  const [deliveryZip, setDeliveryZip] = useState('');
  const [isSatvikRequested, setIsSatvikRequested] = useState(false);
  const [dietaryNotes, setDietaryNotes] = useState('');
  const [showOptionalNotes, setShowOptionalNotes] = useState(false);
  const [showItemizedBreakdown, setShowItemizedBreakdown] = useState(false);

  // Load saved customer profile once on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(SAVED_CUSTOMER_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.customerName) setCustomerName(parsed.customerName);
        if (parsed.countryCode) setCountryCode(parsed.countryCode);
        if (parsed.phoneNumber) setPhoneNumber(parsed.phoneNumber);
        if (parsed.email) setEmail(parsed.email);
        if (parsed.deliveryStreet) setDeliveryStreet(parsed.deliveryStreet);
        if (parsed.deliveryApt) setDeliveryApt(parsed.deliveryApt);
        if (parsed.deliveryCity) setDeliveryCity(parsed.deliveryCity);
        if (parsed.deliveryZip) setDeliveryZip(parsed.deliveryZip);
      }
    } catch {
      // Ignore storage read errors
    }
  }, []);

  // Payment Method: 'cash' | 'zelle' | 'credit_card'
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('zelle');

  // Date & Time state
  const [blackouts, setBlackouts] = useState<string[]>(blackoutDates);

  // Synchronize blackouts when blackoutDates prop changes dynamically
  useEffect(() => {
    if (blackoutDates.length > 0) {
      setBlackouts(prev => Array.from(new Set([...prev, ...blackoutDates])));
    }
  }, [blackoutDates]);

  const [fulfillmentDate, setFulfillmentDate] = useState('');
  const [fulfillmentTime, setFulfillmentTime] = useState('4:00 PM');
  const [showAlternativeDatePicker, setShowAlternativeDatePicker] = useState(false);

  const isTiffinOrder = (cart.length > 0 && cart.some(i => i.category === 'tiffin' || (i.menuItemId && i.menuItemId.includes('tiffin')))) || subTab === 'tiffin';
  const effectiveSubTab: 'order' | 'cake' | 'tiffin' = isTiffinOrder ? 'tiffin' : (subTab || 'order');

  // Multi-day order fulfillment time state
  const [sameTimeForAllDays, setSameTimeForAllDays] = useState(true);
  const [perDayTimes, setPerDayTimes] = useState<Record<string, string>>({});

  // Compute distinct date groups present in the cart
  const distinctCartDateGroups = useMemo(() => {
    const map = new Map<string, { dateStr: string; displayLabel: string; items: CartItem[] }>();
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    for (const item of cart) {
      const match = item.id.match(/\d{4}-\d{2}-\d{2}/) || item.menuItemId?.match(/\d{4}-\d{2}-\d{2}/) || item.notes?.match(/\d{4}-\d{2}-\d{2}/);
      if (match) {
        const dStr = match[0];
        const parts = dStr.split('-').map(Number);
        let label = dStr;
        if (parts.length === 3) {
          const dObj = new Date(parts[0], parts[1] - 1, parts[2], 12, 0, 0);
          label = `${dayNames[dObj.getDay()]}, ${monthNames[dObj.getMonth()]} ${dObj.getDate()}`;
        }
        if (!map.has(dStr)) {
          map.set(dStr, { dateStr: dStr, displayLabel: label, items: [] });
        }
        map.get(dStr)!.items.push(item);
      }
    }

    return Array.from(map.values()).sort((a, b) => a.dateStr.localeCompare(b.dateStr));
  }, [cart]);
  
  // Validation & Submission
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);

  // Fetch blackouts on open & set guaranteed valid initial dates
  useEffect(() => {
    if (isOpen) {
      setShowAlternativeDatePicker(false);
      setSubmissionError(null);
      setFormErrors({});

      fetchCalendarBlackouts().then(dates => {
        setBlackouts(prev => Array.from(new Set([...prev, ...dates, ...blackoutDates])));

        if (distinctCartDateGroups.length > 0) {
          const initialMap: Record<string, string> = {};
          distinctCartDateGroups.forEach(g => {
            const defaultSlot = getDefaultTimeSlotForDate(g.dateStr, cart, effectiveSubTab);
            let validSlot = defaultSlot;
            if (!isTimeSlotValidForDate(g.dateStr, validSlot, cart, effectiveSubTab)) {
              const availableSlots = getTimeSlotsForDate(g.dateStr, cart, effectiveSubTab);
              for (const slot of availableSlots) {
                if (isTimeSlotValidForDate(g.dateStr, slot, cart, effectiveSubTab)) {
                  validSlot = slot;
                  break;
                }
              }
            }
            initialMap[g.dateStr] = validSlot;
          });
          setPerDayTimes(initialMap);
          const firstDate = distinctCartDateGroups[0].dateStr;
          setFulfillmentDate(firstDate);
          setFulfillmentTime(initialMap[firstDate] || getDefaultTimeSlotForDate(firstDate, cart, effectiveSubTab));
        } else {
          const tiffinItemWithDate = cart.find(i => (i.category === 'tiffin' || i.menuItemId?.includes('tiffin')) && /\d{4}-\d{2}-\d{2}/.test(i.id || i.menuItemId || i.notes || ''));
          let preferredDate: string | undefined = initialFulfillmentDate;
          if (tiffinItemWithDate) {
            const match = (tiffinItemWithDate.id || tiffinItemWithDate.menuItemId || tiffinItemWithDate.notes || '').match(/\d{4}-\d{2}-\d{2}/);
            if (match) preferredDate = match[0];
          }

          if (preferredDate && !dates.includes(preferredDate) && isDateSelectable(preferredDate, dates, cart, effectiveSubTab).selectable) {
            setFulfillmentDate(preferredDate);
            const slots = getTimeSlotsForDate(preferredDate, cart, effectiveSubTab);
            let chosen = getDefaultTimeSlotForDate(preferredDate, cart, effectiveSubTab);
            if (!isTimeSlotValidForDate(preferredDate, chosen, cart, effectiveSubTab)) {
              for (const slot of slots) {
                if (isTimeSlotValidForDate(preferredDate, slot, cart, effectiveSubTab)) {
                  chosen = slot;
                  break;
                }
              }
            }
            setFulfillmentTime(chosen);
          } else {
            const firstValid = findFirstValidFulfillmentSlot(dates, cart, effectiveSubTab);
            setFulfillmentDate(firstValid.dateStr);
            setFulfillmentTime(firstValid.timeSlot);
          }
        }
      });
    }
  }, [isOpen, cart, distinctCartDateGroups]);

  // Handle user selecting a date (auto-corrects time slot if chosen time is past cutoff on new date)
  const handleSelectDate = (newDateStr: string) => {
    setFulfillmentDate(newDateStr);
    setSubmissionError(null);

    if (!isTimeSlotValidForDate(newDateStr, fulfillmentTime, cart, effectiveSubTab)) {
      const slots = getTimeSlotsForDate(newDateStr, cart, effectiveSubTab);
      for (const slot of slots) {
        if (isTimeSlotValidForDate(newDateStr, slot, cart, effectiveSubTab)) {
          setFulfillmentTime(slot);
          break;
        }
      }
    }
  };

  const hasTiffin = cart.some(item => item.category === 'tiffin');

  // Enforce pickup if cart has tiffin items
  useEffect(() => {
    if (hasTiffin && isDelivery) {
      setIsDelivery(false);
    }
  }, [hasTiffin, isDelivery, setIsDelivery]);

  // Lead time calculations
  const cutoffValidation = validateFulfillmentCutoff(fulfillmentDate, fulfillmentTime, blackouts, cart, effectiveSubTab);
  const upcomingDateOptions = getUpcomingDates(14, isTiffinOrder);

  // Cost & Tax Bifurcation calculations
  const tiffinTotal = cart
    .filter(item => item.category === 'tiffin' || (item.menuItemId && item.menuItemId.includes('tiffin')))
    .reduce((sum, item) => sum + item.totalPrice, 0);
  const tiffinBase = Math.round((tiffinTotal / 1.0825) * 100) / 100;
  const tiffinTax = Math.round((tiffinTotal - tiffinBase) * 100) / 100;

  const cakeSubtotal = cart
    .filter(item => item.category === 'cakes')
    .reduce((sum, item) => sum + item.totalPrice, 0);

  const cateringSubtotal = cart
    .filter(item => item.category !== 'cakes' && item.category !== 'tiffin' && (!item.menuItemId || !item.menuItemId.includes('tiffin')))
    .reduce((sum, item) => sum + item.totalPrice, 0);

  const deliveryFee = isDelivery ? 50.00 : 0.00;
  const cateringTaxable = cateringSubtotal + (cateringSubtotal > 0 && isDelivery ? deliveryFee : 0);
  const cateringTax = Math.round(cateringTaxable * 0.0825 * 100) / 100;

  const taxAmount = Math.round((tiffinTax + cateringTax) * 100) / 100;
  const foodSubtotal = Math.round((tiffinBase + cateringSubtotal + cakeSubtotal) * 100) / 100;
  const preCardTotal = Math.round((foodSubtotal + deliveryFee + taxAmount) * 100) / 100;

  const processingFee = paymentMethod === 'credit_card'
    ? Math.round(preCardTotal * 0.035 * 100) / 100
    : 0.00;

  const totalAmount = Math.round((preCardTotal + processingFee) * 100) / 100;
  const totalItemQty = cart.reduce((s, i) => s + i.quantity, 0);

  // Format phone helper
  const handlePhoneChange = (val: string) => {
    const cleaned = val.replace(/\D/g, '').substring(0, 10);
    if (cleaned.length >= 7) {
      setPhoneNumber(`(${cleaned.substring(0, 3)}) ${cleaned.substring(3, 6)}-${cleaned.substring(6)}`);
    } else if (cleaned.length >= 4) {
      setPhoneNumber(`(${cleaned.substring(0, 3)}) ${cleaned.substring(3)}`);
    } else if (cleaned.length > 0) {
      setPhoneNumber(`(${cleaned}`);
    } else {
      setPhoneNumber('');
    }
  };

  // Validate & Submit Express Checkout
  const handleSubmit = async (orderType: OrderType) => {
    // 1. Validate Date & Time Cutoff
    if (!cutoffValidation.isValid) {
      const firstValid = findFirstValidFulfillmentSlot(blackouts, cart, effectiveSubTab);
      setFulfillmentDate(firstValid.dateStr);
      setFulfillmentTime(firstValid.timeSlot);
      setSubmissionError(`Adjusted to earliest available slot: ${firstValid.dateStr} at ${firstValid.timeSlot}. Tap Submit again to confirm.`);
      modalBodyRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // 2. Validate Contact & Address Fields
    const errors: Record<string, string> = {};
    if (!customerName.trim()) {
      errors.customerName = 'Full name is required.';
    }
    const cleanPhone = phoneNumber.replace(/\D/g, '');
    if (cleanPhone.length < 7) {
      errors.phoneNumber = 'Valid phone number is required.';
    }
    if (email.trim() && (!email.includes('@') || !email.includes('.'))) {
      errors.email = 'Please enter a valid email address.';
    }
    if (isDelivery) {
      if (!deliveryStreet.trim()) {
        errors.deliveryStreet = 'Street address is required.';
      }
      if (!deliveryZip.trim() || !/^\d{5}$/.test(deliveryZip.trim())) {
        errors.deliveryZip = 'Valid 5-digit ZIP code is required.';
      }
    }

    setFormErrors(errors);
    if (Object.keys(errors).length > 0) {
      setSubmissionError(Object.values(errors).join(' • '));
      modalBodyRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setIsSubmitting(true);
    setSubmissionError(null);
    try {
      // Save customer details in localStorage for 1-click repeat orders
      try {
        localStorage.setItem(SAVED_CUSTOMER_KEY, JSON.stringify({
          customerName: customerName.trim(),
          countryCode,
          phoneNumber: phoneNumber.trim(),
          email: email.trim(),
          deliveryStreet: deliveryStreet.trim(),
          deliveryApt: deliveryApt.trim(),
          deliveryCity: deliveryCity.trim(),
          deliveryZip: deliveryZip.trim()
        }));
      } catch {
        // Ignore storage write errors
      }

      const fullDeliveryAddress = isDelivery
        ? `${deliveryStreet.trim()}${deliveryApt.trim() ? `, Apt/Ste ${deliveryApt.trim()}` : ''}, ${deliveryCity.trim()}, TX ${deliveryZip.trim()}`
        : null;

      let effectiveFulfillmentDate = fulfillmentDate;
      let effectiveFulfillmentTime = fulfillmentTime;

      if (distinctCartDateGroups.length > 0 && !showAlternativeDatePicker) {
        effectiveFulfillmentDate = distinctCartDateGroups[0].dateStr;
      }

      if (distinctCartDateGroups.length > 1 && !showAlternativeDatePicker) {
        if (!sameTimeForAllDays) {
          effectiveFulfillmentTime = distinctCartDateGroups
            .map(g => `${g.displayLabel.split(',')[0]}: ${perDayTimes[g.dateStr] || fulfillmentTime}`)
            .join(' | ');
        } else {
          effectiveFulfillmentTime = `${fulfillmentTime} (All ${distinctCartDateGroups.length} Days)`;
        }
      }

      const multiDayBreakdown = distinctCartDateGroups.length > 1 && !showAlternativeDatePicker
        ? `[MULTI-DAY SCHEDULE] ${distinctCartDateGroups.map(g => `${g.displayLabel}: ${sameTimeForAllDays ? fulfillmentTime : (perDayTimes[g.dateStr] || fulfillmentTime)}`).join(' • ')}`
        : '';

      const fullDietaryNotes = [
        isSatvikRequested ? 'SATVIK / JAIN-FRIENDLY REQUESTED (No Onion, No Garlic)' : '',
        multiDayBreakdown,
        dietaryNotes.trim()
      ].filter(Boolean).join(' | ');

      const formattedContactNumber = `${countryCode} ${phoneNumber.trim()}`.trim();

      // Helper to compute exact financial breakdown for any subset of cart items
      const computeCartSubsetFinancials = (subsetItems: CartItem[], includeDeliveryFee: boolean) => {
        const subTiffinTotal = subsetItems
          .filter(item => item.category === 'tiffin' || (item.menuItemId && item.menuItemId.includes('tiffin')))
          .reduce((sum, item) => sum + item.totalPrice, 0);
        const subTiffinBase = Math.round((subTiffinTotal / 1.0825) * 100) / 100;
        const subTiffinTax = Math.round((subTiffinTotal - subTiffinBase) * 100) / 100;

        const subCakeSubtotal = subsetItems
          .filter(item => item.category === 'cakes')
          .reduce((sum, item) => sum + item.totalPrice, 0);

        const subCateringSubtotal = subsetItems
          .filter(item => item.category !== 'cakes' && item.category !== 'tiffin' && (!item.menuItemId || !item.menuItemId.includes('tiffin')))
          .reduce((sum, item) => sum + item.totalPrice, 0);

        const subDeliveryFee = includeDeliveryFee && isDelivery ? 50.00 : 0.00;
        const subCateringTaxable = subCateringSubtotal + (subCateringSubtotal > 0 && includeDeliveryFee && isDelivery ? subDeliveryFee : 0);
        const subCateringTax = Math.round(subCateringTaxable * 0.0825 * 100) / 100;

        const subTaxAmount = Math.round((subTiffinTax + subCateringTax) * 100) / 100;
        const subFoodSubtotal = Math.round((subTiffinBase + subCateringSubtotal + subCakeSubtotal) * 100) / 100;
        const subPreCardTotal = Math.round((subFoodSubtotal + subDeliveryFee + subTaxAmount) * 100) / 100;
        const subProcessingFee = paymentMethod === 'credit_card'
          ? Math.round(subPreCardTotal * 0.035 * 100) / 100
          : 0.00;
        const subTotalAmount = Math.round((subPreCardTotal + subProcessingFee) * 100) / 100;

        return {
          delivery_fee: subDeliveryFee,
          food_subtotal: subFoodSubtotal,
          tax_amount: subTaxAmount,
          processing_fee: subProcessingFee,
          total_amount: subTotalAmount
        };
      };

      // If this order spans multiple scheduled days (e.g. Multi-Day Tiffin or 5-Day Weekly Plan),
      // create an individual daily order record for EACH day so KDS displays and tracks every day on its own date tab.
      if (distinctCartDateGroups.length > 1 && !showAlternativeDatePicker) {
        const datedItemIds = new Set(distinctCartDateGroups.flatMap(g => g.items.map(i => i.id)));
        const undatedItems = cart.filter(i => !datedItemIds.has(i.id));
        const totalDays = distinctCartDateGroups.length;
        const createdDailyOrders: CateringOrder[] = [];

        for (let idx = 0; idx < totalDays; idx++) {
          const group = distinctCartDateGroups[idx];
          const dayItems = idx === 0 && undatedItems.length > 0
            ? [...group.items, ...undatedItems]
            : group.items;
          const dayTime = sameTimeForAllDays
            ? fulfillmentTime
            : (perDayTimes[group.dateStr] || fulfillmentTime);

          const dayFinancials = computeCartSubsetFinancials(dayItems, idx === 0);
          const dayScheduleTag = `[Weekly/Multi-Day Tiffin: Day ${idx + 1} of ${totalDays} (${group.displayLabel} @ ${dayTime})]`;
          const dayDietaryNotes = [
            isSatvikRequested ? 'SATVIK / JAIN-FRIENDLY REQUESTED (No Onion, No Garlic)' : '',
            dayScheduleTag,
            dietaryNotes.trim()
          ].filter(Boolean).join(' | ');

          const dayPayload = {
            customer_name: customerName.trim(),
            phone_number: formattedContactNumber,
            email: email.trim(),
            is_delivery: isDelivery,
            delivery_address: fullDeliveryAddress,
            delivery_fee: dayFinancials.delivery_fee,
            food_subtotal: dayFinancials.food_subtotal,
            tax_amount: dayFinancials.tax_amount,
            payment_method: paymentMethod,
            processing_fee: dayFinancials.processing_fee,
            total_amount: dayFinancials.total_amount,
            order_description: dayItems.map(i => `${i.name}${i.notes ? ` [${i.notes}]` : ''} (${i.selectionLabel} × ${i.quantity}) [$${i.totalPrice.toFixed(2)}]`).join('; '),
            fulfillment_date: group.dateStr,
            fulfillment_time: dayTime,
            dietary_notes: dayDietaryNotes || null,
            order_type: orderType,
            status: 'new' as any,
            items: dayItems
          };

          const dayResult = await createOrder(dayPayload);
          if (dayResult.data) {
            createdDailyOrders.push(dayResult.data);
          } else {
            throw new Error(dayResult.error?.message || `Failed to save order for ${group.displayLabel}`);
          }
        }

        // Build a combined summary order object for the customer's single WhatsApp confirmation & receipt modal
        const combinedSummaryOrder: CateringOrder = {
          ...createdDailyOrders[0],
          delivery_fee: deliveryFee,
          food_subtotal: foodSubtotal,
          tax_amount: taxAmount,
          processing_fee: processingFee,
          total_amount: totalAmount,
          order_description: cart.map(i => `${i.name}${i.notes ? ` [${i.notes}]` : ''} (${i.selectionLabel} × ${i.quantity}) [$${i.totalPrice.toFixed(2)}]`).join('; '),
          fulfillment_date: effectiveFulfillmentDate,
          fulfillment_time: effectiveFulfillmentTime,
          dietary_notes: fullDietaryNotes || null,
          items: cart
        };

        try {
          const waUrl = buildOrderWhatsAppUrl(combinedSummaryOrder);
          window.open(waUrl, '_blank');
        } catch (e) {
          console.warn('Auto notification popup prevented by browser', e);
        }
        onOrderSuccess(combinedSummaryOrder, orderType === 'estimate');
        onClose();
        return;
      }

      const payload = {
        customer_name: customerName.trim(),
        phone_number: formattedContactNumber,
        email: email.trim(),
        is_delivery: isDelivery,
        delivery_address: fullDeliveryAddress,
        delivery_fee: deliveryFee,
        food_subtotal: foodSubtotal,
        tax_amount: taxAmount,
        payment_method: paymentMethod,
        processing_fee: processingFee,
        total_amount: totalAmount,
        order_description: cart.map(i => `${i.name}${i.notes ? ` [${i.notes}]` : ''} (${i.selectionLabel} × ${i.quantity}) [$${i.totalPrice.toFixed(2)}]`).join('; '),
        fulfillment_date: effectiveFulfillmentDate,
        fulfillment_time: effectiveFulfillmentTime,
        dietary_notes: fullDietaryNotes || null,
        order_type: orderType,
        status: 'new' as any,
        items: cart
      };

      const result = await createOrder(payload);
      if (result.data) {
        try {
          const waUrl = buildOrderWhatsAppUrl(result.data);
          window.open(waUrl, '_blank');
        } catch (e) {
          console.warn('Auto notification popup prevented by browser', e);
        }
        onOrderSuccess(result.data, orderType === 'estimate');
        onClose();
      } else {
        throw new Error(result.error?.message || 'Failed to record order submission');
      }
    } catch (err: any) {
      setSubmissionError(err?.message || 'An error occurred while saving your order.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-xs p-0 sm:p-4 animate-fade-in font-sans">
      <div className="relative w-full max-w-2xl bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl border border-gray-200 overflow-hidden max-h-[94vh] sm:max-h-[90vh] flex flex-col">
        
        {/* ── Lean Express Header ── */}
        <div className="bg-[#00346f] text-white px-4 py-3 sm:px-5 sm:py-4 shrink-0 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#ffdea5] block">
              EXPRESS CHECKOUT • {totalItemQty} {totalItemQty === 1 ? 'ITEM' : 'ITEMS'}
            </span>
            <h2 className="font-serif text-base sm:text-xl font-bold truncate">
              Complete Your Order (${totalAmount.toFixed(2)})
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer shrink-0"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ── Scrollable Express Body ── */}
        <div ref={modalBodyRef} className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
          
          {submissionError && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2 font-medium">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{submissionError}</span>
            </div>
          )}

          {/* ── 1. FULFILLMENT METHOD & SCHEDULE ── */}
          <div className="bg-gray-50/90 rounded-2xl p-3.5 sm:p-4 border border-gray-200 space-y-3">
            {/* Fulfillment Toggle: Pickup vs Delivery */}
            {hasTiffin ? (
              <div className="flex items-center justify-between gap-2 text-xs bg-amber-50/90 border border-amber-200 px-3 py-2 rounded-xl text-amber-950">
                <div className="flex items-center gap-2 font-bold min-w-0">
                  <Store className="w-4 h-4 text-amber-700 shrink-0" />
                  <span className="truncate">Self-Pickup: Deerwood Dr, Little Elm</span>
                </div>
                <span className="text-[11px] font-black text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md shrink-0">
                  FREE
                </span>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setIsDelivery(false)}
                  className={`p-2.5 rounded-xl border flex items-center gap-2.5 transition-all cursor-pointer ${
                    !isDelivery
                      ? 'border-[#00346f] bg-blue-50/80 text-[#00346f] ring-1 ring-[#00346f] font-bold shadow-2xs'
                      : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Store className="w-4 h-4 shrink-0" />
                  <div className="text-left min-w-0">
                    <div className="text-xs font-bold leading-tight">Self-Pickup</div>
                    <div className="text-[10px] text-gray-500 font-normal truncate">Little Elm ($0)</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setIsDelivery(true)}
                  className={`p-2.5 rounded-xl border flex items-center gap-2.5 transition-all cursor-pointer ${
                    isDelivery
                      ? 'border-[#00346f] bg-blue-50/80 text-[#00346f] ring-1 ring-[#00346f] font-bold shadow-2xs'
                      : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Truck className="w-4 h-4 shrink-0" />
                  <div className="text-left min-w-0">
                    <div className="text-xs font-bold leading-tight">Venue Delivery</div>
                    <div className="text-[10px] text-[#775a19] font-bold">+$50 Flat Fee</div>
                  </div>
                </button>
              </div>
            )}

            {/* Cutoff Warning Only When Needed */}
            {!cutoffValidation.isValid && (
              <div className="p-2.5 rounded-xl border bg-amber-50 border-amber-200 text-amber-900 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div className="leading-snug">{cutoffValidation.message}</div>
              </div>
            )}

            {/* Date & Time Selection */}
            {isTiffinOrder && distinctCartDateGroups.length === 1 && !showAlternativeDatePicker ? (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-1">
                <div className="flex items-center justify-between sm:justify-start gap-2">
                  <span className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                    <CalendarIcon className="w-3.5 h-3.5 text-[#00346f]" />
                    <span>Date:</span>
                  </span>
                  <span className="px-2.5 py-1 bg-[#00346f] text-white rounded-lg text-xs font-bold">
                    {distinctCartDateGroups[0].displayLabel}
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowAlternativeDatePicker(true)}
                    className="text-[11px] text-[#00346f] underline font-semibold cursor-pointer ml-1"
                  >
                    Change
                  </button>
                </div>

                <div className="flex items-center gap-2 flex-1 sm:max-w-[230px]">
                  <span className="text-xs font-bold text-gray-700 shrink-0">Time:</span>
                  <select
                    value={fulfillmentTime}
                    onChange={(e) => {
                      const newTime = e.target.value;
                      setFulfillmentTime(newTime);
                      setPerDayTimes({ [fulfillmentDate]: newTime });
                    }}
                    className="w-full bg-white border border-gray-300 rounded-xl px-2.5 py-2 min-h-[40px] text-xs text-gray-900 font-bold focus:outline-none focus:border-[#00346f]"
                  >
                    {getTimeSlotsForDate(fulfillmentDate, cart, effectiveSubTab).map(slot => {
                      const isSlotValid = isTimeSlotValidForDate(fulfillmentDate, slot, cart, effectiveSubTab);
                      return (
                        <option key={slot} value={slot} disabled={!isSlotValid}>
                          {slot} {!isSlotValid ? '(Past cutoff)' : ''}
                        </option>
                      );
                    })}
                  </select>
                </div>
              </div>
            ) : isTiffinOrder && distinctCartDateGroups.length > 1 && !showAlternativeDatePicker ? (
              <div className="space-y-2.5 pt-1">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-bold text-[#00346f] flex items-center gap-1.5">
                    <CalendarIcon className="w-3.5 h-3.5" />
                    <span>{distinctCartDateGroups.length} Scheduled Tiffin Days</span>
                  </span>
                  <label className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#00346f] cursor-pointer bg-white px-2.5 py-1 rounded-lg border border-gray-200">
                    <input
                      type="checkbox"
                      checked={sameTimeForAllDays}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setSameTimeForAllDays(checked);
                        if (checked) {
                          const updated: Record<string, string> = {};
                          distinctCartDateGroups.forEach(g => updated[g.dateStr] = fulfillmentTime);
                          setPerDayTimes(updated);
                        }
                      }}
                      className="w-3.5 h-3.5 rounded text-[#00346f]"
                    />
                    <span>Same pickup time ({fulfillmentTime})</span>
                  </label>
                </div>

                {sameTimeForAllDays ? (
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-gray-700 shrink-0">Pickup Time:</span>
                    <select
                      value={fulfillmentTime}
                      onChange={(e) => {
                        const newTime = e.target.value;
                        setFulfillmentTime(newTime);
                        const updated: Record<string, string> = {};
                        distinctCartDateGroups.forEach(g => updated[g.dateStr] = newTime);
                        setPerDayTimes(updated);
                      }}
                      className="flex-1 bg-white border border-gray-300 rounded-xl px-2.5 py-2 min-h-[40px] text-xs text-gray-900 font-bold focus:outline-none focus:border-[#00346f]"
                    >
                      {getTimeSlotsForDate(fulfillmentDate, cart, effectiveSubTab).map(slot => {
                        const isSlotValid = isTimeSlotValidForDate(fulfillmentDate, slot, cart, effectiveSubTab);
                        return (
                          <option key={slot} value={slot} disabled={!isSlotValid}>
                            {slot} {!isSlotValid ? '(Past cutoff)' : ''}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {distinctCartDateGroups.map(g => {
                      const currentTime = perDayTimes[g.dateStr] || getDefaultTimeSlotForDate(g.dateStr, cart, effectiveSubTab);
                      const availableSlots = getTimeSlotsForDate(g.dateStr, cart, effectiveSubTab);
                      return (
                        <div key={g.dateStr} className="p-2 bg-white rounded-xl border border-gray-200 flex items-center justify-between gap-2">
                          <span className="font-bold text-xs text-[#00346f] truncate">{g.displayLabel}</span>
                          <select
                            value={currentTime}
                            onChange={(e) => {
                              const newTime = e.target.value;
                              setPerDayTimes(prev => ({ ...prev, [g.dateStr]: newTime }));
                            }}
                            className="px-2 py-1 bg-gray-50 border border-gray-300 rounded-lg text-xs font-bold text-[#00346f]"
                          >
                            {availableSlots.map(slot => {
                              const isSlotValid = isTimeSlotValidForDate(g.dateStr, slot, cart, effectiveSubTab);
                              return (
                                <option key={slot} value={slot} disabled={!isSlotValid}>
                                  {slot}
                                </option>
                              );
                            })}
                          </select>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ) : (
              /* Compact Date Rail + Time Window for Catering, Cakes, or Custom Reschedule */
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-gray-600 flex items-center gap-1">
                    <CalendarIcon className="w-3.5 h-3.5 text-[#00346f]" />
                    <span>Select Date &amp; Time</span>
                  </span>
                  {showAlternativeDatePicker && distinctCartDateGroups.length > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        setShowAlternativeDatePicker(false);
                        setFulfillmentDate(distinctCartDateGroups[0].dateStr);
                      }}
                      className="text-[11px] text-[#00346f] font-bold underline cursor-pointer"
                    >
                      Reset to Menu Date
                    </button>
                  )}
                </div>

                {/* Horizontal Date Pills */}
                <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                  {upcomingDateOptions.map(opt => {
                    const check = isDateSelectable(opt.dateStr, blackouts, cart, effectiveSubTab);
                    const isSelected = fulfillmentDate === opt.dateStr;

                    return (
                      <button
                        key={opt.dateStr}
                        type="button"
                        disabled={!check.selectable}
                        onClick={() => handleSelectDate(opt.dateStr)}
                        className={`flex flex-col items-center justify-center min-w-[60px] py-1.5 px-2 rounded-xl border text-center transition-all cursor-pointer shrink-0 ${
                          !check.selectable
                            ? 'bg-gray-100 border-gray-200 text-gray-300 cursor-not-allowed opacity-60'
                            : isSelected
                            ? 'bg-[#00346f] text-white border-[#00346f] shadow-xs ring-2 ring-[#00346f]/20'
                            : 'bg-white hover:bg-gray-100 border-gray-200 text-gray-700'
                        }`}
                      >
                        <span className="text-[9px] uppercase font-bold tracking-wider">{opt.dayOfWeek}</span>
                        <span className="text-[11px] font-black mt-0.5 whitespace-nowrap">{opt.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Date Input & Time Dropdown Row */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-gray-500 mb-0.5">
                      Date
                    </label>
                    <input
                      type="date"
                      value={fulfillmentDate}
                      min={cutoffValidation.earliestAllowedDate}
                      onChange={(e) => handleSelectDate(e.target.value)}
                      className="w-full bg-white border border-gray-300 rounded-xl px-2.5 py-2 min-h-[40px] text-xs font-bold text-gray-800 focus:outline-none focus:border-[#00346f]"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase text-gray-500 mb-0.5">
                      Time Window
                    </label>
                    <select
                      value={fulfillmentTime}
                      onChange={(e) => {
                        const newTime = e.target.value;
                        setFulfillmentTime(newTime);
                        if (sameTimeForAllDays) {
                          const updated: Record<string, string> = {};
                          distinctCartDateGroups.forEach(g => updated[g.dateStr] = newTime);
                          setPerDayTimes(updated);
                        }
                      }}
                      className="w-full bg-white border border-gray-300 rounded-xl px-2.5 py-2 min-h-[40px] text-xs font-bold text-gray-800 focus:outline-none focus:border-[#00346f]"
                    >
                      {getTimeSlotsForDate(fulfillmentDate, cart, effectiveSubTab).map(slot => {
                        const isSlotValid = isTimeSlotValidForDate(fulfillmentDate, slot, cart, effectiveSubTab);
                        return (
                          <option key={slot} value={slot} disabled={!isSlotValid}>
                            {slot} {!isSlotValid ? '(Cutoff)' : ''}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ── 2. CUSTOMER CONTACT & ADDRESS ── */}
          <div className="bg-white rounded-2xl p-3.5 sm:p-4 border border-gray-200 space-y-3">
            <h3 className="font-serif font-bold text-xs sm:text-sm text-[#00346f] flex items-center gap-1.5">
              <User className="w-4 h-4 text-[#775a19]" />
              <span>Your Contact Information</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  autoComplete="name"
                  placeholder="Your full name"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className={`w-full px-3 py-2 min-h-[42px] text-sm sm:text-xs bg-gray-50 border rounded-xl focus:outline-none focus:bg-white transition-all ${
                    formErrors.customerName ? 'border-rose-500' : 'border-gray-200 focus:border-[#00346f]'
                  }`}
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                  Mobile Number (WhatsApp/SMS) <span className="text-rose-500">*</span>
                </label>
                <div className="flex items-center gap-1.5">
                  <select
                    value={countryCode}
                    onChange={(e) => setCountryCode(e.target.value)}
                    className="bg-gray-50 border border-gray-200 rounded-xl px-2 py-2 min-h-[42px] text-xs font-bold text-[#00346f] focus:outline-none focus:bg-white shrink-0 cursor-pointer"
                    aria-label="Country Code"
                  >
                    <option value="+1">🇺🇸 +1</option>
                    <option value="+91">🇮🇳 +91</option>
                    <option value="+44">🇬🇧 +44</option>
                    <option value="+61">🇦🇺 +61</option>
                    <option value="+971">🇦🇪 +971</option>
                  </select>
                  <input
                    type="tel"
                    autoComplete="tel"
                    placeholder="(945) 527-4566"
                    value={phoneNumber}
                    onChange={(e) => handlePhoneChange(e.target.value)}
                    className={`w-full px-3 py-2 min-h-[42px] text-sm sm:text-xs bg-gray-50 border rounded-xl focus:outline-none focus:bg-white transition-all ${
                      formErrors.phoneNumber ? 'border-rose-500' : 'border-gray-200 focus:border-[#00346f]'
                    }`}
                  />
                </div>
              </div>
            </div>

            <div>
              <input
                type="email"
                autoComplete="email"
                placeholder="Email address for receipt copy (optional)"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full px-3 py-2 min-h-[40px] text-sm sm:text-xs bg-gray-50 border rounded-xl focus:outline-none focus:bg-white transition-all ${
                  formErrors.email ? 'border-rose-500' : 'border-gray-200 focus:border-[#00346f]'
                }`}
              />
            </div>

            {/* Delivery Address Input (Only if Delivery) */}
            {isDelivery && (
              <div className="pt-2 border-t border-gray-100">
                <AddressValidationInput
                  street={deliveryStreet}
                  setStreet={setDeliveryStreet}
                  apt={deliveryApt}
                  setApt={setDeliveryApt}
                  city={deliveryCity}
                  setCity={setDeliveryCity}
                  zip={deliveryZip}
                  setZip={setDeliveryZip}
                />
              </div>
            )}

            {/* Compact Dietary / Satvik & Optional Notes Toggle */}
            <div className="pt-1 flex flex-wrap items-center justify-between gap-2">
              <label className="inline-flex items-center gap-2 text-xs font-semibold text-amber-950 bg-amber-50/80 border border-amber-200 px-3 py-1.5 rounded-xl cursor-pointer">
                <input
                  type="checkbox"
                  checked={isSatvikRequested}
                  onChange={(e) => setIsSatvikRequested(e.target.checked)}
                  className="rounded border-amber-300 text-[#775a19] focus:ring-[#775a19]"
                />
                <span>Satvik / Jain (No Onion/Garlic)</span>
              </label>

              <button
                type="button"
                onClick={() => setShowOptionalNotes(!showOptionalNotes)}
                className="text-xs font-bold text-[#00346f] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>{showOptionalNotes || dietaryNotes ? 'Special Instructions' : '+ Add Gate Code / Notes'}</span>
                {showOptionalNotes ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            </div>

            {(showOptionalNotes || dietaryNotes) && (
              <textarea
                rows={2}
                placeholder="Gate codes, allergy alerts, or spice preferences..."
                value={dietaryNotes}
                onChange={(e) => setDietaryNotes(e.target.value)}
                className="w-full px-3 py-2 text-sm sm:text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:bg-white focus:border-[#00346f]"
              />
            )}
          </div>

          {/* ── 3. PAYMENT METHOD & COMPACT SUMMARY ── */}
          <div className="bg-white rounded-2xl p-3.5 sm:p-4 border border-gray-200 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-serif font-bold text-xs sm:text-sm text-[#00346f]">
                Payment Method
              </h3>
              <span className="text-[11px] text-gray-500">
                No upfront card charge required
              </span>
            </div>

            {/* 3-Column Segmented Payment Bar (Fits on 1 row on mobile!) */}
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setPaymentMethod('zelle')}
                className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1 ${
                  paymentMethod === 'zelle'
                    ? 'border-[#00346f] bg-[#00346f] text-white shadow-xs ring-2 ring-[#00346f]/20'
                    : 'border-gray-200 bg-gray-50/70 hover:bg-gray-100 text-gray-800'
                }`}
              >
                <div className="flex items-center gap-1">
                  <QrCode className={`w-3.5 h-3.5 ${paymentMethod === 'zelle' ? 'text-[#ffdea5]' : 'text-purple-600'}`} />
                  <span className="text-xs font-bold">Zelle</span>
                </div>
                <span className={`text-[10px] font-semibold ${paymentMethod === 'zelle' ? 'text-[#ffdea5]' : 'text-emerald-700'}`}>
                  0% Fee
                </span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('cash')}
                className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1 ${
                  paymentMethod === 'cash'
                    ? 'border-[#00346f] bg-[#00346f] text-white shadow-xs ring-2 ring-[#00346f]/20'
                    : 'border-gray-200 bg-gray-50/70 hover:bg-gray-100 text-gray-800'
                }`}
              >
                <div className="flex items-center gap-1">
                  <Banknote className={`w-3.5 h-3.5 ${paymentMethod === 'cash' ? 'text-[#ffdea5]' : 'text-emerald-600'}`} />
                  <span className="text-xs font-bold">Cash</span>
                </div>
                <span className={`text-[10px] font-semibold ${paymentMethod === 'cash' ? 'text-[#ffdea5]' : 'text-emerald-700'}`}>
                  At Pickup
                </span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('credit_card')}
                className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1 ${
                  paymentMethod === 'credit_card'
                    ? 'border-[#00346f] bg-[#00346f] text-white shadow-xs ring-2 ring-[#00346f]/20'
                    : 'border-gray-200 bg-gray-50/70 hover:bg-gray-100 text-gray-800'
                }`}
              >
                <div className="flex items-center gap-1">
                  <CreditCard className={`w-3.5 h-3.5 ${paymentMethod === 'credit_card' ? 'text-[#ffdea5]' : 'text-blue-600'}`} />
                  <span className="text-xs font-bold">Card</span>
                </div>
                <span className={`text-[10px] font-semibold ${paymentMethod === 'credit_card' ? 'text-[#ffdea5]' : 'text-amber-700'}`}>
                  +3.5% Fee
                </span>
              </button>
            </div>

            {paymentMethod === 'zelle' && (
              <div className="px-3 py-2 bg-purple-50/70 border border-purple-200 rounded-xl text-[11px] text-purple-900 flex items-center justify-between">
                <span>Zelle to: <strong>945-527-4566</strong> (Bluebonnet Whisk)</span>
                <span className="font-semibold text-purple-700">0% Fee</span>
              </div>
            )}

            {/* Compact Order Total Box with Expandable Itemized Details & Edit Controls */}
            <div className="bg-gray-50 rounded-xl p-3 border border-gray-200 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setShowItemizedBreakdown(!showItemizedBreakdown)}
                  className="text-xs font-bold text-[#00346f] flex items-center gap-1 cursor-pointer hover:underline"
                >
                  <span>Order Summary &amp; Edit ({totalItemQty} {totalItemQty === 1 ? 'item' : 'items'})</span>
                  {showItemizedBreakdown ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>
                <span className="text-[11px] text-gray-600">
                  {deliveryFee > 0 ? `Delivery: $${deliveryFee.toFixed(0)} • ` : ''}
                  {processingFee > 0 ? `Card Fee: $${processingFee.toFixed(2)} • ` : ''}
                  <strong>${totalAmount.toFixed(2)}</strong>
                </span>
              </div>

              {showItemizedBreakdown && (
                <div className="pt-2 border-t border-gray-200 space-y-1.5 text-[11px] text-gray-600 animate-fade-in">
                  {cart.map(item => (
                    <div key={item.id} className="flex items-center justify-between gap-2 bg-white px-2.5 py-1.5 rounded-lg border border-gray-200">
                      <div className="min-w-0 flex-1">
                        <span className="font-semibold text-gray-900 block truncate">{item.name}</span>
                        <span className="text-[10px] text-gray-500 block truncate">{item.selectionLabel}</span>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        {onUpdateItemQuantity && (
                          <div className="flex items-center bg-gray-100 rounded-md border border-gray-200 p-0.5">
                            <button
                              type="button"
                              onClick={() => onUpdateItemQuantity(item.id, -1)}
                              className="w-5 h-5 rounded flex items-center justify-center hover:bg-white text-gray-700 cursor-pointer"
                              title="Decrease quantity"
                            >
                              <Minus className="w-2.5 h-2.5" />
                            </button>
                            <span className="w-5 text-center font-bold text-[10px] text-gray-900">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => onUpdateItemQuantity(item.id, 1)}
                              className="w-5 h-5 rounded flex items-center justify-center hover:bg-white text-gray-700 cursor-pointer"
                              title="Increase quantity"
                            >
                              <Plus className="w-2.5 h-2.5" />
                            </button>
                          </div>
                        )}
                        <span className="font-semibold text-gray-900 min-w-[44px] text-right">${item.totalPrice.toFixed(2)}</span>
                        {onRemoveItem && (
                          <button
                            type="button"
                            onClick={() => onRemoveItem(item.id)}
                            className="text-gray-400 hover:text-rose-600 p-0.5 cursor-pointer"
                            title="Remove item"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                  {(isDelivery || processingFee > 0) && (
                    <div className="pt-1.5 border-t border-gray-200/80 space-y-0.5">
                      {isDelivery && (
                        <div className="flex justify-between">
                          <span>Venue Delivery Fee:</span>
                          <span>${deliveryFee.toFixed(2)}</span>
                        </div>
                      )}
                      {processingFee > 0 && (
                        <div className="flex justify-between text-amber-800 font-semibold">
                          <span>Card Processing Fee (3.5%):</span>
                          <span>+${processingFee.toFixed(2)}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              <div className="pt-2 border-t border-gray-200 flex justify-between items-baseline font-bold text-sm text-[#00346f]">
                <span>Total Due:</span>
                <span className="font-serif text-lg sm:text-xl">${totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>

        </div>

        {/* ── Sticky Express Submit Footer ── */}
        <div className="p-3.5 sm:p-4 bg-gray-100 border-t border-gray-200 shrink-0 flex items-center gap-2.5">
          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => handleSubmit('estimate')}
            className="min-h-[46px] px-3.5 py-2.5 rounded-xl border border-[#00346f] text-[#00346f] hover:bg-[#00346f]/10 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer inline-flex items-center justify-center gap-1.5 shrink-0"
            title="Save a printable estimate without placing a live order"
          >
            <FileText className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Save Quote</span>
            <span className="sm:hidden">Quote</span>
          </button>

          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => handleSubmit('order')}
            className="min-h-[46px] flex-1 inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#00346f] hover:bg-[#00224d] text-white text-xs sm:text-sm font-bold uppercase tracking-wider transition-all shadow-md cursor-pointer active:scale-[0.99]"
          >
            <Send className="w-4 h-4 text-[#ffdea5]" />
            <span>{isSubmitting ? 'Submitting Order...' : `Submit Order • $${totalAmount.toFixed(2)}`}</span>
          </button>
        </div>

      </div>
    </div>
  );
}
