/**
 * The ONLY way to list exercise entries — the same rule as the nutrients:
 * drafts appear in local development (`npm run dev`) for review, never in a build.
 */
import { getCollection } from 'astro:content';
export { GROUPS, EVIDENCE_KINDS, EQUIPMENT, MAX_PER_GROUP, equipmentText } from './exercise-meta.js';

export async function publishedExercises() {
  const showDrafts = import.meta.env.DEV;
  return (await getCollection('exercises'))
    .filter(e => showDrafts || !e.data.draft)
    .sort((a, b) => a.data.name.localeCompare(b.data.name));
}
