# Conventions

Rules this codebase already follows. They exist because each one was learned by getting it
wrong — the note after each says how. Follow them when adding anything.

---

## 1. Safety rails

**Refuse, do not warn.** When a request is unsafe, do not compute the result and put a warning
beside it. Compute nothing. A tool that produces a trajectory toward a harmful goal has already
done the harm, whatever text sits next to it.

**Route refusals through `Panel`'s `notice` prop.** `notice` takes precedence over children, so
the numbers are never built. Rendering a warning *above* the results leaves the results on
screen — that was a real bug in Hand Portions.

**Refusal copy names no numbers.** No weights, no thresholds, no "you are X below Y". For
someone restricting, a stated shortfall reads as achievement. Warnings lead with what the tool
*did* ("we've held this target at 1,200 kcal"), not how far under the request fell.

**Rails may be raised, never lowered, without a source.** Tightening on evidence is fine.
Loosening on a literature review, without a clinician, is not.

**Every rail needs an invariant test.** Test the property ("no exported function returns below
the floor across this sweep"), not the mechanism. Future callers are then covered without
writing new tests.

> *Learned:* the underweight guard originally only caught tools with a target weight. Tools
> with a goal *direction* — "Cut", no target — sailed through. A deficit with no stated target
> is still a deficit.

## 2. Guarding a nulled result object

When a `useMemo` returns a reduced object (`{ blocked: true }`, `{ incomplete: true }`),
**guard every sibling block that reads it**, not just the first.

> *Learned:* the deficit planner guarded its first child but five later blocks still read
> `r.sim`. They threw on `undefined.toFixed()`, React unmounted the whole island, and the
> *inputs* disappeared — which is why the tool looked like it vanished while typing.

## 3. Dark mode

**Never use `background:var(--ink)` without a dark-mode pin.** `--ink` also paints body text;
once it flips, the panel and its text collapse to the same value.

Every such rule needs `:root[data-theme="dark"] .thing{background:#171717;color:#F2F1EE}`.

Currently pinned: `.results` `.stat` `.cta-card` `.quick` `.band` `.tool-feature` `.pctrow`.

**Measure contrast, do not eyeball it.** AA is 4.5:1 for body text, 3:1 for graphics. Compute
it. Safety copy currently runs 8.4:1–14.7:1 and should stay there — it is the most important
text on the site and should be the most legible.

> *Learned:* `.cta-card` shipped unreadable on every article in dark mode. The same trap had
> already been caught and pinned for `.results`; nobody checked whether it applied elsewhere.
> When you fix one instance of a class of bug, grep for the rest.

## 4. Inputs

**`<Num>` requires `min` and `max`.** No defaults. Ranges are physiological, per field — a
barbell load and a neck circumference are not the same shape of number. Out-of-range values are
*reported*, never silently clamped.

**Use `<TimePicker>`, never `<input type="time">`.** The native control renders per browser and
OS locale, so a visitor on a 24-hour locale saw a 24-hour field on a US-facing site.

**Resize the layout when you change the control.** A three-select picker does not fit where a
one-field input did.

> *Learned:* the caffeine drink row kept its four-column grid after the time control tripled in
> width. The source select collapsed to a single character.

## 5. Colour

`--signal` (orange) is reserved for the one thing the page wants you to act on. Do not use it
for state.

| Meaning | Token | Light | Dark |
|---|---|---|---|
| Live / free / good | green | `#2F6B43` | `#7FC79A` |
| Freemium / neutral info | blue | `#2A6070` | `#7FBBD0` |
| Paid / caution | amber | `#8A5A12` | `#E0B063` |
| Government / neutral | grey | `#4A4A46` | `#B8B8B2` |
| Affiliate / disclosure | signal | `#9A3D10` | `#FF9E73` |

Affiliate deliberately uses signal: it is a **disclosure**, not metadata, and must not be
mistakable for one.

**Pills carry categories, not opinions.** "Paid" is a category; "Best-in-class for accuracy" is
an endorsement and belongs in prose.

## 6. Citations

Six checks, ordered by what they actually caught across 80 citations. Full version in
`docs/citation-checklist.md`.

1. **Exists** — lowest yield; nearly everything passes
2. **Supports the specific claim** — not just the topic
3. **Population fit** — *highest yield*. Who was studied vs who uses the tool
4. **Provenance of the number** — for anything backing an engine constant
5. **Funding / competing interests** — 4 for 4 on nutrition papers
6. **Superseded since** — anything pre-2010 or sole support for a headline figure

**Never write an identifier from memory.** Not a PMID, DOI, volume or page. If it was not on
screen, it does not go in the file. If a source cannot be confirmed, omit the link and say so.

**An article publishes a verification claim only at 100%.** "2 of 5 verified" reads weaker than
saying nothing. `npm run citations complete <file>` refuses below full.

**Place inline `[n]` markers last.** Inserting a citation renumbers everything after it, and a
shifted marker that still lands in range cannot be detected automatically. Run
`npm run citations markers <file>` after any reference-list edit.

## 7. Tool listings

Use `liveTools()`, never raw `TOOLS`. The raw list contains unreleased entries.

## 8. Before shipping

```bash
npm run qa:release          # production config · calculators · UI · tests · build ·
                            # placeholders · citation lint · Playwright audit
```

`qa:production` needs `dist/`, so build first. Env values must be **shell exports or host
environment settings** — a `.env` file satisfies the build but not the standalone QA scripts.

**The Playwright audit is not optional.** It is the only check that runs a real browser. A
nested `<p>` shipped past 230 passing unit tests and a clean build; only the audit caught it.

## 9. Dependencies

Do not upgrade for the sake of it. As of Astro 7.2.0: `npm audit` reports zero
vulnerabilities, and 7.3.1 installs only with `--legacy-peer-deps` because `@astrojs/mdx`
peers have not settled. Verified working on 7.3.1 + mdx 8.0.0 — but a flag that suppresses
peer checking is a reason to wait, not proceed.

Revisit when the integrations resolve cleanly, or if an advisory appears.

## 10. Deployment (Cloudflare)

**`wrangler.jsonc` must stay in the repo.** It declares the site as static assets with no
`main` entry and no Astro adapter.

Without it, `wrangler deploy` auto-detects Astro, assumes SSR, and runs `astro add cloudflare`
inside the build container — injecting an adapter this project does not use. On Astro 7.2.0
that adapter fails with `[MISSING_EXPORT] "renderForPrerender"`.

> *Learned:* the first deploy failed exactly this way. The site had already built successfully
> — 48 pages, "Build command completed" — and the failure came from auto-config rebuilding it
> with an adapter bolted on. Read past the first success in a deploy log; the error may be
> from a second build you did not ask for.

**Do not add an Astro adapter.** Every page is prerendered. An adapter would move rendering to
request time, defeat the static hosting model, and re-introduce the version conflict above.

Environment values go in the Cloudflare dashboard, not in a committed file. (Hardcoding the
non-secret fallbacks in `site.config.js` is fine for the handle, state and contact email; the
domain should still come from the environment.)

**Preview origins are never indexed.** `BaseLayout` emits `noindex` automatically when
`SITE.url` is a `workers.dev` / `pages.dev` host or still contains a placeholder, and flips to
`index,follow` the moment a real domain is set. Nothing to remember at cutover.

## 11. Claims about the site itself

**The homepage must not outrun the work.** Every trust claim has to be true on the day it
ships, not true once something pending is finished.

> *Learned:* the live homepage stated *"Reviewed by professionals — health articles are checked
> by credentialed reviewers, credited by name on the page."* No article had a reviewer;
> clinical review is still pending. A site whose entire argument is that it does not overstate
> things was overstating the one thing that matters most. Replaced with a claim that is true —
> all 80 citations verified against their originals.

Do not restore a review claim until a named clinician has signed off. The article schema only
emits `reviewedBy` when `reviewStatus === 'reviewed'`; the marketing copy must be held to the
same standard as the structured data.

**Monetisation must not create data.** Donations go through a Stripe Payment Link — an
outbound link, like an affiliate link. Stripe hosts the whole flow and this site receives
nothing back.

A server-side Checkout integration with a donations table was specified and declined. It would
have stored donor emails and messages, which would falsify four published claims: "nothing
stored, no signup", "your numbers never leave your device", "no database", and the CCPA
statement that we hold no personal information to disclose or delete. Before adding any
feature that receives user data, check it against `/privacy/` and the homepage trust block
first — those are promises, not copy.

**Dev affordances must not ship.** `AdSlot` rendered a grey "Ad slot — 728 × 90" placeholder
to real visitors while ads were disabled, despite a comment saying it rendered nothing in
production. It is now gated on `import.meta.env.DEV`.
