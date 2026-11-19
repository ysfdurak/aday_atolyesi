// Canlı vitrin: tablo kurulumu, rolle giriş, kimlik başlığı sahteciliğine karşı koruma, örnek veri ve gece sıfırlama.
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { readFileSync } from 'node:fs';
import { handlePilot } from '../server/pilot-service.mjs';
import {
  account,
  readSession,
  guardUpload,
  sampleFile,
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
// Aynı anda iki ilk istek: biri tabloyu kurarken diğeri hata vermemeli.
sqlite.exec('DROP TABLE pilot_settings');
sqlite.exec("DELETE FROM aa_schema WHERE tag LIKE '0004%'");
resetSchemaCache();
await Promise.all([ensureSchema(env.DB), (resetSchemaCache(), ensureSchema(env.DB))]);
const tags = sqlite
  .prepare('SELECT tag FROM aa_schema ORDER BY tag')
  .all()
  .map(r => r.tag);
assert.deepEqual(
  tags,
  readMigrations().map(m => m.tag)
);
assert(sqlite.prepare("SELECT name FROM sqlite_master WHERE name='pilot_settings'").get());

// Cloudflare istekler arası Promise paylaşımına izin vermez: modülde bekleyen Promise tutulmamalı.
const vitrinSource = readFileSync('server/vitrin.mjs', 'utf8');
assert(
  !/let \w+ = null;[\s\S]{0,80}\|\|\s*\(async/.test(vitrinSource),
  'istekler arasında paylaşılan Promise'
);
const workerSource = readFileSync('worker/index.ts', 'utf8');
assert(
  workerSource.includes('APP_PATHS') &&
    workerSource.includes("'/api/pilot'") &&
    workerSource.includes("'/vitrin-ornek'"),
  'uygulama dışı yollar hızlı 404 almalı'
);

// Giriş
const origin = 'https://aday.example.test';
const page = await handleAuth(new Request(origin + '/signin-with-chatgpt'));
assert.equal(page.status, 200);
const html = await page.text();
assert(html.includes('sana özeldir') && html.includes('value="candidate"'));
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
const cookieOf = res => res.headers.get('set-cookie').split(';')[0];
const signed = await post('candidate');
assert.equal(signed.status, 303);
assert.match(signed.headers.get('set-cookie'), /HttpOnly; Secure; SameSite=Lax/);
const aCandidate = cookieOf(signed);
const sessionOf = c => readSession(new Request(origin, { headers: { cookie: c } }));
const A = sessionOf(aCandidate);
assert.equal(A.role, 'candidate');
assert.match(A.id, /^vitrin-aday-/);
assert.equal(
  sessionOf(cookieOf(await post('candidate', { cookie: aCandidate }))).id,
  A.id,
  'aynı tarayıcı aynı aday'
);
// Rol değiştirince aynı alanda kalınır.
const aAdmin = cookieOf(await post('admin', { cookie: aCandidate })),
  aReviewer = cookieOf(await post('reviewer', { cookie: aAdmin }));
assert.equal(sessionOf(aAdmin).id, 'vitrin-yonetici-' + A.scope);
assert.equal(sessionOf(aReviewer).id, 'vitrin-degerlendirici-' + A.scope);
// Eski ortak hesap çerezleri ve sahte değerler geçersiz.
for (const bad of [
  'admin%7Cvitrin-yonetici',
  'reviewer%7Cvitrin-degerlendirici',
  'admin%7Cbaska-biri',
  'root%7C' + A.scope,
])
  assert.equal(sessionOf('aa_vitrin=' + bad), null, bad);
// Eski aday çerez biçimi okunmaya devam eder.
assert.equal(sessionOf('aa_vitrin=' + encodeURIComponent('candidate|' + A.id)).id, A.id);
const out = await handleAuth(new Request(origin + '/signout-with-chatgpt'));
assert.match(out.headers.get('set-cookie'), /Max-Age=0/);
assert.equal(await handleAuth(new Request(origin + '/workspace.html')), null);

// Örnek veri: alan başına bir kez, aynı anda gelen istekler de yalnız bir kez yükler.
await Promise.all([ensureSeeded(env, A.scope), ensureSeeded(env, A.scope), ensureSeeded(env, A.scope)]);
resetSchemaCache();
await ensureSeeded(env, A.scope);
assert.equal(sqlite.prepare('SELECT COUNT(*) AS n FROM pilot_submissions').get().n, 3, 'alana üç örnek');
assert.equal(sqlite.prepare('SELECT COUNT(*) AS n FROM pilot_reviews').get().n, 1);
assert.equal(objects.size, 3);

// Kimlik yalnız çerezden: sahte başlıklar silinir.
const forged = withSessionIdentity(
  new Request(origin + '/api/pilot?op=me', {
    headers: {
      'oai-authenticated-user-id': account('admin', A.scope).id,
      'oai-authenticated-user-email': 'x@y',
    },
  })
);
assert.equal(forged.headers.get('oai-authenticated-user-id'), null);
assert.equal((await handlePilot(forged, env)).status, 401);
const call = async (cookieValue, op, body, query = '') => {
  const r = await handlePilot(
    withSessionIdentity(
      new Request(origin + '/api/pilot?op=' + op + query, {
        method: body ? 'POST' : 'GET',
        headers: { cookie: cookieValue, origin, ...(body ? { 'Content-Type': 'application/json' } : {}) },
        body: body ? JSON.stringify(body) : undefined,
      })
    ),
    env
  );
  return { status: r.status, body: r.headers.get('content-type')?.includes('json') ? await r.json() : null };
};
const meCandidate = await call(aCandidate, 'me');
assert.equal(meCandidate.body.user.role, 'candidate');
assert.equal(meCandidate.body.vitrin, true);
assert.equal(meCandidate.body.user.scope, undefined, 'alan kimliği yanıtta dönmez');
assert.deepEqual(meCandidate.body.vitrinCases, ['kpi-paradoksu', 'vardiya-darbogazi', 'butce-sapmasi']);
assert.equal((await call(aCandidate, 'submissions')).body.length, 0, 'aday örnek teslimleri görmez');

const queue = (await call(aReviewer, 'submissions')).body;
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
const adminView = (await call(aAdmin, 'me')).body;
assert.equal(adminView.user.role, 'admin');
assert.equal((await call(aAdmin, 'submissions')).body.filter(r => !r.reviewer_id).length, 1);

// Teslim yalnız hazır örnek dosyayla: başka dosya sunucuda reddedilir.
const submitReq = (cookieValue, caseId, version, body) =>
  new Request(origin + `/api/pilot?op=submit&case=${caseId}&version=${version}&name=cv.pdf&confirmed=yes`, {
    method: 'POST',
    headers: { cookie: cookieValue, origin, 'content-length': String(body.length) },
    body,
  });
const kpi = adminView.cases.find(c => c.id === 'kpi-paradoksu');
const pdf = new TextEncoder().encode('%PDF-1.4\n1 0 obj\n<<>>\nendobj\n%%EOF\n');
const rejected = await guardUpload(submitReq(aCandidate, kpi.id, kpi.version, pdf));
assert(rejected instanceof Response && rejected.status === 400, 'kendi dosyası reddedilir');
assert.match((await rejected.json()).error, /kendi dosyanı yükleyemezsin/);
const sampleRes = sampleFile(new Request(origin + '/vitrin-ornek?case=' + kpi.id));
assert.equal(sampleRes.status, 200);
const sampleBytes = new Uint8Array(await sampleRes.arrayBuffer());
assert.equal(sampleFile(new Request(origin + '/vitrin-ornek?case=yok')).status, 404);
const otherCase = adminView.cases.find(c => c.id === 'vardiya-darbogazi');
assert.equal(
  (await guardUpload(submitReq(aCandidate, otherCase.id, otherCase.version, sampleBytes))).status,
  400,
  'başka vakanın örneği de kabul edilmez'
);
const okReq = await guardUpload(submitReq(aCandidate, kpi.id, kpi.version, sampleBytes));
assert(okReq instanceof Request);
assert.equal(
  new URL(okReq.url).searchParams.get('name'),
  'ornek-aday-1-kpi-paradoksu.docx',
  'dosya adı örneğinki olur'
);
const up = await handlePilot(withSessionIdentity(okReq), env);
assert.equal(up.status, 201);
const aSubmission = (await up.json()).id;

// İki bağımsız ziyaretçi: B, A'nın teslimini hiçbir rolde göremez, A da B'ninkini.
const bCandidate = cookieOf(await post('candidate')),
  B = sessionOf(bCandidate);
assert.notEqual(B.scope, A.scope);
const bAdmin = cookieOf(await post('admin', { cookie: bCandidate })),
  bReviewer = cookieOf(await post('reviewer', { cookie: bAdmin }));
await ensureSeeded(env, B.scope);
const bUp = await handlePilot(
  withSessionIdentity(await guardUpload(submitReq(bCandidate, kpi.id, kpi.version, sampleBytes))),
  env
);
assert.equal(bUp.status, 201);
const bSubmission = (await bUp.json()).id;
const ids = async c => (await call(c, 'submissions')).body.map(r => r.id);
assert(!(await ids(bAdmin)).includes(aSubmission), 'B yöneticisi A teslimini görmez');
assert.equal((await ids(bAdmin)).length, 4, 'B yöneticisi kendi üç örneğini ve kendi teslimini görür');
assert(!(await ids(aAdmin)).includes(bSubmission), 'A yöneticisi B teslimini görmez');
assert(!(await ids(bReviewer)).includes(aSubmission));
assert.equal((await call(bAdmin, 'file', null, '&id=' + aSubmission)).status, 404, 'dosya indirilemez');
assert.equal(
  (await call(bAdmin, 'assign', { id: aSubmission, reviewer: account('reviewer', B.scope).id })).status,
  404
);
assert.equal(
  (await call(bAdmin, 'assign', { id: bSubmission, reviewer: account('reviewer', A.scope).id })).status,
  400,
  'başka alanın değerlendiricisine atanamaz'
);
assert.equal((await call(bAdmin, 'review', { id: aSubmission, items: [] })).status, 403);
assert.equal((await call(bAdmin, 'reviewdraft', null, '&id=' + aSubmission)).status, 403);
assert.equal((await call(bAdmin, 'file-workspace', null, '&id=' + aSubmission)).status, 403);
const bMembers = (await call(bAdmin, 'members')).body.map(m => m.id);
assert(
  bMembers.every(id => id.endsWith(B.scope)),
  'üye listesi yalnız kendi alanı'
);
await call(bAdmin, 'role', { id: A.id, role: 'reviewer' });
assert.equal(
  sqlite.prepare('SELECT role FROM pilot_members WHERE id=?').get(A.id).role,
  'candidate',
  'başka alanın rolü değişmez'
);
const metrics = (await call(bAdmin, 'metrics')).body;
assert.equal(metrics.submissions, 4);
assert.equal(metrics.reviews, 1);
// Kör değerlendirme ayarı da alana özel.
await call(aAdmin, 'settings', { blindReview: true });
assert.equal((await call(aAdmin, 'me')).body.blindReview, true);
assert.equal((await call(bAdmin, 'me')).body.blindReview, false);

// Gece sıfırlama: bütün alanlar silinir; ilk istekte örnekler yeniden kurulur.
await resetVitrin(env);
assert.equal(sqlite.prepare('SELECT COUNT(*) AS n FROM pilot_submissions').get().n, 0);
assert.equal(objects.size, 0, 'dosyalar silinir');
assert.equal(sqlite.prepare('SELECT COUNT(*) AS n FROM pilot_members').get().n, 0);
assert.equal(
  sqlite.prepare('SELECT COUNT(*) AS n FROM pilot_settings').get().n,
  0,
  'ayarlar varsayılana döner'
);
await ensureSeeded(env, A.scope);
assert.equal(sqlite.prepare('SELECT COUNT(*) AS n FROM pilot_submissions').get().n, 3);
console.log(
  'PASS: vitrin tablo kurulumu, ziyaretçiye özel alan ve örnek kuyruk, iki ziyaretçinin birbirini görmemesi, yalnız hazır örnek dosya teslimi, sahte kimlik başlıklarının silinmesi ve gece sıfırlama.'
);
