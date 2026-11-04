# Citation review — How to set your macro split (correction of 2026-11-03)

Article: `src/content/articles/macro-split-guide.md`
Verified by: the AI drafting session, 2026-11-03 · Human review: Jonathan Morales approved the correction
and the calculator changes on 2026-11-03; the wording below to be checked in the release previews.

References [1]–[4] were verified on 2026-08-25, before review records were kept. This record covers the
v2.38.6 correction only: the article described the Macro Calculator's protein and fat rules, which item 45
batch 3 changed, and its 0.8 g/kg fat floor "for hormonal health" had no source. New references [5] Jäger
et al. 2017 and [6] Institute of Medicine 2005.

**Changes:** takeaway 2; the protein paragraph and summary; the fat-floor paragraph and summary; a
changelog entry.

| Article sentence | Source and passage |
|---|---|
| ★ Calculator uses 1.8 g/kg bodyweight, inside ISSN's 1.4–2.0 | [5] Position point 2 (as in the protein review); calculator value from `src/engine/macros.js` |
| ★ Cutting with body fat: 2.3 g/kg lean mass, low end of 2.3–3.1 for lean athletes in a deficit | [4] Protein section: "range of 2.3-3.1 g/kg of LBM" for "resistance-trained, lean athletes during caloric restriction" |
| ★ IOM acceptable range for adults 20–35% of calories from fat | [6] Summary: "an AMDR for fat and carbohydrate is estimated to be 20 to 35 and 45 to 65 percent of energy, respectively, for all adults"; Chapter 8 summary: "The AMDR for total fat is set at 20 to 35 percent of energy" |
| 0.8 g/kg "for hormonal health" could not be traced | Not in [4], [5] or [6]; the calculator credited it to a book we could not read |
| ★ Cutting fat from about 40% to 20% lowered testosterone modestly; for hard dieters the deficit and leanness appear to matter more | [4] Fat section: "Reductions in the percentage of dietary fat in isocaloric diets from approximately 40% to 20% has resulted in modest, but significant, reductions in testosterone levels"; "the caloric deficit and loss of body fat itself may have a greater impact on testosterone than the percentage of calories coming from dietary fat" |

**[6] Institute of Medicine 2005.** Read: the Summary's AMDR passage, the Energy chapter's physical
activity level sections (for the calculators) and the total-fat AMDR passage; the report is 1,359 pages
and the rest is not cited. Same reference text and DOI as already verified in the protein article.
**[5]** as recorded in `protein-how-much.md`.
