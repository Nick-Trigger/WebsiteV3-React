import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vitejs.dev/config/
// vite-react-ssg statically prerenders every route in src/routes.tsx,
// emitting real HTML files so deep links work on GitHub Pages and the
// pages stay crawlable for SEO / social previews.
export default defineConfig({
  plugins: [react(), tailwindcss()],
});
