import { describe, expect, it } from 'vitest';
import { formatJapanesePhone, formatPhoneLines, normalizePhoneDigits } from '../src/lib/denwa-format.js';

describe('normalizePhoneDigits', () => {
  it('全角数字・括弧・空白・ハイフンを除去する', () => {
    expect(normalizePhoneDigits('（０９０）１２３４－５６７８')).toBe('09012345678');
  });

  it('+81を国内の0始まりへ変換する', () => {
    expect(normalizePhoneDigits('+81 90 1234 5678')).toBe('09012345678');
  });
});

describe('formatJapanesePhone', () => {
  it.each([
    ['09012345678', '090-1234-5678'],
    ['05012345678', '050-1234-5678'],
    ['0120123456', '0120-123-456'],
    ['08001234567', '0800-123-4567'],
    ['0312345678', '03-1234-5678'],
    ['0661234567', '06-6123-4567'],
  ])('%s → %s', (input, formatted) => {
    expect(formatJapanesePhone(input).formatted).toBe(formatted);
  });

  it('国際形式も出力する', () => {
    expect(formatJapanesePhone('09012345678').international).toBe('+81 90 1234 5678');
  });

  it('不正な番号は有効扱いしない', () => {
    expect(formatJapanesePhone('12345').valid).toBe(false);
  });
});

describe('formatPhoneLines', () => {
  it('複数行を整形し、不正行は元の値とエラーを返す', () => {
    const rows = formatPhoneLines('09012345678\n03-1234-5678\nabc');
    expect(rows.map((row) => row.formatted)).toEqual(['090-1234-5678', '03-1234-5678', 'abc']);
    expect(rows[2].valid).toBe(false);
  });
});
