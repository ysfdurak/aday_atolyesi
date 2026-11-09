(function (root) {
  'use strict';
  const E = root.CaseEngine,
    originalSubmit = E.submit,
    originalValidate = E.validateAttempt;
  const text = (v, max = 8000) => typeof v === 'string' && v.length <= max;
  const same = (a, b) =>
    JSON.stringify(a.answers) === JSON.stringify(b.answers) &&
    JSON.stringify(a.numbers) === JSON.stringify(b.numbers);
  function sid(s) {
    if (s.id) return s.id;
    let h = 2166136261;
    for (const ch of JSON.stringify([s.at, s.answers, s.numbers]))
      h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
    return s.at + '-' + (h >>> 0).toString(16);
  }
  function history(a) {
    return a.history?.length ? a.history : a.submitted ? [a.submitted] : [];
  }
  function validateSnapshot(c, s) {
    originalValidate(c, { ...E.blank(c), answers: s.answers, numbers: s.numbers, submitted: s });
    if (s.id !== undefined && !text(s.id, 150)) throw Error('Teslim kimliği geçersiz.');
    if (s.note !== undefined && !text(s.note, 3000)) throw Error('Revizyon açıklaması geçersiz.');
  }
  function request(c, a) {
    if (!a.submitted) throw Error('Önce çalışmanı teslim et.');
    return {
      schema: 'aa-review-request-v1',
      caseId: c.id,
      caseVersion: c.version,
      submissionId: sid(a.submitted),
      submission: JSON.parse(JSON.stringify(a.submitted)),
    };
  }
  function validateRequest(p) {
    if (!p || p.schema !== 'aa-review-request-v1') throw Error('Değerlendirme isteği biçimi geçersiz.');
    const c = E.resolveRecord(p.caseId + '@' + p.caseVersion, { version: p.caseVersion });
    if (!c.learning) throw Error('Bu sürüm değerlendirmeye açık değil.');
    validateSnapshot(c, p.submission);
    if (p.submissionId !== sid(p.submission)) throw Error('Teslim kimliği eşleşmiyor.');
    return c;
  }
  function validateReview(c, r, s) {
    if (
      !r ||
      r.schema !== 'aa-human-review-v1' ||
      r.caseId !== c.id ||
      r.caseVersion !== c.version ||
      r.submissionId !== sid(s)
    )
      throw Error('Geri bildirim bu vaka sürümü ve teslimle eşleşmiyor.');
    if (
      !text(r.reviewer, 120) ||
      !r.reviewer.trim() ||
      !text(r.at, 50) ||
      !Number.isFinite(Date.parse(r.at)) ||
      !text(r.summary, 3000) ||
      !r.summary.trim() ||
      !Array.isArray(r.items) ||
      r.items.length !== c.rubric.length
    )
      throw Error('Değerlendirme alanları eksik.');
    const answers = Object.values(s.answers).join('\n');
    r.items.forEach((x, i) => {
      if (
        !x ||
        x.index !== i ||
        ![0, 1, 2, 3].includes(x.rating) ||
        !text(x.quote, 2000) ||
        !text(x.observation, 3000) ||
        !x.observation.trim() ||
        !text(x.next, 3000) ||
        !x.next.trim() ||
        (!x.quote.trim() && x.rating !== 0)
      )
        throw Error('Her ölçüt için düzey, dayanak, gözlem ve sonraki adımı tamamla. Dayanak yoksa 0 seç.');
      if (x.quote.trim() && !answers.includes(x.quote.trim()))
        throw Error('Dayanak alıntısı adayın teslim metninde aynen bulunmalı.');
    });
    return true;
  }
  E.submit = function (c, a, at) {
    const prev = history(a);
    if (prev.length >= 50) throw Error('Bu vakada 50 teslim sınırına ulaştın. Kayıtlarını dışa aktar.');
    if (prev.length && same(prev.at(-1), a)) throw Error('Yeni teslimden önce çözümünde değişiklik yap.');
    if (c.learning && prev.length && !a.learning?.revisionNote?.trim())
      throw Error('Revizyonda neyi, neden değiştirdiğini açıkla.');
    let n = originalSubmit(c, a, at);
    n.submitted = {
      ...n.submitted,
      id: root.crypto?.randomUUID?.() || Date.now().toString(36) + '-' + Math.random().toString(36).slice(2),
      note: a.learning?.revisionNote || '',
    };
    const learning = { ...a.learning, revisionNote: '' };
    if (prev.length && text(a.learning?.defense || '') && a.learning?.defense?.trim()) {
      const sourceId = a.learning.defenseSubmissionId || sid(prev.at(-1));
      learning.defenseHistory = [
        ...(a.learning.defenseHistory || []).filter(x => x.sourceId !== sourceId),
        { sourceId, answer: a.learning.defense },
      ];
      learning.defense = '';
      delete learning.defenseSubmissionId;
    }
    return { ...n, history: [...prev, n.submitted], learning };
  };
  E.validateAttempt = function (c, a) {
    originalValidate(c, a);
    if (a.history !== undefined) {
      if (!Array.isArray(a.history) || !a.history.length || a.history.length > 50)
        throw Error('Teslim geçmişi geçersiz.');
      const ids = new Set();
      for (const s of a.history) {
        validateSnapshot(c, s);
        if (ids.has(sid(s))) throw Error('Tekrarlı teslim kimliği.');
        ids.add(sid(s));
      }
      if (!a.submitted || JSON.stringify(a.history.at(-1)) !== JSON.stringify(a.submitted))
        throw Error('Son teslim ile geçmiş eşleşmiyor.');
    }
    if (a.learning !== undefined) {
      const l = a.learning;
      if (!l || Array.isArray(l) || !text(l.revisionNote || '', 3000) || !text(l.defense || ''))
        throw Error('Gelişim kaydı geçersiz.');
      if (
        l.defenseSubmissionId !== undefined &&
        (!text(l.defenseSubmissionId, 150) || !history(a).some(s => sid(s) === l.defenseSubmissionId))
      )
        throw Error('Savunma teslimi bulunamadı.');
      if (
        l.defenseHistory !== undefined &&
        (!Array.isArray(l.defenseHistory) ||
          l.defenseHistory.length > 50 ||
          l.defenseHistory.some(x => !x || !text(x.answer) || !history(a).some(s => sid(s) === x.sourceId)))
      )
        throw Error('Savunma geçmişi geçersiz.');
      if (
        l.transferHistory !== undefined &&
        (!Array.isArray(l.transferHistory) ||
          l.transferHistory.length > 50 ||
          l.transferHistory.some(
            x =>
              !x ||
              !text(x.at, 50) ||
              !Number.isFinite(Date.parse(x.at)) ||
              x.caseId !== c.learning?.transfer ||
              !history(a).some(s => sid(s) === x.sourceId)
          ))
      )
        throw Error('Aktarım geçmişi geçersiz.');
      if (l.practice !== undefined) {
        if (!l.practice || Array.isArray(l.practice)) throw Error('Alıştırma kaydı geçersiz.');
        for (const [k, v] of Object.entries(l.practice)) {
          if (!/^\d+$/.test(k) || !c.learning?.drills[Number(k)] || !text(v))
            throw Error('Alıştırma yanıtı geçersiz.');
        }
      }
      if (l.transfer !== undefined) {
        if (
          !c.learning ||
          l.transfer.caseId !== c.learning.transfer ||
          !text(l.transfer.at, 50) ||
          !Number.isFinite(Date.parse(l.transfer.at)) ||
          !history(a).some(s => sid(s) === l.transfer.sourceId)
        )
          throw Error('Yeni vaka bağlantısı geçersiz.');
      }
    }
    if (a.reviews !== undefined) {
      if (!Array.isArray(a.reviews) || a.reviews.length > 50) throw Error('Geri bildirim geçmişi geçersiz.');
      const seen = new Set();
      for (const r of a.reviews) {
        const s = history(a).find(s => sid(s) === r.submissionId);
        if (!s || seen.has(r.submissionId)) throw Error('Geri bildirim teslimi bulunamadı veya tekrarlı.');
        validateReview(c, r, s);
        seen.add(r.submissionId);
      }
    }
    return true;
  };
  function attach(c, a, r) {
    const s = history(a).find(s => sid(s) === r?.submissionId);
    if (!s) throw Error('Bu geri bildirimin ait olduğu teslim kayıtlarında yok.');
    validateReview(c, r, s);
    if ((a.reviews || []).some(x => x.submissionId === r.submissionId))
      throw Error('Bu teslim için değerlendirme zaten kayıtlı.');
    return { ...a, reviews: [...(a.reviews || []), JSON.parse(JSON.stringify(r))] };
  }
  root.CaseLearning = { sid, history, request, validateRequest, validateReview, attach };
})(typeof window === 'undefined' ? globalThis : window);
