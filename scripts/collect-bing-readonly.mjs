// Read-only Bing reports for this site. Uses the existing environment credential;
// never logs URLs, credentials, API error bodies, or changes Bing settings.
// node scripts/collect-bing-readonly.mjs /tmp/keisantool-bing-YYYYMMDD
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve, relative, isAbsolute } from 'node:path';
import { fileURLToPath } from 'node:url';

const output = process.argv[2];
const key = process.env.BING_WEBMASTER_API_KEY;
if (!output || !key) throw new Error('需要仓库外输出目录和已配置的 BING_WEBMASTER_API_KEY 环境变量');
const directory = resolve(output);
const repo = fileURLToPath(new URL('../', import.meta.url));
const rel = relative(repo, directory);
if (!rel || (!rel.startsWith('..' + '/') && !isAbsolute(rel))) throw new Error('原始分析数据必须保存在仓库外');
await mkdir(directory, {recursive:true, mode:0o700});
const methods = ['GetRankAndTrafficStats', 'GetPageStats', 'GetQueryStats', 'GetCrawlStats'];
for (const method of methods) {
  try {
    // Keep siteUrl literal: the legacy service rejects encoded URL separators.
    const response = await fetch(`https://ssl.bing.com/webmaster/api.svc/json/${method}?apikey=${encodeURIComponent(key)}&siteUrl=https://keisantool.com/`, {signal:AbortSignal.timeout(40000), redirect:'error'});
    if (!response.ok) throw new Error('request failed');
    const report = await response.json();
    if (!Array.isArray(report.d)) throw new Error('invalid report');
    await writeFile(resolve(directory, `${method}.json`), JSON.stringify(report), {mode:0o600});
    console.log(`${method}: ${report.d.length} rows`);
  } catch {
    // Do not print the error: fetch errors can include an authenticated URL.
    console.error(`${method}: 读取失败，不能作为零流量；请核对连接或现有授权。`);
    process.exitCode = 1;
  }
}
