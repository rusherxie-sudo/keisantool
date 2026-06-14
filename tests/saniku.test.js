import { describe, it, expect } from 'vitest';
import {
  calcSanzenStart,
  calcSangoEnd,
  calcIkukyuEnd,
  calcShussanTeate,
  calcIkukyuKyuufu,
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
});
