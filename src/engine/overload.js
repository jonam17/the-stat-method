/**
 * Progressive Overload Calculator — the whole decision, in one pure function.
 *
 * Question it answers: "What is the most appropriate way to make this exercise
 * harder next time, based on what you actually did?" — not "how much weight
 * should I add?". Progress through repetitions is progress (Plotkin et al.,
 * 2022: progressing load or progressing reps both improved strength and size in
 * trained lifters over eight weeks).
 *
 * EVIDENCE vs IMPLEMENTATION RULES. Two kinds of number live here, and the page
 * labels them differently:
 *   - Evidence: progressive resistance training improves strength and size, and
 *     failure is not required (ACSM, 2026); ACSM (2009) suggests a 2–10% load
 *     increase, lower for small-muscle exercises, when a lifter exceeds the target
 *     by 1–2 reps in two consecutive sessions; RIR is a useful but imperfect self-
 *     estimate, least accurate far from failure (Halperin et al., 2022).
 *   - Implementation rules (labelled as such, not validated equations): the
 *     percentage band for each progression class, "every set at the top of the
 *     range" as the trigger, the smallest-step choice, the 5–10% reduction, the
 *     confidence grades, and the two-reps-over escape for coarse equipment.
 *
 * Decision order, and why it is an order: safety > technique > performance >
 * RIR > recent history > progression band > equipment. Nothing later can
 * override something earlier — a pain flag can never become PROGRESS_LOAD, and
 * the tests sweep that property rather than spot-check it.
 *
 * Nothing here is stored. Today's session and an optional last session are
 * passed in, used, and discarded (see the privacy policy).
 *
 * Deterministic: same input, same output. No randomness, no external calls.
 */
import { epley } from './strength.js';

export const OVERLOAD_ALGORITHM_VERSION = '1.0.0';

/**
 * Progression classes. Bands are IMPLEMENTATION RULES within ACSM (2009)'s
 * 2–10% guidance, at its conservative end and lower for small-muscle exercises,
 * as that guidance specifies.
 */
export const PROGRESSION_CLASSES = {
  large_compound: {
    name: 'Large compound', band: [0.025, 0.05],
    examples: ['Back squat', 'Deadlift', 'Romanian deadlift', 'Bench press', 'Overhead press', 'Hip thrust', 'Leg press'],
  },
  moderate_compound: {
    name: 'Moderate compound', band: [0.025, 0.05],
    examples: ['Dumbbell bench press', 'Incline press', 'Lat pulldown', 'Cable row', 'Chest-supported row', 'Split squat', 'Lunge'],
  },
  isolation: {
    name: 'Isolation', band: [0.02, 0.05],
    examples: ['Leg extension', 'Leg curl', 'Biceps curl', 'Triceps pushdown', 'Calf raise', 'Cable fly'],
  },
  small_isolation: {
    name: 'Small isolation', band: [0.01, 0.025],
    examples: ['Lateral raise', 'Rear-delt fly', 'External rotation', 'Small cable movements'],
  },
};

/**
 * Goal defaults: a starting rep range and the RIR zone used to judge whether a
 * set was easier than intended. The visitor may edit the range; an edited range
 * is reported as their own programming, not a Stat Method recommendation.
 */
export const OVERLOAD_GOALS = {
  hypertrophy: { name: 'Hypertrophy', range: [6, 15], rirZone: [1, 3] },
  strength:    { name: 'Strength',    range: [3, 8],  rirZone: [1, 3] },
  general:     { name: 'General fitness', range: [8, 15], rirZone: [1, 4] },
};

export const RIR_CHOICES = [0, 1, 2, 3, '4+'];
export const TECHNIQUE = ['maintained', 'minor', 'significant'];
export const PAIN = ['none', 'mild', 'moderate', 'severe'];

/** Ranks for the monotonicity property: higher is a more favourable decision. */
export const STATUS_RANK = { REDUCE_LOAD: 0, HOLD: 1, PROGRESS_REPS: 2, PROGRESS_LOAD: 3 };

/** Input limits. Out-of-range input is refused as INSUFFICIENT_DATA, never clamped. */
export const OVERLOAD_LIMITS = {
  kg: { load: [0.5, 600], increment: [0.25, 50] },
  lb: { load: [1, 1400], increment: [0.5, 100] },
  reps: [0, 100], sets: [1, 10], repRange: [1, 50],
};

const EPS = 1e-9;
const round2 = n => Math.round(n * 100) / 100;
const pct1 = r => `${(Math.round(r * 1000) / 10).toFixed(1)}%`;
/** Loads keep their fraction — 87.5 kg must not display as 88, which no plate set can make. */
export const formatLoad = n => {
  const v = round2(n);
  return Number.isInteger(v) ? String(v) : v.toFixed(2).replace(/0$/, '');
};
const sum = a => a.reduce((s, x) => s + x, 0);
const isCount = n => Number.isInteger(n) && n >= OVERLOAD_LIMITS.reps[0] && n <= OVERLOAD_LIMITS.reps[1];

/** Performance summary for one session. Exported for tests. */
export function sessionStats(reps, load) {
  const total = sum(reps);
  return {
    total,
    average: total / reps.length,
    minSet: Math.min(...reps),
    maxSet: Math.max(...reps),
    spread: Math.max(...reps) - Math.min(...reps),
    volumeLoad: load * total,     // descriptive only — not a measure of stimulus
  };
}

/**
 * The load step. IMPLEMENTATION RULE: the smallest available load (current +
 * k × increment) whose increase lands inside the class band. If even one step
 * overshoots the band, there is no in-band load (`overshoot`). If steps jump from
 * below the band to above it, take the largest step below — smaller is the
 * conservative side. Exported for tests.
 */
export function loadStep(load, increment, [bandMin, bandMax]) {
  let below = null;
  for (let k = 1; k <= 1000; k++) {
    const next = load + k * increment;
    const inc = (next - load) / load;
    if (inc > bandMax + EPS) {
      if (k === 1) return { inBand: false, overshoot: true, load: next, increase: inc };
      return below ? { inBand: false, belowBand: true, ...below } : null;
    }
    if (inc >= bandMin - EPS) return { inBand: true, load: next, increase: inc };
    below = { load: next, increase: inc };
  }
  return null;
}

/**
 * The reduction step. IMPLEMENTATION CONVENTION, not an injury-prevention
 * formula: the smallest available step down that removes at least 5% of the load,
 * provided it removes no more than 10%. If no step lands in 5–10%, the largest
 * step within 10%; if even one step removes more than 10%, that one step,
 * flagged. Exported for tests.
 */
export function reduceStep(load, increment) {
  const steps = [];
  for (let k = 1; load - k * increment > EPS && k <= 1000; k++) {
    const next = load - k * increment;
    steps.push({ load: next, decrease: (load - next) / load });
    if ((load - next) / load > 0.10 + EPS) break;
  }
  if (!steps.length) return null;
  const inBand = steps.find(s => s.decrease >= 0.05 - EPS && s.decrease <= 0.10 + EPS);
  if (inBand) return { ...inBand, largerThanPreferred: false };
  const within = steps.filter(s => s.decrease <= 0.10 + EPS);
  if (within.length) return { ...within[within.length - 1], largerThanPreferred: false };
  return { ...steps[0], largerThanPreferred: true };
}

/** Lower half of the range — the rep target after a load increase. */
const resetRange = (lo, hi) => [lo, lo + Math.floor((hi - lo) / 2)];

/** Per-set rep targets when holding the load: bring every set up to the best set,
 *  or one more rep each when the sets are already even. */
function repTargets(reps, cap) {
  const best = Math.max(...reps);
  const even = reps.every(r => r === best);
  return reps.map(() => Math.min(even ? best + 1 : best, cap));
}

function validate(i) {
  const problems = [];
  const unit = i.unit === 'kg' || i.unit === 'lb' ? i.unit : null;
  if (!unit) problems.push('Choose kilograms or pounds.');
  if (!PROGRESSION_CLASSES[i.cls]) problems.push('Choose an exercise type.');
  if (!OVERLOAD_GOALS[i.goal]) problems.push('Choose a training goal.');
  const lim = OVERLOAD_LIMITS[unit || 'kg'];
  if (!Number.isFinite(i.load) || i.load < lim.load[0] || i.load > lim.load[1]) problems.push('Enter the load you used.');
  if (!Number.isFinite(i.increment) || i.increment < lim.increment[0] || i.increment > lim.increment[1]) problems.push('Enter the smallest weight jump your equipment allows.');
  const [rMin, rMax] = OVERLOAD_LIMITS.repRange;
  if (!Number.isInteger(i.repMin) || !Number.isInteger(i.repMax) || i.repMin < rMin || i.repMax > rMax || i.repMin > i.repMax)
    problems.push('Enter a target rep range, lowest first.');
  const [sMin, sMax] = OVERLOAD_LIMITS.sets;
  if (!Array.isArray(i.sets) || i.sets.length < sMin || i.sets.length > sMax || !i.sets.every(isCount))
    problems.push('Enter the reps you completed in each set.');
  if (i.previous != null && (!Array.isArray(i.previous) || i.previous.length < sMin || i.previous.length > sMax || !i.previous.every(isCount)))
    problems.push('Last session’s reps are incomplete — fill them in or switch them off.');
  if (!(i.rir === null || RIR_CHOICES.includes(i.rir))) problems.push('Choose your reps in reserve, or Unknown.');
  if (!TECHNIQUE.includes(i.technique)) problems.push('Choose how your technique held up.');
  if (!PAIN.includes(i.pain)) problems.push('Choose whether the exercise caused pain.');
  return problems;
}

/**
 * The calculator. Input:
 *   { cls, goal, unit: 'kg'|'lb', load, increment, repMin, repMax,
 *     sets: [reps…], rir: 0|1|2|3|'4+'|null, technique, pain,
 *     previous: [reps…] | null   // last session at the same load, optional }
 *
 * Returns one primary status — PROGRESS_LOAD, PROGRESS_REPS, HOLD, REDUCE_LOAD,
 * STOP_REVIEW or INSUFFICIENT_DATA — with the next session's goal, reasons, a
 * confidence grade, and the worked calculation ("show the work").
 */
export function progressionResult(input) {
  const i = { previous: null, ...input };
  const problems = validate(i);
  if (problems.length) return { status: 'INSUFFICIENT_DATA', problems, recommendedLoad: null };

  const klass = PROGRESSION_CLASSES[i.cls];
  const goal = OVERLOAD_GOALS[i.goal];
  const u = i.unit;
  const now = sessionStats(i.sets, i.load);
  const prev = i.previous ? sessionStats(i.previous, i.load) : null;
  const custom = i.repMin !== goal.range[0] || i.repMax !== goal.range[1];
  const base = {
    algorithmVersion: OVERLOAD_ALGORITHM_VERSION,
    unit: u, currentLoad: i.load, className: klass.name, band: klass.band,
    repRange: [i.repMin, i.repMax], customRange: custom,
    performance: now,
    e1rm: now.maxSet >= 1 && now.maxSet <= 12 ? epley(i.load, now.maxSet) : null,
    e1rmNote: now.maxSet > 12 ? 'Not estimated above 12 reps, where one-rep-max formulas diverge sharply.'
      : now.maxSet < 1 ? 'Not estimated — no completed reps.' : null,
  };
  const work = [
    ['Current load', `${formatLoad(i.load)} ${u}`],
    ['Reps completed', `${i.sets.join(' / ')} (total ${now.total}, average ${round2(now.average)})`],
    ['Target range', `${i.repMin}–${i.repMax} reps${custom ? ' (your own range)' : ''}`],
  ];
  const out = (status, extra) => ({ ...base, work, ...extra, status });

  // 1. Safety gate — pain. Severe pain refuses: no load of any kind is computed.
  if (i.pain === 'severe') {
    return {
      status: 'STOP_REVIEW', recommendedLoad: null, confidence: null,
      message: 'Do not progress this exercise. Severe pain during an exercise is a reason to stop it, not to adjust the weight. Consider having it assessed by a doctor or physiotherapist before training it again.',
    };
  }
  if (i.pain === 'mild' || i.pain === 'moderate') {
    return out('HOLD', {
      recommendedLoad: i.load, confidence: null, cause: 'pain',
      headline: 'Keep the load where it is.',
      reasons: [`You reported ${i.pain} pain, so the weight does not go up. This tool cannot tell why it hurt.`,
        'If the pain persists or gets worse, stop the exercise and have it assessed.'],
      next: { load: i.load, perSet: i.sets.slice() },
    });
  }
  // 2. Technique gate.
  if (i.technique !== 'maintained') {
    return out('HOLD', {
      recommendedLoad: i.load, confidence: null, cause: 'technique',
      headline: 'Keep the load until your technique holds.',
      reasons: [`Your technique ${i.technique === 'significant' ? 'broke down significantly' : 'slipped'}, so the extra reps do not count toward a heavier weight yet.`,
        'Repeat the load with the range of motion and control you intend, then reassess.'],
      next: { load: i.load, perSet: i.sets.slice() },
    });
  }

  // Confidence: RIR and last session are the two pieces of supporting evidence.
  const rirKnown = i.rir !== null;
  const rirNum = i.rir === '4+' ? 4 : i.rir;
  const easierThanZone = rirKnown && rirNum > goal.rirZone[1];
  const evidence = (rirKnown && !easierThanZone ? 1 : 0) + (prev ? 1 : 0);
  const confidence = evidence === 2 ? 'HIGH' : evidence === 1 ? 'MODERATE' : 'LOW';
  const confNotes = [];
  if (!rirKnown) confNotes.push('Reps in reserve were not given, so this leans on your reps and technique.');
  if (easierThanZone) confNotes.push(`Reps-in-reserve estimates are least accurate far from failure, and ${i.rir} is easier than the ${goal.rirZone[0]}–${goal.rirZone[1]} this goal aims for.`);
  if (!prev) confNotes.push('Adding last session’s reps would let this check for a trend.');
  work.push(['Reps in reserve', rirKnown ? `${i.rir}` : 'Not given']);
  if (prev) work.push(['Last session', `${i.previous.join(' / ')} (total ${prev.total})`]);

  const allTop = i.sets.every(r => r >= i.repMax);
  const belowMin = now.average < i.repMin;
  const improving = prev && now.total > prev.total;
  const declining = prev && now.total < prev.total;
  const targets = repTargets(i.sets, i.repMax);

  // 3. Below the range: the load is too heavy for this range — unless it is improving.
  if (belowMin) {
    if (improving) {
      return out('PROGRESS_REPS', {
        recommendedLoad: i.load, confidence, confNotes,
        headline: 'Same load — keep building reps.',
        reasons: ['Your average is below the bottom of the range, but it rose since last session.',
          'Keep the load while the reps keep climbing toward the range.'],
        next: { load: i.load, perSet: targets },
      });
    }
    const step = reduceStep(i.load, i.increment);
    if (!step) {
      return out('HOLD', {
        recommendedLoad: i.load, confidence, confNotes, cause: 'nolighter',
        headline: 'Keep the load — there is no lighter option.',
        reasons: ['Your average is below the bottom of the range, but no lighter load is available with this increment.',
          'Consider a lighter variation of the exercise, or a lower rep range.'],
        next: { load: i.load, perSet: i.sets.slice() },
      });
    }
    work.push(['Below range', `average ${round2(now.average)} < ${i.repMin}`],
      ['Reduction', `${formatLoad(i.load)} − ${formatLoad(i.load - step.load)} = ${formatLoad(step.load)} ${u} (${pct1(step.decrease)})`]);
    return out('REDUCE_LOAD', {
      recommendedLoad: step.load, changePercent: -step.decrease * 100, confidence, confNotes,
      largerThanPreferred: step.largerThanPreferred,
      headline: 'Conservative load reduction.',
      reasons: [`Your average of ${round2(now.average)} reps is below the bottom of your ${i.repMin}–${i.repMax} range, so the load is heavier than this range calls for.`,
        step.largerThanPreferred
          ? `The smallest step down is ${pct1(step.decrease)} — more than the usual 5–10%, because of your equipment.`
          : 'A 5–10% reduction is a convention, not a validated formula; your own program may say otherwise.'],
      next: { load: step.load, range: [i.repMin, i.repMax] },
    });
  }

  // 4. Recent history: a drop since last session means repeat, not push.
  if (declining) {
    return out('HOLD', {
      recommendedLoad: i.load, confidence, confNotes, cause: 'decline',
      headline: 'Repeat the load.',
      reasons: [`Your total reps fell from ${prev.total} to ${now.total} since last session.`,
        'One lower session is not a trend; repeat the load before deciding anything.'],
      next: { load: i.load, perSet: i.previous.slice(0, i.sets.length).concat(targets.slice(i.previous.length)) },
    });
  }

  // 5. Not every set at the top: same load, more reps.
  if (!allTop) {
    const near = now.average >= i.repMax - 1;
    const nearTwice = near && prev && prev.average >= i.repMax - 1;
    return out('PROGRESS_REPS', {
      recommendedLoad: i.load, confidence, confNotes,
      headline: near ? 'Almost there — same load, finish the range.' : 'Same load — add reps.',
      reasons: [near
        ? `You are within a rep of the top of your range on average${nearTwice ? ', for the second session running' : ''}; every set reaching ${i.repMax} earns the heavier weight.`
        : `Not every set reached ${i.repMax}. Building reps at this load is progress in its own right.`,
      ...(i.rir === 0 ? ['You reached failure. That is fine for adding reps; it does not need to happen every set.'] : [])],
      next: { load: i.load, perSet: targets },
    });
  }

  // 6. Every set at the top. RIR 0 means repeat, not jump.
  if (i.rir === 0) {
    return out('HOLD', {
      recommendedLoad: i.load, confidence, confNotes, cause: 'failure',
      headline: 'Repeat the load before increasing it.',
      reasons: ['You hit the top of the range, but at failure. Repeat this load and aim to reach the top with a rep or more in reserve.'],
      next: { load: i.load, perSet: i.sets.map(() => i.repMax) },
    });
  }

  // 7. Progression band and equipment.
  const step = loadStep(i.load, i.increment, klass.band);
  const twoSessions = prev && i.previous.every(r => r >= i.repMax);
  const sharedReasons = [
    `Every set reached the top of your ${i.repMin}–${i.repMax} range${twoSessions ? ', in two sessions running' : ''}.`,
    'Technique held and no pain was reported.',
    ...(rirKnown && !easierThanZone ? [`Reps in reserve (${i.rir}) were within the target zone.`] : []),
  ];
  work.push(['Progression class', `${klass.name} — ${pct1(klass.band[0])} to ${pct1(klass.band[1])} per step`]);

  if (step && (step.inBand || step.belowBand)) {
    work.push(['Available increment', `${formatLoad(i.increment)} ${u}`],
      ['Next practical load', `${formatLoad(i.load)} + ${formatLoad(step.load - i.load)} = ${formatLoad(step.load)} ${u}`],
      ['Actual increase', `${pct1(step.increase)}${step.belowBand ? ' (below the band — the next step would overshoot it)' : ''}`]);
    return out('PROGRESS_LOAD', {
      recommendedLoad: step.load, changePercent: step.increase * 100, confidence, confNotes,
      headline: 'Ready to increase the load.',
      reasons: [...sharedReasons, `A ${pct1(step.increase)} increase is ${step.belowBand ? 'just under' : 'within'} the ${pct1(klass.band[0])}–${pct1(klass.band[1])} band for this exercise type.`],
      next: { load: step.load, range: resetRange(i.repMin, i.repMax) },
    });
  }

  // Overshoot: even one increment is larger than the band.
  const jump = { load: i.load + i.increment, increase: i.increment / i.load };
  work.push(['Available increment', `${formatLoad(i.increment)} ${u}`],
    ['Next available load', `${formatLoad(jump.load)} ${u} = ${pct1(jump.increase)} heavier`],
    ['Preferred maximum', `${pct1(klass.band[1])} for this exercise type`]);
  const outgrown = i.sets.every(r => r >= i.repMax + 2);
  if (outgrown) {
    return out('PROGRESS_LOAD', {
      recommendedLoad: jump.load, changePercent: jump.increase * 100, confidence, confNotes,
      largerThanPreferred: true,
      headline: 'Increase the load — a larger jump than preferred.',
      reasons: [...sharedReasons.slice(1),
        `Every set went at least two reps past the top of the range, so the reps have outgrown it.`,
        `The next available weight is ${pct1(jump.increase)} heavier — more than the ${pct1(klass.band[1])} preferred for this exercise type — so the rep target resets to the bottom of the range.`],
      next: { load: jump.load, range: resetRange(i.repMin, i.repMax) },
    });
  }
  return out('PROGRESS_REPS', {
    recommendedLoad: i.load, confidence, confNotes,
    headline: 'Same load — the next weight is too big a jump.',
    reasons: [...sharedReasons,
      `The next available weight is ${pct1(jump.increase)} heavier, more than the ${pct1(klass.band[1])} preferred for this exercise type.`,
      `Keep adding reps (load goes up once every set reaches ${i.repMax + 2}), or use smaller increments if you have them.`],
    next: { load: i.load, perSet: i.sets.map(r => Math.min(r + 1, i.repMax + 2)) },
  });
}
