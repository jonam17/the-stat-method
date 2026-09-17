/** Body composition. Pure functions. */

export const lbmFromBodyFat = (kg, bodyFatPct) =>
  bodyFatPct == null ? null : kg * (1 - bodyFatPct / 100);

export const bmi = (kg, cm) => (cm ? kg / (cm / 100) ** 2 : 0);

/** Fat-Free Mass Index — normalises lean mass for height. */
export const ffmi = (lbm, cm) => (cm && lbm != null ? lbm / (cm / 100) ** 2 : null);

/** Waist-to-height ratio. Better cardiometabolic predictor than BMI. */
export const waistToHeight = (waistCm, cm) => (cm ? waistCm / cm : 0);

/** Deurenberg (1991) — BMI-based body fat estimate. Requires no measurement. */
export function bodyFatDeurenberg({ kg, cm, age, sex }) {
  return 1.20 * bmi(kg, cm) + 0.23 * age - 10.8 * (sex === 'male' ? 1 : 0) - 5.4;
}

/**
 * U.S. Navy circumference method (Hodgdon & Beckett, 1984). Metric inputs.
 * Returns null when measurements are physically inconsistent.
 */
export function bodyFatNavy({ sex, cm, neckCm, waistCm, hipCm }) {
  if (sex === 'male') {
    if (!(waistCm > neckCm)) return null;
    return 495 / (1.0324 - 0.19077 * Math.log10(waistCm - neckCm)
      + 0.15456 * Math.log10(cm)) - 450;
  }
  if (hipCm == null || !(waistCm + hipCm > neckCm)) return null;
  return 495 / (1.29579 - 0.35004 * Math.log10(waistCm + hipCm - neckCm)
    + 0.22100 * Math.log10(cm)) - 450;
}

/** Published error ranges — surfaced in the UI so users know what they're getting. */
/**
 * Published error ranges, as standard error of the estimate (SEE) where the
 * source reports one.
 *
 * deurenberg: 4.1 was 5 until a citation check (2026-08-20) against Deurenberg
 * 1991 (Br J Nutr 65(2):105-14, PMID 2043597), which reports R2 0.79 and
 * SEE = 4.1% BF% for the adult formula. Using the published figure rather than a
 * rounded-up one. NOTE: the same paper reports the formula slightly
 * OVERESTIMATES body fat in obese subjects, so the error is not symmetric across
 * the BMI range.
 */
export const BODY_FAT_ERROR = {
  navy:       { label: 'U.S. Navy tape',             plusMinus: 3.5 },
  deurenberg: { label: 'BMI-based (Deurenberg)',     plusMinus: 4.1 },
  skinfold:   { label: 'Skinfold (Jackson-Pollock)', plusMinus: 3.5 },
};

/**
 * Jackson-Pollock 3-site skinfold. Measurements in millimetres.
 *
 * TWO SOURCES, not one (citation check, 2026-08-20):
 *   Men:   Jackson & Pollock 1978, Br J Nutr 40:497-504 (PMID 718832).
 *          308 + 95 men aged 18-61; R > 0.90, SE +/-0.0073 g/ml, ~3.5% BF via Siri.
 *   Women: Jackson, Pollock & Ward 1980, Med Sci Sports Exerc 12:175-182.
 *          249 women aged 18-55; R 0.842-0.867, SEE 3.6-3.8 %F.
 *
 * The women's equation was implemented but its source was not cited anywhere on
 * the site. Added to the article references. Note also that BODY_FAT_ERROR uses a
 * single 3.5 for both sexes; the women's equation reports a slightly wider 3.6-3.8.
 *
 * Body density is converted to fat percentage via Siri (1961).
 */
export function bodyFatSkinfold3({ sex, age, s1, s2, s3 }) {
  const sum = (+s1 || 0) + (+s2 || 0) + (+s3 || 0);
  if (sum <= 0) return null;
  const density = sex === 'male'
    ? 1.10938 - 0.0008267 * sum + 0.0000016 * sum * sum - 0.0002574 * age
    : 1.0994921 - 0.0009929 * sum + 0.0000023 * sum * sum - 0.0001392 * age;
  const bf = 495 / density - 450;                 // Siri equation
  return bf > 0 && bf < 70 ? bf : null;
}

/** Skinfold sites by sex, for UI labelling. */
export const SKINFOLD_SITES = {
  male:   ['Chest', 'Abdomen', 'Thigh'],
  female: ['Triceps', 'Suprailiac', 'Thigh'],
};

/**
 * Descriptive body-fat categories (ACE). These are population descriptors,
 * not health targets.
 */
export const BF_CATEGORIES = {
  male: [
    { max: 5,  label: 'Below essential' },
    { max: 14, label: 'Athletic' },
    { max: 18, label: 'Fitness' },
    { max: 25, label: 'Average' },
    { max: 100, label: 'Above average' },
  ],
  female: [
    { max: 13, label: 'Below essential' },
    { max: 21, label: 'Athletic' },
    { max: 25, label: 'Fitness' },
    { max: 32, label: 'Average' },
    { max: 100, label: 'Above average' },
  ],
};

export const bodyFatCategory = (bf, sex) =>
  (BF_CATEGORIES[sex] || BF_CATEGORIES.male).find(c => bf < c.max)?.label ?? '—';

/**
 * FFMI interpretation bands (Kouri et al., 1995). ~25 is the approximate natural
 * ceiling. NOTE: Kouri defined these on HEIGHT-NORMALISED FFMI. Pass the
 * normalised value, not raw FFMI, or bands are wrong by ~1 unit for anyone far
 * from 1.8 m (audit F-006). Use ffmiNormalised() to obtain it.
 */
export const ffmiBand = v =>
  v < 18 ? 'Below average' : v < 20 ? 'Average' : v < 22 ? 'Above average'
  : v < 23 ? 'Excellent' : v < 25 ? 'Superior' : 'Very high — rare without assistance';

/**
 * Height-normalised FFMI, adjusted to Kouri's 1.8 m reference.
 *
 * COEFFICIENT CORRECTED 6.1 -> 6.3 (citation check, 2026-08-20). Kouri et al.
 * 1995 (Clin J Sport Med 5(4):223-8, PMID 7496846) specifies "a slight
 * correction of 6.3 x (1.80 m - height)". The site used 6.1, a figure that
 * circulates widely in derivative sources but is not what the cited paper says.
 *
 * Practical effect is small — about 0.03-0.04 FFMI units at 165 cm or 195 cm,
 * and zero at 1.8 m — but the site cites Kouri, so it should use Kouri's number.
 * If 6.1 is preferred it needs its own citation.
 *
 * The same expression was duplicated in FfmiCalculator.jsx; that copy now calls
 * this function, so the two cannot drift apart again.
 */
export const FFMI_HEIGHT_COEFF = 6.3;
export const ffmiNormalised = (ffmiValue, cm) =>
  ffmiValue == null || !cm ? null : ffmiValue + FFMI_HEIGHT_COEFF * (1.8 - cm / 100);

/**
 * Ideal / healthy weight range.
 * Four classical formulas plus the healthy-BMI band. All were derived for
 * clinical dosing rather than aesthetics, and none accounts for muscularity,
 * so they are presented as a RANGE rather than a target.
 */
const INCHES_OVER_5FT = cm => Math.max(0, (cm - 152.4) / 2.54);

export const idealWeightFormulas = ({ cm, sex }) => {
  const inches = INCHES_OVER_5FT(cm);
  return [
    { key: 'devine',   name: 'Devine (1974)',
      value: (sex === 'male' ? 50.0 : 45.5) + 2.3 * inches },
    { key: 'robinson', name: 'Robinson (1983)',
      value: (sex === 'male' ? 52.0 : 49.0) + (sex === 'male' ? 1.9 : 1.7) * inches },
    { key: 'miller',   name: 'Miller (1983)',
      value: (sex === 'male' ? 56.2 : 53.1) + (sex === 'male' ? 1.41 : 1.36) * inches },
    { key: 'hamwi',    name: 'Hamwi (1964)',
      value: (sex === 'male' ? 48.0 : 45.5) + (sex === 'male' ? 2.7 : 2.2) * inches },
  ].filter(f => f.value > 0);
};

/** Weight range corresponding to a healthy BMI of 18.5-24.9. */
export function healthyBmiRange(cm) {
  const m = cm / 100;
  return { lowKg: 18.5 * m * m, highKg: 24.9 * m * m };
}

/** Standard BMI categories. Population screening tool, not an individual diagnosis. */
export const BMI_CATEGORIES = [
  { max: 18.5, label: 'Underweight' },
  { max: 25,   label: 'Healthy weight' },
  { max: 30,   label: 'Overweight' },
  { max: 35,   label: 'Obesity class I' },
  { max: 40,   label: 'Obesity class II' },
  { max: 999,  label: 'Obesity class III' },
];
export const bmiCategory = v => BMI_CATEGORIES.find(c => v < c.max)?.label ?? '—';

/** Waist-to-height risk bands (Ashwell & Gibson). */
export const WHTR_BANDS = [
  { max: 0.40, label: 'Below range', note: 'Lower than the typical healthy band.' },
  { max: 0.50, label: 'Healthy',     note: 'Below 0.5 is the commonly cited threshold.' },
  { max: 0.60, label: 'Increased risk', note: 'Consider waist reduction.' },
  { max: 99,   label: 'High risk',   note: 'Substantially elevated cardiometabolic risk.' },
];
export const whtrBand = v => WHTR_BANDS.find(b => v < b.max) ?? WHTR_BANDS[3];
