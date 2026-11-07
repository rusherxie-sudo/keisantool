import {chromium} from '/home/ubuntu/np01-audit-20261107/browser-runner/node_modules/playwright/index.mjs';
import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
import {sharedResultUrl} from '../../src/lib/shared-results.js';
const origin='http://127.0.0.1:4399', sentinel='KT06_SYNTHETIC_20261108';
const official=readFileSync(new URL('./kt06-official-hm.js',import.meta.url),'utf8');
assert(official.length>20000);
const out={official:{url:'https://hm.baidu.com/hm.js?d84361ca34153f1c434c38b9cb0e0bb5',http:200,bytes:Buffer.byteLength(official),sha256:createHash('sha256').update(official).digest('hex'),fetch_referrer:'https://keisantool.com/',note:'Actual official response replayed unchanged; all reporting intercepted locally'},cases:[],unverified:['Baidu already loaded on a permitted static route followed by arbitrary history pushState/replaceState/hash edits; no full dynamic-history safety claim','Actual production analytics receipt / GA DebugView']};
const b=await chromium.launch({executablePath:'/home/ubuntu/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome',args:['--no-sandbox']});
async function context(){const c=await b.newContext();const req=[];await c.route('**/*',async r=>{const u=new URL(r.request().url());if(u.origin===origin)return r.continue();req.push({url:u.href,post:r.request().postData()});if(u.hostname==='hm.baidu.com'&&u.pathname==='/hm.js')return r.fulfill({contentType:'application/javascript',body:official});return r.abort();});return {c,req};}
try {
 for(const [path,ref,load] of [
 ['/blog/kokuho-ryoukin-keisan-hoho/','',true],
 ['/blog/kokuho-ryoukin-keisan-hoho/?qa_test='+sentinel+'#KT06_SYNTHETIC_FRAGMENT','',false],
 ['/bmi/?qa_test='+sentinel+'#KT06_SYNTHETIC_FRAGMENT','',false],
 ['/bmi/','',false],
 ['/blog/kokuho-ryoukin-keisan-hoho/',origin+'/bmi/?qa_test='+sentinel,false],
 ]) {
 const {c,req}=await context();const p=await c.newPage();await p.goto(origin+path,{referer:ref||undefined});await p.waitForTimeout(1500);
 if(load){await p.evaluate(()=>{window._hmt.push(['_trackPageview','/blog/kokuho-ryoukin-keisan-hoho/']);});await p.waitForTimeout(500);}
 if(path.startsWith('/bmi/')){await p.evaluate(s=>{history.pushState(null,'','?later='+s+'#'+s);},sentinel);await p.waitForTimeout(100);}
 const scripts=req.filter(x=>x.url.includes('/hm.js?'));const reports=req.filter(x=>x.url.includes('/hm.gif?'));
 assert.equal(scripts.length,load?1:0);if(load)assert(reports.length>=2,'Real official first and subsequent reporting requests required');
 assert(!JSON.stringify(reports).includes(sentinel));
 out.cases.push({path,ref,script_requests:scripts.length,reports:reports.map(x=>({url:x.url,post:x.post})),pass:true});await c.close();
 }
 for(const tool of ['bmi','juminzei','nenrei']){
 const {c,req}=await context();const p=await c.newPage();await p.goto(origin+'/'+tool+'/');await p.waitForLoadState('networkidle');
 await p.evaluate(()=>{window.__events=[];window.gtag=(...a)=>window.__events.push(a);});
 async function fill(){if(tool==='bmi'){await p.locator('#bmi-height').fill('170');await p.locator('#bmi-weight').fill('65');}else if(tool==='juminzei'){await p.locator('#yearly-salary').fill('3600000');}else{await p.locator('#ref').fill('2026-11-08');await p.locator('#birth').fill('1990-01-01');}}
 const result=p.locator(tool==='bmi'?'#bmi-result':tool==='juminzei'?'#result-box':'#result');
 await fill();assert(await result.evaluate(x=>x.classList.contains('visible')));
 const events=await p.evaluate(()=>window.__events.filter(x=>x[1]==='calculator_result_view'));
 if(tool!=='nenrei'){assert.equal(events.length,1);assert.deepEqual(Object.keys(events[0][2]).sort(),['result_type','tool_slug']);}
 const clear=p.locator(tool==='bmi'?'#bmi-weight':tool==='juminzei'?'#yearly-salary':'#birth');await clear.fill('');assert(!(await result.evaluate(x=>x.classList.contains('visible'))));
 await p.evaluate(()=>window.gtag=()=>{throw Error('KT06 optional transport');});await fill();assert(await result.evaluate(x=>x.classList.contains('visible')));await clear.fill('');assert(!(await result.evaluate(x=>x.classList.contains('visible'))));
 if(tool==='bmi'){await c.setOffline(true);await fill();assert.equal(await p.locator('#bmi-value').innerText(),'22.5');}
 out.cases.push({tool,events,calculation_clear_throwing_gtag:true,offline:tool==='bmi',baidu_requests:req.filter(x=>x.url.includes('hm.baidu.com')).length,pass:true});await c.close();
 }
 const {c}=await context();const p=await c.newPage();const url=sharedResultUrl('eigyoubi',{year:2026,month:9,weekdays:[1,2,3,4,5],extra:['2026-09-18']},origin);await p.goto(url);await p.waitForLoadState('networkidle');assert(await p.locator('#shared-result').isVisible());assert((await p.locator('#shared-facts').innerText()).includes('18日'));assert.equal(new URL(p.url()).hash,new URL(url).hash);out.cases.push({shared_fragment_restore:true,pass:true});await c.close();
} catch(e){out.error=String(e);throw e;} finally{writeFileSync(new URL('./kt06-browser-results.json',import.meta.url),JSON.stringify(out,null,2)+'\n');await b.close();}
