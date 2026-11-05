/**
 * Cardiovascular and energy-expenditure-of-activity functions.
 */

/** Tanaka et al. (2001). Better validated than "220 - age", especially in older adults. */
export const maxHrTanaka = age => 208 - 0.7 * age;

/** Fox (1971) — the familiar "220 - age". Included for comparison; less accurate. */
export const maxHrFox = age => 220 - age;

/** Gulati et al. (2010). Derived specifically in women. */
export const maxHrGulati = age => 206 - 0.88 * age;

export function allMaxHr(age, sex) {
  const out = [
    { key: 'tanaka', name: 'Tanaka (2001)', value: maxHrTanaka(age), preferred: true },
    { key: 'fox',    name: 'Fox (220 − age)', value: maxHrFox(age), preferred: false },
  ];
  if (sex === 'female') {
    out.push({ key: 'gulati', name: 'Gulati (2010, women)', value: maxHrGulati(age), preferred: false });
  }
  return out;
}

/**
 * Karvonen heart-rate reserve method.
 * target = ((maxHR − restingHR) × intensity) + restingHR
 * More individualised than a plain percentage of max because it accounts for
 * resting heart rate, which reflects conditioning.
 */
export const karvonen = (maxHr, restHr, intensity) =>
  (maxHr - restHr) * intensity + restHr;

/**
 * Exercise intensity classes from ACSM's position stand (Garber et al., Med Sci Sports Exerc
 * 2011, Table 5). The bands depend on the method: ACSM gives one set as % of heart-rate
 * reserve and another as % of maximum heart rate, and says the methods "cannot be assumed"
 * equivalent, so each is used only with its own method. ACSM calls the table approximate.
 *
 * v2.38.7 (item 45, batch 4) replaced five unsourced zones (50–100% for both methods, named
 * Recovery … VO₂ max). `effort` is ACSM's perceived-exertion column (rated on a 6–20 scale).
 * `hrr` and `max` are each class's lower bound; a class runs to the next class's lower bound,
 * the first from rest (or zero) and the last to maximum.
 */
export const HR_ZONES = [
  { zone: 1, key: 'very-light', name: 'Very light', hrr: 0,    max: 0,    effort: 'Very light effort (RPE under 9)' },
  { zone: 2, key: 'light',      name: 'Light',      hrr: 0.30, max: 0.57, effort: 'Very light to fairly light (RPE 9–11)' },
  { zone: 3, key: 'moderate',   name: 'Moderate',   hrr: 0.40, max: 0.64, effort: 'Fairly light to somewhat hard (RPE 12–13)' },
  { zone: 4, key: 'vigorous',   name: 'Vigorous',   hrr: 0.60, max: 0.77, effort: 'Somewhat hard to very hard (RPE 14–17)' },
  { zone: 5, key: 'near-max',   name: 'Near-maximal to maximal', hrr: 0.90, max: 0.96, effort: 'Very hard or harder (RPE 18 and up)' },
];

/**
 * ACSM's classes in beats per minute. With a resting heart rate, the heart-rate-reserve bands
 * (Karvonen); without one, the %-of-maximum bands. The first class has no lower figure
 * (`lowBpm` null): it is everything below the second.
 */
export function heartRateZones(maxHr, restingHr = null) {
  const reserve = restingHr != null;
  const at = f => (reserve ? karvonen(maxHr, restingHr, f) : maxHr * f);
  return HR_ZONES.map((z, i) => {
    const lowF = reserve ? z.hrr : z.max;
    const next = HR_ZONES[i + 1];
    return {
      ...z,
      lowPct: lowF,
      highPct: next ? (reserve ? next.hrr : next.max) : 1,
      lowBpm: i === 0 ? null : at(lowF),
      highBpm: next ? at(reserve ? next.hrr : next.max) : maxHr,
      method: reserve ? 'Karvonen (HR reserve)' : '% of max HR',
    };
  });
}

/**
 * Energy cost of activity from METs.
 * kcal/min = MET × 3.5 × kg / 200  (ACSM metabolic equation)
 *
 * TWO LAYERS OF APPROXIMATION (citation check, 2026-08-20):
 *
 * 1. The 3.5 is a convention — 1 MET defined as 3.5 mL O2/kg/min, derived from a
 *    reference adult. Actual resting metabolic rate varies with body mass,
 *    adiposity, age and sex, so this constant is systematically off for anyone
 *    far from that reference, and tends to overestimate for heavier people.
 *
 * 2. The Compendium's own MET values are not all measured. Ainsworth et al. 2011
 *    (Med Sci Sports Exerc 43(8):1575-81, PMID 21681120) report roughly 68% of
 *    values derived from published measurement — meaning about a THIRD are
 *    estimates. The Compendium exists to make self-reported activity comparable
 *    ACROSS STUDIES, not to predict one person's energy expenditure.
 *
 * Present these outputs as rough magnitudes. Do not add decimal places.
 */
export const kcalFromMets = (mets, kg, minutes) => (mets * 3.5 * kg / 200) * minutes;

/**
 * MET values from the Compendium of Physical Activities
 * (Ainsworth BE et al., Med Sci Sports Exerc, 2011).
 */
export const ACTIVITIES = [
  { group: 'Walking & running', items: [
    { name: 'Walking, slow (3 km/h)', mets: 2.0 },
    { name: 'Walking, moderate (5 km/h)', mets: 3.5 },
    { name: 'Walking, brisk (6.5 km/h)', mets: 5.0 },
    { name: 'Hiking, general', mets: 6.0 },
    { name: 'Running, 8 km/h', mets: 8.3 },
    { name: 'Running, 10 km/h', mets: 9.8 },
    { name: 'Running, 12 km/h', mets: 11.8 },
    { name: 'Running, 16 km/h', mets: 14.5 },
  ]},
  { group: 'Gym & strength', items: [
    { name: 'Resistance training, moderate', mets: 3.5 },
    { name: 'Resistance training, vigorous', mets: 6.0 },
    { name: 'Circuit training', mets: 7.5 },
    { name: 'Rowing machine, moderate', mets: 7.0 },
    { name: 'Elliptical, moderate', mets: 5.0 },
    { name: 'Stair climbing', mets: 8.8 },
    { name: 'Kettlebell training', mets: 8.0 },
  ]},
  { group: 'Cycling', items: [
    { name: 'Cycling, leisure (<16 km/h)', mets: 4.0 },
    { name: 'Cycling, moderate (19–22 km/h)', mets: 8.0 },
    { name: 'Cycling, vigorous (25–30 km/h)', mets: 12.0 },
    { name: 'Stationary bike, moderate', mets: 7.0 },
  ]},
  { group: 'Sport & other', items: [
    { name: 'Swimming, moderate laps', mets: 5.8 },
    { name: 'Swimming, vigorous laps', mets: 9.8 },
    { name: 'Basketball, game', mets: 8.0 },
    { name: 'Football (soccer), casual', mets: 7.0 },
    { name: 'Tennis, singles', mets: 8.0 },
    { name: 'Yoga, hatha', mets: 2.5 },
    { name: 'Pilates', mets: 3.0 },
    { name: 'Jump rope, moderate', mets: 11.8 },
    { name: 'Boxing, bag work', mets: 5.5 },
    { name: 'Rock climbing', mets: 8.0 },
  ]},
];

export const findActivity = name => {
  for (const g of ACTIVITIES) {
    const hit = g.items.find(i => i.name === name);
    if (hit) return hit;
  }
  return null;
};

/**
 * VO2 max estimate from the Cooper 12-minute run test (Cooper KH, JAMA 1968;203(3):135-138),
 * distance in metres: the paper's regression (miles = 0.3138 + 0.0278 × VO2) rearranged.
 * Derived in 115 US Air Force men, mostly under 25; no women were tested.
 */
export const vo2maxCooper = metres => (metres - 504.9) / 44.73;

