// 偏差値計算のロジック（純関数・DOM非依存）。
// 偏差値 = (得点 − 平均点) / 標準偏差 × 10 + 50
// 順位概算は標準正規分布の累積分布関数 Φ を erf 近似で実装する。

// 入力値を有限な数値に変換する。空文字・null・NaN などは null を返す。
function toNum(v) {
  if (v === '' || v === null || v === undefined) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

// 偏差値を計算し、小数第1位に丸めて返す。
// 標準偏差=0 のときは値が定まらないため安全値 50.0 を返す。
// 入力が不正な場合は null を返す（ページ側で非表示にする）。
export function hensachi(score, mean, sd) {
  const s = toNum(score);
  const m = toNum(mean);
  const d = toNum(sd);
  if (s === null || m === null || d === null) return null;
  if (d < 0) return null;
  if (d === 0) return 50.0;
  const value = ((s - m) / d) * 10 + 50;
  return Math.round(value * 10) / 10;
}

// 得点リストから平均・母集団標準偏差・人数を求める。
// 偏差値は集団全体を対象とする統計量なので、母集団標準偏差（分散の分母 = n）を用いる。
// 配列でない／空／数値化できない要素を含む場合は null を返す。
export function statsFromScores(scores) {
  if (!Array.isArray(scores) || scores.length === 0) return null;
  const nums = [];
  for (const v of scores) {
    const n = toNum(v);
    if (n === null) return null;
    nums.push(n);
  }
  const count = nums.length;
  const mean = nums.reduce((a, b) => a + b, 0) / count;
  const variance = nums.reduce((a, b) => a + (b - mean) ** 2, 0) / count; // 母集団分散（÷n）
  const sd = Math.sqrt(variance);
  return { mean, sd, count };
}

// 得点リストから各得点の偏差値（小数第1位）を配列で返す。
// 平均・標準偏差はリスト自身から statsFromScores で算出し、既存の hensachi 公式を再利用する。
// 入力が不正な場合は null を返す。
export function deviationsFromScores(scores) {
  const stats = statsFromScores(scores);
  if (stats === null) return null;
  return scores.map((v) => hensachi(v, stats.mean, stats.sd));
}

// 誤差関数 erf(x) の近似（Abramowitz & Stegun 7.1.26）。
// 最大絶対誤差 1.5e-7。奇関数なので符号は別途処理する。
export function erf(x) {
  const sign = x < 0 ? -1 : 1;
  const ax = Math.abs(x);
  const t = 1 / (1 + 0.3275911 * ax);
  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const y =
    1 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-ax * ax);
  return sign * y;
}

// 標準正規分布の累積分布関数 Φ(x) = (1 + erf(x / √2)) / 2。
export function normalCdf(x) {
  return 0.5 * (1 + erf(x / Math.SQRT2));
}

// 偏差値から「上位パーセント」を求める。
// z = (偏差値 − 50) / 10、上位% = (1 − Φ(z)) × 100。
// 入力が不正な場合は null。
export function topPercent(dev) {
  const v = toNum(dev);
  if (v === null) return null;
  const z = (v - 50) / 10;
  return (1 - normalCdf(z)) * 100;
}

// 偏差値と受験者数から概算順位を求める。
// 概算順位 = ceil(上位% / 100 × 受験者数)。最低でも1位。
// 入力が不正、または受験者数が0以下の場合は null。
export function estimateRank(dev, total) {
  const pct = topPercent(dev);
  const n = toNum(total);
  if (pct === null || n === null || n <= 0) return null;
  const rank = Math.ceil((pct / 100) * n);
  return Math.max(1, rank);
}
