import { describe, it, expect } from 'vitest';
import { salaryDeduction, incomeTax, socialInsuranceDeduction, lifeInsuranceDeduction, earthquakeInsuranceDeduction, medicalExpenseDeduction, smallBusinessDeduction, calcNematsu } from '../src/lib/nematsu.js';

describe('salaryDeduction(給与所得控除)', () => {
  it('年収360万 → 控除116万', () => {
    expect(salaryDeduction(3600000)).toBe(Math.floor(3600000 * 0.3 + 80000));
  });
  it('年収1000万 → 控除上限195万', () => {
    expect(salaryDeduction(10000000)).toBe(1950000);
  });
});

describe('socialInsuranceDeduction(社会保険料控除)', () => {
  it('月額4万 → 年額48万', () => {
    expect(socialInsuranceDeduction(40000)).toBe(480000);
  });
  it('月額0 → 0', () => {
    expect(socialInsuranceDeduction(0)).toBe(0);
  });
});

describe('lifeInsuranceDeduction(生命保険料控除)', () => {
  it('新契約の保険料10万 → 上限4万控除', () => {
    expect(lifeInsuranceDeduction(100000)).toBe(40000);
  });
  it('新契約の保険料15万 → 上限4万控除', () => {
    expect(lifeInsuranceDeduction(150000)).toBe(40000);
  });
  it('保険料0 → 0', () => {
    expect(lifeInsuranceDeduction(0)).toBe(0);
  });
});

describe('earthquakeInsuranceDeduction(地震保険料控除)', () => {
  it('保険料3万 → 3万控除', () => {
    expect(earthquakeInsuranceDeduction(30000)).toBe(30000);
  });
  it('保険料6万 → 上限5万', () => {
    expect(earthquakeInsuranceDeduction(60000)).toBe(50000);
  });
});

describe('medicalExpenseDeduction(医療費控除)', () => {
  it('医療費10万 → 確定申告用の控除額を返す', () => {
    expect(medicalExpenseDeduction(100000)).toBe(Math.floor(100000 * 0.95));
  });
  it('医療費0 → 0', () => {
    expect(medicalExpenseDeduction(0)).toBe(0);
  });
});

describe('smallBusinessDeduction(小規模企業共済控除)', () => {
  it('掛金5万 → 5万控除', () => {
    expect(smallBusinessDeduction(50000)).toBe(50000);
  });
});

describe('calcNematsu(年末調整精算)', () => {
  it('基本ケース: 年収360万、源泉徴収14万、各種控除あり', () => {
    const result = calcNematsu(3600000, 140000, {
      socialInsurance: 40000,
      lifeInsurance: 60000,
      earthquakeInsurance: 10000,
    });
    expect(result.yearlySalary).toBe(3600000);
    expect(result.salaryDeduction).toBeGreaterThan(0);
    expect(result.taxableIncome).toBe(1035000);
    expect(result.baseIncomeTax).toBe(incomeTax(result.taxableIncome));
    expect(result.refund + result.additional).toBe(Math.abs(result.withheldTax - result.actualTax));
  });
  it('源泉徴収過多 → 還付', () => {
    const result = calcNematsu(3600000, 200000, {});
    expect(result.refund).toBeGreaterThan(0);
    expect(result.additional).toBe(0);
  });
  it('源泉徴収不足 → 追徴', () => {
    const result = calcNematsu(3600000, 50000, {});
    expect(result.additional).toBeGreaterThan(0);
    expect(result.refund).toBe(0);
  });
  it('年収0 → 全て0', () => {
    const result = calcNematsu(0, 100000, {});
    expect(result.yearlySalary).toBe(0);
    expect(result.actualTax).toBe(0);
    expect(result.refund).toBe(0);
    expect(result.additional).toBe(0);
  });
  it('不正な入力 → 全て0', () => {
    const result = calcNematsu('', '', {});
    expect(result.yearlySalary).toBe(0);
    expect(result.actualTax).toBe(0);
  });
});
