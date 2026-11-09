const fs = require('node:fs'),
  vm = require('node:vm'),
  assert = require('node:assert/strict');
const ctx = {
  window: {},
  document: { querySelector: () => ({ innerHTML: '', addEventListener() {} }), querySelectorAll: () => [] },
  localStorage: { getItem: () => null, setItem() {} },
  console,
};
vm.createContext(ctx);
vm.runInContext(fs.readFileSync('web/modules/rol/content.js', 'utf8'), ctx);
vm.runInContext(fs.readFileSync('web/modules/rol/app.js', 'utf8'), ctx);
const C = ctx.window.CONTENT,
  E = ctx.window.RolEngine;
assert.equal(C.items.length, 187);
assert.equal(C.dimensions.length, 24);
assert.equal(new Set(C.items.map(q => q.id)).size, 187);
assert.equal(E.roleTemplates.length, 7);
const base = JSON.parse(fs.readFileSync('content/role-base-v020.json'));
for (const old of base.items) {
  const current = C.items.find(q => q.id === old.id);
  for (const key of ['id', 'dim', 'scene', 'title', 'type', 'core'])
    assert.deepEqual(JSON.parse(JSON.stringify(current[key])), old[key], old.id + ' changed');
  assert.deepEqual(
    Array.from(current.options, o => [o.score, o.why]),
    old.options.map(o => [o.score, o.why])
  );
}
for (const d of C.dimensions) {
  assert.equal(C.items.filter(q => q.dim === d.id).length, d.poolSize);
  assert.equal(C.items.filter(q => q.dim === d.id && q.core).length, d.coreCount);
}
const best = q => {
  const b = q.options.map((o, i) => i).sort((a, b) => q.options[b].score - q.options[a].score);
  return q.type === 'rank' ? b : q.type === 'plan' ? b.slice(0, 2) : b[0];
};
for (const q of C.items) {
  assert(q.roles.length);
  assert(q.scene.length > 55);
  assert.equal(E.raw(q, undefined), null);
  assert.equal(E.raw(q, best(q)), 3, q.id);
  assert(!E.done(q, [-1, 999]));
  if (q.type === 'plan') {
    assert(!E.done(q, [0, 0]));
    assert(!E.done(q, [0]));
  }
  if (q.type === 'rank') {
    assert.equal(E.raw(q, [...best(q)].reverse()), 0);
  }
}
const ideal = Object.fromEntries(C.items.map(q => [q.id, best(q)]));
for (const role of E.roleTemplates) {
  for (const depth of ['standard', 'full']) {
    const record = {
      profile: { roleType: role.id, roleTitle: role.name, depth, priorities: role.priorities },
      answers: ideal,
      context: { code: 'QA', purpose: 'Gelişim' },
    };
    assert(E.validProfile(record.profile));
    const items = E.activeItems(record),
      dims = E.activeDimensions(record);
    assert(items.length);
    assert(items.every(q => q.roles.includes(role.id) && (depth === 'full' || q.core)));
    const result = E.results(record);
    assert.equal(result.length, dims.length);
    assert(result.every(d => d.n === d.total && d.avg === 3 && d.band === 'Destekleyici cevaplar'));
    if (!['team', 'operations', 'custom'].includes(role.id)) {
      assert(items.every(q => !['gelisim', 'delegasyon', 'performans'].includes(q.dim)));
      assert(items.every(q => q.id.startsWith('R') || q.id.startsWith('T')));
    }
    ctx.TEST_RECORD = record;
    vm.runInContext('state=TEST_RECORD;sample=false;tab="overview";', ctx);
    const html = vm.runInContext('report()', ctx);
    assert(html.includes(role.name));
    assert(!html.includes('undefined'));
    assert(!html.includes('NaN'));
    assert(html.includes(' / ' + items.length));
  }
}
const role = id => E.roleTemplates.find(r => r.id === id);
assert(
  E.activeItems({
    profile: { roleType: 'analyst', depth: 'full', priorities: role('analyst').priorities },
  }).some(q => q.title === 'Bütçe sapmasının bileşenleri')
);
assert(
  E.activeItems({
    profile: {
      roleType: 'operations_specialist',
      depth: 'standard',
      priorities: role('operations_specialist').priorities,
    },
  }).some(q => q.title === 'Kesim saatinden önce')
);
assert(
  !E.validProfile({
    roleType: 'analyst',
    roleTitle: 'Analist',
    priorities: { ...role('analyst').priorities, delegasyon: 2 },
  })
);
const p = {
  roleType: 'custom',
  roleTitle: 'Analitik çalışma',
  depth: 'full',
  priorities: Object.fromEntries(C.dimensions.map(d => [d.id, d.id === 'analitik' ? 2 : 0])),
};
assert(E.validProfile(p));
assert.equal(E.activeDimensions({ profile: p }).length, 1);
assert(E.activeItems({ profile: p }).every(q => q.dim === 'analitik'));
const partial = E.results({
  profile: p,
  answers: { [E.activeItems({ profile: p })[0].id]: best(E.activeItems({ profile: p })[0]) },
})[0];
assert.equal(partial.band, 'Eksik kapsam');
assert.equal(partial.index, null);
assert(E.interpretation(partial).includes('genel yetkinlik yorumu üretilmedi'));
const blank = E.results({ answers: {} });
assert(blank.every(d => d.n === 0 && d.avg === null));
console.log(
  'PASS: 187 original scenarios, 76 legacy scenario identities and scoring preserved; option wording editorially revised, 24 competencies, seven role routes × two depths, role-specific questions, nonmanager isolation, selected-domain coverage and incomplete-report safeguards.'
);
