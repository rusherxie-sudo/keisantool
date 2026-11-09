import { afterEach, describe, expect, it, vi } from 'vitest';
import { join } from 'node:path';

const root = process.cwd();
const pagesDir = join(root, 'src/pages');
const baseline = '2026-10-01T10:00:00.000Z';
const changed = '2026-11-09T18:00:00.000Z';

async function urlDates(dependency, dependencyDate) {
  // A later answer-data commit must change the URL date even if its template stays unchanged.
  const manifest = Object.fromEntries([
    'src/pages/umaredoshi/[year].astro', 'src/lib/nenrei.js', 'src/lib/rokusei.js',
    'src/lib/hayami.js', 'src/lib/wareki.js', 'src/lib/seiza.js', 'src/lib/yakudoshi.js',
    'src/pages/enko/index.astro', 'src/lib/enko.js',
  ].map(file => [file, baseline]));
  manifest[`src/lib/${dependency}.js`] = dependencyDate;
  vi.resetModules();
  vi.doMock('node:fs', async (importOriginal) => {
    const actual = await importOriginal();
    return { ...actual, readFileSync(file, ...args) {
      return String(file) === join(root, 'src/data/lastmod.json')
        ? JSON.stringify(manifest) : actual.readFileSync(file, ...args);
    } };
  });
  const { lastModifiedForUrl } = await import('../src/lib/lastmod.js');
  return Object.fromEntries(['umaredoshi/1900', 'umaredoshi/1990', 'umaredoshi/2010', 'enko']
    .map(url => [url, lastModifiedForUrl(pagesDir, url)]));
}

afterEach(() => { vi.doUnmock('node:fs'); vi.resetModules(); });

describe('birth-year answer data lastmod dependency', () => {
  it.each(['hayami', 'wareki', 'yakudoshi'])('uses a later %s commit for every birth-year URL without changing an unrelated tool date', async (dependency) => {
    const before = await urlDates(dependency, baseline);
    const after = await urlDates(dependency, changed);
    for (const url of ['umaredoshi/1900', 'umaredoshi/1990', 'umaredoshi/2010']) {
      expect(before[url]).toBe(baseline);
      expect(after[url]).toBe(changed);
    }
    expect(after.enko).toBe(before.enko);
    expect(after.enko).toBe(baseline);
  });

  it('ignores seiza data that hayami imports but the birth-year page does not consume', async () => {
    expect(await urlDates('seiza', changed)).toEqual(await urlDates('seiza', baseline));
  });
});
