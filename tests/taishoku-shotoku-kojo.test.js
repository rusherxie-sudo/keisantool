import { describe, it, expect } from 'vitest';
import { calculateRetirementDeduction } from '../src/lib/taishoku-shotoku-kojo.js';
describe('退職所得控除の基礎額', () => {
 it.each([[1,800000],[2,800000],[3,1200000],[11,4400000],[19,7600000],[20,8000000],[21,8700000]])('%i年', (years, amount) => expect(calculateRetirementDeduction(years,false)).toBe(amount));
 it.each([[1,1800000],[21,9700000]])('障害が直接原因 %i年', (years, amount) => expect(calculateRetirementDeduction(years,true)).toBe(amount));
 it.each([0,-1,1.5,NaN,Infinity,'',null])('不正値はnull', years => expect(calculateRetirementDeduction(years,false)).toBeNull());
});
