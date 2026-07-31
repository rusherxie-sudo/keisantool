// 地域別最低賃金の計算ロジック（純関数・DOM非依存）。
// 出典: 厚生労働省「令和7年度 地域別最低賃金 全国一覧」
// https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/koyou_roudou/roudoukijun/minimumichiran/index.html
// 金額の端数は Math.floor で切り捨てる。

export const NATIONAL_WEIGHTED_AVERAGE = 1121;

const MINIMUM_WAGE_PREFECTURES = [
  { prefecture: '北海道', slug: 'hokkaido', wage: 1075, effectiveDate: '2025-10-04', region: '北海道' },
  { prefecture: '青森県', slug: 'aomori', wage: 1029, effectiveDate: '2025-11-21', region: '東北' },
  { prefecture: '岩手県', slug: 'iwate', wage: 1031, effectiveDate: '2025-12-01', region: '東北' },
  { prefecture: '宮城県', slug: 'miyagi', wage: 1038, effectiveDate: '2025-10-04', region: '東北' },
  { prefecture: '秋田県', slug: 'akita', wage: 1031, effectiveDate: '2026-03-31', region: '東北' },
  { prefecture: '山形県', slug: 'yamagata', wage: 1032, effectiveDate: '2025-12-23', region: '東北' },
  { prefecture: '福島県', slug: 'fukushima', wage: 1033, effectiveDate: '2026-01-01', region: '東北' },
  { prefecture: '茨城県', slug: 'ibaraki', wage: 1074, effectiveDate: '2025-10-12', region: '関東' },
  { prefecture: '栃木県', slug: 'tochigi', wage: 1068, effectiveDate: '2025-10-01', region: '関東' },
  { prefecture: '群馬県', slug: 'gunma', wage: 1063, effectiveDate: '2026-03-01', region: '関東' },
  { prefecture: '埼玉県', slug: 'saitama', wage: 1141, effectiveDate: '2025-11-01', region: '関東' },
  { prefecture: '千葉県', slug: 'chiba', wage: 1140, effectiveDate: '2025-10-03', region: '関東' },
  { prefecture: '東京都', slug: 'tokyo', wage: 1226, effectiveDate: '2025-10-03', region: '関東' },
  { prefecture: '神奈川県', slug: 'kanagawa', wage: 1225, effectiveDate: '2025-10-04', region: '関東' },
  { prefecture: '新潟県', slug: 'niigata', wage: 1050, effectiveDate: '2025-10-02', region: '中部' },
  { prefecture: '富山県', slug: 'toyama', wage: 1062, effectiveDate: '2025-10-12', region: '中部' },
  { prefecture: '石川県', slug: 'ishikawa', wage: 1054, effectiveDate: '2025-10-08', region: '中部' },
  { prefecture: '福井県', slug: 'fukui', wage: 1053, effectiveDate: '2025-10-08', region: '中部' },
  { prefecture: '山梨県', slug: 'yamanashi', wage: 1052, effectiveDate: '2025-12-01', region: '中部' },
  { prefecture: '長野県', slug: 'nagano', wage: 1061, effectiveDate: '2025-10-03', region: '中部' },
  { prefecture: '岐阜県', slug: 'gifu', wage: 1065, effectiveDate: '2025-10-18', region: '中部' },
  { prefecture: '静岡県', slug: 'shizuoka', wage: 1097, effectiveDate: '2025-11-01', region: '中部' },
  { prefecture: '愛知県', slug: 'aichi', wage: 1140, effectiveDate: '2025-10-18', region: '中部' },
  { prefecture: '三重県', slug: 'mie', wage: 1087, effectiveDate: '2025-11-21', region: '近畿' },
  { prefecture: '滋賀県', slug: 'shiga', wage: 1080, effectiveDate: '2025-10-05', region: '近畿' },
  { prefecture: '京都府', slug: 'kyoto', wage: 1122, effectiveDate: '2025-11-21', region: '近畿' },
  { prefecture: '大阪府', slug: 'osaka', wage: 1177, effectiveDate: '2025-10-16', region: '近畿' },
  { prefecture: '兵庫県', slug: 'hyogo', wage: 1116, effectiveDate: '2025-10-04', region: '近畿' },
  { prefecture: '奈良県', slug: 'nara', wage: 1051, effectiveDate: '2025-11-16', region: '近畿' },
  { prefecture: '和歌山県', slug: 'wakayama', wage: 1045, effectiveDate: '2025-11-01', region: '近畿' },
  { prefecture: '鳥取県', slug: 'tottori', wage: 1030, effectiveDate: '2025-10-04', region: '中国' },
  { prefecture: '島根県', slug: 'shimane', wage: 1033, effectiveDate: '2025-11-17', region: '中国' },
  { prefecture: '岡山県', slug: 'okayama', wage: 1047, effectiveDate: '2025-12-01', region: '中国' },
  { prefecture: '広島県', slug: 'hiroshima', wage: 1085, effectiveDate: '2025-11-01', region: '中国' },
  { prefecture: '山口県', slug: 'yamaguchi', wage: 1043, effectiveDate: '2025-10-16', region: '中国' },
  { prefecture: '徳島県', slug: 'tokushima', wage: 1046, effectiveDate: '2026-01-01', region: '四国' },
  { prefecture: '香川県', slug: 'kagawa', wage: 1036, effectiveDate: '2025-10-18', region: '四国' },
  { prefecture: '愛媛県', slug: 'ehime', wage: 1033, effectiveDate: '2025-12-01', region: '四国' },
  { prefecture: '高知県', slug: 'kochi', wage: 1023, effectiveDate: '2025-12-01', region: '四国' },
  { prefecture: '福岡県', slug: 'fukuoka', wage: 1057, effectiveDate: '2025-11-16', region: '九州・沖縄' },
  { prefecture: '佐賀県', slug: 'saga', wage: 1030, effectiveDate: '2025-11-21', region: '九州・沖縄' },
  { prefecture: '長崎県', slug: 'nagasaki', wage: 1031, effectiveDate: '2025-12-01', region: '九州・沖縄' },
  { prefecture: '熊本県', slug: 'kumamoto', wage: 1034, effectiveDate: '2026-01-01', region: '九州・沖縄' },
  { prefecture: '大分県', slug: 'oita', wage: 1035, effectiveDate: '2026-01-01', region: '九州・沖縄' },
  { prefecture: '宮崎県', slug: 'miyazaki', wage: 1023, effectiveDate: '2025-11-16', region: '九州・沖縄' },
  { prefecture: '鹿児島県', slug: 'kagoshima', wage: 1026, effectiveDate: '2025-11-01', region: '九州・沖縄' },
  { prefecture: '沖縄県', slug: 'okinawa', wage: 1023, effectiveDate: '2025-12-01', region: '九州・沖縄' },
];

export const MINIMUM_WAGE_DATA = Object.fromEntries(
  MINIMUM_WAGE_PREFECTURES.map(({ prefecture, wage }) => [prefecture, wage]),
);

export function minimumWagePrefectures() {
  return MINIMUM_WAGE_PREFECTURES.map((row) => ({ ...row }));
}

export function getMinimumWageInfo(prefectureOrSlug) {
  const row = MINIMUM_WAGE_PREFECTURES.find(
    (item) => item.prefecture === prefectureOrSlug || item.slug === prefectureOrSlug,
  );
  return row ? { ...row } : null;
}

export function getMinimumWage(prefectureOrSlug) {
  return getMinimumWageInfo(prefectureOrSlug)?.wage ?? null;
}

export function dailyWage(prefectureOrSlug, hours = 8) {
  const wage = getMinimumWage(prefectureOrSlug);
  const h = Number(hours);
  if (wage === null || !Number.isFinite(h) || h <= 0) return 0;
  return Math.floor(wage * h);
}

export function monthlyWage(prefectureOrSlug, dailyHours = 8, workDays = 22) {
  const daily = dailyWage(prefectureOrSlug, dailyHours);
  const days = Number(workDays);
  if (daily === 0 || !Number.isFinite(days) || days <= 0) return 0;
  return Math.floor(daily * days);
}

export function yearlyWage(prefectureOrSlug, dailyHours = 8, workDays = 22) {
  return Math.floor(monthlyWage(prefectureOrSlug, dailyHours, workDays) * 12);
}

export function calcSaitei(prefectureOrSlug, hoursPerDay, daysPerMonth) {
  const info = getMinimumWageInfo(prefectureOrSlug);
  if (!info) return null;
  const daily = dailyWage(info.prefecture, hoursPerDay);
  const monthly = monthlyWage(info.prefecture, hoursPerDay, daysPerMonth);
  return {
    prefecture: info.prefecture,
    hourlyWage: info.wage,
    effectiveDate: info.effectiveDate,
    dailyWage: daily,
    monthlyWage: monthly,
    yearlyWage: Math.floor(monthly * 12),
    hoursPerDay: Number(hoursPerDay),
    daysPerMonth: Number(daysPerMonth),
  };
}

export function getAllPrefectures() {
  return MINIMUM_WAGE_PREFECTURES.map((row) => row.prefecture);
}

// 月給制: 算入対象月給×12÷年間所定労働時間（厚生労働省の換算式）。
export function monthlyHourlyEquivalent(eligibleMonthlyWage, annualWorkDays, dailyHours) {
  const monthly = Number(eligibleMonthlyWage);
  const days = Number(annualWorkDays);
  const hours = Number(dailyHours);
  if (![monthly, days, hours].every(Number.isFinite) || monthly <= 0 || days <= 0 || hours <= 0) {
    return null;
  }
  return (monthly * 12) / (days * hours);
}

export function checkMonthlyWage(prefectureOrSlug, eligibleMonthlyWage, annualWorkDays, dailyHours) {
  const info = getMinimumWageInfo(prefectureOrSlug);
  const hourlyEquivalent = monthlyHourlyEquivalent(eligibleMonthlyWage, annualWorkDays, dailyHours);
  if (!info || hourlyEquivalent === null) return null;
  return {
    prefecture: info.prefecture,
    minimumWage: info.wage,
    effectiveDate: info.effectiveDate,
    hourlyEquivalent,
    difference: hourlyEquivalent - info.wage,
    meetsMinimum: hourlyEquivalent >= info.wage,
  };
}

export function overtimeWage(prefectureOrSlug, overtimeHours, rate = 1.25) {
  const hourly = getMinimumWage(prefectureOrSlug);
  const hours = Number(overtimeHours);
  const multiplier = Number(rate);
  if (hourly === null || !Number.isFinite(hours) || hours <= 0) return 0;
  if (!Number.isFinite(multiplier) || multiplier < 1) return 0;
  return Math.floor(hourly * hours * multiplier);
}
