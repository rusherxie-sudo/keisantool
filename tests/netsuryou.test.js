import { describe, expect, it } from 'vitest';
import { convertEnergy, solveSensibleHeat, solvePowerHeat } from '../src/lib/netsuryou.js';

describe('熱量単位換算', () => {
  it('cal・kcal・Wh・kWhをJへ換算する', () => {
    expect(convertEnergy(1, 'cal', 'J')).toBeCloseTo(4.184, 12);
    expect(convertEnergy(1, 'kcal', 'J')).toBeCloseTo(4184, 10);
    expect(convertEnergy(1, 'Wh', 'J')).toBe(3600);
    expect(convertEnergy(1, 'kWh', 'J')).toBe(3_600_000);
  });
  it('空欄・未知単位を拒否する', () => { expect(convertEnergy('', 'J', 'kJ')).toBeNull(); expect(convertEnergy(1, 'bad', 'J')).toBeNull(); });
});

describe('Q=mcΔTとP=Q/t', () => {
  it('水1kgを20℃上げる熱量は83.6kJ', () => expect(solveSensibleHeat({ mass: 1, specificHeat: 4.18, specificHeatUnit: 'kJ/kgK', temperatureChange: 20 }).energyJ).toBeCloseTo(83_600, 8));
  it('500g・0.9J/gK・50Kは22.5kJ', () => expect(solveSensibleHeat({ mass: 500, massUnit: 'g', specificHeat: 0.9, specificHeatUnit: 'J/gK', temperatureChange: 50 }).energyJ).toBeCloseTo(22_500, 8));
  it('1kWを3分使うと180kJ', () => expect(solvePowerHeat({ target: 'energy', power: 1, powerUnit: 'kW', time: 3, timeUnit: 'min' }).energyJ).toBe(180_000));
  it('360kJを2kWで加えると3分', () => expect(solvePowerHeat({ target: 'time', energy: 360, energyUnit: 'kJ', power: 2, powerUnit: 'kW' }).timeSec).toBe(180));
  it('0・負数・不明な求値を拒否する', () => {
    expect(solveSensibleHeat({ mass: 0, specificHeat: 4.18, temperatureChange: 20 })).toBeNull();
    expect(solveSensibleHeat({ mass: 1, specificHeat: 4.18, temperatureChange: -1 })).toBeNull();
    expect(solvePowerHeat({ target: 'bad', power: 1, time: 1 })).toBeNull();
  });
});
