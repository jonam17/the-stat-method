---
title: "Wilks is obsolete: what replaced it and why"
dek: "Comparing a 60 kg lifter to a 120 kg lifter needs a formula. The one most calculators still use has known bias, and two better systems replaced it in 2020."
category: Exercise
conclusion: "If you are comparing lifters today, use DOTS or IPF GL. Wilks is a historical record, not a current standard."
published: 2026-08-13
readMinutes: 9
citationsVerified: full
citationsVerifiedDate: 2026-08-26
author: The Stat Method
relatedTool: powerlifting-score
evidenceBased: true
keyTakeaways:
  - "Absolute total favours heavier lifters, so federations use coefficients to compare across bodyweights."
  - "Wilks was the standard for about twenty-five years but has documented bias at the extremes."
  - "DOTS was published in 2019 and adopted by USPA, WRPF and others from 2020."
  - "IPF GL Points became the IPF's official system on 1 May 2020."
  - "The three scales are not interchangeable — IPF GL runs to about 100 where DOTS runs in the hundreds."
toc:
  - { id: "why-coefficients", label: "Why coefficients" }
  - { id: "wilks", label: "The Wilks era" }
  - { id: "dots", label: "DOTS" }
  - { id: "ipf-gl", label: "IPF GL" }
  - { id: "bottom-line", label: "Bottom line" }
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

It is also worth saying plainly that **no major federation still uses it**. The IPF scores on
GL Points; USA Powerlifting scores on DOTS. Both moved from published lookup charts to
formulas computed from exact bodyweight. Wilks survives in conversation and in calculators
rather than in competition, which is a reasonable argument for knowing what it is and a poor
one for steering by it.

One practical caveat if you are comparing against an official result. USA Powerlifting adjusts
for age using **two** systems, on the assumption that maximal strength potential peaks between
24 and 39 and falls away either side: **Foster** coefficients for competitors aged 14 to 23,
and **McCulloch** coefficients for those 40 and over. Both are the same for men and women, and
both multiply the total.

The adjustment is substantial at the edges, and **our calculator reports open-category scores
only** — so if you are under 24 or over 39, your official placing will differ from what you
see here, by a wide margin at older ages.

Two things are worth knowing about how USA Powerlifting actually uses these numbers, because
both are easy to get wrong.

**Placings are decided by age division, not by age-adjusted score.** The current rulebook
awards the top finishers in each division, and divisions are defined by age — youth, teen,
junior, open, and masters 1 through 7, running to 110 years old with no upper limit. Age
coefficients are a best-lifter and cross-division comparison device, not the mechanism that
decides who wins your class.

**And DOTS is explicitly a placeholder.** The rulebook records that USA Powerlifting approved
developing a formula superior to DOTS at its 2024 meeting, with work running through 2025 and
possibly beyond, and states that DOTS continues to be used *until such a time as a new formula
is approved*. So the scale this calculator reports as current is, by its own governing body's
account, on its way out. That is the third replacement in this story, and it will not be the
last.

There is a wrinkle worth knowing if you go looking for the age numbers yourself. The McCulloch
values that circulate on calculator sites and forums — a 60-year-old multiplier of 1.340, a
75-year-old's of 1.835 — match USA Powerlifting's **2021** document and an older edition of
the WRPF's table. USAPL's more recent document carries materially different and less generous
figures: 1.194 at 60, against 1.340. That is roughly a twelve per cent difference in a
lifter's score.

We have not implemented either, and the reason is the discrepancy itself. Adopting the
popular numbers would flatter masters lifters relative to their actual placings, and adopting
the newer ones on the strength of a cached document would be guessing at which is in force.
**If you are a masters or junior lifter, get your coefficient from your federation rather than
from any calculator, including ours.**

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

DOTS was published in 2019 by Tim Konertz, built on modern competition data with the
explicit aim of correcting the bias at the extremes. USPA, WRPF and several other
federations adopted it from 2020, and it has become the default in much of the sport outside
the IPF.

Structurally it resembles Wilks — a fourth-order polynomial in bodyweight, scaled so the
resulting numbers land in a familiar range. That similarity is deliberate and useful: at
mid bodyweights DOTS and Wilks produce very similar scores, so lifters around 80 to 90
kilograms barely notice the change. The divergence appears where it should, at the light and
heavy ends.

<div class="pull">
At 82.5 kg the two formulas agree within a few points. At 145 kg they part company — which
is the entire reason DOTS exists.
</div>

<aside class="summary">
<span class="summary-label">Summary</span>
<div class="summary-body"><p>DOTS refits the same idea to modern data. Mid-weight lifters see almost no change; light and heavy lifters see the correction the formula was built to make.</p></div>
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

<h2 id="bottom-line">The bottom line</h2>

If you compete under the IPF, use IPF GL, because that is what your federation scores you
on. If you compete elsewhere, or you are simply tracking your own progress, DOTS is the
better modern default.

Keep Wilks in view for one reason only: a great many older records, gym leaderboards and
personal benchmarks are still expressed in it, and you will want to compare like with like.
Our calculator shows all three at once for exactly that reason — with Wilks labelled legacy,
rather than presented as the standard the way most incumbent tools still do.
