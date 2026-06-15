import { describe, it, expect } from 'vitest';
import {
  toHalfWidth,
  toFullWidth,
  kanaToHalf,
  kanaToFull,
  hiraToKata,
  kataToHira,
  countChars,
  byteLength,
  countManuscriptSheets,
  xCount,
  removeNewlines,
  removeSpaces,
} from '../src/lib/moji.js';

describe('toHalfWidth(全角英数字・記号 → 半角)', () => {
  it('全角英数字を半角に変換', () => {
    expect(toHalfWidth('ＡＢＣ１２３')).toBe('ABC123');
  });

  it('全角記号を半角に変換', () => {
    expect(toHalfWidth('！＠＃＄％＆（）')).toBe('!@#$%&()');
  });

  it('全角スペースを半角スペースに変換', () => {
    expect(toHalfWidth('Ａ　Ｂ')).toBe('A B');
  });

  it('既に半角のものはそのまま', () => {
    expect(toHalfWidth('ABC123')).toBe('ABC123');
  });

  it('カタカナや漢字など対象外の文字は変換しない', () => {
    expect(toHalfWidth('あいうＡ漢')).toBe('あいうA漢');
  });

  it('空文字列は空文字列', () => {
    expect(toHalfWidth('')).toBe('');
  });
});

describe('toFullWidth(半角英数字・記号 → 全角)', () => {
  it('半角英数字を全角に変換', () => {
    expect(toFullWidth('ABC123')).toBe('ＡＢＣ１２３');
  });

  it('半角記号を全角に変換', () => {
    expect(toFullWidth('!@#$%&()')).toBe('！＠＃＄％＆（）');
  });

  it('半角スペースを全角スペースに変換', () => {
    expect(toFullWidth('A B')).toBe('Ａ　Ｂ');
  });

  it('既に全角のものはそのまま', () => {
    expect(toFullWidth('ＡＢＣ')).toBe('ＡＢＣ');
  });

  it('空文字列は空文字列', () => {
    expect(toFullWidth('')).toBe('');
  });

  it('toHalfWidth と相互変換できる', () => {
    expect(toHalfWidth(toFullWidth('Hello, World! 99%'))).toBe('Hello, World! 99%');
  });
});

describe('kanaToHalf(全角カタカナ → 半角カタカナ)', () => {
  it('清音を半角に変換', () => {
    expect(kanaToHalf('カタカナ')).toBe('ｶﾀｶﾅ');
  });

  it('濁音を分解して半角に変換', () => {
    expect(kanaToHalf('ガギグゲゴ')).toBe('ｶﾞｷﾞｸﾞｹﾞｺﾞ');
  });

  it('半濁音を分解して半角に変換', () => {
    expect(kanaToHalf('パピプペポ')).toBe('ﾊﾟﾋﾟﾌﾟﾍﾟﾎﾟ');
  });

  it('記号・長音符を半角に変換', () => {
    expect(kanaToHalf('ー、。「」・')).toBe('ｰ､｡｢｣･');
  });

  it('小書き文字を半角に変換（個別確認）', () => {
    expect(kanaToHalf('ァィゥェォ')).toBe('ｧｨｩｪｫ');
  });

  it('ヴを半角に変換', () => {
    expect(kanaToHalf('ヴ')).toBe('ｳﾞ');
  });

  it('対象外の文字（ひらがな・漢字）はそのまま', () => {
    expect(kanaToHalf('あ漢カ')).toBe('あ漢ｶ');
  });

  it('空文字列は空文字列', () => {
    expect(kanaToHalf('')).toBe('');
  });
});

describe('kanaToFull(半角カタカナ → 全角カタカナ)', () => {
  it('清音を全角に変換', () => {
    expect(kanaToFull('ｶﾀｶﾅ')).toBe('カタカナ');
  });

  it('濁音を合成して全角に変換', () => {
    expect(kanaToFull('ｶﾞｷﾞｸﾞｹﾞｺﾞ')).toBe('ガギグゲゴ');
  });

  it('半濁音を合成して全角に変換', () => {
    expect(kanaToFull('ﾊﾟﾋﾟﾌﾟﾍﾟﾎﾟ')).toBe('パピプペポ');
  });

  it('ｳﾞを ヴ に合成', () => {
    expect(kanaToFull('ｳﾞ')).toBe('ヴ');
  });

  it('半角記号を全角に変換', () => {
    expect(kanaToFull('｡｢｣､･ｰ')).toBe('。「」、・ー');
  });

  it('単独の濁点（合成できない）はそのまま全角濁点に', () => {
    expect(kanaToFull('ｱﾞ')).toBe('ア゛');
  });

  it('既に全角のものはそのまま', () => {
    expect(kanaToFull('カタカナ')).toBe('カタカナ');
  });

  it('kanaToHalf と相互変換できる（濁音含む）', () => {
    expect(kanaToFull(kanaToHalf('ガギグゲゴパピプペポヴ'))).toBe('ガギグゲゴパピプペポヴ');
  });

  it('空文字列は空文字列', () => {
    expect(kanaToFull('')).toBe('');
  });
});

describe('hiraToKata(ひらがな → カタカナ)', () => {
  it('ひらがなをカタカナに変換', () => {
    expect(hiraToKata('ひらがな')).toBe('ヒラガナ');
  });

  it('濁音・半濁音・小書きも変換', () => {
    expect(hiraToKata('ぱぴぷっゃ')).toBe('パピプッャ');
  });

  it('カタカナや漢字はそのまま', () => {
    expect(hiraToKata('カ漢あ')).toBe('カ漢ア');
  });

  it('空文字列は空文字列', () => {
    expect(hiraToKata('')).toBe('');
  });
});

describe('kataToHira(カタカナ → ひらがな)', () => {
  it('カタカナをひらがなに変換', () => {
    expect(kataToHira('カタカナ')).toBe('かたかな');
  });

  it('濁音・半濁音・小書きも変換', () => {
    expect(kataToHira('パピプッャ')).toBe('ぱぴぷっゃ');
  });

  it('ひらがなや漢字はそのまま', () => {
    expect(kataToHira('あ漢カ')).toBe('あ漢か');
  });

  it('hiraToKata と相互変換できる', () => {
    expect(kataToHira(hiraToKata('こんにちは、せかい'))).toBe('こんにちは、せかい');
  });

  it('空文字列は空文字列', () => {
    expect(kataToHira('')).toBe('');
  });
});

describe('countChars(文字数カウント)', () => {
  it('通常の文字列をカウント', () => {
    // ひらがな3文字 × 3byte = 9byte
    expect(countChars('あいう')).toEqual({ chars: 3, charsNoSpace: 3, lines: 1, bytes: 9 });
  });

  it('空白を含む文字列（半角・全角スペース）', () => {
    // a(1) + 半角空白(1) + b(1) + 全角空白(3) + c(1) = 7byte
    expect(countChars('a b　c')).toEqual({ chars: 5, charsNoSpace: 3, lines: 1, bytes: 7 });
  });

  it('改行を含む（複数行）', () => {
    // 漢字6文字×3 + 改行1 = 19byte
    expect(countChars('一行目\n二行目')).toEqual({ chars: 7, charsNoSpace: 6, lines: 2, bytes: 19 });
  });

  it('末尾に改行があっても行数は内容ベース', () => {
    expect(countChars('abc\n')).toEqual({ chars: 4, charsNoSpace: 3, lines: 2, bytes: 4 });
  });

  it('タブ・改行は空白として charsNoSpace から除外', () => {
    expect(countChars('a\tb\nc')).toEqual({ chars: 5, charsNoSpace: 3, lines: 2, bytes: 5 });
  });

  it('絵文字などサロゲートペアは1文字として数える', () => {
    // 𠮷(4byte) + 野(3) + 家(3) = 10byte
    expect(countChars('𠮷野家')).toEqual({ chars: 3, charsNoSpace: 3, lines: 1, bytes: 10 });
  });

  it('空文字列は全て0、行数0', () => {
    expect(countChars('')).toEqual({ chars: 0, charsNoSpace: 0, lines: 0, bytes: 0 });
  });

  // 拡張: bytes（UTF-8バイト数）を含む
  it('bytes プロパティ（UTF-8バイト数）を返す', () => {
    // 半角=1byte、全角ひらがな=3byte
    expect(countChars('aあ')).toEqual({ chars: 2, charsNoSpace: 2, lines: 1, bytes: 4 });
  });

  it('空文字列の bytes は0', () => {
    expect(countChars('')).toEqual({ chars: 0, charsNoSpace: 0, lines: 0, bytes: 0 });
  });
});

describe('byteLength(UTF-8バイト数)', () => {
  it('半角英数字は1文字1バイト', () => {
    expect(byteLength('abc123')).toBe(6);
  });

  it('全角ひらがな・漢字は1文字3バイト', () => {
    expect(byteLength('あ')).toBe(3);
    expect(byteLength('漢字')).toBe(6);
  });

  it('サロゲートペア（絵文字・𠮷）は4バイト', () => {
    expect(byteLength('𠮷')).toBe(4);
  });

  it('空文字列は0バイト', () => {
    expect(byteLength('')).toBe(0);
  });
});

describe('countManuscriptSheets(原稿用紙400字詰め枚数)', () => {
  // 定義: 改行を含まない総文字数（空白は含む）を400で割り、Math.ceil で切り上げ。
  // サロゲートペアは1文字として数える。0文字は0枚。
  it('400字ちょうどで1枚', () => {
    expect(countManuscriptSheets('あ'.repeat(400))).toBe(1);
  });

  it('401字で2枚', () => {
    expect(countManuscriptSheets('あ'.repeat(401))).toBe(2);
  });

  it('1文字で1枚', () => {
    expect(countManuscriptSheets('あ')).toBe(1);
  });

  it('800字ちょうどで2枚', () => {
    expect(countManuscriptSheets('あ'.repeat(800))).toBe(2);
  });

  it('改行は文字数に含めない（400字+改行3つでも1枚）', () => {
    expect(countManuscriptSheets('あ'.repeat(400) + '\n\n\n')).toBe(1);
  });

  it('空白（半角・全角スペース）は文字数に含める', () => {
    // 空白399 + 文字1 = 400 → 1枚
    expect(countManuscriptSheets(' '.repeat(399) + 'あ')).toBe(1);
  });

  it('サロゲートペアは1文字', () => {
    expect(countManuscriptSheets('𠮷'.repeat(400))).toBe(1);
  });

  it('空文字列は0枚', () => {
    expect(countManuscriptSheets('')).toBe(0);
  });

  it('改行のみは0枚', () => {
    expect(countManuscriptSheets('\n\n')).toBe(0);
  });
});

describe('xCount(X旧Twitter加重文字数)', () => {
  // 定義: X の重み付けカウント。半角ラテン系（ASCII印字可能・半角記号など）は1、
  // CJK・全角を含むその他の文字は2。上限280（日本語のみなら最大140文字）。
  it('半角英数字は1文字1カウント', () => {
    expect(xCount('abc123')).toBe(6);
  });

  it('全角日本語（ひらがな・漢字・カタカナ）は1文字2カウント', () => {
    expect(xCount('あ')).toBe(2);
    expect(xCount('漢字')).toBe(4);
    expect(xCount('カタカナ')).toBe(8);
  });

  it('全角英数字・記号は2カウント', () => {
    expect(xCount('ＡＢ')).toBe(4);
  });

  it('混在: 半角5 + 全角2文字 = 5 + 4 = 9', () => {
    expect(xCount('Hello' + 'あい')).toBe(9);
  });

  it('改行・半角スペースは1カウント', () => {
    expect(xCount('a b\nc')).toBe(5);
  });

  it('サロゲートペア（絵文字・𠮷）は2カウント', () => {
    expect(xCount('𠮷')).toBe(2);
  });

  it('日本語140文字でちょうど280', () => {
    expect(xCount('あ'.repeat(140))).toBe(280);
  });

  it('空文字列は0', () => {
    expect(xCount('')).toBe(0);
  });
});

describe('removeNewlines(改行除去)', () => {
  it('LF を除去', () => {
    expect(removeNewlines('一行目\n二行目')).toBe('一行目二行目');
  });

  it('CRLF・CR も除去', () => {
    expect(removeNewlines('a\r\nb\rc')).toBe('abc');
  });

  it('改行がなければそのまま', () => {
    expect(removeNewlines('abc')).toBe('abc');
  });

  it('空文字列は空文字列', () => {
    expect(removeNewlines('')).toBe('');
  });
});

describe('removeSpaces(空白除去)', () => {
  it('半角スペースを除去', () => {
    expect(removeSpaces('a b c')).toBe('abc');
  });

  it('全角スペースを除去', () => {
    expect(removeSpaces('あ　い　う')).toBe('あいう');
  });

  it('タブを除去', () => {
    expect(removeSpaces('a\tb')).toBe('ab');
  });

  it('改行は除去しない（空白のみ対象）', () => {
    expect(removeSpaces('a b\nc d')).toBe('ab\ncd');
  });

  it('空文字列は空文字列', () => {
    expect(removeSpaces('')).toBe('');
  });
});
