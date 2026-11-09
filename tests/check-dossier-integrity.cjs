const fs = require('node:fs'),
  vm = require('node:vm'),
  assert = require('node:assert/strict');
const ctx = { window: {} };
vm.createContext(ctx);
vm.runInContext(fs.readFileSync('web/case-data.js', 'utf8'), ctx);
const rows = JSON.parse(JSON.stringify(ctx.window.CASE_CATALOG));
const get = id => rows.find(c => c.id === id),
  doc = (id, title) => {
    const d = get(id).docs.find(d => d.title.includes(title));
    assert(d, id + ': missing ' + title);
    return d.rows;
  },
  sum = (r, col) => r.reduce((n, x) => n + x[col], 0);
for (const c of rows) {
  assert.equal(c.docs.length, c.docCodes.length);
  assert.equal(new Set(c.docCodes).size, c.docs.length);
  c.docs.forEach((d, i) => assert.equal(d.code, 'D' + String(i + 1).padStart(2, '0')));
  const candidate =
    c.brief +
    ' ' +
    c.mandate +
    ' ' +
    c.docs.map(d => d.text + ' ' + d.rows.map(r => r.join(' ')).join(' ')).join(' ') +
    ' ' +
    c.tasks.join(' ');
  assert(candidate.split(/\s+/).length >= 550, c.id + ' packet too short');
  const pack = fs.readFileSync('web' + c.candidateFile, 'utf8');
  assert(!pack.includes('## İnceleme ölçütleri'));
  assert(!pack.includes(c.rubric[0].evidence));
  assert(!pack.includes(c.numbers[0]?.why || '__nonexistent_reference__'));
}
let r = doc('vardiya-darbogazi', 'Bugün çıkış');
assert.equal(sum(r, 1), 900);
assert.equal(sum(r, 2), 300);
r = doc('butce-sapmasi', 'Sonraki ay müşteri planı');
assert.equal(
  r.reduce((n, x) => n + x.slice(1).reduce((a, b) => a + b, 0), 0),
  14000
);
r = doc('sube-lokasyonu', 'Açılış yatırım bütçesi');
assert.deepEqual(
  [1, 2, 3].map(i => sum(r, i)),
  [4800000, 3200000, 2600000]
);
assert.equal(sum(doc('sube-lokasyonu', 'Müşteri bölge araştırması'), 1), 120);
r = doc('nakit-toparlanma', 'Tahsilat dosyası');
assert.equal(sum(r, 2), 2000000);
assert.deepEqual(
  ['1', '2', '3', '4'].map(w =>
    sum(
      r.filter(x => x[3] === w),
      2
    )
  ),
  [200000, 250000, 500000, 450000]
);
r = doc('nakit-toparlanma', 'Ödeme takvimi');
assert.deepEqual(
  ['1', '2', '3', '4'].map(w =>
    sum(
      r.filter(x => x[0] === w),
      2
    )
  ),
  [450000, 550000, 400000, 350000]
);
assert.equal(sum(doc('nakit-toparlanma', 'Stok çalışma'), 1), 3000000);
r = doc('doksan-gun-toparlanma', 'Bölge operasyon');
assert.equal(sum(r, 1), 10000000);
assert.equal(sum(r, 2), 7000000);
assert.equal(sum(doc('doksan-gun-toparlanma', 'Müşteri sözleşme yenileme'), 1), 10000000);
r = doc('buyuk-musteri', 'Küçük portföy');
assert.equal(sum(r, 1), 40);
assert.equal(sum(r, 2), 1200000);
assert.equal(Math.max(...r.map(x => x[3])) / sum(r, 2), 0.08);
r = doc('yatirim-kapasitesi', 'İş adımı');
assert(Math.abs(sum(r, 2) - 6) < 1e-9);
r = doc('parti-kalitesi', 'Partilerin stok hareketi');
for (let x of r)
  assert.equal(
    x.slice(2).reduce((a, b) => a + b, 0),
    x[1]
  );
assert.equal(sum(doc('parti-kalitesi', 'A partisinin sevk'), 3), 600);
r = doc('musteri-toparlanma', 'Son altı ay müşteri hareketi');
for (let i = 0; i < r.length; i++) {
  assert.equal(r[i][2] + r[i][3], r[i][4]);
  if (i) assert.equal(r[i - 1][4], r[i][1]);
}
assert.equal(sum(doc('musteri-toparlanma', 'Son ay ayrılma'), 1), 120);
r = doc('zarar-portfoyu', 'Doğrudan sabit gider');
assert.deepEqual(
  ['A', 'B', 'C'].map(t =>
    sum(
      r.filter(x => x[0] === t),
      2
    )
  ),
  [180000, 200000, 140000]
);
assert.equal(sum(doc('zarar-portfoyu', 'Merkez gideri'), 1), 300000);
console.log(
  'PASS: dossier length, document codes, no leaked reference text, weekly cash/subledgers, branch capex, cohort chains, customer portfolio, dispatch quantities and regional/contract totals.'
);
