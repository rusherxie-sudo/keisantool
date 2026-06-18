# keisantool.com 首页改版交接文档（给 Claude）

> 日期：2026-06-18  
> 交接对象：Claude / 下一位实现者  
> 当前阶段：设计阶段，尚未进入实现  
> 已确认方向：方案 1「Clear Pocket Calculator」  
> 相关设计总纲：`docs/superpowers/specs/2026-06-18-mobile-first-redesign-design.md`

## 1. 项目与沟通约束

- 项目：`keisantool.com`，日本語の計算・変換ツール集合站。
- 技术：Astro 静态站，原生 CSS，Vanilla JS，无 React/Vue/Tailwind。
- Owner 用中文沟通；页面文案必须是日文。
- 本站靠日本自然搜索流量 + AdSense 变现。
- 这轮重设计核心是移动优先，同时 PC 不能浪费宽屏。
- 当前本地工作树有大量既有改动，接手时不要随意还原或覆盖。

## 2. 已确认的视觉方向

采用方案 1：**Clear Pocket Calculator**。

关键词：

- 专业可信。
- 移动优先。
- 清爽工具感。
- 白底 + 信任蓝为主。
- 少量珊瑚色作为品牌/行动点缀。
- 少装饰、强层级、强可用性。
- 像“手机上的专用计算器”，不是营销落地页。

明确不要：

- 不要米色/奶油色主调。
- 不要紫色渐变。
- 不要装饰光斑、圆球、花哨插画。
- 不要巨大的营销 Hero。
- 不要把首页做成品牌宣传页。
- 不要可见广告占位框。

## 3. 已出的高保真设计稿

本轮已经在 Codex 线程中生成了 2 张首页高保真稿：

1. **移动端首页稿**
   - 尺寸：`390 x 844`
   - 主题：移动优先工具目录。
   - 结构：轻 Header → H1 → 简短说明 → 搜索框 → 高频工具 → 分类快捷入口 → 分类工具列表。

2. **PC 首页稿**
   - 尺寸：`1440 x 1024`
   - 主题：宽屏工具目录工作台。
   - 结构：桌面 Header → 紧凑 Hero + 搜索 → 高频工具横向区 → 左侧分类 rail + 右侧分组工具矩阵。

注意：图片由当前 Codex 线程的 Image Gen 生成，但本地没有找到稳定的图片文件落点。因此本文档把设计稿内容、结构和原始生成提示词完整保留下来。若 Claude 看不到线程中的图片，可直接按第 8 节提示词重新生成。

## 4. 首页移动版设计说明

移动首页目标：让用户快速找到工具，而不是看宣传。

### 4.1 页面结构

首屏从上到下：

1. Sticky 轻 Header
   - 左侧：`keisantool` + 小 `計` 标记。
   - 右侧：菜单按钮。

2. H1
   - `日本語計算ツール一覧`

3. 短说明
   - `税金・健康・日付・変換をすぐ計算。`

4. 搜索框
   - placeholder：`ツールを検索`
   - 目标：用户不必滚动也能快速找工具。

5. 高频工具区
   - 标题：`よく使われるツール`
   - 工具：
     - `消費税・割引`
     - `年齢計算`
     - `BMI計算`
     - `カラーコード`
     - `単位変換`

6. 分类快捷入口
   - `税金・お金`
   - `健康・身体`
   - `生活・日常`
   - `変換・ツール`
   - `開発者ツール`

7. 分类预览
   - 标题：`税金・お金`
   - 工具行：
     - `消費税・割引`
     - `固定資産税`
     - `国民健康保険料`
     - `割合・パーセント`

8. 底部露出下一分类
   - `健康・身体`

### 4.2 移动端布局规则

- 不沿用当前手机两列大卡片。
- 优先使用紧凑列表行：图标 + 工具名 + 短说明 + 可点击箭头/暗示。
- 每行最小点击高度约 56px。
- H1 不要占太高，首页不是营销 Hero。
- 搜索框和常用工具必须靠上。
- 分类 chip 可横向滚动，但不要显得拥挤。
- 不显示任何广告灰框或“広告枠”文字。

## 5. PC 首页设计说明

PC 首页目标：充分利用宽屏，让工具目录像一个清晰的工作台。

### 5.1 页面结构

1. Sticky 桌面 Header
   - Logo：`keisantool` + `計` 标记。
   - 分类导航：
     - `税金・お金`
     - `健康・身体`
     - `生活・日常`
     - `占い・文化`
     - `変換・ツール`
     - `開発者ツール`

2. 紧凑 Hero / Intro
   - H1：`日本語計算ツール一覧`
   - 副文案：`税金・健康・日付・変換を、ブラウザですぐ計算。`
   - 搜索框：`ツールを検索`

3. 高频工具横向区
   - 标题：`よく使われるツール`
   - 工具：
     - `消費税・割引`
     - `年齢計算`
     - `BMI計算`
     - `カラーコード`
     - `単位変換`
     - `給与・残業代`

4. 主目录区
   - 左侧或上方分类 rail / filter：
     - 7 个分类。
   - 右侧主内容：按分类分组工具矩阵。

5. 可见分组
   - `税金・お金`
     - `消費税・割引`
     - `固定資産税`
     - `国民健康保険料`
     - `割合・パーセント`
   - `健康・身体`
     - `BMI計算`
     - `カロリー・基礎代謝`
     - `偏差値`
   - `生活・日常`
     - `年齢計算`
     - `出産予定日`
     - `給与・残業代`
     - `時差計算`

### 5.2 PC 布局规则

- 不要让内容窄窄地漂在左边。
- 不要大 Hero，不要假数据，不要营销 CTA。
- 首页第一屏应看到搜索和较多工具入口。
- 分类 rail + 工具矩阵是推荐结构。
- 工具 item 需要：图标、工具名、短说明、可点击暗示。
- 页面不需要可见广告占位；广告为空时直接不出现。

## 6. 分享模块设计原则

虽然这次高保真首页稿主要是首页，但全站设计总纲已确认要增加显性分享模块。

接手实现时要注意：

- 分享主入口在工具页结果区，不是首页。
- 每个工具结果出现后，展示 `結果をシェア`。
- 移动端优先 LINE / 系统分享 / 复制。
- 复制内容应是“结果摘要 + 链接”，不是只复制 URL。
- 页尾分享条可保留，但视觉弱于结果区分享。
- FAB 保留，但不应挡住输入和结果。

示例分享文案：

```text
消費税・割引計算器
税込価格：¥1,100
消費税：¥100
https://keisantool.com/zeizei/
```

## 7. 广告设计原则

Owner 已明确：**广告位可以预留，但不要占位**。

这句话的实现含义：

- 保留广告插槽结构。
- 不要显示灰色广告框。
- 不要显示 `広告枠` 文案。
- 没广告时不要占高度。
- 广告加载后自然出现。

后续 CSS/组件可用：

```css
.ad-slot:empty {
  display: none;
}

.ad-slot[data-loaded="false"] {
  display: none;
}
```

如果 AdSense 需要防 CLS，也只在真实请求广告时启用最小高度，不在静态页面默认占位。

## 8. 高保真稿重生成提示词

如果 Claude 看不到当前线程里的图片，可用以下提示词重新生成。

### 8.1 移动首页提示词

```text
Use case: ui-mockup
Asset type: mobile homepage design mockup for keisantool.com
Target dimensions: 390 x 844 mobile web screen. Do not include browser chrome or device frame.

Create a realistic, production-quality mobile homepage UI for keisantool.com in the selected direction "Clear Pocket Calculator".

Product context: keisantool.com is a Japanese calculation and conversion tool collection site. Audience is Japanese mobile search users who want to find a calculator quickly. The homepage is a fast tool directory, not a marketing landing page.

Visual system:
- True white / very light neutral page background, no beige or cream dominance.
- Trustworthy clear blue as primary accent, small coral brand accent.
- Professional, clean, friendly utility feel.
- Japanese readable rounded sans for UI, monospaced numerals only where useful.
- Use spacing, grouping, and thin separators before heavy shadows.
- Radius 8-16px, not overly pillowy.
- No purple gradients, no decorative blobs/orbs, no hero illustration, no stock imagery.

Required visible content and structure in Japanese:
1. Sticky compact header: brand "keisantool" with small 計 mark, menu icon.
2. Homepage H1: 日本語計算ツール一覧
3. Short subtitle: 税金・健康・日付・変換をすぐ計算。
4. Search / quick find field: ツールを検索
5. High-frequency tools section title: よく使われるツール
6. Featured tool list items, readable on mobile:
   - 消費税・割引
   - 年齢計算
   - BMI計算
   - カラーコード
   - 単位変換
7. Category shortcut row or chips:
   税金・お金, 健康・身体, 生活・日常, 変換・ツール, 開発者ツール
8. Category section preview title: 税金・お金
9. Several compact tool rows under that category:
   消費税・割引, 固定資産税, 国民健康保険料, 割合・パーセント
10. Show no visible ad placeholder. Reserve no gray box. If an ad area is implied, it should be invisible or absent.
11. A hint of next category near the bottom: 健康・身体

Layout goals:
- Mobile-first, thumb-friendly, fast scanning.
- Avoid the current cramped two-column mobile card grid. Prefer compact list rows with icons and short descriptions.
- H1 should not consume too much first viewport.
- Search and popular tools should be visible near the top.
- Every row should look tappable, with stable height and readable Japanese.
- Keep the mockup clean and implementable in Astro + hand-written CSS.

Do not add fake metrics, reviews, pricing, marketing CTA, newsletter signup, browser chrome, or device chrome. Do not put multiple design options in one image.
```

### 8.2 PC 首页提示词

```text
Use case: ui-mockup
Asset type: desktop homepage design mockup for keisantool.com
Target dimensions: 1440 x 1024 desktop web screen. Do not include browser chrome or device frame.

Create a realistic, production-quality desktop homepage UI for keisantool.com in the selected direction "Clear Pocket Calculator". It must clearly match the mobile homepage visual system, but use desktop space well.

Product context: keisantool.com is a Japanese calculation and conversion tool collection site. Audience is Japanese users arriving from search or browsing categories. The homepage is a fast tool directory, not a marketing landing page.

Visual system:
- True white / very light neutral base, no beige or cream dominance.
- Trustworthy clear blue primary accent, small coral brand accent.
- Professional, clean, friendly utility feel.
- Japanese readable rounded sans for UI, monospaced numerals only where useful.
- Use spacing, grouping, thin separators, and subtle surface tints before heavy shadows.
- Radius 8-16px.
- No purple gradients, no decorative blobs/orbs, no hero illustration, no stock imagery.

Required visible content and structure in Japanese:
1. Desktop sticky header:
   - brand "keisantool" with small 計 mark
   - category nav: 税金・お金, 健康・身体, 生活・日常, 占い・文化, 変換・ツール, 開発者ツール
2. Compact hero / intro area, not marketing-heavy:
   - H1: 日本語計算ツール一覧
   - Subtitle: 税金・健康・日付・変換を、ブラウザですぐ計算。
   - Search field: ツールを検索
3. High-frequency tools band:
   - title: よく使われるツール
   - tool tiles/rows: 消費税・割引, 年齢計算, BMI計算, カラーコード, 単位変換, 給与・残業代
4. Main category directory area:
   - left or top category index / filter rail with 7 categories
   - main content grid grouped by category
   - visible groups:
     税金・お金 with 消費税・割引, 固定資産税, 国民健康保険料, 割合・パーセント
     健康・身体 with BMI計算, カロリー・基礎代謝, 偏差値
     生活・日常 with 年齢計算, 出産予定日, 給与・残業代, 時差計算
5. Tool items should have icon, name, short description, and a clear clickable affordance.
6. Show no visible ad placeholder. Reserve no gray box. If an ad area is implied, it should be invisible or absent.
7. Footer can be only hinted if space allows, not necessary.

Layout goals:
- Use desktop width well; no narrow content floating on the left.
- Avoid giant marketing hero. The first screen should show search and many useful tool entry points.
- Keep the content scan-friendly, with clear grouping and stable card/list sizes.
- Make it feel implementable in Astro + hand-written CSS.
- Do not create nested cards or place all content inside one giant rounded app panel. Use the page surface, bands, and grouped lists.

Do not add fake metrics, reviews, pricing, newsletter signup, hero image, browser chrome, device chrome, or multiple design options in one image.
```

## 9. 首页实现建议

接手实现首页时建议先只改以下文件：

- `src/pages/index.astro`
  - 调整首页结构：搜索、高频工具、分类快捷入口、分类列表。
- `src/styles/global.css`
  - 新增或重写首页相关 class。
  - 注意移动端一列列表与 PC 矩阵布局。
- `src/data/tools.js`
  - 可利用现有 `tools` / `categories` / `categoryMeta`。
  - 如需高频工具，建议在首页局部写固定 slug 列表，不要改动工具元数据结构，除非后续全站也需要该字段。
- `src/components/SiteHeader.astro`
  - 如果首页设计需要更轻的 Header，可先只通过 CSS 调整，不要大幅改 JS。

不建议第一步改：

- 各工具页计算逻辑。
- `src/lib/*`。
- 测试文件。
- AdSense 真接入逻辑。

## 10. 验收重点

首页实现后至少验证：

- 375px：搜索框、常用工具、分类入口是否在首屏清楚可点。
- 768px：布局不拥挤，不出现尴尬两列。
- 1440px：内容充分利用宽度，不漂左。
- 1920px：主内容有最大宽度约束，不散。
- 未加载广告时没有任何灰框和广告文字。
- 所有工具卡都来自 `src/data/tools.js`，链接正确。
- 日文文案自然，不出现中文在页面里。

## 11. 给 Claude 的一句话任务

请基于本交接文档和 `docs/superpowers/specs/2026-06-18-mobile-first-redesign-design.md`，先落地首页移动版与 PC 版。优先修改 `src/pages/index.astro` 与 `src/styles/global.css`，保持 Astro + 原生 CSS，不改计算逻辑，不显示广告占位，并在 375 / 768 / 1440 / 1920 四个宽度验证首页。
