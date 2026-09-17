import { describe, it, expect } from 'vitest';
import {
  mifflinStJeor, harrisBenedict, katchMcArdle, cunningham, owen,
  allBmrFormulas, selectBmr, tdee, calorieTarget, ACTIVITY,
} from '../energy.js';
import { MIN_INTAKE } from '../safety.js';
import {
  lbmFromBodyFat, bmi, ffmi, waistToHeight, bodyFatDeurenberg, bodyFatNavy,
} from '../body.js';
import {
  defaultMacros, splitFromGrams, recommendedPercent, recommendedGrams,
  resolveSplit, convertSplit,
} from '../macros.js';
import { lbToKg, ftInToCm } from '../units.js';

// Reference subject used throughout: male, 30y, 80kg, 178cm
const M = { kg: 80, cm: 178, age: 30, sex: 'male', lbm: null };
const F = { kg: 65, cm: 165, age: 30, sex: 'female', lbm: null };

describe('BMR formulas', () => {
  it('Mifflin-St Jeor matches the hand-calculated value', () => {
    // 10(80) + 6.25(178) - 5(30) + 5 = 800 + 1112.5 - 150 + 5
    expect(mifflinStJeor(M)).toBeCloseTo(1767.5, 1);
  });

  it('applies the female constant of -161', () => {
    expect(mifflinStJeor({ ...M, sex: 'female' }))
      .toBeCloseTo(mifflinStJeor(M) - 166, 1);
  });

  it('Harris-Benedict lands within a plausible band of Mifflin', () => {
    const diff = Math.abs(harrisBenedict(M) - mifflinStJeor(M));
    expect(diff).toBeLessThan(150);
  });

  it('Katch-McArdle and Cunningham require lean mass', () => {
    expect(katchMcArdle({ lbm: null })).toBeNull();
    expect(cunningham({ lbm: null })).toBeNull();
    expect(katchMcArdle({ lbm: 64 })).toBeCloseTo(370 + 21.6 * 64, 5);
  });

  it('Cunningham runs higher than Katch-McArdle at the same lean mass', () => {
    expect(cunningham({ lbm: 64 })).toBeGreaterThan(katchMcArdle({ lbm: 64 }));
  });

  it('Owen depends only on weight and sex', () => {
    expect(owen({ kg: 80, sex: 'male' })).toBeCloseTo(879 + 10.2 * 80, 5);
  });
});

describe('formula selection', () => {
  it('omits lean-mass formulas when body fat is unknown', () => {
    expect(allBmrFormulas(M)).toHaveLength(3);
  });

  it('includes all five once lean mass is supplied', () => {
    expect(allBmrFormulas({ ...M, lbm: 64 })).toHaveLength(5);
  });

  it('auto prefers Mifflin without lean mass, Katch-McArdle with it', () => {
    expect(selectBmr(M, 'auto')).toBeCloseTo(mifflinStJeor(M), 5);
    const withLbm = { ...M, lbm: 64 };
    expect(selectBmr(withLbm, 'auto')).toBeCloseTo(katchMcArdle(withLbm), 5);
  });

  it('falls back to Mifflin for an unknown formula key', () => {
    expect(selectBmr(M, 'nonsense')).toBeCloseTo(mifflinStJeor(M), 5);
  });
});

describe('TDEE and targets', () => {
  it('multiplies BMR by the activity factor', () => {
    expect(tdee(1767.5, ACTIVITY.moderate.factor)).toBeCloseTo(1767.5 * 1.55, 5);
  });

  it('applies a deficit or surplus', () => {
    expect(calorieTarget(2740, -500, 'male').intake).toBe(2240);
    expect(calorieTarget(2740, 300, 'male').intake).toBe(3040);
  });

  // F-004: this previously asserted a floor of 1000, below the declared minimum
  // for either sex, which made the green suite evidence that F-001 was preserved.
  it('never returns a target below the sex-appropriate floor', () => {
    const m = calorieTarget(1200, -900, 'male');
    expect(m.intake).toBe(MIN_INTAKE.male);
    expect(m.belowFloor).toBe(true);

    const f = calorieTarget(1200, -900, 'female');
    expect(f.intake).toBe(MIN_INTAKE.female);
    expect(f.belowFloor).toBe(true);
  });

  // F-001 invariant: assert the PROPERTY, not the mechanism, so any future
  // caller of any exported function is covered without needing its own test.
  it('INVARIANT: no exported target-producing function returns below the floor', () => {
    for (const sex of ['male', 'female']) {
      for (const kg of [45, 55, 70, 95]) {
        for (const delta of [-250, -500, -750, -1000, -1500]) {
          const t = tdee(selectBmr({ kg, cm: 165, age: 30, sex }, 'auto'), 1.2);
          const r = calorieTarget(t, delta, sex);
          expect(r.intake).toBeGreaterThanOrEqual(MIN_INTAKE[sex]);
          if (t + delta < MIN_INTAKE[sex]) expect(r.belowFloor).toBe(true);
        }
      }
    }
  });
});

describe('body composition', () => {
  it('derives lean mass from body fat percentage', () => {
    expect(lbmFromBodyFat(80, 20)).toBeCloseTo(64, 5);
    expect(lbmFromBodyFat(80, null)).toBeNull();
  });

  it('computes BMI and guards divide-by-zero', () => {
    expect(bmi(80, 178)).toBeCloseTo(25.25, 2);
    expect(bmi(80, 0)).toBe(0);
  });

  it('computes FFMI from lean mass and height', () => {
    expect(ffmi(64, 178)).toBeCloseTo(20.2, 1);
  });

  it('flags elevated waist-to-height above 0.5', () => {
    expect(waistToHeight(89, 178)).toBeCloseTo(0.5, 5);
    expect(waistToHeight(100, 178)).toBeGreaterThan(0.5);
  });

  it('Deurenberg returns a plausible body fat percentage', () => {
    const bf = bodyFatDeurenberg(M);
    expect(bf).toBeGreaterThan(5);
    expect(bf).toBeLessThan(45);
  });

  it('Navy method returns a plausible value for valid male measurements', () => {
    const bf = bodyFatNavy({ sex: 'male', cm: 178, neckCm: 38, waistCm: 85 });
    expect(bf).toBeGreaterThan(5);
    expect(bf).toBeLessThan(40);
  });

  it('Navy method returns null for impossible measurements', () => {
    expect(bodyFatNavy({ sex: 'male', cm: 178, neckCm: 40, waistCm: 38 })).toBeNull();
    expect(bodyFatNavy({ sex: 'female', cm: 165, neckCm: 32, waistCm: 70 })).toBeNull();
  });

  it('Navy method handles female measurements with hip', () => {
    const bf = bodyFatNavy({ sex: 'female', cm: 165, neckCm: 32, waistCm: 70, hipCm: 95 });
    expect(bf).toBeGreaterThan(10);
    expect(bf).toBeLessThan(50);
  });
});

describe('macros', () => {
  const cals = 2740;

  it('scales protein off lean mass when available', () => {
    const withLbm = defaultMacros({ cals, kg: 80, lbm: 64 });
    const noLbm = defaultMacros({ cals, kg: 80, lbm: null });
    expect(withLbm.p).toBeCloseTo(2.2 * 64, 5);
    expect(noLbm.p).toBeCloseTo(1.8 * 80, 5);
  });

  it('respects the fat floor of 0.8 g/kg', () => {
    const m = defaultMacros({ cals: 1200, kg: 80, lbm: null });
    expect(m.f).toBeGreaterThanOrEqual(0.8 * 80 - 0.001);
  });

  it('never returns negative carbs', () => {
    const m = defaultMacros({ cals: 1000, kg: 120, lbm: null });
    expect(m.c).toBeGreaterThanOrEqual(0);
  });

  it('recommended percentages always sum to exactly 100', () => {
    for (const kg of [50, 65, 80, 95, 120]) {
      const s = recommendedPercent({ cals, kg, lbm: null });
      expect(s.p + s.c + s.f).toBe(100);
    }
  });

  it('recommended grams reconcile to the calorie target within rounding', () => {
    const g = recommendedGrams({ cals, kg: 80, lbm: null });
    const kcal = g.p * 4 + g.c * 4 + g.f * 9;
    expect(Math.abs(kcal - cals)).toBeLessThanOrEqual(5);
  });

  it('splitFromGrams produces percentages summing to 100', () => {
    const s = splitFromGrams({ p: 150, c: 300, f: 80 });
    expect(s.p + s.c + s.f).toBeCloseTo(100, 6);
  });
});

describe('split resolution and over-budget detection', () => {
  const cals = 2740;

  it('flags neither over nor under at exactly 100%', () => {
    const r = resolveSplit({ raw: { p: 30, c: 40, f: 30 }, cals, mode: 'pct' });
    expect(r.over).toBe(false);
    expect(r.under).toBe(false);
    expect(r.totalPct).toBe(100);
  });

  it('flags over-budget above 100% but still returns usable numbers', () => {
    const r = resolveSplit({ raw: { p: 40, c: 40, f: 40 }, cals, mode: 'pct' });
    expect(r.over).toBe(true);
    expect(r.totalPct).toBe(120);
    expect(r.grams.p).toBeGreaterThan(0);   // calculation still runs
    expect(r.macroKcal).toBeGreaterThan(cals);
  });

  it('flags under-budget below 100%', () => {
    const r = resolveSplit({ raw: { p: 20, c: 30, f: 20 }, cals, mode: 'pct' });
    expect(r.under).toBe(true);
  });

  it('measures the budget in kcal when in grams mode', () => {
    const r = resolveSplit({ raw: { p: 144, c: 370, f: 76 }, cals, mode: 'grams' });
    expect(Math.abs(r.macroKcal - cals)).toBeLessThan(20);
    const overR = resolveSplit({ raw: { p: 144, c: 370, f: 150 }, cals, mode: 'grams' });
    expect(overR.over).toBe(true);
  });

  it('treats blank entries as zero rather than NaN', () => {
    const r = resolveSplit({ raw: { p: '', c: 40, f: 30 }, cals, mode: 'pct' });
    expect(Number.isNaN(r.totalPct)).toBe(false);
    expect(r.grams.p).toBe(0);
  });
});

describe('unit conversion round-trips', () => {
  const cals = 2740;

  it('preserves the split when toggling % -> g -> %', () => {
    const start = { p: 21, c: 54, f: 25 };
    const grams = convertSplit({ raw: start, cals, to: 'grams' });
    const back = convertSplit({ raw: grams, cals, to: 'pct' });
    for (const k of ['p', 'c', 'f']) {
      expect(Math.abs(back[k] - start[k])).toBeLessThanOrEqual(1);
    }
  });

  it('carries the over-budget state across a unit switch', () => {
    const grams = { p: 144, c: 370, f: 150 };
    const asPct = convertSplit({ raw: grams, cals, to: 'pct' });
    expect(asPct.p + asPct.c + asPct.f).toBeGreaterThan(100);
  });

  it('converts imperial inputs correctly', () => {
    expect(lbToKg(176)).toBeCloseTo(79.83, 1);
    expect(ftInToCm(5, 10)).toBeCloseTo(177.8, 1);
  });
});
