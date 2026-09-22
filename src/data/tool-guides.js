/**
 * Per-tool explanatory content.
 *
 *  terms        — jargon defined inline above the tool. Keep definitions to one line.
 *  howTo        — 2-4 short steps. This sits ABOVE the calculator, so it must stay brief:
 *                 people arrive to calculate, not to read.
 *  interpreting — the substantial part, rendered BELOW the results. This is where the
 *                 numbers get context, caveats and next actions.
 *
 * Every tool should answer three questions: what do these words mean, what do I type,
 * and what do I do with the answer.
 */
export const GUIDES = {
  'macro-calculator': {
    terms: [
      ['Macros', 'Protein, carbohydrate and fat — the three nutrients that supply energy.'],
      ['BMR', 'Basal metabolic rate: the energy your body uses at complete rest.'],
      ['TDEE', 'Total daily energy expenditure: BMR plus everything else you do.'],
      ['Lean body mass', 'Everything that is not fat — muscle, bone, organs, water.'],
    ],
    howTo: [
      'Enter your details. Body fat is optional but improves accuracy noticeably.',
      'Pick a goal. Cut targets a moderate 20% deficit, Maintain stays at estimated maintenance, and Gain targets a 10% surplus.',
      'Adjust the macro split by typing percentages or grams — either unit works.',
    ],
    interpreting: [
      ['The calorie number is a starting point, not a prescription',
       'It comes from an equation fitted to population averages, and individual expenditure varies by several hundred calories a day at the same height and weight. Run this target for two to three weeks, track a weekly average bodyweight, then adjust by 100–200 kcal based on what actually happened.'],
      ['Protein first, then fat, then carbohydrate',
       'Protein is set from lean mass when you supply body fat, because fat tissue contributes almost nothing to protein requirement. Fat is floored at 0.8 g/kg for hormonal health. Carbohydrate fills whatever calories remain, which is why it moves most when you change the split.'],
      ['What to do if the totals turn red',
       'The calculation still runs — nothing breaks. Red means your split exceeds 100% (or your calorie target, in grams mode). Either reduce one macro or accept that you are planning to eat above your target, deliberately.'],
    ],
  },

  'tdee-calculator': {
    terms: [
      ['BMR', 'Basal metabolic rate: energy used at complete rest, before any activity.'],
      ['TDEE', 'Total daily energy expenditure: BMR multiplied by an activity factor.'],
      ['Activity factor', 'A multiplier from 1.2 (sedentary) to 1.9 (very active).'],
      ['NEAT', 'Non-exercise activity: fidgeting, walking, standing. Varies enormously between people.'],
    ],
    howTo: [
      'Enter age, sex, height and weight.',
      'Choose the activity level that matches a typical week, not your best week.',
      'Add body fat if you know it — this unlocks two lean-mass equations.',
    ],
    interpreting: [
      ['The spread between formulas is the real answer',
       'Each equation was fitted to a different population sample, which is why they disagree. That spread is the honest uncertainty in any prediction of your expenditure, and no single formula is "correct". Use the recommended one as your starting figure and treat the range as the margin of error.'],
      ['Which formula to trust',
       'Without a body-fat figure, Mifflin-St Jeor is the best-validated general option. With one, the lean-mass equations (Katch-McArdle, Cunningham) usually track better, because two people at the same weight can carry very different amounts of metabolically active tissue. Cunningham reads higher and was derived in athletic populations.'],
      ['Why your real TDEE probably differs',
       'The largest uncontrolled variable is unconscious movement. Someone who takes twelve thousand incidental steps a day and someone who takes three thousand can differ by four hundred calories at identical bodyweights. If your weight is not moving as the number predicts, the number is wrong for you — not the other way round.'],
    ],
  },

  'body-fat': {
    terms: [
      ['Navy method', 'Body fat estimated from neck, waist (and hip) circumference plus height.'],
      ['Skinfold', 'Body fat estimated by pinching fat at set sites with calipers.'],
      ['Deurenberg', 'A body-fat estimate derived from BMI, age and sex — no measuring required.'],
      ['FFMI', 'Fat-free mass index: lean mass relative to height.'],
    ],
    howTo: [
      'Measure with a flexible tape, relaxed, at the same time of day each time.',
      'Neck below the larynx; waist at the narrowest point; hip at the widest.',
      'Skinfolds are optional — leave them blank if you have no calipers.',
    ],
    interpreting: [
      ['Repeatability matters more than accuracy',
       'Every method here carries an error range of three to five percentage points. A method that reads consistently three points high is still perfectly useful, because the change it reports is correct. A method you switch every month tells you nothing. Pick one, standardise the conditions, and compare only against your own previous readings.'],
      ['Why the methods disagree',
       'They measure different proxies. Tape measurements infer fat from where you carry circumference. Skinfolds sample subcutaneous fat at three sites. The BMI-based estimate cannot distinguish muscle from fat at all, which is why it reads high for muscular people and low for the very sedentary.'],
      ['Treat small changes as noise',
       'If your method carries ±3.5 points, a shift from 18.2% to 17.9% is not a result. Look for changes larger than the error range, over at least a month. And if you are guessing rather than measuring, leave the field blank in other calculators — a bad body-fat input produces worse targets than none at all.'],
    ],
  },

  'ffmi': {
    terms: [
      ['FFMI', 'Fat-free mass index: lean mass divided by height squared. BMI with the fat removed.'],
      ['Normalised FFMI', 'FFMI adjusted to a 1.8 m reference height, so different heights compare fairly.'],
      ['Lean mass', 'Bodyweight minus fat mass — includes muscle, bone, organs and water.'],
    ],
    howTo: [
      'Enter weight, height and a body-fat percentage.',
      'If you do not know your body fat, estimate it first with the body fat tool.',
    ],
    interpreting: [
      ['What the number means',
       'Roughly: under 18 is below average for men, 18–20 average, 20–22 above average, and above 23 reflects substantial long-term training. Women run several points lower throughout. The value measures all lean tissue, not muscle specifically, so treat it as a proxy.'],
      ['Why this beats BMI if you train',
       'Two people of identical height and weight, one at 12% body fat and one at 30%, produce the same BMI and very different FFMI. This is the concrete answer to BMI misclassifying athletes. BMI remains reasonable for population screening — it fails specifically at the muscular and sarcopenic extremes.'],
      ['On the "natural limit" of 25',
       'This traces to a single small 1995 study comparing steroid users and non-users, whose authors did not present it as a hard biological ceiling. Individual variation in frame and genetics is substantial, and the body-fat estimate feeding your FFMI carries several points of error itself. Treat 25 as a loose population observation, not a verdict about any individual.'],
    ],
  },

  'deficit-planner': {
    terms: [
      ['TDEE', 'Total daily energy expenditure — the calories you burn in a day.'],
      ['Adaptive thermogenesis', 'The extra fall in expenditure during a diet, beyond what weight loss alone explains.'],
      ['Dynamic model', 'A projection that recalculates expenditure as your weight changes.'],
      ['3,500 kcal rule', 'The old assumption that a pound of fat equals 3,500 calories, applied linearly.'],
    ],
    howTo: [
      'Enter your current details and a target weight.',
      'Choose whether to plan by target date (we solve the calories) or by daily calories (we solve the date).',
      'Watch the chart: the solid line is the realistic projection, the dashed line is the old linear rule.',
    ],
    interpreting: [
      ['Why the line bends',
       'A lighter body costs less to maintain and less to move, so the same intake becomes a smaller deficit every week. Adaptive thermogenesis lowers expenditure further. Real weight loss therefore decelerates, and a straight-line prediction overshoots — often by several kilograms over six months.'],
      ['The most important number is at the end',
       'Maintenance calories at goal weight will be meaningfully lower than maintenance today. Not knowing that figure is one of the most common routes back to the starting weight. Plan the exit before you start the diet.'],
      ['If it says your target is unreachable',
       'That is the model working. At a fixed intake you eventually plateau, because falling expenditure meets your intake and the deficit disappears. Lower the intake, extend the timeline, or raise activity — but do not simply wait longer at the same calories.'],
      ['Safety limits',
       'Losing more than roughly 1% of bodyweight per week risks lean mass, and intakes below about 1,500 kcal (men) or 1,200 (women) are generally not appropriate without supervision. The tool flags both. Treat any projection beyond six months as a direction of travel rather than a forecast.'],
    ],
  },

  'one-rep-max': {
    terms: [
      ['1RM', 'One-rep max: the heaviest weight you could lift for a single repetition.'],
      ['RPE', 'Rate of perceived exertion, 1–10. RPE 8 means roughly two reps left in the tank.'],
      ['RIR', 'Reps in reserve — how many more you could have done. RPE 10 minus RIR.'],
      ['Rep max', 'The most weight you can lift for a given number of reps, e.g. a 5RM.'],
    ],
    howTo: [
      'Enter a weight and the reps you completed with it, taken close to failure.',
      'Sets of two to six reps give the most reliable estimate.',
      'Use the RPE section to convert your max into a working load for a target set.',
    ],
    interpreting: [
      ['Read the range, not one number',
       'All five formulas are curve fits to different population samples, so they disagree by a few percent. That spread is the genuine uncertainty in predicting a maximal effort from a submaximal one. Wathan is shown as default because it tends to track well across the widest rep range.'],
      ['Where estimates stop being trustworthy',
       'Accuracy falls away above roughly ten reps and becomes poor beyond twelve, because high-rep sets are limited by fatigue and technique rather than by maximal force production. The tool warns you when you cross that line. Novice lifters also tend to read high, because they cannot yet express a true maximum.'],
      ['Prescribing by RPE is usually better than by percentage',
       'A fixed percentage ignores daily readiness — 80% after a bad night is a very different set from 80% when fresh. Prescribing "five reps with two in reserve" lets the load self-adjust. Research validating the scale found trained lifters judge proximity to failure reasonably well within a few reps of it.'],
    ],
  },

  'heart-rate-zones': {
    terms: [
      ['Max HR', 'The highest heart rate you can reach during maximal effort.'],
      ['Resting HR', 'Your heart rate on waking, before getting up. Falls as fitness improves.'],
      ['HR reserve', 'The gap between resting and maximum heart rate.'],
      ['Karvonen', 'A zone method using heart rate reserve, so zones reflect your conditioning.'],
      ['VO₂ max', 'The maximum rate at which your body can use oxygen.'],
    ],
    howTo: [
      'Enter your age and sex.',
      'Add a resting heart rate if you have one — measured on waking, averaged over several days.',
      'Optionally add a Cooper test distance (12 minutes of maximal running) for a VO₂ max estimate.',
    ],
    interpreting: [
      ['Why the zones move when you add resting heart rate',
       'Without it, zones are a flat percentage of maximum, which ignores the bottom of your range. Karvonen sets them from the gap between resting and maximum instead, so two people with the same max but very different fitness get appropriately different zones. The shift can be twenty to thirty beats.'],
      ['These boundaries carry about ten beats of uncertainty',
       'Any age-based max-HR estimate has substantial individual variation — two people the same age can genuinely differ by twenty beats. Tanaka is used here because it is better validated than "220 minus age", which overestimates in younger adults and underestimates in older ones. Only a real maximal test gives a precise figure.'],
      ['The practical use is keeping easy days easy',
       'Trained endurance athletes accumulate most volume at low intensity with a small amount genuinely hard. The common recreational error is the opposite — too much moderately hard work, which builds fatigue without delivering either the aerobic adaptation of easy volume or the stimulus of real intervals. Zone 2 is the one most people skip.'],
    ],
  },

  'calories-burned': {
    terms: [
      ['MET', 'Metabolic equivalent: how many times your resting energy use an activity costs. 8 METs is eight times resting.'],
      ['Compendium', 'The published reference assigning MET values to hundreds of activities.'],
      ['Net vs gross', 'Gross is total energy during the session; net subtracts what you would have burned anyway.'],
    ],
    howTo: [
      'Enter your bodyweight — energy cost scales with the mass you move.',
      'Pick the activity and duration.',
      'Compare against the other activities listed to gauge relative effort.',
    ],
    interpreting: [
      ['This figure is inflated, deliberately and unavoidably',
       'It is gross energy expenditure, so it includes the seventy to a hundred calories you would have burned in that hour sitting still. The additional cost of the exercise is meaningfully lower than the number shown. That is true of every calorie-burn figure you will see, including your watch.'],
      ['Do not eat these calories back at face value',
       'This is the single most common way a carefully planned deficit disappears. MET values are population averages that ignore your efficiency, skill and terrain, and wearable estimates have been found to carry errors above twenty percent. If you do eat some back, half the displayed figure is a conservative starting point.'],
      ['Use it comparatively',
       'The estimates are far more reliable for ranking sessions against each other than for budgeting intake. Consistent error still tells you correctly that today was harder than yesterday. Let a weekly average bodyweight settle the question of whether your energy balance is actually where you think it is.'],
    ],
  },

  'powerlifting-score': {
    terms: [
      ['Total', 'Squat plus bench plus deadlift — best successful attempt at each.'],
      ['DOTS', 'A 2019 scoring formula that adjusts a total for bodyweight. Current standard for many federations.'],
      ['IPF GL', 'IPF Goodlift points — the official IPF system since May 2020.'],
      ['Wilks', 'The long-standing scoring formula, now largely superseded.'],
      ['Classic / raw', 'Lifted without supportive equipment beyond a belt and sleeves.'],
    ],
    howTo: [
      'Enter your bodyweight and your best successful attempt at each lift.',
      'Set equipment and event to match your competition category.',
      'Compare the three scores — but only against others using the same system.',
    ],
    interpreting: [
      ['The three scales are not comparable',
       'IPF GL points run to roughly 100 for an elite result, while DOTS and Wilks run in the hundreds. A GL of 72 and a DOTS of 352 can describe the same lifter. Never compare a number from one system against another.'],
      ['Why DOTS is the default here',
       'Wilks was the global standard for about twenty-five years but has documented bias at very light and very heavy bodyweights. DOTS was built on modern competition data to correct that, and USPA, WRPF and others adopted it from 2020. Wilks is retained because many older records and personal benchmarks are still expressed in it — but if your federation has not specified, DOTS is the safer modern choice.'],
      ['What the bands mean',
       'Roughly, under 200 DOTS is beginner territory, 300 novice, 375 intermediate, 450 advanced and 525 elite. These are orientation, not federation classifications, and they say nothing about how long you have trained or what your potential is.'],
    ],
  },

  'strength-standards': {
    terms: [
      ['Bodyweight multiple', 'Your lift divided by your bodyweight — how strength is compared across sizes.'],
      ['Untrained → Elite', 'Five descriptive bands, from no training history to competitive standard.'],
      ['Age factor', 'A downward scaling applied past thirty, since strength declines gradually.'],
    ],
    howTo: [
      'Enter bodyweight, age and sex.',
      'Pick a lift and enter your one-rep max, tested or estimated.',
      'The bar shows how far you are from the next level.',
    ],
    interpreting: [
      ['These are orientation, not classification',
       'Bodyweight-relative standards vary considerably between published sources and lifting datasets, and no single table is authoritative. Expect a different site to place you in a different band. Use these to see roughly where you sit and what the next milestone looks like, not to settle arguments.'],
      ['Why lighter lifters need less absolute weight',
       'Standards are expressed as multiples of bodyweight, because absolute load favours larger lifters. A 2× bodyweight squat is a comparable achievement at 60 kg and at 100 kg, even though the plates differ substantially.'],
      ['Progress is not linear across levels',
       'Moving from untrained to novice can take months; from advanced to elite can take years, and many trainees never reach it. A slowing rate of progress is the expected shape of a training career, not evidence that something is wrong.'],
    ],
  },

  'rpe-converter': {
    terms: [
      ['RPE', 'Rate of perceived exertion on the 1–10 lifting scale. RPE 10 is a maximal effort.'],
      ['RIR', 'Reps in reserve. RPE = 10 − RIR, so RPE 8 means two reps left.'],
      ['%1RM', 'The proportion of your one-rep max a load represents.'],
      ['Autoregulation', 'Adjusting the day\u2019s load to how you are actually performing.'],
    ],
    howTo: [
      'Enter your one-rep max for the lift.',
      'Choose a rep target and how many reps you want to leave in reserve.',
      'Or switch modes to find out what RPE a weight you used actually represented.',
    ],
    interpreting: [
      ['Why RPE beats fixed percentages',
       'A percentage is a fixed prescription applied to a body whose readiness changes daily with sleep, stress, food and accumulated fatigue. Eighty percent on a good day and after a bad night are the same number and very different sets. Prescribing by reps in reserve lets the load track your actual capacity.'],
      ['How accurate is your own RPE judgement',
       'Research validating the scale found trained lifters estimate proximity to failure reasonably well, particularly within a few reps of it. Accuracy is lower in novices, at high rep counts, and on lifts you have less experience with. If you are new, expect to under-rate difficulty — most people think they are closer to failure than they are.'],
      ['Using this for programming',
       'A common approach is to work at RPE 7–8 for most volume work, leaving two to three reps in reserve, and reserve RPE 9–10 for occasional testing. Accumulating too many sets at RPE 10 builds fatigue faster than it builds capacity.'],
    ],
  },

  'plate-loader': {
    terms: [
      ['Per side', 'Plates are loaded symmetrically — the figures shown go on each end of the bar.'],
      ['Fractional plates', 'Small plates (0.25–1.25 kg) allowing finer jumps than a standard set.'],
      ['Warm-up ramp', 'A progression of lighter sets leading to your working weight.'],
    ],
    howTo: [
      'Enter your target weight and select your bar.',
      'Choose the plate set your gym actually stocks.',
      'Load heaviest plates first, closest to the collar.',
    ],
    interpreting: [
      ['When the target cannot be made exactly',
       'The tool shows the closest achievable load and how far short it falls, rather than silently rounding. If the gap bothers you, fractional plates are the fix — they matter most on pressing movements, where a 2.5 kg jump can be several percent of the working weight.'],
      ['The warm-up ramp is a starting template',
       'Heavier compound lifts generally justify more steps than isolation work, and your first working set should feel like the intended effort rather than a rescue. Adjust the number of steps to the lift and to how you feel that day.'],
    ],
  },

  'hand-portions': {
    terms: [
      ['Palm', 'A palm-sized portion of protein — roughly 25 g of protein.'],
      ['Cupped hand', 'A cupped handful of carbohydrate — roughly 25 g of carbs.'],
      ['Thumb', 'A thumb-sized portion of fat — roughly 10 g of fat.'],
      ['Fist', 'A fist of non-starchy vegetables. Aim for about one per meal.'],
      ['Peri-workout', 'The meal placed around training, often weighted slightly larger.'],
    ],
    howTo: [
      'Either enter macros you already know, or let the tool calculate them from your details.',
      'Set your hand size honestly — portions scale with it.',
      'Optionally choose which meal sits around training.',
    ],
    interpreting: [
      ['Why this works without a scale',
       'Hand size scales roughly with body size, so the measure travels with you and adapts to the person using it. A larger person has larger hands and needs more food; the units adjust automatically in a way that fixed cup measures do not.'],
      ['Expect ten to twenty percent error against weighed food',
       'A palm of chicken breast and a palm of salmon differ in both protein and fat. Hands vary. This is less precise than a scale, and that is an acceptable trade — a method you use every day beats a more accurate one you abandon after a fortnight.'],
      ['When to switch to weighing',
       'If you stall for several weeks with consistent portions, or you are preparing for something where precision genuinely matters, weigh food for a couple of weeks to recalibrate. Then go back to hands.'],
    ],
  },

  'protein-target': {
    terms: [
      ['g/kg', 'Grams of protein per kilogram of bodyweight or lean mass.'],
      ['Lean body mass', 'Bodyweight minus fat mass. The better basis for a protein target.'],
      ['Anabolic resistance', 'Reduced muscle response to protein with age, raising requirements.'],
      ['Training age', 'How long you have trained consistently, not your years alive.'],
    ],
    howTo: [
      'Enter bodyweight, and body fat if you know it.',
      'Set how aggressive your current calorie deficit is.',
      'Note the range rather than fixating on a single number.',
    ],
    interpreting: [
      ['Where to sit in the range',
       'The lower end is sufficient at maintenance or in a surplus. Push toward the upper end during an aggressive deficit, when protein does more work protecting lean mass, and if you are older, since anabolic resistance raises the floor rather than lowering it.'],
      ['Why lean mass is the better basis',
       'Two people at the same weight can differ by twenty kilograms of fat, which contributes almost nothing to protein requirement. Scaling from total bodyweight inflates the target for anyone carrying more fat — this is the most common error in protein recommendations.'],
      ['The per-meal limit is a myth',
       'Your body handles larger single doses without difficulty; the daily total is what drives outcomes. Spreading intake across three or four meals is convenient and probably marginally better for muscle protein synthesis, but it is nowhere near the lever it is usually presented as. Hit the daily number first.'],
    ],
  },

  'healthy-weight': {
    terms: [
      ['BMI', 'Body mass index: weight divided by height squared. A population screening tool.'],
      ['WHtR', 'Waist-to-height ratio. Below 0.5 is the commonly cited threshold.'],
      ['Ideal weight formulas', 'Devine, Robinson, Miller and Hamwi — all derived for clinical drug dosing.'],
    ],
    howTo: [
      'Enter height, weight and waist circumference measured at the narrowest point.',
      'Compare the healthy-BMI band against the classical formulas.',
    ],
    interpreting: [
      ['There is no single correct weight',
       'Note how much the four formulas disagree for the same person. That spread is the honest answer. All four were derived for clinical dosing rather than health or aesthetics, and none accounts for muscularity, frame size or body composition.'],
      ['Waist-to-height is the more useful number here',
       'It needs one measurement, has essentially no estimation error, and predicts cardiometabolic risk better than BMI. If you take one figure from this page, take this one.'],
      ['Why BMI misclassifies some people',
       'It cannot distinguish muscle from fat, so it reads high for muscular people and low for the sarcopenic. It remains reasonable as a population screening tool — the failures are concentrated at the extremes, which is exactly where individuals notice them. If your BMI says overweight and your waist-to-height says healthy, the second is more informative.'],
    ],
  },

  'caffeine-half-life': {
    terms: [
      ['Half-life', 'The time for the caffeine in your system to fall by half. Around five hours in a typical healthy adult, but the usual range is three to seven.'],
      ['First-order elimination', 'Clearance proportional to how much is present — so it halves repeatedly rather than draining at a fixed rate.'],
      ['CYP1A2', 'The liver enzyme that does most caffeine metabolism. Genetic variation in it is the main reason people differ so much.'],
    ],
    howTo: [
      'Add each caffeinated drink with roughly the time you had it.',
      'Set your bedtime — everything is measured against that moment.',
      'Flag anything that changes your clearance, since these shift the estimate more than the drink amounts do.',
      'Read the range, not just the middle number.',
    ],
    interpreting: [
      ['The range matters more than the number',
       'Half-life varies roughly threefold between healthy adults, so the same afternoon coffee can leave anywhere from a trace to most of a cup on board at midnight. The shaded band on the chart is the honest answer; the line through it is a convenience.'],
      ['There is no safe threshold for sleep',
       'No amount of residual caffeine is established as the point where sleep stops being affected. Some people sleep through a double espresso at nine and others lie awake after tea at four. Use the threshold line to compare your own nights against each other, not against a standard.'],
      ['Serving sizes are the loosest input here',
       'A cup of filter coffee is listed at 95 mg, but real cups range from about 70 to 200 depending on beans, grind, brew time and how big the cup actually is. If your coffee is strong, the estimate is low.'],
      ['What the modifiers do',
       'Smoking induces the enzyme that clears caffeine and roughly halves half-life. Oral contraceptives inhibit it and commonly double it. Pregnancy extends it substantially, especially later on, which is why intake guidance drops to around 200 mg a day. If a clinician has told you something different about your own clearance, follow them.'],
    ],
    pitfalls: [
      'Treating the middle estimate as a measurement of your own body.',
      'Forgetting pre-workout, cola, tea and dark chocolate, which add up quietly.',
      'Assuming that feeling unaffected means it is not affecting sleep depth.',
    ],
  },
  'sleep-calculator': {
    terms: [
      ['Sleep cycle', 'A roughly 90-minute progression through light, deep and REM sleep.'],
      ['Sleep latency', 'How long it takes you to fall asleep after getting into bed.'],
      ['Sleep debt', 'Accumulated shortfall against your actual requirement.'],
    ],
    howTo: [
      'Choose whether you are working backwards from a wake time or forwards from a bedtime.',
      'Adjust the fall-asleep time if fifteen minutes is not typical for you.',
      'Aim for five or six cycles on most nights.',
    ],
    interpreting: [
      ['The 90-minute cycle is an average, not a rule',
       'Real cycles run roughly seventy to a hundred and twenty minutes, vary within a single night, and differ between people. Waking between cycles rather than mid-cycle tends to feel easier, which is what these times aim at — but the effect is a nudge, not a guarantee.'],
      ['Two things matter more than cycle timing',
       'Total sleep, and consistency of schedule. A regular seven hours generally beats an erratic nine, and no amount of cycle math compensates for a bedtime that moves around every night. If you have to choose between hitting a cycle boundary and keeping a consistent schedule, keep the schedule.'],
      ['Why this matters if you are dieting',
       'Short sleep is reliably associated with reduced training performance, higher perceived exertion and poorer appetite regulation. The last of those matters enormously in a deficit — sleep loss makes adherence harder in a way no amount of willpower fully offsets.'],
    ],
  },

  'running-pace': {
    terms: [
      ['Pace', 'Time per unit distance, e.g. 5:00 per kilometre.'],
      ['Splits', 'Cumulative times at intermediate distances during a race.'],
      ['Riegel formula', 'A race-time prediction scaling time by distance raised to the power 1.06.'],
      ['Even splits', 'Running each segment at the same pace throughout.'],
    ],
    howTo: [
      'Pick a distance and enter your finish time as mm:ss or h:mm:ss.',
      'Use the splits table to plan pacing on race day.',
      'Check the confidence flag on each prediction before trusting it.',
    ],
    interpreting: [
      ['Predictions assume you trained for the target distance',
       'This is the formula\u2019s central and largest assumption. It cannot know whether you have done the long runs a marathon requires. Predicting a marathon from a 5K is therefore optimistic, and the tool flags such predictions as rough. Adjacent distances — 10K to half marathon — are considerably more trustworthy.'],
      ['Even splits are a plan, not a law',
       'Elite performances are frequently run with a slightly faster second half. Terrain, heat and wind all justify deviating. Use the splits as a pacing anchor for the early kilometres, where over-enthusiasm does the most damage.'],
      ['What a prediction does not account for',
       'Fuelling, heat acclimatisation, course elevation and race-day nerves are all absent from the math. Treat the predicted time as what your current aerobic fitness permits under good conditions with appropriate preparation.'],
    ],
  },
};

export const guideFor = slug => GUIDES[slug] ?? null;
