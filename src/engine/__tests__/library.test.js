/**
 * Library data integrity. Every nutrient file is checked as data, not prose:
 * the numbers must be internally consistent and every claim traceable.
 * These run on drafts too — a draft that fails here could never be published.
 */
import { describe, it, expect } from 'vitest';
import { readdirSync, readFileSync } from 'node:fs';
import yaml from 'js-yaml';
import { BRACKETS, YOUNG, matchingRow } from '../../data/brackets.js';
import { intakeUnit, sourcesUnit } from '../../data/units.js';
import { sourcesChart } from '../../charts/library.js';

const DIR = 'src/content/nutrients';
const files = readdirSync(DIR).filter(f => f.endsWith('.yaml'));
const load = f => yaml.load(readFileSync(`${DIR}/${f}`, 'utf8'));
const prose = d => [d.does, d.forms ?? '', d.absorption ?? '', d.pairing?.text ?? '', d.sources.text ?? '', d.deficiency, d.usIntake, ...d.atRisk, d.evidence.established,
  d.evidence.notSupported, d.evidence.mixed ?? '', d.disagreements ?? '', d.tooMuch, d.interactions].join(' ');
const hi = a => (Array.isArray(a) ? a[1] : a);
// Nutrients with no NIH Office of Dietary Supplements fact sheet, confirmed by the
// maintainer on 2026-10-18. Only these may take their values from a report.
const REPORT_ONLY = ['Sodium', 'Chloride'];

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

      it('a limit warning, if any, is a sentence, not a stub', () => {
        if (d.ul.warning != null) expect(d.ul.warning.length, 'ul.warning').toBeGreaterThan(40);
      });

      it('a chronic-disease risk-reduction intake, if any, is never below the recommended amount', () => {
        // Sodium's CDRR: "reduce if above". Setting it below the intake would tell
        // readers to cut back to less than they need. The report itself says the
        // adequacy values sit at or below it.
        if (!d.ul.cdrr) return;
        const groups = d.ul.cdrr.rows.map(r => r.group);
        expect(BRACKETS.some(b => JSON.stringify(b) === JSON.stringify(groups)), groups.join(', ')).toBe(true);
        expect(d.ul.cdrr.note.length, 'ul.cdrr.note').toBeGreaterThan(40);
        for (const i of d.intake.rows) {
          const c = matchingRow(d.ul.cdrr.rows, i.group);
          expect(c, `CDRR row for ${i.group}`).toBeDefined();
          for (const k of ['male', 'female', 'pregnancy', 'lactation'])
            if (i[k] != null && c[k] != null) expect(c[k], `${i.group} ${k}`).toBeGreaterThanOrEqual(i[k]);
        }
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

      it('labels each table with a unit that begins with the file\'s unit', () => {
        // "mcg RAE" and "mcg" are both micrograms; "mg NE" on an mcg file would be a typo
        // the arithmetic could not survive.
        expect(intakeUnit(d).startsWith(d.unit), intakeUnit(d)).toBe(true);
        expect(sourcesUnit(d).startsWith(d.unit), sourcesUnit(d)).toBe(true);
        // One IU factor cannot convert two different measures.
        if (d.altUnit) expect(d.intake.unitLabel ?? d.sources.unitLabel, 'altUnit with a unitLabel').toBeUndefined();
      });

      it('gives food sources as a table or as cited prose, never both', () => {
        expect(!d.sources.foods !== !d.sources.text, 'foods xor text').toBe(true);
        if (d.sources.text) expect(d.sources.text, 'sources.text cites its source').toMatch(/\[\d+\]/);
      });

      it('the chart is measured in the same unit as the intake table', () => {
        if (!d.sources.foods) return;
        const c = sourcesChart({ id: f, data: d });
        expect(c.x.label).toContain(`${intakeUnit(d)})`);
        expect(c.caption).toContain(` ${intakeUnit(d)}`);
      });

      it('lists at most five food sources, highest first', () => {
        const amounts = (d.sources.foods ?? []).map(x => hi(x.amount));
        expect(amounts.length).toBeLessThanOrEqual(5);
        expect(amounts).toEqual([...amounts].sort((a, b) => b - a));
      });

      it('every numbered marker points at a reference, and every reference is cited', () => {
        const cited = new Set([...prose(d).matchAll(/\[(\d+)\]/g)].map(m => +m[1]));
        for (const n of cited) expect(n, `marker [${n}]`).toBeLessThanOrEqual(d.references.length);
        d.references.forEach((_, i) => expect(cited.has(i + 1), `reference ${i + 1} is never cited`).toBe(true));
      });

      it('food form tags are short labels, not prose', () => {
        for (const f of d.sources.foods ?? []) if (f.form) expect(f.form.length, f.food).toBeLessThanOrEqual(20);
      });

      it('reference 1 is the source itself', () => {
        expect(d.references[0].url).toBe(d.source.url);
      });

      it('takes its values from the NIH Office of Dietary Supplements — or, where NIH has no fact sheet, from the National Academies report', () => {
        // A report is the exception, and only for a nutrient NIH has no sheet on:
        // REPORT_ONLY must be edited by hand, so the exception cannot spread quietly.
        if ((d.source.kind ?? 'factsheet') === 'factsheet') {
          expect(new URL(d.source.url).hostname).toBe('ods.od.nih.gov');
          return;
        }
        expect(REPORT_ONLY, `${d.name} has no NIH fact sheet`).toContain(d.name);
        expect(d.source.url).toMatch(/^https:\/\/doi\.org\/10\.17226\//);   // National Academies Press DOI
        expect(d.source.read.length, 'source.read says which parts were read').toBeGreaterThan(40);
      });

      it('was checked on or after the source was last updated', () => {
        // If the fact sheet changes after this file was checked, the file is stale.
        const since = d.source.lastModified ? new Date(d.source.lastModified) : new Date(Date.UTC(d.source.year, 0, 1));
        expect(new Date(d.source.checked) >= since).toBe(true);
      });
    });
  }
});
