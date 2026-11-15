import handler from 'vinext/server/fetch-handler';
import { runWithConnectorBinding } from '../lib/connector-context';
import type { ConnectorBinding } from '../lib/connector-contract.mjs';
import {
  isVitrin,
  handleAuth,
  withSessionIdentity,
  ensureSchema,
  ensureSeeded,
  resetVitrin,
  VITRIN_MAX_UPLOAD,
} from '../server/vitrin.mjs';

type Env = Cloudflare.Env & { AA_VITRIN?: string; DB: D1Database; BUCKET: R2Bucket };

// Statik dosyalar (arayüz, vakalar, modüller) Cloudflare'in dosya katmanından Worker çalışmadan sunulur.
// Worker'a yalnız bu yollar gelir; diğer her şey (ör. botların .env, config.php, dump.sql taramaları)
// uygulama çalıştırılmadan hızlıca 404 alır. Bu hem işlemci süresini hem hata kayıtlarını azaltır.
const APP_PATHS = new Set(['/', '/api/pilot', '/signin-with-chatgpt', '/signout-with-chatgpt']);
const notFound = () =>
  new Response('Bulunamadı', {
    status: 404,
    headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'public, max-age=3600' },
  });

// Canlı vitrin (AA_VITRIN=1): rolle şifresiz giriş, kimlik yalnız çerezden, ilk istekte tablo kurulumu
// ve örnek veri, yükleme sınırı. Vitrin kapalıysa istekler olduğu gibi uygulamaya gider.
async function vitrin(request: Request, env: Env, ctx: ExecutionContext): Promise<Request | Response> {
  const url = new URL(request.url);
  const auth = await handleAuth(request);
  if (auth) return auth;
  if (url.pathname !== '/api/pilot') return request;
  try {
    await ensureSchema(env.DB);
    ctx.waitUntil(ensureSeeded(env).catch((err: unknown) => console.error('vitrin seed', err)));
  } catch (err) {
    console.error('vitrin schema', err);
    return Response.json({ error: 'Veritabanı hazırlanıyor. Biraz sonra tekrar dene.' }, { status: 503 });
  }
  if (url.searchParams.get('op') === 'submit') {
    const size = Number(request.headers.get('content-length') || 0);
    if (size > VITRIN_MAX_UPLOAD)
      return Response.json({ error: 'Canlı demoda dosya sınırı 3 MB.' }, { status: 413 });
  }
  return withSessionIdentity(request);
}

const worker = {
  async fetch(request: Request, env: Env, ctx: ExecutionContext<{ CONNECTORS?: ConnectorBinding }>) {
    const { pathname } = new URL(request.url);
    if (!import.meta.env.DEV && !APP_PATHS.has(pathname) && !pathname.startsWith('/_next/'))
      return notFound();
    if (isVitrin(env)) {
      const next = await vitrin(request, env, ctx);
      if (next instanceof Response) return next;
      request = next;
    }
    let binding = ctx.props?.CONNECTORS;
    // Local preview emulates the same request-scoped capability. This branch and
    // the auxiliary service binding are absent from production builds.
    if (import.meta.env.DEV && !binding && env.CONNECTORS) {
      const preview = env.CONNECTORS;
      const expiresAt = Date.now() + 60_000;
      binding = {
        async getContext() {
          if (Date.now() >= expiresAt) return { status: 'request_context_expired' };
          return preview.getContext?.() ?? { status: 'binding_unavailable' };
        },
        async invoke(connectorId, actionName, args) {
          if (Date.now() >= expiresAt) {
            return {
              status: 'request_context_expired',
              message: 'This request has expired. Please try again.',
            };
          }
          return preview.invoke(connectorId, actionName, args);
        },
      };
    }
    return runWithConnectorBinding(binding, () => handler.fetch(request, env, ctx));
  },
  // Zamanlanmış görev (wrangler.jsonc → triggers.crons): vitrinde her gece kayıtları ve dosyaları sıfırlar.
  async scheduled(_event: ScheduledController, env: Env, ctx: ExecutionContext) {
    if (!isVitrin(env)) return;
    ctx.waitUntil(resetVitrin(env));
  },
};

export default worker;
