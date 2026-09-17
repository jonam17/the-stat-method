#!/usr/bin/env node
/**
 * Build-time placeholder guard (audit F-019, F-021).
 *
 * The byline placeholder YOUR_NAME shipped to all 18 article pages, and the
 * site URL was flagged provisional in robots.txt while feeding 42 sitemap
 * entries. Replacing them is trivial; preventing recurrence is the durable fix.
 *
 * Run against dist/ after build. Exits non-zero on any hit.
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const PATTERNS = [
  { re: /YOUR_[A-Z_]+/g,          why: 'unfilled template placeholder' },
  { re: /FILL[_-]ME[_-][A-Z]+/gi, why: 'unfilled value in src/site.config.js' },
  { re: /FILL-ME-DOMAIN\.invalid/g, why: 'production domain not set in src/site.config.js' },
  { re: /\bTODO\b|\bFIXME\b/g,  why: 'unresolved marker in shipped output' },
  { re: /example\.com/g,        why: 'placeholder domain' },
  { re: /lorem ipsum/gi,        why: 'placeholder copy' },
];

const walk = d => readdirSync(d).flatMap(f => {
  const p = join(d, f);
  return statSync(p).isDirectory() ? walk(p) : [p];
});

const target = process.argv[2] || 'dist';
const files = walk(target).filter(f => /\.(html|xml|txt|json)$/.test(f));
const hits = [];

for (const f of files) {
  const s = readFileSync(f, 'utf8');
  for (const { re, why } of PATTERNS) {
    const m = s.match(re);
    if (m) hits.push({ f, why, tokens: [...new Set(m)].join(', '), n: m.length });
  }
}

if (hits.length) {
  console.error(`\n✗ Placeholder check FAILED — ${hits.length} issue(s) in ${target}/\n`);
  const byToken = {};
  for (const h of hits) (byToken[h.tokens] ??= { n: 0, files: new Set(), why: h.why });
  for (const h of hits) { byToken[h.tokens].n += h.n; byToken[h.tokens].files.add(h.f); }
  for (const [tok, v] of Object.entries(byToken)) {
    console.error(`  ${tok}  —  ${v.why}`);
    console.error(`    ${v.n} occurrence(s) across ${v.files.size} file(s)\n`);
  }
  console.error('Fill these in before deploying. See audit findings F-019 and F-021.\n');
  process.exit(1);
}
console.log(`✓ Placeholder check passed — ${files.length} files clean.`);
