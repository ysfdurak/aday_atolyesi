const assert = require('node:assert/strict'),
  fs = require('node:fs'),
  vm = require('node:vm');
require('./web/modules/zihin/numeric.js');
require('./web/modules/zihin/engine.js');
require('./web/modules/zihin/verbal.js');
require('./web/modules/zihin/spatial.js');
require('./web/modules/zihin/coach.js');
require('./web/modules/zihin/discovery.js');
require('./web/modules/zihin/assessment.js');
require('./web/modules/zihin/pilot.js');
const nodes = new Map(),
  events = {},
  storage = new Map();
const element = () => ({
  innerHTML: '',
  textContent: '',
  style: {},
  classList: { toggle() {} },
  value: '',
  addEventListener(n, f) {
    events[n] = f;
  },
});
const document = {
  hidden: false,
  activeElement: { tagName: 'BODY' },
  querySelector(s) {
    if (!nodes.has(s)) nodes.set(s, element());
    return nodes.get(s);
  },
  querySelectorAll() {
    return [];
  },
  addEventListener(n, f) {
    events[n] = f;
  },
};
let routeHash = '#home';
const location = {
  get hash() {
    return routeHash;
  },
  set hash(v) {
    routeHash = v.startsWith('#') ? v : '#' + v;
  },
};
const context = {
  Engine,
  Numeric,
  Coach,
  Discovery,
  Assessment,
  Pilot,
  document,
  location,
  localStorage: { getItem: k => storage.get(k) || null, setItem: (k, v) => storage.set(k, v) },
  confirm: () => true,
  setInterval: () => 1,
  clearInterval() {},
  setTimeout() {},
  console,
  Blob,
  URL,
};
context.window = { addEventListener() {}, scrollTo() {} };
vm.createContext(context);
vm.runInContext(fs.readFileSync('./web/modules/zihin/app.js', 'utf8'), context);
vm.runInContext("start('learn','num',0,2)", context);
let q = JSON.parse(storage.get('zp-session-v1')).questions;
assert.equal(new Set(q.map(x => x.ruleId)).size, 12);
for (let i = 1; i < q.length; i++) assert.notEqual(q[i - 1].ruleId, q[i].ruleId);
vm.runInContext("start('learn','num',null,2)", context);
q = JSON.parse(storage.get('zp-session-v1')).questions;
assert.equal(new Set(q.map(x => x.strategyId)).size, 12);
vm.runInContext('session.hintSteps[0]=1;quiz()', context);
assert(nodes.get('#app').innerHTML.includes('Sonraki ipucunu aç'));
assert(nodes.get('#app').innerHTML.includes('İpucu 1'));
assert(!nodes.get('#app').innerHTML.includes('İpucu 2</b>'));
vm.runInContext('session.hintSteps[0]=3;quiz()', context);
assert(nodes.get('#app').innerHTML.includes('Tüm ipuçları açık'));
assert(nodes.get('#app').innerHTML.includes('İpucu ' + Math.min(3, q[0].hints.length)));
console.log(
  'Session checks passed: balanced family deck, no adjacent repeated rule, 12-rule cycles, and progressive hint rendering.'
);
vm.runInContext('startCoach()', context);
let coachSession = JSON.parse(storage.get('zp-session-v1'));
assert.equal(coachSession.questions.length, 4);
assert(coachSession.coach.lesson);
assert.equal(new Set(coachSession.questions.map(q => q.ruleId)).size, 1);
vm.runInContext('session.entered=Date.now()-10000;accountTime()', context);
assert.equal(vm.runInContext('session.seconds[0]||0', context), 0);
let stages = [],
  loops = 0;
while (vm.runInContext('!!session', context) && loops++ < 30) {
  stages.push(vm.runInContext('session.questions[session.index].practiceStage', context));
  vm.runInContext(
    'if(session.coach.lesson){session.coach.lesson=null;session.entered=Date.now();}session.signals=session.signals||{};session.signals[session.index]={type:Coach.signalType(session.questions[session.index]),correct:true,sec:5};session.responses[session.index]=session.questions[session.index].answer;session.seconds[session.index]=60;session.revealed.push(session.index);captureCoach(session,session.index);coachNext()',
    context
  );
}
assert.equal(loops, 16);
assert.deepEqual(stages.slice(0, 4), Array(4).fill('focus'));
assert.deepEqual(stages.slice(4, 8), Array(4).fill('contrast'));
assert.deepEqual(stages.slice(8, 12), Array(4).fill('mixed'));
assert.deepEqual(stages.slice(12), Array(4).fill('transfer'));
let storedData = JSON.parse(storage.get('zp-data-v1'));
assert.equal(storedData.coachState.runs.length, 1);
assert.equal(storedData.coachState.runs[0].reason, 'complete');
assert.equal(storedData.answers.length, 16);
assert.equal(storedData.xp, 160);
assert(nodes.get('#app').innerHTML.includes('ÖRÜNTÜ KOÇU · ÇALIŞMA SONUCU'));
assert.equal(
  Object.values(storedData.coachState.rules).reduce((n, r) => n + r.trials.length, 0),
  16
);
console.log(
  'Coach UI flow passed: unscored lesson time, 4 focused + 4 contrast + 4 mixed + 4 transfer questions, one record per answer, review scheduling and result summary.'
);

vm.runInContext(
  "startCoach('num-2-5');session.coach.lesson=null;session.coach.stage='mixed';session.questions[0].practiceStage='mixed';quiz()",
  context
);
assert(nodes.get('#app').innerHTML.includes('ÖNCE YAPIYI SEÇ'));
assert(nodes.get('#app').innerHTML.includes('class="answers" hidden'));
let click = el => events.click({ target: { closest: () => el } });
click({ dataset: { signal: '2' }, id: '' });
let snap = JSON.parse(storage.get('zp-session-v1'));
assert.equal(snap.signals[0].type, 2);
assert.equal(snap.signals[0].correct, true);
assert(!nodes.get('#app').innerHTML.includes('class="answers" hidden'));
click({ dataset: { signal: '1' }, id: '' });
assert.equal(JSON.parse(storage.get('zp-session-v1')).signals[0].type, 2);
console.log(
  'Hypothesis gate: options hidden until choice, one immutable timed hypothesis per question, and unlock persistence passed.'
);
