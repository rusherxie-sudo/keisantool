import { describe, it, expect, vi, afterEach } from 'vitest';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { seizaAisho, signBySlug, pairPath, SIGNS } from '../src/lib/seiza-aisho.js';
import { seiza } from '../src/lib/seiza.js';
import { hinodeIri } from '../src/lib/hinodeiri.js';
import { japanDateParts } from '../src/lib/japanDate.js';
import { dogHumanAge, sizeFromWeight } from '../src/lib/pet-age.js';
const read = path => readFileSync(new URL('../' + path, import.meta.url), 'utf8');
function element(value = '') {
  return { value, textContent: '', dataset: {}, style: {}, handlers: {}, classList: { add() {}, remove() {} },
    addEventListener(type, fn) { this.handlers[type] = fn; }, setAttribute(k,v) { this[k] = v; }, focus() {}, scrollIntoView() {} };
}
function client(path, extras = {}, matrix = []) {
  const nodes = {};
  const get = id => nodes[id] ||= element();
  const root = element(); root.dataset.cityId = 'tokyo';
  const document = { getElementById: get, querySelector: () => root, querySelectorAll: () => matrix };
  const window = { addEventListener() {}, setResultShare: vi.fn(), hideResultShare: vi.fn() };
  const script = read(path).match(/<script>([\s\S]*?)<\/script>/)[1].replace(/^\s*import .*;$/gm, '');
  runInNewContext(script, { document, window, location: { hash: '' }, seizaAisho, signBySlug, pairPath, SIGNS, seiza, hinodeIri, japanDateParts, Date, ...extras });
  return { get, window };
}
afterEach(() => vi.useRealTimers());
describe('batch1: comparison stays on the hub with link fallback', () => {
  it('ordinary activation updates selectors/result; modified clicks keep the detail link', () => {
    const link = element(); link.dataset = { sign1: 'uo', sign2: 'ohitsuji' };
    const { get } = client('src/pages/seiza-aisho/index.astro', {}, [link]);
    expect(link.handlers.click).toBeTypeOf('function');
    const preventDefault = vi.fn();
    link.handlers.click({ button: 0, preventDefault }); // Enter on an anchor also generates click
    expect(preventDefault).toHaveBeenCalledOnce();
    expect(get('sa-s1').value).toBe('uo');
    expect(get('sa-s2').value).toBe('ohitsuji');
    expect(get('sa-score').textContent).toBe(62);
    expect(get('sa-detail-link').href).toBe('/seiza-aisho/ohitsuji-uo/');
    preventDefault.mockClear();
    link.handlers.click({ button: 0, ctrlKey: true, preventDefault });
    expect(preventDefault).not.toHaveBeenCalled();
  });
  it('static anchors have accessible names and real detail URLs; removes recommendation loop', () => {
    const hub = read('src/pages/seiza-aisho/index.astro');
    expect(hub).toContain('href={matrix[i][j].href}');
    expect(hub).toContain('aria-label={matrix[i][j].label}');
    expect(hub).not.toContain('詳しい相性');
    expect(hub).toContain('同じ距離なら同じ点数');
    const pair = read('src/pages/seiza-aisho/[pair].astro');
    expect(pair).not.toContain('others.map');
    expect(pair).toContain('robots="noindex,follow"');
  });
});
describe('batch1: city input/label/result use the same JST date', () => {
  it.each([
    ['2026-11-07T14:59:59Z', '2026-11-07'],
    ['2026-11-07T15:00:00Z', '2026-11-08'],
    ['2026-12-31T15:00:00Z', '2027-01-01'],
  ])('%s defaults to %s even outside Japan', (instant, date) => {
    vi.useFakeTimers(); vi.setSystemTime(new Date(instant));
    const { get } = client('src/pages/hinodeiri/[city].astro');
    expect(get('hd-date').value).toBe(date);
    expect(get('hd-city-label').textContent).toContain(date);
    get('hd-date').value = '2028-02-29'; get('hd-date').handlers.input();
    expect(get('hd-city-label').textContent).toContain('2028-02-29');
    const expected = hinodeIri(2028, 2, 29, 'tokyo');
    expect(get('hd-main').textContent).toBe(`${expected.sunrise} 〜 ${expected.sunset}`);
    get('hd-date').value = ''; get('hd-date').handlers.input();
    expect(get('hd-main').textContent).not.toContain(expected.sunrise);
  });
  it('static output says reference date and exposes actual coordinates without a precision promise', () => {
    const city = read('src/pages/hinodeiri/[city].astro');
    expect(city).toContain('class="result-box visible" id="hd-result"');
    expect(city).toContain('value={tokyoToday} disabled');
    expect(city).not.toContain('本日');
    expect(city).toContain('基準日');
    expect(city).toContain('coordinates.lat');
    expect(city).toContain('coordinates.lon');
    expect(city).not.toContain('1分程度');
  });
});
describe('batch1: dog article is reproducible against the real tool', () => {
  it.each([['small',36],['medium',36],['large',40]])('5-year %s example = %i', (size, age) => {
    expect(dogHumanAge(5,size)).toBe(age);
    const article = read('src/content/blog/inu-nenrei-no-kakikata.md');
    expect(article).toContain(`| ${size === 'small' ? '小型犬' : size === 'medium' ? '中型犬' : '大型犬'} |`);
    expect(article).toContain(`${age}歳`);
  });
  it('documents first two years, interpolation, floor and exact size boundaries', () => {
    const article = read('src/content/blog/inu-nenrei-no-kakikata.md');
    for (const phrase of ['15歳', '24歳', '12歳', '19歳', '切り捨て', '10kg超〜25kg以下', '25kg超', '換算式の根拠ではありません']) expect(article).toContain(phrase);
    expect([10,10.01,25,25.01].map(sizeFromWeight)).toEqual(['small','medium','medium','large']);
    for (const size of ['small','medium','large']) {
      expect([0,0.5,1,1.5,2,2.5].map(age => dogHumanAge(age,size))).toEqual(size === 'large' ? [0,6,12,15,19,22] : [0,7,15,19,24,26]);
    }
    const tool = read('src/pages/inu-nenrei/index.astro');
    expect(tool).toContain('中型（10kg超〜25kg以下）');
    expect(tool).toContain('大型（25kg超）');
  });
});
