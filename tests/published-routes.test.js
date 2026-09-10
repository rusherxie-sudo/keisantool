import { describe, expect, it } from 'vitest';
import {
  PUBLISHED_ROKUYO_YEARS,
  PUBLISHED_SHUKUJITSU_YEARS,
} from '../src/lib/publishedRoutes.js';

describe('published year routes', () => {
  it('keeps the already-published holiday years stable', () => {
    expect(PUBLISHED_SHUKUJITSU_YEARS).toEqual([2025, 2026, 2027, 2028, 2029]);
  });

  it('keeps the already-published rokuyo years stable', () => {
    expect(PUBLISHED_ROKUYO_YEARS).toEqual([2025, 2026, 2027, 2028]);
  });
});
