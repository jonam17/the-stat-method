---
title: "Race time predictors: what they know and what they assume"
dek: "A 5K time can predict your 10K well and your marathon badly. The difference is not the maths — it's an assumption the formula cannot check."
category: Training
published: 2026-08-06
readMinutes: 8
citationsVerified: full
citationsVerifiedDate: 2026-08-24
author: The Stat Method
relatedTool: running-pace
evidenceBased: true
keyTakeaways:
  - "Riegel's formula scales time by the distance ratio raised to the power 1.06."
  - "It assumes you have trained appropriately for the target distance — which it cannot verify."
  - "Predictions between adjacent distances are reasonably reliable; large extrapolations are not."
  - "The marathon is where predictions fail most, because fuelling and durability dominate."
  - "Even splits are a sound default, not a law — conditions justify deviating."
toc:
  - { id: "the-formula", label: "The formula" }
  - { id: "the-assumption", label: "The hidden assumption" }
  - { id: "marathon", label: "Why marathons break it" }
  - { id: "pacing", label: "Pacing on the day" }
  - { id: "bottom-line", label: "Bottom line" }
changelog:
  - date: 2026-08-14
    note: "Widened the reliability threshold for Riegel predictions after testing showed a 10K-to-half-marathon extrapolation was being flagged as unreliable when it is in fact a standard, trustworthy prediction. The calculator was corrected to match."
  - date: 2026-08-06
    note: "First published."
references:
  - text: "Riegel PS. Athletic records and human endurance. American Scientist, 1981;69(3):285-290."
    url: "https://pubmed.ncbi.nlm.nih.gov/7235349/"
    verified: true
  - text: "Vickers AJ, Vertosick EA. An empirical study of race times in recreational endurance runners. BMC Sports Sci Med Rehabil, 2016;8:26."
    url: "https://bmcsportsscimedrehabil.biomedcentral.com/articles/10.1186/s13102-016-0052-y"
    verified: true
  - text: "Joyner MJ, Coyle EF. Endurance exercise performance: the physiology of champions. J Physiol, 2008;586(1):35-44."
    url: "https://pubmed.ncbi.nlm.nih.gov/17901124/"
    verified: true
  - text: "Smyth B. How recreational marathon runners hit the wall: a large-scale data analysis of late-race pacing collapse in the marathon. PLoS One, 2021;16(5):e0251513."
    url: "https://pubmed.ncbi.nlm.nih.gov/34010308/"
    verified: true
---

Enter a 5K time into a race predictor and it will tell you your marathon time to the second.
The confidence of that output is not matched by the confidence you should place in it.

<h2 id="the-formula">What the formula does</h2>

Most predictors use Riegel's formula, published in 1981. It scales a known time by the ratio
of distances raised to the power 1.06:

**T₂ = T₁ × (D₂ ÷ D₁)^1.06**

The exponent is the whole idea. If it were 1.0, the formula would assume you hold the same
pace regardless of distance, which is obviously wrong. Setting it slightly above 1 encodes
the fact that pace degrades as distance grows.

Where 1.06 came from matters, though, and almost nobody mentions it. Riegel fitted it to
**world records**, across distances from 100 metres to 100 miles. He never presented it as a
single universal number — he fitted separate values for other sports, and broke the running
exponent out by age and sex group. [1] The 1.06 in every race calculator on the internet is
a constant derived from the fastest humans alive, applied to everybody else.

That is still genuinely useful. It is a compact, empirically grounded description of how
endurance performance falls off with distance, and for moderate extrapolations it works
well.

<aside class="summary">
<span class="summary-label">Summary</span>
<div class="summary-body"><p>Riegel scales time by distance ratio to the power 1.06, encoding the observed fact that pace degrades as races get longer. For moderate extrapolations it is a sound tool.</p></div>
</aside>

<h2 id="the-assumption">The assumption it cannot verify</h2>

The formula's central assumption is that you are **equally well trained for both distances**.

It has no way of checking this. It sees a time and a distance and nothing else. It does not
know whether you have done a single run over ten kilometres, whether you have practised
fuelling, or whether your longest run this year was the 5K you just entered.

For a 10K predicted from a 5K, that assumption is usually close enough — the training
required for the two overlaps heavily. Empirical analysis of recreational runners' race times
has found that predictions degrade as the extrapolation grows, which is exactly what you
would expect if the training-equivalence assumption is doing the work.

This is why our calculator flags confidence by distance ratio rather than presenting all
predictions identically. A prediction is only as good as the assumption underneath it, and
telling you which predictions rest on a shakier assumption is more useful than a uniform row
of numbers.

<div class="pull">
The formula is not wrong about the maths. It is uninformed about your training.
</div>

<aside class="summary">
<span class="summary-label">Summary</span>
<div class="summary-body"><p>Riegel assumes equivalent training for both distances and cannot check it. Predictions degrade as the extrapolation grows, which is why confidence should be flagged rather than hidden.</p></div>
</aside>

<h2 id="marathon">Why the marathon breaks predictions</h2>

The marathon is where predictors fail most often and most dramatically, for reasons that sit
outside the physiology the formula captures.

Shorter races are limited primarily by aerobic capacity and the ability to sustain effort
near threshold. The marathon adds constraints that barely feature at 5K: glycogen
availability, fuelling strategy, gastrointestinal tolerance, thermoregulation over hours, and
musculoskeletal durability. Large-scale analysis of recreational marathon pacing has
documented how commonly runners slow dramatically in the closing stages — a pattern driven by
these factors rather than by aerobic fitness. An analysis of more than four million race
records found the slowdown is *more* common in the years around a personal best: 36 per cent
of runners hit the wall in the three years before a recent PB, against 23 per cent in earlier
years. Pushing closer to your ceiling makes the collapse more likely, not less. [4]

This is measurable, and the size of it is worth knowing. A study of 2,303 recreational
endurance runners found Riegel well calibrated for races **up to the half marathon** — and
then, at the marathon, giving predictions at least ten minutes too fast for half of all
runners. A simple model built from a runner's own prior race times roughly halved the error.
[2]

The important part is that this is not a problem of extrapolating too far. Predicting a
marathon from a half is a short hop by the formula's own logic, and it is still biased fast.
The bias comes from the distance, not the gap. **Our calculator therefore never reports high
confidence for a marathon prediction, however close your input race is** — it tells you the
number is a floor on your finish time rather than a target.

A runner with an excellent 5K and no long-run history will not run the predicted marathon
time. The prediction describes what their aerobic engine could support; the race is decided
by whether the rest of the system can last.

<aside class="summary">
<span class="summary-label">Summary</span>
<div class="summary-body"><p>Marathons are limited by fuelling, durability and thermoregulation, none of which a 5K measures. This is why late-race slowing is common and why long extrapolations mislead.</p></div>
</aside>

<h2 id="pacing">Using splits on race day</h2>

Even splits — running each segment at the same pace — are a sound default for most runners at
most distances. The most common recreational error is starting too fast, and an even-split
plan is a direct guard against it.

Two qualifications. Elite performances are frequently run with a slightly faster second half,
suggesting that a marginally conservative opening is not a cost. And terrain, heat and wind
all justify deviating: holding goal pace up a long climb spends far more than it saves.

Use the splits table as an anchor for the early kilometres, where discipline matters most,
and as a rough check thereafter. If you reach halfway on plan and feeling controlled, the
plan was right.

<aside class="summary">
<span class="summary-label">Summary</span>
<div class="summary-body"><p>Even splits guard against the most common error, starting too fast. Use them strictly early, and adjust for terrain and conditions rather than defending a pace up a hill.</p></div>
</aside>

<h2 id="bottom-line">The bottom line</h2>

Trust a predictor most when the distances are close and you have trained for both. Treat a
marathon predicted from a 5K as a description of your aerobic potential rather than a time
you should attempt to run.

And remember what no formula can see: whether you have done the long runs, practised taking
on fuel at pace, and rehearsed the effort. Those decide the race. The arithmetic only
describes the engine.
