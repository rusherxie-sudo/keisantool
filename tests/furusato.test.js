import { describe, expect, it } from 'vitest';
import { calcFurusato, incomeTaxRateForTaxableIncome } from '../src/lib/furusato.js';

describe('incomeTaxRateForTaxableIncome（復興特別所得税込み）', () => {
  it('課税所得に応じた所得税率に2.1%を加算する', () => {
    expect(incomeTaxRateForTaxableIncome(0).effective).toBe(0);
    expect(incomeTaxRateForTaxableIncome(1950000).effective).toBeCloseTo(0, 8);
    expect(incomeTaxRateForTaxableIncome(1950001).effective).toBeCloseTo(0.05 * 1.021, 8);
    expect(incomeTaxRateForTaxableIncome(3300001).effective).toBeCloseTo(0.10 * 1.021, 8);
    expect(incomeTaxRateForTaxableIncome(6950001).effective).toBeCloseTo(0.20 * 1.021, 8);
  });
});

describe('calcFurusato（2026年分・ふるさと納税上限額）', () => {
  it('年収500万円・単身・社会保険料15%の上限はおおむね5〜7万円', () => {
    const r = calcFurusato({ yearlySalary: 5000000 });
    expect(r.status).toBe('ok');
    expect(r.limits.max).toBeGreaterThan(50000);
    expect(r.limits.max).toBeLessThan(70000);
    // 一般的に所得割20%の特例分が効く。
    expect(r.limits.binding).toBe('special20');
  });

  it('上限額では自己負担が2,000円になる', () => {
    const r = calcFurusato({ yearlySalary: 5000000 });
    expect(r.atLimit.selfCost).toBeCloseTo(2000, 5);
    expect(r.atLimit.totalDeduction).toBeCloseTo(r.limits.max - 2000, 5);
  });

  it('所得が低く住民税所得割が0なら控除余地はほぼない', () => {
    const r = calcFurusato({ yearlySalary: 1000000 });
    expect(r.status).toBe('ok');
    expect(r.residentIncomeLevy).toBe(0);
    expect(r.limits.max).toBe(2000);
    expect(r.atLimit.totalDeduction).toBe(0);
  });

  it('高所得ほど上限額が大きくなる（同じ単身条件）', () => {
    const low = calcFurusato({ yearlySalary: 4000000 }).limits.max;
    const high = calcFurusato({ yearlySalary: 10000000 }).limits.max;
    expect(high).toBeGreaterThan(low);
  });

  it('扶養親族が増えると住民税所得割と所得税率が下がる', () => {
    const single = calcFurusato({ yearlySalary: 6000000 });
    const family = calcFurusato({ yearlySalary: 6000000, generalDependents: 2 });
    expect(family.residentIncomeLevy).toBeLessThan(single.residentIncomeLevy);
    expect(family.incomeTaxRate).toBeLessThan(single.incomeTaxRate);
    // 税率0%では所得税からの控除がなく、特例分の分母も変わるため上限は単純増加しない。
    expect(family.limits.binding).toBe('special20');
  });

  it('指定寄附額での控除内訳の合計が各部分の和と一致する', () => {
    const r = calcFurusato({ yearlySalary: 6000000, donation: 30000 });
    expect(r.atDonation.totalDeduction).toBeCloseTo(
      r.atDonation.incomeTaxDeduction + r.atDonation.residentBasic + r.atDonation.residentSpecial, 5);
    expect(r.atDonation.selfCost).toBeCloseTo(30000 - r.atDonation.totalDeduction, 5);
  });

  it('不正な入力はinvalidを返す', () => {
    expect(calcFurusato({ yearlySalary: 0 }).status).toBe('invalid');
    expect(calcFurusato({ yearlySalary: -1 }).status).toBe('invalid');
    expect(calcFurusato({ yearlySalary: 5000000, socialInsurance: -1 }).status).toBe('invalid');
    expect(calcFurusato({ yearlySalary: 5000000, generalDependents: -1 }).status).toBe('invalid');
  });
});
