/**
 * Article categories. Single source of truth for the four category pages, the
 * filter navigation, and the pill colours.
 *
 * Names must match the enum in src/content.config.ts exactly — the build fails
 * on a mismatch rather than silently producing an empty category page.
 */
export const CATEGORIES = [
  { name: 'Nutrition', slug: 'nutrition',
    description: 'Protein, calories, macronutrients and what the evidence actually supports about each.' },
  { name: 'Exercise', slug: 'exercise',
    description: 'Strength, cardio and the numbers used to measure both — where each formula came from and what it can tell you.' },
  { name: 'Health', slug: 'health',
    description: 'Body composition and weight, and the limits of the measures used to describe them.' },
  { name: 'Recovery', slug: 'recovery',
    description: 'Sleep, caffeine and the parts of training that happen when you are not training.' },
];

export const findCategory = slug => CATEGORIES.find(c => c.slug === slug);
