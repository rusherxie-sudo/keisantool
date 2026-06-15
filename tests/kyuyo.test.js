import { describe, it, expect } from 'vitest';
import {
  hourlyWage,
  overtimePay,
  takeHomePay,
  hourlyFromMonthly,
  overtimeBreakdown,
} from '../src/lib/kyuyo.js';

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

  it('時給1000円 × 10時間 × 1.5（月60時間超の残業）→ 15000円', () => {
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

describe('hourlyFromMonthly(基本給 ÷ 月平均所定労働時間 = 時給)', () => {
  it('基本給250000円 ÷ 月160時間 → floor(1562.5)=1562円', () => {
    expect(hourlyFromMonthly(250000, 160)).toBe(1562);
  });

  it('基本給200000円 ÷ 月160時間 → 1250円', () => {
    expect(hourlyFromMonthly(200000, 160)).toBe(1250);
  });

  it('基本給300000円 ÷ 月170時間 → floor(1764.7...)=1764円', () => {
    expect(hourlyFromMonthly(300000, 170)).toBe(1764);
  });

  it('月所定労働時間0 → null', () => {
    expect(hourlyFromMonthly(250000, 0)).toBeNull();
  });

  it('基本給が負 → null', () => {
    expect(hourlyFromMonthly(-250000, 160)).toBeNull();
  });

  it('非数値 → null', () => {
    expect(hourlyFromMonthly(NaN, 160)).toBeNull();
    expect(hourlyFromMonthly(250000, NaN)).toBeNull();
  });

  it('空文字 → null', () => {
    expect(hourlyFromMonthly('', '')).toBeNull();
  });
});

describe('overtimeBreakdown(分類別の残業代を一括計算)', () => {
  it('時給1000円, 普通10時間のみ → normal12500, total12500', () => {
    expect(overtimeBreakdown(1000, { normal: 10 })).toEqual({
      normal: 12500,
      night: 0,
      holiday: 0,
      over60: 0,
      total: 12500,
    });
  });

  it('時給1000円, 普通10+深夜5 → 12500+7500=20000', () => {
    expect(overtimeBreakdown(1000, { normal: 10, night: 5 })).toEqual({
      normal: 12500,
      night: 7500,
      holiday: 0,
      over60: 0,
      total: 20000,
    });
  });

  it('時給1000円, 全種別 普通10/深夜5/休日4/60h超3', () => {
    // normal: 1000*10*1.25=12500
    // night: 1000*5*1.5=7500
    // holiday: 1000*4*1.35=5400
    // over60: 1000*3*1.5=4500
    // total: 29900
    expect(overtimeBreakdown(1000, { normal: 10, night: 5, holiday: 4, over60: 3 })).toEqual({
      normal: 12500,
      night: 7500,
      holiday: 5400,
      over60: 4500,
      total: 29900,
    });
  });

  it('端数は各項で切り捨て: 時給1013円, 普通3時間 → floor(3798.75)=3798', () => {
    expect(overtimeBreakdown(1013, { normal: 3 })).toEqual({
      normal: 3798,
      night: 0,
      holiday: 0,
      over60: 0,
      total: 3798,
    });
  });

  it('時数の指定なし（空オブジェクト）→ 全て0', () => {
    expect(overtimeBreakdown(1000, {})).toEqual({
      normal: 0,
      night: 0,
      holiday: 0,
      over60: 0,
      total: 0,
    });
  });

  it('引数省略でも全て0', () => {
    expect(overtimeBreakdown(1000)).toEqual({
      normal: 0,
      night: 0,
      holiday: 0,
      over60: 0,
      total: 0,
    });
  });

  it('時給0円 → 全て0', () => {
    expect(overtimeBreakdown(0, { normal: 10, night: 5 })).toEqual({
      normal: 0,
      night: 0,
      holiday: 0,
      over60: 0,
      total: 0,
    });
  });

  it('時給が非数値 → 全て0', () => {
    expect(overtimeBreakdown(NaN, { normal: 10 })).toEqual({
      normal: 0,
      night: 0,
      holiday: 0,
      over60: 0,
      total: 0,
    });
  });

  it('負の時数は0扱い', () => {
    expect(overtimeBreakdown(1000, { normal: -10, night: 5 })).toEqual({
      normal: 0,
      night: 7500,
      holiday: 0,
      over60: 0,
      total: 7500,
    });
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
