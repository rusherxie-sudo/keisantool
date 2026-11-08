import {chromium} from '/home/ubuntu/np01-audit-20261107/browser-runner/node_modules/playwright/index.mjs';
import {readFileSync,writeFileSync,unlinkSync} from 'node:fs';
import assert from 'node:assert/strict';import {gunzipSync,gzipSync} from 'node:zlib';
const base=process.env.BROWSER_BASE||'http://127.0.0.1:4411';
const official=gunzipSync(readFileSync(new URL('official-gtag.js.gz',import.meta.url)));
const b=await chromium.launch({executablePath:'/home/ubuntu/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome',args:['--no-sandbox']});
const report={base,officialClient:'unmodified Google response, SHA256 in official-client.json',transport:'all collect requests intercepted and aborted; no production receipt/DebugView claim',cases:[],failures:[]};
for(const tool of (process.env.TOOL_FILTER?[process.env.TOOL_FILTER]:['rokusei','juminzei','eigyoubi','bmi'])){
 const records=[];const c=await b.newContext({serviceWorkers:'block',permissions:['clipboard-read','clipboard-write']});
 await c.route('**/*',async r=>{const u=new URL(r.request().url());if(u.origin===base)return r.continue();if(u.hostname==='www.googletagmanager.com'&&u.pathname==='/gtag/js')return r.fulfill({contentType:'application/javascript',body:official});if(u.pathname.endsWith('/collect')){
 const common=Object.fromEntries(u.searchParams);const post=r.request().postData()||'';const rows=post?post.split('\n'):[null];for(const row of rows)records.push({host:u.hostname,...common,...Object.fromEntries(new URLSearchParams(row||''))});
 }return r.abort();});
 const p=await c.newPage();let phase='initial';
 try{
 await p.goto(base+'/'+tool+'/' +(tool==='eigyoubi'?'?year=2026&month=9':''));await p.waitForTimeout(1800);const initial=records.length;
 async function valid(){if(tool==='rokusei')await p.locator('#rk-date').fill('1990-01-01');if(tool==='juminzei')await p.locator('#yearly-salary').fill('3600000');if(tool==='eigyoubi')await p.locator('#company-holidays').fill('2026-09-01');if(tool==='bmi'){await p.locator('#bmi-height').fill('170');await p.locator('#bmi-weight').fill('65');}}
 const input=p.locator(tool==='rokusei'?'#rk-date':tool==='juminzei'?'#yearly-salary':tool==='eigyoubi'?'#company-holidays':'#bmi-weight');
 phase='first-valid';await valid();for(let i=0;i<24&&!records.some(x=>x.en==='calculator_result_view');i++)await p.waitForTimeout(500);const first=records.filter(x=>x.en==='calculator_result_view'&&x.host==='www.google-analytics.com');assert.equal(first.length,1,'one first valid collect');
 phase='invalid';await input.fill(tool==='eigyoubi'?'2026-02-30':tool==='rokusei'?'2099-01-01':'-1');await p.waitForTimeout(1200);assert.equal(records.filter(x=>x.en==='calculator_result_view'&&x.host==='www.google-analytics.com').length,1);
 phase='again';await valid();await p.waitForTimeout(1200);assert.equal(records.filter(x=>x.en==='calculator_result_view'&&x.host==='www.google-analytics.com').length,1);
 phase='clear';await input.fill('');await p.waitForTimeout(1200);assert.equal(records.filter(x=>x.en==='calculator_result_view'&&x.host==='www.google-analytics.com').length,1);
 let actions;
 if(tool==='eigyoubi'){
 await valid();const dp=p.waitForEvent('download');await p.locator('#business-csv').click();const download=await dp;const csvPath=new URL('replay-business.csv',import.meta.url);await download.saveAs(csvPath.pathname);writeFileSync(new URL('replay-business.csv.gz',import.meta.url),gzipSync(readFileSync(csvPath)));unlinkSync(csvPath);
 await p.locator('[data-act=copy]').click();const copied=await p.evaluate(()=>navigator.clipboard.readText());assert.match(copied,/result\/eigyoubi/);
 const received=await c.newPage();await received.goto(copied);await received.waitForLoadState('networkidle');assert.match(await received.locator('#shared-facts').innerText(),/18日/);await received.close();
 for(let i=0;i<24&&!records.some(x=>x.en==='result_url_share');i++)await p.waitForTimeout(500);
 assert(records.some(x=>x.en==='business_calendar_download'));assert(records.some(x=>x.en==='result_url_share'));
 actions={csvSaved:true,copySucceeded:true,receivedIndependentPage:18,platformReceipt:false};
 }
 // Store only the actual outgoing business fields, plus a whitelist of safe common values.
 const events=records.map(x=>({transportHost:x.host,eventSequence:x._s,event:x.en,fields:Object.fromEntries(Object.entries(x).filter(([k])=>k.startsWith('ep.')||k.startsWith('epn.'))),page_location:x.dl,page_referrer:x.dr}));
 const raw=JSON.stringify(records);for(const v of ['3600000','1990-01-01'])assert(!raw.includes(v),'no sensitive raw input in outbound');
 for(const e of events.filter(x=>x.event==='calculator_result_view'))assert.deepEqual(Object.keys(e.fields).sort(),['ep.result_type','ep.tool_slug']);
 report.cases.push({tool,status:'pass',actions,initialRequests:initial,deduplication:'Primary www.google-analytics.com counted once; google.com failover induced by abort is retained as a transport attempt, not a second business event',phases:['first valid:1','invalid:unchanged','again valid:unchanged','clear:unchanged'],events});
 }catch(e){report.failures.push({tool,phase,error:e.message});}
 await c.close();
}
await b.close();writeFileSync(new URL(process.env.RESULT_NAME||'replay-results.json',import.meta.url),JSON.stringify(report,null,2)+'\n');console.log({passed:report.cases.length,failures:report.failures});if(report.failures.length)process.exitCode=1;
