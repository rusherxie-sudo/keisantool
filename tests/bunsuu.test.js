import { describe, expect, it } from 'vitest';
import {
  calculateFraction,
  decimalToFraction,
  fractionToMixed,
  mixedToFraction,
  normalizeFraction,
} from '../src/lib/bunsuu.js';

describe('normalizeFraction（分数の正規化）', () => {
  it('最大公約数で約分する', () => {
    expect(normalizeFraction('18', '24')).toEqual({ numerator: '3', denominator: '4' });
  });

  it('分母の負号を分子へ移す', () => {
    expect(normalizeFraction('2', '-4')).toEqual({ numerator: '-1', denominator: '2' });
  });

  it('0は常に0/1へ正規化する', () => {
    expect(normalizeFraction('0', '999')).toEqual({ numerator: '0', denominator: '1' });
  });

  it('分母0や整数以外はnull', () => {
    expect(normalizeFraction('1', '0')).toBeNull();
    expect(normalizeFraction('1.5', '2')).toBeNull();
    expect(normalizeFraction('', '2')).toBeNull();
  });
});

describe('帯分数と仮分数の変換', () => {
  it('1と1/2を3/2へ変換する', () => {
    expect(mixedToFraction({ whole: '1', numerator: '1', denominator: '2' })).toEqual({
      numerator: '3',
      denominator: '2',
    });
  });

  it('負の帯分数-1と1/2を-3/2へ変換する', () => {
    expect(mixedToFraction({ whole: '-1', numerator: '1', denominator: '2' })).toEqual({
      numerator: '-3',
      denominator: '2',
    });
  });

  it('負の仮分数を符号付き帯分数にする', () => {
    expect(fractionToMixed('-7', '3')).toEqual({
      whole: '-2',
      numerator: '1',
      denominator: '3',
      display: '-2 1/3',
    });
  });

  it('真分数は帯分数表示でも分数のまま', () => {
    expect(fractionToMixed('3', '4').display).toBe('3/4');
  });
});

describe('calculateFraction（分数の四則計算）', () => {
  it('1/2＋1/3を通分して5/6にする', () => {
    const result = calculateFraction({
      left: { numerator: '1', denominator: '2' },
      right: { numerator: '1', denominator: '3' },
      operation: 'add',
    });
    expect(result.result).toMatchObject({
      numerator: '5',
      denominator: '6',
      improper: '5/6',
      mixed: '5/6',
      decimal: '0.833333333333',
    });
    expect(result.steps).toEqual(['1/2 ＋ 1/3', '3/6 ＋ 2/6', '5/6']);
  });

  it('3/4−5/6を-1/12にする', () => {
    const result = calculateFraction({
      left: { numerator: '3', denominator: '4' },
      right: { numerator: '5', denominator: '6' },
      operation: 'subtract',
    });
    expect(result.result.improper).toBe('-1/12');
    expect(result.steps).toEqual(['3/4 − 5/6', '9/12 − 10/12', '-1/12']);
  });

  it('2/3×9/4を3/2＝1と1/2にする', () => {
    const result = calculateFraction({
      left: { numerator: '2', denominator: '3' },
      right: { numerator: '9', denominator: '4' },
      operation: 'multiply',
    });
    expect(result.result).toMatchObject({ improper: '3/2', mixed: '1 1/2', decimal: '1.5' });
    expect(result.steps).toEqual(['2/3 × 9/4', '18/12', '3/2']);
  });

  it('5/6÷10/9を3/4にする', () => {
    const result = calculateFraction({
      left: { numerator: '5', denominator: '6' },
      right: { numerator: '10', denominator: '9' },
      operation: 'divide',
    });
    expect(result.result.improper).toBe('3/4');
    expect(result.steps).toEqual(['5/6 ÷ 10/9', '5/6 × 9/10', '45/60', '3/4']);
  });

  it('負の分数で割る途中式も分母を正に保つ', () => {
    const result = calculateFraction({
      left: { numerator: '1', denominator: '2' },
      right: { numerator: '-1', denominator: '4' },
      operation: 'divide',
    });
    expect(result.result.improper).toBe('-2');
    expect(result.steps).toEqual(['1/2 ÷ -1/4', '1/2 × -4', '-4/2', '-2']);
  });

  it('帯分数どうしを計算できる', () => {
    const result = calculateFraction({
      left: { whole: '1', numerator: '1', denominator: '2' },
      right: { whole: '2', numerator: '1', denominator: '3' },
      operation: 'add',
    });
    expect(result.result).toMatchObject({ improper: '23/6', mixed: '3 5/6' });
  });

  it('0で割る計算はnull', () => {
    expect(calculateFraction({
      left: { numerator: '1', denominator: '2' },
      right: { numerator: '0', denominator: '5' },
      operation: 'divide',
    })).toBeNull();
  });

  it('安全整数を超える値もBigIntで正確に計算する', () => {
    const result = calculateFraction({
      left: { numerator: '9007199254740993', denominator: '1' },
      right: { numerator: '1', denominator: '1' },
      operation: 'add',
    });
    expect(result.result.improper).toBe('9007199254740994');
  });
});

describe('decimalToFraction（小数から分数）', () => {
  it('0.125を1/8へ正確に変換する', () => {
    expect(decimalToFraction('0.125')).toMatchObject({
      numerator: '1',
      denominator: '8',
      improper: '1/8',
      mixed: '1/8',
    });
  });

  it('負の小数と整数を変換できる', () => {
    expect(decimalToFraction('-1.25').mixed).toBe('-1 1/4');
    expect(decimalToFraction('3').improper).toBe('3');
  });

  it('指数表記・空欄・過剰桁はnull', () => {
    expect(decimalToFraction('1e-3')).toBeNull();
    expect(decimalToFraction('')).toBeNull();
    expect(decimalToFraction('0.1234567890123456789012345678901')).toBeNull();
  });
});
