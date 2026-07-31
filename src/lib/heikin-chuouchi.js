// 平均値・中央値・最頻値・四分位数を計算する純関数。
// 入力解析と補償和による平均は、標準偏差ツールの検証済み実装を再利用する。
// 四分位数は、奇数個では全体の中央値を除いて上下半分の中央値を求める。

import {
  parseNumberList,
  descriptiveStatistics,
} from './hyoujun-hensa.js';

export { parseNumberList };

function medianOfSorted(values) {
  if (values.length === 0) return null;
  const middle = Math.floor(values.length / 2);
  return values.length % 2 === 1
    ? values[middle]
    : (values[middle - 1] + values[middle]) / 2;
}

export function centralTendencyStatistics(values) {
  const base = descriptiveStatistics(values);
  if (base === null) return null;

  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  const lowerHalf = sorted.length === 1
    ? sorted
    : sorted.slice(0, middle);
  const upperHalf = sorted.length === 1
    ? sorted
    : sorted.slice(sorted.length % 2 === 1 ? middle + 1 : middle);
  const firstQuartile = medianOfSorted(lowerHalf);
  const thirdQuartile = medianOfSorted(upperHalf);

  const frequencies = new Map();
  for (const value of sorted) {
    frequencies.set(value, (frequencies.get(value) ?? 0) + 1);
  }
  const frequencyRows = [...frequencies.entries()].map(([value, count]) => ({
    value,
    count,
  }));
  const modeFrequency = Math.max(...frequencyRows.map((row) => row.count));
  const modes = modeFrequency > 1
    ? frequencyRows.filter((row) => row.count === modeFrequency).map((row) => row.value)
    : [];

  return {
    count: base.count,
    sum: base.sum,
    mean: base.mean,
    median: base.median,
    modes,
    modeFrequency,
    min: base.min,
    firstQuartile,
    thirdQuartile,
    max: base.max,
    range: base.range,
    interquartileRange: thirdQuartile - firstQuartile,
    sorted,
    frequencyRows,
  };
}
