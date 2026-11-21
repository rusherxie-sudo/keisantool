# keisantool 页面模板与 SEO 元素规范

- 最后更新：2026-11-21
- 依据：仓库 CLAUDE.md / AGENTS.md（只读）+ 线上抽样三页实测。

## 通用规范（仓库约定）
- 所有工具页使用 ToolLayout，必须输出：title、description、canonical（自引用）、WebApplication JSON-LD、至少 3 个内链、免责声明「計算結果はあくまで参考値です」。
- 计算逻辑采用 TDD（Vitest），测试文件与 src/pages 对应。
- 发布前须运行 scripts/update-lastmod.mjs 并提交 src/data/lastmod.json（Cloudflare 构建环境无完整 Git 历史，不能依赖 git 时间）。

## 线上抽样复核（2026-11-21，curl/python 只读）
| 页面 | Title | H1 | canonical | lang | JSON-LD 块数 |
| --- | --- | --- | --- | --- | --- |
| / | 無料計算ツール一覧 - 税金・健康・占い・給与・日付の計算 | 計算ツール | 無料計算ツール一覧（唯一） | 自指 | ja | 3 |
| /rokusei/shukumei-daisakkai/ | 宿命大殺界 自動計算｜生年月日から人生の20年間を無料判定 | 宿命大殺界 自動計算（唯一） | 自指 | ja | 4 |
| /kinzoku-nensuu/ | 入社何年目 早見表｜入社年別に2026年は何年目か自動計算（2026-11-21 Title 单变量实验 E-20261121-01，待 28 天监测） | 入社何年目・勤続年数計算ツール（唯一） | 自指 | ja | 4 |

- 三页 Description 均存在且与页面工具意图一致；未发现 canonical 异常、H1 多份或 lang 缺失。
- 抽样不等于全站 484 URL 均已合规；全站模板一致性待后续抓取核验。

## 结构化数据适用性（已确认）
- 工具页：WebApplication（仓库规范）。
- 首页/专题页：抽样存在 3–4 个 JSON-LD 块（具体类型未逐块解析，待确认）。
- 富媒体效果（GSC）尚未接入验证。

## 待确认
- Title/Description 的字数分布与截断情况（全站）。
- 面包屑 BreadcrumbList 是否已覆盖（抽样未确认）。
