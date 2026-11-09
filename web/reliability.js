(function (root) {
  'use strict';
  const arrayKeys = new Set(['rol-atolyesi-profile-events-v1']);
  const recordNames = {
    'aa-state-v1': 'Hazırlık alanı',
    'aa-position-v1': 'Hedef pozisyon',
    'zp-data-v1': 'Zihin Parkuru sonuçları',
    'zp-session-v1': 'Zihin Parkuru oturumu',
    'zp-previous-session': 'Önceki sınav oturumu',
    'mizac-v2': 'Mizaç yanıtları',
    'rol-atolyesi-v1': 'Rol Atölyesi yanıtları',
    'rol-atolyesi-profile-events-v1': 'Rol seçimi geçmişi',
  };
  const escape = v =>
    String(v).replace(
      /[&<>"']/g,
      c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]
    );
  function inspect(storage, keys) {
    const broken = [];
    for (const key of keys) {
      let raw;
      try {
        raw = storage.getItem(key);
      } catch {
        return { unavailable: true, broken: [] };
      }
      if (raw === null) continue;
      let v;
      try {
        v = JSON.parse(raw);
      } catch {
        broken.push({ key, raw, reason: 'Kayıt metni okunamıyor.' });
        continue;
      }
      // Role configuration events are deliberately an array; all other stored records are objects (or a cleared null session).
      if (arrayKeys.has(key)) {
        if (!Array.isArray(v)) broken.push({ key, raw, reason: 'Seçim geçmişi liste biçiminde değil.' });
        continue;
      }
      if (
        key === 'aa-state-v1' &&
        (!v ||
          v.schema !== 1 ||
          !Array.isArray(v.examples) ||
          !v.checks ||
          Array.isArray(v.checks) ||
          !v.cv ||
          Array.isArray(v.cv))
      ) {
        broken.push({ key, raw, reason: 'Hazırlık kaydının gerekli alanları eksik.' });
        continue;
      }
      if (v !== null && (typeof v !== 'object' || Array.isArray(v)))
        broken.push({ key, raw, reason: 'Bu kaydın beklenen biçimi bir kayıt nesnesi.' });
    }
    return { unavailable: false, broken };
  }

  function gate({ storage, keys, host, download, restore, retry }) {
    const r = inspect(storage, keys);
    if (!r.unavailable && !r.broken.length) return false;
    host.innerHTML =
      '<main class="narrow card" style="margin:8vh auto;padding:24px"><h1>Kayıtlarını önce koruyalım.</h1><p role="alert">' +
      (r.unavailable
        ? 'Bu tarayıcıda cihaz kayıtlarına erişilemiyor. Tarayıcı depolama iznini kontrol edip yeniden dene.'
        : 'Bir veya daha fazla cihaz kaydı okunamıyor. Üzerine boş kayıt yazılmadı. Önce ham kayıtlarını indir; sonra geçerli bir yedeği yükleyebilir veya yalnız okunamayan kayıtları sıfırlayabilirsin.') +
      '</p>' +
      (!r.unavailable
        ? '<ul>' +
          r.broken
            .map(
              x =>
                '<li><b>' +
                escape(recordNames[x.key] || 'Cihaz kaydı') +
                ':</b> ' +
                escape(x.reason) +
                '</li>'
            )
            .join('') +
          '</ul>'
        : '') +
      '<div class="actions">' +
      (!r.unavailable
        ? '<button id="recovery-export">Ham kayıtları indir</button><label class="btn">Geçerli yedek yükle<input id="recovery-import" type="file" accept="application/json" hidden></label><button id="recovery-reset">Yalnız okunamayan kayıtları sıfırla</button>'
        : '') +
      '<button id="recovery-retry">Tekrar kontrol et</button></div><p id="recovery-message" role="status"></p></main>';
    host.querySelector('#recovery-retry').onclick = retry;
    if (r.unavailable) return true;
    host.querySelector('#recovery-export').onclick = () =>
      download(
        'aday-atolyesi-ham-kurtarma.json',
        JSON.stringify(
          {
            schema: 'aday-atolyesi-raw-recovery-v1',
            at: new Date().toISOString(),
            note: 'Bu dosya ham kurtarma kaydıdır; normal yedek gibi içe alınmaz.',
            values: Object.fromEntries(
              keys.flatMap(k => {
                const raw = storage.getItem(k);
                return raw === null ? [] : [[k, raw]];
              })
            ),
          },
          null,
          2
        )
      );
    host.querySelector('#recovery-import').onchange = restore;
    host.querySelector('#recovery-reset').onclick = () => {
      if (
        !confirm(
          'Okunamayan kayıtlar silinecek. Ham kurtarma dosyanı indirdiğinden emin ol. Diğer kayıtlar korunur. Devam edilsin mi?'
        )
      )
        return;
      try {
        r.broken.forEach(x => storage.removeItem(x.key));
        retry();
      } catch {
        host.querySelector('#recovery-message').textContent =
          'Sıfırlanamadı. Tarayıcı depolama iznini kontrol et.';
      }
    };
    return true;
  }
  function sessionDraft(form, key, version = null) {
    let dirty = false;
    try {
      const d = JSON.parse(sessionStorage.getItem(key));
      if (d && d.version === version) {
        for (const [k, v] of Object.entries(d.values))
          if (form.elements[k] && form.elements[k].type !== 'file' && typeof v === 'string')
            form.elements[k].value = v;
        dirty = true;
      }
    } catch {}
    const status = document.createElement('p');
    status.setAttribute('role', 'status');
    status.className = 'muted';
    if (dirty) status.textContent = 'Bu sekmedeki taslağın açıldı. Hesap kaydı için ayrıca kaydet.';
    form.appendChild(status);
    form.addEventListener('input', () => {
      dirty = true;
      try {
        const values = Object.fromEntries([...new FormData(form)].filter(([, v]) => typeof v === 'string'));
        sessionStorage.setItem(key, JSON.stringify({ version, values }));
        status.textContent = 'Taslak bu sekmede korunuyor; kalıcı hesap kaydı için ayrıca kaydet.';
      } catch {
        status.textContent = 'Taslak korunamadı. Sayfadan ayrılmadan metnini kopyala.';
      }
    });
    return { dirty: () => dirty };
  }
  root.WorkspaceReliability = { inspect, gate, sessionDraft };
})(typeof window === 'undefined' ? globalThis : window);
