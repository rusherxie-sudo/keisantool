import { describe, it, expect } from 'vitest';
import { compoundLumpSum, compoundReserve } from '../src/lib/fukuri.js';

describe('compoundLumpSum — 一括運用（年複利）', () => {
  it('利率0%：将来額=元本、利息0', () => {
    expect(compoundLumpSum(1000000, 0, 10)).toEqual({
      future: 1000000,
      principal: 1000000,
      interest: 0,
    });
  });

  it('年複利の標準式と一致（円未満切り捨て）', () => {
    const P = 1000000, ratePct = 3, years = 10;
    const expectedFuture = Math.floor(P * Math.pow(1 + ratePct / 100, years));
    const res = compoundLumpSum(P, ratePct, years);
    expect(res.future).toBe(expectedFuture);
    expect(res.principal).toBe(P);
    expect(res.interest).toBe(expectedFuture - P);
  });

  it('外部アンカー：一括100万円・年5%・10年 → 1,628,894円（1.05^10=1.62889…）', () => {
    expect(compoundLumpSum(1000000, 5, 10).future).toBe(1628894);
  });

  it('利率が高いほど将来額は増える', () => {
    expect(compoundLumpSum(1000000, 5, 20).future)
      .toBeGreaterThan(compoundLumpSum(1000000, 3, 20).future);
  });

  it('無効な入力は null', () => {
    expect(compoundLumpSum(0, 3, 10)).toBeNull();
    expect(compoundLumpSum(1000000, -1, 10)).toBeNull();
    expect(compoundLumpSum(1000000, 3, 0)).toBeNull();
  });
});

describe('compoundReserve — 毎月積立（月複利）', () => {
  it('利率0%：将来額=毎月×回数、利息0', () => {
    expect(compoundReserve(10000, 0, 10)).toEqual({
      future: 1200000,
      principal: 1200000,
      interest: 0,
    });
  });

  it('毎月積立の年金終価式と一致（円未満切り捨て）', () => {
    // FV = m · ((1+i)^N − 1) / i、i=年利/12、N=年×12（期末払い）
    const m = 30000, ratePct = 3, years = 20;
    const i = ratePct / 100 / 12;
    const N = years * 12;
    const expectedFuture = Math.floor((m * (Math.pow(1 + i, N) - 1)) / i);
    const res = compoundReserve(m, ratePct, years);
    expect(res.future).toBe(expectedFuture);
    expect(res.principal).toBe(m * N);
    expect(res.interest).toBe(expectedFuture - m * N);
  });

  it('外部アンカー：毎月3万円・年3%・20年 → 9,849,059円', () => {
    // 生値 9,849,059.94（金融庁つみたてシミュレーターの概算985万円と整合）。
    // 実装式をなぞらない固定値アンカー：式を書き間違えたら必ず落ちる。
    expect(compoundReserve(30000, 3, 20)).toEqual({
      future: 9849059,
      principal: 7200000,
      interest: 9849059 - 7200000,
    });
  });

  it('利息（運用益）は正になる', () => {
    expect(compoundReserve(30000, 3, 20).interest).toBeGreaterThan(0);
  });

  it('無効な入力は null', () => {
    expect(compoundReserve(0, 3, 10)).toBeNull();
    expect(compoundReserve(30000, 3, 0)).toBeNull();
  });
});
