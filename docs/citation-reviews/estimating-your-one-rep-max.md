# Citation review — Estimating your one-rep max (correction of 2026-11-05)

Article: `src/content/articles/estimating-your-one-rep-max.md`
Also covers: the One-Rep Max calculator, the RPE Converter and the Progressive Overload e1RM limit.
Verified by: the AI drafting session, 2026-11-05 · Human review: Jonathan Morales approved the item 45
batch 5 changes on 2026-11-05; the wording below to be checked in the release previews.

References [1]–[8] were verified on 2026-08-25, before review records were kept. This correction replaces
three unsourced claims — "two to six reps" most reliable, accuracy "poor beyond twelve", and Wathan "tracks well
across the widest rep range" — plus the unsourced per-formula bias notes for Epley and Brzycki, and describes
the calculator's new RPE chart. New references [9] Reynolds 2006 and [10] Helms 2016.

**Changes:** takeaways 2 and 3; the formula list and a new paragraph; the rep-count paragraph; the accuracy
summary; the paragraph on the calculator's percentages; the bottom line; a changelog entry.

## Reynolds JM, Gordon TJ, Robergs RA. J Strength Cond Res 2006;20(3):584–592

**Read:** in full, from the PDF the maintainer supplied (University of New Mexico copy, 9 pages). Authors,
journal, volume and pages from the first page. **Type:** experimental study with a cross-validation group.
**Population:** 70 adults (34 men, 36 women, 18–69 years) of varied training experience, plus 20 for
cross-validation; chest press and plate-loaded leg press. **Interests:** none stated.

| Claim | Passage |
|---|---|
| ★ 5RM predicted 1RM best; accuracy worse from 10 and 20RM | Abstract: "the 5RM data produced the greatest prediction accuracy"; Discussion: "the most accurate prediction of strength occurred from a 5RM test, with the accuracy of prediction worsening with increasing repetitions to failure" |
| ★ No more than 10 reps in linear equations | Abstract: "no more than 10 repetitions should be used in linear equations to estimate 1RM for the LP and CP actions" |
| ★ Epley's and Brzycki's guidance is under 10 reps | Table 5 footnote: "Guidelines for authors' equations: Bryzcki and Epley = <10 reps" |
| Four of the five (not Wathan) checked on the 20-person cross-validation group, errors close | Table 5: Brzycki, Epley, Lombardi, O'Connor; 5RM chest press Sy.x 1.79, 1.85, 1.87, 1.79 kg; leg press 13.56, 14.05, 14.16, 13.56 kg. Wathan is not in the table |

## Helms ER, Cronin J, Storey A, Zourdos MC. Strength Cond J 2016;38(4):42–49

**Read:** in full, from the PDF the maintainer supplied (open access, 8 pages). **Type:** practitioner
review column. **Interests:** "The authors report no conflicts of interest and no source of funding."

| Claim | Passage |
|---|---|
| ★ The chart's values (reps 1–8 × RPE 7–10) | Table 2, "Relationship with percentage 1RM, repetitions performed and RIR-based RPE" — whole-number rows copied into `src/engine/strength.js` and checked cell by cell in `strength-portions-mets-sources.test.js` |
| ★ Built from trained lifters' back squats; only three values measured | "based on the mean RIR-based RPE scores reported by the experienced squatters for the single repetition sets at 90 and 100% 1RM, and the 8 repetition set at 70% 1RM … Values for percentage 1RM repetition combinations besides [those] are estimations"; "this chart is based on the barbell back squat" |
| ★ Not an exact conversion; other lifts may differ | "should not be viewed as an absolute conversion tool"; "this relationship may change with machine-based, single-joint, or upper-body exercises" |
| RPE = 10 − RIR | Zourdos et al. 2016, Figure 1: "10 Maximum effort … 9 1 repetition remaining … 8 2 repetitions remaining … 7 3 repetitions remaining" |

---

## Follow-up of 2026-11-11 (v2.38.9)

Verified by: the AI drafting session, 2026-11-11 · Human review: Jonathan Morales approved the follow-up and
chose to keep the average as the calculator's headline (2026-11-11).

**Correction to the record above.** Batch 5 said no source supported Wathan as the best equation. [5] LeSuer
1997 had not been read then; it does (below). The headline stays the average: Reynolds (70 adults of mixed
training) did not test Wathan, and LeSuer's sample was 67 untrained students.

## [5] LeSuer DA et al. J Strength Cond Res 1997;11(4):211–213

**Read:** in full, from a scanned PDF the maintainer supplied (3 pages), via OCR checked against the page images.
**Population:** 67 untrained college students (40 men, 27 women) in weight-training classes; sets of 10 or fewer
reps. **Interests:** none stated.

| Claim | Passage |
|---|---|
| ★ Seven equations; 67 untrained college students | Abstract: "accuracy of 7 equations … Subjects, 67 untrained college students (40 M, 27 F)" |
| ★ Most accurate for bench, then squat; all underestimated the deadlift (9–14%) | Practical Application: "the formulas most accurately predicted the 1-RM bench press, followed by the squat and then the deadlift"; Results: deadlift "underestimated … by an average of 22.2 to 33.7 lbs (9-14%)" |
| Correlations above 0.95 | Abstract: "All correlation coefficients … were high (r > 0.95)" |
| ★ Calculator: Wathan (with Mayhew) closest for bench; only Wathan close for squat | Results: "only the Mayhew et al. (10) and Wathan (18) formulas … did not differ significantly"; "In the squat, only the Wathan (18) formula" |

## [8] Zourdos MC et al. 2016 — novices

| Claim | Passage |
|---|---|
| ★ 14% of novices vs 67% of experienced rated their 1RM a 10 | Discussion: "only 14.29% NS were able to record an RPE of 10, while 66.67% ES recorded an RPE of 10" |
| Novices may not reach a true 1RM | Practical applications: "experienced and novice lifters may not possess equal abilities to perform a true 1RM lift" |

Replaces the unsourced "Novice lifters often cannot express a true maximum because they lack the neural
efficiency and confidence … Their estimates commonly read higher".

## [11] Halperin I et al. Sports Med 2022;52(2):377–390

**Read:** in full, from the publisher PDF the maintainer supplied (14 pages; DOI on the first page). **Type:**
scoping review and exploratory meta-analysis. **Interests:** no funding; "declare they had no conflicts of
interest".

| Claim | Passage |
|---|---|
| ★ 12 studies, 414 participants | Abstract: "13 publications covering 12 studies, with a total of 414 participants" |
| ★ People under-predict by about one rep | Abstract: "participants tended to underpredict the number of repetitions to task failure by 0.95 repetitions (95% CI 0.17–1.73)" |
| ★ Training status made no clear difference | Abstract: "participants' training status did not seem to influence prediction accuracy" |
| More accurate closer to failure, ≤12 reps, later sets | Abstract: accuracy "slightly improved when the predictions were made closer to set failure … and when the number of repetitions performed to task failure was lower (≤ 12 repetitions …)"; "slightly increased accuracy in later sets" |

"So if you stop at what feels like two reps in reserve, you were probably nearer three" is the article's own
reading of the 0.95 average, kept as such. The RPE Converter guide's accuracy note now uses the same passages.
