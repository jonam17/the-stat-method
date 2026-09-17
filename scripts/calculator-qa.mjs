#!/usr/bin/env node
/**
 * Phase 5 static/logic QA. Designed to run without Astro/React installed.
 * Checks the contract between the tool registry, pages, shared input primitive,
 * and calculator source files, then exercises representative engine outputs.
 */
import { existsSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const fail = [];
const pass = [];
const ok = (msg) => pass.push(msg);
const bad = (msg) => fail.push(msg);
const read = p => readFileSync(join(ROOT, p), 'utf8');

const { TOOLS } = await import(pathToFileURL(join(ROOT, 'src/data/tools.js')));
const live = TOOLS.filter(t => t.live && t.slug);
const routes = new Set(live.map(t => `/tools/${t.slug}/`));
const categories = new Set(live.map(t => t.category));

if (live.length === 18) ok('18 live tools registered');
else bad(`Expected 18 live tools, found ${live.length}`);
if (categories.size === 6) ok('6 calculator categories registered');
else bad(`Expected 6 categories, found ${categories.size}`);

for (const tool of live) {
  const routeFile = `src/pages/tools/${tool.slug}.astro`;
  if (!existsSync(join(ROOT, routeFile))) bad(`${tool.slug}: missing page ${routeFile}`);
  else ok(`${tool.slug}: page exists`);
  if (!tool.category) bad(`${tool.slug}: missing category`);
  for (const rel of (tool.related || [])) {
    const target = TOOLS.find(t => t.slug === rel);
    if (!target || !target.live) bad(`${tool.slug}: related tool ${rel} is missing or not live`);
  }
  const page = read(routeFile);
  if (!page.includes('<ToolLayout')) bad(`${tool.slug}: not wrapped by ToolLayout`);
  if (!page.includes('client:load')) bad(`${tool.slug}: calculator island is not client:load`);
}

const jsxFiles = live.map(t => join(ROOT, `src/components/${componentFor(t.slug)}.jsx`)).filter(Boolean);
function componentFor(slug) {
  const map = {
    'macro-calculator':'MacroCalculator','tdee-calculator':'TdeeCalculator','body-fat':'BodyFatCalculator',
    'ffmi':'FfmiCalculator','deficit-planner':'DeficitPlanner','one-rep-max':'OneRepMaxCalculator',
    'heart-rate-zones':'CardioCalculator','calories-burned':'CardioCalculator','powerlifting-score':'PowerliftingScore',
    'strength-standards':'StrengthStandards','rpe-converter':'RpeConverter','plate-loader':'PlateLoader',
    'hand-portions':'HandPortions','protein-target':'ProteinTarget','healthy-weight':'HealthyWeight',
    'sleep-calculator':'SleepCalculator','running-pace':'RunningPace','caffeine-half-life':'CaffeineHalfLife',
  };
  return map[slug] || null;
}

// Shared Num contract: every use of <Num in live calculator components must provide min and max.
for (const file of [...new Set(jsxFiles)]) {
  if (!file || !existsSync(file)) continue;
  const rel = file.slice(ROOT.length + 1);
  const text = readFileSync(file, 'utf8');
  const uses = [];
  for (let pos = 0; ; ) {
    const start = text.indexOf('<Num', pos);
    if (start < 0) break;
    let end = start + 4;
    while (end < text.length) {
      const hit = text.indexOf('/>', end);
      if (hit < 0) { end = -1; break; }
      if (text[hit - 1] !== '<') { end = hit + 2; break; }
      end = hit + 2;
    }
    if (end < 0) break;
    uses.push(text.slice(start + 4, end - 2));
    pos = end;
  }
  for (const props of uses) {
    if (!/\bmin\s*=/.test(props) || !/\bmax\s*=/.test(props)) {
      bad(`${rel}: <Num> missing min/max bounds`);
    }
  }
  if (uses.length) ok(`${rel}: ${uses.length} <Num> uses have bounds`);

  // Native numeric inputs must remain bounded too.
  const numberInputs = [...text.matchAll(/<input\b([\s\S]*?)\btype=["']number["']([\s\S]*?)(?:\/>|>)/g)]
    .map(m => `${m[1]} ${m[2]}`);
  for (const attrs of numberInputs) {
    if (!/\bmin\s*=/.test(attrs) || !/\bmax\s*=/.test(attrs)) {
      bad(`${rel}: native number input missing min/max bounds`);
    }
  }
}

const tools = read('src/data/tools.js');
if (/Cut applies a 500 kcal deficit/i.test(read('src/data/tool-guides.js'))) {
  bad('tool guide still contains stale fixed 500 kcal goal copy');
} else ok('goal guidance matches proportional goal model');
if (/function Seg\(/.test(read('src/components/MacroCalculator.jsx'))) bad('MacroCalculator still has a duplicate local Seg primitive');
else ok('MacroCalculator uses shared Seg primitive');
if (/function Num\(/.test(read('src/components/MacroCalculator.jsx'))) bad('MacroCalculator still has a duplicate local Num primitive');
else ok('MacroCalculator uses shared Num primitive');

// Representative engine sanity checks: import without React/Astro.
const engine = await import(pathToFileURL(join(ROOT, 'src/engine/index.js')));
const safety = await import(pathToFileURL(join(ROOT, 'src/engine/safety.js')));
const mifflin = engine.mifflinStJeor({ kg: 80, cm: 178, age: 30, sex: 'male' });
if (Math.abs(mifflin - 1767.5) < 0.1) ok('Mifflin-St Jeor representative output is sane');
else bad(`Unexpected Mifflin output: ${mifflin}`);
const tdee = engine.tdee(mifflin, engine.ACTIVITY.moderate.factor);
if (tdee > 2700 && tdee < 2750) ok('TDEE representative output is sane');
else bad(`Unexpected TDEE output: ${tdee}`);
const scopeYoung = safety.ageInScope(17);
const scopeAdult = safety.ageInScope(30);
if (!scopeYoung.ok && scopeYoung.reason === 'young' && scopeAdult.ok) ok('Age safety scope behaves correctly');
else bad('Age safety scope regression');
const floor = safety.checkIntake(1000, 'male');
if (floor.intake === 1500 && floor.belowFloor) ok('Calorie floor rail behaves correctly');
else bad('Calorie floor rail regression');

console.log('\nThe Stat Method Phase 5 QA');
console.log('─'.repeat(64));
for (const msg of pass) console.log(`✓ ${msg}`);
if (fail.length) {
  console.log(`\nFAILURES (${fail.length})`);
  for (const msg of fail) console.log(`✗ ${msg}`);
}
console.log(`\n${live.length} live tools · ${pass.length} checks passed · ${fail.length} failure(s)`);
if (fail.length) process.exit(1);
