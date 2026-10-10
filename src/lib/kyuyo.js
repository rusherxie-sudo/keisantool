// 給与・時給・残業代の計算ロジック（純関数・DOM非依存）。
// 金額の端数は全て「切り捨て」（Math.floor）で整数円に丸める。
import {
  incomeTaxBeforeSurtax,
  incomeTaxWithSurtax,
  salaryDeduction,
  taxableIncomeFromSalary,
} from './japan-tax-2026.js';
import {
  employeeChildcareSupport,
  employeeNursingInsurance,
  employeeEmploymentInsurance,
  employeeHealthInsurance,
  pensionInsurance as employeePensionInsurance,
} from './japan-social-2026.js';

import { calcJuminzei } from './juminzei.js';

export { salaryDeduction };

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

// 年間課税所得に対する所得税本税（毎月の源泉徴収表とは異なる）。
export function incomeTax(yearlyIncome) {
  return incomeTaxBeforeSurtax(yearlyIncome);
}

// 所得割10%のみの補助関数。手取り計算はcalcJuminzeiで控除・均等割等も扱う。
export function residentTax(yearlyIncome) {
  const i = Number(yearlyIncome);
  if (!Number.isFinite(i) || i <= 0) return 0;
  return Math.floor(i * 0.1);
}

// 健康保険料（標準報酬月額 × 4.95%、上限あり）
// 令和8年度 健康保険標準報酬月額上限: 1,390,000円
export function healthInsurance(premiumBase) {
  return employeeHealthInsurance(premiumBase);
}

// 厚生年金保険料（標準報酬月額 × 9.15%、上限あり）
// 令和8年度 厚生年金標準報酬月額上限: 650,000円
export function pensionInsurance(premiumBase) {
  return employeePensionInsurance(premiumBase);
}

// 一般事業の雇用保険本人負担（実際の賃金 × 0.5%）。
export function employmentInsurance(premiumBase) {
  return employeeEmploymentInsurance(premiumBase);
}

// 社会保険料合計
export function socialInsuranceTotal(premiumBase, age = 30, monthlyWage = premiumBase) {
  const h = healthInsurance(premiumBase);
  const p = pensionInsurance(premiumBase);
  const e = employmentInsurance(monthlyWage);
  const childcare = employeeChildcareSupport(premiumBase);
  const nursing = employeeNursingInsurance(premiumBase, age);
  return { health: h, pension: p, employment: e, childcare, nursing, total: h + p + e + childcare + nursing };
}

// 年間税額を12分割する手取り目安。賞与なし・扶養なし、前年も同じ給与・社保を仮定。
// 2026年末精算後の所得税と2026年度住民税を使い、月次源泉徴収は再現しない。
export function takeHomePay(monthlyIncome, { premiumBase, age = 30 } = {}) {
  const m = Number(monthlyIncome);
  if (!Number.isFinite(m) || m <= 0) {
    return { takeHome: 0, socialInsurance: { health: 0, pension: 0, employment: 0, childcare: 0, nursing: 0, total: 0 }, incomeTax: 0, residentTax: 0, deduction: 0 };
  }

  const pb = Number(premiumBase) || m;
  const yearlyIncome = m * 12;
  const deduction = salaryDeduction(yearlyIncome);
  const si = socialInsuranceTotal(pb, age, m);
  const taxableIncome = taxableIncomeFromSalary(yearlyIncome, si.total * 12);
  const monthlySi = si.total;
  const monthlyIncomeTax = Math.floor(incomeTaxWithSurtax(taxableIncome) / 12);
  const monthlyResidentTax = Math.floor(calcJuminzei(yearlyIncome, { socialInsurance: si.total * 12 }).residentTax / 12);

  const totalDeduction = monthlySi + monthlyIncomeTax + monthlyResidentTax;
  const takeHome = Math.max(0, Math.floor(m - totalDeduction));

  return {
    takeHome,
    socialInsurance: si,
    incomeTax: monthlyIncomeTax,
    residentTax: monthlyResidentTax,
    deduction: totalDeduction,
    taxableIncome,
    yearlyIncome,
    salaryDeduction: deduction,
  };
}
