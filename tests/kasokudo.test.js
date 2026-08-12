import { describe, expect, it } from 'vitest';
import { convertSpeed, convertAcceleration, solveAcceleration, solveConstantAcceleration } from '../src/lib/kasokudo.js';

describe('速度・加速度換算', () => {
  it('km/hとm/sを換算する', () => {
    expect(convertSpeed(36, 'km/h', 'm/s')).toBeCloseTo(10, 12);
    expect(convertSpeed(10, 'm/s', 'km/h')).toBeCloseTo(36, 12);
  });
  it('m/s²とGを換算する', () => {
    expect(convertAcceleration(1, 'G', 'm/s2')).toBeCloseTo(9.80665, 10);
    expect(convertAcceleration(9.80665, 'm/s2', 'G')).toBeCloseTo(1, 12);
  });
});

describe('速度変化と時間から加速度を計算', () => {
  it('0から100km/hまで10秒なら約2.7778m/s²', () => {
    const result = solveAcceleration({ initialSpeed: 0, finalSpeed: 100, speedUnit: 'km/h', time: 10 });
    expect(result.accelerationMs2).toBeCloseTo(2.7777777778, 9);
    expect(result.accelerationG).toBeCloseTo(2.7777777778 / 9.80665, 9);
  });
  it('減速は負の加速度になる', () => {
    expect(solveAcceleration({ initialSpeed: 20, finalSpeed: 0, speedUnit: 'm/s', time: 5 }).accelerationMs2).toBe(-4);
  });
  it('時間0・負数・非有限を拒否する', () => {
    expect(solveAcceleration({ initialSpeed: 0, finalSpeed: 10, time: 0 })).toBeNull();
    expect(solveAcceleration({ initialSpeed: 0, finalSpeed: 10, time: -1 })).toBeNull();
    expect(solveAcceleration({ initialSpeed: 0, finalSpeed: Infinity, time: 1 })).toBeNull();
  });
});

describe('等加速度運動', () => {
  it('初速0・加速度2m/s²・10秒の終速度と距離', () => {
    expect(solveConstantAcceleration({ initialSpeed: 0, acceleration: 2, time: 10 })).toEqual({
      initialSpeedMs: 0, accelerationMs2: 2, timeSec: 10, finalSpeedMs: 20, distanceM: 100,
    });
  });
  it('初速36km/hも正しく換算する', () => {
    const result = solveConstantAcceleration({ initialSpeed: 36, speedUnit: 'km/h', acceleration: 1, time: 5 });
    expect(result.finalSpeedMs).toBeCloseTo(15, 12);
    expect(result.distanceM).toBeCloseTo(62.5, 12);
  });
  it('時間0以下と非有限値を拒否する', () => {
    expect(solveConstantAcceleration({ initialSpeed: 0, acceleration: 1, time: 0 })).toBeNull();
    expect(solveConstantAcceleration({ initialSpeed: 0, acceleration: NaN, time: 1 })).toBeNull();
  });
});
