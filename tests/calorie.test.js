import { describe, it, expect } from 'vitest';
import { bmr, tdee, targetCalories, pfcBalance, calcAll } from '../src/lib/calorie.js';

describe('bmr(基礎代謝・ハリス＝ベネディクト改定式)', () => {
  it('男性: 88.362 + 13.397×体重 + 4.799×身長 − 5.677×年齢', () => {
    // 男性 30歳 170cm 65kg
    const expected = 88.362 + 13.397 * 65 + 4.799 * 170 - 5.677 * 30;
    expect(bmr('male', 30, 170, 65)).toBeCloseTo(expected, 5);
  });

  it('女性: 447.593 + 9.247×体重 + 3.098×身長 − 4.330×年齢', () => {
    // 女性 30歳 160cm 55kg
    const expected = 447.593 + 9.247 * 55 + 3.098 * 160 - 4.33 * 30;
    expect(bmr('female', 30, 160, 55)).toBeCloseTo(expected, 5);
  });

  it('不正な入力（0/空/NaN/負数）は0を返す', () => {
    expect(bmr('male', 0, 170, 65)).toBe(0);
    expect(bmr('male', 30, 0, 65)).toBe(0);
    expect(bmr('male', 30, 170, 0)).toBe(0);
    expect(bmr('male', '', 170, 65)).toBe(0);
    expect(bmr('male', NaN, 170, 65)).toBe(0);
    expect(bmr('male', -30, 170, 65)).toBe(0);
    expect(bmr('male', 30, -170, 65)).toBe(0);
  });

  it('性別が不正な場合は0を返す', () => {
    expect(bmr('unknown', 30, 170, 65)).toBe(0);
  });
});

describe('tdee(総消費カロリー = BMR × 活動係数)', () => {
  it('BMR1500 × 1.55（中程度）= 2325', () => {
    expect(tdee(1500, 1.55)).toBe(2325);
  });

  it('係数 1.2 / 1.375 / 1.55 / 1.725 / 1.9 に対応', () => {
    expect(tdee(1000, 1.2)).toBe(1200);
    expect(tdee(1000, 1.375)).toBe(1375);
    expect(tdee(1000, 1.725)).toBe(1725);
    expect(tdee(1000, 1.9)).toBe(1900);
  });

  it('BMRが0や不正なら0を返す', () => {
    expect(tdee(0, 1.55)).toBe(0);
    expect(tdee(NaN, 1.55)).toBe(0);
    expect(tdee(-1500, 1.55)).toBe(0);
    expect(tdee(1500, 0)).toBe(0);
    expect(tdee(1500, NaN)).toBe(0);
  });
});

describe('targetCalories(目標カロリー)', () => {
  it('維持 = TDEE', () => {
    expect(targetCalories(2000, 'maintain')).toBe(2000);
  });
  it('減量 = TDEE − 500', () => {
    expect(targetCalories(2000, 'lose')).toBe(1500);
  });
  it('増量 = TDEE + 500', () => {
    expect(targetCalories(2000, 'gain')).toBe(2500);
  });
  it('TDEEが0や不正なら0', () => {
    expect(targetCalories(0, 'lose')).toBe(0);
    expect(targetCalories(NaN, 'lose')).toBe(0);
  });
  it('目標が不正なら維持として扱う', () => {
    expect(targetCalories(2000, 'xxx')).toBe(2000);
  });
});

describe('pfcBalance(PFCバランス)', () => {
  it('P=体重×2g、F=総kcal×25%÷9、C=残りkcal÷4（整数g）', () => {
    // 目標2000kcal、体重65kg
    const weight = 65;
    const total = 2000;
    const p = Math.round(weight * 2); // 130g
    const pKcal = p * 4; // 520
    const fKcal = total * 0.25; // 500
    const f = Math.round(fKcal / 9); // 56
    const cKcal = total - pKcal - fKcal; // 980
    const c = Math.round(cKcal / 4); // 245
    expect(pfcBalance(total, weight)).toEqual({ p, f, c });
  });

  it('不正な入力は全て0', () => {
    expect(pfcBalance(0, 65)).toEqual({ p: 0, f: 0, c: 0 });
    expect(pfcBalance(2000, 0)).toEqual({ p: 0, f: 0, c: 0 });
    expect(pfcBalance(NaN, 65)).toEqual({ p: 0, f: 0, c: 0 });
    expect(pfcBalance(2000, NaN)).toEqual({ p: 0, f: 0, c: 0 });
    expect(pfcBalance(-2000, 65)).toEqual({ p: 0, f: 0, c: 0 });
  });

  it('炭水化物が負になる場合は0で下限を取る', () => {
    // 体重が極端に大きくタンパク質+脂質がオーバーする想定
    const res = pfcBalance(1000, 200);
    expect(res.c).toBeGreaterThanOrEqual(0);
  });
});

describe('calcAll(統合・カロリーは整数に丸める)', () => {
  it('男性30歳170cm65kg・中程度・維持の一括計算', () => {
    const r = calcAll({ sex: 'male', age: 30, height: 170, weight: 65, activity: 1.55, goal: 'maintain' });
    const rawBmr = 88.362 + 13.397 * 65 + 4.799 * 170 - 5.677 * 30;
    expect(r.bmr).toBe(Math.round(rawBmr));
    expect(r.tdee).toBe(Math.round(rawBmr * 1.55));
    expect(r.target).toBe(r.tdee);
    expect(r.pfc.p).toBe(130);
  });

  it('減量目標は目標カロリー = TDEE − 500', () => {
    const r = calcAll({ sex: 'male', age: 30, height: 170, weight: 65, activity: 1.55, goal: 'lose' });
    expect(r.target).toBe(r.tdee - 500);
  });

  it('不正な入力では全て0を返す', () => {
    const r = calcAll({ sex: 'male', age: 0, height: 170, weight: 65, activity: 1.55, goal: 'maintain' });
    expect(r).toEqual({ bmr: 0, tdee: 0, target: 0, pfc: { p: 0, f: 0, c: 0 } });
  });
});
