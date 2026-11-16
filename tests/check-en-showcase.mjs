// İngilizce tanıtım turu ve vitrin vakası: İngilizce kayıt Türkçe vakayla aynı yapıda mı, dosyaları var mı?
import { existsSync, readFileSync } from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';

const ctx = { window: {} };
vm.runInNewContext(readFileSync('web/case-data.js', 'utf8'), ctx);
const en = JSON.parse(readFileSync('web/cases/en/vardiya-darbogazi.json', 'utf8'));
const tr = ctx.window.CASE_CATALOG.find(c => c.id === en.id);
assert.ok(tr, 'Türkçe vaka bulunamadı');
assert.equal(en.lang, 'en');
assert.equal(
  en.version,
  tr.version,
  'İngilizce vaka Türkçe vakayla aynı sürümde olmalı; Türkçe vaka güncellendiyse çeviriyi de güncelle.'
);

// Aynı yapı: diziler aynı uzunlukta, sayılar aynı (yalnız metinler çevrilir).
function same(a, b, path) {
  if (typeof a === 'string') return assert.equal(typeof b, 'string', path);
  if (typeof a !== 'object' || a === null) return assert.deepEqual(b, a, path);
  if (Array.isArray(a)) {
    assert.ok(Array.isArray(b), path);
    assert.equal(b.length, a.length, path + ' uzunluğu');
    return a.forEach((x, i) => same(x, b[i], `${path}[${i}]`));
  }
  for (const k of Object.keys(a)) {
    if (/File$|^file$/.test(k)) continue;
    assert.ok(k in b, `${path}.${k} eksik`);
    same(a[k], b[k], `${path}.${k}`);
  }
}
same(tr, en, en.id);

// Dosyalar
for (const f of [en.wordFile, en.excelFile, en.candidateFile, ...en.docs.map(d => d.file).filter(Boolean)])
  assert.ok(f.startsWith('/cases/en/') && existsSync('web' + f), f + ' yok');

// Tur betiği tüm uygulama sayfalarında yüklü
for (const page of [
  'web/index.html',
  'web/modules/zihin/index.html',
  'web/modules/mizac/index.html',
  'web/modules/rol/index.html',
])
  assert.match(readFileSync(page, 'utf8'), /en-tour\.js/, page);

console.log(
  'PASS: İngilizce vitrin vakası Türkçe vakayla aynı yapıda, dosyaları yerinde; tanıtım turu tüm sayfalarda yüklü.'
);
