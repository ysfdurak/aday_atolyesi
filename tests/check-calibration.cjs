// Ölçüt örnek cevapları ve değerlendirici kalibrasyonu.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const { execFileSync } = require('node:child_process');

execFileSync(process.execPath, ['tools/build-rubric-examples.mjs', '--check'], { stdio: 'pipe' });
const data = JSON.parse(fs.readFileSync('content/rubric-examples.json', 'utf8'));
const catalog = JSON.parse(fs.readFileSync('server/pilot-review-catalog.json', 'utf8'));
assert.equal(data.status, 'taslak');
assert.equal(data.statusLabel, 'Uzman incelemesi bekleyen taslak');

// Her ölçütün zayıf, yeterli ve güçlü örneği var; fazlası yok; örnekler birbirinden farklı.
let n = 0;
for (const c of catalog)
  for (const r of c.rubric) {
    const list = data.cases[c.id]?.[r.name];
    assert.ok(Array.isArray(list) && list.length === 3, `${c.id} · ${r.name}: üç örnek olmalı`);
    assert.equal(new Set(list).size, 3, `${c.id} · ${r.name}: örnekler aynı`);
    assert.ok(
      list.every(t => typeof t === 'string' && t.length >= 10 && t.length <= 400),
      `${c.id} · ${r.name}: uzunluk`
    );
    n++;
  }
for (const [id, items] of Object.entries(data.cases))
  for (const name of Object.keys(items))
    assert.ok(
      catalog.find(c => c.id === id)?.rubric.some(r => r.name === name),
      `fazla örnek: ${id} · ${name}`
    );

// Tarayıcı modülü
const ctx = {
  window: {},
  localStorage: {
    s: {},
    getItem(k) {
      return this.s[k] ?? null;
    },
    setItem(k, v) {
      this.s[k] = String(v);
    },
  },
};
ctx.window.localStorage = ctx.localStorage;
vm.createContext(ctx);
vm.runInContext(fs.readFileSync('web/rubric-examples.js', 'utf8'), ctx);
vm.runInContext(
  'var CASE_CATALOG=window.CASE_CATALOG=' +
    JSON.stringify(catalog.map(c => ({ id: c.id, title: c.id, rubric: c.rubric }))) +
    ';',
  ctx
);
vm.runInContext(fs.readFileSync('web/calibration-ui.js', 'utf8'), ctx);
const C = ctx.window.CalibrationUI;
const kpi = ctx.window.CASE_CATALOG[0];
const items = C.synthetic(kpi);
assert.equal(items.length, kpi.rubric.length);
assert.equal(JSON.stringify(C.synthetic(kpi)), JSON.stringify(items), 'sentetik teslim sabit olmalı');
assert.ok(
  items.every(it => [1, 2, 3].includes(it.level) && data.cases[kpi.id][it.name][it.level - 1] === it.text)
);
assert.ok(new Set(items.map(it => it.level)).size > 1, 'sentetik teslim farklı seviyeleri karıştırmalı');

// Fark kaynağı: en büyük fark hangi ölçütteyse o gösterilir; toplam puan üretilmez.
const a = items.map(it => it.level),
  b = a.map((v, k) => (k === 2 ? (v >= 2 ? v - 2 : v + 2) : k === 1 ? (v === 3 ? 2 : v + 1) : v));
const r = C.compare(items, a, b);
assert.ok(r.complete);
assert.equal(r.max, 2);
assert.equal(JSON.stringify(r.source.map(x => x.name)), JSON.stringify([items[2].name]));
assert.equal(r.agree, items.length - 2);
assert.ok(!('total' in r), 'toplam puan üretilmemeli');
assert.equal(C.compare(items, a, []).complete, false);

// Ekran: taslak etiketi ve örnekler görünür
const html = C.view();
assert.ok(html.includes('Uzman incelemesi bekleyen taslak'));
assert.ok(html.includes(items[0].text.replace(/'/g, '&#39;').replace(/"/g, '&quot;')));
assert.ok(C.formExamples(kpi.id, kpi.rubric[0].name).includes('Uzman incelemesi bekleyen taslak'));
console.log(`${n} ölçüt × 3 örnek; kalibrasyon farkı ölçüt bazında bulundu.`);
