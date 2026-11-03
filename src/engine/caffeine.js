/**
 * Caffeine clearance.
 *
 * Caffeine follows approximately first-order elimination at ordinary dietary
 * doses, so remaining amount halves every half-life:
 *
 *   C(t) = C0 · (1/2)^(t / t½)
 *
 * HOW UNCERTAIN THIS IS
 * The half-life is the whole model, and it is not a constant. Every figure below is from a named
 * source (v2.38.5, item 45 batch 2); the page's sources line lists them:
 *   EFSA NDA Panel, Scientific Opinion on the safety of caffeine. EFSA Journal 2015;13(5):4102 —
 *     half-life, smoking, oral contraceptives, pregnancy, liver, and the 400 / 200 mg figures.
 *   ACOG Committee Opinion No. 462, 2010 — 200 mg in pregnancy; dark chocolate (its Table 1, USDA).
 *   FDA, "Spilling the Beans" (content current as of 28 Aug 2024) — 400 mg; how widely drinks vary.
 *   Mayo Clinic, "Caffeine content for coffee, tea, soda and more" (6 Feb 2025) — drink amounts.
 * Every function returns a RANGE and the UI is expected to show it. Someone on interacting
 * medication is outside what this can model.
 */

/** EFSA §4.1.1: "a plasma half-life of about four hours with range of about two to eight hours". */
export const HALF_LIFE = { low: 2, typical: 4, high: 8 };

/**
 * What changes clearance. A multiplier > 1 means caffeine lingers LONGER. `range` replaces the
 * half-life outright; `refuse` means no estimate is given (refuse, don't warn).
 */
export const HALF_LIFE_MODIFIERS = [
  { key: 'none', label: 'None of these', mult: 1,
    note: '' },
  // EFSA §4.1.1 (Tantcheva-Poor 1999, 786 people): clearance 1.22x, 1.47x, 1.66x and 1.72x for
  // 1–5, 6–10, 11–20 and >20 cigarettes a day — half-life about 0.6 to 0.8 of a non-smoker's.
  { key: 'smoker', label: 'I smoke', mult: 0.7,
    note: 'Smokers clear caffeine faster: about 1.2 to 1.7 times as fast, depending on how much '
        + 'they smoke. This uses 0.7 times the usual half-life, the middle of that spread.' },
  // Same study: oral contraceptives reduced clearance to 0.72x — half-life about 1.4x.
  { key: 'oc', label: 'Oral contraceptives', mult: 1.4,
    note: 'Oral contraceptives slow caffeine clearance. In a study of 786 people, it ran at about '
        + 'seven-tenths of the usual rate, so half-life is about 1.4 times longer.' },
  // EFSA §4.1.2: 6–16 h in pregnancy (Knutti 1982), three to four times longer by the end. One
  // multiplier misstates early and late pregnancy alike, so the measured range is used directly;
  // 11 h is the middle of that range, not a typical value.
  { key: 'pregnancy', label: 'Pregnant', range: { low: 6, typical: 11, high: 16 },
    note: 'In pregnancy, caffeine half-life has been measured at 6 to 16 hours, longest near the '
        + 'end. The middle line is the middle of that range, not a typical value. EFSA and the '
        + 'American College of Obstetricians and Gynecologists put intake below 200 mg a day as '
        + 'not a concern. Check with your midwife or doctor.' },
  // EFSA §4.1.1: "severe liver disorders… have been reported to cause a significant inhibition of
  // CYP1A2 activity" — no figure. The old 2.0x had no source.
  { key: 'liver', label: 'Liver condition', refuse: true,
    note: 'Liver disease can slow caffeine clearance a great deal, but by an amount that varies '
        + 'too much for this calculator to estimate. Ask your doctor what applies to you.' },
];

/**
 * Caffeine per serving, mg. Mayo Clinic's chart (servings of 8 fl oz / 237 ml, espresso 1 fl oz /
 * 30 ml), except dark chocolate: ACOG Committee Opinion 462, Table 1 — 30 mg per 1.45 oz (41 g),
 * from USDA data. Cold brew (155 mg) and pre-workout (200 mg) were removed in v2.38.5: no source.
 * Real servings vary widely — the FDA puts a 12 fl oz brewed coffee at 113 to 247 mg.
 */
export const SOURCES = [
  { key: 'filter',    label: 'Brewed coffee',      mg: 96, unit: '237 ml cup' },
  { key: 'espresso',  label: 'Espresso',           mg: 63, unit: '30 ml shot' },
  { key: 'instant',   label: 'Instant coffee',     mg: 62, unit: '237 ml cup' },
  { key: 'blacktea',  label: 'Black tea',          mg: 48, unit: '237 ml cup' },
  { key: 'greentea',  label: 'Green tea',          mg: 29, unit: '237 ml cup' },
  { key: 'energy',    label: 'Energy drink',       mg: 79, unit: '237 ml' },
  { key: 'cola',      label: 'Cola',               mg: 33, unit: '237 ml' },
  { key: 'darkchoc',  label: 'Dark chocolate',     mg: 30, unit: '41 g' },
];

/**
 * Effective half-life in hours after applying a modifier. A refused modifier returns
 * { refused: true } and no numbers.
 */
export const effectiveHalfLife = (modifierKey = 'none') => {
  const m = HALF_LIFE_MODIFIERS.find(x => x.key === modifierKey) ?? HALF_LIFE_MODIFIERS[0];
  if (m.refuse) return { refused: true, modifier: m };
  if (m.range) return { ...m.range, modifier: m };
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
 * 400 mg/day: the FDA cites it as "an amount not generally associated with negative effects" for
 * most adults; EFSA found habitual intake up to 400 mg/day raised no safety concerns for
 * non-pregnant adults. 200 mg/day in pregnancy: EFSA (no safety concerns for the fetus) and ACOG
 * 462 ("less than 200 mg per day does not appear to be a major contributing factor in miscarriage
 * or preterm birth"). Population guidance values, not thresholds for an individual.
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
