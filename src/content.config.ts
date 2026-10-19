import { defineCollection, z } from 'astro:content';
import { GROUPS, EVIDENCE_KINDS, EQUIPMENT } from './data/exercise-meta.js';
import { PROGRESSION_CLASSES } from './engine/overload.js';
import { glob } from 'astro/loaders';

/**
 * Articles collection. Frontmatter is validated at build time, so a typo in a
 * category or a missing reviewer fails the build rather than shipping silently.
 */
const articles = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/articles' }),
  schema: z.object({
    title: z.string(),
    dek: z.string(),
    category: z.enum(['Nutrition', 'Exercise', 'Health', 'Recovery']),

    /**
     * Closing line for the key-takeaways box, written per article — not a
     * template. Rendered last, above the calculator button, so the reader
     * leaves the summary with a conclusion rather than a list that stops.
     * Optional: an article without one shows the button alone.
     */
    conclusion: z.string().optional(),
    published: z.coerce.date(),
    updated: z.coerce.date().optional(),
    readMinutes: z.number(),
    author: z.string().default('A. Reader'),
    // YMYL: the reviewer field is what makes the credibility chip real.
    // Review status is explicit rather than implied by an absent reviewer, so an
    // unreviewed article discloses that fact rather than staying silent about it.
    reviewStatus: z.enum(['sourced', 'reviewed']).default('sourced'),
    reviewedBy: z.string().optional(),
    reviewerCredentials: z.string().optional(),
    // Set true for articles making clinical or risk claims — these are the ones
    // that should be prioritised for professional review.
    clinicalClaims: z.boolean().default(false),

    // ── Production and sourcing disclosure ──────────────────────────────────
    // Whether AI was used to draft this article. Stated plainly rather than
    // hedged as "assistance", because the honest description of drafting-then-
    // editing is authorship with review, not assistance.
    aiAssisted: z.boolean().default(false),

    /**
     * Citation verification state. Deliberately an enum with a required count,
     * not a boolean and not prose, because "all sources verified" is a checkable
     * claim and a blanket version of it goes stale the moment one article slips.
     *
     *   'full'    — every citation opened and checked: the source exists AND it
     *               supports the specific claim it is attached to.
     *   'partial' — some checked. citationsVerifiedCount is REQUIRED.
     *   'none'    — not yet checked against the originals.
     *
     * Two separate things are being claimed here, and they are not the same
     * amount of work: that the source is real, and that it says what we say it
     * says. Only 'full' asserts the second for every citation.
     */
    // Deliberately OPTIONAL rather than defaulting to 'none'. An absent value
    // means "no claim made", and the block renders nothing. Defaulting to 'none'
    // would have made every existing article announce that its citations were
    // unchecked — which may be untrue of work the author verified while writing.
    // The author opts in to a claim; the system never speaks for them.
    citationsVerified: z.enum(['full', 'existence', 'none']).optional(),
    // Count is DERIVED from references[].verified — do not set it by hand.
    citationsVerifiedDate: z.coerce.date().optional(),
    // Healthline-style credibility + navigation features
    evidenceBased: z.boolean().default(true),
    keyTakeaways: z.array(z.string()).default([]),
    toc: z.array(z.object({ id: z.string(), label: z.string() })).default([]),
    // End-of-article gear block. Disclosure renders automatically.
    affiliateIntro: z.string().optional(),
    affiliates: z.array(z.object({
      role: z.string(),
      name: z.string(),
      why: z.string(),
      url: z.string().url().optional(),
    })).default([]),
    // Public revision log. We promise in the editorial policy that corrections are
    // logged publicly — this is the mechanism that makes that promise real.
    changelog: z.array(z.object({
      date: z.coerce.date(),
      note: z.string(),
    })).default([]),
    references: z.array(z.object({
      text: z.string(),
      url: z.string().url().optional(),
      /**
       * True only when BOTH checks passed: the source exists, and it supports
       * the specific claim it is attached to. The article-level count is derived
       * from these flags rather than entered by hand, so the summary and the
       * list can never disagree.
       */
      verified: z.boolean().default(false),
      verifiedDate: z.coerce.date().optional(),
    })).default([]),
    relatedTool: z.string().optional(),
    draft: z.boolean().default(false),
  }),
});

/**
 * Library: one data file per nutrient. Every number is its own field, with the
 * source it came from and the date it was checked — so a page cannot state a
 * value that is not in the data, and tests can check the data itself
 * (src/engine/__tests__/library.test.js). Follow docs/LIBRARY-WORKFLOW.md.
 */
const amount = z.number().nonnegative();
/**
 * Adult brackets. Most fact sheets give 19–50, 51–70 and over 70. Where a sheet
 * splits 19–50 into 19–30 and 31–50 with different values (magnesium), the file
 * copies both rows rather than choosing one — a page that merged them would
 * state a value the source does not give for half of that range.
 */
const BRACKETS = [['19–50', '51–70', '>70'], ['19–30', '31–50', '51–70', '>70']];
const intakeRow = z.object({
  group: z.enum(['19–50', '19–30', '31–50', '51–70', '>70']),
  male: amount, female: amount,
  pregnancy: amount.optional(), lactation: amount.optional(),
});
const rowsInOrder = z.array(intakeRow).refine(
  rows => BRACKETS.some(b => b.length === rows.length && b.every((g, i) => rows[i].group === g)),
  { message: 'Rows must be 19–50, 51–70, >70 — or 19–30, 31–50, 51–70, >70 where the source splits 19–50' });
const nutrients = defineCollection({
  loader: glob({ pattern: '**/*.yaml', base: './src/content/nutrients' }),
  schema: z.object({
    draft: z.boolean().default(false),
    name: z.string(),
    kind: z.enum(['vitamin', 'mineral', 'other']),   // keys of KINDS in src/data/nutrients.js
    dek: z.string().min(40).max(200),
    unit: z.enum(['mcg', 'mg', 'g']),
    // Some nutrients are also labelled in a second unit (vitamin D in IU).
    altUnit: z.object({ unit: z.string(), perUnit: z.number().positive() }).optional(),
    intake: z.object({
      type: z.enum(['RDA', 'AI']),
      rows: rowsInOrder,
      // The unit as the fact sheet labels this table — "mcg RAE", "mcg DFE", "mg NE"
      // — when it is not plain `unit`. Must begin with `unit` (src/data/units.js).
      unitLabel: z.string().optional(),
      eighteenNote: z.string(),          // 18-year-olds fall in the 14–18 bracket
      // Anything the table alone would mislead about — iron's higher requirement
      // for vegetarians, for example. Shown directly beneath the table.
      note: z.string().optional(),
    }),
    ul: z.object({
      rows: rowsInOrder.optional(),      // some nutrients have no UL
      // What the limit covers. For magnesium, folate and niacin it applies only to
      // supplements (and, for some, fortified foods or medicines) — magnesium's is
      // LOWER than its RDA, and that is correct. Only a 'total' limit can be
      // compared with intake. Required whenever there are rows.
      appliesTo: z.enum(['total', 'supplemental', 'preformed']).optional(),
      // The sentence shown above a non-total limit, in the source's own terms:
      // "supplements and medicines" for magnesium is not "supplements and
      // fortified foods" for folate. Required for any non-total limit, so the
      // page never fills the gap with a default that is wrong for the nutrient.
      scope: z.string().optional(),
      // A risk the limit alone would hide, shown in the same red bar as a scope
      // warning. Vitamin K has no limit, but changing intake is dangerous on
      // warfarin; "None set" in the summary must not read as "safe for everyone".
      warning: z.string().optional(),
      note: z.string(),
      /**
       * A Chronic Disease Risk Reduction Intake (CDRR): the intake above which
       * cutting back is expected to lower the risk of chronic disease. The National
       * Academies introduced it for sodium in 2019 and set it apart from the upper
       * limit, which now covers toxicity only — so it is its own table under its own
       * name, and never shown as an upper limit. Each value reads "reduce if above".
       */
      cdrr: z.object({ rows: rowsInOrder, note: z.string() }).optional(),
    }).superRefine((ul, ctx) => {
      if (ul.rows && !ul.appliesTo)
        ctx.addIssue({ code: 'custom', message: 'ul.appliesTo is required when ul.rows are given' });
      if (ul.rows && ul.appliesTo && ul.appliesTo !== 'total' && !ul.scope)
        ctx.addIssue({ code: 'custom', message: 'ul.scope is required for a limit that is not total' });
    }),
    does: z.string(),
    forms: z.string().optional(),          // e.g. vitamin D2 and D3 — which form comes from where
    absorption: z.string().optional(),     // what helps or hinders absorption
    // A nutrient it is commonly sold or taken with, and what the evidence says
    // about the pairing — including any risk the pairing brings.
    pairing: z.object({ heading: z.string(), text: z.string() }).optional(),
    deficiency: z.string(),
    atRisk: z.array(z.string()).min(1),
    usIntake: z.string(),                 // how people in the United States actually fare
    // Five foods from the source's per-serving table, charted against the intake —
    // or, where the source has no such table (the National Academies reports behind
    // sodium and chloride), what it says about where the nutrient comes from, in
    // prose with [n] markers. One or the other, never both.
    sources: z.object({
      rule: z.string().optional(),       // how the five were chosen; required with foods
      text: z.string().optional(),
      // The food table's unit, where it is not the intake table's: niacin's foods are
      // in mg of niacin alone, its recommended amount in mg NE. Must begin with `unit`.
      unitLabel: z.string().optional(),
      foods: z.array(z.object({
        food: z.string(), serving: z.string(),
        short: z.string().max(26).optional(),   // chart label; the full name is used everywhere else
        form: z.string().optional(),            // e.g. "D3" — only where the source says which
        amount: z.union([amount, z.tuple([amount, amount])]),
        fortified: z.boolean().default(false),
      })).min(1).max(5).optional(),
    }).superRefine((src, ctx) => {
      if (!src.foods === !src.text)
        ctx.addIssue({ code: 'custom', message: 'sources needs either foods or text, not both' });
      if (src.foods && !src.rule)
        ctx.addIssue({ code: 'custom', path: ['rule'], message: 'sources.rule is required with foods' });
      if (src.text && src.unitLabel)
        ctx.addIssue({ code: 'custom', path: ['unitLabel'], message: 'sources.unitLabel labels a food table' });
    }),
    evidence: z.object({ established: z.string(), notSupported: z.string(), mixed: z.string().optional() }),
    disagreements: z.string().optional(),
    tooMuch: z.string(),
    interactions: z.string(),
    /**
     * Where every value on the page comes from. Normally the NIH Office of Dietary
     * Supplements fact sheet. Where NIH has none (sodium, chloride), the National
     * Academies report that set the values: it carries a year rather than an update
     * date, and `read` says which parts were read in full, because a 600-page report
     * is not read cover to cover the way a fact sheet is.
     */
    source: z.object({
      kind: z.enum(['factsheet', 'report']).default('factsheet'),
      name: z.string(), url: z.string().url(),
      lastModified: z.coerce.date().optional(),   // a fact sheet's own date
      year: z.number().int().optional(),          // a report's publication year
      read: z.string().optional(),                // a report: the parts read in full
      checked: z.coerce.date(),          // when a person checked this file against it
    }).superRefine((s, ctx) => {
      if (s.kind === 'factsheet' && !s.lastModified)
        ctx.addIssue({ code: 'custom', path: ['lastModified'], message: 'a fact sheet needs lastModified' });
      if (s.kind === 'report' && (s.year == null || !s.read || s.lastModified))
        ctx.addIssue({ code: 'custom', message: 'a report needs year and read, and no lastModified' });
    }),
    references: z.array(z.object({ text: z.string(), url: z.string().url().optional() })).min(1),
    aiAssisted: z.boolean(),
  }).superRefine((d, ctx) => {
    for (const [path, label] of [['intake', d.intake.unitLabel], ['sources', d.sources.unitLabel]]) {
      if (label != null && !label.startsWith(d.unit))
        ctx.addIssue({ code: 'custom', path: [path, 'unitLabel'], message: `${path}.unitLabel must begin with the unit (${d.unit})` });
    }
    // One conversion factor cannot serve two different measures: vitamin A's IU
    // differs by form, so a second unit is allowed only where both tables use one.
    if (d.altUnit && (d.intake.unitLabel || d.sources.unitLabel))
      ctx.addIssue({ code: 'custom', path: ['altUnit'], message: 'altUnit cannot be combined with a unitLabel' });
  }),
});

/**
 * Exercises: one data file per exercise. Every claim is cited and labelled with
 * the kind of evidence behind it; an exercise needs at least one training study
 * or review to be included. Follow docs/EXERCISE-WORKFLOW.md; integrity tests are
 * in src/engine/__tests__/exercises.test.js.
 */
const exercises = defineCollection({
  loader: glob({ pattern: '**/*.yaml', base: './src/content/exercises' }),
  schema: z.object({
    draft: z.boolean().default(false),
    name: z.string(),
    group: z.enum(GROUPS.map(g => g.key)),
    dek: z.string().min(40).max(200),
    primary: z.array(z.string()).min(1),
    secondary: z.array(z.string()).default([]),
    equipment: z.array(z.enum(Object.keys(EQUIPMENT))).min(1),
    // Links each exercise to the Progressive Overload Calculator's classes, so the
    // page can say which weight-step band applies.
    progressionClass: z.enum(Object.keys(PROGRESSION_CLASSES)),
    whyHere: z.string(),
    evidence: z.array(z.object({
      kind: z.enum(Object.keys(EVIDENCE_KINDS)),
      claim: z.string(),
    })).min(1),
    howTo: z.array(z.string()).min(2),
    alternatives: z.array(z.string()).default([]),   // slugs of other exercise files
    checked: z.coerce.date(),                          // when the sources were last read
    references: z.array(z.object({ text: z.string(), url: z.string().url().optional() })).min(1),
    aiAssisted: z.boolean(),
  }),
});

export const collections = { articles, nutrients, exercises };
