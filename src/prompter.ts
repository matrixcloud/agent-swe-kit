import * as p from '@clack/prompts';
import { basename } from 'path';
import type { ProjectAnswers, SelectOption } from './types';

interface CommandDefaults {
  install: string;
  dev: string;
  test: string;
  lint: string;
  format: string | null;
  build: string | null;
}

function getRuntimeOptions(language: string): SelectOption[] {
  switch (language) {
    case 'typescript':
      return [
        { value: 'bun', label: 'Bun', hint: '推荐' },
        { value: 'node', label: 'Node.js' },
        { value: 'deno', label: 'Deno' },
      ];
    case 'python':
      return [
        { value: 'fastapi', label: 'FastAPI' },
        { value: 'flask', label: 'Flask' },
        { value: 'django', label: 'Django' },
        { value: 'none', label: '无框架' },
      ];
    case 'rust':
      return [
        { value: 'none', label: '纯 Rust / 无框架' },
        { value: 'axum', label: 'Axum' },
        { value: 'actix', label: 'Actix Web' },
      ];
    case 'go':
      return [
        { value: 'none', label: '标准库 / 无框架' },
        { value: 'gin', label: 'Gin' },
        { value: 'echo', label: 'Echo' },
      ];
    default:
      return [
        { value: 'none', label: '无特定运行时' },
      ];
  }
}

function getDefaultPkgManager(language: string): string {
  switch (language) {
    case 'typescript': return 'bun install';
    case 'python': return 'uv sync';
    case 'rust': return 'cargo build';
    case 'go': return 'go mod tidy';
    default: return '';
  }
}

function getCommandDefaults(language: string): CommandDefaults {
  switch (language) {
    case 'typescript':
      return {
        install: 'bun install',
        dev: 'bun run --watch src/index.ts',
        test: 'bun test',
        lint: 'bunx biome check .',
        format: 'bunx biome format . --write',
        build: 'bun build src/index.ts --outdir dist',
      };
    case 'python':
      return {
        install: 'uv sync',
        dev: 'uvicorn app.main:app --reload',
        test: 'uv run pytest',
        lint: 'uv run ruff check .',
        format: 'uv run ruff format .',
        build: null,
      };
    case 'rust':
      return {
        install: 'cargo build',
        dev: 'cargo run',
        test: 'cargo test',
        lint: 'cargo clippy',
        format: 'cargo fmt',
        build: 'cargo build --release',
      };
    case 'go':
      return {
        install: 'go mod tidy',
        dev: 'go run .',
        test: 'go test ./...',
        lint: 'golangci-lint run',
        format: 'go fmt ./...',
        build: 'go build -o bin/app .',
      };
    default:
      return {
        install: '',
        dev: '',
        test: '',
        lint: '',
        format: null,
        build: null,
      };
  }
}

export async function prompt(): Promise<ProjectAnswers> {
  // Suppress @clack/prompts internal bun warnings
  const consoleError = console.error;
  console.error = (...args: unknown[]) => {
    const msg = String(args[0]);
    if (msg.includes('--- ExperimentalWarning') ||
        msg.includes('ReadableStream') ||
        msg.includes('already declared')) return;
    consoleError(...args);
  };

  p.intro(`🚀 agent-swe-kit — 人机协作工程规范初始化`);

  // =========================================================================
  // Step 1: 项目定位
  // =========================================================================
  const projResult = await p.group(
    {
      name: () => p.text({
        message: '项目名称？',
        placeholder: basename(process.cwd()),
        defaultValue: basename(process.cwd()),
      }),
      description: () => p.text({
        message: '一句话描述？',
        placeholder: '一个做了 X 的 Y 服务',
      }),
      type: () => p.select({
        message: '项目类型？',
        options: [
          { value: 'backend', label: '后端服务', hint: 'API 服务、微服务' },
          { value: 'frontend', label: '前端应用', hint: 'Web / 移动端' },
          { value: 'cli', label: 'CLI 工具', hint: '命令行工具' },
          { value: 'library', label: '库 / SDK', hint: '可复用组件库' },
          { value: 'fullstack', label: '全栈应用', hint: '前后端一体' },
        ],
      }),
    },
    {
      onCancel: () => {
        p.cancel('已取消');
        process.exit(0);
      },
    }
  ) as { name: string; description: string; type: string };

  const project = {
    name: projResult.name || basename(process.cwd()),
    description: projResult.description || '一个软件项目',
    type: projResult.type as ProjectAnswers['project']['type'],
  };

  // =========================================================================
  // Step 2: 技术栈
  // =========================================================================
  const language = await p.select({
    message: '主要语言？',
    options: [
      { value: 'typescript', label: 'TypeScript', hint: '含 JavaScript' },
      { value: 'python', label: 'Python' },
      { value: 'rust', label: 'Rust' },
      { value: 'go', label: 'Go' },
      { value: 'other', label: '其他' },
    ],
  }) as string;

  const runtimeOptions = getRuntimeOptions(language);
  const pkgDefault = getDefaultPkgManager(language);
  const cmdDefaults = getCommandDefaults(language);

  const techResult = await p.group(
    {
      runtime: () => runtimeOptions.length > 0
        ? p.select({ message: '运行时 / 框架？', options: runtimeOptions })
        : p.text({ message: '运行时 / 框架？', placeholder: '无特定框架', defaultValue: 'none' }),
      pkgManager: () => p.text({
        message: '包管理器命令？',
        placeholder: pkgDefault,
        defaultValue: pkgDefault,
      }),
      database: () => p.select({
        message: '数据库？',
        options: [
          { value: 'none', label: '不使用数据库' },
          { value: 'postgres', label: 'PostgreSQL' },
          { value: 'mysql', label: 'MySQL' },
          { value: 'sqlite', label: 'SQLite' },
        ],
      }),
    },
    {
      onCancel: () => {
        p.cancel('已取消');
        process.exit(0);
      },
    }
  ) as { runtime: string; pkgManager: string; database: string };

  const tech = {
    language,
    runtime: techResult.runtime || 'none',
    pkgManager: techResult.pkgManager || pkgDefault,
    database: techResult.database || 'none',
  };

  // =========================================================================
  // Step 3: 常用命令
  // =========================================================================
  const cmdResult = await p.group(
    {
      install: () => p.text({ message: '安装依赖？', placeholder: cmdDefaults.install, defaultValue: cmdDefaults.install }),
      dev: () => p.text({ message: '本地启动？', placeholder: cmdDefaults.dev, defaultValue: cmdDefaults.dev }),
      test: () => p.text({ message: '测试？', placeholder: cmdDefaults.test, defaultValue: cmdDefaults.test }),
      lint: () => p.text({ message: 'Lint？', placeholder: cmdDefaults.lint, defaultValue: cmdDefaults.lint }),
      format: () => p.text({ message: '格式化？（留空跳过）', placeholder: cmdDefaults.format || '', defaultValue: cmdDefaults.format || '' }),
      build: () => p.text({ message: '构建？（留空跳过）', placeholder: cmdDefaults.build || '', defaultValue: cmdDefaults.build || '' }),
    },
    {
      onCancel: () => {
        p.cancel('已取消');
        process.exit(0);
      },
    }
  ) as Record<string, string>;

  const commands = {
    install: cmdResult.install || cmdDefaults.install,
    dev: cmdResult.dev || cmdDefaults.dev,
    test: cmdResult.test || cmdDefaults.test,
    lint: cmdResult.lint || cmdDefaults.lint,
    format: cmdResult.format?.trim() || null,
    build: cmdResult.build?.trim() || null,
  };

  // =========================================================================
  // Step 4: 版本控制
  // =========================================================================
  const vcsResult = await p.group(
    {
      tool: () => p.select({
        message: '版本控制工具？',
        options: [
          { value: 'git', label: 'Git', hint: '最常用' },
          { value: 'jj', label: 'Jujutsu (jj)', hint: 'Git 兼容的现代 VCS' },
        ],
      }),
      isolation: () => p.select({
        message: '任务隔离策略？',
        options: [
          { value: 'strict', label: '严格隔离', hint: '任何改动都建 worktree/workspace' },
          { value: 'smart', label: '智能判断', hint: '大改动隔离，小改动直接改（推荐）' },
          { value: 'none', label: '不隔离', hint: '直接在分支上工作' },
        ],
      }),
      branchNaming: () => p.text({
        message: '分支命名规则？',
        placeholder: '<type>/<描述>',
        defaultValue: '<type>/<描述>',
      }),
      commitFormat: () => p.select({
        message: 'Commit 格式？',
        options: [
          { value: 'conventional-commits', label: 'Conventional Commits', hint: 'feat: / fix: / chore: ...' },
          { value: 'custom', label: '自定义', hint: '项目自行约定' },
        ],
      }),
      mergeStrategy: () => p.select({
        message: '合并策略？',
        options: [
          { value: 'squash', label: 'Squash Merge', hint: '推荐' },
          { value: 'rebase', label: 'Rebase' },
          { value: 'merge', label: 'Merge Commit' },
        ],
      }),
    },
    {
      onCancel: () => {
        p.cancel('已取消');
        process.exit(0);
      },
    }
  ) as Record<string, string>;

  const vcs = {
    tool: vcsResult.tool as 'git' | 'jj',
    isolation: vcsResult.isolation as 'strict' | 'smart' | 'none',
    branchNaming: vcsResult.branchNaming || '<type>/<描述>',
    commitFormat: vcsResult.commitFormat || 'conventional-commits',
    mergeStrategy: vcsResult.mergeStrategy || 'squash',
  };

  // =========================================================================
  // Step 5: 约束
  // =========================================================================
  const constraintResult = await p.group(
    {
      docLanguage: () => p.select({
        message: '文档语言？',
        options: [
          { value: '中文', label: '中文' },
          { value: 'English', label: 'English' },
        ],
      }),
      forbiddenCommands: () => p.text({
        message: '禁止 agent 自动执行的命令？（逗号分隔，留空跳过）',
        placeholder: 'db migrate, deploy',
        defaultValue: '',
      }),
    },
    {
      onCancel: () => {
        p.cancel('已取消');
        process.exit(0);
      },
    }
  ) as { docLanguage: string; forbiddenCommands: string };

  const constraints = {
    docLanguage: constraintResult.docLanguage || '中文',
    forbiddenCommands: (constraintResult.forbiddenCommands || '')
      .split(',')
      .map(s => s.trim())
      .filter(Boolean),
  };

  // =========================================================================
  // Step 6: 工程原则
  // =========================================================================
  const principleResult = await p.multiselect({
    message: '选择核心工程原则（空格选择，回车确认）：',
    required: false,
    options: [
      { value: 'correctness-first', label: '正确性优先', hint: '能跑对 > 跑得快 > 写得短' },
      { value: 'simplicity', label: '简单至上', hint: '最简单的能用的方案就是最好的' },
      { value: 'explicit-over-implicit', label: '显式优于隐式', hint: '代码意图一目了然' },
      { value: 'safe-over-fast', label: '安全优于速度', hint: '涉及数据/资金时安全优先' },
      { value: 'single-responsibility', label: '单一职责', hint: '一个模块只做一件事' },
      { value: 'failfast', label: '快速失败', hint: '不过度设计、过度防御、过度容错' },
    ],
  }) as string[];

  const principles = Array.isArray(principleResult) ? principleResult : [];

  // =========================================================================
  // Step 7: 评审
  // =========================================================================
  const reviewResult = await p.group(
    {
      strictness: () => p.select({
        message: '评审严格度？',
        options: [
          { value: '严格', label: '严格', hint: '所有检查项必须通过' },
          { value: '适中', label: '适中', hint: '关键检查必须通过，风格建议可讨论' },
          { value: '宽松', label: '宽松', hint: '仅阻止明显 Bug' },
        ],
      }),
      preCommitChecks: () => p.multiselect({
        message: '提交前必须通过的检查？（空格选择，回车确认）',
        required: false,
        options: [
          { value: 'lint', label: 'Lint 无报错' },
          { value: 'test', label: '所有测试通过' },
          { value: 'build', label: '构建成功' },
          { value: 'typecheck', label: '类型检查通过' },
        ],
      }),
    },
    {
      onCancel: () => {
        p.cancel('已取消');
        process.exit(0);
      },
    }
  ) as { strictness: string; preCommitChecks: string[] };

  const review = {
    strictness: reviewResult.strictness || '适中',
    preCommitChecks: Array.isArray(reviewResult.preCommitChecks) ? reviewResult.preCommitChecks : [],
  };

  // =========================================================================
  // Step 8: 任务管理
  // =========================================================================
  const taskResult = await p.group(
    {
      style: () => p.select({
        message: '任务管理风格？',
        options: [
          { value: '结构化', label: '结构化', hint: '严格的模板和验收标准' },
          { value: '轻量', label: '轻量', hint: '简单的标题和描述即可' },
        ],
      }),
      acFormat: () => p.select({
        message: '验收标准格式？',
        options: [
          { value: 'checklist', label: '清单式', hint: '- [ ] 功能 A 正常' },
          { value: 'given-when-then', label: 'Given-When-Then', hint: 'BDD 风格' },
        ],
      }),
    },
    {
      onCancel: () => {
        p.cancel('已取消');
        process.exit(0);
      },
    }
  ) as { style: string; acFormat: string };

  const tasks = {
    style: taskResult.style || '结构化',
    acFormat: taskResult.acFormat || 'checklist',
  };

  // =========================================================================
  // Assemble & confirm
  // =========================================================================
  const answers: ProjectAnswers = {
    project,
    tech,
    commands,
    vcs,
    constraints,
    principles,
    review,
    tasks,
  };

  // Show summary
  const summary = [
    `项目`,
    `  名称：${project.name}`,
    `  描述：${project.description}`,
    `  类型：${project.type}`,
    ``,
    `技术栈`,
    `  语言：${tech.language}`,
    `  运行时：${tech.runtime}`,
    `  包管理器：${tech.pkgManager}`,
    `  数据库：${tech.database}`,
    ``,
    `版本控制`,
    `  工具：${vcs.tool}`,
    `  隔离策略：${vcs.isolation}`,
    `  分支命名：${vcs.branchNaming}`,
    `  Commit 格式：${vcs.commitFormat}`,
    `  合并策略：${vcs.mergeStrategy}`,
    ``,
    `工程原则`,
    `  ${principles.length > 0 ? principles.join(', ') : '(未选择)'}`,
    ``,
    `评审`,
    `  严格度：${review.strictness}`,
    `  提交前检查：${review.preCommitChecks.length > 0 ? review.preCommitChecks.join(', ') : '(未选择)'}`,
    ``,
    `任务管理`,
    `  风格：${tasks.style}`,
    `  验收标准：${tasks.acFormat}`,
  ].join('\n');

  p.note(summary, '📋 配置摘要');

  const confirmed = await p.confirm({
    message: '确认生成以上配置的工程实践文件？',
  });

  if (p.isCancel(confirmed) || !confirmed) {
    p.cancel('已取消');
    process.exit(0);
  }

  return answers;
}
