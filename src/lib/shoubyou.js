// 健康保険の傷病手当金計算（純関数・DOM非依存）。
// 現行ルール:
// - 支給日額 = 支給開始日前12か月の平均標準報酬月額 ÷ 30 × 2/3
// - 標準報酬日額は10円未満四捨五入、2/3後は1円未満四捨五入
// - 連続3日の待期後、4日目から支給。支給期間は通算1年6か月
// 出典: 全国健康保険協会「傷病手当金」、健康保険法第99条。

const DAY_MS = 24 * 60 * 60 * 1000;
const SHORT_MEMBERSHIP_CAP = 320000;

function numberOrZero(value) {
  if (value === null || value === undefined || value === '') return 0;
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : 0;
}

// ISO日付をUTC正午で扱い、存在しない日付も拒否する。
function toDate(value) {
  if (typeof value !== 'string') return null;
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day, 12));
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

function addDays(date, days) {
  return new Date(date.getTime() + days * DAY_MS);
}

// 月末を越える場合は対象月の末日に丸める。
function addMonthsClamped(date, months) {
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth();
  const day = date.getUTCDate();
  const targetFirst = new Date(Date.UTC(year, month + months, 1, 12));
  const lastDay = new Date(Date.UTC(
    targetFirst.getUTCFullYear(),
    targetFirst.getUTCMonth() + 1,
    0,
    12,
  )).getUTCDate();
  return new Date(Date.UTC(
    targetFirst.getUTCFullYear(),
    targetFirst.getUTCMonth(),
    Math.min(day, lastDay),
    12,
  ));
}

function inclusiveDays(start, end) {
  return Math.round((end.getTime() - start.getTime()) / DAY_MS) + 1;
}

// 被保険者期間が12か月未満の場合は、本人の平均額と協会けんぽ平均32万円の低い方。
// 32万円は支給開始日が令和7年4月1日以降の協会けんぽ基準。
export function applicablePremiumBase(averagePremiumBase, insuredMonths = 12) {
  const average = numberOrZero(averagePremiumBase);
  if (average === 0) return 0;
  const months = Number(insuredMonths);
  if (Number.isFinite(months) && months > 0 && months < 12) {
    return Math.min(average, SHORT_MEMBERSHIP_CAP);
  }
  return average;
}

// 平均標準報酬月額 ÷ 30。10円未満を四捨五入する。
export function standardDailyAmount(averagePremiumBase) {
  const base = numberOrZero(averagePremiumBase);
  if (base === 0) return 0;
  return Math.round((base / 30) / 10) * 10;
}

// 標準報酬日額 × 2/3。1円未満を四捨五入する。
export function dailyAmount(averagePremiumBase) {
  const standardDaily = standardDailyAmount(averagePremiumBase);
  if (standardDaily === 0) return 0;
  return Math.round(standardDaily * 2 / 3);
}

// 30日分の参考額。実際は支給対象日数に応じて変わる。
export function monthlyAmount(averagePremiumBase) {
  return dailyAmount(averagePremiumBase) * 30;
}

// 休業中に給与・手当等が支払われる場合は傷病手当金との差額を支給。
export function adjustedDailyAmount(allowanceDaily, paidDaily = 0) {
  const allowance = numberOrZero(allowanceDaily);
  const paid = numberOrZero(paidDaily);
  return Math.max(0, Math.round(allowance - paid));
}

// 連続休業を前提に、待期・支給開始・入力期間・連続支給時の上限日を返す。
export function benefitPeriod(startDate, endDate) {
  const start = toDate(startDate);
  const end = toDate(endDate);
  if (!start || !end || end < start) return null;

  const waitingEnd = addDays(start, 2);
  const paymentStart = addDays(start, 3);
  const maximumEnd = addDays(addMonthsClamped(paymentStart, 18), -1);
  const requestedPayableDays = end < paymentStart ? 0 : inclusiveDays(paymentStart, end);
  const isCapped = end > maximumEnd;
  const actualEnd = isCapped ? maximumEnd : end;
  const days = actualEnd < paymentStart ? 0 : inclusiveDays(paymentStart, actualEnd);

  return {
    waitingStart: toISO(start),
    waitingEnd: toISO(waitingEnd),
    paymentStart: toISO(paymentStart),
    paymentEnd: days > 0 ? toISO(actualEnd) : null,
    maximumEnd: toISO(maximumEnd),
    requestedPayableDays,
    payableDays: days,
    isCapped,
  };
}

export function payableDays(startDate, endDate) {
  return benefitPeriod(startDate, endDate)?.payableDays ?? 0;
}

function zeroResult() {
  return {
    inputAveragePremiumBase: 0,
    applicablePremiumBase: 0,
    standardDailyAmount: 0,
    dailyAmount: 0,
    adjustedDailyAmount: 0,
    thirtyDayEstimate: 0,
    payableDays: 0,
    totalAmount: 0,
    capApplied: false,
    period: null,
  };
}

export function calcShoubyou({
  averagePremiumBase,
  insuredMonths = 12,
  startDate,
  endDate,
  paidDaily = 0,
} = {}) {
  const inputBase = numberOrZero(averagePremiumBase);
  const period = benefitPeriod(startDate, endDate);
  if (inputBase === 0 || period === null) return zeroResult();

  const base = applicablePremiumBase(inputBase, insuredMonths);
  const standardDaily = standardDailyAmount(base);
  const allowanceDaily = dailyAmount(base);
  const payableDaily = adjustedDailyAmount(allowanceDaily, paidDaily);

  return {
    inputAveragePremiumBase: inputBase,
    applicablePremiumBase: base,
    standardDailyAmount: standardDaily,
    dailyAmount: allowanceDaily,
    adjustedDailyAmount: payableDaily,
    thirtyDayEstimate: payableDaily * 30,
    payableDays: period.payableDays,
    totalAmount: payableDaily * period.payableDays,
    capApplied: base < inputBase,
    period,
  };
}
