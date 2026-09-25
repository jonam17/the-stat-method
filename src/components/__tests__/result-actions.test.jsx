/**
 * The save buttons must never appear on a refused or incomplete result.
 *
 * That guarantee comes from WHERE ResultActions renders — inside Panel's normal
 * branch, which a safety rail's `notice` replaces entirely. This test pins the
 * placement, because moving the buttons one line outside that branch would
 * still build, still pass every engine test, and let someone copy a plan the
 * site had just refused to make.
 */
import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { Panel, BigStat } from '../ToolShell.jsx';

const render = props => renderToStaticMarkup(
  <Panel label="Result" dark {...props}><BigStat value="2,450" unit="kcal" /></Panel>
);

describe('save results — never on a refused or incomplete result', () => {
  it('renders the buttons alongside a normal result', () => {
    const html = render({});
    expect(html).toContain('result-actions');
    expect(html).toContain('Copy results');
    expect(html).toContain('Save as PDF');
  });

  it('renders NO buttons when a safety rail refuses (notice)', () => {
    const html = render({ notice: 'We are not going to build a plan for this one.' });
    expect(html).not.toContain('result-actions');
    expect(html).not.toContain('2,450');        // the refused number itself is gone
  });

  it('renders NO buttons while the form is incomplete', () => {
    const html = render({ incomplete: true });
    expect(html).not.toContain('result-actions');
  });

  it('notice wins even if the form is also incomplete', () => {
    const html = render({ notice: 'Refused.', incomplete: true });
    expect(html).not.toContain('result-actions');
  });

  it('light panels (inputs) never carry the buttons', () => {
    const html = renderToStaticMarkup(<Panel label="Your details"><p>inputs</p></Panel>);
    expect(html).not.toContain('result-actions');
  });
});
