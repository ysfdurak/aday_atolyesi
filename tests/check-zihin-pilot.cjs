const assert = require('node:assert/strict'),
  fs = require('node:fs'),
  vm = require('node:vm');
for (let f of ['numeric', 'engine', 'verbal', 'spatial', 'coach', 'discovery', 'assessment', 'pilot'])
  require('../web/modules/zihin/' + f + '.js');
const questions = Array.from({ length: 3 }, (_, i) => ({
    id: 'item' + i,
    cat: 'num',
    type: i,
    level: 1,
    options: ['A', 'B', 'C', 'D', 'E'],
    answer: 'A',
    templateId: 'template' + i,
  })),
  form = Pilot.form(questions, 'A'),
  state = Pilot.blank();
for (let i = 0; i < 20; i++) {
  let values = i < 10 ? [1, 0, 0] : [0, 1, 1],
    rows = questions.map((q, j) => ({ q, answer: values[j] ? 'A' : 'B', correct: !!values[j], sec: 20 + j }));
  Pilot.add(state, [Pilot.run(form, 'k' + i, rows, 1000 + i)]);
}
let s = Pilot.analyze(state, form.id);
assert.equal(s.n, 20);
assert.equal(s.total.kr20, -3);
assert.equal(s.scales.find(x => x.cat === 'num').kr20, -3);
assert.equal(s.items[0].p, 0.5);
assert.equal(s.items[0].rit, -1);
assert.equal(
  s.items[0].choices.reduce((n, x) => n + x.count, 0),
  20
);
Pilot.add(state, [
  Pilot.run(
    form,
    'K0',
    questions.map(q => ({ q, answer: 'A', correct: true, sec: 10 })),
    9999
  ),
]);
assert.equal(Pilot.analyze(state, form.id).n, 20);
assert.equal(Pilot.analyze(state, form.id).duplicates, 1);
let encoded = Pilot.serialize(state),
  imported = Pilot.blank();
Pilot.add(imported, Pilot.validate(JSON.parse(encoded)));
assert.equal(Pilot.analyze(imported, form.id).n, 20);
let small = Pilot.blank();
Pilot.add(small, [state.runs[0]]);
assert.equal(Pilot.analyze(small, form.id).total.kr20, null);
assert.equal(Pilot.analyze(small, form.id).items[0].rit, null);
let identical = Pilot.blank();
for (let i = 0; i < 20; i++)
  Pilot.add(identical, [
    Pilot.run(
      form,
      'P' + i,
      questions.map(q => ({ q, answer: 'A', correct: true, sec: 30 })),
      i
    ),
  ]);
assert.equal(Pilot.analyze(identical, form.id).total.kr20, null);
assert.equal(Pilot.analyze(identical, form.id).items[0].rit, null);
let bad = JSON.parse(encoded);
bad.runs[0].items[0].chosen = 'not-a-choice';
assert.throws(() => Pilot.validate(bad));
bad = JSON.parse(encoded);
bad.runs[0].items[0].correct = true;
assert.throws(() => Pilot.validate(bad));
bad = JSON.parse(encoded);
bad.runs[0].items[0].template = '<img onerror=x>';
assert.throws(() => Pilot.validate(bad));
let collision = structuredClone(state.runs[0]);
collision.items[0].id = 'different';
let before = JSON.stringify(state);
assert.throws(() => Pilot.add(state, [collision]));
assert.equal(JSON.stringify(state), before);
// Positive covariance example checked against independent Cronbach alpha using sample variances.
const variance = a => {
  let m = a.reduce((s, x) => s + x, 0) / a.length;
  return a.reduce((s, x) => s + (x - m) ** 2, 0) / (a.length - 1);
};
let positive = Pilot.blank(),
  matrix = [];
for (let i = 0; i < 24; i++) {
  let values = [i >= 6, i >= 12, i >= 18].map(Number);
  matrix.push(values);
  Pilot.add(positive, [
    Pilot.run(
      form,
      'X' + i,
      questions.map((q, j) => ({ q, answer: values[j] ? 'A' : 'B', correct: !!values[j], sec: 15 })),
      i
    ),
  ]);
}
let totals = matrix.map(row => row.reduce((s, x) => s + x, 0)),
  alpha =
    (3 / 2) * (1 - [0, 1, 2].reduce((s, j) => s + variance(matrix.map(r => r[j])), 0) / variance(totals));
assert(Math.abs(Pilot.analyze(positive, form.id).total.kr20 - alpha) < 1e-12);
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
let hash = '#pilot',
  canConfirm = true;
const context = {
  Assessment,
  Discovery,
  Engine,
  Numeric,
  Coach,
  Pilot,
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
  confirm: () => canConfirm,
  console,
  Blob,
  URL,
  window: { addEventListener() {}, scrollTo() {} },
};
vm.createContext(context);
let source = fs.readFileSync('web/modules/zihin/app.js', 'utf8');
vm.runInContext(source, context);
assert(nodes.get('#app').innerHTML.includes('Sabit form ile pilot oturumu'));
document.querySelector('#pilotCode').value = 'K001';
document.querySelector('#pilotForm').value = 'A';
vm.runInContext('startPilot()', context);
let first = JSON.parse(storage.get('zp-session-v1'));
assert.equal(first.pilot.participant, 'K001');
assert.equal(first.questions.length, 36);
let firstIds = first.questions.map(q => q.id);
vm.runInContext(
  'session.questions.forEach((q,i)=>{session.responses[i]=q.answer;session.seconds[i]=30;});finish(true);pilotPage()',
  context
);
let data = JSON.parse(storage.get('zp-data-v1'));
assert.equal(data.pilotState.runs.length, 1);
assert.equal(data.reports.length, 1);
document.querySelector('#pilotCode').value = 'K002';
document.querySelector('#pilotForm').value = 'A';
vm.runInContext('startPilot()', context);
let second = JSON.parse(storage.get('zp-session-v1'));
assert.deepEqual(
  second.questions.map(q => q.id),
  firstIds
);
assert.equal(second.pilot.participant, 'K002');
canConfirm = false;
document.querySelector('#pilotCode').value = 'K003';
vm.runInContext('startPilot()', context);
assert.equal(JSON.parse(storage.get('zp-session-v1')).pilot.participant, 'K002');
vm.runInContext("assessmentReport('demo')", context);
assert(nodes.get('#app').innerHTML.includes('Alan × aşama ayrıntısı'));
assert(nodes.get('#app').innerHTML.includes('Tüm soruların performans dökümü'));
assert(nodes.get('#app').innerHTML.includes('Ek iş örneği · uygulanmadı'));
vm.runInContext('orientationPage()', context);
assert(nodes.get('#app').innerHTML.includes('PUANSIZ ÖRNEK'));
assert.equal(JSON.parse(storage.get('zp-data-v1')).pilotState.runs.length, 1);
console.log(
  'Pilot passed: fixed forms, participant deduplication, coherent answer keys, safe atomic import, corrected item-total correlation, independent alpha comparison, negative/zero-variance/small-N behavior, actual pilot finish recording, detailed report, cancel preservation and unscored orientation.'
);
