# 日语文案发布记录

2026-11-07（Asia/Shanghai）。用户授权发布此前 yomiyasu 与 textlint-ai-writing 的文案优化。

发布前获取远端 main，发现原工作区落后 40 个提交。最新基线为 `80a07e0`，已包含文章事实核验、内容重写及合并更新。此前 50 个文件中的 44 个已被这些更新取代，因此保留远端新版，不恢复旧文案或旧数值。

本次仅移植原审阅修改中仍与最新版上下文精确匹配的部分：

- `src/pages/index.astro`：首页说明改为完整、自然的日语句子。
- `src/pages/blog/index.astro`：精简博客入口 description。
- `src/content/blog/juminzei-keisan-hoho.md`：修复非课税收入条件的加粗显示。
- `src/content/blog/kakutei-shinkoku-tsuika-nozei-naze.md`：修复申报期限的加粗显示。
- `src/content/blog/rokusei-daisakkai-jidou-keisan.md`：减少重复的列表标签加粗。
- `src/content/blog/zeizei-kakikae-no-yarikata.md`：减少例题标签加粗。

标题、URL、金额、适用条件、来源和事实复核日期保持最新基线值。原工作区的未提交修改保留，未打包进本次发布。此前旧基线上的 397→75 文风提示和 1,808 项测试结果，不作为最新版发布候选的验收数字。

发布候选使用最新版的完整 `npm run check` 验证；随后通过 GitHub main 触发既有 Cloudflare Pages 自动部署，并核对线上文案和加粗显示。
