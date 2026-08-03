import { describe, expect, it } from 'vitest';
import {
  calculateInverseTrig,
  calculateTrig,
  solveRightTriangle,
} from '../src/lib/sankaku-kansuu.js';

describe('calculateTrig（sin・cos・tan）', () => {
  it('30度の三角関数を計算する', () => {
    const result = calculateTrig(30, 'degree');
    expect(result.sin).toBeCloseTo(0.5, 12);
    expect(result.cos).toBeCloseTo(Math.sqrt(3) / 2, 12);
    expect(result.tan).toBeCloseTo(1 / Math.sqrt(3), 12);
  });

  it('ラジアン入力に対応する', () => {
    const result = calculateTrig(Math.PI / 4, 'radian');
    expect(result.degrees).toBeCloseTo(45, 12);
    expect(result.sin).toBeCloseTo(Math.SQRT1_2, 12);
    expect(result.cos).toBeCloseTo(Math.SQRT1_2, 12);
    expect(result.tan).toBeCloseTo(1, 12);
  });

  it('90度と270度のtanは定義なし', () => {
    expect(calculateTrig(90, 'degree').tan).toBeNull();
    expect(calculateTrig(270, 'degree').tan).toBeNull();
  });

  it('無限大・文字列・不正な単位はnull', () => {
    expect(calculateTrig(Infinity, 'degree')).toBeNull();
    expect(calculateTrig('30', 'degree')).toBeNull();
    expect(calculateTrig(30, 'gradian')).toBeNull();
  });
});

describe('calculateInverseTrig（逆三角関数）', () => {
  it('asin(0.5)=30度、acos(0.5)=60度、atan(1)=45度', () => {
    expect(calculateInverseTrig('asin', 0.5, 'degree')).toBeCloseTo(30, 12);
    expect(calculateInverseTrig('acos', 0.5, 'degree')).toBeCloseTo(60, 12);
    expect(calculateInverseTrig('atan', 1, 'degree')).toBeCloseTo(45, 12);
  });

  it('ラジアンで結果を返す', () => {
    expect(calculateInverseTrig('asin', 1, 'radian')).toBeCloseTo(Math.PI / 2, 12);
  });

  it('asin・acosの定義域外と不正入力はnull', () => {
    expect(calculateInverseTrig('asin', 1.01, 'degree')).toBeNull();
    expect(calculateInverseTrig('acos', -1.01, 'degree')).toBeNull();
    expect(calculateInverseTrig('cot', 1, 'degree')).toBeNull();
  });
});

describe('solveRightTriangle（三平方の定理）', () => {
  it('3・4・5の直角三角形を求める', () => {
    const result = solveRightTriangle({ a: 3, b: 4 });
    expect(result.c).toBeCloseTo(5, 12);
    expect(result.angleA).toBeCloseTo(36.86989764584402, 12);
    expect(result.angleB).toBeCloseTo(53.13010235415598, 12);
    expect(result.area).toBeCloseTo(6, 12);
    expect(result.perimeter).toBeCloseTo(12, 12);
  });

  it('斜辺と一方の辺から残りの辺を求める', () => {
    expect(solveRightTriangle({ a: 5, c: 13 }).b).toBeCloseTo(12, 12);
    expect(solveRightTriangle({ b: 12, c: 13 }).a).toBeCloseTo(5, 12);
  });

  it('旜辺が短い・辺が0・3辺入力はnull', () => {
    expect(solveRightTriangle({ a: 5, c: 4 })).toBeNull();
    expect(solveRightTriangle({ a: 0, b: 4 })).toBeNull();
    expect(solveRightTriangle({ a: 3, b: 4, c: 5 })).toBeNull();
  });
});
