import { describe, expect, it } from 'vitest';
import { solveGearPair, compoundGearRatio, solveBicycleGear } from '../src/lib/gear-hi.js';

describe('平歯車のギア比・回転数・トルク', () => {
  it('駆動20歯・従動60歯は3:1', () => {
    const r = solveGearPair({ driveTeeth: 20, drivenTeeth: 60, inputRpm: 1500, inputTorque: 2 });
    expect(r.ratio).toBe(3); expect(r.outputRpm).toBe(500); expect(r.outputTorque).toBe(6);
  });
  it('効率90%なら出力トルクを減らす', () => expect(solveGearPair({ driveTeeth: 20, drivenTeeth: 60, inputTorque: 2, efficiency: 90 }).outputTorque).toBeCloseTo(5.4, 12));
  it('増速比も計算する', () => expect(solveGearPair({ driveTeeth: 60, drivenTeeth: 20, inputRpm: 500 }).outputRpm).toBe(1500));
  it('0・負数・100%超の効率を拒否する', () => {
    expect(solveGearPair({ driveTeeth: 0, drivenTeeth: 60 })).toBeNull();
    expect(solveGearPair({ driveTeeth: 20, drivenTeeth: -1 })).toBeNull();
    expect(solveGearPair({ driveTeeth: 20, drivenTeeth: 60, efficiency: 101 })).toBeNull();
  });
});

describe('多段歯車と自転車', () => {
  it('2段の総減速比は各段の積', () => expect(compoundGearRatio([{ drive: 20, driven: 60 }, { drive: 15, driven: 45 }])).toBe(9));
  it('自転車50T/25T・周長2.1m・90rpmは22.68km/h', () => {
    const r = solveBicycleGear({ frontTeeth: 50, rearTeeth: 25, wheelCircumferenceM: 2.1, cadenceRpm: 90 });
    expect(r.ratio).toBe(2); expect(r.distancePerCrankM).toBeCloseTo(4.2, 12); expect(r.speedKmh).toBeCloseTo(22.68, 12);
  });
  it('空配列・不正値を拒否する', () => {
    expect(compoundGearRatio([])).toBeNull();
    expect(compoundGearRatio([{ drive: 0, driven: 20 }])).toBeNull();
    expect(solveBicycleGear({ frontTeeth: 50, rearTeeth: 0, wheelCircumferenceM: 2.1, cadenceRpm: 90 })).toBeNull();
  });
});
