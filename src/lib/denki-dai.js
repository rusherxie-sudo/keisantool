// 消費電力・使用時間・電力量料金単価から電気代を求める純関数。
// 金額はサイト規約に合わせ、全期間の計算後に Math.floor で整数円へ切り捨てる。

function isFiniteNonNegative(value) {
  return Number.isFinite(value) && value >= 0;
}

function isFinitePositive(value) {
  return Number.isFinite(value) && value > 0;
}

export function calculateElectricityCost({ watts, hoursPerDay, days, unitPrice } = {}) {
  if (![watts, hoursPerDay].every(isFiniteNonNegative)) return null;
  if (![days, unitPrice].every(isFinitePositive)) return null;

  const rawKwh = (watts / 1000) * hoursPerDay * days;
  // 例: 600W × 3時間 × 30日は 53.99999999999999 になり得るため、
  // 表示・円未満切り捨ての前に計算機由来の微小な誤差だけを丸める。
  const kwh = Math.round(rawKwh * 1e12) / 1e12;
  const cost = Math.floor(Math.round(kwh * unitPrice * 1e9) / 1e9);
  return {
    watts,
    hoursPerDay,
    days,
    unitPrice,
    kwh,
    cost,
    dailyCost: Math.floor(cost / days),
  };
}

export function wattsFromVoltageCurrent(voltage, current) {
  if (![voltage, current].every(isFinitePositive)) return null;
  return voltage * current;
}
