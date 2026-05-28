#!/usr/bin/env bun
import { Command } from 'commander';
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';
import type { ProjectAnswers } from './types';
import { prompt } from './prompter';
import { generate } from './generator';

const program = new Command();

program
  .name('agent-swe-kit')
  .description('人机协作工程规范初始化工具 — 为 coding agent 和人类生成可读的软件工程规范')
  .version('0.1.0');

program
  .command('init')
  .description('在当前目录初始化工程实践文件')
  .option('-c, --config <path>', '使用 JSON 配置文件（跳过交互式问答）')
  .option('-d, --dry-run', '只预览将要生成的文件，不实际写入')
  .option('-f, --force', '强制覆盖已存在的文件')
  .action(async (options: { config?: string; dryRun?: boolean; force?: boolean }) => {
    let answers: ProjectAnswers;

    if (options.config) {
      // Non-interactive mode: read answers from JSON config
      const configPath = resolve(options.config);
      if (!existsSync(configPath)) {
        console.error(`❌ 配置文件不存在：${configPath}`);
        process.exit(1);
      }

      try {
        const raw = readFileSync(configPath, 'utf-8');
        answers = JSON.parse(raw) as ProjectAnswers;
      } catch (err) {
        console.error(`❌ 配置文件解析失败：${err instanceof Error ? err.message : err}`);
        process.exit(1);
      }

      console.log(`📄 从配置文件加载：${configPath}`);
    } else {
      // Interactive mode
      answers = await prompt();
    }

    await generate(answers, {
      dryRun: options.dryRun,
      force: options.force,
    });
  });

program.parse();
