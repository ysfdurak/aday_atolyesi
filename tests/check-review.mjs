// İK değerlendirmesi: ölçüt seviyeleri, kör değerlendirme ve kuyruk yardımcıları.
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { DatabaseSync } from 'node:sqlite';
import { readFileSync, readdirSync } from 'node:fs';
import { handlePilot } from '../server/pilot-service.mjs';
import { validateCriteria, rubricFor } from '../server/review-model.mjs';

const reviewCatalog = JSON.parse(readFileSync('server/pilot-review-catalog.json'));
const rubric = rubricFor(reviewCatalog, 'kpi-paradoksu', '3.0.0');
assert.equal(rubric.length, 4);
assert(
  rubric.every(r => r.anchors?.length === 4),
  'her ölçütün dört seviye tanımı olmalı'
);

// --- Model doğrulaması ---
const full = rubric.map((_, i) => ({ level: i % 4, note: '' }));
assert.deepEqual(
  validateCriteria(full, rubric, { publish: true }).map(c => c.level),
  [0, 1, 2, 3]
);
assert.throws(() => validateCriteria(undefined, rubric, { publish: true }), /seviye seç/);
assert.equal(validateCriteria(undefined, rubric, { publish: false }), undefined);
assert.throws(() => validateCriteria(full.slice(1), rubric, { publish: true }), /eksik/);
assert.throws(() => validateCriteria([{ level: 4 }, ...full.slice(1)], rubric, { publish: true }), /0–3/);
assert.throws(() => validateCriteria([{ level: 1.5 }, ...full.slice(1)], rubric, { publish: true }), /0–3/);
assert.throws(
  () => validateCriteria([{ level: null }, ...full.slice(1)], rubric, { publish: true }),
  /seviye seç/
);
assert.equal(
  validateCriteria([{ level: null }, ...full.slice(1)], rubric, { publish: false })[0].level,
  null
);
assert.throws(
  () => validateCriteria([{ level: 1, note: 'x'.repeat(601) }, ...full.slice(1)], rubric, { publish: true }),
  /600/
);

// --- Servis ---
const sqlite = new DatabaseSync(':memory:');
for (const f of readdirSync('drizzle')
  .filter(f => f.endsWith('.sql'))
  .sort())
  sqlite.exec(readFileSync('drizzle/' + f, 'utf8').replaceAll('--> statement-breakpoint', ''));
const objects = new Map();
const env = {
  PILOT_OWNER_EMAIL: 'admin@example.test',
  DB: {
    prepare(sql) {
      let args = [];
      return {
        bind(...a) {
          args = a;
          return this;
        },
        async first() {
          return sqlite.prepare(sql).get(...args) || null;
        },
        async all() {
          return { results: sqlite.prepare(sql).all(...args) };
        },
        async run() {
          return { meta: { changes: Number(sqlite.prepare(sql).run(...args).changes) } };
        },
      };
    },
  },
  BUCKET: {
    async put(k, v) {
      objects.set(k, v);
    },
    async get(k) {
      return objects.has(k) ? { body: objects.get(k) } : null;
    },
    async delete(k) {
      objects.delete(k);
    },
  },
};
const headersFor = user => ({
  'oai-authenticated-user-id': user,
  'oai-authenticated-user-email': user + '@example.test',
  origin: 'https://pilot.test',
});
const call = (user, op, body) =>
  handlePilot(
    new Request('https://pilot.test/api/pilot?op=' + op, {
      method: body ? 'POST' : 'GET',
      headers: { ...headersFor(user), ...(body ? { 'Content-Type': 'application/json' } : {}) },
      body: body ? JSON.stringify(body) : undefined,
    }),
    env
  );
const json = async r => (await r).json();
for (const u of ['admin', 'reviewer', 'ayse.yilmaz']) await call(u, 'me');
assert.equal((await call('admin', 'role', { id: 'reviewer', role: 'reviewer' })).status, 200);
const pdf = new TextEncoder().encode('%PDF-1.4\n1 0 obj\n<<>>\nendobj\n%%EOF\n');
const up = await handlePilot(
  new Request(
    'https://pilot.test/api/pilot?op=submit&case=kpi-paradoksu&version=3.0.0&name=Ayse-Yilmaz-cevap.pdf&confirmed=yes',
    { method: 'POST', headers: headersFor('ayse.yilmaz'), body: pdf }
  ),
  env
);
assert.equal(up.status, 201);
const { id } = await up.json();
assert.equal((await call('admin', 'assign', { id, reviewer: 'reviewer' })).status, 200);

// Ölçütler yalnız değerlendirme yetkisi olanlara gönderilir.
assert((await json(call('reviewer', 'me'))).rubrics?.length > 0);
assert.equal((await json(call('ayse.yilmaz', 'me'))).rubrics, undefined);

// Kör değerlendirme
assert.equal((await call('reviewer', 'settings', { blindReview: true })).status, 403);
assert.equal((await call('admin', 'settings', { blindReview: 'evet' })).status, 400);
assert.equal((await call('admin', 'settings', { blindReview: true })).status, 200);
assert.equal((await json(call('reviewer', 'me'))).blindReview, true);
const seen = (await json(call('reviewer', 'submissions'))).find(r => r.id === id);
assert.match(seen.email, /^Aday A-[0-9A-F]{6}$/);
assert.equal(seen.name, 'teslim.pdf');
assert.notEqual(seen.user_id, 'ayse.yilmaz');
assert(!JSON.stringify(seen).includes('ayse'), 'kör modda aday kimliği sızmamalı');
const again = (await json(call('reviewer', 'submissions'))).find(r => r.id === id);
assert.equal(again.email, seen.email, 'takma ad kararlı olmalı');
const dl = await call('reviewer', 'file&id=' + id);
assert.equal(dl.status, 200);
assert(!dl.headers.get('content-disposition').includes('Ayse'));
const fw = await json(call('reviewer', 'file-workspace&id=' + id));
assert(fw.chain.every(c => c.name === 'teslim.pdf'));
const adminView = (await json(call('admin', 'submissions'))).find(r => r.id === id);
assert.equal(adminView.email, 'ayse.yilmaz@example.test', 'yönetici gerçek kimliği görür');
const ownView = (await json(call('ayse.yilmaz', 'submissions'))).find(r => r.id === id);
assert.equal(ownView.name, 'Ayse-Yilmaz-cevap.pdf', 'aday kendi dosya adını görür');

// Ölçütlü taslak ve yayın
const outputs = JSON.parse(readFileSync('server/pilot-catalog.json'))[0].outputs;
const base = {
  id,
  summary: 'Genel görüş',
  items: outputs.map(() => ({ observation: 'Gözlem', evidence: 'Sayfa 2', next: 'Paydayı yaz' })),
};
const partial = rubric.map((_, i) => ({ level: i === 0 ? 2 : null, note: '' }));
assert.equal((await call('reviewer', 'reviewdraft', { ...base, criteria: partial })).status, 200);
assert.equal(
  (await json(call('reviewer', 'reviewdraft&id=' + id))).draft.criteria[0].level,
  2,
  'taslakta seviye korunur'
);
assert.equal((await call('reviewer', 'review', { ...base, criteria: partial })).status, 400);
assert.equal(
  (await call('reviewer', 'review', { ...base, criteria: rubric.map(() => ({ level: 9 })) })).status,
  400
);
const levels = [3, 2, 1, 2];
assert.equal(
  (
    await call('reviewer', 'review', {
      ...base,
      criteria: levels.map((level, i) => ({ level, note: i ? '' : 'Sayfa 1 tablo' })),
    })
  ).status,
  201
);
const fb = (await json(call('ayse.yilmaz', 'my-feedback'))).rows[0].feedback;
assert.deepEqual(
  fb.criteria.map(c => c.level),
  levels
);
assert.equal(fb.criteria[0].name, rubric[0].name);
assert.equal(fb.criteria[0].note, 'Sayfa 1 tablo');
assert(!('score' in fb) && !('total' in fb), 'seviyeler toplanıp puana dönüştürülmez');

// --- Arayüz yardımcıları ---
const ctx = { window: {}, Event: class {} };
vm.runInNewContext(readFileSync('web/review-ui.js', 'utf8'), ctx);
const R = ctx.window.ReviewUI;
const now = Date.parse('2026-11-09T12:00:00Z');
const rows = [
  { id: 'new', created: '2026-11-09T08:00:00Z', feedback: null },
  { id: 'done', created: '2026-11-01T08:00:00Z', feedback: {} },
  { id: 'old', created: '2026-11-04T08:00:00Z', feedback: null },
];
assert.deepEqual(
  R.sortQueue(rows).map(r => r.id),
  ['old', 'new', 'done'],
  'bekleyenler en eskiden başlar'
);
assert.match(R.waitLabel(rows[2], now), /5 gündür bekliyor · hedef süre aşıldı/);
assert.match(R.waitLabel(rows[0], now), /Bugün geldi/);
assert.equal(R.waitLabel(rows[1], now), '');
const html = R.feedback({
  summary: '<b>özet</b>',
  items: [{ output: 'Not', observation: 'G', evidence: 'D', next: 'S' }],
  criteria: [{ name: 'Payda', level: 2, note: '<script>' }],
});
assert(html.includes('&lt;b&gt;özet') && html.includes('&lt;script&gt;'), 'çıktı kaçışlı olmalı');
assert(html.includes('Karşılanıyor'));
const meCtx = { rubrics: reviewCatalog };
const formHtml = R.form({ id: 'x', case_id: 'kpi-paradoksu', version: '3.0.0', outputs }, meCtx);
assert.equal((formHtml.match(/type="radio"/g) || []).length, rubric.length * 4);
console.log(
  'PASS: ölçüt seviyesi doğrulaması, taslak/yayın, kör değerlendirme (liste, indirme, dosya zinciri), kuyruk sırası ve güvenli geri bildirim görünümü.'
);
