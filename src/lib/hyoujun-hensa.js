// 標準偏差・分散などの記述統計量を計算する純関数。
// 母集団は偏差平方和を n、標本は n-1 で割る。
// 表示用の丸めはページ側で行い、計算途中では丸めない。

function isFiniteNumber(value) {
  return typeof value === 'number' && Number.isFinite(value);
}

// 浮動小数点の加算誤差を抑えるKahanの補償和。
function compensatedSum(values) {
  let sum = 0;
  let compensation = 0;
  for (const value of values) {
    const adjusted = value - compensation;
    const next = sum + adjusted;
    compensation = (next - sum) - adjusted;
    sum = next;
  }
  return sum;
}

// カンマ、空白、改行、タブ、全角読点・カンマ区切りを数値配列にする。
// 数値でない要素を1つでも含む場合は、黙って無視せずnullを返す。
export function parseNumberList(text) {
  if (typeof text !== 'string' || text.trim() === '') return null;
  const tokens = text.trim().split(/[\s,、，]+/).filter(Boolean);
  if (tokens.length === 0) return null;
  const values = tokens.map(Number);
  return values.every(Number.isFinite) ? values : null;
}

// 母集団・標本の両方を含む基本統計量を返す。
export function descriptiveStatistics(values) {
  if (!Array.isArray(values) || values.length === 0 || !values.every(isFiniteNumber)) {
    return null;
  }

  const count = values.length;
  const sum = compensatedSum(values);
  const mean = sum / count;
  const deviations = values.map((value) => value - mean);
  const squaredDeviations = deviations.map((value) => value * value);
  const sumSquaredDeviations = compensatedSum(squaredDeviations);
  const populationVariance = sumSquaredDeviations / count;
  const populationStandardDeviation = Math.sqrt(populationVariance);
  const sampleVariance = count > 1 ? sumSquaredDeviations / (count - 1) : null;
  const sampleStandardDeviation = sampleVariance === null ? null : Math.sqrt(sampleVariance);
  const standardError = sampleStandardDeviation === null
    ? null
    : sampleStandardDeviation / Math.sqrt(count);

  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(count / 2);
  const median = count % 2 === 1
    ? sorted[middle]
    : (sorted[middle - 1] + sorted[middle]) / 2;
  const min = sorted[0];
  const max = sorted[count - 1];

  return {
    count,
    sum,
    mean,
    median,
    min,
    max,
    range: max - min,
    sumSquaredDeviations,
    populationVariance,
    populationStandardDeviation,
    sampleVariance,
    sampleStandardDeviation,
    standardError,
  };
}

// 値ごとの偏差と偏差平方を、入力順を保ったまま返す。
export function deviationRows(values) {
  const stats = descriptiveStatistics(values);
  if (stats === null) return null;
  return values.map((value, index) => {
    const rawDeviation = value - stats.mean;
    const deviation = Object.is(rawDeviation, -0) ? 0 : rawDeviation;
    return {
      index: index + 1,
      value,
      deviation,
      squaredDeviation: deviation * deviation,
    };
  });
}
