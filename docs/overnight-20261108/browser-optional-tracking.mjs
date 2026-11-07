import {chromium} from '/home/ubuntu/np01-audit-20261107/browser-runner/node_modules/playwright/index.mjs';
import assert from 'node:assert/strict';
const b=await chromium.launch({executablePath:'/home/ubuntu/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome',args:['--no-sandbox']});
try {
 const c=await b.newContext();await c.route('**/*',r=>new URL(r.request().url()).hostname==='127.0.0.1'?r.continue():r.abort());
 await c.addInitScript(()=>Object.defineProperty(navigator,'clipboard',{value:{writeText:async()=>{}}}));
 const p=await c.newPage();await p.goto('http://127.0.0.1:4398/eigyoubi/');await p.waitForLoadState('networkidle');await p.evaluate(()=>window.gtag=()=>{throw Error('test optional transport');});await p.locator('#copy-embed').click();assert.equal(await p.locator('#embed-feedback').innerText(),'コピーしました。');console.log('PASS: real Chromium embed copy success survives throwing optional analytics');
} finally {await b.close();}
