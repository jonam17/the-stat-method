import { useState, useMemo } from 'react';
import {
  lbmFromBodyFat, ffmi, ffmiBand, bmi, bodyFatCategory,
  lbToKg, kgToLb, ftInToCm, cmToFtIn, fmt,
} from '../engine/index.js';
import { ffmiNormalised } from '../engine/body.js';
import { Seg, Num, Panel, BigStat, StatStrip, Method } from './ToolShell.jsx';
import { RAIL_COPY } from '../engine/safety.js';

/** Fat-free mass index — lean mass normalised for height. */
export default function FfmiCalculator() {
  const [units, setUnits] = useState('metric');
  const [sex, setSex] = useState('male');
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

  const r = useMemo(() => {
    const lbm = lbmFromBodyFat(kg, bf);
    const v = ffmi(lbm, cm);
    // Normalised FFMI adjusts to a 1.8 m reference height (Kouri et al.)
    const norm = ffmiNormalised(v, cm);   // single source of truth (engine)
    return { lbm, fatMass: kg - lbm, ffmi: v, norm, bmi: bmi(kg, cm) };
  }, [kg, cm, bf]);

  const scale = Math.max(0, Math.min(100, ((r.ffmi ?? 0) - 15) / 13 * 100));

  return (
    <div className="calc">
      <div className="calc-grid">
        <Panel label="Your details">
          <Seg label="Units" value={units} onChange={switchUnits}
               options={[['metric', 'Metric'], ['imperial', 'Imperial']]} />
          <Seg label="Sex" value={sex} onChange={setSex}
               options={[['male', 'Male'], ['female', 'Female']]} />
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
               incomplete={!(kg > 0 && cm > 0)}
               incompleteNote="Enter your weight, height and body fat to see your FFMI.">
          <BigStat value={r.ffmi ? r.ffmi.toFixed(1) : '—'} unit="FFMI"
                   note={<>{r.norm ? ffmiBand(r.norm) : '—'} · normalised to 1.8 m:{' '}
                     <b>{r.norm ? r.norm.toFixed(1) : '—'}</b></>} />

          <div className="ffmi-scale">
            <div className="fs-track">
              <span className="fs-seg s1" /><span className="fs-seg s2" />
              <span className="fs-seg s3" /><span className="fs-seg s4" />
              <span className="fs-marker" style={{ left: `${scale}%` }} />
            </div>
            <div className="fs-labels">
              <span>15</span><span>19</span><span>22</span><span>25</span><span>28</span>
            </div>
          </div>

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

          <p className="cat-caveat">{RAIL_COPY.categoryCaveat}</p>

          <Method>
            <p>
              FFMI is lean mass divided by height squared — BMI with the fat removed. The
              normalised figure adjusts to a 1.8 m reference so people of different heights
              can be compared. Values around 25 are often cited as an approximate natural
              ceiling for men, but this comes from a small sample and should be read as a
              rough guide rather than a hard limit.
            </p>
            <p className="refs">
              Kouri EM, Pope HG, Katz DL, Oliva P, Clin J Sport Med 1995
            </p>
          </Method>
        </Panel>
      </div>
    </div>
  );
}
