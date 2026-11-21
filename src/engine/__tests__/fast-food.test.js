/**
 * Fast-food data integrity (v2.48.0). Every chain file is checked as data: the
 * figures must be internally consistent, so a mistyped number is caught before a
 * person checks the page. These run on drafts too.
 */
import { describe, it, expect } from 'vitest';
import { readdirSync, readFileSync } from 'node:fs';
import yaml from 'js-yaml';
import { proteinPer100, ranked, lowestCalories } from '../../data/fast-food-rank.js';

const DIR = 'src/content/fast-food';
const files = readdirSync(DIR).filter(f => f.endsWith('.yaml'));
const load = f => yaml.load(readFileSync(`${DIR}/${f}`, 'utf8'));

describe('fast-food files', () => {
  it('at least one chain exists', () => expect(files.length).toBeGreaterThan(0));

  for (const f of files) {
    const d = load(f);
    describe(d.name, () => {
      it('names its official source with a check date', () => {
        expect(d.source.url).toMatch(/^https:\/\//);
        expect(String(d.source.checked)).toMatch(/\d{4}-\d{2}-\d{2}|\d{4}/);
      });
      it('has no duplicate item names', () => {
        const names = d.items.map(i => i.name);
        expect(new Set(names).size).toBe(names.length);
      });
      it('has a serving for every item', () => {
        for (const i of d.items) expect(i.servingG || i.servingOz, i.name).toBeTruthy();
      });
      it('uses only its own listed sections', () => {
        const keys = d.sections.map(s => s.key);
        for (const i of d.items) expect(keys, i.name).toContain(i.section);
      });
      // Calories should be close to 4 kcal/g protein and carbs and 9 kcal/g fat.
      // Chains round to 10 kcal and to whole grams, and fiber counts for less than
      // 4 kcal/g, so a gap up to 60 kcal is allowed; a bigger one means a typo.
      it('calories agree with protein, carbs and fat (within 60 kcal)', () => {
        for (const i of d.items) {
          const atwater = 4 * i.protein + 4 * i.carbs + 9 * i.fat;
          expect(Math.abs(atwater - i.kcal), `${i.name}: ${i.kcal} kcal vs ${atwater}`).toBeLessThanOrEqual(60);
        }
      });
    });
  }
});

describe('fast-food ranking', () => {
  const items = [
    { name: 'B', kcal: 200, protein: 20 },   // 10.0
    { name: 'A', kcal: 100, protein: 10 },   // 10.0, fewer kcal → first
    { name: 'C', kcal: 130, protein: 25 },   // 19.2
    { name: 'D', kcal: 60, protein: 1 },     // 1.7
  ];
  it('works out protein per 100 kcal to one decimal', () => {
    expect(proteinPer100({ kcal: 130, protein: 25 })).toBe(19.2);
    expect(proteinPer100({ kcal: 60, protein: 1 })).toBe(1.7);
  });
  it('ranks highest first, ties to fewer calories', () => {
    expect(ranked(items).map(i => i.name)).toEqual(['C', 'A', 'B', 'D']);
  });
  it('finds the lowest-calorie item', () => expect(lowestCalories(items).name).toBe('D'));
});
