'use strict';
const C = window.CONTENT,
  KEY = 'rol-atolyesi-v1';
const $ = s => document.querySelector(s),
  esc = s =>
    String(s ?? '').replace(
      /[&<>"']/g,
      c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]
    );
let cache;
try {
  cache = JSON.parse(localStorage.getItem(KEY) || 'null');
} catch {}
let state =
  cache && ['0.1.0', '0.2.0', '0.3.0', '0.4.0', C.version].includes(cache.version)
    ? {
        ...cache,
        version: C.version,
        index: cache.version === C.version ? cache.index : 0,
        completed: cache.version === C.version ? cache.completed : false,
      }
    : {
        version: C.version,
        context: {
          purpose: 'Gelişim',
          sector: 'Genel iş ortamı',
          team: '6–15 kişi',
          experience: 'Karma deneyim',
          authority: 'Günlük iş ve görev dağılımı',
          code: 'Deneme-01',
        },
        answers: {},
        index: 0,
        completed: false,
      };
function migrateEdition(record) {
  if (record.version === C.version) return record;
  const { editionArchive, ...prior } = record;
  const ids = new Set([
    ...Object.keys(prior.answers || {}),
    ...Object.values(prior.positionSessions || {}).flatMap(x => Object.keys(x.answers || {})),
  ]);
  const archive = ids.size
    ? { ...prior, questions: (C.previousItems || []).filter(q => ids.has(q.id)) }
    : null;
  return {
    ...record,
    version: C.version,
    answers: {},
    positionSessions: {},
    index: 0,
    completed: false,
    finishedAt: null,
    editionArchive: [...(editionArchive || []), ...(archive ? [archive] : [])],
  };
}
if (cache && cache.version !== C.version) state = migrateEdition(cache);
function shuffled(list, seed) {
  let n = 2166136261;
  for (const c of seed) n = Math.imul(n ^ c.charCodeAt(0), 16777619) >>> 0;
  const out = [...list];
  for (let i = out.length - 1; i > 0; i--) {
    n ^= n << 13;
    n ^= n >>> 17;
    n ^= n << 5;
    const j = (n >>> 0) % (i + 1);
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}
function balancedSlots(n, key) {
  let slots;
  for (let attempt = 0; attempt < 200; attempt++) {
    slots = shuffled(
      Array.from({ length: n }, (_, i) => i % 4),
      key + 'letters' + attempt
    );
    if (!slots.some((v, i) => i > 1 && v === slots[i - 1] && v === slots[i - 2])) return slots;
  }
  const remaining = [0, 1, 2, 3].map(v => slots.filter(x => x === v).length),
    out = [];
  while (out.length < n) {
    const allowed = shuffled([0, 1, 2, 3], key + out.length).filter(
      v => remaining[v] > 0 && !(out.length > 1 && out.at(-1) === v && out.at(-2) === v)
    );
    allowed.sort((a, b) => remaining[b] - remaining[a]);
    const v = allowed[0];
    if (v === undefined) throw Error('Şık dağılımı kurulamadı.');
    out.push(v);
    remaining[v]--;
  }
  return out;
}
let optionCache = { key: null, orders: {} };
function optionOrder(q, record = state) {
  const qs = activeItems(record),
    key = JSON.stringify([record.profile, qs.map(x => x.id)]);
  if (optionCache.key !== key) {
    const single = qs.filter(x => ['choice', 'info'].includes(x.type)),
      slots = balancedSlots(single.length, key);
    const orders = {};
    single.forEach((x, i) => {
      const best = x.options.findIndex(o => o.score === Math.max(...x.options.map(o => o.score))),
        rest = shuffled(
          x.options.map((_, j) => j).filter(j => j !== best),
          key + x.id
        );
      rest.splice(slots[i], 0, best);
      orders[x.id] = rest;
    });
    optionCache = { key, orders };
  }
  return (
    optionCache.orders[q.id] ||
    shuffled(
      q.options.map((_, i) => i),
      key + q.id
    )
  );
}
let view = 'home',
  tab = 'overview',
  sample = false,
  storageOk = true,
  feedbackId = null;
const purposeNames = ['Gelişim', 'İşe alım provası', 'Terfi provası'];

const roleTemplates = [
  {
    id: 'team',
    name: 'Ekip lideri / takım lideri',
    priorities: {
      gelisim: 2,
      delegasyon: 2,
      performans: 2,
      catisma: 1,
      karar: 1,
      plan: 2,
      degisim: 1,
      adalet: 2,
      iletisim: 2,
      musteri: 1,
      analitik: 1,
      ogrenme: 1,
    },
  },
  {
    id: 'operations',
    name: 'Operasyon / depo ekip yöneticisi',
    priorities: {
      gelisim: 1,
      delegasyon: 1,
      performans: 1,
      catisma: 1,
      karar: 2,
      plan: 2,
      degisim: 1,
      adalet: 2,
      iletisim: 1,
      musteri: 2,
      analitik: 2,
      ogrenme: 1,
    },
  },
  {
    id: 'analyst',
    name: 'İş / süreç / veri analisti',
    priorities: {
      gelisim: 0,
      delegasyon: 0,
      performans: 0,
      catisma: 1,
      karar: 2,
      plan: 1,
      degisim: 1,
      adalet: 1,
      iletisim: 2,
      musteri: 1,
      analitik: 2,
      ogrenme: 1,
    },
  },
  {
    id: 'operations_specialist',
    name: 'Operasyon / lojistik uzmanı',
    priorities: {
      gelisim: 0,
      delegasyon: 0,
      performans: 0,
      catisma: 1,
      karar: 2,
      plan: 2,
      degisim: 1,
      adalet: 2,
      iletisim: 1,
      musteri: 2,
      analitik: 1,
      ogrenme: 1,
    },
  },
  {
    id: 'specialist',
    name: 'Proje / destek fonksiyonu uzmanı',
    priorities: {
      gelisim: 0,
      delegasyon: 0,
      performans: 0,
      catisma: 1,
      karar: 2,
      plan: 2,
      degisim: 2,
      adalet: 1,
      iletisim: 2,
      musteri: 1,
      analitik: 1,
      ogrenme: 1,
    },
  },
  {
    id: 'graduate',
    name: 'Yeni mezun / ilk iş',
    priorities: {
      gelisim: 0,
      delegasyon: 0,
      performans: 0,
      catisma: 1,
      karar: 1,
      plan: 2,
      degisim: 1,
      adalet: 2,
      iletisim: 2,
      musteri: 1,
      analitik: 1,
      ogrenme: 2,
    },
  },
  {
    id: 'custom',
    name: 'Kendi rolümü / yetkinlik paketimi oluştur',
    priorities: Object.fromEntries(C.dimensions.map(d => [d.id, 1])),
  },
];
for (const t of roleTemplates)
  t.priorities = Object.fromEntries(C.dimensions.map(d => [d.id, t.priorities[d.id] || 0]));
function poolFor(dim, r = state) {
  const p = profileOf(r);
  return C.items.filter(
    q =>
      q.dim === dim &&
      q.roles.includes(p.roleType) &&
      (!q.positions || q.positions.includes(p.positionId) || (!p.positionId && p.roleType === 'custom'))
  );
}

function profileOf(r = state) {
  const p = r.profile;
  return {
    positionId: p?.positionId || '',
    seniority: p?.seniority || 'entry',
    roleType: p?.roleType || 'team',
    roleTitle: p?.roleTitle || 'Ekip lideri / takım lideri',
    depth: p?.depth || 'standard',
    priorities: Object.fromEntries(C.dimensions.map(d => [d.id, p ? (p.priorities?.[d.id] ?? 0) : 2])),
  };
}
function activeDimensions(r = state) {
  const p = profileOf(r);
  return C.dimensions
    .filter(d => p.priorities[d.id] > 0 && poolFor(d.id, r).length)
    .sort((a, b) => p.priorities[b.id] - p.priorities[a.id]);
}
function activeItems(r = state) {
  const p = profileOf(r);
  return activeDimensions(r).flatMap(d => poolFor(d.id, r).filter(q => p.depth === 'full' || q.core));
}
function validProfile(p) {
  return (
    p &&
    (!p.positionId ||
      (window.Positions?.get(p.positionId)?.roleType === p.roleType &&
        Positions.valid({ schema: 1, positionId: p.positionId, seniority: p.seniority || 'entry' }))) &&
    (!p.seniority ||
      Object.keys(window.Positions?.levels || { entry: 1, experienced: 1, senior: 1, lead: 1 }).includes(
        p.seniority
      )) &&
    (!p.depth || ['standard', 'full'].includes(p.depth)) &&
    roleTemplates.some(r => r.id === p.roleType) &&
    typeof p.roleTitle === 'string' &&
    p.roleTitle.trim().length > 0 &&
    p.roleTitle.length <= 80 &&
    p.priorities &&
    Object.keys(p.priorities).length === C.dimensions.length &&
    C.dimensions.every(d => [0, 1, 2].includes(p.priorities[d.id])) &&
    C.dimensions.some(d => p.priorities[d.id] > 0) &&
    C.dimensions.every(d => p.priorities[d.id] === 0 || poolFor(d.id, { profile: p }).length > 0)
  );
}
function priorityName(n) {
  return n === 2 ? 'Öncelikli' : n === 1 ? 'Destekleyici' : 'Kapsam dışı';
}
const INSIGHT_KEY = 'rol-atolyesi-profile-events-v1';
function profileEvents() {
  try {
    const e = JSON.parse(localStorage.getItem(INSIGHT_KEY) || '[]');
    return Array.isArray(e) ? e : [];
  } catch {
    return [];
  }
}
function logProfile(p) {
  const event = {
    eventId: window.crypto?.randomUUID?.() || Date.now().toString(36) + Math.random().toString(36).slice(2),
    type: 'profile_configured',
    contentVersion: C.version,
    depth: p.depth || 'standard',
    at: new Date().toISOString(),
    roleType: p.roleType,
    selections: C.dimensions.map(d => ({ id: d.id, priority: p.priorities[d.id] })),
  };
  try {
    localStorage.setItem(INSIGHT_KEY, JSON.stringify([...profileEvents(), event].slice(-200)));
  } catch {
    storageOk = false;
  }
}
function profileSummary() {
  const form = $('#setupForm');
  if (!form) return;
  const p = {
      ...profileOf(),
      positionId: form.elements.positionId.value,
      seniority: form.elements.seniority.value,
      roleType: form.elements.roleType.value,
      depth: form.elements.depth.value,
    },
    vals = C.dimensions.map(d => Number(form.elements['priority-' + d.id].value)),
    num = vals.filter(v => v > 0).length,
    total = C.dimensions.reduce(
      (n, d, i) =>
        n +
        (vals[i] > 0 ? poolFor(d.id, { profile: p }).filter(q => p.depth === 'full' || q.core).length : 0),
      0
    );
  $('#profileSummary').textContent =
    `${num} yetkinlik · ${total} bağımsız senaryo · ${vals.filter(v => v === 2).length} öncelikli alan`;
  form.querySelectorAll('.expectation-row').forEach((row, i) => {
    row.classList.toggle('excluded', vals[i] === 0);
  });
  $('#profileError').textContent = num ? '' : 'En az bir beklenti seçmelisin.';
}
function applyRoleTemplate(form, fromPosition = false) {
  if (!fromPosition) form.elements.positionId.value = '';
  const role = roleTemplates.find(r => r.id === form.elements.roleType.value);
  form.elements.authority.value = ['team', 'operations'].includes(role.id)
    ? 'Günlük iş ve görev dağılımı'
    : 'Kendi görevim ve öneri hazırlama';
  form.elements.roleTitle.value = role.name;
  C.dimensions.forEach(d => {
    const pool = poolFor(d.id, {
        profile: { roleType: role.id, positionId: form.elements.positionId.value },
      }),
      select = form.elements['priority-' + d.id];
    select.closest('.expectation-row').hidden = !pool.length;
    select.innerHTML = (pool.length ? [2, 1, 0] : [0])
      .map(n => `<option value="${n}">${priorityName(n)}</option>`)
      .join('');
    select.value = pool.length ? role.priorities[d.id] : 0;
    const label = document.querySelector('[data-coverage="' + d.id + '"]');
    if (label)
      label.textContent = pool.length
        ? `${pool.length} soru · standart pakette ${pool.filter(q => q.core).length} · ${[...new Set(pool.map(q => q.sub))].join(' / ')}`
        : 'Bu rol için soru yok · kapsam dışı';
  });
  profileSummary();
}

function applyPosition(form) {
  const pos = window.Positions?.get(form.elements.positionId.value);
  if (!pos) {
    profileSummary();
    return;
  }
  form.elements.roleType.value = pos.roleType;
  form.elements.seniority.value = pos.people
    ? 'lead'
    : form.elements.seniority.value === 'lead'
      ? 'experienced'
      : form.elements.seniority.value;
  form.elements.depth.value = ['senior', 'lead'].includes(form.elements.seniority.value)
    ? 'full'
    : 'standard';
  applyRoleTemplate(form, true);
  form.elements.roleTitle.value = pos.name;
  const priorities = Positions.priorities(pos.id, C.dimensions);
  C.dimensions.forEach(
    d =>
      (form.elements['priority-' + d.id].value = poolFor(d.id, {
        profile: { roleType: pos.roleType, positionId: pos.id },
      }).length
        ? priorities[d.id]
        : 0)
  );
  profileSummary();
}
function activateProfile(profile) {
  const sessionKey = p =>
      p?.positionId ? p.positionId + '@' + (p.seniority || 'entry') : 'family:' + (p?.roleType || 'team'),
    currentKey = sessionKey(state.profile),
    nextKey = sessionKey(profile);
  if (currentKey !== nextKey) {
    const archive = { ...state.positionSessions };
    if (Object.keys(state.answers || {}).length || state.profile)
      archive[currentKey] = {
        version: state.version,
        profile: state.profile,
        context: state.context,
        answers: state.answers,
        index: state.index,
        completed: state.completed,
        finishedAt: state.finishedAt,
      };
    if (Object.keys(archive).length > 96)
      throw Error('Pozisyon arşivi sınırına ulaştın. Önce oturum yedeğini indir.');
    const prior = archive[nextKey];
    state = {
      version: C.version,
      context: prior?.context || { ...state.context },
      answers: prior?.answers || {},
      index: 0,
      completed: false,
      profile,
      positionSessions: archive,
      editionArchive: state.editionArchive,
    };
  } else state.profile = profile;
  state.completed = activeItems().length > 0 && activeItems().every(q => done(q, state.answers[q.id]));
}
function save() {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
    storageOk = true;
  } catch {
    storageOk = false;
  }
}
function done(q, a) {
  if (q.type === 'plan')
    return (
      Array.isArray(a) &&
      a.length === 2 &&
      new Set(a).size === 2 &&
      a.every(i => Number.isInteger(i) && i >= 0 && i < q.options.length)
    );
  if (q.type === 'rank')
    return (
      Array.isArray(a) &&
      a.length === q.options.length &&
      new Set(a).size === q.options.length &&
      a.every(i => Number.isInteger(i) && i >= 0 && i < q.options.length)
    );
  return Number.isInteger(a) && a >= 0 && a < q.options.length;
}
function raw(q, a) {
  if (!done(q, a)) return null;
  if (q.type === 'rank') {
    let correct = 0,
      total = 0;
    for (let i = 0; i < a.length; i++)
      for (let j = i + 1; j < a.length; j++) {
        total++;
        if (q.options[a[i]].score > q.options[a[j]].score) correct++;
      }
    return (3 * correct) / total;
  }
  if (q.type === 'plan') return a.reduce((s, i) => s + q.options[i].score, 0) / 2;
  return q.options[a].score;
}
function sampleRecord() {
  const answers = {};
  C.items.forEach((q, i) => {
    const by = q.options.map((o, j) => j).sort((a, b) => q.options[b].score - q.options[a].score);
    let weak = ['delegasyon', 'performans'].includes(q.dim),
      mixed = ['catisma', 'degisim'].includes(q.dim);
    if (q.type === 'rank') {
      answers[q.id] = weak ? [...by].reverse() : mixed ? [by[1], by[0], by[2], by[3]] : by;
    } else if (q.type === 'plan') {
      answers[q.id] = weak ? [by.at(-1), by.at(-2)] : mixed ? [by[0], by[2]] : by.slice(0, 2);
    } else answers[q.id] = weak ? by[2] : mixed ? by[1] : by[0];
  });
  return {
    profile: { ...profileOf() },
    context: {
      purpose: 'Gelişim',
      sector: 'Genel iş ortamı',
      team: '6–15 kişi',
      experience: 'Karma deneyim',
      authority: 'Günlük iş ve görev dağılımı',
      code: 'ÖRNEK • Kurgusal profil',
    },
    answers,
    completed: true,
  };
}
function record() {
  return sample ? sampleRecord() : state;
}
function results(r = record()) {
  return activeDimensions(r).map(d => {
    let qs = activeItems(r).filter(q => q.dim === d.id),
      e = qs
        .filter(q => done(q, r.answers[q.id]))
        .map(q => ({ q, a: r.answers[q.id], s: raw(q, r.answers[q.id]) })),
      avg = e.length ? e.reduce((s, x) => s + x.s, 0) / e.length : null;
    return {
      ...d,
      priority: profileOf(r).priorities[d.id],
      e,
      n: e.length,
      total: qs.length,
      avg,
      index: avg === null || e.length < qs.length ? null : Math.round((avg / 3) * 100),
      band:
        avg === null
          ? 'Kanıt yok'
          : e.length < qs.length
            ? 'Eksik kapsam'
            : avg >= 2.4
              ? 'Destekleyici cevaplar'
              : avg >= 1.5
                ? 'Karışık cevaplar'
                : 'Ek inceleme gerekli',
    };
  });
}
function nav(v) {
  view = v;
  rankDraft = null;
  feedbackId = null;
  render();
  window.scrollTo({ top: 0, behavior: 'instant' });
}
function layout(body) {
  return `<div class="layout"><aside class="sidebar"><a class="brand" href="#" data-nav="home"><span class="brand-icon">↗</span><span>Rol Atölyesi<small>Karardan gelişime</small></span></a><nav class="nav" aria-label="Ana menü">${[
    ['home', '◈', 'Çalışma alanı'],
    ['setup', '◎', 'Değerlendirme'],
    ['report', '▤', 'Hazırlık raporu'],
    ['content', '▦', 'İçerik ve yöntem'],
  ]
    .map(
      ([v, icon, name]) =>
        `<button data-nav="${v}" class="${view === v || (v === 'setup' && view === 'assessment') ? 'active' : ''}"><span>${icon}</span>${name}</button>`
    )
    .join(
      ''
    )}</nav><div class="side-note"><strong>Rol ve yetkinlik havuzu</strong>${C.items.length} bağımsız senaryo<br>${C.dimensions.length} yetkinlik · 4 görev biçimi<br><br>Uygulama 0.5 · İçerik ${C.version}<br>Uzman incelemesi bekleyen prototip</div></aside><main class="main"><div class="topbar"><span>Çalışma alanı / ${esc({ home: 'Genel bakış', setup: 'Rol ve uygulama', assessment: 'Senaryo oturumu', report: 'Kanıta dayalı rapor', content: 'İçerik ve yöntem' }[view])}</span><span class="pill green">● &nbsp; İlk geliştirme sürümü</span></div>${body}<footer class="footer">Rol Atölyesi · 0.5 / İçerik ${C.version} &nbsp; / &nbsp; Yapay zekâ çağrısı yok. Cevaplar bu tarayıcıda tutulur. ${!storageOk ? '<span class="error">Tarayıcı kaydı kullanılamıyor; dışa aktararak oturumu saklayın.</span>' : ''}</footer><div id="status" class="visually-hidden" role="status" aria-live="polite"></div></main></div>`;
}
function home() {
  const count = activeItems().filter(q => done(q, state.answers[q.id])).length,
    heroQuestion = activeItems()[0] || C.items[0],
    heroDimension = C.dimensions.find(d => d.id === heroQuestion.dim);
  return `<section class="hero"><div><div class="eyebrow">İnsan ve karar odağında</div><h1>Bir seçeneğin ötesinde.<br><em>Kararın ardındaki yaklaşım.</em></h1><p>Rolüne uygun iş durumlarını ve seçtiğin yetkinlikleri çalış. Tercihlerin dayanaklarını gör; mülakatı ve gelişim adımlarını aynı rapordan hazırla.</p><div class="actions"><button class="btn" data-nav="${count ? 'assessment' : 'setup'}">${count ? 'Oturuma devam et · ' + count + '/' + activeItems().length : 'İlk değerlendirmeyi başlat'} <span>↗</span></button><button class="btn secondary" data-action="sample">Örnek Hazırlık raporunu incele</button></div><p class="small muted" style="margin-top:15px">İsimsiz deneyebilirsin. Her sorudan sonra otomatik kayıt.</p></div><div class="hero-visual" aria-label="Senaryodan kanıta, kanıttan gelişime"><div class="flow-label">Bir kararın yolculuğu</div><div class="mini-case"><span class="num">${heroQuestion.id} / ${esc(heroDimension.name)}</span><h4>${esc(heroQuestion.title)}</h4><p>${esc(heroQuestion.scene)}</p><div class="mini-row"><i>✓</i> Tercih → davranış dayanağı</div></div><div class="mini-result"><span class="small">${esc(heroDimension.name)} / ÇALIŞMA ALANI</span><p>${esc(heroDimension.subtitle)}</p></div></div></section><div class="grid3 metrics"><div class="card"><div class="stat-number">${C.items.length} <small>bağımsız senaryo</small></div><p class="small muted">Soru sayısı rol ve yetkinliğe göre değişir</p></div><div class="card"><div class="stat-number">${C.dimensions.length} <small>yetkinlik alanı</small></div><p class="small muted">Alt davranışlara bağlı içerik</p></div><div class="card"><div class="stat-number">4 <small>görev biçimi</small></div><p class="small muted">Seçim, bilgi, sıra ve eylem planı</p></div></div><div class="section-head"><h2>Değerlendirmeden uygulamaya</h2><span class="small muted">Aday için rol, karar ve gelişim çalışmaları</span></div><div class="grid3"><div class="card"><div class="badge-icon">01</div><h3>Rolü tanımla</h3><p class="muted small">Pozisyonunu ve kıdemini seç veya kendi yetkinlik paketini kur. Yetkinliklerin önemini ve çalışma derinliğini belirle.</p></div><div class="card"><div class="badge-icon">02</div><h3>Kararları görünür kıl</h3><p class="muted small">Eksik bilgiyi seç, adımları sırala, seçenekleri değerlendir ve sınırlı eylem planı kur.</p></div><div class="card"><div class="badge-icon">03</div><h3>Kanıtla ilerle</h3><p class="muted small">Cevapları, yorum gerekçelerini, mülakat sorularını ve iş üzerinde gelişim görevlerini birlikte incele.</p></div></div><section class="card"><h2>Hangi role hazırlanıyorsun?</h2><div class="role-choices">${roleTemplates.map(r => `<button class="btn secondary small" data-role-pick="${r.id}">${r.name}</button>`).join('')}</div><p class="small muted">Rolü seç; yetkinlikleri ve ilgili soruları gör. İstersen tek bir yetkinlikle başla.</p></section><div class="section-head"><h2>Yetkinlik havuzu</h2><button class="btn small ghost" data-nav="content">Ölçütleri incele ↗</button></div><div class="dim-grid">${C.dimensions.map((d, i) => `<button class="dim-tile" data-dim-pick="${d.id}"><span class="small muted">${String(i + 1).padStart(2, '0')}</span><b>${d.name}</b><p>${d.subtitle}</p><small>${d.poolSize} soru · Alanı seç ↗</small></button>`).join('')}</div><div class="notice">Bu sürüm, içerik ve rapor mantığını denemek içindir. Puan anahtarları taslaktır; uzman incelemesi ve pilot yapılmadı. Sonuçlar işe alım veya terfi için tek başına karar ölçütü değildir.</div>`;
}
function selectField(key, label, options) {
  return `<label class="field">${label}<select name="${key}">${options.map(t => `<option ${state.context[key] === t ? 'selected' : ''}>${esc(t)}</option>`).join('')}</select></label>`;
}
function setup() {
  const p = profileOf(),
    count = activeItems().filter(q => done(q, state.answers[q.id])).length;
  return `<div class="eyebrow">01 / Rol beklentileri</div><h1>Rolü sen tanımla.<br>Paketi beklentiler oluştursun.</h1><p class="muted">Yetkinlik havuzundan gerekenleri seç; hangilerinin öncelikli olduğunu belirle. Soru sayısı alanın alt davranış kapsamına ve seçilen paket derinliğine göre değişir.</p><form id="setupForm"><div class="card" style="margin-top:25px"><div class="section-head" style="margin-top:0"><h2>1. Rol ve uygulama</h2><span class="pill green">Rolüne uygun yetkinlikler</span></div><div class="grid2"><label class="field">Hedef pozisyon<select name="positionId"><option value="">Özel / pozisyon seçmeden</option>${(window.Positions?.positions || []).map(x => `<option value="${x.id}" ${p.positionId === x.id ? 'selected' : ''}>${x.name}</option>`).join('')}</select></label><label class="field">Kıdem / sorumluluk kapsamı<select name="seniority">${Object.entries(
    window.Positions?.levels || { entry: 'Başlangıç' }
  )
    .map(([id, name]) => `<option value="${id}" ${p.seniority === id ? 'selected' : ''}>${name}</option>`)
    .join(
      ''
    )}</select></label><label class="field">Rol ailesi<select name="roleType">${roleTemplates.map(r => `<option value="${r.id}" ${p.roleType === r.id ? 'selected' : ''}>${r.name}</option>`).join('')}</select></label><label class="field">Raporda görünecek rol adı<input name="roleTitle" maxlength="80" required value="${esc(p.roleTitle)}"></label><label class="field">Paket derinliği<select name="depth"><option value="standard" ${p.depth === 'standard' ? 'selected' : ''}>Standart — seçilmiş alt davranışlar</option><option value="full" ${p.depth === 'full' ? 'selected' : ''}>Geniş — seçilen alanların tüm soruları</option></select></label><label class="field">Oturum kodu<input name="code" maxlength="50" required value="${esc(state.context.code)}" autocomplete="off"></label>${selectField('purpose', 'Kullanım amacı', purposeNames)}${selectField('sector', 'Çalışma bağlamı', ['Genel iş ortamı', 'Operasyon / lojistik', 'Ofis / destek fonksiyonu'])}${selectField('team', 'Birlikte çalışılan grup büyüklüğü', ['1–5 kişi', '6–15 kişi', '16–30 kişi', '30+ kişi'])}${selectField('experience', 'Grubun deneyim dağılımı', ['Yeni başlayan ağırlıklı', 'Karma deneyim', 'Deneyimli ekip'])}${selectField('authority', 'Karar yetkisi', ['Kendi görevim ve öneri hazırlama', 'Sınırlı iş kararı ve koordinasyon', 'Günlük iş ve görev dağılımı', 'Görev ve sınırlı kaynak kararı', 'Görev, kaynak ve performans takibi'])}</div><p class="small muted" style="margin-top:15px">Şablon soru bağlamını ve başlangıç önemlerini seçer. Analist, operasyon uzmanı ve proje uzmanı rotalarında ayrı mesleki durumlar vardır. Yeni mezun rotası ekip yönetimi gerektirmez. Teknik meslek yeterliliği sınavı değildir.</p></div><div class="section-head"><h2>2. Bu rolden ne bekliyorsun?</h2><button class="btn ghost small" type="button" data-action="applyRole">Rol önerisini uygula</button></div><p class="small muted">Öncelikli alanlar senaryolarda ve raporda önce gelir. Destekleyici alanlar da değerlendirilir. Kapsam dışı alanlar pakete ve rapora dahil edilmez. Önem seçimi doğru cevabı veya yetkinlik puanını değiştirmez.</p><div class="expectation-list">${C.dimensions
    .map(
      d =>
        `<div class="card expectation-row ${p.priorities[d.id] === 0 ? 'excluded' : ''}" ${poolFor(d.id).length ? '' : 'hidden'}><div><h3>${d.name}</h3><p class="small">${d.expectation}</p><span class="pill">${d.category}</span> <span class="small muted" data-coverage="${d.id}">${poolFor(d.id).length} soru · standart pakette ${poolFor(d.id).filter(q => q.core).length}</span><details><summary>Alt davranış kapsamı ve adet gerekçesi</summary><p class="small muted">${d.coverageRationale}</p><p class="small muted">${poolFor(
          d.id
        )
          .map(q => q.sub)
          .join(
            ' / '
          )}</p></details></div><label class="field">Bu roldeki önemi<select name="priority-${d.id}" aria-label="${d.name} önemi">${(poolFor(d.id).length ? [2, 1, 0] : [0]).map(n => `<option value="${n}" ${p.priorities[d.id] === n ? 'selected' : ''}>${priorityName(n)}</option>`).join('')}</select></label></div>`
    )
    .join(
      ''
    )}</div><div class="card profile-bottom"><div><div class="report-label">Oluşacak değerlendirme paketi</div><strong id="profileSummary">${activeDimensions().length} yetkinlik · ${activeItems().length} bağımsız senaryo</strong><p class="small muted" style="margin-top:7px">Süre sınırı yok. Standart paket seçilmiş alt davranışları, geniş paket seçilen alanların tüm sorularını içerir. Farklı paketler eşdeğerlik için doğrulanmadı; sonuçları doğrudan kıyaslamayın.</p><p id="profileError" class="error" role="alert"></p></div><button class="btn" type="submit">${count ? 'Seçimleri kaydet ve devam et' : 'Paketi oluştur ve başlat'} →</button></div><div class="notice green">Profil değiştirildiğinde mevcut cevaplar korunur; sadece seçilen alanlar değerlendirilir. Kapsam dışına alınan cevaplar rapora katılmaz. Seçim geçmişine rol türü ve yetkinlik önemleri kaydedilir; oturum kodu ve cevaplar bu geçmişe dahil edilmez. Kayıtlar yalnızca bu tarayıcıdadır.</div></form><div class="card"><h3>Oturumun kullanım biçimi</h3><p class="small muted">Gelişim modunda kaydedilen cevabın öğrenme gerekçesi açılabilir. İşe alım ve terfi provasında gerekçeler rapor aşamasına kadar gösterilmez. Bu prototip güvenli seçme altyapısı değildir.</p></div>`;
}
function assessment() {
  const q = activeItems()[state.index],
    a = state.answers[q.id],
    count = activeItems().filter(x => done(x, state.answers[x.id])).length;
  let typeName = {
    choice: 'İlk yaklaşımı seç',
    info: 'Öncelikli bilgiyi seç',
    plan: 'Tam iki eylem seç',
    rank: 'İlkten sona sırala',
  }[q.type];
  let answerHTML;
  if (q.type === 'rank') {
    const order = a || optionOrder(q);
    answerHTML = `<p class="small muted">Okları kullanarak sıralamayı düzenle; bitince “Sıralamayı kaydet” düğmesine bas.</p>${order.map((idx, pos) => `<div class="rank-row"><span class="position">${pos + 1}</span><p>${esc(q.options[idx].text)}</p><div class="rank-buttons"><button data-rank="${pos}" data-dir="-1" aria-label="${pos + 1}. adımı yukarı taşı" ${pos === 0 ? 'disabled' : ''}>↑</button><button data-rank="${pos}" data-dir="1" aria-label="${pos + 1}. adımı aşağı taşı" ${pos === order.length - 1 ? 'disabled' : ''}>↓</button></div></div>`).join('')}<button class="btn secondary small" data-action="confirmRank">${done(q, a) ? 'Sıralamayı yeniden kaydet' : 'Sıralamayı kaydet'}</button>`;
  } else
    answerHTML = optionOrder(q)
      .map((i, displayIndex) => {
        const o = q.options[i];
        return `<label class="option ${Array.isArray(a) ? (a.includes(i) ? 'selected' : '') : a === i ? 'selected' : ''}"><input type="${q.type === 'plan' ? 'checkbox' : 'radio'}" name="answer" value="${i}" ${Array.isArray(a) ? (a.includes(i) ? 'checked' : '') : a === i ? 'checked' : ''}><span class="option-letter">${String.fromCharCode(65 + displayIndex)}</span><span>${esc(o.text)}</span></label>`;
      })
      .join('');
  return `<div class="workspace"><section class="card question-card"><div class="title-row"><span class="eyebrow">Senaryo ${String(state.index + 1).padStart(2, '0')} / ${activeItems().length}</span><span class="pill">${typeName}</span></div><p class="small muted">${C.dimensions.find(d => d.id === q.dim).name} · ${esc(q.sub)}</p><h2>${q.title}</h2><p class="scene">${q.scene}</p><div id="answerArea">${answerHTML}</div><div class="status-line" role="status">${done(q, a) ? '✓ Cevap kaydedildi' : q.type === 'plan' && a?.length ? 'Bir eylem daha seç.' : 'Cevabını kaydederek devam edebilirsin.'}</div>${state.context.purpose === 'Gelişim' && done(q, a) ? `<button class="btn ghost small" data-action="feedback">${feedbackId === q.id ? 'Gerekçeyi gizle' : 'Öğrenme gerekçesini aç'}</button>${window.RoleReasoning ? RoleReasoning.html(state, q, a) : ''}${feedbackId === q.id ? feedback(q, a) : ''}` : ''}<div class="q-nav"><button class="btn secondary" data-action="prev" ${state.index === 0 ? 'disabled' : ''}>← Önceki</button><button class="btn ghost small" data-action="partial">Ara raporu gör</button><button class="btn" data-action="next" ${!done(q, a) ? 'disabled' : ''}>${state.index === activeItems().length - 1 ? 'Oturumu tamamla' : 'Sonraki →'}</button></div></section><aside class="card sticky-panel"><b class="small">${esc(state.context.code)}</b><div style="display:flex;justify-content:space-between;margin-top:10px"><span class="small muted">Tamamlanan görev</span><b class="small">${count}/${activeItems().length}</b></div><div class="progress"><i style="width:${(count / activeItems().length) * 100}%"></i></div><div class="competency-jump">${activeDimensions()
    .map(d => {
      const qs = activeItems().filter(q => q.dim === d.id);
      return `<button data-question="${activeItems().findIndex(q => q.dim === d.id)}" class="${q.dim === d.id ? 'active' : ''}">${d.name}<span>${qs.filter(q => done(q, state.answers[q.id])).length}/${qs.length}</span></button>`;
    })
    .join('')}</div><div class="question-map">${activeItems()
    .map(
      (x, i) =>
        `<button data-question="${i}" class="${done(x, state.answers[x.id]) ? 'done' : ''} ${state.index === i ? 'current' : ''}" aria-label="${i + 1}. senaryo${done(x, state.answers[x.id]) ? ', yanıtlandı' : ''}" ${state.index === i ? 'aria-current="step"' : ''}>${i + 1}</button>`
    )
    .join(
      ''
    )}</div><div class="side-instructions"><hr style="border:0;border-top:1px solid var(--line);margin:22px 0"><p class="small muted">Durumları birbirinden bağımsız değerlendir. Genel izlenim yerine verilen koşulları esas al.</p><p class="small muted">Bu oturumda süre puanlanmaz.</p></div></aside></div>`;
}
function feedback(q, a) {
  return `<div class="feedback"><div class="report-label">Taslak değerlendirme gerekçesi</div><p>${q.type === 'rank' ? 'Önerilen sıra, görevdeki açık bağımlılıklara dayanır.' : q.type === 'plan' ? 'İki eylemin birlikte sağladığı kapsam incelenir.' : 'Bu tercih tek başına bir yetkinlik hükmü oluşturmaz.'}</p>${optionOrder(
    q
  )
    .map(
      (i, j) =>
        `<p><b>${String.fromCharCode(65 + j)} · ${esc(q.options[i].text)}</b><br>${esc(q.options[i].why)}</p>`
    )
    .join('')}${
    q.type === 'rank'
      ? `<p><b>Önerilen sıra:</b> ${q.options
          .map((o, i) => i)
          .sort((a, b) => q.options[b].score - q.options[a].score)
          .map(i => String.fromCharCode(65 + optionOrder(q).indexOf(i)))
          .join(' → ')}</p>`
      : ''
  }${!sample && window.RoleReasoning ? RoleReasoning.saved(state, q, a) : ''}</div>`;
}
function responseText(q, a) {
  return q.type === 'rank'
    ? a.map((i, p) => `${p + 1}. ${q.options[i].text}`).join(' → ')
    : q.type === 'plan'
      ? a.map(i => q.options[i].text).join(' + ')
      : q.options[a].text;
}
function reason(q, a) {
  if (q.type === 'rank')
    return `Görevde tanımlanan bağımlılıklar için ${Math.round((raw(q, a) / 3) * 6)}/6 ikili sıra ilişkisi önerilen anahtarla uyumlu.`;
  return (q.type === 'plan' ? a : [a]).map(i => q.options[i].why).join(' ');
}
function interpretation(d) {
  if (!d.n) return 'Bu alanda yanıt bulunmuyor. Yorum üretmek için görevlerin tamamlanması gerekiyor.';
  if (d.n < d.total)
    return `${d.n}/${d.total} bağımsız durum yanıtlandı. Kapsam eksik olduğu için genel yetkinlik yorumu üretilmedi; aşağıdaki cevap dayanakları incelenebilir.`;
  let high = d.e.filter(e => e.s >= 2.4).length,
    low = d.e.filter(e => e.s < 1.5).length;
  let pre = `${d.total} bağımsız durumun ${high} tanesinde cevaplar taslak ölçütü güçlü biçimde destekliyor${low ? `; ${low} tanesinde ek inceleme gerektiren tercihler bulunuyor` : ''}. `;
  if (d.avg >= 2.4)
    return (
      pre +
      `Cevaplar, “${d.expectation.charAt(0).toLocaleLowerCase('tr') + d.expectation.slice(1)}” beklentisiyle genel olarak uyumlu. Bu, senaryoda yaklaşımı seçmeye ilişkin kanıttır; gerçek işte uygulama düzeyi mülakatta ve iş örneğinde doğrulanmalıdır.`
    );
  if (d.avg >= 1.5)
    return (
      pre +
      'Tercihler durumlar arasında farklılaşıyor. Yalnızca ortalamaya bakmak yerine aşağıdaki güçlü ve sınırlı cevapları karşılaştırmak gerekir. Farkın bağlam, bilgi veya uygulama planından kaynaklanıp kaynaklanmadığı mülakatta araştırılmalıdır.'
    );
  return (
    pre +
    'Cevaplarda beklenen yaklaşımın bazı bileşenleri eksik kalıyor. Bu bulgu, gerçek iş performansına ilişkin kesin hüküm değildir. Seçilen eylemlerin gerekçesi yapılandırılmış görüşmeyle araştırılmalıdır.'
  );
}
function detailsCard(d) {
  const strongest = d.e.filter(e => e.s >= 2.4),
    limited = d.e.filter(e => e.s < 2.4);
  return `<article class="card detail-card" id="detail-${d.id}"><div class="detail-top"><div><h3>${d.name}</h3><span class="small muted">${d.subtitle} · ${d.n}/${d.total} bağımsız durum · ${priorityName(d.priority)}</span></div><span class="pill ${d.avg !== null && d.avg >= 2.4 && d.n === d.total ? 'green' : 'amber'}">${d.band}</span></div><div class="report-label">Rolün davranış beklentisi</div><p>${esc(d.expectation)}</p><div class="report-label">Cevaplara dayalı yorum</div><p>${esc(interpretation(d))}</p>${d.n === d.total ? `<div class="report-block"><div class="report-label">Alt davranışlarda görünen ayrışma</div>${strongest.length ? `<p><b>Destekleyici tercihler:</b> ${strongest.map(e => `${e.q.id} / ${esc(e.q.sub)}: ${esc(reason(e.q, e.a))}`).join(' \u00b7 ')}</p>` : ''}${limited.length ? `<p><b>Görüşmede açılacak tercihler:</b> ${limited.map(e => `${e.q.id} / ${esc(e.q.sub)}: ${esc(reason(e.q, e.a))}`).join(' \u00b7 ')}</p>` : ''}</div>` : ''}${d.n === d.total ? `<div class="detail-grid"><div class="report-block"><div class="report-label">Mülakatta araştırılacak iş etkisi</div><p>${d.avg >= 2.4 ? 'Bu yaklaşımın farklı iş yüklerinde ve zaman baskısında korunup korunmadığı araştırılmalı. Güçlü senaryo cevabı uygulama deneyimiyle desteklenmeli.' : `Yukarıda sınırlı kalan tercihler işte de görülüyorsa ${esc(d.subtitle.toLocaleLowerCase('tr'))} beklentisinin hangi bölümünün aksadığı araştırılmalı. Seçilen eylemlerin nedenini sorun; cevap gerekçesi olmadan kişiye bir davranış özelliği atamayın.`}</p></div><div class="report-block"><div class="report-label">Kanıtın sınırı</div><p>${d.total} bağımsız senaryo · ${new Set(d.e.map(x => x.q.type)).size} görev biçimi. Öz bildirim niteliğinde tercih ve görev yanıtları; gözlenmiş iş davranışı yok. Ölçüm hatası ve norm hesaplanmadı.</p></div></div>` : ''}<details class="evidence-details"><summary>Cevap dayanaklarını aç · ${d.n} görev</summary>${d.e.map(e => `<div class="evidence"><b>${e.q.id} · ${esc(e.q.title)} <span class="pill">${e.s.toFixed(1)}/3 taslak puan</span></b><p><strong>Alt davranış:</strong> ${esc(e.q.sub)}</p><p><strong>Durum:</strong> ${esc(e.q.scene)}</p><p><strong>Cevap:</strong> ${esc(responseText(e.q, e.a))}</p><p><strong>Gerekçe:</strong> ${esc(reason(e.q, e.a))}</p></div>`).join('') || '<p class="small muted">Henüz yanıt yok.</p>'}</details></article>`;
}
function report() {
  const r = record(),
    ds = results(r),
    qs = activeItems(r),
    profile = profileOf(r),
    count = ds.reduce((s, d) => s + d.n, 0);
  if (!count)
    return `<div class="card empty"><div class="eyebrow">Hazırlık raporu</div><h2>Önce kararları tanıyalım.</h2><p class="muted">Kendi oturumunu başlat veya ${C.items.length} kurgusal cevabın ürettiği örnek raporu incele.</p><div class="actions" style="justify-content:center"><button class="btn" data-nav="setup">Oturumu başlat</button><button class="btn secondary" data-action="sample">Örnek raporu aç</button></div></div>`;
  const full = ds.filter(d => d.n === d.total),
    support = full.filter(d => d.avg >= 2.4),
    investigate = full.filter(d => d.avg < 1.5);
  let body = '';
  if (tab === 'overview')
    body = `<div class="grid2"><section class="card"><h3>Cevapların genel görünümü</h3><p class="small muted">0–100 taslak anahtar uyumu. Yüzdelik dilim, başarı olasılığı veya yetkinlik seviyesi değildir.</p><div class="bar-list">${ds.map(d => `<div class="bar-line"><a href="#detail-${d.id}" data-detail="${d.id}">${d.name}</a><div class="track"><i style="width:${d.n === d.total ? d.index : 0}%"></i></div><span>${d.n === d.total ? d.index + '/100' : d.n + '/' + d.total + ' görev'}</span></div>`).join('')}</div></section><section class="card soft"><h3>İK için okuma notu</h3><p class="small">${support.length ? `Destekleyici cevap örüntüsü bulunan alanlar: <b>${support.map(d => d.name).join(', ')}</b>.` : 'Tam kapsamda destekleyici olarak sınıflanan alan henüz yok.'}</p><p class="small">${investigate.length ? `Öncelikle araştırılacak alanlar: <b>${investigate.map(d => d.name).join(', ')}</b>.` : 'Ek inceleme eşiğinin altında kalan tam kapsamlı alan yok; bu, risk bulunmadığı anlamına gelmez.'}</p><p class="small">${full.length < ds.length ? `${ds.length - full.length} alanda kapsam eksik; eksik cevaplar sıfır sayılmaz.` : `Seçilen ${ds.length} alan için planlanan senaryolar tamamlandı. Senaryo adedi, tek başına geçerli veya güvenilir ölçüm iddiası taşımaz.`}</p><div class="report-block"><div class="report-label">Karar öncesi sonraki adım</div><p>Seçim gerekçelerini yapılandırılmış mülakatta araştır. Bir iş örneğiyle destekle. Otomatik kabul, ret veya aday sıralaması üretilmez.</p></div></section></div><div class="section-head"><h2>Yetkinliklerin ayrıntılı analizi</h2><span class="small muted">Gözlem → yorum → doğrulama</span></div>${ds.map(detailsCard).join('')}`;
  if (tab === 'interview')
    body = `<div class="notice green">Soruları aynı rol için tutarlı biçimde kullan. Gözlenen kanıtı kaydet; genel izlenimi puan yerine koyma. Bu sürümde değerlendirici puanlama formu ve ikinci değerlendirici iş akışı henüz bulunmuyor.</div>${[
      ...ds,
    ]
      .sort((a, b) => (a.avg ?? 4) - (b.avg ?? 4))
      .map(
        (d, i) =>
          `<article class="card detail-card"><div class="eyebrow">${String(i + 1).padStart(2, '0')} / ${d.name}</div><h3>${esc(d.interview)}</h3><p class="small"><b>Takip soruları:</b> Ne yaptınız? Hangi bilgiyle karar verdiniz? Çalışanın katkısı neydi? Sonucu nasıl gördünüz? Bugün neyi değiştirirdiniz?</p><div class="grid2"><div class="report-block"><div class="report-label">Destekleyici cevapta aranacak kanıt</div><p>${esc(d.anchor)}</p></div><div class="report-block"><div class="report-label">Derinleştirme gerektiren cevap</div><p>Yalnızca genel ilke anlatılması, kendi davranışının belirsiz kalması, sonuç veya takibin örneklenememesi. İş deneyimi azsa eşdeğer proje örneği istenebilir.</p></div></div><p class="small muted" style="margin-top:13px">Oturum dayanağı: ${d.n}/${d.total} görev · ${d.band}. ${d.n < d.total ? 'Eksik kapsam; davranış hakkında ön kabul oluşturmayın.' : ''}</p></article>`
      )
      .join('')}`;
  if (tab === 'development') {
    const priorities = [...full].sort((a, b) => b.priority - a.priority || a.avg - b.avg).slice(0, 3);
    body = `<div class="card"><h3>30 günlük uygulama taslağı</h3><p class="muted">${priorities.length ? 'Önce rolde öncelikli olan, ardından taslak uyumu daha düşük kalan tam kapsamlı alanlardan en fazla üçü önerildi. Öncelikleri çalışan ve yöneticisi birlikte doğrulamalı.' : 'Gelişim önceliği önermek için en az bir alanın planlanan görevlerini tamamlayın.'}</p><div class="step-list">${[
      [
        '1–3. gün',
        'Önceliği doğrula',
        'Mülakatta örnek iste; çalışanla başlangıç davranışını ve tek gelişim hedefini belirle.',
      ],
      [
        '4–14. gün',
        'İş üzerinde uygula',
        'Sınırlı bir görev, gerekli kaynak ve haftalık kısa geri bildirim planla.',
      ],
      ['15–24. gün', 'Destekle ve gözlemle', 'Aynı davranışı yeniden gözle; desteği ihtiyaca göre ayarla.'],
      [
        '25–30. gün',
        'Sonucu birlikte değerlendir',
        'Başlangıçla iş üstündeki kanıtı karşılaştır. Yeni eşdeğer senaryo henüz bu pakette yok.',
      ],
    ]
      .map(
        ([n, h, p]) =>
          `<div class="step"><i>↗</i><div><div class="small muted">${n}</div><h4>${h}</h4><p>${p}</p></div></div>`
      )
      .join(
        ''
      )}</div></div>${priorities.map((d, i) => `<div class="card detail-card"><div class="eyebrow">Gelişim önceliği ${i + 1}</div><h3>${d.name}</h3><div class="report-label">İş üzerinde uygulama</div><p>${esc(d.action)}</p><div class="grid2"><div class="report-block"><div class="report-label">Takip göstergesi</div><p>${esc(d.indicator)}</p></div><div class="report-block"><div class="report-label">Yönetici / mentor desteği</div><p>Göreve alan ve kaynak aç; haftada bir somut gözlemle geri bildirim ver. Birlikte belirlenen destek ile bağımsız uygulamayı ayrı kaydet.</p></div></div></div>`).join('')}<div class="notice">Senaryo puanındaki değişim, işte davranış değişimiyle aynı şey değildir. Eğitimden sonra aynı maddeleri çözmek yerine yeni eşdeğer görevler ve iş gözlemi gerekir.</div>`;
  }
  if (tab === 'evidence')
    body = `<div class="card"><h3>Yanıt ve gerekçe dökümü</h3><p class="muted small">Her yorum bu dökümdeki cevaplardan türetilir. Yanıtlanmayan görevler hesaplamaya katılmaz.</p>${qs
      .map(q => {
        const a = r.answers[q.id];
        return `<details><summary>${q.id} · ${esc(q.title)} · ${done(q, a) ? raw(q, a).toFixed(1) + '/3' : 'Yanıt yok'}</summary><div class="evidence"><p>${esc(q.scene)}</p><p><b>Cevap:</b> ${done(q, a) ? esc(responseText(q, a)) : '—'}</p><p><b>Dayanak:</b> ${done(q, a) ? esc(reason(q, a)) : 'Yorum üretilmedi.'}</p>${feedback(q, done(q, a) ? a : null)}</div></details>`;
      })
      .join('')}</div>`;
  return `<div class="title-row"><div><div class="eyebrow">${esc(profile.roleTitle)} / ${sample ? 'Kurgusal örnek rapor' : 'Oturum raporu'}</div><h1>Kararlardan görünen yaklaşım.</h1><p class="muted">${esc(r.context.code)} · ${esc(r.context.purpose)} · ${esc(window.Positions?.levels[profile.seniority] || '')} · ${count === qs.length ? 'Tamamlanan' : 'Kısmi'} kapsam</p></div><div class="actions no-print" style="margin:0"><button class="btn secondary small" data-action="print">Yazdır / PDF</button><button class="btn ghost small" data-action="export">Rapor verisini indir</button></div></div>${sample ? `<div class="notice green"><b>Kurgusal örnek:</b> Bu rapor önceden tanımlanmış ${C.items.length} örnek cevaptan aynı kural motoruyla hesaplanır. Kendi oturumun değiştirilmez. <button class="btn ghost small no-print" data-action="ownReport">Kendi raporuma dön</button></div>` : ''}<div class="report-stats"><div class="card"><div class="stat-number">${count}<small> / ${qs.length}</small></div><span class="small muted">Yanıtlanan görev</span></div><div class="card"><div class="stat-number">${full.length}<small> / ${ds.length}</small></div><span class="small muted">Kapsamı tamamlanan alan</span></div><div class="card"><div class="stat-number">${new Set(qs.filter(q => done(q, r.answers[q.id])).map(q => q.type)).size}<small> / ${new Set(qs.map(q => q.type)).size}</small></div><span class="small muted">Yanıtlanan görev biçimi</span></div></div><div class="card" style="padding:16px 20px"><div class="small muted">ROL BEKLENTİLERİ</div><p class="small"><b>${esc(profile.roleTitle)}</b> · ${ds.filter(d => d.priority === 2).length} öncelikli, ${ds.filter(d => d.priority === 1).length} destekleyici alan · ${profile.depth === 'full' ? 'Geniş paket' : 'Standart paket'}</p><p class="small muted">${ds.map(d => `${esc(d.name)}: ${priorityName(d.priority)}`).join(' · ')}</p><div class="small muted">BAĞLAM KAYDI</div><span class="small">${esc(r.context.sector)} · ${esc(r.context.team)} · ${esc(r.context.experience)} · ${esc(r.context.authority)}</span></div><div class="notice">Uzman incelemesi ve pilot yapılmadı. Yorumlar taslak ölçütlere bağlıdır. Norm, başarı olasılığı, kişilik tanısı ve psikometrik güven düzeyi üretilmez. ${r.context.purpose === 'Gelişim' ? 'Gelişim modunda gerekçeler açılabildiğinden oturum standart bir seçme testi olarak yorumlanamaz.' : ''}</div><div class="tabs no-print" role="tablist" aria-label="Rapor bölümleri">${[
    ['overview', 'Yetkinlik raporu'],
    ['interview', 'Mülakat rehberi'],
    ['development', 'Gelişim planı'],
    ['evidence', 'Cevap dayanakları'],
  ]
    .map(
      ([id, name]) =>
        `<button role="tab" aria-selected="${tab === id}" data-tab="${id}" class="${tab === id ? 'active' : ''}">${name}</button>`
    )
    .join(
      ''
    )}</div><p class="print-only">Yazdırılan bölüm: ${{ overview: 'Yetkinlik raporu', interview: 'Mülakat rehberi', development: 'Gelişim planı', evidence: 'Cevap dayanakları' }[tab]}. İçerik ve puan anahtarı ${C.version}.</p>${body}`;
}
function content() {
  return `<div class="eyebrow">İçerik ve yöntem / ${C.version}</div><h1>Her yorumun bir dayanağı var.</h1><p class="muted">Bu paketin içerik kapsamı, taslak puan anahtarı ve geliştirme sınırları.</p><div class="tabs" role="tablist" aria-label="İçerik bölümleri">${[
    ['overview', 'Rol ve ölçütler'],
    ['inventory', 'Senaryo havuzu'],
    ['method', 'Puanlama ve kalite'],
    ['insights', 'Seçim verisi'],
  ]
    .map(
      ([id, name]) =>
        `<button data-content-tab="${id}" role="tab" aria-selected="${tab === id}" class="${tab === id ? 'active' : ''}">${name}</button>`
    )
    .join('')}</div>${
    tab === 'inventory'
      ? `<div class="card"><h3>${C.items.length} bağımsız durum · ${C.dimensions.length} yetkinlik</h3><p class="small muted">Soruları yetkinlik bazında incele. Gerekçeler kendi yanıtından sonra açılır; bu alan öğrenme içindir.</p><div class="grid2" style="margin:18px 0"><label class="field">Pozisyona göre göster<select id="poolPosition"><option value="">Tüm pozisyonlar</option>${(window.Positions?.positions || []).map(x => `<option value="${x.id}" ${profileOf().positionId === x.id ? 'selected' : ''}>${x.name}</option>`).join('')}</select></label><label class="field">Role göre göster<select id="poolRole"><option value="">Tüm roller</option>${roleTemplates.map(r => `<option value="${r.id}" ${profileOf().roleType === r.id ? 'selected' : ''}>${r.name}</option>`).join('')}</select></label><label class="field">Yetkinliğe göre göster<select id="poolDim"><option value="">Tüm yetkinlikler</option>${C.dimensions.map(d => `<option value="${d.id}">${d.name} (${d.poolSize})</option>`).join('')}</select></label><label class="field">Sorularda ara<input id="poolSearch" type="search" placeholder="Örn. geri bildirim, kapasite, oran"></label></div><p class="small muted" id="poolCount">${C.items.length} soru gösteriliyor</p>${C.items.map(q => `<details class="pool-item" data-dim="${q.dim}" data-roles="${q.roles.join(',')}" data-positions="${(q.positions || []).join(',')}" data-search="${esc((q.title + ' ' + q.sub + ' ' + q.scene).toLocaleLowerCase('tr'))}"><summary>${q.id} · ${esc(q.title)} <span class="pill">${C.dimensions.find(d => d.id === q.dim).name}</span></summary><p class="small muted">${q.core ? 'Standart ve geniş pakette' : 'Yalnız geniş pakette'} · ${q.status}</p><p class="small muted">Alt davranış: ${q.sub} · Görev: ${{ choice: 'Tek seçim', info: 'Bilgi seçimi', rank: 'Sıralama', plan: 'İki eylem planı' }[q.type]}</p><p>${q.scene}</p>${q.options.map(o => `<p>• ${esc(o.text)}</p>`).join('')}${done(q, state.answers[q.id]) && (state.context.purpose === 'Gelişim' || state.completed) ? feedback(q, state.answers[q.id]) : '<p class="small muted">Gerekçeyi kendi yanıtından sonra inceleyebilirsin.</p>'}</details>`).join('')}</div>`
      : tab === 'method'
        ? method()
        : tab === 'insights'
          ? insights()
          : `<div class="card"><h3>Rol başarı profili</h3><p>Pozisyon, rol ailesi, kıdem ve seçilen yetkinliklere göre soru kapsamı oluşturulur. Yirmi pozisyon için ayrı uygulama durumları vardır. Yeni mezun rotası bireysel ve proje durumlarıyla çalışır. Kapsam seçimi teknik meslek yeterliliği, iş başarısı veya işe uygunluk puanı üretmez.</p><p class="muted small">Ortak senaryolarda geçen somut kısıtlar esas alınır. Başlangıç formundaki beklenti seçimleri paketin kapsamını ve öncelik sırasını belirler. Rol seçimi ilgili soru bağlamını seçer. Ekip büyüklüğü ve sektör kaydı tek başına soru veya puan anahtarını değiştirmez.</p></div>${C.dimensions
              .map(
                d =>
                  `<div class="card detail-card"><h3>${d.name}</h3><p>${d.expectation}</p><p class="small"><b>Havuz: ${d.poolSize} soru · Standart paket: ${d.coreCount} soru</b></p><p class="small muted">${d.coverageRationale} Bu adetler içerik tasarımı kararıdır; psikometrik olarak doğrulanmış gerekli soru sayısı değildir.</p><div class="table-wrap"><table><thead><tr><th>İncelenen alt davranış</th><th>Senaryo</th><th>Beklenen yaklaşımın dayanağı</th></tr></thead><tbody>${C.items
                    .filter(q => q.dim === d.id)
                    .map(
                      q =>
                        `<tr><td>${q.sub}</td><td>${q.id} · ${q.title}</td><td>${done(q, state.answers[q.id]) && (state.context.purpose === 'Gelişim' || state.completed) ? esc(reason(q, state.answers[q.id])) : 'Yanıt sonrası inceleme'}</td></tr>`
                    )
                    .join('')}</tbody></table></div></div>`
              )
              .join('')}`
  }<div class="actions"><button class="btn secondary small" data-action="backup">Oturumu yedekle</button><label class="btn secondary small">Yedeği içe aktar<input class="visually-hidden" id="importFile" type="file" accept="application/json,.json"></label></div><div class="card detail-card"><h3>Bu tarayıcıdaki oturum</h3><p class="small muted">Bu modüldeki cevaplar önce bu cihazda tutulur. Birleşik üründeki Hesabım ve teslimler bölümünden hesabına kaydedip başka cihazda yükleyebilirsin. İşe alım için çok aday sıralaması üretilmez.</p><button class="btn ghost small" data-action="reset">Oturumu sıfırla</button></div>`;
}
function method() {
  return `<div class="grid2"><div class="card"><h3>Açık taslak puanlama</h3><div class="step-list"><div class="step"><i>1</i><div><h4>Tek seçenek ve bilgi</h4><p>Her seçeneğe gerekçeli 0–3 taslak puan atanır. 0: beklenen yaklaşım yok veya temel gereklilikle çelişiyor. 1: sınırlı. 2: kısmen kapsamlı. 3: görevin temel ölçütlerini birlikte karşılıyor.</p></div></div><div class="step"><i>2</i><div><h4>İki eylem planı</h4><p>Tam iki eylemin puan ortalaması alınır. Bu, gerçek bir iş planının uygulanmasını ölçmez; sınırlı seçeneklerden kapsam kurmayı inceler.</p></div></div><div class="step"><i>3</i><div><h4>Adım sıralama</h4><p>Dört adımın altı ikili sıra ilişkisinden doğru olanların oranı × 3. Anahtar, görevdeki açık işlem bağımlılıklarına dayanır.</p></div></div><div class="step"><i>4</i><div><h4>Alan yorumu</h4><p>Seçilen alandaki planlanmış görevler tamamlanınca ortalama hesaplanır. Her alanın ortalaması kendi soru sayısına bölünür; fazla sorulu alanlar diğer alanların puanını etkilemez. ≥2,4: destekleyici; ≥1,5: karışık; &lt;1,5: ek inceleme. Eşikler tasarım amaçlıdır; pilotla doğrulanmadı. Eksik cevap sıfır sayılmaz, alan yorumu üretilmez.</p></div></div></div></div><div class="card"><h3>Kalite ve kanıt durumu</h3><div class="table-wrap"><table><tbody>${[
    ['İçerik yazımı', C.items.length + ' senaryo taslağı hazır'],
    ['Alt davranış kapsamı', 'Alan başına 4–9 bağımsız alt davranış durumu'],
    ['Rol uzmanı incelemesi', 'Bekliyor'],
    ['İK / eğitimci incelemesi', 'Bekliyor'],
    ['Ölçme-değerlendirme uzmanı', 'Bekliyor'],
    ['Adaylarla anlaşılabilirlik pilotu', 'Bekliyor'],
    ['Güvenirlik / geçerlik / adalet', 'Araştırılmadı'],
    ['İş performansıyla ilişki', 'Araştırılmadı'],
    ['Norm ve yüzdelik dilim', 'Yok'],
    ['Güvenli seçme altyapısı', 'Yok; tarayıcı prototipi'],
  ]
    .map(([a, b]) => `<tr><td>${a}</td><td>${b}</td></tr>`)
    .join(
      ''
    )}</tbody></table></div></div></div><div class="notice">Sonraki içerik çalışması: uzmanlarla kritik olay toplama, seçenek ve anahtar incelemesi, bilişsel görüşmeler, kontrollü pilot, madde ve form analizi. Eşdeğer formlar ve dallanan senaryolar bu ilk sürüme dahil değildir.</div>`;
}
function insights() {
  const events = profileEvents();
  return `<div class="card"><h3>Beklenti seçimleri / yerel deneme verisi</h3><p class="muted">Bu tarayıcıda kaydedilen son 200 profil yapılandırması. Aynı kişi birden fazla yapılandırma oluşturabilir; sayılar benzersiz kullanıcı veya pazar talebi değildir.</p><div class="stat-number">${events.length} <small>profil yapılandırması</small></div><div class="table-wrap"><table><thead><tr><th>Yetkinlik</th><th>Öncelikli</th><th>Destekleyici</th><th>Kapsam dışı</th></tr></thead><tbody>${C.dimensions.map(d => `<tr><td>${d.name}</td>${[2, 1, 0].map(n => `<td>${events.filter(e => e.selections?.some(x => x.id === d.id && x.priority === n)).length}</td>`).join('')}</tr>`).join('')}</tbody></table></div><div class="actions"><button class="btn ghost small" data-action="exportInsights">Seçim verisini indir · JSON</button></div><div class="notice green">Dışa aktarılan veride yalnızca olay kimliği, zaman, rol türü ve yetkinlik önemleri bulunur. Aday cevapları, puanları, oturum kodu ve serbest rol adı dahil edilmez. Ortak sunucuda veri toplanmıyor.</div></div>`;
}
function filterPool() {
  const position = $('#poolPosition')?.value || '',
    role = $('#poolRole')?.value || '',
    dim = $('#poolDim')?.value || '',
    term = ($('#poolSearch')?.value || '').trim().toLocaleLowerCase('tr');
  let count = 0;
  document.querySelectorAll('.pool-item').forEach(el => {
    const show =
      (!position || !el.dataset.positions || el.dataset.positions.split(',').includes(position)) &&
      (!role || el.dataset.roles.split(',').includes(role)) &&
      (!dim || el.dataset.dim === dim) &&
      (!term || el.dataset.search.includes(term));
    el.hidden = !show;
    if (show) count++;
  });
  $('#poolCount').textContent = count + ' soru gösteriliyor';
}
function render() {
  if (!['overview', 'inventory', 'method', 'insights'].includes(tab) && view === 'content') tab = 'overview';
  $('#app').innerHTML = layout(
    (state.editionArchive?.length
      ? `<div class="notice"><b>Seçenek metinleri yenilendi.</b> Önceki yanıtların eski metinleriyle arşivlendi; yeni çalışmaya karıştırılmaz. <button data-action="exportEditionArchive" class="btn ghost small">Önceki yanıtları indir</button></div>`
      : '') + { home, setup, assessment, report, content }[view]()
  );
  bind();
  window.RoleReasoning?.bind(state, () => {
    save();
    return storageOk;
  });
}
let rankDraft = null;
function message(s) {
  const el = $('#status');
  if (el) {
    el.className = 'status-line';
    el.textContent = s;
  }
}
function bind() {
  document.querySelectorAll('[data-nav]').forEach(
    b =>
      (b.onclick = e => {
        e.preventDefault();
        if (b.dataset.nav === 'report') {
          sample = false;
          tab = 'overview';
        }
        if (b.dataset.nav === 'content') tab = 'overview';
        nav(b.dataset.nav);
      })
  );
  document.querySelectorAll('[data-question]').forEach(
    b =>
      (b.onclick = () => {
        state.index = +b.dataset.question;
        rankDraft = null;
        feedbackId = null;
        save();
        render();
        window.scrollTo(0, 0);
      })
  );
  document.querySelectorAll('[data-tab]').forEach(
    b =>
      (b.onclick = () => {
        tab = b.dataset.tab;
        render();
      })
  );
  document.querySelectorAll('[data-content-tab]').forEach(
    b =>
      (b.onclick = () => {
        tab = b.dataset.contentTab;
        render();
      })
  );
  document.querySelectorAll('[data-detail]').forEach(
    b =>
      (b.onclick = e => {
        e.preventDefault();
        tab = 'overview';
        render();
        $('#detail-' + b.dataset.detail)?.scrollIntoView({ behavior: 'smooth' });
      })
  );
  $('#setupForm')?.addEventListener('submit', e => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.target)),
      priorities = Object.fromEntries(C.dimensions.map(d => [d.id, Number(data['priority-' + d.id])])),
      profile = {
        positionId: data.positionId,
        seniority: data.seniority,
        roleType: data.roleType,
        roleTitle: data.roleTitle.trim(),
        depth: data.depth,
        priorities,
      };
    if (!validProfile(profile)) {
      $('#profileError').textContent = 'En az bir beklenti seç ve rol adını doldur.';
      $('#profileError').scrollIntoView({ behavior: 'smooth' });
      return;
    }
    const changed = JSON.stringify(profileOf()) !== JSON.stringify(profile);
    if (changed || !state.profile) logProfile(profile);
    activateProfile(profile);
    state.context = Object.fromEntries(
      ['code', 'purpose', 'sector', 'team', 'experience', 'authority'].map(k => [k, data[k]])
    );
    if (profile.positionId)
      Positions.save(localStorage, {
        schema: 1,
        positionId: profile.positionId,
        seniority: profile.seniority,
      });
    state.index = 0;
    state.completed = activeItems().every(q => done(q, state.answers[q.id]));
    save();
    sample = false;
    nav('assessment');
  });
  document.querySelectorAll('[data-role-pick]').forEach(
    b =>
      (b.onclick = () => {
        nav('setup');
        const form = $('#setupForm');
        form.elements.roleType.value = b.dataset.rolePick;
        applyRoleTemplate(form);
      })
  );
  document.querySelectorAll('[data-dim-pick]').forEach(
    b =>
      (b.onclick = () => {
        nav('setup');
        const form = $('#setupForm');
        form.elements.roleType.value = 'custom';
        applyRoleTemplate(form);
        C.dimensions.forEach(
          d => (form.elements['priority-' + d.id].value = d.id === b.dataset.dimPick ? 2 : 0)
        );
        profileSummary();
      })
  );
  if (view === 'setup') {
    const form = $('#setupForm');
    form.elements.roleType.onchange = () => applyRoleTemplate(form);
    form.elements.positionId.onchange = () => applyPosition(form);
    form.elements.seniority.onchange = () => {
      if (form.elements.positionId.value) applyPosition(form);
      else profileSummary();
    };
    document
      .querySelectorAll('select[name^="priority-"],select[name="depth"]')
      .forEach(el => (el.onchange = profileSummary));
    profileSummary();
  }
  document.querySelectorAll('input[name="answer"]').forEach(
    el =>
      (el.onchange = () => {
        const q = activeItems()[state.index],
          i = +el.value;
        if (q.type === 'plan') {
          let arr = Array.isArray(state.answers[q.id]) ? [...state.answers[q.id]] : [];
          if (el.checked) {
            if (arr.length >= 2) {
              el.checked = false;
              message('Tam iki eylem seçilebilir. Önce bir seçimi kaldır.');
              return;
            }
            arr.push(i);
          } else arr = arr.filter(x => x !== i);
          state.answers[q.id] = arr;
        } else state.answers[q.id] = i;
        feedbackId = null;
        state.completed = false;
        save();
        let pos = window.scrollY;
        render();
        window.scrollTo(0, pos);
      })
  );
  document.querySelectorAll('[data-rank]').forEach(
    b =>
      (b.onclick = () => {
        const q = activeItems()[state.index];
        let arr = rankDraft || state.answers[q.id] || [2, 0, 3, 1];
        arr = [...arr];
        let i = +b.dataset.rank,
          j = i + +b.dataset.dir;
        [arr[i], arr[j]] = [arr[j], arr[i]];
        rankDraft = arr;
        const prior = state.answers[q.id];
        state.answers[q.id] = arr;
        state.completed = false;
        save();
        feedbackId = null;
        render();
        message('Yeni sıralama kaydedildi.');
      })
  );
  document.querySelectorAll('[data-action]').forEach(b => (b.onclick = () => action(b.dataset.action)));
  $('#importFile')?.addEventListener('change', importBackup);
  $('#poolPosition')?.addEventListener('change', () => {
    const p = Positions.get($('#poolPosition').value);
    if (p) $('#poolRole').value = p.roleType;
    filterPool();
  });
  $('#poolRole')?.addEventListener('change', () => {
    $('#poolPosition').value = '';
    filterPool();
  });
  $('#poolDim')?.addEventListener('change', filterPool);
  $('#poolSearch')?.addEventListener('input', filterPool);
  if (view === 'content' && tab === 'inventory') filterPool();
}
function action(a) {
  if (a === 'exportEditionArchive') {
    download('rol-onceki-surumler.json', { schema: 'rol-edition-archive', editions: state.editionArchive });
    return;
  }
  const q = activeItems()[state.index];
  if (a === 'applyRole') {
    applyRoleTemplate($('#setupForm'));
    message('Rolün soru kapsamı ve önerilen yetkinlik önemleri uygulandı.');
  }
  if (a === 'exportInsights')
    download('rol-atolyesi-beklenti-secimleri.json', {
      schema: 'rol-atolyesi-profile-events',
      exportedAt: new Date().toISOString(),
      scope: 'Bu tarayıcıdaki en fazla 200 profil yapılandırması; benzersiz kullanıcı sayısı değildir.',
      events: profileEvents(),
    });
  if (a === 'sample') {
    sample = true;
    tab = 'overview';
    nav('report');
  }
  if (a === 'ownReport') {
    sample = false;
    tab = 'overview';
    nav('report');
  }
  if (a === 'prev') {
    state.index = Math.max(0, state.index - 1);
    feedbackId = null;
    rankDraft = null;
    save();
    render();
    window.scrollTo(0, 0);
  }
  if (a === 'next') {
    if (!done(q, state.answers[q.id])) return;
    if (state.index < activeItems().length - 1) {
      state.index++;
      feedbackId = null;
      rankDraft = null;
      save();
      render();
      window.scrollTo(0, 0);
    } else {
      const missing = activeItems().findIndex(x => !done(x, state.answers[x.id]));
      if (missing >= 0) {
        state.index = missing;
        save();
        render();
        message('Önce yanıtsız görevleri tamamla.');
        window.scrollTo(0, 0);
      } else {
        state.completed = true;
        state.finishedAt = new Date().toISOString();
        save();
        sample = false;
        tab = 'overview';
        nav('report');
      }
    }
  }
  if (a === 'partial') {
    sample = false;
    tab = 'overview';
    nav('report');
  }
  if (a === 'confirmRank') {
    state.answers[q.id] = rankDraft || state.answers[q.id] || [2, 0, 3, 1];
    save();
    render();
  }
  if (a === 'feedback') {
    feedbackId = feedbackId === q.id ? null : q.id;
    render();
  }
  if (a === 'print') {
    document.querySelectorAll('details').forEach(d => (d.open = true));
    window.print();
  }
  if (a === 'export')
    download('rol-atolyesi-rapor.json', {
      schema: 'rol-atolyesi-report',
      version: C.version,
      sample,
      generatedAt: new Date().toISOString(),
      context: record().context,
      profile: profileOf(record()),
      limitations:
        'Taslak anahtar; uzman incelemesi ve pilot yok. Başarı olasılığı, norm veya gerçek iş performansı değildir.',
      sections: results().map(d => ({
        id: d.id,
        competency: d.name,
        rolePriority: priorityName(d.priority),
        coverage: d.n,
        total: d.total,
        keyAlignment: d.n === d.total ? d.index : null,
        band: d.band,
        interpretation: interpretation(d),
        interview: d.interview,
        interviewAnchor: d.anchor,
        development: d.action,
        indicator: d.indicator,
        evidence: d.e.map(e => ({
          id: e.q.id,
          title: e.q.title,
          sub: e.q.sub,
          scenario: e.q.scene,
          response: responseText(e.q, e.a),
          score: e.s,
          rationale: reason(e.q, e.a),
        })),
      })),
    });
  if (a === 'exportContent') download('rol-atolyesi-yetkinlik-havuzu-v020.json', C);
  if (a === 'backup') download('rol-atolyesi-oturum.json', { schema: 'rol-atolyesi-session', state });
  if (a === 'reset') {
    if (confirm('Bu tarayıcıdaki cevapları ve bağlam kaydını silmek istiyor musun?')) {
      state = {
        version: C.version,
        context: {
          purpose: 'Gelişim',
          sector: 'Genel iş ortamı',
          team: '6–15 kişi',
          experience: 'Karma deneyim',
          authority: 'Günlük iş ve görev dağılımı',
          code: 'Deneme-01',
        },
        answers: {},
        index: 0,
        completed: false,
      };
      save();
      sample = false;
      nav('setup');
    }
  }
}
function download(name, obj) {
  const blob = new Blob([JSON.stringify(obj, null, 2)], { type: 'application/json' }),
    url = URL.createObjectURL(blob),
    link = document.createElement('a');
  link.href = url;
  link.download = name;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
async function importBackup(e) {
  const file = e.target.files[0];
  if (!file) return;
  try {
    if (file.size > 500000) throw Error('Dosya çok büyük.');
    const obj = JSON.parse(await file.text()),
      s = obj.state;
    if (
      obj.schema !== 'rol-atolyesi-session' ||
      !['0.1.0', '0.2.0', '0.3.0', '0.4.0', C.version].includes(s?.version) ||
      !s.context ||
      !s.answers
    )
      throw Error('Bu sürümle uyumlu bir oturum yedeği değil.');
    for (const [k, v] of Object.entries(s.answers)) {
      const q = C.items.find(q => q.id === k);
      if (
        !q ||
        !(
          done(q, v) ||
          (q.type === 'plan' &&
            Array.isArray(v) &&
            v.length < 2 &&
            v.every(i => Number.isInteger(i) && i >= 0 && i < q.options.length))
        )
      )
        throw Error('Geçersiz yanıt verisi.');
    }
    if (
      !Object.values(s.context).every(v => typeof v === 'string' && v.length <= 100) ||
      !purposeNames.includes(s.context.purpose) ||
      !['code', 'purpose', 'sector', 'team', 'experience', 'authority'].every(
        k => typeof s.context[k] === 'string'
      )
    )
      throw Error('Bağlam bilgisi geçersiz.');
    if (!confirm('Mevcut tarayıcı oturumu bu yedekle değiştirilsin mi?')) return;
    if (s.profile) s.profile = profileOf(s);
    if (s.profile && !validProfile(s.profile)) throw Error('Geçersiz beklenti profili.');
    state = migrateEdition({
      ...s,
      index: Math.max(0, Math.min(activeItems(s).length - 1, Number.isInteger(s.index) ? s.index : 0)),
    });
    save();
    sample = false;
    tab = 'overview';
    nav('report');
  } catch (err) {
    message('İçe aktarılamadı: ' + err.message);
  }
}
if (cache?.version === '0.1.0') {
  const oldIds = ['gelisim', 'delegasyon', 'performans', 'catisma', 'karar', 'plan', 'degisim', 'adalet'];
  state.profile = profileOf(
    state.profile
      ? state
      : {
          profile: {
            roleType: 'team',
            roleTitle: 'Ekip lideri / takım lideri',
            priorities: Object.fromEntries(oldIds.map(id => [id, 2])),
          },
        }
  );
  save();
}
if (state.profile) {
  state.profile = profileOf();
  state.index = Math.min(state.index, Math.max(0, activeItems().length - 1));
  state.completed = activeItems().every(q => done(q, state.answers[q.id]));
}
if (cache && cache.version !== C.version) save();
window.RolEngine = {
  optionOrder,
  migrateEdition,
  activateProfile,
  poolFor,
  roleTemplates,
  raw,
  done,
  results,
  sampleRecord,
  interpretation,
  profileOf,
  activeItems,
  activeDimensions,
  validProfile,
};
render();
