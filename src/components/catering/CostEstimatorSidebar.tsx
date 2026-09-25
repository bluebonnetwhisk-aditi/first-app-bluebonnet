import { useState } from 'react';
import { 
  ShoppingBag, 
  Trash2, 
  Truck, 
  Store, 
  ArrowRight, 
  Clock, 
  ChevronDown, 
  ChevronUp 
} from 'lucide-react';
import type { CartItem } from '../../types/catering';
import { getRequiredNoticeHours } from '../../utils/centralTime';

interface CostEstimatorSidebarProps {
  cart: CartItem[];
  isDelivery: boolean;
  setIsDelivery: (val: boolean) => void;
  onClearCart: () => void;
  onProceedToCheckout: () => void;
  onRemoveItem?: (id: string) => void;
}

export default function CostEstimatorSidebar({
  cart,
  isDelivery,
  setIsDelivery,
  onClearCart,
  onProceedToCheckout,
  onRemoveItem
}: CostEstimatorSidebarProps) {
  const [isMobileExpanded, setIsMobileExpanded] = useState(false);

  // Totals calculations
  const totalItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalTrayCount = cart
    .filter(item => item.selectionType === 'third' || item.selectionType === 'half' || item.selectionType === 'full')
    .reduce((sum, item) => sum + item.quantity, 0);

  const foodSubtotal = cart.reduce((sum, item) => sum + item.totalPrice, 0);
  const deliveryFee = isDelivery ? 50.00 : 0.00;
  
  // Texas Sales Tax: Exactly 8.25% calculated on (Food Subtotal + Delivery Fee)
  const taxableAmount = foodSubtotal + deliveryFee;
  const taxAmount = Math.round(taxableAmount * 0.0825 * 100) / 100;
  const totalAmount = Math.round((foodSubtotal + deliveryFee + taxAmount) * 100) / 100;

  // Cutoff lead time requirement
  const noticeHours = getRequiredNoticeHours(cart);

  return (
    <>
      {/* ── DESKTOP STICKY SIDEBAR ── */}
      <div className="hidden lg:block w-full sticky top-[144px] bg-white rounded-2xl border border-gray-200 shadow-md p-6 font-sans max-h-[calc(100vh-160px)] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-150">
          <div className="flex items-center gap-2 text-[#00346f]">
            <ShoppingBag className="w-5 h-5 text-[#00346f]" />
            <h3 className="font-serif font-bold text-lg">Order Estimator</h3>
          </div>
          {cart.length > 0 && (
            <button
              onClick={onClearCart}
              className="text-xs text-rose-600 hover:text-rose-800 flex items-center gap-1 cursor-pointer font-medium"
              title="Clear all items"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>
          )}
        </div>

        {/* Lead time notice badge */}
        <div className={`mt-4 p-2.5 rounded-xl border text-[11px] flex items-start gap-2 ${
          noticeHours >= 48 
            ? 'bg-amber-50 border-amber-200 text-amber-900' 
            : 'bg-blue-50 border-blue-200 text-[#00346f]'
        }`}>
          <Clock className="w-4 h-4 shrink-0 mt-0.5" />
          <p className="leading-snug">
            <strong>Cutoff Notice:</strong> Requires at least{' '}
            <span className="font-bold underline">{noticeHours} hours advance notice</span> in US Central Time (`America/Chicago`).
          </p>
        </div>

        {/* Cart Items List */}
        <div className="mt-4 max-h-[360px] overflow-y-auto divide-y divide-gray-100 pr-1">
          {cart.length === 0 ? (
            <div className="py-8 text-center text-gray-400 text-xs">
              <ShoppingBag className="w-8 h-8 mx-auto mb-2 opacity-40 text-gray-400" />
              <p>Your catering tray selection is empty.</p>
              <p className="text-[11px] mt-1 text-gray-500">
                Choose tray sizes, breads, or beverages from the menu.
              </p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.id} className="py-2.5 flex items-start justify-between gap-2 text-xs">
                <div className="flex-1 min-w-0 pr-1">
                  <div className="font-semibold text-gray-900 leading-tight">
                    {item.name}
                  </div>
                  <div className="text-gray-500 text-[11px]">
                    {item.selectionType === 'pieces'
                      ? `${item.quantity} pieces @ $${item.unitPrice.toFixed(2)}/pc`
                      : `${item.selectionLabel} × ${item.quantity}`}
                  </div>
                  {item.notes && (
                    <div className="text-[10px] text-gray-500 italic mt-0.5 line-clamp-2">
                      {item.notes}
                    </div>
                  )}
                  {item.tier && (
                    <span className="text-[9px] uppercase tracking-wider text-gray-400">
                      {item.tier} Tier
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1.5 shrink-0 text-right">
                  <div className="font-bold text-gray-900">
                    ${item.totalPrice.toFixed(2)}
                  </div>
                  {onRemoveItem && (
                    <button
                      type="button"
                      onClick={() => onRemoveItem(item.id)}
                      className="text-gray-300 hover:text-rose-500 p-0.5 rounded cursor-pointer transition-colors"
                      title="Remove from cart"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Tray count summary pill */}
        {cart.length > 0 && (
          <div className="mt-3 py-1.5 px-3 bg-gray-50 rounded-lg text-[11px] text-gray-600 flex justify-between font-medium">
            <span>Total Trays Selected:</span>
            <span className="font-bold text-[#00346f]">{totalTrayCount} Tray{totalTrayCount !== 1 ? 's' : ''}</span>
          </div>
        )}

        {/* Fulfillment Options */}
        <div className="mt-4 pt-4 border-t border-gray-150">
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-2">
            Fulfillment Method
          </label>
          <div className="grid grid-cols-2 gap-2">
            
            <button
              type="button"
              onClick={() => setIsDelivery(false)}
              className={`p-2.5 rounded-xl border text-left flex items-center gap-2 cursor-pointer transition-all ${
                !isDelivery
                  ? 'border-[#00346f] bg-[#00346f]/5 text-[#00346f] font-bold shadow-2xs'
                  : 'border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Store className="w-4 h-4 shrink-0" />
              <div>
                <div className="text-xs">Pickup</div>
                <div className="text-[10px] text-gray-500 font-normal">Free ($0.00)</div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setIsDelivery(true)}
              className={`p-2.5 rounded-xl border text-left flex items-center gap-2 cursor-pointer transition-all ${
                isDelivery
                  ? 'border-[#00346f] bg-[#00346f]/5 text-[#00346f] font-bold shadow-2xs'
                  : 'border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Truck className="w-4 h-4 shrink-0" />
              <div>
                <div className="text-xs">Delivery</div>
                <div className="text-[10px] text-[#775a19] font-bold">+$50 Flat Fee</div>
              </div>
            </button>

          </div>

          {isDelivery && (
            <p className="mt-2 text-[11px] text-amber-800 bg-amber-50 p-2 rounded-lg border border-amber-200 leading-snug">
              📍 <em>Delivery available based on location throughout Frisco & DFW.</em>
            </p>
          )}
        </div>

        {/* Pricing Breakdown */}
        <div className="mt-4 pt-4 border-t border-gray-150 space-y-2 text-xs">
          
          <div className="flex justify-between text-gray-600">
            <span>Food Subtotal ({totalItemCount} items)</span>
            <span className="font-semibold text-gray-900">${foodSubtotal.toFixed(2)}</span>
          </div>

          <div className="flex justify-between text-gray-600">
            <span>Delivery Fee</span>
            <span className="font-semibold text-gray-900">
              {deliveryFee > 0 ? `$${deliveryFee.toFixed(2)}` : 'FREE'}
            </span>
          </div>

          <div className="flex justify-between text-gray-600">
            <span>Texas Sales Tax (8.25%)</span>
            <span className="font-semibold text-gray-900">${taxAmount.toFixed(2)}</span>
          </div>

          <div className="pt-2 border-t border-gray-150 flex justify-between items-baseline">
            <span className="font-serif font-bold text-sm text-gray-900">Total Estimated Cost</span>
            <span className="font-serif font-bold text-xl text-[#00346f]">${totalAmount.toFixed(2)}</span>
          </div>

        </div>

        {/* Action Button */}
        <button
          onClick={onProceedToCheckout}
          disabled={cart.length === 0}
          className={`mt-5 w-full py-3.5 px-4 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md ${
            cart.length > 0
              ? 'bg-[#00346f] hover:bg-[#00224d] text-white cursor-pointer hover:scale-101'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          <span>Checkout / Save Estimate</span>
          <ArrowRight className="w-4 h-4" />
        </button>

        <p className="mt-2.5 text-[10px] text-gray-400 text-center">
          No prepayment required to generate an instant formal estimate.
        </p>

      </div>

      {/* ── MOBILE FLOATING STICKY BOTTOM BAR ── */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 shadow-2xl p-3 font-sans">
        
        {/* Expandable summary accordion */}
        {isMobileExpanded && (
          <div className="mb-3 max-h-60 overflow-y-auto divide-y divide-gray-100 border-b border-gray-150 pb-2">
            <div className="flex justify-between items-center pb-1 text-xs font-bold text-[#00346f]">
              <span>Selected Trays ({totalTrayCount})</span>
              <button
                onClick={onClearCart}
                className="text-rose-600 text-[11px] font-normal"
              >
                Clear
              </button>
            </div>
            {cart.map(item => (
              <div key={item.id} className="py-1.5 flex justify-between items-center text-xs">
                <div className="min-w-0 flex-1 pr-2">
                  <span className="truncate block font-medium">
                    {item.name} ({item.selectionType === 'pieces' ? `${item.quantity} pcs` : `${item.selectionLabel} × ${item.quantity}`})
                  </span>
                  {item.notes && <span className="text-[10px] text-gray-400 italic block truncate">{item.notes}</span>}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="font-semibold">${item.totalPrice.toFixed(2)}</span>
                  {onRemoveItem && (
                    <button onClick={() => onRemoveItem(item.id)} className="text-gray-400 hover:text-rose-500">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            ))}
            <div className="pt-2 text-xs text-gray-600 space-y-1">
              <div className="flex justify-between">
                <span>Delivery:</span>
                <button
                  onClick={() => setIsDelivery(!isDelivery)}
                  className="font-bold text-[#00346f] underline text-[11px]"
                >
                  {isDelivery ? 'Delivery ($50)' : 'Pickup ($0)'}
                </button>
              </div>
              <div className="flex justify-between text-[11px]">
                <span>Tax (8.25%):</span>
                <span>${taxAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between gap-3">
          
          <button
            onClick={() => setIsMobileExpanded(!isMobileExpanded)}
            className="flex flex-col text-left cursor-pointer"
          >
            <div className="flex items-center gap-1 text-[11px] text-gray-500 font-semibold uppercase tracking-wider">
              <span>{totalItemCount} Items • {isDelivery ? 'Delivery' : 'Pickup'}</span>
              {isMobileExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
            </div>
            <div className="font-serif font-bold text-lg text-[#00346f]">
              ${totalAmount.toFixed(2)}
            </div>
          </button>

          <button
            onClick={onProceedToCheckout}
            disabled={cart.length === 0}
            className={`py-3 px-5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all ${
              cart.length > 0
                ? 'bg-[#00346f] text-white shadow-md cursor-pointer'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            <span>Checkout</span>
            <ArrowRight className="w-4 h-4" />
          </button>

        </div>

      </div>
    </>
  );
}
