/**
 * Scheduled publishing rule. One function decides whether an article is live;
 * every page, the search index and the sitemap depend on it.
 */
import { describe, it, expect } from 'vitest';
import { isPublished } from '../../data/publishing.js';   // the real rule, not a copy

const at = s => new Date(s);
const SUNDAY_10_UTC = at('2026-10-04T10:00:00Z');

describe('scheduled publishing', () => {
  it('publishes an article dated today, on the 10:00 UTC Sunday build', () => {
    expect(isPublished({ published: at('2026-10-04'), draft: false }, SUNDAY_10_UTC)).toBe(true);
  });
  it('holds back an article dated next Sunday', () => {
    expect(isPublished({ published: at('2026-10-11'), draft: false }, SUNDAY_10_UTC)).toBe(false);
  });
  it('holds back an article dated tomorrow', () => {
    expect(isPublished({ published: at('2026-10-05'), draft: false }, SUNDAY_10_UTC)).toBe(false);
  });
  it('keeps publishing articles from the past', () => {
    expect(isPublished({ published: at('2026-08-09'), draft: false }, SUNDAY_10_UTC)).toBe(true);
  });
  it('never publishes a draft, whatever its date', () => {
    expect(isPublished({ published: at('2020-01-01'), draft: true }, SUNDAY_10_UTC)).toBe(false);
  });
  it('a missed Sunday is caught by the next daily build', () => {
    // Sunday's run failed; Monday 10:00 UTC must still include Sunday's article.
    expect(isPublished({ published: at('2026-10-04'), draft: false },
      at('2026-10-05T10:00:00Z'))).toBe(true);
  });
});

import { isVisible, articleStatus } from '../../data/publishing.js';

describe('local preview (npm run dev only)', () => {
  const draft = { published: at('2026-10-04'), draft: true };
  const scheduled = { published: at('2026-10-11'), draft: false };
  const live = { published: at('2026-10-04'), draft: false };
  it('with preview off, visibility is exactly the publishing rule', () => {
    for (const a of [draft, scheduled, live])
      expect(isVisible(a, SUNDAY_10_UTC, false)).toBe(isPublished(a, SUNDAY_10_UTC));
  });
  it('with preview on, drafts and scheduled articles are visible', () => {
    for (const a of [draft, scheduled, live]) expect(isVisible(a, SUNDAY_10_UTC, true)).toBe(true);
  });
  it('labels each state for the banner', () => {
    expect(articleStatus(draft, SUNDAY_10_UTC)).toBe('draft');
    expect(articleStatus(scheduled, SUNDAY_10_UTC)).toBe('scheduled');
    expect(articleStatus(live, SUNDAY_10_UTC)).toBe('live');
  });
});

import { rehypeScheduledLinks, articleStates } from '../../plugins/rehype-scheduled-links.mjs';

describe('links to scheduled articles', () => {
  const states = new Map([
    ['live-one', { draft: false, published: at('2026-10-04') }],
    ['next-sunday', { draft: false, published: at('2026-10-11') }],
    ['a-draft', { draft: true, published: at('2026-10-04') }],
  ]);
  const tree = () => ({ type: 'root', children: [{ type: 'element', tagName: 'p', properties: {}, children: [
    { type: 'text', value: 'See ' },
    { type: 'element', tagName: 'a', properties: { href: '/articles/next-sunday/' }, children: [{ type: 'text', value: 'overload' }] },
    { type: 'text', value: ', ' },
    { type: 'element', tagName: 'a', properties: { href: '/articles/live-one/#part' }, children: [{ type: 'text', value: 'volume' }] },
    { type: 'text', value: ', ' },
    { type: 'element', tagName: 'a', properties: { href: '/articles/a-draft/' }, children: [{ type: 'text', value: 'draft' }] },
    { type: 'text', value: ', ' },
    { type: 'element', tagName: 'a', properties: { href: '/tools/one-rep-max/' }, children: [{ type: 'text', value: 'tool' }] },
  ] }] });
  const links = t => t.children[0].children.filter(n => n.tagName === 'a').map(n => n.properties.href);
  const text = t => t.children[0].children.map(n => n.value ?? n.children[0].value).join('');

  it('before the date: scheduled and draft targets become plain text, words kept', () => {
    const t = tree(); rehypeScheduledLinks({ now: SUNDAY_10_UTC, states })(t);
    expect(links(t)).toEqual(['/articles/live-one/#part', '/tools/one-rep-max/']);
    expect(text(t)).toBe('See overload, volume, draft, tool');
  });
  it('on the date\u2019s 10:00 UTC build the link appears by itself', () => {
    const t = tree(); rehypeScheduledLinks({ now: at('2026-10-11T10:00:00Z'), states })(t);
    expect(links(t)).toContain('/articles/next-sunday/');
    expect(links(t)).not.toContain('/articles/a-draft/');
  });
  it('local preview leaves every link alone', () => {
    const t = tree(); rehypeScheduledLinks({ preview: true, now: SUNDAY_10_UTC, states })(t);
    expect(links(t)).toHaveLength(4);
  });
  it('reads every real article\u2019s date and draft flag', () => {
    const real = articleStates();
    expect(real.size).toBeGreaterThan(15);
    for (const [, s] of real) expect(s.published instanceof Date && !isNaN(s.published)).toBe(true);
  });
});
