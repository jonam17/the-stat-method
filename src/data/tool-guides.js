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
       'Protein is 1.8 g per kg of bodyweight, or 2.3 g per kg of lean mass when you are cutting and supply body fat. Fat is 25% of calories and never below 20%, the low end of the Institute of Medicine\u2019s range. Carbohydrate fills whatever calories remain, which is why it moves most when you change the split.'],
      ['What to do if the totals turn red',
       'The calculation still runs — nothing breaks. Red means your split exceeds 100% (or your calorie target, in grams mode). Either reduce one macro or accept that you are planning to eat above your target, deliberately.'],
    ],
  },

  'baseline': {
    terms: [
      ['Baseline', 'A measured starting point: where your energy needs, body composition and targets stand today, before you change anything.'],
      ['TDEE', 'Total daily energy expenditure — the calories that hold your weight steady at your activity level.'],
      ['BMI', 'Weight relative to height. A population screening measure; it cannot tell muscle from fat.'],
      ['FFMI', 'Fat-free mass index — lean mass relative to height. Needs a body-fat estimate.'],
      ['Waist-to-height', 'Waist divided by height. A better guide to cardiometabolic risk than BMI alone.'],
    ],
    howTo: [
      'Enter the five core details. Energy and body results appear straight away.',
      'Add body fat or a waist measurement if you have them — each unlocks more.',
      'Choose a goal to see calorie and protein targets, then a target weight to see a timeline.',
    ],
    interpreting: [
      ['Every number here matches its own calculator',
       'Each section is computed by the same code as the standalone calculator it links to, so the Baseline can never disagree with them. Follow a section\u2019s link to see the full working, compare the equations, or adjust details the Baseline leaves at their defaults.'],
      ['These are estimates, not measurements',
       'Every figure comes from equations fitted to populations, not from measuring you. Two people with identical inputs can differ by several hundred calories a day. Use these as a starting point, track your weight for three weeks, and let what actually happens overwrite them.'],
      ['Why it sometimes declines to answer',
       'If any calculator the Baseline draws on would decline your situation, the whole Baseline declines, with the same explanation that calculator gives. That is deliberate: one section should never show a number another section would refuse. The individual calculators remain available for narrower questions.'],
    ],
  },
  'tdee-calculator': {
    terms: [
      ['BMR', 'Basal metabolic rate: energy used at complete rest, before any activity.'],
      ['TDEE', 'Total daily energy expenditure: BMR multiplied by an activity level.'],
      ['Activity level', 'Daily energy use as a multiple of BMR: 1.53 for a sedentary or light lifestyle, 1.76 for an active one and 2.25 for a vigorous one (FAO/WHO/UNU).'],
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
       'FFMI has no official categories. The labels you may see elsewhere — under 18 \u201cbelow average\u201d, 18–20 \u201caverage\u201d and so on — are informal figures for men that we could not trace to a published source, so this calculator does not use them. Instead, your result shows where you fall among adults of your sex and age in a large Swiss reference sample, and the full chart is below — the median for adults aged 18 to 34 was 18.9 in men and 15.4 in women. The value measures all lean tissue, not muscle specifically, so treat it as a proxy.'],
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
      'Keep to ten reps or fewer; around five gave the best estimate in one study.',
      'Use the RPE section to convert your max into a working load for a target set.',
    ],
    interpreting: [
      ['Read the range, not one number',
       'All five formulas are curve fits to different population samples, so they disagree by a few percent. That spread is the genuine uncertainty in predicting a maximal effort from a submaximal one, so the headline is their average.'],
      ['Where estimates stop being trustworthy',
       'In a study of 70 adults, a five-rep max predicted the one-rep max best, and accuracy fell from ten and twenty reps. The authors say to use no more than ten reps, and Epley\u2019s and Brzycki\u2019s own guidance is under ten, so the tool warns you above ten.'],
      ['Prescribing by RPE is usually better than by percentage',
       'A fixed percentage ignores daily readiness — 80% after a bad night is a very different set from 80% when fresh. Prescribing "five reps with two in reserve" lets the load self-adjust. Research validating the scale found trained lifters judge proximity to failure reasonably well within a few reps of it.'],
    ],
  },

  'heart-rate-zones': {
    terms: [
      ['Max HR', 'The highest heart rate you can reach during maximal effort.'],
      ['Resting HR', 'Your heart rate on waking, before getting up. Falls as fitness improves.'],
      ['HR reserve', 'The gap between resting and maximum heart rate.'],
      ['Karvonen', 'Sets target heart rates as a share of your heart-rate reserve, added back onto resting heart rate.'],
      ['RPE', 'Rating of perceived exertion: how hard an effort feels, on a scale from 6 to 20.'],
      ['VO₂ max', 'The maximum rate at which your body can use oxygen.'],
    ],
    howTo: [
      'Enter your age and sex.',
      'Add a resting heart rate if you have one — measured on waking, averaged over several days.',
      'Optionally add a Cooper test distance (12 minutes of maximal running) for a VO₂ max estimate.',
    ],
    interpreting: [
      ['Why the bands change when you add resting heart rate',
       'Without it, the bands are a percentage of maximum heart rate. With it, they are a percentage of your heart-rate reserve, the gap between resting and maximum, so two people with the same maximum but different fitness get different bands. The American College of Sports Medicine gives separate percentages for each method, because the two are not equivalent, so the calculator switches to the matching set.'],
      ['These boundaries carry about ten beats of uncertainty',
       'Any age-based max-HR estimate has substantial individual variation — two people the same age can genuinely differ by twenty beats. Tanaka is used here because it is better validated than "220 minus age", which overestimates in younger adults and underestimates in older ones. Only a real maximal test gives a precise figure.'],
      ['Which band to aim for',
       'For most adults, ACSM recommends moderate or vigorous exercise, or a mix: at least 150 minutes a week of moderate exercise, or 75 of vigorous. For people starting out unfit, light to moderate exercise may help. How hard the effort feels (RPE) is a useful check on the heart-rate figures.'],
    ],
  },

  'calories-burned': {
    terms: [
      ['MET', 'Metabolic equivalent: how many times your resting energy use an activity costs. 8 METs is eight times resting.'],
      ['Compendium', 'The published reference assigning MET values to over a thousand activities; the 2024 edition is used here.'],
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
      ['DOTS', 'A 2019 scoring formula that adjusts a total for bodyweight, built on results from drug-tested raw lifters.'],
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
       'Wilks was the global standard for about twenty-five years but has documented bias at very light and very heavy bodyweights. DOTS is the 2019 replacement, built on results from drug-tested raw lifters; USA Powerlifting’s rulebook uses it to break ties in team placings. Wilks is retained because many older records and personal benchmarks are still expressed in it — but if your federation has not specified, DOTS is the safer modern choice.'],
      ['What is a good score',
       'The chart below the calculator shows DOTS and IPF GL percentiles among people who competed in full-power meets over five years, split by sex and equipment. The median for men in classic meets is about 359 DOTS; for women, about 316. Your result line says where your own score falls.'],
    ],
  },

  'strength-standards': {
    terms: [
      ['Bodyweight multiple', 'Your lift divided by your bodyweight — how strength is compared across sizes.'],
      ['Beginner → Highly advanced', 'Four strength levels from a training-status model proposed by Santos Junior and colleagues in 2021, with separate cut-offs for men and women.'],
      ['Strength level', 'One of the five things that model uses to judge training status; the others are training time, breaks, past experience and technique.'],
    ],
    howTo: [
      'Enter bodyweight, age and sex.',
      'Pick the back squat, bench press or deadlift and enter your one-rep max, tested or estimated.',
      'The bar shows how far you are from the next level.',
    ],
    interpreting: [
      ['A proposed model, not a survey',
       'The cut-offs come from earlier studies and the authors\u2019 reasoning, not from measuring what people lift, and they are meant for most people who train rather than athletes. Other tables will place you differently. Use the level to see roughly where you sit and what the next milestone looks like, not to settle arguments.'],
      ['Why lighter lifters need less absolute weight',
       'Levels are set as multiples of bodyweight, because absolute load favours larger lifters. A 2× bodyweight squat is a comparable achievement at 60 kg and at 100 kg, even though the plates differ substantially.'],
      ['Age and size',
       'The model makes no adjustment for age, so neither does this calculator. Its authors note that older and heavier lifters are at a disadvantage on strength, so judge the result with that in mind.'],
    ],
  },

  'rpe-converter': {
    terms: [
      ['RPE', 'Rate of perceived exertion on the 1–10 lifting scale. RPE 10 is a maximal effort.'],
      ['RIR', 'Reps in reserve. RPE = 10 − RIR, so RPE 8 means two reps left.'],
      ['%1RM', 'The proportion of your one-rep max a load represents.'],
      ['RPE chart', 'The table linking reps, RPE and %1RM, from Helms and colleagues (2016): 1 to 8 reps, RPE 7 to 10, built from trained lifters\u2019 back squats.'],
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
       'A meta-analysis of twelve studies found people on average under-predict how many reps they have left, by about one, and that training status made no clear difference. Predictions were a little more accurate close to failure, in sets of twelve reps or fewer, and in later sets. The study that introduced the scale found novices less able to reach a true one-rep max.'],
      ['Using this for programming',
       'Helms and colleagues suggest, for muscle growth, mostly 6 to 12 reps at RPE 8 to 10 (two to zero reps in reserve), with sets to failure kept to the last set for a body part; for main lifts such as squats and bench press, RPE 6 to 8 may help avoid excessive muscle damage. For strength, 1 to 6 reps, with some RPE 10 work, but they advise caution about training to failure regularly.'],
    ],
  },

  'progressive-overload': {
    terms: [
      ['Progressive overload', 'Asking a little more of a muscle over time — more weight, more reps or more sets — so it keeps adapting.'],
      ['RIR', 'Reps in reserve: how many more reps you could have done. 0 means you reached failure.'],
      ['Double progression', 'Add reps at the same weight until every set reaches the top of the range, then add weight and start again near the bottom.'],
      ['Volume load', 'Load × total reps. A descriptive number for tracking, not a measure of how much a session built muscle.'],
    ],
    howTo: [
      'Pick the exercise type and your goal; adjust the rep range if your program uses another.',
      'Enter the load, the smallest weight jump your equipment allows, and the reps in each set.',
      'Be honest about technique and pain — they decide before your reps do.',
    ],
    interpreting: [
      ['Why "add reps" is often the answer',
       'Progress does not have to mean more weight. Adding reps at the same load is progression in its own right, and in trained lifters it built strength and muscle about as well as adding load. The tool asks for every set to reach the top of your range before the weight goes up, so the heavier load is earned rather than hoped for.'],
      ['Why the weight sometimes does not go up even at the top of the range',
       'Small exercises with coarse equipment are the usual reason: going from 15 to 20 lb dumbbells is a 33% jump, far more than the 1–2.5% suited to a lateral raise. The tool keeps you adding reps until every set goes two past the top of the range, then allows the jump and resets the rep target. Smaller plates or a micro-loading pin avoid the problem altogether.'],
      ['What the confidence grade means',
       'Confidence reflects how much supporting evidence you gave, not how good the session was. Reps in reserve and last session each add evidence; leaving either out, or rating a set as very easy — where people judge reps in reserve least accurately — lowers it. Low confidence means the advice leans on your reps and technique alone.'],
      ['What this tool will not do',
       'It will not raise the weight when you report pain or a breakdown in technique, and severe pain stops the calculation entirely. It does not predict injury, diagnose pain or replace a coach who can watch you lift. Its percentages are practical rules informed by research, labelled as such in the method notes.'],
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
      ['Palm', 'A palm-sized portion of protein: about 24 g of protein for men, 22 g for women.'],
      ['Cupped hand', 'A cupped handful of carbohydrate: about 25 g of carbs for men, 22 g for women.'],
      ['Thumb', 'A thumb-sized portion of fat: about 9 g of fat for men, 8 g for women.'],
      ['Fist', 'A fist of non-starchy vegetables. Aim for one to two per meal.'],
      ['Peri-workout', 'The meal placed around training, often weighted slightly larger.'],
    ],
    howTo: [
      'Either enter macros you already know, or let the tool calculate them from your details.',
      'If you enter macros directly, choose male or female: the grams per portion differ a little.',
      'Optionally choose which meal sits around training.',
    ],
    interpreting: [
      ['Why this works without a scale',
       'Hands scale with the individual: bigger people tend to need more food and to have bigger hands, so the units adjust in a way that fixed cup measures do not. The gram figures are Precision Nutrition\u2019s approximations.'],
      ['It is less precise than a scale',
       'A palm of chicken breast and a palm of salmon differ in both protein and fat, and hands vary. Each portion also carries some of the other macros, which the conversion leaves out. That is the trade for a method that needs no equipment.'],
      ['When to switch to weighing',
       'If you stall for several weeks with consistent portions, or you are preparing for something where precision genuinely matters, weigh food for a couple of weeks to recalibrate. Then go back to hands.'],
    ],
  },

  'protein-target': {
    terms: [
      ['g/kg', 'Grams of protein per kilogram of bodyweight or lean mass.'],
      ['Lean body mass', 'Bodyweight minus fat mass. The basis for the deficit range.'],
    ],
    howTo: [
      'Enter bodyweight, and body fat if you know it.',
      'Say whether you are in a calorie deficit.',
      'Note the range rather than fixating on a single number.',
    ],
    interpreting: [
      ['Where to sit in the range',
       'Outside a deficit the range is 1.4 to 2.0 g per kg of bodyweight, enough for most people who exercise. In a deficit, with body fat entered, it is 2.3 to 3.1 g per kg of lean mass; aim higher the harder the cut and the leaner you are.'],
      ['Why lean mass is used in a deficit',
       'Two people at the same weight can differ by twenty kilograms of fat, which needs almost no protein. The deficit range comes from a review that set it per kg of lean mass, so the calculator uses lean mass there. The everyday range was set per kg of bodyweight, so it uses bodyweight.'],
      ['The per-meal limit is a myth',
       'Your body handles larger single doses without difficulty; the daily total is what drives outcomes. Spreading intake across three or four meals is convenient and probably marginally better for muscle protein synthesis, but it is nowhere near the lever it is usually presented as. Hit the daily number first.'],
    ],
  },

  'healthy-weight': {
    terms: [
      ['BMI', 'Body mass index: weight divided by height squared. A population screening tool.'],
      ['WHtR', 'Waist-to-height ratio. Below 0.5 is the band with no increased risk in Ashwell and Gibson\u2019s bands, used here.'],
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
      ['Half-life', 'The time for the caffeine in your system to fall by half. About four hours on average in adults, with a range of about two to eight.'],
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
       'Half-life varies about fourfold between adults, so the same afternoon coffee can leave anywhere from a trace to most of a cup on board at midnight. The shaded band on the chart is the honest answer; the line through it is a convenience.'],
      ['There is no safe threshold for sleep',
       'No amount of residual caffeine is established as the point where sleep stops being affected. Some people sleep through a double espresso at nine and others lie awake after tea at four. Use the threshold line to compare your own nights against each other, not against a standard.'],
      ['Serving sizes are the loosest input here',
       'A cup of brewed coffee is listed at 96 mg, Mayo Clinic\u2019s figure for 237 ml. Real cups vary far more: the FDA puts a 12 fl oz (355 ml) brewed coffee at 113 to 247 mg, depending on beans, brewing and cup size. If your coffee is strong or your cup is big, the estimate is low.'],
      ['What the modifiers do',
       'Smoking speeds up the enzyme that clears caffeine, by about 1.2 to 1.7 times depending on how much you smoke. Oral contraceptives slow it, making half-life about 1.4 times longer. In pregnancy, half-life has been measured at 6 to 16 hours, longest near the end, and EFSA and ACOG treat intake below 200 mg a day as not a concern. Liver disease is left out because no figure for it is reliable. If a clinician has told you something different about your own clearance, follow them.'],
    ],
    pitfalls: [
      'Treating the middle estimate as a measurement of your own body.',
      'Forgetting pre-workout, cola, tea and dark chocolate, which add up quietly.',
      'Assuming that feeling unaffected means it is not affecting sleep depth.',
    ],
  },
  'sleep-calculator': {
    terms: [
      ['Sleep cycle', 'One pass through light, deep and REM sleep: about 90 minutes on average, four to six a night.'],
      ['Sleep inertia', 'The grogginess after waking, worst when woken from deep sleep.'],
      ['Sleep latency', 'How long it takes you to fall asleep after getting into bed.'],
      ['Sleep debt', 'Accumulated shortfall against your actual requirement.'],
    ],
    howTo: [
      'Choose whether you are working backwards from a wake time or forwards from a bedtime.',
      'Change the fall-asleep time to your usual one; fifteen minutes is only a starting value.',
      'Enter your age: the labels are the National Sleep Foundation\u2019s for your age group.',
    ],
    interpreting: [
      ['The 90-minute cycle is an average, not a rule',
       'A complete cycle takes roughly 90 to 110 minutes, so the times are approximate. They aim to avoid waking from deep sleep, which leaves people groggy: in testing, mental performance was moderately impaired for thirty minutes to an hour. Deep sleep comes mostly in the first half of the night. The sources describe the stages but do not test cycle-timed waking, so treat the times as a nudge.'],
      ['What the labels mean',
       'They are the National Sleep Foundation\u2019s categories for your age. For adults under 65, 7 to 9 hours is recommended, 6 may be appropriate for some people, and under 6 is not recommended. From 65, 7 to 8 is recommended, 5 to 6 and 9 may be appropriate, and under 5 is not recommended. The hours are of sleep, not time in bed.'],
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
      'Read the note under each prediction: marathon times are flagged as probably too fast.',
    ],
    interpreting: [
      ['Predictions assume you trained for the target distance',
       'This is the formula\u2019s central assumption, and it cannot know whether you have done the long runs a marathon requires. In a study of 2,303 recreational runners, Riegel was well calibrated up to the half marathon, but at the marathon it was at least ten minutes too fast for half of them. The mile and other distances outside that study are marked as not checked.'],
      ['Even splits are a plan, not a law',
       'Terrain, heat and wind can all justify deviating. Use the splits as a pacing anchor for the early kilometres, where over-enthusiasm does the most damage.'],
      ['What a prediction does not account for',
       'Fuelling, heat acclimatisation, course elevation and race-day nerves are all absent from the math. Treat the predicted time as what your current aerobic fitness permits under good conditions with appropriate preparation.'],
    ],
  },
};

export const guideFor = slug => GUIDES[slug] ?? null;
