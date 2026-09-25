import { CheckCircle2, Calendar, Clock, MapPin, Printer, MessageCircle, Phone, X, CreditCard } from 'lucide-react';
import type { CateringOrder } from '../../types/catering';
import { buildOrderWhatsAppUrl, buildOrderSMSUrl, getPaymentMethodLabel } from '../../utils/whatsapp';

interface OrderConfirmationModalProps {
  order: CateringOrder | null;
  onClose: () => void;
  onViewReceipt: () => void;
}

export default function OrderConfirmationModal({
  order,
  onClose,
  onViewReceipt
}: OrderConfirmationModalProps) {
  if (!order) return null;

  const whatsAppUrl = buildOrderWhatsAppUrl(order);
  const smsUrl = buildOrderSMSUrl(order);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 animate-fade-in font-sans">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-gray-200 p-6 sm:p-8 text-center max-h-[92vh] overflow-y-auto">
        
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-full text-gray-400 hover:text-gray-700 cursor-pointer"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <span className="text-[10px] font-bold uppercase tracking-widest text-[#775a19]">
          ORDER CONFIRMED &amp; RECORDED
        </span>
        <h2 className="font-serif text-2xl font-bold text-[#00346f] mt-1">
          Thank you, {order.customer_name}!
        </h2>
        <p className="text-xs text-gray-600 mt-1 max-w-sm mx-auto">
          Your Desi Dabba catering order has been successfully recorded in our kitchen queue.
        </p>

        {/* Order Details Card */}
        <div className="mt-6 bg-gray-50 rounded-xl p-4 border border-gray-200 text-left space-y-2.5 text-xs">
          <div className="flex justify-between pb-2 border-b border-gray-200 font-mono">
            <span className="text-gray-500">Order Reference:</span>
            <span className="font-bold text-[#00346f]">#{order.id.slice(0, 8).toUpperCase()}</span>
          </div>

          <div className="flex items-center gap-2 text-gray-700">
            <Calendar className="w-4 h-4 text-[#775a19] shrink-0" />
            <span>Fulfillment Date: <strong>{order.fulfillment_date}</strong></span>
          </div>

          <div className="flex items-center gap-2 text-gray-700">
            <Clock className="w-4 h-4 text-[#775a19] shrink-0" />
            <span>Target Window: <strong>{order.fulfillment_time}</strong></span>
          </div>

          <div className="flex items-start gap-2 text-gray-700">
            <MapPin className="w-4 h-4 text-[#775a19] shrink-0 mt-0.5" />
            <span>
              {order.is_delivery 
                ? `Delivery to: ${order.delivery_address}` 
                : 'Self-Pickup at Bluebonnet Whisk Workshop (Frisco, TX)'}
            </span>
          </div>

          <div className="flex items-center gap-2 text-gray-700">
            <CreditCard className="w-4 h-4 text-[#775a19] shrink-0" />
            <span>Payment Method: <strong>{getPaymentMethodLabel(order.payment_method)}</strong></span>
          </div>

          {order.processing_fee && order.processing_fee > 0 ? (
            <div className="flex justify-between text-gray-600 text-[11px]">
              <span>Credit Card Surcharge (3.5%):</span>
              <span className="font-semibold text-gray-800">+${order.processing_fee.toFixed(2)}</span>
            </div>
          ) : null}

          <div className="flex justify-between pt-2 border-t border-gray-200 font-bold text-sm text-[#00346f]">
            <span>Grand Total:</span>
            <span className="font-serif text-base">${order.total_amount.toFixed(2)}</span>
          </div>
        </div>

        {/* Next step notice */}
        <div className="mt-4 p-3 rounded-xl bg-blue-50 border border-blue-200 text-[11px] text-[#00346f] text-left leading-relaxed">
          A confirmation copy has been queued for <strong>{order.email}</strong>. Please notify Desi Dabba via WhatsApp or SMS to confirm your preparation window.
        </div>

        {/* Action Buttons */}
        <div className="mt-6 space-y-2.5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <a
              href={whatsAppUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#1ebd5a] text-white py-3 px-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-md cursor-pointer"
            >
              <MessageCircle className="w-4 h-4 fill-white" />
              <span>WhatsApp Message</span>
            </a>

            <a
              href={smsUrl}
              className="inline-flex items-center justify-center gap-2 bg-[#00346f] hover:bg-[#00224d] text-white py-3 px-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-md cursor-pointer"
            >
              <Phone className="w-4 h-4" />
              <span>Send via SMS</span>
            </a>
          </div>

          <div className="flex flex-col sm:flex-row gap-2.5">
            <button
              onClick={onViewReceipt}
              className="flex-1 inline-flex items-center justify-center gap-1.5 border border-[#00346f] text-[#00346f] hover:bg-[#00346f]/10 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>View / Print Receipt</span>
            </button>

            <button
              onClick={onClose}
              className="flex-1 inline-flex items-center justify-center gap-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
            >
              <span>Back to Store</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
