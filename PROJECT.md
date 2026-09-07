# keisantool

> 日本語の計算・変換ツール集。

## 核心信息

- 域名：`https://keisantool.com`
- 用户：日本语搜索用户
- 技术：Astro 6 静态构建、Vanilla JS、Vitest、npm
- 部署：GitHub `main` → GitHub Actions → Cloudflare Pages
- 仓库：`rusherxie-sudo/keisantool`
- 页面计算在浏览器端完成，无后端数据库

## 代码约定

- 工具元数据唯一来源：`src/data/tools.js`
- 计算纯函数：`src/lib/`
- 页面：`src/pages/`
- 共通布局：`src/layouts/ToolLayout.astro`
- 测试：`tests/`
- 当前规则与陷阱：`CLAUDE.md`
- 当前进度与历史状态：`HANDOFF.md`

## 页面与 SEO

- 工具页使用 `ToolLayout` 统一输出 title、description、canonical、JSON-LD、面包屑和页面更新日期。
- 程序化页面包括出生年份、最低工资、六星占术、时差、日出日落、六曜、祝日、星座相性等页面群。
- sitemap 使用 `src/data/lastmod.json` 提供提交式更新时间。

## 验证命令

```bash
npm test
npm run build
npm run check
```

最近验证基线：96 个测试文件、1727 项测试全绿，生产构建约 573 页。实际状态以命令输出和 `HANDOFF.md` 最新记录为准。
