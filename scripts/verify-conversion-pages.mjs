// Optional browser verification; requires an external Playwright installation.
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright-core');
import assert from 'node:assert/strict';
const base=process.env.BASE_URL||'http://127.0.0.1:4337';
const b=await chromium.launch({headless:true,...(process.env.CHROME_PATH?{executablePath:process.env.CHROME_PATH}:{})});const c=await b.newContext();await c.route(/googletagmanager|google-analytics|hm\.baidu/,r=>r.abort());const p=await c.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));
const go=async path=>{await p.goto(base+path,{waitUntil:'domcontentloaded'});await p.waitForTimeout(300);};
try{
 await go('/tsubo-heibei/');assert.equal(await p.inputValue('#areaValue'),'1');assert.match(await p.locator('#convertM2').innerText(),/3.305785/);assert.match(await p.locator('#squareSide').innerText(),/1.818/);
 assert.equal(await p.evaluate(()=>window.dataLayer.filter(x=>x[1]==='calculator_result_view').length),0);
 await p.click('[data-area-preset="100"]');assert.equal(await p.locator('#convertTsubo').innerText(),'30.25坪');
 await p.click('[data-area-preset="6"]');assert.equal(await p.locator('#convertM2').innerText(),'9.72㎡');
 await p.fill('#areaValue','');assert.equal(await p.locator('#convertResult').isVisible(),false);assert.equal(await p.locator('#squareSide').isVisible(),false);
 await p.click('[data-mode="dimensions"]');assert.equal(await p.locator('#dimensionsM2').innerText(),'50㎡');await p.fill('#lengthValue','');assert.equal(await p.locator('#dimensionsResult').isVisible(),false);
 await p.click('[data-mode="price"]');await p.fill('#priceArea','0');assert.equal(await p.locator('#priceResult').isVisible(),false);
 await go('/taikakusen/');assert.equal(await p.locator('#r-main').innerText(),'5 cm');assert.equal(await p.locator('#r-diagonal-wrap').isVisible(),false);
 await p.fill('#r-width','');assert.equal(await p.locator('#r-result').isVisible(),false);assert.equal(await p.locator('#rectangle-figure').isVisible(),false);
 await p.click('[data-rectangle="5,12"]');assert.equal(await p.locator('#r-main').innerText(),'13 cm');assert.equal(await p.locator('#rectangle-figure').isVisible(),true);
 await p.selectOption('#r-target','width');await p.fill('#r-diagonal','13');await p.fill('#r-height','5');assert.equal(await p.locator('#r-main').innerText(),'12 cm');assert.equal(await p.locator('#r-width-wrap').isVisible(),false);
 await p.fill('#r-diagonal','4');assert.equal(await p.locator('#r-result').isVisible(),false);
 await p.click('[data-mode="box"]');assert.equal(await p.locator('#b-main').innerText(),'7 cm');await p.fill('#b-depth','0');assert.equal(await p.locator('#b-result').isVisible(),false);
 await p.click('[data-screen="50"]');assert.match(await p.locator('#s-main').innerText(),/110.69/);assert.equal(await p.locator('#s-width-wrap').isVisible(),false);
 await p.selectOption('#s-target','inch');assert.match(await p.locator('#s-main').innerText(),/49.99/);assert.equal(await p.locator('#s-inch-wrap').isVisible(),false);await p.fill('#s-width','');assert.equal(await p.locator('#s-result').isVisible(),false);
 assert.equal(await p.evaluate(()=>window.dataLayer.filter(x=>x[1]==='diagonal_calculation').length),2);
 for(const width of [390,1440]){await p.setViewportSize({width,height:900});for(const path of ['/tsubo-heibei/','/taikakusen/']){await go(path);assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),true,path);if(width===390)await p.screenshot({path:'/tmp/conversion-'+path.split('/')[1]+'.png',fullPage:true});}}
 assert.deepEqual(errors,[]);console.log('PASS: defaults, 6 presets/modes, reverse calculations, stale result removal, SVG, analytics, desktop/mobile.');
}finally{await b.close();}
