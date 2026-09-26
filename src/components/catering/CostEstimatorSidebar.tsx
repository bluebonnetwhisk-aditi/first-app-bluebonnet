import { useState } from 'react';
import { 
  ShoppingBag, 
  Trash2, 
  ArrowRight, 
  Clock, 
  ChevronDown, 
  ChevronUp,
  X
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
  activeSubTab?: 'order' | 'cake' | 'tiffin' | 'kitchen';
}

export default function CostEstimatorSidebar({
  cart,
  isDelivery,
  setIsDelivery,
  onClearCart,
  onProceedToCheckout,
  onRemoveItem,
  activeSubTab
}: CostEstimatorSidebarProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Totals calculations
  const totalItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalDabbaCount = cart
    .filter(item => item.category === 'tiffin')
    .reduce((sum, item) => sum + item.quantity, 0);
  const totalCakeCount = cart
    .filter(item => item.category === 'cakes')
    .reduce((sum, item) => sum + item.quantity, 0);
  const totalTrayCount = cart
    .filter(item => item.selectionType === 'third' || item.selectionType === 'half' || item.selectionType === 'full')
    .reduce((sum, item) => sum + item.quantity, 0);

  const foodSubtotal = cart.reduce((sum, item) => sum + item.totalPrice, 0);
  const nonCakeSubtotal = cart.filter(item => item.category !== 'cakes').reduce((sum, item) => sum + item.totalPrice, 0);
  const hasTiffin = cart.some(item => item.category === 'tiffin');

  const deliveryFee = isDelivery ? 50.00 : 0.00;
  
  // Texas Sales Tax: Bakery items (cakes) are exempt (0% tax). Catering food & delivery are subject to 8.25%
  const taxableAmount = nonCakeSubtotal + (nonCakeSubtotal > 0 && isDelivery ? deliveryFee : 0);
  const taxAmount = Math.round(taxableAmount * 0.0825 * 100) / 100;
  const totalAmount = Math.round((foodSubtotal + deliveryFee + taxAmount) * 100) / 100;

  // Cutoff lead time requirement
  const noticeHours = getRequiredNoticeHours(cart);

  if (cart.length === 0) {
    return (
      <div className="fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-gray-200/80 shadow-lg py-2.5 px-4 font-sans">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 text-xs text-gray-500">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-4 h-4 text-gray-400 shrink-0" />
            <span>
              Your order selection is empty. Select{' '}
              {activeSubTab === 'tiffin'
                ? 'daily homestyle dabbas or weekly plan'
                : activeSubTab === 'cake'
                ? 'custom bakery bakes'
                : 'catering trays, starters, and curries'}{' '}
              to begin.
            </span>
          </div>
          <div className="text-[11px] text-gray-400 hidden sm:block">
            Strict 24h / 48h Advance Notice in US Central Time
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-0 inset-x-0 z-40 bg-white border-t border-gray-200 shadow-2xl font-sans">
      
      {/* ── Expandable Slide-Up Cart Drawer ── */}
      {isExpanded && (
        <div className="border-b border-gray-200 bg-gray-50/95 backdrop-blur-md max-h-72 overflow-y-auto p-4 sm:p-5">
          <div className="max-w-7xl mx-auto space-y-4">
            
            <div className="flex items-center justify-between pb-2 border-b border-gray-200">
              <div className="flex items-center gap-2 text-[#00346f] font-bold text-sm">
                <ShoppingBag className="w-4 h-4" />
                <span>Selected Order Items ({totalItemCount})</span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={onClearCart}
                  className="text-xs text-rose-600 hover:text-rose-800 flex items-center gap-1 font-semibold cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear All</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsExpanded(false)}
                  className="p-1 rounded-full text-gray-400 hover:text-gray-700 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* List of items */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-48 overflow-y-auto pr-1">
              {cart.map(item => (
                <div key={item.id} className="bg-white p-3 rounded-xl border border-gray-200 shadow-2xs flex items-start justify-between gap-2 text-xs">
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-gray-900 truncate">
                      {item.name}
                    </div>
                    <div className="text-[11px] text-gray-500">
                      {item.selectionType === 'pieces'
                        ? `${item.quantity} pieces @ $${item.unitPrice.toFixed(2)}/pc`
                        : `${item.selectionLabel} × ${item.quantity}`}
                    </div>
                    {item.notes && (
                      <div className="text-[10px] text-gray-400 italic truncate mt-0.5">
                        {item.notes}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="font-bold text-gray-900">${item.totalPrice.toFixed(2)}</span>
                    {onRemoveItem && (
                      <button
                        type="button"
                        onClick={() => onRemoveItem(item.id)}
                        className="text-gray-400 hover:text-rose-600 p-0.5 cursor-pointer"
                        title="Remove"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Quick fulfillment & lead time bar */}
            <div className="pt-2 border-t border-gray-200 flex flex-wrap items-center justify-between gap-3 text-xs text-gray-600">
              <div className="flex items-center gap-2">
                <span className="font-semibold">Fulfillment:</span>
                {hasTiffin ? (
                  <span className="font-bold text-[#00346f] bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-lg text-[11px]">
                    Self-Pickup Only (Little Elm) ($0)
                  </span>
                ) : (
                  <div className="inline-flex rounded-lg border border-gray-300 p-0.5 bg-white text-xs">
                    <button
                      type="button"
                      onClick={() => setIsDelivery(false)}
                      className={`px-2.5 py-0.5 rounded-md font-bold text-[11px] transition-all cursor-pointer ${
                        !isDelivery ? 'bg-[#00346f] text-white shadow-2xs' : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      Pickup ($0)
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsDelivery(true)}
                      className={`px-2.5 py-0.5 rounded-md font-bold text-[11px] transition-all cursor-pointer ${
                        isDelivery ? 'bg-[#00346f] text-white shadow-2xs' : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      Delivery ($50)
                    </button>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-1.5 text-[11px] text-amber-800 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                <Clock className="w-3.5 h-3.5 text-amber-600" />
                <span>Requires at least <strong>{noticeHours}h notice</strong> in US Central Time</span>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ── Main Sticky Bottom Bar ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
        
        {/* Left: Item Counts & Drawer Toggle */}
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-3 text-left cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-[#00346f] text-[#ffdea5] flex items-center justify-center font-bold text-xs shrink-0 shadow-sm group-hover:scale-105 transition-transform">
            {totalItemCount}
          </div>

          <div>
            <div className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-gray-900">
              <span>
                {activeSubTab === 'tiffin' || (totalDabbaCount > 0 && totalTrayCount === 0)
                  ? `${totalDabbaCount} Dabba${totalDabbaCount !== 1 ? 's' : ''}`
                  : activeSubTab === 'cake' || (totalCakeCount > 0 && totalTrayCount === 0)
                  ? `${totalCakeCount} Cake${totalCakeCount !== 1 ? 's' : ''}`
                  : totalTrayCount > 0
                  ? `${totalTrayCount} Tray${totalTrayCount !== 1 ? 's' : ''}`
                  : `${totalItemCount} Item${totalItemCount !== 1 ? 's' : ''}`}
              </span>
              <span className="text-gray-400">•</span>
              <span className="text-xs font-normal text-gray-500">
                {isDelivery ? 'Venue Delivery' : 'Self-Pickup'}
              </span>
              {isExpanded ? (
                <ChevronDown className="w-4 h-4 text-[#00346f]" />
              ) : (
                <ChevronUp className="w-4 h-4 text-[#00346f]" />
              )}
            </div>

            <div className="text-[11px] text-gray-500 flex items-center gap-1 font-medium">
              <span>Click to {isExpanded ? 'collapse' : 'view itemized breakdown'}</span>
            </div>
          </div>
        </button>

        {/* Center / Right: Grand Total & Checkout CTA */}
        <div className="flex items-center gap-4 sm:gap-6">
          <div className="text-right">
            <span className="text-[10px] uppercase font-bold tracking-wider text-gray-500 block">
              Estimated Total
            </span>
            <div className="font-serif font-bold text-lg sm:text-2xl text-[#00346f] leading-none">
              ${totalAmount.toFixed(2)}
            </div>
            <span className="text-[10px] text-gray-500 hidden sm:block mt-0.5">
              Tax included • No prepayment
            </span>
          </div>

          <button
            type="button"
            onClick={onProceedToCheckout}
            className="inline-flex items-center justify-center gap-2 py-3 px-5 sm:px-7 rounded-xl bg-[#00346f] hover:bg-[#00224d] text-white text-xs sm:text-sm font-bold uppercase tracking-wider transition-all shadow-md hover:shadow-lg hover:scale-102 cursor-pointer shrink-0"
          >
            <span>Proceed to Checkout</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>

    </div>
  );
}
