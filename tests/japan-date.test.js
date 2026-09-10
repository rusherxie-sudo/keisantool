import { describe, expect, it } from 'vitest';
import { japanDateParts } from '../src/lib/japanDate.js';

describe('japanDateParts', () => {
  it('uses the Japanese calendar day at the UTC new-year boundary', () => {
    expect(japanDateParts(new Date('2026-12-31T15:30:00Z'))).toEqual({
      year: 2027,
      month: 1,
      day: 1,
    });
  });

  it('uses the Japanese calendar month at the UTC month boundary', () => {
    expect(japanDateParts(new Date('2026-08-31T15:30:00Z'))).toEqual({
      year: 2026,
      month: 9,
      day: 1,
    });
  });

  it('returns null for an invalid date', () => {
    expect(japanDateParts(new Date('invalid'))).toBeNull();
  });
});
