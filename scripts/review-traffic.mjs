// Read-only: consume GA4 runReport JSON exports; no credentials or network calls.
// node scripts/review-traffic.mjs /tmp/report-directory 2026-10-04 > /tmp/review.md
// Expected files: ga-date.json, ga-source.json, ga-landing.json.
import { readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const SEARCH = new Set(['google / organic', 'bing / organic', 'yahoo / organic', 'duckduckgo / organic', 'ecosia.org / organic']);
const DAY = 86400000;
const shift = (date, days) => new Date(Date.parse(date + 'T00:00:00Z') + days * DAY).toISOString().slice(0, 10);
const iso = value => /^\d{8}$/.test(value) ? `${value.slice(0, 4)}-${value.slice(4, 6)}-${value.slice(6)}` : value;
const change = (current, previous) => previous ? `${((current / previous - 1) * 100).toFixed(1)}%` : '无可比基线';
const sum = (rows, key = 'sessions') => rows.reduce((total, row) => total + row[key], 0);
const cell = value => String(value).replaceAll('|', '\\|').replaceAll('\n', ' ');

function decode(report, dimensions) {
  if (report.error || !Array.isArray(report.rows)) throw new Error('报告错误或没有数据，不能按零流量处理');
  if (report.rowCount > report.rows.length) throw new Error('报告被截断，请先分页取全');
  const dims = report.dimensionHeaders.map(h => h.name);
  const metrics = report.metricHeaders.map(h => h.name);
  if (!dimensions.every(d => dims.includes(d)) || !metrics.includes('sessions')) throw new Error('缺少所需的维度或 sessions 指标');
  if (report.metadata?.timeZone !== 'Asia/Tokyo') throw new Error('报告时区未确认是 Asia/Tokyo');
  if (report.metadata?.dataLossFromOtherRow || report.metadata?.subjectToThresholding || report.metadata?.samplingMetadatas?.length) throw new Error('报告存在聚合损失、阈值或抽样，需单独核对后分析');
  return report.rows.map(row => {
    const result = Object.fromEntries(dims.map((d, i) => [d, row.dimensionValues[i].value]));
    for (const [i, metric] of metrics.entries()) result[metric] = Number(row.metricValues[i].value);
    if (!Number.isFinite(result.sessions) || result.sessions < 0) throw new Error('会话数无效');
    result.date = iso(result.date);
    return result;
  });
}

export function reviewTraffic(reports, asOf) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(asOf) || shift(asOf, 0) !== asOf) throw new Error('需要有效的复盘日期 YYYY-MM-DD');
  const daily = decode(reports.daily, ['date']);
  const sources = decode(reports.sources, ['date', 'sessionSourceMedium']);
  const landings = decode(reports.landings, ['date', 'sessionSourceMedium', 'landingPage']);
  // Exclude today and the two most recent calendar days: GA4 processing may take 48h.
  const end = shift(asOf, -3), start = shift(end, -6), previousEnd = shift(start, -1), previousStart = shift(start, -7);
  for (let date = previousStart; date <= end; date = shift(date, 1)) {
    if (daily.filter(r => r.date === date).length !== 1) throw new Error(`${date} 总量缺失或重复，停止完整周判断`);
  }
  for (const row of daily.filter(r => previousStart <= r.date && r.date <= end && r.sessions > 0)) {
    if (!sources.some(r => r.date === row.date) || !landings.some(r => r.date === row.date)) throw new Error(`${row.date} 来源或落地页数据缺失`);
  }
  const current = rows => rows.filter(r => start <= r.date && r.date <= end);
  const previous = rows => rows.filter(r => previousStart <= r.date && r.date <= previousEnd);
  const group = (rows, getKey) => {
    const result = new Map();
    for (const r of rows) { const k = getKey(r); result.set(k, (result.get(k) || 0) + r.sessions); }
    return result;
  };
  const table = (rows, key, limit = 15, losses = false) => {
    const a = group(current(rows), key), b = group(previous(rows), key);
    const entries = [...new Set([...a.keys(), ...b.keys()])].map(k => [k, b.get(k) || 0, a.get(k) || 0]);
    entries.sort((x, y) => losses ? (x[2] - x[1]) - (y[2] - y[1]) : y[2] - x[2]);
    return ['| 入口/来源 | 前期会话 | 当前会话 | 差额 | 变化 |', '| --- | ---: | ---: | ---: | ---: |', ...entries.filter(r => !losses || r[2] < r[1]).slice(0, limit).map(([k, b, a]) => `| ${cell(k)} | ${b} | ${a} | ${a - b} | ${change(a, b)} |`)].join('\n');
  };
  const warnings = [];
  for (const r of daily.filter(r => r.date >= previousStart)) {
    const s = sources.filter(x => x.date === r.date);
    const sourceTotal = sum(s);
    const unavailable = sum(s.filter(x => ['(data not available)', '(not set)'].includes(x.sessionSourceMedium)));
    if (r.sessions && Math.abs(sourceTotal - r.sessions) / r.sessions > .02) warnings.push(`${r.date} 来源行合计 ${sourceTotal} 与站点 ${r.sessions} 差异超过2%，不可强行对账。`);
    if (sourceTotal && unavailable / sourceTotal > .1) warnings.push(`${r.date} 未归因/不可用来源占 ${(unavailable / sourceTotal * 100).toFixed(1)}%，渠道判断待复核。`);
  }
  const searchSources = sources.filter(r => SEARCH.has(r.sessionSourceMedium));
  const searchLandings = landings.filter(r => SEARCH.has(r.sessionSourceMedium));
  const aiSources = sources.filter(r => /^(openai|chatgpt|copilot|gemini|perplexity|claude)(\.| |\/)/.test(r.sessionSourceMedium));
  const snapshot = daily.filter(r => r.date >= start).sort((a, b) => a.date.localeCompare(b.date));
  const total = sum(current(daily)), oldTotal = sum(previous(daily));
  return `# 流量复盘 ${asOf}\n\n数据时区 Asia/Tokyo。主窗口 ${start}–${end}，对照 ${previousStart}–${previousEnd}（各7天、相同星期）。排除最近两个自然日降低处理延迟干扰；更早的数据仍可能修订。\n\n` +
    `站点会话 ${oldTotal} → ${total}（${change(total, oldTotal)}）。已列搜索引擎来源会话 ${sum(previous(searchSources))} → ${sum(current(searchSources))}。AI 来源单列 ${sum(previous(aiSources))} → ${sum(current(aiSources))}，不算入搜索引擎增长。\n\n` +
    `## 来源\n\n${table(sources, r => r.sessionSourceMedium)}\n\n## 搜索落地页\n\n${table(searchLandings, r => r.landingPage)}\n\n## 被增长掩盖的流失入口\n\n${table(searchLandings, r => r.landingPage, 15, true)}\n\n` +
    `## 每日快照（近两日暂定）\n\n| 日期 | 会话 | 上周同日 | 变化 | 状态 |\n| --- | ---: | ---: | ---: | --- |\n` +
    snapshot.map(r => { const old = daily.find(x => x.date === shift(r.date, -7)); return `| ${r.date} | ${r.sessions} | ${old?.sessions ?? '缺失'} | ${old ? change(r.sessions, old.sessions) : '不可比'} | ${r.date > end ? '暂定，不用于周结论' : '观察窗口'} |`; }).join('\n') +
    `\n\n## 数据限制\n\n${warnings.length ? warnings.map(s => '- ' + s).join('\n') : '- 来源行合计未发现超过2%的偏差。'}\n- 来源、落地页、站点各按自己的报告比较，不相加；(not set) 不是一个真实页面。\n- GA4会话与搜索引擎点击不是同一口径。本报告不判断排名或将变化归因于某次上线。\n- 相同星期仍可能受到日本节假日、月末和季节需求的影响，不能当作实验对照组。\n- 没有返回的低量落地页不代表已被删除或未收录。\n`;
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const [directory, asOf] = process.argv.slice(2);
  if (!directory || !asOf) throw new Error('用法: node scripts/review-traffic.mjs <GA4导出目录> <复盘日期>');
  const read = name => JSON.parse(readFileSync(join(directory, name), 'utf8'));
  console.log(reviewTraffic({daily: read('ga-date.json'), sources: read('ga-source.json'), landings: read('ga-landing.json')}, asOf));
}
