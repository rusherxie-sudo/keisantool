import { describe, it, expect } from 'vitest';
import { testRegex } from '../src/lib/regex.js';

describe('testRegex', () => {
  it('グローバルフラグで全マッチを収集する', () => {
    const r = testRegex('\\d+', 'g', 'a12b34');
    expect(r.ok).toBe(true);
    expect(r.matches.length).toBe(2);
    expect(r.matches[0].match).toBe('12');
    expect(r.matches[0].index).toBe(1);
    expect(r.matches[1].match).toBe('34');
    expect(r.matches[1].index).toBe(4);
  });

  it('キャプチャグループを配列で返す', () => {
    const r = testRegex('(a)(b)', '', 'ab');
    expect(r.ok).toBe(true);
    expect(r.matches[0].groups).toEqual(['a', 'b']);
  });

  it('構文エラーは ok:false と error を返す（例外を投げない）', () => {
    const r = testRegex('(', '', 'x');
    expect(r.ok).toBe(false);
    expect(typeof r.error).toBe('string');
    expect(r.error.length).toBeGreaterThan(0);
  });

  it('マッチが無いときは matches:[] を返す', () => {
    const r = testRegex('z', 'g', 'abc');
    expect(r.ok).toBe(true);
    expect(r.matches).toEqual([]);
  });

  it('gフラグ無しでも1件マッチする', () => {
    const r = testRegex('\\d+', '', 'a12b34');
    expect(r.ok).toBe(true);
    expect(r.matches.length).toBe(1);
    expect(r.matches[0].match).toBe('12');
    expect(r.matches[0].index).toBe(1);
  });

  it('iフラグで大文字小文字を無視する', () => {
    const r = testRegex('abc', 'ig', 'ABCabc');
    expect(r.ok).toBe(true);
    expect(r.matches.length).toBe(2);
  });

  it('キャプチャグループが無いときは空配列', () => {
    const r = testRegex('\\d+', 'g', 'a12');
    expect(r.matches[0].groups).toEqual([]);
  });

  it('未参加のオプショングループは undefined を含む', () => {
    const r = testRegex('(a)(b)?', '', 'a');
    expect(r.ok).toBe(true);
    expect(r.matches[0].groups).toEqual(['a', undefined]);
  });
});
