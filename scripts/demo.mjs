import { createServer } from 'node:http';
import { randomUUID } from 'node:crypto';
import { readFile, readdir } from 'node:fs/promises';
import { Readable } from 'node:stream';
import { DatabaseSync } from 'node:sqlite';
import { extname, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { handlePilot } from '../server/pilot-service.mjs';

const host = '127.0.0.1';
const port = Number(process.env.ADAY_DEMO_PORT || 5173);
if (!Number.isInteger(port) || port < 1024 || port > 65535) throw Error('Geçersiz demo portu.');
const origin = 'http://' + host + ':' + port;
const web = fileURLToPath(new URL('../web/', import.meta.url)).replace(/[\\/]$/, '');
const migrations = new URL('../drizzle/', import.meta.url);
const database = new DatabaseSync(':memory:');
for (const name of (await readdir(migrations)).filter(name => name.endsWith('.sql')).sort()) {
  database.exec(await readFile(new URL(name, migrations), 'utf8'));
}

const actors = {
  candidate: { id: 'demo-candidate', email: 'candidate@example.test', label: 'Aday' },
  reviewer: { id: 'demo-reviewer', email: 'reviewer@example.test', label: 'İK değerlendiricisi' },
  admin: { id: 'demo-admin', email: 'admin@example.test', label: 'Pilot yöneticisi' },
};
const insertMember = database.prepare('INSERT INTO pilot_members(id,email,role,created) VALUES (?,?,?,?)');
for (const [role, actor] of Object.entries(actors)) {
  insertMember.run(actor.id, actor.email, role, new Date().toISOString());
}
const sessions = new Map();
const files = new Map();
const env = {
  DB: {
    prepare(sql) {
      const stmt = database.prepare(sql);
      let args = [];
      return {
        bind(...values) {
          args = values;
          return this;
        },
        async first() {
          return stmt.get(...args) ?? null;
        },
        async all() {
          return { results: stmt.all(...args) };
        },
        async run() {
          return { meta: { changes: Number(stmt.run(...args).changes) } };
        },
      };
    },
  },
  BUCKET: {
    async put(key, bytes) {
      files.set(key, bytes);
    },
    async get(key) {
      return files.has(key) ? { body: files.get(key) } : null;
    },
    async delete(key) {
      files.delete(key);
    },
  },
};
const mime = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json',
  '.csv': 'text/csv; charset=utf-8',
  '.md': 'text/plain; charset=utf-8',
  '.pdf': 'application/pdf',
  '.zip': 'application/zip',
  '.svg': 'image/svg+xml',
  '.webmanifest': 'application/manifest+json',
  '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
};
const toPilot = '/workspace.html#pilot';
const redirect = (location, cookie) =>
  new Response(null, {
    status: 303,
    headers: { Location: location, ...(cookie ? { 'Set-Cookie': cookie } : {}) },
  });
const signIn =
  '<!doctype html><html lang="tr"><meta charset="utf-8"><title>Yerel demo girişi</title><link rel="stylesheet" href="/style.css"><main class="card" style="max-width:640px;margin:3rem auto;padding:2rem"><h1>Yerel demo</h1><p>Denemek istediğin örnek rolü seç. Sunucu kayıtları bellekte tutulur ve yeniden başlatıldığında silinir.</p><form method="post">' +
  Object.entries(actors)
    .map(
      ([key, actor]) => '<button class="btn" name="role" value="' + key + '">' + actor.label + '</button> '
    )
    .join('') +
  '</form><p><a href="/workspace.html">Hazırlık alanına dön</a></p></main></html>';

async function dispatch(request, url) {
  const session = (request.headers.cookie || '').match(/(?:^|;\s*)aa_demo_session=([\w-]+)/)?.[1];
  if (url.pathname === '/signin-with-chatgpt') {
    if (request.method === 'GET') return new Response(signIn, { headers: { 'Content-Type': mime['.html'] } });
    if (request.method !== 'POST' || request.headers.origin !== origin)
      return new Response('Geçersiz istek', { status: 403 });
    if (Number(request.headers['content-length']) > 128)
      return new Response('Geçersiz istek', { status: 413 });
    let input = '';
    for await (const chunk of request) {
      input += chunk;
      if (input.length > 128) return new Response('Geçersiz istek', { status: 413 });
    }
    const actor = actors[new URLSearchParams(input).get('role')];
    if (!actor?.id) return new Response('Rol bulunamadı', { status: 400 });
    sessions.delete(session);
    const id = randomUUID();
    sessions.set(id, actor);
    return redirect(toPilot, 'aa_demo_session=' + id + '; Path=/; HttpOnly; SameSite=Strict');
  }
  if (url.pathname === '/signout-with-chatgpt') {
    sessions.delete(session);
    return redirect(toPilot, 'aa_demo_session=; Path=/; Max-Age=0; HttpOnly; SameSite=Strict');
  }
  if (url.pathname === '/api/pilot') {
    const actor = sessions.get(session);
    const headers = new Headers();
    for (const name of ['origin', 'content-type', 'content-length']) {
      if (request.headers[name]) headers.set(name, request.headers[name]);
    }
    if (actor) {
      headers.set('oai-authenticated-user-id', actor.id);
      headers.set('oai-authenticated-user-email', actor.email);
    }
    const hasBody = !['GET', 'HEAD'].includes(request.method);
    return handlePilot(
      new Request(url, {
        method: request.method,
        headers,
        ...(hasBody ? { body: Readable.toWeb(request), duplex: 'half' } : {}),
      }),
      env
    );
  }
  if (!['GET', 'HEAD'].includes(request.method))
    return new Response('Yöntem desteklenmiyor', { status: 405 });
  let pathname = decodeURIComponent(url.pathname);
  if (pathname === '/' || pathname === '/workspace.html') pathname = '/index.html';
  if (pathname.includes('\\') || pathname.includes('\0'))
    return new Response('Geçersiz dosya', { status: 400 });
  const path = resolve(web, '.' + pathname);
  if (!path.startsWith(web + sep) || !mime[extname(path)]) return new Response('Bulunamadı', { status: 404 });
  let body;
  try {
    body = await readFile(path);
  } catch {
    return new Response('Bulunamadı', { status: 404 });
  }
  if (pathname === '/index.html') {
    body = body.toString('utf8').replace('</head>', '<script>window.AA_LOCAL_DEMO=true</script></head>');
  }
  return new Response(request.method === 'HEAD' ? null : body, {
    headers: { 'Content-Type': mime[extname(path)] },
  });
}

createServer(async (request, response) => {
  try {
    const url = new URL(request.url, origin);
    const result =
      request.headers.host === host + ':' + port && url.origin === origin
        ? await dispatch(request, url)
        : new Response('Yerel demo adresini kullan', { status: 403 });
    response.writeHead(result.status, {
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
      ...Object.fromEntries(result.headers),
    });
    if (result.body) Readable.fromWeb(result.body).pipe(response);
    else response.end();
  } catch {
    if (!response.headersSent) response.writeHead(500);
    response.end('Yerel demo isteği tamamlanamadı.');
  }
}).listen(port, host, () => console.log('Aday Atölyesi yerel demo: ' + origin));
