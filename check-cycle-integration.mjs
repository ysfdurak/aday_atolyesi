import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { readFileSync, readdirSync } from 'node:fs';
import vm from 'node:vm';
import { handlePilot } from './pilot-service.mjs';
const sqlite = new DatabaseSync(':memory:');
for (const f of readdirSync('drizzle')
  .filter(f => f.endsWith('.sql'))
  .sort())
  sqlite.exec(readFileSync('drizzle/' + f, 'utf8').replaceAll('--> statement-breakpoint', ''));
const objects = new Map();
const DB = {
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
        const r = sqlite.prepare(sql).run(...args);
        return { meta: { changes: Number(r.changes) } };
      },
    };
  },
};
const env = {
  PILOT_OWNER_EMAIL: 'pilot-admin@example.test',
  DB,
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
const origin = 'https://test.local';
async function req(user, op, b, method = b ? 'POST' : 'GET') {
  const r = await handlePilot(
    new Request(origin + '/api/pilot?op=' + op, {
      method,
      headers: {
        origin,
        'oai-authenticated-user-id': user,
        'oai-authenticated-user-email':
          user === 'admin' ? 'pilot-admin@example.test' : user + '@example.test',
      },
      body: b ? JSON.stringify(b) : undefined,
    }),
    env
  );
  return { status: r.status, ...(await r.json()) };
}
async function submit(user, caseId = 'kpi-paradoksu', parent = '', note = '', request = crypto.randomUUID()) {
  const name = 'answer.docx',
    bytes = readFileSync('web/cases/office/' + caseId + '-calisma.docx');
  const p = new URLSearchParams({
    op: 'submit',
    case: caseId,
    version: '3.0.0',
    name,
    parent,
    note,
    confirmed: 'yes',
    request,
  });
  const r = await handlePilot(
    new Request(origin + '/api/pilot?' + p, {
      method: 'POST',
      headers: {
        origin,
        'oai-authenticated-user-id': user,
        'oai-authenticated-user-email': user + '@example.test',
      },
      body: bytes,
    }),
    env
  );
  return { status: r.status, ...(await r.json()) };
}
for (const u of ['admin', 'candidate', 'reviewer', 'other']) await req(u, 'me');
await req('admin', 'role', { id: 'reviewer', role: 'reviewer' });
const request = crypto.randomUUID(),
  first = await submit('candidate', undefined, undefined, undefined, request);
assert.equal(first.status, 201);
const duplicate = await submit('candidate', undefined, undefined, undefined, request);
assert.equal(duplicate.id, first.id);
assert(duplicate.repeated);
assert.equal(objects.size, 1);
let p = await req('candidate', 'progress');
assert.equal(p.cases[0].phase, 'review');
assert.equal((await req('other', 'progress')).cases.length, 0);
let l = await req('candidate', 'learning&case=kpi-paradoksu&version=3.0.0');
assert.equal(l.drills.length, 0);
assert.equal(l.sections.length, 0);
const action = async a => {
  l = await req('candidate', 'learning&case=kpi-paradoksu&version=3.0.0');
  return req('candidate', 'learning', {
    case: 'kpi-paradoksu',
    version: '3.0.0',
    revision: l.state.revision,
    rootId: l.state.rootId,
    latestId: l.state.latestId,
    ...a,
  });
};
assert.equal((await action({ action: 'practice', index: 0, answer: 'Answer' })).status, 400);
await req('admin', 'assign', { id: first.id, reviewer: 'reviewer' });
const outs = JSON.parse(readFileSync('pilot-catalog.json'))[0].outputs;
const feedback = {
  id: first.id,
  summary: 'Özet',
  items: outs.map(() => ({ observation: 'Gözlem', evidence: 'Sayfa 1 dayanak', next: 'Gelişim adımı' })),
};
assert.equal((await req('reviewer', 'reviewdraft', feedback)).status, 200);
assert((await req('reviewer', 'reviewdraft&id=' + first.id)).draft);
assert.equal((await req('candidate', 'reviewdraft&id=' + first.id)).status, 403);
assert.equal((await req('reviewer', 'review', feedback)).status, 201);
assert.equal((await req('reviewer', 'reviewdraft', feedback)).status, 409);
l = await req('candidate', 'learning&case=kpi-paradoksu&version=3.0.0');
assert.equal(l.state.phase, 'practice');
assert(l.drills[0].prompt);
assert.equal(l.drills[0].reference, null);
assert.equal((await action({ action: 'defense', answer: 'Early' })).status, 400);
assert.equal((await action({ action: 'practice', index: 0, answer: 'Kendi hesap ve yorumum' })).status, 200);
l = await req('candidate', 'learning&case=kpi-paradoksu&version=3.0.0');
assert(l.drills[0].reference);
assert.equal(l.state.phase, 'revision');
const stale = await req('candidate', 'learning', {
  case: 'kpi-paradoksu',
  version: '3.0.0',
  revision: 0,
  rootId: first.id,
  action: 'practice',
  index: 0,
  answer: 'Stale',
});
assert.equal(stale.status, 409);
const second = await submit('candidate', 'kpi-paradoksu', first.id, 'Geri bildirimle revize ettim');
assert.equal(second.status, 201);
l = await req('candidate', 'learning&case=kpi-paradoksu&version=3.0.0');
assert.equal(l.state.phase, 'defense');
assert(l.update.text);
assert.equal(l.update.reference, null);
assert.equal(
  (await action({ action: 'defense', latestId: first.id, answer: 'Eski teslimden gelen savunma' })).status,
  409
);
assert.equal((await action({ action: 'transfer' })).status, 400);
assert.equal(
  (await action({ action: 'defense', answer: 'Yeni bilgiyle kararımı ve sınırlarımı güncelledim' })).status,
  200
);
// A transfer case submitted before the link cannot close the cycle.
await submit('candidate', 'kampanya-karari');
assert.equal((await action({ action: 'transfer' })).status, 200);
p = await req('candidate', 'progress');
assert.equal(p.cases.find(c => c.caseId === 'kpi-paradoksu').phase, 'new-context');
await submit('candidate', 'kampanya-karari');
p = await req('candidate', 'progress');
assert.equal(p.cases.find(c => c.caseId === 'kpi-paradoksu').phase, 'complete');
assert.equal((await req('other', 'metrics')).status, 403);
assert.equal((await req('admin', 'metrics')).reviews, 1);
// The real preparation planner consumes server-owned phases, without inventing a local text submission.
const x = { window: null, console, crypto };
x.window = x;
vm.createContext(x);
for (const f of [
  'case-archive-v1',
  'case-data',
  'case-engine',
  'learning-engine',
  'core',
  'preparation-plan',
])
  vm.runInContext(readFileSync('web/' + f + '.js', 'utf8'), x);
x.PilotProgress = {
  phase: (id, version) => {
    const c = p.cases.find(c => c.caseId === id && c.version === version);
    return c ? { ...c, id: c.phase } : null;
  },
  rows: () => p.cases,
};
const state = x.AA.blank();
state.profile = {
  role: 'analyst',
  title: 'Analist',
  minutes: 60,
  start: '2026-10-31',
  deadline: '2026-11-14',
  people: false,
  employed: false,
  job: '',
};
const c = x.CASE_CATALOG[0];
assert.equal(x.AA.casePhase(state, c).id, 'complete');
assert.equal(x.AA.caseOverview(state).submitted, 2);
assert.equal(x.AA.caseOverview(state).revised, 1);
assert.equal(Object.keys(state.assessments).length, 0);
const before = await req('candidate', 'export');
assert.equal(before.submissions.length, 4);
assert(before.learning[0].payload.defense);
assert.equal((await req('other', 'export')).submissions.length, 0);
const fresh = await submit('candidate');
const next = await req('candidate', 'learning&case=kpi-paradoksu&version=3.0.0');
assert.equal(next.state.revision, 0);
assert.equal(next.state.rootId, fresh.id);
assert.equal(next.state.phase, 'review');
assert.equal((await req('candidate', 'export')).learning[0].payload.rootId, first.id);
// Even owner/admin cannot use the own-feedback endpoint to retrieve someone else's work.
const own = await req('candidate', 'my-feedback&user_id=other');
assert.equal(own.userId, 'candidate');
assert.equal(own.rows.length, 5);
assert(own.rows.some(r => r.feedback));
assert(own.rows.every(r => !('user_id' in r) && !('email' in r) && !('file_key' in r)));
assert.equal((await req('admin', 'my-feedback')).rows.length, 0);
assert.equal((await req('reviewer', 'my-feedback')).rows.length, 0);
assert.equal((await req('other', 'my-feedback&user_id=candidate')).rows.length, 0);
// Optional pilot observations are bounded and summaries are admin-only, including old feedback compatibility.
const pilotFeedback = {
  ease: 4,
  repeat: 'yes',
  useful: 'Kaynak bağlantısı',
  difficulty: 'İndirme adımı',
  suggestion: '',
};
assert.equal((await req('candidate', 'pilotfeedback', pilotFeedback)).status, 200);
assert.equal(
  (
    await req('candidate', 'pilotfeedback', {
      ...pilotFeedback,
      observations: {
        path: 'analyst',
        device: 'phone',
        nextUse: 'paid',
        tasks: {
          source: { status: 'alone', minutes: 4 },
          revision: { status: 'not_tried', minutes: null },
          rehearsal: { status: 'help', minutes: 12 },
        },
      },
    })
  ).status,
  200
);
let summary = await req('admin', 'pilotfeedback-summary');
assert.equal(summary.respondents, 1);
assert.equal(summary.observed, 1);
assert.equal(summary.tasks.source.alone, 1);
assert.equal(summary.tasks.revision.not_tried, 1);
assert.equal(summary.tasks.rehearsal.help, 1);
assert.equal(summary.tasks.transfer.reported, 0);
assert.equal((await req('other', 'pilotfeedback-summary')).status, 403);
assert.equal((await req('reviewer', 'pilotfeedback-summary')).status, 403);
for (const t of [
  { status: 'alone', minutes: -1 },
  { status: 'alone', minutes: 1.5 },
  { status: 'not_tried', minutes: 1 },
  { status: 'perfect', minutes: null },
])
  assert.equal(
    (
      await req('candidate', 'pilotfeedback', {
        ...pilotFeedback,
        observations: { path: 'analyst', device: 'phone', nextUse: 'paid', tasks: { source: t } },
      })
    ).status,
    400
  );
assert.equal((await req('candidate', 'pilotfeedback')).feedback.observations.tasks.source.minutes, 4);
// File workspace: exact ancestry, assigned-revision access, own notes, CAS, immutable old notes.
const revisedFile = await submit('candidate', 'kpi-paradoksu', fresh.id, 'Çıktılara dayanak eklendi');
assert.equal(revisedFile.status, 201);
await req('admin', 'assign', { id: revisedFile.id, reviewer: 'reviewer' });
let fw = await req('candidate', 'file-workspace&id=' + revisedFile.id);
assert.equal(fw.chain.length, 2);
assert.equal(fw.chain[0].id, fresh.id);
assert(fw.own && fw.current);
assert(fw.criteria.length > 0);
assert.equal((await req('other', 'file-workspace&id=' + revisedFile.id)).status, 403);
assert.equal((await req('reviewer', 'file-workspace&id=' + revisedFile.id)).status, 200);
const historyFile = await handlePilot(
  new Request(origin + '/api/pilot?op=file&id=' + fresh.id, {
    headers: {
      'oai-authenticated-user-id': 'reviewer',
      'oai-authenticated-user-email': 'reviewer@example.test',
    },
  }),
  env
);
assert.equal(historyFile.status, 200);
const comparisonNote = {
  id: revisedFile.id,
  expectedUpdated: null,
  action: 'comparison',
  fromId: fresh.id,
  toId: revisedFile.id,
  items: outs.map(() => ({
    firstRef: 'Sayfa 1; ilk yaklaşım',
    lastRef: 'Sayfa 2; yenilenen dayanak',
    change: 'Yeni kaynağa göre karar düzeltildi',
  })),
  remaining: 'Varsayım yeni örnekte sınanacak',
};
assert.equal((await req('reviewer', 'file-workspace', comparisonNote)).status, 403);
assert.equal((await req('candidate', 'file-workspace', { ...comparisonNote, fromId: first.id })).status, 400);
assert.equal((await req('candidate', 'file-workspace', comparisonNote)).status, 200);
assert.equal((await req('candidate', 'file-workspace', comparisonNote)).status, 409);
fw = await req('candidate', 'file-workspace&id=' + revisedFile.id);
const interviewNote = {
  id: revisedFile.id,
  expectedUpdated: fw.updated,
  action: 'interview',
  outputs: outs.map(() => ({
    answer: 'Kurgusal dosyadaki kendi kararım',
    reference: 'Sayfa 2 / karar bölümü',
  })),
  remaining: 'Etki henüz sahada sınanmadı',
};
assert.equal((await req('candidate', 'file-workspace', interviewNote)).status, 200);
fw = await req('candidate', 'file-workspace&id=' + revisedFile.id);
assert(fw.notes.comparison);
assert.equal(fw.notes.interview.outputs.length, outs.length);
assert.notEqual(fw.updated, interviewNote.expectedUpdated);
assert((await req('candidate', 'export')).fileNotes.some(n => n.submission_id === revisedFile.id));
assert.equal((await req('other', 'export')).fileNotes.length, 0);
for (const viewer of ['reviewer', 'admin']) {
  const visible = await req(viewer, 'file-workspace&id=' + revisedFile.id);
  assert.equal(visible.status, 200);
  assert.equal(visible.own, false);
  assert.deepEqual(visible.notes, {});
  assert.equal(visible.updated, null);
  assert.equal(visible.chain.length, 2);
}
const newest = await submit('candidate', 'kpi-paradoksu', revisedFile.id, 'Ek kontrol');
assert.equal(newest.status, 201);
assert.equal(
  (await req('candidate', 'file-workspace', { ...interviewNote, expectedUpdated: fw.updated })).status,
  409
);
assert.equal((await req('candidate', 'file-workspace&id=' + revisedFile.id)).current, false);
await req('admin', 'role', { id: 'reviewer', role: 'candidate' });
assert.equal((await req('reviewer', 'file-workspace&id=' + revisedFile.id)).status, 403);
console.log(
  'PASS: file-only learning cycle, source gating, draft privacy, stale write rejection, immutable first file, revision and defense gating, transfer timing, plan integration, metrics authorization and idempotent mobile retry.'
);
