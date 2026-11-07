import {it,expect,vi} from 'vitest';
import {readFileSync} from 'node:fs';
import {JSDOM} from 'jsdom';
import {runInNewContext} from 'node:vm';
const source=()=>readFileSync('src/layouts/ToolLayout.astro','utf8');
const baidu=()=>[...source().matchAll(/<script is:inline>([\s\S]*?)<\/script>/g)].find(x=>x[1].includes('hm.baidu.com'))[1];
it.each([
 ['/blog/kokuho-ryoukin-keisan-hoho/','',true],
 ['/category/health/','',true],
 ['/blog/example/?qa=KT06_SENTINEL','',false],
 ['/blog/example/#KT06_SENTINEL','',false],
 ['/blog/example/','https://example.test/bmi/?qa=KT06_SENTINEL#secret',false],
 ['/bmi/','',false],['/juminzei/','',false],['/tanjobi-aisho/','',false],['/result/eigyoubi/#v=1','',false],
])('Baidu eligibility %s referrer %s', (path,ref,allowed)=>{
 const dom=new JSDOM('<head><script></script></head>',{url:'https://example.test'+path,...(ref?{referrer:ref}:{})});
 runInNewContext(baidu(),{window:dom.window,document:dom.window.document,location:dom.window.location,URL});
 expect(!!dom.window.document.querySelector('script[src*="hm.baidu.com"]')).toBe(allowed);
});
it('related destinations omit query/hash and throwing transport does not escape',()=>{
 const dom=new JSDOM('<body data-tool-slug="bmi"><a class="related-link" href="/juminzei/?salary=KT06_SENTINEL#secret">link</a></body>',{url:'https://example.test/bmi/'});
 const handlers=[]; const gtag=vi.fn();dom.window.gtag=gtag;
 dom.window.document.addEventListener=(name,fn)=>handlers.push(fn);
 const code=[...source().matchAll(/<script is:inline>([\s\S]*?)<\/script>/g)].at(-1)[1];
 runInNewContext(code,{window:dom.window,document:dom.window.document,location:dom.window.location,URL,URLSearchParams});
 const event={target:dom.window.document.querySelector('a')};
 handlers.forEach(fn=>fn(event));
 expect(gtag.mock.calls[0][2].destination).toBe('/juminzei/');
 dom.window.gtag=()=>{throw Error('optional');};
 expect(()=>handlers.forEach(fn=>fn(event))).not.toThrow();
});
