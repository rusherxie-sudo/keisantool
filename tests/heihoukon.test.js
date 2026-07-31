import { describe, expect, it } from 'vitest';
import {
  calculateNthRoot,
  calculateSquareRoot,
  simplifyIntegerSquareRoot,
} from '../src/lib/heihoukon.js';

describe('simplifyIntegerSquareRoot（整数の根号簡約）', () => {
  it('√72を6√2に簡約する', () => {
    expect(simplifyIntegerSquareRoot(72)).toEqual({
      coefficient: 6,
      radicand: 2,
      expression: '6√2',
      imaginary: false,
      perfectSquare: false,
    });
  });

  it('完全平方数は整数にする', () => {
    expect(simplifyIntegerSquareRoot(144)).toEqual({
      coefficient: 12,
      radicand: 1,
      expression: '12',
      imaginary: false,
      perfectSquare: true,
    });
  });

  it('√2はこれ以上簡約しない', () => {
    expect(simplifyIntegerSquareRoot(2).expression).toBe('√2');
  });

  it('0の平方根は0', () => {
    expect(simplifyIntegerSquareRoot(0)).toEqual({
      coefficient: 0,
      radicand: 1,
      expression: '0',
      imaginary: false,
      perfectSquare: true,
    });
  });

  it('負の整数は虚数単位iを付けて簡約する', () => {
    expect(simplifyIntegerSquareRoot(-72)).toEqual({
      coefficient: 6,
      radicand: 2,
      expression: '6√2i',
      imaginary: true,
      perfectSquare: false,
    });
  });

  it('整数以外・上限超過・無効値はnull', () => {
    expect(simplifyIntegerSquareRoot(0.25)).toBeNull();
    expect(simplifyIntegerSquareRoot(1_000_000_001)).toBeNull();
    expect(simplifyIntegerSquareRoot(Number.NaN)).toBeNull();
  });
});

describe('calculateSquareRoot（平方根）', () => {
  it('正の数は主平方根と根号簡約を返す', () => {
    const result = calculateSquareRoot(72);
    expect(result.real).toBe(true);
    expect(result.decimal).toBeCloseTo(Math.sqrt(72), 12);
    expect(result.simplified.expression).toBe('6√2');
  });

  it('小数の平方根を計算できる', () => {
    const result = calculateSquareRoot(0.25);
    expect(result.real).toBe(true);
    expect(result.decimal).toBe(0.5);
    expect(result.simplified).toBeNull();
  });

  it('負の数は虚数の大きさを返す', () => {
    const result = calculateSquareRoot(-9);
    expect(result.real).toBe(false);
    expect(result.decimal).toBeNull();
    expect(result.imaginaryMagnitude).toBe(3);
    expect(result.simplified.expression).toBe('3i');
  });

  it('無効値はnull', () => {
    expect(calculateSquareRoot(Number.NaN)).toBeNull();
    expect(calculateSquareRoot(Infinity)).toBeNull();
  });
});

describe('calculateNthRoot（n乗根）', () => {
  it('27の3乗根は3', () => {
    expect(calculateNthRoot(27, 3)).toEqual({ real: true, result: 3 });
  });

  it('負数の奇数乗根は負の実数', () => {
    expect(calculateNthRoot(-8, 3)).toEqual({ real: true, result: -2 });
  });

  it('負数の偶数乗根は実数範囲に存在しない', () => {
    expect(calculateNthRoot(-16, 4)).toEqual({ real: false, result: null });
  });

  it('0のn乗根は0', () => {
    expect(calculateNthRoot(0, 8)).toEqual({ real: true, result: 0 });
  });

  it('次数は2〜100の整数だけ受け付ける', () => {
    expect(calculateNthRoot(16, 1)).toBeNull();
    expect(calculateNthRoot(16, 2.5)).toBeNull();
    expect(calculateNthRoot(16, 101)).toBeNull();
  });

  it('無効な数値はnull', () => {
    expect(calculateNthRoot(Number.NaN, 2)).toBeNull();
    expect(calculateNthRoot(Infinity, 2)).toBeNull();
  });
});
