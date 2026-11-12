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

/**
 * Joints that move during the exercise, as each page's "How to do it" describes it. One joint is a
 * single-joint (isolation) exercise; more is multi-joint (compound). Kept as data, not derived from
 * the Progressive Overload class: the hip thrust and stiff-leg deadlift use the heavy "large compound"
 * weight steps but move only the hips (v2.38.11, roadmap item 6).
 */
export const JOINTS = {
  shoulder: 'shoulder', elbow: 'elbow', hip: 'hip', knee: 'knee', ankle: 'ankle',
};
/** "Hip, knee and ankle · multi-joint" */
export const jointsText = keys => {
  const names = keys.map(k => JOINTS[k]);
  const list = names.length > 1 ? `${names.slice(0, -1).join(', ')} and ${names.at(-1)}` : names[0];
  return `${list[0].toUpperCase()}${list.slice(1)} · ${keys.length > 1 ? 'multi-joint' : 'single-joint'}`;
};

export const EQUIPMENT = {
  barbell: 'Barbell', dumbbell: 'Dumbbells', kettlebell: 'Kettlebell', machine: 'Machine',
  cable: 'Cable', bodyweight: 'Body weight', band: 'Resistance band',
};
