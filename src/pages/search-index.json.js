import { getCollection } from 'astro:content';
import { liveTools } from '../data/tools.js';

/**
 * Prebuilt search index, emitted as a static file at build time.
 *
 * The whole corpus is 18 tools + 19 articles + a handful of reference pages —
 * roughly 8KB gzipped — so it ships as one JSON file and is searched entirely
 * in the browser. No search service, no runtime, nothing to keep online. It is
 * fetched lazily on first interaction with the search box rather than on page
 * load, so it costs nothing to anyone who never searches.
 */

// Reference pages worth finding by name. Kept explicit rather than globbed:
// the pages directory also holds endpoints, 404 and the dynamic article route,
// none of which should appear in results.
const PAGES = [
  { url: '/tools/', title: 'All calculators', desc: 'Every instrument on the site, by category.', kind: 'Page' },
  { url: '/articles/', title: 'All articles', desc: 'Long-form explainers with cited sources.', kind: 'Page' },
  { url: '/methodology/', title: 'Methodology', desc: 'Every equation used, and the paper it came from.', kind: 'Page' },
  { url: '/resources/', title: 'Resources', desc: 'Reference material and further reading.', kind: 'Page' },
  { url: '/editorial-policy/', title: 'Editorial policy', desc: 'How articles are sourced, reviewed and corrected.', kind: 'Page' },
  { url: '/about/', title: 'About', desc: 'What this site is and who makes it.', kind: 'Page' },
  { url: '/privacy/', title: 'Privacy', desc: 'What is collected. Calculator inputs stay in your browser.', kind: 'Page' },
  { url: '/terms/', title: 'Terms', desc: 'Terms of use.', kind: 'Page' },
];

export async function GET() {
  const articles = await getCollection('articles');

  const entries = [
    ...liveTools()
      .filter(t => t.slug)
      .map(t => ({
        url: `/tools/${t.slug}/`,
        title: t.name,
        desc: t.desc,
        cat: t.category,
        kind: 'Calculator',
      })),

    ...articles.map(a => ({
      url: `/articles/${a.id}/`,
      title: a.data.title,
      desc: a.data.dek,
      cat: a.data.category,
      kind: 'Article',
    })),

    ...PAGES,
  ];

  return new Response(JSON.stringify(entries), {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
