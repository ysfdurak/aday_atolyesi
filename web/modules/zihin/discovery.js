(function (root) {
  'use strict';
  const R = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a,
    pick = a => a[R(0, a.length - 1)],
    shuffle = a => Engine.shuffle(a),
    fmt = n => n.toLocaleString('tr-TR');
  const hash = s => {
    let a = 2166136261,
      b = 5381;
    for (let c of s) {
      a = Math.imul(a ^ c.charCodeAt(0), 16777619);
      b = Math.imul(b, 33) ^ c.charCodeAt(0);
    }
    return (a >>> 0).toString(16) + (b >>> 0).toString(16);
  };
  const family = (id, name, pairs) => ({
    id,
    name,
    domain: 'num',
    build(level) {
      let [t, v] = pick(pairs),
        task = pick(['end', 'middle']);
      let q = Numeric.create(t, level, v, task);
      q.discoveryFormat = task;
      return q;
    },
  });
  // Parameter changes and mathematically similar templates share ONE scheduling key.
  const catalog = [
    family('cycle', 'İşlem sırası ve değişen katsayılar', [
      [0, 0],
      [0, 1],
      [0, 2],
      [0, 3],
      [0, 6],
      [0, 4],
      [0, 5],
      [0, 7],
      [0, 8],
      [0, 9],
      [0, 10],
      [0, 11],
    ]),
    family('interleave', 'İç içe bağımsız diziler', [
      [1, 0],
      [1, 1],
      [1, 2],
      [1, 4],
      [1, 5],
      [1, 6],
      [1, 11],
    ]),
    family(
      'differences',
      'Farkların içindeki düzen',
      Array.from({ length: 12 }, (_, v) => [2, v])
    ),
    family('recurrence', 'Önceki terimler arasında ilişki', [
      [3, 0],
      [3, 1],
      [3, 2],
      [3, 4],
      [3, 5],
      [3, 6],
      [3, 7],
      [3, 11],
    ]),
    family('digits', 'Sayının rakam yapısı', [
      [3, 3],
      [3, 8],
      [3, 9],
      [3, 10],
    ]),
    family('special', 'Asal, faktöriyel ve özel sayı yapıları', [
      [4, 2],
      [4, 3],
      [4, 9],
      [4, 10],
      [4, 11],
    ]),
    family('groups', 'Çiftler ve üçlüler arası ilişki', [
      [1, 3],
      [1, 7],
      [1, 8],
      [1, 9],
      [1, 10],
    ]),
  ];
  function table(rows) {
    return (
      '<div class="tablewrap"><table class="numberGrid">' +
      rows
        .map(row => '<tr>' + row.map(x => `<td>${x === '?' ? '?' : fmt(x)}</td>`).join('') + '</tr>')
        .join('') +
      '</table></div>'
    );
  }
  function custom(id, name, build) {
    catalog.push({ id, name, domain: 'num', build });
  }
  function question(visual, value, exp, clue, proof, wrong = []) {
    let options = Numeric.choices(value, [
      ...wrong,
      value - 2,
      value + 2,
      value - 4,
      value + 4,
      value - 1,
      value + 1,
      value + 6,
    ]);
    return {
      cat: 'num',
      type: 0,
      q: 'Verilen örneklerin tamamına uyan ilişkiyi bul. Soru işaretinin değeri kaçtır?',
      visual,
      answer: fmt(value),
      options: options.map(fmt),
      exp,
      hint: clue,
      hints: [
        clue,
        'İlk örneğe uyan bir kuralı, diğer bütün örneklerde de kontrol et. Tek eşleşme yeterli değildir.',
      ],
      id: 'discovery-' + hash(JSON.stringify([visual, value])),
      engineVersion: 3,
      proof,
    };
  }
  custom('matrix', 'Satır–sütun bileşimi', level => {
    let mode = R(0, 2),
      rows = Array.from({ length: 4 }, () => [R(4, 15), R(3, 9)]),
      k = R(2, 5),
      f = (a, b) => (mode === 0 ? a * b - a : mode === 1 ? a * a - b : a * b + a + b),
      values = rows.map(([a, b]) => f(a, b)),
      transpose = R(0, 1),
      display = rows.map(([a, b], i) => [a, b, i === 3 ? '?' : values[i]]);
    if (transpose) display = display[0].map((_, i) => display.map(row => row[i]));
    return question(
      table(display),
      values[3],
      `Her ${transpose ? 'sütunda' : 'satırda'} son sayı = ${['birinci × ikinci − birinci', 'birincinin karesi − ikinci', 'birinci × ikinci + birinci + ikinci'][mode]}. Tüm örnekler bu ilişkiyi sağlar.`,
      `Sadece yatay okumaya bağlı kalma; aynı konumdaki giriş ve sonuçları satır ve sütun yönlerinde karşılaştır.`,
      { kind: 'discovery-matrix', mode, rows, values, transpose },
      [rows[3][0] * rows[3][1], rows[3][0] + rows[3][1], rows[3][0] ** 2 + rows[3][1]]
    );
  });
  custom('composition', 'İşlem sırasını tersinden kurma', level => {
    let a = R(2, 4),
      b = R(3, 8),
      xs = [R(2, 5), R(7, 10), R(12, 15)],
      reverse = R(0, 1),
      f = x => (x + b) * a,
      ys = xs.map(f),
      target = R(17, 22),
      value = reverse ? target : f(target),
      visual = table(xs.map((x, i) => [x, ys[i]]).concat([reverse ? ['?', f(target)] : [target, '?']]));
    return question(
      visual,
      value,
      `Sol sayı önce ${b} artırılır, sonra ${a} ile çarpılır. ${reverse ? 'Son satırda işlemleri ters sırada geri al: önce böl, sonra çıkar.' : 'Aynı iki işlemi son girişe de sırayla uygula.'}`,
      'Giriş–çıkış eşleşmelerinde yalnızca çarpanı arama; işlemlerin sırasını ve sabitin çarpmadan önce mi sonra mı geldiğini denetle.',
      { kind: 'discovery-composition', a, b, xs, ys, target, reverse },
      reverse ? [target + b, target - b, target * a] : [a * target + b, a * target, a * (target - b)]
    );
  });
  custom('invariant', 'Gruplarda korunan nicelik', level => {
    let total = R(75, 110),
      weights = shuffle([1, 2, 3]),
      inputs = Array.from({ length: 4 }, () => [R(3, 8), R(3, 8)]),
      rows = inputs.map(([a, b]) => [a, b, total - weights[0] * a - weights[1] * b]);
    if (
      (inputs[1][0] - inputs[0][0]) * (inputs[2][1] - inputs[0][1]) ===
      (inputs[2][0] - inputs[0][0]) * (inputs[1][1] - inputs[0][1])
    )
      return catalog.find(r => r.id === 'invariant').build(level);
    return question(
      table(rows.map((row, i) => (i === 3 ? [row[0], row[1], '?'] : row))),
      rows[3][2],
      `Her satırda ${weights[0]} × birinci + ${weights[1]} × ikinci + üçüncü = ${total}. Ayrı sayılar yerine korunan toplamı ara.`,
      'Grupların tek tek sayılarını değil, ağırlıklı toplamları gibi ortak kalan bir niceliği karşılaştır.',
      { kind: 'discovery-invariant', total, weights, rows },
      [total - rows[3][0] - rows[3][1], rows[2][2], rows[3][2] + weights[0]]
    );
  });
  custom('operators', 'Sembollerin gizli işlemleri', level => {
    let mode = R(0, 2),
      symbols = shuffle(['◇', '⊙', '△']),
      f = (a, b) => (mode === 0 ? a * a + b : mode === 1 ? a * b + a : a * a - b * b),
      inputs = [
        [R(9, 12), R(3, 5)],
        [R(13, 16), R(4, 7)],
        [R(17, 20), R(6, 8)],
        [R(21, 24), R(7, 10)],
      ],
      sym = symbols[0],
      values = inputs.map(([a, b]) => f(a, b)),
      visual =
        '<div class="passage">' +
        inputs.map(([a, b], i) => `${a} ${sym} ${b} = ${i === 3 ? '?' : fmt(values[i])}`).join('<br>') +
        '</div>';
    return question(
      visual,
      values[3],
      `${sym} işareti ${['a² + b', 'a × b + a', 'a² − b²'][mode]} işlemini temsil eder. Standart bir matematik işareti gibi okumadan tüm eşitliklerden tanımla.`,
      'Sembolün bilinen toplama/çarpma anlamını taşıdığını varsayma; iki girişin ayrı ayrı nasıl kullanıldığını araştır.',
      { kind: 'discovery-operators', mode, inputs, values },
      [inputs[3][0] * inputs[3][1], inputs[3][0] ** 2 + inputs[3][1] ** 2, inputs[3][0] + inputs[3][1]]
    );
  });
  custom('path', 'Yerleşim boyunca ilerleyen örüntü', level => {
    let start = R(3, 12),
      step = R(3, 8),
      n = 3,
      positions = R(0, 1) ? [0, 1, 2, 5, 8, 7, 6, 3, 4] : [0, 1, 2, 5, 4, 3, 6, 7, 8],
      full = Array.from({ length: 9 }, (_, i) => start + i * step),
      hole = R(4, 7),
      grid = Array(9);
    positions.forEach((pos, i) => (grid[pos] = i === hole ? '?' : full[i]));
    return question(
      table([grid.slice(0, 3), grid.slice(3, 6), grid.slice(6)]),
      full[hole],
      `Sayılar ${positions[8] === 4 ? 'dış kenardan merkeze saat yönünde bir spiral' : 'satırlarda yön değiştirerek zikzak'} boyunca ${step} artar. Okuma yolunu bulunca eksik sayı ${fmt(full[hole])} olur.`,
      'Her satırı ayrı bir formül saymak yerine, hücreler arasında tek bir okuma yolu olup olmadığını araştır.',
      { kind: 'discovery-path', start, step, positions, full, hole },
      [full[hole] - step, full[hole] + step, full[hole] + 2 * step]
    );
  });
  custom('code', 'Basamaklar arasında kodlama', level => {
    let mode = R(0, 2),
      xs = shuffle([24, 35, 46, 57, 68, 79, 83, 92]).slice(0, 4),
      f = x => {
        let a = Math.floor(x / 10),
          b = x % 10;
        return mode === 0 ? 10 * (a + b) + Math.abs(a - b) : mode === 1 ? a * a + b * b : a * b + a + b;
      },
      values = xs.map(f);
    return question(
      table(xs.map((x, i) => [x, i === 3 ? '?' : values[i]])),
      values[3],
      `Soldaki sayının onlar basamağı a, birler basamağı b. Sağdaki = ${['10 × (a+b) + |a−b|', 'a² + b²', 'a × b + a + b'][mode]}. Burada sayının tamamı yerine basamaklar birlikte kullanılır.`,
      'Girişin tamamına tek işlem uygulamak yetmiyorsa onlar ve birler basamağını ayrı değişkenler olarak düşün.',
      { kind: 'discovery-code', mode, xs, values },
      [xs[3], Math.floor(xs[3] / 10) + (xs[3] % 10), values[3] + 10]
    );
  });
  custom('conditional', 'Girdiye göre değişen kural', level => {
    let k = R(2, 5),
      xs = shuffle([
        R(3, 6) * 2,
        R(7, 10) * 2,
        R(11, 14) * 2,
        R(3, 6) * 2 + 1,
        R(7, 10) * 2 + 1,
        R(11, 14) * 2 + 1,
      ]),
      target = R(31, 45),
      f = x => (x % 2 ? 2 * x - k : x / 2 + k),
      ys = xs.map(f);
    return question(
      table(xs.map((x, i) => [x, ys[i]]).concat([[target, '?']])),
      f(target),
      `Girdi çiftse ikiye bölünüp ${k} eklenir; tekse ikiyle çarpılıp ${k} çıkarılır. İşlem seçimini konum değil girdinin özelliği belirler.`,
      'Tek bir formül tüm eşleşmeleri açıklamıyorsa girdileri ortak bir özelliklerine göre iki gruba ayırmayı dene.',
      { kind: 'discovery-conditional', k, xs, ys, target },
      [2 * target + k, Math.floor(target / 2) + k, 2 * target - k]
    );
  });
  custom('symbol-values', 'Birden fazla eşitlikten değer çıkarma', level => {
    let x = R(5, 12),
      y = R(13, 20),
      z = R(21, 28),
      a = R(2, 4),
      b = R(2, 3),
      visual = `<div class="passage">● + ▲ = ${x + y}<br>▲ + ■ = ${y + z}<br>● + ■ = ${x + z}<br><br>${a} × ● + ${b} × ■ − ▲ = ?</div>`;
    return question(
      visual,
      a * x + b * z - y,
      `İlk üç eşitliği toplayınca her sembol iki kez sayılır: toplamın yarısı ${x + y + z}. Diğer çift toplamlarını çıkar: ●=${x}, ▲=${y}, ■=${z}. Son ifadeye bu değerleri yerleştir.`,
      'Bir eşitliği tek başına çözmeye çalışma. Eşitlikleri toplama veya birbirinden çıkarma yoluyla bir sembolü ele.',
      { kind: 'discovery-symbol-values', x, y, z, a, b },
      [a * x + b * y - z, a * x + b * z + y, a * (x + z) - y]
    );
  });
  // A different display is not a new strategy. Merge equivalent representations.
  for (let [parent, child] of [
    ['digits', 'code'],
    ['groups', 'composition'],
  ]) {
    let a = catalog.find(r => r.id === parent),
      b = catalog.find(r => r.id === child),
      fa = a.build,
      fb = b.build;
    a.build = level => pick([fa, fb])(level);
    catalog.splice(catalog.indexOf(b), 1);
  }
  for (let [id, name, types] of [
    ['visual-combine', 'Hücrelerde birleşme ve dönüşüm', [0, 3, 4]],
    ['visual-features', 'Birden fazla görsel özelliğin değişimi', [1, 5]],
    ['visual-constraints', 'Satır–sütun kısıtları', [2]],
  ])
    catalog.push({ id, name, domain: 'shape', build: level => Engine.question('shape', pick(types), level) });
  for (let [id, name, type] of [
    ['visual-fold', 'Katlama ve yansıyan delikler', 6],
    ['visual-cube', 'Üç boyutlu küp yönelimi', 7],
    ['visual-route', 'Göreli yönlerle konum izleme', 8],
  ])
    catalog.push({ id, name, domain: 'shape', build: level => Engine.question('shape', type, level) });
  const blank = () => ({ stats: {}, runs: [], last: [] }),
    key = (id, level) => id + '@' + level;
  const stat = (state, id, level) => state.stats?.[key(id, level)] || { trials: [], nextDue: 0 };
  const byId = id => catalog.find(r => r.id === id);
  function plan(state, level = 2, scope = 'num', now = Date.now()) {
    let eligible = catalog.filter(r => scope === 'mixed' || r.domain === 'num'),
      rank = r => {
        let s = stat(state, r.id, level),
          tr = s.trials;
        if (!tr.length) return -1e15;
        let last = tr.at(-1);
        return s.nextDue <= now ? s.nextDue - 1e13 : last.at;
      };
    // Prioritize coverage and due review; tie randomness and final shuffle prevent a learnable order.
    let chosen = shuffle(eligible)
        .sort((a, b) => rank(a) - rank(b))
        .slice(0, 12),
      ids = shuffle(chosen.map(r => r.id));
    if (ids[0] === state.last?.at(-1) && ids.length > 1) [ids[0], ids[1]] = [ids[1], ids[0]];
    return ids;
  }
  function create(id, level = 2, seen = new Set(), previousFormat = null) {
    let r = byId(id),
      q,
      tries = 0;
    do {
      q = r.build(level);
      q.discoveryFormat = q.discoveryFormat || q.proof.kind;
    } while (
      (seen.has(q.id) ||
        (previousFormat &&
          ['digits', 'groups', 'cycle', 'interleave', 'differences', 'recurrence', 'special'].includes(id) &&
          q.discoveryFormat === previousFormat)) &&
      ++tries < 80
    );
    q.level = level;
    q.strategyId = id;
    q.discoveryVersion = 1;
    q.discoveryFormat = q.discoveryFormat || q.proof.kind;
    q.q = q.cat === 'shape' ? 'Verilen örneklerdeki ilişkiyi keşfet. Eksik olanı seç.' : q.q;
    seen.add(q.id);
    return q;
  }
  function record(state, trial) {
    state.stats = state.stats || {};
    let k = key(trial.strategyId, trial.level),
      s = stat(state, trial.strategyId, trial.level);
    s.trials.push(trial);
    s.trials = s.trials.slice(-50);
    let last = s.trials.slice(-4),
      ok = trial.correct && !trial.hinted;
    const DAY = 86400000;
    if (!ok) s.nextDue = trial.at + DAY;
    else if (!s.nextDue || s.nextDue <= trial.at) {
      let reliable = last.filter(t => t.correct && !t.hinted).length;
      s.nextDue = trial.at + (reliable >= 4 ? 7 : reliable >= 2 ? 3 : 1) * DAY;
    }
    state.stats[k] = s;
  }
  function goal(state, q) {
    let rows = stat(state, q.strategyId, q.level)
        .trials.filter(t => t.format === q.discoveryFormat)
        .slice(-8),
      right = rows.filter(t => t.correct && !t.hinted);
    return rows.length >= 5 && right.length / rows.length >= 0.8
      ? Math.round(Coach.median(right.map(t => t.sec)))
      : null;
  }
  root.Discovery = { catalog, blank, key, stat, byId, plan, create, record, goal };
})(typeof window === 'undefined' ? globalThis : window);
