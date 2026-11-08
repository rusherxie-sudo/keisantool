// Contract only. No network, credentials, cookies, analytics APIs, or production writes.
import {readFileSync} from 'node:fs';import {fileURLToPath} from 'node:url';
export function aggregate(rows,{startInstrumented=false}={}){
 const allowed=new Set(['rokusei','juminzei','eigyoubi','bmi']);const tools={};const sessions=new Map();
 for(const r of rows){
  if(!allowed.has(r.tool)||!r.session_key||!Number.isFinite(Date.parse(r.timestamp)))throw Error('Require supported tool, authorized session_key, ISO timestamp');
  const t=tools[r.tool]??={eventCounts:{},enteredSessions:0,validResultSessions:0,startedSessions:startInstrumented?0:null,startedThenResultSessions:startInstrumented?0:null};
  t.eventCounts[r.name]=(t.eventCounts[r.name]||0)+1;
  const key=JSON.stringify([r.session_key,r.tool]);if(!sessions.has(key))sessions.set(key,[]);sessions.get(key).push(r);
 }
 for(const events of sessions.values()){
  events.sort((a,b)=>Date.parse(a.timestamp)-Date.parse(b.timestamp));const t=tools[events[0].tool];
  const entry=events.findIndex(e=>e.name==='page_view');if(entry<0)throw Error('Missing same-tool entry; never substitute global sessions');
  const result=events.findIndex((e,i)=>i>=entry&&e.name==='calculator_result_view');t.enteredSessions++;
  if(result>=0)t.validResultSessions++;
  if(startInstrumented){const start=events.findIndex((e,i)=>i>=entry&&e.name==='tool_start');if(start>=0)t.startedSessions++;if(start>=0&&events.some((e,i)=>i>=start&&e.name==='calculator_result_view'))t.startedThenResultSessions++;}
 }
 for(const t of Object.values(tools)){
  t.entryToResultRate=t.enteredSessions?t.validResultSessions/t.enteredSessions:null;
  t.startToResultRate=startInstrumented&&t.startedSessions?t.startedThenResultSessions/t.startedSessions:null;
 }
 return {scope:'Same tool and authorized window, distinct session_key per tool; event counts separate from sessions',startInstrumented,tools};
}
if(process.argv[1]===fileURLToPath(import.meta.url)){
 if(!process.argv[2])throw Error('Usage: node report.mjs authorized-normalized.jsonl [--start-instrumented]');
 const rows=readFileSync(process.argv[2],'utf8').trim().split('\n').filter(Boolean).map(x=>JSON.parse(x));
 console.log(JSON.stringify(aggregate(rows,{startInstrumented:process.argv.includes('--start-instrumented')}),null,2));
}
