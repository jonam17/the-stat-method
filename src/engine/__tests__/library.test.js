/**
 * Library data integrity. Every nutrient file is checked as data, not prose:
 * the numbers must be internally consistent and every claim traceable.
 * These run on drafts too — a draft that fails here could never be published.
 */
import { describe, it, expect } from 'vitest';
import { readdirSync, readFileSync } from 'node:fs';
import yaml from 'js-yaml';
import { BRACKETS, YOUNG, matchingRow } from '../../data/brackets.js';

const DIR = 'src/content/nutrients';
const files = readdirSync(DIR).filter(f => f.endsWith('.yaml'));
const load = f => yaml.load(readFileSync(`${DIR}/${f}`, 'utf8'));
const prose = d => [d.does, d.forms ?? '', d.absorption ?? '', d.pairing?.text ?? '', d.deficiency, d.usIntake, ...d.atRisk, d.evidence.established,
  d.evidence.notSupported, d.evidence.mixed ?? '', d.disagreements ?? '', d.tooMuch, d.interactions].join(' ');
const hi = a => (Array.isArray(a) ? a[1] : a);

describe('library files', () => {
  it('at least one nutrient exists', () => expect(files.length).toBeGreaterThan(0));

  for (const f of files) {
    const d = load(f);
    describe(d.name, () => {
      it('has the adult brackets in order, with pregnancy and breastfeeding on every bracket up to 50', () => {
        const groups = d.intake.rows.map(r => r.group);
        // 19–50 as one row — or split into 19–30 and 31–50 where the source splits it.
        expect(BRACKETS.some(b => JSON.stringify(b) === JSON.stringify(groups)), groups.join(', ')).toBe(true);
        for (const r of d.intake.rows.filter(r => YOUNG.includes(r.group))) {
          expect(r.pregnancy, `${r.group} pregnancy`).toBeGreaterThan(0);
          expect(r.lactation, `${r.group} lactation`).toBeGreaterThan(0);
        }
      });

      it('upper-limit rows, if any, use the same brackets', () => {
        if (!d.ul.rows) return;
        const groups = d.ul.rows.map(r => r.group);
        expect(BRACKETS.some(b => JSON.stringify(b) === JSON.stringify(groups)), groups.join(', ')).toBe(true);
      });

      it('says what an upper limit covers, in words, whenever it is not total', () => {
        // A default here would put "supplements and fortified foods" on a page
        // whose source says "supplements and medicines" — so the file must say it.
        if (!d.ul.rows) { expect(d.ul.note, 'no limit: the note must say so').toMatch(/no upper limit|not (been )?set|did not set/i); return; }
        expect(['total', 'supplemental', 'preformed']).toContain(d.ul.appliesTo);
        if (d.ul.appliesTo !== 'total') expect(d.ul.scope?.length, 'ul.scope').toBeGreaterThan(20);
      });

      it('a total-intake upper limit is never below the recommended amount', () => {
        // Supplement-only limits (magnesium, folate, niacin) can legitimately be
        // lower than total recommended intake, so they are not compared.
        if (!d.ul.rows || d.ul.appliesTo !== 'total') return;
        for (const i of d.intake.rows) {
          const u = matchingRow(d.ul.rows, i.group);
          expect(u, `upper-limit row for ${i.group}`).toBeDefined();
          for (const k of ['male', 'female', 'pregnancy', 'lactation'])
            if (i[k] != null && u[k] != null) expect(u[k], `${i.group} ${k}`).toBeGreaterThanOrEqual(i[k]);
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

      it('food form tags are short labels, not prose', () => {
        for (const f of d.sources.foods) if (f.form) expect(f.form.length, f.food).toBeLessThanOrEqual(20);
      });

      it('reference 1 is the fact sheet itself', () => {
        expect(d.references[0].url).toBe(d.source.url);
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
