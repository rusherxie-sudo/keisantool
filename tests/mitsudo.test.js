import { describe, expect, it } from 'vitest';
import {
  calculateAirDensity,
  calculateDensity,
  calculateMass,
  calculateVolume,
  convertDensity,
  convertMass,
  convertVolume,
} from '../src/lib/mitsudo.js';

describe('乾燥空気の密度計算', () => {
  it('15℃・1013.25hPaの標準的な条件から空気密度を求める', () => {
    const result = calculateAirDensity(15, 1013.25);
    expect(result.kgPerM3).toBeCloseTo(101325 / (287 * 288.15), 12);
    expect(result.gPerCm3).toBeCloseTo(result.kgPerM3 / 1000, 12);
  });

  it('温度が上がると同じ気圧で密度が下がる', () => {
    expect(calculateAirDensity(30, 1013.25).kgPerM3).toBeLessThan(
      calculateAirDensity(0, 1013.25).kgPerM3,
    );
  });

  it('絶対零度以下・0以下の気圧・空欄・非数値は無効', () => {
    expect(calculateAirDensity(-273.15, 1013.25)).toBeNull();
    expect(calculateAirDensity(-274, 1013.25)).toBeNull();
    expect(calculateAirDensity(20, 0)).toBeNull();
    expect(calculateAirDensity('', 1013.25)).toBeNull();
    expect(calculateAirDensity(20, 'abc')).toBeNull();
  });
});

describe('密度・質量・体積の相互計算', () => {
  it('100gと50cm³から密度を求める', () => {
    const result = calculateDensity(100, 'g', 50, 'cm3');
    expect(result.kgPerM3).toBeCloseTo(2000, 12);
    expect(result.gPerCm3).toBeCloseTo(2, 12);
  });

  it('1kgと1Lから水と同じ密度を求める', () => {
    expect(calculateDensity(1, 'kg', 1, 'L')).toEqual({ kgPerM3: 1000, gPerCm3: 1 });
  });

  it('2.7g/cm³と100cm³から質量を求める', () => {
    const result = calculateMass(2.7, 'g/cm3', 100, 'cm3');
    expect(result.kilograms).toBeCloseTo(0.27, 12);
    expect(result.grams).toBeCloseTo(270, 12);
  });

  it('500gと0.8g/cm³から体積を求める', () => {
    const result = calculateVolume(500, 'g', 0.8, 'g/cm3');
    expect(result.cubicMeters).toBeCloseTo(0.000625, 12);
    expect(result.cubicCentimeters).toBeCloseTo(625, 12);
    expect(result.liters).toBeCloseTo(0.625, 12);
  });

  it('密度の単位を相互変換する', () => {
    expect(convertDensity(1000, 'kg/m3', 'g/cm3')).toBeCloseTo(1, 12);
    expect(convertDensity(1, 'g/mL', 'kg/L')).toBeCloseTo(1, 12);
    expect(convertDensity(1, 'kg/L', 'kg/m3')).toBeCloseTo(1000, 12);
  });

  it('質量と体積の単位を変換する', () => {
    expect(convertMass(1, 't', 'kg')).toBe(1000);
    expect(convertMass(2500, 'mg', 'g')).toBeCloseTo(2.5, 12);
    expect(convertVolume(1, 'm3', 'L')).toBe(1000);
    expect(convertVolume(250, 'mL', 'cm3')).toBeCloseTo(250, 12);
  });

  it('0・負数・空欄・非数値・未知単位は無効', () => {
    expect(calculateDensity(0, 'g', 10, 'cm3')).toBeNull();
    expect(calculateMass(1, 'g/cm3', -1, 'L')).toBeNull();
    expect(calculateVolume('', 'g', 1, 'g/cm3')).toBeNull();
    expect(convertDensity(Infinity, 'kg/m3', 'g/cm3')).toBeNull();
    expect(convertMass(1, 'lb', 'g')).toBeNull();
    expect(convertVolume('abc', 'L', 'm3')).toBeNull();
  });
});
