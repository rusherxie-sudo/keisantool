import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { JSDOM } from 'jsdom';

const source = readFileSync('src/layouts/ToolLayout.astro', 'utf8');
const code = [...source.matchAll(/<script is:inline>([\s\S]*?)<\/script>/g)]
  .find(match => match[1].includes('googletagmanager.com'))[1];
function page(path, referrer = '') {
  const dom = new JSDOM('<head></head>', { url: 'https://keisantool.com' + path, ...(referrer ? { referrer } : {}) });
  const context = { window: dom.window, document: dom.window.document, location: dom.window.location, URL };
  runInNewContext(code, context);
  return { dom, context, tag: dom.window.document.querySelector('script[src*="googletagmanager.com"]') };
}

describe('GA runtime privacy boundary', () => {
  it.each([
    '/tanjobi-aisho/?birthday=1990-01-01&name=SENTINEL',
    '/result/kinzoku-nensuu/#v1=SENTINEL',
    '/?q=SENTINEL', '/bmi/#SENTINEL',
  ])('does not load or queue events on %s', path => {
    const { dom, tag } = page(path);
    expect(tag).toBeNull();
    expect(dom.window.gtag).toBeUndefined();
    expect(dom.window.dataLayer).toBeUndefined();
  });
  it('blocks a referrer with input state', () => {
    const { tag } = page('/bmi/', 'https://example.test/private?name=SENTINEL');
    expect(tag).toBeNull();
  });
  it('loads once on a normal page, uses origin referrer and disables ad signals', () => {
    const { dom, context, tag } = page('/bmi/', 'https://example.test/private/path');
    expect(tag.referrerPolicy).toBe('origin');
    runInNewContext(code, context);
    expect(dom.window.document.querySelectorAll('script').length).toBe(1);
    dom.window.gtag('event', 'before_ready');
    expect(dom.window.dataLayer).toHaveLength(0);
    tag.onload();
    const config = dom.window.dataLayer[1][2];
    expect(config.page_location).toBe('https://keisantool.com/bmi/');
    expect(config.page_referrer).toBe('https://example.test');
    expect(config.allow_google_signals).toBe(false);
    expect(config.allow_ad_personalization_signals).toBe(false);
    dom.window.gtag('event', 'calculator_result_view', { tool_slug: 'bmi' });
    expect(dom.window.dataLayer).toHaveLength(3);
    expect(JSON.stringify(dom.window.dataLayer)).not.toContain('/private/path');
  });
  it('does not configure or queue when URL changes while loading', () => {
    const { dom, tag } = page('/bmi/');
    dom.window.history.replaceState(null, '', '?birthday=SENTINEL#private');
    tag.onload();
    dom.window.gtag('event', 'calculator_result_view', { tool_slug: 'bmi' });
    expect(dom.window.dataLayer).toHaveLength(0);
  });
  it('does not enqueue site events after a loaded page gains URL state', () => {
    const { dom, tag } = page('/bmi/');
    tag.onload();
    dom.window.history.replaceState(null, '', '#SENTINEL');
    dom.window.gtag('event', 'calculator_result_view', { tool_slug: 'bmi' });
    expect(dom.window.dataLayer).toHaveLength(2);
  });
  it('contains no unconditional external GA tag and sets origin referrer metadata', () => {
    expect(source).not.toMatch(/<script[^>]*src="https:\/\/www[.]googletagmanager[.]com/);
    expect(source).toContain('<meta name="referrer" content="origin" />');
  });
});
