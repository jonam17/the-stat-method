import { checkIntake } from './safety.js';

/**
 * Energy expenditure equations.
 * Pure functions — no framework, no DOM. Every formula names its source.
 */

/** Mifflin-St Jeor (1990). Best-validated general-population BMR equation. */
export function mifflinStJeor({ kg, cm, age, sex }) {
  return 10 * kg + 6.25 * cm - 5 * age + (sex === 'male' ? 5 : -161);
}

/** Revised Harris-Benedict (Roza & Shizgal, 1984). */
export function harrisBenedict({ kg, cm, age, sex }) {
  return sex === 'male'
    ? 88.362 + 13.397 * kg + 4.799 * cm - 5.677 * age
    : 447.593 + 9.247 * kg + 3.098 * cm - 4.330 * age;
}

/** Katch-McArdle. Lean-mass based — preferred when body fat % is known. */
export function katchMcArdle({ lbm }) {
  if (lbm == null) return null;
  return 370 + 21.6 * lbm;
}

/** Cunningham (1980). Similar to Katch-McArdle, runs higher; common with athletes. */
export function cunningham({ lbm }) {
  if (lbm == null) return null;
  return 500 + 22 * lbm;
}

/** Owen (1986–87). Simple, weight-only. */
export function owen({ kg, sex }) {
  return sex === 'male' ? 879 + 10.2 * kg : 795 + 7.18 * kg;
}

export const ACTIVITY = {
  sedentary:  { factor: 1.2,   label: 'Sedentary — desk job, little exercise' },
  light:      { factor: 1.375, label: 'Light — 1-3 sessions/week' },
  moderate:   { factor: 1.55,  label: 'Moderate — 3-5 sessions/week' },
  active:     { factor: 1.725, label: 'Active — 6-7 sessions/week' },
  veryActive: { factor: 1.9,   label: 'Very active — hard training or physical job' },
};

/**
 * Run every applicable BMR formula so the spread is visible to the user.
 * Lean-mass formulas are omitted when lbm is unknown.
 */
export function allBmrFormulas(input) {
  const out = [
    { key: 'mifflin', name: 'Mifflin-St Jeor', value: mifflinStJeor(input) },
    { key: 'harris',  name: 'Harris-Benedict', value: harrisBenedict(input) },
    { key: 'owen',    name: 'Owen',            value: owen(input) },
  ];
  if (input.lbm != null) {
    out.push({ key: 'katch',      name: 'Katch-McArdle', value: katchMcArdle(input) });
    out.push({ key: 'cunningham', name: 'Cunningham',    value: cunningham(input) });
  }
  return out;
}

/** Pick the most appropriate BMR. 'auto' prefers Katch-McArdle when lbm is known. */
export function selectBmr(input, formula = 'auto') {
  const map = { mifflin: mifflinStJeor, harris: harrisBenedict,
                katch: katchMcArdle, cunningham, owen };
  if (formula === 'auto') {
    return input.lbm != null ? katchMcArdle(input) : mifflinStJeor(input);
  }
  return map[formula]?.(input) ?? mifflinStJeor(input);
}

export const tdee = (bmr, activityFactor) => bmr * activityFactor;

/**
 * Clamp a goal-adjusted target to the sex-appropriate safe floor.
 *
 * `sex` is REQUIRED. It previously defaulted to a hardcoded 1000 kcal floor,
 * which is below the minimum for either sex, and two callers silently inherited
 * it (audit F-001). Callers must render a warning when `belowFloor` is true.
 *
 * @returns {{ intake:number, requested:number, floor:number, belowFloor:boolean }}
 */
export function calorieTarget(tdeeValue, delta, sex, maintenanceKcal = tdeeValue) {
  return checkIntake(tdeeValue + delta, sex, maintenanceKcal);
}
