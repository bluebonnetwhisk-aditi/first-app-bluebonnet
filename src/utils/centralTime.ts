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
 * - Catering items (trays, breads, beverages): 24 hours notice.
 * - Default: 24 hours notice.
 */
export function getRequiredNoticeHours(items: CartItem[]): number {
  if (items.length === 0) return 24;
  
  const hasCakes = items.some(item => item.category === 'cakes' || item.leadTimeHours >= 48);
  if (hasCakes) return 48;
  
  return 24;
}

export const TIME_SLOTS = [
  '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
  '12:00 PM', '12:30 PM', '1:00 PM', '1:30 PM',
  '2:00 PM', '2:30 PM', '3:00 PM', '3:30 PM',
  '4:00 PM', '4:30 PM', '5:00 PM', '5:30 PM',
  '6:00 PM', '6:30 PM', '7:00 PM', '7:30 PM', '8:00 PM'
];

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
  items: CartItem[]
): boolean {
  if (!dateStr || !timeSlot) return false;
  const { nowDate } = getCentralTimeNow();
  const noticeHours = getRequiredNoticeHours(items);

  const { hours, minutes } = parse12HourTime(timeSlot);
  const [y, m, d] = dateStr.split('-').map(Number);
  const targetDate = new Date(y, m - 1, d, hours, minutes, 0);

  const diffHours = (targetDate.getTime() - nowDate.getTime()) / (1000 * 60 * 60);
  return diffHours >= noticeHours;
}

/**
 * Determines whether a specific date (YYYY-MM-DD) is allowed given the lead time requirements.
 */
export function isDateSelectable(
  dateStr: string,
  blackouts: string[],
  items: CartItem[]
): { selectable: boolean; reason?: string } {
  const { nowDate, dateStr: todayDateStr } = getCentralTimeNow();

  // Strictly disallow today and any past dates
  if (dateStr <= todayDateStr) {
    return { 
      selectable: false, 
      reason: 'Same-day or past date ordering is unavailable. Advance notice required.' 
    };
  }

  // Check blackout
  if (blackouts.includes(dateStr)) {
    return { selectable: false, reason: 'Kitchen closed (blackout date)' };
  }

  const [y, m, d] = dateStr.split('-').map(Number);
  const targetDate = new Date(y, m - 1, d);

  // Tiffin Sunday closure check
  const hasTiffin = items.some(item => item.category === 'tiffin');
  if (hasTiffin && targetDate.getDay() === 0) {
    return { selectable: false, reason: 'Tiffin service is closed on Sundays' };
  }

  const noticeHours = getRequiredNoticeHours(items);

  // Target date checked against latest possible slot (8:00 PM = 20:00)
  const latestPossibleSlotOnDate = new Date(y, m - 1, d, 20, 0, 0);
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
  items: CartItem[]
): { dateStr: string; timeSlot: string } {
  const { nowDate } = getCentralTimeNow();
  const noticeHours = getRequiredNoticeHours(items);
  const hasTiffin = items.some(item => item.category === 'tiffin');

  for (let offset = 1; offset <= 45; offset++) {
    const candidate = new Date(nowDate.getTime() + offset * 24 * 60 * 60 * 1000);
    const y = candidate.getFullYear();
    const m = (candidate.getMonth() + 1).toString().padStart(2, '0');
    const day = candidate.getDate().toString().padStart(2, '0');
    const dateStr = `${y}-${m}-${day}`;

    if (blackouts.includes(dateStr)) continue;
    if (hasTiffin && candidate.getDay() === 0) continue;

    for (const slot of TIME_SLOTS) {
      if (isTimeSlotValidForDate(dateStr, slot, items)) {
        return { dateStr, timeSlot: slot };
      }
    }
  }

  // Fallback safe date
  const fallback = new Date(nowDate.getTime() + (noticeHours + 24) * 60 * 60 * 1000);
  const fY = fallback.getFullYear();
  const fM = (fallback.getMonth() + 1).toString().padStart(2, '0');
  const fD = fallback.getDate().toString().padStart(2, '0');
  return { dateStr: `${fY}-${fM}-${fD}`, timeSlot: '12:30 PM' };
}

/**
 * Validates a chosen fulfillment date (YYYY-MM-DD) and time (e.g., "12:00 PM" or "14:00")
 * against Central Time cutoff requirements.
 */
export function validateFulfillmentCutoff(
  fulfillmentDate: string,
  fulfillmentTime: string,
  blackouts: string[],
  items: CartItem[]
): CutoffCheckResult {
  const { nowDate, dateStr: todayDateStr } = getCentralTimeNow();
  const noticeHours = getRequiredNoticeHours(items);

  const firstValid = findFirstValidFulfillmentSlot(blackouts, items);
  const earliestAllowedDate = firstValid.dateStr;
  const earliestAllowedTime = firstValid.timeSlot;

  if (!fulfillmentDate) {
    return {
      isValid: false,
      earliestAllowedDate,
      earliestAllowedTime,
      requiredNoticeHours: noticeHours,
      message: `Please select a fulfillment date (${noticeHours}h notice required in US Central Time).`,
      isPassed: false
    };
  }

  // Disallow today or earlier dates
  if (fulfillmentDate <= todayDateStr) {
    return {
      isValid: false,
      earliestAllowedDate,
      earliestAllowedTime,
      requiredNoticeHours: noticeHours,
      message: `Same-day orders are not accepted. Earliest available date is ${earliestAllowedDate} (${earliestAllowedTime}).`,
      isPassed: true
    };
  }

  if (blackouts.includes(fulfillmentDate)) {
    return {
      isValid: false,
      earliestAllowedDate,
      earliestAllowedTime,
      requiredNoticeHours: noticeHours,
      message: `The selected date (${fulfillmentDate}) is closed for orders.`,
      isPassed: false
    };
  }

  const [y, m, d] = fulfillmentDate.split('-').map(Number);
  const targetDate = new Date(y, m - 1, d);

  // Tiffin Sunday closure check
  const hasTiffin = items.some(item => item.category === 'tiffin');
  if (hasTiffin && targetDate.getDay() === 0) {
    return {
      isValid: false,
      earliestAllowedDate,
      earliestAllowedTime,
      requiredNoticeHours: noticeHours,
      message: `Desi Dabba Tiffin service is closed on Sundays. Please select a delivery/pickup date between Monday and Saturday.`,
      isPassed: false
    };
  }

  // Parse time
  const { hours, minutes } = parse12HourTime(fulfillmentTime);
  const targetDateTime = new Date(y, m - 1, d, hours, minutes, 0);
  const diffHours = (targetDateTime.getTime() - nowDate.getTime()) / (1000 * 60 * 60);

  if (diffHours < noticeHours) {
    return {
      isValid: false,
      earliestAllowedDate,
      earliestAllowedTime,
      requiredNoticeHours: noticeHours,
      message: `Orders with ${noticeHours === 48 ? 'Celebration Cakes' : 'Catering Dishes'} require at least ${noticeHours} hours notice in US Central Time. Earliest available slot: ${earliestAllowedDate} at ${earliestAllowedTime}.`,
      isPassed: true
    };
  }

  return {
    isValid: true,
    earliestAllowedDate,
    earliestAllowedTime,
    requiredNoticeHours: noticeHours,
    message: `Fulfillment slot confirmed (${noticeHours}h cutoff satisfied in US Central Time).`,
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

export function getUpcomingDates(daysCount = 14): { dateStr: string; label: string; dayOfWeek: string }[] {
  const { nowDate } = getCentralTimeNow();
  const list = [];
  
  // Start from i = 1 (tomorrow), strictly excluding today
  for (let i = 1; i <= daysCount; i++) {
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
