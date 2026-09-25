import { CheckCircle2, Calendar, Clock, MapPin, Printer, ArrowRight, X } from 'lucide-react';
import type { CateringOrder } from '../../types/catering';

interface OrderConfirmationModalProps {
  order: CateringOrder | null;
  onClose: () => void;
  onViewReceipt: () => void;
  onGoToKitchenKDS?: () => void;
}

export default function OrderConfirmationModal({
  order,
  onClose,
  onViewReceipt,
  onGoToKitchenKDS
}: OrderConfirmationModalProps) {
  if (!order) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 animate-fade-in font-sans">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-gray-200 p-6 sm:p-8 text-center">
        
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-full text-gray-400 hover:text-gray-700"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <span className="text-[10px] font-bold uppercase tracking-widest text-[#775a19]">
          ORDER CONFIRMED
        </span>
        <h2 className="font-serif text-2xl font-bold text-[#00346f] mt-1">
          Thank you, {order.customer_name}!
        </h2>
        <p className="text-xs text-gray-600 mt-1 max-w-sm mx-auto">
          Your Desi Dabba catering order has been successfully recorded in the kitchen queue.
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

          <div className="flex justify-between pt-2 border-t border-gray-200 font-bold text-sm text-[#00346f]">
            <span>Total Estimated Cost:</span>
            <span className="font-serif text-base">${order.total_amount.toFixed(2)}</span>
          </div>
        </div>

        {/* Next step notice */}
        <div className="mt-4 p-3 rounded-xl bg-blue-50 border border-blue-200 text-[11px] text-[#00346f] text-left leading-relaxed">
          A confirmation copy has been queued for <strong>{order.email}</strong>. Our chef will review special dietary adjustments and send final status updates.
        </div>

        {/* Buttons */}
        <div className="mt-6 flex flex-col sm:flex-row gap-2.5">
          <button
            onClick={onViewReceipt}
            className="flex-1 inline-flex items-center justify-center gap-1.5 border border-[#00346f] text-[#00346f] hover:bg-[#00346f]/10 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>View / Print Receipt</span>
          </button>

          {onGoToKitchenKDS && (
            <button
              onClick={onGoToKitchenKDS}
              className="flex-1 inline-flex items-center justify-center gap-1.5 bg-[#00346f] hover:bg-[#00224d] text-white py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors shadow-md cursor-pointer"
            >
              <span>View in Kitchen KDS</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
