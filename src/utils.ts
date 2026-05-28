import Handlebars from 'handlebars';
import { existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

// --- Helpers ---

Handlebars.registerHelper('eq', function (this: unknown, a: unknown, b: unknown) {
  return a === b;
});

Handlebars.registerHelper('ne', function (this: unknown, a: unknown, b: unknown) {
  return a !== b;
});

Handlebars.registerHelper('contains', function (this: unknown, arr: unknown, item: unknown) {
  if (!Array.isArray(arr)) return false;
  return arr.includes(item);
});

Handlebars.registerHelper('notEmpty', function (this: unknown, arr: unknown) {
  return Array.isArray(arr) && arr.length > 0;
});

Handlebars.registerHelper('principleName', function (this: unknown, id: string) {
  const names: Record<string, string> = {
    'correctness-first': '正确性优先',
    'simplicity': '简单至上',
    'explicit-over-implicit': '显式优于隐式',
    'test-first': '测试驱动',
    'safe-over-fast': '安全优于速度',
    'single-responsibility': '单一职责',
    'failfast': '快速失败',
  };
  return names[id] || id;
});

Handlebars.registerHelper('principleDesc', function (this: unknown, id: string) {
  const descs: Record<string, string> = {
    'correctness-first': '能跑对 > 跑得快 > 写得短。先保证正确，再优化性能，最后追求简洁。',
    'simplicity': '最简单的能用的方案就是最好的。不要过度设计，不要为未来不确定的需求写代码。',
    'explicit-over-implicit': '代码意图一目了然。避免魔法、隐式约定、过度抽象。读代码应该像读句子。',
    'test-first': '先写测试再写实现。测试即文档，测试即规格。不可测试的代码就是不可维护的代码。',
    'safe-over-fast': '涉及数据、资金、权限时，安全优先于开发速度。宁可慢一点，不要出事故。',
    'single-responsibility': '一个模块只做一件事，做好一件事。职责清晰的代码才可组合、可测试、可替换。',
    'failfast': '不过度设计、过度防御、过度容错。让异常大声暴露而非静默退化。',
  };
  return descs[id] || '';
});

// --- Template directory resolution ---

function getDirname(): string {
  return typeof import.meta.dirname !== 'undefined'
    ? import.meta.dirname
    : dirname(fileURLToPath(import.meta.url));
}

export function findTemplatesDir(): string {
  const base = getDirname();
  const candidates = [
    // Dev: running from repo root (src/utils.ts → ../../templates/default)
    resolve(base, '../../templates/default'),
    // Dev: running from repo root with cwd fallback
    resolve(process.cwd(), 'templates/default'),
    // Production: templates alongside compiled binary in dist/
    resolve(base, 'templates/default'),
    // Production: templates at package root
    resolve(base, '../templates/default'),
  ];

  for (const dir of candidates) {
    if (existsSync(dir)) return dir;
  }

  throw new Error(
    '找不到模板目录。请确保 templates/default/ 目录存在。\n' +
    'Cannot find templates directory. Searched:\n' +
    candidates.map(d => `  - ${d}`).join('\n')
  );
}

// --- Template compilation ---

export function compileTemplate(templateStr: string) {
  return Handlebars.compile(templateStr, { noEscape: true });
}
