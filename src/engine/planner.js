/**
 * Dynamic weight-change model.
 *
 * WHY THIS EXISTS
 * The familiar "3,500 kcal = 1 lb" rule assumes expenditure never changes, so it
 * predicts indefinite linear loss. In reality a shrinking body costs less to run,
 * and expenditure falls further through adaptive thermogenesis. Real weight loss
 * therefore FLATTENS, and the static rule systematically overestimates it.
 *
 * WHAT THIS IS
 * A simplified dynamic simulation in the spirit of Hall KD et al. (Lancet, 2011),
 * which underpins the NIH Body Weight Planner. It is NOT the full NIH model — that
 * uses a coupled system of differential equations for glycogen, protein and fat
 * turnover. This version recomputes expenditure daily against current bodyweight,
 * applies adaptive thermogenesis, and partitions weight change between fat and
 * lean mass using the Forbes relationship.
 *
 * It is materially more honest than linear arithmetic and materially simpler than
 * the published model. Treat outputs as estimates, not prescriptions.
 */
import { mifflinStJeor, katchMcArdle } from './energy.js';
import { lbmFromBodyFat } from './body.js';
import { intakeFloor, checkRate } from './safety.js';

// Rails now live in safety.js so every tool shares them (audit F-001/F-009).
// weeklyRateCheck is re-exported so any tool presenting a rate of loss uses the
// same ceiling, rather than each reimplementing it (audit F-009).
// Re-exported here for backwards compatibility with existing importers.
export { MIN_INTAKE, MAX_WEEKLY_LOSS_PCT } from './safety.js';

/** Energy density of tissue (kcal/kg). */
export const KCAL_PER_KG_FAT = 9440;
export const KCAL_PER_KG_LEAN = 1816;

/**
 * Forbes (1987): the share of weight change coming from lean tissue depends on
 * how much fat a person is carrying. Leaner people lose proportionally more lean
 * mass for the same deficit.
 * Returns the fraction of weight change attributable to FAT (0-1).
 *
 * EVIDENCE ASYMMETRY (citation check, 2026-08-20). Forbes 1987 (Nutr Rev
 * 45:225-31, PMID 3306482) is well supported for weight LOSS. It is weaker for
 * weight GAIN: a later re-analysis noted that Forbes' gain data included
 * weight-regain studies in anorexic patients, and once those very-low-initial-
 * fat-mass subjects were removed there was insufficient evidence of a
 * relationship between the composition of weight gain and initial fat mass.
 *
 * This function is applied symmetrically in simulate(), so surplus projections
 * rest on the weaker half of the evidence. That is a defensible simplification
 * but it should not be presented as equally grounded in both directions.
 */
export function forbesFatFraction(fatMassKg) {
  const fm = Math.max(0.5, fatMassKg);
  const dFFMdFM = 10.4 / fm;          // Forbes' derivative
  return 1 / (1 + dFFMdFM);
}

/**
 * Adaptive thermogenesis: expenditure falls beyond what mass loss alone predicts.
 * Modelled as a fraction of the energy deficit, ramping in over several weeks and
 * capped at 15%.
 *
 * MAGNITUDE IS CONTESTED (citation check, 2026-08-20). That adaptation exists is
 * well established — Rosenbaum & Leibel (Int J Obes 2010;34:S47-S55) describe
 * coordinated metabolic, neuroendocrine and autonomic responses defending body
 * energy stores, operant in lean and obese alike. HOW LARGE it is, is less
 * settled, and the literature disagrees with itself. Trexler et al. (J Int Soc
 * Sports Nutr 2014;11:7) reports that adaptation persists after the active loss
 * period, including in people holding a reduced weight over a year; other
 * analyses report considerably smaller effects that shrink substantially once
 * weight stabilises.
 *
 * ATTRIBUTION NOTE: this comment previously cited Trexler for the specific
 * "10-15%" figure. Checking the source, Trexler supports the phenomenon and its
 * persistence but that percentage was not found in it. The figure derives
 * largely from studies of subjects held at a maintained 10%+ reduction. Treat
 * 15% as a modelling choice, not a sourced constant.
 *
 * The 15% cap is therefore at the UPPER end of a disputed range, which makes this
 * model's projections conservative — it predicts a plateau sooner and harder than
 * a lower estimate would. That is a defensible direction to err for a planning
 * tool, but it should not be presented as a settled figure.
 */
export function adaptiveFactor(dayIndex, deficitFraction) {
  const ramp = 1 - Math.exp(-dayIndex / 28);      // ~63% of effect by week 4
  const magnitude = Math.min(0.15, Math.max(0, deficitFraction) * 0.5);
  return 1 - magnitude * ramp;
}

/**
 * Simulate daily weight change.
 *
 * @returns {{ series: Array, finalKg: number, finalTdee: number,
 *             maintenanceAtGoal: number, plateauKg: number,
 *             staticPrediction: number }}
 */
export function simulate({
  kg, cm, age, sex, bodyFatPct = null,
  activityFactor, intakeKcal, days = 365,
}) {
  let clamped = false;   // F-008: true if the model left its valid range
  const lbm0 = lbmFromBodyFat(kg, bodyFatPct);
  let fatMass = bodyFatPct != null ? kg * (bodyFatPct / 100) : null;
  let leanMass = lbm0 != null ? lbm0 : null;
  let weight = kg;

  const bmrAt = (w, lean) =>
    lean != null ? katchMcArdle({ lbm: lean })
                 : mifflinStJeor({ kg: w, cm, age, sex });

  const startTdee = bmrAt(weight, leanMass) * activityFactor;
  const series = [];
  let plateauKg = null;

  for (let d = 0; d <= days; d++) {
    const bmr = bmrAt(weight, leanMass);
    const predictedTdee = bmr * activityFactor;
    const deficit = predictedTdee - intakeKcal;
    const deficitFraction = predictedTdee > 0 ? deficit / predictedTdee : 0;
    const tdee = predictedTdee * adaptiveFactor(d, deficitFraction);
    const balance = intakeKcal - tdee;            // negative = losing

    if (d % 7 === 0) {
      series.push({
        day: d, week: d / 7,
        kg: weight, tdee,
        fatMassKg: fatMass, leanMassKg: leanMass,
        bodyFatPct: fatMass != null ? (fatMass / weight) * 100 : null,
      });
    }

    // Partition the energy imbalance into fat and lean tissue
    let dW;
    if (fatMass != null) {
      const fFat = forbesFatFraction(fatMass);
      const energyDensity = fFat * KCAL_PER_KG_FAT + (1 - fFat) * KCAL_PER_KG_LEAN;
      dW = balance / energyDensity;
      fatMass = Math.max(0.5, fatMass + dW * fFat);
      leanMass = Math.max(1, leanMass + dW * (1 - fFat));
    } else {
      // No body-fat input: assume a typical 75/25 fat-to-lean split
      const energyDensity = 0.75 * KCAL_PER_KG_FAT + 0.25 * KCAL_PER_KG_LEAN;
      dW = balance / energyDensity;
    }
    if (weight + dW < 30) clamped = true;   // F-008: record, don't hide
    weight = Math.max(30, weight + dW);

    // Plateau = the day daily change falls below 10 g
    if (plateauKg == null && d > 14 && Math.abs(dW) < 0.01) plateauKg = weight;
  }

  const finalTdee = bmrAt(weight, leanMass) * activityFactor;
  // Static "3500 kcal/lb" (7716 kcal/kg) prediction, for comparison
  const staticPrediction = kg + ((intakeKcal - startTdee) * days) / 7716;

  return {
    series, finalKg: weight, startTdee, finalTdee,
    maintenanceAtGoal: finalTdee,
    plateauKg: plateauKg ?? weight,
    staticPrediction,
    // F-008: the 30 kg floor is a numerical stability guard, not a prediction.
    // When it engages the projection has left the model's valid range and the
    // UI must stop drawing rather than render a flat line at the clamp value.
    clamped,
  };
}

/**
 * Days required to reach a target weight at a given intake.
 * Returns null if the target is not reached within maxDays (i.e. the deficit
 * is too small, or the person plateaus above target).
 */
/**
 * The static "3,500 kcal per pound" projection, for comparison with simulate().
 *
 * 3,500 kcal/lb × 2.2046 lb/kg = 7,716 kcal/kg. It assumes the starting deficit
 * never shrinks — no drop in expenditure as weight falls, no adaptation — so it
 * predicts a straight line. The gap between this and simulate() is the error
 * the 3,500-calorie article is about.
 *
 * Was computed inline in DeficitPlanner.jsx. Moved here so the calculator and
 * the article's chart use one tested function rather than two copies.
 */
export const KCAL_PER_KG_STATIC_RULE = 3500 * 2.2046;

export function staticSeries({ startKg, startTdee, intakeKcal, series }) {
  const dailyDelta = intakeKcal - startTdee;
  return series.map(p => ({ day: p.day, kg: startKg + (dailyDelta * p.day) / KCAL_PER_KG_STATIC_RULE }));
}

export function daysToTarget({ targetKg, maxDays = 1095, ...opts }) {
  const losing = targetKg < opts.kg;
  const { series } = simulate({ ...opts, days: maxDays });
  for (const p of series) {
    if (losing ? p.kg <= targetKg : p.kg >= targetKg) return p.day;
  }
  return null;
}

/**
 * Recommend a daily intake to hit a target by a chosen date.
 * Binary search over intake, since the model is monotonic in intake.
 *
 * The search is bounded BELOW by the sex-appropriate safe floor. It previously
 * started at 800 kcal and would return that value for any sufficiently
 * aggressive request, generating an unsafe recommendation rather than declining
 * to (audit F-002). When the target cannot be reached at or above the floor the
 * result is flagged infeasible and reports what IS achievable safely, so the UI
 * can offer a later date instead of a lower intake (audit F-003).
 *
 * @returns {{ intake:number, feasible:boolean, reason:string|null,
 *             achievableKg:number, floor:number }}
 */
export function intakeForTargetByDate({ targetKg, days, ...opts }) {
  const floor = intakeFloor(opts.sex);
  let lo = floor, hi = 6000;

  // At the floor itself, is the target even reachable?
  const best = simulate({ ...opts, intakeKcal: floor, days });
  const losing = targetKg < opts.kg;
  const reachableAtFloor = losing ? best.finalKg <= targetKg : true;
  if (!reachableAtFloor) {
    return {
      intake: floor, feasible: false, reason: 'floor',
      achievableKg: best.finalKg, floor,
    };
  }

  for (let i = 0; i < 40; i++) {
    const mid = (lo + hi) / 2;
    const { finalKg } = simulate({ ...opts, intakeKcal: mid, days });
    if (finalKg > targetKg) hi = mid; else lo = mid;
  }
  const intake = (lo + hi) / 2;
  return {
    intake, feasible: true, reason: null,
    achievableKg: simulate({ ...opts, intakeKcal: intake, days }).finalKg,
    floor,
  };
}



/**
 * Rate-of-loss check for any tool that presents a weekly rate (audit F-009).
 * Previously MAX_WEEKLY_LOSS_PCT was consulted only by the Deficit Planner.
 */
export function weeklyRateCheck(sim, startKg) {
  const wk = sim?.series?.[1]?.kg;
  if (wk == null || !startKg) return { pct: 0, ceiling: null, tooFast: false };
  return checkRate(startKg - wk, startKg);
}
