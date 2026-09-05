// src/data/lastmod.json を生成する（コミット式の lastmod manifest）。
// 中身は「repo 相対パス → 最後の git コミット日時(ISO)」のマップ。
//
// 背景：Cloudflare Pages の Git 統合ビルドは shallow clone（完全な git 履歴なし）のため、
// ビルド中に src/lib/lastmod.js が git log を引くと、全ファイルが同じ「デプロイ日」に
// なって sitemap の lastmod / JSON-LD の dateModified が全部失われる。
// そこで完全な git 履歴のある手元でこのスクリプトを実行し、結果を src/data/lastmod.json に
// コミットしておく。ビルド時は git log の代わりにこの manifest を参照する。
//
// 使い方（デプロイ前にコミット済みの最新状態で実行）:
//   node scripts/update-lastmod.mjs
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { execSync } from 'node:child_process';

const ROOT = process.cwd();

// lastmod の算出対象にする追跡パス。git ls-files は追跡済みファイルだけを返すので、
// 未コミットの新規ファイルはここに含まれず、実行側で git log / mtime にフォールバックする。
const TARGETS = [
  'src/pages',
  'src/lib',
  'src/content',
  'src/components',
  'src/layouts',
  'astro.config.mjs',
  'package.json',
];

function sh(cmd) {
  return execSync(cmd, {
    cwd: ROOT,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'ignore'],
  }).trim();
}

const files = sh(`git ls-files ${TARGETS.join(' ')}`)
  .split('\n')
  .map((line) => line.trim())
  .filter(Boolean);

const manifest = {};
for (const file of files) {
  try {
    const iso = sh(`git log -1 --format=%cI -- "${file}"`);
    if (iso) manifest[file] = iso; // 空（履歴なし）はスキップ
  } catch {
    // 履歴を引けないファイルは入れない（git log / mtime にフォールバックさせる）
  }
}

const output = resolve(ROOT, 'src/data/lastmod.json');
mkdirSync(dirname(output), { recursive: true });
writeFileSync(output, JSON.stringify(manifest, null, 2) + '\n', 'utf8');
console.log(`src/data/lastmod.json: ${Object.keys(manifest).length} files`);
