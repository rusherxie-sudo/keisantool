import { describe, it, expect } from 'vitest';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, copyFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { execFileSync } from 'node:child_process';

const dependencies = ['office-holiday-reference.json', 'office-month-notes.js', 'bonus-rates-2026.js'];

describe('committed lastmod manifest in a real shallow clone', () => {
  it('keeps historical data dates and exposes the wrong fallback when an entry is missing', () => {
    const temp = mkdtempSync(join(tmpdir(), 'keisantool-lastmod-'));
    const source = join(temp, 'source');
    const shallow = join(temp, 'shallow');
    const run = (command, args, cwd = source, env = process.env) => execFileSync(command, args, { cwd, env, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
    try {
      mkdirSync(join(source, 'src/data'), { recursive: true });
      mkdirSync(join(source, 'src/lib'), { recursive: true });
      writeFileSync(join(source, 'package.json'), '{"type":"module"}');
      copyFileSync('src/lib/lastmod.js', join(source, 'src/lib/lastmod.js'));
      for (const file of dependencies) writeFileSync(join(source, 'src/data', file), '{}');
      run('git', ['init', '-q']);
      run('git', ['config', 'user.name', 'Fixture']);
      run('git', ['config', 'user.email', 'fixture@example.invalid']);
      run('git', ['add', '.']);
      const oldDate = '2026-09-18T12:46:23Z';
      const newerDate = '2026-11-09T19:24:09Z';
      const commit = (message, date) => run('git', ['commit', '-qm', message], source, { ...process.env, GIT_AUTHOR_DATE: date, GIT_COMMITTER_DATE: date });
      commit('historical content', oldDate);
      // 本物の生成スクリプトで欠落した3項目が収録されることを確認する。
      run(process.execPath, [join(process.cwd(), 'scripts/update-lastmod.mjs')]);
      const manifestPath = join(source, 'src/data/lastmod.json');
      const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
      for (const file of dependencies) expect(manifest[`src/data/${file}`]).toBe(oldDate);
      run('git', ['add', 'src/data/lastmod.json']);
      commit('manifest release', newerDate);
      run('git', ['clone', '-q', '--depth=1', pathToFileURL(source).href, shallow]);
      expect(run('git', ['rev-parse', '--is-shallow-repository'], shallow)).toBe('true');
      expect(run('git', ['log', '-1', '--format=%cI', '--', `src/data/${dependencies[0]}`], shallow)).toBe(newerDate);
      const query = `import {lastModifiedISO} from './src/lib/lastmod.js'; console.log(JSON.stringify(${JSON.stringify(dependencies)}.map(file => lastModifiedISO('src/data/'+file))));`;
      const dates = () => JSON.parse(run(process.execPath, ['--input-type=module', '-e', query], shallow));
      expect(dates()).toEqual(dependencies.map(() => oldDate));
      // manifest が欠けると shallow 履歴の新しい日付が使われる再現用対照。
      delete manifest[`src/data/${dependencies[0]}`];
      writeFileSync(join(shallow, 'src/data/lastmod.json'), JSON.stringify(manifest));
      expect(dates()).toEqual([newerDate, oldDate, oldDate]);
    } finally {
      rmSync(temp, { recursive: true, force: true });
    }
  });
});
