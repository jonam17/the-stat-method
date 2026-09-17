# Contributing

## Adding a new calculator

Follow these in order. The last two are the ones that get forgotten.

1. **Write the maths in `src/engine/`.** Pure functions, no React, no DOM. Every formula
   gets a docstring naming its published source.
2. **Write tests before the UI.** `src/engine/__tests__/`. Cover the arithmetic *and* the
   behaviour — that a value rises when it should, that invalid input returns `null` rather
   than `NaN`, that unit conversions round-trip.
3. **Build the component** in `src/components/`. State and markup only. If you are writing
   arithmetic in a `.jsx` file, it belongs in the engine.
4. **Add the page** in `src/pages/tools/` using `ToolLayout`.
5. **Register the tool** in `src/data/tools.js` with `live: true`, a description, and
   `related` slugs for cross-linking.
6. **Add a guide entry** in `src/data/tool-guides.js` — a glossary for any jargon, two to
   four usage steps, and three or four interpretation sections. Keep the steps short: they
   render above the calculator, and pushing the tool below the fold is the fastest way to
   make a tool page worse. Put the substance in `interpreting`, which renders below the
   results.
7. **Write a cornerstone article** in `src/content/articles/` with `relatedTool` set to the
   new slug. A tool with no article has nothing to rank alongside it.
8. **Regenerate the previews** — `npm run docs`.
9. **Update `README.md`** — add the tool to the relevant section with its preview image,
   and update the counts in the header (tool count, test count).

## Keeping the docs in sync

Three things go stale the moment a tool is added:

| File | What to update |
|---|---|
| `README.md` | Tool list, preview images, tool/test counts in the header |
| `docs/previews/` | Run `npm run docs` — reads the registry, picks up new tools automatically |
| `TOOLS-ROADMAP.md` | Move the item to shipped; note any deviation from the plan |

The preview script verifies each tool produces a real result and throws no console errors,
so a broken tool fails the run rather than shipping a blank screenshot.

```bash
npm install                       # once — pulls in playwright
npx playwright install chromium   # once — downloads the browser (~120 MB)
npm run docs                      # build + capture all previews
```

The browser download is only needed for regenerating screenshots. Building and testing
the site do not require it.

Previews are written as WebP via `sharp` (which ships with Astro, so no extra dependency).
The script clears the output directory first, so a renamed or removed tool cannot leave an
orphaned image behind, and running it twice is safe.

If Chromium cannot be downloaded (some CI images and sandboxes block it), point at an
existing binary:

```bash
PLAYWRIGHT_CHROMIUM_PATH=/path/to/chrome npm run previews
```

## Before opening a PR

```bash
npm test          # all engine tests must pass
npm run build     # must build clean
npm run previews  # every tool must render a result
```

## Reporting a maths bug

These are the most valuable reports. Include the exact inputs, the result you got, the
result you expected, and a source if you have one. Corrections are logged publicly.

## What not to do

- Don't put calculation logic in components.
- Don't add a tool without an article, or an article without sources.
- Don't overstate certainty. If a formula has a known error range or a documented
  limitation, the tool should say so — that transparency is the product.

## Conventions

Before adding a tool, article, or component, read **`docs/CONVENTIONS.md`**. It records the
rules this codebase already follows and, for each, the bug that produced it.
