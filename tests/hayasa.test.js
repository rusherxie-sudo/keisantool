import { describe, expect, it } from 'vitest';
import {
  calculateDistance,
  calculateSpeed,
  calculateTime,
  durationToSeconds,
  speedToMetersPerSecond,
} from '../src/lib/hayasa.js';

describe('durationToSeconds', () => {
  it('时、分、秒换算为总秒数', () => {
    expect(durationToSeconds(1, 30, 15)).toBe(5415);
  });

  it('拒绝60分、负数与非整数', () => {
    expect(durationToSeconds(0, 60, 0)).toBeNull();
    expect(durationToSeconds(-1, 0, 0)).toBeNull();
    expect(durationToSeconds(0, 0.5, 0)).toBeNull();
  });
});

describe('speedToMetersPerSecond', () => {
  it('支持时速、秒速与每分米数', () => {
    expect(speedToMetersPerSecond(36, 'kmh')).toBeCloseTo(10);
    expect(speedToMetersPerSecond(10, 'mps')).toBeCloseTo(10);
    expect(speedToMetersPerSecond(600, 'mpm')).toBeCloseTo(10);
  });

  it('拒绝0、非数值与未知单位', () => {
    expect(speedToMetersPerSecond(0, 'kmh')).toBeNull();
    expect(speedToMetersPerSecond('abc', 'kmh')).toBeNull();
    expect(speedToMetersPerSecond(10, 'mph')).toBeNull();
  });
});

describe('calculateSpeed', () => {
  it('10kmを30分で進む速さは時速20km', () => {
    const result = calculateSpeed(10, 'km', 0, 30, 0);
    expect(result.distanceMeters).toBe(10000);
    expect(result.durationSeconds).toBe(1800);
    expect(result.kilometersPerHour).toBeCloseTo(20);
    expect(result.metersPerSecond).toBeCloseTo(50 / 9);
    expect(result.metersPerMinute).toBeCloseTo(1000 / 3);
    expect(result.paceSecondsPerKm).toBe(180);
  });

  it('100mを10秒で進む速さは時速36km', () => {
    const result = calculateSpeed(100, 'm', 0, 0, 10);
    expect(result.kilometersPerHour).toBeCloseTo(36);
    expect(result.paceSecondsPerKm).toBe(100);
  });

  it('距离或时间为0时不能计算', () => {
    expect(calculateSpeed(0, 'km', 0, 30, 0)).toBeNull();
    expect(calculateSpeed(10, 'km', 0, 0, 0)).toBeNull();
  });
});

describe('calculateDistance', () => {
  it('時速60kmで1時間30分なら90km', () => {
    const result = calculateDistance(60, 'kmh', 1, 30, 0);
    expect(result.distanceMeters).toBeCloseTo(90000);
    expect(result.distanceKilometers).toBeCloseTo(90);
  });

  it('秒速5mで2分なら600m', () => {
    const result = calculateDistance(5, 'mps', 0, 2, 0);
    expect(result.distanceMeters).toBeCloseTo(600);
  });

  it('速度或时间无效时返回null', () => {
    expect(calculateDistance(0, 'kmh', 1, 0, 0)).toBeNull();
    expect(calculateDistance(10, 'kmh', 0, 60, 0)).toBeNull();
  });
});

describe('calculateTime', () => {
  it('10kmを時速20kmで進む時間は30分', () => {
    const result = calculateTime(10, 'km', 20, 'kmh');
    expect(result.durationSeconds).toBeCloseTo(1800);
    expect(result.hours).toBe(0);
    expect(result.minutes).toBe(30);
    expect(result.seconds).toBe(0);
  });

  it('100mを秒速5mで進む時間は20秒', () => {
    const result = calculateTime(100, 'm', 5, 'mps');
    expect(result.durationSeconds).toBeCloseTo(20);
    expect(result.hours).toBe(0);
    expect(result.minutes).toBe(0);
    expect(result.seconds).toBe(20);
  });

  it('距离、速度或单位无效时返回null', () => {
    expect(calculateTime(0, 'km', 20, 'kmh')).toBeNull();
    expect(calculateTime(10, 'mile', 20, 'kmh')).toBeNull();
    expect(calculateTime(10, 'km', 0, 'kmh')).toBeNull();
  });
});
