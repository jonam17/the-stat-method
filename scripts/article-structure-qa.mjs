#!/usr/bin/env node
/**
 * Article template conformance.
 *
 * Three articles drifted from the template unnoticed — two used Markdown `##`
 * headings, so their contents lists had nothing to anchor to, and none of the
 * three had section summaries. Nothing failed; the pages just quietly read
 * differently from the other sixteen. This makes that drift fail the build.
 */
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const DIR = 'src/content/articles';
const failures = [];
const files = readdirSync(DIR).filter(f => /\.mdx?$/.test(f));

for (const f of files) {
  const s = readFileSync(join(DIR, f), 'utf8');
  const name = f.replace(/\.mdx?$/, '');
  const fail = m => failures.push(`${name}: ${m}`);

  const mdHeadings = (s.match(/^## /gm) || []).length;
  if (mdHeadings) fail(`${mdHeadings} Markdown "##" heading(s) — use <h2 id="..."> so the contents list can anchor`);

  const h2 = (s.match(/<h2/g) || []).length;
  const summaries = (s.match(/class="summary"/g) || []).length;
  if (h2 < 3) fail(`only ${h2} sections`);
  // Every section bar the last carries a summary; the last is itself a close.
  if (summaries < h2 - 1) fail(`${summaries} summaries for ${h2} sections (expected ${h2 - 1})`);

  for (const field of ['keyTakeaways:', 'toc:', 'category:', 'conclusion:', 'references:']) {
    if (!s.includes(field)) fail(`missing ${field.replace(':', '')}`);
  }

  for (const m of s.matchAll(/<h2 id="([^"]+)"/g)) {
    if (!s.includes(`id: "${m[1]}"`)) fail(`heading #${m[1]} is not in the toc`);
  }
}

console.log(`\nArticle structure — ${files.length} articles checked`);
if (failures.length) {
  failures.forEach(f => console.log(`  ✗ ${f}`));
  console.log(`\n${failures.length} failure(s)\n`);
  process.exit(1);
}
console.log('  ✓ all conform to the template\n');
