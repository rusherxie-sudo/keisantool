import { describe, expect, it } from 'vitest';
import {
  basicDeduction,
  incomeTaxWithSurtax,
  salaryDeduction,
  taxableIncomeFromSalary,
} from '../src/lib/japan-tax-2026.js';

describe('令和7年度税制改正後の給与所得控除', () => {
  it('162.5万円以下は最低保障65万円', () => {
    expect(salaryDeduction(1625000)).toBe(650000);
  });

  it('162.5万円超〜180万円は収入×40%−10万円', () => {
    expect(salaryDeduction(1700000)).toBe(580000);
    expect(salaryDeduction(1800000)).toBe(620000);
  });

  it('180万円超〜190万円は収入×30%+8万円', () => {
    expect(salaryDeduction(1900000)).toBe(650000);
  });
});

describe('令和7・8年分の所得税基礎控除', () => {
  it('給与所得132万円以下は95万円', () => {
    expect(basicDeduction(1320000)).toBe(950000);
  });

  it('給与所得220万円は88万円', () => {
    expect(basicDeduction(2200000)).toBe(880000);
  });
});

describe('給与収入からの所得税概算', () => {
  it('年収360万円・追加控除なしは課税所得156万円、復興特別所得税込み79,638円', () => {
    expect(taxableIncomeFromSalary(3600000)).toBe(1560000);
    expect(incomeTaxWithSurtax(1560000)).toBe(79638);
  });

  it('課税所得は1,000円未満を切り捨てる', () => {
    expect(taxableIncomeFromSalary(3600123)).toBe(1560000);
  });
});
