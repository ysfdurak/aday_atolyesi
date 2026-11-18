// content/rubric-examples.json → web/rubric-examples.js (değerlendirme formu ve kalibrasyon ekranı kullanır).
// Kullanım: node tools/build-rubric-examples.mjs   ·   --check: dosya güncel değilse hata verir
import { readFileSync, writeFileSync } from 'node:fs';
const data = JSON.parse(readFileSync('content/rubric-examples.json', 'utf8'));
const out =
  '// Üretilmiş dosya: node tools/build-rubric-examples.mjs (kaynak: content/rubric-examples.json)\n' +
  `window.RUBRIC_EXAMPLES = ${JSON.stringify(data)};\n`;
if (process.argv.includes('--check')) {
  if (readFileSync('web/rubric-examples.js', 'utf8') !== out)
    throw Error('web/rubric-examples.js güncel değil: node tools/build-rubric-examples.mjs');
  console.log('rubric-examples güncel');
} else {
  writeFileSync('web/rubric-examples.js', out);
  console.log('web/rubric-examples.js yazıldı');
}
