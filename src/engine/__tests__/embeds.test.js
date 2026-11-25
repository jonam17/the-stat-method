import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { EMBEDS, CREDIT, embedFor, snippet } from '../../data/embeds.js';
import { TOOLS } from '../../data/tools.js';

describe('embeddable calculators (item 60)', () => {
  it('starts with the five from the Home row, then covers every other live tool, once each', () => {
    expect(EMBEDS.slice(0, 5).map(e => e.slug)).toEqual(['tdee-calculator', 'macro-calculator', 'body-fat', 'one-rep-max', 'protein-target']);
    expect(new Set(EMBEDS.map(e => e.slug)).size).toBe(EMBEDS.length);
    for (const e of EMBEDS) expect(TOOLS.find(t => t.slug === e.slug)?.live, e.slug).toBe(true);
    // v2.55.0 (item 71): every live tool is embeddable.
    expect(EMBEDS.map(e => e.slug).sort()).toEqual(TOOLS.filter(t => t.live).map(t => t.slug).sort());
  });
  it('gives each embed a sensible iframe height', () => {
    for (const e of EMBEDS) expect(e.height, e.slug).toBeGreaterThanOrEqual(600);
  });
  it('builds a snippet pointing at the embed page, with the credit in its title', () => {
    const s = snippet('protein-target', 'Protein Target', 'https://thestatmethod.com/');
    expect(s).toBe('<iframe src="https://thestatmethod.com/embed/protein-target/" title="Protein Target (Calculator by The Stat Method)" width="100%" height="1500" style="border:0;max-width:720px" loading="lazy"></iframe>');
  });
  it('escapes the tool name inside the title attribute', () => {
    expect(snippet('tdee-calculator', 'TDEE & BMR "Calculator"', 'https://x.test')).toContain('title="TDEE &amp; BMR &quot;Calculator&quot; (');
  });
  it('has no embed for anything that is not a live tool', () => {
    expect(embedFor('not-a-tool')).toBeUndefined();
    expect(() => snippet('not-a-tool', 'X', 'https://x.test')).toThrow();
  });
  it('credit wording is the approved one', () => expect(CREDIT).toBe('Calculator by The Stat Method'));

  // Framing: only /embed/* may be framed; everything else keeps frame-ancestors 'none'.
  const headers = readFileSync('public/_headers', 'utf8');
  const policy = path => {
    const block = headers.split(/\n(?=\S)/).find(b => b.split('\n')[0].trim() === path);
    return block?.match(/^\s+Content-Security-Policy: (.*)$/m)?.[1];
  };
  it("keeps frame-ancestors 'none' site-wide", () => expect(policy('/*')).toContain("frame-ancestors 'none'"));
  it('opens framing only on /embed/*, after detaching the site-wide policy', () => {
    const block = headers.slice(headers.indexOf('\n/embed/*'));
    expect(headers.indexOf('\n/embed/*')).toBeGreaterThan(headers.indexOf('\n/*'));
    expect(block).toMatch(/^\s+! Content-Security-Policy$/m);
    expect(policy('/embed/*')).toContain('frame-ancestors *');
  });
  it('changes nothing else in the embed policy', () => {
    expect(policy('/embed/*').replace('frame-ancestors *', "frame-ancestors 'none'")).toBe(policy('/*'));
  });
  it('keeps embed pages out of the sitemap', () => {
    expect(readFileSync('astro.config.mjs', 'utf8')).toMatch(/!page\.includes\('\/embed\/'\)/);
  });
});

describe('embed page', () => {
  const page = readFileSync('src/pages/embed/[tool].astro', 'utf8');
  it('renders a calculator for every listed embed', () => {
    for (const e of EMBEDS) expect(page, e.slug).toContain(`slug === '${e.slug}' && <`);
  });
  it('passes each Cardio page its mode', () => {
    expect(page).toContain(`slug === 'heart-rate-zones' && <CardioCalculator client:load mode="zones" />`);
    expect(page).toContain(`slug === 'calories-burned' && <CardioCalculator client:load mode="burn" />`);
  });
  it('opens links inside a calculator in a new tab, never inside the frame', () => {
    expect(page).toContain("a.target = '_blank'; a.rel = 'noopener';");
  });
});

describe('embed entry point on tool pages', () => {
  const layout = readFileSync('src/layouts/ToolLayout.astro', 'utf8');
  const shell = readFileSync('src/components/ToolShell.jsx', 'utf8');
  it('the result row offers the embed code only where the page has the dialog', () => {
    expect(shell).toContain("document.getElementById('embed-dialog')");
    expect(shell).toContain('Want this calculator on your website?');
  });
  it('the dialog is rendered only for tools with an embed', () => {
    expect(layout).toMatch(/\{embed && \(\s*<dialog id="embed-dialog"/);
  });
  it('embed pages drop the tool-page label rail', () => {
    expect(readFileSync('src/pages/embed/[tool].astro', 'utf8')).toMatch(/\.tool-instrument\.embed-instrument\{[^}]*display:block/);
  });
});
