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
