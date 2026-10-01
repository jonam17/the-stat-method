import { rehypeCitations } from './src/plugins/rehype-citations.mjs';
import { rehypeCharts } from './src/plugins/rehype-charts.mjs';
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
  markdown: { processor: unified({ rehypePlugins: [rehypeCharts, rehypeCitations] }) },
  integrations: [react(), mdx(), sitemap({
    // The library index is left out of the sitemap until at least one nutrient
    // is published — read from the files themselves, so publishing one is all
    // it takes. (An environment variable here would silently go stale.)
    filter: page => !page.endsWith('/library/') || LIBRARY_LIVE,
  })],
});
