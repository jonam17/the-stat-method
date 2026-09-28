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
import { maxHrFox, maxHrTanaka, maxHrGulati } from '../engine/cardio.js';
import { idealWeightFormulas, ffmi, bmi, lbmFromBodyFat,
         bodyFatNavy, bodyFatDeurenberg, bodyFatSkinfold3, BODY_FAT_ERROR } from '../engine/body.js';
import { allBmrFormulas } from '../engine/energy.js';
import { percentFromRIR } from '../engine/strength.js';
import { dots, wilks } from '../engine/scoring.js';

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
  'max-hr-formulas': () => {
    const ages = range(20, 80, 5);
    const gap = a => Math.abs(maxHrFox(a) - maxHrTanaka(a));
    return {
      kind: 'engine',
      title: 'Three maximum heart rate formulas, by age',
      desc: 'Estimated maximum heart rate from age 20 to 80 using 220 minus age, Tanaka, and Gulati.',
      caption: `“220 minus age” and Tanaka agree at 40, then drift apart in both directions — ` +
        `${gap(20).toFixed(0)} beats at 20 and ${gap(80).toFixed(0)} at 80. Gulati is derived from ` +
        'women and sits lower throughout.',
      x: { label: 'Age', values: ages },
      y: { label: 'Max heart rate (bpm)' },
      series: [
        { name: '220 − age', values: ages.map(a => +maxHrFox(a).toFixed(1)) },
        { name: 'Tanaka', values: ages.map(a => +maxHrTanaka(a).toFixed(1)) },
        { name: 'Gulati (women)', values: ages.map(a => +maxHrGulati(a).toFixed(1)) },
      ],
    };
  },

  'ideal-weight-formulas': () => {
    const heights = range(155, 200, 5);
    const sets = heights.map(cm => idealWeightFormulas({ cm, sex: 'male' }));
    const names = sets[0].map(f => f.name);
    const spread = i => { const v = sets[i].map(f => f.value); return (Math.max(...v) - Math.min(...v)).toFixed(0); };
    return {
      kind: 'engine',
      title: 'Four “ideal weight” formulas, by height',
      desc: 'Ideal bodyweight for men from 155 to 200 cm under the Devine, Robinson, Miller and Hamwi formulas.',
      caption: `Men, 155 to 200 cm. The formulas disagree by ${spread(0)} kg at the shortest height ` +
        `and ${spread(heights.length - 1)} kg at the tallest — and none accounts for how much of a ` +
        'person is muscle.',
      x: { label: 'Height (cm)', values: heights },
      y: { label: 'Ideal weight (kg)' },
      series: names.map((name, k) => ({ name, values: sets.map(set => +set[k].value.toFixed(1)) })),
    };
  },

  'bmr-equations': () => {
    const BASE = { cm: 178, age: 35, sex: 'male' }, BF = 20;
    const weights = range(60, 120, 5);
    const sets = weights.map(kg => allBmrFormulas({ ...BASE, kg, lbm: lbmFromBodyFat(kg, BF) }));
    const names = sets[0].map(f => f.name);
    const spread = i => { const v = sets[i].map(f => f.value); return (Math.max(...v) - Math.min(...v)).toFixed(0); };
    return {
      kind: 'engine',
      title: 'Five BMR equations, by bodyweight',
      desc: 'Estimated basal metabolic rate from 60 to 120 kg under five published equations.',
      caption: `A 35-year-old man, ${BASE.cm} cm, at ${BF}% body fat throughout. The equations ` +
        `disagree by ${spread(0)} kcal a day at 60 kg and ${spread(weights.length - 1)} kcal at ` +
        '120 kg — which is why the calculator shows them all rather than one confident number.',
      x: { label: 'Bodyweight (kg)', values: weights },
      y: { label: 'BMR (kcal/day)' },
      series: names.map((name, k) => ({ name, values: sets.map(set => Math.round(set[k].value)) })),
    };
  },

  'bmi-vs-ffmi': () => {
    const KG = 80, CM = 178;
    const bfs = range(8, 36, 2);
    const f = bf => ffmi(lbmFromBodyFat(KG, bf), CM);
    return {
      kind: 'engine',
      title: 'Same weight, different bodies: BMI against FFMI',
      desc: `BMI and fat-free mass index for a person weighing ${KG} kg at ${CM} cm, as body fat ` +
        'rises from 8% to 36%.',
      caption: `Everyone here weighs ${KG} kg at ${CM} cm, so their BMI is identical — ` +
        `${bmi(KG, CM).toFixed(1)} at every body fat level. FFMI falls from ${f(8).toFixed(1)} to ` +
        `${f(36).toFixed(1)}, because it measures the lean mass BMI cannot see.`,
      x: { label: 'Body fat (%)', values: bfs },
      y: { label: 'Index (kg/m²)' },
      series: [
        { name: 'BMI', values: bfs.map(() => +bmi(KG, CM).toFixed(2)) },
        { name: 'FFMI', values: bfs.map(bf => +f(bf).toFixed(2)) },
      ],
    };
  },

  'rpe-load': () => {
    const reps = range(1, 12);
    const rpes = [10, 9, 8, 7, 6];
    return {
      kind: 'engine',
      title: 'Load for each rep count, by RPE',
      desc: 'Percentage of one-rep max for 1 to 12 reps at RPE 10 down to RPE 6.',
      caption: 'Each line is an effort level. RPE 10 is a set taken to failure; RPE 6 leaves about ' +
        `four reps in the tank. For three reps, that is the difference between ` +
        `${percentFromRIR(3, 0).toFixed(0)}% and ${percentFromRIR(3, 4).toFixed(0)}% of your one-rep max.`,
      x: { label: 'Reps', values: reps },
      y: { label: 'Load (% of 1RM)' },
      series: rpes.map(rpe => ({
        name: `RPE ${rpe}`,
        values: reps.map(r => +(percentFromRIR(r, 10 - rpe) ?? NaN).toFixed(1)),
      })),
    };
  },

  'dots-wilks-gap': () => {
    // Lines cover each sex's competition weights only. The lightest IPF open
    // classes are 59 kg for men and 47 kg for women; DOTS clamps women at
    // 150 kg, so points beyond it would show the clamp rather than the formula.
    // An earlier version plotted men down to 40 kg and read "divergence at the
    // light end" off weights nobody competes at. Do not widen these ranges.
    const bws = range(50, 185, 5);
    const MEN = [59, 185], WOMEN = [47, 150];
    const inR = (bw, [a, b]) => bw >= a && bw <= b;
    // Both scores are the total times a bodyweight coefficient, so the gap
    // depends on bodyweight alone. Any total gives the same line.
    const gap = (bw, sex) => ((wilks(500, bw, sex) - dots(500, bw, sex)) / dots(500, bw, sex)) * 100;
    const at = (bw, sex) => Math.abs(gap(bw, sex)).toFixed(1);
    const menMid = Math.max(...range(59, 120).map(b => Math.abs(gap(b, 'male')))).toFixed(1);
    const wPeak = range(WOMEN[0], WOMEN[1]).reduce((a, b) => Math.abs(gap(b, 'female')) > Math.abs(gap(a, 'female')) ? b : a);
    return {
      kind: 'engine',
      title: 'How far Wilks and DOTS disagree, by bodyweight',
      desc: 'Percentage difference between Wilks and DOTS scores across competition bodyweights, for men and women.',
      caption: `The gap depends on bodyweight alone, not the total. Each line covers that sex's ` +
        `competition weights: men from ${MEN[0]} kg, women from ${WOMEN[0]} kg. For men the formulas ` +
        `stay within ${menMid}% of each other up to 120 kg, then separate among super-heavyweights — ` +
        `${at(145, 'male')}% at 145 kg and ${at(185, 'male')}% at 185 kg. For women the widest gap, ` +
        `about ${at(wPeak, 'female')}%, falls around ${wPeak} kg.`,
      x: { label: 'Bodyweight (kg)', values: bws },
      y: { label: 'Wilks minus DOTS (%)' },
      series: [
        { name: 'Men', values: bws.map(bw => inR(bw, MEN) ? +gap(bw, 'male').toFixed(2) : null) },
        { name: 'Women', values: bws.map(bw => inR(bw, WOMEN) ? +gap(bw, 'female').toFixed(2) : null) },
      ],
    };
  },

  'body-fat-methods': () => {
    const P = { sex: 'male', age: 35, kg: 85, cm: 180 };
    const est = {
      navy: bodyFatNavy({ sex: P.sex, cm: P.cm, neckCm: 38, waistCm: 92 }),
      deurenberg: bodyFatDeurenberg(P),
      skinfold: bodyFatSkinfold3({ sex: P.sex, age: P.age, s1: 14, s2: 22, s3: 16 }),
    };
    const v = Object.values(est);
    const iv = Object.entries(est).map(([k, e]) => [e - BODY_FAT_ERROR[k].plusMinus, e + BODY_FAT_ERROR[k].plusMinus]);
    const allOverlap = iv.every(([a1, b1], i) => iv.every(([a2, b2], j) => i === j || (a1 <= b2 && a2 <= b1)));
    return {
      type: 'interval', kind: 'engine',
      title: 'Three body-fat methods, one person',
      desc: 'Body fat estimates from the Navy tape, Deurenberg and skinfold methods, each with its published error margin.',
      caption: `A 35-year-old man, ${P.cm} cm and ${P.kg} kg: neck 38 cm and waist 92 cm for the tape, ` +
        'skinfolds of 14, 22 and 16 mm. The three point estimates span ' +
        `${(Math.max(...v) - Math.min(...v)).toFixed(1)} percentage points` +
        (allOverlap ? ', and every pair of error margins overlaps — none of them is the true number.'
                    : '. Not every error margin overlaps, so at least one method is off by more than its stated error.'),
      x: { label: 'Body fat (%)', digits: 1 },
      rows: Object.entries(est).map(([k, e]) => ({
        label: BODY_FAT_ERROR[k].label,
        low: +(e - BODY_FAT_ERROR[k].plusMinus).toFixed(1),
        high: +(e + BODY_FAT_ERROR[k].plusMinus).toFixed(1),
        point: +e.toFixed(1),
      })),
    };
  },

  'protein-breakpoint': () => ({
    type: 'interval', kind: 'paper', source: 'Morton et al. (2018)',
    title: 'The “1.6 g/kg” figure, and how wide it really is',
    desc: 'The protein intake breakpoint reported by Morton and colleagues, with its 95% confidence interval, against the official daily allowance.',
    caption: 'Both figures are per kilogram of bodyweight. The widely quoted 1.62 g/kg is the centre ' +
      'of a 95% confidence interval running from 1.03 to 2.20 — and the breakpoint itself fell short ' +
      'of statistical significance. The lean-mass figures elsewhere in this article use a different ' +
      'denominator and are deliberately left off this axis.',
    x: { label: 'Protein (g per kg bodyweight per day)', min: 0, max: 2.5, digits: 2 },
    rows: [
      { label: 'Official daily allowance', low: 0.8, high: 0.8, point: 0.8 },
      { label: 'Morton 2018 breakpoint', low: 1.03, high: 2.20, point: 1.62 },
    ],
  }),
};
