(function (root) {
  'use strict';
  let snapshot = null,
    status = 'loading',
    pending = null,
    checked = 0;
  async function refresh(force = false) {
    if (pending) return pending;
    if (!force && Date.now() - checked < 30000) return;
    pending = (async () => {
      const ctrl = new AbortController(),
        timer = setTimeout(() => ctrl.abort(), 12000);
      try {
        const r = await fetch('/api/pilot?op=progress', { signal: ctrl.signal });
        if (r.status === 401) {
          snapshot = null;
          status = 'guest';
          return;
        }
        if (!r.ok) throw Error('unavailable');
        const data = await r.json();
        if (data.guest) {
          snapshot = null;
          status = 'guest';
          return;
        }
        snapshot = data;
        status = 'ready';
      } catch {
        status = 'offline';
      } finally {
        clearTimeout(timer);
        checked = Date.now();
        pending = null;
        root.dispatchEvent(new Event('pilot-progress'));
      }
    })();
    return pending;
  }
  function phase(id, version) {
    const c = snapshot?.cases.find(c => c.caseId === id && c.version === version);
    return c ? { ...c, id: c.phase } : null;
  }
  function label() {
    return status === 'ready'
      ? 'Dosya teslimleri güncel · çalışma kaydı bu cihazda'
      : status === 'offline'
        ? 'Hesap bağlantısı kesildi · dosya durumu güncel olmayabilir'
        : status === 'loading'
          ? 'Hesap kontrol ediliyor · çalışma kaydı bu cihazda'
          : 'Çalışma kaydı bu cihazda';
  }
  root.addEventListener('visibilitychange', () => {
    if (!document.hidden) refresh();
  });
  setInterval(() => {
    if (!document.hidden) refresh();
  }, 30000);
  root.PilotProgress = { refresh, phase, label, rows: () => snapshot?.cases || [], status: () => status };
})(window);
