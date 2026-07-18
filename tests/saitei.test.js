import { describe, it, expect } from 'vitest';
import { MINIMUM_WAGE_DATA, getMinimumWage, dailyWage, monthlyWage, yearlyWage, calcSaitei, getAllPrefectures, overtimeWage } from '../src/lib/saitei.js';

describe('getMinimumWage(最低賃金取得)', () => {
  it('東京都 → 1251円', () => {
    expect(getMinimumWage('東京都')).toBe(1251);
  });
  it('大阪府 → 1180円', () => {
    expect(getMinimumWage('大阪府')).toBe(1180);
  });
  it('北海道 → 1033円', () => {
    expect(getMinimumWage('北海道')).toBe(1033);
  });
  it('存在しない地域 → デフォルト1011円', () => {
    expect(getMinimumWage('不明')).toBe(1011);
  });
});

describe('dailyWage(日給計算)', () => {
  it('東京都、8時間 → 10008円', () => {
    expect(dailyWage('東京都', 8)).toBe(1251 * 8);
  });
  it('東京都、4時間 → 5004円', () => {
    expect(dailyWage('東京都', 4)).toBe(1251 * 4);
  });
  it('負の時間 → 0', () => {
    expect(dailyWage('東京都', -1)).toBe(0);
  });
});

describe('monthlyWage(月給計算)', () => {
  it('東京都、8時間×22日 → 約220176円', () => {
    const daily = dailyWage('東京都', 8);
    expect(monthlyWage('東京都', 8, 22)).toBe(daily * 22);
  });
  it('負の日数 → 0', () => {
    expect(monthlyWage('東京都', 8, -1)).toBe(0);
  });
});

describe('yearlyWage(年給計算)', () => {
  it('東京都、8時間×22日 → 約2642112円', () => {
    const monthly = monthlyWage('東京都', 8, 22);
    expect(yearlyWage('東京都', 8, 22)).toBe(monthly * 12);
  });
});

describe('calcSaitei(最低賃金精算)', () => {
  it('東京都、8時間×22日', () => {
    const result = calcSaitei('東京都', 8, 22);
    expect(result.prefecture).toBe('東京都');
    expect(result.hourlyWage).toBe(1251);
    expect(result.dailyWage).toBe(1251 * 8);
    expect(result.monthlyWage).toBe(result.dailyWage * 22);
    expect(result.yearlyWage).toBe(result.monthlyWage * 12);
    expect(result.hoursPerDay).toBe(8);
    expect(result.daysPerMonth).toBe(22);
  });
});

describe('getAllPrefectures(全地域取得)', () => {
  it('47都道府県を返す', () => {
    const prefectures = getAllPrefectures();
    expect(prefectures.length).toBe(47);
  });
});

describe('overtimeWage(残業代計算)', () => {
  it('東京都、5時間×1.25割増', () => {
    expect(overtimeWage('東京都', 5, 1.25)).toBe(Math.floor(1251 * 5 * 1.25));
  });
  it('東京都、5時間×1.5割増（深夜）', () => {
    expect(overtimeWage('東京都', 5, 1.5)).toBe(Math.floor(1251 * 5 * 1.5));
  });
  it('負の時間 → 0', () => {
    expect(overtimeWage('東京都', -1, 1.25)).toBe(0);
  });
  it('割増率1未満 → 0', () => {
    expect(overtimeWage('東京都', 5, 0.5)).toBe(0);
  });
});