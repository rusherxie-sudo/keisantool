import { describe, it, expect } from 'vitest';
import { salaryDeduction, basicDeduction, spouseDeduction, spouseSpecialDeduction, dependentDeduction, disabilityDeduction, widowDeduction, workingStudentDeduction, residentTax, prefecturalTax, municipalTax, calcJuminzei } from '../src/lib/juminzei.js';

describe('basicDeduction(基礎控除)', () => {
  it('常に43万円', () => {
    expect(basicDeduction()).toBe(430000);
  });
});

describe('spouseDeduction(配偶者控除)', () => {
  it('配偶者収入38万以下 → 38万', () => {
    expect(spouseDeduction(0)).toBe(380000);
    expect(spouseDeduction(380000)).toBe(380000);
  });
  it('配偶者収入38万超〜98万 → 76万-収入', () => {
    expect(spouseDeduction(500000)).toBe(260000);
  });
  it('配偶者収入98万超 → 0', () => {
    expect(spouseDeduction(1000000)).toBe(0);
  });
});

describe('spouseSpecialDeduction(配偶者特別控除)', () => {
  it('配偶者収入15万以下 → 25万', () => {
    expect(spouseSpecialDeduction(0)).toBe(250000);
    expect(spouseSpecialDeduction(150000)).toBe(250000);
  });
  it('配偶者収入15万超〜45万 → 40万-収入', () => {
    expect(spouseSpecialDeduction(200000)).toBe(200000);
  });
  it('配偶者収入45万超 → 0', () => {
    expect(spouseSpecialDeduction(500000)).toBe(0);
  });
});

describe('dependentDeduction(扶養控除)', () => {
  it('70歳以上 → 48万', () => {
    expect(dependentDeduction(0, 70)).toBe(480000);
    expect(dependentDeduction(0, 80)).toBe(480000);
  });
  it('16歳以上69歳以下 → 38万', () => {
    expect(dependentDeduction(0, 16)).toBe(380000);
    expect(dependentDeduction(0, 69)).toBe(380000);
  });
  it('15歳以下 → 33万', () => {
    expect(dependentDeduction(0, 15)).toBe(330000);
    expect(dependentDeduction(0, 10)).toBe(330000);
  });
  it('扶養収入98万超 → 0', () => {
    expect(dependentDeduction(1000000, 30)).toBe(0);
  });
});

describe('disabilityDeduction(障害者控除)', () => {
  it('1級障害 → 27万', () => {
    expect(disabilityDeduction(1)).toBe(270000);
  });
  it('2級障害 → 13万', () => {
    expect(disabilityDeduction(2)).toBe(130000);
  });
  it('該当なし → 0', () => {
    expect(disabilityDeduction(0)).toBe(0);
  });
});

describe('residentTax(住民税)', () => {
  it('課税所得 × 10%', () => {
    expect(residentTax(1000000)).toBe(100000);
    expect(residentTax(3000000)).toBe(300000);
  });
  it('課税所得0 → 0', () => {
    expect(residentTax(0)).toBe(0);
  });
});

describe('prefecturalTax(都道府県民税)', () => {
  it('課税所得 × 6%', () => {
    expect(prefecturalTax(1000000)).toBe(60000);
  });
});

describe('municipalTax(市町村民税)', () => {
  it('課税所得 × 4%', () => {
    expect(municipalTax(1000000)).toBe(40000);
  });
});

describe('calcJuminzei(住民税精算)', () => {
  it('基本ケース: 年収360万、単身', () => {
    const result = calcJuminzei(3600000);
    expect(result.yearlySalary).toBe(3600000);
    expect(result.basicDeduction).toBe(430000);
    expect(result.prefecturalTax + result.municipalTax).toBe(result.residentTax);
    expect(result.monthlyTax).toBe(Math.floor(result.residentTax / 12));
  });
  it('扶養家族あり', () => {
    const result = calcJuminzei(3600000, {
      dependents: [{ income: 0, age: 30 }, { income: 0, age: 10 }],
    });
    expect(result.residentTax).toBeLessThan(calcJuminzei(3600000).residentTax);
  });
  it('配偶者控除適用', () => {
    const result = calcJuminzei(3600000, { spouseIncome: 200000 });
    expect(result.spouseDeduction).toBe(380000);
    expect(result.spouseSpecialDeduction).toBe(200000);
  });
  it('年収0 → 全て0', () => {
    const result = calcJuminzei(0);
    expect(result.yearlySalary).toBe(0);
    expect(result.residentTax).toBe(0);
    expect(result.monthlyTax).toBe(0);
  });
  it('不正な入力 → 全て0', () => {
    const result = calcJuminzei('');
    expect(result.residentTax).toBe(0);
  });
});