import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { lastModifiedForUrl } from './src/lib/lastmod.js';
import { shouldIncludeInSitemap } from './src/lib/sitemap.js';

const projectRoot = dirname(fileURLToPath(import.meta.url));
const pagesDir = join(projectRoot, 'src/pages');

export default defineConfig({
  site: 'https://keisantool.com',
  integrations: [
    sitemap({
      // 相性組み合わせページは少数の判定モデルから展開する補助ページ。
      // AdSense 再審査中は検索インデックスの品質比率を優先し、ハブだけを掲載する。
      filter(page) {
        return shouldIncludeInSitemap(page);
      },
      serialize(item) {
        // sitemap の lastmod は「ビルド日」ではなく、各ページが本当に更新された日付にする
        // （git の最終コミット日時。JSON-LD の dateModified と同じロジックを共有 → src/lib/lastmod.js）
        const path = new URL(item.url).pathname;
        const iso = lastModifiedForUrl(pagesDir, path);
        if (iso) item.lastmod = iso;
        return item;
      },
    }),
  ],
});
