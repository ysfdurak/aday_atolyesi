let state = {
  answers: {},
  scenarios: {},
  motives: [],
  role: 'general',
  alias: '',
  step: 0,
  complete: false,
  demo: false,
};
try {
  const s = JSON.parse(localStorage.getItem('mizac-v2'));
  if (s && s.answers && s.scenarios) state = { ...state, ...s };
} catch (e) {}
const el = document.getElementById('app');
const esc = s =>
  String(s).replace(
    /[&<>"']/g,
    c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]
  );
function save() {
  try {
    localStorage.setItem('mizac-v2', JSON.stringify(state));
    return true;
  } catch (e) {
    if (!document.getElementById('mizac-storage-error'))
      el.insertAdjacentHTML(
        'afterbegin',
        '<p id="mizac-storage-error" role="alert">Kayıt yapılamadı. Sayfadan ayrılmadan notlarını kopyala ve cihaz yedeğini al.</p>'
      );
    return false;
  }
}
function page(p) {
  save();
  window.scrollTo(0, 0);
  if (p === 'home') home();
  if (p === 'setup') setup();
  if (p === 'test') test();
  if (p === 'report') report();
  if (p === 'method') method();
  if (p === 'research') research();
}
function home() {
  el.innerHTML = `<div class="hero"><div><span class="eyebrow">İnsanı bir etikete sığdırmadan</span><h1>İşte nasıl<br>çalışmayı<br>tercih ediyorsun?</h1><p class="muted">Çalışma tercihlerini görünür kılan, görüşmeyi somut örneklere taşıyan bir davranış haritası.</p><div class="actions"><button class="primary" onclick="page('setup')">${Object.keys(state.answers).length ? 'Değerlendirmeye devam et' : 'Kendi haritamı çıkar'} →</button><button onclick="demo()">Örnek aday özetini aç</button><a class="report-pdf-link" href="ornek-kapsamli-ik-raporu.pdf" download>Örnek tam rapor · PDF ↓</a></div><span class="tag">96 ifade + 6 iş senaryosu</span><span class="tag">Süre sınırı yok</span><span class="tag">AI / API gerektirmez</span></div><div class="paper"><div class="row"><span class="eyebrow">Örnek davranış haritası</span><span class="badge">Demo</span></div><h3>Bir puanın ötesinde,<br>konuşmaya değer ipuçları.</h3>${[
    { n: 'Karar için kanıt', s: 79, l: 'Deneyim', r: 'Veri ve karşılaştırma' },
    { n: 'Birlikte çalışma', s: 54, l: 'Bağımsız', r: 'Sık fikir alışverişi' },
    { n: 'Yöntem değişikliği', s: 71, l: 'Bilinen yöntem', r: 'Yeni yöntem' },
  ]
    .map(
      d =>
        `<div class="pref"><b>${d.n}</b><div class="track"><i style="left:${d.s}%"></i></div><div class="ends"><span>${d.l}</span><span>${d.r}</span></div></div>`
    )
    .join(
      ''
    )}<div class="note"><small>Görüşmede açılacak konu</small><p>“İlk kanaatinin veriyle değiştiği bir kararını anlatır mısın?”</p></div></div></div><div class="grid"><div class="card"><span class="number">1</span><h3>Tercihini anlat</h3><p class="muted">Doğru cevap aramadan, işte genellikle nasıl davrandığını düşün.</p></div><div class="card"><span class="number">2</span><h3>Bağlamla karşılaştır</h3><p class="muted">İş senaryoları ve çalışma koşullarıyla öz bildirimi birlikte ele al.</p></div><div class="card"><span class="number">3</span><h3>Örnekle doğrula</h3><p class="muted">İK ve aday için açık, gerekçesi izlenebilir görüşme rehberi al.</p></div></div><div class="notice"><b>Pilot sürüm.</b> Sorular özgündür; Türkçe psikometrik geçerlik, güvenirlik ve norm çalışması henüz yapılmadı. Bu sürüm gerçek işe alımda eleme, sıralama veya işe alım kararı için kullanılmamalıdır.</div>`;
}
function setup() {
  el.innerHTML = `<div class="narrow"><span class="eyebrow">Başlamadan önce</span><h1>Kendi çalışma biçimin.</h1><div class="card"><p>Son dönemdeki tipik iş, eğitim veya proje deneyimini düşün. İdeal görünmeye çalışmadan sana yakın seçeneği işaretle. Deneyimin yoksa benzer bir ekip çalışmasını esas al.</p><p class="muted">Üç kısa oturumda tamamlayabilirsin: her biri yaklaşık 8–10 dakika. Her oturum sonunda yanıtların kaydedilir; istersen ara verip sonra kaldığın yerden devam edersin. Hız ölçülmez, geri dönüp yanıtlarını değiştirebilirsin.</p><label for="alias">Katılımcı kodu (isteğe bağlı)</label><input type="text" id="alias" maxlength="40" placeholder="Örn. K-001" value="${esc(state.alias)}"><label for="role">Görüşme bağlamı</label><select id="role">${Object.entries(
    ROLES
  )
    .map(([k, r]) => `<option value="${k}" ${state.role === k ? 'selected' : ''}>${r.name}</option>`)
    .join(
      ''
    )}</select><div class="note">Yanıtlar bu tarayıcının yerel depolamasında tutulur; sunucuya veya AI servisine gönderilmez. Ortak cihaz kullanıyorsan sonunda verileri sil. Bu prototipte aday daveti ve ortak İK paneli yoktur.</div><label class="check"><input type="checkbox" id="consent">Pilot niteliğini ve yerel kayıt bilgisini okudum; yanıtlamaya başlamak istiyorum.</label><div id="setup-error" role="alert" class="error"></div><div class="actions"><button class="primary" onclick="begin()">Başla / devam et →</button><button onclick="clearData()">Kayıtlı verileri sil</button></div></div></div>`;
}
function begin() {
  if (!document.getElementById('consent').checked) {
    document.getElementById('setup-error').textContent = 'Devam etmek için bilgilendirmeyi okuduğunu belirt.';
    return;
  }
  state.alias = document.getElementById('alias').value.trim();
  state.role = document.getElementById('role').value;
  state.demo = false;
  page('test');
}
function test() {
  const k = state.step;
  const total = 14;
  const count = Object.keys(state.answers).length + Object.keys(state.scenarios).length;
  let body = '';
  if (k < 12) {
    body = ITEMS.slice(k * 8, k * 8 + 8)
      .map(
        (q, i) =>
          `<div class="question"><small>İfade ${k * 8 + i + 1} / 96</small><h3>${q.text}</h3><div class="likert" role="group" aria-label="${esc(q.text)}">${['Hiç katılmıyorum', 'Pek katılmıyorum', 'Kısmen / değişiyor', 'Çoğunlukla katılıyorum', 'Tamamen katılıyorum'].map((l, j) => `<button aria-pressed="${state.answers[q.id] === j + 1}" class="${state.answers[q.id] === j + 1 ? 'selected' : ''}" onclick="answer('${q.id}',${j + 1})">${j + 1}<br>${l}</button>`).join('')}</div></div>`
      )
      .join('');
  } else if (k === 12) {
    body = SCENARIOS.map(
      (s, i) =>
        `<div class="question"><small>Senaryo ${i + 1} / 6 · Tercih sorusu, doğru cevap aranmaz</small><h3>${s.title}</h3><p>${s.text}</p><div class="options">${s.options.map((o, j) => `<button aria-pressed="${state.scenarios[i] === j}" class="${state.scenarios[i] === j ? 'selected' : ''}" onclick="scenario(${i},${j})">${o[0]}</button>`).join('')}</div></div>`
    ).join('');
  } else {
    body = `<h2>Seni destekleyen çalışma koşulları</h2><p>En çok tercih ettiğin <b>iki koşulu</b> seç. Bu bölüm kişilik puanına katılmaz; görüşmede konuşulacak bir öz bildirimdir.</p><div class="motives">${['Net beklenti ve düzen', 'Bağımsız karar alanı', 'Birlikte üretme', 'Öğrenme ve yenilik', 'Görünür takdir', 'İlerleme ve sorumluluk'].map((m, i) => `<button class="${state.motives.includes(i) ? 'selected' : ''}" aria-pressed="${state.motives.includes(i)}" onclick="motive(${i})">${m}</button>`).join('')}</div>`;
  }
  el.innerHTML = `<div class="narrow"><div class="row"><span class="eyebrow">${k < 12 ? 'Çalışma tercihleri' : k === 12 ? 'İş senaryoları' : 'Çalışma koşulları'}</span><span>Oturum ${session(k)} / 3 · Bölüm ${k + 1} / ${total}</span></div><div class="bar"><i style="width:${Math.round((count / 102) * 100)}%"></i></div><p class="muted">${count} / 102 yanıt · Kayıt otomatik · Süre sınırı yok</p><div class="card">${body}</div><div id="test-error" role="alert" class="error"></div><div class="sticky"><button onclick="prev()">${k ? '← Önceki' : 'Başlangıç'}</button><small>${k < 12 ? 'Tipik davranışını düşün.' : 'Tercihlerini belirt.'}</small><button class="primary" onclick="next()">${k === 13 ? 'Raporu oluştur' : 'Sonraki →'}</button></div></div>`;
}
// Değerlendirme üç oturuma bölünür: 1–4. bölüm, 5–8. bölüm, 9–12. bölüm + senaryolar + koşullar.
// Oturum sonları yalnız mola noktasıdır; ara puan gösterilmez, eksik yanıt rapora girmez.
const BREAKS = [3, 7];
function session(k) {
  return k <= 3 ? 1 : k <= 7 ? 2 : 3;
}
function checkpoint(done) {
  const left = done === 1 ? 'iki' : 'bir';
  el.innerHTML = `<div class="narrow"><div class="card checkpoint"><span class="eyebrow">Oturum ${done} / 3 tamamlandı</span><h1>Yanıtların kaydedildi.</h1><p>${done * 32} ifade yanıtlandı. Geriye ${left} kısa oturum kaldı${done === 2 ? '; son oturumda 32 ifadeye ek olarak 6 senaryo ve 2 koşul seçimi var' : ''}.</p><p class="muted">Ara puan gösterilmez: tercihler ancak bütün ifadeler yanıtlandığında yorumlanır.</p><div class="actions"><button class="primary" onclick="page('test')">Sonraki oturuma geç →</button><a class="btn" href="/#plan">Şimdilik bırak, planıma dön</a></div></div></div>`;
  window.scrollTo(0, 0);
}
function answer(id, v) {
  const y = window.scrollY;
  state.answers[id] = v;
  save();
  test();
  window.scrollTo(0, y);
}
function scenario(i, j) {
  const y = window.scrollY;
  state.scenarios[i] = j;
  save();
  test();
  window.scrollTo(0, y);
}
function motive(i) {
  if (state.motives.includes(i)) state.motives = state.motives.filter(x => x !== i);
  else if (state.motives.length < 2) state.motives.push(i);
  save();
  test();
}
function prev() {
  if (state.step) state.step--;
  else return page('home');
  page('test');
}
function next() {
  let ok =
    state.step < 12
      ? ITEMS.slice(state.step * 8, state.step * 8 + 8).every(q => Number.isInteger(state.answers[q.id]))
      : state.step === 12
        ? SCENARIOS.every((_, i) => Number.isInteger(state.scenarios[i]))
        : state.motives.length === 2;
  if (!ok) {
    document.getElementById('test-error').textContent = 'Devam etmeden bu bölümdeki seçimleri tamamla.';
    return;
  }
  if (state.step === 13) {
    state.complete = true;
    state.demo = false;
    page('report');
  } else {
    const finished = state.step;
    state.step++;
    save();
    if (BREAKS.includes(finished)) checkpoint(session(finished));
    else page('test');
  }
}
let demoState = null;
function demo() {
  demoState = {
    answers: {},
    scenarios: { 0: 0, 1: 0, 2: 1, 3: 0, 4: 2, 5: 0 },
    motives: [0, 3],
    role: 'analyst',
    alias: 'ÖRNEK K-014',
    complete: true,
    demo: true,
  };
  const patterns = [
    [5, 4, 4, 2, 2, 1],
    [5, 5, 4, 1, 2, 2],
    [2, 3, 2, 4, 4, 5],
    [4, 3, 4, 3, 3, 2],
    [4, 4, 3, 2, 3, 2],
    [5, 5, 4, 1, 2, 1],
    [4, 4, 5, 2, 2, 2],
    [2, 3, 3, 4, 4, 3],
  ];
  DIMS.forEach((d, i) => d.items.forEach((_, j) => (demoState.answers[d.id + '-' + j] = patterns[i][j % 6])));
  report(demoState);
}
function report(input) {
  const s = input || state;
  if (!s.complete || !isComplete(s)) {
    el.innerHTML = `<div class="narrow card"><h1>Haritan henüz hazır değil.</h1><p>Rapor için tüm ifadeleri, senaryoları ve iki çalışma koşulunu tamamla.</p><div class="actions"><button class="primary" onclick="page('setup')">Devam et</button><button onclick="demo()">Örnek raporu aç</button></div></div>`;
    return;
  }
  const scores = score(s.answers),
    q = quality(s.answers),
    role = ROLES[s.role] || ROLES.general;
  const bandname = b =>
    b === 'high' ? 'Sağ kutba yakın' : b === 'low' ? 'Sol kutba yakın' : 'İki tercih arasında';
  const text = d =>
    d.band === 'mid'
      ? 'Yanıtları bu iki yaklaşım arasında yer alıyor. Hangi koşulda hangisini seçtiği görüşmede araştırılmalı.'
      : d.band === 'high'
        ? d.high
        : d.low;
  const trade = d =>
    d.band === 'mid'
      ? 'Tercihin görev türüne göre nasıl değiştiğini somut örnekle araştır.'
      : d.band === 'high'
        ? d.tradeH
        : d.tradeL;
  el.innerHTML = `<div class="row"><div><span class="eyebrow">${s.demo ? 'Kurgusal örnek · gerçek aday değildir' : 'Öz bildirime dayalı pilot rapor'}</span><h1>Çalışma biçiminin haritası.</h1><p>${esc(s.alias || 'İsimsiz katılımcı')} · ${role.name} · Model 0.2 / Kural 0.2</p></div><div class="actions no-print"><button onclick="window.print()">Yazdır / PDF</button><button onclick="exportReport(${s.demo ? 'true' : 'false'})">JSON indir</button><button onclick="page('method')">Kuralları gör</button><button onclick="exportPilotRow(${s.demo ? 'true' : 'false'})">Pilot satırı · CSV</button></div></div><div class="notice"><b>Yorum sınırı:</b> 0–100 değerleri yanıt ölçeğinin dönüşümüdür; yüzdelik dilim, yetenek, başarı olasılığı veya adaylar arası sıralama değildir. Bu pilot rapor işe alım kararı için kullanılamaz.</div><div class="two"><div class="card"><span class="eyebrow">İK için görüşme özeti</span><h2>Önce şu başlıkları aç</h2>${role.focus
    .map(id => {
      let d = scores.find(x => x.id === id);
      return `<p><b>${d.name}:</b> ${text(d)}</p>`;
    })
    .join(
      ''
    )}<div class="note">${role.text} Rol seçimi puanları değiştirmez; yalnızca görüşme önceliklerini düzenler.</div></div><div class="card"><span class="eyebrow">Yanıt örüntüsü</span><h2>${q.flags.length ? 'Açıklığa kavuşturulacak noktalar' : 'Ek örüntü işareti yok'}</h2><p>96 / 96 ifade · 6 / 6 senaryo</p>${q.flags.length ? q.flags.map(f => `<p>${f}</p>`).join('') : '<p class="muted">Tanımlı kaba kontroller eşik aşmadı. Bu sonuç yanıtların doğruluğunu veya ölçümün geçerli olduğunu kanıtlamaz.</p>'}<p class="muted">Hız, yüz ifadesi, demografik bilgi veya sağlık verisi kullanılmaz. “Dürüstlük puanı” üretilmez.</p></div></div><section class="section"><span class="eyebrow">8 çalışma tercihi</span><h2>Her iki kutbun da bir kullanım alanı var.</h2><div class="two">${scores
    .map(
      d =>
        `<article class="card dimension"><div class="row"><h3>${d.name}</h3><span class="badge">${d.score} / 100</span></div><div class="track"><i style="left:${d.score}%"></i></div><div class="ends"><span>${d.left}</span><span>${d.right}</span></div><p><b>${bandname(d.band)}.</b> ${text(d)}</p><p><b>İş koşuluna göre:</b> ${trade(d)}</p><details><summary>Bu yorum nereden geldi?</summary><p>Kural ${d.id.toUpperCase()}-${d.band.toUpperCase()}. 12 madde; her alt başlıkta 3 doğrudan ve 3 ters madde bulunur. Eşikler geçicidir: 35 altı sol, 35–65 arası orta, 65 üstü sağ.</p>${ITEMS.filter(
          x => x.dim === d.id
        )
          .map(
            x =>
              `<p><small>${x.id} · ${x.text} → Yanıt ${s.answers[x.id]} / 5${x.reverse ? ' · ters puan' : ''}</small></p>`
          )
          .join('')}</details></article>`
    )
    .join(
      ''
    )}</div></section><section class="card section"><span class="eyebrow">Tercihlerin birlikte okunması</span><h2>Bağlamla araştırılacak hipotezler</h2>${interactions(scores)}<p class="muted">Bu kurallar bir tipoloji veya performans tahmini oluşturmaz. İki ölçeğin birlikte nasıl yorumlandığını gösteren taslak görüşme hipotezleridir.</p></section><section class="card section"><span class="eyebrow">İş senaryoları</span><h2>Farklı bağlamlarda ne seçildi?</h2><p class="muted">Senaryolar puana katılmaz. Tercih seçimi, o davranışı uygulayabilme becerisini göstermez.</p>${SCENARIOS.map(
    (sc, i) => {
      const o = sc.options[s.scenarios[i]],
        d = scores.find(x => x.id === o[1]);
      const opposite = (o[3] === -1 && d.band === 'high') || (o[3] !== -1 && d.band === 'low');
      return `<div class="pref"><b>${i + 1}. ${sc.title}</b><p>${o[0]}</p><span class="tag">${o[2]}</span><p class="muted">${opposite ? 'Öz bildirimle farklı yönde bir tercih var. Çelişki olarak etiketlemeden, bu senaryoda seçimi neyin değiştirdiğini sorun.' : 'Bu senaryoda bu yaklaşımın neden tercih edildiğini, gerçek bir örnek ve sonucu üzerinden araştır.'}</p></div>`;
    }
  ).join(
    ''
  )}</section><section class="two section"><div class="card"><span class="eyebrow">Yapılandırılmış görüşme</span><h2>Kanıt toplayan sorular</h2>${role.focus
    .map((id, i) => {
      const d = scores.find(x => x.id === id);
      return `<p><b>${i + 1}. ${d.q}</b></p><p class="muted">Durum neydi? Senin somut eylemin neydi? Sonuç ne oldu? Başka nasıl davranabilirdin?</p>`;
    })
    .join(
      ''
    )}<div class="note">Görüşmeci çıpası: 0 = örnek yok; 1 = genel anlatım; 2 = somut eylem; 3 = somut eylem ve gözlenebilir sonuç. Bu, anlatılan örneğin kanıt düzeyidir; kişilik puanına katılmaz. Karşılaştırılacak adaylara aynı çekirdek sorular sorulmalıdır.</div></div><div class="card"><span class="eyebrow">Aday geri bildirimi</span><h2>Seni destekleyen koşullar</h2>${s.motives.map(i => `<span class="tag">${['Net beklenti ve düzen', 'Bağımsız karar alanı', 'Birlikte üretme', 'Öğrenme ve yenilik', 'Görünür takdir', 'İlerleme ve sorumluluk'][i]}</span>`).join('')}<p>Bunlar doğrudan seçtiğin koşullardır. Motivasyonunun kesin veya değişmez bir ölçümü değildir.</p><h3>Bir sonraki görüşmede</h3><p>Bir tercihinin işe yaradığı, bir de değiştirmen gereken iki örnek hazırla. Rolün günlük iş akışını ve senden hangi durumlarda farklı davranış beklendiğini sor.</p><h3>Gelişim denemesi</h3><p>${trade(scores.find(d => d.band !== 'mid') || scores[0])} Küçük bir görevde deneyip çıkan farkı not et.</p></div></section>${expandedReport(s, scores)}<div class="actions no-print"><button onclick="page('setup')">Yanıtları gözden geçir</button><button onclick="clearData()">Bu cihazdaki verilerimi sil</button></div>`;
  window.scrollTo(0, 0);
}
function interactions(scores) {
  const m = Object.fromEntries(scores.map(d => [d.id, d]));
  let out = [];
  if (m.plan.band === 'high' && m.change.band === 'high')
    out.push(
      'Önceden yapılandırma ve yeni yöntem deneme birlikte belirgin. Planlı bir deneme tasarlamaya yatkınlık hipotezi araştırılabilir. “Bir yeniliği nasıl planlayıp sınadın?”'
    );
  if (m.evidence.band === 'high' && m.pace.band === 'low')
    out.push(
      'Veriyle karşılaştırma ve harekete geçmeden düşünme birlikte belirgin. Süre kısıtlı işlerde yeterli bilgi eşiğini nasıl belirlediğini araştır.'
    );
  if (m.detail.band === 'high' && m.pace.band === 'high')
    out.push(
      'Ayrıntılı kontrol ve erken çıktı tercihi birlikte belirgin. Hangi kontrolü başlangıçta, hangisini sonraki turda yaptığını sorun.'
    );
  if (m.collab.band === 'high' && m.voice.band === 'low')
    out.push(
      'Fikir alışverişi tercihi yüksek, sesli görüş paylaşımı daha geç olabilir. Ortak çalışmada yazılı veya bire bir iletişimi nasıl kullandığını sorun.'
    );
  if (m.initiative.band === 'high' && m.plan.band === 'low')
    out.push(
      'Başlatma ve akış içinde şekillendirme birlikte belirgin. Bağımlılıkların ve yetki sınırlarının nasıl takip edildiğini araştır.'
    );
  if (!out.length)
    out.push(
      'Tanımlı birleşim kuralları tetiklenmedi. Bu, profilin sıradan veya yetersiz olduğu anlamına gelmez. Her tercihi görev bağlamında ayrı örneklerle araştır.'
    );
  return out.map(t => `<p>• ${t}</p>`).join('');
}
function exportReport(isDemo) {
  const s = isDemo ? demoState : state;
  if (!s) return;
  const data = {
    model: 'mizac-0.2',
    ruleVersion: '0.2',
    status: 'unvalidated-pilot',
    ...s,
    facets: facetScores(s.answers),
    scores: score(s.answers).map(d => ({
      dimension: d.id,
      score: d.score,
      band: d.band,
      rule: d.id + '-' + d.band,
    })),
    quality: quality(s.answers),
    limitations: 'Norm, başarı olasılığı, performans veya uygunluk puanı değildir.',
  };
  const a = document.createElement('a'),
    u = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }));
  a.href = u;
  a.download = 'mizac-pilot-rapor.json';
  a.click();
  setTimeout(() => URL.revokeObjectURL(u), 1000);
}
function clearData() {
  if (!confirm('Bu cihazdaki tüm Mizaç yanıtları silinsin mi?')) return;
  localStorage.removeItem('mizac-v2');
  localStorage.removeItem('mizac-v1');
  state = {
    answers: {},
    scenarios: {},
    motives: [],
    role: 'general',
    alias: '',
    step: 0,
    complete: false,
    demo: false,
  };
  home();
}
function method() {
  el.innerHTML = `<span class="eyebrow">Şeffaf model · Araştırma notları · 30 Ekim 2026</span><h1>Yorumun arkasındaki kurallar.</h1><p class="muted">Bu ürün, aşağıdaki markaların testlerini, maddelerini, puanlama anahtarlarını veya normlarını kullanmaz. Pazar incelemesinden çıkan ürün tasarımı kararları bize aittir.</p><section class="card section"><h2>Pazardan ne öğrendik?</h2><div class="tablewrap"><table><tr><th>Ürün</th><th>Resmî kaynakta görülen yaklaşım</th><th>Mizaç tasarımına yansıması</th></tr><tr><td>SHL OPQ</td><td>İşte davranış biçimi ve farklı kullanıcılar için raporlar</td><td>Aday geri bildirimi ve İK görüşme rehberi</td></tr><tr><td>Hogan</td><td>HPI, HDS, MVPI ile farklı değerlendirme alanları; bağlama göre yorum</td><td>Günlük tercih, senaryo seçimi ve koşul tercihini ayrı tutma</td></tr><tr><td>Predictive Index</td><td>Dört temel davranış faktörüyle kısa, anlaşılır profil</td><td>Kolay okunur iki kutuplu harita</td></tr><tr><td>Aon ADEPT-15</td><td>15 davranış boyutuna dayalı kişilik değerlendirmesi</td><td>Tek bir tip etiketinden kaçınan boyut temelli yapı</td></tr></table></div><p>Bu özet ürün sağlayıcılarının açıklamalarına dayanır; bağımsız bir geçerlik karşılaştırması veya pazar payı sıralaması değildir.</p></section><div class="two"><section class="card"><h2>Puanlama</h2><p>Her boyut 12 maddeden, iki kavramsal alt başlıktan oluşur. Her alt başlıkta 3 doğrudan ve 3 ters madde vardır: <b>ters yanıt = 6 − yanıt</b>.</p><p><b>Boyut puanı = (madde ortalaması − 1) × 25</b>.</p><p>35 altı sol kutba; 35–65 arası iki kutup arasına; 65 üstü sağ kutba yakın yorumlanır. Bunlar <b>geçici tasarım eşikleridir</b>; normlara veya performans verisine dayanmaz.</p><p>Senaryolar ve koşul tercihleri bu puana eklenmez. En az bir eksik yanıt varsa tam rapor açılmaz.</p><p>8 boyut × 3 bant = 24 temel yorum dalı ve 16 kavramsal alt başlık vardır. Alt başlıklar henüz doğrulanmış alt ölçekler değildir. Kapsamlı raporda ek olarak 9 birleşim kuralı, senaryo takip soruları ve rol bağlamına göre görüşme sırası kullanılır. Tüm olası cevap dizileri için ayrı metin yazılması gerekmez.</p></section><section class="card"><h2>Yanıt örüntüsü kontrolleri</h2><p>96 yanıtın en az 80'i aynı seçenekse yoğunlaşma işareti gösterilir.</p><p>Her boyutta 0↔3, 1↔4, 6↔9 ve 7↔10 maddelerinin ters kodlanmış değerleri karşılaştırılır. En az 4 çiftte fark ≥3 ise açıklama önerilir. Bu maddeler benzer içeriğe sahiptir; eşdeğerlikleri henüz sınanmadı.</p><p>Bu eşikler de taslaktır. Yanıt örüntüsünden dürüstlük, aldatma, sağlık veya kişilik bozukluğu çıkarımı yapılmaz. Tekrarlı yanıtlar veya farklılıklar otomatik eleme nedeni değildir.</p><p>Aynı yanıtlar her zaman aynı yorumu üretir. Model ve kural sürümleri raporda görünür.</p></section></div><section class="card section"><h2>İK gözüyle ürün gereksinimleri</h2><div class="tablewrap"><table><tr><th>İhtiyaç</th><th>Bu prototip</th><th>Kurumsal sürüm</th></tr><tr><td>Somut görüşme çıktısı</td><td>Boyut yorumu, koşula bağlı zorluk, takip sorusu, kanıt çıpası</td><td>İş analiziyle doğrulanmış çekirdek görüşme seti</td></tr><tr><td>Açıklanabilirlik</td><td>Madde → puan → kural → metin izi</td><td>Değişmez sürümler ve denetim kaydı</td></tr><tr><td>Aday deneyimi</td><td>Mobil arayüz, geri dönme, yerel kayıt, silme, PDF yazdırma</td><td>Davet, erişilebilirlik uyarlamaları, açık veri bilgilendirmesi</td></tr><tr><td>Çok kullanıcı</td><td>Yok; veriler yalnız bu tarayıcıda</td><td>Şirket / rol bazlı erişim, güvenli sunucu, saklama ve silme politikası</td></tr><tr><td>Ölçüm kalitesi</td><td>Özgün madde havuzu ve kaba yanıt kontrolleri</td><td>Psikometrik araştırma, örneklem ve kullanım amacı için kanıt</td></tr><tr><td>İşe alımda kullanım</td><td>Yalnız ürün ve içerik denemesi</td><td>Bağlama uygun geçerlik kanıtından sonra uzman incelemesiyle karar desteği</td></tr></table></div></section><section class="card section"><h2>Gerçek ölçüm ürününe geçiş</h2><ol><li><b>İş analizi:</b> Gerçek görevler ve kritik olaylarla hangi davranışın neden ilgili olduğunu belirleme.</li><li><b>İçerik incelemesi:</b> İş ve örgüt psikoloğu, İK ve hedef katılımcılarla madde anlaşılırlığı, tek anlamlılık ve kapsamı değerlendirme.</li><li><b>Pilot:</b> Hedef kullanım grubundan gerekçelendirilmiş örneklem; madde dağılımları, ters madde etkisi, eksik yanıt ve anlaşılırlık analizi.</li><li><b>Psikometri:</b> Boyut yapısı, iç tutarlılık, zaman içi kararlılık ve ölçüm hatası; yalnız bir güvenirlik katsayısı yeterli kabul edilmez.</li><li><b>Geçerlik ve adalet:</b> Görevle ilişkili bağımsız performans ölçütleri; ayrı doğrulama örneklemi; gruplar arasında ölçüm eşdeğerliği ve olumsuz etki incelemesi.</li><li><b>Sınırları belirleme:</b> Hangi kullanımın desteklendiği, hangi rol ve örneklemin dışında yorum yapılmayacağı; uzman incelemesi ve veri koruma süreçleri.</li></ol><p>Bu araştırma yolu SIOP seçim araçlarının geliştirilmesi ve kullanımı ilkeleriyle uyumluluk hedefler. Henüz doğrulama tamamlandığı iddia edilmez.</p></section><section class="card section sources"><h2>İncelenen kaynaklar</h2><ul><li><a href="https://online-auth.shl.com/id/en-us/products/opq32r" target="_blank" rel="noopener">SHL — OPQ32r ürün açıklaması</a></li><li><a href="https://www.hoganassessments.com/about/faq/" target="_blank" rel="noopener">Hogan — Ölçekler, bağlam ve normlar</a></li><li><a href="https://www.predictiveindex.com/assessments/behavioral-assessment/" target="_blank" rel="noopener">Predictive Index — Behavioral Assessment</a></li><li><a href="https://www.aon.com/en/capabilities/talent-and-rewards/talent-assessment-products-and-tools" target="_blank" rel="noopener">Aon — Talent Assessment ve ADEPT-15</a></li><li><a href="https://www.apa.org/ed/accreditation/about/policies/personnel-selection-procedures.pdf" target="_blank" rel="noopener">SIOP / APA — Personnel Selection Procedures, 5. baskı</a></li></ul></section><div class="actions"><button class="primary" onclick="page('setup')">Değerlendirmeye geç</button><button onclick="demo()">Örnek rapor</button></div>`;
}
home();
