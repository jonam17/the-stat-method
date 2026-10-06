#!/usr/bin/env node
/**
 * Refusal paths, exercised in a real browser.
 *
 * The existing audit loads every page at its default inputs — where no safety
 * rail ever fires. So when the Macro Calculator crashed on every refusal (a
 * summary bar read macro values that a refused result does not carry), nothing
 * noticed: the engine refused correctly, the page broke, and the people the
 * eating-disorder helpline message exists for never saw it.
 *
 * This enters the inputs that SHOULD be refused, in every tool that refuses,
 * and checks that the right message appears and nothing throws.
 *
 *   npm run build && npm run qa:refusals
 */
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { join, extname } from 'node:path';

const DIST = 'dist', PORT = 4401;
const HELPLINE = '1-866-662-1235';
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css',
  '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png',
  '.webp': 'image/webp', '.woff2': 'font/woff2' };

function serve(dir, port) {
  const server = createServer(async (req, res) => {
    try {
      let p = decodeURIComponent(req.url.split('?')[0]);
      if (p.endsWith('/')) p += 'index.html';
      const body = await readFile(join(dir, p));
      res.writeHead(200, { 'Content-Type': MIME[extname(p)] ?? 'application/octet-stream' }).end(body);
    } catch { res.writeHead(404).end('not found'); }
  });
  return new Promise(r => server.listen(port, () => r(server)));
}

// expect: 'helpline' | 'underAge' | 'refused' | 'allowed'
const CASES = [
  { tool: 'macro-calculator', why: 'underweight minor, cut', fill: { Age: '16', Weight: '46', Height: '178' }, click: ['Cut'], expect: 'helpline' },
  { tool: 'macro-calculator', why: 'underweight adult, cut', fill: { Age: '30', Weight: '46', Height: '178' }, click: ['Cut'], expect: 'helpline' },
  { tool: 'deficit-planner',  why: 'underweight minor', fill: { Age: '16', 'Current weight': '46', Height: '178', 'Target weight': '42' }, expect: 'helpline' },
  { tool: 'baseline',         why: 'underweight minor, lose', fill: { Age: '16', Weight: '46', Height: '178' }, click: ['Lose'], expect: 'helpline' },
  { tool: 'hand-portions',    why: "imperial 6'4\", 130 lb, cut — really underweight", click: ['Imperial'], feet: '6', inches: '4', fill: { Weight: '130' }, then: ['Cut'], expect: 'refused' },
  { tool: 'hand-portions',    why: "imperial 5'0\", 110 lb, cut — really healthy", click: ['Imperial'], feet: '5', inches: '0', fill: { Weight: '110' }, then: ['Cut'], expect: 'allowed' },
  ...['tdee-calculator', 'body-fat', 'healthy-weight', 'ffmi', 'protein-target', 'heart-rate-zones',
      'sleep-calculator', 'strength-standards', 'hand-portions', 'deficit-planner', 'baseline']
    .map(tool => ({ tool, why: 'age 16', fill: { Age: '16' }, expect: 'underAge' })),
  ...['tdee-calculator', 'baseline', 'protein-target'].map(tool => ({ tool, why: 'age 100', fill: { Age: '100' }, expect: 'refused' })),
  // Severe pain must compute nothing — and the milder answers must not refuse.
  { tool: 'progressive-overload', why: 'severe pain', click: ['Severe'], expect: 'refused' },
  { tool: 'progressive-overload', why: 'moderate pain holds, does not refuse', click: ['Moderate'], expect: 'allowed' },
];

const { chromium } = await import('playwright');
const server = await serve(DIST, PORT);
const exePath = process.env.PLAYWRIGHT_CHROMIUM_PATH || undefined;
const browser = await chromium.launch(exePath ? { executablePath: exePath } : {});
const page = await browser.newPage();
const fld = l => page.locator(`xpath=(//label[normalize-space()="${l}"])[1]/following::input[1]`);
const btn = n => page.getByRole('button', { name: n, exact: true }).first();

let failures = 0;
for (const c of CASES) {
  const errs = []; const onErr = e => errs.push(e.message);
  page.on('pageerror', onErr);
  let got = '?';
  try {
    await page.goto(`http://localhost:${PORT}/tools/${c.tool}/`, { waitUntil: 'networkidle' });
    for (const n of c.click ?? []) await btn(n).click();
    if (c.feet) { await page.locator('input[aria-label="Feet"]').fill(c.feet); await page.locator('input[aria-label="Inches"]').fill(c.inches); }
    for (const [label, v] of Object.entries(c.fill ?? {})) await fld(label).fill(v, { timeout: 5000 });
    for (const n of c.then ?? []) await btn(n).click();
    await page.waitForTimeout(250);
    const n = await page.locator('.results .notice').count();
    const text = n ? await page.locator('.results .notice').first().innerText() : '';
    got = !n ? 'allowed' : text.includes(HELPLINE) ? 'helpline' : /built for adults/.test(text) ? 'underAge' : 'refused';
  } catch (e) { got = `error: ${e.message.split('\n')[0].slice(0, 80)}`; }
  page.off('pageerror', onErr);
  const pass = !errs.length && (got === c.expect || (c.expect === 'refused' && ['refused', 'helpline', 'underAge'].includes(got)));
  if (!pass) failures++;
  console.log(`  ${pass ? '✓' : '✗'} ${c.tool.padEnd(18)} ${c.why.padEnd(42)} expected ${c.expect.padEnd(8)} got ${got}${errs.length ? '  THREW: ' + errs[0].slice(0, 60) : ''}`);
}
await browser.close(); server.close();
console.log(`\nRefusal paths — ${CASES.length} checks, ${failures} failure(s)\n`);
process.exit(failures ? 1 : 0);
