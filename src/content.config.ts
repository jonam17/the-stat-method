import { defineCollection, z } from 'astro:content';
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
const intakeRow = z.object({
  group: z.enum(['19–50', '51–70', '>70']),
  male: amount, female: amount,
  pregnancy: amount.optional(), lactation: amount.optional(),
});
const nutrients = defineCollection({
  loader: glob({ pattern: '**/*.yaml', base: './src/content/nutrients' }),
  schema: z.object({
    draft: z.boolean().default(false),
    name: z.string(),
    kind: z.enum(['vitamin', 'mineral']),
    dek: z.string().min(40).max(200),
    unit: z.enum(['mcg', 'mg', 'g']),
    // Some nutrients are also labelled in a second unit (vitamin D in IU).
    altUnit: z.object({ unit: z.string(), perUnit: z.number().positive() }).optional(),
    intake: z.object({
      type: z.enum(['RDA', 'AI']),
      rows: z.array(intakeRow).length(3),
      eighteenNote: z.string(),          // 18-year-olds fall in the 14–18 bracket
    }),
    ul: z.object({
      rows: z.array(intakeRow).length(3).optional(),   // some nutrients have no UL
      // What the limit covers. For magnesium, folate and niacin it applies only to
      // supplements and fortified foods — magnesium's is LOWER than its RDA, and
      // that is correct. Only a 'total' limit can be compared with intake.
      appliesTo: z.enum(['total', 'supplemental', 'preformed']),
      note: z.string(),
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
    sources: z.object({
      rule: z.string(),
      foods: z.array(z.object({
        food: z.string(), serving: z.string(),
        short: z.string().max(26).optional(),   // chart label; the full name is used everywhere else
        form: z.string().optional(),            // e.g. "D3" — only where the source says which
        amount: z.union([amount, z.tuple([amount, amount])]),
        fortified: z.boolean().default(false),
      })).min(1).max(5),
    }),
    evidence: z.object({ established: z.string(), notSupported: z.string(), mixed: z.string().optional() }),
    disagreements: z.string().optional(),
    tooMuch: z.string(),
    interactions: z.string(),
    source: z.object({
      name: z.string(), url: z.string().url(),
      lastModified: z.coerce.date(),     // the fact sheet's own date
      checked: z.coerce.date(),          // when a person checked this file against it
    }),
    references: z.array(z.object({ text: z.string(), url: z.string().url().optional() })).min(1),
    aiAssisted: z.boolean(),
  }),
});

export const collections = { articles, nutrients };
