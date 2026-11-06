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
 * Energy cost of activity from METs: kcal = MET × kg × hours.
 *
 * The 2024 Adult Compendium (Herrmann et al., J Sport Health Sci 2024;13(1):6-12) defines 1 MET
 * as 3.5 mL O2/kg/min, "or approximately 1.0 kcal/kg/h". v2.38.7 and earlier used the ACSM
 * metabolic equation (MET × 3.5 × kg / 200 per minute, about 5% higher), cited to the ACSM
 * Guidelines without an edition; v2.38.8 (item 45, batch 5) switched to the Compendium's own
 * conversion.
 *
 * TWO LAYERS OF APPROXIMATION:
 *
 * 1. The 3.5 is a standard resting rate from a reference adult. The Compendium "can serve as a
 *    starting point for prescribing individual activities but does not reflect precise
 *    individual EE values", because resting rate differs with age, sex, height, weight and
 *    body composition.
 *
 * 2. Not every MET value is measured: of the 2024 list's 1,114 activities, 912 have measured
 *    and 202 estimated values. The Compendium exists to make self-reported activity
 *    comparable across studies, not to predict one person's energy expenditure.
 *
 * Present these outputs as rough magnitudes. Do not add decimal places.
 */
export const kcalFromMets = (mets, kg, minutes) => mets * kg * (minutes / 60);

/**
 * MET values from the 2024 Adult Compendium of Physical Activities (full list, pacompendium.com,
 * read 2026-11-05). `code` is the Compendium activity code. The list covers adults aged 19–59; a
 * separate Older Adult Compendium is not used here. Speeds are the Compendium's mph bands
 * converted to km/h. v2.38.8 updated eleven values from the 2011 Compendium and removed
 * "Kettlebell training" (8.0), which has no code of its own.
 */
export const ACTIVITIES = [
  { group: 'Walking & running', items: [
    { name: 'Walking, slow (under 3.2 km/h)', mets: 2.3, code: '17151' },
    { name: 'Walking, moderate (4.5–5.5 km/h)', mets: 3.8, code: '17190' },
    { name: 'Walking, brisk (6.4–7.0 km/h)', mets: 5.5, code: '17220' },
    { name: 'Hiking, cross country', mets: 6.0, code: '17080' },
    { name: 'Running, 8.0–8.4 km/h', mets: 8.5, code: '12030' },
    { name: 'Running, 9.7–10.1 km/h', mets: 9.3, code: '12050' },
    { name: 'Running, 12.1 km/h', mets: 11.8, code: '12080' },
    { name: 'Running, 16.1 km/h', mets: 14.8, code: '12120' },
  ]},
  { group: 'Gym & strength', items: [
    { name: 'Resistance training, moderate', mets: 3.5, code: '02054' },
    { name: 'Resistance training, vigorous', mets: 6.0, code: '02050' },
    { name: 'Circuit training, vigorous', mets: 7.5, code: '02040' },
    { name: 'Rowing machine, moderate', mets: 5.0, code: '02071' },
    { name: 'Elliptical, moderate', mets: 5.0, code: '02048' },
    { name: 'Stair machine', mets: 9.3, code: '02065' },
  ]},
  { group: 'Cycling', items: [
    { name: 'Cycling, leisure (under 16 km/h)', mets: 4.0, code: '01010' },
    { name: 'Cycling, moderate (19–22 km/h)', mets: 8.0, code: '01030' },
    { name: 'Cycling, vigorous (26–31 km/h)', mets: 12.0, code: '01050' },
    { name: 'Stationary bike, general', mets: 6.8, code: '01200' },
  ]},
  { group: 'Sport & other', items: [
    { name: 'Swimming, moderate laps', mets: 5.8, code: '18240' },
    { name: 'Swimming, vigorous laps', mets: 9.8, code: '18230' },
    { name: 'Basketball, game', mets: 8.0, code: '15040' },
    { name: 'Football (soccer), casual', mets: 7.0, code: '15610' },
    { name: 'Tennis, singles', mets: 8.0, code: '15690' },
    { name: 'Yoga, hatha', mets: 2.3, code: '02150' },
    { name: 'Pilates', mets: 2.8, code: '02105' },
    { name: 'Jump rope, moderate', mets: 11.8, code: '15551' },
    { name: 'Boxing, bag work', mets: 5.8, code: '15110' },
    { name: 'Rock climbing', mets: 8.0, code: '15533' },
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

