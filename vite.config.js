import { defineConfig } from 'vite';
import path from 'node:path';
import { existsSync, readFileSync } from 'node:fs';
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

// HTML の <img src="*.jpg|*.jpeg|*.png"> をビルド時に <picture> へ置き換える。
// 生成した WebP を <source> に、元画像は <img> に残すのでフォールバックが効く。
// html-inject（order:'pre'）でセクションが差し込まれた後、Vite が元画像を emit する前の
// pre 段階で処理する。dev では変換せず元の <img> のまま配信する（本番ビルドのみ変換）。
// 外部URL・data: URI は対象外。手書きの <picture>...</picture> の中身は触らない。
// 注意: ビルド後は <img> が <picture> に包まれるため `親 > img` の子セレクタは届かなくなる。
function autoWebp({ quality = 80 } = {}) {
  // <picture> ブロックを先に食わせることで、その中の <img> にはマッチさせない
  const target = /<picture\b[\s\S]*?<\/picture>|<img\b[^>]*>/gi;
  const srcAttr = /\bsrc=["']([^"']+\.(?:jpe?g|png))["']/i;
  const emitted = new Set();
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
    buildStart() {
      emitted.clear();
    },
    transformIndexHtml: {
      order: 'pre',
      async handler(html) {
        if (!isBuild) return html; // dev は元の <img> のまま配信
        // 同じ画像を複数ページで使っても emit は1回だけ（fileName 衝突を避ける）
        const emit = (source, name, ext) => {
          const hash = createHash('sha256').update(source).digest('hex').slice(0, 8);
          const fileName = `${assetsDir}/${name}-${hash}${ext}`;
          if (!emitted.has(fileName)) {
            this.emitFile({ type: 'asset', fileName, source });
            emitted.add(fileName);
          }
          return `${base}${fileName}`;
        };
        const converted = new Map(); // 元の src -> { webp, orig } の最終URL
        for (const [tag] of html.matchAll(target)) {
          if (!/^<img/i.test(tag)) continue; // 手書きの <picture> はそのまま
          const src = tag.match(srcAttr)?.[1];
          if (!src || converted.has(src)) continue;
          if (/^(?:https?:)?\/\//.test(src) || src.startsWith('data:')) continue;
          const filePath = path.join(root, src.replace(/^\//, ''));
          if (!existsSync(filePath)) continue;
          const ext = path.extname(src);
          const name = path.basename(src, ext);
          converted.set(src, {
            webp: emit(await sharp(filePath).webp({ quality }).toBuffer(), name, '.webp'),
            orig: emit(readFileSync(filePath), name, ext),
          });
        }
        return html.replace(target, (tag) => {
          const src = /^<img/i.test(tag) ? tag.match(srcAttr)?.[1] : null;
          const url = src && converted.get(src);
          if (!url) return tag;
          return `<picture><source srcset="${url.webp}" type="image/webp">${tag.replace(src, url.orig)}</picture>`;
        });
      },
    },
  };
}

export default defineConfig({
  plugins: [
    tailwindcss(),
    injectHTML(),
    injectJsonLd(),
    // src/assets/ などに置いた jpg/png を <img> で参照すれば、ビルド時に自動で WebP 化される。
    autoWebp({ quality: 80 }),
  ],
});
