// 犬・猫のごはん量計算（純関数・DOM非依存）。
// 出典（一次資料）:
//   RER = 70 × 体重(kg)^0.75 : Merck/MSD Veterinary Manual
//   DER = RER × 活動係数（係数表は NRC/Merck 由来）: WSAVA / Merck
//   給与量(g) = DER ÷ (kcal/100g) × 100、整数化は Math.floor（食べ過ぎ方向に丸めない）
//   理想体重 = 現体重 ÷ (1 + 0.10×(BCS-5))、BCS 9段階（5=理想）: WSAVA/AAHA
// ※係数は出典で流儀が分かれるため Merck/NRC 系を採用。シニア専用係数は一次資料に無く、
//   去勢成体(neutered)または肥満傾向(obeseProne)で代用する想定（ページ側で「目安」と明示）。

// 安静時エネルギー要求量 RER[kcal/日]。指数式に統一（2kg未満・45kg超でも妥当）。無効→null。
export function rer(kg) {
  if (typeof kg !== 'number' || !Number.isFinite(kg) || kg <= 0) return null;
  return 70 * Math.pow(kg, 0.75);
}

// 1日エネルギー要求量 DER = RER × 活動係数。無効→null。
export function der(kg, factor) {
  const r = rer(kg);
  if (r === null || typeof factor !== 'number' || !Number.isFinite(factor) || factor <= 0) {
    return null;
  }
  return r * factor;
}

// 1日の給与量(g) = DER ÷ (フードの kcal/100g) × 100。整数 g に切り捨て。無効→null。
export function dailyGrams(derKcal, kcalPer100g) {
  if (typeof derKcal !== 'number' || !Number.isFinite(derKcal) || derKcal <= 0) return null;
  if (typeof kcalPer100g !== 'number' || !Number.isFinite(kcalPer100g) || kcalPer100g <= 0) {
    return null;
  }
  return Math.floor((derKcal / kcalPer100g) * 100);
}

// 理想体重(kg) = 現体重 ÷ (1 + 0.10×(BCS-5))。BCS は 9段階（1〜9、5=理想）。範囲外・無効→null。
export function idealWeight(currentKg, bcs) {
  if (typeof currentKg !== 'number' || !Number.isFinite(currentKg) || currentKg <= 0) return null;
  if (typeof bcs !== 'number' || !Number.isFinite(bcs) || bcs < 1 || bcs > 9) return null;
  return currentKg / (1 + 0.1 * (bcs - 5));
}

// 活動係数表（Merck/NRC 由来）。ページはこの表から係数を引いて der() に渡す。
export const FACTORS = {
  dog: { intact: 1.8, neutered: 1.6, obeseProne: 1.4, puppyU4m: 3.0, puppyO4m: 2.0 },
  cat: { intact: 1.4, neutered: 1.2, obeseProne: 1.0, kitten: 2.5 },
};
