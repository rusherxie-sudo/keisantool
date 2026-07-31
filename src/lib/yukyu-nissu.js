// 年次有給休暇の法定付与日数計算（純関数・DOM非依存）。
// 厚生労働省の通常付与・比例付与表を単一データ源にし、日付はUTC正午基準で扱う。

import { calendarDuration, shiftDateBy } from './nissu.js';

const SERVICE_MONTHS = [6, 18, 30, 42, 54, 66, 78];
const SCHEDULES = {
  regular: [10, 11, 12, 14, 16, 18, 20],
  'four-days': [7, 8, 9, 10, 12, 13, 15],
  'three-days': [5, 6, 6, 8, 9, 10, 11],
  'two-days': [3, 4, 4, 5, 6, 6, 7],
  'one-day': [1, 2, 2, 2, 3, 3, 3],
};

function normalizeDate(input) {
  if (typeof input !== 'string') return null;
  const normalized = shiftDateBy(input, 0, 'day');
  return normalized === input ? normalized : null;
}

export function paidLeaveSchedule(workPattern) {
  const days = SCHEDULES[workPattern];
  if (!days) return [];
  return SERVICE_MONTHS.map((serviceMonths, index) => ({
    serviceMonths,
    days: days[index],
  }));
}

export function calculatePaidLeave({
  hireDate: hireDateInput,
  referenceDate: referenceDateInput,
  workPattern,
  attendanceRate,
} = {}) {
  const hireDate = normalizeDate(hireDateInput);
  const referenceDate = normalizeDate(referenceDateInput);
  const schedule = SCHEDULES[workPattern];
  const rate = Number(attendanceRate);

  if (
    !hireDate || !referenceDate || referenceDate < hireDate || !schedule
    || !Number.isFinite(rate) || rate < 0 || rate > 100
  ) return null;

  const duration = calendarDuration(hireDate, referenceDate);
  const firstGrantDate = shiftDateBy(hireDate, 6, 'month');
  if (referenceDate < firstGrantDate) {
    return {
      hireDate,
      referenceDate,
      workPattern,
      attendanceRate: rate,
      duration,
      eligibleByAttendance: null,
      currentGrantDate: null,
      statutoryGrantDays: 0,
      expirationDate: null,
      nextGrantDate: firstGrantDate,
      nextStatutoryDays: schedule[0],
      fiveDayObligation: false,
    };
  }

  const completedGrantYears = calendarDuration(firstGrantDate, referenceDate).years;
  const currentIndex = Math.min(completedGrantYears, schedule.length - 1);
  const nextIndex = Math.min(completedGrantYears + 1, schedule.length - 1);
  const currentGrantDate = shiftDateBy(firstGrantDate, completedGrantYears, 'year');
  const eligibleByAttendance = rate >= 80;
  const statutoryGrantDays = eligibleByAttendance ? schedule[currentIndex] : 0;

  return {
    hireDate,
    referenceDate,
    workPattern,
    attendanceRate: rate,
    duration,
    eligibleByAttendance,
    currentGrantDate,
    statutoryGrantDays,
    expirationDate: eligibleByAttendance ? shiftDateBy(currentGrantDate, 2, 'year') : null,
    nextGrantDate: shiftDateBy(firstGrantDate, completedGrantYears + 1, 'year'),
    nextStatutoryDays: schedule[nextIndex],
    fiveDayObligation: eligibleByAttendance && statutoryGrantDays >= 10,
  };
}
