# Citation review checklist

Derived from 32 findings across the first 49 citations checked. Ordered by how much
each check actually caught, not by how obvious it sounds.

---

## The six checks

### 1. Exists
Journal, year, volume, pages correct. The paper is real and the reference points at it.

*Caught:* the Navy citation conflated two separate technical reports (84-11 men, 84-29
women) into one.

*Weakest check.* Nearly everything passes it. Necessary, not sufficient.

### 2. Supports the specific claim
Not "is it about this topic" — does it support the sentence it is attached to?

*Caught:* `riegelConfidence()` rated half-marathon → marathon as most reliable while the
article's own citation showed it is where the formula fails worst. Also the creatine
endurance overstatement, and "sleep restriction reliably degrades performance" where the
source says findings conflict.

### 3. Population fit — **the highest-yield check**
Who was actually studied, and do they resemble the people using this tool?

A paper can fully support a claim *about its own population* and not support it about
your users. This is not covered by check 2 at all.

*Caught:* Riegel's exponent fitted to **world records**, applied to recreational runners ·
LeSuer validated on **67 untrained college students** · Schutz percentiles from **Swiss
Caucasian** adults measured by impedance · Spiegel's hormone data from **12 young men on IV
glucose feeding** · Nedeltcheva's "55% less fat" from **10 people over 14 days** ·
Jackson-Pollock's original equation **men only**, with the women's equation implemented but
uncited · Gulati derived from **symptom-limited stress tests**, not true maxima.

Ask: sample size, training status, age, sex, ethnicity, health status, and how the
measurement was taken.

### 4. Provenance of the number — **for any citation backing an engine constant**
Where did the specific figure come from, and does the cited paper actually contain it?

*Caught:* the engine cited Trexler for "10-15%" — Trexler supports the phenomenon but that
percentage is not in it · FFMI normalisation used 6.1 where Kouri specifies **6.3** ·
Brzycki, Epley, Wathen and Lombardi all originate as **wall charts and textbook tables**,
extrapolated into formulas afterwards, with no stated derivation.

**Corollary — the valid range is part of the constant.** When a source defines a domain for
its formula, check the code respects it. Two bugs in `scoring.js` came from here: a missing
IPF GL coefficient set that silently fell back to another, and a DOTS bodyweight clamp of
40-210 kg applied to women when their published range ends at 150. Every coefficient was
transcribed correctly; the boundaries around them were not.

### 5. Funding and competing interests
Read the declaration. Who paid, and did they want a particular answer?

*Caught:* Kreider (creatine safety) prepared at the request of a supplement trade body ·
Jagim funded by a creatine **monohydrate** manufacturer, concluding the competing form is no
better · Morton's senior author funded by the **National Dairy Council**, which supported
trials inside the analysis.

Three for three on nutrition and supplement papers. **Apply this check to every
supplement, nutrition or industry-adjacent citation as standard.** Disclose regardless of
which direction the conflict points — flagging only the inconvenient ones is not a standard.

### 6. Superseded or refined since
Has later work overturned, narrowed, or better quantified this?

*Caught:* Vickers 2016 quantified where Riegel 1981 fails, and it was **already in the same
reference list** · a re-analysis found Forbes' weight-*gain* relationship does not hold once
anorexia-recovery subjects are removed.

*Apply to:* anything pre-2010, and anything that is the sole support for a headline number.

---

## Two rules that are not checks

**Never write an identifier from memory.** Not a PMID, not a DOI, not a volume number. If it
was not on screen, it does not go in the file. One near-miss already: a PMID inserted from
recall over an existing one, neither confirmable. The URL was removed rather than guessed.

**Precision is a claim.** Reporting more decimal places than the source supports is its own
error, distinct from being wrong. Deurenberg's error was stated as "around five points" when
the paper reports SEE 4.1. The 1.62 g/kg protein figure has a 95% CI of 1.03-2.20 and misses
conventional significance. A 1RM to one decimal place derives from a 1985 wall chart.

---

## Applying this without it collapsing

Six checks per citation is not sustainable for 79 citations, and a checklist that is too
heavy gets skipped — the same desensitisation problem as a warning that always fires.

**Tier per CITATION, not per article.** The original scheme tiered whole articles, and it
collapsed: **all 19 articles on this site back a tool**, so by the rule "citations supplying
an engine constant get the full treatment", every article qualified. Four were reclassified
one at a time before the pattern was obvious. A calculator site does not have low-risk
articles; it has low-risk *citations* inside high-risk articles.

| A citation gets… | When |
|---|---|
| **Full — checks 1, 2, 3, 5**, plus 4 if it supplies a constant, plus 6 if pre-2010 or sole support for a headline number | it supplies a number the code uses, **or** supports a health, safety or risk claim |
| **Light — checks 1 and 5** | it is background, context, or supports a claim no tool acts on |

Judge each reference against the sentence it is attached to. A tool-backed article will
usually contain both kinds.

Checks 3 and 4 found more than any other. If time is short, do those before check 5.

Checks 3 and 4 found more than any other. If time is short, do those before check 5.
