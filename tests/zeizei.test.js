import { describe, it, expect } from 'vitest';
import { taxIncluded, taxExcluded, discount } from '../src/lib/zeizei.js';

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

  it('端数は切り捨て: 217円 @10% → 税抜は floor(217/1.1)=197, 税20', () => {
    expect(taxExcluded(217, 0.1)).toEqual({ net: 197, tax: 20 });
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
