// 所得税計算ロジック（純関数・DOM非依存）。
// 年度別の控除・税率表は japan-tax-2026.js に集約する。
import {
  incomeTaxBeforeSurtax,
  incomeTaxWithSurtax,
  salaryDeduction,
  taxableIncomeFromSalary,
} from './japan-tax-2026.js';

export { salaryDeduction };

// 互換用: 復興特別所得税を含まない本税額。
export function incomeTax(taxableIncome) {
  return incomeTaxBeforeSurtax(taxableIncome);
}

export function incomeTaxBreakdown(taxableIncome) {
  const amount = Number(taxableIncome);
  if (!Number.isFinite(amount) || amount <= 0) {
    return { bracket1: 0, bracket2: 0, bracket3: 0, bracket4: 0, bracket5: 0, bracket6: 0, bracket7: 0, total: 0 };
  }
  const b1 = Math.min(amount, 1950000);
  const b2 = amount > 1950000 ? Math.min(amount - 1950000, 1350000) : 0;
  const b3 = amount > 3300000 ? Math.min(amount - 3300000, 3650000) : 0;
  const b4 = amount > 6950000 ? Math.min(amount - 6950000, 2050000) : 0;
  const b5 = amount > 9000000 ? Math.min(amount - 9000000, 9000000) : 0;
  const b6 = amount > 18000000 ? Math.min(amount - 18000000, 22000000) : 0;
  const b7 = amount > 40000000 ? amount - 40000000 : 0;
  return {
    bracket1: Math.floor(b1 * 0.05), bracket2: Math.floor(b2 * 0.1),
    bracket3: Math.floor(b3 * 0.2), bracket4: Math.floor(b4 * 0.23),
    bracket5: Math.floor(b5 * 0.33), bracket6: Math.floor(b6 * 0.4),
    bracket7: Math.floor(b7 * 0.45), total: incomeTax(amount),
  };
}

// 年収のみを入力する概算。基礎控除は反映するが、社会保険料・扶養等は別途必要。
export function calcShotokuzei(yearlySalary) {
  const salary = Number(yearlySalary);
  if (!Number.isFinite(salary) || salary <= 0) {
    return { yearlySalary: 0, salaryDeduction: 0, taxableIncome: 0, incomeTax: 0, monthlyTax: 0 };
  }
  const deduction = salaryDeduction(salary);
  const taxableIncome = taxableIncomeFromSalary(salary);
  const baseIncomeTax = incomeTax(taxableIncome);
  const incomeTaxWithReconstruction = incomeTaxWithSurtax(taxableIncome);
  return {
    yearlySalary: Math.floor(salary), salaryDeduction: deduction, taxableIncome,
    incomeTax: incomeTaxWithReconstruction, baseIncomeTax,
    reconstructionSurtax: incomeTaxWithReconstruction - baseIncomeTax,
    monthlyTax: Math.floor(incomeTaxWithReconstruction / 12),
    breakdown: incomeTaxBreakdown(taxableIncome),
  };
}
