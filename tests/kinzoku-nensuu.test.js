import { describe, expect, it } from 'vitest';
import { calculateServicePeriod, reverseServiceYear } from '../src/lib/kinzoku-nensuu.js';
import { shiftDateBy } from '../src/lib/nissu.js';

describe('入社年の逆算', () => {
  it('現在5年目の入社日範囲を返す（満5年とは異なる）', () => {
    expect(reverseServiceYear(5, '2026-09-14')).toMatchObject({ startDate: '2021-09-15', endDate: '2022-09-14' });
    expect(reverseServiceYear(1, '2026-09-14')).toMatchObject({ startDate: '2025-09-15', endDate: '2026-09-14' });
  });
  it('4月1日入社は周年の前日と当日で入社年が変わる', () => {
    expect(reverseServiceYear(5, '2026-03-31', 'april-first').startDate).toBe('2021-04-01');
    expect(reverseServiceYear(5, '2026-04-01', 'april-first').startDate).toBe('2022-04-01');
  });
  it('平年2月末の周年では2月29日入社も範囲に含む', () => {
    expect(reverseServiceYear(2, '2025-02-28')).toMatchObject({ startDate: '2023-03-01', endDate: '2024-02-29' });
    expect(reverseServiceYear(1, '2025-02-28')).toMatchObject({ startDate: '2024-03-01', endDate: '2025-02-28' });
  });
  it.each(['2024-02-29', '2025-02-28', '2026-01-01', '2026-04-01', '2026-12-31'])('境界の内外を正方向で検算する: %s', (referenceDate) => {
    for (const serviceYear of [1, 2, 5, 100]) {
      const { startDate, endDate } = reverseServiceYear(serviceYear, referenceDate);
      expect(calculateServicePeriod(startDate, referenceDate).serviceYear).toBe(serviceYear);
      expect(calculateServicePeriod(endDate, referenceDate).serviceYear).toBe(serviceYear);
      expect(calculateServicePeriod(shiftDateBy(startDate, -1), referenceDate).serviceYear).toBe(serviceYear + 1);
      if (serviceYear > 1) expect(calculateServicePeriod(shiftDateBy(endDate, 1), referenceDate).serviceYear).toBe(serviceYear - 1);
    }
  });
  it('不正入力を拒否する', () => {
    for (const year of [0, -1, 1.5, 101, NaN, Infinity, '5']) expect(reverseServiceYear(year, '2026-09-14')).toBeNull();
    for (const date of ['', '2026-02-30', '1899-12-31']) expect(reverseServiceYear(5, date)).toBeNull();
    expect(reverseServiceYear(5, '2026-09-14', 'unknown')).toBeNull();
  });
});

describe('calculateServicePeriod — 勤続年数・在籍期間', () => {
  it('入社日から基準日までを暦どおりの年月日と何年目で返す', () => {
    const result = calculateServicePeriod('2020-04-01', '2026-04-01');

    expect(result).toMatchObject({
      duration: { years: 6, months: 0, days: 0 },
      totalDays: 2191,
      serviceYear: 7,
      retirementTaxYears: 6,
      nextAnniversary: { date: '2027-04-01', years: 7, daysRemaining: 365 },
    });
  });

  it('1年未満の端数がある退職所得用勤続年数は切り上げる', () => {
    const result = calculateServicePeriod('2020-04-01', '2026-03-31');

    expect(result.duration).toEqual({ years: 5, months: 11, days: 30 });
    expect(result.retirementTaxYears).toBe(6);
  });

  it('入社当日は勤続1年目・退職所得用は最低1年として扱う', () => {
    const result = calculateServicePeriod('2026-08-01', '2026-08-01');

    expect(result).toMatchObject({
      duration: { years: 0, months: 0, days: 0 },
      totalDays: 0,
      serviceYear: 1,
      retirementTaxYears: 1,
    });
  });

  it('2月29日入社の周年日は翌年2月末に丸める', () => {
    const result = calculateServicePeriod('2024-02-29', '2025-02-28');

    expect(result.duration).toEqual({ years: 1, months: 0, days: 0 });
    expect(result.nextAnniversary).toMatchObject({ date: '2026-02-28', years: 2 });
  });

  it('一般労働者の有給休暇は6ヶ月到達前なら未付与の参考値を返す', () => {
    const result = calculateServicePeriod('2024-04-01', '2024-09-30');

    expect(result.paidLeave).toEqual({
      earnedDays: 0,
      lastGrantDate: null,
      nextGrantDate: '2024-10-01',
      nextGrantDays: 10,
    });
  });

  it('6ヶ月到達時と6年6ヶ月以降の法定付与日数を返す', () => {
    expect(calculateServicePeriod('2024-04-01', '2024-10-01').paidLeave).toEqual({
      earnedDays: 10,
      lastGrantDate: '2024-10-01',
      nextGrantDate: '2025-10-01',
      nextGrantDays: 11,
    });
    expect(calculateServicePeriod('2024-04-01', '2030-10-01').paidLeave).toEqual({
      earnedDays: 20,
      lastGrantDate: '2030-10-01',
      nextGrantDate: '2031-10-01',
      nextGrantDays: 20,
    });
  });

  it('無効日付や基準日が入社日より前ならnullを返す', () => {
    expect(calculateServicePeriod('2026-02-30', '2026-03-01')).toBeNull();
    expect(calculateServicePeriod('2026-08-02', '2026-08-01')).toBeNull();
    expect(calculateServicePeriod('', '2026-08-01')).toBeNull();
  });
});
