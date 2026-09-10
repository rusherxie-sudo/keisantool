import { describe, expect, it } from 'vitest';
import { shouldIncludeInSitemap } from '../src/lib/sitemap.js';

const now = new Date('2026-09-10T12:00:00Z');

describe('shouldIncludeInSitemap', () => {
  it('excludes noindex zodiac pairs', () => {
    expect(shouldIncludeInSitemap('https://keisantool.com/seiza-aisho/ohitsuji-oushi/', now)).toBe(false);
  });

  it('excludes aliases whose canonical points at the current hub', () => {
    expect(shouldIncludeInSitemap('https://keisantool.com/shukujitsu/2026/', now)).toBe(false);
    expect(shouldIncludeInSitemap('https://keisantool.com/rokuyo/2026-09/', now)).toBe(false);
  });

  it('keeps other canonical pages', () => {
    expect(shouldIncludeInSitemap('https://keisantool.com/shukujitsu/2027/', now)).toBe(true);
    expect(shouldIncludeInSitemap('https://keisantool.com/kinzoku-nensuu/', now)).toBe(true);
  });
});
