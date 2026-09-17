/**
 * Strength standards — bodyweight-relative 1RM benchmarks.
 *
 * Values are multiples of bodyweight at each level, drawn from the commonly used
 * ranges in strength coaching literature and large lifting datasets. They are
 * ORIENTATION, not medical or competitive classification: population data varies
 * by source, and no single table is authoritative.
 */
export const LIFTS = [
  { key: 'squat',    name: 'Back squat' },
  { key: 'bench',    name: 'Bench press' },
  { key: 'deadlift', name: 'Deadlift' },
  { key: 'ohp',      name: 'Overhead press' },
  { key: 'row',      name: 'Barbell row' },
];

export const LEVELS = ['Untrained', 'Novice', 'Intermediate', 'Advanced', 'Elite'];

/** Multiples of bodyweight, by sex and lift. */
const STANDARDS = {
  male: {
    squat:    [0.75, 1.25, 1.75, 2.50, 3.00],
    bench:    [0.50, 0.90, 1.30, 1.85, 2.20],
    deadlift: [1.00, 1.50, 2.15, 2.85, 3.40],
    ohp:      [0.35, 0.55, 0.80, 1.10, 1.35],
    row:      [0.45, 0.70, 1.00, 1.40, 1.70],
  },
  female: {
    squat:    [0.55, 0.90, 1.30, 1.85, 2.30],
    bench:    [0.30, 0.55, 0.80, 1.15, 1.45],
    deadlift: [0.60, 1.10, 1.60, 2.15, 2.60],
    ohp:      [0.20, 0.35, 0.55, 0.75, 0.95],
    row:      [0.30, 0.50, 0.70, 1.00, 1.25],
  },
};

/**
 * Age adjustment. Strength peaks roughly in the late twenties and declines
 * gradually thereafter; standards are scaled so older lifters are compared fairly.
 */
export function ageFactor(age) {
  if (age <= 30) return 1;
  if (age >= 80) return 0.60;
  return 1 - (age - 30) * 0.008;
}

export function standardsFor(lift, sex, bodyweightKg, age = 30) {
  const rows = STANDARDS[sex]?.[lift] ?? STANDARDS.male[lift];
  const f = ageFactor(age);
  return rows.map((mult, i) => ({
    level: LEVELS[i],
    multiple: mult * f,
    weightKg: mult * f * bodyweightKg,
  }));
}

/** Where a lift sits: returns { level, nextLevel, progress (0-1), multiple }. */
export function rateLift({ lift, sex, bodyweightKg, age = 30, oneRmKg }) {
  const rows = standardsFor(lift, sex, bodyweightKg, age);
  const multiple = bodyweightKg ? oneRmKg / bodyweightKg : 0;
  let idx = -1;
  for (let i = 0; i < rows.length; i++) if (oneRmKg >= rows[i].weightKg) idx = i;
  const current = idx >= 0 ? rows[idx] : null;
  const next = rows[idx + 1] ?? null;
  const lo = current?.weightKg ?? 0;
  const hi = next?.weightKg ?? rows[rows.length - 1].weightKg;
  const progress = hi > lo ? Math.min(1, Math.max(0, (oneRmKg - lo) / (hi - lo))) : 1;
  return {
    rows, multiple,
    level: current?.level ?? 'Below untrained',
    nextLevel: next?.level ?? null,
    toNextKg: next ? Math.max(0, next.weightKg - oneRmKg) : 0,
    progress,
  };
}
