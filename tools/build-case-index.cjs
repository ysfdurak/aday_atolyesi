const fs = require('node:fs'),
  vm = require('node:vm'),
  ctx = { window: {} };
for (const f of ['case-archive-v1.js', 'case-data.js'])
  vm.runInNewContext(fs.readFileSync('web/' + f, 'utf8'), ctx);
const metadata = c => ({
  id: c.id,
  version: c.version,
  title: c.title,
  company: c.company,
  brief: c.brief,
  roles: c.roles,
  level: c.level,
  kind: c.kind,
  minutes: c.minutes,
  tasks: c.tasks,
  rubric: c.rubric.map(r => ({ name: r.name })),
  wordFile: c.wordFile,
  excelFile: c.excelFile,
  learning: c.learning ? { transfer: c.learning.transfer } : undefined,
});
fs.writeFileSync(
  'web/case-index.js',
  'window.CASE_CATALOG=' +
    JSON.stringify(ctx.window.CASE_CATALOG.map(metadata)) +
    ';\nwindow.CASE_ARCHIVE=' +
    JSON.stringify(ctx.window.CASE_ARCHIVE.map(metadata)) +
    ';\n'
);
console.log(
  'Case index: ' + fs.statSync('web/case-index.js').size + ' bytes; full documents load on demand.'
);
