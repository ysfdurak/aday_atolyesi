'use strict';
const $ = s => document.querySelector(s),
  esc = s =>
    String(s ?? '').replace(
      /[&<>"']/g,
      c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]
    );
let state = AA.read(localStorage, AA.KEY, AA.blank()),
  route = 'home';
const roleNames = AA.roles;
function save() {
  try {
    localStorage.setItem(AA.KEY, JSON.stringify(state));
    return true;
  } catch {
    toast('Depolama kullanılamıyor. Yedek indirerek çalışmanı koru.');
    return false;
  }
}
let toastTimer;
function toast(t) {
  clearTimeout(toastTimer);
  $('#status').textContent = t;
  toastTimer = setTimeout(() => ($('#status').textContent = ''), 6000);
}
const link = (url, text, primary = false) =>
  `<a class="btn ${primary ? 'primary' : ''}" href="${url}">${text} ↗</a>`;
function shell(body) {
  const p = state.profile;
  return `<a href="#main-content" class="skip-link" data-skip>İçeriğe geç</a><div class="mobile-toolbar"><a href="#home" class="mobile-title">↗ aday atölyesi</a><button type="button" id="menu-toggle" aria-controls="workspace-menu" aria-expanded="false">Menü <span aria-hidden="true">☰</span></button></div><div class="shell"><aside id="workspace-menu" class="side"><a class="brand" href="#home"><i>↗</i><span>aday atölyesi<small>BAŞVURUDAN GÖRÜŞMEYE</small></span></a><nav aria-label="Ana gezinme">${[
    ['home', '◈', 'Çalışma alanım'],
    ['plan', '◷', 'Hazırlık planım'],
    ['growth', '↗', 'Gelişim raporum'],
    ['modules', '▦', 'Atölyeler'],
    ['cases', '◇', 'Assessment Atölyesi'],
    ['examples', '◎', 'Deneyim arşivim'],
    ['dossier', '▤', 'Mülakat dosyam'],
    ['rehearsal', '◉', 'Mülakat provam'],
    ['results', '↗', 'Sonuçlarım'],
    ['guide', '?', 'Nasıl çalışır?'],
    ['pilot', '◎', 'Hesabım ve teslimler'],
    ['settings', '⚙', 'Hedef ve kayıtlar'],
    ['cv', '▤', 'CV ve ilan'],
  ]
    .map(
      ([id, icon, name]) =>
        `<a href="#${id}" class="${route === id ? 'active' : ''}" ${route === id ? 'aria-current="page"' : ''}><span>${icon}</span>${name}</a>`
    )
    .join(
      ''
    )}</nav><div class="bottom"><b>Bir sonraki adıma hazırlan.</b><p>Ortak hedef, somut örnekler.<br>Kendi hızında ilerleme.</p><span class="tag">Portföy sürümü · 0.16.0</span></div></aside><main class="main" id="main-content" tabindex="-1"><div class="top"><span>${p ? esc(Positions.get(Positions.load(localStorage)?.positionId)?.name || p.title) : 'Kendi başlangıç noktanı bul.'}</span><span class="tag">${esc(PilotProgress.label())}</span></div>${body}<footer>Hazırlık ve öz değerlendirme amaçlıdır. İşe alınma olasılığı veya tek bir uygunluk puanı hesaplanmaz. AI çağrısı yoktur. Hesaba kaydettiğin çalışmalar ve teslim ettiğin dosyalar sunucuda saklanır.</footer></main></div><nav class="mobile-dock" aria-label="Hızlı gezinme">${[
    ['home', 'Çalışmam'],
    ['plan', 'Planım'],
    ['modules', 'Atölyeler'],
    ['dossier', 'Dosyam'],
  ]
    .map(([id, label]) => `<a href="#${id}" ${route === id ? 'aria-current="page"' : ''}>${label}</a>`)
    .join('')}</nav>`;
}
function home() {
  return WorkspaceUX.home(state, AA.snapshot(localStorage));
}
function moduleCards(s = AA.snapshot(localStorage)) {
  return `<div class="grid">${[
    {
      n: '01 / SINAV',
      title: 'Zihin Parkuru',
      text: 'Altı alanda açıklamalı çalışmalar, örüntü keşfi ve aşamalı denemeler.',
      url: '/modules/zihin/index.html',
      status: (s.z.sessions || []).length + ' tamamlanan tur',
    },
    {
      n: '02 / KENDİNİ TANIMA',
      title: 'Mizaç',
      text: 'Çalışma tercihlerini keşfet. Kişisel özetini gerçek deneyim örneklerine bağla.',
      url: '/modules/mizac/index.html',
      status: s.m.complete ? 'Kişisel rapor hazır' : '96 ifade + 6 senaryo',
    },
    {
      n: '03 / ROL KARARLARI',
      title: 'Rol Atölyesi',
      text: 'Rolünü ve yetkinliklerini seç. Rolüne uygun soruları, karar gerekçelerini ve gelişim adımlarını çalış.',
      url: '/modules/rol/index.html',
      status: s.r.profile
        ? (s.r.activeAnswered ?? Object.keys(s.r.answers || {}).length) +
          ' / ' +
          (s.r.activeTotal ?? '—') +
          ' rol sorusu yanıtlandı'
        : 'Pozisyon ve yetkinlik paketini seç',
    },
  ]
    .map(
      m =>
        `<article class="card"><span class="num">${m.n}</span><h3>${m.title}</h3><p>${m.text}</p><span class="tag">${m.status}</span><div>${link(m.url, 'Atölyeyi aç')}</div></article>`
    )
    .join('')}</div>`;
}
function modules() {
  return `<span class="eyebrow">Hazırlık araçların</span><h1>Birlikte çalışan<br>üç farklı atölye.</h1><p class="muted">Hazırlık sırasını planından takip edebilir veya istediğin çalışmaya doğrudan girebilirsin.</p>${moduleCards()}<div class="sectionhead"><h2>Geliştirme sırası</h2></div><div class="grid2"><div class="card"><span class="tag">Bu sürümde çalışıyor</span><h3>CV metni ve ilan kontrolü</h3><p>CV metnini düzenle; ilandan seçtiğin gereksinimleri deneyiminle karşılaştır. Metin dosyası indir veya yazdır.</p>${link('#cv', 'CV alanını aç')}</div><div class="card"><span class="tag">${CaseUI.summary().total} özgün vaka hazır</span><h3>Assessment Atölyesi</h3><p>Üç düzeyde veri analizi, önceliklendirme, yönetim görüşmesi ve karar sunumu. Aday belgeleri, CSV tabloları, çözüm kaydı ve referans inceleme.</p>${link('#cases', 'Vaka havuzunu aç')}</div></div>`;
}
function plan() {
  if (!state.profile)
    return `<h1>Planın hedefinle başlar.</h1><p>Rolünü, tarihini ve günlük zamanını belirlediğinde çalışmaları sıralayacağız.</p>${link('#settings', 'Hedefimi belirle', true)}`;
  const p = state.profile,
    s = AA.snapshot(localStorage),
    ts = AA.tasks(state, s),
    done = ts.filter(t => t.done).length,
    ct = AA.caseTask(state),
    co = AA.caseOverview(state);
  const mode = p.employed
    ? 'Mevcut işindeki olaylardan örnek toplayabilirsin.'
    : 'İş deneyimi gerektiren görevleri eğitim, proje, gönüllülük veya kurgusal alıştırmalarla çalışabilirsin.';
  return `<span class="eyebrow">${AA.today()} / Günlük çalışma</span><h1>Bugün bir adım<br><em>daha hazır.</em></h1><div class="grid2"><section class="card"><div class="sectionhead" style="margin:0"><h2>Bugünkü planın</h2><span class="tag">${done}/${ts.length} tamamlandı</span></div><div class="bar"><i style="width:${ts.length ? (100 * done) / ts.length : 0}%"></i></div>${ts.map((t, i) => `<div class="task ${t.done ? 'done' : ''}"><span class="step">${t.done ? '✓' : i + 1}</span><div><h3>${t.title}</h3><p>${t.detail}</p><small>Yaklaşık ${t.minutes} dk ${t.minutes > p.minutes ? '· birkaç güne bölebilirsin' : ''}</small><label class="check" style="margin-top:8px"><input type="checkbox" data-check="${t.id}" ${t.done ? 'checked' : ''}>${t.done ? 'Tamamlandı' : 'Çalıştım olarak işaretle'}</label></div>${link(t.href, 'Aç')}</div>`).join('')}<p class="muted">İşaretleme yalnız günlük çalışma kaydıdır; vaka aşamasını ilerletmez veya teslim oluşturmaz. Sınav ve tercih formu sonuçlarını değiştirmez. Süreler tahminidir.</p></section><section><div class="focus"><span class="eyebrow">Hedefin</span><h2>${esc(p.title)}</h2><p>Günde ${p.minutes} dakika · ${esc(p.deadline)}</p><p>${mode}</p>${AA.days(AA.today(), p.deadline) < 0 ? '<p>Hedef tarihin geçmiş. Takvimini güncelleyebilirsin.</p>' : ''}${link('#settings', 'Hedefi düzenle')}</div><div class="note">${s.report ? 'Sınav odağı son gerçek denemendeki yeterli yanıt bulunan alanlardan seçilir. Vaka sırası hedef rolünden, devam adımı gerçek teslim ve inceleme kayıtlarından gelir.' : 'Henüz deneme verisi yok. İlk öneriler hedefinden gelir; beceri ölçümü sayılmaz. Vaka çalışmalarında mevcut taslak ve teslim aşaması esas alınır.'} Mizaç tercihleri sınav puanına veya liderlik puanına eklenmez.</div></section></div><div class="sectionhead"><h2>Vaka çalışma yolun</h2></div><section class="card"><p>${co.started} başlanan · ${co.submitted} ilk teslimi bulunan · ${co.reviewed} insan incelemesi bulunan · ${co.revised} revizyon yapılan vaka.</p>${ct ? `<h3>${esc(ct.title)}</h3><p>${esc(ct.detail)}</p>${link(ct.href, 'Vaka çalışmasına devam et', true)}` : '<p>Rolüne uygun mevcut vaka döngülerindeki çalışma kayıtların tamamlandı. Teslimlerin kalitesini geri bildirimle ayrıca inceleyebilirsin.</p>'}<p class="muted">Günlük programda bu çalışma için yer olmadığında bu karttan devam edebilirsin. Sayılar çalışma kayıtlarıdır; yetkinlik veya işe hazır olma puanı değildir.</p></section><div class="sectionhead"><h2>Önündeki 7 gün</h2></div><div class="card tablewrap"><table><thead><tr><th>Tarih</th><th>Çalışma sırası</th><th>Tahmini süre</th></tr></thead><tbody>${Array.from(
    { length: Math.min(7, Math.max(1, AA.days(AA.today(), p.deadline) + 1)) },
    (_, i) => {
      const date = AA.plusDay(AA.today(), i),
        rows = AA.tasks(state, s, date);
      return `<tr><td>${date}</td><td>${rows.map(t => t.title).join(' → ')}</td><td>${rows.reduce((n, t) => n + t.minutes, 0)} dk</td></tr>`;
    }
  ).join(
    ''
  )}</tbody></table><p class="muted">Takvim, bugünkü kayıtlara göre öneridir. Yeni sonuç veya tamamlanan form geldiğinde güncellenir; görevleri önceden tamamlanmış saymaz.</p></div><div class="sectionhead"><h2>Hazırlığının adımları</h2></div><div class="grid"><div class="card"><span class="num">01 / BAŞLANGIÇ</span><h3>Kendini ve sınavı tanı</h3><p>Başlangıç denemesi, yönergeler, çalışma tercihleri. İhtiyaçlarını gerçek sonuç ve deneyimlerle netleştir.</p></div><div class="card"><span class="num">02 / ÇALIŞMA</span><h3>Yöntemi farklı durumlarda kullan</h3><p>Öncelikli soru alanları, rol senaryoları ve vaka geri bildiriminden gelen kısa alıştırmalarla çalış.</p></div><div class="card"><span class="num">03 / PROVA</span><h3>Hazırlığını yeniden gözden geçir</h3><p>Son günlere yaklaşırken yeni deneme çöz, vaka kararını savun ve deneyim örneklerini sesli anlat.</p>${link('/modules/zihin/index.html#exam/graded', 'Deneme provası')}</div></div>`;
}
function settings() {
  const pd = state.drafts?.profile,
    positionChoice = pd
      ? { positionId: pd.positionId, seniority: pd.seniority }
      : window.Positions?.load(localStorage),
    p = pd ||
      state.profile || {
        role: 'analyst',
        title: '',
        start: AA.today(),
        deadline: AA.plusDay(AA.today(), 14),
        minutes: 45,
        people: false,
        employed: false,
        job: '',
      };
  return `<div class="narrow"><span class="eyebrow">Hedef ve çalışma düzeni</span><h1>Planını kendine<br>göre kur.</h1><form id="profile" class="card"><div class="formgrid"><label class="field">Hedef pozisyon kataloğu<select name="positionId"><option value="">Özel hedef / katalogdan seçmeden</option>${Positions.positions.map(x => `<option value="${x.id}" ${positionChoice?.positionId === x.id ? 'selected' : ''}>${x.name}</option>`).join('')}</select></label><label class="field">Kıdem / sorumluluk kapsamı<select name="seniority">${Object.entries(
    Positions.levels
  )
    .map(
      ([id, name]) =>
        `<option value="${id}" ${positionChoice?.seniority === id ? 'selected' : ''}>${name}</option>`
    )
    .join('')}</select></label><label class="field">Rol grubu<select name="role">${Object.entries(roleNames)
    .map(([id, r]) => `<option value="${id}" ${p.role === id ? 'selected' : ''}>${r.name}</option>`)
    .join(
      ''
    )}</select></label><label class="field">Hedef rol / pozisyon<input name="title" maxlength="100" required value="${esc(p.title)}" placeholder="Örn. Süreç Geliştirme Uzmanı"></label><label class="field">Hazırlık başlangıcı<input name="start" type="date" required value="${p.start}"></label><label class="field">Hazırlanmak istediğin tarih<input name="deadline" type="date" required value="${p.deadline}"></label><label class="field">Günlük zaman<select name="minutes">${[15, 30, 45, 60, 90].map(n => `<option value="${n}" ${p.minutes === n ? 'selected' : ''}>${n} dakika</option>`).join('')}</select></label><label class="field">Çalışma durumun<select name="employed"><option value="no" ${!p.employed ? 'selected' : ''}>Şu anda çalışmıyorum / öğrenciyim</option><option value="yes" ${p.employed ? 'selected' : ''}>Çalışıyorum</option></select></label><label class="check full"><input type="checkbox" name="people" ${p.people ? 'checked' : ''}>Hedefimde ekip / insan yönetimi var.</label><label class="field full">İş ilanı (isteğe bağlı)<textarea name="job" maxlength="12000" placeholder="İlan metnini buraya yapıştır.">${esc(p.job)}</textarea></label></div><p id="profile-draft-status" class="muted" role="status">Yazdıkların taslak olarak korunur. Planın, hedefi kaydettiğinde güncellenir.</p><div id="profile-error" role="alert" class="danger"></div><div class="actions"><button class="primary">Hedefimi kaydet ve planı aç →</button></div><p class="muted">İlan metni isteğe bağlıdır. CV alanındaki gereksinimleri ilandan sen seçersin. AI servisine gönderim yapılmaz. Hesabına kaydetmeyi seçtiğinde hazırlık kaydın sunucuda tutulur.</p></form><div class="sectionhead"><h2>Kayıtlarını koru</h2></div><div class="card"><p>Yazarken bu cihaza kayıt yapılır. Başka cihazda devam etmek için Hesabım ve teslimler alanında hesabına kaydet, yeni cihazda hesaptan yükle. JSON yedeğiyle de taşıyabilirsin.</p><p>Yedek; CV, ilan, deneyim ve üç atölyenin bu adresteki kayıtlarını içerir. Kendi cihazında sakla.</p><div class="actions"><button data-action="export">Tüm kayıtları yedekle</button><label class="btn">Yedekten geri yükle<input id="restore" type="file" accept="application/json" hidden></label></div><div class="actions"><button class="danger" data-action="clear">Bu adresteki kişisel kayıtlarımı sil</button></div><div class="note notice">Eski sitelerin kayıtları bu yedeğe dahil değildir. Eski sitelerdeki çalışmaların orada kalır.</div></div></div>`;
}
function examples() {
  return WorkspaceUX.examples(state);
}
function dossier() {
  return WorkspaceUX.dossier(state, AA.snapshot(localStorage));
}
function cv() {
  const c = state.cv,
    p = state.profile;
  return `<span class="eyebrow">CV ve hedef ilan / Metin çalışma alanı</span><h1>Deneyimin aynı.<br><em>Anlatımın daha açık.</em></h1><p class="muted">Mevcut CV metnini düzenle ve ilandan seçtiğin gereksinimlerle karşılaştır. Sistem deneyim, beceri veya başarı sayısı eklemez.</p><form id="cvform"><div class="grid2"><section class="card"><label class="field">Mevcut / düzenlenmiş CV metnin<textarea name="text" maxlength="30000" rows="17" placeholder="Ad Soyad\nİletişim\nDeneyim\nEğitim\nBeceriler">${esc(c.text || '')}</textarea></label><p class="muted">Düzenleme sana aittir. Bu alan CV metniyle çalışır.</p></section><section class="card"><label class="field">Hedef ilanın gereksinimleri<textarea name="requirements" maxlength="4000" rows="6" placeholder="Her satıra bir beceri / gereksinim yaz.\nExcel\nSüreç iyileştirme\nSQL">${esc(c.requirements || '')}</textarea></label>${p?.job ? `<details><summary>Kaydettiğim ilanı göster</summary><div class="quote">${esc(p.job)}</div></details>` : ''}<h3>Önce gerçek deneyimini aç</h3><p>Hangi işi, hangi araçla yaptın? Çıktıyı kim kullandı? Hangi kararı destekledi? Doğrulayabildiğin sonuç var mı?</p><div class="note">Bir gereksinimin metinde geçmesi, o becerinin doğrulandığı anlamına gelmez. Eksik kelime otomatik olarak eksik beceri sayılmaz.</div><button class="primary">Kaydet ve metin kontrolünü göster</button></section></div></form>${c.reviewedAt ? cvReport(c) : ''}`;
}
function cvReport(c) {
  const text = c.text || '',
    req = (c.requirements || '')
      .split('\n')
      .map(x => x.trim())
      .filter(Boolean)
      .slice(0, 50),
    norm = x => x.toLocaleLowerCase('tr-TR').normalize('NFKC');
  return `<section class="card" style="margin-top:22px"><h2>Metin kontrolü</h2><p>${text.length} karakter · ${text.split(/\s+/).filter(Boolean).length} kelime. Bu analiz dosyanın gerçek ATS ayrıştırma testi değildir; evrensel ATS puanı hesaplanmaz.</p><div class="tablewrap"><table><thead><tr><th>Seçtiğin gereksinim</th><th>Metindeki sözcük eşleşmesi</th><th>Senin kontrolün</th></tr></thead><tbody>${req.map(r => `<tr><td>${esc(r)}</td><td>${norm(text).includes(norm(r)) ? 'Metinde geçiyor' : 'Aynen bulunamadı'}</td><td>Gerçek bir deneyim veya beceriyle destekleniyor mu?</td></tr>`).join('') || '<tr><td colspan="3">Karşılaştırma için ilandan gereksinimler ekle.</td></tr>'}</tbody></table></div><h3>Dışa aktarmadan önce</h3><ul><li>Deneyim, eğitim ve becerileri açık başlıklarla ayır.</li><li>Tarihleri tutarlı yaz; iletişim bilgilerini ana metinde bulundur.</li><li>İlandaki bir beceriyi yalnız gerçekten sahipsen ekle.</li></ul><div class="actions"><button data-action="cvdownload">CV metnini indir · TXT</button><button data-action="cvprint">CV önizle / yazdır</button></div></section>`;
}
function results() {
  const s = AA.snapshot(localStorage),
    r = s.report,
    ma = Object.keys(s.m.answers || {}).length;
  return `<span class="eyebrow">Bulgu → anlamı → sonraki adım</span><h1>Hazırlığını<br><em>ayrı dayanaklarla gör.</em></h1><p class="muted">Sınav, çalışma tercihleri ve rol senaryoları farklı şeyler gösterir. Bunlardan toplam bir aday puanı üretmiyoruz.</p><div class="grid"><article class="card"><span class="num">SINAV PERFORMANSI</span><h3>${r ? r.overall.correct + '/' + r.overall.total + ' doğru' : 'Henüz deneme yok'}</h3><p>${r ? `${r.overall.answered} soru yanıtlandı. Bu soru setindeki performans; işe alınma olasılığı veya yüzdelik değil.` : 'Bir deneme tamamladığında gerçek sonuçların burada görünür.'}</p>${link('/modules/zihin/index.html#' + (r ? 'report/latest' : 'exam/graded'), r ? 'Deneme raporum' : 'Başlangıç denemesi')}</article><article class="card"><span class="num">ÖZ BİLDİRİM</span><h3>${s.m.complete ? 'Tercih haritan hazır' : ma + '/96 ifade'}</h3><p>Çalışma tercihlerini, destekleyici koşulları ve konuşmak istediğin gerçek deneyimleri incele.</p>${link('/modules/mizac/index.html' + (s.m.complete ? '?view=candidate' : ''), 'Mizaç alanım')}</article><article class="card"><span class="num">SENARYO SEÇİMLERİ</span><h3>${s.r.profile ? (s.r.activeAnswered ?? Object.keys(s.r.answers || {}).length) + ' / ' + (s.r.activeTotal ?? '—') + ' rol sorusu' : 'Henüz rol paketi seçilmedi'}</h3><p>Seçilen beklentilerde yaklaşımını incele. Anahtarlar uzman incelemesi bekleyen taslaklardır.</p>${link('/modules/rol/index.html' + (s.r.completed ? '?view=report' : ''), 'Rol çalışmam')}</article></div><div class="sectionhead"><h2>Assessment çalışmaları</h2></div><div class="card"><h3>${CaseUI.summary().submitted} güncel dosya çalışması teslim edildi</h3><p>${CaseUI.summary().archived} önceki sürüm çalışması arşivde korunuyor.</p><p>${CaseUI.summary().drafts} taslak · ${CaseUI.summary().total} vaka. Bu kayıtlar çalışma tamamlanmasını gösterir; açık uçlu yanıtlar otomatik yetkinlik puanına çevrilmez.</p>${link('#cases', 'Vaka çalışmalarımı aç')}</div><section class="card report-handoff" style="margin-top:20px"><h2>Bu çalışmalardan mülakatta ne anlatacaksın?</h2><p>Kendi katkını, alternatifini ve sonucun dayanağını seçtiğin örneklerle bir dosyada topla. Aday beyanı ve kurgusal çalışmalar ayrı görünür.</p>${link('#dossier', 'Mülakat dosyamı oluştur', true)}</section><div class="actions">${link('#growth', 'Yanıtlarıma dayalı gelişim raporum', true)}</div><div class="sectionhead"><h2>Sonraki çalışma odağın</h2></div><section class="card">${r?.priorities?.length ? r.priorities.map(p => `<h3>${esc(p.name)}</h3><p>${esc(p.evidence)} ${esc(p.action)}</p>`).join('') : '<p>Başlangıç denemesi tamamlanınca çalışma önerileri oluşacak. Şu an hedef rolüne göre başlangıç sırası kullanılıyor.</p>'}${link('#plan', 'Planıma dön', true)}${link('#examples', 'Deneyim örneği ekle')}</section><div class="note">Örnek / demo raporlar kişisel ilerlemeye katılmaz. Farklı rastgele denemelerin puan farkı tek başına yetenek artışı anlamına gelmez.</div>`;
}
let renderTicket = 0,
  lastRoute = null;
function syncPosition() {
  const choice = Positions.load(localStorage),
    pos = Positions.get(choice?.positionId),
    p = state.profile;
  if (!pos || !p) return;
  if (p.positionId !== pos.id || p.seniority !== choice.seniority) {
    state.profile = {
      ...p,
      positionId: pos.id,
      seniority: choice.seniority,
      role: pos.commonRole,
      title: p.positionId === pos.id ? p.title : pos.name,
      people: pos.people,
    };
    save();
  }
}
async function render(options = {}) {
  if (
    window.WorkspaceReliability?.gate({
      storage: localStorage,
      keys: AA.keys,
      host: $('#app'),
      download,
      restore,
      retry: () => {
        state = AA.read(localStorage, AA.KEY, AA.blank());
        render();
      },
    })
  )
    return;
  const ticket = ++renderTicket,
    hash = location.hash,
    requested = (hash.slice(1) || 'home').split('/')[0];
  route = requested;
  syncPosition();
  const needsCases =
      ['cases', 'pilot', 'growth', 'rehearsal', 'file-work'].includes(route) && !CaseContent.ready(),
    needsFeedback = route === 'growth' && !ResponseContent.ready();
  if (needsCases || needsFeedback) {
    $('#app').innerHTML = shell(
      '<section class="card loading-state" role="status"><span class="loading-dot" aria-hidden="true"></span><h1>Çalışma dosyası açılıyor…</h1><p>Vaka belgelerini hazırlıyoruz.</p></section>'
    );
    bindNavigation();
    try {
      await Promise.all([
        needsCases ? CaseContent.load() : Promise.resolve(),
        needsFeedback ? ResponseContent.load() : Promise.resolve(),
      ]);
    } catch (err) {
      if (ticket !== renderTicket) return;
      $('#app').innerHTML = shell(
        '<section class="empty" role="alert"><h1>Belgeler açılamadı.</h1><p>' +
          esc(err.message) +
          '</p><button id="content-retry">Tekrar dene</button><a class="btn" href="#home">Çalışma alanıma dön</a></section>'
      );
      bindNavigation();
      $('#content-retry').onclick = () => render();
      return;
    }
    if (ticket !== renderTicket || location.hash !== hash) return;
  }
  const body = (
    {
      home,
      plan,
      modules,
      start: () => WorkspaceUX.start(),
      settings,
      examples,
      dossier,
      cv,
      results,
      guide,
      growth: window.GrowthUI?.view,
      rehearsal: window.RehearsalUI?.view,
      'file-work': window.FileWorkUI?.view,
      pilot: PilotUI.view,
      cases: CaseUI.view,
    }[route] || home
  )();
  $('#app').innerHTML = shell(body);
  document.body.dataset.route = route;
  bind();
  if (!options.preserveScroll) {
    window.scrollTo(0, 0);
    if (lastRoute !== hash) document.querySelector('h1')?.setAttribute('tabindex', '-1');
    if (lastRoute !== hash) document.querySelector('h1')?.focus({ preventScroll: true });
  }
  lastRoute = hash;
}
function bindNavigation() {
  const toggle = $('#menu-toggle'),
    menu = $('#workspace-menu');
  if (toggle && menu)
    toggle.onclick = () => {
      const open = toggle.getAttribute('aria-expanded') !== 'true';
      toggle.setAttribute('aria-expanded', String(open));
      menu.classList.toggle('mobile-open', open);
    };
  if (menu && toggle)
    menu.onkeydown = e => {
      if (e.key === 'Escape') {
        menu.classList.remove('mobile-open');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.focus();
      }
    };
  document.querySelector('[data-skip]')?.addEventListener('click', e => {
    e.preventDefault();
    document.getElementById('main-content').focus();
  });
}
function bind() {
  bindNavigation();
  WorkspaceUX.bind();
  window.GrowthUI?.bind();
  window.RehearsalUI?.bind();
  window.FileWorkUI?.bind();
  if (CaseContent.ready()) CaseUI.bind();
  PilotUI.bind();
  PilotProgress.refresh();
  $('#profile')?.addEventListener('submit', e => {
    e.preventDefault();
    const f = Object.fromEntries(new FormData(e.target));
    const p = {
      role: f.role,
      positionId: f.positionId,
      seniority: f.seniority,
      title: f.title.trim(),
      start: f.start,
      deadline: f.deadline,
      minutes: Number(f.minutes),
      people: f.people === 'on',
      employed: f.employed === 'yes',
      job: f.job,
    };
    if (!AA.validProfile(p)) {
      $('#profile-error').textContent =
        'Rol adını ve tarihleri kontrol et. Hedef tarihi başlangıçtan önce veya bir yıldan uzak olamaz.';
      return;
    }
    state.profile = p;
    state.drafts = { ...state.drafts, profile: null };
    if (p.positionId) {
      const pos = Positions.get(p.positionId);
      p.seniority = pos.people ? 'lead' : p.seniority;
      Positions.save(localStorage, { schema: 1, positionId: p.positionId, seniority: p.seniority });
    } else localStorage.removeItem(Positions.KEY);
    if (save()) {
      location.hash = 'plan';
      toast('Hedefin kaydedildi. Planın hazır.');
    }
  });
  const positionForm = $('#profile');
  if (positionForm) {
    positionForm.elements.positionId.onchange = () => {
      const pos = Positions.get(positionForm.elements.positionId.value);
      if (!pos) return;
      positionForm.elements.role.value = pos.commonRole;
      positionForm.elements.title.value = pos.name;
      positionForm.elements.people.checked = pos.people;
      positionForm.elements.seniority.value = pos.people ? 'lead' : 'entry';
      positionForm.dispatchEvent(new Event('input', { bubbles: true }));
    };
  }
  $('#cvform')?.addEventListener('input', e => {
    const f = Object.fromEntries(new FormData(e.currentTarget));
    state.cv = { ...f };
    save();
  });
  $('#cvform')?.addEventListener('submit', e => {
    e.preventDefault();
    state.cv = { ...Object.fromEntries(new FormData(e.target)), reviewedAt: new Date().toISOString() };
    if (save()) {
      render();
      toast('CV metnin kaydedildi. Kontroller aşağıda.');
    }
  });
  document.querySelectorAll('[data-check]').forEach(
    x =>
      (x.onchange = () => {
        state.checks[x.dataset.check] = x.checked;
        save();
        render();
      })
  );
  document.querySelectorAll('[data-remove]').forEach(
    x =>
      (x.onclick = () => {
        if (!confirm('Bu deneyim örneği silinsin mi?')) return;
        state.examples = state.examples.filter(e => e.id !== x.dataset.remove);
        if (state.drafts?.example?.editingId === x.dataset.remove) state.drafts.example = {};
        if (state.dossier)
          state.dossier.exampleIds = state.dossier.exampleIds.filter(id => id !== x.dataset.remove);
        save();
        render();
      })
  );
  document.querySelectorAll('[data-action]').forEach(x => (x.onclick = () => action(x.dataset.action)));
  $('#restore')?.addEventListener('change', restore);
}
function download(name, text, type = 'application/json') {
  const u = URL.createObjectURL(new Blob([text], { type })),
    a = document.createElement('a');
  a.href = u;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(u), 1000);
}
function action(a) {
  if (a === 'clear') {
    if (
      !confirm(
        'Bu adresteki hedef, CV, deneyim ve üç atölyenin kayıtları silinecek. Önce yedeğini indir. Silinsin mi?'
      )
    )
      return;
    AA.keys.forEach(k => localStorage.removeItem(k));
    state = AA.blank();
    render();
    toast('Bu adresteki kayıtlar silindi.');
    return;
  }
  if (a === 'export') {
    const values = Object.fromEntries(
      AA.keys.filter(k => localStorage.getItem(k) !== null).map(k => [k, localStorage.getItem(k)])
    );
    download(
      'aday-atolyesi-yedek-' + AA.today() + '.json',
      JSON.stringify({ schema: 'aday-atolyesi-backup-v1', at: new Date().toISOString(), values })
    );
    toast('Yedeğin indirildi. CV ve kişisel örneklerini içerir.');
  }
  if (a === 'cvdownload') download('cv-metnim.txt', state.cv.text || '', 'text/plain;charset=utf-8');
  if (a === 'cvprint') {
    const w = window.open('', '_blank');
    if (!w) {
      toast('Önizleme için açılır pencereye izin vermen gerekiyor.');
      return;
    }
    w.document.write(
      '<!doctype html><html lang="tr"><meta charset="utf-8"><title>CV önizleme</title><style>body{max-width:760px;margin:40px auto;padding:20px;font:14px/1.6 Arial}pre{white-space:pre-wrap;font:inherit}@media print{button{display:none}}</style><button onclick="window.print()">Yazdır / PDF olarak kaydet</button><pre>' +
        esc(state.cv.text || '') +
        '</pre></html>'
    );
    w.document.close();
  }
}
async function restore(e) {
  try {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 16000000) throw Error('Yedek 16 MB sınırını aşıyor.');
    const payload = JSON.parse(await file.text());
    await Promise.all([CaseContent.load(), ResponseContent.load()]);
    const values = AA.validateBackup(payload);
    if (
      !confirm(
        'Bu adresteki mevcut kayıtlar, yedekteki kayıtlarla değiştirilecek. Önce mevcut yedeğini indirdiğinden emin ol. Devam edilsin mi?'
      )
    )
      return;
    const prior = Object.fromEntries(AA.keys.map(k => [k, localStorage.getItem(k)]));
    try {
      AA.keys.forEach(k => localStorage.removeItem(k));
      for (const [k, v] of Object.entries(values)) localStorage.setItem(k, v);
    } catch (err) {
      AA.keys.forEach(k => {
        if (prior[k] === null) localStorage.removeItem(k);
        else localStorage.setItem(k, prior[k]);
      });
      throw Error('Depolama yetersiz; önceki kayıtlar korundu.');
    }
    state = AA.read(localStorage, AA.KEY, AA.blank());
    render();
    toast('Yedek geri yüklendi.');
  } catch (err) {
    toast('İçe aktarılamadı: ' + err.message);
  }
}
window.addEventListener('hashchange', () => render());
window.addEventListener('pageshow', () => {
  state = AA.read(localStorage, AA.KEY, AA.blank());
  render();
});
window.addEventListener('storage', () => {
  state = AA.read(localStorage, AA.KEY, AA.blank());
  render();
});
render();

window.addEventListener('pilot-progress', () => {
  const tag = document.querySelector('.top .tag');
  if (tag) tag.textContent = PilotProgress.label();
  if (route === 'home') WorkspaceUX.refreshProgress?.(state);
});

function guide() {
  return `<span class="eyebrow">Aday Atölyesi / Kullanım rehberi</span><h1>Hazırlığını<br><em>çalışmaya dönüştür.</em></h1><p class="muted">Sınav pratiği, çalışma tercihleri, rol kararları ve kapsamlı şirket vakalarıyla hedeflediğin işe hazırlan.</p><div class="grid2">${[
    [
      '1. Hedefini belirle',
      'Rolünü, hedef tarihini ve günlük çalışma süreni seç. İlk öneriler hedefinden, sonraki adımlar tamamladığın çalışmalardan gelir.',
      '#start',
    ],
    [
      '2. Günlük planınla çalış',
      'Denemeleri, çalışma tercihlerini ve rol senaryolarını kendi hızında tamamla. Atölye kayıtlarını Hesabım ve teslimler alanından açıkça hesabına kaydet.',
      '#plan',
    ],
    [
      '3. Vaka dosyanı hazırla',
      'Hayali şirketin belgelerini ve tablolarını incele. Word veya Excel paketini indir. Beklenen çıktıları aynı numaralarla tek PDF, DOCX veya XLSX dosyasında yanıtla.',
      '#cases',
    ],
    [
      '4. Geri bildirimle geliştir',
      'Dosyanı teslim et. Atanmış değerlendiricinin geri bildirimini incele, alıştırmanı yap ve değişiklik notuyla revizyon gönder. Yeni bilgiyle kararını savunup başka vakaya geç.',
      '#pilot',
    ],
  ]
    .map(
      ([title, text, href]) =>
        `<section class="card"><h2>${title}</h2><p>${text}</p>${link(href, 'Aç')}</section>`
    )
    .join(
      ''
    )}</div><section class="card" style="margin-top:20px"><h2>Başlamadan önce</h2><p>Bu davetli pilotta giriş ChatGPT hesabıyla yapılır. Dosya başına 10 MB sınırı vardır. Numaralı çıktıların içerik uygunluğunu insan değerlendirici inceler; geri bildirim takvimi pilot başlangıcında belirlenir.</p><p>Atölye çalışmaların önce cihazına kaydolur. Başka cihazda devam etmek için hesabına kaydet, sonra yeni cihazda hesaptan yükle. Dosya teslimleri ve gelişim adımları doğrudan hesabında saklanır.</p><p>Çalışmalar işe kabul garantisi veya tek bir işe uygunluk puanı üretmez. Çalışma tercihleri öz bildirime dayanır; taslak ölçüm araçlarının psikometrik doğrulaması henüz yapılmadı.</p></section><section class="card" style="margin-top:20px"><h2>Dosyadan görüşmeye geçiş</h2><p>Teslimindeki “Dosya karşılaştırması ve görüşme özeti” bağlantısını aç. İlk ve son dosyayı indirip çıktı bazında dayanaklarını yaz. Görüşme özetini bu cihaza aktar; mülakat dosyasında kutusunu seçtikten sonra provada kullanabilirsin. Dosyanın içeriği otomatik okunmaz.</p><p>Zihin Parkuru içindeki Hata defterim, yanlış yanıtından bir kontrol yöntemi çıkarmana yardım eder. Mizaç raporunda tercihlerini gerçek örnek, ters örnek ve gözlemle araştırabilirsin. Bu notlar otomatik beceri puanı değildir.</p><p>Sekmede korunan değerlendirme taslağını hesabına ayrıca kaydet. Başka cihazda devam etmeden önce hazırlık kaydını hesabına kaydet veya tam yedeğini indir.</p></section>`;
}
