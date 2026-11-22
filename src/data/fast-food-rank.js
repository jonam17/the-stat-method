/**
 * Fast-food sections and ranking, kept free of astro:content so the tests can
 * import them (the same split as exercise-meta.js).
 */

/** Grams of protein per 100 kcal, to one decimal. */
export const proteinPer100 = i => Math.round((val(i.protein) / i.kcal) * 1000) / 10;

/** Items ranked by protein per 100 kcal (highest first); ties go to fewer calories, then name. */
export const ranked = items => items
  .map(i => ({ ...i, per100: proteinPer100(i) }))
  .sort((a, b) => b.per100 - a.per100 || a.kcal - b.kcal || a.name.localeCompare(b.name));

/** Lowest-calorie item; ties go to the higher protein. */
export const lowestCalories = items => [...items].sort((a, b) => a.kcal - b.kcal || val(b.protein) - val(a.protein))[0];

/** The serving as the chain gives it: "55 g", or "6.2 oz" when it gives only ounces. */
export const servingText = i => i.servingG ? `${i.servingG} g` : i.servingOz ? `${i.servingOz} oz` : (i.portion ?? '');

/**
 * Build-your-own chains (v2.52.0) publish figures per ingredient. Some figures are
 * printed as "<1" (under 1 g); they are shown as printed and counted as 0 in sums
 * and rankings.
 */
export const val = x => (x === '<1' ? 0 : x);

/**
 * One builder choice as it adds to an order: the listed portion times `count`
 * (three taco tortillas). "<1" stays "<1"; nothing with a count prints it.
 */
export const choice = i => {
  const k = i.count ?? 1;
  if (k === 1) return i;
  const m = x => (x === '<1' ? x : Math.round(x * k * 10) / 10);
  return { ...i, portion: `${k} × ${i.portion}`, kcal: i.kcal * k, protein: m(i.protein), carbs: m(i.carbs), fat: m(i.fat) };
};

/** The rows a chain's ranked table shows: its menu items, or every builder choice with calories. */
export const rowsOf = d => d.builder
  ? d.builder.groups.flatMap(g => g.items.filter(i => i.kcal > 0).map(i => ({ ...choice(i), section: g.key })))
  : d.items;

/** The starting order's totals (each choice's `start` amount), "<1" counted as 0. */
export const startTotals = d => {
  const t = { kcal: 0, protein: 0, carbs: 0, fat: 0 };
  for (const g of d.builder.groups) for (const i of g.items) {
    const c = choice(i), k = i.start ?? 0;
    for (const f of Object.keys(t)) t[f] = Math.round((t[f] + val(c[f]) * k) * 10) / 10;
  }
  return t;
};

/** The sections the table filters by: the chain's menu sections, or its builder groups. */
export const sectionsOf = d => (d.builder ? d.builder.groups.map(g => ({ key: g.key, label: g.label })) : d.sections);
