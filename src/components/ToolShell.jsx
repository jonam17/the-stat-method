import { useState, useId, useEffect } from 'react';

/** Shared primitives so every calculator looks and behaves the same. */

export function Seg({ label, value, onChange, options, hint }) {
  const uid = useId();
  const hintId = hint ? `${uid}-hint` : undefined;   // F-017
  return (
    <div className="field">
      {label && <label>{label}</label>}
      <div className="seg full" role="group" aria-label={label}
           aria-describedby={hintId}>
        {options.map(([v, lbl]) => (
          <button key={v} type="button" aria-pressed={String(value) === String(v)}
                  onClick={() => onChange(v)}>{lbl}</button>
        ))}
      </div>
      {hint && <p className="hint" id={hintId}>{hint}</p>}
    </div>
  );
}

/**
 * Numeric field.
 *
 * `min` and `max` are REQUIRED (audit F-013). Every calculator input is a
 * physical quantity with a plausible range, and nothing previously bounded any
 * of them — a negative weight produced a negative BMI labelled "Underweight",
 * and a 1 cm height produced a 243% body-fat reading. Callers must state the
 * range; there is no default, so a new field cannot silently be unbounded.
 *
 * Out-of-range values are reported via `onRangeError` rather than clamped, so
 * the tool can decline to compute instead of quietly substituting a number the
 * user did not enter.
 */
export function Num({
  label, value, onChange, tag, hint, placeholder, id,
  min, max, step = 'any', inputMode = 'decimal', onRangeError,
}) {
  const uid = useId();
  const fid = id || `f-${uid}`;                       // F-016: collision-free
  const hintId = hint ? `${fid}-hint` : undefined;    // F-017
  const errId = `${fid}-err`;

  if (process.env.NODE_ENV !== 'production' && (min == null || max == null)) {
    console.warn(`Num("${label}") is missing min/max — see audit F-013.`);
  }

  const n = value === '' || value == null ? null : Number(value);
  const outOfRange =
    n != null && Number.isFinite(n) && (
      (min != null && n < min) || (max != null && n > max)
    );

  const handle = e => {
    const v = e.target.value;
    onChange(v);
    if (onRangeError) {
      const num = v === '' ? null : Number(v);
      onRangeError(num != null && Number.isFinite(num) &&
        ((min != null && num < min) || (max != null && num > max)));
    }
  };

  return (
    <div className="field">
      {label && <label htmlFor={fid}>{label}</label>}
      <div className="unit">
        <input
          id={fid}
          type="number"
          inputMode={inputMode}          // F-018: decimal keypad on mobile
          step={step}
          min={min}
          max={max}
          value={value}
          placeholder={placeholder}
          aria-describedby={[hintId, outOfRange ? errId : null].filter(Boolean).join(' ') || undefined}
          aria-invalid={outOfRange || undefined}
          onWheel={e => e.currentTarget.blur()}   // F-018: no silent scroll edits
          onChange={handle}
        />
        {tag && <span className="tag">{tag}</span>}
      </div>
      {outOfRange && (
        <p className="hint err" id={errId}>
          Enter a value between {min} and {max}{tag ? ` ${tag}` : ''}.
        </p>
      )}
      {hint && <p className="hint" id={hintId}>{hint}</p>}
    </div>
  );
}

export function Select({ label, value, onChange, children, hint, id }) {
  const uid = useId();
  const fid = id || `s-${uid}`;                       // F-016
  const hintId = hint ? `${fid}-hint` : undefined;    // F-017
  return (
    <div className="field">
      {label && <label htmlFor={fid}>{label}</label>}
      <select id={fid} value={value} aria-describedby={hintId}
              onChange={e => onChange(e.target.value)}>{children}</select>
      {hint && <p className="hint" id={hintId}>{hint}</p>}
    </div>
  );
}

/**
 * Results panel.
 *
 * `incomplete` renders a prompt instead of computed output (audit F-012).
 * Results are a function of VALID input; absent input is a state, not a zero.
 * Previously every tool computed from inputs coerced to 0, so clearing a field
 * labelled the user "Underweight" and produced goal weights from a height of 0.
 *
 * The live region is deliberately NOT on this element (audit F-014). Announcing
 * an entire results panel on every keystroke makes these tools harder to use
 * with a screen reader than no live region at all. Use <LiveSummary> to announce
 * a short, debounced summary instead.
 */
export const Panel = ({
  label, children, dark, className = '', incomplete, incompleteNote, notice, copyExtra,
}) => (
  <section className={`panel ${dark ? 'results' : ''} ${className}`}>
    <div className="panel-label">{label}</div>
    {dark && notice
      // `notice` takes precedence over everything: it is used for out-of-scope
      // input (audit F-005), where showing results would be wrong rather than
      // merely premature.
      ? <p className="notice">{notice}</p>
      : dark && incomplete
        ? <p className="goaltag">{incompleteNote || 'Fill in the fields to see your results.'}</p>
        : <>{children}{dark && <ResultActions extra={copyExtra} />}</>}
  </section>
);

/**
 * Save results: copy as text, or save as PDF through the browser.
 *
 * WHY IT READS THE PAGE. Seventeen calculators render results through BigStat
 * and StatStrip, and every input through Seg / Num / Select / TimePicker. Reading
 * those back at click time means no calculator has to describe its own output,
 * so the saved text cannot drift from what is actually on screen.
 *
 * WHERE IT RENDERS, AND WHY THAT IS THE SAFETY MECHANISM. Panel only renders
 * this in its normal branch. A safety rail replaces that branch with `notice`,
 * and an incomplete form replaces it with a prompt — so a refused result has no
 * button and nothing to copy. No separate check is needed or wanted; a check
 * could be forgotten, placement cannot.
 *
 * `extra` carries results that live outside the shared components — zone
 * tables, plate breakdowns, splits — which reading BigStat alone would drop.
 *
 * Nothing leaves the device. Copying uses the clipboard; PDF uses the browser's
 * own print dialog, so no library adds weight to tool pages.
 */
const text = el => (el?.textContent || '').replace(/\s+/g, ' ').trim();

function readInputs(root) {
  const out = [];
  root.querySelectorAll('.panel:not(.results) .field').forEach(f => {
    const label = text(f.querySelector(':scope > label'));
    if (!label) return;
    let v = '';
    const pressed = f.querySelector('[aria-pressed="true"]');
    const selects = f.querySelectorAll('select');
    const input = f.querySelector('input:not([type="hidden"])');
    if (pressed) v = text(pressed);
    else if (selects.length > 1) {                       // TimePicker: hh : mm AM
      const [h, m, ap] = [...selects].map(x => x.options[x.selectedIndex]?.text || '');
      v = `${h}:${m} ${ap}`.trim();
    } else if (selects.length === 1) v = selects[0].options[selects[0].selectedIndex]?.text || '';
    else if (input && input.value !== '') v = `${input.value} ${text(f.querySelector('.tag'))}`;
    if (v.trim()) out.push(`${label}: ${v.trim()}`);
  });
  return out;
}

function readResults(panel) {
  const out = [];
  const num = text(panel.querySelector('.cal .num'));
  if (num) out.push(`${text(panel.querySelector('.cal .u')) || 'Result'}: ${num}`);
  panel.querySelectorAll('.strip .stat').forEach(st => {
    const l = text(st.querySelector('.l')), v = text(st.querySelector('.v'));
    if (l && v) out.push(`${l}: ${v}`);
  });
  return out;
}

export function ResultActions({ extra = [] }) {
  const [copied, setCopied] = useState(false);

  const build = (btn) => {
    const panel = btn.closest('.results');
    const root = btn.closest('.tool, main, body');
    const name = text(document.querySelector('h1')) || 'Calculator';
    const inputs = readInputs(root);
    const results = [...readResults(panel), ...extra.filter(Boolean)];
    const date = new Date().toLocaleDateString('en-US',
      { year: 'numeric', month: 'short', day: 'numeric' });
    return [
      `The Stat Method — ${name}`,
      `Saved ${date}`,
      ...(inputs.length ? ['', 'YOUR INPUTS', ...inputs] : []),
      '', 'RESULTS', ...results,
      '', 'Calculated from published equations. See the method on the page for their limits.',
      '', window.location.href.split('#')[0],
    ].join('\n');
  };

  const copy = async (e) => {
    const t = build(e.currentTarget);
    try { await navigator.clipboard.writeText(t); }
    catch {                                  // older browsers / non-secure contexts
      const ta = Object.assign(document.createElement('textarea'), { value: t });
      ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.appendChild(ta); ta.select();
      try { document.execCommand('copy'); } finally { ta.remove(); }
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  return (
    <div className="result-actions">
      <button type="button" className="ra-copy" onClick={copy}>
        {copied ? 'Copied' : 'Copy results'}
      </button>
      <button type="button" className="ra-pdf" onClick={() => window.print()}>
        Save as PDF
      </button>
      <span className="sr-only" role="status" aria-live="polite">
        {copied ? 'Results copied to clipboard' : ''}
      </span>
    </div>
  );
}

/**
 * Short, debounced announcement of a result for assistive technology (F-014).
 * Visually hidden. Keep the text to one concise sentence — this is what a
 * screen-reader user hears, and it should not recite the whole panel.
 */
export function LiveSummary({ text, delay = 600 }) {
  const [announced, setAnnounced] = useState('');
  useEffect(() => {
    const t = setTimeout(() => setAnnounced(text || ''), delay);
    return () => clearTimeout(t);
  }, [text, delay]);
  return (
    <p className="sr-only" aria-live="polite" aria-atomic="true">{announced}</p>
  );
}

export const BigStat = ({ value, unit, note }) => (
  <>
    <div className="cal">
      <div className="num">{value}</div>
      {unit && <div className="u">{unit}</div>}
    </div>
    {note && <p className="goaltag">{note}</p>}
  </>
);

export const StatStrip = ({ items }) => (
  <div className="strip">
    {items.map(s => (
      <div className="stat" key={s.label}>
        <div className="l">{s.label}</div>
        <div className="v">{s.value}{s.unit && <small>{s.unit}</small>}</div>
      </div>
    ))}
  </div>
);

export const Method = ({ children }) => (
  <details className="method">
    <summary>Method &amp; sources</summary>
    {children}
  </details>
);

/** Metric/imperial toggle with conversion, shared by the body-based tools. */
export function useUnits(initial = 'metric') {
  const [units, setUnits] = useState(initial);
  return { units, setUnits, imperial: units === 'imperial' };
}

/**
 * Twelve-hour time picker: hour (01–12), minute, and AM/PM.
 *
 * Replaces `<input type="time">`, whose rendering and 12/24-hour behaviour is
 * decided by the browser and the operating system locale — so two people on the
 * same page could see different controls, and users on a 24-hour locale were
 * shown a 24-hour field on a US-facing site.
 *
 * Value in and out stays "HH:MM" 24-hour, so nothing downstream changes.
 */
const pad2 = n => String(n).padStart(2, '0');

export function TimePicker({ label, value, onChange, id, hint }) {
  const uid = useId();
  const fid = id || `t-${uid}`;
  const hintId = hint ? `${fid}-hint` : undefined;

  const [hh, mm] = String(value || '00:00').split(':').map(Number);
  const hour24 = Number.isFinite(hh) ? hh : 0;
  const minute = Number.isFinite(mm) ? mm : 0;
  const meridiem = hour24 >= 12 ? 'PM' : 'AM';
  const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;

  const emit = (h12, min, mer) => {
    const h24 = mer === 'AM' ? (h12 === 12 ? 0 : h12) : (h12 === 12 ? 12 : h12 + 12);
    onChange(`${pad2(h24)}:${pad2(min)}`);
  };

  return (
    <div className="field">
      {label && <label htmlFor={fid} id={`${fid}-label`}>{label}</label>}
      <div className="timepick" role="group" aria-labelledby={`${fid}-label`}>
        <select id={fid} value={hour12} aria-label="Hour"
                aria-describedby={hintId}
                onChange={e => emit(+e.target.value, minute, meridiem)}>
          {Array.from({ length: 12 }, (_, i) => i + 1).map(h => (
            <option key={h} value={h}>{pad2(h)}</option>
          ))}
        </select>
        <span className="timepick-sep" aria-hidden="true">:</span>
        <select value={minute} aria-label="Minutes"
                onChange={e => emit(hour12, +e.target.value, meridiem)}>
          {Array.from({ length: 12 }, (_, i) => i * 5).map(m => (
            <option key={m} value={m}>{pad2(m)}</option>
          ))}
        </select>
        <select className="tp-mer" value={meridiem} aria-label="AM or PM"
                onChange={e => emit(hour12, minute, e.target.value)}>
          <option value="AM">AM</option>
          <option value="PM">PM</option>
        </select>
      </div>
      {hint && <p className="hint" id={hintId}>{hint}</p>}
    </div>
  );
}
