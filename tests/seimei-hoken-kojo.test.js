import { describe,it,expect } from 'vitest';
import { calculateLifeInsurance as calc } from '../src/lib/seimei-hoken-kojo.js';
describe('生命保険料控除2026',()=>{
 it('生命保険文化センターの新旧併用の例',()=>{
  const r=calc({generalOld:90000,generalNew:39000,medical:15000});
  expect(r.income.total).toBe(62500);expect(r.resident.total).toBe(48500);
  expect(r.income.general).toMatchObject({oldAmount:47500,newAmount:29500,combined:40000,amount:47500});
 });
 it('同じ公式例に子育て特例を適用：75000円／48500円',()=>{
  const r=calc({generalOld:90000,generalNew:39000,medical:15000,under23Dependent:true});
  expect(r.income.total).toBe(75000);expect(r.resident.total).toBe(48500);
 });
 it('旧契約だけには新契約の特例を適用しない',()=>{
  const r=calc({generalOld:150000,under23Dependent:true});expect(r.income.total).toBe(50000);expect(r.enhanced).toBe(false);
 });
 it('3区分合計は所得税12万、住民税7万で止める',()=>{
  const r=calc({generalOld:150000,pensionOld:150000,medical:150000});
  expect(r.income.subtotal).toBe(140000);expect(r.income.total).toBe(120000);
  expect(r.resident.subtotal).toBe(98000);expect(r.resident.total).toBe(70000);
 });
 it.each([[20000,20000],[20001,20001],[40000,30000],[40001,30001],[80000,40000],[80001,40000]])('新契約所得税の境界 %i→%i',(p,a)=>expect(calc({medical:p}).income.medical).toBe(a));
 it.each([[30000,30000],[30001,30001],[60000,45000],[60001,45001],[120000,60000],[120001,60000]])('子育て所得税の境界 %i→%i',(p,a)=>expect(calc({generalNew:p,under23Dependent:true}).income.general.amount).toBe(a));
 it.each([[12000,12000],[12001,12001],[32000,22000],[32001,22001],[56000,28000],[56001,28000]])('住民税新契約の境界 %i→%i',(p,a)=>expect(calc({medical:p}).resident.medical).toBe(a));
 it.each([[15000,15000],[15001,15001],[40000,27500],[40001,27501],[70000,35000],[70001,35000]])('住民税旧契約の境界 %i→%i',(p,a)=>expect(calc({generalOld:p}).resident.general.amount).toBe(a));
 it('少額の新旧契約は併用が有利',()=>{const r=calc({generalNew:10000,generalOld:10000});expect(r.income.general.amount).toBe(20000);expect(r.resident.general.amount).toBe(20000);});
 it('0円は0円控除',()=>{expect(calc().income.total).toBe(0);expect(calc().resident.total).toBe(0);});
 it.each([-1,1.1,NaN,Infinity,1000000001,'10000'])('不正金額 %s',p=>expect(calc({generalNew:p})).toBeNull());
 it('未対応年・不正な扶養指定は計算しない',()=>{expect(calc({year:2027})).toBeNull();expect(calc({under23Dependent:'yes'})).toBeNull();});
});
