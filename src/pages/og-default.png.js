/**
 * The site-wide share card, for pages without their own. Built into dist/ like the
 * per-page cards, so a build no longer rewrites a committed public/og-default.png.
 */
import { defaultCardSvg, toPng } from '../og/card.js';
import { SITE } from '../site.config.js';
import { liveTools } from '../data/tools.js';

export async function GET() {
  const svg = defaultCardSvg({
    name: SITE.name, tagline: SITE.tagline,
    instruments: liveTools().filter(t => t.slug).length,   // derived, so it cannot go stale
  });
  return new Response(await toPng(svg), { headers: { 'Content-Type': 'image/png' } });
}
