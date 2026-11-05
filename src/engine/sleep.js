/**
 * Sleep cycle timing.
 *
 * Cycle length: about 90 minutes on average, four to six cycles a night, a complete cycle
 * taking roughly 90 to 110 minutes (Patel et al., "Physiology, Sleep Stages", StatPearls,
 * updated 26 January 2024). v2.38.7 dropped the unsourced "70 to 120 minutes" range.
 *
 * The 15 minutes to fall asleep is a starting value, not a measured norm: Ohayon et al. 2004
 * (Sleep 27(7):1255) give no single figure, and the person can change it.
 *
 * Labels: the National Sleep Foundation's three categories for the person's age
 * (Hirshkowitz et al., Sleep Health 2015, Table 2), replacing the unsourced
 * "recommended / short / very short" fixed on the number of cycles.
 */
export const CYCLE_MINUTES = 90;
export const FALL_ASLEEP_MINUTES = 15;

/**
 * NSF Table 2 for the ages the site serves (18 and over). Hours are of sleep, not time in
 * bed. Within `recommended` → 'recommended'; below `notBelow` or above `notAbove` → 'not
 * recommended'; anything else is in, or between, the "may be appropriate" hours.
 */
export const NSF_ADULT = [
  { maxAge: 25,  label: 'Young adult (18–25)', recommended: [7, 9], notBelow: 6, notAbove: 11 },
  { maxAge: 64,  label: 'Adult (26–64)',       recommended: [7, 9], notBelow: 6, notAbove: 10 },
  { maxAge: 200, label: 'Older adult (65+)',   recommended: [7, 8], notBelow: 5, notAbove: 9 },
];

export const NSF_LABEL = {
  recommended: 'Recommended',
  may: 'May be appropriate',
  not: 'Not recommended',
};

/** 'recommended' | 'may' | 'not' for `hours` of sleep at `age` (NSF, adults). */
export function nsfCategory(hours, age = 30) {
  const g = NSF_ADULT.find(x => age <= x.maxAge) ?? NSF_ADULT[1];
  if (hours >= g.recommended[0] && hours <= g.recommended[1]) return 'recommended';
  if (hours < g.notBelow || hours > g.notAbove) return 'not';
  return 'may';
}

const addMinutes = (date, mins) => new Date(date.getTime() + mins * 60000);

/** Bedtimes that let you wake at `wakeAt` on a cycle boundary. */
export function bedtimesForWake(wakeAt, cycles = [6, 5, 4, 3], latency = FALL_ASLEEP_MINUTES, age = 30) {
  return cycles.map(c => ({
    cycles: c,
    sleepMinutes: c * CYCLE_MINUTES,
    bedtime: addMinutes(wakeAt, -(c * CYCLE_MINUTES + latency)),
    quality: nsfCategory((c * CYCLE_MINUTES) / 60, age),
  }));
}

/** Wake times if you go to bed now (or at `bedAt`). */
export function wakeTimesForBed(bedAt, cycles = [3, 4, 5, 6], latency = FALL_ASLEEP_MINUTES, age = 30) {
  return cycles.map(c => ({
    cycles: c,
    sleepMinutes: c * CYCLE_MINUTES,
    wakeAt: addMinutes(bedAt, c * CYCLE_MINUTES + latency),
    quality: nsfCategory((c * CYCLE_MINUTES) / 60, age),
  }));
}

/** Age-based total sleep guidance: NSF "recommended" hours (Hirshkowitz et al. 2015, Table 2). */
export const SLEEP_NEEDS = [
  { maxAge: 2,  label: 'Toddler',      hours: '11–14' },
  { maxAge: 5,  label: 'Preschool',    hours: '10–13' },
  { maxAge: 13, label: 'School age',   hours: '9–11' },
  { maxAge: 17, label: 'Teen',         hours: '8–10' },
  { maxAge: 64, label: 'Adult',        hours: '7–9' },
  { maxAge: 200, label: 'Older adult', hours: '7–8' },
];
export const sleepNeedFor = age => SLEEP_NEEDS.find(s => age <= s.maxAge) ?? SLEEP_NEEDS[4];
