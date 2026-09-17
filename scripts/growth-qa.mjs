#!/usr/bin/env node
/**
 * Phase 9 growth/SEO QA. Run after `npm run build`.
 * Keeps the initial acquisition set healthy without requiring a browser.
 */
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const dist = join(root, 'dist');
const fail = [];
const pass = [];
const ok = (condition, good, bad) => (condition ? pass.push(good) : fail.push(bad));

const priority = [
  '/tools/tdee-calculator/',
  '/tools/macro-calculator/',
  '/tools/body-fat/',
  '/tools/one-rep-max/',
  '/tools/protein-target/',
];

if (!existsSync(dist)) {
  console.error('GROWTH QA — run `npm run build` first.');
  process.exit(1);
}

const html = (path) => readFileSync(join(dist, path, 'index.html'), 'utf8');
const attr = (text, selector) => {
  const m = text.match(selector);
  return m?.[1] ?? '';
};

for (const path of priority) {
  const file = path.replace(/^\//, '') + 'index.html';
  const exists = existsSync(join(dist, file));
  ok(exists, `${path} exists`, `${path} missing`);
  if (!exists) continue;

  const text = html(path.replace(/\/$/, ''));
  const title = attr(text, /<title>([^<]+)<\/title>/i);
  const description = attr(text, /<meta name="description" content="([^"]*)"/i);
  const canonical = attr(text, /<link rel="canonical" href="([^"]+)"/i);
  const og = attr(text, /<meta property="og:title" content="([^"]+)"/i);
  const schema = text.includes('"@type":"WebApplication"');
  const toolsLink = text.includes('href="/tools/"');

  ok(title && title.length <= 65, `${path} title is ${title.length} chars`, `${path} title missing/too long`);
  ok(description.length >= 70 && description.length <= 165, `${path} description length is ${description.length}`, `${path} description should be 70–165 chars`);
  ok(canonical.endsWith(path), `${path} canonical matches route`, `${path} canonical mismatch`);
  ok(Boolean(og), `${path} has OG title`, `${path} missing OG title`);
  ok(schema, `${path} has WebApplication schema`, `${path} missing WebApplication schema`);
  ok(toolsLink, `${path} links back to toolkit`, `${path} has no toolkit link`);
}

const sitemapIndex = readFileSync(join(dist, 'sitemap-index.xml'), 'utf8');
const robots = readFileSync(join(dist, 'robots.txt'), 'utf8');
ok(sitemapIndex.includes('sitemap-'), 'sitemap index references sitemap files', 'sitemap index has no child sitemap references');
ok(/Sitemap:\s*https?:\/\//i.test(robots), 'robots.txt declares an absolute sitemap URL', 'robots.txt sitemap directive is not absolute');

console.log('\nThe Stat Method Phase 9 Growth QA\n' + '─'.repeat(72));
for (const msg of pass) console.log('✓ ' + msg);
for (const msg of fail) console.log('✗ ' + msg);
console.log(`\n${pass.length + fail.length} checks · ${fail.length} failure(s)`);
if (fail.length) process.exit(1);
console.log('Growth foundation is structurally healthy.');
