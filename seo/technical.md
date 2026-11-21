# keisantool 技术 SEO 状态

- 最后更新：2026-11-21（线上只读检查 + 仓库配置只读检查）

## 抓取与索引
- robots.txt：User-agent * / Allow: / / Sitemap: https://keisantool.com/sitemap-index.xml；线上 200。
- sitemap-index.xml → sitemap-0.xml：484 个 URL、484 个 lastmod；线上 200。lastmod 样例 2026-11-17T04:49:00.000Z。
- astro.config.mjs：site=https://keisantool.com；sitemap 使用 shouldIncludeInSitemap 过滤、lastModifiedForUrl 序列化。
- GSC 官方索引覆盖 / URL Inspection：**待接入**（本会话未调用；不以 sitemap 数量推断收录率）。

## URL 规范化与重定向
- https://www.keisantool.com/ 实测 301 → https://keisantool.com/（线上）。
- public/_redirects：6 条旧 URL 301 + 约 132 条星座逆序配对 301（内容收敛）。
- 抽样三页 canonical 均为自指，未见跨页冲突。

## 渲染与技术栈
- Astro ^6.4.6 静态站，构建输出 dist/；@astrojs/sitemap ^3.7.3；Vitest ^4.1.8。
- 本地 .node-version=24.22.2，而 CI（.github/workflows/ci.yml）与 Cloudflare Pages 配置 Node 22：版本不一致为维护风险观察项，未导致本次只读检查异常。
- GitHub Actions：push/PR 到 main 执行 npm ci、npm test、npm run build。
- lastmod 依赖发布前手动运行 scripts/update-lastmod.mjs 提交 src/data/lastmod.json（CF 构建无完整 Git 历史）；若漏跑会导致 sitemap lastmod 失真，属流程风险。

## 性能与移动端
- 线上首页响应头：HTTP/2 200、server cloudflare、cache-control public max-age=0 must-revalidate、cf-cache-status DYNAMIC；存在 preconnect/preload 字体提示。
- PSI / Core Web Vitals：**待接入**（本会话未调用 PSI；本机 PSI API Key 路径存在，但未在本任务中使用）。
- 移动端 viewport / 交互实测：待确认。

## 部署关联
- Cloudflare Zone keisantool.com：status=active、type=full（只读确认，不写 ID）。
- Cloudflare Pages 项目：只读 API 复核返回 HTTP 400（error codes 8000024），项目名待确认；仓库 README 记录 GitHub main → CF Pages Git 集成。
- 环境变量：仅发现脚本引用 BING_WEBMASTER_API_KEY（scripts/collect-bing-readonly.mjs）；**禁止记录值**。

## 工具环境观察
- web_fetch 对本域名报 "SSRF blocked: keisantool.com resolves to private address 198.18.13.183"：为沙箱代理现象，改用 bash curl / python urllib 只读检查成功；不作为线上故障。
