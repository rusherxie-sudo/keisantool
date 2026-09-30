import { holidays } from './shukujitsu.js';
import { shiftDateBy, daysBetween } from './nissu.js';

export const PLAN_FROM = '2026-01-01';
export const PLAN_TO = '2027-12-31';
export const isPlanDate = value => typeof value === 'string' && value >= PLAN_FROM && value <= PLAN_TO && shiftDateBy(value, 0) === value;
export function normalizeSchedule(weekdays = [1,2,3,4,5], extra = []) {
  if (!Array.isArray(weekdays) || !weekdays.length || weekdays.length > 7 || weekdays.some(d => !Number.isInteger(d) || d < 0 || d > 6)) return null;
  if (!Array.isArray(extra) || extra.length > 40 || extra.some(d => !isPlanDate(d))) return null;
  return { weekdays: [...new Set(weekdays)].sort(), extra: [...new Set(extra)].sort() };
}
function calendar(schedule) {
  const names = new Map([2026,2027].flatMap(y => holidays(y)).map(h => [h.date,h.name]));
  const extras = new Set(schedule.extra);
  return date => {
    const weekday = new Date(date+'T12:00:00Z').getUTCDay();
    const holiday = names.get(date) || '';
    const companyHoliday = extras.has(date);
    return { date, weekday, holiday, companyHoliday, working: schedule.weekdays.includes(weekday) && !holiday && !companyHoliday };
  };
}
export function holidayPlan(start, end, weekdays = [1,2,3,4,5], extra = []) {
  const schedule = normalizeSchedule(weekdays, extra);
  if (!schedule || !isPlanDate(start) || !isPlanDate(end) || start > end || daysBetween(start,end) > 61) return null;
  const row = calendar(schedule), days = [];
  for (let d=start;d<=end;d=shiftDateBy(d,1)) days.push(row(d));
  const workingDays=days.filter(d=>d.working).length;
  return { start,end,...schedule,days,workingDays,offDays:days.length-workingDays };
}
// Backward planning with a confirmed leave balance, not an entitlement calculation.
// Retirement date included; only scheduled working days consume a full leave day.
export function retirementLeavePlan(retire, balance, weekdays = [1,2,3,4,5], extra = []) {
  const schedule = normalizeSchedule(weekdays,extra);
  if (!schedule || !isPlanDate(retire) || !Number.isInteger(balance) || balance < 0 || balance > 120) return null;
  const row=calendar(schedule), leaveDates=[];
  let cursor=retire;
  while (cursor >= PLAN_FROM && leaveDates.length < balance) {
    if (row(cursor).working) leaveDates.push(cursor);
    cursor=shiftDateBy(cursor,-1);
  }
  if (leaveDates.length !== balance) return null;
  let lastWork=balance ? cursor : retire;
  while(lastWork >= PLAN_FROM && !row(lastWork).working) lastWork=shiftDateBy(lastWork,-1);
  if(lastWork < PLAN_FROM) return null;
  leaveDates.reverse();
  const firstLeave=leaveDates[0] || null;
  const days=[];
  for(let d=firstLeave || lastWork;d<=retire;d=shiftDateBy(d,1)) days.push(row(d));
  return { retire,balance,...schedule,firstLeave,lastWork,leaveDates,days };
}
