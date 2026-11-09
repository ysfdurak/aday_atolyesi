'use strict';
const { cats, question, shuffle, R } = Engine,
  $ = s => document.querySelector(s),
  app = $('#app');
const typeNames = Engine.typeNames;
const profiles = [
  {
    id: 'graded',
    name: 'Genel yetenek · Kolaydan zora',
    count: 36,
    minutes: 40,
    pattern: ['num', 'shape', 'verbal', 'attention', 'quant', 'logic'],
    level: 2,
    graded: true,
    desc: 'Üç aşamalı genel yetenek provası; her aşamada altı alan dengeli temsil edilir.',
    note: '36 soru / 40 dakika. Her alandan 6 soru: temel, birleşik ve yoğun aşamada ikişer soru. Güçlük sırası tasarlanmıştır; istatistiksel olarak kalibre edilmemiştir.',
  },
  {
    id: 'custom',
    name: 'Kendi sınavını oluştur',
    count: 30,
    minutes: 30,
    pattern: ['num', 'shape', 'verbal', 'attention', 'quant', 'logic'],
    level: 2,
    desc: 'Alan, süre ve güçlüğü seç; her oturumda yeni sorularla çalış.',
    note: 'Tüm süre ve dağılımlar bağımsız hazırlık tasarımıdır.',
  },
  {
    id: 'balanced',
    name: 'Genel yetenek · Dengeli',
    count: 30,
    minutes: 30,
    pattern: ['num', 'shape', 'verbal', 'attention', 'quant', 'logic'],
    level: 2,
    desc: 'Altı alanda çok adımlı muhakeme ve veri analizi.',
    note: 'Her alandan 5 soru. Zor güçlük; soru başına ortalama 60 saniye.',
  },
  {
    id: 'analytic',
    name: 'Analitik muhakeme · İleri',
    count: 24,
    minutes: 32,
    pattern: ['quant', 'logic', 'shape', 'verbal'],
    level: 3,
    desc: 'Veri yorumlama, kısıt çözümü, birleşik desenler ve kapsam analizi.',
    note: 'Her alandan 6 soru. İleri güçlük; soru başına ortalama 80 saniye.',
  },
  {
    id: 'pressure',
    name: 'Zaman baskısı · Karma',
    count: 50,
    minutes: 25,
    pattern: ['num', 'verbal', 'shape', 'attention', 'quant'],
    level: 2,
    desc: 'Hızlı eleme, soru seçimi ve süre yönetimi antrenmanı.',
    note: '50 soru / 25 dakika, bir aday deneyimindeki formatla aynı süre–sayı oranındadır. Dağılım ve tüm sorular bize aittir; herhangi bir kurumun güncel formatı olarak sunulmaz.',
  },
  {
    id: 'numerical',
    name: 'Sayısal analiz · Yoğun',
    count: 20,
    minutes: 22,
    pattern: ['quant', 'num'],
    level: 3,
    desc: 'Ağırlıklı oran, ardışık değişim, kapasite, veri yeterliliği ve karma diziler.',
    note: '10 veri analizi + 10 sayısal mantık sorusu. İleri güçlük; tasarlanmış çalışma formatı.',
  },
  {
    id: 'verbal',
    name: 'Sözel analiz · Yoğun',
    count: 24,
    minutes: 20,
    pattern: ['verbal', 'logic'],
    level: 2,
    desc: 'Politika istisnaları, kesin çıkarımlar, argümanlar ve çok kısıtlı mantık.',
    note: '12 sözel + 12 analitik mantık sorusu. Tasarlanmış çalışma formatı.',
  },
];
let data;
try {
  data = JSON.parse(localStorage.getItem('zp-data-v1')) || { answers: [], sessions: [], xp: 0, seen: [] };
} catch {
  data = { answers: [], sessions: [], xp: 0, seen: [] };
}
let session = null,
  timer = null,
  lastResult = null,
  activeRoute = '';
try {
  session = JSON.parse(localStorage.getItem('zp-session-v1'));
} catch {}
if (
  session &&
  (session.engineVersion !== 2 || session.questions.some(q => q.cat === 'num' && q.engineVersion !== 3))
) {
  try {
    localStorage.setItem('zp-previous-session', JSON.stringify(session));
  } catch {}
  session = null;
}
data.coachState = data.coachState || Coach.blank();
data.discoveryState = data.discoveryState || Discovery.blank();
data.reports = data.reports || [];
data.pilotState = data.pilotState || Pilot.blank();
if (session?.coach && session.coach.policyVersion !== 2) {
  try {
    localStorage.setItem('zp-previous-session', JSON.stringify(session));
  } catch {}
  session = null;
}
data.sessions.forEach(x => {
  if (!x.engineVersion)
    x.name =
      'Önceki sürüm · ' + (x.mode === 'exam' ? 'Sınav' : x.mode === 'speed' ? 'Hız turu' : 'Antrenman');
});
function save() {
  try {
    localStorage.setItem('zp-data-v1', JSON.stringify(data));
    localStorage.setItem('zp-session-v1', JSON.stringify(session));
  } catch {
    toast('Cihaz depolaması dolu; bu oturumdaki ilerleme kaydedilemedi.');
  }
  $('#xpHead').textContent = data.xp + ' XP';
}
function toast(t) {
  $('#toast').textContent = t;
  $('#toast').style.display = 'block';
  setTimeout(() => ($('#toast').style.display = 'none'), 3500);
}
const fmt = s =>
  `${Math.floor(Math.max(0, s) / 60)
    .toString()
    .padStart(2, '0')}:${Math.floor(Math.max(0, s) % 60)
    .toString()
    .padStart(2, '0')}`;
const pct = a => (a.length ? Math.round((a.filter(x => x.correct).length / a.length) * 100) : 0);
const mean = a => (a.length ? a.reduce((s, x) => s + x, 0) / a.length : 0);
const catname = id => cats.find(c => c.id === id)?.name || id;
function title(k, t, sub) {
  return `<div class="intro"><div><div class="eyebrow">${k}</div><h1>${t}</h1><p>${sub}</p></div><div class="datechip">${new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', weekday: 'long' })}</div></div>`;
}
function category(c) {
  let ans = data.answers.filter(a => a.cat === c.id);
  return `<button class="category" style="--c:${c.color}" data-go="train/${c.id}"><span class="caticon">${c.icon}</span><h3>${c.name}</h3><p>${c.desc}</p><div class="cardmeta"><span>${typeNames[c.id].length} üretim türü · ${ans.length ? `%${pct(ans)} doğruluk` : 'Keşfetmeye hazır'}</span><span>↗</span></div></button>`;
}
function weak() {
  let seen = cats
    .map(c => ({ c, n: data.answers.filter(a => a.cat === c.id) }))
    .filter(v => v.n.length >= 3)
    .sort((a, b) => pct(a.n) - pct(b.n));
  return seen[0]?.c;
}
function art() {
  return `<svg class="heroart" viewBox="0 0 240 240" aria-hidden="true"><ellipse cx="133" cy="227" rx="96" ry="12" fill="#cbd8bc"/><path d="M32 220V156h55v64M87 220V109h55v111M142 220V61h55v159" fill="#bfd09f"/><path d="M32 156l22-14h55l-22 14M87 109l22-14h55l-22 14M142 61l22-14h55l-22 14" fill="#dce9bd"/><path d="M87 156l22-14v47l-22 31M142 109l22-14v111l-22 14M197 61l22-14v159l-22 14" fill="#9eb47f"/><circle cx="168" cy="19" r="14" fill="#f8faf0" stroke="#92a777" stroke-width="2"/><path d="M163 19l4 4 7-8" stroke="#5c7f47" stroke-width="2" fill="none"/><rect x="22" y="77" width="43" height="43" rx="11" fill="#f4f6e7" transform="rotate(-13 43 99)"/><path d="M34 100l9-14 9 14-9 14z" fill="#819b68"/><circle cx="215" cy="111" r="9" fill="#e7ba66"/><path d="M99 43v18m-9-9h18" stroke="#8ea477" stroke-width="2"/></svg>`;
}
function home() {
  let total = data.answers.length,
    correct = data.answers.filter(x => x.correct),
    w = weak(),
    today = data.answers.filter(x => new Date(x.at).toDateString() === new Date().toDateString()).length;
  app.innerHTML =
    title(
      'YENİ BİR TUR, YENİ BİR SEN',
      'Bir adım daha hızlı.',
      'Mantığını geliştir. Doğruluğunu koru. Kendi rekorunu geç.'
    ) +
    `<div class="dashgrid"><div><section class="hero"><div class="content"><div class="eyebrow">ÖRÜNTÜ KOÇU</div><h1>Önce tanı.<br>Sonra akıcı çöz.</h1><p>Her soruda farklı bir ilişki keşfet.<br>Sayı değişimini yeni kural saymadan çalış.</p><a class="btn" href="#coach">Çalışma planıma git <span>→</span></a></div>${art()}</section><div class="stats"><div class="stat"><div class="statlabel">Çözülen soru <span>◈</span></div><strong>${total}</strong><small>${total ? 'Her soru bir deneyim.' : 'İlk turun seni bekliyor.'}</small></div><div class="stat"><div class="statlabel">Doğruluk <span>◎</span></div><strong>${total ? '%' + pct(data.answers) : '—'}</strong><small>${total ? 'Yanıtladığın sorularda' : 'İlk turdan sonra hesaplanır.'}</small></div><div class="stat"><div class="statlabel">Doğru çözüm süresi <span>◷</span></div><strong>${correct.length ? Math.round(mean(correct.map(x => x.sec))) + ' sn' : '—'}</strong><small>Doğru yanıtların ortalaması</small></div></div><div class="sectionhead"><h2>Zihnine bir yön seç.</h2><a href="#train">Tüm antrenmanlar ↗</a></div><div class="cards">${cats.map(category).join('')}</div></div><div class="rightstack"><section class="panel daily"><span class="tag">GÜNLÜK HEDEF</span><h3>Küçük bir alışkanlık.<br>Büyük bir fark.</h3><p>Bugün 15 soru çözerek ritmini koru.</p><div><div style="display:flex;justify-content:space-between"><small>Bugünkü sorular</small><small>${today} / 15</small></div><div class="progressline"><span style="width:${Math.min(100, (today / 15) * 100)}%"></span></div></div><button class="btn light" data-start="speed">90 saniyelik hız turu ⚡</button></section><section class="panel recommend"><div class="sectionhead"><h3>Sıradaki adımın</h3><span>↗</span></div><p>${w ? `${w.name} alanına biraz zaman ayır. Yeni sorularla yöntemi pekiştir.` : 'Önce bir karma tur çöz. Sonuçlarına göre çalışma alanı önereceğiz.'}</p><button class="btn ghost" data-start="${w ? w.id : 'mixed'}">${w ? 'Odaklı çalış' : 'Karma antrenman yapayım'} →</button>${session ? '<p><a href="#quiz">Yarım kalan oturumuna dön →</a></p>' : ''}</section><section class="panel sourcepromo"><span class="caticon">▤</span><h3>Hedefin belli mi?</h3><p>Markasız denemelerle veri analizi, muhakeme ve zaman yönetimi çalış.</p><a href="#exam">Sınav provası seç →</a></section></div></div>`;
}
function train(id) {
  let c = cats.find(c => c.id === id);
  if (!c) {
    app.innerHTML =
      title(
        'ANTRENMAN ALANI',
        'Hangi becerini çalıştırıyoruz?',
        'Önce yöntemi öğren, ardından süreye karşı dene.'
      ) +
      `<div class="toolbar"><a class="btn" href="#position">Pozisyonuma göre çalış →</a><button class="btn" data-start="mixed">Karma parkur · 12 soru →</button><button class="btn light" data-start="speed">Hız turu · 90 saniye ⚡</button></div><div class="cards">${cats.map(category).join('')}</div><div class="note" style="margin-top:22px">39 üretim türü; birleşik diziler, şekil matrisleri, uzun kayıt tabloları ve çok koşullu senaryolar üretilir. Aynı örneklerin tekrarını azaltmak için son 2.000 soru takip edilir. Sayısal mantıktaki ilk beş ailede toplam 60 kural biçimi bulunur; hata bulma ailesi bu kuralların farklı sunumudur; serbest çalışmada aynı ailede arka arkaya aynı kural gelmez. Ana keşif turunda aynı çözüm ailesi yalnızca bir kez gelir. İsteğe bağlı odaklı öğretimde kısa tekrar blokları vardır. Diğer alanlarda çeşitlilik değişir.</div>`;
    return;
  }
  app.innerHTML =
    title('ODAKLI ÇALIŞMA', c.name, c.desc) +
    (id === 'num'
      ? `<div class="coachShortcut"><div><h3>Örüntü bulma hızını çalıştır</h3><p>Önerilen çalışma: her soruda farklı ilişkiyi keşfet; zorlandığın yapıya sonraki turda dön.</p></div><a class="btn" href="#coach">Örüntü koçunu aç →</a></div>`
      : '') +
    `<div class="trainrow"><section class="panel"><h3>Serbest çalışmanı ayarla</h3><label class="field">Çalışma biçimi<select id="mode"><option value="learn">Öğrenme · açıklama ve ipucu</option><option value="speed">Hız · 90 saniyelik tur</option></select></label><label class="field">Soru güçlüğü<select id="level"><option value="1">1 · Orta · Birleşik kural ve iki aşama</option><option value="2" selected>2 · Zor · Birden fazla kısıt ve çeldirici</option><option value="3">3 · İleri · İstisna, ek kural ve yoğun veri</option></select></label><p class="subtle">Düzey; kısıt sayısını, işlem katmanlarını ve veri yoğunluğunu değiştirir. Bazı sözel türlerde güçlük, metindeki kapsam ve çeldiricilerden gelir. Düzeyler hazırlık amaçlıdır; psikometrik olarak kalibre edilmemiştir.</p><button class="btn" data-traincat="${id}">Tüm alt türlerle başla →</button></section><section class="panel"><h3>Bir soru türüne odaklan</h3><div class="types">${typeNames[id].map((t, i) => `<button class="typebutton" data-type="${i}" data-cat="${id}"><div><b>${t}</b><br><small>${id === 'num' ? '12 farklı kurgu · 3 aşamalı ipucu' : 'Özgün örnekler · açıklamalı çözüm'}</small></div><span>→</span></button>`).join('')}</div></section></div>`;
  if (window.Positions) {
    const rec = Positions.recommendation(Positions.load(localStorage), data.answers),
      d = rec?.domains.find(d => d.id === id);
    if (d && $('#level')) $('#level').value = d.level;
  }
}
function exam(id) {
  app.innerHTML =
    title(
      'SINAV PROVASI',
      'Hazırlığını gerçeğe yaklaştır.',
      'Aşamalı denemeyle başla. Sonuçlarını beceri, doğruluk ve süre açısından incele.'
    ) +
    `<div class="toolbar"><a class="btn light" href="#report/demo">Örnek hazırlık raporu ↗</a><a class="btn ghost" href="#assessment">Ölçüm kapsamı ve geliştirmeler ↗</a><a class="btn ghost" href="#orientation">Yönerge ve alıştırmalar ↗</a><a class="btn ghost" href="#pilot">Pilot veri ve madde analizi ↗</a>${data.reports.length ? '<a class="btn ghost" href="#report/latest">Son raporumu aç →</a>' : ''}</div><div class="trainrow"><section class="panel"><h3>Sınavını seç</h3><label class="field">Hazırlık profili<select id="profile">${profiles.map(p => `<option value="${p.id}">${p.name}</option>`).join('')}</select></label><div id="profileInfo"></div><div class="formgrid"><label class="field">Soru sayısı<input id="qcount" type="number" min="6" max="60" value="24"></label><label class="field">Süre (dakika)<input id="minutes" type="number" min="1" max="90" value="20"></label></div><label class="field" id="customcat">Alan<select id="examcat"><option value="all">Tüm alanlar · dengeli dağılım</option>${cats.map(c => `<option value="${c.id}">${c.name}</option>`).join('')}</select></label><label class="field" id="levelField">Soru güçlüğü<select id="examlevel"><option value="1">Orta</option><option value="2" selected>Zor</option><option value="3">İleri</option></select></label><button class="btn" id="beginExam">Sınavı başlat →</button></section><section class="panel"><span class="tag">BAŞLAMADAN ÖNCE</span><h3 style="margin-top:20px">Kendi stratejini bul.</h3><p class="subtle">Sınavda cevaplarını sonuna kadar değiştirebilir, soruları işaretleyip geri dönebilirsin. Açıklamalar sınav bittiğinde açılır.</p><p class="subtle">Süre dolduğunda sonuç otomatik kaydedilir. Yanlış cevaplar puan düşürmez. Boşlar toplam başarı oranına dahil edilir.</p><div class="note">Bunlar yetişkinler için bağımsız hazırlık formatlarıdır. Soru güçlüğü deneysel olarak kalibre edilmemiştir; bir işe alım testine eşdeğerlik iddiası yoktur.</div><p><a href="#sources" style="color:var(--green)">Profil kaynaklarını incele ↗</a></p></section></div>`;
  $('#profile').onchange = profileInfo;
  $('#profile').value = profiles.some(p => p.id === id) ? id : 'graded';
  profileInfo();
}
function profileInfo() {
  let p = profiles.find(x => x.id === $('#profile').value);
  $('#qcount').value = p.count;
  $('#minutes').value = p.minutes;
  $('#qcount').disabled = $('#minutes').disabled = p.id !== 'custom';
  $('#customcat').style.display = p.id === 'custom' ? 'flex' : 'none';
  $('#levelField').style.display = p.id === 'custom' ? 'flex' : 'none';
  $('#examlevel').value = p.level;
  $('#profileInfo').innerHTML =
    `<p>${p.desc}</p><div class="splitbar">${p.pattern.map(c => `<span style="width:${100 / p.pattern.length}%;background:${cats.find(x => x.id === c).color}"></span>`).join('')}</div><p class="subtle">${p.pattern.map(catname).join(' · ')}</p><p class="note">${p.note}</p>`;
}
function makeQ(cat, type, level, seen, variant = null, task = null) {
  let q,
    tries = 0;
  do {
    q =
      cat === 'num' && task
        ? Numeric.create(type, level, variant, task)
        : question(cat, type ?? R(0, typeNames[cat].length - 1), level, variant);
  } while (seen.has(q.id) && ++tries < 160);
  seen.add(q.id);
  return q;
}
function start(mode = 'learn', cat = 'all', type = null, level = 2, profile = null) {
  if (session && !profile?.buildOnly && !confirm('Yarım kalan tur yerine yeni bir tur başlatılsın mı?'))
    return;
  let count = mode === 'speed' ? 60 : mode === 'exam' ? profile.count : 12,
    pattern =
      profile?.pattern ||
      (cat === 'all' ? (mode === 'speed' ? ['num', 'shape', 'attention'] : cats.map(c => c.id)) : [cat]),
    seen = new Set(data.seen),
    questions = [],
    bags = {},
    last = {};
  const draw = (key, values) => {
    if (!bags[key]?.length) {
      bags[key] = shuffle(values);
      if (bags[key].at(-1) === last[key] && bags[key].length > 1)
        [bags[key][0], bags[key][bags[key].length - 1]] = [bags[key].at(-1), bags[key][0]];
    }
    let value = bags[key].pop();
    last[key] = value;
    return value;
  };
  for (let i = 0; i < count; i++) {
    let ca = pattern[i % pattern.length],
      qlevel = profile?.graded
        ? Math.min(3, 1 + Math.floor((i * 3) / count))
        : profile?.domainLevels?.[ca] || level,
      chosenType =
        profile?.fixed ??
        type ??
        (profile?.graded && ca === 'shape'
          ? (() => {
              let group = draw('shape-broad', [[0, 3, 4], [1, 5], [2], [6], [7], [8]]);
              return group[R(0, group.length - 1)];
            })()
          : draw(
              ca,
              typeNames[ca].map((_, i) => i)
            )),
      variant =
        ca === 'num'
          ? draw(
              'num-' + chosenType,
              Array.from({ length: Numeric.variantCount }, (_, i) => i)
            )
          : null;
    if (ca === 'num' && type === null && profile?.fixed === undefined) {
      let id = draw(
        'discovery-num',
        Discovery.catalog.filter(r => r.domain === 'num').map(r => r.id)
      );
      questions.push(Discovery.create(id, qlevel, seen));
    } else questions.push(makeQ(ca, chosenType, qlevel, seen, variant));
  }
  if (profile?.buildOnly) return [1, 2, 3].flatMap(n => shuffle(questions.filter(q => q.level === n)));
  session = {
    engineVersion: 2,
    mode,
    name: profile?.name || (mode === 'speed' ? 'Hız turu' : cat === 'all' ? 'Karma parkur' : catname(cat)),
    questions:
      profile?.questions ||
      (mode === 'exam'
        ? profile?.graded
          ? [1, 2, 3].flatMap(n => shuffle(questions.filter(q => q.level === n)))
          : shuffle(questions)
        : questions),
    graded: !!profile?.graded,
    profileId: profile?.id,
    budgetSeconds: mode === 'exam' ? profile.minutes * 60 : null,
    visited: { 0: 1 },
    changes: {},
    firstResponses: {},
    interruptions: { count: 0, ms: 0 },
    index: 0,
    responses: {},
    seconds: {},
    flags: [],
    hints: [],
    hintSteps: {},
    revealed: [],
    started: Date.now(),
    deadline: mode === 'learn' ? null : Date.now() + (mode === 'speed' ? 90 : profile.minutes * 60) * 1000,
    entered: Date.now(),
    level,
    cat,
    type,
  };
  save();
  location.hash = 'quiz';
  render();
}
function accountTime() {
  if (!session) return;
  let i = session.index;
  if (activeRoute === 'quiz' && !session.paused && !session.revealed.includes(i) && !session.coach?.lesson)
    session.seconds[i] = (session.seconds[i] || 0) + (Date.now() - session.entered) / 1000;
  session.entered = Date.now();
}
function hintPanel(s, i, q) {
  let steps = s.hintSteps?.[i] || 0;
  return steps
    ? `<div class="hintstack">${(q.hints || [q.hint])
        .slice(0, steps)
        .map((h, j) => `<div class="feedback"><b>İpucu ${j + 1}</b><br>${h}</div>`)
        .join('')}</div>`
    : '';
}
function hintButton(s, i, q) {
  let steps = s.hintSteps?.[i] || 0,
    total = (q.hints || [q.hint]).length;
  return steps < total
    ? `<button class="btn ghost" id="hint">${steps === 0 ? 'İlk ipucunu aç' : 'Sonraki ipucunu aç'} · ${steps + 1}/${total}</button>`
    : '<small>Tüm ipuçları açık. Cevabını seçerek çözümü kontrol edebilirsin.</small>';
}
function quiz() {
  if (!session) {
    location.hash = 'home';
    return;
  }
  if (session.coach?.lesson) {
    coachLesson();
    return;
  }
  let s = session,
    i = s.index,
    q = s.questions[i],
    answer = s.responses[i],
    revealed = s.revealed.includes(i),
    c = cats.find(c => c.id === q.cat);
  app.innerHTML = `<div class="quizwrap"><div class="quiztop"><a href="#home">← Genel bakış</a><span>${s.name}${s.mode === 'exam' ? '' : ' · ' + ['', 'Orta', 'Zor', 'İleri'][s.level]}</span><span class="clock" id="clock">${s.deadline ? fmt((s.deadline - Date.now()) / 1000) : 'Süresiz'}</span></div>${s.graded ? `<div class="coachPhaseNote"><b>${q.level}. aşama · ${['', 'Temel ilişkiler', 'Birleşik kurallar', 'Yoğun kısıtlar'][q.level]}</b><span>Sınavın tamamında geri dönebilir, işaretleyebilir ve cevap değiştirebilirsin.</span></div>` : s.discovery ? discoveryBanner(s, q) : s.coach ? coachBanner(s, q) : ''}<div class="progressline"><span style="width:${((i + 1) / s.questions.length) * 100}%"></span></div><section class="questionbox"><div style="display:flex;justify-content:space-between;gap:10px"><span class="tag" style="color:${c.color}">${c.name}</span><span class="subtle">${s.coach ? 'Oturumda ' + (i + 1) + '. soru' : i + 1 + ' / ' + s.questions.length} ${s.mode === 'speed' ? '· en çok 60' : ''}</span></div><h2>${q.q}</h2>${q.visual}${s.coach ? signalPanel(s, i, q, revealed) : ''}<div class="answers" ${s.coach && Coach.signalRequired(q) && !s.signals?.[i] ? 'hidden' : ''}>${q.options.map((a, j) => `<button class="answer ${answer === a ? 'selected' : ''} ${revealed ? (a === q.answer ? 'correct' : a === answer ? 'wrong' : '') : ''}" data-answer="${j}" ${revealed ? 'disabled' : ''}><span class="letter">${String.fromCharCode(65 + j)}</span><span>${a}</span></button>`).join('')}</div><div id="feedback" aria-live="polite">${revealed ? feedback(q, answer) : hintPanel(s, i, q)}</div>${s.mode === 'learn' && !revealed ? hintButton(s, i, q) : ''}<div class="quizactions" style="margin-top:22px">${s.mode === 'exam' ? `<button class="btn ghost" id="prev" ${i === 0 ? 'disabled' : ''}>← Önceki</button><button class="btn ghost" id="flag">${s.flags.includes(i) ? '★ İşaretlendi' : '☆ Sonra bak'}</button><button class="btn" id="next">${i === s.questions.length - 1 ? 'Sonuca git' : 'Sonraki →'}</button>` : s.mode === 'learn' ? `<button class="btn ghost stop" id="finish">Turu bitir</button><button class="btn" id="check" ${answer === undefined ? 'disabled' : ''} ${revealed ? 'style="display:none"' : ''}>Cevabı kontrol et</button>${revealed ? `<button class="btn" id="next">${s.coach ? 'Devam et →' : i === s.questions.length - 1 ? 'Sonuçları gör' : 'Sonraki soru →'}</button>` : ''}` : `<button class="btn ghost stop" id="finish">Turu bitir</button><small>Cevap seçince sıradaki soru açılır.</small>`}</div></section>${s.mode === 'exam' ? `<div class="navigator">${s.questions.map((q, j) => `<button data-jump="${j}" aria-label="${j + 1}. soru" class="${s.responses[j] !== undefined ? 'done' : ''} ${i === j ? 'current' : ''} ${s.flags.includes(j) ? 'flagged' : ''}">${j + 1}</button>`).join('')}</div><div style="margin-top:20px;text-align:right"><button class="btn ghost stop" id="finish">Sınavı bitir</button></div>` : ''}</div>`;
  startTimer();
}
function feedback(q, a) {
  return `<div class="feedback ${a === q.answer ? '' : 'bad'}"><b>${a === q.answer ? '✓ Doğru!' : 'Bir adım daha.'}</b> ${q.strategyId ? '<p><b>Fark edilecek ilişki:</b> ' + Discovery.byId(q.strategyId).name + '. ' + q.hint + '</p>' : ''}${q.exp}${a !== q.answer && q.distractorReasons?.[a] ? `<p><b>Seçtiğin şık için olası hata:</b> ${q.distractorReasons[a]}</p>` : ''}</div>`;
}
function move(i) {
  accountTime();
  session.visited = session.visited || {};
  if (i !== session.index) session.visited[i] = (session.visited[i] || 0) + 1;
  session.index = i;
  save();
  quiz();
  window.scrollTo(0, 0);
}
function startTimer() {
  clearInterval(timer);
  if (!session?.deadline) return;
  timer = setInterval(() => {
    if (!session) return;
    let remain = (session.deadline - Date.now()) / 1000;
    if ($('#clock')) {
      $('#clock').textContent = fmt(remain);
      $('#clock').style.color = remain < 20 ? '#bc654e' : '';
    }
    if (remain <= 0) finish(true);
  }, 300);
}
function finish(auto = false) {
  if (!session) return;
  if (!auto && session.mode === 'exam' && !confirm('Sınavı bitirip sonuçları görmek istiyor musun?')) return;
  accountTime();
  clearInterval(timer);
  let s = session,
    rows = s.questions.map((q, i) => ({
      q,
      answer: s.responses[i],
      sec: s.seconds[i] || 0,
      hinted: s.hints.includes(i),
      correct: s.responses[i] === q.answer,
    }));
  if (s.hiddenAt) {
    s.interruptions = s.interruptions || { count: 0, ms: 0 };
    s.interruptions.ms += Date.now() - s.hiddenAt;
    s.hiddenAt = null;
  }
  let answered = rows.filter(r => r.answer !== undefined),
    right = answered.filter(r => r.correct);
  let assessment =
    s.mode === 'exam'
      ? Assessment.analyze(rows, {
          name: s.name,
          graded: s.graded,
          elapsed: Math.round((Date.now() - s.started) / 1000),
          budget: s.budgetSeconds,
          visited: s.visited,
          changes: s.changes,
          firstResponses: s.firstResponses,
          interruptions: s.interruptions,
          bankRevision: 4,
          flags: s.flags,
          reason: s.deadline && Date.now() >= s.deadline ? 'timeout' : 'manual',
        })
      : null;
  if (s.pilot) {
    let form = data.pilotState.forms[s.pilot.label];
    try {
      Pilot.add(data.pilotState, [Pilot.run(form, s.pilot.participant, rows)]);
    } catch (e) {
      toast('Pilot verisi kaydedilemedi: ' + e.message);
    }
  }
  if (assessment) {
    data.reports.push(assessment);
    data.reports = data.reports.slice(-20);
  }
  if (s.coach) {
    s.questions.forEach((q, i) => captureCoach(s, i));
    s.coachSummary = Coach.finish(data.coachState, s.coach, coachTrials(s));
  }
  data.xp += right.length * 10;
  for (let r of answered) {
    data.answers.push({
      cat: r.q.cat,
      type: r.q.type,
      correct: r.correct,
      sec: Math.round(r.sec * 10) / 10,
      hinted: r.hinted,
      ruleId: r.q.ruleId,
      strategyId: r.q.strategyId,
      practiceStage: r.q.practiceStage,
      positionId: s.positionContext?.positionId,
      mode: s.mode,
      level: r.q.level,
      engineVersion: r.q.engineVersion,
      at: Date.now(),
    });
  }
  data.answers = data.answers.slice(-15000);
  data.seen = [
    ...new Set([
      ...data.seen,
      ...(s.coach?.exampleIds || []),
      ...rows.filter((r, i) => i <= s.index || r.answer !== undefined).map(r => r.q.id),
    ]),
  ].slice(-2000);
  let discoverySummary = s.discovery ? finishDiscovery(s, rows) : null;
  let result = {
    assessment,
    discoverySummary,
    name: s.name,
    mode: s.mode,
    rows,
    at: Date.now(),
    elapsed: Math.round((Date.now() - s.started) / 1000),
    right: right.length,
    coachSummary: s.coachSummary,
    total: s.mode === 'speed' ? answered.length : s.mode === 'learn' ? answered.length : s.questions.length,
    answered: answered.length,
  };
  data.sessions.push({
    engineVersion: 2,
    level: s.level,
    positionId: s.positionContext?.positionId,
    name: result.name,
    mode: result.mode,
    at: result.at,
    right: result.right,
    total: result.total,
    elapsed: result.elapsed,
  });
  data.sessions = data.sessions.slice(-100);
  lastResult = result;
  session = null;
  save();
  location.hash = 'result';
  render();
}
function result() {
  if (!lastResult) {
    app.innerHTML =
      title(
        'SONUÇ',
        'Yeni bir tur seni bekliyor.',
        'Ayrıntılı tur incelemesi açık oturum boyunca kullanılabilir.'
      ) + '<a class="btn" href="#train">Antrenmana git →</a>';
    return;
  }
  let r = lastResult,
    answered = r.rows.filter(x => x.answer !== undefined),
    right = answered.filter(x => x.correct),
    rate = r.total ? Math.round((r.right / r.total) * 100) : 0;
  app.innerHTML =
    title('TUR TAMAMLANDI', 'Her tur bir sonraki adıma hazırlar.', r.name) +
    `<div class="scorehero"><span class="eyebrow">${r.mode === 'exam' ? 'TOPLAM BAŞARI' : 'YANIT DOĞRULUĞU'}</span><strong>%${rate}</strong><p>${r.right} doğru · ${r.answered - r.right} yanlış${r.mode === 'exam' ? ` · ${r.total - r.answered} boş` : ''}</p><div class="badges" style="justify-content:center"><span class="badge">+${r.right * 10} XP</span>${rate >= 80 && r.answered >= 6 ? '<span class="badge">◎ İsabetli tur</span>' : ''}${r.answered >= 12 ? '<span class="badge">◈ Parkur tamamlandı</span>' : ''}</div></div><div class="resultstats"><div class="panel"><small>Toplam süre</small><h2>${fmt(r.elapsed)}</h2></div><div class="panel"><small>Doğru yanıt ort.</small><h2>${right.length ? Math.round(mean(right.map(x => x.sec))) + ' sn' : '—'}</h2></div><div class="panel"><small>İpucuyla çözülen</small><h2>${answered.filter(x => x.hinted).length}</h2></div></div>${r.assessment ? `<section class="panel" style="margin-top:22px"><span class="tag">BECERİ GERİ BİLDİRİMİ</span><h3>Deneme raporun hazır.</h3><p>Altı alanın sonuçları, aşama dağılımı, süre kullanımı, gelişim önerileri ve mülakatta doğrulanabilecek noktalar.</p><a class="btn" href="#report/${r.assessment.id}">Ayrıntılı raporu aç →</a></section>` : ''}${r.discoverySummary ? discoveryResultCard(r.discoverySummary) : ''}${r.coachSummary ? coachResultCard(r.coachSummary) : ''}<div class="toolbar"><a class="btn" href="#train">Yeni antrenman →</a><a class="btn light" href="#progress">Gelişimimi gör</a></div><section class="panel"><h2>Çözümleri incele</h2><p class="subtle">Yanlışların arkasındaki kuralı keşfet. Açmak için soruya dokun.</p>${
      r.rows
        .filter((x, i) => r.mode === 'exam' || x.answer !== undefined)
        .map(
          (x, i) =>
            `<details class="reviewitem"><summary>${x.answer === undefined ? '○' : x.correct ? '✓' : '×'} ${i + 1}. ${catname(x.q.cat)} · ${x.q.q}</summary>${x.q.visual}<p>Senin yanıtın: <b>${x.answer ?? 'Boş'}</b><br>Doğru yanıt: <b>${x.q.answer}</b></p><div class="feedback">${x.q.exp}</div></details>`
        )
        .join('') || '<div class="empty">Bu turda yanıt kaydedilmedi.</div>'
    }</section>`;
}
function progress() {
  let w = weak(),
    correct = data.answers.filter(x => x.correct),
    recent = data.sessions.slice(-7);
  app.innerHTML =
    title(
      'GELİŞİM GÜNLÜĞÜ',
      'Dünden bir adım ileri.',
      'Kendi verilerinle doğruluk ve hız dengesini takip et.'
    ) +
    `<div class="stats"><div class="stat"><small>TOPLAM XP</small><strong>${data.xp}</strong><small>Seviye ${Math.floor(data.xp / 250) + 1} · sonraki seviye ${250 - (data.xp % 250)} XP</small></div><div class="stat"><small>TAMAMLANAN TUR</small><strong>${data.sessions.length}</strong><small>${data.answers.length} soru yanıtlandı</small></div><div class="stat"><small>DOĞRU YANIT HIZI</small><strong>${correct.length ? Math.round(mean(correct.map(x => x.sec))) + ' sn' : '—'}</strong><small>Sadece doğru cevapların süresi</small></div></div><div class="trainrow"><section class="panel"><h3>Alanlara göre doğruluk</h3>${cats
      .map(c => {
        let a = data.answers.filter(x => x.cat === c.id);
        return `<div class="chartrow"><span>${c.name}</span><div class="progressline"><span style="width:${pct(a)}%;background:${c.color}"></span></div><b>${a.length ? '%' + pct(a) : '—'}</b></div><small>${a.length} soru · ${a.length ? Math.round(mean(a.map(x => x.sec))) + ' sn ortalama' : 'henüz veri yok'}</small>`;
      })
      .join(
        ''
      )}</section><section class="panel"><h3>Sana önerilen çalışma</h3><p>${w ? `${w.name} alanındaki doğruluğun diğer çalıştığın alanlardan düşük. Aynı kuralları yeni örneklerle tekrar et.` : 'Her alandan en az üç soru yanıtladığında güçlü yönlerini ve çalışma ihtiyacını daha iyi görebiliriz.'}</p><button class="btn" data-start="${w ? w.id : 'mixed'}">Önerilen tura başla →</button><div class="note" style="margin-top:22px">Bu sonuçlar çalışma geçmişini gösterir. İşe alım puanı, IQ ölçümü veya adaylar arası yüzdelik dilim değildir. Öğrenme, hız ve sınav oturumları aynı geçmişte tutulur.</div><div class="toolbar"><button class="btn ghost" id="export">Verilerimi indir ↓</button></div><h3>Son turlardaki doğruluk</h3>${recent.map(s => `<div class="chartrow"><small>${new Date(s.at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })}</small><div class="progressline"><span style="width:${s.total ? (s.right / s.total) * 100 : 0}%"></span></div><b>%${s.total ? Math.round((s.right / s.total) * 100) : 0}</b></div>`).join('') || '<p class="subtle">İlk turunla grafiğin oluşacak.</p>'}</section></div><h2 style="margin-top:28px">Son oturumların</h2><div class="history">${
      data.sessions
        .slice(-10)
        .reverse()
        .map(
          s =>
            `<div><span>${s.name}<br><small>${new Date(s.at).toLocaleString('tr-TR')}</small></span><span>${s.right} / ${s.total} doğru · ${fmt(s.elapsed)}</span></div>`
        )
        .join('') || '<div class="empty">İlk antrenmanını tamamlayarak başla.</div>'
    }</div>`;
}
function sourcePage() {
  app.innerHTML =
    title(
      'SINAV REHBERİ',
      'Muhakeme ve zaman yönetimi.',
      'Firma adı kullanmadan, yetişkin işe alım sınavlarının beceri alanlarına hazırlan.'
    ) +
    `<section class="panel"><span class="tag">ARAŞTIRMA KAPSAMI · 30 EKİM 2026</span><h3 style="margin-top:18px">Büyük sanayi kuruluşlarının aday deneyimleri incelendi.</h3><p>“İlk 500” kapsamı için Türkiye’deki İSO 500 listesini kullandık. Listede yer alan altı kuruluşun kamuya açık aday paylaşımlarını inceledik. Bu bir örneklemdir; 500 kuruluşun tamamı incelenmiş değildir.</p><p class="subtle">Paylaşımlar sayısal, sözel ve görsel ilişkileri; genel yetenek aşamalarını ve zaman yönetimini destekliyor. Deneyimler pozisyona ve tarihe göre farklılaşıyor. Aday anlatımı resmî format veya doğrulanmış soru dağılımı değildir. Bir anlatımdaki 50 soru / 25 dakika, yalnızca bir hazırlık formatına referans olarak kullanıldı.</p><div class="note">Zorluk tasarımını biz yükselttik: çok adımlı hesap, birleşik şekil dönüşümü, koşul–istisna ayrımı ve birden fazla kısıt. Kuruluşların tamamının ortak bir “seviyesi” olduğu veya burada aynı testin sunulduğu iddia edilmez.</div></section><div class="trainrow">${profiles
      .filter(p => p.id !== 'custom')
      .map(
        p =>
          `<section class="panel sourcecard"><span class="tag">${p.graded ? 'AŞAMALI' : p.level === 3 ? 'İLERİ' : 'ZOR'} · ÖZGÜN DENEME</span><h3 style="margin-top:15px">${p.name}</h3><p>${p.desc}</p><p>${p.note}</p><button class="btn light" data-profile="${p.id}">Bu formatla çalış →</button></section>`
      )
      .join(
        ''
      )}</div><section class="panel"><h3>Soru üretimi ve doğrulama</h3><p class="subtle">6 alanda 39 üretim türü ve bunlar içinde farklı içerik şablonları bulunur. Soruların sayıları, koşulları, tabloları ve desenleri yeniden üretilir. Sıralama soruları tüm olası sıralamalar taranarak doğrulanır. Şekil dönüşümleri hücre düzeyinde hesaplanır. Sayısal mantıkta beş arama ailesi altında 60 kural biçimi ve bunların hata bulma sunumları arasında geçiş yapılır; beş seçenek de tam sayıdır. Örüntü koçunda aynı kuralı pekiştirme, benzerini ayırt etme, karışık tekrar ve farklı sunuma aktarım aşamaları bulunur. Son 2.000 soru kimliğiyle tekrar azaltılır. Sözel bölüm 20 çıkarım metni, 16 argüman ve 12 süreç paragrafı içerir; niceleyici çıkarımları tüm olası modellerde denetlenir.</p><p class="subtle">İlerleme cihazda tutulur. Önceki tamamlanmış sonuçların korunur. Yeni oturumlarda güncel soru düzeni kullanılır.</p><details><summary>Kaynak notları ve bağlantılar</summary><p class="subtle">Bağlantıların açıldığı dış sayfalarda kurum adları görülebilir. Uygulama içinde kurum bazında profil oluşturulmaz.</p><p><a href="https://www.iso500.org.tr/" target="_blank" rel="noopener">Liste kapsamı ↗</a></p>${researchLinks.map((l, i) => `<p><a href="${l}" target="_blank" rel="noopener">Aday deneyimi ${i + 1} ↗</a></p>`).join('')}<p class="subtle">Soru metinleri bu paylaşımlardan kopyalanmamıştır. Bunlar özgün hazırlık sorularıdır.</p></details></section>`;
}
const researchLinks = [
  'https://istemulakat.com/mulakat/detay/mercedes-benz-turk-as/uzun-donem-stajyer/51692',
  'https://istemulakat.com/mulakat/detay/arcelik/uretim-muhendisi/7511',
  'https://istemulakat.com/isveren/aselsan-elektronik-san-ve-tic-as-mulakat-ve-sorulari-39203?page=4',
  'https://istemulakat.com/isveren/toyota-otomotiv-sanayi-turkiye-as-mulakat-ve-sorulari-18532',
  'https://istemulakat.com/mulakat/detay/ford-otosan/yalin-uretim-muhendisi/55132',
  'https://istemulakat.com/isveren/tupras-mulakat-ve-sorulari-3039?page=2',
];
function coachHistory(cs) {
  let rows = (cs.runs || []).slice(-5).reverse();
  if (!rows.length) return '';
  const metric = s =>
    s
      ? `${s.seconds === null ? '—' : Math.round(s.seconds) + ' sn'} · ${s.independent}/${s.total}${s.signals ? '<br><small>Yapı hipotezi: ' + s.signalRight + '/' + s.signals + ' · ' + (s.signalSeconds === null ? '—' : Math.round(s.signalSeconds) + ' sn') + '</small>' : ''}`
      : '—';
  return `<section class="panel" style="margin-top:22px"><h3>Son çalışmaların · süre ve doğruluk</h3><div class="tablewrap"><table><tr><th>Çalışma</th><th>Pekiştirme</th><th>Ayırt etme</th><th>Karışık / tekrar</th><th>Aktarım</th></tr>${rows.map(r => `<tr><td>${Coach.byId(r.target).name}<br><small>${new Date(r.at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', timeZone: 'Europe/Istanbul' })} · ${['', 'Orta', 'Zor', 'İleri'][r.level]}</small></td><td>${metric(r.stages.focus)}</td><td>${metric(r.stages.contrast)}</td><td>${metric(r.stages.mixed || r.stages.review)}</td><td>${metric(r.stages.transfer)}</td></tr>`).join('')}</table></div><p class="subtle">Süre: ipucusuz doğru çözümlerin medyanı. Yanındaki oran: ipucusuz doğru / soru sayısı. Çalışma setleri farklı olabilir; kişisel hız hedefi aynı kural, düzey ve görev biçimine göre hesaplanır.</p></section>`;
}
function focusedCoachPage() {
  let cs = data.coachState,
    level = cs.level || 2,
    plan = Coach.choose(cs, level),
    target = Coach.byId(plan.target),
    due = Coach.catalog.filter(r => Coach.stat(cs, r.id, level).nextDue <= Date.now()),
    ready = Coach.catalog.filter(r => Coach.stat(cs, r.id, level).transferReady);
  app.innerHTML =
    title(
      'ÖRÜNTÜ KOÇU',
      'Kural ezberinden çözüm refleksine.',
      '60 kural biçimi. Önce yapıyı seç, ardından hesapla; yeni sunumlarda yöntemi yeniden kur.'
    ) +
    `<div class="coachHero"><div><span class="tag">BUGÜNÜN ÖNERİSİ</span><h2>${plan.kind === 'review' ? 'Aralıklı tekrar' : 'Yeni öğrenme ve pekiştirme'}</h2><h3>${target.name}</h3><p>${plan.reason}</p><p class="subtle">Pekiştirme ve ayırt etme 4’er soru; karışık ve aktarım aşaması ${Coach.planCount(plan.pool)}’er soru. Karışık havuzun şu an ${plan.pool.length} kural; öğrendikçe 8’e kadar genişler. Gerektiğinde kısa ek pekiştirme gelir; aynı aşamada zorlanma sürerse sonraki güne bırakılıp yeni kurala geçilir. Süre dolduğu için soru kaybetmezsin.</p><button class="btn" id="coachStart">Önerilen çalışmayı başlat →</button>${session?.coach ? '<p><a href="#quiz">Yarım kalan koç oturumuna dön →</a></p>' : ''}</div><div class="coachSettings"><label class="field">Çalışma düzeyi<select id="coachLevel">${[1, 2, 3].map(n => `<option value="${n}" ${n === level ? 'selected' : ''}>${['', 'Orta', 'Zor', 'İleri'][n]}</option>`).join('')}</select></label><div class="coachNumbers"><div><b>${ready.length}<small> / ${Coach.catalog.length}</small></b><small>Aktarımda pekişen kural</small></div><div><b>${due.length}</b><small>Tekrarı gelen kural</small></div></div></div></div><div class="coachStages"><section class="panel"><span class="stepNo">01</span><h3>Aynı kuralla pekiştir</h3><p>Çözümlü örneği incele. Kuralı nasıl arayacağını öğren; tüm terimlerde doğrula. Amaç yöntemi öğrenmek.</p></section><section class="panel"><span class="stepNo">02</span><h3>Benzerini ayırt et</h3><p>Benzer görünen iki kuralı karşılaştır. Hangisinin soruya uyduğuna karar ver.</p></section><section class="panel"><span class="stepNo">03</span><h3>Karışıkta tanı</h3><p>Şıklardan önce yapı tahmini yap. Sonra kuralı farklı görev biçimlerinde uygula; havuzun ilerledikçe büyüsün.</p></section><section class="panel"><span class="stepNo">04</span><h3>Yeni biçime aktar</h3><p>Aynı kuralı ortadaki eksik terimde ve hatalı terimi bulurken kullan. Tanıdık sunuma bağımlılığı azalt.</p></section></div><div class="trainrow" style="margin-top:20px"><section class="panel"><h3>Önce isabet, sonra kişisel hız</h3><p class="subtle">Pekiştirme aşamasında süre hedefi yok. Karışık aşamada, aynı kural ve düzeyde benzer görevden en az 5 ipucusuz doğru yanıt biriktiğinde kişisel süre hedefi açılır. Bu bir geri sayım veya geçme barajı değildir.</p><p class="subtle">Ölçülen süre, kuralı düşünmeyi ve hesabı yapmayı birlikte içerir. Tek başına örüntü tanıma süresi olarak yorumlanmaz. Aynı kural tekrarındaki hız ile karışık çözüm hızı ayrı gösterilir.</p></section><section class="panel"><h3>Aradan sonra yeniden karşılaş</h3><p class="subtle">Aktarım aşamasında da doğru uygulanan kurallar önce 1 gün sonraya planlanır. Başarılı aralıklı tekrarlarda aralık 3 güne, sonra 7 güne çıkar. Uygulamayı açtığında zamanı gelen tekrarlar öne alınır. Aynı gün tekrar oynamak bu aralığı büyütmez.</p><div class="note">4 soruda en az 3 ipucusuz doğru, soru sayıları ve tekrar aralıkları bu uygulamanın başlangıç ayarlarıdır. Araştırmalar bu uygulama için tam bir doz veya hız artışı garantisi vermiyor.</div></section></div>${coachHistory(cs)}<details class="panel" style="margin-top:22px"><summary>Kuralı kendim seçmek istiyorum</summary><p class="subtle">60 kural biçimi beş arama ailesinde düzenlenir. Kare dizileri ile ikinci fark gibi bazı yapılar matematiksel olarak örtüşebilir. Hata bulma ayrı bir yeni kural sayılmaz. Seçtiğin kuralla öğrenme → ayırt etme → karışık → farklı biçime aktarım çalışılır.</p><div class="ruleCatalog">${Coach.catalog
      .map(r => {
        let s = Coach.stat(cs, r.id, level);
        return `<button class="typebutton" data-coachrule="${r.id}"><div><b>${r.name}</b><br><small>${s.transferReady ? 'Farklı biçimde uygulandı' : s.mixedReady ? 'Karışıkta pekişti' : s.focusReady ? 'Pekişti · karışık tanıma çalışılacak' : s.trials.length ? 'Öğrenme sürüyor' : 'Henüz çalışılmadı'}</small></div><span>→</span></button>`;
      })
      .join(
        ''
      )}</div></details><section class="panel" style="margin-top:22px"><h3>Bu çalışma düzenini neden seçtik?</h3><p class="subtle">Matematik öğrenme çalışmalarında karışık ve aralıklı pratik, sonradan yapılan testlerde doğru yöntemi seçmeyi ve hatırlamayı destekledi. Sadece arka arkaya aynı türü çözmek, kural seçme ihtiyacını azaltır. Bu bulguları buradaki örüntü antrenmanına uyarladık; yetişkin işe alım örüntülerindeki hız artışı uygulamaya özel olarak ölçülmüş değildir.</p><p class="subtle"><a target="_blank" rel="noopener" href="https://digitalcommons.usf.edu/psy_facpub/1767/">Aralıklı ve karışık matematik pratiği · 2007 ↗</a><br><a target="_blank" rel="noopener" href="https://onlinelibrary.wiley.com/doi/10.1002/acp.1598">Problemle doğru yöntemi eşleştirme · 2010 ↗</a></p></section>`;
  $('#coachLevel').onchange = () => {
    data.coachState.level = Number($('#coachLevel').value);
    save();
    focusedCoachPage();
  };
}
function discoveryPage() {
  let state = data.discoveryState,
    level = state.level || 2,
    scope = state.scope || 'num',
    available = Discovery.catalog.filter(r => scope === 'mixed' || r.domain === 'num'),
    covered = available.filter(r => Discovery.stat(state, r.id, level).trials.length),
    due = available.filter(r => {
      let t = Discovery.stat(state, r.id, level);
      return t.nextDue && t.nextDue <= Date.now();
    });
  app.innerHTML =
    title(
      'ÖRÜNTÜ KEŞFİ',
      'Her soruda yeniden keşfet.',
      'Sayıyı değiştirmek yeni bir örüntü değildir. Burada aynı çözüm yaklaşımı bir turda yalnızca bir kez gelir.'
    ) +
    `<div class="coachHero"><div><span class="tag">ANA ÇALIŞMA · YÖNTEMİ SEN BUL</span><h2>12 soru. Farklı ilişkiler.</h2><p>Kural adı, örnek çözüm veya yöntem etiketi önceden verilmez. Sayı dizisinin ardından bir matris, basamak ilişkisi veya koşula bağlı dönüşüm gelebilir.</p><p class="subtle">Çarpanın 3’ten 4’e çıkması aynı ailede kalır. Denk sunumlar da tek gruptur. Sabit dört soruluk tekrar bloğu yok; bir sonraki soruda yeniden ilişki ararsın.</p><button class="btn" id="discoveryStart">Karışık keşif turuna başla →</button>${session?.discovery ? '<p><a href="#quiz">Yarım kalan keşif turuna dön →</a></p>' : ''}</div><div class="coachSettings"><label class="field">İçerik<select id="discoveryScope"><option value="num" ${scope === 'num' ? 'selected' : ''}>Sayısal örüntüler</option><option value="mixed" ${scope === 'mixed' ? 'selected' : ''}>Sayısal + görsel örüntüler</option></select></label><label class="field">Düzey<select id="discoveryLevel">${[1, 2, 3].map(n => `<option value="${n}" ${n === level ? 'selected' : ''}>${['', 'Orta', 'Zor', 'İleri'][n]}</option>`).join('')}</select></label><p class="subtle">${covered.length} / ${available.length} geniş çözüm ailesiyle karşılaştın.<br>${due.length} ailede tekrar zamanı geldi.</p></div></div><div class="coachStages"><section class="panel"><span class="stepNo">01</span><h3>İlişkiyi keşfet</h3><p>Bir yöntem adı seçmek zorunda değilsin. Soruyu incele, kendi hipotezini kur.</p></section><section class="panel"><span class="stepNo">02</span><h3>Örneklerde denetle</h3><p>Bir geçişe uyması yetmez. Bulduğun ilişkinin diğer verilenleri de açıkladığını kontrol et.</p></section><section class="panel"><span class="stepNo">03</span><h3>Yeni yapıya geç</h3><p>Doğru veya yanlış cevaplasan da sırada farklı bir çözüm ailesi var. Takıldığında aşamalı ipucu açabilirsin.</p></section><section class="panel"><span class="stepNo">04</span><h3>Aradan sonra geri dön</h3><p>Zorlandığın aile sonraki çalışmalara alınır. Gerekli yerlerde farklı yerleşim ve görev biçimiyle karşılaşırsın.</p></section></div><section class="panel" style="margin-top:22px"><h3>Hangi ilişkilerle karşılaşabilirsin?</h3><div class="badges">${available.map(r => `<span class="badge">${r.name}</span>`).join('')}</div><p class="subtle">Bu liste geniş arama ailelerini gösterir; her katsayı veya alt formül ayrı bir kural sayılmaz. Olası bütün sınav örüntülerinin eksiksiz bir listesi değildir. Zorluk ve ilerleme eşikleri standart bir işe alım testi olarak kalibre edilmemiştir.</p></section><section class="panel" style="margin-top:22px"><h3>Nasıl ilerlediğini göreceksin</h3><p class="subtle">Tur sonunda hangi ilişkiyi ipucusuz bulduğun, hangisinde takıldığın ve doğru çözüm süren gösterilir. Süre hedefi ancak aynı aile, düzey ve sunumda yeterli doğru veri olduğunda açılır; tek başına hız, başarı sayılmaz.</p><a class="btn ghost" href="#coach/focus">Belirli bir kuralı adım adım öğren →</a></section>`;
  for (let [id, property] of [
    ['discoveryScope', 'scope'],
    ['discoveryLevel', 'level'],
  ])
    $('#' + id).onchange = () => {
      state[property] = property === 'level' ? Number($('#' + id).value) : $('#' + id).value;
      save();
      discoveryPage();
    };
}
function startDiscovery() {
  if (session && !confirm('Yarım kalan tur yerine yeni keşif turu başlatılsın mı?')) return;
  let state = data.discoveryState,
    level = state.level || 2,
    ids = Discovery.plan(state, level, state.scope || 'num'),
    seen = new Set(data.seen),
    questions = ids.map(id => {
      let old = Discovery.stat(state, id, level).trials.at(-1),
        q = Discovery.create(id, level, seen, old?.format);
      q.goalSeconds = Discovery.goal(state, q);
      return q;
    });
  session = {
    engineVersion: 2,
    mode: 'learn',
    name: 'Örüntü keşfi',
    discovery: { version: 1, ids },
    questions,
    index: 0,
    responses: {},
    seconds: {},
    flags: [],
    hints: [],
    hintSteps: {},
    revealed: [],
    started: Date.now(),
    deadline: null,
    entered: Date.now(),
    level,
    cat: 'num',
    type: null,
  };
  save();
  location.hash = 'quiz';
  render();
}
function discoveryBanner(s, q) {
  return `<div class="coachPhaseNote"><b>Örüntü keşfi · ${s.index + 1}/${s.questions.length}</b><span>${q.goalSeconds ? 'Bu aile ve sunumda ipucusuz doğru medyanın ' + q.goalSeconds + ' sn. Önce doğruluk.' : 'Kural adı verilmez. İlişkiyi kur, verilenlerde doğrula, sonra yanıtla.'}</span></div>`;
}
function finishDiscovery(s, rows) {
  let state = data.discoveryState,
    at = Date.now(),
    items = rows
      .filter(r => r.answer !== undefined)
      .map(r => ({
        strategyId: r.q.strategyId,
        level: r.q.level,
        format: r.q.discoveryFormat,
        correct: r.correct,
        hinted: r.hinted,
        sec: Math.round(r.sec * 10) / 10,
        at,
      }));
  for (let t of items) Discovery.record(state, t);
  state.last = items.map(t => t.strategyId);
  let result = { at, items };
  state.runs = state.runs || [];
  state.runs.push(result);
  state.runs = state.runs.slice(-60);
  return result;
}
function discoveryResultCard(summary) {
  return `<section class="panel" style="margin-top:22px"><span class="tag">KEŞİF TURU · ÇÖZÜM YAKLAŞIMLARI</span><h3 style="margin-top:16px">Neyi fark ettin, nerede takıldın?</h3><div class="tablewrap"><table><tr><th>Çözüm ailesi</th><th>Sonuç</th><th>Çözüm süresi</th></tr>${summary.items.map(t => `<tr><td>${Discovery.byId(t.strategyId).name}</td><td>${t.correct ? (t.hinted ? 'İpucuyla doğru' : 'İpucusuz doğru') : 'Tekrar çalışılacak'}</td><td>${Math.round(t.sec)} sn</td></tr>`).join('')}</table></div><p class="subtle">Yanlış ve ipucuyla bulunan yapılar tekrar listesine alındı. Açılmamış sorular başarı veya süre hesabına katılmaz. Farklı ailelerin süreleri doğrudan birbirine denk değildir.</p><a class="btn" href="#coach">Sonraki keşif turu →</a></section>`;
}
function signalPanel(s, i, q, revealed) {
  if (!Coach.signalRequired(q))
    return `<div class="note">Arama yolu: ${Coach.checklist[Coach.signalType(q)]}</div>`;
  let t = s.signals?.[i];
  if (!t)
    return `<section class="signalPanel"><span class="tag">ÖNCE YAPIYI SEÇ</span><h3>İlk hangi yapıyı sınayacaksın?</h3><p class="subtle">Şıkları açmadan önce bir başlangıç hipotezi seç. Bu, kesin kuralı bulduğun anlamına gelmez. Birden fazla çözüm yolu olabilir; bu seçim puanını veya geçişini değiştirmez.</p><div class="signalOptions">${Coach.familyNames.map((name, j) => `<button class="btn light" data-signal="${j}">${name}</button>`).join('')}</div></section>`;
  return `<div class="note">İlk hipotezin: <b>${Coach.familyNames[t.type]}</b> · ${Math.round(t.sec)} sn${revealed ? `<br>${t.correct ? 'Başlangıç yapısı hedeflenen çözümle uyumlu.' : 'Bu sorunun hedeflenen çözümü: ' + Coach.familyNames[Coach.signalType(q)] + '. Başka geçerli bir yol bulmuş olabilirsin; açıklamadaki kuralı da sınayabilirsin.'}<br>${Coach.checklist[Coach.signalType(q)]}` : ' · Şimdi kuralı tüm bilinen terimlerde doğrula.'}</div>`;
}
function coachTrials(s) {
  return s.questions.flatMap((q, i) =>
    s.responses[i] === undefined
      ? []
      : [
          {
            ruleId: q.ruleId,
            level: q.level,
            correct: s.responses[i] === q.answer,
            hinted: s.hints.includes(i),
            sec: s.seconds[i] || 0,
            policyVersion: 2,
            stage: q.practiceStage,
            task: Coach.taskKind(q),
            signal: s.signals?.[i]?.type,
            signalCorrect: s.signals?.[i]?.correct,
            signalSec: s.signals?.[i]?.sec,
            at: Date.now(),
          },
        ]
  );
}
function captureCoach(s, i) {
  if (!s.coach || s.coach.recorded.includes(i) || s.responses[i] === undefined) return;
  let q = s.questions[i];
  Coach.record(data.coachState, {
    ruleId: q.ruleId,
    level: q.level,
    correct: s.responses[i] === q.answer,
    hinted: s.hints.includes(i),
    sec: Math.round((s.seconds[i] || 0) * 10) / 10,
    policyVersion: 2,
    stage: q.practiceStage,
    task: Coach.taskKind(q),
    signal: s.signals?.[i]?.type,
    signalCorrect: s.signals?.[i]?.correct,
    signalSec: s.signals?.[i]?.sec,
    at: Date.now(),
  });
  s.coach.recorded.push(i);
}
function appendCoach(block) {
  let s = session,
    meta = s.coach,
    seen = new Set([...data.seen, ...s.questions.map(q => q.id), ...meta.exampleIds]);
  let examples = [];
  if (block.lesson) {
    let ids = block.stage === 'contrast' ? [meta.target, meta.partner] : [meta.target];
    examples = ids.map(id => {
      let r = Coach.byId(id),
        q = makeQ('num', r.type, s.level, seen, r.variant);
      meta.exampleIds.push(q.id);
      return q;
    });
  }
  let order = Coach.order(block.ids, block.count, block.stage);
  for (let [j, id] of order.entries()) {
    let r = Coach.byId(id),
      task =
        block.stage === 'transfer' ? (j % 2 ? 'error' : 'middle') : block.stage === 'focus' ? 'end' : null,
      q = makeQ('num', r.type, s.level, seen, r.variant, task);
    q.practiceStage = block.stage;
    q.goalSeconds = Coach.goal(data.coachState, q);
    s.questions.push(q);
  }
  meta.blockNo++;
  meta.stage = block.stage;
  meta.repair = !!block.repair;
  meta.lesson = examples.length ? { stage: block.stage, examples } : null;
}
function startCoach(requested = null) {
  if (session && !confirm('Yarım kalan tur yerine örüntü koçu başlatılsın mı?')) return;
  let level = data.coachState.level || 2,
    plan = Coach.choose(data.coachState, level, requested);
  plan.policyVersion = 2;
  session = {
    engineVersion: 2,
    mode: 'learn',
    name: 'Örüntü koçu',
    questions: [],
    index: 0,
    responses: {},
    seconds: {},
    flags: [],
    hints: [],
    hintSteps: {},
    revealed: [],
    started: Date.now(),
    deadline: null,
    entered: Date.now(),
    level,
    cat: 'num',
    type: null,
    coach: plan,
  };
  appendCoach({
    stage: plan.stage,
    ids: plan.stage === 'focus' ? [plan.target] : [plan.target, plan.partner],
    count: 4,
    lesson: plan.stage !== 'review',
  });
  save();
  location.hash = 'quiz';
  render();
}
function coachLesson() {
  let s = session,
    l = s.coach.lesson;
  app.innerHTML = `<div class="quizwrap"><div class="quiztop"><a href="#coach">← Örüntü koçu</a><span>${Coach.stageName[l.stage]}</span><span class="subtle">Örnek inceleme · puana dahil değil</span></div><section class="panel"><span class="tag">${s.coach.repair ? 'KISA PEKİŞTİRME' : 'YÖNTEMİ KEŞFET'}</span><h2 style="margin-top:16px">${l.stage === 'contrast' ? 'Bu iki kuralı birbirinden ayır.' : 'Önce bir örneği birlikte incele.'}</h2><p class="subtle">Örnek okuma süresi soru çözüm sürene eklenmez.</p>${l.examples.map(q => `<div class="coachExample"><h3>${Coach.byId(q.ruleId).name}</h3>${q.visual}<div class="feedback">${q.exp}</div></div>`).join('')}<button class="btn" id="coachLessonDone">Soruları çözmeye geç →</button></section></div>`;
}
function coachBanner(s, q) {
  let stage = q.practiceStage,
    all = s.questions.filter(x => x.practiceStage === stage),
    soFar = s.questions.slice(0, s.index + 1).filter(x => x.practiceStage === stage).length,
    labels =
      stage === 'review' ? ['review', 'mixed', 'transfer'] : ['focus', 'contrast', 'mixed', 'transfer'];
  return `<div class="coachStagebar">${labels.map(x => `<span class="${x === stage ? 'current' : ''}">${Coach.stageName[x]}</span>`).join('')}</div><div class="coachPhaseNote"><b>${Coach.stageName[stage]} · ${soFar}/${all.length}</b><span>${stage === 'focus' ? 'Aynı kural; önce yöntemi öğren. Son 4 soruda en az 3 ipucusuz doğruyla ilerle.' : stage === 'contrast' ? 'İki benzer kural rastgele karışıyor. Son 4 soruda en az 3 ipucusuz doğruyla ilerle.' : q.goalSeconds ? `Kişisel süre hedefin yaklaşık ${q.goalSeconds} sn. Önce doğru çözüm.` : 'Kural adı verilmez. Önce başlangıç hipotezini seç, sonra hesapla. Önce doğruluk; kişisel hız için veri birikiyor.'}</span></div>`;
}
function coachNext() {
  let s = session;
  if (s.index < s.questions.length - 1) {
    move(s.index + 1);
    return;
  }
  accountTime();
  let block = Coach.next(s.coach, coachTrials(s));
  if (!block) {
    finish(true);
    return;
  }
  appendCoach(block);
  s.index++;
  s.entered = Date.now();
  save();
  quiz();
  window.scrollTo(0, 0);
}
function coachResultCard(summary) {
  let names = {
    complete: 'Kuralı farklı biçimlerde uyguladın.',
    focus: 'Bu kural biraz daha pekiştirme istiyor.',
    contrast: 'Benzer kuralları ayırmaya yeniden odaklanacağız.',
    mixed: 'Karışık çözümde biraz daha pratik yararlı olacak.',
    transfer: 'Yeni biçime aktarımda tekrar yapacağız.',
    partial: 'Çalışma kaydedildi; bir sonraki oturumda devam edebilirsin.',
  };
  return `<section class="panel" style="margin-top:20px"><span class="tag">ÖRÜNTÜ KOÇU · ÇALIŞMA SONUCU</span><h3 style="margin-top:16px">${names[summary.reason] || names.partial}</h3><div class="coachStageResults">${Object.entries(
    summary.stages
  )
    .map(
      ([stage, s]) =>
        `<div><b>${Coach.stageName[stage]}</b><p>${s.independent}/${s.total} ipucusuz doğru</p><small>${s.seconds === null ? 'Süre için veri yok' : Math.round(s.seconds) + ' sn · ipucusuz doğru medyanı'}</small>${s.signals ? `<p><small>İlk yapı hipotezi: ${s.signalRight}/${s.signals} uyumlu${s.signalSeconds === null ? '' : ' · ' + Math.round(s.signalSeconds) + ' sn medyan'}</small></p>` : ''}</div>`
    )
    .join(
      ''
    )}</div>${Object.values(summary.stages).some(x => x.signals) ? `<p class="subtle">İlk yapı hipotezi: ${Object.values(summary.stages).reduce((n, x) => n + (x.signalRight || 0), 0)} / ${Object.values(summary.stages).reduce((n, x) => n + (x.signals || 0), 0)} uyumlu. Hipotez süresi yalnızca ilk yapı kararını ölçer; tam kuralı bulma süresi değildir.</p>` : ''}<p class="subtle">Aynı kural tekrarındaki süreyi, karışık soru çözme süresiyle doğrudan karşılaştırma. Bunlar farklı çalışma koşullarıdır.</p>${summary.due.length ? `<p>Tekrar listene eklendi: ${summary.due.map(x => Coach.byId(x.id).name + ' · ' + new Date(x.at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', timeZone: 'Europe/Istanbul' })).join('; ')}.</p>` : ''}<a class="btn" href="#coach">Çalışma planını gör →</a></section>`;
}

function assessmentAudit() {
  app.innerHTML =
    title(
      'İK BAKIŞIYLA DEĞERLENDİRME',
      'Hazırlık ölçümü ile işe alım kararını ayır.',
      'Mevcut uygulamanın neye dayanak verdiğini, hangi verilerinin eksik olduğunu ve nasıl geliştirilmesi gerektiğini incele.'
    ) +
    `<div class="toolbar"><a class="btn" href="#exam/graded">Aşamalı denemeye git →</a><a class="btn light" href="#report/demo">Örnek raporu aç →</a><a class="btn ghost" href="#pilot">Ölçüm laboratuvarı →</a></div><section class="panel"><h2>Mevcut kurallar yeterli mi?</h2><p>Hazırlık için farklı çözüm yaklaşımlarını çalıştıran bir temel var. Tek başına kural sayısı, güvenilir bir yetenek puanı üretmez. Sayı veya katsayı değişimi yeni bir beceri ölçümü sayılmaz. Üretilen soruların aynı ailedeki örnekleri de eş güçlükte kabul edilemez.</p><div class="tablewrap"><table><tr><th>Başlık</th><th>Bugünkü durum</th><th>Gerekli geliştirme</th></tr><tr><td>Kapsam ve dağılım</td><td>Altı beceri alanı ve farklı çözüm aileleri var.</td><td>Hedef rolün görevleriyle eşleştirme; her alt beceriyi yeterli ve çeşitli soruyla örnekleme.</td></tr><tr><td>Güçlük</td><td>Üç tasarım aşaması var; gerçek güçlükleri ölçülmedi.</td><td>Ölçüm laboratuvarında aynı madde için doğru oranı, çeldirici dağılımı ve madde–alan korelasyonu toplanır; gerçek pilot örneklemi gerekli.</td></tr><tr><td>Güvenirlik ve eşdeğer formlar</td><td>Sabit A/B pilot formları ve madde analizi altyapısı var; katılımcı araştırması tamamlanmadı.</td><td>Tutarlılık, ölçüm hatası ve farklı oturumların denkliği için veri toplama.</td></tr><tr><td>Norm ve karşılaştırma</td><td>Referans katılımcı grubu yok.</td><td>Amaca uygun norm örneklemi. Bugün yüzdelik dilim, IQ ve “ortalama üstü aday” yorumu üretilmez.</td></tr><tr><td>Sözel ve görsel içerik</td><td>20 çıkarım metni, 16 argüman, 12 süreç paragrafı ve kural üreten sözel modeller var. Görsel havuza katlama, küp ve yön izleme eklendi.</td><td>Havuz genişletildi. Bağımsız dil/içerik incelemesi ve pilotla güçlük karşılaştırması hâlâ gerekli.</td></tr><tr><td>Uygulama koşulları</td><td>Cihazda çalışan, gözetimsiz hazırlık aracı.</td><td>Yönerge ve puansız alıştırmalar eklendi. Erişilebilirlik kullanıcı testleri ve eşit uygulama koşulları gerçek seçim kullanımında ayrıca doğrulanmalı.</td></tr><tr><td>İş performansıyla bağ</td><td>İş başarısını öngörme verisi yok.</td><td>İş analizi, role uygun iş örneği ve yapılandırılmış mülakatla destekleme; geçerlik kanıtı toplama.</td></tr></table></div></section><div class="trainrow" style="margin-top:22px"><section class="panel"><h3>Kolaydan zora nasıl kullanılıyor?</h3><p>Hazırlık denemesinde önce temel ilişkiler, sonra birleşik kurallar, son olarak yoğun kısıtlar gelir. 36 soru: her alandan her aşamada iki soru. Süre 40 dakika; dağılım ve süre bu uygulamanın tasarımıdır.</p><p class="subtle">Bu sıra tek başına psikometrik uyarlama değildir. Zorluk ile soru sırası beraber değiştiği için son aşamadaki düşüşü yorgunluk veya stres olarak yorumlayamayız. Bazı üretilmiş sorular tasarlanan sıraya rağmen daha kolay gelebilir.</p></section><section class="panel"><h3>Bu rapor neleri göstermez?</h3><p>Kişilik, motivasyon, dürüstlük, liderlik, ekip uyumu, duygusal zekâ, klinik hafıza düzeyi veya işe uygunluk bu sorulardan çıkarılamaz.</p><p class="subtle">Mülakat önerileri yalnızca doğrulanacak sorulardır. Mülakat yapılmış veya bir yetkinlik davranışsal olarak doğrulanmış sayılmaz. Adayları sıralayan veya işe al / alma kararı veren bir rapor üretilmez.</p></section></div><section class="panel" style="margin-top:22px"><h3>Geliştirme önceliği</h3><ol><li>Genişletilen sözel ve uzamsal havuzu bağımsız içerik incelemesinden geçir.</li><li>Pilot uygulamada soru düzeyinde başarı, süre ve çeldirici verisi topla.</li><li>Güvenirlik ve eşdeğer form çalışmalarından sonra desteklenebilen puanları tanımla.</li><li>Gerçek işe alım kullanımı amaçlanıyorsa rol analizi ve geçerlik araştırmasıyla ilerle.</li></ol><p class="subtle"><a href="https://www.apa.org/ed/accreditation/personnel-selection-procedures.pdf" target="_blank" rel="noopener">Personel değerlendirmesinde geçerlik ve kullanım ilkeleri ↗</a><br><a href="https://www.ets.org/research/policy_research_reports/publications/report/2018/jysw.html" target="_blank" rel="noopener">Test güvenirliği ve ölçüm hatası ↗</a></p></section>`;
}
function assessmentReport(which = 'latest') {
  let report =
    which === 'demo'
      ? Assessment.sample()
      : which === 'latest'
        ? data.reports?.at(-1)
        : data.reports?.find(r => r.id === which);
  if (!report) {
    app.innerHTML =
      title(
        'SINAV RAPORU',
        'Henüz bir deneme raporu yok.',
        'Bir sınav tamamladığında sonuçların bu cihazda kaydedilir.'
      ) +
      '<div class="toolbar"><a class="btn" href="#exam/graded">Denemeyi aç →</a><a class="btn light" href="#report/demo">Örnek raporu gör →</a></div>';
    return;
  }
  const m = report.overall,
    pc = n => (n === null ? '—' : '%' + n),
    sec = n => (n === null ? '—' : Math.round(n) + ' sn'),
    stageNames = ['', 'Temel ilişkiler', 'Birleşik kurallar', 'Yoğun kısıtlar'];
  app.innerHTML =
    title(
      'DENEME GERİ BİLDİRİM RAPORU',
      report.sample ? 'Örnek katılımcı · Temsilî rapor' : 'Bu oturumun beceri görünümü',
      report.name
    ) +
    `<div class="reportTools toolbar"><button class="btn" id="printReport">Raporu yazdır / PDF kaydet ↓</button><a class="btn light" href="#assessment">Ölçüm kapsamını incele →</a><a href="#exam/graded">Yeni deneme →</a></div><section class="reportLead panel"><span class="tag">${report.sample ? 'SENTETİK ÖRNEK · GERÇEK BİR KİŞİYE AİT DEĞİL' : 'KİŞİSEL HAZIRLIK GERİ BİLDİRİMİ'}</span><h2>${report.sample ? 'ÖRNEK-001' : 'Oturum ' + report.id.replace('R-', '')}</h2><p>${new Date(report.at).toLocaleString('tr-TR', { timeZone: 'Europe/Istanbul' })} · ${report.graded ? 'Aşamalı form' : 'Sabit tasarım düzeyi'} · ${m.total} soru${report.budget ? ' · ' + Math.round(report.budget / 60) + ' dakika süre' : ''}</p><div class="note">Bu rapor bu oturumdaki soru performansını betimler. Norm, standart yetenek puanı ve ölçüm hatası verisi bulunmadığından adaylar arası sıralama veya işe alım kararı için yeterli değildir. “İK görüşmesi için hazırlık notu” olarak kullanılabilir.</div></section><div class="reportMetrics"><section class="panel"><small>DOĞRU / TÜM SORULAR</small><h2>${pc(m.score)}</h2><p>${m.correct} / ${m.total} doğru</p></section><section class="panel"><small>YANIT DOĞRULUĞU</small><h2>${pc(m.accuracy)}</h2><p>${m.correct} / ${m.answered} yanıt doğru</p></section><section class="panel"><small>TAMAMLAMA</small><h2>${pc(m.completion)}</h2><p>${m.answered} yanıt · ${m.blank} boş</p></section><section class="panel"><small>DOĞRU ÇÖZÜM MEDYANI</small><h2>${sec(m.correctMedian)}</h2><p>Yanlışlar bu süreye dahil değil</p></section></div><section class="panel" style="margin-top:22px"><h2>İK açısından hangi beceriye ilişkin örnek var?</h2><p class="subtle">Oranlar bu oturumdaki soru setine aittir. Alan başına altı soru sınırlı bir gözlemdir; kişilik özelliği veya kalıcı yetenek düzeyi olarak yorumlanmaz. Barlar başarı yüzdesidir; norm yüzdeliği değildir.</p><div class="tablewrap"><table><tr><th>Beceri / gözlenen görev</th><th>Doğru / yanlış / boş</th><th>Bu setin başarısı</th><th>Doğru süre medyanı</th><th>Kapsam</th></tr>${report.domains.map(d => `<tr><td><b>${d.name}</b><br><small>${d.description}</small></td><td>${d.correct} / ${d.wrong} / ${d.blank}</td><td>${d.total ? `<div class="reportBar"><span style="width:${d.score}%"></span></div>${pc(d.score)}` : 'Uygulanmadı'}</td><td>${sec(d.correctMedian)}</td><td>${d.total} soru · ${d.breadth} aile<br><small>${d.total === 0 ? 'Veri yok' : d.answered < 3 ? 'Yorum için az yanıt' : 'Sınırlı örneklem'}</small></td></tr>`).join('')}</table></div></section><details class="panel" style="margin-top:22px"><summary>Hangi soru ailelerinde nasıl sonuç aldın?</summary><p class="subtle">Bir ailede tek soruya denk gelmiş olabilirsin; tek cevap o yaklaşımda genel başarı veya başarısızlık göstergesi sayılmaz.</p><div class="tablewrap"><table><tr><th>Alan</th><th>Soru ailesi</th><th>Doğru / yanlış / boş</th></tr>${(report.families || []).map(f => `<tr><td>${Assessment.names[f.cat]}</td><td>${f.name}</td><td>${f.correct} / ${f.wrong} / ${f.blank}</td></tr>`).join('')}</table></div></details><section class="panel" style="margin-top:22px"><h2>${report.graded ? 'Aşamalar boyunca performans' : 'Tasarım düzeylerine göre görünüm'}</h2><div class="reportStages">${report.stages
      .filter(s => s.total)
      .map(
        s =>
          `<div><span class="tag">${s.level}. AŞAMA</span><h3>${stageNames[s.level]}</h3><p><b>${s.correct} / ${s.total}</b> doğru · ${s.wrong} yanlış · ${s.blank} boş</p><small>Doğru medyanı ${sec(s.correctMedian)}</small></div>`
      )
      .join(
        ''
      )}</div><p class="subtle">Düzeyler tasarım etiketidir; pilot verilerle kalibre edilmedi. Aşamalar farklı soru türlerini içerebilir. Sona doğru düşen başarı, tek başına yorgunluk, stres veya dikkat kaybı kanıtı değildir.</p></section><div class="trainrow" style="margin-top:22px"><section class="panel"><h3>Süre ve sınavı yönetme</h3><p>Toplam geçen süre: <b>${fmt(report.elapsed)}</b><br>Ekranda kaydedilen aktif süre: <b>${fmt(m.active)}</b><br>Yanlış: <b>${m.wrong}</b> · Boş: <b>${m.blank}</b></p><p>Görülen ama boş bırakılan: <b>${report.skipped}</b><br>Açılmadan kalan: <b>${report.unseen}</b><br>Tekrar ziyaret edilen soru: <b>${report.revisited}</b><br>Cevabı değiştirilen soru: <b>${report.changed}</b></p><p class="subtle">Soruya dönmek veya cevap değiştirmek tek başına kararsızlık göstergesi değildir. Aktif süre, uygulama görünürken kaydedilen süredir. Sekme kapalıyken sınav süresi işlemeye devam eder. ${report.reason === 'timeout' ? 'Bu oturum süre dolunca tamamlandı.' : 'Bu oturum katılımcı tarafından tamamlandı.'}</p></section><section class="panel"><h3>Bu sonuçtan ne söylenebilir?</h3><p>${m.answered ? `${m.answered} yanıtın ${m.correct} tanesi doğru. ${m.blank ? `${m.blank} boş soru toplam başarı oranını etkiledi.` : 'Bütün sorular yanıtlandı.'} Yanıt doğruluğu ile tamamlama oranını birlikte incele.` : 'Yanıt olmadığı için beceri yorumu yapılamaz.'}</p><p class="subtle">Bu sınavda temsil edilen görevlerdeki başarını gösterir. Hız tek başına puan veya kişilik göstergesi yapılmaz. Bir önceki rastgele denemeyle fark, eşdeğer soru formu olmadan “yetenek artışı” diye sunulmaz.</p></section></div><section class="panel" style="margin-top:22px"><h2>Öncelikli çalışma önerileri</h2>${report.priorities.length ? report.priorities.map((p, i) => `<div class="reviewitem"><h3>${i + 1}. ${p.name}</h3><p>${p.evidence}</p><p>${p.action}</p></div>`).join('') : '<p>Alan bazında öneri için en az bir alanda üç yanıt gerekiyor. Önce denemeyi tamamla.</p>'}<p class="subtle">Öncelik, bu oturumdaki daha düşük doğru / toplam oranına göre belirlenir. İşe uygunluk veya kalıcı zayıflık sıralaması değildir.</p></section><section class="panel" style="margin-top:22px"><h2>Yapılandırılmış mülakatta doğrulanabilecek noktalar</h2><p class="subtle">Aşağıdaki öneriler test sonucunu davranış örneğiyle tartışmak içindir. Mülakat yapılmış veya bir yetkinlik doğrulanmış değildir.</p>${report.probes.map(p => `<div class="reviewitem"><h3>${p.name}</h3><p><b>Soru:</b> ${p.question}</p><p><b>Gözlenecek davranış:</b> ${p.observe}</p></div>`).join('') || '<p>Yeterli yanıt oluştuğunda görüşme soruları önerilir.</p>'}</section><section class="panel" style="margin-top:22px"><h3>Ölçülmeyen ve raporlanmayan özellikler</h3><p>Kişilik · motivasyon · dürüstlük · liderlik · takım uyumu · duygusal zekâ · iş başarısı · IQ · aday yüzdelik dilimi.</p><p class="subtle">İşle ilgili becerilerin daha kapsamlı değerlendirilmesi için role uygun bir iş örneği ve yapılandırılmış mülakat gerekir. Bu rapor kendi başına aday kabul / ret önermez.</p></section>${reportDetails(report)}`;
}

function downloadJson(name, value) {
  let a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([value], { type: 'application/json' }));
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}
function pilotPage() {
  let state = data.pilotState,
    ids = [...new Set([...Object.values(state.forms).map(f => f.id), ...state.runs.map(r => r.formId)])],
    selected = state.selected || ids[0],
    stats = selected ? Pilot.analyze(state, selected) : null;
  app.innerHTML =
    title(
      'ÖLÇÜM LABORATUVARI',
      'Önce veri. Sonra ölçüm kanıtı.',
      'Aynı sabit soruları gören anonim katılımcılarla pilot verisi topla; madde ve ölçek istatistiklerini bu cihazda incele.'
    ) +
    `<div class="toolbar"><a class="btn light" href="#assessment">Kapsam ve sınırlar →</a><button class="btn ghost" id="pilotExport" ${!state.runs.length ? 'disabled' : ''}>Anonim pilot verisini indir ↓</button><button class="btn ghost" id="pilotImportChoose">Pilot verisi içe aktar ↑</button><input type="file" id="pilotImport" accept="application/json,.json" hidden></div><section class="panel"><h2>Sabit form ile pilot oturumu</h2><p>Her form 36 soru / 40 dakikadır. Sorular, seçenekler ve sıra o form için sabit tutulur. A ve B aynı dağılımla hazırlanır; istatistiksel eşdeğerlikleri henüz gösterilmiş değildir. Formlar ve sonuçlar bu cihazda saklanır; farklı rastgele denemeler aynı madde olarak birleştirilmez.</p><div class="formgrid"><label class="field">Anonim katılımcı kodu<input id="pilotCode" maxlength="40" placeholder="Örn. K001 · gerçek ad kullanma" autocomplete="off"></label><label class="field">Form<select id="pilotForm"><option value="A">A ${state.forms.A ? '· hazır' : '· ilk kullanımda oluşturulur'}</option><option value="B">B ${state.forms.B ? '· hazır' : '· ilk kullanımda oluşturulur'}</option></select></label></div><button class="btn" id="pilotStart">Pilot oturumunu başlat →</button><p class="subtle">Aynı kişinin aynı formdaki yalnızca ilk oturumu analize katılır; tekrar çözmeler ayrı kişi sayılmaz. Katılımcı kodunu kişinin kimliğini açıklamadan tutarlı kullan. Bu araç kimlik doğrulaması, gözetim veya norm örneklemi sağlamaz.</p></section><section class="panel" style="margin-top:22px"><h2>Madde kalitesi ön incelemesi</h2><label class="field">İncelenecek form<select id="pilotAnalysis">${ids.map(id => `<option value="${id}" ${id === selected ? 'selected' : ''}>${id}</option>`).join('') || '<option value="">Henüz veri yok</option>'}</select></label>${stats ? `<p><b>${stats.n}</b> farklı anonim kod · <b>${stats.duplicates}</b> tekrar oturumu analizden çıkarıldı.</p>` : ''}<div class="note">Madde doğru oranı, bu pilot grubundaki gözlemdir. Düzeltilmiş madde–alan toplam korelasyonu ve KR-20, en az 20 farklı koddan sonra gösterilir. 20, arayüzün ön inceleme alt sınırıdır; yeterli örneklem veya geçerlik kanıtı anlamına gelmez. Değişkenlik yoksa değer hesaplanmaz. Çok boyutlu toplamın tek bir yetenek ölçeği olduğu varsayılmaz.</div>${
      stats?.n
        ? `<div class="tablewrap"><table><tr><th>Alan</th><th>Madde sayısı</th><th>İç tutarlılık ön incelemesi (KR-20)</th></tr>${stats.scales
            .filter(s => s.k)
            .map(
              s =>
                `<tr><td>${Assessment.names[s.cat]}</td><td>${s.k}</td><td>${s.kr20 === null ? 'Veri / değişkenlik yetersiz' : s.kr20.toFixed(3)}</td></tr>`
            )
            .join(
              ''
            )}</table></div><p class="subtle">Negatif tutarlılık veya negatif madde–alan ilişkisi; anahtar, kapsam ve madde uyumunun incelenmesini gerektirir. Bu değerlerden otomatik soru silme, aday sıralama veya işe uygunluk kararı üretilmez.</p><div class="tablewrap"><table><tr><th>Madde</th><th>Alan / şablon</th><th>Pilot doğru oranı</th><th>Madde–alan ilişkisi</th><th>Çeldirici dağılımı</th></tr>${stats.items.map((i, n) => `<tr><td>${n + 1}.<br><small>${i.id}</small></td><td>${Assessment.names[i.cat]}<br><small>${i.template} · aşama ${i.level}</small></td><td>%${Math.round(i.p * 100)}<br><small>${i.blank} boş</small></td><td>${i.rit === null ? 'Hesaplanmadı' : i.rit.toFixed(3)}</td><td>${i.choices.map((c, j) => `${c.correct ? 'Doğru' : 'Çeldirici ' + (j + 1)}: ${c.count}`).join('<br>')}</td></tr>`).join('')}</table></div>`
        : '<p>Henüz incelenecek pilot yanıtı yok. Sonuç uydurulmaz; gerçek oturumlar biriktikçe tablo oluşur.</p>'
    }</section><section class="panel" style="margin-top:22px"><h3>İçe ve dışa aktarım kapsamı</h3><p class="subtle">Dosya; anonim kod, form/madde/şablon kimlikleri, seçenek kimlikleri, seçimler ve süreleri içerir. Soru metni, isim, e-posta veya bir adayın kişilik yorumu eklenmez. İçe aktarma cihazda yapılır. Aynı form kimliği altında farklı soru veya cevap anahtarı saptanırsa dosya birleştirilmez.</p><p class="subtle"><a href="https://www.washington.edu/assessment/scanning-scoring/scoring/reports/item-analysis/" target="_blank" rel="noopener">Madde analizi ve iç tutarlılık açıklaması ↗</a></p></section>`;
  $('#pilotAnalysis').onchange = () => {
    state.selected = $('#pilotAnalysis').value;
    save();
    pilotPage();
  };
  $('#pilotImport').onchange = async () => {
    let file = $('#pilotImport').files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast('En fazla 5 MB pilot dosyası yükleyebilirsin.');
      return;
    }
    try {
      let runs = Pilot.validate(JSON.parse(await file.text()));
      Pilot.add(state, runs);
      save();
      toast(runs.length + ' oturum içe aktarıldı.');
      pilotPage();
    } catch (e) {
      toast('İçe aktarılamadı: ' + e.message);
    }
  };
}
function startPilot() {
  let code = $('#pilotCode').value.trim().toUpperCase(),
    label = $('#pilotForm').value;
  if (!/^[A-Z0-9_-]{2,40}$/.test(code)) {
    toast('Gerçek ad yerine K001 gibi anonim bir kod kullan.');
    return;
  }
  let state = data.pilotState,
    form = state.forms[label];
  if (!form) {
    let questions = start('exam', 'all', null, 2, {
      ...profiles.find(p => p.id === 'graded'),
      buildOnly: true,
    });
    form = Pilot.form(questions, label);
    state.forms[label] = form;
  }
  let previous = session;
  start('exam', 'all', null, 2, {
    ...profiles.find(p => p.id === 'graded'),
    questions: JSON.parse(JSON.stringify(form.questions)),
    name: 'Pilot form ' + label,
  });
  if (session === previous || session?.questions[0].id !== form.questions[0].id) return;
  session.pilot = { formId: form.id, label, participant: code };
  save();
}

const workSamples = {
  num: {
    prompt:
      'Bir raporda üç ardışık dönem 18, 29 ve 51 işlem gösteriyor. Ekip bu değerlerle gelecek ayı tek bir sayı olarak tahmin ediyor. Tahmin için en az iki olası açıklama üret; bunları ayıracak ek veriyi ve kontrol yöntemini belirt.',
    observe: 'Tek örüntüyü kesin gerçek saymaması; alternatif açıklama kurması ve ek veri istemesi.',
  },
  shape: {
    prompt:
      'Bir yerleşim şemasını başka bir yönden gören ekip, giriş ve çıkış yönlerini karıştırıyor. Şemayı 90° döndürerek hangi noktaların yer değiştirdiğini, hangilerinin aynı kaldığını açıklayan kısa bir kontrol listesi hazırla.',
    observe: 'Referans yönünü sabitlemesi, dönüşümü adım adım izlemesi ve konum ile kimliği ayırması.',
  },
  verbal: {
    prompt:
      'Bir prosedürde “belgeler tam ve onay varsa işleme alınır; bloke olanlar bekletilir” yazıyor. Belgeleri tam ve onaylı ama bloke bir kayıt için nasıl ilerlersin? Eksik onaylı başka bir kayıt için hangi bilgiye ihtiyaç duyarsın?',
    observe: 'Genel kural, engelleyici istisna ve eksik bilgiyi birbirine karıştırmaması.',
  },
  attention: {
    prompt:
      'İki listede aynı kayıt için tarih ve ürün kodu aynı, tutarlar 1.250 ve 1.520 TL. Ayrıca bir listede tireli, diğerinde tiresiz kod var. Hangi farkı gerçek hata sayacağını, nasıl doğrulayacağını ve hangi kaynağı esas alacağını yaz.',
    observe: 'Biçim farkını içerik farkından ayırması; kaynağı doğrulamadan düzeltme yapmaması.',
  },
  quant: {
    prompt:
      'A hattı 1.000 üründe 20 hata, B hattı 10.000 üründe 100 hata üretiyor. Toplam hata oranını bul; oranların basit ortalamasıyla farkını açıkla. Öncelikli iyileştirme için ayrıca hangi kapasite veya maliyet verisini istersin?',
    observe: 'Doğru paydayı kullanması; toplam oran, hata adedi ve müdahale önceliğini ayrı değerlendirmesi.',
  },
  logic: {
    prompt:
      'A işi 2 saat; A’dan sonra B 3 saat ve C 4 saat sürüyor. D, B ve C bitince başlayıp 1 saat sürüyor. B ve C aynı uzmanı kullanıyorsa planı kur; kaynak kısıtı kalkarsa planın nasıl değişeceğini açıkla.',
    observe:
      'Bağımlılık ve ortak kaynak kısıtını ayırması; varsayımları açıklayıp iki planı tutarlı karşılaştırması.',
  },
};
function reportDetails(report) {
  if (!report.itemResults)
    return '<section class="panel" style="margin-top:22px"><h3>Önceki rapor biçimi</h3><p>Bu raporda madde ayrıntıları saklanmamış. Ayrıntılı analiz sonraki tamamlanan denemelerde oluşur.</p></section>';
  let rows = report.itemResults,
    errors = rows.filter(r => r.answered && !r.correct),
    right = report.domains.filter(d => d.answered >= 3).sort((a, b) => b.score - a.score),
    top = right[0],
    revision = report.revision || {},
    priority = report.priorities[0],
    work = workSamples[priority?.id || 'quant'];
  return `<section class="panel" style="margin-top:22px"><span class="tag">KANITA DAYALI OTURUM ÖZETİ</span><h2>Gözlem → sınır → sonraki adım</h2>${top ? `<p><b>Bu sette daha fazla doğru çıkan alan:</b> ${top.name}; ${top.total} soruda ${top.correct} doğru, ${top.answered} yanıt. Bu, diğer adaylara göre bir üstünlük veya kalıcı güçlü yön kanıtı değildir.</p>` : '<p>Alan karşılaştırması için yeterli yanıt yok.</p>'}${priority ? `<p><b>Çalışma odağı:</b> ${priority.name}. ${priority.evidence} ${priority.action}</p>` : ''}<p><b>Kapsam:</b> ${rows.length} soru, ${report.families.length} raporlama grubu. Bu sayı bağımsız yetenek puanı sayısı değildir. Aynı katsayı değişimi veya eşdeğer görsel dönüşüm ayrı bir yetenek gibi sayılmaz.</p><p class="subtle">Her alanın aynı sayıda soruyla temsil edilmesi, aynı ölçüm kesinliğine sahip olduğu anlamına gelmez. Özellikle tek maddeyle temsil edilen ailelerde sonuç genellenmez.</p></section><section class="panel" style="margin-top:22px"><h2>Alan × aşama ayrıntısı</h2><div class="tablewrap"><table><tr><th>Alan</th><th>Temel</th><th>Birleşik</th><th>Yoğun</th><th>Yanıtlanan kapsam</th></tr>${report.domains.map(d => `<tr><td>${d.name}</td>${d.levels.map(l => `<td>${l.correct}/${l.total} doğru<br><small>${l.wrong} yanlış · ${l.blank} boş</small></td>`).join('')}<td>${d.answeredBreadth ?? '—'} / ${d.breadth} aile</td></tr>`).join('')}</table></div><p class="subtle">Aşama başına iki soru küçük bir örneklemdir. Tek bir cevaptan “zor soruları çözemiyor” veya “baskıda performansı düşüyor” sonucu çıkarılmaz.</p></section><section class="panel" style="margin-top:22px"><h2>Kontrol ve yeniden değerlendirme davranışı</h2>${revision.available ? `<p>İlk yanıt yanlışken sonradan doğruya çevrilen: <b>${revision.wrongToRight}</b><br>İlk yanıt doğruyken yanlış seçeneğe çevrilen: <b>${revision.rightToWrong}</b><br>Yanlış seçenekten başka bir yanlış seçeneğe geçilen: <b>${revision.wrongToWrong}</b></p>` : '<p>İlk yanıt kaydı bu oturumda bulunmadığı için değişimin yönü hesaplanmadı.</p>'}<p>Ekranın görünür olmadığı aralık sayısı: <b>${report.interruptions?.count || 0}</b> · kaydedilen toplam <b>${fmt((report.interruptions?.ms || 0) / 1000)}</b>.</p><p class="subtle">Bu kayıtlar sınav koşullarını açıklamak içindir. Sekme değişimi, tekrar kontrol veya yanıt değişikliği; dürüstlük, kararsızlık ya da dikkat bozukluğu puanı değildir.</p></section><section class="panel" style="margin-top:22px"><h2>Yanlış yanıtlarda incelenecek noktalar</h2>${errors.length ? errors.map(r => `<details class="reviewitem"><summary>${r.index}. soru · ${r.name} · ${Math.round(r.sec)} sn</summary>${r.stem ? `<h3>${r.stem}</h3>` : ''}${r.context || ''}<p><b>Seçimin:</b> ${r.choice || '—'} · <b>Doğru seçenek:</b> ${r.correctChoice || '—'}</p>${r.selectedDisplay ? `<div class="reportAnswerPair"><div><small>Seçilen</small><div>${r.selectedDisplay}</div></div><div><small>Doğru</small><div>${r.correctDisplay || '—'}</div></div></div>` : ''}${r.solution ? `<div class="feedback">${r.solution}</div>` : ''}<p><b>Çözümde denetlenecek nokta:</b> ${r.diagnostic || 'Madde açıklamasını yeniden incele.'}</p><p class="subtle">Bu bir olası hata açıklamasıdır; yalnızca seçilen şıktan düşünce sürecin kesin olarak bilinemez.</p></details>`).join('') : '<p>Yanlış yanıt kaydı yok. Bu durum, yeterli sayıda ve kapsamda soru çözülmediyse beceri ustalığı göstermez.</p>'}</section><details class="panel" style="margin-top:22px"><summary>Tüm soruların performans dökümü</summary><div class="tablewrap"><table><tr><th>Soru</th><th>Alan / aile</th><th>Aşama</th><th>Sonuç</th><th>Aktif süre</th></tr>${rows.map(r => `<tr><td>${r.index}</td><td>${Assessment.names[r.cat]}<br><small>${r.name}</small></td><td>${r.level}</td><td>${r.answered ? (r.correct ? (r.hinted ? 'İpucuyla doğru' : 'Doğru') : 'Yanlış') : 'Boş'}</td><td>${Math.round(r.sec)} sn</td></tr>`).join('')}</table></div></details><section class="panel" style="margin-top:22px"><h2>Sonuca göre çalışma planı</h2><div class="reportStages"><div><span class="tag">İLK ÇALIŞMA</span><h3>Yanlışın nedenini sınayarak çöz</h3><p>${priority ? priority.action : 'Önce bir denemeyi tamamlayarak alan başına yeterli yanıt oluştur.'}</p></div><div><span class="tag">ARADAN SONRA</span><h3>Aynı aile, farklı sunum</h3><p>Yanlışları ezberden tekrar seçmek yerine yeni metin, yeni yerleşim veya yeni koşullarla ilişkiyi yeniden kur.</p></div><div><span class="tag">SONRAKİ DENEME</span><h3>Doğruluk ve tamamlamayı izle</h3><p>Yeni bir karma formda boşları, yanlışları ve doğru çözüm süresini birlikte incele. Rastgele iki formun puan farkını tek başına yetenek artışı sayma.</p></div></div><a class="btn light" href="#train/${priority?.id || 'num'}">Önerilen alanı çalış →</a></section><section class="panel" style="margin-top:22px"><h2>Ek iş örneği · uygulanmadı</h2><p>${work.prompt}</p><p><b>Gözlenecek kanıt:</b> ${work.observe}</p><p class="subtle">Değerlendirme notu: yanıtı dayanak göstermeden verme; kısmi çözüm ve eksik varsayımlar; tutarlı çözüm, dayanak ve sınırları açıklama. Bunlar görüşmeci için gözlem başlıklarıdır; uygulama bu iş örneğini puanlamış değildir. Role uygunluğu ayrıca belirlenmelidir.</p></section><section class="panel" style="margin-top:22px"><h3>Raporun ölçüm dayanağı</h3><p>Rapor biçimi v${report.version} · içerik revizyonu ${report.bankRevision || 'önceki'} · ${report.sample ? 'sentetik örnek' : 'gerçek oturum yanıtları'}.</p><p class="subtle">Madde güçlükleri, norm ve ölçüm hatası bu rapor için kalibre edilmiş değildir. Pilot laboratuvarındaki betimsel istatistikler ayrıca incelenir; yeterli bağımsız araştırma olmadan standart yetenek puanına çevrilmez.</p></section>`;
}
let orientationQuestions = null,
  orientationAnswers = {};
function orientationPage() {
  if (!orientationQuestions)
    orientationQuestions = [Engine.question('verbal', 1, 1), Engine.question('shape', 6, 1)];
  app.innerHTML =
    title(
      'SINAV ÖNCESİ',
      'Yönergeyi ve cevaplamayı dene.',
      'Bu iki örnek puana ve çalışma geçmişine eklenmez; süreli sınav henüz başlamaz.'
    ) +
    `<section class="panel"><h2>Ortak yönerge</h2><ol><li>Yalnızca soruda verilen bilgileri kullan. Her soruda tek doğru seçenek vardır.</li><li>Yanlış cevap doğru puanı azaltmaz; boşlar toplam soru sayısına dahildir.</li><li>Sınavda ipucu ve çözüm açıklaması açılmaz. İstediğin soruya dönebilir ve yanıtı değiştirebilirsin.</li><li>Seçtiğin denemenin süresi sınavı başlatınca işler; ekran görünür değilken de geri sayım sürer.</li><li>Hazırlık koşullarını tutarlı tutmak için hesap makinesi ve dış kaynak kullanmadan dene. Not kâğıdı kullanabilirsin.</li><li>Görsellerin yanında okunabilir açıklamalar vardır. Bir çizimi algılamakta güçlük varsa bu sonuç tek başına beceri yetersizliği olarak yorumlanmamalıdır.</li></ol></section>${orientationQuestions.map((q, i) => `<section class="panel" style="margin-top:22px"><span class="tag">PUANSIZ ÖRNEK ${i + 1}</span><h3>${q.q}</h3>${q.visual}<div class="answers">${q.options.map((o, j) => `<button class="answer ${orientationAnswers[i] === j ? 'selected' : ''}" data-orientation="${i}-${j}"><span class="letter">${String.fromCharCode(65 + j)}</span><span>${o}</span></button>`).join('')}</div>${orientationAnswers[i] !== undefined ? `<div class="feedback"><b>${q.options[orientationAnswers[i]] === q.answer ? 'Yanıtın doğru.' : 'Bu seçeneği çözümle karşılaştır.'}</b><p>${q.exp}</p></div>` : ''}</section>`).join('')}<div class="toolbar"><a class="btn" href="#exam/graded">Denemeye hazırım →</a></div>`;
}

function positionPage() {
  const selected = window.Positions?.load(localStorage),
    pos = window.Positions?.get(selected?.positionId);
  if (!window.Positions) {
    app.innerHTML = '<p>Pozisyon kataloğu yüklenemedi.</p>';
    return;
  }
  app.innerHTML =
    title(
      'POZİSYON PARKURU',
      'Hedefine göre çalış.',
      'Pozisyon alan odağını önerir. Güçlük önerisi, yeterli ipucusuz öğrenme yanıtı olduğunda çalışma kayıtlarınla değişir.'
    ) +
    `<section class="panel"><div class="formgrid"><label class="field">Pozisyon<select id="positionChoice"><option value="">Pozisyon seç</option>${Positions.positions.map(p => `<option value="${p.id}" ${p.id === selected?.positionId ? 'selected' : ''}>${p.name}</option>`).join('')}</select></label><label class="field">Kıdem / sorumluluk kapsamı<select id="positionSeniority">${Object.entries(
      Positions.levels
    )
      .map(
        ([id, name]) =>
          `<option value="${id}" ${id === selected?.seniority ? 'selected' : ''}>${name}</option>`
      )
      .join(
        ''
      )}</select></label></div><p class="subtle">Bu seçim Rol Atölyesi ve Mizaç için de ortak pozisyon bağlamıdır. Sabit genel yetenek denemesi aynı kalır; hedefli parkur onunla eşdeğer bir ölçüm değildir.</p><div class="toolbar"><button class="btn light" id="savePosition">Pozisyonu kaydet</button><button class="btn" id="beginPosition">Önerilen parkuru başlat · 12 soru</button></div><div id="positionRecommendation"></div></section>`;
  $('#positionChoice').onchange = () => {
    const p = Positions.get($('#positionChoice').value);
    if (p?.people) $('#positionSeniority').value = 'lead';
    drawPositionRecommendation();
  };
  $('#positionSeniority').onchange = drawPositionRecommendation;
  drawPositionRecommendation();
}
function positionSelection() {
  const id = $('#positionChoice')?.value,
    seniority = $('#positionSeniority')?.value,
    p = Positions.get(id);
  return { schema: 1, positionId: id, seniority: p?.people ? 'lead' : seniority };
}
function drawPositionRecommendation() {
  const choice = positionSelection(),
    rec = Positions.recommendation(choice, data.answers);
  $('#positionRecommendation').innerHTML = rec
    ? `<h2>${rec.position.name}</h2><p>${rec.position.context}</p><div class="cards">${rec.domains.map(d => `<article class="panel"><h3>${catname(d.id)}</h3><p>Önerilen tasarım düzeyi: ${d.level} / 3</p><p class="subtle">${d.reason}</p><p class="subtle">Bu düzeyde ${d.n}/24 uygun yanıt. İpuçlu, hız turu ve sınav yanıtları uyarlamaya katılmaz.</p></article>`).join('')}</div><p class="note">${rec.note}</p><p class="subtle">Öneriyi kullanabilir veya Antrenmanlar alanından güçlüğü kendin seçebilirsin. Pozisyon adı tek başına daha zor soruyu hak ettiğin veya o mesleğe uygun olduğun anlamına gelmez.</p>`
    : '<p class="subtle">Pozisyon seçtiğinde alan ve başlangıç düzeyi önerisi oluşur.</p>';
}
function startPositionPark() {
  const choice = positionSelection();
  if (!Positions.valid(choice)) {
    toast('Önce pozisyonunu seç.');
    return;
  }
  Positions.save(localStorage, choice);
  const rec = Positions.recommendation(choice, data.answers),
    previous = session;
  start('learn', 'all', null, rec.level, {
    pattern: rec.domains.map(d => d.id),
    domainLevels: Object.fromEntries(rec.domains.map(d => [d.id, d.level])),
  });
  if (session && session !== previous) {
    session.positionContext = { ...choice, policy: 'position-practice-v1', domains: rec.domains };
    session.name = rec.position.name + ' · hedefli çalışma';
    save();
  }
}

function render() {
  clearInterval(timer);
  if (session) accountTime();
  let parts = (location.hash.slice(1) || 'home').split('/'),
    route = parts[0];
  activeRoute = route;
  document.querySelectorAll('[data-nav]').forEach(a => a.classList.toggle('active', a.dataset.nav === route));
  let names = {
    mistakes: 'Hata defterim',
    home: 'Genel bakış',
    position: 'Pozisyon parkuru',
    train: 'Antrenmanlar',
    coach: 'Örüntü koçu',
    exam: 'Sınav provası',
    assessment: 'Ölçüm kapsamı',
    report: 'Deneme raporu',
    pilot: 'Ölçüm laboratuvarı',
    orientation: 'Sınav yönergesi',
    progress: 'Gelişimim',
    sources: 'Sınav rehberi',
    quiz: 'Aktif tur',
    result: 'Sonuçlar',
  };
  $('#breadcrumb').innerHTML = `Çalışma alanın <b>/</b> ${names[route] || 'Genel bakış'}`;
  $('#xpHead').textContent = data.xp + ' XP';
  (
    ({
      mistakes: () =>
        ErrorNotebook.view(data, app, () => {
          try {
            localStorage.setItem('zp-data-v1', JSON.stringify(data));
            return true;
          } catch {
            return false;
          }
        }),
      home,
      position: positionPage,
      coach: () => (parts[1] === 'focus' ? focusedCoachPage() : discoveryPage()),
      train: () => train(parts[1]),
      exam: () => exam(parts[1]),
      assessment: assessmentAudit,
      pilot: pilotPage,
      orientation: orientationPage,
      report: () => assessmentReport(parts[1]),
      progress,
      sources: sourcePage,
      quiz,
      result,
    })[route] || home
  )();
  if (session && route !== 'quiz') {
    save();
    startTimer();
  }
}
window.addEventListener('hashchange', () => {
  render();
  window.scrollTo(0, 0);
});
app.addEventListener('click', e => {
  let el = e.target.closest('button,[data-go]');
  if (!el) return;
  if (el.id === 'savePosition') {
    const choice = positionSelection();
    if (!Positions.valid(choice)) {
      toast('Önce pozisyonunu seç.');
      return;
    }
    Positions.save(localStorage, choice);
    toast('Pozisyon bağlamın üç modül için kaydedildi.');
    return;
  }
  if (el.id === 'beginPosition') {
    startPositionPark();
    return;
  }
  if (el.dataset.go) {
    location.hash = el.dataset.go;
    return;
  }
  if (el.dataset.start) {
    let id = el.dataset.start;
    start(id === 'speed' ? 'speed' : 'learn', cats.some(c => c.id === id) ? id : 'all');
    return;
  }
  if (el.dataset.traincat === 'num' && $('#mode').value === 'learn') {
    data.discoveryState.level = Number($('#level').value);
    data.discoveryState.scope = 'num';
    startDiscovery();
    return;
  }
  if (el.dataset.traincat) {
    start($('#mode').value, el.dataset.traincat, null, Number($('#level').value));
    return;
  }
  if (el.dataset.type !== undefined) {
    start($('#mode').value, el.dataset.cat, Number(el.dataset.type), Number($('#level').value));
    return;
  }
  if (el.dataset.profile) {
    location.hash = 'exam/' + el.dataset.profile;
    return;
  }
  if (el.id === 'beginExam') {
    let p = { ...profiles.find(x => x.id === $('#profile').value) };
    if (p.id === 'custom') {
      p.count = Math.max(6, Math.min(60, Number($('#qcount').value) || 24));
      p.minutes = Math.max(1, Math.min(90, Number($('#minutes').value) || 20));
      p.level = Number($('#examlevel').value);
      if ($('#examcat').value !== 'all') p.pattern = [$('#examcat').value];
    }
    start('exam', 'all', null, p.level || Number($('#examlevel').value), p);
    return;
  }
  if (el.id === 'export') {
    let a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }));
    a.download = 'zihin-parkuru-gelisim.json';
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    return;
  }
  if (el.dataset.orientation) {
    let [i, j] = el.dataset.orientation.split('-').map(Number);
    orientationAnswers[i] = j;
    orientationPage();
    return;
  }
  if (el.id === 'pilotImportChoose') {
    $('#pilotImport').click();
    return;
  }
  if (el.id === 'pilotStart') {
    startPilot();
    return;
  }
  if (el.id === 'pilotExport') {
    downloadJson('zihin-parkuru-pilot.json', Pilot.serialize(data.pilotState));
    return;
  }
  if (el.id === 'printReport') {
    window.print();
    return;
  }
  if (el.id === 'discoveryStart') {
    startDiscovery();
    return;
  }
  if (el.id === 'coachStart') {
    startCoach();
    return;
  }
  if (el.dataset.coachrule) {
    startCoach(el.dataset.coachrule);
    return;
  }
  if (el.id === 'coachLessonDone' && session?.coach) {
    session.coach.lesson = null;
    session.entered = Date.now();
    save();
    quiz();
    return;
  }
  if (!session) return;
  let s = session,
    i = s.index,
    q = s.questions[i];
  if (el.dataset.signal !== undefined) {
    accountTime();
    if (s.signals?.[i]) return;
    s.signals = s.signals || {};
    let type = Number(el.dataset.signal);
    s.signals[i] = {
      type,
      correct: type === Coach.signalType(q),
      sec: Math.round((s.seconds[i] || 0) * 10) / 10,
    };
    save();
    quiz();
    return;
  }
  if (el.dataset.answer !== undefined) {
    if (s.coach && Coach.signalRequired(q) && !s.signals?.[i]) return;
    accountTime();
    let chosen = q.options[Number(el.dataset.answer)];
    s.firstResponses = s.firstResponses || {};
    if (s.firstResponses[i] === undefined) s.firstResponses[i] = chosen;
    if (s.responses[i] !== undefined && s.responses[i] !== chosen) {
      s.changes = s.changes || {};
      s.changes[i] = (s.changes[i] || 0) + 1;
    }
    s.responses[i] = chosen;
    save();
    if (s.mode === 'speed') {
      if (i === s.questions.length - 1) finish(true);
      else move(i + 1);
    } else quiz();
    return;
  }
  if (el.id === 'hint') {
    if (s.coach && Coach.signalRequired(q) && !s.signals?.[i]) {
      toast('Önce hangi yapıyı deneyeceğini seç.');
      return;
    }
    accountTime();
    if (!s.hints.includes(i)) s.hints.push(i);
    s.hintSteps = s.hintSteps || {};
    s.hintSteps[i] = Math.min((s.hintSteps[i] || 0) + 1, (q.hints || [q.hint]).length);
    save();
    quiz();
    return;
  }
  if (el.id === 'check') {
    accountTime();
    if (!s.revealed.includes(i)) s.revealed.push(i);
    if (s.coach) captureCoach(s, i);
    save();
    quiz();
    return;
  }
  if (el.id === 'next') {
    if (s.coach) {
      coachNext();
      return;
    }
    if (i === s.questions.length - 1) finish();
    else move(i + 1);
    return;
  }
  if (el.id === 'prev') {
    move(i - 1);
    return;
  }
  if (el.id === 'flag') {
    s.flags = s.flags.includes(i) ? s.flags.filter(x => x !== i) : [...s.flags, i];
    save();
    quiz();
    return;
  }
  if (el.dataset.jump !== undefined) {
    move(Number(el.dataset.jump));
    return;
  }
  if (el.id === 'finish') finish();
});
document.addEventListener('keydown', e => {
  if (location.hash !== '#quiz' || /INPUT|SELECT|TEXTAREA/.test(document.activeElement.tagName)) return;
  let n = Number(e.key);
  if (n >= 1 && n <= 6) {
    let b = app.querySelector(`[data-answer="${n - 1}"]`);
    if (b && !b.disabled) b.click();
  }
  if (e.key === 'Enter') ($('#check:not([style])') || $('#next'))?.click();
});
document.addEventListener('visibilitychange', () => {
  if (session) {
    accountTime();
    session.interruptions = session.interruptions || { count: 0, ms: 0 };
    if (document.hidden) {
      session.hiddenAt = Date.now();
      session.interruptions.count++;
    } else if (session.hiddenAt) {
      session.interruptions.ms += Date.now() - session.hiddenAt;
      session.hiddenAt = null;
    }
    session.paused = document.hidden;
    save();
    if (!document.hidden && session.deadline && Date.now() >= session.deadline) finish(true);
  }
});
window.addEventListener('beforeunload', () => {
  if (session) {
    accountTime();
    save();
  }
});
if (session) {
  if (session.hiddenAt) {
    session.interruptions = session.interruptions || { count: 0, ms: 0 };
    session.interruptions.ms += Date.now() - session.hiddenAt;
    session.hiddenAt = null;
  }
  session.entered = Date.now();
  session.paused = false;
  if (session.deadline && Date.now() >= session.deadline) finish(true);
  else render();
} else render();
