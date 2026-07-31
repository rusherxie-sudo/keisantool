import { describe, it, expect } from 'vitest';
import {
  dueDate,
  dueRange,
  elapsed,
  pregnancyStage,
  pregnancyStatus,
  dogPregnancyMilestones,
  catPregnancyMilestones,
} from '../src/lib/pet-pregnancy.js';

// 妊娠日数の出典（一次資料）:
//   猫 = 交配日+65日（90%が63〜67日）: Veterinary Information Network / Merck Veterinary Manual
//   犬 = 交配日+63日（初回交配からの範囲 58〜72）: AKC / Merck
// 日付は UTC 正午基準（shussan.js と同方式）。

describe('dueDate(出産予定日 = 交配日 + 平均日数)', () => {
  it('猫: 2026-05-01 交配 → +65日 → 2026-07-05', () => {
    expect(dueDate('2026-05-01', 'neko')).toBe('2026-07-05');
  });

  it('犬: 2026-05-01 交配 → +63日 → 2026-07-03', () => {
    expect(dueDate('2026-05-01', 'inu')).toBe('2026-07-03');
  });

  it('Date オブジェクトでも同じ（猫）', () => {
    expect(dueDate(new Date('2026-05-01T00:00:00'), 'neko')).toBe('2026-07-05');
  });

  it('うるう年をまたぐ（猫）: 2024-01-20 → 2024-03-25', () => {
    expect(dueDate('2024-01-20', 'neko')).toBe('2024-03-25');
  });

  it('空文字 → null', () => {
    expect(dueDate('', 'neko')).toBeNull();
  });

  it('無効な日付 → null', () => {
    expect(dueDate('not-a-date', 'inu')).toBeNull();
  });

  it('未知の種別 → null', () => {
    expect(dueDate('2026-05-01', 'usagi')).toBeNull();
  });
});

describe('dueRange(出産可能範囲)', () => {
  it('猫: 範囲 +63〜+67日 → 2026-07-03 〜 2026-07-07', () => {
    expect(dueRange('2026-05-01', 'neko')).toEqual({
      early: '2026-07-03',
      late: '2026-07-07',
    });
  });

  it('犬: 初回交配からの範囲 +58〜+72日 → 2026-06-28 〜 2026-07-12', () => {
    expect(dueRange('2026-05-01', 'inu')).toEqual({
      early: '2026-06-28',
      late: '2026-07-12',
    });
  });

  it('無効 → null', () => {
    expect(dueRange('', 'neko')).toBeNull();
    expect(dueRange('2026-05-01', 'x')).toBeNull();
  });
});

describe('elapsed(交配日からの経過: 妊娠○日目/○週)', () => {
  it('交配当日（経過0日）→ 0日0週', () => {
    expect(elapsed('2026-05-01', '2026-05-01')).toEqual({ days: 0, weeks: 0 });
  });

  it('経過21日 → 21日3週', () => {
    expect(elapsed('2026-05-01', '2026-05-22')).toEqual({ days: 21, weeks: 3 });
  });

  it('経過6日 → 6日0週', () => {
    expect(elapsed('2026-05-01', '2026-05-07')).toEqual({ days: 6, weeks: 0 });
  });

  it('基準日が交配日より前 → null', () => {
    expect(elapsed('2026-05-01', '2026-04-30')).toBeNull();
  });

  it('無効 → null', () => {
    expect(elapsed('', '2026-05-22')).toBeNull();
  });
});

describe('pregnancyStage(妊娠時期区分: 経過日数と種別から)', () => {
  it('猫: 21日 → 前期（〜3週=21日）', () => {
    expect(pregnancyStage(21, 'neko')).toBe('前期');
  });

  it('猫: 22日 → 中期', () => {
    expect(pregnancyStage(22, 'neko')).toBe('中期');
  });

  it('猫: 42日 → 中期（〜6週=42日）', () => {
    expect(pregnancyStage(42, 'neko')).toBe('中期');
  });

  it('猫: 43日 → 後期', () => {
    expect(pregnancyStage(43, 'neko')).toBe('後期');
  });

  it('犬: 28日 → 前期（〜4週=28日）', () => {
    expect(pregnancyStage(28, 'inu')).toBe('前期');
  });

  it('犬: 29日 → 中期', () => {
    expect(pregnancyStage(29, 'inu')).toBe('中期');
  });

  it('犬: 43日 → 後期', () => {
    expect(pregnancyStage(43, 'inu')).toBe('後期');
  });

  it('負数・無効 → null', () => {
    expect(pregnancyStage(-1, 'neko')).toBeNull();
    expect(pregnancyStage(NaN, 'inu')).toBeNull();
    expect(pregnancyStage(10, 'x')).toBeNull();
  });
});

describe('pregnancyStatus(現在の日数・週数・予定日まで)', () => {
  it('猫: 交配31日後は4週3日・中期・予定日まで34日', () => {
    expect(pregnancyStatus('2026-05-01', '2026-06-01', 'neko')).toEqual({
      days: 31,
      weeks: 4,
      daysInWeek: 3,
      stage: '中期',
      daysUntilDue: 34,
      daysUntilRangeStart: 32,
      daysUntilRangeEnd: 36,
    });
  });

  it('犬: 交配31日後は4週3日・中期・予定日まで32日', () => {
    expect(pregnancyStatus('2026-05-01', '2026-06-01', 'inu')).toEqual({
      days: 31,
      weeks: 4,
      daysInWeek: 3,
      stage: '中期',
      daysUntilDue: 32,
      daysUntilRangeStart: 27,
      daysUntilRangeEnd: 41,
    });
  });

  it('犬: 予定日は残り0日、翌日は-1日', () => {
    expect(pregnancyStatus('2026-05-01', '2026-07-03', 'inu').daysUntilDue).toBe(0);
    expect(pregnancyStatus('2026-05-01', '2026-07-04', 'inu').daysUntilDue).toBe(-1);
  });

  it('犬: 交配72日後は範囲最終日、73日後は範囲外', () => {
    expect(pregnancyStatus('2026-05-01', '2026-07-12', 'inu').daysUntilRangeEnd).toBe(0);
    expect(pregnancyStatus('2026-05-01', '2026-07-13', 'inu').daysUntilRangeEnd).toBe(-1);
  });

  it('交配前・無効な種別は null', () => {
    expect(pregnancyStatus('2026-05-01', '2026-04-30', 'inu')).toBeNull();
    expect(pregnancyStatus('2026-05-01', '2026-06-01', 'usagi')).toBeNull();
  });
});

describe('catPregnancyMilestones(交配日からの受診・準備目安)', () => {
  it('超音波25〜35日、レントゲン55日、準備開始49日を返す', () => {
    expect(catPregnancyMilestones('2026-05-01')).toEqual({
      ultrasound: { start: '2026-05-26', end: '2026-06-05' },
      xray: '2026-06-25',
      preparation: '2026-06-19',
    });
  });

  it('無効な日付は null', () => {
    expect(catPregnancyMilestones('')).toBeNull();
    expect(catPregnancyMilestones('not-a-date')).toBeNull();
  });
});

describe('dogPregnancyMilestones(交配日からの受診・準備目安)', () => {
  it('超音波25〜30日、レントゲン55日、準備開始56日を返す', () => {
    expect(dogPregnancyMilestones('2026-05-01')).toEqual({
      ultrasound: { start: '2026-05-26', end: '2026-05-31' },
      xray: '2026-06-25',
      preparation: '2026-06-26',
    });
  });

  it('無効な日付は null', () => {
    expect(dogPregnancyMilestones('')).toBeNull();
    expect(dogPregnancyMilestones('not-a-date')).toBeNull();
  });
});
