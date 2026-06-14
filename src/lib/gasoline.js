// 走行距離・燃費・ガソリン価格からガソリン代を計算する純関数。
// 金額は Math.floor で整数円に切り捨て（CLAUDE.md 規約）。

function isPositiveFinite(v) {
  return Number.isFinite(v) && v > 0;
}

// 片道（または任意区間）のガソリン代と消費量を返す。
export function calcGasCost({ distance, fuelEfficiency, gasPrice }) {
  if (![distance, fuelEfficiency, gasPrice].every(isPositiveFinite)) return null;
  const liters = distance / fuelEfficiency;
  const cost = Math.floor(liters * gasPrice);
  return { cost, liters };
}

// 月額交通費 = 片道コスト × 往復2 × 出勤日数。端数は切り捨て。
export function calcMonthlyCost({ oneWayCost, workdays }) {
  if (![oneWayCost, workdays].every(isPositiveFinite)) return null;
  return Math.floor(oneWayCost * 2 * workdays);
}
