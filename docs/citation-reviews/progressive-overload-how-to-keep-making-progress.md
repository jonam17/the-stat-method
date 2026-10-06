# Citation review — Progressive overload: how to keep making progress

Article: `src/content/articles/progressive-overload-how-to-keep-making-progress.md`
Also covers: the evidence statements in the Progressive Overload Calculator's "Method & sources"
panel (`src/components/ProgressiveOverload.jsx`) and guide (`src/data/tool-guides.js`), which cite
the same sources.
Verified by: the AI drafting session, 2026-10-05 · Human review: Jonathan Morales, 2026-10-05
Method: `docs/citation-checklist.md`, six checks per reference, then every cited sentence checked
against a specific passage. The article stays `draft: true` until a person has reviewed this record.

**How to review.** Spot-check the ★ claims against the passages named. If anything doesn't match,
note it here and send it back to a drafting session; don't un-draft.

---

## Summary

| # | Reference | Read | Tier | Result |
|---|---|---|---|---|
| 1 | ACSM 2009 position stand (Ratamess et al.) | Full text | Full | Pass |
| 2 | Plotkin et al. 2022 | Full text (PeerJ, open access) + declarations | Full | Pass, interests noted |
| 3 | Lopez et al. 2021 | Abstract (university repository) + corrigendum notice | Light | Pass |
| 4 | ACSM 2026 position stand (Phillips, chair) | Published abstract + indexed passages of the full text | Light | Pass, scope limited |
| 5 | Refalo et al. 2023 | Abstract | Light | Pass |
| 6 | Robinson et al. 2024 | Published abstract (full preprint read for v2.11.0) | Light | Pass |
| 7 | Halperin et al. 2022 | Abstract and discussion passages | Light | Pass |
| 8 | Pelland et al. 2022 | Abstract (publisher page) | Light | Pass |

Full tier for [1] and [2]: they carry the article's central claims (what overload is; the 2–10%
rule; reps vs load). The others support one or two background sentences each, and every such
sentence stays within what the abstract or quoted text says.

### Corrections to the original specification's sources

The calculator was specified with six sources (S1–S6). Verification changed four of them:

- **S1** ACSM 2002 → **replaced by ACSM 2009** [1]. The 2009 stand states that it replaces the 2002
  one, and the 2–10% rule as worded in the spec ("2–10% when performance exceeds the target by 1–2
  reps") omits two parts of the 2009 text: *on two consecutive training sessions*, and *lower percent
  for small muscle mass exercises*. Both are now in the article and the calculator's method notes.
- **S3** Lopez 2021 — exists as cited; PMID 33433148 confirmed on the repository record. A 2022
  corrigendum corrected three studies' effect sizes in Figure 4 "with no changes in the main findings
  and conclusions."
- **S6** "Methods for controlling and reporting…" — exists, but the spec gave no authors; it is
  **Pelland JC, Robinson ZP, et al.**, *Sports Med* 2022;52(7):1461–1472.
- **S2** ACSM 2026 — exists, *Med Sci Sports Exerc* 2026;58(4):851–872. Author byline order was not
  seen in full, so it is cited as the organisation with its chair named.
- **Added:** Plotkin 2022 [2] (reps vs load progression) and Halperin 2022 [7] (RIR accuracy).
- S4 (Refalo 2023) and S5 (Robinson 2024) were correct as cited.

---

## [1] ACSM 2009 — Progression models in resistance training for healthy adults

Link: https://doi.org/10.1249/MSS.0b013e3181915670 · *Med Sci Sports Exerc* 41(3):687–708

**Checks.** Exists: yes. Population: healthy adults, novice to advanced; separate older-adult section.
Interests: an ACSM position stand, reviewed by its Pronouncements Committee; no commercial interest.
Superseded: updated by ACSM 2026 [4] as an overview of reviews; the 2026 abstract does not restate a
load-increase percentage, so [1] remains the source for the 2–10% rule — the article says it is
graded B and rests on one paper.

| Article / calculator statement | Where in the paper |
|---|---|
| ★ Progressive overload = gradual increase of stress; ways: load, total reps at current load, tempo, rest, volume | "Progression Principles", first paragraph |
| ★ 2–10% increase, lower for small-muscle and higher for large-muscle exercises, when 1–2 reps over target on two consecutive sessions | "Loading", evidence statement, Evidence category B; Table 2 |
| ★ Graded B; rests on a single 1999 paper | Same statement: category B, one citation (ref. 68, Feigenbaum & Pollock 1999) |
| Replaces the 2002 stand | Introduction, first sentence; closing note |

## [2] Plotkin et al. 2022 — Progressive overload without progressing load?

Link: https://doi.org/10.7717/peerj.14142 · *PeerJ* 10:e14142

**Checks.** Exists: yes. Population: 43 resistance-trained adults (27 men, 16 women), mean age 23.1,
≥1 year lower-body training; 38 completed. Funding: none stated in the text read. **Competing
interests:** Mike Israetel and Jared Feather are employed by Renaissance Periodization (a training
programme company); Brad Schoenfeld serves on the scientific advisory board of Tonal (exercise
equipment). Disclosed by the authors; the study was preregistered and the ultrasound assessor and
statistician were blinded. Superseded: no.

| Article statement | Where in the paper |
|---|---|
| ★ 43 trained adults, 27 men/16 women, ~23 years; 8 weeks; load vs reps progression; 8–12 range | Abstract (Methods); "Participants"; "Resistance training procedures" |
| Twice weekly; sets to or near failure | "Resistance training procedures" (verbal encouragement to failure); Limitations (some stopped short) |
| ★ Similar growth at nearly every site; rectus femoris slightly favoured REPS | Abstract (Results); Table 1; "Hypertrophy" |
| ★ Squat +~20 kg both; LOAD +2.0 kg, CI −7.8 to 2.4 (REPS relative to LOAD); "questionable practical significance" | Abstract; Table 1; "Strength" |
| Both progressions viable | Abstract (Conclusion) |
| Limits: young, lower body only, 8 weeks, Smith-machine test vs free-weight training | "Limitations"; "Strength" discussion |

## [3] Lopez et al. 2021 — Load effects on hypertrophy and strength (network meta-analysis)

Link: https://doi.org/10.1249/MSS.0000000000002585 · *Med Sci Sports Exerc* 53(6):1206–1216

**Checks.** Exists: yes (repository record, PMID 33433148). Population: 28 studies, 747 healthy adults,
only sets to volitional failure. Interests: not read (abstract tier). Superseded: no; corrigendum noted
above, conclusions unchanged.

| Article statement | Where in the paper |
|---|---|
| ★ 28 studies, 747 adults, sets to failure; light >15 RM, moderate 9–15, heavy ≤8 | Abstract (Methods, Results) |
| ★ No difference in hypertrophy between loads | Abstract (Results, Conclusions) |
| ★ Strength: heavy and moderate > light; heavy vs moderate not significant (P = 0.068) | Abstract (Results) |

## [4] ACSM 2026 — Resistance training prescription… an overview of reviews

Link: https://doi.org/10.1249/mss.0000000000003897 · *Med Sci Sports Exerc* 58(4):851–872

**Checks.** Exists: yes (journal record, ACSM announcement, PMC copy). Population: healthy adults ≥18,
systematic reviews of trials lasting 6–52 weeks. Interests: ACSM position stand. Superseded: newest.
**Scope limit:** the publisher's full text is paywalled and the PMC copy was behind a bot check, so
only two claims are cited, both quoted from the paper's own text (abstract and indexed passages).

| Article / calculator statement | Where |
|---|---|
| ★ Overview of 137 systematic reviews; updates the 2009 stand | Abstract; Introduction ("updates the ACSM 2009 Position Stand") |
| ★ Training to momentary failure "does not enhance gains in strength, hypertrophy, and power, and so is not necessary" | Results/summary passage, indexed from the full text |
| ★ Healthy adults should perform progressive resistance training | Abstract (Conclusions) |

## [5] Refalo et al. 2023 — Proximity to failure and hypertrophy

Link: https://doi.org/10.1007/s40279-022-01784-y · *Sports Med* 53(3):649–665

**Checks.** Exists: yes. Population: trials comparing failure vs non-failure training. Interests: not
read (abstract tier). Superseded: complemented by [6], which the article also cites.

| Article statement | Where |
|---|---|
| ★ Trivial advantage for failure vs non-failure for hypertrophy (ES 0.19, CI 0.00–0.37) | Abstract (Results) |
| No evidence that momentary-failure training is superior | Abstract (Conclusion) |

## [6] Robinson et al. 2024 — Proximity to failure dose-response

Link: https://doi.org/10.1007/s40279-024-02069-2 · *Sports Med* 54(9):2209–2231

Verified for the training volume article (v2.11.0; see that article's review record). Interests: four
authors are fitness coaches and writers (preprint declarations).

| Article statement | Where |
|---|---|
| ★ Growth improved closer to failure; strength similar across a wide range of RIR; exploratory, RIR estimated | Published abstract (Results, Conclusions) |

## [7] Halperin et al. 2022 — Accuracy in predicting repetitions to failure

Link: https://doi.org/10.1007/s40279-021-01559-x · *Sports Med* 52(2):377–390

**Checks.** Exists: yes. Population: 12 studies, 414 healthy participants. Interests: not read
(abstract tier). Superseded: no.

| Article / calculator statement | Where |
|---|---|
| ★ People underpredicted reps to failure by ~0.95 reps | Abstract (Results) |
| ★ Accuracy improved slightly closer to failure and with ≤12 reps | Abstract (Results, meta-regressions) |
| Calculator: RIR estimates "least accurate far from failure" | Same passage — worded as least accurate, not inaccurate |

## [8] Pelland et al. 2022 — Methods for controlling and reporting proximity to failure

Link: https://doi.org/10.1007/s40279-022-01667-2 · *Sports Med* 52(7):1461–1472

**Checks.** Exists: yes (publisher page). A narrative review; interests not read; four authors overlap
with [6].

| Article statement | Where |
|---|---|
| No consistent quantification method for proximity to failure; definitions of failure vary between studies | Abstract, first paragraph |

---

## Calculator statements that are implementation rules, not citations

These are labelled as implementation rules on the page and in `src/engine/overload.js`, and are not
attributed to any source: the per-class percentage bands (chosen within ACSM 2009's 2–10%, lower
for small exercises); "every set at the top of the range" as the trigger; the smallest in-band step;
the two-reps-over escape; the 5–10% reduction; the confidence grades.
