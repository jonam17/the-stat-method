/**
 * Library charts, built from a nutrient's own data file — so every nutrient
 * page gets its chart automatically, and the chart cannot disagree with the
 * figures printed beside it.
 */
const fmtN = v => (Number.isInteger(v) ? String(v) : v.toFixed(1));

/** How far one serving of each listed food goes toward an adult's daily amount. */
export function sourcesChart(n) {
  const d = n.data;
  const row = d.intake.rows.find(r => r.group === '19–50');
  // Where men's and women's values differ, use the higher, so no food looks
  // like more of a day's worth than it is for anyone.
  const daily = Math.max(row.male, row.female);
  const pct = v => (v / daily) * 100;
  const rows = d.sources.foods.map(f => {
    const [lo, hi] = Array.isArray(f.amount) ? f.amount : [null, f.amount];
    return {
      label: f.short ?? f.food,
      lo: lo == null ? null : pct(lo), value: pct(hi),
      display: lo == null ? `${Math.round(pct(hi))}%` : `${Math.round(pct(lo))}–${Math.round(pct(hi))}%`,
    };
  });
  const same = row.male === row.female;
  return {
    type: 'bar', kind: 'source', source: 'the NIH fact sheet',
    // "vitamin D", "calcium", "folate": lower-case the first letter only.
    title: `How far one serving goes toward a day's ${d.name[0].toLowerCase() + d.name.slice(1)}`,
    desc: `Percentage of the adult daily amount of ${d.name} provided by one serving of each food listed.`,
    caption: `Against the ${d.intake.type === 'RDA' ? 'recommended' : 'adequate'} daily amount for adults 19 to 50: ` +
      `${fmtN(daily)} ${d.unit}${same ? '' : ', the higher of the values for men and women'}. ` +
      'Where a food varies by brand, the bar shows the lowest figure and the label the full range.',
    x: { label: `Percent of the adult daily amount (${fmtN(daily)} ${d.unit})` },
    reference: { value: 100, label: "One day's amount" },
    rows,
  };
}
