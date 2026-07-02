// 排卵日・生理日予測のロジック（純関数・DOM非依存）。
// 日付は UTC 正午基準で扱い、タイムゾーンや夏時間による日付ズレを避ける。
// あくまで一般的な目安（黄体期を14日と仮定）で、医学的な診断ではない。

const DAY_MS = 24 * 60 * 60 * 1000;

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
  return new Date(d.getTime() + days * DAY_MS);
}

// 周期の検証。医学的に妥当な範囲（15〜60日）のみ許容。
// 下限15日: 黄体期14日の仮定では cycle−14 ≥ 1 が必要
//（さもないと排卵日が生理開始日より前という不合理な予測になる）。
function validCycle(cycle) {
  const c = Number(cycle);
  return Number.isFinite(c) && c >= 15 && c <= 60 ? c : null;
}

// 前回の生理開始日と周期から、次回以降の生理開始日を count 回分予測。
// n回目 = lastStart + cycle × n。ISO文字列の配列を返す。無効なら null。
export function predictPeriods(lastStart, cycle, count = 1) {
  const start = toDate(lastStart);
  const c = validCycle(cycle);
  const n = Number(count);
  if (!start || !c || !Number.isFinite(n) || n < 1) return null;
  const out = [];
  for (let i = 1; i <= n; i++) {
    out.push(toISO(addDays(start, Math.round(c * i))));
  }
  return out;
}

// 排卵日の予測 = 前回の生理開始日 +(周期 − 14)（黄体期14日を仮定）。
// = 次回生理予定日 − 14日。ISO文字列を返す。無効なら null。
export function ovulation(lastStart, cycle) {
  const start = toDate(lastStart);
  const c = validCycle(cycle);
  if (!start || !c) return null;
  return toISO(addDays(start, Math.round(c) - 14));
}

// 妊娠しやすい時期 = 排卵日の5日前〜1日後。{ start, end } を返す。無効なら null。
export function fertileWindow(lastStart, cycle) {
  const ov = ovulation(lastStart, cycle);
  if (!ov) return null;
  const d = toDate(ov);
  return { start: toISO(addDays(d, -5)), end: toISO(addDays(d, 1)) };
}
