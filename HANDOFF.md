# keisantool 交接文档

> 面向接手的新会话。读完这份 + `CLAUDE.md` 即可上手。最后更新：2026-08-04。

## 2026-08-01 流量增长执行状态

- 2026-08-26 恢复认证后已部署并提交积压现场（提交`a000156`：AdSense整改＋mitsudo空气密度＋hayasa秒速表），并录入宫崎（1,085円・8-25答申）与茨城（1,136円・8-24答申）的2026最低賃金地方答申（提交`a44e7c9`）；GA4 08-24 首次达到319 activeUsers（≥300），08-25 回落230，尚未连续3日达标。详细日志见 `docs/seo-growth-30d.md` 2026-08-26 条目。

- 2026-08-04 因 AdSense「低价值内容」拒审完成整站整改并部署：新增 `/editorial-policy/`，公开来源优先级、计算测试、生成AI、年度更新和订正方针；首页增加本站独特价值说明；全站显示实际最終確認日，博客作者框补简介与方针链接。`/seiza-aisho/<pair>/` 144个由7种模型扩展的程序化组合页暂设 `noindex,follow` 并排除 sitemap，hub 保持索引；404页同样 noindex。可索引 sitemap 收敛为404个URL，73个测试文件／1,505项测试全绿，1920／1440／768／375无横向溢出。正式部署预览：`14eb20b6.keisantool.pages.dev`，首页、编辑方针、rokusei、kokuho、博客、组合页均已抽查200，IndexNow已提交4个关键入口。重新申请前建议等待Google重新抓取 sitemap 与主要页面，不要立即恢复组合页索引。

- 2026-08-03 已新增并正式上线5个浏览器本地处理工具：`/csv-mojibake/`（UTF-8／BOM／Shift_JIS／EUC-JP／ISO-2022-JP判定、预览与转换）、`/denwa-format/`（日本固定电话／携带／050／0120／0800／+81格式化）、`/romaji-kana/`（かな与罗马字互转、ヘボン式／訓令式）、`/gakureki/`（早生まれ、浪人、留年、大学院、西历／和历）、`/nihongo-seikei/`（空白／空行／句读点／PDF折返改行整理）。共新增42项测试；全量基线为72个测试文件、1,492项测试，构建547页。Cloudflare预览为 `15acf0c5.keisantool.pages.dev`，正式域名5页均已确认200，IndexNow已提交新页、3个分类入口及llms.txt。后续大项目优先做日本邮编／地址标准化／地址解析共享数据工具簇，再接Excel姓名・地址・电话批量清洗。

- 30 天目标与每日迭代日志见 `docs/seo-growth-30d.md`；达标口径为连续 3 个完整自然日非 `openai` GA4 activeUsers ≥100。
- `/jisa/` 已由单一泛用页扩展为 12 个城市时差主题簇：动态路由 `src/pages/jisa/[city].astro`，城市数据和时差早见表函数在 `src/lib/jisa.js`。北半球、南半球、无夏时间及 30 分钟偏移均有测试。
- `/hinodeiri/` 已增加15个城市年度页；`/rokusei/` 已增加12个类型年度页，动态模板分别为 `src/pages/hinodeiri/[city].astro` 与 `src/pages/rokusei/[type].astro`。六星占术类型 URL 单一清单由 `fortuneTypes()` 提供，周期结果继续复用 `fortuneZone()`／`forecast()`。
- `/saitei/` 已按厚生劳动省令和7年度现行表重建，并新增47个都道府县页 `/saitei/<prefecture>/`。数据、有效日与全国加权平均的单一来源为 `src/lib/saitei.js`，页面共用 `MinimumWageCalculator.astro`；截至2026-08-01令和8年度金额仍在审议，不得写成已确定值。
- `/shukujitsu/` 与2025〜2029年度页已增加12个月全年日历、祝日／连休摘要和打印按钮；未来年度页会用 `officialHolidayYearLimit()` 自动标识正式公布与预测状态。
- `/neko-ninshin/` 已增加预计日倒计时、超声25〜35日／X光55日／第7周准备的个性化日历、9周时间表和权威来源；日期逻辑集中在 `pet-pregnancy.js` 的 `catPregnancyMilestones()`。
- `/rokusei-aisho/` 已上线六星占术双人生年月日相性诊断；固定地运分数复用 `tanjobi-aisho.js` 的 `rokuseiAisho()`，新组合层 `rokusei-aisho.js` 只负责双向汇总、等级与当年运气展示，天运不得混入固定相性分数。
- `/seiza-aisho/<pair>/` 的144个组合页已补全恋爱／友情／工作关系说明；关系文案由 `seiza-aisho.js` 的7种相位模型生成，同星座页标题与H1使用“○○座同士”直接匹配查询。
- `/zeizei/` 已修正含税内税逆算与多商品端数处理：`taxExcluded()` 先按税込×税率÷(1+税率)切捨内税，再以差额求税前；`sumItems()` 按税率＋税前／含税区分先汇总后各处理一次。消费税文章已删除轻减税率对象的错误扩张，并补齐国税厅／财务省来源。
- `/bmi/` 已接入厚生劳动省「日本人の食事摂取基準（2025年版）」的年龄别目标 BMI：18〜49岁 18.5〜24.9、50〜64岁 20.0〜24.9、65岁以上 21.5〜24.9。计算逻辑集中在 `bmi.js` 的 `ageTargetBmi()`／`ageTargetWeightRange()`；Deurenberg 体脂率推定仅对18岁以上输出，未成年人不得套用成人判定。
- `/shoubyou/` 已按协会けんぽ现行规则重建：输入支给开始日前平均标准报酬月额，按“÷30 后 10 円未满四舍五入、×2/3 后 1 円未满四舍五入”计算；连续3日待期后第4日起支给，连续休业的上限日按支给开始日起18个月计算。参保未满12个月时使用本人平均与32万円的低者，并支持休业中工资差额。旧版约60%、伪造5,000円级距、固定546日和再发延长等逻辑均已删除；配套文章也已同步纠正。
- `/hyoujun-hensa/` 已上线标准偏差计算工具，支持母集団 `STDEV.P`／標本 `STDEV.S`、Excel列粘贴、平均／分散／标准误差和逐值偏差表。核心逻辑在 `src/lib/hyoujun-hensa.js`，内部计算不得提前舍入；页面与 `/hensachi/` 双向串联。
- `/nissu/` 已扩展为日数／日付／期间／营业日综合工具：除总天数、周数与区间营业日外，`calendarDuration()` 按真实日历输出年・月・日，`shiftBusinessDate()` 从基准日次日／前日起排除土日和日本祝日计算N营业日后／前。年月日差不受“两端都包含”开关影响，营业日仍不含公司独自休业日。
- `/jikan/` 已上线时间计算工具，支持勤務时间／跨午夜时间差、某时刻前后、持续时间加减及时间与小数互转。核心逻辑在 `src/lib/jikan.js`，内部统一使用整数分钟；页面不自动判定法定加班，法律口径须以实际工作状态、单位规则与厚生劳动省资料为准。
- `/rieki-ritsu/` 已上线利润率／粗利率计算工具，支持原价与售价、追加成本、销售手续费、目标粗利率反推售价，以及营业／经常／净利润率。核心逻辑在 `src/lib/rieki-ritsu.js`；粗利率以售价为分母，加价率以成本为分母，两者不得混用。所有金额结果遵守全站约定 `Math.floor` 切捨，目标售价同时显示切捨后的实际达成率。
- `/tsubo-heibei/` 已上线坪・平米（㎡）换算工具，支持坪／㎡／帖相互换算、纵横面积和坪单价。核心逻辑在 `src/lib/tsubo-heibei.js`；坪以 `400/121㎡` 精确换算，帖仅按不动产广告 `1帖=1.62㎡` 作参考，交易与证明必须以㎡为准。
- `/heihoukon/` 已上线平方根・ルート计算工具，支持小数近似、整数根号简约、完全平方数、负数虚数和2〜100次方根。核心逻辑在 `src/lib/heihoukon.js`；`√a` 表示非负主平方根，方程 `x²=a` 的解才写作 `±√a`，负数偶次方根在实数范围不存在。
- `/heikin-chuouchi/` 已上线平均值・中央値・最頻値计算工具，支持Excel列粘贴、并列众数、排序频数表与五数概括。核心逻辑在 `src/lib/heikin-chuouchi.js`，复用 `hyoujun-hensa.js` 的解析与补偿求和；四分位数采用“奇数个时排除整体中央値，再分别取上下半组中央値”的学校统计口径，不等同于Excel `QUARTILE.INC` 插值法。
- `/bunsuu/` 已上线分数计算・分数电卓，支持分数四则运算、最小公倍数通分、约分途中式、仮分数／帯分数／小数／百分比显示和有限小数精确转分数。核心逻辑在 `src/lib/bunsuu.js`，所有分子分母使用BigInt精确运算；分母永远规范为正，整数限100位、小数限30位。
- 当前验证基线：72 个测试文件、1,492 项测试；生产构建 547 页。
- 2026-08-01 伤病手当金版本提交 `06332fd`，Cloudflare 预览 `2570d4e2.keisantool.pages.dev`。工具页与文章页在 GSC 均已收录，但上次抓取仍为7月9日／7月20日；人工重抓配额刷新后优先提交这两页，并在7〜14天后复查“傷病手当金 計算／条件／期間／退職後”等查询。
- 2026-08-01 标准偏差版本提交 `74165d5`，Cloudflare 预览 `c83c2dfc.keisantool.pages.dev`。新页在GSC仍为未知URL；配额刷新后优先请求首次抓取，2〜3天后复查收录，7〜14天后复查“標準偏差／求め方／計算／エクセル”查询。
- 2026-08-01 时间计算版本提交 `db7f184`，Cloudflare 预览 `3b606c02.keisantool.pages.dev`。新页在GSC仍为未知URL；配额刷新后优先请求首次抓取，2〜3天后复查收录，7〜14天后复查“時間計算／勤務時間／時間差／足し算／小数時間”查询。
- 2026-08-01 利润率版本提交 `6559d19`，Cloudflare 预览 `90ecb6d8.keisantool.pages.dev`。新页在GSC仍为未知URL，IndexNow已成功提交新页与相关入口；配额刷新后优先请求首次抓取，2〜3天后复查收录，7〜14天后复查“利益率／粗利率／原価率／目標売価／営業利益率”查询。
- 2026-08-01 日数计算增强提交 `d21498b`，Cloudflare 预览 `82612872.keisantool.pages.dev`。GSC确认页面已收录、canonical正确，上次抓取为2026-07-31；IndexNow已提交更新，7〜14天后重点对照Bing基线8,024展示／26点击／平均约第6位的CTR变化，并观察“期間計算／営業日計算／何営業日後”查询。
- 2026-08-01 坪平米版本提交 `d76efc7`，Cloudflare 预览 `65e4f506.keisantool.pages.dev`。新页在GSC仍为未知URL；IndexNow已成功提交新页与相关入口，配额刷新后优先请求首次抓取，2〜3天后复查收录，7〜14天后复查“坪 平方メートル 換算／1坪は何m2／平米 坪 計算／坪単価”查询。
- 2026-08-01 平方根版本提交 `a1f339d`，Cloudflare 预览 `e7156767.keisantool.pages.dev`。新页在GSC仍为未知URL；IndexNow已成功提交新页与标准偏差入口，配额刷新后优先请求首次抓取，2〜3天后复查收录，7〜14天后复查“平方根／ルート計算／平方根とは／根号簡約／n乗根”查询。
- 2026-08-01 出生年份页CTR实验提交 `1eda419`，Cloudflare预览 `26b25ec3.keisantool.pages.dev`。111个 `/umaredoshi/1900..2010/` 页统一把“年份生まれは何歳”和生日前年龄／生日后年龄前置，保留和历与干支长尾；1988页Bing基线为176次展示／0点击／平均约第7位。IndexNow已提交全部年份页；GSC确认1988页已收录但抓取早于本次修改，7〜14天后复查单页及目录整体CTR。
- 2026-08-01 平均值・中央値版本提交 `e956b8f`，Cloudflare预览 `a9c298e8.keisantool.pages.dev`。新页在GSC仍为未知URL；IndexNow已成功提交新页、标准偏差入口、生活分类和llms.txt，配额刷新后优先请求首次抓取，2〜3天后复查收录，7〜14天后复查“平均値／中央値／最頻値／四分位範囲／Excel”查询。
- 2026-08-01 GSC额度恢复后，已逐一确认 `/hyoujun-hensa/`、`/jikan/`、`/rieki-ritsu/`、`/tsubo-heibei/`、`/heihoukon/`、`/heikin-chuouchi/`、`/kinzoku-nensuu/`、`/yukyu-nissu/` 共8个Google未知URL成功加入优先抓取队列；`/nissu/` 与 `/umaredoshi/1988/` 已收录，未浪费额度重复提交。
- 2026-08-01 分数计算版本提交 `f40023b`，Cloudflare预览 `a1545d6d.keisantool.pages.dev`。正式域名连续6次稳定返回新版，IndexNow已提交新页、两条入口、生活分类和llms.txt；GSC当前仍为未知URL，下一次可用请求额度优先提交，2〜3天后复查收录，7〜14天后复查“分数の計算／分数電卓／通分／約分／帯分数”查询。
- 2026-08-01 概率计算版本提交 `f9a0748`，Cloudflare预览 `5d1c57bb.keisantool.pages.dev`。新增 `/kakuritsu/` 基本概率、nPr、nCr、n!与反复试行三个模式，使用BigInt保持情况数精确；IndexNow已提交，`/bunsuu/` 与新页均已成功加入Google优先抓取队列，2〜3天后复查收录。
- 用户文件 `src/content/blog/kokuho-ryoukin-keisan-hoho.md` 为未跟踪内容，增长迭代不得修改、删除或误提交。

## 0. 2026-07-18 最新改造

- 工具与博客已扩展：构建产物为 381 页；博客分类统一为受控 slug，并补全对应分类页。
- `public/llms.txt` 改为构建前从 `src/data/tools.js` 自动生成，测试会校验所有 live 工具都被覆盖。
- 新增 `japan-tax-2026.js`、`japan-social-2026.js` 作为税务/社保规则的共享单一实现；所得税、年末调整、手取り和社保工具不再各自复制核心表。
- 令和7/8年度规则已加入边界测试：給与所得控除的 162.5万 / 180万 / 190万分界、基礎控除、復興特別所得税、厚生年金65万上限、雇用保険一般事業0.5%、介護保険40〜64歳本人負担0.81%。
- 社保/税务页面统一改为“概算”口径：加入支部、扶養、自治体、業種、賞与等未输入因素明确提示；年末调整不再把医疗费控除混入（应走確定申告）。
- 验证基线：`npm test` 52 files / 1142 tests 全绿；`npm run build` 成功，381 pages。

## 1. 这是什么

- **keisantool.com**：日本語の計算・変換ツール大全サイト。
- 目标：Google 日本自然搜索流入 → AdSense 变现。
- 纯静态站：**Astro** 构建 → **Cloudflare Pages** 部署。
- 计算逻辑 = Vanilla JS 纯函数（`src/lib/`），**vitest** 测试。
- Owner 用**中文**沟通；页面日文内容由 Claude 生成（Owner 不懂日文、无法校对——所以正确性全靠测试 + 对照日本权威法规）。

## 2. 命令

```bash
npm test            # 全量测试（vitest run）
npx vitest run tests/<tool>.test.js   # 单个工具测试
npm run dev         # 开发服务器
npm run build       # 生产构建 → dist/
```

部署（Owner 要求「改完直接部署」，不必每次问）：
```bash
npm run build
npx wrangler pages deploy dist --project-name=keisantool
```
- CF Pages 项目名：`keisantool`，正式域名 keisantool.com，每次部署给一个 `xxxx.keisantool.pages.dev` 预览URL。
- **注意**：本地 git 没有配置 remote（`origin` 不存在），所以 `git push` 会失败。部署走 wrangler，不走 git。commit 只是本地留痕。
- **部署后顺手催 Bing 收录（IndexNow，2026-07-04 起）**：新增/改动页面 build+deploy 后，跑一次 `python3 scripts/indexnow-submit.py`（不传参数=提交 sitemap 全部 URL；也可传具体 URL 列表只推增量）。key 文件在 `public/bdddcbdf5763d849cfc0e7486c209c24.txt`，别删。背景：07-04 发现 Bing 14 天只有 1 click/24 impressions，几乎没收录，查出站点从没配置过 IndexNow——纯靠 Bing 被动爬 sitemap 太慢，尤其这几天密集加了两百多个程序化页。

## 3. 当前状态（2026-07-04）

- **46 个工具全部 live、已上线**（口径：`grep -c "live: true" src/data/tools.js`——⚠️ 别用 `grep -c "slug:"`，`tools.js` 里 `categoryMeta`（8个分类hub页）也有 `slug` 字段，会把工具数算多8个，本轮两个并行会话都踩过这个坑，分别错报成47/50）。2026-07-03〜04 连续两天多个 worktree 并行上了三批内容：
  - **「相性」系列第一期**（07-03）：tanjobi-aisho / seiza-aisho / ketsueki-aisho 3 工具，其中星座相性含 **144 个程序化组合页** `/seiza-aisho/<sign1>-<sign2>/`。
  - **「年齢早見表」hub-and-spoke**（07-03，对标 nenrei-hayami.net 模式）：hub `/nenrei-hayami/`（明治元年〜今年 西暦×和暦×満年齢×数え年×干支 大表、SSR+print CSS，目标词「年齢早見表」1〜3月报税季峰值）+ spoke `/umaredoshi/<year>/` ×111 页（1900〜2010）。lib：`hayami.js`。基准年 build 时固定（`new Date().getFullYear()`），**每年 1 月 1 日重 build 续命**。
  - **「日本历法工具生态」续作**（07-04）：学年早見表 `/gakunen-hayami/`（`hayami.js` 的 `gakunenTable()`，复用 `schoolGrade()`）；和暦西暦早見表**全表化**（`/wareki/` 抜粋表换成明治元年〜今年全表，复用 `hayamiTable()`，删掉了原本脆弱的改元境界分支逻辑和一处硬编码 2026 的 bug）；六曜・大安カレンダー `/rokuyo/`（hub今月+48 spoke月页，**新依赖 `lunar-javascript`**，见下方踩坑）；祝日・連休カレンダー `/shukujitsu/`（hub今年+5 spoke年页，振替休日/国民の休日/ハッピーマンデー/春分秋分近似式全部自实现，无外部依赖）；日の出日の入り `/hinodeiri/`（NOAA 太阳位置式，全国15城市）。
  - 分支合并现状：`claude/brave-hugle-20c09b` + `claude/cool-visvesvaraya-c8c5c6` 两个 worktree 已于 07-04 合并回 `main`（此前只在生产部署层面合流，git 上 main 一度没有这两组代码——下次不知情从 main 部署会把页面冲掉，**已修复**）。合并后测试全绿。
  - GSC 催收录进度：年齢早見表组 10 个全催完（hub+1991/1985/1990/1980/1995/2000+1975/1973/1965）；相性组 3 个（hub+tanjobi-aisho+ketsueki-aisho，144 组合页靠 sitemap 自然收录不逐个催）；pet/金融组 5 个（seiri/neko-gohan/inu-vaccine/neko-ninshin/inu-ninshin）；历法生态续作 4 个 hub 页全催完（gakunen-hayami/rokuyo/shukujitsu/hinodeiri）；**07-09/07-10 两天又补催了 rokuyo/shukujitsu 的 spoke 页共 9 个**（rokuyo 2026-08/09/10/11、shukujitsu 2026/2027/2028/2029、seiza-aisho/futago-futago），07-09 那天催到 shukujitsu/2027 时打满配额、07-10 配额刷新后续完。诊断顺带确认 gakunen-hayami/umaredoshi-1995/hinodeiri 已自然收录，跳过没浪费配额。**剩余待催**：rokuyo 的 2025年及2027年以后、shukujitsu 的 2025 年、umaredoshi 111 页里只手动催过几个、seiza-aisho 144 组合页里只手动催过 1 个——量级很大，配额有限，够用就催，不追求手动催完所有程序化页（这些也一直在被 IndexNow 批量 ping，多数应该会靠 sitemap+IndexNow 自然收录）。
  - `RelatedTools`（`getRelated`，同分类优先）在两组内容合并后才生效串联：`rokusei`（全站流量占比最高页）现在正确关联到 seiza/tanjobi-aisho/seiza-aisho/ketsueki-aisho 这 4 个「占い・文化」同类工具——**提醒：并行分支若迟迟不合并到 main，RelatedTools 会一直导流到错误/次优的关联工具，是仅靠"生产环境已可见"发现不了的隐性成本**。
  - ⚠️⚠️ **教训（已发生2次，07-03 和 07-09）：并行 worktree 部署会互相全量覆盖生产，且不会有任何报错提示** —— `wrangler pages deploy` 是全量替换，不是增量。07-09 这次：另一个 session 从我合并 koyomi 工具*之前*的旧 main 检出，做了 GEO 审计相关工作后直接部署，把 rokuyo/gakunen-hayami/shukujitsu/hinodeiri/ads.txt 全部从生产环境静默冲掉（无 build 报错、无部署报错，只有实际访问才会发现 404）——是因为**用户催 GSC 收录时，Google 的 live test 报了 404** 才被发现的，凭空信任"部署成功=页面还在"是不够的。**新规矩：任何一次 `wrangler pages deploy` 之前，必须先 `git log HEAD..main --oneline` 检查 main 是否有本分支没有的新提交；有就先 merge 再部署。部署后至少抽查 3-5 个不同批次/不同 session 添加的页面返回 200，不能只测自己刚写的页面。**
  - ⚠️ **教训：多 agent 并行调研到的「官方数据表」也可能有转录错误**——07-04 做祝日库时，某个调研 agent 转录的 2026 年振替休日表漏了一格（5/6，憲法記念日5/3是周日应顺延），若直接信表会导致库输出少一天振替休日。后来用 JS Date 独立复算 + WebSearch 交叉核对3个独立信源（JR东日本媒体、JPX官方、9rando.info）才发现并订正。**只要是代码几秒钟能独立复算的事实（如星期几这类纯日历算术），即使来自"调研"也要自己再算一遍，不能照单全收**。
  - ⚠️ **技术选型：六曜/旧暦转换没有从零手写天文算法**，评估后选用 npm 包 `lunar-javascript`（6tail，MIT，GitHub 1500+ star，2025-11 活跃维护），用其 `.getLiuYao()` 官方六曜方法 + 12 个日本旧暦网站（benri.jp/arachne.jp）实测锚点（含2020/2023两个闰月年边界日）交叉验证全部吻合才采用。已知风险：库对 Date 对象用宿主本地时区取值——因此只用 `Solar.fromYmd(y,m,d)` 显式整数构造器，不传 Date 对象。
- 2026-07-02 做过一次四维全面 review（产品/代码/SEO/流量），修复清单见 §8 末条。
- **AdSense 接入中**：`public/ads.txt`（pub-1382715204285550）已于 2026-07-04 添加并部署上线（`https://keisantool.com/ads.txt` 可访问）。**尚未做**：页面里的广告脚本/`.ad-slot` 实际渲染代码（还没接 `ca-pub-...` 的 `adsbygoogle.js`），这两者是分开的步骤，ads.txt 只是给广告联盟验证的清单文件。此前 2026-07-04 数据复核认为站点仅上线约3周流量太小、建议暂缓申请——如果 Owner 现在推进 ads.txt，说明可能已决定尝试申请，后续如果要接实际广告位代码需另行确认。
- 依赖：`marked`（Markdown 工具）、`@astrojs/sitemap`、`lunar-javascript`（六曜・旧暦変換）。

## 4. 关键约定（必须遵守，详见 CLAUDE.md）

1. **TDD 强制**：先写测试 → 跑出 RED → 再实现 → GREEN。Owner 无法校对计算，测试是唯一正确性保证。
2. **金额端数一律 `Math.floor` 切り捨て**（整数円）。
3. **`src/data/tools.js` 是工具元数据的单一数据源**：新增工具先在这里注册（slug/nav/name/icon/category/short/live）。导航、首页卡片、关联链接全部引用它。
4. **SEO 每页必备**：唯一 `<h1>`、`<title>`、`<meta description>`、`<link canonical>`、JSON-LD(WebApplication)、`<html lang="ja">`、免責事項「計算結果はあくまで参考値です」。这些由 `ToolLayout.astro` + 各页 frontmatter 提供。
5. **日期处理**：用 UTC 正午基准（见 `src/lib/shussan.js` 的 `toDate/toISO/addDays`），避免时区/夏令时跨日 bug。
6. **法规/数值每年要复核**：日本税制·社保每年 4月/8月 改定。已知踩过的坑见第 8 节。

## 5. 全工具清单（67个，按分类；下表部分行是犬猫成对工具合并展示，行数≠工具数）

| 分类 | slug | 工具 |
|------|------|------|
| 税金・お金 | zeizei | 消費税・割引（含複数商品合算） |
| 税金・お金 | kotei-shisan | 固定資産税（土地/家屋分离+新築減額） |
| 税金・お金 | kokuho | 国民健康保険料 |
| 税金・お金 | saitei | 最低賃金（全国一覧 + **47都道府県スポーク** `/saitei/<prefecture>/`、月給時給換算） |
| 税金・お金 | wariai | 割合・パーセント・比率（含増減率/歩合） |
| 健康・身体 | bmi | BMI・体脂肪率（含多档目标体重） |
| 健康・身体 | calorie | カロリー・基礎代謝（国立健康栄養研究所式/HB式可切） |
| 健康・身体 | hensachi | 偏差値（含从分数列表自动算SD） |
| 生活・日常 | hyoujun-hensa | 標準偏差（母集団／標本、分散、偏差明细） |
| 生活・日常 | heikin-chuouchi | 平均値・中央値・最頻値（并列众数、五数概括、四分位数） |
| 生活・日常 | kakuritsu | 確率・順列・組み合わせ（基本概率、nPr、nCr、n!、反复试行） |
| 生活・日常 | shussan | 出産予定日（含逆算+妊娠月数） |
| 生活・日常 | yakudoshi | 厄年チェッカー（含和暦早見表SSR） |
| 生活・日常 | kyuyo | 給与・残業代（含自动时给+分类残業） |
| 生活・日常 | jisa | 時差計算（任意日時変換、DST正确、12个城市对静态落地页） |
| 生活・日常 | gasoline | ガソリン代（含割り勘） |
| 生活・日常 | saniku | 産休・育休（含出生後支援+13%等2025新制） |
| 生活・日常 | nenrei | 年齢計算（満年齢/数え年/学年/干支） |
| 占い・文化 | rokusei | 六星占術・大殺界（hub + 12类型年度页 `/rokusei/<type>/`，复用周期算法） |
| 占い・文化 | rokusei-aisho | 六星占術 相性診断（双方生年月日、地運双向评分、当年天運分开展示） |
| 占い・文化 | tanjobi-aisho | 誕生日相性診断（数秘術45对判定表+六星地運双向，総合=floor平均） |
| 占い・文化 | seiza-aisho | 星座相性診断 hub + **144程序化页** `[pair].astro`（エレメント×アスペクト7档） |
| 占い・文化 | ketsueki-aisho | 血液型相性診断（10无序对判定表+16方向性评语，单页tab型） |
| 文字ツール | moji | 全角半角・かな・文字数カウント（含字节/原稿用紙/X文字数） |
| 変換・ツール | color-code | カラーコード変換（HEX/RGB/HSL+取色器+抵抗カラーコード） |
| 変換・ツール | heihoukon | 平方根・ルート計算（根号简约、完全平方数、负数、n次方根） |
| 変換・ツール | tani | 単位変換（長さ/重さ/面積/体積/温度/速さ） |
| 変換・ツール | tsubo-heibei | 坪・平米（㎡）換算（坪／㎡／帖、纵横面积、坪单价） |
| 変換・ツール | wareki | 和暦・西暦変換（改元边界精确+早見表） |
| 開発者ツール | base64 | Base64 エンコード/デコード（UTF-8安全） |
| 開発者ツール | json | JSON 整形・圧縮 |
| 開発者ツール | urlencode | URL エンコード/デコード |
| 開発者ツール | regex | 正規表現テスト |
| 開発者ツール | markdown | Markdown → HTML（用 marked） |
| 税金・お金 | loan | 住宅ローン返済（元利均等/元金均等） |
| 税金・お金 | fukuri | 複利・積立シミュレーター |
| 生活・日常 | nissu | 日数計算・日付計算 |
| 生活・日常 | nenrei-hayami | 年齢早見表（明治〜今年SSR大表+print、spoke=/umaredoshi/1900..2010） |
| 健康・身体 | seiri | 排卵日・生理日計算（周期15〜60日限定） |
| 占い・文化 | seiza | 星座調べ（誕生日→12星座） |
| 開発者ツール | password | パスワード生成（crypto、各文字種保証） |
| ペット・動物 | inu-nenrei / neko-nenrei | 犬猫の年齢人間換算（環境省式） |
| ペット・動物 | inu-gohan / neko-gohan | ごはん量（RER=70×kg^0.75×係数） |
| ペット・動物 | inu-ninshin / neko-ninshin | 妊娠期間（犬63日/猫65日） |
| ペット・動物 | inu-vaccine / neko-vaccine | ワクチンスケジュール（WSAVA・狂犬病予防法） |
| 生活・日常 | gakunen-hayami | 学年早見表（生まれ年度→学年、hayami.js の gakunenTable） |
| 生活・日常 | rokuyo | 六曜カレンダー hub + **48スポーク** `/rokuyo/<year>-<month>/`（lunar-javascript 依存） |
| 生活・日常 | shukujitsu | 祝日・連休カレンダー hub + **5スポーク** `/shukujitsu/<year>/`（振替休日・国民の休日自前実装） |
| 生活・日常 | hinodeiri | 日の出・日の入り時刻計算器 hub + **15城市スポーク** `/hinodeiri/<city>/`（NOAA太陽位置式、年間早見表） |

分类（`tools.js` 的 `categories`）：税金・お金 / 健康・身体 / 生活・日常 / 占い・文化 / 文字ツール / 変換・ツール / 開発者ツール / ペット・動物。注意：**hensachi（偏差値）在「生活・日常」**（2026-07 从健康・身体移出）。

## 6. ~~PC 桌面布局拥挤~~（✅ 已解决）

> 2026-06-25「Clear Pocket Calculator」全站改版落地：已废弃两栏 grid，统一为单栏居中 + `wide` 铺宽两档。现行布局规范见 `CLAUDE.md`「架构大图」。以下保留为历史记录。

### 现象
1440px 等大屏下，很多工具（尤其内容多的：**markdown / regex / json / color-code / tani**）被压在左侧很窄的区域里，右边大片空白浪费，编辑区/多栏内容挤成一团，非常局促。

### 根因
`src/styles/global.css` 里给工具页设了**固定的两栏布局**（约第 132 行附近的 `@media (min-width:1024px)` 块）：
```css
.page-wrapper:not(.wide){ display:grid; grid-template-columns:560px 1fr; gap:0 40px; }
.calc-card{ max-width:560px; ... }   /* 计算卡被钉死 560px */
```
- 这个「左 560px 计算卡 + 右 howto」对**简单计算器**（zeizei/bmi 等）效果不错；
- 但对**编辑器型/多栏型工具**（markdown 左右编辑+预览、regex 大文本框、json、color-code 三tab、tani）来说 560px 太窄，被严重挤压。

### 建议修复方向（任选其一，倾向 A）
- **A. 给 ToolLayout 加布局档位**：`ToolLayout.astro` 已支持 `wide` prop（首页在用）。给内容多的工具页传一个「宽布局」标记 → 这些页面用**单栏全宽**（calc-card 放宽到 ~900px 或 100%，howto 放下方），简单工具维持现有两栏。需要改 `ToolLayout.astro` + global.css + 给 markdown/regex/json/color-code/tani 等页面加标记。
- **B. 让 calc-card 宽度弹性**：不再钉死 560px，按内容/容器自适应（如 `min(100%, 720px)`，宽工具更宽），两栏阈值上调。
- 改完务必在 1440 / 1280 / 768 / 375 四个宽度各截图验证（用 preview 工具），别只测一个尺寸。

## 7. 其他待办 / 未来方向

- **Semrush 调研已做过**（JP市场）。结论：
  - 已做完的高价值：年齢計算(12万)、カラーコード(40万/KD16%)等。
  - **暂缓**：`シルエットクイズ`（剪影游戏）——CPC≈0、ポケモン有IP风险、需大量剪影素材、偏离定位。
  - **単位変換 CPC≈0**（已做，变现低，属铺量）。
  - 开发者工具（Base64/JSON/正規表現等）**变现低**（程序员开广告拦截），已做、属铺流量，别期待高 RPM。
- Semrush 走法：**Semrush MCP 已移除（账户 API 额度耗尽），统一用 `semrush-chrome` 技能**经 `sem.3ue.co`（GURU代理）Chrome 自动化采集；数据库选 JP。
- 各工具仍有竞品功能可深挖（见各工具竞品差距，之前审查报告里有），但优先把第 6 节布局修了。

## 8. 重要历史决策 & 已踩的坑

- **祝日年度页的正式公布边界（2026-08-01）**：`calendarMonths(year)` 只负责把 `holidays(year)` 转成日曜始まり、每月6周固定的视图数据，页面不得另写祝日。内阁府与国立天文台在每年2月公布下一年度，`officialHolidayYearLimit(referenceDate)` 因此在1月只返回当年、2月起返回翌年；超过该范围的春分・秋分必须明确标成预测值，不能使用“最新版／正式”措辞。年度页当前覆盖今年前1年至后3年，每年构建时自动滚动。
- **最低賃金的年度状态与换算口径（2026-08-01 修复）**：`src/lib/saitei.js` 保存厚生劳动省令和7年度47都道府县现行金额和生效日，全国加权平均为1,121円；截至2026-08-01令和8年度仍在中央最低賃金審議会审议，正式答申和各地决定前不得写预测金额。月给检查必须使用“月给×12÷年间所定劳动日数÷1日所定劳动时间”，并提醒从比较工资中排除临时工资、奖金、精皆勤／通勤／家族手当及时间外等割增工资。动态路由 `lastmod` 映射在 `src/lib/lastmod.js`，新增或改 slug 时同步测试。
- **消费税内税与端数口径（2026-08-01 修复）**：`taxExcluded()` 不得先切捨税前价再把差额当税；必须按“税込价格×10÷110”（8％为×8÷108）切捨内税，再用税込－内税得税前价。`sumItems()` 不得逐商品切捨；按同税率和同输入区分汇总后处理一次。若将来实现正式发票模式，应进一步按“每张发票、每税率一次”建模，不能把普通购物合计和适格请求书规则混成多个逐行结果。
- **日出日落城市页的单一计算源（2026-08-01）**：`/hinodeiri/<city>/` 的年度表必须由 `cityYearTable` 调用 `hinodeIri` 生成，不能另写静态时刻；当前每月1日／15日共24行，代表性与页面体积平衡。NOAA 近似式与国立天文台公布值允许约±1分钟差异。新增城市时只改 `CITIES`，静态路由、汇总页入口和城市内链都会由 `listCities()` 派生；动态路由的 `lastmod` 映射在 `src/lib/lastmod.js`。
- **割合计算的三种未知量（2026-08-01）**：`wariai.js` 分别用 `percentOf` 求“部分占整体几%”、`valueFromPercent` 求“整体的○%数值”、`baseFromPercent` 从“部分＋百分比”逆算整体；第三种在百分比为0时必须返回 `null`，不能与“整体的0%=0”混为一谈。页面模式数量会继续变化，title／说明不得再硬编码“○種類”。
- **ガソリン代的行程与实燃费口径（2026-08-01）**：`calcTripSummary` 统一用“1回距离×往返倍率×次数”计算通勤与旅行，燃料费保持未取整到加完附加费用后再 `Math.floor`，不能用已切捨て的单次金额累乘。`calcFuelEconomy` 用满坦法“给油间距离÷本次给油量”反算 km/L；页面固定价格只作演算示例，实际输入不得冒充当前全国油价。
- **出生年份页的年度答案（2026-08-01）**：`/umaredoshi/1900..2010/` 的 title、H1 与 11 年早见表由构建时 `BASE_YEAR` 和 `ageYearTable` 统一生成；每年 1 月必须重新构建部署，避免搜索摘要仍显示上一年。出生当年的诞生日前年龄必须夹紧为 0，静态路由范围必须复用 `UMAREDOSHI_FROM`／`UMAREDOSHI_TO`，不能再写独立硬编码。
- **博客免责声明按分类输出（2026-08-01）**：`src/pages/blog/[slug].astro` 不再对所有文章硬编码税理士／社会保险劳务士。`health` 指向医师／管理营养师，`pet` 指向兽医，税务与社保四分类保留税务专业人员，其他分类使用通用官方信息提示；新增分类时应同步判断是否需要专属免责声明。
- **日数计算的日期与营业日口径（2026-08-01）**：`src/lib/nissu.js` 统一以 UTC 正午解析严格的 `YYYY-MM-DD`，不存在的日期必须返回无效；月／年偏移采用目标月份末日夹紧（如 1月31日＋1か月→2月末）。营业日复用 `src/lib/shukujitsu.js` 的法定假日数据，页面示例也由 `dateRangeBreakdown` 服务端生成，不能另写一套静态数字。当前假日表覆盖 2024〜2027 年，扩展更远年份前必须同步补数据与测试。
- **割り勘端数与倾斜配分（2026-07-31）**：`src/lib/warikai.js` 是均等割り、幹事补差和グループ倍率的单一计算源；金额输入先 `Math.floor` 为整数円，端数单位仅允许 1／10／100／500／1000 円。页面的 48,000 円示例也必须由 `calcWeightedWarikai` 服务端生成，不能手写另一套结果。`.calc-panel` 全局默认隐藏，工具页容器必须带 `active`，否则只显示模式栏而不显示输入区。
- **犬の妊娠期間の基準点（2026-07-31 修复）**：旧 `/inu-ninshin/` 把「発情休止期開始から 56〜58 日」と「最初に交配を受け入れた日から 58〜72 日」の资料混在，页面和 `pet-pregnancy.js` 错写为交配日＋56〜72日。现按 AKC／Merck 的首次交配基准修正为 58〜72 日，中心日仍按 JKC 换算表为＋63日。以后新增排卵日、LH 峰值等输入时必须分别建模，不能把不同起算点的范围共用。
- **住民税与共享工资所得控除（2026-07-31 修复）**：旧 `/juminzei/` 把都道府县民税／市町村民税写反为 6%／4%，遗漏均等割与森林环境税，并让配偶者控除和配偶者特别控除重复、给 16 岁以下扶养控除；已按令和 8 年度重写。另发现 `japan-tax-2026.js` 在年收 162.5万〜190万円仍沿用旧分段，导致控除低于改正后的最低 65 万；现改为 190 万以下一律最低 65 万，660 万以下按国税厅别表第五的 4,000 円单位计算。以后不要把“收入×分段百分比”的简化式重新复制回工具。
- **国保 給与所得控除**：必须用**令和7改正表**（最低控除 65万、适用到年收190万）。旧令和6表(55万)会高估保险料——这是修过的线上真bug。`src/lib/kokuho.js`。
- **産休育休**：已含 2025年4月新制「出生後休業支援給付金 +13%」、育休給付金賃金日額上限(16,110円，令和7年8月值，**每年8月需更新**)。`src/lib/saniku.js`。
- **時差 DST**：`src/lib/jisa.js` 的 `getOffsetMinutes/convertWallClock` 用 `toLocaleString` 两次相减，DST 自动正确；`JAPAN_TIME_PAIRS` 为 12 个城市页的单一数据源，`getJapanTimeProfile` 用 1月／7月代表日区分南北半球，实际任意日期仍由 IANA/Intl 规则计算。已测试东京vs纽约夏令时+13h、悉尼反季节、夏威夷跨日前日、印度30分钟偏移。
- **`live` flag 不过滤**：导航/首页**不按 live 过滤**（`SiteHeader.astro` 和 `index.astro` 都是全渲染）。当前 24 个全 `live:true`。若想用 live 真正隐藏，需要自己接过滤逻辑。
- **calorie 公式**：默认用「国立健康・栄養研究所式(Ganpule)」，HB式可切换。
- **导航**：已是分类下拉式（`SiteHeader.astro`：PC hover/点击展开，移动端汉堡+手风琴）。工具再增多也不会挤爆导航。
- **浮动分享**：`FloatingShare.astro` 全站右下角 FAB，移动端优先 `navigator.share`。
- **相性系列（2026-07-03）的判定表口径**：占い相性没有唯一正解，两家公开源的六星占術星对星表互相矛盾（流派差）→ 六星部分**不建星同士表**，改用「相手の生年年支落在自分タイプ12ゾーン哪格」的地運方式（100%复用 `fortuneZone`，出典框架 hosokikazuko.com）；数秘術45对表和血液型10对表是「综合通行说法的本站判定基准」，**整表在测试里用独立字面量锚定**（tests/tanjobi-aisho.test.js、tests/ketsueki-aisho.test.js），页面上全部公开判定基准+注明流派差。**「MBTI」字样全站禁用**（日本MBTI協会商标），未来做16类型内容用「16タイプ」措辞。设计文档：`docs/superpowers/specs/2026-07-03-aisho-series-design.md`。
- **144 程序化页的三个接线点**：① `seiza-aisho/[pair].astro` 是工具页下动态路由的首个先例（getStaticPaths 从 lib 的 `allPairs()` 生成）；② ToolLayout 新增可选 `breadcrumb` prop 覆盖默认三层面包屑（pair 页传四层）；③ `astro.config.mjs` 的 sitemap lastmod 解析器加了 `seiza-aisho/` 前缀分支（同 category 先例）。
- **2026-07-02 全面 review 落地的修复**（详见当日会话）：① loan 0% 金利総利息为负 → 0% 分支直接 `{total:P, interest:0}`，其余 `Math.max(0,…)`；② password 默认乱数源 Math.random → `crypto.getRandomValues` + 各文字種保証 + Fisher-Yates（tests 里有「不得调用 Math.random」的契约测试）；③ pet-age ≥1歳 分支补 floor；④ seiri 周期限 15〜60；⑤ loan/fukuri 测试加了**外部锚点值**（91,855 / 108,928 / 9,849,059——改公式必挂）；⑥ 新增 404 页（消软404，CF Pages 有 404.html 才关 SPA 回退）；⑦ 面包屑三层化 + ToolLayout 统一注入 BreadcrumbList；⑧ GSC 洞察：rokusei 占全站 2/3 点击（占い赛道已验证）、kokuho 第12位0点击（匿名站金钱词天花板）。**选品新规矩：做 YMYL 词前先查 SERP 现任者，只做匿名工具站已在首页存活的词。**

## 9. 目录结构

```
src/
  layouts/ToolLayout.astro      共通模板（head/SEO/JSON-LD/header/footer/ShareButtons/FloatingShare）
  components/                   SiteHeader(分类下拉) / SiteFooter / RelatedTools / ShareButtons / FloatingShare
  data/tools.js                 工具元数据【单一数据源】
  lib/<tool>.js                 计算纯函数【TDD对象】
  pages/<slug>/index.astro      各工具页（用 ToolLayout + RelatedTools）
  styles/global.css             全站样式（第6节布局问题在这里）
tests/<tool>.test.js            vitest 测试
```

新工具标准流程：① `tools.js` 注册 → ② 写 `tests/<tool>.test.js`（RED）→ ③ 写 `src/lib/<tool>.js`（GREEN）→ ④ 建 `src/pages/<slug>/index.astro`（仿 `zeizei`/`wariai`/`moji` 结构，SEO frontmatter 齐全，样式用页面内 `<style>` 不动 global.css）→ ⑤ build + 浏览器验证（多尺寸）→ ⑥ wrangler 部署。
