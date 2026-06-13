import { describe, it, expect } from 'vitest';
import { percentOf, valueFromPercent, ratio, discountedPrice } from '../src/lib/wariai.js';

describe('percentOf(A は B の何%？)', () => {
  it('50 は 200 の 25%', () => {
    expect(percentOf(50, 200)).toBe(25);
  });

  it('1 は 3 の 33.33%（小数2位で丸め）', () => {
    expect(percentOf(1, 3)).toBe(33.33);
  });

  it('3 は 8 の 37.5%', () => {
    expect(percentOf(3, 8)).toBe(37.5);
  });

  it('200 は 100 の 200%（100超もOK）', () => {
    expect(percentOf(200, 100)).toBe(200);
  });

  it('0 は 100 の 0%', () => {
    expect(percentOf(0, 100)).toBe(0);
  });

  it('B が 0（ゼロ除算）→ null', () => {
    expect(percentOf(50, 0)).toBeNull();
  });

  it('空文字 → null', () => {
    expect(percentOf('', 100)).toBeNull();
    expect(percentOf(50, '')).toBeNull();
  });

  it('NaN → null', () => {
    expect(percentOf(NaN, 100)).toBeNull();
  });

  it('負数 → null', () => {
    expect(percentOf(-10, 100)).toBeNull();
    expect(percentOf(10, -100)).toBeNull();
  });
});

describe('valueFromPercent(A の ○% はいくら？)', () => {
  it('200 の 25% は 50', () => {
    expect(valueFromPercent(200, 25)).toBe(50);
  });

  it('3000 の 8% は 240', () => {
    expect(valueFromPercent(3000, 8)).toBe(240);
  });

  it('1000 の 0% は 0', () => {
    expect(valueFromPercent(1000, 0)).toBe(0);
  });

  it('100 の 150% は 150（100超もOK）', () => {
    expect(valueFromPercent(100, 150)).toBe(150);
  });

  it('小数は2位で丸め: 333 の 33% は 109.89', () => {
    expect(valueFromPercent(333, 33)).toBe(109.89);
  });

  it('空文字 → null', () => {
    expect(valueFromPercent('', 25)).toBeNull();
    expect(valueFromPercent(200, '')).toBeNull();
  });

  it('NaN → null', () => {
    expect(valueFromPercent(NaN, 25)).toBeNull();
  });

  it('負数 → null', () => {
    expect(valueFromPercent(-200, 25)).toBeNull();
    expect(valueFromPercent(200, -25)).toBeNull();
  });
});

describe('ratio(A:B を簡単な比に約分)', () => {
  it('12:8 → 3:2', () => {
    expect(ratio(12, 8)).toEqual({ a: 3, b: 2 });
  });

  it('100:25 → 4:1', () => {
    expect(ratio(100, 25)).toEqual({ a: 4, b: 1 });
  });

  it('既約の 3:5 はそのまま', () => {
    expect(ratio(3, 5)).toEqual({ a: 3, b: 5 });
  });

  it('同じ数 7:7 → 1:1', () => {
    expect(ratio(7, 7)).toEqual({ a: 1, b: 1 });
  });

  it('片方が0: 0:5 → 0:1', () => {
    expect(ratio(0, 5)).toEqual({ a: 0, b: 1 });
  });

  it('片方が0: 6:0 → 1:0', () => {
    expect(ratio(6, 0)).toEqual({ a: 1, b: 0 });
  });

  it('両方0 → null', () => {
    expect(ratio(0, 0)).toBeNull();
  });

  it('空文字 → null', () => {
    expect(ratio('', 8)).toBeNull();
    expect(ratio(12, '')).toBeNull();
  });

  it('NaN → null', () => {
    expect(ratio(NaN, 8)).toBeNull();
  });

  it('負数 → null', () => {
    expect(ratio(-12, 8)).toBeNull();
  });
});

describe('discountedPrice(○%OFF の価格・金額は切り捨て)', () => {
  it('定価5000円 30%OFF → 割引後3500, 割引額1500', () => {
    expect(discountedPrice(5000, 30)).toEqual({ discounted: 3500, discount: 1500 });
  });

  it('端数は切り捨て: 定価980円 33%OFF → 割引額floor(323.4)=323, 割引後657', () => {
    expect(discountedPrice(980, 33)).toEqual({ discounted: 657, discount: 323 });
  });

  it('0%OFF → 定価のまま', () => {
    expect(discountedPrice(5000, 0)).toEqual({ discounted: 5000, discount: 0 });
  });

  it('100%OFF → 0円', () => {
    expect(discountedPrice(5000, 100)).toEqual({ discounted: 0, discount: 5000 });
  });

  it('空文字 → null', () => {
    expect(discountedPrice('', 30)).toBeNull();
    expect(discountedPrice(5000, '')).toBeNull();
  });

  it('NaN → null', () => {
    expect(discountedPrice(NaN, 30)).toBeNull();
  });

  it('負数 → null', () => {
    expect(discountedPrice(-5000, 30)).toBeNull();
    expect(discountedPrice(5000, -30)).toBeNull();
  });

  it('割引率100超 → null', () => {
    expect(discountedPrice(5000, 150)).toBeNull();
  });
});
