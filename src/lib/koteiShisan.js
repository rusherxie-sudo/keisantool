// 固定資産税・都市計画税の計算ロジック（純関数・DOM非依存）。
// 課税標準額・税額の端数は全て「切り捨て」（Math.floor）で整数円に丸める。

// 標準税率
const FIXED_RATE = 0.014; // 固定資産税（1.4%）
const CITY_RATE = 0.003; // 都市計画税（0.3% 上限）

// 住宅用地の課税標準の特例倍率（評価額 → 課税標準額）
//   small   : 小規模住宅用地（200㎡以下）固定 1/6・都計 1/3
//   general : 一般住宅用地（200㎡超）  固定 1/3・都計 2/3
//   none    : 非住宅（更地・事業用）   特例なし（×1）
const SPECIAL = {
  small: { fixed: 1 / 6, city: 1 / 3 },
  general: { fixed: 1 / 3, city: 2 / 3 },
  none: { fixed: 1, city: 1 },
};

// 評価額 + 用地区分 → 固定資産税・都市計画税
export function koteiShisan(value, landType) {
  const v = Number(value);
  if (!Number.isFinite(v) || v <= 0) {
    return { fixedBase: 0, cityBase: 0, fixedTax: 0, cityTax: 0, total: 0 };
  }
  const sp = SPECIAL[landType] || SPECIAL.none;
  const fixedBase = Math.floor(v * sp.fixed);
  const cityBase = Math.floor(v * sp.city);
  const fixedTax = Math.floor(fixedBase * FIXED_RATE);
  const cityTax = Math.floor(cityBase * CITY_RATE);
  return { fixedBase, cityBase, fixedTax, cityTax, total: fixedTax + cityTax };
}

// 家屋（建物）の固定資産税・都市計画税。
// 家屋には住宅用地特例（1/6等）は適用されない（課税標準＝評価額）。
// 新築住宅の減額措置: 一定期間、固定資産税が1/2に減額される（床面積120㎡相当分まで）。
//   一般住宅は新築後3年度（3階建以上の耐火・準耐火は5年度）、認定長期優良住宅はさらに長い。
//   都市計画税には適用されない。
// ※ 本ツールは概算のため、減額を家屋全体に適用する。120㎡を超える住宅では
//   実際の減額はこれより小さくなる場合がある。
export function koteiShisanBuilding(value, shinchikuGengaku = false) {
  const v = Number(value);
  if (!Number.isFinite(v) || v <= 0) {
    return { fixedBase: 0, cityBase: 0, fixedTax: 0, cityTax: 0, total: 0 };
  }
  const base = Math.floor(v);
  const fixedTaxFull = Math.floor(base * FIXED_RATE);
  const fixedTax = shinchikuGengaku ? Math.floor(fixedTaxFull / 2) : fixedTaxFull;
  const cityTax = Math.floor(base * CITY_RATE);
  return { fixedBase: base, cityBase: base, fixedTax, cityTax, total: fixedTax + cityTax };
}

// 土地 + 家屋の合算。それぞれの内訳と合計税額を返す。
export function koteiShisanCombined({ landValue, landType, buildingValue, shinchikuGengaku } = {}) {
  const land = koteiShisan(landValue, landType);
  const building = koteiShisanBuilding(buildingValue, shinchikuGengaku);
  const fixedTax = land.fixedTax + building.fixedTax;
  const cityTax = land.cityTax + building.cityTax;
  return { land, building, fixedTax, cityTax, total: fixedTax + cityTax };
}

// 年税額を年4回（第1〜4期）に分割。端数（余り）は第1期に寄せる。
export function splitQuarterly(annual) {
  const a = Number(annual);
  if (!Number.isFinite(a) || a <= 0) return [0, 0, 0, 0];
  const base = Math.floor(a / 4);
  const remainder = a - base * 4;
  return [base + remainder, base, base, base];
}
