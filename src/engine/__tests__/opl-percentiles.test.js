/**
 * DOTS / IPF GL percentiles among competition lifters (v2.36.0), from OpenPowerlifting's
 * public-domain data via scripts/opl-percentiles.mjs → src/data/opl-percentiles.json.
 * The JSON is the single copy of the figures: the calculator, the chart, the guide and the
 * article must all agree with it.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { OPL_DATA, OPL_PCTS, scorePosition, dotsParts, ipfGlParts, ipfGl, dots } from '../scoring.js';
import { powerliftingResult } from '../results.js';

const GROUPS = ['men-classic', 'men-equipped', 'women-classic', 'women-equipped'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August',
  'September', 'October', 'November', 'December'];
const longDate = iso => { const [y, m, d] = iso.split('-'); return `${+d} ${MONTHS[+m - 1]} ${y}`; };

describe('the OpenPowerlifting figures', () => {
  it('cover four groups with the eight percentiles, rising', () => {
    for (const set of ['all', 'tested']) for (const g of GROUPS) {
      const grp = OPL_DATA[set][g];
      expect(grp.lifters).toBeGreaterThan(1000);
      for (const sys of ['dots', 'gl']) {
        expect(Object.keys(grp[sys]).map(Number)).toEqual(OPL_PCTS);
        const v = OPL_PCTS.map(p => grp[sys][p]);
        v.slice(1).forEach((x, i) => expect(x).toBeGreaterThan(v[i]));
      }
    }
  });

  it('record a five-year window ending at the latest meet', () => {
    expect(OPL_DATA.window.to).toBe(OPL_DATA.latestMeet);
    expect(+OPL_DATA.window.to.slice(0, 4) - +OPL_DATA.window.from.slice(0, 4)).toBe(5);
  });

  it('show OpenPowerlifting clamps DOTS bodyweight, which is why the engine does', () => {
    for (const sex of ['M', 'F']) {
      const c = OPL_DATA.dotsOutsideRange[sex];
      expect(c.clamped).toBeGreaterThan(100);
      expect(c.unclamped).toBe(0);
      expect(c.neither).toBe(0);
    }
    expect(dots(800, 230, 'male')).toBe(dots(800, 210, 'male'));
  });
});

describe('scorePosition', () => {
  const ctx = { sex: 'male', equipment: 'classic' };
  it('names the bracketing percentiles', () => {
    expect(scorePosition(352.2, 'dots', ctx)).toMatchObject({
      lower: { p: 25, value: 314.8 }, upper: { p: 50, value: 359 } });
  });
  it('reports a value equal to a percentile as that percentile, compared as displayed', () => {
    expect(scorePosition(359.04, 'dots', ctx).at).toEqual({ p: 50, value: 359 });
  });
  it('handles both ends', () => {
    expect(scorePosition(100, 'dots', ctx)).toMatchObject({ lower: null, upper: { p: 5 } });
    expect(scorePosition(700, 'dots', ctx)).toMatchObject({ lower: { p: 99 }, upper: null });
  });
  it('reads women against women and equipped against equipped', () => {
    const w = scorePosition(330, 'dots', { sex: 'female', equipment: 'classic' });
    expect(w).toMatchObject({ lower: { p: 50 }, upper: { p: 75 } });
    expect(scorePosition(330, 'dots', ctx)).toMatchObject({ lower: { p: 25 }, upper: { p: 50 } });
    expect(scorePosition(60, 'gl', { sex: 'male', equipment: 'equipped' }))
      .toMatchObject({ lower: { p: 50 }, upper: { p: 75 } });
  });
  it('gives nothing for bench-only, since the figures are full power', () => {
    expect(scorePosition(352, 'dots', { ...ctx, event: 'bench' })).toBeNull();
    const r = powerliftingResult({ totalKg: 120, bodyweightKg: 82.5, sex: 'male', event: 'bench' });
    expect(r.position.dots).toBeNull();
    expect(r.position.gl).toBeNull();
  });
});

describe('powerliftingResult', () => {
  it('positions the scores it shows', () => {
    const r = powerliftingResult({ totalKg: 520, bodyweightKg: 82.5, sex: 'male' });
    expect(r.position.dots).toEqual(scorePosition(r.primary.value, 'dots', { sex: 'male', equipment: 'classic' }));
    expect(r.position.gl.lower).toEqual({ p: 25, value: 63.9 });
  });
  it('carries the working the page prints, and it reproduces the scores', () => {
    const r = powerliftingResult({ totalKg: 520, bodyweightKg: 82.5, sex: 'male' });
    expect(520 * 500 / r.dots.denom).toBeCloseTo(r.primary.value, 10);
    // the rounded figures shown on the page give the same displayed result
    expect((520 * 500 / +r.dots.denom.toFixed(2)).toFixed(1)).toBe(r.primary.value.toFixed(1));
    expect((520 * 100 / +r.gl.denom.toFixed(2)).toFixed(1)).toBe(r.gl.value.toFixed(1));
    expect(r.gl.value).toBeCloseTo(ipfGl(520, 82.5, 'male', 'classic', 'full'), 10);
  });
  it('flags a clamped bodyweight', () => {
    expect(dotsParts(800, 230, 'male')).toMatchObject({ clamped: 'above', bwUsed: 210 });
    expect(dotsParts(500, 160, 'female')).toMatchObject({ clamped: 'above', bwUsed: 150 });
    expect(dotsParts(300, 35, 'female')).toMatchObject({ clamped: 'below', bwUsed: 40 });
    expect(dotsParts(520, 82.5, 'male').clamped).toBeNull();
    expect(ipfGlParts(500, 80, 'male', 'classic', 'nonsense')).toBeNull();
  });
});

describe('the article and guide quote the same figures', () => {
  const art = readFileSync('src/content/articles/powerlifting-scoring-explained.md', 'utf8');
  it('both article tables equal the data', () => {
    const order = ['men-classic', 'men-equipped', 'women-classic', 'women-equipped'];
    expect(art).toContain('|  | Men, classic | Men, equipped | Women, classic | Women, equipped |');
    const rows = [...art.matchAll(/^\| (5|25|50|75|95)th \| (.*) \|$/gm)];
    expect(rows).toHaveLength(10);
    rows.forEach((m, i) => {
      const sys = i < 5 ? 'dots' : 'gl';
      const nums = m[2].split('|').map(x => +x.trim());
      expect(nums, `${sys} ${m[1]}th`).toEqual(order.map(g => OPL_DATA.all[g][sys][m[1]]));
    });
  });
  it('names the data\'s end date and rounded medians', () => {
    expect(art).toContain(`five years to ${longDate(OPL_DATA.window.to)}`);
    const men = Math.round(OPL_DATA.all['men-classic'].dots[50]);
    const women = Math.round(OPL_DATA.all['women-classic'].dots[50]);
    expect(art).toContain(`about ${men} for men and ${women} for women`);
    expect(Math.round(men - OPL_DATA.all['women-classic'].dots[50])).toBe(43);
    expect(OPL_DATA.all['women-equipped'].dots[50]).toBeGreaterThan(OPL_DATA.all['men-equipped'].dots[50]);
    const guide = readFileSync('src/data/tool-guides.js', 'utf8');
    expect(guide).toContain(`about ${men} DOTS; for women, about ${women}`);
  });
  it('no longer claims federation adoption we have no source for', () => {
    for (const f of ['src/content/articles/powerlifting-scoring-explained.md', 'src/data/tool-guides.js',
      'src/components/PowerliftingScore.jsx', 'src/engine/scoring.js']) {
      const body = readFileSync(f, 'utf8').replace(/changelog:[\s\S]*?\nreferences:/, '');
      expect(body, f).not.toMatch(/USPA|WRPF/);
    }
  });
});
