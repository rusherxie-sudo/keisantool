// 国民健康保険料の概算計算ロジック（純関数・DOM非依存）。
// ⚠️ 国保料率は自治体ごとに異なり、毎年度改定される。本ツールは「概算」であり、
//   正確な金額は必ずお住まいの市区町村にご確認ください。
//
// 料率の出典（令和8年度＝2026年度）:
//   ・東京23区（特別区・統一保険料率）
//       練馬区「国民健康保険料の計算方法（令和8年度）」
//       https://www.city.nerima.tokyo.jp/kurashi/nenkinhoken/kokuminkenkohoken/hoken_hokenryo/keisan_hoho.html
//   ・大阪市（大阪府内統一保険料率）
//       大阪市「令和8年度大阪市国民健康保険料のお知らせ」
//       https://www.city.osaka.lg.jp/fukushima/page/0000624311.html
//   ・均等割の軽減（7割／5割／2割）判定基準（令和8年度）
//       松阪市「国民健康保険税の軽減（令和8年度）」
//       https://www.city.matsusaka.mie.jp/soshiki/23/keigen.html
//
// 簡略化モデルについて:
//   本ツールは「所得割 ＋ 均等割」のみで概算する。一部自治体（大阪市など）にある
//   「平等割（世帯ごとの定額）」は反映していないため、実際の保険料はより高くなる
//   場合がある。金額の端数は全て切り捨て（Math.floor）。

// 基礎控除額（所得割の算定基礎から差し引く額）
export const BASIC_DEDUCTION = 430000;

// 自治体ごとの料率表（医療分 / 後期高齢者支援金分 / 介護分）
// incomeRate: 所得割率（小数）, perCapita: 均等割額（円/人）, cap: 賦課限度額（円）
export const CITIES = [
  {
    key: 'tokyo23',
    name: '東京23区',
    note: '特別区の統一保険料率（令和8年度）',
    rates: {
      medical: { incomeRate: 0.0751, perCapita: 47600, cap: 670000 },
      support: { incomeRate: 0.028, perCapita: 17600, cap: 260000 },
      care: { incomeRate: 0.0243, perCapita: 17800, cap: 170000 },
    },
  },
  {
    key: 'osaka',
    name: '大阪市',
    note: '大阪府内統一保険料率（令和8年度）。平等割は概算に含めず',
    rates: {
      medical: { incomeRate: 0.095, perCapita: 34990, cap: 660000 },
      support: { incomeRate: 0.0306, perCapita: 11191, cap: 260000 },
      care: { incomeRate: 0.026, perCapita: 18682, cap: 170000 },
    },
  },
];

function getCity(key) {
  return CITIES.find((c) => c.key === key) || CITIES[0];
}

// 年収（給与収入）→ 給与所得の概算。
// 令和7年度税制改正後の給与所得控除に基づく（最低保障額 55万→65万、適用範囲を年収190万まで拡大）。
// 令和8年度の国保料は令和7年中の所得が基礎となるため、改正後の速算表を用いる。
// 速算表（令和7年分以降）:
//   〜190万      : 控除65万（最低保障）
//   190万超〜360万: 控除 = 収入×30%+8万
//   360万超〜660万: 控除 = 収入×20%+44万
//   660万超〜850万: 控除 = 収入×10%+110万
//   850万超      : 控除上限195万
export function incomeFromSalary(salary) {
  const s = Number(salary);
  if (!Number.isFinite(s) || s <= 0) return 0;
  let income;
  if (s <= 1900000) income = s - 650000; // 最低控除65万
  else if (s <= 3600000) income = s * 0.7 - 80000; // 控除 = 収入×30%+8万
  else if (s <= 6600000) income = s * 0.8 - 440000; // 控除 = 収入×20%+44万
  else if (s <= 8500000) income = s * 0.9 - 1100000; // 控除 = 収入×10%+110万
  else income = s - 1950000; // 控除上限195万
  return Math.max(0, Math.floor(income));
}

// 均等割の軽減判定（世帯の総所得・加入者数から軽減割合を返す）
// 給与所得者等の数は本概算では考慮せず 1 人として扱う（加算なし）。
// 7割: 43万
// 5割: 43万 + 31万 × 加入者数
// 2割: 43万 + 57万 × 加入者数
export function reductionRate(income, members) {
  const inc = Number(income);
  const n = Math.max(1, Math.floor(Number(members) || 1));
  if (!Number.isFinite(inc) || inc < 0) return 0;
  if (inc <= 430000) return 0.7;
  if (inc <= 430000 + 295000 * 0 + 310000 * n) return 0.5;
  if (inc <= 430000 + 570000 * n) return 0.2;
  return 0;
}

// 1区分の保険料を計算（所得割 + 均等割、軽減・限度額を反映）
function calcCategory(rate, taxableBase, members, reduce) {
  const incomePart = Math.floor(taxableBase * rate.incomeRate);
  const perCapitaPart = Math.floor(rate.perCapita * members * (1 - reduce));
  return {
    total: Math.min(rate.cap, incomePart + perCapitaPart),
    perCapita: perCapitaPart,
  };
}

// 総合計算
// 引数: { income(給与所得), members(加入人数), hasCare(40〜64歳が居るか), city(都市キー) }
export function calcKokuho({ income, members, hasCare, city }) {
  const inc = Number(income);
  const n = Math.floor(Number(members) || 0);
  if (n < 1) {
    return {
      total: 0, medical: 0, support: 0, care: 0,
      medicalPerCapita: 0, supportPerCapita: 0, carePerCapita: 0,
      reduction: 0, income: 0, taxableBase: 0,
    };
  }
  const safeIncome = Number.isFinite(inc) && inc > 0 ? Math.floor(inc) : 0;
  const taxableBase = Math.max(0, safeIncome - BASIC_DEDUCTION);
  const reduce = reductionRate(safeIncome, n);
  const r = getCity(city).rates;

  const med = calcCategory(r.medical, taxableBase, n, reduce);
  const sup = calcCategory(r.support, taxableBase, n, reduce);
  const car = hasCare
    ? calcCategory(r.care, taxableBase, n, reduce)
    : { total: 0, perCapita: 0 };

  return {
    total: med.total + sup.total + car.total,
    medical: med.total,
    support: sup.total,
    care: car.total,
    medicalPerCapita: med.perCapita,
    supportPerCapita: sup.perCapita,
    carePerCapita: car.perCapita,
    reduction: reduce,
    income: safeIncome,
    taxableBase,
  };
}
