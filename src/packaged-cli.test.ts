import { afterAll, expect, test } from 'bun:test';
import { chmodSync, cpSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { spawnSync } from 'child_process';

const tempRoots: string[] = [];

afterAll(() => {
  for (const root of tempRoots) {
    rmSync(root, { recursive: true, force: true });
  }
});

test('packaged CLI preserves Chinese output when executed through its shebang', async () => {
  const root = mkdtempSync(join(tmpdir(), 'agent-swe-kit-packaged-'));
  tempRoots.push(root);

  const distDir = join(root, 'dist');
  const outputDir = join(root, 'out');
  mkdirSync(outputDir);

  const build = spawnSync(
    'bun',
    ['build', 'src/index.ts', '--outdir', distDir, '--target', 'node'],
    {
      cwd: process.cwd(),
      encoding: 'utf8',
    }
  );
  expect(build.status, build.stderr).toBe(0);

  cpSync('templates', join(distDir, 'templates'), { recursive: true });

  const configPath = join(root, 'answers.json');
  writeFileSync(
    configPath,
    JSON.stringify({
      project: {
        name: '打包验证',
        description: '验证打包后的 CLI 不会乱码',
        type: 'cli',
      },
      tech: {
        language: 'typescript',
        runtime: 'bun',
        pkgManager: 'bun install',
        database: 'none',
      },
      commands: {
        install: 'bun install',
        dev: 'bun run src/index.ts',
        test: 'bun test',
        lint: 'bunx biome check .',
        format: 'bunx biome format . --write',
        build: 'bun run build',
      },
      vcs: {
        tool: 'git',
        isolation: 'smart',
        branchNaming: '<type>/<描述>',
        commitFormat: 'conventional-commits',
        mergeStrategy: 'squash',
      },
      constraints: {
        docLanguage: '中文',
        forbiddenCommands: [],
      },
      principles: ['simplicity', 'explicit-over-implicit', 'single-responsibility', 'failfast'],
      review: {
        strictness: '适中',
        preCommitChecks: ['lint'],
      },
      tasks: {
        style: '结构化',
        acFormat: 'checklist',
      },
    }),
    'utf8'
  );

  const cliPath = join(distDir, 'index.js');
  chmodSync(cliPath, 0o755);

  const run = spawnSync(cliPath, ['init', '--config', configPath, '--force'], {
    cwd: outputDir,
    encoding: 'utf8',
  });
  expect(run.status, run.stderr).toBe(0);
  expect(run.stdout).toContain('完成');
  expect(run.stdout).not.toContain('å®');

  const principles = readFileSync(join(outputDir, 'docs/agents/principles.md'), 'utf8');
  expect(principles).toContain('### 简单至上');
  expect(principles).toContain('最简单的能用的方案就是最好的');
  expect(principles).not.toContain('ç®');
});
