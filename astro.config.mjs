import { rehypeCitations } from './src/plugins/rehype-citations.mjs';
import { rehypeCharts } from './src/plugins/rehype-charts.mjs';
import { rehypeScheduledLinks } from './src/plugins/rehype-scheduled-links.mjs';
import { unified } from '@astrojs/markdown-remark';
import { SITE } from './src/site.config.js';
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { readdirSync, readFileSync, existsSync } from 'node:fs';

const NUTRIENTS = './src/content/nutrients';
const LIBRARY_LIVE = existsSync(NUTRIENTS) && readdirSync(NUTRIENTS)
  .filter(f => f.endsWith('.yaml'))
  .some(f => !/^draft:\s*true\s*$/m.test(readFileSync(`${NUTRIENTS}/${f}`, 'utf8')));

export default defineConfig({
  // Update to the real domain before launch — sitemap URLs depend on it.
  site: SITE.url,
  // `astro dev` is the local preview, where drafts and scheduled articles are shown —
  // so links to them stay live there. Every build turns them into plain text until
  // their date (src/plugins/rehype-scheduled-links.mjs).
  markdown: { processor: unified({ rehypePlugins: [rehypeCharts, rehypeCitations,
    [rehypeScheduledLinks, { preview: process.argv.includes('dev') }]] }) },
  integrations: [react(), mdx(), sitemap({
    // The library index is left out of the sitemap until at least one nutrient
    // is published — read from the files themselves, so publishing one is all
    // it takes. (An environment variable here would silently go stale.)
    filter: page => !page.endsWith('/library/') || LIBRARY_LIVE,
  })],
});
