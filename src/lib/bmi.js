// BMI・体脂肪率の計算ロジック（純関数・DOM非依存）。
// 数値は小数第1位で四捨五入。不正な入力は null を返し、ページ側で非表示にする。

// 小数第1位で四捨五入
function round1(n) {
  return Math.round(n * 10) / 10;
}

// null / undefined / 空文字 を弾いた上で数値化する。弾いた場合は NaN を返す。
function toNum(v) {
  if (v === null || v === undefined || v === '') return NaN;
  return Number(v);
}

// BMI = 体重kg / (身長m)^2。身長は cm で受け取り m に変換する。
export function calcBmi(heightCm, weightKg) {
  const h = toNum(heightCm);
  const w = toNum(weightKg);
  if (!Number.isFinite(h) || !Number.isFinite(w) || h <= 0 || w <= 0) return null;
  const m = h / 100;
  return round1(w / (m * m));
}

// 肥満度判定（日本肥満学会基準）
export function bmiCategory(bmi) {
  const b = toNum(bmi);
  if (!Number.isFinite(b)) return null;
  if (b < 18.5) return '低体重';
  if (b < 25) return '普通体重';
  if (b < 30) return '肥満（1度）';
  if (b < 35) return '肥満（2度）';
  if (b < 40) return '肥満（3度）';
  return '肥満（4度）';
}

// 標準体重 = (身長m)^2 × 22（BMI22 が標準）
export function standardWeight(heightCm) {
  const h = toNum(heightCm);
  if (!Number.isFinite(h) || h <= 0) return null;
  const m = h / 100;
  return round1(m * m * 22);
}

// 体脂肪率（BMI推定法・成人）
// = 1.2×BMI + 0.23×年齢 − 5.4 − 10.8×(性別: 男=1, 女=0)
export function bodyFatPercent(bmi, age, gender) {
  const b = toNum(bmi);
  const a = toNum(age);
  if (!Number.isFinite(b)) return null;
  if (!Number.isFinite(a) || a <= 0) return null;
  const sex = gender === 'male' ? 1 : 0;
  return round1(1.2 * b + 0.23 * a - 5.4 - 10.8 * sex);
}
