import { useState, useMemo } from 'react';
import { percentFromRIR, rirToRpe, loadForRepsRIR, fmt } from '../engine/index.js';
import { Seg, Num, Select, Panel, BigStat, StatStrip, Method } from './ToolShell.jsx';

const REPS = [1,2,3,4,5,6,7,8,9,10,11,12];
const RIRS = [0,1,2,3,4];

export default function RpeConverter() {
  const [units, setUnits] = useState('kg');
  const [mode, setMode] = useState('load');
  const [oneRm, setOneRm] = useState('150');
  const [reps, setReps] = useState('5');
  const [rir, setRir] = useState('2');
  const [weight, setWeight] = useState('120');

  const rm = +oneRm || 0;
  const rp = +reps, ri = +rir;
  const step = units === 'kg' ? 2.5 : 5;
  const round = v => Math.round(v / step) * step;

  const r = useMemo(() => {
    const pct = percentFromRIR(rp, ri);
    const load = pct != null ? (rm * pct) / 100 : null;
    // reverse: what RPE is the entered weight for these reps?
    const w = +weight || 0;
    const impliedPct = rm ? (w / rm) * 100 : 0;
    let impliedRir = null, closest = Infinity;
    for (const q of RIRS) {
      const p = percentFromRIR(rp, q);
      if (p != null && Math.abs(p - impliedPct) < closest) {
        closest = Math.abs(p - impliedPct); impliedRir = q;
      }
    }
    return { pct, load, impliedPct, impliedRir };
  }, [rm, rp, ri, weight]);

  return (
    <div className="calc">
      <div className="calc-grid">
        <Panel label="Your numbers">
          <Seg label="Units" value={units} onChange={setUnits}
               options={[['kg', 'Kilograms'], ['lb', 'Pounds']]} />
          <Seg label="I want to find" value={mode} onChange={setMode}
               options={[['load', 'A working load'], ['rpe', 'My RPE']]} />
          <Num label="Your one-rep max" value={oneRm} onChange={setOneRm} tag={units}
                 min={units === 'lb' ? 2 : 1} max={units === 'lb' ? 1400 : 600} />
          <div className="row2">
            <Select label="Reps" value={reps} onChange={setReps}>
              {REPS.map(n => <option key={n} value={n}>{n} reps</option>)}
            </Select>
            {mode === 'load' ? (
              <Select label="Reps in reserve" value={rir} onChange={setRir}>
                {RIRS.map(n => <option key={n} value={n}>{n} RIR — RPE {rirToRpe(n)}</option>)}
              </Select>
            ) : (
              <Num label="Weight used" value={weight} onChange={setWeight} tag={units}
                 min={units === 'lb' ? 2 : 1} max={units === 'lb' ? 1400 : 600} />
            )}
          </div>
          {mode === 'load' && r.load != null && (
            <div className="prescribe">
              <span className="pl">Work at</span>
              <b>{fmt(round(r.load))} {units}</b>
              <span className="ps">{rp} reps @ RPE {rirToRpe(ri)} · {r.pct.toFixed(1)}% of 1RM</span>
            </div>
          )}
          {mode === 'rpe' && r.impliedRir != null && (
            <div className="prescribe">
              <span className="pl">That set is about</span>
              <b>RPE {rirToRpe(r.impliedRir)}</b>
              <span className="ps">{r.impliedRir} reps in reserve · {r.impliedPct.toFixed(1)}% of 1RM</span>
            </div>
          )}
        </Panel>

        <Panel label="RPE chart" dark>
          <BigStat
            value={mode === 'load' ? fmt(round(r.load ?? 0)) : `RPE ${rirToRpe(r.impliedRir ?? 0)}`}
            unit={mode === 'load' ? units : 'estimated'}
            note={<>Percent of 1RM for {rp} reps across reps-in-reserve.</>} />

          <div className="rpe-grid">
            <div className="rpe-head">
              <span>Reps</span>
              {RIRS.map(q => <span key={q}>RPE {rirToRpe(q)}</span>)}
            </div>
            {REPS.map(n => (
              <div className={`rpe-row ${n === rp ? 'on' : ''}`} key={n}>
                <span className="rpe-r">{n}</span>
                {RIRS.map(q => {
                  const p = percentFromRIR(n, q);
                  const active = n === rp && q === ri && mode === 'load';
                  return (
                    <span className={`rpe-c ${active ? 'active' : ''}`} key={q}>
                      {p != null ? `${p.toFixed(0)}%` : '—'}
                      {rm > 0 && <em>{fmt(round((rm * p) / 100))}</em>}
                    </span>
                  );
                })}
              </div>
            ))}
          </div>

          <StatStrip items={[
            { label: 'RPE', value: rirToRpe(mode === 'load' ? ri : (r.impliedRir ?? 0)) },
            { label: 'RIR', value: mode === 'load' ? ri : (r.impliedRir ?? '—') },
            { label: '% of 1RM', value: (mode === 'load' ? r.pct : r.impliedPct)?.toFixed(1) ?? '—' },
            { label: 'Reps', value: rp },
          ]} />

          <Method>
            <p>
              RPE here is the repetitions-in-reserve scale: RPE 10 means no reps left, RPE 8
              means two in reserve. This is more useful than a fixed percentage because it
              self-adjusts to daily readiness — the same 80% feels very different after a bad
              night's sleep.
            </p>
            <p>
              Research validating the scale found trained lifters estimate proximity to
              failure reasonably well, particularly within a few reps of it. Accuracy is
              lower in novices and at high rep counts, so treat the percentages as
              approximate rather than exact.
            </p>
            <p className="refs">
              Zourdos MC et al., J Strength Cond Res 2016 · Helms ER et al.,
              J Strength Cond Res 2017
            </p>
          </Method>
        </Panel>
      </div>
    </div>
  );
}
