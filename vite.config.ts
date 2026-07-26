import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { ViteImageOptimizer } from 'vite-plugin-image-optimizer';

// https://vitejs.dev/config/
// vite-react-ssg statically prerenders every route in src/routes.tsx,
// emitting real HTML files so deep links work on GitHub Pages and the
// pages stay crawlable for SEO / social previews.
export default defineConfig({
  // vite-react-ssg dev doesn't forward --port, so honor PORT from the
  // environment (used by tooling) before falling back to Vite's default.
  server: {
    port: Number(process.env.PORT) || 5173,
  },
  // The playground sandbox workers (src/playgrounds/*.worker.ts) use dynamic
  // imports, which the default 'iife' worker format can't bundle.
  worker: {
    format: 'es',
  },
  plugins: [
    react(),
    tailwindcss(),
    // Optimizes images in public/ (and bundled assets) at build time with
    // sharp + svgo, in place: paths/filenames are unchanged.
    ViteImageOptimizer({
      png: { quality: 80 },
      jpeg: { quality: 80 },
      jpg: { quality: 80 },
      webp: { quality: 80 },
      logStats: true,
    }),
  ],
});
