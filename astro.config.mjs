// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

import react from '@astrojs/react';

import sitemap from '@astrojs/sitemap';

import mdx from '@astrojs/mdx';

import robotsTxt from 'astro-robots-txt';

// https://astro.build/config
export default defineConfig({
  prefetch: true,
  site: 'https://nicholastrigger.com',

  vite: {
    plugins: [tailwindcss()]
  },

  integrations: [react(), sitemap(), mdx(), robotsTxt()]
});