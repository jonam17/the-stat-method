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
| Research / neutral | grey | `#4A4A46` | `#B8B8B2` |
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

**UPDATED 2026-09-19.** Both conditions were met: a CRITICAL advisory appeared against
astro <=7.2.7 (RCE via AVIF image optimization; authorization bypass in base-path handling),
and the peer conflict that previously required `--legacy-peer-deps` has resolved. Now on
astro 7.3.3 + @astrojs/mdx 8.0.1, `npm audit` clean.

**A note on the upgrade itself.** Deleting `package-lock.json` and installing from scratch
trips an npm resolver crash (`Cannot read properties of null (reading 'edgesOut')`). The
working sequence is: install once with `--legacy-peer-deps` to generate the lockfile, delete
`node_modules` only, then `npm install` normally. Do not delete the lockfile.

**The standing rule is unchanged: do not upgrade for its own sake — upgrade when an advisory
says to.** `npm audit` is the trigger, not a version number being available.

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

## 11. Links to the repository

Use `repoUrl()` from `site.config.js`, never a hand-written GitHub URL. The site tells readers
"every calculator on GitHub" and "the maths is on GitHub with unit tests" — those claims should
land on the code, not a profile page. `AUTHOR.repo` is the single place the repository name
lives.

The sponsors link is separate and correctly stays on the profile: `github.com/sponsors/<handle>`
is a GitHub account URL, not a repository one.

## 12. Claims about the site itself

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

## 13. Releases

**Every change that ships gets a tag and a README changelog entry.** No exceptions for small
changes — a security fix shipped untagged is exactly the one you will later need to find.

- **Version with semver.** `MAJOR.MINOR.PATCH`:
  - **Major** — brand, canonical URL, or anything that breaks a published promise or link
  - **Minor** — new content, tools, pages, resources, or features
  - **Patch** — fixes, wording, dependency and security updates with no new capability
- **Add the changelog entry to `README.md` in the same commit**, newest first, under the tag
  it ships as. Group by what a reader cares about, not by file.
- **Name phased work in the heading**, e.g. `v2.1.0 — Phase 1 Revision`.
- **Tag annotated, and push with `--follow-tags`** so the tag and commit cannot drift apart:

  ```bash
  git tag -a vX.Y.Z -m "Summary"
  git push --follow-tags
  ```

> *Learned:* between v2.0.0 and v2.1.0 several changes shipped untagged — including a
> security upgrade for a critical Astro advisory. They had to be reconstructed into the v2.1.0
> entry after the fact. Tagging at the time is cheaper than archaeology.

## 14. Features that export a result

**Anything that copies, prints, shares or saves a result must render inside the results
panel's normal branch** — the one a safety rail's `notice` replaces. Placement is the safety
mechanism: a refused result then has nothing to export, with no separate check to forget.

`src/components/__tests__/result-actions.test.jsx` pins this for Save results. Extend it for
any new export.

> *Learned:* the Macro Calculator builds its own results section rather than using `Panel`, so
> it needed its buttons placed by hand inside its own `!r.blocked` guard. A tool that bypasses
> the shared component also bypasses whatever the shared component was protecting.

## 15. Contact routes and the privacy policy

**Every way a reader can send us something must be described in `/privacy/`.** The site
collecting nothing is not the same as us receiving nothing. An address that invites mail, on a
page that says no personal information is collected, is a false statement the moment someone
writes.

## 16. Recommending people and products

- **Verify credentials against a current primary source** — the person's institution, not a
  list. Titles in submitted lists are frequently wrong.
- **State competing interests on the entry itself**, including shared ownership between listed
  resources.
- **Record deliberate exclusions** in the review that produced them, so an omission reads as a
  decision rather than an oversight.

## 17. Copying changes into the repository

**Copy with `rsync` from Terminal, not by dragging in Finder.** Finder hides files and folders
whose names start with a dot, so drag-and-drop silently skips `.github/` — and with it CI,
Dependabot and the issue forms. Nothing fails; the files are just absent.

From inside the repository, with the new build extracted to `~/Downloads/the-stat-method`:

```bash
rsync -av --exclude .git --exclude node_modules ~/Downloads/the-stat-method/ ./
git status
```

`rsync` copies hidden files and never touches `.git`. Read `git status` before committing —
a `.github/` path appearing there is the sign it worked.

> *Learned:* v2.2.0 and v2.3.0 both changed files under `.github/`, and neither change reached
> the repository. It was caught by checking the live repository against the build, not by any
> test — CI cannot report on a workflow step it was never given.

## 18. Listing articles

**Never call `getCollection('articles')` directly.** Use `publishedArticles()` from
`src/data/articles.js`. The publishing rule — not a draft, and dated today or earlier — lives in
one place, so no page can quietly show an article another page hides.

> *Learned:* six pages each wrote their own filter, and the search index wrote none. It would have
> published scheduled articles into live search before their date.

## 19. Writing articles

Follow `docs/ARTICLE-WORKFLOW.md`. The two rules most likely to be broken under time pressure:
**no claim from memory**, and **a person checks every AI-drafted article before it publishes** —
because `aiAssisted: true` tells readers exactly that.
