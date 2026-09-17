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
  label, children, dark, className = '', incomplete, incompleteNote, notice,
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
        : children}
  </section>
);

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
