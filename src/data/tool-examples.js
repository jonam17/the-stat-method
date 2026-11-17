/**
 * What each calculator asks for, what it gives back, and a worked example
 * (roadmap item 11, v2.45.0). Shown on the Tools page, under each calculator.
 *
 * Every example is computed here, at build time, by the same engine function
 * the calculator calls, from the calculator's own starting values, so a
 * visitor who opens the tool sees the same result. No number is typed.
 * __tests__/tool-examples.test.js fails if a live tool has no entry, or if an
 * example stops producing a finite number.
 */
import { tdeeResult, macroResult, healthyWeightResult, ffmiResult, powerliftingResult,
         handPortionsResult, deficitPlanResult } from '../engine/results.js';
import { computeBaseline } from '../engine/baseline.js';
import { bodyFatNavy } from '../engine/body.js';
import { allOneRepMax, loadForRepsRIR, plateLoad } from '../engine/strength.js';
import { maxHrTanaka, heartRateZones, kcalFromMets, findActivity } from '../engine/cardio.js';
import { rateLift } from '../engine/standards.js';
import { toHandPortions, proteinTarget } from '../engine/portions.js';
import { bedtimesForWake } from '../engine/sleep.js';
import { riegel, fmtTime, paceFromTime } from '../engine/pace.js';
import { SOURCES, HALF_LIFE, totalRemaining } from '../engine/caffeine.js';
import { progressionResult } from '../engine/overload.js';
import { AGE_MIN, AGE_MAX } from '../engine/safety.js';

const n = v => Math.round(v).toLocaleString('en-US');
// The strength tools round loads to the nearest 2.5 kg, then show whole numbers.
const kg25 = v => n(Math.round(v / 2.5) * 2.5);
const one = v => (Math.round(v * 10) / 10).toLocaleString('en-US');
const adults = `adults ${AGE_MIN}–${AGE_MAX}`;
const man = 'man, 30, 80 kg, 178 cm';

/** slug -> { enter, get, example: () => ({ inputs, result }) } */
export const TOOL_EXAMPLES = {
  baseline: {
    enter: `sex, age, weight, height, activity; body fat, waist and a goal if you know them · ${adults}`,
    get: 'daily energy, healthy-weight range, and targets once you pick a goal',
    example() {
      const r = computeBaseline({ sex: 'male', age: 30, kg: 80, cm: 178, activity: 'sedentary' });
      const e = r.energy, b = r.body;
      return { inputs: `${man}, sedentary or light`,
        result: `${n(e.preferred.tdee)} kcal/day; healthy-weight range ${n(b.bmiRange.lowKg)}–${n(b.bmiRange.highKg)} kg` };
    },
  },
  'tdee-calculator': {
    enter: `sex, age, weight, height, activity; body fat optional · ${adults}`,
    get: 'daily calories from 5 formulas side by side, with the spread',
    example() {
      const r = tdeeResult({ kg: 80, cm: 178, age: 30, sex: 'male', activity: 'sedentary', bf: null });
      const t = r.formulas.map(f => f.tdee);
      return { inputs: `${man}, sedentary or light`,
        result: `${n(r.preferred.tdee)} kcal/day (${r.preferred.name}); the formulas run ${n(Math.min(...t))}–${n(Math.max(...t))}` };
    },
  },
  'deficit-planner': {
    enter: `current and target weight, a timeline, plus the usual body details · ${adults}`,
    get: 'a daily intake and a week-by-week curve that slows as you lose',
    example() {
      const r = deficitPlanResult({ kg: 90, cm: 178, age: 35, sex: 'male', bf: 25, activity: 'sedentary',
        targetKg: 80, mode: 'date', weeks: 24 });
      return { inputs: 'man, 35, 90 kg → 80 kg in 24 weeks, 25% body fat',
        result: `about ${n(r.dailyIntake)} kcal/day` };
    },
  },
  'macro-calculator': {
    enter: `sex, age, weight, height, activity and goal; body fat optional · ${adults}`,
    get: 'a calorie target split into protein, carbs and fat',
    example() {
      const r = macroResult({ kg: 80, cm: 178, age: 30, sex: 'male', activity: 'sedentary', goal: 'maintain', bf: null });
      return { inputs: `${man}, maintain`,
        result: `${n(r.cals)} kcal: ${n(r.grams.p)} g protein, ${n(r.grams.c)} g carbs, ${n(r.grams.f)} g fat` };
    },
  },
  'hand-portions': {
    enter: 'your macros, or the details to calculate them; meals per day',
    get: 'palms, cupped hands and thumbs per day and per meal',
    example() {
      const m = handPortionsResult({ source: 'calculate', kg: 80, cm: 178, age: 30, sex: 'male', activity: 'sedentary', goal: 'maintain' });
      const h = toHandPortions({ proteinG: m.p, carbsG: m.c, fatG: m.f, sex: 'male' });
      return { inputs: `${man}, maintain`,
        result: `${one(h.protein.whole)} palms protein, ${one(h.carbs.whole)} cupped hands carbs, ${one(h.fat.whole)} thumbs fat a day` };
    },
  },
  'protein-target': {
    enter: 'bodyweight; body fat and whether you are in a deficit, if you are',
    get: 'a daily protein range in grams',
    example() {
      const r = proteinTarget({ kg: 80, lbm: null, deficit: 'none' });
      return { inputs: '80 kg, no deficit', result: `${n(r.lowG)}–${n(r.highG)} g a day` };
    },
  },
  'body-fat': {
    enter: 'tape measurements (neck, waist; hips for women) or skinfolds',
    get: 'body fat % from each method, with its published error',
    example() {
      const v = bodyFatNavy({ sex: 'male', cm: 178, neckCm: 38, waistCm: 85 });
      return { inputs: 'man, 178 cm, neck 38 cm, waist 85 cm', result: `${one(v)}% (U.S. Navy tape method)` };
    },
  },
  ffmi: {
    enter: `weight, height, body fat · ${adults}`,
    get: 'fat-free mass index, and where it sits among men or women your age',
    example() {
      const r = ffmiResult({ kg: 80, cm: 178, bf: 15, sex: 'male', age: 30 });
      return { inputs: `${man}, 15% body fat`, result: `FFMI ${one(r.ffmi)}; lean mass ${one(r.lbm)} kg` };
    },
  },
  'healthy-weight': {
    enter: `height, weight, sex; waist optional · ${adults}`,
    get: 'the healthy-BMI weight range, four formulas, and waist-to-height',
    example() {
      const r = healthyWeightResult({ kg: 80, cm: 178, sex: 'male', waistCm: 85, age: 30 });
      return { inputs: `${man}, waist 85 cm`,
        result: `healthy-BMI range ${n(r.bmiRange.lowKg)}–${n(r.bmiRange.highKg)} kg; waist-to-height ${r.w.toFixed(2)}` };
    },
  },
  'one-rep-max': {
    enter: 'weight lifted and reps completed (most accurate up to 10)',
    get: 'an estimated one-rep max from 5 formulas, and a percentage table',
    example() {
      const r = allOneRepMax(100, 5);
      return { inputs: '100 kg for 5 reps', result: `about ${kg25(r.mean)} kg (formulas ${kg25(r.min)}–${kg25(r.max)})` };
    },
  },
  'powerlifting-score': {
    enter: 'sex, bodyweight, equipment, and your squat, bench and deadlift',
    get: 'DOTS and IPF GL points, with Wilks shown as legacy',
    example() {
      const r = powerliftingResult({ totalKg: 180 + 120 + 220, bodyweightKg: 82.5, sex: 'male' });
      return { inputs: 'man, 82.5 kg, 520 kg total (raw)',
        result: `DOTS ${one(r.primary.value)}; IPF GL ${one(r.scores.find(s => s.key === 'ipfgl').value)}` };
    },
  },
  'strength-standards': {
    enter: 'sex, bodyweight, the lift, and your one-rep max',
    get: 'your level among four published standards, and what the next one takes',
    example() {
      const r = rateLift({ lift: 'squat', sex: 'male', bodyweightKg: 80, oneRmKg: 140 });
      return { inputs: 'man, 80 kg, squat 140 kg',
        result: `${r.multiple.toFixed(2)}× bodyweight: ${r.level}${r.nextLevel ? `; ${n(r.toNextKg)} kg more for ${r.nextLevel}` : ''}` };
    },
  },
  'rpe-converter': {
    enter: 'your one-rep max, target reps and reps in reserve (or a load, to find RPE)',
    get: 'the working weight for that effort',
    example() {
      const kg = loadForRepsRIR(150, 5, 2);
      return { inputs: '150 kg max, 5 reps with 2 in reserve (RPE 8)', result: `about ${kg25(kg)} kg` };
    },
  },
  'plate-loader': {
    enter: 'target weight, bar weight, and your plates',
    get: 'what goes on each side, and a warm-up ramp',
    example() {
      const r = plateLoad(100, 20, [25, 20, 15, 10, 5, 2.5, 1.25]);
      return { inputs: '100 kg on a 20 kg bar', result: `per side: ${r.perSide.map(p => (p.count > 1 ? `${p.count} × ` : '') + `${p.plate}`).join(' + ')} kg` };
    },
  },
  'progressive-overload': {
    enter: 'the load, your reps in each set, reps in reserve, technique and pain',
    get: 'next session: add load, add reps, hold or back off, with the rule used',
    example() {
      const r = progressionResult({ cls: 'large_compound', goal: 'strength', unit: 'lb', load: 185, increment: 5,
        repMin: 3, repMax: 8, sets: [8, 8, 8], rir: 2, technique: 'maintained', pain: 'none', previous: null });
      return { inputs: '185 lb, 3 sets of 8, 2 in reserve, strength goal',
        result: `${r.headline.replace(/\.$/, '')}: ${n(r.recommendedLoad)} lb` };
    },
  },
  'heart-rate-zones': {
    enter: `age and resting heart rate · ${adults}`,
    get: 'five ACSM intensity zones in beats per minute',
    example() {
      const max = maxHrTanaka(30);
      const z = heartRateZones(max, 60).find(x => x.key === 'moderate');
      return { inputs: 'age 30, resting 60 bpm', result: `max ${n(max)} bpm; moderate zone ${n(z.lowBpm)}–${n(z.highBpm)} bpm` };
    },
  },
  'calories-burned': {
    enter: 'bodyweight, an activity, and how long',
    get: 'a rough calorie estimate from the 2024 Compendium',
    example() {
      const a = findActivity('Running, 9.7–10.1 km/h');
      return { inputs: '80 kg, 30 minutes running at 10 km/h', result: `about ${n(kcalFromMets(a.mets, 80, 30))} kcal` };
    },
  },
  'running-pace': {
    enter: 'a distance and your finish time',
    get: 'pace, splits, and predicted times for other distances',
    example() {
      const half = riegel(50 * 60, 10, 21.0975);
      return { inputs: '10K in 50:00', result: `${fmtTime(paceFromTime(50 * 60, 10))} per km; predicted half marathon ${fmtTime(half)}` };
    },
  },
  'sleep-calculator': {
    enter: `the time you need to wake (or go to bed), and your age · ${adults}`,
    get: 'bedtimes or wake times that fall on a sleep-cycle boundary',
    example() {
      const wake = new Date(2026, 0, 1, 7, 0);
      const best = bedtimesForWake(wake).find(x => x.cycles === 5);
      const h = best.bedtime.getHours(), m = String(best.bedtime.getMinutes()).padStart(2, '0');
      return { inputs: 'wake at 7:00 am', result: `bed at ${h % 12 || 12}:${m} ${h < 12 ? 'am' : 'pm'} for 5 cycles (7h 30m of sleep)` };
    },
  },
  'caffeine-half-life': {
    enter: 'what you drank and when, your bedtime, and anything that slows clearance',
    get: 'how much caffeine is left at bedtime, and when it drops below your limit',
    example() {
      const mg = SOURCES.find(s => s.key === 'filter').mg;
      const left = totalRemaining([{ mg, hoursAgo: 0 }], 15, HALF_LIFE.typical);
      return { inputs: `one brewed coffee (${mg} mg) at 8:00 am, bed at 11:00 pm`, result: `about ${n(left)} mg left at bedtime` };
    },
  },
};

/** The example for a slug, computed; null if the tool has none. */
export function toolExample(slug) {
  const e = TOOL_EXAMPLES[slug];
  return e ? { enter: e.enter, get: e.get, ...e.example() } : null;
}
