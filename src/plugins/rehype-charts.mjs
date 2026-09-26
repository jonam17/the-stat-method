/**
 * Replaces <figure data-chart="id"></figure> in an article with a rendered chart.
 *
 * A placeholder, rather than converting articles to MDX, so articles stay plain
 * Markdown and a chart sits exactly where the author puts it. An unknown id
 * FAILS THE BUILD rather than rendering an empty figure — a missing chart
 * should be noticed before readers notice it.
 */
import { visit } from 'unist-util-visit';
import { fromHtml } from 'hast-util-from-html';
import { CHARTS } from '../charts/definitions.js';
import { renderChart } from '../charts/render.js';

// HTML written inside Markdown reaches rehype as a `raw` text node, not a parsed
// element — so matching on `figure` elements alone finds nothing. Match both, so
// this keeps working whether or not HTML is parsed upstream.
const RAW = /^\s*<figure\s+data-chart="([a-z0-9-]+)"\s*>\s*<\/figure>\s*$/i;

export function rehypeCharts() {
  return tree => {
    visit(tree, (node, index, parent) => {
      if (!parent) return;
      let id = null;
      if (node.type === 'raw') id = node.value?.match(RAW)?.[1] ?? null;
      else if (node.type === 'element' && node.tagName === 'figure') id = node.properties?.dataChart ?? null;
      if (!id) return;
      const build = CHARTS[id];
      if (!build) throw new Error(`rehype-charts: no chart named "${id}". Defined: ${Object.keys(CHARTS).join(', ')}`);
      const rendered = fromHtml(renderChart(id, build()), { fragment: true });
      parent.children.splice(index, 1, ...rendered.children);
      return index + rendered.children.length;
    });
  };
}
