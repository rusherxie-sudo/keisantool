import { describe, it, expect } from 'vitest';
import { calcGasCost, calcRoundTripCost, calcMonthlyCost, splitPerPerson } from '../src/lib/gasoline.js';

describe('calcGasCost({ distance, fuelEfficiency, gasPrice })', () => {
  it('100km / 燃費15km/L / ガソリン170円 → 1133円（切り捨て）', () => {
    const r = calcGasCost({ distance: 100, fuelEfficiency: 15, gasPrice: 170 });
    expect(r.cost).toBe(1133);
  });
  it('liters は 100/15 ≒ 6.667L', () => {
    const r = calcGasCost({ distance: 100, fuelEfficiency: 15, gasPrice: 170 });
    expect(r.liters).toBeCloseTo(6.667, 2);
  });
  it('50km / 燃費20km/L / ガソリン180円 → 450円', () => {
    const r = calcGasCost({ distance: 50, fuelEfficiency: 20, gasPrice: 180 });
    expect(r.cost).toBe(450);
  });
  it('整数にならない場合は切り捨て: 10km / 燃費3km/L / 100円 → 333円', () => {
    const r = calcGasCost({ distance: 10, fuelEfficiency: 3, gasPrice: 100 });
    expect(r.cost).toBe(333);
  });
  it('distance=0 → null', () => {
    expect(calcGasCost({ distance: 0, fuelEfficiency: 15, gasPrice: 170 })).toBeNull();
  });
  it('fuelEfficiency=0 → null', () => {
    expect(calcGasCost({ distance: 100, fuelEfficiency: 0, gasPrice: 170 })).toBeNull();
  });
  it('負の値 → null', () => {
    expect(calcGasCost({ distance: -100, fuelEfficiency: 15, gasPrice: 170 })).toBeNull();
  });
  it('NaN → null', () => {
    expect(calcGasCost({ distance: NaN, fuelEfficiency: 15, gasPrice: 170 })).toBeNull();
  });
});

// 往復・月額は「未取整の精確な片道金額」を基準に計算し、最後に一度だけ
// Math.floor する。floor 済みの片道を累乗すると截断誤差が放大されるため。
describe('calcRoundTripCost({ distance, fuelEfficiency, gasPrice })', () => {
  it('精確片道 × 2 を floor: 100km/15/170 → floor(6.6667×170×2)=2266円', () => {
    // 精確片道 1133.33…円。floor(2266.67)=2266。
    expect(calcRoundTripCost({ distance: 100, fuelEfficiency: 15, gasPrice: 170 })).toBe(2266);
  });
  it('累積誤差を放大しない: 10km/7/160 → floor(1.42857×160×2)=457円', () => {
    // 精確片道 228.571…円。
    // 旧実装(片道を先に floor=228 → ×2)なら 456 円で 1 円少ない。
    // 正しくは floor(457.14…)=457 円。
    expect(calcRoundTripCost({ distance: 10, fuelEfficiency: 7, gasPrice: 160 })).toBe(457);
  });
  it('distance=0 → null', () => {
    expect(calcRoundTripCost({ distance: 0, fuelEfficiency: 15, gasPrice: 170 })).toBeNull();
  });
  it('NaN → null', () => {
    expect(calcRoundTripCost({ distance: NaN, fuelEfficiency: 15, gasPrice: 170 })).toBeNull();
  });
});

describe('calcMonthlyCost({ distance, fuelEfficiency, gasPrice, workdays })', () => {
  it('精確片道 × 往復 × 日数を floor: 100km/15/170 × 20日 = 45333円', () => {
    // 精確片道 1133.33…円 → 月額 floor(1133.33×2×20)=floor(45333.33)=45333。
    // 旧実装(floor片道1133 → ×2×20)なら 45320 円で 13 円少ない。
    expect(calcMonthlyCost({ distance: 100, fuelEfficiency: 15, gasPrice: 170, workdays: 20 })).toBe(45333);
  });
  it('累積誤差を放大しない: 10km/7/160 × 20日 = 9142円', () => {
    // 精確片道 228.571…円 → 月額 floor(228.571×2×20)=floor(9142.86)=9142。
    // 旧実装(floor片道228 → ×2×20)なら 9120 円で 22 円少ない。
    expect(calcMonthlyCost({ distance: 10, fuelEfficiency: 7, gasPrice: 160, workdays: 20 })).toBe(9142);
  });
  it('端数のない場合: 50km/20/180 × 22日 = 9900円', () => {
    // 精確片道 450 円ちょうど → floor(450×2×... 待: 50/20=2.5L×180=450) 月額 floor(450×2×22)=19800。
    expect(calcMonthlyCost({ distance: 50, fuelEfficiency: 20, gasPrice: 180, workdays: 22 })).toBe(19800);
  });
  it('distance=0 → null', () => {
    expect(calcMonthlyCost({ distance: 0, fuelEfficiency: 15, gasPrice: 170, workdays: 20 })).toBeNull();
  });
  it('workdays=0 → null', () => {
    expect(calcMonthlyCost({ distance: 100, fuelEfficiency: 15, gasPrice: 170, workdays: 0 })).toBeNull();
  });
  it('負の値 → null', () => {
    expect(calcMonthlyCost({ distance: -100, fuelEfficiency: 15, gasPrice: 170, workdays: 20 })).toBeNull();
  });
});

// 割り勘（人数で分ける）。合計額を人数で割り、1人あたりは Math.floor で切り捨て。
describe('splitPerPerson(totalCost, people)', () => {
  it('2266円を3人で割り勘: floor(755.33)=755円', () => {
    expect(splitPerPerson(2266, 3)).toEqual({ perPerson: 755, people: 3 });
  });
  it('割り切れる場合: 2400円を4人 → 600円', () => {
    expect(splitPerPerson(2400, 4)).toEqual({ perPerson: 600, people: 4 });
  });
  it('1人 → 合計そのまま', () => {
    expect(splitPerPerson(2266, 1)).toEqual({ perPerson: 2266, people: 1 });
  });
  it('totalCost=0 は有効（0円）', () => {
    expect(splitPerPerson(0, 3)).toEqual({ perPerson: 0, people: 3 });
  });
  it('people=0 → null', () => {
    expect(splitPerPerson(2266, 0)).toBeNull();
  });
  it('people が 1 未満 → null', () => {
    expect(splitPerPerson(2266, 0.5)).toBeNull();
  });
  it('people が整数でない → null', () => {
    expect(splitPerPerson(2266, 2.5)).toBeNull();
  });
  it('people が負 → null', () => {
    expect(splitPerPerson(2266, -3)).toBeNull();
  });
  it('totalCost が負 → null', () => {
    expect(splitPerPerson(-100, 3)).toBeNull();
  });
  it('totalCost が NaN → null', () => {
    expect(splitPerPerson(NaN, 3)).toBeNull();
  });
});
