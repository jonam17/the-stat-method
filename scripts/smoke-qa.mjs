#!/usr/bin/env node
/**
 * Final production smoke test. Requires a built dist/ and Playwright Chromium.
 * Starts Astro preview, checks critical routes, captures browser console/page errors,
 * validates the homepage CTA, and checks mobile overflow on representative pages.
 */
import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import process from 'node:process';
import { pathToFileURL } from 'node:url';
import { chromium } from 'playwright';

const root = process.cwd();
const { TOOLS } = await import(pathToFileURL(join(root, 'src/data/tools.js')));
const dist = join(root, 'dist');
if (!existsSync(dist)) {
  console.error('SMOKE QA — dist/ is missing. Run `npm run build` first.');
  process.exit(1);
}

const port = 4321;
const origin = `http://127.0.0.1:${port}`;
const preview = spawn('npm', ['run', 'preview', '--', '--host', '127.0.0.1', '--port', String(port)], {
  cwd: root,
  stdio: ['ignore', 'pipe', 'pipe'],
  env: { ...process.env },
  detached: true,   // own process group, so stopPreview() ends npm *and* the astro server under it
});
// Killing only npm left the astro server running, which kept this script from
// ever exiting after a pass (unseen until v2.10.4: every run used to fail, and
// the failure path force-exits).
const stopPreview = () => { try { process.kill(-preview.pid, 'SIGTERM'); } catch { preview.kill('SIGTERM'); } };

let previewOutput = '';
preview.stdout.on('data', chunk => { previewOutput += chunk.toString(); });
preview.stderr.on('data', chunk => { previewOutput += chunk.toString(); });

const sleep = ms => new Promise(r => setTimeout(r, ms));
let ready = false;
for (let i = 0; i < 50; i++) {
  try {
    const r = await fetch(origin + '/');
    if (r.ok) { ready = true; break; }
  } catch {}
  await sleep(200);
}
if (!ready) {
  console.error('SMOKE QA — Astro preview did not become ready.');
  console.error(previewOutput.slice(-4000));
  stopPreview();
  process.exit(1);
}

const checks = [];
const pass = msg => checks.push({ ok: true, msg });
const fail = msg => checks.push({ ok: false, msg });
const routes = [
  '/',
  '/tools/',
  '/tools/tdee-calculator/',
  '/tools/macro-calculator/',
  '/tools/body-fat/',
  '/tools/one-rep-max/',
  '/tools/protein-target/',
  '/articles/',
  '/methodology/',
  '/privacy/',
  '/terms/',
  '/robots.txt',
  '/sitemap-index.xml',
  '/manifest.webmanifest',
];

let browser;
try {
  const exePath = process.env.PLAYWRIGHT_CHROMIUM_PATH || undefined;   // same override as audit.mjs
  browser = await chromium.launch(exePath ? { headless: true, executablePath: exePath } : { headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  const consoleErrors = [];
  const pageErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });
  page.on('pageerror', err => pageErrors.push(String(err)));

  for (const route of routes) {
    // Files (robots.txt, sitemap, manifest) are fetched, not opened as pages:
    // a browser tab showing a plain file requests /favicon.ico, which no page
    // on the site does (they declare favicon.svg), and logs its 404.
    const response = /\.[a-z]+$/.test(route)
      ? await page.request.get(origin + route)
      : await page.goto(origin + route, { waitUntil: 'networkidle' });
    const status = response?.status() ?? 0;
    if (status >= 200 && status < 400) pass(`${route} responds ${status}`);
    else fail(`${route} responds ${status}`);
  }

  // Chrome logs the deliberate 404 below as a console error. Drop what this one
  // navigation logs, so the console check reports only the real routes. (Unseen
  // until v2.10.4: the stale button check used to crash before the console check.)
  const loggedBefore = consoleErrors.length;
  const missingResponse = await page.goto(origin + '/__statmethod_missing_route__/', { waitUntil: 'networkidle' });
  consoleErrors.length = loggedBefore;
  if (missingResponse?.status() === 404) pass('unknown route returns 404')
  else fail(`unknown route responds ${missingResponse?.status() ?? 0} instead of 404`);

  // The homepage's primary button must lead to the flagship tool, and that page
  // must load. Matched by its role on the page (.hero-btn) and the registry's
  // `flagship` flag, not by its wording: this check matched the label "Run a
  // calculation", went stale when v2.6.0 renamed the button, and failed every
  // run until v2.10.4. Counted rather than awaited, so a missing button fails
  // this check instead of timing out and skipping the checks after it.
  await page.goto(origin + '/', { waitUntil: 'networkidle' });
  const flagship = TOOLS.find(t => t.flagship && t.live);
  const heroBtn = page.locator('.hero-modern .hero-btn');
  const cta = (await heroBtn.count()) ? await heroBtn.first().getAttribute('href') : null;
  if (!flagship) fail('no live tool is marked flagship in src/data/tools.js');
  else if (cta !== `/tools/${flagship.slug}/`) fail(`homepage primary button goes to ${cta ?? 'nowhere (button missing)'}, not the flagship /tools/${flagship.slug}/`);
  else {
    const res = await page.goto(origin + cta, { waitUntil: 'networkidle' });
    res?.status() === 200
      ? pass(`homepage primary button leads to the flagship, ${flagship.name}, which loads`)
      : fail(`homepage primary button leads to ${cta}, which responds ${res?.status() ?? 0}`);
  }

  for (const route of ['/','/tools/macro-calculator/']) {
    await page.goto(origin + route, { waitUntil: 'networkidle' });
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1);
    overflow ? fail(`${route} has horizontal overflow at 1440px`) : pass(`${route} has no horizontal overflow at 1440px`);
  }

  const mobile = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await mobile.goto(origin + '/', { waitUntil: 'networkidle' });
  const mobileOverflow = await mobile.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1);
  mobileOverflow ? fail('homepage has horizontal overflow at 390px') : pass('homepage has no horizontal overflow at 390px');
  const menu = mobile.locator('details[data-mobile-nav], details').first();
  if (await menu.count()) pass('mobile navigation structure is present');
  else fail('mobile navigation structure is missing');

  consoleErrors.length ? fail(`browser console errors: ${consoleErrors.join(' | ')}`) : pass('no browser console errors on smoke routes');
  pageErrors.length ? fail(`uncaught page errors: ${pageErrors.join(' | ')}`) : pass('no uncaught page errors on smoke routes');
} catch (error) {
  fail(`smoke runner error: ${error?.stack || error}`);
} finally {
  await browser?.close();
  stopPreview();
}

console.log('\nThe Stat Method Final Production Smoke QA\n' + '─'.repeat(72));
for (const c of checks) console.log(`${c.ok ? '✓' : '✗'} ${c.msg}`);
const failures = checks.filter(c => !c.ok).length;
console.log(`\n${checks.length} checks · ${failures} failure(s)`);
if (failures) process.exit(1);
console.log('Local production smoke test passed. Complete the live-domain smoke test after DNS/Cloudflare deployment.');
