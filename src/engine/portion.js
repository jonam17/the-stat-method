/**
 * Portion maths for the Library's food pages (v2.49.0). Pure functions, no DOM:
 * the page script and the tests import the same code.
 *
 * Every figure scales in a straight line with weight, because USDA publishes
 * amounts per 100 g of the same food.
 */
import { LB_TO_KG } from './units.js';

/** Grams in one avoirdupois ounce: exactly 1/16 of the international pound. */
export const G_PER_OZ = (LB_TO_KG * 1000) / 16;

/** Accepted inputs. Outside these the page asks for another number. */
export const AMOUNT_G = { min: 1, max: 2000 };
export const PROTEIN_G = { min: 1, max: 300 };

/**
 * Above this many grams for the protein asked for, a food is "not a practical
 * protein source" and no amount is shown (approved by the maintainer 2026-11-21).
 */
export const MAX_PROTEIN_SOURCE_G = 500;

const r1 = x => Math.round(x * 10) / 10;

/** Calories (whole) and protein, carbs, fat, fiber (one decimal) in `g` grams. */
export function scaleMacros(per100, g) {
  const k = g / 100;
  return {
    kcal: Math.round(per100.kcal * k),
    protein: r1(per100.protein * k),
    carbs: r1(per100.carbs * k),
    fat: r1(per100.fat * k),
    fiber: r1(per100.fiber * k),
  };
}

/** Percent of the Daily Value, whole number. */
export const pctDV = (amount, dv) => Math.round((amount / dv) * 100);

/**
 * The `n` nutrients with the highest share of their Daily Value. The order is the
 * same for any weight (every amount scales by the same factor), so it is worked
 * out per 100 g. Nutrients at zero are left out. Ties go to the name, so the
 * order never depends on how the file is written.
 */
export function topNutrients(micros, dvs, n = 3) {
  return Object.entries(micros)
    .filter(([key, v]) => dvs[key] && v > 0)
    .map(([key, v]) => ({ key, per100: v, share: v / dvs[key].dv }))
    .sort((a, b) => b.share - a.share || a.key.localeCompare(b.key))
    .slice(0, n);
}

/**
 * Grams of a food needed for `target` grams of protein.
 * Returns { ok: true, g } or { ok: false, reason } where reason is
 * 'range' (target outside PROTEIN_G) or 'not-practical' (over MAX_PROTEIN_SOURCE_G,
 * including foods with no protein).
 */
export function gramsForProtein(target, proteinPer100) {
  if (!(target >= PROTEIN_G.min && target <= PROTEIN_G.max)) return { ok: false, reason: 'range' };
  const g = proteinPer100 > 0 ? (target / proteinPer100) * 100 : Infinity;
  if (g > MAX_PROTEIN_SOURCE_G) return { ok: false, reason: 'not-practical' };
  return { ok: true, g };
}

/** True when `g` grams is an accepted amount. */
export const amountOk = g => g >= AMOUNT_G.min && g <= AMOUNT_G.max;

export const gToOz = g => g / G_PER_OZ;
export const ozToG = oz => oz * G_PER_OZ;
