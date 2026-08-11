import { describe, expect, it } from 'vitest';
import {
  convertLength,
  drawingLengthFromScale,
  realLengthFromScale,
  scaleFromLengths,
} from '../src/lib/shukushaku.js';

describe('縮尺計算', () => {
  it('長さの単位を相互変換する', () => {
    expect(convertLength(1, 'km', 'm')).toBe(1000);
    expect(convertLength(25, 'mm', 'cm')).toBeCloseTo(2.5);
  });

  it('地図上5cm・1:25,000から実際の距離を求める', () => {
    expect(realLengthFromScale(5, 'cm', 25000, 'km')).toBeCloseTo(1.25);
  });

  it('図面上80mm・1:50から実際の長さを求める', () => {
    expect(realLengthFromScale(80, 'mm', 50, 'm')).toBeCloseTo(4);
  });

  it('実際2km・1:25,000から地図上の長さを求める', () => {
    expect(drawingLengthFromScale(2, 'km', 25000, 'cm')).toBeCloseTo(8);
  });

  it('実際3m・1:100から図面上の長さを求める', () => {
    expect(drawingLengthFromScale(3, 'm', 100, 'cm')).toBeCloseTo(3);
  });

  it('図上長と実際の長さから縮尺を求める', () => {
    expect(scaleFromLengths(1, 'cm', 500, 'm')).toBeCloseTo(50000);
    expect(scaleFromLengths(50, 'mm', 5, 'm')).toBeCloseTo(100);
  });

  it('異なる単位でも同じ縮尺を求める', () => {
    expect(scaleFromLengths(2, 'cm', 1, 'km')).toBeCloseTo(50000);
  });

  it('0・負数・不明な単位・拡大率は無効にする', () => {
    expect(realLengthFromScale(0, 'cm', 100, 'm')).toBeNull();
    expect(drawingLengthFromScale(1, 'm', -100, 'cm')).toBeNull();
    expect(convertLength(1, 'yard', 'm')).toBeNull();
    expect(scaleFromLengths(2, 'm', 1, 'm')).toBeNull();
  });
});
