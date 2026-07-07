# keisantool 完整交接文档

> **面向接手本项目的新 agent / 新会话。** 读完这一份，就能独立开发、部署、避坑。
> 最后核实：**2026-07-07**（所有数字、状态、未提交改动均已当场跑命令验证，非照抄旧文档）。

---

## 0. 三份文档怎么分工（先看这个，别搞混权威源）

本仓有三份 Markdown 说明，职责不同，**内容冲突时以标注日期更新的为准**：

| 文档 | 定位 | 什么时候读/改 |
|------|------|--------------|
| `CLAUDE.md` | **稳定约定**：架构大图、必守规则、已知陷阱。变化慢。 | 每次开工都读；只在"约定本身变了"时改 |
| `HANDOFF.md` | **滚动状态日志**：进度、催收录记录、当天决策流水账。 | 想知道"最近发生了什么"时读；每次实质进展后追加 |
| `ONBOARDING.md`（本文件） | **完整交接快照**：一次读全，新人上手用。 | 接手时通读一遍；大版本变动后整体刷新 |

> ⚠️ 本文件是 2026-07-07 的快照。若你在更晚的日期接手，**先看 `HANDOFF.md` 的最新几条**确认状态没漂移。

---

## 1. 这是什么 / 商业逻辑

- **keisantool.com** —— 日本語の計算・変換ツール大全サイト（日语计算/换算工具集）。
- **变现闭环**：Google 日本自然搜索流入 → 页面停留 → **AdSense** 广告收入。所以一切围绕 **SEO/GEO + 铺量长尾词**。
- **纯静态站**：无后端、无数据库、无用户输入回传。所有计算在**浏览器端 Vanilla JS** 完成（这也是隐私卖点，页面上反复强调「入力内容はサーバーに送信されません」）。
- **语言分工**：Owner 用**中文**沟通、无法读日文；页面上的**日文内容全部由 Claude 生成**（Owner 无法校对）。→ **计算正确性完全依赖测试 + 对照日本权威法规**，这是本项目最核心的约束。

---

## 2. 技术栈 & 命令

| 层 | 选型 |
|----|------|
| 构建 | **Astro** 6.x（静态站点生成 SSG） |
| 计算逻辑 | **Vanilla JS 纯函数**（`src/lib/*.js`），无 TypeScript |
| 测试 | **vitest** 4.x |
| Markdown 工具依赖 | `marked` |
| 站点地图 | `@astrojs/sitemap` |
| 部署 | **Cloudflare Pages**（项目名 `keisantool`），用 `wrangler` CLI |
| 分析 | GA4（`G-XM8LC5MPHT`，已接入 gtag.js） |

**没有** TypeScript / ESLint / Prettier / CI。规范靠约定和测试。

```bash
npm run dev      # 开发服务器（astro dev）
npm run build    # 生产构建 → dist/
npm test         # ⚠️ 见下方「测试陷阱」——当前会虚报数字！
npx vitest run <路径>   # 跑单个测试
```

**部署（Owner 明确要求"改完直接部署，不必每次问"）：**

```bash
npm run build && npx wrangler pages deploy dist --project-name=keisantool --branch=main
```

- ⚠️ **`--branch=main` 绝对不能省**。wrangler 按"当前 git 分支"决定部署到 production 还是 preview 通道。在 worktree（`claude/*` 分支）上省略它，会部署成 **preview 别名**，生产域名 keisantool.com 拿不到新内容、新页 404。（2026-07-03 踩过）
- ⚠️ **本地 git 没有 remote**（`origin` 不存在）。`git push` 会失败。**部署走 wrangler，`git commit` 只是本地留痕。**
- 每次部署会返回一个 `xxxx.keisantool.pages.dev` 预览 URL；生产是 keisantool.com。

---

## 3. 🔴 测试陷阱：`npm test` 当前数字是假的（必修）

**现象**：`npm test` 现在报 **118 个测试文件 / 2865 个测试通过**。这是**错的**。

**真相**：项目**没有 vitest 配置文件**（无 `vitest.config.*`），vitest 用默认 glob 扫全仓 `.test.js`。仓里 `.claude/worktrees/` 下残留着两个旧 worktree 的完整副本：

```
./tests                                                    39 文件  ← 唯一真实的项目测试
./.claude/worktrees/brave-hugle-20c09b/tests               41 文件  ← 残留副本
./.claude/worktrees/cool-visvesvaraya-c8c5c6/tests         38 文件  ← 残留副本
./.claude/worktrees/brave-hugle-20c09b/node_modules/...    25 文件  ← 连 lunar-javascript 的 node_modules 测试都被扫进来
```

**项目真实测试数 = 39 文件 / 943 个全绿**（用下面命令验证）：

```bash
npx vitest run --exclude '**/.claude/**' --exclude '**/node_modules/**'
```

**建议接手后立刻修掉**（二选一，推荐两个都做）：
1. 新建 `vitest.config.js`，`test.include: ['tests/**/*.test.js']`，让 `npm test` 只跑项目测试。
2. 清理残留 worktree：这两个分支已在生产层面合流、且 `brave-hugle` / `cool-visvesvaraya` 已 fast-forward 合并回 `main`（见 §9），worktree 已无用。`git worktree remove` 掉，仓库瘦身。
   - ⚠️ 注意：`brave-hugle-20c09b` 的 worktree HEAD 是 `8221a2a`，**比 main 还新**，且用到了 `lunar-javascript`（历法工具，见 §10「未合并的工作」）——删之前先确认那批代码是否还想要。

---

## 4. 架构大图（读多个文件才懂的部分）

### 4.1 单一数据源：`src/data/tools.js`

导出 `tools`（每项 `slug/nav/name/icon/category/short/live`）+ `categories` + `categoryMeta` + `categoryColors`。
**派生关系**：分类下拉导航、首页卡片、`RelatedTools` 关联链接、8 个分类 hub 页、llms.txt —— **全部从它派生**。
→ **加工具第一步永远是先在这里注册。**

工具函数（同文件）：`getTool(slug)` / `getRelated(slug, count)`（同分类优先）/ `getCategoryMeta` / `getColorBySlug` 等。

### 4.2 页面 = 壳 + 内容

每个 `src/pages/<slug>/index.astro` 用 `src/layouts/ToolLayout.astro` 包裹：

- **ToolLayout 负责**：`<head>` / SEO meta / canonical / JSON-LD（WebApplication）/ **BreadcrumbList 自动注入** / **dateModified 自动注入**（见 §7.2）/ 页头页脚 / 分享按钮。
- **页面 body 结构（惯例顺序）**：`.page-hero`（h1+说明）→ `.calc-card`（计算 UI）→ `.ad-slot` → `.howto`（使い方）→ `<RelatedTools>` → `.ad-slot`。
- **计算逻辑**从 `src/lib/<slug>.js`（纯函数）import；DOM 交互写在页面自己的 `<script>` 里。

### 4.3 两套宽度模式（定义在 `src/styles/global.css`）

| 模式 | 用法 | 谁在用 |
|------|------|--------|
| 默认（窄） | 各区块 `max-width:880px` 居中，自上而下堆叠 | 简单计算器 |
| `wide` 铺宽 | `<ToolLayout … wide>` → 区块 `max-width:none`、`.page-wrapper` 上限 `var(--container)` | 内容多的：markdown / regex / json / color-code / tani / moji / yakudoshi / 首页 |

⚠️ 已**无**"左卡片+右侧栏"两栏 grid（2026-06-25 改版废弃）。工具内部要并排自己在页面 `<style>` 写 grid + 断点（参考 `loan` 的 `.loan-results`）。

### 4.4 组件（`src/components/`）

`SiteHeader`（分类下拉导航，PC hover 展开 / 移动端汉堡手风琴）、`SiteFooter`、`RelatedTools`、`Faq`（FAQPage 结构化数据 + 可视 Q&A）、`ShareButtons`、`ResultShare`、`FloatingShare`（右下角 FAB，移动端优先 `navigator.share`）、`Icon`。

### 4.5 目录结构

```
src/
  data/tools.js              工具元数据【单一数据源】
  layouts/ToolLayout.astro   共通壳（head/SEO/JSON-LD/breadcrumb/dateModified/页头页脚）
  components/                 见 §4.4
  lib/<tool>.js              计算纯函数【TDD 对象】
  lib/lastmod.js             git 最终提交日 → sitemap lastmod + JSON-LD dateModified 共享逻辑
  pages/<slug>/index.astro   各工具页
  pages/<slug>/[param].astro 程序化动态路由页（见 §5）
  pages/category/[slug].astro 分类 hub（8 个，动态路由）
  styles/global.css          全站样式（布局/卡片/导航/宽窄两档）
tests/<tool>.test.js         vitest 测试（39 个）
public/                      robots.txt / sitemap（构建生成）/ llms.txt / og.png / favicon / _headers
```

---

## 5. 程序化页面群（SEO 铺量的核心武器）

本站不止 42 个工具页，还有**大量程序化生成的长尾页**，是流量策略的重点：

| 页群 | 路由 | 数量 | 说明 |
|------|------|------|------|
| 星座相性 144 组 | `seiza-aisho/[pair].astro` | 144 | 12 星座 × 12 星座全组合，`getStaticPaths` 从 lib `allPairs()` 生成 |
| 生まれ年 spoke | `umaredoshi/[year].astro` | 111 | 1900〜2010，每年一页「今年何歳・和暦・干支・厄年・星座・六星」，复用多个 lib |
| 年齢早見表 hub | `nenrei-hayami/` | 1 | 明治元年〜今年大表（SSR + print CSS），对标 nenrei-hayami.net |
| 分类 hub | `category/[slug].astro` | 8 | 每分类一页，含 FAQPage schema |

**全站合计约 311 URL。**

⚠️ **每年 1 月 1 日必须重 build 续命**：`nenrei-hayami` 和 `umaredoshi` 的"今年"是 build 时用 `new Date().getFullYear()` 固定的，跨年不重新构建部署就会算错年龄。

**动态路由三个接线点（加新程序化页群时照抄）**：
① `getStaticPaths` 从 lib 生成路径；② `ToolLayout` 的可选 `breadcrumb` prop 覆盖默认三层面包屑（pair 页传四层）；③ `src/lib/lastmod.js` 的 `sourceFileForUrl` 里加该前缀的分支（否则 sitemap lastmod / dateModified 解析不到源文件）。

---

## 6. 🔴 必守约定（打折扣就会出线上 bug）

1. **计算逻辑走 TDD，无例外**：先写 `tests/<tool>.test.js` → 跑出 **RED** → 再写 `src/lib/<tool>.js`（纯函数、不碰 DOM）→ **GREEN**。**Owner 无法校对计算，测试是唯一的正确性保证。** 涉及日本法规/公式的，测试里挂**外部权威锚点值**（例：loan 的 `91,855` / `9,849,059`），改公式必挂红。
2. **金额端数一律 `Math.floor` 切り捨て**，丢成整数円。
3. **`src/data/tools.js` 是元数据单一数据源**：加工具先注册。
4. **日期用 UTC 正午基准**：参考 `src/lib/shussan.js` 的 `toDate / toISO / addDays`，躲时区/夏令时跨日 bug。
5. **法规/数值每年复核**：日本税制·社保每年 **4 月 / 8 月**改定。改 `kokuho`、`saniku` 前先看 §8 历史坑。
6. **SEO 每页必备**（多由 ToolLayout + frontmatter 提供）：唯一 `<h1>`、`<title>`、`<meta description>`、`<link canonical>`、JSON-LD（WebApplication）、`<html lang="ja">`、内部链接 ≥3（RelatedTools 自动）、免责事项日文原文「計算結果はあくまで参考値です」。
7. **广告**：`.ad-slot` 放结果区直下 + 页面下部；**禁止**弹窗/插屏。

### 新工具标准流程（6 步）

1. `src/data/tools.js` 注册元数据 →
2. 写 `tests/<tool>.test.js`（RED）→
3. 写 `src/lib/<tool>.js`（GREEN）→
4. 建 `src/pages/<slug>/index.astro`（仿 `zeizei`/`wariai`/`moji`，SEO frontmatter 齐全，专属样式写**页面内 `<style>`**，别动 global.css；内容多传 `wide`）→
5. `npm run build` + 浏览器多尺寸验证 **1920 / 1440 / 768 / 375**（横向溢出/铺宽异常只在极端尺寸暴露）→
6. wrangler 部署（记得 `--branch=main`）。

---

## 7. SEO / GEO 现状

### 7.1 传统 SEO —— 已扎实

全 50 页中 49 页有 FAQPage 结构化数据 + 可视 Q&A；完全静态 HTML（无 JS 渲染依赖）；robots.txt 全 UA `Allow: /`；分类 hub + 面包屑 + 关联内链齐全。

### 7.2 GEO（面向 AI 搜索引擎）—— 2026-07-04 做过审计，报告见 `GEO-AUDIT-REPORT.md`

**总分 51/100**。骨架强（结构化数据/静态 HTML/爬虫全放行），短板是**匿名运营**（无运营者/著者实体信息）和**零外部品牌提及**。

审计后**已落地的修复**（部分仍在**未提交状态**，见 §9）：
- ✅ 新建 `public/llms.txt`（反映全分类全工具）。
- ✅ `src/lib/lastmod.js`：从 git 最终提交日算"页面真实更新日"，**同时**供 sitemap 的 lastmod 和各页 JSON-LD 的 `dateModified`（AI 爬虫读新鲜度）。
- ✅ 首页加 `Organization` JSON-LD（`sameAs` 暂空，将来开 X 等外部账号再补）。
- ✅ 星座相性 144 组页补 FAQ（3 问）。

**仍未做**（GEO 报告里的中优先级）：运营者实体信息、YMYL 页（kokuho/zeizei）的出典/更新日显式标注、howto 首句改成"一言定义文"（便于 AI 摘录）、外部平台品牌提及。

---

## 8. 🔴 计算正确性——已踩过的坑（改这些 lib 前必读）

| lib | 坑 |
|-----|----|
| `kokuho.js` | 給与所得控除必须用**令和7改正表**（最低控除 65 万、适用到年收 190 万）。旧令和6表(55万)会**高估**保险料——这是修过的**线上真 bug**。 |
| `saniku.js` | 已含 2025 年 4 月新制「出生後休業支援給付金 +13%」；育休給付金賃金日額上限 **16,110 円（令和7年8月值）**，**每年 8 月需更新**。 |
| `jisa.js` | DST：`getOffsetMinutes/convertWallClock` 用 `toLocaleString` 两次相减，夏令时自动正确（已实测东京 vs 纽约夏令时 +13h）。 |
| `calorie.js` | 默认「国立健康・栄養研究所式(Ganpule)」，HB 式可切换。 |
| `loan.js` | 0% 金利分支直接 `{total:P, interest:0}`，其余 `Math.max(0,…)`（曾出现负总利息）。 |
| `password.js` | 用 `crypto.getRandomValues`，**禁用 `Math.random`**（测试里有契约测试断言不得调用 Math.random）+ 各文字種保証 + Fisher-Yates。 |
| `pet-age.js` | ≥1 歳分支要 `floor`。 |
| `seiri.js` | 周期限 15〜60 日。 |
| 相性系列口径 | 占い相性没唯一正解、流派互相矛盾 → 六星部分**不建星同士表**，用「相手生年年支落在自分12ゾーン哪格」的地運方式（复用 `fortuneZone`）；数秘術45对表 / 血液型10对表是"本站判定基准"，**整表在测试里字面量锚定**；页面公开判定基准 + 注明流派差。**全站禁用「MBTI」字样**（日本 MBTI 協会商标），未来用「16タイプ」。 |

**选品规矩（YMYL 词教训）**：kokuho 排名第 12 位 0 点击——匿名站在金钱词有天花板。**做 YMYL 词前先查 SERP 现任者，只做"匿名工具站已在首页存活"的词。**

### lib 命名例外

文件统一 kebab-case，**唯独 `src/lib/koteiShisan.js` 是 camelCase**（页面 `/kotei-shisan/`、测试 `tests/kotei-shisan.test.js`）。别改。

---

## 9. 🟡 当前工作区状态（未提交改动——接手第一件事：决定 commit 还是丢弃）

`git status` 有 4 处改动 + 4 个新文件，**都是 GEO 审计后的修复，尚未 commit、尚未部署**：

| 状态 | 文件 | 内容 |
|------|------|------|
| M | `astro.config.mjs` | 把 lastmod 逻辑抽到 `src/lib/lastmod.js`（-52 行瘦身） |
| M | `src/layouts/ToolLayout.astro` | 注入 `dateModified` JSON-LD（用 `process.cwd()` 定位源文件，因为 Astro 打包后 `import.meta.url` 指不到 src/pages） |
| M | `src/pages/index.astro` | 加 `Organization` JSON-LD |
| M | `src/pages/seiza-aisho/[pair].astro` | 144 组页补 FAQ |
| ?? | `src/lib/lastmod.js` | 新：git 最终提交日共享逻辑 |
| ?? | `tests/lastmod.test.js` | 新：lastmod 测试 |
| ?? | `public/llms.txt` | 新：LLM 索引文件 |
| ?? | `GEO-AUDIT-REPORT.md` | 新：GEO 审计报告 |

→ **建议**：这些是完整、有测试、有意义的一批 GEO 修复。**跑一遍真实测试（§3 命令）确认全绿后 commit + 部署**。commit 信息可参考仓库既有风格（`feat(geo): …`）。

### git 分支现状

- 主分支 `main`，HEAD `3a2ce86`。
- 两个并行 worktree（`brave-hugle-20c09b`、`cool-visvesvaraya-c8c5c6`）此前是并行开发的两组功能，**已 fast-forward 合并回 main**（2026-07-04）。
- ⚠️ **并行 worktree 部署会互相全量覆盖生产**（2026-07-03 互顶过）。若将来再开并行 worktree：**部署前先互相 merge，再带 `--branch=main` 部署。**

---

## 10. 🟡 未合并/未上线的工作 & 待办

### 可能未合并的历法工具（需确认）

`.claude/worktrees/brave-hugle-20c09b`（HEAD `8221a2a`，**比 main 新**）里用到了 `lunar-javascript` 依赖，做了一批**历法工具**（旧暦/六曜/二十四節気之类，记忆里 2026-07-04 一次性做齐 5 个）。**这批代码目前不在 main 的 `src/` 里，也不在 package.json 依赖里**。接手时**先确认这批是否还要**：要就 merge + 装依赖 + 部署；不要就连 worktree 一起清掉。

### 收录 / IndexNow

- **GSC 催收录**用 `gsc-request-indexing` skill（Claude in Chrome 网页操作），每日配额约 10 条。历史催收录记录在 `HANDOFF.md`。
- **IndexNow**（给 Bing/其他引擎）：key 在 `public/`，提交脚本 `.claude/worktrees/brave-hugle-20c09b/scripts/indexnow-submit.py`（**注意脚本在 worktree 里，合并历法工具时一并处理**）。因 Bing 几乎零收录而在 2026-07-04 配置，**每次部署后记得跑一遍**。

### AdSense —— **P0 商业目标，尚未接入**

无 `ca-pub` 代码、无 `ads.txt`。2026-07-04 复核结论：站点上线约 3 周，多数页排名 20-40 名/零点击，仅 rokusei（占全站点击 2/3）有实质流量。**建议再观察 2-3 周积累点击后申请，或现在先试投一轮（被拒不扣分，可对症重投）。**

### 选品调研（Semrush，JP 市场）

- Semrush **MCP 已移除**（API 额度耗尽），统一走 `semrush-chrome` skill 经 `sem.3ue.co`（GURU 代理）Chrome 自动化，数据库选 JP。
- 结论：高价值词（年齢計算 12 万 / カラーコード 40 万）已做；开发者工具（Base64/JSON/正規表現）变现低（程序员开广告拦截），属铺量别期待 RPM；単位変換 CPC≈0；`シルエットクイズ` 暂缓（IP 风险 + 偏离定位）。

---

## 11. 全工具清单（42 个注册工具，按分类）

> 权威源永远是 `src/data/tools.js`。下表是 2026-07-07 快照，便于速览。分类共 8 个：税金・お金 / 健康・身体 / 生活・日常 / 占い・文化 / 文字ツール / 変換・ツール / 開発者ツール / ペット・動物。

| 分类 | slug | 工具 |
|------|------|------|
| 税金・お金 | zeizei | 消費税・割引（複数商品合算） |
| 税金・お金 | kotei-shisan | 固定資産税（土地/家屋分离+新築減額） |
| 税金・お金 | kokuho | 国民健康保険料（令和7改正表） |
| 税金・お金 | wariai | 割合・パーセント・比率 |
| 税金・お金 | loan | 住宅ローン返済（元利/元金均等） |
| 税金・お金 | fukuri | 複利・積立シミュレーター |
| 健康・身体 | bmi | BMI・体脂肪率 |
| 健康・身体 | calorie | カロリー・基礎代謝（Ganpule/HB 可切） |
| 健康・身体 | seiri | 排卵日・生理日（周期 15〜60 日） |
| 生活・日常 | hensachi | 偏差値（从分数列表自动算 SD） |
| 生活・日常 | shussan | 出産予定日（逆算+妊娠月数） |
| 生活・日常 | yakudoshi | 厄年チェッカー（和暦早見表 SSR） |
| 生活・日常 | kyuyo | 給与・時給・残業代 |
| 生活・日常 | jisa | 時差計算（DST 正确） |
| 生活・日常 | gasoline | ガソリン代（割り勘） |
| 生活・日常 | saniku | 産休・育休（2025 新制 +13%） |
| 生活・日常 | nenrei | 年齢計算（満/数え/学年/干支） |
| 生活・日常 | nissu | 日数計算・日付計算 |
| 生活・日常 | nenrei-hayami | 年齢早見表（+ umaredoshi 111 spoke 页） |
| 占い・文化 | rokusei | 六星占術・大殺界（全站流量占比最高） |
| 占い・文化 | seiza | 星座調べ |
| 占い・文化 | tanjobi-aisho | 誕生日相性（数秘術+六星地運） |
| 占い・文化 | seiza-aisho | 星座相性 hub + **144 程序化页** |
| 占い・文化 | ketsueki-aisho | 血液型相性（10 无序对判定表） |
| 文字ツール | moji | 全角半角・かな・文字数カウント |
| 変換・ツール | color-code | カラーコード（HEX/RGB/HSL+取色器+抵抗） |
| 変換・ツール | tani | 単位変換（長さ/重さ/面積/体積/温度/速さ） |
| 変換・ツール | wareki | 和暦・西暦（改元边界精确） |
| 開発者ツール | base64 | Base64（UTF-8 安全） |
| 開発者ツール | json | JSON 整形・圧縮 |
| 開発者ツール | urlencode | URL エンコード/デコード |
| 開発者ツール | regex | 正規表現テスト |
| 開発者ツール | markdown | Markdown → HTML（marked） |
| 開発者ツール | password | パスワード生成（crypto） |
| ペット・動物 | inu-nenrei / neko-nenrei | 犬猫年齢人間換算（環境省式） |
| ペット・動物 | inu-gohan / neko-gohan | ごはん量（RER=70×kg^0.75×係数） |
| ペット・動物 | inu-ninshin / neko-ninshin | 妊娠期間（犬 63 日/猫 65 日） |
| ペット・動物 | inu-vaccine / neko-vaccine | ワクチンスケジュール（WSAVA・狂犬病予防法） |

> `hensachi`（偏差値）在**生活・日常**（2026-07 从健康・身体移出）。

---

## 12. Astro 特有陷阱（改样式/动态内容时会踩）

- **Astro scoped `<style>` 不作用于 `innerHTML` 注入的节点**。动态生成内容（markdown 预览 `#md-preview`、regex 匹配 `#re-matches`）的样式必须写进 `<style is:global>` 并用页面唯一 id 前缀，否则不生效（Astro 只给静态元素加 `data-astro-cid`）。
- **隐藏的 radio 必须限宽 `width:1px`**：`.radio-group input[type=radio]` 否则继承 `.form-group input{width:100%}` + `position:absolute` → 撑成视口宽 → 桌面横向滚动条。
- **导航/首页不按 `live` 过滤**（全量渲染）。当前全 `live:true`；要真隐藏某工具得自己加过滤逻辑。
- **Astro 打包后 `import.meta.url` 指不到 `src/pages`**（`.astro` 被 bundle 到 `dist/.prerender/chunks/`）。需要项目根路径时用 `process.cwd()`（见 ToolLayout 的 dateModified 实现）。

---

## 13. 上手第一天建议动作清单

1. `npx vitest run --exclude '**/.claude/**' --exclude '**/node_modules/**'` —— 确认真实 943 测试全绿。
2. 读 `CLAUDE.md` + `HANDOFF.md` 最近几条，确认状态没漂移。
3. 决定 §9 未提交的 GEO 修复：**跑测试 → commit → 部署**（大概率就该这么做）。
4. 修 §3 测试陷阱：加 `vitest.config.js` 限定 `tests/`，并清理/确认残留 worktree（连带 §10 历法工具的去留决策）。
5. 部署验证：`npm run build && npx wrangler pages deploy dist --project-name=keisantool --branch=main`，然后浏览器多尺寸自查。

---

## 14. 详情指路（不在本文重复）

- 设计样板（首个工具完整设计流程）→ `docs/superpowers/specs/2026-06-14-zeizei-calculator-design.md`
- 相性系列设计 → `docs/superpowers/specs/2026-07-03-aisho-series-design.md`
- GEO 审计详情 → `GEO-AUDIT-REPORT.md`
- 上游建站调研（SEO 策略/选型）→ `/Users/jww/5kong/find/建站文档_日本計算ツールサイト.md`
- 催收录/滚动进展流水 → `HANDOFF.md`
