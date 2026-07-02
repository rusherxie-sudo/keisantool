import { describe, it, expect } from 'vitest';
import {
  coreSchedule,
  rabiesFirstDate,
} from '../src/lib/pet-vaccine.js';

// 出典（一次資料）:
//   混合ワクチン初年度 = 初回8週・以後4週間隔・最終16週（犬猫同ロジック）: WSAVA 2024
//     → 1回目+56日(8週) / 2回目+84日(12週) / 3回目+112日(16週)
//   犬の狂犬病 = 生後91日以降に初回（日齢固定値91）: 狂犬病予防法
//   日付は UTC 正午基準（shussan.js と同方式）。

describe('coreSchedule(混合ワクチン初年度の目安: 生年月日から)', () => {
  it('2026-04-01生 → 3回（8週/12週/16週 = +56/84/112日）', () => {
    expect(coreSchedule('2026-04-01')).toEqual([
      { times: 1, weeks: 8, date: '2026-05-27' },
      { times: 2, weeks: 12, date: '2026-06-24' },
      { times: 3, weeks: 16, date: '2026-07-22' },
    ]);
  });

  it('Date オブジェクトでも同じ', () => {
    expect(coreSchedule(new Date('2026-04-01T00:00:00'))).toEqual([
      { times: 1, weeks: 8, date: '2026-05-27' },
      { times: 2, weeks: 12, date: '2026-06-24' },
      { times: 3, weeks: 16, date: '2026-07-22' },
    ]);
  });

  it('うるう年をまたぐ: 2024-01-15生 → 8週=2024-03-11, 16週=2024-05-06', () => {
    const s = coreSchedule('2024-01-15');
    expect(s[0].date).toBe('2024-03-11');
    expect(s[2].date).toBe('2024-05-06');
  });

  it('空・無効 → null', () => {
    expect(coreSchedule('')).toBeNull();
    expect(coreSchedule('not-a-date')).toBeNull();
    expect(coreSchedule(null)).toBeNull();
  });
});

describe('rabiesFirstDate(犬の狂犬病: 生後91日の目安)', () => {
  it('2026-04-01生 → 生後91日 = 2026-07-01', () => {
    expect(rabiesFirstDate('2026-04-01')).toBe('2026-07-01');
  });

  it('うるう年をまたぐ: 2024-01-15生 → 2024-04-15', () => {
    expect(rabiesFirstDate('2024-01-15')).toBe('2024-04-15');
  });

  it('Date オブジェクトでも同じ', () => {
    expect(rabiesFirstDate(new Date('2026-04-01T00:00:00'))).toBe('2026-07-01');
  });

  it('空・無効 → null', () => {
    expect(rabiesFirstDate('')).toBeNull();
    expect(rabiesFirstDate('bad')).toBeNull();
    expect(rabiesFirstDate(null)).toBeNull();
  });
});
