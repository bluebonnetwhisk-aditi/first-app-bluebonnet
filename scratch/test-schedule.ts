import { getCentralTimeNow } from '../src/utils/centralTime';
import { fetchTiffinMenuSettings } from '../src/services/supabase';

async function main() {
  const settings = await fetchTiffinMenuSettings();
  console.log('SETTINGS:', JSON.stringify(settings, null, 2));

  const { nowDate, dateStr: todayStr } = getCentralTimeNow();
  console.log('nowDate:', nowDate.toString(), 'todayStr:', todayStr);

  const curDayOfWeek = nowDate.getDay();
  const daysToMonday = curDayOfWeek === 0 ? 1 : (1 - curDayOfWeek);
  const baseMonday = new Date(nowDate.getFullYear(), nowDate.getMonth(), nowDate.getDate() + daysToMonday);

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const fmtStr = (d: Date) => {
    const y = d.getFullYear();
    const m = (d.getMonth() + 1).toString().padStart(2, '0');
    const day = d.getDate().toString().padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  const fmtDisplay = (d: Date) => `${monthNames[d.getMonth()]} ${d.getDate()}`;

  let startMonday = baseMonday;
  const baseMonStr = fmtStr(baseMonday);
  if (settings?.weekStartDate) {
    const parts = settings.weekStartDate.split('-').map(Number);
    if (parts.length === 3 && !isNaN(parts[0]) && !isNaN(parts[1]) && !isNaN(parts[2])) {
      const kdsMon = new Date(parts[0], parts[1] - 1, parts[2]);
      if (settings.weekStartDate >= baseMonStr) {
        startMonday = kdsMon;
      }
    }
  }

  console.log('startMonday:', fmtStr(startMonday));

  const mon = startMonday;
  for (let i = 0; i < 7; i++) {
    const dayDate = new Date(mon.getFullYear(), mon.getMonth(), mon.getDate() + i);
    const y = dayDate.getFullYear();
    const m = (dayDate.getMonth() + 1).toString().padStart(2, '0');
    const d = dayDate.getDate().toString().padStart(2, '0');
    const dateStr = `${y}-${m}-${d}`;
    const dayName = dayNames[i];
    const displayDate = `${monthNames[dayDate.getMonth()]} ${dayDate.getDate()}`;
    console.log(`Day ${i}: ${dayName} ${displayDate} (${dateStr})`);
  }
}

main().catch(console.error);
