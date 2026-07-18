// 給与・時給・残業代の計算ロジック（純関数・DOM非依存）。
// 金額の端数は全て「切り捨て」（Math.floor）で整数円に丸める。
import {
  incomeTaxBeforeSurtax,
  salaryDeduction,
  taxableIncomeFromSalary,
} from './japan-tax-2026.js';
import {
  employeeChildcareSupport,
  employeeEmploymentInsurance,
  employeeHealthInsurance,
  pensionInsurance as employeePensionInsurance,
} from './japan-social-2026.js';

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

// 所得税計算（給与所得に対する源泉所得税、令和8年度）
// 税率: 5%/10%/20%/23%/33%/40%/45%
// 速算控除: 0/9750/33750/63600/153600/279600/479600
export function incomeTax(yearlyIncome) {
  return incomeTaxBeforeSurtax(yearlyIncome);
}

// 住民税計算（給与所得に対する都道府県税6% + 市町村税4% = 10%）
export function residentTax(yearlyIncome) {
  const i = Number(yearlyIncome);
  if (!Number.isFinite(i) || i <= 0) return 0;
  return Math.floor(i * 0.1);
}

// 健康保険料（標準報酬月額 × 4.95%、上限あり）
// 令和8年度 標準報酬月額上限: 620,000円
export function healthInsurance(premiumBase) {
  return employeeHealthInsurance(premiumBase);
}

// 厚生年金保険料（標準報酬月額 × 9.15%、上限あり）
// 令和8年度 標準報酬月額上限: 620,000円
export function pensionInsurance(premiumBase) {
  return employeePensionInsurance(premiumBase);
}

// 雇用保険料（標準報酬月額 × 0.3%、上限あり）
// 令和8年度 標準報酬月額上限: 479,000円
export function employmentInsurance(premiumBase) {
  return employeeEmploymentInsurance(premiumBase);
}

// 社会保険料合計
export function socialInsuranceTotal(premiumBase) {
  const h = healthInsurance(premiumBase);
  const p = pensionInsurance(premiumBase);
  const e = employmentInsurance(premiumBase);
  const childcare = employeeChildcareSupport(premiumBase);
  return { health: h, pension: p, employment: e, childcare, total: h + p + e + childcare };
}

// 手取り精算: 月収から社会保険料+所得税+住民税を差し引いた手取り額を計算
// 引数: { monthlyIncome(月収), premiumBase(標準報酬月額, 省略時は月収と同じ), dependents(扶養人数) }
export function takeHomePay(monthlyIncome, { premiumBase, dependents = 0 } = {}) {
  const m = Number(monthlyIncome);
  if (!Number.isFinite(m) || m <= 0) {
    return { takeHome: 0, socialInsurance: { health: 0, pension: 0, employment: 0, childcare: 0, total: 0 }, incomeTax: 0, residentTax: 0, deduction: 0 };
  }

  const pb = Number(premiumBase) || m;
  const yearlyIncome = m * 12;
  const deduction = salaryDeduction(yearlyIncome);
  const taxableIncome = taxableIncomeFromSalary(yearlyIncome);

  const si = socialInsuranceTotal(pb);
  const monthlySi = si.total;
  const monthlyIncomeTax = Math.floor(incomeTax(taxableIncome) / 12);
  const monthlyResidentTax = Math.floor(residentTax(taxableIncome) / 12);

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
