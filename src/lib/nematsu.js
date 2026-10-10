// 年末調整の概算ロジック（純関数・DOM非依存）。
// 医療費控除は年末調整の対象外のため、確定申告へ案内する。
import {
  incomeTaxBeforeSurtax,
  salaryIncome,
  basicDeduction,
  incomeTaxWithSurtax,
  salaryDeduction,
  taxableIncomeFromSalary,
} from './japan-tax-2026.js';

export { salaryDeduction };
export const incomeTax = incomeTaxBeforeSurtax;

export function socialInsuranceDeduction(monthlyPremium) {
  const amount = Number(monthlyPremium);
  return Number.isFinite(amount) && amount > 0 ? Math.floor(amount * 12) : 0;
}

// 新契約の一般生命保険料控除。介護医療・個人年金・旧契約は別計算になるため含めない。
export function lifeInsuranceDeduction(premium) {
  const amount = Number(premium);
  if (!Number.isFinite(amount) || amount <= 0) return 0;
  if (amount <= 20000) return Math.floor(amount);
  if (amount <= 40000) return Math.floor(amount / 2 + 10000);
  if (amount <= 80000) return Math.floor(amount / 4 + 20000);
  return 40000;
}

export function earthquakeInsuranceDeduction(premium) {
  const amount = Number(premium);
  return Number.isFinite(amount) && amount > 0 ? Math.min(Math.floor(amount), 50000) : 0;
}

// 互換用に残すが、calcNematsu では使用しない（確定申告の対象）。
export function medicalExpenseDeduction(totalExpense, totalIncome = 2000000, compensation = 0) {
  const safe = (v) => Number.isFinite(Number(v)) ? Math.max(0, Number(v)) : 0;
  // 補填額は、その補填対象の医療費を超えない額を入力する。
  const threshold = Math.min(100000, safe(totalIncome) * 0.05);
  return Math.min(2000000, Math.max(0, Math.floor(safe(totalExpense) - safe(compensation) - threshold)));
}

export function smallBusinessDeduction(premium) {
  const amount = Number(premium);
  return Number.isFinite(amount) && amount > 0 ? Math.floor(amount) : 0;
}

export function calcNematsu(yearlySalary, withheldTax, deductions = {}) {
  const salary = Number(yearlySalary);
  const withheld = Number(withheldTax);
  if (!Number.isFinite(salary) || salary <= 0) {
    return { yearlySalary: 0, taxableIncome: 0, actualTax: 0, withheldTax: 0, refund: 0, additional: 0 };
  }
  const salaryDeductionAmount = salaryDeduction(salary);
  const breakdown = {
    socialInsurance: deductions.annualSocialInsurance == null
      ? socialInsuranceDeduction(deductions.socialInsurance)
      : smallBusinessDeduction(deductions.annualSocialInsurance),
    lifeInsurance: deductions.lifeDeduction == null
      ? lifeInsuranceDeduction(deductions.lifeInsurance)
      : Math.min(120000, smallBusinessDeduction(deductions.lifeDeduction)),
    earthquakeInsurance: earthquakeInsuranceDeduction(deductions.earthquakeInsurance),
    medicalExpense: 0,
    smallBusiness: smallBusinessDeduction(deductions.smallBusiness),
  };
  const additionalDeductions = Object.values(breakdown).reduce((sum, value) => sum + value, 0);
  const taxableIncome = taxableIncomeFromSalary(salary, additionalDeductions);
  const baseIncomeTax = incomeTaxBeforeSurtax(taxableIncome);
  const actualTax = Math.floor(incomeTaxWithSurtax(taxableIncome) / 100) * 100;
  const normalizedWithheld = Number.isFinite(withheld) && withheld > 0 ? Math.floor(withheld) : 0;
  return {
    yearlySalary: Math.floor(salary), salaryDeduction: salaryDeductionAmount,
    // 基礎控除を含む控除総額を表示用に返す。
    totalDeductions: basicDeduction(salaryIncome(salary)) + additionalDeductions,
    taxableIncome, actualTax, baseIncomeTax,
    reconstructionSurtax: incomeTaxWithSurtax(taxableIncome) - baseIncomeTax,
    withheldTax: normalizedWithheld,
    refund: Math.max(0, normalizedWithheld - actualTax),
    additional: Math.max(0, actualTax - normalizedWithheld),
    requiresTaxReturnForMedicalExpense: Number(deductions.medicalExpense) > 0,
    breakdown,
  };
}
