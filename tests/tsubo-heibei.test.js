import { describe, expect, it } from 'vitest';
import {
  JO_M2,
  TSUBO_M2,
  areaFromDimensions,
  calculateTsuboPrice,
  convertArea,
} from '../src/lib/tsubo-heibei.js';

describe('convertArea — 坪・平方メートル・帖の換算', () => {
  it('1坪は400/121㎡、1㎡は0.3025坪', () => {
    expect(TSUBO_M2).toBe(400 / 121);
    expect(convertArea(1, 'tsubo')).toMatchObject({ m2: 400 / 121, tsubo: 1 });
    expect(convertArea(1, 'm2').tsubo).toBeCloseTo(0.3025, 12);
  });

  it('不動産表示の1帖は1.62㎡として換算する', () => {
    expect(JO_M2).toBe(1.62);
    const result = convertArea(10, 'jo');
    expect(result.m2).toBeCloseTo(16.2, 12);
    expect(result.jo).toBeCloseTo(10, 12);
    expect(result.tsubo).toBeCloseTo(4.9005, 10);
  });

  it('30坪と100㎡を正しく相互換算する', () => {
    expect(convertArea(30, 'tsubo').m2).toBeCloseTo(99.173553719, 9);
    expect(convertArea(100, 'm2').tsubo).toBeCloseTo(30.25, 12);
  });

  it('0は換算でき、負数・空欄・非数値・未知単位はnull', () => {
    expect(convertArea(0, 'm2')).toEqual({ m2: 0, tsubo: 0, jo: 0 });
    expect(convertArea(-1, 'm2')).toBeNull();
    expect(convertArea('', 'm2')).toBeNull();
    expect(convertArea('abc', 'm2')).toBeNull();
    expect(convertArea(10, 'acre')).toBeNull();
  });
});

describe('areaFromDimensions — 縦×横から面積を計算', () => {
  it('10m×5mは50㎡・15.125坪', () => {
    expect(areaFromDimensions(10, 5, 'm')).toMatchObject({ m2: 50, tsubo: 15.125 });
  });

  it('cm入力をmに直して同じ面積を返す', () => {
    expect(areaFromDimensions(1000, 500, 'cm')).toEqual(areaFromDimensions(10, 5, 'm'));
  });

  it('0を含む辺は0面積、負数・非数値・未知単位はnull', () => {
    expect(areaFromDimensions(0, 5, 'm')).toEqual({ m2: 0, tsubo: 0, jo: 0 });
    expect(areaFromDimensions(-1, 5, 'm')).toBeNull();
    expect(areaFromDimensions(10, '', 'm')).toBeNull();
    expect(areaFromDimensions(10, 5, 'ft')).toBeNull();
  });
});

describe('calculateTsuboPrice — 総額と面積から坪単価を計算', () => {
  it('5000万円・30坪は坪単価166万6666円（切捨て）', () => {
    expect(calculateTsuboPrice(50_000_000, 30, 'tsubo')).toMatchObject({
      totalPrice: 50_000_000,
      pricePerTsubo: 1_666_666,
      pricePerM2: 504_166,
    });
  });

  it('5000万円・100㎡は坪単価165万2892円', () => {
    expect(calculateTsuboPrice(50_000_000, 100, 'm2')).toMatchObject({
      pricePerTsubo: 1_652_892,
      pricePerM2: 500_000,
    });
  });

  it('0以下の総額・0面積・不正入力はnull', () => {
    expect(calculateTsuboPrice(0, 30, 'tsubo')).toBeNull();
    expect(calculateTsuboPrice(10_000_000, 0, 'm2')).toBeNull();
    expect(calculateTsuboPrice('abc', 30, 'tsubo')).toBeNull();
    expect(calculateTsuboPrice(10_000_000, 30, 'jo')).toBeNull();
  });
});
