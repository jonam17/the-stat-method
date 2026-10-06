# Exercise workflow

How a muscle group's exercises are added to the Library. Written to be followed cold — by the
maintainer, or by an AI session with no memory of how the library was built. **Read all of it before
adding an exercise.**

`src/content/exercises/leg-extension.yaml` is the reference example. Copy its shape exactly.

---

## The standard

- **Five well-supported choices per muscle group, not a ranked top five.** The research rarely
  supports a strict ranking; every page says so. Mix equipment — free weights, machines, cables, body
  weight — so the group works in different gyms and at home.
- **No single official source exists for exercises**, unlike the nutrients. So every claim is cited to
  research that was opened and read, and **every evidence item is labelled with its kind**:

  | Kind | What it is | Weight |
  |---|---|---|
  | `training` | Muscle size or strength measured over weeks of training | Strongest |
  | `review` | A systematic review, meta-analysis or position stand | Strong |
  | `length` | A training study about the muscle length or range of motion used | Supporting |
  | `emg` | Muscle activation measured during a session | Supporting only |

- **The inclusion rule:** an exercise is listed only if at least one `training` or `review` item
  supports it. EMG shows a muscle working during a set, not that it grows or gets stronger over weeks —
  it can add detail, never be the reason an exercise is here. A test enforces this.
- **Say what a study did not measure.** A trial of strength is not evidence about muscle size; a trial in
  untrained women is not proof for experienced men. Put that in the evidence item itself.
- **Never write a PMID, DOI or volume from memory.** Only what was on screen from the source.
- **No rehabilitation or injury advice.** Every page carries the same line: stop an exercise that causes
  significant or unusual pain and have it assessed. Exercises for injuries or conditions wait for the
  clinical review (PENDING.md).
- **Every file is a draft until a person has checked it.** Only the maintainer's word removes `draft: true`.

## Steps — one muscle group per session (two at most)

**1. Choose candidates.** Five exercises across different equipment. For each, find a training study or
review before writing anything; if none exists, choose another exercise.

**2. Read each source** at the tier `docs/citation-checklist.md` describes — the full text where it
carries the entry's main claim, the published abstract at least for anything else. Note the population
(who, how many, trained or not), the duration, and what was measured.

**3. Write the file** in `src/content/exercises/<slug>.yaml`:

| Field | What goes in it |
|---|---|
| `name`, `group`, `dek` | The `dek` (40–200 characters) is the one-line reason it's here |
| `primary`, `secondary` | Muscles, in plain words |
| `equipment` | One or more of the keys in `src/data/exercise-meta.js` |
| `progressionClass` | The Progressive Overload Calculator's class — large compound, moderate compound, isolation, small isolation. The page shows its weight-step band and links to the calculator |
| `whyHere` | Two to four sentences, each claim cited `[n]` |
| `evidence` | One item per finding, each with its `kind` and a citation. Population and limits inside the claim |
| `howTo` | Plain steps. A safety step needs no citation unless it claims an effect ("reduces injury") — then it needs one or goes |
| `alternatives` | Slugs of other exercise files; links appear only for published ones |
| `checked` | The date the sources were read |
| `references` | Only works cited in the text, details as seen on screen |

**4. Check.** Every marker is a single number in brackets — `[1] [2]`, never `[1, 2]`.

```bash
npm test && npm run build
```

`exercises.test.js` checks the inclusion rule, that every evidence item is labelled and cited, that every
marker has a reference and every reference is cited, that groups, equipment, classes and alternatives
exist, and that no group has more than five exercises.

**5. Write the review record** at `docs/citation-reviews/exercises-<group>.md`: for each exercise, what was
read and where, the population, and a table of every claim with the passage that supports it, ★ on the
claims most worth spot-checking. Then leave every file `draft: true`.

**6. Review locally, then hand over.** `npm run dev` shows drafts at `/library/exercises/`. Look at every
page at phone width and in dark mode. The maintainer reviews the record and the pages, and says so; the
drafting session then removes `draft: true` from the reviewed files and prepares the release, as for
articles (`docs/ARTICLE-WORKFLOW.md`, step 5).

## Images

None yet, by decision: a wrong drawing of form is worse than none. Options for adding images or
animations are recorded in PENDING.md (roadmap item 6); whichever is chosen must load nothing from a
third party and must not depict a protected character or a copyrighted illustration.
