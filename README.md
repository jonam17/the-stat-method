# The Stat Method

**Free, open-source fitness calculators that show their methodology**, paired with health
and training writing that cites its sources.

> **The operating principle: the math is free forever.**
> Calculations run entirely in your browser and cost nothing per user, so they will never
> be paywalled, gated behind a signup, or used as a lead magnet for coaching.

**18 calculators · 19 sourced articles · 240 unit tests · zero JavaScript on content pages**

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

### Energy & body composition

#### Deficit & goal-date planner

The flagship. Most calculators use the static "3,500 kcal = 1 lb" rule, which assumes
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
│   └── __tests__/             240 unit tests
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
| Tests | **Vitest** | 240 tests |
| Hosting | **Cloudflare Workers** | Static assets, custom domain |

Requires **Node 22+** (Astro 7 dropped 18.x and 20.x).

Content pages ship with **no JavaScript at all** — only pages containing a calculator load
the React bundle.

---

## Getting started

```bash
npm install
npm run dev          # http://localhost:4321
npm test             # 240 tests
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

240 tests cover every formula, plus the placement of the save-results buttons. Several assert the *honesty properties* of the models rather
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

## Changelog

Every release is tagged. Newest first.

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
