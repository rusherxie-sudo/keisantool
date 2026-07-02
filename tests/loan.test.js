import { describe, it, expect } from 'vitest';
import { equalPayment, equalPrincipal } from '../src/lib/loan.js';

describe('equalPayment — 元利均等返済', () => {
  it('無利息（0%）：毎月 = 借入額 ÷ 回数、利息 0', () => {
    // 1,200,000円・0%・1年（12回）→ 毎月 100,000円
    expect(equalPayment(1200000, 0, 1)).toEqual({
      monthly: 100000,
      total: 1200000,
      interest: 0,
    });
  });

  it('無利息（0%）で割り切れない場合も総額=借入額・利息0（負にならない）', () => {
    // 1,000,000円・0%・1年 → 毎月 floor(83,333.33)=83,333。
    // floor した月額×12=999,996 で利息を出すと −4円 になるバグの回帰テスト。
    expect(equalPayment(1000000, 0, 1)).toEqual({
      monthly: 83333,
      total: 1000000,
      interest: 0,
    });
  });

  it('外部アンカー：3,000万円・1.5%・35年 → 毎月 91,855円', () => {
    // 生値 91,855.33（住宅金融支援機構系シミュレーターと同値。四捨五入でも切り捨てでも 91,855）
    const res = equalPayment(30000000, 1.5, 35);
    expect(res.monthly).toBe(91855);
    expect(res.total).toBe(91855 * 420);
    expect(res.interest).toBe(91855 * 420 - 30000000);
  });

  it('金利あり：標準式（別形）と一致し、円未満は切り捨て', () => {
    const P = 12000000, ratePct = 1, years = 1;
    const r = ratePct / 100 / 12;
    const n = years * 12;
    // 別の代数形： monthly = P·r / (1 − (1+r)^−n)
    const raw = (P * r) / (1 - Math.pow(1 + r, -n));
    const expectedMonthly = Math.floor(raw);
    const res = equalPayment(P, ratePct, years);
    expect(res.monthly).toBe(expectedMonthly);
    expect(res.total).toBe(expectedMonthly * n);
    expect(res.interest).toBe(expectedMonthly * n - P);
  });

  it('金利が高いほど総返済額は増える', () => {
    const low = equalPayment(10000000, 1, 35);
    const high = equalPayment(10000000, 2, 35);
    expect(high.total).toBeGreaterThan(low.total);
  });

  it('無効な入力は null', () => {
    expect(equalPayment(0, 1, 35)).toBeNull();
    expect(equalPayment(10000000, -1, 35)).toBeNull();
    expect(equalPayment(10000000, 1, 0)).toBeNull();
    expect(equalPayment('abc', 1, 35)).toBeNull();
  });
});

describe('equalPrincipal — 元金均等返済', () => {
  it('無利息（0%）：初回=最終=借入額÷回数、利息 0', () => {
    expect(equalPrincipal(1200000, 0, 1)).toEqual({
      firstMonthly: 100000,
      lastMonthly: 100000,
      total: 1200000,
      interest: 0,
    });
  });

  it('金利あり：初回返済額・総利息が閉形式と一致（切り捨て）', () => {
    // P=12,000,000・1%・1年（12回）
    // 毎月元金 = 1,000,000。初月利息 = P·r = 10,000 → 初回 1,010,000
    // 総利息 = P·r·(n+1)/2 = 12,000,000·(0.01/12)·13/2 = 65,000（きれいに割り切れる）
    const res = equalPrincipal(12000000, 1, 1);
    expect(res.firstMonthly).toBe(1010000);
    expect(res.interest).toBe(65000);
    expect(res.total).toBe(12000000 + 65000);
  });

  it('元金均等の最終返済額 = 元金/回数 ×(1+r) を切り捨て', () => {
    // 最終月の残高は元金/回数のみ。利息 = (P/n)·r
    const P = 12000000, n = 12, r = 0.01 / 12;
    const expectedLast = Math.floor(P / n + (P / n) * r);
    expect(equalPrincipal(P, 1, 1).lastMonthly).toBe(expectedLast);
  });

  it('外部アンカー：3,000万円・1.5%・35年 → 初回 108,928円・総利息 7,893,750円', () => {
    // 初回 = 30,000,000/420 + 30,000,000×(0.015/12) = 71,428.57 + 37,500 → floor 108,928
    const res = equalPrincipal(30000000, 1.5, 35);
    expect(res.firstMonthly).toBe(108928);
    expect(res.interest).toBe(7893750);
  });

  it('元金均等の総利息は元利均等より少ない（同条件）', () => {
    const ep = equalPrincipal(10000000, 2, 35);
    const eq = equalPayment(10000000, 2, 35);
    expect(ep.interest).toBeLessThan(eq.interest);
  });

  it('無効な入力は null', () => {
    expect(equalPrincipal(0, 1, 35)).toBeNull();
    expect(equalPrincipal(10000000, 1, 0)).toBeNull();
  });
});
