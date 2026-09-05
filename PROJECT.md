# keisantool

> 日本語の計算・変換ツール大全（100+ 工具）。

## 核心信息
- **域名**：https://keisantool.com
- **用途**：日文计算/换算工具站（税、BMI、年龄、面积、电量、最低工资等 96 工具），浏览器端 Vanilla JS 计算（隐私卖点）
- **北极星**：Google 日本自然搜索 → AdSense
- **目标用户**：日本用户
- **站点语言**：日语（页面，由 AI 生成，Owner 无法校对）；开发沟通用中文
- **GitHub**：`rusherxie-sudo/keisantool`（main，public）

## 技术栈
- Astro 6（纯静态 SSG）+ Vanilla JS（无 TypeScript）+ vitest + marked + `@astrojs/sitemap`
- 包管理器：npm
- 单一数据源：`src/data/tools.js`（categories + tools）
- 计算逻辑 TDD（先测试后实现），测试是唯一正确性保证

## 部署
- Cloudflare Pages（Git 集成，Build `npm run build`，Output `dist`，Node 22）
- GitHub Actions `ci.yml`（npm ci + test + build）；不本地 `wrangler pages deploy`

## 数据依赖
- 无后端/数据库，纯静态

## 页面类型
- 96 个工具页（`src/pages/<slug>/index.astro`）+ `blog/`（56 篇 content collection）+ 程序化页群（saitei 47 县 / umaredoshi 111 年 / seiza-aisho 144 组合 / rokuyo 48 月 / jisa 12 城 / rokusei 12 型 / hinodeiri 15 城 / shukujitsu 5 年）+ 8 分类页 + about/privacy/terms

## SEO 结构
- sitemap-index.xml（真实 lastmod 用 git 提交日）、robots、canonical、JSON-LD（WebApplication）
- 每页 h1/title/description/canonical/JSON-LD/lang=ja + 内链 ≥3

## 权威文档
- `HANDOFF.md`（24063 字滚动状态日志，最新状态看这里）、`CLAUDE.md`（稳定约定/陷阱）、`ONBOARDING.md`（完整交接快照）、`README.md`
- `docs/`：design-brief、seo-growth-30d、superpowers specs

## 当前状态（2026-09-05 复核）
- 构建：571 页；测试 95 文件 / 1718 项全绿；sitemap 426 URL（144 个 seiza-aisho 组合页 noindex 排除）
- 流量：Bing 为绝对主力（77 天 5,976 点击 / 324,059 展示），Google GSC 28 天 294 点击 / 29,089 展示 / CTR 1.01% / 均位 17.74；GA4 30 天 6,085 activeUsers
- 变现断链：ads.txt 已上线（pub-1382715204285550），但页面 AdSense 广告脚本尚未部署（.ad-slot 为空占位），当前广告收入为 0 —— 待 owner 提供 ad unit / 重申请决策
- 2026 最低賃金地方答申 41/47 县确认（剩余 6 县待官方答申）；saniku 育休賃金日額上限已更新至 16,540 円（令和8年8月）

## GA4
- `G-XM8LC5MPHT`
