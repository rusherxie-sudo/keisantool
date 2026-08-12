import { describe, expect, it } from 'vitest';
import { solveHooke, springEnergy, combineSprings } from '../src/lib/bane-teisuu.js';

describe('フックの法則 F=kx', () => {
  it('k=200N/m・50mmなら10N', () => expect(solveHooke({ target: 'force', springConstant: 200, extension: 50, extensionUnit: 'mm' }).forceN).toBe(10));
  it('20N・100mmから200N/m', () => expect(solveHooke({ target: 'springConstant', force: 20, extension: 100, extensionUnit: 'mm' }).springConstantNm).toBe(200));
  it('15N・300N/mから50mm', () => expect(solveHooke({ target: 'extension', force: 15, springConstant: 300 }).extensionM).toBeCloseTo(0.05, 12));
  it('0・負数・不明な求値を拒否する', () => {
    expect(solveHooke({ target: 'force', springConstant: 0, extension: 1 })).toBeNull();
    expect(solveHooke({ target: 'force', springConstant: 1, extension: -1 })).toBeNull();
    expect(solveHooke({ target: 'bad', springConstant: 1, extension: 1 })).toBeNull();
  });
});

describe('弾性エネルギーと合成ばね定数', () => {
  it('200N/mを0.1m伸ばすエネルギーは1J', () => expect(springEnergy({ springConstant: 200, extension: 0.1 })).toBeCloseTo(1, 12));
  it('100と200N/mの並列は300、直列は約66.67', () => {
    expect(combineSprings([100, 200], 'parallel')).toBe(300);
    expect(combineSprings([100, 200], 'series')).toBeCloseTo(66.6666666667, 9);
  });
  it('空配列・0・未知接続を拒否する', () => {
    expect(combineSprings([], 'parallel')).toBeNull(); expect(combineSprings([100, 0], 'series')).toBeNull(); expect(combineSprings([100], 'bad')).toBeNull();
  });
});
