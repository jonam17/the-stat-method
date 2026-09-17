import { describe, it, expect } from 'vitest';
import {
  epley, brzycki, lombardi, wathan, oconner, allOneRepMax,
  percentageTable, percentFromRIR, rirToRpe, loadForRepsRIR, plateLoad,
} from '../strength.js';
import {
  maxHrTanaka, maxHrFox, allMaxHr, karvonen, heartRateZones,
  kcalFromMets, findActivity, vo2maxCooper, ACTIVITIES,
} from '../cardio.js';
import {
  simulate, daysToTarget, intakeForTargetByDate,
  forbesFatFraction, adaptiveFactor,
} from '../planner.js';
import { bodyFatSkinfold3, bodyFatCategory, ffmiBand } from '../body.js';

describe('one-rep max', () => {
  it('returns the lifted weight when reps = 1', () => {
    expect(epley(100, 1)).toBe(100);
    expect(brzycki(100, 1)).toBe(100);
  });

  it('every formula increases the estimate as reps rise', () => {
    for (const fn of [epley, brzycki, lombardi, wathan, oconner]) {
      expect(fn(100, 5)).toBeGreaterThan(fn(100, 2));
    }
  });

  it('Epley matches its published form', () => {
    // 100 × (1 + 5/30) = 116.67
    expect(epley(100, 5)).toBeCloseTo(116.67, 1);
  });

  it('Brzycki matches its published form', () => {
    // 100 × 36/(37−5) = 112.5
    expect(brzycki(100, 5)).toBeCloseTo(112.5, 1);
  });

  it('formulas agree within a reasonable band at moderate reps', () => {
    const r = allOneRepMax(100, 5);
    expect(r.spread).toBeLessThan(15);          // ~kg of disagreement
    expect(r.results).toHaveLength(5);
  });

  it('flags low confidence above 12 reps', () => {
    expect(allOneRepMax(100, 5).lowConfidence).toBe(false);
    expect(allOneRepMax(100, 15).lowConfidence).toBe(true);
  });

  it('rejects invalid input', () => {
    expect(allOneRepMax(0, 5)).toBeNull();
    expect(allOneRepMax(100, 0)).toBeNull();
  });

  it('percentage table starts at 100% and decreases', () => {
    const t = percentageTable(200);
    expect(t[0].weight).toBe(200);
    expect(t[t.length - 1].weight).toBeLessThan(200);
  });
});

describe('RPE / RIR conversion', () => {
  it('maps RIR to RPE as 10 − RIR', () => {
    expect(rirToRpe(0)).toBe(10);
    expect(rirToRpe(3)).toBe(7);
  });

  it('a set taken to failure at 1 rep is 100% of 1RM', () => {
    expect(percentFromRIR(1, 0)).toBe(100);
  });

  it('leaving reps in reserve lowers the required load', () => {
    expect(percentFromRIR(5, 0)).toBeGreaterThan(percentFromRIR(5, 3));
  });

  it('returns null outside the table', () => {
    expect(percentFromRIR(50, 0)).toBeNull();
    expect(percentFromRIR(5, 9)).toBeNull();
  });

  it('computes a working load from a known 1RM', () => {
    const load = loadForRepsRIR(200, 5, 2);
    expect(load).toBeGreaterThan(140);
    expect(load).toBeLessThan(180);
  });
});

describe('plate loading', () => {
  const PLATES = [25, 20, 15, 10, 5, 2.5, 1.25];

  it('loads an achievable weight exactly', () => {
    const r = plateLoad(100, 20, PLATES);      // 40 kg per side
    expect(r.possible).toBe(true);
    expect(r.achieved).toBeCloseTo(100, 5);
  });

  it('reports the shortfall when a weight cannot be made exactly', () => {
    const r = plateLoad(101, 20, PLATES);
    expect(r.remainder).toBeGreaterThan(0);
  });

  it('handles a target below bar weight', () => {
    expect(plateLoad(15, 20, PLATES).possible).toBe(false);
  });
});

describe('heart rate', () => {
  it('Tanaka reads higher than Fox for older adults', () => {
    expect(maxHrTanaka(60)).toBeGreaterThan(maxHrFox(60));
  });

  it('Tanaka matches its published form', () => {
    expect(maxHrTanaka(30)).toBeCloseTo(187, 0);   // 208 − 0.7×30
  });

  it('marks Tanaka as preferred and adds Gulati for women', () => {
    const m = allMaxHr(30, 'male');
    expect(m.find(f => f.key === 'tanaka').preferred).toBe(true);
    expect(allMaxHr(30, 'female').some(f => f.key === 'gulati')).toBe(true);
  });

  it('Karvonen sits between resting and max heart rate', () => {
    const t = karvonen(190, 60, 0.7);
    expect(t).toBeGreaterThan(60);
    expect(t).toBeLessThan(190);
    expect(t).toBeCloseTo(151, 0);               // (190−60)×0.7+60
  });

  it('produces five ascending zones', () => {
    const z = heartRateZones(190, 60);
    expect(z).toHaveLength(5);
    for (let i = 1; i < z.length; i++) {
      expect(z[i].lowBpm).toBeGreaterThan(z[i - 1].lowBpm);
    }
    expect(z[4].highBpm).toBeCloseTo(190, 0);
  });

  it('falls back to percent-of-max without a resting heart rate', () => {
    const z = heartRateZones(190);
    expect(z[0].method).toContain('max');
    expect(z[0].lowBpm).toBeCloseTo(95, 0);
  });
});

describe('activity energy cost', () => {
  it('matches the ACSM MET equation', () => {
    // 8 METs, 80 kg, 30 min => 8 × 3.5 × 80 / 200 × 30 = 336
    expect(kcalFromMets(8, 80, 30)).toBeCloseTo(336, 0);
  });

  it('scales with bodyweight and duration', () => {
    expect(kcalFromMets(8, 100, 30)).toBeGreaterThan(kcalFromMets(8, 80, 30));
    expect(kcalFromMets(8, 80, 60)).toBeCloseTo(kcalFromMets(8, 80, 30) * 2, 5);
  });

  it('finds activities by name', () => {
    expect(findActivity('Hiking, general').mets).toBe(6.0);
    expect(findActivity('nonexistent')).toBeNull();
  });

  it('every activity has a positive MET value', () => {
    for (const g of ACTIVITIES) {
      for (const i of g.items) expect(i.mets).toBeGreaterThan(0);
    }
  });

  it('Cooper test gives a plausible VO2 max', () => {
    const v = vo2maxCooper(2400);
    expect(v).toBeGreaterThan(30);
    expect(v).toBeLessThan(60);
  });
});

describe('skinfold body fat', () => {
  it('returns a plausible percentage for typical male measurements', () => {
    const bf = bodyFatSkinfold3({ sex: 'male', age: 30, s1: 10, s2: 20, s3: 15 });
    expect(bf).toBeGreaterThan(5);
    expect(bf).toBeLessThan(30);
  });

  it('reads higher for women at the same skinfold sum', () => {
    const m = bodyFatSkinfold3({ sex: 'male', age: 30, s1: 15, s2: 15, s3: 15 });
    const f = bodyFatSkinfold3({ sex: 'female', age: 30, s1: 15, s2: 15, s3: 15 });
    expect(f).toBeGreaterThan(m);
  });

  it('rises with larger skinfolds', () => {
    const lo = bodyFatSkinfold3({ sex: 'male', age: 30, s1: 5, s2: 5, s3: 5 });
    const hi = bodyFatSkinfold3({ sex: 'male', age: 30, s1: 30, s2: 30, s3: 30 });
    expect(hi).toBeGreaterThan(lo);
  });

  it('returns null for empty measurements', () => {
    expect(bodyFatSkinfold3({ sex: 'male', age: 30, s1: 0, s2: 0, s3: 0 })).toBeNull();
  });

  it('categorises body fat and FFMI', () => {
    expect(bodyFatCategory(10, 'male')).toBe('Athletic');
    expect(bodyFatCategory(10, 'female')).toBe('Below essential');
    expect(ffmiBand(19)).toBe('Average');
    expect(ffmiBand(27)).toContain('rare');
  });
});

describe('dynamic weight-change model', () => {
  const base = {
    kg: 90, cm: 178, age: 35, sex: 'male',
    bodyFatPct: 25, activityFactor: 1.55,
  };

  it('loses weight in a deficit and gains in a surplus', () => {
    const cut = simulate({ ...base, intakeKcal: 2000, days: 120 });
    const bulk = simulate({ ...base, intakeKcal: 3600, days: 120 });
    expect(cut.finalKg).toBeLessThan(base.kg);
    expect(bulk.finalKg).toBeGreaterThan(base.kg);
  });

  it('expenditure falls as weight falls', () => {
    const r = simulate({ ...base, intakeKcal: 2000, days: 180 });
    expect(r.finalTdee).toBeLessThan(r.startTdee);
  });

  it('predicts LESS loss than the static 3,500 kcal rule', () => {
    // This is the whole point of the model: linear arithmetic overestimates.
    const r = simulate({ ...base, intakeKcal: 2000, days: 365 });
    expect(r.finalKg).toBeGreaterThan(r.staticPrediction);
  });

  it('flattens rather than losing linearly', () => {
    const r = simulate({ ...base, intakeKcal: 2000, days: 365 });
    const first = r.series[0].kg - r.series[4].kg;      // first 4 weeks
    const last = r.series[r.series.length - 5].kg - r.series[r.series.length - 1].kg;
    expect(last).toBeLessThan(first);
  });

  it('holds weight roughly steady at maintenance intake', () => {
    const maintenance = simulate({ ...base, intakeKcal: 1, days: 1 }).startTdee;
    const r = simulate({ ...base, intakeKcal: maintenance, days: 90 });
    expect(Math.abs(r.finalKg - base.kg)).toBeLessThan(1.5);
  });

  it('samples weekly and never returns implausible weight', () => {
    const r = simulate({ ...base, intakeKcal: 1800, days: 365 });
    expect(r.series[1].week).toBe(1);
    for (const p of r.series) {
      expect(p.kg).toBeGreaterThan(30);
      expect(Number.isFinite(p.kg)).toBe(true);
    }
  });

  it('works without a body-fat input', () => {
    const r = simulate({ ...base, bodyFatPct: null, intakeKcal: 2000, days: 90 });
    expect(r.finalKg).toBeLessThan(base.kg);
    expect(Number.isFinite(r.finalKg)).toBe(true);
  });

  it('loses proportionally more lean mass when leaner (Forbes)', () => {
    expect(forbesFatFraction(30)).toBeGreaterThan(forbesFatFraction(8));
  });

  it('ramps adaptive thermogenesis in over weeks and caps it', () => {
    expect(adaptiveFactor(0, 0.25)).toBeCloseTo(1, 3);
    expect(adaptiveFactor(90, 0.25)).toBeLessThan(1);
    expect(adaptiveFactor(365, 1)).toBeGreaterThanOrEqual(0.85);
  });
});

describe('goal planning', () => {
  const base = {
    kg: 90, cm: 178, age: 35, sex: 'male',
    bodyFatPct: 25, activityFactor: 1.55,
  };

  it('returns a day count for a reachable target', () => {
    const d = daysToTarget({ ...base, intakeKcal: 2000, targetKg: 85 });
    expect(d).toBeGreaterThan(0);
    expect(d).toBeLessThan(1095);
  });

  it('returns null when the target is unreachable at that intake', () => {
    const d = daysToTarget({ ...base, intakeKcal: 3200, targetKg: 70 });
    expect(d).toBeNull();
  });

  it('takes longer to reach a more ambitious target', () => {
    const near = daysToTarget({ ...base, intakeKcal: 2000, targetKg: 88 });
    const far = daysToTarget({ ...base, intakeKcal: 2000, targetKg: 80 });
    expect(far).toBeGreaterThan(near);
  });

  it('solves for the intake that hits a target by a date', () => {
    const r = intakeForTargetByDate({ ...base, targetKg: 84, days: 180 });
    expect(r.feasible).toBe(true);
    const check = simulate({ ...base, intakeKcal: r.intake, days: 180 });
    expect(Math.abs(check.finalKg - 84)).toBeLessThan(0.5);
  });

  it('requires a smaller deficit for a longer timeline', () => {
    const fast = intakeForTargetByDate({ ...base, targetKg: 84, days: 90 });
    const slow = intakeForTargetByDate({ ...base, targetKg: 84, days: 270 });
    expect(slow.intake).toBeGreaterThan(fast.intake);
  });
});
