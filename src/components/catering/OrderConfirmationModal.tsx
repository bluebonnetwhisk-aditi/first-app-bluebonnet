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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-3 sm:p-4 animate-fade-in font-sans">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-gray-200 p-5 sm:p-6 text-center max-h-[92vh] overflow-y-auto">
        
        <button
          onClick={onClose}
          className="absolute top-3.5 right-3.5 p-1 rounded-full text-gray-400 hover:text-gray-700 cursor-pointer"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-2.5">
          <CheckCircle2 className="w-7 h-7" />
        </div>

        <span className="text-[10px] font-bold uppercase tracking-widest text-[#775a19]">
          ORDER CONFIRMED &amp; RECORDED
        </span>
        <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#00346f] mt-0.5">
          Thank you, {order.customer_name}!
        </h2>
        <p className="text-xs text-gray-500 mt-1">
          Order <strong className="font-mono text-[#00346f]">#{order.id.slice(0, 8).toUpperCase()}</strong> is in our kitchen queue.
        </p>

        {/* Compact Order Details Card */}
        <div className="mt-4 bg-gray-50 rounded-xl p-3.5 border border-gray-200 text-left space-y-2 text-xs">
          <div className="grid grid-cols-2 gap-2 pb-2 border-b border-gray-200">
            <div className="flex items-center gap-1.5 text-gray-700">
              <Calendar className="w-3.5 h-3.5 text-[#775a19] shrink-0" />
              <span className="truncate font-semibold">{order.fulfillment_date}</span>
            </div>
            <div className="flex items-center gap-1.5 text-gray-700 justify-end">
              <Clock className="w-3.5 h-3.5 text-[#775a19] shrink-0" />
              <span className="truncate font-semibold">{order.fulfillment_time}</span>
            </div>
          </div>

          <div className="flex items-start gap-2 text-gray-700">
            <MapPin className="w-3.5 h-3.5 text-[#775a19] shrink-0 mt-0.5" />
            <span className="text-[11px] leading-snug">
              {order.is_delivery 
                ? `Delivery: ${order.delivery_address}` 
                : 'Self-Pickup: Deerwood Dr, Little Elm, TX'}
            </span>
          </div>

          <div className="flex items-center justify-between text-gray-700 pt-1">
            <span className="inline-flex items-center gap-1.5 text-[11px]">
              <CreditCard className="w-3.5 h-3.5 text-[#775a19] shrink-0" />
              <strong>{getPaymentMethodLabel(order.payment_method)}</strong>
            </span>
            {order.processing_fee && order.processing_fee > 0 ? (
              <span className="text-[10px] text-gray-500">
                Includes +${order.processing_fee.toFixed(2)} card fee
              </span>
            ) : null}
          </div>

          <div className="flex justify-between items-center pt-2 border-t border-gray-200 font-bold text-sm text-[#00346f]">
            <span>Total Due:</span>
            <span className="font-serif text-base">${order.total_amount.toFixed(2)}</span>
          </div>
        </div>

        {/* Next step notice */}
        <div className="mt-3 p-2.5 rounded-xl bg-blue-50 border border-blue-200 text-[11px] text-[#00346f] text-left leading-snug">
          {order.email ? (
            <>A confirmation copy was queued for <strong>{order.email}</strong>. </>
          ) : null}
          Tap below to send your order ticket via WhatsApp or SMS for instant kitchen confirmation.
        </div>

        {/* Action Buttons */}
        <div className="mt-4 space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <a
              href={whatsAppUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-1.5 bg-[#25D366] hover:bg-[#1ebd5a] text-white py-2.5 px-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-md cursor-pointer"
            >
              <MessageCircle className="w-4 h-4 fill-white shrink-0" />
              <span>WhatsApp</span>
            </a>

            <a
              href={smsUrl}
              className="inline-flex items-center justify-center gap-1.5 bg-[#00346f] hover:bg-[#00224d] text-white py-2.5 px-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-md cursor-pointer"
            >
              <Phone className="w-3.5 h-3.5 shrink-0" />
              <span>Send SMS</span>
            </a>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={onViewReceipt}
              className="inline-flex items-center justify-center gap-1.5 border border-[#00346f] text-[#00346f] hover:bg-[#00346f]/10 py-2 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Receipt</span>
            </button>

            <button
              onClick={onClose}
              className="inline-flex items-center justify-center gap-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-colors cursor-pointer"
            >
              <span>Done</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
