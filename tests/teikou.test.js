import { describe, expect, it } from 'vitest';
import {
  convertResistance,
  parseResistanceValues,
  solveOhmsLaw,
  equivalentResistance,
  calculateLedResistor,
} from '../src/lib/teikou.js';

describe('抵抗値の入力と単位換算', () => {
  it('kΩ・MΩをΩへ換算する', () => {
    expect(convertResistance(2.2, 'kΩ')).toBe(2200);
    expect(convertResistance(1, 'MΩ')).toBe(1_000_000);
  });

  it('カンマ・空白・改行区切りの抵抗値を解析する', () => {
    expect(parseResistanceValues('100, 220\n330', 'Ω')).toEqual([100, 220, 330]);
    expect(parseResistanceValues('1、2，3', 'kΩ')).toEqual([1000, 2000, 3000]);
  });

  it('0・負数・空欄・未知単位を拒否する', () => {
    expect(convertResistance(0, 'Ω')).toBeNull();
    expect(convertResistance(1, 'mΩ')).toBeNull();
    expect(parseResistanceValues('', 'Ω')).toBeNull();
    expect(parseResistanceValues('100 -20', 'Ω')).toBeNull();
  });
});

describe('オームの法則', () => {
  it('電圧12V・抵抗220Ωから電流と電力を求める', () => {
    const result = solveOhmsLaw({ voltage: 12, resistance: 220 });
    expect(result.voltage).toBe(12);
    expect(result.resistance).toBe(220);
    expect(result.current).toBeCloseTo(12 / 220, 12);
    expect(result.power).toBeCloseTo((12 * 12) / 220, 12);
  });

  it('電圧5V・電流20mAから抵抗250Ωを求める', () => {
    expect(solveOhmsLaw({ voltage: 5, current: 0.02 })).toEqual({
      voltage: 5,
      current: 0.02,
      resistance: 250,
      power: 0.1,
    });
  });

  it('電流0.5A・抵抗100Ωから電圧50Vと電力25Wを求める', () => {
    expect(solveOhmsLaw({ current: 0.5, resistance: 100 })).toEqual({
      voltage: 50,
      current: 0.5,
      resistance: 100,
      power: 25,
    });
  });

  it('値が2つでない場合と0・非有限値を拒否する', () => {
    expect(solveOhmsLaw({ voltage: 12 })).toBeNull();
    expect(solveOhmsLaw({ voltage: 12, current: 1, resistance: 12 })).toBeNull();
    expect(solveOhmsLaw({ voltage: 0, resistance: 100 })).toBeNull();
    expect(solveOhmsLaw({ voltage: Infinity, resistance: 100 })).toBeNull();
  });
});

describe('直列・並列の合成抵抗', () => {
  it('100Ω・220Ω・330Ωの直列は650Ω', () => {
    expect(equivalentResistance([100, 220, 330], 'series')).toEqual({
      type: 'series',
      count: 3,
      resistance: 650,
    });
  });

  it('100Ωを2本並列にすると50Ω', () => {
    expect(equivalentResistance([100, 100], 'parallel')?.resistance).toBe(50);
  });

  it('100Ω・200Ω・300Ωの並列値を求める', () => {
    expect(equivalentResistance([100, 200, 300], 'parallel')?.resistance)
      .toBeCloseTo(54.5454545455, 10);
  });

  it('1本未満・0・負数・未知接続を拒否する', () => {
    expect(equivalentResistance([], 'series')).toBeNull();
    expect(equivalentResistance([100, 0], 'parallel')).toBeNull();
    expect(equivalentResistance([100, -20], 'series')).toBeNull();
    expect(equivalentResistance([100, 200], 'mixed')).toBeNull();
  });
});

describe('LED電流制限抵抗', () => {
  it('5V・順方向2V・20mAなら150Ω・0.06W・推奨0.125W', () => {
    expect(calculateLedResistor(5, 2, 20, 1)).toEqual({
      supplyVoltage: 5,
      totalForwardVoltage: 2,
      currentAmps: 0.02,
      resistance: 150,
      resistorPower: 0.06,
      minimumRatedPower: 0.12,
      recommendedRatedPower: 0.125,
      ledCount: 1,
    });
  });

  it('12Vに順方向2VのLEDを3個・20mAなら300Ω・推奨0.25W', () => {
    const result = calculateLedResistor(12, 2, 20, 3);
    expect(result.resistance).toBe(300);
    expect(result.resistorPower).toBeCloseTo(0.12, 12);
    expect(result.recommendedRatedPower).toBe(0.25);
  });

  it('電源電圧以下の余裕がない場合や非法入力を拒否する', () => {
    expect(calculateLedResistor(5, 2.5, 20, 2)).toBeNull();
    expect(calculateLedResistor(5, 2, 0, 1)).toBeNull();
    expect(calculateLedResistor(5, 2, 20, 1.5)).toBeNull();
    expect(calculateLedResistor('abc', 2, 20, 1)).toBeNull();
  });
});
