// 消費税・割引の計算ロジック（純関数・DOM非依存）。
// 金額の端数は全て「切り捨て」（Math.floor）で整数円に丸める。

// 税抜 → 税込
export function taxIncluded(net, rate) {
  const n = Number(net);
  if (!Number.isFinite(n) || n < 0) return { tax: 0, total: 0 };
  const tax = Math.floor(n * rate);
  return { tax, total: n + tax };
}

// 税込 → 税抜
// 財務省の内税式「税込価格 × 税率 / (1 + 税率)」で税額を先に求め、
// 1円未満を切り捨ててから税抜価格を差額で出す。
export function taxExcluded(gross, rate) {
  const g = Number(gross);
  if (!Number.isFinite(g) || g < 0) return { net: 0, tax: 0 };
  const grossYen = Math.floor(g);
  const tax = Math.floor((grossYen * rate) / (1 + rate) + 1e-9);
  return { net: grossYen - tax, tax };
}

// 複数商品の合算（各商品ごとに税抜/税込・税率を指定し、合計を算出）
// items: [{ amount, rate, taxIncluded }]
//   amount      … 金額（円）
//   rate        … 0.1 または 0.08
//   taxIncluded … その金額が税込みかどうか（true=税込, false=税抜）
// 同じ税率・同じ税込区分の商品を先に合計し、区分ごとに1回だけ端数処理する。
// 適格請求書の「一の請求書につき税率ごとに1回」の考え方に合わせ、
// 商品ごとの切り捨てで税額が過少になるのを避ける。
// 不正な項目（非数値・負数）はスキップ（0扱い）。空配列・非配列は全て0。
export function sumItems(items) {
  const zero = { subtotalExcl: 0, totalTax: 0, totalIncl: 0 };
  if (!Array.isArray(items)) return zero;

  const groups = new Map();
  for (const item of items) {
    if (!item) continue;
    const amount = Number(item.amount);
    const rate = Number(item.rate);
    if (!Number.isFinite(amount) || amount < 0 || !Number.isFinite(rate) || rate < 0) {
      continue;
    }

    const taxIncluded = Boolean(item.taxIncluded);
    const key = `${rate}:${taxIncluded}`;
    const group = groups.get(key) || { amount: 0, rate, taxIncluded };
    group.amount += amount;
    groups.set(key, group);
  }

  return [...groups.values()].reduce((acc, group) => {
    let net, tax;
    if (group.taxIncluded) {
      ({ net, tax } = taxExcluded(group.amount, group.rate));
    } else {
      ({ tax } = taxIncluded(group.amount, group.rate));
      net = group.amount;
    }

    acc.subtotalExcl += net;
    acc.totalTax += tax;
    acc.totalIncl += net + tax;
    return acc;
  }, { ...zero });
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
