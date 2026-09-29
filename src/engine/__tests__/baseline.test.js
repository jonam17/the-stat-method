/**
 * The Stat Method Baseline — one calculation engine, many interfaces.
 *
 * These tests are the invariant. For the same inputs, every Baseline section
 * must equal the result its standalone calculator produces, and the Baseline
 * must refuse whenever any included calculator would. Run across a grid of
 * inputs rather than one example, because a divergence that only appears for
 * some people is the kind that ships.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { computeBaseline, GOAL_TO_PROTEIN_DEFICIT } from '../baseline.js';
import { tdeeResult, healthyWeightResult, macroResult } from '../results.js';
import { eligibility, RAIL_COPY, checkWeightTarget, ageInScope, LIFE_STAGE, effectiveFloor } from '../safety.js';
import { lbmFromBodyFat } from '../body.js';
import { proteinTarget } from '../portions.js';
import { daysToTarget, ACTIVITY } from '../index.js';

// A grid of people. Varied enough to reach every section and every rule.
const PEOPLE = [];
for (const sex of ['male', 'female'])
  for (const age of [22, 45, 68])
    for (const kg of [52, 68, 95])
      for (const cm of [158, 176, 190])
        for (const activity of ['sedentary', 'moderate', 'veryActive'])
          for (const bf of [null, 24])
            PEOPLE.push({ sex, age, kg, cm, activity, bf, waistCm: 88 });

describe('Baseline sections equal their standalone calculators', () => {
  it(`energy equals the TDEE & BMR Calculator (${PEOPLE.length} people)`, () => {
    let n = 0;
    for (const p of PEOPLE) {
      const b = computeBaseline(p);
      if (b.status !== 'ok') continue;
      expect(b.energy).toEqual(tdeeResult(p)); n++;
    }
    expect(n).toBeGreaterThan(200);   // guard: never pass by skipping every case
  });

  it('body equals the Healthy Weight Calculator', () => {
    for (const p of PEOPLE) {
      const b = computeBaseline(p);
      if (b.status !== 'ok') continue;
      expect(b.body).toEqual(healthyWeightResult(p));
    }
  });

  it('daily targets equal the Macro and Protein calculators', () => {
    for (const goal of ['cut', 'maintain', 'gain'])
      for (const p of PEOPLE) {
        const b = computeBaseline({ ...p, goal });
        if (b.status !== 'ok') continue;
        expect(b.targets.macro).toEqual(macroResult({ ...p, goal }));
        expect(b.targets.protein).toEqual(proteinTarget({
          kg: p.kg, lbm: lbmFromBodyFat(p.kg, p.bf), deficit: GOAL_TO_PROTEIN_DEFICIT[goal],
        }));
      }
  });

  it('plan uses the Deficit Planner solver on the targets intake', () => {
    for (const p of PEOPLE) {
      const targetKg = p.kg - 6;
      const b = computeBaseline({ ...p, goal: 'cut', targetKg });
      if (b.status !== 'ok' || !b.plan) continue;
      expect(b.plan.reachedDay).toEqual(daysToTarget({
        kg: p.kg, cm: p.cm, age: p.age, sex: p.sex, bodyFatPct: p.bf,
        activityFactor: ACTIVITY[p.activity].factor,
        intakeKcal: b.targets.macro.cals, targetKg,
      }));
    }
  });
});

describe('strict refusal — the Baseline refuses whenever any included tool would', () => {
  const CASES = [];
  for (const p of PEOPLE)
    for (const goal of [undefined, 'cut', 'maintain'])
      for (const lifeStage of ['none', 'pregnant', 'breastfeeding'])
        for (const age of [15, 30, 99, 121])
          CASES.push({ ...p, age, goal, lifeStage, targetKg: goal === 'cut' ? p.kg - 8 : undefined });

  it(`refuses iff eligibility refuses, across ${CASES.length} cases`, () => {
    for (const c of CASES) {
      const b = computeBaseline({ ...c, goal: c.goal ?? null, targetKg: c.targetKg ?? null });
      const e = eligibility(c);
      expect(b.status === 'refused').toBe(!e.ok && !e.incomplete);
    }
  });

  it('never shows a result the Macro Calculator would block', () => {
    let n = 0;
    for (const c of CASES) {
      if (!c.goal) continue;
      if (!macroResult(c).blocked) continue;
      expect(computeBaseline({ ...c, targetKg: c.targetKg ?? null }).status).toBe('refused'); n++;
    }
    expect(n).toBeGreaterThan(100);
  });

  it('every refusal reason is actually exercised', () => {
    const seen = new Set();
    for (const c of CASES) {
      const b = computeBaseline({ ...c, goal: c.goal ?? null, targetKg: c.targetKg ?? null });
      if (b.status === 'refused') seen.add(b.gate.reason);
    }
    expect([...seen].sort()).toEqual(['currentUnderweight', 'high', 'pregnant', 'targetUnderweight', 'young']);
  });

  it('refuses whenever the Deficit Planner rules would (pregnancy, target below healthy, age)', () => {
    for (const c of CASES) {
      const planner =
        !ageInScope(c.age).ok ||
        (LIFE_STAGE[c.lifeStage] ?? LIFE_STAGE.none).blocks ||
        (c.targetKg != null && !checkWeightTarget({ currentKg: c.kg, targetKg: c.targetKg, cm: c.cm }).ok);
      if (!planner) continue;
      expect(computeBaseline({ ...c, goal: c.goal ?? null, targetKg: c.targetKg ?? null }).status).toBe('refused');
    }
  });

  it('uses the exact refusal wording the standalone tools use — no drift', () => {
    for (const c of CASES) {
      const b = computeBaseline({ ...c, goal: c.goal ?? null, targetKg: c.targetKg ?? null });
      if (b.status !== 'refused') continue;
      expect(b.gate.copy).toBe(RAIL_COPY[b.gate.copyKey]);
    }
  });
});

describe('one floor rule everywhere', () => {
  it('a breastfeeding user never gets a calorie target below the raised floor', () => {
    for (const p of PEOPLE) {
      const b = computeBaseline({ ...p, goal: 'cut', lifeStage: 'breastfeeding' });
      if (b.status !== 'ok') continue;
      expect(b.targets.macro.cals).toBeGreaterThanOrEqual(effectiveFloor(p.sex, 'breastfeeding'));
    }
  });
  it('with no life stage the floor is exactly what it always was', () => {
    for (const sex of ['male', 'female'])
      expect(effectiveFloor(sex, 'none')).toBe(sex === 'male' ? 1500 : 1200);
  });
});

describe('standalone tools run on the same engine functions', () => {
  // If a component is ever reverted to computing its own result inline, the
  // equality tests above would still pass while the tool quietly diverged.
  // This catches that.
  const uses = (file, fn) => readFileSync(`src/components/${file}`, 'utf8').includes(`${fn}(`);
  it('TDEE, Healthy Weight and Macro call their engine result functions', () => {
    expect(uses('TdeeCalculator.jsx', 'tdeeResult')).toBe(true);
    expect(uses('HealthyWeight.jsx', 'healthyWeightResult')).toBe(true);
    expect(uses('MacroCalculator.jsx', 'macroResult')).toBe(true);
  });
  it('the Baseline engine contains no arithmetic of its own', () => {
    const src = readFileSync('src/engine/baseline.js', 'utf8')
      .replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
    // Allowed: `targetKg !== kg`, `reachedDay ?? 84` style guards. Not allowed:
    // multiplying, dividing, adding or subtracting quantities.
    expect(src).not.toMatch(/[a-zA-Z0-9_)\]]\s*[*/]\s*[a-zA-Z0-9_(]/);
    expect(src).not.toMatch(/[a-zA-Z_)\]]\s*[+-]\s*[0-9a-zA-Z_(]/);
  });
});
