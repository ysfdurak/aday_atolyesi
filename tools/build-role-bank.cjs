const fs = require('node:fs');
const base = JSON.parse(fs.readFileSync('content/role-base-v020.json')),
  extra = JSON.parse(fs.readFileSync('content/role-expansion.json'));
const expanded = JSON.parse(fs.readFileSync('content/competencies-v040.json'));
const positional = JSON.parse(fs.readFileSync('content/position-items.json'));
base.dimensions.push(...expanded.dimensions);
base.version = '0.4.1';
base.items = base.items
  .map(q => ({ ...q, roles: ['team', 'operations', 'custom'] }))
  .concat(extra, expanded.items, positional);
const editorial = JSON.parse(fs.readFileSync('content/role-editorial-v041.json'));
base.previousItems = JSON.parse(JSON.stringify(base.items));
for (const q of base.items) {
  const texts = editorial.options[q.id];
  if (!texts) continue;
  if (texts.length !== q.options.length) throw Error('Editorial option count: ' + q.id);
  q.options.forEach((o, i) => (o.text = texts[i]));
}
for (const d of base.dimensions) {
  if (d.id === 'adalet') d.name = 'Adil ve sorumlu yaklaşım';
  d.category = ['gelisim', 'delegasyon', 'performans'].includes(d.id)
    ? 'İnsan yönetimi'
    : 'Rol ve iş davranışları';
  const qs = base.items.filter(q => q.dim === d.id);
  d.poolSize = qs.length;
  d.coreCount = qs.filter(q => q.core).length;
  d.coverageRationale =
    'Soru sayısı alt davranış ve rol bağlamlarının kapsamına göre değişir. Rol ve paket derinliği seçimiyle gerçek adet hesaplanır.';
}
fs.writeFileSync('web/modules/rol/content.js', 'window.CONTENT = ' + JSON.stringify(base) + ';\n');
console.log(base.items.length + ' scenarios / ' + base.dimensions.length + ' competencies');
