import { describe, it, expect } from 'vitest';
import { calculateInventoryTurnover } from '../src/lib/zaiko-kaiten.js';
describe('在庫回転率', () => {
 const base = { cost: 1200000, opening: 200000, closing: 400000, days: 365 };
 it('売上原価基準の例', () => expect(calculateInventoryTurnover(base)).toEqual({ average: 300000, turnover: 4, turnoverDays: 91.25 }));
 it('売上原価0は回転率0、期間は算出不可', () => expect(calculateInventoryTurnover({...base,cost:0})).toMatchObject({turnover:0,turnoverDays:null}));
 it('小数と別期間を計算', () => expect(calculateInventoryTurnover({cost:15,opening:2.5,closing:3.5,days:90})).toEqual({average:3,turnover:5,turnoverDays:18}));
 it.each([{...base,opening:0,closing:0},{...base,cost:-1},{...base,days:0},{...base,opening:NaN},{...base,closing:Infinity}])('不正値はnull', x => expect(calculateInventoryTurnover(x)).toBeNull());
});
