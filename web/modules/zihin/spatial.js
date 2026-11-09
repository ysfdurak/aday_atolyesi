(function (root) {
  'use strict';
  const R = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a,
    pick = a => a[R(0, a.length - 1)],
    shuffle = a => Engine.shuffle(a),
    hash = s => {
      let n = 2166136261;
      for (let c of s) n = Math.imul(n ^ c.charCodeAt(0), 16777619);
      return (n >>> 0).toString(16);
    },
    key = points =>
      points
        .map(p => p.join(','))
        .sort()
        .join(';');
  function paper(points, w = 8, h = 8) {
    return `<svg viewBox="0 0 ${w * 17.5 + 12} ${h * 17.5 + 12}" width="${w * 17.5 + 12}" height="${h * 17.5 + 12}" role="img" aria-label="${w} sütun ${h} satır; delikler ${points.map(([x, y]) => x + 1 + ',' + (y + 1)).join('; ')}"><rect x="6" y="6" width="${w * 17.5}" height="${h * 17.5}" rx="3" fill="#f6f7f1" stroke="#718769"/>${Array.from({ length: w - 1 }, (_, i) => `<path d="M${6 + 17.5 * (i + 1)} 6v${h * 17.5}" stroke="#d8dfd0"/>`).join('')}${Array.from({ length: h - 1 }, (_, i) => `<path d="M6 ${6 + 17.5 * (i + 1)}h${w * 17.5}" stroke="#d8dfd0"/>`).join('')}${points.map(([x, y]) => `<circle cx="${6 + 17.5 * (x + 0.5)}" cy="${6 + 17.5 * (y + 0.5)}" r="5" fill="#356b50"/>`).join('')}</svg>`;
  }
  function unfold(seeds, ops) {
    let dimensions = [[8, 8]];
    for (let op of ops) {
      let [w, h] = dimensions.at(-1);
      dimensions.push(op === 'x' ? [w / 2, h] : [w, h / 2]);
    }
    let points = seeds.map(p => p.slice());
    for (let i = ops.length - 1; i >= 0; i--) {
      let [w, h] = dimensions[i],
        op = ops[i];
      points = [...points, ...points.map(([x, y]) => (op === 'x' ? [w - 1 - x, y] : [x, h - 1 - y]))];
    }
    return points;
  }
  const cubeSvg = c =>
    `<svg viewBox="0 0 150 150" width="138" height="138" role="img" aria-label="Küp üst ${c.u}, ön ${c.f}, sağ ${c.r}"><path d="M75 10 135 43 75 77 15 43Z" fill="#e1eacb" stroke="#57734c"/><path d="M15 43 75 77 75 140 15 106Z" fill="#bdd2aa" stroke="#57734c"/><path d="M75 77 135 43 135 106 75 140Z" fill="#91b092" stroke="#57734c"/><text x="75" y="51" text-anchor="middle" font-size="23" fill="#203e30">${c.u}</text><text x="44" y="99" text-anchor="middle" font-size="23" fill="#203e30">${c.f}</text><text x="106" y="99" text-anchor="middle" font-size="23" fill="#203e30">${c.r}</text></svg>`;
  function rotate(c, op) {
    return op === 'yaw'
      ? { ...c, f: c.l, r: c.f, b: c.r, l: c.b }
      : op === 'pitch'
        ? { ...c, u: c.b, f: c.u, d: c.f, b: c.d }
        : { ...c, u: c.l, r: c.u, d: c.r, l: c.d };
  }
  function orientations(c) {
    let all = [c],
      seen = new Set([JSON.stringify(c)]);
    for (let i = 0; i < all.length; i++)
      for (let op of ['yaw', 'pitch', 'roll']) {
        let n = rotate(all[i], op),
          k = JSON.stringify(n);
        if (!seen.has(k)) {
          seen.add(k);
          all.push(n);
        }
      }
    return all;
  }
  function create(type, level = 2) {
    let q, visual, answer, options, exp, hint, proof, template;
    if (type === 6) {
      let ops =
          level === 1
            ? [pick(['x', 'y'])]
            : level === 2
              ? shuffle(['x', 'y'])
              : pick([
                  ['x', 'y', 'x'],
                  ['y', 'x', 'y'],
                ]),
        w = 8 / 2 ** ops.filter(x => x === 'x').length,
        h = 8 / 2 ** ops.filter(x => x === 'y').length,
        seeds = [[R(0, w - 1), R(0, h - 1)]];
      if (level === 3) {
        let p = [R(0, w - 1), R(0, h - 1)];
        if (key([p]) !== key(seeds)) seeds.push(p);
      }
      let result = unfold(seeds, ops),
        candidate = [result],
        seen = new Set([key(result)]);
      for (let n = 0; candidate.length < 5 && n < 100; n++) {
        let shifted = result.map(([x, y]) => [(x + (n % 7) + 1) % 8, y]);
        if (n % 2) shifted = shifted.map(([x, y]) => [x, (y + 1) % 8]);
        if (!seen.has(key(shifted))) {
          seen.add(key(shifted));
          candidate.push(shifted);
        }
      }
      while (candidate.length < 5) {
        let p = result.map(v => v.slice()),
          occupied = new Set(p.map(v => v.join(','))),
          free = Array.from({ length: 64 }, (_, i) => [i % 8, Math.floor(i / 8)]).filter(
            v => !occupied.has(v.join(','))
          );
        p[R(0, p.length - 1)] = pick(free);
        if (!seen.has(key(p))) {
          seen.add(key(p));
          candidate.push(p);
        }
      }
      answer = paper(result);
      options = candidate.map(p => paper(p));
      q = 'Katlanan kâğıt belirtilen yerlerden deliniyor. Kâğıt tamamen açıldığında delikler nasıl görünür?';
      visual = `<p>8 × 8 kâğıt, sırayla ${ops.map(op => (op === 'x' ? 'sağ yarı sol yarının üzerine' : 'alt yarı üst yarının üzerine')).join('; ardından ')} katlanır. Aşağıda <b>katlanmış kâğıdın tamamı</b> ve delikler gösteriliyor. Izgara hücreleri referans içindir.</p><div class="spatialExample">${paper(seeds, w, h)}</div>`;
      exp = `Katlamaları ters sırada aç. Her açılışta mevcut deliklerin kat çizgisine göre yansımaları da oluşur. ${ops.length} katlama sonunda ${result.length} delik oluşur. Şekilde yalnızca delik sayısını değil yerlerini de denetle.`;
      hint = 'Son katlamadan geriye doğru ilerle; bir deliği her açılışta kat çizgisinin öbür yanına yansıt.';
      proof = { kind: 'spatial-fold', ops, seeds, w, h, result, choices: candidate };
      template = 'fold-' + ops.join('');
    }
    if (type === 7) {
      let letters = shuffle(['A', 'B', 'C', 'D', 'E', 'F']),
        initial = Object.fromEntries(['u', 'd', 'f', 'b', 'r', 'l'].map((k, i) => [k, letters[i]])),
        ops = Array.from({ length: level }, () => pick(['yaw', 'pitch', 'roll'])),
        result = ops.reduce(rotate, initial),
        all = orientations(initial),
        wrong = shuffle(all.filter(c => c.u !== result.u || c.f !== result.f || c.r !== result.r)).slice(
          0,
          4
        );
      q = 'Küp, belirtilen hareketler sırayla uygulanınca hangi görünümü alır?';
      let text = {
        yaw: 'Ön yüz sağ yüze gelecek biçimde dikey eksen etrafında 90° döndür.',
        pitch: 'Üst yüz ön yüze gelecek biçimde 90° öne döndür.',
        roll: 'Üst yüz sağ yüze gelecek biçimde 90° sağa yatır.',
      };
      visual = `<div class="spatialExample">${cubeSvg(initial)}</div><p>Karşıt yüzler: ${initial.u}–${initial.d}, ${initial.f}–${initial.b}, ${initial.r}–${initial.l}.</p><ol>${ops.map(o => '<li>' + text[o] + '</li>').join('')}</ol>`;
      answer = cubeSvg(result);
      options = [answer, ...wrong.map(cubeSvg)];
      exp = `Yüzlerin yerlerini her hareketten sonra ayrı güncelle. Son durumda üst ${result.u}, ön ${result.f}, sağ ${result.r}. Bir önceki hareketi ilk küpe değil o anki görünüme uygula.`;
      hint = 'Üst, ön ve sağ için üç ayrı kayıt tut; görünmeyen yüzleri karşıt çiftlerden bul.';
      proof = { kind: 'spatial-cube', initial, ops, result, choices: [result, ...wrong] };
      template = 'cube-' + ops.join('-');
    }
    if (type === 8) {
      let x = R(2, 3),
        y = R(2, 3),
        direction = R(0, 3),
        initial = { x, y, direction },
        ops = [],
        vectors = [
          [0, -1],
          [1, 0],
          [0, 1],
          [-1, 0],
        ],
        n = level * 2 + 2;
      for (let i = 0; i < n; i++) {
        let possibilities = [];
        for (let turn of [-1, 0, 1])
          for (let step of [1, 2]) {
            let d = (direction + turn + 4) % 4,
              [dx, dy] = vectors[d],
              xx = x + dx * step,
              yy = y + dy * step;
            if (xx >= 0 && xx < 6 && yy >= 0 && yy < 6) possibilities.push({ turn, step, d, xx, yy });
          }
        let o = pick(possibilities);
        ops.push({ turn: o.turn, step: o.step });
        direction = o.d;
        x = o.xx;
        y = o.yy;
      }
      q = 'Robot komutları sırayla uyguladığında hangi hücrede durur?';
      const coord = (x, y) => String.fromCharCode(65 + x) + (y + 1),
        arrows = ['↑', '→', '↓', '←'];
      visual =
        '<p>Üst satır 1, sol sütun A’dır. Dönüşler robotun o an baktığı yöne göredir.</p><div class="spatialBoard">' +
        Array.from(
          { length: 36 },
          (_, i) =>
            `<span>${i % 6 === initial.x && Math.floor(i / 6) === initial.y ? '<b>' + arrows[initial.direction] + '</b>' : coord(i % 6, Math.floor(i / 6))}</span>`
        ).join('') +
        '</div><ol>' +
        ops
          .map(
            o =>
              `<li>${o.turn === -1 ? 'Sola 90° dön' : o.turn === 1 ? 'Sağa 90° dön' : 'Yönünü koru'}, ${o.step} hücre ilerle.</li>`
          )
          .join('') +
        '</ol>';
      answer = coord(x, y);
      options = [
        answer,
        ...shuffle(
          Array.from({ length: 36 }, (_, i) => coord(i % 6, Math.floor(i / 6))).filter(c => c !== answer)
        ).slice(0, 4),
      ];
      exp = `Her dönüşte yönü, her ilerlemede koordinatı güncelle. Başlangıç ${coord(initial.x, initial.y)}; son hücre ${answer}. “Sağ” ve “sol”, ekranın sabit sağı ve solu değildir.`;
      hint = 'Dört yönü bir halka olarak düşün; her komuttan sonra hem yönünü hem konumunu güncelle.';
      proof = { kind: 'spatial-route', initial, ops, result: { x, y, direction } };
      template = 'relative-route-' + n;
    }
    return {
      cat: 'shape',
      type,
      level,
      q,
      visual,
      answer,
      options: shuffle(options),
      exp,
      hint,
      hints: [
        hint,
        'Şıkları değerlendirmeden önce kendi ara durumlarını çıkar; son görünümü bu kayıtlarla karşılaştır.',
      ],
      proof,
      templateId: 'spatial-v4-' + template,
      bankVersion: 4,
      engineVersion: 2,
      id: hash(q + visual + answer),
      target: 90,
    };
  }
  root.Spatial = { create, unfold, rotate, orientations, paper, cubeSvg };
})(typeof window === 'undefined' ? globalThis : window);
