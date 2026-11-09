(function (root) {
  'use strict';
  const KEY = 'aa-state-v1';
  const roles = {
    analyst: { name: 'İş / süreç analisti', focus: 'quant', mizac: 'analyst', lead: false },
    operations: { name: 'Operasyon uzmanı', focus: 'attention', mizac: 'operations', lead: false },
    lead: { name: 'Ekip lideri / yönetici', focus: 'logic', mizac: 'lead', lead: true },
    graduate: { name: 'Yeni mezun / ilk iş', focus: 'verbal', mizac: 'general', lead: false },
    custom: { name: 'Diğer / özel hedef', focus: 'num', mizac: 'general', lead: false },
  };
  const names = {
    num: 'Sayısal mantık',
    shape: 'Görsel muhakeme',
    verbal: 'Sözel muhakeme',
    attention: 'Dikkat ve veri kontrolü',
    quant: 'Sayısal veri analizi',
    logic: 'Analitik mantık',
  };
  function today(now = new Date()) {
    return new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Istanbul' }).format(now);
  }
  function plusDay(date, n) {
    let d = new Date(date + 'T12:00:00Z');
    d.setUTCDate(d.getUTCDate() + n);
    return d.toISOString().slice(0, 10);
  }
  function days(a, b) {
    return Math.round((new Date(b + 'T12:00Z') - new Date(a + 'T12:00Z')) / 86400000);
  }
  function blank() {
    return { schema: 1, profile: null, examples: [], checks: {}, cv: {}, assessments: {}, started: today() };
  }
  function read(storage, key, fallback) {
    try {
      return JSON.parse(storage.getItem(key)) ?? fallback;
    } catch {
      return fallback;
    }
  }
  function snapshot(storage) {
    const z = read(storage, 'zp-data-v1', {}),
      m = read(storage, 'mizac-v2', {}),
      r = read(storage, 'rol-atolyesi-v1', {}),
      contract = root.MODULE_CONTRACTS;
    const validLikert = v => Number.isInteger(v) && v >= 1 && v <= 5,
      ids = contract?.mizac.ids;
    m.complete =
      !!m.complete &&
      !m.demo &&
      Object.keys(m.answers || {}).length === 96 &&
      (ids
        ? ids.every(id => validLikert(m.answers[id]))
        : Object.values(m.answers || {}).every(validLikert)) &&
      Object.keys(m.scenarios || {}).length === 6 &&
      Array.from({ length: 6 }, (_, i) => m.scenarios[i]).every(
        v => Number.isInteger(v) && v >= 0 && v < 4
      ) &&
      Array.isArray(m.motives) &&
      m.motives.length === 2 &&
      new Set(m.motives).size === 2 &&
      m.motives.every(v => Number.isInteger(v) && v >= 0 && v < 6);
    if (contract?.role) {
      const c = contract.role,
        p = r.profile || {
          roleType: 'team',
          priorities: Object.fromEntries(c.dimensions.map(id => [id, 2])),
        },
        active = c.items.filter(
          q =>
            q.roles.includes(p.roleType) &&
            (!q.positions ||
              q.positions.includes(p.positionId) ||
              (!p.positionId && p.roleType === 'custom')) &&
            p.priorities[q.dim] > 0 &&
            (p.depth === 'full' || q.core)
        );
      const done = q => {
        const a = r.answers?.[q.id];
        return ['plan', 'rank'].includes(q.type)
          ? Array.isArray(a) &&
              a.length === (q.type === 'plan' ? 2 : q.options) &&
              new Set(a).size === a.length &&
              a.every(v => Number.isInteger(v) && v >= 0 && v < q.options)
          : Number.isInteger(a) && a >= 0 && a < q.options;
      };
      r.activeAnswered = r.version === c.version ? active.filter(done).length : 0;
      r.activeTotal = active.length;
      r.activeCompetencies = new Set(active.map(q => q.dim)).size;
      r.needsUpdate = !!Object.keys(r.answers || {}).length && r.version !== c.version;
      r.completed =
        !!r.completed && r.version === c.version && active.length > 0 && r.activeAnswered === active.length;
    }
    return { z, m, r, report: (z.reports || []).filter(x => !x.sample).at(-1) || null };
  }

  function focus(s, p) {
    const ds = s.report?.domains?.filter(d => d.answered >= 3) || [];
    return ds.length
      ? [...ds].sort((a, b) => a.correct / a.total - b.correct / b.total)[0].id
      : roles[p?.role]?.focus || 'num';
  }
  function tasks(state, s, date = today()) {
    const p = state.profile;
    if (!p) return [];
    const day = days(p.start, date),
      lead = roles[p.role].lead || p.people,
      cat = focus(s, p),
      tasks = [];
    if (!(s.z.sessions || []).some(x => x.mode === 'exam') && p.minutes < 40 && !state.checks.orientation)
      tasks.push({
        id: 'orientation',
        title: 'Sınav yönergesini ve örnekleri incele',
        detail: 'Bugünkü zamanına uygun kısa başlangıç. Tam deneme için ayrıca 40 dakika ayır.',
        href: '/modules/zihin/index.html#orientation',
        minutes: 10,
        done: false,
      });
    else if (!(s.z.sessions || []).some(x => x.mode === 'exam') && p.minutes >= 40)
      tasks.push({
        id: 'baseline',
        title: 'Başlangıç denemeni çöz',
        detail: '36 soru · 40 dakika. Sonuçların sonraki çalışma odağını belirleyecek.',
        href: '/modules/zihin/index.html#exam/graded',
        minutes: 40,
        done: false,
      });
    else
      tasks.push({
        id: 'practice-' + date,
        title: names[cat] + ' çalış',
        detail: s.report
          ? 'Son denemede yeterli yanıt bulunan alanlar arasındaki daha düşük doğru/toplam oranına göre.'
          : 'Hedef rolüne göre başlangıç önerisi; henüz bir zayıflık tespiti değil.',
        href: '/modules/zihin/index.html#train/' + cat,
        minutes: 15,
        done: (s.z.answers || []).filter(a => a.cat === cat && today(new Date(a.at)) === date).length >= 6,
      });
    if (!s.m.complete)
      tasks.push({
        id: 'preferences',
        title: 'Çalışma tercihlerini keşfet',
        detail: '96 ifade ve 6 senaryo. Bölerek tamamlayabilirsin; süre sınırı yok.',
        href: '/modules/mizac/index.html',
        minutes: Math.min(25, p.minutes),
        done: false,
      });
    else
      tasks.push({
        id: 'example-' + date,
        title: 'Bir deneyimini somutlaştır',
        detail:
          'Gerçek bir olaydan kendi eylemini ve sonucunu yaz. İş, eğitim, gönüllülük veya proje olabilir.',
        href: '#examples',
        minutes: 15,
        done: state.examples.some(e => e.date === date && e.situation && e.action && e.result),
      });
    if (lead)
      tasks.push({
        id: 'role-' + date,
        title: 'Liderlik kararlarını çalış',
        detail:
          'Beklentileri seç ve senaryoları incele. Ortak insan yönetimi içeriği; teknik rol testi değildir.',
        href: '/modules/rol/index.html',
        minutes: 20,
        done: !!s.r.completed,
      });
    else
      tasks.push({
        id: 'cv-' + date,
        title: 'İlan ile deneyimini eşleştir',
        detail: 'Gerçek deneyimini iş ilanındaki beklentilerle karşılaştır; eksik bilgiyi belirle.',
        href: '#cv',
        minutes: 15,
        done: !!state.cv.reviewedAt && today(new Date(state.cv.reviewedAt)) === date,
      });
    if (day % 3 === 1 && !s.m.complete && tasks.length > 1) {
      let i = tasks.findIndex(t => t.id === 'preferences');
      if (i > 0) tasks.unshift(tasks.splice(i, 1)[0]);
    }
    if (day % 3 === 2 && lead && tasks.length > 1) {
      let i = tasks.findIndex(t => t.id.startsWith('role-'));
      if (i > 0) tasks.unshift(tasks.splice(i, 1)[0]);
    }
    let budget = p.minutes,
      chosen = [];
    for (let t of tasks) {
      if (chosen.length && budget < t.minutes) continue;
      chosen.push(t);
      budget -= t.minutes;
      if (budget <= 0) break;
    }
    return chosen.map(t => ({ ...t, done: t.done || !!state.checks[t.id], estimated: true }));
  }
  function validProfile(p) {
    return (
      p &&
      (!p.positionId || !!root.Positions?.get(p.positionId)) &&
      (!p.seniority || !!root.Positions?.levels[p.seniority]) &&
      roles[p.role] &&
      typeof p.title === 'string' &&
      p.title.trim().length > 0 &&
      p.title.length <= 100 &&
      [15, 30, 45, 60, 90].includes(p.minutes) &&
      /^\d{4}-\d{2}-\d{2}$/.test(p.start) &&
      /^\d{4}-\d{2}-\d{2}$/.test(p.deadline) &&
      days(p.start, p.deadline) >= 0 &&
      days(p.start, p.deadline) <= 365 &&
      typeof p.people === 'boolean' &&
      typeof p.employed === 'boolean' &&
      typeof p.job === 'string' &&
      p.job.length <= 12000
    );
  }
  const keys = [
    KEY,
    'aa-position-v1',
    'zp-data-v1',
    'zp-session-v1',
    'zp-previous-session',
    'mizac-v2',
    'rol-atolyesi-v1',
    'rol-atolyesi-profile-events-v1',
  ];
  function validateBackup(b) {
    if (
      !b ||
      b.schema !== 'aday-atolyesi-backup-v1' ||
      !b.values ||
      typeof b.values !== 'object' ||
      Array.isArray(b.values) ||
      !b.values[KEY]
    )
      throw Error('Bu bir Aday Atölyesi yedeği değil.');
    function safe(x, depth = 0) {
      if (depth > 28) throw Error('Yedek iç içe veri sınırını aşıyor.');
      if (
        typeof x === 'string' &&
        /<\s*(script|iframe|object|embed|link|meta|style|base|form)\b|\bon[a-z]+\s*=|javascript\s*:|data\s*:\s*text\/html/i.test(
          x
        )
      )
        throw Error('Yedekte etkin HTML içeriği bulundu.');
      if (x && typeof x === 'object')
        for (const [k, v] of Object.entries(x)) {
          if (['__proto__', 'constructor', 'prototype'].includes(k)) throw Error('Geçersiz veri anahtarı.');
          safe(v, depth + 1);
        }
    }
    for (const [k, v] of Object.entries(b.values)) {
      if (!keys.includes(k) || typeof v !== 'string' || v.length > 12000000)
        throw Error('Yedekte desteklenmeyen alan var.');
      let x;
      try {
        x = JSON.parse(v);
      } catch {
        throw Error('Yedekte geçersiz JSON var.');
      }
      safe(x);
      if (
        k === KEY &&
        (!x ||
          x.schema !== 1 ||
          !Array.isArray(x.examples) ||
          !x.checks ||
          !x.cv ||
          (x.profile && !validProfile(x.profile)) ||
          x.examples.some(
            e =>
              !e ||
              !['id', 'title', 'topic', 'situation', 'action', 'result', 'date'].every(
                f => typeof e[f] === 'string'
              )
          ))
      )
        throw Error('Aday profili geçersiz.');
      if (k === KEY) {
        const optional = ['source', 'alternative', 'learning', 'tradeoff', 'kind', 'updatedAt'];
        if (
          x.examples.some(e =>
            optional.some(
              f =>
                e[f] !== undefined &&
                (typeof e[f] !== 'string' || e[f].length > (['kind', 'updatedAt'].includes(f) ? 100 : 3000))
            )
          )
        )
          throw Error('Deneyim ayrıntıları geçersiz.');
        if (x.fileEvidence !== undefined) {
          if (!Array.isArray(x.fileEvidence) || x.fileEvidence.length > 100)
            throw Error('Dosya özetleri geçersiz.');
          for (const f of x.fileEvidence) {
            if (
              !f ||
              ![
                'id',
                'ownerId',
                'caseId',
                'caseVersion',
                'title',
                'submissionId',
                'submittedAt',
                'capturedAt',
                'remaining',
              ].every(k => typeof f[k] === 'string' && f[k].length <= (k === 'remaining' ? 3000 : 250)) ||
              !Array.isArray(f.outputs) ||
              f.outputs.length < 1 ||
              f.outputs.length > 10 ||
              f.outputs.some(
                o =>
                  !o ||
                  typeof o.label !== 'string' ||
                  o.label.length > 1000 ||
                  typeof o.answer !== 'string' ||
                  !o.answer.trim() ||
                  o.answer.length > 3000 ||
                  typeof o.reference !== 'string' ||
                  !o.reference.trim() ||
                  o.reference.length > 1200
              )
            )
              throw Error('Dosya özeti veya dayanak referansı geçersiz.');
          }
        }
        if (x.dossier !== undefined) {
          const d = x.dossier;
          if (
            !d ||
            Array.isArray(d) ||
            !['exampleIds', 'caseKeys'].every(
              k =>
                Array.isArray(d[k]) &&
                d[k].length <= 1000 &&
                d[k].every(v => typeof v === 'string' && v.length <= 200)
            ) ||
            (d.fileIds !== undefined &&
              (!Array.isArray(d.fileIds) ||
                d.fileIds.length > 100 ||
                d.fileIds.some(v => typeof v !== 'string' || v.length > 200))) ||
            typeof d.includeModules !== 'boolean' ||
            (d.includeGrowth !== undefined && typeof d.includeGrowth !== 'boolean')
          )
            throw Error('Mülakat dosyası seçimi geçersiz.');
        }
        if (x.drafts !== undefined) {
          if (!x.drafts || Array.isArray(x.drafts)) throw Error('Taslak kaydı geçersiz.');
          for (const [kind, d] of Object.entries(x.drafts)) {
            if (
              !['profile', 'example'].includes(kind) ||
              (d !== null &&
                (typeof d !== 'object' ||
                  Array.isArray(d) ||
                  Object.values(d).some(
                    v =>
                      !['string', 'boolean', 'number'].includes(typeof v) ||
                      (typeof v === 'string' && v.length > 12000)
                  )))
            )
              throw Error('Taslak alanı geçersiz.');
          }
        }
      }
      if (k === KEY && x.rehearsal !== undefined) {
        if (!root.Rehearsal) throw Error('Prova motoru bulunamadı.');
        root.Rehearsal.validate(x);
      }
      if (k === KEY && x.growth !== undefined) {
        if (!root.GrowthEngine) throw Error('Gelişim motoru bulunamadı.');
        root.GrowthEngine.validateState(x, root.CASE_CATALOG || []);
      }
      if (k === KEY && x.assessments) {
        if (typeof x.assessments !== 'object' || Array.isArray(x.assessments))
          throw Error('Vaka kayıtları geçersiz.');
        for (const [id, a] of Object.entries(x.assessments)) {
          if (!root.CaseEngine) throw Error('Vaka motoru bulunamadı.');
          const c = root.CaseEngine.resolveRecord(id, a);
          root.CaseEngine.validateAttempt(c, a);
        }
      }
      if (k === 'zp-data-v1' && x.errorReviews !== undefined) {
        const notes = x.errorReviews;
        if (!notes || Array.isArray(notes) || typeof notes !== 'object' || Object.keys(notes).length > 300)
          throw Error('Hata defteri geçersiz.');
        for (const [key, n] of Object.entries(notes))
          if (
            key.length > 300 ||
            !n ||
            !['reportId', 'itemId', 'reason', 'method', 'check', 'at'].every(
              f => typeof n[f] === 'string' && n[f].length <= 3000
            ) ||
            !['unknown', 'reading', 'rule', 'calculation', 'time'].includes(n.reason)
          )
            throw Error('Hata defteri notu geçersiz.');
      }
      if (k === 'mizac-v2' && x.preferenceEvidence !== undefined) {
        const notes = x.preferenceEvidence;
        if (!notes || Array.isArray(notes) || typeof notes !== 'object' || Object.keys(notes).length > 80)
          throw Error('Tercih gözlem notları geçersiz.');
        for (const [key, items] of Object.entries(notes)) {
          if (
            key.length > 200 ||
            !items ||
            Array.isArray(items) ||
            typeof items !== 'object' ||
            Object.keys(items).length > 8
          )
            throw Error('Tercih bağlamı geçersiz.');
          for (const [id, n] of Object.entries(items))
            if (
              !['plan', 'detail', 'voice', 'collab', 'initiative', 'evidence', 'change', 'pace'].includes(
                id
              ) ||
              !n ||
              !['example', 'counterexample', 'support', 'experiment', 'observed', 'at'].every(
                f => typeof n[f] === 'string' && n[f].length <= 3000
              )
            )
              throw Error('Tercih gözlem alanı geçersiz.');
        }
      }
      if (k === 'rol-atolyesi-v1' && x.reasoning !== undefined) {
        const notes = x.reasoning;
        if (!notes || Array.isArray(notes) || typeof notes !== 'object' || Object.keys(notes).length > 1000)
          throw Error('Rol gerekçe kayıtları geçersiz.');
        for (const [key, n] of Object.entries(notes))
          if (
            key.length > 700 ||
            !n ||
            ['reason', 'condition', 'qid', 'positionId', 'at'].some(
              f => n[f] !== undefined && (typeof n[f] !== 'string' || n[f].length > 3000)
            )
          )
            throw Error('Rol gerekçe alanı geçersiz.');
      }
      if (
        k === 'zp-data-v1' &&
        (!x ||
          !Array.isArray(x.answers) ||
          !Array.isArray(x.sessions) ||
          !Array.isArray(x.seen) ||
          !Array.isArray(x.reports || []) ||
          x.answers.some(a => !a || !names[a.cat] || !Number.isFinite(a.at)) ||
          (x.reports || []).some(
            r =>
              !r ||
              !r.overall ||
              !Array.isArray(r.domains) ||
              !r.domains.every(d => d && typeof d.id === 'string' && Number.isFinite(d.total))
          ))
      )
        throw Error('Sınav kayıtları geçersiz.');
      if (
        k === 'mizac-v2' &&
        (!x ||
          !x.answers ||
          !x.scenarios ||
          !Array.isArray(x.motives) ||
          !Number.isInteger(x.step) ||
          x.step < 0 ||
          x.step > 13 ||
          Object.values(x.answers).some(a => !Number.isInteger(a) || a < 1 || a > 5) ||
          Object.values(x.scenarios).some(a => !Number.isInteger(a) || a < 0 || a > 3))
      )
        throw Error('Tercih formu geçersiz.');
      if (k === 'aa-position-v1' && (!root.Positions || !root.Positions.valid(x)))
        throw Error('Pozisyon seçimi geçersiz.');
      if (
        k === 'rol-atolyesi-v1' &&
        (!x ||
          !['0.1.0', '0.2.0', '0.3.0', '0.4.0', '0.4.1'].includes(x.version) ||
          !x.context ||
          !x.answers ||
          !Number.isInteger(x.index) ||
          (x.profile &&
            (!x.profile.priorities ||
              !Object.values(x.profile.priorities).every(n => [0, 1, 2].includes(n)))))
      )
        throw Error('Rol oturumu geçersiz.');
    }
    return b.values;
  }
  function uuid() {
    if (root.crypto?.randomUUID) return root.crypto.randomUUID();
    const bytes = new Uint8Array(16);
    root.crypto.getRandomValues(bytes);
    bytes[6] = (bytes[6] & 15) | 64;
    bytes[8] = (bytes[8] & 63) | 128;
    const hex = Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('');
    return (
      hex.slice(0, 8) +
      '-' +
      hex.slice(8, 12) +
      '-' +
      hex.slice(12, 16) +
      '-' +
      hex.slice(16, 20) +
      '-' +
      hex.slice(20)
    );
  }
  root.AA = {
    uuid,
    KEY,
    roles,
    names,
    today,
    plusDay,
    days,
    blank,
    read,
    snapshot,
    focus,
    tasks,
    validProfile,
    keys,
    validateBackup,
  };
  if (typeof module !== 'undefined') module.exports = root.AA;
})(typeof window === 'undefined' ? globalThis : window);
