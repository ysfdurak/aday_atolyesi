(function (root) {
  'use strict';
  const E = root.Evidence;
  const safe = s =>
    String(s ?? '').replace(
      /[&<>"']/g,
      c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]
    );
  const btn = (href, text, primary = false) =>
    `<a class="btn ${primary ? 'primary' : ''}" href="${href}">${safe(text)} <span aria-hidden="true">→</span></a>`;
  const displayDate = v =>
    v ? new Date(v).toLocaleDateString('tr-TR', { timeZone: 'Europe/Istanbul' }) : 'Tarih belirtilmedi';
  function checklist(s) {
    return [
      {
        title: 'Sınav pratiği',
        value: s.report ? `${s.report.overall.correct}/${s.report.overall.total} doğru` : 'Deneme henüz yok',
        detail: 'Gerçek denemenin kendi sonucu',
        href: '/modules/zihin/index.html#' + (s.report ? 'report/latest' : 'orientation'),
      },
      {
        title: 'Çalışma tercihleri',
        value: s.m.complete ? 'Özet hazır' : `${Object.keys(s.m.answers || {}).length}/96 ifade`,
        detail: 'Öz bildirim · bölerek tamamlayabilirsin',
        href: '/modules/mizac/index.html' + (s.m.complete ? '?view=candidate' : ''),
      },
      {
        title: 'Rol kararları',
        value: s.r.profile ? `${s.r.activeAnswered || 0}/${s.r.activeTotal || 0} soru` : 'Paketini seç',
        detail: s.r.needsUpdate
          ? 'Yeni seçenek metinleriyle çalışmaya devam et'
          : s.r.profile
            ? 'Seçtiğin pozisyon ve yetkinlik paketi'
            : 'Pozisyonunu ve yetkinliklerini belirle',
        href: '/modules/rol/index.html',
      },
    ];
  }
  function home(st, s) {
    const p = st.profile,
      n = E.next(st, s),
      choice = root.Positions.load(localStorage),
      pos = root.Positions.get(choice?.positionId),
      co = root.AA.caseOverview(st),
      days = p ? root.AA.days(root.AA.today(), p.deadline) : null,
      // Gelişim raporu kartı ancak yorumlanacak bir çalışma varsa gösterilir.
      hasActivity =
        !!s.report ||
        Object.keys(s.r?.answers || {}).length > 0 ||
        Object.keys(s.m?.answers || {}).length > 0 ||
        co.started > 0 ||
        (st.examples || []).length > 0;
    return `<section class="dashboard-hero"><div><span class="eyebrow">${p ? 'Kendi hızında, somut bir sonraki adım' : 'Hazırlığına buradan başla'}</span><h1>${p ? 'Bugün neye<br><em>odaklanalım?</em>' : 'Hedefin belli olsun.<br><em>İlk adımın da.</em>'}</h1><p class="muted">${p ? safe(pos?.name || p.title) + ' · Günde ' + p.minutes + ' dakika. Çalışmalarını kendi deneyiminle ilişkilendir.' : 'Pozisyonunu seç; sınav pratiği, rol kararları ve şirket vakaları için bir çalışma sırası oluştur.'}</p><div class="pillrow">${p ? `<span>${days < 0 ? 'Hedef tarihi geçti' : days === 0 ? 'Hedef günün bugün' : days + ' gün kaldı'}</span><span>${safe(displayDate(p.deadline + 'T12:00Z'))}</span>` : '<span>Sınav, deneyim ve vaka hazırlığı tek yerde</span>'}</div>${p ? btn('#settings', 'Hedefimi düzenle') : ''}</div><article class="next-action" id="dashboard-next"><span class="eyebrow">${p ? 'Sıradaki çalışman' : 'İlk adım · yaklaşık 2 dakika'}</span><h2>${safe(n.title)}</h2><p>${safe(n.detail)}</p><div class="actions">${btn(n.href, p ? 'Kaldığım yerden devam et' : 'Hedefimi belirle', true)}</div><small>${n.minutes || 10} dk çalışma bloğu${p ? ' · ' + btn('#plan', 'Günlük planın tamamı') : ''}</small></article></section>
${hasActivity ? `<section class="card growth-entry"><h2>Cevaplarım bana ne söylüyor?</h2><p>Kendi seçimini, dayanağını ve önce çalışabileceğin iki alanı birlikte incele.</p>${btn('#growth', 'Gelişim raporumu aç', true)}</section>` : ''}<div class="workspace-overview"><h2>Çalışmaların bir bakışta</h2><p class="muted">Tamamladığın çalışmaların sayısı.</p><div class="grid status-cards">${checklist(
      s
    )
      .map(
        x =>
          `<a class="card status-card" href="${x.href}"><span class="num">${x.title}</span><strong>${safe(x.value)}</strong><span>${safe(x.detail)}</span><b aria-hidden="true">↗</b></a>`
      )
      .join('')}</div></div>
<div class="grid2" style="margin-top:20px"><section class="card"><span class="num">UYGULAMAYA TAŞI</span><h2>Şirket vakalarında karar ver</h2><p id="dashboard-case-progress">${co.started} başlanan · ${co.submitted} teslimi olan · ${co.reviewed} insan incelemesi bulunan vaka.</p>${btn('#cases', co.started ? 'Vaka çalışmalarıma dön' : 'İlk şirket dosyasını keşfet')}</section><section class="card"><span class="num">GÖRÜŞMEYE HAZIRLAN</span><h2>Deneyimini dayanağıyla anlat</h2><p>${st.examples.length} deneyim kaydı. Kendi katkını, alternatifini ve sonucunu seçtiğin örneklerle görünür kıl.</p><div class="actions">${btn('#examples', 'Deneyim örneği yaz')}${btn('#dossier', 'Mülakat dosyam')}${btn('#rehearsal', 'Mülakat provam')}</div></section></div>
${root.AA_STATIC ? `<section class="save-strip"><div><b>Çalışman bu tarayıcıda saklanıyor.</b><p>Tarayıcı verisi silinirse kaybolabilir. Ara sıra cihaz yedeği indirerek koru.</p></div>${btn('#settings', 'Yedek indir')}</section>` : `<section class="save-strip"><div><b>${root.AccountSync?.settings().on ? 'Çalışman hesabına otomatik kaydediliyor.' : 'Çalışman şu an yalnız bu cihazda.'}</b><p>${root.AccountSync?.settings().on ? 'Başka cihazda devam etmek için orada hesabından yükleyebilirsin.' : 'Tarayıcı verisi silinirse kaybolabilir. Hesabında otomatik kaydı açarak koruyabilirsin.'}</p></div>${btn('#pilot', root.AccountSync?.settings().on ? 'Hesap kaydımı gör' : 'Otomatik kaydı aç')}</section>`}`;
  }
  function start() {
    if (state.profile)
      return `<h1>Hedefin zaten kayıtlı.</h1><p>Mevcut çalışmalarını koruyarak hedef ayrıntılarını düzenleyebilirsin.</p>${btn('#settings', 'Hedefimi düzenle')}${btn('#plan', 'Planıma dön')}`;
    return `<span class="eyebrow">Kısa başlangıç</span><h1>İlk çalışma planın<br><em>dört seçimle hazır.</em></h1><form id="quick-start" class="card narrow"><label class="field">Hedef pozisyon<select name="positionId" required><option value="">Pozisyon seç</option>${Positions.positions.map(p => `<option value="${p.id}">${safe(p.name)}</option>`).join('')}</select></label><label class="field">Kıdem / sorumluluk<select name="seniority">${Object.entries(
      Positions.levels
    )
      .map(([id, label]) => `<option value="${id}">${safe(label)}</option>`)
      .join(
        ''
      )}</select></label><label class="field">Hazırlık hedef tarihin<input name="deadline" type="date" required min="${AA.today()}" value="${AA.plusDay(AA.today(), 14)}"></label><label class="field">Günlük çalışma süren<select name="minutes">${[15, 30, 45, 60, 90].map(n => `<option value="${n}" ${n === 30 ? 'selected' : ''}>${n} dakika</option>`).join('')}</select></label><p>Yönetim pozisyonlarında sorumluluk kapsamı yönetim olarak kaydedilir. Başlangıç tarihi bugün olur. İlanı ve diğer ayrıntıları hedef ayarlarından sonra ekleyebilirsin.</p><p class="muted">Yazdıkların bu cihazda tutulur. Hesaba kaydetme ve dosya teslimi ayrı işlemdir; dosyalarını sen, yönetici ve atanmış değerlendirici görebilir.</p><button class="primary">Planımı oluştur</button><p id="quick-start-status" role="status"></p></form>${btn('#settings', 'Ayrıntılı hedef ayarları')}`;
  }
  function fields(e) {
    return E.fields
      .map(
        ([id, label, q]) =>
          `<label class="field" for="example-${id}">${label}${['situation', 'action', 'result'].includes(id) ? ' *' : ' · isteğe bağlı'}<textarea id="example-${id}" name="${id}" maxlength="3000" ${['situation', 'action', 'result'].includes(id) ? 'required' : ''} rows="3" placeholder="${safe(q)}">${safe(e[id] || '')}</textarea></label>`
      )
      .join('');
  }
  function exampleCard(e) {
    const x = E.example(e),
      g = x.openQuestions;
    return `<article class="card evidence-card"><div class="casecardtop"><span class="tag">${safe(x.sourceType)}</span><small>${safe(displayDate(e.updatedAt || e.date))}</small></div><h3>${safe(e.title)}</h3><p>${safe(e.topic)}</p><div class="evidence-presence" aria-label="Yazılmış alanlar">${E.fields.map(([id, label]) => `<span class="${e[id]?.trim() ? 'present' : ''}">${e[id]?.trim() ? '✓' : '○'} ${label}</span>`).join('')}</div><p class="muted">${g.length ? 'Sonraki soru: ' + safe(g[0].question) : 'Altı alan da yazılmış. Bu işaretler içeriğin kalitesini doğrulamaz.'}</p><details><summary>Deneyim metnini incele</summary>${E.fields.map(([id, label]) => `<h4>${label}</h4><div class="quote">${safe(e[id] || 'Henüz yazılmadı')}</div>`).join('')}${e.tradeoff ? `<h4>Risk / yan etki / dış etken</h4><div class="quote">${safe(e.tradeoff)}</div>` : ''}</details><div class="actions"><button data-example-edit="${safe(e.id)}">Düzenle</button><button class="ghost" data-remove="${safe(e.id)}" aria-label="${safe(e.title)} örneğini sil">Sil</button></div></article>`;
  }
  function examples(st) {
    const d = st.drafts?.example || {},
      topics = [
        ...new Set(
          [
            ...Object.values(root.MODULE_CONTRACTS.role.dimensionNames || {}),
            ...st.examples.map(e => e.topic),
            d.topic,
            'Diğer',
          ].filter(Boolean)
        ),
      ];
    return `<span class="eyebrow">Deneyim arşivin / Kaynak → karar → sonuç</span><div class="sectionhead"><div><h1>Katkını somut<br><em>bir olayla anlat.</em></h1><p class="muted">İş, proje ve öğrenme deneyimlerini ayrı belirt. Gerçek şirket ve kişi adlarını yazmak zorunda değilsin.</p></div>${btn('#dossier', 'Mülakat dosyam')}</div><div class="grid2 examples-layout"><form id="example" class="card"><div class="sectionhead"><h2>${d.editingId ? 'Örneğini düzenle' : 'Yeni deneyim örneği'}</h2><span class="tag">Taslak bu cihazda</span></div><p>Yıldızlı alanlar gerekli. Yazarken taslağın kaydolur; “Örneği kaydet” ile arşivine eklersin.</p><input type="hidden" name="editingId" value="${safe(d.editingId || '')}"><label class="field">Başlık *<input name="title" maxlength="120" required value="${safe(d.title || '')}" placeholder="Örn. Rapor uyuşmazlığını nasıl inceledim?"></label><div class="formgrid"><label class="field">Deneyimin kaynağı *<select name="kind" required><option value="">Kaynak türünü seç</option>${Object.entries(
      E.kinds
    )
      .map(([id, label]) => `<option value="${id}" ${d.kind === id ? 'selected' : ''}>${label}</option>`)
      .join(
        ''
      )}</select></label><label class="field">Yetkinlik / konu *<select name="topic" required><option value="">Konu seç</option>${topics.map(t => `<option ${d.topic === t ? 'selected' : ''}>${safe(t)}</option>`).join('')}</select></label></div>${fields(d)}<label class="field">Risk, yan etki veya başka etkileyen koşul · isteğe bağlı<textarea name="tradeoff" maxlength="3000" rows="3" placeholder="Sonucu senin eylemin dışında ne etkilemiş olabilir?">${safe(d.tradeoff || '')}</textarea></label><p id="example-save-status" class="muted" role="status">${d.title || d.situation ? 'Kaydedilmiş taslağın açıldı.' : 'Yazmaya başladığında taslak burada korunur.'}</p><p id="example-error" role="alert" class="danger"></p><div class="actions"><button class="primary">${d.editingId ? 'Değişiklikleri kaydet' : 'Örneği kaydet'}</button><button type="button" data-example-new>Yeni boş taslak</button></div><p class="muted">Bir alana metin yazılması o yetkinliği kanıtlamaz. Kaynağı ve sonucu görüşmede ayrıca açıklarsın.</p></form><section><div class="sectionhead"><h2>Arşivin · ${st.examples.length}</h2></div><label class="field">Örneklerinde ara<input id="example-search" type="search" placeholder="Başlık veya yetkinlik"></label><p id="example-count" role="status"></p><div id="example-list">${
      st.examples.length
        ? st.examples
            .slice()
            .reverse()
            .map(
              e =>
                `<div data-example-card data-search="${safe((e.title + ' ' + e.topic).toLocaleLowerCase('tr-TR'))}">${exampleCard(e)}</div>`
            )
            .join('')
        : '<div class="empty"><h3>İlk örneğinle başla.</h3><p>Bir sorunu fark ettiğin, karar aldığın veya başka biriyle birlikte bir işi tamamladığın olayı seçebilirsin.</p></div>'
    }</div></section></div>`;
  }
  function preview(d) {
    return `<section id="dossier-preview" class="dossier-preview"><div class="dossier-heading"><span class="eyebrow">Adayın seçtiği hazırlık kayıtları</span><h2>${safe(d.target?.title || 'Mülakat hazırlık dosyam')}</h2><p>${safe(displayDate(d.createdAt))} · Beyan ve hazırlık çalışmalarının seçili özeti</p></div>${d.examples.map(e => `<article class="card dossier-item"><span class="tag">${safe(e.sourceType)}</span><h3>${safe(e.title)}</h3><p>${safe(e.topic)}</p>${E.fields.map(([id, label]) => `<h4>${label}</h4><div class="quote">${safe(e[id] || 'Henüz açıklanmadı')}</div>`).join('')}${e.tradeoff ? `<h4>Risk / yan etki / dış koşul</h4><div class="quote">${safe(e.tradeoff)}</div>` : ''}${e.openQuestions.length ? `<h4>Görüşmede tamamlanacak sorular</h4><ul>${e.openQuestions.map(p => `<li>${safe(p.question)}</li>`).join('')}</ul>` : ''}</article>`).join('')}${d.cases.map(c => `<article class="card dossier-item"><span class="tag">${safe(c.sourceType)}</span><h3>${safe(c.title)}</h3><p>${safe(c.company)} · ${safe(c.version)} · ${displayDate(c.submittedAt)} · ${c.submissionCount} teslim</p>${c.outputs.map(o => `<h4>${safe(o.label)}</h4><div class="quote">${safe(o.answer)}</div>`).join('')}${c.changeNote ? `<section><h4>İlk ve son çözümümün dayanağı · ${safe(c.changeNote.criterion)}</h4><p>${safe(c.changeNote.sourceType)}</p><blockquote>${safe(c.changeNote.firstQuote)}</blockquote><blockquote>${safe(c.changeNote.lastQuote)}</blockquote><p><b>Değişiklik gerekçem:</b> ${safe(c.changeNote.reason)}</p><p><b>Açık kalan kontrol:</b> ${safe(c.changeNote.remaining)}</p></section>` : ''}${c.reflection ? `<h4>Öz inceleme notum</h4><div class="quote">${safe(c.reflection)}</div>` : ''}${c.revisionNote ? `<h4>Revizyon gerekçem</h4><div class="quote">${safe(c.revisionNote)}</div>` : ''}<p><b>İnceleme:</b> ${safe(c.feedbackNote)}</p>${c.humanFeedback.map(r => `<section><h4>${safe(r.reviewer)} · ${displayDate(r.at)}</h4><p>${safe(r.summary)}</p>${r.items.map(i => `<h4>${safe(i.criterion)}</h4><blockquote>${safe(i.quote || 'Alıntı yok')}</blockquote><p>${safe(i.observation)}</p><p><b>Sonraki adım:</b> ${safe(i.next)}</p>`).join('')}</section>`).join('')}</article>`).join('')}${(d.growthTransfers || []).map(n => `<article class="card dossier-item"><span class="tag">${safe(n.sourceType)}</span><h3>${safe(n.sourceTitle)} → ${safe(n.targetTitle)}</h3><blockquote>${safe(n.sourceQuote)}</blockquote><blockquote>${safe(n.targetQuote)}</blockquote><p><b>Uyarlamam:</b> ${safe(n.adaptation)}</p><p><b>Doğrulanmamış sınır:</b> ${safe(n.limit)}</p></article>`).join('')}${(d.files || []).map(f => `<article class="card dossier-item"><span class="tag">${safe(f.sourceType)}</span><h3>${safe(f.title)}</h3><p>${safe(f.caseVersion)} · ${safe(f.submittedAt)} · Teslim: ${safe(f.submissionId)}</p>${f.outputs.map(o => `<h4>${safe(o.label)}</h4><div class="quote">${safe(o.answer)}</div><p>Dosya referansı: ${safe(o.reference)}</p>`).join('')}<p><b>Açık kalan kontrol:</b> ${safe(f.remaining)}</p><p>${safe(f.note)}</p></article>`).join('')}${d.modules ? `<article class="card dossier-item"><h3>Atölye kayıtlarının kapsamı</h3><p><b>Sınav:</b> ${d.modules.exam ? d.modules.exam.correct + '/' + d.modules.exam.total + ' doğru; ' + d.modules.exam.answered + ' yanıt. ' + safe(d.modules.exam.note) : 'Tamamlanmış gerçek deneme yok.'}</p><p><b>Mizaç:</b> ${d.modules.preferences.answered}/96 ifade · ${d.modules.preferences.complete ? 'Form tamamlandı' : 'Form eksik'}. ${safe(d.modules.preferences.note)}</p><p><b>Rol:</b> ${d.modules.role.answered}/${d.modules.role.total} soru. ${safe(d.modules.role.note)}</p></article>` : ''}<p class="note dossier-limit">${safe(d.limitations)}</p></section>`;
  }
  function dossier(st, s) {
    const d = E.build(st, s, root.CASE_CATALOG),
      sel = E.selection(st),
      cases = E.submittedCases(st, root.CASE_CATALOG),
      count = d.examples.length + d.cases.length + (d.modules ? 1 : 0) + (d.files || []).length;
    return `<span class="eyebrow">Mülakat dosyam / Seç → incele → indir</span><h1>Hazırlığını<br><em>dayanağıyla göster.</em></h1><p class="muted">Dosyana hangi kayıtların gireceğini sen seç. İndirmeden önce aşağıdaki önizlemeyi incele. Buradan kimseye gönderilmez.</p><section class="card dossier-controls no-print"><h2>Dosyanın içeriği</h2><div class="grid2"><section><h3>Deneyim örneklerin</h3>${st.examples.length ? st.examples.map(e => `<label class="check"><input type="checkbox" data-dossier-example="${safe(e.id)}" ${sel.exampleIds.includes(e.id) ? 'checked' : ''}><span>${safe(e.title)}<small>${safe(E.kinds[e.kind] || E.kinds.unspecified)}</small></span></label>`).join('') : `<p>Arşivinde örnek yok.</p>${btn('#examples', 'İlk örneğimi yaz')}`}</section><section><h3>Teslim edilmiş vaka çalışmaların</h3>${cases.length ? cases.map(({ c, key }) => `<label class="check"><input type="checkbox" data-dossier-case="${safe(key)}" ${sel.caseKeys.includes(key) ? 'checked' : ''}><span>${safe(c.title)}<small>Kurgusal hazırlık çalışması · ${safe(c.version)}</small></span></label>`).join('') : '<p>Bu cihazda metin olarak teslim edilmiş vaka yok. Hesabındaki dosyayı açıp görüşme özetini buraya aktarabilirsin.</p>'}${(st.fileEvidence || []).length ? '<h3>Dosyalarından aktardığın özetler</h3>' : ''}${(st.fileEvidence || []).map(f => `<label class="check"><input type="checkbox" data-dossier-file="${safe(f.id)}" ${sel.fileIds.includes(f.id) ? 'checked' : ''}><span>${safe(f.title)}<small>Kurgusal vaka · elle aktarılan özet · ${safe(f.caseVersion)}</small></span></label>`).join('')}<label class="check"><input type="checkbox" id="dossier-modules" ${sel.includeModules ? 'checked' : ''}>Atölye kayıtlarının kapsamını ekle</label><label class="check"><input type="checkbox" id="dossier-growth" ${sel.includeGrowth ? 'checked' : ''}>Seçili vakalarımın değişim ve aktarım notlarını ekle</label><p class="muted">Aktarım notu için iki vakanın da seçili olması gerekir. Notlar öz değerlendirmendir.</p></section></div><p class="muted">CV, ilan metni, kaydedilmemiş taslaklar ve seçmediğin örnekler dosyaya alınmaz.</p><div class="actions"><button class="primary" id="dossier-print" ${count ? '' : 'disabled'}>Önizlemeyi yazdır / PDF</button><button id="dossier-export" ${count ? '' : 'disabled'}>Seçili dosyayı indir · JSON</button></div><p role="status">${count ? count + ' kayıt / özet seçili. Önizleme aşağıda.' : 'Henüz içerik seçmedin. Bir örnek, vaka veya atölye özeti seç.'}</p></section>${root.Rehearsal ? rehearsalReadiness(st, s) : ''}${count ? preview(d) : '<section class="empty"><h2>Dosyanı birkaç kayıtla kur.</h2><p>Önce bir deneyim seç; aday beyanı, kurgusal vaka ve insan görüşü ayrı etiketlerle görünsün.</p></section>'}<section class="card no-print" style="margin-top:20px"><h2>Bir İK uzmanının sorabileceği dört takip sorusu</h2><ol><li>Bu sonucun hangi kısmı senin katkın, hangi kısmı ekip veya dış koşullar?</li><li>Başka hangi seçeneği düşündün; neden elemek zorunda kaldın?</li><li>Sonucu hangi kayıt ya da gözlemle açıklayabilirsin; neyi doğrulayamadın?</li><li>Aynı işi tekrar yapsan neyi değiştirir, başka bir bağlamda nasıl kullanırdın?</li></ol></section>`;
  }
  function rehearsalReadiness(st, s) {
    const r = root.Rehearsal.readiness(st, s, root.CASE_CATALOG);
    return `<section class="card no-print" style="margin-top:20px"><h2>Görüşmeden önce kontrol et</h2><p>${r.selected} seçili örnek / vaka · ${r.practiced} tanesinde kayıtlı prova. Bu sayılar hazır olma puanı değildir.</p>${
      r.gaps.length
        ? `<h3>Seçili kayıtlarında açık kalan noktalar</h3><ul>${r.gaps
            .slice(0, 6)
            .map(g => `<li><b>${safe(g.title)}:</b> ${safe(g.question)} ${btn(g.href, 'Kaynağa dön')}</li>`)
            .join(
              ''
            )}</ul>${r.gaps.length > 6 ? '<p>Diğer açık noktalar ilgili kayıtlarda gösterilir.</p>' : ''}`
        : r.selected
          ? '<p>Seçili örneklerde boş alan uyarısı yok. Bu, bilgilerin doğrulandığı anlamına gelmez.</p>'
          : '<p>Henüz deneyim veya vaka seçilmedi. Önce dosyana bir örnek ekle.</p>'
    }${btn('#rehearsal', 'Seçtiğim örneklerle prova yap', true)}</section>`;
  }
  function refreshProgress(st) {
    const box = document.getElementById('dashboard-next');
    if (!box || box.contains(document.activeElement)) return;
    const n = E.next(st, AA.snapshot(localStorage)),
      p = st.profile;
    box.innerHTML = `<span class="eyebrow">${p ? 'Sıradaki çalışman' : 'İlk adım · yaklaşık 2 dakika'}</span><h2>${safe(n.title)}</h2><p>${safe(n.detail)}</p><div class="actions">${btn(n.href, p ? 'Kaldığım yerden devam et' : 'Hedefimi belirle', true)}</div><small>${n.minutes || 10} dk çalışma bloğu${p ? ' · ' + btn('#plan', 'Günlük planın tamamı') : ''}</small>`;
    const co = AA.caseOverview(st),
      counts = document.getElementById('dashboard-case-progress');
    if (counts)
      counts.textContent =
        co.started +
        ' başlanan · ' +
        co.submitted +
        ' teslimi olan · ' +
        co.reviewed +
        ' insan incelemesi bulunan vaka.';
  }
  function bind() {
    document.getElementById('quick-start')?.addEventListener('submit', ev => {
      ev.preventDefault();
      const f = Object.fromEntries(new FormData(ev.currentTarget)),
        pos = Positions.get(f.positionId);
      if (!pos) return;
      const p = {
        positionId: pos.id,
        role: pos.commonRole,
        title: pos.name,
        seniority: pos.people ? 'lead' : f.seniority,
        minutes: Number(f.minutes),
        start: AA.today(),
        deadline: f.deadline,
        people: pos.people,
        employed: false,
        job: '',
      };
      if (!AA.validProfile(p)) {
        document.getElementById('quick-start-status').textContent = 'Pozisyonu, tarihi ve süreyi kontrol et.';
        return;
      }
      const old = state;
      state = { ...state, profile: p };
      if (!save()) {
        state = old;
        return;
      }
      Positions.save(localStorage, { schema: 1, positionId: pos.id, seniority: p.seniority });
      location.hash = 'plan';
    });
    const form = document.getElementById('example');
    if (form) {
      form.addEventListener('input', () => {
        const f = Object.fromEntries(new FormData(form));
        state.drafts = { ...state.drafts, example: f };
        const el = document.getElementById('example-save-status');
        el.textContent = save()
          ? 'Taslak bu cihaza kaydedildi · ' +
            new Date().toLocaleTimeString('tr-TR', { timeZone: 'Europe/Istanbul' })
          : 'Taslak kaydedilemedi. Sayfayı açık tut ve kayıtlarını yedekle.';
      });
      form.addEventListener('submit', ev => {
        ev.preventDefault();
        const f = Object.fromEntries(new FormData(form));
        if (!E.validExample(f)) {
          document.getElementById('example-error').textContent =
            'Başlık, kaynak, konu, durum, kendi eylemin ve sonuç alanlarını kontrol et.';
          return;
        }
        const prior = state.examples.find(e => e.id === f.editingId),
          { editingId, ...fields } = f,
          record = {
            ...prior,
            ...fields,
            id: prior?.id || AA.uuid(),
            date: prior?.date || AA.today(),
            updatedAt: new Date().toISOString(),
          };
        const old = state;
        state = {
          ...state,
          examples: prior
            ? state.examples.map(e => (e.id === prior.id ? record : e))
            : [...state.examples, record],
          drafts: { ...state.drafts, example: {} },
        };
        if (!save()) {
          state = old;
          return;
        }
        render();
        toast(prior ? 'Deneyim örneğin güncellendi.' : 'Deneyim örneğin arşivine eklendi.');
      });
    }
    document.querySelectorAll('[data-example-edit]').forEach(
      b =>
        (b.onclick = () => {
          const e = state.examples.find(e => e.id === b.dataset.exampleEdit);
          if (!e) return;
          state.drafts = {
            ...state.drafts,
            example: { ...e, editingId: e.id, kind: e.kind || 'unspecified' },
          };
          if (save()) {
            render();
            document.getElementById('example')?.scrollIntoView();
          }
        })
    );
    document.querySelector('[data-example-new]')?.addEventListener('click', () => {
      if (
        state.drafts?.example &&
        Object.values(state.drafts.example).some(v => typeof v === 'string' && v.trim()) &&
        !confirm(
          'Mevcut kaydedilmemiş taslak yerine boş bir taslak açılsın mı? Arşivindeki örnekler korunur.'
        )
      )
        return;
      state.drafts = { ...state.drafts, example: {} };
      if (save()) render();
    });
    const search = document.getElementById('example-search');
    if (search)
      search.oninput = () => {
        const q = search.value.trim().toLocaleLowerCase('tr-TR');
        let n = 0;
        document.querySelectorAll('[data-example-card]').forEach(el => {
          el.hidden = !el.dataset.search.includes(q);
          if (!el.hidden) n++;
        });
        document.getElementById('example-count').textContent = n
          ? n + ' örnek gösteriliyor.'
          : 'Bu aramayla eşleşen örnek yok.';
      };
    const update = () => {
      const exampleIds = [...document.querySelectorAll('[data-dossier-example]:checked')].map(
          n => n.dataset.dossierExample
        ),
        caseKeys = [...document.querySelectorAll('[data-dossier-case]:checked')].map(
          n => n.dataset.dossierCase
        );
      const fileIds = [...document.querySelectorAll('[data-dossier-file]:checked')].map(
        n => n.dataset.dossierFile
      );
      state.dossier = {
        exampleIds,
        caseKeys,
        fileIds,
        includeModules: document.getElementById('dossier-modules').checked,
        includeGrowth: document.getElementById('dossier-growth').checked,
      };
      if (save()) {
        const priorFocus = document.activeElement,
          focusKey =
            priorFocus?.dataset.dossierExample ||
            priorFocus?.dataset.dossierCase ||
            priorFocus?.dataset.dossierFile,
          focusId = priorFocus?.id;
        render({ preserveScroll: true }).then(() => {
          const target = focusId
            ? document.getElementById(focusId)
            : [
                ...document.querySelectorAll(
                  '[data-dossier-example],[data-dossier-case],[data-dossier-file]'
                ),
              ].find(
                el =>
                  (el.dataset.dossierExample || el.dataset.dossierCase || el.dataset.dossierFile) === focusKey
              );
          target?.focus({ preventScroll: true });
        });
      }
    };
    document
      .querySelectorAll(
        '[data-dossier-example],[data-dossier-case],[data-dossier-file],#dossier-modules,#dossier-growth'
      )
      .forEach(el => (el.onchange = update));
    document
      .getElementById('dossier-export')
      ?.addEventListener('click', () =>
        download(
          'mulakat-hazirlik-dosyam-' + AA.today() + '.json',
          JSON.stringify(E.build(state, AA.snapshot(localStorage), root.CASE_CATALOG), null, 2)
        )
      );
    document.getElementById('dossier-print')?.addEventListener('click', () => window.print());
    const profile = document.getElementById('profile');
    if (profile) {
      profile.addEventListener('input', () => {
        const f = Object.fromEntries(new FormData(profile));
        state.drafts = {
          ...state.drafts,
          profile: {
            ...f,
            minutes: Number(f.minutes),
            people: f.people === 'on',
            employed: f.employed === 'yes',
          },
        };
        save();
        const st = document.getElementById('profile-draft-status');
        if (st) st.textContent = 'Taslak bu cihazda korunuyor. Planını güncellemek için hedefini kaydet.';
      });
    }
  }
  root.WorkspaceUX = { home, start, examples, dossier, bind, checklist, refreshProgress };
})(window);
