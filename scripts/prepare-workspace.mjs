import { cpSync, rmSync, renameSync, readFileSync, writeFileSync } from 'node:fs';
import vm from 'node:vm';
import { execFileSync } from 'node:child_process';
execFileSync(process.execPath, ['tools/build-positions.cjs']);
execFileSync(process.execPath, ['tools/build-role-bank.cjs']);
execFileSync(process.execPath, ['tools/build-module-contracts.cjs']);
execFileSync(process.execPath, ['tools/build-case-index.cjs']);
execFileSync(process.execPath, ['tools/build-feedback.cjs']);
const context = { window: {} };
vm.runInNewContext(readFileSync('web/case-data.js', 'utf8'), context);
writeFileSync(
  'server/pilot-catalog.json',
  JSON.stringify(
    context.window.CASE_CATALOG.map(c => ({
      id: c.id,
      title: c.title,
      version: c.version,
      outputs: c.tasks,
      wordFile: c.wordFile,
      excelFile: c.excelFile,
    })),
    null,
    2
  ) + '\n'
);
writeFileSync(
  'server/pilot-learning-catalog.json',
  JSON.stringify(
    context.window.CASE_CATALOG.map(c => ({
      id: c.id,
      version: c.version,
      learning: c.learning,
      update: c.update,
    })),
    null,
    2
  ) + '\n'
);
writeFileSync(
  'server/pilot-review-catalog.json',
  JSON.stringify(
    context.window.CASE_CATALOG.map(c => ({
      id: c.id,
      version: c.version,
      rubric: c.rubric.map(r => ({ name: r.name, evidence: r.evidence, anchors: r.anchors })),
    })),
    null,
    2
  ) + '\n'
);
rmSync('public', { recursive: true, force: true });
cpSync('web', 'public', { recursive: true });
renameSync('public/index.html', 'public/workspace.html');
