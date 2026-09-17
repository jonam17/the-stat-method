/**
 * Safety rails — single source of truth.
 *
 * WHY THIS EXISTS
 * These limits were previously declared in planner.js and enforced only by the
 * Deficit Planner. Every other tool that produced a calorie target used an
 * unrelated hardcoded floor of 1000 kcal, below the minimum for either sex, and
 * warned about nothing. The rails were correct; they simply were not connected
 * to the paths that needed them. (Audit F-001, F-002, F-003, F-009.)
 *
 * Any function anywhere that emits an intake or a rate of loss must route
 * through this module. Adding a new tool should mean inheriting these limits by
 * default rather than remembering to reimplement them.
 *
 * SOURCED (verified against the primary guideline, 2026-08-20):
 * 2013 AHA/ACC/TOS Guideline for the Management of Overweight and Obesity in
 * Adults (Circulation, DOI 10.1161/01.cir.0000437739.71477.ee; also JACC
 * 10.1016/j.jacc.2013.11.004). NHLBI Grade A (Strong).
 *
 * The guideline prescribes 1200-1500 kcal/d for women and 1500-1800 kcal/d for
 * men to achieve a >=500 kcal/d deficit. These floors take the BOTTOM of each
 * range, which is the conservative reading.
 *
 * IMPORTANT — WHAT THESE NUMBERS ARE NOT. They are the low end of a PRESCRIBING
 * range, not a threshold below which harm begins. The guideline places that
 * boundary much lower: a very-low-calorie diet is defined as <800 kcal/d and is
 * recommended "only in limited circumstances in a medical care setting where
 * medical supervision... can be provided". So there is an 800-1200 band that is
 * neither a standard prescription nor formally VLCD territory. This tool refuses
 * to enter it. That is a deliberately conservative choice, not a clinical
 * boundary, and it should be described that way.
 *
 * ON SCALING. The guideline states these levels "are usually adjusted for the
 * individual's body weight and physical activity levels". A FIXED floor is
 * therefore a simplification of a guideline that explicitly says to adjust — the
 * known weakness being that a flat number is permissive for a large person and
 * restrictive for a small one. Pending clinical review.
 */

/** Lowest daily intake to recommend without clinical supervision, by sex (kcal). */
export const MIN_INTAKE = { male: 1500, female: 1200 };

/** Fallback when sex is unknown or unrecognised. Deliberately the higher floor. */
export const MIN_INTAKE_FALLBACK = 1500;

/**
 * Maximum sustainable rate of loss, as % of bodyweight per week.
 *
 * SOURCED, AND THE EVIDENCE SUPPORTS THIS VALUE (verified 2026-08-20).
 * Garthe et al., Int J Sport Nutr Exerc Metab 2011;21(2):97-104 (PMID 21558571)
 * randomised 24 elite athletes, all doing four resistance sessions a week, to a
 * slow or fast weight-loss arm. Read the achieved rates, not the targets:
 *
 *   slow arm — targeted 0.7%/wk, achieved 0.7%/wk: lean mass INCREASED 2.1%
 *   fast arm — targeted 1.4%/wk, achieved 1.0%/wk: lean mass UNCHANGED (-0.2%)
 *
 * So at roughly this ceiling, trained athletes in a deficit PRESERVED lean mass.
 * They did not lose it. What the slower rate bought was the ability to GAIN lean
 * mass while cutting, which is a performance goal rather than a safety one.
 *
 * A literature review presented to us characterised the fast arm as having "lost
 * lean mass" at 1.4%/wk and recommended tightening this ceiling to 0.7%. Both
 * claims fail against the paper: the fast arm neither lost lean mass nor reached
 * 1.4%. The ceiling was left at 1.0% for that reason.
 *
 * POPULATION LIMIT: n=24, elite athletes, resistance training four times weekly.
 * A general audience is not this population, and the direction of the difference
 * is unknown for untrained or sedentary users.
 */
export const MAX_WEEKLY_LOSS_PCT = 1.0;

/**
 * Advisory, not a rail. Below this rate trained lifters in the study above gained
 * lean mass rather than merely holding it. Surfaced as information for someone
 * whose goal is body recomposition; it is NOT enforced and NOT a safety bound.
 */
export const RECOMP_WEEKLY_LOSS_PCT = 0.7;

/**
 * Intended audience, by age (audit F-005).
 *
 * Every equation in this engine — Mifflin-St Jeor, Harris-Benedict, the Navy
 * circumference method, Jackson-Pollock, the ideal-weight formulas — was derived
 * and validated on adult populations. None is valid for people who are still
 * growing, and body-composition and calorie-deficit guidance aimed at
 * adolescents is a clinical matter rather than a calculator one.
 *
 * Previously no bound existed at any input, so a 14-year-old could obtain a
 * cutting plan computed by methods that do not apply to them, with nothing
 * saying so.
 *
 * NOTE ON WHAT THIS IS AND IS NOT: this is a stated scope boundary, not an age
 * verification mechanism. Anyone can type 18. Its purpose is to make the
 * intended audience explicit and to stop the tools from silently producing
 * output for people they were never built for — not to enforce anything.
 */
export const AGE_MIN = 18;
export const AGE_MAX = 120;

/**
 * Above this age the predictive equations lose accuracy badly enough to warn.
 *
 * Mifflin-St Jeor was derived on ages 19-78 (see energy.js). Validation work in
 * older adults finds that no standard prediction equation gives accurate resting
 * energy expenditure in this group, and in one older-inpatient series none
 * predicted within 10% for more than 80% of patients aged 70-89 or 90+.
 *
 * The DIRECTION of the error is not consistent — sarcopenia and fat
 * redistribution vary enormously between individuals at this age, so the same
 * equation may overpredict for a frail person and underpredict for an active
 * one. That is why this warns rather than corrects: there is no adjustment to
 * apply, only an accuracy caveat to state.
 *
 * Whether a general tool should refuse outright above this age is a clinical
 * judgement, not ours — pending clinical review.
 */
export const AGE_REDUCED_ACCURACY = 80;

export const ageAccuracyNote = age =>
  (+age >= AGE_REDUCED_ACCURACY ? RAIL_COPY.olderAdultAccuracy : null);

/**
 * Is this age within the audience these tools were built for?
 * @returns {{ ok:boolean, reason:'young'|'high'|'invalid'|null }}
 */
export function ageInScope(age) {
  const n = Number(age);
  if (!Number.isFinite(n) || n <= 0) return { ok: false, reason: 'invalid' };
  if (n < AGE_MIN) return { ok: false, reason: 'young' };
  if (n > AGE_MAX) return { ok: false, reason: 'high' };
  return { ok: true, reason: null };
}

/** The floor applying to this user. Never returns undefined. */
export const intakeFloor = sex => MIN_INTAKE[sex] ?? MIN_INTAKE_FALLBACK;

/**
 * Assess a proposed intake against the floor.
 * Returns the safe intake to display plus the flags the UI needs. Callers must
 * render a warning when `belowFloor` is true — the number alone is not enough.
 */
export function checkIntake(intake, sex, maintenanceKcal = null) {
  const floor = intakeFloor(sex);
  // For roughly 2% of plausible profiles — typically small, older, sedentary
  // users — estimated MAINTENANCE already sits below the floor. Telling them to
  // "pick a smaller deficit" is useless advice, because no deficit exists that
  // clears the floor. Distinguish the two cases so the copy can differ.
  const maintenanceBelowFloor =
    maintenanceKcal != null && Number.isFinite(maintenanceKcal) && maintenanceKcal < floor;
  return {
    intake: Math.max(floor, intake),
    requested: intake,
    floor,
    belowFloor: intake < floor,
    maintenanceBelowFloor,
  };
}

/**
 * Proportional goal targets (audit F-028).
 *
 * The goal selector previously applied a FIXED kcal deduction (-500 to cut,
 * +300 to gain) regardless of body size. A 500 kcal deficit is ~18% of a 2,800
 * kcal maintenance and ~38% of a 1,300 kcal one, so a small or older sedentary
 * user breached the intake floor on the standard "Cut" setting every single
 * time — which trained them to dismiss the warning that fired alongside it.
 *
 * Percentages scale with the individual and rarely breach the floor at all.
 * Values are conventional deficit/surplus ranges, not a sourced constant.
 */
export const GOALS = [
  { key: 'cut',      label: 'Cut',      pct: -0.20, blurb: 'a moderate deficit' },
  { key: 'maintain', label: 'Maintain', pct: 0,     blurb: 'at maintenance' },
  { key: 'gain',     label: 'Gain',     pct: +0.10, blurb: 'a lean surplus' },
];

/** kcal delta for a goal key at a given maintenance level. */
export const goalDelta = (key, tdeeValue) => {
  const g = GOALS.find(x => x.key === key);
  return g ? Math.round(tdeeValue * g.pct) : 0;
};

/**
 * Energy availability check (audit F-029).
 *
 *   EA = (intake - exercise energy expenditure) / fat-free mass
 *
 * Sustained EA below ~30 kcal/kg FFM/day is associated with Relative Energy
 * Deficiency in Sport (REDs): endocrine disruption, suppressed bone mineral
 * density and metabolic slowing, in both sexes.
 *
 * This is a SECOND rail, not a replacement for MIN_INTAKE. It catches the case
 * a flat floor structurally cannot — a tall or muscular person whose absolute
 * intake looks unremarkable while their energy availability does not. Returns
 * null when fat-free mass is unknown, since EA is undefined without it.
 */
export const LOW_EA_THRESHOLD = 30;   // kcal per kg fat-free mass per day

export function checkEnergyAvailability({ intakeKcal, ffmKg, exerciseKcal = 0 }) {
  if (!ffmKg || ffmKg <= 0 || !Number.isFinite(intakeKcal)) return null;
  const ea = (intakeKcal - exerciseKcal) / ffmKg;
  return {
    ea,
    threshold: LOW_EA_THRESHOLD,
    low: ea < LOW_EA_THRESHOLD,
  };
}

/**
 * Weight-target safety check (added 2026-08-20 after reviewing the literature on
 * calorie-tracking tools and disordered eating).
 *
 * WHY THIS EXISTS. The documented failure mode of calorie apps is not a wrong
 * number — it is accepting a goal that should never have been accepted. People
 * in eating-disorder treatment describe apps congratulating them on loss while
 * severely underweight and accepting goal weights far below any healthy range.
 * In one survey of eating-disorder patients who had used a popular tracker, a
 * large majority felt it had contributed to their illness.
 *
 * Two important qualifications, so this is not overstated: the association is
 * correlational, and a randomised trial in undergraduates with no pre-existing
 * symptoms found no effect on mental health. The risk is concentrated in people
 * who already have symptoms — which is exactly the group a general-audience tool
 * cannot identify and must therefore design around.
 *
 * THREE HONEST LIMITS ON THIS DESIGN (evidence review, 2026-08-20):
 *
 * 1. REFUSAL VS WARNING IS UNTESTED. No trial has compared a hard digital
 *    refusal against a warning. Refusing is a risk-management choice, not an
 *    evidence-based one. It rests on the position that a tool should not
 *    actively assist a harmful goal — which is a values argument, and should be
 *    described as such rather than dressed up as clinical.
 *
 * 2. IT IS TRIVIALLY BYPASSED. Qualitative work finds users respond to app
 *    guardrails by entering false height or weight, or moving to a less
 *    restrictive app. This guard will not stop a determined user, and nobody
 *    should believe otherwise. The point is narrower: this tool will not be the
 *    thing that helped.
 *
 * 3. NAMING THE NUMBER CAN BACKFIRE. For someone with anorexia nervosa, a
 *    warning that intake is dangerously low can read as confirmation of
 *    successful restriction rather than as caution. This is why the refusal copy
 *    below names no weights and states no thresholds — and why the floor warning
 *    leads with what the tool DID rather than how low the user went.
 *
 * So the rule here is not "warn". It is REFUSE TO PLAN. A tool that produces a
 * trajectory toward an unsafe weight has already done the harm, whatever text
 * sits beside it.
 *
 * ============================================================================
 * KNOWN BLIND SPOT — READ BEFORE TRUSTING THIS GUARD (added 2026-08-20)
 * ============================================================================
 * This check is BMI-based, and BMI-based screening misses the presentation that
 * accounts for a quarter to two-fifths of admissions to specialist eating
 * disorder inpatient units.
 *
 * Atypical anorexia nervosa (DSM-5, under OSFED) meets every criterion for
 * anorexia nervosa EXCEPT that weight remains in the normal or above-normal
 * range despite significant loss. The same fear of gaining weight, the same
 * restriction, fasting, over-exercise and purging. Patients present after a
 * LONGER duration of illness and are LESS likely to receive inpatient care,
 * because normal weight conceals the severity.
 *
 * Such a user passes this guard completely. Worse, the category label elsewhere
 * on the site tells them "Normal weight" — the exact false reassurance that
 * delays treatment, and a reason the label question (B5) is not merely about
 * stigma at the upper end.
 *
 * WHAT THIS GUARD ACTUALLY CATCHES: the classic low-weight presentation.
 * WHAT IT DOES NOT CATCH: restrictive eating disorder at normal or high weight.
 *
 * Do not let the existence of this rail create confidence it has not earned.
 * Escalated to clinical review as B5b — a magnitude-of-loss signal independent
 * of BMI may be the right addition, but the threshold is not ours to invent.
 * ============================================================================
 *
 * @returns {{ ok:boolean, reason:string|null, currentBmi:number, targetBmi:number|null }}
 */
export const BMI_UNDERWEIGHT = 18.5;

/**
 * Older adults: ADVISORY, not a raised refusal threshold.
 *
 * A literature review recommended raising the refusal floor to BMI 22 or even 24
 * for users 65+, citing a National Research Council lower bound of 24. **We did
 * not do this**, for two reasons:
 *
 *  1. The 24 figure could not be verified against any retrievable source.
 *  2. The literature conflicts on direction. Johns Hopkins geriatrics notes that
 *     higher BMI in 65+ may signal better survival, supporting an upward shift.
 *     But a large Indian ageing-cohort analysis (LASI) derived age-appropriate
 *     cutoffs that moved the underweight threshold DOWN — to 17.4 for ages 60-74
 *     and lower still above 75. Both cannot be right, and neither is settled.
 *
 * Refusing service below BMI 22 would lock out a large share of healthy older
 * adults on contested evidence. What IS well supported is narrower: low BMI in
 * older adults is a recognised marker of malnutrition and sarcopenia risk, and
 * BMI performs poorly in this group generally. So we surface that, and leave the
 * refusal threshold at 18.5 for everyone pending clinical review (B4e).
 */
export const OLDER_ADULT_AGE = 65;
export const OLDER_ADULT_BMI_ADVISORY = 22;

export function checkOlderAdultWeight({ age, currentKg, targetKg, cm }) {
  const m = (+cm || 0) / 100;
  if (!m || +age < OLDER_ADULT_AGE) return null;
  const bmi = (targetKg > 0 ? targetKg : currentKg) / (m * m);
  if (!Number.isFinite(bmi) || bmi >= OLDER_ADULT_BMI_ADVISORY) return null;
  return { bmi, threshold: OLDER_ADULT_BMI_ADVISORY };
}

export function checkWeightTarget({ currentKg, targetKg, cm, goal = null }) {
  const m = (+cm || 0) / 100;
  if (!m || !(currentKg > 0)) return { ok: true, reason: null, currentBmi: null, targetBmi: null };
  const currentBmi = currentKg / (m * m);
  const targetBmi = targetKg > 0 ? targetKg / (m * m) : null;

  // Already below a healthy weight — do not plan further loss, at any rate.
  //
  // Two shapes of request reach this. Tools with a target weight (the planner)
  // pass targetKg. Tools with only a goal DIRECTION (macro calculator, hand
  // portions) pass goal: 'cut'. Both are a request to lose weight and both are
  // refused. The second case was the gap: a deficit with no stated target is
  // still a deficit.
  const wantsLoss = (targetKg != null && targetKg < currentKg) || goal === 'cut';
  if (currentBmi < BMI_UNDERWEIGHT && wantsLoss) {
    return { ok: false, reason: 'currentUnderweight', currentBmi, targetBmi };
  }
  // Target sits below a healthy weight.
  if (targetBmi != null && targetBmi < BMI_UNDERWEIGHT) {
    return { ok: false, reason: 'targetUnderweight', currentBmi, targetBmi };
  }
  return { ok: true, reason: null, currentBmi, targetBmi };
}

/**
 * Life-stage contraindications (added 2026-08-20 from published guidance).
 *
 * 'pregnant'     — deficit planning is not appropriate. Gestational weight gain
 *                  is expected and its recommended range depends on pre-pregnancy
 *                  BMI; intentional loss is a clinical decision, not a calculator
 *                  one. REFUSE to plan.
 * 'breastfeeding'— loss is appropriate but the floor is higher. Guidance in this
 *                  lineage puts intake at or above ~1800 kcal/day while nursing,
 *                  with loss up to roughly 0.9 kg (2 lb) per month not affecting
 *                  nursing performance. The Dietary Guidelines add ~330 kcal/day
 *                  in the first six months and ~400 kcal thereafter versus
 *                  pre-pregnancy needs. RAISE the floor, do not refuse.
 *
 * These are population figures from general guidance, not personalised advice,
 * and they are pending clinical review.
 */
export const LIFE_STAGE = {
  none:          { label: 'None of these',        floor: null, blocks: false },
  breastfeeding: { label: 'Breastfeeding',        floor: 1800, blocks: false },
  pregnant:      { label: 'Pregnant',             floor: null, blocks: true  },
};

/** Effective intake floor, taking life stage into account. Never lowers it. */
export const effectiveFloor = (sex, lifeStage = 'none') =>
  Math.max(intakeFloor(sex), LIFE_STAGE[lifeStage]?.floor ?? 0);

/** Assess a weekly rate of loss (kg/week against starting kg) versus the ceiling. */
export function checkRate(weeklyKg, startKg) {
  const pct = startKg ? (weeklyKg / startKg) * 100 : 0;
  return { pct, ceiling: MAX_WEEKLY_LOSS_PCT, tooFast: pct > MAX_WEEKLY_LOSS_PCT };
}

/** Standard copy, so every tool says the same thing about the same limit. */
export const RAIL_COPY = {
  /**
   * Leads with what the tool did, not with how far below the floor the request
   * fell. Naming a shortfall can read as achievement to someone restricting.
   */
  belowFloor: floor =>
    `We've held this target at ${floor} kcal rather than going lower — that's the ` +
    `common lower bound for dieting without medical supervision. Extending the ` +
    `timeline or raising activity gets you to the same place without going under it.`,
  tooFast: pct =>
    `Losing ${pct.toFixed(1)}% of bodyweight per week is faster than the ~1% ceiling ` +
    `most guidance suggests, which risks lean-mass loss.`,
  /**
   * Shown instead of results to under-18 visitors. Deliberately explains the
   * limitation of the METHOD rather than commenting on the person, and points
   * somewhere useful. Do not reword this into a rejection.
   */
  underAge:
    `These calculators are built for adults, and there are two separate reasons ` +
    `we're not going to run one for you.\n\n` +
    `The equations behind them were developed and tested on adult bodies, so the ` +
    `numbers wouldn't mean much for anyone still growing. But the bigger reason ` +
    `is that counting calories in order to lose weight is specifically discouraged ` +
    `for people your age — pediatric guidance treats it as a risk behaviour in ` +
    `itself, linked both to eating disorders and, counter-intuitively, to weight ` +
    `gain over time. That's not about you. It's true of the practice generally.\n\n` +
    `What the same guidance does recommend is focusing on habits rather than ` +
    `weight: eating regularly, moving in ways you enjoy, sleeping properly. If ` +
    `there's something you want to change about your body or your health, a ` +
    `doctor, school nurse, or registered dietitian can help you do it in a way ` +
    `that accounts for growth — which is something no calculator can do.`,
  olderAdultAccuracy:
    `A note on accuracy at your age. The equation behind this estimate was built ` +
    `from adults up to about 78, and studies in older adults find that no standard ` +
    `equation predicts resting metabolism reliably past 80 — sometimes high, ` +
    `sometimes low, depending on muscle mass and body composition, which vary far ` +
    `more between people at this age than earlier in life. The number below is a ` +
    `starting point rather than a measurement. Track what actually happens to your ` +
    `weight over a few weeks and trust that over the arithmetic, and involve a ` +
    `doctor or dietitian before making significant changes.`,

  overAge:
    `Please check the age entered. These tools accept ages up to ${AGE_MAX}.`,
  /**
   * Shown wherever a BMI or body-fat CATEGORY label is displayed (audit Q5,
   * owner decision 2026-08-19: keep the label, add the caveat).
   *
   * These categories are population screening bands, not individual verdicts.
   * BMI in particular reads lean mass and fat mass identically, so a muscular
   * person is routinely categorised as overweight while carrying little fat.
   */
  /**
   * Shown when a category label reads "normal" — the atypical-anorexia case.
   * Deliberately does NOT ask the user to self-diagnose or answer anything.
   */
  normalLabelCaveat:
    `A number in the usual range is not, on its own, evidence that eating is going ` +
    `well. Restrictive eating disorders occur at every body size, and the version ` +
    `that presents at normal or above-normal weight is common enough to account for ` +
    `a large share of specialist admissions — it simply takes longer to be ` +
    `recognised, precisely because the number looks unremarkable. If how you eat ` +
    `is causing you distress, that matters regardless of what this says.`,

  categoryCaveat:
    `Category labels come from population averages and can't tell muscle from fat — a ` +
    `muscular person often lands in a higher band despite low body fat. There is a further ` +
    `limitation worth knowing: the American Medical Association's 2023 position is that BMI ` +
    `correlates with fat mass across a population but loses predictive power when applied ` +
    `to one individual, that its cut-offs derive largely from earlier generations of ` +
    `non-Hispanic white populations, and that it should not be used as a sole measure. ` +
    `Treat this as a rough screening band, not a verdict on your health.`,
  maintenanceBelowFloor: floor =>
    `Your estimated maintenance is already below ${floor} kcal, so there isn't a ` +
    `deficit here that would still clear a safe intake. That usually reflects a ` +
    `small frame, lower activity, or age — not a mistake. Raising activity is the ` +
    `more useful lever than cutting further, and this is worth discussing with a ` +
    `dietitian rather than solving with a calculator.`,
  /**
   * Shown INSTEAD OF a plan when a weight target falls below a healthy range.
   *
   * Written to avoid every pattern that makes this worse: it names no weights,
   * sets no alternative target, does not congratulate or admonish, does not
   * imply the person has a diagnosis, and does not ask them to justify anything.
   * It states what the tool will not do and where better help is. Please do not
   * "improve" it by adding numbers.
   *
   * ON THE REFERRAL: this points to the National Alliance for Eating Disorders,
   * NOT to NEDA. NEDA shut down its human helpline in 2023 and replaced it with
   * a chatbot, which was itself withdrawn after it recommended calorie counting
   * and a deficit of up to 1,000 kcal/day to people with eating disorders. The
   * Alliance line is staffed by licensed clinicians. Do not swap this referral
   * for a better-known name without checking the line is still human-staffed.
   */
  targetBelowHealthy:
    `We're not going to build a plan for this one. The weight involved falls below ` +
    `the range these tools are designed to work in, and a calculator is the wrong ` +
    `thing to be steering by from here — it can only do arithmetic, and this needs ` +
    `a person.\n\n` +
    `If you'd like to talk it through with someone, the National Alliance for Eating ` +
    `Disorders runs a free helpline staffed by licensed clinicians at 1-866-662-1235, ` +
    `and a doctor or registered dietitian can help you work out what a healthy target ` +
    `looks like for your body. There's nothing wrong with wanting to change how you ` +
    `look or feel. It's just that this particular tool can't help you do it safely.`,

  currentBelowHealthy:
    `Based on the height and weight entered, further loss isn't something we'll plan ` +
    `for. That's not a judgement about you, and it isn't a diagnosis — it's that this ` +
    `tool does arithmetic, and arithmetic is the wrong instrument here.\n\n` +
    `If any of this is difficult, the National Alliance for Eating Disorders helpline ` +
    `is free and staffed by licensed clinicians: 1-866-662-1235. A doctor or registered ` +
    `dietitian can give you something a calculator can't.`,

  pregnancy:
    `We're not going to plan a deficit during pregnancy. Weight gain is expected, and how ` +
    `much is right depends on your pre-pregnancy weight and on things a calculator has no ` +
    `way of knowing. This is a conversation for your midwife or obstetrician, who can give ` +
    `you a target range meant for you.`,

  breastfeeding: floor =>
    `While breastfeeding, the floor here rises to ${floor} kcal — guidance in this area puts ` +
    `intake at or above roughly that level while nursing, and adds several hundred calories ` +
    `a day on top of pre-pregnancy needs. Gradual loss of up to about half a kilo a fortnight ` +
    `is generally described as not affecting nursing. If your supply changes, that is worth ` +
    `raising with your midwife or a lactation consultant before adjusting anything further.`,

  recompRate: (pct) =>
    `At about ${pct.toFixed(1)}% of bodyweight per week you are inside the usual ` +
    `guidance, and the evidence suggests lean mass is preserved at this rate. If ` +
    `your goal is to gain muscle while losing fat rather than simply holding what ` +
    `you have, the one trial that tested this found trained lifters gained lean ` +
    `mass at around 0.7% per week and merely maintained it at 1%. That was 24 ` +
    `athletes lifting four times a week, so treat it as a direction rather than a ` +
    `rule — and note it costs you a longer timeline either way.`,

  olderAdultLowBmi:
    `One thing worth raising with a doctor before losing weight from here. In ` +
    `people over 65, a low body-mass index is a recognised marker of malnutrition ` +
    `and of sarcopenia — the age-related loss of muscle — and carries different ` +
    `risks than the same number would at 30. Some geriatric guidance suggests the ` +
    `healthy range sits higher in later life, though the evidence on exactly where ` +
    `is genuinely unsettled. This isn't a reason not to lose weight if you have ` +
    `reason to. It is a reason to have someone check that muscle, not just fat, ` +
    `isn't what's going.`,

  lowEA: (ea) =>
    `At about ${Math.round(ea)} kcal per kg of lean mass, this sits below the ` +
    `~${LOW_EA_THRESHOLD} kcal/kg threshold associated with hormonal and bone-density ` +
    `effects. Absolute calories can look fine and still be too low relative to ` +
    `your lean mass and training load.`,
  infeasible:
    `This target cannot be reached by that date without dropping below a safe intake. ` +
    `The plan below shows the fastest safe pace instead.`,
};
