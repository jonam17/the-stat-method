/** Unit conversion + formatting helpers. */
export const LB_TO_KG = 0.45359237;   // exact international avoirdupois (F-011)
export const IN_TO_CM = 2.54;

export const lbToKg = lb => lb * LB_TO_KG;
export const kgToLb = kg => kg / LB_TO_KG;
export const ftInToCm = (ft, inches) => (ft * 12 + inches) * IN_TO_CM;
export const cmToFtIn = cm => {
  // Round total inches ONCE, then derive both parts, so the carry propagates.
  // Rounding the remainder independently produced "5 ft 12 in" (audit F-007).
  const total = Math.round(cm / IN_TO_CM);
  return { ft: Math.floor(total / 12), in: total % 12 };
};
// F-015: guard non-finite input. Previously rendered the literal 'NaN' or '∞'
// to users whenever an upstream value was undefined or divided by zero.
export const fmt = n =>
  Number.isFinite(n) ? Math.round(n).toLocaleString('en-US') : '—';
