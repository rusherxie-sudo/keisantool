import { chromium } from '/home/ubuntu/np01-audit-20261107/browser-runner/node_modules/playwright/index.mjs';
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
const out=new URL('./',import.meta.url).pathname;
const browser=await chromium.launch({executablePath:'/home/ubuntu/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome',headless:true,args:['--no-sandbox']});
const report={mode:'real Chromium, local server, native Clipboard writeText wrapped to log locally, all non-loopback requests aborted; no GA/social requests',checks:[],errors:[],blocked:[]};
const base=process.env.BROWSER_BASE||'http://127.0.0.1:4398';
async function check(name,fn){try{const detail=await fn();report.checks.push({name,status:'passed',detail});}catch(e){report.checks.push({name,status:'failed',error:e.message});}}
for(const width of [1440,390]){
 const c=await browser.newContext({viewport:{width,height:900},timezoneId:'America/Los_Angeles',permissions:['clipboard-read','clipboard-write']});
 await c.route('**/*',r=>{const u=new URL(r.request().url());if(['127.0.0.1','localhost'].includes(u.hostname))return r.continue();report.blocked.push(u.origin);return r.abort();});
 await c.addInitScript(()=>{window.__events=[];window.__clipboard='';const nativeWrite=navigator.clipboard.writeText.bind(navigator.clipboard);Object.defineProperty(navigator,'clipboard',{value:{writeText:async t=>{await nativeWrite(t);window.__clipboard=t;},readText:()=>Promise.resolve(window.__clipboard)}});window.addEventListener('DOMContentLoaded',()=>{window.gtag=(...args)=>window.__events.push(args);});});
 const p=await c.newPage();p.on('pageerror',e=>report.errors.push({width,message:e.message}));
 const goto=async path=>{await p.goto(base+path);await p.waitForLoadState('networkidle');};
 await check(`${width}: nissu inclusive, copy, shift, clear`,async()=>{
  await goto('/nissu/');await p.locator('#from').fill('2026-08-03');await p.locator('#to').fill('2026-08-11');await p.locator('#includeBoth').check();
  assert.equal(await p.locator('#days').innerText(),'9日');assert.equal(await p.locator('#businessDays').innerText(),'6日');
  await p.locator('[data-act=copy]').click();await p.waitForFunction(()=>window.__clipboard.length>0);assert.match(await p.evaluate(()=>window.__clipboard),/9/);
  assert.ok(await p.locator('#rangeResult a[href="/eigyoubi/"]').count());
  await p.locator('[data-mode=shift]').click();await p.locator('#base').fill('2026-09-18');await p.locator('#offset').fill('1');await p.locator('#unit').selectOption('business-day');
  const shifted=await p.locator('#resultDate').innerText();assert.match(shifted,/24/);
  await p.locator('#base').fill('');assert.equal(await p.locator('#shiftResult').isVisible(),false);
  return {calendarDays:9,businessDays:6,shifted,clipboard:'summary copied locally',cleared:true};
 });
 await check(`${width}: eigyoubi company holiday CSV share receive invalid`,async()=>{
  await goto('/eigyoubi/?year=2026&month=9');await p.locator('#company-holidays').fill('2026-09-01');assert.match(await p.locator('#business-result').innerText(),/18営業日/);
  await p.locator('#business-result').scrollIntoViewIfNeeded();await p.screenshot({path:out+`eigyoubi-${width}.png`});
  const dp=p.waitForEvent('download');await p.locator('#business-csv').click();const d=await dp;const dest=out+`eigyoubi-${width}.csv`;await d.saveAs(dest);const csv=await fs.readFile(dest,'utf8');assert.match(csv,/2026-09-01.*会社休日/);assert.equal(csv.trim().split('\n').length,31);
  await p.locator('[data-act=copy]').click();await p.waitForFunction(()=>window.__clipboard.length>0);const url=await p.evaluate(()=>window.__clipboard);assert.match(url,/\/result\/eigyoubi\//);
  const received=await c.newPage();await received.goto(url);await received.waitForLoadState('networkidle');const text=await received.locator('main').innerText();assert.match(text,/18/);await received.close();
  await p.locator('#company-holidays').fill('2026-02-30');assert.equal(await p.locator('#business-result').isVisible(),false);assert.equal(await p.locator('#business-csv').isDisabled(),true);assert.equal(await p.locator('#result-share').isVisible(),false);
  return {businessDays:18,csvRows:31,share:'independent result page restored 18, no social send',invalidClears:true};
 });
 await check(`${width}: rokusei keyboard and clear`,async()=>{await goto('/rokusei/');await p.locator('#rk-date').fill('1990-01-01');await p.locator('#rk-date').press('Tab');const value=await p.locator('#rk-type').innerText();assert.notEqual(value,'―');await p.waitForTimeout(700);await p.screenshot({path:out+`rokusei-${width}.png`});await p.locator('#rk-date').fill('');assert.equal(await p.locator('#result-share').isVisible(),false);return {value,keyboard:'Tab accepted',cleared:true};});
 await check(`${width}: juminzei example and clear`,async()=>{await goto('/juminzei/');await p.locator('#yearly-salary').fill('3600000');const value=await p.locator('#result-tax').innerText();assert.notEqual(value,'¥0');await p.locator('#yearly-salary').fill('');assert.equal(await p.locator('#result-share').isVisible(),false);return {value,cleared:true};});
 await check(`${width}: nematsu example and clear`,async()=>{await goto('/nematsu/');await p.locator('#nematsu-example').click();const value=await p.locator('#result-main').innerText();assert.notEqual(value,'¥0');await p.locator('#yearly-salary').fill('');assert.equal(await p.locator('#result-share').isVisible(),false);return {value,cleared:true};});
 await check(`${width}: kinzoku leap date share and clear`,async()=>{await goto('/kinzoku-nensuu/');await p.locator('#join-date').fill('2020-02-29');await p.locator('#reference-date').fill('2026-02-28');const value=await p.locator('#duration-result').innerText();assert.match(value,/6年/);await p.locator('[data-act=copy]').click();await p.waitForFunction(()=>window.__clipboard.length>0);const url=await p.evaluate(()=>window.__clipboard);assert.match(url,/result\/kinzoku-nensuu/);await p.locator('#join-date').fill('');assert.equal(await p.locator('#service-result').isVisible(),false);return {value,clear:true};});
 await check(`${width}: sunrise JST leap clear`,async()=>{await p.clock.install({time:new Date('2026-12-31T15:30:00Z')});await goto('/hinodeiri/');assert.equal(await p.locator('#hd-date').inputValue(),'2027-01-01');await p.locator('#hd-date').fill('2028-02-29');assert.match(await p.locator('#hd-city-label').innerText(),/2028.*2.*29/);const value=await p.locator('#hd-main').innerText();assert.match(value,/\d\d:\d\d/);await p.locator('#hd-date').fill('');assert.equal(await p.locator('#hd-main').innerText(),'―');assert.equal(await p.locator('#result-share').isVisible(),false);await p.clock.resume();return {jstDate:'2027-01-01',leap:value,cleared:true};});
 await check(`${width}: content render related roku sources water`,async()=>{await goto('/blog/kokuho-ryoukin-keisan-hoho/');assert.match(await p.locator('main').innerText(),/233,179/);const related=await p.locator('.related-posts a').count();await goto('/rokuyo/');assert.ok(await p.locator('a[href="https://www.ndl.go.jp/koyomi/chapter3/s3.html"]').count());await goto('/suisui/');return {kokuho:'full example rendered',relatedLinkCount:related,rokuyoSource:true,water:'page rendered; numeric nonfinite handled in unit regression'};});
 await check(`${width}: prototype quantity dose units zeros invalid reset`,async()=>{
  await p.goto('http://127.0.0.1:4399/');await p.waitForLoadState('networkidle');await p.locator('button[type=submit]').click();assert.match(await p.locator('#result').innerText(),/B/);
  await p.locator('#dose-1').fill('20');await p.locator('button[type=submit]').click();assert.match(await p.locator('#result strong').innerText(),/A/);
  await p.screenshot({path:out+`prototype-${width}-comparison.png`});
  await p.locator('#quantity-0').fill('1');await p.locator('#quantityUnit-0').selectOption('L');await p.locator('#price-0').fill('0');await p.locator('#perDay-0').fill('0');await p.locator('button[type=submit]').click();assert.match(await p.locator('#result').innerText(),/使用なし/);
  await p.locator('#doseUnit-0').selectOption('g');await p.locator('button[type=submit]').click();assert.equal(await p.locator('#result').isVisible(),false);assert.ok((await p.locator('#error').innerText()).length);
  await p.locator('button[type=reset]').click();assert.equal(await p.locator('#price-0').inputValue(),'');assert.equal(await p.locator('#result').isVisible(),false);await p.screenshot({path:out+`prototype-${width}.png`});
  return {default:'B',independentDose:'A',litreAndZero:'accepted',massVolume:'rejected',reset:true,humanTesting:'not performed'};
 });
 await check(`${width}: client measurement allowlist`,async()=>{await goto('/juminzei/');await p.locator('#yearly-salary').fill('3600000');const events=await p.evaluate(()=>window.__events.filter(x=>x[0]==='event'));const result=events.find(x=>x[1]==='calculator_result_view');assert.ok(result);assert.deepEqual(Object.keys(result[2]).sort(),['result_type','tool_slug']);assert.ok(!JSON.stringify(events).includes('3600000'));return {events,gaDebugView:'not available/not checked'};});
 await c.close();
}
report.blocked=[...new Set(report.blocked)];report.summary={passed:report.checks.filter(x=>x.status==='passed').length,failed:report.checks.filter(x=>x.status==='failed').length};await fs.writeFile(out+'browser-results.json',JSON.stringify(report,null,2)+'\n');await browser.close();console.log(JSON.stringify(report,null,2));if(report.summary.failed||report.errors.length)process.exitCode=1;
