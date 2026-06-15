# keisantool 交接文档

> 面向接手的新会话。读完这份 + `CLAUDE.md` 即可上手。最后更新：2026-06-15。

## 1. 这是什么

- **keisantool.com**：日本語の計算・変換ツール大全サイト。
- 目标：Google 日本自然搜索流入 → AdSense 变现。
- 纯静态站：**Astro** 构建 → **Cloudflare Pages** 部署。
- 计算逻辑 = Vanilla JS 纯函数（`src/lib/`），**vitest** 测试。
- Owner 用**中文**沟通；页面日文内容由 Claude 生成（Owner 不懂日文、无法校对——所以正确性全靠测试 + 对照日本权威法规）。

## 2. 命令

```bash
npm test            # 全量测试（vitest run）
npx vitest run tests/<tool>.test.js   # 单个工具测试
npm run dev         # 开发服务器
npm run build       # 生产构建 → dist/
```

部署（Owner 要求「改完直接部署」，不必每次问）：
```bash
npm run build
npx wrangler pages deploy dist --project-name=keisantool
```
- CF Pages 项目名：`keisantool`，正式域名 keisantool.com，每次部署给一个 `xxxx.keisantool.pages.dev` 预览URL。
- **注意**：本地 git 没有配置 remote（`origin` 不存在），所以 `git push` 会失败。部署走 wrangler，不走 git。commit 只是本地留痕。

## 3. 当前状态（2026-06-15）

- **24 个工具全部 live、已上线、全部有页面**。
- **测试 715 个全绿**（24 个测试文件）。
- 工作树已提交（最新 commit：開発者ツール5種 + 分类下拉导航）。
- 依赖：构建期新增了 `marked`（给 Markdown 工具用）。

## 4. 关键约定（必须遵守，详见 CLAUDE.md）

1. **TDD 强制**：先写测试 → 跑出 RED → 再实现 → GREEN。Owner 无法校对计算，测试是唯一正确性保证。
2. **金额端数一律 `Math.floor` 切り捨て**（整数円）。
3. **`src/data/tools.js` 是工具元数据的单一数据源**：新增工具先在这里注册（slug/nav/name/icon/category/short/live）。导航、首页卡片、关联链接全部引用它。
4. **SEO 每页必备**：唯一 `<h1>`、`<title>`、`<meta description>`、`<link canonical>`、JSON-LD(WebApplication)、`<html lang="ja">`、免責事項「計算結果はあくまで参考値です」。这些由 `ToolLayout.astro` + 各页 frontmatter 提供。
5. **日期处理**：用 UTC 正午基准（见 `src/lib/shussan.js` 的 `toDate/toISO/addDays`），避免时区/夏令时跨日 bug。
6. **法规/数值每年要复核**：日本税制·社保每年 4月/8月 改定。已知踩过的坑见第 8 节。

## 5. 全工具清单（24个，按分类）

| 分类 | slug | 工具 |
|------|------|------|
| 税金・お金 | zeizei | 消費税・割引（含複数商品合算） |
| 税金・お金 | kotei-shisan | 固定資産税（土地/家屋分离+新築減額） |
| 税金・お金 | kokuho | 国民健康保険料 |
| 税金・お金 | wariai | 割合・パーセント・比率（含増減率/歩合） |
| 健康・身体 | bmi | BMI・体脂肪率（含多档目标体重） |
| 健康・身体 | calorie | カロリー・基礎代謝（国立健康栄養研究所式/HB式可切） |
| 健康・身体 | hensachi | 偏差値（含从分数列表自动算SD） |
| 生活・日常 | shussan | 出産予定日（含逆算+妊娠月数） |
| 生活・日常 | yakudoshi | 厄年チェッカー（含和暦早見表SSR） |
| 生活・日常 | kyuyo | 給与・残業代（含自动时给+分类残業） |
| 生活・日常 | jisa | 時差計算（含任意日時変換, DST正确） |
| 生活・日常 | gasoline | ガソリン代（含割り勘） |
| 生活・日常 | saniku | 産休・育休（含出生後支援+13%等2025新制） |
| 生活・日常 | nenrei | 年齢計算（満年齢/数え年/学年/干支） |
| 占い・文化 | rokusei | 六星占術・大殺界（含12型解说SSR） |
| 文字ツール | moji | 全角半角・かな・文字数カウント（含字节/原稿用紙/X文字数） |
| 変換・ツール | color-code | カラーコード変換（HEX/RGB/HSL+取色器+抵抗カラーコード） |
| 変換・ツール | tani | 単位変換（長さ/重さ/面積/体積/温度/速さ） |
| 変換・ツール | wareki | 和暦・西暦変換（改元边界精确+早見表） |
| 開発者ツール | base64 | Base64 エンコード/デコード（UTF-8安全） |
| 開発者ツール | json | JSON 整形・圧縮 |
| 開発者ツール | urlencode | URL エンコード/デコード |
| 開発者ツール | regex | 正規表現テスト |
| 開発者ツール | markdown | Markdown → HTML（用 marked） |

分类（`tools.js` 的 `categories`）：税金・お金 / 健康・身体 / 生活・日常 / 占い・文化 / 文字ツール / 変換・ツール / 開発者ツール。

## 6. ⚠️ 当前最优先的未完成项：PC 桌面布局拥挤

**这是本次交接的核心待办。Owner 明确不满。**

### 现象
1440px 等大屏下，很多工具（尤其内容多的：**markdown / regex / json / color-code / tani**）被压在左侧很窄的区域里，右边大片空白浪费，编辑区/多栏内容挤成一团，非常局促。

### 根因
`src/styles/global.css` 里给工具页设了**固定的两栏布局**（约第 132 行附近的 `@media (min-width:1024px)` 块）：
```css
.page-wrapper:not(.wide){ display:grid; grid-template-columns:560px 1fr; gap:0 40px; }
.calc-card{ max-width:560px; ... }   /* 计算卡被钉死 560px */
```
- 这个「左 560px 计算卡 + 右 howto」对**简单计算器**（zeizei/bmi 等）效果不错；
- 但对**编辑器型/多栏型工具**（markdown 左右编辑+预览、regex 大文本框、json、color-code 三tab、tani）来说 560px 太窄，被严重挤压。

### 建议修复方向（任选其一，倾向 A）
- **A. 给 ToolLayout 加布局档位**：`ToolLayout.astro` 已支持 `wide` prop（首页在用）。给内容多的工具页传一个「宽布局」标记 → 这些页面用**单栏全宽**（calc-card 放宽到 ~900px 或 100%，howto 放下方），简单工具维持现有两栏。需要改 `ToolLayout.astro` + global.css + 给 markdown/regex/json/color-code/tani 等页面加标记。
- **B. 让 calc-card 宽度弹性**：不再钉死 560px，按内容/容器自适应（如 `min(100%, 720px)`，宽工具更宽），两栏阈值上调。
- 改完务必在 1440 / 1280 / 768 / 375 四个宽度各截图验证（用 preview 工具），别只测一个尺寸。

## 7. 其他待办 / 未来方向

- **Semrush 调研已做过**（JP市场）。结论：
  - 已做完的高价值：年齢計算(12万)、カラーコード(40万/KD16%)等。
  - **暂缓**：`シルエットクイズ`（剪影游戏）——CPC≈0、ポケモン有IP风险、需大量剪影素材、偏离定位。
  - **単位変換 CPC≈0**（已做，变现低，属铺量）。
  - 开发者工具（Base64/JSON/正規表現等）**变现低**（程序员开广告拦截），已做、属铺流量，别期待高 RPM。
- Semrush 走法：账户 API 额度已耗尽，**用 `semrush-chrome` 技能**经 `sem.3ue.co`（GURU代理）Chrome 自动化采集；数据库选 JP。
- 各工具仍有竞品功能可深挖（见各工具竞品差距，之前审查报告里有），但优先把第 6 节布局修了。

## 8. 重要历史决策 & 已踩的坑

- **国保 給与所得控除**：必须用**令和7改正表**（最低控除 65万、适用到年收190万）。旧令和6表(55万)会高估保险料——这是修过的线上真bug。`src/lib/kokuho.js`。
- **産休育休**：已含 2025年4月新制「出生後休業支援給付金 +13%」、育休給付金賃金日額上限(16,110円，令和7年8月值，**每年8月需更新**)。`src/lib/saniku.js`。
- **時差 DST**：`src/lib/jisa.js` 的 `getOffsetMinutes/convertWallClock` 用 `toLocaleString` 两次相减，DST 自动正确，已实测（东京vs纽约夏令时+13h等）。
- **`live` flag 不过滤**：导航/首页**不按 live 过滤**（`SiteHeader.astro` 和 `index.astro` 都是全渲染）。当前 24 个全 `live:true`。若想用 live 真正隐藏，需要自己接过滤逻辑。
- **calorie 公式**：默认用「国立健康・栄養研究所式(Ganpule)」，HB式可切换。
- **导航**：已是分类下拉式（`SiteHeader.astro`：PC hover/点击展开，移动端汉堡+手风琴）。工具再增多也不会挤爆导航。
- **浮动分享**：`FloatingShare.astro` 全站右下角 FAB，移动端优先 `navigator.share`。

## 9. 目录结构

```
src/
  layouts/ToolLayout.astro      共通模板（head/SEO/JSON-LD/header/footer/ShareButtons/FloatingShare）
  components/                   SiteHeader(分类下拉) / SiteFooter / RelatedTools / ShareButtons / FloatingShare
  data/tools.js                 工具元数据【单一数据源】
  lib/<tool>.js                 计算纯函数【TDD对象】
  pages/<slug>/index.astro      各工具页（用 ToolLayout + RelatedTools）
  styles/global.css             全站样式（第6节布局问题在这里）
tests/<tool>.test.js            vitest 测试
```

新工具标准流程：① `tools.js` 注册 → ② 写 `tests/<tool>.test.js`（RED）→ ③ 写 `src/lib/<tool>.js`（GREEN）→ ④ 建 `src/pages/<slug>/index.astro`（仿 `zeizei`/`wariai`/`moji` 结构，SEO frontmatter 齐全，样式用页面内 `<style>` 不动 global.css）→ ⑤ build + 浏览器验证（多尺寸）→ ⑥ wrangler 部署。
