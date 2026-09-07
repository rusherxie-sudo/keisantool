# CLAUDE.md

本文件只记录本仓库长期有效的协作约定、架构规则和已验证的陷阱。
当前进度、工具清单、SEO 数据和待办事项查看 `HANDOFF.md`，不要把临时状态写进本文件。

## 沟通与内容

- 与 Owner 一律使用中文沟通。
- 页面日文内容由 Claude 生成；涉及法规、税制、社保或健康信息时，必须用测试和日本权威来源交叉验证。
- 不做与任务无关的重构，不覆盖现有未提交修改。

## 技术栈与常用命令

- Astro 静态构建，Cloudflare Pages 部署。
- 计算逻辑使用 Vanilla JS 纯函数，集中在 `src/lib/`，测试使用 Vitest。
- 无 TypeScript、ESLint 或 Prettier。

```bash
npm test
npm run build
npm run check
npm run dev
```

`npm run check` 是本地质量门，包含测试、生产构建和 `git diff --check`。

## 部署与外部写操作

- 生产链路是 GitHub `main` → GitHub Actions → Cloudflare Pages Git 集成。
- 未经当前任务明确授权，不提交、推送、部署，也不执行 IndexNow、GSC 或其他外部 URL 提交。
- 改动页面或数据后，发布前必须先提交改动，再运行：

```bash
node scripts/update-lastmod.mjs
```

然后提交生成的 `src/data/lastmod.json`。该 manifest 用于没有完整 Git 历史的 Cloudflare 构建环境，不能省略。

## 架构约定

- `src/data/tools.js` 是工具元数据的唯一来源。导航、首页卡片、分类入口和关联工具都从这里派生；新增工具先注册这里。
- 页面通常由 `src/layouts/ToolLayout.astro` 包裹。布局负责 head、SEO、JSON-LD、页头、页脚和分享组件；页面负责工具 UI 与交互。
- 计算逻辑不得依赖 DOM。页面脚本只负责读取输入、调用纯函数和渲染结果。
- 工具专属样式写在页面内；只有全站布局、卡片、导航等共性样式才修改 `src/styles/global.css`。
- 简单工具使用默认窄布局；编辑器、宽表格和多栏工具使用 `ToolLayout` 的 `wide` 属性。
- 日期计算使用 UTC 正午基准，参考 `src/lib/shussan.js` 的日期辅助函数。

## 计算正确性

- 新增或修改计算逻辑必须遵循 TDD：先写测试并确认失败，再实现，再确认通过。
- 涉及法规、税制、社保、最低工资或健康指标时，测试必须覆盖边界值，并尽量加入权威来源的锚点值。
- 金额结果统一使用 `Math.floor` 切り捨て为整数日元，除非页面明确采用其他法规口径。
- 日本税制、社保和最低工资通常需要在每年 4 月、8 月复核；修改相关工具前先查看 `HANDOFF.md` 的历史坑。
- 文件名通常使用 kebab-case；`src/lib/koteiShisan.js` 是既有的 camelCase 例外，不要随意改名。

## SEO 与页面规范

每个工具页应具备：

- 唯一的 `<h1>`、`<title>`、description 和 canonical。
- `html lang="ja"`。
- WebApplication JSON-LD；适用时补充 BreadcrumbList、FAQ 或其他真实存在的结构化数据。
- 至少 3 个站内关联链接，通常由 `RelatedTools` 提供。
- 日文免责声明：`計算結果はあくまで参考値です`。
- 结果区下方和页面下部可放 `.ad-slot`；禁止弹窗和插屏广告。

## 已验证的陷阱

- Astro scoped `<style>` 不会作用于 `innerHTML` 注入的节点。动态内容必须使用带唯一前缀的 `<style is:global>`。
- 隐藏 radio 必须限制为 `width: 1px`，否则可能继承表单输入宽度造成横向溢出。
- 导航和首页当前不依赖 `live` 过滤；要隐藏工具必须显式修改渲染逻辑。
- 动态路由新增页面群时，要同时接好 `getStaticPaths`、面包屑和 `src/lib/lastmod.js` 的源文件映射。
- 生产构建环境可能没有 Git 历史；不要让 sitemap 或 JSON-LD 的更新日期只依赖构建时 `git log`。

## 新工具流程

1. 在 `src/data/tools.js` 注册元数据。
2. 新增 `tests/<tool>.test.js`，先跑出 RED。
3. 实现 `src/lib/<tool>.js`，跑到 GREEN。
4. 创建页面并补齐 SEO、免责声明和关联链接。
5. 运行 `npm run check`，再按 1920、1440、768、375 宽度验证 UI。
6. 只有获得发布授权后，才提交、推送并验收线上页面。

更详细的设计资料和历史决策见 `docs/` 与 `HANDOFF.md`；不要把这些临时或历史内容复制回本文件。
