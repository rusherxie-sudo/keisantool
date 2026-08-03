import { describe, expect, it } from 'vitest';
import {
  collapseBlankLines,
  joinPdfWrappedLines,
  normalizeJapaneseText,
  normalizePunctuation,
} from '../src/lib/nihongo-seikei.js';

describe('normalizePunctuation', () => {
  it('日本語文中のカンマ・ピリオドを読点・句点へ統一する', () => {
    expect(normalizePunctuation('今日は晴れ,明日も晴れ.')).toBe('今日は晴れ、明日も晴れ。');
  });

  it('連続する句読点を1つへまとめる', () => {
    expect(normalizePunctuation('本当です。。 次へ、、')).toBe('本当です。 次へ、');
  });
});

describe('collapseBlankLines', () => {
  it('3行以上の空行を1行へ圧縮する', () => {
    expect(collapseBlankLines('一段落\n\n\n\n二段落')).toBe('一段落\n\n二段落');
  });
});

describe('joinPdfWrappedLines', () => {
  it('句点なしの日本語折返しを結合し、段落と箇条書きを保つ', () => {
    expect(joinPdfWrappedLines('これはPDFから\nコピーした文章です。\n\n・項目1\n・項目2')).toBe(
      'これはPDFからコピーした文章です。\n\n・項目1\n・項目2',
    );
  });
});

describe('normalizeJapaneseText', () => {
  it('行端・重複空白・空行・句読点をまとめて整形する', () => {
    expect(normalizeJapaneseText(' 今日は　　晴れ,  \r\n\r\n\r\n 明日も晴れ. ')).toBe(
      '今日は 晴れ、\n\n明日も晴れ。',
    );
  });

  it('NFCで結合文字を正規化する', () => {
    expect(normalizeJapaneseText('か\u3099')).toBe('が');
  });

  it('空文字を安全に扱う', () => {
    expect(normalizeJapaneseText('')).toBe('');
  });
});
