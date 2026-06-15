---
name: new-tool
description: 在 keisantool 新增一个计算/转换工具页面，按项目 6 步标准流程（tools.js 注册 → TDD 测试 → lib 纯函数 → 页面 → 构建验证 → 部署）走完。当要给站点加一个新工具时使用。
disable-model-invocation: true
---

# 新增工具（keisantool）

按项目铁律 6 步走，**顺序不能乱**——尤其 TDD：先测试再实现。

**前置**：先和用户确认这个工具的 **slug（kebab-case）/ 分类 / 日文名 / 一句话说明 / 要算什么**（输入→输出、公式、端数规则）。计算口径有疑问先查日本官方，别拍脑袋。

## 步骤

1. **注册元数据** —— 在 `src/data/tools.js` 的 `tools` 数组加一项：`slug / nav / name / icon / category / short / live:true`。`category` 必须是 `categories` 里已有的值。

2. **写测试（RED）** —— 建 `tests/<slug>.test.js`，把前置确认的输入→输出写成断言，**务必含边界用例**（0、上限、改元/年度边界、异常输入）。金额按 `Math.floor` 切り捨て到整数円。跑 `npx vitest run tests/<slug>.test.js` 确认**失败**（红）。

3. **写实现（GREEN）** —— 建 `src/lib/<slug>.js`，纯函数、不依赖 DOM。再跑同一条测试确认**全过**（绿）。
   - ⚠️ 日期相关用 UTC 正午基准（参考 `src/lib/shussan.js` 的 `toDate/toISO/addDays`）。
   - ⚠️ 命名一律 kebab-case（历史上只有 `koteiShisan.js` 是例外，新工具别再制造例外）。

4. **建页面** —— `src/pages/<slug>/index.astro`，仿 `src/pages/zeizei/index.astro`（或 `wariai`/`moji`）：用 `ToolLayout` + `RelatedTools`，SEO frontmatter 齐全（title/description/canonical/JSON-LD/h1/免责声明）。**样式写页面内 `<style>`，不动 `global.css`**。`.ad-slot` 放结果区直下 + 页面下部。

5. **构建 + 多尺寸验证** —— `npm run build`，再用 preview/Playwright 在 **1440 / 1280 / 768 / 375** 四个宽度各看一遍，确认不拥挤、能算对。

6. **部署** —— `npm run build && npx wrangler pages deploy dist --project-name=keisantool`（无 git remote，部署走 wrangler）。

## 完成前自检
- [ ] `npm test` 全绿（不只单文件）
- [ ] 页面 SEO 八项齐全（可让 `seo-page-checker` 子代理过一遍）
- [ ] 计算正确性存疑时，让 `calc-verifier` 子代理独立复核
