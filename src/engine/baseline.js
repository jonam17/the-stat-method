/**
 * The Stat Method Baseline — one calculation engine, many interfaces.
 *
 * This file contains NO arithmetic and NO safety rules of its own. It decides
 * which sections apply, calls the same engine functions the standalone
 * calculators call, and returns their results unchanged. Every number the
 * Baseline shows is produced by the function its standalone tool uses; the
 * tests in __tests__/baseline.test.js assert that section by section.
 *
 * STRICT REFUSAL. The Baseline is refused whenever ANY rule that applies to
 * any included calculator would refuse the person. It passes every input to
 * eligibility() at once, so a rule that one standalone tool applies cannot be
 * sidestepped by reading a neighbouring section. Occasional over-refusal is the
 * accepted cost: the individual calculators remain for narrower questions.
 */
import { eligibility, ageAccuracyNote } from './safety.js';
import { tdeeResult, healthyWeightResult, macroResult } from './results.js';
import { lbmFromBodyFat, ffmi } from './body.js';
import { ACTIVITY } from './energy.js';
import { proteinTarget, toHandPortions } from './portions.js';
import { daysToTarget, simulate, weeklyRateCheck } from './planner.js';

/**
 * The one mapping this file owns: the Protein tool asks for a deficit level;
 * the Baseline infers it from the goal. A cut uses the Macro Calculator's
 * moderate 20% deficit (GOALS in safety.js), so it maps to 'moderate'.
 */
export const GOAL_TO_PROTEIN_DEFICIT = { cut: 'moderate', maintain: 'none', gain: 'none' };

/**
 * Wording for plan states the standalone tools do not have. Not safety rails,
 * so not in RAIL_COPY — but owned here so the interface never improvises it.
 * RAIL_COPY.infeasible was deliberately NOT reused: it refers to "that date"
 * and to "the fastest safe pace", neither of which the Baseline has.
 */
export const BASELINE_COPY = {
  planMismatch: 'Your goal and your target weight point in different directions, so there is ' +
    'no timeline to show. Change one to match the other.',
  planUnreachable: 'At these daily targets the model never reaches this weight. The Deficit ' +
    'Planner can solve for a target date instead.',
};

export function computeBaseline({
  sex, age, kg, cm, activity,
  bf = null, waistCm = null, goal = null, targetKg = null, lifeStage = 'none',
} = {}) {
  // ---- Strict refusal: every input, one decision ------------------------
  const gate = eligibility({
    age, kg, cm, lifeStage,
    goal: goal ?? undefined,
    targetKg: targetKg ?? undefined,
  });
  if (!gate.ok) return { status: gate.incomplete ? 'incomplete' : 'refused', gate };

  // ---- Energy — TDEE & BMR Calculator -----------------------------------
  const energy = tdeeResult({ kg, cm, age, sex, activity, bf });

  // ---- Body — Healthy Weight, plus FFMI when body fat is known ----------
  const body = healthyWeightResult({ kg, cm, sex, waistCm });
  const lbm = lbmFromBodyFat(kg, bf);
  const lean = lbm != null ? { lbm, ffmi: ffmi(lbm, cm) } : null;

  // ---- Daily targets — Macro, Protein and Hand Portions (needs a goal) ---
  let targets = null;
  if (goal) {
    const macro = macroResult({ kg, cm, age, sex, activity, goal, bf, lifeStage });
    // eligibility() already applied the same rule, so this cannot happen. If
    // it ever does, the two decisions have diverged — refuse rather than show.
    if (macro.blocked) return { status: 'refused', gate: { ok: false, refused: true, reason: macro.reason } };
    targets = {
      macro,
      protein: proteinTarget({ kg, lbm, age, deficit: GOAL_TO_PROTEIN_DEFICIT[goal] ?? 'none' }),
      portions: toHandPortions({ proteinG: macro.grams.p, carbsG: macro.grams.c, fatG: macro.grams.f }),
    };
  }

  // ---- Plan — Deficit Planner (needs a goal and a target weight) --------
  let plan = null;
  if (targets && targetKg != null && targetKg > 0 && targetKg !== kg) {
    // A plan only makes sense when the goal points toward the target.
    const agrees = (goal === 'cut' && targetKg < kg) || (goal === 'gain' && targetKg > kg);
    if (!agrees) {
      plan = { status: 'mismatch', targetKg, copy: BASELINE_COPY.planMismatch };
    } else {
      const base = { kg, cm, age: +age || 0, sex, bodyFatPct: bf, activityFactor: ACTIVITY[activity].factor };
      const intakeKcal = targets.macro.cals;
      const reachedDay = daysToTarget({ ...base, intakeKcal, targetKg });
      const sim = simulate({ ...base, intakeKcal, days: Math.max(7, reachedDay ?? 84) });
      plan = {
        status: reachedDay == null ? 'unreachable' : 'ok',
        copy: reachedDay == null ? BASELINE_COPY.planUnreachable : null,
        intakeKcal, targetKg, reachedDay,
        rate: weeklyRateCheck(sim, kg),
        maintenanceAtGoal: sim.maintenanceAtGoal,
      };
    }
  }

  return {
    status: 'ok',
    advisories: [ageAccuracyNote(age)].filter(Boolean),
    energy, body, lean, targets, plan,
  };
}
