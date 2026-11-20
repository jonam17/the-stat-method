# Resources review

What was checked for each entry added to `/resources/`, where, and what was deliberately left out
(CONVENTIONS §16). Newest review first. Prices and plan limits go stale: re-check an entry before
relying on a figure in it.

---

## 2026-11-19 — v2.46.2

Six candidates reviewed for **People worth following**. **None was added.** This release records the
reasons; `src/data/resources.js` is unchanged.

| Candidate | Checked against | What was found | Decision |
|---|---|---|---|
| Chris Bumstead | Business Wire release, April 2025, "RAW Nutrition Joins Forces with The Quality Group"; Fitt Insider copy of the same release; BarBend news item on his Gymshark ownership announcement | Co-owner of the supplement brand RAW Nutrition. With RAW's CEO he also became co-owner of The Quality Group (release). BarBend reports a part-ownership stake in Gymshark. | Excluded. Owns a supplement company. |
| More Plates More Dates (Derek) | Startup Fortune interview (page dated 22 Jul 2026); a sponsored piece on jpost.com; the Chartable listing for a Modern Wisdom episode | In the interview he describes his work as the More Plates More Dates brand, his supplement company Gorilla Mind and his hormone-therapy clinic Marek Health. The other two sources call him a founder of Gorilla Mind. | Excluded. Owns a supplement company and a clinic. |
| Jeremy Ethier | builtwithscience.com (home page, About page, blog index); two blog posts read in full: "3 Days vs 6 Days Split" and "Train a Muscle Every Day" | Describes himself as a kinesiologist with NASM and FMS certification. The site sells an app, coaching, a cookbook, resistance bands, custom plans and a whey protein isolate. The two posts have no reference list: one links to a single preprint, the other cites no study by author, year or journal and links only to the site's own pages. | Left out for now. Rigour not shown (below). |
| Matt Ogus | mattogus.teachable.com (two course pages); TrainHeroic marketplace listings | Sells training programs, including a monthly subscription. His own course page describes his approach as the middle point between what is most "scientifically optimal" and what is practical. No source found in which he cites studies. A claim that he sells supplements appears only on fan sites and is not repeated. | Left out. Rigour not shown (below). |
| Steak and Butter Gal | not researched | Excluded on the maintainer's first view recorded in the backlog: the site's evidence does not support a carnivore-only message. | Excluded. |
| Gorilla Mind | not researched | A supplement brand. Brands appear only through the scorecard method (backlog item 12). | Excluded. |

**What "left out" means for Ethier and Ogus.** The Resources page says entries are reasonably
rigorous. For these two, that could not be shown from what was readable: for Ethier, two of the
eight posts on his blog index were read, and neither had a reference list; his videos were not
checked, because they cannot be read here; for Ogus, no source was found. It is not a finding that
their advice is wrong. Either can be reconsidered if a reviewer reads their cited sources (for
Ethier, the references shown in his videos).

**Competing interests found.** Ethier and Ogus sell programs; Ethier's site also sells a whey protein
and equipment. Bumstead and Derek own supplement companies, so any entry would have to state that.

**Deliberately left out.** Follower and subscriber counts: the figures found disagree between
sources and are the creators' own marketing. Net-worth and biography pages: low-quality sources that
contradict each other.

---

## 2026-10-14 — v2.21.0

Added under **Tracking & data**: Hevy, Strava. Under **Testing & clinical services**: BodySpec,
DexaFit. Under **Equipment**: glass meal-prep containers, portion-control containers, pressure
cooker or multicooker. None is an affiliate link.

| Entry | Checked against | What the entry says, and where it comes from |
|---|---|---|
| Hevy | hevyapp.com; help centre, "Hevy Pro Subscription — How to get Pro and What Does It Include" | iOS, Android, web, Apple Watch, Wear OS; follow, like and comment on others' workouts (homepage). Free: 4 routines, 7 custom exercises, 3 months of history; Pro removes the limits and adds a warm-up calculator (help article). Made by Hevy Studios, S.L. |
| Strava | strava.com/subscription; strava.com/pricing; help centre, "Privacy Controls" | Subscription features include "routes, segment leaderboards, advanced training analysis" (subscription page). Activities set to Everyone contribute to Strava Metro and the Global Heatmap by default; opt out under Privacy Controls (help article). Prices not stated on the site: they vary by country. |
| BodySpec | bodyspec.com | Storefronts and mobile clinics; twelve metro areas listed; scans "start at $39.95" (the same page also says $39 and $40 — the entry says "around $40"); under 15 minutes; reports regional body fat, lean mass, visceral fat, bone density. |
| DexaFit | dexafit.com | DEXA, VO2 max and RMR testing; "40+ states"; "independently owned and operated" locations; sells biomarker panels "alongside your DexaFit results". |
| Equipment | — | Product categories, not products. The entries make no health or performance claim, only one about consistency. |

**Competing interests.** None of the four companies has any relationship with this site. Within the
entries: DexaFit sells lab panels alongside its scans, which the entry states. Hevy and Strava are
freemium, so their free tiers exist partly to sell the paid one; the entries say what each tier holds.

**Caveats drawn from this site's own articles, not the providers.** DEXA readings vary between
machines and between scans (*Body fat percentage: which method to actually trust*). Device calorie
figures run high (*Why your watch overestimates calories burned*).

**Deliberately left out.**

- **A DEXA directory.** Two providers with wide coverage, not a nationwide list, which would need
  constant upkeep and would go stale.
- **Brand names for equipment.** Recommending a category needs no product testing; recommending a
  brand would, and none was done.
- **Prices for Hevy Pro and DexaFit.** Neither price was on a page that could be read; none is stated.
- **"Most popular" claims.** Strava's and Hevy's user counts are their own marketing figures and are
  not repeated.

**Correction made in the same release.** The Equipment group carried a "Contains affiliate links"
label, and its three items an "Affiliate" tag, with no links and no affiliate relationship. Both
labels were removed. Affiliate links, when they come, will go through a component that adds the
disclosure and `rel="sponsored nofollow"` itself.
