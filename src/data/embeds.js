// Embeddable calculators (item 60, v2.54.0). Each listed tool gets /embed/<slug>/: the calculator alone, for
// another site to put in an iframe, with a credit link back to the full tool page. Embed pages are noindex,
// point their canonical at the tool page, stay out of the sitemap, and are the only pages that may be framed
// (public/_headers). Kept free of astro:content so tests can import it.

/** Tools with an embed page, in the order the Home "popular" row shows them. `height` is the iframe height
 *  (px) in the copy-ready snippet: the page's full height at 720 px wide (measured 2026-11-22) plus some room.
 *  Narrower frames scroll inside. */
export const EMBEDS = [
  { slug: 'tdee-calculator', height: 1550 },
  { slug: 'macro-calculator', height: 1650 },
  { slug: 'body-fat', height: 1700 },
  { slug: 'one-rep-max', height: 1700 },
  { slug: 'protein-target', height: 1500 },
];

export const CREDIT = 'Calculator by The Stat Method';

export const embedFor = slug => EMBEDS.find(e => e.slug === slug);

/** The iframe snippet a site owner copies. `origin` is the site's absolute URL. */
export const snippet = (slug, name, origin) => {
  const e = embedFor(slug);
  if (!e) throw new Error(`no embed for ${slug}`);
  const base = origin.replace(/\/$/, '');
  const esc = s => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;');
  return `<iframe src="${base}/embed/${slug}/" title="${esc(name)} (${CREDIT})" width="100%" height="${e.height}" style="border:0;max-width:720px" loading="lazy"></iframe>`;
};
