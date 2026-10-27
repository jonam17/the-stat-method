# Citation review — FFMI explained, and the FFMI calculator (2026-10-26)

Article: `src/content/articles/ffmi-explained.md`
Also covers: the FFMI calculator's percentile line, scale and chart (`src/components/FfmiCalculator.jsx`,
`src/pages/tools/ffmi.astro`) and the engine's copy of the table (`FFMI_PERCENTILES` in `src/engine/body.js`).
Verified by: the AI drafting session, 2026-10-26 · Human review: pending

This record covers what changed in v2.34.2 and v2.35.0. The article's references were first verified on
2026-08-24, before review records were kept.

## [1] Kouri EM, Pope HG Jr, Katz DL, Oliva P. Clin J Sport Med 1995;5(4):223-228

**Read:** the PubMed abstract page (PDF supplied by the maintainer, 2026-10-26). Full text not read.
**Tier:** Full — it supplies a constant the code uses (6.3).

| Claim | Passage (abstract) |
|---|---|
| ★ FFMI = fat-free mass (kg) × height (m)⁻² | "FFMI is defined by the formula (fat-free body mass in kg) x (height in meters)-2" |
| ★ Normalisation: + 6.3 × (1.80 m − height) | "a slight correction of 6.3 x (1.80 m - height) to normalize these values to the height of a 1.8-m man" |
| ★ The ~25 observation is in men, from one sample, called preliminary | "157 male athletes … The normalized FFMI values of athletes who had not used steroids extended up to a well-defined limit of 25.0 … these findings must be regarded as preliminary" |
| The bands 18 / 20 / 22 / 23 are **not** from Kouri | Nothing in the abstract defines them (v2.34.2 removed them) |

Population fit: male athletes only; nothing here describes women.

## [2] Schutz Y, Kyle UUG, Pichard C. Int J Obes Relat Metab Disord 2002;26(7):953-960

**Read:** full text, 8 pages (PDF via UCSD, supplied by the maintainer, 2026-10-26). **Tier:** Full — it
supplies every number in the chart and the result line, and is the sole support for them (check 6 applies).

| Check | Result |
|---|---|
| Exists | Yes — journal, volume, pages and DOI 10.1038/sj.ijo.0802037 as on the paper |
| Supports the claim | Yes — passages below |
| Population fit | 5,635 apparently healthy volunteers (2,986 men, 2,649 women) in Geneva and Lausanne, not randomly selected; about a third of non-Swiss origin; obese people likely under-represented (the authors' limitation). General population, **not trained people** — the page says so in the result line, the chart and the method note |
| Provenance of the numbers | Table 2, p. 955; all 56 FFMI values checked against the page image; the engine copy and a separately typed test copy must agree |
| Funding / interests | "We thank the Foundation Nutrition 2000 Plus for its financial support." No competing-interests statement (absence recorded) |
| Superseded | Pre-2010 and sole support: one search (2026-10-26) found no US reference with directly comparable FFMI tables. Revisit if one appears |

**Inconsistency in the paper:** Methods say recruits were "aged 24 – 98 y"; the title, Table 1 and Table 2
use 18–98 and an 18–34 group. The site uses the tables' groups and says so in the calculator's method note.
**Measure:** Table 2 is plain FFMI (FFM ÷ height²), not height-normalised; the calculator compares the raw
figure, and a test enforces it.

| Claim | Passage |
|---|---|
| ★ Percentiles by sex and age group (both tables, result line, scale) | Table 2, "Fat-free mass index (kg/m²)", rows 18–34, 35–54, 55–74, >75; columns P5 … P95, M and F |
| ★ Median for 18–34: 18.9 men, 15.4 women | Results: "P50 = 18.9 kg/m², range 5th – 95th percentile: 16.8 – 21.1" (men); "P50 = 15.4 kg/m² … 13.8 – 17.6" (women) |
| Women's medians 2.6 to 3.5 points below men's, by age | Computed from Table 2 P50: 3.5, 3.3, 3.2, 2.6 |
| 5,635 adults; Swiss; non-random; impedance cross-validated against DXA | Abstract (Design, Subjects); Methods; Discussion ("could not be randomly selected") |
| Half below the 50th, 5% below the 5th | Methods: "The ith percentile (Pi) was the value at or below which there was i% of the sample" |

Corrections made: "Three caveats" (two listed) → "Two caveats"; a draft sentence saying women run "about 3.5
points lower at every age" was replaced by the computed range before release.
