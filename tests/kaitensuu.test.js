import { describe, expect, it } from 'vitest';
import { calculateRpm, calculateMotorSpeed, calculatePulleySpeed, calculateCuttingSpeed } from '../src/lib/kaitensuu.js';

describe('回転数・周期の計算', () => {
  it('120回を30秒で回る場合は240rpm', () => {
    const result = calculateRpm({ rotations: 120, time: 30, timeUnit: 's' });
    expect(result.rpm).toBe(240);
    expect(result.rps).toBe(4);
    expect(result.periodSeconds).toBe(0.25);
  });

  it('2分で300回の場合は150rpm', () => {
    expect(calculateRpm({ rotations: 300, time: 2, timeUnit: 'min' }).rpm).toBe(150);
  });

  it('0以下・非数値・未知の時間単位を拒否する', () => {
    expect(calculateRpm({ rotations: 0, time: 1, timeUnit: 's' })).toBeNull();
    expect(calculateRpm({ rotations: 1, time: 'x', timeUnit: 's' })).toBeNull();
    expect(calculateRpm({ rotations: 1, time: 1, timeUnit: 'h' })).toBeNull();
  });
});

describe('モーター同期速度とすべり', () => {
  it('50Hz・4極の同期速度は1500rpm、すべり4%なら1440rpm', () => {
    const result = calculateMotorSpeed({ frequency: 50, poles: 4, slip: 4 });
    expect(result.synchronousRpm).toBe(1500);
    expect(result.actualRpm).toBe(1440);
  });

  it('60Hz・2極・すべり0%は3600rpm', () => {
    expect(calculateMotorSpeed({ frequency: 60, poles: 2, slip: 0 }).actualRpm).toBe(3600);
  });

  it('奇数極、0以下、100%以上のすべりを拒否する', () => {
    expect(calculateMotorSpeed({ frequency: 50, poles: 3, slip: 4 })).toBeNull();
    expect(calculateMotorSpeed({ frequency: 0, poles: 4, slip: 4 })).toBeNull();
    expect(calculateMotorSpeed({ frequency: 50, poles: 4, slip: 100 })).toBeNull();
  });
});

describe('プーリー回転数', () => {
  it('駆動100mm・従動200mmなら1500rpmが750rpmになる', () => {
    const result = calculatePulleySpeed({ driverRpm: 1500, driverDiameter: 100, drivenDiameter: 200 });
    expect(result.drivenRpm).toBe(750);
    expect(result.speedRatio).toBe(2);
  });

  it('0以下や非数値を拒否する', () => {
    expect(calculatePulleySpeed({ driverRpm: 0, driverDiameter: 100, drivenDiameter: 200 })).toBeNull();
    expect(calculatePulleySpeed({ driverRpm: 1000, driverDiameter: -1, drivenDiameter: 200 })).toBeNull();
  });
});

describe('切削速度と回転数', () => {
  it('直径20mm・1000rpmの切削速度を計算する', () => {
    const result = calculateCuttingSpeed({ target: 'speed', diameterMm: 20, rpm: 1000 });
    expect(result.cuttingSpeedMpm).toBeCloseTo(20 * Math.PI, 10);
  });

  it('直径10mm・切削速度100m/minから回転数を逆算する', () => {
    const result = calculateCuttingSpeed({ target: 'rpm', diameterMm: 10, cuttingSpeedMpm: 100 });
    expect(result.rpm).toBeCloseTo(10000 / Math.PI, 10);
  });

  it('未知の対象、0以下、非数値を拒否する', () => {
    expect(calculateCuttingSpeed({ target: 'x', diameterMm: 10, rpm: 1000 })).toBeNull();
    expect(calculateCuttingSpeed({ target: 'speed', diameterMm: 0, rpm: 1000 })).toBeNull();
    expect(calculateCuttingSpeed({ target: 'rpm', diameterMm: 10, cuttingSpeedMpm: 'x' })).toBeNull();
  });
});
