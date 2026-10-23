import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { TrayPricingHeader, CateringDifferentiators } from './BrandHeader';
import CakeBrandHeader from './CakeBrandHeader';
import CostEstimatorSidebar from './CostEstimatorSidebar';
import ErrorBoundary from '../common/ErrorBoundary';
import type { CartItem, CateringOrder, MenuItem, TraySize } from '../../types/catering';
import { fetchCalendarBlackouts } from '../../services/supabase';
import { getUpcomingDates, isDateSelectable, findFirstValidFulfillmentSlot } from '../../utils/centralTime';

// Code-split sub-tab components for instant page rendering
const MenuOrderGrid = React.lazy(() => import('./MenuOrderGrid'));
const CakeConfigurator = React.lazy(() => import('./CakeConfigurator'));
const TiffinOrderView = React.lazy(() => import('./TiffinOrderView'));
const CheckoutModal = React.lazy(() => import('./CheckoutModal'));
const EstimateReceiptModal = React.lazy(() => import('./EstimateReceiptModal'));
const OrderConfirmationModal = React.lazy(() => import('./OrderConfirmationModal'));

const CART_STORAGE_KEY = 'bbw_catering_cart_v1';

type SubTab = 'order' | 'cake' | 'tiffin';

export default function CateringContainer() {
  // Blackout dates list from Supabase
  const [blackoutDates, setBlackoutDates] = useState<string[]>([]);

  // Load blackout dates on mount
  useEffect(() => {
    fetchCalendarBlackouts().then(dates => setBlackoutDates(dates));
  }, []);

  // Upcoming 21-day schedule options
  const upcomingDates = useMemo(() => getUpcomingDates(21, false), []);

  // Global selected fulfillment date across all ordering sub-sections
  const [selectedGlobalDate, setSelectedGlobalDate] = useState<string>(() => {
    return upcomingDates[0]?.dateStr || '';
  });

  // Auto-set earliest valid date once blackouts load if initial date is blacked out
  useEffect(() => {
    if (blackoutDates.length > 0 && selectedGlobalDate && blackoutDates.includes(selectedGlobalDate)) {
      const firstValid = findFirstValidFulfillmentSlot(blackoutDates, []);
      if (firstValid?.dateStr) {
        setSelectedGlobalDate(firstValid.dateStr);
      }
    }
  }, [blackoutDates, selectedGlobalDate]);

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
    selectionType: TraySize | 'pack_30' | 'pieces' | 'gallon' | 'cake_custom' | 'tiffin_single' | 'tiffin_family' | 'tiffin_weekly' | 'container_8oz' | 'container_16oz',
    quantity: number,
    selectionLabel: string,
    unitPrice: number,
    customNotes?: string
  ) => {
    setCart(prev => {
      // Custom cakes can have multiple distinct configurations (different flavors/inscriptions) for the same tier+size
      const existingIdx = prev.findIndex(item =>
        selectionType === 'cake_custom'
          ? item.menuItemId === menuItem.id && item.selectionType === selectionType && item.notes === customNotes
          : item.menuItemId === menuItem.id && item.selectionType === selectionType
      );

      if (quantity <= 0) {
        if (existingIdx !== -1) {
          return prev.filter((_, idx) => idx !== existingIdx);
        }
        return prev;
      }

      const existingItem = existingIdx !== -1 ? prev[existingIdx] : null;
      const updatedItem: CartItem = {
        id: existingItem
          ? existingItem.id
          : selectionType === 'cake_custom' && customNotes
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
        return prev.map((item, idx) => (idx === existingIdx ? updatedItem : item));
      } else {
        return [...prev, updatedItem];
      }
    });
  };

  // Universal quantity stepper handler for cart drawer, checkout modal, tiffin summary, and cake list
  const handleChangeCartItemQuantity = (cartItemId: string, delta: number) => {
    setCart(prev => {
      const target = prev.find(i => i.id === cartItemId);
      if (!target) return prev;

      // Bread pieces have minimum piece rules (8 pcs for Extra Pav, 30 pcs for Poori/Naan/Roti)
      if (target.selectionType === 'pieces' && target.category === 'breads') {
        const isPav = target.menuItemId === 'bread-extra-pav' || target.name.toLowerCase().includes('pav');
        const minPieces = isPav ? 8 : 30;
        const step = isPav ? 4 : 5;
        const nextQty = delta > 0 ? target.quantity + step : target.quantity - step;

        if (nextQty < minPieces) {
          return prev.filter(i => i.id !== cartItemId);
        }

        return prev.map(i =>
          i.id === cartItemId
            ? {
                ...i,
                quantity: nextQty,
                selectionLabel: `${nextQty} pieces ($${i.unitPrice.toFixed(2)}/pc)`,
                totalPrice: Math.round(i.unitPrice * nextQty * 100) / 100
              }
            : i
        );
      }

      const nextQty = target.quantity + delta;
      if (nextQty <= 0) {
        return prev.filter(i => i.id !== cartItemId);
      }

      let updatedNotes = target.notes;
      if (updatedNotes) {
        updatedNotes = updatedNotes
          .replace(/\(Qty:\s*\d+\)/i, `(Qty: ${nextQty})`)
          .replace(/Total:\s*\d+\s*hot meals/i, `Total: ${5 * nextQty} hot meals`);
      }

      return prev.map(i =>
        i.id === cartItemId
          ? {
              ...i,
              quantity: nextQty,
              totalPrice: Math.round(i.unitPrice * nextQty * 100) / 100,
              notes: updatedNotes
            }
          : i
      );
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
      <div className="sticky top-0 z-40 w-full bg-white/90 backdrop-blur-md border-b border-[#D4AF37]/30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between min-h-[52px] sm:min-h-[56px] py-1.5 sm:py-2">
            
            <div className="flex items-center gap-2 overflow-x-auto py-1 scrollbar-none w-full sm:w-auto">
              <span className="font-serif font-bold text-xs uppercase tracking-widest text-[#0B192C] hidden sm:inline mr-1">
                EXPERIENCE:
              </span>
              
              {/* Mobile: 3 equal-width segments with short labels; Desktop: full labels */}
              <div className="grid grid-cols-3 sm:flex items-center gap-1 sm:gap-1.5 bg-[#FAF8F5]/90 p-1 sm:p-1.5 rounded-2xl border border-[#D4AF37]/40 shadow-inner w-full sm:w-auto">
                {/* 1. Daily Tiffin */}
                <button
                  type="button"
                  onClick={() => switchSubTab('tiffin')}
                  className={`inline-flex items-center justify-center gap-1.5 sm:gap-2 min-h-[44px] px-2.5 sm:px-4 py-2 rounded-xl text-xs sm:text-xs font-bold uppercase tracking-wide sm:tracking-wider transition-all cursor-pointer whitespace-nowrap ${
                    subTab === 'tiffin'
                      ? 'bg-[#0B192C] text-white shadow-md ring-1 ring-[#D4AF37]'
                      : 'text-[#1E293B] hover:text-[#0B192C] hover:bg-white'
                  }`}
                >
                  <span className="text-base leading-none">🍱</span>
                  <span className="sm:hidden">Tiffin</span>
                  <span className="hidden sm:inline">Daily Tiffin</span>
                  {tiffinCount > 0 && (
                    <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-[#D4AF37] text-[#0B192C] text-[11px] flex items-center justify-center font-black">
                      {tiffinCount}
                    </span>
                  )}
                </button>

                {/* 2. Party Catering */}
                <button
                  type="button"
                  onClick={() => switchSubTab('order')}
                  className={`inline-flex items-center justify-center gap-1.5 sm:gap-2 min-h-[44px] px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs sm:text-xs font-bold uppercase tracking-wide sm:tracking-wider transition-all cursor-pointer whitespace-nowrap ${
                    subTab === 'order'
                      ? 'bg-[#0B192C] text-white shadow-md ring-1 ring-[#D4AF37]'
                      : 'text-[#1E293B] hover:text-[#0B192C] hover:bg-white'
                  }`}
                >
                  <span className="text-base leading-none">🥘</span>
                  <span className="sm:hidden">Catering</span>
                  <span className="hidden sm:inline">Party Catering</span>
                  {cateringDishCount > 0 && (
                    <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-[#D4AF37] text-[#0B192C] text-[11px] flex items-center justify-center font-black">
                      {cateringDishCount}
                    </span>
                  )}
                </button>

                {/* 3. Custom Cakes */}
                <button
                  type="button"
                  onClick={() => switchSubTab('cake')}
                  className={`inline-flex items-center justify-center gap-1.5 sm:gap-2 min-h-[44px] px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs sm:text-xs font-bold uppercase tracking-wide sm:tracking-wider transition-all cursor-pointer whitespace-nowrap ${
                    subTab === 'cake'
                      ? 'bg-[#0B192C] text-white shadow-md ring-1 ring-[#D4AF37]'
                      : 'text-[#1E293B] hover:text-[#0B192C] hover:bg-white'
                  }`}
                >
                  <span className="text-base leading-none">🎂</span>
                  <span className="sm:hidden">Cakes</span>
                  <span className="hidden sm:inline">Custom Cakes</span>
                  {cakeCount > 0 && (
                    <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-[#D4AF37] text-[#0B192C] text-[11px] flex items-center justify-center font-black">
                      {cakeCount}
                    </span>
                  )}
                </button>

              </div>
            </div>

            <div className="hidden lg:flex items-center gap-2 shrink-0">
              <span className="text-xs text-gray-600 font-medium bg-[#D4AF37]/15 px-3 py-1.5 rounded-full border border-[#D4AF37]/30">
                Frisco &amp; Little Elm, TX • Fresh Daily Cooking
              </span>
            </div>

          </div>
        </div>

        {/* ── UNIFIED DAY & SCHEDULE RAIL (For Party Catering & Custom Cakes; Tiffin uses native Active Day Menu selector) ── */}
        {subTab !== 'tiffin' && (
          <div className="w-full bg-[#FAF8F5] border-t border-b border-[#D4AF37]/30 py-2 sm:py-2.5 px-3 sm:px-4 shadow-2xs">
            <div className="max-w-7xl mx-auto flex items-center gap-2 sm:gap-3">
              <div className="hidden md:flex flex-col shrink-0 pr-3 border-r border-[#D4AF37]/30">
                <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#0B192C]">
                  SCHEDULE RAIL
                </span>
                <span className="text-xs font-medium text-gray-600">
                  Target Fulfillment Date
                </span>
              </div>

              <div className="flex gap-2 overflow-x-auto py-0.5 scrollbar-none w-full">
                {upcomingDates.map(opt => {
                  const isSelected = selectedGlobalDate === opt.dateStr;
                  const isBlackout = blackoutDates.includes(opt.dateStr);
                  const check = isDateSelectable(opt.dateStr, blackoutDates, cart, subTab);

                  let badgeText = 'Open';
                  let badgeStyle = 'bg-emerald-100 text-emerald-800 border border-emerald-200';
                  if (isBlackout) {
                    badgeText = 'Sold Out';
                    badgeStyle = 'bg-amber-100 text-amber-900 border border-amber-300 font-bold';
                  } else if (!check.selectable) {
                    badgeText = 'Closed';
                    badgeStyle = 'bg-rose-100 text-rose-800 border border-rose-200';
                  }

                  return (
                    <button
                      key={opt.dateStr}
                      type="button"
                      onClick={() => setSelectedGlobalDate(opt.dateStr)}
                      className={`flex flex-col items-center justify-center min-w-[68px] sm:min-w-[80px] py-1.5 px-2 rounded-xl border text-center transition-all cursor-pointer shrink-0 ${
                        isSelected
                          ? 'bg-[#0B192C] text-white border-[#0B192C] shadow-md ring-2 ring-[#D4AF37]'
                          : isBlackout
                          ? 'bg-amber-50/80 border-amber-200 text-gray-800 hover:bg-amber-100'
                          : !check.selectable
                          ? 'bg-gray-100 border-gray-200 text-gray-400 opacity-60'
                          : 'bg-white hover:bg-white/90 border-gray-250 text-gray-800 shadow-2xs'
                      }`}
                      title={!check.selectable ? check.reason : `Set target date to ${opt.label}`}
                    >
                      <span className={`text-[10px] sm:text-[11px] uppercase font-bold tracking-wider leading-tight ${isSelected ? 'text-[#D4AF37]' : 'text-gray-500'}`}>
                        {opt.dayOfWeek}
                      </span>
                      <span className="text-xs sm:text-sm font-black mt-0.5 whitespace-nowrap leading-tight">
                        {opt.label}
                      </span>
                      <span className={`text-[10px] uppercase tracking-wider font-extrabold px-1.5 py-0.5 rounded-full mt-1 ${
                        badgeText === 'Open' ? 'hidden sm:inline-block' : 'inline-block'
                      } ${
                        isSelected ? 'bg-[#D4AF37] text-[#0B192C]' : badgeStyle
                      }`}>
                        {badgeText}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── 2. SUB-TAB VIEWPORT ── */}
      <div className="space-y-8 pb-36 sm:pb-40">
          
          {/* Main Full-Width Content Viewport */}
          <div id="catering-content-area" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-48 sm:scroll-mt-52">
            <div className="w-full">
              
              <Suspense fallback={
                <div className="min-h-[40vh] flex flex-col items-center justify-center p-8 space-y-3">
                  <div className="w-8 h-8 border-3 border-[#00346f] border-t-transparent rounded-full animate-spin" />
                  <span className="text-xs font-bold uppercase tracking-wider text-[#00346f]">Loading Menu Details...</span>
                </div>
              }>
                {/* SubTab 1: Catering (Starts with Tray Pricing Tiers, Menu Grid, 4 Differentiators at end) */}
                {subTab === 'order' && (
                  <div className="space-y-6">
                    {blackoutDates.includes(selectedGlobalDate) && (
                      <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-300 text-amber-950 text-xs font-medium flex items-center justify-between gap-3 shadow-2xs">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-amber-900">⚠️ Date Oversold:</span>
                          <span>Party catering is closed for {selectedGlobalDate}. Please select an open date on the schedule rail above.</span>
                        </div>
                        <span className="text-[11px] font-bold uppercase tracking-wider bg-amber-200 text-amber-900 px-2.5 py-0.5 rounded-full border border-amber-400 shrink-0">
                          Capacity Full
                        </span>
                      </div>
                    )}

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
                    {blackoutDates.includes(selectedGlobalDate) && (
                      <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-300 text-amber-950 text-xs font-medium flex items-center justify-between gap-3 shadow-2xs">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-amber-900">⚠️ Date Oversold:</span>
                          <span>Custom cake ordering is closed for {selectedGlobalDate}. Please select an open date on the schedule rail above.</span>
                        </div>
                        <span className="text-[11px] font-bold uppercase tracking-wider bg-amber-200 text-amber-900 px-2.5 py-0.5 rounded-full border border-amber-400 shrink-0">
                          Capacity Full
                        </span>
                      </div>
                    )}

                    <CakeConfigurator
                      onAddCake={handleAddCakeFromConfigurator}
                      cartCakes={cart.filter(i => i.category === 'cakes')}
                      onRemoveCake={handleRemoveCartItem}
                      onUpdateCakeQuantity={handleChangeCartItemQuantity}
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
                    selectedGlobalDate={selectedGlobalDate}
                    onUpdateCartItem={handleUpdateCartItem}
                    onRemoveCartItem={handleRemoveCartItem}
                    onChangeCartItemQuantity={handleChangeCartItemQuantity}
                    onProceedToCheckout={() => setIsCheckoutOpen(true)}
                  />
                )}
              </Suspense>

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
            onUpdateItemQuantity={handleChangeCartItemQuantity}
            activeSubTab={subTab}
          />

        </div>

      {/* ── 3. MODALS ── */}
      
      {/* Checkout & Lead-Time Validation Modal */}
      <ErrorBoundary fallbackTitle="Unable to load checkout window">
        <Suspense fallback={null}>
          <CheckoutModal
            isOpen={isCheckoutOpen}
            onClose={() => setIsCheckoutOpen(false)}
            cart={cart}
            isDelivery={isDelivery}
            setIsDelivery={setIsDelivery}
            onOrderSuccess={handleOrderSuccess}
            blackoutDates={blackoutDates}
            initialFulfillmentDate={selectedGlobalDate}
            subTab={subTab}
            onRemoveItem={handleRemoveCartItem}
            onUpdateItemQuantity={handleChangeCartItemQuantity}
          />
        </Suspense>
      </ErrorBoundary>

      {/* Printable Estimate Receipt Modal */}
      <Suspense fallback={null}>
        <EstimateReceiptModal
          order={activeReceiptOrder}
          onClose={() => setActiveReceiptOrder(null)}
        />
      </Suspense>

      {/* Official Order Confirmation Modal */}
      <Suspense fallback={null}>
        <OrderConfirmationModal
          order={activeConfirmationOrder}
          onClose={() => setActiveConfirmationOrder(null)}
          onViewReceipt={() => {
            setActiveReceiptOrder(activeConfirmationOrder);
            setActiveConfirmationOrder(null);
          }}
        />
      </Suspense>

    </div>
  );
}
