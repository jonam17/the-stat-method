import { useState, useMemo } from 'react';
import {
  allOneRepMax, percentageTable, percentFromRIR, rirToRpe, loadForRepsRIR, fmt,
} from '../engine/index.js';
import { Seg, Num, Select, Panel, BigStat, StatStrip, Method } from './ToolShell.jsx';

const round = (v, step) => Math.round(v / step) * step;

export default function OneRepMaxCalculator() {
  const [units, setUnits] = useState('kg');
  const [weight, setWeight] = useState('100');
  const [reps, setReps] = useState('5');
  const [rounding, setRounding] = useState('2.5');
  const [targetReps, setTargetReps] = useState('5');
  const [targetRir, setTargetRir] = useState('2');

  const w = +weight || 0;
  const rp = Math.max(1, Math.min(30, +reps || 1));
  const step = +rounding;

  const r = useMemo(() => allOneRepMax(w, rp), [w, rp]);
  const oneRM = r?.results.find(x => x.key === 'wathan')?.value ?? r?.mean ?? 0;
  const table = useMemo(() => percentageTable(oneRM), [oneRM]);
  const prescribed = useMemo(
    () => loadForRepsRIR(oneRM, +targetReps, +targetRir),
    [oneRM, targetReps, targetRir]);

  return (
    <div className="calc">
      <div className="calc-grid">
        <Panel label="Your set">
          <Seg label="Units" value={units} onChange={setUnits}
               options={[['kg', 'Kilograms'], ['lb', 'Pounds']]} />
          <div className="row2">
            <Num label="Weight lifted" value={weight} onChange={setWeight} tag={units}
                 min={units === 'lb' ? 2 : 1} max={units === 'lb' ? 1400 : 600} />
            <Num label="Reps completed" value={reps} onChange={setReps} tag="reps"
                 min={1} max={20} step="1"
                 hint={rp > 12 ? 'Above 12 reps, estimates lose accuracy.' : null} />
          </div>
          <Select label="Round results to" value={rounding} onChange={setRounding}>
            <option value="1.25">Nearest 1.25 {units}</option>
            <option value="2.5">Nearest 2.5 {units}</option>
            <option value="5">Nearest 5 {units}</option>
          </Select>

          <div className="subhead">Prescribe a working set <span>RPE / RIR</span></div>
          <div className="row2">
            <Num label="Target reps" value={targetReps} onChange={setTargetReps} tag="reps"
                 min={1} max={30} />
            <Select label="Reps in reserve" value={targetRir} onChange={setTargetRir}>
              {[0, 1, 2, 3, 4].map(v => (
                <option key={v} value={v}>{v} RIR — RPE {rirToRpe(v)}</option>
              ))}
            </Select>
          </div>
          {prescribed != null ? (
            <div className="prescribe">
              <span className="pl">Work at</span>
              <b>{fmt(round(prescribed, step))} {units}</b>
              <span className="ps">
                for {targetReps} reps @ RPE {rirToRpe(+targetRir)}
                {' '}({percentFromRIR(+targetReps, +targetRir)?.toFixed(1)}% of 1RM)
              </span>
            </div>
          ) : (
            <p className="hint">The RPE chart covers 1–12 reps and 0–4 reps in reserve.</p>
          )}
        </Panel>

        <Panel label="Estimated one-rep max" dark>
          {r ? (
            <>
              <BigStat value={`${fmt(round(oneRM, step))}`} unit={units}
                       note={<>From {w} {units} × {rp} reps. Range across formulas:
                         <b> {fmt(round(r.min, step))}–{fmt(round(r.max, step))} {units}</b>.</>} />

              {r.lowConfidence && (
                <div className="warnbar">
                  Above 12 reps these equations diverge sharply — fatigue and technique
                  start to dominate. Treat this as a rough indication only.
                </div>
              )}

              <div className="bartop tight">
                <span className="t">Every formula</span>
                <span className="total-badge">
                  <span className="kk">Spread</span>
                  <b className={r.spread / r.mean > 0.08 ? 'warn' : ''}>
                    {fmt(round(r.spread, 0.5))} {units}
                  </b>
                </span>
              </div>

              <div className="fx-list compact">
                {r.results.map(f => {
                  const rel = r.max > r.min ? ((f.value - r.min) / (r.max - r.min)) * 100 : 50;
                  return (
                    <div className={`fx ${f.key === 'wathan' ? 'on' : ''}`} key={f.key}>
                      <div className="fx-top">
                        <span className="fx-name">
                          {f.name}{f.key === 'wathan' && <em className="fx-tag">Default</em>}
                        </span>
                        <span className="fx-val">{fmt(round(f.value, step))}<small>{units}</small></span>
                      </div>
                      <div className="fx-track"><i style={{ width: `${20 + rel * 0.8}%` }} /></div>
                    </div>
                  );
                })}
              </div>

              <div className="bartop">
                <span className="t">Training percentages</span>
              </div>
              <div className="pcttable">
                {table.map(row => (
                  <div className="pctrow" key={row.pct}>
                    <span className="pp">{row.pct}%</span>
                    <span className="pw">{fmt(round(row.weight, step))}<small>{units}</small></span>
                    <span className="pr">~{row.reps} rep{row.reps > 1 ? 's' : ''}</span>
                  </div>
                ))}
              </div>

              <StatStrip items={[
                { label: 'Average', value: fmt(round(r.mean, step)), unit: units },
                { label: 'Lowest', value: fmt(round(r.min, step)), unit: units },
                { label: 'Highest', value: fmt(round(r.max, step)), unit: units },
                { label: 'Confidence', value: r.lowConfidence ? 'Low' : 'Good' },
              ]} />

              <Method>
                <p>
                  All five equations are curve fits to population data, so they disagree —
                  most at high rep counts. Wathan is shown as the default because it tends
                  to track well across the widest rep range, but the spread above is the
                  honest uncertainty. Estimates are most reliable from sets of 2–6 reps.
                </p>
                <p className="refs">
                  Epley B 1985 · Brzycki M 1993 · Lombardi VP 1989 · Wathan D 1994 ·
                  O'Conner B et al. 1989 · RPE chart after Helms ER et al.
                </p>
              </Method>
            </>
          ) : (
            <p className="goaltag">Enter a weight and rep count to begin.</p>
          )}
        </Panel>
      </div>
    </div>
  );
}
