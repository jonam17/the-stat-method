#!/usr/bin/env node
/**
 * Pre-launch audit. Crawls the built site and checks for the things that
 * quietly break a launch: dead internal links, missing metadata, orphan pages,
 * accessibility problems, and leftover placeholders.
 *
 * Usage:  npm run build && npm run audit
 */
import { createServer } from 'node:http';
import { readFile, readdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, extname, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DIST = join(ROOT, 'dist');
const PORT = 8477;

const MIME = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript',
  '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png',
  '.webp': 'image/webp', '.woff2': 'font/woff2', '.xml': 'application/xml' };

function serve(dir, port) {
  const server = createServer(async (req, res) => {
    try {
      let p = decodeURIComponent(req.url.split('?')[0]);
      if (p.endsWith('/')) p += 'index.html';
      const body = await readFile(join(dir, p));
      res.writeHead(200, { 'Content-Type': MIME[extname(p)] ?? 'application/octet-stream' });
      res.end(body);
    } catch { res.writeHead(404).end('not found'); }
  });
  return new Promise(r => server.listen(port, () => r(server)));
}

async function walk(dir, base = dir) {
  const out = [];
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const full = join(dir, e.name);
    if (e.isDirectory()) out.push(...await walk(full, base));
    else if (e.name.endsWith('.html')) out.push('/' + relative(base, full).replace(/index\.html$/, ''));
  }
  return out;
}

const issues = { error: [], warn: [], info: [] };
const add = (level, msg) => issues[level].push(msg);

async function main() {
  if (!existsSync(DIST)) {
    console.error('No dist/. Run `npm run build` first.');
    process.exit(1);
  }

  let chromium;
  try { ({ chromium } = await import('playwright')); }
  catch {
    console.error('\n  Playwright not installed. Run:\n    npm install\n    npx playwright install chromium\n');
    process.exit(1);
  }

  const pages = await walk(DIST);
  const server = await serve(DIST, PORT);
  const exePath = process.env.PLAYWRIGHT_CHROMIUM_PATH || undefined;
  const browser = await chromium.launch(exePath ? { executablePath: exePath } : {});
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

  const internalLinks = new Map();   // href -> [source pages]
  const linkedFrom = new Set();
  const consoleErrors = [];
  page.on('pageerror', e => consoleErrors.push({ path: page.url(), message: String(e) }));
  page.on('console', msg => {
    if (msg.type() === 'error') consoleErrors.push({ path: page.url(), message: msg.text() });
  });

  console.log(`\nAuditing ${pages.length} pages…\n`);

  for (const path of pages) {
    await page.goto(`http://localhost:${PORT}${path}`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(120);

    const d = await page.evaluate(() => {
      const meta = n => document.querySelector(`meta[name="${n}"]`)?.content ?? null;
      const headings = [...document.querySelectorAll('h1,h2,h3,h4')].map(h => +h.tagName[1]);
      return {
        title: document.title,
        description: meta('description'),
        h1Count: document.querySelectorAll('h1').length,
        headings,
        imagesNoAlt: [...document.querySelectorAll('img')].filter(i => !i.alt).length,
        links: [...document.querySelectorAll('a[href]')].map(a => a.getAttribute('href')),
        emptyLinks: [...document.querySelectorAll('a[href]')]
          .filter(a => !a.textContent.trim() && !a.querySelector('img,svg')).length,
        placeholders: /YOUR_HANDLE|YOUR_NAME|YOUR_STOREFRONT|Jane Doe|John Roe|lorem ipsum/i
          .test(document.body.innerHTML),
        text: document.body.innerText.length,
        // Words run together at an inline tag: "a <code>x</code>cookie". The build
        // drops a line break after an inline closing tag (v2.10.4), so text that
        // wraps there in the source loses its space. Ignored when CSS supplies
        // the gap (a margin on the element, as on .lib-tag pills). Letters only:
        // a number against its unit ("144g") is a deliberate compact style.
        glued: [...document.querySelectorAll('main a, main code, main strong, main em, main b')]
          .filter(el => getComputedStyle(el).display === 'inline')
          .flatMap(el => {
            const cs = getComputedStyle(el), t = el.textContent, hits = [];
            const next = el.nextSibling, prev = el.previousSibling;
            if (next?.nodeType === 3 && /[A-Za-z]$/.test(t) && /^[A-Za-z]/.test(next.textContent)
                && !parseFloat(cs.marginRight)) hits.push(t.slice(-20) + next.textContent.slice(0, 12));
            if (prev?.nodeType === 3 && /[A-Za-z]$/.test(prev.textContent) && /^[A-Za-z]/.test(t)
                && !parseFloat(cs.marginLeft)) hits.push(prev.textContent.slice(-12) + t.slice(0, 20));
            return hits;
          }),
      };
    });

    // --- metadata ---
    if (!d.title) add('error', `${path} — missing <title>`);
    else if (d.title.length > 65) add('warn', `${path} — title ${d.title.length} chars (>65 truncates in search)`);
    if (!d.description) add('error', `${path} — missing meta description`);
    else if (d.description.length > 165) add('warn', `${path} — description ${d.description.length} chars (>165 truncates)`);
    else if (d.description.length < 70) add('info', `${path} — description only ${d.description.length} chars`);

    // --- structure / a11y ---
    if (d.h1Count === 0) add('error', `${path} — no <h1>`);
    if (d.h1Count > 1) add('warn', `${path} — ${d.h1Count} <h1> elements`);
    for (let i = 1; i < d.headings.length; i++) {
      if (d.headings[i] - d.headings[i - 1] > 1) {
        add('warn', `${path} — heading level skips h${d.headings[i - 1]}→h${d.headings[i]}`);
        break;
      }
    }
    if (d.imagesNoAlt) add('warn', `${path} — ${d.imagesNoAlt} image(s) without alt text`);
    if (d.emptyLinks) add('warn', `${path} — ${d.emptyLinks} link(s) with no accessible text`);

    // --- content ---
    if (d.placeholders) add('error', `${path} — contains placeholder text (YOUR_NAME etc.)`);
    if (d.text < 300) add('info', `${path} — only ${d.text} chars of text (thin page)`);
    for (const g of d.glued) add('error', `${path} — words run together: "${g.replace(/\s+/g, ' ').trim()}"`);

    for (const href of d.links) {
      if (!href || href.startsWith('#') || href.startsWith('mailto:')) continue;
      if (/^https?:\/\//.test(href)) continue;               // external, not checked
      const clean = href.split('#')[0].split('?')[0];
      if (!internalLinks.has(clean)) internalLinks.set(clean, []);
      internalLinks.get(clean).push(path);
      linkedFrom.add(clean.endsWith('/') ? clean : clean + '/');
    }
  }

  // --- dead internal links ---
  const known = new Set(pages);
  for (const [href, sources] of internalLinks) {
    const norm = href.endsWith('/') ? href : href + '/';
    const isAsset = /\.(png|webp|svg|xml|js|css|ico)$/.test(href);
    if (isAsset) {
      if (!existsSync(join(DIST, href))) add('error', `dead asset ${href} (from ${sources[0]})`);
      continue;
    }
    if (!known.has(norm) && !known.has(href)) {
      add('error', `dead link ${href} — linked from ${[...new Set(sources)].join(', ')}`);
    }
  }

  // --- orphan pages ---
  for (const p of pages) {
    if (p === '/' || p.startsWith('/404')) continue;
    if (!linkedFrom.has(p)) add('warn', `orphan page ${p} — not linked from anywhere`);
  }

  // --- phone layout ---
  // Every page at 360px, the narrowest common phone width: text must not touch
  // the screen edge, and the page must not scroll sideways. Both shipped for
  // weeks (v2.10.3) — .section cancelled .wrap's gutter, and chart pages were
  // widened by a hidden data table — and only a browser can see either.
  // Text inside a horizontal scroll box (wide tables) or .sr-only is exempt.
  const phone = await browser.newPage({ viewport: { width: 360, height: 800 } });
  for (const path of pages) {
    await phone.goto(`http://localhost:${PORT}${path}`, { waitUntil: 'networkidle' });
    const m = await phone.evaluate(() => {
      const vw = document.documentElement.clientWidth;
      const exempt = el => el.closest('.sr-only') || (() => {
        for (let e = el; e && e !== document.body; e = e.parentElement) {
          if (getComputedStyle(e).overflowX !== 'visible') return true;
        }
        return false;
      })();
      let tight = null;
      const walker = document.createTreeWalker(document.querySelector('main') || document.body, NodeFilter.SHOW_TEXT);
      for (let n; (n = walker.nextNode());) {
        if (!n.textContent.trim() || !n.parentElement || exempt(n.parentElement)) continue;
        const range = document.createRange(); range.selectNodeContents(n);
        for (const b of range.getClientRects()) {
          if (b.width < 1) continue;
          const gap = Math.min(b.left, vw - b.right);
          if (gap < 8 && (!tight || gap < tight.gap)) tight = { gap: Math.round(gap), text: n.textContent.trim().slice(0, 40) };
        }
      }
      return { overflow: document.documentElement.scrollWidth - vw, tight };
    });
    if (m.overflow > 0) add('error', `${path} — scrolls sideways by ${m.overflow}px at 360px wide`);
    if (m.tight) add('error', `${path} — text ${m.tight.gap}px from the screen edge at 360px wide: "${m.tight.text}"`);
  }
  await phone.close();

  if (consoleErrors.length) {
    const deduped = [...new Map(consoleErrors.map(x => [`${x.path}|${x.message}`, x])).values()];
    for (const { path, message } of deduped) add('error', `JS error on ${new URL(path).pathname}: ${message.slice(0, 220)}`);
  }

  // --- sitemap ---
  if (!existsSync(join(DIST, 'sitemap-index.xml'))) add('error', 'no sitemap-index.xml');
  if (!existsSync(join(DIST, 'robots.txt'))) add('warn', 'no robots.txt');

  await browser.close();
  server.close();

  // --- report ---
  const order = [['error', 'ERRORS — fix before launch'], ['warn', 'WARNINGS — should fix'],
                 ['info', 'NOTES — optional']];
  for (const [k, label] of order) {
    if (!issues[k].length) continue;
    console.log(`\n${label} (${issues[k].length})`);
    console.log('─'.repeat(60));
    for (const m of issues[k]) console.log('  • ' + m);
  }

  const e = issues.error.length, w = issues.warn.length;
  console.log(`\n${'═'.repeat(60)}`);
  console.log(`${pages.length} pages · ${e} error(s) · ${w} warning(s) · ${issues.info.length} note(s)`);
  console.log(e === 0 ? 'No blocking errors. Ready to launch.\n' : 'Fix errors before launching.\n');
  if (e) process.exitCode = 1;
}

main().catch(err => { console.error(err); process.exit(1); });
