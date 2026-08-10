import { describe, expect, it } from 'vitest';
import {
  calculateCone,
  calculateCube,
  calculateCylinder,
  calculateRectangularPrism,
  calculateSphere,
  convertCubicVolume,
} from '../src/lib/taiseki.js';

describe('立体の体積と表面積', () => {
  it('直方体を計算する', () => {
    expect(calculateRectangularPrism(2, 3, 4)).toEqual({ volume: 24, surfaceArea: 52 });
  });

  it('立方体を計算する', () => {
    expect(calculateCube('3')).toEqual({ volume: 27, surfaceArea: 54 });
  });

  it('円柱を計算する', () => {
    const result = calculateCylinder(2, 5);
    expect(result.volume).toBeCloseTo(20 * Math.PI, 12);
    expect(result.surfaceArea).toBeCloseTo(28 * Math.PI, 12);
  });

  it('円錐を計算し母線も返す', () => {
    const result = calculateCone(3, 4);
    expect(result.volume).toBeCloseTo(12 * Math.PI, 12);
    expect(result.slantHeight).toBe(5);
    expect(result.surfaceArea).toBeCloseTo(24 * Math.PI, 12);
  });

  it('球を計算する', () => {
    const result = calculateSphere(3);
    expect(result.volume).toBeCloseTo(36 * Math.PI, 12);
    expect(result.surfaceArea).toBeCloseTo(36 * Math.PI, 12);
  });

  it('立方単位をm³・L・mLへ換算する', () => {
    expect(convertCubicVolume(1_000_000, 'cm')).toEqual({ cubicMeters: 1, liters: 1000, milliliters: 1_000_000 });
    expect(convertCubicVolume(1, 'm')).toEqual({ cubicMeters: 1, liters: 1000, milliliters: 1_000_000 });
    const millimeterResult = convertCubicVolume(1000, 'mm');
    expect(millimeterResult.cubicMeters).toBeCloseTo(0.000001, 15);
    expect(millimeterResult.liters).toBeCloseTo(0.001, 15);
    expect(millimeterResult.milliliters).toBeCloseTo(1, 15);
  });

  it('0以下・空欄・非数値・未知単位は無効', () => {
    expect(calculateRectangularPrism(0, 2, 3)).toBeNull();
    expect(calculateCube('')).toBeNull();
    expect(calculateCylinder(2, -1)).toBeNull();
    expect(calculateCone('x', 4)).toBeNull();
    expect(calculateSphere(Infinity)).toBeNull();
    expect(convertCubicVolume(1, 'inch')).toBeNull();
  });
});
