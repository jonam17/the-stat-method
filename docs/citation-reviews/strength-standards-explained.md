# Citation review — Strength standards, and the Strength Standards calculator (2026-10-27)

Article: `src/content/articles/strength-standards-explained.md`
Also covers: the calculator (`src/components/StrengthStandards.jsx`), its engine (`src/engine/standards.js`),
the tool guide (`src/data/tool-guides.js`) and the page and card text.
Verified by: the AI drafting session, 2026-10-27 · Human review: pending

This record covers v2.37.0. The references were first marked verified on 2026-08-27, before review records
were kept. [2] and [3] were not re-read for this release.

## [1] Santos Junior ERT, de Salles BF, Dias I, Ribeiro AS, Simão R, Willardson JM. Strength Cond J 2021;43(5):77-86

**Read:** full text, 10 pages (PDF from journals.lww.com, supplied by the maintainer, 2026-10-27).
**Tier:** Full — it supplies every number the calculator uses, and is the sole support for them.

| Check | Result |
|---|---|
| Exists | Yes — title, authors and journal as cited; the PDF header reads "Volume 00, Number 00, February 2021" (online-first); volume 43(5), pages 77-86 are as previously recorded and not re-checked against the issue |
| Supports the claim | Yes — passages below |
| Population fit | Not a population at all: a **proposed model**, no data collected. Cut-offs built from Willoughby (1993) and the authors' reasoning. "The references used in this study … are for most resistance training practitioners, and not for athletes" (p. 7). Said on the page, in the guide and in the article |
| Provenance of the numbers | Text p. 4 and Table 1 p. 6; all 18 percentages checked against both, which agree; the engine copy and a separately typed test copy must match |
| Funding / interests | "The authors report no conflicts of interest and no source of funding." (p. 7) |
| Superseded | Not checked by search for this release. Sole support for the calculator's levels; revisit if a measured dataset (e.g. OpenPowerlifting per-lift percentiles, PENDING item 43 option b) is adopted |

| Claim | Passage |
|---|---|
| ★ Four levels: beginner, intermediate, advanced, highly advanced | Abstract: "4 classification levels are proposed: beginner, intermediate, advanced, and highly advanced" |
| ★ Men: bench 60 / 100 / >120, squat 80 / 120 / >150, deadlift 100 / 150 / >180 % of body mass | p. 4: "highly advanced men should be able to lift more than 120% in the bench press, more than 150% in the back squat, and more than 180% in the deadlift. Advanced men … 100–120% … 120–150% … 150–180% … intermediate men … 60–99.9% … 80–119.9% … 100–149.9% … beginner men … below 60% … below 80% … below 100%"; Table 1 |
| ★ Women: bench 40 / 60 / >80, squat 60 / 100 / >130, deadlift 80 / 120 / >160 | p. 4: "highly advanced women more than 80% in the bench press, more than 130% in the back squat, and more than 160% in the deadlift … advanced women … 60–80% … 100–130% … 120–160% … intermediate women … 40–59.9% … 60–99.9% … 80–119.9% … beginner women … below 40% … below 60% … below 80%"; Table 1 |
| ★ Women's gap smaller for lower body | p. 4: "the differences for the lower body are smaller than those for the upper body" |
| ★ Strength is one of five parameters; ≥3 items, the three time items mandatory | Abstract (five parameters); p. 5: "a minimum of 3 items in the questionnaire should be used, considering that the first 3 criteria … are mandatory" |
| ★ No age adjustment; older and heavier lifters a limitation | p. 7: "heavier individuals may have a disadvantage …"; "Another limitation would be applying the model to older individuals, who may have the prerequisites to be considered advanced practitioners but are at a disadvantage in terms of strength level. Therefore, practitioners still must use some subjectivity" |
| ★ Time bands: ≤2 mo, 2–12 mo, 1–3 y, ≥3 y | Table 1, "Current uninterrupted training time" |
| ★ Strongest powerlifters improve most slowly | p. 1: "Latella et al. (37) reported that, even in well-trained powerlifters, the strongest athletes showed a lower rate of strength improvement" — ref 37 is "Long-term strength adaptation: A 15-year analysis of powerlifting athletes". Second-hand: Latella not read |
| A squat above ~1.5× bodyweight is the top tier for men (article, unchanged) | As above — "more than 150% in the back squat" |
| Purpose: prescription and describing samples | Abstract: "a valid tool for training prescription and for researchers to better characterize a sample" |

**Boundaries.** The text gives ranges to one decimal (e.g. 80–119.9%), and "more than" for the top level;
the engine compares the percentage to one decimal place and treats exactly 150% (men's squat) as advanced.
Table 1 says "Up to 120% MSQ" for intermediate, consistent with the text.

**Not used:** the pull-up scores (men: none / 1 rep / +15% / +30% of body mass; women: none / half rep /
1 rep / +10%). Maintainer's decision, 2026-10-27.

## Removed for want of a source (calculator and article)

- The previous five-level table (Untrained → Elite, 50 multiples across five lifts), credited to "commonly used
  coaching ranges and large public lifting datasets". It called a 1.5× squat "Novice" and set Elite at 3.0×.
- The age factor (−0.8% a year after 30, floor 60% at 80) and "strength declines gradually after roughly thirty".
- Overhead press and barbell row — the paper does not cover them.
- Article: "the most-cited academic framework"; "Strength peaks somewhere in the late twenties and declines
  gradually after"; the time to move between levels ("a few months … a year or more … several years");
  "early strength gains are substantially neural".

## Not re-checked

[2] Rhea et al. 2003 and [3] Peterson et al. 2005 support the unchanged paragraph on dose-response
("the volume required to keep progressing rises with training age"), which carries no reference markers.
Worth adding markers after re-reading them.
