/** Running pace, splits, and race-time prediction. */

/** Pace in seconds per kilometre. */
export const paceFromTime = (seconds, km) => (km > 0 ? seconds / km : 0);
export const timeFromPace = (secPerKm, km) => secPerKm * km;
export const speedKmh = secPerKm => (secPerKm > 0 ? 3600 / secPerKm : 0);

export const SEC_PER_MILE = secPerKm => secPerKm * 1.609344;

/** Format seconds as h:mm:ss or mm:ss. */
export function fmtTime(sec) {
  if (!Number.isFinite(sec) || sec < 0) return '—';
  const s = Math.round(sec);
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), r = s % 60;
  return h > 0
    ? `${h}:${String(m).padStart(2, '0')}:${String(r).padStart(2, '0')}`
    : `${m}:${String(r).padStart(2, '0')}`;
}

export const DISTANCES = [
  { name: '5K', km: 5 },
  { name: '10K', km: 10 },
  { name: 'Half marathon', km: 21.0975 },
  { name: 'Marathon', km: 42.195 },
  { name: '1 mile', km: 1.609344 },
];

/**
 * Riegel (1981) race-time prediction.
 * T2 = T1 × (D2 / D1)^1.06
 *
 * PROVENANCE (citation check, 2026-08-20). Riegel 1981 (Am Sci 69(3):285-90,
 * PMID 7235349) fitted this exponent to WORLD RECORDS across 100 m to 100 miles.
 * He did not treat 1.06 as universal — separate values were fitted by sport and
 * by age and sex group. It is a world-record-derived constant applied to
 * recreational runners, which is the root of the bias documented below.
 */
export const RIEGEL_EXPONENT = 1.06;
export function riegel(knownSeconds, knownKm, targetKm, exponent = RIEGEL_EXPONENT) {
  if (!(knownSeconds > 0) || !(knownKm > 0) || !(targetKm > 0)) return null;
  return knownSeconds * Math.pow(targetKm / knownKm, exponent);
}

/** Marathon distance in km, for the calibration exception below. */
export const MARATHON_KM = 42.195;

/** The race distances Vickers & Vertosick (2016) studied, other than the marathon. */
const STUDIED_KM = { min: 5, max: 21.0975 };

/**
 * What the evidence says about one Riegel prediction.
 *
 * Vickers & Vertosick 2016 (BMC Sports Sci Med Rehabil 8:26, N = 2,303 recreational runners)
 * found Riegel "well-calibrated for races up to a half-marathon", but that it "dramatically
 * underestimated marathon time, giving times at least 10 min too fast for half of runners".
 * They studied 5K, 10K, half-marathon and marathon times only.
 *
 * v2.38.7 (item 45, batch 4) removed the distance-ratio bands (≤2.5 "good", ≤5 "fair", else
 * "poor"): no source gives them. Now:
 *   'marathon'  — a marathon target: the finding above, as a warning;
 *   'untested'  — either distance outside 5K to the half marathon (the mile, a custom
 *                 distance, or predicting from a marathon): the study did not cover it;
 *   'ok'        — both between 5K and the half marathon: nothing to add.
 */
export function riegelConfidence(knownKm, targetKm) {
  if (Math.abs(targetKm - MARATHON_KM) < 0.5) {
    return {
      level: 'marathon',
      note: 'Probably too fast. In a study of 2,303 recreational runners, Riegel\'s marathon '
          + 'times were at least 10 minutes too fast for half of them.',
    };
  }
  const inStudy = km => km >= STUDIED_KM.min - 0.01 && km <= STUDIED_KM.max + 0.01;
  if (!inStudy(knownKm) || !inStudy(targetKm)) {
    return {
      level: 'untested',
      note: 'Not checked by the study of Riegel\'s accuracy.',
    };
  }
  return { level: 'ok', note: null };
}

/** Even splits for a target time. */
export function splits(totalSeconds, km, everyKm = 1) {
  const secPerKm = paceFromTime(totalSeconds, km);
  const out = [];
  for (let d = everyKm; d <= km + 1e-9; d += everyKm) {
    out.push({ km: Math.round(d * 100) / 100, cumulative: secPerKm * d });
  }
  const last = out[out.length - 1];
  if (!last || Math.abs(last.km - km) > 0.01) {
    out.push({ km: Math.round(km * 100) / 100, cumulative: totalSeconds });
  }
  return out;
}
