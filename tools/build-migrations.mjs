// drizzle/*.sql dosyalarını Worker içinde çalıştırılabilecek bir modüle dönüştürür.
// Cloudflare'de D1 veritabanı ilk yayında boş oluşturulur; tablolar ilk istekte bu listeden kurulur.
// Çalıştırma: node tools/build-migrations.mjs  (tests/check-vitrin.mjs dosyanın güncel olduğunu denetler)
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';

export function readMigrations() {
  return readdirSync('drizzle')
    .filter(f => f.endsWith('.sql'))
    .sort()
    .map(f => ({
      tag: f.replace(/\.sql$/, ''),
      statements: readFileSync('drizzle/' + f, 'utf8')
        .split(/-->\s*statement-breakpoint|;\s*(?:\r?\n|$)/)
        .map(s => s.trim())
        .filter(Boolean),
    }));
}
export const render = list =>
  '// Üretilmiş dosya: tools/build-migrations.mjs (kaynak: drizzle/*.sql)\nexport const MIGRATIONS = ' +
  JSON.stringify(list, null, 2) +
  ';\n';

if (import.meta.url === 'file://' + process.argv[1]) {
  writeFileSync('server/migrations.mjs', render(readMigrations()));
  console.log('server/migrations.mjs güncellendi.');
}
