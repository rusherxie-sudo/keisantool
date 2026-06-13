// 消費税・割引の計算ロジック（純関数・DOM非依存）。
// 金額の端数は全て「切り捨て」（Math.floor）で整数円に丸める。

// 税抜 → 税込
export function taxIncluded(net, rate) {
  const n = Number(net);
  if (!Number.isFinite(n) || n < 0) return { tax: 0, total: 0 };
  const tax = Math.floor(n * rate);
  return { tax, total: n + tax };
}

// 税込 → 税抜（端数の浮動小数点誤差を避けるため微小値を加えてから切り捨て）
export function taxExcluded(gross, rate) {
  const g = Number(gross);
  if (!Number.isFinite(g) || g < 0) return { net: 0, tax: 0 };
  const net = Math.floor(g / (1 + rate) + 1e-9);
  return { net, tax: g - net };
}

// 割引計算（定価 × 割引率% → 割引後価格・節約額）
export function discount(price, percent) {
  const p = Number(price);
  const pct = Number(percent);
  if (!Number.isFinite(p) || p < 0 || !Number.isFinite(pct) || pct < 0 || pct > 100) {
    return { discounted: 0, saved: 0 };
  }
  const saved = Math.floor((p * pct) / 100);
  return { discounted: p - saved, saved };
}
