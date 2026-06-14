// 産休・育休の日程と給付金を計算する純関数（DOM非依存）。
// 日付は UTC 正午基準で扱い、タイムゾーン・夏時間による日付ズレを回避する。
// 金額の端数は Math.floor で切り捨て（CLAUDE.md 規約）。

function toDate(input) {
  if (input == null || input === '') return null;
  let d;
  if (input instanceof Date) {
    d = new Date(Date.UTC(input.getFullYear(), input.getMonth(), input.getDate(), 12, 0, 0));
  } else if (typeof input === 'string') {
    const m = input.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (!m) return null;
    d = new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3]), 12, 0, 0));
  } else {
    return null;
  }
  return Number.isNaN(d.getTime()) ? null : d;
}

function toISO(d) {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function addDays(d, days) {
  return new Date(d.getTime() + days * 24 * 60 * 60 * 1000);
}

// N ヶ月後の同月同日を返す（月末日をまたぐ場合は JavaScript の Date 自動繰り越しに依存）。
function addMonths(d, months) {
  const y = d.getUTCFullYear() + Math.floor((d.getUTCMonth() + months) / 12);
  const mo = (d.getUTCMonth() + months) % 12;
  return new Date(Date.UTC(y, mo, d.getUTCDate(), 12, 0, 0));
}

// 産前休業開始日 = 出産予定日 − 42日（多胎は98日）。
export function calcSanzenStart(dueDate, isMultiple = false) {
  const d = toDate(dueDate);
  if (!d) return null;
  return toISO(addDays(d, isMultiple ? -98 : -42));
}

// 産後休業終了日 = 出産日 + 56日（産後8週）。
export function calcSangoEnd(birthDate) {
  const d = toDate(birthDate);
  if (!d) return null;
  return toISO(addDays(d, 56));
}

// 育休終了日 = 誕生日から (12 + extendMonths) ヶ月後の前日。
// extendMonths: 0=1歳, 6=1歳6ヶ月, 12=2歳
export function calcIkukyuEnd(birthDate, extendMonths = 0) {
  const d = toDate(birthDate);
  if (!d) return null;
  const anniversary = addMonths(d, 12 + extendMonths);
  return toISO(addDays(anniversary, -1));
}

// 出産手当金 = 標準報酬日額 × 2/3 × 日数（切り捨て）。
// 標準報酬日額 = 標準報酬月額 ÷ 30。
export function calcShussanTeate(standardDailyAmount, days) {
  if (!Number.isFinite(standardDailyAmount) || standardDailyAmount <= 0) return null;
  if (!Number.isFinite(days) || days <= 0) return null;
  return Math.floor(standardDailyAmount * (2 / 3) * days);
}

// 育児休業給付金 = 最初180日は日額×67%、181日目以降は日額×50%（各切り捨て）。
export function calcIkukyuKyuufu(dailyWage, totalDays) {
  if (!Number.isFinite(dailyWage) || dailyWage <= 0) return null;
  if (!Number.isFinite(totalDays) || totalDays <= 0) return null;
  const firstDays = Math.min(totalDays, 180);
  const restDays = Math.max(0, totalDays - 180);
  const first = Math.floor(dailyWage * 0.67 * firstDays);
  const rest = Math.floor(dailyWage * 0.5 * restDays);
  return { total: first + rest, first, rest, firstDays, restDays };
}
