import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { EMBEDS, CREDIT, embedFor, snippet } from '../../data/embeds.js';
import { TOOLS } from '../../data/tools.js';

describe('embeddable calculators (item 60)', () => {
  it('lists the five approved tools, each live, once', () => {
    expect(EMBEDS.map(e => e.slug)).toEqual(['tdee-calculator', 'macro-calculator', 'body-fat', 'one-rep-max', 'protein-target']);
    for (const e of EMBEDS) expect(TOOLS.find(t => t.slug === e.slug)?.live, e.slug).toBe(true);
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
  it('has no embed for other tools', () => {
    expect(embedFor('ffmi')).toBeUndefined();
    expect(() => snippet('ffmi', 'FFMI', 'https://x.test')).toThrow();
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
