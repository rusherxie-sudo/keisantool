import { describe, expect, it } from 'vitest';
import {
  parseNumberList,
  descriptiveStatistics,
  deviationRows,
} from '../src/lib/hyoujun-hensa.js';

describe('parseNumberList（数値リストの解析）', () => {
  it('カンマ・空白・改行・全角区切りを受け付ける', () => {
    expect(parseNumberList('2, 4\n4　5、7，9')).toEqual([2, 4, 4, 5, 7, 9]);
  });

  it('小数・負数・指数表記を受け付ける', () => {
    expect(parseNumberList('-1.5 0 2.5e2')).toEqual([-1.5, 0, 250]);
  });

  it('空入力または数値でない要素を含む入力はnull', () => {
    expect(parseNumberList('')).toBeNull();
    expect(parseNumberList('1, abc, 3')).toBeNull();
    expect(parseNumberList('1, Infinity')).toBeNull();
  });
});

describe('descriptiveStatistics（記述統計量）', () => {
  it('代表例：2,4,4,4,5,5,7,9 の母分散4・母標準偏差2', () => {
    const result = descriptiveStatistics([2, 4, 4, 4, 5, 5, 7, 9]);
    expect(result.count).toBe(8);
    expect(result.sum).toBe(40);
    expect(result.mean).toBe(5);
    expect(result.median).toBe(4.5);
    expect(result.min).toBe(2);
    expect(result.max).toBe(9);
    expect(result.range).toBe(7);
    expect(result.sumSquaredDeviations).toBe(32);
    expect(result.populationVariance).toBe(4);
    expect(result.populationStandardDeviation).toBe(2);
  });

  it('同じ代表例の標本分散は32÷7、標本標準偏差はその平方根', () => {
    const result = descriptiveStatistics([2, 4, 4, 4, 5, 5, 7, 9]);
    expect(result.sampleVariance).toBeCloseTo(32 / 7, 12);
    expect(result.sampleStandardDeviation).toBeCloseTo(Math.sqrt(32 / 7), 12);
    expect(result.standardError).toBeCloseTo(Math.sqrt(32 / 7) / Math.sqrt(8), 12);
  });

  it('負数と小数でも計算できる', () => {
    const result = descriptiveStatistics([-1.5, 0, 1.5]);
    expect(result.mean).toBe(0);
    expect(result.median).toBe(0);
    expect(result.populationVariance).toBe(1.5);
    expect(result.populationStandardDeviation).toBeCloseTo(Math.sqrt(1.5), 12);
    expect(result.sampleVariance).toBe(2.25);
    expect(result.sampleStandardDeviation).toBe(1.5);
  });

  it('偶数個・奇数個それぞれの中央値を求める', () => {
    expect(descriptiveStatistics([1, 9, 3, 7]).median).toBe(5);
    expect(descriptiveStatistics([9, 1, 3]).median).toBe(3);
  });

  it('1個だけなら母標準偏差は0、標本値は計算不可', () => {
    const result = descriptiveStatistics([42]);
    expect(result.populationVariance).toBe(0);
    expect(result.populationStandardDeviation).toBe(0);
    expect(result.sampleVariance).toBeNull();
    expect(result.sampleStandardDeviation).toBeNull();
    expect(result.standardError).toBeNull();
  });

  it('全値が同じなら標準偏差は0', () => {
    const result = descriptiveStatistics([5, 5, 5, 5]);
    expect(result.sumSquaredDeviations).toBe(0);
    expect(result.populationStandardDeviation).toBe(0);
    expect(result.sampleStandardDeviation).toBe(0);
  });

  it('大きな基準値を含むデータでも差分精度を保つ', () => {
    const result = descriptiveStatistics([1000000000001, 1000000000002, 1000000000003]);
    expect(result.mean).toBe(1000000000002);
    expect(result.populationVariance).toBeCloseTo(2 / 3, 12);
    expect(result.sampleVariance).toBe(1);
  });

  it('不正な配列はnull', () => {
    expect(descriptiveStatistics([])).toBeNull();
    expect(descriptiveStatistics('1,2,3')).toBeNull();
    expect(descriptiveStatistics([1, NaN, 3])).toBeNull();
    expect(descriptiveStatistics([1, Infinity, 3])).toBeNull();
  });
});

describe('deviationRows（偏差と偏差平方）', () => {
  it('各値の偏差・偏差平方を入力順に返す', () => {
    expect(deviationRows([2, 4, 6])).toEqual([
      { index: 1, value: 2, deviation: -2, squaredDeviation: 4 },
      { index: 2, value: 4, deviation: 0, squaredDeviation: 0 },
      { index: 3, value: 6, deviation: 2, squaredDeviation: 4 },
    ]);
  });

  it('不正な入力はnull', () => {
    expect(deviationRows([])).toBeNull();
    expect(deviationRows([1, 'x'])).toBeNull();
  });
});
