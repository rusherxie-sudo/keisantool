# keisantool 主题集群与内链结构

- 最后更新：2026-11-21
- 依据：线上 sitemap-0.xml 484 URL、站点目录结构、GSC Top 页面（2026-11-21 查询）。

## 集群 A：六星占術 / 宿命大殺界（流量核心，约 78% 点击）
- 主要入口：/rokusei/（5,197 点击）、/rokusei/shukumei-daisakkai/（9,097）、/rokusei-aisho/（2,328）。
- 关联内容：何星人判定、早見表、計算方法、2027 年运、宿命解释、blog/rokusei-daisakkai-jidou-keisan/。
- 内链角色：作为高意图工具入口，向生活计算工具集群导流为待验证假设，不直接批量改造。

## 集群 B：生活计算工具（税金 / 健康 / 給与 / 日付 等）
- 代表页面：/kinzoku-nensuu/、/shukushaku/、/hayasa/、/enko/、/taikakusen/、/bunsuu/、/jikan/、/gakunen-hayami/。
- 现状：多数页面有较高的 GSC 曝光但 CTR 低（见 keywords.md）；页面模板已具备 WebApplication 结构化数据。
- 内链角色：计算工具间互链 ≥3（CLAUDE.md 工具页规范），首页「無料計算ツール一覧」为汇总入口。

## 集群 C：星座 / 相性（已做内容收敛）
- 站点 BASELINE.md 记录：2026-11-06 将 66 个星座逆序配对合并，144 页 → 78 页，旧地址 301；结果页去掉模板化性格段落。
- public/_redirects 中约 132 条星座逆序配对 301 属该收敛的延续；维护时须与 sitemap 过滤同步。

## 内链与页面类型规则（来自仓库 CLAUDE.md，接管时只读识别）
- ToolLayout 输出：title / description / canonical / WebApplication JSON-LD / ≥3 内链 / 免责声明「計算結果はあくまで参考値です」。
- 不批量生成无价值页面；新增页面须先做搜索需求与意图验证。

## 待确认
- 各集群的实际内链拓扑与链接权重（需抓取全站链接图，本会话未做）。
- 集群 B 页面与集群 A 之间的主题协同是否有实测收益（未做实验）。
