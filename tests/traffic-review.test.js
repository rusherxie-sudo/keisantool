import { describe, it, expect } from 'vitest';
import { reviewTraffic } from '../scripts/review-traffic.mjs';

function report(dimensions, rows) {
  return { dimensionHeaders: dimensions.map(name => ({ name })), metricHeaders: [{name:'sessions'}], metadata:{timeZone:'Asia/Tokyo'}, rowCount:rows.length, rows:rows.map(([dimensions, sessions]) => ({dimensionValues:dimensions.map(value => ({value})),metricValues:[{value:String(sessions)}]})) };
}
function fixtures() {
  const dates = Array.from({length:16}, (_,i)=>new Date(Date.UTC(2026,8,18+i)).toISOString().slice(0,10).replaceAll('-',''));
  const daily=report(['date'], dates.map(d=>[[d],100]));
  const sources=report(['date','sessionSourceMedium'], dates.flatMap(d=>[[[d,'bing / organic'],70],[[d,'openai / organic'],30]]));
  const landings=report(['date','sessionSourceMedium','landingPage'], dates.flatMap(d=>[[[d,'bing / organic','/nenrei-hayami'],70],[[d,'openai / organic','/nenrei-hayami'],30]]));
  return {daily,sources,landings};
}
describe('read-only traffic review',()=>{
  it('compares identical weekdays, excludes recent processing dates and separates AI',()=>{
    const f=fixtures();f.daily.rows.at(-1).metricValues[0].value='9999';
    const out=reviewTraffic(f,'2026-10-04');
    expect(out).toContain('2026-09-25–2026-10-01');
    expect(out).toContain('2026-09-18–2026-09-24');
    expect(out).toContain('站点会话 700 → 700');
    expect(out).toContain('搜索引擎来源会话 490 → 490');
    expect(out).toContain('AI 来源单列 210 → 210');
    expect(out).toContain('| 2026-10-03 | 9999 | 100 | 9899.0% | 暂定，不用于周结论 |');
    expect(out).toContain('差异超过2%');
  });
  it('does not silently turn missing dates into zero traffic',()=>{
    const f=fixtures();f.daily.rows.splice(0,1);f.daily.rowCount--;
    expect(()=>reviewTraffic(f,'2026-10-04')).toThrow('总量缺失或重复');
  });
  it('rejects truncated or sampled reports',()=>{
    const f=fixtures();f.landings.rowCount++;
    expect(()=>reviewTraffic(f,'2026-10-04')).toThrow('截断');
    f.landings.rowCount--;f.sources.metadata.samplingMetadatas=[{}];
    expect(()=>reviewTraffic(f,'2026-10-04')).toThrow('抽样');
  });
  it('does not accept a wrong property time zone or invalid review date',()=>{
    const f=fixtures();f.daily.metadata.timeZone='America/Los_Angeles';
    expect(()=>reviewTraffic(f,'2026-10-04')).toThrow('时区');
    expect(()=>reviewTraffic(fixtures(),'2026-02-30')).toThrow('有效的复盘日期');
  });
  it('keeps page losses visible even while the overall total increases',()=>{
    const f=fixtures();
    for(const row of f.landings.rows)if(row.dimensionValues[0].value>='20260925'&&row.dimensionValues[1].value==='bing / organic')row.metricValues[0].value='20';
    const out=reviewTraffic(f,'2026-10-04');
    expect(out).toContain('| /nenrei-hayami | 490 | 140 | -350 | -71.4% |');
    expect(out).toContain('被增长掩盖的流失入口');
  });
});
