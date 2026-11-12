# Citation review — RPE training guide (correction of 2026-11-05)

Article: `src/content/articles/rpe-training-guide.md`
Verified by: the AI drafting session, 2026-11-05 · Human review: Jonathan Morales approved the item 45
batch 5 changes on 2026-11-05; the wording below to be checked in the release previews.

References [1]–[4] were verified on 2026-08-27, before review records were kept. The article's chart
(`rpe-load`) drew on the calculator's old 12-rep RPE table, which matched no source read. The chart now uses
Helms et al. 2016's Table 2 (1–8 reps, RPE 7–10), and a new paragraph under it says where the table comes from.
New reference [5].

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

## Follow-up of 2026-11-11 (v2.38.9) — RPE Converter guide

The guide's "A common approach is to work at RPE 7–8 … Accumulating too many sets at RPE 10 builds fatigue faster
than it builds capacity" had no source. It now reports Helms 2016 (above): hypertrophy "primarily (but not
exclusively) using repetitions in the range of 6–12, with an RIR-based RPE of 8–10 (RIR 0–2)", failure "limited
to the final set performed for a given body part", "for main movements … RPE range of 6–8 (i.e., 2–4 RIR) may be
an appropriate strategy to avoid excessive muscle damage"; strength "1–6RM", "some training at an RPE 10", and
"caution is advised when training to failure regularly". Its accuracy note now uses Halperin 2022 and Zourdos
2016 (see `estimating-your-one-rep-max.md`).
