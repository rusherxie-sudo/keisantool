// 育児休業給付金計算ロジック（純関数・DOM非依存）。
// 雇用保険の育児休業給付金計算：給与の約67%（子供が生まれてから8週間）または50%を支給。
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

// 育児休業給付金の日額計算（標準報酬月額 ÷ 30日 × 率）
// 生後8週間まで：67%
// それ以降：50%
export function dailyAmount(premiumBase, weeksAfterBirth) {
  const base = Math.min(Number(premiumBase) || 0, 620000);
  const weeks = Number(weeksAfterBirth) || 0;
  
  if (!Number.isFinite(base) || base <= 0) return 0;
  
  const rate = weeks <= 8 ? 0.67 : 0.5;
  return Math.floor(base / 30 * rate);
}

// 育児休業給付金の月額計算
export function monthlyAmount(premiumBase, weeksAfterBirth) {
  const daily = dailyAmount(premiumBase, weeksAfterBirth);
  return daily * 30;
}

// 育児休業給付金精算
// monthlySalary: 月収
// startDate: 育休開始日
// endDate: 育休終了日
// childBirthDate: 子供の誕生日
export function calcIkuji(monthlySalary, startDate, endDate, childBirthDate) {
  const s = Number(monthlySalary);
  if (!Number.isFinite(s) || s <= 0) {
    return { premiumBase: 0, dailyAmount: 0, monthlyAmount: 0, payableDays: 0, totalAmount: 0, rate: 0 };
  }
  
  const premiumBase = estimatePremiumBase(s);
  
  let totalDays = 0;
  let totalAmount = 0;
  let currentRate = 0;
  
  if (startDate && endDate && childBirthDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const birth = new Date(childBirthDate);
    
    if (!isNaN(start.getTime()) && !isNaN(end.getTime()) && !isNaN(birth.getTime()) && end >= start) {
      const oneDay = 24 * 60 * 60 * 1000;
      const current = new Date(start);
      
      while (current <= end) {
        const diffTime = current - birth;
        const diffDays = Math.floor(diffTime / oneDay);
        const weeks = Math.floor(diffDays / 7);
        
        const daily = dailyAmount(premiumBase, weeks);
        totalAmount += daily;
        totalDays++;
        
        currentRate = weeks <= 8 ? 67 : 50;
        
        current.setDate(current.getDate() + 1);
      }
    }
  }
  
  const avgDaily = totalDays > 0 ? Math.floor(totalAmount / totalDays) : 0;
  
  return {
    premiumBase: premiumBase,
    dailyAmount: avgDaily,
    monthlyAmount: avgDaily * 30,
    payableDays: totalDays,
    totalAmount: totalAmount,
    rate: currentRate,
    maxPeriod: 546,
  };
}