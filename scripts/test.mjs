import { readdirSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const cwd = fileURLToPath(new URL('../', import.meta.url));
const checks = readdirSync(cwd)
  .filter(name => /^check-.+\.(cjs|mjs)$/.test(name))
  .sort();
for (const file of ['checks.cjs', ...checks]) {
  console.log('\n' + file);
  const result = spawnSync(process.execPath, [file], { cwd, stdio: 'inherit' });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);
}
console.log('\n' + (checks.length + 1) + ' kontrol betiği geçti.');
