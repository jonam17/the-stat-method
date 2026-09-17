/**
 * Hand-portion translation and meal splitting.
 *
 * The hand-portion approach maps macro targets onto body-scaled units, so it needs
 * no scale and travels with the person. Popularised by Precision Nutrition; the
 * gram equivalents below are the commonly used approximations, which vary with
 * hand size and are deliberately presented as ranges rather than exact figures.
 */

/** Approximate grams of the target macro delivered per hand unit. */
export const HAND_UNITS = {
  protein: { unit: 'palm',        grams: 25, note: 'A palm-sized portion of meat, fish, tofu or Greek yoghurt.' },
  carbs:   { unit: 'cupped hand', grams: 25, note: 'A cupped handful of rice, pasta, oats, potato or fruit.' },
  fat:     { unit: 'thumb',       grams: 10, note: 'A thumb-sized portion of oil, nuts, nut butter or cheese.' },
  veg:     { unit: 'fist',        grams: 0,  note: 'A fist of non-starchy vegetables. Aim for one per meal.' },
};

/** Scale hand size: smaller hands deliver less per unit. */
export const HAND_SIZE = { small: 0.8, average: 1.0, large: 1.2 };

/**
 * Convert daily macro grams into hand portions.
 * Returns whole portions plus the remainder, so nothing silently disappears.
 */
export function toHandPortions({ proteinG, carbsG, fatG, handSize = 'average' }) {
  const s = HAND_SIZE[handSize] ?? 1;
  const conv = (grams, key) => {
    const per = HAND_UNITS[key].grams * s;
    const exact = grams / per;
    return {
      key,
      unit: HAND_UNITS[key].unit,
      gramsPerUnit: per,
      exact,
      whole: Math.round(exact * 2) / 2,      // nearest half portion
      totalGrams: grams,
      note: HAND_UNITS[key].note,
    };
  };
  return {
    protein: conv(proteinG, 'protein'),
    carbs: conv(carbsG, 'carbs'),
    fat: conv(fatG, 'fat'),
  };
}

/**
 * Split daily macros across meals.
 * `peri` optionally weights one meal more heavily (e.g. around training).
 */
export function splitMeals({ proteinG, carbsG, fatG, meals = 4, periIndex = null, periWeight = 1.5 }) {
  const n = Math.max(1, Math.min(8, meals));
  const weights = Array.from({ length: n }, (_, i) =>
    (periIndex != null && i === periIndex) ? periWeight : 1);
  const total = weights.reduce((a, b) => a + b, 0);
  return weights.map((w, i) => ({
    meal: i + 1,
    isPeri: periIndex != null && i === periIndex,
    proteinG: Math.round((proteinG * w) / total),
    carbsG: Math.round((carbsG * w) / total),
    fatG: Math.round((fatG * w) / total),
    kcal: Math.round(((proteinG * 4 + carbsG * 4 + fatG * 9) * w) / total),
  }));
}

/**
 * Protein target from lean mass (preferred) or bodyweight, adjusted for
 * deficit depth and training age.
 * Ranges follow Morton et al. (2018) and Helms et al. (2014).
 */
export function proteinTarget({ kg, lbm = null, deficit = 'none', trainingAge = 'intermediate', older = false }) {
  const base = lbm != null ? lbm : kg;
  const perKg = lbm != null ? { low: 1.6, high: 2.4 } : { low: 1.3, high: 2.0 };
  let lo = perKg.low, hi = perKg.high;
  if (deficit === 'moderate') { lo += 0.2; hi += 0.1; }
  if (deficit === 'aggressive') { lo += 0.4; hi += 0.2; }
  if (trainingAge === 'novice') { hi -= 0.2; }
  if (older) { lo += 0.2; }
  return {
    basis: lbm != null ? 'lean body mass' : 'bodyweight',
    lowG: Math.round(base * lo),
    highG: Math.round(base * hi),
    midG: Math.round((base * lo + base * hi) / 2),
    perKgLow: lo, perKgHigh: hi,
  };
}
