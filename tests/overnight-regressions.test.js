import { describe, it, expect, vi, afterEach } from 'vitest';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { JSDOM } from 'jsdom';
import { hinodeIri } from '../src/lib/hinodeiri.js';
import { japanDateParts } from '../src/lib/japanDate.js';
import { calcSuisui } from '../src/lib/suisui.js';
afterEach(() => vi.useRealTimers());
const read = path => readFileSync(path, 'utf8');
describe('sunrise hub output lifetime', () => {
  it('uses JST at year boundary, labels chosen day, clears stale output and share', () => {
    const dom = new JSDOM('<input id="hd-date"><select id="hd-city"><option value="tokyo">東京</option></select>'+['hd-result','hd-city-label','hd-main','hd-sunrise','hd-sunset','hd-length'].map(id=>`<div id="${id}"></div>`).join(''));
    const window = dom.window; window.setResultShare = vi.fn(); window.hideResultShare = vi.fn();
    vi.useFakeTimers(); vi.setSystemTime(new Date('2026-12-31T15:30:00Z'));
    const code=read('src/pages/hinodeiri/index.astro').match(/<script>([\s\S]*?)<\/script>/)[1].replace(/^\s*import .*;$/gm,'');
    runInNewContext(code,{window,document:window.document,hinodeIri,japanDateParts,Date});
    const input=window.document.querySelector('#hd-date');
    expect(input.value).toBe('2027-01-01');
    input.value='2028-02-29'; input.dispatchEvent(new window.Event('input'));
    expect(window.document.querySelector('#hd-city-label').textContent).toContain('2028-02-29');
    input.value=''; input.dispatchEvent(new window.Event('input'));
    expect(window.document.querySelector('#hd-main').textContent).toBe('―');
    expect(window.document.querySelector('#hd-result').classList.contains('visible')).toBe(false);
    expect(window.hideResultShare).toHaveBeenCalled();
  });
});
describe('optional analytics must not break calculators', () => {
  it('ignores missing and throwing transports and sends no input values', () => {
    const source=read('src/layouts/ToolLayout.astro');
    const code=[...source.matchAll(/<script is:inline>([\s\S]*?)<\/script>/g)].at(-1)[1];
    const gtag=vi.fn(()=>{throw new Error('optional transport failed');});
    const window={gtag}; const document={body:{dataset:{toolSlug:'eigyoubi'}},addEventListener(){}};
    runInNewContext(code,{window,document,location:{search:'',href:'https://example.test/eigyoubi/'},URLSearchParams,URL});
    expect(()=>window.trackCalculatorResult('business-calendar')).not.toThrow();
    expect(gtag.mock.calls[0]).toEqual(['event','calculator_result_view',{tool_slug:'eigyoubi',result_type:'business-calendar'}]);
    delete window.gtag; expect(()=>window.trackCalculatorResult('range')).not.toThrow();
  });
});
it.each([Infinity,-Infinity,NaN,'',0,-1])('water model rejects %s', value=>{
  expect(calcSuisui(value).recommended).toBe(0);
});
it('successful URL copy stays successful when optional share tracking throws', async () => {
  const dom=new JSDOM('<section id="result-share" hidden><button class="rshare__btn" data-act="copy">コピー</button><button data-act="sys"></button><a id="result-page-link"></a><span id="result-share-hint"></span><textarea id="result-share-fallback" hidden></textarea></section>',{url:'https://example.test/eigyoubi/'});
  const window=dom.window;window.gtag=()=>{throw new Error('optional');};
  const writeText=vi.fn().mockResolvedValue();Object.defineProperty(window.navigator,'clipboard',{value:{writeText}});
  const code=read('src/components/ResultShare.astro').match(/<script>([\s\S]*?)<\/script>/)[1];
  runInNewContext(code,{window,document:window.document,navigator:window.navigator,location:window.location,URL,Event:window.Event,setTimeout(){}});
  window.setResultShare('result',{url:'https://example.test/result/eigyoubi/#v=1'});
  window.document.querySelector('[data-act=copy]').click();await new Promise(resolve=>setTimeout(resolve,0));
  expect(writeText).toHaveBeenCalledOnce();
  expect(window.document.querySelector('[data-act=copy]').textContent).toBe('コピーしました');
  expect(window.document.querySelector('#result-share-fallback').hidden).toBe(true);
});
it('a throwing shared-result return event cannot prevent helper registration',()=>{
 const code=[...read('src/layouts/ToolLayout.astro').matchAll(/<script is:inline>([\s\S]*?)<\/script>/g)].at(-1)[1];
 const window={gtag(){throw new Error('optional');}};
 expect(()=>runInNewContext(code,{window,document:{body:{dataset:{toolSlug:'eigyoubi'}},addEventListener(){}},location:{search:'?from=shared-result'},URLSearchParams})).not.toThrow();
 expect(typeof window.trackCalculatorResult).toBe('function');
});
