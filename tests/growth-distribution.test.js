import { describe, it, expect } from 'vitest';
import { fortuneZone, daisakkaiPeriod } from '../src/lib/rokusei.js';
import { shouldIncludeInSitemap } from '../src/lib/sitemap.js';
import { sourceFileForUrl } from '../src/lib/lastmod.js';
import { join } from 'node:path';

describe('2027 annual reference and distribution routes', () => {
  it('matches the three published 2027 annual phases and their final years', () => {
    for (const [type,zone,end] of [['金星人プラス','陰影',2029],['火星人マイナス','停止',2028],['火星人プラス','減退',2027]]) {
      expect(fortuneZone(type,2027).zone).toBe(zone);
      expect(daisakkaiPeriod(type,2027).endYear).toBe(end);
      expect(fortuneZone(type,end+1).zone).toBe('種子');
    }
    expect(fortuneZone('天王星人マイナス',2027).zone).toBe('種子');
  });
  it('keeps widget duplicate out of sitemap and useful landing pages in it', () => {
    expect(shouldIncludeInSitemap('https://keisantool.com/embed/eigyoubi/')).toBe(false);
    for(const path of ['rokusei/daisakkai-2027','kinmu-jikan/template']) expect(shouldIncludeInSitemap(`https://keisantool.com/${path}/`)).toBe(true);
  });
  it('uses the annual source instead of the type template for lastmod', () => {
    const pages=join(process.cwd(),'src/pages');
    expect(sourceFileForUrl(pages,'rokusei/daisakkai-2027')).toBe(join(pages,'rokusei/daisakkai-2027.astro'));
  });
});
