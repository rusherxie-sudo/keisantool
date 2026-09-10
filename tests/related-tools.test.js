import { describe, expect, it } from 'vitest';
import { getRelated } from '../src/data/tools.js';

const slugs = (items) => items.map((item) => item.slug);

describe('getRelated', () => {
  it('connects the age hub to the next age, school-year, and resume tasks', () => {
    expect(slugs(getRelated('nenrei-hayami'))).toEqual([
      'nenrei',
      'gakunen-hayami',
      'gakureki',
      'wareki',
    ]);
  });

  it('connects service length to paid leave, date, and resume tasks', () => {
    expect(slugs(getRelated('kinzoku-nensuu'))).toEqual([
      'yukyu-nissu',
      'nissu',
      'gakureki',
      'nenrei-hayami',
    ]);
  });

  it('keeps the existing category fallback for tools without an explicit journey', () => {
    const result = getRelated('bunsuu');
    expect(result).toHaveLength(4);
    expect(result.every((item) => item.slug !== 'bunsuu')).toBe(true);
  });
});
