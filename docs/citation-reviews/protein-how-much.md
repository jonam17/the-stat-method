# Citation review — Protein: how much (additions of 2026-10-20 and 2026-11-03)

Article: `src/content/articles/protein-how-much.md`
Also covers: the fixed kidney-disease bar on the Protein Target calculator (`src/components/ProteinTarget.jsx`).
Verified by: the AI drafting session, 2026-10-20 · Human review: pending

This record covers only reference [4], added in v2.33.0. References [1]–[3] were verified on
2026-08-25, before review records were kept. The same release qualifies one uncited sentence:
"overshooting protein is fairly harmless" now reads "fairly harmless in healthy adults", so it no longer
contradicts the new paragraph.

## [4] NIDDK, "Healthy Eating for Adults with Chronic Kidney Disease" (last reviewed January 2025)

**Read:** the whole page, from a PDF the maintainer saved on 2026-10-20. **Tier:** Full — it supports a
safety claim. Public guidance from a U.S. federal institute (NIH), not primary research; adequate for the
claim made, which gives no amounts.

| Check | Result |
|---|---|
| Exists | Yes; URL and review date as on the page |
| Supports the claim | Yes — passages below |
| Population fit | Adults with chronic kidney disease, including on dialysis; the claim is limited to them |
| Provenance of a number | No number is used |
| Funding / interests | U.S. government agency; no commercial interest stated or apparent |
| Superseded | Reviewed January 2025 |

| Article / calculator claim | Passage |
|---|---|
| ★ Protein breaks down into waste that the kidneys remove; some people with CKD need a moderate amount so waste doesn't build up | "As your body uses protein, the protein breaks down into waste. Your kidneys remove this waste from the blood. Some people with CKD may need to consume moderate amounts of protein so waste doesn't build up in the blood." |
| ★ People on dialysis may need more, because dialysis removes protein from the blood | "People with CKD who are on dialysis may need to eat more protein because the dialysis treatment removes protein from the blood." |
| Too little protein risks malnutrition; work out the amount with a dietitian or doctor | "too little protein may lead to malnutrition … Work with a dietitian or health care professional to find the right balance of protein" |

---

## Correction of 2026-11-03 (v2.38.6, with item 45 batch 3)

Verified by: the AI drafting session, 2026-11-03 · Human review: Jonathan Morales approved the correction
and the calculator changes on 2026-11-03; the wording below to be checked in the release previews.

**What was wrong.** The article said the useful band was "1.6 and 2.4 g per kilogram of lean mass" and
tied the 1.6 to Morton's 1.62. Morton's breakpoint is per kilogram of **body mass** ([1], Figure 5:
"g protein/kg/day", total daily protein intake relative to body mass); no source read gives a 1.6–2.4
lean-mass band. The article also said the calculator switches to lean mass whenever body fat is given;
from v2.38.6 it does so only in a deficit. References [1]–[3] were verified on 2026-08-25, before review
records were kept, which is how the unit slipped through.

**Changes:** takeaways 1, 2 and 4; the first section (now "Bodyweight or lean mass?", same anchor); the
first paragraph and bullets of the second section; the paragraph on the 2.3–3.1 range; both summaries.
New reference [5] Jäger et al. 2017.

| Article sentence | Source and passage |
|---|---|
| ★ Everyday range 1.4–2.0 g/kg bodyweight for most people who exercise | [5] Position point 2: "1.4–2.0 g protein/kg body weight/day (g/kg/d) is sufficient for most exercising individuals" |
| ★ Morton's plateau 1.62 g per kg bodyweight a day (CI 1.03–2.20, not significant) | [1] Results, "Break point analysis": "break point=1.62 (1.03, 2.20) g/kg/day … despite not being statistically significant (p=0.079)"; axis "g protein/kg body mass/day" (Figure 5) |
| ★ Lean, resistance-trained people in a deficit: 2.3–3.1 g/kg lean mass, higher the harder the cut and the leaner | [2] Protein section: "resistance-trained, lean athletes during caloric restriction suggests a range of 2.3-3.1 g/kg of LBM … the lower the body fat … the greater the imposed caloric deficit … the higher the protein intake" |
| Narrative review because evidence was thin | [2] Methods: "relevant to natural bodybuilding is extremely limited, a narrative review style was chosen" |
| By the authors' reasoning, the lower end fits someone with more fat or a gentle cut | Inference from the same [2] passage, stated as such |
| Older trainees: extra protein helped less with age | [1] Abstract and Discussion: "less effective with increasing chronological age" |

**[5] Jäger R et al. J Int Soc Sports Nutr 2017;14:20.** Read in full (publisher PDF, open access, 25
pages). DOI on the first page. Type: society position stand. Population: exercising individuals. Competing
interests: several authors consult for or receive funding from companies that sell protein supplements
(Declarations, "Competing interests") — recorded; the article uses only the headline range.
