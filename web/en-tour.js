/* İngilizce tanıtım turu.
 * Uygulama Türkçe adaylar için yazıldı ve Türkçe kalır. Adres ?lang=en ile açıldığında (tur aynı sekmede
 * sürer, yeni ziyarette uygulama Türkçe açılır; ?lang=tr kapatır) İngilizce okuyan ziyaretçiye:
 *   1) her ekranın ne işe yaradığını anlatan bir rehber paneli,
 *   2) menü, sekme ve başlıkların altında küçük İngilizce karşılıklar,
 *   3) bir vitrin vakasının (Koru Distribution) tamamen İngilizce sürümü gösterilir.
 * İçerik (sorular, vakalar, raporlar) çevrilmez. Panel metinleri bu dosyadadır. */
(function (root) {
  'use strict';
  const KEY = 'aa_lang';
  const SHOWCASE = 'vardiya-darbogazi';
  // Tur yalnızca bu sekmede açık kalır (sessionStorage): yeni bir ziyarette uygulama yine Türkçe açılır.
  // Eski sürüm seçimi kalıcı tuttuğu için o kayıt silinir.
  let on = false;
  try {
    localStorage.removeItem(KEY);
    const q = new URLSearchParams(location.search).get('lang');
    if (q === 'en') sessionStorage.setItem(KEY, 'en');
    if (q === 'tr') sessionStorage.removeItem(KEY);
    on = sessionStorage.getItem(KEY) === 'en';
  } catch {
    on = false;
  }
  if (!on) return;
  root.AA_EN = true;
  const url = path => (root.AA_URL ? root.AA_URL(path) : path);

  /* ---------- 3) Vitrin vakası: katalogdaki kaydın yerine İngilizcesi ---------- */
  let showcase = null;
  const showcaseReady = fetch(url(`/cases/en/${SHOWCASE}.json`))
    .then(r => (r.ok ? r.json() : null))
    .then(x => (showcase = x))
    .catch(() => null);
  function swapCase() {
    const list = root.CASE_CATALOG;
    if (!showcase || !Array.isArray(list)) return;
    const i = list.findIndex(c => c.id === showcase.id);
    if (i >= 0 && list[i].lang !== 'en') list[i] = { ...list[i], ...showcase };
  }
  function hookContent() {
    const cc = root.CaseContent;
    if (!cc || cc.__en) return;
    const load = cc.load;
    cc.load = () => Promise.all([load(), showcaseReady]).then(swapCase);
    cc.__en = true;
  }

  /* ---------- 2) Küçük İngilizce karşılıklar ---------- */
  const GLOSS = {
    // Ana menü
    'Çalışma alanım': 'My workspace',
    'Hazırlık planım': 'My preparation plan',
    Atölyeler: 'Workshops',
    'Vaka Atölyesi': 'Case workshop',
    'Mülakat hazırlığı': 'Interview prep',
    Gelişimim: 'My progress',
    'Hesap ve ayarlar': 'Account and settings',
    'Nasıl çalışır?': 'How it works',
    '? Nasıl çalışır?': 'How it works',
    // Alt sekmeler
    'Deneyim örneklerim': 'My experience examples',
    'Mülakat dosyam': 'My interview file',
    Prova: 'Rehearsal',
    'CV ve ilan': 'CV and job posting',
    'Gelişim raporu': 'Progress report',
    'Modül sonuçları': 'Module results',
    'Hesabım ve teslimler': 'My account and submissions',
    'Hedef ve kayıtlar': 'Goal and records',
    // Mobil alt menü
    Çalışmam: 'My work',
    Plan: 'Plan',
    Vakalar: 'Cases',
    Mülakat: 'Interview',
    // Zihin Parkuru menüsü
    'Genel bakış': 'Overview',
    'Örüntü koçu': 'Pattern coach',
    'Pozisyon parkuru': 'Role track',
    Antrenmanlar: 'Drills',
    'Sınav provası': 'Mock exam',
    'Hata defterim': 'My error log',
    'Sınav rehberi': 'Exam guide',
    // Başlıklar
    'Hedefin belli olsun. İlk adımın da.': 'Know your goal. And your first step.',
    'Önce hedefini belirle': 'Set your goal first',
    'Nasıl ilerlersin?': 'How do you move forward?',
    'Çalışmaların bir bakışta': 'Your work at a glance',
    'Şirket vakalarında karar ver': 'Make decisions in company cases',
    'Deneyimini dayanağıyla anlat': 'Tell your experience with evidence',
    'Planın hedefinle başlar.': 'Your plan starts with your goal.',
    'Birlikte çalışan üç farklı atölye.': 'Three workshops that work together.',
    'Diğer hazırlık araçları': 'Other preparation tools',
    'İlk çalışma planın dört seçimle hazır.': 'Your first plan is ready in four choices.',
    'Bilgiyi incele. Kararını savun.': 'Study the information. Defend your decision.',
    'Önce kendi yaklaşımını yaz.': 'Write your own approach first.',
    'İlk çözümünden yeni bir vakaya ilerle': 'Move from your first solution to a new case',
    'Vaka havuzu': 'Case pool',
    '01 / Şirket bilgi dosyası': '01 / Company information file',
    '02 / Beklenen çıktılar': '02 / Expected outputs',
    '03 / Teslim sonrası inceleme': '03 / Review after submission',
    'Katkını somut bir olayla anlat.': 'Describe your contribution through a concrete event.',
    'Yeni deneyim örneği': 'New experience example',
    'Hazırlığını dayanağıyla göster.': 'Show your preparation with evidence.',
    'Görüşmeden önce anlatımını prova et.': 'Rehearse your story before the interview.',
    'Deneyimin aynı. Anlatımın daha açık.': 'Same experience. Clearer story.',
    'Neyi, neden çalışacağını gör.': 'See what to work on, and why.',
    'Hazırlığını ayrı dayanaklarla gör.': 'See your preparation through separate evidence.',
    'Çalışmanı koru. Geri bildirimle ilerle.': 'Keep your work. Improve with feedback.',
    'Planını kendine göre kur.': 'Set up your plan your way.',
    'Hazırlığını çalışmaya dönüştür.': 'Turn preparation into practice.',
    'Dosyanı dayanağıyla incele ve anlat.': 'Review and explain your file with evidence.',
    'Bir adım daha hızlı.': 'One step faster.',
    'Önce tanı. Sonra akıcı çöz.': 'Recognise first. Then solve fluently.',
    'İşte nasıl çalışmayı tercih ediyorsun?': 'How do you prefer to work?',
    'Bir seçeneğin ötesinde. Kararın ardındaki yaklaşım.':
      'Beyond an option. The approach behind the decision.',
    'Hangi role hazırlanıyorsun?': 'Which role are you preparing for?',
    'Yetkinlik havuzu': 'Competency pool',
    // Düğmeler
    'Hedefimi belirle →': 'Set my goal',
    'Planımı oluştur': 'Create my plan',
    'Dosyayı aç ↗': 'Open the file',
    'Bitirdim, referansla karşılaştır →': 'Done, compare with the reference',
    'Demo rolünü seç': 'Choose a demo role',
    'Kendi haritamı çıkar →': 'Map my own preferences',
    // Plan ekranı
    'Bugün bir adım daha hazır.': 'One step more ready today.',
    'Bugünün tüm adımları': 'All of today’s steps',
    'Teslimi incele. Ölçütle geri bildir.': 'Review the submission. Give criteria-based feedback.',
    // İK değerlendirme formu
    'Geri bildirim hazırla': 'Prepare feedback',
    '1. Ölçütler · her biri için bir seviye seç': '1. Criteria · choose a level for each',
    '2. Genel değerlendirme': '2. Overall assessment',
    '3. Çıktı bazında not': '3. Notes per output',
    '0 · Henüz yok': '0 · Not yet',
    '1 · Kısmen': '1 · Partly',
    '2 · Karşılanıyor': '2 · Met',
    '3 · Dayanaklı': '3 · Evidenced',
    'Ayrı süreç kapasitesi': 'Separate process capacity',
    'Yetkinlik ve kişi tutarlılığı': 'Skills and headcount consistency',
    'Kırılganlık ve kontrol': 'Fragility and control',
    'Uygulanabilir iletişim': 'Actionable communication',
    // Canlı demo girişi
    'Bir rol seç, şifresiz gir.': 'Pick a role, sign in without a password.',
    Aday: 'Candidate',
    'İK değerlendiricisi': 'HR reviewer',
    'Pilot yöneticisi': 'Pilot admin',
  };
  const norm = s =>
    s
      .replace(/^[◈◷▦◇◎↗⚙⌂↻▥▤←]\s*/, '')
      .replace(/\s+/g, ' ')
      .trim();
  function glossAll() {
    const sel =
      'aside nav a, .subnav a, .tabs a, .mobile-dock a, nav a, h1, h2, button.primary, a.btn.primary, button[name=role], details > summary, fieldset > legend, .levels label span, .crit > b, h4.review-step';
    // İngilizce vakada büyük harf dönüşümü Türkçe kurala göre yapılmasın (DİSTRİBUTİON → DISTRIBUTION).
    if (/^#cases\/vardiya-darbogazi/.test(location.hash))
      document.querySelectorAll('.eyebrow, .casetitle, .casebrief').forEach(el => (el.lang = 'en'));
    document.querySelectorAll(sel).forEach(el => {
      if (el.dataset.aaEn || el.closest('#aa-en-tour')) return;
      const text = norm(el.innerText || '');
      const en = GLOSS[text] || GLOSS[text.replace(/\s*[→↗]$/, '')];
      if (!en) return;
      el.dataset.aaEn = '1';
      const s = document.createElement('span');
      s.className = 'aa-en-gloss';
      s.lang = 'en';
      s.textContent = en;
      if (/^H[12]$/.test(el.tagName)) s.classList.add('aa-en-block');
      else if (el.closest('aside nav')) el.classList.add('aa-en-nav');
      el.appendChild(s);
    });
  }

  /* ---------- 1) Ekran rehberi ---------- */
  const INTRO =
    'Aday Atölyesi is a preparation workspace for people applying to jobs in Turkey, plus a review desk for HR. The interface and content are in Turkish on purpose: the aptitude tests, cases and interview prep follow the Turkish hiring context. This guide explains each screen as you move around.';
  const GUIDE = {
    home: {
      t: 'My workspace',
      p: 'The candidate’s home. The flow is goal → practice → case → feedback → revision → interview rehearsal. The big green card always shows the single next step for today.',
      try: 'Click “Hedefimi belirle” (Set my goal), pick a role and a date, and the daily plan is built.',
    },
    plan: {
      t: 'Preparation plan',
      p: 'A day-by-day plan built from the target role (20 roles), seniority, exam date and daily time. Each day has one clear next step instead of a long to-do list.',
    },
    start: {
      t: 'Quick start',
      p: 'Four choices — role, seniority, date, daily minutes — create the first plan. Everything is stored in this browser until you choose to save it to an account.',
    },
    modules: {
      t: 'Workshops',
      p: 'Three workshops that feed each other: aptitude practice (Zihin Parkuru), work-style preferences (Mizaç) and role-specific decision questions (Rol Atölyesi). Results are kept separate on purpose — the app never merges them into one candidate score.',
    },
    cases: {
      t: 'Case workshop',
      p: '20 fictional company cases at three levels. The candidate reads a company file (memos, tables, messages), writes the requested outputs, and only after submitting sees the reference solution and alternative defensible answers.',
      try: 'Open the English sample case below: a warehouse shift-planning problem with a hidden bottleneck.',
      showcase: true,
    },
    case: {
      t: 'Inside a case',
      p: 'Left: the company file (D01, D02…), each document with its own code so answers can cite evidence. Right: the numbered outputs with word counts, a timer and structure templates. Word and Excel workbooks can be downloaded and uploaded for HR review.',
      try: 'Write a short answer, press “Bitirdim, referansla karşılaştır” (Done, compare) and see the reference calculations, pitfalls and follow-up questions.',
    },
    showcase: {
      t: 'English sample case: Koru Distribution',
      p: 'This case is fully in English (documents, tables, Word/Excel workbooks and the reference solution). 900 small and 300 large orders, 11 people, last truck at 17:30. Total person-minutes look sufficient, but packing is 300 minutes short — the case tests whether the candidate sees process capacity separately and keeps the plan honest about its lack of buffer.',
      try: 'Submit an answer to unlock the reference: the calculations, two defensible staffing options, common pitfalls and a mid-shift update with 60 extra orders.',
    },
    examples: {
      t: 'Experience examples',
      p: 'Candidates record real events from their own work as source → decision → result, so interview answers rest on evidence rather than adjectives.',
    },
    dossier: {
      t: 'Interview file',
      p: 'Selected examples and case work are combined into one printable file. Candidate statements and fictional case work are labelled separately, and the app suggests the follow-up questions an HR specialist might ask.',
    },
    rehearsal: {
      t: 'Rehearsal',
      p: 'Pick an example or a case, answer out loud or in writing, get a follow-up question, and try again. Built to practise structure, not to memorise scripts.',
    },
    cv: {
      t: 'CV and job posting',
      p: 'Paste a CV and a job posting; the app checks the text for unsupported claims and missing evidence. No AI calls — the checks are rule-based and run in the browser.',
    },
    growth: {
      t: 'Progress report',
      p: 'Shows what to work on next and why, based on the candidate’s own answers. It deliberately says what the evidence does not show (for example, no hiring probability).',
    },
    results: {
      t: 'Module results',
      p: 'Exam performance, self-reported preferences and scenario choices are shown side by side as different kinds of evidence. There is no combined score.',
    },
    pilot: {
      t: 'Account, submissions and HR review',
      p: 'Here the candidate submits a case file and HR reviews it. In this public demo you can sign in without a password as a candidate, an HR reviewer or the pilot admin.',
      try: 'Choose “İK değerlendiricisi” (HR reviewer), open a sample submission and review it: each criterion gets a level from 0 to 3 with a written, evidence-based note per output. Levels are never turned into a single score. The admin can switch on blind review and assign submissions in bulk.',
    },
    signin: {
      t: 'Live demo sign-in',
      p: 'Pick a role — no password. Candidate: your own separate account. HR reviewer and pilot admin: shared demo accounts with sample submissions already loaded. Everything is wiped every night at 03:00 (Turkey time).',
      try: 'Choose “İK değerlendiricisi” (HR reviewer), open a sample submission and review it criterion by criterion.',
    },
    review: {
      t: 'HR review form',
      p: 'The reviewer opens the submitted file on screen, then rates each criterion of the case on four levels — 0 Not yet, 1 Partly, 2 Met, 3 Evidenced — with an optional evidence note (page, cell or short quote). An overall assessment and a note per numbered output follow. Levels are shown to the candidate per criterion and are never added up into a score.',
      try: 'Pick a level for each criterion and save the draft; the candidate sees nothing until the review is published.',
    },
    settings: {
      t: 'Goal and records',
      p: 'Change the target role and schedule, and back up or restore work. By default everything stays in the browser; saving to an account is optional.',
    },
    guide: {
      t: 'How it works',
      p: 'The in-app user guide: the four steps, the terms used and where data is stored.',
    },
    'file-work': {
      t: 'My file work',
      p: 'Work on a submitted file: compare revisions, read HR feedback and prepare how to explain the file in an interview.',
    },
    zihin: {
      t: 'Zihin Parkuru — aptitude practice',
      p: 'Numerical, verbal (Turkish), abstract and spatial reasoning practice across six skill areas, with a mock exam, a pattern coach and an error log that brings mistakes back for review. Verbal items rely on Turkish grammar, which is one reason the app stays in Turkish.',
    },
    mizac: {
      t: 'Mizaç — work-style preferences',
      p: '96 statements and 6 scenarios map how someone prefers to work. It is not a personality type or a pass/fail test; the report turns preferences into conversation points backed by real examples. A sample HR report (PDF) is available on the page.',
    },
    rol: {
      t: 'Rol Atölyesi — role decisions',
      p: '187 scenarios across 24 competencies, selected by target role. The candidate chooses an approach and writes the reasoning; keys are marked as drafts awaiting expert review.',
    },
  };
  function routeKey() {
    const path = location.pathname;
    if (/modules\/zihin/.test(path)) return 'zihin';
    if (/modules\/mizac/.test(path)) return 'mizac';
    if (/modules\/rol/.test(path)) return 'rol';
    if (document.querySelector('button[name=role]')) return 'signin';
    if (document.querySelector('details[open] fieldset.rubric')) return 'review';
    const h = location.hash.replace(/^#/, '');
    if (h.startsWith('cases/' + SHOWCASE)) return 'showcase';
    if (h.startsWith('cases/')) return 'case';
    const r = document.body.dataset.route || h.split('/')[0] || 'home';
    return GUIDE[r] ? r : 'home';
  }

  const CSS = `
  .aa-en-gloss{display:inline-block;margin-left:8px;font-size:11px;font-weight:500;letter-spacing:0;text-transform:none;opacity:.7;font-style:italic}
  [data-aa-en].aa-en-nav{flex-wrap:wrap}
  .aa-en-nav .aa-en-gloss{flex-basis:100%;margin:2px 0 0 28px;font-size:11px}
  .levels .aa-en-gloss{all:unset;display:block;margin-top:2px;font-size:11px;font-style:italic;font-weight:500;opacity:.75}
  .aa-en-gloss.aa-en-block{display:block;margin:4px 0 0;font-size:14px;line-height:1.3;opacity:.65}
  h1 .aa-en-gloss.aa-en-block{font-size:16px}
  #aa-en-tour{position:fixed;right:18px;bottom:18px;z-index:9999;width:min(370px,calc(100vw - 36px));background:#163d37;color:#f2f5ec;border-radius:16px;box-shadow:0 14px 40px rgba(0,0,0,.25);font:14px/1.5 system-ui,-apple-system,"Segoe UI",sans-serif}
  #aa-en-tour header{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:12px 14px 0}
  #aa-en-tour header b{font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:#dbe9a0}
  #aa-en-tour header button{min-height:0!important;line-height:1.4;background:transparent;border:1px solid rgba(255,255,255,.3);color:inherit;border-radius:8px;padding:2px 8px;font:inherit;font-size:12px;cursor:pointer}
  #aa-en-tour .aa-body{padding:6px 14px 14px}
  #aa-en-tour h3{margin:4px 0 6px;font-size:17px;color:#fff}
  #aa-en-tour p{margin:0 0 8px}
  #aa-en-tour .aa-try{background:rgba(219,233,160,.12);border-left:3px solid #dbe9a0;padding:8px 10px;border-radius:6px}
  #aa-en-tour a.aa-btn{display:inline-block;margin-top:4px;background:#dbe9a0;color:#163d37;font-weight:700;text-decoration:none;padding:8px 12px;border-radius:9px}
  #aa-en-tour .aa-foot{font-size:12px;opacity:.75;margin-top:8px}
  #aa-en-tour.aa-min .aa-body{display:none}
  #aa-en-tour.aa-min{width:auto}
  #aa-en-tour.aa-min header{padding:10px 12px}
  body{padding-bottom:120px}
  @media print{#aa-en-tour,.aa-en-gloss{display:none!important}}`;

  let panel;
  let lastKey = null;
  function render(force) {
    const k = routeKey();
    if (k === lastKey && force !== true) return;
    lastKey = k;
    const g = GUIDE[k];
    const first = !sessionStorage.getItem('aa_en_seen');
    const showcaseLink = location.pathname.includes('/modules/')
      ? url('/index.html#cases/' + SHOWCASE)
      : '#cases/' + SHOWCASE;
    panel.querySelector('.aa-body').innerHTML = `
      ${first ? `<p>${INTRO}</p>` : ''}
      <h3>${g.t}</h3>
      <p>${g.p}</p>
      ${g.try ? `<p class="aa-try"><b>Try this:</b> ${g.try}</p>` : ''}
      ${g.showcase || k === 'home' ? `<a class="aa-btn" href="${showcaseLink}">Open the English sample case →</a>` : ''}
      <p class="aa-foot">Small English labels under menus and headings are part of this guide. <a href="?lang=tr" style="color:#dbe9a0">Turn off</a></p>`;
    sessionStorage.setItem('aa_en_seen', '1');
  }
  function mount() {
    const style = document.createElement('style');
    style.textContent = CSS;
    document.head.appendChild(style);
    panel = document.createElement('aside');
    panel.id = 'aa-en-tour';
    panel.lang = 'en';
    panel.setAttribute('aria-label', 'English guide');
    panel.innerHTML = `<header><b>English guide</b><button type="button" aria-expanded="true">Hide</button></header><div class="aa-body"></div>`;
    const btn = panel.querySelector('button');
    const setMin = min => {
      panel.classList.toggle('aa-min', min);
      btn.textContent = min ? 'Show' : 'Hide';
      btn.setAttribute('aria-expanded', String(!min));
      try {
        localStorage.setItem('aa_en_min', min ? '1' : '');
      } catch {}
    };
    btn.addEventListener('click', () => setMin(!panel.classList.contains('aa-min')));
    // Aday yazmaya başlayınca panel küçülür, içeriğin üstünü kapatmaz (tercih kaydedilmez).
    document.addEventListener('focusin', e => {
      if (panel.contains(e.target) || !e.target.matches('input, textarea, select')) return;
      panel.classList.add('aa-min');
      btn.textContent = 'Show';
      btn.setAttribute('aria-expanded', 'false');
    });
    document.body.appendChild(panel);
    setMin(localStorage.getItem('aa_en_min') === '1');
    render();
    glossAll();
    let t;
    new MutationObserver(() => {
      clearTimeout(t);
      t = setTimeout(() => {
        glossAll();
        render();
      }, 60);
    }).observe(document.body, { childList: true, subtree: true });
    addEventListener('hashchange', () => setTimeout(render, 80));
    // Ana uygulama rotayı body.dataset.route ile işaretler
    new MutationObserver(render).observe(document.body, {
      attributes: true,
      attributeFilter: ['data-route'],
    });
  }

  hookContent();
  document.addEventListener('DOMContentLoaded', () => {
    hookContent();
    mount();
  });
})(window);
