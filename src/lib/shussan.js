// 出産予定日・妊娠週数の計算ロジック（純関数・DOM非依存）。
// 「今日」に依存する関数は基準日を引数で受け取り、テストの再現性を担保する。
// 日付は UTC 正午基準で扱い、タイムゾーンや夏時間による日付ズレを避ける。

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

// 指定日数を加算した新しい Date を返す。
function addDays(d, days) {
  return new Date(d.getTime() + days * 24 * 60 * 60 * 1000);
}

const DAY_MS = 24 * 60 * 60 * 1000;

// 出産予定日 = 最終月経開始日（LMP）+ 280日（ネーゲレ概算）。ISO文字列を返す。
export function dueDate(lmp) {
  const d = toDate(lmp);
  if (!d) return null;
  return toISO(addDays(d, 280));
}

// 現在の妊娠週数・日数。基準日(today)と LMP の経過日数から算出。
// weeks = floor(経過日/7), days = 経過日%7。未来の LMP（経過日<0）や無効は null。
export function pregnancyWeeks(lmp, today) {
  const start = toDate(lmp);
  const base = toDate(today);
  if (!start || !base) return null;
  const totalDays = Math.round((base.getTime() - start.getTime()) / DAY_MS);
  if (totalDays < 0) return null;
  return {
    weeks: Math.floor(totalDays / 7),
    days: totalDays % 7,
    totalDays,
  };
}

// 妊娠時期区分：初期(〜15週)/中期(16〜27週)/後期(28週〜)。
export function pregnancyStage(weeks) {
  if (!Number.isFinite(weeks) || weeks < 0) return null;
  if (weeks <= 15) return '初期';
  if (weeks <= 27) return '中期';
  return '後期';
}

// 逆算：最終月経開始日（LMP）= 出産予定日 − 280日。ISO文字列を返す。無効なら null。
export function lmpFromDue(due) {
  const d = toDate(due);
  if (!d) return null;
  return toISO(addDays(d, -280));
}

// 排卵日・受精日の目安 = 出産予定日 − 266日（排卵≈LMP+14日）。ISO文字列を返す。無効なら null。
export function ovulationFromDue(due) {
  const d = toDate(due);
  if (!d) return null;
  return toISO(addDays(d, -266));
}

// 妊娠月数（日本の「妊娠○ヶ月」慣例：4週=1ヶ月、妊娠0週から1ヶ月目）。
// 月数 = floor(週数 / 4) + 1。負数や無効は null。
export function pregnancyMonths(weeks) {
  if (!Number.isFinite(weeks) || weeks < 0) return null;
  return Math.floor(weeks / 4) + 1;
}

// 産休目安：開始 = 出産予定日 − 42日（6週前）、終了 = 出産日（予定日）+ 56日（8週後）。
export function maternityLeave(due) {
  const d = toDate(due);
  if (!d) return null;
  return {
    leaveStart: toISO(addDays(d, -42)),
    leaveEnd: toISO(addDays(d, 56)),
  };
}
