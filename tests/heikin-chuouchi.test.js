import { describe, expect, it } from 'vitest';
import {
  parseNumberList,
  centralTendencyStatistics,
} from '../src/lib/heikin-chuouchi.js';

describe('parseNumberList（平均・中央値ツールの入力解析）', () => {
  it('Excel列、カンマ、全角区切り、小数、負数を受け付ける', () => {
    expect(parseNumberList('1.5\n-2, 3、4')).toEqual([1.5, -2, 3, 4]);
  });

  it('空入力と不正値はnull', () => {
    expect(parseNumberList('')).toBeNull();
    expect(parseNumberList('1, abc, 3')).toBeNull();
  });
});

describe('centralTendencyStatistics（代表値と四分位数）', () => {
  it('代表例の平均・中央値・最頻値・五数要約を返す', () => {
    const result = centralTendencyStatistics([2, 4, 4, 4, 5, 5, 7, 9]);

    expect(result.count).toBe(8);
    expect(result.sum).toBe(40);
    expect(result.mean).toBe(5);
    expect(result.median).toBe(4.5);
    expect(result.modes).toEqual([4]);
    expect(result.modeFrequency).toBe(3);
    expect(result.min).toBe(2);
    expect(result.firstQuartile).toBe(4);
    expect(result.thirdQuartile).toBe(6);
    expect(result.max).toBe(9);
    expect(result.interquartileRange).toBe(2);
    expect(result.range).toBe(7);
    expect(result.sorted).toEqual([2, 4, 4, 4, 5, 5, 7, 9]);
  });

  it('奇数個では全体の中央値を除いて上下半分の四分位数を求める', () => {
    const result = centralTendencyStatistics([5, 1, 4, 2, 3]);

    expect(result.sorted).toEqual([1, 2, 3, 4, 5]);
    expect(result.median).toBe(3);
    expect(result.firstQuartile).toBe(1.5);
    expect(result.thirdQuartile).toBe(4.5);
    expect(result.interquartileRange).toBe(3);
  });

  it('同率の最頻値が複数ある場合は昇順ですべて返す', () => {
    const result = centralTendencyStatistics([3, 2, 1, 2, 1]);

    expect(result.modes).toEqual([1, 2]);
    expect(result.modeFrequency).toBe(2);
    expect(result.frequencyRows).toEqual([
      { value: 1, count: 2 },
      { value: 2, count: 2 },
      { value: 3, count: 1 },
    ]);
  });

  it('すべて1回だけなら最頻値なしとする', () => {
    const result = centralTendencyStatistics([1, 2, 3, 4]);

    expect(result.modes).toEqual([]);
    expect(result.modeFrequency).toBe(1);
  });

  it('1個だけのデータでも五数要約を返す', () => {
    const result = centralTendencyStatistics([42]);

    expect(result.mean).toBe(42);
    expect(result.median).toBe(42);
    expect(result.firstQuartile).toBe(42);
    expect(result.thirdQuartile).toBe(42);
    expect(result.modes).toEqual([]);
  });

  it('全値が同じならその値を最頻値にする', () => {
    const result = centralTendencyStatistics([5, 5, 5, 5]);

    expect(result.modes).toEqual([5]);
    expect(result.modeFrequency).toBe(4);
    expect(result.firstQuartile).toBe(5);
    expect(result.thirdQuartile).toBe(5);
  });

  it('不正な配列はnull', () => {
    expect(centralTendencyStatistics([])).toBeNull();
    expect(centralTendencyStatistics('1,2,3')).toBeNull();
    expect(centralTendencyStatistics([1, NaN])).toBeNull();
    expect(centralTendencyStatistics([1, Infinity])).toBeNull();
  });
});
