# Article workflow

How an article goes from idea to published. Written to be followed cold — by the maintainer, or
by an AI drafting session with no memory of how this site was built. **If you are drafting an
article, read all of this first.** It is short on purpose.

---

## The standard

Every article on this site claims, on the page, that its citations were opened and checked.
That claim is the reason the site exists. Everything below protects it.

- **No claim from memory.** Every factual claim has a citation, and every citation is opened and
  read before the article publishes. A model's recall is not a source, and neither is a summary
  of a paper — only the paper.
- **Length follows substance.** The floor is about a 7-minute read (roughly 1,600 words), the
  ceiling 15–20 minutes. Never pad to reach the floor; if a topic genuinely needs less, it is the
  wrong topic for a standalone article or should be combined with another.
- **State uncertainty as uncertainty.** "The evidence is mixed" and "the meta-analyses disagree"
  are complete answers. Never round a weak finding into a confident one.

---

## 1. Before drafting

1. **Check what exists.** Run `npm run topics`. It lists every article, live, scheduled or draft,
   straight from the files. Do not write a second article on a covered subject — extend the
   existing one instead.
2. **Pick from the backlog.** The maintainer keeps a private topic backlog in the approved order.
   Ask for it. Do not choose topics outside it without asking.
3. **Check the order rules** (below). Some topics are blocked until clinical review.

## 2. Create the file

```bash
npm run new:article -- "Title of the article" Exercise
```

Categories: `Nutrition`, `Exercise`, `Health`, `Recovery`. The script warns about overlapping
titles, dates the article for the next free Sunday, and creates it **as a draft** with the full
template in place. It will not publish until `draft: true` is removed.

## 3. Draft

Fill every `TODO`. The template, which `npm run qa:articles` enforces:

| Element | Rule |
|---|---|
| **Sections** | Five, each `<h2 id="...">` — never Markdown `##`, which breaks the contents list |
| **Summaries** | One closing each of the first four sections. The last section, the bottom line, is itself a summary |
| **Key takeaways** | Four or five, in frontmatter. Each a complete claim, not a teaser |
| **Conclusion** | One line **written for this article** — a decision, a caution, or a reframing. Never a template |
| **Contents list** | Every `h2` id must appear in `toc` |
| **References** | Numbered markers in the text match their position in the list. Quote any reference containing a colon |
| **`aiAssisted`** | `true` if AI drafted any of it. It renders a disclosure on the page — see step 5 |

**Voice.** Plain and specific. Read two existing articles before writing, and match them. Prefer
a concrete number with its source over an adjective. Say what a study's population was when it
matters — who was studied is the most common reason a finding does not apply.

**Charts.** Add one where it draws the article's central argument. Define it in
`src/charts/definitions.js`, then place `<figure data-chart="your-id"></figure>` on its own line
where it belongs. Two kinds only:

- **Engine** — computed from the calculator's own functions, so it cannot contradict the tool.
  Compute every number the caption states; never type one in.
- **Paper** — figures a study reports, cited as a reference. Recreate from the numbers; never copy
  a published figure, which belongs to its publisher.

Two shapes: a **line** chart for how something changes across a range, and an **interval** chart
(`type: 'interval'`) for a range itself — a confidence interval, or an estimate with its error. In
MDX articles use `<Chart id="..." />` instead of the placeholder. Read `CONVENTIONS.md` §20 before
defining one, and look at the rendered chart before publishing it.

## 4. Verify citations — done by the drafting session

The session that drafted the article verifies it, **in the same conversation, before handing it
over**. A draft delivered without this step is not finished. The maintainer's job is to review the
verification (step 5), not to do it from scratch.

**Never write an identifier from memory** — no PMID, DOI, volume or page unless it was on screen
from the source. If one cannot be confirmed, cite without it and say so.

1. **Read each paper itself.** Apply the six checks in
   [`citation-checklist.md`](citation-checklist.md) to every reference: exists · supports the
   specific claim · population fit · provenance of any number · funding and competing interests ·
   superseded since. Population fit catches the most.
2. **Close the gaps rather than marking over them.** If the full text was read from a third-party
   copy, confirm it against the publisher's page. If a paper is paywalled, look for the accepted
   manuscript in a university repository or the preprint. If a declaration is missing, record that
   it is missing — absence is a finding, not a pass.
3. **Check every cited sentence against a passage.** `npm run citations -- markers <file>` shows
   which reference each marker points at. Check the uncited sentences around each marker too —
   they usually carry the details. Fix the article wherever it says more than the paper does.
4. **A claim may only rest on what was read.** If only the abstract could be read, the claim must be
   fully supported by the published abstract, or rewritten until it is. If a claim cannot be
   supported from what was read, do not mark that reference — `complete` will then refuse, and the
   article shows no green badges, which is the honest outcome.
5. **Mark each reference once it passes, then publish the claim:**
   ```bash
   npm run citations -- list <file>       # numbered references, ✓ for checked
   npm run citations -- mark <file> <n>   # adds verified: true to reference n
   npm run citations -- complete <file>   # sets citationsVerified: full and today's date
   ```
   `<file>` is the file name only, e.g. `training-volume-how-many-sets-do-you-actually-need.md`.
   `complete` refuses until every reference is marked — the page claims all or nothing. On the site,
   each reference then shows a green "Checked against the original"; that badge appears only when
   the article is `full` **and** the reference is marked.
6. **Write the review record** at `docs/citation-reviews/<slug>.md`, following the existing ones:
   for each reference, what was read and where, the six checks, a table of every article claim
   with the passage that supports it, the most important claims marked ★ for spot-checking, and
   any corrections made or doubts left. It is public, like the rest of the repository; keep it to
   sources and findings.
7. **Leave `draft: true` in place.** Verification never un-drafts an article.

## 5. Publish — the human review gate

`aiAssisted: true` tells readers the article was **"edited and fact-checked by a human."** That
sentence is a promise the maintainer keeps, and this step is where it is kept. Only a person
removes `draft: true`, and only after reviewing the verification.

1. **Read the article**, then the review record in `docs/citation-reviews/`.
2. **Spot-check the ★ claims** against their sources, using the passages the record names, and
   read any notes or doubts it raises. If anything doesn't match, send it back to a drafting session
   with the record — don't fix the flags by hand, and don't un-draft.
3. Confirm `aiAssisted` is correct.
4. Check the date is the intended Sunday — a date already past publishes on the next build.
5. Add your review to the record's header (`Human review: <name>, <date>`).
6. **Delete the `draft: true` line** (the live articles have no `draft:` line; `false` also works).
7. Run the checks:

```bash
npm run qa:articles && npm run citations -- lint && npm test && npm run build
```

`qa:articles` refuses to pass a non-draft article that still contains a `TODO` or has
`citationsVerified: none`. That is deliberate. Do not work around it.

## 6. Schedule

Commit and push. The article appears on its date at **10:00 UTC** — 3:00 AM Pacific in summer,
2:00 AM in winter — when the daily rebuild runs.

- **It is readable on GitHub as soon as you push**, because the repository is public. Only the
  website waits. Keep an article in the private folder until its week if that matters.
- **Several at once is fine.** Write four, date them for consecutive Sundays, commit together.
- **GitHub pauses the schedule after 60 days with no commits**, and emails the owner. Any commit
  restarts it.

---

## Order of topics

Approved order. Earlier groups first; do not skip ahead.

| Order | Topics | Notes |
|---|---|---|
| 1 | Strength training · cardio · recovery | Closest to the existing tools |
| 2 | *Vitamin, mineral and food libraries* | **A separate phase, not articles** — structured reference pages |
| 3 | Supplements · supplement brand reviews | Commercial. State funding and conflicts on every source; brand reviews need one published method applied identically to every brand |
| 4 | Health conditions · peptides | **Blocked until clinical review.** Do not draft |

### Peptides, when they are unblocked

Mechanisms, evidence, effects and cautions — never endorsement. Report a dose **only as a study
parameter** ("participants received 2 mg daily for 12 weeks"), never as guidance ("a typical dose
is 2 mg"). Never describe cycling protocols or sourcing. Many peptides are unapproved research
chemicals, and that fact belongs in the article.

---

## Commands

| Command | What it does |
|---|---|
| `npm run topics` | Every article by category, with status and the publishing queue |
| `npm run new:article -- "Title" Category` | New draft, fully templated, next free Sunday |
| `npm run qa:articles` | Template conformance, and the publish guards |
| `npm run citations -- lint` | Reference formatting and marker numbering |
| `npm run citations -- list <file>` / `mark <file> <n>` / `complete <file>` | Per-reference verification, then the article-level claim (step 4) |
| `npm run citations -- markers <file>` | Which reference each inline marker points at |
