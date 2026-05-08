import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import injectHTML from 'vite-plugin-html-inject';
import { imagetools } from 'vite-imagetools';

export default defineConfig({
  plugins: [
    tailwindcss(),
    injectHTML(),
    imagetools({
      defaultDirectives: (url) => {
        if (url.searchParams.has('no-webp')) return new URLSearchParams();
        if (url.searchParams.has('format')) return new URLSearchParams();
        return new URLSearchParams({ format: 'webp', quality: '80' });
      },
    }),
  ],
});
