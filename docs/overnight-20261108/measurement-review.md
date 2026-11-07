# KT-07 客户端测量审查（候选）

审查基线 dead351；本轮不改GA账号、维度、同意设置，不发送真实用户数据。浏览器网络拦截所有非本机请求，客户端桩事件不是GA DebugView或报表验收。

|口径|现状与限制|本轮结论|
|---|---|---|
|tool_slug|ToolLayout用slug→current→空；正文/下载又有固定值，如eigyoubi-year、eigyoubi-month，年度页实际路径带年份|保留既有数据兼容；下一版方案是tool_id稳定为eigyoubi、page_variant区分year/month，审批后才注册/迁移，不能把不同slug直接合并声称同分母|
|calculator_result_view|有效输出后调用；页面用布尔或mode Set限制首次；部分自动默认结果不记，部分初始有值的页会记；未覆盖全部工具|只称“已接入页的首次有效结果事件”，不称全站完成量；不可用全站事件/会话作完成率|
|有效结果|nissu清空不记、eigyoubi无效公司休日撤结果和禁CSV、住民税有效数额等|真实Chromium验证；修复公共helper的gtag异常隔离，含shared-result返回时helper注册|
|下载|PDF/Excel链接点击；CSV在调用downloadCsv后记录；不是网络完成或文件被打开|浏览器实际保存CSV并核30日+表头；事件仍命名download但报告必须写“下载动作”。PDF/Excel内容兼容性另列未验|
|分享|result_url_share：LINE为打开意图，系统分享为promise成功，复制为writeText成功；仅resultUrl非空才记录|修复统计抛错误入复制失败fallback；不把LINE打开当送达，不把copy当接收|
|接收/返回|/result/[tool]/在hash还原，不记录敏感条件；shared_result_return只代表从结果页返回主工具的URL参数|真实独立页面恢复营业日18天；该return参数可手工构造，不能当唯一接收人数或留存|
|输入隐私|结果事件仅tool_slug/result_type；分享事件仅tool_slug/method；生日、收入、体重不加到事件|浏览器住民税payload断言无3600000；VM覆盖helper和分享失败；没有全站所有出站负载的审计结论|
|可选测量失败|公共结果helper、ResultShare、eigyoubi嵌入复制三处可明确影响流程|已先RED再GREEN。其他直接gtag调用未全部改造，widgets/保险金额复制等同类catch耦合是后续范围，不能称全站异常隔离完成|

下一次度量设计（仅方案）：先为指定工具定义输入可用→有效结果→CSV动作→分享意图→接收还原→返回再算的状态；给同一工具页面/模式配对分母，排除默认结果与测试流量，去重以合规、可得的页面/会话标识为限。新增低基数tool_id/page_variant、result_type候选映射表应先评审。不得记录原值、结果金额或哈希生日。当前无可靠配对分母、无GA DebugView/报表权限验证，因此不产出完成率数字。

复现：`rg -n 'gtag|trackCalculatorResult' src/pages src/components src/layouts src/scripts`；完整匹配列表见 measurement-call-sites.txt。Node22定向测试日志green-share/green-return；真实浏览器browser-results.json、red/green-embed-browser.log。

隐私现状：当前ToolLayout仍含百度统计且privacy页如实披露；10/10“移除”只代表当时记录，不能当当前配置。本轮不更改采集供应商或账号，广告就绪仍需负责人核实CMP与实际地域合规。
