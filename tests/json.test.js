import { describe, it, expect } from 'vitest';
import { formatJson, minifyJson, validateJson } from '../src/lib/json.js';

describe('formatJson', () => {
  it('インデント2で整形する', () => {
    const r = formatJson('{"a":1}', 2);
    expect(r.ok).toBe(true);
    expect(r.result).toBe('{\n  "a": 1\n}');
  });

  it('インデント4で整形する', () => {
    const r = formatJson('{"a":1}', 4);
    expect(r.ok).toBe(true);
    expect(r.result).toBe('{\n    "a": 1\n}');
  });

  it('タブでインデントできる', () => {
    const r = formatJson('{"a":1}', '\t');
    expect(r.ok).toBe(true);
    expect(r.result).toBe('{\n\t"a": 1\n}');
  });

  it('インデント省略時は2', () => {
    const r = formatJson('{"a":1}');
    expect(r.ok).toBe(true);
    expect(r.result).toBe('{\n  "a": 1\n}');
  });

  it('ネストした構造も整形する', () => {
    const r = formatJson('{"a":{"b":[1,2]}}', 2);
    expect(r.ok).toBe(true);
    expect(r.result).toBe('{\n  "a": {\n    "b": [\n      1,\n      2\n    ]\n  }\n}');
  });

  it('不正なJSONはokがfalse', () => {
    const r = formatJson('{bad}');
    expect(r.ok).toBe(false);
    expect(typeof r.error).toBe('string');
    expect(r.error.length).toBeGreaterThan(0);
  });

  it('空文字列はokがfalse', () => {
    const r = formatJson('');
    expect(r.ok).toBe(false);
    expect(typeof r.error).toBe('string');
  });

  it('空白のみの文字列はokがfalse', () => {
    const r = formatJson('   \n  ');
    expect(r.ok).toBe(false);
  });
});

describe('minifyJson', () => {
  it('空白を除去して一行にする', () => {
    const r = minifyJson('{ "a": 1 }');
    expect(r.ok).toBe(true);
    expect(r.result).toBe('{"a":1}');
  });

  it('改行やインデントを除去する', () => {
    const r = minifyJson('{\n  "a": 1,\n  "b": [1, 2]\n}');
    expect(r.ok).toBe(true);
    expect(r.result).toBe('{"a":1,"b":[1,2]}');
  });

  it('不正なJSONはokがfalse', () => {
    const r = minifyJson('{bad}');
    expect(r.ok).toBe(false);
    expect(typeof r.error).toBe('string');
  });

  it('空文字列はokがfalse', () => {
    const r = minifyJson('');
    expect(r.ok).toBe(false);
  });
});

describe('validateJson', () => {
  it('正しいJSONはok', () => {
    const r = validateJson('{"a":1}');
    expect(r.ok).toBe(true);
  });

  it('不正なJSONはokがfalseでerrorを返す', () => {
    const r = validateJson('{bad}');
    expect(r.ok).toBe(false);
    expect(typeof r.error).toBe('string');
    expect(r.error.length).toBeGreaterThan(0);
  });

  it('空文字列はokがfalse', () => {
    const r = validateJson('');
    expect(r.ok).toBe(false);
  });
});
