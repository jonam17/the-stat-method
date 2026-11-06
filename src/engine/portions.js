/**
 * Hand-portion translation and meal splitting.
 *
 * The hand-portion approach maps macro targets onto body-scaled units, so it needs no scale and
 * travels with the person. Figures from Precision Nutrition (a coaching company): its "Hand-size
 * portion guide" handout gives ~20–30 g protein per palm, ~20–30 g carbs per cupped hand and
 * ~7–12 g fat per thumb, and its article "How to do hand portion math" (reviewed March 2026)
 * gives approximate figures by sex — men 24 / 25 / 9 g, women 22 / 22 / 8 g — and 1–2 fists of
 * vegetables at each meal. Each portion also carries some of the other macros (a man's palm of
 * protein ~4.5 g fat, for instance); like PN's own "hand portion math", this conversion counts
 * only the main one.
 *
 * v2.38.8 (item 45, batch 5): the flat 25 / 25 / 10 g and the small/large hand-size multiplier
 * (×0.8 / ×1.2) were unsourced and are gone; PN's premise is that "hands scale with the
 * individual".
 */

/** Grams of the main macro per hand portion, by sex (PN). */
export const HAND_UNITS = {
  protein: { unit: 'palm',        grams: { male: 24, female: 22 }, note: 'A palm-sized portion of meat, fish, tofu, eggs or Greek yoghurt.' },
  carbs:   { unit: 'cupped hand', grams: { male: 25, female: 22 }, note: 'A cupped handful of grains, legumes, fruit or potato.' },
  fat:     { unit: 'thumb',       grams: { male: 9,  female: 8 },  note: 'A thumb-sized portion of oil, nuts, seeds, nut butter or cheese.' },
  veg:     { unit: 'fist',        grams: null, note: 'A fist of non-starchy vegetables. Aim for one to two per meal.' },
};

/**
 * Convert daily macro grams into hand portions.
 * Returns whole portions plus the remainder, so nothing silently disappears.
 * `sex` picks PN's figures; anything other than 'female' uses the men's.
 */
export function toHandPortions({ proteinG, carbsG, fatG, sex = 'male' }) {
  const k = sex === 'female' ? 'female' : 'male';
  const conv = (grams, key) => {
    const per = HAND_UNITS[key].grams[k];
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
 * Protein target (v2.38.6, item 45 batch 3):
 *   Default: 1.4–2.0 g/kg bodyweight — the ISSN position stand (Jäger et al., JISSN 2017).
 *   In a calorie deficit with body fat known: 2.3–3.1 g/kg lean mass — Helms et al. (JISSN 2014),
 *     who advise the higher end the harder the cut and the leaner the person.
 * The old steps (+0.2/+0.4 for a deficit, −0.2 for novices, +0.2 from age 60) and the 1.6–2.4 g/kg
 * lean-mass and 1.3–2.0 g/kg bodyweight bands appeared in no source and were removed. No age step:
 * PROT-AGE (Bauer et al., JAMDA 2013) asks at least 1.0–1.2 g/kg after 65 (1.2 if active), which
 * the default already exceeds, and Morton et al. (BJSM 2018) found extra protein helped less with age.
 * `deficit` accepts 'none' or 'deficit' (and the retired 'moderate'/'aggressive', read as 'deficit').
 */
export const PROTEIN_BANDS = {
  bodyweight: { low: 1.4, high: 2.0 },
  deficitLeanMass: { low: 2.3, high: 3.1 },
};

export function proteinTarget({ kg, lbm = null, deficit = 'none' }) {
  const inDeficit = deficit !== 'none' && deficit != null;
  const useLean = inDeficit && lbm != null;
  const base = useLean ? lbm : kg;
  const band = useLean ? PROTEIN_BANDS.deficitLeanMass : PROTEIN_BANDS.bodyweight;
  const lo = band.low, hi = band.high;
  return {
    basis: useLean ? 'lean body mass' : 'bodyweight',
    inDeficit, leanMassNeedsBodyFat: inDeficit && lbm == null,
    lowG: Math.round(base * lo),
    highG: Math.round(base * hi),
    midG: Math.round((base * lo + base * hi) / 2),
    perKgLow: lo, perKgHigh: hi,
  };
}
