/**
 * Share cards (src/og/card.js). Rendering is exercised by every build; these pin the
 * text layout rules, which no build would notice breaking until a card looked wrong.
 */
import { describe, it, expect } from 'vitest';
import { pageCardSvg, defaultCardSvg, wrap, measure, W } from '../../og/card.js';
import opentype from 'opentype.js';
import { readFileSync } from 'node:fs';

const buf = readFileSync('node_modules/@fontsource/space-grotesk/files/space-grotesk-latin-700-normal.woff');
const display = opentype.parse(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.length));

// Every x coordinate in the SVG's path data, to check nothing is drawn off the card.
const xs = svg => [...svg.matchAll(/d="([^"]+)"/g)].flatMap(m =>
  [...m[1].matchAll(/[MLQC]((?:-?[\d.]+[ ,]?)+)/g)].flatMap(c =>
    c[1].trim().split(/[ ,]+/).map(Number).filter((_, i) => i % 2 === 0)));
const card = over => ({ kicker: 'Article · Exercise', title: 'Training frequency and rest days',
  subtitle: 'A short dek.', footLeft: 'thestatmethod.com', footRight: 'All 8 citations checked', ...over });

describe('share cards', () => {
  it('wraps on real glyph widths and never splits a word', () => {
    const lines = wrap(display, 'How to set your macro split (and why most people overthink it)', 76, 1020);
    expect(lines.length).toBeGreaterThan(1);
    for (const l of lines) expect(measure(display, l, 76)).toBeLessThanOrEqual(1020);
    expect(lines.join(' ')).toBe('How to set your macro split (and why most people overthink it)');
  });

  it('keeps every glyph inside the card, for the longest title on the site and beyond', () => {
    for (const title of ["Heart rate zones: what they are for and why '220 minus age' fails",
      'Body recomposition — losing fat and gaining muscle at once, and who it works for']) {
      for (const x of xs(pageCardSvg(card({ title })))) {
        expect(x).toBeGreaterThanOrEqual(0);
        expect(x).toBeLessThanOrEqual(W);
      }
    }
  });

  it('refuses a title too long for three lines rather than drawing it over the rule', () => {
    const title = 'A deliberately overlong article title that keeps going well past anything '.repeat(3);
    expect(() => pageCardSvg(card({ title }))).toThrow(/shorten the title/);
  });

  it('shows a subtitle whole or not at all — never cut off', () => {
    const short = pageCardSvg(card({ subtitle: 'Fits easily.' }));
    const none = pageCardSvg(card({ subtitle: null }));
    expect(short.length).toBeGreaterThan(none.length);
    const long = 'A subtitle far too long to fit. '.repeat(12);
    expect(pageCardSvg(card({ subtitle: long }))).toBe(none);
  });

  it('draws the default card', () => {
    const svg = defaultCardSvg({ name: 'The Stat Method', tagline: 'Evidence-based tools', instruments: 20 });
    expect(svg).toMatch(/^<svg/);
    for (const x of xs(svg)) expect(x).toBeLessThanOrEqual(W);
  });
});
