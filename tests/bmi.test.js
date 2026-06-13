import { describe, it, expect } from 'vitest';
import { calcBmi, bmiCategory, standardWeight, bodyFatPercent } from '../src/lib/bmi.js';

describe('calcBmi(BMI計算)', () => {
  it('身長170cm・体重65kg → BMI22.5', () => {
    expect(calcBmi(170, 65)).toBe(22.5);
  });

  it('身長160cm・体重50kg → BMI19.5', () => {
    expect(calcBmi(160, 50)).toBe(19.5);
  });

  it('1位小数で四捨五入: 身長170cm・体重64kg → 22.1', () => {
    expect(calcBmi(170, 64)).toBe(22.1);
  });

  it('身長0 → null', () => {
    expect(calcBmi(0, 65)).toBeNull();
  });

  it('体重0 → null', () => {
    expect(calcBmi(170, 0)).toBeNull();
  });

  it('空文字 → null', () => {
    expect(calcBmi('', '')).toBeNull();
  });

  it('NaN → null', () => {
    expect(calcBmi(NaN, 65)).toBeNull();
  });

  it('負数 → null', () => {
    expect(calcBmi(-170, 65)).toBeNull();
    expect(calcBmi(170, -65)).toBeNull();
  });
});

describe('bmiCategory(肥満度判定・日本肥満学会基準)', () => {
  it('18.4 → 低体重', () => {
    expect(bmiCategory(18.4)).toBe('低体重');
  });
  it('18.5 → 普通体重', () => {
    expect(bmiCategory(18.5)).toBe('普通体重');
  });
  it('22 → 普通体重', () => {
    expect(bmiCategory(22)).toBe('普通体重');
  });
  it('24.9 → 普通体重', () => {
    expect(bmiCategory(24.9)).toBe('普通体重');
  });
  it('25 → 肥満（1度）', () => {
    expect(bmiCategory(25)).toBe('肥満（1度）');
  });
  it('30 → 肥満（2度）', () => {
    expect(bmiCategory(30)).toBe('肥満（2度）');
  });
  it('35 → 肥満（3度）', () => {
    expect(bmiCategory(35)).toBe('肥満（3度）');
  });
  it('40 → 肥満（4度）', () => {
    expect(bmiCategory(40)).toBe('肥満（4度）');
  });
  it('null入力 → null', () => {
    expect(bmiCategory(null)).toBeNull();
    expect(bmiCategory(NaN)).toBeNull();
  });
});

describe('standardWeight(標準体重・BMI22)', () => {
  it('身長170cm → 63.6kg', () => {
    expect(standardWeight(170)).toBe(63.6);
  });

  it('身長160cm → 56.3kg', () => {
    expect(standardWeight(160)).toBe(56.3);
  });

  it('身長0 → null', () => {
    expect(standardWeight(0)).toBeNull();
  });

  it('NaN → null', () => {
    expect(standardWeight(NaN)).toBeNull();
  });

  it('負数 → null', () => {
    expect(standardWeight(-170)).toBeNull();
  });
});

describe('bodyFatPercent(体脂肪率・BMI推定法)', () => {
  // 1.2×BMI + 0.23×年齢 − 5.4 − 10.8×性別
  it('男性 BMI22・30歳 → 1.2*22+0.23*30-5.4-10.8 = 17.1', () => {
    // 26.4 + 6.9 - 5.4 - 10.8 = 17.1
    expect(bodyFatPercent(22, 30, 'male')).toBe(17.1);
  });

  it('女性 BMI22・30歳 → 1.2*22+0.23*30-5.4 = 27.9', () => {
    // 26.4 + 6.9 - 5.4 = 27.9
    expect(bodyFatPercent(22, 30, 'female')).toBe(27.9);
  });

  it('1位小数で四捨五入: 男性 BMI20.5・25歳 → 14.1', () => {
    // 1.2*20.5+0.23*25-5.4-10.8 = 24.6+5.75-5.4-10.8 = 14.15 → 14.1
    expect(bodyFatPercent(20.5, 25, 'male')).toBe(14.1);
  });

  it('BMIがnull → null', () => {
    expect(bodyFatPercent(null, 30, 'male')).toBeNull();
  });

  it('年齢0/空/NaN → null', () => {
    expect(bodyFatPercent(22, 0, 'male')).toBeNull();
    expect(bodyFatPercent(22, '', 'male')).toBeNull();
    expect(bodyFatPercent(22, NaN, 'male')).toBeNull();
  });

  it('年齢が負数 → null', () => {
    expect(bodyFatPercent(22, -5, 'male')).toBeNull();
  });
});
