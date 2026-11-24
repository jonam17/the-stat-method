// Search-result descriptions (SEO audit, v2.54.2). A page whose visible lead line is under META_MIN
// characters gets a fixed tail in its meta description only, when the result still fits META_MAX;
// otherwise the lead line is used as it is. Kept free of astro:content for tests.

export const META_MIN = 120;
export const META_MAX = 160;

/** The lead line, plus `tail` when the lead is short and lead + tail fits. */
export const metaDescription = (lead, tail) => {
  const base = lead.trim();
  if (!tail || base.length >= META_MIN) return base;
  const joined = `${base}${tail}`;
  return joined.length <= META_MAX ? joined : base;
};

/** Food pages: every one has the per-amount calculator and USDA source. */
export const FOOD_META_TAIL = ' USDA data, plus an amount calculator.';

/** Exercise pages: every one has these three sections. */
export const EXERCISE_META_TAIL = ' How to do it and how to progress.';
