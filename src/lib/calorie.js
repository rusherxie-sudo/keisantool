// カロリー・基礎代謝の計算ロジック（純関数・DOM非依存）。
// 基礎代謝はハリス＝ベネディクト改定式を使用。
// 表示用のカロリーは整数（Math.round）に丸める。

// 正の有限数かどうか
function posNum(v) {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : null;
}

// 基礎代謝量 BMR（kcal/日）。不正な入力は0。
export function bmr(sex, age, height, weight) {
  const a = posNum(age);
  const h = posNum(height);
  const w = posNum(weight);
  if (a === null || h === null || w === null) return 0;
  if (sex === 'male') {
    return 88.362 + 13.397 * w + 4.799 * h - 5.677 * a;
  }
  if (sex === 'female') {
    return 447.593 + 9.247 * w + 3.098 * h - 4.33 * a;
  }
  return 0;
}

// 総消費カロリー TDEE = BMR × 活動レベル係数。不正な入力は0。
export function tdee(bmrValue, factor) {
  const b = posNum(bmrValue);
  const f = posNum(factor);
  if (b === null || f === null) return 0;
  return b * f;
}

// 目標カロリー。維持=TDEE / 減量=TDEE−500 / 増量=TDEE+500。
export function targetCalories(tdeeValue, goal) {
  const t = posNum(tdeeValue);
  if (t === null) return 0;
  if (goal === 'lose') return t - 500;
  if (goal === 'gain') return t + 500;
  return t; // maintain（不正値も維持扱い）
}

// PFCバランス（g）。
// タンパク質 P = 体重×2g、脂質 F = 総kcal×25%÷9、炭水化物 C = 残りkcal÷4。
export function pfcBalance(totalKcal, weight) {
  const total = posNum(totalKcal);
  const w = posNum(weight);
  if (total === null || w === null) return { p: 0, f: 0, c: 0 };
  const pGram = w * 2;
  const pKcal = pGram * 4;
  const fKcal = total * 0.25;
  const fGram = fKcal / 9;
  const cKcal = Math.max(0, total - pKcal - fKcal);
  const cGram = cKcal / 4;
  return {
    p: Math.round(pGram),
    f: Math.round(fGram),
    c: Math.round(cGram),
  };
}

// 一括計算。表示用にカロリーは整数へ丸める。
export function calcAll({ sex, age, height, weight, activity, goal }) {
  const rawBmr = bmr(sex, age, height, weight);
  if (rawBmr <= 0) {
    return { bmr: 0, tdee: 0, target: 0, pfc: { p: 0, f: 0, c: 0 } };
  }
  const rawTdee = tdee(rawBmr, activity);
  if (rawTdee <= 0) {
    return { bmr: Math.round(rawBmr), tdee: 0, target: 0, pfc: { p: 0, f: 0, c: 0 } };
  }
  const rawTarget = targetCalories(rawTdee, goal);
  const target = Math.round(rawTarget);
  return {
    bmr: Math.round(rawBmr),
    tdee: Math.round(rawTdee),
    target,
    pfc: pfcBalance(target, weight),
  };
}
