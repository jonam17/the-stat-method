#!/usr/bin/env node
/**
 * Weekly external link check (roadmap item 24).
 *
 *   npm run build && npm run links
 *
 * Reads every external link from the built site in dist/, so drafts are never
 * checked and the list is exactly what visitors see: article references, the
 * Library's sources, the Resources page and links in page text. Logic and the
 * meaning of the three outcomes are in scripts/lib/links.mjs.
 *
 * Exits 1 only when a link is broken (gone, or no such domain, twice).
 * "Couldn't check" never fails the run. Exits 3 if the machine can't reach
 * the internet at all, so a network outage is never reported as broken links. Runs weekly in .github/workflows/links.yml,
 * apart from CI and deploys, so it can never block a release.
 *
 * Options: --dir <folder> (default dist), --json <file> (also write results).
 */
import { readFileSync, readdirSync, statSync, existsSync, appendFileSync, writeFileSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { collectLinks, checkAll, report, networkReachable } from './lib/links.mjs';

const arg = (name, fallback) => {
  const i = process.argv.indexOf(`--${name}`);
  return i > 0 ? process.argv[i + 1] : fallback;
};
const DIR = arg('dir', 'dist');
const JSON_OUT = arg('json', null);

if (!existsSync(DIR)) {
  console.error(`${DIR}/ not found. Run \`npm run build\` first.`);
  process.exit(2);
}

function htmlFiles(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) out.push(...htmlFiles(p));
    else if (name.endsWith('.html')) out.push(p);
  }
  return out;
}
const pageOf = file => '/' + relative(DIR, file).split(sep).join('/').replace(/(^|\/)index\.html$/, '$1').replace(/\.html$/, '');

const pages = htmlFiles(DIR).map(f => ({ page: pageOf(f), html: readFileSync(f, 'utf8') }));
const linkMap = collectLinks(pages);
const urls = [...linkMap.keys()].sort();
console.log(`Checking ${urls.length} external links from ${pages.length} pages…`);

// No network means nothing can be checked. Say that, rather than reporting
// every link as broken. The run still fails, because no check happened.
if (!(await networkReachable())) {
  const msg = "## External link check\n\nThis machine couldn't reach the internet (doi.org and google.com both " +
    'failed), so no links were checked. Nothing here says anything about the links themselves; run it again later.\n';
  console.log('\n' + msg);
  if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, msg);
  process.exit(3);
}

let done = 0;
const results = await checkAll(urls, {
  onResult: (url, r) => {
    done += 1;
    if (r.outcome !== 'ok') console.log(`  ${r.outcome === 'broken' ? '✗' : '?'} ${url} — ${r.status ?? ''} ${r.detail}`.trimEnd());
    if (done % 50 === 0) console.log(`  … ${done}/${urls.length}`);
  },
});

const { markdown, broken } = report(linkMap, results);
console.log('\n' + markdown);
if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, markdown + '\n');
if (JSON_OUT) writeFileSync(JSON_OUT, JSON.stringify(Object.fromEntries(results), null, 2));
process.exit(broken ? 1 : 0);
