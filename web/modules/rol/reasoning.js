(function (root) {
  'use strict';
  const e = v =>
    String(v ?? '').replace(
      /[&<>"']/g,
      c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]
    );
  const probe = {
    ogrenme: 'Öğrendiğini hangi yeni bağlamdaki çıktı ile sınarsın?',
    gelisim: 'Gelişimi katılımdan ayrı hangi çıktı gösterir?',
    delegasyon: 'Yetki sınırı değişse hangi adımı değiştirirsin?',
    performans: 'Gözlem ile niyet yorumunu nasıl ayırırsın?',
    catisma: 'Diğer tarafın hangi bilgisi kararını değiştirebilir?',
    karar: 'En kritik varsayım yanlışsa hangi seçeneğe dönersin?',
    plan: 'Hangi bağımlılık planını uygulanamaz yapar?',
    degisim: 'Hangi gözlemde denemeyi durdurursun?',
    adalet: 'Aynı koşuldaki başka bir kişiye aynı ölçütü uygular mısın?',
    surec: 'Yerel kazanç sonraki adımı nasıl etkiler?',
    analitik: 'Karşılaştırmanın birimi ve paydası ne?',
    kokneden: 'Belirtiyi açıklayan başka hangi neden olabilir?',
    paydas: 'Kabul ve karar yetkisi kimde?',
    sonuc: 'Sonucu hangi kayıt ve kapsamla açıklarsın?',
    iletisim: 'Karşı tarafın aynı anladığını nasıl teyit edersin?',
    sistem: 'Bu davranış için bir kabul ve bir istisna örneği ne?',
    proje: 'Hangi bağımlılık son teslimi gerçekten etkiler?',
    risk: 'Olasılık, etki ve karar yetkisini nasıl ayırırsın?',
    kalite: 'Yanlış kabul ve yanlış reddin etkileri ne?',
    finans: 'Dönem, nakit ve faaliyet etkisini nasıl ayırırsın?',
    strateji: 'Hangi varsayım değişirse seçenek sıralaman değişir?',
    dijital: 'Aracın doğru veriyle doğru işi yaptığını nasıl kontrol edersin?',
    musteri: 'Vaat ettiğin çözüm hangi kaynağa bağlı?',
    ticari: 'Gelir ile katkı ve tahsilatı nasıl ayırırsın?',
    etik: 'Yetki ve sorumlu bildirim sınırın ne?',
  };
  function key(s, q, a) {
    return [
      root.CONTENT.version,
      s.profile?.positionId || s.profile?.roleType || 'general',
      q.id,
      JSON.stringify(a),
    ].join('|');
  }
  function html(s, q, a) {
    const k = key(s, q, a),
      n = s.reasoning?.[k] || {};
    return `<details class="role-reasoning"><summary>Bu seçimi neden yaptım? · isteğe bağlı</summary><p>${e(probe[q.dim] || 'Kararın hangi koşulda değişir; hangi dayanağı teyit edersin?')}</p><p>Bu not öz açıklamandır; seçenek puanına eklenmez. Anahtarı gördükten sonra yazılan açıklama bağımsız ölçüm değildir.</p><label>Kendi gerekçen<textarea data-role-reason="reason" data-question="${e(q.id)}" maxlength="3000" rows="3">${e(n.reason || '')}</textarea></label><label>Hangi koşulda kararın değişirdi?<textarea data-role-reason="condition" data-question="${e(q.id)}" maxlength="3000" rows="3">${e(n.condition || '')}</textarea></label><p data-reason-status role="status"></p></details>`;
  }
  function saved(s, q, a) {
    const n = s.reasoning?.[key(s, q, a)];
    return n
      ? `<section class="role-reasoning"><h4>Adayın bu seçime bağlı öz açıklaması</h4><p><b>Kendi gerekçesi:</b> ${e(n.reason || 'Henüz yazılmadı')}</p><p><b>Kararını değiştirecek koşul:</b> ${e(n.condition || 'Henüz yazılmadı')}</p><p>Bu açıklama bağımsız performans kanıtı veya anahtar doğrulaması değildir.</p></section>`
      : '';
  }
  function bind(s, persist) {
    document.querySelectorAll('[data-role-reason]').forEach(input =>
      input.addEventListener('input', () => {
        const q = root.CONTENT.items.find(q => q.id === input.dataset.question),
          a = s.answers[q.id],
          k = key(s, q, a),
          old = s.reasoning || {};
        if (!old[k] && Object.keys(old).length >= 1000) {
          input.closest('details').querySelector('[data-reason-status]').textContent =
            'Gerekçe kaydı sınırına ulaştın; önce yedeğini indir.';
          return;
        }
        s.reasoning = {
          ...old,
          [k]: {
            ...old[k],
            [input.dataset.roleReason]: input.value,
            qid: q.id,
            positionId: s.profile?.positionId || '',
            at: new Date().toISOString(),
          },
        };
        const ok = persist();
        input.closest('details').querySelector('[data-reason-status]').textContent =
          ok === false ? 'Kayıt yapılamadı; metnini kopyala.' : 'Gerekçe bu seçime bağlı olarak kaydedildi.';
      })
    );
  }
  root.RoleReasoning = { html, bind, probe, saved };
})(window);
