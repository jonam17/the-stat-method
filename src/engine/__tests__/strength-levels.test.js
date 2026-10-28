/**
 * Strength levels (v2.37.0) — Santos Junior ERT et al., Strength Cond J 2021;43(5):77-86,
 * text p. 4 and Table 1, p. 6. The cut-offs below were typed from the paper a second time,
 * separately from the engine's copy, so an accidental edit to either fails here.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import * as standards from '../standards.js';
import { STRENGTH_CUTOFFS, LIFTS, LEVELS, rateLift } from '../standards.js';

// % of body mass: [intermediate from, advanced from, highly advanced above]
const TABLE_1 = {
  male:   { bench: [60, 100, 120], squat: [80, 120, 150], deadlift: [100, 150, 180] },
  female: { bench: [40, 60, 80],   squat: [60, 100, 130], deadlift: [80, 120, 160] },
};

describe('Santos Junior 2021 strength cut-offs', () => {
  it('match Table 1 of the paper exactly', () => {
    expect(STRENGTH_CUTOFFS).toEqual(TABLE_1);
    expect(LEVELS).toEqual(['Beginner', 'Intermediate', 'Advanced', 'Highly advanced']);
  });

  it('cover only the lifts the paper scores with a barbell', () => {
    expect(LIFTS.map(l => l.key)).toEqual(['squat', 'bench', 'deadlift']);
  });

  it('follow the paper\'s boundaries: 80–119.9 intermediate, 120–150 advanced, more than 150 highly advanced', () => {
    const at = pct => rateLift({ lift: 'squat', sex: 'male', bodyweightKg: 100, oneRmKg: pct }).level;
    expect(at(79.9)).toBe('Beginner');
    expect(at(80)).toBe('Intermediate');
    expect(at(119.9)).toBe('Intermediate');
    expect(at(120)).toBe('Advanced');
    expect(at(150)).toBe('Advanced');
    expect(at(150.1)).toBe('Highly advanced');
  });

  it('reads women against women\'s cut-offs', () => {
    const r = lift => rateLift({ lift, sex: 'female', bodyweightKg: 60, oneRmKg: 60 }).level;
    expect(r('bench')).toBe('Highly advanced');   // 100% > 80%
    expect(r('squat')).toBe('Advanced');          // 100% is 100–130
    expect(r('deadlift')).toBe('Intermediate');   // 100% is 80–119.9
  });

  it('says how far to "more than" the top cut-off', () => {
    const r = rateLift({ lift: 'squat', sex: 'male', bodyweightKg: 80, oneRmKg: 110 });
    expect(r.level).toBe('Advanced');
    expect(r.nextStrict).toBe(true);
    expect(r.nextKg).toBeCloseTo(120, 6);
  });

  it('has no age adjustment, which the paper does not give', () => {
    expect(standards.ageFactor).toBeUndefined();
    const young = rateLift({ lift: 'bench', sex: 'male', bodyweightKg: 80, oneRmKg: 85, age: 25 });
    const old = rateLift({ lift: 'bench', sex: 'male', bodyweightKg: 80, oneRmKg: 85, age: 70 });
    expect(old).toEqual(young);
  });

  it('the article and guide no longer use the old table\'s names or claims', () => {
    for (const f of ['src/content/articles/strength-standards-explained.md', 'src/data/tool-guides.js',
      'src/components/StrengthStandards.jsx', 'src/pages/tools/strength-standards.astro', 'src/data/tools.js']) {
      let body = readFileSync(f, 'utf8').replace(/changelog:[\s\S]*?\nreferences:/, '');
      if (f.endsWith('tool-guides.js')) body = body.slice(body.indexOf("'strength-standards': {"), body.indexOf("'rpe-converter': {"));
      if (f.endsWith('tools.js')) body = body.split('\n').find(l => l.includes("slug: 'strength-standards'")) + body.split("slug: 'strength-standards'")[1].split('\n')[1];
      expect(body, f).not.toMatch(/Untrained|Below untrained|Novice|\bElite\b|Overhead press|late twenties|Age factor/);
    }
  });
});
