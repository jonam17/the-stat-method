#!/usr/bin/env node
/**
 * Bitmap icons generated from public/favicon.svg, the one source of the mark.
 *
 *   public/favicon.ico          16, 32 and 48 px — for older browsers, feed readers and
 *                               crawlers that request /favicon.ico whatever the page declares
 *   public/apple-touch-icon.png 180 px — iOS ignores SVG icons, and without this
 *                               "Add to Home Screen" uses a screenshot of the page
 *
 * Run by hand after changing favicon.svg (npm run favicons), then commit both files.
 * Not part of the build, so a build never leaves them modified.
 */
import { readFile, writeFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const PUBLIC = join(dirname(fileURLToPath(import.meta.url)), '..', 'public');
const svg = await readFile(join(PUBLIC, 'favicon.svg'));
const png = size => sharp(svg, { density: 72 * size / 16 }).resize(size, size).png().toBuffer();

// An ICO file may hold PNG images directly: a 6-byte header, one 16-byte entry per
// image, then the images. Every browser that still asks for an ICO reads this form.
const sizes = [16, 32, 48];
const images = await Promise.all(sizes.map(png));
const header = Buffer.alloc(6);
header.writeUInt16LE(0, 0);            // reserved
header.writeUInt16LE(1, 2);            // type: icon
header.writeUInt16LE(sizes.length, 4);
let offset = 6 + 16 * sizes.length;
const entries = sizes.map((s, i) => {
  const e = Buffer.alloc(16);
  e.writeUInt8(s, 0); e.writeUInt8(s, 1);   // width, height (0 would mean 256)
  e.writeUInt8(0, 2); e.writeUInt8(0, 3);   // no palette, reserved
  e.writeUInt16LE(1, 4); e.writeUInt16LE(32, 6);
  e.writeUInt32LE(images[i].length, 8);
  e.writeUInt32LE(offset, 12);
  offset += images[i].length;
  return e;
});
await writeFile(join(PUBLIC, 'favicon.ico'), Buffer.concat([header, ...entries, ...images]));
await writeFile(join(PUBLIC, 'apple-touch-icon.png'), await png(180));
console.log(`✓ public/favicon.ico (${sizes.join(', ')} px) and public/apple-touch-icon.png (180 px) written`);
