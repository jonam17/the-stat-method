/**
 * Foods (v2.49.0): the data files and the portion calculator's maths.
 * The data checks run on drafts too.
 */
import { describe, it, expect } from 'vitest';
import { readdirSync, readFileSync } from 'node:fs';
import yaml from 'js-yaml';
import { DAILY_VALUES } from '../../data/daily-values.js';
import { FOOD_GROUPS } from '../../data/foods-meta.js';
import {
  G_PER_OZ, MAX_PROTEIN_SOURCE_G, scaleMacros, pctDV, topNutrients, gramsForProtein, amountOk, gToOz, ozToG,
} from '../portion.js';

const DIR = 'src/content/foods';
const files = readdirSync(DIR).filter(f => f.endsWith('.yaml'));
const load = f => yaml.load(readFileSync(`${DIR}/${f}`, 'utf8'));
const NUTRIENT_DIR = 'src/content/nutrients';

describe('food files', () => {
  it('at least one food exists', () => expect(files.length).toBeGreaterThan(0));
  const ids = files.flatMap(f => load(f).forms.map(v => v.fdcId));
  it('no FDC entry is used twice', () => expect(new Set(ids).size).toBe(ids.length));

  for (const f of files) {
    const d = load(f);
    describe(d.name, () => {
      it('is in a known group', () => expect(FOOD_GROUPS.map(g => g.key)).toContain(d.group));
      it('has unique form names', () => {
        const names = d.forms.map(v => v.name);
        expect(new Set(names).size).toBe(names.length);
      });
      for (const v of d.forms) {
        it(`${v.name}: every vitamin and mineral has a Daily Value and a Library page`, () => {
          for (const k of Object.keys(v.micros)) {
            expect(DAILY_VALUES[k], k).toBeDefined();
            expect(readdirSync(NUTRIENT_DIR), k).toContain(`${k}.yaml`);
          }
        });
        // USDA works calories out with food-specific factors, so 4/4/9 is only a rough
        // check; per 100 g these foods sit within 10 kcal of it. A bigger gap is a typo, unless the
        // form is marked atwaterGap after re-checking (then within 25 kcal).
        const tol = v.atwaterGap ? 25 : 10;
        it(`${v.name}: calories within ${tol} kcal of 4/4/9 per 100 g`, () => {
          const p = v.per100;
          expect(Math.abs(4 * p.protein + 4 * p.carbs + 9 * p.fat - p.kcal)).toBeLessThanOrEqual(tol);
        });
        it(`${v.name}: protein, carbs, fat and fiber add up to no more than 100 g`, () => {
          const p = v.per100;
          expect(p.protein + p.carbs + p.fat).toBeLessThanOrEqual(100);
          expect(p.fiber).toBeLessThanOrEqual(p.carbs);
        });
      }
    });
  }
});

describe('Daily Values', () => {
  it('are the 21 CFR 101.9(c)(8)(iv) adult values used on the foods pages', () => {
    const dv = k => DAILY_VALUES[k].dv;
    expect([dv('vitamin-a'), dv('vitamin-c'), dv('vitamin-d'), dv('calcium'), dv('iron'), dv('potassium')]).toEqual([900, 90, 20, 1300, 18, 4700]);
    expect([dv('copper'), dv('folate'), dv('choline'), dv('selenium')]).toEqual([0.9, 400, 550, 55]);
  });
});

describe('portion maths', () => {
  const chicken = { kcal: 165, protein: 31, carbs: 0, fat: 3.57, fiber: 0 };
  it('an ounce is exactly 28.349523125 g', () => expect(G_PER_OZ).toBeCloseTo(28.349523125, 9));
  it('g ↔ oz round-trips', () => expect(ozToG(gToOz(85))).toBeCloseTo(85, 9));
  it('scales per-100 g figures to any weight', () => {
    expect(scaleMacros(chicken, 86)).toEqual({ kcal: 142, protein: 26.7, carbs: 0, fat: 3.1, fiber: 0 });
    expect(scaleMacros(chicken, 100)).toEqual({ kcal: 165, protein: 31, carbs: 0, fat: 3.6, fiber: 0 });
  });
  it('% Daily Value is a whole number', () => expect(pctDV(11.78, 16)).toBe(74));
  it('ranks nutrients by share of the Daily Value, drops zeros, breaks ties by name', () => {
    const dvs = { a: { dv: 10 }, b: { dv: 1 }, c: { dv: 2 }, z: { dv: 5 } };
    expect(topNutrients({ a: 5, b: 0.5, c: 0, z: 2.5 }, dvs).map(t => t.key)).toEqual(['a', 'b', 'z']);
    expect(topNutrients({ a: 1, b: 2 }, dvs).map(t => t.key)).toEqual(['b', 'a']);
  });
  it('skips nutrients without a Daily Value', () => {
    expect(topNutrients({ x: 100, a: 1 }, { a: { dv: 10 } }).map(t => t.key)).toEqual(['a']);
  });
  it('grams for a protein target', () => {
    const r = gramsForProtein(31, 31);
    expect(r.ok).toBe(true); expect(r.g).toBeCloseTo(100, 9);
  });
  it('more than 500 g is not a practical protein source', () => {
    expect(gramsForProtein(30, 0.26)).toEqual({ ok: false, reason: 'not-practical' });
    expect(gramsForProtein(30, 0)).toEqual({ ok: false, reason: 'not-practical' });
    expect(gramsForProtein(30, 6).ok).toBe(true);                       // exactly 500 g
    expect(MAX_PROTEIN_SOURCE_G).toBe(500);
  });
  it('protein targets outside 1–300 g are refused', () => {
    expect(gramsForProtein(0, 31).reason).toBe('range');
    expect(gramsForProtein(301, 31).reason).toBe('range');
    expect(gramsForProtein(NaN, 31).reason).toBe('range');
  });
  it('amounts outside 1–2,000 g are refused', () => {
    expect([amountOk(0), amountOk(1), amountOk(2000), amountOk(2001), amountOk(NaN)]).toEqual([false, true, true, false, false]);
  });
});

describe('food groups', () => {
  it('the schema allows exactly the groups the pages list', async () => {
    const { readFileSync } = await import('node:fs');
    const src = readFileSync('src/content.config.ts', 'utf8');
    const m = src.match(/group: z\.enum\(\[([^\]]*)\]\),\s*\/\/ FOOD_GROUPS/);
    const keys = m[1].split(',').map(s => s.trim().replace(/'/g, ''));
    expect(keys).toEqual(FOOD_GROUPS.map(g => g.key));
  });
});
