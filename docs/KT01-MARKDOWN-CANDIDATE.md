# KT-01 Markdown 安全修复候选（独立审查通过，已验收待发布）

> 当前状态（2026-11-08）：用户指定且远端核实的线上 main dead351 已包含本修复。下文“候选/待发布”为当时验收记录，本轮不重复完整安全验收、不再次发布。

基线：2e90cc69802633585bea257e27622a8904b6875b；分支 fix/kt01-markdown-safety；worktree `/home/ubuntu/website/keisantool-kt01-markdown`。当前状态：独立审查通过，已验收待发布。本轮仅提交代码归档，提交完成后仍不推送、不合并 main、不部署。冻结时尚未 commit 的记录保留为历史。

## 风险与实现

原 `mdToHtml` 直接返回 marked 的未净化 HTML，页面用同源 `innerHTML` 渲染，同时向 HTML 输出框及复制按钮提供相同危险内容。真实 RED 证明图片 onerror 在最终 DOM 中存活；不是环境/语法错误。

现 `marked.parse` → 私有 DOMPurify **3.4.17** → 同一份净化字符串 → 输出/预览/复制。DOMPurify 使用明确标签、属性允许列表，另以原生 URL 解析验证协议；不是自制正则 sanitizer。无 DOM 时对非空输入抛错，绝不回退到 raw HTML。唯一生产调用者为 `src/pages/markdown/index.astro`；无服务端调用者。原 9 测试仅添加 jsdom 环境标记，断言未改弱。

新增开发依赖 jsdom **31.0.0**（维护方推荐最新 DOM 实现）；其必要依赖使 lru-cache 11.5.1 → 11.5.3。实际测试环境 Node **26.8.1**；默认 SSH 环境为 Node 12，复现时需显式使用 Node 路径，命令见 `docs/kt01-markdown-evidence/commands.md`；jsdom 要求 Node ^22.22.2 / ^24.15.0 / >=26，CI 使用跟随最新补丁的 Node 22。没有另加 lint/typecheck 平台。

## 功能边界

- 保留单一输入实时转换模式、标题/段落/强调/列表/引用/代码原文/普通链接/图片/表格以及允许的静态 raw HTML。
- 允许标签详见 lib 中 policy；属性仅 href/src/alt/title/class/start/colspan/rowspan/align。移除事件、style、id/name、data/aria 属性、srcdoc/srcset 等。
- href 仅 http/https/mailto/tel；图片 src 仅 http/https；相对 URL 保留。禁用 javascript/vbscript/data/blob/file 等 URL。
- 不允许 script、SVG/MathML、iframe/object/embed、form/input/button、style/link/meta/template、自定义元素；GFM 任务列表的表单控件也会移除，列表文字保留。
- HTML 复制返回净化后的 HTML，与预览完全同源；不再导出任意活动 raw HTML。页面说明已更新。
- 普通外部图片仍可请求其配信源，非本次隔离网络方案；浏览器验收主动拦截外发。普通链接保留，本次点击验证阻止了外部导航。

## 验证结果

- RED：1 测试 / 1 预期安全失败，原始 red.log。
- 首轮 GREEN：10/10；补齐后相关测试 **23/23**（原有9 + 新增14），原始 green-initial.log / green.log。
- 补齐测试时出现1次“把 HTML 重作 Markdown 解析”的错误幂等断言失败；修正为 DOMParser 重解析导出 HTML，安全断言保留，随后全部通过。该中间结果不作为产品安全失败。
- 完整 `npm test`：**116 文件、1970 测试全部通过，0 失败**，full-test.log。
- `npm run build`：成功，**565 页**；postbuild 检查 477 sitemap URL、24103 内链、533 fragment links；build.log 无 warning/error。
- `git diff --check`：退出 0。prebuild 的 llms/工作日历生成文件均无 tracked 差异，无恢复覆盖。
- Chromium **152.0.7977.82**：10/10 攻击组最终 DOM 无危险活动节点/属性/URL；主动派发事件后 canary=0；全部攻击组实际剪贴板等于净化输出。正常内容及实际复制、链接点击、代码原文、键盘输入/Tab、清空通过。
- 1280×900 与 390×844 无横向溢出，截图已保存并查看手机截图。pageerror=0；控制台4条错误均为主动网络拦截的 ERR_FAILED（统计/字体/恶意本地图片），详见 browser-console.log。
- 公开 registry 的 npm ci 成功；清洁安装后相关测试再次 23/23（clean-install-green.log）。安装提示 esbuild/sharp 安装脚本未在本机 allowScripts 覆盖，实际构建已成功。npm audit 13 项（1 low / 2 moderate / 9 high / 1 critical）为原有风险，不含新 DOMPurify/jsdom；本次不升级其他包。审计 JSON 保留。
- Context7 上轮401未重试、未进行账号操作；使用公开 npm 和维护方文档，快照保留。

未验：Firefox/WebKit、真实外部链接导航/外部图片下载、系统拒绝剪贴板分支、Node 22 本地复跑；这些不影响已完成的 Chromium/Node26 结果。没有生产攻击探测或真实 cookie/storage 读取。

## 预览与复核

历史验收时已实际返回 HTTP 200 且 Chromium 可访问：**http://127.0.0.1:4327/markdown/**。监听 0.0.0.0:4327，需通过既有 VPS 端口转发访问；没有创建公网域名。exec session 14741，Node PID 894627；启动/停止核验命令见 `docs/kt01-markdown-evidence/preview-management.md`，不触碰其他服务。

证据目录：`docs/kt01-markdown-evidence/`。`commands.md` 提供完整复现命令，`browser-reproduce.js` 是可直接传给 Playwright 的普通多行函数。`full-diff.patch` 包含相对基线的完整源码/依赖/测试/文档和截图二进制 diff（不包含自身及哈希清单，避免递归）；`SHA256SUMS` 覆盖所有候选变更文件及 diff，排除自身。冻结时核验命令：`sha256sum -c docs/kt01-markdown-evidence/SHA256SUMS`。该清单与 full-diff.patch 为冻结时历史快照，候选报告和最终锁文件已有获准更新，不作为当前版本全量哈希清单；证据目录原样保留。

静态安全摘要见 `static-security-scan.md`。历史冻结阶段为未提交、待独立审查；现独立只读审查 `deleg_0faa7309` 已完成，无阻断。负责人已实际复核全部源码、测试及日志哈希，同 hash 校验通过，并单独核验最终锁文件差异：lru-cache 源已为官方 HTTPS，原审查时的 HTTP 已消除。本轮获准仅提交归档，不重复运行同版本已成功的测试或构建；提交后仍不推送、不合并 main、不部署。不宣称完整 GFM 支持或全站无漏洞。

## 原工作区与回滚

原 checkout 仍在 main 基线，唯一原未跟踪发布记录保留原始 SHA256：a28aa1fe819e8bff09c800220ed1f2a5f0831ce979977a7477ffa95ad4c8dee1。备份分支 `backup/kt01-markdown-baseline-20261107` 指向同一基线。交付前只读复核远端 main 仍为该基线。

当前无生产变更需要回滚。若放弃候选，先归档证据并停止确认归属的4327预览；只处置本隔离 worktree/分支，不对原 checkout reset/clean/stash。未来上线回滚需在独立审批下还原对应提交，本轮不执行。

## 冻结时全部修改文件（历史清单）

下列清单由最终候选文件集生成（含证据）。日志虽被仓库通用 *.log 规则忽略，仍纳入本地完整 diff 与 SHA256 清单；本次仅提交批准的 7 个代码文件与本候选报告，共 8 文件；下列证据继续保留本地，不纳入提交。

- `docs/KT01-MARKDOWN-CANDIDATE.md`
- `docs/kt01-markdown-evidence/SHA256SUMS`
- `docs/kt01-markdown-evidence/baseline.md`
- `docs/kt01-markdown-evidence/browser-console.log`
- `docs/kt01-markdown-evidence/browser-normal-clipboard.log`
- `docs/kt01-markdown-evidence/browser-reproduce.js`
- `docs/kt01-markdown-evidence/browser-result.md`
- `docs/kt01-markdown-evidence/build.log`
- `docs/kt01-markdown-evidence/clean-install-green.log`
- `docs/kt01-markdown-evidence/commands.md`
- `docs/kt01-markdown-evidence/dependency-versions.log`
- `docs/kt01-markdown-evidence/desktop.png`
- `docs/kt01-markdown-evidence/diff-check.log`
- `docs/kt01-markdown-evidence/dompurify-upstream-readme.md`
- `docs/kt01-markdown-evidence/full-diff.patch`
- `docs/kt01-markdown-evidence/full-test.log`
- `docs/kt01-markdown-evidence/green-initial.log`
- `docs/kt01-markdown-evidence/green.log`
- `docs/kt01-markdown-evidence/mobile.png`
- `docs/kt01-markdown-evidence/npm-audit.json`
- `docs/kt01-markdown-evidence/npm-ci.log`
- `docs/kt01-markdown-evidence/preview-http.log`
- `docs/kt01-markdown-evidence/preview-management.md`
- `docs/kt01-markdown-evidence/preview.log`
- `docs/kt01-markdown-evidence/preview.pid`
- `docs/kt01-markdown-evidence/red.log`
- `docs/kt01-markdown-evidence/static-security-scan.md`
- `package-lock.json`
- `package.json`
- `src/lib/markdown.js`
- `src/pages/markdown/index.astro`
- `tests/fixtures/markdown-attacks.js`
- `tests/markdown-safety.test.js`
- `tests/markdown.test.js`
