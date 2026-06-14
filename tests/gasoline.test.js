import { describe, it, expect } from 'vitest';
import { calcGasCost, calcMonthlyCost } from '../src/lib/gasoline.js';

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

describe('calcMonthlyCost({ oneWayCost, workdays })', () => {
  it('片道1133円 × 往復 × 20日 = 45320円', () => {
    expect(calcMonthlyCost({ oneWayCost: 1133, workdays: 20 })).toBe(45320);
  });
  it('片道450円 × 往復 × 22日 = 19800円', () => {
    expect(calcMonthlyCost({ oneWayCost: 450, workdays: 22 })).toBe(19800);
  });
  it('端数は切り捨て: 片道333円 × 往復 × 21日 = 13986円', () => {
    expect(calcMonthlyCost({ oneWayCost: 333, workdays: 21 })).toBe(13986);
  });
  it('oneWayCost=0 → null', () => {
    expect(calcMonthlyCost({ oneWayCost: 0, workdays: 20 })).toBeNull();
  });
  it('workdays=0 → null', () => {
    expect(calcMonthlyCost({ oneWayCost: 1000, workdays: 0 })).toBeNull();
  });
  it('負の値 → null', () => {
    expect(calcMonthlyCost({ oneWayCost: -100, workdays: 20 })).toBeNull();
  });
});
