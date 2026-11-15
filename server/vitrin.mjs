// Canlı vitrin (aday.ysfdurak.com): herkese açık deneme kurulumu.
//
// - Rol seçerek şifresiz giriş: aday, İK değerlendiricisi veya pilot yöneticisi.
//   Her ziyaretçinin aday hesabı ayrıdır (tarayıcıya özel rastgele kimlik); değerlendirici ve
//   yönetici hesapları ortaktır, bu yüzden aday teslimleri bu rolleri seçen herkese görünür.
// - Kimlik yalnız oturum çerezinden okunur; istemciden gelen kimlik başlıkları silinir.
// - D1 veritabanı ilk yayında boş oluşur; tablolar ilk istekte MIGRATIONS listesinden kurulur.
// - Örnek veri: üç kurgusal aday teslimi (biri yayımlanmış ölçütlü geri bildirimle, biri gecikmiş).
// - Her gece (wrangler.jsonc → triggers.crons) bütün kayıtlar ve dosyalar silinir, örnekler yeniden yüklenir.
import { handlePilot } from './pilot-service.mjs';
import { DEFAULT_HEADERS } from './identity.mjs';
import { MIGRATIONS } from './migrations.mjs';
import { SAMPLES } from './vitrin-samples.mjs';

export const COOKIE = 'aa_vitrin';
export const VITRIN_MAX_UPLOAD = 3 * 1024 * 1024;
export const ACCOUNTS = {
  reviewer: {
    id: 'vitrin-degerlendirici',
    email: 'degerlendirici@vitrin.aday-atolyesi',
    label: 'İK değerlendiricisi',
  },
  admin: { id: 'vitrin-yonetici', email: 'yonetici@vitrin.aday-atolyesi', label: 'Pilot yöneticisi' },
};
const ROLE_LABELS = { candidate: 'Aday', reviewer: ACCOUNTS.reviewer.label, admin: ACCOUNTS.admin.label };
const CANDIDATE_ID = /^vitrin-aday-[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
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
  const [role, id] = decodeURIComponent(raw).split('|');
  if (role === 'candidate' && CANDIDATE_ID.test(id || ''))
    return { role, id, email: id.slice(-12) + '@aday.vitrin.aday-atolyesi' };
  if (ACCOUNTS[role] && id === ACCOUNTS[role].id) return { role, ...ACCOUNTS[role] };
  return null;
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
  return `<!doctype html><html lang="tr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Canlı demo girişi · Aday Atölyesi</title><link rel="icon" href="/favicon.svg" type="image/svg+xml"><link rel="stylesheet" href="/style.css"><meta name="robots" content="noindex"></head><body><main class="card" style="max-width:680px;margin:6vh auto;padding:2rem"><span class="eyebrow">Canlı demo</span><h1 style="font-size:34px">Bir rol seç, şifresiz gir.</h1><p>Aday olarak vaka dosyası teslim edebilir; İK değerlendiricisi olarak ölçütlü geri bildirim yazabilir; pilot yöneticisi olarak teslimleri atayıp kör değerlendirmeyi açabilirsin.</p>${current ? `<p class="muted">Şu an <b>${esc(ROLE_LABELS[current.role])}</b> olarak girişlisin.</p>` : ''}<form method="post" style="display:flex;gap:10px;flex-wrap:wrap;margin:18px 0">${buttons}</form><div class="note"><b>Bu bir demodur.</b> Gerçek kişisel bilgi içeren dosya yükleme: yüklenen dosyalar değerlendirici ve yönetici rolünü seçen herkese görünür. Bütün kayıtlar ve dosyalar her gece 03.00'te (TSİ) silinir. Dosya sınırı 3 MB.</div><p style="margin-top:18px"><a href="/workspace.html">← Hazırlık alanına dön</a></p></main></body></html>`;
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
  let value;
  if (role === 'candidate') {
    // Aynı tarayıcı aday rolüne dönerse kendi teslimlerini yeniden görür.
    const prior = readSession(request);
    value = 'candidate|' + (prior?.role === 'candidate' ? prior.id : 'vitrin-aday-' + crypto.randomUUID());
  } else if (ACCOUNTS[role]) value = role + '|' + ACCOUNTS[role].id;
  else return new Response('Rol bulunamadı', { status: 400 });
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
  seededDone = false;
};

// ---- Örnek veri ----
const fromBase64 = s => Uint8Array.from(atob(s), c => c.charCodeAt(0));
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

/** Boş vitrine örnek kayıtları yükler. */
export async function seed(env, now = Date.now()) {
  const db = env.DB;
  const admin = ACCOUNTS.admin,
    reviewer = ACCOUNTS.reviewer;
  await as(env, admin, 'me', { method: 'GET' });
  await as(env, reviewer, 'me', { method: 'GET' });
  await as(env, admin, 'role', { body: { id: reviewer.id, role: 'reviewer' } });
  const catalog = (await as(env, admin, 'me', { method: 'GET' })).cases;
  const ids = [];
  for (const s of SAMPLES) {
    const c = catalog.find(x => x.id === s.case);
    const user = { id: s.user, email: s.user + '@ornek.vitrin.aday-atolyesi' };
    await as(env, user, 'me', { method: 'GET' });
    const r = await as(env, user, 'submit', {
      query: `&case=${c.id}&version=${encodeURIComponent(c.version)}&name=${encodeURIComponent(s.name)}&confirmed=yes`,
      body: fromBase64(s.base64),
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
    .prepare("INSERT OR REPLACE INTO pilot_settings(key,value,updated) VALUES ('vitrin_seeded',?,?)")
    .bind(new Date(now).toISOString(), new Date(now).toISOString())
    .run();
  return ids;
}

/** Vitrin boşsa (ilk yayın) örnekleri yükler. Aynı anda birden çok istek gelse de yalnız biri yükler. */
let seededDone = false;
const STALE_CLAIM_MS = 2 * 60 * 1000;
async function claimSeeding(db, now) {
  const claim = await db
    .prepare(
      "INSERT INTO pilot_settings(key,value,updated) VALUES ('vitrin_seeded','pending',?) ON CONFLICT(key) DO NOTHING"
    )
    .bind(new Date(now).toISOString())
    .run();
  return claim.meta.changes === 1;
}
export async function ensureSeeded(env, now = Date.now()) {
  if (seededDone) return;
  await ensureSchema(env.DB);
  const row = await env.DB.prepare(
    "SELECT value,updated FROM pilot_settings WHERE key='vitrin_seeded'"
  ).first();
  if (row && row.value !== 'pending') {
    seededDone = true;
    return;
  }
  // Yarım kalmış bir yükleme (ör. Worker kesildi) iki dakika sonra yeniden denenir.
  if (row && now - Date.parse(row.updated) > STALE_CLAIM_MS)
    await env.DB.prepare("DELETE FROM pilot_settings WHERE key='vitrin_seeded' AND value='pending'").run();
  if (!(await claimSeeding(env.DB, now))) return; // başka bir istek yüklüyor
  try {
    await seed(env, now);
    seededDone = true;
  } catch (err) {
    await env.DB.prepare("DELETE FROM pilot_settings WHERE key='vitrin_seeded' AND value='pending'").run();
    throw err;
  }
}

/** Gece sıfırlama: bütün kayıtları ve dosyaları siler, örnekleri yeniden yükler. */
export async function resetVitrin(env, now = Date.now()) {
  await ensureSchema(env.DB);
  let cursor;
  do {
    const page = await env.BUCKET.list({ prefix: 'pilot/', cursor, limit: 500 });
    const keys = page.objects.map(o => o.key);
    if (keys.length) await env.BUCKET.delete(keys);
    cursor = page.truncated ? page.cursor : undefined;
  } while (cursor);
  for (const t of TABLES) await env.DB.prepare('DELETE FROM ' + t).run();
  // Yükleme bitene kadar başka isteklerin örnekleri ikinci kez yüklemesini engelle.
  await claimSeeding(env.DB, now);
  seededDone = false;
  const ids = await seed(env, now);
  seededDone = true;
  return ids;
}
