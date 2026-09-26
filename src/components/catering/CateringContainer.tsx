import { useState, useEffect } from 'react';
import { 
  UtensilsCrossed, 
  Cake as CakeIcon, 
  Package, 
  ChefHat, 
  Lock,
  ShoppingBag
} from 'lucide-react';
import BrandHeader from './BrandHeader';
import CakeBrandHeader from './CakeBrandHeader';
import MenuOrderGrid from './MenuOrderGrid';
import CakeConfigurator from './CakeConfigurator';
import TiffinOrderView from './TiffinOrderView';
import CostEstimatorSidebar from './CostEstimatorSidebar';
import CheckoutModal from './CheckoutModal';
import EstimateReceiptModal from './EstimateReceiptModal';
import OrderConfirmationModal from './OrderConfirmationModal';
import KitchenKDS from './KitchenKDS';
import ErrorBoundary from '../common/ErrorBoundary';
import type { CartItem, CateringOrder, MenuItem, TraySize } from '../../types/catering';

const CART_STORAGE_KEY = 'bbw_catering_cart_v1';

type SubTab = 'order' | 'cake' | 'tiffin' | 'kitchen';

export default function CateringContainer() {
  // Sub-navigation: 'order' (/catering/food), 'cake' (/catering/cake), 'tiffin' (/catering/tiffin), 'kitchen' (/catering/kitchen)
  const [subTab, setSubTab] = useState<SubTab>(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname.toLowerCase();
      if (path.includes('/kitchen')) return 'kitchen';
      if (path.includes('/cake')) return 'cake';
      if (path.includes('/tiffin')) return 'tiffin';
      if (path.includes('/order')) {
        // Upgrade legacy /catering/order to /catering/food in address bar
        window.history.replaceState(null, '', '/catering/food');
      }
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

  // If cart contains any tiffin item, enforce pickup only (no delivery)
  const hasTiffinInCart = cart.some(i => i.category === 'tiffin');
  useEffect(() => {
    if (hasTiffinInCart && isDelivery) {
      setIsDelivery(false);
    }
  }, [hasTiffinInCart, isDelivery]);

  // Sync route changes with browser history
  const switchSubTab = (tab: SubTab) => {
    if (tab === 'kitchen') {
      if (typeof window !== 'undefined') {
        window.history.pushState(null, '', '/catering/kitchen');
        window.dispatchEvent(new PopStateEvent('popstate'));
      }
      return;
    }
    setSubTab(tab);
    if (typeof window !== 'undefined') {
      let newPath = '/catering/food';
      if (tab === 'cake') newPath = '/catering/cake';
      else if (tab === 'tiffin') newPath = '/catering/tiffin';

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
      } else if (path.includes('/cake')) {
        setSubTab('cake');
      } else if (path.includes('/tiffin')) {
        setSubTab('tiffin');
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
    selectionType: TraySize | 'pack_30' | 'pieces' | 'gallon' | 'cake_custom' | 'tiffin_single' | 'tiffin_family' | 'tiffin_weekly' | 'container_16oz',
    quantity: number,
    selectionLabel: string,
    unitPrice: number,
    customNotes?: string
  ) => {
    setCart(prev => {
      const existingIdx = prev.findIndex(
        item => item.menuItemId === menuItem.id && item.selectionType === selectionType && (customNotes ? item.notes === customNotes : true)
      );

      if (quantity <= 0) {
        if (existingIdx !== -1) {
          return prev.filter((_, idx) => idx !== existingIdx);
        }
        return prev;
      }

      const updatedItem: CartItem = {
        id: customNotes 
          ? `${menuItem.id}-${selectionType}-${Date.now().toString(36)}` 
          : `${menuItem.id}-${selectionType}`,
        menuItemId: menuItem.id,
        name: menuItem.name,
        category: menuItem.category,
        categoryLabel: menuItem.categoryLabel,
        selectionType,
        selectionLabel,
        quantity,
        unitPrice,
        totalPrice: Math.round(unitPrice * quantity * 100) / 100,
        tier: menuItem.tier,
        allergens: menuItem.allergens,
        leadTimeHours: menuItem.leadTimeHours,
        notes: customNotes
      };

      if (existingIdx !== -1) {
        const copy = [...prev];
        copy[existingIdx] = updatedItem;
        return copy;
      } else {
        return [...prev, updatedItem];
      }
    });
  };

  // Add custom cake handler from CakeConfigurator
  const handleAddCakeFromConfigurator = (cakeData: {
    menuItemId: string;
    name: string;
    size: any;
    sizeLabel: string;
    category: string;
    categoryLabel: string;
    flavor: string;
    unitPrice: number;
    quantity: number;
    totalPrice: number;
    inscription: string;
    designNotes: string;
    requestCustomTheme: boolean;
    customThemeDetails?: string;
    isEggless?: boolean;
  }) => {
    const cakeMenuItem: MenuItem = {
      id: cakeData.menuItemId,
      name: cakeData.name,
      category: 'cakes',
      categoryLabel: 'Cakes & Specialty Bakes',
      description: `${cakeData.flavor} - ${cakeData.sizeLabel}${cakeData.isEggless ? ' (Eggless)' : ''}`,
      allergens: ['G', 'D'],
      pricingType: 'cake',
      leadTimeHours: 48,
      isSatvikAvailable: true
    };

    const noteSegments = [
      `Flavor: ${cakeData.flavor}`,
      cakeData.isEggless ? 'Dietary: 100% Eggless (Vegetarian on Request)' : 'Dietary: Standard Recipe',
      cakeData.inscription ? `Inscription: "${cakeData.inscription}"` : null,
      cakeData.requestCustomTheme 
        ? `Custom Theme: ${cakeData.customThemeDetails || 'Quote Requested'}` 
        : null,
      cakeData.designNotes ? `Notes: ${cakeData.designNotes}` : null
    ].filter(Boolean);

    handleUpdateCartItem(
      cakeMenuItem,
      'cake_custom',
      cakeData.quantity,
      cakeData.sizeLabel,
      cakeData.unitPrice,
      noteSegments.join(' | ')
    );
  };

  const handleRemoveCartItem = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
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

  // Cart counts by segment
  const cateringDishCount = cart.filter(i => i.category !== 'cakes' && i.category !== 'tiffin').reduce((s, i) => s + i.quantity, 0);
  const cakeCount = cart.filter(i => i.category === 'cakes').reduce((s, i) => s + i.quantity, 0);
  const tiffinCount = cart.filter(i => i.category === 'tiffin').reduce((s, i) => s + i.quantity, 0);
  const totalCartCount = cart.reduce((s, i) => s + i.quantity, 0);
  const totalCartAmount = cart.reduce((s, i) => s + i.totalPrice, 0);

  return (
    <div className="w-full bg-[#fbfbfa] min-h-screen font-sans selection:bg-[#775a19]/20 overflow-x-hidden">
      
      {/* ── 1. SUB-NAVIGATION BAR (Catering Order, Cake Order, Tiffin Order, Kitchen KDS) ── */}
      <div className="sticky top-[84px] z-30 bg-white border-b border-gray-200 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            
            <div className="flex items-center gap-2 overflow-x-auto py-1 scrollbar-none">
              <span className="font-serif font-bold text-xs uppercase tracking-widest text-[#00346f] hidden sm:inline mr-1">
                PORTAL:
              </span>
              
              <div className="flex items-center gap-1.5 bg-gray-100 p-1 rounded-xl">
                {/* 1. Food Order */}
                <button
                  type="button"
                  onClick={() => switchSubTab('order')}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
                    subTab === 'order'
                      ? 'bg-[#00346f] text-white shadow-xs'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <UtensilsCrossed className="w-3.5 h-3.5" />
                  <span>Food Order</span>
                  {cateringDishCount > 0 && (
                    <span className="w-4 h-4 rounded-full bg-[#ffdea5] text-[#00346f] text-[10px] flex items-center justify-center font-bold">
                      {cateringDishCount}
                    </span>
                  )}
                </button>

                {/* 2. Cake Order */}
                <button
                  type="button"
                  onClick={() => switchSubTab('cake')}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
                    subTab === 'cake'
                      ? 'bg-[#00346f] text-white shadow-xs'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <CakeIcon className="w-3.5 h-3.5" />
                  <span>Cake Order</span>
                  {cakeCount > 0 && (
                    <span className="w-4 h-4 rounded-full bg-[#ffdea5] text-[#00346f] text-[10px] flex items-center justify-center font-bold">
                      {cakeCount}
                    </span>
                  )}
                </button>

                {/* 3. Tiffin Order */}
                <button
                  type="button"
                  onClick={() => switchSubTab('tiffin')}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
                    subTab === 'tiffin'
                      ? 'bg-[#00346f] text-white shadow-xs'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Package className="w-3.5 h-3.5" />
                  <span>Tiffin Order</span>
                  {tiffinCount > 0 && (
                    <span className="w-4 h-4 rounded-full bg-[#ffdea5] text-[#00346f] text-[10px] flex items-center justify-center font-bold">
                      {tiffinCount}
                    </span>
                  )}
                </button>

                {/* 4. Kitchen KDS */}
                <button
                  type="button"
                  onClick={() => switchSubTab('kitchen')}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
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

            <div className="flex items-center gap-2 shrink-0">
              <div className="text-right text-[11px] text-gray-500 hidden xl:block mr-2">
                <span>Little Elm / Frisco, TX • Strict 24h/48h Notice</span>
              </div>
              <button
                type="button"
                onClick={() => setIsCheckoutOpen(true)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shrink-0 ${
                  totalCartCount > 0
                    ? 'bg-[#00346f] text-white hover:bg-[#00224d] shadow-sm ring-2 ring-[#ffdea5]/50'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                title={totalCartCount > 0 ? 'Click to proceed to checkout' : 'Cart is empty'}
              >
                <ShoppingBag className="w-3.5 h-3.5 text-[#ffdea5]" />
                <span>Checkout</span>
                {totalCartCount > 0 && (
                  <span className="font-serif font-black text-[#ffdea5] ml-0.5">
                    (${totalCartAmount.toFixed(2)})
                  </span>
                )}
              </button>
            </div>

          </div>
        </div>
      </div>

      {/* ── 2. SUB-TAB VIEWPORT ── */}
      {subTab === 'kitchen' ? (
        <KitchenKDS onBackToOrder={() => switchSubTab('order')} />
      ) : (
        <div className="space-y-8 pb-36 sm:pb-40">
          
          {/* SubTab-Specific Brand Headers */}
          {subTab === 'order' && (
            <BrandHeader onScrollToMenu={() => {
              const el = document.getElementById('catering-content-area');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }} />
          )}

          {subTab === 'cake' && (
            <CakeBrandHeader onScrollToConfigurator={() => {
              const el = document.getElementById('catering-content-area');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }} />
          )}

          {/* Main Full-Width Content Viewport */}
          <div id="catering-content-area" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="w-full">
              
              {/* SubTab 1: Food Order */}
              {subTab === 'order' && (
                <MenuOrderGrid
                  cart={cart}
                  onUpdateCartItem={handleUpdateCartItem}
                  onRemoveCartItem={handleRemoveCartItem}
                  onProceedToCheckout={() => setIsCheckoutOpen(true)}
                />
              )}

              {/* SubTab 2: Cake Order */}
              {subTab === 'cake' && (
                <div className="space-y-6">
                  <CakeConfigurator
                    onAddCake={handleAddCakeFromConfigurator}
                    cartCakes={cart.filter(i => i.category === 'cakes')}
                    onRemoveCake={handleRemoveCartItem}
                    onProceedToCheckout={() => setIsCheckoutOpen(true)}
                  />
                </div>
              )}

              {/* SubTab 3: Tiffin Order */}
              {subTab === 'tiffin' && (
                <TiffinOrderView
                  cart={cart}
                  onUpdateCartItem={handleUpdateCartItem}
                  onRemoveCartItem={handleRemoveCartItem}
                  onProceedToCheckout={() => setIsCheckoutOpen(true)}
                />
              )}

            </div>
          </div>

          {/* ── Unified Sticky Bottom Checkout Bar (Aligned at Screen Bottom) ── */}
          <CostEstimatorSidebar
            cart={cart}
            isDelivery={isDelivery}
            setIsDelivery={setIsDelivery}
            onClearCart={handleClearCart}
            onProceedToCheckout={() => setIsCheckoutOpen(true)}
            onRemoveItem={handleRemoveCartItem}
            activeSubTab={subTab}
          />

        </div>
      )}

      {/* ── 3. MODALS ── */}
      
      {/* Checkout & Lead-Time Validation Modal */}
      <ErrorBoundary fallbackTitle="Unable to load checkout window">
        <CheckoutModal
          isOpen={isCheckoutOpen}
          onClose={() => setIsCheckoutOpen(false)}
          cart={cart}
          isDelivery={isDelivery}
          setIsDelivery={setIsDelivery}
          onOrderSuccess={handleOrderSuccess}
        />
      </ErrorBoundary>

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
      />

    </div>
  );
}
