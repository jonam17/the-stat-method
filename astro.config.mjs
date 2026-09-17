import { rehypeCitations } from './src/plugins/rehype-citations.mjs';
import { unified } from '@astrojs/markdown-remark';
import { SITE } from './src/site.config.js';
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  // Update to the real domain before launch — sitemap URLs depend on it.
  site: SITE.url,
  markdown: { processor: unified({ rehypePlugins: [rehypeCitations] }) },
  integrations: [react(), mdx(), sitemap()],
});
