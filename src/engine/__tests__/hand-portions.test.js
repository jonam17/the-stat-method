/**
 * Hand Portions moved from its own macro calculation to the engine's (v2.19.1).
 * `oldHandPortions` below is the component's useMemo body as it stood in v2.19.0,
 * copied verbatim apart from taking its inputs as arguments. The sweep pins that the
 * engine gives the same grams, calorie target and refusals for every valid input.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { selectBmr, tdee, calorieTarget, ACTIVITY } from '../energy.js';
import { recommendedGrams } from '../macros.js';
import { eligibility, goalDelta } from '../safety.js';
import { handPortionsResult } from '../results.js';

function oldHandPortions({ kg, cm, age, sex, activity, goal }) {
  const input = { kg, cm, age: +age || 30, sex, lbm: null };
  const guard = eligibility({ age, kg, cm, goal });
  if (guard.refused) return { blocked: true, reason: guard.reason, copy: guard.copy };
  const total = tdee(selectBmr(input, 'auto'), ACTIVITY[activity].factor);
  const target = calorieTarget(total, goalDelta(goal, total), sex, total);
  const cals = target.intake;
  const g = recommendedGrams({ cals, kg, lbm: null });
  return { p: g.p, c: g.c, f: g.f, target };
}

const grid = [];
for (const sex of ['male', 'female'])
  for (const age of ['18', '25', '45', '70', '99', '16', '100'])
    for (const kg of [40, 52, 65, 80, 110, 160])
      for (const cm of [150, 165, 178, 195])
        for (const activity of Object.keys(ACTIVITY))
          for (const goal of ['cut', 'maintain', 'gain'])
            grid.push({ sex, age, kg, cm, activity, goal });

describe('Hand Portions on the engine matches its old calculation', () => {
  it(`gives identical results across ${grid.length} input combinations`, () => {
    let compared = 0, refused = 0;
    for (const c of grid) {
      const before = oldHandPortions(c);
      const after = handPortionsResult({ source: 'calculate', ...c });
      if (before.blocked) {
        expect(after).toMatchObject({ blocked: true, reason: before.reason, copy: before.copy });
        refused += 1;
      } else {
        expect({ p: after.p, c: after.c, f: after.f }).toEqual({ p: before.p, c: before.c, f: before.f });
        expect(after.target).toEqual(before.target);
        compared += 1;
      }
    }
    // Both branches must actually be exercised for the sweep to mean anything.
    expect(compared).toBeGreaterThan(1000);
    expect(refused).toBeGreaterThan(100);
  });

  it('a blank age is now incomplete, not a result for an assumed 30-year-old', () => {
    const c = { sex: 'male', kg: 80, cm: 178, activity: 'moderate', goal: 'maintain' };
    expect(oldHandPortions({ ...c, age: '' }).p).toBeGreaterThan(0);    // the old behaviour
    expect(handPortionsResult({ source: 'calculate', ...c, age: '' })).toEqual({ incomplete: true });
  });

  it('a blank weight or height is incomplete', () => {
    const c = { sex: 'male', age: '30', activity: 'moderate', goal: 'maintain' };
    expect(handPortionsResult({ source: 'calculate', ...c, kg: 0, cm: 178 })).toEqual({ incomplete: true });
    expect(handPortionsResult({ source: 'calculate', ...c, kg: 80, cm: 0 })).toEqual({ incomplete: true });
  });

  it('entered macros pass through, and age still refuses', () => {
    const direct = { p: '150', c: '250', f: '70' };
    expect(handPortionsResult({ source: 'direct', direct, age: '30' })).toEqual({ p: 150, c: 250, f: 70 });
    expect(handPortionsResult({ source: 'direct', direct, age: '16' })).toMatchObject({ blocked: true });
  });

  it('the component calls the engine and computes no macros itself', () => {
    const src = readFileSync('src/components/HandPortions.jsx', 'utf8');
    expect(src).toContain('handPortionsResult(');
    expect(src).not.toMatch(/\b(selectBmr|tdee|calorieTarget|recommendedGrams|eligibility)\(/);
  });
});
