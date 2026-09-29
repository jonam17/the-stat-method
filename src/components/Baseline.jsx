import { useState, useMemo } from 'react';
import { ACTIVITY, lbToKg, kgToLb, ftInToCm, cmToFtIn, fmt } from '../engine/index.js';
import { computeBaseline } from '../engine/baseline.js';
import { AGE_MIN, AGE_MAX, RAIL_COPY } from '../engine/safety.js';
import { Seg, Num, Select, Panel, BigStat, StatStrip } from './ToolShell.jsx';

/**
 * The Stat Method Baseline — one form, every result the shared inputs can
 * produce.
 *
 * This component renders; it does not calculate. Every number comes from
 * computeBaseline(), which calls the same engine functions the standalone
 * calculators use, and every refusal and warning comes from RAIL_COPY. The only
 * arithmetic here is unit display (kg to lb), which the standalone tools also
 * do in their components.
 *
 * Sections appear as their inputs are supplied: a goal unlocks daily targets,
 * a target weight unlocks the plan, body fat unlocks lean mass.
 */
export default function Baseline() {
  const [units, setUnits] = useState('metric');
  const [sex, setSex] = useState('male');
  const [age, setAge] = useState('30');
  const [weight, setWeight] = useState('80');
  const [height, setHeight] = useState('178');
  const [feet, setFeet] = useState('5');
  const [inches, setInches] = useState('10');
  const [activity, setActivity] = useState('moderate');
  const [bodyfat, setBodyfat] = useState('');
  const [waist, setWaist] = useState('');
  const [goal, setGoal] = useState('none');
  const [target, setTarget] = useState('');
  const [lifeStage, setLifeStage] = useState('none');

  const imp = units === 'imperial';
  const kg = imp ? lbToKg(+weight || 0) : +weight || 0;
  const cm = imp ? ftInToCm(+feet || 0, +inches || 0) : +height || 0;
  const bf = bodyfat === '' ? null : Math.min(60, Math.max(3, +bodyfat));
  const waistCm = waist === '' ? null : (imp ? +waist * 2.54 : +waist);
  const targetKg = target === '' ? null : (imp ? lbToKg(+target) : +target);
  const w = k => (imp ? kgToLb(k) : k);            // display only
  const wu = imp ? 'lb' : 'kg';

  const switchUnits = to => {
    if (to === units) return;
    if (to === 'imperial') {
      setWeight(String(Math.round(kgToLb(+weight || 0))));
      const { ft, in: i } = cmToFtIn(+height || 0);
      setFeet(String(ft)); setInches(String(i));
      if (target) setTarget(String(Math.round(kgToLb(+target))));
      if (waist) setWaist(String(Math.round(+waist / 2.54)));
    } else {
      setWeight(String(Math.round(lbToKg(+weight || 0))));
      setHeight(String(Math.round(ftInToCm(+feet || 0, +inches || 0))));
      if (target) setTarget(String(Math.round(lbToKg(+target))));
      if (waist) setWaist(String(Math.round(+waist * 2.54)));
    }
    setUnits(to);
  };

  const r = useMemo(() => computeBaseline({
    sex, age, kg, cm, activity, bf, waistCm,
    goal: goal === 'none' ? null : goal,
    targetKg: goal === 'none' ? null : targetKg,
    lifeStage: sex === 'female' ? lifeStage : 'none',
  }), [sex, age, kg, cm, activity, bf, waistCm, goal, targetKg, lifeStage]);

  const ok = r.status === 'ok';
  const e = ok && r.energy, b = ok && r.body, t = ok && r.targets, p = ok && r.plan;

  return (
    <div className="calc">
      <div className="calc-grid">
        <Panel label="About you">
          <Seg label="Units" value={units} onChange={switchUnits}
               options={[['metric', 'Metric'], ['imperial', 'Imperial']]} />
          <Seg label="Sex" value={sex} onChange={setSex}
               options={[['male', 'Male'], ['female', 'Female']]} />
          <div className="row2">
            <Num label="Age" value={age} onChange={setAge} tag="yrs" min={AGE_MIN} max={AGE_MAX} />
            <Num label="Weight" value={weight} onChange={setWeight} tag={wu}
                 min={imp ? 50 : 25} max={imp ? 700 : 320} />
          </div>
          {imp ? (
            <div className="field">
              <label>Height</label>
              <div className="row2">
                <div className="unit">
                  <input type="number" inputMode="decimal" min={3} max={8} step="1" value={feet}
                         aria-label="Feet" onWheel={ev => ev.currentTarget.blur()}
                         onChange={ev => setFeet(ev.target.value)} />
                  <span className="tag">ft</span>
                </div>
                <div className="unit">
                  <input type="number" inputMode="decimal" min={0} max={11} step="1" value={inches}
                         aria-label="Inches" onWheel={ev => ev.currentTarget.blur()}
                         onChange={ev => setInches(ev.target.value)} />
                  <span className="tag">in</span>
                </div>
              </div>
            </div>
          ) : (
            <Num label="Height" value={height} onChange={setHeight} tag="cm" min={120} max={230} />
          )}
          <Select label="Activity level" value={activity} onChange={setActivity}>
            {Object.entries(ACTIVITY).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </Select>
          {sex === 'female' && (
            <Seg label="Any of these apply?" value={lifeStage} onChange={setLifeStage}
                 options={[['none', 'Neither'], ['pregnant', 'Pregnant'], ['breastfeeding', 'Breastfeeding']]} />
          )}

          <div className="baseline-optional">
            <span className="baseline-optional-label">Optional — each unlocks more</span>
            <Num label="Body fat" value={bodyfat} onChange={setBodyfat} tag="%" placeholder="—"
                 hint="Adds lean mass and FFMI, and the lean-mass BMR equations." min={1} max={70} />
            <Num label="Waist" value={waist} onChange={setWaist} tag={imp ? 'in' : 'cm'} placeholder="—"
                 hint="Adds waist-to-height ratio." min={imp ? 15 : 40} max={imp ? 80 : 200} />
            <Seg label="Goal" value={goal} onChange={setGoal}
                 options={[['none', 'None yet'], ['cut', 'Lose'], ['maintain', 'Maintain'], ['gain', 'Gain']]} />
            {goal !== 'none' && (
              <Num label="Target weight" value={target} onChange={setTarget} tag={wu} placeholder="—"
                   hint="Adds a timeline to your target." min={imp ? 50 : 25} max={imp ? 700 : 320} />
            )}
          </div>
        </Panel>

        <Panel label="The Stat Method Baseline" dark
               notice={r.status === 'refused' ? r.gate.copy : undefined}
               incomplete={r.status === 'incomplete'}
               copyExtra={ok ? [
                 ...(t ? ['', 'Hand portions', ...['protein', 'carbs', 'fat']
                   .filter(k => t.portions[k]?.whole != null)
                   .map(k => `${k[0].toUpperCase() + k.slice(1)}: ${t.portions[k].whole} ${t.portions[k].unit}${t.portions[k].whole === 1 ? '' : 's'} per day`)] : []),
               ] : []}>
          {ok && <>
            {r.advisories.map(a => <p key={a} className="cat-caveat">{a}</p>)}

            <h3 className="bl-section">Energy</h3>
            <BigStat value={fmt(e.preferred.tdee)} unit="kcal / day to maintain your weight"
                     note={`${e.preferred.name}, the equation this site prefers for your inputs.`} />
            <StatStrip items={[
              { label: 'BMR', value: fmt(e.preferred.value), unit: ' kcal' },
              { label: 'BMR range', value: `${fmt(e.min)}–${fmt(e.max)}`, unit: ' kcal' },
              { label: 'Equations', value: e.formulas.length },
            ]} />
            <a className="bl-link" href="/tools/tdee-calculator/">See all equations in the TDEE & BMR Calculator →</a>

            <h3 className="bl-section">Body</h3>
            {/* At most four figures per row: six in one row truncated "Overweight". */}
            <StatStrip items={[
              { label: 'BMI', value: b.b.toFixed(1) },
              { label: 'Category', value: b.category },
              { label: 'Healthy range', value: `${fmt(w(b.bmiRange.lowKg))}–${fmt(w(b.bmiRange.highKg))}`, unit: ` ${wu}` },
            ]} />
            {(b.w != null || r.lean) && (
              <StatStrip items={[
                ...(b.w != null ? [{ label: 'Waist-to-height', value: b.w.toFixed(2) }] : []),
                ...(r.lean ? [
                  { label: 'Lean mass', value: fmt(w(r.lean.lbm)), unit: ` ${wu}` },
                  { label: 'FFMI', value: r.lean.ffmi.toFixed(1) },
                ] : []),
              ]} />
            )}
            {b.caveats.map(k => <p key={k} className="cat-caveat">{RAIL_COPY[k]}</p>)}
            <a className="bl-link" href="/tools/healthy-weight/">Full breakdown in the Healthy Weight Calculator →</a>

            {t ? <>
              <h3 className="bl-section">Daily targets</h3>
              <StatStrip items={[
                { label: 'Calories', value: fmt(t.macro.cals), unit: ' kcal' },
                { label: 'Protein', value: t.macro.grams.p, unit: ' g' },
                { label: 'Carbohydrate', value: t.macro.grams.c, unit: ' g' },
                { label: 'Fat', value: t.macro.grams.f, unit: ' g' },
              ]} />
              <StatStrip items={[
                { label: 'Protein range for your goal', value: `${t.protein.lowG}–${t.protein.highG}`, unit: ' g / day' },
              ]} />
              {t.macro.target.belowFloor && (
                <div className="warnbar">{t.macro.target.maintenanceBelowFloor
                  ? RAIL_COPY.maintenanceBelowFloor(t.macro.target.floor)
                  : RAIL_COPY.belowFloor(t.macro.target.floor)}</div>
              )}
              {t.macro.ea?.low && <div className="warnbar">{RAIL_COPY.lowEA(t.macro.ea.ea)}</div>}
              <a className="bl-link" href="/tools/macro-calculator/">Adjust the split in the Macro Calculator →</a>
            </> : (
              <p className="bl-unlock">Choose a goal to see calorie and protein targets.</p>
            )}

            {p ? <>
              <h3 className="bl-section">Plan</h3>
              {p.status !== 'ok'
                ? <p className="bl-unlock">{p.copy}</p>
                : <StatStrip items={[
                    { label: 'Time to target', value: Math.round(p.reachedDay / 7), unit: ' weeks' },
                    { label: 'Weekly change', value: p.rate.pct.toFixed(2), unit: '%' },
                    ...(p.maintenanceAtGoal ? [{ label: 'Maintain at goal', value: fmt(p.maintenanceAtGoal), unit: ' kcal' }] : []),
                  ]} />}
              {p.status === 'ok' && p.rate.tooFast && <div className="warnbar">{RAIL_COPY.tooFast(p.rate.pct)}</div>}
              <a className="bl-link" href="/tools/deficit-planner/">Model it week by week in the Deficit Planner →</a>
            </> : t && (
              <p className="bl-unlock">Add a target weight to see how long it would take.</p>
            )}
          </>}
        </Panel>
      </div>
    </div>
  );
}
