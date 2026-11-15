// GitHub Pages adresi canlı demoya yönlenir; ?static=1 ile statik sürüm: yol çözümü ve pilot API'nin ağsız kapalı yanıtı.
const fs = require('node:fs'),
  vm = require('node:vm'),
  assert = require('node:assert/strict');
const code = fs.readFileSync('web/site-base.js', 'utf8');
function load(href, scriptSrc) {
  const calls = [];
  const loc = new URL(href);
  const redirects = [];
  loc.replace = url => redirects.push(url);
  const win = {
    fetch: async url => (calls.push(url), new Response('ok')),
  };
  const document = {
    currentScript: { src: scriptSrc, dataset: {} },
    documentElement: {},
    addEventListener() {},
  };
  const ctx = {
    window: win,
    document,
    location: loc,
    URL,
    URLSearchParams,
    Response,
    Promise,
    MutationObserver: class {
      observe() {}
    },
  };
  vm.runInNewContext(code, ctx);
  return { win, calls, redirects };
}
(async () => {
  // Kök kurulum (yerel demo, Worker): hiçbir şey değişmez.
  const root = load('http://127.0.0.1:5173/#plan', 'http://127.0.0.1:5173/site-base.js');
  assert.equal(root.win.AA_STATIC, false);
  assert.equal(
    root.win.AA_URL('/modules/zihin/index.html'),
    'http://127.0.0.1:5173/modules/zihin/index.html'
  );
  await root.win.fetch('/api/pilot?op=me');
  assert.deepEqual(root.calls, ['/api/pilot?op=me'], 'kökte istekler olduğu gibi gider');

  // GitHub Pages: alt klasör + statik mod.
  // Eski Pages adresi: aynı sayfaya canlı demoda devam edilir.
  const cases = [
    ['https://ysfdurak.github.io/aday_atolyesi/web/', 'https://aday.ysfdurak.com/workspace.html'],
    [
      'https://ysfdurak.github.io/aday_atolyesi/web/index.html#cases',
      'https://aday.ysfdurak.com/workspace.html#cases',
    ],
    [
      'https://ysfdurak.github.io/aday_atolyesi/web/modules/zihin/index.html#exam/graded',
      'https://aday.ysfdurak.com/modules/zihin/index.html#exam/graded',
    ],
  ];
  for (const [from, to] of cases) {
    const r = load(from, 'https://ysfdurak.github.io/aday_atolyesi/web/site-base.js');
    assert.deepEqual(r.redirects, [to]);
    assert.equal(r.win.AA_REDIRECTING, true);
  }
  const html = fs.readFileSync('index.html', 'utf8');
  assert(html.includes('https://aday.ysfdurak.com/workspace.html'), 'Pages girişi canlı demoya yönlenmeli');

  // ?static=1 ile statik sürüm hâlâ denenebilir.
  const pages = load(
    'https://ysfdurak.github.io/aday_atolyesi/web/modules/zihin/index.html?static=1',
    'https://ysfdurak.github.io/aday_atolyesi/web/site-base.js'
  );
  assert.equal(pages.win.AA_STATIC, true);
  assert.equal(pages.win.AA_BASE, 'https://ysfdurak.github.io/aday_atolyesi/web/');
  assert.equal(
    pages.win.AA_URL('/cases/office/kpi-paradoksu-calisma.docx'),
    'https://ysfdurak.github.io/aday_atolyesi/web/cases/office/kpi-paradoksu-calisma.docx'
  );
  assert.equal(pages.win.AA_URL('/#plan'), 'https://ysfdurak.github.io/aday_atolyesi/web/#plan');
  assert.equal(pages.win.AA_URL('https://example.test/x'), 'https://example.test/x');
  const r = await pages.win.fetch('/api/pilot?op=progress');
  assert.equal(r.status, 503);
  assert.equal((await r.json()).static, true);
  assert.equal(pages.calls.length, 0, 'statik modda pilot API için ağ isteği yapılmaz');
  await pages.win.fetch('/case-data.js');
  assert.deepEqual(pages.calls, ['https://ysfdurak.github.io/aday_atolyesi/web/case-data.js']);

  // Kök dışı ama statik olmayan kurulum: yalnız yol çözümü.
  const sub = load('https://ornek.test/aday/', 'https://ornek.test/aday/site-base.js');
  assert.equal(sub.win.AA_STATIC, false);
  await sub.win.fetch('/api/pilot?op=me');
  assert.deepEqual(sub.calls, ['https://ornek.test/aday/api/pilot?op=me']);

  // Modül sayfaları ortak dosyaları göreli yoldan yükler (kökten değil).
  for (const m of ['rol', 'mizac', 'zihin']) {
    const html = fs.readFileSync(`web/modules/${m}/index.html`, 'utf8');
    assert(!/src="\/(?!\/)/.test(html), m + ' modülünde kökten başlayan script yolu kalmamalı');
    assert(html.indexOf('../../site-base.js') < html.indexOf('../../position-context.js'));
  }
  assert(fs.existsSync('.nojekyll'));
  console.log(
    'PASS: Pages adresinin canlı demoya yönlenmesi, kök ve alt klasör yol çözümü, ?static=1 ile ağsız pilot yanıtı, modül yolları.'
  );
})().catch(err => {
  console.error(err);
  process.exit(1);
});
