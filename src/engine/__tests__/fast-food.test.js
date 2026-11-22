/**
 * Fast-food data integrity (v2.48.0). Every chain file is checked as data: the
 * figures must be internally consistent, so a mistyped number is caught before a
 * person checks the page. These run on drafts too.
 */
import { describe, it, expect } from 'vitest';
import { readdirSync, readFileSync } from 'node:fs';
import yaml from 'js-yaml';
import { proteinPer100, ranked, lowestCalories, val, choice, rowsOf, startTotals, sectionsOf } from '../../data/fast-food-rank.js';

const DIR = 'src/content/fast-food';
const files = readdirSync(DIR).filter(f => f.endsWith('.yaml'));
const load = f => yaml.load(readFileSync(`${DIR}/${f}`, 'utf8'));

// Build-your-own chains (v2.52.0): the same checks, per ingredient, plus the builder's own rules.
function builderChecks(d) {
  const groups = d.builder.groups;
  const items = groups.flatMap(g => g.items);
  it('has no duplicate group keys or ingredient names', () => {
    expect(new Set(groups.map(g => g.key)).size).toBe(groups.length);
    expect(new Set(items.map(i => i.name)).size).toBe(items.length);
  });
  it('starts every choose-one group on exactly one choice', () => {
    for (const g of groups.filter(g => g.pick === 'one')) {
      expect(g.items.filter(i => i.start).map(i => i.start), g.label).toEqual([1]);
    }
  });
  it('gives a portion for every ingredient with calories', () => {
    for (const i of items.filter(i => i.kcal > 0)) expect(i.portion, i.name).not.toBe('');
  });
  it('calories agree with protein, carbs and fat (within 60 kcal)', () => {
    for (const i of items.filter(i => !i.atwaterGap)) {
      const atwater = 4 * val(i.protein) + 4 * val(i.carbs) + 9 * val(i.fat);
      expect(Math.abs(atwater - i.kcal), `${i.name}: ${i.kcal} kcal vs ${atwater}`).toBeLessThanOrEqual(60);
    }
  });
}

describe('fast-food files', () => {
  it('at least one chain exists', () => expect(files.length).toBeGreaterThan(0));

  for (const f of files) {
    const d = load(f);
    describe(d.name, () => {
      it('names its official source with a check date', () => {
        expect(d.source.url).toMatch(/^https:\/\//);
        expect(String(d.source.checked)).toMatch(/\d{4}-\d{2}-\d{2}|\d{4}/);
      });
      if (d.builder) return builderChecks(d);
      it('has no duplicate item names', () => {
        const names = d.items.map(i => i.name);
        expect(new Set(names).size).toBe(names.length);
      });
      it('gives servings for all items or none', () => {
        const withServing = d.items.filter(i => i.servingG || i.servingOz).length;
        expect([0, d.items.length]).toContain(withServing);
      });
      it('uses only its own listed sections', () => {
        const keys = d.sections.map(s => s.key);
        for (const i of d.items) expect(keys, i.name).toContain(i.section);
      });
      // Calories should be close to 4 kcal/g protein and carbs and 9 kcal/g fat.
      // Chains round to 10 kcal and to whole grams, and fiber counts for less than
      // 4 kcal/g, so a gap up to 60 kcal is allowed; a bigger one means a typo.
      it('calories agree with protein, carbs and fat (within 60 kcal)', () => {
        for (const i of d.items.filter(i => !i.atwaterGap)) {
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

describe('build-your-own chains', () => {
  const d = {
    builder: { groups: [
      { key: 'base', label: 'Base', pick: 'one', items: [
        { name: 'Bowl', portion: '', kcal: 0, protein: 0, carbs: 0, fat: 0, start: 1 },
        { name: 'Tacos', portion: '1 ea', kcal: 70, protein: 1, carbs: 10, fat: 2.5, count: 3 } ] },
      { key: 'top', label: 'Toppings', pick: 'many', items: [
        { name: 'Meat', portion: '4 oz', kcal: 180, protein: 32, carbs: 0, fat: 7, start: 2 },
        { name: 'Salsa', portion: '2 oz', kcal: 10, protein: '<1', carbs: 2, fat: 0, start: 1 } ] },
    ] },
  };
  it('counts "<1" as 0', () => { expect(val('<1')).toBe(0); expect(val(4)).toBe(4); });
  it('multiplies a choice by its count', () => {
    expect(choice(d.builder.groups[0].items[1])).toMatchObject({ portion: '3 × 1 ea', kcal: 210, protein: 3, carbs: 30, fat: 7.5 });
  });
  it('ranks every choice with calories, not the empty bowl', () => {
    expect(rowsOf(d).map(r => [r.name, r.section])).toEqual([['Tacos', 'base'], ['Meat', 'top'], ['Salsa', 'top']]);
  });
  it('filters by builder group', () => expect(sectionsOf(d)).toEqual([{ key: 'base', label: 'Base' }, { key: 'top', label: 'Toppings' }]));
  it('adds up the starting order', () => expect(startTotals(d)).toEqual({ kcal: 370, protein: 64, carbs: 2, fat: 14 }));
  it('ranks a "<1" protein as 0', () => expect(proteinPer100({ kcal: 10, protein: '<1' })).toBe(0));

  // The two real starting orders, added up by hand from the chains' guides.
  const real = f => yaml.load(readFileSync(`${DIR}/${f}`, 'utf8'));
  it('Chipotle starts as a chicken bowl: 545 kcal, 44 g protein', () => {
    expect(startTotals(real('chipotle.yaml'))).toMatchObject({ kcal: 545, protein: 44 });
  });
  it('Five Guys starts as a hamburger (two patties, bun): 844 kcal, 39 g protein', () => {
    expect(startTotals(real('five-guys.yaml'))).toMatchObject({ kcal: 844, protein: 39 });
  });
});
