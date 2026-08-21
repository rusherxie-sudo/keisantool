import { describe, expect, it } from 'vitest';
import { calculateShitsugyouTeate, prescribedBenefitDays } from '../src/lib/shitsugyou-teate.js';

describe('失業手当の基本手当日額（令和8年8月1日以降）', () => {
  it('30歳未満の逓減区間を1円未満切り捨てで計算する', () => {
    expect(calculateShitsugyouTeate({
      age: 29,
      wages6Months: 1_800_000,
      insuredYears: 6,
      reason: 'ordinary',
    })).toEqual({
      wageDaily: 10_000,
      benefitDaily: 6_307,
      benefit28Days: 176_596,
      prescribedDays: 90,
      totalBenefit: 567_630,
    });
  });

  it('30〜44歳は年齢別上限を適用する', () => {
    const result = calculateShitsugyouTeate({
      age: 40,
      wages6Months: 3_600_000,
      insuredYears: 12,
      reason: 'company',
    });
    expect(result.wageDaily).toBe(16_540);
    expect(result.benefitDaily).toBe(8_270);
    expect(result.prescribedDays).toBe(240);
    expect(result.totalBenefit).toBe(1_984_800);
  });

  it('60〜64歳の逓減区間は2式の低い方を使う', () => {
    const result = calculateShitsugyouTeate({
      age: 61,
      wages6Months: 1_800_000,
      insuredYears: 3,
      reason: 'company',
    });
    expect(result.wageDaily).toBe(10_000);
    expect(result.benefitDaily).toBe(5_348);
    expect(result.prescribedDays).toBe(150);
  });

  it('全年齢共通の下限額を適用する', () => {
    const result = calculateShitsugyouTeate({
      age: 50,
      wages6Months: 300_000,
      insuredYears: 2,
      reason: 'ordinary',
    });
    expect(result.wageDaily).toBe(3_203);
    expect(result.benefitDaily).toBe(2_562);
  });

  it('不正な入力はゼロ結果を返す', () => {
    expect(calculateShitsugyouTeate({ age: 65, wages6Months: 1_800_000, insuredYears: 5, reason: 'ordinary' }))
      .toEqual({ wageDaily: 0, benefitDaily: 0, benefit28Days: 0, prescribedDays: 0, totalBenefit: 0 });
  });
});

describe('所定給付日数', () => {
  it.each([
    [0.5, 0],
    [1, 90],
    [10, 120],
    [20, 150],
  ])('一般離職・加入%f年は%d日', (years, days) => {
    expect(prescribedBenefitDays(40, years, 'ordinary')).toBe(days);
  });

  it.each([
    [29, 6, 120],
    [32, 22, 240],
    [40, 3, 150],
    [50, 22, 330],
    [62, 12, 210],
  ])('会社都合等・%d歳・加入%d年は%d日', (age, years, days) => {
    expect(prescribedBenefitDays(age, years, 'company')).toBe(days);
  });
});
