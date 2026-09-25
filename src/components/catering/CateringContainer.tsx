import { useState, useEffect } from 'react';
import { ClipboardList, ChefHat, Lock } from 'lucide-react';
import BrandHeader from './BrandHeader';
import MenuOrderGrid from './MenuOrderGrid';
import CostEstimatorSidebar from './CostEstimatorSidebar';
import CheckoutModal from './CheckoutModal';
import EstimateReceiptModal from './EstimateReceiptModal';
import OrderConfirmationModal from './OrderConfirmationModal';
import KitchenKDS from './KitchenKDS';
import type { CartItem, CateringOrder, MenuItem, TraySize } from '../../types/catering';

const CART_STORAGE_KEY = 'bbw_catering_cart_v1';

export default function CateringContainer() {
  // Sub-navigation: 'order' (/catering/order or /catering) vs 'kitchen' (/catering/kitchen)
  const [subTab, setSubTab] = useState<'order' | 'kitchen'>(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname.toLowerCase();
      if (path.includes('/kitchen')) return 'kitchen';
    }
    return 'order';
  });

  // Cart state with persistence
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Fulfillment option: Delivery ($50) vs Pickup ($0)
  const [isDelivery, setIsDelivery] = useState(false);

  // Modals state
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [activeReceiptOrder, setActiveReceiptOrder] = useState<CateringOrder | null>(null);
  const [activeConfirmationOrder, setActiveConfirmationOrder] = useState<CateringOrder | null>(null);

  // Sync cart changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch {
      // ignore
    }
  }, [cart]);

  // Sync route changes with browser history
  const switchSubTab = (tab: 'order' | 'kitchen') => {
    setSubTab(tab);
    if (typeof window !== 'undefined') {
      const newPath = tab === 'kitchen' ? '/catering/kitchen' : '/catering/order';
      window.history.pushState(null, '', newPath);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Listen to popstate (browser back/forward button)
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname.toLowerCase();
      if (path.includes('/kitchen')) {
        setSubTab('kitchen');
      } else {
        setSubTab('order');
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Update item in cart handler
  const handleUpdateCartItem = (
    menuItem: MenuItem,
    selectionType: TraySize | 'pack_30' | 'gallon' | 'cake_custom',
    quantity: number,
    selectionLabel: string,
    unitPrice: number
  ) => {
    setCart(prev => {
      const existingIdx = prev.findIndex(
        item => item.menuItemId === menuItem.id && item.selectionType === selectionType
      );

      if (quantity <= 0) {
        if (existingIdx !== -1) {
          return prev.filter((_, idx) => idx !== existingIdx);
        }
        return prev;
      }

      const updatedItem: CartItem = {
        id: `${menuItem.id}-${selectionType}`,
        menuItemId: menuItem.id,
        name: menuItem.name,
        category: menuItem.category,
        categoryLabel: menuItem.categoryLabel,
        selectionType,
        selectionLabel,
        quantity,
        unitPrice,
        totalPrice: Math.round(quantity * unitPrice * 100) / 100,
        tier: menuItem.tier,
        allergens: menuItem.allergens,
        leadTimeHours: menuItem.leadTimeHours
      };

      if (existingIdx !== -1) {
        const next = [...prev];
        next[existingIdx] = updatedItem;
        return next;
      } else {
        return [...prev, updatedItem];
      }
    });
  };

  const handleClearCart = () => {
    setCart([]);
  };

  const handleOrderSuccess = (order: CateringOrder, isEstimate: boolean) => {
    if (isEstimate) {
      setActiveReceiptOrder(order);
    } else {
      setActiveConfirmationOrder(order);
      setCart([]); // Clear cart after confirmed order
    }
  };

  return (
    <div className="w-full bg-[#fbfbfa] min-h-screen font-sans selection:bg-[#775a19]/20">
      
      {/* ── 1. SUB-NAVIGATION BAR (Order & Estimates vs Kitchen KDS) ── */}
      <div className="sticky top-14 z-40 bg-white border-b border-gray-200 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-12">
            
            <div className="flex items-center gap-2">
              <span className="font-serif font-bold text-xs uppercase tracking-widest text-[#00346f] hidden sm:inline">
                CATERING PORTAL:
              </span>
              
              <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl">
                <button
                  onClick={() => switchSubTab('order')}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                    subTab === 'order'
                      ? 'bg-[#00346f] text-white shadow-xs'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <ClipboardList className="w-3.5 h-3.5" />
                  <span>Order &amp; Estimates</span>
                  {cart.length > 0 && (
                    <span className="w-4 h-4 rounded-full bg-[#ffdea5] text-[#00346f] text-[10px] flex items-center justify-center font-bold">
                      {cart.reduce((s, i) => s + i.quantity, 0)}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => switchSubTab('kitchen')}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                    subTab === 'kitchen'
                      ? 'bg-[#00346f] text-white shadow-xs'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <ChefHat className="w-3.5 h-3.5" />
                  <span>Kitchen KDS</span>
                  <Lock className="w-3 h-3 text-amber-500" />
                </button>
              </div>
            </div>

            <div className="text-right text-[11px] text-gray-500 hidden md:block">
              <span>Frisco, TX • Strict 24h/48h Lead Time Engine</span>
            </div>

          </div>
        </div>
      </div>

      {/* ── 2. SUB-TAB VIEWPORT ── */}
      {subTab === 'kitchen' ? (
        <KitchenKDS onBackToOrder={() => switchSubTab('order')} />
      ) : (
        <div className="space-y-8 pb-24">
          
          {/* Brand Header with Differentiator Cards & Allergen Notice */}
          <BrandHeader onScrollToMenu={() => {
            document.getElementById('catering-menu-grid')?.scrollIntoView({ behavior: 'smooth' });
          }} />

          {/* Main 2-Column Layout: Menu Order Grid + Cost Estimator Sidebar */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Left Column: Menu Order Grid (8 Cols) */}
              <div className="lg:col-span-8">
                <MenuOrderGrid
                  cart={cart}
                  onUpdateCartItem={handleUpdateCartItem}
                />
              </div>

              {/* Right Column: Sticky Cost Estimator Sidebar (4 Cols) */}
              <div className="lg:col-span-4">
                <CostEstimatorSidebar
                  cart={cart}
                  isDelivery={isDelivery}
                  setIsDelivery={setIsDelivery}
                  onClearCart={handleClearCart}
                  onProceedToCheckout={() => setIsCheckoutOpen(true)}
                />
              </div>

            </div>
          </div>

        </div>
      )}

      {/* ── 3. MODALS ── */}
      
      {/* Checkout & Lead-Time Validation Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cart={cart}
        isDelivery={isDelivery}
        setIsDelivery={setIsDelivery}
        onOrderSuccess={handleOrderSuccess}
      />

      {/* Printable Estimate Receipt Modal */}
      <EstimateReceiptModal
        order={activeReceiptOrder}
        onClose={() => setActiveReceiptOrder(null)}
      />

      {/* Official Order Confirmation Modal */}
      <OrderConfirmationModal
        order={activeConfirmationOrder}
        onClose={() => setActiveConfirmationOrder(null)}
        onViewReceipt={() => {
          setActiveReceiptOrder(activeConfirmationOrder);
          setActiveConfirmationOrder(null);
        }}
        onGoToKitchenKDS={() => {
          setActiveConfirmationOrder(null);
          switchSubTab('kitchen');
        }}
      />

    </div>
  );
}
