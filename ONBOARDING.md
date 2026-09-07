# keisantool 接手说明

> 面向新会话的快速交接。稳定约定见 `CLAUDE.md`；滚动状态、近期决策和历史坑见 `HANDOFF.md`。
> 本文只保留不容易误导新会话的当前事实，不维护每日流量流水账。

## 项目定位

- `keisantool.com`：面向日本用户的日文计算与转换工具站。
- 纯静态 Astro 站点，计算在浏览器端完成，无后端和数据库。
- Owner 使用中文沟通；页面日文内容由 Claude 生成。

## 技术栈与命令

- Astro 6、Vanilla JS、Vitest、npm。
- 无 TypeScript、ESLint 或 Prettier。
- `src/data/tools.js` 是工具元数据唯一来源。
- `src/lib/` 保存不依赖 DOM 的纯计算函数。

```bash
npm test
npm run build
npm run check
npm run dev
```

当前验证基线以实际命令输出为准；最近基线为 96 个测试文件、1727 项测试，生产构建约 573 页。

## 部署链路

生产发布使用：

```text
GitHub main → GitHub Actions（test + build）→ Cloudflare Pages Git 集成
```

- CI 使用 Node 22。
- 不使用 `wrangler pages deploy` 作为默认部署方式。
- 未经当前任务明确授权，不推送、部署、提交 GSC/IndexNow 或其他外部写操作。
- `origin` 已配置为 GitHub 仓库 `rusherxie-sudo/keisantool`。

## lastmod 规则

Cloudflare Pages 构建环境可能没有完整 Git 历史，页面更新日期依赖提交式 manifest：

1. 先提交页面或数据改动。
2. 执行：

```bash
node scripts/update-lastmod.mjs
```

3. 单独提交 `src/data/lastmod.json`。
4. 一次推送两个 commit。

不要在页面改动提交前生成 manifest，否则 manifest 读取不到最新提交日期。

## 架构要点

- 页面通常使用 `src/layouts/ToolLayout.astro`，由布局统一处理 SEO head、JSON-LD、面包屑、页头、页脚和分享组件。
- 工具页面的计算逻辑从 `src/lib/<tool>.js` 引入，页面脚本只负责输入、调用和渲染。
- 默认工具页面使用窄布局；编辑器、宽表格、多栏工具通过 `ToolLayout` 的 `wide` 属性使用宽布局。
- 程序化页面通过 `getStaticPaths` 生成；新增页面群还要接入面包屑、sitemap lastmod 映射和测试。
- 页面数量、工具清单和近期功能以源码与 `HANDOFF.md` 为准，不要复制旧快照中的数字。

## 计算与页面质量

- 新增或修改计算逻辑必须先写测试、确认 RED，再实现并确认 GREEN。
- 涉及日本税制、社保、最低工资、健康指标等内容，测试必须覆盖边界，并使用权威来源锚定关键数值。
- 金额默认 `Math.floor` 切り捨て为整数日元。
- 日期使用 UTC 正午基准，避免时区和夏令时跨日错误。
- 页面至少具备唯一 H1、title、description、canonical、日文 lang、JSON-LD、关联内链和免责声明：`計算結果はあくまで参考値です`。

## 常见陷阱

- Astro scoped style 不作用于 `innerHTML` 注入的动态节点；动态内容样式要用带唯一前缀的 `<style is:global>`。
- 隐藏 radio 必须限制 `width: 1px`，否则可能继承表单输入宽度造成横向滚动。
- 导航和首页当前不按 `live` 过滤；要隐藏工具必须显式修改渲染逻辑。
- 文件名通常使用 kebab-case；`src/lib/koteiShisan.js` 是既有 camelCase 例外。
- 生产构建可能没有 Git 历史，不能只依赖构建时 `git log` 计算 lastmod。

## 新工具流程

1. 在 `src/data/tools.js` 注册。
2. 新增 `tests/<tool>.test.js`，先确认 RED。
3. 实现 `src/lib/<tool>.js`，确认 GREEN。
4. 创建页面并补齐 SEO、免责声明、关联链接和页面内样式。
5. 执行 `npm run check`，在 1920、1440、768、375 宽度验证。
6. 获得发布授权后再提交、推送、部署和做 URL 提交。

详细设计资料在 `docs/`；历史决策和法规陷阱在 `HANDOFF.md`。
