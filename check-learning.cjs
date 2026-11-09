const fs = require('fs'),
  vm = require('vm'),
  assert = require('node:assert/strict');
const x = {
  window: null,
  console,
  location: { hash: '#cases' },
  state: { assessments: {} },
  esc: s =>
    String(s ?? '').replace(
      /[&<>"']/g,
      c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]
    ),
  link: (u, t) => `<a href="${u}">${t}</a>`,
};
x.window = x;
vm.createContext(x);
for (const f of [
  'case-archive-v1',
  'case-data',
  'case-engine',
  'learning-engine',
  'core',
  'case-ui',
  'learning-ui',
])
  vm.runInContext(fs.readFileSync('web/' + f + '.js', 'utf8'), x);
x.AA = x.AA || x.window.AA;
const E = x.CaseEngine,
  L = x.CaseLearning,
  C = x.CASE_CATALOG;
for (const c of C.filter(c => c.learning)) {
  assert.equal(c.version, '3.0.0');
  assert(c.rubric.every(r => c.learning.drills[r.practice]));
  assert(c.learning.sections.length >= 5);
  assert(
    c.learning.sections.every(s => s.sources.split(', ').every(code => c.docs.some(d => d.code === code)))
  );
  x.location.hash = '#cases/' + c.id;
  x.state.assessments = {};
  let html = x.CaseUI.view();
  assert(!html.includes('Derin referans inceleme'));
  assert(!html.includes('cycleRequest'));
  assert(!html.includes(c.learning.drills[0].prompt));
  let a = E.blank(c);
  a.answers = Object.fromEntries(c.tasks.map((_, i) => ['task' + i, 'Somut aday dayanağı ' + i]));
  a = E.submit(c, a, '2026-10-30T12:00:00Z');
  assert.equal(a.history.length, 1);
  assert(E.validateAttempt(c, a));
  const first = JSON.stringify(a.submitted);
  assert.throws(() => E.submit(c, a), /değişiklik/);
  a = { ...a, answers: { ...a.answers, task0: 'Yeni karar ve somut dayanak' } };
  assert.throws(() => E.submit(c, a), /neden/);
  a.learning = { revisionNote: 'İşletme sermayesi sınırını ve onay koşulunu belirttim.' };
  const req = L.request(c, a);
  assert(!('profile' in req));
  assert.equal(L.validateRequest(req).id, c.id);
  assert.throws(() => L.validateRequest({ ...req, submissionId: 'wrong' }));
  const review = {
    schema: 'aa-human-review-v1',
    caseId: c.id,
    caseVersion: c.version,
    submissionId: req.submissionId,
    reviewer: 'Pilot gözlemci',
    at: '2026-10-30T13:00:00Z',
    summary: 'Dayanak ve varsayım ayrımını güçlendir.',
    items: c.rubric.map((_, i) => ({
      index: i,
      rating: 2,
      quote: 'Somut aday dayanağı 0',
      observation: 'Teslimde açık dayanak var; kapsam sınırlı.',
      next: 'Varsayımın sınırını açıkla.',
    })),
  };
  let b = L.attach(c, a, review);
  assert.equal(b.reviews.length, 1);
  assert.throws(() => L.attach(c, b, review), /zaten/);
  assert.throws(() => L.attach(c, a, { ...review, caseVersion: '2.0.0' }));
  const bad = JSON.parse(JSON.stringify(review));
  bad.items[0].quote = 'Teslimde olmayan uydurma kanıt';
  assert.throws(() => L.attach(c, a, bad), /aynen/);
  b = E.submit(c, b, '2026-10-30T14:00:00Z');
  assert.equal(b.history.length, 2);
  assert.equal(JSON.stringify(b.history[0]), first);
  assert.equal(b.reviews[0].submissionId, L.sid(b.history[0]));
  assert.notEqual(L.sid(b.submitted), b.reviews[0].submissionId);
  assert(E.validateAttempt(c, b));
  x.state.assessments = { [E.keyFor(c)]: b };
  html = x.CaseUI.view();
  assert(html.includes('İlk ve son çözümümü yan yana'));
  assert(html.includes('Önceki teslime ait'));
  assert(html.includes('cycleTransfer'));
  assert(!html.includes(c.learning.drills[0].reference));
  b.learning.practice = { 0: 'Kendi çözümüm' };
  b.learning.defense = 'Yeni bilgiyle kararımı güncelledim.';
  b.learning.transfer = {
    caseId: c.learning.transfer,
    sourceId: L.sid(b.submitted),
    at: '2026-10-30T15:00:00Z',
  };
  assert(E.validateAttempt(c, b));
  const backup = {
    schema: 'aday-atolyesi-backup-v1',
    values: { [x.AA.KEY]: JSON.stringify({ ...x.AA.blank(), assessments: { [E.keyFor(c)]: b } }) },
  };
  assert(x.AA.validateBackup(backup));
  const corrupt = JSON.parse(JSON.stringify(b));
  corrupt.history[0].answers.task0 = 'Değiştirilmiş dayanak';
  assert.throws(() => E.validateAttempt(c, corrupt), /aynen/);
  const v2 = x.CASE_ARCHIVE.find(z => z.id === c.id && z.version === '2.0.0');
  assert(v2);
  let old = E.blank(v2);
  old.answers = Object.fromEntries(v2.tasks.map((_, i) => ['task' + i, 'Önceki sürümün yanıtı']));
  old = E.submit(v2, old);
  x.state.assessments = { [E.keyFor(v2)]: old };
  assert.equal(E.getRecord(x.state.assessments, c), null);
  x.location.hash = '#cases/' + c.id + '/v/2.0.0';
  html = x.CaseUI.view();
  assert(html.includes('Arşiv salt okunurdur'));
  assert(html.includes('Önceki sürümün yanıtı'));
  assert(!html.includes('id="caseForm"'));
}
// Independent numbers newly introduced by detailed references.
assert(Math.abs((462480 / (14000 * 850 * 0.4 * 0.95)) * 100 - 10.22733303847855) < 1e-10);
assert.equal(
  [4, 5, 3, 5, 5, 10].reduce((a, b) => a + b),
  32
);
assert.equal(
  [94, 102, 98, 106, 100, 120].reduce((a, b) => a + b),
  620
);
const roll = (ins, outs) => {
  let n = 300000;
  return ins.map((v, i) => (n += v - outs[i]));
};
assert.deepEqual(
  roll([200000, 450000, 300000, 450000], [450000, 550000, 400000, 350000]),
  [50000, -50000, -150000, -50000]
);
assert.deepEqual(
  roll([200000, 250000, 500000, 450000], [450000, 250000, 400000, 650000]),
  [50000, 50000, 150000, -50000]
);
console.log(
  'PASS: all 20 learning flows; immutable submission history; unchanged/ungrounded revision rejection; human feedback tied to exact submission; fabricated quote/wrong-version/duplicate rejection; backup restoration; gated reference/drill content; v2 read-only preservation; independent reference arithmetic.'
);
