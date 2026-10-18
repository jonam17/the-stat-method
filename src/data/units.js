/**
 * The unit each part of a nutrient page is printed in. Pure functions with no
 * Astro dependency, shared by the page template, the chart and library.test.js.
 *
 * Most nutrients state every table in one unit. Some do not. Vitamin A's
 * recommended amount is in mcg RAE (retinol activity equivalents, which count
 * carotenoids at a discount) while its upper limit is in plain mcg of preformed
 * vitamin A; folate's is in mcg DFE against mcg of folic acid. Printing "mcg"
 * for both would set two different measures side by side as if they were one.
 * Niacin's recommended amount is in mg NE (niacin equivalents, which count
 * tryptophan), but its food table is in mg of niacin alone.
 *
 * So a file states the fact sheet's label for the intake table in
 * `intake.unitLabel` and, where the food table differs from it, in
 * `sources.unitLabel`. Every upper-limit table on the sheets read so far prints
 * the plain unit, so the limit always uses `unit`.
 */
export const intakeUnit = d => d.intake.unitLabel ?? d.unit;
export const sourcesUnit = d => d.sources.unitLabel ?? intakeUnit(d);
export const ulUnit = d => d.unit;
