import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { execSync } from 'node:child_process';
import { statSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const projectRoot = dirname(fileURLToPath(import.meta.url));
const pagesDir = join(projectRoot, 'src/pages');

// 页面源文件 → 「実際の最終更新日」。
// 注意：sitemap の lastmod は「ビルド日」ではなく、各ページが本当に更新された日付にする。
// → git の最終コミット日時を採用（clone/checkout しても変わらない客観的な値）。
// git が使えない場合のみファイルの mtime にフォールバックする。
const dateCache = new Map();
function lastModifiedISO(file) {
  if (dateCache.has(file)) return dateCache.get(file);
  let iso = null;
  try {
    // %cI = strict ISO 8601 のコミット日時
    const out = execSync(`git log -1 --format=%cI -- "${file}"`, {
      cwd: projectRoot,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
    iso = out || null;
  } catch {
    iso = null;
  }
  // 未コミット（git 履歴なし）の場合は実ファイルの更新時刻を使う
  if (!iso && existsSync(file)) {
    try {
      iso = statSync(file).mtime.toISOString();
    } catch {
      iso = null;
    }
  }
  dateCache.set(file, iso);
  return iso;
}

// 出力 URL → ソース .astro ファイルを解決する。
function sourceFileForUrl(url) {
  const path = new URL(url).pathname.replace(/^\/+|\/+$/g, ''); // '' | 'zeizei' | 'category/zeikin'
  if (path === '') return join(pagesDir, 'index.astro');
  // カテゴリハブは動的ルート（全ハブが同一ファイル＝ハブのテンプレ／内容が変わった日になる）
  if (path.startsWith('category/')) return join(pagesDir, 'category/[slug].astro');
  // 星座相性の144組み合わせページも動的ルート（テンプレの最終更新日を lastmod にする）
  if (/^seiza-aisho\/.+/.test(path)) return join(pagesDir, 'seiza-aisho/[pair].astro');
  const nested = join(pagesDir, path, 'index.astro'); // <slug>/index.astro
  if (existsSync(nested)) return nested;
  const flat = join(pagesDir, `${path}.astro`); // <slug>.astro
  if (existsSync(flat)) return flat;
  return null;
}

export default defineConfig({
  site: 'https://keisantool.com',
  integrations: [
    sitemap({
      serialize(item) {
        const file = sourceFileForUrl(item.url);
        const iso = file ? lastModifiedISO(file) : null;
        if (iso) item.lastmod = iso;
        return item;
      },
    }),
  ],
});
