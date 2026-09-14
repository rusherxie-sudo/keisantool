// 勤続年数・在籍期間の計算ロジック（純関数・DOM非依存）。
// 日付処理は nissu.js の UTC 正午基準を再利用し、月末・うるう年を暦どおりに扱う。

import { calendarDuration, daysBetween, shiftDateBy } from './nissu.js';

const PAID_LEAVE_DAYS = [10, 11, 12, 14, 16, 18, 20];

// 「現在N年目」から入社日の範囲を求める。周年日は正方向と同じ月末規則。
export function reverseServiceYear(serviceYear, referenceDateInput, mode = 'range') {
  const referenceDate = normalizeDate(referenceDateInput);
  if (!Number.isInteger(serviceYear) || serviceYear < 1 || serviceYear > 100
    || !referenceDate || referenceDate < '1900-01-01'
    || !['range', 'april-first'].includes(mode)) return null;

  const year = Number(referenceDate.slice(0, 4));
  const earliest = `${year - serviceYear}-01-01`;
  // 勤続年目は入社日が新しいほど小さくなる。境界を日単位で探索することで
  // 2/29入社→翌年2/28周年も、単純な年の引き算と異なり正しく反転できる。
  function firstDayAtMost(targetYear) {
    let low = 0;
    let high = daysBetween(earliest, referenceDate);
    while (low < high) {
      const middle = Math.floor((low + high) / 2);
      const candidate = shiftDateBy(earliest, middle, 'day');
      if (calendarDuration(candidate, referenceDate).years + 1 <= targetYear) high = middle;
      else low = middle + 1;
    }
    return shiftDateBy(earliest, low, 'day');
  }

  const startDate = firstDayAtMost(serviceYear);
  const endDate = serviceYear === 1 ? referenceDate : shiftDateBy(firstDayAtMost(serviceYear - 1), -1, 'day');
  if (mode === 'april-first') {
    const aprilYear = year - serviceYear + (referenceDate.slice(5) >= '04-01' ? 1 : 0);
    const joinDate = `${aprilYear}-04-01`;
    return { serviceYear, referenceDate, startDate: joinDate, endDate: joinDate, mode };
  }
  return { serviceYear, referenceDate, startDate, endDate, mode };
}

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
