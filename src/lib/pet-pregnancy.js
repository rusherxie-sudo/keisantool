// 猫・犬の妊娠期間計算（純関数・DOM非依存）。
// 出典（一次資料）:
//   猫 = 交配日 + 65日（正常範囲 63〜67）: iCatCare / Merck Veterinary Manual
//   犬 = 交配日 + 63日（正常範囲 56〜72）: Cornell / AKC / Merck Veterinary Manual
// 日付は UTC 正午基準で扱い、タイムゾーン/夏時間による日付ズレを避ける（shussan.js と同方式）。

const DAY_MS = 24 * 60 * 60 * 1000;

// 入力（ISO文字列 or Date）を UTC正午の Date に正規化。無効なら null。
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

// 種別ごとの妊娠日数（平均・正常範囲）。
const GESTATION = {
  neko: { avg: 65, early: 63, late: 67 },
  inu: { avg: 63, early: 56, late: 72 },
};

// 妊娠時期区分の境界（日数）。前期 ≤zenki / 中期 ≤chuki / 後期 それ以降。
//   猫: 前期〜3週(21日) / 中期〜6週(42日) / 後期7週〜
//   犬: 前期〜4週(28日) / 中期〜6週(42日) / 後期7週〜
const STAGE = {
  neko: { zenki: 21, chuki: 42 },
  inu: { zenki: 28, chuki: 42 },
};

// 出産予定日 = 交配日 + 平均妊娠日数。ISO文字列を返す。無効なら null。
export function dueDate(matingDate, kind) {
  const g = GESTATION[kind];
  const d = toDate(matingDate);
  if (!g || !d) return null;
  return toISO(addDays(d, g.avg));
}

// 出産可能範囲（早い側 early・遅い側 late）。{early, late} or null。
export function dueRange(matingDate, kind) {
  const g = GESTATION[kind];
  const d = toDate(matingDate);
  if (!g || !d) return null;
  return { early: toISO(addDays(d, g.early)), late: toISO(addDays(d, g.late)) };
}

// 交配日からの経過。{days, weeks(完整週)} or null（基準日が交配日より前・無効）。
export function elapsed(matingDate, today) {
  const start = toDate(matingDate);
  const base = toDate(today);
  if (!start || !base) return null;
  const days = Math.round((base.getTime() - start.getTime()) / DAY_MS);
  if (days < 0) return null;
  return { days, weeks: Math.floor(days / 7) };
}

// 妊娠時期区分（経過日数と種別から）。'前期'/'中期'/'後期' or null。
export function pregnancyStage(days, kind) {
  const s = STAGE[kind];
  if (!s || !Number.isFinite(days) || days < 0) return null;
  if (days <= s.zenki) return '前期';
  if (days <= s.chuki) return '中期';
  return '後期';
}
