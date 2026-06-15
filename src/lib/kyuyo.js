// 給与・時給・残業代の計算ロジック（純関数・DOM非依存）。
// 金額の端数は全て「切り捨て」（Math.floor）で整数円に丸める。

// 時給計算: 時給 × 労働時間 = 給与
export function hourlyWage(wage, hours) {
  const w = Number(wage);
  const h = Number(hours);
  if (!Number.isFinite(w) || w < 0 || !Number.isFinite(h) || h < 0) {
    return { pay: 0 };
  }
  return { pay: Math.floor(w * h) };
}

// 残業代計算: 時給 × 残業時間 × 割増率（通常1.25 / 深夜1.5 / 休日1.35）
export function overtimePay(wage, hours, rate) {
  const w = Number(wage);
  const h = Number(hours);
  const r = Number(rate);
  // 割増率は1以上が妥当（残業は通常賃金より高い）
  if (
    !Number.isFinite(w) || w < 0 ||
    !Number.isFinite(h) || h < 0 ||
    !Number.isFinite(r) || r < 1
  ) {
    return { pay: 0 };
  }
  return { pay: Math.floor(w * h * r) };
}

// 時給の自動計算: 基本給（月額）÷ 月平均所定労働時間 = 1時間あたりの時給。
// 端数は切り捨て（Math.floor）で整数円に丸める。
// 不正・0除算は null を返す（ページ側で非表示にする）。
export function hourlyFromMonthly(basicMonthly, monthlyScheduledHours) {
  const m = Number(basicMonthly);
  const h = Number(monthlyScheduledHours);
  if (
    !Number.isFinite(m) || m < 0 ||
    !Number.isFinite(h) || h <= 0
  ) {
    return null;
  }
  return Math.floor(m / h);
}

// 分類別の残業代を一括計算。
// 普通残業1.25 / 深夜1.5 / 休日1.35 / 月60時間超1.5 の割増率で
// 各区分の時数からそれぞれの残業代（各 floor）と合計を返す。
// 時数の指定がない区分は0として扱う（負数も0扱い）。
export function overtimeBreakdown(hourlyWageValue, hours = {}) {
  const w = Number(hourlyWageValue);
  if (!Number.isFinite(w) || w < 0) {
    return { normal: 0, night: 0, holiday: 0, over60: 0, total: 0 };
  }
  const calc = (h, rate) => {
    const n = Number(h);
    if (!Number.isFinite(n) || n <= 0) return 0;
    return Math.floor(w * n * rate);
  };
  const normal = calc(hours.normal, 1.25);
  const night = calc(hours.night, 1.5);
  const holiday = calc(hours.holiday, 1.35);
  const over60 = calc(hours.over60, 1.5);
  return { normal, night, holiday, over60, total: normal + night + holiday + over60 };
}

// 手取り概算: 月収 → 手取り。
// 社会保険料（健康保険・厚生年金・雇用保険）約15% + 所得税・住民税の概算を合わせ、
// 控除合計を月収の約22%（概算）とみなし、手取り = floor(月収 × 0.78) とする。
// ※ あくまで粗い概算（扶養・年齢・自治体などで実額は変動する）。
export function takeHomePay(income) {
  const m = Number(income);
  if (!Number.isFinite(m) || m < 0) {
    return { takeHome: 0, deduction: 0 };
  }
  const takeHome = Math.floor(m * 0.78);
  return { takeHome, deduction: m - takeHome };
}
