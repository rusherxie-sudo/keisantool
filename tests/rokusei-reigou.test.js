import { describe, it, expect } from 'vitest';
import { reigou, reigouTable } from '../src/lib/rokusei-reigou.js';

describe('霊合星人：公開計算例との照合（暦年方式）', () => {
  // https://fortune.netoff.co.jp/rokusei/keisan/ checked 2026-11-07.
  it.each([
    [2010, 1, 1, '木星人プラス', true, '金星人プラス'],
    [1975, 5, 7, '木星人マイナス', true, '金星人マイナス'],
    [1985, 8, 15, '火星人マイナス', false, null],
    [2015, 1, 2, '金星人マイナス', false, null],
  ])('%i-%i-%i', (y, m, d, type, isReigou, secondaryType) => {
    expect(reigou(y, m, d)).toMatchObject({ type, isReigou, secondaryType });
  });
  it('存在しない日付・範囲外を拒否し、うるう日は受け付ける', () => {
    for (const date of [[2023, 2, 29], [2000, 0, 1], [1899, 1, 1], [2100, 1, 1], [NaN, 1, 1]]) {
      expect(reigou(...date)).toBeNull();
    }
    expect(reigou(2000, 2, 29)).not.toBeNull();
  });
  it('公開12タイプ干支表と日付判定が一致する', () => {
    const table = reigouTable();
    const seen = new Set();
    for (let y = 2000; y < 2012; y++) {
      for (let m = 1; m <= 12; m++) {
        for (let d = 1; d <= 28; d++) {
          const r = reigou(y, m, d);
          const row = table.find((t) => t.type === r.type);
          expect(r.isReigou).toBe(row.branch === r.yearBranch);
          if (r.isReigou) { seen.add(r.type); expect(r.secondaryType).toBe(row.secondaryType); }
        }
      }
    }
    expect(seen.size).toBe(12);
  });
});
