// 文字変換のロジック（純関数・DOM非依存）。
// 全角半角変換、ひらがな↔カタカナ変換、文字数カウントを提供する。

// 全角英数字・記号 → 半角
export function toHalfWidth(str) {
  return String(str)
    // 全角 ! (FF01) ～ ~ (FF5E) を半角 (0x21～0x7E) にずらす
    .replace(/[！-～]/g, (ch) => String.fromCharCode(ch.charCodeAt(0) - 0xfee0))
    // 全角スペース → 半角スペース
    .replace(/　/g, ' ');
}

// 半角英数字・記号 → 全角
export function toFullWidth(str) {
  return String(str)
    // 半角スペース → 全角スペース
    .replace(/ /g, '　')
    // 半角 ! (0x21) ～ ~ (0x7E) を全角 (FF01～FF5E) にずらす
    .replace(/[!-~]/g, (ch) => String.fromCharCode(ch.charCodeAt(0) + 0xfee0));
}

// --- カタカナ全角↔半角 変換テーブル ---

// 全角カタカナ → 半角カタカナ（濁音・半濁音は分解）
const FULL_TO_HALF_KANA = {
  ガ: 'ｶﾞ', ギ: 'ｷﾞ', グ: 'ｸﾞ', ゲ: 'ｹﾞ', ゴ: 'ｺﾞ',
  ザ: 'ｻﾞ', ジ: 'ｼﾞ', ズ: 'ｽﾞ', ゼ: 'ｾﾞ', ゾ: 'ｿﾞ',
  ダ: 'ﾀﾞ', ヂ: 'ﾁﾞ', ヅ: 'ﾂﾞ', デ: 'ﾃﾞ', ド: 'ﾄﾞ',
  バ: 'ﾊﾞ', ビ: 'ﾋﾞ', ブ: 'ﾌﾞ', ベ: 'ﾍﾞ', ボ: 'ﾎﾞ',
  パ: 'ﾊﾟ', ピ: 'ﾋﾟ', プ: 'ﾌﾟ', ペ: 'ﾍﾟ', ポ: 'ﾎﾟ',
  ヴ: 'ｳﾞ', ヷ: 'ﾜﾞ', ヺ: 'ｦﾞ',
  ア: 'ｱ', イ: 'ｲ', ウ: 'ｳ', エ: 'ｴ', オ: 'ｵ',
  カ: 'ｶ', キ: 'ｷ', ク: 'ｸ', ケ: 'ｹ', コ: 'ｺ',
  サ: 'ｻ', シ: 'ｼ', ス: 'ｽ', セ: 'ｾ', ソ: 'ｿ',
  タ: 'ﾀ', チ: 'ﾁ', ツ: 'ﾂ', テ: 'ﾃ', ト: 'ﾄ',
  ナ: 'ﾅ', ニ: 'ﾆ', ヌ: 'ﾇ', ネ: 'ﾈ', ノ: 'ﾉ',
  ハ: 'ﾊ', ヒ: 'ﾋ', フ: 'ﾌ', ヘ: 'ﾍ', ホ: 'ﾎ',
  マ: 'ﾏ', ミ: 'ﾐ', ム: 'ﾑ', メ: 'ﾒ', モ: 'ﾓ',
  ヤ: 'ﾔ', ユ: 'ﾕ', ヨ: 'ﾖ',
  ラ: 'ﾗ', リ: 'ﾘ', ル: 'ﾙ', レ: 'ﾚ', ロ: 'ﾛ',
  ワ: 'ﾜ', ヲ: 'ｦ', ン: 'ﾝ',
  ァ: 'ｧ', ィ: 'ｨ', ゥ: 'ｩ', ェ: 'ｪ', ォ: 'ｫ',
  ッ: 'ｯ', ャ: 'ｬ', ュ: 'ｭ', ョ: 'ｮ',
  ー: 'ｰ', '、': '､', '。': '｡', '「': '｢', '」': '｣',
  '・': '･', '゛': 'ﾞ', '゜': 'ﾟ',
};

// 半角カタカナ → 全角カタカナ（濁点・半濁点と合成）の合成テーブル
const HALF_DAKUTEN = {
  ｶ: 'ガ', ｷ: 'ギ', ｸ: 'グ', ｹ: 'ゲ', ｺ: 'ゴ',
  ｻ: 'ザ', ｼ: 'ジ', ｽ: 'ズ', ｾ: 'ゼ', ｿ: 'ゾ',
  ﾀ: 'ダ', ﾁ: 'ヂ', ﾂ: 'ヅ', ﾃ: 'デ', ﾄ: 'ド',
  ﾊ: 'バ', ﾋ: 'ビ', ﾌ: 'ブ', ﾍ: 'ベ', ﾎ: 'ボ',
  ｳ: 'ヴ', ﾜ: 'ヷ', ｦ: 'ヺ',
};
const HALF_HANDAKUTEN = {
  ﾊ: 'パ', ﾋ: 'ピ', ﾌ: 'プ', ﾍ: 'ペ', ﾎ: 'ポ',
};
// 半角単体 → 全角単体
const HALF_TO_FULL_KANA = {
  ｱ: 'ア', ｲ: 'イ', ｳ: 'ウ', ｴ: 'エ', ｵ: 'オ',
  ｶ: 'カ', ｷ: 'キ', ｸ: 'ク', ｹ: 'ケ', ｺ: 'コ',
  ｻ: 'サ', ｼ: 'シ', ｽ: 'ス', ｾ: 'セ', ｿ: 'ソ',
  ﾀ: 'タ', ﾁ: 'チ', ﾂ: 'ツ', ﾃ: 'テ', ﾄ: 'ト',
  ﾅ: 'ナ', ﾆ: 'ニ', ﾇ: 'ヌ', ﾈ: 'ネ', ﾉ: 'ノ',
  ﾊ: 'ハ', ﾋ: 'ヒ', ﾌ: 'フ', ﾍ: 'ヘ', ﾎ: 'ホ',
  ﾏ: 'マ', ﾐ: 'ミ', ﾑ: 'ム', ﾒ: 'メ', ﾓ: 'モ',
  ﾔ: 'ヤ', ﾕ: 'ユ', ﾖ: 'ヨ',
  ﾗ: 'ラ', ﾘ: 'リ', ﾙ: 'ル', ﾚ: 'レ', ﾛ: 'ロ',
  ﾜ: 'ワ', ｦ: 'ヲ', ﾝ: 'ン',
  ｧ: 'ァ', ｨ: 'ィ', ｩ: 'ゥ', ｪ: 'ェ', ｫ: 'ォ',
  ｯ: 'ッ', ｬ: 'ャ', ｭ: 'ュ', ｮ: 'ョ',
  ｰ: 'ー', '､': '、', '｡': '。', '｢': '「', '｣': '」',
  '･': '・', 'ﾞ': '゛', 'ﾟ': '゜',
};

// 全角カタカナ → 半角カタカナ
export function kanaToHalf(str) {
  let out = '';
  for (const ch of String(str)) {
    out += FULL_TO_HALF_KANA[ch] ?? ch;
  }
  return out;
}

// 半角カタカナ → 全角カタカナ（濁点・半濁点を合成）
export function kanaToFull(str) {
  const s = String(str);
  let out = '';
  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    const next = s[i + 1];
    if (next === 'ﾞ' && HALF_DAKUTEN[ch]) {
      out += HALF_DAKUTEN[ch];
      i++;
      continue;
    }
    if (next === 'ﾟ' && HALF_HANDAKUTEN[ch]) {
      out += HALF_HANDAKUTEN[ch];
      i++;
      continue;
    }
    out += HALF_TO_FULL_KANA[ch] ?? ch;
  }
  return out;
}

// ひらがな → カタカナ（U+3041～U+3096 を +0x60）
export function hiraToKata(str) {
  return String(str).replace(/[ぁ-ゖ]/g, (ch) =>
    String.fromCharCode(ch.charCodeAt(0) + 0x60)
  );
}

// カタカナ → ひらがな（U+30A1～U+30F6 を -0x60）
export function kataToHira(str) {
  return String(str).replace(/[ァ-ヶ]/g, (ch) =>
    String.fromCharCode(ch.charCodeAt(0) - 0x60)
  );
}

// 文字数カウント（含空白・空白除く・行数）。サロゲートペアは1文字として数える。
export function countChars(str) {
  const s = String(str);
  if (s.length === 0) return { chars: 0, charsNoSpace: 0, lines: 0 };
  const codePoints = [...s];
  const chars = codePoints.length;
  // 半角/全角スペース・タブ・改行など全ての空白文字を除外
  const charsNoSpace = codePoints.filter((c) => !/\s/.test(c) && c !== '　').length;
  const lines = s.split('\n').length;
  return { chars, charsNoSpace, lines };
}
