# 工具页移动优先改造 — 实现规约（v1，2026-06-18）

> 给批量改造子代理的统一标准。目标：把指定工具页改成「方案1 Clear Pocket Calculator + 移动优先」成品，与样板一致。
> 参考样板：`src/pages/zeizei/index.astro`（简单型）、`src/pages/color-code/index.astro`（复杂型）、组件 `src/components/ResultShare.astro`。

## 必做项（逐页）

### 1. 接入结果分享模块 ResultShare
- frontmatter（`---` 区）加：`import ResultShare from '../../components/ResultShare.astro';`
- 在主计算卡 `.calc-card`（或主结果容器）**之后**、紧跟的第一个 `<div class="ad-slot"></div>` **之前**，插入一行 `<ResultShare />`。
- 页面 `<script>` 里，在「结果计算完成并显示」处调用 `window.setResultShare?.(summary)`；结果无效/为0/清空时调 `window.hideResultShare?.()`；若有 tab / segmented 切换，切换处也调 `window.hideResultShare?.()`。
- summary 格式：第 1 行工具名，后续 2–4 行「ラベル：値」。**从 DOM 已算好的结果元素读 textContent 拼接，不要自己重算**。模式参考：
  - zeizei：`消費税・割引計算器\n税込価格：¥1,100\n税抜価格：¥1,000\n消費税：¥100`
  - color-code：`カラーコード変換\nHEX：#1e3a5f\nRGB：rgb(30, 58, 95)\nHSL：hsl(212, 52%, 25%)`

### 2. 令牌化页内 `<style>`（去掉所有硬编码旧色）
- 文字：`#333/#555/#666`→`var(--text-3)`；`#777/#888`→`var(--text-muted)`；`#999/#aaa`→`var(--text-faint)`
- 边框：`#ccc/#ddd/#e2e2e2/#eee`→`var(--border-input)` 或 `var(--border-2)`
- 背景：`#fff`→`var(--surface)`；`#fafafa/#f5f5f5/#f7f7f7/#f0f0f0`→`var(--surface-sub)`；暖色块（`#f2e3c7` 等）→中性/`var(--cat-tint)`
- 主色/链接 `#2563eb` 等→`var(--cat-color)`；红 `#d33/#e00/#dc2626`→`var(--danger)`；绿→`var(--success)`
- 浅色「结果/提示」底→`var(--cat-tint)`；圆角用 `var(--r-md)/--r-lg/--r-xl)`

### 3. innerHTML 动态节点（关键陷阱，务必检查）
- 若 script 用 `innerHTML` / `createElement` 动态生成带 class 的节点（动态行、卡片列表、匹配高亮、表格行等），其 CSS **必须**写进 `<style is:global>` 并加**页面唯一 id 前缀**（如 `#panel-xxx .yyy` / `#result-list .zzz`），否则 Astro scoped 样式对动态节点完全不生效（会裸奔成浏览器默认控件）。参考 zeizei 的 `#panel-multi`。

### 4. 移动优先校验
- 输入框/按钮/select 最小高度约 44–56px，拇指易点。
- 原生 select 若默认箭头难看，用 `appearance:none` + 自定义 svg 箭头（抄 zeizei `.m-rate` 的 data-uri）。
- 宽表格放横滚容器（已有 `.data-table-scroll`）；多列网格在窄屏（`max-width:560px`/`680px`）降为 1 列。
- 结果主数字是计算卡内最强视觉。

## 铁律（绝对不碰）
- **不改** `src/lib/*.js`、不改任何计算逻辑/公式/端数（金额一律 floor 切り捨て，已实现，别动）。
- **保留所有 DOM id 和 class 选择器**——页面 `<script>` 依赖；改名会断功能。新增的 class 才自由命名。
- 不动 `.ad-slot`（已全站清空，CSS 自动隐藏）。
- 不改 SEO frontmatter（title/description/jsonld/canonical）、不删 RelatedTools/Faq/免责（`計算結果はあくまで参考値です`）。
- 本轮 **PC 布局维持现状**，以移动优先为主，别大改 PC。
- **不要自己跑 `npm run build`**（多代理并行会互相覆盖 dist）；只保证编辑正确、import 路径对、令牌名拼写对、id 未动。

## 输出
每页回报一句话：接入的 setResultShare summary 内容 + 令牌化/is:global 改了哪些点 + 有无风险。
