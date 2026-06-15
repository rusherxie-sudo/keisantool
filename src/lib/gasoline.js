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

// 往復ガソリン代。floor 済みの片道を ×2 すると截断誤差が放大されるため、
// 「未取整の精確な片道金額 × 2」を計算してから一度だけ切り捨てる。
export function calcRoundTripCost({ distance, fuelEfficiency, gasPrice }) {
  if (![distance, fuelEfficiency, gasPrice].every(isPositiveFinite)) return null;
  const liters = distance / fuelEfficiency;
  return Math.floor(liters * gasPrice * 2);
}

// 月額交通費 = 精確片道 × 往復2 × 出勤日数。端数は切り捨て（最後に一度だけ）。
// 原始量から直接計算し、累積截断誤差を避ける。
export function calcMonthlyCost({ distance, fuelEfficiency, gasPrice, workdays }) {
  if (![distance, fuelEfficiency, gasPrice, workdays].every(isPositiveFinite)) return null;
  const liters = distance / fuelEfficiency;
  return Math.floor(liters * gasPrice * 2 * workdays);
}

// 割り勘：合計額（ガソリン代＋高速料金など）を人数で分担する。
// 1人あたりは Math.floor で整数円に切り捨て。
// totalCost は 0 以上の有限数（0 も有効）。people は 1 以上の整数。
export function splitPerPerson(totalCost, people) {
  if (!Number.isFinite(totalCost) || totalCost < 0) return null;
  if (!Number.isInteger(people) || people < 1) return null;
  return { perPerson: Math.floor(totalCost / people), people };
}
