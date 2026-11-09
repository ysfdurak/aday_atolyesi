(function (root) {
  'use strict';
  const R = root.Rehearsal,
    e = v =>
      String(v ?? '').replace(
        /[&<>"']/g,
        c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]
      );
  const snapshot = () => AA.snapshot(localStorage),
    sources = () => R.sources(state, snapshot(), root.CASE_CATALOG);
  function selected() {
    const ss = sources();
    return ss.find(s => s.key === state.rehearsal?.selected) || ss[0];
  }
  function sourceView(raw) {
    const s = JSON.parse(raw),
      labels = {
        title: 'Başlık',
        topic: 'Konu',
        kind: 'Kaynak türü',
        situation: 'Durum ve görev',
        action: 'Kendi katkın',
        result: 'Sonuç',
        source: 'Sonucun dayanağı',
        alternative: 'Alternatif ve gerekçe',
        learning: 'Öğrenme ve aktarım',
        tradeoff: 'Risk ve dış koşul',
        version: 'Vaka sürümü',
        submittedAt: 'Teslim tarihi',
      };
    return Object.entries(s)
      .map(([k, v]) =>
        k === 'outputs'
          ? v.map(o => `<h4>${e(o.label)}</h4><div class="quote">${e(o.answer)}</div>`).join('')
          : `<h4>${e(labels[k] || k)}</h4><div class="quote">${e(k === 'kind' ? root.Evidence.kinds[v] || v : v || 'Henüz açıklanmadı')}</div>`
      )
      .join('');
  }
  function view() {
    const ss = sources(),
      s = selected(),
      r = s && R.find(state, s),
      history = (state.rehearsal?.records || []).filter(
        x => ss.some(s => s.key === x.key) && (!s || x.id !== r?.id)
      );
    return `<span class="eyebrow">Seçili kaydın → cevabın → takip sorusu → yeniden deneme</span><h1>Görüşmeden önce<br><em>anlatımını prova et.</em></h1><p class="muted">Sorular yalnız mülakat dosyana seçtiğin deneyim ve metin vakalarından gelir. Yazılı prova veya sesli çalışıp not alma için kullan. Ses kaydı, AI değerlendirmesi veya otomatik başarı puanı yoktur.</p><div class="actions"><a class="btn" href="#dossier">Dosyadaki seçimleri düzenle →</a><a class="btn" href="#growth">Gelişim raporum →</a></div>${s ? `<label class="field">Çalışacağın örnek<select id="rehearsal-source">${ss.map(x => `<option value="${e(x.key)}" ${x.key === s.key ? 'selected' : ''}>${e(x.title)} · ${e(x.type)}</option>`).join('')}</select></label><div class="grid2 rehearsal-layout"><section class="card"><span class="tag">${e(s.type)}</span><h2>${e(s.title)}</h2><p>${e(s.question)}</p><a class="btn" href="${e(s.href)}">Kaynak kaydı aç →</a><details><summary>Provaya bağlı kaynak metni</summary>${sourceView(s.body)}</details>${s.gaps.length ? `<h3>Kaynakta açık kalan sorular</h3><ul>${s.gaps.map(x => `<li>${e(x)}</li>`).join('')}</ul>` : ''}<details><summary>Dinlerken kontrol edilecek noktalar</summary><p>Durumu, kendi kararını, dayanağını ve doğrulayamadığın noktayı ayırabiliyor musun? Bir sayısal sonuç söylüyorsan kaynağını ve kapsamını açıklayabiliyor musun? Bunlar öz kontrol sorularıdır; metnin doldurulması kalite onayı değildir.</p></details></section><form class="card" id="rehearsal-form"><label class="field">İlk cevabın veya sesli provadan notun<textarea name="answer" maxlength="6000" rows="6" required>${e(r?.answer || '')}</textarea></label><h3>Takip sorusu</h3><p>${e(s.followup)}</p><label class="field">Takip sorusuna cevabın<textarea name="followupAnswer" maxlength="6000" rows="4" required>${e(r?.followupAnswer || '')}</textarea></label><label class="field">Cevabında neyi kontrol ettin; sonraki denemede neyi değiştireceksin?<textarea name="reflection" maxlength="3000" rows="3" required>${e(r?.reflection || '')}</textarea></label><p class="muted">Yazdıkların taslak olarak bu cihazda korunur. Denemeyi kaydettiğinde önceki cevap değişmez; en fazla beş deneme saklanır.</p><button class="primary">Bu denemeyi kaydet</button>${r ? `<button type="button" data-rehearsal-delete="${e(r.id)}">Bu prova kaydını kaldır</button>` : ''}<p id="rehearsal-status" role="status">${r?.rounds.length ? r.rounds.length + ' kayıtlı deneme; içerik kalitesi puanlanmadı.' : r ? 'Taslağın açıldı.' : ''}</p></form></div>${r?.rounds.length ? `<section class="card"><h2>Aynı kaynaktaki denemelerin</h2>${r.rounds.map((a, i) => `<details><summary>${i + 1}. deneme · ${e(new Date(a.at).toLocaleString('tr-TR', { timeZone: 'Europe/Istanbul' }))}</summary><h3>Cevabım</h3><div class="quote">${e(a.answer)}</div><h3>Takip cevabım</h3><div class="quote">${e(a.followupAnswer)}</div><h3>Kontrol ve sonraki değişiklik</h3><div class="quote">${e(a.reflection)}</div></details>`).join('')}</section>` : ''}` : '<section class="empty"><h2>Önce bir deneyim veya vaka seç.</h2><p>Mülakat dosyanda seçili içerik yok. Yalnız modül özetleri seçiliyse prova sorusu üretilmez. Başlamak için bir deneyim yazıp dosyana ekleyebilirsin.</p><a class="btn" href="#examples">Deneyim örneği yaz →</a><a class="btn" href="#dossier">Dosyamı düzenle →</a></section>'}${history.length ? `<section class="card"><h2>Önceki kaynaklara bağlı notlar</h2><p>Seçili kaynak değiştiyse veya geri bildirim yenilendiyse eski prova yeni kaynağa taşınmaz. Aşağıdaki kayıtlar önceki kaynak metnine bağlıdır.</p>${history.map(x => `<details><summary>${e(x.title)} · ${x.rounds.length} deneme / taslak</summary><p>${e(x.type)}</p><p>${e(x.question)}</p><div class="quote">${e(x.answer)}</div><p>${e(x.followup)}</p><div class="quote">${e(x.followupAnswer)}</div><p>${e(x.reflection)}</p><details><summary>O sıradaki kaynak metni</summary>${sourceView(x.source)}</details><button data-rehearsal-delete="${e(x.id)}">Bu prova kaydını kaldır</button></details>`).join('')}</section>` : ''}<p class="note">Prova notları mülakat dosyasına otomatik eklenmez. Tam cihaz yedeğinde ve hesabına açıkça kaydettiğin hazırlık kaydında bulunur. Bir örneği seçimden çıkardığında ona bağlı prova bu ekranda gösterilmez.</p>`;
  }
  function persist(next) {
    const prior = state;
    state = next;
    if (!save()) {
      state = prior;
      throw Error('Cihaza kaydedilemedi. Yazdıklarını ekranda koru ve yedeğini al.');
    }
  }
  function bind() {
    const form = document.getElementById('rehearsal-form');
    document.getElementById('rehearsal-source')?.addEventListener('change', ev => {
      try {
        persist({
          ...state,
          rehearsal: {
            ...state.rehearsal,
            records: state.rehearsal?.records || [],
            selected: ev.target.value,
          },
        });
        render({ preserveScroll: true });
      } catch (err) {
        toast(err.message);
      }
    });
    if (form) {
      const s = selected();
      form.addEventListener('input', () => {
        try {
          persist(R.update(state, s, Object.fromEntries(new FormData(form))));
          document.getElementById('rehearsal-status').textContent = 'Prova taslağı bu cihaza kaydedildi.';
        } catch (err) {
          document.getElementById('rehearsal-status').textContent = err.message;
        }
      });
      form.onsubmit = ev => {
        ev.preventDefault();
        try {
          persist(R.complete(state, s, Object.fromEntries(new FormData(form))));
          render({ preserveScroll: true });
        } catch (err) {
          document.getElementById('rehearsal-status').textContent = err.message;
        }
      };
    }
    document.querySelectorAll('[data-rehearsal-delete]').forEach(
      b =>
        (b.onclick = () => {
          if (
            !confirm('Bu prova taslağı ve önceki denemeleri silinsin mi? Kaynak deneyim veya vaka korunur.')
          )
            return;
          try {
            persist({
              ...state,
              rehearsal: {
                ...state.rehearsal,
                records: state.rehearsal.records.filter(r => r.id !== b.dataset.rehearsalDelete),
              },
            });
            render({ preserveScroll: true });
          } catch (err) {
            toast(err.message);
          }
        })
    );
  }
  root.RehearsalUI = { view, bind };
})(window);
