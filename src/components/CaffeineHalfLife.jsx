import { useState, useMemo } from 'react';
import {
  SOURCES, HALF_LIFE_MODIFIERS, effectiveHalfLife, totalRemaining,
  hoursUntil, decayCurve, dailyIntakeCheck, SLEEP_REFERENCE,
} from '../engine/caffeine.js';
import { Seg, Num, Select, Panel, BigStat, StatStrip, Method , TimePicker } from './ToolShell.jsx';
import { fmt } from '../engine/units.js';

const pad = n => String(n).padStart(2, '0');
const toMinutes = t => {
  const [h, m] = String(t).split(':').map(Number);
  return (Number.isFinite(h) ? h : 0) * 60 + (Number.isFinite(m) ? m : 0);
};
const fmtHours = h => {
  if (h == null) return '—';
  if (!Number.isFinite(h)) return 'never fully';
  const hh = Math.floor(h), mm = Math.round((h - hh) * 60);
  return mm === 0 ? `${hh} h` : `${hh} h ${mm} m`;
};
const addClock = (hhmm, hours) => {
  const mins = toMinutes(hhmm) + Math.round(hours * 60);
  const d = ((mins % 1440) + 1440) % 1440;
  return `${pad(Math.floor(d / 60))}:${pad(d % 60)}`;
};

export default function CaffeineHalfLife() {
  const [drinks, setDrinks] = useState([{ id: 1, source: 'filter', time: '08:00' }]);
  const [bedtime, setBedtime] = useState('23:00');
  const [modifier, setModifier] = useState('none');
  const [threshold, setThreshold] = useState('50');
  const [nextId, setNextId] = useState(2);

  const addDrink = () => {
    setDrinks(d => [...d, { id: nextId, source: 'filter', time: '14:00' }]);
    setNextId(i => i + 1);
  };
  const update = (id, patch) =>
    setDrinks(d => d.map(x => (x.id === id ? { ...x, ...patch } : x)));
  const remove = id => setDrinks(d => (d.length > 1 ? d.filter(x => x.id !== id) : d));

  const r = useMemo(() => {
    const hl = effectiveHalfLife(modifier);
    const bedMin = toMinutes(bedtime);

    // Express each drink as hours BEFORE bedtime (wrapping past midnight).
    const doses = drinks.map(d => {
      // 'custom' takes the mg straight from the user rather than a serving table.
      const perServing = d.source === 'custom'
        ? (+d.customMg || 0)
        : (SOURCES.find(s => s.key === d.source)?.mg ?? 0);
      const mg = perServing;   // one row = one serving
      let delta = bedMin - toMinutes(d.time);
      if (delta < 0) delta += 1440;                 // drink after midnight
      return { mg, hoursAgo: delta / 60, time: d.time };
    }).filter(d => d.mg > 0);

    const totalMg = doses.reduce((s, d) => s + d.mg, 0);
    if (!doses.length) return { empty: true, hl };

    // Remaining at bedtime, across the half-life range.
    const atBedTypical = totalRemaining(doses, 0, hl.typical);
    const atBedSlow = totalRemaining(doses, 0, hl.high);
    const atBedFast = totalRemaining(doses, 0, hl.low);

    const target = Math.max(0, +threshold || 0);
    const clearHours = hoursUntil(atBedTypical, target, hl.typical);
    const clearSlow = hoursUntil(atBedSlow, target, hl.high);

    // Latest drink time that would leave <= target by bedtime, for the last drink.
    const last = doses.reduce((a, b) => (b.hoursAgo < a.hoursAgo ? b : a), doses[0]);
    const lastNeeds = hoursUntil(last.mg, target, hl.typical);

    return {
      empty: false, hl, doses, totalMg,
      atBedTypical, atBedSlow, atBedFast,
      clearHours, clearSlow, target,
      clearClock: clearHours == null ? null : addClock(bedtime, clearHours),
      lastNeeds,
      curve: decayCurve(doses, hl, 24),
      daily: dailyIntakeCheck(totalMg, modifier),
    };
  }, [drinks, bedtime, modifier, threshold]);

  // chart geometry
  const W = 560, H = 190, PAD = 34;
  const maxMg = r.empty ? 1 : Math.max(...r.curve.map(p => p.low), 1);
  const x = h => PAD + (h / 24) * (W - PAD - 12);
  const y = mg => H - PAD - (mg / maxMg) * (H - PAD - 14);
  const path = key => r.empty ? '' :
    r.curve.map((p, i) => `${i ? 'L' : 'M'}${x(p.h).toFixed(1)},${y(p[key]).toFixed(1)}`).join(' ');
  const band = r.empty ? '' :
    r.curve.map((p, i) => `${i ? 'L' : 'M'}${x(p.h).toFixed(1)},${y(p.low).toFixed(1)}`).join(' ')
    + ' ' + r.curve.slice().reverse()
      .map(p => `L${x(p.h).toFixed(1)},${y(p.high).toFixed(1)}`).join(' ') + ' Z';

  return (
    <div className="calc">
      <div className="calc-grid">
        <Panel label="What you drank">
          {drinks.map(d => (
            <div className="drink-row" key={d.id}>
              {/* Row 1: what and how much. Row 2: when. The time picker is three
                  controls wide, so sharing a line with the source select left
                  neither with room to show its content. */}
              <div className="dr-what">
                <Select label="Source" value={d.source}
                        onChange={v => update(d.id, { source: v })}>
                  {SOURCES.map(s => (
                    <option key={s.key} value={s.key}>
                      {s.label} — {s.mg} mg / {s.unit}
                    </option>
                  ))}
                  <option value="custom">Custom amount — enter mg</option>
                </Select>
                {drinks.length > 1 && (
                  <button type="button" className="reset drink-x"
                          onClick={() => remove(d.id)} aria-label="Remove this drink">×</button>
                )}
              </div>

              {d.source === 'custom' && (
                <Num label="Caffeine per serving" value={d.customMg ?? ''}
                     tag="mg" min={1} max={1000} placeholder="—"
                     hint="Check the label. A pre-workout scoop is often 150–300 mg."
                     onChange={v => update(d.id, { customMg: v })} />
              )}

              <TimePicker id={`t-${d.id}`} label="Time" value={d.time}
                          onChange={v => update(d.id, { time: v })} />
            </div>
          ))}

          <button type="button" className="reset" onClick={addDrink}>+ Add another</button>

          <TimePicker id="bedtime" label="Bedtime" value={bedtime} onChange={setBedtime} />

          <Select label="Anything that changes how you clear caffeine?"
                  value={modifier} onChange={setModifier}
                  hint="These shift the estimate substantially — smoking roughly halves half-life, pregnancy can more than double it.">
            {HALF_LIFE_MODIFIERS.map(m => (
              <option key={m.key} value={m.key}>{m.label}</option>
            ))}
          </Select>

          <Num label="Residual you're aiming to be under at bedtime"
               value={threshold} onChange={setThreshold} tag="mg" min={0} max={400}
               hint="There is no established safe number — 50 mg is roughly half a cup of coffee, offered as a reference point only." />
        </Panel>

        <Panel label="At bedtime" dark
               incomplete={r.empty}
               incompleteNote="Add a drink to see how much caffeine is still on board at bedtime.">
          {!r.empty && <>
            <BigStat
              value={`${Math.round(r.atBedTypical)} mg`}
              unit="still in your system at bedtime"
              note={<>Range <b>{Math.round(r.atBedFast)}–{Math.round(r.atBedSlow)} mg</b> depending
                on how fast you clear it · {fmt(r.totalMg)} mg consumed today</>} />

            <StatStrip items={[
              { label: 'Half-life used', value: `${r.hl.typical.toFixed(1)} h` },
              { label: `Under ${r.target} mg at`, value: r.clearClock ?? 'already under' },
              { label: 'Time to clear', value: fmtHours(r.clearHours) },
            ]} />

            {r.hl.modifier.note && (
              <p className="goaltag">{r.hl.modifier.note}</p>
            )}

            {r.daily.over && (
              <div className="warnbar">
                That's {fmt(r.daily.total)} mg today, above the {r.daily.limit} mg
                {r.daily.limit === 200 ? ' commonly advised during pregnancy' :
                  ' most health authorities cite as not generally associated with adverse effects in healthy adults'}.
              </div>
            )}

            <svg viewBox={`0 0 ${W} ${H}`} className="chart" role="img"
                 aria-label={`Caffeine decay curve. About ${Math.round(r.atBedTypical)} milligrams remaining at bedtime.`}>
              <path d={band} className="ch-band" />
              <path d={path('typical')} className="ch-line" />
              {r.target > 0 && r.target < maxMg && (
                <line x1={PAD} x2={W - 12} y1={y(r.target)} y2={y(r.target)} className="ch-target" />
              )}
              <line x1={PAD} x2={W - 12} y1={H - PAD} y2={H - PAD} className="ch-axis" />
              <text x={PAD} y={H - 12} className="ch-tick">bedtime</text>
              <text x={W - 40} y={H - 12} className="ch-tick">+24 h</text>
              <text x={4} y={y(maxMg) + 10} className="ch-tick">{Math.round(maxMg)} mg</text>
            </svg>

            <p className="cat-caveat">
              The shaded band is the honest part of this chart. Caffeine half-life
              varies roughly three to seven hours between healthy adults, so the
              same coffee can leave very different amounts on board at midnight.
              Treat the line as a middle estimate, not a measurement.
            </p>
          </>}
        </Panel>
      </div>

      <Method title="How this is calculated">
        <p>
          Caffeine clears by first-order elimination, so the amount remaining halves
          every half-life: <code>C(t) = C₀ × ½^(t ÷ t½)</code>. Multiple drinks are
          summed, each decaying from its own time.
        </p>
        <p>
          A half-life of five hours is used as the middle estimate, with three and
          seven hours as the range — the usual span reported in healthy non-smoking
          adults. Modifiers scale that range: smoking shortens it markedly, while
          oral contraceptives, pregnancy and impaired liver function extend it.
        </p>
        <p>
          Serving amounts are typical values. Real caffeine content varies a great
          deal with bean, grind, brew time and cup size — a strong filter coffee can
          be double the figure used here.
        </p>
        <p>
          <strong>No residual amount is established as safe for sleep.</strong>
          Sensitivity differs severalfold between individuals, and genetics
          (particularly CYP1A2) account for much of it. The threshold line is a
          reference point for comparing your own nights, not a clinical cutoff.
        </p>
      </Method>
    </div>
  );
}
