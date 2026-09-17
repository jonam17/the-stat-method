/**
 * CHARACTERIZATION TESTS — Pass B pre-flight.
 * Captures behaviour BEFORE remediation of F-001/F-002/F-003/F-006/F-007/F-011
 * so that every user-visible change is deliberate and enumerated.
 * Assertions marked [CHANGES] are expected to be updated by the fix.
 */
import { describe, it, expect } from 'vitest';
import { calorieTarget, tdee, selectBmr, ACTIVITY } from '../energy.js';
import { intakeForTargetByDate, simulate, weeklyRateCheck } from '../planner.js';
import { recommendedGrams } from '../macros.js';
import { riegelConfidence, MARATHON_KM } from '../pace.js';
import { brzycki, allOneRepMax } from '../strength.js';
import { ipfGl, dots, wilks, wilksReliability } from '../scoring.js';
import {
  MIN_INTAKE, MAX_WEEKLY_LOSS_PCT, ageInScope, AGE_MIN, AGE_MAX, RAIL_COPY,
  goalDelta, checkEnergyAvailability, checkWeightTarget, LIFE_STAGE, effectiveFloor,
  RECOMP_WEEKLY_LOSS_PCT, checkRate, ageAccuracyNote, BMI_UNDERWEIGHT, checkOlderAdultWeight,
} from '../safety.js';
import { cmToFtIn, kgToLb, lbToKg, fmt } from '../units.js';
import { ffmi, ffmiBand, ffmiNormalised, FFMI_HEIGHT_COEFF } from '../body.js';

const female55 = { kg: 55, cm: 160, age: 30, sex: 'female' };
const male70   = { kg: 70, cm: 175, age: 30, sex: 'male' };
const t = (i) => tdee(selectBmr(i, 'auto'), ACTIVITY.sedentary.factor);

describe('F-001 calorieTarget floor', () => {
  // [RESOLVED F-001] was: floored at 1000 for both sexes, no warning flag.
  it('floors at the sex-appropriate minimum and flags it', () => {
    const f = calorieTarget(t(female55), -750, 'female');
    expect(f.intake).toBe(MIN_INTAKE.female);
    expect(f.belowFloor).toBe(true);

    const m = calorieTarget(t(male70), -1000, 'male');
    expect(m.intake).toBe(MIN_INTAKE.male);
    expect(m.belowFloor).toBe(true);
  });
  it('does not alter targets that sit safely above the floor', () => {
    expect(calorieTarget(2740, -500, 'male').intake).toBe(2240);
    expect(calorieTarget(2740, -500, 'male').belowFloor).toBe(false);
    expect(calorieTarget(2740, 300, 'male').intake).toBe(3040);
  });
});

describe('F-002/F-003 solver', () => {
  const base = { kg: 70, cm: 170, age: 30, sex: 'female', activityFactor: 1.2 };
  // [RESOLVED F-002] was: searched from 800 kcal and returned it verbatim.
  it('INVARIANT: never recommends below the floor, at any timeline', () => {
    for (const days of [30, 60, 90, 180, 365]) {
      const r = intakeForTargetByDate({ ...base, targetKg: 55, days });
      expect(r.intake).toBeGreaterThanOrEqual(MIN_INTAKE.female);
    }
  });
  // [RESOLVED F-003] was: returned a bare number with no feasibility signal.
  it('flags infeasible targets and reports what is achievable', () => {
    const r = intakeForTargetByDate({ ...base, targetKg: 40, days: 30 });
    expect(r.feasible).toBe(false);
    expect(r.reason).toBe('floor');
    expect(r.intake).toBe(MIN_INTAKE.female);
    expect(r.achievableKg).toBeGreaterThan(60);
  });
  it('reaches a comfortably achievable target at a safe intake', () => {
    const r = intakeForTargetByDate({ ...base, targetKg: 67, days: 180 });
    expect(r.feasible).toBe(true);
    expect(r.intake).toBeGreaterThan(MIN_INTAKE.female);
  });
});

describe('F-007 cmToFtIn', () => {
  // [RESOLVED F-007] was: { ft: 5, in: 12 }.
  it('carries into feet instead of emitting 12 inches', () => {
    expect(cmToFtIn(182.7)).toEqual({ ft: 6, in: 0 });
  });
  it('INVARIANT: inches stay in 0-11 across the full plausible range', () => {
    for (let cm = 120; cm <= 220; cm += 0.1) {
      const { in: i } = cmToFtIn(cm);
      expect(i).toBeGreaterThanOrEqual(0);
      expect(i).toBeLessThanOrEqual(11);
    }
  });
  it('is correct away from the carry boundary', () => {
    expect(cmToFtIn(152.4)).toEqual({ ft: 5, in: 0 });
    expect(cmToFtIn(183)).toEqual({ ft: 6, in: 0 });
    expect(cmToFtIn(175)).toEqual({ ft: 5, in: 9 });
  });
});

describe('F-011 lb/kg round trip', () => {
  it('round-trips stably', () => {
    expect(kgToLb(lbToKg(200))).toBeCloseTo(200, 6);
  });
});

describe('F-006 FFMI band variable', () => {
  it('[CHANGES] raw and normalised FFMI can fall in different bands', () => {
    const lbm = 53, cm = 165;
    const raw = ffmi(lbm, cm);
    const norm = raw + 6.1 * (1.8 - cm / 100);
    expect(Math.abs(norm - raw)).toBeCloseTo(0.915, 2);
    // 165cm / 53kg lean: raw 19.47 -> 'Average', normalised 20.38 -> 'Above average'
    expect(ffmiBand(raw)).toBe('Average');
    expect(ffmiBand(norm)).toBe('Above average');
  });
});

/* ── Pass B round 2 ───────────────────────────────────────────────────── */

describe('F-015 fmt() guards non-finite values', () => {
  it('[RESOLVED] was: rendered the literal "NaN" and "∞" to users', () => {
    expect(fmt(NaN)).toBe('—');
    expect(fmt(Infinity)).toBe('—');
    expect(fmt(-Infinity)).toBe('—');
    expect(fmt(undefined)).toBe('—');
  });
  it('still formats real numbers unchanged', () => {
    expect(fmt(1234.6)).toBe('1,235');
    expect(fmt(0)).toBe('0');
  });
});

describe('F-005 age scope (18-120, per site owner decision)', () => {
  it('accepts the adult range', () => {
    for (const a of [18, 30, 65, 119, 120]) expect(ageInScope(a).ok).toBe(true);
  });
  it('INVARIANT: rejects every age below 18', () => {
    for (let a = 1; a < 18; a++) {
      const r = ageInScope(a);
      expect(r.ok).toBe(false);
      expect(r.reason).toBe('young');
    }
  });
  it('rejects implausible and invalid ages', () => {
    expect(ageInScope(121).reason).toBe('high');
    expect(ageInScope(0).reason).toBe('invalid');
    expect(ageInScope(-5).reason).toBe('invalid');
    expect(ageInScope('').reason).toBe('invalid');
    expect(ageInScope(NaN).reason).toBe('invalid');
    expect(ageInScope(undefined).reason).toBe('invalid');
  });
  it('under-18 copy explains the method limit and routes to a professional', () => {
    const c = RAIL_COPY.underAge;
    expect(c).toMatch(/adult/i);
    expect(c).toMatch(/doctor|dietitian|nurse/i);
    // Must describe the tool's limitation, not comment on the person.
    expect(c).not.toMatch(/you are too|not allowed|denied/i);
  });
  it('boundary: 17 is out, 18 is in', () => {
    expect(ageInScope(17).ok).toBe(false);
    expect(ageInScope(18).ok).toBe(true);
  });
});

describe('F-008 simulate() reports when it leaves its valid range', () => {
  const base = { kg: 70, cm: 170, age: 30, sex: 'female', activityFactor: 1.2 };
  it('[RESOLVED] was: clamped to 30kg silently and presented it as a prediction', () => {
    const s = simulate({ ...base, intakeKcal: 800, days: 1095 });
    expect(s.finalKg).toBe(30);
    expect(s.clamped).toBe(true);
  });
  it('does not flag normal projections', () => {
    const s = simulate({ ...base, intakeKcal: 1600, days: 365 });
    expect(s.clamped).toBe(false);
  });
});

describe('F-009 rate ceiling is available to every tool', () => {
  const base = { kg: 70, cm: 170, age: 30, sex: 'female', activityFactor: 1.2 };
  it('flags a rate above the ceiling', () => {
    const r = weeklyRateCheck(simulate({ ...base, intakeKcal: 900, days: 28 }), 70);
    expect(r.tooFast).toBe(true);
    expect(r.pct).toBeGreaterThan(MAX_WEEKLY_LOSS_PCT);
  });
  it('does not flag a moderate rate', () => {
    const r = weeklyRateCheck(simulate({ ...base, intakeKcal: 1600, days: 28 }), 70);
    expect(r.tooFast).toBe(false);
  });
});

describe('F-010 recommendedGrams reports over-budget splits', () => {
  it('[RESOLVED] was: silently exceeded the target when the carb clamp engaged', () => {
    const g = recommendedGrams({ cals: 900, kg: 120, lbm: null });
    expect(g.c).toBe(0);
    expect(g.over).toBe(true);
    expect(g.kcal).toBeGreaterThan(900);
  });
  it('reconciles normally when the target is achievable', () => {
    const g = recommendedGrams({ cals: 2400, kg: 80, lbm: null });
    expect(g.over).toBe(false);
    expect(Math.abs(g.kcal - 2400)).toBeLessThan(10);
  });
});

describe('F-028 proportional goals scale with maintenance', () => {
  it('a fixed -500 breaches the floor for small users where -20% does not', () => {
    // The case that made the warning fire routinely and lose its signal value.
    const tdee = 1600;
    expect(tdee - 500).toBeLessThan(MIN_INTAKE.female);          // old behaviour
    expect(tdee + goalDelta('cut', tdee)).toBeGreaterThanOrEqual(MIN_INTAKE.female);
  });
  it('scales the deficit with body size', () => {
    expect(goalDelta('cut', 2800)).toBe(-560);
    expect(goalDelta('cut', 1500)).toBe(-300);
    expect(goalDelta('maintain', 2000)).toBe(0);
    expect(goalDelta('gain', 2000)).toBe(200);
  });
  it('INVARIANT: -20% never breaches the floor above a plausible small-user TDEE', () => {
    for (let t = 1550; t <= 3500; t += 25) {
      expect(t + goalDelta('cut', t)).toBeGreaterThanOrEqual(MIN_INTAKE.female);
    }
  });
  it('still honestly breaches for a user who genuinely cannot cut safely', () => {
    // A ~1300 kcal maintenance cannot support any real deficit. The tool should
    // say so via the floor rail rather than pretend otherwise.
    expect(1300 + goalDelta('cut', 1300)).toBeLessThan(MIN_INTAKE.female);
  });
});

describe('F-029 energy availability rail', () => {
  it('flags low EA below 30 kcal/kg FFM', () => {
    const r = checkEnergyAvailability({ intakeKcal: 1500, ffmKg: 60, exerciseKcal: 400 });
    expect(r.low).toBe(true);
    expect(r.ea).toBeCloseTo(18.33, 1);
  });
  it('does not flag adequate EA', () => {
    expect(checkEnergyAvailability({ intakeKcal: 2600, ffmKg: 60, exerciseKcal: 400 }).low).toBe(false);
  });
  it('catches a muscular user whose absolute intake looks unremarkable', () => {
    // 1900 kcal reads fine and clears MIN_INTAKE.male, but not for 80kg of FFM.
    const r = checkEnergyAvailability({ intakeKcal: 1900, ffmKg: 80, exerciseKcal: 500 });
    expect(1900).toBeGreaterThan(MIN_INTAKE.male);
    expect(r.low).toBe(true);
  });
  it('returns null when fat-free mass is unknown', () => {
    expect(checkEnergyAvailability({ intakeKcal: 2000, ffmKg: null })).toBeNull();
  });
});

describe('F-030 maintenance-below-floor is distinguished from an aggressive deficit', () => {
  it('flags when maintenance itself sits below the floor', () => {
    const r = calorieTarget(1100, -200, 'female', 1100);
    expect(r.belowFloor).toBe(true);
    expect(r.maintenanceBelowFloor).toBe(true);
  });
  it('does not confuse an aggressive deficit with a low maintenance', () => {
    const r = calorieTarget(2400, -1400, 'female', 2400);
    expect(r.belowFloor).toBe(true);
    expect(r.maintenanceBelowFloor).toBe(false);
  });
  it('copy for the two cases differs and neither blames the user', () => {
    const c = RAIL_COPY.maintenanceBelowFloor(1200);
    expect(c).toMatch(/not a mistake/i);
    expect(c).toMatch(/dietitian/i);
    expect(c).not.toMatch(/smaller deficit/i);
  });
});

describe('FFMI height normalisation matches Kouri 1995', () => {
  it('uses the published 6.3 coefficient, not the 6.1 in circulation', () => {
    expect(FFMI_HEIGHT_COEFF).toBe(6.3);
  });
  it('is a no-op at the 1.8 m reference height', () => {
    expect(ffmiNormalised(22, 180)).toBeCloseTo(22, 9);
  });
  it('raises short and lowers tall, per the published correction', () => {
    expect(ffmiNormalised(22, 165)).toBeCloseTo(22 + 6.3 * 0.15, 9);
    expect(ffmiNormalised(22, 195)).toBeCloseTo(22 - 6.3 * 0.15, 9);
  });
  it('returns null without a height', () => {
    expect(ffmiNormalised(22, null)).toBeNull();
  });
});

describe('Riegel confidence reflects the evidence, not just distance ratio', () => {
  it('never reports high confidence for a marathon target', () => {
    // Vickers & Vertosick 2016: Riegel is >=10 min too fast for half of
    // recreational runners at the marathon, even from a half-marathon input.
    expect(riegelConfidence(21.0975, MARATHON_KM).level).not.toBe('good');
    expect(riegelConfidence(32, MARATHON_KM).level).not.toBe('good');
  });
  it('degrades further for large extrapolations to the marathon', () => {
    expect(riegelConfidence(10, MARATHON_KM).level).toBe('poor');
    expect(riegelConfidence(5, MARATHON_KM).level).toBe('poor');
  });
  it('still reports good confidence for well-calibrated non-marathon pairs', () => {
    expect(riegelConfidence(10, 21.0975).level).toBe('good');
  });
  it('explains why, rather than just downgrading silently', () => {
    expect(riegelConfidence(21.0975, MARATHON_KM).note).toMatch(/optimistic|too fast/i);
  });
});

describe('Brzycki singularity and null-safe aggregation', () => {
  it('[RESOLVED] returned Infinity at 37 reps and negative above', () => {
    expect(brzycki(100, 37)).toBeNull();
    expect(brzycki(100, 40)).toBeNull();
  });
  it('still computes inside its valid range', () => {
    expect(brzycki(100, 1)).toBe(100);
    expect(brzycki(100, 10)).toBeCloseTo(100 * 36 / 27, 6);
  });
  it('one null formula does not poison mean/min/max', () => {
    const r = allOneRepMax(100, 25);
    expect(Number.isFinite(r.mean)).toBe(true);
    expect(Number.isFinite(r.min)).toBe(true);
    expect(Number.isFinite(r.max)).toBe(true);
    expect(r.omitted).toContain('Brzycki');
  });
  it('normal input omits nothing', () => {
    expect(allOneRepMax(100, 5).omitted).toHaveLength(0);
  });
});

describe('IPF GL coefficients match the official 2020 tables', () => {
  it('[RESOLVED] equipped and classic no longer return an identical score', () => {
    const eq = ipfGl(800, 100, 'male', 'equipped', 'full');
    const cl = ipfGl(800, 100, 'male', 'classic', 'full');
    expect(eq).not.toBe(cl);
    expect(eq).toBeLessThan(cl);   // equipped totals are scaled down
  });
  it('returns null rather than silently substituting another coefficient set', () => {
    expect(ipfGl(800, 100, 'male', 'equipped', 'nonsense')).toBeNull();
  });
  it('matches a hand-worked value from the published coefficients', () => {
    // A=1199.72839, B=1025.18162, C=0.00921; bw 82.5, total 550
    const denom = 1199.72839 - 1025.18162 * Math.exp(-0.00921 * 82.5);
    expect(ipfGl(550, 82.5, 'male', 'classic', 'full')).toBeCloseTo(550 * 100 / denom, 4);
  });
  it('covers all eight sex/equipment/event combinations', () => {
    for (const sex of ['male', 'female'])
      for (const eq of ['classic', 'equipped'])
        for (const ev of ['full', 'bench'])
          expect(ipfGl(500, 80, sex, eq, ev)).toBeGreaterThan(0);
  });
});

describe('DOTS bodyweight domain is per-sex', () => {
  it('[RESOLVED] women are clamped at 150 kg, not 210', () => {
    expect(dots(400, 160, 'female')).toBe(dots(400, 150, 'female'));
    expect(dots(400, 200, 'female')).toBe(dots(400, 150, 'female'));
  });
  it('men are still clamped at 210 kg', () => {
    expect(dots(800, 220, 'male')).toBe(dots(800, 210, 'male'));
    expect(dots(800, 200, 'male')).not.toBe(dots(800, 210, 'male'));
  });
  it('below-range bodyweights clamp at 40 for both', () => {
    for (const sex of ['male', 'female'])
      expect(dots(300, 30, sex)).toBe(dots(300, 40, sex));
  });
  it('matches a hand-worked value from the published coefficients', () => {
    const bw = 82.5;
    const d = -0.000001093 * bw ** 4 + 0.0007391293 * bw ** 3
            - 0.1918759221 * bw ** 2 + 24.0900756 * bw - 307.75076;
    expect(dots(550, bw, 'male')).toBeCloseTo(550 * 500 / d, 4);
  });
});

describe('weight-target rail refuses to plan below a healthy range', () => {
  it('blocks further loss when already underweight', () => {
    const r = checkWeightTarget({ currentKg: 48, targetKg: 42, cm: 165 });
    expect(r.ok).toBe(false);
    expect(r.reason).toBe('currentUnderweight');
  });
  it('blocks a target that lands below a healthy range', () => {
    const r = checkWeightTarget({ currentKg: 70, targetKg: 48, cm: 165 });
    expect(r.ok).toBe(false);
    expect(r.reason).toBe('targetUnderweight');
  });
  it('does NOT block an underweight person planning to gain', () => {
    expect(checkWeightTarget({ currentKg: 48, targetKg: 55, cm: 165 }).ok).toBe(true);
  });
  it('allows ordinary loss within a healthy range', () => {
    expect(checkWeightTarget({ currentKg: 85, targetKg: 70, cm: 175 }).ok).toBe(true);
  });
  it('copy names no weights and routes to a real helpline', () => {
    for (const c of [RAIL_COPY.targetBelowHealthy, RAIL_COPY.currentBelowHealthy]) {
      expect(c).toMatch(/1-866-662-1235/);
      expect(c).not.toMatch(/\d+\s?(kg|lb|pounds|kilos)/i);   // no weights, ever
      expect(c).not.toMatch(/you should|you must|unhealthy weight/i);
    }
  });
});

describe('life-stage contraindications', () => {
  it('pregnancy blocks planning entirely', () => {
    expect(LIFE_STAGE.pregnant.blocks).toBe(true);
    expect(RAIL_COPY.pregnancy).toMatch(/midwife|obstetrician/i);
  });
  it('breastfeeding raises the floor rather than blocking', () => {
    expect(LIFE_STAGE.breastfeeding.blocks).toBe(false);
    expect(effectiveFloor('female', 'breastfeeding')).toBe(1800);
    expect(effectiveFloor('female', 'breastfeeding'))
      .toBeGreaterThan(effectiveFloor('female', 'none'));
  });
  it('INVARIANT: a life stage can only raise the floor, never lower it', () => {
    for (const sex of ['male', 'female'])
      for (const stage of Object.keys(LIFE_STAGE))
        expect(effectiveFloor(sex, stage)).toBeGreaterThanOrEqual(MIN_INTAKE[sex]);
  });
  it('BMI caveat carries the AMA individual-level limitation', () => {
    expect(RAIL_COPY.categoryCaveat).toMatch(/individual/i);
    expect(RAIL_COPY.categoryCaveat).toMatch(/sole measure|not be used as a sole/i);
  });
});

describe('underweight rail covers goal-direction tools, not just target-weight ones', () => {
  const underweight = { currentKg: 48, cm: 165 };   // BMI 17.6
  it('refuses a cut with no target weight stated', () => {
    const r = checkWeightTarget({ ...underweight, goal: 'cut' });
    expect(r.ok).toBe(false);
    expect(r.reason).toBe('currentUnderweight');
  });
  it('permits maintain and gain', () => {
    expect(checkWeightTarget({ ...underweight, goal: 'maintain' }).ok).toBe(true);
    expect(checkWeightTarget({ ...underweight, goal: 'gain' }).ok).toBe(true);
  });
  it('does not block a cut for someone within a healthy range', () => {
    expect(checkWeightTarget({ currentKg: 70, cm: 165, goal: 'cut' }).ok).toBe(true);
  });
  it('still catches the target-weight form', () => {
    expect(checkWeightTarget({ ...underweight, targetKg: 44 }).ok).toBe(false);
  });
});

describe('Wilks reliability flag (sourced, unlike the missing domain)', () => {
  it('flags heavy bodyweights where the validation found bias', () => {
    expect(wilksReliability(150, 'male').level).toBe('reduced');
    expect(wilksReliability(110, 'female').level).toBe('reduced');
  });
  it('does not flag mid-range bodyweights', () => {
    expect(wilksReliability(80, 'male').level).toBe('normal');
    expect(wilksReliability(60, 'female').level).toBe('normal');
  });
  it('points users at the better-calibrated scales instead', () => {
    expect(wilksReliability(150, 'male').note).toMatch(/DOTS|IPF GL/);
  });
  it('does not invent a hard cutoff — scores are still returned', () => {
    expect(wilks(800, 150, 'male')).toBeGreaterThan(0);
  });
});

describe('rate ceiling vs recomposition advisory are distinct', () => {
  it('the enforced ceiling is 1.0%, unchanged by the Q2 review', () => {
    expect(MAX_WEEKLY_LOSS_PCT).toBe(1.0);
  });
  it('the recomp figure is advisory and lower, not a rail', () => {
    expect(RECOMP_WEEKLY_LOSS_PCT).toBe(0.7);
    expect(RECOMP_WEEKLY_LOSS_PCT).toBeLessThan(MAX_WEEKLY_LOSS_PCT);
  });
  it('checkRate still enforces only the ceiling', () => {
    expect(checkRate(0.8, 100).tooFast).toBe(false);   // 0.8%/wk — under ceiling
    expect(checkRate(1.2, 100).tooFast).toBe(true);
  });
  it('recomp copy frames the trial honestly, not as a rule', () => {
    const c = RAIL_COPY.recompRate(0.9);
    expect(c).toMatch(/24 athletes|direction rather than a rule/i);
    expect(c).toMatch(/longer timeline/i);
  });
});

describe('age boundary messaging (Q3)', () => {
  it('under-18 copy gives the guidance reason, not only the maths reason', () => {
    const c = RAIL_COPY.underAge;
    expect(c).toMatch(/discouraged for people your age/i);
    expect(c).toMatch(/habits rather than\s+weight/i);   // AAP framing
    expect(c).toMatch(/doctor, school nurse, or registered dietitian/i);
    expect(c).not.toMatch(/you should not|you are too/i); // never about the person
  });
  it('older-adult accuracy note fires only at 80+', () => {
    expect(ageAccuracyNote(79)).toBeNull();
    expect(ageAccuracyNote(80)).not.toBeNull();
    expect(ageAccuracyNote(95)).not.toBeNull();
  });
  it('accuracy note states the error direction is unknown, not that estimates run high or low', () => {
    expect(ageAccuracyNote(85)).toMatch(/sometimes high,\s*sometimes low/i);
  });
  it('80+ is advisory — the tool still computes', () => {
    expect(ageInScope(85).ok).toBe(true);
  });
});

describe('older-adult low-BMI handling (Q4) — advisory, not refusal', () => {
  it('does NOT raise the refusal threshold above 18.5', () => {
    // A 70-year-old targeting BMI 20 is advised, not blocked.
    expect(BMI_UNDERWEIGHT).toBe(18.5);
    expect(checkWeightTarget({ currentKg: 70, targetKg: 56, cm: 165 }).ok).toBe(true);
  });
  it('advises 65+ below BMI 22', () => {
    expect(checkOlderAdultWeight({ age: 70, currentKg: 70, targetKg: 56, cm: 165 })).not.toBeNull();
  });
  it('does not advise above the threshold, or for younger users', () => {
    expect(checkOlderAdultWeight({ age: 70, currentKg: 75, targetKg: 66, cm: 165 })).toBeNull();
    expect(checkOlderAdultWeight({ age: 40, currentKg: 70, targetKg: 56, cm: 165 })).toBeNull();
  });
  it('copy states the evidence is unsettled rather than asserting a number', () => {
    expect(RAIL_COPY.olderAdultLowBmi).toMatch(/genuinely unsettled/i);
    expect(RAIL_COPY.olderAdultLowBmi).toMatch(/isn't a reason not to lose weight/i);
  });
});

describe('atypical anorexia blind spot (Q5) is disclosed, not silently accepted', () => {
  it('the BMI guard genuinely does not catch normal-weight restriction', () => {
    // Documents the gap rather than pretending it does not exist:
    // BMI 24 targeting BMI 21 is a 12% loss and passes every guard.
    const r = checkWeightTarget({ currentKg: 65, targetKg: 57, cm: 165 });
    expect(r.ok).toBe(true);
  });
  it('a "normal" label carries its own caveat, not just the muscle-mass one', () => {
    const c = RAIL_COPY.normalLabelCaveat;
    expect(c).toMatch(/every body size/i);
    expect(c).toMatch(/takes longer to be\s+recognised/i);
    expect(c).not.toMatch(/\?/);        // asks the user nothing
    expect(c).not.toMatch(/you may have|you might have/i);  // no self-diagnosis prompt
  });
});

describe('Q6 — refusal design limits are disclosed, copy avoids reinforcement', () => {
  it('floor warning leads with what the tool did, not the shortfall', () => {
    const c = RAIL_COPY.belowFloor(1200);
    expect(c).toMatch(/^We've held this target/);
    expect(c).not.toMatch(/puts you below|you are below/i);
  });
  it('refusal copy states no numbers at all', () => {
    for (const c of [RAIL_COPY.targetBelowHealthy, RAIL_COPY.currentBelowHealthy]) {
      expect(c).not.toMatch(/\d+\s?(kg|lb|kcal|pounds)/i);
    }
  });
  it('referral is the Alliance line, not NEDA', () => {
    // NEDA's human helpline closed in 2023; its replacement chatbot was withdrawn
    // after recommending calorie restriction to people with eating disorders.
    for (const c of [RAIL_COPY.targetBelowHealthy, RAIL_COPY.currentBelowHealthy]) {
      expect(c).toMatch(/National Alliance for Eating\s+Disorders/);
      expect(c).toMatch(/1-866-662-1235/);
      expect(c).not.toMatch(/NEDA|800-931-2237/);
    }
  });
});

describe('UI change: 12-hour time conversion (Sleep + Caffeine pickers)', () => {
  // TimePicker emits "HH:MM" 24-hour from hour/minute/meridiem selections.
  const to24 = (h12, mer) =>
    mer === 'AM' ? (h12 === 12 ? 0 : h12) : (h12 === 12 ? 12 : h12 + 12);
  it('handles midnight and noon, the two cases that usually break', () => {
    expect(to24(12, 'AM')).toBe(0);    // 12 AM is 00, not 12
    expect(to24(12, 'PM')).toBe(12);   // 12 PM is 12, not 24
  });
  it('maps the rest of the clock correctly', () => {
    expect(to24(1, 'AM')).toBe(1);
    expect(to24(11, 'AM')).toBe(11);
    expect(to24(1, 'PM')).toBe(13);
    expect(to24(11, 'PM')).toBe(23);
  });
  it('round-trips every hour without collision', () => {
    const seen = new Set();
    for (const mer of ['AM', 'PM'])
      for (let h = 1; h <= 12; h++) seen.add(to24(h, mer));
    expect(seen.size).toBe(24);
  });
});

describe('UI change: running pace custom distance unit', () => {
  const KM_PER_MILE = 1.609344;
  const toKm = (v, unit) => (unit === 'mi' ? v * KM_PER_MILE : v);
  it('converts miles to km for the engine', () => {
    expect(toKm(26.2, 'mi')).toBeCloseTo(42.165, 2);   // marathon
    expect(toKm(10, 'km')).toBe(10);
  });
  it('a marathon entered in miles lands on the marathon distance', () => {
    expect(Math.abs(toKm(26.2, 'mi') - MARATHON_KM)).toBeLessThan(0.05);
  });
});
