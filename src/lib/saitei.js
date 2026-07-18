// 最低賃金計算ロジック（純関数・DOM非依存）。
// 日本の最低賃金を地域ごとに計算。
// 金額の端数は全て切り捨て（Math.floor）。

// 2025年度最低賃金（時給）
// 地域ごとの最低賃金データ
export const MINIMUM_WAGE_DATA = {
  '東京都': 1251,
  '大阪府': 1180,
  '神奈川県': 1180,
  '京都府': 1113,
  '愛知県': 1113,
  '福岡県': 1073,
  '埼玉県': 1073,
  '千葉県': 1073,
  '兵庫県': 1062,
  '北海道': 1033,
  '茨城県': 1011,
  '栃木県': 1011,
  '群馬県': 1011,
  '静岡県': 1062,
  '三重県': 1011,
  '奈良県': 1011,
  '和歌山県': 1011,
  '鳥取県': 946,
  '島根県': 946,
  '岡山県': 1011,
  '広島県': 1062,
  '山口県': 1011,
  '徳島県': 989,
  '香川県': 989,
  '愛媛県': 989,
  '高知県': 946,
  '福島県': 989,
  '山形県': 946,
  '宮城県': 1011,
  '秋田県': 946,
  '岩手県': 946,
  '青森県': 946,
  '長野県': 1011,
  '山梨県': 989,
  '富山県': 1011,
  '石川県': 1011,
  '福井県': 989,
  '佐賀県': 989,
  '長崎県': 989,
  '熊本県': 989,
  '大分県': 989,
  '宮崎県': 989,
  '鹿児島県': 989,
  '沖縄県': 958,
  '新潟県': 1011,
  '岐阜県': 1011,
  '滋賀県': 1011,
};

// 指定地域の最低賃金を取得
export function getMinimumWage(prefecture) {
  return MINIMUM_WAGE_DATA[prefecture] || 1011;
}

// 指定地域の最低賃金時給での日給計算
export function dailyWage(prefecture, hours = 8) {
  const wage = getMinimumWage(prefecture);
  const h = Number(hours);
  if (!Number.isFinite(h) || h <= 0) return 0;
  return Math.floor(wage * h);
}

// 指定地域の最低賃金時給での月給計算（月所定労働日数を指定）
export function monthlyWage(prefecture, dailyHours = 8, workDays = 22) {
  const daily = dailyWage(prefecture, dailyHours);
  const days = Number(workDays);
  if (!Number.isFinite(days) || days <= 0) return 0;
  return daily * days;
}

// 指定地域の最低賃金時給での年給計算
export function yearlyWage(prefecture, dailyHours = 8, workDays = 22) {
  const monthly = monthlyWage(prefecture, dailyHours, workDays);
  return monthly * 12;
}

// 最低賃金精算
export function calcSaitei(prefecture, hoursPerDay, daysPerMonth) {
  const hourly = getMinimumWage(prefecture);
  const daily = dailyWage(prefecture, hoursPerDay);
  const monthly = monthlyWage(prefecture, hoursPerDay, daysPerMonth);
  const yearly = yearlyWage(prefecture, hoursPerDay, daysPerMonth);
  
  return {
    prefecture: prefecture,
    hourlyWage: hourly,
    dailyWage: daily,
    monthlyWage: monthly,
    yearlyWage: yearly,
    hoursPerDay: hoursPerDay,
    daysPerMonth: daysPerMonth,
  };
}

// 全地域の最低賃金リストを取得
export function getAllPrefectures() {
  return Object.keys(MINIMUM_WAGE_DATA);
}

// 最低賃金での残業代計算
export function overtimeWage(prefecture, overtimeHours, rate = 1.25) {
  const hourly = getMinimumWage(prefecture);
  const hours = Number(overtimeHours);
  const r = Number(rate);
  
  if (!Number.isFinite(hours) || hours <= 0) return 0;
  if (!Number.isFinite(r) || r < 1) return 0;
  
  return Math.floor(hourly * hours * r);
}