// İK değerlendirme arayüzü: ölçüt seviyeli form, geri bildirim görünümü, dosya önizleme ve kuyruk yardımcıları.
(function (root) {
  'use strict';
  const e = s =>
    String(s ?? '').replace(
      /[&<>"']/g,
      c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]
    );
  const LEVELS = ['Henüz yok', 'Kısmen', 'Karşılanıyor', 'Dayanaklı'];
  const LEVEL_TEXT = [
    'Henüz gösterilmedi',
    'Kısmen: dayanak veya gerekçe eksik',
    'Karşılanıyor: sınırda açıklık var',
    'Dayanaklı biçimde karşılanıyor',
  ];
  // Teslimden sonra hedeflenen geri bildirim süresi (takvim günü). Pilot protokolündeki takvime göre değiştirilebilir.
  const TARGET_DAYS = 3;

  function rubric(me, r) {
    return me.rubrics?.find(c => c.id === r.case_id && c.version === r.version)?.rubric || [];
  }

  // ---- Değerlendirme formu ----
  function form(r, me) {
    const crit = rubric(me, r);
    const criteria = crit.length
      ? `<fieldset class="rubric"><legend>1. Ölçütler · her biri için bir seviye seç</legend><p class="muted">Seviyeler toplanmaz, tek puana dönüşmez. Adaya ölçüt bazında gösterilir.</p>${crit
          .map(
            (c, i) =>
              `<div class="crit"><b>${e(c.name)}</b><p class="muted">${e(c.evidence)}</p><div class="levels" role="radiogroup" aria-label="${e(c.name)}">${LEVELS.map(
                (l, n) =>
                  `<label title="${e(c.anchors?.[n] || LEVEL_TEXT[n])}"><input type="radio" name="crit${i}" value="${n}" required><span>${n} · ${l}</span></label>`
              ).join(
                ''
              )}</div><p class="anchor muted" data-anchor="${i}" aria-live="polite"></p><input name="critnote${i}" maxlength="600" placeholder="Dayanak (isteğe bağlı): sayfa, hücre veya kısa alıntı"></div>`
          )
          .join('')}</fieldset>`
      : '';
    return `<form data-review="${e(r.id)}" class="review-form">${criteria}<h4 class="review-step">${crit.length ? '2' : '1'}. Genel değerlendirme</h4><label class="field"><span class="sr-only">Genel değerlendirme</span><textarea name="summary" rows="3" required maxlength="4000" placeholder="İki üç cümle: en güçlü yan ve öncelikli gelişim alanı"></textarea></label><h4 class="review-step">${crit.length ? '3' : '2'}. Çıktı bazında not</h4>${r.outputs
      .map(
        (o, i) =>
          `<div class="review-output"><b>${i + 1}. ${e(o)}</b><label class="field">Gözlem<textarea name="observation${i}" rows="2" required maxlength="4000"></textarea></label><div class="grid2"><label class="field">Dayanak · sayfa / hücre<input name="evidence${i}" required maxlength="4000"></label><label class="field">Sonraki adım<input name="next${i}" required maxlength="4000"></label></div></div>`
      )
      .join(
        ''
      )}<div class="actions"><button type="button" data-review-save="${e(r.id)}">Taslağı hesabıma kaydet</button><button class="primary">Geri bildirimi yayımla</button></div></form>`;
  }
  function bindForm(formEl, r, me) {
    const crit = rubric(me, r);
    const paint = i => {
      const v = formEl.elements['crit' + i]?.value,
        out = formEl.querySelector(`[data-anchor="${i}"]`);
      if (out) out.textContent = v === '' || v === undefined ? '' : crit[i].anchors?.[v] || LEVEL_TEXT[v];
    };
    crit.forEach((_, i) => paint(i));
    formEl.addEventListener('change', ev => {
      const m = /^crit(\d+)$/.exec(ev.target.name || '');
      if (m) paint(Number(m[1]));
    });
  }
  function collect(formEl, r, me) {
    const f = new FormData(formEl),
      crit = rubric(me, r);
    return {
      id: r.id,
      summary: f.get('summary'),
      items: r.outputs.map((o, i) => ({
        observation: f.get('observation' + i),
        evidence: f.get('evidence' + i),
        next: f.get('next' + i),
      })),
      ...(crit.length
        ? {
            criteria: crit.map((c, i) => {
              const v = f.get('crit' + i);
              return { level: v === null || v === '' ? null : Number(v), note: f.get('critnote' + i) || '' };
            }),
          }
        : {}),
    };
  }
  function fill(formEl, draft) {
    formEl.elements.summary.value = draft.summary || '';
    (draft.items || []).forEach((item, i) => {
      for (const k of ['observation', 'evidence', 'next'])
        if (formEl.elements[k + i]) formEl.elements[k + i].value = item[k] || '';
    });
    (draft.criteria || []).forEach((c, i) => {
      if (formEl.elements['crit' + i] && c.level !== null)
        formEl.elements['crit' + i].value = String(c.level);
      if (formEl.elements['critnote' + i]) formEl.elements['critnote' + i].value = c.note || '';
    });
    formEl.dispatchEvent(new Event('change'));
    formEl
      .querySelectorAll('[name^="crit"]')
      .forEach(x => x.dispatchEvent(new Event('change', { bubbles: true })));
  }

  // ---- Yayımlanan geri bildirimin görünümü (aday ve değerlendirici) ----
  function feedback(fb) {
    const crit = fb.criteria?.length
      ? `<div class="crit-result"><h4>Ölçütler</h4>${fb.criteria
          .map(
            c =>
              `<div class="crit-row"><span>${e(c.name)}</span><span class="levelbar" aria-label="${c.level} / 3"><i style="width:${(100 * c.level) / 3}%"></i></span><b>${e(LEVEL_TEXT[c.level])}</b>${c.note ? `<small>${e(c.note)}</small>` : ''}</div>`
          )
          .join(
            ''
          )}<p class="muted">Seviyeler ölçüt bazındadır; toplanmaz ve işe uygunluk puanı değildir.</p></div>`
      : '';
    return `<p>${e(fb.summary)}</p>${crit}${fb.items
      .map(
        (x, i) =>
          `<h4>${i + 1}. ${e(x.output)}</h4><p><b>Gözlem:</b> ${e(x.observation)}</p><p><b>Dosyadaki dayanak:</b> ${e(x.evidence)}</p><p><b>Sonraki adım:</b> ${e(x.next)}</p>`
      )
      .join('')}`;
  }

  // ---- Kuyruk yardımcıları ----
  function ageDays(r, now = Date.now()) {
    return Math.max(0, Math.floor((now - Date.parse(r.created)) / 86400000));
  }
  function waitLabel(r, now = Date.now()) {
    if (r.feedback) return '';
    const d = ageDays(r, now),
      late = d >= TARGET_DAYS;
    return `<span class="tag ${late ? 'late' : ''}">${d === 0 ? 'Bugün geldi' : d + ' gündür bekliyor'}${late ? ' · hedef süre aşıldı' : ''}</span>`;
  }
  // Bekleyenler en eskiden yeniye, ardından geri bildirimi verilenler yeniden eskiye.
  function sortQueue(rows) {
    return rows.slice().sort((a, b) => {
      if (!a.feedback !== !b.feedback) return a.feedback ? 1 : -1;
      return a.feedback ? b.created.localeCompare(a.created) : a.created.localeCompare(b.created);
    });
  }

  // ---- Dosya önizleme ----
  // Aday dosyası tarayıcıda, betik çalıştıramayan bir iframe içinde gösterilir.
  const frame = html =>
    `<iframe class="file-preview" sandbox="" referrerpolicy="no-referrer" title="Dosya önizlemesi" srcdoc="${e(
      `<!doctype html><meta charset="utf-8"><style>body{font:14px/1.55 system-ui,sans-serif;margin:18px;color:#193d36}table{border-collapse:collapse;margin:8px 0 18px;font-size:13px}td,th{border:1px solid #cfd8cb;padding:4px 8px;vertical-align:top}h2.sheet{font-size:15px;margin:18px 0 4px}img{max-width:100%}</style>${html}`
    )}"></iframe>`;
  let mammothLoad = null;
  function loadMammoth() {
    if (root.mammoth) return Promise.resolve(root.mammoth);
    mammothLoad =
      mammothLoad ||
      new Promise((ok, no) => {
        const s = document.createElement('script');
        s.src = root.AA_URL
          ? root.AA_URL('/vendor/mammoth.browser.min.js')
          : '/vendor/mammoth.browser.min.js';
        s.onload = () => ok(root.mammoth);
        s.onerror = () => {
          mammothLoad = null;
          no(Error('Word önizleyicisi yüklenemedi.'));
        };
        document.head.appendChild(s);
      });
    return mammothLoad;
  }
  // Küçük ZIP okuyucu: yalnız XLSX içindeki XML dosyaları için. Büyük veya şifreli girdiyi reddeder.
  async function unzip(buf) {
    const v = new DataView(buf),
      out = new Map();
    let eocd = -1;
    for (let i = buf.byteLength - 22; i >= Math.max(0, buf.byteLength - 65557); i--)
      if (v.getUint32(i, true) === 0x06054b50) {
        eocd = i;
        break;
      }
    if (eocd < 0) throw Error('Dosya okunamadı.');
    let p = v.getUint32(eocd + 16, true);
    const count = v.getUint16(eocd + 10, true),
      dec = new TextDecoder();
    for (let n = 0; n < count; n++) {
      if (v.getUint32(p, true) !== 0x02014b50) throw Error('Dosya okunamadı.');
      const flags = v.getUint16(p + 8, true),
        method = v.getUint16(p + 10, true),
        csize = v.getUint32(p + 20, true),
        usize = v.getUint32(p + 24, true),
        nlen = v.getUint16(p + 28, true),
        elen = v.getUint16(p + 30, true),
        clen = v.getUint16(p + 32, true),
        local = v.getUint32(p + 42, true),
        name = dec.decode(new Uint8Array(buf, p + 46, nlen));
      p += 46 + nlen + elen + clen;
      if (!/\.(xml|rels)$/.test(name)) continue;
      if (flags & 1) throw Error('Şifreli dosya önizlenemez.');
      if (usize > 15 * 1048576) throw Error('Dosya önizleme için çok büyük; indirerek incele.');
      const start = local + 30 + v.getUint16(local + 26, true) + v.getUint16(local + 28, true),
        data = new Uint8Array(buf, start, csize);
      if (method === 0) out.set(name, dec.decode(data));
      else if (method === 8)
        out.set(
          name,
          await new Response(
            new Blob([data]).stream().pipeThrough(new DecompressionStream('deflate-raw'))
          ).text()
        );
    }
    return out;
  }
  async function xlsxHtml(buf) {
    const files = await unzip(buf),
      xml = s => new DOMParser().parseFromString(s || '<x/>', 'application/xml'),
      wb = xml(files.get('xl/workbook.xml')),
      rels = xml(files.get('xl/_rels/workbook.xml.rels')),
      shared = [...xml(files.get('xl/sharedStrings.xml')).getElementsByTagNameNS('*', 'si')].map(si =>
        [...si.getElementsByTagNameNS('*', 't')].map(t => t.textContent).join('')
      );
    const target = id => {
      const t =
        [...rels.getElementsByTagNameNS('*', 'Relationship')]
          .find(r => r.getAttribute('Id') === id)
          ?.getAttribute('Target') || '';
      return t.startsWith('/') ? t.slice(1) : 'xl/' + t.replace(/^\.\//, '');
    };
    const col = ref => {
      let n = 0;
      for (const ch of ref.replace(/\d+/g, '')) n = n * 26 + ch.charCodeAt(0) - 64;
      return n - 1;
    };
    let html = '';
    for (const sheet of [...wb.getElementsByTagNameNS('*', 'sheet')].slice(0, 20)) {
      const doc = xml(
          files.get(
            target(
              sheet.getAttributeNS(
                'http://schemas.openxmlformats.org/officeDocument/2006/relationships',
                'id'
              )
            )
          )
        ),
        grid = [];
      let maxCol = 0;
      for (const row of [...doc.getElementsByTagNameNS('*', 'row')].slice(0, 300)) {
        const r = Number(row.getAttribute('r')) - 1;
        if (!(r >= 0) || r > 299) continue;
        for (const c of row.getElementsByTagNameNS('*', 'c')) {
          const i = col(c.getAttribute('r') || 'A1');
          if (i > 40) continue;
          const t = c.getAttribute('t'),
            raw = c.getElementsByTagNameNS('*', 'v')[0]?.textContent ?? '',
            val =
              t === 's'
                ? (shared[Number(raw)] ?? '')
                : t === 'inlineStr'
                  ? [...c.getElementsByTagNameNS('*', 't')].map(x => x.textContent).join('')
                  : t === 'b'
                    ? raw === '1'
                      ? 'DOĞRU'
                      : 'YANLIŞ'
                    : raw;
          (grid[r] = grid[r] || [])[i] = val;
          maxCol = Math.max(maxCol, i);
        }
      }
      html += `<h2 class="sheet">${e(sheet.getAttribute('name'))}</h2>${
        grid.length
          ? `<table>${Array.from({ length: grid.length }, (_, r) => `<tr>${Array.from({ length: maxCol + 1 }, (_, c) => `<td>${e(grid[r]?.[c] ?? '')}</td>`).join('')}</tr>`).join('')}</table>`
          : '<p>Bu sayfa boş.</p>'
      }`;
    }
    return (
      html +
      '<p style="color:#68776e">Önizleme değerleri gösterir; formüller ve biçim için dosyayı indir. İlk 300 satır ve 40 sütun gösterilir.</p>'
    );
  }
  async function preview(box, r) {
    box.innerHTML = '<p class="muted" role="status">Dosya açılıyor…</p>';
    try {
      const res = await fetch('/api/pilot?op=file&id=' + encodeURIComponent(r.id), {
        credentials: 'same-origin',
      });
      if (!res.ok) throw Error('Dosya alınamadı.');
      const buf = await res.arrayBuffer(),
        ext = String(r.name).toLowerCase().split('.').at(-1);
      if (ext === 'pdf') {
        const url = URL.createObjectURL(new Blob([buf], { type: 'application/pdf' }));
        box.innerHTML = `<iframe class="file-preview" title="PDF önizlemesi" src="${url}"></iframe>`;
      } else if (ext === 'docx') {
        const m = await loadMammoth(),
          out = await m.convertToHtml({ arrayBuffer: buf });
        box.innerHTML = frame(out.value || '<p>Belgede metin bulunamadı.</p>');
      } else if (ext === 'xlsx') box.innerHTML = frame(await xlsxHtml(buf));
      else throw Error('Bu dosya türü önizlenemiyor.');
    } catch (err) {
      box.innerHTML = `<p class="danger">${e(err.message)} Dosyayı indirerek inceleyebilirsin.</p>`;
    }
  }

  root.ReviewUI = {
    form,
    bindForm,
    collect,
    fill,
    feedback,
    waitLabel,
    sortQueue,
    ageDays,
    preview,
    xlsxHtml,
    TARGET_DAYS,
    LEVEL_TEXT,
  };
})(typeof window === 'undefined' ? globalThis : window);
