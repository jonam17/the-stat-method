import { useState, useMemo } from 'react';
import {
  allOneRepMax, percentageTable, percentFromRIR, rirToRpe, loadForRepsRIR, fmt,
  ONE_RM_MAX_REPS, RPE_MAX_REPS, RPE_MAX_RIR,
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
  const oneRM = r?.mean ?? 0;
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
                 hint={rp > ONE_RM_MAX_REPS ? `Above ${ONE_RM_MAX_REPS} reps, estimates lose accuracy.` : null} />
          </div>
          <Select label="Round results to" value={rounding} onChange={setRounding}>
            <option value="1.25">Nearest 1.25 {units}</option>
            <option value="2.5">Nearest 2.5 {units}</option>
            <option value="5">Nearest 5 {units}</option>
          </Select>

          <div className="subhead">Prescribe a working set <span>RPE / RIR</span></div>
          <div className="row2">
            <Num label="Target reps" value={targetReps} onChange={setTargetReps} tag="reps"
                 min={1} max={RPE_MAX_REPS} />
            <Select label="Reps in reserve" value={targetRir} onChange={setTargetRir}>
              {Array.from({ length: RPE_MAX_RIR + 1 }, (_, v) => v).map(v => (
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
                {' '}({percentFromRIR(+targetReps, +targetRir)}% of 1RM)
              </span>
            </div>
          ) : (
            <p className="hint">The RPE chart covers 1–{RPE_MAX_REPS} reps and 0–{RPE_MAX_RIR} reps in reserve.</p>
          )}
        </Panel>

        <Panel label="Estimated one-rep max" dark
               copyExtra={r ? [
                 '', 'Percentage table',
                 ...table.map(row =>
                   `${row.pct}%: ${fmt(round(row.weight, step))} ${units} (~${row.reps} rep${row.reps > 1 ? 's' : ''})`),
               ] : []}>
          {r ? (
            <>
              <BigStat value={`${fmt(round(oneRM, step))}`} unit={units}
                       note={<>From {w} {units} × {rp} reps. Range across formulas:
                         <b> {fmt(round(r.min, step))}–{fmt(round(r.max, step))} {units}</b>.</>} />

              {r.lowConfidence && (
                <div className="warnbar">
                  Above {ONE_RM_MAX_REPS} reps these estimates lose accuracy: in one study,
                  predictions got worse as the number of reps rose. Treat this as a rough
                  indication only.
                </div>
              )}

              <div className="bartop tight">
                <span className="t">Every formula</span>
                <span className="total-badge">
                  <span className="kk">Spread</span>
                  <b>
                    {fmt(round(r.spread, 0.5))} {units}
                  </b>
                </span>
              </div>

              <div className="fx-list compact">
                {r.results.map(f => {
                  const rel = r.max > r.min ? ((f.value - r.min) / (r.max - r.min)) * 100 : 50;
                  return (
                    <div className="fx" key={f.key}>
                      <div className="fx-top">
                        <span className="fx-name">{f.name}</span>
                        <span className="fx-val">{fmt(round(f.value, step))}<small>{units}</small></span>
                      </div>
                      <div className="fx-track"><i style={{ width: `${20 + rel * 0.8}%` }} /></div>
                    </div>
                  );
                })}
              </div>

              <div className="bartop">
                <span className="t">Training percentages · sets to failure</span>
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
                { label: 'Lowest', value: fmt(round(r.min, step)), unit: units },
                { label: 'Highest', value: fmt(round(r.max, step)), unit: units },
                { label: 'Spread', value: fmt(round(r.spread, 0.5)), unit: units },
              ]} />

              <Method>
                <p>
                  The headline is the average of the five equations, and the range shows how
                  far they disagree. In a study of 70 adults, a five-rep max predicted the
                  one-rep max best, and accuracy fell from ten and twenty reps; the authors
                  say to use no more than ten reps in linear equations, and Epley's and
                  Brzycki's own guidance is under ten. Four of these equations, tested on the
                  same people, came out close to each other; Wathan's was not tested.
                </p>
                <p>
                  An earlier comparison of seven equations, in 67 untrained college students
                  with sets of ten or fewer reps, found Wathan's (with Mayhew's) closest for the
                  bench press and Wathan's the only one close for the squat. Every equation
                  underestimated the deadlift, by 9 to 14%, so treat a deadlift estimate as a
                  floor.
                </p>
                <p>
                  The percentages and the working-set loads come from the RPE chart of Helms
                  and colleagues, built from trained lifters' back squats. Only three of its
                  values were measured; the authors estimated the rest and say it should not
                  be used as an exact conversion, so it stops at 8 reps and 3 in reserve.
                </p>
                <p className="refs">
                  Epley B 1985 · Brzycki M 1993 · Lombardi VP 1989 · Wathan D 1994 ·
                  O'Conner B et al. 1989 · LeSuer DA et al., J Strength Cond Res 1997 ·
                  Reynolds JM et al., J Strength Cond Res 2006 ·
                  Helms ER et al., Strength Cond J 2016
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
