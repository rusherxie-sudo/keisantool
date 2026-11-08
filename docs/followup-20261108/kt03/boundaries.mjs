import assert from 'node:assert/strict';import {writeFileSync} from 'node:fs';
import {getMinimumWage} from '../../../src/lib/saitei.js';
import {nextBankBusinessDay} from '../../../src/lib/bank-calendar.js';
import {calcIkuji} from '../../../src/lib/ikuji.js';
import {calculateLifeInsurance} from '../../../src/lib/seimei-hoken-kojo.js';
const cases=[];
function check(name,actual,expected,basis){assert.deepEqual(actual,expected);cases.push({name,actual,expected,basis,pass:true});}
check('Tokyo effective-date eve',getMinimumWage('tokyo','2026-09-30'),1226,'Inherited already verified national official wage table; no new 47-prefecture certification');
check('Tokyo effective-date day',getMinimumWage('tokyo','2026-10-01'),1280,'Inherited already verified national official wage table; dates are explicit test inputs');
check('Bank year rollover',nextBankBusinessDay('2026-12-30',1),'2027-01-04','12/31–1/3 statutory bank closure; 2027-01-04 Monday, hand-derived independently');
const low=calcIkuji({sixMonthWages:180000});check('Benefit official 30-day lower limit', {daily:low.dailyWage,at67:low.amount67,at50:low.amount50},{daily:3203,at67:64380,at50:48045},'MHLW 2026-08-01 PDF physical page18/printed p16; 3203×30×67% floor=64380, ×50%=48045');
const hi=calcIkuji({sixMonthWages:6000000});check('Benefit official 30-day upper limit',{daily:hi.dailyWage,at67:hi.amount67,at50:hi.amount50},{daily:16540,at67:332454,at50:248100},'MHLW same official table, not inferred from implementation constant');
for(const day of ['2026-07-31','2026-08-01','2026-12-31','2027-01-01','2027-07-31','2027-08-01']){
 // Explicit applicability record: these benefit functions have NO date input. Do not invent switching support.
 cases.push({name:'Benefit applicability '+day,applicable:day>='2026-08-01'&&day<='2027-07-31',automation:'No historical/date-switching API; pages explicitly restrict range',outsideRangeAmount:'unknown / must not use fixed calculator',basis:'MHLW cover revision date and p16 validity until R9-07-31',kind:'manual applicability record, not execution of date-switching API'});
}
check('Insurance explicit future year guard',calculateLifeInsurance({year:2028}),null,'Supported years remain 2026/2027; future unknown not defaulted to 2026');
writeFileSync(new URL('boundary-results.json',import.meta.url),JSON.stringify({cases,summary:{executed_assertions:6,manual_applicability_records:6}},null,2)+'\n');console.log({executed_assertions:6,manual_applicability_records:6});
