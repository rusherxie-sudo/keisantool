// Run against the local preview or production; intercept analytics to avoid test traffic.
// PLAYWRIGHT_MODULE=/path/to/playwright-core/index.mjs CHROME_PATH=/path/to/chrome node scripts/verify-age-table.mjs [origin] [artifact-directory]
import { strict as assert } from 'node:assert';
import { mkdir } from 'node:fs/promises';
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const base = process.argv[2] || 'http://127.0.0.1:4328';
const artifacts = process.argv[3];
if (artifacts) await mkdir(artifacts, {recursive:true});
const browser = await chromium.launch({headless:true, ...(process.env.CHROME_PATH ? {executablePath:process.env.CHROME_PATH} : {}), args:['--no-sandbox']});
try {
  const context=await browser.newContext({viewport:{width:390,height:844},locale:'ja-JP'});
  await context.route(/google-analytics\.com|googletagmanager\.com|hm\.baidu\.com/,r=>r.abort());
  const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
  const response=await page.goto(base+'/nenrei-hayami/',{waitUntil:'networkidle'});assert.equal(response.status(),200);
  await page.locator('.hayami-lookup').waitFor({state:'visible'});
  assert.equal(await page.locator('link[rel=canonical]').getAttribute('href'),'https://keisantool.com/nenrei-hayami/');
  assert.equal(await page.locator('meta[name=robots]').getAttribute('content'),'index,follow');
  const total=await page.locator('#age-table-body tr').count();assert.ok(total>=159);
  const geometry=await page.evaluate(()=>({tableY:document.querySelector('table').getBoundingClientRect().top,overflow:document.documentElement.scrollWidth>innerWidth}));
  assert.ok(geometry.tableY<600);assert.equal(geometry.overflow,false);console.log('mobile',geometry);
  if(artifacts)await page.screenshot({path:artifacts+'/age-after-mobile.png'});
  const visible=()=>page.locator('#age-table-body tr:not([hidden])');
  await page.locator('#birth-year-search').fill('１９８８');assert.equal(await visible().count(),1);assert.ok((await visible().innerText()).includes('昭和63年'));
  await page.locator('#birth-year-search').fill('昭和 ６３');assert.equal(await visible().count(),1);assert.equal(await visible().getAttribute('data-birth-year'),'1988');
  await page.locator('#birth-year-search').fill('平成元年');assert.equal(await visible().count(),1);assert.equal(await visible().getAttribute('data-birth-year'),'1989');
  await page.locator('#birth-year-search').fill('平成1年');assert.equal(await visible().count(),1);
  await page.locator('#birth-year-search').fill('存在しない年');assert.equal(await visible().count(),0);assert.ok((await page.locator('#age-search-status').innerText()).includes('ありません'));
  await page.locator('#clear-year-search').click();assert.equal(await visible().count(),total);
  await page.locator('#birth-year-search').fill('1988');
  await page.emulateMedia({media:'print'});assert.equal(await page.locator('#age-table-body tr:visible').count(),total);await page.emulateMedia({media:'screen'});assert.equal(await visible().count(),1);
  const events=await page.evaluate(()=>window.dataLayer.filter(e=>e[1]==='age_table_lookup').map(e=>Array.from(e)));
  assert.equal(events.length,1);assert.deepEqual(events[0],['event','age_table_lookup',{tool_slug:'nenrei-hayami'}]);
  await page.locator('#clear-year-search').click();await page.setViewportSize({width:1440,height:1000});
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
  console.log('desktop tableY',await page.locator('table').evaluate(e=>e.getBoundingClientRect().top));
  if(artifacts)await page.screenshot({path:artifacts+'/age-after-desktop.png'});
  for(const year of [2026,2027])assert.equal((await context.request.get(base+`/downloads/nenrei-hayami-${year}.pdf`)).status(),200);
  assert.equal((await context.request.get(base+'/nenrei-hayami/2027/')).status(),200);
  await context.close();
  const nojs=await browser.newContext({javaScriptEnabled:false});const staticPage=await nojs.newPage();await staticPage.goto(base+'/nenrei-hayami/');
  assert.equal(await staticPage.locator('#age-table-body tr:visible').count(),total);assert.equal(await staticPage.locator('.hayami-lookup').isVisible(),false);
  assert.deepEqual(errors,[]);await nojs.close();console.log('Passed: lookup, era transition, reset, no match, print, no JS, links, privacy, mobile/desktop.');
} finally {await browser.close();}
