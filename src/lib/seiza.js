// 誕生日から12星座を判定するロジック（純関数・DOM非依存）。
// 星座の境界日は一般的な西洋占星術の区分を採用（日本の星座占いで最も普及した日付）。

// [開始月, 開始日, 名前, 英名, シンボル]。山羊座は年をまたぐため末尾で特別扱い。
const SIGNS = [
  [3, 21, '牡羊座', 'Aries', '♈'],
  [4, 20, '牡牛座', 'Taurus', '♉'],
  [5, 21, '双子座', 'Gemini', '♊'],
  [6, 22, '蟹座', 'Cancer', '♋'],
  [7, 23, '獅子座', 'Leo', '♌'],
  [8, 23, '乙女座', 'Virgo', '♍'],
  [9, 23, '天秤座', 'Libra', '♎'],
  [10, 24, '蠍座', 'Scorpio', '♏'],
  [11, 23, '射手座', 'Sagittarius', '♐'],
  [12, 22, '山羊座', 'Capricorn', '♑'],
  [1, 20, '水瓶座', 'Aquarius', '♒'],
  [2, 19, '魚座', 'Pisces', '♓'],
];

// 各月の日数（星座判定は年に依存しないため、2月は29日まで許容）。
const DAYS_IN_MONTH = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

// 月・日から星座を返す。返り値 { name, en, symbol }。無効なら null。
export function seiza(month, day) {
  const m = Number(month);
  const d = Number(day);
  if (!Number.isInteger(m) || !Number.isInteger(d)) return null;
  if (m < 1 || m > 12) return null;
  if (d < 1 || d > DAYS_IN_MONTH[m - 1]) return null;

  // 各星座は「開始日」から次の星座の開始日前日まで。
  // その月に開始する星座が2つ関わるので、月内で開始日以上かどうかで前後を判定する。
  for (let i = 0; i < SIGNS.length; i++) {
    const [sm, sd, name, en, symbol] = SIGNS[i];
    if (m === sm && d >= sd) {
      return { name, en, symbol };
    }
    // 前の星座の期間（この月の開始日より前）は「一つ前の星座」に属する。
    if (m === sm && d < sd) {
      const prev = SIGNS[(i + SIGNS.length - 1) % SIGNS.length];
      return { name: prev[2], en: prev[3], symbol: prev[4] };
    }
  }
  return null;
}
