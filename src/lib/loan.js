// 住宅ローン返済シミュレーションのロジック（純関数・DOM非依存）。
// 金額は円未満を Math.floor で切り捨てる（当サイト共通の端数処理）。
// principal: 借入額(円), annualRatePct: 年利率(%), years: 返済期間(年)。

// 入力を検証して {P, r, n} を返す。無効なら null。
// P>0, r>=0（月利）, n>0（返済回数=年×12）。
function parse(principal, annualRatePct, years) {
  const P = Number(principal);
  const ratePct = Number(annualRatePct);
  const y = Number(years);
  if (!Number.isFinite(P) || P <= 0) return null;
  if (!Number.isFinite(ratePct) || ratePct < 0) return null;
  if (!Number.isFinite(y) || y <= 0) return null;
  return { P, r: ratePct / 100 / 12, n: Math.round(y * 12) };
}

// 元利均等返済：毎月の返済額が一定。
// monthly = P·r·(1+r)^n / ((1+r)^n − 1)（r=0 は P/n）。
// 返り値 { monthly, total, interest }（すべて切り捨て済み円）。無効なら null。
export function equalPayment(principal, annualRatePct, years) {
  const p = parse(principal, annualRatePct, years);
  if (!p) return null;
  const { P, r, n } = p;

  if (r === 0) {
    // 無利息：総額は借入額そのもの・利息0。floor した月額×回数だと端数分だけ
    // 借入額を下回り、利息が負に見えてしまう（実務では最終回で端数調整される）。
    return { monthly: Math.floor(P / n), total: P, interest: 0 };
  }
  const pow = Math.pow(1 + r, n);
  const monthly = Math.floor((P * r * pow) / (pow - 1));
  const total = monthly * n;
  return { monthly, total, interest: Math.max(0, total - P) };
}

// 元金均等返済：毎月の元金返済額が一定（P/n）、利息は残高に応じて減少。
// 初回返済額 = P/n + P·r、最終返済額 = (P/n)·(1+r)。
// 総利息 = P·r·(n+1)/2（等差数列の和）。
// 返り値 { firstMonthly, lastMonthly, total, interest }（すべて切り捨て済み円）。無効なら null。
export function equalPrincipal(principal, annualRatePct, years) {
  const p = parse(principal, annualRatePct, years);
  if (!p) return null;
  const { P, r, n } = p;

  const principalPart = P / n;
  const firstMonthly = Math.floor(principalPart + P * r);
  const lastMonthly = Math.floor(principalPart + principalPart * r);
  const interest = Math.floor((P * r * (n + 1)) / 2);
  const total = P + interest;
  return { firstMonthly, lastMonthly, total, interest };
}
