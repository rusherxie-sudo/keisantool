// 勤続年数・在籍期間の計算ロジック（純関数・DOM非依存）。
// 日付処理は nissu.js の UTC 正午基準を再利用し、月末・うるう年を暦どおりに扱う。

import { calendarDuration, daysBetween, shiftDateBy } from './nissu.js';

const PAID_LEAVE_DAYS = [10, 11, 12, 14, 16, 18, 20];

function normalizeDate(input) {
  if (typeof input !== 'string') return null;
  const normalized = shiftDateBy(input, 0, 'day');
  return normalized === input ? normalized : null;
}

function calculatePaidLeave(joinDate, referenceDate) {
  const firstGrantDate = shiftDateBy(joinDate, 6, 'month');
  if (referenceDate < firstGrantDate) {
    return {
      earnedDays: 0,
      lastGrantDate: null,
      nextGrantDate: firstGrantDate,
      nextGrantDays: PAID_LEAVE_DAYS[0],
    };
  }

  const completedGrantYears = calendarDuration(firstGrantDate, referenceDate).years;
  const scheduleIndex = Math.min(completedGrantYears, PAID_LEAVE_DAYS.length - 1);
  const nextScheduleIndex = Math.min(completedGrantYears + 1, PAID_LEAVE_DAYS.length - 1);

  return {
    earnedDays: PAID_LEAVE_DAYS[scheduleIndex],
    lastGrantDate: shiftDateBy(firstGrantDate, completedGrantYears, 'year'),
    nextGrantDate: shiftDateBy(firstGrantDate, completedGrantYears + 1, 'year'),
    nextGrantDays: PAID_LEAVE_DAYS[nextScheduleIndex],
  };
}

export function calculateServicePeriod(joinDateInput, referenceDateInput) {
  const joinDate = normalizeDate(joinDateInput);
  const referenceDate = normalizeDate(referenceDateInput);
  if (!joinDate || !referenceDate || referenceDate < joinDate) return null;

  const duration = calendarDuration(joinDate, referenceDate);
  const hasPartialYear = duration.months > 0 || duration.days > 0;
  const nextAnniversaryYears = duration.years + 1;
  const nextAnniversaryDate = shiftDateBy(joinDate, nextAnniversaryYears, 'year');

  return {
    joinDate,
    referenceDate,
    duration,
    totalDays: daysBetween(joinDate, referenceDate),
    serviceYear: duration.years + 1,
    retirementTaxYears: Math.max(1, duration.years + (hasPartialYear ? 1 : 0)),
    nextAnniversary: {
      date: nextAnniversaryDate,
      years: nextAnniversaryYears,
      daysRemaining: daysBetween(referenceDate, nextAnniversaryDate),
    },
    paidLeave: calculatePaidLeave(joinDate, referenceDate),
  };
}
