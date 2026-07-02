import { describe, it, expect, vi } from 'vitest';
import { buildPool, generatePassword } from '../src/lib/password.js';

describe('buildPool — 文字プールの構築', () => {
  it('選択した種類だけを含む', () => {
    expect(buildPool({ digits: true })).toBe('0123456789');
    expect(buildPool({ lower: true })).toBe('abcdefghijklmnopqrstuvwxyz');
    expect(buildPool({ upper: true })).toBe('ABCDEFGHIJKLMNOPQRSTUVWXYZ');
  });

  it('複数種類は連結される', () => {
    expect(buildPool({ upper: true, digits: true })).toBe(
      'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    );
  });

  it('何も選ばなければ空文字', () => {
    expect(buildPool({})).toBe('');
  });
});

describe('generatePassword — パスワード生成', () => {
  it('指定した長さで生成される', () => {
    const pw = generatePassword({ length: 16, lower: true, digits: true });
    expect(pw).toHaveLength(16);
  });

  it('許可した文字だけを使う', () => {
    const pw = generatePassword({ length: 50, digits: true });
    expect(/^[0-9]+$/.test(pw)).toBe(true);
  });

  it('注入した乱数源で決定的に生成できる（DI）', () => {
    // rng が常に 0 を返す → プール先頭文字だけになる
    const rng = () => 0;
    expect(generatePassword({ length: 4, lower: true }, rng)).toBe('aaaa');
  });

  it('同じ乱数列からは同じパスワードが決定的に生成される（DI）', () => {
    const mk = () => {
      let k = 0;
      const seq = [0, 0.5, 0.25, 0.75, 0.1, 0.9];
      return () => seq[k++ % seq.length];
    };
    const a = generatePassword({ length: 8, lower: true }, mk());
    const b = generatePassword({ length: 8, lower: true }, mk());
    expect(a).toBe(b);
    expect(a).toHaveLength(8);
    expect(/^[a-z]+$/.test(a)).toBe(true);
  });

  it('種類未選択・長さ0は null', () => {
    expect(generatePassword({ length: 8 })).toBeNull();
    expect(generatePassword({ length: 0, lower: true })).toBeNull();
  });
});

describe('generatePassword — セキュリティ契約', () => {
  it('既定の乱数源は crypto（Math.random には一切触れない）', () => {
    const spy = vi.spyOn(Math, 'random');
    const pw = generatePassword({ length: 16, lower: true, digits: true });
    expect(pw).toHaveLength(16);
    expect(spy).not.toHaveBeenCalled();
    spy.mockRestore();
  });

  it('選択した文字種は必ず1文字以上含まれる', () => {
    // 保証なしの実装では length=8・lower+digits で数字を含まない確率 ≈22%/回。
    // 200回全部に数字と小文字が含まれることを要求（偶然通る確率 ≈ 5e-23）。
    for (let k = 0; k < 200; k++) {
      const pw = generatePassword({ length: 8, lower: true, digits: true });
      expect(/[0-9]/.test(pw)).toBe(true);
      expect(/[a-z]/.test(pw)).toBe(true);
    }
  });

  it('保証文字の位置は固定されない（先頭が毎回同じ種類にならない）', () => {
    // 「各種類を先頭に置いてから埋める」だけの実装だと先頭は常に upper になる。
    const first = new Set();
    for (let k = 0; k < 100; k++) {
      const pw = generatePassword({ length: 6, upper: true, digits: true });
      first.add(/[A-Z]/.test(pw[0]) ? 'upper' : 'digit');
    }
    expect(first.size).toBeGreaterThan(1);
  });

  it('長さが選択種類数未満・256超は null', () => {
    expect(
      generatePassword({ length: 2, upper: true, lower: true, digits: true })
    ).toBeNull();
    expect(generatePassword({ length: 257, lower: true })).toBeNull();
  });
});
