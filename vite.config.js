import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import injectHTML from 'vite-plugin-html-inject';
import { imagetools } from 'vite-imagetools';
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

export default defineConfig({
  plugins: [
    tailwindcss(),
    injectHTML(),
    injectJsonLd(),
    imagetools({
      defaultDirectives: (url) => {
        if (url.searchParams.has('no-webp')) return new URLSearchParams();
        if (url.searchParams.has('format')) return new URLSearchParams();
        return new URLSearchParams({ format: 'webp', quality: '80' });
      },
    }),
  ],
});
