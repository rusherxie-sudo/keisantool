# 设计文档：消費税・割引計算器（样板页）

> 日期：2026-06-14
> 范围：日本计算工具站的**第 1 个样板页** `/zeizei/`，跑通 `TDD → Astro 模板 → SEO` 全流程，作为后续 11 个工具页的复用模板。
> 上游：`/Users/jww/5kong/find/建站文档_日本計算ツールサイト.md`（已完成 SEO 调研/策略/技术选型）

## 1. 目标与约束

- **北极星**：从 Google 日本自然搜索拿流量，AdSense 变现。
- **Owner 约束**：不懂日语、不懂代码、唯一资源是 Claude → 计算正确性必须由测试保证（无法人工校对）。
- **目标关键词**：税込計算(40,500)、税抜き計算(49,500)、割引計算(60,500, CPC=$4.07)。

## 2. 技术选型（已定）

- **Astro**（静态站点生成器）：Layout/组件写一次，输出纯静态 HTML，SEO/CWV 与手写等价；加新工具改一处、内链自动一致。
- 计算逻辑为**纯 JS 函数**，与 DOM 解耦 → 可单测（vitest）。
- 部署：Cloudflare Pages（git 自动构建，后续配置）。
- 排除 SPA（React/Vue/Next SSR）：CSR 伤 SEO/CWV，与北极星冲突。

## 3. 项目结构

```
keisantool/
├─ src/
│  ├─ layouts/ToolLayout.astro      核心模板：<head> SEO meta、JSON-LD、header、AdSense 占位、footer 免责
│  ├─ components/
│  │  ├─ SiteHeader.astro           导航（读 tools.js）
│  │  ├─ SiteFooter.astro
│  │  └─ RelatedTools.astro         内链区块（读 tools.js，自动一致）
│  ├─ data/tools.js                 12 工具元数据（单一数据源：名称/路径/图标/分类/关键词）
│  ├─ lib/zeizei.js                 纯计算函数（TDD 对象）
│  ├─ pages/zeizei/index.astro      本次样板页
│  └─ styles/global.css             复用已写样式
├─ tests/zeizei.test.js             vitest，先写后实现
├─ public/robots.txt
├─ astro.config.mjs / package.json / CLAUDE.md
```

**关键设计点**：`tools.js` 是单一数据源——导航、内链、（未来）首页卡片全读它。

## 4. 计算逻辑（lib/zeizei.js）

三个纯函数，无 DOM、无副作用。**所有金额结果按「切り捨て」（向下取整 `Math.floor`）到整数円**（日本零售最常见，howto 注明可能与商家取整有出入）。

| 函数 | 输入 | 输出 | 取整规则 |
|------|------|------|---------|
| `taxIncluded(net, rate)` | 税抜额, 税率(0.1/0.08) | `{tax, total}` | `tax = floor(net*rate)`，`total = net + tax` |
| `taxExcluded(gross, rate)` | 税込额, 税率 | `{net, tax}` | `net = floor(gross/(1+rate))`，`tax = gross - net` |
| `discount(price, percent)` | 定价, 割引率(%) | `{discounted, saved}` | `saved = floor(price*percent/100)`，`discounted = price - saved` |

**输入容错**：非数字 / 空 / 负数 → 返回全 0（或 null），页面不显示结果。

### TDD 测试用例（tests/zeizei.test.js）

- `taxIncluded(1000, 0.1)` → `{tax:100, total:1100}`
- `taxIncluded(1000, 0.08)` → `{tax:80, total:1080}`（軽減税率）
- `taxIncluded(198, 0.1)` → `{tax:19, total:217}`（取整：19.8→19）
- `taxExcluded(1100, 0.1)` → `{net:1000, tax:100}`
- `taxExcluded(1080, 0.08)` → `{net:1000, tax:80}`
- `discount(1000, 30)` → `{discounted:700, saved:300}`
- `discount(1000, 33)` → `{saved:330, discounted:670}`
- 边界：`taxIncluded(0, 0.1)` → `{tax:0, total:0}`；非数字/负数 → 全 0

## 5. 页面交互（pages/zeizei/index.astro）

- 3 个 tab：`税込計算 / 税抜計算 / 割引計算`（套 `.calc-tabs` / `.calc-panel`）。
- 输入框 48px；模式 A/B 带税率单选（10% / 8%）。
- **oninput 即时计算，无按钮**；结果用 `.result-box`（slideIn 动画）。
- 页面 `<script>` 引入 `lib/zeizei.js`，只负责取值→调函数→渲染。

## 6. SEO（套文档每页清单）

- `<title>`：消費税・割引計算器 - 税込・税抜・割引後の価格を瞬時に計算
- `<meta description>`：含 税込/税抜/割引 关键词，70–120 字。
- 唯一 `<h1>`、`<html lang="ja">`、canonical、JSON-LD（WebApplication）。
- 内链：底部 RelatedTools 列 ≥3 个其他工具。
- 免责：「数値はあくまで参考値です」。
- 使い方 section ≥200 字（含取整说明、軽減税率说明）。

## 7. 验收标准

- [ ] `npx vitest run` 全绿，每个测试都曾先失败（TDD）。
- [ ] `npm run build` 成功，输出纯静态 HTML。
- [ ] 页面三模式交互正确，oninput 即时出结果。
- [ ] SEO 清单全部满足（title/desc/h1/canonical/JSON-LD/内链/免责）。

## 8. 不在本次范围（YAGNI）

- 首页、其余 11 个工具页（本次只留 tools.js 接口与可复用模板）。
- 取整方式用户可选（已定默认切り捨て）。
- 真实 AdSense 代码（先占位）。
- Cloudflare 部署（样板确认后再做）。
