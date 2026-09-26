import { useState, useEffect, useRef } from 'react';
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
  QrCode
} from 'lucide-react';
import type { CartItem, CateringOrder, OrderType, PaymentMethod } from '../../types/catering';
import { 
  getRequiredNoticeHours, 
  validateFulfillmentCutoff,
  getUpcomingDates,
  isDateSelectable
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

const TIME_SLOTS = [
  '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
  '12:00 PM', '12:30 PM', '1:00 PM', '1:30 PM',
  '2:00 PM', '2:30 PM', '3:00 PM', '3:30 PM',
  '4:00 PM', '4:30 PM', '5:00 PM', '5:30 PM',
  '6:00 PM', '6:30 PM', '7:00 PM', '7:30 PM', '8:00 PM'
];

export default function CheckoutModal({
  isOpen,
  onClose,
  cart,
  isDelivery,
  setIsDelivery,
  onOrderSuccess
}: CheckoutModalProps) {
  const modalBodyRef = useRef<HTMLDivElement>(null);

  // Customer Form state
  const [customerName, setCustomerName] = useState('');
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
  
  // Validation & Submission
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);

  // Fetch blackouts on open
  useEffect(() => {
    if (isOpen) {
      fetchCalendarBlackouts().then(dates => {
        setBlackouts(dates);

        // Find earliest valid date & time slot satisfying notice cutoff in Central Time
        const check = validateFulfillmentCutoff('', '', dates, cart);
        let safeDate = check.earliestAllowedDate;
        let safeTimeSlot = '12:30 PM';

        // Check if safeDate is selectable and not blacked out; step forward if needed
        const d = new Date(safeDate + 'T12:00:00');
        for (let offset = 0; offset < 30; offset++) {
          const candidate = new Date(d.getTime() + offset * 24 * 60 * 60 * 1000);
          const y = candidate.getFullYear();
          const m = (candidate.getMonth() + 1).toString().padStart(2, '0');
          const day = candidate.getDate().toString().padStart(2, '0');
          const dateStr = `${y}-${m}-${day}`;
          if (isDateSelectable(dateStr, dates, cart).selectable) {
            safeDate = dateStr;
            break;
          }
        }

        // Find earliest valid time slot for safeDate
        for (const slot of TIME_SLOTS) {
          const testCheck = validateFulfillmentCutoff(safeDate, slot, dates, cart);
          if (testCheck.isValid) {
            safeTimeSlot = slot;
            break;
          }
        }

        setFulfillmentDate(safeDate);
        setFulfillmentTime(safeTimeSlot);
      });
    }
  }, [isOpen, cart]);

  if (!isOpen) return null;

  // Lead time calculations
  const noticeHours = getRequiredNoticeHours(cart);
  const cutoffValidation = validateFulfillmentCutoff(fulfillmentDate, fulfillmentTime, blackouts, cart);
  const upcomingDateOptions = getUpcomingDates(21);

  // Cost calculations
  const foodSubtotal = cart.reduce((sum, item) => sum + item.totalPrice, 0);
  const cakeSubtotal = cart.filter(item => item.category === 'cakes').reduce((sum, item) => sum + item.totalPrice, 0);
  const nonCakeSubtotal = cart.filter(item => item.category !== 'cakes').reduce((sum, item) => sum + item.totalPrice, 0);
  const hasTiffin = cart.some(item => item.category === 'tiffin');

  // Enforce pickup if cart has tiffin items
  useEffect(() => {
    if (hasTiffin && isDelivery) {
      setIsDelivery(false);
    }
  }, [hasTiffin, isDelivery, setIsDelivery]);

  const deliveryFee = isDelivery ? 50.00 : 0.00;

  // Texas Sales Tax: Bakery products (cakes) are 0% exempt. Catering food + delivery are subject to 8.25%
  const taxableAmount = nonCakeSubtotal + (nonCakeSubtotal > 0 && isDelivery ? deliveryFee : 0);
  const taxAmount = Math.round(taxableAmount * 0.0825 * 100) / 100;

  // Credit Card 3.5% Processing Fee
  const processingFee = paymentMethod === 'credit_card'
    ? Math.round((foodSubtotal + deliveryFee + taxAmount) * 0.035 * 100) / 100
    : 0.00;

  const totalAmount = Math.round((foodSubtotal + deliveryFee + taxAmount + processingFee) * 100) / 100;

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

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!customerName.trim()) {
      errors.customerName = 'Full name is required.';
    }

    const cleanPhone = phoneNumber.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      errors.phoneNumber = 'Valid 10-digit US phone number is required.';
    }

    if (!email.trim() || !email.includes('@') || !email.includes('.')) {
      errors.email = 'Valid email address is required.';
    }

    if (isDelivery) {
      if (!deliveryStreet.trim()) errors.deliveryStreet = 'Street address is required.';
      if (!deliveryZip.trim()) errors.deliveryZip = 'ZIP code is required.';
    }

    if (!cutoffValidation.isValid) {
      errors.fulfillment = cutoffValidation.message;
    }

    setFormErrors(errors);

    if (Object.keys(errors).length > 0) {
      setSubmissionError('Please complete all required fields: ' + Object.values(errors).join(' • '));
      modalBodyRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
      return false;
    }

    setSubmissionError(null);
    return true;
  };

  const handleSubmit = async (orderType: OrderType) => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    setSubmissionError(null);
    try {
      const fullDeliveryAddress = isDelivery
        ? `${deliveryStreet.trim()}${deliveryApt.trim() ? `, Apt/Ste ${deliveryApt.trim()}` : ''}, ${deliveryCity.trim()}, TX ${deliveryZip.trim()}`
        : null;

      const fullDietaryNotes = [
        isSatvikRequested ? 'SATVIK / JAIN-FRIENDLY REQUESTED (No Onion, No Garlic)' : '',
        dietaryNotes.trim()
      ].filter(Boolean).join(' | ');

      const payload = {
        customer_name: customerName.trim(),
        phone_number: phoneNumber.trim(),
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
        fulfillment_date: fulfillmentDate,
        fulfillment_time: fulfillmentTime,
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto animate-fade-in font-sans">
      <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden my-8 max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="bg-[#00346f] text-white p-5 flex items-center justify-between shrink-0">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#ffdea5] block">
              DESI DABBA CATERING
            </span>
            <h2 className="font-serif text-xl sm:text-2xl font-bold">
              Review &amp; Schedule Fulfillment
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div ref={modalBodyRef} className="p-6 overflow-y-auto space-y-6">
          
          {submissionError && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{submissionError}</span>
            </div>
          )}

          {/* ── 1. DYNAMIC CALENDAR & CUTOFF VALIDATION ENGINE ── */}
          <div className="bg-gray-50 rounded-2xl p-4 sm:p-5 border border-gray-200 space-y-4">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-serif font-bold text-sm sm:text-base text-[#00346f] flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4 text-[#775a19]" />
                  <span>Select Fulfillment Date &amp; Time (US Central Time)</span>
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Cutoffs are evaluated strictly in Frisco, TX timezone (`America/Chicago`).
                </p>
              </div>

              <div className="bg-[#00346f]/10 text-[#00346f] px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase shrink-0">
                {noticeHours}h Advance Notice Required
              </div>
            </div>

            {/* Inline Cutoff Status Badge */}
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
                  {cutoffValidation.isValid ? 'Cutoff Validated' : 'Cutoff Deadline Alert'}:
                </span>{' '}
                {cutoffValidation.message}
              </div>
            </div>

            {/* Quick Date Selector Horizontal Pills */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-600 mb-2">
                Available Catering Dates (Next 3 Weeks)
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
                      onClick={() => setFulfillmentDate(opt.dateStr)}
                      className={`flex flex-col items-center justify-center min-w-[70px] py-2 px-2 rounded-xl border text-center transition-all cursor-pointer shrink-0 ${
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
                  onChange={(e) => setFulfillmentDate(e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2 text-xs text-gray-800 focus:outline-none focus:border-[#00346f]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Fulfillment Window
                </label>
                <select
                  value={fulfillmentTime}
                  onChange={(e) => setFulfillmentTime(e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2 text-xs text-gray-800 focus:outline-none focus:border-[#00346f]"
                >
                  {TIME_SLOTS.map(slot => (
                    <option key={slot} value={slot}>{slot}</option>
                  ))}
                </select>
              </div>
            </div>

            {formErrors.fulfillment && (
              <p className="text-xs text-rose-600 font-semibold">{formErrors.fulfillment}</p>
            )}
          </div>

          {/* ── 2. FULFILLMENT METHOD (PICKUP VS DELIVERY) ── */}
          <div className="space-y-3">
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700">
              Fulfillment Method
            </label>

            {hasTiffin ? (
              <div className="p-3.5 bg-amber-50/90 rounded-xl border border-amber-200 text-xs space-y-1">
                <div className="flex items-center gap-2 text-amber-900 font-bold">
                  <Store className="w-5 h-5 text-amber-700 shrink-0" />
                  <span>Self-Pickup Only (Home Kitchen - Deerwood Dr, Little Elm) ($0.00)</span>
                </div>
                <p className="text-[11px] text-amber-800">
                  Your cart contains homestyle tiffin meals, which are handcrafted fresh for self-pickup only. Delivery is not available for tiffins.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setIsDelivery(false)}
                  className={`p-3 rounded-xl border flex items-center gap-3 transition-all cursor-pointer ${
                    !isDelivery
                      ? 'border-[#00346f] bg-blue-50/50 text-[#00346f] ring-1 ring-[#00346f]'
                      : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Store className="w-5 h-5" />
                  <div className="text-left">
                    <div className="text-xs font-bold">Self-Pickup</div>
                    <div className="text-[11px] text-gray-500">Home Kitchen - Deerwood Dr, Little Elm ($0.00)</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setIsDelivery(true)}
                  className={`p-3 rounded-xl border flex items-center gap-3 transition-all cursor-pointer ${
                    isDelivery
                      ? 'border-[#00346f] bg-blue-50/50 text-[#00346f] ring-1 ring-[#00346f]'
                      : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Truck className="w-5 h-5" />
                  <div className="text-left">
                    <div className="text-xs font-bold">Venue Delivery</div>
                    <div className="text-[11px] text-[#775a19] font-bold">+$50 Flat Fee</div>
                  </div>
                </button>
              </div>
            )}

            {!hasTiffin && isDelivery && (
              <p className="text-xs text-amber-800 bg-amber-50 p-2.5 rounded-xl border border-amber-200 leading-snug">
                📍 <em>Delivery available based on location throughout Frisco, Plano, McKinney, Allen, and greater DFW.</em>
              </p>
            )}
          </div>

          {/* ── 3. CUSTOMER CONTACT DETAILS ── */}
          <div className="space-y-4 pt-2">
            <h3 className="font-serif font-bold text-sm text-[#00346f]">
              Contact &amp; Event Information
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
                  className={`w-full px-3 py-2 text-xs bg-gray-50 border rounded-xl focus:outline-none focus:bg-white transition-all ${
                    formErrors.customerName ? 'border-rose-500' : 'border-gray-200 focus:border-[#00346f]'
                  }`}
                />
                {formErrors.customerName && (
                  <p className="text-[10px] text-rose-500 mt-0.5">{formErrors.customerName}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  US Phone Number <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="(945) 527-4566"
                  value={phoneNumber}
                  onChange={(e) => handlePhoneChange(e.target.value)}
                  className={`w-full px-3 py-2 text-xs bg-gray-50 border rounded-xl focus:outline-none focus:bg-white transition-all ${
                    formErrors.phoneNumber ? 'border-rose-500' : 'border-gray-200 focus:border-[#00346f]'
                  }`}
                />
                {formErrors.phoneNumber && (
                  <p className="text-[10px] text-rose-500 mt-0.5">{formErrors.phoneNumber}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Email Address <span className="text-rose-500">*</span>
              </label>
              <input
                type="email"
                placeholder="bluebonnetwhisk@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full px-3 py-2 text-xs bg-gray-50 border rounded-xl focus:outline-none focus:bg-white transition-all ${
                  formErrors.email ? 'border-rose-500' : 'border-gray-200 focus:border-[#00346f]'
                }`}
              />
              {formErrors.email && (
                <p className="text-[10px] text-rose-500 mt-0.5">{formErrors.email}</p>
              )}
            </div>

            {/* Interactive USPS Validated Delivery Address */}
            {isDelivery && (
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
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
            )}

            {/* Dietary & Satvik Preferences */}
            <div className="pt-2">
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
                    Our chef will prepare eligible curries, dals, and sabzis without onion or garlic using traditional sattvic spices.
                  </p>
                </div>
              </label>
            </div>

            {/* Special instructions */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Special Instructions / Allergen Precautions
              </label>
              <textarea
                rows={2}
                placeholder="Mention any specific nut or dairy precautions, gate codes, spice level preferences..."
                value={dietaryNotes}
                onChange={(e) => setDietaryNotes(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:bg-white focus:border-[#00346f]"
              />
            </div>
          </div>

          {/* ── 4. METHOD OF PAYMENT ── */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <h3 className="font-serif font-bold text-sm text-[#00346f]">
                Method of Payment <span className="text-rose-500">*</span>
              </h3>
              <span className="text-[11px] text-gray-500 hidden sm:inline">
                Select your preferred settlement method
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
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
                  <div className="text-[11px] text-gray-500 mt-0.5">Pay upon delivery or pickup</div>
                </div>
              </button>

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
                  <div className="text-[11px] text-gray-500 mt-0.5">Direct bank-to-bank transfer</div>
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
                <span>Zelle Recipient Phone: <strong>945-527-4566</strong> (Desi Dabba / Bluebonnet Whisk)</span>
                <span className="text-[11px] font-semibold text-purple-700">Zero additional processing fees</span>
              </div>
            )}

            {paymentMethod === 'credit_card' && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <span>Credit Card Processing Surcharge (3.5%): <strong>+${processingFee.toFixed(2)}</strong></span>
                <span className="text-[11px] text-amber-700">Calculated on subtotal, delivery, and tax</span>
              </div>
            )}
          </div>

          {/* ── 5. ORDER SUMMARY & TOTAL BREAKDOWN ── */}
          <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200 space-y-2 text-xs">
            <div className="flex justify-between text-gray-600">
              <span>Food Subtotal ({cart.length} item kinds):</span>
              <span className="font-bold text-gray-900">${foodSubtotal.toFixed(2)}</span>
            </div>
            {cakeSubtotal > 0 && nonCakeSubtotal > 0 && (
              <div className="pl-2 space-y-0.5 text-[11px] text-gray-500 border-l-2 border-gray-200">
                <div className="flex justify-between">
                  <span>• Catering Food (Taxable)</span>
                  <span>${nonCakeSubtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-emerald-700">
                  <span>• Cakes (0% Tax-Exempt)</span>
                  <span>${cakeSubtotal.toFixed(2)}</span>
                </div>
              </div>
            )}
            <div className="flex justify-between text-gray-600">
              <span>{isDelivery ? 'Delivery Fee (DFW Flat Fee)' : 'Self-Pickup (Home Kitchen, Little Elm)'}</span>
              <span className="font-bold text-gray-900">${deliveryFee.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <div>
                <span>Texas Sales Tax {nonCakeSubtotal > 0 ? '(8.25%)' : '(0% Exempt)'}:</span>
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

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 bg-gray-100 border-t border-gray-200 flex flex-col gap-3 shrink-0">
          {submissionError && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{submissionError}</span>
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-[11px] text-gray-500 text-center sm:text-left">
              <span>🔒 Direct Supabase Sync • Automatic Texas 8.25% Tax</span>
            </div>

            <div className="flex items-center gap-2.5 w-full sm:w-auto">
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => handleSubmit('estimate')}
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border border-[#00346f] text-[#00346f] hover:bg-[#00346f]/10 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Download / Save Estimate</span>
              </button>

              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => handleSubmit('order')}
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#00346f] hover:bg-[#00224d] text-white text-xs font-bold uppercase tracking-wider transition-all shadow-md cursor-pointer hover:scale-101"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSubmitting ? 'Submitting...' : 'Submit Order'}</span>
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
