import { rehypeCitations } from './src/plugins/rehype-citations.mjs';
import { rehypeCharts } from './src/plugins/rehype-charts.mjs';
import { rehypeScheduledLinks } from './src/plugins/rehype-scheduled-links.mjs';
import { unified } from '@astrojs/markdown-remark';
import { SITE } from './src/site.config.js';
import { defineConfig } from 'astro/config';
// Preact with React compatibility: the components import from 'react' and run on
// preact/compat, about 170 KB lighter per calculator page (v2.22.0).
import preact from '@astrojs/preact';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { lastmodMap } from './src/data/lastmod.mjs';

// The Library is live once any nutrient or exercise is published.
const published = dir => existsSync(dir) && readdirSync(dir)
  .filter(f => f.endsWith('.yaml'))
  .some(f => !/^draft:\s*true\s*$/m.test(readFileSync(`${dir}/${f}`, 'utf8')));
const LIBRARY_LIVE = published('./src/content/nutrients') || published('./src/content/exercises');
// Sitemap dates for pages with a real content date (SEO audit, v2.54.2; src/data/lastmod.mjs).
const LASTMOD = lastmodMap();

export default defineConfig({
  // Update to the real domain before launch — sitemap URLs depend on it.
  site: SITE.url,
  // `astro dev` is the local preview, where drafts and scheduled articles are shown —
  // so links to them stay live there. Every build turns them into plain text until
  // their date (src/plugins/rehype-scheduled-links.mjs).
  markdown: { processor: unified({ rehypePlugins: [rehypeCharts, rehypeCitations,
    [rehypeScheduledLinks, { preview: process.argv.includes('dev') }]] }) },
  integrations: [preact({ compat: true }), mdx(), sitemap({
    // The library index is left out of the sitemap until at least one nutrient
    // or exercise is published — read from the files themselves, so publishing one is all
    // it takes. (An environment variable here would silently go stale.)
    // Embed pages (item 60) are noindex copies of tool pages for other sites' iframes.
    filter: page => !page.includes('/embed/') && (!page.endsWith('/library/') || LIBRARY_LIVE),
    serialize: item => {
      const when = LASTMOD[new URL(item.url).pathname];
      return when ? { ...item, lastmod: when } : item;
    },
  })],
});
