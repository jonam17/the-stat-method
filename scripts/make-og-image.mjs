#!/usr/bin/env node
/**
 * Generates the default Open Graph share card (audit F-024).
 * Previously the site had no image assets at all, so every share to Slack,
 * iMessage, LinkedIn etc. rendered as a bare URL.
 *
 * Run: node scripts/make-og-image.mjs   (writes public/og-default.png)
 *
 * Design note: this card fronts every share, so it tracks the clinical
 * brutalist system exactly — bone ground, obsidian ink, one signal accent,
 * square corners, hard rules, monospaced data line. No gradients.
 *
 * Fonts are stacks ending in a generic family. librsvg resolves against
 * whatever is installed on the build machine, and the site faces (Space
 * Grotesk / Space Mono) are npm packages rather than system fonts, so they
 * are deliberately not named — a missing family falls back mid-render and
 * shifts the layout silently.
 */
import sharp from 'sharp';
import { mkdirSync } from 'node:fs';
import { SITE } from '../src/site.config.js';
import { liveTools } from '../src/data/tools.js';

// Derived, not hardcoded — the card cannot go stale when a tool ships.
const instrumentCount = liveTools().filter(t => t.slug).length;

const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');

// Palette mirrors :root in src/styles/global.css. Keep in sync.
const PAPER     = '#F9F8F6';
const INK       = '#0A0A0A';
const INK_SOFT  = '#3A3A38';
const INK_MUTE  = '#6E6E68';
const SIGNAL    = '#E2551B';
const NUTRITION = '#C0524A';
const TRAINING  = '#4A7C8C';
const RECOVERY  = '#B08A34';

const SANS = "'DejaVu Sans',Helvetica,Arial,sans-serif";
const MONO = "'DejaVu Sans Mono',ui-monospace,Menlo,monospace";

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">
  <rect width="1200" height="630" fill="${PAPER}"/>

  <!-- single high-impact accent, full bleed -->
  <rect x="0" y="0" width="1200" height="16" fill="${SIGNAL}"/>

  <!-- brand glyph: the taxonomy triad as a bar readout, square corners -->
  <g transform="translate(90,120)">
    <rect x="0"  y="26" width="16" height="30" fill="${NUTRITION}"/>
    <rect x="24" y="0"  width="16" height="56" fill="${TRAINING}"/>
    <rect x="48" y="14" width="16" height="42" fill="${RECOVERY}"/>
  </g>

  <text x="176" y="163" font-family="${MONO}" font-size="21"
        letter-spacing="4" fill="${INK_MUTE}">NO ACCOUNT · INPUTS STAY LOCAL</text>

  <text x="90" y="330" font-family="${SANS}" font-size="96" font-weight="700"
        letter-spacing="-4" fill="${INK}">${esc(SITE.name)}</text>

  <text x="90" y="392" font-family="${SANS}" font-size="34"
        fill="${INK_SOFT}">${esc(SITE.tagline)}</text>

  <!-- hard rule, not a soft divider -->
  <rect x="90" y="486" width="1020" height="2" fill="${INK}"/>

  <text x="90" y="542" font-family="${MONO}" font-size="23"
        letter-spacing="1" fill="${INK_SOFT}">EVERY FORMULA SOURCED. EVERY LIMITATION STATED.</text>

  <text x="1110" y="542" font-family="${MONO}" font-size="23" letter-spacing="3"
        fill="${SIGNAL}" text-anchor="end">${instrumentCount} INSTRUMENTS</text>
</svg>`;

mkdirSync('public', { recursive: true });
await sharp(Buffer.from(svg)).png().toFile('public/og-default.png');
console.log('✓ public/og-default.png written (1200×630)');
