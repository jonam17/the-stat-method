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
