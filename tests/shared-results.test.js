import {describe,it,expect} from 'vitest';
import {sharedResult,sharedResultUrl,readSharedResult} from '../src/lib/shared-results.js';
const cases=[
 ['hayasa',{mode:'convert',value:30,unit:'kmh'},'8.3333 m/s'],
 ['hayasa',{mode:'speed',distance:10,distanceUnit:'km',hours:0,minutes:30,seconds:0},'20 km/h'],
 ['hayasa',{mode:'distance',value:20,unit:'kmh',hours:0,minutes:30,seconds:0},'10 km'],
 ['hayasa',{mode:'time',distance:10,distanceUnit:'km',value:20,unit:'kmh'},'30分0秒'],
 ['kinzoku-nensuu',{join:'2017-04-01',reference:'2026-10-01'},'10年目'],
 ['eigyoubi',{year:2026,month:9,weekdays:[1,2,3,4,5],extra:['2026-09-01']},'18日'],
 ['taishoku-yukyu',{retire:'2026-10-30',balance:5,weekdays:[1,2,3,4,5],extra:[]},'2026-10-23'],
 ['nenmatsu-nenshi',{start:'2026-12-26',end:'2027-01-05',weekdays:[1,2,3,4,5],extra:['2026-12-29','2026-12-30','2026-12-31','2027-01-01','2027-01-02','2027-01-03']},'8日'],
];
describe('URL results v1',()=>{
 it.each(cases)('restores %s conditions and independently expected result', (tool,input,answer)=>{
  const url=new URL(sharedResultUrl(tool,input));expect(url.search).toBe('');expect(url.pathname).toBe(`/result/${tool}/`);
  const r=readSharedResult(tool,url.hash);expect(r.input).toEqual(input);expect(r.facts.map(f=>f[1])).toContain(answer);
 });
 it('normalizes duplicates and fixes reference dates',()=>{
  const r=sharedResult('eigyoubi',{year:2026,month:9,weekdays:[5,1,1],extra:['2026-09-01','2026-09-01']});expect(r.input.weekdays).toEqual([1,5]);expect(r.input.extra).toEqual(['2026-09-01']);
 });
 it.each(['#v2=%7B%7D','#v1=%ZZ','#v1=null','#v1=[]','#v1='+encodeURIComponent('{"__proto__":{"x":1}}'),'#v1='+encodeURIComponent('{"mode":"convert","value":30,"unit":"<img>"}'),'#v1='+('x'.repeat(6001))])('rejects malformed or unsupported payload %s',hash=>expect(readSharedResult('hayasa',hash)).toBeNull());
 it('does not accept supplied answers, non-finite values or invalid dates',()=>{
  expect(sharedResult('hayasa',{mode:'convert',value:30,unit:'kmh',answer:'999'})).toBeNull();expect(sharedResult('hayasa',{mode:'convert',value:Infinity,unit:'kmh'})).toBeNull();expect(sharedResult('kinzoku-nensuu',{join:'2026-02-30',reference:'2026-03-01'})).toBeNull();expect(sharedResult('eigyoubi',{year:2026,month:1,weekdays:[1],extra:['2026-02-30']})).toBeNull();expect(sharedResult('unknown',{})).toBeNull();expect(sharedResult('hayasa',{mode:'toString'})).toBeNull();
 });
});
