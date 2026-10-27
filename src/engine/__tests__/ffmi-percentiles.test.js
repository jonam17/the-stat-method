/**
 * FFMI percentiles (v2.35.0) — Schutz Y, Kyle UUG, Pichard C, Int J Obes 2002;26:953-960,
 * Table 2, p. 955. The values below were typed from the paper a second time, separately
 * from the engine's copy, so an accidental edit to either fails here.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { FFMI_PERCENTILES, FFMI_PCTS, ffmiAgeGroup, ffmiPosition, ffmiNormalised } from '../body.js';
import { ffmiResult } from '../results.js';

const TABLE_2 = {
  male: {
    '18–34': [16.8, 17.2, 18.0, 18.9, 19.8, 20.5, 21.1],
    '35–54': [17.2, 17.6, 18.3, 19.2, 20.1, 21.1, 21.7],
    '55–74': [17.0, 17.6, 18.4, 19.4, 20.3, 21.1, 22.1],
    '75+':   [16.6, 16.9, 17.6, 18.5, 19.4, 20.9, 21.2],
  },
  female: {
    '18–34': [13.8, 14.1, 14.7, 15.4, 16.2, 17.1, 17.6],
    '35–54': [14.4, 14.7, 15.3, 15.9, 16.7, 17.5, 18.0],
    '55–74': [14.1, 14.6, 15.4, 16.2, 17.4, 18.4, 19.0],
    '75+':   [12.9, 13.7, 14.7, 15.9, 17.0, 18.1, 18.7],
  },
};

describe('Schutz 2002 FFMI percentiles', () => {
  it('match Table 2 of the paper exactly', () => {
    expect(FFMI_PCTS).toEqual([5, 10, 25, 50, 75, 90, 95]);
    expect(FFMI_PERCENTILES).toEqual(TABLE_2);
  });

  it('rise with each percentile in every row', () => {
    for (const sex of Object.values(FFMI_PERCENTILES))
      for (const row of Object.values(sex))
        row.slice(1).forEach((v, i) => expect(v).toBeGreaterThan(row[i]));
  });

  it('use the table\'s age groups', () => {
    expect(ffmiAgeGroup(17)).toBeNull();
    expect(ffmiAgeGroup(18)).toBe('18–34');
    expect(ffmiAgeGroup(34)).toBe('18–34');
    expect(ffmiAgeGroup(35)).toBe('35–54');
    expect(ffmiAgeGroup(54)).toBe('35–54');
    expect(ffmiAgeGroup(55)).toBe('55–74');
    expect(ffmiAgeGroup(74)).toBe('55–74');
    expect(ffmiAgeGroup(75)).toBe('75+');
    expect(ffmiAgeGroup(99)).toBe('75+');
  });
});

describe('position among the percentiles', () => {
  it('names the bracketing percentiles, never an interpolated one', () => {
    const p = ffmiPosition(19.0, 'male', 30);
    expect(p.lower).toEqual({ p: 50, value: 18.9 });
    expect(p.upper).toEqual({ p: 75, value: 19.8 });
  });

  it('reports a value equal to a percentile as that percentile', () => {
    expect(ffmiPosition(18.9, 'male', 30).at).toEqual({ p: 50, value: 18.9 });
    expect(ffmiPosition(18.94, 'male', 30).at).toEqual({ p: 50, value: 18.9 });   // compared as displayed
  });

  it('handles both ends', () => {
    expect(ffmiPosition(21.5, 'male', 30)).toMatchObject({ lower: { p: 95, value: 21.1 }, upper: null });
    expect(ffmiPosition(13.0, 'female', 25)).toMatchObject({ lower: null, upper: { p: 5, value: 13.8 } });
  });

  it('reads women against women\'s values', () => {
    // 16.0 is below the men's 5th percentile but between the women's 50th and 75th.
    expect(ffmiPosition(16.0, 'male', 30)).toMatchObject({ lower: null });
    expect(ffmiPosition(16.0, 'female', 30)).toMatchObject({ lower: { p: 50 }, upper: { p: 75 } });
  });

  it('returns nothing without an adult age, a sex or an FFMI', () => {
    expect(ffmiPosition(20, 'male', 16)).toBeNull();
    expect(ffmiPosition(20, undefined, 30)).toBeNull();
    expect(ffmiPosition(null, 'male', 30)).toBeNull();
  });
});

describe('the calculator compares plain FFMI, not the height-adjusted figure', () => {
  it('positions the raw value', () => {
    // 165 cm moves the normalised figure up by about 0.9, enough to change the bracket.
    const r = ffmiResult({ kg: 70, cm: 165, bf: 20, sex: 'male', age: 30 });
    expect(r.norm - r.ffmi).toBeGreaterThan(0.8);
    expect(r.position).toEqual(ffmiPosition(r.ffmi, 'male', 30));
    expect(r.position).not.toEqual(ffmiPosition(r.norm, 'male', 30));
    expect(r.norm).toBeCloseTo(ffmiNormalised(r.ffmi, 165), 10);
  });
});

describe('the FFMI explained article shows the same numbers', () => {
  it('its two tables equal the engine\'s values', () => {
    const art = readFileSync('src/content/articles/ffmi-explained.md', 'utf8');
    const rows = [...art.matchAll(/^\| (18–34|35–54|55–74|75 and over) \| (.*) \|$/gm)];
    expect(rows).toHaveLength(8);
    const shown = [5, 25, 50, 75, 95].map(p => FFMI_PCTS.indexOf(p));
    rows.forEach((m, i) => {
      const sex = i < 4 ? 'male' : 'female';
      const group = m[1] === '75 and over' ? '75+' : m[1];
      const nums = m[2].split('|').map(x => +x.trim());
      expect(nums, `${sex} ${group}`).toEqual(shown.map(k => FFMI_PERCENTILES[sex][group][k]));
    });
  });
});
