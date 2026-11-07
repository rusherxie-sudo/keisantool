# 浏览器证据边界

最终结果来自最终dist本地服务4400；原型独立本地服务4399，未入dist。使用缓存Chromium executable 1243（本机Playwright包装默认所需1254不存在，因此显式指定已安装浏览器）。脚本只允许loopback网络，其余主动abort，不向GA/百度/字体服务送请求。

browser-results-red.json：原型[hidden]被output display覆盖的失败，修CSS后开发预览20/20通过，browser.log记录。browser-built-first-result.json：切换原生Clipboard API后未等异步写入的脚本失败，补waitForFunction后最终browser-built.log及browser-results.json为20/20通过；不是站点复制缺陷。

browser-optional-tracking.mjs为独立故障注入检查，clipboard仅该脚本用成功桩，gtag强制抛错，先RED后GREEN；主browser-check.mjs最终实际调用原生Clipboard.writeText，并包装保存合成输入的本地记录，不发送真实社交消息。

已实际查看手机六星、营业日和原型比较截图：内容可读、单列输入与表格可操作，未发现可见横向溢出。不是全页面视觉回归；外部字体被阻止，实际生产字体需另验。Tab仅六星输入抽样，不声称全键盘验收。

复现：在本worktree以Node22运行npm test/build后，python3 -m http.server 4400 --bind 127.0.0.1 --directory dist；另开python3 -m http.server 4399 --bind 127.0.0.1 --directory docs/prototypes/unit-cost；BROWSER_BASE=http://127.0.0.1:4400 用Node22执行browser-check.mjs。Playwright从脚本指定的本机既有包读取；若环境迁移需调整该包和Chromium绝对路径。没有添加项目依赖。
