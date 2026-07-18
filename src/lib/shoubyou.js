// 傷病手当金計算ロジック（純関数・DOM非依存）。
// 健康保険の傷病手当金計算：給与の約60%を支給（最長1年6ヶ月）。
// 金額の端数は全て切り捨て（Math.floor）。

// 標準報酬月額の算出（給与から概算）
export function estimatePremiumBase(monthlySalary) {
  const s = Number(monthlySalary);
  if (!Number.isFinite(s) || s <= 0) return 0;
  
  const brackets = [
    106000, 110000, 115000, 120000, 125000, 130000, 135000, 140000, 145000, 150000,
    155000, 160000, 165000, 170000, 175000, 180000, 185000, 190000, 195000, 200000,
    205000, 210000, 215000, 220000, 225000, 230000, 235000, 240000, 245000, 250000,
    255000, 260000, 265000, 270000, 275000, 280000, 285000, 290000, 295000, 300000,
    305000, 310000, 315000, 320000, 325000, 330000, 335000, 340000, 345000, 350000,
    355000, 360000, 365000, 370000, 375000, 380000, 385000, 390000, 395000, 400000,
    405000, 410000, 415000, 420000, 425000, 430000, 435000, 440000, 445000, 450000,
    455000, 460000, 465000, 470000, 475000, 480000, 485000, 490000, 495000, 500000,
    505000, 510000, 515000, 520000, 525000, 530000, 535000, 540000, 545000, 550000,
    555000, 560000, 565000, 570000, 575000, 580000, 585000, 590000, 595000, 600000,
    605000, 610000, 615000, 620000,
  ];
  
  let base = brackets[0];
  for (const bracket of brackets) {
    if (s >= bracket) {
      base = bracket;
    } else {
      break;
    }
  }
  return base;
}

// 傷病手当金の日額計算
// 標準報酬月額 ÷ 30日 × 60%
export function dailyAmount(premiumBase) {
  const base = Math.min(Number(premiumBase) || 0, 620000);
  if (!Number.isFinite(base) || base <= 0) return 0;
  return Math.floor(base / 30 * 0.6);
}

// 傷病手当金の月額計算
export function monthlyAmount(premiumBase) {
  const daily = dailyAmount(premiumBase);
  return daily * 30;
}

// 給付日数の計算（対象期間 - 待期期間3日）
export function payableDays(startDate, endDate) {
  if (!startDate || !endDate) return 0;
  
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  if (isNaN(start.getTime()) || isNaN(end.getTime())) return 0;
  if (end < start) return 0;
  
  const diffTime = Math.abs(end - start);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  
  return Math.max(0, diffDays - 3);
}

// 傷病手当金精算
export function calcShoubyou(monthlySalary, startDate, endDate) {
  const s = Number(monthlySalary);
  if (!Number.isFinite(s) || s <= 0) {
    return { premiumBase: 0, dailyAmount: 0, monthlyAmount: 0, payableDays: 0, totalAmount: 0 };
  }
  
  const premiumBase = estimatePremiumBase(s);
  const daily = dailyAmount(premiumBase);
  const monthly = monthlyAmount(premiumBase);
  const days = payableDays(startDate, endDate);
  const total = daily * days;
  
  return {
    premiumBase: premiumBase,
    dailyAmount: daily,
    monthlyAmount: monthly,
    payableDays: days,
    totalAmount: total,
    maxPeriod: 546,
    rate: 60,
  };
}