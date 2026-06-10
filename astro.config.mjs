// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import vercel from '@astrojs/vercel';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://kartybezcenzury.cz',
  // Hybrid: stránky jsou statické (prerendered), jen /api/* je server-rendered
  output: 'static',
  adapter: vercel(),
  integrations: [sitemap()],
  vite: {
    plugins: [tailwindcss()]
  }
});
