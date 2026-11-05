# Citation review — Heart rate zones (additions of 2026-10-20 and 2026-11-04)

Article: `src/content/articles/heart-rate-zones-explained.md`
Also covers: the fixed beta-blocker bar on the Heart Rate Zones calculator (`src/components/CardioCalculator.jsx`).
Verified by: the AI drafting session, 2026-10-20 · Human review: pending

This record covers only reference [5], added in v2.33.0. References [1]–[4] were verified on
2026-08-24, before review records were kept.

## [5] American Heart Association, "How do beta blocker drugs affect exercise?" (last reviewed 18 January 2024)

**Read:** the whole page, from a PDF the maintainer saved on 2026-10-20. **Tier:** Full — it supports a
safety claim. A consumer page from a national professional body, not primary research; adequate for the
narrow claim made, which is about how the drugs act and what to do, not about effect sizes.

| Check | Result |
|---|---|
| Exists | Yes; URL and review date as on the page |
| Supports the claim | Yes — passages below |
| Population fit | People prescribed beta-blockers; the claim is limited to them |
| Provenance of a number | No number is used |
| Funding / interests | The page states that the AHA "receives support from pharmaceutical and biotech companies, device manufacturers and health insurance providers whose products may be mentioned", with policies preventing supporters from influencing content. No product is recommended in the cited passages |
| Superseded | Reviewed January 2024; nothing newer found on the page |

| Article / calculator claim | Passage |
|---|---|
| ★ Beta-blockers are prescribed after a heart attack and for abnormal heart rhythms, high blood pressure and other heart conditions | "prescribed after a heart attack or to treat abnormal heart rhythms (arrhythmias) and other conditions" · "also are used to treat high blood pressure and other heart conditions" |
| ★ They slow the heartbeat, so an age-based target heart rate may need adjusting | "Beta blockers relieve stress on your heart by slowing the heartbeat." · "your heart rate is being slowed and you may need to adjust your target heart rate" |
| ★ They affect everyone differently; a healthcare professional can help set a new target with a brief exercise stress test | "your healthcare professional can help to determine your new target heart rate using a brief exercise stress test. This test is used because beta blockers affect everyone differently." |

---

## Correction of 2026-11-04 (v2.38.7, with item 45 batch 4)

Verified by: the AI drafting session, 2026-11-04 · Human review: Jonathan Morales chose ACSM's classes
(option A) on 2026-11-04; the wording below to be checked in the release previews.

**What was wrong.** The section "What the zones are for" described five zones (recovery, aerobic base, tempo,
threshold, VO₂ max) with no citation, and the calculator applied the same 50–100% bands to both heart-rate
reserve and percent of maximum. No source read gives those bands; ACSM gives different ones for each method.
The pull quote's figures came from the old zones.

**Changes:** the section, now "The intensity bands" (same anchor); its summary; the pull quote; the toc label;
a changelog entry. New reference [6].

## [6] Garber CE et al. ACSM position stand. Med Sci Sports Exerc 2011;43(7):1334–1359

**Read:** in full, from the PDF the maintainer supplied on 2026-11-04 (26 pages). Authors, title, volume,
pages and DOI 10.1249/MSS.0b013e318213fefb checked on the first page. **Type:** professional-society position
stand (evidence categories A–D). **Population:** apparently healthy adults. **Interests:** "The authors have
no conflict of interest."

| Article / calculator claim | Passage |
|---|---|
| ★ Five classes with separate %HRR and %HRmax bands: very light <30 / <57; light 30–39 / 57–63; moderate 40–59 / 64–76; vigorous 60–89 / 77–95; near-maximal to maximal ≥90 / ≥96 | Table 5, "Classification of exercise intensity", columns "%HRR or %V̇O2R" and "%HRmax" |
| Effort wording and RPE ranges (<9, 9–11, 12–13, 14–17, ≥18, on the 6–20 scale) | Table 5, column "Perceived Exertion (Rating on 6–20 RPE Scale)" |
| ★ The methods "cannot be assumed" equivalent; the table is approximate | "Table 5 shows the approximate classification … it cannot be assumed that one method of determining exercise intensity is necessarily equivalent to that derived using another method." |
| ★ Moderate and/or vigorous for most adults; light to moderate for deconditioned people | Table 2, Intensity: "Moderate and/or vigorous intensity is recommended for most adults." (A) · "Light- to moderate-intensity exercise may be beneficial in deconditioned persons." (B) |
| Calculator guide: at least 150 min a week moderate, or 75 vigorous | Summary: "≥5 d·wk−1 for a total of ≥150 min·wk−1"; Table 2, Time: "(150 min·wk−1) of purposeful moderate exercise, or … (75 min·wk−1) of vigorous exercise" |

The pull quote's figures (120–144, 111–136 and 102–130 bpm for a 30-year-old) are the calculator's own output
from Tanaka and the bands above; they are arithmetic, not a citation. The paragraphs on training-intensity
distribution, verified against Seiler [4] on 2026-08-24, are unchanged.
