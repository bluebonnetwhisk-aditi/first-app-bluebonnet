import type { CartItem, CutoffCheckResult } from '../types/catering';

/**
 * Returns current Date components converted into US Central Time (America/Chicago).
 */
export function getCentralTimeNow(): {
  nowDate: Date;
  dateStr: string; // YYYY-MM-DD
  timeStr: string; // HH:mm (24-hour)
  hours: number;
  minutes: number;
} {
  const now = new Date();
  
  // Format parts in America/Chicago
  const dtf = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Chicago',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });
  
  const parts = dtf.formatToParts(now);
  const getPart = (type: string) => parts.find(p => p.type === type)?.value || '00';
  
  const year = getPart('year');
  const month = getPart('month');
  const day = getPart('day');
  const hour = parseInt(getPart('hour'), 10);
  const minute = parseInt(getPart('minute'), 10);
  
  const dateStr = `${year}-${month}-${day}`;
  const timeStr = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
  
  // Virtual Central Date in local milliseconds for straightforward offset arithmetic
  const nowDate = new Date(parseInt(year, 10), parseInt(month, 10) - 1, parseInt(day, 10), hour, minute);

  return { nowDate, dateStr, timeStr, hours: hour, minutes: minute };
}

/**
 * Calculates the required lead time hours based on items in the cart.
 * - Cakes present: 48 hours notice.
 * - Tiffin items: 1 hour notice (person can checkout after 1hr from current time for all non-blackout days).
 * - Catering items (trays, breads, beverages): 24 hours notice.
 * - Default: 24 hours notice.
 */
export function getRequiredNoticeHours(items: CartItem[] = [], subTab?: 'order' | 'cake' | 'tiffin'): number {
  if (subTab === 'tiffin' || items.some(item => item.category === 'tiffin' || (item.menuItemId && item.menuItemId.includes('tiffin')))) {
    return 1;
  }
  
  if (subTab === 'cake' || items.some(item => item.category === 'cakes' || item.leadTimeHours >= 48)) {
    return 48;
  }

  if (items.length > 0) {
    const maxLead = Math.max(...items.map(i => i.leadTimeHours || 24));
    return maxLead;
  }

  return 24;
}

export const CATERING_TIME_SLOTS = [
  '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
  '12:00 PM', '12:30 PM', '1:00 PM', '1:30 PM',
  '2:00 PM', '2:30 PM', '3:00 PM', '3:30 PM',
  '4:00 PM', '4:30 PM', '5:00 PM', '5:30 PM',
  '6:00 PM', '6:30 PM', '7:00 PM'
];

// Tiffin Weekend Pickup Slots (Saturday & Sunday - Flyer Rule: "Available after 3 PM")
export const TIFFIN_WEEKEND_TIME_SLOTS = [
  '3:00 PM', '3:30 PM', '4:00 PM', '4:30 PM',
  '5:00 PM', '5:30 PM', '6:00 PM', '6:30 PM',
  '7:00 PM', '7:30 PM', '8:00 PM', '8:30 PM', '9:00 PM'
];

// Tiffin Weekday Pickup Slots (Monday–Friday - Lunch & Dinner)
export const TIFFIN_WEEKDAY_TIME_SLOTS = [
  '12:00 PM', '12:30 PM', '1:00 PM', '1:30 PM',
  '4:00 PM', '4:30 PM', '5:00 PM', '5:30 PM',
  '6:00 PM', '6:30 PM', '7:00 PM', '7:30 PM', '8:00 PM', '8:30 PM', '9:00 PM'
];

export const TIME_SLOTS = CATERING_TIME_SLOTS;

/**
 * Returns available pickup time slots for the given date and order context.
 * - Weekend (Sat/Sun) Tiffin: After 3 PM only ('3:00 PM' - '7:30 PM') per flyer rule.
 * - Weekday Tiffin: Lunch & Dinner windows.
 * - Catering/Cakes: Standard catering slots ('10:00 AM' - '7:00 PM').
 */
export function getTimeSlotsForDate(
  dateStr: string,
  items: CartItem[] = [],
  subTab?: 'order' | 'cake' | 'tiffin'
): string[] {
  const isTiffin = (items.length > 0 && items.some(i => i.category === 'tiffin' || (i.menuItemId && i.menuItemId.includes('tiffin')))) || subTab === 'tiffin';
  
  if (!isTiffin) {
    return CATERING_TIME_SLOTS;
  }

  if (dateStr) {
    const [y, m, d] = dateStr.split('-').map(Number);
    const dayOfWeek = new Date(y, m - 1, d, 12, 0, 0).getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      return TIFFIN_WEEKEND_TIME_SLOTS;
    }
  }

  return TIFFIN_WEEKDAY_TIME_SLOTS;
}

/**
 * Returns a recommended default time slot for the given date and order context.
 * Weekend Tiffin defaults to 4:00 PM (safely after 3 PM).
 * Weekday Tiffin defaults to 5:00 PM (dinner pickup).
 * Catering defaults to 12:30 PM.
 */
export function getDefaultTimeSlotForDate(
  dateStr: string,
  items: CartItem[] = [],
  subTab?: 'order' | 'cake' | 'tiffin'
): string {
  const isTiffin = (items.length > 0 && items.some(i => i.category === 'tiffin' || (i.menuItemId && i.menuItemId.includes('tiffin')))) || subTab === 'tiffin';
  if (!isTiffin) {
    return '12:30 PM';
  }
  if (dateStr) {
    const [y, m, d] = dateStr.split('-').map(Number);
    const dayOfWeek = new Date(y, m - 1, d, 12, 0, 0).getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      return '4:00 PM';
    }
  }
  return '5:00 PM';
}

/**
 * Parses a 12-hour formatted time string into { hours, minutes } in 24-hour time.
 */
export function parse12HourTime(timeStr: string): { hours: number; minutes: number } {
  let hours = 12;
  let minutes = 0;
  if (!timeStr) return { hours, minutes };
  const m = timeStr.match(/(\d+):(\d+)\s*(AM|PM)?/i);
  if (m) {
    hours = parseInt(m[1], 10);
    minutes = parseInt(m[2], 10);
    const ampm = m[3]?.toUpperCase();
    if (ampm === 'PM' && hours < 12) hours += 12;
    if (ampm === 'AM' && hours === 12) hours = 0;
  }
  return { hours, minutes };
}

/**
 * Checks whether a specific time slot on a given date meets the required lead time.
 */
export function isTimeSlotValidForDate(
  dateStr: string,
  timeSlot: string,
  items: CartItem[] = [],
  subTab?: 'order' | 'cake' | 'tiffin'
): boolean {
  if (!dateStr || !timeSlot) return false;
  const { nowDate } = getCentralTimeNow();
  const noticeHours = getRequiredNoticeHours(items, subTab);
  const isTiffin = (items.length > 0 && items.some(i => i.category === 'tiffin' || (i.menuItemId && i.menuItemId.includes('tiffin')))) || subTab === 'tiffin';

  const [y, m, d] = dateStr.split('-').map(Number);
  const targetDayOfWeek = new Date(y, m - 1, d, 12, 0, 0).getDay();

  // Weekend Tiffin rule: available after 3 PM only per flyer
  if (isTiffin && (targetDayOfWeek === 0 || targetDayOfWeek === 6)) {
    const { hours } = parse12HourTime(timeSlot);
    if (hours < 15) {
      return false;
    }
  }

  const { hours, minutes } = parse12HourTime(timeSlot);
  const targetDate = new Date(y, m - 1, d, hours, minutes, 0);

  const diffHours = (targetDate.getTime() - nowDate.getTime()) / (1000 * 60 * 60);
  const minNoticeHours = noticeHours === 1 ? 0.75 : noticeHours;
  return diffHours >= minNoticeHours;
}

/**
 * Determines whether a specific date (YYYY-MM-DD) is allowed given the lead time requirements.
 */
/**
 * Determines whether a specific date (YYYY-MM-DD) is allowed given the lead time requirements.
 */
export function isDateSelectable(
  dateStr: string,
  blackouts: string[],
  items: CartItem[] = [],
  subTab?: 'order' | 'cake' | 'tiffin'
): { selectable: boolean; reason?: string } {
  const { nowDate, dateStr: todayDateStr } = getCentralTimeNow();

  // Strictly disallow past dates
  if (dateStr < todayDateStr) {
    return { 
      selectable: false, 
      reason: 'Past date ordering is unavailable.' 
    };
  }

  // Check blackout
  if (blackouts.includes(dateStr)) {
    return { selectable: false, reason: 'Sold Out — We are oversold for this date (maximum capacity reached)' };
  }

  // Determine order category context
  const isTiffinOrder = (items.length > 0 && items.some(i => i.category === 'tiffin' || (i.menuItemId && i.menuItemId.includes('tiffin')))) || subTab === 'tiffin';
  const hasCateringDishes = items.length > 0 
    ? items.some(item => item.category !== 'cakes' && item.category !== 'tiffin' && (!item.menuItemId || !item.menuItemId.includes('tiffin')))
    : (subTab === 'order');

  const isCateringContext = hasCateringDishes && !isTiffinOrder;

  // Same-day ordering logic
  if (dateStr === todayDateStr) {
    if (!isTiffinOrder) {
      return { 
        selectable: false, 
        reason: 'Same-day party catering orders are not accepted. Advance notice required.' 
      };
    }
    // For Tiffin, allow checkout after 1 hour from current time if at least one pickup slot remains valid today
    const slots = getTimeSlotsForDate(dateStr, items, subTab);
    const hasValidSlotToday = slots.some(slot => isTimeSlotValidForDate(dateStr, slot, items, subTab));
    if (!hasValidSlotToday) {
      return {
        selectable: false,
        reason: 'Same-day pickup passed: Orders require at least 1 hour advance notice within daily pickup hours.'
      };
    }
    return { selectable: true };
  }

  // Party Catering 7:00 PM Daily Cutoff Rule for Next-Day Orders (Only for Party Catering)
  const tomorrowObj = new Date(nowDate.getFullYear(), nowDate.getMonth(), nowDate.getDate() + 1);
  const tomY = tomorrowObj.getFullYear();
  const tomM = (tomorrowObj.getMonth() + 1).toString().padStart(2, '0');
  const tomD = tomorrowObj.getDate().toString().padStart(2, '0');
  const tomorrowDateStr = `${tomY}-${tomM}-${tomD}`;

  if (isCateringContext && dateStr === tomorrowDateStr && nowDate.getHours() >= 19) {
    return {
      selectable: false,
      reason: 'Party Catering 7:00 PM cutoff passed. Next-day catering orders close at 7:00 PM Central Time.'
    };
  }

  const noticeHours = getRequiredNoticeHours(items, subTab);

  // Target date checked against latest possible slot (9:00 PM = 21:00)
  const [y, m, d] = dateStr.split('-').map(Number);
  const latestPossibleSlotOnDate = new Date(y, m - 1, d, 21, 0, 0);
  const diffHours = (latestPossibleSlotOnDate.getTime() - nowDate.getTime()) / (1000 * 60 * 60);

  if (diffHours < noticeHours) {
    return { 
      selectable: false, 
      reason: `Requires at least ${noticeHours}h advance notice in Central Time` 
    };
  }

  return { selectable: true };
}

/**
 * Finds the earliest guaranteed-valid fulfillment date and time slot for the current cart.
 * Guarantees that opening checkout always starts with a 100% valid fulfillment slot.
 */
export function findFirstValidFulfillmentSlot(
  blackouts: string[],
  items: CartItem[] = [],
  subTab?: 'order' | 'cake' | 'tiffin'
): { dateStr: string; timeSlot: string } {
  const { nowDate } = getCentralTimeNow();
  const noticeHours = getRequiredNoticeHours(items, subTab);
  const isTiffin = (items.length > 0 && items.some(i => i.category === 'tiffin' || (i.menuItemId && i.menuItemId.includes('tiffin')))) || subTab === 'tiffin';
  const startOffset = isTiffin ? 0 : 1;

  for (let offset = startOffset; offset <= 45; offset++) {
    const candidate = new Date(nowDate.getTime() + offset * 24 * 60 * 60 * 1000);
    const y = candidate.getFullYear();
    const m = (candidate.getMonth() + 1).toString().padStart(2, '0');
    const day = candidate.getDate().toString().padStart(2, '0');
    const dateStr = `${y}-${m}-${day}`;

    if (blackouts.includes(dateStr)) continue;

    const dateCheck = isDateSelectable(dateStr, blackouts, items, subTab);
    if (!dateCheck.selectable) continue;

    const slots = getTimeSlotsForDate(dateStr, items, subTab);
    for (const slot of slots) {
      if (isTimeSlotValidForDate(dateStr, slot, items, subTab)) {
        return { dateStr, timeSlot: slot };
      }
    }
  }

  // Fallback safe date
  const fallback = new Date(nowDate.getTime() + (noticeHours + 24) * 60 * 60 * 1000);
  const fY = fallback.getFullYear();
  const fM = (fallback.getMonth() + 1).toString().padStart(2, '0');
  const fD = fallback.getDate().toString().padStart(2, '0');
  const fallbackDateStr = `${fY}-${fM}-${fD}`;
  return { 
    dateStr: fallbackDateStr, 
    timeSlot: getDefaultTimeSlotForDate(fallbackDateStr, items, subTab) 
  };
}

/**
 * Validates a chosen fulfillment date (YYYY-MM-DD) and time (e.g., "12:00 PM" or "14:00")
 * against Central Time cutoff requirements.
 */
export function validateFulfillmentCutoff(
  fulfillmentDate: string,
  fulfillmentTime: string,
  blackouts: string[],
  items: CartItem[] = [],
  subTab?: 'order' | 'cake' | 'tiffin'
): CutoffCheckResult {
  const { nowDate, dateStr: todayDateStr } = getCentralTimeNow();
  const noticeHours = getRequiredNoticeHours(items, subTab);
  const isTiffin = (items.length > 0 && items.some(i => i.category === 'tiffin' || (i.menuItemId && i.menuItemId.includes('tiffin')))) || subTab === 'tiffin';

  const firstValid = findFirstValidFulfillmentSlot(blackouts, items, subTab);
  const earliestAllowedDate = firstValid.dateStr;
  const earliestAllowedTime = firstValid.timeSlot;

  if (!fulfillmentDate) {
    return {
      isValid: false,
      earliestAllowedDate,
      earliestAllowedTime,
      requiredNoticeHours: noticeHours,
      message: `Please select a fulfillment date (${noticeHours === 1 ? '1h notice' : `${noticeHours}h notice`} required in US Central Time).`,
      isPassed: false
    };
  }

  // Disallow past dates
  if (fulfillmentDate < todayDateStr) {
    return {
      isValid: false,
      earliestAllowedDate,
      earliestAllowedTime,
      requiredNoticeHours: noticeHours,
      message: `Past date orders are not accepted. Earliest available slot is ${earliestAllowedDate} (${earliestAllowedTime}).`,
      isPassed: true
    };
  }

  // Disallow same-day for non-tiffin (party catering / cakes)
  if (fulfillmentDate === todayDateStr && !isTiffin) {
    return {
      isValid: false,
      earliestAllowedDate,
      earliestAllowedTime,
      requiredNoticeHours: noticeHours,
      message: `Same-day party catering orders are not accepted. Earliest available date is ${earliestAllowedDate} (${earliestAllowedTime}).`,
      isPassed: true
    };
  }

  if (blackouts.includes(fulfillmentDate)) {
    return {
      isValid: false,
      earliestAllowedDate,
      earliestAllowedTime,
      requiredNoticeHours: noticeHours,
      message: `The selected date (${fulfillmentDate}) is fully booked — we are oversold for this date. Please pick an open date.`,
      isPassed: false
    };
  }

  const [y, m, d] = fulfillmentDate.split('-').map(Number);
  const targetDayOfWeek = new Date(y, m - 1, d, 12, 0, 0).getDay();

  // Weekend Tiffin rule: available after 3 PM only per flyer
  if (isTiffin && (targetDayOfWeek === 0 || targetDayOfWeek === 6)) {
    const { hours } = parse12HourTime(fulfillmentTime);
    if (hours < 15) {
      return {
        isValid: false,
        earliestAllowedDate,
        earliestAllowedTime,
        requiredNoticeHours: noticeHours,
        message: `Weekend Specials are available after 3:00 PM only (Saturday & Sunday). Please select a pickup window at or after 3:00 PM.`,
        isPassed: false
      };
    }
  }

  // Parse time
  const { hours, minutes } = parse12HourTime(fulfillmentTime);
  const targetDateTime = new Date(y, m - 1, d, hours, minutes, 0);
  const diffHours = (targetDateTime.getTime() - nowDate.getTime()) / (1000 * 60 * 60);
  const minNoticeHours = noticeHours === 1 ? 0.75 : noticeHours;

  if (diffHours < minNoticeHours) {
    const orderKind = isTiffin 
      ? 'Desi Dabba Tiffin' 
      : (noticeHours === 48 ? 'Celebration Cakes' : 'Catering Dishes');
    const noticeDesc = noticeHours === 1 ? 'at least 1 hour' : `at least ${noticeHours} hours`;
    return {
      isValid: false,
      earliestAllowedDate,
      earliestAllowedTime,
      requiredNoticeHours: noticeHours,
      message: `Orders with ${orderKind} require ${noticeDesc} advance notice in US Central Time. Earliest available slot: ${earliestAllowedDate} at ${earliestAllowedTime}.`,
      isPassed: true
    };
  }

  const noticeDesc = noticeHours === 1 ? '1h notice satisfied' : `${noticeHours}h cutoff satisfied`;
  return {
    isValid: true,
    earliestAllowedDate,
    earliestAllowedTime,
    requiredNoticeHours: noticeHours,
    message: `Fulfillment slot confirmed (${noticeDesc} in US Central Time).`,
    isPassed: false
  };
}

export function format12Hour(time24: string): string {
  if (!time24) return '12:00 PM';
  const [hStr, mStr] = time24.split(':');
  let h = parseInt(hStr, 10);
  const m = mStr || '00';
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12;
  h = h ? h : 12; // 0 becomes 12
  return `${h}:${m} ${ampm}`;
}

export function getUpcomingDates(daysCount = 14, includeToday = false): { dateStr: string; label: string; dayOfWeek: string }[] {
  const { nowDate } = getCentralTimeNow();
  const list = [];
  const start = includeToday ? 0 : 1;
  
  for (let i = start; list.length < daysCount; i++) {
    const d = new Date(nowDate.getTime() + i * 24 * 60 * 60 * 1000);
    const y = d.getFullYear();
    const m = (d.getMonth() + 1).toString().padStart(2, '0');
    const day = d.getDate().toString().padStart(2, '0');
    const dateStr = `${y}-${m}-${day}`;
    
    const dayOfWeek = d.toLocaleDateString('en-US', { weekday: 'short' });
    const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    
    list.push({ dateStr, label, dayOfWeek });
  }
  
  return list;
}
