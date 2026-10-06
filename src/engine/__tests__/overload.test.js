import { describe, it, expect } from 'vitest';
import { progressionResult, loadStep, reduceStep, sessionStats, STATUS_RANK,
         PROGRESSION_CLASSES, OVERLOAD_GOALS, RIR_CHOICES } from '../overload.js';
import { epley } from '../strength.js';
import { LB_TO_KG } from '../units.js';

// Bench press, 185 lb, 3 × 8–12 — the spec's reference case.
const base = (o = {}) => ({
  cls: 'large_compound', goal: 'hypertrophy', unit: 'lb', load: 185, increment: 5,
  repMin: 8, repMax: 12, sets: [12, 12, 12], rir: 2, technique: 'maintained', pain: 'none', previous: null, ...o,
});
const run = o => progressionResult(base(o));

describe('spec test groups', () => {
  it('1 · all sets at the top, 2 RIR → PROGRESS_LOAD to 190', () => {
    const r = run();
    expect(r.status).toBe('PROGRESS_LOAD');
    expect(r.recommendedLoad).toBe(190);
    expect(r.changePercent).toBeCloseTo(2.7027, 3);
    expect(r.next.range).toEqual([8, 10]);
  });
  it('2 · 10/10/9 → PROGRESS_REPS, target 10/10/10', () => {
    const r = run({ sets: [10, 10, 9] });
    expect(r.status).toBe('PROGRESS_REPS');
    expect(r.recommendedLoad).toBe(185);
    expect(r.next.perSet).toEqual([10, 10, 10]);
  });
  it('3 · 12/12/11 → PROGRESS_REPS (merged with 2, as agreed), target 12/12/12', () => {
    const r = run({ sets: [12, 12, 11] });
    expect(r.status).toBe('PROGRESS_REPS');
    expect(r.next.perSet).toEqual([12, 12, 12]);
  });
  it('4 · top of range at failure (RIR 0) → HOLD', () => {
    expect(run({ rir: 0 }).status).toBe('HOLD');
    expect(run({ rir: 0 }).recommendedLoad).toBe(185);
  });
  it('5 · moderate pain → HOLD, mild pain → HOLD', () => {
    expect(run({ pain: 'moderate' }).status).toBe('HOLD');
    expect(run({ pain: 'mild' }).status).toBe('HOLD');
  });
  it('6 · severe pain → STOP_REVIEW with no load computed', () => {
    const r = run({ pain: 'severe' });
    expect(r.status).toBe('STOP_REVIEW');
    expect(r.recommendedLoad).toBeNull();
    expect(r.next).toBeUndefined();
    expect(r.message).not.toMatch(/\d/);            // refusal copy names no numbers
  });
  it('7 · technique degradation → HOLD, even at the top of the range', () => {
    expect(run({ technique: 'significant' }).status).toBe('HOLD');
    expect(run({ technique: 'minor' }).status).toBe('HOLD');
  });
  it('8 · lateral raise 15 lb, 15/15/15, 5 lb steps → PROGRESS_REPS (20 lb is +33%)', () => {
    const r = run({ cls: 'small_isolation', load: 15, repMin: 10, repMax: 15, sets: [15, 15, 15] });
    expect(r.status).toBe('PROGRESS_REPS');
    expect(r.recommendedLoad).toBe(15);
  });
  it('9 · squat 225, 3 × 6–10 at 10s → 235 (230 is under the band)', () => {
    const r = run({ load: 225, repMin: 6, repMax: 10, sets: [10, 10, 10] });
    expect(r.status).toBe('PROGRESS_LOAD');
    expect(r.recommendedLoad).toBe(235);
    expect(r.next.range).toEqual([6, 8]);
  });
  it('10 · 185 lb and its kg equivalent give the same decision', () => {
    const lb = run();
    const kg = run({ unit: 'kg', load: 185 * LB_TO_KG, increment: 5 * LB_TO_KG });
    expect(kg.status).toBe(lb.status);
    expect(kg.recommendedLoad / LB_TO_KG).toBeCloseTo(lb.recommendedLoad, 6);
  });
});

describe('the spec\u2019s worked examples', () => {
  it('RDL 185, 3 × 8–10 at 10s, 1 RIR → 190, next 8–9', () => {
    const r = run({ repMin: 8, repMax: 10, sets: [10, 10, 10], rir: 1 });
    expect(r.recommendedLoad).toBe(190);
    expect(r.next.range).toEqual([8, 9]);
  });
  it('cable curl 40, 3 × 10–15 at 15s, 5 lb stack → stays at 40 (45 is +12.5%)', () => {
    const r = run({ cls: 'isolation', load: 40, repMin: 10, repMax: 15, sets: [15, 15, 15] });
    expect(r.status).toBe('PROGRESS_REPS');
    expect(r.recommendedLoad).toBe(40);
  });
});

describe('equipment and the "reps forever" escape', () => {
  it('two reps past the top on every set allows one step, flagged larger than preferred', () => {
    const r = run({ cls: 'small_isolation', load: 15, repMin: 10, repMax: 15, sets: [17, 17, 17] });
    expect(r.status).toBe('PROGRESS_LOAD');
    expect(r.recommendedLoad).toBe(20);
    expect(r.largerThanPreferred).toBe(true);
    expect(r.next.range).toEqual([10, 12]);
  });
  it('one rep past is not enough', () => {
    expect(run({ cls: 'small_isolation', load: 15, repMin: 10, repMax: 15, sets: [16, 17, 17] }).status).toBe('PROGRESS_REPS');
  });
  it('loadStep picks the smallest in-band step', () => {
    expect(loadStep(225, 2.5, [0.025, 0.05])).toMatchObject({ inBand: true, load: 232.5 });
    expect(loadStep(225, 5, [0.025, 0.05])).toMatchObject({ inBand: true, load: 235 });
    expect(loadStep(15, 5, [0.01, 0.025])).toMatchObject({ overshoot: true });
  });
  it('loadStep takes the largest step below the band when the next would overshoot it', () => {
    // band 4–5%, 100 kg in 3 kg steps: 3% is under, 6% is over → 103 (conservative side)
    expect(loadStep(100, 3, [0.04, 0.05])).toMatchObject({ belowBand: true, load: 103 });
  });
});

describe('reduce, hold and history', () => {
  it('average below the range minimum → REDUCE_LOAD by the 5–10% convention', () => {
    const r = run({ sets: [7, 6, 6] });
    expect(r.status).toBe('REDUCE_LOAD');
    expect(r.recommendedLoad).toBe(175);                 // 10 lb = 5.4%
    expect(-r.changePercent).toBeGreaterThanOrEqual(5);
    expect(-r.changePercent).toBeLessThanOrEqual(10);
  });
  it('below the minimum but improving on last session → keep building reps', () => {
    expect(run({ sets: [7, 7, 6], previous: [6, 6, 6] }).status).toBe('PROGRESS_REPS');
  });
  it('reduceStep: smallest step removing at least 5%, at most 10%', () => {
    expect(reduceStep(185, 5)).toMatchObject({ load: 175, largerThanPreferred: false });
    expect(reduceStep(100, 2.5)).toMatchObject({ load: 95 });
    expect(reduceStep(15, 5)).toMatchObject({ load: 10, largerThanPreferred: true });
    expect(reduceStep(5, 5)).toBeNull();
  });
  it('a drop since last session → HOLD', () => {
    const r = run({ sets: [11, 10, 10], previous: [12, 12, 11] });
    expect(r.status).toBe('HOLD');
    expect(r.cause).toBe('decline');
  });
  it('top of range in two sessions → high confidence, and says so', () => {
    const r = run({ previous: [12, 12, 12] });
    expect(r.confidence).toBe('HIGH');
    expect(r.reasons.join(' ')).toMatch(/two sessions running/);
  });
});

describe('confidence', () => {
  it('RIR and last session → HIGH; one → MODERATE; neither → LOW', () => {
    expect(run({ previous: [12, 12, 12] }).confidence).toBe('HIGH');
    expect(run().confidence).toBe('MODERATE');
    expect(run({ rir: null }).confidence).toBe('LOW');
  });
  it('RIR easier than the goal zone lowers confidence (Halperin 2022)', () => {
    expect(run({ rir: '4+', previous: [12, 12, 12] }).confidence).toBe('MODERATE');
    // General fitness zone runs to 4, so 4+ is within it there
    expect(run({ goal: 'general', repMin: 8, repMax: 12, rir: '4+', previous: [12, 12, 12] }).confidence).toBe('HIGH');
  });
  it('unknown RIR does not block progression', () => {
    expect(run({ rir: null }).status).toBe('PROGRESS_LOAD');
  });
});

describe('descriptive outputs', () => {
  it('volume load and Epley e1RM from the best set, matching the One-Rep Max tool', () => {
    const r = run({ sets: [12, 12, 10] });
    expect(r.performance.volumeLoad).toBe(185 * 34);
    expect(r.e1rm).toBeCloseTo(epley(185, 12), 9);
    expect(sessionStats([12, 12, 10], 185)).toMatchObject({ total: 34, minSet: 10, spread: 2 });
  });
  it('no e1RM above 12 reps', () => {
    const r = run({ cls: 'isolation', load: 40, repMin: 10, repMax: 15, sets: [15, 15, 15] });
    expect(r.e1rm).toBeNull();
    expect(r.e1rmNote).toMatch(/12 reps/);
  });
  it('an edited rep range is reported as the user\u2019s own', () => {
    expect(run().customRange).toBe(true);                       // 8–12 vs hypertrophy 6–15
    expect(run({ repMin: 6, repMax: 15, sets: [15, 15, 15] }).customRange).toBe(false);
  });
});

describe('validation', () => {
  const bad = [
    { load: 0 }, { load: -5 }, { load: NaN }, { load: Infinity }, { increment: 0 },
    { sets: [] }, { sets: [12, -1, 12] }, { sets: [12, 1.5, 12] }, { repMin: 13, repMax: 12 },
    { rir: -1 }, { rir: 5 }, { technique: 'ok' }, { pain: 'some' }, { cls: 'nope' }, { unit: 'stone' },
    { previous: [12, NaN] }, { load: 2000 },
  ];
  for (const o of bad) it(`refuses ${JSON.stringify(o)}`, () => {
    const r = run(o);
    expect(r.status).toBe('INSUFFICIENT_DATA');
    expect(r.recommendedLoad).toBeNull();
    expect(r.problems.length).toBeGreaterThan(0);
  });
  it('is deterministic', () => {
    expect(JSON.stringify(run({ previous: [11, 12, 12] }))).toBe(JSON.stringify(run({ previous: [11, 12, 12] })));
  });
});

// ---- Property sweeps: invariants over many inputs, not spot checks ----
const SWEEP = [];
for (const cls of Object.keys(PROGRESSION_CLASSES))
  for (const [load, increment, unit] of [[185, 5, 'lb'], [15, 5, 'lb'], [40, 2.5, 'lb'], [100, 2.5, 'kg'], [7.5, 1, 'kg']])
    for (const sets of [[6, 6, 5], [8, 8, 8], [10, 10, 9], [12, 12, 12], [14, 14, 14], [16, 17, 15]])
      for (const rir of [...RIR_CHOICES, null])
        for (const previous of [null, [12, 12, 12], [9, 9, 9]])
          SWEEP.push({ cls, load, increment, unit, sets, rir, previous });

describe('properties', () => {
  it('pain never produces PROGRESS_LOAD', () => {
    for (const s of SWEEP) for (const pain of ['mild', 'moderate', 'severe'])
      expect(run({ ...s, pain }).status).not.toBe('PROGRESS_LOAD');
  });
  it('degraded technique never produces PROGRESS_LOAD', () => {
    for (const s of SWEEP) for (const technique of ['minor', 'significant'])
      expect(run({ ...s, technique }).status).not.toBe('PROGRESS_LOAD');
  });
  it('an increase never exceeds the band, except one flagged increment', () => {
    for (const s of SWEEP) {
      const r = run(s);
      if (r.status !== 'PROGRESS_LOAD') continue;
      const inc = (r.recommendedLoad - s.load) / s.load;
      if (r.largerThanPreferred) expect(r.recommendedLoad - s.load).toBeCloseTo(s.increment, 9);
      else expect(inc).toBeLessThanOrEqual(PROGRESSION_CLASSES[s.cls].band[1] + 1e-9);
      // and always lands on the equipment's increments
      expect(Math.abs((r.recommendedLoad - s.load) / s.increment - Math.round((r.recommendedLoad - s.load) / s.increment))).toBeLessThan(1e-9);
    }
  });
  it('unit conversion never changes the decision', () => {
    for (const s of SWEEP.filter(x => x.unit === 'lb')) {
      const lb = run(s);
      const kg = run({ ...s, unit: 'kg', load: s.load * LB_TO_KG, increment: s.increment * LB_TO_KG });
      expect(kg.status).toBe(lb.status);
      if (lb.recommendedLoad != null) expect(kg.recommendedLoad / LB_TO_KG).toBeCloseTo(lb.recommendedLoad, 6);
    }
  });
  it('more reps never makes the decision less favourable (RIR above 0)', () => {
    for (const cls of Object.keys(PROGRESSION_CLASSES))
      for (const previous of [null, [10, 10, 10]])
        for (const rir of [1, 2, 3, '4+', null]) {
          let lastRank = -1;
          for (let reps = 0; reps <= 20; reps++) {
            const r = run({ cls, rir, previous, sets: [reps, reps, reps], load: 100, increment: 2.5, unit: 'kg' });
            const rank = STATUS_RANK[r.status];
            expect(rank, `${cls} rir=${rir} reps=${reps}`).toBeGreaterThanOrEqual(lastRank);
            lastRank = rank;
          }
        }
  });
  it('invalid input never yields a recommendation', () => {
    for (const s of SWEEP) for (const o of [{ load: 0 }, { increment: -1 }, { sets: [1, 2, NaN] }]) {
      const r = run({ ...s, ...o });
      expect(r.status).toBe('INSUFFICIENT_DATA');
      expect(r.recommendedLoad).toBeNull();
    }
  });
  it('every goal\u2019s default range is valid input', () => {
    for (const [goal, g] of Object.entries(OVERLOAD_GOALS))
      expect(run({ goal, repMin: g.range[0], repMax: g.range[1], sets: [g.range[1], g.range[1], g.range[1]] }).status).not.toBe('INSUFFICIENT_DATA');
  });
});

describe('display', () => {
  it('formatLoad keeps fractional plates', async () => {
    const { formatLoad } = await import('../overload.js');
    expect(formatLoad(87.5)).toBe('87.5');
    expect(formatLoad(190)).toBe('190');
    expect(formatLoad(83.91460845)).toBe('83.91');
    expect(progressionResult(base({ unit: 'kg', load: 85, increment: 2.5, sets: [12, 12, 12] })).recommendedLoad).toBe(87.5);
  });
});
