import { Miniflare, Log, LogLevel } from 'miniflare';
import { build } from 'esbuild';
import { readFileSync, readdirSync } from 'node:fs';
import assert from 'node:assert/strict';
const compiled = await build({
  stdin: {
    contents:
      "import{handlePilot,validateFile}from './pilot-service.mjs';export default{async fetch(r,e){if(new URL(r.url).pathname==='/debug'){try{return Response.json({mime:validateFile(new Uint8Array(await r.arrayBuffer()),new URL(r.url).searchParams.get('name')||'answer.docx')})}catch(err){return Response.json({error:String(err),stack:err.stack})}}return handlePilot(r,e)}}",
    resolveDir: process.cwd(),
  },
  bundle: true,
  write: false,
  format: 'esm',
  platform: 'neutral',
  external: ['node:zlib'],
});
const mf = new Miniflare({
  modules: true,
  script: compiled.outputFiles[0].text,
  compatibilityDate: '2026-05-15',
  compatibilityFlags: ['nodejs_compat'],
  bindings: { PILOT_OWNER_EMAIL: 'pilot-admin@example.test' },
  d1Databases: ['DB'],
  r2Buckets: ['BUCKET'],
  log: new Log(LogLevel.ERROR),
});
try {
  const db = await mf.getD1Database('DB');
  for (const f of readdirSync('drizzle')
    .filter(f => f.endsWith('.sql'))
    .sort())
    for (const sql of readFileSync('drizzle/' + f, 'utf8')
      .split('--> statement-breakpoint')
      .filter(s => s.trim()))
      await db.prepare(sql).run();
  const headers = u => ({
    'oai-authenticated-user-id': u,
    'oai-authenticated-user-email': u === 'owner' ? 'pilot-admin@example.test' : u + '@example.test',
    origin: 'http://test.local',
  });
  const call = (u, op, b, method = b ? 'POST' : 'GET') =>
    mf.dispatchFetch('http://test.local/api/pilot?op=' + op, {
      method,
      headers: headers(u),
      body: b ? JSON.stringify(b) : undefined,
    });
  for (const u of ['owner', 'a', 'b', 'reviewer']) assert.equal((await call(u, 'me')).status, 200);
  assert.equal((await call('owner', 'role', { id: 'reviewer', role: 'reviewer' })).status, 200);
  const request = crypto.randomUUID(),
    params = new URLSearchParams({
      op: 'submit',
      case: 'kpi-paradoksu',
      version: '3.0.0',
      name: 'answer.docx',
      confirmed: 'yes',
      request,
    });
  const file = readFileSync('web/cases/office/kpi-paradoksu-calisma.docx');
  for (const name of readdirSync('web/cases/office')) {
    const test = await mf.dispatchFetch('http://test.local/debug?name=' + encodeURIComponent(name), {
      method: 'POST',
      body: readFileSync('web/cases/office/' + name),
    });
    const result = await test.json();
    assert(result.mime, name + ': ' + result.error);
  }
  const upload = () =>
    mf.dispatchFetch('http://test.local/api/pilot?' + params, {
      method: 'POST',
      headers: headers('a'),
      body: file,
    });
  const r = await upload();
  assert.equal(r.status, 201, await r.clone().text());
  const id = (await r.json()).id;
  assert.equal((await (await upload()).json()).id, id);
  assert.equal((await call('b', 'file&id=' + id)).status, 404);
  const downloaded = await call('a', 'file&id=' + id);
  assert.equal(downloaded.status, 200);
  assert.deepEqual(Buffer.from(await downloaded.arrayBuffer()), file);
  assert.equal((await call('owner', 'assign', { id, reviewer: 'reviewer' })).status, 200);
  const outputs = JSON.parse(readFileSync('pilot-catalog.json'))[0].outputs,
    feedback = {
      id,
      summary: 'Genel değerlendirme',
      items: outputs.map(() => ({ observation: 'Gözlem', evidence: 'Sayfa 1', next: 'Sonraki adım' })),
    };
  assert.equal((await call('reviewer', 'reviewdraft', feedback)).status, 200);
  assert.equal((await call('a', 'reviewdraft&id=' + id)).status, 403);
  assert.equal((await call('reviewer', 'review', feedback)).status, 201);
  const learning = await (await call('a', 'learning&case=kpi-paradoksu&version=3.0.0')).json();
  assert.equal(learning.state.phase, 'practice');
  assert.equal(
    (
      await call('a', 'learning', {
        case: 'kpi-paradoksu',
        version: '3.0.0',
        revision: 0,
        rootId: id,
        latestId: id,
        action: 'practice',
        index: 0,
        answer: 'Kendi yanıtım',
      })
    ).status,
    200
  );
  const backup = {
    schema: 'aday-atolyesi-backup-v1',
    values: {
      'aa-state-v1': JSON.stringify({ schema: 1, examples: [], checks: {}, cv: { text: 'Not sent' } }),
    },
  };
  assert.equal((await call('a', 'save', { revision: 0, payload: backup }, 'PUT')).status, 200);
  assert.equal((await call('a', 'save', { revision: 0, payload: backup }, 'PUT')).status, 409);
  assert.equal((await (await call('b', 'save')).json()).payload, null);
  assert.equal((await call('owner', 'role', { id: 'reviewer', role: 'candidate' })).status, 200);
  assert.equal((await call('reviewer', 'file&id=' + id)).status, 404);
  const feedbackInput = {
    ease: 4,
    repeat: 'yes',
    useful: 'Geri bildirim',
    difficulty: 'Dosya seçimi',
    suggestion: 'Mobil erişim',
  };
  assert.equal((await call('a', 'pilotfeedback', feedbackInput)).status, 200);
  assert.equal((await (await call('b', 'pilotfeedback')).json()).feedback, null);
  assert.equal((await call('b', 'pilotfeedback-all')).status, 403);
  assert.equal((await (await call('owner', 'pilotfeedback-all')).json()).length, 1);
  const exported = await (await call('a', 'export')).json();
  assert.equal(exported.submissions.length, 1);
  assert(exported.pilotFeedback);
  assert.deepEqual(JSON.parse(exported.preparation.payload.values['aa-state-v1']).cv, {});
  const concurrentParams = new URLSearchParams({
    op: 'submit',
    case: 'kpi-paradoksu',
    version: '3.0.0',
    name: 'parallel.docx',
    confirmed: 'yes',
    request: crypto.randomUUID(),
  });
  const simultaneous = await Promise.all(
    [1, 2].map(() =>
      mf.dispatchFetch('http://test.local/api/pilot?' + concurrentParams, {
        method: 'POST',
        headers: headers('b'),
        body: file,
      })
    )
  );
  for (const result of simultaneous) assert([200, 201].includes(result.status), await result.clone().text());
  const receipts = await Promise.all(simultaneous.map(r => r.json()));
  assert.equal(receipts[0].id, receipts[1].id);
  const roundTrip = await call('b', 'file&id=' + receipts[0].id);
  assert.deepEqual(Buffer.from(await roundTrip.arrayBuffer()), file);
  const bucket = await mf.getR2Bucket('BUCKET');
  assert.equal((await bucket.list()).objects.length, 2);
  const workspace = await (await call('a', 'file-workspace&id=' + id)).json();
  assert(workspace.own && workspace.current);
  assert.equal(workspace.chain.length, 1);
  assert.equal((await call('b', 'file-workspace&id=' + id)).status, 403);
  const note = {
    id,
    expectedUpdated: null,
    action: 'interview',
    outputs: outputs.map(() => ({ answer: 'Kendi dosya özetim', reference: 'Sayfa 1' })),
    remaining: 'Saha doğrulaması açık',
  };
  const writes = await Promise.all([call('a', 'file-workspace', note), call('a', 'file-workspace', note)]);
  assert.deepEqual(writes.map(r => r.status).sort(), [200, 409]);
  const workAfter = await (await call('a', 'file-workspace&id=' + id)).json();
  assert.equal(workAfter.notes.interview.outputs.length, outputs.length);
  assert.equal((await (await call('a', 'export')).json()).fileNotes.length, 1);
  assert.equal((await (await call('b', 'export')).json()).fileNotes.length, 0);
  console.log(
    'PASS: Worker runtime + real local D1/R2 bindings; Office upload/download bytes, repeated mobile request, candidate isolation, review drafts, review, learning, multi-device save conflicts and revoked reviewer access, 40 Office files, concurrent retry safety, private pilot feedback and account export.'
  );
} finally {
  await mf.dispose();
}
