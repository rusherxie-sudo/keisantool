# 2026-11-08 夜间候选交付（未部署）

独立worktree：`/home/ubuntu/website/keisantool-overnight-20261108`；分支 `candidate/overnight-20261108`，基线为用户指定且只读远端核实的 main `dead3514689640200556647c58a26add3c667927`。没有push、部署、外联、广告复审/启用、GSC/IndexNow写入或统计后台/账号修改。所有实现只待审。

## 实际完成

- KT-02：60篇文章逐篇全文审读，记录路径、已读、hash、实际问题、保留理由与未验边界。国保补练马2026全年四区分完整算例233,179円；相关文章推荐按分类及共享任务工具排序；六曜补国会图书馆依据与中国农历实现边界。既有出生年任务匹配、六星五篇分工、水分模型限制与星座/犬龄/15城整改保留，不凑字数、不扩页或删URL。
- KT-03：118项年度/法规敏感资产清单，含47地区工资（复用11/5官方最终表）、税社保、日历与下载依赖；列官方来源/其他参考、适用年、生效日、核验范围、维护触发与重建范围。未找到可确证的生产2027误套2026制度值，不擅改金额。住民税年度与所得年、保险控除“令和8年分以后”分别处理。
- 定向逻辑修复：日出hub按JST初始化、显示所选日期、清空撤旧结果，去掉全城市全日期±1分钟已验的错误保证；水分拒绝Infinity。公共结果事件、分享复制与营业日嵌入复制隔离统计异常，功能不因这些可选事件失败而误报。
- KT-09：真实试用日数/营业日任务链，仅补nissu到公司休日CSV和银行营业日的明确入口。没有重造现有工具。
- KT-11：独立可运行日用品原型在 `docs/prototypes/unit-cost/`，未接Astro路由。支持容量+每次用量、单位边界、现金支出/积分分离、零值/无效输入。用完期限为未证需求的实验，未做真人访谈或目标用户验证。
- KT-07/13/14/17：测量口径方案、资料准备/资格审查与广告未就绪门禁已列明；当前事实入口纠正线上/候选状态，历史记录保留。KT-01旧“待发布”标签标历史；六星/工资/银行/年龄不再当待开发。

## 实测结果

Node：`/tmp/keisantool-node22/node-v22.23.4-linux-x64/bin/node`，`v22.23.4`，官方SHASUM校验后使用，与CI Node22对齐。`npm ci`成功。逻辑变更先RED再GREEN，含日出/测量异常/非有限值、推荐纯函数、原型与微小正需求边界。

上一冻结点873b2b6完整 `npm test`：**119文件、1,996测试通过**。该冻结点 `npm run build` 成功；postbuild检查 **565 HTML、477 sitemap URL、24,106内链、534锚点**。无独立lint/typecheck配置，不虚报。构建后的 `public/llms.txt` 和现有下载生成物与提交版本无差异，不混入无关生成物；页数未增加，原型未入生产路由。

Chromium桌面1440×900、手机390×900共20组检查通过，并在最终dist本地服务复验：六星、住民税、营业日、年末调整、勤续、日出hub，及国保/相关推荐/六曜来源/水分渲染/原型。验证条件→计算→清空、Tab、真实CSV保存核内容、原生Clipboard写入、独立结果接收页恢复；无社交发送。公司休日使2026/9从标准19变18营业日；无效2/30撤结果并禁下载。JST跨年、闰日和原型单位/0值/无效边界通过。截图及可复现脚本在证据目录。

开发预览首轮20组通过后，最终dist用原生Clipboard复验时，脚本未等待异步写入导致5组提前读取失败；补等待后重跑通过，保留首轮失败证据。原型隐藏CSS缺陷与统计导致复制假失败均保留RED与修复证据。非本地网络（GA/字体/百度）全部主动拦截，不把拦截当运行错误，也没有将客户端桩当真实GA DebugView/报表验收。

## 未满足、跳过与外部阻塞

- 60篇已全文审读不等于每条事实重新联网认证；指定的独立24篇审计文件未定位，实际复用了10/10与11/7报告及代码，没有冒充复用。六曜日本旧历全期、天文全城市全日期、部分给付官方原始金额证据仍待补。
- 年度资产清单已列现有依赖，但云端年度重建调度、全部地方制度差异和所有PDF/Excel实际打印/重算兼容性未验。未来制度未知保持unknown，不能拿构建日充核验日。
- npm ci/只读npm audit报告13项既有依赖告警（1 critical、9 high、2 moderate、1 low），包含Astro。package.json/package-lock.json与基线一致；已完成一次只读影响分级，保留critical及精确公告，见kt06-followup.md的5行记录；静态产物未见生产Node图像服务入口，构建/客户端触发条件仍部分未知。未执行audit fix/升级，待单独批准。
- 本轮为Chromium抽样；未做全站/全键盘/屏幕阅读器、原生手机或全浏览器验收。其他页面直接gtag调用未全面隔离，测量文档列出后续范围。真实GA DebugView仍未验，配对完成率分母不可得，不报完成率。父进程已取得官方只读GA数据，见下方补证。
- KT-12食谱继续暂缓；KT-16等待获批授权。KT-05/08/10/15已由父进程定义并完成各自可执行范围，非需求缺失；KT-10此前已完成，KT-08固定31页/37词基线等待成熟数据，KT-15台账19条且README接既有周五入口，不改cron。管理产物由父归档，本地不重做；KT-06见下方补修。
- 分发只准备检查；Manegy士业资格不自称满足，bizocean接收第三方资料规则未知，4渠道未外联。广告内容/隐私/CMP/真实抓取门禁不足，只列检查，未称通过或操作账号。

## 冻结与证据

实质修改提交 `0d8eddafe055115522eb80e271c211ed70b8f3e4`，父提交dead351；随后运行update-lastmod并单独提交 `873b2b6663c3812bee82f933ac2f1a00f2c47356`。manifest除了本轮改动，也补回基线Markdown/package三个既有提交日期，均来自git历史，不是事实核验日。该SHA为上一轮测试/构建代码冻结点；本次定向补修另有冻结点9a3c221，见下方。

最终交付HEAD及父提交、远端main复核、原工作区状态和保护文件hash见 [final-state.json](overnight-20261108/final-state.json)。该回执在最后证据commit后生成并留作未提交证据，避免提交自含SHA的循环；其余交付已本地提交。完整机器清单见 [results.json](overnight-20261108/results.json)（KT-01至17逐一）、[60篇审读](overnight-20261108/content-audit.json)、[年度资产](overnight-20261108/annual-assets.json)、[测试构建](overnight-20261108/final-validation.json)、[浏览器](overnight-20261108/browser-results.json)、[测量口径](overnight-20261108/measurement-review.md) 与 [分发/广告门禁](overnight-20261108/distribution-and-gates.md)。

明日最高优先：先审阅本候选的定向修复与原型，并单独评估Astro等既有依赖告警，决定是否进入另行授权的发布流程；广告动作继续等真实联系/CMP与抓取门禁确认。原型先找目标用户验证单次成本比较是否解决任务，用完期限继续保持实验，不自动转正式开发。

## 本次KT06定向补修与父进程补证

上一writer已结束，进入时仅本进程writer与既有未跟踪final-state回执；未知改动受保护。新增实现提交8135e67、manifest提交9a3c221。最终代码9a3c221完整测试 **120文件、2006通过**；build/postbuild成功，规模仍565 HTML/477 URL/24106内链/534锚点。无独立lint/typecheck脚本；diff --check通过。旧20浏览器组只引用873b2b6证据，不冒充新版本重跑。新增9项本地Chromium验证见[KT06结果](overnight-20261108/kt06-browser-results.json)。

KT06已证的是合成URL经百度u传输并200，不是实际用户泄漏。未取得可靠官方URL/referrer覆盖API契约，采用保守加载：仅干净静态文章/分类/说明页保留百度，工具页、当前query/hash或参照query/hash均不加载；不改location、不清分享hash、不改后台。真实官方脚本29900字节原样本地回放；干净文章首个和后续hm.gif的u/su无哨兵；其他测试页无百度请求，全部上报本地拦截，无生产测试事件。**静态页加载后被任意history/hash改址的安全未验，不宣称全链闭环。** related_content_click去参，相关动态统计抛错隔离。住民税本有resident-tax；BMI补首次有效结果入口，两页仅加精准分享提示，不新定义业务成功。生日/住民税/BMI重算清空及统计抛错、BMI离线22.5、分享fragment真实恢复18日通过。[具体差异与未验边界](overnight-20261108/kt06-followup.md)保留内容对照、范围外建议和依赖分级；未重印60篇或扩大内容整改。

父进程本轮官方只读事实同步（本地未重跑研究）：GA 13业务请求全200，property541868330、stream15081689041、Asia/Tokyo；tool_slug未注册且Metadata不可查；enhancedMeasurement stream/pageChanges/outbound/fileDownloads均true。10-11至11-07 calculator_result_view 14748次、9940事件参与会话，不能当完成率。Google官方URLInspection首页/rokusei/juminzei/eigyoubi均PASS已索引、允许抓取、canonical一致，仅代表已知索引版本非本候选；sitemap errors/warnings0、lastDownloaded 11-07T12:55:38Z，477submitted不是收录数；Bing逐页未知。www仍NXDOMAIN，robots/sitemap本轮200，不改DNS。

AdSense已登录pub-1382715204285550，网站列表搜索keisantool.com无结果，四状态筛选均未选；**不能称正在审核**，新增/验证/申请/复审均未执行。候选不等于线上。原工作区HEAD/未知文件hash及本地origin/main仍与进入时一致，详见最终回执；按禁止外联边界未重新fetch/ls-remote，远端服务器此时值未再查询，不虚报实时复核。

本次最高优先下一步：审阅本地KT06保守保护及其动态history限制，决定是否另行授权发布；依赖critical等单独评估，不扩本轮。其余父进程管理产物由父归档。
