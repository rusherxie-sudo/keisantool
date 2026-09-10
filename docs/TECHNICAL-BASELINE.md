# 技术结构与验证基线｜2026-09-10

来源：PROJECT.md 第3、7节，代码基线817d791。本页用于检索现有技术与验证事实，未进行新一轮业务构建或云端配置核验。

## 3. 技术结构与发布事实

当前安装Astro **6.4.8**（`package.json`范围为`^6.4.6`）、Vitest **4.1.8**；Vanilla JavaScript；无TypeScript、ESLint、Prettier。仓库未见应用后端或数据库；工具输入与计算主要在浏览器内完成。GA4、百度统计及Google Fonts等第三方请求仍存在，“本地计算”不代表完全不联网。

```text
src/data/tools.js                 工具目录、分类、关联推荐
src/data/blog.js                  文章分类与作者元数据
src/content/blog/*.md             正文、日期、来源等frontmatter
src/content.config.js            文章schema
src/lib/*.js                     计算、数据、日期和SEO辅助逻辑
src/pages/**/*.astro             静态入口及getStaticPaths模板
src/layouts/ToolLayout.astro      HTML、SEO、导航、统计、共享布局
src/components/                  FAQ、内链、表格、分享等组件
src/styles/global.css            全站公共样式
tests/                          逻辑与部分页面约束测试
scripts/                        llms、lastmod、IndexNow工具
public/                         robots、重定向、缓存头、静态资源
```

数据并非完全统一：目录在`tools.js`，最低工资、国保、税制、节假日和城市信息分散在`src/lib/`，文案及算例又散落在Astro与Markdown。主要扩容成本是年度一致性与依赖追踪，尚无证据支持更换框架或引入数据库。

- `.github/workflows/ci.yml`在main push／PR上运行Node 22、依赖安装、测试和构建，没有部署步骤。
- 历史配置记录为Cloudflare Pages监听GitHub main并构建。不能据此声称“Actions通过后才允许Pages部署”；本轮未检查云端部署保护和项目设置。
- 本地Node为26.8.1，与CI的22不同。Cloudflare当前Node版本未通过控制台复核，旧README的Node 22说法不视为已确认。
- `npm run check`是测试、构建、diff空白检查，不是类型检查。`npm run build`的prebuild会重写`public/llms.txt`。
- `scripts/indexnow-submit.py`默认提交整个sitemap，是外部写操作。发布、推送、提交索引遵循AGENTS.md。
- 仓库外存在增长采集／执行脚本与近期快照。旧GSC明细采集只取前2,500条页面×查询×设备记录且不翻页，不宜用于完整页面汇总。本轮没有运行增长执行器。

## 7. 验证范围与未知事项

本轮`npm test`：101文件、1,742项通过。直接调用当前安装Astro构建到临时目录：574页、427个sitemap URL成功。逐页静态审计除预期404路径外，title、description、唯一H1、canonical、可解析JSON-LD均通过；427个sitemap URL与canonical一致，未发现失效站内链接。为避免prebuild重写仓库文件，没有运行`npm run build`的完整脚本链。原始流量／关键词明细保存在本机临时审计目录，不写入Git；凭据不复制、不输出。

尚未验证：真实浏览器交互／视觉、Core Web Vitals／CrUX、全站线上抓取、完整索引排除原因、Cloudflare后台、外链质量与最新SERP竞争格局、全部法规和健康锚点。没有证据把Google较弱直接归因于“权威分数低”或算法惩罚。

后续按本文日期与口径重取：GSC searchAnalytics的无维度总计／page／query／device独立报告；GA4 runReport的总计、sessionSourceMedium、sessionDefaultChannelGroup、landingPagePlusQueryString、eventName；Bing GetRankAndTrafficStats、GetPageStats、GetQueryStats、GetCrawlStats。不要从截断多维明细推导总量，不混用点击、会话、用户与收录URL。
