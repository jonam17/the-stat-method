/**
 * Library data integrity. Every nutrient file is checked as data, not prose:
 * the numbers must be internally consistent and every claim traceable.
 * These run on drafts too — a draft that fails here could never be published.
 */
import { describe, it, expect } from 'vitest';
import { readdirSync, readFileSync } from 'node:fs';
import yaml from 'js-yaml';

const DIR = 'src/content/nutrients';
const files = readdirSync(DIR).filter(f => f.endsWith('.yaml'));
const load = f => yaml.load(readFileSync(`${DIR}/${f}`, 'utf8'));
const GROUPS = ['19–50', '51–70', '>70'];
const prose = d => [d.does, d.forms ?? '', d.absorption ?? '', d.pairing?.text ?? '', d.deficiency, d.usIntake, ...d.atRisk, d.evidence.established,
  d.evidence.notSupported, d.evidence.mixed ?? '', d.disagreements ?? '', d.tooMuch, d.interactions].join(' ');
const hi = a => (Array.isArray(a) ? a[1] : a);

describe('library files', () => {
  it('at least one nutrient exists', () => expect(files.length).toBeGreaterThan(0));

  for (const f of files) {
    const d = load(f);
    describe(d.name, () => {
      it('has all three adult brackets, in order, with pregnancy and breastfeeding on 19–50', () => {
        expect(d.intake.rows.map(r => r.group)).toEqual(GROUPS);
        const young = d.intake.rows[0];
        expect(young.pregnancy).toBeGreaterThan(0);
        expect(young.lactation).toBeGreaterThan(0);
      });

      it('a total-intake upper limit is never below the recommended amount', () => {
        // Supplement-only limits (magnesium, folate, niacin) can legitimately be
        // lower than total recommended intake, so they are not compared.
        if (!d.ul.rows || d.ul.appliesTo !== 'total') return;
        for (const g of GROUPS) {
          const i = d.intake.rows.find(r => r.group === g), u = d.ul.rows.find(r => r.group === g);
          for (const k of ['male', 'female', 'pregnancy', 'lactation'])
            if (i[k] != null && u[k] != null) expect(u[k], `${g} ${k}`).toBeGreaterThanOrEqual(i[k]);
        }
      });

      it('lists at most five food sources, highest first', () => {
        const amounts = d.sources.foods.map(x => hi(x.amount));
        expect(amounts.length).toBeLessThanOrEqual(5);
        expect(amounts).toEqual([...amounts].sort((a, b) => b - a));
      });

      it('every numbered marker points at a reference, and every reference is cited', () => {
        const cited = new Set([...prose(d).matchAll(/\[(\d+)\]/g)].map(m => +m[1]));
        for (const n of cited) expect(n, `marker [${n}]`).toBeLessThanOrEqual(d.references.length);
        d.references.forEach((_, i) => expect(cited.has(i + 1), `reference ${i + 1} is never cited`).toBe(true));
      });

      it('takes its values from the NIH Office of Dietary Supplements', () => {
        expect(new URL(d.source.url).hostname).toBe('ods.od.nih.gov');
      });

      it('was checked on or after the source was last updated', () => {
        // If the fact sheet changes after this file was checked, the file is stale.
        expect(new Date(d.source.checked) >= new Date(d.source.lastModified)).toBe(true);
      });
    });
  }
});
