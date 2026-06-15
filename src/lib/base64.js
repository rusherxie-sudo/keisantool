// Base64 エンコード / デコードのロジック（純関数・DOM非依存）。
// 日本語などの多バイト文字を壊さないため、btoa(str) を直接使わず
// TextEncoder / TextDecoder で UTF-8 バイト列に変換してから Base64 化する。
// ブラウザ・Node どちらでも動く書き方にしている。

const B64_CHARS =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

// バイト配列 (Uint8Array) → Base64 文字列
function bytesToBase64(bytes) {
  let result = '';
  for (let i = 0; i < bytes.length; i += 3) {
    const b0 = bytes[i];
    const b1 = bytes[i + 1];
    const b2 = bytes[i + 2];
    const hasB1 = b1 !== undefined;
    const hasB2 = b2 !== undefined;

    const triple = (b0 << 16) | ((hasB1 ? b1 : 0) << 8) | (hasB2 ? b2 : 0);

    result += B64_CHARS[(triple >> 18) & 0x3f];
    result += B64_CHARS[(triple >> 12) & 0x3f];
    result += hasB1 ? B64_CHARS[(triple >> 6) & 0x3f] : '=';
    result += hasB2 ? B64_CHARS[triple & 0x3f] : '=';
  }
  return result;
}

// Base64 文字列 → バイト配列 (Uint8Array)。不正な入力は例外を投げる。
function base64ToBytes(b64) {
  // 空白・改行は許容して取り除く
  const clean = b64.replace(/\s/g, '');
  if (clean === '') return new Uint8Array(0);

  // 許可されるのは Base64 文字 + パディング(=) のみ
  if (!/^[A-Za-z0-9+/]*={0,2}$/.test(clean)) {
    throw new Error('invalid base64');
  }
  // 長さは 4 の倍数でなければならない
  if (clean.length % 4 !== 0) {
    throw new Error('invalid base64 length');
  }

  const body = clean.replace(/=+$/, '');
  const outLen = Math.floor((body.length * 6) / 8);
  const bytes = new Uint8Array(outLen);

  let buffer = 0;
  let bits = 0;
  let pos = 0;
  for (let i = 0; i < body.length; i++) {
    const idx = B64_CHARS.indexOf(body[i]);
    buffer = (buffer << 6) | idx;
    bits += 6;
    if (bits >= 8) {
      bits -= 8;
      bytes[pos++] = (buffer >> bits) & 0xff;
    }
  }
  return bytes;
}

// UTF-8 安全な Base64 エンコード。
// 引数: 文字列。空文字列 → ''。文字列でない → null。
export function base64Encode(str) {
  if (typeof str !== 'string') return null;
  if (str === '') return '';
  const bytes = new TextEncoder().encode(str);
  return bytesToBase64(bytes);
}

// Base64 → 原文（UTF-8）。
// 引数: Base64 文字列。空文字列 → ''。不正な Base64 → null（例外を投げない）。
// 文字列でない → null。
export function base64Decode(b64) {
  if (typeof b64 !== 'string') return null;
  if (b64 === '') return '';
  try {
    const bytes = base64ToBytes(b64);
    // fatal: true で不正な UTF-8 バイト列も検知して例外化 → null に変換
    return new TextDecoder('utf-8', { fatal: true }).decode(bytes);
  } catch (e) {
    return null;
  }
}
