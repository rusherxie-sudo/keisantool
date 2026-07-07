// ページ「実際の最終更新日」を git コミット日時から取得する共有ロジック。
// sitemap の lastmod（astro.config.mjs）と、各ページ JSON-LD の dateModified（ToolLayout.astro）の
// 両方から参照する単一の実装。git が使えない場合のみファイルの mtime にフォールバックする。
import { execSync } from 'node:child_process';
import { statSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const dateCache = new Map();

export function lastModifiedISO(file) {
  if (dateCache.has(file)) return dateCache.get(file);
  let iso = null;
  try {
    // %cI = strict ISO 8601 のコミット日時
    const out = execSync(`git log -1 --format=%cI -- "${file}"`, {
      cwd: process.cwd(),
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
    iso = out || null;
  } catch {
    iso = null;
  }
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

// 出力 URL（'' | 'zeizei' | 'category/zeikin' | 'umaredoshi/1990' | 'seiza-aisho/xxx-yyy' など）
// → ソース .astro ファイルの絶対パスを解決する。sitemap 生成と JSON-LD dateModified の両方で使う。
export function sourceFileForUrl(pagesDir, urlPath) {
  const path = urlPath.replace(/^\/+|\/+$/g, '');
  if (path === '') return join(pagesDir, 'index.astro');
  // カテゴリハブは動的ルート（全ハブが同一ファイル＝ハブのテンプレ／内容が変わった日になる）
  if (path.startsWith('category/')) return join(pagesDir, 'category/[slug].astro');
  // 生まれ年ページも動的ルート（全年が同一テンプレ）
  if (path.startsWith('umaredoshi/')) return join(pagesDir, 'umaredoshi/[year].astro');
  // 星座相性の144組み合わせページも動的ルート（テンプレの最終更新日を lastmod にする）
  if (/^seiza-aisho\/.+/.test(path)) return join(pagesDir, 'seiza-aisho/[pair].astro');
  const nested = join(pagesDir, path, 'index.astro'); // <slug>/index.astro
  if (existsSync(nested)) return nested;
  const flat = join(pagesDir, `${path}.astro`); // <slug>.astro
  if (existsSync(flat)) return flat;
  return null;
}
