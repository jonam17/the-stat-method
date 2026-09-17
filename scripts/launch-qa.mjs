#!/usr/bin/env node
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const dist = join(root, 'dist');
const checks = [];
const fail = (msg) => checks.push({ ok: false, msg });
const pass = (msg) => checks.push({ ok: true, msg });

if (!existsSync(dist)) {
  console.error('LAUNCH QA — run `npm run build` first so dist/ exists.');
  process.exit(1);
}

const required = [
  'index.html',
  '404.html',
  'robots.txt',
  'sitemap-index.xml',
  'manifest.webmanifest',
  'tools/index.html',
  'articles/index.html',
  'methodology/index.html',
  'privacy/index.html',
  'terms/index.html',
];
for (const rel of required) {
  const ok = existsSync(join(dist, rel));
  (ok ? pass : fail)(`${rel} ${ok ? 'exists' : 'missing'}`);
}

const htmlFiles = [];
function walk(dir) {
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry);
    const st = statSync(path);
    if (st.isDirectory()) walk(path);
    else if (entry.endsWith('.html')) htmlFiles.push(path);
  }
}
walk(dist);

const forbidden = [/YOUR_NAME/g, /YOUR_HANDLE/g, /YOUR_STOREFRONT/g, /FILL_ME_/g, /FILL-ME-DOMAIN/g, /groundtruth\.fit/gi];
let placeholderHits = 0;
for (const file of htmlFiles) {
  const text = readFileSync(file, 'utf8');
  for (const rx of forbidden) {
    if (rx.test(text)) placeholderHits += 1;
    rx.lastIndex = 0;
  }
}
(placeholderHits === 0 ? pass : fail)(
  placeholderHits === 0 ? 'no launch placeholders in rendered HTML' : `${placeholderHits} placeholder match(es) found in rendered HTML`
);

const robots = readFileSync(join(dist, 'robots.txt'), 'utf8');
(pass || fail)(robots.includes('Sitemap:') ? 'robots.txt declares a sitemap' : 'robots.txt missing Sitemap directive');

const manifest = JSON.parse(readFileSync(join(dist, 'manifest.webmanifest'), 'utf8'));
(manifest.name && manifest.start_url && manifest.display ? pass : fail)(
  manifest.name && manifest.start_url && manifest.display ? 'web manifest has name/start_url/display' : 'web manifest is incomplete'
);

const headersSource = join(root, 'public/_headers');
const headers = existsSync(headersSource) ? readFileSync(headersSource, 'utf8') : '';
for (const header of ['X-Content-Type-Options', 'Referrer-Policy', 'Permissions-Policy', 'Content-Security-Policy']) {
  (headers.includes(header) ? pass : fail)(`${header} present in Cloudflare headers`);
}

console.log('\nThe Stat Method Launch QA\n' + '─'.repeat(72));
for (const c of checks) console.log(`${c.ok ? '✓' : '✗'} ${c.msg}`);
const failures = checks.filter(c => !c.ok).length;
console.log(`\n${checks.length} checks · ${failures} failure(s)`);
if (failures) process.exit(1);
console.log('Launch artifact structure is healthy. Complete owner-specific production values and smoke tests before deployment.');
