# agent-swe-kit

> Coding agent 工程实践管理工具 — 为 coding agent 和人类生成可读的软件工程规范。

[![npm version](https://img.shields.io/npm/v/agent-swe-kit)](https://www.npmjs.com/package/agent-swe-kit)

## 这是什么

`agent-swe-kit` 帮你快速在项目中初始化一套**人机可读的工程实践文件**。这些文件：

- **coding agent 能读懂**，知道怎么在你的项目中正确地工作
- **人也能读懂**，用来对齐团队规范、评审代码、管理任务

## 快速开始

```bash
# 在你项目的根目录运行
npx agent-swe-kit init
```

交互式回答 8 组问题后，会在当前目录生成：

```
AGENTS.md                         # agent 入口：一句话 + 命令 + 按需索引
docs/
  architecture.md                 # 系统架构全景
  agents/
    principles.md                 # 核心工程原则
    tasks.md                      # 任务管理协议
    testing.md                    # 测试策略
    design.md                     # 设计决策指南
    brainstorm.md                 # 方案探索与脑暴
    think-out-of-box.md           # 跳出常规方案的反诘卡片
    adr.md                        # ADR 写作指南
    review.md                     # 代码评审规范
    vcs.md                        # 版本控制与协作（Git / Jujutsu）
  tech_debt_tracker.md            # 技术债务跟踪
```

## 用法

### 交互模式

```bash
npx agent-swe-kit init
```

### 非交互模式（JSON 配置）

适合 agent 自动调用或团队共享配置：

```bash
npx agent-swe-kit init --config answers.json
```

answers.json 示例见 [self-answers.json](./self-answers.json)。

### 预览模式

```bash
npx agent-swe-kit init --config answers.json --dry-run
```

### 强制覆盖

```bash
npx agent-swe-kit init --force
```

## 工作流场景

### 小明创建新项目

```bash
cd my-new-project
npx agent-swe-kit init
# 回答问题 → 生成规范文件 → 提交到 git
```

### Agent 自动初始化

agent 分析项目后生成 `answers.json`，人类确认后执行：

```bash
# agent 说："我分析了你的项目，建议如下配置，确认吗？"
# 人类确认后：
npx agent-swe-kit init --config answers.json
```

### 已有项目接入

```bash
git clone ...
cd project
npx agent-swe-kit init
# 把生成的规范文件提交到仓库
```

## 开发

```bash
# 安装依赖
bun install

# 开发模式
bun run dev -- init

# 构建
bun run build

# 给本项目自身生成规范（吃自己的狗粮）
bun run dev -- init --config self-answers.json --force
```

## License

MIT
