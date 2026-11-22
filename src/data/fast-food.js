/**
 * The ONLY way to list fast-food chains — the same rule as publishedNutrients().
 * A chain page is created as a draft and stays one until a person has checked
 * every figure against the chain's own nutrition page. Drafts are shown during
 * local development (`npm run dev`) and never in a build.
 */
import { getCollection } from 'astro:content';

export { proteinPer100, ranked, lowestCalories, servingText, val, choice, rowsOf, startTotals, sectionsOf } from './fast-food-rank.js';

export async function publishedChains() {
  const showDrafts = import.meta.env.DEV;
  return (await getCollection('fast-food'))
    .filter(c => showDrafts || !c.data.draft)
    .sort((a, b) => a.data.name.localeCompare(b.data.name));
}
