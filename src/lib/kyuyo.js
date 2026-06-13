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
