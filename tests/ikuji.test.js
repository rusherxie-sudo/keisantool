import { describe, it, expect } from 'vitest';
import { calcIkuji } from '../src/lib/ikuji.js';

// 厚労省 Q&A Q12 の月給30万円例と、令和8年8月版パンフレットp16。
describe('育児休業給付・30日分の比較（2026-08-01基準）', () => {
  it('休業前6か月180万円、無給 → 67% 201000円 / 50% 150000円', () => {
    expect(calcIkuji({ sixMonthWages: 1800000 })).toMatchObject({ dailyWage: 10000, amount67: 201000, amount50: 150000 });
  });
  it('公表されている30日上限額に一致', () => {
    expect(calcIkuji({ sixMonthWages: 6000000 })).toMatchObject({ dailyWage: 16540, amount67: 332454, amount50: 248100 });
  });
  it('賃金日額の下限3061円を適用', () => {
    expect(calcIkuji({ sixMonthWages: 180000 })).toMatchObject({ dailyWage: 3061, amount67: 61526, amount50: 45915 });
  });
  it('休業対象賃金6万円なら67%は18万円、50%は15万円', () => {
    expect(calcIkuji({ sixMonthWages: 1800000, leaveWages: 60000 })).toMatchObject({ amount67: 180000, amount50: 150000 });
  });
  it('13%・30%の賃金境界と80%不支給', () => {
    expect(calcIkuji({ sixMonthWages: 1800000, leaveWages: 39000 }).amount67).toBe(201000);
    expect(calcIkuji({ sixMonthWages: 1800000, leaveWages: 90000 }).amount50).toBe(150000);
    for (const leaveWages of [240000, 300000]) {
      expect(calcIkuji({ sixMonthWages: 1800000, leaveWages })).toMatchObject({ amount67: 0, amount50: 0 });
    }
  });
  it('空欄・非有限・負数は結果を出さない', () => {
    for (const sixMonthWages of ['', null, -1, 0, Infinity, NaN]) expect(calcIkuji({ sixMonthWages })).toBeNull();
    for (const leaveWages of [-1, Infinity, NaN]) expect(calcIkuji({ sixMonthWages: 1800000, leaveWages })).toBeNull();
  });
});
