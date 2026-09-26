#!/usr/bin/env node
/**
 * npm run new:article -- "Title of the article" Category
 *
 * Creates src/content/articles/<slug>.md already shaped to the template: key
 * takeaways, contents list, five sections with summaries, a conclusion and a
 * reference list, dated for the next Sunday nothing else is scheduled on.
 *
 * IT IS CREATED AS A DRAFT, and stays one until someone deliberately removes
 * `draft: true`. A scaffold is mostly placeholders; without this, a skeleton
 * would publish itself on its Sunday. `qa:articles` also refuses to let a
 * non-draft article ship while any TODO remains, as a second line of defence.
 */
import { readFileSync, readdirSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const DIR = 'src/content/articles';
const CATEGORIES = ['Nutrition', 'Exercise', 'Health', 'Recovery'];
const [title, category] = process.argv.slice(2);

if (!title || !CATEGORIES.includes(category)) {
  console.error(`\nUsage: npm run new:article -- "Title" <${CATEGORIES.join('|')}>\n`);
  process.exit(1);
}

const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60);
const path = join(DIR, `${slug}.md`);
if (existsSync(path)) { console.error(`\n${path} already exists.\n`); process.exit(1); }

// Warn on likely duplicates before creating anything.
const existing = readdirSync(DIR).filter(f => /\.mdx?$/.test(f)).map(f => {
  const s = readFileSync(join(DIR, f), 'utf8');
  return { file: f, title: (s.match(/^title:\s*"?(.*?)"?\s*$/m) || [])[1] || f,
           date: (s.match(/^published:\s*(\S+)/m) || [])[1] };
});
const words = new Set(title.toLowerCase().match(/[a-z]{4,}/g) || []);
const similar = existing.filter(e =>
  [...(e.title.toLowerCase().match(/[a-z]{4,}/g) || [])].filter(w => words.has(w)).length >= 2);
if (similar.length) {
  console.log('\n  Possible overlap with existing articles — check before writing:');
  similar.forEach(e => console.log(`    · ${e.title}  (${e.file})`));
}

// Next Sunday on or after today that no article already occupies.
const taken = new Set(existing.map(e => e.date));
const d = new Date(); d.setUTCHours(0, 0, 0, 0);
d.setUTCDate(d.getUTCDate() + ((7 - d.getUTCDay()) % 7));
while (taken.has(d.toISOString().slice(0, 10))) d.setUTCDate(d.getUTCDate() + 7);
const date = d.toISOString().slice(0, 10);

const S = ['section-one', 'section-two', 'section-three', 'section-four', 'bottom-line'];
const L = ['TODO Section one', 'TODO Section two', 'TODO Section three', 'TODO Section four', 'The bottom line'];
const summary = n => `<aside class="summary">
<span class="summary-label">Summary</span>
<div class="summary-body"><p>TODO One or two sentences restating section ${n} — no new claims.</p></div>
</aside>`;

const body = S.map((id, i) => `<h2 id="${id}">${L[i]}</h2>

TODO Write this section. Cite each claim with a numbered marker matching its place in references.
${i < S.length - 1 ? '\n' + summary(i + 1) + '\n' : ''}`).join('\n');

writeFileSync(path, `---
title: "${title.replace(/"/g, '\\"')}"
dek: "TODO One sentence, 70–165 characters, stating what the reader will learn."
category: ${category}
conclusion: "TODO A closing line written for this article — a decision, a caution, or a reframing. Not a template."
published: ${date}
draft: true
readMinutes: 7
# aiAssisted: true renders "Drafted with AI assistance, then edited and
# fact-checked by a human." Set false ONLY if no AI drafted any of it.
aiAssisted: true
citationsVerified: none
author: The Stat Method
relatedTool: TODO-tool-slug
keyTakeaways:
  - "TODO Takeaway one."
  - "TODO Takeaway two."
  - "TODO Takeaway three."
  - "TODO Takeaway four."
toc:
${S.map((id, i) => `  - { id: "${id}", label: "${L[i]}" }`).join('\n')}
references:
  - text: "TODO Author A, Author B. Title. Journal, Year;Vol(Issue):Pages."
---

${body}
`);

console.log(`\n  Created ${path}`);
console.log(`  Scheduled for Sunday ${date} — but as a DRAFT, so it will not publish until`);
console.log(`  you remove "draft: true". Follow docs/ARTICLE-WORKFLOW.md.\n`);
