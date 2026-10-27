import { useState, useMemo } from 'react';
import {
  bodyFatCategory, lbToKg, kgToLb, ftInToCm, cmToFtIn, fmt,
  FFMI_PCTS, FFMI_HEIGHT_COEFF,
} from '../engine/index.js';
import { ffmiResult } from '../engine/results.js';
import { Seg, Num, Panel, BigStat, StatStrip, Method } from './ToolShell.jsx';
import { RAIL_COPY, eligibility, AGE_MIN, AGE_MAX } from '../engine/safety.js';

/** Fat-free mass index — lean mass normalised for height. */
export default function FfmiCalculator() {
  const [units, setUnits] = useState('metric');
  const [sex, setSex] = useState('male');
  const [age, setAge] = useState('30');
  const [weight, setWeight] = useState('80');
  const [height, setHeight] = useState('178');
  const [feet, setFeet] = useState('5');
  const [inches, setInches] = useState('10');
  const [bodyfat, setBodyfat] = useState('15');

  const kg = units === 'imperial' ? lbToKg(+weight || 0) : +weight || 0;
  const cm = units === 'imperial' ? ftInToCm(+feet || 0, +inches || 0) : +height || 0;
  const bf = Math.min(60, Math.max(3, +bodyfat || 0));

  const switchUnits = to => {
    if (to === units) return;
    if (to === 'imperial') {
      setWeight(String(Math.round(kgToLb(+weight || 0))));
      const { ft, in: i } = cmToFtIn(+height || 0);
      setFeet(String(ft)); setInches(String(i));
    } else {
      setWeight(String(Math.round(lbToKg(+weight || 0))));
      setHeight(String(Math.round(ftInToCm(+feet || 0, +inches || 0))));
    }
    setUnits(to);
  };

  // Computed in the engine (src/engine/results.js), CONVENTIONS §21.
  const r = useMemo(() => ffmiResult({ kg, cm, bf, sex, age }), [kg, cm, bf, sex, age]);


  // Refusal decided by the engine, the same way every other tool decides it.
  const gate = eligibility({ age });

  return (
    <div className="calc">
      <div className="calc-grid">
        <Panel label="Your details">
          <Seg label="Units" value={units} onChange={switchUnits}
               options={[['metric', 'Metric'], ['imperial', 'Imperial']]} />
          <Seg label="Sex" value={sex} onChange={setSex}
               options={[['male', 'Male'], ['female', 'Female']]} />
          <Num label="Age" value={age} onChange={setAge} tag="yrs" min={AGE_MIN} max={AGE_MAX} />
          <div className="row2">
            <Num label="Weight" value={weight} onChange={setWeight}
                 tag={units === 'imperial' ? 'lb' : 'kg'}
                 min={units === 'imperial' ? 50 : 25} max={units === 'imperial' ? 700 : 320} />
            <Num label="Body fat" value={bodyfat} onChange={setBodyfat} tag="%"
                 min={1} max={70} />
          </div>
          {units === 'imperial' ? (
            <div className="field">
              <label>Height</label>
              <div className="row2">
                <div className="unit">
                  <input type="number" inputMode="decimal" min={3} max={8} step="1" value={feet} aria-label="Feet"
                         onWheel={e => e.currentTarget.blur()}
                         onChange={e => setFeet(e.target.value)} />
                  <span className="tag">ft</span>
                </div>
                <div className="unit">
                  <input type="number" inputMode="decimal" min={0} max={11} step="1" value={inches} aria-label="Inches"
                         onWheel={e => e.currentTarget.blur()}
                         onChange={e => setInches(e.target.value)} />
                  <span className="tag">in</span>
                </div>
              </div>
            </div>
          ) : (
            <Num label="Height" value={height} onChange={setHeight} tag="cm"
                 min={120} max={230} />
          )}
          <p className="hint">
            FFMI needs a body-fat figure. If you don't have one, estimate it first with the
            body fat tool — the result is only as good as that input.
          </p>
        </Panel>

        <Panel label="Fat-free mass index" dark
               notice={gate.refused ? gate.copy : undefined}
               incomplete={gate.incomplete || !(kg > 0 && cm > 0)}
               incompleteNote="Enter your weight, height and body fat to see your FFMI.">
          <BigStat value={r.ffmi ? r.ffmi.toFixed(1) : '—'} unit="FFMI"
                   note={<>Normalised to 1.8 m:{' '}
                     <b>{r.norm ? r.norm.toFixed(1) : '—'}</b></>} />

          {/* v2.35.0: position among the Schutz 2002 percentiles for this sex and age
              group — the plain FFMI, which is what the table describes. No category words:
              the informal bands removed in v2.34.2 had no source. */}
          {r.position && <FfmiPosition pos={r.position} ffmi={r.ffmi} sex={sex} />}

          <StatStrip items={[
            { label: 'Lean mass', value: fmt(r.lbm), unit: 'kg' },
            { label: 'Fat mass', value: fmt(r.fatMass), unit: 'kg' },
            { label: 'Body fat', value: `${bf}%` },
            { label: 'BMI', value: r.bmi.toFixed(1) },
          ]} />

          <p className="foot-note">
            Body fat {bf}% sits in the <b>{bodyFatCategory(bf, sex)}</b> range for your sex.
            BMI cannot tell muscle from fat; FFMI can, which is why a muscular person often
            reads as "overweight" on BMI while having a perfectly ordinary FFMI.
          </p>

          {r.ffmi > 0 && cm > 0 && (
            <p className="foot-note ffmi-worked">
              <b>How it's calculated:</b> {r.lbm.toFixed(1)} kg lean mass ÷ ({(cm / 100).toFixed(2)} m)² ={' '}
              {r.ffmi.toFixed(1)}. Height-adjusted: {r.ffmi.toFixed(1)} + {FFMI_HEIGHT_COEFF} × (1.80 −{' '}
              {(cm / 100).toFixed(2)}) = {r.norm.toFixed(1)}. Figures are rounded for display.
            </p>
          )}

          <p className="cat-caveat">{RAIL_COPY.categoryCaveat}</p>

          <Method>
            <p>
              FFMI is lean mass divided by height squared — BMI with the fat removed. The
              normalised figure adjusts to a 1.8 m reference so people of different heights
              can be compared. Values around 25 are often cited as an approximate natural
              ceiling for men, but this comes from a small sample and should be read as a
              rough guide rather than a hard limit.
            </p>
            <p>
              Percentiles come from Schutz and colleagues (2002), Table 2: 5,635 apparently
              healthy adults in Geneva and Lausanne, not randomly selected, whose fat-free mass
              was measured by bioelectrical impedance. They describe plain FFMI, so your first
              figure is compared with them, not the height-adjusted one. The paper's methods give
              ages 24 to 98 while its tables start at 18; the tables' age groups are used here.
            </p>
            <p className="refs">
              Kouri EM, Pope HG, Katz DL, Oliva P, Clin J Sport Med 1995 ·
              Schutz Y, Kyle UUG, Pichard C, Int J Obes 2002
            </p>
          </Method>
        </Panel>
      </div>
    </div>
  );
}

const ORD = p => `${p}th`;

/** One sentence and a scale: where this FFMI sits among people of the same sex and age. */
function FfmiPosition({ pos, ffmi, sex }) {
  const who = sex === 'female' ? 'women' : 'men';
  const group = pos.group === '75+' ? '75 and over' : pos.group;
  const v = ffmi.toFixed(1);
  const where = pos.at
    ? <>at the <b>{ORD(pos.at.p)} percentile</b></>
    : !pos.lower
      ? <><b>below the 5th percentile</b> ({pos.upper.value.toFixed(1)})</>
      : !pos.upper
        ? <><b>above the 95th percentile</b> ({pos.lower.value.toFixed(1)})</>
        : <>between the <b>{ORD(pos.lower.p)} and {ORD(pos.upper.p)} percentiles</b>{' '}
            ({pos.lower.value.toFixed(1)}–{pos.upper.value.toFixed(1)})</>;
  // Scale: 5th to 95th percentile with a margin either side; the marker is clamped.
  const lo = pos.values[0] - 1.5, hi = pos.values[pos.values.length - 1] + 1.5;
  const at = x => Math.max(0, Math.min(100, ((x - lo) / (hi - lo)) * 100));
  const ticks = [0, 2, 3, 4, 6];   // P5, P25, P50, P75, P95
  const labelled = [0, 3, 6];      // only P5, P50, P95 carry labels: the inner ones collide at 360px
  return (
    <div className="ffmi-pos">
      <p className="ffmi-pos-line">
        Among {who} aged {group} in a large Swiss reference sample, an FFMI of {v} is {where}.
        That sample was the general population, not people who train, so regular lifters
        often land at the top of it.
      </p>
      <div className="ffmi-pct" aria-hidden="true">
        <div className="ffmi-pct-track">
          {ticks.map(k => <span key={k} className="ffmi-pct-tick" style={{ left: `${at(pos.values[k])}%` }} />)}
          <span className="ffmi-pct-marker" style={{ left: `${at(ffmi)}%` }} />
        </div>
        <div className="ffmi-pct-labels">
          {labelled.map(k => (
            <span key={k} style={{ left: `${at(pos.values[k])}%` }}>
              <small>{ORD(FFMI_PCTS[k])}</small>{pos.values[k].toFixed(1)}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
