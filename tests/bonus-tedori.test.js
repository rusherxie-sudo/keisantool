import { describe, it, expect } from 'vitest';
import { bonusRate2026, calculateBonus } from '../src/lib/bonus-tedori.js';
import { BONUS_RATES_2026 } from '../src/data/bonus-rates-2026.js';
const normal = {gross: 500000, socialInsurance: 75000, previousSalary: 300000, dependents: 0};
describe('2026賞与の手取り',()=>{
 it('国税庁No.2523の独立算例：3人、285454円、389558円→7954円',()=>{
  expect(calculateBonus({...normal,gross:389558,socialInsurance:0,previousSalary:285454,dependents:3})).toMatchObject({status:'ok',rate:2.042,withholding:7954,takeHome:381604});
 });
 it('社保を税基から引き、社内積立は課税後に引く',()=>{
  expect(calculateBonus({...normal,otherDeductions:5000})).toMatchObject({taxableBonus:425000,rate:6.126,withholding:26035,takeHome:393965});
 });
 it('1円未満を切り捨て、浮動小数の税率乗算を避ける',()=>{
  expect(calculateBonus({...normal,gross:100000,socialInsurance:0,previousSalary:200000})).toMatchObject({withholding:4084});
 });
 it('公式PDFの代表境界を確認する',()=>{
  expect(bonusRate2026(81999,0)).toBe(0);expect(bonusRate2026(82000,0)).toBe(2042);
  expect(bonusRate2026(93999,0)).toBe(2042);expect(bonusRate2026(94000,0)).toBe(4084);
  expect(bonusRate2026(299999,3)).toBe(2042);expect(bonusRate2026(300000,3)).toBe(4084);
  expect(bonusRate2026(3717000,7)).toBe(45945);expect(bonusRate2026(383000,20)).toBe(4084);
 });
 it('全区間の上端・下端で隣の税率へ切り替える',()=>{
  for(let c=0;c<8;c++)for(let i=1;i<BONUS_RATES_2026.length;i++){
   const row=BONUS_RATES_2026[i],prev=BONUS_RATES_2026[i-1];
   expect(bonusRate2026(row.minimums[c]-1,c)).toBe(prev.rateMilliPercent);
   expect(bonusRate2026(row.minimums[c],c)).toBe(row.rateMilliPercent);
  }
 });
 it('乙欄を独立に選び扶養人数で変えない',()=>{
  expect(bonusRate2026(223999,0,'otsu')).toBe(10210);expect(bonusRate2026(224000,0,'otsu')).toBe(20420);
  expect(bonusRate2026(295000,7,'otsu')).toBe(30630);expect(bonusRate2026(527000,0,'otsu')).toBe(38798);
  expect(bonusRate2026(1118000,0,'otsu')).toBe(45945);
 });
 it('十倍ちょうどは通常計算、1円超と前月0円は特別計算へ案内',()=>{
  expect(calculateBonus({...normal,gross:1000000,socialInsurance:0,previousSalary:100000}).status).toBe('ok');
  expect(calculateBonus({...normal,gross:1000001,socialInsurance:0,previousSalary:100000}).status).toBe('unsupported');
  expect(calculateBonus({...normal,previousSalary:0}).status).toBe('unsupported');
 });
 it.each([{gross:-1},{gross:NaN},{gross:Infinity},{gross:1.5},{gross:1000000001},{socialInsurance:500001},{otherDeductions:500000},{dependents:1.5},{taxClass:'other'}])('不正入力を拒否 %j',input=>expect(calculateBonus({...normal,...input}).status).toBe('invalid'));
 it('未対応年を誤った税率で計算しない',()=>expect(calculateBonus({...normal,year:2027}).status).toBe('unsupported'));
});
