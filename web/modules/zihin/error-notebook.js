(function (root) {
  'use strict';
  const e = v =>
      String(v ?? '').replace(
        /[&<>"']/g,
        c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]
      ),
    plain = v =>
      String(v ?? '')
        .replace(/<[^>]*>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
  const checks = {
    num: 'Kuralını en az iki farklı geçişte denetle; yalnız son sayıyı açıklaması yeterli mi?',
    shape: 'Yön, sayı, konum ve doluluk özelliklerini ayrı kontrol ettin mi?',
    verbal: 'Metindeki ifade ile kendi varsayımını hangi cümlede ayırdın?',
    attention: 'Kontrol ölçütünü her kayıt için aynı sırayla uyguladın mı?',
    quant: 'Birim, dönem, payda ve işlem sırasını hesaplamadan önce yazdın mı?',
    logic: 'Tüm koşulları ve istisnayı aynı aday çözümde kontrol ettin mi?',
  };
  function items(data) {
    return (data.reports || [])
      .filter(r => !r.sample && !r.synthetic)
      .flatMap(r =>
        (r.itemResults || [])
          .filter(q => q.answered && !q.correct)
          .map(q => ({ report: r, q, key: r.id + '|' + q.id }))
      );
  }
  function view(data, app, persist) {
    let requested = [];
    try {
      requested = (root.location?.hash || '').split('/').slice(1).map(decodeURIComponent);
    } catch {}
    const rows = items(data),
      selected =
        rows.find(x => x.report.id === requested[0] && x.q.id === requested[1]) ||
        rows.find(x => x.key === data.errorReviewSelection) ||
        rows[0];
    app.innerHTML = `<span class="eyebrow">Hata defterim / Yanlış → yöntem → yeni soru</span><h1>Yanlış cevabını<br>bir çalışma adımına çevir.</h1><p>Yalnız gerçek denemelerde yanıtladığın yanlışlar burada. Aynı soruyu yeniden görmek yeni ve bağımsız bir ölçüm değildir. Kayıtların deneme puanını değiştirmez.</p>${selected ? `<label class="field">İnceleyeceğin yanıt<select id="error-selection">${rows.map(x => `<option value="${e(x.key)}" ${x.key === selected.key ? 'selected' : ''}>${e(x.report.name)} · ${x.q.index}. ${e(x.q.name)}</option>`).join('')}</select></label>${card(data, selected)}` : '<section class="panel"><h2>İncelenecek yanlış yanıt yok.</h2><p>Örnek raporlar ve boş bırakılan sorular buraya alınmaz. Yeni bir gerçek denemeden sonra kayıtlar oluşur.</p><a class="btn" href="#exam">Sınav provası →</a></section>'}`;
    if (!selected) return;
    app.querySelector('#error-selection').onchange = ev => {
      data.errorReviewSelection = ev.target.value;
      persist();
      if (root.location) root.location.hash = 'mistakes';
      view(data, app, persist);
    };
    const form = app.querySelector('#error-note');
    app.querySelector('#error-delete')?.addEventListener('click', () => {
      delete data.errorReviews[selected.key];
      persist();
      view(data, app, persist);
    });
    form.addEventListener('input', () => {
      const f = Object.fromEntries(new FormData(form));
      const note = {
        reportId: selected.report.id,
        itemId: selected.q.id,
        reason: f.reason,
        method: f.method,
        check: f.check,
        at: new Date().toISOString(),
      };
      if (!data.errorReviews?.[selected.key] && Object.keys(data.errorReviews || {}).length >= 300) {
        form.querySelector('[role=status]').textContent =
          '300 çalışma notu sınırına ulaştın. Önce yedeğini al; eski notları kaldırarak alan açabilirsin.';
        return;
      }
      data.errorReviews = { ...data.errorReviews, [selected.key]: note };
      form.querySelector('[role=status]').textContent =
        persist() === false ? 'Kaydedilemedi; metnini kopyala.' : 'Taslak bu cihazda korunuyor.';
    });
    form.onsubmit = ev => {
      ev.preventDefault();
      if (!form.elements.method.value.trim() || !form.elements.check.value.trim()) {
        form.querySelector('[role=status]').textContent = 'Yöntemini ve kontrolünü yaz.';
        return;
      }
      form.querySelector('[role=status]').textContent =
        persist() === false
          ? 'Kaydedilemedi.'
          : 'Çalışma notun kayıtlı. Yeni sorularda bu yöntemi sınayabilirsin.';
    };
  }
  function card(data, x) {
    const q = x.q,
      n = data.errorReviews?.[x.key] || {};
    return `<div class="trainrow"><section class="panel"><h2>${e(q.name)}</h2><p>${e(plain(q.stem))}</p>${q.context ? `<p>${e(plain(q.context).slice(0, 2200))}</p>` : ''}<p><b>Seçimin:</b> ${e(plain(q.selectedDisplay))}</p><p>${q.hinted ? 'Bu yanıtta ipucu kullanıldı; bağımsız çözüm sayılmaz.' : 'Bu yanıtta ipucu kaydı yok.'}</p><details><summary>Çözümü ve geri bildirimi incele</summary><p>${e(plain(q.solution))}</p><p>${e(plain(q.diagnostic))}</p></details><a class="btn light" href="#report/${e(x.report.id)}">Şekil / tablo dahil özgün raporu aç →</a><p>Hata nedeni aşağıda senin hipotezindir; tek yanlış cevaptan düşünme nedenini kesin olarak çıkarmıyoruz.</p></section><form id="error-note" class="panel"><label class="field">Nerede zorlandığını düşünüyorsun?<select name="reason">${[
      ['unknown', 'Henüz emin değilim'],
      ['reading', 'Koşulu veya metni yorumlama'],
      ['rule', 'Yöntem / kural seçimi'],
      ['calculation', 'İşlem, birim veya veri kontrolü'],
      ['time', 'Zamanı kullanma'],
    ]
      .map(
        ([v, t]) => `<option value="${v}" ${(n.reason || 'unknown') === v ? 'selected' : ''}>${t}</option>`
      )
      .join(
        ''
      )}</select></label><label class="field">Kendi çözüm yöntemin · yeniden yaz<textarea name="method" maxlength="3000" required rows="4">${e(n.method || '')}</textarea></label><p>${e(checks[q.cat])}</p><label class="field">Bir sonraki soruda neyi, nasıl kontrol edeceksin?<textarea name="check" maxlength="3000" required rows="3">${e(n.check || '')}</textarea></label><button class="btn">Çalışma notumu kaydet</button><p role="status">${n.at ? 'Kayıtlı notun açıldı.' : ''}</p>${n.at ? '<button type="button" id="error-delete" class="btn light">Bu çalışma notunu kaldır</button>' : ''}<a class="btn" href="#train/${e(q.cat)}">Yeni sorularla bu alanı çalış →</a></form></div>`;
  }
  root.ErrorNotebook = { items, view, checks };
})(window);
