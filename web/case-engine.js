(function (root) {
  'use strict';
  const VERSION = '2.0.0';
  function keyFor(c) {
    return c.id + '@' + c.version;
  }
  function getRecord(records, c) {
    const direct = records?.[keyFor(c)],
      legacy = records?.[c.id];
    return direct?.version === c.version ? direct : legacy?.version === c.version ? legacy : null;
  }
  function resolveRecord(key, a) {
    const c = [...(root.CASE_CATALOG || []), ...(root.CASE_ARCHIVE || [])].find(
      c => c.version === a?.version && (key === c.id || key === keyFor(c))
    );
    if (!c) throw Error('Vaka kaydı bu içerik sürümüyle eşleşmiyor.');
    return c;
  }
  function parseNumber(v) {
    if (v === undefined || v === null || String(v).trim() === '') return null;
    const s = String(v).trim().replace(/\s/g, '');
    if (!/^[+-]?(?:\d+(?:[.,]\d+)?|[.,]\d+)$/.test(s)) return NaN;
    return Number(s.replace(',', '.'));
  }
  function calculate(c, values = {}) {
    return c.numbers.map(n => {
      const raw = values[n.id] ?? '',
        value = parseNumber(raw),
        answered = String(raw).trim() !== '';
      return {
        id: n.id,
        label: n.label,
        expected: n.value,
        unit: n.unit,
        why: n.why,
        tolerance: n.tolerance,
        raw,
        value,
        answered,
        valid: !answered || Number.isFinite(value),
        correct: answered && Number.isFinite(value) && Math.abs(value - n.value) <= n.tolerance + 1e-9,
      };
    });
  }
  function blank(c) {
    return {
      version: c.version,
      answers: {},
      numbers: {},
      updateOpen: false,
      updateAnswer: '',
      ratings: {},
      reflection: '',
    };
  }
  function validateAttempt(c, a) {
    if (
      !a ||
      a.version !== c.version ||
      !a.answers ||
      Array.isArray(a.answers) ||
      !a.numbers ||
      Array.isArray(a.numbers) ||
      typeof a.updateOpen !== 'boolean'
    )
      throw Error('Vaka kaydının sürümü veya biçimi geçersiz.');
    for (const [k, v] of Object.entries(a.answers)) {
      if (
        !/^task\d+$/.test(k) ||
        Number(k.slice(4)) >= c.tasks.length ||
        typeof v !== 'string' ||
        v.length > 8000
      )
        throw Error('Vaka yanıtı geçersiz.');
    }
    for (const [k, v] of Object.entries(a.numbers)) {
      if (!c.numbers.some(n => n.id === k) || typeof v !== 'string' || v.length > 60)
        throw Error('Sayısal yanıt geçersiz.');
    }
    for (const [k, v] of Object.entries(a.ratings || {})) {
      if (!/^\d+$/.test(k) || Number(k) >= c.rubric.length || ![0, 1, 2, 3].includes(v))
        throw Error('Öz inceleme kaydı geçersiz.');
    }
    if (
      typeof (a.updateAnswer || '') !== 'string' ||
      (a.updateAnswer || '').length > 8000 ||
      typeof (a.reflection || '') !== 'string' ||
      (a.reflection || '').length > 8000
    )
      throw Error('Vaka notu geçersiz.');
    if (a.submitted) {
      if (
        a.submitted.version !== c.version ||
        typeof a.submitted.at !== 'string' ||
        !Number.isFinite(Date.parse(a.submitted.at)) ||
        !a.submitted.answers ||
        !a.submitted.numbers ||
        !c.tasks.every(
          (_, i) =>
            typeof a.submitted.answers['task' + i] === 'string' && a.submitted.answers['task' + i].trim()
        )
      )
        throw Error('Vaka teslim kaydı eksik.');
      const copy = { ...a, answers: a.submitted.answers, numbers: a.submitted.numbers, submitted: null };
      validateAttempt(c, copy);
    }
    return true;
  }
  function canSubmit(c, a) {
    return (
      c.tasks.every((_, i) => typeof a.answers?.['task' + i] === 'string' && a.answers['task' + i].trim()) &&
      calculate(c, a.numbers).every(x => x.valid)
    );
  }
  function submit(c, a, at = new Date().toISOString()) {
    if (!canSubmit(c, a)) throw Error('Tüm görev alanlarını tamamla; varsa sayısal girişlerini kontrol et.');
    return {
      ...a,
      submitted: {
        version: c.version,
        at,
        answers: { ...a.answers },
        numbers: { ...a.numbers },
        updateAnswer: a.updateAnswer || '',
      },
    };
  }
  function status(c, a) {
    if (!a) return 'Yeni';
    if (a.submitted) return 'Çözüm teslim edildi';
    return Object.values(a.answers || {}).some(v => v.trim()) ||
      Object.values(a.numbers || {}).some(v => v.trim())
      ? 'Taslak var'
      : 'Yeni';
  }
  root.CaseEngine = {
    VERSION,
    keyFor,
    getRecord,
    resolveRecord,
    parseNumber,
    calculate,
    blank,
    validateAttempt,
    canSubmit,
    submit,
    status,
  };
  if (typeof module !== 'undefined') module.exports = root.CaseEngine;
})(typeof window === 'undefined' ? globalThis : window);
