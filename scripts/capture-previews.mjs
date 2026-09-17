#!/usr/bin/env node
/**
 * Regenerate every tool preview screenshot into docs/previews/.
 *
 * Usage:
 *   npm run build && npm run previews
 *
 * Reads the tool registry so new tools are picked up automatically — add a tool
 * to src/data/tools.js with `live: true` and its preview will be captured here
 * without touching this file.
 *
 * Requires: npx playwright install chromium
 */
import { createServer } from 'node:http';
import { readFile, mkdir, readdir, rm, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, extname, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * sharp ships with Astro's image pipeline, so WebP conversion needs no extra
 * dependency. If it is ever unavailable we fall back to PNG rather than failing.
 */
async function loadSharp() {
  try {
    const mod = await import('sharp');
    return mod.default ?? mod;
  } catch {
    return null;
  }
}

/**
 * Playwright is a heavy optional dependency, so it is imported lazily with a
 * readable error rather than letting Node throw a raw ERR_MODULE_NOT_FOUND stack.
 */
async function loadChromium() {
  try {
    const { chromium } = await import('playwright');
    return chromium;
  } catch {
    console.error('\n  Playwright is not installed.\n');
    console.error('  Run these once, then try again:\n');
    console.error('    npm install');
    console.error('    npx playwright install chromium\n');
    console.error('  The browser download is about 120 MB and is only needed for');
    console.error('  regenerating the README screenshots — not for building the site.\n');
    process.exit(1);
  }
}

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DIST = join(ROOT, 'dist');
const OUT = join(ROOT, 'docs', 'previews');
const PORT = 8231;

const MIME = {
  '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript',
  '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png',
  '.woff2': 'font/woff2', '.xml': 'application/xml',
};

/** Minimal static server for the built site. */
function serve(dir, port) {
  const server = createServer(async (req, res) => {
    try {
      let p = decodeURIComponent(req.url.split('?')[0]);
      if (p.endsWith('/')) p += 'index.html';
      const file = join(dir, p);
      const body = await readFile(file);
      res.writeHead(200, { 'Content-Type': MIME[extname(file)] ?? 'application/octet-stream' });
      res.end(body);
    } catch {
      res.writeHead(404).end('not found');
    }
  });
  return new Promise(resolve => server.listen(port, () => resolve(server)));
}

async function main() {
  if (!existsSync(DIST)) {
    console.error('No dist/ directory. Run `npm run build` first.');
    process.exit(1);
  }
  await mkdir(OUT, { recursive: true });

  // Load the tool registry so this stays in sync with the site automatically.
  const { TOOLS } = await import(join(ROOT, 'src', 'data', 'tools.js'));
  const live = TOOLS.filter(t => t.live && t.slug);

  const chromium = await loadChromium();
  const sharp = await loadSharp();
  const ext = sharp ? 'webp' : 'png';

  // Clear stale previews so a renamed or removed tool cannot leave an orphan
  // behind, and so PNG/WebP duplicates never accumulate.
  for (const f of await readdir(OUT).catch(() => [])) {
    if (/\.(png|webp)$/.test(f)) await rm(join(OUT, f));
  }

  const server = await serve(DIST, PORT);

  // Allow an explicit binary path, which CI images and sandboxes often need.
  // Otherwise use Playwright's own managed download.
  const executablePath = process.env.PLAYWRIGHT_CHROMIUM_PATH || undefined;
  let browser;
  try {
    browser = await chromium.launch(executablePath ? { executablePath } : {});
  } catch (err) {
    server.close();
    console.error('\nCould not launch Chromium.\n');
    console.error('  Fix:  npx playwright install chromium');
    console.error('  Or:   PLAYWRIGHT_CHROMIUM_PATH=/path/to/chrome npm run previews\n');
    console.error(String(err).split('\n')[0]);
    process.exit(1);
  }

  const page = await browser.newPage({
    viewport: { width: 1240, height: 1200 },
    deviceScaleFactor: 2,
  });

  const errors = [];
  page.on('pageerror', e => errors.push(String(e).slice(0, 120)));

  let n = 0, failed = 0;
  for (const tool of live) {
    n += 1;
    errors.length = 0;
    const name = `${String(n).padStart(2, '0')}-${tool.slug}.${ext}`;
    await page.goto(`http://localhost:${PORT}/tools/${tool.slug}/`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(800);

    const el = await page.$('.calc');
    if (!el) {
      console.error(`  FAIL ${tool.slug} — no .calc element found`);
      failed += 1;
      continue;
    }
    const png = await el.screenshot();
    if (sharp) {
      await sharp(png).resize({ width: 1200, withoutEnlargement: true })
        .webp({ quality: 82 }).toFile(join(OUT, name));
    } else {
      await writeFile(join(OUT, name), png);
    }

    // Sanity check: the tool must actually have produced a result.
    const result = await page.evaluate(() => {
      const el = document.querySelector('.results .num');
      return el ? el.textContent.trim() : null;
    });
    const status = result && errors.length === 0 ? 'ok  ' : 'WARN';
    if (!result || errors.length) failed += 1;
    console.log(`  ${status} ${name.padEnd(34)} result=${result ?? 'MISSING'}` +
      (errors.length ? `  errors=${errors.join('; ')}` : ''));
  }

  // ── Dark-theme hero ──────────────────────────────────────────────────────
  // The homepage hero is a static image, so it does not follow the theme
  // toggle on its own — in dark mode a light screenshot sat on a dark page.
  // Capture the same calculator again with the theme forced dark.
  // localStorage is seeded via an init script so the theme is set before the
  // page's own no-flash script runs; setting it after load would capture the
  // light paint.
  const darkPage = await browser.newPage({
    viewport: { width: 1240, height: 1200 },
    deviceScaleFactor: 2,
    colorScheme: 'dark',
  });
  await darkPage.addInitScript(() => {
    try { localStorage.setItem('theme', 'dark'); } catch {}
  });
  await darkPage.goto(`http://localhost:${PORT}/tools/macro-calculator/`, { waitUntil: 'networkidle' });
  await darkPage.waitForTimeout(800);

  const appliedTheme = await darkPage.evaluate(() => document.documentElement.dataset.theme);
  const darkEl = await darkPage.$('.calc');
  let darkOk = false;
  if (appliedTheme !== 'dark') {
    console.error(`  FAIL dark hero — theme resolved to "${appliedTheme}", expected "dark"`);
    failed += 1;
  } else if (!darkEl) {
    console.error('  FAIL dark hero — no .calc element found');
    failed += 1;
  } else {
    const darkPng = await darkEl.screenshot();
    const darkOut = join(ROOT, 'public', `statmethod-calculator-preview-dark.${ext}`);
    if (sharp) {
      await sharp(darkPng).resize({ width: 1200, withoutEnlargement: true })
        .webp({ quality: 82 }).toFile(darkOut);
    } else {
      await writeFile(darkOut, darkPng);
    }
    darkOk = true;
    console.log('  ok   dark homepage hero');
  }

  await browser.close();
  server.close();

  // Keep the homepage preview in lockstep with the real Macro Calculator UI.
  // The homepage intentionally uses a static image, so visitors see the same
  // interface they'll get after clicking Run a calculation.
  const macroPreview = join(OUT, `01-macro-calculator.${ext}`);
  const homepagePreview = join(ROOT, 'public', `statmethod-calculator-preview.${ext}`);
  if (existsSync(macroPreview)) {
    await writeFile(homepagePreview, await readFile(macroPreview));
  }
  if (!darkOk) {
    console.error('  Dark hero not written — the homepage will fall back to the light image.');
  }

  const files = (await readdir(OUT)).filter(f => /\.(png|webp)$/.test(f));
  console.log(`\n${files.length} preview(s) in docs/previews/` +
    (failed ? `  —  ${failed} need attention` : '  —  all healthy'));
  if (failed) process.exitCode = 1;

  if (!sharp) {
    console.log('\nNote: sharp was unavailable, so previews were written as PNG.');
    console.log('Update the image extensions in README.md to match.');
  }
}

main().catch(err => { console.error(err); process.exit(1); });
