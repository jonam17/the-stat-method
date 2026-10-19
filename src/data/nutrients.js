/**
 * The ONLY way to list library entries — the same rule as publishedArticles().
 *
 * A nutrient page is created as a draft and stays one until a person has
 * checked every value against its source, because its footer says it was
 * "edited and fact-checked by a human". Drafts are shown during local
 * development (`npm run dev`) so they can be reviewed, and never in a build.
 */
import { getCollection } from 'astro:content';

// `noun` is the singular shown on share cards ("Library · vitamin"). Choline is
// neither a vitamin nor a mineral — its fact sheet calls it "an essential
// nutrient" — so it has a kind of its own rather than a label it does not carry.
export const KINDS = [
  { key: 'vitamin', slug: 'vitamins', label: 'Vitamins', noun: 'vitamin' },
  { key: 'mineral', slug: 'minerals', label: 'Minerals', noun: 'mineral' },
  { key: 'other', slug: 'other-nutrients', label: 'Other nutrients', noun: 'nutrient' },
];

export async function publishedNutrients() {
  const showDrafts = import.meta.env.DEV;
  return (await getCollection('nutrients'))
    .filter(n => showDrafts || !n.data.draft)
    .sort((a, b) => a.data.name.localeCompare(b.data.name));
}

/** Kinds that actually have entries — an empty section is never linked. */
export async function kindsWithEntries() {
  const all = await publishedNutrients();
  return KINDS.filter(k => all.some(n => n.data.kind === k.key));
}

/** Converts an amount in the file's unit to its second unit, if it has one. */
export const inAltUnit = (n, v) => n.data.altUnit ? Math.round(v * n.data.altUnit.perUnit) : null;
