/**
 * The same person must see the same refusal in every tool.
 *
 * The Baseline test checked that each refusal message came from RAIL_COPY. It
 * never checked that it was the SAME message the standalone tools showed — and
 * it was not. Macro, Hand Portions and the Deficit Planner checked weight before
 * age; the Baseline checked age first. An underweight 16-year-old saw the
 * eating-disorder helpline in three tools and no helpline in the Baseline.
 */
import { describe, it, expect } from 'vitest';
import { eligibility, RAIL_COPY } from '../safety.js';
import { macroResult, deficitPlanResult } from '../results.js';
import { computeBaseline } from '../baseline.js';

const HELPLINE = '1-866-662-1235';
const PEOPLE = [];
for (const age of ['16', '30', '105'])
  for (const kg of [46, 70, 98])
    for (const cm of [160, 178, 193])
      for (const sex of ['male', 'female'])
        for (const lifeStage of ['none', 'pregnant', 'breastfeeding'])
          PEOPLE.push({ age, kg, cm, sex, lifeStage, activity: 'moderate', bf: null });

const plannerArgs = p => ({ ...p, targetKg: p.kg - 6, mode: 'date', weeks: '20', intake: '2000', nowMs: 0 });

describe('order: the most protective message wins', () => {
  it('pregnancy outranks an underweight target and age', () => {
    expect(eligibility({ age: '16', kg: 46, cm: 175, goal: 'cut', lifeStage: 'pregnant' }).reason).toBe('pregnant');
  });
  it('an underweight minor asking to lose weight gets the helpline, not the under-18 message', () => {
    const e = eligibility({ age: '16', kg: 46, cm: 175, goal: 'cut' });
    expect(e.reason).toBe('currentUnderweight');
    expect(e.copy).toContain(HELPLINE);
  });
  it('a minor who is not underweight gets the under-18 message', () => {
    expect(eligibility({ age: '16', kg: 70, cm: 175, goal: 'cut' }).copyKey).toBe('underAge');
  });
});

describe('same person, same message, every tool', () => {
  it(`the Baseline and the Deficit Planner agree (${PEOPLE.length} people)`, () => {
    let n = 0;
    for (const p of PEOPLE) {
      const planner = deficitPlanResult(plannerArgs(p));
      const base = computeBaseline({ ...p, goal: 'cut', targetKg: p.kg - 6 });
      expect(base.status === 'refused').toBe(!!planner.blocked);
      if (planner.blocked) { expect(base.gate.copy).toBe(planner.copy); n++; }
    }
    expect(n).toBeGreaterThan(100);
  });

  it('the Baseline and the Macro Calculator agree', () => {
    let n = 0;
    for (const p of PEOPLE.filter(p => p.lifeStage === 'none')) {
      const macro = macroResult({ ...p, goal: 'cut' });
      const base = computeBaseline({ ...p, goal: 'cut' });
      expect(base.status === 'refused').toBe(!!macro.blocked);   // both directions
      if (macro.blocked) { expect(base.gate.copy).toBe(macro.copy); n++; }
    }
    expect(n).toBeGreaterThan(10);
  });

  it('every tool shows an underweight minor the helpline', () => {
    const p = { age: '16', kg: 46, cm: 178, sex: 'female', lifeStage: 'none', activity: 'moderate', bf: null };
    expect(macroResult({ ...p, goal: 'cut' }).copy).toContain(HELPLINE);
    expect(deficitPlanResult(plannerArgs(p)).copy).toContain(HELPLINE);
    expect(computeBaseline({ ...p, goal: 'cut', targetKg: 40 }).gate.copy).toContain(HELPLINE);
  });

  it('refusal wording is always exactly RAIL_COPY', () => {
    for (const p of PEOPLE) {
      const r = deficitPlanResult(plannerArgs(p));
      if (r.blocked) expect(Object.values(RAIL_COPY)).toContain(r.copy);
    }
  });
});
