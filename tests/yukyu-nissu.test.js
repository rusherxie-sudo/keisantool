import { describe, expect, it } from 'vitest';
import { calculatePaidLeave, paidLeaveSchedule } from '../src/lib/yukyu-nissu.js';

describe('paidLeaveSchedule — 年次有給休暇の法定付与表', () => {
  it('一般労働者は6ヶ月後10日から6年6ヶ月後20日になる', () => {
    expect(paidLeaveSchedule('regular').map((row) => row.days))
      .toEqual([10, 11, 12, 14, 16, 18, 20]);
  });

  it('週4日から週1日までの比例付与表を返す', () => {
    expect(paidLeaveSchedule('four-days').map((row) => row.days))
      .toEqual([7, 8, 9, 10, 12, 13, 15]);
    expect(paidLeaveSchedule('three-days').map((row) => row.days))
      .toEqual([5, 6, 6, 8, 9, 10, 11]);
    expect(paidLeaveSchedule('two-days').map((row) => row.days))
      .toEqual([3, 4, 4, 5, 6, 6, 7]);
    expect(paidLeaveSchedule('one-day').map((row) => row.days))
      .toEqual([1, 2, 2, 2, 3, 3, 3]);
  });

  it('不正な勤務区分は空配列を返す', () => {
    expect(paidLeaveSchedule('unknown')).toEqual([]);
  });
});

describe('calculatePaidLeave — 入社日から付与日数を計算', () => {
  it('一般労働者の初回付与日・期限・次回付与を返す', () => {
    expect(calculatePaidLeave({
      hireDate: '2024-04-01',
      referenceDate: '2024-10-01',
      workPattern: 'regular',
      attendanceRate: 80,
    })).toMatchObject({
      duration: { years: 0, months: 6, days: 0 },
      eligibleByAttendance: true,
      currentGrantDate: '2024-10-01',
      statutoryGrantDays: 10,
      expirationDate: '2026-10-01',
      nextGrantDate: '2025-10-01',
      nextStatutoryDays: 11,
      fiveDayObligation: true,
    });
  });

  it('初回付与前は現在の付与がなく6ヶ月到達日を返す', () => {
    expect(calculatePaidLeave({
      hireDate: '2024-04-01',
      referenceDate: '2024-09-30',
      workPattern: 'regular',
      attendanceRate: 100,
    })).toMatchObject({
      eligibleByAttendance: null,
      currentGrantDate: null,
      statutoryGrantDays: 0,
      expirationDate: null,
      nextGrantDate: '2024-10-01',
      nextStatutoryDays: 10,
      fiveDayObligation: false,
    });
  });

  it('出勤率が8割未満なら今回の法定付与は0日になる', () => {
    expect(calculatePaidLeave({
      hireDate: '2024-04-01',
      referenceDate: '2025-10-01',
      workPattern: 'regular',
      attendanceRate: 79.9,
    })).toMatchObject({
      eligibleByAttendance: false,
      currentGrantDate: '2025-10-01',
      statutoryGrantDays: 0,
      expirationDate: null,
      nextGrantDate: '2026-10-01',
      nextStatutoryDays: 12,
      fiveDayObligation: false,
    });
  });

  it('週4日の6年6ヶ月以降は15日で5日取得義務の対象になる', () => {
    expect(calculatePaidLeave({
      hireDate: '2018-04-01',
      referenceDate: '2024-10-01',
      workPattern: 'four-days',
      attendanceRate: 95,
    })).toMatchObject({
      statutoryGrantDays: 15,
      expirationDate: '2026-10-01',
      nextGrantDate: '2025-10-01',
      nextStatutoryDays: 15,
      fiveDayObligation: true,
    });
  });

  it('比例付与の日数と年5日取得義務の境界を扱う', () => {
    expect(calculatePaidLeave({
      hireDate: '2024-04-01', referenceDate: '2024-10-01',
      workPattern: 'three-days', attendanceRate: 80,
    }).statutoryGrantDays).toBe(5);
    expect(calculatePaidLeave({
      hireDate: '2024-04-01', referenceDate: '2024-10-01',
      workPattern: 'two-days', attendanceRate: 80,
    }).statutoryGrantDays).toBe(3);
    expect(calculatePaidLeave({
      hireDate: '2024-04-01', referenceDate: '2024-10-01',
      workPattern: 'one-day', attendanceRate: 80,
    }).statutoryGrantDays).toBe(1);
    expect(calculatePaidLeave({
      hireDate: '2021-04-01', referenceDate: '2024-10-01',
      workPattern: 'four-days', attendanceRate: 80,
    }).fiveDayObligation).toBe(true);
  });

  it('月末と閏年は日付計算の共通ルールで丸める', () => {
    expect(calculatePaidLeave({
      hireDate: '2024-08-31',
      referenceDate: '2025-02-28',
      workPattern: 'regular',
      attendanceRate: 100,
    })).toMatchObject({
      currentGrantDate: '2025-02-28',
      nextGrantDate: '2026-02-28',
      expirationDate: '2027-02-28',
    });
  });

  it('日付・勤務区分・出勤率が不正ならnullを返す', () => {
    expect(calculatePaidLeave({ hireDate: '2026-02-30', referenceDate: '2026-08-01', workPattern: 'regular', attendanceRate: 80 })).toBeNull();
    expect(calculatePaidLeave({ hireDate: '2026-08-02', referenceDate: '2026-08-01', workPattern: 'regular', attendanceRate: 80 })).toBeNull();
    expect(calculatePaidLeave({ hireDate: '2024-01-01', referenceDate: '2026-08-01', workPattern: 'unknown', attendanceRate: 80 })).toBeNull();
    expect(calculatePaidLeave({ hireDate: '2024-01-01', referenceDate: '2026-08-01', workPattern: 'regular', attendanceRate: 100.1 })).toBeNull();
  });
});
