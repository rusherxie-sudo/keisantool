import { describe, expect, it } from 'vitest';
import { salaryIncome, salaryDeduction, basicDeduction, taxableIncomeFromSalary, incomeTaxWithSurtax } from '../src/lib/japan-tax-2026.js';

describe('令和8年分年末精算：国税庁 No.1410・1199（2026-10-10照合）', () => {
  it.each([[740999,0],[741000,1000],[1780000,1040000],[2190999,1450999],[2191000,1451000],[2192999,1451000],[2193000,1453000],[2195999,1453000],[2196000,1456000],[2199999,1456000],[2200000,1460000]])('給与収入 %i → 給与所得 %i', (salary,income) => {
    expect(salaryIncome(salary,2026)).toBe(income);
  });
  it.each([[4890000,1040000],[4890001,670000],[6550000,670000],[6550001,620000],[23500000,620000],[23500001,480000],[24000001,320000],[24500001,160000],[25000001,0]])('合計所得 %i → 基礎控除 %i', (income,deduction) => {
    expect(basicDeduction(income,2026)).toBe(deduction);
  });
  it('年収178万円、他の所得なしは年分の所得税が0円', () => {
    expect(taxableIncomeFromSalary(1780000)).toBe(0);
  });
  it('年収360万円、追加控除なし：244万円−104万円、税額71,470円', () => {
    expect(taxableIncomeFromSalary(3600000)).toBe(1400000);
    expect(incomeTaxWithSurtax(taxableIncomeFromSalary(3600000))).toBe(71470);
  });
  it('2025年所得を使う2026年度住民税用の給与計算を保持', () => {
    expect(salaryIncome(1780000,2025)).toBe(1130000);
    expect(salaryDeduction(1780000,2025)).toBe(650000);
    expect(basicDeduction(2440000,2025)).toBe(880000);
  });
});
