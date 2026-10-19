/**
 * Which pages get their own share card, and what each card says.
 *
 * Every card is built from the page's own data — title, dek, category, citation
 * count — so a card cannot say something its page does not. Lists come from the
 * same functions the pages use (publishedArticles, liveTools, publishedNutrients,
 * publishedExercises), so a draft or scheduled page never gets a card in a build.
 */
import { publishedArticles } from '../data/articles.js';
import { liveTools } from '../data/tools.js';
import { publishedNutrients, KINDS } from '../data/nutrients.js';
import { publishedExercises, GROUPS } from '../data/exercises.js';
import { SITE } from '../site.config.js';
import { CATEGORY_ACCENT, PALETTE } from './card.js';

/** The one place card URLs are spelled; pages and the endpoint both use it. */
export const ogPath = {
  article: slug => `/og/articles/${slug}.png`,
  tool: slug => `/og/tools/${slug}.png`,
  nutrient: (kindSlug, slug) => `/og/library/${kindSlug}/${slug}.png`,
  exercise: slug => `/og/library/exercises/${slug}.png`,
};

const host = () => new URL(SITE.url).hostname.replace(/^www\./, '');

export async function shareCards() {
  const cards = [];
  for (const a of await publishedArticles()) {
    const d = a.data;
    const n = d.references?.length ?? 0;
    const checked = d.citationsVerified === 'full' && n > 0;
    cards.push({
      path: ogPath.article(a.id),
      card: {
        kicker: `Article · ${d.category}`, title: d.title, subtitle: d.dek,
        footLeft: host(),
        footRight: checked ? `All ${n} citations checked` : `${d.readMinutes} min read`,
        accent: CATEGORY_ACCENT[d.category] ?? PALETTE.signal,
      },
    });
  }
  for (const t of liveTools().filter(t => t.slug)) {
    cards.push({
      path: ogPath.tool(t.slug),
      card: {
        kicker: `Calculator · ${t.category}`, title: t.name, subtitle: t.desc,
        footLeft: host(), footRight: 'No account · inputs stay local',
      },
    });
  }
  for (const n of await publishedNutrients()) {
    const kind = KINDS.find(k => k.key === n.data.kind);
    cards.push({
      path: ogPath.nutrient(kind.slug, n.id),
      card: {
        kicker: `Library · ${kind.noun}`, title: n.data.name, subtitle: n.data.dek,
        footLeft: host(), footRight: 'Values from the NIH fact sheet', accent: PALETTE.nutrition,
      },
    });
  }
  for (const e of await publishedExercises()) {
    const group = GROUPS.find(g => g.key === e.data.group);
    cards.push({
      path: ogPath.exercise(e.id),
      card: {
        kicker: `Library · Exercise · ${group?.label ?? e.data.group}`, title: e.data.name, subtitle: e.data.dek,
        footLeft: host(), footRight: 'Chosen on training studies', accent: PALETTE.training,
      },
    });
  }
  return cards;
}
