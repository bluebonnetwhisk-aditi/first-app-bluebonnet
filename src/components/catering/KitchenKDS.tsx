import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Lock, 
  ChefHat, 
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
  ArrowLeft,
  Package,
  DollarSign,
  KeyRound,
  Ban,
  FileEdit,
  ImageIcon,
  Volume2,
  VolumeX,
  BellRing,
  Check,
  MessageCircle
} from 'lucide-react';
import type { CateringOrder, OrderStatus } from '../../types/catering';
import { getCentralTimeNow, getUpcomingDates } from '../../utils/centralTime';
import { fetchOrders, updateOrderStatus, subscribeToOrders, deleteOrderFromSupabase } from '../../services/supabase';
import KDSBlackoutManager from './KDSBlackoutManager';
import KDSEditOrderModal from './KDSEditOrderModal';
import KDSTiffinMenuModal from './KDSTiffinMenuModal';

interface KitchenKDSProps {
  onBackToOrder?: () => void;
}

const MASTER_PIN_STORAGE_KEY = 'bbw_kds_master_pin_v1';
const DEFAULT_INITIAL_PIN = '031686';
const PIN_STORAGE_KEY = 'bbw_kds_unlocked_session';

/**
 * High-clarity Web Audio API restaurant chime.
 * Synthesizes a clean 4-tone ascending bell (D5 -> F#5 -> A5 -> D6)
 * with natural decay. Works offline, no external audio files required.
 */
function playKitchenChime() {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    const tones = [
      { freq: 587.33, time: 0.0, dur: 0.35, gain: 0.22 }, // D5
      { freq: 739.99, time: 0.12, dur: 0.35, gain: 0.25 }, // F#5
      { freq: 880.00, time: 0.24, dur: 0.45, gain: 0.28 }, // A5
      { freq: 1174.66, time: 0.36, dur: 0.9, gain: 0.32 }  // D6
    ];

    tones.forEach(({ freq, time, dur, gain: targetGain }) => {
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc.type = 'triangle'; // Warm, ringing brass bell tone
      osc.frequency.setValueAtTime(freq, ctx.currentTime + time);

      gainNode.gain.setValueAtTime(0.0001, ctx.currentTime + time);
      gainNode.gain.exponentialRampToValueAtTime(targetGain, ctx.currentTime + time + 0.02);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + time + dur);

      osc.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc.start(ctx.currentTime + time);
      osc.stop(ctx.currentTime + time + dur);
    });
  } catch (err) {
    console.warn('Audio chime error:', err);
  }
}

/**
 * Normalizes phone number into E.164 digits for WhatsApp wa.me links.
 * E.g., "(945) 555-4081" -> "19455554081"
 */
function formatWhatsAppPhone(phone: string): string {
  const digits = (phone || '').replace(/\D/g, '');
  if (!digits) return '';
  if (digits.length === 10) {
    return `1${digits}`;
  }
  return digits;
}

/**
 * Parses time strings like "11:00 AM - 12:00 PM" or "1:00 PM" into minutes from midnight for sorting
 */
function parseTimeToMinutes(timeStr?: string): number {
  if (!timeStr) return 9999;
  const match = timeStr.trim().match(/(\d{1,2})(?::(\d{2}))?\s*(AM|PM)?/i);
  if (!match) return 9999;
  let hours = parseInt(match[1], 10);
  const minutes = match[2] ? parseInt(match[2], 10) : 0;
  const meridian = match[3]?.toUpperCase();
  if (meridian === 'PM' && hours < 12) hours += 12;
  if (meridian === 'AM' && hours === 12) hours = 0;
  return hours * 60 + minutes;
}

/**
 * Generates WhatsApp message template for Order Accepted, Order Ready, or Order Declined
 * Using Style 2: Minimalist Editorial Typography with Clean Dividers
 */
function buildWhatsAppMessage(order: CateringOrder, eventType: 'accepted' | 'ready' | 'rejected'): string {
  const shortId = order.id ? order.id.slice(0, 8).toUpperCase() : '';
  const customerName = order.customer_name || 'Valued Customer';
  const dateStr = order.fulfillment_date || '';
  const timeStr = order.fulfillment_time || '';
  
  // Format item list cleanly
  const itemsText = order.items && order.items.length > 0
    ? order.items.map(i => {
        const sizeStr = i.selectionLabel ? ` (${i.selectionLabel})` : '';
        const notesStr = i.notes ? ` [${i.notes}]` : '';
        const unitPriceStr = i.unitPrice > 0 ? ` @ $${i.unitPrice.toFixed(2)} ea` : '';
        return `• ${i.name}${sizeStr}${notesStr}\n  Qty: ${i.quantity}${unitPriceStr} = $${i.totalPrice.toFixed(2)}`;
      }).join('\n')
    : (order.order_description || 'Catering items');

  const locationText = order.is_delivery
    ? `Delivery destination: ${order.delivery_address || 'Address on file'}`
    : `Self-Pickup: 2437 Deerwood Dr, Little Elm, TX`;

  const foodSubtotal = order.food_subtotal || 0;
  const deliveryFee = order.delivery_fee || 0;
  const taxAmount = order.tax_amount || 0;
  const processingFee = order.processing_fee || 0;
  const grandTotal = order.total_amount || 0;

  const financialSummaryLines = [
    `FINANCIAL SUMMARY`,
    `• Food Subtotal: $${foodSubtotal.toFixed(2)}`,
    order.is_delivery && deliveryFee > 0 ? `• Delivery Fee: $${deliveryFee.toFixed(2)}` : null,
    `• Texas Sales Tax (8.25%): $${taxAmount.toFixed(2)}`,
    processingFee > 0 ? `• Card Processing Fee (3.5%): $${processingFee.toFixed(2)}` : null,
    `• Total Amount: $${grandTotal.toFixed(2)}`
  ].filter(Boolean).join('\n');

  if (eventType === 'rejected') {
    return (
`─ ORDER CANNOT BE FULFILLED ─
Ref: #${shortId} | Customer: ${customerName}

Hi ${customerName}, we regret that order #${shortId} for ${dateStr} (${timeStr}) cannot be accepted as we are sold to capacity.

REQUESTED ITEMS
${itemsText}

${financialSummaryLines}

───────────────
Apologies for the inconvenience.
Reschedule via the web ordering portal.`
    );
  } else if (eventType === 'accepted') {
    return (
`─ ORDER CONFIRMED ─
Ref: #${shortId} | Customer: ${customerName}

SCHEDULE
Date: ${dateStr}
Window: ${timeStr} (Central Time)
${locationText}

ORDERED ITEMS
${itemsText}

${financialSummaryLines}

───────────────
Thank you for supporting a local woman owned small business.
Desi Dabba | BlueBonnet Whisk`
    );
  } else {
    return (
`─ ORDER READY ─
Ref: #${shortId} | Customer: ${customerName}

SCHEDULE
Date: ${dateStr}
Window: ${timeStr} (Central Time)
${locationText}

ITEMS READY FOR ${order.is_delivery ? 'DELIVERY' : 'PICKUP'}
${itemsText}

${financialSummaryLines}

───────────────
Thank you for your business.
Desi Dabba | BlueBonnet Whisk`
    );
  }
}

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

  // Date Filter state: Defaults to 'all' for All Upcoming schedule view
  const { dateStr: todayDateStr } = getCentralTimeNow();
  const [selectedDate, setSelectedDate] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Orders and loading
  const [allOrders, setAllOrders] = useState<CateringOrder[]>([]);
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

  // Audio chime settings (persisted in localStorage, default: true)
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('bbw_kds_sound_enabled') !== 'false';
    }
    return true;
  });

  // Native Browser Notification Permission state
  const [notificationPermission, setNotificationPermission] = useState<string>(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      return Notification.permission;
    }
    return 'unsupported';
  });

  // Set dedicated page title for Order System
  useEffect(() => {
    if (typeof document !== 'undefined') {
      const prevTitle = document.title;
      document.title = "BlueBonnet Order Management & Financial Reconciliation System | Bluebonnet Whisk";
      return () => {
        document.title = prevTitle;
      };
    }
  }, []);

  // High-visibility top banner for newly punched orders
  const [newOrderAlert, setNewOrderAlert] = useState<CateringOrder | null>(null);

  // Known order IDs tracking to detect new arrivals
  const knownOrderIdsRef = useRef<Set<string>>(new Set());
  const isInitialLoadRef = useRef(true);

  // Handle incoming newly punched order (audio chime + notification + alert banner)
  const handleIncomingNewOrder = (order: CateringOrder) => {
    // 1. Play kitchen bell chime
    if (soundEnabled) {
      playKitchenChime();
    }

    // 2. Fire OS desktop/mobile notification if granted
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(`🔔 New ${order.order_type === 'estimate' ? 'Estimate' : 'Order'} Punched!`, {
          body: `${order.customer_name} • $${order.total_amount.toFixed(2)} (${order.fulfillment_date} ${order.fulfillment_time || ''})`,
          icon: '/favicon.ico'
        });
      } catch {
        // ignore notification error
      }
    }

    // 3. Display high-visibility flash banner
    setNewOrderAlert(order);
  };

  // Enable Notifications and test chime (compatible with Chrome, Safari, macOS, iOS PWA)
  const handleEnableAlerts = async () => {
    playKitchenChime(); // Warm up Web Audio Context on user click

    if (typeof window !== 'undefined' && 'Notification' in window) {
      try {
        let res: NotificationPermission;
        if (typeof Notification.requestPermission === 'function') {
          try {
            res = await Notification.requestPermission();
          } catch {
            res = await new Promise(resolve => Notification.requestPermission(resolve));
          }
        } else {
          res = 'denied';
        }
        setNotificationPermission(res);

        if (res === 'granted') {
          new Notification('🔔 Bluebonnet Whisk KDS Active!', {
            body: 'Live order alerts active! You will hear a bell chime and receive desktop popups whenever an order is punched.',
            icon: '/favicon.ico'
          });
        } else if (res === 'denied') {
          alert('Notification permission was blocked in browser settings. Please allow notifications for bluebonnetwhisk.com in your browser site settings.');
        }
      } catch (err) {
        console.warn('Notification permission error:', err);
      }
    } else {
      alert('Desktop notifications are not supported in this browser tab. On iPhone / iPad Safari, tap Share ➔ "Add to Home Screen" to enable notifications.');
    }
  };

  // Load all orders
  const loadOrders = async () => {
    setIsRefreshing(true);
    try {
      // Fetch all orders from database to calculate badge counts and notify for any upcoming date
      const data = await fetchOrders();
      const activeData = data.filter(o => o.status !== 'cancelled');
      
      // If not initial load, check if any newly added order with 'new' status was fetched
      if (!isInitialLoadRef.current) {
        const newlyAdded = activeData.find(o => !knownOrderIdsRef.current.has(o.id) && o.status === 'new');
        if (newlyAdded) {
          handleIncomingNewOrder(newlyAdded);
        }
      }

      activeData.forEach(o => knownOrderIdsRef.current.add(o.id));
      isInitialLoadRef.current = false;
      setAllOrders(activeData);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (isUnlocked) {
      loadOrders();

      // Background periodic polling every 7 seconds to immediately catch newly punched orders
      const pollTimer = setInterval(() => {
        loadOrders();
      }, 7000);

      // Subscribe to Realtime Postgres Changes & Local Storage events
      const unsubscribe = subscribeToOrders((eventInfo) => {
        if (eventInfo?.eventType === 'INSERT' && eventInfo?.order) {
          handleIncomingNewOrder(eventInfo.order);
        }
        loadOrders();
      });

      return () => {
        clearInterval(pollTimer);
        unsubscribe();
      };
    }
  }, [isUnlocked, soundEnabled]);

  // Handle PIN entry with serverless verification
  const handlePinSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const clean = pinInput.trim();
    if (!clean) return;

    try {
      const res = await fetch('/api/kds/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin: clean })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setIsUnlocked(true);
        sessionStorage.setItem(PIN_STORAGE_KEY, 'true');
        setPinError(false);
        setPinInput('');
        if (soundEnabled) playKitchenChime();
        return;
      }
    } catch {
      // Fallback for local dev environments
    }

    if (clean === masterPin) {
      setIsUnlocked(true);
      sessionStorage.setItem(PIN_STORAGE_KEY, 'true');
      setPinError(false);
      setPinInput('');
      if (soundEnabled) playKitchenChime();
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

  // Open WhatsApp in new tab with pre-filled message
  const openWhatsAppForOrder = (order: CateringOrder, eventType: 'accepted' | 'ready' | 'rejected') => {
    const phone = formatWhatsAppPhone(order.phone_number);
    if (!phone) {
      alert(`No valid phone number on file for ${order.customer_name}.`);
      return;
    }
    const text = buildWhatsAppMessage(order, eventType);
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  // Deny / Reject Order handler: Triggers WhatsApp rejection message and deletes from Supabase & KDS
  const handleDenyOrder = async (order: CateringOrder) => {
    const shortId = order.id ? order.id.slice(0, 8).toUpperCase() : '';
    const confirmDeny = window.confirm(
      `Are you sure you want to DENY / REJECT order #${shortId} for ${order.customer_name}?\n\nThis will trigger a rejection WhatsApp message to the customer, and permanently delete the order entry from Supabase and KDS.`
    );
    if (!confirmDeny) return;

    // 1. Delete from known IDs ref so polling won't re-trigger notification or re-add
    knownOrderIdsRef.current.delete(order.id);

    // 2. Optimistic UI update: remove from active screen state immediately
    setAllOrders(prev => prev.filter(o => o.id !== order.id));

    // 3. Trigger WhatsApp rejection notification to customer
    openWhatsAppForOrder(order, 'rejected');

    // 4. Delete entry from Supabase & local storage
    await deleteOrderFromSupabase(order.id);
  };

  // Status transition handler
  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    // Optimistic UI update
    setAllOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    await updateOrderStatus(orderId, newStatus);
  };

  // Orders filtered by the currently selected date tab ('all' or specific YYYY-MM-DD)
  // Sorted chronologically from left to right: fulfillment_date ASC, fulfillment_time ASC
  const ordersForSelectedDate = useMemo(() => {
    const list = selectedDate === 'all'
      ? [...allOrders]
      : allOrders.filter(o => o.fulfillment_date === selectedDate);

    return list.sort((a, b) => {
      // 1. Sort by fulfillment_date ascending (earliest date first / on left)
      const dateA = a.fulfillment_date || '';
      const dateB = b.fulfillment_date || '';
      const dateCmp = dateA.localeCompare(dateB);
      if (dateCmp !== 0) return dateCmp;

      // 2. Sort by fulfillment_time ascending within same date
      const timeA = parseTimeToMinutes(a.fulfillment_time);
      const timeB = parseTimeToMinutes(b.fulfillment_time);
      if (timeA !== timeB) return timeA - timeB;

      // 3. Fallback to order creation time
      return (a.created_at || '').localeCompare(b.created_at || '');
    });
  }, [allOrders, selectedDate]);

  // Order counts grouped by date for badge counters on date buttons (active uncompleted orders)
  const orderCountsByDate = useMemo(() => {
    const map = new Map<string, number>();
    allOrders.filter(o => o.status !== 'cancelled' && o.status !== 'completed').forEach(o => {
      map.set(o.fulfillment_date, (map.get(o.fulfillment_date) || 0) + 1);
    });
    return map;
  }, [allOrders]);

  const totalActiveOrdersCount = useMemo(() => {
    return allOrders.filter(o => o.status !== 'cancelled' && o.status !== 'completed').length;
  }, [allOrders]);

  // Status counts for the selected date schedule
  const statusCounts = useMemo(() => {
    const counts = {
      all: 0,
      new: 0,
      accepted: 0,
      preparing: 0,
      ready: 0,
      completed: 0,
      cancelled: 0
    };
    ordersForSelectedDate.forEach(o => {
      if (o.status !== 'cancelled' && o.status !== 'completed') {
        counts.all++;
      }
      if (o.status === 'new') counts.new++;
      else if (o.status === 'accepted') counts.accepted++;
      else if (o.status === 'preparing') counts.preparing++;
      else if (o.status === 'ready') counts.ready++;
      else if (o.status === 'completed') counts.completed++;
      else if (o.status === 'cancelled') counts.cancelled++;
    });
    return counts;
  }, [ordersForSelectedDate]);

  // Filtered orders list by status (new, preparing, ready, completed, all active)
  // When statusFilter is 'all': only show active uncompleted orders (completed orders are moved to the 'completed' tab)
  const activeOrders = useMemo(() => {
    return ordersForSelectedDate.filter(o => {
      if (statusFilter === 'all') return o.status !== 'cancelled' && o.status !== 'completed';
      return o.status === statusFilter;
    });
  }, [ordersForSelectedDate, statusFilter]);

  // KPI Header Calculations for currently viewed date selection
  const nonCancelledOrders = ordersForSelectedDate.filter(o => o.status !== 'cancelled');
  const totalOrdersInView = nonCancelledOrders.length;

  // Total Trays to Prep (Sum of 1/3, Half, Full across all active orders in view)
  const totalTraysToPrep = nonCancelledOrders.reduce((sum, order) => {
    const traysInOrder = order.items
      .filter(item => item.selectionType === 'third' || item.selectionType === 'half' || item.selectionType === 'full')
      .reduce((sub, item) => sub + item.quantity, 0);
    return sum + traysInOrder;
  }, 0);

  // Bifurcated Financials in view (excluding cancelled)
  const totalNetFoodRevenueInView = nonCancelledOrders.reduce((sum, order) => {
    const foodBase = order.food_subtotal || 0;
    const discount = order.discount_amount || 0;
    const rebate = order.rebate_amount || 0;
    return sum + Math.max(0, foodBase - discount - rebate);
  }, 0);
  const totalTaxInView = nonCancelledOrders.reduce((sum, order) => sum + (order.tax_amount || 0), 0);
  const totalRevenueInView = nonCancelledOrders.reduce((sum, order) => sum + (order.total_amount || 0), 0);

  // QBO Reconciliation Status in View
  const reconciledOrdersCountInView = nonCancelledOrders.filter(o => o.reconciled_to_qbo).length;
  const sampleQboDocId = nonCancelledOrders.find(o => o.qbo_doc_id)?.qbo_doc_id;

  // QBO Manual Trigger State
  const [isSyncingQbo, setIsSyncingQbo] = useState(false);
  const [syncResultMsg, setSyncResultMsg] = useState<string | null>(null);

  const handleManualQBOReconcile = async () => {
    setIsSyncingQbo(true);
    setSyncResultMsg(null);
    try {
      const targetDateStr = selectedDate === 'all' ? todayDateStr : selectedDate;
      const res = await fetch(`/api/cron/reconcile-qbo?date=${targetDateStr}`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ date: targetDateStr })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSyncResultMsg(data.message || `QBO Reconciliation completed for ${targetDateStr}!`);
        loadOrders();
      } else {
        setSyncResultMsg(data.error || data.message || `Sync returned status ${res.status}`);
      }
    } catch (err: any) {
      setSyncResultMsg(`Sync error: ${err?.message || 'Connection failed'}`);
    } finally {
      setIsSyncingQbo(false);
      setTimeout(() => setSyncResultMsg(null), 8000);
    }
  };

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

  // Include Today + next 7 upcoming days in quick date tabs
  const upcomingDateOptions = getUpcomingDates(8, true);

  // ── PIN AUTHENTICATION MODAL ──
  if (!isUnlocked) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4 bg-[#fbfbfa] font-sans">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-[#775a19]/20 p-8 text-center animate-fade-in">
          <div className="w-32 h-32 rounded-3xl overflow-hidden shadow-xl border-4 border-[#ffdea5] mx-auto mb-5 bg-[#00346f] flex items-center justify-center p-1 ring-4 ring-[#00346f]/10">
            <img src="/bluebonnet_oms_logo.jpg" alt="BlueBonnet Logo" className="w-full h-full object-cover rounded-2xl" />
          </div>

          <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#00346f] leading-snug">
            BlueBonnet Order Management &amp; Financial Reconciliation System
          </h2>
          <p className="text-xs text-gray-500 mt-1 mb-6">
            Authorized BlueBonnet Whisk staff only. Please enter your security access PIN.
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
                Unlock Order System
              </button>
              {onBackToOrder && (
                <button
                  type="button"
                  onClick={onBackToOrder}
                  className="text-xs text-gray-500 hover:text-[#00346f] pt-2 flex items-center justify-center gap-1.5 mx-auto transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Exit to Bluebonnet Whisk Website</span>
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    );
  }

  // ── UNLOCKED SYSTEM SCREEN ──
  return (
    <div className="min-h-screen bg-[#f7f8fa] p-3 sm:p-5 lg:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-5">
        
        {/* ── TOP NAV & COMMAND DASHBOARD HEADER ── */}
        <div className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-5 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-14 h-14 sm:w-18 sm:h-18 rounded-2xl overflow-hidden border-2 border-[#ffdea5] shadow-md shrink-0 bg-[#00346f] flex items-center justify-center p-1 ring-2 ring-[#00346f]/10">
              <img src="/bluebonnet_oms_logo.jpg" alt="BlueBonnet Logo" className="w-full h-full object-cover rounded-xl" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="font-serif text-lg sm:text-xl font-bold text-[#00346f] leading-tight">
                  BlueBonnet Order Management &amp; Financial Reconciliation System
                </h1>
                <span className="flex items-center gap-1 bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Supabase &amp; QBO Live Sync
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                Real-time Cloud Database • Central Time: <strong>{new Date().toLocaleDateString('en-US', { timeZone: 'America/Chicago', weekday: 'short', month: 'short', day: 'numeric' })}</strong> • <strong className="text-[#00346f] font-bold">{allOrders.filter(o => o.status !== 'cancelled').length} Active Orders</strong>
              </p>
            </div>
          </div>

          {/* Header Quick Dock Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Sound / Bell Alert Toggle & Test */}
            <div className="inline-flex items-center rounded-xl border border-gray-200 bg-gray-50/90 p-0.5 shadow-2xs">
              <button
                type="button"
                onClick={() => {
                  const next = !soundEnabled;
                  setSoundEnabled(next);
                  localStorage.setItem('bbw_kds_sound_enabled', String(next));
                  if (next) playKitchenChime();
                }}
                className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition cursor-pointer min-h-[38px] ${
                  soundEnabled 
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-2xs' 
                    : 'text-gray-400 hover:text-gray-600'
                }`}
                title={soundEnabled ? "Order chime active (Click to mute)" : "Order chime muted (Click to unmute)"}
              >
                {soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-emerald-600" /> : <VolumeX className="w-3.5 h-3.5 text-gray-400" />}
                <span>{soundEnabled ? 'Bell ON' : 'Muted'}</span>
              </button>

              {soundEnabled && (
                <button
                  type="button"
                  onClick={() => playKitchenChime()}
                  className="px-2.5 py-2 text-[11px] font-bold text-gray-500 hover:text-[#00346f] transition cursor-pointer min-h-[38px]"
                  title="Test Kitchen Bell Sound"
                >
                  Test
                </button>
              )}
            </div>

            {/* Native Push Notifications Enable */}
            {notificationPermission !== 'granted' && (
              <button
                type="button"
                onClick={handleEnableAlerts}
                className="inline-flex items-center gap-1.5 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-900 px-3 py-2 rounded-xl text-xs font-semibold transition cursor-pointer min-h-[38px]"
                title="Enable browser notifications and test kitchen chime"
              >
                <BellRing className="w-3.5 h-3.5 text-blue-600 animate-pulse" />
                <span>Enable Alerts</span>
              </button>
            )}

            <button
              onClick={() => setShowPrepSheet(true)}
              className="inline-flex items-center gap-1.5 bg-[#775a19] hover:bg-[#5e4612] text-white px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-xs cursor-pointer min-h-[38px]"
            >
              <Printer className="w-4 h-4" />
              <span>Prep Sheet</span>
            </button>

            <button
              onClick={() => setShowTiffinModal(true)}
              className="inline-flex items-center gap-1.5 border border-purple-300 hover:bg-purple-50 text-purple-900 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer min-h-[38px]"
              title="Upload / Update Weekly Tiffin Menu Flyer & Saturday Specials"
            >
              <ImageIcon className="w-3.5 h-3.5 text-purple-700" />
              <span>Tiffin Flyer</span>
            </button>

            <button
              onClick={() => setShowBlackoutModal(true)}
              className="inline-flex items-center gap-1.5 border border-rose-300 hover:bg-rose-50 text-rose-900 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer min-h-[38px]"
              title="Manage Kitchen Blackout Dates & Recurring Schedule"
            >
              <Ban className="w-3.5 h-3.5 text-rose-700" />
              <span>Blackouts</span>
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
              className="inline-flex items-center gap-1.5 border border-amber-300 hover:bg-amber-50 text-amber-900 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer min-h-[38px]"
              title="Change Kitchen Access PIN"
            >
              <KeyRound className="w-3.5 h-3.5 text-amber-700" />
              <span>PIN</span>
            </button>

            <button
              onClick={loadOrders}
              disabled={isRefreshing}
              className="inline-flex items-center gap-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer min-h-[38px]"
              title="Refresh Orders"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>

            <button
              onClick={handleLock}
              className="inline-flex items-center gap-1.5 border border-gray-300 hover:bg-gray-100 text-gray-600 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer min-h-[38px]"
              title="Lock Screen"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Lock</span>
            </button>

            {onBackToOrder && (
              <button
                type="button"
                onClick={onBackToOrder}
                className="inline-flex items-center gap-1.5 bg-[#00346f] hover:bg-[#00224d] text-white px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-xs cursor-pointer min-h-[38px]"
                title="Return to Bluebonnet Whisk Website"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Exit</span>
              </button>
            )}
          </div>
        </div>

        {/* ── BROWSER NOTIFICATION BANNER ── */}
        {notificationPermission !== 'granted' && (
          <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-amber-50 border border-blue-200 rounded-2xl p-4 sm:p-5 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4 animate-fade-in">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                <BellRing className="w-5 h-5 text-blue-600 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-sm text-blue-950">
                    Enable Live Order Alerts &amp; Kitchen Chime
                  </h4>
                  <span className="text-[10px] bg-blue-200 text-blue-900 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                    Chrome • Safari • Mobile
                  </span>
                </div>
                <p className="text-xs text-blue-800/90 mt-1 leading-relaxed">
                  Allow browser notifications and audio to hear a restaurant chime and receive instant desktop/mobile popups whenever a customer punches an order.
                  <span className="text-gray-500 block text-[11px] mt-0.5">
                    💡 iPhone/iPad Safari users: Tap Share ➔ &quot;Add to Home Screen&quot; to receive system push alerts.
                  </span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 md:self-center">
              <button
                type="button"
                onClick={handleEnableAlerts}
                className="px-5 py-2.5 bg-[#00346f] hover:bg-[#00224d] text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-2 hover:scale-101 min-h-[44px]"
              >
                <BellRing className="w-4 h-4" />
                <span>Enable Alerts &amp; Test Chime</span>
              </button>
            </div>
          </div>
        )}

        {/* ── NEW ORDER LIVE ALERT BANNER ── */}
        {newOrderAlert && (
          <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-rose-600 text-white rounded-2xl p-4 sm:p-5 shadow-xl border-2 border-white/40 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0">
                <BellRing className="w-6 h-6 text-white animate-bounce" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="bg-white text-rose-700 text-xs font-black uppercase px-2 py-0.5 rounded-full tracking-wider">
                    🔔 New Order Punched!
                  </span>
                  <span className="text-xs font-semibold text-white/90">
                    Just Now
                  </span>
                </div>
                <div className="text-base sm:text-lg font-bold mt-0.5">
                  {newOrderAlert.customer_name} • ${newOrderAlert.total_amount.toFixed(2)} ({newOrderAlert.items.length} items)
                </div>
                <p className="text-xs text-white/90">
                  Scheduled for: <strong className="text-white">{newOrderAlert.fulfillment_date}</strong> at <strong className="text-white">{newOrderAlert.fulfillment_time || 'Pending time'}</strong> • {newOrderAlert.is_delivery ? '🚚 Delivery' : '🏪 Pickup'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {selectedDate !== newOrderAlert.fulfillment_date && (
                <button
                  onClick={() => {
                    setSelectedDate(newOrderAlert.fulfillment_date);
                    setNewOrderAlert(null);
                  }}
                  className="bg-white hover:bg-amber-50 text-rose-700 px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-md cursor-pointer flex items-center gap-1.5 min-h-[44px]"
                >
                  <span>Switch to {newOrderAlert.fulfillment_date}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                onClick={() => setNewOrderAlert(null)}
                className="bg-black/20 hover:bg-black/40 text-white p-2 rounded-xl text-xs font-semibold transition-all cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
                title="Dismiss Alert"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ── DATE PICKER & STATUS PIPELINE TABS ── */}
        <div className="bg-white rounded-2xl border border-gray-200 p-3.5 sm:p-4 shadow-xs space-y-3">
          
          {/* 1. Schedule Ribbon (Row 1 with CSS Snap Scrolling) */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none snap-x snap-mandatory w-full">
            <span className="text-xs font-bold text-gray-500 mr-1.5 flex items-center gap-1 shrink-0">
              <CalendarIcon className="w-3.5 h-3.5" />
              <span>Schedule:</span>
            </span>

            {/* All Orders Button */}
            <button
              type="button"
              onClick={() => setSelectedDate('all')}
              className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 shrink-0 snap-start min-h-[38px] ${
                selectedDate === 'all'
                  ? 'bg-[#00346f] text-white shadow-xs'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              <span>All Orders</span>
              {totalActiveOrdersCount > 0 && (
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                  selectedDate === 'all' ? 'bg-[#ffdea5] text-[#00346f]' : 'bg-gray-200 text-gray-800'
                }`}>
                  {totalActiveOrdersCount}
                </span>
              )}
            </button>

            {upcomingDateOptions.map(opt => {
              const isSelected = selectedDate === opt.dateStr;
              const isToday = opt.dateStr === todayDateStr;
              const count = orderCountsByDate.get(opt.dateStr) || 0;

              return (
                <button
                  key={opt.dateStr}
                  type="button"
                  onClick={() => setSelectedDate(opt.dateStr)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 shrink-0 snap-start min-h-[38px] ${
                    isSelected
                      ? isToday
                        ? 'bg-amber-600 text-white shadow-xs ring-2 ring-amber-300'
                        : 'bg-[#00346f] text-white shadow-xs'
                      : isToday
                      ? count > 0
                        ? 'bg-amber-100 text-amber-950 border border-amber-300 hover:bg-amber-200 font-extrabold shadow-2xs'
                        : 'bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100 font-bold'
                      : count > 0
                      ? 'bg-blue-50 border border-blue-200 text-[#00346f] hover:bg-blue-100'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  }`}
                >
                  <span>{isToday ? 'Today' : `${opt.dayOfWeek} ${opt.label}`}</span>
                  {count > 0 && (
                    <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                      isSelected
                        ? 'bg-[#ffdea5] text-[#00346f]'
                        : isToday
                        ? 'bg-amber-700 text-white'
                        : 'bg-[#00346f] text-white'
                    }`}>
                      {count}
                    </span>
                  )}
                </button>
              );
            })}

            <div className="flex items-center gap-1.5 ml-auto pl-2 shrink-0">
              <span className="text-[11px] font-medium text-gray-500 hidden sm:inline">Pick date:</span>
              <input
                type="date"
                value={selectedDate === 'all' ? todayDateStr : selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-2.5 py-1.5 bg-gray-50 border border-gray-300 rounded-lg text-xs text-gray-700 focus:outline-none shrink-0 min-h-[38px]"
              />
            </div>
          </div>

          {/* 2. Status Pipeline Filter Ribbon (Row 2) */}
          <div className="pt-2 border-t border-gray-150 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none snap-x snap-mandatory w-full">
            <span className="text-xs font-bold text-gray-500 mr-1.5 flex items-center gap-1 shrink-0">
              <span>Status:</span>
            </span>

            <div className="flex items-center gap-1.5 bg-gray-100 p-1 rounded-xl shrink-0 overflow-x-auto">
              {[
                { key: 'all', label: 'All Orders', count: statusCounts.all },
                { key: 'new', label: 'New', count: statusCounts.new },
                { key: 'accepted', label: 'Accepted', count: statusCounts.accepted },
                { key: 'preparing', label: 'Preparing', count: statusCounts.preparing },
                { key: 'ready', label: 'Ready', count: statusCounts.ready },
                { key: 'completed', label: 'Completed', count: statusCounts.completed },
                { key: 'cancelled', label: 'Cancelled', count: statusCounts.cancelled }
              ].map(tab => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setStatusFilter(tab.key)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 snap-start min-h-[36px] ${
                    statusFilter === tab.key
                      ? 'bg-white text-[#00346f] shadow-xs ring-1 ring-black/5 font-extrabold'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <span>{tab.label}</span>
                  {tab.count > 0 && (
                    <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                      statusFilter === tab.key
                        ? tab.key === 'completed'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-[#ffdea5] text-[#00346f]'
                        : 'bg-gray-200 text-gray-700'
                    }`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* ── LIVE ORDER CARDS GRID ── */}
        {isLoading ? (
          <div className="py-20 text-center text-gray-400">
            <RefreshCw className="w-8 h-8 mx-auto animate-spin mb-2 text-[#00346f]" />
            <p className="text-xs font-semibold">Loading live kitchen orders...</p>
          </div>
        ) : activeOrders.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-8 sm:p-12 text-center shadow-xs space-y-4">
            <ChefHat className="w-12 h-12 mx-auto text-gray-300" />
            <div>
              <h3 className="font-serif text-lg font-bold text-gray-800">
                No orders found for {selectedDate === 'all' ? 'All Orders schedule' : selectedDate === todayDateStr ? 'Today' : selectedDate}
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                {statusFilter !== 'all' 
                  ? `No orders matching status "${statusFilter}". Try switching to "All Orders".`
                  : 'No catering orders or estimates scheduled for this day.'}
              </p>
            </div>

            {selectedDate !== 'all' && totalActiveOrdersCount > 0 && (
              <div className="pt-2">
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl inline-block max-w-md mx-auto text-xs text-[#00346f] mb-3">
                  <strong>Notice:</strong> You have <strong>{totalActiveOrdersCount} active orders</strong> scheduled on other dates!
                </div>
                <div>
                  <button
                    type="button"
                    onClick={() => setSelectedDate('all')}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#00346f] hover:bg-[#00224d] text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-xs transition cursor-pointer min-h-[44px]"
                  >
                    <span>View All {totalActiveOrdersCount} Orders</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {activeOrders.map(order => {
              const totalTraysInThisOrder = order.items
                .filter(i => i.selectionType === 'third' || i.selectionType === 'half' || i.selectionType === 'full')
                .reduce((sum, i) => sum + i.quantity, 0);

              const hasSatvik = order.dietary_notes?.toLowerCase().includes('satvik') || 
                                order.dietary_notes?.toLowerCase().includes('jain');

              // 4-step pipeline progress calculation
              const stepIndex = order.status === 'new' ? 1 
                              : order.status === 'accepted' ? 2 
                              : order.status === 'preparing' ? 3 
                              : order.status === 'ready' || order.status === 'completed' ? 4 : 0;

              return (
                <div
                  key={order.id}
                  className={`bg-white rounded-2xl border transition-all flex flex-col justify-between shadow-xs hover:shadow-md ${
                    order.status === 'new'
                      ? 'border-blue-400 ring-2 ring-blue-100'
                      : order.status === 'accepted'
                      ? 'border-emerald-500 ring-2 ring-emerald-100'
                      : order.status === 'preparing'
                      ? 'border-amber-400 ring-2 ring-amber-100'
                      : order.status === 'ready'
                      ? 'border-teal-500 ring-2 ring-teal-100'
                      : order.status === 'cancelled'
                      ? 'border-rose-200 opacity-60'
                      : 'border-gray-200'
                  }`}
                >
                  {/* High-Visibility Saffron Satvik / Allergen Banner */}
                  {hasSatvik && (
                    <div className="bg-amber-500 text-black px-4 py-1.5 text-xs font-black uppercase tracking-wider rounded-t-2xl flex items-center justify-between border-b border-amber-600 shadow-2xs">
                      <div className="flex items-center gap-1.5">
                        <AlertTriangle className="w-4 h-4 text-black shrink-0 animate-pulse" />
                        <span>SATVIK / NO ONION NO GARLIC</span>
                      </div>
                      <span className="text-[10px] bg-black text-amber-400 px-2 py-0.5 rounded font-mono font-bold">STRICT PREP</span>
                    </div>
                  )}

                  {/* Card Header & 4-Step Pipeline Stepper */}
                  <div className="p-4 sm:p-5 border-b border-gray-150 space-y-2.5">
                    {/* Pipeline Visual Stepper Bar */}
                    <div className="flex items-center gap-1 w-full pb-1">
                      {['New', 'Accepted', 'Prep', 'Ready'].map((stepLabel, idx) => {
                        const stepNum = idx + 1;
                        const isCurrent = stepIndex === stepNum;
                        const isPast = stepIndex > stepNum;
                        return (
                          <div key={stepLabel} className="flex-1 flex flex-col items-center gap-1">
                            <div className={`h-1.5 w-full rounded-full transition-all ${
                              isPast ? 'bg-emerald-500' : isCurrent ? 'bg-[#00346f] ring-2 ring-[#00346f]/30' : 'bg-gray-200'
                            }`} />
                            <span className={`text-[9px] font-bold uppercase tracking-widest ${
                              isCurrent ? 'text-[#00346f]' : isPast ? 'text-emerald-700' : 'text-gray-400'
                            }`}>
                              {stepLabel}
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    <div className="flex items-center justify-between gap-2 pt-1">
                      <span className="font-mono text-xs font-extrabold text-gray-500">
                        #{order.id.slice(0, 8).toUpperCase()}
                      </span>

                      <div className="flex items-center gap-1.5">
                        {order.order_type === 'estimate' && (
                          <span className="px-2 py-0.5 bg-purple-100 text-purple-800 rounded text-[10px] font-extrabold uppercase">
                            Estimate
                          </span>
                        )}
                        <span className={`px-2.5 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider ${
                          order.status === 'new'
                            ? 'bg-blue-100 text-blue-900'
                            : order.status === 'accepted'
                            ? 'bg-emerald-100 text-emerald-900'
                            : order.status === 'preparing'
                            ? 'bg-amber-100 text-amber-900'
                            : order.status === 'ready'
                            ? 'bg-teal-100 text-teal-900'
                            : order.status === 'cancelled'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          {order.status === 'new' ? 'New (Pending)' : order.status}
                        </span>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-serif font-bold text-base sm:text-lg text-gray-900 leading-tight">
                          {order.customer_name}
                        </h3>
                        {/* Prominent Monospace Fulfillment Time Stamp */}
                        <div className="text-right shrink-0">
                          <span className="font-mono text-base sm:text-lg font-black text-[#00346f] bg-blue-50 px-2.5 py-1 rounded-xl border border-blue-200 block shadow-2xs">
                            {order.fulfillment_time || 'TBD'}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs text-gray-600 mt-1.5">
                        <span className="inline-flex items-center gap-1 font-medium">
                          <Phone className="w-3.5 h-3.5 text-gray-400" />
                          <a href={`tel:${order.phone_number}`} className="hover:underline text-gray-800 font-semibold">
                            {order.phone_number}
                          </a>
                        </span>
                        <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md border ${
                          order.fulfillment_date === todayDateStr
                            ? 'bg-amber-100 text-amber-900 border-amber-300'
                            : 'bg-gray-100 text-gray-700 border-gray-200'
                        }`}>
                          📅 {order.fulfillment_date} {order.fulfillment_date === todayDateStr ? '(Today)' : ''}
                        </span>
                      </div>
                    </div>

                    {/* Delivery / Pickup Badge */}
                    <div className="flex items-center gap-2 pt-1 text-xs">
                      {order.is_delivery ? (
                        <div className="flex items-start gap-1.5 text-amber-950 bg-amber-50 px-2.5 py-1.5 rounded-xl border border-amber-200 w-full">
                          <Truck className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                          <div className="text-[11px] leading-snug font-medium">
                            <strong className="text-amber-900 font-bold">Delivery:</strong> {order.delivery_address || 'Address provided on file'}
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-gray-700 bg-gray-100 px-2.5 py-1.5 rounded-xl text-[11px] w-full font-medium">
                          <Store className="w-4 h-4 text-gray-500 shrink-0" />
                          <span>Self-Pickup (Home Kitchen - Deerwood Dr, Little Elm)</span>
                        </div>
                      )}
                    </div>

                    {order.dietary_notes && !hasSatvik && (
                      <div className="text-[11px] text-gray-700 bg-gray-50 p-2.5 rounded-xl border border-gray-200 italic">
                        &quot;{order.dietary_notes}&quot;
                      </div>
                    )}
                  </div>

                  {/* Itemized Trays Breakdown */}
                  <div className="p-4 sm:p-5 flex-1 space-y-2">
                    <div className="flex justify-between items-center text-[11px] font-extrabold text-gray-500 uppercase tracking-wider pb-1 border-b border-gray-150">
                      <span>Items to Prepare</span>
                      <span className="bg-gray-100 px-2 py-0.5 rounded text-gray-800 font-mono">{totalTraysInThisOrder} Trays</span>
                    </div>

                    <div className="space-y-1.5 text-xs max-h-48 overflow-y-auto pr-1">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-start gap-2 py-1 border-b border-gray-100 last:border-0">
                          <div>
                            <span className="font-bold text-gray-900">
                              {item.name}
                            </span>
                            <div className="text-[10px] text-gray-500 font-medium">
                              {item.selectionLabel} {item.tier ? `(${item.tier})` : ''}
                            </div>
                          </div>
                          <span className="font-mono font-extrabold text-[#00346f] px-2 py-0.5 bg-blue-50 border border-blue-100 rounded text-xs shrink-0">
                            &times; {item.quantity}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Order Footer: Price, QBO Status Pill, & Touch Action Controls */}
                  <div className="p-3.5 sm:p-4 bg-gray-50 border-t border-gray-150 rounded-b-2xl space-y-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <span className="text-sm font-extrabold text-gray-900 block font-mono">${order.total_amount.toFixed(2)}</span>
                        {Boolean((order.discount_amount && order.discount_amount > 0) || (order.rebate_amount && order.rebate_amount > 0)) && (
                          <span className="text-[10px] text-purple-700 block font-bold">
                            {order.discount_amount ? `-${order.discount_amount.toFixed(2)} Disc` : ''}
                            {order.rebate_amount ? ` -${order.rebate_amount.toFixed(2)} Reb` : ''}
                          </span>
                        )}
                      </div>

                      {/* Per-Card QBO Status Pill */}
                      <div>
                        {order.reconciled_to_qbo ? (
                          <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2 py-0.5 rounded-md border border-emerald-300">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>QBO #{order.qbo_doc_id || 'OK'}</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 bg-blue-50 text-[#00346f] text-[10px] font-semibold px-2 py-0.5 rounded-md border border-blue-200">
                            <span>QBO Pending</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Touch Control Buttons Bar */}
                    <div className="flex items-center justify-between gap-2 pt-1 border-t border-gray-200">
                      <button
                        type="button"
                        onClick={() => setEditingOrder(order)}
                        className="inline-flex items-center gap-1 px-3 py-2 rounded-xl border border-gray-300 hover:bg-gray-100 text-gray-700 text-xs font-bold cursor-pointer transition-colors min-h-[42px]"
                        title="Edit items, quantities, discounts, and rebates"
                      >
                        <FileEdit className="w-3.5 h-3.5 text-[#00346f]" />
                        <span>Edit</span>
                      </button>

                      {/* Status: new -> Accept Order OR Deny Order */}
                      {order.status === 'new' && (
                        <div className="flex items-center gap-1.5 flex-1 justify-end">
                          <button
                            type="button"
                            onClick={() => {
                              handleStatusChange(order.id, 'accepted');
                              openWhatsAppForOrder(order, 'accepted');
                            }}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all shadow-xs cursor-pointer flex items-center justify-center gap-1.5 flex-1 min-h-[42px]"
                            title="Accept order and notify customer via WhatsApp"
                          >
                            <Check className="w-4 h-4" />
                            <span>Accept Order</span>
                            <MessageCircle className="w-3.5 h-3.5 text-emerald-200" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDenyOrder(order)}
                            className="bg-rose-600 hover:bg-rose-700 text-white px-3 py-2 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center justify-center gap-1 min-h-[42px]"
                            title="Deny order, send WhatsApp rejection message to customer, and delete entry from Supabase"
                          >
                            <Ban className="w-3.5 h-3.5" />
                            <span>Deny</span>
                          </button>
                        </div>
                      )}

                      {/* Status: accepted -> Start Prep */}
                      {order.status === 'accepted' && (
                        <div className="flex items-center gap-1.5 flex-1 justify-end">
                          <button
                            type="button"
                            onClick={() => openWhatsAppForOrder(order, 'accepted')}
                            className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 px-2.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 min-h-[42px]"
                            title="Resend WhatsApp confirmation to customer"
                          >
                            <MessageCircle className="w-3.5 h-3.5 text-emerald-700" />
                            <span className="hidden sm:inline">WhatsApp</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleStatusChange(order.id, 'preparing')}
                            className="bg-amber-600 hover:bg-amber-700 text-white px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all shadow-xs cursor-pointer flex items-center justify-center gap-1 flex-1 min-h-[42px]"
                          >
                            <span>Start Prep</span>
                            <ArrowRight className="w-4 h-4" />
                          </button>
                        </div>
                      )}

                      {/* Status: preparing -> Mark Ready */}
                      {order.status === 'preparing' && (
                        <button
                          type="button"
                          onClick={() => {
                            handleStatusChange(order.id, 'ready');
                            openWhatsAppForOrder(order, 'ready');
                          }}
                          className="bg-teal-600 hover:bg-teal-700 text-white px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all shadow-xs cursor-pointer flex items-center justify-center gap-1.5 flex-1 min-h-[42px]"
                          title="Mark order ready and notify customer via WhatsApp"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Mark Ready</span>
                          <MessageCircle className="w-3.5 h-3.5 text-teal-200" />
                        </button>
                      )}

                      {/* Status: ready -> Complete & Archive */}
                      {order.status === 'ready' && (
                        <div className="flex items-center gap-1.5 flex-1 justify-end">
                          <button
                            type="button"
                            onClick={() => openWhatsAppForOrder(order, 'ready')}
                            className="bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-300 px-2.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 min-h-[42px]"
                            title="Resend Ready WhatsApp message to customer"
                          >
                            <MessageCircle className="w-3.5 h-3.5 text-teal-700" />
                            <span className="hidden sm:inline">WhatsApp</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleStatusChange(order.id, 'completed')}
                            className="bg-[#00346f] hover:bg-[#00224d] text-white px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all shadow-xs cursor-pointer flex-1 min-h-[42px]"
                          >
                            <span>Complete</span>
                          </button>
                        </div>
                      )}

                      {order.status === 'completed' && (
                        <button
                          type="button"
                          onClick={() => handleStatusChange(order.id, 'ready')}
                          className="text-[10px] text-gray-500 hover:text-gray-800 underline cursor-pointer p-1"
                        >
                          Reopen
                        </button>
                      )}

                      {order.status !== 'cancelled' && order.status !== 'completed' && order.status !== 'new' && (
                        <button
                          type="button"
                          onClick={() => handleDenyOrder(order)}
                          className="text-[10px] text-rose-500 hover:text-rose-700 font-semibold underline cursor-pointer p-1"
                          title="Deny order, notify customer via WhatsApp, and delete from Supabase"
                        >
                          Deny
                        </button>
                      )}
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        )}

        {/* ── BIFURCATED FINANCIAL & SUMMARY METRICS + QBO RECONCILIATION ── */}
        <div className="space-y-4 pt-4 border-t border-gray-200">
          
          {/* Top Row: Volume & Financial Metrics Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 sm:gap-4">
            
            <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-xs flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-blue-50 text-[#00346f] shrink-0">
                <Package className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 block truncate">
                  Total Orders
                </span>
                <div className="font-serif text-xl sm:text-2xl font-bold text-gray-900 leading-tight">
                  {totalOrdersInView}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-xs flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-50 text-[#775a19] shrink-0">
                <ChefHat className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 block truncate">
                  Trays to Prep
                </span>
                <div className="font-serif text-xl sm:text-2xl font-bold text-[#775a19] leading-tight">
                  {totalTraysToPrep}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-xs flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-700 shrink-0">
                <DollarSign className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 block truncate">
                  Total Food Base Revenue
                </span>
                <div className="font-serif text-xl sm:text-2xl font-bold text-indigo-900 leading-tight">
                  ${totalNetFoodRevenueInView.toFixed(2)}
                </div>
                <span className="text-[9px] text-indigo-600 font-semibold block truncate">
                  (After discounts &amp; adjustments)
                </span>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-xs flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-purple-50 text-purple-700 shrink-0">
                <DollarSign className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 block truncate">
                  Texas Sales Tax
                </span>
                <div className="font-serif text-xl sm:text-2xl font-bold text-purple-900 leading-tight">
                  ${totalTaxInView.toFixed(2)}
                </div>
              </div>
            </div>

            <div className="col-span-2 sm:col-span-1 bg-white rounded-2xl border border-gray-200 p-4 shadow-xs flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-800 shrink-0">
                <DollarSign className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 block truncate">
                  Grand Total
                </span>
                <div className="font-serif text-xl sm:text-2xl font-bold text-emerald-900 leading-tight">
                  ${totalRevenueInView.toFixed(2)}
                </div>
              </div>
            </div>

          </div>

          {/* Bottom Banner: QuickBooks Online (QBO) Reconciliation Status */}
          <div className="bg-gradient-to-r from-[#00346f]/5 to-blue-50/60 rounded-2xl border border-[#00346f]/15 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-xl shrink-0 ${reconciledOrdersCountInView > 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-[#00346f]'}`}>
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-gray-900 flex items-center gap-2">
                  <span>QuickBooks Online (QBO) Reconciliation Status</span>
                  {reconciledOrdersCountInView > 0 ? (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] uppercase font-extrabold tracking-wider">
                      Reconciled ({reconciledOrdersCountInView}/{totalOrdersInView})
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full bg-blue-100 text-[#00346f] text-[10px] uppercase font-extrabold tracking-wider">
                      Scheduled for 11:59 PM CT Cron
                    </span>
                  )}
                </div>
                <div className="text-gray-600 text-[11px] mt-0.5">
                  {reconciledOrdersCountInView > 0 && sampleQboDocId ? (
                    <span>Sales Receipt created in QBO (Doc #{sampleQboDocId})</span>
                  ) : (
                    <span>Automated EOD consolidation running nightly via Vercel Cron (`/api/cron/reconcile-qbo`)</span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {syncResultMsg && (
                <span className="text-[11px] font-semibold text-[#00346f] animate-fade-in">
                  {syncResultMsg}
                </span>
              )}
              <button
                type="button"
                onClick={handleManualQBOReconcile}
                disabled={isSyncingQbo}
                className="min-h-[38px] px-3.5 py-1.5 rounded-xl bg-[#00346f] hover:bg-[#00224d] text-white text-xs font-bold uppercase tracking-wider transition-all shadow-xs disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncingQbo ? 'animate-spin' : ''}`} />
                <span>{isSyncingQbo ? 'Syncing...' : 'Sync QBO Now'}</span>
              </button>
            </div>
          </div>

        </div>

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
                  Daily Kitchen Prep Sheet — {selectedDate === 'all' ? 'All Upcoming Schedule' : selectedDate === todayDateStr ? `Today (${selectedDate})` : selectedDate}
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
                    Fulfillment Date: <strong className="text-gray-900">{selectedDate === 'all' ? 'All Upcoming Schedule' : selectedDate === todayDateStr ? `Today (${selectedDate})` : selectedDate}</strong> • Total Orders: {totalOrdersInView}
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
