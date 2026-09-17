import { useState, useMemo } from 'react';
import {
  idealWeightFormulas, healthyBmiRange, bmi, bmiCategory,
  waistToHeight, whtrBand, lbToKg, kgToLb, ftInToCm, cmToFtIn, fmt,
} from '../engine/index.js';
import { Seg, Num, Panel, BigStat, StatStrip, Method } from './ToolShell.jsx';
import { RAIL_COPY } from '../engine/safety.js';

const IN_TO_CM = 2.54;

export default function HealthyWeight() {
  const [units, setUnits] = useState('metric');
  const [sex, setSex] = useState('male');
  const [weight, setWeight] = useState('80');
  const [height, setHeight] = useState('178');
  const [feet, setFeet] = useState('5');
  const [inches, setInches] = useState('10');
  const [waist, setWaist] = useState('85');

  const kg = units === 'imperial' ? lbToKg(+weight || 0) : +weight || 0;
  const cm = units === 'imperial' ? ftInToCm(+feet || 0, +inches || 0) : +height || 0;
  const waistCm = units === 'imperial' ? (+waist || 0) * IN_TO_CM : +waist || 0;
  const disp = v => (units === 'imperial' ? kgToLb(v) : v);
  const wTag = units === 'imperial' ? 'lb' : 'kg';

  const switchUnits = to => {
    if (to === units) return;
    if (to === 'imperial') {
      setWeight(String(Math.round(kgToLb(+weight || 0))));
      const { ft, in: i } = cmToFtIn(+height || 0);
      setFeet(String(ft)); setInches(String(i));
      setWaist(String(Math.round((+waist || 0) / IN_TO_CM)));
    } else {
      setWeight(String(Math.round(lbToKg(+weight || 0))));
      setHeight(String(Math.round(ftInToCm(+feet || 0, +inches || 0))));
      setWaist(String(Math.round((+waist || 0) * IN_TO_CM)));
    }
    setUnits(to);
  };

  const r = useMemo(() => {
    const formulas = idealWeightFormulas({ cm, sex });
    const bmiRange = healthyBmiRange(cm);
    const vals = formulas.map(f => f.value);
    const b = bmi(kg, cm);
    const w = waistToHeight(waistCm, cm);
    return {
      formulas, bmiRange, b, w,
      band: whtrBand(w),
      category: bmiCategory(b),
      formulaLow: Math.min(...vals),
      formulaHigh: Math.max(...vals),
      inRange: kg >= bmiRange.lowKg && kg <= bmiRange.highKg,
    };
  }, [kg, cm, sex, waistCm]);

  return (
    <div className="calc">
      <div className="calc-grid">
        <Panel label="Your measurements">
          <Seg label="Units" value={units} onChange={switchUnits}
               options={[['metric', 'Metric'], ['imperial', 'Imperial']]} />
          <Seg label="Sex" value={sex} onChange={setSex}
               options={[['male', 'Male'], ['female', 'Female']]} />
          <Num label="Weight" value={weight} onChange={setWeight} tag={wTag}
               min={units === 'imperial' ? 50 : 25} max={units === 'imperial' ? 700 : 320} />
          {units === 'imperial' ? (
            <div className="field">
              <label>Height</label>
              <div className="row2">
                <div className="unit">
                  <input type="number" inputMode="decimal" min={3} max={8} step="1"
                         value={feet} aria-label="Feet"
                         onWheel={e => e.currentTarget.blur()}
                         onChange={e => setFeet(e.target.value)} />
                  <span className="tag">ft</span>
                </div>
                <div className="unit">
                  <input type="number" inputMode="decimal" min={0} max={11} step="any"
                         value={inches} aria-label="Inches"
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
          <Num label="Waist" value={waist} onChange={setWaist}
               tag={units === 'imperial' ? 'in' : 'cm'}
               min={units === 'imperial' ? 15 : 40} max={units === 'imperial' ? 80 : 200}
               hint="Measured at the narrowest point, usually just above the navel." />
        </Panel>

        <Panel label="Healthy weight range" dark
               incomplete={!(kg > 0 && cm > 0)}
               incompleteNote="Enter your height and weight to see your healthy range.">
          <BigStat
            value={`${fmt(disp(r.bmiRange.lowKg))}–${fmt(disp(r.bmiRange.highKg))}`}
            unit={wTag}
            note={<>The healthy-BMI band for your height. You are at
              {' '}<b>{fmt(+weight)} {wTag}</b> — {r.inRange
                ? 'inside that range' : 'outside that range'}.</>} />

          <div className="bartop tight">
            <span className="t">Classical formulas</span>
            <span className="total-badge">
              <span className="kk">Spread</span>
              <b>{fmt(disp(r.formulaHigh - r.formulaLow))} {wTag}</b>
            </span>
          </div>
          <div className="fx-list compact">
            {r.formulas.map(f => (
              <div className="fx" key={f.key}>
                <div className="fx-top">
                  <span className="fx-name">{f.name}</span>
                  <span className="fx-val">{fmt(disp(f.value))}<small>{wTag}</small></span>
                </div>
              </div>
            ))}
          </div>

          <div className="bartop">
            <span className="t">Risk indicators</span>
          </div>
          <div className="fx-list compact">
            <div className="fx">
              <div className="fx-top">
                <span className="fx-name">BMI</span>
                <span className="fx-val">{r.b.toFixed(1)}</span>
              </div>
              <div className="fx-sub">{r.category}</div>
              <p className="cat-caveat">{RAIL_COPY.categoryCaveat}</p>
              {r.category === 'Normal weight' && (
                <p className="cat-caveat">{RAIL_COPY.normalLabelCaveat}</p>
              )}
            </div>
            <div className="fx on">
              <div className="fx-top">
                <span className="fx-name">
                  Waist-to-height<em className="fx-tag">Better predictor</em>
                </span>
                <span className="fx-val">{r.w.toFixed(2)}</span>
              </div>
              <div className="fx-sub">{r.band.label} — {r.band.note}</div>
            </div>
          </div>

          <StatStrip items={[
            { label: 'BMI', value: r.b.toFixed(1) },
            { label: 'Waist:height', value: r.w.toFixed(2) },
            { label: 'Range low', value: fmt(disp(r.bmiRange.lowKg)), unit: wTag },
            { label: 'Range high', value: fmt(disp(r.bmiRange.highKg)), unit: wTag },
          ]} />

          <p className="foot-note">
            Note how much the four classical formulas disagree — a spread of
            {' '}{fmt(disp(r.formulaHigh - r.formulaLow))} {wTag} for the same person. That
            disagreement is the honest answer to "what should I weigh": there is no single
            correct number.
          </p>

          <Method>
            <p>
              The Devine, Robinson, Miller and Hamwi formulas were derived for
              <strong> clinical drug dosing</strong>, not for aesthetics or athletic
              performance. None accounts for muscularity, frame size or body composition,
              which is why a muscular person will read as above their "ideal" weight while
              being nothing of the sort.
            </p>
            <p>
              Waist-to-height ratio is the more useful indicator here. It needs one
              measurement, has no estimation error to speak of, and predicts cardiometabolic
              risk better than BMI. Below 0.5 is the commonly cited threshold.
            </p>
            <p className="refs">
              Devine BJ 1974 · Robinson JD et al. 1983 · Miller DR et al. 1983 ·
              Hamwi GJ 1964 · Ashwell M &amp; Gibson S, BMJ Open 2016
            </p>
          </Method>
        </Panel>
      </div>
    </div>
  );
}
