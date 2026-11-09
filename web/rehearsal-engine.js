(function (root) {
  'use strict';
  const clean = v => (typeof v === 'string' ? v.trim() : ''),
    limit = 100;
  function sources(state, snapshot, catalog) {
    const d = root.Evidence.build(state, snapshot, catalog);
    return [
      ...d.examples.map(e => ({
        key: 'example:' + e.id,
        title: e.title,
        type: e.sourceType,
        href: '#examples',
        body: JSON.stringify({
          title: e.title,
          topic: e.topic,
          kind: e.kind,
          ...Object.fromEntries(root.Evidence.fields.map(([id]) => [id, e[id]])),
          tradeoff: e.tradeoff,
        }),
        question:
          '“' + e.title + '” örneğinde durum neydi, sen ne yaptın ve sonucu neye dayanarak söylüyorsun?',
        followup:
          e.openQuestions[0]?.question ||
          'Kendi katkını ekipten ve dış koşullardan nasıl ayırıyorsun? Hangi alternatif karar mümkün olurdu?',
        gaps: e.openQuestions.map(p => p.question),
      })),
      ...d.cases.map(c => ({
        key: 'case:' + c.key,
        title: c.title,
        type: c.sourceType,
        href: '#cases/' + c.key.split('@')[0],
        body: JSON.stringify({ version: c.version, submittedAt: c.submittedAt, outputs: c.outputs }),
        question:
          '“' +
          c.title +
          '” çalışmasında mevcut durumu nasıl tanımladın; hangi kararı, hangi verilerle savunuyorsun?',
        followup:
          c.humanFeedback[0]?.items[0]?.next ||
          'Kararının en kritik varsayımı değişirse hangi seçeneğe dönersin? Bunu hangi veriyle kontrol edersin?',
        gaps: c.humanFeedback.length
          ? []
          : ['Bu son teslime bağlı insan görüşü yok; kararın ve dayanağın ayrıca incelenebilir.'],
      })),
      ...(d.files || []).map(f => ({
        key: 'file:' + f.id,
        title: f.title,
        type: f.sourceType,
        href: '#file-work/' + f.submissionId,
        body: JSON.stringify({
          version: f.caseVersion,
          submittedAt: f.submittedAt,
          outputs: f.outputs,
          remaining: f.remaining,
        }),
        question:
          '“' +
          f.title +
          '” dosyandaki kararını ve kendi dayanağını anlat. Bu bir kurgusal vaka çalışmasıdır.',
        followup: 'Dosyadaki referansların kararını nasıl destekliyor? Açık kalan kontrolün ne?',
        gaps: [f.note],
      })),
    ];
  }
  function find(state, source) {
    return (state.rehearsal?.records || []).find(
      r =>
        r.key === source.key &&
        r.source === source.body &&
        r.question === source.question &&
        r.followup === source.followup
    );
  }
  function update(state, source, values, at = new Date().toISOString()) {
    const records = state.rehearsal?.records || [],
      old = find(state, source);
    if (!old && records.length >= limit)
      throw Error('100 prova kaydı sınırına ulaştın. Önce yedeğini indir; kullanmadığın provayı kaldır.');
    const r = {
      ...(old || {
        id: root.AA.uuid(),
        key: source.key,
        source: source.body,
        title: source.title,
        type: source.type,
        question: source.question,
        followup: source.followup,
        rounds: [],
      }),
      answer: values.answer || '',
      followupAnswer: values.followupAnswer || '',
      reflection: values.reflection || '',
      updatedAt: at,
    };
    const next = {
      ...state,
      rehearsal: {
        ...state.rehearsal,
        selected: source.key,
        records: old ? records.map(x => (x.id === old.id ? r : x)) : [...records, r],
      },
    };
    validate(next);
    return next;
  }
  function complete(state, source, values, at) {
    let next = update(state, source, values, at),
      r = find(next, source);
    if (![r.answer, r.followupAnswer, r.reflection].every(clean))
      throw Error('Cevabını, takip sorusunu ve yeniden denemede değiştireceğin noktayı yaz.');
    if (r.rounds.length >= 5)
      throw Error(
        'Bu kaynağa bağlı beş deneme kaydedildi. Notlarını inceleyebilir veya yeni bir örnek seçebilirsin.'
      );
    const last = r.rounds.at(-1);
    if (last && ['answer', 'followupAnswer', 'reflection'].every(k => last[k] === r[k]))
      throw Error('Yeni deneme için cevabında veya kontrol notunda neyi değiştirdiğini yaz.');
    r.rounds = [
      ...r.rounds,
      {
        answer: r.answer,
        followupAnswer: r.followupAnswer,
        reflection: r.reflection,
        at: at || new Date().toISOString(),
      },
    ];
    validate(next);
    return next;
  }
  function validate(state) {
    const p = state.rehearsal;
    if (p === undefined) return true;
    const str = (v, n) => typeof v === 'string' && v.length <= n,
      date = v => typeof v === 'string' && Number.isFinite(Date.parse(v));
    if (
      !p ||
      Array.isArray(p) ||
      typeof p !== 'object' ||
      (p.selected !== undefined && !str(p.selected, 220)) ||
      !Array.isArray(p.records) ||
      p.records.length > limit
    )
      throw Error('Prova kaydı geçersiz.');
    const ids = new Set();
    for (const r of p.records) {
      if (
        !r ||
        ids.has(r.id) ||
        !str(r.id, 100) ||
        !str(r.key, 220) ||
        !str(r.source, 70000) ||
        !str(r.title, 250) ||
        !str(r.type, 200) ||
        !str(r.question, 1500) ||
        !str(r.followup, 4500) ||
        !date(r.updatedAt) ||
        !Array.isArray(r.rounds) ||
        r.rounds.length > 5
      )
        throw Error('Prova kaynağı veya geçmişi geçersiz.');
      ids.add(r.id);
      let source;
      try {
        source = JSON.parse(r.source);
      } catch {
        throw Error('Prova kaynak metni okunamadı.');
      }
      if (!source || typeof source !== 'object' || Array.isArray(source))
        throw Error('Prova kaynağı geçersiz.');
      for (const a of [r, ...r.rounds]) {
        for (const [k, n] of [
          ['answer', 6000],
          ['followupAnswer', 6000],
          ['reflection', 3000],
        ])
          if (!str(a[k], n)) throw Error('Prova metni sınırı aşıldı.');
        if (a !== r && (!date(a.at) || ![a.answer, a.followupAnswer, a.reflection].every(clean)))
          throw Error('Prova denemesi eksik.');
      }
    }
    return true;
  }
  function readiness(state, snapshot, catalog) {
    const ss = sources(state, snapshot, catalog);
    return {
      selected: ss.length,
      practiced: ss.filter(s => find(state, s)?.rounds.length).length,
      gaps: ss.flatMap(s => s.gaps.map(question => ({ title: s.title, question, href: s.href }))),
      pending: ss.find(s => !find(state, s)?.rounds.length),
    };
  }
  root.Rehearsal = { sources, find, update, complete, validate, readiness };
})(typeof window === 'undefined' ? globalThis : window);
