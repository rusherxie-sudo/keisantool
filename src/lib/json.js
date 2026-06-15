// JSON 整形・圧縮・検証の純関数（DOM 非依存）
// すべて解析失敗時は例外を投げず { ok:false, error } を返す。

function parse(str) {
  if (typeof str !== 'string' || str.trim() === '') {
    return { ok: false, error: 'JSON を入力してください' };
  }
  try {
    return { ok: true, value: JSON.parse(str) };
  } catch (e) {
    return { ok: false, error: e && e.message ? e.message : 'JSON の構文エラーです' };
  }
}

// 解析して美化（整形）する。indent は数字（空白数）または '\t'。
export function formatJson(str, indent = 2) {
  const p = parse(str);
  if (!p.ok) return { ok: false, error: p.error };
  try {
    return { ok: true, result: JSON.stringify(p.value, null, indent) };
  } catch (e) {
    return { ok: false, error: e && e.message ? e.message : '整形に失敗しました' };
  }
}

// 解析して一行に圧縮する。
export function minifyJson(str) {
  const p = parse(str);
  if (!p.ok) return { ok: false, error: p.error };
  try {
    return { ok: true, result: JSON.stringify(p.value) };
  } catch (e) {
    return { ok: false, error: e && e.message ? e.message : '圧縮に失敗しました' };
  }
}

// 構文チェックのみ。
export function validateJson(str) {
  const p = parse(str);
  if (!p.ok) return { ok: false, error: p.error };
  return { ok: true };
}
