import js from '@eslint/js';
import globals from 'globals';
import prettier from 'eslint-config-prettier/flat';

export default [
  { ignores: ['dist/**', 'coverage/**', '**/*.min.js'] },
  js.configs.recommended,
  {
    files: ['**/*.{js,mjs,cjs}'],
    ignores: ['*.config.{js,mjs,cjs}'],
    languageOptions: { sourceType: 'module', globals: globals.browser },
    rules: {
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    },
  },
  {
    files: ['*.config.{js,mjs,cjs}'],
    languageOptions: { globals: globals.node },
  },
  prettier, // ← 必ず最後。フォーマット系ルールを一括 off
];
