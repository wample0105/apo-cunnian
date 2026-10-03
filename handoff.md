# 存念（apo-cunnian）交接日志（handoff.md）

> 本文件按段落追加记录：用户需求、决策裁定、开发全过程、当前状态与未完成事项。
> 2026-10-03 之前的历史记录在 `D:\wample\coding\me\Jev\handoff.md`（含第 0 幕、方法论调研、设计稿 v1-v3 全程）。

---

## 2026-10-03 第 1-2 幕（完成）：grill-with-docs 拷问 → GLOSSARY/ADR → spec #1 → 工单 #2-#17

**用户需求**：继续存念开发，开始第 1 幕；先读 `D:\wample\coding\me\Jev\handoff.md` 接手指引；全程按 onceglance-tutorial 技能留痕，关键节点（拷问、GLOSSARY/ADR 生成、spec 与工单发布）逐一定影截图。会话中用户再次强调：截图标注规则与标准规范一律参考 onceglance-tutorial 技能执行。

**执行过程**：
1. **准备**：读齐三份输入（Jev handoff 接手指引、案例设计稿 v3、basb-methodology 调研笔记）；onceglance doctor 全绿（v0.1.1，落盘 `Pictures\Onceglance\2026-10-03\`）。
2. **research 演示（Cordis 源码路）**：后台 agent 读本机 `D:\wample\coding\me\deepseek-harness` 源码，产出 `docs/research/cordis-plugin-api.md`。关键实证：插件=导出 `apply(ctx, config)` 的模块、bundle 分发（package.json+dsh.bundle.patch+cordis.patch.yml）；工具经 `ctx.tools.register(defineTool(...))` 注册；Master Prompt 三通道（`ctx.systemPrompt.section/context/variable`）；Host 插件全 Node 权限（可起 HTTP/WSS，出站 WS 有库内先例）；定时=官方 schedule bundle（`schedule_create` 等 4 工具，五字段 cron）；预览三通道（present 交付卡/documentpreview 侧栏/open-in-app）；反问卡片=内置 `ask_user_question` 工具可复用；最佳模板=`dsh-schedule` 与 `dsh-web-search-deepseek`。
3. **grill-with-docs 拷问（15 项决策，两轮）**：第 1 轮 10 项（存储=纯 md+frontmatter；库根=默认 ~/cunnian 可配置；交互=对话驱动+md 预览；收件箱=默认落点+AI 建议可直入桶；共鸣模型=兴趣问题命中列表+理由不设数值分；L0-L4=md 原生语法映射（>摘录/**加粗/==高亮==/frontmatter L4）；触碰=插件工具显式记录；半熟素材类型=开放例举+预设建议；海明威之桥=手动命令触发+固定存放；收件箱整理=逐条建议+逐条确认）。第 2 轮 5 项（Master Prompt=ctx.systemPrompt 注入；定时=复用官方 schedule bundle；插件粒度=单插件包；飞书=**复用 dsh-im**；附件=文字必收+附件尽力）。
   - **dsh-im 查证（用户指路）**：本机宿主源码无 dsh-im；网络核实=xmanrui/dsh-im（MIT，飞书在支持列表，npm 安装+重启 Profile 生效，扫码/机器人凭据接入）；生态同类：dsh-im-bridge、DeepSeek-harness-lark、ax-feishu-bridge、lark-bridge、dsh-feishu-bot。语义=IM 消息→DSH 会话回合（传输层桥接），与自建 Long Connection 的权衡已向用户摆明，用户裁定复用 dsh-im。
4. **wait-what 插播**：共识总结后以简化技术英语+GLOSSARY 统一语言重述（教程素材）。用户确认共识后进第 2 幕。
5. **产物落盘**：`GLOSSARY.md`（约 40 术语，CODE 四环节+横切分组，后浪官方译名为底，「知识飞轮」列入 Avoid 禁用）+ 首批 4 份 ADR（0001 纯 md 存储；0002 捕捉时零 AI 摘要；0003 复用 dsh-im 传输无关契约；0004 触碰显式记录）。
6. **to-spec**：测试缝与用户对齐=**唯一缝：插件工具契约+知识库文件系统效果**（AI 环节确定性替身测契约，dsh-im/真实模型属集成验收）；补建缺失 triage 标签（needs-triage/needs-info/ready-for-agent/ready-for-human）；spec 发布为 **issue #1**（ready-for-agent），34 条用户故事+实现/测试/范围决策。
7. **to-tickets**：16 张曳光弹垂直切片（用户批准拆票草案），按依赖序发布 **issue #2-#17**（全部 ready-for-agent），21 条原生 blocked_by 依赖边（gh api dependencies 端点）。关键链：#2 骨架→#3 手动抓取→#4 共鸣命中/#5 归属整理/#7 触碰→#8 提炼 L2L3→#9 L4/#11 群岛起草→#12 海明威/#13 导出；支线 #6 Clean Slate、#10 半熟素材、#14 Master Prompt、#15 飞书端到端（第 3 幕高光票）、#16 定时模板、#17 打包发布。
   - 拆票注记：设计稿原「提炼依赖组织的数据模型」细化为「提炼依赖条目 frontmatter 契约+触碰事件」（#7 只挂 #7 触碰票，不挂归桶票），已向用户说明后批准。

**定影底账（`Pictures\Onceglance\2026-10-03\`，标注按 onceglance-tutorial §5/§7 于组稿阶段统一执行）**：
- 拷问开场（ZCode 窗口）：075033-window-awv9
- 拷问共识（ZCode 窗口）：082110-window-6y8e
- GLOSSARY 生成（Typora）：082027-window-uf7m
- ADR-0002 生成（Typora）：082041-window-6nza
- spec #1 发布（Chrome）：082742-window-9fpc
- 工单列表发布（Chrome）：083549-window-4v8u
- 弃片：082102-window-f6py（误拍 Typora 前景，非目标画面，不入素材）

**当前状态与未完成事项**：第 1-2 幕完成（grill→spec→tickets 同一会话跑完，符合 ask-matt Context hygiene）。**工作区新增未提交文件**：`GLOSSARY.md`、`docs/adr/0001-0004`、`docs/research/cordis-plugin-api.md`、本 handoff.md——**git 提交/推送待用户同意（未做任何 git 操作）**。

**▶ 第 3 幕接手指引（实现交付，工作目录仍是本仓库）**：
1. **每张票开新会话跑 `/implement`**（Context hygiene：to-tickets 之后逐票新会话）；从 frontier 开工：**#2 插件骨架**（无阻塞）是第一票；`/implement-spec` 作进阶并行演示（降级预案见设计稿）。
2. 实现前重读 `docs/research/cordis-plugin-api.md`（模板=dsh-schedule/dsh-web-search-deepseek）；宿主源码在 `D:\wample\coding\me\deepseek-harness`。
3. **wizard 票（#15 飞书端到端）受赠金 6 元 10/6 截止约束，宜在截止前完成**；需用户配合：DeepSeek API key、飞书账号建群加机器人、安装 dsh-im。
4. spec 澄清备忘（给实现者）：入库文本=L1 摘录（源自 L0 原始消息/来源，可选附 L0 全文），L0 永久可回溯由 AC 保证。
5. 教程素材：第 3 幕起每票实现留痕（tdd 红绿/code-review 双轴/pr 三段式），截图标注继续走 onceglance-tutorial。
6. 遗留可选项：第 2 幕原计划的 `prototype`/`handoff` 技能演示未做（接手指引未列入，设计稿 v3 曾列为候选）——可作为 #8 提炼票或 #11 起草票开工前的 prototype 演示补上，或明确放弃，**待用户裁定**。

---

## 2026-10-03 补演示与范围追加：prototype/handoff 技能演示 + 手机场景定版

**用户裁定**：①第 1-2 幕产物提交推送（已完成，commit c5bd01e）；②prototype/handoff 技能演示补上；③原型文案改白话（「文字太拗口」反馈，已全量重写：触碰→重看一遍、层间预算→红线、L4→总结、场景名全部口语化，状态机逻辑未动）；④**手机场景范围=「手机查看要更好」**。

**prototype 演示（已验收 ✅ 2026-10-03 用户裁定「合理」）**：`prototype/distill-workbench.html`——LOGIC 分支一次性原型，回答「一次触碰一层+20% 红线+嵌套子集+L4 署名」规则手感；纯 reducer 模块（DistillModel，零 DOM 可直接搬实现）+ 五个引导场景+自由操作；支持 `?demo=guard/budget/l4` 演示态；三张演示态截图经 OCR 硬校验（090033/090053/090118）。**结论已回写 issue #8；原型已归档一次性分支 `prototype/distill-workbench`（master 不留原型文件，只留决策）；实现文案按白话风格（拦截提示如「这一遍你已经动过一步了…先点重看一遍」）。**

**handoff 技能演示（完成）**：交接文档写入 `%TEMP%\cunnian-handoff-2026-10-03.md`（不进仓库、按路径引用产物、含建议技能清单、脱敏），定影 085252。

**手机场景定版（重要裁定，已落 spec 与工单）**：用户问「工作台只能 PC 展示，以后更多在手机查看/记录/捕捉灵感，是否满足」——已答清：原型只是演示道具；产品手机场景=飞书捕捉（主打）+飞书聊天式查看；硬依赖=电脑开机且宿主进程存活；离线消息是否补收=票 #15 实测项。用户裁定「手机查看要更好」，据此：
- **spec #1 已更新**：新增用户故事 35（手机飞书查看/检索，摘要卡片）、36（离线消息补收或明确提示）+ 实现决策「手机场景边界」段（摘要卡片+检索命令化，不做全文浏览/独立 App）。
- **票 #15 已更新**：新增验收项「电脑关机离线实测——补收则入库，不补收则重连后提示 N 条未送达，结论如实记录进 FAQ」。
- **新票 #18「飞书查看体验——条目摘要卡片与检索命令化」**（ready-for-agent）：blocked_by #8（检索工具）与 #15（通道）；同时 #17（打包发布）新增 blocked_by #18——发布门槛纳入手机查看体验。
- 依赖图现状：18 张票（#2-#18），25 条阻塞边。

**当前状态与未完成事项**：①原型已验收收口（结论在 #8、原型在一次性分支）；②handoff.md 本段已随收口提交（见最新 commit）；③第 3 幕开工指引不变（#2 骨架票先行，#15 赠金 10/6 截止约束，#18 手机查看体验已入发布门槛）。**第 1-2 幕+补演示+范围追加全部闭环，随时可开第 3 幕。**

---

## ▶ 第 3 幕开工指令（2026-10-03 定稿，新会话粘贴用）

**用户已裁定**：第 3 幕从 #2 开工，**新开会话执行**（守住 ask-matt Context hygiene，教程「逐票新会话」卖点真实演出）。本会话（第 1-2 幕）就此收束。

**新会话开工指令（用户粘贴）**：
> 继续存念开发，进入第 3 幕：先读 `D:\wample\coding\me\apo-cunnian\handoff.md`（重点最后两段接手指引）+ `docs/research/cordis-plugin-api.md`，然后跑 `/implement` 实现工单 #2（插件骨架与知识库初始化）。全程按 onceglance-tutorial 技能留痕，关键节点定影截图。

**新会话要点提醒**：①开工第一写=claim（`gh issue edit 2 --add-assignee @me`）；②唯一测试缝=工具契约+文件系统效果（vitest，AI 环节用确定性替身）；③ADR-0002/0004 是方法论硬约束不得「顺手优化」掉；④#2 完成后前沿=#3 手动抓取 + #6 Clean Slate + #14 Master Prompt 三张并行可挑；⑤#15（飞书/wizard）要赶 DeepSeek 赠金 **10/6 截止**，其前置链=#2→#3→#4/#14，实现顺序建议优先穿这条链；⑥本段为本地更新未提交，随第 3 幕首批产物一起提交即可（或用户同意即提交）。

---

## 2026-10-03 第 3 幕·工单 #2（完成待验收）：插件骨架与知识库初始化

**用户需求**：新会话跑 `/implement` 实现工单 #2；onceglance-tutorial 全程留痕、关键节点定影。开工即 claim（#2 assignee=@me）。

**交付物（`plugin/`，cunnian 0.1.0，TS+tsdown+vitest 对齐宿主栈）**：
- bundle 三件套：`package.json`（`dsh.bundle.patch`，peerDependencies 锁 `@deepseek-ai/dsh-tools ~0.2.0-rc.2`，实测过 0.2.0-rc.2 兼容门禁）+ `cordis.patch.yml`（`- id: cunnian, name: cunnian`）+ `lib/index.js`（tsdown 构建产物，gitignore）
- 知识库核心 `src/library/`：五顶层目录幂等初始化（inbox/projects/areas/resources/archives + 中文名标签）；条目读写（md+YAML frontmatter，契约 id/created/source/touches + title 与未知字段原样保留；正文逐字存取零加工=ADR-0002；`updateEntry` 禁改 id=ADR-0004 收紧）；递归计数（口径取宽只看 .md，损坏判定留给读取路径）
- 工具 `cunnian__health`：ensureHealth（initLibrary 幂等补桶→collectHealth 只读体检），canonical JSON 返回 + 自然语言 render；库根不存在自动初始化
- 装配 `apply(ctx, config)`：`inject: ['tools']`，Config=Schemastery（`root` 默认 `~/cunnian`，支持 ~ 展开）
- 测试 19 用例（临时目录：初始化/条目读写/异常路径/桶补建/装配），TDD 红绿全程留痕

**实现中查明的环境事实（后续票都用得上）**：
1. **PATH 上 `dsh` 是旧 0.1.5-rc.1**（fnm 全局残留 shim）；桌面版真实 CLI 在 `"C:\Users\Administrator\AppData\Local\Programs\DeepSeek Harness\resources\runtime\cli\bin\dsh.cmd"`（0.2.0-rc.2，自带 node24.18.1 + pnpm11.7）。装插件/起 profile 一律用它。
2. Git Bash 直跑该 dsh.cmd 会被路径空格拆断（报 `'...DeepSeek' 不是内部或外部命令`）；绕法=`ELECTRON_RUN_AS_NODE=1` 直接调 `DeepSeek Harness.exe --expose-internals "...app.asar/dsh/node_modules/@deepseek-ai/dsh-desktop-host/lib/cli.js"`（参数路径用 `C:/` 正斜杠形式，MSYS 才不会误转）。
3. headless 一次性任务=`dsh --profile <name> "<任务>"`，是插件装载+工具调用的最小验收手段（每次消耗少量 API 赠金）。
4. **`~/cunnian` 与旧存念 `~/CunNian` 在 Windows 是同一目录**（大小写不敏感）：首次 health 已在该目录并列新增五桶，旧结构（00-Inbox 等 255 文件）原样未动——ADR-0001 旧数据兼容承诺实测成立。
5. `cunnian-test` profile 的 `cunnian` link 已从旧 repo（apo-second-brain/plugin）换指新 repo `plugin/`（测试 profile，可随时换回）；**desktop profile 未动**（桌面版正在运行，且替换=旧插件功能下线，见待裁定）。
6. pnpm12 装 vitest 依赖需 `pnpm approve-builds esbuild` 放行构建脚本（交互一次）；旧 `pnpm.onlyBuiltDependencies` 字段 pnpm12 已不读。

**端到端验证（AC1/AC2/AC4，headless 实测两轮）**：安装（兼容门禁过）→ headless 启动 → 模型调用 `cunnian__health` → 库根 `C:\Users\Administrator\cunnian` 自动初始化、五桶齐全如实回报；AC4=用户层 patch 改 `config.root` → 重启 → 新库根生效（验证用临时 patch 已恢复 `[]`，临时目录已清理）。

**code-review 双轴（两并行只读代理）**：规格轴无缺失项；规范轴无硬违规。已采纳修复：初始化统一走幂等 initLibrary（工具侧也补建缺失桶）、删投机 `now` 参数、`updateEntry` 禁改 id、测试助手收敛 tests/helpers.ts、「CODE 全流程」→「信管法则 CODE 全流程」、计数口径注释。未采纳（有据）：`@deepseek-ai/schemastery` 留 dependencies（宿主 dsh-schedule 同款先例）；工具 output.schema 属性内 `required: true` 是宿主 ValueSchemaSpec DSL 既定风格（schedule 源码同款），非标准 JSON Schema 误用。

**定影底账（`Pictures\Onceglance\2026-10-03\`，标注留待组稿统一执行）**：095236-window-k9z6（TDD 红灯）、095611-window-j74n（绿灯+构建）、100035-window-dz4p（headless 端到端成功）、100232-window-zhua（AC4 改根生效）、100953-window-g7ws（审查修复后复验）。弃片：093948-window-vk9v（误拍任务栏）。

**当前状态与未完成事项**：工单 #2 代码完成（19 测试全绿/typecheck 干净/build 通过/端到端两轮实测），**待用户验收**；本地已提交，**推送远程待用户同意**。遗留两件待用户裁定：①desktop profile 正式安装（需完全退出桌面版；且会把旧插件功能替换下线，建议用户自备时机）；②AC3（frontmatter 读回）与 AC5（单测）已由测试覆盖，AC1 的「桌面版」字面验收差 desktop profile 一步（headless 用的是同一 0.2.0-rc.2 运行时与安装机制）。**下一票前沿**：#3 手动抓取 / #6 Clean Slate / #14 Master Prompt 并行可挑；#15 赠金 **10/6 截止**，优先穿 #2→#3→#4/#14 链。

---

## 2026-10-03 补充：desktop profile 实装完成（UI 验收待用户重开桌面版）

**用户动作**：退出桌面版（进程确认清空）→ 授权补上 AC1 的 desktop profile 安装。

**执行记录**：用桌面版自带 CLI（0.2.0-rc.2）`dsh plugin --profile desktop add D:/wample/coding/me/apo-cunnian/plugin`：
- **坑**：首次执行 pnpm 子进程静默挂起 12+ 分钟（pnpm.log 空、无网络连接、package.json 与 node_modules 链接其实已写完）——杀掉进程树后重跑 928ms 完成（`Packages: -12` 清掉旧插件残留依赖），run.json 正常收尾。结论：desktop profile 首次对账可能挂起，重跑即过；判定「真卡死」的依据=package.json/junction 已更新而 pnpm.log 长时间为空。
- 终态核验：`desktop/package.json` 的 `cunnian` → `link:D:/wample/coding/me/apo-cunnian/plugin` ✓；junction 可加载（name/apply/Config 导出齐全）✓；兼容门禁存念零警告 ✓。
- **dshmarket 既有不兼容（非本次引入）**：`dshmarket@1.47.0` 的 peer 要 `@deepseek-ai/dsh-settings ^0.1.x`，对 0.2.0-rc.2 不满足且无豁免记录（profile 无 compatibility.json）——CLI 警告「stays installed but profile startup denies it」。与存念无关，属用户升级宿主后的既有状态；要不要 `dsh plugin allow-version` 豁免由用户定。

**当前状态**：AC1 的机器侧验证全部完成；**差最后一步=用户重开桌面版**，看插件管理页 cunnian 0.1.0 启用无报错+对话里调一次健康检查（用户操作后补定影截图入底账）。推送远程仍待同意。

---

## 2026-10-03 收口：工单 #2 五条 AC 全部闭环（桌面版实装验收通过）

**用户实测**：重开桌面版→新会话（工作区 `D:\wample\coding\me\test`）说「做个健康检查」。模型对这句做了广义解读，**并行调了两类检查**（它开场明说「存念知识库体检 + 系统/驱动诊断，无论你指哪个都覆盖」）：`cunnian__health` 与 cua-driver 的 `health_report`。用户截图看到的是 AX 误报复核（回复后半段），**存念结果在回复第一节**——表格：库根 `C:\Users\Administrator\cunnian`、已初始化、五桶齐全各 0 条。

**硬证据（比截图更硬）**：会话记录 `~/.dsh/sessions/--D-wample-coding-me-test--/session-3e1d84d5-*/session.v4.jsonl.zstd`（zstd -dc 可解）——request/header 工具表含 `cunnian__health`；`tool/call {"name":"cunnian__health","arguments":"{}"}` 成功；tool/result 返回五桶结构化结果；模型推理原文「There's a cunnian__health tool — 存念知识库健康检查」。

**修正一个错误推断**：desktop profile 的 `dsh.profile.bundles` 列表**不含** `cunnian`（旧插件当年也不含），但插件照常加载、工具照常注册——「bundles 列表决定第三方 bundle 是否激活」对桌面版**不成立**（实证推翻，机制未深究：可能桌面版自动加载全部已装 bundle）。装新插件只动 dependencies 即可生效。

**AC 清账**：AC1 桌面版安装启用 ✓（本轮）｜AC2 健康检查+自动初始化 ✓（headless×2+桌面版×1）｜AC3 frontmatter 读回 ✓（单测）｜AC4 改根重启生效 ✓（headless 实测）｜AC5 单测 ✓（19 用例）。**#2 可关票**（关票动作留用户裁定）。定影底账新增：111237-window-pjdm（桌面版健康检查会话，AX 段；存念段在回复上半屏未入框）。

**模型顺带观察**（正确）：库是空的不是坏了，是「东西还没进来」——下一票 #3 手动抓取就是往里进东西的。当前两个本地提交待推送：`b9398ac`（实现）+ `f519f6b`（handoff 补记一）+ 本段提交。

---

## 2026-10-03 补充：插件管理页确认（用户可见性疑虑解除）

**用户质疑**「UI 上没看出存念菜单」→ 澄清两点：①#2 骨架票**有意不含任何客户端 UI**（spec 明确不做管理界面；交互形态=对话驱动，工具入口在会话里，旧插件的设置面板随替换下线）；②用户打开插件页实测——**cunnian 在「已安装 3」列表中**：靛蓝「存」图标（icon.svg 渲染正确）、描述全文、开关启用。定影 `113109-window-4atz`（OCR 核验：已安装 3/存念描述/dshmarket 异常/dsh-im 全在；"cunnian" 被 OCR 误读为 cunman，行本身在框）。「依赖安装但不在 bundles 列表→插件页不显示」的担忧**不成立**，可见性无缺口，#17 无需为此加活。

**dshmarket「异常」标签实证**：插件页红标与 CLI 兼容警告互相印证（peer 要 dsh-settings ^0.1.x，宿主 0.2.0-rc.2 拒载）。既有问题、与存念无关；豁免（`dsh plugin allow-version dshmarket@1.47.0` 或插件页入口）与否留用户定。

**当前状态**：工单 #2 全部验收通过（功能+可见性），**#2 可关票**；本地四个提交待用户同意推送（b9398ac / f519f6b / e01d4d4 / 本段）。下一票前沿：#3 手动抓取（赠金链 #2→#3→#4/#14 赶 10/6）。

---

## 2026-10-03 重裁定：做桌面端存念专区（推翻「不做管理界面」）→ spec 修订 + 新票 #19

**用户质疑链**：①「UI 上没看出存念菜单」→ 澄清对话驱动设计+插件页条目在；②「整套设计就没在 UI/左侧菜单体现吗」→ 直答「按定版设计没有」并给出四选项；③**用户裁定：重裁定，做桌面菜单**。

**技术侦察结论（实证）**：
- 左侧主导航（插件/自动化任务那列）是**宿主保留区，无第三方菜单项槽位**——字面意义的左侧菜单做不了。已枚举客户端全部槽位（`packages/client/*/src/client/contract/slots.ts`）：可用的有 `settings.section`（设置页标签页）、`settings.plugins.tab`、`settings.general.item`、`conversation.input.dock`（输入框上方）、`sidebar.footer.action`（侧栏底部按钮）、`shell.overlay`、`rightbar.session` 等。
- 旧存念（apo-second-brain）当年就是「设置页存念标签页+输入框预置词排+首用引导卡」三件套：客户端 React+esbuild→CJS→`window.__ModuleLoader__.load` 包装成 lib/client.js，`dsh.client` 声明随包分发；数据走 `connection.rpc.call('/api', 'cunnian/status', ...)` 回宿主（宿主 registerStatusRpc 校验 method）。两关键槽位在 0.2.0-rc.2 源码实证存续（ui-agent-preset 用 settings.section；ui-conversation 契约含 conversation.input.dock）。
- **「桌面菜单」落地形态=设置页「存念」标签页+输入框预置词排**（用户印象里的旧 UI 就是这个标签页）。

**已执行**：
- spec #1 修订：新增用户故事 37（桌面专区入口）；实现决策加「桌面端存念专区（2026-10-03 重裁定）」段；Out of Scope 「自建 HTML 管理界面」精确化为「通用知识库管理界面（全功能 Web UI）不做，轻量桌面专区除外」。
- **新票 #19**（ready-for-agent）：设置页存念标签页（库状态总览+改库根）+输入框预置词排+宿主只读 RPC 通道+客户端 bundle 随包分发；六条 AC；无硬阻塞（建议 #3 后开工让面板有数据）。
- #17（打包发布）原生依赖边 +文本清单均新增 blocked_by #19——发布门槛纳入桌面专区（与 #18 手机体验并列）。依赖端点备忘：`gh api --method POST repos/<owner>/<repo>/issues/<n>/dependencies/blocked_by -F issue_id=<整数id>`（要 REST 整数 id，不是 I_kwDO node id；blocking 变体 404）。
- 定影：114319-window-y8t3（重裁定执行过程）。

**当前状态**：工单 #2 验收全闭环（关票待用户点头）；本地提交待推送增至四个（b9398ac / f519f6b / e01d4d4 / 6bf8d1b）+本段待提交；前沿三选：#3 手动抓取（赶赠金链）、#19 桌面专区（今天重裁定的热票）、#6 Clean Slate。

---

## 2026-10-03 二次修正：左侧菜单项可做（用户指正正确）——#19 升级为左侧菜单+主区页形态

**用户指正**：「和插件栏平级可以将插件做进左侧菜单，自动化任务就是一个插件，开启后就进了左侧菜单」——**用户对，我此前「左侧主导航是宿主保留区、无第三方菜单项槽位」的判断错误**。

**源码核实（packages/client/ui-schedule/src/client/index.ts）**：「自动化任务」= ui-schedule bundle（可选 bundle 三行之一，结构同第三方插件）经两槽位实现：
- `ctx.slots.inject('sidebar.panellist', { id: PANEL_ID, order: 10, locale, label })` + TaskManagerIcon 组件 → **左侧菜单项**（图标+文字）；
- `ctx.slots.inject('main', { key: PANEL_ID })` + TaskManagerPage 组件 → **点击打开的主区页面**；
- 数据走 `ctx.remote.schedule`（Remote namespace，typert-protocol），另有 sidebar.right.* 详情 tab、turnTail 任务卡、shell.overlay 提示。
我此前只 grep 了 5 个 contract/slots.ts 就下了「无槽位」结论，漏了 panellist/main 这类在别处声明的槽位——教训：**槽位清单要以实际 bundle 的注册调用为准，不能只看契约文件**。

**已修正**：
- spec #1：实现决策中「左侧主导航为宿主保留区」改为「左侧菜单项可插（sidebar.panellist+main，自动化任务即先例）」。
- **票 #19 重写+改题**：「桌面端存念专区——左侧菜单项+主区库状态页（含设置页标签页与输入框预置词）」——八条 AC，首条=左侧菜单出现「存念」项（与插件/自动化任务平级）点击打开主区页；数据通道优先 Remote namespace（ctx.remote.* 形态），备选 connection.rpc（0.2.0 可用性实现时验证）。机制范本已写进票面。
- 记忆已同步修正。

**当前状态**：#19 就绪可开工（无硬阻塞，建议 #3 后）；本地 6 个提交待用户同意推送（b9398ac / f519f6b / e01d4d4 / 6bf8d1b / c0229b3 / 本段）；#2 关票待用户点头。
