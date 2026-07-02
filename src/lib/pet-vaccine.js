// 犬・猫のワクチン接種スケジュールの「目安」計算（純関数・DOM非依存）。
// これは医療判断ではなく、一般的な接種時期の目安カレンダーである（ページ側で強い免責を表示）。
// 出典（一次資料）:
//   混合ワクチン初年度 = 初回8週・以後4週間隔・最終16週（犬猫同ロジック）: WSAVA 2024
//   犬の狂犬病 = 生後91日以降に初回・以後年1回: 狂犬病予防法（厚生労働省）
// 日付は UTC 正午基準で扱い、タイムゾーン/夏時間による日付ズレを避ける（shussan.js と同方式）。

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

// 混合ワクチン初年度の目安週齢（犬猫共通）。週齢 → 日数は 週×7。
const CORE_WEEKS = [8, 12, 16];

// 混合ワクチン初年度の目安スケジュール。生年月日から各回の目安日を算出。
// 返り値: [{times, weeks, date}]（3回） or null。
export function coreSchedule(birthDate) {
  const d = toDate(birthDate);
  if (!d) return null;
  return CORE_WEEKS.map((weeks, i) => ({
    times: i + 1,
    weeks,
    date: toISO(addDays(d, weeks * 7)),
  }));
}

// 犬の狂犬病ワクチン初回の目安日 = 生後91日（狂犬病予防法）。ISO文字列 or null。
export function rabiesFirstDate(birthDate) {
  const d = toDate(birthDate);
  if (!d) return null;
  return toISO(addDays(d, 91));
}
