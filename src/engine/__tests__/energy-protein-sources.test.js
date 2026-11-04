/**
 * v2.38.6 — item 45, batch 3. Activity levels are FAO/WHO/UNU 2004's three lifestyles; the
 * default macro split and Protein Target use only figures from their cited sources.
 */
import { describe, it, expect } from 'vitest';
import { ACTIVITY, activityOf, DEFAULT_ACTIVITY } from '../energy.js';
import { tdeeResult, macroResult } from '../results.js';
import { PROTEIN_BANDS } from '../portions.js';

describe('activity levels (FAO/WHO/UNU 2004)', () => {
  it('uses FAO’s worked-example values and bands', () => {
    expect(Object.fromEntries(Object.entries(ACTIVITY).map(([k, v]) => [k, [v.factor, ...v.range]])))
      .toEqual({ sedentary: [1.53, 1.40, 1.69], active: [1.76, 1.70, 1.99], vigorous: [2.25, 2.00, 2.40] });
  });
  it('defaults to sedentary and reads retired keys as the default', () => {
    expect(DEFAULT_ACTIVITY).toBe('sedentary');
    expect(activityOf('moderate')).toBe(ACTIVITY.sedentary);
    expect(activityOf('veryActive')).toBe(ACTIVITY.sedentary);
  });
  it('gives each value inside its own band', () => {
    for (const v of Object.values(ACTIVITY)) {
      expect(v.factor).toBeGreaterThanOrEqual(v.range[0]);
      expect(v.factor).toBeLessThanOrEqual(v.range[1]);
    }
  });
  it('reports the TDEE band for the chosen level', () => {
    const r = tdeeResult({ kg: 80, cm: 180, age: 30, sex: 'male', activity: 'active', bf: null });
    expect(r.band.low).toBeCloseTo(r.preferred.value * 1.70, 6);
    expect(r.band.high).toBeCloseTo(r.preferred.value * 1.99, 6);
    expect(r.preferred.tdee).toBeGreaterThan(r.band.low);
    expect(r.preferred.tdee).toBeLessThan(r.band.high);
  });
  it('counts no exercise energy at the sedentary level', () => {
    const r = macroResult({ kg: 60, cm: 165, age: 30, sex: 'female', activity: 'sedentary', goal: 'maintain', bf: 25 });
    expect(r.ea.low).toBeFalsy();
  });
});

describe('Protein Target bands', () => {
  it('are Jäger 2017 and Helms 2014', () => {
    expect(PROTEIN_BANDS).toEqual({ bodyweight: { low: 1.4, high: 2.0 }, deficitLeanMass: { low: 2.3, high: 3.1 } });
  });
});
