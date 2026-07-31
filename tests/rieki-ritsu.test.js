import { describe, expect, it } from 'vitest';
import {
  calculateGrossMargin,
  priceForTargetMargin,
  calculateSalesProfitMargin,
} from '../src/lib/rieki-ritsu.js';

describe('calculateGrossMargin', () => {
  it('原价700円、售价1000円得到粗利300円和粗利率30%', () => {
    expect(calculateGrossMargin(700, 1000)).toEqual({
      salePrice: 1000,
      cost: 700,
      additionalCosts: 0,
      totalCost: 700,
      feeRate: 0,
      feeAmount: 0,
      grossProfit: 300,
      grossMarginRate: 30,
      costRate: 70,
      markupRate: 300 / 700 * 100,
    });
  });

  it('固定成本和按售价计费的手续费都会从粗利扣除', () => {
    expect(calculateGrossMargin(700, 1000, 100, 10)).toEqual({
      salePrice: 1000,
      cost: 700,
      additionalCosts: 100,
      totalCost: 800,
      feeRate: 10,
      feeAmount: 100,
      grossProfit: 100,
      grossMarginRate: 10,
      costRate: 80,
      markupRate: 12.5,
    });
  });

  it('成本超过售价时保留负粗利和负粗利率', () => {
    const result = calculateGrossMargin(1200, 1000);
    expect(result.grossProfit).toBe(-200);
    expect(result.grossMarginRate).toBe(-20);
    expect(result.markupRate).toBeCloseTo(-16.6666666667);
  });

  it('金额输入统一向下舍去到整数日元', () => {
    expect(calculateGrossMargin(700.9, 1000.9, 10.9, 2.5)).toMatchObject({
      salePrice: 1000,
      cost: 700,
      additionalCosts: 10,
      feeAmount: 25,
      grossProfit: 265,
    });
  });

  it('总成本为0时成本加成率无定义', () => {
    const result = calculateGrossMargin(0, 1000);
    expect(result.grossMarginRate).toBe(100);
    expect(result.costRate).toBe(0);
    expect(result.markupRate).toBeNull();
  });

  it('拒绝售价0、负金额、手续费100%以上和非数值', () => {
    expect(calculateGrossMargin(100, 0)).toBeNull();
    expect(calculateGrossMargin(-1, 100)).toBeNull();
    expect(calculateGrossMargin(10, 100, -1)).toBeNull();
    expect(calculateGrossMargin(10, 100, 0, 100)).toBeNull();
    expect(calculateGrossMargin(Number.NaN, 100)).toBeNull();
  });
});

describe('priceForTargetMargin', () => {
  it('原价700円、目标粗利率30%反推售价1000円', () => {
    expect(priceForTargetMargin(700, 30)).toEqual({
      salePrice: 1000,
      cost: 700,
      additionalCosts: 0,
      totalCost: 700,
      feeRate: 0,
      feeAmount: 0,
      grossProfit: 300,
      targetMarginRate: 30,
      achievedMarginRate: 30,
    });
  });

  it('无法整除的售价按整数日元向下舍去并返回实际粗利率', () => {
    const result = priceForTargetMargin(1000, 30);
    expect(result.salePrice).toBe(1428);
    expect(result.grossProfit).toBe(428);
    expect(result.achievedMarginRate).toBeCloseTo(428 / 1428 * 100);
    expect(result.achievedMarginRate).toBeLessThan(30);
  });

  it('反推售价同时考虑固定成本和手续费率', () => {
    const result = priceForTargetMargin(700, 20, 100, 10);
    expect(result).toMatchObject({
      salePrice: 1142,
      totalCost: 800,
      feeAmount: 114,
      grossProfit: 228,
      targetMarginRate: 20,
    });
    expect(result.achievedMarginRate).toBeCloseTo(228 / 1142 * 100);
  });

  it('目标0%时售价等于总成本', () => {
    expect(priceForTargetMargin(1000, 0).salePrice).toBe(1000);
  });

  it('总成本0时返回0円且实际率无定义', () => {
    expect(priceForTargetMargin(0, 30)).toMatchObject({
      salePrice: 0,
      grossProfit: 0,
      achievedMarginRate: null,
    });
  });

  it('拒绝目标率与手续费合计100%以上及无效金额', () => {
    expect(priceForTargetMargin(1000, 90, 0, 10)).toBeNull();
    expect(priceForTargetMargin(1000, 100)).toBeNull();
    expect(priceForTargetMargin(-1, 30)).toBeNull();
    expect(priceForTargetMargin(1000, -1)).toBeNull();
  });
});

describe('calculateSalesProfitMargin', () => {
  it('销售额100万円、利润10万円得到销售利润率10%', () => {
    expect(calculateSalesProfitMargin(1_000_000, 100_000)).toEqual({
      sales: 1_000_000,
      profit: 100_000,
      profitMarginRate: 10,
    });
  });

  it('亏损时返回负销售利润率', () => {
    expect(calculateSalesProfitMargin(1_000_000, -50_000).profitMarginRate).toBe(-5);
  });

  it('金额含小数时按整数日元向下舍去', () => {
    expect(calculateSalesProfitMargin(1000.9, 100.9)).toEqual({
      sales: 1000,
      profit: 100,
      profitMarginRate: 10,
    });
  });

  it('拒绝销售额0、负销售额和非数值利润', () => {
    expect(calculateSalesProfitMargin(0, 0)).toBeNull();
    expect(calculateSalesProfitMargin(-1, 10)).toBeNull();
    expect(calculateSalesProfitMargin(100, Number.NaN)).toBeNull();
  });
});
