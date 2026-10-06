/**
 * Exercise library integrity. Every exercise file is checked as data: the evidence
 * rule, the citations, the links to other files and to the calculator. These run on
 * drafts too — a draft that fails here could never be published.
 */
import { describe, it, expect } from 'vitest';
import { readdirSync, readFileSync } from 'node:fs';
import yaml from 'js-yaml';
import { GROUPS, EVIDENCE_KINDS, QUALIFYING_KINDS, EQUIPMENT, MAX_PER_GROUP } from '../../data/exercise-meta.js';
import { PROGRESSION_CLASSES } from '../overload.js';

const DIR = 'src/content/exercises';
const files = readdirSync(DIR).filter(f => f.endsWith('.yaml'));
const load = f => yaml.load(readFileSync(`${DIR}/${f}`, 'utf8'));
const slugs = new Set(files.map(f => f.replace(/\.yaml$/, '')));
const all = files.map(f => ({ slug: f.replace(/\.yaml$/, ''), d: load(f) }));
const prose = d => [d.whyHere, ...d.evidence.map(e => e.claim), ...d.howTo].join(' ');

describe('exercise library', () => {
  it('at least one exercise exists', () => expect(files.length).toBeGreaterThan(0));
  it(`no muscle group has more than ${MAX_PER_GROUP} exercises`, () => {
    for (const g of GROUPS) expect(all.filter(x => x.d.group === g.key).length, g.key).toBeLessThanOrEqual(MAX_PER_GROUP);
  });
  it('names are unique', () => expect(new Set(all.map(x => x.d.name)).size).toBe(all.length));

  for (const { slug, d } of all) {
    describe(d.name, () => {
      it('is included on a training study or a review — never on EMG alone', () => {
        expect(d.evidence.some(e => QUALIFYING_KINDS.includes(e.kind))).toBe(true);
      });
      it('labels every evidence item with a known kind, and cites each one', () => {
        for (const e of d.evidence) {
          expect(Object.keys(EVIDENCE_KINDS)).toContain(e.kind);
          expect(e.claim, e.claim.slice(0, 40)).toMatch(/\[\d+\]/);
        }
      });
      it('every numbered marker points at a reference, and every reference is cited', () => {
        const text = prose(d);
        expect(text).not.toMatch(/\[\d+\s*,/);                 // [1, 2] can't be checked — write [1] [2]
        const cited = new Set([...text.matchAll(/\[(\d+)\]/g)].map(m => +m[1]));
        for (const n of cited) expect(n, `marker [${n}]`).toBeLessThanOrEqual(d.references.length);
        d.references.forEach((_, i) => expect(cited.has(i + 1), `reference ${i + 1} never cited`).toBe(true));
      });
      it('uses a group, equipment and progression class the site knows', () => {
        expect(GROUPS.map(g => g.key)).toContain(d.group);
        for (const k of d.equipment) expect(Object.keys(EQUIPMENT)).toContain(k);
        expect(Object.keys(PROGRESSION_CLASSES)).toContain(d.progressionClass);
      });
      it('alternatives are other exercise files, not itself', () => {
        for (const a of d.alternatives ?? []) {
          expect(slugs.has(a), `alternative "${a}"`).toBe(true);
          expect(a).not.toBe(slug);
        }
      });
      it('has a dek of usable length and at least two how-to steps', () => {
        expect(d.dek.length).toBeGreaterThanOrEqual(40);
        expect(d.dek.length).toBeLessThanOrEqual(200);
        expect(d.howTo.length).toBeGreaterThanOrEqual(2);
      });
      it('records when its sources were checked', () => {
        expect(new Date(d.checked).getTime()).not.toBeNaN();
      });
    });
  }
});
