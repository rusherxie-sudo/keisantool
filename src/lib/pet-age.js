// 犬・猫の年齢の人間換算（純関数・DOM非依存）。
// 出典（一次資料）:
//   犬 = 環境省『飼い主のためのペットフード・ガイドライン』2区分式
//        小型・中型: 1歳=15, 2歳=24, 以降+4/年 → 24+(age-2)*4
//        大型:       1歳=12, 2歳=19, 以降+7/年 → 12+(age-1)*7
//   猫 = 環境省 / iCatCare(AAHA/AAFP公認): 1歳=15, 2歳=24, 以降+4/年 → 24+(age-2)*4
// ※1歳は式の例外値（犬小中=15/犬大=12/猫=15）、2歳以降のみ式を適用する点に注意。
// ※月齢（小数年）入力時は1歳・2歳の節点を結ぶ線形補間で目安を出し、結果は Math.floor で整数化。

function isValidAge(years) {
  return typeof years === 'number' && Number.isFinite(years) && years >= 0;
}

// 犬の人間換算年齢。size: 'small'(≤10kg) | 'medium'(≤25kg) | 'large'(>25kg)。
// 小型・中型は同一式。無効な年齢は null。
export function dogHumanAge(years, size) {
  if (!isValidAge(years)) return null;
  if (size === 'large') {
    // 大型犬: 1歳=12、以降+7/年。0〜1歳は線形。
    return years >= 1 ? Math.floor(12 + (years - 1) * 7) : Math.floor(years * 12);
  }
  // 小型・中型犬: 2歳=24、以降+4/年。1歳=15（例外）、節点間は線形。
  if (years >= 2) return Math.floor(24 + (years - 2) * 4);
  if (years >= 1) return Math.floor(15 + (years - 1) * 9);
  return Math.floor(years * 15);
}

// 猫の人間換算年齢。2歳=24、以降+4/年。1歳=15（例外）、節点間は線形。
export function catHumanAge(years) {
  if (!isValidAge(years)) return null;
  if (years >= 2) return Math.floor(24 + (years - 2) * 4);
  if (years >= 1) return Math.floor(15 + (years - 1) * 9);
  return Math.floor(years * 15);
}

// 体重(kg)から体型区分を判定。10kg以下=small / 25kg以下=medium / それ超=large。無効は null。
export function sizeFromWeight(kg) {
  if (typeof kg !== 'number' || !Number.isFinite(kg) || kg <= 0) return null;
  if (kg <= 10) return 'small';
  if (kg <= 25) return 'medium';
  return 'large';
}
