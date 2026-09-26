#!/usr/bin/env node
/**
 * npm run topics — every article, grouped by category, with its status.
 *
 * Read from the article files themselves rather than kept as a hand-maintained
 * list, so it cannot drift from what exists. Run before drafting anything new
 * to avoid writing an article that already exists.
 */
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const DIR = 'src/content/articles';
const today = new Date().toISOString().slice(0, 10);
const field = (s, k) => (s.match(new RegExp(`^${k}:\\s*"?(.*?)"?\\s*$`, 'm')) || [])[1] || '';

const rows = readdirSync(DIR).filter(f => /\.mdx?$/.test(f)).map(f => {
  const s = readFileSync(join(DIR, f), 'utf8');
  const date = field(s, 'published');
  const draft = /^draft:\s*true\s*$/m.test(s);
  return {
    slug: f.replace(/\.mdx?$/, ''), title: field(s, 'title'), category: field(s, 'category'),
    date, tool: field(s, 'relatedTool'),
    status: draft ? 'DRAFT' : date > today ? 'SCHEDULED' : 'LIVE',
  };
});

const order = ['Nutrition', 'Exercise', 'Health', 'Recovery'];
console.log(`\nArticles — ${rows.length} total · ` +
  ['LIVE', 'SCHEDULED', 'DRAFT'].map(k => `${rows.filter(r => r.status === k).length} ${k.toLowerCase()}`).join(' · '));
for (const cat of order) {
  const list = rows.filter(r => r.category === cat).sort((a, b) => a.date.localeCompare(b.date));
  if (!list.length) continue;
  console.log(`\n${cat} (${list.length})`);
  for (const r of list) console.log(`  ${r.status.padEnd(9)} ${r.date}  ${r.title}`);
}
const upcoming = rows.filter(r => r.status === 'SCHEDULED').sort((a, b) => a.date.localeCompare(b.date));
if (upcoming.length) {
  console.log('\nPublishing queue');
  upcoming.forEach(r => console.log(`  ${r.date}  ${r.title}`));
}
console.log('');
