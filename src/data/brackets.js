/**
 * Adult age brackets in a nutrient file, and the summaries built from them.
 * Pure functions with no Astro dependency, shared by the page template, the
 * chart and library.test.js — so all three read the brackets the same way.
 *
 * A file uses 19–50, 51–70, >70 — or, where the fact sheet splits 19–50 with
 * different values (magnesium), 19–30, 31–50, 51–70, >70.
 */
export const BRACKETS = [['19–50', '51–70', '>70'], ['19–30', '31–50', '51–70', '>70']];
export const YOUNG = ['19–50', '19–30', '31–50'];     // the brackets that carry pregnancy and breastfeeding
const SPAN = { '19–50': [19, 50], '19–30': [19, 30], '31–50': [31, 50], '51–70': [51, 70], '>70': [71, null] };

export const groupLabel = g => ({
  '19–50': '19–50 years', '19–30': '19–30 years', '31–50': '31–50 years', '51–70': '51–70 years', '>70': 'Over 70',
}[g]);

/** The UL row that applies to an intake bracket: the same group, or 19–50 for a split one. */
export const matchingRow = (rows, g) =>
  rows.find(r => r.group === g) ?? (YOUNG.includes(g) ? rows.find(r => r.group === '19–50') : undefined);

/**
 * Consecutive brackets with identical values for men and women, merged — so a
 * summary never shows one bracket's value under a label that covers another.
 * Vitamin D gives "Adults 19–70" and "Over 70"; iron gives "Adults 19–50" (with
 * men and women shown separately) and "Adults 51 and over".
 */
export function bands(rows) {
  const out = [];
  for (const r of rows) {
    const last = out.at(-1);
    if (last && last.male === r.male && last.female === r.female) last.to = SPAN[r.group][1];
    else out.push({ from: SPAN[r.group][0], to: SPAN[r.group][1], male: r.male, female: r.female });
  }
  return out.map(b => ({
    ...b,
    label: b.to != null ? `Adults ${b.from}–${b.to}` : b.from === 71 ? 'Over 70' : `Adults ${b.from} and over`,
  }));
}

/** Lowest and highest adult values for men and women across all brackets. */
export function adultRange(rows) {
  const v = rows.flatMap(r => [r.male, r.female]);
  return [Math.min(...v), Math.max(...v)];
}

/**
 * The single daily amount a food's contribution is measured against: the
 * highest value for men or women aged 19–50, so no food looks like more of a
 * day's worth than it is for anyone in that range.
 */
export const youngAdultDaily = rows =>
  Math.max(...rows.filter(r => YOUNG.includes(r.group)).flatMap(r => [r.male, r.female]));
