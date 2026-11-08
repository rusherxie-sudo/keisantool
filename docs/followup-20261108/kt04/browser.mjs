import {chromium} from '/home/ubuntu/np01-audit-20261107/browser-runner/node_modules/playwright/index.mjs';
import {writeFileSync} from 'node:fs';
import assert from 'node:assert/strict';
const base=process.env.BROWSER_BASE||'http://127.0.0.1:4411';
const b=await chromium.launch({executablePath:'/home/ubuntu/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome',args:['--no-sandbox']});
const out={base,cases:[],errors:[],scope:'native Chromium keyboard; viewport emulation, not physical mobile; external requests aborted'};
async function check(name,fn){try{out.cases.push({name,status:'pass',detail:await fn()});}catch(e){out.cases.push({name,status:'fail',error:e.message});}}
const tools=[['rokusei','#rk-date','1990-01-01'],['juminzei','#yearly-salary','3600000'],['eigyoubi','#company-holidays','2026-09-01'],['nematsu','#yearly-salary','3600000'],['kinzoku-nensuu','#join-date','2020-02-29'],['hinodeiri','#hd-date','2027-01-01']];
for(const width of [1440,390]){
const c=await b.newContext({viewport:{width,height:900},timezoneId:'America/Los_Angeles',serviceWorkers:'block',permissions:['clipboard-read','clipboard-write']});
await c.route('**/*',r=>new URL(r.request().url()).origin===base?r.continue():r.abort());
const p=await c.newPage();p.on('pageerror',e=>out.errors.push(e.message));
for(const [slug,selector,value] of tools)await check(`${width} keyboard ${slug}`,async()=>{
 await p.goto(base+'/'+slug+'/');await p.waitForLoadState('networkidle');
 // Reach an input solely with native Tab, starting at the browser document.
 let tabs=0;for(;tabs<85;tabs++){await p.keyboard.press('Tab');if(await p.locator(selector).evaluate(e=>e===document.activeElement))break;}
 assert(tabs<85,'input reachable using Tab');await p.locator(selector).fill(value);await p.keyboard.press('Tab');
 const focus=await p.evaluate(()=>({tag:document.activeElement.tagName,id:document.activeElement.id,visible:(()=>{const r=document.activeElement.getBoundingClientRect();return r.width>0&&r.height>0;})()}));assert(focus.visible);
 if(slug==='nematsu'){await p.locator('#nematsu-example').focus();await p.keyboard.press('Enter');assert.notEqual(await p.locator('#result-main').innerText(),'¥0');}
 else if(slug==='eigyoubi'){await p.locator('#business-csv').focus();const dp=p.waitForEvent('download');await p.keyboard.press('Enter');const d=await dp;assert.match(d.suggestedFilename(),/\.csv$/);}
 else {await p.locator('[data-act=copy]').focus();await p.keyboard.press('Enter');await p.waitForTimeout(150);assert((await p.evaluate(()=>navigator.clipboard.readText())).length>0);}
 return {tabs:tabs+1,focus,enter:'native activation; auto-calculators update on input, no submit button'};
});
await c.close();
const n=await b.newContext({viewport:{width,height:900},javaScriptEnabled:false,serviceWorkers:'block'});await n.route('**/*',r=>new URL(r.request().url()).origin===base?r.continue():r.abort());const q=await n.newPage();
for(const [slug] of tools)await check(`${width} noJS ${slug}`,async()=>{await q.goto(base+'/'+slug+'/');const text=await q.locator('main').innerText();const notes=await q.locator('main noscript').allTextContents();assert(notes.some(x=>/JavaScript/.test(x)),'explicit JS-required fallback notice');assert(text.length>300);return {notice:notes,staticTextCharacters:text.length};});
await n.close();
}
await b.close();out.summary={passed:out.cases.filter(x=>x.status==='pass').length,failed:out.cases.filter(x=>x.status==='fail').length};writeFileSync(new URL(process.env.RESULT_NAME||'browser-results.json',import.meta.url),JSON.stringify(out,null,2)+'\n');console.log(out.summary);if(out.summary.failed||out.errors.length)process.exitCode=1;
