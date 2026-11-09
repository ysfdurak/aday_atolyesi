const fs = require('node:fs'),
  vm = require('node:vm'),
  assert = require('node:assert/strict');
const ctx = {
  window: null,
  document: { querySelector: () => ({ innerHTML: '', addEventListener() {} }), querySelectorAll: () => [] },
  localStorage: { getItem: () => null, setItem() {} },
  console,
};
ctx.window = ctx;
vm.createContext(ctx);
for (const f of ['position-context.js', 'modules/rol/content.js', 'modules/rol/app.js'])
  vm.runInContext(fs.readFileSync('web/' + f, 'utf8'), ctx);
const P = ctx.Positions,
  E = ctx.RolEngine,
  C = ctx.CONTENT;
assert.equal(P.positions.length, 20);
assert.equal(C.dimensions.length, 24);
assert.equal(C.items.length, 187);
const best = q => {
  const ids = q.options.map((_, i) => i).sort((a, b) => q.options[b].score - q.options[a].score);
  return q.type === 'plan' ? ids.slice(0, 2) : q.type === 'rank' ? ids : ids[0];
};
let configurations = 0;
for (const pos of P.positions) {
  for (const seniority of pos.people ? ['lead'] : ['entry', 'experienced', 'senior']) {
    const choice = { schema: 1, positionId: pos.id, seniority };
    assert(P.valid(choice));
    const profile = {
      positionId: pos.id,
      seniority,
      roleType: pos.roleType,
      roleTitle: pos.name,
      depth: seniority === 'senior' || seniority === 'lead' ? 'full' : 'standard',
      priorities: P.priorities(pos.id, C.dimensions),
    };
    assert(E.validProfile(profile), pos.id);
    const active = E.activeItems({ profile });
    assert(
      active.some(q => q.positions?.includes(pos.id)),
      pos.id + ' missing position case'
    );
    assert(active.every(q => !q.positions || q.positions.includes(pos.id)));
    assert(active.every(q => q.roles.includes(pos.roleType)));
    if (!pos.people) assert(active.every(q => !q.id.startsWith('S')));
    const answers = Object.fromEntries(active.map(q => [q.id, best(q)])),
      r = E.results({ profile, answers });
    assert(r.every(d => d.n === d.total && d.index === 100));
    const rec = P.recommendation(choice, []);
    assert.equal(rec.domains.length, 3);
    assert(rec.domains.every(d => d.level === (['senior', 'lead'].includes(seniority) ? 2 : 1)));
    configurations++;
  }
}
const now = Date.now(),
  choice = { schema: 1, positionId: 'data_analyst', seniority: 'entry' },
  trial = (i, change = {}) => ({
    cat: 'quant',
    level: 1,
    mode: 'learn',
    correct: true,
    hinted: false,
    at: now - i * 1000,
    ...change,
  });
assert.equal(
  P.recommendation(
    choice,
    Array.from({ length: 23 }, (_, i) => trial(i)),
    now
  ).domains[0].level,
  1
);
assert.equal(
  P.recommendation(
    choice,
    Array.from({ length: 24 }, (_, i) => trial(i)),
    now
  ).domains[0].level,
  2
);
for (const change of [
  { hinted: true },
  { mode: 'speed' },
  { mode: 'exam' },
  { synthetic: true },
  { sample: true },
  { at: now - 31 * 86400000 },
  { at: now + 10000 },
])
  assert.equal(
    P.recommendation(
      choice,
      Array.from({ length: 30 }, (_, i) => trial(i, change)),
      now
    ).domains[0].level,
    1
  );
assert.equal(
  P.recommendation(
    { ...choice, seniority: 'senior' },
    Array.from({ length: 24 }, (_, i) => trial(i, { level: 2, correct: false })),
    now
  ).domains[0].level,
  1
);
assert.equal(
  P.recommendation(
    choice,
    Array.from({ length: 24 }, (_, i) => trial(i, { level: 3 })),
    now
  ).domains[0].level,
  3
);
const storage = new Map(),
  store = { getItem: k => storage.get(k) || null, setItem: (k, v) => storage.set(k, v) };
P.save(store, choice);
assert.equal(P.load(store).positionId, 'data_analyst');
assert.throws(() => P.save(store, { schema: 1, positionId: 'nonsense', seniority: 'entry' }));
assert(!P.valid({ schema: 1, positionId: 'team_lead', seniority: 'entry' }));
console.log(
  'PASS: ' +
    configurations +
    ' position/seniority combinations, own question inclusion and cross-position exclusion, 24 competency coverage, unchanged answer scoring, 24-trial adaptation gates and hinted/speed/exam/synthetic/stale isolation.'
);
