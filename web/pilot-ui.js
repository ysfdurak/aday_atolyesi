(function (root) {
  'use strict';
  let me = null,
    rows = [],
    members = [],
    revision = null,
    busy = false,
    bindTicket = 0;
  let queueSearch = '',
    queueStatus = 'all';
  const e = s =>
    String(s ?? '').replace(
      /[&<>"']/g,
      c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]
    );
  const api = async (op, body, method) => {
    const ctrl = new AbortController(),
      timer = setTimeout(() => ctrl.abort(), 15000);
    let r;
    try {
      r = await fetch('/api/pilot?op=' + op, {
        signal: ctrl.signal,
        method: method || (body ? 'POST' : 'GET'),
        headers: body ? { 'Content-Type': 'application/json' } : {},
        body: body ? JSON.stringify(body) : undefined,
      });
    } catch (err) {
      throw Error('Bağlantı kurulamadı. Yazdıkların ekranda korunuyor; tekrar dene.');
    } finally {
      clearTimeout(timer);
    }
    let b;
    try {
      b = await r.json();
    } catch {
      throw Error('Sunucu yanıtı okunamadı. Tekrar dene.');
    }
    if (!r.ok) throw Object.assign(Error(b.error || 'İşlem tamamlanamadı.'), { status: r.status });
    return b;
  };
  const view = () =>
    `<div id="pilot-hero"><span class="eyebrow">Davetli pilot / Hesap ve teslim</span><h1>Çalışmanı koru.<br><em>Geri bildirimle ilerle.</em></h1><p class="muted">Buradaki hesap işlemleri ve dosyalar sunucuda saklanır. Atölyelerdeki çalışma kayıtları cihazında devam eder; aşağıdan hesabına kaydedebilir veya başka cihazdaki kaydını yükleyebilirsin. Yapay zekâya gönderim yapılmaz. Dosya teslimlerin, geri bildirimlerin ve gelişim adımların hazırlık planına yansır.</p></div><div id="pilot-message" role="status" aria-live="polite"></div><div id="pilot-content"><p>Hesap kontrol ediliyor…</p></div>`;
  function message(s) {
    const n = document.getElementById('pilot-message');
    if (n) n.textContent = s;
  }
  function feedback(r) {
    if (!r.feedback) return '<span class="tag">Geri bildirim bekleniyor</span>';
    return `<details><summary>Geri bildirimi incele · ${e(r.reviewed.slice(0, 10))}</summary>${root.ReviewUI.feedback(r.feedback)}</details>`;
  }
  // Değerlendirici ve yönetici aday metinleri yerine kendi işlerine uygun bir başlık görür.
  function heroFor(role) {
    const hero = document.getElementById('pilot-hero');
    if (!hero || role === 'candidate') return;
    hero.innerHTML =
      role === 'admin'
        ? '<span class="eyebrow">Pilot yönetimi</span><h1>Teslimleri ata.<br><em>Süreyi izle.</em></h1><p class="muted">Bekleyen teslimleri değerlendiricilere dağıt, hedef süreyi aşanları gör ve kör değerlendirmeyi yönet. Kendi hazırlık kayıtların aşağıda ayrı bölümde.</p>'
        : '<span class="eyebrow">Değerlendirici çalışma alanı</span><h1>Teslimi incele.<br><em>Ölçütle geri bildir.</em></h1><p class="muted">Sana atanan teslimler en eskiden başlayarak sıralanır. Dosyayı ekranda aç, her ölçüt için seviye seç ve çıktı bazında dayanaklı not yaz.</p>';
    const top = document.querySelector('.main .top span');
    if (top) top.textContent = role === 'admin' ? 'Pilot yöneticisi' : 'Değerlendirici';
  }
  function draw() {
    const n = document.getElementById('pilot-content');
    if (!n || !me) return;
    const canReview = ['reviewer', 'admin'].includes(me.user.role),
      admin = me.user.role === 'admin';
    heroFor(me.user.role);
    const list = canReview ? root.ReviewUI.sortQueue(rows) : rows,
      pending = rows.filter(r => !r.feedback),
      unassigned = pending.filter(r => !r.reviewer_id),
      mine = pending.filter(r => r.reviewer_id === me.user.id),
      late = (admin ? pending : mine).filter(r => root.ReviewUI.ageDays(r) >= root.ReviewUI.TARGET_DAYS);
    n.innerHTML = `${canReview ? `<section class="card"><div class="sectionhead"><h2>${e(me.user.email)}</h2><a class="btn" href="/signout-with-chatgpt?return_to=%2Fworkspace.html%23pilot" target="_top">Çıkış yap</a></div><p>Atanmış teslimleri aşağıdan incele. Kendi hazırlık araçlarını istersen açabilirsin.</p></section><details class="pilot-personal"><summary>Kendi hazırlık kayıtlarım ve dosya teslimim</summary>` : ''}<section class="card"><div class="sectionhead"><h2>${e(me.user.email)}</h2><a class="btn" href="/signout-with-chatgpt?return_to=%2Fworkspace.html%23pilot" target="_top">Çıkış yap</a></div><p>Hesap türü: ${e({ admin: 'Yönetici', reviewer: 'Değerlendirici', candidate: 'Aday' }[me.user.role])}</p><p class="muted">Pilot kotası: ${me.maxFiles} dosya · toplam ${Math.round(me.maxStorageBytes / 1048576)} MB. Dosya başına 10 MB.</p><h3>Hazırlık kaydım</h3><p>Hedef, deneyim örnekleri, vaka ve atölye kayıtları dahil edilir. CV metni dahil edilmez. Hesaptan yükleme bu cihazdaki çalışma kayıtlarını değiştirir; önce mevcut yedeğini indir.</p><div class="actions"><button id="pilot-save">Bu cihazdaki çalışmayı hesabıma kaydet</button><button id="pilot-load">Hesabımdaki çalışmayı bu cihaza yükle</button><button id="pilot-account-export">Hesap kayıtlarımı indir</button><a class="btn" href="#settings">Cihaz yedeği indir</a></div><label class="check autosync"><input type="checkbox" id="pilot-autosync" ${root.AccountSync?.settings().on ? 'checked' : ''}> Bu cihazdaki çalışmayı hesabıma otomatik kaydet</label><p class="muted" id="pilot-autosync-status" aria-live="polite">${e(root.AccountSync?.label() || '')}</p><p class="muted">Açıkken değişiklikler birkaç dakikada bir gönderilir. Başka bir cihazda daha yeni kayıt varsa üzerine yazılmaz; otomatik kayıt durur ve sana sorulur.</p></section>
<section class="card" style="margin-top:20px"><h2>Vaka dosyamı teslim et</h2><p>Önce vaka belgelerini ve senden beklenen çıktıları incele. Yanıtlarını tek dosyada, çıktılarla aynı numaraları kullanarak hazırla.</p><form id="pilot-submit"><label class="field">Vaka<select name="case" id="pilot-case">${me.cases.map(c => `<option value="${e(c.id)}">${e(c.title)}</option>`).join('')}</select></label><div id="pilot-outputs"></div><label class="field">Teslim biçimi<select name="parent" id="pilot-parent"><option value="">Yeni çalışma</option></select></label><label class="field">Revizyonda neleri değiştirdin?<textarea name="note" maxlength="2000" rows="3"></textarea></label><label class="field">Tek yanıt dosyası · PDF / DOCX / XLSX · En fazla 10 MB<input name="file" type="file" accept=".pdf,.docx,.xlsx" required></label><label class="check"><input name="confirmed" type="checkbox" required> Beklenen tüm çıktıları dosyamda aynı numaralarla yanıtladım.</label><p class="muted">Dosya biçimi ve boyutu kontrol edilir. Numaralı yanıtların içeriği insan tarafından incelenir. Şifresiz, makrosuz dosya kullan. Dosyanı sen, yönetici ve atanmış değerlendirici görebilir.</p><button class="primary">Dosyamı teslim et</button></form></section>
${canReview ? '</details>' : ''}${
      canReview
        ? `<section class="card queue-summary" style="margin-top:20px"><div class="stats"><div><strong>${admin ? pending.length : mine.length}</strong><span>${admin ? 'geri bildirim bekleyen teslim' : 'sana atanmış, bekleyen teslim'}</span></div><div><strong class="${late.length ? 'late-text' : ''}">${late.length}</strong><span>${root.ReviewUI.TARGET_DAYS} günlük hedefi aşan</span></div>${admin ? `<div><strong>${unassigned.length}</strong><span>atanmamış teslim</span></div>` : ''}</div>${
            me.blindReview && !admin
              ? '<p class="muted">Kör değerlendirme açık: değerlendiriciler aday e-postasını ve dosya adını görmez.</p>'
              : ''
          }${
            admin
              ? `<div class="admin-tools"><label class="check"><input type="checkbox" id="pilot-blind" ${me.blindReview ? 'checked' : ''}> Kör değerlendirme · değerlendiriciler aday kimliğini görmesin</label>${
                  unassigned.length
                    ? `<form id="pilot-bulk-assign" class="inline-form"><label class="field">Atanmamış ${unassigned.length} teslimi ata<select name="reviewer">${members
                        .filter(m => ['reviewer', 'admin'].includes(m.role))
                        .map(m => `<option value="${e(m.id)}">${e(m.email)}</option>`)
                        .join(
                          ''
                        )}<option value="__balance">Değerlendiricilere eşit dağıt</option></select></label><button>Toplu ata</button></form>`
                    : ''
                }</div>`
              : ''
          }</section>`
        : ''
    }<section class="card" style="margin-top:20px"><div class="sectionhead"><h2>${canReview ? 'Teslimler ve incelemeler' : 'Teslimlerim'}</h2><button id="pilot-refresh">Teslimleri yenile</button></div><label class="field">Teslimlerde ara<input id="pilot-search" type="search" placeholder="Vaka, dosya veya kişi"></label><label class="field">Görüş durumu<select id="pilot-status-filter"><option value="all">Tümü</option><option value="pending">Geri bildirim bekleyen</option><option value="reviewed">Geri bildirim verilen</option></select></label><p id="pilot-list-count" role="status"></p>${
      rows.length
        ? list
            .map(
              r =>
                `<article class="pilot-delivery" data-queue-text="${e((r.name + ' ' + r.email + ' ' + (me.cases.find(c => c.id === r.case_id)?.title || r.case_id)).toLocaleLowerCase('tr-TR'))}" data-reviewed="${r.feedback ? 'yes' : 'no'}"><h3>${e(me.cases.find(c => c.id === r.case_id)?.title || r.case_id)}</h3><p>${e(r.email)} · ${e(r.created.slice(0, 16).replace('T', ' '))} UTC · ${e(r.version)}${r.parent_id ? ' · Revizyon' : ''} ${canReview ? root.ReviewUI.waitLabel(r) : ''}</p><p>Teslim kodu: <code>${e(r.id)}</code></p><button type="button" data-preview="${e(r.id)}">Ekranda aç</button><a class="btn" href="/api/pilot?op=file&id=${encodeURIComponent(r.id)}">${e(r.name)} · İndir</a>${`<a class="btn" href="#file-work/${e(r.id)}">${r.user_id === me.user.id ? 'Dosya karşılaştırması ve görüşme özeti' : 'Teslim zincirini ve ölçütleri incele'} →</a>`}${r.revision_note ? `<p>Değişiklik notu: ${e(r.revision_note)}</p>` : ''}${feedback(r)}${r.user_id === me.user.id && !rows.some(n => n.user_id === r.user_id && n.case_id === r.case_id && n.version === r.version && (n.created > r.created || (n.created === r.created && ((n.sequence || 0) > (r.sequence || 0) || ((n.sequence || 0) === (r.sequence || 0) && n.id > r.id))))) ? `<details data-cycle="${e(r.case_id)}" data-version="${e(r.version)}"><summary>Gelişim adımlarım</summary><div data-cycle-content>Yüklemek için aç.</div></details>` : ''}${
                  admin && !r.feedback
                    ? `<form data-assignment="${e(r.id)}"><label class="field">Değerlendirici<select name="reviewer">${members
                        .filter(m => ['reviewer', 'admin'].includes(m.role))
                        .map(
                          m =>
                            `<option value="${e(m.id)}" ${m.id === r.reviewer_id ? 'selected' : ''}>${e(m.email)}</option>`
                        )
                        .join('')}</select></label><button>Değerlendirici ata</button></form>`
                    : ''
                }${canReview && !r.feedback && (admin || r.reviewer_id === me.user.id) ? `<details class="review-details"><summary>Geri bildirim hazırla</summary><p class="muted">Önce dosyayı “Ekranda aç” ile incele. Ölçüt seviyeleri ve çıktı notları adaya açılır; tek bir uygunluk puanı oluşmaz.</p>${root.ReviewUI.form(r, me)}</details>` : ''}<div class="preview-box" data-preview-box="${e(r.id)}"></div></article>`
            )
            .join('')
        : '<p>Henüz teslim yok.</p>'
    }</section>${
      admin
        ? `<section class="card" style="margin-top:20px"><h2>Pilot kullanıcıları</h2><p>Burada yalnız uygulamaya giriş yapmış kişiler görünür. Rol atamak, sitenin erişim iznini değiştirmez.</p>${
            members
              .filter(m => m.role !== 'admin')
              .map(
                m =>
                  `<form data-role="${e(m.id)}"><span>${e(m.email)}</span><label class="field">Rol<select name="role"><option value="candidate" ${m.role === 'candidate' ? 'selected' : ''}>Aday</option><option value="reviewer" ${m.role === 'reviewer' ? 'selected' : ''}>Değerlendirici</option></select></label><button>Rolü kaydet</button></form>`
              )
              .join('') || '<p>Diğer pilot kullanıcıları henüz giriş yapmadı.</p>'
          }</section>`
        : ''
    }`;
    const target = location.hash.split('/')[1];
    if (target && me.cases.some(c => c.id === target)) document.getElementById('pilot-case').value = target;
    wire();
  }
  function selected() {
    return me.cases.find(c => c.id === document.getElementById('pilot-case').value);
  }
  function outputs() {
    const c = selected();
    document.getElementById('pilot-outputs').innerHTML =
      `<p><a href="#cases/${e(c.id)}">Vaka dosyasını incele ↗</a> · <a href="${e(c.wordFile)}">Word indir</a> · <a href="${e(c.excelFile)}">Excel indir</a></p><h3>Senden beklenen çıktılar</h3><ol>${c.outputs.map(o => `<li>${e(o)}</li>`).join('')}</ol>`;
    document.getElementById('pilot-parent').innerHTML =
      '<option value="">Yeni çalışma</option>' +
      rows
        .filter(r => r.user_id === me.user.id && r.case_id === c.id && r.version === c.version)
        .map(
          r =>
            `<option value="${e(r.id)}">${e(r.created.slice(0, 16))} · ${e(r.name)} teslimini revize et</option>`
        )
        .join('');
  }
  async function job(fn) {
    if (busy) return;
    busy = true;
    document.querySelectorAll('#pilot-content button').forEach(b => (b.disabled = true));
    try {
      await fn();
    } catch (err) {
      message(err.message);
    } finally {
      busy = false;
      document.querySelectorAll('#pilot-content button').forEach(b => (b.disabled = false));
    }
  }
  async function refresh() {
    const target = document.getElementById('pilot-content');
    await root.PilotProgress?.refresh(true);
    const loaded = await Promise.all([
      api('submissions'),
      me.user.role === 'admin' ? api('members') : Promise.resolve([]),
    ]);
    if (!target?.isConnected || target !== document.getElementById('pilot-content')) return;
    [rows, members] = loaded;
    draw();
  }
  function wire() {
    document.querySelectorAll('[data-preview]').forEach(
      b =>
        (b.onclick = () => {
          const r = rows.find(x => x.id === b.dataset.preview),
            box = document.querySelector(`[data-preview-box="${CSS.escape(r.id)}"]`);
          if (box.dataset.open) {
            box.innerHTML = '';
            delete box.dataset.open;
            b.textContent = 'Ekranda aç';
            return;
          }
          box.dataset.open = '1';
          b.textContent = 'Önizlemeyi kapat';
          root.ReviewUI.preview(box, r);
        })
    );
    const blind = document.getElementById('pilot-blind');
    if (blind)
      blind.onchange = () =>
        job(async () => {
          const r = await api('settings', { blindReview: blind.checked });
          me.blindReview = r.blindReview;
          await refresh();
          message(r.blindReview ? 'Kör değerlendirme açıldı.' : 'Kör değerlendirme kapatıldı.');
        });
    const bulk = document.getElementById('pilot-bulk-assign');
    if (bulk)
      bulk.onsubmit = ev => {
        ev.preventDefault();
        job(async () => {
          const choice = new FormData(bulk).get('reviewer'),
            reviewers = members.filter(m => ['reviewer', 'admin'].includes(m.role)),
            pool = reviewers.filter(m => m.role === 'reviewer').length
              ? reviewers.filter(m => m.role === 'reviewer')
              : reviewers,
            load = Object.fromEntries(
              pool.map(m => [m.id, rows.filter(r => !r.feedback && r.reviewer_id === m.id).length])
            ),
            targets = root.ReviewUI.sortQueue(rows.filter(r => !r.feedback && !r.reviewer_id));
          if (!pool.length) throw Error('Önce bir kullanıcıya değerlendirici rolü ver.');
          for (const r of targets) {
            // Eşit dağıtımda en az bekleyen işi olan değerlendirici seçilir.
            const id =
              choice === '__balance' ? Object.entries(load).sort((a, b) => a[1] - b[1])[0][0] : choice;
            await api('assign', { id: r.id, reviewer: id });
            if (id in load) load[id]++;
          }
          await refresh();
          message(targets.length + ' teslim atandı.');
        });
      };
    document.getElementById('pilot-refresh').onclick = () =>
      job(async () => {
        if (
          !confirm(
            'Kaydetmediğin değerlendirme veya alıştırma metni varsa önce taslağını kaydet. Teslim listesi yenilensin mi?'
          )
        )
          return;
        await refresh();
        message('Teslimler ve geri bildirimler güncellendi.');
      });
    let requestId = AA.uuid();
    const search = document.getElementById('pilot-search'),
      statusSelect = document.getElementById('pilot-status-filter');
    search.value = queueSearch;
    statusSelect.value = queueStatus;
    const filterQueue = () => {
      queueSearch = search.value;
      queueStatus = statusSelect.value;
      const q = queueSearch.trim().toLocaleLowerCase('tr-TR'),
        status = queueStatus,
        cards = [...document.querySelectorAll('.pilot-delivery')];
      let count = 0;
      for (const card of cards) {
        card.hidden =
          (!!q && !card.dataset.queueText.includes(q)) ||
          (status === 'pending' && card.dataset.reviewed === 'yes') ||
          (status === 'reviewed' && card.dataset.reviewed === 'no');
        if (!card.hidden) count++;
      }
      document.getElementById('pilot-list-count').textContent =
        count +
        ' / ' +
        cards.length +
        ' teslim gösteriliyor.' +
        (count ? '' : ' Filtreleri değiştirerek diğer teslimleri görebilirsin.');
    };
    document.getElementById('pilot-search').oninput = filterQueue;
    document.getElementById('pilot-status-filter').onchange = filterQueue;
    filterQueue();
    outputs();
    wireCycles();
    wireDrafts();
    wireFeedback();
    document.getElementById('pilot-case').onchange = () => {
      requestId = AA.uuid();
      outputs();
    };
    document.querySelector('#pilot-submit input[type=file]').onchange = () => (requestId = AA.uuid());
    document.getElementById('pilot-account-export').onclick = () =>
      job(async () => {
        const data = await api('export'),
          url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })),
          a = document.createElement('a');
        a.href = url;
        a.download = 'aday-atolyesi-hesap-kayitlari.json';
        a.click();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
        message('Hesap kayıtların indirildi. Özgün dosyalarını teslim listesinden ayrıca indirebilirsin.');
      });
    document.getElementById('pilot-save').onclick = () =>
      job(async () => {
        if (
          !confirm(
            'Bu cihazdaki hazırlık kayıtların hesabına gönderilecek. CV metni gönderilmez. Devam edilsin mi?'
          )
        )
          return;
        if (revision === null) throw Error('Hesap kaydı kontrol edilemedi. Sayfayı yenile.');
        let values = Object.fromEntries(
          AA.keys.filter(k => localStorage.getItem(k) !== null).map(k => [k, localStorage.getItem(k)])
        );
        if (!values[AA.KEY]) values[AA.KEY] = JSON.stringify(AA.blank());
        const st = JSON.parse(values[AA.KEY]);
        st.cv = {};
        values[AA.KEY] = JSON.stringify(st);
        const payload = { schema: 'aday-atolyesi-backup-v1', values };
        AA.validateBackup(payload);
        const r = await api('save', { revision, payload }, 'PUT');
        revision = r.revision;
        root.AccountSync?.remember(revision);
        message('Hazırlık kaydın hesabına kaydedildi. Sürüm ' + revision + '.');
      });
    const auto = document.getElementById('pilot-autosync');
    if (auto)
      auto.onchange = () =>
        job(async () => {
          if (!auto.checked) {
            root.AccountSync.disable();
            message('Otomatik kayıt kapatıldı.');
            return;
          }
          if (
            !confirm(
              'Bu cihazdaki hazırlık kaydı hesabına gönderilecek ve sonraki değişiklikler otomatik kaydedilecek. Hesabındaki mevcut kaydın yerine bu cihazdaki geçer. CV metni gönderilmez. Devam edilsin mi?'
            )
          ) {
            auto.checked = false;
            return;
          }
          try {
            revision = await root.AccountSync.enable();
          } catch (err) {
            auto.checked = false;
            throw err;
          }
          message('Otomatik kayıt açıldı. Sürüm ' + revision + '.');
        });
    if (!root.__aaSyncListener)
      ((root.__aaSyncListener = true),
        root.addEventListener('account-sync', () => {
          const out = document.getElementById('pilot-autosync-status'),
            box = document.getElementById('pilot-autosync');
          if (out) out.textContent = root.AccountSync.label();
          if (box) box.checked = root.AccountSync.settings().on;
        }));
    document.getElementById('pilot-load').onclick = () =>
      job(async () => {
        const b = await api('save');
        if (!b.payload) throw Error('Hesabında henüz hazırlık kaydı yok.');
        const values = AA.validateBackup(b.payload);
        if (
          !confirm(
            'Bu cihazdaki çalışmalar hesap kaydıyla değiştirilecek. CV metnin korunur. Önce cihaz yedeğini indir. Devam edilsin mi?'
          )
        )
          return;
        const localCv = AA.read(localStorage, AA.KEY, AA.blank()).cv;
        const loaded = JSON.parse(values[AA.KEY]);
        loaded.cv = localCv;
        values[AA.KEY] = JSON.stringify(loaded);
        applyRecords(localStorage, AA.keys, values);
        root.AccountSync?.remember(b.revision);
        location.reload();
      });
    document.getElementById('pilot-submit').onsubmit = ev => {
      ev.preventDefault();
      const form = ev.currentTarget;
      job(async () => {
        const f = new FormData(form),
          file = f.get('file'),
          c = selected();
        if (!file?.size || file.size > me.maxBytes) throw Error('Dosyan en fazla 10 MB olabilir.');
        if (!/\.(pdf|docx|xlsx)$/i.test(file.name)) throw Error('PDF, DOCX veya XLSX yükle.');
        if (f.get('parent') && !String(f.get('note')).trim())
          throw Error('Revizyonda nelerin değiştiğini yaz.');
        const params = new URLSearchParams({
          op: 'submit',
          request: requestId,
          case: c.id,
          version: c.version,
          name: file.name,
          parent: f.get('parent'),
          note: f.get('note'),
          confirmed: f.get('confirmed') === 'on' ? 'yes' : 'no',
        });
        const ctrl = new AbortController(),
          timer = setTimeout(() => ctrl.abort(), 60000);
        let r;
        try {
          r = await fetch('/api/pilot?' + params, {
            method: 'POST',
            headers: { 'Content-Type': 'application/octet-stream' },
            body: file,
            signal: ctrl.signal,
          });
        } catch {
          throw Error(
            'Teslim bağlantısı kesildi. Dosyan ekranda duruyor. Yeniden denemede aynı teslim kodu kullanılır.'
          );
        } finally {
          clearTimeout(timer);
        }
        const b = await r.json();
        if (!r.ok) throw Error(b.error);
        const receipt = 'Teslimin alındı. Teslim kodu: ' + b.id;
        try {
          await refresh();
          message(receipt);
        } catch {
          message(receipt + ' Liste yenilenemedi. Teslimleri yenile düğmesini kullan.');
        }
      });
    };
    document.querySelectorAll('[data-role]').forEach(
      form =>
        (form.onsubmit = ev => {
          ev.preventDefault();
          job(async () => {
            await api('role', { id: form.dataset.role, role: new FormData(form).get('role') });
            await refresh();
            message('Kullanıcı rolü kaydedildi.');
          });
        })
    );
    document.querySelectorAll('[data-assignment]').forEach(
      form =>
        (form.onsubmit = ev => {
          ev.preventDefault();
          job(async () => {
            await api('assign', {
              id: form.dataset.assignment,
              reviewer: new FormData(form).get('reviewer'),
            });
            await refresh();
            message('Değerlendirici atandı.');
          });
        })
    );
    document.querySelectorAll('[data-review]').forEach(
      form =>
        (form.onsubmit = ev => {
          ev.preventDefault();
          job(async () => {
            const r = rows.find(r => r.id === form.dataset.review);
            if (!confirm('Geri bildirim adaya açılacak ve bu teslim için sabitlenecek. Yayımlansın mı?'))
              return;
            await api('review', root.ReviewUI.collect(form, r, me));
            await refresh();
            message('Geri bildirim yayımlandı.');
          });
        })
    );
  }
  async function bind() {
    const target = document.getElementById('pilot-content'),
      ticket = ++bindTicket;
    if (!target) return;
    try {
      // Misafir kullanıcıda kimlik isteği göndermeden giriş seçeneğini göster.
      if (root.PilotProgress) {
        await root.PilotProgress.refresh(true);
        if (root.PilotProgress.status() === 'guest')
          throw Object.assign(Error('Devam etmek için hesabınla giriş yap.'), { status: 401 });
      }
      const identity = await api('me');
      if (ticket !== bindTicket || !target.isConnected) return;
      me = identity;
      const s = await api('save');
      if (ticket !== bindTicket || !target.isConnected) return;
      revision = s.revision;
      await refresh();
    } catch (err) {
      const n = document.getElementById('pilot-content');
      if (n === target && ticket === bindTicket) {
        n.innerHTML = `<section class="card"><p>${e(err.message)}</p>${err.status === 401 ? (root.AA_LOCAL_DEMO ? '<a class="btn primary" href="/signin-with-chatgpt">Demo rolünü seç</a><p>Yerel demo kayıtları sunucu kapanınca silinir.</p>' : '<a class="btn primary" href="/signin-with-chatgpt?return_to=%2Fworkspace.html%23pilot" target="_top">Giriş yap</a><p>Hesabınla giriş yaptığında teslimlerin ve geri bildirimlerin her cihazdan açılır.</p>') : '<button id="pilot-retry">Tekrar dene</button>'}</section>`;
        document.getElementById('pilot-retry')?.addEventListener('click', bind);
      }
    }
  }
  function fields(form, r) {
    return root.ReviewUI.collect(form, r, me);
  }
  function wireDrafts() {
    document.querySelectorAll('[data-review]').forEach(form => {
      const r = rows.find(r => r.id === form.dataset.review),
        details = form.closest('details');
      const local = root.WorkspaceReliability?.sessionDraft(
        form,
        'aa-review-draft:' + me.user.id + ':' + r.id
      );
      root.ReviewUI.bindForm(form, r, me);
      let loaded = false,
        dirty = !!local?.dirty();
      form.addEventListener('input', () => (dirty = true));
      details.addEventListener('toggle', async () => {
        if (!details.open || loaded) return;
        loaded = true;
        try {
          const { draft } = await api('reviewdraft&id=' + encodeURIComponent(r.id));
          if (draft && !dirty) root.ReviewUI.fill(form, draft);
        } catch (err) {
          loaded = false;
          message(err.message + ' Taslak bölümünü kapatıp açarak tekrar dene.');
        }
      });
      form.querySelector('[data-review-save]').onclick = () =>
        job(async () => {
          await api('reviewdraft', fields(form, r));
          message('Değerlendirme taslağı hesabına kaydedildi. Yayımlanıncaya kadar adaya görünmez.');
        });
    });
    if (me.user.role === 'admin')
      api('metrics')
        .then(m => {
          const n = document.getElementById('pilot-content');
          if (!n) return;
          const section = document.createElement('section');
          section.className = 'card';
          section.style.marginTop = '20px';
          section.innerHTML = `<h2>Pilot çalışma kayıtları</h2><p>${m.candidates} aday hesabı · ${m.saved} hazırlık kaydı · ${m.submitters} dosya gönderen hesap</p><p>${m.submissions} teslim · ${m.reviews} geri bildirim · ${m.revisions} revizyon · ${(m.bytes / 1048576).toFixed(1)} MB dosya</p><p class="muted">Bunlar işlem sayılarıdır; öğrenme kazanımı veya ticari başarı ölçümü değildir. Yönetici denemeleri teslim sayılarına dahil olabilir.</p>`;
          n.appendChild(section);
        })
        .catch(err => message(err.message));
  }
  function wireCycles() {
    document.querySelectorAll('[data-cycle]').forEach(details => {
      let loaded = false;
      const load = async () => {
        if (!details.open || loaded) return;
        loaded = true;
        const box = details.querySelector('[data-cycle-content]');
        try {
          const b = await api(
            'learning&case=' +
              encodeURIComponent(details.dataset.cycle) +
              '&version=' +
              encodeURIComponent(details.dataset.version)
          );
          drawCycle(box, b);
        } catch (err) {
          box.textContent = err.message;
          loaded = false;
        }
      };
      details.addEventListener('toggle', load);
      if (location.hash.split('/')[1] === details.dataset.cycle) {
        details.open = true;
        load();
      }
    });
  }
  function drawCycle(box, b) {
    const s = b.state;
    box.innerHTML = `<h3>${e(s.title)}</h3><p>${e(s.detail)}</p>${b.sections.length ? `<details><summary>Referans yaklaşım ve dayanaklar</summary>${b.sections.map(x => `<h4>${e(x.title)}</h4><p>${e(x.sources)} · ${e(x.text)}</p>`).join('')}</details>` : ''}${b.drills.map((d, i) => `<form data-practice="${i}"><h4>${e(d.title)}</h4><p>${e(d.prompt)}</p><label class="field">Yanıtın<textarea name="answer" required maxlength="8000">${e(s.data.practice?.[i] || '')}</textarea></label><button>Alıştırmayı kaydet</button>${d.reference ? `<details><summary>Yanıtından sonra referans</summary><p>${e(d.reference)}</p></details>` : ''}</form>`).join('')}${s.phase === 'revision' ? '<p>Üstteki teslim formunda bu vakanın önceki teslimini seç. Revize dosyanı ve değişiklik notunu gönder.</p>' : ''}${b.update ? `<form data-defense><h4>${e(b.update.title)}</h4><p>${e(b.update.text)}</p><label class="field">Yeni bilgiye göre kararın ve gerekçen<textarea name="answer" required maxlength="8000">${s.data.defenseSubmissionId === s.latestId ? e(s.data.defense || '') : ''}</textarea></label><button>Karar savunmamı kaydet</button>${b.update.reference ? `<details><summary>Savunmandan sonra referans</summary><p>${e(b.update.reference)}</p></details>` : ''}</form>` : ''}${['transfer', 'new-context', 'complete'].includes(s.phase) ? `<button data-transfer>Yeni bağlam bağlantısını kur ve vakaya geç</button>` : ''}`;
    box
      .querySelectorAll('form')
      .forEach((form, i) =>
        root.WorkspaceReliability?.sessionDraft(
          form,
          'aa-cycle-draft:' + me.user.id + ':' + s.latestId + ':' + i
        )
      );
    const send = extra =>
      job(async () => {
        await api('learning', {
          case: s.caseId,
          version: s.version,
          revision: s.revision,
          rootId: s.rootId,
          latestId: s.latestId,
          ...extra,
        });
        await refresh();
        message('Gelişim adımın kaydedildi. Hazırlık planın güncellendi.');
      });
    box.querySelectorAll('[data-practice]').forEach(
      form =>
        (form.onsubmit = ev => {
          ev.preventDefault();
          send({
            action: 'practice',
            index: Number(form.dataset.practice),
            answer: new FormData(form).get('answer'),
          });
        })
    );
    box.querySelector('[data-defense]')?.addEventListener('submit', ev => {
      ev.preventDefault();
      send({ action: 'defense', answer: new FormData(ev.currentTarget).get('answer') });
    });
    box.querySelector('[data-transfer]')?.addEventListener('click', () =>
      job(async () => {
        await api('learning', {
          case: s.caseId,
          version: s.version,
          revision: s.revision,
          rootId: s.rootId,
          latestId: s.latestId,
          action: 'transfer',
        });
        location.hash = 'pilot/' + b.transfer;
        await refresh();
        message('Yeni bağlam bağlantısı kuruldu. Yeni şirket dosyasını inceleyip yanıtını hazırla.');
      })
    );
  }
  const pilotTaskLabels = {
    source: 'Öneriyi kendi cevabımla ilişkilendirme',
    practice: 'Kısa çalışma yapma',
    revision: 'Geri bildirim sonrası revizyon',
    transfer: 'Yeni vakada uygulama',
    rehearsal: 'Seçili örnekle mülakat provası',
  };
  const taskStates = {
    not_tried: 'Henüz denemedim',
    alone: 'Yardımsız tamamladım',
    help: 'Yardımla tamamladım',
    blocked: 'Takıldım / bıraktım',
  };
  function observationForm(f) {
    const o = f.observations || {};
    return `<details><summary>Görev bazında ne yaşadın? · isteğe bağlı</summary><p>Yalnız denediğin adımları bildir. Süre kendi tahminindir; otomatik ölçüm veya beceri puanı değildir.</p><div class="formgrid"><label class="field">Hazırlık yolu<select name="obs-path"><option value="">Belirtmek istemiyorum</option>${[
      ['analyst', 'Analist'],
      ['operations', 'Operasyon'],
      ['lead', 'Ekip lideri'],
      ['other', 'Diğer'],
    ]
      .map(([v, t]) => `<option value="${v}" ${o.path === v ? 'selected' : ''}>${t}</option>`)
      .join(
        ''
      )}</select></label><label class="field">Kullandığın cihaz<select name="obs-device"><option value="">Belirtmek istemiyorum</option>${[
      ['phone', 'Telefon'],
      ['tablet', 'Tablet'],
      ['desktop', 'Bilgisayar'],
    ]
      .map(([v, t]) => `<option value="${v}" ${o.device === v ? 'selected' : ''}>${t}</option>`)
      .join('')}</select></label></div>${Object.entries(pilotTaskLabels)
      .map(
        ([id, label]) =>
          `<fieldset><legend>${label}</legend><label class="field">Durum<select name="obs-${id}">${Object.entries(
            taskStates
          )
            .map(
              ([v, t]) =>
                `<option value="${v}" ${(o.tasks?.[id]?.status || 'not_tried') === v ? 'selected' : ''}>${t}</option>`
            )
            .join(
              ''
            )}</select></label><label class="field">Yaklaşık dakika · boş bırakabilirsin<input name="minutes-${id}" type="number" min="0" max="1440" step="1" value="${e(o.tasks?.[id]?.minutes ?? '')}"></label></fieldset>`
      )
      .join(
        ''
      )}<label class="field">Benzer ihtiyacında hangi seçeneği düşünürdün?<select name="obs-nextUse"><option value="">Belirtmek istemiyorum</option>${[
      ['free', 'Ücretsiz kullanmayı'],
      ['paid', 'Kapsam ve fiyatı görünce ücretli denemeyi'],
      ['unsure', 'Henüz karar veremiyorum'],
      ['no', 'Tekrar kullanmayı düşünmem'],
    ]
      .map(([v, t]) => `<option value="${v}" ${o.nextUse === v ? 'selected' : ''}>${t}</option>`)
      .join(
        ''
      )}</select></label><p>Bu seçim satın alma, fiyat onayı veya ödeme taahhüdü değildir.</p></details>`;
  }
  function observationDisplay(o) {
    return o
      ? `<p><b>Yol / cihaz:</b> ${e(o.path || 'Belirtilmedi')} / ${e(o.device || 'Belirtilmedi')}</p><ul>${Object.entries(
          o.tasks || {}
        )
          .map(
            ([id, t]) =>
              `<li>${e(pilotTaskLabels[id])}: ${e(taskStates[t.status])}${t.minutes !== null ? ' · ' + e(t.minutes) + ' dk' : ''}</li>`
          )
          .join(
            ''
          )}</ul><p><b>Sonraki kullanım tercihi:</b> ${e({ free: 'Ücretsiz', paid: 'Fiyat ve kapsam sonrası ücretli denemeyi düşünebilir', unsure: 'Kararsız', no: 'Tekrar düşünmüyor' }[o.nextUse] || 'Belirtilmedi')} · aday beyanı, satış değildir.</p>`
      : '';
  }
  function wireFeedback() {
    const parent = document.getElementById('pilot-content');
    if (!parent) return;
    if (me.user.role === 'admin') {
      api('pilotfeedback-summary')
        .then(summary => {
          if (!parent.isConnected) return;
          const n = document.createElement('section');
          n.className = 'card';
          n.style.marginTop = '20px';
          n.innerHTML = `<h2>Pilot görev özeti</h2><p>${summary.respondents} geri bildirim sahibi · ${summary.observed} görev gözlemi bildiren kişi. Bunlar aday beyanlarıdır; katılmayanları veya tüm davetlileri kapsayan başarı oranı değildir.</p><div class="tablewrap"><table><thead><tr><th>Görev</th><th>Yardımsız</th><th>Yardımla</th><th>Takıldı</th><th>Denemedi</th></tr></thead><tbody>${Object.entries(
            summary.tasks
          )
            .map(
              ([id, t]) =>
                `<tr><td>${e(pilotTaskLabels[id])}</td><td>${t.alone}</td><td>${t.help}</td><td>${t.blocked}</td><td>${t.not_tried}</td></tr>`
            )
            .join(
              ''
            )}</tbody></table></div><p>Sütunlar kişi sayısıdır; boş bırakılan eski gözlemler sayılmaz. Henüz denememek başarısızlık olarak sayılmaz.</p>`;
          parent.appendChild(n);
        })
        .catch(err => message(err.message));
      api('pilotfeedback-all')
        .then(rows => {
          if (!parent.isConnected) return;
          const section = document.createElement('section');
          section.className = 'card';
          section.style.marginTop = '20px';
          section.innerHTML = `<h2>Pilot deneyim geri bildirimleri</h2><label class="field">Teslimlerde ara<input id="pilot-search" type="search" placeholder="Vaka, dosya veya kişi"></label><label class="field">Görüş durumu<select id="pilot-status-filter"><option value="all">Tümü</option><option value="pending">Geri bildirim bekleyen</option><option value="reviewed">Geri bildirim verilen</option></select></label><p id="pilot-list-count" role="status"></p>${rows.length ? rows.map(r => `<article><h3>${e(r.email)}</h3><p>Kullanım kolaylığı: ${r.payload.ease}/5 · Tekrar kullanım: ${e({ yes: 'Evet', no: 'Hayır', unsure: 'Kararsız' }[r.payload.repeat])}</p><p><b>Fayda:</b> ${e(r.payload.useful)}</p><p><b>Zorluk:</b> ${e(r.payload.difficulty)}</p><p><b>Öneri:</b> ${e(r.payload.suggestion)}</p>${observationDisplay(r.payload.observations)}</article>`).join('') : '<p>Henüz deneyim geri bildirimi yok.</p>'}`;
          parent.appendChild(section);
        })
        .catch(err => message(err.message));
      return;
    }
    if (me.user.role !== 'candidate') return;
    api('pilotfeedback')
      .then(({ feedback: f, updated }) => {
        if (!parent.isConnected) return;
        f = f || {};
        const section = document.createElement('section');
        section.className = 'card';
        section.style.marginTop = '20px';
        section.innerHTML = `<h2>Pilot deneyimini paylaş</h2><p>Bu form ürünü geliştirmek içindir; değerlendirme sonucunu etkilemez. Yanıtlarını yönetici görür.</p><form id="pilot-feedback"><label class="field">Kullanımı ne kadar kolay buldun?<select name="ease" required><option value="">Seç</option>${[1, 2, 3, 4, 5].map(n => `<option value="${n}" ${f.ease === n ? 'selected' : ''}>${n} · ${['Çok zor', 'Zor', 'Orta', 'Kolay', 'Çok kolay'][n - 1]}</option>`).join('')}</select></label><label class="field">En faydalı bulduğun çıktı neydi?<textarea name="useful" required maxlength="3000">${e(f.useful || '')}</textarea></label><label class="field">Nerede zorlandın? Zorlanmadıysan belirt.<textarea name="difficulty" required maxlength="3000">${e(f.difficulty || '')}</textarea></label><label class="field">Tekrar kullanmak ister misin?<select name="repeat" required><option value="">Seç</option>${[
          ['yes', 'Evet'],
          ['no', 'Hayır'],
          ['unsure', 'Kararsızım'],
        ]
          .map(([v, t]) => `<option value="${v}" ${f.repeat === v ? 'selected' : ''}>${t}</option>`)
          .join(
            ''
          )}</select></label><label class="field">Önerin · isteğe bağlı<textarea name="suggestion" maxlength="3000">${e(f.suggestion || '')}</textarea></label>${observationForm(f)}<button>Deneyim geri bildirimimi kaydet</button></form>`;
        parent.appendChild(section);
        root.WorkspaceReliability?.sessionDraft(
          section.querySelector('form'),
          'aa-pilot-experience:' + me.user.id,
          updated || null
        );
        section.querySelector('form').onsubmit = ev => {
          ev.preventDefault();
          const fields = Object.fromEntries(new FormData(ev.currentTarget));
          job(async () => {
            await api('pilotfeedback', {
              ease: Number(fields.ease),
              repeat: fields.repeat,
              useful: fields.useful,
              difficulty: fields.difficulty,
              suggestion: fields.suggestion,
              observations: {
                path: fields['obs-path'],
                device: fields['obs-device'],
                nextUse: fields['obs-nextUse'],
                tasks: Object.fromEntries(
                  Object.keys(pilotTaskLabels).map(id => [
                    id,
                    {
                      status: fields['obs-' + id],
                      minutes: fields['minutes-' + id] === '' ? null : Number(fields['minutes-' + id]),
                    },
                  ])
                ),
              },
            });
            message('Pilot deneyim geri bildirimin kaydedildi. İstersen daha sonra güncelleyebilirsin.');
          });
        };
      })
      .catch(err => message(err.message));
  }
  function applyRecords(storage, keys, values) {
    const old = Object.fromEntries(keys.map(k => [k, storage.getItem(k)]));
    try {
      keys.forEach(k => storage.removeItem(k));
      for (const [k, v] of Object.entries(values)) storage.setItem(k, v);
    } catch (err) {
      keys.forEach(k => storage.removeItem(k));
      for (const [k, v] of Object.entries(old)) if (v !== null) storage.setItem(k, v);
      throw Error('Cihazda yer yok. Önceki kayıtlar korundu.');
    }
  }
  root.PilotUI = { view, bind, applyRecords };
})(window);
