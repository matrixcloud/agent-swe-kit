# AGENTS.md

## 项目一句话

Coding agent 工程实践管理工具 — 为 coding agent 和人类生成可读的软件工程规范

## 全局约束

- 回答使用中文
- 中英文间加空格
- 禁止执行 `npm publish`，必须找用户确认
- 禁止执行 `git push --force`，必须找用户确认

## 命令

- 安装依赖：`bun install`
- 本地启动：`bun run --watch src/index.ts`
- 构建：`bun run build`
- 测试：`bun test`
- 代码检查：`bunx biome check .`
- 代码格式化：`bunx biome format . --write`

## 质量门禁

- 代码改动在交付前默认执行：`bunx biome check . && bunx biome format . --write && bun test`
- 纯文档或纯规划任务可不执行全量测试

## 按需阅读

| 场景 | 文档 | 内容 |
| --- | --- | --- |
| 接到新任务 | `docs/agents/tasks.md` | 任务描述格式、规模定义、agent 工作流 |
| 探索方案 / 脑暴 | `docs/agents/brainstorm.md` | 方案生成、对比、反馈模板 |
| 方案太保守 / 卡住了 | `docs/agents/think-out-of-box.md` | 质疑前提、挑战方案 |
| 深入设计 | `docs/agents/design.md` | 决策流程、方案文档模板 |
| 做技术决策 / 写代码 | `docs/agents/principles.md` | 核心原则、TDD 节奏、底线 |
| 了解系统全景 | `docs/architecture.md` | 系统架构、数据模型、关键决策 |
| 提交前自检 / 做评审 | `docs/agents/review.md` | 自查清单、评审规范、反馈格式 |
| 操作 VCS / 提交 | `docs/agents/vcs.md` | 工作区策略、commit 规范、PR 流程 |
| 记录关键决策 | `docs/agents/adr.md` | ADR 模板、决策分类 |
| 记录技术债务 | `docs/tech_debt_tracker.md` | WAIVER 记录与追踪 |
