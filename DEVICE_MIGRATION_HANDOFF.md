# keisantool 跨设备 Codex 交接文档

> 用途：把本项目从当前设备迁移到另一台设备，并在 Codex 中继续开发。
> 快照日期：2026-08-29（Asia/Ho_Chi_Minh）。本文只记录迁移所需信息，不包含 OAuth token、Cookie、密码或 API 密钥。

## 1. 先说结论

本项目**没有 Git remote**，不能依赖 `git clone` / `git pull` 完成迁移。推荐把整个项目目录连同 `.git/` 一起打包复制，但排除可重建产物和旧 worktree。

普通 `git bundle` 也不够完整，因为以下重要内容不受 Git 跟踪：

- `.agents/skills/new-tool/SKILL.md`：项目本地的新工具开发 skill。
- `.codex/`：项目本地 hooks 与两个专用 agent 配置。
- `src/content/blog/kokuho-ryoukin-keisan-hoho.md`：当前受保护的未跟踪文章，会参与 Astro 构建，**必须迁移**。
- 本交接文档在未提交前也属于未跟踪文件。

不要迁移本机认证文件或缓存；Codex、Cloudflare、Google、Bing、SEMrush、飞书均应在新设备重新登录或重新授权。

## 2. 当前可复现基线

| 项目 | 当前值 |
|---|---|
| 分支 | `main` |
| HEAD | `da496c9812e664871aafa02c2a4b6acb21863b44` |
| 最新提交 | `docs: 记录2026-08-29最低工资答申与流量进展` |
| Git remote | 无 |
| Node.js | `v22.23.0` |
| npm | `10.9.8` |
| Astro | `6.4.8`（lockfile 安装结果） |
| Wrangler | `4.102.0`（由 `npx` 获取） |
| 注册工具 | 96 个，全部 `live:true` |
| 分类 | 8 个 |
| 测试 | 95 个测试文件、1716 项断言全绿 |
| 构建 | 571 页，成功 |
| 完整验收 | `npm run check` 于 2026-08-29 实测通过 |

当前 `git status` 在创建本文前有：

```text
## main
?? .playwright-mcp/
?? src/content/blog/kokuho-ryoukin-keisan-hoho.md
```

说明：

- `.playwright-mcp/` 只有浏览器验证日志和页面快照，可丢弃，不要作为业务资产迁移。
- `src/content/blog/kokuho-ryoukin-keisan-hoho.md` 共 175 行，SHA-256 为 `743e492e62004a66ed9b5bb5ebe666075b70d28729686d3d3e0c9d4d4147528d`。它不是临时文件，不得删除、覆盖或漏传。
- 创建本文后，`DEVICE_MIGRATION_HANDOFF.md` 也会出现在未跟踪列表中，这是预期状态。

## 3. 推荐迁移方法

### 3.1 在旧设备打包

从项目父目录执行：

```bash
cd /Users/jww/5kong
tar \
  --exclude='keisantool/node_modules' \
  --exclude='keisantool/dist' \
  --exclude='keisantool/.astro' \
  --exclude='keisantool/.wrangler' \
  --exclude='keisantool/.playwright-mcp' \
  --exclude='keisantool/.claude/worktrees' \
  --exclude='keisantool/.DS_Store' \
  -czf keisantool-transfer-20260829.tar.gz keisantool
shasum -a 256 keisantool-transfer-20260829.tar.gz
```

这个包会保留：

- 完整 Git 历史与分支：`.git/`
- 所有已跟踪源码、测试、文档和静态资源
- 未跟踪但必须保留的国保文章
- 项目本地 `.agents/`、`.codex/` 配置
- 主目录下仍有用的 `.claude/` 配置

它会排除：

- `node_modules/`、`dist/`、`.astro/`：新设备可重建
- `.wrangler/`：本机缓存，不是部署凭据的可靠迁移方式
- `.playwright-mcp/`：临时验证记录
- `.claude/worktrees/`：约 163 MB 的旧并行工作目录，不是当前 `main` 的权威来源

把压缩包和 `shasum` 输出通过可信介质传到新设备。不要把压缩包放到公开网盘或公开仓库。

### 3.2 在新设备恢复

```bash
mkdir -p /目标父目录
cd /目标父目录
shasum -a 256 /压缩包路径/keisantool-transfer-20260829.tar.gz
tar -xzf /压缩包路径/keisantool-transfer-20260829.tar.gz
cd keisantool
npm ci
npm run check
```

校验压缩包的 SHA-256 必须与旧设备输出一致。`npm ci` 必须使用仓库中的 `package-lock.json`，不要先运行 `npm update`。

恢复后再核对：

```bash
git branch --show-current
git rev-parse HEAD
git remote -v
git status --short --branch
shasum -a 256 src/content/blog/kokuho-ryoukin-keisan-hoho.md
```

预期分支为 `main`，HEAD 为上表值，remote 输出为空，国保文章哈希与上文一致。因为本文和国保文章未提交，`git status` 不会是完全干净，这是正常的。

## 4. 在新设备接入 Codex

1. 安装并登录 Codex，打开恢复后的 `keisantool` 文件夹作为项目根目录，不要只打开 `src/`。
2. 将项目标记为可信。Codex 官方文档说明：项目不受信任时会忽略项目内 `.codex/` 层、hooks 和 rules。
3. 新任务开始时先让 Codex 阅读 `AGENTS.md`、本文和 `HANDOFF.md` 顶部最新记录。
4. 确认项目本地 `.agents/skills/new-tool/SKILL.md`、`.codex/hooks.json`、`.codex/agents/*.toml` 均存在。
5. 当前设备全局安装的 skills / plugins 位于项目目录之外，不会被上述压缩包携带。至少确认新设备可用：`new-tool`、`calc-verifier`、`seo-page-checker`、`gsc-request-indexing`、`bing-site-performance`、`bing-keyword-research`、`semrush-codex`、`seo-audit`。

Codex 官方文档指出，项目根目录默认由 `.git` 识别，Codex 会从根目录向当前工作目录加载 `.codex/` 和 `AGENTS.md`；本项目保留 `.git/` 正是为了同时恢复历史和项目发现能力。参考：[Advanced Configuration](https://developers.openai.com/codex/config-advanced)。

不要复制 `~/.codex/auth.json`、系统钥匙串、浏览器 Cookie 或其他设备级凭据。用户级 Codex 配置位于 `CODEX_HOME`（默认 `~/.codex`），应在新设备按需重新配置。

## 5. 外部服务重新授权

### Cloudflare Pages

当前设备 `wrangler whoami` 已登录到 Owner 的 Cloudflare 账号，目标 Pages 项目名为 `keisantool`。OAuth 状态不会随项目目录可靠迁移；在新设备执行：

```bash
npx wrangler login
npx wrangler whoami
```

确认账号正确后才允许部署。生产部署命令以 `AGENTS.md` 为准：

```bash
npm run build && npx wrangler pages deploy dist --project-name=keisantool
```

如果从非 `main` worktree 部署，先按 `HANDOFF.md` 的历史规则确认分支与主线没有漂移。Cloudflare Pages 是全量覆盖部署，旧分支部署会静默冲掉新页面。

### Google / Bing / SEMrush / 飞书

- GSC、GA4：在新设备浏览器登录正确 Google 账号，重新连接 Codex 浏览器能力；不要迁移 Cookie。
- Bing Webmaster：重新安装或授权对应 skill 所需的账号/API 配置；凭据不在仓库中。
- SEMrush：使用 `semrush-codex` 指定的中转站流程，不访问 semrush.com 官方站；浏览器登录态需重建。
- 飞书：重新授权相关 skills。当前日报推送本来就因旧 `open_id` 跨应用、旧 `chat_id` 无机器人成员而失败，这不是迁移造成的问题；需更新推送目标或把当前 bot 加入会话。
- IndexNow：提交脚本为 `scripts/indexnow-submit.py`，公开验证文件为 `public/bdddcbdf5763d849cfc0e7486c209c24.txt`，两者都随项目迁移，不需要复制私密 token。

仓库当前没有 `.env` 文件，源码扫描也未发现依赖项目级环境变量的构建逻辑。

## 6. 文档权威顺序

接手时按以下顺序判断，避免被历史快照误导：

1. `AGENTS.md`：当前 Codex 的稳定约定、架构和必守规则，最高优先级。
2. `HANDOFF.md` 顶部最新日期条目：近期业务进度、部署和 SEO 状态。
3. 本文：仅负责跨设备恢复与 2026-08-29 技术快照。
4. `ONBOARDING.md`：2026-07-07 的旧快照，只作历史参考。
5. `CLAUDE.md`：旧 agent 说明。若与 `AGENTS.md` 冲突，以 `AGENTS.md` 为准。

已知冲突示例：`AGENTS.md` 当前规定桌面默认两栏并保留 `grid-auto-flow:dense`；`CLAUDE.md` 仍写成改版后的统一单栏。新开发必须遵循 `AGENTS.md` 和实际 `src/styles/global.css`，不要照搬旧文档。

## 7. 当前业务状态与下一步

截至 2026-08-29：

- 2026 最低工资地方答申已确认 41/47；未确认仅余岩手、佐贺、熊本、大分、冲绳、高知。
- 现行工资与未生效答申金额必须继续分离，计算器不得提前使用未来金额。
- 育儿休业给付工资日额上限已更新到 2026-08-01 改定值 16,540 日元。
- 最近生产基线为 571 页；最近一次记录的 Cloudflare 预览为 `62e2a3fa.keisantool.pages.dev`。
- GA4 非 `openai` activeUsers 在 08-27 / 08-28 已连续两天达到 300，当时还差一个完整达标日；继续前应重新拉最新数据，不要把旧状态当成已完成。
- 星座相性 144 个组合页仍为 `noindex,follow` 且排除 sitemap，AdSense 复审前不要擅自恢复索引。

最新细节和每日数据必须看 `HANDOFF.md` 开头与 `docs/seo-growth-30d.md` 尾部，不要从文档中间的旧日期段落推断现状。

## 8. 开发与部署硬规则摘要

- 与 Owner 沟通、写项目文档一律中文；页面内容使用日文。
- 新计算逻辑必须 TDD：先测试 RED，再实现 GREEN。
- 金额端数一律 `Math.floor` 切捨为整数日元。
- 日期以 UTC 正午为基准，参考 `src/lib/shussan.js`。
- 工具元数据单一来源是 `src/data/tools.js`。
- 新页面必须具备唯一 H1、title、description、canonical、JSON-LD、日文免责声明和至少 3 条内链。
- 页面专属样式写在页面 `<style>`；动态 `innerHTML` 内容使用 `<style is:global>` 并加页面唯一 id 前缀。
- 完成后运行 `npm run check`，并在 1920 / 1440 / 768 / 375 四档浏览器验证。
- 部署前确认当前主线包含其他会话的最新提交；部署后抽查 3 至 5 个不同批次页面，而不只检查本次改动页。
- 部署后按变更范围运行 IndexNow 增量提交。

## 9. 新设备首次开工清单

```text
[ ] 压缩包 SHA-256 一致
[ ] 项目根目录包含 .git / .agents / .codex / AGENTS.md
[ ] 国保未跟踪文章 SHA-256 一致
[ ] Node 22 + npm 可用
[ ] npm ci 成功
[ ] npm run check：95 files / 1716 tests / 571 pages
[ ] Codex 已登录，项目已信任，能读取 AGENTS.md
[ ] 项目本地 new-tool skill、hooks、专用 agents 可见
[ ] Cloudflare wrangler 重新登录且账号正确
[ ] GSC / GA4 / Bing / SEMrush / 飞书按需要重新授权
[ ] git branch 为 main，HEAD 与交接快照一致
[ ] 开工前重新读取 HANDOFF.md 最新条目
```

完成以上检查后，新设备上的 Codex 即可在不丢历史、不丢本地项目能力、不误删未跟踪文章的前提下继续开发。
