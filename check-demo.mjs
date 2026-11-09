import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { randomInt } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { createInterface } from 'node:readline';

const port = randomInt(16000, 45000);
const base = 'http://127.0.0.1:' + port;
const child = spawn(process.execPath, ['scripts/demo.mjs'], {
  env: { ...process.env, ADAY_DEMO_PORT: String(port) }, stdio: ['ignore', 'pipe', 'inherit'],
});
try {
  const lines = createInterface({ input: child.stdout });
  const timer = setTimeout(() => child.kill(), 5000);
  try {
    let ready = false;
    for await (const line of lines) {
      if (line.includes(base)) { ready = true; break; }
    }
    assert(ready, 'Yerel demo başlatılamadı.');
  } finally { clearTimeout(timer); lines.close(); }

  assert.match(await (await fetch(base)).text(), /AA_LOCAL_DEMO=true/);
  const forged = await fetch(base + '/api/pilot?op=me', {
    headers: { 'oai-authenticated-user-id': 'demo-admin', 'oai-authenticated-user-email': 'admin@example.test' },
  });
  assert.equal(forged.status, 401);
  async function signIn(role) {
    const res = await fetch(base + '/signin-with-chatgpt', {
      method: 'POST', redirect: 'manual', headers: { origin: base }, body: new URLSearchParams({ role }),
    });
    assert.equal(res.status, 303);
    return res.headers.get('set-cookie').split(';')[0];
  }
  const candidate = await signIn('candidate'), reviewer = await signIn('reviewer'), admin = await signIn('admin');
  const api = (cookie, op, body) => fetch(base + '/api/pilot?op=' + op, {
    method: body ? 'POST' : 'GET', headers: { cookie, origin: base }, body: body ? JSON.stringify(body) : undefined,
  });
  const me = await (await api(candidate, 'me')).json();
  assert.equal(me.user.role, 'candidate');
  const c = me.cases[0];
  const params = new URLSearchParams({ op: 'submit', case: c.id, version: c.version, name: 'calisma.docx', confirmed: 'yes' });
  const bytes = readFileSync('web' + c.wordFile);
  const result = await fetch(base + '/api/pilot?' + params, {
    method: 'POST', headers: { cookie: candidate, origin: base }, body: bytes,
  });
  assert.equal(result.status, 201);
  const { id } = await result.json();
  assert.equal((await api(reviewer, 'file&id=' + id)).status, 404);
  assert.equal((await api(admin, 'assign', { id, reviewer: 'demo-reviewer' })).status, 200);
  const download = await api(reviewer, 'file&id=' + id);
  assert.equal(download.status, 200);
  assert.deepEqual(Buffer.from(await download.arrayBuffer()), bytes);
  const feedback = { id, summary: 'Demo incelemesi',
    items: c.outputs.map(() => ({ observation: 'Hesap görüldü', evidence: 'Sayfa 1', next: 'Varsayımı yaz' })) };
  assert.equal((await api(reviewer, 'reviewdraft', feedback)).status, 200);
  assert.equal((await api(candidate, 'reviewdraft&id=' + id)).status, 403);
  assert.equal((await api(reviewer, 'review', feedback)).status, 201);
  const { rows } = await (await api(candidate, 'my-feedback')).json();
  assert.equal(rows[0].feedback.summary, 'Demo incelemesi');
  console.log('PASS: HTTP demo, three role sessions, upload, assignment, exact download, private draft and published review.');
} finally {
  child.kill();
}
