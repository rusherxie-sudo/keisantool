// Offline/production smoke: external Playwright/Chromium; no outreach or form submission to other sites.
import assert from 'node:assert/strict';
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright-core');
const base = process.env.BASE_URL || 'http://127.0.0.1:4340';
const browser = await chromium.launch({headless:true,...(process.env.CHROME_PATH?{executablePath:process.env.CHROME_PATH}:{})});
const errors=[];
const configure = async ctx => {await ctx.route('**/*',route=>/googletagmanager|google-analytics|googlesyndication|doubleclick|hm.baidu|clarity/.test(route.request().url())?route.abort():route.continue());};
try{
 const sender=await browser.newContext({viewport:{width:390,height:900},permissions:['clipboard-read','clipboard-write']});await configure(sender);
 const receiver=await browser.newContext({viewport:{width:390,height:900},timezoneId:'America/New_York'});await configure(receiver);
 const p=await sender.newPage(),peer=await receiver.newPage();for(const page of [p,peer])page.on('pageerror',e=>errors.push(e.message));
 const links=[];
 async function copyAndOpen(tool,answer){
  await p.locator('#result-page-link').waitFor({state:'visible'});const url=await p.locator('#result-page-link').getAttribute('href');assert.equal(new URL(url).pathname,`/result/${tool}/`);
  await p.click('#result-share [data-act=copy]');assert.equal(await p.evaluate(()=>navigator.clipboard.readText()),url);
  const analytics=[];const capture=r=>{if(/googletagmanager|google-analytics|hm.baidu/.test(r.url()))analytics.push(r.url());};peer.on('request',capture);
  await peer.goto(url,{waitUntil:'domcontentloaded'});await peer.locator('#shared-result').waitFor({state:'visible'});assert((await peer.locator('#shared-facts').innerText()).includes(answer),tool+' expected '+answer);assert.equal(await peer.locator('meta[name=robots]').getAttribute('content'),'noindex,follow');assert.deepEqual(analytics,[]);peer.off('request',capture);
  await peer.reload({waitUntil:'domcontentloaded'});await peer.locator('#shared-result').waitFor({state:'visible'});assert((await peer.locator('#shared-facts').innerText()).includes(answer));
  assert(await peer.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));links.push(url);console.log(tool,answer,'copy, independent-context restore, reload passed');
 }
 await p.goto(base+'/hayasa/',{waitUntil:'domcontentloaded'});assert.equal(await p.evaluate(()=>window.dataLayer.filter(e=>e[0]==='event'&&e[1]==='calculator_result_view').length),0);await p.click('[data-speed-preset="30"]');await copyAndOpen('hayasa','8.3333 m/s');
 await p.click('.speed-tab[data-mode=speed]');await copyAndOpen('hayasa','20 km/h');
 await p.click('.speed-tab[data-mode=distance]');await p.fill('#distance-speed','20');await p.fill('#distance-hours','0');await p.fill('#distance-minutes','30');await copyAndOpen('hayasa','10 km');
 await p.click('.speed-tab[data-mode=time]');await p.fill('#time-distance','10');await p.fill('#time-speed','20');await copyAndOpen('hayasa','30分0秒');
 await p.fill('#time-speed','0');assert(await p.locator('#result-share').isHidden());
 assert.deepEqual(await p.evaluate(()=>window.dataLayer.filter(e=>e[0]==='event'&&e[1]==='calculator_result_view').map(e=>e[2])),[{tool_slug:'hayasa',result_type:'speed'}]);
 await p.goto(base+'/kinzoku-nensuu/',{waitUntil:'domcontentloaded'});await p.fill('#join-date','2017-04-01');await p.fill('#reference-date','2026-10-01');await copyAndOpen('kinzoku-nensuu','10年目');
 assert((await p.locator('.howto').allTextContents()).join('\n').includes('平成29年'));
 await p.goto(base+'/eigyoubi/',{waitUntil:'domcontentloaded'});await p.selectOption('#business-year','2026');await p.selectOption('#business-month','9');await p.fill('#company-holidays','2026-09-01');await copyAndOpen('eigyoubi','18日');
 await p.goto(base+'/taishoku-yukyu/',{waitUntil:'domcontentloaded'});await p.fill('#plan-retire','2026-10-30');await p.fill('#plan-balance','5');await p.click('button[type=submit]');await copyAndOpen('taishoku-yukyu','2026-10-23');
 await p.fill('#plan-balance','6');assert(await p.locator('#plan-result').isHidden());assert(await p.locator('#result-share').isHidden());
 await p.goto(base+'/nenmatsu-nenshi/',{waitUntil:'domcontentloaded'});await p.click('#yearend-example');await copyAndOpen('nenmatsu-nenshi','8日');
 await p.screenshot({path:'/tmp/yearend-mobile-1001.png',fullPage:true});await peer.screenshot({path:'/tmp/shared-mobile-1001.png',fullPage:true});
 // Main floating copy must also carry the selected result, and return to a page link after invalidation.
 await p.evaluate(()=>Object.defineProperty(navigator,'share',{value:undefined,configurable:true}));await p.evaluate(()=>window.scrollTo(0,0));await p.waitForFunction(()=>getComputedStyle(document.querySelector('#fshare')).pointerEvents!=='none');await p.click('#fshare-fab');await p.click('#fshare-copy');assert.equal(await p.evaluate(()=>navigator.clipboard.readText()),links.at(-1));
 await p.fill('#plan-end','2027-01-06');assert.equal(await p.evaluate(()=>window.getResultShareUrl()),'');
 for(const width of [390,1440]){await p.setViewportSize({width,height:900});for(const route of ['/hayasa/','/kinzoku-nensuu/','/eigyoubi/','/taishoku-yukyu/','/nenmatsu-nenshi/']){await p.goto(base+route,{waitUntil:'domcontentloaded'});assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),route+' overflow '+width);}}
 await p.click('#yearend-example');await p.evaluate(()=>{navigator.clipboard.writeText=async()=>{throw new Error('clipboard denied');};});await p.click('#result-share [data-act=copy]');assert(await p.locator('#result-share-fallback').isVisible());assert((await p.locator('#result-share-fallback').inputValue()).includes('/result/nenmatsu-nenshi/#v1='));
 await peer.goto(links.at(-1),{waitUntil:'domcontentloaded'});await peer.locator('#shared-result').waitFor({state:'visible'});await peer.getByRole('link',{name:'自分の条件で計算する'}).click();await peer.waitForFunction(()=>window.dataLayer?.some(e=>e[0]==='event'&&e[1]==='shared_result_return'));const returns=await peer.evaluate(()=>window.dataLayer.filter(e=>e[0]==='event'&&e[1]==='shared_result_return').map(e=>e[2]));assert.deepEqual(returns,[{tool_slug:'nenmatsu-nenshi'}]);
 await peer.goto(base+'/result/hayasa/#v1=%ZZ',{waitUntil:'domcontentloaded'});assert(await peer.locator('#shared-result').isHidden());assert(await peer.locator('#result-share').isHidden());
 // Verify existing text-sharing behavior on a tool that has not adopted result URLs.
 await p.goto(base+'/rokusei/shukumei-daisakkai/',{waitUntil:'domcontentloaded'});await p.fill('#sd-date','1974-10-30');await p.locator('input[name=sd-gender][value=male]').locator('..').click();await p.click('#result-share [data-act=copy]');assert((await p.evaluate(()=>navigator.clipboard.readText())).includes('宿命大殺界'));
 assert.deepEqual(errors,[]);console.log('8 round trips, 5 pages x 2 widths, invalidation, floating copy and legacy sharing passed');
}finally{await browser.close();}
