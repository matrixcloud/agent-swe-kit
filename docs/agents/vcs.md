# 版本控制与协作

agent 通过版本控制与人类协作的完整手册：从创建环境、编写代码、提交到合并和清理。

## VCS 工具

本项目使用 **git**。

---

## 工作环境策略

**智能判断**：根据 `docs/agents/tasks.md` 中定义的任务规模决定。

| 规模 | 隔离策略 |
| --- | --- |
| tiny（≤ 1 文件，≤ 20 行） | 直接在当前分支/变更上工作 |
| small（1-3 文件，≤ 100 行） | 视情况：改单文件不隔离，跨模块则隔离 |
| medium（3-10 文件） | 建议隔离 |
| large（10+ 文件） | **必须隔离** |

不确定时，默认创建隔离区——安全比省事重要。

### Git Worktree（需要时使用）

创建隔离区：
```bash
git worktree add -b <type>/<描述> ../agent-swe-kit__<任务简述>
cd ../agent-swe-kit__<任务简述>
```

清理：
```bash
cd ../agent-swe-kit
git worktree remove ../agent-swe-kit__<任务简述>
git worktree prune
```

### 直接在分支工作（tiny 任务）

```bash
git checkout -b <type>/<描述>
# ... 改代码 ...
```


---

## 提交规范

### Conventional Commits

本项目使用 [Conventional Commits](https://www.conventionalcommits.org/) 格式：

```
<type>(<scope>): <简短描述>

<详细说明（可选）>
```

#### Type 类型

| Type | 用途 |
| --- | --- |
| `feat` | 新功能 |
| `fix` | Bug 修复 |
| `refactor` | 重构（不改变外部行为） |
| `chore` | 构建、依赖、工具链等杂项 |
| `docs` | 文档变更 |
| `test` | 测试相关 |
| `style` | 代码风格（格式化、空格等） |
| `perf` | 性能优化 |

#### 示例

```
feat(login): 增加微信扫码登录

- 接入微信 OAuth 2.0
- 新增 wechat_login 接口
- 用户首次登录自动创建账号
```

```
fix(api): 修复时间戳时区错误

订单创建时间错误地使用了本地时区，
改为 UTC 统一存储。
```

---

## 分支命名

分支命名规则：`<type>/<描述>`。如果规则中包含 `<type>`，`type` 与提交类型保持一致（如 `feature` / `fix` / `refactor` / `docs`）。

示例：
- `feature/wechat-login`
- `fix/order-timezone`
- `refactor/user-module`


---

## 合并策略

本项目使用 **squash** 方式合并。

- 所有 commit 压缩为一个提交到 main
- 保持 main 分支历史简洁
- 该变更的标题作为最终的 commit message

---

## agent 注意事项

1. **提交前自查**：对照 `docs/agents/review.md` 完成自检
2. **小而频繁的提交**：每个 commit 只做一件事
3. **不要 force push**：除非明确约定，不要强制推送到共享分支
4. **保持同步但不擅自改状态**：开始工作前先检查工作区和远端差异；需要 pull/rebase 时，说明影响并请求人类确认
5. **清理工作区**：任务完成并合并后，清理 worktree
