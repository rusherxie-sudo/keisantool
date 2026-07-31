import { describe, it, expect } from 'vitest';
import {
  TIMEZONES,
  JAPAN_TIME_PAIRS,
  getOffsetMinutes,
  getDiffHours,
  formatDiff,
  convertWallClock,
  getJapanTimePair,
  getJapanTimeProfile,
  buildJapanTimeTable,
} from '../src/lib/jisa.js';

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

describe('convertWallClock(srcTz, dstTz, wall) — 任意の日時を別タイムゾーンへ変換', () => {
  it('東京 2026-07-01 09:00 → ニューヨーク(EDT夏) = 2026-06-30 20:00', () => {
    const r = convertWallClock('Asia/Tokyo', 'America/New_York', {
      year: 2026, month: 7, day: 1, hour: 9, minute: 0,
    });
    expect(r).toEqual({ year: 2026, month: 6, day: 30, hour: 20, minute: 0 });
  });

  it('東京 2026-01-01 12:00 → ロンドン(GMT冬) = 2026-01-01 03:00', () => {
    const r = convertWallClock('Asia/Tokyo', 'Europe/London', {
      year: 2026, month: 1, day: 1, hour: 12, minute: 0,
    });
    expect(r).toEqual({ year: 2026, month: 1, day: 1, hour: 3, minute: 0 });
  });

  it('東京 2026-07-01 12:00 → ムンバイ(IST+5.5) = 2026-07-01 08:30', () => {
    const r = convertWallClock('Asia/Tokyo', 'Asia/Kolkata', {
      year: 2026, month: 7, day: 1, hour: 12, minute: 0,
    });
    expect(r).toEqual({ year: 2026, month: 7, day: 1, hour: 8, minute: 30 });
  });

  it('同一タイムゾーンなら入力と同じ', () => {
    const wall = { year: 2026, month: 3, day: 15, hour: 14, minute: 45 };
    expect(convertWallClock('Asia/Tokyo', 'Asia/Tokyo', wall)).toEqual(wall);
  });

  it('ロンドン → 東京：逆方向（冬）', () => {
    const r = convertWallClock('Europe/London', 'Asia/Tokyo', {
      year: 2026, month: 1, day: 1, hour: 3, minute: 0,
    });
    expect(r).toEqual({ year: 2026, month: 1, day: 1, hour: 12, minute: 0 });
  });
});

describe('日本との時差・都市別ランディングページ用データ', () => {
  it('検索需要の高い12都市を重複なしで収録する', () => {
    expect(JAPAN_TIME_PAIRS).toHaveLength(12);
    expect(new Set(JAPAN_TIME_PAIRS.map((pair) => pair.slug)).size).toBe(12);
    expect(new Set(JAPAN_TIME_PAIRS.map((pair) => pair.tzId)).size).toBe(12);
    expect(JAPAN_TIME_PAIRS.map((pair) => pair.slug)).toEqual(expect.arrayContaining([
      'new-york', 'los-angeles', 'hawaii', 'london', 'paris', 'sydney',
      'seoul', 'shanghai', 'taipei', 'singapore', 'bangkok', 'india',
    ]));
  });

  it('各都市に静的ページ生成と説明に必要な項目がある', () => {
    JAPAN_TIME_PAIRS.forEach((pair) => {
      expect(pair.slug).toMatch(/^[a-z-]+$/);
      expect(pair.city.length).toBeGreaterThan(0);
      expect(pair.country.length).toBeGreaterThan(0);
      expect(pair.tzId).toContain('/');
      expect(['north', 'south', 'none']).toContain(pair.dstPattern);
      expect(pair.summary.length).toBeGreaterThan(0);
    });
  });

  it('slugから都市データを取得し、不明なslugはundefinedを返す', () => {
    expect(getJapanTimePair('new-york')?.tzId).toBe('America/New_York');
    expect(getJapanTimePair('unknown')).toBeUndefined();
  });
});

describe('getJapanTimeProfile(pair, year) — 標準時・夏時間の日本との時差', () => {
  it('ニューヨークは標準時14時間、夏時間13時間、日本が進む', () => {
    expect(getJapanTimeProfile(getJapanTimePair('new-york'), 2026)).toMatchObject({
      standardDiff: 14,
      daylightDiff: 13,
      hasDst: true,
    });
  });

  it('ハワイは通年19時間で夏時間なし', () => {
    expect(getJapanTimeProfile(getJapanTimePair('hawaii'), 2026)).toEqual({
      standardDiff: 19,
      daylightDiff: null,
      hasDst: false,
    });
  });

  it('シドニーは標準時に日本より1時間、夏時間に2時間進む', () => {
    expect(getJapanTimeProfile(getJapanTimePair('sydney'), 2026)).toMatchObject({
      standardDiff: -1,
      daylightDiff: -2,
      hasDst: true,
    });
  });

  it('ソウルは日本と同時刻、インドは日本より3時間30分遅い', () => {
    expect(getJapanTimeProfile(getJapanTimePair('seoul'), 2026).standardDiff).toBe(0);
    expect(getJapanTimeProfile(getJapanTimePair('india'), 2026).standardDiff).toBe(3.5);
  });
});

describe('buildJapanTimeTable(pair, wall) — 日本時刻から現地時刻への早見表', () => {
  it('夏の日本9時はニューヨークで前日20時', () => {
    const row = buildJapanTimeTable(getJapanTimePair('new-york'), {
      year: 2026, month: 7, day: 15,
    }, [9])[0];
    expect(row).toEqual({ japan: '09:00', local: '前日 20:00' });
  });

  it('日本9時はハワイで前日14時', () => {
    const row = buildJapanTimeTable(getJapanTimePair('hawaii'), {
      year: 2026, month: 1, day: 15,
    }, [9])[0];
    expect(row).toEqual({ japan: '09:00', local: '前日 14:00' });
  });

  it('北半球の冬、日本9時は夏時間中のシドニーで同日11時', () => {
    const row = buildJapanTimeTable(getJapanTimePair('sydney'), {
      year: 2026, month: 1, day: 15,
    }, [9])[0];
    expect(row).toEqual({ japan: '09:00', local: '同日 11:00' });
  });
});
