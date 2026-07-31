// 日数計算・日付計算のロジック（純関数・DOM非依存）。
// 日付は UTC 正午基準で扱い、タイムゾーンや夏時間による日付ズレを避ける。

import { holidays as nationalHolidays } from './shukujitsu.js';

const DAY_MS = 24 * 60 * 60 * 1000;
const SHIFT_UNITS = new Set(['day', 'week', 'month', 'year']);
const WEEKDAYS = ['日', '月', '火', '水', '木', '金', '土'];

function utcNoon(year, monthIndex, day) {
  // Date.UTC は 0〜99 年を 1900 年台として扱うため、一度 2000 年で作って年を上書きする。
  const date = new Date(Date.UTC(2000, monthIndex, day, 12, 0, 0));
  date.setUTCFullYear(year);
  return date;
}

// 入力（ISO文字列 or Date）を UTC正午の Date に正規化する。存在しない日付は null。
function toDate(input) {
  if (input == null || input === '') return null;

  if (input instanceof Date) {
    if (Number.isNaN(input.getTime())) return null;
    return utcNoon(input.getFullYear(), input.getMonth(), input.getDate());
  }

  if (typeof input !== 'string') return null;
  const match = input.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return null;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (year < 1 || month < 1 || month > 12 || day < 1 || day > 31) return null;

  const date = utcNoon(year, month - 1, day);
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) return null;
  return date;
}

function toISO(date) {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function addUtcDays(date, amount) {
  return new Date(date.getTime() + amount * DAY_MS);
}

// 二つの日付の間の日数。既定は初日を含まず、includeBoth で両端を含める。
export function daysBetween(from, to, { includeBoth = false } = {}) {
  const start = toDate(from);
  const end = toDate(to);
  if (!start || !end) return null;
  const diff = Math.abs(Math.round((end.getTime() - start.getTime()) / DAY_MS));
  return includeBoth ? diff + 1 : diff;
}

// 基準日から n 日後（負数なら n 日前）の日付。既存 API として維持する。
export function shiftDate(base, n) {
  return shiftDateBy(base, n, 'day');
}

// 日・週・月・年単位で日付を移動する。月末を超える場合は移動先の月末に丸める。
export function shiftDateBy(base, amount, unit = 'day') {
  const date = toDate(base);
  const value = Number(amount);
  if (!date || !Number.isInteger(value) || !SHIFT_UNITS.has(unit)) return null;

  if (unit === 'day') return toISO(addUtcDays(date, value));
  if (unit === 'week') return toISO(addUtcDays(date, value * 7));

  const originalYear = date.getUTCFullYear();
  const originalMonth = date.getUTCMonth();
  const originalDay = date.getUTCDate();
  const monthDelta = unit === 'year' ? value * 12 : value;
  const totalMonths = originalYear * 12 + originalMonth + monthDelta;
  const targetYear = Math.floor(totalMonths / 12);
  const targetMonth = totalMonths - targetYear * 12;
  if (targetYear < 1 || targetYear > 9999) return null;

  const lastDay = new Date(Date.UTC(targetYear, targetMonth + 1, 0, 12)).getUTCDate();
  return toISO(utcNoon(targetYear, targetMonth, Math.min(originalDay, lastDay)));
}

// 選択した期間を暦日・平日・土日・平日の祝日・営業日に分解する。
// includeBoth=false の場合は、時系列で先頭の日を除き、末日を含める。
export function dateRangeBreakdown(from, to, { includeBoth = false } = {}) {
  const first = toDate(from);
  const second = toDate(to);
  if (!first || !second) return null;

  const low = first.getTime() <= second.getTime() ? first : second;
  const high = first.getTime() <= second.getTime() ? second : first;
  const calendarDays = daysBetween(from, to, { includeBoth });
  const result = {
    calendarDays,
    weeks: Math.floor(calendarDays / 7),
    remainingDays: calendarDays % 7,
    weekdays: 0,
    weekendDays: 0,
    holidayWeekdays: 0,
    businessDays: 0,
    holidays: [],
  };
  if (calendarDays === 0) return result;

  const countedStart = includeBoth ? low : addUtcDays(low, 1);
  const holidayMap = new Map();
  for (let year = countedStart.getUTCFullYear(); year <= high.getUTCFullYear(); year++) {
    for (const holiday of nationalHolidays(year)) holidayMap.set(holiday.date, holiday.name);
  }

  for (let time = countedStart.getTime(); time <= high.getTime(); time += DAY_MS) {
    const date = new Date(time);
    const weekday = date.getUTCDay();
    const iso = toISO(date);
    if (weekday === 0 || weekday === 6) {
      result.weekendDays += 1;
      continue;
    }

    result.weekdays += 1;
    if (holidayMap.has(iso)) {
      result.holidayWeekdays += 1;
      result.holidays.push({ date: iso, name: holidayMap.get(iso) });
    } else {
      result.businessDays += 1;
    }
  }

  return result;
}

export function weekdayJa(date) {
  const parsed = toDate(date);
  if (!parsed) return null;
  return WEEKDAYS[parsed.getUTCDay()];
}
