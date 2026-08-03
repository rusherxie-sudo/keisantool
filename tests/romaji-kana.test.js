import { describe, expect, it } from 'vitest';
import { kanaToRomaji, romajiToHiragana, romajiToKatakana } from '../src/lib/romaji-kana.js';

describe('kanaToRomaji', () => {
  it('濁音・促音・拗音をヘボン式へ変換する', () => {
    expect(kanaToRomaji('がっこう しんぶん ちゃ')).toBe('gakkou shinbun cha');
  });

  it('カタカナと長音符を変換する', () => {
    expect(kanaToRomaji('スーパー')).toBe('suupaa');
  });

  it('訓令式の代表的な綴りを使う', () => {
    expect(kanaToRomaji('し ち つ ふ しゃ じ', 'kunrei')).toBe('si ti tu hu sya zi');
  });

  it('かな以外の文字は保持する', () => {
    expect(kanaToRomaji('東京2026')).toBe('東京2026');
  });
});

describe('romajiToHiragana', () => {
  it('促音・拗音・撥音を変換する', () => {
    expect(romajiToHiragana('gakkou shinbun cha')).toBe('がっこう しんぶん ちゃ');
  });

  it("n'を明示的な『ん』として扱う", () => {
    expect(romajiToHiragana("kan'i")).toBe('かんい');
  });

  it('大文字を受け付ける', () => {
    expect(romajiToHiragana('TOKYO')).toBe('ときょ');
  });
});

describe('romajiToKatakana', () => {
  it('ローマ字を全角カタカナへ変換する', () => {
    expect(romajiToKatakana('konpyu-ta-')).toBe('コンピューター');
  });
});
