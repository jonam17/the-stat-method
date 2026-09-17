/**
 * Caffeine clearance.
 *
 * Caffeine follows approximately first-order elimination at ordinary dietary
 * doses, so remaining amount halves every half-life:
 *
 *   C(t) = C0 · (1/2)^(t / t½)
 *
 * HOW UNCERTAIN THIS IS
 * The half-life is the whole model, and it is not a constant. Commonly cited
 * population values run about 3–7 hours in healthy non-smoking adults, and the
 * modifiers below move it by more than most people expect. A single-number
 * answer here would imply precision the pharmacology does not support, which is
 * why every function returns a RANGE and the UI is expected to show it.
 *
 * Sources for the modifiers are population-level generalisations, not
 * personalised prediction. Someone on multiple interacting medications, or with
 * impaired liver function, is outside what this can model.
 */

/** Population half-life range for a healthy non-smoking adult, in hours. */
export const HALF_LIFE = { low: 3, typical: 5, high: 7 };

/**
 * Multipliers applied to half-life. Directional and approximate.
 * A multiplier > 1 means caffeine lingers LONGER.
 */
export const HALF_LIFE_MODIFIERS = [
  { key: 'none', label: 'None of these', mult: 1,
    note: '' },
  { key: 'smoker', label: 'I smoke', mult: 0.6,
    note: 'Smoking induces CYP1A2 and roughly halves caffeine half-life.' },
  { key: 'oc', label: 'Oral contraceptives', mult: 1.7,
    note: 'Oral contraceptives inhibit caffeine metabolism, commonly doubling half-life.' },
  { key: 'pregnancy', label: 'Pregnant', mult: 2.5,
    note: 'Half-life rises substantially in pregnancy, particularly in the third trimester. '
        + 'Guidance generally caps intake near 200 mg/day — check with your midwife or doctor.' },
  { key: 'liver', label: 'Liver condition', mult: 2.0,
    note: 'Impaired hepatic clearance extends half-life considerably. This estimate is '
        + 'rough; your clinician\'s advice supersedes it.' },
];

/** Common caffeine sources, mg per typical serving. Approximate — brewing varies widely. */
export const SOURCES = [
  { key: 'filter',    label: 'Filter coffee',      mg: 95,  unit: '240 ml cup' },
  { key: 'espresso',  label: 'Espresso',           mg: 63,  unit: 'single shot' },
  { key: 'instant',   label: 'Instant coffee',     mg: 62,  unit: '240 ml cup' },
  { key: 'coldbrew',  label: 'Cold brew',          mg: 155, unit: '340 ml' },
  { key: 'blacktea',  label: 'Black tea',          mg: 47,  unit: '240 ml cup' },
  { key: 'greentea',  label: 'Green tea',          mg: 28,  unit: '240 ml cup' },
  { key: 'energy',    label: 'Energy drink',       mg: 80,  unit: '250 ml can' },
  { key: 'cola',      label: 'Cola',               mg: 34,  unit: '355 ml can' },
  { key: 'preworkout',label: 'Pre-workout',        mg: 200, unit: 'typical scoop' },
  { key: 'darkchoc',  label: 'Dark chocolate',     mg: 23,  unit: '30 g' },
];

/** Effective half-life in hours after applying a modifier. */
export const effectiveHalfLife = (modifierKey = 'none') => {
  const m = HALF_LIFE_MODIFIERS.find(x => x.key === modifierKey) ?? HALF_LIFE_MODIFIERS[0];
  return {
    low: HALF_LIFE.low * m.mult,
    typical: HALF_LIFE.typical * m.mult,
    high: HALF_LIFE.high * m.mult,
    modifier: m,
  };
};

/** Amount remaining (mg) from a single dose after `hours`, at a given half-life. */
export const remainingAt = (mg, hours, halfLife) =>
  !mg || hours < 0 || !halfLife ? 0 : mg * Math.pow(0.5, hours / halfLife);

/**
 * Total remaining across several doses at a given clock offset.
 * @param doses [{ mg, hoursAgo }]
 */
export const totalRemaining = (doses, hours, halfLife) =>
  doses.reduce((sum, d) => {
    const elapsed = hours + (d.hoursAgo ?? 0);
    return sum + remainingAt(d.mg, elapsed, halfLife);
  }, 0);

/**
 * Hours until the remaining amount falls to `targetMg`.
 * Returns null when already below the target.
 */
export function hoursUntil(currentMg, targetMg, halfLife) {
  if (!currentMg || currentMg <= targetMg) return null;
  if (!targetMg || targetMg <= 0) return Infinity;
  return halfLife * Math.log2(currentMg / targetMg);
}

/**
 * Decay curve for charting.
 * @returns [{ h, low, typical, high }] — mg remaining at each hour, per half-life bound.
 */
export function decayCurve(doses, hl, hours = 24, step = 0.5) {
  const out = [];
  for (let h = 0; h <= hours; h += step) {
    out.push({
      h,
      low: totalRemaining(doses, h, hl.high),      // long half-life = most remaining
      typical: totalRemaining(doses, h, hl.typical),
      high: totalRemaining(doses, h, hl.low),      // short half-life = least remaining
    });
  }
  return out;
}

/**
 * Daily intake guidance.
 *
 * 400 mg/day is the figure health authorities most commonly cite as not
 * generally associated with adverse effects in healthy adults; ~200 mg/day is
 * the usual figure during pregnancy. These are population guidance values, not
 * thresholds where something specific happens to an individual.
 */
export const DAILY_LIMIT = { general: 400, pregnancy: 200 };

export const dailyIntakeCheck = (totalMg, modifierKey = 'none') => {
  const limit = modifierKey === 'pregnancy' ? DAILY_LIMIT.pregnancy : DAILY_LIMIT.general;
  return { total: totalMg, limit, over: totalMg > limit };
};

/**
 * There is NO established amount of residual caffeine that is "safe for sleep".
 * Sensitivity varies severalfold between people, and some are affected by
 * amounts others do not notice. These reference points exist so the tool can
 * show a line on a chart — they are conversation starters, not thresholds.
 */
export const SLEEP_REFERENCE = [
  { mg: 100, label: 'about a cup of coffee still on board' },
  { mg: 50,  label: 'roughly half a cup' },
  { mg: 25,  label: 'a small residual amount' },
];
