/**
 * v2.38.3 — item 45, batch 1. BMI categories follow the CDC (adults 20 and older), waist-to-height
 * bands follow Ashwell & Gibson 2016, and the atypical-anorexia caveat is keyed on the BMI band, not
 * on its label's wording (it silently stopped showing when "Normal weight" became "Healthy weight").
 */
import { describe, it, expect } from 'vitest';
import { bmiCategory, bmiBand, whtrBand, BMI_CATEGORY_MIN_AGE } from '../body.js';
import { healthyWeightResult } from '../results.js';

describe('BMI categories (CDC)', () => {
  it('uses the CDC boundaries, lower bound inclusive', () => {
    expect(bmiCategory(18.49, 30)).toBe('Underweight');
    expect(bmiCategory(18.5, 30)).toBe('Healthy weight');
    expect(bmiCategory(24.99, 30)).toBe('Healthy weight');
    expect(bmiCategory(25, 30)).toBe('Overweight');
    expect(bmiCategory(30, 30)).toBe('Class 1 obesity');
    expect(bmiCategory(35, 30)).toBe('Class 2 obesity');
    expect(bmiCategory(40, 30)).toBe('Class 3 obesity');
    expect(bmiCategory(65, 30)).toBe('Class 3 obesity');
  });

  it('gives no category under 20, where the CDC uses percentiles', () => {
    expect(BMI_CATEGORY_MIN_AGE).toBe(20);
    expect(bmiCategory(22, 18)).toBeNull();
    expect(bmiCategory(22, 19)).toBeNull();
    expect(bmiCategory(22, 20)).toBe('Healthy weight');
  });

  it('has no band without a usable BMI', () => {
    expect(bmiBand(0)).toBeNull();
    expect(bmiBand(NaN)).toBeNull();
  });
});

describe('waist-to-height bands (Ashwell & Gibson 2016)', () => {
  it('has three bands at 0.5 and 0.6 and no lower band', () => {
    expect(whtrBand(0.35).label).toBe('No increased risk');
    expect(whtrBand(0.4999).label).toBe('No increased risk');
    expect(whtrBand(0.5).label).toBe('Increased risk');
    expect(whtrBand(0.5999).label).toBe('Increased risk');
    expect(whtrBand(0.6).label).toBe('Very high risk');
    expect(whtrBand(0.9).label).toBe('Very high risk');
  });
});

describe('Healthy Weight result', () => {
  const base = { kg: 70, cm: 175, sex: 'male', waistCm: null };

  it('shows the atypical-anorexia caveat for a BMI in the healthy band', () => {
    const r = healthyWeightResult({ ...base, age: 30 });
    expect(r.category).toBe('Healthy weight');
    expect(r.caveats).toContain('normalLabelCaveat');
  });

  it('keeps that caveat under 20, because the healthy range is still shown', () => {
    const r = healthyWeightResult({ ...base, age: 19 });
    expect(r.category).toBeNull();
    expect(r.caveats).toContain('normalLabelCaveat');
  });

  it('does not show it outside the healthy band', () => {
    const r = healthyWeightResult({ ...base, kg: 85, age: 30 });
    expect(r.category).toBe('Overweight');
    expect(r.caveats).toEqual(['categoryCaveat']);
  });
});
