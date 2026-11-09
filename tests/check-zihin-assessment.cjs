const assert = require('node:assert/strict'),
  fs = require('node:fs'),
  vm = require('node:vm');
for (let f of ['numeric', 'engine', 'verbal', 'spatial', 'coach', 'discovery', 'assessment', 'pilot'])
  require('../web/modules/zihin/' + f + '.js');
let sample = Assessment.sample();
assert.equal(sample.sample, true);
assert.equal(sample.overall.total, 36);
assert.equal(sample.overall.correct, 24);
assert.equal(sample.overall.wrong, 9);
assert.equal(sample.overall.blank, 3);
assert.equal(sample.overall.accuracy, 73);
assert.equal(sample.overall.score, 67);
assert.equal(sample.overall.completion, 92);
assert.equal(sample.unseen, 1);
assert.equal(sample.skipped, 2);
assert(sample.elapsed <= sample.budget);
assert(sample.domains.every(d => d.total === 6 && d.breadth > 0 && d.levels.every(l => l.total === 2)));
assert.deepEqual(
  sample.stages.map(s => s.total),
  [12, 12, 12]
);
assert(sample.priorities.every(p => ['shape', 'quant'].includes(p.id)));
assert.equal(sample.comparable, false);
assert.equal(sample.domains.find(d => d.id === 'shape').breadth, 6);
assert.equal(sample.domains.find(d => d.id === 'logic').breadth, 5);
let empty = Assessment.analyze([]);
assert.equal(empty.overall.score, null);
assert.equal(empty.overall.correctMedian, null);
assert.equal(empty.priorities.length, 0);
assert.equal(empty.probes.length, 0);
let sparse = Assessment.analyze(
  [
    { q: { cat: 'num', type: 0, level: 1 }, sec: 0 },
    { q: { cat: 'num', type: 1, level: 1 }, answer: 'A', correct: true, sec: 4 },
  ],
  { visited: { 0: 1, 1: 1 }, changes: { 1: 2 } }
);
assert.equal(sparse.overall.score, 50);
assert.equal(sparse.overall.accuracy, 100);
assert.equal(sparse.skipped, 1);
assert.equal(sparse.unseen, 0);
assert.equal(sparse.changed, 1);
assert.equal(sparse.changeCount, 2);
assert.equal(sparse.priorities.length, 0);
const nodes = new Map(),
  events = {},
  storage = new Map(),
  el = () => ({
    innerHTML: '',
    textContent: '',
    style: {},
    classList: { toggle() {} },
    value: '',
    addEventListener(n, f) {
      events[n] = f;
    },
  }),
  document = {
    hidden: false,
    activeElement: { tagName: 'BODY' },
    querySelector(s) {
      if (!nodes.has(s)) nodes.set(s, el());
      return nodes.get(s);
    },
    querySelectorAll() {
      return [];
    },
    addEventListener(n, f) {
      events[n] = f;
    },
  };
let hash = '#exam';
const context = {
  Pilot,
  Assessment,
  Discovery,
  Engine,
  Numeric,
  Coach,
  document,
  location: {
    get hash() {
      return hash;
    },
    set hash(v) {
      hash = v.startsWith('#') ? v : '#' + v;
    },
  },
  localStorage: { getItem: k => storage.get(k) || null, setItem: (k, v) => storage.set(k, v) },
  setInterval: () => 1,
  clearInterval() {},
  setTimeout() {},
  confirm: () => true,
  console,
  Blob,
  URL,
  window: { addEventListener() {}, scrollTo() {}, print() {} },
};
vm.createContext(context);
let code = fs.readFileSync('web/modules/zihin/app.js', 'utf8');
vm.runInContext(code, context);
assert.equal(nodes.get('#profile').value, 'graded');
assert(nodes.get('#app').innerHTML.includes('Örnek hazırlık raporu'));
vm.runInContext("start('exam','all',null,2,profiles.find(p=>p.id==='graded'))", context);
let s = JSON.parse(storage.get('zp-session-v1'));
assert.equal(s.questions.length, 36);
assert.equal(s.budgetSeconds, 2400);
assert.equal(s.deadline - s.started, 2400000);
assert(s.graded);
assert.deepEqual(
  s.questions.map(q => q.level),
  [...Array(12).fill(1), ...Array(12).fill(2), ...Array(12).fill(3)]
);
for (let c of Engine.cats) {
  let rows = s.questions.filter(q => q.cat === c.id);
  assert.equal(rows.length, 6);
  assert.equal(
    new Set(rows.map(q => Assessment.family(q))).size,
    c.id === 'logic' || c.id === 'quant' ? 5 : c.id === 'attention' ? 3 : 6
  );
  for (let level of [1, 2, 3]) assert.equal(rows.filter(q => q.level === level).length, 2);
}
assert(nodes.get('#app').innerHTML.includes('1. aşama · Temel ilişkiler'));
assert(!nodes.get('#app').innerHTML.includes('İlk ipucunu aç'));
let click = el => events.click({ target: { closest: () => el } });
click({ dataset: { answer: '0' }, id: '' });
click({ dataset: { answer: '1' }, id: '' });
assert.equal(JSON.parse(storage.get('zp-session-v1')).changes[0], 1);
vm.runInContext('move(1);move(0)', context);
assert.equal(JSON.parse(storage.get('zp-session-v1')).visited[0], 2);
vm.runInContext(
  'session.questions.forEach((q,i)=>{if(i<30){session.responses[i]=q.answer;session.seconds[i]=30;session.visited[i]=1;}});session.visited[30]=1;session.seconds[30]=5;session.started=Date.now()-1100000;finish(true)',
  context
);
let data = JSON.parse(storage.get('zp-data-v1')),
  report = data.reports.at(-1);
assert.equal(report.overall.correct, 30);
assert.equal(report.overall.blank, 6);
assert.equal(report.overall.score, 83);
assert.equal(report.overall.accuracy, 100);
assert.equal(report.unseen, 5);
assert.equal(report.skipped, 1);
assert(nodes.get('#app').innerHTML.includes('Ayrıntılı raporu aç'));
vm.runInContext("location.hash='report/latest';render()", context);
assert(nodes.get('#app').innerHTML.includes('Bu oturumun beceri görünümü'));
assert(nodes.get('#app').innerHTML.includes('Aşamalar boyunca performans'));
assert(nodes.get('#app').innerHTML.includes('Hangi soru ailelerinde nasıl sonuç aldın?'));
// Browser refresh must retain compact actual reports, and the demo must not mutate genuine history.
let restored = vm.createContext({ ...context });
vm.runInContext(code, restored);
assert(nodes.get('#app').innerHTML.includes('Bu oturumun beceri görünümü'));
let before = JSON.stringify(JSON.parse(storage.get('zp-data-v1')).reports);
vm.runInContext("assessmentReport('demo')", restored);
assert(nodes.get('#app').innerHTML.includes('SENTETİK ÖRNEK'));
assert.equal(JSON.stringify(JSON.parse(storage.get('zp-data-v1')).reports), before);
vm.runInContext('assessmentAudit()', restored);
assert(nodes.get('#app').innerHTML.includes('Mevcut kurallar yeterli mi?'));
console.log(
  'Assessment checks passed: balanced 36-item progressive design, conservative family grouping, stage order, 40-minute budget, answer revisions/revisits, blanks vs unseen, denominators, sparse data, synthetic example isolation, persistent real report and audit UI.'
);
