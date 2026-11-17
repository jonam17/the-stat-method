/**
 * Tool examples (roadmap item 11): every live calculator has a "You enter / You get"
 * line and a worked example, and every example is a real engine result.
 */
import { describe, it, expect } from 'vitest';
import { liveTools } from '../../data/tools.js';
import { TOOL_EXAMPLES, toolExample } from '../../data/tool-examples.js';

const live = liveTools().filter(t => t.slug);

describe('tool examples', () => {
  it('every live calculator has one, and nothing else does', () => {
    expect(Object.keys(TOOL_EXAMPLES).sort()).toEqual(live.map(t => t.slug).sort());
  });

  for (const t of live) {
    it(`${t.slug}: computes a result with real numbers`, () => {
      const e = toolExample(t.slug);
      expect(e.enter.length).toBeGreaterThan(10);
      expect(e.get.length).toBeGreaterThan(10);
      expect(e.inputs.length).toBeGreaterThan(3);
      // A number, and never the signs of a failed calculation.
      expect(e.result).toMatch(/\d/);
      expect(e.result).not.toMatch(/NaN|Infinity|undefined|null|—/);
    });
  }

  it('matches the calculators: same rounding and starting values', () => {
    // Spot checks against what the tools show when they open (v2.45.0 preview check).
    expect(toolExample('one-rep-max').result).toBe('about 115 kg (formulas 113–118)');
    expect(toolExample('rpe-converter').result).toBe('about 123 kg');
    expect(toolExample('healthy-weight').result).toContain('59–79 kg');
    expect(toolExample('sleep-calculator').result).toContain('11:15 pm');
  });
});
