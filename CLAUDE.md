# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

> 只放**稳定的约定、架构与陷阱**。会变的状态（进度、全工具清单、待办）看 `HANDOFF.md`，不在这里重复。
> 和 Owner 沟通、写文档**一律用中文**；页面里的日文内容由 Claude 生成（Owner 不懂日文、无法校对）。

## 这是什么

- **keisantool.com** — 日本語の計算・変換ツール集。靠 Google 日本自然搜索流入，用 AdSense 变现。
- 纯静态站：**Astro** 构建 → **Cloudflare Pages** 部署。计算逻辑是 Vanilla JS 纯函数（`src/lib/`），用 **vitest** 测试。无 TypeScript、无 ESLint/Prettier。
- 👉 当前状态 / 全工具清单 / 历史坑，都看 **`HANDOFF.md`**。

## 命令

```bash
npm test                              # 全量测试（vitest run）
npx vitest run tests/<tool>.test.js   # 只跑单个工具
npm run dev                           # 开发服务器
npm run build                         # 生产构建 → dist/
```

部署（Owner 要求"改完直接部署，不必每次问"）：

```bash
npm run build && npx wrangler pages deploy dist --project-name=keisantool --branch=main
```

- ⚠️ **`--branch=main` 不能省**：wrangler 按当前 git 分支决定通道，在 worktree（`claude/*` 分支）上省略会部署成 **preview 别名**，生产域名拿不到新内容、新页 404（2026-07-03 已踩）。
- ⚠️ 本地 git **没有 remote**（`origin` 不存在），`git push` 会失败。部署走 wrangler，`git commit` 只是本地留痕。
- 部署后顺手跑 `python3 scripts/indexnow-submit.py` 催 Bing/Yandex 等收录（IndexNow，key 文件在 `public/`，别删）。新增页多时最有必要，见 `HANDOFF.md` §2。

## 架构大图（需读多个文件才懂的部分）

**单一数据源**：`src/data/tools.js` 导出 `categories` + `tools`（字段 `slug/nav/name/icon/category/short/live`）。分类下拉导航、首页卡片、`RelatedTools` 关联链接**全部从它派生**——所以加工具必须先在这里注册。

**页面 = 壳 + 内容**：每个 `src/pages/<slug>/index.astro` 用 `src/layouts/ToolLayout.astro` 包裹。ToolLayout 负责 `<head>`/SEO/JSON-LD/页头页脚/分享按钮；页面 body 一般是 `.page-hero`(h1+说明) → `.calc-card`(计算 UI) → `.ad-slot` → `.howto`(使い方) → `<RelatedTools>` → `.ad-slot`。计算逻辑从 `src/lib/<slug>.js`（纯函数）import，DOM 交互写在页面自己的 `<script>`。

**两套宽度模式（改版后统一为「单栏居中」，定义在 `src/styles/global.css`）**：
- **默认（窄）**：`.calc-card` / `.ad-slot` / `.howto` / `.related` 各区块统一 `max-width:880px` 居中，自上而下堆叠（计算卡 → 广告 → 说明 → 关联）。`.page-wrapper` 上限 1040px。简单计算器用这套。
- **`wide` 铺宽**：内容多的工具（编辑器型 / 多内栏 / 宽表格）给 `<ToolLayout … wide>` → 各区块 `max-width:none`、`.page-wrapper` 上限 `var(--container)`，计算卡铺满宽度。当前用 wide 的：markdown / regex / json / color-code / tani / moji / yakudoshi。
- ⚠️ 已无"左卡片+右侧栏"的两栏 grid（改版前的旧结构，连同 `grid-auto-flow:dense` 一并废弃）。工具内部若要并排（如结果对比），自己在页面 `<style>` 里写 grid + 断点（参考 `loan` 的 `.loan-results`）。
- **卡片内边距**：内容放进 `.calc-panel`（带 24px 内边距，带 tab 的工具用），或不放 panel 时由 `.calc-card:not(:has(.calc-panel)){padding:24px}` 兜底。别让内容直接贴卡片边框。

## 必守约定（别打折扣）

- **计算逻辑走 TDD**：先写 `tests/<tool>.test.js` → 跑出 RED → 再写 `src/lib/<tool>.js`（纯函数、不依赖 DOM）→ GREEN。Owner 无法校对计算，**测试是唯一的正确性保证**。
- **金额端数一律 `Math.floor` 切り捨て**，丢成整数円。
- **`src/data/tools.js` 是工具元数据单一数据源**（见上「架构大图」）。
- **日期用 UTC 正午基准**：参考 `src/lib/shussan.js` 的 `toDate / toISO / addDays`，避免时区 / 夏令时跨日 bug。
- **法规和数值每年复核**：日本税制·社保每年 4月 / 8月 改定。改 `kokuho`、`saniku` 这类前，**先看 `HANDOFF.md` §8 的历史坑**。

## SEO（每页必须，多由 ToolLayout + 各页 frontmatter 提供）

- 唯一 `<h1>`、`<title>`、`<meta name="description">`、`<link rel="canonical">`、JSON-LD（WebApplication）、`<html lang="ja">`。
- 每页内部链接 ≥3（`RelatedTools` 自动生成）。
- 免责事项必挂日文原文：`計算結果はあくまで参考値です`。

## 广告（AdSense）

- `.ad-slot` 放在结果区直下 + 页面下部；禁止弹窗 / 插屏。

## 新工具标准流程（6 步）

1. 在 `src/data/tools.js` 注册元数据。
2. 写 `tests/<tool>.test.js` → 确认 **RED**。
3. 写 `src/lib/<tool>.js` → 确认 **GREEN**。
4. 建 `src/pages/<slug>/index.astro`：仿 `zeizei`/`wariai`/`moji`，SEO frontmatter 齐全。**工具专属样式写页面内 `<style>`**；只有全站级布局/卡片/导航才动 `global.css`。内容多就传 `wide`（见「架构大图」）。
5. `npm run build` + 浏览器多尺寸验证 **1920 / 1440 / 768 / 375**（务必测超宽屏和 375，横向溢出/铺宽异常只在极端尺寸暴露）。
6. wrangler 部署。

## 陷阱（已踩过，别重犯）

- **lib 命名例外**：文件统一 kebab-case，唯独 `src/lib/koteiShisan.js` 是 **camelCase**（页面是 `/kotei-shisan/`、测试是 `tests/kotei-shisan.test.js`）。
- **Astro scoped `<style>` 不作用于 `innerHTML` 注入的节点**：动态生成的内容（如 markdown 预览 `#md-preview`、regex 匹配 `#re-matches`）样式必须写进 `<style is:global>` 并用页面唯一 id 前缀，否则不生效（Astro 只给静态元素加 `data-astro-cid`）。
- **隐藏的 radio 必须限宽 `width:1px`**：`.radio-group input[type=radio]` 否则继承 `.form-group input{width:100%}` 又是 `position:absolute`，会撑成视口宽 → 桌面横向滚动条。
- **导航/首页不按 `live` 过滤**（全量渲染）；当前全 `live:true`，要真隐藏某工具得自己加过滤逻辑。

## 详情指路（不在这里重复）

- 当前状态 / 全工具清单 → `HANDOFF.md` §3、§5
- 历史决策 & 已踩的坑（国保令和7改正表 / 产休育休2025新制 / 时差DST / calorie 公式）→ `HANDOFF.md` §8
- 设计样板（首个工具的完整设计流程）→ `docs/superpowers/specs/2026-06-14-zeizei-calculator-design.md`
- 上游建站调研（SEO 策略 / 选型）→ `/Users/jww/5kong/find/建站文档_日本計算ツールサイト.md`
