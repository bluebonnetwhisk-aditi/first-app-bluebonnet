import { useState, useEffect } from 'react';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Trash2, 
  Plus, 
  X, 
  Ban
} from 'lucide-react';
import type { CalendarBlackout } from '../../types/catering';
import { 
  fetchCalendarBlackoutRules, 
  addCalendarBlackoutRule, 
  deleteCalendarBlackoutRule 
} from '../../services/supabase';
import { getCentralTimeNow } from '../../utils/centralTime';

interface KDSBlackoutManagerProps {
  isOpen: boolean;
  onClose: () => void;
  onRulesUpdated?: () => void;
}

const WEEKDAYS = [
  { day: 0, label: 'Sun', full: 'Sunday' },
  { day: 1, label: 'Mon', full: 'Monday' },
  { day: 2, label: 'Tue', full: 'Tuesday' },
  { day: 3, label: 'Wed', full: 'Wednesday' },
  { day: 4, label: 'Thu', full: 'Thursday' },
  { day: 5, label: 'Fri', full: 'Friday' },
  { day: 6, label: 'Sat', full: 'Saturday' }
];

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export default function KDSBlackoutManager({
  isOpen,
  onClose,
  onRulesUpdated
}: KDSBlackoutManagerProps) {
  const [rules, setRules] = useState<CalendarBlackout[]>([]);
  const [viewDate, setViewDate] = useState(() => new Date());
  
  // Quick single-date add state
  const [newDateInput, setNewDateInput] = useState('');
  const [newReasonInput, setNewReasonInput] = useState('');
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const loadRules = async () => {
    try {
      const data = await fetchCalendarBlackoutRules();
      setRules(data);
    } catch (e) {
      console.warn('Failed to load blackout rules', e);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadRules();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // US Central Time calculations for today / tomorrow
  const { nowDate: ctNow, dateStr: todayStr } = getCentralTimeNow();
  const tomorrowDateObj = new Date(ctNow.getTime() + 24 * 60 * 60 * 1000);
  const tomorrowStr = `${tomorrowDateObj.getFullYear()}-${(tomorrowDateObj.getMonth() + 1).toString().padStart(2, '0')}-${tomorrowDateObj.getDate().toString().padStart(2, '0')}`;

  // Calendar calculations
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth(); // 0-indexed
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Active recurring weekdays
  const activeWeekdayRules = rules.filter(r => r.rule_type === 'recurring_weekday');
  const activeWeekdaysSet = new Set(activeWeekdayRules.map(r => r.day_of_week));

  // Active month rules
  const activeMonthRules = rules.filter(r => r.rule_type === 'recurring_month');
  const activeMonthsSet = new Set(activeMonthRules.map(r => r.month_of_year));

  // Check if a specific date is blacked out
  const getBlackoutInfoForDate = (dayNum: number) => {
    const dateStr = `${year}-${(month + 1).toString().padStart(2, '0')}-${dayNum.toString().padStart(2, '0')}`;
    const dateObj = new Date(year, month, dayNum);
    const dayOfWeek = dateObj.getDay();

    // 1. Single date match
    const singleMatch = rules.find(r => r.rule_type === 'single' && r.closed_date === dateStr);
    if (singleMatch) {
      return { isBlocked: true, type: 'single', rule: singleMatch, reason: singleMatch.reason || 'Closed' };
    }

    // 2. Weekday recurring match
    const weekdayMatch = rules.find(r => r.rule_type === 'recurring_weekday' && r.day_of_week === dayOfWeek);
    if (weekdayMatch) {
      return { isBlocked: true, type: 'weekday', rule: weekdayMatch, reason: weekdayMatch.reason || `Every ${WEEKDAYS[dayOfWeek].full}` };
    }

    // 3. Month recurring match
    const monthMatch = rules.find(r => r.rule_type === 'recurring_month' && r.month_of_year === (month + 1));
    if (monthMatch) {
      return { isBlocked: true, type: 'month', rule: monthMatch, reason: monthMatch.reason || `Month of ${MONTHS[month]}` };
    }

    return { isBlocked: false, type: null, rule: null, reason: null };
  };

  // Toggle single date blackout
  const handleToggleDay = async (dayNum: number) => {
    const dateStr = `${year}-${(month + 1).toString().padStart(2, '0')}-${dayNum.toString().padStart(2, '0')}`;
    
    // Disallow today or earlier dates
    if (dateStr <= todayStr) {
      setActionMessage(`Cannot configure blackout for ${dateStr}. Today and past dates cannot be blacked out.`);
      return;
    }

    const info = getBlackoutInfoForDate(dayNum);

    if (info.isBlocked && info.rule && info.type === 'single') {
      // Remove single rule
      await deleteCalendarBlackoutRule(info.rule.id);
      setActionMessage(`Removed blackout for ${dateStr}`);
    } else if (!info.isBlocked) {
      // Add single rule
      await addCalendarBlackoutRule({
        closed_date: dateStr,
        rule_type: 'single',
        reason: 'Kitchen Closed'
      });
      setActionMessage(`Added blackout for ${dateStr}`);
    }
    await loadRules();
    onRulesUpdated?.();
  };

  // Toggle recurring weekday rule
  const handleToggleWeekday = async (dayOfWeek: number) => {
    const existing = rules.find(r => r.rule_type === 'recurring_weekday' && r.day_of_week === dayOfWeek);
    if (existing) {
      await deleteCalendarBlackoutRule(existing.id);
      setActionMessage(`Reopened orders for every ${WEEKDAYS[dayOfWeek].full}`);
    } else {
      await addCalendarBlackoutRule({
        day_of_week: dayOfWeek,
        rule_type: 'recurring_weekday',
        reason: `Closed Every ${WEEKDAYS[dayOfWeek].full}`
      });
      setActionMessage(`Set recurring blackout for every ${WEEKDAYS[dayOfWeek].full}`);
    }
    await loadRules();
    onRulesUpdated?.();
  };

  // Toggle recurring month rule
  const handleToggleMonth = async (monthNum: number) => {
    const existing = rules.find(r => r.rule_type === 'recurring_month' && r.month_of_year === monthNum);
    if (existing) {
      await deleteCalendarBlackoutRule(existing.id);
      setActionMessage(`Reopened orders for ${MONTHS[monthNum - 1]}`);
    } else {
      await addCalendarBlackoutRule({
        month_of_year: monthNum,
        rule_type: 'recurring_month',
        reason: `Closed for entire month of ${MONTHS[monthNum - 1]}`
      });
      setActionMessage(`Blacked out all of ${MONTHS[monthNum - 1]}`);
    }
    await loadRules();
    onRulesUpdated?.();
  };

  // Delete any rule
  const handleDeleteRule = async (id: number) => {
    await deleteCalendarBlackoutRule(id);
    setActionMessage('Rule removed successfully');
    await loadRules();
    onRulesUpdated?.();
  };

  // Manual date submit
  const handleAddCustomDate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDateInput) return;
    if (newDateInput <= todayStr) {
      setActionMessage(`Cannot set blackout for today or past dates (${newDateInput}). Please select a date after today.`);
      return;
    }
    await addCalendarBlackoutRule({
      closed_date: newDateInput,
      rule_type: 'single',
      reason: newReasonInput.trim() || 'Kitchen Holiday'
    });
    setNewDateInput('');
    setNewReasonInput('');
    setActionMessage(`Added blackout for ${newDateInput}`);
    await loadRules();
    onRulesUpdated?.();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto animate-fade-in font-sans">
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden my-6 max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="bg-[#00346f] text-white p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-[#ffdea5]">
              <Ban className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif font-bold text-lg sm:text-xl">
                Kitchen Blackout &amp; Schedule Manager
              </h2>
              <p className="text-xs text-white/70">
                Disable online catering orders on specific dates, recurring weekdays, or full months
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action toast */}
        {actionMessage && (
          <div className="bg-emerald-50 border-b border-emerald-200 px-4 py-2 text-xs text-emerald-800 flex items-center justify-between">
            <span>✓ {actionMessage}</span>
            <button onClick={() => setActionMessage(null)} className="text-emerald-600 hover:text-emerald-900">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6">

          {/* ── 1. RECURRING WEEKDAY BLACKOUTS ── */}
          <div className="bg-gray-50 rounded-2xl p-4 sm:p-5 border border-gray-200 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-serif font-bold text-sm text-[#00346f]">
                  Recurring Day-of-the-Week Blackouts
                </h3>
                <p className="text-xs text-gray-500">
                  Click a weekday to permanently close orders on that recurring day (e.g. Every Monday)
                </p>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-2">
              {WEEKDAYS.map(({ day, label }) => {
                const isBlocked = activeWeekdaysSet.has(day);
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => handleToggleWeekday(day)}
                    className={`py-3 px-1 rounded-xl text-center transition-all cursor-pointer border ${
                      isBlocked
                        ? 'bg-rose-900 text-white border-rose-950 shadow-sm ring-2 ring-rose-300'
                        : 'bg-white hover:bg-gray-100 text-gray-800 border-gray-200'
                    }`}
                  >
                    <div className="text-xs font-bold">{label}</div>
                    <div className="text-[10px] mt-0.5">
                      {isBlocked ? 'CLOSED' : 'Open'}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── 2. INTERACTIVE CALENDAR MONTH VIEW ── */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-200 shadow-xs space-y-4">
            
            <div className="flex items-center justify-between pb-3 border-b border-gray-150">
              <div className="flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-[#00346f]" />
                <h3 className="font-serif font-bold text-base text-gray-900">
                  {MONTHS[month]} {year}
                </h3>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setViewDate(new Date(year, month - 1, 1))}
                  className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-100 text-gray-700 cursor-pointer"
                  title="Previous Month"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setViewDate(new Date())}
                  className="px-2.5 py-1 text-xs font-bold text-[#00346f] rounded-lg border border-gray-200 hover:bg-gray-100 cursor-pointer"
                >
                  Today
                </button>
                <button
                  type="button"
                  onClick={() => setViewDate(new Date(year, month + 1, 1))}
                  className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-100 text-gray-700 cursor-pointer"
                  title="Next Month"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Calendar Grid */}
            <div>
              {/* Day Headers */}
              <div className="grid grid-cols-7 text-center font-bold text-xs text-gray-500 pb-2">
                {WEEKDAYS.map(w => (
                  <span key={w.day}>{w.label}</span>
                ))}
              </div>

              {/* Day Cells */}
              <div className="grid grid-cols-7 gap-1.5">
                {/* Empty padding for days before the 1st */}
                {Array.from({ length: firstDayOfMonth }).map((_, idx) => (
                  <div key={`pad-${idx}`} className="h-16 rounded-xl bg-gray-50/50" />
                ))}

                {/* Actual Month Days */}
                {Array.from({ length: daysInMonth }).map((_, idx) => {
                  const dayNum = idx + 1;
                  const dateStr = `${year}-${(month + 1).toString().padStart(2, '0')}-${dayNum.toString().padStart(2, '0')}`;
                  const isPastOrToday = dateStr <= todayStr;
                  const info = getBlackoutInfoForDate(dayNum);
                  const isBlocked = info.isBlocked;

                  return (
                    <button
                      key={dayNum}
                      type="button"
                      disabled={isPastOrToday}
                      onClick={() => handleToggleDay(dayNum)}
                      title={isPastOrToday ? 'Cannot blackout today or past dates' : undefined}
                      className={`h-16 rounded-xl p-1.5 flex flex-col justify-between text-left transition-all border ${
                        isPastOrToday
                          ? 'bg-gray-100/60 border-gray-200 text-gray-400 cursor-not-allowed opacity-60'
                          : isBlocked
                          ? info.type === 'single'
                            ? 'bg-rose-50 border-rose-300 text-rose-900 ring-1 ring-rose-300 cursor-pointer'
                            : 'bg-amber-50/80 border-amber-300 text-amber-900 cursor-pointer'
                          : 'bg-white hover:bg-blue-50/50 border-gray-200 text-gray-800 cursor-pointer'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="text-xs font-bold">{dayNum}</span>
                        {isPastOrToday ? (
                          <span className="text-[8px] uppercase tracking-tighter text-gray-400 font-semibold">Locked</span>
                        ) : isBlocked ? (
                          <Ban className={`w-3 h-3 ${info.type === 'single' ? 'text-rose-600' : 'text-amber-600'}`} />
                        ) : null}
                      </div>
                      <div className="text-[9px] leading-tight truncate">
                        {isPastOrToday ? (
                          <span className="text-gray-400 font-medium">Past / Today</span>
                        ) : isBlocked ? (
                          <span className={`font-semibold ${info.type === 'single' ? 'text-rose-700' : 'text-amber-800'}`}>
                            {info.reason}
                          </span>
                        ) : (
                          <span className="text-gray-400">Open</span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-[11px] text-gray-500 pt-2 border-t border-gray-150">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-gray-200 border border-gray-300" />
                <span>Past / Today (Locked)</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-white border border-gray-300" />
                <span>Open for Orders</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-rose-500" />
                <span>Custom Blackout Date (Click to toggle)</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-amber-400" />
                <span>Recurring Rule (Day / Month)</span>
              </span>
            </div>

          </div>

          {/* ── 3. FULL MONTH BLACKOUTS ── */}
          <div className="bg-gray-50 rounded-2xl p-4 sm:p-5 border border-gray-200 space-y-3">
            <h3 className="font-serif font-bold text-sm text-[#00346f]">
              Full Month Blackout Rules
            </h3>
            <p className="text-xs text-gray-500">
              Close catering fulfillment for an entire month (e.g. for seasonal kitchen maintenance)
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2">
              {MONTHS.map((mName, idx) => {
                const mNum = idx + 1;
                const isBlocked = activeMonthsSet.has(mNum);
                return (
                  <button
                    key={mNum}
                    type="button"
                    onClick={() => handleToggleMonth(mNum)}
                    className={`p-2 rounded-xl text-center text-xs font-bold transition-all cursor-pointer border ${
                      isBlocked
                        ? 'bg-rose-900 text-white border-rose-950'
                        : 'bg-white hover:bg-gray-100 text-gray-700 border-gray-200'
                    }`}
                  >
                    <div>{mName}</div>
                    <div className="text-[10px] font-normal mt-0.5">
                      {isBlocked ? 'Blocked' : 'Available'}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── 4. ACTIVE RULES TABLE & QUICK ADD ── */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-200 space-y-4">
            
            <div className="flex items-center justify-between">
              <h3 className="font-serif font-bold text-sm text-gray-900">
                All Active Blackout Rules ({rules.length})
              </h3>
            </div>

            {/* Quick Add Specific Date Form */}
            <form onSubmit={handleAddCustomDate} className="flex flex-wrap items-center gap-2 p-3 bg-gray-50 rounded-xl border border-gray-200 text-xs">
              <span className="font-bold text-gray-700">Quick Add:</span>
              <input
                type="date"
                min={tomorrowStr}
                value={newDateInput}
                onChange={e => setNewDateInput(e.target.value)}
                className="px-3 py-1.5 rounded-lg border border-gray-300 bg-white"
                required
              />
              <input
                type="text"
                value={newReasonInput}
                onChange={e => setNewReasonInput(e.target.value)}
                placeholder="Reason (e.g. Kitchen Renovation)"
                className="flex-1 px-3 py-1.5 rounded-lg border border-gray-300 bg-white"
              />
              <button
                type="submit"
                className="inline-flex items-center gap-1 bg-[#00346f] hover:bg-[#00224d] text-white px-3 py-1.5 rounded-lg font-bold cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Date</span>
              </button>
            </form>

            {/* Rules Table */}
            {rules.length === 0 ? (
              <div className="p-4 text-center text-xs text-gray-500">
                No blackout rules configured. Kitchen is open every day (subject to standard 24h/48h lead times).
              </div>
            ) : (
              <div className="divide-y divide-gray-150 border border-gray-200 rounded-xl overflow-hidden max-h-60 overflow-y-auto">
                {rules.map(rule => (
                  <div key={rule.id} className="p-3 flex items-center justify-between hover:bg-gray-50 text-xs">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          rule.rule_type === 'recurring_weekday'
                            ? 'bg-purple-100 text-purple-900 border border-purple-200'
                            : rule.rule_type === 'recurring_month'
                            ? 'bg-amber-100 text-amber-900 border border-amber-200'
                            : 'bg-rose-100 text-rose-900 border border-rose-200'
                        }`}>
                          {rule.rule_type === 'recurring_weekday' 
                            ? 'Weekly' 
                            : rule.rule_type === 'recurring_month' 
                            ? 'Monthly' 
                            : 'Single Date'}
                        </span>
                        <span className="font-bold text-gray-900">
                          {rule.rule_type === 'recurring_weekday' && rule.day_of_week !== undefined && rule.day_of_week !== null
                            ? `Every ${WEEKDAYS[rule.day_of_week]?.full}`
                            : rule.rule_type === 'recurring_month' && rule.month_of_year
                            ? `All of ${MONTHS[rule.month_of_year - 1]}`
                            : rule.closed_date}
                        </span>
                      </div>
                      <div className="text-[11px] text-gray-500 pl-0.5">
                        {rule.reason || 'Closed for orders'}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeleteRule(rule.id)}
                      className="p-1.5 rounded-lg text-rose-600 hover:text-rose-800 hover:bg-rose-50 transition-colors cursor-pointer"
                      title="Delete Rule"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

          </div>

        </div>

        {/* Footer */}
        <div className="bg-gray-50 p-4 border-t border-gray-200 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="bg-[#00346f] text-white px-6 py-2 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-[#00224d] transition-all cursor-pointer"
          >
            Done &amp; Apply Schedule
          </button>
        </div>

      </div>
    </div>
  );
}
