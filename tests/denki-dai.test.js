import { describe, expect, it } from 'vitest';
import { calculateElectricityCost, wattsFromVoltageCurrent } from '../src/lib/denki-dai.js';

describe('calculateElectricityCost（消費電力から電気代）', () => {
  it('100Wを1日8時間・30日、31円/kWhで使うと744円', () => {
    expect(calculateElectricityCost({ watts: 100, hoursPerDay: 8, days: 30, unitPrice: 31 }))
      .toEqual({ watts: 100, hoursPerDay: 8, days: 30, unitPrice: 31, kwh: 24, cost: 744, dailyCost: 24 });
  });

  it('端数は合計額を最後に1円未満切り捨てする', () => {
    const result = calculateElectricityCost({ watts: 55, hoursPerDay: 2.5, days: 31, unitPrice: 31 });
    expect(result.kwh).toBeCloseTo(4.2625, 12);
    expect(result.cost).toBe(132);
    expect(result.dailyCost).toBe(4);
  });

  it('二進数の浮動小数点誤差で整数円を1円少なくしない', () => {
    expect(calculateElectricityCost({ watts: 600, hoursPerDay: 3, days: 30, unitPrice: 31 }))
      .toMatchObject({ kwh: 54, cost: 1674, dailyCost: 55 });
  });

  it('待機電力0Wは0円として計算できる', () => {
    expect(calculateElectricityCost({ watts: 0, hoursPerDay: 24, days: 30, unitPrice: 31 }))
      .toMatchObject({ kwh: 0, cost: 0, dailyCost: 0 });
  });

  it('小数の使用時間と日数を計算できる', () => {
    const result = calculateElectricityCost({ watts: 600, hoursPerDay: 1.5, days: 28, unitPrice: 27 });
    expect(result.kwh).toBeCloseTo(25.2, 12);
    expect(result.cost).toBe(680);
  });

  it.each([
    { watts: -1, hoursPerDay: 1, days: 30, unitPrice: 31 },
    { watts: 100, hoursPerDay: -1, days: 30, unitPrice: 31 },
    { watts: 100, hoursPerDay: 1, days: 0, unitPrice: 31 },
    { watts: 100, hoursPerDay: 1, days: 30, unitPrice: 0 },
    { watts: Number.NaN, hoursPerDay: 1, days: 30, unitPrice: 31 },
  ])('不正な入力はnull', (input) => {
    expect(calculateElectricityCost(input)).toBeNull();
  });
});

describe('wattsFromVoltageCurrent（電圧・電流から消費電力）', () => {
  it('100V・0.8Aは80W', () => {
    expect(wattsFromVoltageCurrent(100, 0.8)).toBe(80);
  });

  it('100V・15Aは1500W', () => {
    expect(wattsFromVoltageCurrent(100, 15)).toBe(1500);
  });

  it('0または負数・無限大はnull', () => {
    expect(wattsFromVoltageCurrent(0, 1)).toBeNull();
    expect(wattsFromVoltageCurrent(100, 0)).toBeNull();
    expect(wattsFromVoltageCurrent(-100, 1)).toBeNull();
    expect(wattsFromVoltageCurrent(Infinity, 1)).toBeNull();
  });
});
