import { readIdentity } from './identity.mjs';
import { fileWorkspace, fileAccess } from './file-workspace.mjs';
import reviewCatalog from './pilot-review-catalog.json' with { type: 'json' };
import { inflateRawSync } from 'node:zlib';
// Runtime-independent catalog: no solution/rubric is sent through this service.
import catalog from './pilot-catalog.json' with { type: 'json' };
import learningCatalog from './pilot-learning-catalog.json' with { type: 'json' };
import { validateObservations, summarizeObservations } from './pilot-feedback-model.mjs';
import { cycleState } from './cycle-model.mjs';
const MAX = 10 * 1024 * 1024;
const keys = [
  'aa-state-v1',
  'aa-position-v1',
  'zp-data-v1',
  'zp-session-v1',
  'zp-previous-session',
  'mizac-v2',
  'rol-atolyesi-v1',
  'rol-atolyesi-profile-events-v1',
];
const types = {
  pdf: 'application/pdf',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
};
function fail(message, status = 400) {
  throw Object.assign(new Error(message), { status });
}
function reply(value, status = 200) {
  return Response.json(value, {
    status,
    headers: { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' },
  });
}
async function bounded(request, max) {
  if (Number(request.headers.get('content-length')) > max)
    fail('Dosya veya kayıt boyutu sınırı aşıldı.', 413);
  const reader = request.body?.getReader();
  if (!reader) return new Uint8Array();
  let size = 0,
    parts = [];
  for (;;) {
    let { value, done } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > max) {
      await reader.cancel();
      fail('Dosya veya kayıt boyutu sınırı aşıldı.', 413);
    }
    parts.push(value);
  }
  let out = new Uint8Array(size),
    i = 0;
  for (let part of parts) {
    out.set(part, i);
    i += part.length;
  }
  return out;
}
async function json(request, max = 500000) {
  try {
    return JSON.parse(new TextDecoder().decode(await bounded(request, max)));
  } catch (e) {
    if (e.status) throw e;
    fail('Kayıt okunamadı.');
  }
}
function text(v, n = 4000) {
  if (typeof v !== 'string' || !v.trim() || v.length > n)
    fail('Gerekli alanları ve uzunluklarını kontrol et.');
  return v.trim();
}
export function validateFile(bytes, name) {
  const ext = name.toLowerCase().split('.').at(-1);
  if (!types[ext]) fail('Yalnız PDF, DOCX veya XLSX kabul edilir.');
  if (bytes.length < 20 || bytes.length > MAX) fail('Dosya boş veya 10 MB sınırını aşıyor.');
  if (ext === 'pdf') {
    const raw = new TextDecoder('latin1').decode(bytes);
    if (
      !raw.startsWith('%PDF-') ||
      !raw.slice(-2048).includes('%%EOF') ||
      /\/(Encrypt|JavaScript|JS|Launch|EmbeddedFile|RichMedia)\b/.test(raw)
    )
      fail('PDF okunamıyor veya şifreli. Şifresiz bir PDF yükle.');
    return types[ext];
  }
  // Inspect the central directory, not just a renamed ZIP signature. Bound expansion before inflating.
  const v = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  let end = -1;
  for (let i = bytes.length - 22; i >= Math.max(0, bytes.length - 65557); i--)
    if (v.getUint32(i, true) === 0x06054b50) {
      end = i;
      break;
    }
  if (end < 0) fail('Office dosyası okunamıyor.');
  const count = v.getUint16(end + 10, true),
    start = v.getUint32(end + 16, true);
  if (count > 2000 || count < 3) fail('Office dosyası desteklenmiyor.');
  let at = start,
    total = 0,
    entries = new Map();
  for (let i = 0; i < count; i++) {
    if (at + 46 > bytes.length || v.getUint32(at, true) !== 0x02014b50) fail('Office dosyası bozuk.');
    const flags = v.getUint16(at + 8, true),
      method = v.getUint16(at + 10, true),
      compressed = v.getUint32(at + 20, true),
      size = v.getUint32(at + 24, true),
      n = v.getUint16(at + 28, true),
      extra = v.getUint16(at + 30, true),
      comment = v.getUint16(at + 32, true),
      offset = v.getUint32(at + 42, true);
    if (at + 46 + n + extra + comment > bytes.length) fail('Office dosyası bozuk.');
    const path = new TextDecoder().decode(bytes.subarray(at + 46, at + 46 + n));
    total += size;
    if (
      flags & 1 ||
      total > 40 * 1024 * 1024 ||
      size > 12 * 1024 * 1024 ||
      ![0, 8].includes(method) ||
      entries.has(path) ||
      path.includes('..') ||
      /vbaProject|embeddings\/|activeX\//i.test(path)
    )
      fail('Şifreli, makrolu veya gömülü çalıştırılabilir içerikli dosya kabul edilmiyor.');
    entries.set(path, { offset, compressed, size, method });
    at += 46 + n + extra + comment;
  }
  const read = path => {
    const e = entries.get(path);
    if (!e) fail('Dosya uzantısı ile içerik eşleşmiyor.');
    if (e.offset + 30 > bytes.length || v.getUint32(e.offset, true) !== 0x04034b50)
      fail('Office dosyası bozuk.');
    const begin = e.offset + 30 + v.getUint16(e.offset + 26, true) + v.getUint16(e.offset + 28, true);
    if (begin + e.compressed > bytes.length) fail('Office dosyası bozuk.');
    let data = bytes.subarray(begin, begin + e.compressed);
    if (e.method === 8)
      data = inflateRawSync(data, {
        maxOutputLength: Math.min(Math.max(e.size + 65536, 65536), 12 * 1024 * 1024),
      });
    if (data.length !== e.size) fail('Office dosyası bozuk.');
    return new TextDecoder().decode(data);
  };
  const content = read('[Content_Types].xml');
  if (/macroEnabled|vbaProject/i.test(content)) fail('Makrolu dosya kabul edilmiyor.');
  if (ext === 'docx') {
    if (!content.includes('wordprocessingml.document.main+xml')) fail('Geçerli bir Word dosyası yükle.');
    read('word/document.xml');
  } else {
    if (!content.includes('spreadsheetml.sheet.main+xml')) fail('Geçerli bir Excel dosyası yükle.');
    read('xl/workbook.xml');
  }
  return types[ext];
}
export function validateSave(b) {
  if (
    !b ||
    b.schema !== 'aday-atolyesi-backup-v1' ||
    !b.values ||
    Array.isArray(b.values) ||
    !b.values['aa-state-v1']
  )
    fail('Hazırlık kaydı geçersiz.');
  for (const [k, v] of Object.entries(b.values)) {
    if (!keys.includes(k) || typeof v !== 'string') fail('Kayıt alanı desteklenmiyor.');
    let obj;
    try {
      obj = JSON.parse(v);
    } catch {
      fail('Kayıt geçersiz.');
    }
    if (k === 'aa-state-v1') {
      if (obj.schema !== 1 || !Array.isArray(obj.examples) || !obj.checks) fail('Aday kaydı geçersiz.');
      obj.cv = {};
      b.values[k] = JSON.stringify(obj);
    }
  }
  return b;
}
async function progress(db, uid) {
  const files = (
    await db
      .prepare(
        'SELECT s.rowid AS sequence,s.id,s.case_id,s.version,s.parent_id,s.created,r.created AS reviewed FROM pilot_submissions s LEFT JOIN pilot_reviews r ON r.submission_id=s.id WHERE s.user_id=? ORDER BY s.created,s.rowid'
      )
      .bind(uid)
      .all()
  ).results;
  const notes = (
    await db
      .prepare('SELECT case_id,version,payload,revision FROM pilot_learning WHERE user_id=?')
      .bind(uid)
      .all()
  ).results;
  return learningCatalog
    .map(c => {
      const first = cycleState(c, files);
      if (!first) return null;
      const n = notes.find(
        n => n.case_id === c.id && n.version === c.version && JSON.parse(n.payload).rootId === first.rootId
      );
      const s = cycleState(c, files, n ? JSON.parse(n.payload) : {});
      return s ? { ...s, revision: n?.revision || 0 } : null;
    })
    .filter(Boolean);
}
export async function handlePilot(request, env) {
  try {
    const url = new URL(request.url),
      op = url.searchParams.get('op') || 'me',
      method = request.method;
    if (!['GET', 'PUT', 'POST'].includes(method)) fail('İşlem desteklenmiyor.', 405);
    if (method !== 'GET' && request.headers.get('origin') !== url.origin)
      fail('İşlem kaynağı doğrulanamadı.', 403);
    const identity = readIdentity(request, env);
    // Misafir kullanıcı için durum sorgusu hata değil, beklenen bir durumdur.
    if (!identity && op === 'progress' && method === 'GET') return reply({ guest: true });
    if (!identity) fail('Devam etmek için hesabınla giriş yap.', 401);
    const { id: uid, email } = identity;
    if (!env.DB || !env.BUCKET) fail('Hesap ve dosya hizmeti henüz hazır değil.', 503);
    const db = env.DB,
      now = new Date().toISOString();
    await db
      .prepare(
        'INSERT INTO pilot_members (id,email,role,created) VALUES (?,?,?,?) ON CONFLICT(id) DO NOTHING'
      )
      .bind(
        uid,
        email,
        email.toLowerCase() === env.PILOT_OWNER_EMAIL?.trim().toLowerCase() ? 'admin' : 'candidate',
        now
      )
      .run();
    const member = await db.prepare('SELECT id,email,role FROM pilot_members WHERE id=?').bind(uid).first();
    const admin = member.role === 'admin',
      canReview = ['reviewer', 'admin'].includes(member.role);
    if (op === 'file-workspace')
      return await fileWorkspace(
        request,
        db,
        member,
        method === 'POST' ? await json(request) : Object.fromEntries(url.searchParams),
        now,
        catalog,
        reviewCatalog
      );
    if (op === 'me' && method === 'GET')
      return reply({
        user: member,
        cases: catalog,
        maxBytes: MAX,
        maxFiles: 100,
        maxStorageBytes: 262144000,
      });
    if (op === 'save' && method === 'GET') {
      const row = await db
        .prepare('SELECT payload,revision,updated FROM pilot_saves WHERE user_id=?')
        .bind(uid)
        .first();
      return reply(row ? { ...row, payload: JSON.parse(row.payload) } : { revision: 0, payload: null });
    }
    if (op === 'save' && method === 'PUT') {
      const input = await json(request, 12 * 1024 * 1024);
      if (!Number.isInteger(input.revision) || input.revision < 0) fail('Kayıt sürümü geçersiz.');
      const payload = JSON.stringify(validateSave(input.payload));
      let result;
      if (input.revision === 0)
        result = await db
          .prepare(
            'INSERT INTO pilot_saves(user_id,payload,revision,updated) VALUES (?,?,1,?) ON CONFLICT(user_id) DO NOTHING'
          )
          .bind(uid, payload, now)
          .run();
      else
        result = await db
          .prepare(
            'UPDATE pilot_saves SET payload=?,revision=revision+1,updated=? WHERE user_id=? AND revision=?'
          )
          .bind(payload, now, uid, input.revision)
          .run();
      if (result.meta.changes !== 1)
        fail('Başka bir cihazda yeni kayıt var. Önce hesap kaydını incele ve yükle.', 409);
      return reply({ revision: input.revision + 1, updated: now });
    }
    if (op === 'progress' && method === 'GET')
      return reply({
        userId: uid,
        cases: (await progress(db, uid)).map(({ data, ...s }) => s),
        checked: now,
      });
    if (op === 'learning') {
      const b = method === 'POST' ? await json(request) : Object.fromEntries(url.searchParams),
        c = learningCatalog.find(c => c.id === b.case && c.version === b.version);
      if (!c) fail('Vaka sürümü bulunamadı.');
      const s = (await progress(db, uid)).find(s => s.caseId === c.id && s.version === c.version);
      if (!s) fail('Önce vaka dosyanı teslim et.');
      if (method === 'GET')
        return reply({
          state: s,
          drills: s.reviewed
            ? c.learning.drills.map((d, i) => ({
                title: d.title,
                prompt: d.prompt,
                reference: s.data.practice?.[i] ? d.reference : null,
              }))
            : [],
          sections: s.reviewed ? c.learning.sections : [],
          update:
            s.revised && s.reviewed
              ? {
                  title: c.update.title,
                  text: c.update.text,
                  reference: s.data.defenseSubmissionId === s.latestId ? c.update.reference : null,
                }
              : null,
          transfer: c.learning.transfer,
        });
      if (method !== 'POST') fail('İşlem desteklenmiyor.', 405);
      if (b.revision !== s.revision || b.rootId !== s.rootId || b.latestId !== s.latestId)
        fail('Bu çalışma başka cihazda veya yeni teslimle değişti. Yenileyip tekrar dene.', 409);
      const data = { ...s.data, rootId: s.rootId };
      if (b.action === 'practice') {
        if (!s.reviewed) fail('Önce değerlendirici geri bildirimini bekle.');
        if (!Number.isInteger(b.index) || !c.learning.drills[b.index]) fail('Alıştırma bulunamadı.');
        data.practice = { ...data.practice, [b.index]: text(b.answer, 8000) };
      } else if (b.action === 'defense') {
        if (!s.reviewed || !s.revised || !Object.values(data.practice || {}).some(x => x.trim()))
          fail('Savunmadan önce geri bildirim, alıştırma ve revizyon gerekir.');
        data.defense = text(b.answer, 8000);
        data.defenseSubmissionId = s.latestId;
      } else if (b.action === 'transfer') {
        if (!['transfer', 'new-context', 'complete'].includes(s.phase))
          fail('Önce yeni bilgi karşısında kararını savun.');
        if (!data.transfer || data.transfer.submissionId !== s.latestId) {
          const existing = (
            await db
              .prepare('SELECT id FROM pilot_submissions WHERE user_id=? AND case_id=?')
              .bind(uid, c.learning.transfer)
              .all()
          ).results;
          data.transfer = {
            caseId: c.learning.transfer,
            at: now,
            submissionId: s.latestId,
            existingIds: existing.map(r => r.id),
          };
        }
      } else fail('Çalışma adımı bulunamadı.');
      const key = uid + '/' + c.id + '@' + c.version + '/' + s.rootId;
      let result;
      if (!s.revision)
        result = await db
          .prepare(
            'INSERT INTO pilot_learning(id,user_id,case_id,version,payload,revision,updated) VALUES (?,?,?,?,?,1,?) ON CONFLICT(id) DO NOTHING'
          )
          .bind(key, uid, c.id, c.version, JSON.stringify(data), now)
          .run();
      else
        result = await db
          .prepare(
            'UPDATE pilot_learning SET payload=?,revision=revision+1,updated=? WHERE id=? AND revision=?'
          )
          .bind(JSON.stringify(data), now, key, s.revision)
          .run();
      if (result.meta.changes !== 1) fail('Çalışma başka cihazda değişti. Yenileyip tekrar dene.', 409);
      return reply({ ok: true });
    }
    if (op === 'pilotfeedback' && method === 'GET') {
      const row = await db
        .prepare('SELECT payload,updated FROM pilot_feedback WHERE user_id=?')
        .bind(uid)
        .first();
      return reply({ feedback: row ? JSON.parse(row.payload) : null, updated: row?.updated });
    }
    if (op === 'pilotfeedback' && method === 'POST') {
      const b = await json(request);
      if (
        !Number.isInteger(b.ease) ||
        b.ease < 1 ||
        b.ease > 5 ||
        !['yes', 'no', 'unsure'].includes(b.repeat)
      )
        fail('Kullanım puanını ve tekrar kullanma seçimini kontrol et.');
      let observations;
      try {
        observations = validateObservations(b.observations);
      } catch (err) {
        fail(err.message);
      }
      const payload = {
        ...(observations ? { observations } : {}),
        ease: b.ease,
        repeat: b.repeat,
        useful: text(b.useful, 3000),
        difficulty: text(b.difficulty, 3000),
        suggestion:
          typeof b.suggestion === 'string' && b.suggestion.length <= 3000 ? b.suggestion.trim() : '',
      };
      await db
        .prepare(
          'INSERT INTO pilot_feedback(user_id,payload,updated) VALUES (?,?,?) ON CONFLICT(user_id) DO UPDATE SET payload=excluded.payload,updated=excluded.updated'
        )
        .bind(uid, JSON.stringify(payload), now)
        .run();
      return reply({ ok: true });
    }
    if (op === 'pilotfeedback-summary' && method === 'GET') {
      if (!admin) fail('Yetkin yok.', 403);
      const rows = (await db.prepare('SELECT payload FROM pilot_feedback').all()).results;
      return reply(summarizeObservations(rows.map(r => ({ payload: JSON.parse(r.payload) }))));
    }
    if (op === 'pilotfeedback-all' && method === 'GET') {
      if (!admin) fail('Yetkin yok.', 403);
      const rows = (
        await db
          .prepare(
            'SELECT m.email,f.payload,f.updated FROM pilot_feedback f JOIN pilot_members m ON m.id=f.user_id ORDER BY f.updated DESC LIMIT 200'
          )
          .all()
      ).results;
      return reply(rows.map(r => ({ ...r, payload: JSON.parse(r.payload) })));
    }
    if (op === 'export' && method === 'GET') {
      const saved = await db
        .prepare('SELECT payload,revision,updated FROM pilot_saves WHERE user_id=?')
        .bind(uid)
        .first();
      const files = (
        await db
          .prepare(
            'SELECT s.id,s.case_id,s.version,s.name,s.size,s.created,s.parent_id,s.revision_note,s.outputs,r.payload AS feedback,r.created AS reviewed FROM pilot_submissions s LEFT JOIN pilot_reviews r ON r.submission_id=s.id WHERE s.user_id=? ORDER BY s.created'
          )
          .bind(uid)
          .all()
      ).results;
      const learning = (
        await db
          .prepare('SELECT case_id,version,payload,revision,updated FROM pilot_learning WHERE user_id=?')
          .bind(uid)
          .all()
      ).results;
      return reply({
        schema: 'aday-atolyesi-account-export-v1',
        at: now,
        account: { email: member.email },
        pilotFeedback: await db
          .prepare('SELECT payload,updated FROM pilot_feedback WHERE user_id=?')
          .bind(uid)
          .first(),
        preparation: saved ? { ...saved, payload: JSON.parse(saved.payload) } : null,
        submissions: files.map(f => ({
          ...f,
          outputs: JSON.parse(f.outputs),
          feedback: f.feedback ? JSON.parse(f.feedback) : null,
        })),
        fileNotes: (
          await db
            .prepare('SELECT submission_id,payload,updated FROM pilot_file_work WHERE user_id=?')
            .bind(uid)
            .all()
        ).results.map(r => ({ ...r, payload: JSON.parse(r.payload) })),
        learning: learning.map(l => ({ ...l, payload: JSON.parse(l.payload) })),
        note: 'Özgün dosyalar ayrıca Teslimlerim alanından indirilebilir. Bu dosya cihaz yedeği yerine doğrudan içe aktarılmaz.',
      });
    }
    if (op === 'metrics' && method === 'GET') {
      if (!admin) fail('Yetkin yok.', 403);
      return reply(
        await db
          .prepare(
            "SELECT (SELECT COUNT(*) FROM pilot_members WHERE role='candidate') AS candidates,(SELECT COUNT(*) FROM pilot_saves) AS saved,(SELECT COUNT(DISTINCT user_id) FROM pilot_submissions) AS submitters,(SELECT COUNT(*) FROM pilot_submissions) AS submissions,(SELECT COUNT(*) FROM pilot_reviews) AS reviews,(SELECT COUNT(*) FROM pilot_submissions WHERE parent_id IS NOT NULL) AS revisions,(SELECT COALESCE(SUM(size),0) FROM pilot_submissions) AS bytes"
          )
          .first()
      );
    }
    if (op === 'reviewdraft') {
      const b = method === 'POST' ? await json(request) : Object.fromEntries(url.searchParams),
        row = await db.prepare('SELECT * FROM pilot_submissions WHERE id=?').bind(text(b.id, 100)).first();
      if (!row || !canReview || (!admin && row.reviewer_id !== uid)) fail('Bu taslak için yetkin yok.', 403);
      const key = uid + '/' + row.id;
      if (method === 'GET') {
        const draft = await db
          .prepare('SELECT payload FROM pilot_review_drafts WHERE id=?')
          .bind(key)
          .first();
        return reply({ draft: draft ? JSON.parse(draft.payload) : null });
      }
      const done = await db
        .prepare('SELECT id FROM pilot_reviews WHERE submission_id=?')
        .bind(row.id)
        .first();
      if (done) fail('Geri bildirim zaten yayımlandı.', 409);
      const outputs = JSON.parse(row.outputs);
      if (!Array.isArray(b.items) || b.items.length !== outputs.length) fail('Taslak alanları eksik.');
      const safe = v => {
        if (typeof v !== 'string' || v.length > 4000) fail('Taslak alanı çok uzun.');
        return v;
      };
      const payload = {
        summary: safe(b.summary),
        items: b.items.map(i => ({
          observation: safe(i.observation),
          evidence: safe(i.evidence),
          next: safe(i.next),
        })),
      };
      await db
        .prepare(
          'INSERT INTO pilot_review_drafts(id,reviewer_id,submission_id,payload,updated) VALUES (?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET payload=excluded.payload,updated=excluded.updated'
        )
        .bind(key, uid, row.id, JSON.stringify(payload), now)
        .run();
      return reply({ ok: true });
    }
    if (op === 'members' && method === 'GET') {
      if (!admin) fail('Yetkin yok.', 403);
      return reply(
        (await db.prepare('SELECT id,email,role FROM pilot_members ORDER BY created DESC LIMIT 200').all())
          .results
      );
    }
    if (op === 'role' && method === 'POST') {
      if (!admin) fail('Yetkin yok.', 403);
      const b = await json(request);
      if (!['candidate', 'reviewer'].includes(b.role) || b.id === uid) fail('Yetki değişikliği geçersiz.');
      await db
        .prepare("UPDATE pilot_members SET role=? WHERE id=? AND role<>'admin'")
        .bind(b.role, text(b.id, 200))
        .run();
      return reply({ ok: true });
    }
    // This endpoint is always own-only, including administrators and reviewers.
    if (op === 'my-feedback' && method === 'GET') {
      const rows = await db
        .prepare(
          'SELECT s.rowid AS sequence,s.id,s.case_id,s.version,s.name,s.created,s.parent_id,r.payload AS feedback,r.created AS reviewed FROM pilot_submissions s LEFT JOIN pilot_reviews r ON r.submission_id=s.id WHERE s.user_id=? ORDER BY s.created DESC,s.rowid DESC LIMIT 200'
        )
        .bind(uid)
        .all();
      return reply({
        userId: uid,
        rows: rows.results.map(r => ({ ...r, feedback: r.feedback ? JSON.parse(r.feedback) : null })),
      });
    }
    if (op === 'submissions' && method === 'GET') {
      const rows = await db
        .prepare(
          `SELECT s.rowid AS sequence,s.id,s.user_id,s.case_id,s.version,s.name,s.size,s.created,s.parent_id,s.revision_note,s.reviewer_id,s.outputs,m.email,r.payload AS feedback,r.created AS reviewed FROM pilot_submissions s JOIN pilot_members m ON m.id=s.user_id LEFT JOIN pilot_reviews r ON r.submission_id=s.id ${admin ? '' : 'WHERE s.user_id=? OR (s.reviewer_id=? AND ?=1)'} ORDER BY s.created DESC,s.rowid DESC LIMIT 200`
        )
        .bind(...(admin ? [] : [uid, uid, canReview ? 1 : 0]))
        .all();
      return reply(
        rows.results.map(r => ({
          ...r,
          outputs: JSON.parse(r.outputs),
          feedback: r.feedback ? JSON.parse(r.feedback) : null,
        }))
      );
    }
    if (op === 'submit' && method === 'POST') {
      const caseId = url.searchParams.get('case'),
        c = catalog.find(c => c.id === caseId);
      if (!c) fail('Vaka bulunamadı.');
      if (url.searchParams.get('version') !== c.version) fail('Vaka sürümü değişti. Sayfayı yenile.');
      if (url.searchParams.get('confirmed') !== 'yes') fail('Numaralı yanıt düzenini onayla.');
      const requestId = url.searchParams.get('request');
      if (
        requestId &&
        !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(requestId)
      )
        fail('Teslim kodu geçersiz.');
      if (requestId) {
        const prior = await db
          .prepare('SELECT id,case_id,version,name,created FROM pilot_submissions WHERE id=? AND user_id=?')
          .bind(requestId, uid)
          .first();
        if (prior) {
          if (
            prior.case_id !== c.id ||
            prior.version !== c.version ||
            prior.name !== url.searchParams.get('name')
          )
            fail('Bu teslim kodu başka bir dosya için kullanıldı.', 409);
          return reply({ id: prior.id, created: prior.created, repeated: true });
        }
      }
      const count = await db
        .prepare(
          'SELECT COUNT(*) AS count,COALESCE(SUM(size),0) AS size FROM pilot_submissions WHERE user_id=?'
        )
        .bind(uid)
        .first();
      if (count.count >= 100 || count.size >= 250 * 1024 * 1024)
        fail('Pilot teslim kotan doldu. Yöneticiyle görüş.', 429);
      const name = text(url.searchParams.get('name'), 180).replace(/[\x00-\x1f/\\]/g, '_'),
        parent = url.searchParams.get('parent') || null,
        note = (url.searchParams.get('note') || '').trim();
      if (note.length > 2000) fail('Revizyon notu çok uzun.');
      if (parent) {
        const original = await db
          .prepare('SELECT id FROM pilot_submissions WHERE id=? AND user_id=? AND case_id=? AND version=?')
          .bind(parent, uid, c.id, c.version)
          .first();
        if (!original || !note) fail('Revizyon için önceki teslimi ve değişiklik notunu seç.');
      }
      const bytes = await bounded(request, MAX);
      let mime;
      try {
        mime = validateFile(bytes, name);
      } catch (e) {
        if (e.status) throw e;
        fail('Dosya okunamıyor. Word/Excel üzerinden yeniden kaydedip dene.');
      }
      if (count.size + bytes.length > 250 * 1024 * 1024) fail('Pilot dosya kotası aşıldı.', 413);
      const id = requestId || crypto.randomUUID(),
        fileKey = `pilot/${uid}/${id}/${crypto.randomUUID()}`;
      await env.BUCKET.put(fileKey, bytes, { httpMetadata: { contentType: mime } });
      try {
        await db
          .prepare(
            'INSERT INTO pilot_submissions(id,user_id,case_id,version,name,file_key,size,mime,created,parent_id,revision_note,outputs) SELECT ?,?,?,?,?,?,?,?,?,?,?,? WHERE (SELECT COUNT(*) FROM pilot_submissions WHERE user_id=?)<100 AND (SELECT COALESCE(SUM(size),0) FROM pilot_submissions WHERE user_id=?)+?<=262144000'
          )
          .bind(
            id,
            uid,
            c.id,
            c.version,
            name,
            fileKey,
            bytes.length,
            mime,
            now,
            parent,
            note,
            JSON.stringify(c.outputs),
            uid,
            uid,
            bytes.length
          )
          .run()
          .then(result => {
            if (result.meta.changes !== 1) fail('Pilot teslim kotan doldu.', 429);
          });
      } catch (e) {
        await env.BUCKET.delete(fileKey);
        const existing =
          requestId &&
          (await db
            .prepare('SELECT id,created FROM pilot_submissions WHERE id=? AND user_id=?')
            .bind(requestId, uid)
            .first());
        if (existing) return reply({ id: existing.id, created: existing.created, repeated: true });
        throw e;
      }
      return reply({ id, created: now }, 201);
    }
    if (op === 'file' && method === 'GET') {
      const row = await db
        .prepare('SELECT * FROM pilot_submissions WHERE id=?')
        .bind(text(url.searchParams.get('id'), 100))
        .first();
      if (!(await fileAccess(db, member, row))) fail('Dosya bulunamadı.', 404);
      const file = await env.BUCKET.get(row.file_key);
      if (!file) fail('Dosya bulunamadı.', 404);
      return new Response(file.body, {
        headers: {
          'Content-Type': row.mime,
          'Content-Disposition': `attachment; filename*=UTF-8''${encodeURIComponent(row.name).replaceAll("'", '%27')}`,
          'Cache-Control': 'private, no-store',
          'X-Content-Type-Options': 'nosniff',
        },
      });
    }
    if (op === 'assign' && method === 'POST') {
      if (!admin) fail('Yetkin yok.', 403);
      const b = await json(request),
        target = await db
          .prepare("SELECT id FROM pilot_members WHERE id=? AND role IN ('reviewer','admin')")
          .bind(text(b.reviewer, 200))
          .first();
      if (!target) fail('Değerlendirici bulunamadı.');
      const has = await db
        .prepare('SELECT id FROM pilot_reviews WHERE submission_id=?')
        .bind(text(b.id, 100))
        .first();
      if (has) fail('Geri bildirim verilmiş teslimin değerlendiricisi değiştirilemez.');
      await db.prepare('UPDATE pilot_submissions SET reviewer_id=? WHERE id=?').bind(target.id, b.id).run();
      return reply({ ok: true });
    }
    if (op === 'review' && method === 'POST') {
      const b = await json(request),
        row = await db.prepare('SELECT * FROM pilot_submissions WHERE id=?').bind(text(b.id, 100)).first();
      if (!row || (!admin && row.reviewer_id !== uid)) fail('Bu teslim için yetkin yok.', 403);
      if (!['reviewer', 'admin'].includes(member.role)) fail('Değerlendirme yetkin yok.', 403);
      const outputs = JSON.parse(row.outputs);
      if (!Array.isArray(b.items) || b.items.length !== outputs.length)
        fail('Her çıktı için geri bildirim yaz.');
      const feedback = {
        summary: text(b.summary),
        items: b.items.map((i, n) => ({
          output: outputs[n],
          observation: text(i.observation),
          evidence: text(i.evidence),
          next: text(i.next),
        })),
      };
      try {
        await db
          .prepare(
            'INSERT INTO pilot_reviews(id,submission_id,reviewer_id,payload,created) VALUES (?,?,?,?,?)'
          )
          .bind(crypto.randomUUID(), row.id, uid, JSON.stringify(feedback), now)
          .run();
      } catch (e) {
        if (/UNIQUE/.test(e.message)) fail('Bu teslim zaten değerlendirildi.', 409);
        throw e;
      }
      return reply({ ok: true }, 201);
    }
    fail('İşlem bulunamadı.', 404);
  } catch (e) {
    if (!e.status) console.error('Pilot service failed', e.name);
    return reply(
      { error: e.status ? e.message : 'İşlem tamamlanamadı. Kaydını koruyup tekrar dene.' },
      e.status || 500
    );
  }
}
