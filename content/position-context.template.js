(function (root) {
  'use strict';
  const KEY = 'aa-position-v1',
    levels = {
      entry: 'Başlangıç / yeni mezun',
      experienced: 'Deneyimli uzman',
      senior: 'Kıdemli / başuzman',
      lead: 'Yönetim kapsamı',
    };
  const positions = POSITION_DATA;
  function get(id) {
    return positions.find(p => p.id === id) || null;
  }
  function valid(p) {
    return (
      p &&
      p.schema === 1 &&
      get(p.positionId) &&
      levels[p.seniority] &&
      (!get(p.positionId).people || p.seniority === 'lead')
    );
  }
  function load(storage) {
    try {
      const own = JSON.parse(storage.getItem(KEY));
      if (valid(own)) return own;
      const profile = JSON.parse(storage.getItem('aa-state-v1'))?.profile;
      if (get(profile?.positionId))
        return {
          schema: 1,
          positionId: profile.positionId,
          seniority: get(profile.positionId).people ? 'lead' : profile.seniority || 'entry',
        };
    } catch {}
    return null;
  }
  function save(storage, p) {
    if (!valid(p)) throw Error('Pozisyon ve kıdem seçimini kontrol et.');
    storage.setItem(KEY, JSON.stringify(p));
    return p;
  }
  function priorities(id, dimensions) {
    const pos = get(id);
    return Object.fromEntries(
      dimensions.map(d => [
        d.id,
        pos?.focus.includes(d.id)
          ? 2
          : pos?.people &&
              [
                'gelisim',
                'delegasyon',
                'performans',
                'catisma',
                'karar',
                'plan',
                'adalet',
                'iletisim',
              ].includes(d.id)
            ? 1
            : !pos?.people && ['karar', 'plan', 'iletisim', 'adalet', 'ogrenme'].includes(d.id)
              ? 1
              : 0,
      ])
    );
  }
  function recommendation(context, answers = [], now = Date.now()) {
    const pos = get(context?.positionId);
    if (!pos) return null;
    const base = ['senior', 'lead'].includes(context.seniority) ? 2 : 1;
    const domains = pos.domains.map(id => {
      const all = answers
          .filter(
            a =>
              a.cat === id &&
              !a.sample &&
              !a.synthetic &&
              !a.hinted &&
              a.mode === 'learn' &&
              Number.isInteger(a.level) &&
              a.level >= 1 &&
              a.level <= 3 &&
              typeof a.correct === 'boolean' &&
              Number.isFinite(a.at) &&
              now - a.at >= 0 &&
              now - a.at <= 30 * 86400000
          )
          .sort((a, b) => a.at - b.at)
          .slice(-60),
        current = all.at(-1)?.level || base,
        atLevel = all.filter(a => a.level === current).slice(-24);
      let level = current,
        reason = all.length
          ? 'Son çalıştığın düzey korunuyor; değiştirmek için henüz yeterli ipucusuz yanıt yok.'
          : 'Pozisyon ve kıdeme göre başlangıç önerisi; henüz yeterli çalışma kanıtı yok.';
      if (atLevel.length >= 24) {
        const rate = atLevel.filter(a => a.correct).length / atLevel.length;
        if (rate >= 0.85) {
          level = Math.min(3, current + 1);
          reason = 'Son 24 ipucusuz öğrenme yanıtında en az %85 doğruluk; bir üst düzeyi deneme önerisi.';
        } else if (rate < 0.55) {
          level = Math.max(1, current - 1);
          reason =
            'Son 24 ipucusuz öğrenme yanıtında %55 altında doğruluk; temel yaklaşımı pekiştirme önerisi.';
        } else reason = 'Son 24 ipucusuz öğrenme yanıtına göre mevcut düzeyde çalışma önerisi.';
      }
      return { id, level, n: atLevel.length, reason };
    });
    return {
      position: pos,
      seniority: context.seniority,
      domains,
      level: Math.max(1, Math.min(3, Math.round(domains.reduce((n, d) => n + d.level, 0) / domains.length))),
      note: 'Tasarlanmış hazırlık önerisidir; mesleğin gerçek sınavı, yetenek düzeyi veya işe uygunluk ölçümü değildir. Zaman baskısı düzey kararına katılmaz.',
    };
  }
  root.Positions = { KEY, positions, levels, get, valid, load, save, priorities, recommendation };
  if (typeof module !== 'undefined') module.exports = root.Positions;
})(typeof window === 'undefined' ? globalThis : window);
