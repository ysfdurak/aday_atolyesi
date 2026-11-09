import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { readFileSync, readdirSync } from 'node:fs';
import { handlePilot, validateFile } from '../server/pilot-service.mjs';
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
const request = async (user, op, body, method = 'GET') => {
  const headers = {};
  if (user) {
    headers['oai-authenticated-user-id'] = user;
    headers['oai-authenticated-user-email'] =
      user === 'admin' ? 'pilot-admin@example.test' : user + '@example.test';
  }
  if (method !== 'GET') headers.origin = 'https://pilot.test';
  if (body) headers['Content-Type'] = 'application/json';
  return handlePilot(
    new Request('https://pilot.test/api/pilot?op=' + op, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    }),
    env
  );
};
let r = await request(null, 'me');
assert.equal(r.status, 401);
for (const user of ['admin', 'a', 'b', 'reviewer']) assert.equal((await request(user, 'me')).status, 200);
assert.equal((await request('a', 'members')).status, 403);
const blank = {
  schema: 'aday-atolyesi-backup-v1',
  values: {
    'aa-state-v1': JSON.stringify({ schema: 1, examples: [], checks: {}, cv: { text: 'PRIVATE CV' } }),
  },
};
r = await request('a', 'save', { revision: 0, payload: blank }, 'PUT');
assert.equal(r.status, 200);
assert.equal((await request('a', 'save', { revision: 0, payload: blank }, 'PUT')).status, 409);
assert.equal((await (await request('b', 'save')).json()).payload, null);
assert.deepEqual(
  JSON.parse((await (await request('a', 'save')).json()).payload.values['aa-state-v1']).cv,
  {}
);
assert.equal(
  (
    await handlePilot(
      new Request('https://pilot.test/api/pilot?op=save', {
        method: 'PUT',
        headers: {
          origin: 'https://evil.test',
          'oai-authenticated-user-id': 'a',
          'oai-authenticated-user-email': 'a@example.test',
        },
        body: '{}',
      }),
      env
    )
  ).status,
  403
);
const pdf = new TextEncoder().encode('%PDF-1.4\n1 0 obj\n<<>>\nendobj\n%%EOF\n');
assert.throws(() => validateFile(pdf, 'answer.exe'));
assert.throws(() => validateFile(new Uint8Array(100), 'answer.docx'));
assert.throws(() => validateFile(new TextEncoder().encode('%PDF-1.4\n/Encrypt 1 0 R\n%%EOF'), 'answer.pdf'));
const catalog = JSON.parse(readFileSync('server/pilot-catalog.json'));
for (const c of catalog) {
  assert(!('solution' in c));
  for (const ext of ['docx', 'xlsx'])
    assert(validateFile(readFileSync(`web/cases/office/${c.id}-calisma.${ext}`), 'answer.' + ext));
}
const submit = async (user, extra = '') =>
  handlePilot(
    new Request(
      'https://pilot.test/api/pilot?op=submit&case=kpi-paradoksu&version=3.0.0&name=answer.pdf&confirmed=yes' +
        extra,
      {
        method: 'POST',
        headers: {
          origin: 'https://pilot.test',
          'oai-authenticated-user-id': user,
          'oai-authenticated-user-email': user + '@example.test',
        },
        body: pdf,
      }
    ),
    env
  );
r = await submit('a');
assert.equal(r.status, 201);
const id = (await r.json()).id;
assert.equal((await request('b', 'file&id=' + id)).status, 404);
assert.equal((await (await request('b', 'submissions')).json()).length, 0);
assert.equal((await request('a', 'file&id=' + id)).status, 200);
assert.equal((await request('a', 'assign', { id, reviewer: 'reviewer' }, 'POST')).status, 403);
assert.equal((await request('admin', 'role', { id: 'reviewer', role: 'reviewer' }, 'POST')).status, 200);
assert.equal((await request('admin', 'assign', { id, reviewer: 'reviewer' }, 'POST')).status, 200);
assert.equal((await request('reviewer', 'file&id=' + id)).status, 200);
const feedback = {
  id,
  summary: 'Gelişim geri bildirimi',
  items: catalog[0].outputs.map(() => ({
    observation: 'Gözlem',
    evidence: 'Sayfa 1: kısa alıntı',
    next: 'Bir sonraki adım',
  })),
};
assert.equal((await request('b', 'review', feedback, 'POST')).status, 403);
assert.equal((await request('reviewer', 'review', feedback, 'POST')).status, 201);
assert.equal((await request('reviewer', 'review', feedback, 'POST')).status, 409);
assert.equal((await request('admin', 'assign', { id, reviewer: 'admin' }, 'POST')).status, 400);
assert((await (await request('a', 'submissions')).json())[0].feedback);
assert.equal((await request('admin', 'role', { id: 'reviewer', role: 'candidate' }, 'POST')).status, 200);
assert.equal((await request('reviewer', 'file&id=' + id)).status, 404);
assert.equal((await (await request('reviewer', 'submissions')).json()).length, 0);
assert.equal((await submit('a', '&parent=' + id)).status, 400);
assert.equal((await submit('b', '&parent=' + id + '&note=change')).status, 400);
assert.equal((await submit('a', '&parent=' + id + '&note=New%20analysis')).status, 201);
for (let i = 2; i < 100; i++) assert.equal((await submit('a')).status, 201);
assert.equal((await submit('a')).status, 429);
assert.equal(objects.size, 100);
console.log(
  'PASS: identity, owner/reviewer/candidate isolation, role revocation, optimistic save conflicts, CV exclusion, 40 Office files, PDF/Office format rejection, file authorization, immutable feedback, revisions and quota.'
);
