import { useState, useMemo } from 'react';
import {
  LIFTS, LEVELS, standardsFor, rateLift, ageFactor,
  lbToKg, kgToLb, fmt,
} from '../engine/index.js';
import { Seg, Num, Select, Panel, BigStat, StatStrip, Method } from './ToolShell.jsx';
import { ageInScope, AGE_MIN, AGE_MAX, RAIL_COPY } from '../engine/safety.js';

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
    () => rateLift({ lift, sex, bodyweightKg: bwKg, age: +age || 30, oneRmKg: rmKg }),
    [lift, sex, bwKg, age, rmKg]);

  const liftName = LIFTS.find(l => l.key === lift)?.name ?? lift;
  const af = ageFactor(+age || 30);

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
                 min={units === 'imperial' ? 50 : 25} max={units === 'imperial' ? 700 : 320} />
          </div>
          <Select label="Lift" value={lift} onChange={setLift}>
            {LIFTS.map(l => <option key={l.key} value={l.key}>{l.name}</option>)}
          </Select>
          <Num label="Your one-rep max" value={oneRm} onChange={setOneRm} tag={units}
               hint="Tested or estimated. Use the 1RM calculator if you have not tested."
                 min={units === 'lb' ? 2 : 1} max={units === 'lb' ? 1400 : 600} />
          {af < 1 && (
            <p className="hint">
              Standards are scaled by {Math.round(af * 100)}% for age {age}, since strength
              declines gradually after roughly thirty.
            </p>
          )}
        </Panel>

        <Panel label={`${liftName} standard`} dark
               notice={(() => {
                 const scope = ageInScope(age);
                 if (scope.reason === 'young') return RAIL_COPY.underAge;
                 if (scope.reason === 'high') return RAIL_COPY.overAge;
                 return null;
               })()}>
          <BigStat value={r.level} unit={`${r.multiple.toFixed(2)}× bw`}
                   note={r.nextLevel
                     ? <>{fmt(disp(r.toNextKg))} {units} to reach <b>{r.nextLevel}</b>.</>
                     : <>You are at the top of this scale.</>} />

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
            {r.rows.map(row => {
              const reached = rmKg >= row.weightKg;
              const current = row.level === r.level;
              return (
                <div className={`fx ${current ? 'on' : ''} ${reached ? '' : 'off'}`} key={row.level}>
                  <div className="fx-top">
                    <span className="fx-name">
                      {row.level}
                      {current && <em className="fx-tag">You</em>}
                    </span>
                    <span className="fx-val">
                      {fmt(disp(row.weightKg))}<small>{units}</small>
                    </span>
                  </div>
                  <div className="fx-sub">{row.multiple.toFixed(2)}× bodyweight</div>
                </div>
              );
            })}
          </div>

          <StatStrip items={[
            { label: 'Your 1RM', value: fmt(+oneRm), unit: units },
            { label: '× bodyweight', value: r.multiple.toFixed(2) },
            { label: 'Level', value: r.level },
            { label: 'Age factor', value: `${Math.round(af * 100)}%` },
          ]} />

          <Method>
            <p>
              These are <strong>orientation, not classification</strong>. Bodyweight-relative
              standards vary considerably between published sources and lifting datasets,
              and no single table is authoritative. Treat a level as a rough band rather than
              a verdict, and expect a different site to place you differently.
            </p>
            <p>
              Standards are expressed as multiples of bodyweight, which is why a lighter
              lifter needs less absolute weight to reach the same level. They are scaled
              downward with age past thirty to keep comparisons fair.
            </p>
            <p className="refs">
              Compiled from commonly used coaching ranges and large public lifting datasets.
            </p>
          </Method>
        </Panel>
      </div>
    </div>
  );
}
