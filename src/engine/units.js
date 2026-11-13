/** Unit conversion + formatting helpers. */
export const LB_TO_KG = 0.45359237;   // exact international avoirdupois (F-011)
export const IN_TO_CM = 2.54;

export const lbToKg = lb => lb * LB_TO_KG;
export const kgToLb = kg => kg / LB_TO_KG;
// An amount per kilogram of body weight restated per pound (v2.38.12, amino acids):
// a pound is 0.4536 kg, so it needs 0.4536 times the per-kg amount. One decimal,
// because the per-kg values are whole numbers and a pound is under half a kilogram:
// histidine's 14 mg/kg is 6.4 mg/lb.
export const perKgToPerLb = v => Math.round(v * LB_TO_KG * 10) / 10;
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
