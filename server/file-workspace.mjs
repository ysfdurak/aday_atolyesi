const response = (v, status = 200) =>
  Response.json(v, { status, headers: { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' } });
const fail = (s, status = 400) => {
  throw Object.assign(Error(s), { status });
};
const text = (v, n, empty = false) => {
  if (typeof v !== 'string' || v.length > n || (!empty && !v.trim()))
    fail('Gerekli notları ve uzunluklarını kontrol et.');
  return v.trim();
};
export function ancestry(rows, id) {
  const byId = new Map(rows.map(r => [r.id, r])),
    chain = [],
    seen = new Set();
  let row = byId.get(id);
  while (row && !seen.has(row.id) && chain.length < 100) {
    seen.add(row.id);
    chain.unshift(row);
    row = byId.get(row.parent_id);
  }
  return chain;
}
export async function fileAccess(db, member, row) {
  if (!row) return false;
  if (member.role === 'admin' || row.user_id === member.id) return true;
  if (member.role !== 'reviewer') return false;
  if (row.reviewer_id === member.id) return true;
  const descendants = (
    await db
      .prepare(
        'SELECT id,parent_id,reviewer_id FROM pilot_submissions WHERE user_id=? AND case_id=? AND version=?'
      )
      .bind(row.user_id, row.case_id, row.version)
      .all()
  ).results;
  return descendants.some(
    r => r.reviewer_id === member.id && ancestry(descendants, r.id).some(x => x.id === row.id)
  );
}
export function validateFileNote(input, chain, outputs) {
  if (input.action === 'comparison') {
    if (chain.length < 2 || input.fromId !== chain[0].id || input.toId !== chain.at(-1).id)
      fail('Karşılaştırma ilk ve son dosya teslimiyle eşleşmiyor.');
    if (!Array.isArray(input.items) || input.items.length !== outputs.length)
      fail('Karşılaştırma alanları beklenen çıktı sayısıyla eşleşmeli.');
    return {
      comparison: {
        fromId: input.fromId,
        toId: input.toId,
        items: outputs.map((label, i) => {
          const x = input.items?.[i];
          if (!x) fail('Her çıktı için karşılaştırma notu gerekir.');
          return {
            label,
            firstRef: text(x.firstRef, 1200),
            lastRef: text(x.lastRef, 1200),
            change: text(x.change, 2000),
          };
        }),
        remaining: text(input.remaining, 3000),
      },
    };
  }
  if (input.action === 'interview') {
    if (!Array.isArray(input.outputs) || input.outputs.length !== outputs.length)
      fail('Her çıktı için özet ve dosya referansı yaz.');
    return {
      interview: {
        submissionId: chain.at(-1).id,
        outputs: outputs.map((label, i) => ({
          label,
          answer: text(input.outputs[i].answer, 3000),
          reference: text(input.outputs[i].reference, 1200),
        })),
        remaining: text(input.remaining, 3000),
      },
    };
  }
  fail('Çalışma adımı bulunamadı.');
}
export async function fileWorkspace(request, db, member, input, now, catalog, criteria, options = {}) {
  const id = text(input.id, 100),
    row = await db.prepare('SELECT * FROM pilot_submissions WHERE id=?').bind(id).first();
  if (!(await fileAccess(db, member, row))) fail('Bu teslim için yetkin yok.', 403);
  const c = catalog.find(c => c.id === row.case_id && c.version === row.version);
  if (!c) fail('Vaka sürümü bulunamadı.');
  const rows = (
      await db
        .prepare(
          'SELECT s.rowid AS sequence,s.id,s.parent_id,s.user_id,s.reviewer_id,s.case_id,s.version,s.name,s.created,s.revision_note,r.payload AS feedback FROM pilot_submissions s LEFT JOIN pilot_reviews r ON r.submission_id=s.id WHERE s.user_id=? AND s.case_id=? AND s.version=? ORDER BY s.created,s.rowid'
        )
        .bind(row.user_id, row.case_id, row.version)
        .all()
    ).results,
    chain = ancestry(rows, id),
    latest = rows.at(-1),
    key = row.user_id + '/' + id,
    own = row.user_id === member.id;
  const stored = own
    ? await db.prepare('SELECT payload,updated FROM pilot_file_work WHERE id=?').bind(key).first()
    : null;
  if (request.method === 'GET')
    return response({
      userId: member.id,
      own,
      current: id === latest.id,
      case: c,
      criteria: criteria.find(c => c.id === row.case_id && c.version === row.version)?.rubric || [],
      chain: chain.map(r => ({
        id: r.id,
        // Kör değerlendirmede teslim sahibi olmayan kişi dosya adını görmez (ad soyad içerebilir).
        name: !own && options.maskName ? options.maskName(r.name) : r.name,
        created: r.created,
        revisionNote: r.revision_note,
        feedback: r.feedback ? JSON.parse(r.feedback) : null,
      })),
      notes: stored ? JSON.parse(stored.payload) : {},
      updated: stored?.updated || null,
    });
  if (request.method !== 'POST') fail('İşlem desteklenmiyor.', 405);
  if (row.user_id !== member.id) fail('Çalışma notunu yalnız teslim sahibi yazabilir.', 403);
  if (latest.id !== id) fail('Daha yeni bir teslim var. Son dosyadan devam et.', 409);
  if ((stored?.updated || null) !== (input.expectedUpdated || null))
    fail('Notlar başka cihazda değişti. Yenileyip tekrar incele.', 409);
  const stamp = new Date(Math.max(Date.parse(now), Date.parse(stored?.updated || '') + 1 || 0)).toISOString();
  const note = validateFileNote(input, chain, c.outputs),
    payload = JSON.stringify({ ...(stored ? JSON.parse(stored.payload) : {}), ...note });
  let result;
  if (!stored)
    result = await db
      .prepare(
        'INSERT INTO pilot_file_work(id,user_id,submission_id,payload,updated) VALUES (?,?,?,?,?) ON CONFLICT(id) DO NOTHING'
      )
      .bind(key, member.id, id, payload, stamp)
      .run();
  else
    result = await db
      .prepare('UPDATE pilot_file_work SET payload=?,updated=? WHERE id=? AND updated=?')
      .bind(payload, stamp, key, stored.updated)
      .run();
  if (result.meta.changes !== 1) fail('Notlar başka cihazda değişti. Yenileyip tekrar incele.', 409);
  return response({ ok: true, updated: stamp });
}
