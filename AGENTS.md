# AGENTS.md

本文件记录本仓库长期有效的协作约定、架构规则和已验证陷阱；当前进度与工具清单查看 `HANDOFF.md`。

## 沟通与内容

- 与 Owner 一律使用中文沟通。
- 页面日文内容由 Codex 生成；法规、税制、社保和健康信息必须以测试及日本权威来源校验。
- 不覆盖现有未提交修改，不做与任务无关的重构。

## 技术栈与命令

- Astro 6 静态站、Vanilla JS、Vitest、npm。
- 无 TypeScript、ESLint 或 Prettier。
- 生产链路：GitHub `main` → GitHub Actions → Cloudflare Pages Git 集成。

```bash
npm test
npm run build
npm run check
npm run dev
```

未经任务明确授权，不推送、部署、执行 IndexNow 或其他外部写操作。

## 架构约定

- `src/data/tools.js` 是工具元数据唯一来源；导航、首页、分类和关联工具从这里派生。
- `src/lib/` 保存不依赖 DOM 的纯计算函数；页面脚本只负责输入、调用和渲染。
- 页面通常使用 `src/layouts/ToolLayout.astro`，由布局统一处理 SEO、JSON-LD、面包屑、页头、页脚和分享组件。
- 简单工具使用默认窄布局；编辑器、宽表格和多栏工具使用 `ToolLayout` 的 `wide` 属性。
- 工具专属样式写页面内；只有全站共性布局和组件样式才修改 `src/styles/global.css`。

## 必守规则

- 新增或修改计算逻辑必须先写测试并确认 RED，再实现并确认 GREEN。
- 涉及日本法规或健康指标时，测试覆盖边界并加入权威锚点值。
- 金额默认 `Math.floor` 切り捨て为整数日元。
- 日期使用 UTC 正午基准，避免时区和夏令时跨日错误。
- 页面具备唯一 H1、title、description、canonical、`lang="ja"`、JSON-LD、至少 3 个关联链接，以及免责声明 `計算結果はあくまで参考値です`。
- 页面或数据改动后，发布前先提交改动，再运行 `node scripts/update-lastmod.mjs`，单独提交 `src/data/lastmod.json`，最后一次推送两个 commit。

## 已验证陷阱

- Astro scoped style 不作用于 `innerHTML` 注入的节点；动态内容样式使用带唯一前缀的 `<style is:global>`。
- 隐藏 radio 限制为 `width: 1px`，否则可能撑出横向滚动条。
- 导航和首页当前不按 `live` 过滤；要隐藏工具必须显式修改渲染逻辑。
- 文件名通常使用 kebab-case；`src/lib/koteiShisan.js` 是既有 camelCase 例外。
- 动态页面群新增时，同时接入 `getStaticPaths`、面包屑、`src/lib/lastmod.js` 映射和测试。
