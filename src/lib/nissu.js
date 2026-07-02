// 日数計算・日付計算のロジック（純関数・DOM非依存）。
// 日付は UTC 正午基準で扱い、タイムゾーンや夏時間による日付ズレを避ける。
// （shussan.js / nenrei.js と同じ toDate/toISO/addDays パターン）

const DAY_MS = 24 * 60 * 60 * 1000;

// 入力（ISO文字列 or Date）を UTC正午の Date に正規化する。無効なら null。
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

// Date を ISO（YYYY-MM-DD）文字列に変換。
function toISO(d) {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

// 二つの日付の間の日数。既定は「初日を含まない」(片端)、includeBoth で「両端を含む」(+1)。
// 順序が逆でも絶対値で返す。無効な入力は null。
export function daysBetween(from, to, { includeBoth = false } = {}) {
  const a = toDate(from);
  const b = toDate(to);
  if (!a || !b) return null;
  const diff = Math.abs(Math.round((b.getTime() - a.getTime()) / DAY_MS));
  return includeBoth ? diff + 1 : diff;
}

// 基準日から n 日後（負数なら n 日前）の日付。ISO文字列を返す。無効なら null。
export function shiftDate(base, n) {
  const d = toDate(base);
  if (!d || !Number.isFinite(n)) return null;
  return toISO(new Date(d.getTime() + n * DAY_MS));
}

const WEEKDAYS = ['日', '月', '火', '水', '木', '金', '土'];

// 曜日（日〜土）を返す。無効なら null。
export function weekdayJa(date) {
  const d = toDate(date);
  if (!d) return null;
  return WEEKDAYS[d.getUTCDay()];
}
