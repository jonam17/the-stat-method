#!/usr/bin/env node
/**
 * Citation verification helper.
 *
 * Two checks per citation, and they are not the same amount of work:
 *   1. exists  — the paper is real; journal, year, volume, pages correct
 *   2. supports — it backs the SPECIFIC claim it is attached to
 * Only mark verified when both pass.
 *
 *   node scripts/citations.mjs status              # what is left, by priority
 *   node scripts/citations.mjs list <article>      # numbered refs for one article
 *   node scripts/citations.mjs mark <article> <n>  # mark ref n verified
 */
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const DIR = 'src/content/articles';
const files = readdirSync(DIR).filter(f => /\.mdx?$/.test(f));
const read = f => readFileSync(join(DIR, f), 'utf8');
const fm = s => s.split('---')[1] ?? '';

function refs(s) {
  const block = fm(s).match(/^references:\n((?:(?:  #.*|  - .*|    .*)\n)*)/m);
  if (!block) return [];
  return [...block[1].matchAll(/-\s*text:\s*"?(.*?)"?\s*\n((?:    .*\n)*)/g)]
    .map(m => ({ text: m[1].trim(), verified: /verified:\s*true/.test(m[2]) }));
}

const cmd = process.argv[2] ?? 'status';

if (cmd === 'status') {
  let tot = 0, ver = 0;
  const rows = files.map(f => {
    const s = read(f), r = refs(s);
    const v = r.filter(x => x.verified).length;
    tot += r.length; ver += v;
    // Every article on this site backs a tool, so article-level tiering does not
    // partition anything — see docs/citation-checklist.md. Tiering is now judged
    // per citation, against the sentence it supports. This flag is kept only to
    // surface which articles make explicit clinical claims.
    const full = /clinicalClaims:\s*true/.test(fm(s)) || /relatedTool:/.test(fm(s));
    return { f, n: r.length, v, clinical: full,
             tier: (fm(s).match(/citationsVerified:\s*(\w+)/) || [])[1] || '-' };
  }).sort((a, b) => (b.clinical - a.clinical) || ((b.n - b.v) - (a.n - a.v)));

  console.log(`\n${ver} of ${tot} citations verified\n`);
  console.log('  tier-full  verified  published  article');
  for (const r of rows) {
    if (r.n === 0) continue;
    const bar = r.v === r.n ? '  done' : `${r.v}/${r.n}`.padStart(6);
    console.log(`  ${r.clinical ? '    yes  ' : '     -   '} ${bar}   ${r.tier.padEnd(9)}  ${r.f}`);
  }
  console.log('\nChecks: 1 exists · 2 supports the claim · 3 population fit · 4 provenance');
  console.log('        5 funding/COI · 6 superseded since   (docs/citation-checklist.md)');
  console.log('\nAll articles back a tool — tier per CITATION, not per article.');
  console.log('Full: supplies a number the code uses, or supports a health/risk claim.');
  console.log('Light: background or context only.\n');
}

/**
 * Publish the claim — only allowed at 100%.
 *
 * A public "2 of 5 verified" reads weaker than saying nothing, and a
 * half-checked article looks worse to a reader than an untouched one. So the
 * claim is all-or-nothing: work in progress lives in the per-citation flags,
 * and only a complete article says anything to the reader.
 */
if (cmd === 'complete') {
  const f = process.argv[3];
  let s = read(f);
  const r = refs(s);
  const v = r.filter(x => x.verified).length;
  if (v !== r.length) {
    console.error(`refusing: ${v}/${r.length} checked. Finish the article first.`);
    process.exit(1);
  }
  if (!/citationsVerified:/.test(fm(s))) {
    s = s.replace(/^(readMinutes:.*)$/m,
      `$1\ncitationsVerified: full\ncitationsVerifiedDate: ${new Date().toISOString().slice(0, 10)}`);
    writeFileSync(join(DIR, f), s);
  }
  console.log(`${f}: all ${r.length} citations checked — now claims "All ${r.length} citations".`);
}

/**
 * Show which reference each inline marker points at, for manual review.
 *
 * WHY THIS IS A COMMAND AND NOT A LINT: inserting a citation renumbers every
 * marker after it, and a shifted marker that still lands in range cannot be
 * detected automatically — [4] pointing at the wrong paper is well-formed. An
 * automated check for it fires on every legitimately unpointed background
 * reference, and a warning that is usually wrong gets ignored.
 *
 * So: run this after editing a reference list, and read it.
 */
if (cmd === 'markers') {
  const f = process.argv[3];
  const s = read(f);
  const r = refs(s);
  const body = s.split('---').slice(2).join('---');
  const seen = [...new Set([...body.matchAll(/\[(\d+)\]/g)].map(m => Number(m[1])))].sort((a, b) => a - b);
  if (!seen.length) {
    console.log(`${f}: no inline markers`);
  } else {
    for (const n of seen) {
      const ref = r[n - 1];
      console.log(`  [${n}] -> ${ref ? ref.text.slice(0, 78) : '*** OUT OF RANGE ***'}`);
    }
    console.log('\nCheck each marker actually supports the sentence it sits on.');
  }
}

if (cmd === 'list') {
  const f = process.argv[3];
  refs(read(f)).forEach((r, i) =>
    console.log(`  [${i + 1}] ${r.verified ? '✓' : ' '} ${r.text}`));
}

/**
 * Validate frontmatter shape before/after edits. Catches the failure I hit by
 * hand: appending a `url:` to a reference that already had one produces a
 * duplicate YAML key, which fails the build with an opaque js-yaml stack trace.
 */
function lint(f) {
  const s = read(f);
  const block = fm(s).match(/^references:\n((?:(?:  #.*|  - .*|    .*)\n)*)/m);
  const problems = [];
  if (block) {
    const entries = block[1].split(/(?=  - text:)/).filter(Boolean);
    entries.forEach((e, i) => {
      for (const key of ['url', 'verified', 'text']) {
        const n = (e.match(new RegExp(`^\\s*${key}:`, 'gm')) || []).length;
        if (n > 1) problems.push(`ref [${i + 1}]: duplicate "${key}" key (${n}x)`);
      }
      const t = e.match(/text:\s*(.*)/)?.[1] ?? '';
      if (/:/.test(t) && !/^["']/.test(t.trim()))
        problems.push(`ref [${i + 1}]: text contains ":" and must be quoted`);
    });
  }
  // Inline [n] markers must point at a reference that exists. Inserting a
  // citation renumbers everything after it, which silently invalidates markers
  // already placed — this catches the out-of-range half of that failure.
  const body = s.split('---').slice(2).join('---');
  const refCount = (block ? block[1].split(/(?=  - text:)/).filter(Boolean).length : 0);
  const markers = [...body.matchAll(/\[(\d+)\]/g)].map(m => Number(m[1]));
  for (const n of new Set(markers)) {
    if (n > refCount) problems.push(`inline marker [${n}] but only ${refCount} references`);
  }
  if (markers.length && refCount === 0) problems.push('inline markers but no references');

  return problems;
}

/**
 * Strip duplicate `url:` keys within a reference entry, keeping the first.
 *
 * This is the single most common way these files get broken: appending a url to
 * an entry that already has one yields a duplicate YAML key and an opaque
 * js-yaml stack trace at build. It happened five times during the first
 * verification pass. Cheap to fix mechanically; expensive to debug by hand.
 */
if (cmd === 'dedupe') {
  let fixed = 0;
  for (const f of files) {
    const s = read(f);
    const out = [];
    let seen = false;
    for (const line of s.split('\n')) {
      if (/^  - /.test(line)) seen = false;
      if (/^    url:/.test(line)) { if (seen) continue; seen = true; }
      out.push(line);
    }
    const next = out.join('\n');
    if (next !== s) { writeFileSync(join(DIR, f), next); fixed++; console.log(`  deduped ${f}`); }
  }
  console.log(fixed ? `${fixed} file(s) fixed` : 'no duplicate url keys');
}

if (cmd === 'lint') {
  let bad = 0;
  for (const f of files) {
    const p = lint(f);
    if (p.length) { bad++; console.log(`\n${f}`); p.forEach(x => console.log(`  ${x}`)); }
  }
  console.log(bad ? `\n${bad} file(s) with problems` : 'frontmatter clean');
  process.exit(bad ? 1 : 0);
}

if (cmd === 'mark') {
  const f = process.argv[3], n = Number(process.argv[4]);
  let s = read(f), seen = 0;
  s = s.replace(/(-\s*text:\s*.*\n(?:    (?!verified)\S.*\n)*)/g, (m) => {
    seen++;
    return seen === n && !/verified:/.test(m) ? `${m}    verified: true\n` : m;
  });
  writeFileSync(join(DIR, f), s);
  const problems = lint(f);
  if (problems.length) {
    console.error(`frontmatter problem in ${f} — fix before building:`);
    problems.forEach(x => console.error(`  ${x}`));
  }
  const r = refs(read(f));
  const v = r.filter(x => x.verified).length;
  console.log(`marked [${n}] in ${f} — ${v}/${r.length} checked`);
  if (v === r.length) console.log(`  all citations checked. run: npm run citations complete ${f}`);
  else console.log(`  ${r.length - v} to go. The article makes no public claim until all are done.`);
}
