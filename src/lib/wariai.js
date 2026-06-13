// 割合・パーセント・比率の計算ロジック（純関数・DOM非依存）。
// 不正な入力（空・非数値・負数・ゼロ除算など）は全て null を返し、
// ページ側で結果を非表示にする。

// 数値として有効かつ 0 以上か判定（空文字は Number('') === 0 になるため別途弾く）
function toNonNegative(v) {
  if (v === '' || v === null || v === undefined) return null;
  const n = Number(v);
  if (!Number.isFinite(n) || n < 0) return null;
  return n;
}

// 小数第2位で四捨五入（13.333… → 13.33、37.5 → 37.5）
function round2(n) {
  return Math.round(n * 100) / 100;
}

// 最大公約数（ユークリッドの互除法）
function gcd(a, b) {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) {
    [a, b] = [b, a % b];
  }
  return a;
}

// パーセント計算：A は B の何%？ → A / B * 100
export function percentOf(a, b) {
  const na = toNonNegative(a);
  const nb = toNonNegative(b);
  if (na === null || nb === null) return null;
  if (nb === 0) return null; // ゼロ除算
  return round2((na / nb) * 100);
}

// 割合計算：A の ○% はいくら？ → A * pct / 100
export function valueFromPercent(a, pct) {
  const na = toNonNegative(a);
  const np = toNonNegative(pct);
  if (na === null || np === null) return null;
  return round2((na * np) / 100);
}

// 比率計算：A:B を最大公約数で約分し、簡単な比に。
// 片方が 0 の場合は 0:1 / 1:0 とする。両方 0 は意味がないため null。
export function ratio(a, b) {
  const na = toNonNegative(a);
  const nb = toNonNegative(b);
  if (na === null || nb === null) return null;
  if (na === 0 && nb === 0) return null;
  if (na === 0) return { a: 0, b: 1 };
  if (nb === 0) return { a: 1, b: 0 };
  const g = gcd(na, nb);
  return { a: na / g, b: nb / g };
}

// 割引後計算：定価の ○%OFF の価格。金額は切り捨て（Math.floor）。
export function discountedPrice(price, percent) {
  const p = toNonNegative(price);
  const pct = toNonNegative(percent);
  if (p === null || pct === null || pct > 100) return null;
  const discount = Math.floor((p * pct) / 100);
  return { discounted: p - discount, discount };
}
