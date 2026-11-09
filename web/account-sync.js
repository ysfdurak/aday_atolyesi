// Hesaba otomatik kayıt (isteğe bağlı).
// Kullanıcı bir kez açtığında bu cihazdaki hazırlık kaydı, değiştiğinde hesaba gönderilir.
// Çakışma güvenliği: sunucudaki kayıt sürümü bu cihazın bildiği sürümden farklıysa
// (başka cihazda kayıt yapıldıysa) üzerine yazılmaz; otomatik kayıt durur ve kullanıcıya sorulur.
(function (root) {
  'use strict';
  const KEY = 'aa-autosync-v1',
    INTERVAL = 2 * 60 * 1000;
  let busy = false,
    lastError = '';

  function settings() {
    try {
      return JSON.parse(localStorage.getItem(KEY)) || { on: false };
    } catch {
      return { on: false };
    }
  }
  function store(next) {
    try {
      localStorage.setItem(KEY, JSON.stringify(next));
    } catch {
      /* depolama kapalıysa otomatik kayıt kullanılamaz */
    }
    root.dispatchEvent(new Event('account-sync'));
  }
  // Hesaba gönderilecek kayıt: CV metni hiçbir zaman gönderilmez.
  function payload() {
    const AA = root.AA;
    const values = Object.fromEntries(
      AA.keys.filter(k => localStorage.getItem(k) !== null).map(k => [k, localStorage.getItem(k)])
    );
    if (!values[AA.KEY]) values[AA.KEY] = JSON.stringify(AA.blank());
    const st = JSON.parse(values[AA.KEY]);
    st.cv = {};
    values[AA.KEY] = JSON.stringify(st);
    const out = { schema: 'aday-atolyesi-backup-v1', values };
    AA.validateBackup(out);
    return out;
  }
  function fingerprint(p) {
    // Küçük, kararlı bir özet: yalnız değişiklik olup olmadığını anlamak için.
    const s = JSON.stringify(p.values);
    let h = 2166136261;
    for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
    return (h >>> 0).toString(36) + ':' + s.length;
  }
  async function call(method, body) {
    const r = await fetch('/api/pilot?op=save', {
      method,
      credentials: 'same-origin',
      cache: 'no-store',
      headers: body ? { 'Content-Type': 'application/json' } : {},
      body: body ? JSON.stringify(body) : undefined,
    });
    const b = await r.json().catch(() => ({}));
    if (!r.ok) throw Object.assign(Error(b.error || 'Kayıt gönderilemedi.'), { status: r.status });
    return b;
  }
  /** Manuel kayıt veya yükleme sonrası bu cihazın bildiği sürümü günceller. */
  function remember(revision) {
    const s = settings();
    let hash = s.hash;
    try {
      hash = fingerprint(payload());
    } catch {
      /* geçersiz yerel kayıt: bir sonraki denemede yeniden hesaplanır */
    }
    store({ ...s, revision, hash, at: new Date().toISOString() });
  }
  /** Otomatik kaydı açar. Kullanıcı onayıyla mevcut hesap kaydının üzerine bu cihazdakini yazar. */
  async function enable() {
    const server = await call('GET');
    const p = payload();
    const saved = await call('PUT', { revision: server.revision || 0, payload: p });
    lastError = '';
    store({ on: true, revision: saved.revision, hash: fingerprint(p), at: new Date().toISOString() });
    return saved.revision;
  }
  function disable() {
    store({ ...settings(), on: false });
  }
  async function tick() {
    const s = settings();
    if (!s.on || busy || root.AA_STATIC) return;
    if (root.PilotProgress?.status() !== 'ready') return;
    let p;
    try {
      p = payload();
    } catch {
      return;
    }
    const hash = fingerprint(p);
    if (hash === s.hash) return;
    busy = true;
    try {
      const saved = await call('PUT', { revision: s.revision || 0, payload: p });
      lastError = '';
      store({ ...s, revision: saved.revision, hash, at: new Date().toISOString() });
    } catch (err) {
      if (err.status === 409) {
        lastError =
          'Başka bir cihazda daha yeni bir kayıt var. Otomatik kayıt durduruldu; Hesabım ekranından kaydı yükle veya bu cihazdakini gönder.';
        store({ ...s, on: false });
      } else lastError = 'Son otomatik kayıt gönderilemedi; bağlantı gelince yeniden denenecek.';
      root.dispatchEvent(new Event('account-sync'));
    } finally {
      busy = false;
    }
  }
  function label() {
    const s = settings();
    if (lastError) return lastError;
    if (!s.on) return 'Otomatik kayıt kapalı.';
    return s.at
      ? 'Otomatik kayıt açık · son gönderim ' +
          new Date(s.at).toLocaleTimeString('tr-TR', {
            timeZone: 'Europe/Istanbul',
            hour: '2-digit',
            minute: '2-digit',
          })
      : 'Otomatik kayıt açık.';
  }
  setInterval(tick, INTERVAL);
  root.addEventListener('pilot-progress', tick);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) tick();
  });
  root.AccountSync = { enable, disable, remember, tick, label, settings, payload };
})(window);
