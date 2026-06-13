import { describe, it, expect } from 'vitest';
import { hourlyWage, overtimePay, takeHomePay } from '../src/lib/kyuyo.js';

describe('hourlyWage(時給計算: 時給 × 労働時間)', () => {
  it('時給1000円 × 8時間 → 8000円', () => {
    expect(hourlyWage(1000, 8)).toEqual({ pay: 8000 });
  });

  it('時給1200円 × 160時間 → 192000円', () => {
    expect(hourlyWage(1200, 160)).toEqual({ pay: 192000 });
  });

  it('端数は切り捨て: 時給1013円 × 7.5時間 → 7597.5 を切り捨て7597', () => {
    expect(hourlyWage(1013, 7.5)).toEqual({ pay: 7597 });
  });

  it('時給0円 → 0円', () => {
    expect(hourlyWage(0, 8)).toEqual({ pay: 0 });
  });

  it('労働時間0 → 0円', () => {
    expect(hourlyWage(1000, 0)).toEqual({ pay: 0 });
  });
});

describe('overtimePay(残業代計算: 時給 × 残業時間 × 割増率)', () => {
  it('時給1000円 × 10時間 × 1.25（通常）→ 12500円', () => {
    expect(overtimePay(1000, 10, 1.25)).toEqual({ pay: 12500 });
  });

  it('時給1000円 × 10時間 × 1.5（深夜）→ 15000円', () => {
    expect(overtimePay(1000, 10, 1.5)).toEqual({ pay: 15000 });
  });

  it('時給1000円 × 10時間 × 1.35（休日）→ 13500円', () => {
    expect(overtimePay(1000, 10, 1.35)).toEqual({ pay: 13500 });
  });

  it('端数は切り捨て: 時給1013円 × 3時間 × 1.25 → 3798.75 を切り捨て3798', () => {
    expect(overtimePay(1013, 3, 1.25)).toEqual({ pay: 3798 });
  });

  it('残業時間0 → 0円', () => {
    expect(overtimePay(1000, 0, 1.25)).toEqual({ pay: 0 });
  });

  it('時給0円 → 0円', () => {
    expect(overtimePay(0, 10, 1.25)).toEqual({ pay: 0 });
  });
});

describe('takeHomePay(手取り概算: 月収 × 0.78)', () => {
  it('月収300000円 → 控除66000, 手取り234000', () => {
    expect(takeHomePay(300000)).toEqual({ takeHome: 234000, deduction: 66000 });
  });

  it('月収250000円 → 控除55000, 手取り195000', () => {
    expect(takeHomePay(250000)).toEqual({ takeHome: 195000, deduction: 55000 });
  });

  it('端数は切り捨て: 月収333333円 → 手取り floor(259999.74)=259999, 控除73334', () => {
    expect(takeHomePay(333333)).toEqual({ takeHome: 259999, deduction: 73334 });
  });

  it('月収0円 → 手取り0, 控除0', () => {
    expect(takeHomePay(0)).toEqual({ takeHome: 0, deduction: 0 });
  });
});

describe('不正な入力は全て0を返す（ページ側で非表示にする）', () => {
  it('hourlyWage: 非数値の時給', () => {
    expect(hourlyWage(NaN, 8)).toEqual({ pay: 0 });
  });
  it('hourlyWage: 負の時給', () => {
    expect(hourlyWage(-1000, 8)).toEqual({ pay: 0 });
  });
  it('hourlyWage: 負の労働時間', () => {
    expect(hourlyWage(1000, -8)).toEqual({ pay: 0 });
  });
  it('hourlyWage: 空文字', () => {
    expect(hourlyWage('', '')).toEqual({ pay: 0 });
  });
  it('overtimePay: 非数値', () => {
    expect(overtimePay(NaN, 10, 1.25)).toEqual({ pay: 0 });
  });
  it('overtimePay: 負の残業時間', () => {
    expect(overtimePay(1000, -10, 1.25)).toEqual({ pay: 0 });
  });
  it('overtimePay: 不正な割増率（1未満）', () => {
    expect(overtimePay(1000, 10, 0)).toEqual({ pay: 0 });
  });
  it('takeHomePay: 非数値', () => {
    expect(takeHomePay(NaN)).toEqual({ takeHome: 0, deduction: 0 });
  });
  it('takeHomePay: 負数', () => {
    expect(takeHomePay(-300000)).toEqual({ takeHome: 0, deduction: 0 });
  });
  it('takeHomePay: 空文字', () => {
    expect(takeHomePay('')).toEqual({ takeHome: 0, deduction: 0 });
  });
});
