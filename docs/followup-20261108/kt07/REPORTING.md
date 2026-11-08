# KT07 有效完成、下载与分享报表规范

本轮不访问统计后台，不重复scope/资源发现；继承父级已官方核实的 GA4 property 541868330、stream 15081689041、Asia/Tokyo、tool_slug未注册、metadata不可查、增强衡量全部true。没有Admin写入、维度注册、真实collect发送或DebugView验收。

`official-client.json` 记录本日HTTP200取得的真实gtag.js散列/字节数；官方原文压缩保存为 `official-gtag.js.gz`，回放解压后逐字节提供给浏览器。`replay.mjs` 不替换gtag、不用fixture队列替身；上下文禁用ServiceWorker，全部非本机请求拦截，真实collect均abort。`replay-results.json` 保留实际外发业务字段、事件序号和域名，去除临时客户端标识与浏览器环境等无关字段，不存完整请求URL/头。首次脚本只等1.8秒未等到批处理出口（initial-replay-results.json），后来观察到官方客户端约5秒批处理和abort后的google.com备用域名尝试；按主域名及事件序号区分传输尝试与业务事件，未把双出口算两次完成。下载接收补验的第一轮未固定月份，误以当前11月比较9月18日；保留该失败于 replay-month-fixture-failure.json，仅固定测试月份后重跑营业日，其余三工具原已通过证据复用。

| 工具 | 页面/现有tool_slug | 有效结果result_type | 触发语义 |
| --- | --- | --- | --- |
| 六星 | /rokusei/ / rokusei | fortune | 正确且非未来生日后首次有效 |
| 住民税 | /juminzei/ / juminzei | resident-tax | 正数給与输入产生结果后首次有效 |
| 营业日 | /eigyoubi/ / eigyoubi | business-calendar | 首次用户修改且合法结果；初始默认表不记 |
| BMI | /bmi/ / bmi | bmi | 身高体重合法且有效结果后首次有效 |

每个文档中的布尔标记去重；清空/无效不重置标记，再有效不重复发。刷新/新标签可再发，因此事件次数不是独立会话完成数。`calculator_result_view` 两个业务参数仅tool_slug/result_type，生日、收入、身高体重和计算结果金额不得加入。GA4自带环境/会话字段仍存在；本轮只验证四工具出站字段，不声称全站/平台隐私认证。

同口径：会话键须为实际获授权可得的 session_key，按Asia/Tokyo日期窗口及同一工具规范页面匹配。进入=会话内该工具page_view；开始=该工具首次用户主动编辑/操作（排除默认渲染），目前没有统一tool_start事件，不能拿结果事件倒推开始；有效=进入后该工具匹配result_type的calculator_result_view。进入、开始、有效均各按(session_key,tool)去重，原始事件次数另列。后续页面/刷新不增加该会话分母。若一个会话使用两工具，可在两个工具各计一次，汇总时不得简单求和声称全站独立会话。

`report.mjs` 是可执行离线规范：读取获得授权的、同窗口规范化JSONL（session_key、tool、name、timestamp），输出每工具事件次数与配对会话数。当前禁止合成真实业务完成率：没有统一开始事件则开始/开始到有效率为null；若数据不含进入或会话键则报错，不用全站会话补分母。`report-contract.json` 的少量合成输入只验证聚合规范，不是GA收到事件的证据。当前无授权可用的逐事件导出，未运行真实会话报表。

下载：business_calendar_download 在Blob CSV动作调用后触发，business_calendar_pdf_download在链接点击触发，增强file_download也是点击语义；三者不能相加为完成次数。浏览器download事件和实际保存/内容核对能证明本地文件产出，现有统计事件只能报“下载动作/点击”，不能报网络保存成功或文件被打开。保留CSV action次数、按会话去重动作数；默认不计算“下载成功率”。

分享：result_url_share只在有独立URL时发。copy在原生Clipboard promise成功后；sys在系统share promise完成后；line只是打开意图。不同method分列；不等于送达或接收。支持的独立结果页通过hash恢复，恢复不发送敏感条件，也没有统一result_receive事件。shared_result_return只表示带return参数返回工具，该参数可构造，不能当唯一接收者/留存。不能把summary-only复制因无resultUrl而未记事件当代码漏报。

真正阻断：tool_slug未注册且metadata不可查，阻断现有GA按该维度报告的可验证执行；开始事件缺失、无统一接收还原事件、下载保存成功无统计信号、缺逐会话可授权导出，各自阻断对应漏斗/会话去重/成功率。当前已有事件聚合可以描述次数，不能输出完成率。本轮只交口径/客户端证据，无需为统一全站事件重写公共架构。维度注册/Admin写入须后续独立授权，暂停项不参与。

原验收映射：现有触发/参数已梳理；同口径与去重规范及可执行聚合器已交付；四工具真实官方客户端出站已验证；下载/分享/接收语义已分清。剩余是上述真实数据/后台阻断；将所有工具改造tool_start、注册维度及建立导出均不在本轮授权实现范围。
