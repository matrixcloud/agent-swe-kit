import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname, relative } from 'path';
import type { ProjectAnswers } from './types';
import { compileTemplate, findTemplatesDir } from './utils';

interface GenerateOptions {
  dryRun?: boolean;
  force?: boolean;
}

interface TemplateMapping {
  template: string;
  output: string;
}

const TEMPLATE_MAPPINGS: TemplateMapping[] = [
  { template: 'AGENTS.md.hbs', output: 'AGENTS.md' },
  { template: 'docs/architecture.md.hbs', output: 'docs/architecture.md' },
  { template: 'docs/agents/principles.md.hbs', output: 'docs/agents/principles.md' },
  { template: 'docs/agents/tasks.md.hbs', output: 'docs/agents/tasks.md' },
  { template: 'docs/agents/design.md.hbs', output: 'docs/agents/design.md' },
  { template: 'docs/agents/review.md.hbs', output: 'docs/agents/review.md' },
  { template: 'docs/agents/vcs.md.hbs', output: 'docs/agents/vcs.md' },
  { template: 'docs/agents/adr.md.hbs', output: 'docs/agents/adr.md' },
  { template: 'docs/agents/brainstorm.md.hbs', output: 'docs/agents/brainstorm.md' },
  { template: 'docs/agents/think-out-of-box.md.hbs', output: 'docs/agents/think-out-of-box.md' },
  { template: 'docs/agents/tech_debt_tracker.md.hbs', output: 'docs/tech_debt_tracker.md' },
];

export async function generate(
  answers: ProjectAnswers,
  options: GenerateOptions = {}
): Promise<void> {
  const templatesDir = findTemplatesDir();
  const cwd = process.cwd();

  // Compile all templates
  const files: { path: string; content: string }[] = [];
  let skipped = 0;

  for (const mapping of TEMPLATE_MAPPINGS) {
    const templatePath = join(templatesDir, mapping.template);
    if (!existsSync(templatePath)) {
      console.warn(`  ⚠ 模板缺失，跳过：${mapping.template}`);
      skipped++;
      continue;
    }

    const templateContent = readFileSync(templatePath, 'utf-8');
    const template = compileTemplate(templateContent);
    const rendered = template(answers);

    const outputPath = join(cwd, mapping.output);
    files.push({ path: outputPath, content: rendered });
  }

  if (files.length === 0) {
    console.error('❌ 没有找到任何模板文件，无法生成。');
    process.exit(1);
  }

  // Dry-run: just print
  if (options.dryRun) {
    console.log('\n📝 dry-run 模式 — 不会写入文件：\n');
    for (const file of files) {
      console.log(`  ${relative(cwd, file.path)}`);
    }
    console.log(`\n共 ${files.length} 个文件${skipped > 0 ? `（跳过 ${skipped} 个缺失模板）` : ''}。`);
    return;
  }

  // Check for conflicts
  if (!options.force) {
    const conflicts = files.filter(f => existsSync(f.path));
    if (conflicts.length > 0) {
      console.log('\n⚠ 以下文件已存在：');
      for (const f of conflicts) {
        console.log(`  ${relative(cwd, f.path)}`);
      }
      console.log('\n使用 --force 强制覆盖，或先备份再重试。');
      process.exit(1);
    }
  }

  // Write files
  console.log('');
  for (const file of files) {
    mkdirSync(dirname(file.path), { recursive: true });
    writeFileSync(file.path, file.content, 'utf-8');
    console.log(`  ✅ ${relative(cwd, file.path)}`);
  }

  console.log(`\n🎉 完成！已生成 ${files.length} 个文件。`);
  console.log('   阅读 AGENTS.md 了解如何使用这套规范。');
}
