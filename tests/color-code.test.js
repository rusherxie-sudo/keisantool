import { describe, it, expect } from 'vitest';
import {
  hexToRgb,
  rgbToHex,
  rgbToHsl,
  hslToRgb,
  resistorValue,
} from '../src/lib/color-code.js';

describe('hexToRgb', () => {
  it('6桁・先頭#あり', () => {
    expect(hexToRgb('#1e3a5f')).toEqual({ r: 30, g: 58, b: 95 });
  });
  it('6桁・先頭#なし', () => {
    expect(hexToRgb('1e3a5f')).toEqual({ r: 30, g: 58, b: 95 });
  });
  it('大文字も扱える', () => {
    expect(hexToRgb('#1E3A5F')).toEqual({ r: 30, g: 58, b: 95 });
  });
  it('3桁ショートハンド（#abc）', () => {
    expect(hexToRgb('#abc')).toEqual({ r: 170, g: 187, b: 204 });
  });
  it('3桁ショートハンド（先頭#なし）', () => {
    expect(hexToRgb('fff')).toEqual({ r: 255, g: 255, b: 255 });
  });
  it('黒・白', () => {
    expect(hexToRgb('#000000')).toEqual({ r: 0, g: 0, b: 0 });
    expect(hexToRgb('#ffffff')).toEqual({ r: 255, g: 255, b: 255 });
  });
  it('非16進文字はnull', () => {
    expect(hexToRgb('#12345g')).toBeNull();
    expect(hexToRgb('xyz')).toBeNull();
  });
  it('桁数不正はnull', () => {
    expect(hexToRgb('#1234')).toBeNull();
    expect(hexToRgb('#12')).toBeNull();
    expect(hexToRgb('')).toBeNull();
  });
  it('数値以外（null/undefined）はnull', () => {
    expect(hexToRgb(null)).toBeNull();
    expect(hexToRgb(undefined)).toBeNull();
    expect(hexToRgb(123)).toBeNull();
  });
});

describe('rgbToHex', () => {
  it('基本変換（小文字）', () => {
    expect(rgbToHex(30, 58, 95)).toBe('#1e3a5f');
  });
  it('黒・白', () => {
    expect(rgbToHex(0, 0, 0)).toBe('#000000');
    expect(rgbToHex(255, 255, 255)).toBe('#ffffff');
  });
  it('0埋め（1桁の値）', () => {
    expect(rgbToHex(1, 2, 3)).toBe('#010203');
  });
  it('範囲外は0-255にクランプ', () => {
    expect(rgbToHex(-10, 300, 128)).toBe('#00ff80');
  });
  it('小数は丸める', () => {
    expect(rgbToHex(30.4, 57.6, 95)).toBe('#1e3a5f');
  });
});

describe('hexToRgb ⇄ rgbToHex 往復', () => {
  it('往復で一致する', () => {
    const hex = '#1e3a5f';
    const rgb = hexToRgb(hex);
    expect(rgbToHex(rgb.r, rgb.g, rgb.b)).toBe(hex);
  });
});

describe('rgbToHsl', () => {
  it('黒', () => {
    expect(rgbToHsl(0, 0, 0)).toEqual({ h: 0, s: 0, l: 0 });
  });
  it('白', () => {
    expect(rgbToHsl(255, 255, 255)).toEqual({ h: 0, s: 0, l: 100 });
  });
  it('純赤', () => {
    expect(rgbToHsl(255, 0, 0)).toEqual({ h: 0, s: 100, l: 50 });
  });
  it('純緑', () => {
    expect(rgbToHsl(0, 255, 0)).toEqual({ h: 120, s: 100, l: 50 });
  });
  it('純青', () => {
    expect(rgbToHsl(0, 0, 255)).toEqual({ h: 240, s: 100, l: 50 });
  });
  it('グレー（彩度0）', () => {
    expect(rgbToHsl(128, 128, 128)).toEqual({ h: 0, s: 0, l: 50 });
  });
  it('h/s/lは整数で返る', () => {
    const hsl = rgbToHsl(30, 58, 95);
    expect(Number.isInteger(hsl.h)).toBe(true);
    expect(Number.isInteger(hsl.s)).toBe(true);
    expect(Number.isInteger(hsl.l)).toBe(true);
  });
});

describe('hslToRgb', () => {
  it('黒', () => {
    expect(hslToRgb(0, 0, 0)).toEqual({ r: 0, g: 0, b: 0 });
  });
  it('白', () => {
    expect(hslToRgb(0, 0, 100)).toEqual({ r: 255, g: 255, b: 255 });
  });
  it('純赤', () => {
    expect(hslToRgb(0, 100, 50)).toEqual({ r: 255, g: 0, b: 0 });
  });
  it('純緑', () => {
    expect(hslToRgb(120, 100, 50)).toEqual({ r: 0, g: 255, b: 0 });
  });
  it('純青', () => {
    expect(hslToRgb(240, 100, 50)).toEqual({ r: 0, g: 0, b: 255 });
  });
  it('グレー', () => {
    expect(hslToRgb(0, 0, 50)).toEqual({ r: 128, g: 128, b: 128 });
  });
});

describe('rgbToHsl ⇄ hslToRgb 往復', () => {
  it('代表色で往復して概ね一致', () => {
    const cases = [
      [255, 0, 0],
      [0, 255, 0],
      [0, 0, 255],
      [30, 58, 95],
    ];
    for (const [r, g, b] of cases) {
      const { h, s, l } = rgbToHsl(r, g, b);
      const back = hslToRgb(h, s, l);
      expect(Math.abs(back.r - r)).toBeLessThanOrEqual(2);
      expect(Math.abs(back.g - g)).toBeLessThanOrEqual(2);
      expect(Math.abs(back.b - b)).toBeLessThanOrEqual(2);
    }
  });
});

describe('resistorValue（4色環抵抗）', () => {
  it('茶黒赤金 = 1kΩ ±5%', () => {
    const r = resistorValue('brown', 'black', 'red', 'gold');
    expect(r.ohms).toBe(1000);
    expect(r.display).toBe('1kΩ');
    expect(r.tolerance).toBe('±5%');
  });
  it('黄紫赤金 = 4.7kΩ ±5%', () => {
    const r = resistorValue('yellow', 'violet', 'red', 'gold');
    expect(r.ohms).toBe(4700);
    expect(r.display).toBe('4.7kΩ');
    expect(r.tolerance).toBe('±5%');
  });
  it('茶黒黒金 = 10Ω ±5%', () => {
    const r = resistorValue('brown', 'black', 'black', 'gold');
    expect(r.ohms).toBe(10);
    expect(r.display).toBe('10Ω');
  });
  it('茶黒橙銀 = 10kΩ ±10%', () => {
    const r = resistorValue('brown', 'black', 'orange', 'silver');
    expect(r.ohms).toBe(10000);
    expect(r.display).toBe('10kΩ');
    expect(r.tolerance).toBe('±10%');
  });
  it('茶黒緑無 = 1MΩ', () => {
    const r = resistorValue('brown', 'black', 'green', 'gold');
    expect(r.ohms).toBe(1000000);
    expect(r.display).toBe('1MΩ');
  });
  it('乗数 金（×0.1）：茶黒金金 = 1Ω', () => {
    const r = resistorValue('brown', 'black', 'gold', 'gold');
    expect(r.ohms).toBe(1);
    expect(r.display).toBe('1Ω');
  });
  it('茶 許容差 ±1%', () => {
    const r = resistorValue('brown', 'black', 'red', 'brown');
    expect(r.tolerance).toBe('±1%');
  });
  it('不正な色はnull', () => {
    expect(resistorValue('pink', 'black', 'red', 'gold')).toBeNull();
    expect(resistorValue('brown', 'black', 'gold', 'pink')).toBeNull();
  });
  it('1桁目に乗数専用色（金）は不正→null', () => {
    expect(resistorValue('gold', 'black', 'red', 'gold')).toBeNull();
  });
});
