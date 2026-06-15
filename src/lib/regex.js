// 正規表現テストツールの純関数（DOM 非依存）
//
// testRegex(pattern, flags, text)
//   - pattern: 正規表現パターン文字列
//   - flags:   フラグ文字列（例: 'gi'）。'g' が含まれれば matchAll で全マッチ収集、
//              含まれなければ単一マッチのみ。
//   - text:    テスト対象の文字列
//
// 戻り値:
//   成功: { ok: true, matches: [{ match, index, groups }] }
//     match:  マッチした文字列
//     index:  マッチ開始位置
//     groups: キャプチャグループの配列（未参加のオプショングループは undefined）
//   失敗（構文エラー等）: { ok: false, error: '<メッセージ>' }
//
// 注意: ユーザー入力の pattern を直接 new RegExp する。ReDoS の可能性はあるが、
//       これはクライアント側でユーザー自身が入力・実行するもので、ここでは
//       構文エラーを捕捉するのみ（例外は投げない）。

export function testRegex(pattern, flags, text) {
  let re;
  try {
    re = new RegExp(pattern, flags || '');
  } catch (e) {
    return { ok: false, error: (e && e.message) ? e.message : String(e) };
  }

  const src = text == null ? '' : String(text);
  const matches = [];

  try {
    if (re.global) {
      for (const m of src.matchAll(re)) {
        matches.push(toMatch(m));
      }
    } else {
      const m = re.exec(src);
      if (m) matches.push(toMatch(m));
    }
  } catch (e) {
    return { ok: false, error: (e && e.message) ? e.message : String(e) };
  }

  return { ok: true, matches };
}

function toMatch(m) {
  // m[0] = マッチ全体、m[1..] = キャプチャグループ
  return {
    match: m[0],
    index: m.index,
    groups: m.slice(1),
  };
}
