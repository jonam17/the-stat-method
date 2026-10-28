/**
 * Strength levels — bodyweight-relative 1RM cut-offs from one published source:
 *
 *   Santos Junior ERT, de Salles BF, Dias I, Ribeiro AS, Simão R, Willardson JM.
 *   Classification and determination model of resistance training status.
 *   Strength Cond J 2021;43(5):77-86 — text p. 4 and Table 1, p. 6.
 *
 * What the source is: a PROPOSED model, not measured population data. The authors built the
 * cut-offs from Willoughby (1993) — bench ≥120% and squat ≥150% of body mass for advanced
 * men — and reasoning about the deadlift and about sex differences. They state the cut-offs
 * are "for most resistance training practitioners, and not for athletes", and name older and
 * heavier lifters as limitations. No age adjustment is given, so none is made here.
 *
 * Strength is ONE of the model's five parameters (with current training time, detraining,
 * previous experience and technique; at least three items, the three time items mandatory).
 * A lift on its own therefore gives a strength level, not a training status — the
 * calculator says so.
 *
 * The paper also scores the pull-up (reps / added weight); it is not offered here, and the
 * overhead press and row, which the paper does not cover, were removed in v2.37.0 along with
 * the unsourced Untrained → Elite table and age factor they replaced.
 *
 * Cut-offs are percentages of body mass. From the text: beginner below t0; intermediate
 * t0 to just under t1 (e.g. 80–119.9%); advanced t1 to t2 inclusive (e.g. 120–150%); highly
 * advanced MORE THAN t2.
 */
export const LIFTS = [
  { key: 'squat',    name: 'Back squat' },
  { key: 'bench',    name: 'Bench press' },
  { key: 'deadlift', name: 'Deadlift' },
];

export const LEVELS = ['Beginner', 'Intermediate', 'Advanced', 'Highly advanced'];

/** [intermediate from, advanced from, highly advanced above] — % of body mass. */
export const STRENGTH_CUTOFFS = {
  male:   { bench: [60, 100, 120], squat: [80, 120, 150], deadlift: [100, 150, 180] },
  female: { bench: [40, 60, 80],   squat: [60, 100, 130], deadlift: [80, 120, 160] },
};

/** The four levels for one lift, with the bodyweight multiple and load each starts at. */
export function standardsFor(lift, sex, bodyweightKg) {
  const [i, a, h] = STRENGTH_CUTOFFS[sex]?.[lift] ?? STRENGTH_CUTOFFS.male[lift];
  return [
    { level: LEVELS[0], fromPct: 0, strict: false },
    { level: LEVELS[1], fromPct: i, strict: false },
    { level: LEVELS[2], fromPct: a, strict: false },
    { level: LEVELS[3], fromPct: h, strict: true },     // "more than"
  ].map(r => ({ ...r, multiple: r.fromPct / 100, weightKg: (r.fromPct / 100) * bodyweightKg }));
}

/**
 * Where a lift sits. The percentage is compared to one decimal place, as the paper writes
 * its ranges (e.g. 119.9%). Returns { level, nextLevel, nextKg, nextStrict, toNextKg,
 * progress (0–1), multiple, pct, rows }.
 */
export function rateLift({ lift, sex, bodyweightKg, oneRmKg }) {
  const rows = standardsFor(lift, sex, bodyweightKg);
  const multiple = bodyweightKg ? oneRmKg / bodyweightKg : 0;
  const pct = Math.round(multiple * 1000) / 10;
  let idx = 0;
  rows.forEach((r, k) => { if (k > 0 && (r.strict ? pct > r.fromPct : pct >= r.fromPct)) idx = k; });
  const current = rows[idx];
  const next = rows[idx + 1] ?? null;
  const lo = current.weightKg;
  const hi = next ? next.weightKg : current.weightKg;
  return {
    rows, multiple, pct,
    level: current.level,
    nextLevel: next?.level ?? null,
    nextKg: next?.weightKg ?? null,
    nextStrict: next?.strict ?? false,
    toNextKg: next ? Math.max(0, next.weightKg - oneRmKg) : 0,
    progress: next ? (hi > lo ? Math.min(1, Math.max(0, (oneRmKg - lo) / (hi - lo))) : 0) : 1,
  };
}
