import { it, expect } from 'vitest';
import { compareProducts } from '../docs/prototypes/unit-cost/model.mjs';
const product=(overrides={})=>({price:600,quantity:1000,unit:'mL',dose:10,doseUnit:'mL',perDay:2,points:60,...overrides});
it('compares direct per-use cost, cash and points separately; depletion is an experiment',()=>{
 const r=compareProducts([product(),product({price:500,quantity:0.8,unit:'L',points:0})],30);
 expect(r.products[0]).toMatchObject({uses:100,cashPerUse:6,cashOutlay:600,points:60,daysToFinish:50,periodCash:600});
 expect(r.products[1].cashPerUse).toBe(6.25);
 expect(r.products[1].periodCash).toBe(500);
 expect(r.cheapestPerUse).toBe(0);
});
it('normalizes mass and volume independently without density assumptions',()=>{
 expect(compareProducts([product({quantity:1,unit:'kg',dose:5,doseUnit:'g'})],30).products[0].uses).toBe(200);
 expect(()=>compareProducts([product({unit:'g'})],30)).toThrow();
 expect(()=>compareProducts([product(),product({unit:'g',doseUnit:'g'})],30)).toThrow();
});
it('free prices and zero points are valid; zero frequency has no finish date or purchases',()=>{
 const r=compareProducts([product({price:0,points:0,perDay:0})],30).products[0];
 expect(r.cashPerUse).toBe(0);expect(r.daysToFinish).toBeNull();expect(r.periodCash).toBe(0);
});
it.each([{quantity:0},{dose:0},{price:-1},{points:-1},{perDay:-1},{price:''},{quantity:Infinity},{doseUnit:'cups'},{points:NaN}])('rejects invalid input %j',o=>expect(()=>compareProducts([product(o)],30)).toThrow());
it('counts whole packs for spending, supports partial last use, no invented point-to-cash discount',()=>{
 const r=compareProducts([product({quantity:25,dose:10,perDay:1,points:900})],3).products[0];
 expect(r.uses).toBe(2.5);expect(r.periodPacks).toBe(2);expect(r.periodCash).toBe(1200);expect(r.cashPerUse).toBe(240);
 expect(()=>compareProducts([product()],0)).toThrow();
});
it('a positive tiny demand still needs one purchased pack',()=>{
 expect(compareProducts([product({perDay:1e-20})],1).products[0].periodPacks).toBe(1);
});
