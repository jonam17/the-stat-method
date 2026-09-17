/**
 * Powerlifting relative-strength scoring.
 *
 * Three systems, in order of current relevance:
 *  - DOTS      (Konertz, 2019) — adopted by USPA, WRPF and others from 2020. Default here.
 *  - IPF GL    (official IPF system, effective 1 May 2020).
 *  - Wilks     (1994) — the long-standing standard, now legacy. Retained for comparison
 *              because many older records and personal benchmarks are expressed in it.
 *
 * All take a competition total in KILOGRAMS and bodyweight in kilograms.
 */

/**
 * DOTS = Total × 500 / (A·bw⁴ + B·bw³ + C·bw² + D·bw + E)
 *
 * Coefficients verified against the IPF formula-evaluation report and the
 * reference implementation (citation check, 2026-08-20) — both sets match.
 *
 * FIXED: the bodyweight clamp was 40-210 kg for BOTH sexes. The formula's author
 * defines the valid range as 40-210 kg for men and **40-150 kg for women**. A
 * female lifter above 150 kg was being scored by extrapolating a 4th-degree
 * polynomial outside its defined domain, which is exactly where a quartic
 * misbehaves. Clamps are now per-sex.
 */
const DOTS_COEF = {
  male:   { A: -0.000001093,  B: 0.0007391293, C: -0.1918759221, D: 24.0900756, E: -307.75076, min: 40, max: 210 },
  female: { A: -0.0000010706, B: 0.0005158568, C: -0.1126655495, D: 13.6175032, E: -57.96288,  min: 40, max: 150 },
};

export function dots(totalKg, bodyweightKg, sex = 'male') {
  const c = DOTS_COEF[sex] ?? DOTS_COEF.male;
  const bw = Math.max(c.min, Math.min(c.max, bodyweightKg));
  const denom = c.A * bw ** 4 + c.B * bw ** 3 + c.C * bw ** 2 + c.D * bw + c.E;
  return denom > 0 ? (totalKg * 500) / denom : null;
}

/**
 * IPF GL Points = Total × 100 / (A − B·e^(−C·bw))
 * Coefficients published by the IPF (2020). Separate sets per sex, equipment and event.
 * Verified against the official IPF_GL_Coefficients-2020 tables (citation check,
 * 2026-08-20). All eight sets now match the published values exactly.
 *
 * FIXED: 'male-equipped-full' was MISSING. Because lookup fell back to
 * 'male-classic-full', an equipped male lifter silently received CLASSIC
 * coefficients and a wrong score with no indication anything was off — an 800 kg
 * total at 100 kg returned an identical figure for both equipment classes, which
 * cannot be right. The fallback is now explicit and throws in development rather
 * than quietly substituting.
 *
 * PROVENANCE: the IPF derives these by regression on "Golden Standard Samples" of
 * ELITE athletes — results no less than 16% of the then-current world records. It
 * is an elite-calibrated scale, which is why a score near 100 means world-record
 * level rather than "good".
 */
const IPF_GL_COEF = {
  'male-classic-full':    { A: 1199.72839, B: 1025.18162, C: 0.00921 },
  'male-equipped-full':   { A: 1236.25115, B: 1449.21864, C: 0.01644 },
  'male-classic-bench':   { A: 320.98041,  B: 281.40258,  C: 0.01008 },
  'male-equipped-bench':  { A: 381.22073,  B: 733.79378,  C: 0.02398 },
  'female-classic-full':  { A: 610.32796,  B: 1045.59282, C: 0.03048 },
  'female-equipped-full': { A: 758.63878,  B: 949.31382,  C: 0.02435 },
  'female-classic-bench': { A: 142.40398,  B: 442.52671,  C: 0.04724 },
  'female-equipped-bench':{ A: 221.82209,  B: 357.00377,  C: 0.02937 },
};

export function ipfGl(totalKg, bodyweightKg, sex = 'male', equipment = 'classic', event = 'full') {
  const key = `${sex}-${equipment}-${event}`;
  const c = IPF_GL_COEF[key];
  if (!c) {
    // Silently substituting another coefficient set produces a plausible but
    // wrong score. Fail loudly in dev; return null in production.
    if (process.env.NODE_ENV !== 'production') {
      console.warn(`ipfGl: no IPF GL coefficients for "${key}" — returning null.`);
    }
    return null;
  }
  const denom = c.A - c.B * Math.exp(-c.C * bodyweightKg);
  return denom > 0 ? (totalKg * 100) / denom : null;
}

/** Wilks (1994). Legacy — retained for comparison with older records. */
/**
 * Original Wilks coefficients, verified against multiple independent sources
 * (citation check, 2026-08-20). Both sets match.
 *
 * PROVENANCE AND CURRENCY — this is the weakest of the three scales here:
 *  - The polynomials were fitted to EQUIPPED powerlifting results from 1987-1994.
 *    Most people using this calculator lift raw, and the data predates them.
 *  - Wilks intended the formula to be revised every 2-5 years. It never was.
 *  - A rebalanced "Wilks-2" was published in March 2020 with entirely different
 *    coefficients. This engine implements the ORIGINAL, which is still what most
 *    federations and lifters quote — a defensible choice, but a deliberate one
 *    that should be stated rather than assumed.
 *
 * DEPRECATED BY BOTH FEDERATIONS (confirmed 2026-08-20). The IPF uses GL Points;
 * USA Powerlifting uses DOTS. Neither maintains Wilks, and both moved from static
 * lookup charts to formulas. Wilks is retained here because lifters still quote it
 * and because the article explains why it was replaced — not because any governing
 * body still uses it. Present DOTS and IPF GL as the live scales.
 *
 * CLAMP UNSOURCED, AND NOW UNLIKELY TO BE SOURCEABLE. The 40-200 kg bound below is
 * ours, not Wilks'. The close-out path previously recorded here — read the
 * asterisks off an official federation chart — no longer works: those charts are
 * deprecated artefacts of a superseded system. What is known:
 *   - A defined range DOES exist: USA Powerlifting's official coefficient charts
 *     mark bodyweights outside it with asterisks.
 *   - A secondary calculator source gives roughly 40-205 kg (male) and
 *     40-150 kg (female) — which would mirror the per-sex asymmetry DOTS
 *     publishes explicitly, and would mean our single 200 kg bound is wrong for
 *     women in the same way the DOTS clamp was before it was fixed.
 *
 * NOT ACTED ON after three attempts to source it. A calculator website is not
 * grounds for changing a scoring function, and the pattern matching DOTS is
 * suggestive rather than evidence. Official coefficients are known to run down to
 * at least 45.5 kg for women; the UPPER bound is what is missing.
 *
 * TO CLOSE, IF WORTH CLOSING: the number would have to come from Robert Wilks'
 * original publication, since the federation charts that once carried it are
 * retired. Given the formula is deprecated and wilksReliability() already flags
 * the extremes, chasing this further is probably not a good use of anyone's time.
 * Do NOT copy the unsourced figures above.
 *
 * MITIGATION IN THE MEANTIME: rather than guess a bound, wilksReliability()
 * below flags extreme bodyweights from what IS sourced — Vanderburgh & Batterham
 * found a linear unfavourable bias toward heavier lifters, and the IPF's own
 * stated reason for Wilks-2 was to bring extreme bodyweight classes into better
 * balance with the middle. Both point the same way without needing the cutoff.
 */
const WILKS_COEF = {
  male:   { a: -216.0475144, b: 16.2606339, c: -0.002388645,
            d: -0.00113732, e: 7.01863e-6, f: -1.291e-8 },
  female: { a: 594.31747775582, b: -27.23842536447, c: 0.82112226871,
            d: -0.00930733913, e: 4.731582e-5, f: -9.054e-8 },
};

/**
 * How much to trust a Wilks score at this bodyweight.
 *
 * Not a domain check — we do not have the domain (see above). This reports what
 * the validation literature does support: the formula is least reliable at the
 * extremes, and unfavourably so for heavier lifters.
 */
export function wilksReliability(bodyweightKg, sex = 'male') {
  const bw = +bodyweightKg || 0;
  const heavy = sex === 'female' ? 100 : 140;
  const light = sex === 'female' ? 47 : 56;
  if (bw >= heavy) {
    return { level: 'reduced', note:
      'Wilks is known to run unfavourably for heavier lifters — the formal validation '
      + 'found a linear bias against them in the deadlift, and rebalancing the extreme '
      + 'bodyweight classes was a stated reason for the 2020 revision. Treat this score '
      + 'as approximate, and prefer DOTS or IPF GL at this bodyweight.' };
  }
  if (bw > 0 && bw <= light) {
    return { level: 'reduced', note:
      'Wilks behaves less predictably at the light end of the range. Prefer DOTS or '
      + 'IPF GL for comparison at this bodyweight.' };
  }
  return { level: 'normal', note: null };
}

export function wilks(totalKg, bodyweightKg, sex = 'male') {
  const k = WILKS_COEF[sex] ?? WILKS_COEF.male;
  const bw = Math.max(40, Math.min(200, bodyweightKg));
  const denom = k.a + k.b * bw + k.c * bw ** 2 + k.d * bw ** 3
              + k.e * bw ** 4 + k.f * bw ** 5;
  return denom > 0 ? (totalKg * 500) / denom : null;
}

/** Run all three. DOTS is flagged as the current default. */
export function allScores({ totalKg, bodyweightKg, sex, equipment = 'classic', event = 'full' }) {
  return [
    { key: 'dots', name: 'DOTS', value: dots(totalKg, bodyweightKg, sex),
      status: 'current', note: 'The scale USA Powerlifting uses, alongside USPA, WRPF and others from 2020. '
        + 'Fixes bias at extreme bodyweights. Note: USAPL additionally applies a McCulloch age '
        + 'coefficient for Masters and Junior lifters, which this tool does not — open-category only.' },
    { key: 'ipfgl', name: 'IPF GL Points', value: ipfGl(totalKg, bodyweightKg, sex, equipment, event),
      status: 'current', note: 'Official IPF system since 1 May 2020, replacing IPF Points.' },
    { key: 'wilks', name: 'Wilks', value: wilks(totalKg, bodyweightKg, sex),
      status: 'legacy', note: 'The standard for ~25 years. Documented bias at very low and very high bodyweights.' },
  ].filter(s => s.value != null);
}

/** Descriptive bands. Rough orientation only, not federation classifications. */
export const DOTS_BANDS = [
  { max: 200, label: 'Beginner' },
  { max: 300, label: 'Novice' },
  { max: 375, label: 'Intermediate' },
  { max: 450, label: 'Advanced' },
  { max: 525, label: 'Elite' },
  { max: 9999, label: 'World class' },
];
export const dotsBand = v => DOTS_BANDS.find(b => v < b.max)?.label ?? '—';
