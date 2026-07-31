// 六曜（先勝・友引・先負・仏滅・大安・赤口）判定ロジック（純関数・DOM非依存）。
//
// 旧暦（月・日）への変換は lunar-javascript（6tail、寿星天文暦ベースの朔・節気算出）を利用する。
// 六曜 = (旧暦月の絶対値 + 旧暦日) を 6 で割った余りで判定（閏月も月番号をそのまま使う。
// 特別扱いしないことは実測データで確認済み）。
//
// ⚠️ 中国の農暦（一般に UTC+8 基準）と日本の旧暦（UTC+9 基準）は、朔（新月）が日付境界を
// またぐごく稀なケースで1日ずれることが知られている（例：2013年旧暦5/1は中国6/8・日本6/9）。
// 本実装は Solar.fromYmd(y,m,d) にカレンダー日をそのまま渡す方式を採用し、日本の旧暦カレンダー
// （benri.jp / arachne.jp の公開データ、日本語版ウィキペディア）の複数年・閏月年を含む実測値との
// 突き合わせで一致することを確認済み（tests/rokuyo.test.js のアンカーケース）。
// 六曜は歴史的にも文献間で解釈の細部が異なる暦注であり、本ツールの判定は参考値。
import { Solar } from 'lunar-javascript';

const ROKUYO = ['大安', '赤口', '先勝', '友引', '先負', '仏滅'];

const ROKUYO_DESC = {
  大安: '万事に良いとされる日。結婚式など祝い事の日取りに好まれます。',
  赤口: '正午前後を除いて凶とされる日。火や刃物の扱いに注意ともいわれます。',
  先勝: '午前中が吉、午後が凶とされる日。急ぎごとに向くとされます。',
  友引: '慶事は良いが、葬儀は避けられることが多い日。',
  先負: '午前中が凶、午後が吉とされる日。静かに過ごすのが良いとされます。',
  仏滅: '万事に凶とされる日。婚礼など祝い事は避けられる傾向があります。',
};

function toInt(v) {
  if (v === null || v === undefined || v === '') return NaN;
  const n = Number(v);
  return Number.isInteger(n) ? n : NaN;
}

// 実在する公暦日付かどうかを判定する。
function validDate(y, m, d) {
  if (![y, m, d].every(Number.isInteger)) return false;
  if (m < 1 || m > 12 || d < 1 || d > 31) return false;
  const dt = new Date(Date.UTC(y, m - 1, d));
  return dt.getUTCFullYear() === y && dt.getUTCMonth() === m - 1 && dt.getUTCDate() === d;
}

/**
 * 公暦日付から旧暦を求める。閏月は isLeap:true、month は絶対値（1〜12）。
 * 不正な日付は null。
 */
export function toKyureki(year, month, day) {
  const y = toInt(year);
  const m = toInt(month);
  const d = toInt(day);
  if (!validDate(y, m, d)) return null;
  const lunar = Solar.fromYmd(y, m, d).getLunar();
  const rawMonth = lunar.getMonth();
  return { month: Math.abs(rawMonth), day: lunar.getDay(), isLeap: rawMonth < 0 };
}

/**
 * 公暦日付から六曜を判定する。不正な日付は null。
 */
export function rokuyo(year, month, day) {
  const k = toKyureki(year, month, day);
  if (!k) return null;
  return ROKUYO[(k.month + k.day) % 6];
}

// 六曜の一言解説（文化的慣習の参考情報）。不明な値は null。
export function rokuyoDesc(name) {
  return ROKUYO_DESC[name] ?? null;
}

/**
 * 指定した年月の六曜カレンダー（1日〜末日、昇順）。
 *   [{ day, rokuyo }]
 */
export function rokuyoMonthTable(year, month) {
  const y = toInt(year);
  const m = toInt(month);
  if (!Number.isInteger(y) || !Number.isInteger(m) || m < 1 || m > 12) return [];
  const lastDay = new Date(Date.UTC(y, m, 0)).getUTCDate();
  const rows = [];
  for (let d = 1; d <= lastDay; d++) {
    rows.push({ day: d, rokuyo: rokuyo(y, m, d) });
  }
  return rows;
}
