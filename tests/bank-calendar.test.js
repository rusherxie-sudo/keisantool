import { describe, expect, it } from 'vitest';
import { bankMonth, nextBankBusinessDay } from '../src/lib/bank-calendar.js';

describe('Japanese bank business days', () => {
  it('excludes January 2 even when it is a weekday and not a public holiday', () => {
    const month = bankMonth(2026, 1);
    expect(month.businessDays).toBe(19);
    expect(month.days.find(d => d.date === '2026-01-02')).toMatchObject({ working: false, bankHoliday: true });
  });

  it('deduplicates public holidays, weekends and bank year-end holidays', () => {
    expect(bankMonth(2027, 1).businessDays).toBe(19);
    expect(bankMonth(2027, 12).businessDays).toBe(22);
    expect(bankMonth(2027, 1).days[0].reason).toBe('元日');
  });

  it('crosses New Year and excludes the reference date', () => {
    expect(nextBankBusinessDay('2026-12-30', 1)).toBe('2027-01-04');
    expect(nextBankBusinessDay('2026-12-30', 2)).toBe('2027-01-05');
    expect(nextBankBusinessDay('2027-01-08', 1)).toBe('2027-01-12');
  });

  it('does not silently calculate outside verified years or normalize invalid inputs', () => {
    expect(bankMonth(2028, 1)).toBeNull();
    expect(bankMonth(2027, 13)).toBeNull();
    for (const date of ['', '2027-02-30', '2025-12-31', '2027-12-31']) {
      expect(nextBankBusinessDay(date, 1)).toBeNull();
    }
    for (const count of [0, -1, 1.5, 261, '', null]) {
      expect(nextBankBusinessDay('2027-01-04', count)).toBeNull();
    }
  });
});
