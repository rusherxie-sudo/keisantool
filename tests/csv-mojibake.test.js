import { describe, expect, it } from 'vitest';
import {
  decodeText,
  detectEncoding,
  encodeText,
  parseCsvPreview,
} from '../src/lib/csv-mojibake.js';

describe('detectEncoding', () => {
  it('UTF-8 BOMを判定する', () => {
    expect(detectEncoding(Uint8Array.from([0xef, 0xbb, 0xbf, 0x61]))).toBe('UTF-8-BOM');
  });

  it('BOMなしUTF-8を判定する', () => {
    expect(detectEncoding(new TextEncoder().encode('名前,住所\n山田,東京'))).toBe('UTF-8');
  });

  it('Shift_JISの日本語を判定する', () => {
    const bytes = Uint8Array.from([0x83, 0x65, 0x83, 0x58, 0x83, 0x67]); // テスト
    expect(detectEncoding(bytes)).toBe('Shift_JIS');
  });
});

describe('decodeText / encodeText', () => {
  it('Shift_JISを日本語へ復号する', () => {
    const bytes = Uint8Array.from([0x83, 0x65, 0x83, 0x58, 0x83, 0x67]);
    expect(decodeText(bytes).text).toBe('テスト');
  });

  it('Excel向けUTF-8 BOMを付けて出力する', () => {
    const bytes = encodeText('名前,住所', 'UTF-8-BOM');
    expect([...bytes.slice(0, 3)]).toEqual([0xef, 0xbb, 0xbf]);
    expect(new TextDecoder().decode(bytes.slice(3))).toBe('名前,住所');
  });

  it('Shift_JISへ変換して再び復号できる', () => {
    const bytes = encodeText('東京都①', 'Shift_JIS');
    expect(decodeText(bytes, 'Shift_JIS').text).toBe('東京都①');
  });
});

describe('parseCsvPreview', () => {
  it('引用符内のカンマと改行を同じセルとして扱う', () => {
    expect(parseCsvPreview('name,note\n山田,"東京,大阪"\n佐藤,"2行\nメモ"')).toEqual([
      ['name', 'note'],
      ['山田', '東京,大阪'],
      ['佐藤', '2行\nメモ'],
    ]);
  });

  it('表示行数を制限する', () => {
    expect(parseCsvPreview('a\n1\n2\n3', 2)).toEqual([['a'], ['1']]);
  });
});
