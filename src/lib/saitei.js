// 地域別最低賃金の計算ロジック（純関数・DOM非依存）。
// 出典: 厚生労働省「令和7年度 地域別最低賃金 全国一覧」
// https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/koyou_roudou/roudoukijun/minimumichiran/index.html
// 金額の端数は Math.floor で切り捨てる。

export const NATIONAL_WEIGHTED_AVERAGE = 1121;
export const NATIONAL_WAGE_HISTORY = [
  { fiscalYear: 2020, wage: 902 },
  { fiscalYear: 2021, wage: 930 },
  { fiscalYear: 2022, wage: 961 },
  { fiscalYear: 2023, wage: 1004 },
  { fiscalYear: 2024, wage: 1055 },
  { fiscalYear: 2025, wage: 1121 },
];

const MINIMUM_WAGE_PREFECTURES = [
  { prefecture: '北海道', slug: 'hokkaido', wage: 1075, effectiveDate: '2025-10-04', region: '北海道' },
  { prefecture: '青森県', slug: 'aomori', wage: 1029, effectiveDate: '2025-11-21', region: '東北' },
  { prefecture: '岩手県', slug: 'iwate', wage: 1031, effectiveDate: '2025-12-01', region: '東北' },
  { prefecture: '宮城県', slug: 'miyagi', wage: 1038, effectiveDate: '2025-10-04', region: '東北' },
  { prefecture: '秋田県', slug: 'akita', wage: 1031, effectiveDate: '2026-03-31', region: '東北' },
  { prefecture: '山形県', slug: 'yamagata', wage: 1032, effectiveDate: '2025-12-23', region: '東北' },
  { prefecture: '福島県', slug: 'fukushima', wage: 1033, effectiveDate: '2026-01-01', region: '東北' },
  { prefecture: '茨城県', slug: 'ibaraki', wage: 1074, effectiveDate: '2025-10-12', region: '関東', proposedWage: 1136, proposedIncrease: 62, proposedDate: '2026-08-24', proposedSource: 'https://www.47news.jp/14839311.html' },
  { prefecture: '栃木県', slug: 'tochigi', wage: 1068, effectiveDate: '2025-10-01', region: '関東' },
  { prefecture: '群馬県', slug: 'gunma', wage: 1063, effectiveDate: '2026-03-01', region: '関東' },
  { prefecture: '埼玉県', slug: 'saitama', wage: 1141, effectiveDate: '2025-11-01', region: '関東' },
  { prefecture: '千葉県', slug: 'chiba', wage: 1140, effectiveDate: '2025-10-03', region: '関東' },
  { prefecture: '東京都', slug: 'tokyo', wage: 1226, effectiveDate: '2025-10-03', region: '関東' },
  { prefecture: '神奈川県', slug: 'kanagawa', wage: 1225, effectiveDate: '2025-10-04', region: '関東' },
  { prefecture: '新潟県', slug: 'niigata', wage: 1050, effectiveDate: '2025-10-02', region: '中部' },
  { prefecture: '富山県', slug: 'toyama', wage: 1062, effectiveDate: '2025-10-12', region: '中部', proposedWage: 1119, proposedIncrease: 57, proposedDate: '2026-08-05', proposedSource: 'https://jsite.mhlw.go.jp/toyama-roudoukyoku/news_topics/oshirase/_120032/R08saichin_toushin_00007.html' },
  { prefecture: '石川県', slug: 'ishikawa', wage: 1054, effectiveDate: '2025-10-08', region: '中部' },
  { prefecture: '福井県', slug: 'fukui', wage: 1053, effectiveDate: '2025-10-08', region: '中部', proposedWage: 1112, proposedIncrease: 59, proposedDate: '2026-08-10', proposedSource: 'https://jsite.mhlw.go.jp/fukui-roudoukyoku/home/juyou_osirase.html' },
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
  { prefecture: '和歌山県', slug: 'wakayama', wage: 1045, effectiveDate: '2025-11-01', region: '近畿', proposedWage: 1101, proposedIncrease: 56, proposedDate: '2026-08-10', proposedSource: 'https://jsite.mhlw.go.jp/wakayama-roudoukyoku/news_topics/houdou.html' },
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
  { prefecture: '宮崎県', slug: 'miyazaki', wage: 1023, effectiveDate: '2025-11-16', region: '九州・沖縄', proposedWage: 1085, proposedIncrease: 62, proposedDate: '2026-08-25', proposedSource: 'https://www.47news.jp/14844338.html' },
  { prefecture: '鹿児島県', slug: 'kagoshima', wage: 1026, effectiveDate: '2025-11-01', region: '九州・沖縄' },
  { prefecture: '沖縄県', slug: 'okinawa', wage: 1023, effectiveDate: '2025-12-01', region: '九州・沖縄' },
];

// 厚生労働省「地域別最低賃金の全国一覧（過去5年分）」と令和7年度一覧。
// 検索需要と流入が大きい地域から、令和2〜7年度の推移を掲載する。
const MINIMUM_WAGE_HISTORY = {
  hokkaido: [861, 889, 920, 960, 1010, 1075],
  chiba: [925, 953, 984, 1026, 1076, 1140],
  tokyo: [1013, 1041, 1072, 1113, 1163, 1226],
  kanagawa: [1012, 1040, 1071, 1112, 1162, 1225],
  nagano: [849, 877, 908, 948, 998, 1061],
  gifu: [852, 880, 910, 950, 1001, 1065],
  shizuoka: [885, 913, 944, 984, 1034, 1097],
  aichi: [927, 955, 986, 1027, 1077, 1140],
  osaka: [964, 992, 1023, 1064, 1114, 1177],
  hyogo: [900, 928, 960, 1001, 1052, 1116],
  hiroshima: [871, 899, 930, 970, 1020, 1085],
};

// 市区町村ごとに地域別最低賃金が分かれるわけではないことを、主要都市名の検索にも明示する。
const MINIMUM_WAGE_CITIES = {
  hokkaido: ['札幌市', '旭川市', '函館市'],
  chiba: ['千葉市', '船橋市', '柏市'],
  tokyo: ['東京23区', '八王子市', '町田市'],
  kanagawa: ['横浜市', '川崎市', '相模原市'],
  nagano: ['長野市', '松本市', '上田市'],
  gifu: ['岐阜市', '大垣市', '各務原市'],
  shizuoka: ['静岡市', '浜松市', '沼津市'],
  aichi: ['名古屋市', '豊田市', '岡崎市'],
  osaka: ['大阪市', '堺市', '東大阪市'],
  hyogo: ['神戸市', '姫路市', '尼崎市'],
  hiroshima: ['広島市', '福山市', '呉市'],
};

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

export function getMinimumWageHistory(prefectureOrSlug) {
  const info = getMinimumWageInfo(prefectureOrSlug);
  if (!info || !MINIMUM_WAGE_HISTORY[info.slug]) return [];
  return MINIMUM_WAGE_HISTORY[info.slug].map((wage, index) => ({
    fiscalYear: 2020 + index,
    wage,
  }));
}

export function getMinimumWageCities(prefectureOrSlug) {
  const info = getMinimumWageInfo(prefectureOrSlug);
  return info ? [...(MINIMUM_WAGE_CITIES[info.slug] ?? [])] : [];
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
