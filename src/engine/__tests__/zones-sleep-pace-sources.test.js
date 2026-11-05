/**
 * Item 45, batch 4 (v2.38.7): the figures below are copied from the sources as read, so a
 * change to any of them has to be a deliberate change to this file too.
 *   ACSM: Garber et al., Med Sci Sports Exerc 2011;43(7):1334-59, Table 5.
 *   NSF:  Hirshkowitz et al., Sleep Health 2015;1:40-43, Table 2.
 *   Cycle: Patel et al., "Physiology, Sleep Stages", StatPearls, updated 26 Jan 2024.
 *   Riegel: Vickers & Vertosick, BMC Sports Sci Med Rehabil 2016;8:26.
 */
import { describe, it, expect } from 'vitest';
import { HR_ZONES } from '../cardio.js';
import { NSF_ADULT, CYCLE_MINUTES, nsfCategory } from '../sleep.js';
import { riegelConfidence } from '../pace.js';

describe('ACSM Table 5 intensity classes', () => {
  it('has the five classes in ACSM order', () => {
    expect(HR_ZONES.map(z => z.name))
      .toEqual(['Very light', 'Light', 'Moderate', 'Vigorous', 'Near-maximal to maximal']);
  });
  it('uses the %HRR lower bounds 30, 40, 60, 90', () => {
    expect(HR_ZONES.map(z => z.hrr)).toEqual([0, 0.30, 0.40, 0.60, 0.90]);
  });
  it('uses the separate %HRmax lower bounds 57, 64, 77, 96', () => {
    expect(HR_ZONES.map(z => z.max)).toEqual([0, 0.57, 0.64, 0.77, 0.96]);
  });
  it('carries ACSM\'s RPE ranges', () => {
    expect(HR_ZONES.map(z => z.effort.match(/RPE [^)]+/)[0]))
      .toEqual(['RPE under 9', 'RPE 9–11', 'RPE 12–13', 'RPE 14–17', 'RPE 18 and up']);
  });
});

describe('NSF Table 2, adults', () => {
  it('matches the recommended and limit hours', () => {
    expect(NSF_ADULT.map(g => [g.maxAge, g.recommended, g.notBelow, g.notAbove])).toEqual([
      [25, [7, 9], 6, 11],
      [64, [7, 9], 6, 10],
      [200, [7, 8], 5, 9],
    ]);
  });
  it('puts 6 hours in "may be appropriate" for adults and 5 to 6 for 65 and over', () => {
    expect(nsfCategory(6, 40)).toBe('may');
    expect(nsfCategory(5, 70)).toBe('may');
    expect(nsfCategory(5, 40)).toBe('not');
  });
});

describe('cycle length', () => {
  it('is StatPearls\' 90-minute average', () => expect(CYCLE_MINUTES).toBe(90));
});

describe('Riegel note', () => {
  it('quotes Vickers on the marathon', () => {
    expect(riegelConfidence(10, 42.195).note).toMatch(/2,303 recreational runners.*at least 10 minutes too fast for half/);
  });
});
