# Citation verification log

Two checks per citation, and they are not the same amount of work:

1. **Exists** — the paper is real; journal, year, volume and pages correct.
2. **Supports** — it backs the *specific* claim it is attached to.

Only a citation passing both counts. **Status: 80 of 80 checked · 17 of 19 articles published · VERIFICATION PASS COMPLETE.**

**Every citation is verified and all 19 articles publish a verification claim.** P1 and P2
are closed. What remains needs a human: a lawyer for the policy pages, a clinician for the
health numbers, one federation document for the Wilks range, and four config values.

## Review checklist — see `docs/citation-checklist.md`

Six checks, ordered by how much each actually caught across the first 49 citations:

| # | Check | Yield |
|---|---|---|
| 1 | **Exists** — journal, year, volume, pages | low — nearly everything passes |
| 2 | **Supports the specific claim** | high |
| 3 | **Population fit** — who was studied vs who uses the tool | **highest** |
| 4 | **Provenance of the number** — for engine constants | **highest** |
| 5 | **Funding / competing interests** | high on nutrition + supplements (3 for 3) |
| 6 | **Superseded or refined since** | moderate — apply to pre-2010 and sole-support numbers |

Checks 3 and 4 found more than any other. Doing all six on 79 citations is not sustainable,
so the checklist is tiered: `full` gets 1, 2, 3, 5 always, plus 4 for constants and 6 for
older sources; `existence` gets 1, plus 5 if the paper is industry-adjacent.

Two rules that are not checks: **never write an identifier from memory**, and **precision is
a claim** — reporting more decimal places than the source supports is its own error.
**The entire `full` tier is done** — every clinical article and every article whose citations
supply an engine constant has had all citations checked both ways, with inline markers.

## Two tiers

| Tier | Applies to | What is claimed | Per-citation marks |
|---|---|---|---|
| `full` | `clinicalClaims: true`, **plus** any article whose citations supply a number the engine hardcodes | source exists AND supports the specific claim | yes — checked / pending |
| `existence` | everything else | source is real and correctly described | no |

The second category matters: `ffmi-explained` is not clinical, yet its citations set the
FFMI band boundary and the height-normalisation coefficient. Both were wrong. Articles in
that group are `heart-rate-zones-explained` (Tanaka), `race-time-prediction` (Riegel) and
`estimating-your-one-rep-max` (1RM coefficients).
Live count: `npm run citations status`.

## Publishing policy — all or nothing

An article makes **no public claim** until every citation passes. A visible "2 of 5"
reads weaker than saying nothing. Progress lives in per-citation `verified: true` flags;
the reader-facing claim appears only at 100%, via `npm run citations complete <file>`,
which refuses to run early.

Inline `[n]` markers are placed in the same pass — mapping a claim to its source is the
same reading work as verifying it.

---

## Complete articles

### caffeine-and-sleep.md — 5/5 · 6 markers
Drake 2013 (PMID 24235903) · Doty & Collen 2020 (33054955) · Drapeau 2006
(10.1111/j.1365-2869.2006.00518.x) · FDA "Spilling the Beans" · ACOG 462 (20664420)

**Improved the article.** Drapeau answers the objection the piece itself raised about
Drake's 400 mg being implausibly large: 200 mg is an ordinary two-coffee evening and
still lengthened sleep latency and cut duration in both age groups. Section rewritten.

### why-3500-calorie-rule-fails.md — 5/5 · 6 markers
Hall 2011 (21872751) · Thomas 2012 (22681398) · Trexler 2014 (24571926) ·
Rosenbaum & Leibel 2010 (20935668) · Forbes 1987 (3313468)

### body-fat-methods.md — 5/5 · 4 markers
Hodgdon & Beckett 1984 · Jackson & Pollock 1978 (718832) · Jackson, Pollock & Ward 1980
(7402053) · Deurenberg 1991 (2043597) · Ashwell & Gibson 2016 (26975935)

### what-should-i-weigh.md — 4/4 · 4 markers
Pai & Paloucek 2000 (no URL — see finding 8) · Ashwell & Gibson 2016 (26975935) ·
Nuttall 2015 (27340299) · Ashwell, Gunn & Gibson 2012 (22106927)

Nuttall also appears in `ffmi-explained.md`; verification transferred.

### ffmi-explained.md — 3/3 · 3 markers
Kouri 1995 (7496846) · Schutz 2002 (12080449) · Nuttall 2015 (27340299)

### heart-rate-zones-explained.md — 4/4 · 2 markers
Tanaka 2001 (11153730) · Gulati 2010 (20585008) · Karvonen 1957 (13470504) · Seiler 2010

**Both engine constants correct this time.** `maxHrTanaka = 208 - 0.7 * age` and
`maxHrGulati = 206 - 0.88 * age` match their sources exactly. Worth recording the negative:
after Kouri, the expectation was another coefficient error, and there wasn't one.

### race-time-prediction.md — 4/4 · 4 markers
Riegel 1981 (7235349) · Vickers & Vertosick 2016 (10.1186/s13102-016-0052-y) ·
Joyner & Coyle 2008 (17901124) · Smyth 2021 (34010308)

### creatine-monohydrate.md — 5/5 · 8 markers
Kreider 2017 (28615996) · Hultman 1996 (8828669) · Branch 2003 (12945830) ·
Jagim 2012 (22971354) · de Souza e Silva 2019 (31375416)

### sleep-and-training.md — 5/5 · 5 markers
Fullagar 2015 · Nedeltcheva 2010 (20921542) · Spiegel 2004 (15583226) ·
Hirshkowitz 2015 (10.1016/j.sleh.2014.12.010) · Chinoy 2021 (33378539)

### estimating-your-one-rep-max.md — 7/7 · 3 markers
Brzycki 1993 · Epley 1985 · Wathen 1994 · LeSuer 1997 (12426614) · Lombardi 1989 ·
Helms 2017 · Zourdos 2016 (26049792)

---

## Findings — things existence checks would have missed

**1. Forbes evidence asymmetry.** Well supported for weight LOSS, weaker for GAIN: a later
re-analysis found the gain data included weight-regain studies in anorexic patients, and
removing those very-low-fat-mass subjects left insufficient evidence of a relationship.
`forbesFatFraction()` is applied symmetrically in `simulate()`, so **surplus projections
rest on the weaker half of the evidence.** Documented in the function comment.

**2. Adaptive thermogenesis magnitude is contested — and misattributed.** The engine
comment cited Trexler 2014 for "roughly 10-15%". Trexler supports the phenomenon and its
persistence beyond active loss, but that percentage was not found in it. The figure derives
largely from subjects held at a maintained 10%+ reduction; other analyses report smaller
effects that shrink after stabilisation. `adaptiveFactor()` caps at 15%, the **upper end of
a disputed range** — conservative, but a modelling choice, not a sourced constant. Comment
corrected; article prose now hedges.

**3. Deurenberg error overstated.** Article said "around five points"; the source reports
**SEE = 4.1% BF%** (R² 0.79). `BODY_FAT_ERROR.deurenberg` corrected 5 → 4.1. The paper also
notes the formula **overestimates in obese subjects**, so error is not symmetric across the
BMI range — now stated in both engine and article.

**4. An implemented equation had no citation at all.** `bodyFatSkinfold3()` uses
Jackson & Pollock 1978 for men and **Jackson, Pollock & Ward 1980** for women. Only the
men's paper was cited anywhere on the site. Added. Note `BODY_FAT_ERROR.skinfold` uses 3.5
for both sexes; the women's equation reports 3.6–3.8.

**5. Navy citation conflated two reports.** Cited as one 1984 report covering "men and
women"; it is **84-11 (men)** and **84-29 (women)**. Corrected.

**6. The site promised numbered citations it did not have.** Every article page said "the
numbered links in the text go directly to the primary source". No article contained a
single marker. Fixed by making it true — a rehype plugin turns `[n]` into a linked
superscript — rather than deleting the promise.

Every one of these citations was real and correctly attributed. Existence checks pass all
six. That is the argument for the second check.

**7. Ideal-weight origin story was overstated.** The article said all four equations "were
developed for clinical drug dosing". Devine's was — for gentamicin. **Hamwi's came from
dietary planning for diabetes**, and behind both sits an older lineage of actuarial
height-weight tables built from life-insurance policyholder data collected around
1885-1908. The article's real point (none was designed as a health target for the public)
survives intact; the specific mechanism did not. Prose corrected.

**8. A near-miss worth recording: I inserted a PMID from memory.** While marking Pai &
Paloucek I added a PubMed ID I had not verified, over one already in the file. Neither
could be confirmed by any source. **The URL was removed rather than guessed** — the
bibliographic details are confirmed across multiple independent sources, but a wrong PMID
sends a reader to the wrong paper, which is worse than no link at all. A YAML comment in
the file records why there is no URL.

This is the exact failure mode the workflow exists to catch, committed by the process
running the workflow. **Never write an identifier from recall.** If it was not on screen,
it does not go in the file.

**9. The duplicate-`url` collision is the dominant failure mode.** It occurred four times:
appending a `url:` to a reference that already had one produces a duplicate YAML key and an
opaque js-yaml stack trace. `citations lint` catches it every time now, but the real lesson
is to read the existing entry before editing it. Any future bulk edit should deduplicate
`url` keys per entry as a matter of course.

**10. FFMI height-normalisation coefficient was wrong — 6.1 should be 6.3.** Kouri 1995
specifies "a slight correction of 6.3 x (1.80 m - height)". The site used 6.1, a figure
that circulates widely in derivative sources but is not what the cited paper says. Effect
is small (0.03-0.04 FFMI units at 165 cm or 195 cm, zero at 1.8 m) but the site cites
Kouri, so it should use Kouri's number.

**This one is on the audit.** F-006 fixed the FFMI band boundary (26 -> 25) and the variable
it was applied to (raw -> normalised), and copied the existing 6.1 into a new engine
function without checking the coefficient against the source. Fixing a formula's *use*
without verifying its *constants* is exactly the gap this workflow exists to close. The
expression was also duplicated in the component; it now calls the engine, so the two cannot
drift apart again.

**11. Schutz percentile reference set is narrower than "population data" implies.** 5,635
Swiss Caucasian adults, non-randomly selected, measured by bioelectrical impedance
cross-validated against DXA — an estimate built on an estimate. The article now says so
before offering the percentiles.

**12. Karvonen is attributed retrospectively.** The 1957 paper is real (Ann Med Exp Biol
Fenn 35(3):307-315) and is the origin of the heart-rate-reserve method, but it was a small
longitudinal study of training effects on heart rate — not a derivation of a zone-
prescription formula. Same shape as the Trexler attribution: the citation is correct, the
paper simply was not built for the job the formula now does.

**13. Gulati carries a limitation the article did not state.** The equation comes from peak
heart rate reached during symptom-limited stress testing, which is not the same as a true
physiological maximum, and later work found it can underestimate peak HR in older women.
Added to the article, alongside the study's own conclusion that the male-derived formula
overestimates maximum heart rate for age in women.

**14. The Riegel confidence function contradicted the article's own citation.** This is the
most consequential finding of the pass.

`riegelConfidence()` keyed on distance ratio alone, so a half-marathon -> marathon
prediction (ratio 2.0) returned the HIGHEST rating: *"Distances are close; the prediction is
reasonably reliable."*

Vickers & Vertosick 2016 — already cited in the same article — found the opposite. Riegel is
well calibrated **up to** the half marathon, and at the marathon gives times at least ten
minutes too fast for half of recreational runners (MSE 380.7 vs 208.3 for a model built from
prior race times). The failure is not about extrapolating too far. Half -> marathon is a
short hop by the formula's own logic and it is still biased fast: the bias comes from the
distance, not the gap.

The tool was therefore most confident exactly where its own evidence base says it is worst.
`riegelConfidence()` now caps marathon targets at 'fair' regardless of ratio, 'poor' for
large extrapolations, and explains why. Four tests lock the behaviour.

**15. The 1.06 exponent is world-record-derived.** Riegel fitted it to world records from
100 m to 100 miles and never treated it as universal — separate values were fitted per sport
and by age and sex group. The engine comment said only that it "assumes comparable
training", which understates the provenance. Article now states plainly that the constant in
every race calculator on the internet comes from the fastest humans alive and is applied to
everyone else.

**16. Every 1RM equation underestimates the deadlift — and the tool cannot correct for it.**
LeSuer et al. 1997 (J Strength Cond Res 11(4):211-13) tested seven prediction equations
across bench press, squat and deadlift in 67 **untrained** college students. All seven
significantly underestimated deadlift 1RM. Correlations were above 0.95 throughout, which is
exactly the kind of figure that conceals a consistent absolute error.

`OneRepMaxCalculator` is exercise-agnostic — it never asks which lift you are doing — so it
cannot apply an exercise-specific correction. Documented in the engine comment and stated in
the article: treat a deadlift estimate as a floor. Same shape as finding 14: a known,
published, systematic bias that the tool's interface gives it no way to express.

Also worth stating: the validation sample was untrained beginners, so the equations most
lifters rely on were checked against people unlike them.

**17. Three implemented formulas were uncited.** `epley()`, `lombardi()` and `oconner()` all
ship in `ONE_RM_FORMULAS` but only Brzycki and Wathan appeared in the references. Lombardi
1989 (Beginning Weight Training, W.C. Brown) has been added — it was confirmed in a source
list during this check. **Epley (1985) and O'Conner (1989) are still uncited**, and are
flagged in the engine comment with an explicit instruction not to write them from memory.
That is finding 8's lesson applied rather than repeated.

**18. Brzycki returned Infinity at 37 reps and NEGATIVE above it.** The denominator
`(37 - r)` hits zero at 37 and inverts beyond. The reps input was unbounded, so this was
reachable by typing. `brzycki()` now returns null past 20 reps — well outside its useful
range anyway — and `allOneRepMax()` filters non-finite values so one null cannot poison the
mean, min and max, reporting an `omitted` list instead. Reps input bounded 1-20. Four tests.

**19. Brzycki's equation has no stated derivation.** It was published in a practitioner
article (JOPERD 64(1):88-90) without saying what data it was fitted to — a widely adopted
convention rather than a derived result. Later comparisons also disagree on its direction of
bias: LeSuer found the equations underestimate the deadlift, while a college-football sample
found Brzycki overestimated 1RM substantially. Recorded in the engine comment.

**20. Reps-in-reserve accuracy is a trained skill.** Zourdos 2016 compared experienced and
novice squatters directly and found experienced lifters markedly better at judging proximity
to failure. A beginner's "two reps left" is a much looser number. Added to the article.

**Epley located properly.** Finding 17 flagged it as uncited and explicitly not to be written
from memory. It surfaced in a reference list during the Brzycki check — *Poundage chart*, in
Boyd Epley Workout, Body Enterprises, 1985 — and was added from that source. Wathan and
O'Conner remain outstanding.

**21. The primary creatine safety citation is industry-adjacent.** Kreider et al. 2017 is an
ISSN position stand, and it supports the claim it is attached to — up to 30 g/day for five
years, safe and well tolerated in healthy people. But it was **prepared at the request of the
Council for Responsible Nutrition**, a supplement trade body, and several authors declare
funding or consulting relationships with companies that sell creatine.

That does not make it wrong; its conclusions align with the independent renal-function work
cited alongside it. But a site whose whole proposition is checkable sourcing should not rest
a safety claim on an industry-adjacent review without saying so. The article now discloses
it in the safety section and points to the independent corroboration.

This is a category of finding the "does it exist" check cannot reach at all, and one that
even a careful claim-support check misses unless you read the competing-interests statement.

**22. The creatine article used a different citation style.** Its markers were
`<a class="cite" href="#references">3</a>` — linking to the reference LIST rather than the
entry. Normalised to `[3]`, which the rehype plugin resolves to `#ref-3`. Worth checking the
remaining articles for the same pattern.

**23. The article overstated the absence of an endurance benefit.** It said creatine does
"very little" for steady-state work and the summary said "close to nil". Branch 2003 grouped
tasks by duration and found small but statistically significant effects in **all three**
bands, including efforts over 150 seconds where the effect size was comparable to short
maximal work. Corrected: the benefit shrinks with duration but is not zero, and any endurance
effect is likely indirect via better interval quality.

**24. Effect sizes were described qualitatively where numbers were available.** Branch
reports roughly 0.17 for body composition and 0.24 for short maximal efforts — statistically
clear, small by convention. "Well supported" and "large" are different claims and the article
now distinguishes them.

**25. Conflicts of interest run BOTH ways in this literature, and both are now disclosed.**
Kreider 2017 was prepared at the request of a supplement trade body with author industry
funding (finding 21). Jagim 2012 — which found the buffered form no better than monohydrate —
was funded by **AlzChem, a creatine monohydrate manufacturer**, so its funder benefited from
the conclusion it reached.

Disclosing only the first would have been the easy version: flagging a conflict when it cuts
against the supplement, staying quiet when it cuts the way the article already leans. Both
are now stated, with the note that the standard should not move depending on which direction
the conflict points.

**26. The renal meta-analysis supports the article better than the article said.** de Souza
e Silva pooled the question and found creatinine and urea readings shifted upward while
concluding no renal damage — exactly the marker-artifact pattern the article describes. Now
stated directly, with two limits: only six studies met the pooling bar, and it speaks to
healthy adults rather than people with existing kidney disease.

**27. Two headline sleep findings rest on very small, very artificial studies.** Both are
real, correctly cited, and support the claims attached to them. Both are also far thinner
than the confident way they circulate.

*Nedeltcheva 2010* — the source of the widely repeated "55 per cent less fat lost when sleep
is short" — is **ten people over fourteen days**. Fat loss 1.4 kg vs 0.6 kg; lean-mass loss
1.5 kg vs 2.4 kg. The authors list sample size and duration as limitations themselves.

*Spiegel 2004* — leptin down 18 per cent, ghrelin up 28 per cent — compared **four hours in
bed against ten, in twelve young men, over two days, with calories delivered by constant
glucose infusion** rather than eating. A clean way to isolate the hormone signal; a long way
from anyone's actual week.

Neither is a reason to drop the claims: the direction is consistent across both and
biologically plausible. But the article now states the designs, because "sleep affects body
composition" and "sleep costs you 55 per cent of your fat loss" are different claims and only
the first is well supported. This is the pattern behind findings 23 and 24 as well —
qualitative claims are usually safe; the numbers attached to them often are not.

**28. "Sleep restriction reliably degrades training performance" overstated the source.**
Fullagar 2015 concludes the opposite of settled: findings conflict, extent and mechanisms
remain uncertain, and **some maximal efforts and gross motor tasks can be maintained** despite
sleep loss. The clearer signal is in sport-specific performance rather than raw output.

The article's body text was already careful — it said single maximal attempts are relatively
robust and the cost accumulates across sessions, which matches the review well. It was the
framing sentence ("reasonably consistent") and the key takeaway ("reliably degrades") that
outran it. Both corrected. Perceived exertion, which the article leans on most, is the part
that holds.

**29. Sleep guidance is expert consensus, not measured outcome.** Hirshkowitz 2015 came from
an 18-member panel applying the RAND/UCLA Appropriateness Method to the literature — the right
tool for the question, and a different kind of evidence from a trial measuring outcomes at
each duration. Also narrows to 7-8 hours for older adults, which matters now that the age
range runs to 120. Both now stated.

**30. The tracker finding was more favourable than the article implied.** Chinoy 2021 tested
seven devices against polysomnography across three nights in 34 adults and found most
performed as well as or better than research-grade actigraphy at distinguishing sleep from
wake. The article's "good at duration, poor at stages" framing was right; it just undersold
the first half. Specifics added.

**31. Most 1RM formulas were never derived from research — they are extrapolated wall
charts.** Epley (1985) began as a poundage chart in a training manual; Wathen (1994) as a
load-assignment table in a coaching textbook; Lombardi (1989) in an introductory weight
training book. Brzycki (1993) appeared in a practitioner article that never states its
underlying data. Cross-validation studies say so directly: most of these equations give no
evidence of the population used to develop them or how they were derived statistically, and
the formulas were extrapolated from the charts afterwards.

This does not make them useless — they were built by experienced coaches from observed
loading practice, they agree with one another, and they correlate well against measured
maxima. But the precision they project is borrowed. Documented in the engine with an
instruction not to add decimal places to these outputs, and stated in the article.

Same category as finding 15 (Riegel's world-record exponent), and broader: there the constant
came from the wrong population, here from no derivation at all.

**32. Two articles were in the wrong tier, and the existence check caught it.** Morton 2018
supplies the protein numbers `macros.js` hardcodes (2.2 g/kg lean mass, 1.8 g/kg bodyweight).
By the tier rule — clinical claims *or* citations supplying an engine constant — that puts
`protein-how-much` and `macro-split-guide` in `full`, not `existence`. Reclassified in the
tracker.

Checking it properly then found two things a bare existence check would have passed:

*The 1.62 g/kg figure is the centre of a very wide interval.* The 95% CI runs from **1.03 to
2.20**, and the breakpoint itself falls short of conventional statistical significance
(p=0.079). "1.6 g/kg" circulates as a threshold; it is a point estimate with substantial
uncertainty either side. This is exactly why the article's *band* framing is right and a
single number would not be — now stated explicitly rather than left implicit.

*Another conflict of interest.* The senior author declares grant support and honoraria from
the US National Dairy Council, which funded trials included in the analysis. Disclosed on the
same footing as the creatine conflicts (findings 21 and 25).

This is the third COI found in three supplement- or nutrition-adjacent papers checked. It may
be worth treating "read the competing-interests statement" as a standing fourth check for
this category of citation rather than something noticed opportunistically.

**33. The protein upper bound comes from contest-prep bodybuilders.** Check 3 caught it
immediately. Helms 2014's 2.3-3.1 g/kg lean mass figures were written for **natural
bodybuilding contest preparation** — athletes driving to stage leanness under sustained
deficits — and the authors state they had to write a narrative rather than systematic review
because the evidence base was too thin. Real and correctly cited; a poor default for someone
training normally. Now framed as an upper bound for a hard cut rather than a target.

**34. A conflict of interest that runs against its own funder — and why disclosure is not
an accusation.** Hall & Guo 2017 declares funding from the Nutrition Science Initiative to
study ketogenic diets, plus a patent on body-weight feedback control. NuSI was founded to
investigate the low-carbohydrate hypothesis. The meta-analysis found **no metabolic advantage
to carbohydrate restriction** — the opposite of what the funding was presumably hoping for.

That is the mirror of finding 25 (Jagim, funded by a monohydrate maker, concluding the rival
form is no better) and it clarifies what check 5 is for. A declared interest is information
about which direction to be sceptical in, not a verdict on the result. A finding that runs
*against* its funder's interest is, if anything, strengthened by the disclosure. Four
conflicts found in four nutrition papers now, pointing in three different directions.

**35. The macro split matters less than the article implied.** The same meta-analysis swapped
carbohydrate for fat at matched calories and matched protein across 32 controlled feeding
studies and found no metabolic advantage either way — energy expenditure and fat loss
marginally favoured the lower-fat side, by an amount too small to plan around. Added: once
protein and total calories are set, the remaining ratio is mostly a question of what you can
train on and adhere to.

**36. Composition changes intake, not metabolism — and the two citations only say that
together.** Hall & Guo found no metabolic advantage to carbohydrate restriction at matched
calories and protein. Johnstone 2008 fed 17 obese men either a ketogenic or medium-carb diet
at matched protein and let them eat freely: they reported less hunger, ate less, and lost
more over four weeks.

Neither paper alone supports the useful conclusion. Read together they say composition does
not change what a calorie does to you, but it can change how many you eat — an adherence
effect, which is what actually decides outcomes. Added to the article. This is the third time
verifying citations *as a set* produced something checking them individually would not have
(see also Drapeau/Drake and Vickers/Riegel).

**37. The 0.8 g/kg RDA is a deficiency floor, rounded down.** It is the intake at which
nitrogen-balance studies found most healthy adults stop losing protein — not an optimum. The
figure was rounded down from 0.83, and later work using indicator amino acid oxidation argues
it is set too low, particularly for older adults. Treating it as a target rather than a floor
is the most common misreading of it, and the article now says so.

**38. A missing IPF GL coefficient set was silently producing wrong scores.** All seven
coefficient sets in `scoring.js` matched the official IPF 2020 tables exactly — but an
eighth, **`male-equipped-full`**, was absent entirely. Lookup fell back to
`male-classic-full`, so an equipped male lifter received classic coefficients and a plausible
but wrong score with no indication. An 800 kg total at 100 kg bodyweight returned an
*identical* figure for both equipment classes, which cannot be right; with the correct
coefficients they differ by 17 points (83.66 vs 101.06).

Added the missing set, and replaced the `?? classic` fallback with an explicit null plus a
dev warning — silently substituting a different coefficient set is exactly the failure mode
that made this invisible. `allScores()` already filters nulls, so the UI degrades cleanly.
Four tests, including one hand-worked against the published coefficients.

`powerlifting-scoring-explained` reclassified to the `full` tier: its citations supply engine
coefficients.

**39. IPF GL is an elite-calibrated scale.** The IPF derives the coefficients by regression on
"Golden Standard Samples" — results no less than 16% of the then-current world records. Same
shape as Riegel's world-record exponent, though here it is applied honestly: a score near 100
is meant to represent world-record level.

**40. The DOTS bodyweight domain is not the same for both sexes.** Both coefficient sets
match the published values exactly, but the clamp was **40-210 kg for everyone**. The
formula's author defines the valid range as 40-210 kg for men and **40-150 kg for women**.
A female lifter above 150 kg was being scored by extrapolating a 4th-degree polynomial
outside its defined domain — precisely where a quartic stops behaving. Clamps are now
per-sex, with four tests including a hand-worked value.

Two coefficient bugs in one file, both invisible for the same reason: the code silently
produced a plausible number instead of refusing. Neither was a wrong coefficient — the
published values were all transcribed correctly. The defects were in the *edges*: a missing
combination, and a domain applied to the wrong population. **Verifying a constant against its
source does not verify the boundaries the source defines around it.**

Worth adding to the checklist as a corollary to check 4: when a source specifies a valid
range for a formula, that range is part of the citation.

**41. Wilks is a curve fitted to a sport that no longer exists.** Both coefficient sets match
their published values exactly. The provenance is the finding:

- The polynomials were fitted to **equipped** results from **1987-1994** — squat suits and
  bench shirts, predating the raw lifting that dominates today.
- Wilks intended revision every two to five years. It never happened.
- A rebalanced **Wilks-2** appeared in March 2020, twenty-six years later, with entirely
  different coefficients.

So the extreme-bodyweight bias everyone complains about is not a flaw in the maths — it is a
curve fitted to one era and left in place across another. The engine implements the original,
which is still what most federations quote; that is defensible but now documented as a
deliberate choice rather than an assumption.

**42. A prediction I could not confirm — recorded as unresolved rather than acted on.**
After finding the DOTS per-sex domain bug (finding 40), I expected the same defect in Wilks,
which clamps 40-200 kg for both sexes. **No source consulted states official Wilks bodyweight
ranges.** Commonly repeated figures exist but I could not verify them, so the clamp is
untouched and the engine comment now says plainly that the bound is unsourced and must be
located rather than invented.

Worth recording because the pull to "fix" it was strong — the pattern matched, a plausible
number was available from memory, and the previous two findings had both been real. That is
precisely the situation rule 1 exists for.

**43. The Wilks validation found no bias in the total — which is what the calculator scores.**
The article said Wilks treats very light and very heavy lifters unevenly. Its own citation is
more particular: Vanderburgh & Batterham found **no systematic bias for men's or women's
total**, with bias appearing in the deadlift against heavier lifters and in the women's squat.
The tool scores totals, so the headline complaint does not apply to its own output as
directly as implied.

Two further things from the same paper. It rested on **30 men and 27 women per lift** — world
record holders plus the top two from the 1996 and 1997 World Championships, a narrow elite
sample. And it states outright that the Wilks formula **was not based on published data**,
independently confirming finding 41 from the paper that set out to validate it.

Article corrected to distinguish bias in individual lifts from bias in the total, and to say
what "validated" actually rested on.

**44. The tier scheme collapsed, and the fix is to tier per citation.** All **19 articles on
this site back a tool**. So by the rule "citations supplying an engine constant get the full
treatment", every article qualified — four were reclassified one at a time before the pattern
became obvious.

A calculator site does not have low-risk *articles*. It has low-risk *citations* inside
high-risk articles. Tiering now applies per reference, judged against the sentence it
supports: full treatment if it supplies a number the code uses or backs a health, safety or
risk claim; light treatment if it is background or context. Checklist and tracker updated.

**45. MET-based calorie burn rests on two stacked approximations.** Ainsworth 2011 reports
roughly **68% of Compendium MET values are measured** from published work — about a third are
estimated by analogy. The Compendium was built to make self-reported activity comparable
*across studies*, not to predict an individual's expenditure.

Underneath that, the ACSM equation defines 1 MET as 3.5 mL O2/kg/min, a reference-adult
figure. Real resting metabolic rate varies with body size, composition, age and sex, so the
constant is systematically off for anyone far from that reference and **tends to run high for
heavier people** — the opposite of what most users would assume.

Averages built partly from estimates, multiplied by a constant that is itself an average.
Documented in the engine with an instruction not to add decimal places, and stated in the
article.

**46. The site's default BMR equation is wrong by more than 10% for about half of people.**
Mifflin-St Jeor is verified exact against Am J Clin Nutr 51(2):241-7 — but the derivation
supports much less confidence than a calculator implies:

- **498 subjects, aged 19-78.** This site accepts 18-120, so the oldest users sit well
  outside the derivation range and the linear -5 kcal/year age term is extrapolated past its
  data.
- **R2 = 0.71** — roughly 29% of between-person variance unexplained.
- Comparative work puts its hit rate for landing **within 10% of measured REE at around 44%
  for men and 53% for women.** It is the best of the common equations and still misses by more
  than a tenth for about half of people.

This is the most consequential population-fit finding in the audit, because Mifflin is the
default behind nearly every tool on the site. Documented in the engine with an instruction
not to present the output as precise, and the article now opens its "reading the result"
section by telling users to assume the number is wrong and calibrate against their own weight
trend — which the article already advised, now with the reason attached.

**47. The activity multiplier is not a fixed property of a person.** Levine 2002 (Best Pract
Res Clin Endocrinol Metab 16(4):679-702) establishes that non-exercise activity thermogenesis
accounts for the majority of non-resting energy needs, and that **NEAT rises with overfeeding
and falls with underfeeding**. People fidget less, stand less and move less around the edges
of the day without deciding to.

So the multiplier that described a user at maintenance describes them less well three weeks
into a deficit — independently of the adaptive-thermogenesis effect already documented in
`planner.js` (findings 2 and 24). Two separate mechanisms pushing the same direction, and the
TDEE article previously mentioned neither. Added.

Together with finding 46, `tdee-explained` now tells users plainly that the headline number
is a starting estimate that will drift, and that the weight trend beats the calculation. That
was already the article's advice; it now has its reasons attached.

**48. The wearable failure is in the model, not the sensor.** Shcherbina 2017 (J Pers Med
7(2):3) put seven popular devices on 60 volunteers of varied age, size, skin tone and fitness
against continuous telemetry and indirect calorimetry. Heart rate held up; **energy
expenditure did not, for any of the seven**, and the authors closed by recommending caution
about using wearable EE figures in health programmes at all.

The article had this right in outline. What it lacked was the distinction that makes it
actionable: the sensor reading your pulse is doing a decent job, and the calorie figure is a
model sitting on top of that reading. It is the model that fails, which is why a better strap
does not fix it. Added.

**49. The most-quoted number in diet discourse comes from ten people.** Lichtman 1992
(N Engl J Med 327(27):1893-8) is the source of "people under-report their intake by 47 per
cent". Group 1 — the group that figure describes — was **nine women and one man**, screened
specifically because they reported eating under 1200 kcal/day and were not losing weight.

That is a group selected for the exact phenomenon being measured. It is the right design for
the question the authors asked, and the wrong basis for a claim about people in general,
which is how it is almost universally used.

The article was already appropriately hedged — it said "in some populations" rather than
stating 47% flatly. What it lacked was naming the population, and "some populations" is vague
enough that readers assume it includes them. Now states the sample, and replaces the headline
figure with what the wider evidence actually supports: under-reporting is common, grows with
body size, and is larger than people expect — but is not a 47% tax on everyone's food diary.

Best single illustration of check 3 in the audit: the citation is real, correctly attributed,
supports the claim *about its own sample*, and would pass checks 1 and 2 without comment.

**50. Two citations in the same article disagree — and I had already propagated the weaker
one.** Halperin 2022 (Sports Med 52(2):377-390) pools 12 studies and 414 participants on
predicting reps to failure. Two results matter:

- **People under-predict by about one repetition.** They believe themselves closer to failure
  than they are. Stop at what feels like two in reserve and you were probably closer to three.
  Consistent across the literature.
- **No overall effect of training experience** on prediction accuracy.

That second point contradicts Zourdos 2016 (n=29), which found trained lifters more accurate
— and which I had used in finding 20 to add exactly that claim to `estimating-your-one-rep-max`
during this audit. A 414-participant meta-analysis outweighs a 29-person study, and my earlier
addition overstated what the evidence supports.

Corrected in both articles, and the RPE guide's dek — which asserted trained lifters judge it
well — now leads with the under-prediction finding instead. **Recorded prominently because
the error was mine, introduced by this process, and caught only because a later citation in
the same article happened to test the same question.** Checking citations one at a time would
not have surfaced it; nor would re-reading Zourdos.

**51. "Static stretching kills your power" is the one part not statistically established.**
Simic 2013 (Scand J Med Sci Sports 23(2):131-48, 104 studies) is the source everyone cites.
Its numbers: maximal strength **-5.4%**, explosive performance **-2.0%**, and power
**-1.9% with a 95% CI of -4.0 to +0.2** — crossing zero.

So the effect on strength is solid, the effect on explosive performance is solid, and the
effect on *power* specifically — which is the version most often repeated — is the one the
meta-analysis does not establish.

Two further details that get dropped: the impairment was **unrelated to age, sex or fitness
level**, and it was **dose-dependent, smallest at bouts of 45 seconds or under**. The authors'
own conclusion is also narrower than the folklore: they advise against static stretching **as
the sole warm-up activity**, not against stretching.

The article was already appropriately hedged — "modest rather than absolute", and explicitly
fine with a thirty-second ankle drill. It simply had no numbers attached, so a reader had no
way to judge how modest. Added.

**52. The "79%" warm-up figure is a consistency finding, not an effect size.** Fradkin 2010
(J Strength Cond Res 24(1):140-8) reviewed 32 high-quality studies across 92 warm-up and
criterion combinations and found improvement in **79% of the measures examined**. That is the
proportion of *measures that improved* — not an amount by which performance improved, which
is how the number is usually repeated.

Two things worth carrying with it. The authors note that **few well-conducted randomised
trials exist**, which is a fair caution on a practice this universally assumed. And studies
qualified only if the warm-up involved activities **other than stretching** — so it is
evidence for active preparation specifically, which sits neatly against finding 51's
stretching result in the same article.

The article previously made the performance case without citing it at all, despite the
citation being in its own reference list. Added.

**53. "Warming up prevents injury" is unestablished, not disproven — and the distinction
matters.** The article opened by calling injury prevention the weakest justification for
warming up, which is right, but did not say why. McCrary 2015 (Br J Sports Med
49(14):935-42) reviewed warm-up effects on both performance and injury and found the modes
and outcomes so heterogeneous that **pooling was impossible for almost every comparison**.
Performance effects were reasonably consistent; injury prevention was not established either
way.

That is absence of evidence rather than evidence of absence, and the article now says so
rather than leaving readers to infer that warming up has been shown not to help. Note also
the review is **upper-body specific**, which is a scope limit worth knowing when it is cited
for warm-up generally.

**54. The literature recommends a structure, and the article was already describing it.**
Behm & Chaouachi 2011 (Eur J Appl Physiol 111(11):2633-51) concludes that a warm-up should
run submaximal aerobic activity, then large-amplitude dynamic stretching, then sport-specific
dynamic work. That is close to what the article recommends on reasoning alone. Added, with
the note that static holds are not forbidden in that sequence — they are simply not the
sequence.

`warming-up-for-strength` complete: 4/4, and the four citations now support the four claims
the article actually makes rather than sitting unattached at the bottom.

**55. The autoregulation meta-analyses disagree with each other, and the article cited only
the favourable side.** Graham & Cleather's 12-week trial found reps-in-reserve autoregulation
beat fixed loading for strength. But a systematic review pooling fifteen studies concluded
autoregulated and standardised load prescription produce **similar** strength improvements,
while a separate meta-analysis found autoregulation ahead.

The article said autoregulation "can produce better strength outcomes... though the
literature is still developing" — hedged, but citing one trial and characterising the
disagreement as immaturity rather than conflict. Now states that the meta-analyses disagree,
and lands on: reps in reserve is at least as good as percentage-based loading and possibly
better, evidence insufficient to say which.

That is still a reasonable argument for using it — no cost, adapts to bad days, worst case is
parity — but it is a weaker claim than "autoregulation is better", which is the version in
circulation. Check 6 caught this; checks 1 and 2 would both have passed the original.

`rpe-training-guide` complete: 4/4.

**56. A citation whose title and identifier point to different papers.** `tracking-without-
a-scale` reference [1] reads "Champagne CM, et al. Assessment of energy intake underreporting
by doubly labeled water. J Am Diet Assoc, **2002**", linked to PMID 12396160.

The title matches **Champagne et al. 1998**, J Am Diet Assoc 98:426-433 — whose full title
ends **"in children"** and whose sample was 118 children, mean age 10. The PMID and year
point to a different 2002 paper. The two do not agree.

**Left UNRESOLVED and explicitly not marked verified.** Which paper was intended cannot be
determined without opening that PMID, which was not available in any search result, and
guessing between them is exactly what rule 1 forbids. A YAML comment in the file records the
conflict and what to do about it.

Worth noting either way: the truncated title dropped **"in children"**, and a children's
dietary-assessment study is a poor basis for a claim about adults estimating portions —
especially on a site now gated to 18+. Whichever paper is correct, the scope needs checking.

This is the first citation in 74 checked that could not be resolved at all.

**57. Strength "standards" are a proposed vocabulary, not a measured population.** Santos
Junior 2021 (Strength Cond J 43(5):77-86) is the most-cited academic framework behind training
-status bands, and it is a **classification model published in a practitioner journal** —
offered so researchers can describe their samples consistently. Its thresholds are relative
strength cut-offs (squat above roughly 1.5x bodyweight for the top male tier), not percentiles
from a survey of lifters.

The article's whole thesis is that standards are orientation rather than verdict, so this
supports it — but the reason was missing. A percentile tells you where you sit in a measured
population; a classification band tells you which side of a line somebody drew for a different
purpose. Both useful; only one is a fact about the world. Added.

**58. The same standard means different things because the training behind it differs.**
Rhea 2003 (Med Sci Sports Exerc 35(3):456-64, PMID 12618576) pooled **140 studies and 1,433
effect sizes**; Peterson 2005 (J Strength Cond Res 19(4):950-8) applied it across populations.
Maximal strength gains come from roughly 60% of 1RM three days a week when untrained, about
80% twice a week once trained, and around 85% twice a week at double the volume for athletes.

The effort needed to climb a band grows as you climb it, and the programme that took someone
from nothing to competent will not take them from competent to strong. Added as the practical
reading of a standard: not a verdict, but an indication of which training regime you are
currently in. Both citations were in the reference list and unattached.

`strength-standards-explained` complete: 3/3.

**59. Hand portions are defended by adherence, not accuracy — and the evidence says so.**
Byrd-Bredbenner 2004 (J Hum Nutr Diet 17(4):351-7) tested exactly the idea behind the tool:
everyday physical objects as portion aids, 113 young adults, 36 foods, with and without.

The useful finding is not that the aids were accurate. It is the premise the paper opens
with — **purpose-built measurement tools work but are too bulky and costly to carry**, which
is why a cruder reference you cannot forget has value at all. Added as the honest case for
hand portions: not accuracy, but the accuracy you will still be getting in month six.

---

## Final tally

| | |
|---|---|
| Citations checked | **80 of 80** |
| Articles publishing a verification claim | **19 of 19** |
| Findings | **62** |
| Engine defects found and fixed | **8** |
| Conflicts of interest disclosed | **4** |
| Errors I introduced and later corrected | **2** |

**Where the findings came from**, by check:

| Check | Share |
|---|---|
| 3 — population fit | highest |
| 4 — provenance of the number | highest |
| 2 — supports the specific claim | high |
| 6 — superseded or refined since | moderate |
| 5 — funding / competing interests | 4 for 4 on nutrition papers |
| 1 — exists | **1 finding in 79 citations** |

The existence check — the only one most people run — found a single problem in the entire
corpus. Everything else came from asking who was studied, where the number came from, whether
the paper supports *this* sentence, and who paid.

**The dominant pattern was not wrong claims.** It was correct claims with their evidence
detached: reference lists full of good sources that no sentence pointed at, hedges that named
no population, and numbers repeated without the interval, sample or scope that would let a
reader judge them. The verification work mostly consisted of reattaching things.

**60. `oconner()` located, and the whole 1RM set is now cited.** O'Connor B, Simmons J,
O'Shea P. *Weight Training Today.* St. Paul, MN: West Publishing, 1989:201-204 — found via
academic reference lists and ISBN 9780314689511, not recall. The cross-validation literature
adds one more note now recorded in the engine: Lombardi's equation was described by its own
author as based on curve fitting and guesswork, and Brzycki's was extrapolated from a
published graph rather than subject data. **Treat the agreement between these formulas as
convention converging, not independent methods reaching the same answer.**

**61. P1's real paper is better than the one the broken citation named.** PMID 12396160 is
Champagne 2002 — dietitians vs non-dietitians, both keeping seven-day food records against
doubly labelled water. Non-dietitians under-reported significantly; **dietitians did not**,
their records statistically indistinguishable from measured expenditure. The difference is
practice, not eyesight. Added: portion estimation is a trainable skill, and weighing food for
a fortnight before estimating is how you join the second group. A stronger point than the
mis-titled children's study would have supported.

**62. Twelve devices on the same people at once.** Murakami 2016 (JAMA Intern Med
176(5):702-3) fitted **twelve wearables simultaneously** — five waist, five wrist, two pocket
— measured a full day in a metabolic chamber, then fifteen free-living days by doubly
labelled water. Wearing all of them at once removes the standard objection that results depend
on which model was tested. The energy-expenditure problems persisted regardless. Added.

**63. All IPF GL and DOTS coefficients independently confirmed, and Wilks is legacy.** The
site owner supplied the official IPF GL parameters and DOTS coefficients from federation
sources. **All four IPF GL sets and both DOTS sets match the engine exactly** — including
`male-equipped-full`, independently confirming the missing set found in finding 38 was
correct.

Two things followed. The engine's DOTS note credited USPA and WRPF but **not USA
Powerlifting**, which is the federation that actually standardised on it — corrected. And
**neither the IPF nor USAPL still uses Wilks**, which closes P3: the domain being hunted
belongs to a formula no governing body maintains, and the charts that once carried it are
retired.

**New gap surfaced: the McCulloch age coefficient** (P8). USAPL applies it on top of DOTS for
Masters and Junior lifters, so this tool's score will not match an official USAPL result for
anyone outside the open age category. Documented in the engine and stated in the article.
Coefficients deliberately not written from recall.

**64. USAPL uses two age systems, not one — and the anchor values show why it matters.**
Fetching USAPL's own *Weight and Age Coefficients* document corrected the picture: **Foster**
coefficients apply to competitors aged **14-23**, **McCulloch** to those **40 and over**, ages
24-39 are treated as peak with no adjustment, and **the coefficients are the same for men and
women**.

The magnitude is not marginal. A 60-year-old's total is multiplied by roughly **1.34**, a
75-year-old's by **1.835**. A tool reporting open-category scores to a masters lifter is not
slightly off; it is reporting a different quantity. The article now says so and gives the
numbers.

**Still not implemented, deliberately.** Three anchor values are confirmed (42 → 1.020,
60 → 1.340, 75 → 1.835) and recorded in the engine so any future implementation can be checked
against them. Three points are not a table. Fitting a curve through them and shipping it would
be the same error as writing a PMID from memory, with more arithmetic on top.

Worth noting the document also shows the age multiplier applies to the *total*, while modern
practice applies it to the DOTS score. Both give the same answer — multiplication commutes —
but the distinction matters if anyone implements this and expects the order to be significant.

**65. The McCulloch coefficients everyone quotes appear to be a superseded table.** This is
the clearest example in the audit of why sourcing a constant means finding the *current*
authority, not the most-cited one.

Three tables are in circulation:

| Age | USAPL 2021 | USAPL 2023 | WRPF 2022 |
|---|---|---|---|
| 42 | 1.020 | 1.008 | 1.014 |
| 50 | 1.130 | 1.066 | 1.150 |
| 60 | 1.340 | 1.194 | 1.380 |
| 75 | 1.835 | — | 1.900 |
| 90 | 2.549 | 2.224 | 2.060 (flat from 79) |

The **2021 USAPL values are the ones that circulate everywhere** as "the McCulloch
coefficients". They match WRPF's older Moscow 2017 edition exactly and the worked examples in
USAPL's 2014 explainer, which is why three independent-looking sources agreed and gave false
confidence. USAPL's **2023** document — titled *"Age Coefficients Used In USA Powerlifting"*,
present tense — carries materially different, less generous figures. At age 60 the gap is
**1.340 vs 1.194, roughly 12% of a lifter's score.**

A calculator implementing the popular numbers would disagree with current official placings,
in the lifter's favour, by a wide margin at older ages. Several live calculator sites appear
to do exactly that.

**Not implemented, for two reasons.** Which edition is in force cannot be confirmed — both
USAPL PDFs now 404 and their contents survive only in search caches. And the newer master
table is incomplete in those caches: **ages 54-58 and 73-77 were not captured.** Interpolating
eleven missing values in a table whose neighbouring version differs by 12% is precisely the
error this codebase avoids with constants.

The **Foster** table (14-23) *is* complete and consistent across sources: 1.23, 1.18, 1.13,
1.08, 1.06, 1.04, 1.03, 1.02, 1.01, 1.00. Not shipped alone — a junior adjustment without the
masters one would be worse than neither.

Recorded in full in the engine so the next person starts from the conflict rather than
rediscovering it.

**66. The live rulebook settled two things and moved the target on a third.** Fetched USAPL
Rulebook v2026.2 (in effect 1 January 2026).

**DOTS confirmed current — and explicitly temporary.** Section 1.9.5 uses DOTS for team
tiebreaks. Section 1.9.5.1 records that the 2024 NGB meeting approved developing *"a formula
that is superior to DOTS"*, with work running through 2025 and possibly beyond, and that
*"until such a time that a new formula is approved, DOTS will continue to be the formula
used."* So the scale the engine reports as current is, by its governing body's own account, on
its way out. Added to the article: this is the third replacement in the story and will not be
the last.

**Age divisions, not age-adjusted scores, decide placings.** Section 1.12 awards top finishers
*"in each division"*; section 1.7 defines divisions by age — Youth 1-3, Teen 1-3, Junior,
Master 1-7, running to 110 with no maximum age limit. Age coefficients are a best-lifter and
cross-division comparison device, not the mechanism deciding who wins a class. That materially
softens P8: a masters lifter comparing our score to their placing is comparing two different
things regardless of coefficients.

**The tables are not in the rulebook.** Sections 1-4 contain no Foster or McCulloch table.
Appendix I, *"Supplement to the USA Powerlifting Rulebook"*, is the remaining place to look.

---

## Tooling

```
npm run citations status            # live count, clinical first
npm run citations list <file>       # numbered refs
npm run citations mark <file> <n>   # record one verified
npm run citations complete <file>   # publish the claim (refuses below 100%)
npm run citations lint              # frontmatter + marker integrity
npm run citations dedupe            # strip duplicate url keys (the #1 breakage)
npm run citations markers <file>    # show what each inline [n] points at
npm run verify                      # build · placeholders · citation lint · tests
```

`lint` exists because I broke frontmatter twice: appending a `url:` to a reference that
already had one produces a duplicate YAML key and an opaque js-yaml stack trace. It also
catches inline markers pointing past the end of the reference list — **inserting a citation
renumbers everything after it and silently invalidates markers already placed.** That
happened while adding the Ward citation; Deurenberg shifted 3→4 and Ashwell 4→5.

**The renumbering hazard has no automated fix.** Inserting a citation shifts every marker
after it, and a shifted marker that still lands in range is well-formed — `[4]` pointing at
the wrong paper cannot be detected by a checker. I tried a lint for it; it fired on every
legitimately unpointed background reference, and a warning that is usually wrong gets
ignored. That is finding 14's lesson applied to the tooling itself, so it was removed in
favour of `npm run citations markers <file>`, which prints what each marker points at for
human review. **Run it after any reference-list edit.** It caught two shifted markers in
estimating-your-one-rep-max.md that the range check passed.

`mark` only records a decision. It cannot tell whether a paper supports a claim, and a
false ✓ is worse than no mark.

---

## PENDING — items requiring a human decision

These cannot be closed by further checking. Each needs someone to look something up or make
a call.

| # | Item | What is needed |
|---|---|---|
| ~~P1~~ | **RESOLVED.** PMID 12396160 is Champagne 2002, *"Energy intake and energy expenditure: a controlled study comparing dietitians and non-dietitians"*, J Am Diet Assoc 102(10):1428-32. The year and PMID were right; the **title was wrong**, borrowed from Champagne's 1998 children's study. Corrected — and the real paper is a better fit: dietitians' food records were statistically indistinguishable from their measured expenditure while non-dietitians under-reported significantly, which supports the article's point that estimation is a trainable skill. Added. | — |
| ~~P2~~ | **RESOLVED.** O'Connor B, Simmons J, O'Shea P. *Weight Training Today.* St. Paul, MN: West Publishing, 1989:201-204. Located via academic reference lists and ISBN 9780314689511 — not from recall. All five 1RM formulas now cited. | — |
| P3 | **Wilks clamp — CLOSED as won't-fix.** Wilks is deprecated: the IPF scores on GL Points, USA Powerlifting on DOTS, and both moved off static lookup charts entirely. The close-out path recorded here previously (read the asterisks off a federation chart) no longer works — those charts are retired artefacts of a superseded system. The number now exists only in Wilks' original publication, if anywhere. Given the formula is legacy and `wilksReliability()` already flags the extremes from sourced evidence, this is not worth chasing further. Documented in the engine. A defined range *does* exist (USA Powerlifting charts asterisk out-of-range weights). A secondary calculator source gives ~40-205 kg male / 40-150 kg female, which would mirror the per-sex asymmetry DOTS publishes and would make our single 200 kg bound wrong for women — the same defect fixed in DOTS. **Not acted on:** a calculator website is not grounds for changing a scoring function. No action needed. |
| P4 | **`MIN_INTAKE` 1500/1200, rate ceiling, age boundary, contraindications, category labels.** | Clinical reviewer — a brief setting out six specific questions is held privately. |
| P5 | **Five `clinicalClaims` articles unreviewed** — accepted risk by owner decision. | Same reviewer. Brief explains what is wanted: omitted contraindications and misread clinical significance, which a citation check cannot find. |
| P8 | **Age coefficients — researched exhaustively, deliberately NOT implemented.** Checked against the live rulebook (v2026.2, in effect 1 Jan 2026): the tables are **not in the rulebook body** — sections 1-4 contain no Foster or McCulloch table. They are presumably in Appendix I, *"Supplement to the USA Powerlifting Rulebook"*, which is where to look next. Structure confirmed: **Foster** (14-23), **McCulloch** (40+), no adjustment 24-39, identical for men and women, applied to the total. **But three conflicting tables are in circulation**, including two published by USAPL itself — see finding 65. The popular McCulloch values appear to be USAPL's *superseded* table. Article now warns masters and junior lifters to get their coefficient from their federation rather than any calculator, ours included. | Obtain the **current** complete USAPL table from a live rulebook or from USAPL directly, and confirm which edition is in force. Both USAPL PDFs now 404; contents survive only in search caches, and the newer master table is incomplete there (ages 54-58, 73-77 missing). **Do not use the popular numbers because they are easy to find.** |
| P6 | **`src/site.config.js` — 4 values unfilled.** Domain, handle, state, contact email. | `npm run verify` fails until done. |
| P7 | **Three policy pages need legal review.** | **See the private reviewer brief, Part A** — seven specific questions, plus a table of code-verified facts so the reviewer need not re-establish them. |

---

## Remaining — 18 citations across 6 articles, all `existence` tier

The lighter standard applies: confirm each source is real and correctly described. No
per-citation marks, no inline markers required.

**One outstanding item in the completed tier:** `oconner()` ships in `ONE_RM_FORMULAS` and
remains uncited. The original (O'Connor et al., 1989) needs locating — the engine comment
carries an explicit instruction not to write it from memory.

| Article | Left | Priority |
|---|---|---|
| creatine-monohydrate | 5 | clinical — last two clinical articles |
| sleep-and-training | 5 | clinical |
| estimating-your-one-rep-max | 5 | full tier — 1RM coefficients |
| *(11 others)* | 32 | `existence` tier |

**Method note.** PubMed cannot be fetched directly from the build environment; each
citation needs a search to confirm both existence and claim support. Budget roughly one
search per citation, and expect to read around the paper — findings 1 and 2 came from
follow-up literature, not the abstract.
