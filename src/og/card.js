/**
 * Share cards (Open Graph images), drawn at build time.
 *
 * Text is converted to vector outlines from the site's own font files (the
 * @fontsource packages), so a card looks the same on any machine that builds it.
 * The previous generator named system fonts, which librsvg resolves against
 * whatever the build machine has installed; Cloudflare's build image is not ours
 * to inspect. Wrapping uses the fonts' real glyph widths for the same reason.
 *
 * Design follows the site: bone ground, obsidian ink, one accent, square corners,
 * hard rules, monospaced data lines. Palette mirrors :root in src/styles/global.css.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import opentype from 'opentype.js';
import sharp from 'sharp';

export const W = 1200, H = 630;
export const PALETTE = {
  paper: '#F9F8F6', ink: '#0A0A0A', inkSoft: '#3A3A38', inkMute: '#6E6E68', signal: '#E2551B',
  nutrition: '#C0524A', training: '#4A7C8C', recovery: '#B08A34', health: '#4E8C63',
};
/** Article categories use the colours their pills use on the site. */
export const CATEGORY_ACCENT = {
  Nutrition: PALETTE.nutrition, Exercise: PALETTE.training,
  Health: PALETTE.health, Recovery: PALETTE.recovery,
};

const FONT_DIR = join(process.cwd(), 'node_modules', '@fontsource');
const load = f => { const b = readFileSync(join(FONT_DIR, f)); return opentype.parse(b.buffer.slice(b.byteOffset, b.byteOffset + b.length)); };
let fonts;
const F = () => (fonts ??= {
  display: load('space-grotesk/files/space-grotesk-latin-700-normal.woff'),
  mono: load('space-mono/files/space-mono-latin-400-normal.woff'),
  sans: load('inter/files/inter-latin-400-normal.woff'),
});

/** Advance width of `text` at `size` px, with kerning and extra letter spacing in px. */
export function measure(font, text, size, spacing = 0) {
  const glyphs = font.stringToGlyphs(text);
  const scale = size / font.unitsPerEm;
  let w = 0;
  glyphs.forEach((g, i) => {
    w += (g.advanceWidth ?? 0) * scale;
    if (i < glyphs.length - 1) w += font.getKerningValue(g, glyphs[i + 1]) * scale + spacing;
  });
  return w;
}

/** SVG path for one line of text. `anchor` is 'start' or 'end'. */
function line(font, text, x, y, size, { fill, spacing = 0, anchor = 'start' }) {
  const glyphs = font.stringToGlyphs(text);
  const scale = size / font.unitsPerEm;
  let cx = anchor === 'end' ? x - measure(font, text, size, spacing) : x;
  let d = '';
  glyphs.forEach((g, i) => {
    d += g.getPath(cx, y, size).toPathData(2);
    cx += (g.advanceWidth ?? 0) * scale;
    if (i < glyphs.length - 1) cx += font.getKerningValue(g, glyphs[i + 1]) * scale + spacing;
  });
  return `<path d="${d}" fill="${fill}"/>`;
}

/** Greedy word wrap to `maxWidth`. A single word wider than the line stays whole. */
export function wrap(font, text, size, maxWidth) {
  const lines = [];
  let cur = '';
  for (const word of String(text).split(/\s+/).filter(Boolean)) {
    const next = cur ? `${cur} ${word}` : word;
    if (cur && measure(font, next, size) > maxWidth) { lines.push(cur); cur = word; }
    else cur = next;
  }
  if (cur) lines.push(cur);
  return lines;
}

const MARGIN = 90, TEXT_W = W - 2 * MARGIN;
const RULE_Y = 486, FOOT_Y = 542;

/** The brand glyph: the taxonomy triad as a bar readout. */
const glyph = (x, y, s = 1) =>
  `<g transform="translate(${x},${y}) scale(${s})">` +
  `<rect x="0" y="26" width="16" height="30" fill="${PALETTE.nutrition}"/>` +
  `<rect x="24" y="0" width="16" height="56" fill="${PALETTE.training}"/>` +
  `<rect x="48" y="14" width="16" height="42" fill="${PALETTE.recovery}"/></g>`;

/**
 * A page's card. Every string is drawn whole or not at all: the title shrinks to fit
 * three lines, and the subtitle appears only if all of it fits above the rule — a
 * card never cuts a sentence off mid-claim.
 */
export function pageCardSvg({ kicker, title, subtitle, footLeft, footRight, accent = PALETTE.signal }) {
  const { display, mono, sans } = F();
  let size = 76, lines;
  for (size of [76, 66, 58, 50]) {
    lines = wrap(display, title, size, TEXT_W);
    if (lines.length <= 3 && lines.every(l => measure(display, l, size) <= TEXT_W)) break;
  }
  // Fail the build rather than draw a title over the rule or off the card.
  if (lines.length > 3 || lines.some(l => measure(display, l, size) > TEXT_W)) {
    throw new Error(`Share card: "${title}" does not fit three lines at ${size}px — shorten the title.`);
  }
  const lead = Math.round(size * 1.08);
  const titleTop = 214 + size * 0.78;                         // first baseline
  const titleBottom = titleTop + lead * (lines.length - 1);
  let sub = [];
  if (subtitle) {
    const s = wrap(sans, subtitle, 29, TEXT_W);
    const firstBaseline = titleBottom + 58;
    if (firstBaseline + 40 * (s.length - 1) <= RULE_Y - 34) sub = s;
  }
  const subTop = titleBottom + 58;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">` +
    `<rect width="${W}" height="${H}" fill="${PALETTE.paper}"/>` +
    `<rect width="${W}" height="16" fill="${PALETTE.signal}"/>` +
    glyph(MARGIN, 96, 0.72) +
    `<rect x="${MARGIN + 66}" y="121" width="14" height="14" fill="${accent}"/>` +
    line(mono, kicker.toUpperCase(), MARGIN + 92, 135, 21, { fill: PALETTE.inkMute, spacing: 3.5 }) +
    lines.map((l, i) => line(display, l, MARGIN, titleTop + i * lead, size, { fill: PALETTE.ink, spacing: -size * 0.02 })).join('') +
    sub.map((l, i) => line(sans, l, MARGIN, subTop + i * 40, 29, { fill: PALETTE.inkSoft })).join('') +
    `<rect x="${MARGIN}" y="${RULE_Y}" width="${TEXT_W}" height="2" fill="${PALETTE.ink}"/>` +
    line(mono, footLeft.toUpperCase(), MARGIN, FOOT_Y, 22, { fill: PALETTE.inkSoft, spacing: 2 }) +
    (footRight ? line(mono, footRight.toUpperCase(), W - MARGIN, FOOT_Y, 22, { fill: accent === PALETTE.signal ? PALETTE.signal : accent, spacing: 2, anchor: 'end' }) : '') +
    `</svg>`;
}

/** The site-wide card, for pages without their own. Same content as before v2.20.0. */
export function defaultCardSvg({ name, tagline, instruments }) {
  const { display, mono, sans } = F();
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">` +
    `<rect width="${W}" height="${H}" fill="${PALETTE.paper}"/>` +
    `<rect width="${W}" height="16" fill="${PALETTE.signal}"/>` +
    glyph(MARGIN, 120) +
    line(mono, 'NO ACCOUNT · INPUTS STAY LOCAL', 176, 163, 21, { fill: PALETTE.inkMute, spacing: 4 }) +
    line(display, name, MARGIN, 330, 96, { fill: PALETTE.ink, spacing: -4 }) +
    line(sans, tagline, MARGIN, 392, 34, { fill: PALETTE.inkSoft }) +
    `<rect x="${MARGIN}" y="${RULE_Y}" width="${TEXT_W}" height="2" fill="${PALETTE.ink}"/>` +
    line(mono, 'EVERY FORMULA SOURCED. EVERY LIMITATION STATED.', MARGIN, FOOT_Y, 22, { fill: PALETTE.inkSoft, spacing: 1 }) +
    line(mono, `${instruments} INSTRUMENTS`, W - MARGIN, FOOT_Y, 22, { fill: PALETTE.signal, spacing: 3, anchor: 'end' }) +
    `</svg>`;
}

export const toPng = svg => sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toBuffer();
