// 和暦・西暦変換ロジック（純関数・DOM 非依存）
//
// 元号表：改元日（グレゴリオ暦）と開始西暦年を持つ。新しい順に並べる。
// 明治の改元日は慶応4年9月8日＝グレゴリオ暦 1868-10-23 を採用する。
export const eras = [
  { name: '令和', startYear: 2019, startMonth: 5, startDay: 1 },
  { name: '平成', startYear: 1989, startMonth: 1, startDay: 8 },
  { name: '昭和', startYear: 1926, startMonth: 12, startDay: 25 },
  { name: '大正', startYear: 1912, startMonth: 7, startDay: 30 },
  { name: '明治', startYear: 1868, startMonth: 10, startDay: 23 },
];

// 数値化ヘルパ：有限な数値に変換できなければ NaN を返す。
function toNum(v) {
  if (v === null || v === undefined || v === '') return NaN;
  const n = Number(v);
  return Number.isFinite(n) ? n : NaN;
}

// (y, m, d) を比較可能な整数キーに変換する（y*10000 + m*100 + d）。
function ymdKey(y, m, d) {
  return y * 10000 + m * 100 + d;
}

/**
 * 西暦 → 和暦
 * @param {number} year  西暦年（必須）
 * @param {number} [month] 月（省略時は、その年の改元後の元号を採用するため 12 とみなす）
 * @param {number} [day]   日（同上、省略時は 31）
 * @returns {{era:string, eraYear:number, label:string}|null}
 *   明治の改元日より前、または不正な入力は null。
 */
export function seirekiToWareki(year, month, day) {
  const y = toNum(year);
  if (Number.isNaN(y)) return null;

  // 月日が省略された場合は「その年の末日」とみなす。
  // → その年に改元があれば改元後の元号（＝新しい元号）になる。
  const m = month === undefined ? 12 : toNum(month);
  const d = day === undefined ? 31 : toNum(day);
  if (Number.isNaN(m) || Number.isNaN(d)) return null;

  const key = ymdKey(y, m, d);

  // 新しい順に走査し、改元日以降であれば最初に一致した元号を採用する。
  for (const era of eras) {
    const start = ymdKey(era.startYear, era.startMonth, era.startDay);
    if (key >= start) {
      const eraYear = y - era.startYear + 1;
      const label = era.name + (eraYear === 1 ? '元' : eraYear) + '年';
      return { era: era.name, eraYear, label };
    }
  }
  // 明治改元日より前。
  return null;
}

/**
 * 和暦 → 西暦
 * @param {string} era     元号名（例：'令和'）
 * @param {number|string} eraYear 元号年。1 / '1' / '元' / '元年' を 1 として扱う。
 * @returns {number|null}  西暦年。元号が存在しない、または年が 1 未満なら null。
 */
export function warekiToSeireki(era, eraYear) {
  const found = eras.find((e) => e.name === era);
  if (!found) return null;

  // 「元」「元年」は 1 年として扱う。
  let n;
  if (typeof eraYear === 'string' && /^元(年)?$/.test(eraYear.trim())) {
    n = 1;
  } else {
    n = toNum(eraYear);
  }
  if (Number.isNaN(n) || n < 1 || !Number.isInteger(n)) return null;

  return found.startYear + n - 1;
}
