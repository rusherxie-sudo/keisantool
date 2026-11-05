import { businessMonth, BUSINESS_YEARS } from './office-tools.js';

export const BANK_SOURCES = [
  { name: '銀行法 第15条', url: 'https://laws.e-gov.go.jp/law/356AC0000000059#Mp-At_15' },
  { name: '銀行法施行令 第5条', url: 'https://laws.e-gov.go.jp/law/357CO0000000040#Mp-At_5' },
  { name: '内閣府「国民の祝日について」', url: 'https://www8.cao.go.jp/chosei/shukujitsu/gaiyou.html' },
];
export const BANK_REVIEWED = '2026-11-01';

export function bankMonth(year, month) {
  const yearEnd = [`${year}-01-01`, `${year}-01-02`, `${year}-01-03`, `${year}-12-31`];
  const calendar = businessMonth(year, month, yearEnd);
  if (!calendar) return null;
  return {
    ...calendar,
    days: calendar.days.map(day => ({
      ...day,
      bankHoliday: yearEnd.includes(day.date),
      reason: day.holiday || (yearEnd.includes(day.date) ? '銀行の年末年始休業日' : [0, 6].includes(day.weekday) ? '土日' : ''),
    })),
  };
}

// Dates stay within the years checked against the published holiday data.
// The reference date is excluded, even when it is a bank business day.
export function nextBankBusinessDay(date, count = 1) {
  if (typeof date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(date) ||
      !Number.isInteger(count) || count < 1 || count > 260) return null;
  const parsed = new Date(`${date}T00:00:00Z`);
  if (!Number.isFinite(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== date ||
      !BUSINESS_YEARS.includes(parsed.getUTCFullYear())) return null;
  const days = BUSINESS_YEARS.flatMap(year =>
    Array.from({ length: 12 }, (_, index) => bankMonth(year, index + 1).days).flat()
  );
  return days.filter(day => day.date > date && day.working)[count - 1]?.date ?? null;
}
