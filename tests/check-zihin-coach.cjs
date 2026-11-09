const assert = require('node:assert/strict');
require('../web/modules/zihin/numeric.js');
require('../web/modules/zihin/engine.js');
require('../web/modules/zihin/coach.js');
const NOW = Date.UTC(2026, 9, 30, 10),
  D = Coach.DAY;
const trial = (ruleId, stage = 'mixed', correct = true, hinted = false, sec = 80, at = NOW) => ({
  ruleId,
  level: 2,
  correct,
  hinted,
  sec,
  stage,
  task: 'end',
  policyVersion: 2,
  at,
});
let state = Coach.blank(),
  plan = Coach.choose(state, 2, null, NOW),
  trials = [];
assert.equal(plan.stage, 'focus');
assert.notEqual(plan.target, plan.partner);
const add = (ids, stage, count, ok = true, hinted = false) => {
  for (let i = 0; i < count; i++) {
    let row = trial(ids[i % ids.length], stage, ok, hinted);
    trials.push(row);
    Coach.record(state, row);
  }
};
add([plan.target], 'focus', 4);
let b = Coach.next(plan, trials);
assert.equal(b.stage, 'contrast');
assert.equal(b.lesson, true);
add(b.ids, b.stage, b.count);
b = Coach.next(plan, trials);
assert.equal(b.stage, 'mixed');
add([plan.target, plan.partner], b.stage, b.count);
b = Coach.next(plan, trials);
assert.equal(b.stage, 'transfer');
add(b.ids, b.stage, b.count);
assert.equal(Coach.next(plan, trials), null);
assert.equal(plan.finishReason, 'complete');
let res = Coach.finish(state, plan, trials, NOW);
assert(res.due.length >= 1);
assert.equal(Coach.stat(state, plan.target, 2).nextDue, NOW + D);
assert.equal(Coach.stat(state, plan.target, 2).interval, 0);
let due = Coach.choose(state, 2, null, NOW + D + 1);
assert.equal(due.kind, 'review');
assert.equal(due.target, plan.target);
let reviewRows = [];
for (let stage of ['review', 'mixed', 'transfer'])
  for (let i = 0; i < 4; i++) {
    let row = trial(plan.target, stage, true, false, 60, NOW + D + 1);
    reviewRows.push(row);
    Coach.record(state, row);
  }
due.finishReason = 'complete';
Coach.finish(state, due, reviewRows, NOW + D + 1);
assert.equal(Coach.stat(state, plan.target, 2).nextDue, NOW + 4 * D + 1);
assert.equal(Coach.stat(state, plan.target, 2).interval, 1);
let scheduled = Coach.stat(state, plan.target, 2).nextDue;
Coach.finish(state, due, reviewRows, NOW + D + 100);
assert.equal(Coach.stat(state, plan.target, 2).nextDue, scheduled);
assert.equal(Coach.stat(state, plan.target, 2).interval, 1);
let bad = Coach.choose(Coach.blank(), 2, null, NOW),
  badRows = Array.from({ length: 4 }, () => trial(bad.target, 'focus', false));
assert.equal(Coach.next(bad, badRows).count, 2);
badRows.push(...Array.from({ length: 2 }, () => trial(bad.target, 'focus', false)));
assert.equal(Coach.next(bad, badRows).count, 2);
badRows.push(...Array.from({ length: 2 }, () => trial(bad.target, 'focus', false)));
assert.equal(Coach.next(bad, badRows), null);
assert.equal(bad.finishReason, 'focus');
let hints = Coach.choose(Coach.blank(), 2, null, NOW);
assert.equal(
  Coach.next(
    hints,
    Array.from({ length: 4 }, () => trial(hints.target, 'focus', true, true))
  ).stage,
  'focus'
);
let review = Coach.choose(state, 2, plan.target, NOW + 5 * D);
review.stage = 'review';
let repair = Coach.next(
  review,
  Array.from({ length: 4 }, () => trial(review.target, 'review', false))
);
assert.equal(repair.stage, 'focus');
assert(repair.repair && repair.lesson);
let goalState = Coach.blank(),
  id = 'num-0-0',
  q = { ruleId: id, level: 2, practiceStage: 'mixed', proof: { hole: 7, full: Array(8), errorIndex: null } };
for (let i = 0; i < 20; i++) Coach.record(goalState, trial(id, 'focus', true, false, 10));
assert.equal(Coach.goal(goalState, q), null);
for (let i = 0; i < 5; i++) Coach.record(goalState, trial(id, 'mixed', true, false, 80));
assert.equal(Coach.goal(goalState, q), 72);
Coach.record(goalState, trial(id, 'mixed', false));
Coach.record(goalState, trial(id, 'mixed', false));
assert.equal(Coach.goal(goalState, q), null);
assert.equal(Coach.goal(goalState, { ...q, level: 3 }), null);
assert.equal(Coach.goal(state, { ...q, practiceStage: 'focus' }), null);
console.log(
  'Coach policy passed: accuracy gates, repair cap, due-first review, 1/3/7-day progression, no same-day interval inflation, and speed goals excluding blocked/hinted/error trials.'
);

let dueAgain = Coach.choose(state, 2, plan.target, NOW + 5 * D);
dueAgain.finishReason = 'complete';
let later = Array.from({ length: 4 }, () => trial(plan.target, 'transfer', true, false, 60, NOW + 5 * D));
later.forEach(t => Coach.record(state, t));
Coach.finish(state, dueAgain, later, NOW + 5 * D);
assert.equal(Coach.stat(state, plan.target, 2).nextDue, NOW + 12 * D);
assert.equal(Coach.stat(state, plan.target, 2).interval, 2);
let sawRepeat = false,
  sawAlternate = false;
for (let i = 0; i < 100; i++) {
  let order = Coach.order(['a', 'b'], 4, 'mixed');
  assert.equal(order.filter(x => x === 'a').length, 2);
  assert.equal(order.filter(x => x === 'b').length, 2);
  if (order.some((x, j) => j && x === order[j - 1])) sawRepeat = true;
  else sawAlternate = true;
}
assert(sawRepeat && sawAlternate);
assert.equal(new Set(Coach.order(['a', 'b'], 4, 'contrast')).size, 2);
console.log('7-day interval and unpredictable balanced mixed-order checks passed.');

assert.equal(Coach.catalog.length, 60);
let expanded = Coach.blank();
for (let r of Coach.catalog.slice(0, 12))
  for (let i = 0; i < 4; i++) Coach.record(expanded, trial(r.id, 'focus'));
let broad = Coach.choose(expanded, 2, 'num-2-0', NOW);
assert.equal(broad.pool.length, 8);
assert.equal(Coach.planCount(broad.pool), 8);
let uncertain = Array.from({ length: 4 }, () => ({ ...trial('num-0-0'), signalCorrect: false }));
assert(Coach.pass(uncertain), 'An alternate valid starting method must not penalize final answer');
console.log('60-rule catalog, eight-rule expansion, and separate hypothesis diagnostics passed.');

let restState = Coach.blank(),
  restPlan = Coach.choose(restState, 2, null, NOW),
  failed = Array.from({ length: 8 }, () => trial(restPlan.target, 'focus', false));
failed.forEach(t => Coach.record(restState, t));
restPlan.finishReason = 'focus';
Coach.finish(restState, restPlan, failed, NOW);
assert.equal(Coach.stat(restState, restPlan.target, 2).nextDue, NOW + D);
assert.notEqual(Coach.choose(restState, 2, null, NOW + 1000).target, restPlan.target);
assert.equal(Coach.choose(restState, 2, null, NOW + D + 1).stage, 'focus');
console.log('Repeated failure defers the rule and permits variety before next-day relearning.');

let broadGate = {
  target: 'num-0-0',
  partner: 'num-0-1',
  pool: Coach.catalog.slice(0, 8).map(r => r.id),
  stage: 'mixed',
};
let wideRows = Array.from({ length: 8 }, (_, i) => trial(broadGate.pool[i], 'mixed', i >= 4));
assert.equal(Coach.next(broadGate, wideRows), null);
assert.equal(broadGate.finishReason, 'mixed');
console.log('Expanded mixed blocks require accuracy across the full block, not only the final four items.');
