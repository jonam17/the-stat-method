// Sitemap <lastmod> (SEO audit, v2.54.2). Google uses lastmod only when it is consistently accurate,
// so only pages with a real content date carry one: articles (updated, else published) and Library
// entries (the date their figures were last checked against the source). Tool, hub and policy pages
// carry none rather than a guessed date. Read from the files with fs + js-yaml, because astro.config
// cannot use astro:content.
import { readdirSync, readFileSync, existsSync } from 'node:fs';
import yaml from 'js-yaml';

const KIND_SLUG = { vitamin: 'vitamins', mineral: 'minerals', other: 'other-nutrients' };
const day = d => (d instanceof Date ? d : new Date(d)).toISOString().slice(0, 10);
const files = (dir, ext) => (existsSync(dir) ? readdirSync(dir).filter(f => ext.some(e => f.endsWith(e))) : []);

/** Map of site path ("/articles/x/") to YYYY-MM-DD. Drafts are skipped (they are not built anyway). */
export function lastmodMap(root = '.') {
  const map = {};
  const c = `${root}/src/content`;
  for (const f of files(`${c}/articles`, ['.md', '.mdx'])) {
    const fm = readFileSync(`${c}/articles/${f}`, 'utf8').match(/^---\n([\s\S]*?)\n---/);
    if (!fm) continue;
    const d = yaml.load(fm[1]);
    if (d.draft) continue;
    const when = d.updated || d.published;
    if (when) map[`/articles/${f.replace(/\.mdx?$/, '')}/`] = day(when);
  }
  const lib = (dir, path, date) => {
    for (const f of files(`${c}/${dir}`, ['.yaml'])) {
      const d = yaml.load(readFileSync(`${c}/${dir}/${f}`, 'utf8'));
      const when = date(d);
      if (!d.draft && when) map[path(d, f.replace(/\.yaml$/, ''))] = day(when);
    }
  };
  lib('nutrients', (d, id) => `/library/${KIND_SLUG[d.kind]}/${id}/`, d => d.source?.checked);
  lib('exercises', (d, id) => `/library/exercises/${id}/`, d => d.checked);
  lib('foods', (d, id) => `/library/foods/${id}/`, d => d.checked);
  lib('fast-food', (d, id) => `/library/fast-food/${id}/`, d => d.source?.checked);
  return map;
}
