import { describe, it, expect } from 'vitest';
import { taxIncluded, taxExcluded, discount, sumItems } from '../src/lib/zeizei.js';

describe('taxIncluded(税抜 → 税込)', () => {
  it('1000円 @10% → 税100, 税込1100', () => {
    expect(taxIncluded(1000, 0.1)).toEqual({ tax: 100, total: 1100 });
  });

  it('1000円 @8%（軽減税率）→ 税80, 税込1080', () => {
    expect(taxIncluded(1000, 0.08)).toEqual({ tax: 80, total: 1080 });
  });

  it('端数は切り捨て: 198円 @10% → 税19.8 を切り捨て19, 税込217', () => {
    expect(taxIncluded(198, 0.1)).toEqual({ tax: 19, total: 217 });
  });

  it('0円 → 税0, 税込0', () => {
    expect(taxIncluded(0, 0.1)).toEqual({ tax: 0, total: 0 });
  });
});

describe('taxExcluded(税込 → 税抜)', () => {
  it('1100円 @10% → 税抜1000, 税100', () => {
    expect(taxExcluded(1100, 0.1)).toEqual({ net: 1000, tax: 100 });
  });

  it('1080円 @8%（軽減税率）→ 税抜1000, 税80', () => {
    expect(taxExcluded(1080, 0.08)).toEqual({ net: 1000, tax: 80 });
  });

  it('内税を切り捨て: 217円 @10% → 税は floor(217×10/110)=19, 税抜198', () => {
    expect(taxExcluded(217, 0.1)).toEqual({ net: 198, tax: 19 });
  });

  it('2,500円 @10% → 内税227円、税抜2,273円', () => {
    expect(taxExcluded(2500, 0.1)).toEqual({ net: 2273, tax: 227 });
  });
});

describe('discount(割引計算)', () => {
  it('定価1000円 30%OFF → 割引後700, 節約300', () => {
    expect(discount(1000, 30)).toEqual({ discounted: 700, saved: 300 });
  });

  it('端数は切り捨て: 定価1000円 33%OFF → 節約330, 割引後670', () => {
    expect(discount(1000, 33)).toEqual({ discounted: 670, saved: 330 });
  });

  it('0%OFF → 割引後は定価のまま, 節約0', () => {
    expect(discount(5000, 0)).toEqual({ discounted: 5000, saved: 0 });
  });
});

describe('sumItems(複数商品の合算)', () => {
  it('税抜2商品（10%と8%）→ tax=180, incl=2180, excl=2000', () => {
    const items = [
      { amount: 1000, rate: 0.1, taxIncluded: false },
      { amount: 1000, rate: 0.08, taxIncluded: false },
    ];
    expect(sumItems(items)).toEqual({ subtotalExcl: 2000, totalTax: 180, totalIncl: 2180 });
  });

  it('税込商品（10%）→ 税抜逆算と税額が現有 taxExcluded と一致', () => {
    const items = [{ amount: 1100, rate: 0.1, taxIncluded: true }];
    expect(sumItems(items)).toEqual({ subtotalExcl: 1000, totalTax: 100, totalIncl: 1100 });
  });

  it('税抜と税込の混在を合算', () => {
    const items = [
      { amount: 1000, rate: 0.1, taxIncluded: false }, // excl1000 tax100 incl1100
      { amount: 1080, rate: 0.08, taxIncluded: true },  // excl1000 tax80  incl1080
    ];
    expect(sumItems(items)).toEqual({ subtotalExcl: 2000, totalTax: 180, totalIncl: 2180 });
  });

  it('同じ税率の税抜商品は合計後に1回だけ端数処理: 198円@10% ×2 → tax=39, incl=435', () => {
    const items = [
      { amount: 198, rate: 0.1, taxIncluded: false },
      { amount: 198, rate: 0.1, taxIncluded: false },
    ];
    expect(sumItems(items)).toEqual({ subtotalExcl: 396, totalTax: 39, totalIncl: 435 });
  });

  it('同じ税率の税込商品も合計後に内税を1回だけ逆算する', () => {
    const items = [
      { amount: 111, rate: 0.1, taxIncluded: true },
      { amount: 111, rate: 0.1, taxIncluded: true },
    ];
    expect(sumItems(items)).toEqual({ subtotalExcl: 202, totalTax: 20, totalIncl: 222 });
  });

  it('10%と8%は税率別に端数処理する', () => {
    const items = [
      { amount: 198, rate: 0.1, taxIncluded: false },
      { amount: 198, rate: 0.1, taxIncluded: false },
      { amount: 198, rate: 0.08, taxIncluded: false },
      { amount: 198, rate: 0.08, taxIncluded: false },
    ];
    expect(sumItems(items)).toEqual({ subtotalExcl: 792, totalTax: 70, totalIncl: 862 });
  });

  it('空配列 → 全て0', () => {
    expect(sumItems([])).toEqual({ subtotalExcl: 0, totalTax: 0, totalIncl: 0 });
  });

  it('非配列 → 全て0', () => {
    expect(sumItems(null)).toEqual({ subtotalExcl: 0, totalTax: 0, totalIncl: 0 });
  });

  it('不正な項目（非数値・負数・金額未入力）はスキップ（0扱い）', () => {
    const items = [
      { amount: 1000, rate: 0.1, taxIncluded: false },
      { amount: NaN, rate: 0.1, taxIncluded: false },
      { amount: -500, rate: 0.1, taxIncluded: false },
      { amount: '', rate: 0.1, taxIncluded: false },
    ];
    expect(sumItems(items)).toEqual({ subtotalExcl: 1000, totalTax: 100, totalIncl: 1100 });
  });
});

describe('不正な入力は全て0を返す（ページ側で非表示にする）', () => {
  it('taxIncluded: 非数値', () => {
    expect(taxIncluded(NaN, 0.1)).toEqual({ tax: 0, total: 0 });
  });
  it('taxIncluded: 負数', () => {
    expect(taxIncluded(-100, 0.1)).toEqual({ tax: 0, total: 0 });
  });
  it('taxExcluded: 非数値', () => {
    expect(taxExcluded(NaN, 0.1)).toEqual({ net: 0, tax: 0 });
  });
  it('discount: 負の割引率', () => {
    expect(discount(1000, -5)).toEqual({ discounted: 0, saved: 0 });
  });
  it('discount: 割引率100超', () => {
    expect(discount(1000, 150)).toEqual({ discounted: 0, saved: 0 });
  });
});
