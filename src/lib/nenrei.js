// 年齢計算（満年齢・数え年・学年・干支）の計算ロジック（純関数・DOM非依存）。
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

// 満年齢を求める。生年月日(birth) を基準日(ref) 時点での満年齢で返す。
// 誕生日を迎えていれば +1。2/29 生まれは非閏年では 3/1 到来で加齢とみなす
// （年・月・日の数値比較なので、3/1 >= 2/29 が偽になり 2/28 では未到来、
//  3/1 では月日比較で到来扱いになる）。
// birth/ref は ISO文字列 または Date。基準日が生年月日より前なら null。
export function mannenrei(birth, ref) {
  const b = toDate(birth);
  const r = toDate(ref);
  if (!b || !r) return null;
  if (r.getTime() < b.getTime()) return null;

  let age = r.getUTCFullYear() - b.getUTCFullYear();
  // 基準年の誕生日を「月日」で比較。まだ誕生日が来ていなければ -1。
  const rm = r.getUTCMonth();
  const rd = r.getUTCDate();
  const bm = b.getUTCMonth();
  const bd = b.getUTCDate();
  if (rm < bm || (rm === bm && rd < bd)) {
    age -= 1;
  }
  return age;
}

// 数え年 = 当年 − 生年 + 1。生年・基準年が不正なら null。
export function kazoedoshi(birthYear, currentYear) {
  if (birthYear == null || birthYear === '' || currentYear == null || currentYear === '') return null;
  const b = Number(birthYear);
  const c = Number(currentYear);
  if (!Number.isFinite(b) || !Number.isFinite(c)) return null;
  return c - b + 1;
}

const GRADE_LABELS = {
  1: '小学1年生',
  2: '小学2年生',
  3: '小学3年生',
  4: '小学4年生',
  5: '小学5年生',
  6: '小学6年生',
  7: '中学1年生',
  8: '中学2年生',
  9: '中学3年生',
  10: '高校1年生',
  11: '高校2年生',
  12: '高校3年生',
};

// 日本の学年（4月始まり、早生まれ考慮）。
// 学年の起点は「4/2〜翌4/1」生まれが同学年。
// 学年度の始まりは 4/1（基準日が 4/1 以降ならその年が当年度、3月以前なら前年が当年度）。
// 入学年度 = 生まれた「学年年度」+ 7（4/2〜翌4/1生まれは満6歳になった年度の4月に小1入学）。
// 返り値: { grade, label }
//   grade: 1〜12 が小1〜高3、0 以下は未就学、13 以上は高校卒業後（label でも表現）。
export function schoolGrade(birth, ref) {
  const b = toDate(birth);
  const r = toDate(ref);
  if (!b || !r) return null;

  // 生まれた「学年年度」：4/2〜翌4/1 が同じ年度。
  const birthSchoolYear = schoolYearOf(b);
  // 基準日の「年度」：進級は 4/2 を境に切り替わる（4/1 は前年度、4/2 から新年度）。
  const refSchoolYear = schoolYearOf(r);

  // 当年度に小1になるのは birthSchoolYear + 7 年度。
  // grade = 現年度 − 入学年度 + 1
  const grade = refSchoolYear - (birthSchoolYear + 7) + 1;

  let label;
  if (grade < 1) label = '未就学';
  else if (grade > 12) label = '高校卒業後';
  else label = GRADE_LABELS[grade];

  return { grade, label };
}

// 学年年度を求める。4/2〜翌4/1 を同じ年度とする。
// 月日が 4/2 以降ならその年、4/1 以前（含む）なら前年。
function schoolYearOf(d) {
  const y = d.getUTCFullYear();
  const m = d.getUTCMonth() + 1; // 1-12
  const day = d.getUTCDate();
  if (m > 4 || (m === 4 && day >= 2)) return y;
  return y - 1;
}

const ETO = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

// 干支（十二支）。2020年=子を起点に12年周期。不正な入力は null。
export function eto(year) {
  if (year == null || year === '') return null;
  const y = Number(year);
  if (!Number.isFinite(y)) return null;
  // 2020 % 12 = 4 が子。((y - 2020) を 12 で正に正規化)
  const idx = (((y - 2020) % 12) + 12) % 12;
  return ETO[idx];
}
