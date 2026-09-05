# keisantool

keisantool.com 是基于 Astro 的日文计算・转换工具站。

## 部署流程

生产部署采用 GitHub → Cloudflare Pages。GitHub Actions 在 `main` 的 push 和 Pull Request 上执行测试与构建；Cloudflare Pages 连接 GitHub 仓库并监听 `main`，自动执行 `npm run build` 后发布 `dist/`。

Cloudflare Pages 设置：Build command 为 `npm run build`，Build output directory 为 `dist`，Node.js version 为 `22`。

首次迁移时，在 GitHub 创建仓库并配置本地 remote 后推送：

```bash
git remote add origin <GitHub仓库URL>
git push -u origin main
```

日常发布：`npm run check` → `git commit` → `git push origin main`。不再从本机直接执行 `wrangler pages deploy`。
