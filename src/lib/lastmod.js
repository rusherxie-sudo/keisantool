// ページ「実際の最終更新日」を git コミット日時から取得する共有ロジック。
// sitemap の lastmod（astro.config.mjs）と、各ページ JSON-LD の dateModified（ToolLayout.astro）の
// 両方から参照する単一の実装。
// 優先順位：① scripts/update-lastmod.mjs が生成する src/data/lastmod.json（manifest）
// → ② git log → ③ ファイル mtime。
// Cloudflare Pages の Git 統合ビルドは shallow clone（git 履歴が無い）のため、ビルド中に git log を
// 引くと全ファイルが同じ「デプロイ日」になる。そこで完全な git 履歴のある手元で manifest を生成・
// コミットしておき、まずそれを参照する（ローカルの git log と値は一致する）。
import { execSync } from 'node:child_process';
import { statSync, existsSync, readFileSync } from 'node:fs';
import { join, relative, isAbsolute } from 'node:path';

const dateCache = new Map();

// scripts/update-lastmod.mjs が生成した「repo 相対パス → git 最終コミット ISO」のマップ。
// モジュールレベルの変数に一度だけ読み込む（ビルド中に何百回も呼ばれるため）。
let manifest = null;
function loadManifest() {
  if (manifest === null) {
    try {
      manifest = JSON.parse(
        readFileSync(join(process.cwd(), 'src/data/lastmod.json'), 'utf8')
      );
    } catch {
      manifest = {}; // 未生成・読めない場合は git log / mtime にフォールバック
    }
  }
  return manifest;
}

export function lastModifiedISO(file) {
  if (dateCache.has(file)) return dateCache.get(file);
  let iso = null;
  // ① コミット済み manifest を最優先で参照（絶対パスは repo 相対パスに直して引く）
  const manifestKey = isAbsolute(file) ? relative(process.cwd(), file) : file;
  iso = loadManifest()[manifestKey] || null;
  if (!iso) {
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
  // ブログ記事・ブログカテゴリも動的ルート。記事本文の更新日を sitemap に反映する。
  if (path.startsWith('blog/category/')) return join(pagesDir, 'blog/category/[slug].astro');
  if (path === 'blog') return join(pagesDir, 'blog/index.astro');
  if (path.startsWith('blog/')) return join(pagesDir, 'blog/[slug].astro');
  // 生まれ年ページも動的ルート（全年が同一テンプレ）
  if (path.startsWith('umaredoshi/')) return join(pagesDir, 'umaredoshi/[year].astro');
  // 日の出・日の入りの都市別ページも動的ルート（全都市が同一テンプレ）
  if (path.startsWith('hinodeiri/')) return join(pagesDir, 'hinodeiri/[city].astro');
  // 時差(JISA)の都市別ページも動的ルート（全都市が同一テンプレ）
  if (path.startsWith('jisa/')) return join(pagesDir, 'jisa/[city].astro');
  // 六星占術の12タイプ別ページも動的ルート
  if (path.startsWith('rokusei/')) return join(pagesDir, 'rokusei/[type].astro');
  // 地域別最低賃金の47都道府県ページ：内容は src/lib/saitei.js のデータから生成されるため、
  // lastmod はデータファイルのコミット日時を参照する（答申追記ごとに自動更新される）。
  if (path.startsWith('saitei/')) return join(process.cwd(), 'src/lib/saitei.js');
  // 星座相性の144組み合わせページも動的ルート（テンプレの最終更新日を lastmod にする）
  if (/^seiza-aisho\/.+/.test(path)) return join(pagesDir, 'seiza-aisho/[pair].astro');
  // 六曜カレンダーの月別スポークページも動的ルート
  if (/^rokuyo\/\d{4}-\d{2}$/.test(path)) return join(pagesDir, 'rokuyo/[month].astro');
  // 祝日・連休カレンダーの年別スポークページも動的ルート
  if (/^shukujitsu\/\d{4}$/.test(path)) return join(pagesDir, 'shukujitsu/[year].astro');
  const nested = join(pagesDir, path, 'index.astro'); // <slug>/index.astro
  if (existsSync(nested)) return nested;
  const flat = join(pagesDir, `${path}.astro`); // <slug>.astro
  if (existsSync(flat)) return flat;
  return null;
}
