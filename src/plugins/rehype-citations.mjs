import { visit } from 'unist-util-visit';

/**
 * Turns `[1]` in article prose into a superscript link to the matching entry in
 * the References list.
 *
 * WHY: the credibility block told readers that "the numbered links in the text go
 * directly to the primary source". No article contained a single inline marker,
 * so that promise was false on every page — on the one subject the site stakes
 * its credibility on. This makes the promise true rather than removing it.
 *
 * Skips code and pre so array indexing in examples is untouched.
 */
export function rehypeCitations() {
  return tree => {
    visit(tree, 'text', (node, index, parent) => {
      if (!parent || parent.tagName === 'code' || parent.tagName === 'pre') return;
      if (!/\[\d+\]/.test(node.value)) return;

      const out = [];
      let last = 0;
      const re = /\[(\d+)\]/g;
      let m;
      while ((m = re.exec(node.value)) !== null) {
        if (m.index > last) out.push({ type: 'text', value: node.value.slice(last, m.index) });
        const n = m[1];
        out.push({
          type: 'element', tagName: 'sup',
          properties: { className: ['cite-marker'] },
          children: [{
            type: 'element', tagName: 'a',
            properties: {
              href: `#ref-${n}`,
              'aria-label': `Reference ${n}`,
              'data-cite': n,
            },
            children: [{ type: 'text', value: n }],
          }],
        });
        last = m.index + m[0].length;
      }
      if (last < node.value.length) out.push({ type: 'text', value: node.value.slice(last) });
      parent.children.splice(index, 1, ...out);
      return index + out.length;
    });
  };
}
