// Canlı vitrin: tablo kurulumu, rolle giriş, kimlik başlığı sahteciliğine karşı koruma, örnek veri ve gece sıfırlama.
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { readFileSync } from 'node:fs';
import { handlePilot } from '../server/pilot-service.mjs';
import {
  ACCOUNTS,
  readSession,
  withSessionIdentity,
  handleAuth,
  ensureSchema,
  resetSchemaCache,
  ensureSeeded,
  resetVitrin,
} from '../server/vitrin.mjs';
import { readMigrations, render } from '../tools/build-migrations.mjs';

assert.equal(
  readFileSync('server/migrations.mjs', 'utf8'),
  render(readMigrations()),
  'server/migrations.mjs güncel değil: node tools/build-migrations.mjs'
);

const sqlite = new DatabaseSync(':memory:');
const objects = new Map();
const env = {
  AA_VITRIN: '1',
  PILOT_OWNER_EMAIL: ACCOUNTS.admin.email,
  PROTECTED_MEMBERS: ACCOUNTS.reviewer.id,
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
      objects.set(k, v instanceof Uint8Array ? v : new Uint8Array(await new Response(v).arrayBuffer()));
    },
    async get(k) {
      return objects.has(k) ? { body: objects.get(k) } : null;
    },
    async delete(k) {
      for (const key of [].concat(k)) objects.delete(key);
    },
    async list({ prefix = '', cursor, limit = 1000 } = {}) {
      const keys = [...objects.keys()].filter(k => k.startsWith(prefix)).sort();
      const start = Number(cursor || 0),
        page = keys.slice(start, start + limit);
      const truncated = start + limit < keys.length;
      return {
        objects: page.map(key => ({ key })),
        truncated,
        cursor: truncated ? String(start + limit) : undefined,
      };
    },
  },
};

// Tablo kurulumu: boş veritabanında kurulur, tekrar çağrılınca bir şey değişmez.
await ensureSchema(env.DB);
resetSchemaCache();
await ensureSchema(env.DB);
const tags = sqlite
  .prepare('SELECT tag FROM aa_schema ORDER BY tag')
  .all()
  .map(r => r.tag);
assert.deepEqual(
  tags,
  readMigrations().map(m => m.tag)
);
assert(sqlite.prepare("SELECT name FROM sqlite_master WHERE name='pilot_settings'").get());

// Örnek veri
await ensureSeeded(env);
await ensureSeeded(env);
const subs = sqlite.prepare('SELECT * FROM pilot_submissions ORDER BY created').all();
assert.equal(subs.length, 3, 'üç örnek teslim yüklenir (ikinci çağrı tekrar yüklemez)');
assert.equal(sqlite.prepare('SELECT COUNT(*) AS n FROM pilot_reviews').get().n, 1);
assert.equal(objects.size, 3);

// Giriş
const origin = 'https://aday.example.test';
const page = await handleAuth(new Request(origin + '/signin-with-chatgpt'));
assert.equal(page.status, 200);
const html = await page.text();
assert(html.includes('Gerçek kişisel bilgi') && html.includes('value="candidate"'));
const post = (role, headers = {}) =>
  handleAuth(
    new Request(origin + '/signin-with-chatgpt', {
      method: 'POST',
      headers: { origin, 'content-type': 'application/x-www-form-urlencoded', ...headers },
      body: 'role=' + role,
    })
  );
assert.equal((await post('root')).status, 400);
assert.equal((await post('candidate', { origin: 'https://evil.test' })).status, 403);
const signed = await post('candidate');
assert.equal(signed.status, 303);
const setCookie = signed.headers.get('set-cookie');
assert.match(setCookie, /HttpOnly; Secure; SameSite=Lax/);
const candidateCookie = setCookie.split(';')[0];
const sessionReq = new Request(origin + '/api/pilot?op=me', { headers: { cookie: candidateCookie } });
const candidate = readSession(sessionReq);
assert.equal(candidate.role, 'candidate');
assert.match(candidate.id, /^vitrin-aday-/);
const again = await post('candidate', { cookie: candidateCookie });
assert.equal(
  readSession(new Request(origin, { headers: { cookie: again.headers.get('set-cookie').split(';')[0] } })).id,
  candidate.id,
  'aynı tarayıcı aday rolüne dönünce aynı hesap'
);
assert.equal(readSession(new Request(origin, { headers: { cookie: 'aa_vitrin=admin%7Cbaska-biri' } })), null);
assert.equal(
  readSession(new Request(origin, { headers: { cookie: 'aa_vitrin=candidate%7Cvitrin-yonetici' } })),
  null
);
const out = await handleAuth(new Request(origin + '/signout-with-chatgpt'));
assert.match(out.headers.get('set-cookie'), /Max-Age=0/);
assert.equal(await handleAuth(new Request(origin + '/workspace.html')), null);

// Kimlik yalnız çerezden: sahte başlıklar silinir.
const forged = withSessionIdentity(
  new Request(origin + '/api/pilot?op=me', {
    headers: {
      'oai-authenticated-user-id': ACCOUNTS.admin.id,
      'oai-authenticated-user-email': ACCOUNTS.admin.email,
    },
  })
);
assert.equal(forged.headers.get('oai-authenticated-user-id'), null);
assert.equal((await handlePilot(forged, env)).status, 401);
const call = async (cookieValue, op, body) => {
  const r = await handlePilot(
    withSessionIdentity(
      new Request(origin + '/api/pilot?op=' + op, {
        method: body ? 'POST' : 'GET',
        headers: { cookie: cookieValue, origin, ...(body ? { 'Content-Type': 'application/json' } : {}) },
        body: body ? JSON.stringify(body) : undefined,
      })
    ),
    env
  );
  return { status: r.status, body: await r.json() };
};
const meCandidate = await call(candidateCookie, 'me');
assert.equal(meCandidate.body.user.role, 'candidate');
assert.equal(meCandidate.body.vitrin, true);
assert.equal(
  (await call(candidateCookie, 'submissions')).body.length,
  0,
  'ziyaretçi adayı örnek teslimleri görmez'
);

const reviewerCookie = 'aa_vitrin=' + encodeURIComponent('reviewer|' + ACCOUNTS.reviewer.id);
const adminCookie = 'aa_vitrin=' + encodeURIComponent('admin|' + ACCOUNTS.admin.id);
const queue = (await call(reviewerCookie, 'submissions')).body;
assert.equal(queue.length, 2, 'değerlendirici kendisine atanan iki örneği görür');
assert.equal(queue.filter(r => r.feedback).length, 1);
assert(queue.find(r => r.feedback).feedback.criteria.length >= 3, 'örnek geri bildirim ölçütlüdür');
const late = queue.find(r => !r.feedback);
assert(Date.now() - Date.parse(late.created) > 3 * 86400000, 'bekleyen örnek hedef süreyi aşmıştır');
const reviewedRow = sqlite
  .prepare(
    'SELECT s.created AS sent, r.created AS reviewed FROM pilot_reviews r JOIN pilot_submissions s ON s.id=r.submission_id'
  )
  .get();
assert(Date.parse(reviewedRow.reviewed) > Date.parse(reviewedRow.sent), 'geri bildirim tesliminden sonra');
assert(
  Date.now() - Date.parse(reviewedRow.reviewed) > 4 * 86400000,
  'örnek geri bildirim tarihi geçmişe ayarlanır'
);
const adminView = (await call(adminCookie, 'me')).body;
assert.equal(adminView.user.role, 'admin');
assert.equal((await call(adminCookie, 'submissions')).body.filter(r => !r.reviewer_id).length, 1);

// Ortak değerlendirici hesabının rolü düşürülemez.
assert.equal((await call(adminCookie, 'role', { id: ACCOUNTS.reviewer.id, role: 'candidate' })).status, 400);
assert.equal(
  sqlite.prepare('SELECT role FROM pilot_members WHERE id=?').get(ACCOUNTS.reviewer.id).role,
  'reviewer'
);

// Ziyaretçi teslimi ve gece sıfırlama
const c = adminView.cases[0];
const pdf = new TextEncoder().encode('%PDF-1.4\n1 0 obj\n<<>>\nendobj\n%%EOF\n');
const up = await handlePilot(
  withSessionIdentity(
    new Request(
      origin + `/api/pilot?op=submit&case=${c.id}&version=${c.version}&name=cevap.pdf&confirmed=yes`,
      { method: 'POST', headers: { cookie: candidateCookie, origin }, body: pdf }
    )
  ),
  env
);
assert.equal(up.status, 201);
assert.equal(objects.size, 4);
await call(adminCookie, 'settings', { blindReview: true });
await resetVitrin(env);
assert.equal(
  sqlite.prepare('SELECT COUNT(*) AS n FROM pilot_submissions').get().n,
  3,
  'sıfırlamada yalnız örnekler kalır'
);
assert.equal(objects.size, 3, 'ziyaretçi dosyaları silinir');
assert.equal(
  sqlite.prepare("SELECT COUNT(*) AS n FROM pilot_members WHERE id LIKE 'vitrin-aday-%'").get().n,
  0
);
assert.equal(
  sqlite.prepare("SELECT value FROM pilot_settings WHERE key='blind_review'").get(),
  undefined,
  'ayarlar varsayılana döner'
);
console.log(
  'PASS: vitrin tablo kurulumu, örnek kuyruk, rolle giriş, sahte kimlik başlıklarının silinmesi, korumalı hesap ve gece sıfırlama.'
);
