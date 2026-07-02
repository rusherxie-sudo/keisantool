import { describe, it, expect } from 'vitest';
import {
  rer,
  der,
  dailyGrams,
  idealWeight,
  FACTORS,
} from '../src/lib/pet-food.js';

// 出典（一次資料）:
//   RER = 70 × 体重(kg)^0.75 : Merck/MSD Veterinary Manual
//   DER = RER × 活動係数 : WSAVA / Merck（係数は NRC/Merck 表）
//   給与量(g) = DER ÷ (kcal/100g) × 100、整数化は Math.floor（食べ過ぎ方向に丸めない）
//   理想体重 = 現体重 ÷ (1 + 0.10×(BCS-5))、BCS 9段階（5=理想）: WSAVA/AAHA

describe('rer(安静時エネルギー要求量 = 70 × kg^0.75)', () => {
  it('5kg → 約234.06 kcal', () => {
    expect(rer(5)).toBeCloseTo(234.059, 2);
  });

  it('2kg → 約117.73 kcal', () => {
    expect(rer(2)).toBeCloseTo(117.725, 2);
  });

  it('30kg → 約897.30 kcal', () => {
    expect(rer(30)).toBeCloseTo(897.303, 2);
  });

  it('0以下・無効 → null', () => {
    expect(rer(0)).toBeNull();
    expect(rer(-5)).toBeNull();
    expect(rer(NaN)).toBeNull();
  });
});

describe('der(1日エネルギー要求量 = RER × 活動係数)', () => {
  it('5kg × 1.6（犬・去勢成体）→ 約374.50 kcal', () => {
    expect(der(5, 1.6)).toBeCloseTo(374.495, 2);
  });

  it('4kg × 1.2（猫・去勢成体）→ 約237.59 kcal', () => {
    expect(der(4, 1.2)).toBeCloseTo(237.588, 2);
  });

  it('無効 → null', () => {
    expect(der(0, 1.6)).toBeNull();
    expect(der(5, 0)).toBeNull();
    expect(der(5, NaN)).toBeNull();
  });
});

describe('dailyGrams(1日給与量 = DER ÷ kcal/100g × 100、切り捨て)', () => {
  it('DER374.5 ÷ 350kcal → 106g（切り捨て）', () => {
    expect(dailyGrams(der(5, 1.6), 350)).toBe(106);
  });

  it('DER237.6 ÷ 400kcal → 59g', () => {
    expect(dailyGrams(der(4, 1.2), 400)).toBe(59);
  });

  it('割り切れる例: 400 ÷ 400kcal → 100g', () => {
    expect(dailyGrams(400, 400)).toBe(100);
  });

  it('無効 → null', () => {
    expect(dailyGrams(0, 350)).toBeNull();
    expect(dailyGrams(374, 0)).toBeNull();
    expect(dailyGrams(NaN, 350)).toBeNull();
  });
});

describe('idealWeight(理想体重 = 現体重 ÷ (1 + 0.10×(BCS-5)) / BCS 9段階)', () => {
  it('BCS5（理想）→ 現体重そのまま', () => {
    expect(idealWeight(5, 5)).toBeCloseTo(5, 5);
  });

  it('現6kg・BCS7（+20%）→ 理想5kg', () => {
    expect(idealWeight(6, 7)).toBeCloseTo(5, 5);
  });

  it('現4kg・BCS3（-20%）→ 理想5kg', () => {
    expect(idealWeight(4, 3)).toBeCloseTo(5, 5);
  });

  it('現6kg・BCS9（+40%）→ 理想 約4.29kg', () => {
    expect(idealWeight(6, 9)).toBeCloseTo(4.286, 2);
  });

  it('BCS範囲外（1未満/9超）・無効 → null', () => {
    expect(idealWeight(5, 0)).toBeNull();
    expect(idealWeight(5, 10)).toBeNull();
    expect(idealWeight(0, 5)).toBeNull();
    expect(idealWeight(NaN, 5)).toBeNull();
  });
});

describe('FACTORS(活動係数表: Merck/NRC由来)', () => {
  it('犬: 未去勢1.8 / 去勢1.6 / 肥満傾向1.4 / 子犬3.0・2.0', () => {
    expect(FACTORS.dog.intact).toBe(1.8);
    expect(FACTORS.dog.neutered).toBe(1.6);
    expect(FACTORS.dog.obeseProne).toBe(1.4);
    expect(FACTORS.dog.puppyU4m).toBe(3.0);
    expect(FACTORS.dog.puppyO4m).toBe(2.0);
  });

  it('猫: 未去勢1.4 / 去勢1.2 / 肥満傾向1.0 / 子猫2.5', () => {
    expect(FACTORS.cat.intact).toBe(1.4);
    expect(FACTORS.cat.neutered).toBe(1.2);
    expect(FACTORS.cat.obeseProne).toBe(1.0);
    expect(FACTORS.cat.kitten).toBe(2.5);
  });
});
