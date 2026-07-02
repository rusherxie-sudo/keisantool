// 複利・積立シミュレーションのロジック（純関数・DOM非依存）。
// 金額は円未満を Math.floor で切り捨てる（当サイト共通の端数処理）。

// 一括運用の入力検証。principal>0, ratePct>=0, years>0。無効なら null。
function parseLump(principal, ratePct, years) {
  const P = Number(principal);
  const r = Number(ratePct);
  const y = Number(years);
  if (!Number.isFinite(P) || P <= 0) return null;
  if (!Number.isFinite(r) || r < 0) return null;
  if (!Number.isFinite(y) || y <= 0) return null;
  return { P, r, y };
}

// 一括運用（年複利）。future = P·(1+年利)^年数。
// 返り値 { future, principal, interest }（円・切り捨て）。無効なら null。
export function compoundLumpSum(principal, ratePct, years) {
  const p = parseLump(principal, ratePct, years);
  if (!p) return null;
  const { P, r, y } = p;
  const future = Math.floor(P * Math.pow(1 + r / 100, y));
  return { future, principal: P, interest: future - P };
}

// 毎月積立（月複利・期末払い）。
// FV = m · ((1+i)^N − 1) / i（i=年利/12、N=年×12）。i=0 は m·N。
// 返り値 { future, principal, interest }（円・切り捨て）。無効なら null。
export function compoundReserve(monthly, ratePct, years) {
  const m = Number(monthly);
  const rate = Number(ratePct);
  const y = Number(years);
  if (!Number.isFinite(m) || m <= 0) return null;
  if (!Number.isFinite(rate) || rate < 0) return null;
  if (!Number.isFinite(y) || y <= 0) return null;

  const i = rate / 100 / 12;
  const N = Math.round(y * 12);
  const principal = m * N;

  let future;
  if (i === 0) {
    future = principal;
  } else {
    future = (m * (Math.pow(1 + i, N) - 1)) / i;
  }
  future = Math.floor(future);
  return { future, principal, interest: future - principal };
}
