/**
 * Exercises — shared constants, with no Astro dependency, so the content schema,
 * the pages and the tests all use the same lists. Follow docs/EXERCISE-WORKFLOW.md.
 */
export const GROUPS = [
  { key: 'quadriceps', label: 'Quadriceps' },
  { key: 'chest', label: 'Chest' },
  { key: 'back', label: 'Back' },
  { key: 'hamstrings-glutes', label: 'Hamstrings and glutes' },
  { key: 'shoulders', label: 'Shoulders' },
  { key: 'arms', label: 'Arms' },
  { key: 'core', label: 'Core' },
];
export const MAX_PER_GROUP = 5;

/**
 * Kinds of evidence, strongest first. An exercise is included only on a
 * `training` or `review` item — EMG shows activation during a session, not
 * growth or strength over weeks, so it can add detail but never be the reason
 * an exercise is listed (tested in exercises.test.js).
 */
export const EVIDENCE_KINDS = {
  training: 'Training study',
  review: 'Review',
  length: 'Muscle-length study',
  emg: 'EMG study',
};
export const QUALIFYING_KINDS = ['training', 'review'];

/** "Dumbbells or body weight" — first label capitalised, the rest in running text. */
export const equipmentText = keys => keys.map((k, i) => (i ? EQUIPMENT[k].toLowerCase() : EQUIPMENT[k])).join(' or ');

export const EQUIPMENT = {
  barbell: 'Barbell', dumbbell: 'Dumbbells', kettlebell: 'Kettlebell', machine: 'Machine',
  cable: 'Cable', bodyweight: 'Body weight', band: 'Resistance band',
};
