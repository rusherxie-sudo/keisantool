import { describe, expect, it } from 'vitest';
import { circleFromArea, circleFromCircumference, circleFromDiameter, circleFromRadius } from '../src/lib/en-menseki.js';

function expectCircle(result, radius) {
  expect(result.radius).toBeCloseTo(radius, 12);
  expect(result.diameter).toBeCloseTo(radius * 2, 12);
  expect(result.circumference).toBeCloseTo(2 * Math.PI * radius, 12);
  expect(result.area).toBeCloseTo(Math.PI * radius ** 2, 12);
}

describe('円の面積・円周計算', () => {
  it('半径から直径・円周・面積を求める', () => {
    expectCircle(circleFromRadius(5), 5);
  });

  it('直径から逆算する', () => {
    expectCircle(circleFromDiameter('10'), 5);
  });

  it('面積から半径を逆算する', () => {
    expectCircle(circleFromArea(25 * Math.PI), 5);
  });

  it('円周から半径を逆算する', () => {
    expectCircle(circleFromCircumference(10 * Math.PI), 5);
  });

  it('小数を途中で丸めない', () => {
    expect(circleFromRadius(0.1).area).toBeCloseTo(Math.PI * 0.01, 15);
  });

  it('0以下・空欄・非有限値は無効', () => {
    for (const calculate of [circleFromRadius, circleFromDiameter, circleFromArea, circleFromCircumference]) {
      expect(calculate(0)).toBeNull();
      expect(calculate(-1)).toBeNull();
      expect(calculate('')).toBeNull();
      expect(calculate(Infinity)).toBeNull();
      expect(calculate('abc')).toBeNull();
    }
  });
});
