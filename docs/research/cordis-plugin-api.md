# DeepSeek Harness（Cordis 架构）插件 API 调研笔记

- 调研日期：2026-10-03
- 一手来源：本机源码 `D:\wample\coding\me\deepseek-harness`（commit 状态的仓库检出，版本 0.2.0-rc.2）
- 结论分级：【实证】= 源码文件（尽量到行号）可证；【推断】= 基于源码结构的推断；【未知】= 源码中未找到/无法回答
- 用途：确认「存念」个人知识库插件（集）在 DeepSeek Harness 桌面版（win/mac）上的技术边界

---

## 对存念设计的影响（要点）

1. 插件形态成立：存念按「组合包 bundle」交付——`package.json` 带 `dsh.bundle.patch` + `cordis.patch.yml` 层 + 插件模块（导出 `apply(ctx, config)`），用户 `dsh plugin add`（npm/git/tarball/本地路径均可）即可安装。
2. 桌面版即 Electron 壳 + Web Host，插件在 Host 进程内以**完整 Node 权限**运行（不受会话沙箱限制）：飞书 SDK（出站 WSS Long Connection）可以直接作为插件依赖常驻，无需公网/穿透。
3. Master Prompt 三条现成通道：部署级 `dsh-system-prompt` 的 `personaPrefix/ personaSuffix` 配置；每个 agent preset 挂 `dsh-persona`（可 `complete: true` 完全替换系统提示）；插件代码级 `ctx.systemPrompt.section()`。用户级还有固定文件 `~/.dsh/AGENTS.md`。
4. 存念的工具（归档/提炼/检索）用 `ctx.tools.register(defineTool({...}))`，schema 自动进系统提示；工具名自定义，建议自加 `cunnian__*` 前缀防撞（`cua_driver_native__*`/`mcp__server__*` 均为约定而非强制）。
5. 定时整理：官方「自动化任务」= 可选 bundle `dsh-experimental-schedule-bundle`（schedule + time-context + ui-schedule 三行），模型经 `schedule_create` 等 4 工具建任务（cron 五字段 + 时区），投递=往原会话 followup。无 manifest 级 cron；存念自建调度用 base 内置 `ctx.timer`（interval/timeout）+ storage-domain 持久化即可。
6. 持久化惯例：配置走 `cordis.patch.yml`；结构化数据走 storage hub（`$DSH_HOME/storages`，json/sqlite 后端 + schema 校验的 domain KV）；skills 可放 `$DSH_HOME` skills 目录或 `~/.agents`；用户知识库 md 建议放独立目录（任意绝对路径可行，绝对路径交付可出工作区），用 `ctx.fs`/本地 fs 读写。
7. 成果预览/打开：模型侧 `present` 工具声明交付文件 → 交付卡片；侧栏 documentpreview 原生支持 md/html/docx/xlsx/pdf/图片预览，`ui-open-in-app` + `host-open-in-app` 提供"系统默认应用打开"。存念导出的 md 可直接复用，无需自研预览。
8. 反问卡片可直接复用：`ask_user_question` 工具（`ctx.userQuestions` seam）+ Web/desktop 端 `ui-user-questions` 卡片已内置；工具自定义卡片有 `presentCall/presentResult`（generic/terminal/diff/read/search/web 六类）+ 客户端 `tool.call.toolview` slot。
9. 飞书落地首选：**插件内置飞书开放平台事件订阅 Long Connection（出站 WSS）**，收消息后或直接写收件箱文件，或仿 `webhookRuntime.register()` 建 Agent 会话投 prompt；备选 HTTP 回调 + 内网穿透（`dsh-host-webserver` 起路由，GitHub webhook 适配器为现成模板）。
10. 版本兼容是硬门槛：安装时校验 DSH peerDependencies，不匹配直接失败，需 `compatibility.json` 豁免；0.2 处于 developer preview，"THERE WILL BE COMPATIBILITY-BREAKING CHANGES"（README），存念需锁 dsh 版本并准备跟随升级。

---

## 1. 插件如何声明与打包

**插件本体（Loader 行级插件）**【实证】

- 插件 = 导出 `apply` 函数的 TS/JS 模块；可选 `name`、`inject`、`Config`（Schemastery schema）导出。三种形态：函数 / 对象（`apply` 方法）/ 类（`Service` 子类）。
  - `docs/user/develop/basic/index.zh.md:17-27`（apply+ctx 定义）、`:105-138`（三形态）
  - `docs/cordis-tutorial/01-first-plugin.zh.md:10-19`
- 配置：导出 `Config` Schemastery schema，`apply(ctx, config)` 第二参接收，校验失败即加载失败；配置变更触发 HMR 热替换。`docs/user/develop/basic/config.zh.md:9-32, 98-100`
- 依赖声明：`export const inject = ['tools', ...]`，框架保证被注入服务就绪后才运行。`docs/user/develop/basic/index.zh.md:88-103`

**组合包 bundle（分发单元）**【实证】

- bundle = 附带一个配置层的 npm 包，`package.json` 携带 `dsh: { bundle: { patch: "./cordis.patch.yml" } }`；目录结构示例 `package.json + cordis.patch.yml + index.js`。`docs/user/develop/basic/publish.zh.md:26-64`
- patch 是 Loader 条目 YAML 数组（`insert/id/name/config`），插件行可用包名或子路径（如 `@deepseek-ai/dsh-plugin-manager/tools`，走 package.json `exports`）。`docs/user/develop/basic/publish.zh.md:56-64`；`packages/bundle/base/cordis.patch.yml`（全库最完整的 patch 范本）
- 入口文件约定：普通 npm `main`/`exports` 字段，无插件专属入口字段（区别只在 `dsh` 键）。带 `icon` 与 `./locale/*.json` 可获得插件管理页展示元数据。`packages/experimental/schedule-bundle/package.json`（icon/locale/dsh.bundle 全齐的最小范本）

**profile（可启动组合）与安装**【实证】

- profile = `$DSH_HOME/profiles/<name>` 目录：`package.json`（`dsh.profile.bundles` 有序列表）+ `cordis.patch.yml`（用户层）。`docs/user/develop/basic/publish.zh.md:66-74`；`packages/boot/app-boot/src/profile.ts:5`
- 安装：`dsh plugin --profile <name> add <spec>`（转发 pnpm；spec 支持 npm 包名 / `./本地路径` / `github:owner/repo[#sha]` / tarball）；也可在 Web/桌面 UI 的插件管理页安装，或让模型用 `plugin_manager` 工具安装。
  - `docs/user/develop/basic/publish.zh.md:77-105, 160-185`
  - `packages/boot/plugin-manager/README.zh.md:31`（UI + 工具入口）、`:79`（`fallbackRegistries` 默认含 npmmirror）
- 加载层序（后层按行胜出）：bundles 列表 → profile `cordis.patch.yml` → `$DSH_HOME/cordis.patch.yml` → 每个 `--patch` overlay。`docs/user/develop/basic/publish.zh.md:118-127`

**桌面版发现与安装**【实证】

- Desktop = Electron 薄壳 + 共享 Web Host；独占 profile `$DSH_HOME/profiles/desktop`，主界面用共享 Web 插件管理器 + 内置 pnpm。`apps/desktop/README.zh.md`「关键技术决策」表（状态归属/插件变更行）与「安装归属」节
- CLI 管理桌面插件：先启动一次 Desktop 初始化 profile → 完全退出 → `dsh plugin --profile desktop add <package>` → 重开。`apps/desktop/README.zh.md`「内置命令运行时」节
- 「官方」分组的内置可选 bundle 由启动器 `OPTIONAL_BUNDLES` 常量决定（agent-team / voice-input / auto-review / schedule 四个）。`packages/boot/app-boot/src/profile.ts:213-218`

**版本兼容规则**【实证】

- 点名安装（add/带 spec install）在 pnpm 运行前做 DSH peer 兼容检查，不匹配则失败（不下载、不跑构建脚本）；git/tarball 安装后才判定并回滚。豁免写入 profile 的 `compatibility.json`（精确 `package@version` → 精确 DSH 运行时版本），需 `acceptRisk: true`。`packages/boot/plugin-manager/README.zh.md:61-77`（「版本兼容性与豁免」节）
- git 安装拉源码，需作者 `prepare` 脚本 + 用户 pnpm `allowBuilds` 授权；npm 发布/`pnpm pack` tarball 则免授权。`docs/user/develop/basic/publish.zh.md:160-185`
- 运行在 developer preview 阶段，官方明示将有破坏性变更：`README.md`（"Developer preview" 节）

## 2. 会话内工具（agent tools）注册

**注册 API**【实证】

- `ctx.tools.register(defineTool({ name, description, parameters, output, execute }))`；`defineTool` 从 `parameters`（`ParameterSchemaSpec` DSL）推导类型并校验 args；`output.schema` 声明规范 JSON 返回值，`output.render` 投影为模型可见内容。
  - 示例：`docs/user/develop/basic/tool.zh.md:19-33`；`docs/cookbook/adding-a-tool.zh.md:9-38`
  - 类型：`packages/core/tools/src/index.ts:223`（`ToolDefinition extends ToolSchema`）、`:1063`（`register()`）；DSL：`packages/core/tools/src/schema.ts:482-585`
- schema 注册后自动流入系统提示词组装（工具 schema 由 systemPrompt 的 tool providers 装配）。`docs/cookbook/adding-a-tool.zh.md:38`；`packages/core/system-prompt/src/index.ts:521-527`（`tools(provider)`）
- 模型调用：走普通 DeepSeek function calling；PTC mode 下同一批工具自动可 `await tools.<name>(args)` 调用。`docs/cookbook/adding-a-tool.zh.md:63-67`
- 长任务：`run_in_background` + `ctx.jobs.start()` 注册后台 job。`docs/cookbook/adding-a-tool.zh.md:51-55`

**命名空间**【实证】

- 注册表只要求全局唯一名 + DeepSeek 函数名约束（≤64 字符、`[A-Za-z0-9_-]`）；**前缀是插件自己的约定，不是注册表机制**。
- MCP 工具强制 `mcp__<serverName>__<rawName>`：`packages/mcp/mcp-client/src/tools.ts:7-8, 82`（含截断+哈希去冲突规则 `:68-82`）
- `cua_driver_native__*` 是 computer-use 插件自己拼的：`packages/experimental/computer-use-cua-driver-native/src/index.ts:97`（`const publicName = \`cua_driver_native__${tool.name}\``），随后 `inner.tools.register(definition)`（`:112`）——与普通插件工具**同一机制**。
- 工具数量无注册表上限（此前实测见到 56 个 cua 工具即该插件全量注册）。

## 3. 系统提示 / 上下文注入（Master Prompt）

**插件代码级（推荐给存念用）**【实证】

- `ctx.systemPrompt` 服务（`@deepseek-ai/dsh-system-prompt`，「System prompt assembly registry」）：
  - `section(PromptSection)`：按 `order` 排序拼接的具名段落，重名抛错，dispose 自动清理。`packages/core/system-prompt/src/index.ts:454-463`
  - `context(PromptContext)`：动态上下文段（如时间/tmux）。`:489-498`
  - `variable(name, provider)`：`{{variable}}` 严格插值变量。`:537-546`
  - `tools(provider)`：工具 schema 提供方。`:521-527`
- 段落顺序表 `SECTION_ORDERS` + 官方命名档位（`getSectionOrder('DEPLOYMENT_PERSONA_PREFIX')` 等）。`:161-182, 470-481`

**配置级（不写代码）**【实证】

- 部署级：`dsh-system-prompt` 行配置 `personaPrefix` / `personaSuffix` / `includeHarnessIdentity` / `includeRuntimeContext`。`packages/core/system-prompt/src/index.ts:246-261, 406-443`
- 单 agent 级：preset 内挂 `@deepseek-ai/dsh-persona`，`prefix/suffix/complete/includeRuntimeContext`；`complete: true` 时渲染后的前缀**就是完整系统提示**（遮蔽其余一切段落）。`packages/preset/persona/README.zh.md`（「配置」「人设行为」节）
- 文件级：`dsh-agent-instructions` 加载项目 AGENTS.md/CLAUDE.md 与固定的用户全局 `$DSH_HOME/AGENTS.md`（`~/.dsh/AGENTS.md`）。`packages/context/agent-instructions/src/config.ts:19-20`
- 异步向进行中会话注入：`agent.inject({ content, source: { kind: 'plugin', plugin } })`（下次模型请求可见，不唤醒空闲 agent）。`docs/cookbook/adding-a-tool.zh.md:49`

## 4. 运行时能力边界

**Node API 全量可用（Host 插件不受沙箱）**【实证】

- `packages/boot/plugin-manager/README.zh.md:31`：「已安装的 Host 代码在宿主进程内运行，不受工作区沙箱限制。」
- 沙箱（`dsh-sandbox-local`/`dsh-fs-sandbox`/`dsh-bash-sandbox`）作用于**模型工具执行面**（按会话 read-only / workspace-write / danger-full-access），不约束插件代码。`packages/bundle/base/cordis.patch.yml`（sandbox/sandbox-policy/bash-sandbox 行）；`packages/fs/fs-sandbox`（fs seam 的沙箱实现）
- 模型写的代码走独立沙箱 Node 子进程（PTC runtime：空 `process.env`、临时目录替换、堆上限、超时）。`packages/ptc-runtime/ptc-runtime-node/README.zh.md:88`
- 动态（模型会话内定义的）Cordis 插件在 `node:vm` 中跑且重启即失，与持久化 bundle 不同轨。`packages/extensions/cordis-host-runner/README.zh.md`（概述节）

**本地 HTTP server**【实证】

- Web Host 自带 `ctx.webServer`（`@deepseek-ai/dsh-host-webserver`，node:http）：`register(exact|prefix route)`、`registerUpgrade(route)`（WebSocket 升级）、`registerFallback`；`host` 仅接受 `127.0.0.1`/`0.0.0.0`，无内置 TLS/认证。`packages/host/webserver/README.zh.md`（「使用本包」节）；`packages/host/webserver/src/index.ts:181`（`registerUpgrade`）
- 插件可另挂第二个 WebServer realm（GitHub webhook 例：隔离 realm 只注册 `POST /github`）。`docs/user/guide/github-review.zh.md:40-43`；`packages/webhook/webhook-github/src/index.ts:14`（`inject = ['webServer', 'webhookRuntime', 'credentials']`）、`:47-62`

**WebSocket 客户端（出站 WSS）**【实证】

- 代码库自身用 `ws` 包做出站连接：`packages/api/gateway/src/client/stream-client.ts:227`（`new WebSocket(remoteStreamUrl())`）、`:478`（https→wss 协议换算）。
- 插件依赖里加 `ws`（或飞书官方 SDK）无任何限制（发布惯例见 `docs/user/develop/basic/publish.zh.md:103`：第三方依赖放 `dependencies`）。
- 桌面端常驻性：关闭主窗口 Host 继续运行（托盘），可承载长连接。`apps/desktop/README.zh.md`（「关闭窗口与退出」节：「页面和 Host 继续运行，任务不受影响」）

**文件系统监听**【实证】

- fs seam 提供 `ctx.fs.watch(target, cb)`：`packages/api/workspace-files/src/changes.ts:79`
- Host 插件直接用 `node:fs.watch` 的实例：`packages/boot/hmr/src/watch-config.ts`、`packages/skill/skill-filesystem/src/index.ts`（`watch: true` 默认开启 skill 目录监听，`watchUsePolling` 可选）

## 5. 自动化任务（定时）机制

**官方实现**【实证】

- 「自动化任务」= 可选实验 bundle `@deepseek-ai/dsh-experimental-schedule-bundle`，三行组合：`time-context`（时间/时区上下文）+ `schedule`（服务）+ `ui-schedule`（任务页）。`packages/experimental/schedule-bundle/cordis.patch.yml`
- 模型侧 4 工具：`schedule_create/list/update/delete`，六种选择器：`after_seconds` / `at` / `every_seconds`(≥60s) / `daily` / `weekly` / `cron`（五字段 Vixie + 显式 IANA 时区，规范化存储）。`packages/schedule/schedule/README.zh.md`（「使用此包」节选择器表与 cron 段落）
- 投递 = 恢复原 Session 并 `Agent.followup()` 追加提示词（`source.kind: "webhook"` 似的消息源），`session/flush` 成功才算投递提交；重启后补发每任务最近一次错过的时点。`packages/schedule/schedule/README.zh.md`（「理解实现→存储、投递与所有权」）；`packages/schedule/schedule/src/index.ts:156-179`（监听 `agent/created` 给每个根 agent 挂工具）
- 用户在「自动化任务」页可视化管理/编辑/删除任务。`docs/user/guide/schedule.zh.md`

**第三方插件能否声明定时任务**【实证（否定）+ 推断】

- plugin/bundle manifest 中**不存在**任何 cron/schedule 声明字段（`dsh` 键只有 `bundle.patch`/`profile.bundles`，见 `packages/experimental/schedule-bundle/package.json`、`docs/user/develop/basic/publish.zh.md:35-43`）——【实证：未找到】。
- schedule 服务未以 `ctx.schedule` Cordis 服务形式对外暴露（`ScheduleRuntime` 是内部类；对外只有模型工具与 `schedule` Remote namespace），第三方 Host 插件无法直接注入调度器——【实证：`packages/schedule/schedule/src/runtime.ts:20`（非 Service）、`src/index.ts`（无 ctx 挂载）】。
- 但 base bundle 内置 `@deepseek-ai/cordis-plugin-timer`（`id: timer`，`packages/bundle/base/cordis.patch.yml:24`），任何插件可用 `ctx.interval()/ctx.timeout()`（effect 化、自动清理）自建调度，配合 storage-domain 持久化任务表即可【推断】。`vendor/timer/src/index.ts:12-66`

## 6. 数据持久化惯例

**目录约定**【实证】

- `$DSH_HOME` 默认 `~/.dsh`（`DSH_HOME` 环境变量可覆盖）。`packages/util/home-paths/src/index.ts:61-99`（`defaultDshHome()`/`dshHomePath()`）；测试锚点 `packages/util/home-paths/tests/home-paths.spec.ts:23-25`
- base 默认布局：sessions → `$DSH_HOME/sessions`（`packages/bundle/base/cordis.patch.yml:133`）；KV 存储 → `$DSH_HOME/storages`（`:171`）；附件 → `$DSH_HOME/attachments/v1`（`packages/attachment/attachment-local/src/index.ts:176`）；凭据 → `$DSH_HOME/.env`/`.credentials.yaml`（base patch credentials 注释）；用户全局指令 → `$DSH_HOME/AGENTS.md`；skills → `$DSH_HOME` skills 根 + `~/.agents`（`$DSH_AGENTS_HOME`）+ 项目根 + 自定义目录（`packages/skill/skill-filesystem/src/index.ts:49-87`）；桌面运行时 → `$DSH_HOME/dsh-runtimes/...`（apps/desktop README）
- 插件自身配置：不落自有文件，走 profile `cordis.patch.yml` 行 `config`（config-editor/HMR 负责持久化与热替换）。`packages/boot/config-editor`（「Persist plugin configuration through profile patches」）；`docs/user/develop/basic/config.zh.md:98-100`

**结构化持久化（推荐存念用）**【实证】

- storage hub（`ctx.storage`）+ 后端（`dsh-storage-json` 文件 KV / `dsh-storage-sqlite`）+ `dsh-storage-domain`（schema 校验、事件、按 domain 路由后端的 KV 领域层）。`packages/storage/storage/README.zh.md`（概述/最小组合/后端约定节）
- 官方同类先例：schedule 用 version-1 `schedule` domain 存任务行（整 unit 布局），workspace 记录也走 domain。`packages/schedule/schedule/README.zh.md`（实现节）

**用户知识库（md 库）放哪**【推断】

- 无"官方用户数据目录"概念约束任意路径：`present` 工具明确接受工作区外绝对路径（含 /tmp、Downloads）；fs 工具在 workspace-write 沙箱下限制写工作区+临时区，danger-full-access 则不限。`packages/deliverables/tool-present/README.zh.md`（使用节）；`packages/fs/fs-sandbox`（包描述）
- 建议存念：库目录由用户配置（Config schema 字段，默认 `~/Cunnian` 或 `$DSH_HOME/cunnian`），不依赖会话工作区；插件自身状态走 storage-domain。文档预览/交付引用绝对路径即可被打开（见 §7）。

## 7. 成果预览（md/docx/html）

**模型侧声明交付**【实证】

- `present` 工具（`@deepseek-ai/dsh-tool-present`）：以 `files: [{ path, description? }]` 声明最终文件（可为工作区外绝对路径）→ `deliverables/presented` 事件 → Web「变更文件/交付卡片」+ 终局回复中可点击的文件引用。`packages/deliverables/tool-present/README.zh.md`；`packages/client/ui-deliverables`（包描述）
- 「Open In...」：交付卡/预览头部可选用系统默认应用打开文件（`dsh-client-ui-open-in-app` + host 侧三条 webServer 路由 `dsh-host-open-in-app`）。`packages/host/open-in-app`（包描述）；`packages/bundle/web-app/cordis.patch.yml:81-89`

**侧栏文档预览**【实证】

- `dsh-client-ui-sidebar-documentpreview`：右侧栏预览 Markdown（GFM）、代码、PDF、HTML（静态消毒 iframe / 受控脚本模式）、图片、Office（Word/PPT 本地转 PDF，Excel 浏览器内打开）、纯文本兜底。`packages/client/ui-sidebar-documentpreview/README.zh.md`（概述与「注册了什么」节）
- 地址格式 `dsh-resource://file/**`（相对或绝对路径，绑定 Session）；第三方可注册自己的渲染器：`ctx.documentPreviews.register({ id, extensions, priority, ... })` + keyed slot `sidebar.right.tab.document`。同上（「怎么读」末段）
- 打开入口：交付卡片引用、Files 侧栏树、以及插件自行 `addResource`/`setResources`（documentpreview 正文 props 提供这两个导航 API）——存念可以做一个"收件箱/素材面板"直接把 md 打进预览 tab。同上

**结论**：插件让用户"预览/打开一个 md 文件"有三条现成通道（present 交付卡 / dsh-resource 地址+documentpreview / open-in-app），无需自研渲染。【实证】

## 8. 官方内置插件清单与示例

**全量清单**【实证】

- 生成文件（由 workspace manifests 生成，含分组/是否带 Config/描述）：`packages/preset/agent-preset/skills/cordis-composition-reference/references/packages.md`（生成器 `scripts/gen-plugin-packages.ts`）
- base 组合（随每个 profile 加载的核心行）：`packages/bundle/base/cordis.patch.yml`；Web 表层：`packages/bundle/web-app/cordis.patch.yml`；可选内置：`packages/boot/app-boot/src/profile.ts:213-218`（OPTIONAL_BUNDLES 四件）

**最值得抄的两个范本**【实证】

1. **`@deepseek-ai/dsh-schedule`**（定时任务，"插件包"完整形态）：
   - 服务 + 模型工具 + Remote + UI 分包：`packages/schedule/schedule/src/`（`index.ts` 装配、`runtime.ts` 定时器、`domain.ts` 规则计算、`storage.ts` 持久化校验、`tools.ts` 4 工具、`client.ts` Remote、`update.ts` CAS 更新）
   - 交付形态：`packages/experimental/schedule-bundle/`（package.json + cordis.patch.yml + icon + locale 的最小可选 bundle）
   - 对存念：定时整理任务、storage-domain 持久化、按 agent 挂工具的完整参照。
2. **`@deepseek-ai/dsh-web-search-deepseek`**（能力 seam 的 provider 形态）：
   - `packages/web/web-search-deepseek/src/index.ts`（`inject = ['web']` + Config schema + credentialRef 引用密钥，不落明文）+ `provider.ts` 实现
   - 所在 seam：`@deepseek-ai/dsh-web`（搜索/抓取 provider 注册表）、模型工具在 `@deepseek-ai/dsh-tool-web`
   - 对存念：若要做"检索 provider"（供模型搜个人库），这是注册式能力分层的模板；密钥引用用 `z.string().role('credential-ref')`。
   - 另一个外部事件参照：`packages/webhook/webhook-github/src/index.ts`（HTTP 适配器，53 行完成签名验证路由注册）。

## 9. 与对话 UI 的交互（富 UI 能力）

**反问卡片（选项按钮）——可直接复用**【实证】

- 模型侧工具 `ask_user_question`（`@deepseek-ai/dsh-tool-ask-user`）：多问题、每问多选项（label/description，推荐项放首位）、单选/多选/自由文本、`mode: timed` 超时放行。`packages/interaction/tool-ask-user/README.zh.md`（概述+调用示例 JSON）
- UI 侧 `@deepseek-ai/dsh-client-ui-user-questions`：附着在输入框的提问卡片（选项点选、草稿、跳过、倒计时、迟到回复、只读回看）。`packages/client/ui-user-questions/README.zh.md`
- seam：`ctx.userQuestions`（`@deepseek-ai/dsh-user-questions`），任何插件可自建 answerer/消费方。`packages/interaction/user-questions`（抽象 seam 包）

**工具自定义卡片**【实证】

- Host 工具声明 `presentCall(args)` / `presentResult(args, result)` 返回渲染意图：`generic / terminal / diff / read / search / web` 六类卡片；纯函数要求；`presentationMeta` 持久化回放数据。`docs/cookbook/adding-a-tool.zh.md:69-93`
- 客户端按 wire 工具名在 keyed slot `tool.call.toolview` 注册专属 React 展示（内置 Web Client 不自动消费 presentCall/presentResult，专用卡片要客户端插件配合）。`docs/cookbook/adding-a-tool.zh.md:95-99`
- 通用回退：未声明展示方法的工具显示通用卡片（标题=工具名+原始 args）。

**斜杠命令（非模型路径）**【实证】

- `ctx.commands.register({ name, description, input, handler })`：UI 内 `/command` 直接对 agent 执行，不产生模型消息，结果在模型历史外渲染。`packages/interaction/commands/README.zh.md`
- 存念可用：`/cunnian-inbox`、`/cunnian-review` 等直达操作。

**边界**：会话流内富 UI = 工具卡片 + ask_user_question 卡片 + markdown；没有插件任意嵌 HTML/表单进消息流的通道（HTML 仅在文档预览的受控 iframe）。【实证：adding-a-tool.zh.md 全文 + documentpreview HTML 策略】

## 10. 飞书群消息 → 存念收件箱：落地路径预判

先给两条硬事实：

- 【实证】出站网络无约束：Host 插件全 Node 权限（§4），代码库自身即有出站 WebSocket 客户端先例（`packages/api/gateway/src/client/stream-client.ts:227,478`）。
- 【实证】入站 HTTP 需要监听端口 + 公网可达：`dsh-host-webserver` 只提供回环/0.0.0.0 的明文 HTTP，无 TLS/域名（`packages/host/webserver/README.zh.md`）；官方 GitHub webhook 方案明确要求"TLS 反向代理或 tunnel 把公共 URL 转发到 loopback"（`docs/user/guide/github-review.zh.md:11`）。

**路径 A（推荐）：飞书开放平台事件订阅 Long Connection（出站 WSS）+ 常驻插件**

- 做法：存念插件 `apply()` 内 `ctx.effect()` 启动飞书 SDK 的 WS 长连接客户端（`@larksuiteoapi/node-sdk` 的 `WSClient`，纯出站，无需公网 IP/穿透/证书）；`im.message.receive_v1` 事件回调里把消息写入收件箱（直接落盘 md，或 `agent.inject()`/`Agent.followup()` 触发整理会话）。
- 依赖源码证据：§4 全量 Node + 出站 WS 先例；`ctx.effect` 清理与常驻进程惯例（`docs/user/develop/basic/index.zh.md:70-84`）；桌面托盘常驻（`apps/desktop/README.zh.md` 关窗 Host 继续运行）；`webhookRuntime.register()` 展示了"事件→新会话"的可参照提交点（`packages/webhook/webhook/src/index.ts:89`，`WebhookSessionRequest` 字段 `src/types.ts:38`）。
- 前提：飞书侧需创建企业自建应用并开通长连接模式（外部知识，非源码可证）【未知/外部】。
- 风险：desktop Host 重启/退出期间断连丢消息（飞书 SDK 有重连+事件补推，属 SDK 行为）【推断】。

**路径 B：飞书事件订阅 HTTP 回调 + 本地 webserver 路由 + 内网穿透**

- 做法：仿 `webhook-github`：插件 `inject ['webServer']` 注册 `POST /feishu` 路由，复用飞书 URL 校验（challenge）+ 签名/加密解密；用 frp/ngrok/cloudflared 等把公网 URL 转发到 `127.0.0.1:<port>`。
- 依赖源码证据：`packages/webhook/webhook-github/src/index.ts:47-62`（路由注册范本，56 行）；`docs/user/guide/github-review.zh.md:40-64`（隔离 realm + Caddy 反代 + 202 语义）；`packages/webhook/webhook/README.zh.md`（规则运行时已知限制：进程内 fire-and-forget、无去重、无重放）。
- 判断：个人桌面场景引入公网隧道是主要负担（安全+运维）；除非已有家庭服务器/固定隧道，否则不如 A。【推断】

**路径 C：飞书群"自定义机器人 webhook"——不可行（作为接收通道）**

- 飞书群自定义机器人只提供 outgoing（发消息进群）能力，不产生入站事件推送——这是飞书平台行为，**DSH 源码中无任何飞书相关代码**（全库检索 `feishu|lark` 无命中）【实证：未找到】；该"仅 incoming 不可行"的判定本身属外部知识【未知/外部】。
- 自定义机器人仍可作**出站通知**用（存念整理完成后往群里发摘要），实现上就是普通 HTTPS POST，无源码障碍【推断】。

**结论**：A 为主（零网络基础设施、复用桌面常驻），C 出站通知为辅，B 仅在已有穿透设施时考虑。

---

## 附：存念可用的关键 API 速查（均出自上述源码）

| 能力 | API/包 | 出处 |
|---|---|---|
| 注册工具 | `ctx.tools.register(defineTool(...))` | `packages/core/tools` |
| 系统提示段 | `ctx.systemPrompt.section()/context()/variable()` | `packages/core/system-prompt/src/index.ts:454+` |
| 定时器 | `ctx.interval()/ctx.timeout()`（base 内置） | `vendor/timer/src/index.ts` |
| KV 持久化 | `ctx.storageDomain.open(domain)` | `packages/storage/storage-domain` |
| 文件读写 | `ctx.fs`（read/write/edit/watch） | `packages/fs/fs-local` |
| HTTP 路由 | `ctx.webServer.register()/registerUpgrade()` | `packages/host/webserver/src/index.ts` |
| 事件→新会话 | `ctx.webhookRuntime.register(rule)` | `packages/webhook/webhook/src/index.ts:89` |
| 会话内注入 | `agent.inject({ content, source })` / `Agent.followup()` | `docs/cookbook/adding-a-tool.zh.md:49`、webhook README |
| 反问卡片 | `ask_user_question` 工具（内置） | `packages/interaction/tool-ask-user` |
| 斜杠命令 | `ctx.commands.register()` | `packages/interaction/commands` |
| 密钥引用 | `z.string().role('credential-ref')` + `credentialRef()` | `packages/credentials`、`web-search-deepseek/src/index.ts` |
| 技能目录 | `$DSH_HOME` skills / `~/.agents` / 自定义 | `packages/skill/skill-filesystem/src/index.ts:49-87` |
