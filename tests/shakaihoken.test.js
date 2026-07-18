import { describe, it, expect } from 'vitest';
import { healthInsurance, pensionInsurance, employmentInsurance, nursingInsurance, estimatePremiumBase, calcShakaihoken } from '../src/lib/shakaihoken.js';

describe('healthInsurance(健康保険料)', () => {
  it('標準報酬月額30万 → 約14850円', () => {
    expect(healthInsurance(300000)).toBe(Math.floor(300000 * 0.0495));
  });
  it('上限65万 → 約32175円', () => {
    expect(healthInsurance(700000)).toBe(Math.floor(650000 * 0.0495));
  });
  it('不正な入力 → 0', () => {
    expect(healthInsurance(0)).toBe(0);
    expect(healthInsurance(-100000)).toBe(0);
    expect(healthInsurance(NaN)).toBe(0);
  });
});

describe('pensionInsurance(厚生年金保険料)', () => {
  it('標準報酬月額30万 → 約27450円', () => {
    expect(pensionInsurance(300000)).toBe(Math.floor(300000 * 0.0915));
  });
  it('上限65万 → 約59475円', () => {
    expect(pensionInsurance(700000)).toBe(Math.floor(650000 * 0.0915));
  });
});

describe('employmentInsurance(雇用保険料)', () => {
  it('一般事業の賃金総額30万 → 1500円', () => {
    expect(employmentInsurance(300000)).toBe(Math.floor(300000 * 0.005));
  });
  it('雇用保険には標準報酬月額の上限を使わない', () => {
    expect(employmentInsurance(500000)).toBe(Math.floor(500000 * 0.005));
  });
});

describe('nursingInsurance(介護保険料)', () => {
  it('40〜64歳、標準報酬月額30万 → 労働者負担0.81%', () => {
    expect(nursingInsurance(300000, 40)).toBe(Math.floor(300000 * 0.0081));
  });
  it('39歳以下 → 0', () => {
    expect(nursingInsurance(300000, 39)).toBe(0);
    expect(nursingInsurance(300000, 25)).toBe(0);
  });
});

describe('estimatePremiumBase(標準報酬月額推定)', () => {
  it('月収30万 → 30万', () => {
    expect(estimatePremiumBase(300000)).toBe(300000);
  });
  it('月収302000 → 30万（次の段階未満）', () => {
    expect(estimatePremiumBase(302000)).toBe(300000);
  });
  it('月収305000 → 30万（公式等級の範囲内）', () => {
    expect(estimatePremiumBase(305000)).toBe(300000);
  });
  it('月収70万 → 上限65万', () => {
    expect(estimatePremiumBase(700000)).toBe(650000);
  });
  it('月収0 → 0', () => {
    expect(estimatePremiumBase(0)).toBe(0);
  });
});

describe('calcShakaihoken(社会保険料合計)', () => {
  it('月収30万、30歳 → 健康+年金+雇用', () => {
    const result = calcShakaihoken(300000, 30);
    expect(result.premiumBase).toBe(300000);
    expect(result.health).toBe(healthInsurance(300000));
    expect(result.pension).toBe(pensionInsurance(300000));
    expect(result.employment).toBe(employmentInsurance(300000));
    expect(result.nursing).toBe(0);
    expect(result.total).toBe(result.health + result.pension + result.employment + result.childcare);
    expect(result.yearlyTotal).toBe(result.total * 12);
  });
  it('月収30万、45歳 → 介護保険追加', () => {
    const result = calcShakaihoken(300000, 45);
    expect(result.nursing).toBeGreaterThan(0);
    expect(result.total).toBe(result.health + result.pension + result.employment + result.childcare + result.nursing);
  });
  it('月収0 → 全て0', () => {
    const result = calcShakaihoken(0, 30);
    expect(result.total).toBe(0);
    expect(result.yearlyTotal).toBe(0);
  });
  it('不正な入力 → 全て0', () => {
    const result = calcShakaihoken('', 30);
    expect(result.total).toBe(0);
  });
});
