/**
 * Strength estimation. Pure functions.
 *
 * All 1RM equations are estimates. Reynolds et al. 2006 (J Strength Cond Res 20(3):584-92)
 * found a 5RM predicted 1RM best, with accuracy worse from 10RM and 20RM, and that "no more than
 * 10 repetitions should be used in linear equations"; per their Table 5, Epley's and Brzycki's
 * own guidance is under 10 reps. We return every
 * formula so the spread is visible rather than hiding disagreement behind one number.
 *
 * VALIDATION CAVEATS (citation check, 2026-08-20). LeSuer et al. 1997
 * (J Strength Cond Res 11(4):211-13) tested seven of these equations and found:
 *   - ALL of them significantly UNDERESTIMATED the deadlift 1RM. The bias is
 *     exercise-specific, and this calculator is exercise-agnostic, so a deadlift
 *     estimate from any formula here is likely to read low.
 *   - The validation sample was 67 UNTRAINED college students. Correlations were
 *     high (r > 0.95), which can mask meaningful absolute error, and trained
 *     lifters were not represented.
 *
 * PROVENANCE (citation check, 2026-08-20). Most of these were never derived
 * statistically. Epley (1985) began as a poundage chart in a training manual,
 * Wathen (1994) as a load-assignment table in a coaching textbook, Lombardi
 * (1989) in an introductory weight-training book. Brzycki (1993) appeared in a
 * practitioner article that does not state its underlying data. Cross-validation
 * studies note that most of these equations give no evidence of the population
 * used or how they were derived; the formulas were extrapolated from the charts
 * afterwards.
 *
 * They agree with each other and correlate well against measured maxima, so
 * returning the spread is the right presentation. But the precision is borrowed
 * — do not add decimal places to these outputs.
 *
 * All five are now cited. O'Connor B, Simmons J, O'Shea P. Weight Training Today.
 * St. Paul, MN: West Publishing, 1989:201-204 — located from academic reference
 * lists and the book's ISBN (9780314689511), not from recall.
 *
 * One further note from the cross-validation literature: Lombardi's equation was
 * described by its own author as based on curve fitting and guesswork, and
 * Brzycki's was extrapolated from a published graph rather than from subject
 * data. Treat the agreement between these formulas as convention converging, not
 * as independent methods reaching the same answer.
 */

/** Epley (1985). */
export const epley = (w, r) => (r === 1 ? w : w * (1 + r / 30));

/**
 * Brzycki (1993). Reads slightly low at high reps.
 *
 * SINGULARITY (citation check, 2026-08-20). The denominator (37 - r) reaches
 * zero at 37 reps and goes negative beyond it, so the formula returned Infinity
 * at 37 and NEGATIVE 1RM estimates above. It is a linear model with no validity
 * anywhere near that range — Brzycki's own guidance is under 10 reps — so it now
 * returns null rather than a number that cannot be right.
 *
 * PROVENANCE: Brzycki published the equation in a practitioner article (JOPERD
 * 64(1):88-90) without stating the data it was fitted to. It is a widely used
 * convention rather than a derived result, and later comparisons disagree about
 * its direction of bias.
 */
export const BRZYCKI_MAX_REPS = 20;
export const brzycki = (w, r) =>
  r === 1 ? w : r >= BRZYCKI_MAX_REPS ? null : w * (36 / (37 - r));

/** Lombardi (1989). Power-curve fit. */
export const lombardi = (w, r) => w * Math.pow(r, 0.10);

/** Wathan (1994). Exponential fit. Not among the equations Reynolds et al. 2006 cross-validated. */
export const wathan = (w, r) => (100 * w) / (48.8 + 53.2 * Math.exp(-0.075 * r));

/** O'Conner (1989). Simple linear approximation. */
export const oconner = (w, r) => w * (1 + 0.025 * r);

// Any formula may return null where it has no valid domain; callers must filter.
export const ONE_RM_FORMULAS = [
  { key: 'epley',    name: 'Epley',    fn: epley },
  { key: 'brzycki',  name: 'Brzycki',  fn: brzycki },
  { key: 'lombardi', name: 'Lombardi', fn: lombardi },
  { key: 'wathan',   name: 'Wathan',   fn: wathan },
  { key: 'oconner',  name: "O'Conner", fn: oconner },
];

/** Above this, the result is flagged (Reynolds et al. 2006; Epley's and Brzycki's guidance). */
export const ONE_RM_MAX_REPS = 10;

/**
 * Run every formula. `mean` is the headline figure (v2.38.8: it was Wathan's, which no source
 * read supports as the best). Above ONE_RM_MAX_REPS the caller should surface `lowConfidence`.
 */
export function allOneRepMax(weight, reps) {
  if (!(weight > 0) || !(reps >= 1)) return null;
  const results = ONE_RM_FORMULAS.map(f => ({
    key: f.key, name: f.name, value: f.fn(weight, reps),
  }));
  // A formula returns null outside its valid domain (see brzycki). Excluding
  // those keeps mean/min/max finite instead of letting one null poison all three.
  const values = results.map(r => r.value).filter(v => Number.isFinite(v));
  if (!values.length) return null;
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  return {
    results, mean,
    min: Math.min(...values),
    max: Math.max(...values),
    spread: Math.max(...values) - Math.min(...values),
    lowConfidence: reps > ONE_RM_MAX_REPS,
    omitted: results.filter(r => !Number.isFinite(r.value)).map(r => r.name),
  };
}

/**
 * RPE / RIR to %1RM: Helms, Cronin, Storey & Zourdos, Strength Cond J 2016;38(4):42-49, Table 2,
 * whole-number RPE rows (10, 9, 8, 7 = 0–3 reps in reserve, RPE = 10 − RIR per Zourdos et al.
 * 2016). Built from trained lifters' back squats; only 1 rep at 100% and 90% and 8 reps at 70%
 * were measured, the rest estimated by the authors, who say it "should not be viewed as an
 * absolute conversion tool".
 *
 * v2.38.8 (item 45, batch 5) replaced a 12-rep × 0–4 RIR table credited to Helms' book, which
 * matched none of the sources read, and the 12-row "training percentages" table (to 65% for 15
 * reps), which had no source. Rows are reps 1–8; columns are 0–3 reps in reserve.
 */
const RPE_TABLE = {
  1: [100, 95, 91, 87],
  2: [95, 91, 87, 85],
  3: [91, 87, 85, 83],
  4: [87, 85, 83, 81],
  5: [85, 83, 81, 79],
  6: [83, 81, 79, 76],
  7: [81, 79, 76, 73],
  8: [79, 76, 73, 70],
};
export const RPE_MAX_REPS = 8;
export const RPE_MAX_RIR = 3;

/** Training percentages: the chart's RPE 10 (0 RIR) row — a set to failure at each rep count. */
export const RM_PERCENTAGES = Object.entries(RPE_TABLE).map(([reps, row]) => ({ pct: row[0], reps: +reps }));
export const percentageTable = oneRM =>
  RM_PERCENTAGES.map(({ pct, reps }) => ({ pct, reps, weight: (oneRM * pct) / 100 }));

/** Percent of 1RM for a given reps + reps-in-reserve. Returns null if out of range. */
export function percentFromRIR(reps, rir) {
  const row = RPE_TABLE[reps];
  if (!row || rir < 0 || rir > RPE_MAX_RIR) return null;
  return row[rir];
}

/** RIR to RPE: RPE = 10 - RIR. */
export const rirToRpe = rir => 10 - rir;
export const rpeToRir = rpe => 10 - rpe;

/** Load for a target reps/RIR given a known 1RM. */
export function loadForRepsRIR(oneRM, reps, rir) {
  const pct = percentFromRIR(reps, rir);
  return pct == null ? null : (oneRM * pct) / 100;
}

/**
 * Plate loading. Returns per-side plate counts for a target total weight.
 * `plates` must be sorted descending.
 */
export function plateLoad(target, barWeight, plates) {
  if (target < barWeight) return { possible: false, perSide: [], achieved: barWeight };
  let perSideWeight = (target - barWeight) / 2;
  const perSide = [];
  for (const p of plates) {
    const n = Math.floor(perSideWeight / p + 1e-9);
    if (n > 0) { perSide.push({ plate: p, count: n }); perSideWeight -= n * p; }
  }
  const achieved = target - perSideWeight * 2;
  return { possible: true, perSide, achieved, remainder: perSideWeight * 2 };
}
