/**
 * Tool guide shape. The tool layout unpacks `terms` and `interpreting` as
 * [heading, body] pairs. A plain string there does not fail the build — it
 * renders its first two characters as heading and body. The Baseline shipped
 * with "E" / "v" where three explanations should have been, and nothing
 * noticed until someone read the page.
 */
import { describe, it, expect } from 'vitest';
import { TOOLS } from '../../data/tools.js';
import * as G from '../../data/tool-guides.js';

const guideFor = G.guideFor ?? (slug => (G.TOOL_GUIDES ?? G.default ?? {})[slug]);

describe('every live tool has a correctly shaped guide', () => {
  for (const tool of TOOLS.filter(t => t.live && t.slug)) {
    const g = guideFor(tool.slug);
    if (!g) continue;
    it(tool.slug, () => {
      for (const key of ['terms', 'interpreting']) {
        for (const item of g[key] ?? []) {
          expect(Array.isArray(item), `${key} entry must be [heading, body]`).toBe(true);
          expect(item).toHaveLength(2);
          expect(item[0].length, `${key} heading too short`).toBeGreaterThan(2);
          expect(item[1].length, `${key} body too short`).toBeGreaterThan(20);
        }
      }
      for (const step of g.howTo ?? []) {
        expect(typeof step).toBe('string');
        expect(step.length).toBeGreaterThan(10);
      }
    });
  }
});
