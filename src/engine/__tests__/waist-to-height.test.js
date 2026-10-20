/**
 * No waist, no ratio (v2.32.1).
 *
 * waistToHeight() used to divide whatever it was given, and `null / 178` is 0 in
 * JavaScript. With the waist field empty, the Baseline showed "Waist-to-height
 * 0.00" and Healthy Weight showed "0.00 — Below range": a result for a
 * measurement nobody entered. These tests pin the property, not the mechanism:
 * no tool result carries a ratio or a band unless a waist was entered.
 */
import { describe, it, expect } from 'vitest';
import { waistToHeight, whtrBand } from '../body.js';
import { healthyWeightResult } from '../results.js';
import { computeBaseline } from '../baseline.js';

const MISSING = [null, undefined, '', 0, -5, NaN];

describe('waistToHeight — a missing measurement is not a ratio', () => {
  it('returns null for a missing, zero or negative waist', () => {
    for (const w of MISSING) expect(waistToHeight(w, 178)).toBeNull();
  });

  it('returns null for a missing or zero height', () => {
    for (const cm of [null, undefined, 0, NaN]) expect(waistToHeight(89, cm)).toBeNull();
  });

  it('still computes the ratio when both are present', () => {
    expect(waistToHeight(89, 178)).toBeCloseTo(0.5, 5);
  });

  it('whtrBand gives no band without a ratio', () => {
    expect(whtrBand(null)).toBeNull();
    expect(whtrBand(undefined)).toBeNull();
    expect(whtrBand(0.45).label).toBe('Healthy');
  });
});

// The same kind of grid the Baseline invariants use.
const PEOPLE = [];
for (const sex of ['male', 'female'])
  for (const age of [22, 45, 68])
    for (const kg of [52, 68, 95])
      for (const cm of [158, 176, 190])
        PEOPLE.push({ sex, age, kg, cm, activity: 'moderate' });

describe('no tool result has a waist-to-height ratio without a waist', () => {
  it(`Healthy Weight (${PEOPLE.length * MISSING.length} cases)`, () => {
    for (const p of PEOPLE) for (const waistCm of MISSING) {
      const r = healthyWeightResult({ ...p, waistCm });
      expect(r.w).toBeNull();
      expect(r.band).toBeNull();
    }
  });

  it('the Baseline', () => {
    let n = 0;
    for (const p of PEOPLE) for (const waistCm of MISSING) {
      const b = computeBaseline({ ...p, waistCm });
      if (b.status !== 'ok') continue;
      expect(b.body.w).toBeNull();
      expect(b.body.band).toBeNull();
      n++;
    }
    expect(n).toBeGreaterThan(100);   // guard: never pass by skipping every case
  });

  it('both still report the ratio and band when a waist is entered', () => {
    for (const p of PEOPLE) {
      const r = healthyWeightResult({ ...p, waistCm: 88 });
      expect(r.w).toBeCloseTo(88 / p.cm, 10);
      expect(r.band).toBe(whtrBand(88 / p.cm));
    }
  });
});
