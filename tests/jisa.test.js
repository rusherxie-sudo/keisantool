import { describe, it, expect } from 'vitest';
import { TIMEZONES, getOffsetMinutes, getDiffHours, formatDiff } from '../src/lib/jisa.js';

const JAN = new Date('2026-01-15T00:00:00Z'); // 冬・DST無し基準日

describe('TIMEZONES（タイムゾーンリスト）', () => {
  it('配列であること', () => {
    expect(Array.isArray(TIMEZONES)).toBe(true);
  });
  it('各要素に id / label フィールドがあること', () => {
    TIMEZONES.forEach((tz) => {
      expect(typeof tz.id).toBe('string');
      expect(typeof tz.label).toBe('string');
    });
  });
  it('Asia/Tokyo が含まれること', () => {
    expect(TIMEZONES.some((tz) => tz.id === 'Asia/Tokyo')).toBe(true);
  });
});

describe('getOffsetMinutes(tzId, date)', () => {
  it('Asia/Tokyo → +540分（JST）', () => {
    expect(getOffsetMinutes('Asia/Tokyo', JAN)).toBe(540);
  });
  it('America/New_York → -300分（冬EST）', () => {
    expect(getOffsetMinutes('America/New_York', JAN)).toBe(-300);
  });
  it('Pacific/Honolulu → -600分（HST・DST無し）', () => {
    expect(getOffsetMinutes('Pacific/Honolulu', JAN)).toBe(-600);
  });
  it('Europe/London → 0分（冬GMT）', () => {
    expect(getOffsetMinutes('Europe/London', JAN)).toBe(0);
  });
  it('Asia/Bangkok → +420分（ICT）', () => {
    expect(getOffsetMinutes('Asia/Bangkok', JAN)).toBe(420);
  });
});

describe('getDiffHours(tz1, tz2, date) — tz1 が tz2 より何時間進んでいるか', () => {
  it('東京 → ニューヨーク(冬) = +14時間', () => {
    expect(getDiffHours('Asia/Tokyo', 'America/New_York', JAN)).toBe(14);
  });
  it('東京 → ハワイ = +19時間', () => {
    expect(getDiffHours('Asia/Tokyo', 'Pacific/Honolulu', JAN)).toBe(19);
  });
  it('東京 → ロンドン(冬) = +9時間', () => {
    expect(getDiffHours('Asia/Tokyo', 'Europe/London', JAN)).toBe(9);
  });
  it('東京 → バンコク = +2時間', () => {
    expect(getDiffHours('Asia/Tokyo', 'Asia/Bangkok', JAN)).toBe(2);
  });
  it('同一タイムゾーン → 0時間', () => {
    expect(getDiffHours('Asia/Tokyo', 'Asia/Tokyo', JAN)).toBe(0);
  });
  it('ニューヨーク → 東京(冬) = -14時間', () => {
    expect(getDiffHours('America/New_York', 'Asia/Tokyo', JAN)).toBe(-14);
  });
});

describe('formatDiff(diffHours)', () => {
  it('0 → 同じ時刻', () => {
    expect(formatDiff(0)).toBe('同じ時刻');
  });
  it('9 → 9時間進んでいる', () => {
    expect(formatDiff(9)).toBe('9時間進んでいる');
  });
  it('-5 → 5時間遅れている', () => {
    expect(formatDiff(-5)).toBe('5時間遅れている');
  });
  it('5.5 → 5時間30分進んでいる', () => {
    expect(formatDiff(5.5)).toBe('5時間30分進んでいる');
  });
  it('-9.5 → 9時間30分遅れている', () => {
    expect(formatDiff(-9.5)).toBe('9時間30分遅れている');
  });
  it('0.5 → 30分進んでいる', () => {
    expect(formatDiff(0.5)).toBe('30分進んでいる');
  });
});
