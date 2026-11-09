(function () {
  'use strict';
  const get = (k, f) => {
      try {
        return JSON.parse(localStorage.getItem(k)) || f;
      } catch {
        return f;
      }
    },
    profile = get('aa-state-v1', {}).profile;
  const positionChoice = window.Positions?.load(localStorage),
    position = window.Positions?.get(positionChoice?.positionId);
  const path = location.pathname,
    kind = path.includes('/mizac/') ? 'mizac' : path.includes('/rol/') ? 'rol' : 'zihin';
  const style = document.createElement('style');
  style.textContent =
    'body{padding-bottom:76px}.aa-return{position:fixed;bottom:0;left:0;right:0;z-index:10000;background:#193d36;color:#fff;padding:12px 22px;display:flex;justify-content:space-between;align-items:center;gap:14px;font:13px/1.4 system-ui;box-shadow:0 -2px 15px #0001}.aa-return a{color:#e2edb1;text-decoration:none;font-weight:650;min-height:44px;display:flex;align-items:center}.aa-return small{color:#c2d4c7}.aa-return a{white-space:nowrap}@media(max-width:650px){.aa-return small{display:none}.aa-return{font-size:12px;gap:8px}.aa-return a:last-child{font-size:11px}}.aa-personal{max-width:1000px;margin:15px auto;padding:12px}.aa-personal article{padding:22px;background:white;border:1px solid #d6e1cf;border-radius:12px;margin:15px 0}.aa-personal h1{font-size:36px}.aa-personal button,.aa-personal a{margin:6px;padding:12px;min-height:48px}.aa-personal .notice{margin:15px 0}@media(max-width:600px){.aa-return{padding:8px 14px;font-size:12px}.aa-return small{display:none}.aa-personal h1{font-size:29px}}@media print{.aa-return{display:none}body{padding-bottom:0}}';
  document.head.append(style);
  const bar = document.createElement('div');
  bar.className = 'aa-return';
  bar.innerHTML =
    '<a href="/">← Aday Atölyesi</a><small>Bu adresteki çalışmaların ortak özetine yansır.</small><a href="/#plan">Planım ↗</a><a href="/#growth">Gelişimim ↗</a>';
  document.body.append(bar);
  if (kind === 'mizac') {
    if (profile && !Object.keys(state.answers || {}).length) {
      state.role = { analyst: 'analyst', operations: 'operations', lead: 'lead' }[profile.role] || 'general';
      save();
    }
    const originalReport = report;
    function showFullPositionReport(s) {
      originalReport(s);
      if (window.MizacPosition) {
        el.insertAdjacentHTML(
          'beforeend',
          MizacPosition.html(s) + (window.MizacEvidence ? MizacEvidence.html(s) : '')
        );
        if (window.MizacEvidence) MizacEvidence.bind(s, save);
        MizacPosition.bind(s, () => {
          const ok = save();
          if (ok !== false) showFullPositionReport(s);
          return ok;
        });
      }
    }
    window.openDetailedReport = function () {
      showFullPositionReport(state);
    };
    report = function (input) {
      const s = input || state;
      if (!s.complete || !isComplete(s)) return originalReport(input);
      const ds = score(s.answers),
        qualityFlags = quality(s.answers).flags;
      el.innerHTML =
        '<section class="aa-personal"><span class="eyebrow">' +
        (s.demo ? 'Kurgusal örnek · kişisel kayıtlarına katılmaz' : 'Aday özeti · çalışma tercihlerin') +
        '</span><h1>İşte nasıl çalışmayı tercih ediyorsun?</h1><p>Bu harita öz bildirimine dayanır. Yetenek, iş başarısı veya mesleğe uygunluk puanı değildir. İki uçtan biri daha iyi değildir.</p><div class="notice">Soruların geçerlik, güvenirlik ve norm araştırması henüz tamamlanmadı. Metinleri kendin hakkında kesin hükümler olarak değil, gerçek deneyimlerinle inceleyeceğin hipotezler olarak kullan.</div>' +
        (qualityFlags.length
          ? '<div class="notice"><h2>Yanıtlarını gözden geçirirken</h2>' +
            qualityFlags.map(f => '<p>' + esc(f) + '</p>').join('') +
            '</div>'
          : '') +
        (window.MizacPosition ? MizacPosition.html(s) : '') +
        (window.MizacEvidence ? MizacEvidence.html(s) : '') +
        ds
          .map(d => {
            const n = NARRATIVE[d.id][d.band];
            return (
              '<article><span class="eyebrow">' +
              esc(d.name) +
              '</span><h2>' +
              esc(d.left) +
              ' ↔ ' +
              esc(d.right) +
              '</h2><p>' +
              esc(n.story) +
              '</p><h3>Bir deneyiminle araştır</h3><p>' +
              esc(d.q) +
              '</p><h3>Deneyebileceğin küçük adım</h3><p>' +
              esc(n.experiment) +
              '</p><small>Gözlemleyebileceğin nokta: ' +
              esc(n.metric) +
              '</small></article>'
            );
          })
          .join('') +
        '<div class="actions"><a class="primary btn" href="/#examples">Gerçek deneyim örneği ekle ↗</a><button onclick="window.print()">Kişisel özetimi yazdır / PDF</button><button id="aa-full-report">18 bölümlük ayrıntıyı aç</button></div></section>';
      if (window.MizacEvidence) MizacEvidence.bind(s, save);
      document.getElementById('aa-full-report').onclick = () => showFullPositionReport(s);
      if (window.MizacPosition)
        MizacPosition.bind(s, () => {
          const ok = save();
          if (ok !== false) report(s);
          return ok;
        });
    };
    if (new URLSearchParams(location.search).get('view') === 'candidate') report();
  }
  if (kind === 'rol') {
    if ((profile || position) && !Object.keys(state.answers || {}).length && !state.profile) {
      const base = roleTemplates.find(
        r =>
          r.id ===
          (position
            ? position.roleType
            : profile.people || profile.role === 'lead'
              ? profile.role === 'operations'
                ? 'operations'
                : 'team'
              : {
                  analyst: 'analyst',
                  operations: 'operations_specialist',
                  graduate: 'graduate',
                  custom: 'custom',
                }[profile.role] || 'custom')
      );
      state.profile = {
        roleType: base.id,
        roleTitle: position?.name || profile?.title || base.name,
        positionId: position?.id || '',
        seniority: positionChoice?.seniority || 'entry',
        depth: ['senior', 'lead'].includes(positionChoice?.seniority) ? 'full' : 'standard',
        priorities: position ? Positions.priorities(position.id, C.dimensions) : { ...base.priorities },
      };
      state.context.purpose = 'İşe alım provası';
      save();
      render();
    }
    if (
      position &&
      (state.profile?.positionId !== position.id || state.profile?.seniority !== positionChoice.seniority)
    ) {
      activateProfile({
        positionId: position.id,
        seniority: positionChoice.seniority,
        roleType: position.roleType,
        roleTitle: position.name,
        depth: ['senior', 'lead'].includes(positionChoice.seniority) ? 'full' : 'standard',
        priorities: Positions.priorities(position.id, C.dimensions),
      });
      state.context.purpose = 'İşe alım provası';
      save();
      render();
    }
    if (profile && !profile.employed) {
      const exercises = {
        gelisim: [
          'Bir üniversite projesinde yeni katılan kişiye bir beceriyi öğretmek için başlangıç gözlemi, iki alıştırma ve takip ölçütü yaz.',
          'Öğrenme hedefi, alıştırma ve kontrol ölçütünün birbiriyle ilişkisi.',
        ],
        delegasyon: [
          'Bir etkinlik hazırlığını kurgula. Devredilecek görevi, beklenen çıktıyı, karar sınırını ve kontrol zamanını tek sayfada yaz.',
          'Sonuç, yetki, kaynak ve takip açıklığı.',
        ],
        performans: [
          'İki teslim tarihi kaçıran kurgusal bir ekip üyesiyle görüşme taslağı hazırla. Gözlem, sorular, destek ve takip tarihini ayır.',
          'Kişiyi etiketlemeden somut davranış, destek ve takip oluşturma.',
        ],
        catisma: [
          'İki proje arkadaşının aynı kaynak için anlaşamadığını düşün. Her iki tarafın sorularını, ortak ölçütleri ve takip adımını yaz.',
          'Tarafların görüşleri ve ortak çözüm standardı.',
        ],
        karar: [
          'Bir teslimat gecikmesi için iki olası neden yaz. Hangi veri bu nedenleri ayırır? Her biri için farklı bir deneme öner.',
          'Varsayım, veri ve karar bağlantısı.',
        ],
        plan: [
          'Bu haftaki kendi işlerini süre, son tarih ve bağımlılıklarıyla listele. Günlük kapasiteni aşan yerde neyi değiştireceğini açıkla.',
          'Gerçekçi kapasite ve gerekçeli öncelik.',
        ],
        degisim: [
          'Bir proje ekibinin dosya paylaşma yöntemini değiştirdiğini düşün. Küçük denemeyi, geri bildirimi ve yaygınlaştırma koşulunu tasarla.',
          'Paydaş katılımı, deneme ve sonuç ölçütü.',
        ],
        adalet: [
          'Kurgusal bir ekipte görev dağıtımı için üç işle ilgili ölçüt belirle. Yakın arkadaşın da ekipteyken aynı ölçütleri nasıl korursun?',
          'Tutarlı ölçüt, gerekçe ve gizlilik.',
        ],
      };
      C.dimensions.forEach(d => {
        if (exercises[d.id]) {
          d.action = exercises[d.id][0];
          d.indicator = exercises[d.id][1];
        }
      });
      const baseReport = report;
      report = function () {
        return baseReport()
          .replaceAll('>İş üzerinde uygulama<', '>Bireysel / kurgusal uygulama<')
          .replaceAll('>İş üzerinde uygula<', '>Bireysel alıştırmayla çalış<')
          .replaceAll(
            'çalışan ve yöneticisi birlikte doğrulamalı',
            'aday gerçek deneyimleri ve geri bildirimle gözden geçirmeli'
          )
          .replaceAll(
            'Mülakatta örnek iste; çalışanla başlangıç davranışını ve tek gelişim hedefini belirle.',
            'Geçmiş bir örnek seç; kendi eylemini ve tek çalışma hedefini yaz.'
          )
          .replaceAll(
            'Sınırlı bir görev, gerekli kaynak ve haftalık kısa geri bildirim planla.',
            'Bir kurgusal görev seç, çözüm taslağını yaz ve ölçütlerle gözden geçir.'
          )
          .replaceAll(
            'Aynı davranışı yeniden gözle; desteği ihtiyaca göre ayarla.',
            'Farklı bir kurgusal örnekte yaklaşımını yeniden dene; eksik adımı düzelt.'
          )
          .replaceAll('Yönetici / mentor desteği', 'İsteğe bağlı geri bildirim')
          .replaceAll(
            'Göreve alan ve kaynak aç; haftada bir somut gözlemle geri bildirim ver. Birlikte belirlenen destek ile bağımsız uygulamayı ayrı kaydet.',
            'İstersen bir mentor veya arkadaşından çözümündeki gerekçeleri incelemesini iste. Kendi değerlendirmenle dış geri bildirimi ayrı kaydet.'
          )
          .replaceAll(
            'Başlangıçla iş üstündeki kanıtı karşılaştır.',
            'İlk ve son çözümünü aynı ölçütlerle karşılaştır.'
          );
      };
    }
    if (new URLSearchParams(location.search).get('view') === 'setup') nav('setup');
    const requestedQuestion = new URLSearchParams(location.search).get('question');
    if (requestedQuestion) {
      const i = activeItems().findIndex(q => q.id === requestedQuestion);
      if (i >= 0) {
        state.index = i;
        nav('assessment');
      }
    }
    if (new URLSearchParams(location.search).get('view') === 'report') {
      sample = false;
      tab = 'overview';
      nav('report');
    }
  }
})();
