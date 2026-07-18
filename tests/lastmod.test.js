import { describe, it, expect } from 'vitest';
import { join } from 'node:path';
import { lastModifiedISO, sourceFileForUrl } from '../src/lib/lastmod.js';

describe('lastModifiedISO', () => {
  it('returns an ISO 8601 date string for a file tracked by git', () => {
    const iso = lastModifiedISO('package.json');
    expect(iso).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
  });

  it('returns null for a file that does not exist and has no git history', () => {
    const iso = lastModifiedISO('this-file-does-not-exist-anywhere.txt');
    expect(iso).toBeNull();
  });

  it('caches results so repeated calls for the same file are consistent', () => {
    const first = lastModifiedISO('package.json');
    const second = lastModifiedISO('package.json');
    expect(second).toBe(first);
  });
});

describe('sourceFileForUrl', () => {
  const pagesDir = join(process.cwd(), 'src/pages');

  it('resolves the homepage to index.astro', () => {
    expect(sourceFileForUrl(pagesDir, '')).toBe(join(pagesDir, 'index.astro'));
  });

  it('resolves a static tool slug to its index.astro', () => {
    expect(sourceFileForUrl(pagesDir, 'zeizei')).toBe(join(pagesDir, 'zeizei', 'index.astro'));
  });

  it('resolves category hub URLs to the dynamic [slug].astro route', () => {
    expect(sourceFileForUrl(pagesDir, 'category/zeikin')).toBe(join(pagesDir, 'category/[slug].astro'));
  });

  it('resolves blog article and category URLs to their dynamic routes', () => {
    expect(sourceFileForUrl(pagesDir, 'blog/example-post')).toBe(join(pagesDir, 'blog/[slug].astro'));
    expect(sourceFileForUrl(pagesDir, 'blog/category/zeikin-kiso')).toBe(join(pagesDir, 'blog/category/[slug].astro'));
  });

  it('resolves umaredoshi year URLs to the dynamic [year].astro route', () => {
    expect(sourceFileForUrl(pagesDir, 'umaredoshi/1990')).toBe(join(pagesDir, 'umaredoshi/[year].astro'));
  });

  it('resolves seiza-aisho pair URLs to the dynamic [pair].astro route', () => {
    expect(sourceFileForUrl(pagesDir, 'seiza-aisho/ohitsuji-oushi')).toBe(
      join(pagesDir, 'seiza-aisho/[pair].astro')
    );
  });

  it('returns null for an unresolvable path', () => {
    expect(sourceFileForUrl(pagesDir, 'does-not-exist-anywhere')).toBeNull();
  });
});
