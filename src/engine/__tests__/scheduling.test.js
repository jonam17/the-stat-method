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
