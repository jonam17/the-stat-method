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
import { isPublished, isVisible, articleStatus } from './publishing.js';

export { isPublished, articleStatus };

/**
 * Local preview: `npm run dev` also shows drafts and scheduled articles, with a
 * banner on the article page, so they can be reviewed without editing dates.
 * import.meta.env.DEV is false in `npm run build`, so production is unaffected.
 */
export const PREVIEW = import.meta.env.DEV;

/** Published articles, newest first. `filter` narrows further, e.g. by tool. */
export async function publishedArticles(filter = () => true) {
  const now = new Date();
  return (await getCollection('articles',
    ({ data }) => isVisible(data, now, PREVIEW) && filter(data)))
    .sort((a, b) => b.data.published - a.data.published);
}
