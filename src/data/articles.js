/**
 * The only way to list articles. Every page that shows articles uses this.
 *
 * Six places used to write their own filter, and the search index wrote none —
 * it listed every article whatever its status. That was harmless while no draft
 * existed, and would have leaked scheduled articles into live search on the
 * first Sunday of scheduled publishing. One function means one rule.
 *
 * An article is published when it is not a draft AND its date has arrived.
 * Dates are compared in UTC: `published: 2026-10-04` means 00:00 UTC that day,
 * so the Sunday 10:00 UTC build includes it.
 */
import { getCollection } from 'astro:content';
import { isPublished } from './publishing.js';

export { isPublished };

/** Published articles, newest first. `filter` narrows further, e.g. by tool. */
export async function publishedArticles(filter = () => true) {
  const now = new Date();
  return (await getCollection('articles',
    ({ data }) => isPublished(data, now) && filter(data)))
    .sort((a, b) => b.data.published - a.data.published);
}
