import { describe, expect, it } from 'vitest';
import {
  calculateSlope,
  slopeFromAngle,
  slopeFromPercent,
  slopeFromRoofPitch,
} from '../src/lib/koubai.js';

describe('calculateSlope（高低差と水平距離から勾配）', () => {
  it('高さ4・水平10を40%、約21.8度、4寸勾配に換算する', () => {
    const result = calculateSlope(4, 10);
    expect(result.ratio).toBeCloseTo(0.4, 12);
    expect(result.percent).toBeCloseTo(40, 12);
    expect(result.permille).toBeCloseTo(400, 12);
    expect(result.degrees).toBeCloseTo(21.80140948635181, 12);
    expect(result.oneIn).toBeCloseTo(2.5, 12);
    expect(result.roofPitchSun).toBeCloseTo(4, 12);
    expect(result.slopeLength).toBeCloseTo(Math.sqrt(116), 12);
  });

  it('下り勾配は符号を保ち、斜面長は正で返す', () => {
    const result = calculateSlope(-1, 20);
    expect(result.percent).toBeCloseTo(-5, 12);
    expect(result.degrees).toBeCloseTo(-2.8624052261117474, 12);
    expect(result.oneIn).toBeCloseTo(-20, 12);
    expect(result.slopeLength).toBeCloseTo(Math.sqrt(401), 12);
  });

  it('水平は0%、角度0度で、1:nはnull', () => {
    const result = calculateSlope(0, 10);
    expect(result.percent).toBe(0);
    expect(result.degrees).toBe(0);
    expect(result.oneIn).toBeNull();
    expect(result.roofPitchSun).toBe(0);
  });

  it('水平距離0、負の水平距離、非数値はnull', () => {
    expect(calculateSlope(1, 0)).toBeNull();
    expect(calculateSlope(1, -10)).toBeNull();
    expect(calculateSlope('1', 10)).toBeNull();
    expect(calculateSlope(Infinity, 10)).toBeNull();
  });
});

describe('各表記から勾配を逆算', () => {
  it('12%勾配を高さと各表記へ換算する', () => {
    const result = slopeFromPercent(12, 5);
    expect(result.rise).toBeCloseTo(0.6, 12);
    expect(result.run).toBe(5);
    expect(result.degrees).toBeCloseTo(6.84277341263094, 12);
  });

  it('45度を100%・1:1へ換算する', () => {
    const result = slopeFromAngle(45, 2);
    expect(result.rise).toBeCloseTo(2, 12);
    expect(result.percent).toBeCloseTo(100, 12);
    expect(result.oneIn).toBeCloseTo(1, 12);
  });

  it('4寸勾配を40%へ換算する', () => {
    const result = slopeFromRoofPitch(4, 10);
    expect(result.rise).toBeCloseTo(4, 12);
    expect(result.percent).toBeCloseTo(40, 12);
    expect(result.degrees).toBeCloseTo(21.80140948635181, 12);
  });

  it('角度は-90度より大きく90度未満、水平距離は正に限定する', () => {
    expect(slopeFromAngle(90, 10)).toBeNull();
    expect(slopeFromAngle(-90, 10)).toBeNull();
    expect(slopeFromAngle(10, 0)).toBeNull();
    expect(slopeFromPercent(NaN, 10)).toBeNull();
    expect(slopeFromRoofPitch(4, -1)).toBeNull();
  });
});
