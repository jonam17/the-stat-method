import { useState, useMemo } from 'react';
import { progressionResult, formatLoad, PROGRESSION_CLASSES, OVERLOAD_GOALS, OVERLOAD_LIMITS, fmt } from '../engine/index.js';
import { Seg, Num, Select, Panel, BigStat, StatStrip, Method, LiveSummary } from './ToolShell.jsx';

/*
 * State and markup only. Every decision, number and sentence on the results side
 * comes from progressionResult() in src/engine/overload.js (CONVENTIONS §21).
 * Nothing entered here is stored — not even last session, which you type in.
 */
const MAX_SETS = 8;
const DEFAULTS = { lb: { load: '185', increment: '5' }, kg: { load: '85', increment: '2.5' } };
const DECISION = {
  PROGRESS_LOAD: 'Increase load', PROGRESS_REPS: 'Add reps',
  HOLD: 'Hold', REDUCE_LOAD: 'Reduce load',
};
const CONF = { HIGH: 'High', MODERATE: 'Moderate', LOW: 'Low' };
const toInt = v => (v === '' || v == null ? NaN : Number(v));

function RepFields({ label, values, count, onChange, idPrefix }) {
  return (
    <div className="field">
      <label id={`${idPrefix}-label`}>{label}</label>
      <div className="po-reps" role="group" aria-labelledby={`${idPrefix}-label`}>
        {values.slice(0, count).map((v, k) => (
          <Num key={k} label={`Set ${k + 1}`} value={v} min={0} max={OVERLOAD_LIMITS.reps[1]}
               step={1} inputMode="numeric"
               onChange={x => onChange(values.map((y, j) => (j === k ? x : y)))} />
        ))}
      </div>
    </div>
  );
}

export default function ProgressiveOverload() {
  const [unit, setUnit] = useState('lb');
  const [cls, setCls] = useState('large_compound');
  const [goal, setGoal] = useState('strength');
  const [repMin, setRepMin] = useState(String(OVERLOAD_GOALS.strength.range[0]));
  const [repMax, setRepMax] = useState(String(OVERLOAD_GOALS.strength.range[1]));
  const [load, setLoad] = useState(DEFAULTS.lb.load);
  const [increment, setIncrement] = useState(DEFAULTS.lb.increment);
  const [count, setCount] = useState('3');
  const [reps, setReps] = useState(Array(MAX_SETS).fill('8'));
  const [rir, setRir] = useState('2');
  const [technique, setTechnique] = useState('maintained');
  const [pain, setPain] = useState('none');
  const [hasPrev, setHasPrev] = useState('off');
  const [prev, setPrev] = useState(Array(MAX_SETS).fill(''));

  const n = +count;
  const lim = OVERLOAD_LIMITS[unit];

  const switchUnit = u => { setUnit(u); setLoad(DEFAULTS[u].load); setIncrement(DEFAULTS[u].increment); };
  const switchGoal = g => {
    setGoal(g);
    setRepMin(String(OVERLOAD_GOALS[g].range[0]));
    setRepMax(String(OVERLOAD_GOALS[g].range[1]));
  };

  const r = useMemo(() => progressionResult({
    cls, goal, unit, load: toInt(load), increment: toInt(increment),
    repMin: toInt(repMin), repMax: toInt(repMax),
    sets: reps.slice(0, n).map(toInt),
    rir: rir === 'unknown' ? null : rir === '4+' ? '4+' : Number(rir),
    technique, pain,
    previous: hasPrev === 'on' ? prev.slice(0, n).map(toInt) : null,
  }), [cls, goal, unit, load, increment, repMin, repMax, reps, n, rir, technique, pain, hasPrev, prev]);

  const stop = r.status === 'STOP_REVIEW';
  const incomplete = r.status === 'INSUFFICIENT_DATA';
  const nextTarget = r.next
    ? (r.next.range ? `${r.next.range[0]}–${r.next.range[1]} reps` : r.next.perSet.join(' / '))
    : '—';
  const change = r.changePercent != null
    ? `${r.changePercent > 0 ? '+' : '−'}${Math.abs(r.changePercent).toFixed(1)}%` : '—';

  return (
    <div className="calc">
      <div className="calc-grid">
        <Panel label="Today's session">
          <Seg label="Units" value={unit} onChange={switchUnit}
               options={[['lb', 'Pounds'], ['kg', 'Kilograms']]} />
          <Select label="Exercise type" value={cls} onChange={setCls}
                  hint={`For example: ${PROGRESSION_CLASSES[cls].examples.join(', ')}.`}>
            {Object.entries(PROGRESSION_CLASSES).map(([k, c]) => <option key={k} value={k}>{c.name}</option>)}
          </Select>
          <Seg label="Goal" value={goal} onChange={switchGoal}
               options={Object.entries(OVERLOAD_GOALS).map(([k, g]) => [k, g.name])}
               hint={r.customRange ? 'You have set your own rep range — the advice follows it.' : undefined} />
          <div className="row2">
            <Num label="Rep range — lowest" value={repMin} onChange={setRepMin} step={1} inputMode="numeric"
                 min={OVERLOAD_LIMITS.repRange[0]} max={OVERLOAD_LIMITS.repRange[1]} />
            <Num label="Rep range — highest" value={repMax} onChange={setRepMax} step={1} inputMode="numeric"
                 min={OVERLOAD_LIMITS.repRange[0]} max={OVERLOAD_LIMITS.repRange[1]} />
          </div>
          <div className="row2">
            <Num label="Load used" value={load} onChange={setLoad} tag={unit} min={lim.load[0]} max={lim.load[1]} />
            <Num label="Smallest jump available" value={increment} onChange={setIncrement} tag={unit}
                 min={lim.increment[0]} max={lim.increment[1]}
                 hint="The smallest step your plates, dumbbells or stack allow." />
          </div>
          <Select label="Working sets" value={count} onChange={setCount}>
            {Array.from({ length: MAX_SETS }, (_, k) => k + 1).map(k => <option key={k} value={k}>{k} {k === 1 ? 'set' : 'sets'}</option>)}
          </Select>
          <RepFields label="Reps completed in each set" values={reps} count={n} onChange={setReps} idPrefix="po-now" />
          <Seg label="Reps in reserve on the hardest set" value={rir} onChange={setRir}
               options={[['0', '0'], ['1', '1'], ['2', '2'], ['3', '3'], ['4+', '4+'], ['unknown', 'Unknown']]}
               hint="How many more reps you could have done. 0 means you reached failure." />
          <Seg label="Technique" value={technique} onChange={setTechnique}
               options={[['maintained', 'Held'], ['minor', 'Slipped'], ['significant', 'Broke down']]} />
          <Seg label="Pain during the exercise" value={pain} onChange={setPain}
               options={[['none', 'None'], ['mild', 'Mild'], ['moderate', 'Moderate'], ['severe', 'Severe']]} />
          <Seg label="Last session at this load" value={hasPrev} onChange={setHasPrev}
               options={[['off', 'Skip'], ['on', 'Add it']]}
               hint="Optional. Lets the tool spot a trend. Typed in each time — nothing is saved." />
          {hasPrev === 'on' && (
            <RepFields label="Last session's reps" values={prev} count={n} onChange={setPrev} idPrefix="po-prev" />
          )}
        </Panel>

        <Panel label="Next session" dark incomplete={incomplete}
               incompleteNote={incomplete ? r.problems[0] : undefined}
               notice={stop ? r.message : undefined}
               copyExtra={!stop && !incomplete ? r.reasons : []}>
          {!stop && !incomplete && (
            <>
              <LiveSummary text={`${DECISION[r.status]}: ${formatLoad(r.recommendedLoad)} ${unit}, ${nextTarget}.`} />
              <BigStat value={formatLoad(r.recommendedLoad)} unit={`${unit} · next session`}
                       note={<b>{r.headline}</b>} />
              <StatStrip items={[
                { label: 'Decision', value: DECISION[r.status] },
                { label: 'Next target', value: nextTarget },
                { label: 'Load change', value: change },
                { label: 'Confidence', value: r.confidence ? CONF[r.confidence] : '—' },
              ]} />
              <ul className="po-reasons">
                {r.reasons.map(t => <li key={t}>{t}</li>)}
              </ul>
              {r.confNotes?.length > 0 && (
                <p className="po-conf">{r.confNotes.join(' ')}</p>
              )}
              <StatStrip items={[
                { label: 'Volume load', value: fmt(r.performance.volumeLoad), unit },
                { label: 'Estimated 1RM', value: r.e1rm != null ? fmt(r.e1rm) : '—', unit: r.e1rm != null ? unit : undefined },
                { label: 'Total reps', value: r.performance.total },
              ]} />
              {r.e1rmNote && <p className="po-conf">{r.e1rmNote}</p>}
              <details className="method">
                <summary>Show the work</summary>
                <dl className="po-work">
                  {r.work.map(([k, v]) => (<div key={k}><dt>{k}</dt><dd>{v}</dd></div>))}
                </dl>
              </details>
            </>
          )}
          <Method>
            <p>
              The decision runs in a fixed order — pain, then technique, then your reps,
              reps in reserve, last session, the exercise type and your equipment — so
              nothing later can override something earlier. Pain or a technique breakdown
              never produces a heavier weight.
            </p>
            <p>
              <b>Evidence.</b> Progressive resistance training builds strength and muscle,
              and training to failure is not required (ACSM position stand, 2026). Adding
              reps at the same load is progression too: in trained lifters, progressing reps
              and progressing load both worked (Plotkin et al., 2022). ACSM (2009) suggests a
              2–10% load increase — lower for small-muscle exercises — once you exceed your
              target by one or two reps in two consecutive sessions. Reps-in-reserve
              estimates are useful but imperfect, and least accurate far from failure
              (Halperin et al., 2022).
            </p>
            <p>
              <b>Implementation rules.</b> The percentage band for each exercise type, the
              "every set at the top of the range" trigger, choosing the smallest available
              step inside the band, the 5–10% reduction and the confidence grades are
              practical rules informed by that research, not individually validated
              equations. The estimated 1RM uses the Epley formula, as the One-Rep Max
              calculator does, and is not shown above 12 reps.
            </p>
            <p>
              This tool is for training planning. It does not predict injury risk, cannot
              tell whether an exercise is medically appropriate for you, and does not
              diagnose pain. Stop an exercise that causes significant or unusual pain and
              have it assessed.
            </p>
          </Method>
        </Panel>
      </div>
    </div>
  );
}
