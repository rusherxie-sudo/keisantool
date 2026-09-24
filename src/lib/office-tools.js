import { holidays } from './shukujitsu.js';

// New calendars are limited to the years checked against the Cabinet Office list.
export const BUSINESS_YEARS = [2026, 2027];
export function businessMonth(year, month, extraHolidays = [], workingWeekdays = [1, 2, 3, 4, 5]) {
  if (!BUSINESS_YEARS.includes(year) || !Number.isInteger(month) || month < 1 || month > 12) return null;
  const names = new Map(holidays(year).map(h => [h.date, h.name]));
  const extras = new Set(extraHolidays);
  const days = Array.from({ length: new Date(Date.UTC(year, month, 0)).getUTCDate() }, (_, i) => {
    const day = i + 1;
    const date = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const weekday = new Date(Date.UTC(year, month - 1, day)).getUTCDay();
    const holiday = names.get(date) || '';
    const companyHoliday = extras.has(date);
    return { date, day, weekday, holiday, companyHoliday, working: workingWeekdays.includes(weekday) && !holiday && !companyHoliday };
  });
  return { year, month, days, businessDays: days.filter(d => d.working).length, calendarDays: days.length };
}

// No rounding of daily work; monthly totals sum integer minutes.
export function workMinutes(start, end, breakMinutes, nextDay = false) {
  if (!/^\d{2}:\d{2}$/.test(start) || !/^\d{2}:\d{2}$/.test(end) || String(breakMinutes).trim() === '') return null;
  const parse = s => { const [h, m] = s.split(':').map(Number); return h < 24 && m < 60 ? h * 60 + m : NaN; };
  const a = parse(start), b = parse(end), pause = Number(breakMinutes);
  const elapsed = b - a + (nextDay ? 1440 : 0);
  if (![a, b, pause].every(Number.isFinite) || !Number.isInteger(pause) || pause < 0 || elapsed < 0 || elapsed > 1440 || pause > elapsed) return null;
  return elapsed - pause;
}
export function sumWorkRows(rows) {
  let totalMinutes = 0, workedDays = 0;
  const errors = [];
  const values = rows.map((r, i) => {
    if (!r.start && !r.end) return null;
    const value = workMinutes(r.start, r.end, r.breakMinutes, r.nextDay);
    if (value === null) errors.push(i);
    else { totalMinutes += value; workedDays += 1; }
    return value;
  });
  return { totalMinutes, workedDays, errors, values };
}
export function runningResult(mode, value, distanceKm) {
  const v = Number(value), distance = Number(distanceKm);
  if (!Number.isFinite(v) || !Number.isFinite(distance) || v <= 0 || distance <= 0 || distance > 1000) return null;
  const paceSeconds = mode === 'pace' ? v : mode === 'speed' ? 3600 / v : mode === 'time' ? v / distance : NaN;
  if (!Number.isFinite(paceSeconds) || paceSeconds <= 0) return null;
  return { paceSeconds, speedKmh: 3600 / paceSeconds, totalSeconds: paceSeconds * distance };
}
export function durationText(seconds) {
  const rounded = Math.round(seconds);
  const h = Math.floor(rounded / 3600), m = Math.floor(rounded % 3600 / 60), s = rounded % 60;
  return h ? `${h}時間${m}分${s}秒` : `${m}分${s}秒`;
}
export function csvText(rows) {
  return '\uFEFF' + rows.map(row => row.map(v => '"' + String(v ?? '').replaceAll('"', '""') + '"').join(',')).join('\r\n');
}
export function downloadCsv(filename, rows) {
  const url = URL.createObjectURL(new Blob([csvText(rows)], { type: 'text/csv;charset=utf-8' }));
  const link = document.createElement('a'); link.href = url; link.download = filename; link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
