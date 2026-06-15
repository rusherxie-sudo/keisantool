import { describe, it, expect } from 'vitest';
import { convert, UNITS } from '../src/lib/tani.js';

const close = (a, b, eps = 1e-6) => Math.abs(a - b) <= eps;

describe('長さ', () => {
  it('1 inch = 2.54 cm', () => {
    expect(close(convert('length', 1, 'inch', 'cm'), 2.54)).toBe(true);
  });
  it('1 km = 1000 m', () => {
    expect(close(convert('length', 1, 'km', 'm'), 1000)).toBe(true);
  });
  it('1 mile = 1609.344 m', () => {
    expect(close(convert('length', 1, 'mile', 'm'), 1609.344)).toBe(true);
  });
});

describe('重さ', () => {
  it('1 kg = 1000 g', () => {
    expect(close(convert('weight', 1, 'kg', 'g'), 1000)).toBe(true);
  });
  it('1 t = 1000 kg', () => {
    expect(close(convert('weight', 1, 't', 'kg'), 1000)).toBe(true);
  });
});

describe('面積', () => {
  it('1 坪 ≈ 3.306 m²', () => {
    expect(close(convert('area', 1, 'tsubo', 'm2'), 3.305785, 1e-3)).toBe(true);
  });
  it('1 ha = 10000 m²', () => {
    expect(close(convert('area', 1, 'ha', 'm2'), 10000)).toBe(true);
  });
});

describe('体積', () => {
  it('1 L = 1000 ml', () => {
    expect(close(convert('volume', 1, 'L', 'ml'), 1000)).toBe(true);
  });
  it('1 m³ = 1000 L', () => {
    expect(close(convert('volume', 1, 'm3', 'L'), 1000)).toBe(true);
  });
});

describe('速さ', () => {
  it('100 km/h ≈ 27.78 m/s', () => {
    expect(close(convert('speed', 100, 'kmh', 'ms'), 27.7778, 1e-2)).toBe(true);
  });
  it('1 knot ≈ 0.514444 m/s', () => {
    expect(close(convert('speed', 1, 'knot', 'ms'), 0.514444, 1e-4)).toBe(true);
  });
});

describe('温度', () => {
  it('0℃ = 32℉', () => {
    expect(close(convert('temperature', 0, 'c', 'f'), 32)).toBe(true);
  });
  it('0℃ = 273.15 K', () => {
    expect(close(convert('temperature', 0, 'c', 'k'), 273.15)).toBe(true);
  });
  it('32℉ = 0℃', () => {
    expect(close(convert('temperature', 32, 'f', 'c'), 0)).toBe(true);
  });
  it('273.15 K = 0℃', () => {
    expect(close(convert('temperature', 273.15, 'k', 'c'), 0)).toBe(true);
  });
  it('100℃ = 212℉', () => {
    expect(close(convert('temperature', 100, 'c', 'f'), 212)).toBe(true);
  });
});

describe('不正入力', () => {
  it('未知カテゴリは null', () => {
    expect(convert('foo', 1, 'a', 'b')).toBe(null);
  });
  it('未知単位は null', () => {
    expect(convert('length', 1, 'mm', 'xyz')).toBe(null);
  });
  it('数値でない値は null', () => {
    expect(convert('length', 'abc', 'm', 'cm')).toBe(null);
  });
  it('空文字は null', () => {
    expect(convert('length', '', 'm', 'cm')).toBe(null);
  });
});

describe('UNITS エクスポート', () => {
  it('各カテゴリが配列を持つ', () => {
    for (const cat of ['length', 'weight', 'area', 'volume', 'temperature', 'speed']) {
      expect(Array.isArray(UNITS[cat])).toBe(true);
      expect(UNITS[cat].length).toBeGreaterThan(0);
      expect(UNITS[cat][0]).toHaveProperty('id');
      expect(UNITS[cat][0]).toHaveProperty('label');
    }
  });
});
