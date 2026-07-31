// 日本の国民の祝日・振替休日・国民の休日・連休の計算ロジック（純関数・DOM非依存）。
//
// 出典・根拠：
//  - 固定日の祝日、ハッピーマンデー対象、振替休日・国民の休日の規定：
//    内閣府「国民の祝日について」https://www8.cao.go.jp/chosei/shukujitsu/gaiyou.html
//    （国民の祝日に関する法律 第2条・第3条）
//  - 春分の日・秋分の日：国立天文台が毎年2月に官報で公表するため厳密な公式は存在しないが、
//    広く使われている近似式（1980年基準、おおむね2000〜2099年の範囲で有効）を採用。
//    2024〜2027年の内閣府公表日と一致することを確認済み（tests/shukujitsu.test.js）。
//  - 2024〜2027年の祝日一覧は内閣府公表の実データで検証済み。
//
// ⚠️ 2020/2021年は東京オリンピック特措法により海の日・スポーツの日・山の日が特例で
// 移動した実績があるが、これは法律本体ではなく単年の特別措置のため、本実装では
// 通常規則（ハッピーマンデー・固定日）のみを対象とする。

function toInt(v) {
  if (v === null || v === undefined || v === '') return NaN;
  const n = Number(v);
  return Number.isInteger(n) ? n : NaN;
}

// 固定日の祝日。
const FIXED = [
  { month: 1, day: 1, name: '元日' },
  { month: 2, day: 11, name: '建国記念の日' },
  { month: 2, day: 23, name: '天皇誕生日' },
  { month: 4, day: 29, name: '昭和の日' },
  { month: 5, day: 3, name: '憲法記念日' },
  { month: 5, day: 4, name: 'みどりの日' },
  { month: 5, day: 5, name: 'こどもの日' },
  { month: 8, day: 11, name: '山の日' },
  { month: 11, day: 3, name: '文化の日' },
  { month: 11, day: 23, name: '勤労感謝の日' },
];

// ハッピーマンデー対象（第n月曜）。
const HAPPY_MONDAY = [
  { month: 1, nth: 2, name: '成人の日' },
  { month: 7, nth: 3, name: '海の日' },
  { month: 9, nth: 3, name: '敬老の日' },
  { month: 10, nth: 2, name: 'スポーツの日' },
];

// 指定年月の「第nth月曜」の日を返す。
function nthMonday(year, month, nth) {
  const firstWeekday = new Date(Date.UTC(year, month - 1, 1)).getUTCDay(); // 0=日〜6=土
  const offsetToMonday = (1 - firstWeekday + 7) % 7;
  return 1 + offsetToMonday + (nth - 1) * 7;
}

/**
 * 春分の日（月内の日）の近似値。1980年基準の広く使われる近似式。
 * 国立天文台の官報公表と2024〜2027年で一致確認済み。不正入力は null。
 */
export function shunbunDay(year) {
  const y = toInt(year);
  if (Number.isNaN(y)) return null;
  return Math.floor(20.8431 + 0.242194 * (y - 1980)) - Math.floor((y - 1980) / 4);
}

/**
 * 秋分の日（月内の日）の近似値。同上。
 */
export function shubunDay(year) {
  const y = toInt(year);
  if (Number.isNaN(y)) return null;
  return Math.floor(23.2488 + 0.242194 * (y - 1980)) - Math.floor((y - 1980) / 4);
}

function dateKey(y, m, d) {
  return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

function weekdayOf(y, m, d) {
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay();
}

function addDaysKey(y, m, d, delta) {
  const dt = new Date(Date.UTC(y, m - 1, d + delta));
  return dateKey(dt.getUTCFullYear(), dt.getUTCMonth() + 1, dt.getUTCDate());
}

/**
 * 振替休日・国民の休日を適用する前の基本祝日一覧（日付昇順）。
 *   [{ date: 'YYYY-MM-DD', name }]
 */
export function baseHolidays(year) {
  const y = toInt(year);
  if (Number.isNaN(y)) return [];
  const rows = [];
  for (const h of FIXED) rows.push({ month: h.month, day: h.day, name: h.name });
  for (const h of HAPPY_MONDAY) rows.push({ month: h.month, day: nthMonday(y, h.month, h.nth), name: h.name });
  rows.push({ month: 3, day: shunbunDay(y), name: '春分の日' });
  rows.push({ month: 9, day: shubunDay(y), name: '秋分の日' });
  rows.sort((a, b) => a.month - b.month || a.day - b.day);
  return rows.map((r) => ({ date: dateKey(y, r.month, r.day), name: r.name }));
}

/**
 * 振替休日（祝日が日曜なら、その後最初の「祝日でない平日」を休日にする）・
 * 国民の休日（祝日と祝日に挟まれた平日を休日にする）を適用した最終的な祝日一覧。
 *   [{ date: 'YYYY-MM-DD', name, kind: 'holiday'|'furikae'|'kokumin' }]
 */
export function holidays(year) {
  const y = toInt(year);
  if (Number.isNaN(y)) return [];
  const base = baseHolidays(y);
  const baseDateSet = new Set(base.map((h) => h.date));
  const result = base.map((h) => ({ ...h, kind: 'holiday' }));
  const allDateSet = new Set(baseDateSet);

  // 振替休日：base の日曜祝日ごとに、次の「base に無い日」まで探して休日を追加する。
  for (const h of base) {
    const [hy, hm, hd] = h.date.split('-').map(Number);
    if (weekdayOf(hy, hm, hd) !== 0) continue;
    let key = h.date;
    let [cy, cm, cd] = [hy, hm, hd];
    do {
      key = addDaysKey(cy, cm, cd, 1);
      [cy, cm, cd] = key.split('-').map(Number);
    } while (baseDateSet.has(key));
    if (!allDateSet.has(key)) {
      result.push({ date: key, name: '振替休日', kind: 'furikae' });
      allDateSet.add(key);
    }
  }

  // 国民の休日：base（振替休日を含まない）で、前後が祝日かつ自身は祝日でない平日を休日にする。
  for (let m = 1; m <= 12; m++) {
    const lastDay = new Date(Date.UTC(y, m, 0)).getUTCDate();
    for (let d = 1; d <= lastDay; d++) {
      const key = dateKey(y, m, d);
      if (baseDateSet.has(key)) continue;
      const prev = addDaysKey(y, m, d, -1);
      const next = addDaysKey(y, m, d, 1);
      if (baseDateSet.has(prev) && baseDateSet.has(next) && !allDateSet.has(key)) {
        result.push({ date: key, name: '国民の休日', kind: 'kokumin' });
        allDateSet.add(key);
      }
    }
  }

  return result.sort((a, b) => a.date.localeCompare(b.date));
}

function isWeekend(y, m, d) {
  const w = weekdayOf(y, m, d);
  return w === 0 || w === 6;
}

/**
 * 指定年の3連休以上（土日・祝日が連続する期間）の一覧。
 *   [{ from, to, length, holidayNames }]
 * 年またぎの連休は、その年に含まれる範囲だけを対象とする。
 */
export function renkyuList(year) {
  const y = toInt(year);
  if (Number.isNaN(y)) return [];
  const hols = holidays(y);
  const nameOf = new Map(hols.map((h) => [h.date, h.name]));
  const holidaySet = new Set(hols.map((h) => h.date));

  const streaks = [];
  let cur = [];
  const start = Date.UTC(y, 0, 1);
  const end = Date.UTC(y, 11, 31);
  for (let t = start; t <= end; t += 86400000) {
    const d = new Date(t);
    const yy = d.getUTCFullYear();
    const mm = d.getUTCMonth() + 1;
    const dd = d.getUTCDate();
    const key = dateKey(yy, mm, dd);
    const off = isWeekend(yy, mm, dd) || holidaySet.has(key);
    if (off) {
      cur.push({ date: key, holidayName: nameOf.get(key) || null });
    } else {
      if (cur.length >= 3) streaks.push(buildStreak(cur));
      cur = [];
    }
  }
  if (cur.length >= 3) streaks.push(buildStreak(cur));
  return streaks;
}

function buildStreak(days) {
  return {
    from: days[0].date,
    to: days[days.length - 1].date,
    length: days.length,
    holidayNames: [...new Set(days.map((d) => d.holidayName).filter(Boolean))],
  };
}

/**
 * 年間カレンダー表示用の12か月データを返す。
 * 各月は日曜始まり・6週固定で、月外セルは null。
 */
export function calendarMonths(year) {
  const y = toInt(year);
  if (Number.isNaN(y)) return [];

  const holidayMap = new Map(holidays(y).map((holiday) => [holiday.date, holiday]));
  const months = [];

  for (let month = 1; month <= 12; month++) {
    const firstWeekday = weekdayOf(y, month, 1);
    const daysInMonth = new Date(Date.UTC(y, month, 0)).getUTCDate();
    const cells = Array.from({ length: 42 }, (_, index) => {
      const day = index - firstWeekday + 1;
      if (day < 1 || day > daysInMonth) return null;
      const date = dateKey(y, month, day);
      const holiday = holidayMap.get(date);
      return {
        date,
        day,
        weekday: index % 7,
        holidayName: holiday?.name ?? null,
        holidayKind: holiday?.kind ?? null,
      };
    });

    months.push({
      year: y,
      month,
      weeks: Array.from({ length: 6 }, (_, week) => cells.slice(week * 7, week * 7 + 7)),
    });
  }

  return months;
}

/**
 * 指定日時点で内閣府・暦要項による正式発表が済んでいる最終年。
 * 翌年分は毎年2月に掲載されるため、1月中は当年、2月以降は翌年まで。
 */
export function officialHolidayYearLimit(referenceDate = new Date()) {
  let date;
  if (referenceDate instanceof Date) {
    date = new Date(referenceDate.getTime());
  } else if (/^\d{4}-\d{2}-\d{2}$/.test(String(referenceDate))) {
    date = new Date(`${referenceDate}T12:00:00Z`);
  } else {
    return null;
  }
  if (Number.isNaN(date.getTime())) return null;
  return date.getUTCFullYear() + (date.getUTCMonth() >= 1 ? 1 : 0);
}
