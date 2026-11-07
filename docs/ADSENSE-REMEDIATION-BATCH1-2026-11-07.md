# 低价值内容首批整改｜2026-11-07

本轮为负责人审查的本地候选；未 push、未部署、未提交 AdSense 复审，不声称过审。所有代码、命令和测试均在 `/home/ubuntu/website/keisantool` 执行；独立 Playwright 浏览器访问该远程主机上的预览，没有在 Hermes 本地实现代码或运行项目测试。

## 基线、保护和回滚

- 开始时 HEAD、本地 origin/main 均为 `6d129f2ee03185c52e13189b89b51b7a958e9d45`，工作区干净；随后 `git ls-remote origin refs/heads/main` 也返回同一 SHA。没有覆盖未知修改。
- 备份分支：`backup/adsense-batch1-2026-11-07-6d129f2`。
- 实现分支：`fix/adsense-remediation-batch1-2026-11-07`。
- 当前未发布，放弃候选只需返回原分支或备份分支；须先保护任何后续未提交修改，不执行强制重置。若以后合并发布，按本批提交逆序 revert 后走既有发布流程，恢复基线内容；不 force push。
- 已读 AGENTS、PROJECT、GROWTH、README 发布流程、最近内容改善和 11-06 收敛记录、日语发布记录及 lastmod 脚本。

## 实际改动

### A：星座主工具和 78 个结果页

矩阵 144 个原生链接保留真实明细 URL 和逐组合可访问名称。普通点击／键盘 Enter 在本页回填两个选择器、清空旧生日、更新结果并把焦点移到结果。Ctrl／Meta 等修饰点击仍使用链接默认行为；无 JS 直接进入原明细页。结果按钮与矩阵说明改称“计算结果・角度明细”，不再承诺个别的“详细相性”。明确同距离同分、7 种判定、本站独自点数及非关系成功率。

78 页去掉每页 11 个组合推荐链接，保留回填主工具比较的入口。没有新增恋爱模板、组合页，未改变评分算法。

### B：15 个日出日落城市页

访问时复用现有 `japanDateParts`，按 JST 初始化输入与结果标签。输入其他日期后标签明确选中日期，清空／无效日期撤下旧值和分享结果。静态 HTML 明称构建时“基准日”，结果直接可见；无 JS 禁用日期输入并解释静态值，避免改变输入却误看旧结果。

直接展示计算数据中的注册纬度／经度，保留原 `listCities()` 返回接口，通过只读坐标函数获取数据；明确海拔 0m、不是某个已核验观测设施、坐标小数位不代表精度。去掉所有城市通用的“约 1 分”页面承诺，保留 NOAA／国立天文台来源。年度表明确是静态基准年、每月 1 日／15 日摘录，不随输入跨年切换；输入日期作为 JST 暦日处理。未变更天文算法。既有东京四日期的 ±1 分 fixture 仍原样保留，它不能推定所有城市／年代精度。

### C：犬龄文章及必要工具说明

补齐现有两区分式：小型／中型 1 岁 15、2 岁 24、之后每年 +4；大型 1 岁 12、2 岁 19、之后每年 +7。增加三体格同为 5 岁的完整算式与结果 36／36／40，以及 0、0.5、1、1.5、2、2.5 岁的插值和向下取整边界。

标签明确小型 ≤10kg、中型 >10kg 且 ≤25kg、大型 >25kg，25kg 不再同时落入两种描述。保留实际犬龄算法不变。说明体重区分是本站输入目安，AAHA 生命周期资料不是本公式科学背书；保留既有兽医咨询边界，不新增诊疗建议。文章 updatedDate 反映内容修改，reviewedDate 保持 2026-10-10；reviewScope 区分历史外部资料核对和本次实现对照，没有把构建日冒充来源复核日。

## RED → GREEN 和自动验证

原有断言未修改／弱化。新增 `tests/adsense-batch1.test.js`，执行实际 Astro 客户端脚本（最小 DOM 桩），而非复制客户端算法。

1. 实现前：`TZ=America/Los_Angeles npx vitest run tests/adsense-batch1.test.js`，10 项失败。缺少矩阵增强事件、明细命名／推荐路径、JST 输入与标签、坐标／静态基准说明、犬龄可复算表和边界。原始输出：[red.txt](adsense-batch1-evidence/red.txt)。
2. 无 JS 结果可见／禁用日期的追加检查先失败：1 失败、9 通过，再实现修复。[red-nojs.txt](adsense-batch1-evidence/red-nojs.txt)。
3. GREEN：上述新增测试 + hinodeiri／japan-date／pet-age／seiza-aisho，5 文件、75 项通过；明确使用洛杉矶 TZ 覆盖 JST 14:59:59→15:00、12-31→01-01、选中闰日和清空日期。[green.txt](adsense-batch1-evidence/green.txt)。
4. 全量 `npm test`：115 文件、1,956 项通过。[日志](adsense-batch1-evidence/npm-test.txt)。
5. `npm run build`（含 prebuild、postbuild 站点质量检查）通过：565 HTML、477 sitemap URL、24,103 站内链接、533 片段链接。[日志](adsense-batch1-evidence/build.txt)。
6. `git diff --check` 通过。项目未配置单独 lint／typecheck，未虚报此类检查。运行环境 Node 26.8.1、npm 11.19.0；CI 配置为 Node 22，本轮没有运行 GitHub CI。

## 远程浏览器证据

使用 Playwright MCP 独立浏览器访问 `http://100.118.62.48:4397`，不是生产域名。1440×900 和 390×900 实际执行：

- 矩阵鼠标点击鱼座×牡羊座 → 62 分；聚焦牡羊座×狮子座后 Enter → 92 分；URL 留在主工具、选择器对应输入、焦点到结果、明细链接正确、无页面横向溢出。该次页面脚本错误为零。[矩阵原始结果与操作代码](adsense-batch1-evidence/browser-matrix.json)。
- 洛杉矶时区模拟 `2026-12-31T15:30:00Z`：默认 `2027-01-01`；选择 `2028-02-29` 后东京为 `06:12 〜 17:36`，日期标签同步；表仍诚实标明 2026 年；清空为“―”。
- 犬龄工具逐个选择三体格、输入 5 岁，读到 36／36／40；再读取文章渲染表逐项对照。两种宽度无页面横向溢出。
- 禁用 JS、390px：星座矩阵使用 Enter 进入 `/seiza-aisho/ohitsuji-uo/`；东京基准日结果可见、输入禁用、静态文案不称“本日”。[日期、犬龄、无 JS 原始结果与操作代码](adsense-batch1-evidence/browser-results.json)。
- 构建产物逐项核对 15 城市实际坐标／静态基准输入、78 个结果页 canonical／noindex／无推荐循环：[静态核对](adsense-batch1-evidence/static-checks.json)。

## URL、规模和生成文件

本轮实际改变 96 个既有页面：星座 hub 1 + 结果 78 + 城市 15 + 犬龄文章 1 + 犬龄工具 1。565 HTML／477 sitemap URL 与基线相同。所有现有 URL、canonical、66 对逆序的 132 条 301、noindex 及 sitemap 排除规则保留；未改路由生成、重定向或索引配置。站点质量检查继续验证目标存在和无跳转链。

prebuild 逐项检查 `public/llms.txt`、2026／2027 的 work-calendar JSON／CSV 和 holidays ICS，与基线无差异，未混入其他生成文件。`dist/` 不提交。lastmod 按先提交实质修改、再运行 `node scripts/update-lastmod.mjs`、核查差异并单独提交的现有流程执行；最终记录见下方。

## 预览、现有生产机制和未决项

预览服务在本机 `0.0.0.0:4397` 提供 `dist/`，浏览器已验证该内网地址可达：

- http://100.118.62.48:4397/seiza-aisho/
- http://100.118.62.48:4397/hinodeiri/tokyo/
- http://100.118.62.48:4397/blog/inu-nenrei-no-kakikata/

访问需要到该主机的内网连通性，服务生命周期受当前运行会话限制。4321 端口已有其他项目占用，没有终止或更改它。静态预览不执行 Cloudflare `_redirects`，不把本轮预览当线上 301 验证。

现有生产发布：GitHub main → Cloudflare Pages Git 集成，`npm run build` → `dist/`；GitHub Actions 在 main push／PR 运行 npm ci、npm test、npm run build，仓库工作流本身不部署，不能据此推断 Pages 必定等待 Actions。README 配置记录 Node 22，本轮没有复核云端设置。没有执行 push、wrangler deploy、索引提交或账号操作。

下一优先级为负责人审查此候选；获准发布后按既有机制发布精确提交，并复验线上旧 URL 301／目标 200、日期交互和主工具比较。没有新 GSC／GA4 效果窗口，也没有 AdSense 过审结论。超范围记录：日出日落 hub 自身的日期／精度说明不在此次 15 城市范围，后续宜独立核查；不在本轮扩改。全城市／全年误差及远年代精度未独立验证，页面已明确边界。
