import { useState, useMemo } from 'react';
import {
  LIFTS, rateLift,
  lbToKg, kgToLb, fmt,
} from '../engine/index.js';
import { Seg, Num, Select, Panel, BigStat, StatStrip, Method } from './ToolShell.jsx';
import { eligibility, AGE_MIN, AGE_MAX, RAIL_COPY } from '../engine/safety.js';

export default function StrengthStandards() {
  const [units, setUnits] = useState('kg');
  const [sex, setSex] = useState('male');
  const [age, setAge] = useState('30');
  const [bw, setBw] = useState('80');
  const [lift, setLift] = useState('squat');
  const [oneRm, setOneRm] = useState('140');

  const toKg = v => (units === 'lb' ? lbToKg(+v || 0) : +v || 0);
  const disp = kg => (units === 'lb' ? kgToLb(kg) : kg);
  const bwKg = toKg(bw);
  const rmKg = toKg(oneRm);

  const switchUnits = to => {
    if (to === units) return;
    const c = v => String(Math.round(to === 'lb' ? kgToLb(+v || 0) : lbToKg(+v || 0)));
    setBw(c(bw)); setOneRm(c(oneRm));
    setUnits(to);
  };

  const r = useMemo(
    () => rateLift({ lift, sex, bodyweightKg: bwKg, oneRmKg: rmKg }),
    [lift, sex, bwKg, rmKg]);

  const liftName = LIFTS.find(l => l.key === lift)?.name ?? lift;
  const cur = r.rows.findIndex(row => row.level === r.level);
  const kg = v => <>{fmt(disp(v))} {units}</>;

  return (
    <div className="calc">
      <div className="calc-grid">
        <Panel label="Your lift">
          <Seg label="Units" value={units} onChange={switchUnits}
               options={[['kg', 'Kilograms'], ['lb', 'Pounds']]} />
          <Seg label="Sex" value={sex} onChange={setSex}
               options={[['male', 'Male'], ['female', 'Female']]} />
          <div className="row2">
            <Num label="Age" value={age} onChange={setAge} tag="yrs"
                 min={AGE_MIN} max={AGE_MAX} />
            <Num label="Bodyweight" value={bw} onChange={setBw} tag={units}
                 min={units === 'lb' ? 55 : 25} max={units === 'lb' ? 705 : 320} />
          </div>
          <Select label="Lift" value={lift} onChange={setLift}>
            {LIFTS.map(l => <option key={l.key} value={l.key}>{l.name}</option>)}
          </Select>
          <Num label="Your one-rep max" value={oneRm} onChange={setOneRm} tag={units}
               hint="Tested or estimated. Use the 1RM calculator if you have not tested."
                 min={units === 'lb' ? 2 : 1} max={units === 'lb' ? 1400 : 600} />
        </Panel>

        <Panel label={`${liftName} strength level`} dark
               notice={eligibility({ age }).copy ?? null}>
          <BigStat value={r.level} unit={`${r.multiple.toFixed(2)}× bw`}
                   note={!r.nextLevel
                     ? <>The top level in this model.</>
                     : r.nextStrict
                       ? <>More than {kg(r.nextKg)} reaches <b>{r.nextLevel}</b>
                           {r.toNextKg > 0 ? <> — {kg(r.toNextKg)} to go</> : null}.</>
                       : <>{kg(r.toNextKg)} to reach <b>{r.nextLevel}</b>.</>} />

          <p className="score-pos-line">
            This is the strength level in a training-status model proposed by Santos Junior and
            colleagues (2021), meant for most people who train rather than athletes. The model
            judges training status from five things — how long you have trained, breaks, past
            experience, technique and strength — so one lift gives your strength level, not your
            training status.
          </p>

          {r.nextLevel && (
            <>
              <div className="bartop tight">
                <span className="t">Progress to {r.nextLevel}</span>
                <span className="total-badge"><b>{Math.round(r.progress * 100)}%</b></span>
              </div>
              <div className="bar bar--thin">
                <div className="seg-fill fill-carb" style={{ width: `${r.progress * 100}%` }} />
              </div>
            </>
          )}

          <div className="bartop">
            <span className="t">All levels</span>
          </div>
          <div className="fx-list compact">
            {r.rows.map((row, k) => {
              const reached = k <= cur;
              const current = k === cur;
              return (
                <div className={`fx ${current ? 'on' : ''} ${reached ? '' : 'off'}`} key={row.level}>
                  <div className="fx-top">
                    <span className="fx-name">
                      {row.level}
                      {current && <em className="fx-tag">You</em>}
                    </span>
                    <span className="fx-val">
                      {k === 0 ? <small>below </small> : row.strict ? <small>over </small> : <small>from </small>}
                      {fmt(disp(k === 0 ? r.rows[1].weightKg : row.weightKg))}<small>{units}</small>
                    </span>
                  </div>
                  <div className="fx-sub">
                    {k === 0 ? `Below ${r.rows[1].fromPct}%` : row.strict ? `More than ${row.fromPct}%` : `From ${row.fromPct}%`} of bodyweight
                  </div>
                </div>
              );
            })}
          </div>

          <StatStrip items={[
            { label: 'Your 1RM', value: fmt(+oneRm), unit: units },
            { label: '× bodyweight', value: r.multiple.toFixed(2) },
            { label: 'Level', value: r.level },
            { label: 'Bodyweight', value: fmt(+bw), unit: units },
          ]} />

          <Method>
            <p>
              These levels come from one published source: a model for classifying
              resistance-training status, proposed by Santos Junior and colleagues in 2021. It is a
              proposal, built from cut-offs used in earlier studies and the authors' reasoning — not
              a survey of what people lift. Treat a level as a rough band, and expect other tables
              to place you differently.
            </p>
            <p>
              The cut-offs are percentages of bodyweight, set separately for men and women, for the
              back squat, bench press and deadlift; the list above shows where each level starts for
              your lift. The authors say they are meant for most people who train, not athletes, and
              that older and heavier lifters are at a disadvantage. The model makes no adjustment
              for age, so neither does this calculator.
            </p>
            <p className="refs">
              Santos Junior ERT, de Salles BF, Dias I, Ribeiro AS, Simão R, Willardson JM.
              Classification and determination model of resistance training status. Strength Cond
              J, 2021;43(5):77-86, Table 1.
            </p>
          </Method>
        </Panel>
      </div>
    </div>
  );
}
