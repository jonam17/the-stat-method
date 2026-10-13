# Citation review — Training frequency and rest days

Article: `src/content/articles/training-frequency-and-rest-days.md`
Also covers: the two charts `frequency-strength-all` and `frequency-strength-equated` in
`src/charts/definitions.js`, which recreate figures from [4].
Verified by: the AI drafting session, 2026-10-08; open points re-checked 2026-10-11 · Human review: Jonathan Morales, 2026-10-11
Method: `docs/citation-checklist.md`, six checks per reference, then every cited sentence checked
against a specific passage. The article stayed `draft: true` until a person had reviewed this record.

**How to review.** Spot-check the ★ claims against the passages named. If anything doesn't match,
note it here and send it back to a drafting session; don't un-draft.

---

## Summary

| # | Reference | Read | Tier | Result |
|---|---|---|---|---|
| 1 | Pelland et al. 2026 (online Dec 2025) | Published abstract, Introduction and Methods (publisher page); full preprint v2 for context | Full | Pass, scope limited |
| 2 | Schoenfeld, Grgic, Krieger 2019 | Published abstract (Europe PMC record) | Full | Pass, abstract only |
| 3 | Saric et al. 2019 | Published abstract (Europe PMC record) | Light | Pass, abstract only |
| 4 | Grgic et al. 2018 | Full text (accepted manuscript, Victoria University repository) | Full | Pass |
| 5 | Morán-Navarro et al. 2017 | Full text (publisher PDF, third-party copy, read to the end) + publisher abstract | Full | Pass, no declarations in the article |
| 6 | Damas et al. 2016 | Published abstract and Key Points (Europe PMC record) | Light | Pass, abstract only |
| 7 | Grandou et al. 2020 | Published abstract (Europe PMC record) | Light | Pass, abstract only |
| 8 | Halonen et al. 2024 | Full text (open access, CC BY, University of Jyväskylä repository) | Full | Pass |

Full tier for [1], [2] and [4]: they carry the article's central claims about size and strength. [5]
and [8] are Full because they support claims about recovery and breaks that readers will act on.
[3], [6] and [7] each support a few background sentences, all within their published abstracts.

**Access.** Four papers could be read only as abstracts ([2], [3], [6], [7]): the publisher full texts
are paywalled and no accepted manuscript was found. Every sentence citing them was rewritten until the
published abstract supports all of it. [1]'s publisher page showed the abstract, Introduction and
Methods before the paywall; its Results and Discussion were read only in the preprint, and **no
article sentence rests on the preprint** — see [1].

Corrections made while verifying: "Grgic pooled 22 studies" → "reviewed 22 studies, 21 of them in the
pooled analysis"; a sentence saying six sessions a week "were not harmful" rewritten to say only that
six did no worse than three over six weeks, which is what [3] reports; a statement that the frequency
trials are mostly a few months long was removed, because nothing read in this session supports it for
[2]; definitions of the overreaching categories were removed from the [7] paragraph, because the
abstract does not give them; the training status of [6]'s participants is not stated, because the
abstract does not give it.

### Open points from review, re-checked 2026-10-11

The maintainer's review raised four points. Outcomes:

1. **[1]'s per-session figures.** A second attempt to read the published Results and Discussion failed:
   the publisher page still ends in the reference list, and no open copy of the published version was
   found. The preprint's figures (for example +3.27% strength per added session) therefore **stay out of
   the article**. Nothing in it depends on them; every [1] sentence rests on the published abstract,
   Introduction or Methods.
2. **Abstract-only references [2], [3], [6], [7].** Searched again for full texts: publisher pages (Taylor
   & Francis, Wiley, Springer) return errors or paywalls; [6]'s PubMed Central copy exists but sits behind a
   browser check that cannot be passed from here; the Victoria University, UTS, Sheffield Hallam, USP and
   Maastricht repositories hold no manuscript of these papers; ResearchGate is unreachable. They remain
   abstract-only, and every sentence citing them was re-read against its abstract. One sentence was
   tightened: the rest-days section said men training six times a week "did as well" as men training three
   times ([3]); it now says "about as well", and names the exception the abstract reports (elbow flexors
   grew significantly only in the three-day group).
3. **Declarations.** [5]: the publisher's PDF was read to the end a second time — it goes from Conclusions
   straight to the references and contains **no funding, acknowledgements or conflict-of-interest section**;
   the only declaration is ethics approval (University of Murcia Bioethics Commission) in the Methods. That
   is now recorded as the article's own content, not as a gap in the copy read. [1]: the publisher page still
   cuts off before its declarations, so this record relies on the training volume article's review record
   (signed 2026-10-04), which read them on the publisher's page: no funding received; all five authors
   declare they are coaches and writers in the fitness industry. The preprint's declaration matches.
4. **Verification date.** The `complete` command stamped the UTC date (`toISOString()`), so any check
   finished after 5 pm Pacific was dated the next day — on the maintainer's Mac too, not only in the drafting
   container. Fixed in `scripts/citations.mjs` (local calendar date). The article's date was re-stamped with
   the fixed script: **2026-10-11**, the day verification finished (UTC was already 2026-10-12 when it ran).

---

## [1] Pelland JC, Remmert JF, Robinson ZP, Hinson SR, Zourdos MC. Sports Med 2026;56(2):481–505

Link: https://doi.org/10.1007/s40279-025-02344-w · PMID 41343037 (Europe PMC record) · online 4 Dec 2025

**Checks.** Exists: yes — volume, issue, pages and online date from the publisher page and Europe PMC.
Already verified in full for the training volume article (v2.11.0, that article's record). Population:
67 studies, 2,058 participants, 79.1% male, mean age 25.16 (published abstract). Funding and
interests: from the training volume record, which read the published declarations — no funding received;
all five authors are coaches and writers in the fitness industry. The preprint (v2, SportRxiv, September
2024) says the same about interests. Same group as Robinson 2024 and Pelland 2022 elsewhere on the site.
Superseded: newest source.

**Scope.** In this session the publisher page returned the abstract, Introduction and Methods; the
Results and Discussion were cut off. The preprint was read in full and reports per-session slopes
(e.g. +3.27% strength per added session) — **those numbers are deliberately not in the article**,
because the published version could not be checked against them.

| Article sentence | Where in the paper |
|---|---|
| ★ Frequency = number of times per week a muscle or exercise is trained | Introduction (published page) |
| ★ Frequency models included weekly volume, so estimates are over and above volume | Methods §2.7: "a linear term of volume in frequency models" |
| Earlier meta-analyses mixed, generally no independent effect | Introduction (published page) |
| ★ 67 studies, 2,058 participants; size effect compatible with negligible | Published abstract, Methods and Results |
| ★ Strength rose with frequency, diminishing returns; only strength showed consistently identifiable effects | Published abstract, Results and Conclusions; Key Points |
| 79% male, average age 25 | Published abstract |

## [2] Schoenfeld BJ, Grgic J, Krieger J. J Sports Sci 2019;37(11):1286–1295

Link: https://doi.org/10.1080/02640414.2018.1555906 · PMID 30558493 (Europe PMC record; online 17 Dec 2018)

**Checks.** Exists: yes — journal, volume, issue, pages from Europe PMC and the Victoria University
repository record. Population: the abstract names a resistance-trained subgroup but gives no sample
characteristics; not checked further (full text paywalled; no manuscript found). Funding and
interests: **not read**. Krieger's listed affiliation is Weightology LLC, a private company — noted,
as in earlier records. Superseded: no; consistent with [1], which is newer.

| Article sentence | Where in the paper |
|---|---|
| ★ 25 studies; no significant difference between higher and lower frequency when volume equated | Abstract, sentences 3–4 |
| ★ No difference in subgroups: direct measures, resistance-trained, upper and lower body separately | Abstract, sentence 5 |
| Not volume-equated: higher frequency favoured, but 1 vs 3+ days modest | Abstract, sentence 6 |
| ★ For a given volume, choose frequency by personal preference | Abstract, final sentence |

## [3] Saric J, Lisica D, Orlic I, Grgic J, Krieger JW, Vuk S, Schoenfeld BJ. J Strength Cond Res 2019;33(Suppl 1):S122–S129

Link: https://doi.org/10.1519/JSC.0000000000002909 · PMID 30363041 (Europe PMC record; the abstract cites the issue as 33(7S))

**Checks.** Exists: yes. Population: 27 resistance-trained men (14 three days, 13 six days); six weeks;
supervised. Funding and interests: not read (abstract tier); Krieger at Weightology LLC; Grgic and
Schoenfeld are also authors of [2] and [4]. Superseded: no; included in later pooled work.

| Article sentence | Where in the paper |
|---|---|
| ★ 27 trained men, same weekly volume 3× vs 6× a week, six weeks | Abstract, sentences 1–3 |
| ★ Similar gains in elbow extensors, rectus femoris, vastus intermedius; no significant between-group differences; elbow flexors significant only in RT3 | Abstract, sentences 8–9 |
| Strength gains similar | Abstract, sentences 6 and 10 |
| Six sessions did about as well as three, except the elbow flexors; nothing extra over six weeks at matched volume | Same passages; the article limits the claim to the six weeks studied (reworded 2026-10-11) |

## [4] Grgic J, Schoenfeld BJ, Davies TB, Lazinica B, Krieger JW, Pedisic Z. Sports Med 2018;48(5):1207–1220

Link: https://doi.org/10.1007/s40279-018-0872-x · PMID 29470825 (Europe PMC record)

**Checks.** Exists: yes — the accepted manuscript was read in full; journal details confirmed against
Europe PMC and the repository's publisher link, and the abstract's figures match the published
abstract. Population: 22 studies reviewed, 21 pooled, 912 participants; mostly untrained — only three
studies with lifting experience (pooled n = 56); young, middle-aged and older adults, both sexes.
Funding: "No external sources of funding"; all authors declare no conflicts (Krieger at Weightology
LLC). Superseded: refined by [1], which the article says — the two differ on whether frequency has an
effect independent of volume, and the article presents both.

| Article sentence | Where in the paper |
|---|---|
| ★ 22 studies reviewed, 21 in the pooled analysis | Results, study selection and meta-analysis paragraphs |
| ★ ES 0.74 / 0.82 / 0.93 / 1.08 for 1 / 2 / 3 / 4+ times a week | Abstract; Table 3 (with 95% CIs, used in the chart) |
| ★ Volume-equated studies: no significant effect (P = 0.421); seven studies | Results, volume-equated subgroup ("42 ESs from 16 treatment groups from 7 studies") |
| ★ Effect seemed driven mainly by volume; independent effect unclear | Conclusions; Abstract |
| Significant for multi-joint, not single-joint; motor-learning explanation | Results (P < 0.001 vs P = 0.324); Discussion |
| Only three studies with lifting experience | Results; Limitations |
| Chart, all studies: 0.74 (0.48–1.01), 0.82 (0.55–1.09), 0.93 (0.65–1.21), 1.08 (0.74–1.42) | Table 3 |
| Chart, volume-equated: 0.53 (0.13–0.93), 0.80 (−0.25–1.86), 0.64 (0.21–1.07), 0.58 (0.45–0.72) | Results, volume-equated subgroup |
| Chart caption: most studies did not match volume | 7 of the 21 pooled studies were volume-equated |

**Note.** The volume-equated estimates are pooled model estimates with wide, overlapping intervals; the
4+ estimate probably rests on one study (Table 1 lists one volume-equated 4+ comparison). The chart
shows the intervals so the uncertainty is visible; the caption's comparisons are computed from the
rows, not typed.

## [5] Morán-Navarro R, Pérez CE, Mora-Rodríguez R, et al. Eur J Appl Physiol 2017;117(12):2387–2399

Link: https://doi.org/10.1007/s00421-017-3725-7 · PMID 28965198 (Europe PMC record)

**Checks.** Exists: yes. Read: the publisher's PDF (Springer header and DOI) from a third-party copy,
confirmed against the publisher's page and Europe PMC (title, authors, volume, pages, abstract all
match). Population: 10 highly resistance-trained men, 21.5 years, 8.2 years' training; Smith machine;
one session of each protocol. Funding and interests: **the published article has no funding or
conflict-of-interest statement** — the publisher PDF runs from Conclusions straight into the references;
only ethics approval appears, in the Methods. Recorded as absent, not as clean. A non-industry physiology
study, so the risk is low. Superseded: no.

| Article sentence | Where in the paper |
|---|---|
| ★ 10 highly trained men; bench and squat at 75% 1RM; protocols 3×5, 6×5, 3×10 to failure; 4 weeks apart | Abstract; Methods, participants and design |
| 6×5 matched the failure session's total reps | Methods ("same total reps as 3 × 10"); Abstract ("even when total volume was matched") |
| Measured jump height, bar speed, blood markers, from before to 72 h after | Abstract; Methods, time points |
| ★ Non-failure: jump height back within 6 h; recovery 24–48 h significantly faster than failure | Discussion (CMJ by 6 h); Abstract, Results |
| ★ Failure: jump and bar speed below baseline at 24 and 48 h; CK raised through 48 h | Results (BP V1 velocity and CMJ reduced at 0, 6, 24, 48 h; CK elevated vs baseline through 48 h) |
| ★ Failure slows recovery by up to 24–48 h | Abstract, Results; Discussion |
| Limits: ten men, one session each, Smith machine, performance and blood markers not growth | Methods; the article's own summary of design |

**Note.** The Discussion gives two recovery times for the failure protocol's bar speed (restored by 48 h
in one place, 72 h in another). The article says only what both support: still below baseline at 24
and 48 hours.

## [6] Damas F, Phillips SM, Libardi CA, et al. J Physiol 2016;594(18):5209–5222

Link: https://doi.org/10.1113/JP272472 · PMID 27219125 (Europe PMC record)

**Checks.** Exists: yes. Population: ten young men, 27 years (SEM 1); training status not stated in the
abstract, so the article does not state it. Funding and interests: not read (abstract tier; the PMC copy
was behind a bot check). Superseded: no.

| Article sentence | Where in the paper |
|---|---|
| ★ Ten young men followed through ten weeks; damage greatest after first session, lower at week 3, lower again at week 10 | Abstract; Key Points (T1, T2, T3) |
| Protein synthesis highest after the first session but unrelated to growth; weeks 3 and 10 correlated with hypertrophy | Abstract (r ≈ 0.9, P < 0.04); Key Points |
| "That suggests the after-effects … overstate" | The article's inference, worded as one |

## [7] Grandou C, Wallace L, Impellizzeri FM, Allen NG, Coutts AJ. Sports Med 2020;50(4):815–828

Link: https://doi.org/10.1007/s40279-019-01242-2 · PMID 31820373 (Europe PMC record)

**Checks.** Exists: yes (Europe PMC and the UTS repository record; the repository's PDF is closed
access). Population: 22 studies attempting to induce overreaching or overtraining through resistance
exercise in healthy participants. Funding and interests: not read (abstract tier). Superseded: no.

| Article sentence | Where in the paper |
|---|---|
| ★ 22 studies; 8 decrement with follow-up, 4 without follow-up, 10 no decrement | Abstract, Results |
| Inconsistent methods; FOR, NFOR and OTS not reliably identified; few studies established them | Abstract, Results and Conclusions |
| ★ May relate to frequent, high-intensity, monotonous training; only a sustained performance decrease established as reliable | Abstract, Conclusions |

## [8] Halonen EJ, Gabriel I, Kelahaara MM, Ahtiainen JP, Hulmi JJ. Scand J Med Sci Sports 2024;34(10):e14739

Link: https://doi.org/10.1111/sms.14739 · PMID 39364857 · CC BY full text at the University of Jyväskylä repository

**Checks.** Exists: yes. Population: 55 untrained adults randomised, 42 completed (20 and 22), 45%
women in each group, mean age 32; untrained meant fewer than 10 sessions a year. Funding: Rehabilitation
Foundation Peurunka, Suomen Urheilututkimussäätiö, Research Council of Finland; authors declare no
conflicts. Superseded: newest source on training breaks; refines the older periodic-training trials.

| Article sentence | Where in the paper |
|---|---|
| ★ 55 untrained adults, mean age 32, ~45% women; twice-weekly whole-body training | Abstract; Methods, participants and training |
| ★ Design: 10 on / 10 off / 10 on vs 10 waiting then 20 continuous | Methods, design |
| ★ Break losses: leg press −5.4%, muscle CSA −9.9% (VL) and −7.3% (BB) | Results, detraining |
| ★ Regained within five weeks; similar results at the end | Results, retraining; Abstract |
| Authors: may not apply to trained people or to breaks from illness or injury | Discussion, limitations and practical applications |

---

## Article statements that rest on other pages of this site

- The Progressive Overload Calculator holds the load when total reps fall since last session, because
  "one lower session is not a trend" — `src/engine/overload.js`, the `declining` branch.
- An unexpected rise in RPE at a familiar load is a recovery signal — *Training by RPE*, section on
  anchoring volume work.
- Most sets can stop a rep or two short of failure — *Progressive overload*, "How hard each set needs
  to be".
- Strength stops responding to extra sets after a few a week — *Training volume*, "Strength is a
  different curve".
