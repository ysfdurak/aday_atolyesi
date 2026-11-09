(function (root) {
  'use strict';
  const A = root.AA,
    E = root.CaseEngine,
    L = root.CaseLearning,
    base = A.tasks;
  const order = {
    analyst: ['kpi-paradoksu', 'butce-sapmasi', 'kampanya-karari', 'yatirim-kapasitesi'],
    operations: ['vardiya-darbogazi', 'parti-kalitesi', 'kapasite-ortakligi', 'hizmet-kesintisi'],
    lead: ['geri-bildirim', 'ekip-yuku', 'gelen-kutusu', 'doksan-gun-toparlanma'],
    graduate: ['kpi-paradoksu', 'geri-bildirim', 'gelen-kutusu', 'aday-hunisi'],
    custom: ['kpi-paradoksu', 'gelen-kutusu', 'buyume-formati'],
  };
  const record = (state, c) => E.getRecord(state.assessments || {}, c) || E.blank(c);
  function phase(state, c) {
    const remote = root.PilotProgress?.phase(c.id, c.version);
    if (remote) return remote;
    const a = record(state, c),
      h = L.history(a),
      p = a.learning || {},
      target = (root.CASE_CATALOG || []).find(t => t.id === c.learning?.transfer),
      ta = target && record(state, target);
    if (!a.submitted)
      return {
        id: 'draft',
        title: Object.values(a.answers).some(x => x.trim())
          ? 'Vaka çıktını sürdür'
          : 'Şirket dosyasını incele ve ilk çıktını başlat',
        detail: `${c.company} · Tam çalışma yaklaşık ${c.minutes} dakika. Bugünkü blokta dosya veya çıktının bir bölümünü çalış; teslim bütün çıktılar tamamlanınca yapılır.`,
        href: '#cases/' + c.id,
      };
    if (h.length < 2) {
      const review = (a.reviews || []).some(r => r.submissionId === L.sid(a.submitted)),
        self = !!a.reflection?.trim() || Object.keys(a.ratings || {}).length > 0;
      if (!review && !self)
        return {
          id: 'review',
          title: 'İlk çözümünü incele',
          detail: `${c.company} · Referans ve öz incelemeyi aç veya insan değerlendirmesi iste. Öz inceleme ile değerlendirici görüşü ayrı tutulur.`,
          href: '#cases/' + c.id,
        };
      if (!Object.values(p.practice || {}).some(x => x.trim()))
        return {
          id: 'practice',
          title: 'Geri bildirimden kısa alıştırmaya geç',
          detail: `${c.company} · İnsan değerlendirmesindeki veya öz incelemendeki ihtiyaca uygun alıştırmayı seç. Tamamlanması kalite onayı değildir.`,
          href: '#cases/' + c.id,
        };
      return {
        id: 'revision',
        title: 'Çözümünü gerekçesiyle revize et',
        detail: `${c.company} · Çıktılarını düzenle; neyi neden değiştirdiğini yazıp yeni teslim oluştur. İlk teslim korunur.`,
        href: '#cases/' + c.id,
      };
    }
    if (!p.defense?.trim())
      return {
        id: 'defense',
        title: 'Yeni bilgi karşısında kararını savun',
        detail: `${c.company} · Yeni bilgi kartına göre kararını ve gerekçeni yaz. Bu bölüm yazılı provadır.`,
        href: '#cases/' + c.id,
      };
    if (!p.transfer || p.transfer.sourceId !== L.sid(a.submitted))
      return {
        id: 'transfer',
        title: 'Yeni bağlam çalışmasını başlat',
        detail: `${c.company} · Revizyonun ve savunma notun kayıtlı. Vaka ekranından yeni şirket dosyasına geçerek bağlantıyı kur.`,
        href: '#cases/' + c.id,
      };
    if (target && !L.history(ta).some(s => s.at >= p.transfer.at))
      return {
        id: 'new-context',
        title: 'Yeni şirket dosyasında çalış',
        detail: `${target.company} · ${c.company} çalışmasının ardından yeni bağlamda kendi çözümünü hazırla. Önceki çözümü kopyalamak yerine yeni veriyi kullan.`,
        href: '#cases/' + target.id,
      };
    return {
      id: 'complete',
      title: 'Gelişim döngüsü çalışma kayıtları tamamlandı',
      detail: 'Kalite ve gelişim, teslimlerin dayanaklarıyla ayrıca değerlendirilir.',
      href: '#cases/' + c.id,
    };
  }
  function caseTask(state, date) {
    const p = state.profile;
    if (!p) return null;
    const all = root.CASE_CATALOG || [],
      eligible = all.filter(
        c =>
          c.learning &&
          (p.role === 'custom' || c.roles.includes(p.role) || (p.people && c.roles.includes('lead')))
      );
    for (const remote of root.PilotProgress?.rows() || []) {
      const c = all.find(c => c.id === remote.caseId && c.version === remote.version);
      if (c && !eligible.includes(c)) eligible.push(c);
    }
    const ranked = (order[p.role] || []).map(id => eligible.find(c => c.id === id)).filter(Boolean);
    eligible.forEach(c => {
      if (!ranked.includes(c)) ranked.push(c);
    });
    const open = ranked.filter(c => phase(state, c).id !== 'complete');
    if (!open.length) return null;
    // Existing work stays ahead of a new role suggestion; selection never uses personality scores.
    const active = open.filter(c => {
      const a = record(state, c);
      return (
        root.PilotProgress?.phase(c.id, c.version) ||
        a.submitted ||
        Object.values(a.answers).some(v => v.trim())
      );
    });
    active.sort((a, b) =>
      String(
        root.PilotProgress?.phase(b.id, b.version)?.savedAt ||
          record(state, b).savedAt ||
          record(state, b).submitted?.at ||
          ''
      ).localeCompare(
        String(
          root.PilotProgress?.phase(a.id, a.version)?.savedAt ||
            record(state, a).savedAt ||
            record(state, a).submitted?.at ||
            ''
        )
      )
    );
    const c = active[0] || open[0],
      s = phase(state, c);
    return {
      ...s,
      id: 'case-' + c.id + '-' + s.id + '-' + date,
      caseId: c.id,
      phase: s.id,
      minutes: Math.min(p.minutes, s.id === 'review' && root.PilotProgress?.phase(c.id, c.version) ? 5 : 20),
      done: false,
      evidenceBased: true,
      estimated: true,
    };
  }
  A.casePhase = phase;
  A.caseTask = caseTask;
  A.caseOverview = function (state) {
    const cases = (root.CASE_CATALOG || []).filter(c => c.learning),
      rows = cases.map(c => ({ c, a: record(state, c), remote: root.PilotProgress?.phase(c.id, c.version) }));
    return {
      total: cases.length,
      started: rows.filter(
        ({ a, remote }) => remote || a.submitted || Object.values(a.answers).some(v => v.trim())
      ).length,
      submitted: rows.filter(({ a, remote }) => remote?.submitted || a.submitted).length,
      reviewed: rows.filter(({ a, remote }) => remote?.reviewed || (a.reviews || []).length).length,
      revised: rows.filter(({ a, remote }) => remote?.revised || L.history(a).length > 1).length,
      closed: rows.filter(({ c }) => phase(state, c).id === 'complete').length,
    };
  };
  A.tasks = function (state, s, date = A.today()) {
    if (!state.profile) return [];
    const p = state.profile,
      basic = base(state, s, date).filter(t => !t.id.startsWith('cv-')),
      ct = caseTask(state, date),
      day = Math.max(0, A.days(p.start, date));
    let candidates = basic.slice();
    if (!s.r.completed && !candidates.some(t => t.id.startsWith('role-')))
      candidates.push({
        id: 'role-' + date,
        title: 'Rolüne uygun yetkinlikleri çalış',
        detail:
          'Rol şablonunu seç; yetkinlik önemlerini ve standart/geniş paket kapsamını belirle. Sorular rolüne göre süzülür.',
        href: '/modules/rol/index.html?view=setup',
        minutes: Math.min(20, p.minutes),
        done: false,
        estimated: true,
      });
    if (ct) candidates.push(ct);
    const hasExam = (s.z.sessions || []).some(x => x.mode === 'exam'),
      last = s.report?.at || s.report?.createdAt;
    const near = A.days(date, p.deadline) >= 0 && A.days(date, p.deadline) <= 3;
    if (
      near &&
      hasExam &&
      p.minutes >= 45 &&
      (!last || !Number.isFinite(new Date(last).getTime()) || A.today(new Date(last)) < A.plusDay(date, -2))
    )
      candidates.unshift({
        id: 'rehearsal-' + date,
        title: 'Son dönem sınav provası',
        detail:
          'Hedef tarihine yaklaşıyorsun. Yeni bir denemeyi süre koşullarıyla çöz; farklı setlerin puan farkını tek başına gelişim sayma.',
        href: '/modules/zihin/index.html#exam/graded',
        minutes: 40,
        done: false,
        estimated: true,
      });
    if (ct && day % 3 === 1 && !candidates.some(t => t.id === 'baseline' || t.id.startsWith('rehearsal-')))
      candidates = [ct, ...candidates.filter(t => t !== ct)];
    if (
      ct &&
      ct.phase !== 'draft' &&
      day % 3 === 2 &&
      !candidates.some(t => t.id === 'baseline' || t.id.startsWith('rehearsal-'))
    )
      candidates = [ct, ...candidates.filter(t => t !== ct)];
    // A short rehearsal uses only explicitly selected sources; existing baseline stays first.
    const prep = root.Rehearsal?.readiness(state, s, root.CASE_CATALOG || []);
    if (prep?.pending && (near || day % 3 === 2)) {
      const rehearsal = {
        id: 'rehearsal-note-' + date,
        title: 'Seçtiğin örneği görüşmede anlat',
        detail:
          prep.pending.title +
          ' · Kendi cevabını, takip sorusunu ve sonraki değişikliğini kaydet. Yazılı prova; kalite puanı değildir.',
        href: '#rehearsal',
        minutes: Math.min(10, p.minutes),
        done: false,
        estimated: true,
      };
      const idx = candidates.findIndex(t => t.id === 'baseline' || t.id.startsWith('rehearsal-'));
      candidates.splice(idx < 0 ? 0 : idx + 1, 0, rehearsal);
    }
    // Keep the first full mock intact; other activities are bounded daily work blocks.
    let budget = p.minutes;
    const selected = [];
    for (const t of candidates) {
      if (t.minutes > budget) continue;
      selected.push({ ...t, done: t.done || !!state.checks[t.id] });
      budget -= t.minutes;
    }
    return selected;
  };
})(window);
