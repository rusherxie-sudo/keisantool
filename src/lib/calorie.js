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

// 基礎代謝量 BMR（kcal/日）。国立健康・栄養研究所の式（Ganpule の式, 2007）。
// 日本人（20〜70歳代の男女）のデータから導かれた推定式で、日本人にはこちらが適すとされる。
// 出典: 国立健康・栄養研究所
//   https://www.nibn.go.jp/eiken/hn/modules/kisotaisya/
// 公式: (0.1238 + 0.0481×体重kg + 0.0234×身長cm − 0.0138×年齢 − 0.5473×性別) × 1000 / 4.186
//   性別: 男性=1、女性=2（男性 −0.4235 / 女性 −0.9708 に相当）
// ※ 1000/4.186 は MJ/日 を kcal/日 に換算する係数（1 kcal = 4.186 kJ）。
export function bmrGanpule(sex, age, height, weight) {
  const a = posNum(age);
  const h = posNum(height);
  const w = posNum(weight);
  if (a === null || h === null || w === null) return 0;
  let sexConst;
  if (sex === 'male') sexConst = 1;
  else if (sex === 'female') sexConst = 2;
  else return 0;
  const mj = 0.1238 + 0.0481 * w + 0.0234 * h - 0.0138 * a - 0.5473 * sexConst;
  return (mj * 1000) / 4.186;
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
// formula: 'ganpule'（既定・国立健康栄養研究所の式）/ 'harris'（ハリス＝ベネディクト改定式）。
export function calcAll({ sex, age, height, weight, activity, goal, formula = 'ganpule' }) {
  const rawBmr =
    formula === 'harris'
      ? bmr(sex, age, height, weight)
      : bmrGanpule(sex, age, height, weight);
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
