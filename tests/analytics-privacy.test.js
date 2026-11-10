import {it,expect,vi} from 'vitest';
import {readFileSync} from 'node:fs';
import {JSDOM} from 'jsdom';
import {runInNewContext} from 'node:vm';
const source=()=>readFileSync('src/layouts/ToolLayout.astro','utf8');
it.each([
 ['/blog/kokuho-ryoukin-keisan-hoho/',''],
 ['/category/health/',''],
 ['/blog/example/?qa=KT06_SENTINEL',''],
 ['/blog/example/#KT06_SENTINEL',''],
 ['/blog/example/','https://example.test/bmi/?qa=KT06_SENTINEL#secret'],
 ['/bmi/',''],['/juminzei/',''],['/tanjobi-aisho/',''],['/result/eigyoubi/#v=1',''],
])('has no Baidu loader or queue on %s referrer %s', (path,ref)=>{
 const layout=source();
 expect(layout).not.toMatch(/baidu|百度|_hmt/i);
 const dom=new JSDOM('<head></head><body></body>',{url:'https://example.test'+path,...(ref?{referrer:ref}:{})});
 for (const match of layout.matchAll(/<script is:inline>([\s\S]*?)<\/script>/g)) {
  runInNewContext(match[1],{window:dom.window,document:dom.window.document,location:dom.window.location,URL,URLSearchParams});
 }
 expect(dom.window._hmt).toBeUndefined();
 expect(dom.window.document.querySelector('script[src*="baidu"]')).toBeNull();
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
