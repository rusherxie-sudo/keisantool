// Offline export helper; external Playwright/Chromium + IPA Gothic, as for age PDFs.
import { mkdir } from 'node:fs/promises';
import { businessMonth, BUSINESS_YEARS } from '../src/lib/office-tools.js';
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright-core');
const browser = await chromium.launch({ headless: true, ...(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {}) });
await mkdir('public/downloads', { recursive: true });
try {
  for (const year of BUSINESS_YEARS) {
    const months = Array.from({ length: 12 }, (_, i) => businessMonth(year, i + 1));
    const page = await browser.newPage();
    await page.setContent(`<!doctype html><html lang="ja"><meta charset="utf-8"><title>${year}年営業日カレンダー</title><style>@page{size:A4 landscape;margin:10mm}*{box-sizing:border-box}body{font-family:'IPAGothic','IPA Gothic',sans-serif;color:#172c42;margin:0}h1{font-size:21px;margin:0 0 6px}p,footer{font-size:10px}.months{display:grid;grid-template-columns:repeat(4,1fr);gap:10px}h2{font-size:13px;margin:4px 0}table{width:100%;border-collapse:collapse;font-size:10px}td,th{border:1px solid #ccc;text-align:center;padding:3px}td.off{background:#eee;color:#8a2931}.source{margin-top:10px}</style><h1>${year}年（令和${year - 2018}年）営業日カレンダー｜年間${months.reduce((n,m)=>n+m.businessDays,0)}営業日</h1><p>土日・日本の国民の祝日を除く目安。会社独自の休日、銀行の年末年始、夏季休業は含みません。灰色は休日です。</p><div class="months">${months.map(m=>{
      const cells = [...Array(m.days[0].weekday).fill(null), ...m.days];
      while(cells.length % 7) cells.push(null);
      const rows = Array.from({length:cells.length/7},(_,i)=>cells.slice(i*7,i*7+7));
      return `<section><h2>${m.month}月：${m.businessDays}営業日</h2><table><thead><tr>${['日','月','火','水','木','金','土'].map(w=>`<th>${w}</th>`).join('')}</tr></thead><tbody>${rows.map(row=>`<tr>${row.map(d=>`<td class="${d&&!d.working?'off':''}">${d?d.day:''}</td>`).join('')}</tr>`).join('')}</tbody></table></section>`;
    }).join('')}</div><p class="source">祝日出典：内閣府 https://www8.cao.go.jp/chosei/shukujitsu/gaiyou.html ｜ 会社休日の設定・日付別CSV：https://keisantool.com/eigyoubi/</p></html>`);
    await page.evaluate(() => document.fonts.ready);
    await page.pdf({ path: `public/downloads/eigyoubi-${year}.pdf`, preferCSSPageSize: true, printBackground: true, tagged: true });
    await page.close();
  }
} finally { await browser.close(); }
