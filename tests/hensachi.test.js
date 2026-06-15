import { describe, it, expect } from 'vitest';
import { hensachi, erf, normalCdf, topPercent, estimateRank, statsFromScores, deviationsFromScores } from '../src/lib/hensachi.js';

describe('hensachi(偏差値計算)', () => {
  it('得点が平均と同じ → 偏差値50.0', () => {
    expect(hensachi(60, 60, 10)).toBe(50.0);
  });

  it('平均+1標準偏差 → 偏差値60.0', () => {
    expect(hensachi(70, 60, 10)).toBe(60.0);
  });

  it('平均-1標準偏差 → 偏差値40.0', () => {
    expect(hensachi(50, 60, 10)).toBe(40.0);
  });

  it('平均+2標準偏差 → 偏差値70.0', () => {
    expect(hensachi(80, 60, 10)).toBe(70.0);
  });

  it('小数1位に丸める: 得点75,平均60,標準偏差9 → 66.7', () => {
    // (75-60)/9*10+50 = 16.666...+50 = 66.666... → 66.7
    expect(hensachi(75, 60, 9)).toBe(66.7);
  });

  it('標準偏差=0 のときは安全値50.0を返す', () => {
    expect(hensachi(80, 60, 0)).toBe(50.0);
  });

  it('空文字（得点）→ null', () => {
    expect(hensachi('', 60, 10)).toBeNull();
  });

  it('空文字（平均）→ null', () => {
    expect(hensachi(60, '', 10)).toBeNull();
  });

  it('空文字（標準偏差）→ null', () => {
    expect(hensachi(60, 60, '')).toBeNull();
  });

  it('NaN → null', () => {
    expect(hensachi(NaN, 60, 10)).toBeNull();
  });

  it('標準偏差が負数 → null', () => {
    expect(hensachi(70, 60, -10)).toBeNull();
  });

  it('得点が負数でも計算する（テストの点はマイナスがあり得ないが数式上は有効）', () => {
    // (-10-60)/10*10+50 = -70+50 = -20.0
    expect(hensachi(-10, 60, 10)).toBe(-20.0);
  });
});

describe('erf(誤差関数 / Abramowitz-Stegun 7.1.26 近似)', () => {
  it('erf(0) = 0', () => {
    expect(erf(0)).toBeCloseTo(0, 6);
  });

  it('erf(1) ≈ 0.8427', () => {
    expect(erf(1)).toBeCloseTo(0.8427, 3);
  });

  it('erf(-1) ≈ -0.8427（奇関数）', () => {
    expect(erf(-1)).toBeCloseTo(-0.8427, 3);
  });

  it('erf(2) ≈ 0.9953', () => {
    expect(erf(2)).toBeCloseTo(0.9953, 3);
  });
});

describe('normalCdf(標準正規分布の累積分布関数 Φ)', () => {
  it('Φ(0) ≈ 0.5', () => {
    expect(normalCdf(0)).toBeCloseTo(0.5, 4);
  });

  it('Φ(1) ≈ 0.8413', () => {
    expect(normalCdf(1)).toBeCloseTo(0.8413, 3);
  });

  it('Φ(2) ≈ 0.9772', () => {
    expect(normalCdf(2)).toBeCloseTo(0.9772, 3);
  });

  it('Φ(-1) ≈ 0.1587', () => {
    expect(normalCdf(-1)).toBeCloseTo(0.1587, 3);
  });
});

describe('topPercent(偏差値 → 上位パーセント)', () => {
  it('偏差値50 → 上位50%', () => {
    expect(topPercent(50)).toBeCloseTo(50, 2);
  });

  it('偏差値60 → 上位約15.87%', () => {
    expect(topPercent(60)).toBeCloseTo(15.87, 1);
  });

  it('偏差値70 → 上位約2.28%', () => {
    expect(topPercent(70)).toBeCloseTo(2.28, 1);
  });

  it('偏差値40 → 上位約84.13%', () => {
    expect(topPercent(40)).toBeCloseTo(84.13, 1);
  });

  it('空文字 → null', () => {
    expect(topPercent('')).toBeNull();
  });

  it('NaN → null', () => {
    expect(topPercent(NaN)).toBeNull();
  });
});

describe('estimateRank(上位% + 受験者数 → 概算順位)', () => {
  it('偏差値60・受験者10000人 → 上位15.87% → ceil → 1587位', () => {
    expect(estimateRank(60, 10000)).toBe(1587);
  });

  it('偏差値50・受験者1000人 → 500位', () => {
    expect(estimateRank(50, 1000)).toBe(500);
  });

  it('偏差値70・受験者10000人 → ceil(2.275%*10000)=228位', () => {
    expect(estimateRank(70, 10000)).toBe(228);
  });

  it('最低でも1位（切り上げ）: 偏差値80・受験者100人', () => {
    expect(estimateRank(80, 100)).toBe(1);
  });

  it('受験者数が空 → null', () => {
    expect(estimateRank(60, '')).toBeNull();
  });

  it('受験者数が0以下 → null', () => {
    expect(estimateRank(60, 0)).toBeNull();
  });

  it('偏差値が不正 → null', () => {
    expect(estimateRank(NaN, 1000)).toBeNull();
  });
});

describe('statsFromScores(得点リスト → 平均・母集団標準偏差・人数)', () => {
  it('[40,50,60,70,80] → mean=60, sd=√200≈14.142, count=5（母集団σ÷n）', () => {
    const r = statsFromScores([40, 50, 60, 70, 80]);
    expect(r.count).toBe(5);
    expect(r.mean).toBeCloseTo(60, 10);
    expect(r.sd).toBeCloseTo(Math.sqrt(200), 10); // 14.142135623730951
  });

  it('全員同じ得点 [50,50,50] → mean=50, sd=0, count=3', () => {
    const r = statsFromScores([50, 50, 50]);
    expect(r.mean).toBe(50);
    expect(r.sd).toBe(0);
    expect(r.count).toBe(3);
  });

  it('1件 [70] → mean=70, sd=0, count=1', () => {
    const r = statsFromScores([70]);
    expect(r.mean).toBe(70);
    expect(r.sd).toBe(0);
    expect(r.count).toBe(1);
  });

  it('小数を含む [1,2,3,4] → mean=2.5, sd=√1.25', () => {
    // 分散 = ((1.5)^2+(0.5)^2+(0.5)^2+(1.5)^2)/4 = (2.25+0.25+0.25+2.25)/4 = 5/4 = 1.25
    const r = statsFromScores([1, 2, 3, 4]);
    expect(r.mean).toBeCloseTo(2.5, 10);
    expect(r.sd).toBeCloseTo(Math.sqrt(1.25), 10);
    expect(r.count).toBe(4);
  });

  it('空配列 → null', () => {
    expect(statsFromScores([])).toBeNull();
  });

  it('配列でない → null', () => {
    expect(statsFromScores(null)).toBeNull();
    expect(statsFromScores('abc')).toBeNull();
  });

  it('数値に変換できない要素を含む → null', () => {
    expect(statsFromScores([40, 'x', 60])).toBeNull();
  });
});

describe('deviationsFromScores(得点リスト → 各得点の偏差値配列)', () => {
  it('[40,50,60,70,80] → [35.9, 42.9, 50.0, 57.1, 64.1]', () => {
    // mean=60, sd=√200≈14.1421356
    // 40: (40-60)/14.1421356*10+50 = -14.1421356+50 = 35.857... → 35.9
    // 50: -7.0710678+50 = 42.928... → 42.9
    // 60: 50.0
    // 70: 57.071... → 57.1
    // 80: 64.142... → 64.1
    expect(deviationsFromScores([40, 50, 60, 70, 80])).toEqual([35.9, 42.9, 50.0, 57.1, 64.1]);
  });

  it('全員同点 [50,50,50] → 標準偏差0なので全員50.0', () => {
    expect(deviationsFromScores([50, 50, 50])).toEqual([50.0, 50.0, 50.0]);
  });

  it('空配列 → null', () => {
    expect(deviationsFromScores([])).toBeNull();
  });

  it('不正な要素を含む → null', () => {
    expect(deviationsFromScores([40, '', 60])).toBeNull();
  });
});
