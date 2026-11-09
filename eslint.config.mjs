import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    // Node kontrol ve üretim betikleri CommonJS kullanır.
    files: ['**/*.cjs'],
    rules: { '@typescript-eslint/no-require-imports': 'off' },
  },
  globalIgnores(['dist/**', 'public/**', 'web/vendor/**', '.vinext/**', '.wrangler/**', '.sites-runtime/**', 'outputs/**', 'work/**']),
]);

export default eslintConfig;
