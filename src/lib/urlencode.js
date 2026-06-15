// URL エンコード / デコード（純関数・DOM 非依存）
//
// urlEncode      : encodeURIComponent。クエリの値などに使う（:/?#& もすべてエスケープ）。
// urlDecode      : decodeURIComponent。不正なパーセント列は例外を捕まえて null を返す。
// urlEncodeFull  : encodeURI。URL 全体に使う（:/?#& などの構造文字は残す）。

/**
 * encodeURIComponent でエンコードする。
 * @param {string} str
 * @returns {string|null} 文字列でない場合は null
 */
export function urlEncode(str) {
  if (typeof str !== 'string') return null;
  if (str === '') return '';
  return encodeURIComponent(str);
}

/**
 * decodeURIComponent でデコードする。
 * @param {string} str
 * @returns {string|null} 文字列でない、または不正なパーセント列の場合は null
 */
export function urlDecode(str) {
  if (typeof str !== 'string') return null;
  if (str === '') return '';
  try {
    return decodeURIComponent(str);
  } catch (e) {
    return null;
  }
}

/**
 * encodeURI でエンコードする（URL 全体向け、構造文字 :/?#& などは残す）。
 * @param {string} str
 * @returns {string|null} 文字列でない場合は null
 */
export function urlEncodeFull(str) {
  if (typeof str !== 'string') return null;
  if (str === '') return '';
  return encodeURI(str);
}
