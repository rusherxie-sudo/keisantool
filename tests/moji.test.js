import { describe, it, expect } from 'vitest';
import {
  toHalfWidth,
  toFullWidth,
  kanaToHalf,
  kanaToFull,
  hiraToKata,
  kataToHira,
  countChars,
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
    expect(countChars('あいう')).toEqual({ chars: 3, charsNoSpace: 3, lines: 1 });
  });

  it('空白を含む文字列（半角・全角スペース）', () => {
    expect(countChars('a b　c')).toEqual({ chars: 5, charsNoSpace: 3, lines: 1 });
  });

  it('改行を含む（複数行）', () => {
    expect(countChars('一行目\n二行目')).toEqual({ chars: 7, charsNoSpace: 6, lines: 2 });
  });

  it('末尾に改行があっても行数は内容ベース', () => {
    expect(countChars('abc\n')).toEqual({ chars: 4, charsNoSpace: 3, lines: 2 });
  });

  it('タブ・改行は空白として charsNoSpace から除外', () => {
    expect(countChars('a\tb\nc')).toEqual({ chars: 5, charsNoSpace: 3, lines: 2 });
  });

  it('絵文字などサロゲートペアは1文字として数える', () => {
    expect(countChars('𠮷野家')).toEqual({ chars: 3, charsNoSpace: 3, lines: 1 });
  });

  it('空文字列は全て0、行数0', () => {
    expect(countChars('')).toEqual({ chars: 0, charsNoSpace: 0, lines: 0 });
  });
});
