#!/usr/bin/env node
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const siteConfig = readFileSync(join(root, 'src/site.config.js'), 'utf8');
const required = {
  PUBLIC_SITE_URL: process.env.PUBLIC_SITE_URL || '',
  STATMETHOD_GITHUB_HANDLE: process.env.STATMETHOD_GITHUB_HANDLE || '',
  STATMETHOD_LEGAL_STATE: process.env.STATMETHOD_LEGAL_STATE || '',
  STATMETHOD_CONTACT_EMAIL: process.env.STATMETHOD_CONTACT_EMAIL || '',
};
const issues = [];
const checks = [];
const pass = m => checks.push(`✓ ${m}`);
const fail = m => issues.push(`✗ ${m}`);

const url = required.PUBLIC_SITE_URL;
if (!url) fail('PUBLIC_SITE_URL is not set');
else {
  try {
    const u = new URL(url);
    if (u.protocol !== 'https:') fail('PUBLIC_SITE_URL must use HTTPS');
    if (u.pathname !== '/' || u.search || u.hash) fail('PUBLIC_SITE_URL must be an origin such as https://example.com');
    if (u.hostname.endsWith('.invalid')) fail('PUBLIC_SITE_URL is still a placeholder');
    if (!issues.length) pass(`PUBLIC_SITE_URL=${u.origin}`);
  } catch { fail('PUBLIC_SITE_URL is not a valid URL'); }
}

for (const [name, value] of Object.entries(required).slice(1)) {
  if (!value) fail(`${name} is not set`);
  else if (/FILL_ME|YOUR_/i.test(value)) fail(`${name} still contains a placeholder`);
  else pass(`${name} is set`);
}

// The source file intentionally keeps safe local-development fallbacks. In a production
// build those values are supplied via environment variables and rendered output is checked
// separately by `check:placeholders`.
const requiredEnvBacked = [
  ['STATMETHOD_GITHUB_HANDLE', required.STATMETHOD_GITHUB_HANDLE],
  ['STATMETHOD_LEGAL_STATE', required.STATMETHOD_LEGAL_STATE],
  ['STATMETHOD_CONTACT_EMAIL', required.STATMETHOD_CONTACT_EMAIL],
];
if (requiredEnvBacked.every(([, v]) => v && !/FILL_ME|YOUR_/i.test(v))) {
  pass('owner-specific env values override local development fallbacks');
}

if (!existsSync(join(root, 'dist'))) {
  fail('dist/ is missing; run `npm run build` before production QA');
}

console.log('\nThe Stat Method Production Config QA\n' + '─'.repeat(72));
for (const c of checks) console.log(c);
for (const e of issues) console.log(e);
console.log(`\n${checks.length + issues.length} checks · ${issues.length} failure(s)`);
if (issues.length) {
  console.log('Set the owner-specific production values, then rerun.');
  process.exit(1);
}
console.log('Production configuration is ready for deployment validation.');
