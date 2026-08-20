import { describe, expect, it } from 'vitest';
import { solveTrapezoid } from '../src/lib/daikei-menseki.js';

describe('solveTrapezoid', () => {
  it('上底・下底・高さから面積と中線を計算する', () => {
    expect(solveTrapezoid({ topBase: 8, bottomBase: 14, height: 6 })).toEqual({
      topBase: 8,
      bottomBase: 14,
      height: 6,
      area: 66,
      midline: 11,
    });
  });

  it('面積から高さを逆算する', () => {
    expect(solveTrapezoid({ target: 'height', topBase: 8, bottomBase: 14, area: 66 })).toMatchObject({
      height: 6,
      area: 66,
    });
  });

  it('面積から上底を逆算する', () => {
    expect(solveTrapezoid({ target: 'topBase', bottomBase: 14, height: 6, area: 66 })).toMatchObject({
      topBase: 8,
    });
  });

  it('面積から下底を逆算する', () => {
    expect(solveTrapezoid({ target: 'bottomBase', topBase: 8, height: 6, area: 66 })).toMatchObject({
      bottomBase: 14,
    });
  });

  it('数値文字列を受け付ける', () => {
    expect(solveTrapezoid({ topBase: '8', bottomBase: '14', height: '6' })).toMatchObject({ area: 66 });
  });

  it.each([
    [{ topBase: 0, bottomBase: 14, height: 6 }],
    [{ topBase: -1, bottomBase: 14, height: 6 }],
    [{ topBase: 'abc', bottomBase: 14, height: 6 }],
    [{ target: 'unknown', topBase: 8, bottomBase: 14, height: 6 }],
    [{ target: 'topBase', bottomBase: 30, height: 6, area: 66 }],
  ])('不正な入力では null を返す: %o', (input) => {
    expect(solveTrapezoid(input)).toBeNull();
  });
});
