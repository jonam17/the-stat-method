// v2.54.1: fixes from the modern-web-guidance check (PENDING item 69c). Each test pins one fix.
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';

const read = p => readFileSync(p, 'utf8');
const css = read('src/styles/global.css');

describe('modern-web-guidance fixes (v2.54.1)', () => {
  it('dialogs light-dismiss natively, with a box check where closedby is missing', () => {
    for (const f of ['src/layouts/ToolLayout.astro', 'src/components/SiteSearch.astro']) {
      const s = read(f);
      expect(s, f).toMatch(/<dialog[^>]*closedby="any"/);
      expect(s, f).toContain("'closedBy' in HTMLDialogElement.prototype");
      expect(s, f).toContain('getBoundingClientRect()');
    }
  });
  it('the light theme sets color-scheme, so native parts match the page', () => {
    expect(css).toMatch(/:root\[data-theme="light"\]\{color-scheme:light\}/);
    expect(css).toMatch(/:root\[data-theme="dark"\]\{\s*color-scheme:dark/);
  });
  it('every page starts with a skip link to the main content', () => {
    const base = read('src/layouts/BaseLayout.astro');
    expect(base.indexOf('class="skip-link" href="#content"')).toBeLessThan(base.indexOf('<nav class="nav">'));
    expect(base).toContain('<main id="content" tabindex="-1">');
    expect(css).toMatch(/\.skip-link:focus\{top:8px\}/);
  });
  it('the macro percent inputs keep the solid calculator focus ring (it outranks .pctwrap input:focus)', () => {
    expect(css).toContain('.calc input[type=number]:focus,.calc select:focus{border-color:var(--signal);box-shadow:0 0 0 2px var(--signal)}');
  });
  it('the theme toggle survives blocked storage and follows other tabs', () => {
    const t = read('src/components/ThemeToggle.astro');
    expect(t).toMatch(/try \{ return localStorage\.getItem\('theme'\)/);
    expect(t).toMatch(/try \{ localStorage\.setItem\('theme', v\); \} catch/);
    expect(t).toContain("addEventListener('storage'");
  });
  it('open dialogs do not scroll the page behind them', () => {
    expect(css).toContain('dialog:modal{overscroll-behavior:contain}');
    expect(css).toContain('dialog::backdrop{overflow:hidden;overscroll-behavior:contain}');
  });
});

describe('v2.54.3: mobile menu, menu buttons and scrolling tables', () => {
  const base = read('src/layouts/BaseLayout.astro');
  it('the mobile menu is a button and a popover, not details/summary', () => {
    expect(base).not.toMatch(/<details class="mobile-nav"/);
    expect(base).toMatch(/<button class="mobile-nav-btn" type="button" popovertarget="mobile-nav-panel"/);
    expect(base).toMatch(/id="mobile-nav-panel" popover="auto"/);
    expect(base).toContain("'popover' in HTMLElement.prototype"); // fallback for older browsers
  });
  it('the menu buttons work: Search and Theme listen on the document, not on buttons bound too early', () => {
    const search = read('src/components/SiteSearch.astro');
    const theme = read('src/components/ThemeToggle.astro');
    expect(search).toContain("e.target.closest('[data-search-open]')");
    expect(search).not.toContain("querySelectorAll('[data-search-open]').forEach");
    expect(theme).toContain("e.target.closest('[data-theme-toggle]')");
    expect(theme).toContain("addEventListener('DOMContentLoaded', () => apply(pref))");
  });
  it('every scrolling table is a named region, focusable only while it overflows', () => {
    const wrap = read('src/components/TableWrap.astro');
    expect(wrap).toContain('role="region" aria-label={label}');
    expect(wrap).toContain("el.setAttribute('tabindex', '0')");
    for (const f of ['src/pages/library/[kind]/[slug].astro', 'src/pages/library/foods/[slug].astro',
      'src/pages/library/fast-food/[slug].astro', 'src/pages/tools/powerlifting-score.astro', 'src/pages/tools/ffmi.astro']) {
      const s = read(f);
      expect(s, f).not.toContain('<div class="lib-table-wrap">');
      expect(s, f).toContain('<TableWrap label=');
    }
  });
});
