(function (root) {
  'use strict';
  const cat = () => root.CASE_CATALOG;
  const level = n => ['', 'Temel', 'Orta', 'İleri'][n];
  function getCase() {
    const parts = location.hash.split('/'),
      id = parts[1];
    return parts[2] === 'v'
      ? (root.CASE_ARCHIVE || []).find(c => c.id === id && c.version === parts[3])
      : cat().find(c => c.id === id);
  }
  function draft(c) {
    return CaseEngine.getRecord(state.assessments, c) || CaseEngine.blank(c);
  }
  function previous(c) {
    return (root.CASE_ARCHIVE || [])
      .slice()
      .reverse()
      .find(old => old.id === c.id && CaseEngine.getRecord(state.assessments, old));
  }
  function commit(c, a) {
    state.assessments = state.assessments || {};
    const k = CaseEngine.keyFor(c),
      prior = state.assessments[k];
    state.assessments[k] = a;
    if (save()) return true;
    if (prior === undefined) delete state.assessments[k];
    else state.assessments[k] = prior;
    return false;
  }
  function summary() {
    const rows = cat().map(c => ({ c, a: CaseEngine.getRecord(state.assessments, c) }));
    return {
      submitted: rows.filter(x => x.a?.submitted || root.PilotProgress?.phase(x.c.id, x.c.version)?.submitted)
        .length,
      drafts: rows.filter(x => CaseEngine.status(x.c, x.a) === 'Taslak var').length,
      total: rows.length,
      archived: (root.CASE_ARCHIVE || []).filter(c => CaseEngine.getRecord(state.assessments, c)).length,
    };
  }
  function list() {
    const s = summary(),
      docs = cat().reduce((n, c) => n + c.docs.length, 0),
      tables = cat().reduce((n, c) => n + c.docs.filter(d => d.headers.length).length, 0);
    return `<span class="eyebrow">Assessment Atölyesi / Özgün sentetik vakalar</span><section class="hero casehero"><div><h1>Bilgiyi incele.<br><em>Kararını savun.</em></h1><p class="muted">${s.total} vaka, üç zorluk düzeyi. Kurgusal şirketlerin bilgi dosyalarını incele ve istenen çıktıları hazırla.</p><div class="pillrow"><span>${docs} aday belgesi</span><span>${tables} veri tablosu</span><span>Şirket ve iç yazışma dosyaları</span></div></div><div class="focus"><span class="eyebrow">Çöz → karşılaştır → yeniden düşün</span><h2>Önce kendi yaklaşımını yaz.</h2><p>Çözümünü teslim ettiğinde referans hesaplar ve alternatif yaklaşımlar açılır. Açık uçlu yanıtların otomatik puanlanmaz.</p><b>${s.submitted} / ${s.total} çözüm teslim edildi · ${s.drafts} taslak</b>${s.archived ? `<p>${s.archived} önceki sürüm çalışması arşivde korunuyor.</p>` : ''}</div></section><div class="note"><b>Yeni / Strateji ve şirketi toparlama:</b> Şube yeri, pazara giriş, nakit krizi, ürün portföyü, 90 günlük aksiyon, kapasite ortaklığı, müşteri kaybı ve büyük sözleşme kararları. Stratejik vakalarda birden fazla seçenek, tutarlı varsayım ve risk koşullarıyla savunulabilir.</div><div class="casefilters"><label class="field full">Vakalarda ara<input id="caseSearch" type="search" placeholder="Şirket, başlık veya konu"></label><label class="field">Düzey<select id="caseLevel"><option value="">Tüm düzeyler</option value="1">Temel</option><option value="2">Orta</option><option value="3">İleri</option></select></label><label class="field">Çalışma biçimi<select id="caseKind"><option value="">Tüm biçimler</option>${[...new Set(cat().map(c => c.kind))].map(k => `<option>${esc(k)}</option>`).join('')}</select></label><label class="field">Rol grubu<select id="caseRole"><option value="">Tüm roller</option>${Object.entries(
      AA.roles
    )
      .map(([id, r]) => `<option value="${id}">${r.name}</option>`)
      .join(
        ''
      )}</select></label><label class="field">Çalışma durumum<select id="caseStatus"><option value="">Tüm durumlar</option><option value="draft">Devam eden / taslak</option><option value="submitted">Teslimi olan</option><option value="new">Henüz başlamadığım</option></select></label><button id="caseResetFilters" type="button">Filtreleri temizle</button></div><div class="actions"><a class="btn ghost" href="/cases/assessment-aday-paketleri.zip" download>Tüm Word, Excel ve veri dosyalarını indir · ZIP</a></div><div class="sectionhead"><h2>Vaka havuzu</h2><span id="caseCount">${s.total} vaka</span></div><div class="grid casegrid" id="caseList">${cat()
      .slice()
      .sort((a, b) => Number(b.kind === 'Stratejik karar') - Number(a.kind === 'Stratejik karar'))
      .map(card)
      .join(
        ''
      )}</div><div class="note">Düzeyler içerik tasarımına dayanır; kalibre edilmiş zorluk veya aday yüzdelik dilimi değildir. Vakalar kurgusaldır; sonuçları gerçek iş deneyimi olarak CV’ye ekleme. Çalışmalar bu tarayıcıda saklanır ve ortak yedeğe dahil edilir.</div>`;
  }
  function card(c) {
    const a = draft(c),
      remote = root.PilotProgress?.phase(c.id, c.version),
      status =
        a.submitted || remote?.submitted
          ? 'submitted'
          : CaseEngine.status(c, a) === 'Taslak var' || remote
            ? 'draft'
            : 'new';
    return `<article class="card casecard" data-case-card="${c.id}" data-search="${esc((c.title + ' ' + c.company + ' ' + c.brief + ' ' + c.kind).toLocaleLowerCase('tr-TR'))}" data-status="${status}" data-level="${c.level}" data-kind="${esc(c.kind)}" data-roles="${c.roles.join(',')}"><div class="casecardtop"><span class="num">${level(c.level)} · ${c.minutes} DK</span><span class="tag">${remote ? esc(remote.title) : CaseEngine.status(c, CaseEngine.getRecord(state.assessments, c))}</span></div><h3>${esc(c.title)}</h3><p>${esc(c.brief)}</p><small>${c.kind} · ${c.docs.length} belge · ${c.tasks.length} çıktı</small><div class="actions">${link('#cases/' + c.id, a.submitted ? 'Çalışmamı aç' : 'Dosyayı aç', true)}${previous(c) ? link('#cases/' + c.id + '/v/' + previous(c).version, 'Önceki çalışmam') : ''}</div></article>`;
  }
  function documents(c) {
    return c.docs
      .map(
        (d, i) =>
          `<details class="case-document" ${i === 0 ? 'open' : ''}><summary><span class="num">${d.code || 'BELGE ' + (i + 1)}</span> ${esc(d.title)}</summary>${d.text
            .split(/\n\s*\n/)
            .map(t => `<p>${esc(t)}</p>`)
            .join(
              ''
            )}${d.headers.length ? `<div class="tablewrap"><table><thead><tr>${d.headers.map(h => `<th>${esc(h)}</th>`).join('')}</tr></thead><tbody>${d.rows.map(r => `<tr>${r.map(x => `<td>${typeof x === 'number' ? x.toLocaleString('tr-TR', { maximumFractionDigits: 4 }) : esc(x)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>${d.file ? `<a class="btn ghost" href="${d.file}" download>Veri tablosunu indir · CSV</a>` : ''}` : ''}</details>`
      )
      .join('');
  }
  function archived(c, a) {
    return `<div class="caseback"><a href="#cases/${c.id}">← Güncel şirket dosyası</a><span class="tag">Arşiv · ${c.version}</span></div><h1 class="casetitle">${esc(c.title)}</h1><div class="note">Bu, önceki içerik sürümündeki çalışmandır. Yanıtların ve o sırada kullanılan belgeler korunur. Arşiv salt okunurdur.</div><p>${esc(c.brief)}</p><div class="card">${documents({ ...c, docs: c.docs.map(d => ({ ...d, file: null })) })}</div><section class="card" style="margin-top:20px"><h2>Kaydedilmiş yanıtların</h2>${c.tasks.map((t, i) => `<h3>${esc(t)}</h3><div class="quote">${esc((a.submitted?.answers || a.answers)['task' + i] || 'Yanıt yok')}</div>`).join('')}${Object.keys(a.numbers || {}).length ? `<h3>Sayısal alan kayıtları</h3>${c.numbers.map(n => `<p>${esc(n.label)}: ${esc((a.submitted?.numbers || a.numbers)[n.id] || '—')}</p>`).join('')}` : ''}${a.updateAnswer ? `<h3>Ek bilgi notun</h3><div class="quote">${esc(a.updateAnswer)}</div>` : ''}${a.reflection ? `<h3>Çalışma notun</h3><div class="quote">${esc(a.reflection)}</div>` : ''}</section>${a.submitted ? `<details class="card"><summary>Bu sürümün referans incelemesi</summary><ol>${c.solution.map(t => `<li>${esc(t)}</li>`).join('')}</ol></details>` : ''}`;
  }
  function detail(c) {
    const a = draft(c),
      remote = root.PilotProgress?.phase(c.id, c.version);
    if (c.version !== cat().find(x => x.id === c.id)?.version) return archived(c, a);
    const old = previous(c);
    return `<div class="caseback no-print"><a href="#cases">← Vaka havuzu</a><span class="tag">${level(c.level)} · ${c.minutes} dk</span></div><span class="eyebrow">${esc(c.company)} / Aday dosyası ${c.version}</span><h1 class="casetitle">${esc(c.title)}</h1><p class="casebrief">${esc(c.brief)}</p>${old ? `<div class="note">Önceki sürümdeki çalışman korunuyor. ${link('#cases/' + c.id + '/v/' + old.version, 'Önceki çalışmamı aç')}</div>` : ''}<div class="casejump no-print"><a href="#case-docs" data-case-jump="case-docs">01 Bilgi dosyası</a><a href="#case-work" data-case-jump="case-work">02 Beklenen çıktılar</a>${a.submitted ? '<a href="#case-feedback" data-case-jump="case-feedback">03 Teslim sonrası inceleme</a>' : ''}</div><div class="sectionhead" id="case-docs"><h2>01 / Şirket bilgi dosyası</h2><div class="actions no-print office-downloads" style="margin:0"><button id="caseExpandDocs">Tüm belgeleri aç</button><a class="btn primary" href="${c.wordFile}" download>Vaka ve cevap alanları · Word</a><a class="btn" href="${c.excelFile}" download>Veriler ve cevap alanları · Excel</a><a class="btn ghost" href="${c.candidateFile}" download>Metin paketi · MD</a></div></div><p class="muted">${c.docs.length} belge · Tamamı kurgusal veri. Word dosyasındaki tablolar düzenlenebilir; Excel dosyasında her kaynak tablo ayrı sayfadadır. Numaralı cevap alanlarını kendi çalışmanda kullanabilirsin. CSV seçenekleri de korunur.</p><div class="card">${documents(c)}</div><div class="sectionhead" id="case-work"><h2>02 / Beklenen çıktılar</h2><span class="tag">${remote ? esc(remote.title) : CaseEngine.status(c, CaseEngine.getRecord(state.assessments, c))}</span></div><p class="muted case-work-note">${esc(c.mandate)} Önerilen süre ${c.minutes} dakika. Bu sürüm süre tutmaz. Metinlerin otomatik kaydedilir.</p><form id="caseForm" data-case="${c.id}"><section class="card">${c.tasks.map((t, i) => `<label class="field case-task"><span>Çıktı ${i + 1} · ${esc(t)}</span><textarea name="task${i}" rows="7" maxlength="8000" required placeholder="Çalışmanı buraya yazabilir veya hazırladığın dosyadan metin/tablo yapıştırabilirsin.">${esc(a.answers['task' + i] || '')}</textarea></label>`).join('')}<div id="case-error" role="alert" class="danger"></div><div class="actions no-print"><button class="primary" type="submit">${a.submitted ? 'Revizyonumu teslim et' : 'Çalışmamı teslim et'} →</button><button type="button" id="caseSave">Taslağı kaydet</button></div><p id="case-saved" class="muted" aria-live="polite">${a.savedAt ? 'Son kayıt: ' + new Date(a.savedAt).toLocaleString('tr-TR', { timeZone: 'Europe/Istanbul' }) : 'Çalışmaya başladığında taslağın bu cihazda kaydedilir.'}</p>${a.submitted ? '<div class="note">İnceleme, son teslim ettiğin metni esas alır. Yeni taslak değişiklikleri yeniden teslim edene kadar son teslimini değiştirmez.</div>' : ''}</section></form>${a.submitted ? `<div class="sectionhead" id="case-feedback"><h2>03 / Teslim sonrası inceleme</h2></div>${feedback(c, a)}` : ''}<div class="note">Bu çalışma bir hazırlık vakasıdır. Açık uçlu yanıtların otomatik puanlanmaz. Kayıtlar bu cihazda tutulur.</div>`;
  }

  function feedback(c, a) {
    if (c.learning && root.CaseCycle) return root.CaseCycle.feedback(c, a);
    return `<section class="card"><span class="eyebrow">Son teslim · ${new Date(a.submitted.at).toLocaleString('tr-TR', { timeZone: 'Europe/Istanbul' })}</span><h3>Referans dosya</h3><p>Aşağıdaki hesap ve değerlendirme notları teslimden sonra açılır. Bunlar açık uçlu çalışmanın otomatik puanı değildir.</p>${c.numbers.length ? `<details><summary>Referans hesapları aç</summary><div class="tablewrap"><table><thead><tr><th>Başlık</th><th>Referans tutar</th><th>Not</th></tr></thead><tbody>${c.numbers.map(n => `<tr><td>${esc(n.label)}</td><td>${n.value.toLocaleString('tr-TR', { maximumFractionDigits: 2 })} ${esc(n.unit)}</td><td>${esc(n.why)}</td></tr>`).join('')}</tbody></table></div></details>` : ''}<details><summary>Son teslim ettiğim çözümü aç</summary>${c.tasks.map((t, i) => `<h3>Görev ${i + 1}</h3><div class="quote">${esc(a.submitted.answers['task' + i])}</div>`).join('')}${a.submitted.updateAnswer ? `<h3>Yeni bilgiye yanıtım</h3><div class="quote">${esc(a.submitted.updateAnswer)}</div>` : ''}</details><h3>Güçlü bir çözümün dayanakları</h3><ol>${c.solution.map(t => `<li>${esc(t)}</li>`).join('')}</ol><div class="caseupdate"><h3>Yeni bilgi kartının referans yorumu</h3><p>${esc(c.update.text)}</p><p><b>İnceleme:</b> ${esc(c.update.reference)}</p></div><div class="grid2"><div><h3>Sık düşülen hatalar</h3><ul>${c.pitfalls.map(t => `<li>${esc(t)}</li>`).join('')}</ul></div><div><h3>Çözümünü savun</h3><ol>${c.questions.map(t => `<li>${esc(t)}</li>`).join('')}</ol><p class="muted">Yanıtını sesli anlat; varsayımını değiştiren bir karşı örnek düşün.</p></div></div></section><section class="card" style="margin-top:18px"><span class="eyebrow">Öz inceleme / Senin değerlendirmen</span><h2>Çözümünde hangi kanıt var?</h2><p>0: henüz yok · 1: ilgili ama eksik · 2: dayanaklı, bazı açıklıklar var · 3: dayanak, sınır ve alternatif açık. Her satırdaki somut ölçütü esas al. Toplam puan veya aday sıralaması üretmiyoruz.</p>${c.rubric.map((r, i) => `<div class="rubricrow"><div><h3>${esc(r.name)}</h3><p>${esc(r.evidence)}</p></div><label class="field">Kendi incelemem<select data-case-rating="${i}" aria-label="${esc(r.name)} öz inceleme"><option value="">Henüz incelemedim</option>${[0, 1, 2, 3].map(v => `<option value="${v}" ${a.ratings?.[i] === v ? 'selected' : ''}>${v} · ${['Henüz yok', 'İlgili ama eksik', 'Dayanaklı, açıklıklar var', 'Dayanak ve sınırlar açık'][v]}</option>`).join('')}</select></label></div>`).join('')}<label class="field">Bir sonraki çözümümde neyi farklı yapacağım?<textarea id="caseReflection" maxlength="8000" rows="4" placeholder="Örn. Toplam orandan önce segment paydalarını kontrol edeceğim.">${esc(a.reflection || '')}</textarea></label><div class="actions no-print"><button id="caseExport">Çözüm ve incelememi indir · JSON</button><button id="casePrint">Yazdır / PDF olarak kaydet</button>${link('#cases', 'Başka vaka seç')}</div><p class="muted" id="case-review-saved" aria-live="polite"></p></section>`;
  }
  function baseView() {
    const id = location.hash.split('/')[1];
    if (!id) return list();
    const c = getCase();
    return c ? detail(c) : '<h1>Bu vaka bulunamadı.</h1>' + link('#cases', 'Vaka havuzuna dön');
  }
  function collect(c) {
    const form = document.getElementById('caseForm'),
      a = draft(c),
      f = new FormData(form);
    return {
      ...a,
      answers: Object.fromEntries(c.tasks.map((_, i) => ['task' + i, String(f.get('task' + i) || '')])),
      numbers: { ...a.numbers },
      updateAnswer: String(f.get('updateAnswer') || a.updateAnswer || ''),
      savedAt: new Date().toISOString(),
    };
  }
  function filter() {
    const q = document.getElementById('caseSearch')?.value.trim().toLocaleLowerCase('tr-TR') || '',
      status = document.getElementById('caseStatus')?.value || '',
      l = document.getElementById('caseLevel').value,
      k = document.getElementById('caseKind').value,
      r = document.getElementById('caseRole').value;
    let n = 0;
    document.querySelectorAll('[data-case-card]').forEach(el => {
      const show =
        (!q || el.dataset.search.includes(q)) &&
        (!status || el.dataset.status === status) &&
        (!l || el.dataset.level === l) &&
        (!k || el.dataset.kind === k) &&
        (!r || el.dataset.roles.split(',').includes(r));
      el.hidden = !show;
      if (show) n++;
    });
    document.getElementById('caseCount').textContent = n + ' vaka';
    let empty = document.getElementById('case-filter-empty');
    if (empty) empty.remove();
    if (!n) {
      empty = document.createElement('p');
      empty.id = 'case-filter-empty';
      empty.className = 'empty';
      empty.textContent = 'Eşleşen vaka yok. Arama metnini kısaltabilir veya filtreleri temizleyebilirsin.';
      document.getElementById('caseList').append(empty);
    }
  }
  function bind() {
    document.querySelectorAll('[data-case-jump]').forEach(
      el =>
        (el.onclick = e => {
          e.preventDefault();
          document.getElementById(el.dataset.caseJump)?.scrollIntoView({ behavior: 'smooth' });
        })
    );
    ['caseLevel', 'caseKind', 'caseRole', 'caseStatus'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.onchange = filter;
    });
    const search = document.getElementById('caseSearch');
    if (search) search.oninput = filter;
    const reset = document.getElementById('caseResetFilters');
    if (reset)
      reset.onclick = () => {
        ['caseSearch', 'caseLevel', 'caseKind', 'caseRole', 'caseStatus'].forEach(
          id => (document.getElementById(id).value = '')
        );
        filter();
      };
    const expand = document.getElementById('caseExpandDocs');
    if (expand)
      expand.onclick = () => {
        const docs = [...document.querySelectorAll('details.case-document')],
          open = docs.some(d => !d.open);
        docs.forEach(d => (d.open = open));
        expand.textContent = open ? 'Belgeleri kapat' : 'Tüm belgeleri aç';
      };
    const c = getCase(),
      form = document.getElementById('caseForm');
    if (!c || !form) return;
    function persist() {
      let a = collect(c);
      const note = document.getElementById('cycleRevisionNote');
      if (note) a = { ...a, learning: { ...a.learning, revisionNote: note.value } };
      if (!commit(c, a)) return null;
      document.getElementById('case-saved').textContent =
        'Taslak kaydedildi · ' +
        new Date(a.savedAt).toLocaleTimeString('tr-TR', { timeZone: 'Europe/Istanbul' });
      return a;
    }
    form.addEventListener('input', persist);
    form.addEventListener('submit', e => {
      e.preventDefault();
      const a = persist();
      if (!a) return;
      if (!CaseEngine.canSubmit(c, a)) {
        document.getElementById('case-error').textContent = 'Beklenen çıktıların bütün alanlarını tamamla.';
        return;
      }
      let next;
      try {
        next = CaseEngine.submit(c, a);
      } catch (err) {
        document.getElementById('case-error').textContent = err.message;
        return;
      }
      if (commit(c, next)) {
        render();
        document.getElementById('case-feedback').scrollIntoView({ behavior: 'smooth' });
        toast('Çözümün kaydedildi. Referans ve öz inceleme açıldı.');
      }
    });
    document.getElementById('caseSave').onclick = () => {
      if (persist()) toast('Vaka taslağın kaydedildi.');
    };
    const update = document.getElementById('caseUpdate');
    if (update)
      update.onclick = () => {
        const a = persist();
        if (!a) return;
        if (!Object.values(a.answers).some(v => v.trim())) {
          document.getElementById('case-error').textContent =
            'Yeni bilgi kartından önce en az bir görev alanına ilk yaklaşımını yaz.';
          return;
        }
        if (commit(c, { ...a, updateOpen: true })) {
          render();
          document.querySelector('.caseupdate').scrollIntoView({ behavior: 'smooth' });
        }
      };
    document.querySelectorAll('[data-case-rating]').forEach(
      el =>
        (el.onchange = () => {
          const a = draft(c);
          a.ratings = a.ratings || {};
          if (el.value === '') delete a.ratings[el.dataset.caseRating];
          else a.ratings[el.dataset.caseRating] = Number(el.value);
          if (commit(c, a))
            document.getElementById('case-review-saved').textContent = 'Öz incelemen kaydedildi.';
        })
    );
    const reflection = document.getElementById('caseReflection');
    if (reflection)
      reflection.oninput = () => {
        const a = draft(c);
        a.reflection = reflection.value;
        if (commit(c, a))
          document.getElementById('case-review-saved').textContent = 'Çalışma notun kaydedildi.';
      };
    const exp = document.getElementById('caseExport');
    if (exp)
      exp.onclick = () => {
        const a = draft(c);
        download(
          c.id + '-cozumum.json',
          JSON.stringify(
            {
              schema: 'aday-atolyesi-case-review-v1',
              caseId: c.id,
              caseVersion: c.version,
              exportedAt: new Date().toISOString(),
              attempt: a,
              criteria: c.rubric,
              limitations: 'Sentetik hazırlık vakası; öz inceleme, uzman puanı veya iş deneyimi değildir.',
            },
            null,
            2
          )
        );
      };
    const print = document.getElementById('casePrint');
    if (print)
      print.onclick = () => {
        const details = [...document.querySelectorAll('details')],
          prior = details.map(d => d.open);
        details.forEach(d => (d.open = true));
        window.addEventListener('afterprint', () => details.forEach((d, i) => (d.open = prior[i])), {
          once: true,
        });
        window.print();
      };
  }
  function view() {
    const id = location.hash.split('/')[1],
      c = cat().find(c => c.id === id),
      remote = c && root.PilotProgress?.phase(c.id, c.version);
    return (
      `<div class="note">${remote ? esc(remote.title) + '. ' : ''}Yanıtını tek PDF, Word veya Excel dosyasıyla gönderebilirsin. ${link('#pilot' + (c ? '/' + c.id : ''), 'Dosyayla çalış ve teslim et')} Bu ekrandaki metin alanlarıyla da çalışabilirsin.</div>` +
      baseView()
    );
  }
  root.CaseUI = { view, bind, summary };
})(window);
