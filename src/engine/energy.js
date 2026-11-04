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

/**
 * Activity levels — FAO/WHO/UNU, Human energy requirements (2004), chapter 5. Energy need is BMR
 * times the physical activity level (PAL). `factor` is FAO's own worked example for each lifestyle
 * (Table 5.1); `range` is its band for that lifestyle (Table 5.3).
 *
 * v2.38.6 (item 45, batch 3) replaced five unsourced factors (1.2 / 1.375 / 1.55 / 1.725 / 1.9,
 * labelled by sessions a week). FAO calls 1.21 the level of "totally inactive dependent people" and
 * "too low"; its sedentary band starts at 1.40, and its sedentary office worker comes out at 1.53.
 * FAO: about an hour a day of moderate to vigorous exercise raises PAL from 1.55 to 1.75.
 */
export const ACTIVITY = {
  sedentary: { factor: 1.53, range: [1.40, 1.69],
    label: 'Sedentary or light', hint: 'Mostly sitting, no regular exercise.' },
  active:    { factor: 1.76, range: [1.70, 1.99],
    label: 'Active', hint: 'About an hour of exercise a day, or an active job.' },
  vigorous:  { factor: 2.25, range: [2.00, 2.40],
    label: 'Vigorous', hint: 'Hours of hard physical work or exercise a day.' },
};
export const DEFAULT_ACTIVITY = 'sedentary';
/** The level for a key; an unknown or retired key (e.g. 'moderate') falls back to the default. */
export const activityOf = key => ACTIVITY[key] ?? ACTIVITY[DEFAULT_ACTIVITY];

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
export function calorieTarget(tdeeValue, delta, sex, maintenanceKcal = tdeeValue, lifeStage = 'none') {
  return checkIntake(tdeeValue + delta, sex, maintenanceKcal, lifeStage);
}
