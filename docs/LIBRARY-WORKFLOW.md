# Library workflow

How a vitamin or mineral page is added. Written to be followed cold — by the maintainer, or by an
AI session with no memory of how the library was built. **Read all of it before adding a nutrient.**

`src/content/nutrients/vitamin-d.yaml` is the reference example. Copy its shape exactly.

---

## The standard

- **One source for every intake value**: the NIH Office of Dietary Supplements *Health
  Professional* fact sheet for that nutrient (`ods.od.nih.gov/factsheets/<Name>-HealthProfessional/`).
  It presents the official Dietary Reference Intakes set by the National Academies. A test fails
  if `source.url` is on any other site.
- **Every number is opened and read on the fact sheet.** Never from memory — not even a value that
  "everyone knows". If a number is not on the fact sheet, it does not go in the file.
- **United States first.** Intake figures, food examples and survey data are American. Other
  countries' guidance appears only in the disagreements section.
- **No dosing advice.** The page reports official values. Any dose outside them appears only as a
  study parameter: "participants took 50 mcg a day", never "a good dose is 50 mcg".
- **Every file is a draft until a person has checked it.** The page footer says it was "edited and
  fact-checked by a human". Only the maintainer removes `draft: true`.

## Steps

**1. Fetch the Health Professional fact sheet** and note its *Last modified* date — it goes in
`source.lastModified`. Work from this one page.

**2. Intake — the "Recommended Intakes" table.** Copy the rows for **19–50, 51–70 and over 70**,
for men and women, plus **pregnancy and breastfeeding on the 19–50 row**. Note whether the table is
an RDA or an AI (an asterisk usually marks AI) and set `intake.type`. Then write `eighteenNote` from
the **14–18** row: 18-year-olds fall in that bracket, and the site accepts ages 18 and over.

**3. Upper limit — the "Tolerable Upper Intake Levels" table.** Same rows. **Read the text around
the table to see what the limit covers**, and set `ul.appliesTo`:

| `appliesTo` | When | Examples |
|---|---|---|
| `total` | Food, drink and supplements combined | Vitamin D, calcium, iron, zinc |
| `supplemental` | Supplements and fortified foods only | **Magnesium, folate (folic acid), niacin** |
| `preformed` | Preformed vitamin A only, not beta-carotene | **Vitamin A** |

Getting this wrong is dangerous in both directions. Magnesium's upper limit is *lower* than its
recommended amount — that is correct, because it only covers supplements. **If a nutrient has no
upper limit**, leave out `ul.rows` and say so in `ul.note`. Many B vitamins, vitamin K and chromium
have none.

**4. Food sources — the food table.** Take the **five foods with the most per serving**, in order.
Mark fortified foods `fortified: true`. Leave out oils and extracts sold and used like supplements
(cod liver oil). Where the table gives a range, use `[low, high]`. Add a `short` label (26 characters
at most) for any name too long for the chart. Keep the `sources.rule` sentence identical across
files, changing only the nutrient's name.

**5. The prose fields**, each from the fact sheet's own section, each claim marked with `[n]`:

| Field | Fact sheet section |
|---|---|
| `does` | Introduction |
| `deficiency` | Deficiency |
| `atRisk` | Groups at risk of inadequacy — adults only |
| `usIntake` | Intakes and status — U.S. survey data |
| `evidence` | "and health" sections — see below |
| `disagreements` | Other countries' or societies' guidelines, if the sheet mentions them |
| `tooMuch` | Health risks from excessive intake |
| `interactions` | Interactions with medications — end by advising a doctor or pharmacist |
| `forms` *(optional)* | Where the sheet describes different forms — which comes from where |
| `absorption` *(optional)* | What helps or hinders absorption |
| `pairing` *(optional)* | A nutrient it is commonly sold with. Say what is claimed, what the evidence shows, and any risk the pairing brings — the vitamin D page's vitamin K section is the model |

Label a food's `form` only where the fact sheet says which form it contains. Never infer it.

**Evidence is the section that matters most.** Split it honestly: `established` (what the official
values rest on), `notSupported` (what trials have tested and not found), and `mixed`. Describe
large trials by who was studied and what they took. Never round a weak finding into a confident one.

**6. References.** Reference 1 is always the fact sheet. Add a reference only when it is **cited in
the text** and its details were **visible on screen** — a test fails if any reference is never cited.
Never write a PMID, DOI or volume from memory.

**7. Check.**

```bash
npm test && npm run build
```

`library.test.js` checks the brackets, that a total upper limit is never below the recommended
amount, that sources are highest first, that every marker has a reference and every reference is
cited, and that the file was checked on or after the source's last update.

**8. Review locally, then hand over.** `npm run dev` shows drafts at `/library/`. The maintainer
checks every value against the fact sheet, then removes `draft: true`. The Library tab appears in the
navigation once the first nutrient is published.

## Refreshing a page

When a fact sheet's *Last modified* date moves, recheck the file against it, then update both
`source.lastModified` and `source.checked`. A file checked before its source's last update is stale.
