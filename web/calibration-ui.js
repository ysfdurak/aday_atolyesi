// Değerlendirici kalibrasyonu: iki değerlendirici aynı sentetik teslimi ölçüt bazında bağımsız puanlar;
// fark hangi ölçütten geliyorsa orada konuşulur (OPM yapılandırılmış değerlendirme yaklaşımı).
// Sentetik teslim, ölçütlerin zayıf/yeterli/güçlü örnek cevaplarından kurulur. Örnekler uzman incelemesi
// bekleyen taslaktır; referans seviye "doğru cevap" değil, tartışmayı başlatan dayanaktır.
// Kayıt yalnız bu tarayıcıda: aa-kalibrasyon-v1.
(function (root) {
  'use strict';
  const KEY = 'aa-kalibrasyon-v1';
  const LEVELS = ['Henüz yok', 'Kısmen', 'Karşılanıyor', 'Dayanaklı'];
  const NAMES = ['zayıf', 'yeterli', 'güçlü'];
  const e = s =>
    String(s ?? '').replace(
      /[&<>"']/g,
      c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]
    );
  const ex = () => root.RUBRIC_EXAMPLES || { cases: {} };
  const cases = () => (root.CASE_CATALOG || []).filter(c => ex().cases[c.id]);
  const draftTag = () =>
    `<span class="draft-tag">${e(ex().statusLabel || 'Uzman incelemesi bekleyen taslak')}</span>`;

  function load() {
    try {
      const v = JSON.parse(localStorage.getItem(KEY) || 'null');
      return v && typeof v === 'object' && !Array.isArray(v) ? v : {};
    } catch {
      return {};
    }
  }
  function save(v) {
    try {
      localStorage.setItem(KEY, JSON.stringify(v));
    } catch {
      /* Depolama kapalıysa puanlar yalnız bu ekranda kalır. */
    }
  }

  // Sentetik teslim: her ölçüt için bir örnek cevap seçilir. Seçim vaka sırasına bağlı ve sabittir;
  // böylece iki değerlendirici aynı metni görür.
  function synthetic(c) {
    const i = cases().indexOf(c),
      bank = ex().cases[c.id] || {};
    return c.rubric.map((r, k) => {
      const lv = ((k * 2 + i) % 3) + 1;
      return { name: r.name, evidence: r.evidence, level: lv, text: (bank[r.name] || [])[lv - 1] || '' };
    });
  }

  // Karşılaştırma: ölçüt bazında fark; toplam puan üretilmez.
  function compare(items, a, b) {
    const rows = items.map((it, k) => {
      const x = a[k],
        y = b[k],
        done = Number.isInteger(x) && Number.isInteger(y);
      return { ...it, a: x, b: y, diff: done ? Math.abs(x - y) : null, done };
    });
    const done = rows.filter(r => r.done),
      max = done.length ? Math.max(...done.map(r => r.diff)) : null;
    return {
      rows,
      complete: done.length === rows.length,
      agree: done.filter(r => r.diff === 0).length,
      source: max ? done.filter(r => r.diff === max) : [],
      max,
    };
  }

  function resultHTML(items, s) {
    const cmp = compare(items, s.a || [], s.b || []);
    return cmp.complete
      ? `<section class="card cal-result" aria-labelledby="cal-sonuc"><h2 id="cal-sonuc">Fark nereden geliyor?</h2><p>${
          cmp.max === 0
            ? `İki değerlendirici ${items.length} ölçütün hepsinde aynı seviyeyi seçti.`
            : `${cmp.agree}/${items.length} ölçütte aynı seviye. En büyük fark (${cmp.max} seviye): <b>${cmp.source.map(r => e(r.name)).join(', ')}</b>. Konuşmayı bu ölçütün dayanağıyla başlatın: teslimdeki hangi cümle, hangi seviye tanımına uyuyor?`
        }</p><div class="tablewrap" tabindex="0"><table><thead><tr><th>Ölçüt</th><th>A</th><th>B</th><th>Fark</th><th>Taslak referans ${draftTag()}</th></tr></thead><tbody>${cmp.rows
          .map(
            r =>
              `<tr class="${r.diff >= 2 ? 'cal-big' : r.diff === 1 ? 'cal-small' : ''}"><td>${e(r.name)}</td><td>${r.a}</td><td>${r.b}</td><td>${r.diff === 0 ? 'Aynı' : r.diff + ' seviye'}</td><td>${r.level} · ${NAMES[r.level - 1]} örneği</td></tr>`
          )
          .join(
            ''
          )}</tbody></table></div><p class="muted">Seviyeler toplanmaz; fark ölçüt bazında okunur. Referans, sentetik cümlenin hangi örnekten alındığını gösterir. Örnekler uzman incelemesi bekleyen taslaktır; referans tartışmayı kapatan doğru cevap sayılmaz.</p></section>`
      : `<p class="muted cal-wait" role="status">Karşılaştırma iki değerlendirici bütün ölçütleri puanlayınca açılır (${cmp.rows.filter(r => r.done).length}/${items.length} ölçüt tamam).</p>`;
  }

  function view() {
    const list = cases();
    if (!list.length)
      return '<section class="card"><h1>Değerlendirici kalibrasyonu</h1><p>Vaka içeriği yüklenemedi.</p></section>';
    const st = load(),
      id = list.some(c => c.id === st.case) ? st.case : list[0].id,
      c = list.find(x => x.id === id),
      items = synthetic(c),
      s = (st.scores && st.scores[id]) || { a: [], b: [] };
    const rater = key =>
      `<fieldset class="cal-rater" data-rater="${key}"><legend>Değerlendirici ${key.toUpperCase()}</legend>${items
        .map(
          (it, k) =>
            `<div class="cal-crit"><b>${k + 1}. ${e(it.name)}</b><div class="levels" role="radiogroup" aria-label="Değerlendirici ${key.toUpperCase()} · ${e(it.name)}">${LEVELS.map(
              (l, n) =>
                `<label><input type="radio" name="${key}${k}" value="${n}" ${(s[key] || [])[k] === n ? 'checked' : ''}><span>${n} · ${l}</span></label>`
            ).join('')}</div></div>`
        )
        .join('')}</fieldset>`;
    return `<span class="eyebrow">İK incelemesi · kalibrasyon</span><h1>Aynı teslim, iki değerlendirici.</h1><p class="muted">Yapılandırılmış değerlendirmede herkes aynı ölçeği ve aynı örnekleri kullanır; önce bağımsız puanlar, sonra farkı ölçüt üzerinden konuşursunuz. Bu ekran kurgusal bir teslimle o alıştırmayı yapar; gerçek aday verisi kullanılmaz.</p>
<section class="card"><label class="field">Vaka<select id="cal-case">${list.map(x => `<option value="${e(x.id)}" ${x.id === id ? 'selected' : ''}>${e(x.title)}</option>`).join('')}</select></label>
<h2>Sentetik teslim ${draftTag()}</h2><p class="muted">Aday notundan alınmış gibi yazılmış, ölçüt başına bir paragraf. Hangi örnekten geldiği karşılaştırmadan sonra görünür.</p><ol class="cal-submission">${items.map(it => `<li><span class="muted">${e(it.name)}</span><p>“${e(it.text)}”</p></li>`).join('')}</ol></section>
<div class="grid2 cal-raters">${rater('a')}${rater('b')}</div>
<div class="actions"><button type="button" id="cal-sample">Örnek puanlarla doldur</button><button type="button" id="cal-reset">Puanları temizle</button><a class="btn" href="#pilot">İK incelemesine dön</a></div>
<div id="cal-out" aria-live="polite">${resultHTML(items, s)}</div>
<details class="card"><summary>Bu vakanın örnek cevapları ${draftTag()}</summary>${c.rubric.map(r => examples(c.id, r.name)).join('')}</details>`;
  }

  // Bir ölçütün zayıf / yeterli / güçlü örnekleri (değerlendirme formu da kullanır).
  function examples(caseId, name) {
    const list = ex().cases[caseId]?.[name];
    if (!list) return '';
    return `<div class="crit-examples"><b>${e(name)}</b><dl>${list
      .map((t, i) => `<dt>${i + 1} · ${NAMES[i]}</dt><dd>${e(t)}</dd>`)
      .join('')}</dl></div>`;
  }
  function formExamples(caseId, name) {
    const body = examples(caseId, name);
    return body
      ? `<details class="crit-examples-box"><summary>Zayıf, yeterli ve güçlü cevap örnekleri ${draftTag()}</summary>${body}</details>`
      : '';
  }

  function bind(host) {
    const sel = host.querySelector('#cal-case');
    if (!sel) return;
    const id = sel.value,
      items = synthetic(cases().find(x => x.id === id));
    const scores = () => (load().scores || {})[id] || { a: [], b: [] };
    const put = s => {
      const cur = load();
      save({ ...cur, case: id, scores: { ...(cur.scores || {}), [id]: s } });
    };
    // Yalnız karşılaştırma bölümü yenilenir; sayfa kaymaz, odak seçilen düğmede kalır.
    const refresh = () => {
      const s = scores();
      host.querySelectorAll('.cal-rater input').forEach(inp => {
        inp.checked = (s[inp.name[0]] || [])[Number(inp.name.slice(1))] === Number(inp.value);
      });
      host.querySelector('#cal-out').innerHTML = resultHTML(items, s);
    };
    sel.onchange = () => {
      save({ ...load(), case: sel.value });
      root.dispatchEvent(new HashChangeEvent('hashchange'));
    };
    host.querySelectorAll('.cal-rater input').forEach(inp => {
      inp.onchange = () => {
        const s = scores(),
          key = inp.name[0];
        s[key] = [...(s[key] || [])];
        s[key][Number(inp.name.slice(1))] = Number(inp.value);
        put(s);
        refresh();
      };
    });
    host.querySelector('#cal-sample').onclick = () => {
      // A referansla aynı; B iki ölçütte sapar (biri iki seviye). Fark kaynağını göstermek için sabit örnek.
      put({
        a: items.map(it => it.level),
        b: items.map((it, k) =>
          k === 0
            ? it.level >= 2
              ? it.level - 2
              : it.level + 2
            : k === 2
              ? it.level === 3
                ? 2
                : it.level + 1
              : it.level
        ),
      });
      refresh();
    };
    host.querySelector('#cal-reset').onclick = () => {
      put({ a: [], b: [] });
      refresh();
    };
  }

  // Aday için puanlanmış örnek teslim: aynı sentetik teslim, her ölçütte verilen düzey, nedeni (seviye tanımı)
  // ve bir üst düzeyin nasıl göründüğü. İlk girişte sayaçlar sıfırken "iyi cevap neye benzer?" sorusunu cevaplar.
  function sampleView() {
    const list = cases();
    if (!list.length)
      return '<section class="card"><h1>Puanlanmış örnek teslim</h1><p>Vaka içeriği yüklenemedi.</p></section>';
    const c = list[0],
      items = synthetic(c),
      bank = ex().cases[c.id] || {};
    const rows = items
      .map((it, k) => {
        const r = c.rubric[k] || {},
          an = r.anchors || [],
          up = it.level < 3 ? (bank[it.name] || [])[it.level] : '';
        return `<li class="sample-crit"><div class="sample-head"><b>${k + 1}. ${e(it.name)}</b><span class="tag lv${it.level}">${it.level} · ${LEVELS[it.level]}</span></div>
<p class="sample-text">“${e(it.text)}”</p>
<p><b>Neden bu düzey?</b> ${e(an[it.level] || (it.level === 1 ? 'Konuya değinilmiş ama dayanak ya da gerekçe eksik.' : it.level === 2 ? 'Ölçüt karşılanıyor; varsayım ya da sınır açık kalmış.' : 'Ölçüt dayanaklı biçimde karşılanıyor.'))}</p>
${r.evidence ? `<p class="muted"><b>Bu ölçütte aranan:</b> ${e(r.evidence)}</p>` : ''}
${up ? `<details><summary>Bir üst düzey (${it.level + 1} · ${LEVELS[it.level + 1]}) nasıl görünür?</summary><p>“${e(up)}”</p>${an[it.level + 1] ? `<p class="muted">${e(an[it.level + 1])}</p>` : ''}</details>` : '<p class="muted">Bu ölçütte en üst düzey.</p>'}</li>`;
      })
      .join('');
    return `<span class="eyebrow">Örnek · puanlanmış teslim</span><h1>İyi bir cevap<br><em>neye benzer?</em></h1><p class="muted">Kurgusal bir adayın “${e(c.title)}” vakasına verdiği cevap. Her ölçüt ayrı puanlanır; puanlar toplanmaz. Her satırda verilen düzeyi, nedenini ve bir üst düzeyin nasıl göründüğünü gör.</p>
<section class="card"><p>${draftTag()} Ölçek: ${LEVELS.map((l, n) => n + ' · ' + l).join(' · ')}</p><ol class="sample-list">${rows}</ol></section>
<div class="actions"><a class="btn primary" href="#cases">Kendi vakana başla</a><a class="btn" href="#home">Ana sayfaya dön</a></div>`;
  }

  root.CalibrationUI = { view, bind, synthetic, compare, examples, formExamples, sampleView, KEY };
})(typeof window !== 'undefined' ? window : globalThis);
