#!/usr/bin/env node
/**
 * The README's headline counts must match the repository.
 *
 * "20 calculators · 20 sourced articles · 444 unit tests" stayed on the README while the
 * tests passed 1,000 and the articles reached 23 — a claim about the site that had stopped
 * being true (CONVENTIONS §12). Fixing it by hand twice did not keep it fixed; this check does.
 *
 * Counted the way the headline means them:
 *   calculators — live tools with a page (liveTools() with a slug)
 *   articles    — article files that are not drafts (live or scheduled)
 *   unit tests  — every test Vitest collects (`vitest list --json`, which runs nothing)
 */
import { readFileSync, readdirSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { liveTools } from '../src/data/tools.js';

const DIR = 'src/content/articles';
const calculators = liveTools().filter(t => t.slug).length;
const articles = readdirSync(DIR)
  .filter(f => /\.mdx?$/.test(f))
  .filter(f => !/^draft:\s*true\s*$/m.test(readFileSync(`${DIR}/${f}`, 'utf8').split(/\r?\n---/)[0]))
  .length;
const tests = JSON.parse(execSync('npx vitest list --json', { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] })).length;

const readme = readFileSync('README.md', 'utf8');
const m = readme.match(/\*\*(\d[\d,]*) calculators · (\d[\d,]*) sourced articles · (\d[\d,]*) unit tests/);
const num = s => Number(s.replace(/,/g, ''));
const fmt = n => n.toLocaleString('en-US');

const failures = [];
if (!m) failures.push('README headline "N calculators · N sourced articles · N unit tests" not found');
else {
  const [, c, a, t] = m;
  if (num(c) !== calculators) failures.push(`calculators: README says ${c}, the registry has ${calculators}`);
  if (num(a) !== articles) failures.push(`articles: README says ${a}, there are ${articles} non-draft articles`);
  if (num(t) !== tests) failures.push(`unit tests: README says ${t}, Vitest collects ${fmt(tests)}`);
}

console.log(`\nREADME headline — ${calculators} calculators · ${articles} articles · ${fmt(tests)} tests`);
if (failures.length) {
  failures.forEach(f => console.log(`  ✗ ${f}`));
  console.log('  Update the headline in README.md (CONVENTIONS §12).\n');
  process.exit(1);
}
console.log('  ✓ matches the repository\n');
