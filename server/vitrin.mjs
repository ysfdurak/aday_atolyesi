// Canlı vitrin (aday.ysfdurak.com): herkese açık deneme kurulumu.
//
// - Rol seçerek şifresiz giriş: aday, İK değerlendiricisi veya pilot yöneticisi.
// - Her ziyaretçinin kendi alanı var (tarayıcıya özel rastgele kimlik). Üç rolün hesabı da bu alana
//   aittir: vitrin-aday-<alan>, vitrin-degerlendirici-<alan>, vitrin-yonetici-<alan>. Yönetici dahil
//   kimse başka bir ziyaretçinin teslimini, kaydını veya ayarını göremez (pilot-service › vitrinScope).
// - Dosya teslimi yalnız hazır kurgusal örnek dosyalarla yapılır; başka dosya sunucuda reddedilir.
//   Böylece gerçek özgeçmiş veya şirket dosyası vitrine hiç girmez.
// - Kimlik yalnız oturum çerezinden okunur; istemciden gelen kimlik başlıkları silinir.
// - D1 veritabanı ilk yayında boş oluşur; tablolar ilk istekte MIGRATIONS listesinden kurulur.
// - Örnek veri: her alana ilk istekte üç kurgusal aday teslimi (biri yayımlanmış ölçütlü geri
//   bildirimle, biri gecikmiş) yüklenir.
// - Her gece (wrangler.jsonc → triggers.crons) bütün kayıtlar ve dosyalar silinir; alanlar bir sonraki
//   istekte örneklerle yeniden kurulur.
import { handlePilot } from './pilot-service.mjs';
import { DEFAULT_HEADERS } from './identity.mjs';
import { MIGRATIONS } from './migrations.mjs';
import { SAMPLES } from './vitrin-samples.mjs';

export const COOKIE = 'aa_vitrin';
export const VITRIN_MAX_UPLOAD = 3 * 1024 * 1024;
const ROLES = {
  candidate: { prefix: 'vitrin-aday-', mail: 'aday', label: 'Aday' },
  reviewer: { prefix: 'vitrin-degerlendirici-', mail: 'degerlendirici', label: 'İK değerlendiricisi' },
  admin: { prefix: 'vitrin-yonetici-', mail: 'yonetici', label: 'Pilot yöneticisi' },
};
const ROLE_LABELS = Object.fromEntries(Object.entries(ROLES).map(([k, v]) => [k, v.label]));
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
/** Bir alanın (ziyaretçinin) verilen roldeki hesabı. */
export function account(role, scope) {
  const r = ROLES[role];
  return { role, id: r.prefix + scope, email: `${r.mail}@${scope.slice(0, 8)}.vitrin.aday-atolyesi` };
}
const fromBase64 = s => Uint8Array.from(atob(s), c => c.charCodeAt(0));
const SAMPLE_FILES = SAMPLES.map(s => ({ case: s.case, name: s.name, bytes: fromBase64(s.base64) }));
const same = (a, b) => a.length === b.length && a.every((x, i) => x === b[i]);
const TABLES = [
  'pilot_feedback',
  'pilot_review_drafts',
  'pilot_reviews',
  'pilot_learning',
  'pilot_file_work',
  'pilot_saves',
  'pilot_submissions',
  'pilot_settings',
  'pilot_members',
];

export const isVitrin = env => String(env?.AA_VITRIN ?? '0') === '1';

/** Çerezdeki oturumu çözer. Geçersiz veya eksikse null. */
export function readSession(request) {
  const raw = (request.headers.get('cookie') || '').match(
    new RegExp('(?:^|;\\s*)' + COOKIE + '=([^;]+)')
  )?.[1];
  if (!raw) return null;
  const [role, scope = ''] = decodeURIComponent(raw).split('|');
  // Eski biçim (candidate|vitrin-aday-<kimlik>) bilerek okunmaz: o kimlikler eskiden ortak yönetici ve
  // değerlendirici ekranlarında görünüyordu, alan anahtarı olarak kullanılırsa başkası o alana girebilirdi.
  if (!ROLES[role] || !UUID.test(scope)) return null;
  return { ...account(role, scope), scope };
}

/** Vaka için hazır kurgusal cevap dosyası (GET /vitrin-ornek?case=…). Yoksa null. */
export function sampleFile(request) {
  const url = new URL(request.url);
  if (url.pathname !== '/vitrin-ornek') return null;
  const f = SAMPLE_FILES.find(x => x.case === url.searchParams.get('case'));
  if (!f) return new Response('Bu vaka için hazır örnek yok.', { status: 404 });
  return new Response(f.bytes, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'Content-Disposition': `attachment; filename="${f.name}"`,
      'Cache-Control': 'public, max-age=3600',
    },
  });
}

const DEMO_ONLY =
  'Canlı demoda kendi dosyanı yükleyemezsin; seçtiğin vakanın hazır kurgusal örnek dosyası teslim edilir. Gerçek dosyanla denemek için kendi kurulumunu kullan.';
/**
 * Teslim isteğini denetler: gövde, vakanın hazır örnek dosyasıyla bayt bayt aynı olmalı.
 * Uygunsa gövdesi okunmuş yeni bir istek, değilse hata yanıtı döner.
 */
export async function guardUpload(request) {
  const url = new URL(request.url);
  if (url.searchParams.get('op') !== 'submit') return request;
  const size = Number(request.headers.get('content-length') || 0);
  if (size > VITRIN_MAX_UPLOAD) return Response.json({ error: DEMO_ONLY }, { status: 413 });
  const sample = SAMPLE_FILES.find(x => x.case === url.searchParams.get('case'));
  const reader = request.body?.getReader(),
    parts = [];
  let total = 0;
  while (reader) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.length;
    if (total > VITRIN_MAX_UPLOAD) {
      await reader.cancel();
      return Response.json({ error: DEMO_ONLY }, { status: 413 });
    }
    parts.push(value);
  }
  const bytes = new Uint8Array(total);
  let at = 0;
  for (const p of parts) {
    bytes.set(p, at);
    at += p.length;
  }
  if (!sample || !same(bytes, sample.bytes)) return Response.json({ error: DEMO_ONLY }, { status: 400 });
  url.searchParams.set('name', sample.name);
  return new Request(url, { method: request.method, headers: request.headers, body: bytes });
}

/** /api/pilot isteğini, kimliği yalnız çerezden gelecek şekilde yeniden kurar. */
export function withSessionIdentity(request) {
  const session = readSession(request),
    headers = new Headers(request.headers);
  for (const name of [DEFAULT_HEADERS.id, DEFAULT_HEADERS.email]) headers.delete(name);
  if (session) {
    headers.set(DEFAULT_HEADERS.id, session.id);
    headers.set(DEFAULT_HEADERS.email, session.email);
  }
  return new Request(request, { headers });
}

const cookie = (value, maxAge) =>
  `${COOKIE}=${encodeURIComponent(value)}; Path=/; Max-Age=${maxAge}; HttpOnly; Secure; SameSite=Lax`;
const back = '/workspace.html#pilot';
const esc = s =>
  String(s).replace(
    /[&<>"']/g,
    c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]
  );

export function signInPage(current) {
  const buttons = Object.entries(ROLE_LABELS)
    .map(
      ([role, label]) =>
        `<button class="btn${role === 'candidate' ? ' primary' : ''}" name="role" value="${role}">${esc(label)}</button>`
    )
    .join(' ');
  return `<!doctype html><html lang="tr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Canlı demo girişi · Aday Atölyesi</title><link rel="icon" href="/favicon.svg" type="image/svg+xml"><link rel="stylesheet" href="/style.css"><meta name="robots" content="noindex"><script defer src="/en-tour.js"></script></head><body><main class="card" style="max-width:680px;margin:6vh auto;padding:2rem"><span class="eyebrow">Canlı demo</span><h1 style="font-size:34px">Bir rol seç, şifresiz gir.</h1><p>Aday olarak vaka dosyası teslim edebilir; İK değerlendiricisi olarak ölçütlü geri bildirim yazabilir; pilot yöneticisi olarak teslimleri atayıp kör değerlendirmeyi açabilirsin.</p>${current ? `<p class="muted">Şu an <b>${esc(ROLE_LABELS[current.role])}</b> olarak girişlisin.</p>` : ''}<form method="post" style="display:flex;gap:10px;flex-wrap:wrap;margin:18px 0">${buttons}</form><div class="note"><b>Bu bir demodur ve sana özeldir.</b> Üç rol de bu tarayıcıya ait ayrı bir alanda çalışır; başka ziyaretçiler senin kayıtlarını görmez, sen de onlarınkini görmezsin. Kendi dosyanı yükleyemezsin: teslim için hazır kurgusal örnek dosyalar kullanılır. Yazdığın notlar ve kayıtlar her gece 03.00'te (TSİ) silinir.</div><p style="margin-top:18px"><a href="/workspace.html">← Hazırlık alanına dön</a></p></main></body></html>`;
}

/** Giriş/çıkış yolları. İlgili değilse null döner. */
export async function handleAuth(request) {
  const url = new URL(request.url);
  if (url.pathname === '/signout-with-chatgpt')
    return new Response(null, { status: 303, headers: { Location: back, 'Set-Cookie': cookie('', 0) } });
  if (url.pathname !== '/signin-with-chatgpt') return null;
  if (request.method === 'GET')
    return new Response(signInPage(readSession(request)), {
      headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' },
    });
  if (request.method !== 'POST') return new Response('Yöntem desteklenmiyor', { status: 405 });
  const origin = request.headers.get('origin');
  if (origin && origin !== url.origin) return new Response('Geçersiz istek', { status: 403 });
  const body = (await request.text()).slice(0, 200),
    role = new URLSearchParams(body).get('role');
  if (!ROLES[role]) return new Response('Rol bulunamadı', { status: 400 });
  // Aynı tarayıcı rol değiştirince kendi alanında kalır: aday olarak gönderdiğini yönetici olarak görür.
  const value = role + '|' + (readSession(request)?.scope || crypto.randomUUID());
  return new Response(null, {
    status: 303,
    headers: { Location: back, 'Set-Cookie': cookie(value, 60 * 60 * 24 * 30) },
  });
}

// ---- Veritabanı kurulumu ----
// Not: Cloudflare Workers bir isteğin başlattığı Promise'i başka bir isteğin beklemesine izin vermez.
// Bu yüzden istekler arasında paylaşılan Promise tutulmaz; yalnız "bitti" bilgisi saklanır ve her adım
// aynı anda iki istek çalıştırsa da güvenli olacak şekilde (idempotent) yazılmıştır.
let schemaDone = false;
const alreadyExists = err => /already exists/i.test(String(err?.message || err));
/** Eksik tabloları kurar. Aynı Worker örneğinde başarıyla bittikten sonra tekrar çalışmaz. */
export async function ensureSchema(db) {
  if (schemaDone) return;
  await db
    .prepare('CREATE TABLE IF NOT EXISTS aa_schema (tag text PRIMARY KEY NOT NULL, applied text NOT NULL)')
    .run();
  const done = new Set((await db.prepare('SELECT tag FROM aa_schema').all()).results.map(r => r.tag));
  for (const m of MIGRATIONS) {
    if (done.has(m.tag)) continue;
    for (const sql of m.statements) {
      try {
        await db.prepare(sql).run();
      } catch (err) {
        // Aynı anda gelen başka bir istek bu adımı az önce yapmış olabilir.
        if (!alreadyExists(err)) throw err;
      }
    }
    await db
      .prepare('INSERT OR IGNORE INTO aa_schema(tag,applied) VALUES (?,?)')
      .bind(m.tag, new Date().toISOString())
      .run();
  }
  schemaDone = true;
}
export const resetSchemaCache = () => {
  schemaDone = false;
  seededAt.clear();
};

// ---- Örnek veri ----
async function as(env, user, op, { method = 'POST', body, query = '' } = {}) {
  const headers = new Headers({
    [DEFAULT_HEADERS.id]: user.id,
    [DEFAULT_HEADERS.email]: user.email,
    origin: 'https://vitrin.local',
  });
  if (body && !(body instanceof Uint8Array)) headers.set('Content-Type', 'application/json');
  const res = await handlePilot(
    new Request('https://vitrin.local/api/pilot?op=' + op + query, {
      method,
      headers,
      body: body instanceof Uint8Array ? body : body ? JSON.stringify(body) : undefined,
    }),
    env
  );
  if (!res.ok) throw Error(`Vitrin örnek verisi yüklenemedi (${op}): ${res.status} ${await res.text()}`);
  return res.json();
}

/** Bir ziyaretçi alanına örnek kayıtları yükler: kendi yöneticisi, değerlendiricisi ve üç kurgusal aday. */
export async function seed(env, scope, now = Date.now()) {
  const db = env.DB;
  const admin = account('admin', scope),
    reviewer = account('reviewer', scope);
  const stampNow = new Date(now).toISOString();
  for (const m of [admin, reviewer])
    await db
      .prepare('INSERT OR IGNORE INTO pilot_members (id,email,role,created) VALUES (?,?,?,?)')
      .bind(m.id, m.email, m.role, stampNow)
      .run();
  const catalog = (await as(env, admin, 'me', { method: 'GET' })).cases;
  const ids = [];
  for (const [i, s] of SAMPLES.entries()) {
    const c = catalog.find(x => x.id === s.case);
    const user = { id: `vitrin-ornek-${i + 1}-${scope}`, email: `ornek-${i + 1}@ornek.vitrin.aday-atolyesi` };
    await as(env, user, 'me', { method: 'GET' });
    const r = await as(env, user, 'submit', {
      query: `&case=${c.id}&version=${encodeURIComponent(c.version)}&name=${encodeURIComponent(s.name)}&confirmed=yes`,
      body: SAMPLE_FILES[i].bytes,
    });
    ids.push(r.id);
  }
  // 1: yayımlanmış ölçütlü geri bildirim · 2: değerlendiricide bekliyor (hedef süre aşıldı) · 3: atanmamış
  await as(env, admin, 'assign', { body: { id: ids[0], reviewer: reviewer.id } });
  await as(env, admin, 'assign', { body: { id: ids[1], reviewer: reviewer.id } });
  const me = await as(env, reviewer, 'me', { method: 'GET' });
  const first = (await as(env, reviewer, 'submissions', { method: 'GET' })).find(r => r.id === ids[0]);
  const rubric = me.rubrics.find(x => x.id === first.case_id && x.version === first.version).rubric;
  await as(env, reviewer, 'review', {
    body: {
      id: ids[0],
      summary:
        'Karma etkisini doğru ayırmışsın ve hesapların doğru paydayla yapılmış. Öncelikli gelişim alanı: önerinin kimin onayına gittiğini ve hangi tarihte ölçüleceğini netleştirmek.',
      items: first.outputs.map((o, i) => ({
        observation:
          [
            'Sonuç ilk cümlede açık; iki kanalın da iyileştiği ve düşüşün karmadan geldiği doğru gösterilmiş.',
            'Üç oranın hesabı doğru ve paydalar açıkça yazılmış.',
            'Adımlar ve sorumlu var; karma değişiminin nedenini araştırma adımının ölçütü belirsiz.',
            'Akış mantıklı; dördüncü slaytta istenen karar tek cümleyle yazılmalı.',
          ][i] || 'Çıktı istenen yapıda.',
        evidence:
          ['1. bölüm, ilk paragraf', '2. bölüm, hesap satırları', '3. bölüm, 2. hafta', '4. bölüm, 4. madde'][
            i
          ] || 'Dosya',
        next:
          [
            'Karar önerisini ve onay makamını tek cümleyle ekle.',
            'Hesapları tablo olarak ayrı ekte ver.',
            'Araştırmanın sonucunu nasıl ölçeceğini yaz.',
            'Onay istenen kararı slayt başlığı yap.',
          ][i] || 'Bir sonraki revizyonda netleştir.',
      })),
      criteria: rubric.map((_, i) => ({ level: [3, 2, 2, 1][i] ?? 2, note: i === 0 ? '1. bölüm' : '' })),
    },
  });
  // Tarihleri bugüne göre ayarla: örnekler canlı bir kuyruk gibi görünsün.
  const day = 86400000,
    stamp = ms => new Date(now - ms).toISOString();
  const dates = [
    [ids[0], stamp(6 * day), stamp(5 * day)],
    [ids[1], stamp(4 * day + 3 * 3600000), null],
    [ids[2], stamp(1 * day + 2 * 3600000), null],
  ];
  for (const [id, created, reviewed] of dates) {
    await db.prepare('UPDATE pilot_submissions SET created=? WHERE id=?').bind(created, id).run();
    if (reviewed)
      await db.prepare('UPDATE pilot_reviews SET created=? WHERE submission_id=?').bind(reviewed, id).run();
  }
  await db
    .prepare('INSERT OR REPLACE INTO pilot_settings(key,value,updated) VALUES (?,?,?)')
    .bind('vitrin_seeded:' + scope, stampNow, stampNow)
    .run();
  return ids;
}

// Bu Worker örneğinde örnekleri hazır olan alanlar. Gece sıfırlaması başka bir örnekte çalışabileceği
// için kayıt kısa süre sonra yeniden doğrulanır.
const seededAt = new Map();
const RECHECK_MS = 5 * 60 * 1000;
const STALE_CLAIM_MS = 2 * 60 * 1000;
async function claimSeeding(db, scope, now) {
  const claim = await db
    .prepare(
      "INSERT INTO pilot_settings(key,value,updated) VALUES (?,'pending',?) ON CONFLICT(key) DO NOTHING"
    )
    .bind('vitrin_seeded:' + scope, new Date(now).toISOString())
    .run();
  return claim.meta.changes === 1;
}
// Kötüye kullanım sınırı: her yeni alan D1'e ~25 yazma ve R2'ye 3 dosya demektir. Otomatik betikle sınırsız alan
// açılıp günlük kota tüketilmesin diye günde en fazla MAX_SCOPES_DAY, aynı IP'den saatte en fazla MAX_SCOPES_IP_HOUR
// yeni alan kurulur. Sayaçlar pilot_settings'te tutulur ve gece sıfırlamasında silinir.
export const MAX_SCOPES_DAY = 1500;
export const MAX_SCOPES_IP_HOUR = 20;
async function ipKey(ip, now) {
  const d = await crypto.subtle.digest('SHA-256', new TextEncoder().encode('aday-vitrin:' + ip));
  const h = [...new Uint8Array(d).slice(0, 8)].map(b => b.toString(16).padStart(2, '0')).join('');
  return `vitrin_ip:${h}:${Math.floor(now / 3600000)}`;
}
async function allowNewScope(db, ip, now) {
  const day = await db
    .prepare("SELECT COUNT(*) AS n FROM pilot_settings WHERE key LIKE 'vitrin\\_seeded:%' ESCAPE '\\'")
    .first();
  if (day.n >= MAX_SCOPES_DAY) return false;
  if (!ip) return true;
  const key = await ipKey(ip, now),
    stamp = new Date(now).toISOString();
  const row = await db
    .prepare(
      "INSERT INTO pilot_settings(key,value,updated) VALUES (?,'1',?) ON CONFLICT(key) DO UPDATE SET value=CAST(value AS INTEGER)+1,updated=excluded.updated RETURNING value"
    )
    .bind(key, stamp)
    .first();
  return Number(row.value) <= MAX_SCOPES_IP_HOUR;
}

/**
 * Alan boşsa örnekleri yükler. Aynı anda birden çok istek gelse de yalnız biri yükler.
 * Dönüş: 'ok' (hazır ya da başka istek yüklüyor) veya 'full' (kötüye kullanım sınırı doldu).
 */
export async function ensureSeeded(env, scope, now = Date.now(), ip = '') {
  if (!scope) return 'ok';
  if (now - (seededAt.get(scope) ?? -Infinity) < RECHECK_MS) return 'ok';
  await ensureSchema(env.DB);
  const key = 'vitrin_seeded:' + scope;
  const row = await env.DB.prepare('SELECT value,updated FROM pilot_settings WHERE key=?').bind(key).first();
  if (row && row.value !== 'pending') {
    if (seededAt.size > 5000) seededAt.clear();
    seededAt.set(scope, now);
    return 'ok';
  }
  // Yarım kalmış bir yükleme (ör. Worker kesildi) iki dakika sonra yeniden denenir.
  if (row && now - Date.parse(row.updated) > STALE_CLAIM_MS)
    await env.DB.prepare("DELETE FROM pilot_settings WHERE key=? AND value='pending'").bind(key).run();
  if (!row && !(await allowNewScope(env.DB, ip, now))) return 'full';
  if (!(await claimSeeding(env.DB, scope, now))) return 'ok'; // başka bir istek yüklüyor
  try {
    await seed(env, scope, now);
    seededAt.set(scope, now);
    return 'ok';
  } catch (err) {
    await env.DB.prepare("DELETE FROM pilot_settings WHERE key=? AND value='pending'").bind(key).run();
    throw err;
  }
}

/** Gece sıfırlama: bütün alanların kayıtlarını ve dosyalarını siler. Alanlar ilk istekte yeniden kurulur. */
export async function resetVitrin(env) {
  await ensureSchema(env.DB);
  let cursor;
  do {
    const page = await env.BUCKET.list({ prefix: 'pilot/', cursor, limit: 500 });
    const keys = page.objects.map(o => o.key);
    if (keys.length) await env.BUCKET.delete(keys);
    cursor = page.truncated ? page.cursor : undefined;
  } while (cursor);
  for (const t of TABLES) await env.DB.prepare('DELETE FROM ' + t).run();
  seededAt.clear();
}
