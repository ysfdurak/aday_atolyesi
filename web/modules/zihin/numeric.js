(function (root) {
  'use strict';
  const R = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a,
    pick = a => a[R(0, a.length - 1)],
    shuffle = a => {
      a = a.slice();
      for (let i = a.length - 1; i > 0; i--) {
        let j = R(0, i);
        [a[i], a[j]] = [a[j], a[i]];
      }
      return a;
    },
    fmt = n => n.toLocaleString('tr-TR'),
    sumDigits = n => [...String(n)].reduce((s, x) => s + Number(x), 0),
    factorial = n => (n <= 1 ? 1 : n * factorial(n - 1)),
    primes = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31];
  function hash(s) {
    let a = 2166136261,
      b = 5381;
    for (let i = 0; i < s.length; i++) {
      a = Math.imul(a ^ s.charCodeAt(i), 16777619);
      b = Math.imul(b, 33) ^ s.charCodeAt(i);
    }
    return (a >>> 0).toString(16) + (b >>> 0).toString(16);
  }

  const extraNames = [
    [
      'Çarpma ve büyüyen ekleme',
      'Çarpma–bölme dört adımı',
      'Çarpma ve artan çıkarma',
      'Dönüşümlü iki çarpan',
      'İşaret değiştiren sabit',
      'Dönüşümlü iki afin işlem',
      'Dört adımlı işlem döngüsü',
      'Çarpma–bölme ve kaydırma',
    ],
    [
      'İki alt dizide büyüyen fark',
      'Kare ve küp alt dizileri',
      'Aritmetik ve özyinelemeli alt dizi',
      'Çiftlerde doğrusal dönüşüm',
      'Üçlülerde ağırlıklı toplam',
      'Üçlülerde çarpım ve sabit',
      'Çiftlerde sabit toplam',
      'Üç aritmetik alt dizi',
    ],
    [
      'Kare büyüyen farklar',
      'Küp büyüyen farklar',
      'Asal büyüyen farklar',
      'Fibonacci farkları',
      'Sabit ve büyüyen fark dönüşümü',
      'Geometrik ikinci fark',
      'Üçgensel farklar',
      'Faktöriyel farklar',
    ],
    [
      'Öncekinin iki katı ve iki önceki',
      'Son üç terimin toplamı',
      'Bir önceki ve üç önceki',
      'Üç katından iki öncekiyi çıkar',
      'Rakam karelerinin toplamı',
      'Ters yazımıyla toplama',
      'Basamak sayısıyla ilerleme',
      'Konuma göre ağırlıklı özyineleme',
    ],
    [
      'Üçgensel sayılar ve ölçek',
      'İkinin kuvvetleri ve kaydırma',
      'Üçün kuvvetleri ve kaydırma',
      'Karelerde dönüşümlü kaydırma',
      'Kare ve küp toplamı',
      'Kare ve asal toplamı',
      'Konumla çarpılmış faktöriyel',
      'Sayının kendi kuvveti',
    ],
  ];
  function extended(type, v, level) {
    let j = v - 4,
      a = R(4, 9),
      b = R(2, 3),
      k = R(2, 6),
      p = { a, b, k },
      full = [],
      rule = '',
      direction = '',
      observe = '',
      method = '';
    const build = (seed, fn, len = 8) => {
      let x = seed.slice();
      while (x.length < len) x.push(fn(x, x.length));
      return x;
    };
    if (type === 0) {
      const f = [
        (x, i) => (i % 2 ? x.at(-1) * b : x.at(-1) + (k * i) / 2),
        (x, i) => [x.at(-1) + k, x.at(-1) * b, x.at(-1) + k * b, x.at(-1) / b][(i - 1) % 4],
        (x, i) => x.at(-1) * b - i * k,
        (x, i) => x.at(-1) * (i % 2 ? 2 : 3) + k,
        (x, i) => x.at(-1) * b + (i % 2 ? k : -k),
        (x, i) => x.at(-1) * (i % 2 ? 2 : 3) + (i % 2 ? k : -k),
        (x, i) => [x.at(-1) + k, x.at(-1) + 2 * k, x.at(-1) - k, x.at(-1) * 2][(i - 1) % 4],
        (x, i) => (i % 2 ? x.at(-1) * b : x.at(-1) / b + k),
      ];
      if (j === 2) p.a = a = R(20, 30);
      full = build([a], f[j], j === 1 || j === 6 ? 11 : 8);
      rule = [
        `Sırayla ×${b}, +${k}, ×${b}, +${2 * k}, … uygulanır. Toplama adımları ${k} artar.`,
        `Dört adımlı döngü: +${k}, ×${b}, +${k * b}, ÷${b}.`,
        `n. geçişte önceki terim ×${b} − n×${k}.`,
        `Sırayla ×2 + ${k}, ardından ×3 + ${k}.`,
        `Her geçiş ×${b}; sonrasında sırayla +${k} ve −${k}.`,
        `Sırayla ×2 + ${k} ve ×3 − ${k}.`,
        `Dört adımlı döngü: +${k}, +${2 * k}, −${k}, ×2.`,
        `Sırayla ×${b} ve ÷${b} + ${k}.`,
      ][j];
      direction =
        'Geçişleri numaralandır. Sabit tek işlem yerine dönüşümlü veya konuma bağlı işlemleri araştır.';
      observe =
        'Aynı konum grubundaki geçişleri karşılaştır. Çarpan, sabit ve işlem sırasından hangisinin değiştiğini ayır.';
    }
    if (type === 1) {
      p.starts = [R(5, 12), R(12, 18), R(22, 30)];
      p.steps = [R(2, 4), R(4, 7), R(7, 9)];
      if (j === 0)
        full = Array.from(
          { length: 10 },
          (_, i) => p.starts[i % 2] + p.steps[i % 2] * ((Math.floor(i / 2) * (Math.floor(i / 2) + 1)) / 2)
        );
      if (j === 1)
        full = Array.from(
          { length: 10 },
          (_, i) => p.starts[i % 2] + (Math.floor(i / 2) + 1) ** (i % 2 ? 3 : 2)
        );
      if (j === 2) {
        p.fib = build([a, a + k], x => x.at(-1) + x.at(-2), 5);
        full = Array.from({ length: 10 }, (_, i) =>
          i % 2 ? p.fib[Math.floor(i / 2)] : p.starts[0] + Math.floor(i / 2) * k
        );
      }
      if (j >= 3 && j <= 6) {
        p.inputs = shuffle([3, 4, 5, 6, 7, 8, 9]).slice(0, 4);
        p.others = shuffle([2, 3, 4, 5, 6, 7, 8]).slice(0, 4);
        p.total = R(35, 50);
        full = p.inputs.flatMap((x, i) =>
          j === 3
            ? [x, b * x + k]
            : j === 4
              ? [x, p.others[i], b * x + p.others[i]]
              : j === 5
                ? [x, p.others[i], x * p.others[i] + k]
                : [x, p.total - x]
        );
      }
      if (j === 7)
        full = Array.from({ length: 12 }, (_, i) => p.starts[i % 3] + Math.floor(i / 3) * p.steps[i % 3]);
      rule = [
        `Tek ve çift konumlardaki farklar ayrı ayrı ${p.steps[0]} ve ${p.steps[1]} katlarıyla büyür.`,
        `Tek konumlarda başlangıca sıralı kareler; çift konumlarda sıralı küpler eklenir.`,
        `Tek konumlar +${k}; çift konumlar son iki çift-konum terimin toplamıdır.`,
        `Her bağımsız çiftte y = ${b}x + ${k}.`,
        `Her üçlüde üçüncü sayı = ${b} × birinci + ikinci.`,
        `Her üçlüde üçüncü sayı = birinci × ikinci + ${k}.`,
        `Her bağımsız çiftin toplamı ${p.total}.`,
        `Her üçüncü konum ayrı bir aritmetik dizidir; adımlar ${p.steps.join(', ')}.`,
      ][j];
      direction =
        'Önce yerleşimi sınayabilirsin: tek–çift konumlar mı, bağımsız çiftler mi, üçlü gruplar mı?';
      observe =
        'Komşular arasında ilişki bulamıyorsan aynı konumdaki alt diziyi dene. Gruplar bağımsızsa her grupta aynı dönüşüm çalışmalı.';
    }
    if (type === 2) {
      p.d = R(2, 4);
      let fib = [1, 2, 3, 5, 8, 13, 21, 34],
        tri = n => (n * (n + 1)) / 2;
      const delta = i =>
        [
          () => k * i * i,
          () => k * i ** 3,
          () => k * primes[i - 1],
          () => k * fib[i - 1],
          () => (i % 2 ? k : (i / 2) * p.d),
          () => p.d + (k * (b ** (i - 1) - 1)) / (b - 1),
          () => k * tri(i),
          () => factorial(i + 1),
        ][j]();
      full = build([a], (x, i) => x.at(-1) + delta(i));
      rule = [
        `Ardışık farklar ${k} × 1², ${k} × 2², …`,
        `Ardışık farklar ${k} × 1³, ${k} × 2³, …`,
        `Ardışık farklar sıralı asal sayıların ${k} katıdır.`,
        `Ardışık farklar 1, 2, 3, 5, 8, … dizisinin ${k} katıdır.`,
        `Farklar sırayla sabit ${k} ve ${p.d}, ${2 * p.d}, ${3 * p.d}, … olur.`,
        `İlk fark ${p.d}; ikinci farklar ${k}, ${k * b}, ${k * b * b}, … biçiminde büyür.`,
        `Ardışık farklar üçgensel sayıların ${k} katıdır: ${k}, ${3 * k}, ${6 * k}, …`,
        `Ardışık farklar 2!, 3!, 4!, … biçimindedir.`,
      ][j];
      direction =
        'Sayılardan birinci farklara geç. Gerekirse farkların özel sayı yapısını veya ikinci farkları incele.';
      observe =
        'Bulduğun farklar sabit artmıyorsa kare, küp, asal, dönüşüm veya önceki farkların toplamı olasılığını karşılaştır.';
    }
    if (type === 3) {
      p.seed = [a, a + k, a + 2 * k];
      const rev = n => Number(String(n).split('').reverse().join('')),
        squareDigits = n => [...String(n)].reduce((s, c) => s + (+c) ** 2, 0);
      if (j === 0) full = build(p.seed.slice(0, 2), x => 2 * x.at(-1) + x.at(-2));
      if (j === 1) full = build(p.seed, x => x.at(-1) + x.at(-2) + x.at(-3));
      if (j === 2) full = build(p.seed, x => x.at(-1) + x.at(-3));
      if (j === 3) full = build(p.seed.slice(0, 2), x => 3 * x.at(-1) - x.at(-2));
      if (j === 4) full = build([R(25, 68)], x => x.at(-1) + squareDigits(x.at(-1)));
      if (j === 5) full = build([R(21, 48)], x => x.at(-1) + rev(x.at(-1)), 7);
      if (j === 6) full = build([R(85, 97)], x => x.at(-1) + String(x.at(-1)).length * k);
      if (j === 7) full = build(p.seed.slice(0, 2), (x, i) => x.at(-1) + i * x.at(-2), 7);
      p.initial = full.slice(0, j === 1 || j === 2 ? 3 : j === 4 || j === 5 || j === 6 ? 1 : 2);
      rule = [
        `Yeni terim = 2 × bir önceki + iki önceki.`,
        `Yeni terim = son üç terimin toplamı.`,
        `Yeni terim = bir önceki + üç önceki.`,
        `Yeni terim = 3 × bir önceki − iki önceki.`,
        `Sayıya kendi rakamlarının kareleri toplamı eklenir.`,
        `Sayıya rakamları ters sırada yazılmış hali eklenir. Baştaki sıfırlar düşer.`,
        `Sayıya basamak sayısının ${k} katı eklenir.`,
        `0'dan başlayan i konumundaki terim = önceki + i × iki önceki (i ≥ 2).`,
      ][j];
      direction =
        j >= 4 && j <= 6
          ? 'Geçişi önce sayının rakamları ve basamak yapısıyla sınayabilirsin.'
          : 'Tek komşu yerine son iki veya üç terimi birlikte dene.';
      observe =
        j >= 4 && j <= 6
          ? 'Rakam toplamı yetmiyorsa kareler toplamı, ters yazım veya basamak sayısı ile oluşan artışı karşılaştır.'
          : 'Bir adayı en az iki ayrı terimde denetle; toplamın yanında katsayı veya çıkarma da gerekebilir.';
    }
    if (type === 4) {
      p.scale = j === 3 ? R(2, 3) : level === 1 ? 1 : R(2, 3);
      p.start = 1;
      const f = n =>
        [
          () => (p.scale * n * (n + 1)) / 2 + k,
          () => p.scale * 2 ** n + k,
          () => p.scale * 3 ** n + k,
          () => p.scale * n * n + (n % 2 ? k : -k),
          () => p.scale * (n * n + n ** 3) + k,
          () => p.scale * (n * n + primes[n - 1]) + k,
          () => n * factorial(n) + k,
          () => n ** n + k,
        ][j]();
      full = Array.from({ length: j === 7 ? 6 : 7 }, (_, i) => f(i + 1));
      rule = [
        `Terimler ${p.scale} × n(n+1)/2 + ${k}; n = 1, 2, …`,
        `Terimler ${p.scale} × 2ⁿ + ${k}; n = 1, 2, …`,
        `Terimler ${p.scale} × 3ⁿ + ${k}; n = 1, 2, …`,
        `Terimler ${p.scale}n² ve sırayla +${k}, −${k} kaydırması.`,
        `Terimler ${p.scale} × (n² + n³) + ${k}.`,
        `Terimler ${p.scale} × (n² + n. asal sayı) + ${k}.`,
        `Terimler n × n! + ${k}.`,
        `Terimler nⁿ + ${k}; n = 1, 2, …`,
      ][j];
      direction =
        'Sıra numarasını ve özel sayı dizilerini kullan. Ortak bir katsayı veya dönüşümlü kaydırma olabilir.';
      observe =
        'Sabit kaydırmayı ayırınca kare, kuvvet, üçgensel sayı veya faktöriyel yapılarından hangisinin tüm terimleri açıkladığını dene.';
    }
    method = rule + ' İlk uygun örnekle yetinme; en az iki başka bilinen geçişte de aynı ilişkiyi doğrula.';
    return { p, full, rule, direction, observe, method, wrong: [] };
  }

  function spec(type, variant, level) {
    if (variant >= 4 && type !== 5) return extended(type, variant, level);
    let a = R(3, 8),
      b = R(2, 4),
      k = R(2, 7),
      p = {},
      rule = '',
      direction = '',
      observe = '',
      method = '',
      full = [],
      wrong = [];
    const build = (seed, fn, len = 8) => {
      let v = seed.slice();
      while (v.length < len) v.push(fn(v, v.length));
      return v;
    };
    if (type === 0) {
      if (variant === 0) {
        p = { a, b, k, shift: level === 3 ? R(1, 4) : 0 };
        full = build([a], (v, i) => (i % 2 ? v.at(-1) * b + p.shift : v.at(-1) + k));
        rule = `Geçişlerde sırayla ×${b}${p.shift ? ' + ' + p.shift : ''} ve +${k} uygulanır.`;
        direction =
          'Aynı işlemin her geçişte yapıldığını varsayma. Birinci, üçüncü ve beşinci geçişi bir grup olarak incele.';
        observe =
          'Birinci, üçüncü ve beşinci geçişlerde aynı çarpanı ara. Aradaki geçişlerin sabit toplama olup olmadığını ayrıca denetle.';
        method = `İşlem sırası “×${b}${p.shift ? ' + ' + p.shift : ''}, ardından +${k}”. Soru işaretinin bulunduğu geçişte hangisinin sırası geldiğini belirle.`;
        wrong = [full.at(-2) * b, full.at(-2) + k];
      }
      if (variant === 1) {
        p = { a: a + 10, b, k };
        full = build([p.a], (v, i) => (i % 2 ? v.at(-1) * b : v.at(-1) - k));
        rule = `Geçişler sırayla ×${b} ve −${k}.`;
        direction = 'Artışların arasındaki küçülmeleri de dikkate al. İki farklı işlem dönüşümlü olabilir.';
        observe =
          'İkinci, dördüncü ve altıncı geçişlerdeki azalma miktarlarını karşılaştır; büyüme adımlarıyla aynı işlem olmak zorunda değil.';
        method = `Çarpma adımından sonra ${k} çıkarılıyor; sonra tekrar ${b} ile çarpılıyor. Sırayı tüm bilinen geçişlerde denetle.`;
      }
      if (variant === 2) {
        p = { a: a + 10, b, k, sub: R(2, 5) };
        full = build(
          [p.a],
          (v, i) => (i % 3 === 1 ? v.at(-1) + k : i % 3 === 2 ? v.at(-1) * b : v.at(-1) - p.sub),
          10
        );
        rule = `Üç geçişlik döngü: +${k}, ×${b}, −${p.sub}.`;
        direction = 'İki işlemle tutarlı bir düzen bulamıyorsan üç geçişlik gruplar dene.';
        observe = `1. ve 4. geçişin, ardından 2. ve 5. geçişin aynı işlemi kullanıp kullanmadığını kontrol et.`;
        method = `Döngü +${k} → ×${b} → −${p.sub} şeklinde. Konumları üçlü gruplara bölerek eksik adımın işlemini seç.`;
      }
      if (variant === 3) {
        p = { a, b: 2, k: level === 1 ? 0 : k };
        full = build([a], (v, i) => v.at(-1) * (i + 1) + p.k, 7);
        rule = `Her adımda çarpan 2, 3, 4, … biçiminde artar${p.k ? `; her çarpımdan sonra ${p.k} eklenir` : ''}.`;
        direction = 'Sabit çarpan aramak yerine çarpanın adım adım değişip değişmediğine bak.';
        observe = `İlk çarpanları 2 ve 3 olarak dene. Her çarpımdan sonra kalan farkı karşılaştır.`;
        method = `n. geçişte önceki terimi n+1 ile çarp${p.k ? `, sonra ${p.k} ekle` : ''}. Aynı kuralın tüm bilinen terimlerde çalışması gerekir.`;
      }
    }
    if (type === 1) {
      if (variant === 0) {
        p = { starts: [R(10, 25), R(80, 110)], steps: [R(3, 7), -R(3, 8)] };
        full = Array.from({ length: 9 }, (_, i) => p.starts[i % 2] + Math.floor(i / 2) * p.steps[i % 2]);
        rule = `Tek konumlar ${p.steps[0]} artar; çift konumlar ${-p.steps[1]} azalır.`;
        direction = 'Tek ve çift konumlardaki sayıları ayrı satırlara yaz.';
        observe =
          '1–3–5–7 konumlarını ve 2–4–6–8 konumlarını ayrı incele. Gruplar aynı yönde ilerlemek zorunda değil.';
        method = `Tek konumlarda +${p.steps[0]}, çift konumlarda −${-p.steps[1]} var. Eksik terimin kendi grubundaki komşusundan ilerle.`;
      }
      if (variant === 1) {
        p = { starts: [R(3, 7), R(10, 16)], factors: [2, 3] };
        if (R(0, 1)) p.factors.reverse();
        full = Array.from({ length: 9 }, (_, i) => p.starts[i % 2] * p.factors[i % 2] ** Math.floor(i / 2));
        rule = `Tek ve çift konumlar iki ayrı geometrik dizidir; çarpanları sırasıyla ${p.factors.join(' ve ')}.`;
        direction =
          'Zikzak görünüm iki dizinin iç içe geçmesinden kaynaklanabilir. Grupları ayırdıktan sonra oranlara bak.';
        observe = `1., 3. ve 5. terimler arasında oranı; 2., 4. ve 6. terimler arasında başka bir oranı hesapla.`;
        method = `Tek konumlar ×${p.factors[0]}, çift konumlar ×${p.factors[1]}. İki dizinin artışlarını birbirine karıştırma.`;
      }
      if (variant === 2) {
        p = { starts: [R(5, 15), R(2, 5), R(20, 35)], step: R(3, 7), factor: 2 };
        full = Array.from({ length: 10 }, (_, i) => {
          let g = i % 3,
            n = Math.floor(i / 3);
          return g === 0 ? p.starts[0] + n * p.step : g === 1 ? p.starts[1] * 2 ** n : p.starts[2] + n * n;
        });
        rule = `1–4–7–10. konumlar +${p.step}; 2–5–8. konumlar ×2; 3–6–9. konumlar başlangıca 0², 1², 2² ekler.`;
        direction = 'Her üçüncü konumu aynı renkle işaretlediğini düşün. Üç bağımsız alt dizi ara.';
        observe = `1–4–7, 2–5–8 ve 3–6–9 konumlarını ayrı incele. Her grupta aynı tür işlem bulunmayabilir.`;
        method = `Birinci grup sabit ${p.step} artar; ikinci grup iki katına çıkar; üçüncü grupta başlangıca kareler eklenir. Önce eksik terimin hangi grupta olduğunu belirle.`;
      }
      if (variant === 3) {
        p = { inputs: shuffle([3, 4, 5, 6, 7, 8, 9]).slice(0, 4), k, mode: level === 3 ? 'cube' : 'square' };
        full = p.inputs.flatMap(x => [x, (p.mode === 'cube' ? x ** 3 : x * x) + k]);
        rule = `Her sayı çiftinde sağdaki, soldakinin ${p.mode === 'cube' ? 'küpüne' : 'karesine'} ${k} eklenerek bulunur.`;
        direction = 'Bütün diziyi tek bir artış gibi okumak yerine yan yana sayı çiftlerini karşılaştır.';
        observe = `İlk iki çiftte sağdaki sayıdan soldakinin ${p.mode === 'cube' ? 'küpünü' : 'karesini'} çıkar. Kalanların ortak olup olmadığına bak.`;
        method = `Her çift “x → x${p.mode === 'cube' ? '³' : '²'} + ${k}” ilişkisini kullanır. Soldaki sayılar kendi aralarında bir dizi olmak zorunda değildir.`;
      }
    }
    if (type === 2) {
      if (variant === 0 || variant === 1) {
        p = { a, d: R(2, 6), dd: R(2, 5), ddd: variant === 1 ? R(1, 3) : 0 };
        let d = p.d,
          dd = p.dd;
        full = [a];
        while (full.length < 8) {
          full.push(full.at(-1) + d);
          d += dd;
          dd += p.ddd;
        }
        rule = `Birinci farkların başlangıcı ${p.d}; ikinci fark ${p.dd}${p.ddd ? ` değerinden başlar ve her adımda ${p.ddd} artar` : ' ile sabit kalır'}.`;
        direction =
          variant === 0
            ? 'Önce komşu terimler arasındaki farkları bul. Düzen sayılarda değil farklarda olabilir.'
            : 'Birinci farklarla yetinme; farkların da farkını alarak bir katman daha incele.';
        observe = `Dizinin ilk iki farkı ${full[1] - full[0]} ve ${full[2] - full[1]}. Sonraki bilinen farklarla aralarındaki değişimi karşılaştır.`;
        method =
          variant === 0
            ? `İkinci fark sabit ${p.dd}. Birinci farkları her adımda ${p.dd} artırarak ilerle.`
            : `Üçüncü fark sabit ${p.ddd}. Önce ikinci farkı, sonra birinci farkı güncelle; en son terime ekle.`;
      }
      if (variant === 2) {
        p = { a, d: R(2, 5), factor: pick([2, 3]) };
        full = [a];
        for (let i = 0; i < 7; i++) full.push(full.at(-1) + p.d * p.factor ** i);
        rule = `Ardışık farklar ${p.d}, ${p.d * p.factor}, ${p.d * p.factor ** 2}, … şeklinde; her fark ${p.factor} katına çıkar.`;
        direction = 'Farkların birbirine ne kadar eklendiğine değil, hangi oranla büyüdüğüne bak.';
        observe = `İlk fark ${p.d}, ikincisi ${p.d * p.factor}. Bir sonraki farkı aynı oranla tahmin edip verilen sayıyla dene.`;
        method = `Terimler değil, farklar ×${p.factor} kuralını izliyor. Yeni farkı bulduktan sonra önceki terime ekle.`;
      }
      if (variant === 3) {
        p = { a: R(120, 160), plus: R(3, 7), minus: R(4, 9) };
        full = [p.a];
        for (let i = 1; i <= 8; i++)
          full.push(full.at(-1) + (i % 2 ? Math.ceil(i / 2) * p.plus : (-i / 2) * p.minus));
        rule = `Geçişler +${p.plus}, −${p.minus}, +${2 * p.plus}, −${2 * p.minus}, +${3 * p.plus}, −${3 * p.minus}, … biçiminde.`;
        direction = 'Artan ve azalan adımları ayrı incele; işaret değişiminin altında iki düzen olabilir.';
        observe = 'Pozitif farkları bir gruba, negatif farkların büyüklüklerini başka bir gruba yaz.';
        method = `Pozitif adımlar ${p.plus}’in, negatif adımlar ${p.minus}’in sıralı katlarıdır. Hangi grubun kaçıncı adımında olduğuna bak.`;
      }
    }
    if (type === 3) {
      if (variant < 3) {
        p = { a, b: a + b, k: variant === 1 ? k : 0, factor: variant === 2 ? 2 : 1 };
        full = build([p.a, p.b], v => v.at(-1) + p.factor * v.at(-2) + p.k);
        rule = `Her terim = önceki terim + ${p.factor === 1 ? 'iki önceki terim' : p.factor + ' × iki önceki terim'}${p.k ? ' + ' + p.k : ''}.`;
        direction = 'Yeni terim yalnızca bir öncekiyle değil, son iki terimle ilişkili olabilir.';
        observe = `İlk iki terimin ${p.factor === 1 ? 'toplamını' : `ikincisi + ${p.factor} × birincisi işlemini`} üçüncü terimle karşılaştır. Varsa kalan farkı bir sonraki üçlüde de kontrol et.`;
        method = `xₙ = xₙ₋₁ + ${p.factor} × xₙ₋₂${p.k ? ' + ' + p.k : ''}. Eksik terim ortadaysa, sonraki bilinen terimle geriye doğru da denetleyebilirsin.`;
      }
      if (variant === 3) {
        p = { a: R(38, 95) };
        full = build([p.a], v => v.at(-1) + sumDigits(v.at(-1)));
        rule = 'Her terime kendi rakamlarının toplamı eklenir.';
        direction = 'Sayıları yalnızca büyüklük olarak değil, içerdikleri rakamlar açısından da incele.';
        observe = `İlk terim ${p.a}. Rakamlarının toplamını bu sayıya ekleyerek ikinci terimle karşılaştır.`;
        method =
          'Her adımda rakam toplamını yeniden hesapla. Bir önceki adımın artış miktarını aynen sürdürme.';
      }
    }
    if (type === 4) {
      p = { k, scale: level === 1 ? 1 : R(2, 4), start: level === 3 ? R(1, 3) : 1 };
      if (variant === 0) {
        full = Array.from({ length: 7 }, (_, i) => p.scale * (i + p.start) ** 2 + k);
        rule = `Terimler ${p.scale} × n² + ${k}; n, ${p.start} değerinden başlayarak artar.`;
        direction = 'Sayıları kare sayılarla karşılaştır. Aynı çarpan veya sabit kaydırma bulunabilir.';
        observe = 'Ardışık karelerin farkları tek sayılardır. Farklarda bu yapının sabit bir katını ara.';
        method = `n = ${p.start}, ${p.start + 1}, … için ${p.scale}n² + ${k} formülünü dene. Terimin sıra numarası ile n’nin başlangıcını karıştırma.`;
      }
      if (variant === 1) {
        full = Array.from({ length: 7 }, (_, i) => p.scale * (i + p.start) ** 3 + k);
        rule = `Terimler ${p.scale} × n³ + ${k}; n, ${p.start} değerinden başlar.`;
        direction = 'Artış çok hızlıysa karelerin yanında küp sayıları da düşün.';
        observe =
          '1, 8, 27, 64, 125 küp sayılarını verilen sayılarla karşılaştır; ortak bir katsayı ve sabit ara.';
        method = `Formül ${p.scale}n³ + ${k}. Önce sabiti çıkarıp ölçeği ayır; sonra küp dizisinin hangi konumunda olduğuna bak.`;
      }
      if (variant === 2) {
        p.scale = 1;
        p.start = 2;
        full = Array.from({ length: 7 }, (_, i) => factorial(i + 2) + k);
        rule = `2!, 3!, 4!, … değerlerine ${k} eklenir.`;
        direction = 'Artış katsayıları da büyüyorsa, ardışık sayıların çarpımlarından oluşan bir yapı ara.';
        observe = '2, 6, 24, 120, 720 değerleriyle verilen sayılar arasındaki sabit farkı kontrol et.';
        method = `Her terim n! + ${k}. Sabiti çıkardıktan sonra bir sonraki faktöriyeli bulup sabiti geri ekle.`;
      }
      if (variant === 3) {
        p.start = level === 3 ? R(1, 3) : 0;
        full = Array.from({ length: 7 }, (_, i) => p.scale * primes[i + p.start] + k);
        rule = `Ardışık asal sayılar ${p.scale} ile çarpılıp ${k} eklenir. İlk asal ${primes[p.start]}.`;
        direction =
          'Farklar düzenli görünmüyorsa özel sayı kümelerini düşün; asal sayılar bunlardan biridir.';
        observe = '2, 3, 5, 7, 11, 13, 17 dizisini bir katsayı ve sabit kaydırmayla karşılaştır.';
        method = `Önce ${k} çıkar, ardından ${p.scale}’e böl. Kalan sayılar ardışık asal sayılar olmalı; atlanan asal olmadığını denetle.`;
      }
    }
    if (type === 5) {
      let innerType = [0, 2, 3, 2, 0, 1, 2, 3, 4, 1, 3, 4][variant],
        innerVariant = [0, 0, 2, 2, 6, 4, 7, 5, 7, 11, 8, 10][variant],
        base = spec(innerType, innerVariant, level);
      full = base.full.slice(0, 8);
      p = { baseType: innerType, baseVariant: innerVariant, baseParams: base.p };
      rule = base.rule;
      direction =
        'Tek bir terim çevresindeki iki ilişki birden bozulmuş olabilir. Bütün diziyi doğrulayan kuralı ara.';
      observe = base.direction;
      method = base.method;
    }
    return { p, full, rule, direction, observe, method, wrong };
  }
  function choices(value, pool, wrongTerm = false) {
    let candidates = [...new Set(pool.filter(Number.isSafeInteger).filter(n => n >= 0 && n !== value))];
    if (!wrongTerm) {
      candidates = candidates.filter(n => Math.abs(n - value) <= Math.max(12, value * 0.65));
      if (candidates.length < 4)
        for (let k of [1, -1, 2, -2, 3, -3]) {
          let n = value + k;
          if (n >= 0 && !candidates.includes(n)) candidates.push(n);
        }
      if (!candidates.some(n => n % 2 === value % 2)) candidates.push(value + 2);
    }
    let wrong = shuffle(candidates).slice(0, 4);
    if (wrong.length < 4) throw Error('insufficient numeric distractors');
    let parity = value % 2,
      digits = String(value).length;
    if (!wrong.some(n => n % 2 === parity)) {
      let replacement = candidates.find(n => n % 2 === parity);
      if (replacement !== undefined) wrong[0] = replacement;
    }
    if (!wrong.some(n => String(n).length === digits)) {
      let replacement = candidates.find(n => String(n).length === digits && !wrong.includes(n));
      if (replacement !== undefined) wrong[1] = replacement;
    }
    if (new Set(wrong).size !== 4) {
      wrong = [...new Set(wrong)];
      for (let n of shuffle(candidates)) if (!wrong.includes(n) && wrong.length < 4) wrong.push(n);
    }
    return shuffle([value, ...wrong]);
  }
  function create(type, level = 2, variant = null, task = null) {
    variant = variant === null ? R(0, 11) : variant;
    if (type < 0 || type > 5 || variant < 0 || variant > 11) throw Error('Unknown numeric rule');
    if (task === 'error' && type === 1 && [3, 7, 8, 9, 10].includes(variant)) task = 'middle';
    let o = spec(type, variant, level),
      full = o.full,
      wrongTerm = type === 5 || task === 'error',
      hole = wrongTerm
        ? null
        : task === 'end'
          ? full.length - 1
          : task === 'middle'
            ? R(3, full.length - 2)
            : type === 1 && variant === 3
              ? full.length - 1
              : R(0, 2) === 0
                ? R(3, full.length - 2)
                : full.length - 1,
      value,
      display = full.slice(),
      errorIndex = null,
      original = null;
    if (wrongTerm) {
      errorIndex = R(2, full.length - 2);
      original = full[errorIndex];
      let err = pick([-6, -4, -2, 2, 4, 6]);
      while (full.includes(original + err)) err += 2;
      value = original + err;
      display[errorIndex] = value;
    } else {
      value = full[hole];
      display[hole] = '?';
    }
    let before = full[Math.max(0, (hole ?? errorIndex) - 1)],
      before2 = full[Math.max(0, (hole ?? errorIndex) - 2)],
      d = before - before2;
    let candidatePool = wrongTerm
      ? display.filter((_, i) => i !== errorIndex)
      : [
          ...o.wrong,
          before + d,
          before * 2,
          before + before2,
          before - d,
          value + o.p.k,
          value - o.p.k,
          value + o.p.scale,
          value - o.p.scale,
          full[Math.min(full.length - 1, (hole ?? 0) + 1)],
          full[Math.max(0, (hole ?? 0) - 1)],
        ];
    let mistakes = [];
    const add = (n, why) => {
      if (Number.isSafeInteger(n) && n !== value) mistakes.push({ n, why });
    };
    let p = o.p,
      h = hole;
    if (!wrongTerm) {
      if (variant >= 4) {
        add(before + d, 'Tekrarlanan son farkı sürdürmeden önce bütün ilişkileri doğrula.');
        add(before * (p.b || 2), 'Doğru işlem sırasını, sabiti veya katsayıyı atlama.');
        add(
          before + before2,
          'Son iki terimin doğrudan toplamının gerçekten tüm terimlerde çalıştığını denetle.'
        );
        add(value + (p.k || 2), 'Sabit veya konum adımını fazladan uygulama.');
        add(value - (p.k || 2), 'Sabit veya konum adımını atlama.');
        if (type === 4) {
          add(value - p.k, 'Özel sayı yapısındaki sabit kaydırmayı unutma.');
          if ((value - p.k) % p.scale === 0) add((value - p.k) / p.scale + p.k, 'Ölçek katsayısını unutma.');
        }
        if (type === 1) {
          add(
            full[Math.max(0, h - 2)] + (p.steps?.[1 - (h % 2)] || p.k),
            'Diğer alt dizinin adımını bu gruba uygulama.'
          );
        }
      }
      if (variant < 4 && type === 0 && variant === 3) {
        add(before * h + p.k, 'Artan çarpanda bir önceki adımın çarpanını kullanma.');
        add(before * (h + 2) + p.k, 'Çarpanı bir adım erken artırma.');
        add(before * (h + 1), 'Çarpımdan sonra eklenen sabiti unutma.');
        add(before * (h + 1) + 2 * p.k, 'Eklenen sabiti iki kez uygulama.');
      } else if (variant < 4 && type === 0) {
        add(before * (p.b || 2), 'Çarpma adımındaki sabiti veya işlem sırasını atlama.');
        add(before + (p.k || 0), 'Toplama adımını yanlış geçişte kullanma.');
        add(before - (p.sub || p.k), 'Çıkarma adımını yanlış geçişte kullanma.');
        add(value + (p.k || p.sub || 2), 'Döngüdeki toplama işlemini iki kez uygulama.');
      }
      if (variant < 4 && type === 1) {
        add(before + d, 'İç içe dizileri ayırmadan son farkı sürdürme.');
        add(before * 2, 'Diğer alt dizinin çarpanını kullanma.');
        if (variant === 0) {
          add(full[h - 2] + p.steps[1 - (h % 2)], 'Diğer alt dizinin artışını kullanma.');
          add(full[h - 2] - p.steps[h % 2], 'Artış yönünü ters uygulama.');
        }
        if (variant === 1) {
          add(full[h - 2] * p.factors[1 - (h % 2)], 'Diğer alt dizinin çarpanını kullanma.');
          add(full[h - 2] + p.factors[h % 2], 'Çarpma yerine toplama yapma.');
        }
        if (variant === 3) {
          add(before ** (p.mode === 'cube' ? 3 : 2), 'Sayı çiftindeki sabit eklemeyi unutma.');
          add((before + 1) ** (p.mode === 'cube' ? 3 : 2) + p.k, 'Üs alınacak sayıyı bir fazla kullanma.');
        }
      }
      if (variant < 4 && type === 2) {
        add(before + d, 'Son farkı değişmeden sürdürme.');
        add(value + (p.dd || p.d || p.plus), 'Fark artışını bir adım erken uygulama.');
        add(value - (p.dd || p.d || p.plus), 'Fark artışını bir adım geç uygulama.');
        add(before - d, 'Son farkı ters yönde uygulama.');
      }
      if (type === 3 && variant < 3) {
        add(before + before2, 'Son iki terimi toplayıp katsayıyı veya sabiti atlama.');
        add(before + p.factor * before2, 'Sabit eklemeyi unutma.');
        add(before * 2 + p.k, 'İki ayrı önceki terim yerine yalnızca son terimi kullanma.');
        add(before + before2 + p.k, 'İki önceki terimin katsayısını 1 kabul etme.');
      }
      if (type === 3 && variant === 3) {
        add(
          before + sumDigits(before2),
          'Rakam toplamını yeniden hesaplamak yerine önceki adımın artışını kullanma.'
        );
        add(before + Number(String(before).at(-1)), 'Rakamların toplamı yerine yalnızca son rakamı ekleme.');
      }
      if (variant < 4 && type === 4) {
        let n = h + p.start;
        add(value - p.k, 'Özel sayı dizisine eklenen sabiti unutma.');
        add(value + p.k, 'Sabit eklemeyi iki kez uygulama.');
        if (variant < 2) {
          add(
            p.scale * (n - 1) ** (variant === 0 ? 2 : 3) + p.k,
            'Özel sayı dizisinde bir önceki konumu kullanma.'
          );
          add(
            p.scale * (n + 1) ** (variant === 0 ? 2 : 3) + p.k,
            'Özel sayı dizisinde bir sonraki konumu kullanma.'
          );
          add((variant === 0 ? n * n : n ** 3) + p.k, 'Ölçek katsayısını unutma.');
        }
        if (variant === 2) {
          add(factorial(n + 1) + p.k, 'Faktöriyel dizisinde bir konum erken ilerleme.');
          add(factorial(n - 1) + p.k, 'Faktöriyel dizisinde bir konum geride kalma.');
        }
        if (variant === 3) add(p.scale * primes[n + 1] + p.k, 'Aradaki asal sayıyı atlama.');
      }
      candidatePool = [...mistakes.map(x => x.n), ...candidatePool];
    }
    let numericOptions = choices(value, candidatePool, wrongTerm);
    if (
      numericOptions.filter(x => x % 2 === value % 2).length < 2 ||
      numericOptions.filter(x => String(x).length === String(value).length).length < 2
    )
      return create(type, level, variant, task);
    let q = wrongTerm
      ? 'Düzenli bir kuralla oluşturulan dizide bir terim değiştirilmiştir. Hatalı terim hangisidir?'
      : 'Dizide soru işaretinin yerine hangi sayı gelmelidir?';
    let hints = [o.direction, o.observe, o.method];
    if (!wrongTerm && hole !== full.length - 1)
      hints[2] += ' Eksik terimin sağındaki bilinen sayıları da kullanarak sonucunu kontrol et.';
    let exp =
      o.rule +
      '<br>Doğru dizi: ' +
      full.map(fmt).join(' → ') +
      '.<br>' +
      (wrongTerm
        ? `${errorIndex + 1}. konumda ${fmt(value)} yerine ${fmt(original)} bulunmalı.`
        : `${hole + 1}. konumdaki eksik sayı ${fmt(value)}.`);
    const options = numericOptions.map(fmt),
      answer = fmt(value),
      visual =
        '<div class="sequence">' +
        display.map(x => `<span class="seqbox">${x === '?' ? '?' : fmt(x)}</span>`).join('') +
        '</div>';
    let reasons = {};
    for (let n of numericOptions)
      if (n !== value)
        reasons[fmt(n)] =
          mistakes.find(x => x.n === n)?.why ||
          (wrongTerm
            ? 'Bu terim, diğerleriyle birlikte gösterilen kurala uyar.'
            : n === before + d
              ? 'Son farkı değişmeden sürdürme.'
              : n === before * 2
                ? 'Önceki terimi doğrudan ikiye katlama.'
                : n === before + before2
                  ? 'Son iki terimi, asıl kuralı kontrol etmeden toplama.'
                  : n === before - d
                    ? 'Son farkı ters yönde uygulama.'
                    : Math.abs(n - value) <= 3
                      ? 'İşlem veya konum sayımında küçük sapma.'
                      : 'Bir kuralın sabitini, katsayısını veya komşu konumunu yanlış kullanma.');
    return {
      cat: 'num',
      type,
      level,
      variant,
      ruleId: `num-${type}-${variant}`,
      q,
      visual,
      options,
      answer,
      exp,
      hint: hints[0],
      hints,
      distractorReasons: reasons,
      id: hash(q + visual + answer),
      target: 75,
      engineVersion: 3,
      proof: {
        kind: 'numeric-v3',
        type,
        variant,
        params: o.p,
        full,
        hole,
        errorIndex,
        original,
        value,
        numericOptions,
      },
    };
  }
  root.Numeric = { create, spec, choices, variantCount: 12, extraNames };
})(typeof window === 'undefined' ? globalThis : window);
