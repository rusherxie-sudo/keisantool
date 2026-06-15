# CLAUDE.md

> 这是给 Claude 看的"干活规则"，只放**稳定的约定与陷阱**。
> 会变的东西（当前进度、全工具清单、待办）一律去看 `HANDOFF.md`，不在这里重复。

## 1. 这是什么

- **keisantool.com**：日本語の計算・変換ツールサイト。靠 Google 日本自然搜索流入，用 AdSense 变现。
- 纯静态站：**Astro** 构建 → **Cloudflare Pages** 部署。计算逻辑是 Vanilla JS 纯函数（`src/lib/`），用 **vitest** 测试。
- **和 Owner 沟通、写文档一律用中文**；页面里的日文内容由 Claude 生成（Owner 不懂日文、无法校对）。
- 👉 当前状态 / 全 24 工具清单 / 待办 / 历史坑，都看 **`HANDOFF.md`**。

## 2. 命令

```bash
npm test                              # 全量测试（vitest run）
npx vitest run tests/<tool>.test.js   # 只跑单个工具
npm run dev                           # 开发服务器
npm run build                         # 生产构建 → dist/
```

部署（Owner 要求"改完直接部署，不必每次问"）：

```bash
npm run build
npx wrangler pages deploy dist --project-name=keisantool
```

- ⚠️ 本地 git **没有 remote**（`origin` 不存在），`git push` 会失败。部署走 wrangler，`git commit` 只是本地留痕。

## 3. 必守约定（重点，别打折扣）

- **计算逻辑用 TDD**：先写 `tests/<tool>.test.js` → 跑出 RED → 再写 `src/lib/<tool>.js` → GREEN。Owner 无法校对计算，**测试是唯一的正确性保证**。计算函数必须是纯函数（不依赖 DOM）。
- **金额端数一律 `Math.floor` 切り捨て**，丢成整数円。
- **`src/data/tools.js` 是工具元数据的单一数据源**：新增工具**先在这里注册**（字段 `slug / nav / name / icon / category / short / live`）。导航、首页卡片、关联链接全部引用它。
- **日期用 UTC 正午基准**：参考 `src/lib/shussan.js` 的 `toDate / toISO / addDays`，避免时区 / 夏令时跨日 bug。
- **法规和数值每年要复核**：日本税制·社保每年 4月 / 8月 改定。改 `kokuho`、`saniku` 这类工具前，**先看 `HANDOFF.md` §8 的历史坑**（令和7改正表、产休育休 2025 新制等）。

## 4. SEO（每页必须）

- 唯一 `<h1>`、`<title>`、`<meta name="description">`、`<link rel="canonical">`、JSON-LD（WebApplication）、`<html lang="ja">`。
- 每页内部链接 ≥3（由 `RelatedTools` 组件自动生成）。
- 免责事项必挂：`計算結果はあくまで参考値です`（日文原文，不要翻译）。
- 以上大多由 `ToolLayout.astro` + 各页 frontmatter 统一提供。

## 5. 广告（AdSense）

- `.ad-slot` 放在**结果区直下** + **页面下部**。
- 禁止弹窗 / 插屏广告。

## 6. 新工具标准流程（6 步）

1. 在 `src/data/tools.js` 注册元数据。
2. 写 `tests/<tool>.test.js` → `npm test` 确认 **RED**。
3. 写 `src/lib/<tool>.js` → `npm test` 确认 **GREEN**。
4. 建 `src/pages/<slug>/index.astro`：仿 `zeizei` / `wariai` / `moji` 的结构，SEO frontmatter 齐全；**样式写在页面内 `<style>` 里，不要动 `global.css`**。
5. `npm run build` + 浏览器**多尺寸**验证（1440 / 1280 / 768 / 375）。
6. wrangler 部署。

## 7. 关键文件 & 命名约定

- `src/layouts/ToolLayout.astro` — 全页共通模板（head / SEO / JSON-LD / header / footer / ShareButtons / FloatingShare）。支持 `wide` prop 切换宽布局。
- `src/components/` — `SiteHeader`(分类下拉导航) / `SiteFooter` / `RelatedTools`(关联链接) / `ShareButtons` / `FloatingShare`(右下角 FAB 浮动分享)。
- `src/data/tools.js` — 单一数据源，含 `categories` 与 `tools`。
- `src/lib/<tool>.js` — 计算纯函数（TDD 对象）。
- `src/styles/global.css` — 全站样式，含 PC ≥1024px 的两栏布局（**当前待优化项，详见 `HANDOFF.md` §6**）。
- ⚠️ **命名例外**：lib 文件统一 kebab-case，唯独 `src/lib/koteiShisan.js` 是 **camelCase**（页面却是 `/kotei-shisan/`）——别被它绊到。
- ⚠️ 导航和首页**不按 `live` 过滤**（全量渲染）。当前 24 个工具全是 `live:true`；若想用 `live` 真正隐藏某工具，得自己补过滤逻辑。

## 8. 详情指路（不在这里重复，统一去看）

- 当前状态 / 全 24 工具清单 → `HANDOFF.md` §3、§5
- 最优先待办（PC 桌面布局拥挤）→ `HANDOFF.md` §6
- 历史决策 & 已踩的坑（国保令和7改正表 / 产休育休2025新制 / 时差DST / `live` flag / calorie 公式）→ `HANDOFF.md` §8
- 设计样板（首个工具的完整设计流程）→ `docs/superpowers/specs/2026-06-14-zeizei-calculator-design.md`
- 上游建站调研（SEO 策略 / 选型）→ `/Users/jww/5kong/find/建站文档_日本計算ツールサイト.md`
