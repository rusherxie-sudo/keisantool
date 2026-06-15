import { describe, it, expect } from 'vitest';
import {
  calcSanzenStart,
  calcSangoEnd,
  calcIkukyuEnd,
  calcShussanTeate,
  calcIkukyuKyuufu,
  calcShusseigoShien,
  dailyWageFromMonthly,
  IKUKYU_DAILY_CAP,
} from '../src/lib/saniku.js';

describe('calcSanzenStart(dueDate, isMultiple) — 産前休業開始日', () => {
  it('単胎: 予定日 2027-03-21 → 42日前 = 2027-02-07', () => {
    expect(calcSanzenStart('2027-03-21')).toBe('2027-02-07');
  });
  it('多胎: 予定日 2027-03-21 → 98日前 = 2026-12-13', () => {
    expect(calcSanzenStart('2027-03-21', true)).toBe('2026-12-13');
  });
  it('月をまたぐ計算: 2026-03-10 → 42日前 = 2026-01-27', () => {
    expect(calcSanzenStart('2026-03-10')).toBe('2026-01-27');
  });
  it('空文字 → null', () => {
    expect(calcSanzenStart('')).toBeNull();
  });
  it('無効な日付 → null', () => {
    expect(calcSanzenStart('not-a-date')).toBeNull();
  });
});

describe('calcSangoEnd(birthDate) — 産後休業終了日 = 出産日+56日', () => {
  it('出産日 2027-03-21 → 56日後 = 2027-05-16', () => {
    expect(calcSangoEnd('2027-03-21')).toBe('2027-05-16');
  });
  it('うるう年をまたぐ: 2028-01-10 → 2028-03-06', () => {
    expect(calcSangoEnd('2028-01-10')).toBe('2028-03-06');
  });
  it('空文字 → null', () => {
    expect(calcSangoEnd('')).toBeNull();
  });
});

describe('calcIkukyuEnd(birthDate, extendMonths) — 育休終了日', () => {
  it('1歳まで: 誕生日 2026-03-01 → 1歳誕生日前日 2027-02-28', () => {
    expect(calcIkukyuEnd('2026-03-01', 0)).toBe('2027-02-28');
  });
  it('1歳6ヶ月まで: 誕生日 2026-03-01 → 2027-08-31', () => {
    expect(calcIkukyuEnd('2026-03-01', 6)).toBe('2027-08-31');
  });
  it('2歳まで: 誕生日 2026-03-01 → うるう年の前日 2028-02-29', () => {
    expect(calcIkukyuEnd('2026-03-01', 12)).toBe('2028-02-29');
  });
  it('1月末日生まれ: 誕生日 2026-01-31 → 2027-01-30', () => {
    expect(calcIkukyuEnd('2026-01-31', 0)).toBe('2027-01-30');
  });
  it('空文字 → null', () => {
    expect(calcIkukyuEnd('')).toBeNull();
  });
});

describe('calcShussanTeate(standardDailyAmount, days) — 出産手当金', () => {
  it('標準報酬日額10000円 × 98日 → floor(10000×2/3×98) = 653333円', () => {
    expect(calcShussanTeate(10000, 98)).toBe(653333);
  });
  it('標準報酬日額5000円 × 42日 → floor(5000×2/3×42) = 140000円', () => {
    expect(calcShussanTeate(5000, 42)).toBe(140000);
  });
  it('端数切り捨て: 日額1000円 × 1日 → floor(666.6...) = 666円', () => {
    expect(calcShussanTeate(1000, 1)).toBe(666);
  });
  it('standardDailyAmount=0 → null', () => {
    expect(calcShussanTeate(0, 98)).toBeNull();
  });
  it('days=0 → null', () => {
    expect(calcShussanTeate(10000, 0)).toBeNull();
  });
  it('負の値 → null', () => {
    expect(calcShussanTeate(-1000, 98)).toBeNull();
  });
});

describe('calcIkukyuKyuufu(dailyWage, totalDays) — 育児休業給付金', () => {
  it('日額10000円 × 180日（全て67%）→ 1206000円', () => {
    const r = calcIkukyuKyuufu(10000, 180);
    expect(r.total).toBe(1206000);
    expect(r.first).toBe(1206000);
    expect(r.rest).toBe(0);
  });
  it('日額10000円 × 300日（最初180日67%＋残120日50%）→ 1806000円', () => {
    const r = calcIkukyuKyuufu(10000, 300);
    expect(r.total).toBe(1806000);
    expect(r.first).toBe(1206000);
    expect(r.rest).toBe(600000);
  });
  it('日額10000円 × 100日 → 670000円', () => {
    const r = calcIkukyuKyuufu(10000, 100);
    expect(r.total).toBe(670000);
    expect(r.firstDays).toBe(100);
    expect(r.restDays).toBe(0);
  });
  it('端数切り捨て: 日額1500円 × 1日 → floor(1005) = 1005円', () => {
    const r = calcIkukyuKyuufu(1500, 1);
    expect(r.total).toBe(1005);
  });
  it('dailyWage=0 → null', () => {
    expect(calcIkukyuKyuufu(0, 300)).toBeNull();
  });
  it('totalDays=0 → null', () => {
    expect(calcIkukyuKyuufu(10000, 0)).toBeNull();
  });

  // 令和7年8月改定: 休業開始時賃金日額の上限 16,110円。高額所得者は頭打ち。
  it('賃金日額が上限16,110円を超える場合は上限で計算（67%月上限323,811円相当）', () => {
    const r = calcIkukyuKyuufu(20000, 180);
    expect(r.first).toBe(Math.floor(16110 * 0.67 * 180)); // 1,942,866
    expect(r.total).toBe(1942866);
  });
  it('上限ちょうど16,110円は頭打ちされない', () => {
    const r = calcIkukyuKyuufu(16110, 180);
    expect(r.first).toBe(Math.floor(16110 * 0.67 * 180));
  });
});

describe('IKUKYU_DAILY_CAP（賃金日額の上限）', () => {
  it('令和7年8月改定の16,110円', () => {
    expect(IKUKYU_DAILY_CAP).toBe(16110);
  });
});

describe('dailyWageFromMonthly(月給→賃金日額 = 月給÷30・整数円)', () => {
  it('月給30万 → 10,000円', () => {
    expect(dailyWageFromMonthly(300000)).toBe(10000);
  });
  it('月給31万 → floor(10333.3)=10,333円', () => {
    expect(dailyWageFromMonthly(310000)).toBe(10333);
  });
  it('0・不正 → 0', () => {
    expect(dailyWageFromMonthly(0)).toBe(0);
    expect(dailyWageFromMonthly(NaN)).toBe(0);
    expect(dailyWageFromMonthly(-100)).toBe(0);
  });
});

describe('calcShusseigoShien(出生後休業支援給付金・賃金日額×13%×最大28日)', () => {
  // 2025年4月新設。子の出生後、夫婦ともに14日以上の育休取得で最大28日分、13%上乗せ。
  // 既存の育休給付67%と合わせて実質80%（社会保険料免除込みで手取り約10割）。
  it('日額10,000円 × 28日 → floor(10000×0.13×28)=36,400円', () => {
    const r = calcShusseigoShien(10000, 28);
    expect(r.amount).toBe(36400);
    expect(r.days).toBe(28);
  });
  it('28日を超える日数は28日で頭打ち', () => {
    const r = calcShusseigoShien(10000, 40);
    expect(r.amount).toBe(36400);
    expect(r.days).toBe(28);
  });
  it('賃金日額は上限16,110円で頭打ち', () => {
    const r = calcShusseigoShien(20000, 28);
    expect(r.amount).toBe(Math.floor(16110 * 0.13 * 28)); // 58,640
  });
  it('0・不正 → null', () => {
    expect(calcShusseigoShien(0, 28)).toBeNull();
    expect(calcShusseigoShien(10000, 0)).toBeNull();
  });
});
