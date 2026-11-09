const fs = require('node:fs'),
  vm = require('node:vm'),
  assert = require('node:assert/strict');
const x = { window: null, crypto: require('node:crypto').webcrypto, localStorage: { getItem: () => null } };
x.window = x;
vm.createContext(x);
for (const f of [
  'case-archive-v1',
  'case-data',
  'case-engine',
  'learning-engine',
  'position-context',
  'module-contracts',
  'core',
  'preparation-plan',
  'evidence-engine',
  'growth-engine',
  'response-data',
])
  vm.runInContext(fs.readFileSync('web/' + f + '.js', 'utf8'), x);
const A = x.AA,
  E = x.CaseEngine,
  L = x.CaseLearning,
  G = x.GrowthEngine,
  B = x.RESPONSE_DATA,
  cat = x.CASE_CATALOG,
  plain = v => JSON.parse(JSON.stringify(v));
let st = A.blank(),
  snap = { r: {}, m: { answers: {} }, z: {}, report: null };
assert.equal(G.priorities(st, snap, cat, B).length, 0);
assert.equal(G.strengths(snap, B).length, 0);
// Real answer scoring agrees with the canonical role engine for every item.
const role = {
  window: {},
  document: { querySelector: () => ({ innerHTML: '', addEventListener() {} }), querySelectorAll: () => [] },
  localStorage: { getItem: () => null, setItem() {} },
};
vm.createContext(role);
for (const f of ['content', 'app'])
  vm.runInContext(fs.readFileSync('web/modules/rol/' + f + '.js', 'utf8'), role);
const R = role.window.RolEngine;
for (const q of B.items) {
  const sorted = q.options.map((_, i) => i).sort((a, b) => q.options[b].score - q.options[a].score),
    best = q.type === 'plan' ? sorted.slice(0, 2) : q.type === 'rank' ? sorted : sorted[0];
  assert.equal(G.raw(q, best), R.raw(q, best), q.id);
  assert.equal(G.raw(q, undefined), null);
  if (q.type === 'plan') assert.equal(G.raw(q, [0, 0]), null);
  if (q.type === 'rank') assert.equal(G.raw(q, [...sorted].reverse()), 0);
}
const q = B.items.find(q => q.id === 'R01'),
  bad = q.options.findIndex(o => o.score === 0),
  profile = {
    roleType: 'analyst',
    positionId: 'process_analyst',
    depth: 'full',
    priorities: Object.fromEntries(B.dimensions.map(d => [d.id, 1])),
  };
snap.r = { version: B.version, profile, answers: { R01: bad } };
let ps = G.priorities(st, snap, cat, B);
assert.equal(ps[0].kind, 'role');
assert.equal(ps[0].evidence, q.options[bad].text);
assert.equal(ps[0].explanation, q.options[bad].why);
assert(ps[0].href.includes('question=R01'));
assert.equal(G.priorities(st, { ...snap, r: { ...snap.r, version: '0.4.0' } }, cat, B).length, 0);
assert.deepEqual(plain(ps), plain(G.priorities(st, { ...snap, m: { answers: { x: 5 } } }, cat, B)));
snap.report = {
  id: 'real1',
  overall: { correct: 1, total: 6, answered: 4 },
  domains: [{ id: 'logic', name: 'Mantık', correct: 1, total: 6, answered: 4 }],
  itemResults: [
    {
      id: 'qi1',
      cat: 'logic',
      answered: true,
      correct: false,
      hinted: false,
      selectedDisplay: 'Yanlış seçenek',
      stem: 'Somut soru',
      diagnostic: 'Bu seçimin kapsamı koşulu karşılamıyor.',
    },
  ],
};
ps = G.priorities(st, snap, cat, B);
assert.equal(ps.length, 2);
assert.equal(ps[1].kind, 'exam');
assert(
  !G.priorities(st, { ...snap, report: { ...snap.report, sample: true } }, cat, B).some(
    p => p.kind === 'exam'
  )
);
assert(
  !G.priorities(
    st,
    { ...snap, report: { ...snap.report, itemResults: [{ ...snap.report.itemResults[0], hinted: true }] } },
    cat,
    B
  ).some(p => p.kind === 'exam')
);
const c = cat.find(c => c.id === 'kpi-paradoksu'),
  target = cat.find(item => item.id === c.learning.transfer),
  make = (c, t, note = '') => {
    let a = E.blank(c);
    a.answers = Object.fromEntries(c.tasks.map((_, i) => ['task' + i, t + ' ' + i]));
    if (note) a.learning = { revisionNote: note };
    return a;
  };
let a = E.submit(c, make(c, 'İlk somut dayanak'), '2026-11-04T10:00Z'),
  first = JSON.stringify(a.submitted);
const review = {
  schema: 'aa-human-review-v1',
  caseId: c.id,
  caseVersion: c.version,
  submissionId: L.sid(a.submitted),
  reviewer: 'QA',
  at: '2026-11-04T10:30Z',
  summary: 'Kapsamı araştır.',
  items: c.rubric.map((_, i) => ({
    index: i,
    rating: i === 0 ? 0 : 2,
    quote: 'İlk somut dayanak 0',
    observation: 'Payda açıklanmamış.',
    next: 'Paydayı açıkça yaz.',
  })),
};
a = L.attach(c, a, review);
st.assessments[E.keyFor(c)] = a;
ps = G.priorities(st, snap, cat, B);
assert.equal(ps[0].kind, 'human');
assert.equal(ps[0].explanation, 'Payda açıklanmamış.');
assert.equal(ps[1].kind, 'role');
a.answers.task0 = 'Son dayanak ve sınır';
a.learning = { revisionNote: 'Paydayı açıkladım.', defense: 'Önceki savunmam.' };
a = E.submit(c, a, '2026-11-04T11:00Z');
st.assessments[E.keyFor(c)] = a;
assert(!a.learning.defense);
assert.equal(a.learning.defenseHistory[0].sourceId, L.sid(a.history[0]));
assert(!G.priorities(st, snap, cat, B).some(p => p.kind === 'human'));
assert.equal(JSON.stringify(a.history[0]), first);
assert(E.validateAttempt(c, a));
const p = G.pair(c, a),
  n = {
    caseKey: E.keyFor(c),
    fromId: p.fromId,
    toId: p.toId,
    criterion: 0,
    firstMissing: false,
    firstQuote: 'İlk somut dayanak 0',
    lastQuote: 'Son dayanak ve sınır',
    reason: 'Payda eklendi.',
    remaining: 'Farklı örnekte sınanacak.',
  };
assert(G.validateComparison(c, a, n));
assert.throws(() => G.validateComparison(c, a, { ...n, lastQuote: 'Uydurma alıntı' }));
assert.throws(() => G.validateComparison(c, a, { ...n, firstMissing: true }));
assert(G.validateComparison(c, a, { ...n, firstMissing: true, firstQuote: '' }));
st.growth = {
  trackId: 'analyst',
  caseId: c.id,
  actions: {},
  comparisons: { [G.comparisonKey(c, p)]: n },
  transfers: {},
  drafts: { qa: { values: { criterion: '', reason: 'Yarım not' } } },
};
assert(G.validateState(st, cat));
a.learning.defense = 'Yeni bilgiye göre savunma';
a.learning.defenseSubmissionId = L.sid(a.submitted);
a.learning.transfer = { caseId: target.id, sourceId: L.sid(a.submitted), at: '2026-11-04T12:00Z' };
st.assessments[E.keyFor(c)] = a;
let b = E.submit(target, make(target, 'Yeni bağlam dayanağı'), '2026-11-04T11:50Z');
st.assessments[E.keyFor(target)] = b;
assert.equal(G.transferPair(st, c, cat), null);
b.answers.task0 = 'Yeni bağlamda uyarlanmış dayanak';
b.learning = { revisionNote: 'Yeni koşula uyarlandı.' };
b = E.submit(target, b, '2026-11-04T12:30Z');
st.assessments[E.keyFor(target)] = b;
const tp = G.transferPair(st, c, cat),
  tn = {
    caseKey: E.keyFor(c),
    targetKey: E.keyFor(target),
    fromId: tp.fromId,
    toId: tp.toId,
    linkedAt: tp.linkedAt,
    sourceCriterion: 0,
    targetCriterion: 0,
    sourceQuote: 'Son dayanak ve sınır',
    targetQuote: 'Yeni bağlamda uyarlanmış dayanak',
    adaptation: 'Aynı yaklaşım yeni koşula uyarlandı.',
    limit: 'Nedensellik doğrulanmadı.',
  };
assert(G.validateTransfer(tp, tn));
assert.throws(() => G.validateTransfer(tp, { ...tn, targetQuote: 'Uydurma' }));
const tk = tn.caseKey + '|' + tn.fromId + '|' + tn.targetKey + '|' + tn.toId;
st.growth.transfers[tk] = tn;
assert(G.validateState(st, cat));
// Selected-only export does not pull an unselected linked target into the dossier.
st.dossier = { exampleIds: [], caseKeys: [E.keyFor(c)], includeModules: false, includeGrowth: true };
let doc = x.Evidence.build(st, snap, cat);
assert(doc.cases[0].changeNote);
assert.equal(doc.growthTransfers.length, 0);
st.dossier.caseKeys.push(E.keyFor(target));
doc = x.Evidence.build(st, snap, cat);
assert.equal(doc.growthTransfers.length, 1);
st.dossier.includeGrowth = false;
doc = x.Evidence.build(st, snap, cat);
assert(!doc.cases[0].changeNote);
assert.equal(doc.growthTransfers.length, 0);
// New revision clears the current defense; old defense and comparison remain historically anchored.
a.answers.task0 += ' Ek açıklama';
a.learning.revisionNote = 'Yeni bulgu eklendi.';
a = E.submit(c, a, '2026-11-04T13:00Z');
st.assessments[E.keyFor(c)] = a;
assert(!a.learning.defense);
assert.equal(G.transferPair(st, c, cat), null);
assert(G.validateState(st, cat));
assert.equal(A.casePhase(st, c).id, 'defense');
a.learning.defense = 'Yeni revizyon savunması';
a.learning.defenseSubmissionId = L.sid(a.submitted);
assert.equal(A.casePhase(st, c).id, 'transfer');
assert(A.validateBackup({ schema: 'aday-atolyesi-backup-v1', values: { [A.KEY]: JSON.stringify(st) } }));
for (const bad of [
  [],
  42,
  { actions: [] },
  { comparisons: { bad: {} } },
  { drafts: { bad: { values: { bad: {} } } } },
])
  assert.throws(() => G.validateState({ ...st, growth: bad }, cat));
for (const t of G.tracks) {
  const source = cat.find(c => c.id === t.first);
  assert(source);
  assert.equal(source.learning.transfer, t.transfer);
  assert(x.Positions.get(t.positionId));
}
// Actual rendered feedback contains the selected answer and no pre-save drill reference.
x.state = st;
x.localStorage.getItem = k => (k === 'rol-atolyesi-v1' ? JSON.stringify(snap.r) : null);
vm.runInContext(fs.readFileSync('web/growth-ui.js', 'utf8'), x);
let html = x.GrowthUI.view();
assert(html.includes(q.options[bad].text));
assert(html.includes('Gelişim') || html.includes('çalış'));
assert(!html.includes('undefined'));
assert(!html.includes('NaN'));
// Latest unreviewed file suppresses older feedback; file references are labelled human-entered.
const files = [
  {
    id: 'old',
    case_id: c.id,
    version: c.version,
    name: 'answer.docx',
    created: '2026-11-04T10:00Z',
    sequence: 1,
    feedback: {
      items: [
        { output: 'Karar', evidence: 'Sayfa 1', observation: 'Varsayımı açıkla', next: 'Paydayı belirt' },
      ],
    },
  },
];
assert.equal(G.filePriorities(files, 'own', cat).length, 1);
assert(G.filePriorities(files, 'own', cat)[0].evidenceLabel.includes('referans'));
assert.equal(G.filePriorities(files, null, cat).length, 0);
assert.equal(
  G.filePriorities([...files, { ...files[0], id: 'new', sequence: 2, feedback: null }], 'own', cat).length,
  0
);
// Replacing a transfer pointer preserves and validates the earlier exact connection.
a.learning.transferHistory = [a.learning.transfer];
a.learning.transfer = { caseId: target.id, sourceId: L.sid(a.submitted), at: '2026-11-04T13:30Z' };
assert(G.validateState(st, cat));
assert(E.validateAttempt(c, a));
console.log(
  'PASS: canonical scoring of 187 items, two source-linked priorities, sample/hint/version exclusion, personality independence, exact quotes, historic revision notes, defense invalidation, transfer chronology, selected-only export, backup validation and three linked position paths.'
);
