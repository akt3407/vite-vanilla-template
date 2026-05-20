import { defineConfig } from 'vite-plus';
import path from 'node:path';
import { existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import tailwindcss from '@tailwindcss/vite';
import injectHTML from 'vite-plugin-html-inject';
import sharp from 'sharp';
import { jsonld } from './src/seo/jsonld.js';

// `<!-- jsonld -->` を JSON-LD <script> ブロックに置換するミニプラグイン
function injectJsonLd() {
  return {
    name: 'inject-jsonld',
    transformIndexHtml(html) {
      const tag = `<script type="application/ld+json">${JSON.stringify(jsonld)}</script>`;
      return html.replace('<!-- jsonld -->', tag);
    },
  };
}

// HTML の <img src="*.jpg|*.jpeg|*.png"> をビルド時に WebP へ自動変換し、参照を書き換える。
// html-inject（order:'pre'）でセクションが差し込まれた後、Vite が元画像を emit する前の
// pre 段階で処理する。dev では変換せず元画像をそのまま配信する（本番ビルドのみ変換）。
// 外部URL・data: URI は対象外。<picture> のフォールバックを残したい場合は <img> ではなく
// <source> に書けば変換されない。
function autoWebp({ quality = 80 } = {}) {
  const imgSrc = /<img\b[^>]*?\bsrc=["']([^"']+\.(?:jpe?g|png))["']/gi;
  let root = import.meta.dirname;
  let base = '/';
  let assetsDir = 'assets';
  let isBuild = false;
  return {
    name: 'auto-webp',
    configResolved(config) {
      root = config.root;
      base = config.base;
      assetsDir = config.build.assetsDir;
      isBuild = config.command === 'build';
    },
    transformIndexHtml: {
      order: 'pre',
      async handler(html) {
        if (!isBuild) return html; // dev は元画像をそのまま配信
        const sources = new Set([...html.matchAll(imgSrc)].map((match) => match[1]));
        for (const src of sources) {
          if (/^(?:https?:)?\/\//.test(src) || src.startsWith('data:')) continue;
          const filePath = path.join(root, src.replace(/^\//, ''));
          if (!existsSync(filePath)) continue;
          const webp = await sharp(filePath).webp({ quality }).toBuffer();
          const hash = createHash('sha256').update(webp).digest('hex').slice(0, 8);
          const name = path.basename(src).replace(/\.(?:jpe?g|png)$/i, '');
          const fileName = `${assetsDir}/${name}-${hash}.webp`;
          this.emitFile({ type: 'asset', fileName, source: webp });
          html = html.split(src).join(`${base}${fileName}`);
        }
        return html;
      },
    },
  };
}

export default defineConfig({
  staged: {
    '*': 'vp check --fix',
  },
  lint: {
    plugins: ['oxc', 'unicorn'],
    categories: {
      correctness: 'warn',
    },
    env: {
      builtin: true,
      es2026: true,
      browser: true,
    },
    ignorePatterns: ['dist/**', 'node_modules/**'],
    rules: {
      'constructor-super': 'error',
      'for-direction': 'error',
      'getter-return': 'error',
      'no-async-promise-executor': 'error',
      'no-case-declarations': 'error',
      'no-class-assign': 'error',
      'no-compare-neg-zero': 'error',
      'no-cond-assign': 'error',
      'no-const-assign': 'error',
      'no-constant-binary-expression': 'error',
      'no-constant-condition': 'error',
      'no-control-regex': 'error',
      'no-debugger': 'error',
      'no-delete-var': 'error',
      'no-dupe-class-members': 'error',
      'no-dupe-else-if': 'error',
      'no-dupe-keys': 'error',
      'no-duplicate-case': 'error',
      'no-empty': 'error',
      'no-empty-character-class': 'error',
      'no-empty-pattern': 'error',
      'no-empty-static-block': 'error',
      'no-ex-assign': 'error',
      'no-extra-boolean-cast': 'error',
      'no-fallthrough': 'error',
      'no-func-assign': 'error',
      'no-global-assign': 'error',
      'no-import-assign': 'error',
      'no-invalid-regexp': 'error',
      'no-irregular-whitespace': 'error',
      'no-loss-of-precision': 'error',
      'no-misleading-character-class': 'error',
      'no-new-native-nonconstructor': 'error',
      'no-nonoctal-decimal-escape': 'error',
      'no-obj-calls': 'error',
      'no-prototype-builtins': 'error',
      'no-redeclare': 'error',
      'no-regex-spaces': 'error',
      'no-self-assign': 'error',
      'no-setter-return': 'error',
      'no-shadow-restricted-names': 'error',
      'no-sparse-arrays': 'error',
      'no-this-before-super': 'error',
      'no-unassigned-vars': 'error',
      'no-undef': 'error',
      'no-unexpected-multiline': 'error',
      'no-unreachable': 'error',
      'no-unsafe-finally': 'error',
      'no-unsafe-negation': 'error',
      'no-unsafe-optional-chaining': 'error',
      'no-unused-labels': 'error',
      'no-unused-private-class-members': 'error',
      'no-unused-vars': 'error',
      'no-useless-assignment': 'error',
      'no-useless-backreference': 'error',
      'no-useless-catch': 'error',
      'no-useless-escape': 'error',
      'no-with': 'error',
      'preserve-caught-error': 'error',
      'require-yield': 'error',
      'use-isnan': 'error',
      'valid-typeof': 'error',
    },
  },
  fmt: {
    semi: true,
    singleQuote: true,
    trailingComma: 'all',
    printWidth: 100,
    tabWidth: 2,
    useTabs: false,
    arrowParens: 'always',
    bracketSpacing: true,
    bracketSameLine: false,
    endOfLine: 'lf',
    htmlWhitespaceSensitivity: 'css',
    sortTailwindcss: {},
    sortPackageJson: false,
    ignorePatterns: ['dist', 'node_modules', 'public'],
  },
  plugins: [
    tailwindcss(),
    injectHTML(),
    injectJsonLd(),
    // src/assets/ などに置いた jpg/png を <img> で参照すれば、ビルド時に自動で WebP 化される。
    autoWebp({ quality: 80 }),
  ],
});
