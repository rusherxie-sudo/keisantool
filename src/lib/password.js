// パスワード生成のロジック（純関数・DOM非依存）。
// 既定の乱数源は crypto.getRandomValues（暗号学的乱数）。Math.random は使わない。
// テスト用に乱数源(rng)を注入できる（依存性注入）。

const LOWER = 'abcdefghijklmnopqrstuvwxyz';
const UPPER = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const DIGITS = '0123456789';
const SYMBOLS = '!@#$%^&*()-_=+[]{};:,.?';

const MAX_LENGTH = 256;

// [0,1) を返す暗号学的乱数。Node 18+ と全モダンブラウザで globalThis.crypto が利用可能。
function cryptoRandom() {
  const buf = new Uint32Array(1);
  globalThis.crypto.getRandomValues(buf);
  return buf[0] / 2 ** 32;
}

// Fisher–Yates シャッフル（同じ rng を使用）。sort(() => rng()-0.5) は偏るので使わない。
function shuffle(arr, rng) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// オプションから使用する文字プールを構築する。upper→lower→digits→symbols の順で連結。
export function buildPool({ upper, lower, digits, symbols } = {}) {
  let pool = '';
  if (upper) pool += UPPER;
  if (lower) pool += LOWER;
  if (digits) pool += DIGITS;
  if (symbols) pool += SYMBOLS;
  return pool;
}

// パスワードを生成する。opts.length と各文字種の有効/無効を指定。
// 選択した各文字種を必ず1文字以上含む（先頭に各種類を1つ取り、残りをプール全体から
// 埋めたうえで Fisher–Yates で混ぜる → 位置の偏りなし）。
// rng は [0,1) を返す関数（既定は crypto ベース）。無効な指定は null。
export function generatePassword(opts = {}, rng = cryptoRandom) {
  const length = Number(opts.length);
  if (!Number.isFinite(length) || length < 1 || length > MAX_LENGTH) return null;
  const sets = [
    opts.upper && UPPER,
    opts.lower && LOWER,
    opts.digits && DIGITS,
    opts.symbols && SYMBOLS,
  ].filter(Boolean);
  if (sets.length === 0 || length < sets.length) return null;

  const pool = sets.join('');
  const chars = sets.map((s) => s[Math.floor(rng() * s.length)]);
  while (chars.length < length) {
    chars.push(pool[Math.floor(rng() * pool.length)]);
  }
  return shuffle(chars, rng).join('');
}
