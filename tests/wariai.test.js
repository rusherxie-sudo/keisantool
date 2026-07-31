import { describe, it, expect } from 'vitest';
import { percentOf, valueFromPercent, baseFromPercent, ratio, discountedPrice, changeRate, buaiToPercent, percentToBuai } from '../src/lib/wariai.js';

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

describe('baseFromPercent(A が ○% なら全体はいくら？)', () => {
  it('30 が 25% なら全体は 120', () => {
    expect(baseFromPercent(30, 25)).toBe(120);
  });

  it('75 が 12.5% なら全体は 600', () => {
    expect(baseFromPercent(75, 12.5)).toBe(600);
  });

  it('小数第2位で丸め: 10 が 3% なら全体は 333.33', () => {
    expect(baseFromPercent(10, 3)).toBe(333.33);
  });

  it('部分が0なら全体は0', () => {
    expect(baseFromPercent(0, 25)).toBe(0);
  });

  it('割合0%は逆算できない → null', () => {
    expect(baseFromPercent(30, 0)).toBeNull();
  });

  it('空文字・負数・NaN → null', () => {
    expect(baseFromPercent('', 25)).toBeNull();
    expect(baseFromPercent(30, '')).toBeNull();
    expect(baseFromPercent(-30, 25)).toBeNull();
    expect(baseFromPercent(30, -25)).toBeNull();
    expect(baseFromPercent(NaN, 25)).toBeNull();
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

describe('changeRate(増減率・変化率)', () => {
  it('100 → 120 は +20%', () => {
    expect(changeRate(100, 120)).toBe(20);
  });

  it('200 → 150 は -25%', () => {
    expect(changeRate(200, 150)).toBe(-25);
  });

  it('変化なし 50 → 50 は 0%', () => {
    expect(changeRate(50, 50)).toBe(0);
  });

  it('倍増 100 → 300 は +200%', () => {
    expect(changeRate(100, 300)).toBe(200);
  });

  it('小数2位で丸め: 3 → 4 は +33.33%', () => {
    expect(changeRate(3, 4)).toBe(33.33);
  });

  it('変化前が0（ゼロ除算）→ null', () => {
    expect(changeRate(0, 100)).toBeNull();
  });

  it('変化後が負数でも変化前が正なら計算可: 100 → 0 は -100%', () => {
    expect(changeRate(100, 0)).toBe(-100);
  });

  it('空文字 → null', () => {
    expect(changeRate('', 120)).toBeNull();
    expect(changeRate(100, '')).toBeNull();
  });

  it('NaN → null', () => {
    expect(changeRate(NaN, 120)).toBeNull();
    expect(changeRate(100, NaN)).toBeNull();
  });
});

describe('buaiToPercent(歩合 → パーセント)', () => {
  it('3割5分 → 35%', () => {
    expect(buaiToPercent(3, 5, 0)).toBe(35);
  });

  it('1割 → 10%', () => {
    expect(buaiToPercent(1, 0, 0)).toBe(10);
  });

  it('2割5分3厘 → 25.3%', () => {
    expect(buaiToPercent(2, 5, 3)).toBe(25.3);
  });

  it('0割0分0厘 → 0%', () => {
    expect(buaiToPercent(0, 0, 0)).toBe(0);
  });

  it('10割 → 100%', () => {
    expect(buaiToPercent(10, 0, 0)).toBe(100);
  });

  it('空欄は0扱い: 3割（分・厘空）→ 30%', () => {
    expect(buaiToPercent(3, '', '')).toBe(30);
  });

  it('全て空 → null', () => {
    expect(buaiToPercent('', '', '')).toBeNull();
  });

  it('負数 → null', () => {
    expect(buaiToPercent(-1, 0, 0)).toBeNull();
  });

  it('NaN → null', () => {
    expect(buaiToPercent(NaN, 0, 0)).toBeNull();
  });
});

describe('percentToBuai(パーセント → 歩合)', () => {
  it('35% → 3割5分0厘', () => {
    expect(percentToBuai(35)).toEqual({ wari: 3, bu: 5, rin: 0 });
  });

  it('25.3% → 2割5分3厘', () => {
    expect(percentToBuai(25.3)).toEqual({ wari: 2, bu: 5, rin: 3 });
  });

  it('10% → 1割0分0厘', () => {
    expect(percentToBuai(10)).toEqual({ wari: 1, bu: 0, rin: 0 });
  });

  it('0% → 0割0分0厘', () => {
    expect(percentToBuai(0)).toEqual({ wari: 0, bu: 0, rin: 0 });
  });

  it('100% → 10割0分0厘', () => {
    expect(percentToBuai(100)).toEqual({ wari: 10, bu: 0, rin: 0 });
  });

  it('端数は厘までで丸め: 25.34% → 2割5分3厘', () => {
    expect(percentToBuai(25.34)).toEqual({ wari: 2, bu: 5, rin: 3 });
  });

  it('空文字 → null', () => {
    expect(percentToBuai('')).toBeNull();
  });

  it('負数 → null', () => {
    expect(percentToBuai(-5)).toBeNull();
  });

  it('NaN → null', () => {
    expect(percentToBuai(NaN)).toBeNull();
  });
});
