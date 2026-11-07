# KT06 定向补修（候选，未部署）

起点61c7589，旧代码冻结873b2b6。写入前ps核实当前工作区仅本轮codex exec writer（1019603），未见上一writer；git仅既有未跟踪final-state.json，未覆盖其他改动。唯一writer进行本地提交。没有push、部署、复审、外联、索引写入或后台设置修改。

## 百度与事件

负责人独立公开站证据：合成BMI URL的query+fragment由百度hm.gif的u传输、HTTP200；GA4 dl去参；该次未检出生日/工资/身高体重原值。不能推论真实用户已泄漏。分享结果页既有实现无百度。

Context7查询Baidu Tongji未得到对应官方API契约（结果为地图/翻译等无关服务），未猜测私有参数。采用保守条件：仅blog单篇/category/about/privacy/editorial-policy静态路径且当前URL及非空referrer都无query/hash时加载百度，工具/结果页不加载；外站referrer同样从严检查。保留供应商和干净普通文章页统计，不改location/history、不清hash、不改后台。

边界：只在初始化判定，拒绝加载后不会因同一文档后续清理URL而补加载；已加载的静态页若之后任意history.pushState/replaceState或hash改址，**未验安全，不声称全链闭环**。现有动态hash工具均不在允许路径。没有安装拦截所有传输或改写第三方私有实现。

related_content_click仅发送同源pathname或异源origin+pathname，不含query/hash/用户信息；contextual事件原本已pathname，仅补异常隔离。结果事件仍只有tool_slug/result_type。住民税既有resident-tax无需新定义；BMI源码确缺入口，补每页面首次有效结果的bmi，不记清空/无效输入，不称业务成功。两页增加分享前的实际外发字段提示；没有新建全站分享方式。

## 证据与验证

- kt06-red.log：10个最小定向测试，旧代码8失败/2通过。kt06-green.log：相关两文件20测试通过。
- kt06-official-hm.js：2026-11-08从真实https://hm.baidu.com/hm.js?d84361ca34153f1c434c38b9cb0e0bb5取得HTTP200，Referer=https://keisantool.com/，29900字节；无Referer时返回空200，未将其当脚本验证。实际脚本原样回放，SHA256见kt06-browser-results.json；不是模拟_hmt队列实现。
- kt06-browser.mjs/results.json：本地最终dist Chromium；除本地资源外均拦截，仅百度脚本请求以真实原文响应。hm.gif全部abort，未向生产注入测试事件。干净文章页真实首个及后续pageview共2个出口，u/su无哨兵；参数/hash页、敏感同源referrer来源页、BMI干净工具页不加载，无hm.gif。工具页后续history加入哨兵仍无百度请求。首尾地址未被保护逻辑改写。
- BMI/住民税首次有效事件各1次，payload仅两字段；正常算例→清空→gtag抛错后重算/再清空通过；生日以nenrei出生日期输入同流程通过，未给它制造结果事件；BMI离线22.5通过。独立营业日分享接收页真实恢复18日且hash原封保留，无社交发送。
- 最终代码冻结9a3c221：kt06-final-test.log 120文件/2006测试通过；kt06-final-build.log成功，565 HTML/477 sitemap URL/24106内链/534锚点。无独立lint/typecheck配置，git diff --check通过。旧20浏览器组仍只归属873b2b6，未重跑无变化完整浏览器套件。

## 内容对照与范围外建议

国保165507円既有正确，不修该数字；本轮已新增全年四区分233179円算例。水分原有假设系数/非处方说明，未将其描述为原本无边界；普通/多/少标签仍可能像医学标准，留后续改善。六曜已补NDL来源和中国农历限制；库精确版本、时区、余数映射独立锚点仍不足，未称日本旧历全期认证。1900/1901已有历史年谱、2010已有学年边界，剩余建议是把核心查询提前于占术长表；六星五篇已有分工，不重写。BMI负身高只撤结果无错误解释列低优先建议，本轮不阻塞。

## 依赖只读分级（13项；不升级）

1. **critical astro** GHSA-26w7-cxv4-gfx2（AVIF RCE），关联high sharp（GHSA-f88m-g3jw-g9cj、rgj7-g3m4-5g8c、wq5f-xc86-pv6w）：配置无服务端adapter/output，成功产物为静态HTML；未发现生产Node图像处理入口。构建处理不可信图片的风险仍在，实际生产可利用性未证，不能隐藏critical。
2. high vite（GHSA-rq7h-c2jc-7f22、9jrq-w75r-8gcw等）、moderate vitest/@vitest/mocker（GHSA-82fw-gwwq-j7x9、qxg6-89mg-rqv8）、low esbuild（GHSA-g7r4-m6w7-qqqr）：开发/测试服务风险，静态产物不运行这些服务；线上暴露这些服务无证据。
3. astro其余XSS/base公告（GHSA-f48w-9m4c-m7f5、7pw4-f3q4-r2p2、4g3v-8h47-v7g6、376h-93r7-7g6f、98hj-9722-w3j8）：渲染/transition/JSX/MDX触发条件未逐条复现；静态部署不等于编译时内容绝对安全，生产可达性未知。
4. high devalue、js-yaml、nanoid、smol-toml、source-map-js、svgo、zod：公告逐项原文保留npm-audit.json（含序列化/解析DoS及SVGO清理绕过）；现有静态部署不提供通用解析API，但各构建/浏览器调用链是否满足触发条件未完整证实，待单独批准评估。
5. package.json/lock与dead351一致；未发现本轮可证实且可小改的生产利用路径，未执行audit fix、major升级或依赖重构。修复审批另行处理。
