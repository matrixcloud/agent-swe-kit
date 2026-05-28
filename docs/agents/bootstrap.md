# Agent 初始化指南

让 coding agent 在已有项目中安全接入 `agent-swe-kit`，生成适合项目的 `AGENTS.md` 和 `docs/` 规范文件。

## 适用场景

- 人类要求“接入 agent-swe-kit”“初始化 agent 规范”“生成 AGENTS.md”
- 已有项目需要补齐 agent 协作规范
- 团队希望把 agent 工作方式、质量门禁和工程约束写入仓库

## 标准流程

1. 只读分析项目：阅读 `README`、包管理文件、构建脚本、测试入口、VCS 状态和现有文档。
2. 生成临时 `answers.json` 草案，不直接写入规范文件，也不默认提交。
3. 执行预览：`npx agent-swe-kit init --config answers.json --dry-run`。
4. 向人类确认：配置摘要、将生成的文件、会覆盖的文件、无法确定的问题。
5. 人类确认后执行：`npx agent-swe-kit init --config answers.json`。
6. 生成后 review：确认 `AGENTS.md`、`docs/agents/*.md`、`docs/architecture.md` 贴合项目实际。

## 禁止事项

- 不要直接运行交互式 `npx agent-swe-kit init` 让自己临场回答问题。
- 不要未经确认使用 `--force` 覆盖已有文件。
- 不要覆盖已有 `AGENTS.md` 或 `docs/` 规范文件，除非人类明确同意。
- 不要凭空填写 `answers.json`，不确定的信息要标注待确认。
- 不要执行项目明确禁止的命令，例如 `npm publish` 或 `git push --force`。

## 临时配置填写原则

- 从项目事实推导技术栈、命令、VCS、数据库和质量门禁。
- 优先使用仓库已有命令，不要替换成自己偏好的工具。
- 保留项目或人类声明的禁止命令。
- 对无法确认的字段写入保守值，并在交付说明里列出待确认项。
- 初始化完成后，除非人类要求保留，否则把 `answers.json` 当作可删除的中间产物。

## 交付说明

完成初始化后，向人类说明：

- 识别到的技术栈和常用命令
- `--dry-run` 预览结果
- 实际生成或更新的文件
- 需要人类后续确认或调整的地方
