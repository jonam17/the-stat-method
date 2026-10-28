#!/usr/bin/env node
/**
 * DOTS and IPF GL percentiles among competition lifters, from OpenPowerlifting's
 * public-domain bulk data (https://openpowerlifting.gitlab.io/opl-csv/bulk-csv.html).
 *
 *   node scripts/opl-percentiles.mjs ~/Downloads/openpowerlifting-latest.zip
 *
 * Reads the CSV straight out of the zip (needs the `unzip` command, present on macOS), streams
 * it, and writes opl-percentiles.json next to the zip. Nothing is downloaded or uploaded.
 *
 * Filters (column meanings from OpenPowerlifting's bulk-csv docs):
 *  - Event SBD (full power) only.
 *  - Sex M or F (Mx is too small a group to chart).
 *  - Equipment Raw (= classic: bare knees or sleeves) or Single-ply (= equipped, as the IPF uses).
 *  - Place a positive number: excludes guests (G), disqualifications (DQ, DD) and no-shows (NS).
 *  - Dots present, and the meet date within the window below.
 *  - One result per lifter and category: each lifter's best DOTS in the window, so lifters who
 *    compete often are not counted many times. (GL is taken from that same result.)
 * The same figures are also computed for the drug-tested results alone (Tested = Yes).
 *
 * It also checks how OpenPowerlifting scores DOTS outside 40–210 kg (men) / 40–150 kg (women):
 * for every such result it recomputes DOTS with the bodyweight clamped to the limit and
 * unclamped, and counts which matches the published figure (PENDING item 40, point 4).
 */
import { spawn, execFileSync } from 'node:child_process';
import { createInterface } from 'node:readline';
import { writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';

const zip = process.argv[2];
if (!zip) { console.error('Usage: node scripts/opl-percentiles.mjs <path to openpowerlifting-latest.zip>'); process.exit(1); }
const YEARS = 5;
const PCTS = [5, 10, 25, 50, 75, 90, 95, 99];

const entries = execFileSync('unzip', ['-Z1', zip], { encoding: 'utf8' }).split('\n');
const csvName = entries.find(e => e.endsWith('.csv'));
if (!csvName) { console.error('No .csv found in the zip.'); process.exit(1); }

// Same coefficients as src/engine/scoring.js; written out here so the script runs on its own.
const DOTS = {
  M: { c: [-0.000001093, 0.0007391293, -0.1918759221, 24.0900756, -307.75076], min: 40, max: 210 },
  F: { c: [-0.0000010706, 0.0005158568, -0.1126655495, 13.6175032, -57.96288], min: 40, max: 150 },
};
const dotsAt = (total, bw, sex) => {
  const [A, B, C, D, E] = DOTS[sex].c;
  return total * 500 / (A * bw ** 4 + B * bw ** 3 + C * bw ** 2 + D * bw + E);
};

function splitCsv(line) {
  const out = []; let cur = ''; let q = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (q) {
      if (ch === '"') { if (line[i + 1] === '"') { cur += '"'; i++; } else q = false; }
      else cur += ch;
    } else if (ch === '"') q = true;
    else if (ch === ',') { out.push(cur); cur = ''; }
    else cur += ch;
  }
  out.push(cur);
  return out;
}

const child = spawn('unzip', ['-p', zip, csvName]);
const rl = createInterface({ input: child.stdout, crlfDelay: Infinity });
let col = null; let maxDate = ''; let rows = 0;
const parsed = [];                       // kept small: only rows that pass the filters
const clampCheck = { M: { clamped: 0, unclamped: 0, neither: 0, examples: [] }, F: { clamped: 0, unclamped: 0, neither: 0, examples: [] } };
const NEED = ['Name', 'Sex', 'Event', 'Equipment', 'BodyweightKg', 'TotalKg', 'Place', 'Dots', 'Goodlift', 'Tested', 'Date'];

for await (const line of rl) {
  if (!col) {
    const head = splitCsv(line); col = Object.fromEntries(head.map((h, i) => [h, i]));
    const missing = NEED.filter(n => !(n in col));
    if (missing.length) { console.error('Columns missing: ' + missing.join(', ') + '\nHeader: ' + head.join(',')); process.exit(1); }
    continue;
  }
  rows++;
  const f = splitCsv(line); const g = n => f[col[n]];
  const date = g('Date'); if (date > maxDate) maxDate = date;
  const sex = g('Sex'); if (sex !== 'M' && sex !== 'F') continue;
  if (g('Event') !== 'SBD') continue;
  const dots = +g('Dots'); const total = +g('TotalKg'); const bw = +g('BodyweightKg');
  if (!(dots > 0 && total > 0 && bw > 0)) continue;
  // Range check uses every valid SBD result, whatever its equipment or date.
  const lim = DOTS[sex];
  if (bw > lim.max || bw < lim.min) {
    const c = dotsAt(total, Math.min(lim.max, Math.max(lim.min, bw)), sex);
    const u = dotsAt(total, bw, sex);
    const k = Math.abs(c - dots) < 0.02 ? 'clamped' : Math.abs(u - dots) < 0.02 ? 'unclamped' : 'neither';
    clampCheck[sex][k]++;
    if (k === 'neither' && clampCheck[sex].examples.length < 5)
      clampCheck[sex].examples.push({ bw, total, published: dots, clamped: +c.toFixed(2), unclamped: +u.toFixed(2) });
  }
  const eq = g('Equipment'); if (eq !== 'Raw' && eq !== 'Single-ply') continue;
  if (!/^\d+$/.test(g('Place'))) continue;
  parsed.push({ name: g('Name'), sex, eq, date, dots, gl: +g('Goodlift') || null, tested: g('Tested') === 'Yes' });
}
await new Promise(r => child.on('close', r));

const end = new Date(maxDate + 'T00:00:00Z');
const start = new Date(end); start.setUTCFullYear(end.getUTCFullYear() - YEARS);
const from = start.toISOString().slice(0, 10);

function pct(sorted, p) {                // linear interpolation between closest ranks
  const h = (sorted.length - 1) * p / 100; const lo = Math.floor(h);
  return +(sorted[lo] + (sorted[Math.min(lo + 1, sorted.length - 1)] - sorted[lo]) * (h - lo)).toFixed(1);
}
function groups(rowsIn) {
  const best = new Map();
  for (const r of rowsIn) {
    if (r.date < from) continue;
    const k = `${r.sex}|${r.eq}|${r.name}`;
    if (!best.has(k) || r.dots > best.get(k).dots) best.set(k, r);
  }
  const out = {};
  for (const sex of ['M', 'F']) for (const eq of ['Raw', 'Single-ply']) {
    const sel = [...best.values()].filter(r => r.sex === sex && r.eq === eq);
    const d = sel.map(r => r.dots).sort((a, b) => a - b);
    const gl = sel.map(r => r.gl).filter(v => v > 0).sort((a, b) => a - b);
    out[`${sex === 'M' ? 'men' : 'women'}-${eq === 'Raw' ? 'classic' : 'equipped'}`] = {
      lifters: d.length,
      dots: d.length ? Object.fromEntries(PCTS.map(p => [p, pct(d, p)])) : null,
      glLifters: gl.length,
      gl: gl.length ? Object.fromEntries(PCTS.map(p => [p, pct(gl, p)])) : null,
    };
  }
  return out;
}

const result = {
  source: 'OpenPowerlifting bulk CSV (public domain), https://openpowerlifting.gitlab.io/opl-csv/',
  file: csvName, rowsRead: rows, latestMeet: maxDate, window: { from, to: maxDate },
  filters: 'SBD; M/F; Raw (classic) or Single-ply (equipped); numeric Place; best DOTS per lifter per category in the window',
  percentileMethod: 'linear interpolation between closest ranks',
  all: groups(parsed),
  tested: groups(parsed.filter(r => r.tested)),
  dotsOutsideRange: clampCheck,
};
const outFile = join(dirname(resolve(zip)), 'opl-percentiles.json');
writeFileSync(outFile, JSON.stringify(result, null, 2) + '\n');
console.log(JSON.stringify(result, null, 2));
console.log(`\nWritten to ${outFile} — attach that file.`);
