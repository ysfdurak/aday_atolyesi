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
  {
    // Nesneden alan çıkarmak için kullanılan ({ gizli, ...kalan }) kalıbı ve _ önekli değişkenler bilerek kullanılmaz.
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { ignoreRestSiblings: true, argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrors: 'none' },
      ],
    },
  },
  {
    // Tarayıcı modülleri klasik betik: üst düzey işlevler HTML içindeki onclick="…" çağrılarıyla kullanılır,
    // ESLint bunları göremez. Yalnız yerel (işlev içi) değişkenler denetlenir; catch değişkeni zorunlu değil.
    files: ['web/**/*.js'],
    languageOptions: { sourceType: 'script', parserOptions: { sourceType: 'script' } },
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          vars: 'local',
          args: 'after-used',
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          ignoreRestSiblings: true,
          caughtErrors: 'none',
        },
      ],
    },
  },
  globalIgnores([
    'dist/**',
    'public/**',
    'web/vendor/**',
    '.vinext/**',
    '.wrangler/**',
    '.sites-runtime/**',
    'outputs/**',
    'work/**',
  ]),
]);

export default eslintConfig;
