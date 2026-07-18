import { describe, it, expect } from 'vitest';
import { estimatePremiumBase, dailyAmount, monthlyAmount, payableDays, calcShoubyou } from '../src/lib/shoubyou.js';

describe('dailyAmount(傷病手当金日額)', () => {
  it('標準報酬月額30万 → 約6000円/日', () => {
    expect(dailyAmount(300000)).toBe(Math.floor(300000 / 30 * 0.6));
  });
  it('上限62万 → 約12400円/日', () => {
    expect(dailyAmount(700000)).toBe(Math.floor(620000 / 30 * 0.6));
  });
  it('不正な入力 → 0', () => {
    expect(dailyAmount(0)).toBe(0);
    expect(dailyAmount(-100000)).toBe(0);
    expect(dailyAmount(NaN)).toBe(0);
  });
});

describe('monthlyAmount(傷病手当金月額)', () => {
  it('標準報酬月額30万 → 約18万円/月', () => {
    const daily = dailyAmount(300000);
    expect(monthlyAmount(300000)).toBe(daily * 30);
  });
});

describe('payableDays(給付日数)', () => {
  it('5日間 → 2日（待期3日差し引き）', () => {
    const days = payableDays('2025-01-01', '2025-01-05');
    expect(days).toBe(2);
  });
  it('3日間 → 0日（待期期間内）', () => {
    const days = payableDays('2025-01-01', '2025-01-03');
    expect(days).toBe(0);
  });
  it('10日間 → 7日', () => {
    const days = payableDays('2025-01-01', '2025-01-10');
    expect(days).toBe(7);
  });
  it('終了日が開始日より前 → 0', () => {
    const days = payableDays('2025-01-10', '2025-01-01');
    expect(days).toBe(0);
  });
  it('無効な日付 → 0', () => {
    expect(payableDays('', '')).toBe(0);
    expect(payableDays('invalid', 'invalid')).toBe(0);
  });
});

describe('calcShoubyou(傷病手当金精算)', () => {
  it('月収30万、10日間休業', () => {
    const result = calcShoubyou(300000, '2025-01-01', '2025-01-10');
    expect(result.premiumBase).toBe(300000);
    expect(result.dailyAmount).toBe(dailyAmount(300000));
    expect(result.monthlyAmount).toBe(monthlyAmount(300000));
    expect(result.payableDays).toBe(7);
    expect(result.totalAmount).toBe(result.dailyAmount * result.payableDays);
    expect(result.maxPeriod).toBe(546);
    expect(result.rate).toBe(60);
  });
  it('月収0 → 全て0', () => {
    const result = calcShoubyou(0, '2025-01-01', '2025-01-10');
    expect(result.totalAmount).toBe(0);
    expect(result.payableDays).toBe(0);
  });
  it('不正な入力 → 全て0', () => {
    const result = calcShoubyou('', '', '');
    expect(result.totalAmount).toBe(0);
  });
});