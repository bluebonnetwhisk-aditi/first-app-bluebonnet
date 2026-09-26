import React, { useState, useEffect, useMemo } from 'react';
import { 
  Lock, 
  ChefHat, 
  Clock, 
  Calendar as CalendarIcon, 
  Phone, 
  Truck, 
  Store, 
  CheckCircle2, 
  RefreshCw, 
  Printer, 
  AlertTriangle, 
  X,
  ArrowRight,
  Package,
  DollarSign,
  KeyRound,
  Ban,
  FileEdit,
  ImageIcon
} from 'lucide-react';
import type { CateringOrder, OrderStatus } from '../../types/catering';
import { getCentralTimeNow, getUpcomingDates } from '../../utils/centralTime';
import { fetchOrders, updateOrderStatus, subscribeToOrders } from '../../services/supabase';
import KDSBlackoutManager from './KDSBlackoutManager';
import KDSEditOrderModal from './KDSEditOrderModal';
import KDSTiffinMenuModal from './KDSTiffinMenuModal';

interface KitchenKDSProps {
  onBackToOrder?: () => void;
}

const MASTER_PIN_STORAGE_KEY = 'bbw_kds_master_pin_v1';
const DEFAULT_INITIAL_PIN = '031686';
const PIN_STORAGE_KEY = 'bbw_kds_unlocked_session';

export default function KitchenKDS({ onBackToOrder }: KitchenKDSProps) {
  // Authentication PIN state
  const [masterPin, setMasterPin] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(MASTER_PIN_STORAGE_KEY);
      if (saved) return saved;
      localStorage.setItem(MASTER_PIN_STORAGE_KEY, DEFAULT_INITIAL_PIN);
      return DEFAULT_INITIAL_PIN;
    }
    return DEFAULT_INITIAL_PIN;
  });

  const [isUnlocked, setIsUnlocked] = useState<boolean>(() => {
    return sessionStorage.getItem(PIN_STORAGE_KEY) === 'true';
  });
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);

  // Change PIN modal state
  const [showChangePinModal, setShowChangePinModal] = useState(false);
  const [currentPinInput, setCurrentPinInput] = useState('');
  const [newPinInput, setNewPinInput] = useState('');
  const [confirmPinInput, setConfirmPinInput] = useState('');
  const [pinChangeError, setPinChangeError] = useState('');
  const [pinChangeSuccess, setPinChangeSuccess] = useState(false);

  // Date Filter state: Defaults to today in America/Chicago
  const { dateStr: todayDateStr } = getCentralTimeNow();
  const [selectedDate, setSelectedDate] = useState<string>(todayDateStr);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Orders and loading
  const [orders, setOrders] = useState<CateringOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Kitchen Prep Sheet Modal
  const [showPrepSheet, setShowPrepSheet] = useState(false);

  // Blackout Dates Manager Modal
  const [showBlackoutModal, setShowBlackoutModal] = useState(false);

  // Edit Order Items & Pricing Modal
  const [editingOrder, setEditingOrder] = useState<CateringOrder | null>(null);

  // Weekly Tiffin Flyer & Specials Modal
  const [showTiffinModal, setShowTiffinModal] = useState(false);

  // Load orders
  const loadOrders = async () => {
    setIsRefreshing(true);
    try {
      const data = await fetchOrders(selectedDate);
      setOrders(data);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (isUnlocked) {
      loadOrders();
      // Subscribe to Realtime Postgres Changes
      const unsubscribe = subscribeToOrders(() => {
        loadOrders();
      });
      return () => {
        unsubscribe();
      };
    }
  }, [isUnlocked, selectedDate]);

  // Handle PIN entry
  const handlePinSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (pinInput.trim() === masterPin) {
      setIsUnlocked(true);
      sessionStorage.setItem(PIN_STORAGE_KEY, 'true');
      setPinError(false);
      setPinInput('');
    } else {
      setPinError(true);
      setPinInput('');
    }
  };

  // Handle PIN Update
  const handleChangePin = (e: React.FormEvent) => {
    e.preventDefault();
    setPinChangeError('');

    if (currentPinInput.trim() !== masterPin) {
      setPinChangeError('Current PIN is incorrect.');
      return;
    }

    const cleanNew = newPinInput.trim();
    if (cleanNew.length < 4 || cleanNew.length > 8) {
      setPinChangeError('New PIN must be between 4 and 8 digits.');
      return;
    }

    if (cleanNew !== confirmPinInput.trim()) {
      setPinChangeError('New PIN and Confirmation do not match.');
      return;
    }

    // Persist new PIN
    setMasterPin(cleanNew);
    if (typeof window !== 'undefined') {
      localStorage.setItem(MASTER_PIN_STORAGE_KEY, cleanNew);
    }

    setPinChangeSuccess(true);
    setCurrentPinInput('');
    setNewPinInput('');
    setConfirmPinInput('');
    setTimeout(() => {
      setShowChangePinModal(false);
      setPinChangeSuccess(false);
    }, 1500);
  };

  const handleLock = () => {
    setIsUnlocked(false);
    sessionStorage.removeItem(PIN_STORAGE_KEY);
  };

  // Status transition handler
  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    // Optimistic UI update
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    await updateOrderStatus(orderId, newStatus);
  };

  // Filtered orders list
  const activeOrders = useMemo(() => {
    return orders.filter(o => {
      if (statusFilter === 'all') return true;
      return o.status === statusFilter;
    });
  }, [orders, statusFilter]);

  // KPI Header Calculations
  // Total Orders Today (excluding cancelled)
  const nonCancelledOrders = orders.filter(o => o.status !== 'cancelled');
  const totalOrdersToday = nonCancelledOrders.length;

  // Total Trays to Prep (Sum of 1/3, Half, Full across all active orders)
  const totalTraysToPrep = nonCancelledOrders.reduce((sum, order) => {
    const traysInOrder = order.items
      .filter(item => item.selectionType === 'third' || item.selectionType === 'half' || item.selectionType === 'full')
      .reduce((sub, item) => sub + item.quantity, 0);
    return sum + traysInOrder;
  }, 0);

  // Total Today's Revenue ($) (excluding cancelled)
  const totalTodayRevenue = nonCancelledOrders.reduce((sum, order) => sum + order.total_amount, 0);

  // Aggregated Prep Sheet Data
  const prepSheetSummary = useMemo(() => {
    const map = new Map<string, {
      name: string;
      category: string;
      tier?: string;
      thirdCount: number;
      halfCount: number;
      fullCount: number;
      packsCount: number;
      gallonsCount: number;
      cakesCount: number;
    }>();

    nonCancelledOrders.forEach(order => {
      order.items.forEach(item => {
        const key = item.menuItemId;
        if (!map.has(key)) {
          map.set(key, {
            name: item.name,
            category: item.categoryLabel,
            tier: item.tier,
            thirdCount: 0,
            halfCount: 0,
            fullCount: 0,
            packsCount: 0,
            gallonsCount: 0,
            cakesCount: 0
          });
        }
        const record = map.get(key)!;
        if (item.selectionType === 'third') record.thirdCount += item.quantity;
        else if (item.selectionType === 'half') record.halfCount += item.quantity;
        else if (item.selectionType === 'full') record.fullCount += item.quantity;
        else if (item.selectionType === 'pack_30') record.packsCount += item.quantity;
        else if (item.selectionType === 'gallon') record.gallonsCount += item.quantity;
        else if (item.selectionType === 'cake_custom') record.cakesCount += item.quantity;
      });
    });

    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [nonCancelledOrders]);

  const upcomingDateOptions = getUpcomingDates(7);

  // ── PIN AUTHENTICATION MODAL ──
  if (!isUnlocked) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4 bg-[#fbfbfa] font-sans">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-[#775a19]/20 p-8 text-center animate-fade-in">
          <div className="w-16 h-16 rounded-full bg-[#00346f]/10 text-[#00346f] flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8" />
          </div>

          <h2 className="font-serif text-2xl font-bold text-[#00346f]">
            Kitchen KDS Protected
          </h2>
          <p className="text-xs text-gray-500 mt-1 mb-6">
            Authorized BlueBonnet Whisk kitchen staff only. Please enter your kitchen access PIN.
          </p>

          <form onSubmit={handlePinSubmit} className="space-y-4">
            <div>
              <input
                type="password"
                maxLength={8}
                autoFocus
                placeholder="••••••"
                value={pinInput}
                onChange={(e) => {
                  setPinInput(e.target.value.replace(/\D/g, ''));
                  setPinError(false);
                }}
                className={`w-52 text-center text-3xl font-mono tracking-widest py-3 border rounded-xl focus:outline-none focus:ring-2 ${
                  pinError 
                    ? 'border-rose-500 focus:ring-rose-200 bg-rose-50' 
                    : 'border-gray-300 focus:ring-[#00346f]/20 focus:border-[#00346f]'
                }`}
              />
              {pinError && (
                <p className="text-xs text-rose-600 mt-2 font-semibold">
                  Incorrect PIN. Please try again.
                </p>
              )}
            </div>

            {/* Quick keypad for touch tablets */}
            <div className="grid grid-cols-3 gap-2 max-w-[220px] mx-auto pt-2">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 'Clear', 0, 'Enter'].map((val, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    if (val === 'Clear') setPinInput('');
                    else if (val === 'Enter') handlePinSubmit();
                    else if (typeof val === 'number') {
                      if (pinInput.length < 8) setPinInput(prev => prev + val);
                    }
                  }}
                  className="py-2.5 rounded-lg bg-gray-50 hover:bg-gray-150 border border-gray-200 text-sm font-bold text-gray-800 transition-colors cursor-pointer"
                >
                  {val}
                </button>
              ))}
            </div>

            <div className="pt-4 flex flex-col gap-2">
              <button
                type="submit"
                className="w-full bg-[#00346f] hover:bg-[#00224d] text-white py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-md cursor-pointer"
              >
                Unlock KDS Screen
              </button>
              {onBackToOrder && (
                <button
                  type="button"
                  onClick={onBackToOrder}
                  className="text-xs text-gray-500 hover:text-gray-800 pt-2 underline cursor-pointer"
                >
                  Return to Food Order Form
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    );
  }

  // ── UNLOCKED KITCHEN DISPLAY SCREEN (KDS) ──
  return (
    <div className="min-h-screen bg-[#f7f8fa] p-4 sm:p-6 lg:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* ── TOP NAV & CONTROLS ── */}
        <div className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-[#00346f] text-white flex items-center justify-center shadow-sm">
              <ChefHat className="w-6 h-6 text-[#ffdea5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-serif text-xl sm:text-2xl font-bold text-[#00346f]">
                  Desi Dabba Kitchen Display (KDS)
                </h1>
                <span className="flex items-center gap-1 bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Live Sync
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                Real-time Supabase order pipeline &amp; prep orchestration • Central Time (`America/Chicago`)
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setShowPrepSheet(true)}
              className="inline-flex items-center gap-1.5 bg-[#775a19] hover:bg-[#5e4612] text-white px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-xs cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Kitchen Prep Sheet</span>
            </button>

            <button
              onClick={() => {
                setShowChangePinModal(true);
                setCurrentPinInput('');
                setNewPinInput('');
                setConfirmPinInput('');
                setPinChangeError('');
                setPinChangeSuccess(false);
              }}
              className="inline-flex items-center gap-1.5 border border-amber-300 hover:bg-amber-50 text-amber-900 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer"
              title="Change Kitchen Access PIN"
            >
              <KeyRound className="w-3.5 h-3.5 text-amber-700" />
              <span>Change PIN</span>
            </button>

            <button
              onClick={() => setShowTiffinModal(true)}
              className="inline-flex items-center gap-1.5 border border-purple-300 hover:bg-purple-50 text-purple-900 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer"
              title="Upload / Update Weekly Tiffin Menu Flyer & Saturday Specials"
            >
              <ImageIcon className="w-3.5 h-3.5 text-purple-700" />
              <span>Tiffin Flyer &amp; Specials</span>
            </button>

            <button
              onClick={() => setShowBlackoutModal(true)}
              className="inline-flex items-center gap-1.5 border border-rose-300 hover:bg-rose-50 text-rose-900 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer"
              title="Manage Kitchen Blackout Dates & Recurring Schedule"
            >
              <Ban className="w-3.5 h-3.5 text-rose-700" />
              <span>Blackout Dates</span>
            </button>

            <button
              onClick={loadOrders}
              disabled={isRefreshing}
              className="inline-flex items-center gap-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer"
              title="Refresh Orders"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>

            <button
              onClick={handleLock}
              className="inline-flex items-center gap-1.5 border border-gray-300 hover:bg-gray-100 text-gray-600 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer"
              title="Lock Screen"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Lock</span>
            </button>
          </div>
        </div>

        {/* ── REAL-TIME KPI HEADER ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          
          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs flex items-center gap-4">
            <div className="p-3 rounded-xl bg-blue-50 text-[#00346f]">
              <Package className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
                Total Orders ({selectedDate === todayDateStr ? 'Today' : selectedDate})
              </span>
              <div className="font-serif text-2xl sm:text-3xl font-bold text-gray-900 mt-0.5">
                {totalOrdersToday}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs flex items-center gap-4">
            <div className="p-3 rounded-xl bg-amber-50 text-[#775a19]">
              <ChefHat className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
                Total Trays to Prep
              </span>
              <div className="font-serif text-2xl sm:text-3xl font-bold text-[#775a19] mt-0.5">
                {totalTraysToPrep} <span className="text-xs font-normal text-gray-500">Trays</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs flex items-center gap-4">
            <div className="p-3 rounded-xl bg-emerald-50 text-emerald-800">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
                Total Today's Revenue
              </span>
              <div className="font-serif text-2xl sm:text-3xl font-bold text-emerald-900 mt-0.5">
                ${totalTodayRevenue.toFixed(2)}
              </div>
            </div>
          </div>

        </div>

        {/* ── DATE PICKER & STATUS PIPELINE TABS ── */}
        <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-xs space-y-3">
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            {/* Quick Date Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              <span className="text-xs font-bold text-gray-500 mr-2 flex items-center gap-1">
                <CalendarIcon className="w-3.5 h-3.5" />
                Fulfillment Date:
              </span>

              {upcomingDateOptions.map(opt => {
                const isSelected = selectedDate === opt.dateStr;
                const isToday = opt.dateStr === todayDateStr;

                return (
                  <button
                    key={opt.dateStr}
                    onClick={() => setSelectedDate(opt.dateStr)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#00346f] text-white shadow-xs'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                    }`}
                  >
                    {isToday ? 'Today' : `${opt.dayOfWeek} ${opt.label}`}
                  </button>
                );
              })}

              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-2 py-1 bg-gray-50 border border-gray-300 rounded-lg text-xs text-gray-700 focus:outline-none"
              />
            </div>

            {/* Status Pipeline Filter Tabs */}
            <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl">
              {[
                { key: 'all', label: 'All Orders' },
                { key: 'new', label: 'New' },
                { key: 'preparing', label: 'Preparing' },
                { key: 'ready', label: 'Ready' },
                { key: 'completed', label: 'Completed' }
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setStatusFilter(tab.key)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    statusFilter === tab.key
                      ? 'bg-white text-[#00346f] shadow-xs'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* ── LIVE ORDER CARDS GRID ── */}
        {isLoading ? (
          <div className="py-20 text-center text-gray-400">
            <RefreshCw className="w-8 h-8 mx-auto animate-spin mb-2" />
            <p className="text-xs">Loading live kitchen orders...</p>
          </div>
        ) : activeOrders.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center shadow-xs">
            <ChefHat className="w-12 h-12 mx-auto text-gray-300 mb-3" />
            <h3 className="font-serif text-lg font-bold text-gray-700">
              No orders found for {selectedDate}
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              {statusFilter !== 'all' 
                ? `No orders matching status "${statusFilter}". Try switching to "All Orders".`
                : 'No catering orders or estimates scheduled for this day yet.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {activeOrders.map(order => {
              const totalTraysInThisOrder = order.items
                .filter(i => i.selectionType === 'third' || i.selectionType === 'half' || i.selectionType === 'full')
                .reduce((sum, i) => sum + i.quantity, 0);

              const hasSatvik = order.dietary_notes?.toLowerCase().includes('satvik') || 
                                order.dietary_notes?.toLowerCase().includes('jain');

              return (
                <div
                  key={order.id}
                  className={`bg-white rounded-2xl border transition-all flex flex-col justify-between shadow-xs ${
                    order.status === 'new'
                      ? 'border-blue-400 ring-2 ring-blue-100'
                      : order.status === 'preparing'
                      ? 'border-amber-400 ring-2 ring-amber-100'
                      : order.status === 'ready'
                      ? 'border-emerald-500 ring-2 ring-emerald-100'
                      : order.status === 'cancelled'
                      ? 'border-rose-200 opacity-60'
                      : 'border-gray-200'
                  }`}
                >
                  {/* Card Header */}
                  <div className="p-4 sm:p-5 border-b border-gray-150 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-[10px] font-bold text-gray-400">
                        #{order.id.slice(0, 8).toUpperCase()}
                      </span>

                      <div className="flex items-center gap-1.5">
                        {order.order_type === 'estimate' && (
                          <span className="px-2 py-0.5 bg-purple-50 text-purple-700 rounded text-[10px] font-bold uppercase">
                            Estimate
                          </span>
                        )}
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          order.status === 'new'
                            ? 'bg-blue-100 text-blue-900'
                            : order.status === 'preparing'
                            ? 'bg-amber-100 text-amber-900'
                            : order.status === 'ready'
                            ? 'bg-emerald-100 text-emerald-900'
                            : order.status === 'cancelled'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          {order.status}
                        </span>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-serif font-bold text-base text-gray-900">
                        {order.customer_name}
                      </h3>
                      <div className="flex items-center gap-3 text-xs text-gray-600 mt-1">
                        <span className="inline-flex items-center gap-1">
                          <Phone className="w-3 h-3 text-gray-400" />
                          <a href={`tel:${order.phone_number}`} className="hover:underline">
                            {order.phone_number}
                          </a>
                        </span>
                        <span className="inline-flex items-center gap-1 font-bold text-[#00346f]">
                          <Clock className="w-3 h-3 text-[#00346f]" />
                          {order.fulfillment_time}
                        </span>
                      </div>
                    </div>

                    {/* Delivery / Pickup Badge */}
                    <div className="flex items-center gap-2 pt-1 text-xs">
                      {order.is_delivery ? (
                        <div className="flex items-start gap-1 text-amber-900 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200 w-full">
                          <Truck className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                          <div className="text-[11px] leading-snug">
                            <strong>Delivery:</strong> {order.delivery_address || 'Address provided on file'}
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-gray-700 bg-gray-100 px-2.5 py-1 rounded-lg text-[11px]">
                          <Store className="w-3.5 h-3.5 text-gray-500" />
                          <span>Self-Pickup (Home Kitchen - Deerwood Dr, Little Elm)</span>
                        </div>
                      )}
                    </div>

                    {/* Satvik Alert */}
                    {hasSatvik && (
                      <div className="bg-amber-500/10 border border-amber-300 text-amber-900 px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                        <span>SATVIK / NO ONION NO GARLIC</span>
                      </div>
                    )}

                    {order.dietary_notes && !hasSatvik && (
                      <div className="text-[11px] text-gray-600 bg-gray-50 p-2 rounded-lg italic">
                        &quot;{order.dietary_notes}&quot;
                      </div>
                    )}
                  </div>

                  {/* Itemized Trays Breakdown */}
                  <div className="p-4 sm:p-5 flex-1 space-y-2">
                    <div className="flex justify-between items-center text-[11px] font-bold text-gray-400 uppercase tracking-wider pb-1 border-b border-gray-100">
                      <span>Items to Prepare</span>
                      <span>{totalTraysInThisOrder} Trays</span>
                    </div>

                    <div className="space-y-1.5 text-xs max-h-48 overflow-y-auto pr-1">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-start gap-2 py-0.5">
                          <div>
                            <span className="font-semibold text-gray-900">
                              {item.name}
                            </span>
                            <div className="text-[10px] text-gray-500">
                              {item.selectionLabel} {item.tier ? `(${item.tier})` : ''}
                            </div>
                          </div>
                          <span className="font-bold text-[#00346f] px-2 py-0.5 bg-blue-50 rounded text-xs shrink-0">
                            &times; {item.quantity}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Pipeline Status Buttons Footer */}
                  <div className="p-3 sm:p-4 bg-gray-50 border-t border-gray-150 rounded-b-2xl flex items-center justify-between gap-2">
                    <div>
                      <span className="text-xs font-bold text-gray-900 block">${order.total_amount.toFixed(2)}</span>
                      {Boolean((order.discount_amount && order.discount_amount > 0) || (order.rebate_amount && order.rebate_amount > 0)) && (
                        <span className="text-[10px] text-purple-700 block font-semibold">
                          {order.discount_amount ? `-${order.discount_amount.toFixed(2)} Disc` : ''}
                          {order.rebate_amount ? ` -${order.rebate_amount.toFixed(2)} Reb` : ''}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setEditingOrder(order)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-gray-300 hover:bg-gray-100 text-gray-700 text-xs font-semibold cursor-pointer transition-colors"
                        title="Edit items, quantities, discounts, and rebates"
                      >
                        <FileEdit className="w-3.5 h-3.5 text-[#00346f]" />
                        <span>Edit</span>
                      </button>
                      {order.status === 'new' && (
                        <button
                          onClick={() => handleStatusChange(order.id, 'preparing')}
                          className="bg-amber-600 hover:bg-amber-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1"
                        >
                          <span>Start Prep</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      )}

                      {order.status === 'preparing' && (
                        <button
                          onClick={() => handleStatusChange(order.id, 'ready')}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Mark Ready</span>
                        </button>
                      )}

                      {order.status === 'ready' && (
                        <button
                          onClick={() => handleStatusChange(order.id, 'completed')}
                          className="bg-[#00346f] hover:bg-[#00224d] text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer"
                        >
                          <span>Complete &amp; Archive</span>
                        </button>
                      )}

                      {order.status === 'completed' && (
                        <button
                          onClick={() => handleStatusChange(order.id, 'ready')}
                          className="text-[10px] text-gray-500 hover:text-gray-800 underline cursor-pointer"
                        >
                          Reopen
                        </button>
                      )}

                      {order.status !== 'cancelled' && order.status !== 'completed' && (
                        <button
                          onClick={() => handleStatusChange(order.id, 'cancelled')}
                          className="text-[10px] text-gray-400 hover:text-rose-600 p-1"
                          title="Cancel order"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* ── KITCHEN PREP SHEET EXPORT MODAL (PRINTABLE) ── */}
      {showPrepSheet && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto animate-fade-in font-sans">
          <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden my-6 max-h-[92vh] flex flex-col">
            
            {/* Modal Controls */}
            <div className="bg-[#00346f] text-white px-6 py-4 flex items-center justify-between shrink-0 print:hidden">
              <div className="flex items-center gap-2">
                <ChefHat className="w-5 h-5 text-[#ffdea5]" />
                <h3 className="font-serif font-bold text-lg">
                  Daily Kitchen Prep Sheet — {selectedDate}
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1.5 bg-white/20 hover:bg-white/30 text-white px-3.5 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Prep Sheet</span>
                </button>
                <button
                  onClick={() => setShowPrepSheet(false)}
                  className="p-1 rounded-full text-white/80 hover:text-white hover:bg-white/10"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* PRINTABLE PREP SHEET CANVAS */}
            <div id="kitchen-prep-sheet-print" className="p-6 sm:p-8 overflow-y-auto space-y-6 text-gray-900">
              
              <div className="border-b border-gray-200 pb-4 flex justify-between items-start">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#775a19]">
                    BLUEBONNET WHISK — DESI DABBA
                  </span>
                  <h2 className="font-serif text-2xl font-bold text-[#00346f]">
                    Aggregated Kitchen Prep Sheet
                  </h2>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Fulfillment Date: <strong className="text-gray-900">{selectedDate}</strong> • Total Orders: {totalOrdersToday}
                  </p>
                </div>

                <div className="text-right text-xs">
                  <div className="font-bold text-[#00346f]">Total Trays to Prep: {totalTraysToPrep}</div>
                  <div className="text-gray-400 text-[10px]">Generated at {new Date().toLocaleTimeString()}</div>
                </div>
              </div>

              {/* Aggregated Dish Quantities Table */}
              <div>
                <table className="w-full text-left text-xs border border-gray-200 rounded-xl overflow-hidden">
                  <thead className="bg-gray-100 text-[10px] font-bold text-gray-600 uppercase tracking-wider border-b border-gray-200">
                    <tr>
                      <th className="py-2.5 px-3">Dish / Item Name</th>
                      <th className="py-2.5 px-3">Category</th>
                      <th className="py-2.5 px-3 text-center">1/3 Tray</th>
                      <th className="py-2.5 px-3 text-center">Half Tray</th>
                      <th className="py-2.5 px-3 text-center">Full Tray</th>
                      <th className="py-2.5 px-3 text-center">Breads / Gallons / Custom</th>
                      <th className="py-2.5 px-3 text-center font-bold text-gray-900">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-150">
                    {prepSheetSummary.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-gray-400">
                          No dishes scheduled for prep on this date.
                        </td>
                      </tr>
                    ) : (
                      prepSheetSummary.map((dish, i) => (
                        <tr key={i} className="hover:bg-gray-50">
                          <td className="py-2.5 px-3 font-bold text-gray-900">
                            {dish.name}
                            {dish.tier && <span className="text-[10px] font-normal text-gray-500 block">{dish.tier} Tier</span>}
                          </td>
                          <td className="py-2.5 px-3 text-gray-500 text-[11px]">{dish.category}</td>
                          <td className="py-2.5 px-3 text-center font-bold text-[#00346f]">
                            {dish.thirdCount > 0 ? `${dish.thirdCount}` : '-'}
                          </td>
                          <td className="py-2.5 px-3 text-center font-bold text-[#00346f]">
                            {dish.halfCount > 0 ? `${dish.halfCount}` : '-'}
                          </td>
                          <td className="py-2.5 px-3 text-center font-bold text-[#00346f]">
                            {dish.fullCount > 0 ? `${dish.fullCount}` : '-'}
                          </td>
                          <td className="py-2.5 px-3 text-center font-medium text-gray-700">
                            {dish.packsCount > 0 && <span>{dish.packsCount * 30} pcs ({dish.packsCount} packs)</span>}
                            {dish.gallonsCount > 0 && <span>{dish.gallonsCount} Gallons</span>}
                            {dish.cakesCount > 0 && <span>{dish.cakesCount} Custom Cake(s)</span>}
                            {dish.packsCount === 0 && dish.gallonsCount === 0 && dish.cakesCount === 0 && '-'}
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <span className="inline-block w-4 h-4 border border-gray-400 rounded-sm" />
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Special dietary alert list on prep sheet */}
              <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl text-xs space-y-1">
                <span className="font-bold text-amber-900 block uppercase tracking-wider text-[10px]">
                  Dietary / Satvik Precautions for Today:
                </span>
                {nonCancelledOrders.filter(o => o.dietary_notes).map((o, idx) => (
                  <p key={idx} className="text-amber-800 text-[11px]">
                    • <strong>{o.customer_name} ({o.fulfillment_time}):</strong> {o.dietary_notes}
                  </p>
                ))}
                {nonCancelledOrders.filter(o => o.dietary_notes).length === 0 && (
                  <p className="text-gray-500 italic text-[11px]">No custom dietary restrictions flagged.</p>
                )}
              </div>

            </div>

            <div className="bg-gray-50 p-4 border-t border-gray-200 flex justify-end shrink-0 print:hidden">
              <button
                onClick={() => setShowPrepSheet(false)}
                className="bg-[#00346f] text-white px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-[#00224d] cursor-pointer"
              >
                Close Prep Sheet
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ── CHANGE MASTER PIN MODAL ── */}
      {showChangePinModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 animate-fade-in font-sans">
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden p-6 sm:p-7">
            
            <button
              onClick={() => setShowChangePinModal(false)}
              className="absolute top-4 right-4 p-1 rounded-full text-gray-400 hover:text-gray-700"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 text-[#00346f] mb-4">
              <div className="p-2.5 rounded-xl bg-amber-50 text-amber-700">
                <KeyRound className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-lg sm:text-xl">Update Kitchen PIN</h3>
                <p className="text-xs text-gray-500">Change your master kitchen passcode</p>
              </div>
            </div>

            {pinChangeSuccess ? (
              <div className="py-6 text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h4 className="font-bold text-sm text-emerald-900">PIN Updated Successfully!</h4>
                <p className="text-xs text-emerald-700">New passcode has been stored securely.</p>
              </div>
            ) : (
              <form onSubmit={handleChangePin} className="space-y-4 text-xs">
                
                {pinChangeError && (
                  <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
                    <span>{pinChangeError}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Current PIN
                  </label>
                  <input
                    type="password"
                    maxLength={8}
                    required
                    placeholder="Enter current PIN"
                    value={currentPinInput}
                    onChange={(e) => setCurrentPinInput(e.target.value.replace(/\D/g, ''))}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:bg-white focus:border-[#00346f]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    New PIN (4–8 digits)
                  </label>
                  <input
                    type="password"
                    maxLength={8}
                    required
                    placeholder="Enter new PIN"
                    value={newPinInput}
                    onChange={(e) => setNewPinInput(e.target.value.replace(/\D/g, ''))}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:bg-white focus:border-[#00346f]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Confirm New PIN
                  </label>
                  <input
                    type="password"
                    maxLength={8}
                    required
                    placeholder="Re-enter new PIN"
                    value={confirmPinInput}
                    onChange={(e) => setConfirmPinInput(e.target.value.replace(/\D/g, ''))}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:bg-white focus:border-[#00346f]"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowChangePinModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-[#00346f] hover:bg-[#00224d] text-white px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-xs cursor-pointer"
                  >
                    Update Passcode
                  </button>
                </div>

              </form>
            )}

          </div>
        </div>
      )}

      {/* ── BLACKOUT DATES & SCHEDULE MANAGER MODAL ── */}
      <KDSBlackoutManager
        isOpen={showBlackoutModal}
        onClose={() => setShowBlackoutModal(false)}
        onRulesUpdated={() => {
          loadOrders();
        }}
      />

      {/* ── EDIT ORDER MODAL (ITEMS, QUANTITIES, DISCOUNTS, REBATES) ── */}
      {editingOrder && (
        <KDSEditOrderModal
          order={editingOrder}
          onClose={() => setEditingOrder(null)}
          onOrderUpdated={() => {
            loadOrders();
          }}
        />
      )}

      {/* ── TIFFIN FLYER & SATURDAY SPECIALS MODAL ── */}
      {showTiffinModal && (
        <KDSTiffinMenuModal
          onClose={() => setShowTiffinModal(false)}
          onSettingsSaved={() => {
            loadOrders();
          }}
        />
      )}

    </div>
  );
}
