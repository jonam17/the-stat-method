import { useState, useMemo } from 'react';
import {
  allBmrFormulas, ACTIVITY, lbmFromBodyFat, bmi,
  lbToKg, kgToLb, ftInToCm, cmToFtIn, fmt,
} from '../engine/index.js';
import { Seg, Num, Select, Panel, BigStat, StatStrip, Method } from './ToolShell.jsx';
import { ageInScope, AGE_MIN, AGE_MAX, RAIL_COPY } from '../engine/safety.js';

/**
 * The differentiator: every applicable BMR equation runs at once and the
 * disagreement between them is shown rather than hidden.
 */
export default function TdeeCalculator() {
  const [units, setUnits] = useState('metric');
  const [sex, setSex] = useState('male');
  const [age, setAge] = useState('30');
  const [weight, setWeight] = useState('80');
  const [height, setHeight] = useState('178');
  const [feet, setFeet] = useState('5');
  const [inches, setInches] = useState('10');
  const [activity, setActivity] = useState('moderate');
  const [bodyfat, setBodyfat] = useState('');

  const kg = units === 'imperial' ? lbToKg(+weight || 0) : +weight || 0;
  const cm = units === 'imperial' ? ftInToCm(+feet || 0, +inches || 0) : +height || 0;
  const bf = bodyfat === '' ? null : Math.min(60, Math.max(3, +bodyfat));

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
    const input = { kg, cm, age: +age || 0, sex, lbm };
    const factor = ACTIVITY[activity].factor;
    const formulas = allBmrFormulas(input)
      .filter(f => f.value != null)
      .map(f => ({ ...f, tdee: f.value * factor }));
    const values = formulas.map(f => f.value);
    const mean = values.reduce((a, b) => a + b, 0) / (values.length || 1);
    // Recommended = lean-mass based when body fat is known, else Mifflin
    const preferredKey = lbm != null ? 'katch' : 'mifflin';
    const preferred = formulas.find(f => f.key === preferredKey) || formulas[0];
    return {
      formulas, mean, meanTdee: mean * factor, preferred, lbm, factor,
      min: Math.min(...values), max: Math.max(...values),
      spread: Math.max(...values) - Math.min(...values),
      bmi: bmi(kg, cm),
    };
  }, [kg, cm, age, sex, activity, bf]);

  const spreadPct = r.mean ? (r.spread / r.mean) * 100 : 0;

  return (
    <div className="calc">
      <div className="calc-grid">
        <Panel label="Your details">
          <Seg label="Units" value={units} onChange={switchUnits}
               options={[['metric', 'Metric'], ['imperial', 'Imperial']]} />
          <Seg label="Sex" value={sex} onChange={setSex}
               options={[['male', 'Male'], ['female', 'Female']]} />
          <div className="row2">
            <Num label="Age" value={age} onChange={setAge} tag="yrs"
                 min={AGE_MIN} max={AGE_MAX} />
            <Num label="Weight" value={weight} onChange={setWeight}
                 tag={units === 'imperial' ? 'lb' : 'kg'}
                 min={units === 'imperial' ? 50 : 25} max={units === 'imperial' ? 700 : 320} />
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
          <Select label="Activity level" value={activity} onChange={setActivity}>
            {Object.entries(ACTIVITY).map(([k, v]) => (
              <option key={k} value={k}>{v.label}</option>
            ))}
          </Select>
          <Num label="Body fat (optional)" value={bodyfat} onChange={setBodyfat}
               tag="%" placeholder="—"
               hint="Unlocks the two lean-mass equations, which are more accurate when you know it."
                 min={1} max={70} />
        </Panel>

        <Panel label="Maintenance calories" dark
               incomplete={!(kg > 0 && cm > 0)}
               incompleteNote="Enter your weight and height to see your maintenance calories."
               notice={(() => {
                 const scope = ageInScope(age);
                 if (scope.reason === 'young') return RAIL_COPY.underAge;
                 if (scope.reason === 'high') return RAIL_COPY.overAge;
                 return null;
               })()}>
          <BigStat value={fmt(r.preferred?.tdee || 0)} unit="kcal / day"
                   note={<>Using <b>{r.preferred?.name}</b> — {r.lbm != null
                     ? 'lean-mass based, preferred when body fat is known'
                     : 'best validated when body fat is unknown'}.</>} />

          <div className="bartop tight">
            <span className="t">Every formula, side by side</span>
            <span className="total-badge">
              <span className="kk">Spread</span>
              <b className={spreadPct > 12 ? 'warn' : ''}>{fmt(r.spread)} kcal</b>
            </span>
          </div>

          <div className="fx-list">
            {r.formulas.map(f => {
              const rel = r.max > r.min ? ((f.value - r.min) / (r.max - r.min)) * 100 : 50;
              const isPref = f.key === r.preferred?.key;
              return (
                <div className={`fx ${isPref ? 'on' : ''}`} key={f.key}>
                  <div className="fx-top">
                    <span className="fx-name">
                      {f.name}{isPref && <em className="fx-tag">Recommended</em>}
                    </span>
                    <span className="fx-val">{fmt(f.tdee)}<small>kcal</small></span>
                  </div>
                  <div className="fx-track"><i style={{ width: `${20 + rel * 0.8}%` }} /></div>
                  <div className="fx-sub">BMR {fmt(f.value)} kcal × {r.factor}</div>
                </div>
              );
            })}
          </div>

          <StatStrip items={[
            { label: 'Average', value: fmt(r.meanTdee), unit: 'kcal' },
            { label: 'Lowest', value: fmt(r.min * r.factor), unit: 'kcal' },
            { label: 'Highest', value: fmt(r.max * r.factor), unit: 'kcal' },
            { label: 'BMI', value: r.bmi.toFixed(1) },
          ]} />

          <Method>
            <p>
              Every equation here was fitted to a population sample, which is why they
              disagree — the {fmt(r.spread)} kcal spread above is the honest uncertainty
              in any prediction, not a defect.
              {r.lbm != null
                ? ' Because you supplied body fat, the lean-mass equations (Katch-McArdle, Cunningham) are shown and generally track better.'
                : ' Supplying a body-fat estimate unlocks two further equations that are usually more accurate.'}
            </p>
            <p className="refs">
              Mifflin MD et al., Am J Clin Nutr 1990 · Roza &amp; Shizgal 1984 ·
              Katch &amp; McArdle · Cunningham JJ 1980 · Owen OE et al. 1986–87
            </p>
          </Method>
        </Panel>
      </div>
    </div>
  );
}
