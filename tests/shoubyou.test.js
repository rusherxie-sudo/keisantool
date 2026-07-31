import { describe, it, expect } from 'vitest';
import {
  applicablePremiumBase,
  standardDailyAmount,
  dailyAmount,
  adjustedDailyAmount,
  monthlyAmount,
  benefitPeriod,
  payableDays,
  calcShoubyou,
} from '../src/lib/shoubyou.js';

describe('applicablePremiumBase(算定に使う平均標準報酬月額)', () => {
  it('被保険者期間12か月以上は入力した平均額を使う', () => {
    expect(applicablePremiumBase(400000, 12)).toBe(400000);
  });

  it('12か月未満は入力平均と32万円の低い方を使う', () => {
    expect(applicablePremiumBase(400000, 6)).toBe(320000);
    expect(applicablePremiumBase(250000, 6)).toBe(250000);
  });

  it('不正な入力は0', () => {
    expect(applicablePremiumBase(0, 12)).toBe(0);
    expect(applicablePremiumBase(-1, 12)).toBe(0);
    expect(applicablePremiumBase(NaN, 12)).toBe(0);
  });
});

describe('dailyAmount(傷病手当金の日額・協会けんぽの端数処理)', () => {
  it('公式例：平均17万円 → 標準報酬日額5,670円 → 支給日額3,780円', () => {
    expect(standardDailyAmount(170000)).toBe(5670);
    expect(dailyAmount(170000)).toBe(3780);
  });

  it('平均20万円 → 6,670円 × 2/3 → 4,447円', () => {
    expect(standardDailyAmount(200000)).toBe(6670);
    expect(dailyAmount(200000)).toBe(4447);
  });

  it('平均30万円 → 10,000円 × 2/3 → 6,667円', () => {
    expect(standardDailyAmount(300000)).toBe(10000);
    expect(dailyAmount(300000)).toBe(6667);
    expect(monthlyAmount(300000)).toBe(200010);
  });

  it('不正な入力は0', () => {
    expect(standardDailyAmount(0)).toBe(0);
    expect(dailyAmount(-100000)).toBe(0);
    expect(dailyAmount(NaN)).toBe(0);
  });
});

describe('adjustedDailyAmount(休業中に給与等が支払われる場合)', () => {
  it('支給日額より少ない給与は差額を返す', () => {
    expect(adjustedDailyAmount(4447, 2000)).toBe(2447);
  });

  it('給与が支給日額以上なら0', () => {
    expect(adjustedDailyAmount(4447, 5000)).toBe(0);
  });

  it('給与なし・不正値は0円として扱う', () => {
    expect(adjustedDailyAmount(4447, '')).toBe(4447);
    expect(adjustedDailyAmount(4447, -1)).toBe(4447);
  });
});

describe('benefitPeriod(待期3日・4日目から・通算1年6か月)', () => {
  it('10日間の連続休業 → 待期3日、支給開始4日目、支給7日', () => {
    expect(benefitPeriod('2026-04-01', '2026-04-10')).toEqual({
      waitingStart: '2026-04-01',
      waitingEnd: '2026-04-03',
      paymentStart: '2026-04-04',
      paymentEnd: '2026-04-10',
      maximumEnd: '2027-10-03',
      requestedPayableDays: 7,
      payableDays: 7,
      isCapped: false,
    });
    expect(payableDays('2026-04-01', '2026-04-10')).toBe(7);
  });

  it('3日以下は待期だけで支給0日', () => {
    expect(payableDays('2026-04-01', '2026-04-03')).toBe(0);
  });

  it('厚労省例：2022-03-04支給開始 → 2023-09-03まで549日', () => {
    const period = benefitPeriod('2022-03-01', '2024-01-01');
    expect(period.paymentStart).toBe('2022-03-04');
    expect(period.maximumEnd).toBe('2023-09-03');
    expect(period.paymentEnd).toBe('2023-09-03');
    expect(period.payableDays).toBe(549);
    expect(period.isCapped).toBe(true);
  });

  it('UTC基準で夏時間境界をまたいでも日数がずれない', () => {
    expect(payableDays('2026-03-06', '2026-03-15')).toBe(7);
  });

  it('逆転・存在しない日付はnull／0', () => {
    expect(benefitPeriod('2026-04-10', '2026-04-01')).toBeNull();
    expect(benefitPeriod('2026-02-30', '2026-03-10')).toBeNull();
    expect(payableDays('', '')).toBe(0);
  });
});

describe('calcShoubyou(傷病手当金シミュレーション)', () => {
  it('平均20万円・10日休業・給与なし → 4,447円×7日', () => {
    expect(calcShoubyou({
      averagePremiumBase: 200000,
      insuredMonths: 12,
      startDate: '2026-04-01',
      endDate: '2026-04-10',
      paidDaily: 0,
    })).toEqual({
      inputAveragePremiumBase: 200000,
      applicablePremiumBase: 200000,
      standardDailyAmount: 6670,
      dailyAmount: 4447,
      adjustedDailyAmount: 4447,
      thirtyDayEstimate: 133410,
      payableDays: 7,
      totalAmount: 31129,
      capApplied: false,
      period: {
        waitingStart: '2026-04-01',
        waitingEnd: '2026-04-03',
        paymentStart: '2026-04-04',
        paymentEnd: '2026-04-10',
        maximumEnd: '2027-10-03',
        requestedPayableDays: 7,
        payableDays: 7,
        isCapped: false,
      },
    });
  });

  it('加入6か月・平均40万円は32万円上限、給与日額2,000円を差し引く', () => {
    const result = calcShoubyou({
      averagePremiumBase: 400000,
      insuredMonths: 6,
      startDate: '2026-04-01',
      endDate: '2026-04-10',
      paidDaily: 2000,
    });
    expect(result.applicablePremiumBase).toBe(320000);
    expect(result.dailyAmount).toBe(7113);
    expect(result.adjustedDailyAmount).toBe(5113);
    expect(result.totalAmount).toBe(35791);
    expect(result.capApplied).toBe(true);
  });

  it('入力不正はゼロ結果', () => {
    const result = calcShoubyou({ averagePremiumBase: 0, startDate: '', endDate: '' });
    expect(result.totalAmount).toBe(0);
    expect(result.period).toBeNull();
  });
});
