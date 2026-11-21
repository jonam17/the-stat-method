/**
 * The ONLY way to list foods — the same draft rule as the nutrients: drafts show in
 * local development (`npm run dev`) and never in a build.
 */
import { getCollection } from 'astro:content';
export { FOOD_GROUPS, FOODS_SOURCE } from './foods-meta.js';

export async function publishedFoods() {
  const showDrafts = import.meta.env.DEV;
  return (await getCollection('foods'))
    .filter(f => showDrafts || !f.data.draft)
    .sort((a, b) => a.data.name.localeCompare(b.data.name));
}
