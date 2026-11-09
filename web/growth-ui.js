(function (root) {
  'use strict';
  const G = root.GrowthEngine,
    s = s =>
      String(s ?? '').replace(
        /[&<>"']/g,
        c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]
      );
  const link = (href, label) => `<a class="btn" href="${href}">${s(label)} →</a>`,
    date = t => new Date(t).toLocaleString('tr-TR', { timeZone: 'Europe/Istanbul' });
  let account = { status: 'idle', rows: [], userId: null },
    accountRequest = 0;
  root.addEventListener?.('hashchange', () => {
    if (location.hash.split('/')[0] !== '#growth') {
      accountRequest++;
      account = { status: 'idle', rows: [], userId: null };
    }
  });
  function current() {
    return G.priorities(
      state,
      AA.snapshot(localStorage),
      root.CASE_CATALOG,
      root.RESPONSE_DATA,
      account.rows,
      account.userId
    );
  }
  function accountPanel() {
    const latest = new Map();
    for (const r of account.rows) {
      const key = r.case_id + '@' + r.version;
      if (!latest.has(key)) latest.set(key, r);
    }
    const pending = [...latest.values()].filter(r => !r.feedback).length;
    return `<section class="card"><h2>Dosya teslimlerimin geri bildirimleri</h2><p>Hesabındaki son PDF, Word veya Excel teslimine yazılmış insan görüşünü getir. Dosya içeriği otomatik okunmaz; alıntı doğrulaması metinle yapılan teslimler için kullanılabilir.</p><button id="growth-load-files" ${account.status === 'loading' ? 'disabled' : ''}>${account.status === 'loading' ? 'Getiriliyor…' : 'Dosya geri bildirimlerimi getir'}</button><p role="status">${account.status === 'ready' ? account.rows.length + ' dosya kaydı incelendi. ' + (pending ? 'Son tesliminde geri bildirim beklenen ' + pending + ' vaka var; eski görüşler yeni cevaba aktarılmadı.' : '') : account.status === 'auth' ? 'Hesabım ve teslimler alanından giriş yaptıktan sonra tekrar dene.' : account.status === 'error' ? 'Geri bildirimler getirilemedi. Mevcut cihaz kayıtların korunuyor; tekrar deneyebilirsin.' : ''}</p>${link('#pilot', 'Hesabım ve teslimler')}</section>`;
  }

  function fields(obj, rows) {
    return rows
      .map(
        ([name, label, max = 3000]) =>
          `<label class="field">${label}<textarea name="${name}" maxlength="${max}" rows="3">${s(obj?.[name] || '')}</textarea></label>`
      )
      .join('');
  }
  function priority(p, i) {
    const note = state.growth?.actions?.[p.id];
    return `<article class="card growth-priority"><span class="num">${i + 1}. ÇALIŞMA · ${s(p.origin)}</span><h3>${s(p.title)}</h3>${p.context ? `<p>${s(p.context)}</p>` : ''}<h4>${s(p.evidenceLabel || 'Kendi yanıtındaki dayanak')}</h4><blockquote>${s(p.evidence || 'Bu alanda henüz yazılmış dayanak yok.')}</blockquote><p>${s(p.explanation)}</p>${p.scope ? `<p class="muted">${s(p.scope)}</p>` : ''}<section class="growth-task"><h4>Şimdi dene</h4><p>${s(p.action)}</p><p><b>Kontrolün:</b> ${s(p.check)}</p></section><div class="actions">${p.exampleId ? `<button data-growth-example="${s(p.exampleId)}">Bu örneği düzenle</button>` : link(p.href, 'Kaynak yanıtı aç')}</div>${p.drill ? `<details><summary>İlgili kısa alıştırmayı aç</summary><p>${s(p.drill.prompt)}</p><p class="muted">Kendi yaklaşımını aşağıya yaz; referansı kayıttan sonra incele.</p></details>` : ''}<form data-growth-action="${s(p.id)}">${fields(
      note,
      [
        ['answer', 'Kısa çalışmam · taslak olarak korunur', 5000],
        ['check', 'Neyi nasıl kontrol ettim?', 5000],
        ['nextTrial', 'Yeni örnekte neyi sınayacağım?', 5000],
      ]
    )}<button>Çalışma notumu kaydet</button><p data-growth-save role="status">${note?.at ? 'Kayıtlı çalışma notun var. Bu, başarının doğrulandığı anlamına gelmez.' : ''}</p></form>${p.drill && note?.at ? `<details><summary>Kaydından sonra referansı incele</summary><p>${s(p.drill.reference)}</p></details>` : ''}</article>`;
  }
  function rubricOptions(c, current) {
    return (
      '<option value="">Ölçüt seç</option>' +
      c.rubric
        .map((r, i) => `<option value="${i}" ${current === i ? 'selected' : ''}>${s(r.name)}</option>`)
        .join('')
    );
  }
  function comparison(c, a) {
    const p = G.pair(c, a);
    if (!p)
      return `<article class="card"><h3>${s(c.title)}</h3><p>İlk ve son çözümü karşılaştırmak için gerekçeli bir revizyon teslim et. İlk teslimin korunur.</p>${link('#cases/' + c.id, 'Çalışmaya dön')}</article>`;
    const key = G.comparisonKey(c, p),
      committed = state.growth?.comparisons?.[key],
      draft = state.growth?.drafts?.[key],
      n = draft?.values || committed,
      outputs = G.compareOutputs(c, a),
      reviews = (a.reviews || []).filter(r => r.submissionId === p.fromId || r.submissionId === p.toId);
    return `<article class="card growth-comparison"><h3>${s(c.title)}</h3><p>${date(p.first.at)} → ${date(p.last.at)} · ${outputs.filter(x => x.changed).length}/${outputs.length} çıktı metni değişmiş. Metin değişimi tek başına gelişim kanıtı değildir.</p><details><summary>İlk ve son metni incele</summary>${outputs.map(x => `<h4>${s(x.label)} · ${x.changed ? 'metin değişmiş' : 'aynı metin'}</h4><div class="grid2"><section><b>İlk teslim</b><div class="quote">${s(x.before)}</div></section><section><b>Son teslim</b><div class="quote">${s(x.after)}</div></section></div>`).join('')}</details>${reviews.length ? `<details><summary>Bu teslimlere bağlı insan görüşleri</summary>${reviews.map(r => `<h4>${r.submissionId === p.fromId ? 'İlk' : 'Son'} teslime ait · ${s(r.reviewer)}</h4><p>${s(r.summary)}</p>${r.items.map(i => `<p><b>${s(c.rubric[i.index].name)}:</b> ${s(i.observation)}</p><blockquote>${s(i.quote || 'Alıntı yok')}</blockquote><p>${s(i.next)}</p>`).join('')}`).join('')}</details>` : '<p>Bu iki teslime bağlı insan incelemesi henüz yok. Aşağıdaki karşılaştırma kendi yorumundur.</p>'}<form data-growth-comparison="${s(c.id)}" data-growth-draft-key="${s(key)}"><label class="field">Hangi ölçütteki değişimi açıklıyorsun?<select name="criterion" required>${rubricOptions(c, n?.criterion === '' ? -1 : Number(n?.criterion))}</select></label><label class="check"><input name="firstMissing" type="checkbox" ${n?.firstMissing ? 'checked' : ''}>İlk yanıtımda bu ölçüt için gösterilebilir dayanak yoktu.</label>${fields(
      n,
      [
        ['firstQuote', 'İlk teslimden bire bir alıntı · dayanak yoksa boş bırak', 1500],
        ['lastQuote', 'Son teslimden bire bir alıntı', 1500],
        ['reason', 'Neyi, hangi geri bildirim veya gerekçeyle değiştirdim?'],
        ['remaining', 'Hangi varsayım veya kontrol hâlâ açık?'],
      ]
    )}<p class="muted">Alıntı metni ilgili teslimde aynen bulunmalı. İçerik kalitesini insan incelemesiyle ayrıca değerlendirebilirsin.</p><button>Değişim notunu kaydet</button><p data-growth-save role="status">${draft ? 'Bu teslim çifti için taslağın korunuyor.' : committed ? 'Bu teslim çifti için öz karşılaştırman kayıtlı.' : ''}</p></form></article>`;
  }
  function transferView(c) {
    const p = G.transferPair(state, c, root.CASE_CATALOG);
    if (!p) return '';
    const key = CaseEngine.keyFor(c) + '|' + p.fromId + '|' + CaseEngine.keyFor(p.target) + '|' + p.toId,
      committed = state.growth?.transfers?.[key],
      draft = state.growth?.drafts?.[key],
      n = draft?.values || committed;
    return `<article class="card"><span class="num">YENİ BAĞLAMDA AYNI İLKEYİ ARAŞTIR</span><h3>${s(c.company)} → ${s(p.target.company)}</h3><p>Yeni vaka teslimi bağlantı tarihinden sonra yapılmış. İki farklı vaka kalibre edilmiş eşdeğer testler değildir; puan artışı hesaplanmaz.</p><details><summary>Bağlı iki teslimi incele</summary><div class="grid2"><section><h4>Kaynak vaka · ${s(c.title)}</h4>${c.tasks.map((t, i) => `<h4>${s(t)}</h4><div class="quote">${s(p.first.answers['task' + i])}</div>`).join('')}</section><section><h4>Yeni vaka · ${s(p.target.title)}</h4>${p.target.tasks.map((t, i) => `<h4>${s(t)}</h4><div class="quote">${s(p.last.answers['task' + i])}</div>`).join('')}</section></div></details><form data-growth-transfer="${s(c.id)}" data-growth-draft-key="${s(key)}"><div class="formgrid"><label class="field">Kaynak vakadaki ölçüt<select name="sourceCriterion" required>${rubricOptions(c, n?.sourceCriterion === '' ? -1 : Number(n?.sourceCriterion))}</select></label><label class="field">Yeni vakadaki ölçüt<select name="targetCriterion" required>${rubricOptions(p.target, n?.targetCriterion === '' ? -1 : Number(n?.targetCriterion))}</select></label></div>${fields(
      n,
      [
        ['sourceQuote', 'Kaynak teslimden bire bir alıntı', 1500],
        ['targetQuote', 'Yeni teslimden bire bir alıntı', 1500],
        ['adaptation', 'Aynı ilkeyi yeni koşulda nasıl uyarladım?'],
        ['limit', 'Bu aktarım için neyi henüz doğrulayamadım?'],
      ]
    )}<button>Aktarım dayanağımı kaydet</button><p data-growth-save role="status">${draft ? 'Bağlı teslimler için taslağın korunuyor.' : committed ? 'Bu iki teslime bağlı öz karşılaştırman kayıtlı.' : ''}</p></form></article>`;
  }
  function pathway() {
    const t = G.trackFor(state);
    return `<section class="card growth-track"><span class="eyebrow">20 pozisyon için hazırlık yolu · içerik önerisi</span><h2>Pozisyon beklentisinden uygulamaya</h2><label class="field">İncelemek istediğin hazırlık yolu<select id="growth-track"><option value="">Bir yol seç</option>${G.tracks.map(x => `<option value="${x.id}" ${x.id === t?.id ? 'selected' : ''}>${x.name}</option>`).join('')}</select></label><p class="muted">Yol seçimi hedef pozisyonunu veya soru yanıtlarını değiştirmez. ${!t ? 'Diğer pozisyonlar için genel çalışma araçlarını kullanabilirsin.' : ''}</p>${t ? `<h3>${s(t.goal)}</h3><p>Bu yol mevcut kurgusal vakaları pozisyon beklentileriyle ilişkilendirir; mesleki norm veya teknik uzmanlık sınavı değildir.</p><ul>${t.expectations.map(e => `<li>${s(e)}</li>`).join('')}</ul>${root.SENIORITY_EXPECTATIONS ? `<h4>Hedef ayarlarındaki kıdem / sorumluluk odağın</h4><ul>${(root.SENIORITY_EXPECTATIONS[state.profile?.seniority] || root.SENIORITY_EXPECTATIONS.entry).map(x => `<li>${s(x)}</li>`).join('')}</ul>` : ''}<p><b>Hazırlayacağın çıktı:</b> ${s(t.work)}</p><div class="growth-path"><section><span>01</span><h4>Rol beklentilerini çalış</h4><p>Pozisyonunu ve yetkinlik kapsamını seç; gerekçeli kararlarını incele.</p>${link('/modules/rol/index.html?view=setup', 'Rol paketini aç')}</section><section><span>02</span><h4>İlk vaka → inceleme → revizyon</h4><p>Önce kendi çözümünü teslim et. Sonra ilgili geri bildirim veya öz inceleme üzerinden iki çalışma seç; gerekçeli revizyon yap.</p>${link('#cases/' + t.first, 'İlk şirket dosyasını aç')}</section><section><span>03</span><h4>Yeni bilgi ve yeni bağlam</h4><p>İlk vaka ekranında son kararını savun, yeni bağlam bağlantısını kur ve yeni şirket dosyasında çalış. Buradaki notlarla iki teslimi karşılaştır.</p>${link('#cases/' + t.first, 'Bağlantı ve savunma adımına dön')}</section></div><details><summary>Bu pozisyon için mülakat provası</summary><ol>${t.interview.map(q => `<li>${s(q)}</li>`).join('')}</ol></details>` : ''}</section>`;
  }
  function view() {
    const snapshot = AA.snapshot(localStorage),
      ps = current(),
      ss = G.strengths(snapshot, root.RESPONSE_DATA),
      submitted = root.CASE_CATALOG.flatMap(c => {
        const a = CaseEngine.getRecord(state.assessments, c);
        return a?.submitted ? [{ c, a }] : [];
      }).sort((x, y) => Date.parse(y.a.submitted.at) - Date.parse(x.a.submitted.at)),
      selected = submitted.find(x => x.c.id === state.growth?.caseId) || submitted[0];
    return `<span class="eyebrow">Yanıt → dayanak → çalışma → yeni uygulama</span><h1>Neyi, neden<br><em>çalışacağını gör.</em></h1><p class="muted">Öncelik sırası: güncel teslime bağlı insan görüşü, rol seçimi, ipucusuz deneme yanıtı, yazılmamış deneyim alanı. Yeterli kayıt varsa en fazla iki çalışma alanı önerilir; farklı kaynakların puanları toplanmaz.</p>${snapshot.r.needsUpdate ? '<div class="note">Rol yanıtların eski içerik sürümüne ait. Yeni içerikle çalışmadan bu yanıtlar analiz edilmez.</div>' : ''}${accountPanel()}<h2>Önce bu iki çalışma</h2>${ps.length ? `<div class="grid2">${ps.map(priority).join('')}</div>` : `<section class="empty"><h3>Henüz kişisel çalışma dayanağı yok.</h3><p>Rol senaryolarını veya gerçek bir denemeyi yanıtla; bir deneyim örneği yaz. Otomatik güçlü/zayıf alan uydurulmaz.</p>${link('/modules/rol/index.html?view=setup', 'Rol çalışmasına başla')}${link('#examples', 'Deneyim örneği yaz')}</section>`}<section style="margin-top:25px"><h2>Bu seçimlerde görülen dayanaklar</h2>${ss.length ? `<div class="grid">${ss.map(x => `<article class="card"><span class="num">${s(x.title)}</span><h3>${s(x.context)}</h3><blockquote>${s(x.quote)}</blockquote><p>${s(x.explanation)}</p><p class="muted">${s(x.note)}</p></article>`).join('')}</div>` : '<p>Güncel rol paketinde yorumlanabilir destekleyici yanıt henüz yok. Eksik kayıt, eksik yetkinlik anlamına gelmez.</p>'}</section>${pathway()}<section class="growth-section"><h2>İlk çözümümden son çözümüme</h2><p class="muted">Aynı vaka sürümündeki teslimler karşılaştırılır. Önceki karşılaştırmalar kayıtlarda korunur; yeni teslim için yeni not açılır.</p>${submitted.length ? `<label class="field">İncelemek istediğin vaka<select id="growth-case">${submitted.map(x => `<option value="${s(x.c.id)}" ${x.c.id === selected.c.id ? 'selected' : ''}>${s(x.c.title)}</option>`).join('')}</select></label>${comparison(selected.c, selected.a)}` : '<div class="empty">Metinle teslim ettiğin ilk vaka burada görünür. Hesaba yüklenen PDF/Word/Excel dosyalarının içeriği otomatik okunmaz; onları Hesabım ve teslimler alanından inceleyebilirsin.</div>'}</section><section class="growth-section"><h2>Yeni vakada nasıl kullandım?</h2>${(selected && transferView(selected.c)) || '<p>Bir kaynak vakada revizyon ve savunmadan sonra yeni bağlam bağlantısını kur. Bağlantıdan sonra yapılan yeni vaka teslimi burada görünür.</p>'}</section><div class="actions">${link('#dossier', 'Seçtiğim örnekleri mülakat dosyasına taşı')}${link('#pilot', 'Dosya teslimleri ve pilot geri bildirimi')}</div>`;
  }
  function commit(field, key, value, form) {
    const before = state.growth;
    const drafts = { ...before?.drafts };
    if (form.dataset.growthDraftKey) delete drafts[form.dataset.growthDraftKey];
    state.growth = { ...before, drafts, [field]: { ...before?.[field], [key]: value } };
    try {
      G.validateState(state, root.CASE_CATALOG);
      if (!save()) throw Error('Cihaza kaydedilemedi. Metnin ekranda korunuyor.');
      form.querySelector('[data-growth-save]').textContent = 'Kaydedildi. Bu kayıt kendi çalışma yorumundur.';
    } catch (err) {
      state.growth = before;
      form.querySelector('[data-growth-save]').textContent = err.message;
    }
  }
  function bind() {
    if (!document.getElementById('growth-track')) return;
    document.getElementById('growth-load-files').onclick = async () => {
      const attempt = ++accountRequest;
      if (root.PilotProgress?.status() === 'guest') {
        account = { status: 'auth', rows: [], userId: null };
        render({ preserveScroll: true });
        return;
      }
      account = { status: 'loading', rows: [], userId: null };
      render({ preserveScroll: true });
      const controller = new AbortController(),
        timer = setTimeout(() => controller.abort(), 15000);
      try {
        const response = await fetch('/api/pilot?op=my-feedback', {
          credentials: 'same-origin',
          cache: 'no-store',
          signal: controller.signal,
        });
        if (attempt !== accountRequest) return;
        if (response.status === 401) {
          account = { status: 'auth', rows: [], userId: null };
        } else {
          if (!response.ok) throw Error('fetch');
          const data = await response.json();
          if (attempt !== accountRequest) return;
          if (typeof data.userId !== 'string' || !Array.isArray(data.rows)) throw Error('format');
          account = { status: 'ready', rows: data.rows, userId: data.userId };
        }
      } catch {
        if (attempt !== accountRequest) return;
        account = { status: 'error', rows: [], userId: null };
      } finally {
        clearTimeout(timer);
        if (location.hash.split('/')[0] === '#growth') render({ preserveScroll: true });
      }
    };
    document.getElementById('growth-track').onchange = e => {
      const value = e.target.value,
        prior = state.growth;
      state.growth = { ...prior, trackId: value || undefined };
      if (save()) render({ preserveScroll: true });
    };
    document.getElementById('growth-case')?.addEventListener('change', e => {
      state.growth = { ...state.growth, caseId: e.target.value };
      if (save()) render({ preserveScroll: true });
    });
    document.querySelectorAll('[data-growth-draft-key]').forEach(form =>
      form.addEventListener('input', () => {
        const values = Object.fromEntries(new FormData(form));
        if (form.hasAttribute('data-growth-comparison'))
          values.firstMissing = form.elements.firstMissing.checked;
        state.growth = {
          ...state.growth,
          drafts: { ...state.growth?.drafts, [form.dataset.growthDraftKey]: { values } },
        };
        form.querySelector('[data-growth-save]').textContent = save()
          ? 'Taslak bu cihaza kaydedildi. Karşılaştırmayı kaydettiğinde alıntılar kontrol edilir.'
          : 'Taslak kaydedilemedi; metni bu ekranda koru.';
      })
    );
    document.querySelectorAll('[data-growth-example]').forEach(
      b =>
        (b.onclick = () => {
          const e = state.examples.find(x => x.id === b.dataset.growthExample);
          if (!e) return;
          state.drafts = {
            ...state.drafts,
            example: { ...e, editingId: e.id, kind: e.kind || 'unspecified' },
          };
          if (save()) location.hash = 'examples';
        })
    );
    document.querySelectorAll('[data-growth-action]').forEach(form => {
      const id = form.dataset.growthAction;
      form.addEventListener('input', () => {
        const f = Object.fromEntries(new FormData(form));
        commit(
          'actions',
          id,
          { answer: f.answer || '', check: f.check || '', nextTrial: f.nextTrial || '' },
          form
        );
      });
      form.onsubmit = e => {
        e.preventDefault();
        const f = Object.fromEntries(new FormData(form));
        if (!f.answer?.trim() || !f.check?.trim() || !f.nextTrial?.trim()) {
          form.querySelector('[data-growth-save]').textContent =
            'Çalışmanı, kontrolünü ve yeni denemeni tamamla.';
          return;
        }
        commit('actions', id, { ...f, at: new Date().toISOString() }, form);
      };
    });
    document.querySelectorAll('[data-growth-comparison]').forEach(form => {
      const checkbox = form.elements.firstMissing,
        quote = form.elements.firstQuote;
      quote.disabled = checkbox.checked;
      checkbox.onchange = () => {
        quote.disabled = checkbox.checked;
        if (checkbox.checked) quote.value = '';
        form.dispatchEvent(new Event('input', { bubbles: true }));
      };
    });
    document.querySelectorAll('[data-growth-comparison]').forEach(
      form =>
        (form.onsubmit = e => {
          e.preventDefault();
          try {
            const c = root.CASE_CATALOG.find(c => c.id === form.dataset.growthComparison),
              a = CaseEngine.getRecord(state.assessments, c),
              p = G.pair(c, a),
              f = new FormData(form),
              n = {
                caseKey: CaseEngine.keyFor(c),
                fromId: p.fromId,
                toId: p.toId,
                criterion: f.get('criterion') === '' ? -1 : Number(f.get('criterion')),
                firstMissing: f.get('firstMissing') === 'on',
                firstQuote: String(f.get('firstQuote') || '').trim(),
                lastQuote: String(f.get('lastQuote') || '').trim(),
                reason: String(f.get('reason') || '').trim(),
                remaining: String(f.get('remaining') || '').trim(),
                at: new Date().toISOString(),
              };
            G.validateComparison(c, a, n);
            commit('comparisons', G.comparisonKey(c, p), n, form);
          } catch (err) {
            form.querySelector('[data-growth-save]').textContent = err.message;
          }
        })
    );
    document.querySelectorAll('[data-growth-transfer]').forEach(
      form =>
        (form.onsubmit = e => {
          e.preventDefault();
          try {
            const c = root.CASE_CATALOG.find(c => c.id === form.dataset.growthTransfer),
              p = G.transferPair(state, c, root.CASE_CATALOG),
              f = new FormData(form),
              n = {
                caseKey: CaseEngine.keyFor(c),
                targetKey: CaseEngine.keyFor(p.target),
                fromId: p.fromId,
                toId: p.toId,
                linkedAt: p.linkedAt,
                sourceCriterion: f.get('sourceCriterion') === '' ? -1 : Number(f.get('sourceCriterion')),
                targetCriterion: f.get('targetCriterion') === '' ? -1 : Number(f.get('targetCriterion')),
                ...Object.fromEntries(
                  ['sourceQuote', 'targetQuote', 'adaptation', 'limit'].map(k => [
                    k,
                    String(f.get(k) || '').trim(),
                  ])
                ),
                at: new Date().toISOString(),
              };
            G.validateTransfer(p, n);
            commit('transfers', n.caseKey + '|' + n.fromId + '|' + n.targetKey + '|' + n.toId, n, form);
          } catch (err) {
            form.querySelector('[data-growth-save]').textContent = err.message;
          }
        })
    );
  }
  root.GrowthUI = { view, bind };
})(window);
