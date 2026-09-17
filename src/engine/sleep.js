/**
 * Sleep cycle timing.
 *
 * The 90-minute cycle is an AVERAGE. Real cycles range roughly 70-120 minutes and
 * vary within a night and between people, so these times are a nudge toward waking
 * between cycles rather than a precise schedule. Total sleep and consistency of
 * timing both matter more than hitting an exact cycle boundary.
 */
export const CYCLE_MINUTES = 90;
export const FALL_ASLEEP_MINUTES = 15;

const addMinutes = (date, mins) => new Date(date.getTime() + mins * 60000);

/** Bedtimes that let you wake at `wakeAt` on a cycle boundary. */
export function bedtimesForWake(wakeAt, cycles = [6, 5, 4, 3], latency = FALL_ASLEEP_MINUTES) {
  return cycles.map(c => ({
    cycles: c,
    sleepMinutes: c * CYCLE_MINUTES,
    bedtime: addMinutes(wakeAt, -(c * CYCLE_MINUTES + latency)),
    quality: c >= 5 ? 'recommended' : c === 4 ? 'short' : 'very short',
  }));
}

/** Wake times if you go to bed now (or at `bedAt`). */
export function wakeTimesForBed(bedAt, cycles = [3, 4, 5, 6], latency = FALL_ASLEEP_MINUTES) {
  return cycles.map(c => ({
    cycles: c,
    sleepMinutes: c * CYCLE_MINUTES,
    wakeAt: addMinutes(bedAt, c * CYCLE_MINUTES + latency),
    quality: c >= 5 ? 'recommended' : c === 4 ? 'short' : 'very short',
  }));
}

/** Age-based total sleep guidance (National Sleep Foundation consensus ranges). */
export const SLEEP_NEEDS = [
  { maxAge: 2,  label: 'Toddler',      hours: '11–14' },
  { maxAge: 5,  label: 'Preschool',    hours: '10–13' },
  { maxAge: 13, label: 'School age',   hours: '9–11' },
  { maxAge: 17, label: 'Teen',         hours: '8–10' },
  { maxAge: 64, label: 'Adult',        hours: '7–9' },
  { maxAge: 200, label: 'Older adult', hours: '7–8' },
];
export const sleepNeedFor = age => SLEEP_NEEDS.find(s => age <= s.maxAge) ?? SLEEP_NEEDS[4];
