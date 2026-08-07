import { describe, expect, it } from 'vitest';
import {
  triangleFromBaseHeight,
  triangleFromCoordinates,
  triangleFromThreeSides,
  triangleFromTwoSidesAngle,
} from '../src/lib/sankakkei-menseki.js';

describe('triangleFromBaseHeight — 底辺と高さ', () => {
  it('底辺10・高さ6の面積は30', () => {
    expect(triangleFromBaseHeight(10, 6)).toEqual({ area: 30 });
  });

  it('数値文字列と小数を受け付ける', () => {
    expect(triangleFromBaseHeight('2.5', '4')).toEqual({ area: 5 });
  });

  it('0以下・非数値はnull', () => {
    expect(triangleFromBaseHeight(0, 6)).toBeNull();
    expect(triangleFromBaseHeight(10, -1)).toBeNull();
    expect(triangleFromBaseHeight('abc', 6)).toBeNull();
  });
});

describe('triangleFromThreeSides — ヘロンの公式', () => {
  it('3・4・5の三角形は面積6・周長12', () => {
    expect(triangleFromThreeSides(3, 4, 5)).toEqual({
      area: 6,
      perimeter: 12,
      semiperimeter: 6,
    });
  });

  it('一辺2の正三角形の面積は√3', () => {
    const result = triangleFromThreeSides(2, 2, 2);
    expect(result.area).toBeCloseTo(Math.sqrt(3), 12);
    expect(result.perimeter).toBe(6);
  });

  it('三角不等式を満たさない辺はnull', () => {
    expect(triangleFromThreeSides(1, 2, 3)).toBeNull();
    expect(triangleFromThreeSides(1, 2, 4)).toBeNull();
  });

  it('0以下・非数値はnull', () => {
    expect(triangleFromThreeSides(3, 0, 5)).toBeNull();
    expect(triangleFromThreeSides(3, 4, Infinity)).toBeNull();
  });
});

describe('triangleFromTwoSidesAngle — 2辺とその間の角', () => {
  it('3・4・90度は面積6、残りの辺5', () => {
    expect(triangleFromTwoSidesAngle(3, 4, 90)).toEqual({
      area: 6,
      thirdSide: 5,
      perimeter: 12,
    });
  });

  it('5・7・60度を正弦定理と余弦定理で計算する', () => {
    const result = triangleFromTwoSidesAngle(5, 7, 60);
    expect(result.area).toBeCloseTo((35 * Math.sqrt(3)) / 4, 12);
    expect(result.thirdSide).toBeCloseTo(Math.sqrt(39), 12);
    expect(result.perimeter).toBeCloseTo(12 + Math.sqrt(39), 12);
  });

  it('角度0・180度と不正な辺はnull', () => {
    expect(triangleFromTwoSidesAngle(3, 4, 0)).toBeNull();
    expect(triangleFromTwoSidesAngle(3, 4, 180)).toBeNull();
    expect(triangleFromTwoSidesAngle(-3, 4, 90)).toBeNull();
  });
});

describe('triangleFromCoordinates — 3点の座標', () => {
  it('(0,0)・(4,0)・(0,3)は面積6・周長12', () => {
    expect(triangleFromCoordinates(0, 0, 4, 0, 0, 3)).toEqual({
      area: 6,
      sides: [4, 5, 3],
      perimeter: 12,
    });
  });

  it('点の順序を逆にしても面積は正', () => {
    expect(triangleFromCoordinates(0, 3, 4, 0, 0, 0).area).toBe(6);
  });

  it('負の座標と数値文字列を受け付ける', () => {
    expect(triangleFromCoordinates('-1', '-1', '3', '-1', '-1', '2').area).toBe(6);
  });

  it('同一直線上・非数値の3点はnull', () => {
    expect(triangleFromCoordinates(0, 0, 1, 1, 2, 2)).toBeNull();
    expect(triangleFromCoordinates(0, 0, 'x', 1, 2, 2)).toBeNull();
  });
});
