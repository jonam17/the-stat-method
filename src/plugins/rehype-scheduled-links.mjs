/**
 * Links to articles that are not live yet render as plain text.
 *
 * A published article can now link to a scheduled one without sending readers
 * to a 404: until the target's date arrives, the link's words appear unlinked;
 * the daily 10:00 UTC rebuild on that date turns them into a link. Nobody has to
 * remember to add the link later — which is exactly the step that used to be
 * deferred and forgotten.
 *
 * It works because every build starts by clearing Astro's render cache
 * (scripts/clear-render-cache.mjs), so each day's build re-renders every article
 * against that day's date. The rule is the site's one publishing rule,
 * isPublished() in src/data/publishing.js — the same one that decides which
 * article pages exist.
 *
 * Local preview (`npm run dev`) shows drafts and scheduled articles, so links
 * are left alone there.
 */
import { visit, SKIP } from 'unist-util-visit';
import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { isPublished } from '../data/publishing.js';

const DIR = 'src/content/articles';
const LINK = /^\/articles\/([a-z0-9-]+)\/?(?:#[^?]*)?$/;

/** slug → { draft, published } read from each article's front matter. Exported for tests. */
export function articleStates(dir = DIR) {
  const states = new Map();
  if (!existsSync(dir)) return states;
  for (const f of readdirSync(dir)) {
    if (!/\.mdx?$/.test(f)) continue;
    const fm = readFileSync(`${dir}/${f}`, 'utf8').match(/^---\r?\n([\s\S]*?)\r?\n---/)?.[1] ?? '';
    const date = fm.match(/^published:\s*["']?(\d{4}-\d{2}-\d{2})/m)?.[1];
    states.set(f.replace(/\.mdx?$/, ''), {
      draft: /^draft:\s*true\s*$/m.test(fm),
      published: date ? new Date(date) : null,       // midnight UTC, as Astro reads it
    });
  }
  return states;
}

export function rehypeScheduledLinks({ preview = false, now, states } = {}) {
  return tree => {
    if (preview) return;
    const known = states ?? articleStates();
    const at = now ?? new Date();
    visit(tree, 'element', (node, index, parent) => {
      if (node.tagName !== 'a' || !parent) return;
      const slug = String(node.properties?.href ?? '').match(LINK)?.[1];
      const target = slug && known.get(slug);
      if (!target) return;                            // not an article link (or a category page)
      if (target.published && isPublished(target, at)) return;
      parent.children.splice(index, 1, ...node.children);   // keep the words, drop the link
      return [SKIP, index];
    });
  };
}
