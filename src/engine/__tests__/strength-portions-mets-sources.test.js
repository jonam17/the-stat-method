/**
 * Item 45, batch 5 (v2.38.8): figures copied from the sources as read.
 *   RPE chart: Helms, Cronin, Storey & Zourdos, Strength Cond J 2016;38(4):42-49, Table 2.
 *   Rep limit: Reynolds, Gordon & Robergs, J Strength Cond Res 2006;20(3):584-92.
 *   Hand portions: Precision Nutrition, "How to Do Hand Portion Math" (reviewed March 2026).
 *   METs: 2024 Adult Compendium of Physical Activities (full list) and Herrmann et al. 2024.
 */
import { describe, it, expect } from 'vitest';
import { percentFromRIR, percentageTable, allOneRepMax, ONE_RM_MAX_REPS } from '../strength.js';
import { HAND_UNITS } from '../portions.js';
import { ACTIVITIES, kcalFromMets, findActivity } from '../cardio.js';

describe('Helms 2016 Table 2', () => {
  const rows = {
    10: [100, 95, 91, 87, 85, 83, 81, 79],
    9:  [95, 91, 87, 85, 83, 81, 79, 76],
    8:  [91, 87, 85, 83, 81, 79, 76, 73],
    7:  [87, 85, 83, 81, 79, 76, 73, 70],
  };
  for (const [rpe, vals] of Object.entries(rows)) {
    it(`RPE ${rpe} row`, () => {
      vals.forEach((v, i) => expect(percentFromRIR(i + 1, 10 - +rpe)).toBe(v));
    });
  }
  it('the training-percentages table is the RPE 10 row', () => {
    expect(percentageTable(100).map(r => [r.reps, r.pct])).toEqual(rows[10].map((p, i) => [i + 1, p]));
  });
});

describe('one-rep max', () => {
  it('flags above 10 reps', () => expect(ONE_RM_MAX_REPS).toBe(10));
  it('headline is the mean of the formulas', () => {
    const r = allOneRepMax(100, 5);
    const vals = r.results.map(x => x.value);
    expect(r.mean).toBeCloseTo(vals.reduce((a, b) => a + b, 0) / vals.length, 9);
  });
});

describe('Precision Nutrition hand portions', () => {
  it('men 24 / 25 / 9 g, women 22 / 22 / 8 g', () => {
    expect(['protein', 'carbs', 'fat'].map(k => HAND_UNITS[k].grams))
      .toEqual([{ male: 24, female: 22 }, { male: 25, female: 22 }, { male: 9, female: 8 }]);
  });
});

describe('2024 Compendium', () => {
  it('1 MET ≈ 1.0 kcal/kg/h', () => expect(kcalFromMets(1, 70, 60)).toBe(70));
  it('carries the 2024 values and codes', () => {
    const want = {
      17151: 2.3, 17190: 3.8, 17220: 5.5, 17080: 6.0, 12030: 8.5, 12050: 9.3, 12080: 11.8,
      12120: 14.8, '02054': 3.5, '02050': 6.0, '02040': 7.5, '02071': 5.0, '02048': 5.0,
      '02065': 9.3, '01010': 4.0, '01030': 8.0, '01050': 12.0, '01200': 6.8, 18240: 5.8,
      18230: 9.8, 15040: 8.0, 15610: 7.0, 15690: 8.0, '02150': 2.3, '02105': 2.8,
      15551: 11.8, 15110: 5.8, 15533: 8.0,
    };
    const items = ACTIVITIES.flatMap(g => g.items);
    expect(items).toHaveLength(Object.keys(want).length);
    for (const i of items) expect(i.mets).toBe(want[i.code]);
  });
  it('no kettlebell entry (no code of its own)', () => {
    expect(findActivity('Kettlebell training')).toBeNull();
  });
});
