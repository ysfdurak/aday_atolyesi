(function (root) {
  'use strict';
  const hash = s => {
      let a = 2166136261,
        b = 5381;
      for (let c of s) {
        a = Math.imul(a ^ c.charCodeAt(0), 16777619);
        b = Math.imul(b, 33) ^ c.charCodeAt(0);
      }
      return (a >>> 0).toString(16) + (b >>> 0).toString(16);
    },
    mean = a => a.reduce((s, n) => s + n, 0) / a.length,
    variance = a => {
      let m = mean(a);
      return mean(a.map(x => (x - m) ** 2));
    };
  const blank = () => ({ forms: {}, runs: [] });
  function manifest(questions) {
    return questions.map(q => ({
      id: q.id,
      cat: q.cat,
      type: q.type,
      level: q.level,
      template: q.templateId || q.ruleId || 'engine-v2-' + q.cat + '-' + q.type,
      options: q.options.map(o => hash(o)),
      correct: hash(q.answer),
    }));
  }
  function form(questions, label) {
    let items = manifest(questions);
    if (new Set(items.map(x => x.id)).size !== items.length) throw Error('Formda yinelenen soru var.');
    return {
      id: 'F-' + hash(JSON.stringify(items)),
      label,
      created: Date.now(),
      questions: JSON.parse(JSON.stringify(questions)),
      items,
    };
  }
  function run(form, participant, rows, at = Date.now()) {
    if (!/^[A-Za-z0-9_-]{2,40}$/.test(participant))
      throw Error('İki–kırk karakterlik anonim kod kullan: harf, rakam, alt çizgi veya tire.');
    if (rows.length !== form.items.length) throw Error('Form uzunluğu uyuşmuyor.');
    return {
      version: 1,
      formId: form.id,
      participant: participant.toUpperCase(),
      at,
      items: rows.map((r, i) => ({
        ...form.items[i],
        chosen: r.answer === undefined ? null : hash(r.answer),
        sec: Math.max(0, Math.round(r.sec * 10) / 10),
      })),
    };
  }
  function validate(raw) {
    if (!raw || raw.version !== 1 || !Array.isArray(raw.runs) || raw.runs.length > 200)
      throw Error('Geçerli bir pilot-v1 dosyası gerekli (en fazla 200 oturum).');
    let runs = raw.runs.map(r => {
      if (
        !r ||
        typeof r.formId !== 'string' ||
        !/^F-[a-f0-9]+$/.test(r.formId) ||
        !Number.isFinite(r.at) ||
        !/^[A-Za-z0-9_-]{2,40}$/.test(r.participant) ||
        !Array.isArray(r.items) ||
        r.items.length < 2 ||
        r.items.length > 60
      )
        throw Error('Oturum biçimi geçersiz.');
      let items = r.items.map(i => {
        if (
          !i ||
          typeof i.id !== 'string' ||
          !/^[A-Za-z0-9_.:-]{1,150}$/.test(i.id) ||
          !['num', 'shape', 'verbal', 'attention', 'quant', 'logic'].includes(i.cat) ||
          ![1, 2, 3].includes(i.level) ||
          !Number.isInteger(i.type) ||
          i.type < 0 ||
          i.type > 20 ||
          typeof i.template !== 'string' ||
          !/^[A-Za-z0-9_.:-]{1,150}$/.test(i.template) ||
          !Array.isArray(i.options) ||
          i.options.length < 3 ||
          i.options.length > 6 ||
          i.options.some(x => typeof x !== 'string' || !/^[a-f0-9]{1,20}$/.test(x)) ||
          new Set(i.options).size !== i.options.length ||
          !i.options.includes(i.correct) ||
          (i.chosen !== null && !i.options.includes(i.chosen)) ||
          typeof i.correct === 'boolean' ||
          typeof i.correct !== 'string' ||
          !Number.isFinite(i.sec) ||
          i.sec < 0 ||
          i.sec > 86400
        )
          throw Error('Madde kaydı geçersiz.');
        return {
          id: i.id,
          cat: i.cat,
          type: i.type,
          level: i.level,
          template: i.template,
          options: i.options.slice(),
          correct: i.correct,
          chosen: i.chosen,
          sec: i.sec,
        };
      });
      let expectedId =
        'F-' +
        hash(
          JSON.stringify(
            items.map(({ id, cat, type, level, template, options, correct }) => ({
              id,
              cat,
              type,
              level,
              template,
              options,
              correct,
            }))
          )
        );
      if (r.formId !== expectedId) throw Error('Form kimliği içerikle uyuşmuyor.');
      if (new Set(items.map(i => i.id)).size !== items.length) throw Error('Yinelenen madde kimliği.');
      return { version: 1, formId: r.formId, participant: r.participant.toUpperCase(), at: r.at, items };
    });
    return runs;
  }
  // Correctness is derived from chosen and key; an imported score is never trusted.
  function add(state, runs) {
    let all = [...(state.runs || []), ...runs],
      keys = new Map();
    for (let r of all) {
      let signature = JSON.stringify(
        r.items.map(i => [i.id, i.cat, i.type, i.level, i.template, i.options, i.correct])
      );
      if (keys.has(r.formId) && keys.get(r.formId) !== signature)
        throw Error('Aynı form kimliği altında farklı sorular veya anahtar var.');
      keys.set(r.formId, signature);
    }
    if (all.length > 200)
      throw Error('Bu cihazda en fazla 200 pilot oturumu tutulabilir. Önce veriyi dışa aktar.');
    state.runs = all;
    return runs.length;
  }
  function pearson(x, y) {
    if (x.length < 2) return null;
    let a = mean(x),
      b = mean(y),
      v = 0,
      xx = 0,
      yy = 0;
    for (let i = 0; i < x.length; i++) {
      v += (x[i] - a) * (y[i] - b);
      xx += (x[i] - a) ** 2;
      yy += (y[i] - b) ** 2;
    }
    return xx && yy ? v / Math.sqrt(xx * yy) : null;
  }
  const correct = i => i.chosen !== null && i.chosen === i.correct;
  function stats(runs, indices) {
    let scores = runs.map(r => indices.reduce((n, i) => n + Number(correct(r.items[i])), 0)),
      v = variance(scores),
      sumPQ = indices.reduce((n, i) => {
        let p = mean(runs.map(r => Number(correct(r.items[i]))));
        return n + p * (1 - p);
      }, 0);
    return {
      k: indices.length,
      kr20:
        runs.length >= 20 && indices.length >= 3 && v > 0
          ? (indices.length / (indices.length - 1)) * (1 - sumPQ / v)
          : null,
      mean: mean(scores),
    };
  }
  function analyze(state, formId) {
    let raw = (state.runs || []).filter(r => r.formId === formId).sort((a, b) => a.at - b.at),
      seen = new Set(),
      runs = raw.filter(r => {
        if (seen.has(r.participant)) return false;
        seen.add(r.participant);
        return true;
      });
    if (!runs.length) return { n: 0, duplicates: 0, items: [], scales: [], total: null };
    let n = runs.length,
      items = runs[0].items.map((item, i) => {
        let scope = runs[0].items.map((v, j) => (v.cat === item.cat && j !== i ? j : -1)).filter(j => j >= 0),
          x = runs.map(r => Number(correct(r.items[i]))),
          rest = runs.map(r => scope.reduce((s, j) => s + Number(correct(r.items[j])), 0)),
          frequencies = item.options.map(choice => ({
            choice,
            correct: choice === item.correct,
            count: runs.filter(r => r.items[i].chosen === choice).length,
          }));
        return {
          id: item.id,
          cat: item.cat,
          template: item.template,
          level: item.level,
          p: mean(x),
          answered: runs.filter(r => r.items[i].chosen !== null).length,
          blank: runs.filter(r => r.items[i].chosen === null).length,
          rit: n >= 20 ? pearson(x, rest) : null,
          correctMedian: Assessment.median(runs.filter(r => correct(r.items[i])).map(r => r.items[i].sec)),
          choices: frequencies,
        };
      });
    let scales = Object.keys(Assessment.names).map(cat => {
      let indices = runs[0].items.map((i, j) => (i.cat === cat ? j : -1)).filter(j => j >= 0);
      return { cat, ...(indices.length ? stats(runs, indices) : { k: 0, kr20: null, mean: null }) };
    });
    return {
      n,
      duplicates: raw.length - n,
      items,
      scales,
      total: stats(
        runs,
        runs[0].items.map((_, i) => i)
      ),
    };
  }
  function serialize(state) {
    return JSON.stringify(
      { version: 1, runs: (state.runs || []).map(r => ({ ...r, items: r.items.map(i => ({ ...i })) })) },
      null,
      2
    );
  }
  root.Pilot = { blank, hash, manifest, form, run, validate, add, pearson, analyze, serialize };
})(typeof window === 'undefined' ? globalThis : window);
