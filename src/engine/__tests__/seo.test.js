// SEO audit fixes (v2.54.2, PENDING item 69a). Lengths follow the audit's 120-160 character target.
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { metaDescription, META_MIN, META_MAX, FOOD_META_TAIL, EXERCISE_META_TAIL } from '../../data/meta.js';
import { CATEGORIES } from '../../data/categories.js';
import { KINDS } from '../../data/nutrients-kinds.js';
import { lastmodMap } from '../../data/lastmod.mjs';

const inRange = s => s.length >= META_MIN && s.length <= META_MAX;

describe('meta descriptions', () => {
  it('adds the tail only to a short lead, and only when it fits', () => {
    expect(metaDescription('x'.repeat(100) + '.', ' Tail.')).toBe('x'.repeat(100) + '. Tail.');
    expect(metaDescription('x'.repeat(130), ' Tail.')).toBe('x'.repeat(130));
    expect(metaDescription('x'.repeat(119), ' ' + 'y'.repeat(50))).toBe('x'.repeat(119));
    expect(metaDescription('  lead  ', '')).toBe('lead');
  });
  it('keeps the tails honest and short', () => {
    expect(FOOD_META_TAIL.length).toBeLessThanOrEqual(40);
    expect(EXERCISE_META_TAIL.length).toBeLessThanOrEqual(40);
  });
  it('every article category has a search description of 120-160 characters', () => {
    for (const c of CATEGORIES) expect(inRange(c.meta), `${c.name}: ${c.meta.length}`).toBe(true);
  });
  it('every Library section has a search description of 120-160 characters', () => {
    for (const k of KINDS) expect(inRange(k.meta), `${k.label}: ${k.meta.length}`).toBe(true);
  });
  it('tool search descriptions are 120-160 characters', () => {
    const src = readFileSync('src/layouts/ToolLayout.astro', 'utf8');
    const block = src.slice(src.indexOf('const seoDescriptions = {'), src.indexOf('};', src.indexOf('const seoDescriptions = {')));
    const values = [...block.matchAll(/: '((?:[^'\\]|\\.)*)',/g)].map(m => m[1]);
    expect(values.length).toBe(6);
    for (const v of values) expect(inRange(v), `${v.length}: ${v}`).toBe(true);
  });
  it('thin sections carry a written introduction with their calculators', () => {
    for (const slug of ['health', 'recovery']) {
      const c = CATEGORIES.find(x => x.slug === slug);
      expect(c.intro.join(' ').split(/\s+/).length, slug).toBeGreaterThan(60);
      expect(c.tools.length, slug).toBeGreaterThan(0);
    }
    expect(KINDS.find(k => k.key === 'other').intro.join(' ').split(/\s+/).length).toBeGreaterThan(60);
  });
});

describe('sitemap lastmod', () => {
  const map = lastmodMap();
  it('dates articles and Library entries, as YYYY-MM-DD', () => {
    expect(map['/articles/caffeine-and-sleep/']).toBe('2026-08-20');
    expect(map['/library/foods/milk/']).toBe('2026-11-21');
    expect(map['/library/minerals/zinc/']).toBe('2026-10-18');
    for (const v of Object.values(map)) expect(v).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
  it('gives no date to tools, hubs or policy pages', () => {
    for (const k of Object.keys(map)) expect(k).toMatch(/^\/(articles|library\/(vitamins|minerals|other-nutrients|exercises|foods|fast-food))\/[^/]+\/$/);
  });
  it('uses an article\'s updated date when it has one', () => {
    expect(map['/articles/ffmi-explained/']).toBe('2026-10-26');
  });
});

describe('Organization structured data', () => {
  const base = readFileSync('src/layouts/BaseLayout.astro', 'utf8');
  it('is emitted on the homepage only, and the WebSite entry points to it', () => {
    expect(base).toContain("const organization = pageType === 'WebSite' ? {");
    expect(base).toContain("publisher: { '@id': abs('/#organization') }");
  });
});
