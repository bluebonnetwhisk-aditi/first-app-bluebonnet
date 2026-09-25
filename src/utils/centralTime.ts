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

/**
 * Determines whether a specific date (YYYY-MM-DD) is allowed given the lead time requirements.
 */
export function isDateSelectable(
  dateStr: string,
  blackouts: string[],
  items: CartItem[]
): { selectable: boolean; reason?: string } {
  // Check blackout first
  if (blackouts.includes(dateStr)) {
    return { selectable: false, reason: 'Kitchen closed (blackout date)' };
  }

  const { nowDate } = getCentralTimeNow();
  const noticeHours = getRequiredNoticeHours(items);

  // Target date parsed at end-of-day (20:00 max delivery time)
  const [y, m, d] = dateStr.split('-').map(Number);
  const latestPossibleSlotOnDate = new Date(y, m - 1, d, 20, 0, 0);

  const diffMs = latestPossibleSlotOnDate.getTime() - nowDate.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);

  if (diffHours < noticeHours) {
    return { 
      selectable: false, 
      reason: `Requires ${noticeHours} hrs advance notice in Central Time` 
    };
  }

  return { selectable: true };
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
  const { nowDate } = getCentralTimeNow();
  const noticeHours = getRequiredNoticeHours(items);

  // Earliest allowed Date object
  const earliestAllowed = new Date(nowDate.getTime() + noticeHours * 60 * 60 * 1000);
  const eYear = earliestAllowed.getFullYear();
  const eMonth = (earliestAllowed.getMonth() + 1).toString().padStart(2, '0');
  const eDay = earliestAllowed.getDate().toString().padStart(2, '0');
  const earliestAllowedDate = `${eYear}-${eMonth}-${eDay}`;
  
  const eHours = earliestAllowed.getHours();
  const eMins = earliestAllowed.getMinutes();
  const earliestAllowedTime = `${eHours.toString().padStart(2, '0')}:${eMins.toString().padStart(2, '0')}`;

  if (!fulfillmentDate) {
    return {
      isValid: false,
      earliestAllowedDate,
      earliestAllowedTime,
      requiredNoticeHours: noticeHours,
      message: `Please select a date (${noticeHours} hrs notice required in US Central Time).`,
      isPassed: false
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

  // Parse time
  let hours = 12;
  let minutes = 0;
  if (fulfillmentTime) {
    const timeMatch = fulfillmentTime.match(/(\d+):(\d+)\s*(AM|PM)?/i);
    if (timeMatch) {
      hours = parseInt(timeMatch[1], 10);
      minutes = parseInt(timeMatch[2], 10);
      const ampm = timeMatch[3]?.toUpperCase();
      if (ampm === 'PM' && hours < 12) hours += 12;
      if (ampm === 'AM' && hours === 12) hours = 0;
    }
  }

  const [y, m, d] = fulfillmentDate.split('-').map(Number);
  const targetDate = new Date(y, m - 1, d, hours, minutes, 0);

  const diffHours = (targetDate.getTime() - nowDate.getTime()) / (1000 * 60 * 60);

  if (diffHours < noticeHours) {
    return {
      isValid: false,
      earliestAllowedDate,
      earliestAllowedTime,
      requiredNoticeHours: noticeHours,
      message: `Orders with ${noticeHours === 48 ? 'Celebration Cakes' : 'Catering Dishes'} require at least ${noticeHours} hours notice in US Central Time. Earliest available: ${earliestAllowedDate} after ${format12Hour(earliestAllowedTime)}.`,
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
  
  for (let i = 0; i < daysCount; i++) {
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
