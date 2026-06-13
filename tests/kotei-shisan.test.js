import { describe, it, expect } from 'vitest';
import { koteiShisan, splitQuarterly } from '../src/lib/koteiShisan.js';

describe('koteiShisan(固定資産税・都市計画税)', () => {
  it('非住宅（特例なし）: 評価額1000万 → 固定140000, 都計30000', () => {
    // 固定: 10,000,000 × 1.4% = 140,000 / 都計: 10,000,000 × 0.3% = 30,000
    const r = koteiShisan(10000000, 'none');
    expect(r.fixedTax).toBe(140000);
    expect(r.cityTax).toBe(30000);
    expect(r.total).toBe(170000);
  });

  it('小規模住宅用地: 固定は1/6, 都計は1/3', () => {
    // 評価額 1,200万
    // 固定 課税標準 = 12,000,000 / 6 = 2,000,000 → ×1.4% = 28,000
    // 都計 課税標準 = 12,000,000 / 3 = 4,000,000 → ×0.3% = 12,000
    const r = koteiShisan(12000000, 'small');
    expect(r.fixedTax).toBe(28000);
    expect(r.cityTax).toBe(12000);
    expect(r.total).toBe(40000);
  });

  it('一般住宅用地: 固定は1/3, 都計は2/3', () => {
    // 評価額 1,200万
    // 固定 課税標準 = 12,000,000 / 3 = 4,000,000 → ×1.4% = 56,000
    // 都計 課税標準 = 12,000,000 × 2/3 = 8,000,000 → ×0.3% = 24,000
    const r = koteiShisan(12000000, 'general');
    expect(r.fixedTax).toBe(56000);
    expect(r.cityTax).toBe(24000);
    expect(r.total).toBe(80000);
  });

  it('課税標準・税額は円未満切り捨て', () => {
    // 評価額 1,000,001 / none
    // 固定: 1,000,001 × 0.014 = 14,000.014 → 14,000
    // 都計: 1,000,001 × 0.003 = 3,000.003 → 3,000
    const r = koteiShisan(1000001, 'none');
    expect(r.fixedTax).toBe(14000);
    expect(r.cityTax).toBe(3000);
  });

  it('小規模で端数が出るケースも切り捨て', () => {
    // 評価額 1,000,000 / small
    // 固定 課税標準 = floor(1,000,000 / 6) = 166,666 → ×0.014 = 2,333.324 → 2,333
    // 都計 課税標準 = floor(1,000,000 / 3) = 333,333 → ×0.003 = 999.999 → 999
    const r = koteiShisan(1000000, 'small');
    expect(r.fixedTax).toBe(2333);
    expect(r.cityTax).toBe(999);
  });

  it('返り値に課税標準額も含む', () => {
    const r = koteiShisan(12000000, 'small');
    expect(r.fixedBase).toBe(2000000);
    expect(r.cityBase).toBe(4000000);
  });

  it('0円 → 全て0', () => {
    expect(koteiShisan(0, 'none')).toEqual({
      fixedBase: 0, cityBase: 0, fixedTax: 0, cityTax: 0, total: 0,
    });
  });

  it('空文字 → 全て0', () => {
    const r = koteiShisan('', 'none');
    expect(r.total).toBe(0);
  });

  it('NaN → 全て0', () => {
    const r = koteiShisan(NaN, 'small');
    expect(r.total).toBe(0);
  });

  it('負数 → 全て0', () => {
    const r = koteiShisan(-5000000, 'general');
    expect(r.total).toBe(0);
  });

  it('未知の区分は非住宅扱い（特例なし）', () => {
    const r = koteiShisan(10000000, 'unknown');
    expect(r.fixedTax).toBe(140000);
    expect(r.cityTax).toBe(30000);
  });
});

describe('splitQuarterly(年税額の4期分割)', () => {
  it('割り切れる: 170000 → [42500,42500,42500,42500]', () => {
    expect(splitQuarterly(170000)).toEqual([42500, 42500, 42500, 42500]);
  });

  it('端数は第1期に寄せる: 100000 → floor=25000、余り0', () => {
    expect(splitQuarterly(100000)).toEqual([25000, 25000, 25000, 25000]);
  });

  it('端数あり: 100003 → 各25000、余り3を第1期に → [25003,25000,25000,25000]', () => {
    expect(splitQuarterly(100003)).toEqual([25003, 25000, 25000, 25000]);
  });

  it('合計は元の年税額と一致', () => {
    const parts = splitQuarterly(170002);
    expect(parts.reduce((a, b) => a + b, 0)).toBe(170002);
  });

  it('0 → [0,0,0,0]', () => {
    expect(splitQuarterly(0)).toEqual([0, 0, 0, 0]);
  });

  it('負数・NaN → [0,0,0,0]', () => {
    expect(splitQuarterly(-100)).toEqual([0, 0, 0, 0]);
    expect(splitQuarterly(NaN)).toEqual([0, 0, 0, 0]);
  });
});
