#!/usr/bin/env node
/**
 * Clears Astro's render cache before every build.
 *
 * Astro caches each article's rendered HTML, keyed on the article file. Charts
 * are drawn into articles at build time from src/charts/definitions.js — which
 * Astro does not know the article depends on. So a corrected chart definition,
 * or a corrected formula in the engine, left the OLD chart in place until the
 * article file itself happened to change.
 *
 * That silently broke the promise every chart makes: that it cannot contradict
 * the calculator, because it is computed from the same code. Clearing the cache
 * costs a few seconds and keeps that true, including if Cloudflare's build cache
 * is ever switched on — it restores node_modules, and this runs after.
 */
import { rmSync } from 'node:fs';
for (const dir of ['.astro', 'node_modules/.astro']) rmSync(dir, { recursive: true, force: true });
