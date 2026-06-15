import { describe, it, expect } from 'vitest';
import { calcBmi, bmiCategory, standardWeight, bodyFatPercent, targetWeight, targetWeights, weightDiff } from '../src/lib/bmi.js';

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

describe('targetWeight(指定BMIの目標体重)', () => {
  it('身長170cm・BMI22 → 63.58kg（≈63.6）', () => {
    // 22 × 1.7^2 = 22 × 2.89 = 63.58
    expect(targetWeight(170, 22)).toBeCloseTo(63.6, 1);
  });

  it('身長160cm・BMI19 → 48.64kg（≈48.6）', () => {
    // 19 × 1.6^2 = 19 × 2.56 = 48.64
    expect(targetWeight(160, 19)).toBeCloseTo(48.6, 1);
  });

  it('身長170cm・BMI25 → 72.25kg（≈72.3）', () => {
    // 25 × 2.89 = 72.25
    expect(targetWeight(170, 25)).toBeCloseTo(72.3, 1);
  });

  it('身長0 → null', () => {
    expect(targetWeight(0, 22)).toBeNull();
  });

  it('BMIが0/NaN → null', () => {
    expect(targetWeight(170, 0)).toBeNull();
    expect(targetWeight(170, NaN)).toBeNull();
  });

  it('負数 → null', () => {
    expect(targetWeight(-170, 22)).toBeNull();
  });
});

describe('targetWeights(多段の目標体重)', () => {
  it('身長170cm → beauty/standard/healthyMin/healthyMax', () => {
    const r = targetWeights(170);
    // 1.7^2 = 2.89
    expect(r.beauty).toBeCloseTo(54.9, 1);      // 19   × 2.89 = 54.91
    expect(r.standard).toBeCloseTo(63.6, 1);    // 22   × 2.89 = 63.58
    expect(r.healthyMin).toBeCloseTo(53.5, 1);  // 18.5 × 2.89 = 53.465 → 53.5
    expect(r.healthyMax).toBeCloseTo(72.3, 1);  // 25   × 2.89 = 72.25 → 72.3
  });

  it('身長160cm', () => {
    const r = targetWeights(160);
    // 1.6^2 = 2.56
    expect(r.beauty).toBeCloseTo(48.6, 1);      // 19   × 2.56 = 48.64
    expect(r.standard).toBeCloseTo(56.3, 1);    // 22   × 2.56 = 56.32
    expect(r.healthyMin).toBeCloseTo(47.4, 1);  // 18.5 × 2.56 = 47.36
    expect(r.healthyMax).toBeCloseTo(64.0, 1);  // 25   × 2.56 = 64.0
  });

  it('身長0 → null', () => {
    expect(targetWeights(0)).toBeNull();
  });

  it('NaN → null', () => {
    expect(targetWeights(NaN)).toBeNull();
  });
});

describe('weightDiff(現体重と目標の差)', () => {
  it('現70kg・目標63.6kg → +6.4（減量が必要）', () => {
    expect(weightDiff(70, 63.6)).toBeCloseTo(6.4, 1);
  });

  it('現50kg・目標56.3kg → -6.3（増量が必要）', () => {
    expect(weightDiff(50, 56.3)).toBeCloseTo(-6.3, 1);
  });

  it('現63.6kg・目標63.6kg → 0', () => {
    expect(weightDiff(63.6, 63.6)).toBe(0);
  });

  it('現体重0/空 → null', () => {
    expect(weightDiff(0, 63.6)).toBeNull();
    expect(weightDiff('', 63.6)).toBeNull();
  });

  it('目標がnull/NaN → null', () => {
    expect(weightDiff(70, null)).toBeNull();
    expect(weightDiff(70, NaN)).toBeNull();
  });
});
