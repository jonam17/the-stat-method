# Citation review — Sleep and training (correction of 2026-11-04)

Article: `src/content/articles/sleep-and-training.md`
Also covers: the Sleep Cycle Calculator (`src/components/SleepCalculator.jsx`, `src/engine/sleep.js`).
Verified by: the AI drafting session, 2026-11-04 · Human review: Jonathan Morales approved the approach on
2026-11-04; the wording below to be checked in the release previews.

References [1]–[5] were verified on 2026-08-25, before review records were kept. This record covers the
v2.38.7 correction of the section "About those ninety-minute cycles", which had no citation: its "70 to 120
minutes" could not be traced, and "waking between cycles does tend to feel easier" was not in any source read.
New references [6] and [7]. The calculator's labels now come from [4] (Table 2), read again in full for this.

**Changes:** takeaway 1; the cycles section and its summary; a changelog entry.

## [6] Patel AK, Reddy V, Shumway KR, Araujo JF. Physiology, Sleep Stages. StatPearls (last updated 26 January 2024)

**Read:** the whole page, from a PDF the maintainer saved on 2026-11-04. **Type:** peer-reviewed clinical
reference (StatPearls), hosted on NCBI Bookshelf (NBK526132). **Interests:** each author "declares no relevant
financial relationships with ineligible companies".

| Article / calculator claim | Passage |
|---|---|
| ★ Cycles average 90 minutes; four to six a night | "The body cycles through all stages approximately 4 to 6 times each night, averaging 90 minutes for each cycle." |
| ★ A complete cycle takes roughly 90 to 110 minutes | "A complete sleep cycle takes roughly 90 to 110 minutes." |
| ★ Woken from deep sleep: sleep inertia; mental performance moderately impaired for 30 minutes to an hour | "if someone is awoken during this stage, they will have a transient phase of mental fogginess, known as sleep inertia. Cognitive testing shows that individuals awakened during this stage tend to have moderately impaired mental performance for 30 minutes to 1 hour." |

The page also says "a typical night's sleep consists of 4 to 5 sleep cycles" elsewhere; the article uses the
introduction's 4 to 6.

## [7] NINDS, Brain Basics: Understanding Sleep (NIH Publication No. 17-NS-3440-C, August 2017)

**Read:** the whole booklet, from the archived PDF the maintainer saved on 2026-11-04. **Type:** U.S. federal
public-information booklet. No commercial interest.

| Article / calculator claim | Passage |
|---|---|
| ★ Deep sleep comes mostly in the first half of the night | Stage 3: "It occurs in longer periods during the first half of the night." |
| REM periods grow longer toward morning | "with increasingly longer, deeper REM periods occurring toward morning" |

## [4] Hirshkowitz et al. 2015 — calculator labels

| Calculator claim | Passage |
|---|---|
| ★ Labels "recommended", "may be appropriate", "not recommended" by age; 18–25: 7–9 / 6, 10–11 / <6, >11; 26–64: 7–9 / 6, 10 / <6, >10; ≥65: 7–8 / 5–6, 9 / <5, >9 | Table 2, "Expert panel recommended sleep durations" |
| Hours are of sleep, not time in bed | Discussion: "actual sleep time is typically less than time in bed" (the calculator adds time to fall asleep separately) |

**Not sourced, flagged for the maintainer:** takeaway 2 and the bottom line ("A regular seven hours beats an
erratic nine … the single highest-return change") cite nothing; none of [1]–[7] says it. Left unchanged in
this release; removed from the calculator. The calculator's 15 minutes to fall asleep is now called a starting
value: Ohayon et al. 2004 (Sleep 27(7):1255–73; full text searched for every latency passage, figures checked) give no single figure in the text, only graphs.
