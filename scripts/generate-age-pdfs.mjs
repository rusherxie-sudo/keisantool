// Offline build helper. Requires playwright-core and Chromium plus IPA Gothic.
// PLAYWRIGHT_MODULE=/absolute/path/to/playwright-core/index.mjs node scripts/generate-age-pdfs.mjs
import { mkdir } from 'node:fs/promises';
import { hayamiTable } from '../src/lib/hayami.js';
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright-core');
const browser = await chromium.launch({ headless: true, ...(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {}) });
await mkdir('public/downloads', { recursive: true });
try {
  for (const year of [2026, 2027]) {
    const rows = hayamiTable(year - 100, year, year).reverse();
    const table = rs => `<table><thead><tr><th>西暦</th><th>和暦</th><th>年齢</th><th>数え</th><th>干支</th></tr></thead><tbody>${rs.map(r => `<tr><td>${r.seireki}</td><td>${r.wareki}</td><td>${r.age}</td><td>${r.kazoe}</td><td>${r.eto}</td></tr>`).join('')}</tbody></table>`;
    const page = await browser.newPage();
    await page.setContent(`<!doctype html><html lang="ja"><meta charset="utf-8"><title>${year}年 年齢早見表</title><style>@page{size:A4 landscape;margin:9mm}*{box-sizing:border-box}body{font-family:'IPAGothic','IPA Gothic',sans-serif;color:#172c42;margin:0}h1{font-size:21px;margin:0 0 5px}p{font-size:10px;margin:4px 0 9px}.tables{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;align-items:start}table{border-collapse:collapse;width:100%;font-size:10px}td,th{border:1px solid #b5c0ca;padding:2px 3px;height:17px;text-align:center;white-space:nowrap}th{background:#e6eef5}tr:nth-child(even){background:#f4f7fa}footer{font-size:9px;margin-top:8px}</style><h1>${year}年 年齢早見表（0〜100歳）</h1><p>年齢は${year}年の誕生日後の満年齢。誕生日前は1歳引きます（未出生の方は対象外）。数え年は生まれた年を1歳とします。改元年は元号を併記。</p><div class="tables">${[rows.slice(0,34),rows.slice(34,68),rows.slice(68)].map(table).join('')}</div><footer>計算ツール https://keisantool.com/nenrei-hayami/ ｜ 西暦・和暦・満年齢・数え年・干支 ｜ ${year - 100}〜${year}年生まれ</footer></html>`);
    await page.evaluate(() => document.fonts.ready);
    await page.pdf({ path: `public/downloads/nenrei-hayami-${year}.pdf`, preferCSSPageSize: true, printBackground: true, tagged: true });
    await page.screenshot({ path: `/tmp/nenrei-pdf-${year}.png`, fullPage: true });
    await page.close();
  }
} finally { await browser.close(); }
