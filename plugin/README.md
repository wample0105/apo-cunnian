# 存念（cunnian）插件

DeepSeek Harness 桌面版上的第二大脑插件：灵感收集 → 整理归桶 → 管理检索 → 辅助创作（信管法则 CODE 全流程）。本包为工单 #2 交付的插件骨架：bundle 声明、知识库初始化、条目读写核心、健康检查工具。

## 安装（本地路径）

```sh
# 完全退出桌面版后执行；dsh 用桌面版自带 CLI（0.2.0-rc.2）
dsh plugin --profile desktop add D:/wample/coding/me/apo-cunnian/plugin
```

## 配置

| 字段 | 默认 | 说明 |
|---|---|---|
| `root` | `~/cunnian` | 知识库根目录（支持 `~` 展开），修改后重启生效 |

## 知识库结构（ADR-0001：一个条目一个 md 文件，元数据全在 YAML frontmatter）

```
~/cunnian/
├── inbox/       收件箱（新条目默认落点）
├── projects/    项目
├── areas/       领域
├── resources/   资源
└── archives/    存档
```

条目 frontmatter 契约：`id`（UUID）、`created`（RFC 3339）、`source`（manual/feishu/…）、`touches`（非负整数，只由存念工具改写）；`title` 与其余自定义字段可选并原样保留。

## 工具

- `cunnian__health`：返回库根、五桶状态与条目计数；库根不存在时自动初始化。

## 开发

```sh
pnpm install        # 依赖安装
pnpm test           # vitest（17 用例：初始化/条目读写/健康检查/装配）
pnpm typecheck      # tsc --noEmit
pnpm build          # tsdown → lib/index.js
```
