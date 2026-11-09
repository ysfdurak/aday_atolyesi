const fs = require('node:fs'),
  vm = require('node:vm'),
  assert = require('node:assert/strict'),
  crypto = require('node:crypto').webcrypto;
const M = require('./web/modules/mizac/engine.js');
assert.equal(M.ITEMS.length, 96);
assert.equal(M.DIMS.length, 8);
assert.equal(M.SCENARIOS.length, 6);
assert.equal(M.FACETS ? Object.keys(M.FACETS).length : 0, 8);
const s = {
  answers: Object.fromEntries(M.ITEMS.map(q => [q.id, q.reverse ? 1 : 5])),
  scenarios: Object.fromEntries(M.SCENARIOS.map((_, i) => [i, 0])),
  motives: [0, 3],
  complete: true,
};
assert(M.isComplete(s));
assert(M.score(s.answers).every(d => d.score === 100));
assert(M.facetScores(s.answers).every(d => d.score === 100));
const reverse = { answers: Object.fromEntries(M.ITEMS.map(q => [q.id, q.reverse ? 5 : 1])) };
assert(M.score(reverse.answers).every(d => d.score === 0));
const allOne = { ...s, answers: Object.fromEntries(M.ITEMS.map(q => [q.id, 1])) };
assert(M.quality(allOne.answers).flags.length);
assert(!M.isComplete({ ...s, motives: [0, 0] }));
assert(!M.isComplete({ ...s, scenarios: { ...s.scenarios, 0: 99 } }));
assert(!M.isComplete({ ...s, answers: { ...s.answers, [M.ITEMS[0].id]: 8 } }));
assert(M.score({ [M.ITEMS[0].id]: 8 }).every(d => d.score === null));
const x = { window: null, crypto };
x.window = x;
vm.createContext(x);
vm.runInContext(fs.readFileSync('web/module-contracts.js', 'utf8'), x);
vm.runInContext(fs.readFileSync('web/core.js', 'utf8'), x);
const storage = v => ({ getItem: k => (k in v ? JSON.stringify(v[k]) : null) });
assert(x.AA.snapshot(storage({ 'mizac-v2': s })).m.complete);
assert(!x.AA.snapshot(storage({ 'mizac-v2': { ...s, motives: [0, 0] } })).m.complete);
assert(!x.AA.snapshot(storage({ 'mizac-v2': { ...s, demo: true } })).m.complete);
const C = { window: {} };
vm.runInNewContext(fs.readFileSync('web/modules/rol/content.js', 'utf8'), C);
const bank = C.window.CONTENT;
const profile = {
  roleType: 'analyst',
  roleTitle: 'Analist',
  depth: 'standard',
  priorities: Object.fromEntries(
    bank.dimensions.map(d => [d.id, ['gelisim', 'delegasyon', 'performans'].includes(d.id) ? 0 : 1])
  ),
};
const active = bank.items.filter(
    q => q.roles.includes('analyst') && !q.positions && q.core && profile.priorities[q.dim] > 0
  ),
  answers = Object.fromEntries(
    active.map(q => [q.id, q.type === 'plan' ? [0, 1] : q.type === 'rank' ? [0, 1, 2, 3] : 0])
  );
let r = x.AA.snapshot(
  storage({ 'rol-atolyesi-v1': { version: '0.4.1', profile, answers, completed: true } })
).r;
assert.equal(r.activeTotal, active.length);
assert.equal(r.activeAnswered, active.length);
assert(r.completed);
assert(
  !x.AA.snapshot(storage({ 'rol-atolyesi-v1': { version: '0.4.1', profile, answers: {}, completed: true } }))
    .r.completed
);
assert(
  !x.AA.snapshot(storage({ 'rol-atolyesi-v1': { version: '0.1.0', answers: { S01: 1 }, completed: true } })).r
    .completed
);
// The combined module bridge must work with all twelve competencies and each common target role.
for (const role of ['analyst', 'operations', 'graduate', 'lead', 'custom']) {
  const nodes = [],
    values = {
      'aa-state-v1': JSON.stringify({
        profile: { role, title: 'QA hedefi', people: role === 'lead', employed: false },
      }),
    };
  const ctx = {
    window: null,
    document: {
      head: { append() {} },
      body: { append() {} },
      createElement: () => ({ style: {}, append() {}, innerHTML: '' }),
      querySelector: () => ({ innerHTML: '', addEventListener() {} }),
      querySelectorAll: () => [],
      getElementById: () => ({ onclick: null }),
    },
    localStorage: { getItem: k => values[k] || null, setItem: (k, v) => (values[k] = v) },
    location: { pathname: '/modules/rol/index.html', search: '' },
    URLSearchParams,
    console,
  };
  ctx.window = ctx;
  vm.createContext(ctx);
  for (const f of ['modules/rol/content.js', 'modules/rol/app.js', 'module-bridge.js'])
    vm.runInContext(fs.readFileSync('web/' + f, 'utf8'), ctx);
  const p = vm.runInContext('state.profile', ctx);
  assert.equal(
    p.roleType,
    {
      analyst: 'analyst',
      operations: 'operations_specialist',
      graduate: 'graduate',
      lead: 'team',
      custom: 'custom',
    }[role]
  );
  assert(ctx.window.RolEngine.validProfile(p));
  assert(!vm.runInContext('report()', ctx).includes('undefined'));
}
console.log(
  'PASS: Mizaç item/facet polarity, invalid/incomplete/demo isolation, candidate quality notes, current-role summary counts, old coverage not marked complete, and five target roles through the live module bridge.'
);
