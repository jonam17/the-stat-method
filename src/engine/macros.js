/** Macronutrient targets and split arithmetic. */

export const KCAL_PER_G = { p: 4, c: 4, f: 9 };

/**
 * Default split (v2.38.6, item 45 batch 3 — each figure from a named source):
 *   Protein 1.8 g/kg bodyweight — inside the ISSN's 1.4–2.0 g/kg/d (Jäger et al., JISSN 2017) and
 *     between Morton et al.'s plateau (1.62 g/kg/d, 95% CI 1.03–2.20; BJSM 2018) and their "~2.2".
 *   Cutting with body fat known: 2.3 g/kg lean mass — the low end of Helms et al.'s 2.3–3.1
 *     (JISSN 2014). No source gives a lean-mass figure outside a deficit, so the old 2.2 g/kg LBM is gone.
 *   Fat 25% of calories — inside the IOM's AMDR of 20–35% (DRI 2005) and Helms' 15–30% in a deficit.
 *   Fat floor 20% of calories — the AMDR's lower bound. It replaces 0.8 g/kg "for hormonal health",
 *     which no source supports (Helms: the deficit and leanness matter more than fat share).
 *   Carbohydrate fills the remainder.
 */
export const DEFAULT_PROTEIN_G_PER_KG = 1.8;
export const CUT_PROTEIN_G_PER_KG_LBM = 2.3;
export const DEFAULT_FAT_PCT = 0.25;
export const FAT_FLOOR_PCT = 0.20;
export function defaultMacros({ cals, kg, lbm, goal }) {
  const protein = goal === 'cut' && lbm != null
    ? CUT_PROTEIN_G_PER_KG_LBM * lbm
    : DEFAULT_PROTEIN_G_PER_KG * kg;
  const fatFloor = (cals * FAT_FLOOR_PCT) / 9;
  let fat = Math.max(fatFloor, (cals * DEFAULT_FAT_PCT) / 9);
  let carbs = (cals - protein * 4 - fat * 9) / 4;
  if (carbs < 0) {
    carbs = 0;
    fat = Math.max(fatFloor, (cals - protein * 4) / 9);
  }
  return { p: protein, c: carbs, f: fat };
}

/** Convert gram amounts into percentage-of-calories. */
export function splitFromGrams({ p, c, f }) {
  const tp = p * 4, tc = c * 4, tf = f * 9;
  const total = tp + tc + tf || 1;
  return { p: (tp / total) * 100, c: (tc / total) * 100, f: (tf / total) * 100 };
}

/** Whole-number percentages guaranteed to sum to 100 (fat absorbs rounding). */
export function recommendedPercent({ cals, kg, lbm, goal }) {
  const s = splitFromGrams(defaultMacros({ cals, kg, lbm, goal }));
  const p = Math.round(s.p), c = Math.round(s.c);
  return { p, c, f: Math.max(0, 100 - p - c) };
}

/** Whole-number grams that reconcile to the calorie target (carbs absorb rounding). */
export function recommendedGrams({ cals, kg, lbm, goal }) {
  const g = defaultMacros({ cals, kg, lbm, goal });
  const p = Math.round(g.p), f = Math.round(g.f);
  // F-010: when protein + the fat floor already exceed the target, the carb
  // clamp used to resolve the impossible constraint by silently violating the
  // calorie invariant this function's docstring promises. Report it instead.
  const rawC = (cals - p * 4 - f * 9) / 4;
  const c = Math.max(0, Math.round(rawC));
  const kcal = p * 4 + c * 4 + f * 9;
  return { p, c, f, over: kcal > cals + 1, kcal };
}

/**
 * Resolve a user-entered split (in either unit) into both units plus budget status.
 * Never throws on over-budget input — the UI flags it instead.
 */
export function resolveSplit({ raw, cals, mode }) {
  const grams = {}, pct = {};
  for (const k of ['p', 'c', 'f']) {
    const n = Number(raw[k]) || 0;
    if (mode === 'grams') {
      grams[k] = n;
      pct[k] = cals ? (n * KCAL_PER_G[k] / cals) * 100 : 0;
    } else {
      pct[k] = n;
      grams[k] = Math.round((cals * n) / 100 / KCAL_PER_G[k]);
    }
  }
  const macroKcal = grams.p * 4 + grams.c * 4 + grams.f * 9;
  const totalPct = pct.p + pct.c + pct.f;
  return {
    grams, pct, macroKcal, totalPct,
    over:  mode === 'grams' ? macroKcal > cals : totalPct > 100,
    under: mode === 'grams' ? macroKcal < cals : totalPct < 100,
  };
}

/** Convert a split between % and grams so toggling units preserves the ratio. */
export function convertSplit({ raw, cals, to }) {
  const out = {};
  for (const k of ['p', 'c', 'f']) {
    const n = Number(raw[k]) || 0;
    out[k] = to === 'grams'
      ? Math.round((cals * n) / 100 / KCAL_PER_G[k])
      : (cals ? Math.round((n * KCAL_PER_G[k] / cals) * 100) : 0);
  }
  return out;
}
