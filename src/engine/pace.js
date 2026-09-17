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

/**
 * How much to trust a Riegel prediction.
 *
 * MARATHON EXCEPTION (citation check, 2026-08-20). This used to key on distance
 * ratio alone, which returned the HIGHEST confidence for half-marathon ->
 * marathon (ratio 2.0) — the exact case the cited evidence says is worst.
 *
 * Vickers & Vertosick 2016 (BMC Sports Sci Med Rehabil 8:26, N=2303) found
 * Riegel well-calibrated up to the half marathon, but that it underestimated
 * marathon time by at least 10 minutes for half of recreational runners
 * (MSE 380.7 vs 208.3 for a model using prior race times). The failure is not
 * about extrapolation distance; it is a systematic optimism at marathon
 * distance for anyone who is not a world-record holder.
 *
 * So marathon targets are capped at 'fair' regardless of how close the input
 * race is, and say why.
 *
 * Otherwise: how much to trust a Riegel prediction, based on the distance ratio.
 * A 10K-to-half-marathon extrapolation (ratio ~2.1) is a standard, reliable
 * prediction, so the "good" band extends to 2.5 rather than 2.
 */
export function riegelConfidence(knownKm, targetKm) {
  const ratio = Math.max(targetKm / knownKm, knownKm / targetKm);

  // Marathon targets: never 'good', whatever the ratio.
  if (Math.abs(targetKm - MARATHON_KM) < 0.5) {
    return {
      level: ratio <= 2.5 ? 'fair' : 'poor',
      note: 'Riegel is well calibrated up to the half marathon but runs optimistic '
          + 'at the marathon — in one study of 2,303 recreational runners it was at '
          + 'least 10 minutes too fast for half of them. Treat this as a floor on '
          + 'your finish time, not a target.',
    };
  }

  if (ratio <= 2.5) return { level: 'good', note: 'Distances are close; the prediction is reasonably reliable.' };
  if (ratio <= 5) return { level: 'fair', note: 'A moderate extrapolation — treat as a target, not a guarantee.' };
  return { level: 'poor', note: 'A large extrapolation. Endurance-specific training matters more than this formula can capture.' };
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
