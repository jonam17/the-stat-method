---
title: "Wilks is obsolete: what replaced it and why"
dek: "Comparing a 60 kg lifter to a 120 kg lifter needs a formula. The one most calculators still use has known bias, and two better systems replaced it in 2020."
category: Exercise
conclusion: "If you are comparing lifters today, use DOTS or IPF GL. Keep Wilks for reading older records."
published: 2026-08-13
updated: 2026-10-27
readMinutes: 9
aiAssisted: true
citationsVerified: full
citationsVerifiedDate: 2026-10-27
author: The Stat Method
relatedTool: powerlifting-score
evidenceBased: true
keyTakeaways:
  - "Heavier lifters lift more in absolute terms, so federations score totals with formulas that adjust for bodyweight."
  - "Wilks was the standard for about twenty-five years, but it was fitted to equipped results from 1987–1994 and never updated as planned. Neither the IPF nor USA Powerlifting uses it."
  - "DOTS, created in 2019 and built on results from drug-tested raw lifters, is the formula in USA Powerlifting's current rulebook."
  - "IPF GL Points have been the IPF's official system since 1 May 2020."
  - "The scales are not interchangeable: about 100 is elite in IPF GL, while DOTS and Wilks run in the hundreds."
  - "Among people who compete in classic full-power meets, the median DOTS is about 359 for men and 316 for women."
toc:
  - { id: "why-coefficients", label: "Why coefficients" }
  - { id: "wilks", label: "The Wilks era" }
  - { id: "dots", label: "DOTS" }
  - { id: "ipf-gl", label: "IPF GL" }
  - { id: "good-score", label: "What is a good score" }
  - { id: "bottom-line", label: "Bottom line" }
changelog:
  - date: 2026-10-27
    note: >-
      Checked against USA Powerlifting's rulebook (v2026.2). It uses DOTS to break ties in team placings at national championships; the article had said USA Powerlifting "scores on DOTS". The masters divisions end at 109, not "110 with no upper limit" (the open division has none). The age-coefficient figures cited USA Powerlifting documents that were not in the references and are not in the rulebook, so that passage is now one paragraph without figures. Removed the claim that USPA, WRPF and others adopted DOTS from 2020, for which we had no source, and the claim that DOTS was built with the explicit aim of correcting Wilks. Added what DOTS is built on, from OpenPowerlifting's documentation, and a section on what a good score is, from OpenPowerlifting's meet results.
  - date: 2026-09-27
    note: >-
      Corrected the comparison of DOTS and Wilks. The article said the two formulas "part company" at 145 kg; they differ by about 2.4% there, and the gap keeps widening among super-heavyweights, to about 5% by 185 kg. It also said lifters around 80 to 90 kg barely notice the change, which holds for men but not women, whose widest gap falls near 87 kg. Added a chart of the gap by bodyweight.
references:
  - text: "International Powerlifting Federation. IPF GL Coefficients, effective 1 May 2020."
    url: "https://www.powerlifting.sport/fileadmin/ipf/data/ipf-formula/IPF_GL_Coefficients-2020.pdf"
    verified: true
  - text: "International Powerlifting Federation. Evaluation of Wilks, Wilks-2, DOTS, IPF and Goodlift formulas, 2020."
    url: "https://www.powerlifting.sport/fileadmin/ipf/data/ipf-formula/Models_Evaluation-I-2020.pdf"
    verified: true
  - text: "Wilks R. Wilks Formula for Men and Women. Powerlifting Australia."
    verified: true
  - text: "Vanderburgh PM, Batterham AM. Validation of the Wilks powerlifting formula. Med Sci Sports Exerc, 1999;31(12):1869-1875."
    url: "https://pubmed.ncbi.nlm.nih.gov/10613442/"
    verified: true
  - text: "OpenPowerlifting. Bulk CSV documentation: column definitions, including Dots and Goodlift."
    url: "https://openpowerlifting.gitlab.io/opl-csv/bulk-csv-docs.html"
    verified: true
  - text: "OpenPowerlifting. Bulk CSV data, file of 2026-10-24 (public domain); percentiles produced by scripts/opl-percentiles.mjs in this site's repository."
    url: "https://openpowerlifting.gitlab.io/opl-csv/bulk-csv.html"
    verified: true
  - text: "USA Powerlifting. Rulebook, version 2026.2 (in effect 1 January 2026), §1.7, §1.9.5, §1.12."
    url: "https://www.usapowerlifting.com/"
    verified: true
---

A 60 kilogram lifter totalling 400 kilograms and a 120 kilogram lifter totalling 700 have
both done something impressive. Deciding which is *more* impressive requires a formula, and
which formula you use changes the answer.

<h2 id="why-coefficients">Why coefficients exist at all</h2>

Strength scales with body size, but not proportionally. Muscle cross-sectional area grows
roughly with the square of a linear dimension while body mass grows with the cube, so a
lifter twice as heavy is not twice as strong. Absolute total therefore favours heavier
lifters, and simple bodyweight ratios over-correct and favour the very light.

Scoring coefficients exist to sit between those two failures. Each is a curve fitted to
competition data, mapping a total and a bodyweight to a single comparable number.

Because they are fits to data, they inherit the data. A formula built on results from one
era and one set of federations will misrepresent lifters outside that sample — which is
precisely what happened to the formula most calculators still default to.

<aside class="summary">
<span class="summary-label">Summary</span>
<div class="summary-body"><p>Strength does not scale proportionally with bodyweight, so federations use fitted coefficients to compare lifters. Because they are fits to historical data, they age.</p></div>
</aside>

<h2 id="wilks">The Wilks era</h2>

The Wilks coefficient, published in 1994, was the global standard for roughly a
quarter-century. It was a genuine improvement on what preceded it and it made cross-class
comparison routine in a way it had not been before. [3]

Two facts about how it was built explain most of what followed. The polynomials were fitted
to **equipped** results from 1987 to 1994 — meaning the reference data is squat suits and
bench shirts, and it predates the raw lifting that dominates the sport today. And Wilks
intended the formula to be revised every two to five years as the data moved. It never was.
A rebalanced Wilks-2 finally appeared in March 2020, twenty-six years later, with entirely
different coefficients. [2]

So the drift people complain about is not a flaw in the math. It is a curve fitted to one
era of the sport, left in place across another.

It is also worth saying plainly that **neither the IPF nor USA Powerlifting uses it**. The IPF
scores on GL Points [1], and USA Powerlifting's rulebook names DOTS as its formula. [7] Wilks survives in conversation and in calculators
rather than in competition, which is a reasonable argument for knowing what it is and a poor
one for steering by it.

One practical caveat if you are comparing against an official result: federations adjust for
age in their own ways, and **our calculator reports open-category scores only**, with no age
adjustment. If you are a junior or masters lifter, get your coefficient from your federation
rather than from any calculator, including ours.

Two things are worth knowing about how USA Powerlifting actually uses these numbers, because
both are easy to get wrong.

**Placings are decided by division.** At national championships the rulebook gives awards to
the top five finishers in each division, and divisions are defined by age — youth (8 to 13),
teen (14 to 19), junior (20 to 23), open (14 and over, with no upper limit), and masters 1
through 7, from 40 to 109. [7] DOTS appears in the rulebook as the tie-break for *team*
placings at national championships.

**And DOTS is explicitly a placeholder.** The rulebook records that USA Powerlifting approved
developing a formula superior to DOTS at its 2024 meeting, with work running through 2025 and
possibly beyond, and states that DOTS continues to be used *until such a time that a new formula
is approved*. [7] So the scale this calculator reports as current is, by its own governing
body's account, on its way out. That is the third replacement in this story, and it will not be
the last.

Its weakness is at the extremes — though the picture is more particular than the shorthand
suggests. The formal validation, published in 1999, found **no systematic bias in the total**
for either sex, which is the number this calculator scores. What it did find was a bias
against heavier lifters in the deadlift specifically, and a bias favouring intermediate
weight classes in the women's squat. [4] It also noted, in passing and rather remarkably for
a formula already governing the sport, that Wilks was not based on published data.

That validation rested on 30 men and 27 women per lift — world record holders and the top two
from the 1996 and 1997 World Championships. A narrow, elite sample, which is worth holding in
mind before treating "validated" as settling much.

Analyses over the years found that the formula does not
treat very light and very heavy lifters even-handedly, and as the sport grew — with more
lifters at both ends of the weight range and far more recorded data — the mismatch became
harder to ignore.

This is not a scandal. It is the ordinary lifecycle of a statistical fit: it described its
data well, the data changed, and it needed refitting.

<aside class="summary">
<span class="summary-label">Summary</span>
<div class="summary-body"><p>Wilks served the sport well for twenty-five years but shows bias at very low and very high bodyweights. That is a normal consequence of a fit ageing past its data.</p></div>
</aside>

<h2 id="dots">DOTS</h2>

DOTS was created in 2019 by Tim Konertz of the BVDK: an updated, simpler polynomial, built on
results from drug-tested raw lifters. [5] USA Powerlifting's rulebook uses it, and says it will
stay until a better formula is approved. [7]

Structurally it resembles Wilks — a fourth-order polynomial in bodyweight, scaled so the
resulting numbers land in a familiar range. That similarity is deliberate and useful: for men at
mid bodyweights, DOTS and Wilks produce very similar scores, so male lifters around 80 to 90
kilograms barely notice the change.

Across the men's weight classes from 59 to 120 kg, the two formulas stay within about 1.3% of
each other. They separate among super-heavyweights: about 2.4% at 145 kg, rising to about 5%
by 185 kg — for an elite total, enough to reorder a close ranking. For women the pattern
differs, with the widest gap, about 3%, near 87 kg.

<figure data-chart="dots-wilks-gap"></figure>

<aside class="summary">
<span class="summary-label">Summary</span>
<div class="summary-body"><p>DOTS refits the same idea to modern data. Mid-weight lifters see almost no change; the differences from Wilks grow among the heaviest lifters.</p></div>
</aside>

<h2 id="ipf-gl">IPF GL Points</h2>

The International Powerlifting Federation took a different route. IPF GL Points — Goodlift
points — became the federation's official system on 1 May 2020, replacing the earlier IPF
Points formula.

Two things distinguish it. First, the mathematical form is different: an exponential rather
than a polynomial. Second, it uses separate coefficient sets for each combination of sex,
equipment category and event, so classic and equipped lifting are scored on their own
curves rather than sharing one.

The scale is also different, and this catches people out. IPF GL points are calibrated so an
elite result approaches 100, while DOTS and Wilks both run in the hundreds. A GL of 72 and a
DOTS of 352 can describe exactly the same performance. Comparing a number from one system
against another is meaningless.

<aside class="summary">
<span class="summary-label">Summary</span>
<div class="summary-body"><p>IPF GL is the IPF's official system since May 2020, uses an exponential form with separate coefficients per category, and runs on a scale where about 100 is elite. Never compare it against a DOTS or Wilks figure.</p></div>
</aside>

<h2 id="good-score">What is a good DOTS score?</h2>

A score only means something against other lifters, so here is how DOTS and IPF GL Points are
spread among people who competed in full-power meets in the five years to 18 October 2026,
from OpenPowerlifting's public meet results. [6] Each lifter is counted once, at their best;
classic means raw (bare knees or sleeves), equipped means single-ply. Half of each group sits
below the 50th percentile, 5% below the 5th and 5% above the 95th.

**DOTS**

|  | Men, classic | Men, equipped | Women, classic | Women, equipped |
|---|---:|---:|---:|---:|
| 5th | 237.4 | 220.2 | 201.1 | 217.9 |
| 25th | 314.8 | 285.5 | 268.6 | 295.6 |
| 50th | 359.0 | 337.0 | 315.6 | 352.5 |
| 75th | 401.0 | 395.6 | 363.8 | 420.6 |
| 95th | 462.9 | 493.8 | 439.0 | 534.2 |

**IPF GL Points**

|  | Men, classic | Men, equipped | Women, classic | Women, equipped |
|---|---:|---:|---:|---:|
| 5th | 47.8 | 37.4 | 41.7 | 37.3 |
| 25th | 63.9 | 48.6 | 55.3 | 50.2 |
| 50th | 73.0 | 57.4 | 64.8 | 59.6 |
| 75th | 81.7 | 67.4 | 74.6 | 71.2 |
| 95th | 94.3 | 84.0 | 90.0 | 90.4 |

Two things stand out. In classic lifting, women's scores run lower than men's — the median is
about 43 DOTS lower — though not in equipped lifting, where the women's median is the higher of
the two. So read your score against your own row. And everyone here entered a meet: the table
compares you with people who compete, not with everyone who lifts. The calculator says where
your own score falls.

<aside class="summary">
<span class="summary-label">Summary</span>
<div class="summary-body"><p>Among competitors in classic full-power meets, the median DOTS is about 359 for men and 316 for women. Compare your score with your own sex and equipment, and remember the comparison is with people who compete.</p></div>
</aside>

<h2 id="bottom-line">The bottom line</h2>

If you compete under the IPF, use IPF GL, because that is what your federation scores you
on. If you compete elsewhere, or you are simply tracking your own progress, DOTS is the
better modern default.

Keep Wilks in view for one reason only: a great many older records, gym leaderboards and
personal benchmarks are still expressed in it, and you will want to compare like with like.
Our calculator shows all three at once for exactly that reason — with Wilks labelled legacy,
rather than presented as the standard the way most incumbent tools still do.
