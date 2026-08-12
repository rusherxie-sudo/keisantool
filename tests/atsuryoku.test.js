import { describe, expect, it } from 'vitest';
import {
  convertPressure,
  convertForce,
  convertArea,
  solvePressure,
  solveHydrostatic,
} from '../src/lib/atsuryoku.js';

describe('圧力・力・面積の単位換算', () => {
  it('MPa・kPa・barを換算する', () => {
    expect(convertPressure(1, 'MPa', 'kPa')).toBe(1000);
    expect(convertPressure(1, 'bar', 'Pa')).toBe(100_000);
  });

  it('atm・Torr・kgf/cm²・psiをPa基準で換算する', () => {
    expect(convertPressure(1, 'atm', 'Pa')).toBe(101_325);
    expect(convertPressure(1, 'atm', 'Torr')).toBeCloseTo(760, 9);
    expect(convertPressure(1, 'kgf/cm²', 'kPa')).toBeCloseTo(98.0665, 10);
    expect(convertPressure(1, 'psi', 'Pa')).toBeCloseTo(6894.76, 2);
  });

  it('kgfと面積単位をSIへ換算する', () => {
    expect(convertForce(10, 'kgf', 'N')).toBeCloseTo(98.0665, 10);
    expect(convertArea(100, 'cm²', 'm²')).toBeCloseTo(0.01, 12);
    expect(convertArea(1, 'mm²', 'cm²')).toBeCloseTo(0.01, 12);
  });

  it('空欄・非有限・未知単位を拒否する', () => {
    expect(convertPressure('', 'Pa', 'kPa')).toBeNull();
    expect(convertPressure(Infinity, 'Pa', 'kPa')).toBeNull();
    expect(convertPressure(1, 'unknown', 'Pa')).toBeNull();
    expect(convertForce(1, 'N', 'unknown')).toBeNull();
  });
});

describe('圧力 p=F/S の相互計算', () => {
  it('1000Nを0.01m²に加えた圧力は100kPa', () => {
    expect(solvePressure({ target: 'pressure', force: 1000, area: 0.01 })).toEqual({
      pressurePa: 100_000,
      forceN: 1000,
      areaM2: 0.01,
    });
  });

  it('0.5MPaを10cm²に加えた力は500N', () => {
    const result = solvePressure({
      target: 'force', pressure: 0.5, pressureUnit: 'MPa', area: 10, areaUnit: 'cm²',
    });
    expect(result.forceN).toBeCloseTo(500, 10);
    expect(result.areaM2).toBeCloseTo(0.001, 12);
  });

  it('2kNを400kPaで支える面積は50cm²', () => {
    const result = solvePressure({
      target: 'area', force: 2, forceUnit: 'kN', pressure: 400, pressureUnit: 'kPa',
    });
    expect(result.areaM2).toBeCloseTo(0.005, 12);
    expect(convertArea(result.areaM2, 'm²', 'cm²')).toBeCloseTo(50, 10);
  });

  it('0・負数・未知の求値を拒否する', () => {
    expect(solvePressure({ target: 'pressure', force: 0, area: 1 })).toBeNull();
    expect(solvePressure({ target: 'force', pressure: -1, area: 1 })).toBeNull();
    expect(solvePressure({ target: 'unknown', force: 1, area: 1 })).toBeNull();
  });
});

describe('水深と静水圧 p=ρgh', () => {
  it('水深10mの水圧は98.0665kPa', () => {
    const result = solveHydrostatic({ target: 'pressure', density: 1000, depth: 10 });
    expect(result.pressurePa).toBeCloseTo(98_066.5, 8);
    expect(result.depthM).toBe(10);
  });

  it('98.0665kPaの水圧から水深10mを逆算する', () => {
    const result = solveHydrostatic({
      target: 'depth', density: 1000, pressure: 98.0665, pressureUnit: 'kPa',
    });
    expect(result.depthM).toBeCloseTo(10, 10);
  });

  it('密度・水深・圧力・重力加速度の非法値を拒否する', () => {
    expect(solveHydrostatic({ target: 'pressure', density: 0, depth: 10 })).toBeNull();
    expect(solveHydrostatic({ target: 'pressure', density: 1000, depth: -1 })).toBeNull();
    expect(solveHydrostatic({ target: 'depth', density: 1000, pressure: 0 })).toBeNull();
    expect(solveHydrostatic({ target: 'pressure', density: 1000, depth: 10, gravity: Infinity })).toBeNull();
  });
});
