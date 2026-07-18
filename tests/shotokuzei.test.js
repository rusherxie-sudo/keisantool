import { describe, it, expect } from 'vitest';
import { salaryDeduction, incomeTax, incomeTaxBreakdown, calcShotokuzei } from '../src/lib/shotokuzei.js';

describe('salaryDeduction(給与所得控除)', () => {
  it('162.5万超〜180万は改正後の段階式', () => {
    expect(salaryDeduction(1800000)).toBe(620000);
    expect(salaryDeduction(1900000)).toBe(650000);
  });
  it('年収190万超〜360万 → 控除 = 収入×30%+8万', () => {
    expect(salaryDeduction(2500000)).toBe(Math.floor(2500000 * 0.3 + 80000));
    expect(salaryDeduction(3600000)).toBe(Math.floor(3600000 * 0.3 + 80000));
  });
  it('年収360万超〜660万 → 控除 = 収入×20%+44万', () => {
    expect(salaryDeduction(4500000)).toBe(Math.floor(4500000 * 0.2 + 440000));
    expect(salaryDeduction(6600000)).toBe(Math.floor(6600000 * 0.2 + 440000));
  });
  it('年収660万超〜850万 → 控除 = 収入×10%+110万', () => {
    expect(salaryDeduction(7500000)).toBe(Math.floor(7500000 * 0.1 + 1100000));
    expect(salaryDeduction(8500000)).toBe(Math.floor(8500000 * 0.1 + 1100000));
  });
  it('年収850万超 → 控除上限195万', () => {
    expect(salaryDeduction(9000000)).toBe(1950000);
    expect(salaryDeduction(10000000)).toBe(1950000);
  });
  it('不正な入力 → 0', () => {
    expect(salaryDeduction(0)).toBe(0);
    expect(salaryDeduction(-1000000)).toBe(0);
    expect(salaryDeduction(NaN)).toBe(0);
    expect(salaryDeduction('')).toBe(0);
  });
});

describe('incomeTax(所得税)', () => {
  it('課税所得195万以下 → 5%', () => {
    expect(incomeTax(1000000)).toBe(Math.floor(1000000 * 0.05));
    expect(incomeTax(1950000)).toBe(Math.floor(1950000 * 0.05));
  });
  it('課税所得195万超〜330万 → 10%-97500', () => {
    expect(incomeTax(2500000)).toBe(Math.floor(2500000 * 0.1 - 97500));
  });
  it('課税所得330万超〜695万 → 20%-427500', () => {
    expect(incomeTax(4000000)).toBe(Math.floor(4000000 * 0.2 - 427500));
  });
  it('課税所得695万超〜900万 → 23%-636000', () => {
    expect(incomeTax(8000000)).toBe(Math.floor(8000000 * 0.23 - 636000));
  });
  it('課税所得900万超〜1800万 → 33%-1536000', () => {
    expect(incomeTax(10000000)).toBe(Math.floor(10000000 * 0.33 - 1536000));
  });
  it('課税所得1800万超〜4000万 → 40%-2796000', () => {
    expect(incomeTax(20000000)).toBe(Math.floor(20000000 * 0.40 - 2796000));
  });
  it('課税所得4000万超 → 45%-4796000', () => {
    expect(incomeTax(50000000)).toBe(Math.floor(50000000 * 0.45 - 4796000));
  });
  it('不正な入力 → 0', () => {
    expect(incomeTax(0)).toBe(0);
    expect(incomeTax(-1000000)).toBe(0);
    expect(incomeTax(NaN)).toBe(0);
    expect(incomeTax('')).toBe(0);
  });
});

describe('incomeTaxBreakdown(所得税詳細)', () => {
  it('各段階の税額合計が総額と一致', () => {
    const breakdown = incomeTaxBreakdown(5000000);
    const sum = breakdown.bracket1 + breakdown.bracket2 + breakdown.bracket3 + breakdown.bracket4 + breakdown.bracket5 + breakdown.bracket6 + breakdown.bracket7;
    expect(sum).toBe(breakdown.total);
  });
  it('課税所得0 → 全て0', () => {
    const breakdown = incomeTaxBreakdown(0);
    expect(breakdown.total).toBe(0);
    expect(breakdown.bracket1).toBe(0);
    expect(breakdown.bracket2).toBe(0);
    expect(breakdown.bracket3).toBe(0);
  });
});

describe('calcShotokuzei(所得税精算)', () => {
  it('年収360万 → 基礎控除後の課税所得156万 → 復興特別所得税込み', () => {
    const result = calcShotokuzei(3600000);
    expect(result.yearlySalary).toBe(3600000);
    expect(result.salaryDeduction).toBe(Math.floor(3600000 * 0.3 + 80000));
    expect(result.taxableIncome).toBe(1560000);
    expect(result.baseIncomeTax).toBe(incomeTax(result.taxableIncome));
    expect(result.incomeTax).toBe(79638);
    expect(result.monthlyTax).toBe(Math.floor(result.incomeTax / 12));
  });
  it('年収1000万 → 高額所得の計算', () => {
    const result = calcShotokuzei(10000000);
    expect(result.salaryDeduction).toBe(1950000);
    expect(result.taxableIncome).toBe(7470000);
  });
  it('年収0 → 全て0', () => {
    const result = calcShotokuzei(0);
    expect(result.yearlySalary).toBe(0);
    expect(result.salaryDeduction).toBe(0);
    expect(result.taxableIncome).toBe(0);
    expect(result.incomeTax).toBe(0);
    expect(result.monthlyTax).toBe(0);
  });
  it('不正な入力 → 全て0', () => {
    const result = calcShotokuzei('');
    expect(result.incomeTax).toBe(0);
  });
});
