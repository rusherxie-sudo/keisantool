import { describe, it, expect } from 'vitest';
import { estimatePremiumBase, dailyAmount, monthlyAmount, calcIkuji } from '../src/lib/ikuji.js';

describe('dailyAmount(育児休業給付金日額)', () => {
  it('生後8週間まで → 67%', () => {
    expect(dailyAmount(300000, 0)).toBe(Math.floor(300000 / 30 * 0.67));
    expect(dailyAmount(300000, 8)).toBe(Math.floor(300000 / 30 * 0.67));
  });
  it('生後8週間超 → 50%', () => {
    expect(dailyAmount(300000, 9)).toBe(Math.floor(300000 / 30 * 0.5));
    expect(dailyAmount(300000, 20)).toBe(Math.floor(300000 / 30 * 0.5));
  });
  it('上限62万', () => {
    expect(dailyAmount(700000, 0)).toBe(Math.floor(620000 / 30 * 0.67));
  });
  it('不正な入力 → 0', () => {
    expect(dailyAmount(0, 0)).toBe(0);
    expect(dailyAmount(-100000, 0)).toBe(0);
    expect(dailyAmount(NaN, 0)).toBe(0);
  });
});

describe('monthlyAmount(育児休業給付金月額)', () => {
  it('生後8週間まで', () => {
    const daily = dailyAmount(300000, 0);
    expect(monthlyAmount(300000, 0)).toBe(daily * 30);
  });
  it('生後8週間超', () => {
    const daily = dailyAmount(300000, 10);
    expect(monthlyAmount(300000, 10)).toBe(daily * 30);
  });
});

describe('calcIkuji(育児休業給付金精算)', () => {
  it('月収30万、生後1週目から1週間', () => {
    const result = calcIkuji(300000, '2025-01-08', '2025-01-14', '2025-01-01');
    expect(result.premiumBase).toBe(300000);
    expect(result.payableDays).toBe(7);
    expect(result.rate).toBe(67);
  });
  it('月収30万、生後10週目から1週間', () => {
    const result = calcIkuji(300000, '2025-03-12', '2025-03-18', '2025-01-01');
    expect(result.rate).toBe(50);
  });
  it('月収0 → 全て0', () => {
    const result = calcIkuji(0, '2025-01-01', '2025-01-10', '2025-01-01');
    expect(result.totalAmount).toBe(0);
    expect(result.payableDays).toBe(0);
  });
  it('不正な入力 → 全て0', () => {
    const result = calcIkuji('', '', '', '');
    expect(result.totalAmount).toBe(0);
  });
});