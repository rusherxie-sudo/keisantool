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

// 1回分の距離・往復指定・回数をまとめ、通勤や旅行を同じ式で計算する。
// 金額は未取整の燃料費に追加費用を加え、最後に一度だけ切り捨てる。
export function calcTripSummary({
  distance,
  fuelEfficiency,
  gasPrice,
  trips = 1,
  roundTrip = false,
  extraCost = 0,
  people = 1,
}) {
  if (![distance, fuelEfficiency, gasPrice].every(isPositiveFinite)) return null;
  if (!Number.isInteger(trips) || trips < 1) return null;
  if (typeof roundTrip !== 'boolean') return null;
  if (!Number.isFinite(extraCost) || extraCost < 0) return null;
  if (!Number.isInteger(people) || people < 1) return null;

  const totalDistance = distance * trips * (roundTrip ? 2 : 1);
  const liters = totalDistance / fuelEfficiency;
  const exactFuelCost = liters * gasPrice;
  const fuelCost = Math.floor(exactFuelCost);
  const flooredExtraCost = Math.floor(extraCost);
  const totalCost = Math.floor(exactFuelCost + flooredExtraCost);

  return {
    totalDistance,
    liters,
    fuelCost,
    extraCost: flooredExtraCost,
    totalCost,
    costPerKm: Math.floor(totalCost / totalDistance),
    perPerson: Math.floor(totalCost / people),
    people,
  };
}

// 満タン法向け：給油間の走行距離と給油量から実燃費を逆算する。
// 単価を省略した場合は燃費だけを返し、金額関連は null にする。
export function calcFuelEconomy({ distance, fuelUsed, gasPrice } = {}) {
  if (![distance, fuelUsed].every(isPositiveFinite)) return null;
  if (gasPrice !== undefined && !isPositiveFinite(gasPrice)) return null;

  const kmPerLiter = distance / fuelUsed;
  const litersPer100Km = (fuelUsed / distance) * 100;
  if (gasPrice === undefined) {
    return { kmPerLiter, litersPer100Km, fuelCost: null, costPerKm: null };
  }

  const fuelCost = Math.floor(fuelUsed * gasPrice);
  return {
    kmPerLiter,
    litersPer100Km,
    fuelCost,
    costPerKm: Math.floor(fuelCost / distance),
  };
}
