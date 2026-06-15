import { describe, it, expect } from 'vitest';
import {
  dueDate,
  pregnancyWeeks,
  pregnancyStage,
  maternityLeave,
  lmpFromDue,
  ovulationFromDue,
  pregnancyMonths,
} from '../src/lib/shussan.js';

describe('dueDate(出産予定日 = LMP + 280日)', () => {
  it('2026-06-14 の LMP → 280日後の 2027-03-21', () => {
    expect(dueDate('2026-06-14')).toBe('2027-03-21');
  });

  it('Date オブジェクトでも同じ結果', () => {
    expect(dueDate(new Date('2026-06-14T00:00:00'))).toBe('2027-03-21');
  });

  it('うるう年をまたぐ計算: 2024-01-01 → 2024-10-07', () => {
    expect(dueDate('2024-01-01')).toBe('2024-10-07');
  });

  it('空文字 → null', () => {
    expect(dueDate('')).toBeNull();
  });

  it('無効な日付 → null', () => {
    expect(dueDate('not-a-date')).toBeNull();
  });

  it('null → null', () => {
    expect(dueDate(null)).toBeNull();
  });
});

describe('pregnancyWeeks(妊娠週数・日数、基準日=today を引数で渡す)', () => {
  it('LMP当日（経過0日）→ 0週0日', () => {
    expect(pregnancyWeeks('2026-06-14', '2026-06-14')).toEqual({ weeks: 0, days: 0, totalDays: 0 });
  });

  it('経過6日 → 0週6日', () => {
    expect(pregnancyWeeks('2026-06-14', '2026-06-20')).toEqual({ weeks: 0, days: 6, totalDays: 6 });
  });

  it('経過7日 → 1週0日', () => {
    expect(pregnancyWeeks('2026-06-14', '2026-06-21')).toEqual({ weeks: 1, days: 0, totalDays: 7 });
  });

  it('経過87日 → 12週3日（例の妊娠12週3日）', () => {
    expect(pregnancyWeeks('2026-06-14', '2026-09-09')).toEqual({ weeks: 12, days: 3, totalDays: 87 });
  });

  it('Date オブジェクト引数でも同じ', () => {
    expect(pregnancyWeeks(new Date('2026-06-14T00:00:00'), new Date('2026-06-21T00:00:00')))
      .toEqual({ weeks: 1, days: 0, totalDays: 7 });
  });

  it('基準日が LMP より前（未来の LMP）→ null', () => {
    expect(pregnancyWeeks('2026-06-14', '2026-06-13')).toBeNull();
  });

  it('空の LMP → null', () => {
    expect(pregnancyWeeks('', '2026-06-21')).toBeNull();
  });

  it('無効な日付 → null', () => {
    expect(pregnancyWeeks('not-a-date', '2026-06-21')).toBeNull();
  });
});

describe('pregnancyStage(妊娠時期区分: 週数から判定)', () => {
  it('0週 → 初期', () => {
    expect(pregnancyStage(0)).toBe('初期');
  });

  it('15週 → 初期（〜15週）', () => {
    expect(pregnancyStage(15)).toBe('初期');
  });

  it('16週 → 中期', () => {
    expect(pregnancyStage(16)).toBe('中期');
  });

  it('27週 → 中期（16〜27週）', () => {
    expect(pregnancyStage(27)).toBe('中期');
  });

  it('28週 → 後期', () => {
    expect(pregnancyStage(28)).toBe('後期');
  });

  it('40週 → 後期', () => {
    expect(pregnancyStage(40)).toBe('後期');
  });

  it('負数や無効 → null', () => {
    expect(pregnancyStage(-1)).toBeNull();
    expect(pregnancyStage(NaN)).toBeNull();
  });
});

describe('maternityLeave(産休目安: 開始=予定日−42日, 終了=出産日+56日)', () => {
  it('予定日 2027-03-21 → 産休開始 2027-02-07', () => {
    const r = maternityLeave('2027-03-21');
    expect(r.leaveStart).toBe('2027-02-07');
  });

  it('予定日を出産日とみなした産休終了 = 予定日+56日 → 2027-05-16', () => {
    const r = maternityLeave('2027-03-21');
    expect(r.leaveEnd).toBe('2027-05-16');
  });

  it('Date オブジェクトでも同じ', () => {
    const r = maternityLeave(new Date('2027-03-21T00:00:00'));
    expect(r.leaveStart).toBe('2027-02-07');
    expect(r.leaveEnd).toBe('2027-05-16');
  });

  it('空・無効 → null', () => {
    expect(maternityLeave('')).toBeNull();
    expect(maternityLeave('bad')).toBeNull();
  });
});

describe('lmpFromDue(逆算: 最終月経開始日 = 出産予定日 − 280日)', () => {
  it('予定日 2027-03-21 → LMP 2026-06-14', () => {
    expect(lmpFromDue('2027-03-21')).toBe('2026-06-14');
  });

  it('dueDate と逆の関係になる（往復一致）', () => {
    expect(lmpFromDue(dueDate('2026-06-14'))).toBe('2026-06-14');
  });

  it('うるう年をまたぐ: 予定日 2024-10-07 → LMP 2024-01-01', () => {
    expect(lmpFromDue('2024-10-07')).toBe('2024-01-01');
  });

  it('Date オブジェクトでも同じ', () => {
    expect(lmpFromDue(new Date('2027-03-21T00:00:00'))).toBe('2026-06-14');
  });

  it('空・無効・null → null', () => {
    expect(lmpFromDue('')).toBeNull();
    expect(lmpFromDue('not-a-date')).toBeNull();
    expect(lmpFromDue(null)).toBeNull();
  });
});

describe('ovulationFromDue(排卵日・受精日の目安 = 出産予定日 − 266日)', () => {
  it('予定日 2027-03-21 → 排卵日の目安 2026-06-28', () => {
    expect(ovulationFromDue('2027-03-21')).toBe('2026-06-28');
  });

  it('LMP + 14日 と一致する（排卵≈LMP+14日）', () => {
    // LMP 2026-06-14, 排卵 2026-06-28
    const due = dueDate('2026-06-14');
    expect(ovulationFromDue(due)).toBe('2026-06-28');
  });

  it('Date オブジェクトでも同じ', () => {
    expect(ovulationFromDue(new Date('2027-03-21T00:00:00'))).toBe('2026-06-28');
  });

  it('空・無効・null → null', () => {
    expect(ovulationFromDue('')).toBeNull();
    expect(ovulationFromDue('bad')).toBeNull();
    expect(ovulationFromDue(null)).toBeNull();
  });
});

describe('pregnancyMonths(妊娠月数: 4週=1ヶ月、妊娠0週から1ヶ月目)', () => {
  it('0週 → 妊娠1ヶ月', () => {
    expect(pregnancyMonths(0)).toBe(1);
  });

  it('3週 → 妊娠1ヶ月（0〜3週=1ヶ月）', () => {
    expect(pregnancyMonths(3)).toBe(1);
  });

  it('4週 → 妊娠2ヶ月（4〜7週=2ヶ月）', () => {
    expect(pregnancyMonths(4)).toBe(2);
  });

  it('7週 → 妊娠2ヶ月', () => {
    expect(pregnancyMonths(7)).toBe(2);
  });

  it('8週 → 妊娠3ヶ月', () => {
    expect(pregnancyMonths(8)).toBe(3);
  });

  it('12週 → 妊娠4ヶ月', () => {
    expect(pregnancyMonths(12)).toBe(4);
  });

  it('36週 → 妊娠10ヶ月（臨月）', () => {
    expect(pregnancyMonths(36)).toBe(10);
  });

  it('39週 → 妊娠10ヶ月', () => {
    expect(pregnancyMonths(39)).toBe(10);
  });

  it('負数や無効 → null', () => {
    expect(pregnancyMonths(-1)).toBeNull();
    expect(pregnancyMonths(NaN)).toBeNull();
  });
});
