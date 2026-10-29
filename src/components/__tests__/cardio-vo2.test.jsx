/**
 * Heart Rate Zones shows a VO2 max only from a Cooper 12-minute distance.
 *
 * Until v2.38.0 it also showed one from the resting/max heart-rate ratio (Uth et al. 2004),
 * by default, to everyone. That method was derived in 46 well-trained men aged 21–51, and with
 * the age-predicted maximum the calculator uses, its 95% limits for one person are about ±15%.
 * It was removed (decided 2026-10-28); see the VO2 max article's review record. This test keeps
 * a VO2 max figure from reappearing at the default inputs, where no distance has been entered.
 */
import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'preact/compat/server';
import CardioCalculator from '../CardioCalculator.jsx';
import * as engine from '../../engine/index.js';

describe('Heart Rate Zones — VO2 max only from a Cooper distance', () => {
  it('shows no VO2 max figure or note at the default inputs', () => {
    const html = renderToStaticMarkup(<CardioCalculator />);
    expect(html).toContain('VO₂ max');          // the stat cell is still there…
    expect(html).not.toContain('mL/kg/min');     // …but empty: no unit, no figure
    expect(html).not.toContain('Cooper\'s 1968 equation');
    expect(html).not.toMatch(/heart rate ratio|Resting\/max heart rate/i);
  });

  it('the heart-rate-ratio estimator is gone from the engine', () => {
    expect(engine.vo2maxFromHr).toBeUndefined();
  });
});
