/**
 * Per-page share cards, written into dist/ at build time and never committed.
 * See src/og/card.js for how they are drawn and src/og/pages.js for what they say.
 */
import { shareCards } from '../../og/pages.js';
import { pageCardSvg, toPng } from '../../og/card.js';

export async function getStaticPaths() {
  return (await shareCards()).map(c => ({
    params: { path: c.path.replace(/^\/og\//, '').replace(/\.png$/, '') },
    props: { card: c.card },
  }));
}

export async function GET({ props }) {
  return new Response(await toPng(pageCardSvg(props.card)), {
    headers: { 'Content-Type': 'image/png' },
  });
}
