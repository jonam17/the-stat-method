# The Stat Method

**Free, open-source fitness calculators that show their methodology**, paired with health
and training writing that cites its sources.

> **The operating principle: the math is free forever.**
> Calculations run entirely in your browser and cost nothing per user, so they will never
> be paywalled, gated behind a signup, or used as a lead magnet for coaching.

**19 calculators · 19 sourced articles · 301 unit tests · zero JavaScript on content pages**

[Tools](#the-tools) · [Methodology](#methodology) · [Architecture](#architecture-one-engine-many-uis) · [Contributing](#contributing)

---

## Why this exists

Most macro calculators hand you three numbers and no reasoning. Ask where the protein
figure came from and you get a shrug, or a checkout page.

The Stat Method is the opposite trade: every tool names its equations, every article cites
its sources, and the math is open source with unit tests. You can read exactly what a
calculator does before deciding whether to trust what it says.

Every calculator ships with a cornerstone article explaining the topic in depth, and every
article cites primary sources. Every tool page carries a plain-language glossary of its jargon, brief usage steps above
the calculator, and a "reading your results" section below it explaining what the numbers
mean and what to do next.

Where the evidence is uncertain, the tools say so. Several of them display error bars,
formula disagreement, and caveats that actively reduce confidence in their own output —
the body-fat tool shows three methods disagreeing by seven points, and the calories-burned
tool tells you its own figures are inflated by resting expenditure. That is the point.

---

## The tools

### The Stat Method Baseline — the flagship

One short form — sex, age, weight, height and activity — and every result those inputs can
produce: energy needs, body composition, daily calorie and protein targets, and a timeline to a
target weight. Body fat, a waist measurement, a goal and a target weight each unlock more.

**One calculation engine, many interfaces.** The Baseline does no arithmetic of its own. Each
section calls the same engine function its standalone calculator uses, and a test asserts —
across hundreds of combinations of inputs — that every section equals its standalone result.
It cannot disagree with the individual calculators, because it *is* them.

**Strict refusal.** If any calculator the Baseline draws on would decline someone's situation,
the whole Baseline declines, with the same wording. A person refused a weight-loss plan cannot
read a weight-loss calorie target in a neighbouring section. The individual calculators remain
for narrower questions.

### Energy & body composition

#### Deficit & goal-date planner

Most calculators use the static "3,500 kcal = 1 lb" rule, which assumes
expenditure never changes and therefore predicts indefinite linear weight loss. Real
weight loss **flattens**, because a lighter body costs less to run and adaptive
thermogenesis lowers expenditure further.

This tool models that: expenditure is recomputed daily against current bodyweight, weight
change is partitioned between fat and lean tissue via the Forbes relationship, and the
projection is drawn against the static rule so the error is visible.

![Deficit and goal-date planner](docs/previews/05-deficit-planner.webp)

*Solving "90 kg → 80 kg in 24 weeks" returns 2,092 kcal/day and lands on 80.00 kg. The
static rule predicts 73.86 kg over the same period — an overestimate of 6.1 kg.*

It also reports **maintenance calories at goal weight**, the number that determines whether
the weight stays off, and which almost no free tool surfaces.

#### TDEE & BMR calculator

Five published BMR equations run simultaneously so the disagreement between them is visible
rather than hidden behind a single confident number.

![TDEE and BMR calculator](docs/previews/02-tdee-calculator.webp)

#### Body fat estimator

Three methods side by side, each with its **published error range**.

![Body fat estimator](docs/previews/03-body-fat.webp)

#### Macro calculator

Protein scaled off lean mass when body fat is known, fat floored for hormonal health, and a
split editor accepting percentages *or* grams with live over-budget warnings.

![Macro calculator](docs/previews/01-macro-calculator.webp)

#### Lean mass & FFMI · Healthy weight range

FFMI is BMI with the fat removed. The healthy-weight tool runs four classical formulas
alongside waist-to-height ratio, which predicts cardiometabolic risk better than BMI.

<img src="docs/previews/04-ffmi.webp" width="49%"> <img src="docs/previews/15-healthy-weight.webp" width="49%">

---

### Strength

#### DOTS, IPF GL & Wilks score

Modern powerlifting scoring. **DOTS is the default and Wilks is tagged as legacy** — the
inverse of most incumbent calculators, which still present Wilks as the standard.

![Powerlifting score](docs/previews/09-powerlifting-score.webp)

Coefficients are taken from the official IPF 2020 publication and the DOTS specification,
not from memory. DOTS and Wilks agree within ~3 points at 82.5 kg and diverge at extreme
bodyweights, which is the documented behaviour.

#### One-rep max estimator · RPE, RIR & %1RM converter

Five formulas with a full percentage table, plus an RPE converter for prescribing working
loads by reps in reserve — genuinely underserved by free tools.

<img src="docs/previews/06-one-rep-max.webp" width="49%"> <img src="docs/previews/11-rpe-converter.webp" width="49%">

#### Strength standards · Plate loader

Bodyweight-relative levels scaled for age and sex, and a visual plate loader that reports
the closest achievable load when a target cannot be made exactly.

<img src="docs/previews/10-strength-standards.webp" width="49%"> <img src="docs/previews/12-plate-loader.webp" width="49%">

---

### Nutrition in practice

#### Hand-portion translator

Converts gram targets into palms, cupped hands and thumbs, so tracking works without a
scale. Includes a meal splitter with optional peri-workout weighting.

![Hand portion translator](docs/previews/13-hand-portions.webp)

#### Protein target

A daily range from lean body mass, adjusted for deficit depth, training age and older
adults — and it tells you plainly that the "30 g per meal" absorption limit is a myth.

![Protein target](docs/previews/14-protein-target.webp)

---

### Cardio & recovery

#### Heart rate zones · Calories burned

Karvonen reserve zones built on **Tanaka** rather than "220 − age", and METs-based energy
estimates from the Compendium of Physical Activities.

<img src="docs/previews/07-heart-rate-zones.webp" width="49%"> <img src="docs/previews/08-calories-burned.webp" width="49%">

#### Running pace · Sleep cycles

Splits and Riegel race predictions flagged by how far the extrapolation stretches, plus
cycle-aligned bedtimes with an honest note on what cycle timing can and cannot do.

<img src="docs/previews/17-running-pace.webp" width="49%"> <img src="docs/previews/16-sleep-calculator.webp" width="49%">

---

## Architecture: one engine, many UIs

```
src/
├── engine/                    ← all math. No React, no DOM. Import from anywhere.
│   ├── energy.js              BMR (5 equations), TDEE, calorie targets
│   ├── body.js                lean mass, BMI, FFMI, waist:height, 3 body-fat methods,
│   │                          ideal-weight formulas
│   ├── macros.js              default split, % ↔ g resolution, budget detection
│   ├── strength.js            1RM (5 formulas), RPE/RIR chart, plate loading
│   ├── scoring.js             DOTS, IPF GL Points, Wilks
│   ├── standards.js           bodyweight-relative strength levels
│   ├── cardio.js              max HR, Karvonen zones, METs, VO₂ max
│   ├── planner.js             dynamic weight-change simulation
│   ├── portions.js            hand portions, meal splitting, protein targets
│   ├── pace.js                running pace, splits, Riegel prediction
│   ├── sleep.js               sleep cycle timing
│   ├── units.js               imperial ↔ metric
│   └── __tests__/             301 unit tests
├── components/                React islands — state and markup only, zero math
├── content/articles/          Markdown/MDX, schema-validated at build time
├── data/tools.js              tool registry (drives index, homepage, cross-links, previews)
├── data/tool-guides.js        per-tool glossary, usage steps and results interpretation
├── layouts/
├── pages/
├── styles/global.css
└── scripts/capture-previews.mjs   regenerates docs/previews from the registry
```

**Rule: no calculation logic in components.** If you are writing arithmetic in a `.jsx`
file, it belongs in `src/engine/` with a test. This keeps the UI layer disposable — swap
the framework and the engine ports unchanged.

| Layer | Choice | Why |
|---|---|---|
| Framework | **Astro 7** | Zero JS by default; static HTML for articles, hydrates only calculators |
| Interactivity | **React 19 islands** | Mounted with `client:load` / `client:visible` |
| Content | **Content collections + MDX** | Build-time schema validation; calculators embeddable mid-article |
| Math | **`src/engine/`** | Framework-agnostic, unit-tested |
| Tests | **Vitest** | 301 tests |
| Hosting | **Cloudflare Workers** | Static assets, custom domain |

Requires **Node 22+** (Astro 7 dropped 18.x and 20.x).

Content pages ship with **no JavaScript at all** — only pages containing a calculator load
the React bundle.

---

## Getting started

```bash
npm install
npm run dev          # http://localhost:4321
npm test             # 301 tests
npm run build        # static output to ./dist
```

### Regenerating the previews in this README

The screenshots above are generated from the tool registry, so adding a tool with
`live: true` in `src/data/tools.js` picks it up automatically:

```bash
npm install                       # once — pulls in playwright
npx playwright install chromium   # once — downloads the browser (~120 MB)
npm run docs                      # build + capture every tool preview
```

The browser is only needed for screenshots; `npm run build` and `npm test` do not require
it. Previews are written as WebP via `sharp` (bundled with Astro), and the output directory
is cleared each run so stale images cannot accumulate.

Each capture is verified to produce a real result and to throw no console errors, so a
broken tool fails the run rather than silently shipping a blank screenshot.

---

## Methodology

Every formula names its source in a docstring. A condensed list:

**Basal metabolic rate** — Mifflin-St Jeor (1990, default), revised Harris-Benedict
(Roza & Shizgal 1984), Katch-McArdle (lean-mass based, default when body fat is supplied),
Cunningham (1980), Owen (1986–87).

**Body composition** — U.S. Navy circumference (Hodgdon & Beckett 1984, ±3.5%),
Deurenberg (1991, SEE 4.1%), Jackson-Pollock 3-site skinfold (1978) with Siri conversion
(±3.5%), FFMI normalised (Kouri et al. 1995, using the paper's 6.3 coefficient), waist-to-height (Ashwell & Gibson 2016).

**Ideal weight** — Devine (1974), Robinson (1983), Miller (1983), Hamwi (1964). All were
derived in clinical practice rather than for aesthetics — Devine for drug dosing, Hamwi for
dietary planning in diabetes — and none accounts for muscularity.

**Strength** — Epley, Brzycki, Lombardi, Wathan, O'Conner; RPE/RIR chart after Helms et al.
and Zourdos et al. (2016).

**Powerlifting scoring** — DOTS (Konertz 2019), IPF GL Points (IPF official coefficients,
effective 1 May 2020), Wilks (1994, legacy).

**Cardio** — max HR via Tanaka (2001, preferred), Fox and Gulati for comparison; Karvonen
heart-rate reserve (1957); METs from Ainsworth et al. (2011); Riegel (1981) race prediction.

**Weight change** — simplified dynamic model after Hall KD et al. (*Lancet* 2011), Forbes
(1987) partitioning, adaptive thermogenesis after Trexler et al. (2014). Note the 15% cap is a conservative
modelling choice, not a figure taken from that paper — see `docs/citation-verification-log.md`.

### What these numbers are not

Every equation here was fitted to a population, not to an individual. Two people matching
on age, sex, height and weight can differ by several hundred calories a day in real
expenditure, largely through unconscious activity.

Treat any output as a starting estimate, run it for two to three weeks, track a weekly
average bodyweight, and adjust from what actually happened. That feedback loop beats any
formula.

**These tools do not diagnose, treat, or replace clinical advice.**

---

## Testing

```bash
npm test
```

301 tests cover every formula, the publishing rule, and the placement of the save-results buttons. Several assert the *honesty properties* of the models rather
than just their arithmetic:

- the dynamic planner predicts **less** weight loss than the static 3,500-kcal rule
- its projection **decelerates** — the final four weeks lose less than the first four
- Forbes partitioning removes proportionally more lean mass from leaner people
- DOTS and Wilks **diverge more at extreme bodyweights** than at mid bodyweights
- unit toggles round-trip without drift

A test caught a real calibration error during development: the Riegel confidence threshold
was flagging a 10K → half-marathon prediction as unreliable when it is a standard,
trustworthy extrapolation. The engine was fixed rather than the test.

---

## Writing articles

See [`docs/ARTICLE-WORKFLOW.md`](docs/ARTICLE-WORKFLOW.md) before drafting or editing an article.

## Changelog

Every release is tagged. Newest first.

### v2.10.2 — Recorded: an npm audit warning that does not apply

- `npm audit` reports a high-severity flaw in http-cache-semantics, a dependency of astro
  (GHSA-ch52-4w7c-c8xp). No fixed version exists, and the suggested fix would downgrade astro to 2.10.9.
  The flaw needs a shared server-side cache; this site is fully prerendered and has none. The decision
  and when to revisit it are recorded in `docs/CONVENTIONS.md` §9.

### v2.10.1 — Review dates on the new Library pages

- Calcium, magnesium, iron and vitamin B12 now show the date they were reviewed against their fact
  sheets. v2.10.0 published them still showing the date the drafts were prepared.
- v2.10.0 shipped without a changelog entry; it is recorded below.

### v2.10.0 — Library: calcium, magnesium, iron and vitamin B12 published

**Four more Library pages are live**, each checked against its NIH Office of Dietary Supplements fact
sheet: calcium, magnesium, iron and vitamin B12. The Library now has a Minerals section, which appears in
navigation, the sitemap and search automatically now that it has entries.

### v2.9.0 — Library: calcium, magnesium, iron and vitamin B12 (drafts)

**Four new Library pages, written and awaiting review.** Calcium, magnesium, iron and vitamin B12 are
drafted from their NIH Office of Dietary Supplements fact sheets and stay as drafts — visible in
`npm run dev`, absent from the live site, sitemap and search — until each is checked against its source.
They were chosen because each tests a case vitamin D did not: magnesium's supplement-only upper limit,
iron's large differences by sex and in pregnancy, and B12's lack of any upper limit.

The template was built around vitamin D, and these exposed three things it got wrong for other nutrients.
None affected the live vitamin D page, which renders identically.

- **Summary boxes that could state the wrong amount.** The boxes at the top showed the higher 19–50 value
  under "Adults 19–70" — right for vitamin D, but for iron it would have shown 18 mg to men and to everyone
  over 50, who need 8. They are now built from runs of ages with identical values, with men and women
  shown separately where they differ. An upper limit that changes with age is shown as a range.
- **Age brackets the source splits.** Magnesium's fact sheet gives different values for 19–30 and 31–50.
  Files can now copy both rows rather than having to merge them.
- **What a supplement-only limit covers, in the source's words.** The template printed "supplements and
  fortified foods" above every such limit; magnesium's sheet says supplements and medicines. Each file
  now states it, and the build fails if a non-total limit does not.
- **A readable warning.** That scope warning measured 1.39:1 against the Library's light background — it
  was styled for the calculators' dark panels. It is now 8.9:1 in light mode and 9.7:1 in dark.
- Also: an "Upper limit" section that says so when none is set; a note beneath the intake table for
  anything the table alone would mislead about, such as iron's higher requirement for vegetarians; and
  four new checks run on every file, including that every non-total limit says what it covers.
- `docs/LIBRARY-WORKFLOW.md` covers each new case, so the next batch does not rediscover them.

### v2.8.1 — Vitamin D: forms, absorption, and vitamin K

- **Forms.** The page now distinguishes vitamin D2 (ergocalciferol) from D3 (cholecalciferol): the
  skin makes D3, animal foods provide mainly D3, mushrooms provide D2, supplements contain either,
  and D3 may raise blood levels higher and for longer. Food sources are labelled by form where the
  NIH says which. Where a source does not say — such as which form a trial used — the page does not
  guess.
- **Absorption.** Fat in the same meal improves absorption; age and obesity do not change it;
  fat-malabsorption conditions reduce it.
- **Vitamin K.** Vitamin D3 is often sold with K2. The page explains that the claim is about
  directing calcium into bone, not absorbing vitamin D, that the evidence is limited and
  inconclusive, and — from the NIH's vitamin K fact sheet — that vitamin K can interact seriously
  with blood thinners such as warfarin.
- Three optional sections any nutrient can use: forms, absorption, and a commonly paired nutrient.

### v2.8.0 — The Library

**A reference library of vitamins and minerals**, at `/library/`. Each page gives the official adult
intake — including pregnancy and breastfeeding — the upper limit, the five best food sources, U.S.
intake data, who runs low, what deficiency looks like, medicine interactions, and **what the
evidence does and does not support**, including where official bodies disagree.

- **One source for every value**: the NIH Office of Dietary Supplements fact sheets, which present
  the official U.S. intake recommendations. A test fails if a page cites any other source for them.
- **Values as data, not prose.** Each nutrient is a data file in `src/content/nutrients/`; the page,
  its tables and its chart are all rendered from it, so they cannot disagree. Tests check the data
  itself: brackets complete, upper limits consistent, sources in order, every reference cited.
- **Upper limits say what they cover.** For some nutrients the limit applies only to supplements —
  magnesium's is lower than its recommended amount, correctly. Each file states which, and the page
  says so.
- **A chart on every page**: how far one serving of each food goes toward a day's amount, computed
  from the page's own figures.
- **Drafts stay invisible.** Every page is created as a draft until a person has checked it against
  the source. The Library tab, its pages, sitemap entries and search results appear only once the
  first page is published — never a link to an empty section.
- Vitamin D is complete and awaiting review. `docs/LIBRARY-WORKFLOW.md` covers adding the rest.

### v2.7.1 — Every refusal decided in one place, and shown

**Fixed: the Macro Calculator crashed instead of refusing.** A summary bar read macro values
that a refused result does not carry, so every refusal threw an error and blanked the
calculator. That included the underweight refusal, which predates this release — so an
underweight user asking to cut saw a broken page, never the eating-disorder helpline the refusal
exists to show. The engine refused correctly; the page never displayed it.

**Fixed: Hand Portions ignored imperial height.** Every imperial user was assumed to be 5′10″,
so the underweight check ran at the wrong height. A 6′4″, 130 lb user — BMI about 15.8 — was
computed at about 18.6 and given a weight-loss plan, while a healthy 5′0″ user was refused.
Imperial users now enter feet and inches.

**Changed: one refusal order, the most protective first.** The tools disagreed. Macro, Hand
Portions and the Deficit Planner checked weight before age; the Baseline checked age first. An
underweight 16-year-old asking to lose weight saw the helpline in three tools and not in the
Baseline. Every tool now refuses in one order — pregnancy, then weight target, then age — so the
message with the clinician-staffed helpline wins wherever it applies.

**Every refusal now comes from the engine.** The Deficit Planner's calculation moved into
`deficitPlanResult()`, and all eleven tools with an age field refuse through `eligibility()`. No
component calls a safety rule directly; a test enforces it.

**New checks**
- `refusal-consistency.test.js` — the same person sees the same message in every tool. The
  Baseline test had only checked that messages came from the approved list, not that they
  matched.
- `npm run qa:refusals` — enters inputs that should be refused, in a real browser, across every
  tool that refuses. The existing audit loaded pages at their defaults, where no refusal ever
  fires, which is how the crash went unnoticed. Added to CI; confirmed to fail on the original
  crash.

### v2.7.0 — Age gates on every calculator; fixes to the Baseline

**Age**
- Every calculator now accepts ages **18 to 99**. The upper limit was 120; it is one shared
  constant, so the change applies to all tools at once rather than drifting between them.
- Healthy Weight, FFMI and Protein Target **had no age gate**, so a 15-year-old received adult BMI
  categories — which do not apply to children. Each now asks for age and refuses through the same
  engine decision as every other tool. A test now fails if any calculator asks for an age without
  acting on it.
- Protein Target's "Over 60" switch is replaced by the age field. The older-adult adjustment is
  now decided from age inside the engine, so no interface can omit it.

**Fixed in the Baseline**
- *"What these numbers actually tell you"* showed single letters — "E", "v" — instead of three
  explanations. The guide entries were plain text where the layout expects a heading and a body,
  so it displayed each sentence's first two characters. A new test checks every tool's guide.
- **The Baseline gave over-60s the younger protein range.** It never passed the older-adult flag.
  The equality test missed it because both sides of the comparison omitted the flag and agreed on
  the wrong answer — agreement only proves anything about the inputs actually passed. A direct test
  now checks that older adults get the higher floor.

### v2.6.0 — Phase 5 Revision: The Stat Method Baseline

**The Stat Method Baseline** — the new flagship, at `/tools/baseline/` and behind the homepage's
main button. One form produces energy, body composition, daily targets and a plan.

**One calculation engine, many interfaces**
- The Baseline contains no arithmetic and no safety rules of its own (`src/engine/baseline.js`).
- Getting there meant moving logic that still lived in React components into the engine: the
  TDEE, Healthy Weight and Macro calculators each computed their results inside the component.
  Those bodies moved verbatim into `src/engine/results.js`; the standalone tools and the Baseline
  now call the same functions.
- Tests assert, across 324 people and 11,664 refusal cases, that every Baseline section equals
  its standalone calculator's result and that the Baseline refuses whenever any included tool
  would. Minimum-assertion guards stop these tests from passing by skipping every case, and both
  invariants were confirmed to fail when deliberately broken.

**Safety decided once, in the engine**
- New `eligibility()` owns the refusal decision. Five tools had each assembled refusals from the
  same rules in their own order; reordering one would have made two tools refuse different
  people. Now there is one order and one set of words.
- **Closed a safety gap.** The Deficit Planner raised the calorie floor to 1,800 for someone
  breastfeeding; the Macro Calculator could not, having no life-stage field. The engine had two
  floor rules. There is now one: a breastfeeding user on a cut previously got 1,286 kcal from the
  Macro Calculator and now gets 1,800. With no life stage the floor is exactly as before.
- The atypical-anorexia caveat on "Normal weight" is now decided in the engine, so the Healthy
  Weight Calculator and the Baseline cannot word or trigger it differently.
- Plan states the standalone tools lack have their own wording. The Deficit Planner's
  "infeasible" message was deliberately not reused — it refers to a target date and an alternative
  pace, neither of which the Baseline has, so it would have been untrue there.

### v2.5.0 — Charts across the articles

**Eight more charts**, for eleven in all — each drawing the argument its article makes
- Line charts: maximum heart rate formulas by age, four ideal-weight formulas by height, five BMR
  equations by bodyweight, BMI against FFMI as body fat rises, load by rep count at each RPE, and
  the gap between Wilks and DOTS by bodyweight
- **A second chart type, for ranges**: protein's reported breakpoint with its confidence interval,
  and three body-fat methods each with its published error margin
- **Not charted**, deliberately: creatine, macro split, race prediction, sleep, tracking without a
  scale, warming up, strength standards and calorie burn. A chart there would be decoration
- The protein chart shows only per-kilogram-of-bodyweight figures. The article also uses
  per-kilogram-of-lean-mass figures, and putting both on one axis would invite comparing numbers
  that are not comparable
- MDX articles use a `Chart` component; Markdown articles keep the placeholder

**Correction — powerlifting scoring**
- The article said DOTS and Wilks "part company" at 145 kg. They differ by about 2.4% there; the gap
  widens among super-heavyweights, to about 5% by 185 kg. It also said lifters around 80 to 90 kg
  barely notice the change, which holds for men but not women, whose widest gap falls near 87 kg.
  Logged on the article with the date.
- **A first draft of this correction was itself wrong.** It said the larger divergence was at the
  light end, reading a 5% gap at 40 kg off a chart — but no man competes at 40 kg; the lightest
  class is 59. The chart now plots each sex only across its competition weights, and a comment in
  its definition says why those ranges must not be widened.
- New test: DOTS and Wilks reproduce **published 2026 IPF World Championship scores** to within 0.1
  points. External ground truth that internal consistency could not provide.

**Fixed: charts could go stale**
- Astro caches each article's rendered output keyed on the article file, and did not know the
  charts inside depend on chart definitions. Correcting a chart or a formula left the old chart in
  place until the article happened to change — breaking the promise that a chart cannot contradict
  its calculator. The build now clears that cache first; verified by changing a definition without
  touching its article.

### v2.4.1 — Accurate AI disclosure on every article

- All 19 articles now carry the same disclosure in their review box: *"Drafted with AI
  assistance, then edited and fact-checked by a human."* Eighteen had said *"Written and edited
  by a person,"* which was not accurate.
- The cause was omission rather than a choice: those articles never set `aiAssisted`, and the
  schema defaults it to `false`. `qa:articles` now requires the field to be stated explicitly on
  every article, so leaving it out fails the build instead of quietly claiming human authorship.
- Placement and prominence are unchanged — one sentence in the existing review box at the foot
  of each article.

### v2.4.0 — Phase 4 Revision

**Scheduled publishing**
- Articles with a future `published` date stay off the site until that date, then appear at
  10:00 UTC. A daily scheduled rebuild triggers it, so a failed or delayed run is caught the
  next morning rather than a week later. Needs a Cloudflare deploy hook stored as the
  `CLOUDFLARE_DEPLOY_HOOK` repository secret; the workflow fails loudly without one rather than
  silently publishing nothing.
- **Fixed before it could cause harm:** six places listed articles, each with its own filter,
  and the search index used none — it included every article whatever its status. Harmless while
  no drafts existed; on the first Sunday of scheduling it would have made future articles
  searchable before their date. All six now use one function, tested against the real rule.
  Verified that a future article is absent from all seven surfaces — pages, index, category
  pages, search index, sitemap, and tool pages — and appears on all of them once its date passes.

**Charts**
- Three articles gained charts: one-rep-max formulas diverging with reps, the static
  3,500-calorie rule against the dynamic model, and caffeine remaining at three half-lives.
- Computed at build time from the same engine functions the calculators use, so a chart cannot
  contradict its tool. Every number in every caption is computed, never typed.
- Static SVG — no JavaScript. A hidden data table for screen readers, and dash patterns as well
  as colours so charts read in greyscale print. A mistyped chart name fails the build.
- The static 3,500-calorie line was calculated inside the Deficit Planner component, against the
  rule that arithmetic belongs in the engine. Moved to `staticSeries()` in the engine, with
  tests, so the calculator and the chart share one function.

**Drafting workflow**
- `npm run new:article` creates a fully templated article for the next free Sunday — **as a
  draft**, so a skeleton cannot publish itself. It warns about overlapping titles.
- `npm run topics` lists every article by category and status, read from the files.
- `qa:articles` now refuses to pass a non-draft article that still contains a `TODO` or has
  unverified citations.
- `docs/ARTICLE-WORKFLOW.md` — the full process, written to be followed cold.

### v2.3.1 — Hidden files that never shipped

Two earlier entries described changes that did not reach this repository. `.github` is a
hidden folder, and copying files across by drag-and-drop in macOS Finder silently skips it.

- **`qa:articles` now actually runs in CI.** v2.2.0 said it had been added to CI; it ran only
  in the local predeploy chain until this release, so template drift would not have failed a
  build.
- **GitHub issue forms now exist.** v2.3.0 added them and the report page described them; until
  this release GitHub showed a blank issue form instead.
- `CONVENTIONS.md` §17 records the cause, and how to copy changes so it does not recur.

### v2.3.0 — Phase 3 Revision

**Save your results**
- Every calculator now has **Copy results** and **Save as PDF**. Copied text includes the
  inputs that produced the result, not just the result, and closes with a pointer to the
  method's limits.
- PDF uses the browser's own print dialog and a print stylesheet — no library on tool pages,
  and nothing leaves the device.
- Six tools whose main result lives outside the shared components now pass it explicitly:
  heart-rate zones, plate breakdown and warm-up ramp, running splits and predictions, the
  one-rep-max percentage table, hand portions, and macros. Without this, copying Heart Rate
  Zones would have saved the maximum heart rate and dropped the zones.
- **The buttons never appear on a refused or incomplete result.** They render inside the
  results panel's normal branch, which a safety rail replaces entirely. A render test pins
  this, and was confirmed to fail when the buttons are moved outside that branch.

**Report a problem**
- New `/report/` page, linked from the footer and from every calculator. Email is the primary
  route, since most readers do not have GitHub accounts; GitHub issues are offered to those
  who do.
- Structured GitHub issue forms for wrong results, citation problems, broken pages and safety
  concerns. Blank issues disabled.

**Privacy**
- The policy now says what happens when someone emails us. It previously invited email while
  stating that no personal information was collected — untrue for anyone who wrote in. The
  California section and the opening heading are qualified to match.

**Resources** — 20 entries to 31, all verified against current sources
- Primary sources: Cochrane Library, ClinicalTrials.gov, Google Scholar, JISSN position stands
- New group, *Researchers worth reading*: Stuart Phillips, Brad Schoenfeld, Eric Helms, Mike
  Zourdos, Abbie Smith-Ryan, Louise Burke
- Testing: Function Health and InsideTracker, each with its competing interest stated
- Stronger by Science now notes it shares a team with MacroFactor, so the two are not read as
  independent endorsements
- A submitted list credited one researcher as "Dr." — he holds a master's degree. Checked
  before publishing rather than after.

### v2.2.0 — Phase 2 Revision

**Article header**
- Key takeaways and the calculator link are now one box, closing with a conclusion written for
  that article and a button to the tool. The separate compact call-to-action bar above the
  title is gone; the full card before the references stays.
- All 19 articles gained a `conclusion` — written individually, not templated

**Template conformance**
- `caffeine-and-sleep` was missing section summaries; added five, content unchanged
- `protein-how-much` and `tdee-explained` used Markdown `##` headings, so their contents lists
  had nothing to anchor to, and neither had key takeaways, a table of contents, or section
  summaries. All added; headings converted to `<h2 id>`; no wording changed.
- New `npm run qa:articles` fails the build on template drift — Markdown headings, missing
  summaries, or a heading absent from the contents list. Added to CI and the predeploy chain.

**Categories**
- `Training` renamed `Exercise`, and a fourth category `Health` added
- Recategorised: `body-fat-methods`, `what-should-i-weigh` and `ffmi-explained` to Health;
  `calorie-burn-estimates` to Exercise. Now Nutrition 6, Exercise 8, Health 3, Recovery 2.
- Four static category pages at `/articles/nutrition/`, `/exercise/`, `/health/`, `/recovery/`,
  with navigation on the index. Static rather than a JavaScript filter: content pages carry no
  executable JavaScript beyond the theme toggle, and a filter would be invisible to search
  engines. 52 pages now build, up from 48.
- Article breadcrumbs pointed at `/articles/#category`, an anchor that never existed; they now
  point at the category pages

### v2.1.0 — Phase 1 Revision

**Content and wording**
- "Arithmetic" and the British "maths" replaced with "math" across all visitor-facing text,
  including the safety refusal messages
- Homepage and tool-page triad is now `MEASURE · UNDERSTAND · IMPROVE`, above
  "Stop guessing. Show the work."

**Resources**
- "Government" pill renamed "Research"
- Added Marek Health under a new *Testing & clinical services* group, with a caveat that the
  provider also sells treatment
- Corrected the *Tracking & data* blurb, which claimed every entry had a free tier

**Repository**
- `CONTRIBUTING.md` rewritten: issues welcome, content pull requests not merged. States
  plainly that AGPL-3.0 still permits forks. Build notes moved to `docs/DEVELOPMENT.md`
- `LICENSE` copyright line: removed inherited indentation

**Also since v2.0.0** — shipped without a tag at the time
- **Security:** Astro upgraded to 7.3.3 and `@astrojs/mdx` to 8.0.1 for a critical advisory
  (remote code execution via AVIF image optimization; authorization bypass in base-path
  handling). `npm audit` clean.
- **CI:** now tests Node 22 and 24 — production builds on 24, and CI previously tested only
  22. Playwright browser cached between runs. Actions bumped to checkout v7, setup-node v7,
  cache v6.
- **Dependabot:** security advisories immediately; routine updates monthly and grouped, with
  major versions excluded
- **Branch protection:** deletion and force-push blocked on `main`
- GitHub links now point to this repository rather than the maintainer's profile
- README corrected: licence statement, counts, hosting, and three citation claims

### v2.0.0 — First public release

Rebranded to The Stat Method at thestatmethod.com. Code AGPL-3.0, written content all rights
reserved. 18 calculators, 19 articles, 235 tests, 80 of 80 citations verified.

## Contributing

Calculators and articles are added and changed by the maintainer only, so pull requests that
change content are not merged — open an issue instead. Bug reports on the math are especially
welcome: if a formula is misapplied or a citation is wrong, include the input values and the
result you expected. See [`CONTRIBUTING.md`](CONTRIBUTING.md).

Corrections are logged publicly, and articles carry a visible last-updated date.

---

## Licence

See the Licence section above: code is AGPL-3.0, written content is all rights reserved.

## Production launch tooling

Phase 8 adds:

- `npm run qa:launch` — builds and checks required static launch artifacts, rendered placeholder leakage, robots/sitemap/manifest presence, and Cloudflare security headers.
- `npm run qa:growth` — builds and checks the five priority acquisition calculators, route canonicals, metadata, WebApplication schema, and sitemap/robots structure.
- `.env.example` — documents `PUBLIC_SITE_URL`, the production origin used for canonical URLs, sitemap generation, and Open Graph URLs.
- `public/_headers` — baseline Cloudflare security/privacy headers. HSTS is intentionally documented but not enabled until the custom domain is HTTPS-only.

## Production / launch commands

Once owner-specific production values are configured:

```bash
npm run qa:production
npm run qa:predeploy
```

See [`DEPLOYMENT.md`](DEPLOYMENT.md).

## AI / Maintainer handoff

Read [`docs/CONVENTIONS.md`](docs/CONVENTIONS.md) before making changes — it records the rules this codebase follows and the bug behind each one.

## Conventions

`docs/CONVENTIONS.md` — safety rails, dark-mode pinning, input bounds, colour taxonomy,
citation checks, and the pre-ship chain. Read it before adding anything.
