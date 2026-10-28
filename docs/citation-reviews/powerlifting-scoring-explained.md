# Citation review — Wilks is obsolete (powerlifting scoring), and the DOTS calculator (2026-10-27)

Article: `src/content/articles/powerlifting-scoring-explained.md`
Also covers: the DOTS calculator's notes, percentile line, clamp note and chart
(`src/components/PowerliftingScore.jsx`, `src/pages/tools/powerlifting-score.astro`), the tool guide
(`src/data/tool-guides.js`), and the engine (`src/engine/scoring.js`, `src/data/opl-percentiles.json`).
Verified by: the AI drafting session, 2026-10-27 · Human review: pending

This record covers what changed in v2.35.1 and v2.36.0. References [1]–[4] were verified on 2026-08-26,
before review records were kept, and were not re-read for this release.

## [5] OpenPowerlifting, bulk CSV documentation (bulk-csv-docs.html)

**Read:** the page, 2026-10-27 (fetched). **Tier:** Full for the column meanings the script relies on;
light for the DOTS background.

| Claim | Passage |
|---|---|
| ★ DOTS was created in 2019 by Tim Konertz of the BVDK, built on drug-tested raw lifters' results | Dots: "built on data from drug-tested Raw lifters … Tim Konertz of the BVDK created it in 2019" (paraphrased by the fetch; the page points to `crates/coefficients/src/dots.rs` for the formula) |
| ★ Raw = bare knees or sleeves; Single-ply = equipped | Equipment: "Raw: Bare knees or knee sleeves." · "Single-ply: Equipped, single-ply suits." |
| ★ Numeric Place = placed lifter; G, DQ, DD, NS excluded | Place: "Positive number: the place the lifter came in." G guest, DQ disqualified, DD doping disqualification, NS no-show |
| ★ "Tested" means the lifter entered a tested category | Tested: "`Yes` if the lifter entered a drug-tested category" — not that the lifter was tested |
| Event SBD = full power | Event: "SBD: Squat-Bench-Deadlift, also commonly called 'Full Power'." |

## [6] OpenPowerlifting bulk CSV data, file of 2026-10-24

**Read:** the whole file, by `scripts/opl-percentiles.mjs` run by the maintainer on 2026-10-27
(openpowerlifting-2026-10-24-0fc10dd9.csv, 4,054,260 rows, latest meet 2026-10-18). Output committed as
`src/data/opl-percentiles.json`. **Tier:** Full — it supplies every number in the chart and the result line.

| Check | Result |
|---|---|
| Exists | Yes — downloaded from openpowerlifting.gitlab.io/opl-csv/bulk-csv.html |
| Supports the claim | The figures are computed from it; the filters are stated on the page and in the JSON |
| Population fit | People who entered and placed in full-power meets, 2021-10-18 to 2026-10-18, each counted once at their best. **Competitors, not lifters in general** — said in the result line and the chart. Federations of all kinds, tested and untested; drug-tested-only figures differ by up to 5.2 DOTS except equipped women (up to 19.4), stated on the page |
| Provenance | Public domain ("All competition data available on this website are contributed to the Public Domain") |
| Funding / interests | Volunteer project; none relevant |
| Superseded | Updated nightly. Re-run the script to refresh; the tests then check the page, guide and article still match |

**Also settled by this file — DOTS outside its bodyweight range.** For every published DOTS outside
40–210 kg (men, 2,033 results) and 40–150 kg (women, 4,411), the figure matched the formula with
bodyweight clamped to the limit; none matched the unclamped formula and none matched neither. The engine
keeps its clamp and the calculator says so when it applies.

## [7] USA Powerlifting Rulebook, version 2026.2 (in effect 2026-01-01, revised 2026-02-09)

**Read:** the full PDF, 85 pages (supplied by the maintainer, 2026-10-27), searched for every scoring,
formula and age passage. **Tier:** Full for what the article says USA Powerlifting does.

| Claim | Passage |
|---|---|
| ★ DOTS is the tie-break for team placings at national championships | §1.9.5, p. 12: "…then the team with the greater total number of DOTS points (of the five best placed lifters) will be declared the higher placed." |
| ★ A better formula is being developed; DOTS stays until then | §1.9.5.1, p. 12: "At the 2024 NGB meeting, approval was given to develop a formula that is superior to DOTS. This development will occur during 2025 (and possibly beyond). Until such a time that a new formula is approved, DOTS will continue to be the formula used." |
| ★ Awards by division at nationals | §1.12.1, p. 15: "At national championships, awards will be given to the top five (5) place finishers in each division." |
| ★ Age divisions | §1.7, p. 10: Open from 14 "and upwards"; Youth 8–13; Teen 14–19; Junior 20–23; Master 1–7 from 40 to "the day before they turn 110" |

**Corrections made from this source:**
- "USA Powerlifting scores on DOTS" (article) and "Used by USA Powerlifting…" (calculator, v2.35.1)
  overstated it: in the rulebook DOTS is the team tie-break. Reworded.
- "masters 1 through 7, running to 110 years old with no upper limit" — M7 ends at 109; the open division
  has no upper limit. Corrected.
- Foster and McCulloch age coefficients do not appear in the rulebook. The article's figures (1.340 vs
  1.194 at 60; peak potential 24–39) cited USA Powerlifting documents that were never in its references.
  Cut to a paragraph without figures (maintainer's decision, 2026-10-27). The calculator's note that USAPL
  applies McCulloch "for Masters and Junior lifters" was removed.
- "Age coefficients are a best-lifter and cross-division comparison device" — not in the rulebook; removed.

## Claims removed for want of a source

- "USPA, WRPF and others adopted DOTS from 2020" (article, calculator, guide, engine comment).
  Maintainer's decision, 2026-10-27: drop unless sourced. A test keeps "USPA" and "WRPF" out of these files.
- "built … with the explicit aim of correcting the bias at the extremes" (DOTS). Replaced with what
  [5] says it is built on.
- "Both moved from published lookup charts to formulas computed from exact bodyweight" (IPF and USAPL).
- "No major federation still uses it" (Wilks) → "neither the IPF nor USA Powerlifting uses it", which [1]
  and [7] support.

## Not re-checked

[1]–[4] and the DOTS–Wilks gap figures (computed from the engine, 2026-09-27) were not changed. The
Vanderburgh & Batterham passage still rests on [4] as verified in August.
