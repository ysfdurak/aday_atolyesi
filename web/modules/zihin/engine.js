(function (root) {
  'use strict';
  const R = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a,
    pick = a => a[R(0, a.length - 1)],
    shuffle = a => {
      let v = a.slice();
      for (let i = v.length - 1; i > 0; i--) {
        let j = R(0, i);
        [v[i], v[j]] = [v[j], v[i]];
      }
      return v;
    };
  const cats = [
    ['num', 'Sayısal mantık', '123', '#715bf4', 'Birleşik kuralları ve gizli dizileri çöz.'],
    ['shape', 'Soyut ve görsel mantık', '◈', '#e99a37', 'Matrisleri ve çok özellikli dönüşümleri çöz.'],
    ['verbal', 'Sözel muhakeme', 'Aa', '#379aa0', 'Koşulları, varsayımları ve çıkarımları ayır.'],
    ['attention', 'Dikkat ve veri kontrolü', '⌕', '#d86e94', 'Yoğun veride kurala göre farkları yakala.'],
    ['quant', 'Sayısal veri analizi', '%', '#4a82d5', 'Tabloları, oranları ve çok adımlı hesapları çöz.'],
    ['logic', 'Analitik mantık', '⇄', '#669447', 'Birden fazla kısıtı birlikte değerlendir.'],
  ].map(([id, name, icon, color, desc]) => ({ id, name, icon, color, desc }));
  const typeNames = {
    num: [
      'İşlem döngüleri',
      'İç içe diziler ve çiftler',
      'Farkların örüntüsü',
      'Önceki terimden üretim',
      'Özel sayı yapıları',
      'Hatalı terimi bul',
    ],
    shape: [
      'Birleşim matrisi',
      'Çok özellikli dönüşüm',
      'Latin kare',
      'Döndür ve birleştir',
      'Aynalama ilişkisi',
      'Kural makinesi',
      'Katlama ve delik açma',
      'Küp döndürme',
      'Göreli yön ve yol izleme',
    ],
    verbal: [
      'Politika ve istisna',
      'Nicelik ve yargı',
      'Kesin çıkarım',
      'Argüman değerlendirme',
      'Paragraf sıralama',
      'Anlam ve kapsam',
    ],
    attention: [
      'Kayıt karşılaştırma',
      'Koşullu sınıflandırma',
      'Örtüşen örüntü tarama',
      'Çok kriterli sayım',
      'Normalleştirme kontrolü',
      'Öncelik ve istisna',
    ],
    quant: [
      'Ağırlıklı performans',
      'Ardışık değişim',
      'Kapasite ve kayıp süre',
      'Kur ve birim dönüşümü',
      'Karışım ve ağırlıklı ortalama',
      'Veri yeterliliği',
    ],
    logic: [
      'Kısıtlı sıralama',
      'Görev eşleştirme',
      'Kaynaklı çizelgeleme',
      'Doğru ve yanlış ifadeler',
      'Kümeler ve kesişimler',
      'Bağımlılık ve kritik yol',
    ],
  };
  const labels = ['A', 'B', 'C', 'D', 'E', 'F', 'G'],
    num = n => Number(n.toFixed(2)).toLocaleString('tr-TR', { maximumFractionDigits: 2 }),
    seq = v => '<div class="sequence">' + v.map(x => `<span class="seqbox">${x}</span>`).join('') + '</div>',
    table = (head, rows) =>
      '<div class="tablewrap"><table><thead><tr>' +
      head.map(x => `<th>${x}</th>`).join('') +
      '</tr></thead><tbody>' +
      rows.map(r => '<tr>' + r.map(x => `<td>${x}</td>`).join('') + '</tr>').join('') +
      '</tbody></table></div>',
    pass = s => `<div class="passage">${s}</div>`,
    matrix = a => '<div class="matrix">' + a.map(x => `<span>${x}</span>`).join('') + '</div>';
  const round = (n, d = 2) => Math.round(n * 10 ** d) / 10 ** d;
  function hash(s) {
    let a = 2166136261,
      b = 5381;
    for (let i = 0; i < s.length; i++) {
      a = Math.imul(a ^ s.charCodeAt(i), 16777619);
      b = Math.imul(b, 33) ^ s.charCodeAt(i);
    }
    return (a >>> 0).toString(16) + (b >>> 0).toString(16);
  }
  function maskSvg(m) {
    return `<svg viewBox="0 0 72 72" width="64" height="64" role="img" aria-label="${Array.from({ length: 9 }, (_, i) => (m >> i) & 1).join('')} desenli kare">${Array.from({ length: 9 }, (_, i) => `<rect x="${5 + (i % 3) * 22}" y="${5 + Math.floor(i / 3) * 22}" width="18" height="18" rx="3" fill="${(m >> i) & 1 ? '#356b50' : '#e5e9df'}"/>`).join('')}</svg>`;
  }
  function transform(m, kind) {
    let o = 0;
    for (let r = 0; r < 3; r++)
      for (let c = 0; c < 3; c++)
        if ((m >> (r * 3 + c)) & 1) {
          let [rr, cc] = kind === 'rot' ? [c, 2 - r] : kind === 'mirror' ? [r, 2 - c] : [2 - r, c];
          o |= 1 << (rr * 3 + cc);
        }
    return o;
  }
  const rot = (m, n = 1) => {
    for (let i = 0; i < n; i++) m = transform(m, 'rot');
    return m;
  };
  function glyph(dir, count, fill) {
    return `<svg viewBox="0 0 72 72" width="62" height="62" role="img" aria-label="Yön ${dir * 90} derece; ${count} nokta; ${fill ? 'dolu' : 'boş'} elmas"><g transform="rotate(${dir * 90} 36 36)"><path d="M36 7L47 23H25Z" fill="#356b50"/></g><path d="M36 27L47 38L36 49L25 38Z" fill="${fill ? '#356b50' : 'none'}" stroke="#356b50" stroke-width="2"/>${Array.from({ length: count }, (_, i) => `<circle cx="${36 - (count - 1) * 6 + i * 12}" cy="61" r="3.5" fill="#b58b40"/>`).join('')}</svg>`;
  }
  const perms = a =>
    a.length === 1 ? [a] : a.flatMap((x, i) => perms(a.filter((_, j) => j !== i)).map(t => [x, ...t]));
  function constrained(n = 5) {
    let names = shuffle(['Ada', 'Bora', 'Cem', 'Duru', 'Ece', 'Fırat']).slice(0, n),
      hidden = shuffle(names),
      all = perms(names),
      valid = all,
      cons = [],
      used = new Set();
    let count = 0;
    while (valid.length > 1 && count++ < 100) {
      let a = pick(names),
        b = pick(names.filter(x => x !== a)),
        pa = hidden.indexOf(a),
        pb = hidden.indexOf(b),
        kind = R(0, 3),
        text,
        fn,
        key;
      if (kind === 0) {
        if (pa > pb) [a, b] = [b, a];
        text = `${a}, ${b} kişisinden önce gelir.`;
        fn = p => p.indexOf(a) < p.indexOf(b);
        key = 'before' + a + b;
      }
      if (kind === 1) {
        let d = Math.abs(pa - pb);
        text = `${a} ile ${b} arasında ${d - 1} kişi vardır.`;
        fn = p => Math.abs(p.indexOf(a) - p.indexOf(b)) === d;
        key = 'gap' + [a, b].sort().join('') + d;
      }
      if (kind === 2) {
        let pos = R(0, n - 1);
        if (pos === pa) continue;
        text = `${a}, ${pos + 1}. sırada değildir.`;
        fn = p => p.indexOf(a) !== pos;
        key = 'not' + a + pos;
      }
      if (kind === 3) {
        let d = pb - pa;
        text = `${b}, ${a} kişisinden ${Math.abs(d)} sıra ${d > 0 ? 'sonra' : 'önce'} gelir.`;
        fn = p => p.indexOf(b) - p.indexOf(a) === d;
        key = 'delta' + a + b + d;
      }
      if (used.has(key)) continue;
      let next = valid.filter(fn);
      if (next.length === valid.length) continue;
      used.add(key);
      cons.push({ text, fn });
      valid = next;
    }
    if (valid.length !== 1) throw Error('constraint solver did not converge');
    return { names, valid, cons, solution: valid[0], all };
  }
  function question(cat, type, level = 2, variant = null) {
    if (cat === 'verbal' && root.Verbal) return root.Verbal.create(type, level);
    if (cat === 'shape' && type >= 6) return root.Spatial.create(type, level);
    if (cat === 'num') return root.Numeric.create(type, Math.max(1, Math.min(3, level)), variant);
    level = Math.max(1, Math.min(3, level));
    let q = '',
      answer,
      exp = '',
      visual = '',
      options,
      raw = null,
      hint = 'Verilen koşulları küçük parçalara ayır; seçenekleri tek tek ele.',
      proof = {};
    let a = R(3, 9),
      b = R(2, 5),
      c = R(2, 6);
    if (cat === 'shape') {
      let m = R(1, 510),
        n = R(1, 510),
        p = R(1, 510),
        r = R(1, 510),
        s = R(1, 510),
        t = R(1, 510);
      if (type === 0 || type === 3 || type === 4) {
        let op = level === 1 ? 'or' : level === 2 ? 'xor' : 'and',
          apply = (x, y) => (op === 'or' ? x | y : op === 'xor' ? x ^ y : x & y),
          pre = x => (type === 3 ? rot(x) : type === 4 ? transform(x, 'mirror') : x);
        let result = apply(pre(s), t);
        while ([0, 511].includes(result)) {
          s = R(1, 510);
          t = R(1, 510);
          result = apply(pre(s), t);
        }
        q = 'İlk iki satırdaki aynı dönüşüm kuralı üçüncü satıra da uygulanıyor. Eksik desen hangisi?';
        visual = matrix(
          [m, n, apply(pre(m), n), p, r, apply(pre(p), r), s, t, null].map(x =>
            x === null ? '?' : maskSvg(x)
          )
        );
        answer = maskSvg(result);
        let wrong = new Set([
          apply(s, t),
          apply(rot(s, 2), t),
          result ^ 1,
          result ^ 16,
          rot(result),
          result ^ 256,
        ]);
        wrong.delete(result);
        options = [...wrong]
          .filter(x => x >= 0 && x <= 511)
          .slice(0, 4)
          .map(maskSvg);
        exp = `${type === 3 ? 'Önce ilk desen saat yönünde 90° döndürülür. ' : type === 4 ? 'Önce ilk desen sağ–sol aynalanır. ' : ''}${op === 'or' ? 'İki desenden en az birinde dolu olan hücreler sonuçta doludur.' : op === 'xor' ? 'Yalnızca bir desende dolu olan hücreler korunur; ortak dolular silinir.' : 'Sadece her iki desende de dolu olan hücreler korunur.'}`;
        proof = {
          kind: 'mask',
          a: s,
          b: t,
          result,
          op,
          pre: type === 3 ? 'rot' : type === 4 ? 'mirror' : 'none',
        };
        hint =
          'Dolu hücrelerin birleşim, kesişim veya birbirini silme ilişkisini incele; gerekiyorsa önce dönüşümü bul.';
      }
      if (type === 1) {
        let d = R(0, 3),
          step = pick([1, 3]),
          count = R(0, 2),
          f = R(0, 1),
          at = i => [(d + i * step) % 4, ((count + i) % 3) + 1, level === 1 ? f : (f + i) % 2];
        q = 'Yön, nokta sayısı ve doluluk birlikte değişiyor. Sıradaki şekli seç.';
        visual =
          '<div class="sequence">' +
          Array.from({ length: 5 }, (_, i) => glyph(...at(i))).join('') +
          '<span class="seqbox">?</span></div>';
        let v = at(5);
        answer = glyph(...v);
        options = [
          glyph((v[0] + 1) % 4, v[1], v[2]),
          glyph(v[0], (v[1] % 3) + 1, v[2]),
          glyph(v[0], v[1], 1 - v[2]),
          glyph((v[0] + 2) % 4, (v[1] % 3) + 1, v[2]),
        ];
        exp = `Yön her adımda ${step === 1 ? 'saat yönünde' : 'saat yönünün tersinde'} 90° döner; noktalar 1–2–3 döngüsündedir. ${level === 1 ? 'Doluluk değişmez.' : 'Elmasın doluluğu her adımda değişir.'}`;
      }
      if (type === 2) {
        let n = level === 1 ? 3 : 4,
          symbols = shuffle(['●', '◆', '▲', '■']).slice(0, n),
          row = shuffle(Array.from({ length: n }, (_, i) => i)),
          col = shuffle(Array.from({ length: n }, (_, i) => i)),
          rr = R(0, n - 1),
          cc = R(0, n - 1),
          cells = Array.from({ length: n * n }, (_, i) => (row[Math.floor(i / n)] + col[i % n]) % n),
          target = rr * n + cc,
          grid = cells.slice();
        grid[target] = -1;
        const solve = g => {
          let solutions = [],
            work = g.slice();
          function walk() {
            if (solutions.length >= 80) return;
            let pos = -1,
              choices = null;
            for (let i = 0; i < work.length; i++)
              if (work[i] === -1) {
                let r = Math.floor(i / n),
                  c = i % n,
                  possible = Array.from({ length: n }, (_, j) => j).filter(
                    v =>
                      !work.slice(r * n, r * n + n).includes(v) &&
                      !Array.from({ length: n }, (_, k) => work[k * n + c]).includes(v)
                  );
                if (!possible.length) return;
                if (!choices || possible.length < choices.length) {
                  pos = i;
                  choices = possible;
                }
              }
            if (pos === -1) {
              solutions.push(work.slice());
              return;
            }
            for (let v of choices) {
              work[pos] = v;
              walk();
            }
            work[pos] = -1;
          }
          walk();
          return solutions;
        };
        let holes = 1;
        for (let pos of shuffle(Array.from({ length: n * n }, (_, i) => i)).filter(i => i !== target)) {
          if (holes >= (level === 1 ? 3 : level === 2 ? 6 : 9)) break;
          let old = grid[pos];
          grid[pos] = -1;
          let sol = solve(grid);
          if (sol.length === 1) {
            holes++;
          } else grid[pos] = old;
        }
        answer = symbols[cells[target]];
        visual =
          `<div class="latin" style="--size:${n}">` +
          grid.map((x, i) => `<span>${i === target ? '?' : x === -1 ? '·' : symbols[x]}</span>`).join('') +
          '</div>';
        q =
          'Her satır ve sütunda her simge tam bir kez bulunmalı. Noktalı hücreler de eksiktir. Soru işaretine hangi simge gelir?';
        options = symbols.filter(x => x !== answer);
        exp =
          `Satır ve sütunlarda eksik kümeleri kesiştirerek boşlukları doldur. Tüm koşulları sağlayan tek çözümde ${rr + 1}. satır, ${cc + 1}. sütun ${answer} olur. Tam satırlar: ` +
          Array.from({ length: n }, (_, r) =>
            cells
              .slice(r * n, r * n + n)
              .map(x => symbols[x])
              .join(' ')
          ).join(' / ');
        proof = { kind: 'latin', n, grid, target, cells, symbols };
      }
      if (type === 5) {
        let ops = shuffle(['rot', 'mirror', 'flip']).slice(0, level === 1 ? 2 : 3),
          apply = x => ops.reduce((v, o) => transform(v, o), x);
        let examples = [R(1, 510), R(1, 510)],
          v = R(1, 510);
        while (new Set([v, rot(v), transform(v, 'mirror'), transform(v, 'flip')]).size < 4) v = R(1, 510);
        q = 'Aynı kural makinesi her girdiyi aynı işlemlerle dönüştürüyor. Son çıktı hangisi?';
        visual =
          examples
            .map(x => '<div class="sequence">' + maskSvg(x) + '<span>→</span>' + maskSvg(apply(x)) + '</div>')
            .join('') +
          '<div class="sequence">' +
          maskSvg(v) +
          '<span>→</span><span class="seqbox">?</span></div>';
        answer = maskSvg(apply(v));
        let wrong = new Set([
          v,
          rot(v),
          rot(v, 2),
          rot(v, 3),
          transform(v, 'mirror'),
          transform(v, 'flip'),
          apply(v) ^ 1,
        ]);
        wrong.delete(apply(v));
        options = [...wrong].slice(0, 4).map(maskSvg);
        exp = `Bir geçerli işlem zinciri: ${ops.map(o => (o === 'rot' ? 'saat yönünde 90° döndür' : o === 'mirror' ? 'sağ–sol aynala' : 'üst–alt aynala')).join(' → ')}. Örneklerdeki hücrelerin nereye taşındığını karşılaştır.`;
      }
    }
    if (cat === 'verbal') {
      let dept = pick([
          'satın alma',
          'ürün geliştirme',
          'iç denetim',
          'operasyon',
          'planlama',
          'müşteri deneyimi',
        ]),
        limit = R(20, 90) * 1000,
        days = R(3, 8),
        age = R(1, 12),
        amount = R(10, 110) * 1000,
        approved = R(0, 1),
        critical = R(0, 1);
      if (type === 0) {
        let eligible = amount > limit && age <= days,
          except = critical === 1,
          final = (eligible || except) && !!approved;
        q = 'Yalnızca aşağıdaki politikaya göre yargıyı değerlendir.';
        visual = pass(
          `Bir ${dept} talebi, tutarı ${num(limit)} TL’yi aşıyor ve bekleme süresi en fazla ${days} gün ise hızlı işleme adaydır. ${level >= 2 ? 'Kritik talepler, bu iki koşuldan bağımsız olarak aday sayılır.' : 'Kritik işareti bu politikada dikkate alınmaz.'} Aday olmak tek başına yeterli değildir; hızlı işleme geçebilmek için ayrıca bölüm onayı gerekir.<br><br>İncelenen talep: ${num(amount)} TL, ${age} gündür bekliyor. Kritik: ${critical ? 'evet' : 'hayır'}. Bölüm onayı: ${approved ? 'var' : 'yok'}.`
        );
        final = (eligible || (level >= 2 && except)) && !!approved;
        answer = final ? 'Doğru' : 'Yanlış';
        if (level === 3 && R(0, 3) === 0) {
          visual = visual.replace(
            `Bölüm onayı: ${approved ? 'var' : 'yok'}.`,
            'Bölüm onayı hakkında bilgi yok.'
          );
          answer = eligible || except ? 'Belirlenemez' : 'Yanlış';
        }
        visual += '<p class="statement">“Talep, politikaya göre hızlı işleme geçebilir.”</p>';
        options = ['Doğru', 'Yanlış', 'Belirlenemez'];
        exp = `Normal adaylık için tutar ve bekleme koşulu birlikte sağlanmalı.${level >= 2 ? ' Kritik işareti adaylık koşullarına istisnadır.' : ''} Ancak bölüm onayı her durumda gereklidir. Sonuç: ${answer}.`;
        hint = 'Adaylık koşulu ile nihai onay koşulunu birbirinden ayır.';
      }
      if (type === 1) {
        let total = R(6, 12) * 10,
          group = R(2, 5) * 10,
          passn = R(1, group / 10 - 1) * 10,
          choice = R(0, 2);
        q = 'Metindeki sayısal bilgiler ve kapsam sınırına göre yargıyı değerlendir.';
        visual = pass(
          `${dept} birimindeki ${total} çalışanın ${group} kişisi pilot eğitime katılmıştır. Katılımcıların ${passn} kişisi uygulama sınavını geçmiştir. Katılmayan çalışanlara bu sınav uygulanmamıştır. Eğitim öncesi başarı düzeyi hakkında veri toplanmamıştır.`
        );
        const claims = [
          [
            'Tüm çalışanların yarısından fazlası uygulama sınavını geçmiştir.',
            passn > total / 2 ? 'Doğru' : 'Yanlış',
          ],
          ['Eğitim, katılanların başarısını eğitim öncesine göre artırmıştır.', 'Belirlenemez'],
          [`${group - passn} katılımcı uygulama sınavını geçememiştir.`, 'Doğru'],
        ];
        [q, answer] = claims[choice];
        visual += `<p class="statement">“${q}”</p>`;
        q = 'Aşağıdaki yargı için doğru değerlendirme hangisi?';
        options = ['Doğru', 'Yanlış', 'Belirlenemez'];
        exp =
          choice === 1
            ? 'Önceki başarı veya karşılaştırma grubu olmadığı için eğitim etkisi hakkında nedensel sonuç çıkarılamaz.'
            : `Eğitime katılmayanlar sınavda başarısız sayılmaz. Başaran ${passn}, katılıp başaramayan ${group - passn} kişi var. Kapsamı ${total} kişilik tüm birimle karıştırma.`;
      }
      if (type === 2) {
        let groups = shuffle([
          'sertifikalı çalışanlar',
          'vardiya liderleri',
          'denetim yetkilileri',
          'proje koordinatörleri',
        ]);
        let [x, y, z] = groups;
        q = 'Aşağıdaki bilgilerden hangisi kesin olarak çıkar?';
        visual = pass(
          `Tüm ${x}, ${y} grubundadır. Hiçbir ${y}, ${z} grubunda değildir. ${x} grubunda en az bir kişi vardır.${level >= 2 ? ` Bazı ${z}, uzaktan çalışmaktadır.` : ''}`
        );
        answer = `En az bir ${y}, ${z} grubunda değildir.`;
        options = [
          `Tüm ${y}, ${x} grubundadır.`,
          `Hiçbir ${z} uzaktan çalışmaz.`,
          `Bazı ${x}, ${z} grubundadır.`,
          `Tüm ${y} uzaktan çalışır.`,
        ];
        exp = `En az bir ${x} vardır ve bu kişi ${y} grubundadır. ${y} ile ${z} kesişmediğinden bu kişi ${z} grubunda değildir. “Tüm X, Y’dir” önermesinin tersi zorunlu değildir.`;
      }
      if (type === 3) {
        let p = pick(argumentBank);
        q = 'Yönetimin vardığı sonucu en güçlü biçimde zayıflatan ek bilgi hangisidir?';
        visual = pass(p.text.replaceAll('{n}', String(R(12, 35))).replaceAll('{dept}', dept));
        answer = p.answer;
        options = p.wrong;
        exp = p.exp;
        hint = 'Sonucu hangi alternatif neden, ölçüm sorunu veya örneklem farkı açıklayabilir?';
      }
      if (type === 4) {
        let p = pick(orderBank),
          perm = shuffle([0, 1, 2, 3, 4]),
          letters = Object.fromEntries(perm.map((x, i) => [x, labels[i]]));
        q = 'Cümleler anlamlı bir paragraf oluşturacak şekilde nasıl sıralanmalıdır?';
        visual = pass(perm.map((x, i) => `<b>${labels[i]}.</b> ${p[x]}`).join('<br><br>'));
        answer = [0, 1, 2, 3, 4].map(x => letters[x]).join(' → ');
        options = [
          [1, 0, 2, 3, 4],
          [0, 2, 1, 3, 4],
          [0, 1, 3, 2, 4],
          [0, 1, 2, 4, 3],
        ].map(v => v.map(x => letters[x]).join(' → '));
        exp =
          'Önce sorun tanıtılır; ardından inceleme ve bulgu gelir. Müdahale bulguya dayanır; son cümle müdahalenin sonucunu bildirir. Gönderme ifadeleri sırayı belirler.';
      }
      if (type === 5) {
        q = 'Bu cümlenin anlamını en doğru koruyan seçenek hangisidir?';
        visual = pass(
          `${dept} biriminde yalnızca hem eğitimini tamamlamış hem de yetkisi yenilenmiş çalışanlar sisteme erişebilir; bu koşulların sağlanması erişimin mutlaka açılacağı anlamına gelmez.`
        );
        answer =
          'Erişimi olanların eğitimi tamamdır ve yetkileri yenilenmiştir; iki koşulu sağlayan herkesin erişimi olduğu söylenemez.';
        options = [
          'Eğitimi tamamlayan veya yetkisi yenilenen her çalışan sisteme erişebilir.',
          'Eğitim ve yetki koşullarını sağlayan tüm çalışanların erişimi mutlaka açıktır.',
          'Sisteme erişimi olmayan hiçbir çalışan eğitimini tamamlamamıştır.',
          'Erişimi olanların en az bir koşulu sağlaması yeterlidir.',
        ];
        exp =
          'Cümle iki gerekli koşul koyuyor, yeterli koşul koymuyor. “Yalnızca” ve “mutlaka değil” ifadelerinin kapsamını koru.';
      }
    }
    if (cat === 'attention') {
      const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789',
        code = (n = 8) => Array.from({ length: n }, () => pick(chars)).join('');
      if (type === 0) {
        let cols = ['Kayıt', 'Ürün', 'Bölge', 'Miktar', 'Tutar', 'Durum'],
          rows = Array.from({ length: level + 3 }, (_, i) => [
            i + 1,
            code(9),
            pick(['KZ-04', 'GZ-07', 'MZ-12']),
            R(120, 950),
            R(1000, 9999),
            pick(['Açık', 'Kapalı', 'Askıda']),
          ]),
          row = R(0, rows.length - 1),
          col = R(1, 5),
          other = rows.map(x => x.slice());
        other[row][col] =
          col === 1
            ? other[row][col].slice(0, -2) + code(2)
            : col === 2
              ? other[row][col].replace(/\d+/, x => String(+x + 1).padStart(2, '0'))
              : col === 5
                ? pick(['İptal', 'Bekliyor'])
                : other[row][col] + R(1, 9);
        if (other[row][col] === rows[row][col]) other[row][col] += 'X';
        q = 'Aktarımda yalnızca bir hücre değişmiş. Hangi kayıt ve sütun farklı?';
        visual =
          '<small>Kaynak</small>' + table(cols, rows) + '<small>Aktarılan</small>' + table(cols, other);
        answer = `${row + 1}. kayıt · ${cols[col]}`;
        options = shuffle(
          rows.flatMap((_, i) => cols.slice(1).map(x => `${i + 1}. kayıt · ${x}`)).filter(x => x !== answer)
        ).slice(0, 4);
        exp = `${row + 1}. kaydın ${cols[col]} alanı kaynakta ${rows[row][col]}, aktarımda ${other[row][col]}. Diğer hücreler aynıdır.`;
        proof = { kind: 'records', rows, other, row, col };
      }
      if (type === 1 || type === 3 || type === 5) {
        let rows = Array.from({ length: 5 + level * 2 }, (_, i) => ({
            id: 'K' + (i + 1),
            risk: R(1, 5),
            age: R(1, 12),
            paid: R(0, 1),
            ex: R(0, 3) === 0,
          })),
          risk = R(3, 4),
          day = R(4, 7);
        let check = x => ((x.risk >= risk && x.age > day) || (level === 3 && x.ex)) && !x.paid;
        let val = rows.filter(check);
        q =
          type === 3
            ? 'Kurala göre kaç kayıt incelemeye alınmalıdır?'
            : type === 5
              ? 'İncelemeye alınması gereken kayıtların tam listesi hangisidir?'
              : 'Kurala göre incelemeye alınan kayıt sayısı kaçtır?';
        visual =
          pass(
            `Risk puanı en az ${risk} ve bekleme süresi ${day} günden fazla olan kayıtlar incelemeye alınır.${level === 3 ? ' İstisna işaretli kayıtlar bu iki koşuldan bağımsız olarak incelemeye adaydır.' : ''} Ancak ödemesi tamamlanan kayıtlar hiçbir koşulda incelemeye alınmaz.`
          ) +
          table(
            ['Kayıt', 'Risk', 'Gün', 'Ödendi', 'İstisna'],
            rows.map(x => [x.id, x.risk, x.age, x.paid ? 'Evet' : 'Hayır', x.ex ? 'Evet' : 'Hayır'])
          );
        if (type === 5) {
          answer = val.map(x => x.id).join(', ') || 'Hiçbiri';
          options = [
            ...new Set(
              Array.from({ length: 12 }, () =>
                shuffle(rows)
                  .slice(0, R(1, 4))
                  .map(x => x.id)
                  .sort((a, b) => +a.slice(1) - +b.slice(1))
                  .join(', ')
              )
            ),
          ]
            .filter(x => x !== answer)
            .slice(0, 4);
        } else answer = val.length;
        exp = `Sınırları dikkatle uygula: risk ≥ ${risk}, gün > ${day}.${level === 3 ? ' İstisna, adaylık şartlarını aşar.' : ''} Ödenmiş kayıtlar elenir. Kalanlar: ${val.map(x => x.id).join(', ') || 'yok'} (${val.length} kayıt).`;
        proof = { kind: 'filter', rows, risk, day, level, ids: val.map(x => x.id) };
        hint = '“En az” eşitliği içerir; “fazla” içermez. Önce ödenmişleri ele.';
      }
      if (type === 2) {
        let alphabet = pick(['AB', 'XY', '12']),
          target = alphabet[0] + alphabet[1] + alphabet[0],
          str = Array.from({ length: 35 + level * 15 }, () => pick(alphabet)).join(''),
          count = 0;
        for (let i = 0; i <= str.length - target.length; i++)
          if (str.slice(i, i + target.length) === target) count++;
        q = `${target} örüntüsü aşağıdaki dizide kaç kez geçiyor? Örtüşen eşleşmeleri de say.`;
        visual = `<div class="code scan">${str}</div>`;
        answer = count;
        exp = `Her konumu başlangıç kabul ederek ${target} dizisini kontrol et. Eşleşmeden sonra yalnızca bir konum ilerlenir; böylece örtüşen eşleşmeler atlanmaz. Toplam ${count}.`;
        proof = { kind: 'scan', str, target, count };
      }
      if (type === 4) {
        let base = Array.from({ length: 5 + level }, () => code(10)),
          idx = R(0, base.length - 1),
          pos = R(1, 8);
        let rows = base.map((s, i) => [
          i + 1,
          s.toLowerCase().slice(0, 3) + '-' + s.toLowerCase().slice(3, 6) + ' ' + s.toLowerCase().slice(6),
          i === idx ? s.slice(0, pos) + pick(chars.replace(s[pos], '')) + s.slice(pos + 1) : s,
        ]);
        q = 'Büyük/küçük harf, boşluk ve tire farkları yok sayıldığında hangi kayıt gerçekten farklıdır?';
        visual = table(['Kayıt', 'Kaynak', 'Aktarım'], rows);
        answer = idx + 1;
        options = shuffle(base.map((_, i) => i + 1).filter(x => x !== answer)).slice(0, 4);
        exp = `Normalleştirme sonrası ${idx + 1}. kayıtta karakter farkı kalır. Biçim farkları hata sayılmaz.`;
        proof = { kind: 'normalize', rows, idx };
      }
    }
    if (cat === 'quant') {
      if (type === 0) {
        let units = Array.from({ length: 3 + Number(level === 3) }, (_, i) => ({
            name: labels[i],
            n: R(10, 40) * 100,
            rate: pick([2, 4, 5, 8, 10]),
          })),
          total = units.reduce((s, x) => s + x.n, 0),
          bad = units.reduce((s, x) => s + (x.n * x.rate) / 100, 0);
        q =
          'Birimlerin üretimleri ve hata oranları aşağıdadır. Toplam üretimde hatalı ürün oranı yüzde kaçtır? (İki ondalığa yuvarla.)';
        visual = table(
          ['Birim', 'Üretim (adet)', 'Hata oranı (%)'],
          units.map(x => [x.name, num(x.n), x.rate])
        );
        let weightedNumerator = units.reduce((s, x) => s + x.n * x.rate, 0),
          weightedPercent = Math.floor((weightedNumerator * 100 + total / 2) / total) / 100;
        answer = num(weightedPercent) + '%';
        let naive = mean(units.map(x => x.rate));
        options = [
          num(naive) + '%',
          num((bad / total) * 100 + 0.5) + '%',
          num((bad / total) * 100 - 0.5) + '%',
          num((bad / (total - bad)) * 100) + '%',
        ];
        exp = `Hatalı adetler: ${units.map(x => `${x.name}: ${num((x.n * x.rate) / 100)}`).join('; ')}. Toplam ${num(bad)} / ${num(total)} × 100 = %${num(weightedPercent)}. Yüzdelerin basit ortalaması alınmaz.`;
        proof = { kind: 'weighted', units, total, bad };
      }
      if (type === 1) {
        let old = R(8, 24) * 100,
          u = pick([10, 15, 20, 25]),
          d = pick([10, 20, 25]),
          tax = level === 3 ? pick([8, 10, 20]) : 0,
          final = old * (1 + u / 100) * (1 - d / 100) * (1 + tax / 100);
        q = `Bir ürünün fiyatına önce %${u} zam, ardından zamlı fiyat üzerinden %${d} indirim uygulanıyor.${tax ? ` Son fiyat üzerine %${tax} vergi ekleniyor.` : ''} Ödenen tutar ${num(final)} TL ise ilk fiyat kaç TL’dir?`;
        answer = old;
        exp = `Son tutarı katsayı çarpımına böl: ${num(final)} ÷ (${num(1 + u / 100)} × ${num(1 - d / 100)}${tax ? ' × ' + num(1 + tax / 100) : ''}) = ${old} TL. Yüzdeler toplanarak netlenmez.`;
        proof = { kind: 'reverse', old, u, d, tax, final };
      }
      if (type === 2) {
        let rates = [R(3, 7) * 10, R(4, 8) * 10, R(2, 6) * 10],
          h = R(5, 9),
          stop = R(1, 3),
          scrap = level === 3 ? 10 : 0,
          total =
            (rates[0] * h + rates[1] * (h - stop) + (level >= 2 ? rates[2] * h : 0)) * (1 - scrap / 100);
        q = `A ve B hatları saatte sırasıyla ${rates[0]} ve ${rates[1]} ürün üretir.${level >= 2 ? ` C hattı da saatte ${rates[2]} ürün üretir.` : ''} ${h} saatlik vardiyada B hattı ${stop} saat durur.${scrap ? ' Üretilenlerin %10’u kalite kontrolünde elenir.' : ''} Diğer hatlar durmadan çalışır. ${scrap ? 'Sağlam' : 'Toplam'} ürün sayısı kaçtır?`;
        answer = total;
        exp = `A: ${rates[0]} × ${h}; B: ${rates[1]} × ${h - stop}${level >= 2 ? `; C: ${rates[2]} × ${h}` : ''}.${scrap ? ' Toplamın %90’ı sağlamdır.' : ''} Sonuç ${num(total)} ürün.`;
        proof = { kind: 'capacity', rates, h, stop, scrap, level, total };
      }
      if (type === 3) {
        let kg = R(12, 40) * 100,
          usd = R(2, 7) * 5,
          fx = R(28, 45),
          freight = R(1, 5) * 1000,
          discount = level >= 2 ? 10 : 0,
          cost = kg * usd * fx * (1 - discount / 100) + freight;
        q = `${num(kg)} kg hammadde için fiyat ${usd} USD/kg, kur ${fx} TL/USD’dir.${discount ? ' Malzeme bedeline %10 indirim uygulanır.' : ''} Nakliye ${num(freight)} TL olup indirime dahil değildir. Vergi yoktur. Teslim edilmiş birim maliyet kaç TL/kg’dır? (İki ondalığa yuvarla.)`;
        answer = num(cost / kg);
        exp = `Malzeme bedeli ${num(kg * usd * fx)} TL${discount ? ' × 0,90' : ''}. Nakliyeyi sonra ekle ve ${num(kg)} kg’a böl: ${num(cost)} / ${num(kg)} = ${num(cost / kg)} TL/kg.`;
        raw = cost / kg;
      }
      if (type === 4) {
        let x = R(2, 6) * 10,
          y = R(2, 6) * 10,
          p = pick([20, 30, 40]),
          r = pick([60, 70, 80]),
          add = level === 3 ? R(1, 3) * 10 : 0,
          total = x + y + add,
          amt = (x * p) / 100 + (y * r) / 100;
        q = `%${p} yoğunlukta ${x} litre çözelti ile %${r} yoğunlukta ${y} litre çözelti karıştırılıyor.${add ? ` Ardından ${add} litre saf su ekleniyor.` : ''} Hacimler toplanabilir kabul edilirse son yoğunluk yüzde kaçtır? (İki ondalığa yuvarla.)`;
        answer = num((amt / total) * 100) + '%';
        options = [
          num((p + r) / 2) + '%',
          num((amt / (x + y)) * 100 + 1) + '%',
          num((amt / total) * 100 - 2) + '%',
          num((amt / total) * 100 + 3) + '%',
        ];
        exp = `Çözünen madde ${x} × ${p}/100 + ${y} × ${r}/100 = ${num(amt)} litre. Toplam hacim ${total} litre. Yoğunluk ${num(amt)} / ${total} × 100 = %${num((amt / total) * 100)}.`;
      }
      if (type === 5) {
        let variant = R(0, 3),
          x = R(3, 10),
          y = R(3, 10);
        q = 'Veri yeterliliği: İstenen değeri tek başına bulmak için hangi bilgiler yeterlidir?';
        let bank = [
          {
            ask: 'İki ürünün toplam fiyatı kaçtır?',
            s1: `Birinci fiyat, ikinci fiyatın ${x} katıdır.`,
            s2: `İkinci fiyat ${y * 10} TL’dir.`,
            a: 'İki bilgi birlikte yeterli; hiçbiri tek başına yeterli değil.',
            e: 'Oran tek başına ölçek vermez. İkinci fiyat tek başına ilk fiyatı vermez. Birlikte iki fiyat da bulunur.',
          },
          {
            ask: 'Dikdörtgenin alanı kaçtır?',
            s1: `Çevresi ${2 * (x + y)} cm’dir.`,
            s2: `Bir kenarı ${x} cm’dir.`,
            a: 'İki bilgi birlikte yeterli; hiçbiri tek başına yeterli değil.',
            e: 'Çevre iki kenarın toplamını verir; bir kenarla diğer kenar bulunur. Tek başına bir kenar veya çevre alanı belirlemez.',
          },
          {
            ask: 'Bir çalışanın saatlik üretimi kaçtır?',
            s1: `${x} saatte ${x * y * 10} ürün üretir ve hızı sabittir.`,
            s2: `${y} gün çalışmıştır.`,
            a: 'Yalnız I yeterli.',
            e: 'I bilgisi ürün/saat oranını doğrudan verir. Gün sayısı üretim miktarı olmadan yeterli değildir.',
          },
          {
            ask: 'Bir ürünün ilk fiyatı kaçtır?',
            s1: 'Fiyata %20 indirim uygulanmıştır.',
            s2: 'İndirimli fiyat, ilk fiyatın %80’idir.',
            a: 'İki bilgi birlikte de yeterli değil.',
            e: 'İki bilgi aynı oranı ifade eder. Mutlak bir fiyat verilmediği için sonsuz sayıda ilk fiyat mümkündür.',
          },
        ];
        let v = bank[variant];
        visual = pass(`<b>${v.ask}</b><br><br>I. ${v.s1}<br>II. ${v.s2}`);
        answer = v.a;
        options = [
          'Yalnız I yeterli.',
          'Yalnız II yeterli.',
          'Her biri tek başına yeterli.',
          'İki bilgi birlikte yeterli; hiçbiri tek başına yeterli değil.',
          'İki bilgi birlikte de yeterli değil.',
        ].filter(x => x !== answer);
        exp = v.e;
      }
    }
    if (cat === 'logic') {
      if (type === 0 || type === 1) {
        let n = level === 1 ? 4 : level === 2 ? 5 : 6,
          co = constrained(n),
          position = R(0, n - 1);
        q =
          type === 0
            ? `Soldan sağa sıralamada ${position + 1}. sırada kim bulunur?`
            : `${position + 1}. zaman dilimindeki görevi kim üstlenir?`;
        visual = pass(
          `${co.names.join(', ')} ${type === 0 ? 'yan yana sıralanacaktır' : 'ardışık zaman dilimlerinde birer görev yapacaktır'}. Her kişi tam bir kez yer alır.<br><br>` +
            co.cons.map(x => '• ' + x.text).join('<br>')
        );
        answer = co.solution[position];
        options = co.names.filter(x => x !== answer);
        exp = `Tüm koşulları aynı anda sağlayan tek sıra: ${co.solution.join(' → ')}. İstenen konumda ${answer} yer alır.`;
        proof = {
          kind: 'order',
          names: co.names,
          constraints: co.cons.map(x => x.text),
          solution: co.solution,
          position,
          valid: co.valid.length,
        };
        hint = 'Konumları numaralandır. Kesin aralık koşullarını yerleştirip “önce” ilişkilerini kontrol et.';
      }
      if (type === 2) {
        let dur = [R(2, 5), R(2, 5), R(2, 5), R(2, 5)],
          release = level >= 2 ? R(5, 15) : 0;
        let ends = [dur[0], dur[0] + dur[1], Math.max(dur[0] + dur[1], release) + dur[2]];
        let finish = Math.min(ends[2], Math.max(dur[0], release) + dur[2] + dur[1]) + dur[3];
        q = 'Tek uzman kaynağıyla tüm işler en erken kaçıncı saatin sonunda tamamlanır?';
        visual = pass(
          `A (${dur[0]} saat) bittikten sonra B (${dur[1]} saat) ve C (${dur[2]} saat) yapılabilir. D (${dur[3]} saat), B ve C bitmeden başlayamaz. B ve C aynı uzmanı kullanır; aynı anda yapılamaz. Diğer işler farklı kaynak kullanır.${release ? ` C için gereken malzeme ${release}. saatte hazır olur.` : ''} Saat 0’da başlanır; işler bölünmez.`
        );
        answer = finish;
        exp = `A ${dur[0]}. saatte biter. B ve C aynı kaynağı kullandığı için süreleri toplanır${release ? ' ve C’nin malzeme kısıtı kontrol edilir' : ''}. B önce yapılırsa C ${Math.max(ends[1], release)}. saatte başlayabilir. D sonrasında ${dur[3]} saat sürer. İki olası sıra da kontrol edilir; en erken bitiş ${finish}. saattir.`;
        proof = { kind: 'schedule', dur, release, finish };
      }
      if (type === 3) {
        let names = shuffle(['Ada', 'Bora', 'Cem', 'Duru', 'Ece', 'Fırat']).slice(0, level + 3),
          n = names.length,
          chosen = R(0, n - 1),
          st,
          desired,
          counts,
          attempt = 0;
        do {
          let keys = new Set();
          st = [];
          while (st.length < n) {
            let ids = shuffle(Array.from({ length: n }, (_, i) => i))
                .slice(0, R(1, 2))
                .sort(),
              not = R(0, 1) === 1,
              key = ids.join(',') + not;
            if (keys.has(key)) continue;
            keys.add(key);
            st.push({ ids, not });
          }
          counts = names.map(
            (_, candidate) =>
              st.filter(x => (x.not ? !x.ids.includes(candidate) : x.ids.includes(candidate))).length
          );
          desired = counts[chosen];
        } while (
          (desired === 0 || desired === st.length || counts.filter(x => x === desired).length !== 1) &&
          ++attempt < 1000
        );
        if (counts.filter(x => x === desired).length !== 1) throw Error('truth solver failed');
        q = 'Tam olarak verilen sayıda ifade doğruysa sorumlu kişi kimdir?';
        visual = pass(
          `${names.length} kişiden yalnız biri sorumludur. Aşağıdaki ifadelerden tam ${desired} tanesi doğrudur.<br><br>` +
            st
              .map(
                (x, i) =>
                  `${labels[i]}: ${x.ids.map(j => names[j]).join(' veya ')} ${x.not ? 'sorumlu değildir' : 'sorumludur'}${x.ids.length === 2 && x.not ? ' (ikisi de sorumlu değil)' : ''}.`
              )
              .join('<br>')
        );
        answer = names[chosen];
        options = names.filter(x => x !== answer);
        exp = `Her adayı tek sorumlu varsayarak ifadeleri değerlendir. Doğru ifade sayıları: ${names.map((x, i) => x + ': ' + counts[i]).join('; ')}. Yalnız ${names[chosen]} tam ${desired} doğru ifade koşulunu sağlar.`;
        proof = { kind: 'truth', names, st, desired, chosen };
      }
      if (type === 4) {
        let both = R(8, 20),
          onlyA = R(15, 35),
          onlyB = R(12, 30),
          none = R(5, 15),
          total = both + onlyA + onlyB + none;
        let ask = R(0, 1);
        q = ask
          ? 'İki eğitimden tam olarak birini alan kaç kişi vardır?'
          : 'Her iki eğitimi de alan kaç kişi vardır?';
        visual = pass(
          `${total} çalışanın ${both + onlyA} kişisi veri analizi, ${both + onlyB} kişisi süreç analizi eğitimi almıştır. ${none} kişi iki eğitimi de almamıştır. Başka çalışan veya eğitim grubu yoktur.`
        );
        answer = ask ? onlyA + onlyB : both;
        exp = `En az bir eğitim alan ${total} − ${none} = ${total - none}. Kesişim = ${both + onlyA} + ${both + onlyB} − ${total - none} = ${both}.${ask ? ` Tam bir eğitim alan ${total - none} − ${both} = ${onlyA + onlyB}.` : ''}`;
      }
      if (type === 5) {
        let d = Array.from({ length: 6 }, () => R(2, 8)),
          delay = level === 3 ? R(2, 5) : 0,
          ends = [d[0], d[0] + d[1], d[0] + d[2]];
        ends.push(Math.max(ends[1], ends[2]) + d[3]);
        ends.push(ends[2] + d[4] + delay);
        let fin = Math.max(ends[3], ends[4]) + d[5];
        q = 'Kaynak kısıtı yoksa proje en erken kaç günde tamamlanır?';
        visual =
          table(
            ['İş', 'Süre (gün)', 'Ön koşul'],
            [
              ['A', d[0], 'Yok'],
              ['B', d[1], 'A'],
              ['C', d[2], 'A'],
              ['D', d[3], 'B ve C'],
              ['E', d[4], 'C'],
              ['F', d[5], 'D ve E'],
            ]
          ) +
          pass(
            `Aynı anda yapılabilen işler paralel başlar.${delay ? ` E işi başlamadan önce, C bitişinden itibaren ${delay} gün bekleme zorunludur.` : ''}`
          );
        answer = fin;
        exp = `En erken bitişler: A=${ends[0]}, B=${ends[1]}, C=${ends[2]}, D=${ends[3]}, E=${ends[4]}. F iki ön koşulun en geç bitenini bekler: max(${ends[3]}, ${ends[4]}) + ${d[5]} = ${fin}. Paralel kolların sürelerini doğrudan toplama.`;
        proof = { kind: 'network', dur: d, delay, finish: fin };
      }
    }
    if (answer === undefined) throw Error('Missing generator ' + cat + '/' + type);
    if (typeof answer === 'number') {
      raw = answer;
      answer = num(answer);
    }
    answer = String(answer);
    if (!options) {
      let v = raw ?? Number(answer.replace(',', '.')),
        step = Math.max(1, Number.isInteger(v) ? Math.round(Math.abs(v) * 0.05) : round(Math.abs(v) * 0.05));
      options = [v + step, v - step, v + 2 * step, v - 2 * step].map(num);
    }
    options = shuffle([...new Set([answer, ...options.map(String)])]).slice(0, 6);
    if (!options.includes(answer)) {
      options.pop();
      options.push(answer);
    }
    options = shuffle(options);
    if (options.length < 3) {
      if (cat === 'shape' && type === 2) {
        options = shuffle(['●', '◆', '▲', '■']);
      } else {
        let k = 1;
        while (options.length < 3) {
          let n = raw !== null ? num(raw + k) : 'Koşullardan belirlenemez' + (k > 1 ? ' · ' + k : '');
          if (!options.includes(n)) options.push(n);
          k++;
        }
      }
    }
    return {
      cat,
      type,
      level,
      q,
      visual,
      answer,
      options,
      exp,
      hint,
      id: hash(q + visual + answer),
      target: cat === 'attention' ? 35 : cat === 'logic' ? 100 : 75,
      proof,
      engineVersion: 2,
    };
  }
  const mean = a => a.reduce((s, x) => s + x, 0) / a.length;
  const argumentBank = [
    {
      text: 'Bir ekipte uzaktan çalışmaya geçildikten sonra tamamlanan iş sayısı %{n} arttı. Yönetim bu artışın yalnızca uzaktan çalışmadan kaynaklandığı sonucuna varıyor.',
      answer: 'Aynı dönemde iş hacmi değişmiş ve ekibe deneyimli çalışanlar katılmıştır.',
      wrong: [
        'Çalışanlar farklı şehirlerde yaşamaktadır.',
        'Toplantılar artık çevrimiçi yapılmaktadır.',
        'Bazı çalışanlar uzaktan çalışmayı tercih etmektedir.',
        'Ekip sonuçları aylık olarak raporlamaktadır.',
      ],
      exp: 'Eşzamanlı personel ve iş hacmi değişimleri alternatif açıklama sunar. Önce–sonra karşılaştırması tek başına nedensellik göstermez.',
    },
    {
      text: 'Bir yazılımı kullanan {dept} ekipleri, kullanmayanlardan daha az hata yapıyor. Yönetim, yazılımın hata oranını düşürdüğünü savunuyor.',
      answer:
        'Yazılımı kullanan ekiplerin çalışanları uygulamadan önce de daha deneyimliydi ve daha az hata yapıyordu.',
      wrong: [
        'Yazılım için yıllık lisans bedeli ödenmektedir.',
        'Yazılımın arayüzü iki dilde kullanılabilmektedir.',
        'Ekipler aylık toplantılar düzenlemektedir.',
        'Bazı çalışanlar yazılımın görünümünü beğenmemektedir.',
      ],
      exp: 'Gruplar başlangıçta farklıysa gözlenen fark yazılım etkisinden kaynaklanmayabilir; seçim yanlılığı vardır.',
    },
    {
      text: 'Yeni teslimat sistemi sonrasında şikâyet sayısı %{n} azaldı. Yönetim, müşteri memnuniyetinin kesinlikle yükseldiğini söylüyor.',
      answer: 'Aynı dönemde şikâyet formuna ulaşmak zorlaşmış ve başvuru kanallarından biri kapanmıştır.',
      wrong: [
        'Teslimat araçlarının rengi değiştirilmiştir.',
        'Sistem haftalık rapor üretmektedir.',
        'Müşteriler farklı ödeme yöntemleri kullanmaktadır.',
        'Yeni sisteme kısa bir ad verilmiştir.',
      ],
      exp: 'Şikâyetin kaydedilme olasılığı azalmışsa kayıt sayısındaki düşüş memnuniyet artışını göstermeyebilir.',
    },
    {
      text: 'Gönüllü katılım anketine yanıt veren çalışanların çoğu yeni vardiya düzenini destekliyor. Yönetim, tüm çalışanların çoğunun da desteklediğini düşünüyor.',
      answer:
        'Yanıtlayanlar ağırlıklı olarak yeni düzenden yararlanan çalışanlardır; diğerlerinin çoğu ankete katılmamıştır.',
      wrong: [
        'Anket üç gün açık tutulmuştur.',
        'Ankette serbest metin alanı bulunmaktadır.',
        'Sonuçlar bir grafikle sunulmuştur.',
        'Vardiya adları harflerle gösterilmektedir.',
      ],
      exp: 'Yanıtlayanlar tüm çalışanları temsil etmiyorsa gönüllü katılım yanlılığı genellemeyi zayıflatır.',
    },
    {
      text: 'Eğitim alan çalışanların ortalama performansı yüksek bulundu. Yönetim, eğitimin her çalışanın performansını artıracağını iddia ediyor.',
      answer: 'Eğitime yalnızca önceki dönemde en yüksek performansı gösteren çalışanlar seçilmiştir.',
      wrong: [
        'Eğitim bir toplantı salonunda verilmiştir.',
        'Katılımcılara dijital notlar gönderilmiştir.',
        'Eğitim hafta içinde yapılmıştır.',
        'Eğitimin sonunda katılım belgesi verilmiştir.',
      ],
      exp: 'Yüksek performans eğitim öncesinde de varsa eğitim etkisi ile seçilme etkisi birbirine karışır.',
    },
    {
      text: 'Bir fabrikada çalışan başına çıktı %{n} artmıştır. Yönetim, toplam üretimin de aynı oranda arttığını söylemektedir.',
      answer: 'Aynı dönemde çalışan sayısı önemli ölçüde azalmıştır.',
      wrong: [
        'Fabrika raporlarında çıktı adetle ölçülmektedir.',
        'Üretim farklı vardiyalarda yapılmaktadır.',
        'Personel girişleri elektronik kartla izlenmektedir.',
        'İş kıyafetleri yenilenmiştir.',
      ],
      exp: 'Toplam çıktı = kişi başına çıktı × çalışan sayısıdır. Payda değişirse toplam üretim aynı oranda artmayabilir.',
    },
  ];
  const orderBank = [
    [
      'Bir işletme, siparişlerin kapanış süresinin uzadığını fark etti.',
      'Bu gecikmenin kaynağını bulmak için süreç adımları ayrı ayrı ölçüldü.',
      'Ölçümler, beklemenin çoğunun onay aşamasında biriktiğini gösterdi.',
      'Bu bulguya dayanarak düşük riskli siparişler için otomatik onay başlatıldı.',
      'Uygulama sonrasındaki izleme, kapanış süresinin kısaldığını ortaya koydu.',
    ],
    [
      'Bir ekip, raporlar arasında tutarsızlıklar bulunduğunu belirledi.',
      'Bu tutarsızlıkların nedenini araştırmak için kullanılan tanımlar karşılaştırıldı.',
      'Karşılaştırma, aynı göstergenin farklı ekiplerde farklı hesaplandığını ortaya çıkardı.',
      'Bu nedenle ortak bir gösterge sözlüğü hazırlanarak tüm ekiplere dağıtıldı.',
      'Sözlük kullanılmaya başlandıktan sonra raporlar arasındaki farklar azaldı.',
    ],
    [
      'Bir kurum, eğitimlerin işe etkisini ölçmeye karar verdi.',
      'Bu amaçla benzer deneyime sahip iki çalışan grubu seçildi.',
      'Seçilen gruplardan yalnızca birine yeni eğitim verildi.',
      'Eğitim tamamlanınca her iki grup aynı uygulama sınavına alındı.',
      'İki grubun sonuçları karşılaştırılarak eğitimin olası etkisi değerlendirildi.',
    ],
    [
      'Bir depo, stok kayıtlarında sık hata oluştuğunu gözlemledi.',
      'Hataları sınıflandırmak için son dönemin kayıtları incelendi.',
      'İnceleme, benzer ürün kodlarının sıkça karıştırıldığını gösterdi.',
      'Bu karışıklığı azaltmak için kodlara kontrol basamağı eklendi.',
      'Yeni kod yapısı devreye girdikten sonra kayıt hataları yeniden ölçüldü.',
    ],
  ];
  root.Engine = {
    cats,
    typeNames,
    question,
    shuffle,
    R,
    perms,
    transform,
    rot,
    constrained,
    totalTemplates: 39,
    version: 2,
  };
})(typeof window === 'undefined' ? globalThis : window);
