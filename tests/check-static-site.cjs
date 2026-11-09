// GitHub Pages gibi alt klasörde statik yayın: yol çözümü ve pilot API'nin ağ kullanmadan kapalı yanıt vermesi.
const fs = require('node:fs'),
  vm = require('node:vm'),
  assert = require('node:assert/strict');
const code = fs.readFileSync('web/site-base.js', 'utf8');
function load(href, scriptSrc) {
  const calls = [];
  const loc = new URL(href);
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
  return { win, calls };
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
  const pages = load(
    'https://ysfdurak.github.io/aday_atolyesi/web/modules/zihin/index.html',
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
  assert(fs.existsSync('.nojekyll') && fs.readFileSync('index.html', 'utf8').includes('url=web/'));
  console.log(
    'PASS: kök ve alt klasör yol çözümü, statik modda ağsız pilot yanıtı, modül yolları ve Pages girişi.'
  );
})().catch(err => {
  console.error(err);
  process.exit(1);
});
