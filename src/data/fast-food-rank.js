/**
 * Fast-food sections and ranking, kept free of astro:content so the tests can
 * import them (the same split as exercise-meta.js).
 */

/** Grams of protein per 100 kcal, to one decimal. */
export const proteinPer100 = i => Math.round((i.protein / i.kcal) * 1000) / 10;

/** Items ranked by protein per 100 kcal (highest first); ties go to fewer calories, then name. */
export const ranked = items => items
  .map(i => ({ ...i, per100: proteinPer100(i) }))
  .sort((a, b) => b.per100 - a.per100 || a.kcal - b.kcal || a.name.localeCompare(b.name));

/** Lowest-calorie item; ties go to the higher protein. */
export const lowestCalories = items => [...items].sort((a, b) => a.kcal - b.kcal || b.protein - a.protein)[0];

/** The serving as the chain gives it: "55 g", or "6.2 oz" when it gives only ounces. */
export const servingText = i => i.servingG ? `${i.servingG} g` : i.servingOz ? `${i.servingOz} oz` : '';
