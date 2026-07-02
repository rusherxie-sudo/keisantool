import { describe, it, expect } from 'vitest';
import { daysBetween, shiftDate, weekdayJa } from '../src/lib/nissu.js';

describe('daysBetween — 二つの日付の間の日数', () => {
  it('片端（初日を含まない）が既定：1/1→1/2 は 1 日', () => {
    expect(daysBetween('2026-01-01', '2026-01-02')).toBe(1);
  });

  it('両端を含むと +1：1/1→1/2 は 2 日', () => {
    expect(daysBetween('2026-01-01', '2026-01-02', { includeBoth: true })).toBe(2);
  });

  it('同じ日は片端 0 日・両端 1 日', () => {
    expect(daysBetween('2026-03-10', '2026-03-10')).toBe(0);
    expect(daysBetween('2026-03-10', '2026-03-10', { includeBoth: true })).toBe(1);
  });

  it('順序が逆でも非負（絶対値）で返す', () => {
    expect(daysBetween('2026-01-10', '2026-01-01')).toBe(9);
  });

  it('うるう年の 2/29 を跨ぐ：2024-02-28→2024-03-01 は 2 日', () => {
    expect(daysBetween('2024-02-28', '2024-03-01')).toBe(2);
  });

  it('平年は 2/29 が無い：2025-02-28→2025-03-01 は 1 日', () => {
    expect(daysBetween('2025-02-28', '2025-03-01')).toBe(1);
  });

  it('年を跨ぐ長期間：2025-01-01→2026-01-01 は 365 日', () => {
    expect(daysBetween('2025-01-01', '2026-01-01')).toBe(365);
  });

  it('無効な入力は null', () => {
    expect(daysBetween('', '2026-01-01')).toBeNull();
    expect(daysBetween('2026-01-01', 'abc')).toBeNull();
  });
});

describe('shiftDate — N日後・N日前の日付', () => {
  it('100日後：2026-01-01 + 100 → 2026-04-11', () => {
    expect(shiftDate('2026-01-01', 100)).toBe('2026-04-11');
  });

  it('N日前（負数）：2026-01-01 − 1 → 2025-12-31', () => {
    expect(shiftDate('2026-01-01', -1)).toBe('2025-12-31');
  });

  it('0日後は同じ日', () => {
    expect(shiftDate('2026-06-01', 0)).toBe('2026-06-01');
  });

  it('うるう年跨ぎ：2024-02-28 + 1 → 2024-02-29', () => {
    expect(shiftDate('2024-02-28', 1)).toBe('2024-02-29');
  });

  it('無効な入力は null', () => {
    expect(shiftDate('abc', 10)).toBeNull();
    expect(shiftDate('2026-01-01', NaN)).toBeNull();
  });
});

describe('weekdayJa — 曜日', () => {
  it('2026-07-01 は水曜（水）', () => {
    expect(weekdayJa('2026-07-01')).toBe('水');
  });

  it('2026-01-01 は木曜（木）', () => {
    expect(weekdayJa('2026-01-01')).toBe('木');
  });

  it('無効な入力は null', () => {
    expect(weekdayJa('')).toBeNull();
  });
});
