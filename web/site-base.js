// Uygulamanın hangi adres altında yayımlandığını belirler ve statik demo modunu açar.
// - Yerel demo ve Worker kurulumunda uygulama sitenin kökündedir; bu dosya hiçbir şeyi değiştirmez.
// - GitHub Pages gibi bir alt klasörde (ör. /aday_atolyesi/web/) yayımlandığında kökten başlayan
//   bağlantıları ve istekleri o klasöre yönlendirir.
// - Statik barındırmada sunucu olmadığı için hesap, dosya teslimi ve İK değerlendirmesi kapalıdır
//   (window.AA_STATIC). Pilot API isteklerine ağ kullanılmadan "kapalı" yanıtı döner.
(function (root) {
  'use strict';
  const script = document.currentScript;
  const base = new URL('.', script ? script.src : location.href).href; // her zaman web köküdür
  const params = new URLSearchParams(location.search);
  const isStatic =
    params.get('static') === '1' ||
    /\.github\.io$/i.test(location.hostname) ||
    script?.dataset.static === 'true';
  root.AA_BASE = base;
  root.AA_STATIC = isStatic;
  /** Kökten başlayan uygulama yolunu ('/modules/...') yayımlandığı klasöre göre çözer. */
  root.AA_URL = path =>
    typeof path === 'string' && path.startsWith('/') && !path.startsWith('//')
      ? new URL(path.slice(1), base).href
      : path;
  const atRoot = new URL(base).pathname === '/';

  if (isStatic) {
    const nativeFetch = root.fetch.bind(root);
    root.fetch = (input, init) => {
      const url = typeof input === 'string' ? input : input?.url || '';
      if (/^\/?api\/pilot\b/.test(url.replace(location.origin, '')) || url.includes('/api/pilot'))
        return Promise.resolve(
          new Response(
            JSON.stringify({
              static: true,
              error: 'Bu statik demoda hesap, dosya teslimi ve İK değerlendirmesi kapalı.',
            }),
            { status: 503, headers: { 'Content-Type': 'application/json' } }
          )
        );
      return nativeFetch(typeof input === 'string' ? root.AA_URL(input) : input, init);
    };
  }
  if (atRoot) return;

  // Alt klasörde yayın: kökten başlayan bağlantıları yeniden yaz.
  const fix = el => {
    for (const attr of ['href', 'src']) {
      const v = el.getAttribute?.(attr);
      if (v && v.startsWith('/') && !v.startsWith('//')) el.setAttribute(attr, root.AA_URL(v));
    }
  };
  const sweep = node => {
    if (node.nodeType !== 1) return;
    if (node.matches('a[href^="/"],img[src^="/"],iframe[src^="/"],script[src^="/"]')) fix(node);
    node.querySelectorAll?.('a[href^="/"],img[src^="/"],iframe[src^="/"]').forEach(fix);
  };
  new MutationObserver(list =>
    list.forEach(m => (m.type === 'attributes' ? fix(m.target) : m.addedNodes.forEach(sweep)))
  ).observe(document.documentElement, {
    subtree: true,
    childList: true,
    attributes: true,
    attributeFilter: ['href', 'src'],
  });
  // Gözlemciden önce oluşmuş bir bağlantıya tıklanırsa son anda düzelt.
  document.addEventListener(
    'click',
    ev => {
      const a = ev.target.closest?.('a[href^="/"]');
      if (a) fix(a);
    },
    true
  );
  if (!isStatic) {
    const nativeFetch = root.fetch.bind(root);
    root.fetch = (input, init) => nativeFetch(typeof input === 'string' ? root.AA_URL(input) : input, init);
  }
})(window);
