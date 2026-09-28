import { useState, useEffect, useRef, useMemo } from 'react';
import { 
  X, 
  Calendar as CalendarIcon, 
  CheckCircle, 
  AlertCircle, 
  FileText, 
  Send, 
  Truck, 
  Store,
  CreditCard,
  Banknote,
  QrCode,
  ArrowRight,
  ArrowLeft,
  User
} from 'lucide-react';
import type { CartItem, CateringOrder, OrderType, PaymentMethod } from '../../types/catering';
import { 
  getRequiredNoticeHours, 
  validateFulfillmentCutoff,
  getUpcomingDates,
  isDateSelectable,
  findFirstValidFulfillmentSlot,
  isTimeSlotValidForDate,
  TIME_SLOTS
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
}

type CheckoutStep = 'schedule' | 'details' | 'payment';

export default function CheckoutModal({
  isOpen,
  onClose,
  cart,
  isDelivery,
  setIsDelivery,
  onOrderSuccess
}: CheckoutModalProps) {
  const modalBodyRef = useRef<HTMLDivElement>(null);

  // Stepped Checkout Navigation
  const [step, setStep] = useState<CheckoutStep>('schedule');

  // Customer Form state
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

  // Payment Method: 'cash' | 'zelle' | 'credit_card'
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('zelle');

  // Date & Time state
  const [blackouts, setBlackouts] = useState<string[]>([]);
  const [fulfillmentDate, setFulfillmentDate] = useState('');
  const [fulfillmentTime, setFulfillmentTime] = useState('12:30 PM');

  // Multi-day order fulfillment time state
  const [sameTimeForAllDays, setSameTimeForAllDays] = useState(true);
  const [perDayTimes, setPerDayTimes] = useState<Record<string, string>>({});

  // Compute distinct date groups present in the cart
  const distinctCartDateGroups = useMemo(() => {
    const map = new Map<string, { dateStr: string; displayLabel: string; items: CartItem[] }>();
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    for (const item of cart) {
      const match = item.id.match(/\d{4}-\d{2}-\d{2}/);
      if (match) {
        const dStr = match[0];
        const parts = dStr.split('-').map(Number);
        let label = dStr;
        if (parts.length === 3) {
          const dObj = new Date(parts[0], parts[1] - 1, parts[2]);
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
      setStep('schedule');
      setSubmissionError(null);
      setFormErrors({});

      fetchCalendarBlackouts().then(dates => {
        setBlackouts(dates);

        if (distinctCartDateGroups.length > 0) {
          const initialMap: Record<string, string> = {};
          distinctCartDateGroups.forEach(g => {
            let validSlot = '12:30 PM';
            if (!isTimeSlotValidForDate(g.dateStr, validSlot, cart)) {
              for (const slot of TIME_SLOTS) {
                if (isTimeSlotValidForDate(g.dateStr, slot, cart)) {
                  validSlot = slot;
                  break;
                }
              }
            }
            initialMap[g.dateStr] = validSlot;
          });
          setPerDayTimes(initialMap);
          setFulfillmentDate(distinctCartDateGroups[0].dateStr);
          setFulfillmentTime(initialMap[distinctCartDateGroups[0].dateStr] || '12:30 PM');
        } else {
          // Check if cart contains tiffin items with a specific target YYYY-MM-DD date in ID
          const tiffinItemWithDate = cart.find(i => i.category === 'tiffin' && /\d{4}-\d{2}-\d{2}/.test(i.id));
          let preferredDate: string | undefined;
          if (tiffinItemWithDate) {
            const match = tiffinItemWithDate.id.match(/\d{4}-\d{2}-\d{2}/);
            if (match) preferredDate = match[0];
          }

          if (preferredDate && !dates.includes(preferredDate)) {
            setFulfillmentDate(preferredDate);
            for (const slot of TIME_SLOTS) {
              if (isTimeSlotValidForDate(preferredDate, slot, cart)) {
                setFulfillmentTime(slot);
                break;
              }
            }
          } else {
            // Compute guaranteed earliest valid date & time slot satisfying Central Time cutoff
            const firstValid = findFirstValidFulfillmentSlot(dates, cart);
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

    // If currently chosen time is invalid on this date, auto-select first valid slot on this date
    if (!isTimeSlotValidForDate(newDateStr, fulfillmentTime, cart)) {
      for (const slot of TIME_SLOTS) {
        if (isTimeSlotValidForDate(newDateStr, slot, cart)) {
          setFulfillmentTime(slot);
          break;
        }
      }
    }
  };

  const hasTiffin = cart.some(item => item.category === 'tiffin');

  // Enforce pickup if cart has tiffin items (hook called unconditionally at top level)
  useEffect(() => {
    if (hasTiffin && isDelivery) {
      setIsDelivery(false);
    }
  }, [hasTiffin, isDelivery, setIsDelivery]);

  // Lead time calculations
  const noticeHours = getRequiredNoticeHours(cart);
  const cutoffValidation = validateFulfillmentCutoff(fulfillmentDate, fulfillmentTime, blackouts, cart);
  const upcomingDateOptions = getUpcomingDates(21);

  // Cost & Tax Bifurcation calculations
  // 1. Tiffin Items (Prices are tax-INCLUSIVE @ 8.25% Texas sales tax)
  const tiffinTotal = cart
    .filter(item => item.category === 'tiffin' || (item.menuItemId && item.menuItemId.includes('tiffin')))
    .reduce((sum, item) => sum + item.totalPrice, 0);
  const tiffinBase = Math.round((tiffinTotal / 1.0825) * 100) / 100;
  const tiffinTax = Math.round((tiffinTotal - tiffinBase) * 100) / 100;

  // 2. Cake Items (Tax Exempt @ 0%)
  const cakeSubtotal = cart
    .filter(item => item.category === 'cakes')
    .reduce((sum, item) => sum + item.totalPrice, 0);

  // 3. Catering Food Items (Tax EXCLUSIVE @ 8.25%)
  const cateringSubtotal = cart
    .filter(item => item.category !== 'cakes' && item.category !== 'tiffin' && (!item.menuItemId || !item.menuItemId.includes('tiffin')))
    .reduce((sum, item) => sum + item.totalPrice, 0);

  const deliveryFee = isDelivery ? 50.00 : 0.00;
  const cateringTaxable = cateringSubtotal + (cateringSubtotal > 0 && isDelivery ? deliveryFee : 0);
  const cateringTax = Math.round(cateringTaxable * 0.0825 * 100) / 100;

  const taxAmount = Math.round((tiffinTax + cateringTax) * 100) / 100;
  const foodSubtotal = Math.round((tiffinBase + cateringSubtotal + cakeSubtotal) * 100) / 100;

  const preCardTotal = Math.round((foodSubtotal + deliveryFee + taxAmount) * 100) / 100;

  // Credit Card 3.5% Processing Fee
  const processingFee = paymentMethod === 'credit_card'
    ? Math.round(preCardTotal * 0.035 * 100) / 100
    : 0.00;

  const totalAmount = Math.round((preCardTotal + processingFee) * 100) / 100;

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

  // Step 1 -> Step 2 Validation
  const handleProceedToDetails = () => {
    if (!cutoffValidation.isValid) {
      // Auto-correct to earliest valid slot if somehow invalid
      const firstValid = findFirstValidFulfillmentSlot(blackouts, cart);
      setFulfillmentDate(firstValid.dateStr);
      setFulfillmentTime(firstValid.timeSlot);
      setSubmissionError(`Adjusted to earliest available window: ${firstValid.dateStr} at ${firstValid.timeSlot}. Click "Continue to Customer Details" to proceed.`);
      modalBodyRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    setSubmissionError(null);
    setStep('details');
    setTimeout(() => {
      modalBodyRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    }, 50);
  };

  // Step 2 -> Step 3 Validation
  const handleProceedToPayment = () => {
    const errors: Record<string, string> = {};

    if (!customerName.trim()) {
      errors.customerName = 'Full name is required.';
    }

    const cleanPhone = phoneNumber.replace(/\D/g, '');
    if (cleanPhone.length < 7) {
      errors.phoneNumber = 'Valid contact number is required.';
    }

    if (email.trim() && (!email.includes('@') || !email.includes('.'))) {
      errors.email = 'Please enter a valid email format if provided.';
    }

    if (isDelivery) {
      if (!deliveryStreet.trim()) {
        errors.deliveryStreet = 'Delivery street address is required.';
      }
      if (!deliveryZip.trim() || !/^\d{5}$/.test(deliveryZip.trim())) {
        errors.deliveryZip = 'Valid 5-digit ZIP code is required.';
      }
    }

    setFormErrors(errors);

    if (Object.keys(errors).length > 0) {
      setSubmissionError('Please complete all required fields: ' + Object.values(errors).join(' • '));
      modalBodyRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setSubmissionError(null);
    setStep('payment');
    setTimeout(() => {
      modalBodyRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    }, 50);
  };

  // Final Order Submission
  const handleSubmit = async (orderType: OrderType) => {
    setIsSubmitting(true);
    setSubmissionError(null);
    try {
      const fullDeliveryAddress = isDelivery
        ? `${deliveryStreet.trim()}${deliveryApt.trim() ? `, Apt/Ste ${deliveryApt.trim()}` : ''}, ${deliveryCity.trim()}, TX ${deliveryZip.trim()}`
        : null;

      let effectiveFulfillmentDate = fulfillmentDate;
      let effectiveFulfillmentTime = fulfillmentTime;

      if (distinctCartDateGroups.length > 0) {
        effectiveFulfillmentDate = distinctCartDateGroups[0].dateStr;
      }

      if (distinctCartDateGroups.length > 1) {
        if (!sameTimeForAllDays) {
          effectiveFulfillmentTime = distinctCartDateGroups
            .map(g => `${g.displayLabel.split(',')[0]}: ${perDayTimes[g.dateStr] || fulfillmentTime}`)
            .join(' | ');
        } else {
          effectiveFulfillmentTime = `${fulfillmentTime} (All ${distinctCartDateGroups.length} Days)`;
        }
      }

      const multiDayBreakdown = distinctCartDateGroups.length > 1
        ? `[MULTI-DAY SCHEDULE] ${distinctCartDateGroups.map(g => `${g.displayLabel}: ${sameTimeForAllDays ? fulfillmentTime : (perDayTimes[g.dateStr] || fulfillmentTime)}`).join(' • ')}`
        : '';

      const fullDietaryNotes = [
        isSatvikRequested ? 'SATVIK / JAIN-FRIENDLY REQUESTED (No Onion, No Garlic)' : '',
        multiDayBreakdown,
        dietaryNotes.trim()
      ].filter(Boolean).join(' | ');

      const formattedContactNumber = `${countryCode} ${phoneNumber.trim()}`.trim();

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
        status: (orderType === 'estimate' ? 'new' : 'new') as any,
        items: cart
      };

      const result = await createOrder(payload);
      if (result.data) {
        // Automatically attempt sending notification to Desi Dabba via WhatsApp or SMS
        try {
          const waUrl = buildOrderWhatsAppUrl(result.data);
          window.open(waUrl, '_blank');
        } catch (e) {
          console.warn('Auto notification popup prevented by browser', e);
        }
        onOrderSuccess(result.data, orderType === 'estimate');
        onClose();
      } else {
        throw new Error(result.error?.message || 'Failed to record catering submission');
      }
    } catch (err: any) {
      setSubmissionError(err?.message || 'An error occurred while saving your catering submission.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto animate-fade-in font-sans">
      <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden my-6 max-h-[92vh] flex flex-col">
        
        {/* ── Modal Header with Stepper ── */}
        <div className="bg-[#00346f] text-white p-4 sm:p-5 shrink-0">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#ffdea5] block">
                BLUEBONNET WHISK • DESI DABBA CATERING
              </span>
              <h2 className="font-serif text-lg sm:text-xl font-bold">
                {step === 'schedule' && 'Step 1: Fulfillment & Schedule'}
                {step === 'details' && 'Step 2: Customer Details & Address'}
                {step === 'payment' && 'Step 3: Payment & Confirm Order'}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Stepper Navigation Progress Bar */}
          <div className="grid grid-cols-3 gap-2 pt-3">
            {/* Step 1 */}
            <button
              type="button"
              onClick={() => setStep('schedule')}
              className={`min-h-[44px] min-w-[44px] flex items-center justify-center sm:justify-start gap-2 py-1.5 px-2.5 rounded-xl text-left transition-all cursor-pointer ${
                step === 'schedule'
                  ? 'bg-white/20 text-[#ffdea5] font-bold'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                step === 'schedule' ? 'bg-[#ffdea5] text-[#00346f]' : 'bg-white/20 text-white'
              }`}>
                1
              </div>
              <span className="text-xs truncate hidden sm:inline">Schedule</span>
            </button>

            {/* Step 2 */}
            <button
              type="button"
              onClick={() => {
                if (cutoffValidation.isValid) setStep('details');
              }}
              className={`min-h-[44px] min-w-[44px] flex items-center justify-center sm:justify-start gap-2 py-1.5 px-2.5 rounded-xl text-left transition-all ${
                step === 'details'
                  ? 'bg-white/20 text-[#ffdea5] font-bold'
                  : cutoffValidation.isValid
                  ? 'text-white/60 hover:text-white cursor-pointer'
                  : 'text-white/30 cursor-not-allowed'
              }`}
            >
              <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                step === 'details' ? 'bg-[#ffdea5] text-[#00346f]' : 'bg-white/20 text-white'
              }`}>
                2
              </div>
              <span className="text-xs truncate hidden sm:inline">Customer Details</span>
            </button>

            {/* Step 3 */}
            <button
              type="button"
              onClick={() => {
                if (customerName.trim() && phoneNumber.length >= 10) {
                  setStep('payment');
                }
              }}
              className={`min-h-[44px] min-w-[44px] flex items-center justify-center sm:justify-start gap-2 py-1.5 px-2.5 rounded-xl text-left transition-all ${
                step === 'payment'
                  ? 'bg-white/20 text-[#ffdea5] font-bold'
                  : customerName.trim()
                  ? 'text-white/60 hover:text-white cursor-pointer'
                  : 'text-white/30 cursor-not-allowed'
              }`}
            >
              <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                step === 'payment' ? 'bg-[#ffdea5] text-[#00346f]' : 'bg-white/20 text-white'
              }`}>
                3
              </div>
              <span className="text-xs truncate hidden sm:inline">Payment &amp; Submit</span>
            </button>
          </div>
        </div>

        {/* ── Modal Scrollable Body ── */}
        <div ref={modalBodyRef} className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1">
          
          {submissionError && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{submissionError}</span>
            </div>
          )}

          {/* ═════════════════════════════════════════════════════════════════════ */}
          {/* ── STEP 1: FULFILLMENT & SCHEDULE ── */}
          {/* ═════════════════════════════════════════════════════════════════════ */}
          {step === 'schedule' && (
            <div className="space-y-5">
              
              {/* Items Summary Pill */}
              <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-xl flex items-center justify-between text-xs">
                <span className="text-[#00346f] font-semibold">
                  Selected Items ({cart.length} item kinds):
                </span>
                <span className="font-bold text-[#00346f] font-serif text-sm">
                  Subtotal: ${foodSubtotal.toFixed(2)}
                </span>
              </div>

              {/* 1. Fulfillment Method (Pickup vs Delivery) */}
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700">
                  Choose Fulfillment Method
                </label>

                {hasTiffin ? (
                  <div className="p-3.5 bg-amber-50/90 rounded-xl border border-amber-200 text-xs space-y-1">
                    <div className="flex items-center gap-2 text-amber-900 font-bold">
                      <Store className="w-5 h-5 text-amber-700 shrink-0" />
                      <span>Self-Pickup Only (Home Kitchen - Deerwood Dr, Little Elm) ($0.00)</span>
                    </div>
                    <p className="text-[11px] text-amber-800">
                      Your order contains daily homestyle tiffin meals, which are prepared fresh for direct pickup. Delivery is not available for tiffins.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setIsDelivery(false)}
                      className={`p-3.5 rounded-xl border flex items-center gap-3 transition-all cursor-pointer ${
                        !isDelivery
                          ? 'border-[#00346f] bg-blue-50/60 text-[#00346f] ring-2 ring-[#00346f]/20 font-bold shadow-xs'
                          : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <Store className="w-5 h-5 shrink-0" />
                      <div className="text-left">
                        <div className="text-xs font-bold">Self-Pickup</div>
                        <div className="text-[11px] text-gray-500 font-normal">Little Elm ($0.00)</div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setIsDelivery(true)}
                      className={`p-3.5 rounded-xl border flex items-center gap-3 transition-all cursor-pointer ${
                        isDelivery
                          ? 'border-[#00346f] bg-blue-50/60 text-[#00346f] ring-2 ring-[#00346f]/20 font-bold shadow-xs'
                          : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <Truck className="w-5 h-5 shrink-0" />
                      <div className="text-left">
                        <div className="text-xs font-bold">Venue Delivery</div>
                        <div className="text-[11px] text-[#775a19] font-bold">+$50 Flat Fee</div>
                      </div>
                    </button>
                  </div>
                )}

                {!hasTiffin && isDelivery && (
                  <p className="text-xs text-amber-800 bg-amber-50 p-2.5 rounded-xl border border-amber-200 leading-snug">
                    📍 <em>Delivery available based on location throughout Frisco, Plano, McKinney, Allen, Prosper, Little Elm &amp; greater DFW.</em>
                  </p>
                )}
              </div>

              {/* 2. Date & Time Engine */}
              <div className="bg-gray-50 rounded-2xl p-4 sm:p-5 border border-gray-200 space-y-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-serif font-bold text-sm sm:text-base text-[#00346f] flex items-center gap-2">
                      <CalendarIcon className="w-4 h-4 text-[#775a19]" />
                      <span>Select Fulfillment Date &amp; Time (US Central Time)</span>
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Strict cutoff rules enforced in US Central Time (`America/Chicago`).
                    </p>
                  </div>

                  <div className="bg-[#00346f]/10 text-[#00346f] px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase shrink-0">
                    {noticeHours}h Notice Required
                  </div>
                </div>

                {/* Cutoff Status Badge */}
                <div className={`p-3 rounded-xl border text-xs flex items-start gap-2.5 ${
                  cutoffValidation.isValid
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                    : 'bg-amber-50 border-amber-200 text-amber-900'
                }`}>
                  {cutoffValidation.isValid ? (
                    <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  )}
                  <div className="leading-snug">
                    <span className="font-bold">
                      {cutoffValidation.isValid ? 'Cutoff Validated' : 'Cutoff Deadline Notice'}:
                    </span>{' '}
                    {cutoffValidation.message}
                  </div>
                </div>

                {/* Quick Date Selector Horizontal Pills */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-600 mb-2">
                    Available Dates (Next 3 Weeks)
                  </label>
                  <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
                    {upcomingDateOptions.map(opt => {
                      const check = isDateSelectable(opt.dateStr, blackouts, cart);
                      const isSelected = fulfillmentDate === opt.dateStr;

                      return (
                        <button
                          key={opt.dateStr}
                          type="button"
                          disabled={!check.selectable}
                          onClick={() => handleSelectDate(opt.dateStr)}
                          className={`flex flex-col items-center justify-center min-w-[72px] min-h-[54px] py-2 px-2.5 rounded-xl border text-center transition-all cursor-pointer shrink-0 ${
                            !check.selectable
                              ? 'bg-gray-100 border-gray-200 text-gray-300 cursor-not-allowed opacity-60'
                              : isSelected
                              ? 'bg-[#00346f] text-white border-[#00346f] shadow-sm ring-2 ring-[#00346f]/20'
                              : 'bg-white hover:bg-gray-100 border-gray-200 text-gray-700'
                          }`}
                          title={!check.selectable ? check.reason : `Select ${opt.label}`}
                        >
                          <span className="text-[10px] uppercase font-bold tracking-wider">{opt.dayOfWeek}</span>
                          <span className="text-xs font-black mt-0.5">{opt.label}</span>
                          {!check.selectable && (
                            <span className="text-[8px] uppercase tracking-tighter text-rose-500 font-semibold mt-0.5">
                              Closed
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Custom Date Input Fallback & Time Selector */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Or Pick Specific Date
                    </label>
                    <input
                      type="date"
                      value={fulfillmentDate}
                      min={cutoffValidation.earliestAllowedDate}
                      onChange={(e) => handleSelectDate(e.target.value)}
                      className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2.5 min-h-[44px] text-base sm:text-xs text-gray-800 focus:outline-none focus:border-[#00346f]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      {distinctCartDateGroups.length > 1 ? 'Primary / Default Time Window' : 'Fulfillment Window'}
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
                      className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2.5 min-h-[44px] text-base sm:text-xs text-gray-800 focus:outline-none focus:border-[#00346f]"
                    >
                      {TIME_SLOTS.map(slot => {
                        const isSlotValid = isTimeSlotValidForDate(fulfillmentDate, slot, cart);
                        return (
                          <option key={slot} value={slot} disabled={!isSlotValid}>
                            {slot} {!isSlotValid ? '— Unavailable (cutoff)' : ''}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                </div>

                {/* Multi-Day Fulfillment Schedule Selector */}
                {distinctCartDateGroups.length > 1 && (
                  <div className="p-4 bg-blue-50/90 rounded-2xl border border-blue-200 space-y-3 pt-3 mt-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-blue-200/70 pb-2.5">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-[#775a19] block">
                          MULTI-DAY ORDER SCHEDULE ({distinctCartDateGroups.length} DATES)
                        </span>
                        <h4 className="font-serif font-bold text-sm text-[#00346f] flex items-center gap-1.5">
                          <CalendarIcon className="w-4 h-4 text-[#00346f]" />
                          <span>Pickup Time per Scheduled Date</span>
                        </h4>
                      </div>

                      <label className="inline-flex items-center gap-2 text-xs font-bold text-[#00346f] cursor-pointer bg-white px-3 py-1.5 rounded-xl border border-blue-200 shadow-2xs self-start sm:self-auto">
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
                          className="w-4 h-4 rounded text-[#00346f] focus:ring-[#00346f] cursor-pointer"
                        />
                        <span>Same time for all orders ({fulfillmentTime})</span>
                      </label>
                    </div>

                    {sameTimeForAllDays ? (
                      <div className="space-y-2">
                        <p className="text-xs text-gray-600">
                          All {distinctCartDateGroups.length} scheduled order days will use the pickup window <strong>{fulfillmentTime}</strong>. Uncheck the option above if you wish to select different pickup times for individual days.
                        </p>
                        <div className="flex flex-wrap items-center gap-2 pt-1">
                          {distinctCartDateGroups.map(g => (
                            <span key={g.dateStr} className="px-2.5 py-1 bg-white rounded-lg border border-gray-200 text-[11px] font-semibold text-gray-800 shadow-2xs">
                              {g.displayLabel}: <strong className="text-[#00346f]">{fulfillmentTime}</strong>
                            </span>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2.5 pt-1">
                        <p className="text-xs text-gray-600 font-medium">
                          Select the exact pickup time window for each scheduled day:
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {distinctCartDateGroups.map(g => {
                            const currentTime = perDayTimes[g.dateStr] || fulfillmentTime;
                            return (
                              <div key={g.dateStr} className="p-3 bg-white rounded-xl border border-gray-200 flex flex-col justify-between gap-2 shadow-2xs">
                                <div>
                                  <span className="font-bold text-xs text-[#00346f] block">{g.displayLabel}</span>
                                  <span className="text-[11px] text-gray-500 block truncate">
                                    {g.items.map(i => i.name).join(', ')}
                                  </span>
                                </div>
                                <div className="flex items-center justify-between pt-2 border-t border-gray-150">
                                  <span className="text-[11px] font-semibold text-gray-600">Pickup Time:</span>
                                  <select
                                    value={currentTime}
                                    onChange={(e) => {
                                      const newTime = e.target.value;
                                      setPerDayTimes(prev => ({ ...prev, [g.dateStr]: newTime }));
                                    }}
                                    className="px-2.5 py-1.5 bg-gray-50 border border-gray-300 rounded-lg text-xs font-bold text-[#00346f] focus:outline-none focus:border-[#00346f]"
                                  >
                                    {TIME_SLOTS.map(slot => {
                                      const isSlotValid = isTimeSlotValidForDate(g.dateStr, slot, cart);
                                      return (
                                        <option key={slot} value={slot} disabled={!isSlotValid}>
                                          {slot} {!isSlotValid ? '(cutoff)' : ''}
                                        </option>
                                      );
                                    })}
                                  </select>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}

              </div>

            </div>
          )}

          {/* ═════════════════════════════════════════════════════════════════════ */}
          {/* ── STEP 2: CUSTOMER DETAILS & ADDRESS ── */}
          {/* ═════════════════════════════════════════════════════════════════════ */}
          {step === 'details' && (
            <div className="space-y-5">
              
              <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl text-xs text-[#00346f] flex items-center justify-between">
                <span>
                  Fulfillment: <strong>{isDelivery ? 'Venue Delivery' : 'Self-Pickup'}</strong> on <strong>{fulfillmentDate} ({fulfillmentTime})</strong>
                </span>
                <button
                  type="button"
                  onClick={() => setStep('schedule')}
                  className="text-xs font-bold text-[#00346f] underline hover:text-[#775a19] cursor-pointer"
                >
                  Change Date
                </button>
              </div>

              {/* Contact Information (Name, Phone, Email) */}
              <div className="space-y-3">
                <h3 className="font-serif font-bold text-sm text-[#00346f] flex items-center gap-2">
                  <User className="w-4 h-4 text-[#775a19]" />
                  <span>Customer Contact Information</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Full Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Aditi Singhal"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className={`w-full px-3 py-2.5 min-h-[44px] text-base sm:text-xs bg-gray-50 border rounded-xl focus:outline-none focus:bg-white transition-all ${
                        formErrors.customerName ? 'border-rose-500' : 'border-gray-200 focus:border-[#00346f]'
                      }`}
                    />
                    {formErrors.customerName && (
                      <p className="text-[10px] text-rose-500 mt-0.5">{formErrors.customerName}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Contact Number <span className="text-rose-500">*</span>
                    </label>
                    <div className="flex items-center gap-1.5">
                      <select
                        value={countryCode}
                        onChange={(e) => setCountryCode(e.target.value)}
                        className="bg-gray-50 border border-gray-200 rounded-xl px-2.5 py-2.5 min-h-[44px] text-xs font-bold text-[#00346f] focus:outline-none focus:bg-white focus:border-[#00346f] transition-all shrink-0 cursor-pointer"
                        aria-label="Country Code"
                      >
                        <option value="+1">🇺🇸 +1 (US/CA)</option>
                        <option value="+91">🇮🇳 +91 (India)</option>
                        <option value="+44">🇬🇧 +44 (UK)</option>
                        <option value="+61">🇦🇺 +61 (Australia)</option>
                        <option value="+971">🇦🇪 +971 (UAE)</option>
                        <option value="+65">🇸🇬 +65 (Singapore)</option>
                        <option value="+49">🇩🇪 +49 (Germany)</option>
                        <option value="+33">🇫🇷 +33 (France)</option>
                        <option value="+81">🇯🇵 +81 (Japan)</option>
                      </select>
                      <input
                        type="tel"
                        placeholder="(945) 527-4566"
                        value={phoneNumber}
                        onChange={(e) => handlePhoneChange(e.target.value)}
                        className={`w-full px-3 py-2.5 min-h-[44px] text-base sm:text-xs bg-gray-50 border rounded-xl focus:outline-none focus:bg-white transition-all ${
                          formErrors.phoneNumber ? 'border-rose-500' : 'border-gray-200 focus:border-[#00346f]'
                        }`}
                      />
                    </div>
                    {formErrors.phoneNumber && (
                      <p className="text-[10px] text-rose-500 mt-0.5">{formErrors.phoneNumber}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Email Address <span className="text-gray-400 font-normal">(Optional)</span>
                  </label>
                  <input
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`w-full px-3 py-2.5 min-h-[44px] text-base sm:text-xs bg-gray-50 border rounded-xl focus:outline-none focus:bg-white transition-all ${
                      formErrors.email ? 'border-rose-500' : 'border-gray-200 focus:border-[#00346f]'
                    }`}
                  />
                  {formErrors.email && (
                    <p className="text-[10px] text-rose-500 mt-0.5">{formErrors.email}</p>
                  )}
                </div>
              </div>

              {/* ── Interactive Suggestion-Based Delivery Address Box (Only if Delivery) ── */}
              {isDelivery ? (
                <div className="bg-gray-50 p-4 sm:p-5 rounded-2xl border border-gray-200 space-y-3">
                  <div className="flex items-center gap-2">
                    <Truck className="w-4 h-4 text-[#775a19]" />
                    <h4 className="font-serif font-bold text-sm text-[#00346f]">
                      Venue Delivery Address
                    </h4>
                  </div>
                  
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

                  {formErrors.deliveryStreet && (
                    <p className="text-[10px] text-rose-500 mt-1 font-semibold">{formErrors.deliveryStreet}</p>
                  )}
                  {formErrors.deliveryZip && (
                    <p className="text-[10px] text-rose-500 mt-0.5 font-semibold">{formErrors.deliveryZip}</p>
                  )}
                </div>
              ) : (
                <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-200 text-xs text-gray-600 flex items-center gap-3">
                  <Store className="w-5 h-5 text-gray-500 shrink-0" />
                  <div>
                    <span className="font-bold text-gray-900 block">Self-Pickup Location:</span>
                    <span>Home Kitchen - Deerwood Dr, Little Elm, TX 75068</span>
                  </div>
                </div>
              )}

              {/* Dietary & Satvik Preferences */}
              <div className="pt-1">
                <label className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-50/70 border border-amber-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isSatvikRequested}
                    onChange={(e) => setIsSatvikRequested(e.target.checked)}
                    className="mt-0.5 rounded border-amber-300 text-[#775a19] focus:ring-[#775a19]"
                  />
                  <div className="text-xs text-amber-950">
                    <span className="font-bold">Request Satvik / No Onion–No Garlic / Jain-Friendly</span>
                    <p className="text-[11px] text-amber-800 mt-0.5">
                      Our chef will prepare eligible dishes without onion or garlic using pure sattvic ingredients.
                    </p>
                  </div>
                </label>
              </div>

              {/* Special instructions */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Special Instructions / Gate Codes / Dietary Notes
                </label>
                <textarea
                  rows={2}
                  placeholder="Mention gate codes, spice preferences, or any specific allergen precautions..."
                  value={dietaryNotes}
                  onChange={(e) => setDietaryNotes(e.target.value)}
                  className="w-full px-3 py-2.5 min-h-[56px] text-base sm:text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:bg-white focus:border-[#00346f]"
                />
              </div>

            </div>
          )}

          {/* ═════════════════════════════════════════════════════════════════════ */}
          {/* ── STEP 3: PAYMENT & CONFIRM ORDER ── */}
          {/* ═════════════════════════════════════════════════════════════════════ */}
          {step === 'payment' && (
            <div className="space-y-5">
              
              {/* Review recap card */}
              <div className="p-3.5 bg-gray-50 border border-gray-200 rounded-xl space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-500">Recipient:</span>
                  <strong className="text-gray-900">{customerName} • {countryCode} {phoneNumber}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Fulfillment:</span>
                  <span className="font-semibold text-[#00346f]">
                    {isDelivery ? `Delivery to ${deliveryStreet}, ${deliveryCity}` : 'Self-Pickup (Little Elm)'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Date &amp; Time:</span>
                  <span className="font-semibold text-gray-900">{fulfillmentDate} at {fulfillmentTime}</span>
                </div>
              </div>

              {/* Method of Payment */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-serif font-bold text-sm text-[#00346f]">
                    Select Settlement Method <span className="text-rose-500">*</span>
                  </h3>
                  <span className="text-[11px] text-gray-500 hidden sm:inline">
                    Choose how you would like to pay
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {/* Zelle */}
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('zelle')}
                    className={`p-3.5 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                      paymentMethod === 'zelle'
                        ? 'border-[#00346f] bg-blue-50/70 text-[#00346f] ring-2 ring-[#00346f]/20 shadow-xs'
                        : 'border-gray-200 hover:border-gray-300 bg-white text-gray-700'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <QrCode className="w-5 h-5 text-purple-600" />
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full">
                        0% Fee
                      </span>
                    </div>
                    <div className="mt-2.5">
                      <div className="text-xs font-bold text-gray-900">Zelle Transfer</div>
                      <div className="text-[11px] text-gray-500 mt-0.5">Bank transfer to 945-527-4566</div>
                    </div>
                  </button>

                  {/* Cash */}
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('cash')}
                    className={`p-3.5 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                      paymentMethod === 'cash'
                        ? 'border-[#00346f] bg-blue-50/70 text-[#00346f] ring-2 ring-[#00346f]/20 shadow-xs'
                        : 'border-gray-200 hover:border-gray-300 bg-white text-gray-700'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <Banknote className="w-5 h-5 text-emerald-600" />
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                        0% Fee
                      </span>
                    </div>
                    <div className="mt-2.5">
                      <div className="text-xs font-bold text-gray-900">Cash Payment</div>
                      <div className="text-[11px] text-gray-500 mt-0.5">Pay upon delivery / pickup</div>
                    </div>
                  </button>

                  {/* Credit Card */}
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('credit_card')}
                    className={`p-3.5 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                      paymentMethod === 'credit_card'
                        ? 'border-[#00346f] bg-blue-50/70 text-[#00346f] ring-2 ring-[#00346f]/20 shadow-xs'
                        : 'border-gray-200 hover:border-gray-300 bg-white text-gray-700'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <CreditCard className="w-5 h-5 text-blue-600" />
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-200 px-2 py-0.5 rounded-full">
                        +3.5% Fee
                      </span>
                    </div>
                    <div className="mt-2.5">
                      <div className="text-xs font-bold text-gray-900">Credit / Debit Card</div>
                      <div className="text-[11px] text-gray-500 mt-0.5">Visa, Mastercard, Amex (+3.5%)</div>
                    </div>
                  </button>
                </div>

                {paymentMethod === 'zelle' && (
                  <div className="p-3 bg-purple-50/70 border border-purple-200 rounded-xl text-xs text-purple-900 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <span>Zelle Phone: <strong>945-527-4566</strong> (Bluebonnet Whisk)</span>
                    <span className="text-[11px] font-semibold text-purple-700">Zero additional fees</span>
                  </div>
                )}

                {paymentMethod === 'credit_card' && (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <span>Card Processing Surcharge (3.5%): <strong>+${processingFee.toFixed(2)}</strong></span>
                    <span className="text-[11px] text-amber-700">Calculated on subtotal, delivery, and tax</span>
                  </div>
                )}
              </div>

              {/* Order Summary & Financial Breakdown */}
              <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200 space-y-2 text-xs">
                <div className="flex justify-between text-gray-600">
                  <span>Food Subtotal ({cart.length} item kinds):</span>
                  <span className="font-bold text-gray-900">${foodSubtotal.toFixed(2)}</span>
                </div>
                {(cakeSubtotal > 0 || tiffinTotal > 0) && (
                  <div className="pl-2 space-y-0.5 text-[11px] text-gray-500 border-l-2 border-gray-200">
                    {cateringSubtotal > 0 && (
                      <div className="flex justify-between">
                        <span>• Catering Food (Taxable)</span>
                        <span>${cateringSubtotal.toFixed(2)}</span>
                      </div>
                    )}
                    {tiffinTotal > 0 && (
                      <div className="flex justify-between text-blue-700">
                        <span>• Tiffin Meals (Base Food, Tax-Inc.)</span>
                        <span>${tiffinBase.toFixed(2)}</span>
                      </div>
                    )}
                    {cakeSubtotal > 0 && (
                      <div className="flex justify-between text-emerald-700">
                        <span>• Cakes (0% Tax-Exempt)</span>
                        <span>${cakeSubtotal.toFixed(2)}</span>
                      </div>
                    )}
                  </div>
                )}
                <div className="flex justify-between text-gray-600">
                  <span>{isDelivery ? 'Delivery Fee (DFW Flat Fee)' : 'Self-Pickup (Home Kitchen, Little Elm)'}</span>
                  <span className="font-bold text-gray-900">${deliveryFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <div>
                    <span>Texas Sales Tax (8.25%):</span>
                    {tiffinTotal > 0 && (
                      <span className="text-[10px] text-blue-700 block">Includes ${tiffinTax.toFixed(2)} bifurcated from Tiffin price</span>
                    )}
                    {cakeSubtotal > 0 && (
                      <span className="text-[10px] text-emerald-700 block">Bakery products: 0% tax</span>
                    )}
                  </div>
                  <span className="font-bold text-gray-900">${taxAmount.toFixed(2)}</span>
                </div>
                {paymentMethod === 'credit_card' && (
                  <div className="flex justify-between text-amber-800 font-bold">
                    <span>Card Processing Fee (3.5%):</span>
                    <span>+${processingFee.toFixed(2)}</span>
                  </div>
                )}
                <div className="pt-2 border-t border-gray-200 flex justify-between items-baseline font-bold text-sm sm:text-base text-[#00346f]">
                  <span>Grand Total:</span>
                  <span className="font-serif text-xl sm:text-2xl">${totalAmount.toFixed(2)}</span>
                </div>
              </div>

            </div>
          )}

        </div>

        {/* ── Modal Footer with Step-Specific Actions ── */}
        <div className="p-4 sm:p-5 bg-gray-100 border-t border-gray-200 shrink-0">
          
          {/* Step 1 Actions */}
          {step === 'schedule' && (
            <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-2.5 sm:gap-3">
              <button
                type="button"
                onClick={onClose}
                className="min-h-[44px] px-5 py-2.5 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-200 text-xs font-semibold cursor-pointer inline-flex items-center justify-center"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleProceedToDetails}
                className="min-h-[44px] inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-[#00346f] hover:bg-[#00224d] text-white text-xs font-bold uppercase tracking-wider transition-all shadow-md cursor-pointer hover:scale-101"
              >
                <span>Continue to Customer Details</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Step 2 Actions */}
          {step === 'details' && (
            <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-2.5 sm:gap-3">
              <button
                type="button"
                onClick={() => setStep('schedule')}
                className="min-h-[44px] inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-200 text-xs font-semibold cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Schedule</span>
              </button>

              <button
                type="button"
                onClick={handleProceedToPayment}
                className="min-h-[44px] inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-[#00346f] hover:bg-[#00224d] text-white text-xs font-bold uppercase tracking-wider transition-all shadow-md cursor-pointer hover:scale-101"
              >
                <span>Continue to Payment &amp; Review</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Step 3 Actions */}
          {step === 'payment' && (
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 sm:gap-3">
              <button
                type="button"
                onClick={() => setStep('details')}
                className="min-h-[44px] inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-200 text-xs font-semibold cursor-pointer w-full sm:w-auto"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Details</span>
              </button>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => handleSubmit('estimate')}
                  className="min-h-[44px] flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border border-[#00346f] text-[#00346f] hover:bg-[#00346f]/10 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Save Estimate</span>
                </button>

                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => handleSubmit('order')}
                  className="min-h-[44px] flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#00346f] hover:bg-[#00224d] text-white text-xs font-bold uppercase tracking-wider transition-all shadow-md cursor-pointer hover:scale-101"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSubmitting ? 'Submitting...' : 'Submit Order'}</span>
                </button>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
