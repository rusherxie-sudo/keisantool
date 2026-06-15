import { describe, it, expect } from 'vitest';
import { base64Encode, base64Decode } from '../src/lib/base64.js';

describe('base64Encode（UTF-8 安全エンコード）', () => {
  it('ASCII 文字列をエンコード', () => {
    expect(base64Encode('Hello')).toBe('SGVsbG8=');
  });

  it('日本語（多バイト）を正しくエンコード', () => {
    expect(base64Encode('日本語')).toBe('5pel5pys6Kqe');
  });

  it('空文字列は空文字列を返す', () => {
    expect(base64Encode('')).toBe('');
  });

  it('文字列でない入力は null を返す', () => {
    expect(base64Encode(123)).toBe(null);
    expect(base64Encode(null)).toBe(null);
    expect(base64Encode(undefined)).toBe(null);
    expect(base64Encode({})).toBe(null);
  });
});

describe('base64Decode（Base64 → 原文 UTF-8）', () => {
  it('ASCII の Base64 をデコード', () => {
    expect(base64Decode('SGVsbG8=')).toBe('Hello');
  });

  it('日本語の Base64 をデコード', () => {
    expect(base64Decode('5pel5pys6Kqe')).toBe('日本語');
  });

  it('空文字列は空文字列を返す', () => {
    expect(base64Decode('')).toBe('');
  });

  it('不正な Base64 は null を返す（例外を投げない）', () => {
    expect(base64Decode('!!!非法')).toBe(null);
  });

  it('文字列でない入力は null を返す', () => {
    expect(base64Decode(123)).toBe(null);
    expect(base64Decode(null)).toBe(null);
  });
});

describe('往復（encode → decode で元に戻る）', () => {
  const cases = [
    'Hello, World!',
    '日本語のテスト',
    'こんにちは🌸絵文字😀テスト',
    'ABC123 全角＋半角',
    '改行\nタブ\tスペース ',
    '',
  ];
  for (const original of cases) {
    it(`往復: ${JSON.stringify(original)}`, () => {
      expect(base64Decode(base64Encode(original))).toBe(original);
    });
  }
});
