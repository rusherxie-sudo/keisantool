import { describe, expect, it } from 'vitest';
import { convertTorque, solveLeverTorque, solveMotorTorque } from '../src/lib/toruku.js';

describe('トルク単位換算', () => {
  it('N·m・kgf·m・N·cm・lbf·ftを換算する', () => {
    expect(convertTorque(1, 'kgf-m', 'N-m')).toBeCloseTo(9.80665, 10);
    expect(convertTorque(100, 'N-cm', 'N-m')).toBeCloseTo(1, 12);
    expect(convertTorque(1, 'lbf-ft', 'N-m')).toBeCloseTo(1.3558179483314, 10);
  });
  it('空欄・非有限・未知単位を拒否する', () => {
    expect(convertTorque('', 'N-m', 'kgf-m')).toBeNull();
    expect(convertTorque(Infinity, 'N-m', 'kgf-m')).toBeNull();
    expect(convertTorque(1, 'bad', 'N-m')).toBeNull();
  });
});

describe('力×腕の長さのトルク', () => {
  it('100Nを0.5mで加えると50N·m', () => {
    expect(solveLeverTorque({ target: 'torque', force: 100, radius: 0.5 }).torqueNm).toBeCloseTo(50, 12);
  });
  it('20kgfを25cmで加える', () => {
    expect(solveLeverTorque({ target: 'torque', force: 20, forceUnit: 'kgf', radius: 25, radiusUnit: 'cm' }).torqueNm).toBeCloseTo(49.03325, 10);
  });
  it('トルクから力と腕の長さを逆算する', () => {
    expect(solveLeverTorque({ target: 'force', torque: 60, radius: 0.3 }).forceN).toBeCloseTo(200, 12);
    expect(solveLeverTorque({ target: 'radius', torque: 40, force: 200 }).radiusM).toBeCloseTo(0.2, 12);
  });
});

describe('モーター出力・回転数・トルク', () => {
  it('1kW・1500rpmからトルクを求める', () => {
    expect(solveMotorTorque({ target: 'torque', power: 1, powerUnit: 'kW', rpm: 1500 }).torqueNm).toBeCloseTo(6.3661977237, 9);
  });
  it('トルクから出力と回転数を逆算する', () => {
    expect(solveMotorTorque({ target: 'power', torque: 10, rpm: 1500 }).powerW).toBeCloseTo(1570.79632679, 8);
    expect(solveMotorTorque({ target: 'rpm', torque: 10, power: 1000 }).rpm).toBeCloseTo(954.92965855, 8);
  });
  it('0・負数・未知の求値を拒否する', () => {
    expect(solveMotorTorque({ target: 'torque', power: 0, rpm: 1000 })).toBeNull();
    expect(solveLeverTorque({ target: 'force', torque: -1, radius: 1 })).toBeNull();
    expect(solveMotorTorque({ target: 'bad', power: 1, rpm: 1 })).toBeNull();
  });
});
