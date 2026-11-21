/**
 * Fast-food sections and ranking, kept free of astro:content so the tests can
 * import them (the same split as exercise-meta.js).
 */

// Sections in the order the chains' menus use them. Drinks, treats, sauces and
// dressings are left out of every chain (stated on each page).
export const SECTIONS = [
  { key: 'breakfast', label: 'Breakfast' },
  { key: 'entrees', label: 'Entrées' },
  { key: 'salads', label: 'Salads' },
  { key: 'sides', label: 'Sides' },
];

/** Grams of protein per 100 kcal, to one decimal. */
export const proteinPer100 = i => Math.round((i.protein / i.kcal) * 1000) / 10;

/** Items ranked by protein per 100 kcal (highest first); ties go to fewer calories, then name. */
export const ranked = items => items
  .map(i => ({ ...i, per100: proteinPer100(i) }))
  .sort((a, b) => b.per100 - a.per100 || a.kcal - b.kcal || a.name.localeCompare(b.name));

/** Lowest-calorie item; ties go to the higher protein. */
export const lowestCalories = items => [...items].sort((a, b) => a.kcal - b.kcal || b.protein - a.protein)[0];
