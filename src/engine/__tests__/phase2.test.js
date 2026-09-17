import { describe, it, expect } from 'vitest';
import { dots, ipfGl, wilks, allScores, dotsBand } from '../scoring.js';
import { standardsFor, rateLift, ageFactor, LEVELS } from '../standards.js';
import { toHandPortions, splitMeals, proteinTarget, HAND_UNITS } from '../portions.js';
import {
  paceFromTime, timeFromPace, speedKmh, fmtTime, riegel,
  riegelConfidence, splits, DISTANCES,
} from '../pace.js';
import {
  bedtimesForWake, wakeTimesForBed, sleepNeedFor, CYCLE_MINUTES,
} from '../sleep.js';
import {
  idealWeightFormulas, healthyBmiRange, bmiCategory, whtrBand,
} from '../body.js';

describe('powerlifting scoring', () => {
  // Reference case: 82.5 kg male lifting a 600 kg total.
  const TOTAL = 600, BW = 82.5;

  it('DOTS produces a plausible score at a mid bodyweight', () => {
    const v = dots(TOTAL, BW, 'male');
    expect(v).toBeGreaterThan(300);
    expect(v).toBeLessThan(500);
  });

  it('DOTS and Wilks agree closely at mid bodyweights', () => {
    // Published comparisons put these within a few points around 82.5 kg.
    const d = dots(TOTAL, BW, 'male');
    const w = wilks(TOTAL, BW, 'male');
    expect(Math.abs(d - w)).toBeLessThan(15);
  });

  it('DOTS and Wilks diverge more at extreme bodyweights', () => {
    const midGap = Math.abs(dots(TOTAL, 82.5, 'male') - wilks(TOTAL, 82.5, 'male'));
    const heavyGap = Math.abs(dots(TOTAL, 145, 'male') - wilks(TOTAL, 145, 'male'));
    expect(heavyGap).toBeGreaterThan(midGap);
  });

  it('scores fall as bodyweight rises for the same total', () => {
    expect(dots(TOTAL, 100, 'male')).toBeLessThan(dots(TOTAL, 75, 'male'));
    expect(ipfGl(TOTAL, 100, 'male')).toBeLessThan(ipfGl(TOTAL, 75, 'male'));
  });

  it('scores rise with the total at fixed bodyweight', () => {
    expect(dots(700, BW, 'male')).toBeGreaterThan(dots(500, BW, 'male'));
    expect(ipfGl(700, BW, 'male')).toBeGreaterThan(ipfGl(500, BW, 'male'));
  });

  it('women score higher than men for an identical total and bodyweight', () => {
    expect(dots(400, 70, 'female')).toBeGreaterThan(dots(400, 70, 'male'));
  });

  it('IPF GL lands in the expected range for a strong classic lifter', () => {
    // GL points are scaled so elite totals approach ~100.
    const v = ipfGl(TOTAL, BW, 'male', 'classic', 'full');
    expect(v).toBeGreaterThan(50);
    expect(v).toBeLessThan(120);
  });

  it('IPF GL differs between classic and equipped where coefficients exist', () => {
    const classic = ipfGl(400, 70, 'female', 'classic', 'full');
    const equipped = ipfGl(400, 70, 'female', 'equipped', 'full');
    expect(classic).not.toBeCloseTo(equipped, 1);
  });

  it('allScores returns three systems and flags Wilks as legacy', () => {
    const s = allScores({ totalKg: TOTAL, bodyweightKg: BW, sex: 'male' });
    expect(s).toHaveLength(3);
    expect(s.find(x => x.key === 'wilks').status).toBe('legacy');
    expect(s.find(x => x.key === 'dots').status).toBe('current');
  });

  it('bands rise with score', () => {
    expect(dotsBand(150)).toBe('Beginner');
    expect(dotsBand(400)).toBe('Advanced');
    expect(dotsBand(600)).toBe('World class');
  });
});

describe('strength standards', () => {
  it('levels ascend in weight', () => {
    const rows = standardsFor('squat', 'male', 80, 30);
    expect(rows).toHaveLength(LEVELS.length);
    for (let i = 1; i < rows.length; i++) {
      expect(rows[i].weightKg).toBeGreaterThan(rows[i - 1].weightKg);
    }
  });

  it('men\u2019s standards exceed women\u2019s for the same lift and bodyweight', () => {
    const m = standardsFor('bench', 'male', 70, 30);
    const f = standardsFor('bench', 'female', 70, 30);
    expect(m[2].weightKg).toBeGreaterThan(f[2].weightKg);
  });

  it('deadlift standards exceed bench standards', () => {
    const d = standardsFor('deadlift', 'male', 80, 30);
    const b = standardsFor('bench', 'male', 80, 30);
    expect(d[2].weightKg).toBeGreaterThan(b[2].weightKg);
  });

  it('age adjustment leaves the young unchanged and lowers older standards', () => {
    expect(ageFactor(25)).toBe(1);
    expect(ageFactor(30)).toBe(1);
    expect(ageFactor(60)).toBeLessThan(1);
    expect(ageFactor(60)).toBeGreaterThan(0.5);
  });

  it('rates a lift and reports the gap to the next level', () => {
    const r = rateLift({ lift: 'squat', sex: 'male', bodyweightKg: 80, age: 30, oneRmKg: 140 });
    expect(LEVELS).toContain(r.level);
    expect(r.multiple).toBeCloseTo(1.75, 2);
    expect(r.toNextKg).toBeGreaterThanOrEqual(0);
    expect(r.progress).toBeGreaterThanOrEqual(0);
    expect(r.progress).toBeLessThanOrEqual(1);
  });

  it('handles a lift below every standard', () => {
    const r = rateLift({ lift: 'squat', sex: 'male', bodyweightKg: 80, age: 30, oneRmKg: 20 });
    expect(r.level).toBe('Below untrained');
    expect(r.nextLevel).toBe('Untrained');
  });

  it('caps progress at the top level', () => {
    const r = rateLift({ lift: 'squat', sex: 'male', bodyweightKg: 80, age: 30, oneRmKg: 400 });
    expect(r.level).toBe('Elite');
    expect(r.nextLevel).toBeNull();
    expect(r.progress).toBe(1);
  });
});

describe('hand portions', () => {
  it('converts grams to portions at the documented rates', () => {
    const p = toHandPortions({ proteinG: 150, carbsG: 250, fatG: 70 });
    expect(p.protein.exact).toBeCloseTo(150 / HAND_UNITS.protein.grams, 5);
    expect(p.protein.unit).toBe('palm');
    expect(p.carbs.unit).toBe('cupped hand');
    expect(p.fat.unit).toBe('thumb');
  });

  it('scales with hand size', () => {
    const small = toHandPortions({ proteinG: 150, carbsG: 250, fatG: 70, handSize: 'small' });
    const large = toHandPortions({ proteinG: 150, carbsG: 250, fatG: 70, handSize: 'large' });
    expect(small.protein.exact).toBeGreaterThan(large.protein.exact);
  });

  it('rounds to the nearest half portion', () => {
    const p = toHandPortions({ proteinG: 63, carbsG: 100, fatG: 25 });
    expect((p.protein.whole * 2) % 1).toBe(0);
  });
});

describe('meal splitting', () => {
  it('splits evenly and conserves the daily total within rounding', () => {
    const meals = splitMeals({ proteinG: 160, carbsG: 240, fatG: 80, meals: 4 });
    expect(meals).toHaveLength(4);
    const sum = meals.reduce((a, m) => a + m.proteinG, 0);
    expect(Math.abs(sum - 160)).toBeLessThanOrEqual(4);
  });

  it('weights a peri-workout meal more heavily', () => {
    const meals = splitMeals({ proteinG: 160, carbsG: 240, fatG: 80, meals: 4, periIndex: 2 });
    expect(meals[2].isPeri).toBe(true);
    expect(meals[2].carbsG).toBeGreaterThan(meals[0].carbsG);
  });

  it('clamps meal count to a sane range', () => {
    expect(splitMeals({ proteinG: 100, carbsG: 100, fatG: 50, meals: 0 })).toHaveLength(1);
    expect(splitMeals({ proteinG: 100, carbsG: 100, fatG: 50, meals: 99 })).toHaveLength(8);
  });
});

describe('protein target', () => {
  it('uses lean mass when supplied and says so', () => {
    const r = proteinTarget({ kg: 90, lbm: 70 });
    expect(r.basis).toBe('lean body mass');
    expect(r.lowG).toBeGreaterThan(0);
    expect(r.highG).toBeGreaterThan(r.lowG);
  });

  it('falls back to bodyweight with lower per-kg figures', () => {
    const r = proteinTarget({ kg: 90 });
    expect(r.basis).toBe('bodyweight');
    expect(r.perKgLow).toBeLessThan(1.6);
  });

  it('raises the target as the deficit deepens', () => {
    const none = proteinTarget({ kg: 80, lbm: 65, deficit: 'none' });
    const agg = proteinTarget({ kg: 80, lbm: 65, deficit: 'aggressive' });
    expect(agg.lowG).toBeGreaterThan(none.lowG);
  });

  it('raises the floor for older trainees', () => {
    const young = proteinTarget({ kg: 80, lbm: 65 });
    const older = proteinTarget({ kg: 80, lbm: 65, older: true });
    expect(older.lowG).toBeGreaterThan(young.lowG);
  });
});

describe('running pace', () => {
  it('converts between pace, time and distance', () => {
    expect(paceFromTime(1800, 5)).toBe(360);              // 30:00 over 5K = 6:00/km
    expect(timeFromPace(360, 10)).toBe(3600);
    expect(speedKmh(360)).toBeCloseTo(10, 5);
  });

  it('formats times correctly either side of an hour', () => {
    expect(fmtTime(1800)).toBe('30:00');
    expect(fmtTime(3661)).toBe('1:01:01');
    expect(fmtTime(-5)).toBe('—');
  });

  it('Riegel predicts a slower pace over longer distances', () => {
    const t5k = 1500;                                     // 25:00
    const tHalf = riegel(t5k, 5, 21.0975);
    expect(tHalf).toBeGreaterThan(t5k * (21.0975 / 5));   // slower than linear scaling
    expect(paceFromTime(tHalf, 21.0975)).toBeGreaterThan(paceFromTime(t5k, 5));
  });

  it('Riegel is reversible within rounding', () => {
    const half = riegel(1500, 5, 21.0975);
    const back = riegel(half, 21.0975, 5);
    expect(Math.abs(back - 1500)).toBeLessThan(1);
  });

  it('flags confidence by extrapolation distance', () => {
    expect(riegelConfidence(10, 21.0975).level).toBe('good');
    expect(riegelConfidence(5, 42.195).level).toBe('poor');
  });

  it('rejects invalid input', () => {
    expect(riegel(0, 5, 10)).toBeNull();
    expect(riegel(1500, 0, 10)).toBeNull();
  });

  it('produces splits ending exactly at the race distance', () => {
    const s = splits(1800, 5, 1);
    expect(s[s.length - 1].km).toBeCloseTo(5, 2);
    expect(s[s.length - 1].cumulative).toBeCloseTo(1800, 5);
  });

  it('includes the standard race distances', () => {
    expect(DISTANCES.find(d => d.name === 'Marathon').km).toBeCloseTo(42.195, 3);
  });
});

describe('sleep cycles', () => {
  const wake = new Date('2026-08-16T07:00:00');

  it('suggests bedtimes a whole number of cycles before waking', () => {
    const b = bedtimesForWake(wake, [6]);
    const gapMin = (wake - b[0].bedtime) / 60000;
    expect(gapMin).toBe(6 * CYCLE_MINUTES + 15);
  });

  it('longer sleep means an earlier bedtime', () => {
    const [six, four] = bedtimesForWake(wake, [6, 4]);
    expect(six.bedtime.getTime()).toBeLessThan(four.bedtime.getTime());
  });

  it('labels short sleep durations', () => {
    const b = bedtimesForWake(wake, [6, 3]);
    expect(b[0].quality).toBe('recommended');
    expect(b[1].quality).toBe('very short');
  });

  it('computes wake times from a bedtime', () => {
    const bed = new Date('2026-08-15T23:00:00');
    const w = wakeTimesForBed(bed, [5]);
    expect((w[0].wakeAt - bed) / 60000).toBe(5 * CYCLE_MINUTES + 15);
  });

  it('gives age-appropriate sleep guidance', () => {
    expect(sleepNeedFor(30).label).toBe('Adult');
    expect(sleepNeedFor(15).label).toBe('Teen');
    expect(sleepNeedFor(70).label).toBe('Older adult');
  });
});

describe('healthy weight range', () => {
  it('returns four ideal-weight formulas that disagree', () => {
    const f = idealWeightFormulas({ cm: 178, sex: 'male' });
    expect(f).toHaveLength(4);
    const vals = f.map(x => x.value);
    expect(Math.max(...vals) - Math.min(...vals)).toBeGreaterThan(1);
  });

  it('ideal weight rises with height', () => {
    const short = idealWeightFormulas({ cm: 160, sex: 'male' })[0].value;
    const tall = idealWeightFormulas({ cm: 190, sex: 'male' })[0].value;
    expect(tall).toBeGreaterThan(short);
  });

  it('men\u2019s ideal weight exceeds women\u2019s at the same height', () => {
    const m = idealWeightFormulas({ cm: 175, sex: 'male' })[0].value;
    const f = idealWeightFormulas({ cm: 175, sex: 'female' })[0].value;
    expect(m).toBeGreaterThan(f);
  });

  it('healthy BMI range brackets a normal weight', () => {
    const r = healthyBmiRange(178);
    expect(r.lowKg).toBeLessThan(70);
    expect(r.highKg).toBeGreaterThan(70);
  });

  it('categorises BMI and waist-to-height', () => {
    expect(bmiCategory(22)).toBe('Healthy weight');
    expect(bmiCategory(27)).toBe('Overweight');
    expect(whtrBand(0.45).label).toBe('Healthy');
    expect(whtrBand(0.55).label).toBe('Increased risk');
  });
});
