const fs = require('node:fs'),
  vm = require('node:vm'),
  assert = require('node:assert/strict');
function setup(initial) {
  const values = new Map(initial ? [['rol-atolyesi-v1', JSON.stringify(initial)]] : []),
    nodes = new Map(),
    c = {
      window: null,
      document: {
        querySelector: s => {
          if (!nodes.has(s)) nodes.set(s, { innerHTML: '', addEventListener() {} });
          return nodes.get(s);
        },
        querySelectorAll: () => [],
      },
      localStorage: { getItem: k => values.get(k) || null, setItem: (k, v) => values.set(k, v) },
      console,
    };
  c.window = c;
  vm.createContext(c);
  for (const f of ['position-context.js', 'modules/rol/content.js', 'modules/rol/app.js'])
    vm.runInContext(fs.readFileSync('web/' + f, 'utf8'), c);
  return { c, values, nodes };
}
const { c } = setup(),
  C = c.CONTENT,
  E = c.RolEngine,
  plain = x => JSON.parse(JSON.stringify(x)),
  single = C.items.filter(q => ['choice', 'info'].includes(q.type)),
  best = q => q.options.findIndex(o => o.score === 3);
assert.equal(single.length, 174);
const ranks = [0, 0, 0, 0],
  wordRanks = [0, 0, 0, 0],
  beforeLongest = C.previousItems.filter(
    q =>
      ['choice', 'info'].includes(q.type) &&
      q.options[best(q)].text.length === Math.max(...q.options.map(o => o.text.length))
  ).length;
for (const q of single) {
  const i = best(q),
    len = q.options[i].text.length,
    words = q.options[i].text.trim().split(/\s+/).length;
  ranks[q.options.filter((o, j) => j !== i && o.text.length < len).length]++;
  wordRanks[q.options.filter((o, j) => j !== i && o.text.trim().split(/\s+/).length < words).length]++;
  assert(
    Math.max(...q.options.map(o => o.text.length)) / Math.min(...q.options.map(o => o.text.length)) < 1.8,
    q.id + ' disproportionate length'
  );
}
assert.equal(beforeLongest, 172);
assert(
  ranks.every(n => n >= 38 && n <= 49),
  ranks
);
assert(
  wordRanks.every(n => n / single.length < 0.36),
  wordRanks
);
let configs = 0,
  positionsMaxLongest = 0;
for (const p of c.Positions.positions)
  for (const seniority of p.people ? ['lead'] : ['entry', 'experienced', 'senior'])
    for (const depth of ['standard', 'full']) {
      const profile = {
          positionId: p.id,
          seniority,
          roleType: p.roleType,
          roleTitle: p.name,
          depth,
          priorities: c.Positions.priorities(p.id, C.dimensions),
        },
        r = { profile },
        active = E.activeItems(r),
        qs = active.filter(q => ['choice', 'info'].includes(q.type)),
        counts = [0, 0, 0, 0],
        letters = [];
      for (const q of qs) {
        const order = plain(E.optionOrder(q, r));
        assert.deepEqual([...order].sort(), [0, 1, 2, 3]);
        assert.deepEqual(order, plain(E.optionOrder(q, r)));
        const slot = order.indexOf(best(q));
        counts[slot]++;
        letters.push(slot);
        assert.equal(E.raw(q, order[slot]), 3);
      }
      assert(Math.max(...counts) - Math.min(...counts) <= 1);
      assert(!letters.some((v, i) => i > 1 && v === letters[i - 1] && v === letters[i - 2]));
      positionsMaxLongest = Math.max(
        positionsMaxLongest,
        qs.filter(q => q.options[best(q)].text.length === Math.max(...q.options.map(o => o.text.length)))
          .length / qs.length
      );
      configs++;
    }
for (let n = 1; n <= 200; n++) {
  c.N = n;
  const slots = plain(vm.runInContext("balancedSlots(N,'QA'+N)", c));
  assert.equal(slots.length, n);
  assert(slots.every(v => Number.isInteger(v) && v >= 0 && v < 4));
  assert(!slots.some((v, i) => i > 1 && v === slots[i - 1] && v === slots[i - 2]));
  const counts = [0, 1, 2, 3].map(v => slots.filter(x => x === v).length);
  assert(Math.max(...counts) - Math.min(...counts) <= 1);
}
// Real UI values and feedback use canonical identities, even when letters move.
c.RECORD = {
  version: C.version,
  index: 0,
  profile: {
    roleType: 'custom',
    roleTitle: 'QA',
    depth: 'full',
    priorities: Object.fromEntries(C.dimensions.map(d => [d.id, 2])),
  },
  answers: {},
  context: { purpose: 'Gelişim' },
};
vm.runInContext('state=RECORD', c);
const q = E.activeItems(c.RECORD)[0],
  order = plain(E.optionOrder(q, c.RECORD));
const html = vm.runInContext('assessment()', c);
order.forEach((idx, j) =>
  assert(html.includes('value="' + idx + '"') && html.includes(String.fromCharCode(65 + j)))
);
c.Q = q;
const feedback = vm.runInContext('feedback(Q,0)', c);
order.forEach((idx, j) =>
  assert(
    feedback.includes(
      String.fromCharCode(65 + j) +
        ' · ' +
        q.options[idx].text.replace(
          /[&<>"']/g,
          x => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[x]
        )
    )
  )
);
const old = {
  version: '0.4.0',
  profile: c.RECORD.profile,
  context: { purpose: 'Gelişim' },
  answers: { S01: 2 },
  index: 0,
  completed: true,
  positionSessions: { 'data_analyst@entry': { answers: { R10: 0 } } },
};
const migrated = setup(old),
  m = JSON.parse(migrated.values.get('rol-atolyesi-v1'));
assert.equal(m.version, '0.4.1');
assert.deepEqual(m.answers, {});
assert.deepEqual(m.positionSessions, {});
assert.equal(m.editionArchive.length, 1);
assert.equal(m.editionArchive[0].answers.S01, 2);
assert.equal(m.editionArchive[0].positionSessions['data_analyst@entry'].answers.R10, 0);
assert.equal(
  m.editionArchive[0].questions.find(q => q.id === 'S01').options[2].text,
  C.previousItems.find(q => q.id === 'S01').options[2].text
);
assert.equal(m.editionArchive[0].questions.length, 2);
assert(migrated.nodes.get('#app').innerHTML.includes('Önceki yanıtları indir'));
migrated.c.download = (name, obj) => {
  migrated.c.DOWNLOAD = { name, obj };
};
vm.runInContext("action('exportEditionArchive')", migrated.c);
assert.equal(migrated.c.DOWNLOAD.obj.editions[0].answers.S01, 2);
const twice = setup(m);
assert.equal(JSON.parse(twice.values.get('rol-atolyesi-v1')).editionArchive.length, 1);
console.log(
  JSON.stringify({
    passed: true,
    beforeLongest,
    afterLengthRanks: ranks,
    afterWordRanks: wordRanks,
    positionDepthConfigurations: configs,
    maxPositionLongestRate: +positionsMaxLongest.toFixed(3),
    checks:
      'canonical scoring, stable display mapping, balanced keys, no triple letters, feedback alignment, original text archive, reload idempotence',
  })
);
