/**
 * Chart data for articles.
 *
 * Two kinds, and every chart says which it is in its caption:
 *
 *   ENGINE — computed at build time by the same tested functions the
 *   calculators use. The chart cannot contradict the tool, because they are the
 *   same code; correct a formula and its chart corrects itself on the next build.
 *
 *   PAPER — the figures a study reports, cited like any other claim. Recreated
 *   from the numbers, never copied from the published figure.
 *
 * Every input that shapes an ENGINE chart is stated in its caption, so a reader
 * can reproduce the numbers in the calculator.
 */
import { ONE_RM_FORMULAS } from '../engine/strength.js';
import { simulate, staticSeries } from '../engine/planner.js';
import { remainingAt, SOURCES } from '../engine/caffeine.js';

const range = (a, b, step = 1) => Array.from({ length: Math.floor((b - a) / step) + 1 }, (_, i) => a + i * step);

export const CHARTS = {
  'one-rm-divergence': () => {
    const LIFTED = 100;
    const reps = range(1, 12);
    const at = r => ONE_RM_FORMULAS.map(f => f.fn(LIFTED, r)).filter(v => v != null);
    const spread = r => { const v = at(r); return Math.round(Math.max(...v) - Math.min(...v)); };
    return {
      kind: 'engine',
      title: 'Five one-rep-max formulas, from the same set',
      desc: `Estimated one-rep max from lifting ${LIFTED} kg for 1 to 12 reps, by formula. ` +
        'The estimates agree closely at low reps and spread apart as reps rise.',
      caption: `Every line is the same lift of ${LIFTED} kg. At one rep the formulas agree to ` +
        `within ${spread(1)} kg; by twelve reps they disagree by ${spread(12)} kg.`,
      x: { label: 'Reps performed', values: reps },
      y: { label: 'Estimated 1RM (kg)' },
      series: ONE_RM_FORMULAS.map(f => ({
        name: f.name,
        values: reps.map(r => { const v = f.fn(LIFTED, r); return v == null ? null : +v.toFixed(1); }),
      })),
    };
  },

  'static-vs-dynamic': () => {
    const INPUT = { kg: 90, cm: 180, age: 35, sex: 'male', activityFactor: 1.55, intakeKcal: 2092, days: 168 };
    const sim = simulate(INPUT);
    const st = staticSeries({ startKg: INPUT.kg, startTdee: sim.startTdee,
      intakeKcal: INPUT.intakeKcal, series: sim.series });
    const weeks = sim.series.map(p => p.week);
    return {
      kind: 'engine',
      title: 'The 3,500-calorie rule against a model that adapts',
      desc: 'Projected bodyweight over 24 weeks at a fixed intake. The static rule falls in a ' +
        'straight line; the dynamic model slows as expenditure falls.',
      caption: `A 35-year-old man, ${INPUT.cm} cm, starting at ${INPUT.kg} kg, moderately active, ` +
        `eating ${INPUT.intakeKcal.toLocaleString('en-US')} kcal a day. After 24 weeks the static rule ` +
        `predicts ${st.at(-1).kg.toFixed(1)} kg and the dynamic model ${sim.finalKg.toFixed(1)} kg — ` +
        `a gap of ${(sim.finalKg - st.at(-1).kg).toFixed(1)} kg, all of it loss the rule promised ` +
        'and the body did not deliver.',
      x: { label: 'Week', values: weeks },
      y: { label: 'Bodyweight (kg)' },
      series: [
        { name: 'Static 3,500-kcal rule', values: st.map(p => +p.kg.toFixed(2)) },
        { name: 'Dynamic model', values: sim.series.map(p => +p.kg.toFixed(2)) },
      ],
    };
  },

  'caffeine-half-lives': () => {
    const DOSE = 200;
    const hours = range(0, 24);
    const lives = [3, 5, 7];
    return {
      kind: 'engine',
      title: 'The same coffee, three different people',
      desc: `Caffeine remaining after a ${DOSE} mg dose over 24 hours, at half-lives of ` +
        `${lives.join(', ')} hours.`,
      caption: `A single ${DOSE} mg dose — about ${(DOSE / SOURCES.find(x => x.key === 'filter').mg).toFixed(0)} ` +
        `cups of filter coffee — at three half-lives ` +
        'within the ordinary range for healthy adults. Twelve hours later the fast clearer has ' +
        `${remainingAt(DOSE, 12, 3).toFixed(0)} mg left, the slow clearer ` +
        `${remainingAt(DOSE, 12, 7).toFixed(0)} mg.`,
      x: { label: 'Hours after drinking', values: hours },
      y: { label: 'Caffeine remaining (mg)' },
      series: lives.map(h => ({
        name: `${h}-hour half-life`,
        values: hours.map(t => +remainingAt(DOSE, t, h).toFixed(1)),
      })),
    };
  },
};
