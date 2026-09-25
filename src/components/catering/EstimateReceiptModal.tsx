import { Printer, X, CheckCircle, MessageCircle, Phone, CreditCard } from 'lucide-react';
import type { CateringOrder } from '../../types/catering';
import { buildOrderWhatsAppUrl, buildOrderSMSUrl, getPaymentMethodLabel } from '../../utils/whatsapp';

interface EstimateReceiptModalProps {
  order: CateringOrder | null;
  onClose: () => void;
}

export default function EstimateReceiptModal({ order, onClose }: EstimateReceiptModalProps) {
  if (!order) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto animate-fade-in font-sans">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden my-6 max-h-[95vh] flex flex-col">
        
        {/* Modal Controls Bar */}
        <div className="bg-[#00346f] text-white px-6 py-4 flex items-center justify-between shrink-0 print:hidden">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-[#ffdea5]" />
            <span className="font-serif font-bold text-lg">
              {order.order_type === 'estimate' ? 'Official Catering Cost Estimate' : 'Catering Order Confirmation'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 bg-white/20 hover:bg-white/30 text-white px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / PDF</span>
            </button>

            <button
              onClick={onClose}
              className="p-1 rounded-full text-white/80 hover:text-white hover:bg-white/10"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* PRINTABLE RECEIPT CANVAS */}
        <div id="estimate-receipt-print" className="p-6 sm:p-8 overflow-y-auto space-y-6 text-gray-800">
          
          {/* Header Brand */}
          <div className="border-b border-gray-200 pb-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#775a19] block">
                BLUEBONNET WHISK LLC
              </span>
              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#00346f]">
                DESI DABBA CATERING
              </h1>
              <p className="text-xs text-gray-500 mt-0.5">
                Vegetarian Homestyle Catering • Frisco, Texas
              </p>
            </div>

            <div className="text-left sm:text-right text-xs space-y-0.5">
              <div className="font-bold text-[#00346f]">Ref #: {order.id.slice(0, 8).toUpperCase()}</div>
              <div className="text-gray-500">Date: {new Date().toLocaleDateString('en-US')}</div>
              <div className="inline-block bg-blue-50 text-[#00346f] px-2 py-0.5 rounded font-bold uppercase text-[10px]">
                STATUS: {order.order_type === 'estimate' ? 'PROPOSAL ESTIMATE' : 'OFFICIAL ORDER'}
              </div>
            </div>
          </div>

          {/* Client & Fulfillment Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl border border-gray-200 text-xs">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 block mb-1">
                Client Information
              </span>
              <div className="font-bold text-gray-900 text-sm">{order.customer_name}</div>
              <div className="text-gray-600">{order.phone_number}</div>
              <div className="text-gray-600">{order.email}</div>
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 block mb-1">
                Fulfillment Schedule
              </span>
              <div className="font-bold text-gray-900 text-sm">
                {order.fulfillment_date} at {order.fulfillment_time}
              </div>
              <div className="text-gray-600 font-medium">
                {order.is_delivery ? `Venue Delivery: ${order.delivery_address}` : 'Client Self-Pickup (Frisco, TX)'}
              </div>
              {order.dietary_notes && (
                <div className="text-amber-800 font-semibold mt-1">
                  Notes: {order.dietary_notes}
                </div>
              )}
              <div className="text-gray-700 text-xs mt-1.5 flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5 text-[#00346f]" />
                <span>Payment Method: <strong>{getPaymentMethodLabel(order.payment_method)}</strong></span>
              </div>
            </div>
          </div>

          {/* Line Items Table */}
          <div>
            <h3 className="font-serif font-bold text-sm text-[#00346f] mb-3">
              Itemized Catering Tray &amp; Dish Selection
            </h3>
            
            <div className="border border-gray-200 rounded-xl overflow-hidden divide-y divide-gray-150 text-xs">
              <div className="bg-gray-100 p-3 flex justify-between font-bold text-gray-700 uppercase tracking-wider text-[10px]">
                <span className="w-1/2">Dish &amp; Description</span>
                <span className="w-1/4 text-center">Tray / Pack Size</span>
                <span className="w-1/8 text-center">Qty</span>
                <span className="w-1/8 text-right">Total</span>
              </div>

              {order.items.map((item, idx) => (
                <div key={idx} className="p-3 flex justify-between items-center text-xs">
                  <div className="w-1/2">
                    <span className="font-bold text-gray-900 block">{item.name}</span>
                    <span className="text-[11px] text-gray-500">
                      {item.categoryLabel} {item.tier ? `• ${item.tier} Tier` : ''}
                    </span>
                  </div>
                  <div className="w-1/4 text-center text-gray-600 font-medium">
                    {item.selectionLabel}
                  </div>
                  <div className="w-1/8 text-center font-bold text-gray-900">
                    {item.quantity}
                  </div>
                  <div className="w-1/8 text-right font-bold text-[#00346f]">
                    ${item.totalPrice.toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Totals Summary */}
          <div className="flex justify-end pt-2">
            <div className="w-full sm:w-64 space-y-2 text-xs bg-gray-50 p-4 rounded-xl border border-gray-200">
              <div className="flex justify-between text-gray-600">
                <span>Food Subtotal:</span>
                <span className="font-semibold text-gray-900">${order.food_subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Delivery Fee:</span>
                <span className="font-semibold text-gray-900">${order.delivery_fee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Texas Tax (8.25%):</span>
                <span className="font-semibold text-gray-900">${order.tax_amount.toFixed(2)}</span>
              </div>
              {order.processing_fee && order.processing_fee > 0 ? (
                <div className="flex justify-between text-amber-800">
                  <span>Card Fee (3.5%):</span>
                  <span className="font-semibold">+${order.processing_fee.toFixed(2)}</span>
                </div>
              ) : null}
              <div className="pt-2 border-t border-gray-200 flex justify-between items-baseline font-bold text-base text-[#00346f]">
                <span>Total Amount:</span>
                <span className="font-serif text-xl">${order.total_amount.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Notice & Footer */}
          <div className="pt-4 border-t border-gray-200 text-[10px] text-gray-500 space-y-1">
            <p>
              * 100% Vegetarian Kitchen • All dishes prepared fresh to order in Frisco, Texas.
            </p>
            <p>
              For inquiries or modifications, call or WhatsApp 945-527-4566 or email bluebonnetwhisk@gmail.com.
            </p>
          </div>

        </div>

        {/* Bottom Actions Bar */}
        <div className="bg-gray-50 p-4 border-t border-gray-200 flex flex-wrap items-center justify-between gap-3 shrink-0 print:hidden">
          <div className="flex flex-wrap items-center gap-2">
            <a
              href={buildOrderWhatsAppUrl(order)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 bg-[#25D366] hover:bg-[#1ebd5a] text-white px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-xs cursor-pointer"
            >
              <MessageCircle className="w-3.5 h-3.5 fill-white" />
              <span>WhatsApp Desi Dabba</span>
            </a>

            <a
              href={buildOrderSMSUrl(order)}
              className="inline-flex items-center gap-1.5 bg-[#00346f] hover:bg-[#00224d] text-white px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-xs cursor-pointer"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Send SMS</span>
            </a>
          </div>

          <button
            onClick={onClose}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ml-auto"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
}
