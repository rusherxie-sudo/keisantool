import { describe, it, expect } from 'vitest';
import {
  calendarDuration,
  dateRangeBreakdown,
  daysBetween,
  shiftBusinessDate,
  shiftDate,
  shiftDateBy,
  weekdayJa,
} from '../src/lib/nissu.js';

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
    expect(daysBetween('2026-02-30', '2026-03-01')).toBeNull();
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
    expect(shiftDate('2026-01-01', 1.5)).toBeNull();
  });
});

describe('shiftDateBy — 日・週・月・年単位の日付計算', () => {
  it('2週間後を計算する', () => {
    expect(shiftDateBy('2026-08-01', 2, 'week')).toBe('2026-08-15');
  });

  it('月末を超える月加算は移動先の月末に丸める', () => {
    expect(shiftDateBy('2026-01-31', 1, 'month')).toBe('2026-02-28');
    expect(shiftDateBy('2024-01-31', 1, 'month')).toBe('2024-02-29');
  });

  it('うるう日の1年後は翌年2月末', () => {
    expect(shiftDateBy('2024-02-29', 1, 'year')).toBe('2025-02-28');
  });

  it('負数と不正な単位を扱う', () => {
    expect(shiftDateBy('2026-01-01', -1, 'month')).toBe('2025-12-01');
    expect(shiftDateBy('2026-01-01', 1, 'hour')).toBeNull();
  });
});

describe('calendarDuration — 年・月・日で表す期間', () => {
  it('複数年の期間を年・月・日に分解する', () => {
    expect(calendarDuration('2020-01-15', '2026-08-01')).toEqual({ years: 6, months: 6, days: 17 });
  });

  it('月末と閏日を暦どおりに扱う', () => {
    expect(calendarDuration('2024-01-31', '2024-03-01')).toEqual({ years: 0, months: 1, days: 1 });
    expect(calendarDuration('2024-02-29', '2025-02-28')).toEqual({ years: 1, months: 0, days: 0 });
  });

  it('逆順でも同じ期間を返し、同日はすべて0になる', () => {
    expect(calendarDuration('2026-08-01', '2020-01-15')).toEqual({ years: 6, months: 6, days: 17 });
    expect(calendarDuration('2026-08-01', '2026-08-01')).toEqual({ years: 0, months: 0, days: 0 });
  });

  it('無効な日付は null', () => {
    expect(calendarDuration('2026-02-30', '2026-03-01')).toBeNull();
  });
});

describe('shiftBusinessDate — 土日祝を除くN営業日後・前', () => {
  it('金曜日の1営業日後は月曜日', () => {
    expect(shiftBusinessDate('2026-08-07', 1)).toBe('2026-08-10');
  });

  it('祝日を除外する（2026年の山の日）', () => {
    expect(shiftBusinessDate('2026-08-10', 1)).toBe('2026-08-12');
  });

  it('負数で営業日前を計算し、基準日は数えない', () => {
    expect(shiftBusinessDate('2026-08-12', -1)).toBe('2026-08-10');
    expect(shiftBusinessDate('2026-08-08', 0)).toBe('2026-08-08');
  });

  it('年末年始でも土日祝を除外する', () => {
    expect(shiftBusinessDate('2025-12-31', 1)).toBe('2026-01-02');
  });

  it('無効日付・非整数・過大な日数は null', () => {
    expect(shiftBusinessDate('abc', 1)).toBeNull();
    expect(shiftBusinessDate('2026-08-01', 1.5)).toBeNull();
    expect(shiftBusinessDate('2026-08-01', 100001)).toBeNull();
  });
});

describe('dateRangeBreakdown — 暦日・土日・祝日・営業日', () => {
  it('2026年の山の日を含む期間を正しく分解する', () => {
    const result = dateRangeBreakdown('2026-08-03', '2026-08-11', { includeBoth: true });
    expect(result).toMatchObject({
      calendarDays: 9,
      weeks: 1,
      remainingDays: 2,
      weekdays: 7,
      weekendDays: 2,
      holidayWeekdays: 1,
      businessDays: 6,
    });
    expect(result.holidays).toEqual([{ date: '2026-08-11', name: '山の日' }]);
  });

  it('初日を含めない場合は期間の先頭を数えない', () => {
    const result = dateRangeBreakdown('2026-08-03', '2026-08-11');
    expect(result).toMatchObject({ calendarDays: 8, weekdays: 6, weekendDays: 2, holidayWeekdays: 1, businessDays: 5 });
  });

  it('2026年9月の5連休は土日2日・平日祝日3日・営業日0日', () => {
    const result = dateRangeBreakdown('2026-09-19', '2026-09-23', { includeBoth: true });
    expect(result).toMatchObject({ calendarDays: 5, weekendDays: 2, holidayWeekdays: 3, businessDays: 0 });
  });

  it('逆順でも同じ内訳を返す', () => {
    expect(dateRangeBreakdown('2026-08-11', '2026-08-03', { includeBoth: true }))
      .toEqual(dateRangeBreakdown('2026-08-03', '2026-08-11', { includeBoth: true }));
  });

  it('同じ日は初日を含む場合だけ1日として数える', () => {
    expect(dateRangeBreakdown('2026-08-03', '2026-08-03').calendarDays).toBe(0);
    expect(dateRangeBreakdown('2026-08-03', '2026-08-03', { includeBoth: true }))
      .toMatchObject({ calendarDays: 1, weekdays: 1, businessDays: 1 });
  });

  it('無効な日付は null', () => {
    expect(dateRangeBreakdown('2026-02-30', '2026-03-01')).toBeNull();
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
