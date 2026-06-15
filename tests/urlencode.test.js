import { describe, it, expect } from 'vitest';
import { urlEncode, urlDecode, urlEncodeFull } from '../src/lib/urlencode.js';

describe('urlEncode', () => {
  it('日本語・空白・記号を encodeURIComponent で変換する', () => {
    expect(urlEncode('あ a&b')).toBe('%E3%81%82%20a%26b');
  });

  it('空文字は空文字を返す', () => {
    expect(urlEncode('')).toBe('');
  });

  it('文字列でない入力は null を返す', () => {
    expect(urlEncode(null)).toBe(null);
    expect(urlEncode(undefined)).toBe(null);
    expect(urlEncode(123)).toBe(null);
    expect(urlEncode({})).toBe(null);
  });

  it('構造文字 :/?#& もすべてエスケープする', () => {
    expect(urlEncode('a/b?c#d&e=f')).toBe('a%2Fb%3Fc%23d%26e%3Df');
  });
});

describe('urlDecode', () => {
  it('パーセントエンコードを元に戻す', () => {
    expect(urlDecode('%E3%81%82')).toBe('あ');
  });

  it('空文字は空文字を返す', () => {
    expect(urlDecode('')).toBe('');
  });

  it('文字列でない入力は null を返す', () => {
    expect(urlDecode(null)).toBe(null);
    expect(urlDecode(undefined)).toBe(null);
    expect(urlDecode(123)).toBe(null);
  });

  it('不正なパーセント（孤立した %）は null を返す', () => {
    expect(urlDecode('%')).toBe(null);
  });

  it('不正なシーケンス %ZZ は null を返す', () => {
    expect(urlDecode('%ZZ')).toBe(null);
  });
});

describe('往復（エンコード→デコードで元に戻る）', () => {
  it.each([
    'あ a&b',
    'こんにちは世界',
    'https://例え.test/パス?q=値&x=1#見出し',
    'a/b?c#d&e=f',
    '記号 ! * ( ) \' ~ - _ . space',
    '',
  ])('urlDecode(urlEncode(%j)) === 元の文字列', (s) => {
    expect(urlDecode(urlEncode(s))).toBe(s);
  });
});

describe('urlEncodeFull', () => {
  it('encodeURI で URL 構造文字を保持する', () => {
    expect(urlEncodeFull('https://example.com/パス?q=あ#見出し')).toBe(
      'https://example.com/%E3%83%91%E3%82%B9?q=%E3%81%82#%E8%A6%8B%E5%87%BA%E3%81%97'
    );
  });

  it(':/?#& などの構造文字はそのまま残す', () => {
    expect(urlEncodeFull('a/b?c#d&e=f')).toBe('a/b?c#d&e=f');
  });

  it('空文字は空文字を返す', () => {
    expect(urlEncodeFull('')).toBe('');
  });

  it('文字列でない入力は null を返す', () => {
    expect(urlEncodeFull(null)).toBe(null);
    expect(urlEncodeFull(42)).toBe(null);
  });

  it('スペースは %20 になる', () => {
    expect(urlEncodeFull('a b')).toBe('a%20b');
  });
});
