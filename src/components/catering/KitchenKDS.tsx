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
  MessageCircle,
  BarChart3,
  ClipboardList,
  Search
} from 'lucide-react';
import type { CateringOrder, OrderStatus } from '../../types/catering';
import { getCentralTimeNow, getUpcomingDates } from '../../utils/centralTime';
import { fetchOrders, updateOrderStatus, subscribeToOrders, deleteOrderFromSupabase } from '../../services/supabase';
import KDSBlackoutManager from './KDSBlackoutManager';
import KDSEditOrderModal from './KDSEditOrderModal';
import KDSTiffinMenuModal from './KDSTiffinMenuModal';
import KDSAnalyticsTab, { classifyOrderItemSegment, normalizeDishName, type PrimarySegment } from './KDSAnalyticsTab';

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

      osc.type = 'triangle';
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
 */
function buildWhatsAppMessage(order: CateringOrder, eventType: 'accepted' | 'ready' | 'rejected'): string {
  const shortId = order.id ? order.id.slice(0, 8).toUpperCase() : '';
  const customerName = order.customer_name || 'Valued Customer';
  const dateStr = order.fulfillment_date || '';
  const timeStr = order.fulfillment_time || '';
  
  const cleanDescriptionFallback = (order.order_description || 'Catering items')
    .replace(/^\[ACCEPTED\]\s*/i, '')
    .replace(/\s*\[DISC:[^\]]+\]/gi, '');

  const itemsText = order.items && order.items.length > 0
    ? order.items.map(i => {
        const sizeStr = i.selectionLabel ? ` (${i.selectionLabel})` : '';
        const notesStr = i.notes ? ` [${i.notes}]` : '';
        const unitPriceStr = i.unitPrice > 0 ? ` @ $${i.unitPrice.toFixed(2)} ea` : '';
        return `• ${i.name}${sizeStr}${notesStr}\n  Qty: ${i.quantity}${unitPriceStr} = $${i.totalPrice.toFixed(2)}`;
      }).join('\n')
    : cleanDescriptionFallback;

  const locationText = order.is_delivery
    ? `Delivery destination: ${order.delivery_address || 'Address on file'}`
    : `Self-Pickup: 2437 Deerwood Dr, Little Elm, TX`;

  const foodSubtotal = order.food_subtotal || 0;
  const discountAmount = order.discount_amount || 0;
  const deliveryFee = order.delivery_fee || 0;
  const taxAmount = order.tax_amount || 0;
  const processingFee = order.processing_fee || 0;
  const grandTotal = order.total_amount || 0;

  const financialSummaryLines = [
    `FINANCIAL SUMMARY`,
    `• Food Subtotal: $${foodSubtotal.toFixed(2)}`,
    discountAmount > 0 ? `• Discount Applied: -$${discountAmount.toFixed(2)}${order.discount_reason ? ` (${order.discount_reason})` : ''}` : null,
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
    const statusHeader = order.is_delivery ? '🚗 Order Out for Delivery!' : '🍱 Order Ready for Pickup!';
    const actionText = order.is_delivery
      ? `your order #${shortId} is fresh & on its way for delivery!`
      : `your order #${shortId} is fresh & ready for pickup!`;
    const addressBlock = order.is_delivery
      ? `📍 Delivery Destination:\n${order.delivery_address || 'Address on file'}`
      : `📍 Pickup Location:\n2437 Deerwood Dr, Little Elm, TX`;

    const cleanItemsText = order.items && order.items.length > 0
      ? order.items.map(i => {
          const sizeStr = i.selectionLabel ? ` (${i.selectionLabel})` : '';
          const notesStr = i.notes ? ` [${i.notes}]` : '';
          return `• ${i.name}${sizeStr}${notesStr} (Qty: ${i.quantity})`;
        }).join('\n')
      : (order.order_description || 'Catering items');

    return (
`${statusHeader}

Hi ${customerName}, ${actionText}

${addressBlock}

🛍️ Items:
${cleanItemsText}

Thank you for your business! We hope you enjoy your meal. Please don't hesitate to share your feedback with us—we'd love to hear how everything was!

Desi Dabba | BlueBonnet Whisk`
    );
  }
}

export default function KitchenKDS({ onBackToOrder }: KitchenKDSProps) {
  // Primary KDS Tab: 'orders' (Live Queue) vs 'analytics' (Monthly Trends & Top Dishes)
  const [activeKdsTab, setActiveKdsTab] = useState<'orders' | 'analytics'>('orders');

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

  // Date, Status, Station & Search Filters
  const { dateStr: todayDateStr } = getCentralTimeNow();
  const [selectedDate, setSelectedDate] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [stationFilter, setStationFilter] = useState<'all' | PrimarySegment>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Orders and loading
  const [allOrders, setAllOrders] = useState<CateringOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Modals
  const [showPrepSheet, setShowPrepSheet] = useState(false);
  const [showBlackoutModal, setShowBlackoutModal] = useState(false);
  const [editingOrder, setEditingOrder] = useState<CateringOrder | null>(null);
  const [showTiffinModal, setShowTiffinModal] = useState(false);
  const [dismissedAlertPrompt, setDismissedAlertPrompt] = useState(false);

  // Audio chime settings
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

  useEffect(() => {
    if (typeof document !== 'undefined') {
      const prevTitle = document.title;
      document.title = "BlueBonnet KDS & Analytics | Bluebonnet Whisk";
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

  const handleIncomingNewOrder = (order: CateringOrder) => {
    if (soundEnabled) {
      playKitchenChime();
    }

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

    setNewOrderAlert(order);
  };

  const handleEnableAlerts = async () => {
    playKitchenChime();

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
            body: 'Live order alerts active! You will hear a bell chime and receive popups whenever an order is punched.',
            icon: '/favicon.ico'
          });
        } else if (res === 'denied') {
          alert('Notification permission was blocked in browser settings. Please allow notifications for bluebonnetwhisk.com.');
        }
      } catch (err) {
        console.warn('Notification permission error:', err);
      }
    } else {
      alert('Desktop notifications are not supported in this browser tab. On iPhone / iPad Safari, tap Share ➔ "Add to Home Screen".');
    }
  };

  const loadOrders = async () => {
    setIsRefreshing(true);
    try {
      const data = await fetchOrders();
      const activeData = data.filter(o => o.status !== 'cancelled');
      
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

      const pollTimer = setInterval(() => {
        loadOrders();
      }, 7000);

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
      // Fallback for local dev
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

  // Extract real Supabase UUID if an order is a virtual daily slice (e.g. "uuid::2026-10-20")
  const getBaseOrderId = (orderId: string) => orderId.split('::')[0];

  const handleDenyOrder = async (order: CateringOrder) => {
    const baseId = getBaseOrderId(order.id);
    const shortId = baseId ? baseId.slice(0, 8).toUpperCase() : '';
    const confirmDeny = window.confirm(
      `Are you sure you want to DENY / REJECT order #${shortId} for ${order.customer_name}?\n\nThis will trigger a rejection WhatsApp message to the customer, and permanently delete the order entry from Supabase and KDS.`
    );
    if (!confirmDeny) return;

    knownOrderIdsRef.current.delete(baseId);
    setAllOrders(prev => prev.filter(o => o.id !== baseId));
    openWhatsAppForOrder(order, 'rejected');
    await deleteOrderFromSupabase(baseId);
  };

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    const baseId = getBaseOrderId(orderId);
    setAllOrders(prev => prev.map(o => o.id === baseId ? { ...o, status: newStatus } : o));
    await updateOrderStatus(baseId, newStatus);
  };

  // Normalize orders so any single order row containing items across multiple YYYY-MM-DD dates
  // is automatically split day-by-day in KDS (one card per date with only that day's items).
  const kdsNormalizedOrders = useMemo(() => {
    const expanded: CateringOrder[] = [];

    for (const order of allOrders) {
      const items = order.items || [];
      const dateGroups = new Map<string, typeof items>();
      const undatedItems: typeof items = [];

      for (const item of items) {
        const match =
          item.id?.match(/\d{4}-\d{2}-\d{2}/) ||
          item.menuItemId?.match(/\d{4}-\d{2}-\d{2}/) ||
          item.notes?.match(/\d{4}-\d{2}-\d{2}/);
        if (match) {
          const dStr = match[0];
          if (!dateGroups.has(dStr)) dateGroups.set(dStr, []);
          dateGroups.get(dStr)!.push(item);
        } else {
          undatedItems.push(item);
        }
      }

      if (dateGroups.size <= 1) {
        if (dateGroups.size === 1) {
          const [onlyDate] = Array.from(dateGroups.keys());
          if (onlyDate && onlyDate !== order.fulfillment_date) {
            expanded.push({ ...order, fulfillment_date: onlyDate });
            continue;
          }
        }
        expanded.push(order);
      } else {
        const sortedDates = Array.from(dateGroups.keys()).sort();
        const totalDays = sortedDates.length;

        sortedDates.forEach((dStr, idx) => {
          const dayItems = idx === 0 && undatedItems.length > 0
            ? [...(dateGroups.get(dStr) || []), ...undatedItems]
            : (dateGroups.get(dStr) || []);

          const dayGross = Math.round(dayItems.reduce((s, i) => s + (i.totalPrice || 0), 0) * 100) / 100;
          const dayFoodBase = Math.round((dayGross / 1.0825) * 100) / 100;
          const dayTax = Math.round((dayGross - dayFoodBase) * 100) / 100;

          const cleanedTime = (order.fulfillment_time || '').replace(/\s*\(All \d+ Days\)/i, '').trim() || order.fulfillment_time;

          expanded.push({
            ...order,
            id: idx === 0 ? order.id : `${order.id}::${dStr}`,
            fulfillment_date: dStr,
            fulfillment_time: cleanedTime,
            items: dayItems,
            food_subtotal: dayFoodBase,
            tax_amount: dayTax,
            total_amount: dayGross,
            order_description: dayItems.map(i => `${i.name}${i.notes ? ` [${i.notes}]` : ''} (${i.selectionLabel} × ${i.quantity}) [$${i.totalPrice.toFixed(2)}]`).join('; '),
            dietary_notes: `[Day ${idx + 1} of ${totalDays} • Weekly Tiffin]${order.dietary_notes ? ` | ${order.dietary_notes}` : ''}`
          });
        });
      }
    }

    return expanded;
  }, [allOrders]);

  // Orders filtered by the currently selected date tab ('all' or specific YYYY-MM-DD)
  const ordersForSelectedDate = useMemo(() => {
    const list = selectedDate === 'all'
      ? [...kdsNormalizedOrders]
      : kdsNormalizedOrders.filter(o => o.fulfillment_date === selectedDate);

    return list.sort((a, b) => {
      const dateA = a.fulfillment_date || '';
      const dateB = b.fulfillment_date || '';
      const dateCmp = dateA.localeCompare(dateB);
      if (dateCmp !== 0) return dateCmp;

      const timeA = parseTimeToMinutes(a.fulfillment_time);
      const timeB = parseTimeToMinutes(b.fulfillment_time);
      if (timeA !== timeB) return timeA - timeB;

      return (a.created_at || '').localeCompare(b.created_at || '');
    });
  }, [kdsNormalizedOrders, selectedDate]);

  // Order counts grouped by date for badge counters on date buttons
  const orderCountsByDate = useMemo(() => {
    const map = new Map<string, number>();
    kdsNormalizedOrders.filter(o => o.status !== 'cancelled' && o.status !== 'completed').forEach(o => {
      map.set(o.fulfillment_date, (map.get(o.fulfillment_date) || 0) + 1);
    });
    return map;
  }, [kdsNormalizedOrders]);

  const totalActiveOrdersCount = useMemo(() => {
    return kdsNormalizedOrders.filter(o => o.status !== 'cancelled' && o.status !== 'completed').length;
  }, [kdsNormalizedOrders]);

  // Status counts for the selected date schedule
  const statusCounts = useMemo(() => {
    const counts = {
      all: 0,
      new: 0,
      accepted: 0,
      preparing: 0,
      ready: 0,
      completed: 0
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
    });
    return counts;
  }, [ordersForSelectedDate]);

  // Filtered orders list by status, station, and search query
  const activeOrders = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    return ordersForSelectedDate.filter(o => {
      // 1. Status filter
      if (statusFilter === 'all') {
        if (o.status === 'cancelled' || o.status === 'completed') return false;
      } else if (o.status !== statusFilter) {
        return false;
      }

      // 2. Station / Category filter
      if (stationFilter !== 'all') {
        const hasStationItem = (o.items || []).some(
          item => classifyOrderItemSegment(item) === stationFilter
        );
        if (!hasStationItem) return false;
      }

      // 3. Search query filter
      if (q) {
        const matchName = (o.customer_name || '').toLowerCase().includes(q);
        const matchPhone = (o.phone_number || '').toLowerCase().includes(q);
        const matchId = (o.id || '').toLowerCase().includes(q);
        const matchDish = (o.items || []).some(i => (i.name || '').toLowerCase().includes(q));
        if (!matchName && !matchPhone && !matchId && !matchDish) return false;
      }

      return true;
    });
  }, [ordersForSelectedDate, statusFilter, stationFilter, searchQuery]);

  // KPI Header Calculations for currently viewed date selection
  const nonCancelledOrders = ordersForSelectedDate.filter(o => o.status !== 'cancelled');
  const totalOrdersInView = nonCancelledOrders.length;

  const totalTraysToPrep = nonCancelledOrders.reduce((sum, order) => {
    const traysInOrder = order.items
      .filter(item => item.selectionType === 'third' || item.selectionType === 'half' || item.selectionType === 'full')
      .reduce((sub, item) => sub + item.quantity, 0);
    return sum + traysInOrder;
  }, 0);

  const totalNetFoodRevenueInView = nonCancelledOrders.reduce((sum, order) => {
    return sum + Math.max(0, order.food_subtotal || 0);
  }, 0);
  const totalTaxInView = nonCancelledOrders.reduce((sum, order) => sum + (order.tax_amount || 0), 0);
  const totalRevenueInView = nonCancelledOrders.reduce((sum, order) => sum + (order.total_amount || 0), 0);

  // QBO Reconciliation Status in View
  const reconciledOrdersCountInView = nonCancelledOrders.filter(o => o.reconciled_to_qbo).length;
  const sampleQboDocId = nonCancelledOrders.find(o => o.qbo_doc_id)?.qbo_doc_id;

  const [isSyncingQbo, setIsSyncingQbo] = useState(false);
  const [syncResultMsg, setSyncResultMsg] = useState<string | null>(null);

  const handleManualQBOReconcile = async () => {
    setIsSyncingQbo(true);
    setSyncResultMsg(null);
    try {
      const res = await fetch(`/api/cron/reconcile-qbo`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ action: 'manual_reconcile' })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSyncResultMsg(data.message || `QBO Reconciliation completed!`);
        loadOrders();
      } else {
        setSyncResultMsg(data.error || data.message || `Sync status ${res.status}`);
      }
    } catch (err: any) {
      setSyncResultMsg(`Sync error: ${err?.message || 'Connection failed'}`);
    } finally {
      setIsSyncingQbo(false);
      setTimeout(() => setSyncResultMsg(null), 8000);
    }
  };

  // Upgraded Aggregated Prep Sheet Data (Supports Trays, Tiffins, Containers, Breads, Gallons & Custom Cakes)
  const prepSheetSummary = useMemo(() => {
    const map = new Map<string, {
      name: string;
      category: string;
      tier?: string;
      thirdCount: number;
      halfCount: number;
      fullCount: number;
      tiffinCount: number;
      otherUnits: string[];
    }>();

    nonCancelledOrders.forEach(order => {
      order.items.forEach(item => {
        const cleanName = normalizeDishName(item.name);
        const key = cleanName.toLowerCase();
        if (!map.has(key)) {
          map.set(key, {
            name: cleanName,
            category: item.categoryLabel,
            tier: item.tier,
            thirdCount: 0,
            halfCount: 0,
            fullCount: 0,
            tiffinCount: 0,
            otherUnits: []
          });
        }
        const record = map.get(key)!;
        if (item.selectionType === 'third') record.thirdCount += item.quantity;
        else if (item.selectionType === 'half') record.halfCount += item.quantity;
        else if (item.selectionType === 'full') record.fullCount += item.quantity;
        else if (item.selectionType.startsWith('tiffin_')) record.tiffinCount += item.quantity;
        else {
          record.otherUnits.push(`${item.quantity}× ${item.selectionLabel || item.selectionType}`);
        }
      });
    });

    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [nonCancelledOrders]);

  const upcomingDateOptions = getUpcomingDates(8, true);

  // ── PIN AUTHENTICATION MODAL ──
  if (!isUnlocked) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4 bg-[#fbfbfa] font-sans">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-[#775a19]/20 p-7 text-center animate-fade-in">
          <div className="w-24 h-24 rounded-3xl overflow-hidden shadow-lg border-4 border-[#ffdea5] mx-auto mb-4 bg-[#00346f] flex items-center justify-center p-1">
            <img src="/bluebonnet_oms_logo.jpg" alt="BlueBonnet Logo" className="w-full h-full object-cover rounded-2xl" />
          </div>

          <h2 className="font-serif text-xl font-bold text-[#00346f] leading-snug">
            BlueBonnet Kitchen Display &amp; Analytics
          </h2>
          <p className="text-xs text-gray-500 mt-1 mb-5">
            Authorized staff only. Enter security PIN to unlock.
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
                className={`w-48 text-center text-2xl font-mono tracking-widest py-2.5 border rounded-xl focus:outline-none focus:ring-2 ${
                  pinError 
                    ? 'border-rose-500 focus:ring-rose-200 bg-rose-50' 
                    : 'border-gray-300 focus:ring-[#00346f]/20 focus:border-[#00346f]'
                }`}
              />
              {pinError && (
                <p className="text-xs text-rose-600 mt-1.5 font-semibold">
                  Incorrect PIN. Please try again.
                </p>
              )}
            </div>

            <div className="grid grid-cols-3 gap-2 max-w-[210px] mx-auto">
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
                  className="py-2 rounded-lg bg-gray-50 hover:bg-gray-150 border border-gray-200 text-sm font-bold text-gray-800 transition-colors cursor-pointer"
                >
                  {val}
                </button>
              ))}
            </div>

            <div className="pt-2 flex flex-col gap-2">
              <button
                type="submit"
                className="w-full bg-[#00346f] hover:bg-[#00224d] text-white py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-md cursor-pointer"
              >
                Unlock Kitchen KDS
              </button>
              {onBackToOrder && (
                <button
                  type="button"
                  onClick={onBackToOrder}
                  className="text-xs text-gray-500 hover:text-[#00346f] pt-1 flex items-center justify-center gap-1.5 mx-auto transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Exit to Website</span>
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
    <div className="min-h-screen bg-[#f7f8fa] p-3 sm:p-5 lg:p-6 font-sans">
      <div className="max-w-7xl mx-auto space-y-4">
        
        {/* ── LEAN COMMAND HEADER & PRIMARY MODE TABS ── */}
        <div className="bg-white rounded-2xl border border-gray-200 p-3.5 sm:p-4 shadow-xs space-y-3">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            {/* Brand & Primary View Switcher */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between lg:justify-start gap-3">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl overflow-hidden border-2 border-[#ffdea5] shadow-xs shrink-0 bg-[#00346f] flex items-center justify-center p-0.5">
                  <img src="/bluebonnet_oms_logo.jpg" alt="BlueBonnet Logo" className="w-full h-full object-cover rounded-lg" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="font-serif text-base sm:text-lg font-bold text-[#00346f] leading-tight">
                      BlueBonnet Kitchen KDS
                    </h1>
                    <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Live
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-500">
                    {new Date().toLocaleDateString('en-US', { timeZone: 'America/Chicago', weekday: 'short', month: 'short', day: 'numeric' })} CT • <strong className="text-[#00346f]">{totalActiveOrdersCount} Active</strong>
                  </p>
                </div>
              </div>

              {/* Primary Mode Switcher: [ Live Orders | Analytics ] */}
              <div className="inline-flex items-center bg-gray-100 p-1 rounded-xl border border-gray-200 self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => setActiveKdsTab('orders')}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                    activeKdsTab === 'orders'
                      ? 'bg-[#00346f] text-white shadow-xs'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <ClipboardList className="w-3.5 h-3.5" />
                  <span>Live Orders</span>
                  {totalActiveOrdersCount > 0 && (
                    <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                      activeKdsTab === 'orders' ? 'bg-[#ffdea5] text-[#00346f]' : 'bg-gray-200 text-gray-800'
                    }`}>
                      {totalActiveOrdersCount}
                    </span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setActiveKdsTab('analytics')}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                    activeKdsTab === 'analytics'
                      ? 'bg-[#00346f] text-white shadow-xs'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <BarChart3 className="w-3.5 h-3.5" />
                  <span>Analytics</span>
                </button>
              </div>
            </div>

            {/* Compact Action Toolbar */}
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                onClick={() => setShowPrepSheet(true)}
                className="inline-flex items-center gap-1.5 bg-[#775a19] hover:bg-[#5e4612] text-white px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-2xs cursor-pointer min-h-[34px]"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Prep Sheet</span>
              </button>

              <button
                onClick={() => setShowTiffinModal(true)}
                className="inline-flex items-center gap-1.5 border border-purple-300 bg-purple-50/50 hover:bg-purple-100 text-purple-900 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer min-h-[34px]"
              >
                <ImageIcon className="w-3.5 h-3.5 text-purple-700" />
                <span>Tiffin Menu</span>
              </button>

              <button
                onClick={() => setShowBlackoutModal(true)}
                className="inline-flex items-center gap-1 border border-rose-200 hover:bg-rose-50 text-rose-900 px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer min-h-[34px]"
                title="Manage Blackout Dates"
              >
                <Ban className="w-3.5 h-3.5 text-rose-600" />
                <span className="hidden sm:inline">Blackouts</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  const next = !soundEnabled;
                  setSoundEnabled(next);
                  localStorage.setItem('bbw_kds_sound_enabled', String(next));
                  if (next) playKitchenChime();
                }}
                className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition cursor-pointer min-h-[34px] ${
                  soundEnabled 
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                    : 'bg-gray-50 text-gray-400 border-gray-200'
                }`}
                title={soundEnabled ? "Chime ON (Tap to mute)" : "Chime Muted"}
              >
                {soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-emerald-600" /> : <VolumeX className="w-3.5 h-3.5" />}
                <span className="hidden md:inline">{soundEnabled ? 'Bell' : 'Muted'}</span>
              </button>

              <button
                onClick={loadOrders}
                disabled={isRefreshing}
                className="inline-flex items-center gap-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer min-h-[34px]"
                title="Refresh Orders"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
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
                className="inline-flex items-center gap-1 border border-gray-200 hover:bg-gray-100 text-gray-600 px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer min-h-[34px]"
                title="Change PIN"
              >
                <KeyRound className="w-3.5 h-3.5 text-amber-700" />
              </button>

              <button
                onClick={handleLock}
                className="inline-flex items-center gap-1 border border-gray-200 hover:bg-gray-100 text-gray-600 px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer min-h-[34px]"
                title="Lock KDS"
              >
                <Lock className="w-3.5 h-3.5" />
              </button>

              {onBackToOrder && (
                <button
                  type="button"
                  onClick={onBackToOrder}
                  className="inline-flex items-center gap-1 bg-[#00346f] hover:bg-[#00224d] text-white px-2.5 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer min-h-[34px]"
                  title="Return to Website"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Exit</span>
                </button>
              )}
            </div>
          </div>

          {/* Sleek 1-Line Browser Notification Prompt (if not granted & not dismissed) */}
          {notificationPermission !== 'granted' && !dismissedAlertPrompt && (
            <div className="bg-blue-50/90 border border-blue-200 rounded-xl px-3 py-2 flex items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2 text-blue-950 min-w-0">
                <BellRing className="w-4 h-4 text-blue-600 shrink-0 animate-pulse" />
                <span className="truncate">
                  <strong>Live Kitchen Alerts:</strong> Enable push notifications &amp; audio chime for incoming orders.
                </span>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={handleEnableAlerts}
                  className="px-2.5 py-1 bg-[#00346f] hover:bg-[#00224d] text-white text-[11px] font-bold rounded-lg cursor-pointer"
                >
                  Enable
                </button>
                <button
                  type="button"
                  onClick={() => setDismissedAlertPrompt(true)}
                  className="p-1 text-gray-400 hover:text-gray-700 cursor-pointer"
                  aria-label="Dismiss"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ── NEW ORDER LIVE ALERT BANNER ── */}
        {newOrderAlert && (
          <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-rose-600 text-white rounded-2xl p-4 shadow-xl border-2 border-white/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                <BellRing className="w-5 h-5 text-white animate-bounce" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="bg-white text-rose-700 text-[10px] font-black uppercase px-2 py-0.5 rounded-full tracking-wider">
                    🔔 New Order!
                  </span>
                  <span className="text-sm font-bold">
                    {newOrderAlert.customer_name} • ${newOrderAlert.total_amount.toFixed(2)} ({newOrderAlert.items.length} items)
                  </span>
                </div>
                <p className="text-xs text-white/90 mt-0.5">
                  Scheduled: <strong>{newOrderAlert.fulfillment_date}</strong> @ <strong>{newOrderAlert.fulfillment_time || 'TBD'}</strong> • {newOrderAlert.is_delivery ? '🚚 Delivery' : '🏪 Pickup'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => {
                  setActiveKdsTab('orders');
                  setSelectedDate(newOrderAlert.fulfillment_date);
                  setNewOrderAlert(null);
                }}
                className="bg-white hover:bg-amber-50 text-rose-700 px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-sm cursor-pointer flex items-center gap-1"
              >
                <span>View Order</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setNewOrderAlert(null)}
                className="bg-black/20 hover:bg-black/40 text-white p-1.5 rounded-xl cursor-pointer"
                title="Dismiss"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ── TAB 2: ANALYTICS & MONTHLY INSIGHTS ── */}
        {activeKdsTab === 'analytics' ? (
          <KDSAnalyticsTab orders={allOrders} />
        ) : (
          <>
            {/* ── TAB 1: LIVE ORDERS SCHEDULE, STATION FILTER & SEARCH ── */}
            <div className="bg-white rounded-2xl border border-gray-200 p-3.5 shadow-xs space-y-2.5">
              
              {/* Row 1: Schedule Date Ribbon */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 pb-2.5 border-b border-gray-150">
                <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none min-w-0 flex-1">
                  <span className="text-[11px] font-bold text-gray-500 mr-1 flex items-center gap-1 shrink-0">
                    <CalendarIcon className="w-3.5 h-3.5 text-[#00346f]" />
                    <span>Date:</span>
                  </span>

                  <button
                    type="button"
                    onClick={() => setSelectedDate('all')}
                    className={`px-2.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                      selectedDate === 'all'
                        ? 'bg-[#00346f] text-white shadow-2xs'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                    }`}
                  >
                    <span>All Upcoming</span>
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
                        className={`px-2.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                          isSelected
                            ? isToday
                              ? 'bg-amber-600 text-white shadow-2xs ring-2 ring-amber-300'
                              : 'bg-[#00346f] text-white shadow-2xs'
                            : isToday
                            ? count > 0
                              ? 'bg-amber-100 text-amber-950 border border-amber-300 font-extrabold'
                              : 'bg-amber-50 text-amber-900 border border-amber-200 font-bold'
                            : count > 0
                            ? 'bg-blue-50 border border-blue-200 text-[#00346f]'
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
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <input
                    type="date"
                    value={selectedDate === 'all' ? todayDateStr : selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="px-2.5 py-1 bg-gray-50 border border-gray-300 rounded-lg text-xs text-gray-700 focus:outline-none"
                  />
                </div>
              </div>

              {/* Row 2: Status Pipeline + Kitchen Station Filter + Quick Search */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2.5">
                {/* Status Tabs */}
                <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl overflow-x-auto scrollbar-none">
                  {[
                    { key: 'all', label: 'Active', count: statusCounts.all },
                    { key: 'new', label: 'New', count: statusCounts.new },
                    { key: 'accepted', label: 'Accepted', count: statusCounts.accepted },
                    { key: 'preparing', label: 'Prep', count: statusCounts.preparing },
                    { key: 'ready', label: 'Ready', count: statusCounts.ready },
                    { key: 'completed', label: 'Done', count: statusCounts.completed }
                  ].map(tab => (
                    <button
                      key={tab.key}
                      type="button"
                      onClick={() => setStatusFilter(tab.key)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1 ${
                        statusFilter === tab.key
                          ? 'bg-white text-[#00346f] shadow-2xs font-extrabold'
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

                {/* Station Filter & Search Input */}
                <div className="flex flex-wrap sm:flex-nowrap items-center gap-2">
                  {/* Station Pills */}
                  <div className="inline-flex items-center bg-gray-100 p-1 rounded-xl text-xs">
                    {[
                      { key: 'all', label: 'All' },
                      { key: 'tiffin', label: '🍱 Tiffin' },
                      { key: 'catering', label: '🍛 Catering' },
                      { key: 'cakes', label: '🎂 Cakes' }
                    ].map(st => (
                      <button
                        key={st.key}
                        type="button"
                        onClick={() => setStationFilter(st.key as 'all' | PrimarySegment)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer whitespace-nowrap ${
                          stationFilter === st.key
                            ? 'bg-[#00346f] text-white shadow-2xs'
                            : 'text-gray-600 hover:text-gray-900'
                        }`}
                      >
                        {st.label}
                      </button>
                    ))}
                  </div>

                  {/* Quick Search */}
                  <div className="relative flex-1 sm:w-48">
                    <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      placeholder="Search name, #ID, dish..."
                      className="w-full pl-8 pr-7 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:bg-white focus:border-[#00346f]"
                    />
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={() => setSearchQuery('')}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* ── LIVE ORDER CARDS GRID ── */}
            {isLoading ? (
              <div className="py-16 text-center text-gray-400">
                <RefreshCw className="w-7 h-7 mx-auto animate-spin mb-2 text-[#00346f]" />
                <p className="text-xs font-semibold">Loading live kitchen orders...</p>
              </div>
            ) : activeOrders.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-200 p-8 sm:p-10 text-center shadow-xs space-y-3">
                <ChefHat className="w-10 h-10 mx-auto text-gray-300" />
                <div>
                  <h3 className="font-serif text-base sm:text-lg font-bold text-gray-800">
                    No matching orders for {selectedDate === 'all' ? 'All Upcoming' : selectedDate === todayDateStr ? 'Today' : selectedDate}
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {statusFilter !== 'all' || stationFilter !== 'all' || searchQuery
                      ? 'Try clearing your status, station, or search filter.'
                      : 'No orders scheduled for this date.'}
                  </p>
                </div>

                {(statusFilter !== 'all' || stationFilter !== 'all' || searchQuery) && (
                  <button
                    type="button"
                    onClick={() => {
                      setStatusFilter('all');
                      setStationFilter('all');
                      setSearchQuery('');
                    }}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold rounded-xl cursor-pointer"
                  >
                    Reset Filters
                  </button>
                )}

                {selectedDate !== 'all' && totalActiveOrdersCount > 0 && (
                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={() => setSelectedDate('all')}
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#00346f] hover:bg-[#00224d] text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-xs transition cursor-pointer"
                    >
                      <span>View All {totalActiveOrdersCount} Active Orders</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {activeOrders.map(order => {
                  const totalTraysInThisOrder = order.items
                    .filter(i => i.selectionType === 'third' || i.selectionType === 'half' || i.selectionType === 'full')
                    .reduce((sum, i) => sum + i.quantity, 0);

                  const totalUnitsInOrder = order.items.reduce((s, i) => s + i.quantity, 0);

                  // Determine which stations are represented in this order
                  const orderSegments = Array.from(
                    new Set((order.items || []).map(i => classifyOrderItemSegment(i)))
                  );

                  const hasSatvik = order.dietary_notes?.toLowerCase().includes('satvik') || 
                                    order.dietary_notes?.toLowerCase().includes('jain');

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
                          : 'border-gray-200'
                      }`}
                    >
                      {/* High-Visibility Saffron Satvik / Allergen Banner */}
                      {hasSatvik && (
                        <div className="bg-amber-500 text-black px-3.5 py-1 text-[11px] font-black uppercase tracking-wider rounded-t-2xl flex items-center justify-between border-b border-amber-600">
                          <div className="flex items-center gap-1.5">
                            <AlertTriangle className="w-3.5 h-3.5 text-black shrink-0" />
                            <span>SATVIK / NO ONION NO GARLIC</span>
                          </div>
                          <span className="text-[9px] bg-black text-amber-400 px-1.5 py-0.5 rounded font-mono font-bold">STRICT</span>
                        </div>
                      )}

                      {/* Card Header */}
                      <div className="p-4 border-b border-gray-150 space-y-2">
                        {/* 4-Step Pipeline Bar */}
                        <div className="flex items-center gap-1 w-full">
                          {['New', 'Accepted', 'Prep', 'Ready'].map((stepLabel, idx) => {
                            const stepNum = idx + 1;
                            const isCurrent = stepIndex === stepNum;
                            const isPast = stepIndex > stepNum;
                            return (
                              <div key={stepLabel} className="flex-1 flex flex-col items-center gap-0.5">
                                <div className={`h-1.5 w-full rounded-full transition-all ${
                                  isPast ? 'bg-emerald-500' : isCurrent ? 'bg-[#00346f]' : 'bg-gray-200'
                                }`} />
                                <span className={`text-[8px] font-bold uppercase tracking-widest ${
                                  isCurrent ? 'text-[#00346f]' : isPast ? 'text-emerald-700' : 'text-gray-400'
                                }`}>
                                  {stepLabel}
                                </span>
                              </div>
                            );
                          })}
                        </div>

                        {/* Order ID, Station Badges & Status */}
                        <div className="flex items-center justify-between gap-1.5 pt-0.5 flex-wrap">
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono text-xs font-extrabold text-gray-500">
                              #{order.id.slice(0, 8).toUpperCase()}
                            </span>
                            {orderSegments.map(seg => (
                              <span
                                key={seg}
                                className={`px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase ${
                                  seg === 'tiffin'
                                    ? 'bg-amber-100 text-amber-900'
                                    : seg === 'cakes'
                                    ? 'bg-pink-100 text-pink-900'
                                    : 'bg-blue-50 text-[#00346f]'
                                }`}
                              >
                                {seg === 'tiffin' ? '🍱 Tiffin' : seg === 'cakes' ? '🎂 Cake' : '🍛 Catering'}
                              </span>
                            ))}
                          </div>

                          <div className="flex items-center gap-1">
                            {order.order_type === 'estimate' && (
                              <span className="px-1.5 py-0.5 bg-purple-100 text-purple-800 rounded text-[9px] font-extrabold uppercase">
                                Estimate
                              </span>
                            )}
                            <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider ${
                              order.status === 'new'
                                ? 'bg-blue-100 text-blue-900'
                                : order.status === 'accepted'
                                ? 'bg-emerald-100 text-emerald-900'
                                : order.status === 'preparing'
                                ? 'bg-amber-100 text-amber-900'
                                : order.status === 'ready'
                                ? 'bg-teal-100 text-teal-900'
                                : 'bg-gray-100 text-gray-700'
                            }`}>
                              {order.status === 'new' ? 'New' : order.status}
                            </span>
                          </div>
                        </div>

                        {/* Customer Name & Time Slot */}
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h3 className="font-serif font-bold text-base text-gray-900 leading-tight">
                              {order.customer_name}
                            </h3>
                            <a
                              href={`tel:${order.phone_number}`}
                              className="inline-flex items-center gap-1 text-xs text-gray-600 hover:text-[#00346f] font-semibold mt-0.5"
                            >
                              <Phone className="w-3 h-3 text-gray-400" />
                              <span>{order.phone_number}</span>
                            </a>
                          </div>

                          <div className="text-right shrink-0">
                            <span className="font-mono text-sm font-black text-[#00346f] bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-200 block">
                              {order.fulfillment_time || 'TBD'}
                            </span>
                            <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded mt-1 inline-block ${
                              order.fulfillment_date === todayDateStr
                                ? 'bg-amber-100 text-amber-900'
                                : 'text-gray-500'
                            }`}>
                              {order.fulfillment_date === todayDateStr ? 'Today' : order.fulfillment_date}
                            </span>
                          </div>
                        </div>

                        {/* Compact Delivery / Pickup Pill */}
                        <div className="text-[11px]">
                          {order.is_delivery ? (
                            <div className="flex items-start gap-1.5 text-amber-950 bg-amber-50/80 px-2.5 py-1.5 rounded-xl border border-amber-200">
                              <Truck className="w-3.5 h-3.5 text-amber-700 shrink-0 mt-0.5" />
                              <span className="leading-snug">
                                <strong className="font-bold">Delivery:</strong> {order.delivery_address || 'Address on file'}
                              </span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5 text-gray-600 bg-gray-50 px-2.5 py-1 rounded-xl">
                              <Store className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                              <span>Self-Pickup (Deerwood Dr, Little Elm)</span>
                            </div>
                          )}
                        </div>

                        {order.dietary_notes && !hasSatvik && (
                          <div className="text-[11px] text-amber-900 bg-amber-50/60 px-2.5 py-1.5 rounded-xl border border-amber-200/70 italic">
                            &quot;{order.dietary_notes}&quot;
                          </div>
                        )}
                      </div>

                      {/* Itemized List */}
                      <div className="p-4 flex-1 space-y-1.5">
                        <div className="flex justify-between items-center text-[10px] font-extrabold text-gray-500 uppercase tracking-wider pb-1 border-b border-gray-100">
                          <span>Items ({order.items.length})</span>
                          <span className="bg-gray-100 px-2 py-0.5 rounded text-gray-800 font-mono">
                            {totalTraysInThisOrder > 0 ? `${totalTraysInThisOrder} Trays` : `${totalUnitsInOrder} Units`}
                          </span>
                        </div>

                        <div className="space-y-1.5 text-xs max-h-44 overflow-y-auto pr-1">
                          {order.items.map((item, idx) => (
                            <div key={idx} className="flex justify-between items-start gap-2 py-1 border-b border-gray-100 last:border-0">
                              <div className="min-w-0">
                                <span className="font-bold text-gray-900 block leading-snug">
                                  {item.name}
                                </span>
                                <span className="text-[10px] text-gray-500 font-medium block">
                                  {item.selectionLabel} {item.tier ? `• ${item.tier}` : ''}
                                  {item.notes ? ` • ${item.notes}` : ''}
                                </span>
                              </div>
                              <span className="font-mono font-extrabold text-[#00346f] px-2 py-0.5 bg-blue-50 border border-blue-100 rounded text-xs shrink-0">
                                &times;{item.quantity}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Card Footer */}
                      <div className="p-3.5 bg-gray-50 border-t border-gray-150 rounded-b-2xl space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-baseline gap-2">
                            <span className="text-sm font-extrabold text-gray-900 font-mono">
                              ${order.total_amount.toFixed(2)}
                            </span>
                            {Boolean((order.discount_amount && order.discount_amount > 0) || (order.rebate_amount && order.rebate_amount > 0)) && (
                              <span className="text-[10px] text-purple-700 font-bold">
                                {order.discount_amount ? `-$${order.discount_amount.toFixed(2)} Disc` : ''}
                              </span>
                            )}
                          </div>

                          {order.reconciled_to_qbo ? (
                            <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2 py-0.5 rounded-md border border-emerald-300">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>QBO #{order.qbo_doc_id || 'OK'}</span>
                            </span>
                          ) : (
                            <span className="text-[10px] font-semibold text-gray-400">
                              QBO Pending
                            </span>
                          )}
                        </div>

                        {/* Touch Action Bar */}
                        <div className="flex items-center justify-between gap-1.5 pt-1 border-t border-gray-200">
                          <button
                            type="button"
                            onClick={() => {
                              const baseOrder = allOrders.find(o => o.id === getBaseOrderId(order.id)) || order;
                              setEditingOrder(baseOrder);
                            }}
                            className="inline-flex items-center gap-1 px-2.5 py-2 rounded-xl border border-gray-300 hover:bg-gray-100 text-gray-700 text-xs font-bold cursor-pointer transition-colors"
                            title="Edit order"
                          >
                            <FileEdit className="w-3.5 h-3.5 text-[#00346f]" />
                            <span>Edit</span>
                          </button>

                          {order.status === 'new' && (
                            <div className="flex items-center gap-1.5 flex-1 justify-end">
                              <button
                                type="button"
                                onClick={() => {
                                  handleStatusChange(order.id, 'accepted');
                                  openWhatsAppForOrder(order, 'accepted');
                                }}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2 rounded-xl text-xs font-extrabold transition-all shadow-2xs cursor-pointer flex items-center justify-center gap-1 flex-1"
                              >
                                <Check className="w-3.5 h-3.5" />
                                <span>Accept</span>
                                <MessageCircle className="w-3 h-3 text-emerald-200" />
                              </button>

                              <button
                                type="button"
                                onClick={() => handleDenyOrder(order)}
                                className="bg-rose-600 hover:bg-rose-700 text-white px-2.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1"
                                title="Deny order"
                              >
                                <Ban className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}

                          {order.status === 'accepted' && (
                            <div className="flex items-center gap-1.5 flex-1 justify-end">
                              <button
                                type="button"
                                onClick={() => openWhatsAppForOrder(order, 'accepted')}
                                className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 px-2.5 py-2 rounded-xl text-xs font-bold cursor-pointer"
                                title="Resend WhatsApp confirmation"
                              >
                                <MessageCircle className="w-3.5 h-3.5 text-emerald-700" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleStatusChange(order.id, 'preparing')}
                                className="bg-amber-600 hover:bg-amber-700 text-white px-3 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center justify-center gap-1 flex-1"
                              >
                                <span>Start Prep</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}

                          {order.status === 'preparing' && (
                            <button
                              type="button"
                              onClick={() => {
                                handleStatusChange(order.id, 'ready');
                                openWhatsAppForOrder(order, 'ready');
                              }}
                              className="bg-teal-600 hover:bg-teal-700 text-white px-3 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center justify-center gap-1.5 flex-1"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Mark Ready</span>
                              <MessageCircle className="w-3 h-3 text-teal-200" />
                            </button>
                          )}

                          {order.status === 'ready' && (
                            <div className="flex items-center gap-1.5 flex-1 justify-end">
                              <button
                                type="button"
                                onClick={() => openWhatsAppForOrder(order, 'ready')}
                                className="bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-300 px-2.5 py-2 rounded-xl text-xs font-bold cursor-pointer"
                                title="Resend Ready WhatsApp"
                              >
                                <MessageCircle className="w-3.5 h-3.5 text-teal-700" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleStatusChange(order.id, 'completed')}
                                className="bg-[#00346f] hover:bg-[#00224d] text-white px-3 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex-1"
                              >
                                <span>Complete</span>
                              </button>
                            </div>
                          )}

                          {order.status === 'completed' && (
                            <button
                              type="button"
                              onClick={() => handleStatusChange(order.id, 'ready')}
                              className="text-[11px] text-gray-500 hover:text-gray-800 underline cursor-pointer px-2"
                            >
                              Reopen
                            </button>
                          )}

                          {order.status !== 'cancelled' && order.status !== 'completed' && order.status !== 'new' && (
                            <button
                              type="button"
                              onClick={() => handleDenyOrder(order)}
                              className="text-[10px] text-rose-500 hover:text-rose-700 font-semibold underline cursor-pointer px-1"
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

            {/* ── COMPACT FINANCIAL & QBO RECONCILIATION FOOTER ── */}
            <div className="space-y-3 pt-3 border-t border-gray-200">
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                <div className="bg-white rounded-xl border border-gray-200 p-3 shadow-2xs flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-blue-50 text-[#00346f] shrink-0">
                    <Package className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-gray-500 block truncate">
                      Orders in View
                    </span>
                    <div className="font-serif text-lg font-bold text-gray-900">
                      {totalOrdersInView}
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-3 shadow-2xs flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-amber-50 text-[#775a19] shrink-0">
                    <ChefHat className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-gray-500 block truncate">
                      Trays to Prep
                    </span>
                    <div className="font-serif text-lg font-bold text-[#775a19]">
                      {totalTraysToPrep}
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-3 shadow-2xs flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-indigo-50 text-indigo-700 shrink-0">
                    <DollarSign className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-gray-500 block truncate">
                      Net Food Base
                    </span>
                    <div className="font-serif text-lg font-bold text-indigo-900">
                      ${totalNetFoodRevenueInView.toFixed(2)}
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-3 shadow-2xs flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-purple-50 text-purple-700 shrink-0">
                    <DollarSign className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-gray-500 block truncate">
                      Sales Tax
                    </span>
                    <div className="font-serif text-lg font-bold text-purple-900">
                      ${totalTaxInView.toFixed(2)}
                    </div>
                  </div>
                </div>

                <div className="col-span-2 sm:col-span-1 bg-white rounded-xl border border-gray-200 p-3 shadow-2xs flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-emerald-50 text-emerald-700 shrink-0">
                    <DollarSign className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-gray-500 block truncate">
                      Grand Total
                    </span>
                    <div className="font-serif text-lg font-bold text-emerald-900">
                      ${totalRevenueInView.toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>

              {/* QBO Status Bar */}
              <div className="bg-gradient-to-r from-[#00346f]/5 to-blue-50/60 rounded-xl border border-[#00346f]/15 px-3.5 py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className={`w-4 h-4 shrink-0 ${reconciledOrdersCountInView > 0 ? 'text-emerald-600' : 'text-[#00346f]'}`} />
                  <div>
                    <span className="font-bold text-gray-900">QuickBooks Online (QBO): </span>
                    {reconciledOrdersCountInView > 0 ? (
                      <span className="text-emerald-800 font-semibold">
                        Reconciled ({reconciledOrdersCountInView}/{totalOrdersInView}) {sampleQboDocId ? `• Doc #${sampleQboDocId}` : ''}
                      </span>
                    ) : (
                      <span className="text-gray-600">
                        Scheduled for 11:59 PM CT nightly sync
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {syncResultMsg && (
                    <span className="text-[11px] font-semibold text-[#00346f]">
                      {syncResultMsg}
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={handleManualQBOReconcile}
                    disabled={isSyncingQbo}
                    className="px-3 py-1.5 rounded-lg bg-[#00346f] hover:bg-[#00224d] text-white text-[11px] font-bold uppercase tracking-wider transition-all disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
                  >
                    <RefreshCw className={`w-3 h-3 ${isSyncingQbo ? 'animate-spin' : ''}`} />
                    <span>{isSyncingQbo ? 'Syncing...' : 'Sync QBO'}</span>
                  </button>
                </div>
              </div>
            </div>
          </>
        )}

      </div>

      {/* ── KITCHEN PREP SHEET EXPORT MODAL (PRINTABLE) ── */}
      {showPrepSheet && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto animate-fade-in font-sans">
          <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden my-6 max-h-[92vh] flex flex-col">
            
            <div className="bg-[#00346f] text-white px-5 py-3.5 flex items-center justify-between shrink-0 print:hidden">
              <div className="flex items-center gap-2">
                <ChefHat className="w-5 h-5 text-[#ffdea5]" />
                <h3 className="font-serif font-bold text-base sm:text-lg">
                  Kitchen Prep Sheet — {selectedDate === 'all' ? 'All Upcoming' : selectedDate === todayDateStr ? `Today (${selectedDate})` : selectedDate}
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1.5 bg-white/20 hover:bg-white/30 text-white px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print</span>
                </button>
                <button
                  onClick={() => setShowPrepSheet(false)}
                  className="p-1 rounded-full text-white/80 hover:text-white hover:bg-white/10 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div id="kitchen-prep-sheet-print" className="p-5 sm:p-7 overflow-y-auto space-y-5 text-gray-900">
              <div className="border-b border-gray-200 pb-3 flex justify-between items-start">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#775a19]">
                    BLUEBONNET WHISK — DESI DABBA
                  </span>
                  <h2 className="font-serif text-xl font-bold text-[#00346f]">
                    Aggregated Kitchen Prep Sheet
                  </h2>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Date: <strong className="text-gray-900">{selectedDate === 'all' ? 'All Upcoming' : selectedDate}</strong> • Active Orders: {totalOrdersInView}
                  </p>
                </div>

                <div className="text-right text-xs">
                  <div className="font-bold text-[#00346f]">Total Trays: {totalTraysToPrep}</div>
                  <div className="text-gray-400 text-[10px]">{new Date().toLocaleTimeString()}</div>
                </div>
              </div>

              <div>
                <table className="w-full text-left text-xs border border-gray-200 rounded-xl overflow-hidden">
                  <thead className="bg-gray-100 text-[10px] font-bold text-gray-600 uppercase tracking-wider border-b border-gray-200">
                    <tr>
                      <th className="py-2 px-3">Dish / Item Name</th>
                      <th className="py-2 px-3">Category</th>
                      <th className="py-2 px-2 text-center">1/3 Tray</th>
                      <th className="py-2 px-2 text-center">Half</th>
                      <th className="py-2 px-2 text-center">Full</th>
                      <th className="py-2 px-2 text-center">Tiffins</th>
                      <th className="py-2 px-3 text-center">Other Units / Cakes</th>
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
                          <td className="py-2 px-3 font-bold text-gray-900">
                            {dish.name}
                            {dish.tier && <span className="text-[10px] font-normal text-gray-500 block">{dish.tier} Tier</span>}
                          </td>
                          <td className="py-2 px-3 text-gray-500 text-[11px]">{dish.category}</td>
                          <td className="py-2 px-2 text-center font-bold text-[#00346f]">
                            {dish.thirdCount > 0 ? dish.thirdCount : '-'}
                          </td>
                          <td className="py-2 px-2 text-center font-bold text-[#00346f]">
                            {dish.halfCount > 0 ? dish.halfCount : '-'}
                          </td>
                          <td className="py-2 px-2 text-center font-bold text-[#00346f]">
                            {dish.fullCount > 0 ? dish.fullCount : '-'}
                          </td>
                          <td className="py-2 px-2 text-center font-bold text-amber-800">
                            {dish.tiffinCount > 0 ? dish.tiffinCount : '-'}
                          </td>
                          <td className="py-2 px-3 text-center font-medium text-gray-700 text-[11px]">
                            {dish.otherUnits.length > 0 ? dish.otherUnits.join(', ') : '-'}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              <div className="bg-amber-50 border border-amber-200 p-3.5 rounded-xl text-xs space-y-1">
                <span className="font-bold text-amber-900 block uppercase tracking-wider text-[10px]">
                  Dietary / Satvik Precautions:
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
          </div>
        </div>
      )}

      {/* ── CHANGE MASTER PIN MODAL ── */}
      {showChangePinModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 animate-fade-in font-sans">
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden p-6">
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
                <h3 className="font-serif font-bold text-lg">Update Kitchen PIN</h3>
                <p className="text-xs text-gray-500">Change your master kitchen passcode</p>
              </div>
            </div>

            {pinChangeSuccess ? (
              <div className="py-6 text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h4 className="font-bold text-sm text-emerald-900">PIN Updated Successfully!</h4>
              </div>
            ) : (
              <form onSubmit={handleChangePin} className="space-y-3.5 text-xs">
                {pinChangeError && (
                  <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
                    <span>{pinChangeError}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Current PIN</label>
                  <input
                    type="password"
                    maxLength={8}
                    required
                    value={currentPinInput}
                    onChange={(e) => setCurrentPinInput(e.target.value.replace(/\D/g, ''))}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:bg-white focus:border-[#00346f]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">New PIN (4–8 digits)</label>
                  <input
                    type="password"
                    maxLength={8}
                    required
                    value={newPinInput}
                    onChange={(e) => setNewPinInput(e.target.value.replace(/\D/g, ''))}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:bg-white focus:border-[#00346f]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Confirm New PIN</label>
                  <input
                    type="password"
                    maxLength={8}
                    required
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
                    className="bg-[#00346f] hover:bg-[#00224d] text-white px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
                  >
                    Update PIN
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

      {/* ── EDIT ORDER MODAL ── */}
      {editingOrder && (
        <KDSEditOrderModal
          order={editingOrder}
          onClose={() => setEditingOrder(null)}
          onOrderUpdated={(updatedOrder) => {
            if (updatedOrder) {
              setAllOrders(prev => {
                if (updatedOrder.status === 'cancelled') {
                  return prev.filter(o => o.id !== updatedOrder.id);
                }
                return prev.map(o => (o.id === updatedOrder.id ? updatedOrder : o));
              });
            }
            loadOrders();
          }}
        />
      )}

      {/* ── TIFFIN FLYER & WEEKLY MENU MODAL ── */}
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
