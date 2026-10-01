import { useState, useEffect } from 'react';
import { TrayPricingHeader, CateringDifferentiators } from './BrandHeader';
import CakeBrandHeader from './CakeBrandHeader';
import MenuOrderGrid from './MenuOrderGrid';
import CakeConfigurator from './CakeConfigurator';
import TiffinOrderView from './TiffinOrderView';
import CostEstimatorSidebar from './CostEstimatorSidebar';
import CheckoutModal from './CheckoutModal';
import EstimateReceiptModal from './EstimateReceiptModal';
import OrderConfirmationModal from './OrderConfirmationModal';
import ErrorBoundary from '../common/ErrorBoundary';
import type { CartItem, CateringOrder, MenuItem, TraySize } from '../../types/catering';

const CART_STORAGE_KEY = 'bbw_catering_cart_v1';

type SubTab = 'order' | 'cake' | 'tiffin';

export default function CateringContainer() {
  // Sub-navigation: 'order' (/catering/food), 'cake' (/catering/cake), 'tiffin' (/catering/tiffin)
  const [subTab, setSubTab] = useState<SubTab>(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname.toLowerCase();
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
    setSubTab(tab);
    if (typeof window !== 'undefined') {
      let newPath = '/catering/food';
      if (tab === 'cake') newPath = '/catering/cake';
      else if (tab === 'tiffin') newPath = '/catering/tiffin';

      window.history.pushState(null, '', newPath);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Sync route changes with browser history and on mount
  useEffect(() => {
    const syncRoute = () => {
      const path = window.location.pathname.toLowerCase();
      if (path.includes('/cake')) {
        setSubTab('cake');
      } else if (path.includes('/tiffin')) {
        setSubTab('tiffin');
      } else if (path.includes('/food') || path.includes('/order')) {
        setSubTab('order');
      }
    };
    syncRoute();
    window.addEventListener('popstate', syncRoute);
    return () => window.removeEventListener('popstate', syncRoute);
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

  return (
    <div className="w-full bg-[#FAF8F5] min-h-screen font-sans selection:bg-[#D4AF37]/20 overflow-x-hidden text-[#1E293B]">
      
      {/* ── 1. SUB-NAVIGATION BAR (Top Experience Switcher: [ 🍱 Daily Tiffin | 🥘 Party Catering | 🎂 Custom Cakes ]) ── */}
      <div className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-[#D4AF37]/30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between min-h-[56px] py-2">
            
            <div className="flex items-center gap-2 overflow-x-auto py-1 scrollbar-none w-full sm:w-auto">
              <span className="font-serif font-bold text-xs uppercase tracking-widest text-[#0B192C] hidden sm:inline mr-1">
                EXPERIENCE:
              </span>
              
              <div className="flex items-center gap-1.5 bg-[#FAF8F5] p-1.5 rounded-2xl border border-[#D4AF37]/40 shadow-inner">
                {/* 1. Daily Tiffin */}
                <button
                  type="button"
                  onClick={() => switchSubTab('tiffin')}
                  className={`inline-flex items-center gap-2 min-h-[42px] px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
                    subTab === 'tiffin'
                      ? 'bg-[#0B192C] text-white shadow-md ring-1 ring-[#D4AF37]'
                      : 'text-[#1E293B] hover:text-[#0B192C] hover:bg-white'
                  }`}
                >
                  <span className="text-base leading-none">🍱</span>
                  <span>Daily Tiffin</span>
                  {tiffinCount > 0 && (
                    <span className="w-4 h-4 rounded-full bg-[#D4AF37] text-[#0B192C] text-[10px] flex items-center justify-center font-black">
                      {tiffinCount}
                    </span>
                  )}
                </button>

                {/* 2. Party Catering */}
                <button
                  type="button"
                  onClick={() => switchSubTab('order')}
                  className={`inline-flex items-center gap-2 min-h-[42px] px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
                    subTab === 'order'
                      ? 'bg-[#0B192C] text-white shadow-md ring-1 ring-[#D4AF37]'
                      : 'text-[#1E293B] hover:text-[#0B192C] hover:bg-white'
                  }`}
                >
                  <span className="text-base leading-none">🥘</span>
                  <span>Party Catering</span>
                  {cateringDishCount > 0 && (
                    <span className="w-4 h-4 rounded-full bg-[#D4AF37] text-[#0B192C] text-[10px] flex items-center justify-center font-black">
                      {cateringDishCount}
                    </span>
                  )}
                </button>

                {/* 3. Custom Cakes */}
                <button
                  type="button"
                  onClick={() => switchSubTab('cake')}
                  className={`inline-flex items-center gap-2 min-h-[42px] px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
                    subTab === 'cake'
                      ? 'bg-[#0B192C] text-white shadow-md ring-1 ring-[#D4AF37]'
                      : 'text-[#1E293B] hover:text-[#0B192C] hover:bg-white'
                  }`}
                >
                  <span className="text-base leading-none">🎂</span>
                  <span>Custom Cakes</span>
                  {cakeCount > 0 && (
                    <span className="w-4 h-4 rounded-full bg-[#D4AF37] text-[#0B192C] text-[10px] flex items-center justify-center font-black">
                      {cakeCount}
                    </span>
                  )}
                </button>

              </div>
            </div>

            <div className="hidden lg:flex items-center gap-2 shrink-0">
              <span className="text-[11px] text-gray-500 font-medium bg-[#D4AF37]/10 px-3 py-1.5 rounded-full border border-[#D4AF37]/20">
                Frisco &amp; Little Elm, TX • Fresh Daily Cooking
              </span>
            </div>

          </div>
        </div>
      </div>

      {/* ── 2. SUB-TAB VIEWPORT ── */}
      <div className="space-y-8 pb-36 sm:pb-40">
          
          {/* Main Full-Width Content Viewport */}
          <div id="catering-content-area" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-48 sm:scroll-mt-52">
            <div className="w-full">
              
              {/* SubTab 1: Catering (Starts with Tray Pricing Tiers, Menu Grid, 4 Differentiators at end) */}
              {subTab === 'order' && (
                <div className="space-y-6">
                  <TrayPricingHeader />
                  <MenuOrderGrid
                    cart={cart}
                    onUpdateCartItem={handleUpdateCartItem}
                    onRemoveCartItem={handleRemoveCartItem}
                    onProceedToCheckout={() => setIsCheckoutOpen(true)}
                  />
                  <CateringDifferentiators />
                </div>
              )}

              {/* SubTab 2: Cake Order (Starts directly from CakeConfigurator, 4 Differentiators at end) */}
              {subTab === 'cake' && (
                <div className="space-y-6">
                  <CakeConfigurator
                    onAddCake={handleAddCakeFromConfigurator}
                    cartCakes={cart.filter(i => i.category === 'cakes')}
                    onRemoveCake={handleRemoveCartItem}
                    onProceedToCheckout={() => setIsCheckoutOpen(true)}
                  />
                  {/* 4 Differentiators at end of page */}
                  <CakeBrandHeader />
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
