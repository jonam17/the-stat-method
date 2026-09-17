import { describe, it, expect } from 'vitest';
import {
  HALF_LIFE, SOURCES, effectiveHalfLife, remainingAt, totalRemaining,
  hoursUntil, decayCurve, dailyIntakeCheck, DAILY_LIMIT,
} from '../caffeine.js';

describe('first-order decay', () => {
  it('halves at exactly one half-life', () => {
    expect(remainingAt(100, 5, 5)).toBeCloseTo(50, 6);
    expect(remainingAt(100, 10, 5)).toBeCloseTo(25, 6);
    expect(remainingAt(100, 15, 5)).toBeCloseTo(12.5, 6);
  });
  it('returns the full dose at t=0', () => {
    expect(remainingAt(95, 0, 5)).toBe(95);
  });
  it('never returns negative or NaN for degenerate input', () => {
    for (const [mg, h, hl] of [[0, 5, 5], [95, -1, 5], [95, 5, 0], [null, 5, 5]]) {
      const v = remainingAt(mg, h, hl);
      expect(Number.isFinite(v)).toBe(true);
      expect(v).toBeGreaterThanOrEqual(0);
    }
  });
});

describe('hoursUntil', () => {
  it('is exact for whole half-lives', () => {
    expect(hoursUntil(200, 50, 5)).toBeCloseTo(10, 6);   // two halvings
    expect(hoursUntil(400, 50, 5)).toBeCloseTo(15, 6);   // three
  });
  it('returns null when already below target', () => {
    expect(hoursUntil(30, 50, 5)).toBeNull();
  });
  it('never returns a finite time for a zero target', () => {
    expect(hoursUntil(100, 0, 5)).toBe(Infinity);
  });
});

describe('multiple doses', () => {
  it('sums independently decaying doses', () => {
    const doses = [{ mg: 100, hoursAgo: 5 }, { mg: 100, hoursAgo: 0 }];
    expect(totalRemaining(doses, 0, 5)).toBeCloseTo(150, 6);   // 50 + 100
  });
  it('is monotonically decreasing over time', () => {
    const doses = [{ mg: 95, hoursAgo: 2 }, { mg: 63, hoursAgo: 0 }];
    const c = decayCurve(doses, effectiveHalfLife('none'), 24);
    for (let i = 1; i < c.length; i++) {
      expect(c[i].typical).toBeLessThanOrEqual(c[i - 1].typical + 1e-9);
    }
  });
  it('the slow-clearance bound always sits above the fast one', () => {
    const c = decayCurve([{ mg: 200, hoursAgo: 0 }], effectiveHalfLife('none'), 24);
    for (const p of c) expect(p.low).toBeGreaterThanOrEqual(p.high - 1e-9);
  });
});

describe('half-life modifiers', () => {
  it('smoking shortens and pregnancy extends', () => {
    expect(effectiveHalfLife('smoker').typical).toBeLessThan(HALF_LIFE.typical);
    expect(effectiveHalfLife('pregnancy').typical).toBeGreaterThan(HALF_LIFE.typical);
    expect(effectiveHalfLife('oc').typical).toBeGreaterThan(HALF_LIFE.typical);
  });
  it('preserves low < typical < high ordering for every modifier', () => {
    for (const k of ['none', 'smoker', 'oc', 'pregnancy', 'liver']) {
      const e = effectiveHalfLife(k);
      expect(e.low).toBeLessThan(e.typical);
      expect(e.typical).toBeLessThan(e.high);
    }
  });
  it('falls back safely on an unknown key', () => {
    expect(effectiveHalfLife('nonsense').typical).toBe(HALF_LIFE.typical);
  });
});

describe('daily intake guidance', () => {
  it('uses the lower limit during pregnancy', () => {
    expect(dailyIntakeCheck(250, 'pregnancy').limit).toBe(DAILY_LIMIT.pregnancy);
    expect(dailyIntakeCheck(250, 'pregnancy').over).toBe(true);
    expect(dailyIntakeCheck(250, 'none').over).toBe(false);
  });
});

describe('source data integrity', () => {
  it('every source has a plausible positive caffeine amount', () => {
    for (const s of SOURCES) {
      expect(s.mg).toBeGreaterThan(0);
      expect(s.mg).toBeLessThan(400);
      expect(s.label.length).toBeGreaterThan(0);
      expect(s.unit.length).toBeGreaterThan(0);
    }
  });
  it('source keys are unique', () => {
    expect(new Set(SOURCES.map(s => s.key)).size).toBe(SOURCES.length);
  });
});
