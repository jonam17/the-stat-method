# Citation review — Why your watch overestimates calories burned (correction of 2026-11-05)

Article: `src/content/articles/calorie-burn-estimates.md`
Also covers: the Calories Burned calculator (`src/engine/cardio.js`).
Verified by: the AI drafting session, 2026-11-05 · Human review: Jonathan Morales approved the item 45
batch 5 changes on 2026-11-05; the wording below to be checked in the release previews.

References [1]–[4] were verified on 2026-08-27, before review records were kept. The calculator moved from
the 2011 to the 2024 Compendium; the article now says so. New reference [5].

## [5] Herrmann SD et al. 2024 Adult Compendium of Physical Activities. J Sport Health Sci 2024;13(1):6–12

**Read:** the paper in full (open access, 7 pages; DOI 10.1016/j.jshs.2023.10.010 on the first page), and the
full activity list (pacompendium.com PDF, 28 pages), both supplied by the maintainer on 2026-11-05.
**Type:** systematic update of a reference list. **Population:** adults aged 19–59.

| Claim | Passage |
|---|---|
| ★ Measured values for 912 of 1,114 activities | Abstract: "The 2024 Adult Compendium includes 1114 PAs (912 with measured and 202 with estimated" MET values) |
| ★ Calculator: kcal = MET × kg × hours | §2.5: METs are relative "to a standardized RMR of 3.5 mL/kg/min or approximately 1.0 kcal/kg/h" |
| Calculator: a starting point, not individual energy use | Discussion: "can serve as a starting point for prescribing individual activities but does not reflect precise individual EE values" |
| Calculator: adults aged 19–59 | §2.2: data "from participants with a mean age of 19–59 years" |
| ★ Calculator MET values | Full list; each value's activity code is stored beside it and checked in `strength-portions-mets-sources.test.js`. Eleven changed from 2011 (walking slow/moderate/brisk, running 8/10/16 km/h, rowing, stair machine, stationary bike, yoga, Pilates, boxing bag); kettlebell training has no code of its own and was removed |
