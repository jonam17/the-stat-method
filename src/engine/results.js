/**
 * Each calculator's full result, computed in the engine.
 *
 * These bodies were moved VERBATIM out of the React components, where they had
 * lived inside useMemo. Each standalone calculator now calls its function here,
 * and so does The Stat Method Baseline — one calculation, many interfaces. A
 * Baseline section cannot disagree with its standalone tool because both run
 * this code; the tests in __tests__/baseline.test.js pin that.
 *
 * The only change on moving: the Macro Calculator's refusal now goes through
 * eligibility() rather than calling checkWeightTarget directly. Given the same
 * inputs it makes the same decision with the same reason.
 */
import { lbmFromBodyFat, bmi, idealWeightFormulas, healthyBmiRange,
         waistToHeight, whtrBand, bmiCategory } from './body.js';
import { allBmrFormulas, ACTIVITY, selectBmr, tdee, calorieTarget } from './energy.js';
import { goalDelta, checkEnergyAvailability, eligibility, effectiveFloor, MAX_WEEKLY_LOSS_PCT } from './safety.js';
import { intakeForTargetByDate, daysToTarget, simulate, staticSeries as staticRuleSeries } from './planner.js';
import { recommendedGrams, recommendedPercent, resolveSplit } from './macros.js';

/** TDEE & BMR Calculator. */
export function tdeeResult({ kg, cm, age, sex, activity, bf }) {
  const lbm = lbmFromBodyFat(kg, bf);
  const input = { kg, cm, age: +age || 0, sex, lbm };
  const factor = ACTIVITY[activity].factor;
  const formulas = allBmrFormulas(input)
    .filter(f => f.value != null)
    .map(f => ({ ...f, tdee: f.value * factor }));
  const values = formulas.map(f => f.value);
  const mean = values.reduce((a, b) => a + b, 0) / (values.length || 1);
  // Recommended = lean-mass based when body fat is known, else Mifflin
  const preferredKey = lbm != null ? 'katch' : 'mifflin';
  const preferred = formulas.find(f => f.key === preferredKey) || formulas[0];
  return {
    formulas, mean, meanTdee: mean * factor, preferred, lbm, factor,
    min: Math.min(...values), max: Math.max(...values),
    spread: Math.max(...values) - Math.min(...values),
    bmi: bmi(kg, cm),
  };
}

/** Healthy Weight Calculator. */
export function healthyWeightResult({ kg, cm, sex, waistCm }) {
  const formulas = idealWeightFormulas({ cm, sex });
  const bmiRange = healthyBmiRange(cm);
  const vals = formulas.map(f => f.value);
  const b = bmi(kg, cm);
  const w = waistToHeight(waistCm, cm);
  return {
    formulas, bmiRange, b, w,
    band: whtrBand(w),
    category: bmiCategory(b),
    formulaLow: Math.min(...vals),
    formulaHigh: Math.max(...vals),
    inRange: kg >= bmiRange.lowKg && kg <= bmiRange.highKg,
    // Safety wording decided here, not in a component: every BMI category
    // carries the general caveat, and "Normal weight" adds the atypical
    // anorexia caveat. Both interfaces render this list, so the rule and its
    // wording cannot drift between them.
    caveats: ['categoryCaveat', ...(bmiCategory(b) === 'Normal weight' ? ['normalLabelCaveat'] : [])],
  };
}

/** Macro Calculator. `split` and `mode` belong to its editor; defaults suit a summary. */
export function macroResult({ kg, cm, age, sex, activity, goal, bf, formula = 'auto', split = null, mode = 'percent', lifeStage = 'none' }) {
  const lbm = lbmFromBodyFat(kg, bf);
  const input = { kg, cm, age: +age || 0, sex, lbm };
  const bmr = selectBmr(input, formula) ?? selectBmr(input, 'mifflin');
  const total = tdee(bmr, ACTIVITY[activity].factor);
  // F-028: deficit/surplus scales with maintenance instead of a flat kcal figure.
  // Refuse a cutting target for someone already below a healthy weight — the
  // same rule as every other tool, decided in one place (safety.js eligibility).
  const guard = eligibility({ age, kg, cm, goal });
  if (guard.incomplete) return { incomplete: true };
  if (!guard.ok) return { blocked: true, reason: guard.reason, copy: guard.copy };

  const delta = goalDelta(goal, total);
  const target = calorieTarget(total, delta, sex, total, lifeStage);   // F-001/F-028; life-stage floor
  // F-029: energy availability, using the above-sedentary portion of TDEE as a
  // rough proxy for training expenditure.
  const exerciseKcal = Math.max(0, Math.round(bmr * (ACTIVITY[activity].factor - 1.2)));
  const ea = checkEnergyAvailability({ intakeKcal: target.intake, ffmKg: lbm, exerciseKcal });
  const cals = target.intake;
  const recommended = mode === 'grams'
    ? recommendedGrams({ cals, kg, lbm })
    : recommendedPercent({ cals, kg, lbm });
  const raw = split || recommended;
  const resolved = resolveSplit({ raw, cals, mode });
  const usingLeanMass = formula === 'katch' || formula === 'cunningham'
    || (formula === 'auto' && lbm != null);
  return { bmr, tdee: total, cals, target, delta, ea, lbm, bmi: bmi(kg, cm), raw, usingLeanMass, ...resolved };
}

const DAY_MS = 86400000;

/**
 * Deficit & Goal-Date Planner. Body moved verbatim from DeficitPlanner.jsx; the
 * only changes are that refusal now comes from eligibility() — which also
 * applies the age rule the component used to check separately at render — and
 * the floor and static line are computed here instead of above the useMemo.
 */
export function deficitPlanResult({ kg, cm, age, sex, bf, activity, targetKg, lifeStage = 'none',
                                     mode, weeks, intake, nowMs }) {
    // Refusal decided once, by eligibility(): pregnancy, then weight target,
    // then age — the same order and wording as every other tool.
    const gate = eligibility({ age, kg, cm, targetKg, lifeStage });
    if (gate.refused) return { blocked: true, reason: gate.reason, copy: gate.copy };
    // A blank or cleared target is missing input, not an impossible goal. Without
    // this the solver is asked to reach 0 kg, returns "unreachable", and the panel
    // replaces the calculator with a failure state while the user is mid-edit.
    if (!(targetKg > 0)) return { incomplete: true };
    const base = {
      kg, cm, age: +age || 0, sex, bodyFatPct: bf,
      activityFactor: ACTIVITY[activity].factor,
    };
    const days = Math.max(7, (+weeks || 1) * 7);
    let dailyIntake, reachedDay, unreachable = false;
    let infeasibleReason = null, achievableKg = null;

    if (mode === 'date') {
      // F-002/F-003: solver is floor-bounded and reports feasibility.
      const solved = intakeForTargetByDate({ ...base, targetKg, days });
      dailyIntake = solved.intake;
      reachedDay = days;
      if (!solved.feasible) {
        unreachable = true;
        infeasibleReason = solved.reason;
        achievableKg = solved.achievableKg;
      }
    } else {
      dailyIntake = +intake || 2000;
      reachedDay = daysToTarget({ ...base, intakeKcal: dailyIntake, targetKg });
      if (reachedDay == null) unreachable = true;
    }

    const horizon = Math.min(1095, Math.max(days, (reachedDay ?? days) + 56));
    const sim = simulate({ ...base, intakeKcal: dailyIntake, days: horizon });

    // Static "3,500 kcal per pound" curve, for comparison
    const staticSeries = staticRuleSeries({
      startKg: kg, startTdee: sim.startTdee, intakeKcal: dailyIntake, series: sim.series,
    });

    const weeklyRate = sim.series.length > 1
      ? (sim.series[0].kg - sim.series[1].kg) : 0;
    const weeklyPct = kg ? (weeklyRate / kg) * 100 : 0;
    const floor = effectiveFloor(sex, lifeStage);   // life-stage aware (breastfeeding raises it)

    return {
      sim, staticSeries, dailyIntake, reachedDay, unreachable,
      infeasibleReason, achievableKg,
      deficit: sim.startTdee - dailyIntake,
      weeklyRate, weeklyPct,
      tooLow: dailyIntake < floor,
      tooFast: weeklyPct > MAX_WEEKLY_LOSS_PCT,
      floor,
      etaDate: reachedDay != null && nowMs != null
        ? new Date(nowMs + reachedDay * DAY_MS)
        : null,
    };
}
