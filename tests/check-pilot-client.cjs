const fs = require('node:fs'),
  vm = require('node:vm'),
  assert = require('node:assert/strict');
const x = { window: {} };
vm.runInNewContext(fs.readFileSync('web/pilot-ui.js', 'utf8'), x);
let values = new Map([
    ['a', 'old-a'],
    ['b', 'old-b'],
    ['c', 'old-c'],
  ]),
  writes = 0,
  fail = true;
const storage = {
  getItem: k => values.get(k) ?? null,
  removeItem: k => values.delete(k),
  setItem(k, v) {
    writes++;
    if (fail && writes === 2) {
      fail = false;
      throw Error('quota');
    }
    values.set(k, v);
  },
};
assert.throws(
  () => x.window.PilotUI.applyRecords(storage, ['a', 'b', 'c'], { a: 'new-a', b: 'new-b' }),
  /Önceki kayıtlar korundu/
);
assert.deepEqual(Object.fromEntries(values), { a: 'old-a', b: 'old-b', c: 'old-c' });
x.window.PilotUI.applyRecords(storage, ['a', 'b', 'c'], { a: 'new-a', b: 'new-b' });
assert.deepEqual(Object.fromEntries(values), { a: 'new-a', b: 'new-b' });
console.log(
  'PASS: failed cloud restore rolls back every prior device record; successful restore replaces the full key set.'
);

const crypto = require('node:crypto').webcrypto,
  y = { crypto: { getRandomValues: b => crypto.getRandomValues(b) } };
y.window = y;
vm.runInNewContext(fs.readFileSync('web/core.js', 'utf8'), y);
const ids = Array.from({ length: 100 }, () => y.AA.uuid());
assert.equal(new Set(ids).size, 100);
assert(ids.every(id => /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(id)));
console.log('PASS: cryptographically random request IDs on HTTP previews without randomUUID.');
