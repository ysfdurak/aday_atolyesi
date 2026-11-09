// Otomatik hesap kaydı: CV gönderilmez, değişmeyen kayıt tekrar gönderilmez,
// başka cihazdaki daha yeni kaydın üzerine yazılmaz (409 → otomatik kayıt kapanır).
const fs = require('node:fs'),
  vm = require('node:vm'),
  assert = require('node:assert/strict');

const store = new Map();
const localStorage = {
  getItem: k => (store.has(k) ? store.get(k) : null),
  setItem: (k, v) => store.set(k, String(v)),
  removeItem: k => store.delete(k),
};
const listeners = {};
const window = {
  addEventListener: (n, f) => (listeners[n] = (listeners[n] || []).concat(f)),
  dispatchEvent: e => (listeners[e.type] || []).forEach(f => f(e)),
};
let server = { revision: 3 },
  puts = [];
const ctx = {
  window,
  localStorage,
  console,
  Event: class {
    constructor(type) {
      this.type = type;
    }
  },
  document: { hidden: false, addEventListener() {} },
  setInterval: () => 0,
  fetch: async (url, init = {}) => {
    const method = init.method || 'GET';
    if (method === 'GET') return { ok: true, status: 200, json: async () => ({ revision: server.revision }) };
    const body = JSON.parse(init.body);
    puts.push(body);
    if (body.revision !== server.revision)
      return { ok: false, status: 409, json: async () => ({ error: 'conflict' }) };
    server.revision++;
    return { ok: true, status: 200, json: async () => ({ revision: server.revision }) };
  },
};
ctx.globalThis = ctx;
vm.createContext(ctx);
vm.runInContext(fs.readFileSync('web/core.js', 'utf8'), ctx);
vm.runInContext(fs.readFileSync('web/account-sync.js', 'utf8'), ctx);
const AA = window.AA,
  S = window.AccountSync;
window.PilotProgress = { status: () => 'ready' };

(async () => {
  const st = AA.blank();
  st.cv = { text: 'GİZLİ CV' };
  localStorage.setItem(AA.KEY, JSON.stringify(st));

  const p = S.payload();
  assert.ok(!JSON.stringify(p).includes('GİZLİ CV'), 'CV metni hesaba gönderilmemeli');

  await S.enable();
  assert.equal(puts.length, 1);
  assert.equal(puts[0].revision, 3, 'açılışta güncel sunucu sürümüyle yazılır');
  assert.equal(S.settings().on, true);
  assert.equal(S.settings().revision, 4);

  await S.tick();
  assert.equal(puts.length, 1, 'değişmeyen kayıt yeniden gönderilmez');

  const changed = JSON.parse(localStorage.getItem(AA.KEY));
  changed.checks = { ...changed.checks, 'gun-1': true };
  localStorage.setItem(AA.KEY, JSON.stringify(changed));
  await S.tick();
  assert.equal(puts.length, 2, 'değişen kayıt gönderilir');
  assert.equal(S.settings().revision, 5);

  server.revision = 9; // başka cihaz kaydetti
  changed.checks['gun-2'] = true;
  localStorage.setItem(AA.KEY, JSON.stringify(changed));
  await S.tick();
  assert.equal(puts.at(-1).revision, 5, 'bilinen sürümle denenir, sunucu sürümü kopyalanmaz');
  assert.equal(S.settings().on, false, 'çakışmada otomatik kayıt kapanır');
  assert.match(S.label(), /Başka bir cihazda/);

  window.PilotProgress = { status: () => 'guest' };
  const before = puts.length;
  await S.tick();
  assert.equal(puts.length, before, 'misafirken gönderim yapılmaz');
  console.log(
    'PASS: otomatik hesap kaydı CV dışlama, değişiklik algılama, sürüm çakışması ve misafir korumasını geçti.'
  );
})().catch(err => {
  console.error(err);
  process.exit(1);
});
